/* ==========================================================================
   Mockup 01 — "Typographic Index"

   One idea: the index stays put, the section slides over it. No page loads.
   Routing is hash-based, so every section is linkable, the back button works,
   and a section can be opened cold from a URL.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var SECTIONS = ['bio', 'talks', 'blogs', 'tech', 'work', 'contact'];
  var LABELS = {
    bio: 'Bio',
    talks: 'Talks',
    blogs: 'Blogs',
    tech: 'Tech',
    work: 'Work',
    contact: 'Contact'
  };
  var BASE_TITLE = 'Graham Brooks — Index';

  var panels = {};
  Array.prototype.forEach.call(document.querySelectorAll('.panel'), function (panel) {
    panels[panel.dataset.section] = panel;
  });

  var active = null;
  var lastTrigger = null;

  /* ---------- helpers ---------- */

  function nextFrame(fn) {
    requestAnimationFrame(function () {
      requestAnimationFrame(fn);
    });
  }

  function scrollerOf(panel) {
    return panel.querySelector('[data-scroll]');
  }

  function setInert(panel, isInert) {
    if (isInert) {
      panel.setAttribute('inert', '');
      panel.setAttribute('aria-hidden', 'true');
    } else {
      panel.removeAttribute('inert');
      panel.setAttribute('aria-hidden', 'false');
    }
  }

  function sectionFromHash() {
    var match = (location.hash || '').match(/^#\/([a-z]+)$/);
    return match && panels[match[1]] ? match[1] : null;
  }

  /* ---------- the one transition ---------- */

  function openSection(name, options) {
    var opts = options || {};
    var dir = opts.dir === undefined ? 1 : opts.dir;
    var animate = opts.animate !== false;
    var push = opts.push !== false;

    var next = panels[name];
    if (!next || name === active) { return; }

    if (active) {
      var prev = panels[active];
      prev.classList.remove('is-in');
      prev.classList.add(dir >= 0 ? 'is-leaving-left' : 'is-leaving-right');
      setInert(prev, true);
    }

    // Park the incoming panel where it should enter from.
    next.classList.remove('is-in', 'is-leaving-left', 'is-leaving-right');
    next.classList.add(dir >= 0 ? 'is-leaving-right' : 'is-leaving-left');

    var scroller = scrollerOf(next);
    if (scroller) { scroller.scrollTop = 0; }
    setInert(next, false);

    var paint = function () {
      next.classList.remove('is-leaving-left', 'is-leaving-right');
      next.classList.add('is-in');
      var title = next.querySelector('[tabindex="-1"]');
      if (title) { title.focus({ preventScroll: true }); }
    };

    if (animate) { nextFrame(paint); } else { paint(); }

    active = name;
    root.setAttribute('data-active', name);
    document.title = LABELS[name] ? 'Graham Brooks — ' + LABELS[name] : BASE_TITLE;
    setProgress(next, 0);

    if (push) {
      history.pushState({ section: name }, '', '#/' + name);
    }
  }

  function closeSection(options) {
    var opts = options || {};
    if (!active) { return; }

    var panel = panels[active];
    panel.classList.remove('is-in', 'is-leaving-left');
    panel.classList.add('is-leaving-right');
    setInert(panel, true);

    if (lastTrigger && document.contains(lastTrigger)) {
      lastTrigger.focus({ preventScroll: true });
    }

    active = null;
    root.removeAttribute('data-active');
    document.title = BASE_TITLE;

    if (opts.push !== false) {
      history.pushState({ section: null }, '', location.pathname + location.search);
    }
  }

  /* ---------- progress rule inside a panel ---------- */

  function setProgress(panel, ratio) {
    var bar = panel.querySelector('.panel__progress i');
    if (bar) { bar.style.transform = 'scaleX(' + ratio + ')'; }
  }

  function wireProgress(panel) {
    var scroller = scrollerOf(panel);
    if (!scroller) { return; }
    var ticking = false;
    scroller.addEventListener('scroll', function () {
      if (ticking) { return; }
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var max = scroller.scrollHeight - scroller.clientHeight;
        setProgress(panel, max > 4 ? Math.min(1, scroller.scrollTop / max) : 0);
      });
    }, { passive: true });
  }

  /* ---------- reveal on entry / on scroll ---------- */

  function wireReveals() {
    var targets = document.querySelectorAll('[data-inview]');
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '-4% 0px -10% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(targets, function (el) { observer.observe(el); });
  }

  /* ---------- input ---------- */

  function wireLinks() {
    document.addEventListener('click', function (event) {
      var closer = event.target.closest('[data-close]');
      if (closer) {
        event.preventDefault();
        closeSection();
        return;
      }
      var link = event.target.closest('a[data-section]');
      if (!link) { return; }
      var name = link.dataset.section;
      if (!panels[name]) { return; }
      event.preventDefault();
      if (name === active) { return; }
      lastTrigger = link;
      var from = active ? SECTIONS.indexOf(active) : -1;
      openSection(name, { dir: from >= 0 && SECTIONS.indexOf(name) < from ? -1 : 1 });
    });
  }

  function wireKeys() {
    document.addEventListener('keydown', function (event) {
      if (!active || event.metaKey || event.ctrlKey || event.altKey) { return; }
      var tag = (event.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || event.target.isContentEditable) { return; }
      if (event.key === 'Escape' || event.key === 'ArrowLeft') {
        event.preventDefault();
        closeSection();
      }
    });
  }

  function wireSwipe() {
    var start = null;
    Array.prototype.forEach.call(document.querySelectorAll('.panel'), function (panel) {
      panel.addEventListener('pointerdown', function (event) {
        if (event.pointerType === 'mouse') { return; }
        start = { x: event.clientX, y: event.clientY, id: event.pointerId };
      });
      panel.addEventListener('pointerup', function (event) {
        if (!start || event.pointerId !== start.id) { return; }
        var dx = event.clientX - start.x;
        var dy = event.clientY - start.y;
        start = null;
        if (Math.abs(dy) > 70 || Math.abs(dx) < 90) { return; }
        if (dx > 0) { closeSection(); return; }
        var at = SECTIONS.indexOf(active);
        if (at > -1 && at < SECTIONS.length - 1) {
          openSection(SECTIONS[at + 1], { dir: 1 });
        }
      });
      panel.addEventListener('pointercancel', function () { start = null; });
    });
  }

  function wireHistory() {
    window.addEventListener('popstate', function () {
      var name = sectionFromHash();
      if (!name) { closeSection({ push: false }); return; }
      if (name === active) { return; }
      var from = active ? SECTIONS.indexOf(active) : -1;
      openSection(name, {
        push: false,
        dir: from >= 0 && SECTIONS.indexOf(name) < from ? -1 : 1
      });
    });
  }

  function wireGalleryLink() {
    // The gallery lives on the bare hostname (no variant port / path).
    Array.prototype.forEach.call(document.querySelectorAll('[data-gallery]'), function (link) {
      link.href = location.protocol + '//' + location.hostname + '/';
    });
  }

  /* ---------- init ---------- */

  Array.prototype.forEach.call(document.querySelectorAll('.panel'), function (panel) {
    wireProgress(panel);
  });
  wireReveals();
  wireLinks();
  wireKeys();
  wireSwipe();
  wireHistory();
  wireGalleryLink();

  var initial = sectionFromHash();
  if (initial) {
    history.replaceState({ section: initial }, '', '#/' + initial);
    openSection(initial, { animate: false, push: false });
  }
})();
