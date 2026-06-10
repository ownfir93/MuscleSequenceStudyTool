"""Take screenshots of each tab to inspect visual problems."""
import asyncio, os
from playwright.async_api import async_playwright

OUT = r"C:\Users\ownfi\Documents\repos\MuscleSequenceStudyTool\tools\shots"
os.makedirs(OUT, exist_ok=True)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        page = await b.new_page(viewport={"width": 1280, "height": 800})
        errs = []
        page.on("console", lambda m: errs.append(f"CONSOLE[{m.type}] {m.text}") if m.type in ("error","warning") else None)
        page.on("pageerror", lambda e: errs.append(f"PAGEERR {e}"))
        await page.goto("http://127.0.0.1:8765/", wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(500)
        await page.screenshot(path=f"{OUT}/01_overview_wide.png", full_page=False)

        # 3D viewer — needs long wait for model loading
        await page.locator('.sectab[data-sec="viz"]').click()
        await page.wait_for_timeout(15000)  # ~15s for all OBJs to load
        await page.screenshot(path=f"{OUT}/03_viz_body3d.png", full_page=False)

        # AP
        await page.locator('#sec-viz .modetab[data-mode="ap"]').click()
        await page.wait_for_timeout(800)
        await page.screenshot(path=f"{OUT}/03_viz_ap.png", full_page=False)

        # Reflex
        await page.locator('#sec-viz .modetab[data-mode="reflex"]').click()
        await page.wait_for_timeout(800)
        await page.screenshot(path=f"{OUT}/03_viz_reflex.png", full_page=False)

        # Scroll-test sticky nav: nervous section, scroll down 500px, check tabs still visible
        await page.locator('.sectab[data-sec="nervous"]').click()
        await page.wait_for_timeout(400)
        await page.evaluate("window.scrollTo(0, 700)")
        await page.wait_for_timeout(300)
        await page.screenshot(path=f"{OUT}/05_sticky_nervous_scrolled.png", full_page=False)

        # Contraction viz
        await page.locator('.sectab[data-sec="muscle"]').click()
        await page.wait_for_timeout(400)
        await page.locator('#sec-muscle .modetab[data-mode="seq:contraction:viz"]').click()
        await page.wait_for_timeout(800)
        await page.screenshot(path=f"{OUT}/03_contraction_viz.png", full_page=False)

        # Mobile
        await page.set_viewport_size({"width": 390, "height": 844})
        await page.locator('.sectab[data-sec="overview"]').click()
        await page.wait_for_timeout(400)
        await page.screenshot(path=f"{OUT}/04_mobile_overview.png", full_page=True)
        await b.close()
        print("\n=== Console errors ===")
        for e in errs: print(" ", e)

asyncio.run(main())
