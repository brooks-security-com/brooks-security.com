"""Generate the data the site's Work and Tech pages render.

The design's Work page lists roles and its Tech page lists builds and platform groups.
Both already exist in the site as long-form documents -- the CV's work history and the
portfolio -- and the design's own loader (tools/content.py) already parses them into
roles, builds and platform groups.

So this does not invent a second source. It runs that loader and writes the result to
hugo/data/, the way the credentials page reads hugo/data/credentials.yaml. The site and
the design agree because they read the same documents through the same parser.

    ~/venvs/content/bin/python tools/build_site_data.py [--check]

--check writes nothing and fails if what is on disk differs, so a doc edit that is not
regenerated is caught rather than shipped.
"""
from __future__ import annotations

import argparse
import pathlib
import re
import sys

import yaml

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[2]
sys.path.insert(0, str(HERE))
import content as C  # noqa: E402


def first_line(md: str, limit: int = 150) -> str:
    """The one-line summary a row shows.

    The CV writes a role as bullets with a bolded heading each ("**SOC 2 Type 2
    accreditation:** ..."), so the summary is those headings in the CV's own words --
    a reader scanning the list gets what the role was about without a rewritten
    sentence the CV never contained. Prose-only writeups fall back to their first
    sentence.
    """
    headings = re.findall(r"^\s*-\s*\*\*(.+?)\*\*:?", md, re.M)
    if headings:
        return " \u00b7 ".join(h.rstrip(".:") for h in headings[:4])
    text = " ".join(re.sub(r"[*`_]", "", md).split())
    for end in (". ", "? ", "! "):
        cut = text.find(end)
        if 0 < cut < limit:
            return text[: cut + 1]
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "\u2026"


def work() -> dict:
    """The roles, as the design lists them.

    Five rows map one-to-one onto CV roles. Everything older is one row, "Before that",
    which is a single page covering those roles in order -- the design's own rule, and
    the reason the list does not grow a row every time the CV gains an early job.
    """
    data = C.load_work()
    roles = data["roles"]  # newest first
    listed = []
    for i, r in enumerate(roles[:5], start=1):
        listed.append(
            {
                "slug": r["slug"],
                "title": r["title"],
                "company": r["company"],
                "row_title": f"{r['title']} \u2014 {r['company']}",
                "dates": r["dates"],
                "summary": first_line(r["md"]),
                "facts": r.get("facts", []),
                "md": r["md"].strip() + "\n",
                "weight": i,
            }
        )
    early = roles[5:]
    if early:
        span = f"{early[-1]['dates'].split(chr(0x2013))[0].strip()} \u2013 {early[0]['dates'].split(chr(0x2013))[-1].strip()}"
        extra = "".join(
            f"\n\n## {r['title']} \u2014 {r['company']}\n\n{r['md'].strip()}\n" for r in early[1:]
        )
        listed.append(
            {
                "slug": early[0]["slug"],
                "title": "Before that",
                "company": early[0]["company"],
                "row_title": "Before that",
                "dates": span,
                "summary": first_line(early[0]["md"].strip() + "\n" + extra),
                "facts": early[0].get("facts", []),
                "md": early[0]["md"].strip() + "\n" + extra,
                "weight": 6,
            }
        )
    return {"context": data.get("context_md", "").strip() + "\n", "roles": listed}


def tech() -> dict:
    """The Tech page: the builds you can read, then the platform groups.

    The builds are the portfolio writeups and are already pages in the site, so this
    records which ones and in what order rather than copying them.
    """
    builds = [{"slug": p["slug"], "title": p["title"], "weight": p["weight"]}
              for p in C.load_portfolio()]
    groups = []
    for i, g in enumerate(C.load_platforms(), start=1):
        groups.append(
            {
                "slug": g["slug"],
                "title": g["title"],
                "count": len(g["platforms"]),
                "summary": first_line(g["blurb_md"]) if g.get("blurb_md") else "",
                "platforms": [
                    {"name": p["name"], "years": p.get("years", ""), "md": " ".join(p.get("md", "").split())}
                    for p in g["platforms"]
                ],
                "weight": i,
            }
        )
    return {"builds": builds, "groups": groups}


HEADERS = {
    "work": "# The roles the Work page lists, generated from the CV by tools/build_site_data.py.\n"
            "# Do not hand-edit: edit content/docs/Curriculum Vitae/work-experience.md and re-run it.\n",
    "tech": "# What the Tech page lists: the builds (written up under content/docs/Portfolio) and\n"
            "# the platform groups (from the CV's platform section). Generated by\n"
            "# tools/build_site_data.py. Do not hand-edit: edit the source and re-run it.\n",
}


def render(name: str, payload: dict) -> str:
    body = yaml.safe_dump(payload, sort_keys=False, allow_unicode=True, width=100)
    return HEADERS[name] + "\n" + body


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    targets = {
        "work": (REPO / "hugo/data/work.yaml", render("work", work())),
        "tech": (REPO / "hugo/data/tech.yaml", render("tech", tech())),
    }
    drift = []
    for name, (path, text) in targets.items():
        current = path.read_text() if path.exists() else ""
        if args.check:
            if current != text:
                drift.append(name)
            continue
        path.write_text(text)
        print(f"wrote {path.relative_to(REPO)}: {len(text.splitlines())} lines")

    if args.check:
        if drift:
            print("out of date: " + ", ".join(drift) +
                  "\n  run: ~/venvs/content/bin/python tools/build_site_data.py")
            return 1
        print("work and platforms data are up to date with the CV")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
