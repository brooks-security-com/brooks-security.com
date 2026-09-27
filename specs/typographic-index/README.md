# Spec: the typographic index

**Status:** Approved design, port in progress. The reference in this folder is the
design to build; it is not built or deployed by any workflow. The site itself is
unchanged until the port lands.

**Goal:** rebuild brooks-security.com as the typographic index. Type and near-monochrome
only, one page of six sections, and the current home — the D3 knowledge graph — retired.

## Decisions

Set by Graham, 2026-09-27:

- **The graph is retired.** The typographic index becomes the home. "Straight up
  replacing the current contents" — this is a replacement, not a merge of two designs.
- **The current home copy moves into the Bio panel** — the "both sides of the security
  sale" hero, "How I got here", "Why sales engineering" — essentially as-is.
- **The contact form stays.** It is the one working thing that is not design: reCAPTCHA
  v3 plus `POST /api/contact`. It gets the new typography around it, not a rewrite.

## What the port inherits (and does not need to rebuild)

Checked against the running site before designing any of this:

- **Real URLs and search-engine visibility are not at risk.** The reference navigates by
  hash because it has no server. Production already does the same interaction properly:
  every page is served at its own URL and `assets/js/app.js` fetches and swaps the panel
  in place, pushing real history entries. The port keeps that machinery and drops the
  hash router — the in-page transition is the design, the hash was an artifact.
- **The graph shell goes with the graph.** `layouts/baseof.html` currently draws the SVG,
  the legend, the fit/search/theme tools, the intro card, the graph sitemap and the search
  palette. Those are properties of the graph home, not of the site.
- **Talks become real pages.** They are graph nodes built from `data/talks.yaml` today and
  have no pages of their own. The reference's six talk pages are new content: recording,
  one or two sentences about the subject, chapter list.
- **Tech and Work keep their existing pages.** The reference's platform-group and role
  pages are generated views of `docs/curriculum-vitae/platforms` and
  `work-experience`; in production those are the pages, reached by heading anchors, which
  is what the graph already does.

## Phases

1. **Home.** `layouts/home.html` renders the index: name, portrait, keyword cloud from
   `data/cloud.yaml`, six rows pointing at real URLs. Design CSS and the cloud packer
   move into `assets/` and `scripts/`. *Done when* `/` renders the new home with the
   cloud packed and no graph SVG in the markup.
2. **Shell.** `baseof.html` loses the graph, legend, tools and palette; keeps head/SEO,
   theme handling, and the panel container that pages are fetched into.
3. **Content pages.** `page`, `section`, `taxonomy`, `term` templates restyled to the
   `.detail` and `.rows` design; posts, portfolio, CV and contact all read the same.
4. **Talks.** A `talks` content type with six pages, from `data/talks.yaml`.
5. **Navigation.** `app.js` keeps fetch-and-swap against real URLs and drops the graph
   camera code; back/forward, Escape and search keep working.
6. **Cleanup.** Delete the graph assets, `site-redesign`'s reference if it is spent, and
   the last of the word "mockup".

## Acceptance criteria

- `hugo --gc` builds with no warnings, and the deploy workflow's build step passes.
- Every URL the site serves today still resolves: 14 posts, the CV, the portfolio,
  contact, the 404, the feeds and the sitemap.
- The contact form still validates and posts to `/api/contact`.
- The six sections are reachable from the home index and from the sitemap, with JS off.
- Mobile first: no horizontal overflow at 320px, 64px-or-better tap targets, and the
  whole thing flattened under `prefers-reduced-motion`.

## Run the reference

```bash
python3 -m http.server 4173 --directory specs/typographic-index
```

Its tools need `~/venvs/content` (python-markdown + pyyaml):

```bash
~/venvs/content/bin/python specs/typographic-index/tools/build_content.py --check
```
