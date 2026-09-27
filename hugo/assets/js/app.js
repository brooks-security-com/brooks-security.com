/* Navigation.
 *
 * A panel is a page. In the design's reference every panel lived in the same document
 * and the router swapped them by hash, because a static file has no server. The site
 * has one, so every panel is a URL: /posts/, /posts/<slug>/, /credentials/. This fetches
 * the target, slides its <main> in the way the design's CSS already describes, and
 * pushes the real path. The markup does not change, the design keeps its motion, and
 * every page stays a page -- indexable, linkable, and readable with scripting off.
 *
 * The classes are the design's own: is-in, is-leaving-left, is-leaving-right,
 * is-visible, is-current. This file invents none of them.
 */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var DURATION = 520;

  var home = doc.querySelector('.home');
  var panel = doc.querySelector('main.panel');

  function idle() {
    return reduce.matches || !root.classList.contains('js');
  }

  /* -- reveal ---------------------------------------------------------------
     Anything marked data-inview fades up once, when it arrives. The CSS gates that on
     html.js, so with scripting off nothing is hidden waiting for a script. */
  var revealObserver = null;
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  }

  function wireReveals(scope) {
    var targets = (scope || doc).querySelectorAll('[data-inview]:not(.is-visible)');
    Array.prototype.forEach.call(targets, function (el) {
      if (revealObserver && !idle()) revealObserver.observe(el);
      else el.classList.add('is-visible');
    });
  }

  /* -- contents rail --------------------------------------------------------
     The rail beside the prose marks where the reader is. It is a navigator, so it says
     what you are looking at. */
  function wireSpy(scope) {
    var rail = (scope || doc).querySelector('.toc-rail');
    if (!rail || rail.dataset.spied) return;
    rail.dataset.spied = '1';
    var links = Array.prototype.slice.call(rail.querySelectorAll('a[href^="#"]'));
    var heads = links.map(function (a) {
      try { return doc.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))); }
      catch (e) { return null; }
    }).filter(Boolean);
    if (!heads.length) return;

    var ticking = false;
    function mark() {
      ticking = false;
      var current = heads[0].id;
      heads.forEach(function (h) {
        if (h.getBoundingClientRect().top <= 140) current = h.id;
      });
      links.forEach(function (a) {
        var id;
        try { id = decodeURIComponent(a.getAttribute('href').slice(1)); } catch (e) { id = ''; }
        a.classList.toggle('is-current', id === current);
      });
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(mark);
    }
    mark();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* -- the player -----------------------------------------------------------
     A poster, not an embed: nothing third-party loads until someone asks for the
     recording, and then the self-hosted file under it does the work. */
  function wirePlayers(scope) {
    Array.prototype.forEach.call((scope || doc).querySelectorAll('.player'), function (el) {
      if (el.dataset.wired) return;
      var video = el.querySelector('video');
      var button = el.querySelector('.player__btn');
      if (!video || !button) return;
      el.dataset.wired = '1';
      button.addEventListener('click', function () {
        el.classList.add('is-hot');
        button.hidden = true;
        var playing = video.play();
        if (playing && playing.catch) playing.catch(function () { /* controls are there */ });
      });
      video.addEventListener('play', function () { button.hidden = true; el.classList.add('is-hot'); });
      video.addEventListener('pause', function () { if (!video.ended) button.hidden = false; });
      video.addEventListener('ended', function () { button.hidden = false; el.classList.remove('is-hot'); });
    });
  }

  /* -- mermaid --------------------------------------------------------------
     Only pages with a diagram get this far, and the bundle is the site's own vendored
     copy, fetched the first time one is actually needed. */
  function ensureMermaid(scope) {
    if (!(scope || doc).querySelector('.mermaid')) return;
    if (doc.querySelector('script[data-mermaid]')) return;
    var src = doc.body.dataset.mermaid;
    if (!src) return;
    var s = doc.createElement('script');
    s.src = src;
    s.dataset.mermaid = '1';
    s.onload = function () {
      if (!window.mermaid) return;
      window.mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' });
      try { window.mermaid.run({ querySelector: '.mermaid' }); } catch (e) { /* leave the source readable */ }
    };
    doc.head.appendChild(s);
  }

  /* -- the panel ------------------------------------------------------------ */
  function focusTitle(el) {
    var t = el.querySelector('.ptitle, .detail__title');
    if (t) t.focus({ preventScroll: true });
  }

  function finish(el) {
    el.classList.remove('is-in', 'is-leaving-left', 'is-leaving-right');
    el.removeAttribute('aria-hidden');
    el.removeAttribute('inert');
    el.style.position = '';
    el.style.inset = '';
  }

  function showPanel(next, dir) {
    if (!panel) return;
    var old = panel;
    next.style.position = 'absolute';
    next.style.inset = '0';
    next.setAttribute('aria-hidden', 'true');
    old.parentNode.insertBefore(next, old.nextSibling);
    /* two frames: one to place it, one to move it, so the transition has a start */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        old.classList.add(dir < 0 ? 'is-leaving-right' : 'is-leaving-left');
        old.setAttribute('aria-hidden', 'true');
        old.setAttribute('inert', '');
        next.classList.add('is-in');
        setTimeout(function () {
          old.remove();
          finish(next);
          panel = next;
          wire(next, true);
        }, idle() ? 0 : DURATION);
      });
    });
  }

  function closePanel() {
    if (!panel || !home) return;
    var old = panel;
    old.classList.add('is-leaving-left');
    home.classList.remove('is-dim');
    doc.body.classList.remove('panel-open');
    setTimeout(function () {
      old.remove();
      panel = null;
      var first = home.querySelector('.row');
      if (first) first.focus({ preventScroll: true });
    }, idle() ? 0 : DURATION);
  }

  function wire(scope, fresh) {
    wireReveals(scope);
    wireSpy(scope);
    wirePlayers(scope);
    ensureMermaid(scope);
    if (fresh) focusTitle(scope);
  }

  /* -- fetch and swap ------------------------------------------------------- */
  var cache = Object.create(null);
  var pending = false;

  function get(url) {
    if (cache[url]) return Promise.resolve(cache[url]);
    return fetch(url, { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(function (text) {
        var parsed = new DOMParser().parseFromString(text, 'text/html');
        var main = parsed.querySelector('main.panel');
        if (!main) throw new Error('no panel in ' + url);
        cache[url] = { main: main, title: parsed.title };
        return cache[url];
      });
  }

  function go(url, dir, replace) {
    if (pending) return;
    pending = true;
    get(url).then(function (res) {
      var next = res.main.cloneNode(true);
      if (replace) history.replaceState({ panel: url }, '', url);
      else history.pushState({ panel: url }, '', url);
      doc.title = res.title;
      if (!panel && home) {
        /* arriving from the index: the index stays behind, dimmed, which is the point */
        home.classList.add('is-dim');
        doc.body.classList.add('panel-open');
        home.parentNode.insertBefore(next, home.nextSibling);
        panel = next;
        requestAnimationFrame(function () { finish(next); wire(next, true); });
      } else {
        showPanel(next, dir);
      }
      pending = false;
    }).catch(function () {
      pending = false;
      window.location.href = url;     /* the page is still a page: fall back to loading it */
    });
  }

  /* -- clicks --------------------------------------------------------------- */
  function internal(a, event) {
    if (!a || !a.href) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download') || a.dataset.noPanel !== undefined) return false;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return false;
    if (url.pathname === location.pathname && url.hash) return false;   /* an anchor on this page */
    return true;
  }

  doc.addEventListener('click', function (event) {
    var a = event.target.closest && event.target.closest('a');
    if (!internal(a, event)) return;

    var url = new URL(a.href, location.href);
    var toIndex = url.pathname === '/' && !url.hash;

    if (toIndex) {
      /* only in place when the index is actually behind this panel */
      if (home && panel) {
        event.preventDefault();
        history.pushState({ panel: null }, '', '/');
        closePanel();
      }
      return;                                   /* otherwise let the browser load it */
    }

    event.preventDefault();
    go(url.pathname + url.search + url.hash, panel ? 1 : 1, false);
  });

  /* -- history -------------------------------------------------------------- */
  window.addEventListener('popstate', function (event) {
    if (home && (!event.state || !event.state.panel)) { if (panel) closePanel(); return; }
    if (!event.state || !event.state.panel) return;
    var url = event.state.panel;
    if (panel && url === location.pathname) return;
    go(url, -1, true);
  });

  doc.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (panel && home) { history.pushState({ panel: null }, '', '/'); closePanel(); }
  });

  /* -- first paint ---------------------------------------------------------- */
  if (panel) doc.body.classList.add('panel-open');
  wire(doc, false);
  history.replaceState({ panel: panel ? location.pathname : null }, '', location.href);
})();
