/* ==========================================================================
   HardSec 2026 — page behaviour
   Plain script (no modules), so the site also works when index.html is opened
   straight from disk. Every feature is wrapped so one failure cannot stop the
   others, and the page is fully readable without JavaScript.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var cfg = window.HARDSEC_CONFIG || {};
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function safe(name, fn) {
    try { fn(); } catch (err) { if (window.console) console.warn('[HardSec] ' + name + ' failed:', err); }
  }

  /* ---------- mobile menu (hamburger) ---------- */
  safe('menu', function () {
    var header = $('#site-header');
    var toggle = $('#menu-toggle');
    var menu = $('#mobile-menu');
    if (!header || !toggle || !menu) return;

    function setOpen(open) {
      header.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) { menu.removeAttribute('inert'); } else { menu.setAttribute('inert', ''); }
    }
    setOpen(false);

    toggle.addEventListener('click', function () {
      setOpen(!header.classList.contains('menu-open'));
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) setOpen(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('menu-open')) {
        setOpen(false);
        toggle.focus({ preventScroll: true });
      }
    });
    doc.addEventListener('click', function (e) {
      if (header.classList.contains('menu-open') && !header.contains(e.target)) setOpen(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1080) setOpen(false);
    });
  });

  /* ---------- scroll progress, back-to-top, header state ---------- */
  safe('scroll', function () {
    var bar = $('#prog');
    var top = $('#to-top');
    var ticking = false;

    function update() {
      var h = root.scrollHeight - window.innerHeight;
      var y = window.pageYOffset || root.scrollTop || 0;
      if (bar) bar.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
      if (top) top.classList.toggle('show', y > 700);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();

    if (top) {
      top.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }
  });

  /* ---------- scroll-spy: highlight the current section in both menus ---------- */
  safe('scrollspy', function () {
    var links = $$('.nav-links a, .mobile-menu li a');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) {
      var id = (a.getAttribute('href') || '').replace('#', '');
      if (!id) return;
      (map[id] = map[id] || []).push(a);
    });
    var visible = {};
    var order = Object.keys(map);

    function paint() {
      var current = null;
      order.forEach(function (id) { if (visible[id]) current = id; });
      links.forEach(function (a) { a.classList.remove('active'); a.removeAttribute('aria-current'); });
      if (current) {
        map[current].forEach(function (a) { a.classList.add('active'); a.setAttribute('aria-current', 'true'); });
      }
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
      paint();
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
    order.forEach(function (id) {
      var el = doc.getElementById(id);
      if (el) io.observe(el);
    });
  });

  /* ---------- reveal on scroll ---------- */
  safe('reveal', function () {
    var items = $$('.rv');
    function showAll() { items.forEach(function (el) { el.classList.add('in'); }); }
    if (!('IntersectionObserver' in window)) { showAll(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    items.forEach(function (el) { io.observe(el); });
  });

  /* ---------- countdown ---------- */
  safe('countdown', function () {
    var start = cfg.event && cfg.event.start ? new Date(cfg.event.start).getTime() : NaN;
    var box = $('#countdown');
    if (!box) return;
    if (isNaN(start)) { box.hidden = true; return; }
    var d = $('#cd-days'), h = $('#cd-hours'), m = $('#cd-mins'), s = $('#cd-secs');
    var timer;

    function pad(n) { return n < 10 ? '0' + n : String(n); }
    function tick() {
      var diff = start - Date.now();
      if (diff <= 0) {
        box.hidden = true;
        clearInterval(timer);
        return;
      }
      var secs = Math.floor(diff / 1000);
      d.textContent = pad(Math.floor(secs / 86400));
      h.textContent = pad(Math.floor((secs % 86400) / 3600));
      m.textContent = pad(Math.floor((secs % 3600) / 60));
      s.textContent = pad(secs % 60);
    }
    tick();
    timer = setInterval(tick, 1000);
  });

  /* ---------- "Break the cipher" decode effect ---------- */
  safe('decode', function () {
    var el = $('#decode');
    if (!el || reduceMotion) return;
    var text = el.getAttribute('data-text') || el.textContent;
    var chars = 'ABCDEF0123456789#$%&@';
    var frame = 0;
    var total = text.length * 3;
    var started = false;

    function run() {
      if (started) return;
      started = true;
      var id = setInterval(function () {
        frame++;
        var out = '';
        for (var i = 0; i < text.length; i++) {
          if (text[i] === ' ') { out += ' '; continue; }
          out += i < frame / 3 ? text[i] : chars.charAt(Math.floor(Math.random() * chars.length));
        }
        el.textContent = out;
        if (frame >= total) { clearInterval(id); el.textContent = text; }
      }, 40);
    }
    setTimeout(run, 500);
  });

  /* ---------- count-up numbers ---------- */
  safe('counters', function () {
    var els = $$('[data-count]');
    if (!els.length || reduceMotion || !('IntersectionObserver' in window)) return;

    function fmt(n) { return n.toLocaleString('en-US'); }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target;
        var end = parseInt(el.getAttribute('data-count'), 10);
        var t0 = null;
        function step(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min(1, (ts - t0) / 1200);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(Math.round(end * eased));
          if (p < 1) window.requestAnimationFrame(step); else el.textContent = fmt(end);
        }
        window.requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  });

  /* ---------- team: show the first few, "Show more" reveals the rest ---------- */
  safe('team', function () {
    var list = $('#team-list');
    var wrap = $('#team-more');
    var btn = $('#team-toggle');
    if (!list || !wrap || !btn) return;
    var LIMIT = parseInt(list.getAttribute('data-limit'), 10) || 4;
    var members = $$('.member', list);
    if (members.length <= LIMIT) return;

    var extra = members.slice(LIMIT);
    var expanded = false;

    function apply() {
      extra.forEach(function (m) { m.hidden = !expanded; });
      btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      btn.textContent = expanded ? 'Show fewer' : 'Show more (' + extra.length + ')';
    }
    wrap.hidden = false;
    apply();
    btn.addEventListener('click', function () {
      expanded = !expanded;
      apply();
      if (!expanded) {
        var sec = $('#team');
        if (sec && sec.getBoundingClientRect().top < 0) sec.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- copy e-mail buttons ---------- */
  safe('copy', function () {
    $$('[data-copy]').forEach(function (btn) {
      var original = btn.textContent;
      btn.addEventListener('click', function () {
        var value = btn.getAttribute('data-copy');
        function done(ok) {
          btn.textContent = ok ? 'Copied' : 'Press Ctrl+C';
          setTimeout(function () { btn.textContent = original; }, 1800);
        }
        function fallback() {
          var ta = doc.createElement('textarea');
          ta.value = value;
          ta.setAttribute('readonly', '');
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          doc.body.appendChild(ta);
          ta.select();
          var ok = false;
          try { ok = doc.execCommand('copy'); } catch (e) { ok = false; }
          doc.body.removeChild(ta);
          done(ok);
        }
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(value).then(function () { done(true); }, fallback);
        } else {
          fallback();
        }
      });
    });
  });

  /* ---------- footer: year and optional GitHub link ---------- */
  safe('footer', function () {
    var y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
    var repo = $('#repo-link');
    var wrap = $('#repo-wrap');
    if (repo && wrap && cfg.githubUrl) {
      repo.href = cfg.githubUrl;
      wrap.hidden = false;
    }
  });
})();
