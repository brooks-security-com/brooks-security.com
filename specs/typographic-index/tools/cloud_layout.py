#!/usr/bin/env python3
"""Generate the keyword-cloud layout for mockup 01.

The cloud is a real cloud: words scattered, no rows, no rotation, with the
largest words at the centre and the smallest pushed outward. That composition is
computed here and baked into index.html as `--x` / `--y` / `--s` custom
properties, so the page stays a static document — it renders identically with
JavaScript disabled, and nothing about the layout depends on runtime measurement.

Geometry
--------
Everything is expressed in abstract units where the cloud box is BOX_W wide.
The CSS sizes words with `calc(var(--s) * 1cqw)`, so one unit is exactly 1% of
the rendered cloud width and the whole composition scales as a unit: mobile and
desktop get the same layout, only smaller. No viewport-specific overlap.

The word box is `advance_width * font_size` by `font_size` (the CSS sets
`line-height: 1`, so the measured rect height equals the font size). Widths are
not estimates: they were measured in a headless browser against this variant's
own self-hosted fonts, at 100px, and are embedded below as em ratios. Guessing
these is what makes a hand-picked cloud collision-prone.

Run:  python3 tools/cloud_layout.py            # prints the markup + a report
      python3 tools/cloud_layout.py --write    # rewrites the cloud block in index.html
"""

from __future__ import annotations

import argparse
import math
import pathlib
import re
import zlib

# --------------------------------------------------------------------------
# words: text, size (units = 1cqw), cluster, treatment
# The three display words come first and are the largest by construction.
# Governance, Risk, Compliance and Privacy are deliberately separate concepts:
# each is its own cloud entry and its own hover cluster.
# --------------------------------------------------------------------------
WORDS: list[tuple[str, float, str, str]] = [
    ("Technology", 7.6, "tech", "display"),
    ("Infrastructure", 7.3, "tech", "display"),
    ("Communication", 7.0, "comms", "display"),
    ("Security", 4.6, "security", "mid"),
    ("Cloud", 4.2, "tech", "mid"),
    ("Privacy", 4.1, "privacy", "mid"),
    ("Governance", 4.1, "governance", "mid"),
    ("Compliance", 4.0, "compliance", "mid"),
    ("Risk", 4.0, "risk", "mid"),
    ("Advocacy", 3.9, "comms", "small"),
    ("Programming", 3.8, "tech", "small"),
    ("AWS", 3.7, "tech", "small"),
    ("Linux", 3.4, "tech", "small"),
    ("Automation", 3.3, "tech", "small"),
    ("Python", 3.2, "tech", "small"),
    ("Marketing", 3.2, "comms", "small"),
    ("Azure", 3.1, "tech", "small"),
    ("Terraform", 3.1, "tech", "small"),
    ("Zero Trust", 3.1, "security", "small"),
    ("SOC 2", 3.0, "compliance", "small"),
    ("Policy", 3.0, "governance", "small"),
    ("Incident Response", 2.9, "security", "small"),
    ("Ansible", 2.9, "tech", "small"),
    ("Docker", 2.9, "tech", "small"),
    ("Writing", 2.9, "comms", "small"),
]

# Measured advance width per 1em of font size, and the rect height at
# line-height: 1 (always 1em). See the module docstring.
WIDTHS: dict[str, dict[str, float]] = {
    "display": {
        "Technology": 3.870, "Infrastructure": 4.750, "Communication": 5.520,
        "Security": 2.740, "Cloud": 2.020, "Privacy": 2.530, "Governance": 4.020,
        "Risk": 1.480, "Compliance": 4.040, "Advocacy": 3.170, "Zero Trust": 3.440,
        "AWS": 1.430, "Linux": 1.940, "Python": 2.480, "Terraform": 3.470,
        "Azure": 1.940, "Ansible": 2.480, "Docker": 2.380, "Automation": 4.020,
        "Programming": 4.790, "Incident Response": 6.150, "SOC 2": 2.000,
        "Policy": 2.040, "Marketing": 3.520, "Writing": 2.490,
    },
    "mid": {
        "Technology": 5.300, "Infrastructure": 6.460, "Communication": 7.320,
        "Security": 3.890, "Cloud": 2.730, "Privacy": 3.430, "Governance": 5.550,
        "Risk": 2.070, "Compliance": 5.520, "Advocacy": 4.560, "Zero Trust": 4.640,
        "AWS": 2.160, "Linux": 2.580, "Python": 3.310, "Terraform": 4.470,
        "Azure": 2.720, "Ansible": 3.450, "Docker": 3.330, "Automation": 5.390,
        "Programming": 6.300, "Incident Response": 8.630, "SOC 2": 2.970,
        "Policy": 2.810, "Marketing": 4.760, "Writing": 3.380,
    },
    "small": {
        "Technology": 5.180, "Infrastructure": 6.260, "Communication": 7.160,
        "Security": 3.790, "Cloud": 2.670, "Privacy": 3.350, "Governance": 5.440,
        "Risk": 2.010, "Compliance": 5.410, "Advocacy": 4.440, "Zero Trust": 4.540,
        "AWS": 2.120, "Linux": 2.520, "Python": 3.230, "Terraform": 4.370,
        "Azure": 2.660, "Ansible": 3.370, "Docker": 3.260, "Automation": 5.250,
        "Programming": 6.170, "Incident Response": 8.430, "SOC 2": 2.940,
        "Policy": 2.750, "Marketing": 4.630, "Writing": 3.270,
    },
}

BOX_W = 1000.0
ASPECT = 2.20                     # width : height of the cloud box
BOX_H = BOX_W / ASPECT
PACK_SCALE = 1.06                 # pack 6% loose so mobile can grow words 6%
EDGE = 6.0                        # keep this far inside the box
PAD_X = 0.24                      # horizontal gap, as a fraction of the SMALLER word
PAD_Y = 0.32                      # vertical gap, as a fraction of the SMALLER word
STEP_T = 0.02                     # spiral step, 1.0 = box edge
ANGLE_STEPS = 48


def _tiebreak(word: str) -> int:
    """Stable per-word integer (Python's hash() is salted per process)."""
    return zlib.crc32(word.encode()) % ANGLE_STEPS


def _size_of(word: str, treatment: str, units: float) -> tuple[float, float]:
    """(width, height) in units, packed 10% larger than rendered."""
    font = units * BOX_W / 100.0 * PACK_SCALE
    return WIDTHS[treatment][word] * font, font


def _overlaps(a, b) -> bool:
    """AABB test with the gap scaled to the SMALLER of the pair.

    Padding proportional to one word's own size makes big words sit far from
    each other and small ones crowd: taking the minimum evens the texture out.
    """
    gap = PAD_X * min(a[3], b[3]), PAD_Y * min(a[3], b[3])
    pad_x, pad_y = gap
    return not (
        a[0] + a[2] / 2 + pad_x <= b[0] - b[2] / 2
        or b[0] + b[2] / 2 + pad_x <= a[0] - a[2] / 2
        or a[1] + a[3] / 2 + pad_y <= b[1] - b[3] / 2
        or b[1] + b[3] / 2 + pad_y <= a[1] - a[3] / 2
    )


def _inside(x: float, y: float, w: float, h: float, ellipse: float) -> bool:
    if not (x - w / 2 >= EDGE and x + w / 2 <= BOX_W - EDGE):
        return False
    if not (y - h / 2 >= EDGE and y + h / 2 <= BOX_H - EDGE):
        return False
    # Elliptical envelope so the silhouette is a cloud, not a filled rectangle.
    dx = (x - BOX_W / 2) / (BOX_W / 2 * ellipse)
    dy = (y - BOX_H / 2) / (BOX_H / 2 * ellipse)
    return dx * dx + dy * dy <= 1.0


def layout() -> list[dict]:
    placed: list[dict] = []
    cx, cy = BOX_W / 2, BOX_H / 2
    max_r = math.hypot(BOX_W / 2, BOX_H / 2)

    for word, units, cluster, treatment in WORDS:
        # A long phrase is wide enough to jam the outer ring. Word clouds handle
        # that by letting area carry the weight, not just height, so shrink the
        # offender and try again rather than leaving a hole in the composition.
        intended = units
        for _ in range(6):
            w, h = _size_of(word, treatment, units)
            offset = _tiebreak(word) * (2 * math.pi / ANGLE_STEPS)

            if not placed:
                placed.append({"word": word, "x": cx, "y": cy, "w": w, "h": h,
                               "units": units, "intended": intended,
                               "cluster": cluster, "treatment": treatment})
                break

            chosen = None
            # Walk an elliptical spiral that matches the box's aspect, not a
            # circular one: a circle in a 2:1 box fills the middle column first
            # and leaves the flanks empty. t = 1 is the box edge.
            t = 0.0
            while t <= 1.0 and chosen is None:
                for k in range(ANGLE_STEPS):
                    angle = offset + k * (2 * math.pi / ANGLE_STEPS)
                    x = cx + (BOX_W / 2 - EDGE) * t * math.cos(angle)
                    y = cy + (BOX_H / 2 - EDGE) * t * math.sin(angle)
                    if not _inside(x, y, w, h, ellipse=0.97):
                        continue
                    cand = (x, y, w, h)
                    if any(_overlaps(cand, (p["x"], p["y"], p["w"], p["h"]))
                           for p in placed):
                        continue
                    chosen = (x, y)
                    break
                if chosen is None:
                    t += STEP_T

            if chosen is None:
                units *= 0.94
                continue

            # The spiral lands on discrete rings and angles, which reads as a
            # grid: several words share y=50% and sit on visible axes. Nudge each
            # word by a stable per-word amount, trying a few magnitudes: near the
            # flanks the ellipse is too narrow for the full nudge, and without a
            # fallback those words stay pinned to the horizontal midline.
            h32 = zlib.crc32(word.encode())
            base_x = (((h32 >> 3) % 21) - 10) / 10.0 * 0.020 * BOX_W
            base_y = (((h32 >> 9) % 21) - 10) / 10.0 * 0.055 * BOX_H
            for scale in (1.0, 0.6, 0.35):
                nudged = (chosen[0] + base_x * scale, chosen[1] + base_y * scale, w, h)
                if _inside(nudged[0], nudged[1], w, h, ellipse=0.97) and not any(
                    _overlaps(nudged, (p["x"], p["y"], p["w"], p["h"]))
                    for p in placed
                ):
                    chosen = (nudged[0], nudged[1])
                    break

            placed.append({"word": word, "x": chosen[0], "y": chosen[1], "w": w, "h": h,
                           "units": units, "intended": intended,
                           "cluster": cluster, "treatment": treatment})
            break
        else:
            raise SystemExit(f"could not place {word!r}: cloud box too small")
    return placed


def markup(placed: list[dict]) -> str:
    # Emitted in placement order (largest first, centre outward) because the
    # entry stagger walks the DOM in order: the cloud grows from the middle.
    lines = []
    for item in placed:
        x = item["x"] / BOX_W * 100
        y = item["y"] / BOX_H * 100
        lines.append(
            f'        <li class="cloud__w cloud__w--{item["treatment"]}"'
            f' data-cluster="{item["cluster"]}"'
            f' style="--x:{x:.2f}%;--y:{y:.2f}%;--s:{item["units"]:.2f}">{item["word"]}</li>'
        )
    return "\n".join(lines)


def report(placed: list[dict]) -> str:
    area = sum(p["w"] * p["h"] for p in placed)
    overlap = 0
    for i, a in enumerate(placed):
        for b in placed[i + 1:]:
            if _overlaps((a["x"], a["y"], a["w"], a["h"]),
                         (b["x"], b["y"], b["w"], b["h"])):
                overlap += 1
    radii = sorted(math.hypot(p["x"] - BOX_W / 2, p["y"] - BOX_H / 2) for p in placed)
    max_r = math.hypot(BOX_W / 2, BOX_H / 2)
    biggest = max(placed, key=lambda p: p["units"])
    smallest = min(placed, key=lambda p: p["units"])
    ctr = sum(math.hypot(p["x"] - BOX_W / 2, p["y"] - BOX_H / 2) for p in placed) / len(placed)
    return (
        f"box        {BOX_W:.0f} x {BOX_H:.0f} units (aspect {ASPECT}:1)\n"
        f"words      {len(placed)}   fill {area / (BOX_W * BOX_H) * 100:.1f}% of box\n"
        f"overlaps   {overlap} (pack boxes, 0 expected)\n"
        f"largest    {biggest['word']} ({biggest['units']} units, "
        f"r={math.hypot(biggest['x'] - BOX_W / 2, biggest['y'] - BOX_H / 2):.0f})\n"
        f"smallest   {smallest['word']} ({smallest['units']} units, "
        f"r={math.hypot(smallest['x'] - BOX_W / 2, smallest['y'] - BOX_H / 2):.0f})\n"
        f"mean r     {ctr:.0f} units of {max_r:.0f} max\n"
        f"radii      inner half {radii[:len(radii) // 2][-1]:.0f} -> outer {radii[-1]:.0f}\n"
        + (f"shrunk     " + ", ".join(f"{p['word']} {p['intended']:.2f}->{p['units']:.2f}"
                                      for p in placed if p["units"] < p["intended"] - 0.001)
           if any(p["units"] < p["intended"] - 0.001 for p in placed)
           else "shrunk     none (every word placed at its intended size)")
    )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true", help="rewrite the cloud block in index.html")
    args = ap.parse_args()

    placed = layout()
    block = markup(placed)

    if args.write:
        path = pathlib.Path(__file__).resolve().parent.parent / "index.html"
        html = path.read_text()
        new, n = re.subn(
            r'(<ul class="cloud"[^>]*>\n).*?(\n      </ul>)',
            lambda m: m.group(1) + block + m.group(2),
            html,
            flags=re.DOTALL,
        )
        if n != 1:
            raise SystemExit(f"expected exactly one cloud block, found {n}")
        path.write_text(new)
        print(f"rewrote {path} ({len(placed)} words)")
    else:
        print(block)

    print()
    print(report(placed))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
