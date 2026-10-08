"""Render the social-sharing card and take desktop/mobile screenshots for review.

Usage (from repo root, with a local server on :8765 for the screenshots):
    python tools/og_and_check.py og      # writes assets/img/og-image.png
    python tools/og_and_check.py shots OUTDIR
"""
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


def og() -> None:
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 1200, "height": 630})
        pg.goto((ROOT / "tools" / "og-card.html").as_uri())
        pg.wait_for_timeout(1500)
        pg.screenshot(path=str(ROOT / "assets" / "img" / "og-image.png"))
        b.close()


def shots(out: Path) -> None:
    out.mkdir(parents=True, exist_ok=True)
    errors: list[str] = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        for name, vp in {"desktop": (1440, 900), "mobile": (390, 844)}.items():
            ctx = b.new_context(viewport={"width": vp[0], "height": vp[1]}, reduced_motion="reduce")
            pg = ctx.new_page()
            pg.on("console", lambda m: errors.append(f"{name} console {m.type}: {m.text}") if m.type in ("error", "warning") else None)
            pg.on("requestfailed", lambda r: errors.append(f"{name} failed: {r.url}"))
            pg.goto("http://localhost:8765/", wait_until="networkidle")
            sw = pg.evaluate("document.documentElement.scrollWidth")
            print(name, "scrollWidth", sw, "viewport", vp[0])
            pg.screenshot(path=str(out / f"{name}-full.png"), full_page=True)
            if name == "mobile":
                pg.click(".nav-toggle")
                pg.screenshot(path=str(out / "mobile-menu.png"))
                pg.click('#nav-menu a[href="#hardware"]')
                pg.wait_for_timeout(300)
                print("menu closed after click:", pg.get_attribute(".nav-toggle", "aria-expanded"))
            # anchors resolve
            missing = pg.evaluate("""[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href')).filter(h=>h.length>1 && !document.getElementById(h.slice(1)))""")
            print(name, "broken anchors:", missing)
            imgs = pg.evaluate("[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)")
            print(name, "broken images:", imgs)
            noalt = pg.evaluate("[...document.images].filter(i=>!i.hasAttribute('alt')).length")
            print(name, "images without alt:", noalt)
            ctx.close()
        b.close()
    print("\n".join(errors) or "no console errors / failed requests")


if __name__ == "__main__":
    if sys.argv[1] == "og":
        og()
    else:
        shots(Path(sys.argv[2]))
