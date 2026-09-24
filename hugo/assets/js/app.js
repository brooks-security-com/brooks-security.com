/* The site as one knowledge graph, drawn over the real pages.
   Every page is served whole (see layouts/baseof.html), so this script is an enhancement:
   it draws the graph from window.GRAPH (layouts/_partials/graph.html), then turns node
   clicks and in-site links into in-place transitions. Fetch the page, swap the panel,
   move the camera, push the real URL. Without it, every link is a plain page load. */
(() => {
const G = window.GRAPH;
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const root = document.documentElement, body = document.body;
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let reduced = motion.matches;
motion.addEventListener && motion.addEventListener('change', e => { reduced = e.matches; });
const cut = (s, n = 26) => s.length > n ? s.slice(0, n - 1).trim() + '…' : s;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
if (!/Mac|iP(hone|ad|od)/.test(navigator.platform || navigator.userAgent)) $$('[data-kbd]').forEach(k => { k.textContent = 'Ctrl K'; });

const panel = $('#panel'), pbody = $('#pbody'), intro = $('#intro'), tip = $('#tip');
let pane = $('#pane'), paneTitle = document.title;

/* ---------- theme: system by default, an explicit choice is stamped on <html data-theme> ---------- */
const themeBtn = $('#theme'), darkMq = matchMedia('(prefers-color-scheme: dark)');
const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : darkMq.matches;
const themeLabel = () => themeBtn.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme');
themeLabel();
themeBtn.addEventListener('click', () => {
  root.dataset.theme = isDark() ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch (e) { /* private mode */ }
  $$('meta[name="theme-color"]').forEach(m => { m.content = isDark() ? '#0C0C0F' : '#F5F5F7'; });
  themeLabel(); drawMermaid(pane, true);
});
darkMq.addEventListener && darkMq.addEventListener('change', () => { themeLabel(); drawMermaid(pane, true); });

/* ---------- mermaid, loaded only when a panel has a diagram ---------- */
let mermaidP = null;
function drawMermaid(p, redraw) {
  const els = $$('pre.mermaid', p);
  if (!els.length) return;
  els.forEach(el => {
    if (!el.dataset.src) el.dataset.src = el.textContent;
    else if (redraw) { el.removeAttribute('data-processed'); el.textContent = el.dataset.src; }
  });
  mermaidP = mermaidP || new Promise((ok, no) => {
    const s = document.createElement('script');
    s.src = root.dataset.mermaid; s.onload = ok; s.onerror = () => { mermaidP = null; no(); };
    document.head.append(s);
  });
  mermaidP.then(() => {
    const css = getComputedStyle(root), v = k => css.getPropertyValue(k).trim();
    window.mermaid.initialize({ startOnLoad: false, theme: 'base', flowchart: { useMaxWidth: true }, themeVariables: {
      fontFamily: v('--font'), fontSize: '13px', background: v('--panel'), mainBkg: v('--panel-2'), primaryColor: v('--panel-2'),
      primaryBorderColor: v('--accent-line'), primaryTextColor: v('--ink'), secondaryColor: v('--accent-soft'),
      tertiaryColor: v('--panel'), lineColor: v('--muted'), textColor: v('--ink-2'), edgeLabelBackground: v('--panel'),
    } });
    return window.mermaid.run({ nodes: els.filter(el => el.isConnected) });
  }).catch(() => { /* the diagram source stays readable as text */ });
}

/* ---------- contact form: same payload, messages, and 15 second timeout as before ---------- */
let recaptchaP = null;
const loadRecaptcha = key => recaptchaP = recaptchaP || new Promise((ok, no) => {
  const s = document.createElement('script');
  s.src = 'https://www.google.com/recaptcha/enterprise.js?render=' + encodeURIComponent(key);
  s.onload = () => ok(); s.onerror = () => { recaptchaP = null; no(); };
  document.head.append(s);
});
function bindContact(p) {
  const form = $('form.contact-form', p);
  if (!form || form.dataset.bound) return;
  form.dataset.bound = '1';
  const statusEl = $('.contact-status', form), btn = $('.contact-submit', form), siteKey = form.dataset.sitekey;
  const EMAIL = 'graham@brooks-security.com';
  const val = name => { const el = form.elements[name]; return el && el.value ? el.value.trim() : ''; };
  const setStatus = (msg, kind) => { statusEl.textContent = msg; statusEl.className = 'contact-status' + (kind ? ' is-' + kind : ''); };
  loadRecaptcha(siteKey).catch(() => {}); // start early; a failure is reported on submit
  // Keep a half-written message if the visitor wanders off in the panel and comes back.
  const FIELDS = ['name', 'email', 'subject', 'message'], KEY = 'contact-draft';
  try { const d = JSON.parse(sessionStorage.getItem(KEY) || '{}'); FIELDS.forEach(f => { if (d[f] && form.elements[f]) form.elements[f].value = d[f]; }); } catch (e) { /* no storage */ }
  const saveDraft = () => { try { sessionStorage.setItem(KEY, JSON.stringify(Object.fromEntries(FIELDS.map(f => [f, form.elements[f] ? form.elements[f].value : ''])))); } catch (e) { /* no storage */ } };
  const dropDraft = () => { try { sessionStorage.removeItem(KEY); } catch (e) { /* no storage */ } };
  form.addEventListener('input', saveDraft);

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Honeypot tripped: pretend success, send nothing.
    if (form.elements.company && form.elements.company.value) {
      form.reset();
      setStatus('Thanks, your message is on its way.', 'ok');
      return;
    }

    btn.disabled = true;
    setStatus('Sending...', 'pending');
    dropDraft(); // a message on its way is not a draft; it comes back only if the send fails

    // Single completion path with a hard timeout, so the form never gets stuck
    // on "Sending..." if reCAPTCHA fails to load or return a token, or the
    // request hangs. (reCAPTCHA throws internally on a bad/invalid site key in
    // a way we can't catch via .then/.catch; the timer is the safety net.)
    let done = false;
    const timer = setTimeout(() => {
      finish('That took too long. Please email me directly at ' + EMAIL + '.', 'error', false);
    }, 15000);
    function finish(msg, kind, reset) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (reset) form.reset(); else saveDraft();
      setStatus(msg, kind);
      btn.disabled = false;
    }
    const blocked = () => finish('The verification script could not load (an ad blocker may be blocking it). Please email me directly at ' + EMAIL + '.', 'error', false);

    loadRecaptcha(siteKey).then(() => {
      if (done) return; // already reported (the timeout): send nothing
      const g = window.grecaptcha;
      if (!g || !g.enterprise) { blocked(); return; }
      g.enterprise.ready(() => {
        if (done) return;
        g.enterprise.execute(siteKey, { action: 'contact' }).then(token => done ? null : fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: val('name'),
            email: val('email'),
            subject: val('subject'),
            message: val('message'),
            company: form.elements.company ? form.elements.company.value : '',
            token,
          }),
        })).then(res => {
          if (!res) return; // the timeout already reported this submit
          if (res.ok) {
            finish("Thanks, your message is on its way. I'll be in touch.", 'ok', true);
          } else {
            res.json().catch(() => ({})).then(b => {
              finish(b.error || ('Something went wrong. Please email me directly at ' + EMAIL + '.'), 'error', false);
            });
          }
        }).catch(() => {
          finish('Network error. Please email me directly at ' + EMAIL + '.', 'error', false);
        });
      });
    }, blocked);
  });
}

// Wire up whatever a freshly shown panel contains.
function hydrate(p) {
  bindContact(p);
  drawMermaid(p);
  const t = $('.article > details.toc', p);
  if (t) t.open = innerWidth >= 1280; // open only where it gets its own column, as toc.html does on first paint
}
hydrate(pane);

if (!G || !window.d3) return; // the page still works; it just has no graph

/* ---------- the graph's data, from the manifest ---------- */
const nodes = G.nodes.map(n => ({ ...n })), byId = new Map(), byUrl = new Map();
nodes.forEach(n => { byId.set(n.id, n); if (!byUrl.has(n.url)) byUrl.set(n.url, n); });
const me = Object.assign(byId.get('me'), { r: 42, x: 0, y: 0, color: 'var(--accent)' });
const cats = nodes.filter(n => n.kind === 'cat');
const ym = s => { const [y, m] = s.split('-').map(Number); return y * 12 + m; };
const now = new Date(), months = n => (n.end ? ym(n.end) : now.getFullYear() * 12 + now.getMonth() + 1) - ym(n.start);
// Node sizing: posts by reading time, roles by tenure, platform groups by platform count, featured builds larger.
const SIZE = {
  writing: n => 7 + Math.sqrt(n.mins) * 1.6,
  builds: n => n.featured ? 12.5 : 10,
  credentials: () => 10.5,
  experience: n => n.start ? 8 + Math.sqrt(months(n)) * .85 : 10,
  talks: n => n.icon === 'play' ? 12 : 10,
  poc: () => 11,
  stack: n => 8 + n.count * 1.1,
};
const links = [];
cats.forEach((c, ci) => {
  Object.assign(c, { r: 24, color: `var(--c${c.slot})`, children: nodes.filter(n => n.hub === c.id) });
  links.push({ source: me, target: c, kind: 'spoke', color: c.color });
  c.children.forEach((k, i) => {
    Object.assign(k, { r: (SIZE[c.id] || (() => 10))(k), parent: c, color: c.color, short: cut(k.short, c.cut), i2: ci * 3 + i });
    links.push({ source: c, target: k, kind: 'leaf', color: c.color });
  });
});
me.children = cats;
const adj = new Map(nodes.map(n => [n.id, new Set()]));
links.forEach(l => { adj.get(l.source.id).add(l.target.id); adj.get(l.target.id).add(l.source.id); });
const clusterOf = n => !n || n.kind === 'me' ? null : n.kind === 'cat' ? n : n.parent;

/* ---------- panel geometry (the camera frames the graph beside or above it) ---------- */
let panelOpen = !history.state || !history.state.graph;
function panelWidth(wide = panel.classList.contains('wide'), toc = panel.classList.contains('toc')) {
  const W = innerWidth;
  return Math.min(wide ? (toc && W >= 1280 ? 940 : 680) : 460, W - 24);
}
function area() {
  const W = innerWidth, H = innerHeight, mobile = W <= 860, wide = panel.classList.contains('wide');
  if (panelOpen && mobile) {
    const top = H - (panel.offsetHeight || H * (wide ? .88 : .62)), y = Math.max(48, Math.min(56, top - 44));
    return { x: 0, y, w: W, h: Math.max(24, top - 8 - y) };
  }
  if (panelOpen) return { x: 0, y: 70, w: W - panelWidth() - 24, h: H - 70 };
  if (mobile) return { x: 0, y: 60, w: W, h: H - 60 - (intro.offsetHeight + 24) };
  const introW = intro.offsetWidth + 40; // keep the graph clear of the intro card
  return { x: introW, y: 0, w: W - introW, h: H - 56 };
}

let svg, vp, svgEl, gNodes, gLinks, zoom, ready = false, entering = false, cur = null;
// While the entrance runs, aim at where nodes are going, not where they are.
const X = d => entering ? d.tx : d.x, Y = d => entering ? d.ty : d.y;

/* Layout: a tidy tree, photo at the top left, leaves fanning out to the bottom
   right. Depth runs left to right, breadth top to bottom.

   d3.tree is NOT available here. The vendored d3 is a hand-picked subset
   (drag, ease*, force*, max, min, randomLcg, select, timer, zoom,
   zoomIdentity) with no d3-hierarchy, so the layout is computed directly.

   For a fixed three-level tree that is the classic tidy algorithm: lay the
   leaves out in order, then centre each parent on its children. Deterministic,
   so the shape is identical on every load and there is nothing to settle. */
const LEAF_GAP = 27;    // vertical spacing between neighbouring leaves
const CLUSTER_GAP = 30; // extra space between one hub's leaves and the next
const DEPTH_GAP = 235;  // horizontal spacing between levels

function init() {
  let cursor = 0;
  cats.forEach((c, i) => {
    c.x = DEPTH_GAP;
    const kids = c.children;
    if (!kids.length) { c.y = cursor; cursor += LEAF_GAP; return; }
    let prev = null;
    kids.forEach(k => {
      k.x = DEPTH_GAP * 2;
      // Space by radius, not by a fixed gap: posts are sized by reading time, so
      // a flat gap lets the two biggest neighbours overlap.
      k.y = prev ? Math.max(cursor, prev.y + prev.r + k.r + 5) : cursor;
      prev = k;
    });
    cursor = prev.y + prev.r + LEAF_GAP;
    c.y = (kids[0].y + kids[kids.length - 1].y) / 2;
    if (i < cats.length - 1) cursor += CLUSTER_GAP;
  });
  me.x = 0;
  me.y = (cats[0].y + cats[cats.length - 1].y) / 2;
  build();
}

function build() {
  svg = d3.select('#graph'); vp = d3.select('#vp'); svgEl = svg.node();
  gLinks = d3.select('#links').selectAll('line').data(links).join('line')
    .attr('class', l => `link ${l.kind}`).style('--c', l => l.color || null);
  // Nodes are real links: they open in a new tab, copy, and show their URL like any other link.
  gNodes = d3.select('#nodes').selectAll('a.node').data(nodes, d => d.id).join('a')
    .attr('class', d => `node ${d.kind}${d.kind === 'me' ? ' me' : ''}`)
    .attr('href', d => d.url).attr('data-id', d => d.id).style('--c', d => d.color)
    .attr('tabindex', d => d.kind === 'child' ? -1 : null)
    .attr('aria-label', d => d.kind === 'me' ? 'About Graham Brooks' : d.meta ? `${d.label}, ${d.meta}` : d.label);
  gNodes.append('circle').attr('class', 'hit').attr('r', d => d.r + (d.kind === 'child' ? 9 : 10));
  const inner = gNodes.append('g').attr('class', 'inner');
  inner.append('circle').attr('class', 'focus').attr('r', d => d.r + (d.kind === 'me' ? 8 : 8));
  inner.filter(d => d.kind !== 'me').append('circle').attr('class', 'ring').attr('r', d => d.r + 5);
  inner.filter(d => d.kind !== 'me').append('circle').attr('class', 'disc').attr('r', d => d.r);
  inner.filter(d => d.icon && !d.glyph && d.kind !== 'me').append('use').attr('class', 'glyph').attr('href', d => '#i-' + d.icon)
    .attr('x', d => -(d.kind === 'cat' ? 10 : d.r * .6)).attr('y', d => -(d.kind === 'cat' ? 10 : d.r * .6))
    .attr('width', d => d.kind === 'cat' ? 20 : d.r * 1.2).attr('height', d => d.kind === 'cat' ? 20 : d.r * 1.2);
  inner.filter(d => d.glyph).append('text').attr('class', 'glyph').text(d => d.glyph);
  const meG = inner.filter(d => d.kind === 'me');
  meG.append('circle').attr('class', 'halo').attr('r', 46);
  meG.append('circle').attr('r', 44).attr('fill', 'var(--panel)');
  meG.append('image').attr('href', root.dataset.photo).attr('x', -42).attr('y', -42).attr('width', 84).attr('height', 84).attr('clip-path', 'url(#me-clip)').attr('preserveAspectRatio', 'xMidYMid slice');
  meG.append('circle').attr('class', 'photo-ring').attr('r', 44);
  const lbl = gNodes.append('text').attr('class', 'lbl').attr('y', d => d.r + 4).attr('dy', '1.05em').attr('aria-hidden', 'true');
  lbl.append('tspan').text(d => d.short);
  lbl.filter(d => d.kind === 'cat').append('tspan').attr('class', 'n').attr('dx', 5).text(d => d.children.length);
  kidLbl = lbl.filter(d => d.kind === 'child');

  zoom = d3.zoom().scaleExtent([.3, 3.2]).on('zoom', e => { vp.attr('transform', e.transform); svgEl.style.setProperty('--k', e.transform.k); })
    .on('end', e => { if (e.sourceEvent) placeLabels(clusterOf(cur), e.transform.k, cur); });
  svg.call(zoom).on('dblclick.zoom', null);

  gNodes.on('pointerenter', (e, d) => hover(d, e)).on('pointermove', (e, d) => showTip(d, e.clientX, e.clientY)).on('pointerleave', () => hover(null))
    .on('focus', function (e, d) { if (!quietFocus && this.matches(':focus-visible')) hover(d); }).on('blur', () => hover(null));
  // No node dragging. A tree's shape is the data, so moving one node would only
  // break the structure. Panning and zooming stay on the svg via d3.zoom.
  $$('#sitemap a').forEach(a => { a.tabIndex = -1; }); // screen readers still reach it in browse mode
  ready = true;

  /* entrance: categories fly out from the photo, then each cluster blooms */
  nodes.forEach(d => { d.tx = d.x; d.ty = d.y; });
  const st = history.state || {};
  const start = st.graph ? null : nodeFor(pane.dataset.path, location.hash);
  if (!start && st.graph) setPanel(false);
  show(start, { hash: location.hash, first: true });
  if (!location.hash && st.scroll != null) pbody.scrollTop = st.scroll; // reload, or Back without bfcache
  if (pending === 'graph') closeGraph(); else if (pending) go(pending.path, pending.hash);
  if (wantPal) openPal();
  pending = null; wantPal = false;
  if (reduced) { draw(); return; }
  entering = true;
  // Collapse to the photo, then grow outward. With a tree the photo is the root
  // at the top left, so that is the origin, not (0,0).
  const ox = me.tx, oy = me.ty;
  nodes.forEach(d => { d.x = ox; d.y = oy; });
  draw();
  gNodes.style('opacity', d => d.kind === 'me' ? 1 : 0);
  const ease = d3.easeCubicOut, delayOf = d => d.kind === 'me' ? 0 : d.kind === 'cat' ? 60 + d.slot * 45 : 420 + d.i2 * 9;
  const timer = d3.timer(el => {
    let done = true;
    for (const d of nodes) {
      if (d.kind === 'me') continue;
      const p = reduced ? 1 : Math.max(0, Math.min(1, (el - delayOf(d)) / (d.kind === 'cat' ? 700 : 760))), e = ease(p);
      if (d.kind === 'cat') { d.x = ox + (d.tx - ox) * e; d.y = oy + (d.ty - oy) * e; }
      else { const c = d.parent; d.x = c.x + (d.tx - c.tx) * e; d.y = c.y + (d.ty - c.ty) * e; }
      d.op = Math.min(1, p * 2.5);
      if (p < 1) done = false;
    }
    draw();
    gNodes.style('opacity', d => d.kind === 'me' ? null : d.op < 1 ? d.op : null);
    if (done) { timer.stop(); entering = false; gNodes.style('opacity', null); }
  });
}

/* ---------- draw ---------- */
let kidLbl;
// Child labels sit on the outward side of their node, pointing away from the category hub.
const labelSide = d => { const dx = X(d) - X(d.parent), dy = Y(d) - Y(d.parent), L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L]; };
function draw() {
  gNodes.attr('transform', d => `translate(${d.x},${d.y})`);
  gLinks.attr('x1', l => l.source.x).attr('y1', l => l.source.y).attr('x2', l => l.target.x).attr('y2', l => l.target.y);
  kidLbl.each(function (d) {
    const [ux, uy] = labelSide(d), side = ux > .35 ? 'start' : ux < -.35 ? 'end' : 'middle';
    this.setAttribute('x', ux * (d.r + 5)); this.setAttribute('y', uy * (d.r + 5));
    this.setAttribute('text-anchor', side);
    this.setAttribute('dy', side !== 'middle' ? '.35em' : uy > 0 ? '.95em' : '-.25em');
  });
}
// Show the labels that fit at this zoom: biggest nodes first, skip any that collide.
function placeLabels(c, k, n) {
  if (!c) { gNodes.classed('show-lbl', false); return; }
  const kmin = parseFloat(getComputedStyle(svgEl).getPropertyValue('--kmin')) || .75, fs = 11 / Math.max(k, kmin);
  if (fs * k < 8) { gNodes.classed('show-lbl', d => d === n); return; } // too small to read: only the selected label
  const taken = [...c.children, c].map(d => ({ x0: X(d) - d.r, x1: X(d) + d.r, y0: Y(d) - d.r, y1: Y(d) + d.r, d }));
  const hit = b => taken.some(t => t.d !== b.d && b.x0 < t.x1 && b.x1 > t.x0 && b.y0 < t.y1 && b.y1 > t.y0);
  const show = new Set();
  const order = [...c.children].sort((a, b) => (b === n) - (a === n) || b.r - a.r);
  for (const d of order) {
    const [ux, uy] = labelSide(d), w = d.short.length * fs * .6, h = fs * 1.2, side = ux > .35 ? 1 : ux < -.35 ? -1 : 0;
    const ax = X(d) + ux * (d.r + 5), ay = Y(d) + uy * (d.r + 5);
    const x0 = side === 1 ? ax : side === -1 ? ax - w : ax - w / 2, y0 = side ? ay - h / 2 : uy > 0 ? ay : ay - h;
    const b = { x0, x1: x0 + w, y0, y1: y0 + h, d };
    if (d === n || !hit(b)) { taken.push(b); show.add(d); }
  }
  gNodes.classed('show-lbl', d => show.has(d));
}

/* ---------- camera ---------- */
function fit(pts, focusPt, dur) {
  const a = area(), pad = innerWidth <= 860 ? 18 : 56;
  const x0 = d3.min(pts, d => X(d) - d.r - 30), x1 = d3.max(pts, d => X(d) + d.r + 30), y0 = d3.min(pts, d => Y(d) - d.r - 12), y1 = d3.max(pts, d => Y(d) + d.r + 36);
  let k = Math.min((a.w - pad * 2) / (x1 - x0), (a.h - pad * 2) / (y1 - y0));
  k = Math.max(.3, Math.min(k, focusPt ? 2.2 : 1.5));
  let cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  if (focusPt) { cx = cx * .5 + X(focusPt) * .5; cy = cy * .5 + Y(focusPt) * .5; }
  const t = d3.zoomIdentity.translate(a.x + a.w / 2 - k * cx, a.y + a.h / 2 - k * cy).scale(k);
  (dur === 0 || reduced ? svg : svg.transition().duration(dur ?? 850).ease(d3.easeCubicInOut)).call(zoom.transform, t);
  return k;
}
function aim(n, dur) {
  const c = clusterOf(n);
  if (!c) { placeLabels(null); return fit(nodes, null, dur); }
  placeLabels(c, fit([c, ...c.children], n.kind === 'child' ? n : null, dur), n);
}

/* ---------- selection, hover, and search highlight ---------- */
function select(n) {
  const c = clusterOf(n);
  svgEl.classList.toggle('focusing', !!c);
  if (n && n.kind === 'child') gNodes.filter(d => d === n).raise(); // draw it, and its label, above its neighbors (hubs stay put so Tab order holds)
  gNodes.classed('sel', d => d === n).classed('in', d => !!c && (d === c || d.parent === c || d.kind === 'me' || (n && adj.get(n.id).has(d.id))));
  gLinks.classed('in', l => !!c && (l.source === c || l.target === c || l.source.parent === c || l.target.parent === c || (n && (l.source === n || l.target === n))))
    .classed('flow', l => !!c && !reduced && (l.target === c || l.source === c));
  $$('#legend a').forEach(a => a.dataset.id === (c && c.id) ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
  // The Writing filter also filters the graph: posts outside the category or tag fade back.
  if (pane.dataset.filter && c && c.id === 'writing') { const f = new Set(pane.dataset.filter.split(' ')); gNodes.filter(d => d.parent === c).classed('in', d => f.has(d.id)); }
}
function showTip(n, x, y) {
  tip.replaceChildren();
  tip.style.setProperty('--c', n.color);
  const b = document.createElement('b'), s = document.createElement('span'), k = document.createElement('i');
  b.append(k, document.createTextNode(n.label)); s.textContent = n.meta || '';
  tip.append(b); if (n.meta) tip.append(s);
  const w = 280, left = Math.min(x + 14, innerWidth - w - 12);
  tip.style.left = left + 'px'; tip.style.top = Math.max(12, y - 12 - 44) + 'px';
  tip.classList.add('on');
}
function hover(n, ev) {
  svgEl.classList.toggle('hovering', !!n);
  if (!n) { tip.classList.remove('on'); return; }
  const nb = adj.get(n.id);
  gNodes.classed('hl', d => d === n || nb.has(d.id));
  gLinks.classed('hl', l => l.source === n || l.target === n);
  const r = ev && ev.clientX != null ? { x: ev.clientX, y: ev.clientY } : (() => { const b = svgEl.querySelector(`[data-id="${CSS.escape(n.id)}"]`).getBoundingClientRect(); return { x: b.right, y: b.top + b.height / 2 }; })();
  showTip(n, r.x, r.y);
}

/* ---------- panel: slide in, crossfade content ---------- */
const depth = n => !n ? 0 : n.kind === 'child' ? 2 : 1;
function setPanel(open) {
  panelOpen = open;
  panel.classList.toggle('open', open); panel.inert = !open;
  body.classList.toggle('panel-open', open);
  intro.classList.toggle('gone', open); intro.inert = open;
}
function swap(doc, dir) {
  const next = doc.getElementById('pane');
  const fresh = document.importNode(next, true), old = pane;
  old.removeAttribute('id');
  const inPlace = old.dataset.view === 'writing' && fresh.dataset.view === 'writing'; // a filter change: just the list
  pbody.append(fresh);
  pane = fresh;
  if (inPlace || reduced) old.remove();
  else {
    old.classList.add('leaving');
    const dx = dir > 0 ? -18 : dir < 0 ? 18 : 0;
    old.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translate(${dx}px, ${dir ? 0 : -6}px)` }], { duration: 160, easing: 'ease-in', fill: 'forwards' }).finished.then(() => old.remove(), () => old.remove());
    fresh.animate([{ opacity: 0, transform: `translate(${-dx}px, ${dir ? 0 : 10}px)` }, { opacity: 1, transform: 'none' }], { duration: 320, delay: 70, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
  }
  if (inPlace && !reduced) { const l = $('#plist', fresh); l && l.animate([{ opacity: .3 }, { opacity: 1 }], { duration: 220 }); }
  panel.classList.toggle('wide', fresh.hasAttribute('data-wide'));
  panel.classList.toggle('toc', fresh.hasAttribute('data-toc'));
  paneTitle = doc.title;
  hydrate(fresh);
  return inPlace;
}
// Mark the item a node opened: the heading and everything under it, up to the next heading of its level.
function mark(n, hash, scroll) {
  $$('.hl', pane).forEach(e => e.classList.remove('hl', 'hl-first', 'hl-last', 'flash'));
  let els = [];
  let id = hash.slice(1);
  try { id = decodeURIComponent(id); } catch (e) { /* a malformed escape: use it as is */ }
  const h = id && pane.querySelector('#' + CSS.escape(id));
  if (h && /^H[1-6]$/.test(h.tagName)) {
    const lvl = +h.tagName[1];
    els.push(h);
    for (let e = h.nextElementSibling; e && !(/^H[1-6]$/.test(e.tagName) && +e.tagName[1] <= lvl); e = e.nextElementSibling) els.push(e);
  } else if (n && n.match) {
    const a = $$('a', pane).find(x => x.getAttribute('href') === n.match);
    if (a) els.push(a.closest('li, p') || a);
  }
  if (!els.length) return null;
  els.forEach(e => e.classList.add('hl'));
  els[0].classList.add('hl-first'); els[els.length - 1].classList.add('hl-last');
  if (scroll) setTimeout(() => {
    els[0].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: n && n.match ? 'center' : 'start' });
    if (!reduced) els.forEach(e => e.classList.add('flash'));
  }, reduced ? 0 : 380);
  return els[0];
}
function show(n, { hash = '', first = false, dir = 0, scroll = true, focus = !first, focusEl = null } = {}) {
  cur = n;
  select(n);
  if (n || pane.dataset.path !== '/') { setPanel(true); document.title = paneTitle; }
  aim(n, first ? 0 : undefined);
  const target = mark(n, hash, scroll && (hash || (n && n.match)));
  if (focus) setTimeout(() => {
    const f = focusEl || (target && /^H[1-6]$/.test(target.tagName) ? target : $('h1', pane) || pane);
    if (!f.hasAttribute('tabindex')) f.setAttribute('tabindex', '-1');
    f.focus({ preventScroll: true });
  }, 60);
}
let quietFocus = false;
function closeGraph(push = true) {
  const from = cur;
  ++seq; // cancel a navigation still in flight
  if (push) { saveScroll(); history.pushState({ graph: true }, '', '/'); }
  cur = null; select(null); setPanel(false); aim(null);
  document.title = `${me.meta} | ${me.label}`;
  const back = from && svgEl.querySelector(`[data-id="${CSS.escape((from.kind === 'child' ? from.parent : from).id)}"]`);
  quietFocus = true; // a moved focus is not a hover: no tooltip, no dimming
  (back || svgEl.querySelector('[data-id="me"]')).focus({ preventScroll: true });
  quietFocus = false;
}

/* ---------- routing: real URLs through the History API ---------- */
const SITE = new Set([location.host, 'www.brooks-security.com', 'brooks-security.com']);
// An in-site page URL (path, plus any #anchor), or null for files, other sites, and the API.
function pageUrl(href) {
  if (!href || href[0] === '#') return null;
  let u; try { u = new URL(href, location.href); } catch (e) { return null; }
  if (!/^https?:$/.test(u.protocol) || !SITE.has(u.host) || !u.pathname.endsWith('/') || u.pathname.startsWith('/api/')) return null;
  return { path: u.pathname, hash: u.hash };
}
const nodeFor = (path, hash) => byUrl.get(path + hash) || (path === pane.dataset.path ? byId.get(pane.dataset.node) : byUrl.get(path)) || null;
const cache = new Map();
function load(path) {
  if (!cache.has(path)) cache.set(path, fetch(path, { credentials: 'same-origin' }).then(r => {
    if (!r.ok || !(r.headers.get('content-type') || '').includes('text/html')) throw new Error('not a page');
    return r.text();
  }).then(t => new DOMParser().parseFromString(t, 'text/html')).catch(e => { cache.delete(path); throw e; }));
  return cache.get(path);
}
const saveScroll = () => { try { history.replaceState({ ...(history.state || {}), scroll: pbody.scrollTop }, ''); } catch (e) { /* ignore */ } };
// Every history entry remembers its panel scroll, including ones the browser made for #anchor jumps.
let scrollT; pbody.addEventListener('scroll', () => { clearTimeout(scrollT); scrollT = setTimeout(saveScroll, 150); }, { passive: true });
addEventListener('pagehide', saveScroll);
document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[href^="#"]'); if (a && pane.contains(a)) { clearTimeout(scrollT); saveScroll(); } }, true);
let seq = 0;
async function go(path, hash = '', { push = true, node = null, scroll = null, keepFocus = null } = {}) {
  const token = ++seq, from = cur;
  let doc = null;
  if (path !== pane.dataset.path) {
    try { doc = await load(path); } catch (e) { if (token === seq) location.assign(path + hash); return; }
    if (token !== seq) return; // a later click won
    // A deploy happened since this page loaded: take the new bundle with a full load.
    if (!doc.getElementById('pane') || doc.documentElement.dataset.build !== root.dataset.build) { location.assign(path + hash); return; }
  }
  if (push) {
    saveScroll();
    const same = path + hash === location.pathname + location.hash && !(history.state && history.state.graph);
    if (same) history.replaceState({ ...(history.state || {}), path }, '', path + hash); // re-opening the current page adds no entry
    else history.pushState({ path }, '', path + hash);
  }
  const n = node || (doc ? byUrl.get(path + hash) || byId.get(doc.getElementById('pane').dataset.node) || null : nodeFor(path, hash));
  const dir = Math.sign(depth(n) - depth(from));
  const inPlace = doc ? swap(doc, dir) : false;
  if (doc || scroll != null) pbody.scrollTop = scroll || 0;
  show(n, { hash, dir, scroll: scroll == null, focusEl: inPlace && keepFocus ? $('#cats [aria-current]', pane) : null });
}
addEventListener('popstate', e => {
  if (!ready) return;
  const st = e.state || {};
  if (st.graph) { closeGraph(false); return; }
  go(location.pathname, location.hash, { push: false, scroll: st.scroll ?? null, keepFocus: !!(document.activeElement && document.activeElement.closest('#cats')) });
});
let pending = null, wantPal = false; // input that arrives while the graph is still laying out
document.addEventListener('click', e => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest && e.target.closest('a');
  if (!a) return;
  if (a.hasAttribute('data-graph')) { e.preventDefault(); if (ready) closeGraph(); else pending = 'graph'; return; }
  if (a.hasAttribute('download') || (a.getAttribute('target') || '_self') !== '_self') return;
  const to = pageUrl(a.getAttribute('href'));
  if (!to) return; // files, other sites, same-page #anchors: the browser handles them
  e.preventDefault();
  if (!ready) { // run it the moment the graph is ready, or as a plain page load if the graph never gets there
    pending = to;
    setTimeout(() => { if (!ready && pending === to) location.assign(to.path + to.hash); }, 2500);
    return;
  }
  const node = a.__data__ && a.__data__.url ? a.__data__ : null; // a graph node or a search result
  if (pal.open) pal.close();
  go(to.path, to.hash, { node, keepFocus: !!a.closest('#cats') });
});
// Warm the cache on hover or focus, so the panel swap feels instant.
const warm = e => { const a = e.target.closest && e.target.closest('a[href]'); const to = a && pageUrl(a.getAttribute('href')); if (to && to.path !== pane.dataset.path) load(to.path).catch(() => {}); };
document.addEventListener('pointerover', warm, { passive: true });
document.addEventListener('focusin', warm);
$('#close').addEventListener('click', () => { if (ready) closeGraph(); });
$('#fit').addEventListener('click', () => { if (ready) fit(nodes); });
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || !ready || e.defaultPrevented || pal.open) return;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return; // never throw away a half-written message
  if (tip.classList.contains('on')) { hover(null); return; }
  if (!panelOpen) return;
  // Step back out: an item to its hub, a page inside a hub to the hub, a hub to the bare graph.
  const up = cur && cur.kind === 'child' ? cur.parent.url : cur && cur.kind === 'cat' && pane.dataset.path !== cur.url ? cur.url : null;
  if (up) go(up); else closeGraph();
});
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (ready) { setPanel(panelOpen); aim(cur, 0); } }, 120); });

/* ---------- search: ⌘K or / opens it, and matching nodes light up in the graph ---------- */
const pal = $('#palette'), q = $('#pal-q'), list = $('#pal-list'), count = $('#pal-count');
let sel = 0, items = [];
function rank(query) {
  const words = query.split(/\s+/).filter(Boolean);
  return nodes.map(n => {
    const t = n.label.toLowerCase(), hay = `${t} ${n.meta.toLowerCase()} ${n.text || ''}`;
    if (!words.every(w => hay.includes(w))) return null;
    return { n, s: (t.startsWith(query) ? 20 : 0) + (t.includes(query) ? 10 : 0) + words.filter(w => t.includes(w)).length * 3 + (n.kind !== 'child' ? 1 : 0) };
  }).filter(Boolean).sort((a, b) => b.s - a.s).slice(0, 10).map(x => x.n);
}
function paint() {
  const query = q.value.trim().toLowerCase();
  items = query ? rank(query) : [me, ...cats];
  sel = Math.min(sel, Math.max(0, items.length - 1));
  list.innerHTML = items.length ? items.map((n, i) => `<li role="option" id="pal-o${i}" aria-selected="${i === sel}"><a href="${esc(n.url)}" tabindex="-1" style="--c:${n.color}"><i></i><span>${esc(n.label)}</span><span class="chip">${n.kind === 'child' ? esc(n.parent.label) : n.kind === 'me' ? 'About' : 'Category'}</span></a></li>`).join('')
    : `<li class="none" role="presentation">Nothing on the graph matches “${esc(q.value)}”.</li>`;
  $$('a', list).forEach((a, i) => { a.__data__ = items[i]; });
  items.length ? q.setAttribute('aria-activedescendant', 'pal-o' + sel) : q.removeAttribute('aria-activedescendant');
  count.textContent = query ? `${items.length} ${items.length === 1 ? 'result' : 'results'}` : '';
  svgEl.classList.toggle('searching', !!query);
  gNodes.classed('match', d => !!query && items.includes(d));
}
function openPal() { if (!ready) { wantPal = true; return; } if (pal.open) return; q.value = ''; sel = 0; paint(); pal.showModal(); q.focus(); }
q.addEventListener('input', () => { sel = 0; paint(); });
q.addEventListener('keydown', e => {
  if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && items.length) { e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; paint(); const o = $('[aria-selected="true"]', list); o && o.scrollIntoView({ block: 'nearest' }); }
  if (e.key === 'Enter' && items[sel]) { e.preventDefault(); const n = items[sel]; pal.close(); const to = pageUrl(n.url); go(to.path, to.hash, { node: n }); }
});
pal.addEventListener('close', () => { svgEl.classList.remove('searching'); gNodes.classed('match', false); });
pal.addEventListener('click', e => { if (e.target === pal) pal.close(); });
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-search]')) openPal(); });
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.open ? pal.close() : openPal(); }
  else if (e.key === '/' && !pal.open && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) { e.preventDefault(); openPal(); }
});

// Draw after first paint: the page is already readable, so the layout never delays it.
requestAnimationFrame(() => setTimeout(init, 0));
})();
