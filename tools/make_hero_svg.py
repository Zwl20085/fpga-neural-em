"""Generate assets/img/hero-field.svg.

An *analytic illustration* of a 4-pole machine cross-section: 36 stator slots,
an airgap, and flux lines drawn as contours of a synthetic potential
Az(r, theta) = f(r) cos(p*theta). It is not a finite-element result and is labelled
as an illustration on the website.

Run from the repository root:  python tools/make_hero_svg.py
"""

from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

OUT = Path(__file__).resolve().parents[1] / "assets" / "img" / "hero-field.svg"

SIZE = 520
C = SIZE / 2
R_SHAFT, R_ROTOR, R_STATOR_IN, R_SLOT, R_OUT = 40.0, 140.0, 146.0, 196.0, 236.0
POLES_PAIRS = 2
N_SLOTS = 36
N_LEVELS = 9


def potential(r: np.ndarray, t: np.ndarray) -> np.ndarray:
    """Synthetic flux function: rises in the rotor, decays to zero at the outer yoke."""
    rg = R_STATOR_IN
    inner = (r / rg) ** POLES_PAIRS
    outer = np.cos(0.5 * np.pi * np.clip((r - rg) / (R_OUT - rg), 0, 1))
    f = np.where(r < rg, inner, outer)
    f = np.where(r < R_SHAFT, 0.0, f)
    return f * np.cos(POLES_PAIRS * t + 0.35)


def contour_paths() -> list[str]:
    n = 700
    xs = np.linspace(-R_OUT, R_OUT, n)
    x, y = np.meshgrid(xs, xs)
    r, t = np.hypot(x, y), np.arctan2(y, x)
    az = np.ma.masked_where(r > R_OUT - 1, potential(r, t))
    levels = np.linspace(-0.92, 0.92, 2 * N_LEVELS)
    levels = levels[np.abs(levels) > 0.05]
    fig, ax = plt.subplots()
    cs = ax.contour(x, y, az, levels=levels)
    paths = []
    for segs in cs.allsegs:
        for seg in segs:
            if len(seg) < 8:
                continue
            pts = " ".join(f"{C + px:.1f},{C - py:.1f}" for px, py in seg[::3])
            paths.append(f'<polyline points="{pts}"/>')
    plt.close(fig)
    return paths


def slot_paths() -> list[str]:
    out = []
    half = np.pi / N_SLOTS * 0.42
    for k in range(N_SLOTS):
        a = 2 * np.pi * k / N_SLOTS
        pts = [
            (R_STATOR_IN + 6, a - half * 0.55),
            (R_SLOT, a - half),
            (R_SLOT, a + half),
            (R_STATOR_IN + 6, a + half * 0.55),
        ]
        d = " ".join(f"{C + rr * np.cos(aa):.1f},{C - rr * np.sin(aa):.1f}" for rr, aa in pts)
        out.append(f'<polygon points="{d}"/>')
    return out


def query_points() -> list[str]:
    rng = np.random.default_rng(7)
    out = []
    for _ in range(26):
        rr = rng.uniform(R_SHAFT + 12, R_OUT - 12)
        aa = rng.uniform(0, 2 * np.pi)
        out.append(f'<circle cx="{C + rr * np.cos(aa):.1f}" cy="{C - rr * np.sin(aa):.1f}" r="2.6"/>')
    return out


def main() -> None:
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SIZE} {SIZE}" role="img" aria-labelledby="t d">
<title id="t">Illustration: flux lines in a four-pole machine cross-section</title>
<desc id="d">Schematic cross-section of an electrical machine with 36 stator slots. Teal curves are flux lines from a synthetic analytic potential, and small dots mark arbitrary query points at which a coordinate-based neural model can be evaluated. Illustration only, not simulation output.</desc>
<g fill="#13294b" stroke="none">
<circle cx="{C}" cy="{C}" r="{R_OUT}"/>
</g>
<g fill="#0b1c36"><circle cx="{C}" cy="{C}" r="{R_STATOR_IN}"/></g>
<g fill="#1b3a66"><circle cx="{C}" cy="{C}" r="{R_ROTOR}"/></g>
<g fill="#b87333" opacity="0.85">{''.join(slot_paths())}</g>
<g fill="none" stroke="#5eead4" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" opacity="0.9">{''.join(contour_paths())}</g>
<g fill="#0b1c36" stroke="#8fb3d9" stroke-width="1"><circle cx="{C}" cy="{C}" r="{R_SHAFT}"/></g>
<g fill="#f7f5f0" stroke="#0b1c36" stroke-width="1">{''.join(query_points())}</g>
</svg>
"""
    OUT.write_text(svg, encoding="utf-8")
    print(f"wrote {OUT} ({len(svg) / 1024:.0f} kB)")


if __name__ == "__main__":
    main()
