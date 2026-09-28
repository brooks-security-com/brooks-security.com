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

  var $ = function (sel, el) { return (el || doc).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(sel)); };

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
     A poster with the control over it, and the file is not requested until someone asks
     for the recording. The <video> is built on the click: an empty one sitting in the
     markup is a black rectangle as tall as the poster, which reads as a broken embed. */
  function wirePlayers(scope) {
    Array.prototype.forEach.call((scope || doc).querySelectorAll('.player'), function (el) {
      if (el.dataset.wired) return;
      var button = el.querySelector('.player__btn');
      var src = el.dataset.video;
      if (!button || !src) return;
      el.dataset.wired = '1';
      button.addEventListener('click', function () {
        var video = el.querySelector('video');
        if (!video) {
          video = doc.createElement('video');
          video.controls = true;
          video.playsInline = true;
          video.preload = 'auto';
          if (el.dataset.poster) video.poster = el.dataset.poster;
          video.src = src;
          el.appendChild(video);
        }
        el.classList.add('is-hot');
        button.hidden = true;
        var playing = video.play();
        if (playing && playing.catch) playing.catch(function () { /* the controls are there */ });
      });
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

  /* -- the contact form -----------------------------------------------------
     Carried across from the graph-era script, because what it does is not graph-era:
     POST /api/contact with a reCAPTCHA Enterprise token and the honeypot field, a
     single completion path, and a hard fifteen-second timeout so the button can
     never be left saying "Sending...". A half-written message survives a wander
     through the panels via sessionStorage.

     It binds whatever panel is on screen, and it is called again after every swap:
     markup that arrives by fetch has its <script> tags dropped, so anything that
     lives in the page has to be bound from here or it is dead on arrival. */
  var recaptchaP = null;
  function loadRecaptcha(key) {
    if (recaptchaP) return recaptchaP;
    recaptchaP = new Promise(function (ok, no) {
      var s = doc.createElement('script');
      s.src = 'https://www.google.com/recaptcha/enterprise.js?render=' + encodeURIComponent(key);
      s.onload = function () { ok(); };
      s.onerror = function () { recaptchaP = null; no(); };
      doc.head.appendChild(s);
    });
    return recaptchaP;
  }

  function bindContact(scope) {
    var form = $('form.contact-form', scope);
    if (!form || form.dataset.bound) return;
    form.dataset.bound = '1';
    var statusEl = $('.contact-status', form);
    var btn = $('.contact-submit', form);
    var siteKey = form.dataset.sitekey;
    var EMAIL = 'graham@brooks-security.com';
    var val = function (name) {
      var el = form.elements[name];
      return el && el.value ? el.value.trim() : '';
    };
    var setStatus = function (msg, kind) {
      statusEl.textContent = msg;
      statusEl.className = 'contact-status' + (kind ? ' is-' + kind : '');
    };
    loadRecaptcha(siteKey).catch(function () {});   /* start early; a failure is reported on submit */

    var FIELDS = ['name', 'email', 'subject', 'message'];
    var KEY = 'contact-draft';
    try {
      var d = JSON.parse(sessionStorage.getItem(KEY) || '{}');
      FIELDS.forEach(function (f) { if (d[f] && form.elements[f]) form.elements[f].value = d[f]; });
    } catch (e) { /* no storage */ }
    var saveDraft = function () {
      try {
        sessionStorage.setItem(KEY, JSON.stringify(FIELDS.reduce(function (o, f) {
          o[f] = form.elements[f] ? form.elements[f].value : '';
          return o;
        }, {})));
      } catch (e) { /* no storage */ }
    };
    var dropDraft = function () { try { sessionStorage.removeItem(KEY); } catch (e) { /* no storage */ } };
    form.addEventListener('input', saveDraft);

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      /* Honeypot tripped: say thank you, send nothing. */
      if (form.elements.company && form.elements.company.value) {
        form.reset();
        setStatus('Thanks, your message is on its way.', 'ok');
        return;
      }

      btn.disabled = true;
      setStatus('Sending...', 'pending');
      dropDraft();

      var done = false;
      var timer = setTimeout(function () {
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
      var blocked = function () {
        finish('The verification script could not load (an ad blocker may be blocking it). '
               + 'Please email me directly at ' + EMAIL + '.', 'error', false);
      };

      loadRecaptcha(siteKey).then(function () {
        if (done) return;
        var g = window.grecaptcha;
        if (!g || !g.enterprise) { blocked(); return; }
        g.enterprise.ready(function () {
          if (done) return;
          g.enterprise.execute(siteKey, { action: 'contact' }).then(function (token) {
            return done ? null : fetch('/api/contact', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: val('name'), email: val('email'), subject: val('subject'), message: val('message'),
                company: form.elements.company ? form.elements.company.value : '',
                token: token
              })
            });
          }).then(function (res) {
            if (!res) return;
            if (res.ok) { finish("Thanks, your message is on its way. I'll be in touch.", 'ok', true); return; }
            res.json().catch(function () { return {}; }).then(function (b) {
              finish(b.error || ('Something went wrong. Please email me directly at ' + EMAIL + '.'), 'error', false);
            });
          }).catch(function () {
            finish('Network error. Please email me directly at ' + EMAIL + '.', 'error', false);
          });
        });
      }, blocked);
    });
  }

  /* -- the panel ------------------------------------------------------------ */
  function focusTitle(el) {
    var t = el.querySelector('.ptitle, .detail__title');
    if (t) t.focus({ preventScroll: true });
  }

  /* Focus handed back to a row by script is not focus earned by the keyboard, and
     WebKit cannot tell the difference: it matches :focus-visible for any script
     focus, which is how the accent ring ended up around the whole Bio row on iOS
     the moment a reader came back to the index. The attribute marks that moment, and
     the first key press or the moment focus leaves clears it -- so a reader who
     really does Tab into the index still gets the ring. The keydown listener runs
     before the browser moves focus, so the row the Tab lands on is drawn normally. */
  function returnFocus(el) {
    var release = function () {
      el.removeAttribute('data-returning');
      el.removeEventListener('blur', release);
      el.removeEventListener('keydown', release);
    };
    el.setAttribute('data-returning', '');
    el.addEventListener('blur', release);
    el.addEventListener('keydown', release);
    el.focus({ preventScroll: true });
  }

  function finish(el) {
    /* is-in is the visible state, not the transition: a panel that loses it is a panel
       at opacity 0 with pointer-events off. Only the leaving classes come off here. */
    el.classList.add('is-in');
    el.classList.remove('is-leaving-left', 'is-leaving-right');
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
      if (first) returnFocus(first);
    }, idle() ? 0 : DURATION);
  }

  function wire(scope, fresh) {
    wireReveals(scope);
    wireSpy(scope);
    wirePlayers(scope);
    bindContact(scope);
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
  if (panel) { panel.classList.add('is-in'); doc.body.classList.add('panel-open'); }
  wire(doc, false);
  history.replaceState({ panel: panel ? location.pathname : null }, '', location.href);
})();
