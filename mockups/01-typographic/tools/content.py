"""Read brooks-security.com's own content out of the Hugo source.

The mockup is supposed to show real content, so nothing here is invented: every
string comes from the site's repo (posts, talks data, the CV, the portfolio
pages, Contact). Parsing lives here and HTML rendering lives in
build_content.py, so this file stays testable and free of markup.

Sources (all relative to the repo root):
    hugo/data/talks.yaml                          recorded talks, with video ids
    hugo/content/docs/Portfolio/speaking/*.md     the writeup per talk
    hugo/content/posts/*.md                       the blog
    hugo/content/docs/Portfolio/*.md              project writeups
    hugo/content/docs/Curriculum Vitae/*.md       work history, platforms, certs
    hugo/content/docs/Contact.md                  contact copy

Run directly to dump a summary of what parsed (`python3 tools/content.py`).
"""

from __future__ import annotations

import pathlib
import re
import tomllib
from datetime import datetime

import yaml

REPO = pathlib.Path(__file__).resolve().parents[3]
HUGO = REPO / "hugo"


# --------------------------------------------------------------------------
# frontmatter
# --------------------------------------------------------------------------

def split_frontmatter(text: str) -> tuple[dict, str]:
    """Return (metadata, body) for Hugo's two flavours: +++ TOML and --- YAML."""
    if text.startswith("+++"):
        _, raw, body = text.split("+++", 2)
        return tomllib.loads(raw), body.strip()
    if text.startswith("---"):
        _, raw, body = text.split("---", 2)
        return (yaml.safe_load(raw) or {}), body.strip()
    return {}, text.strip()


def read(path: pathlib.Path) -> tuple[dict, str]:
    return split_frontmatter(path.read_text(encoding="utf-8"))


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return re.sub(r"-{2,}", "-", s)


VIDEO_BLOCK = re.compile(r"<video\b.*?</video>", re.DOTALL | re.IGNORECASE)
SHORTCODE = re.compile(r"\{\{<.*?>\}\}", re.DOTALL)


# --------------------------------------------------------------------------
# talks: data/talks.yaml joined to the writeups in Portfolio/speaking
# --------------------------------------------------------------------------

def load_talks() -> list[dict]:
    data = yaml.safe_load((HUGO / "data" / "talks.yaml").read_text(encoding="utf-8"))
    talks = []
    for entry in data["talks"]:
        if entry.get("publish") is False:
            continue  # the duplicate re-recording; the site hides it too
        talks.append({
            "slug": entry["id"],
            "id": entry["id"],
            "title": entry["title"],
            "series": entry.get("series", ""),
            "date": str(entry.get("date", "")),
            "duration": entry.get("duration_label", ""),
            "duration_seconds": entry.get("duration_seconds", 0),
            "views": entry.get("views", 0),
            "format": entry.get("format", ""),
            "summary": entry.get("summary", "").strip(),
            "speakers": entry.get("speakers", []),
            "chapters": entry.get("chapters", []) + entry.get("chapters_reconstructed", []),
            "video": entry.get("video", ""),
            "youtube": entry.get("youtube", ""),
            "poster": f"https://i.ytimg.com/vi/{entry['id']}/maxresdefault.jpg",
        })
    talks.sort(key=lambda t: t["date"], reverse=True)
    return talks


META_RE = re.compile(r"^(?P<month>[A-Z][a-z]{2}) (?P<year>\d{4}) · (?P<minutes>\d+) min$")


def load_speaking() -> list[dict]:
    """The writeup pages under Portfolio/speaking, with their `meta` line parsed.

    These titles do not match the recording titles in talks.yaml
    ("Spotlight Webinar: Vulnerability Remediation" is "Vulnerability
    Remediation" here, "How MSPs and MSSPs Can Comply..." is "Compliance for
    MSPs and MSSPs"), so the join runs on the `meta` line instead: month and
    year plus whole minutes, which is unique across the set.
    """
    out = []
    for path in sorted((HUGO / "content" / "docs" / "Portfolio" / "speaking").glob("*.md")):
        if path.name.startswith("_"):
            continue
        meta, body = read(path)
        body = VIDEO_BLOCK.sub("", body).strip()  # the mockup renders its own player
        body = re.sub(r"^#\s+.*$", "", body, count=1, flags=re.MULTILINE).strip()
        raw_meta = str(meta.get("meta", "")).strip()
        parsed = META_RE.match(raw_meta)
        out.append({
            "slug": slugify(path.stem),
            "title": meta.get("title", path.stem),
            "meta": raw_meta,
            "key": (parsed.group("month", "year", "minutes") if parsed else None),
            "md": body,
            "source": path.name,
        })
    return out


def talks_with_writeups() -> tuple[list[dict], list[dict]]:
    """Return (recordings with their writeup, writeups with no recording).

    A recording with no writeup is a hard failure: the talk would render with no
    description, which is exactly the thing this section exists to show. A
    writeup with no recording is not an error -- "Realtime Management" was
    presented but never archived -- so it comes back as a separate list.
    """
    writeups = load_speaking()
    by_key = {w["key"]: w for w in writeups if w["key"]}
    talks = load_talks()
    for talk in talks:
        stamp = datetime.strptime(talk["date"], "%Y-%m-%d")
        key = (stamp.strftime("%b"), str(stamp.year),
               str(round(talk["duration_seconds"] / 60)))
        found = by_key.pop(key, None)
        if found is None:
            raise SystemExit(
                f"no writeup for {talk['title']!r} (looked for {key}); "
                f"unmatched writeups: {[w['title'] for w in by_key.values()]}")
        talk["writeup"] = found
    consumed = {talk["writeup"]["slug"] for talk in talks}
    return talks, [w for w in writeups if w["slug"] not in consumed]


# --------------------------------------------------------------------------
# blog
# --------------------------------------------------------------------------

def load_posts() -> list[dict]:
    posts = []
    for path in sorted((HUGO / "content" / "posts").glob("*.md")):
        if path.name.startswith("_"):
            continue
        meta, body = read(path)
        slug = slugify(path.stem)
        posts.append({
            "slug": slug,
            "title": meta.get("title", path.stem),
            "description": (meta.get("description") or "").strip(),
            "date": str(meta.get("date", "")),
            "tags": meta.get("tags", []) or [],
            "categories": meta.get("categories", []) or [],
            "md": body,
            "source": path.name,
        })
    posts.sort(key=lambda p: p["date"], reverse=True)
    return posts


# --------------------------------------------------------------------------
# portfolio projects
# --------------------------------------------------------------------------

def load_portfolio() -> list[dict]:
    out = []
    for path in sorted((HUGO / "content" / "docs" / "Portfolio").glob("*.md")):
        if path.name.startswith("_") or path.is_dir():
            continue
        meta, body = read(path)
        title = meta.get("title", path.stem)
        body = re.sub(r"^#\s+.*$", "", body, count=1, flags=re.MULTILINE).strip()
        out.append({
            "slug": slugify(path.stem),
            "title": title,
            "weight": meta.get("weight", 99),
            "md": body,
        })
    out.sort(key=lambda p: p["weight"])
    return out


# --------------------------------------------------------------------------
# curriculum vitae
# --------------------------------------------------------------------------

HEADING = re.compile(r"^(#{2,3})\s+(.+?)\s*$")


def load_work() -> dict:
    _, body = read(HUGO / "content" / "docs" / "Curriculum Vitae" / "Work-Experience.md")
    context_lines, roles, current = [], [], None
    section = "context"
    for line in body.splitlines():
        m = HEADING.match(line)
        if m and len(m.group(1)) == 2:
            section = m.group(2).strip().lower()
            continue
        if m and len(m.group(1)) == 3 and section.startswith("experience"):
            if current:
                roles.append(current)
            current = {"title": m.group(2).strip(), "lines": []}
            continue
        if current is not None:
            current["lines"].append(line)
        elif section.startswith("context"):
            context_lines.append(line)
    if current:
        roles.append(current)

    parsed = []
    for role in roles:
        lines = [ln for ln in role["lines"]]
        head = next((ln.strip() for ln in lines if ln.strip()), "")
        body_md = "\n".join(lines[lines.index(next(ln for ln in lines if ln.strip())) + 1:]).strip()
        head = head.replace("**", "")
        meta_bits = [b.strip() for b in head.split("·") if b.strip()]
        title, company = role["title"], ""
        if "," in title:
            title, company = [p.strip() for p in title.rsplit(",", 1)]
        parsed.append({
            # the title alone is unique across this history, and it makes a
            # readable URL (#/work/lead-solutions-architect)
            "slug": slugify(title),
            "title": title,
            "company": company,
            "dates": meta_bits[0] if meta_bits else "",
            "facts": meta_bits[1:],
            "md": body_md,
        })
    seen = {}
    for role in parsed:
        if role["slug"] in seen:
            raise SystemExit(f"two roles slug to {role['slug']!r}; disambiguate them")
        seen[role["slug"]] = True
    return {"context_md": "\n".join(context_lines).strip(), "roles": parsed}


def load_platforms() -> list[dict]:
    """Platforms.md is `## group` / `### platform` / `**N years**` + prose."""
    _, body = read(HUGO / "content" / "docs" / "Curriculum Vitae" / "Platforms.md")
    groups: list[dict] = []
    group: dict | None = None
    platform: dict | None = None

    def flush_platform() -> None:
        nonlocal platform
        if platform is not None and group is not None:
            group["platforms"].append(platform)
        platform = None

    for line in body.splitlines():
        m = HEADING.match(line)
        if m and len(m.group(1)) == 2:
            flush_platform()
            if group is not None:
                groups.append(group)
            group = {"title": m.group(2).strip(), "blurb": [], "platforms": []}
            continue
        if m and len(m.group(1)) == 3 and group is not None:
            flush_platform()
            platform = {"name": m.group(2).strip(), "years": "", "md": []}
            continue
        if platform is not None:
            platform["md"].append(line)
        elif group is not None:
            group["blurb"].append(line)
    flush_platform()
    if group is not None:
        groups.append(group)

    for g in groups:
        g["slug"] = slugify(g["title"])
        blurb = SHORTCODE.sub("", "\n".join(g["blurb"])).strip()
        g["blurb_md"] = blurb
        for p in g["platforms"]:
            text = "\n".join(p["md"]).strip()
            m = re.match(r"\*\*(.+?)\*\*\s*(.*)", text, re.DOTALL)
            if m:
                p["years"] = m.group(1).strip()
                text = m.group(2).strip()
            p["md"] = text
    # drop placeholder-only groups (the GitHub heatmap shortcode is not content)
    return [g for g in groups if g["platforms"] or g["blurb_md"]]


def load_credentials() -> dict:
    _, body = read(HUGO / "content" / "docs" / "Curriculum Vitae" / "Credentials.md")
    out, section, current = {"certifications": [], "degrees": []}, None, None
    for line in body.splitlines():
        if line.startswith("## "):
            section = line[3:].strip().lower()
            continue
        if line.startswith("### "):
            current = {"name": line[4:].strip(), "detail": ""}
            key = "degrees" if section and "degree" in section else "certifications"
            out[key].append(current)
            continue
        if current is not None and line.strip():
            current["detail"] = line.strip()
            current = None
    return out


def load_contact() -> dict:
    _, body = read(HUGO / "content" / "docs" / "Contact.md")
    body = re.sub(r"^\#\s+.*$", "", body, count=1, flags=re.MULTILINE).strip()
    body = SHORTCODE.sub("", body).strip()  # the contact form is not in a mockup
    links = re.findall(r"\[([^\]]+)\]\((https?://[^)]+)\)", body)
    return {"md": body, "links": [{"label": a, "href": b} for a, b in links]}


# --------------------------------------------------------------------------

def summary() -> str:
    talks, unrecorded = talks_with_writeups()
    posts, portfolio = load_posts(), load_portfolio()
    work, platforms, creds = load_work(), load_platforms(), load_credentials()
    lines = [
        f"talks          {len(talks)}   " + ", ".join(t["slug"] for t in talks),
        f"  unrecorded   {len(unrecorded)}   " + ", ".join(w["title"] for w in unrecorded),
        f"posts          {len(posts)}",
        f"portfolio      {len(portfolio)}   " + ", ".join(p["slug"] for p in portfolio),
        f"work roles     {len(work['roles'])}   " + "; ".join(
            f"{r['title']} @ {r['company']} ({r['dates']})" for r in work["roles"]),
        f"platform groups{len(platforms):>3}   " + ", ".join(
            f"{g['title']} [{len(g['platforms'])}]" for g in platforms),
        f"credentials    {len(creds['certifications'])} certs, {len(creds['degrees'])} degrees",
    ]
    return "\n".join(lines)


if __name__ == "__main__":
    print(summary())
