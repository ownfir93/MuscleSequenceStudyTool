#!/usr/bin/env python3
"""Browser regression tests for the no-build BI231 / special-senses study app.

Run from the repository root against an existing server:
    python3 tools/test_study_app.py --base-url http://127.0.0.1:8765
Or let this script serve the checkout on a free local port:
    python3 tools/test_study_app.py --serve

Requires Python Playwright and Chromium. Use --chromium /path/to/chromium
(or CHROMIUM_PATH) when Playwright's bundled browser is not installed.
The suite creates isolated browser contexts and never touches real saved progress.
Use --with-viz for the optional CDN/WebGL-dependent original 3D/AP/reflex check.
Screenshots and a JSON result summary can be saved with --artifacts /tmp/study-qa.
"""
from __future__ import annotations

import argparse
import functools
import http.server
import json
import os
from pathlib import Path
import re
import shutil
import threading
import unittest

from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
ORIGINAL_TOPICS = ("nervous", "muscle", "spinal")
SENSE_TOPICS = ("vision", "chemical", "hearing", "general")
ALL_TOPICS = ORIGINAL_TOPICS + SENSE_TOPICS
ALL_SECTIONS = ("overview",) + ALL_TOPICS + ("axial", "limb", "viz", "quiz")
CONFIG = None


def plain(text: str) -> str:
    return re.sub(r"\[\[(.*?)\]\]", r"\1", text)


class StudyAppTest(unittest.TestCase):
    """Interaction-focused tests; all repeated IDs are deliberately panel-scoped."""

    @classmethod
    def setUpClass(cls):
        cls.pw = sync_playwright().start()
        opts = {"headless": not CONFIG.headed, "args": ["--no-sandbox"]}
        if CONFIG.chromium:
            opts["executable_path"] = CONFIG.chromium
        cls.browser = cls.pw.chromium.launch(**opts)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()

    def setUp(self):
        self.context = self.browser.new_context(viewport={"width": 1280, "height": 900})
        self.page = self.context.new_page()
        self.page.set_default_timeout(6000)
        self.errors = []
        self.page.on("pageerror", lambda error: self.errors.append(str(error)))
        self.page.goto(CONFIG.base_url, wait_until="domcontentloaded")
        expect(self.page.locator(".sectab").first).to_be_visible()
        self.data = self.page.evaluate("window.DATA")

    def tearDown(self):
        try:
            if CONFIG.artifacts:
                directory = Path(CONFIG.artifacts)
                directory.mkdir(parents=True, exist_ok=True)
                self.page.screenshot(path=str(directory / f"{self._testMethodName}.png"), full_page=True)
            self.assertEqual(self.errors, [], "Uncaught JavaScript errors")
        finally:
            self.context.close()

    def section(self, sid):
        tab = self.page.locator(f'.sectab[data-sec="{sid}"]')
        expect(tab).to_have_count(1)
        tab.click()
        panel = self.page.locator(f"#sec-{sid}")
        expect(panel).to_be_visible()
        expect(self.page.locator(".secpanel.active")).to_have_count(1)
        return panel

    def mode(self, sid, mode):
        panel = self.section(sid)
        panel.locator(f'.modetab[data-mode="{mode}"]').click()
        mp = panel.locator(f'.modepanel[data-mode="{mode}"]')
        expect(mp).to_be_visible()
        expect(panel.locator(".modepanel.active")).to_have_count(1)
        if mode == "lab":
            expect(mp.locator(".study-select")).to_be_visible()
        return mp

    def question_answer(self, sid, prompt):
        data = self.data[sid]
        for card in data.get("cards", []):
            if card["front"] == prompt:
                return card["back"]
        for question in data.get("quizzes", []):
            if question["q"] == prompt:
                return question["a"]
        self.fail(f"No answer in DATA[{sid!r}] for {prompt!r}")

    def correct_quiz_choice(self, sid, mp):
        question = mp.locator(".quiz-prompt").inner_text().strip()
        answer = self.question_answer(sid, question)
        return mp.locator(".quiz-choices").get_by_role("button", name=answer, exact=True).first

    def sequence_mode(self, sid, seq):
        if sid in SENSE_TOPICS:
            mp = self.mode(sid, "pathways")
            mp.get_by_label("Choose a pathway").select_option(seq["id"])
            return mp
        return self.mode(sid, f"seq:{seq['id']}:order")

    def assert_no_horizontal_overflow(self, label):
        # Scrollable nav and deliberately scrollable comparison wrappers are OK;
        # clipped content, oversized cards, and document-level overflow are not.
        result = self.page.evaluate("""() => {
          const width = document.documentElement.clientWidth;
          const overflow = [];
          for (const node of document.querySelectorAll('.secpanel.active *')) {
            const r = node.getBoundingClientRect();
            if (!r.width || !r.height || (r.right <= width + 1 && r.left >= -1)) continue;
            if (node.closest('svg')) continue;
            let clippedByScrollContainer = false;
            for (let p = node.parentElement; p && p !== document.body; p = p.parentElement) {
              const style = getComputedStyle(p);
              if (/(auto|scroll)/.test(style.overflowX) && p.getBoundingClientRect().right <= width + 1) {
                clippedByScrollContainer = true; break;
              }
            }
            if (!clippedByScrollContainer) overflow.push({tag: node.tagName, cls: String(node.className),
              text: (node.textContent || '').slice(0, 70), left: r.left, right: r.right});
          }
          return {width, documentWidth: document.documentElement.scrollWidth, overflow: overflow.slice(0, 8)};
        }""")
        self.assertLessEqual(result["documentWidth"], result["width"] + 1, f"{label}: {result}")
        self.assertEqual(result["overflow"], [], f"{label}: clipped/out-of-bounds content: {result}")

    def test_01_original_and_senses_sections_render(self):
        for sid in ALL_SECTIONS:
            with self.subTest(section=sid):
                expect(self.page.locator(f'.sectab[data-sec="{sid}"]')).to_have_count(1)
                expect(self.page.locator(f"#sec-{sid}")).to_have_count(1)
        for sid in ALL_TOPICS:
            with self.subTest(section=sid):
                self.assertIn(sid, self.data)
                mp = self.mode(sid, "learn")
                expect(mp.locator(".card")).to_have_count(len(self.data[sid]["learn"]))
                self.assertGreater(len(self.data[sid]["learn"]), 0)
                self.assertNotIn("[[", mp.inner_text())
                for mode in ("cards", "quiz", "fill"):
                    panel = self.mode(sid, mode)
                    self.assertTrue(panel.inner_text().strip())

    def test_02_flashcards_keyboard_navigation_and_known_persist(self):
        for sid in ALL_TOPICS:
            with self.subTest(section=sid):
                mp = self.mode(sid, "cards")
                flash = mp.locator(".flash")
                self.assertGreaterEqual(flash.evaluate("n => n.tabIndex"), 0, "Flashcard must be focusable")
                flash.focus()
                self.page.keyboard.press("Enter")
                expect(mp.locator("#fc_face")).to_have_text("Answer")
                self.page.keyboard.press("Space")
                expect(mp.locator("#fc_face")).to_have_text("Question")
                mp.locator("#fc_known_btn").click()
                expect(mp.locator("#fc_known")).to_have_text("Known: 1")
                mp.locator("#fc_next").click()
                expect(mp.locator("#fc_count")).to_have_text(f"2 / {len(self.data[sid]['cards'])}")
                mp.locator("#fc_prev").click()
                expect(mp.locator("#fc_known_btn")).to_have_text("✓ Known")
                mp.locator("#fc_shuffle").click()
                expect(mp.locator("#fc_count")).to_have_text(f"1 / {len(self.data[sid]['cards'])}")
        self.page.reload()
        expect(self.page.locator("#sec-general")).to_be_visible()
        for sid in ALL_TOPICS:
            mp = self.mode(sid, "cards")
            expect(mp.locator("#fc_known")).to_have_text("Known: 1")

    def test_03_fill_blanks_keyboard_wrong_right_reveal_reset(self):
        for sid in ALL_TOPICS:
            with self.subTest(section=sid):
                mp = self.mode(sid, "fill")
                blank = mp.locator(".blank").first
                answer = blank.get_attribute("data-answer")
                self.assertGreaterEqual(blank.evaluate("n => n.tabIndex"), 0, "Blank must be focusable")
                blank.focus()
                self.page.keyboard.press("Enter")
                expect(mp.locator(".opts")).to_be_visible()
                wrong = mp.locator(".opt").filter(has_not_text=re.compile(f"^{re.escape(answer)}$"))
                if wrong.count():
                    wrong.first.click()
                    expect(mp.locator("#fl_score")).to_have_text("Correct: 0")
                    self.page.wait_for_timeout(750)
                    blank.click()
                mp.locator(".opts").get_by_role("button", name=answer, exact=True).click()
                expect(blank).to_have_class(re.compile(r"\bcorrect\b"))
                expect(mp.locator("#fl_score")).to_have_text("Correct: 1")
                blank.click()
                expect(mp.locator("#fl_score")).to_have_text("Correct: 1")
                mp.locator("#fl_reveal").click()
                self.assertGreater(mp.locator(".blank.revealed").count(), 0)
                expect(mp.locator("#fl_score")).to_have_text("Correct: 1")
                mp.locator("#fl_reset").click()
                expect(mp.locator("#fl_score")).to_have_text("Correct: 0")
                expect(mp.locator(".blank.correct, .blank.revealed, .opts")).to_have_count(0)

    def test_04_every_sequence_places_into_its_own_panel(self):
        for sid in ALL_TOPICS:
            for seq in self.data[sid].get("sequences", []):
                with self.subTest(section=sid, sequence=seq["id"]):
                    mp = self.sequence_mode(sid, seq)
                    mp.locator("#or_reset").click()
                    n = len(seq["steps"])
                    other_filled_before = self.page.locator(".slot.filled").count()
                    if n > 1:
                        mp.locator(f'.choice[data-i="{n - 1}"]').click()
                        expect(mp.locator("#or_s")).to_have_text(f"Placed: 0 / {n}")
                    for i, step in enumerate(seq["steps"]):
                        choice = mp.locator(f'.choice[data-i="{i}"]')
                        choice.click(click_count=2)
                        expect(mp.locator(".slot.filled")).to_have_count(i + 1)
                        expect(mp.locator(".slot").nth(i).locator(".stext")).to_have_text(plain(step))
                        self.assertEqual(self.page.locator(".slot.filled").count(), other_filled_before + i + 1)
                    self.page.wait_for_timeout(180)
                    expect(mp.locator("#or_s")).to_contain_text(f"{n} / {n}")
                    # Repeated activation of a completed choice must not throw or advance.
                    mp.locator('.choice[data-i="0"]').evaluate("b => { b.click(); b.click(); }")
                    expect(mp.locator(".slot.filled")).to_have_count(n)
                    mp.locator("#or_reset").click()
                    self.page.wait_for_timeout(180)
                    expect(mp.locator("#or_s")).to_have_text(f"Placed: 0 / {n}")
                    expect(mp.locator(".slot.filled")).to_have_count(0)
                    expect(mp.locator("#or_best")).to_have_text(f"Best streak: {n}")

    def test_05_sequence_completion_restart_cancels_old_status(self):
        sid = "vision"
        seq = self.data[sid]["sequences"][0]
        mp = self.sequence_mode(sid, seq)
        for i in range(len(seq["steps"])):
            mp.locator(f'.choice[data-i="{i}"]').click()
        mp.locator("#or_reset").click()
        self.page.wait_for_timeout(250)
        expect(mp.locator("#or_s")).to_have_text(f"Placed: 0 / {len(seq['steps'])}")
        expect(mp.locator(".slot.filled")).to_have_count(0)

    def test_06_quiz_feedback_stays_until_next_and_restart_is_stable(self):
        for sid in ALL_TOPICS:
            with self.subTest(section=sid):
                mp = self.mode(sid, "quiz")
                first_question = mp.locator(".quiz-prompt").inner_text()
                self.correct_quiz_choice(sid, mp).click(click_count=2)
                expect(mp.locator(".quiz-score")).to_contain_text("1 / 1 correct")
                self.page.wait_for_timeout(900)
                expect(mp.locator(".quiz-prompt")).to_have_text(first_question)
                expect(mp.locator(".quiz-count")).to_have_text(re.compile(r"^1 /"))
                feedback = mp.locator(".quiz-feedback")
                expect(feedback).to_be_visible()
                self.assertTrue(feedback.inner_text().strip())
                self.assertEqual(mp.locator(".quiz-choices button:enabled").count(), 0)
                mp.locator(".quiz-next").click()
                expect(mp.locator(".quiz-count")).to_have_text(re.compile(r"^2 /"))
                self.correct_quiz_choice(sid, mp).click()
                mp.get_by_role("button", name="↺ Restart", exact=True).click()
                self.page.wait_for_timeout(900)
                expect(mp.locator(".quiz-count")).to_have_text(re.compile(r"^1 /"))
                expect(mp.locator(".quiz-score")).to_have_text("0 / 0 correct")
                expect(mp.locator(".quiz-choices .correct, .quiz-choices .wrong")).to_have_count(0)

    def test_07_original_muscle_list_flashcards_oia_regression(self):
        for sid in ("axial", "limb"):
            with self.subTest(section=sid):
                mp = self.mode(sid, "list")
                expect(mp.locator(".muscle")).to_have_count(len(self.data[sid]["muscles"]))
                groups = mp.locator(".fchip")
                if groups.count() > 1:
                    groups.nth(1).click()
                    self.assertGreater(mp.locator(".muscle").count(), 0)
                    self.assertLess(mp.locator(".muscle").count(), len(self.data[sid]["muscles"]))
                    mp.get_by_role("button", name="All groups", exact=True).click()
                    expect(mp.locator(".muscle")).to_have_count(len(self.data[sid]["muscles"]))
                mp = self.mode(sid, "flash")
                mp.locator(".flash").click()
                expect(mp.locator("#mf_face")).to_have_text("O / I / A")
                mp.locator("#mf_next").click()
                expect(mp.locator("#mf_face")).to_have_text("Name")
                mp.locator("#mf_o").click()
                expect(mp.locator("#mf_face")).to_have_text("Find the muscle")
                mp.locator("#mf_known_btn").click()
                expect(mp.locator("#mf_known")).to_have_text("Known: 1")
                mp = self.mode(sid, "oia")
                name = mp.locator("#oa_name").inner_text()
                answer = next(m["action"] for m in self.data[sid]["muscles"] if m["name"] == name)
                mp.locator("#oa_opts").get_by_role("button", name=answer, exact=True).first.click()
                expect(mp.locator("#oa_streak")).to_contain_text("Streak: 1")
                mp.locator("#oa_reset").click()
                self.page.wait_for_timeout(900)
                expect(mp.locator("#oa_n")).to_have_text(re.compile(r"^1 /"))
                expect(mp.locator("#oa_streak")).to_contain_text("Streak: 0")

    def test_08_contraction_visualizer_repeat_and_restart_regression(self):
        mp = self.mode("muscle", "seq:contraction:viz")
        seq = next(s for s in self.data["muscle"]["sequences"] if s["id"] == "contraction")
        expect(mp.locator("#vz_status")).to_have_text(f"Step 1 of {len(seq['steps'])}")
        mp.locator("#vz_replay").click(click_count=2)
        answer = plain(seq["steps"][1])
        mp.locator("#vz_choices").get_by_role("button", name=answer, exact=True).click(click_count=2)
        mp.locator("#vz_restart").click()
        self.page.wait_for_timeout(900)
        expect(mp.locator("#vz_status")).to_have_text(f"Step 1 of {len(seq['steps'])}")
        expect(mp.locator("#vz_score")).to_have_text("Streak: 0")

    def test_09_senses_visual_and_comparison_modes(self):
        activities_tested = 0
        for sid in SENSE_TOPICS:
            mp = self.mode(sid, "lab")
            values = mp.locator(".study-select option").evaluate_all("nodes => nodes.map(n => n.value)")
            self.assertEqual(len(values), 2)
            for value in values:
                with self.subTest(section=sid, activity=value):
                    mp.locator(".study-select").select_option(value)
                    expect(mp.locator(".lab-diagram svg")).to_have_count(1)
                    expect(mp.locator(".lab-diagram svg title")).to_have_count(1)
                    mp.locator(".diagram-zoom").dblclick()
                    expect(mp.locator(".diagram-zoom")).to_have_attribute("aria-pressed", "true")
                    expect(mp.locator(".lab-diagram")).to_have_attribute("tabindex", "0")
                    self.assert_no_horizontal_overflow(f"enlarged {sid}/{value}")
                    mp.locator(".diagram-zoom").click()
                    expect(mp.locator(".diagram-zoom")).to_have_attribute("aria-pressed", "false")
                    self.assertEqual(mp.locator(".lab-diagram").evaluate("n => n.scrollLeft"), 0)
                    mp.get_by_text("Text description of the diagram", exact=True).click()
                    self.assertTrue(mp.locator("details p").inner_text().strip())
                    mp.locator(".quiz-choices button").first.click(click_count=2)
                    expect(mp.locator(".quiz-feedback")).to_be_visible()
                    expect(mp.locator(".quiz-score")).to_have_text(re.compile(r"^[01] / 1 correct"))
                    mp.locator(".quiz-next").dblclick()
                    expect(mp.locator(".quiz-count")).to_have_text(re.compile(r"^2 /"))
                    mp.get_by_role("button", name="↺ Restart", exact=True).dblclick()
                    expect(mp.locator(".quiz-count")).to_have_text(re.compile(r"^1 /"))
                    activities_tested += 1
        self.assertEqual(activities_tested, 8)

    def test_10_mobile_layout_every_mode_and_keyboard_section_tabs(self):
        for width in (320, 390, 768):
            self.page.set_viewport_size({"width": width, "height": 844})
            for sid in ALL_TOPICS + ("axial", "limb", "quiz"):
                with self.subTest(width=width, section=sid):
                    panel = self.section(sid)
                    modes = panel.locator(".modetab").evaluate_all("nodes => nodes.map(n => n.dataset.mode)")
                    for mode in modes or [None]:
                        if mode:
                            self.mode(sid, mode)
                        self.page.wait_for_timeout(50)
                        self.assert_no_horizontal_overflow(f"{width}px {sid}/{mode}")
            # Keyboard section navigation should also scroll the horizontally clipped tab into view.
            tab = self.page.locator('.sectab[data-sec="vision"]')
            tab.focus()
            self.page.keyboard.press("Enter")
            expect(self.page.locator("#sec-vision")).to_be_visible()

    def test_11_reset_progress_requires_confirmation_and_clears_state(self):
        mp = self.mode("vision", "cards")
        mp.locator("#fc_known_btn").click()
        self.page.once("dialog", lambda dialog: dialog.dismiss())
        self.page.locator("#resetAll").click()
        expect(mp.locator("#fc_known")).to_have_text("Known: 1")
        self.page.once("dialog", lambda dialog: dialog.accept())
        self.page.locator("#resetAll").click()
        expect(self.page.locator("#sec-overview")).to_be_visible()
        mp = self.mode("vision", "cards")
        expect(mp.locator("#fc_known")).to_have_text("Known: 0")

    def test_12_missed_answers_persist_and_finite_round_completes(self):
        mp = self.mode("vision", "quiz")
        question = mp.locator(".quiz-prompt").inner_text()
        answer = self.question_answer("vision", question)
        question_key = mp.locator(".quiz-card").get_attribute("data-question-key")
        wrong = mp.locator(".quiz-choices button").filter(has_not_text=re.compile(f"^{re.escape(answer)}$"))
        wrong.first.click(click_count=2)
        expect(mp.locator(".quiz-score")).to_contain_text("0 / 1 correct")
        expect(mp.locator(".quiz-feedback")).to_contain_text(answer)
        self.page.reload()
        mp = self.mode("vision", "quiz")
        mp.get_by_role("button", name="Review missed (1)", exact=True).click()
        expect(mp.locator(".quiz-count")).to_have_text("1 / 1")
        expect(mp.locator(".quiz-card")).to_have_attribute("data-question-key", question_key)
        self.correct_quiz_choice("vision", mp).click()
        mp.locator(".quiz-next").click()
        expect(mp.locator(".quiz-prompt")).to_have_text("Round complete")
        expect(mp.locator(".quiz-next")).to_be_hidden()
        expect(mp.locator(".quiz-feedback")).to_contain_text("1 of 1 correctly")
        mp.get_by_role("button", name="All questions", exact=True).click()
        expect(mp.get_by_role("button", name="Review missed (0)", exact=True)).to_be_visible()
        mp.get_by_role("button", name="Review missed (0)", exact=True).click()
        expect(mp.locator(".quiz-prompt")).to_have_text("No missed questions to review")

    def test_13_malformed_storage_recovers_and_legacy_progress_survives(self):
        for raw in ("not json", "null", "[]", "42", '{"known":null,"bestStreak":[],"answers":false,"modes":7,"section":"removed"}'):
            with self.subTest(stored=raw):
                self.page.evaluate("raw => localStorage.setItem('bi231_v3', raw)", raw)
                self.page.reload()
                expect(self.page.locator("#sec-overview")).to_be_visible()
                expect(self.page.locator('.sectab[data-sec="vision"]')).to_have_count(1)
        legacy = {"known": {"nervous:card:0": True, "limb:musc:0": True}, "bestStreak": {"nervous": 7}, "section": "nervous"}
        self.page.evaluate("data => localStorage.setItem('bi231_v3', JSON.stringify(data))", legacy)
        self.page.reload()
        mp = self.mode("nervous", "cards")
        expect(mp.locator("#fc_known")).to_have_text("Known: 1")
        mp = self.mode("limb", "flash")
        expect(mp.locator("#mf_known")).to_have_text("Known: 1")
        self.assertEqual(self.page.evaluate("window.__STORE.bestStreak.nervous"), 7)
        self.mode("vision", "lab")
        self.page.reload()
        expect(self.page.locator('#sec-vision .modepanel[data-mode="lab"]')).to_be_visible()

    def test_14_mixed_quiz_contains_all_four_senses_topics(self):
        panel = self.section("quiz")
        seen = set()
        total = int(panel.locator(".quiz-count").inner_text().split(" / ")[1])
        for _ in range(total):
            key = panel.locator(".quiz-card").get_attribute("data-question-key")
            # The question topic is rendered for the user; its source is also
            # encoded in the question key by the hub's data adapter.
            seen.add(key)
            panel.locator(".quiz-next").click()
        expect(panel.locator(".quiz-prompt")).to_have_text("Round complete")
        for sid in SENSE_TOPICS:
            self.assertTrue(any(sid in key for key in seen), f"Quiz Hub lacks {sid} questions")
        panel.get_by_label("Question set").select_option("legacy")
        legacy_total = int(panel.locator(".quiz-count").inner_text().split(" / ")[1])
        self.assertGreater(legacy_total, 0)
        panel.get_by_label("Question set").select_option("all")
        self.assertEqual(int(panel.locator(".quiz-count").inner_text().split(" / ")[1]), total + legacy_total)

    def test_15_original_visualizer_external_dependencies(self):
        if not CONFIG.with_viz:
            self.skipTest("Use --with-viz to test external Three.js CDN and WebGL")
        panel = self.section("viz")
        expect(panel.locator("#viewer3d")).to_be_visible(timeout=30000)
        for mode, host in (("ap", "#viz_ap_host"), ("reflex", "#viz_reflex_host")):
            mp = self.mode("viz", mode)
            expect(mp.locator(host)).not_to_be_empty()
            self.assertGreater(mp.locator("svg").count(), 0)


def main():
    global CONFIG
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--base-url", default="http://127.0.0.1:8765/")
    parser.add_argument("--serve", action="store_true", help="Serve the repo on an ephemeral local port")
    parser.add_argument("--chromium", default=os.environ.get("CHROMIUM_PATH") or shutil.which("chromium"))
    parser.add_argument("--headed", action="store_true")
    parser.add_argument("--with-viz", action="store_true")
    parser.add_argument("--artifacts", help="Directory for screenshots and JSON summary")
    parser.add_argument("tests", nargs="*", help="Optional unittest method names, e.g. test_04_every_sequence_places_into_its_own_panel")
    CONFIG = parser.parse_args()
    server = None
    if CONFIG.serve:
        handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
        server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        CONFIG.base_url = f"http://127.0.0.1:{server.server_port}/"
    try:
        suite = unittest.TestSuite(StudyAppTest(name) for name in CONFIG.tests) if CONFIG.tests else unittest.defaultTestLoader.loadTestsFromTestCase(StudyAppTest)
        result = unittest.TextTestRunner(verbosity=2).run(suite)
        if CONFIG.artifacts:
            path = Path(CONFIG.artifacts)
            path.mkdir(parents=True, exist_ok=True)
            (path / "results.json").write_text(json.dumps({
                "url": CONFIG.base_url, "tests_run": result.testsRun,
                "successful": result.wasSuccessful(), "skipped": [(str(t), reason) for t, reason in result.skipped],
                "failures": [(str(t), error) for t, error in result.failures],
                "errors": [(str(t), error) for t, error in result.errors],
            }, indent=2))
        return 0 if result.wasSuccessful() else 1
    finally:
        if server:
            server.shutdown()


if __name__ == "__main__":
    raise SystemExit(main())
