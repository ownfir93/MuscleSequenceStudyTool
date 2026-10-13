# Anatomy & Physiology — Study Studio

A single-page (no build, no backend) study tool for BI231 Anatomy & Physiology I and BIOL232 senses, deployed on the existing GitHub Pages site.

**Live page:** https://ownfir93.github.io/MuscleSequenceStudyTool/

## BIOL232 senses

Four integrated sections are based on the supplied course PDFs: **General Senses**, **Vision**, **Gustation & Olfaction**, and **Hearing & Equilibrium**.

The expansion includes **85 lessons, 133 flashcards, 89 topic quiz questions, 19 pathways, and 8 visual labs with 62 applied questions**.

Each section includes:
- **Learn:** concise explanations with highlighted key terms and source page references
- **Flashcards:** retrieval prompts, answer reveal, shuffle, and persistent Known tracking
- **Quiz:** deliberately authored distractors, explanations after every answer, manual progression, and persistent missed-question review
- **Fill Blanks:** keyboard-accessible retrieval practice from the lessons
- **Pathways:** expandable explanations and tap-to-order causal sequences
- **Practice lab:** original SVG labeling and comparison/classification activities

The Quiz Hub can draw from BIOL232, the original BI231 material, or both. Existing BI231 content, model assets, and previously saved progress are retained under the existing storage key. New state remains local to the current browser; it does not sync between devices.

### Source handling

The senses material consists of original study summaries and original diagrams derived from the four supplied lecture PDFs. Every lesson, card, quiz explanation, and pathway identifies the relevant PDF page/slide. Original slides, textbook artwork, and raw course PDFs are **not** distributed in this repository. Source-page references are for checking against the learner's own course copies.

These are study aids, not medical guidance or a replacement for the instructor's material. Source limitations and ambiguous claims were reviewed during authoring; activities avoid presenting disputed simplifications as universal facts.

## Original BI231 coverage

Grounded in the BI231 (Fall 2025) sources:
- **Final exam study guide** — every numbered topic
- **Lab 6: Axial Muscles** — head, neck, back, anterior torso (~22 muscles)
- **Lab 7: Muscles of the Limbs** — shoulder, arm, forearm, hip, thigh, leg (~50 muscles)
- **Lab 8: Nervous Tissue & Spinal Cord** — neuron anatomy, plexuses, reflexes

## Sections

- 🧠 **Nervous Tissue** — divisions, glia (Schwann / oligodendrocytes / astrocytes / ependymal / microglia / satellite), neuron anatomy and transmembrane proteins, AP phases, graded potentials, refractory periods, botulism, myelin
- 💪 **Muscle Tissue** — sarcomere, CT layers, NMJ, sliding filament, contraction types, motor units, metabolism, fatigue. Includes the original 9-step Sequence of Muscle Contraction with the cross-bridge visualization
- 🔗 **Spinal Cord & Reflexes** — cord cross-section, dorsal vs ventral roots, 31 nerve pairs, plexuses (cervical / brachial / lumbar / sacral), 3-order sensory tracts, reflex types (stretch / DTR / withdrawal / crossed extensor / pupillary)
- 🗿 **Axial Muscles** — Lab 6 list with Origin / Insertion / Action; filterable by region
- 🦵 **Limb Muscles** — Lab 7 list with O/I/A, tagged with SITS / Hamstring / Quad groupings
- 🎯 **Visualizer**
  - 🧍 **3D Muscle Viewer** — rotate, zoom, click muscles to label. Uses BodyParts3D meshes (~80 muscles + skeleton landmarks). Quiz modes: "Find the X" and "ID this muscle"
  - 🗺️ **2D Body Map** — clickable anterior/posterior silhouette; works on phone
  - ⚡ **Action Potential** — animated graph with phase tags + ion-channel explanations
  - 🔄 **Reflex Arc** — patellar reflex step-through (receptor → sensory → cord → motor → effector)
- 🎮 **Quiz Hub** — random questions sampled across every section, with streak scoring

## Study modes per content section

- 📖 Learn — long-form notes with colour-coded key terms
- 🃏 Flashcards — hint-based recall with "Known" tracking
- 🎯 Quiz — multi-choice from the question pool
- ✍️ Fill Blanks — multi-choice cloze on the key terms
- 🔢 Order It — sequence drag-to-place
- 🎮 Visualize — animated SVG with quiz-to-advance (muscle contraction sequence)
- 📋 List + 🎯 O / I / A Match (muscle sections)

Progress saves in `localStorage`.

## 3D model attribution

3D meshes © **BodyParts3D**, The Database Center for Life Science (DBCLS) — licensed under [CC-BY-SA 2.1 Japan](https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en). Models are stored under `models/` as `.obj` files keyed by FMA ontology IDs; see `models/manifest.json` for the human-readable map.

Source: `https://dbarchive.biosciencedbc.jp/en/bodyparts3d/`

## Files

```
index.html        page shell
css/style.css     all styling
js/data.js        original BI231 study content
js/senses-data.js BIOL232 lessons, cards, quizzes, pathways
js/senses-lab.js  original senses diagrams and applied practice
js/engine.js      section nav, study modes, persistence
js/viz.js         3D viewer, 2D map, AP graph, reflex arc
models/           BodyParts3D OBJ files + manifest.json
```

No build step, no dependencies installed locally — Three.js is loaded from a CDN via an import map. Serve the repository with `python -m http.server 8765` and open `http://localhost:8765/` in a modern browser. ES modules require a web server; opening a file URL directly is not supported.

## Validation

- Syntax/content: `node --check js/engine.js && node --check js/senses-lab.js && node tools/validate_senses.mjs`
- Browser regression suite: `python tools/test_study_app.py` (requires Python Playwright and Chromium; see the script for URL/browser options)
- Manual QA: desktop and 390-pixel mobile layouts; every new course mode; correct/incorrect answers; retry/restart; keyboard controls; reload persistence; original muscle sequences and visualizer

The app itself has no build step or server-side dependencies. Browser-test tools are optional development dependencies.

## License

The original software implementation in this repository is **proprietary and source-visible**.
It is published for source inspection, educational review, and portfolio demonstration only.
Reuse, redistribution, modification, hosting, deployment, or incorporation into another
project is not permitted without prior written permission. See [`LICENSE`](LICENSE).

Third-party materials retain their own copyright and license terms, including the
BodyParts3D assets identified above and any separately licensed course materials,
libraries, media, or data included in the repository.
