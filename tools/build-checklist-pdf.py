#!/usr/bin/env python3
"""Generate the lead-magnet PDF from its committed markdown source.

Single source of truth is the markdown; this script renders it to a branded,
print-styled HTML and asks headless Chrome to print it to PDF. Stdlib only.

Usage:
    python3 tools/build-checklist-pdf.py

Requires Google Chrome (used in --headless --print-to-pdf mode). The markdown
covers only the handful of constructs below (headings, blockquote, task-list
and bullet items, horizontal rules, bold, paragraphs); this is a deliberately
small converter for that one document, not a general markdown engine.
"""
import html
import os
import re
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "hugo/static/downloads/soc2-hipaa-readiness-checklist.md")
OUT = os.path.join(ROOT, "hugo/static/downloads/soc2-hipaa-readiness-checklist.pdf")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

CSS = """
@page { size: letter; margin: 0.85in 0.9in; }
* { box-sizing: border-box; }
body { font: 11pt/1.5 -apple-system, "Helvetica Neue", Arial, sans-serif; color: #1f2328; margin: 0; }
h1 { font-size: 22pt; color: #0a3d62; margin: 0 0 0.2rem; }
h2 { font-size: 14pt; color: #0a66c2; margin: 1.4rem 0 0.4rem; border-bottom: 2px solid #e6eef7; padding-bottom: 0.2rem; }
h3 { font-size: 12pt; margin: 1rem 0 0.3rem; }
p { margin: 0.5rem 0; }
ul { list-style: none; padding-left: 0; margin: 0.4rem 0; }
li { margin: 0.3rem 0; padding-left: 1.6rem; text-indent: -1.6rem; }
li.task::before { content: "\\2610"; color: #0a66c2; font-size: 1.2em; margin-right: 0.6rem; }
li.bullet::before { content: "\\2022"; color: #0a66c2; margin-right: 0.7rem; }
blockquote { background: #fff8e6; border-left: 4px solid #d29922; margin: 0.8rem 0; padding: 0.6rem 0.9rem; font-size: 10pt; }
hr { border: 0; border-top: 1px solid #d0d7de; margin: 1.4rem 0; }
.brand { color: #57606a; font-size: 10pt; margin-top: 0; }
a { color: #0a66c2; text-decoration: none; }
"""


def inline(text):
    text = html.escape(text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\[(.+?)\]\((.+?)\)", r'<a href="\2">\1</a>', text)
    return text


def render(md):
    out, in_list = [], False

    def close_list():
        nonlocal in_list
        if in_list:
            out.append("</ul>")
            in_list = False

    for line in md.splitlines():
        s = line.rstrip()
        if not s.strip():
            close_list()
            continue
        if s.startswith("# "):
            close_list(); out.append(f"<h1>{inline(s[2:])}</h1>")
        elif s.startswith("## "):
            close_list(); out.append(f"<h2>{inline(s[3:])}</h2>")
        elif s.startswith("### "):
            close_list(); out.append(f"<h3>{inline(s[4:])}</h3>")
        elif s.startswith("> "):
            close_list(); out.append(f"<blockquote>{inline(s[2:])}</blockquote>")
        elif s.strip() == "---":
            close_list(); out.append("<hr>")
        elif s.startswith("- [ ] "):
            if not in_list:
                out.append("<ul>"); in_list = True
            out.append(f'<li class="task">{inline(s[6:])}</li>')
        elif s.startswith("- "):
            if not in_list:
                out.append("<ul>"); in_list = True
            out.append(f'<li class="bullet">{inline(s[2:])}</li>')
        else:
            close_list(); out.append(f"<p>{inline(s)}</p>")
    close_list()
    return "\n".join(out)


def main():
    with open(SRC, encoding="utf-8") as f:
        body = render(f.read())
    page = f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body>{body}</body></html>"
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as tmp:
        tmp.write(page)
        tmp_path = tmp.name
    try:
        subprocess.run(
            [CHROME, "--headless", "--no-pdf-header-footer", f"--print-to-pdf={OUT}", f"file://{tmp_path}"],
            check=True, capture_output=True,
        )
    finally:
        os.unlink(tmp_path)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    sys.exit(main())
