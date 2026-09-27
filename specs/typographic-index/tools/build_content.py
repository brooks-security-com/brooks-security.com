"""Render the mockup's content pages from the site's own sources.

The index lists (in index.html) are curated: each row is a link to
`#/<section>/<slug>`. This script renders what those links open -- one detail
page per talk, post, project, platform group and role -- into
`details/<section>.html`, which mockup.js fetches when a section is opened.

    python3 tools/build_content.py            # write the fragments, then verify
    python3 tools/build_content.py --write    # write only
    python3 tools/build_content.py --check    # verify only (no writes)

The check is the point of the pair: it reads every `#/<section>/<slug>` link out
of index.html and fails if any link has no page or any page has no link, so the
curated list and the generated content cannot drift apart silently.
"""

from __future__ import annotations

from pathlib import Path
import html
import pathlib
import re
import sys

import markdown

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import content as C  # noqa: E402
import build_credentials as CR  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[1]
DETAILS = ROOT / "details"
INDEX = ROOT / "index.html"
LIVE = "https://www.brooks-security.com"
REPO = Path(__file__).resolve().parents[3]
STATIC = REPO / "hugo" / "static"
IMAGES = Path(__file__).resolve().parents[1] / "assets" / "img"


# --------------------------------------------------------------------------
# markdown
# --------------------------------------------------------------------------

MD = markdown.Markdown(extensions=["extra", "sane_lists", "toc"])

#: links inside the source content that should stay inside the mockup
ROUTES = {
    "/docs/contact/": "#/contact",
    "/docs/curriculum-vitae/work-experience/": "#/work",
    "/docs/curriculum-vitae/platforms/": "#/tech",
    "/docs/curriculum-vitae/credentials/": "#/bio",
}


def _route_map() -> dict[str, str]:
    """Every in-mockup route the content links to, keyed by its live path."""
    routes = dict(ROUTES)
    routes["/docs/portfolio/speaking/"] = "#/talks"
    routes["/docs/portfolio/"] = "#/tech"
    for post in C.load_posts():
        routes[f"/posts/{post['slug']}/"] = f"#/blogs/{post['slug']}"
    for project in C.load_portfolio():
        routes[f"/docs/portfolio/{project['slug']}/"] = f"#/tech/{project['slug']}"
    # a talk writeup is reached through the recording it belongs to
    talks, _ = C.talks_with_writeups()
    for talk in talks:
        routes[f"/docs/portfolio/speaking/{talk['writeup']['slug']}/"] = f"#/talks/{talk['slug']}"
    for writeup in C.load_speaking():
        routes.setdefault(f"/docs/portfolio/speaking/{writeup['slug']}/", "#/talks")
    return routes


MERMAID_PRE = re.compile(
    r'<pre><code class="language-mermaid">(.*?)</code></pre>', re.DOTALL)
URL_ATTR = re.compile(r'\b(href|src)="([^"]*)"')


ID_ATTR = re.compile(r'\bid="([^"]+)"')
ANCHOR = re.compile(r'href="#([^"]+)"')


def scope_ids(rendered: str, prefix: str) -> str:
    """Namespace heading/anchor ids with the page they belong to.

    Every item page is injected into the same document, so two posts that both
    have an "introduction" heading would otherwise collide, and a table of
    contents or a footnote would jump to whichever came first.
    """
    if not prefix:
        return rendered
    rendered = ID_ATTR.sub(lambda m: f'id="{prefix}--{m.group(1)}"', rendered)
    return ANCHOR.sub(lambda m: f'href="#{prefix}--{m.group(1)}"', rendered)


def local_asset(url: str) -> str:
    """Copy an asset the site serves out of hugo/static into the variant.

    Post illustrations are part of the content, so the pages carry them rather
    than pointing at the live site: a mockup that needs the network to show its
    own screenshots breaks the moment the box has no DNS, and it makes the
    variant's fidelity depend on what is deployed. Returns "" when the file is
    not in the repo, in which case the caller falls back to the live URL.
    """
    if not url.startswith("/") or url.startswith("//"):
        return ""
    source = STATIC / url.lstrip("/")
    if not source.is_file():
        return ""
    # flatten, but keep a hint of the original directory so two files with the
    # same name cannot overwrite each other
    stem = url.lstrip("/").replace("/", "-")
    IMAGES.mkdir(parents=True, exist_ok=True)
    (IMAGES / stem).write_bytes(source.read_bytes())
    return f"assets/img/{stem}"


def md(text: str, prefix: str = "") -> str:
    """Markdown -> HTML, rewiring the site's internal links to mockup routes.

    Two things the straight conversion gets wrong for a self-contained mockup:
    the site's internal links (which would 404 inside the mockup) and its images
    (which are served from the live site's static root, so they get the live
    origin). Mermaid fences are handed to the renderer in mockup.js.
    """
    rendered = MD.reset().convert(text)
    rendered = MERMAID_PRE.sub(
        lambda m: f'<pre class="mermaid">{m.group(1)}</pre>', rendered)
    rendered = scope_ids(rendered, prefix)
    routes = _route_map()

    def swap(match: re.Match) -> str:
        attr, url = match.group(1), match.group(2)
        if attr == "href":
            if url in routes:
                return f'href="{routes[url]}" data-internal'
            if url.startswith("/") and not url.startswith("//"):
                return f'href="{LIVE}{url}" rel="noopener"'
            if url.startswith("http") and "brooks-security.com" not in url:
                return f'href="{url}" rel="noopener"'
            return f'href="{url}"'
        local = local_asset(url)
        if local:
            return f'src="{local}" loading="lazy" decoding="async"'
        if url.startswith("/") and not url.startswith("//"):
            return f'src="{LIVE}{url}"'
        return f'src="{url}"'

    return URL_ATTR.sub(swap, rendered)


def toc_html(tokens: list[dict], prefix: str = "", depth: int = 0) -> str:
    """A nested contents list from the markdown toc tokens (two levels deep).

    The tokens carry the ids markdown generated; scope_ids() namespaces the ids
    in the rendered HTML afterwards, so the links built here have to be
    namespaced the same way or they point at nothing.
    """
    if not tokens or depth > 1:
        return ""
    rows = []
    for token in tokens:
        if not token.get("name"):
            continue
        child = toc_html(token.get("children") or [], prefix, depth + 1)
        anchor = f'{prefix}--{token["id"]}' if prefix else token["id"]
        rows.append(f'<li><a href="#{esc(anchor)}">{esc(token["name"])}</a>{child}</li>')
    return f'<ol class="toc__list">{"".join(rows)}</ol>' if rows else ""


def plain(text: str, limit: int = 0) -> str:
    """Strip markdown down to a single line of text (for list summaries)."""
    out = re.sub(r"`([^`]*)`", r"\1", text)
    out = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", out)
    out = re.sub(r"[*_]{1,3}([^*_]+)[*_]{1,3}", r"\1", out)
    out = re.sub(r"^#{1,6}\s+", "", out, flags=re.MULTILINE)
    out = re.sub(r"^\s*[-*>]\s+", "", out, flags=re.MULTILINE)
    out = " ".join(out.split())
    if limit and len(out) > limit:
        out = out[:limit].rsplit(" ", 1)[0] + "…"
    return out


def first_para(text: str, limit: int = 210) -> str:
    """The first real paragraph of a markdown body, as a summary line."""
    for block in re.split(r"\n\s*\n", text):
        block = block.strip()
        if not block or block.startswith(("#", "|", "```", "```", "{{", "<!--")):
            continue
        if block.startswith("<") or block.lstrip().startswith("!["):
            continue
        line = plain(block, limit)
        if len(line) > 40:
            return line
    return ""


def esc(text: str) -> str:
    return html.escape(str(text), quote=True)


def human_date(value: str, with_day: bool = False) -> str:
    """2023-08-17 -> Aug 2023 (or 17 Aug 2023)."""
    try:
        y, m, d = (int(p) for p in value.split("-"))
    except ValueError:
        return value
    months = ("Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
    return f"{d} {months[m - 1]} {y}" if with_day else f"{months[m - 1]} {y}"


# --------------------------------------------------------------------------
# detail pages
# --------------------------------------------------------------------------

def detail(slug: str, kicker: str, title: str, body: list[str], lede: str = "",
           modifier: str = "") -> str:
    """One sub-page: a back link, a kicker, a title, an optional lede, a body."""
    lede_html = f'<p class="detail__lede">{lede}</p>' if lede else ""
    inner = "\n      ".join(body)
    classes = "detail" + (f" {modifier}" if modifier else "")
    return f"""<article class="view view--detail" data-slug="{esc(slug)}" hidden>
  <div class="{classes}">
    <p class="kicker">{kicker}</p>
    <h3 class="detail__title" tabindex="-1">{title}</h3>
    {lede_html}
      {inner}
  </div>
</article>"""


def player(talk: dict) -> str:
    """A poster that turns into the video on click (no third-party embed).

    The thumbnail carries its own play button and the series branding, so this
    adds a runtime caption rather than a second control.
    """
    minutes = f"{talk['duration_seconds'] // 60} min"
    return f"""<figure class="player" data-video="{esc(talk['video'])}" data-poster="{esc(talk['poster'])}">
        <button class="player__btn" type="button" aria-label="Play {esc(talk['title'])} ({minutes})">
          <img class="player__poster" src="{esc(talk['poster'])}" alt="" loading="lazy" decoding="async" width="1280" height="720">
          <span class="player__cue">Watch <span class="player__len">{esc(talk['duration'])}</span></span>
        </button>
      </figure>"""


LABEL_LIMIT = 62

# A talk page describes the talk, not the room. The summaries in talks.yaml are
# programme notes: they open with an editorial label ("The commercial one.") and
# they are written around the people in the recording ("Mason opens on...",
# "Graham spends the first ten minutes...", "Chris's central claim is..."). A
# mechanical filter gets about half the set reading well and leaves the rest as
# a fragment of somebody else's argument, so the subject line for each published
# talk is set here, keyed by title, derived from the same summary with the speakers
# removed. The
# filter below covers any talk that is not listed.
TALK_SUBJECT = {
    "The Cyber Kill Chain Masterclass":
        "The Lockheed Martin Cyber Kill Chain as a defensive planning tool rather than an "
        "attacker's checklist: the eight phases, the control that buys back time at each, and "
        "why the chain is a clock rather than a test you pass or fail.",
    "Analyst Insights: Advancing Zero Trust Priorities":
        "Zero trust as a discipline rather than a product: why it is a philosophy and not "
        "something bought out of the box, why most organizations are further along than they "
        "think, and the difference between checkbox compliance and audit-ready.",
    "Spotlight Webinar: Vulnerability Remediation":
        "What a vulnerability actually is: CVE identity, CVSS scoring, and the split between "
        "patch and configuration vulnerabilities. Then a live remediation loop on three "
        "findings, closing on why remediation should be policy-driven rather than pushed ad hoc.",
    "Spotlight Webinar: Harnessing Automation":
        "The automation surface beyond patching and vulnerability remediation: service control, "
        "access control and software provisioning, built live as a drag-and-drop workflow that "
        "ends in BitLocker enforcement with a branching path and a firewall check.",
    "Spotlight Webinar: Autonomous Defense":
        "A defense-in-depth stack assembled as a single workflow, layer by layer: firewall, "
        "agent, antivirus, VPN, SIEM, patch and vulnerability scan. The argument underneath is "
        "that attackers triage, so an organization that is expensive to enter gets skipped "
        "rather than defeated.",
    "How MSPs and MSSPs Can Comply and Thrive with Automated Remediation":
        "The MSP business case for compliance: tool sprawl as the cost centre, proving "
        "compliance as the hard part, and CIS Level 1 and 2 remediations as a prepackaged "
        "service, with multi-tenant management and a SOC 2 audit at 93.4% patch efficacy.",
}

# The formats in talks.yaml count the people in the room ("Three presenters,
# market framing then demo then Q&A"). The page does not talk about speakers, so
# the line keeps what the session was and drops how many delivered it.
FORMAT_KEEP = {
    "Three presenters, market framing then demo then Q&A": "Market framing, demo, Q&A",
    "Solo presenter, live product demo": "Live product demo",
    "Two-person interview, no demo": "Interview, no demo",
    "Two presenters, one deck, long Q&A": "One deck, long Q&A",
}
FORMAT_STRIP = re.compile(
    r"^(?:solo|single|two|three|four)[- ]?(?:person|presenter|presenters)\b[^,]*,\s*", re.I)
CONNECTIVE = re.compile(
    r"^(From there|The second half|The argument|It then|The Q&A|Then\b|After that|Next\b|The rest)",
    re.I)
PRONOUN = re.compile(r"^(He|She|They|His|Her|Their|It)\b")


def speaker_tokens(talk: dict) -> set[str]:
    """Words that would name a person: full names, surnames, the principal."""
    tokens = {"Graham", "Brooks"}
    for speaker in talk.get("speakers") or []:
        for part in re.split(r"[\s.]+", speaker.get("name", "")):
            if len(part) > 2:
                tokens.add(part)
    return tokens


def subject_brief(talk: dict, limit: int = 320) -> str:
    """The fallback: up to two speaker-free sentences from the summary.

    Whole sentences only, and a sentence that names someone is dropped rather
    than edited -- correcting it would mean writing new copy about the talk.
    """
    text = " ".join(talk["summary"].split())
    sentences = re.split(r"(?<=[.!?])\s+", text)
    while len(sentences) > 1 and len(sentences[0]) < LABEL_LIMIT:
        sentences.pop(0)

    tokens = speaker_tokens(talk)

    def nameless(sentence: str) -> bool:
        return not any(re.search(rf"\b{re.escape(token)}\b", sentence) for token in tokens)

    kept: list[str] = []
    for sentence in sentences:
        if not nameless(sentence) or PRONOUN.match(sentence) or CONNECTIVE.match(sentence):
            continue
        if kept and len(" ".join(kept)) + len(sentence) > limit:
            break
        kept.append(sentence)
        if len(kept) == 2:
            break
    if not kept:
        kept = [s for s in sentences if nameless(s)][:1] or sentences[:1]
    return " ".join(kept)


def depersonalise(text: str, tokens: set[str]) -> str:
    """Strip a speaker's name from the front of a chapter title.

    Some chapter markers name the person doing the thing ("Chris's zero trust
    research and the EMA surveys"). The page does not name the people in the
    recording, so the possessor is dropped and the subject kept -- the title
    still says what the chapter is about.
    """
    plain_text = plain(text)
    names = "|".join(sorted((re.escape(t) for t in tokens), key=len, reverse=True))
    if not names:
        return plain_text
    stripped = re.sub(rf"^(?:{names})(?:'s|s')?\s+", "", plain_text, flags=re.I)
    if stripped and stripped != plain_text:
        return stripped[:1].upper() + stripped[1:]
    return plain_text


def talk_intro(talk: dict) -> str:
    """The sentence or two a talk page leads with."""
    return TALK_SUBJECT.get(talk["title"]) or subject_brief(talk)


def talk_format(talk: dict) -> str:
    """The format line with the speakers taken out of it."""
    fmt = talk["format"].strip()
    if fmt in FORMAT_KEEP:
        return FORMAT_KEEP[fmt]
    stripped = FORMAT_STRIP.sub("", fmt).strip()
    return stripped.capitalize() if stripped else fmt


def talk_detail(talk: dict) -> str:
    facts = [
        ("Runtime", talk["duration"]),
        ("Series", talk["series"]),
    ]
    fact_rows = "".join(
        f"<div><dt>{esc(k)}</dt><dd>{esc(v)}</dd></div>" for k, v in facts if v)
    tokens = speaker_tokens(talk)
    chapters = ""
    if talk["chapters"]:
        rows = "".join(
            f'<li><span class="chapters__t">{esc(ch.get("t", ""))}</span>'
            f'<span class="chapters__n">{esc(depersonalise(ch.get("title", ""), tokens))}</span></li>'
            for ch in talk["chapters"])
        chapters = f"""<details class="chapters">
        <summary>Chapters <span class="chapters__count">{len(talk["chapters"])}</span></summary>
        <ol>{rows}</ol>
      </details>"""
    watch = ""
    if talk["youtube"]:
        watch = (f'<p class="detail__more"><a href="{esc(talk["youtube"])}" rel="noopener">'
                 f'Watch on YouTube <span aria-hidden="true">→</span></a></p>')
    # The page is a caption plus a recording: one or two sentences about the
    # subject, the facts, the chapters, and a way out. The writeup and the
    # speaker list are not on it -- the writeup argued about who said what, and
    # the page no longer talks about the people in the room.
    intro = f'<p class="detail__lede">{esc(talk_intro(talk))}</p>'
    return detail(
        talk["slug"],
        f'{human_date(talk["date"])} · {talk_format(talk)}',
        esc(talk["title"]),
        [
            player(talk),
            f'<dl class="facts">{fact_rows}</dl>',
            intro,
            chapters,
            watch,
        ],
    )

def post_detail(post: dict) -> str:
    meta = [human_date(post["date"], True)]
    if post["categories"]:
        meta.extend(post["categories"])
    tags = ""
    if post["tags"]:
        tags = ('<p class="tags">' + "".join(
            f'<span class="tag">{esc(t)}</span>' for t in post["tags"]) + "</p>")
    body = md(post["md"], post["slug"])
    headings = toc_html(MD.toc_tokens, post["slug"])
    toc, modifier = "", ""
    if headings and body.count("<h2") + body.count("<h3") >= 3:
        toc = (f'<details class="toc"><summary>Contents</summary>{headings}</details>'
               f'<nav class="toc-rail" aria-label="Contents">'
               f'<p class="toc-rail__label">Contents</p>{headings}</nav>')
        modifier = "detail--with-rail"
    return detail(
        post["slug"],
        " · ".join(esc(m) for m in meta),
        esc(post["title"]),
        [
            tags,
            toc,
            f'<div class="prose">{body}</div>',
        ],
        lede=esc(post["description"]),
        modifier=modifier,
    )


def project_detail(project: dict) -> str:
    return detail(
        project["slug"],
        "Project",
        esc(project["title"]),
        [f'<div class="prose">{md(project["md"], project["slug"])}</div>'],
        lede=esc(first_para(project["md"])),
    )


def platform_detail(group: dict) -> str:
    rows = []
    for platform in group["platforms"]:
        years = f'<span class="stack__years">{esc(platform["years"])}</span>' if platform["years"] else ""
        body = (f'<div class="stack__prose prose">{md(platform["md"], group["slug"])}</div>'
                if platform["md"] else "")
        rows.append(f'<div class="stack__item"><h4 class="stack__name">{esc(platform["name"])}{years}</h4>{body}</div>')
    blurb = (f'<div class="prose">{md(group["blurb_md"], group["slug"])}</div>'
             if group["blurb_md"] else "")
    return detail(
        group["slug"],
        f'Platforms · {len(group["platforms"])}',
        esc(group["title"]),
        [blurb, "".join(rows)],
    )


def role_detail(role: dict, extra: list[dict]) -> str:
    """A CV role; `extra` carries any further roles folded into the same page."""
    blocks = [f'<div class="prose">{md(role["md"], role["slug"])}</div>']
    for other in extra:
        blocks.append(f'<p class="subhead">Also · {esc(other["title"])}, {esc(other["company"])}</p>')
        blocks.append(f'<div class="prose">{md(other["md"], other["slug"])}</div>')
    kicker = " · ".join(filter(None, [esc(role["company"]), esc(role["dates"])]))
    return detail(role["slug"], kicker, esc(role["title"]), blocks,
                  lede=esc(" · ".join(role["facts"])))


# --------------------------------------------------------------------------
# sections
# --------------------------------------------------------------------------

def build() -> dict[str, list[tuple[str, str]]]:
    """Return {section: [(slug, html), ...]} for the four linked sections."""
    talks, unrecorded = C.talks_with_writeups()
    posts = C.load_posts()
    projects = C.load_portfolio()
    platforms = C.load_platforms()

    # The Work list's last row ("Before that") covers the two earliest roles in
    # a single page; the five rows above it map one-to-one onto CV roles.
    roles = C.load_work()["roles"]  # newest first
    early = roles[5:]
    role_pages = [(r["slug"], role_detail(r, [])) for r in roles[:5]]
    if early:
        role_pages.append((early[0]["slug"], role_detail(early[0], early[1:])))

    return {
        "talks": ([(t["slug"], talk_detail(t)) for t in talks]
                  + []),   # a talk with no recording is not offered; nothing to play
        "blogs": [(p["slug"], post_detail(p)) for p in posts],
        "tech": ([(p["slug"], project_detail(p)) for p in projects]
                 + [(g["slug"], platform_detail(g)) for g in platforms]),
        "work": role_pages,
    }


LINK_RE = re.compile(r'href="#/([a-z]+)/([^"]+)"')


def links_in_index() -> dict[str, list[str]]:
    text = INDEX.read_text(encoding="utf-8")
    out: dict[str, list[str]] = {}
    for section, slug in LINK_RE.findall(text):
        out.setdefault(section, []).append(slug)
    return out


def write(pages: dict[str, list[tuple[str, str]]]) -> None:
    DETAILS.mkdir(exist_ok=True)
    for section, items in pages.items():
        body = "\n".join(f"  {html_block}" for _slug, html_block in items)
        header = (f'<!-- generated by tools/build_content.py from the site sources;\n'
                  f'     {len(items)} pages; edit the sources, not this file -->\n')
        (DETAILS / f"{section}.html").write_text(header + body + "\n", encoding="utf-8")


def check(pages: dict[str, list[tuple[str, str]]]) -> int:
    linked = links_in_index()
    problems = 0
    for section, items in pages.items():
        generated = [slug for slug, _ in items]
        listed = linked.get(section, [])
        missing = [s for s in listed if s not in generated]
        unused = [s for s in generated if s not in listed]
        status = "ok" if not missing and not unused else "MISMATCH"
        print(f"  {section:<7} listed {len(listed):>3}  pages {len(generated):>3}  {status}")
        for slug in missing:
            print(f"      index links to '{slug}' but no page was generated")
            problems += 1
        for slug in unused:
            print(f"      page '{slug}' is generated but no index row links to it")
            problems += 1
    for section in linked:
        if section not in pages:
            print(f"  {section}: index has links but the build generates no pages")
            problems += 1
    # Credentials is a panel, not a section with sub-pages, so it has no entry in
    # `pages` -- but its rows are generated from hugo/data/credentials.yaml and
    # have to be checked the same way.
    stale = CR.check()
    print(f"  creds   generated from hugo/data/credentials.yaml  "
          + ("ok" if not stale else "MISMATCH"))
    for problem in stale:
        print(f"      {problem}")
        problems += 1
    if problems:
        print(f"\n{problems} link(s) out of step. Fix index.html or the sources.")
    return problems


def main(argv: list[str]) -> int:
    pages = build()
    if "--check" not in argv:
        write(pages)
        total = sum(len(v) for v in pages.values())
        print(f"wrote {total} content pages into {DETAILS.relative_to(ROOT)}/")
    if "--write" in argv:
        return 0
    print("checking index.html links against generated pages:")
    return 1 if check(pages) else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
