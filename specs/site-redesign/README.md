# Spec: Knowledge-graph redesign

**Status:** Reference for the port. Not live. This folder holds the approved design as a working mockup. Nothing here is built or deployed by the site's workflows.

**Goal:** Rebuild brooks-security.com as the knowledge-graph design in this folder, keep every feature the current site has, and keep serving it as static files from the private S3 origin behind CloudFront.

## Run the reference

```bash
python3 -m http.server 4173 --directory specs/site-redesign
```

Then open <http://localhost:4173>. The page loads D3 from cdnjs and its fonts from Google Fonts, so it needs network access.

| File | What it is |
|---|---|
| `index.html` | The reference page: every style and behavior the port should reproduce |
| `shared.js` | A snapshot of the site content plus small helpers (search, theme, contact form states, heatmap SVG, resume markup) |
| `assets/` | The photo compressed to a 560 px JPEG, and the video poster |

## What the reference defines

- **Default view.** `/` opens with the About panel on the right and the whole graph beside it. Closing the panel (the close button or Escape) shows the bare graph with an intro card.
- **The graph.** The photo is the center node. Eight category hubs sit around it: Writing, Builds, Credentials, Experience, Talks, POC playbook, Stack, and Contact. Every post, build, role, credential, talk, POC step, platform group, and contact method is a child node of its hub, and the resume hangs off Experience. Lines run only from the center to each hub and from each hub to its own items. There are no lines between clusters.
- **Node sizing.** Post nodes scale with reading time, role nodes with tenure, and platform-group nodes with the number of platforms. Featured builds are larger.
- **Navigation.** Clicking a node moves the camera to its cluster and opens a panel with that content. Posts and the resume open in a wider reading panel. Every panel has a deep link, and Back, Escape, and the panel breadcrumb all step back out.
- **Motion.** On load the hubs fly out from the photo and each cluster fans out around its hub. Hovering a node highlights its cluster and dims the rest. Nodes can be dragged and spring back into place. Scroll or pinch zooms. There is no loading screen or spinner.
- **Search.** ⌘K or `/` opens search, and matching nodes light up in the graph.
- **Writing filter.** Filtering Writing by category in its panel also fades the non-matching post nodes.
- **Related items.** A few items in different clusters are related, such as the SOC 2 post and the SOC 2 build. They appear as Related links in each other's panels and are never drawn as lines. The pairs are in `CROSS` in `index.html`.
- **Labels.** Hub labels always show. Item labels sit on the outward side of their node and show only where they fit without overlapping, so zooming in reveals more. Hovering or focusing a node shows a tooltip.
- **Phones.** The panel becomes a bottom sheet and the camera frames the graph above it.
- **Themes.** Light and dark follow the system setting, with a toggle. Type and base palette come from the Console direction: Geist and Geist Mono, zinc neutrals, and an iris accent.
- **Category colors.** The seven colored hubs use consecutive slots of a color-blind-safe categorical palette, assigned in ring order, so neighboring clusters stay easy to tell apart. Contact stays neutral gray. Hub labels and icons carry the identity, so color is never the only cue. If the set of hubs changes, keep the slots consecutive and re-validate the palette against both theme backgrounds.

## In scope

Everything the current site offers, delivered through the graph and its panels:

- The home pitch, "How I got here," "Why sales engineering," "Where I fit," and the background notes (`hugo/content/_index.md`)
- Work experience, credentials, and platforms with the GitHub heatmap (`hugo/content/docs/Curriculum Vitae/`)
- Every portfolio page: speaking, running a POC, security, GitOps, automation, AI agents, and X as Code (`hugo/content/docs/Portfolio/`)
- Every blog post in full, with categories, tags, reading time, the author card, and newer and older links (`hugo/content/posts/`)
- The contact form with real delivery (`hugo/layouts/shortcodes/contact-form.html`)
- The printable one-page resume and the plain text version (`hugo/content/resume.md`, `hugo/static/downloads/graham-brooks-resume.txt`)
- The presenting video, search, light and dark themes, the RSS feed, the sitemap, and a 404 page

## Out of scope

- Infrastructure changes beyond what the port strictly needs. The contact API, the Lambdas, and the nightly heatmap job stay as they are.
- New content or copy changes.
- The other design directions explored alongside this one. This is the chosen direction.

## Constraints

- **Hosting.** Static files on the existing private S3 origin behind CloudFront, deployed by the existing workflow or a like-for-like replacement. Keeping Hugo is optional, and the reference does not depend on it.
- **Real pages.** Every panel is also a real page that renders its content without JavaScript, so search engines, link previews, and visitors without JavaScript get the content. The graph is an enhancement on top.
- **Existing URLs.** Every URL in the map below keeps working, either at the same path or through a 301 to its new home.
- **Contact form.** It posts to `/api/contact` with a reCAPTCHA Enterprise token and the honeypot field, exactly as the current shortcode does, and keeps its status messages and its 15 second timeout.
- **Heatmap.** It renders from `hugo/data/contributions.json`. The reference's sample data (`SITE.heatmap` in `shared.js`) has the same shape.
- **Weight.** Ship only the D3 modules the graph uses (selection, force, zoom, drag, transition, and timer) rather than the full bundle. Serve fonts and images from the site's own origin, with images compressed. The source photo, `hugo/static/grahambrooks.png`, is 4.2 MB.
- **Accessibility.** Keep keyboard focus on the hubs, the screen-reader site map, support for `prefers-reduced-motion`, visible focus rings, and a text label beside every color.
- **Copy.** Reuse the current content as written. The site's copy avoids em dashes and en dashes, so keep them out of new UI text too.

## URL map

| Current URL | Opens |
|---|---|
| `/` | About, the default view |
| `/docs/curriculum-vitae/` and `/docs/curriculum-vitae/work-experience/` | Experience |
| `/docs/curriculum-vitae/credentials/` | Credentials |
| `/docs/curriculum-vitae/platforms/` | Stack |
| `/docs/portfolio/` | Builds |
| `/docs/portfolio/gitops/` | Builds: brooks-security.com |
| `/docs/portfolio/security/` | Builds: Local NVD Database |
| `/docs/portfolio/ai-agents/` | Builds: Agentic Skills |
| `/docs/portfolio/automation/` and `/docs/portfolio/x-as-code/` | Builds (each page covers several builds) |
| `/docs/portfolio/speaking/` | Talks |
| `/docs/portfolio/running-a-poc/` | POC playbook |
| `/posts/` | Writing |
| `/posts/<slug>/` | That post |
| `/tags/<tag>/` and `/categories/<category>/` | Writing, filtered |
| `/docs/contact/` | Contact |
| `/resume/` | Resume |

## Mockup shortcuts to replace

| In the reference | In the port |
|---|---|
| Content comes from `shared.js`, a snapshot of `hugo/content` taken for the mockup | Generate the graph and the panels from the real content at build time |
| Routes are hash tokens such as `#post.<slug>`, because the claude.ai artifact viewer only passes plain anchors | Real paths from the URL map, updated with the History API when a node opens |
| 12 of the 14 posts are excerpts | Full post bodies |
| The contact form is simulated and sends nothing | Real submission to `/api/contact` |
| The heatmap is seeded sample data | `hugo/data/contributions.json`, refreshed nightly as it is today |
| The full D3 7.9.0 bundle from cdnjs and fonts from Google Fonts | A trimmed local bundle and self-hosted fonts |

## Suggested approach

1. Generate one static page per panel (About, each category, each post, build, and role, and the resume) with the panel content rendered as HTML.
2. At build time, also emit a small JSON manifest of graph nodes (id, URL, label, meta, category, and size) from the content and its front matter.
3. Load the graph script on every page. It reads the manifest, draws the graph, and turns node clicks and panel links into in-place transitions: fetch the target page, swap the panel content, move the camera, and push the real URL. A direct load of any URL shows that page's panel already open.
4. Port the styles from `index.html` as they are, then replace each shortcut in the table above.

## Acceptance criteria

- [ ] `/` matches the reference: the About panel open with the full graph beside it on desktop, and a bottom sheet on phones.
- [ ] Every node opens its content, and every content page is reachable and readable with JavaScript turned off.
- [ ] Every URL in the URL map resolves, either at the same path or through a 301.
- [ ] The contact form delivers through `/api/contact`, with reCAPTCHA Enterprise and the honeypot working as they do today.
- [ ] The heatmap renders from `contributions.json` and still refreshes nightly.
- [ ] Light and dark themes work, reduced motion turns off the animation, and the graph works from the keyboard.
- [ ] There is no loading screen, and Largest Contentful Paint stays under 2.5 seconds on a mid-range phone.
- [ ] The site deploys through the existing pipeline to the same bucket and CloudFront distribution.
