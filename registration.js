/* ==========================================================================
   HardSec 2026 — registration (driven entirely by config.js)
   - While registration is closed: buttons say "opens soon" and nothing else changes.
   - When config.registration.open = true and formUrl is set: every register
     button points to the form, labels switch, and the form can be embedded.
   - When config.participants.csvUrl is set: a table of the configured columns
     from the published Google Sheet appears (see README for privacy notes).
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var cfg = window.HARDSEC_CONFIG || {};
  var reg = cfg.registration || {};
  var parts = cfg.participants || {};

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function isHttp(url) { return /^https?:\/\//i.test(url || ''); }
  function safe(name, fn) {
    try { fn(); } catch (err) { if (window.console) console.warn('[HardSec] ' + name + ' failed:', err); }
  }

  /* ---------- registration open / closed ---------- */
  safe('registration', function () {
    var isOpen = reg.open === true && isHttp(reg.formUrl);

    $$('[data-register]').forEach(function (a) {
      var label = isOpen ? (a.getAttribute('data-open-label') || reg.openLabel) : (a.getAttribute('data-closed-label') || reg.closedLabel);
      if (label) a.innerHTML = label;
      if (isOpen) {
        a.setAttribute('href', reg.formUrl);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      }
    });

    $$('[data-open-only]').forEach(function (el) { el.hidden = !isOpen; });

    var seat = $('[data-seat]');
    if (seat) seat.innerHTML = isOpen ? seat.getAttribute('data-open-label') : seat.getAttribute('data-closed-label');

    var btn = $('#reg-btn');
    var pill = $('#reg-pill');
    var title = $('#reg-title');
    var text = $('#reg-text');
    var note = $('#reg-note');
    var faq = $('[data-reg-faq]');

    if (!isOpen) return;

    if (btn) {
      btn.textContent = (reg.openLabel || 'Register now') + ' →';
      btn.href = reg.formUrl;
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer';
      btn.removeAttribute('aria-disabled');
    }
    if (pill) pill.textContent = 'Registration open';
    if (title && reg.openHeading) title.textContent = reg.openHeading;
    if (text && reg.openText) text.textContent = reg.openText;
    if (note && reg.openNote) note.textContent = reg.openNote;
    if (faq) faq.textContent = 'Registration is open now. Use the Register button on this page to fill in the form.';

    if (isHttp(reg.embedUrl)) {
      var box = $('#reg-embed');
      if (box) {
        var frame = doc.createElement('iframe');
        frame.src = reg.embedUrl;
        frame.title = 'HardSec 2026 registration form';
        frame.loading = 'lazy';
        box.appendChild(frame);
        box.hidden = false;
      }
    }
  });

  /* ---------- registered participants (optional) ---------- */
  safe('participants', function () {
    if (!isHttp(parts.csvUrl)) return;
    var section = $('#registered');
    var table = $('#registered-table');
    var count = $('#registered-count');
    if (!section || !table) return;

    var heading = $('h2', section);
    if (heading && parts.heading) heading.textContent = parts.heading;

    /* Minimal RFC 4180 CSV parser: handles quotes, escaped quotes, commas and newlines in cells. */
    function parseCsv(text) {
      var rows = [], row = [], cell = '', i = 0, q = false, c;
      text = text.replace(/^﻿/, '');
      while (i < text.length) {
        c = text.charAt(i);
        if (q) {
          if (c === '"') {
            if (text.charAt(i + 1) === '"') { cell += '"'; i++; } else { q = false; }
          } else { cell += c; }
        } else if (c === '"') { q = true; }
        else if (c === ',') { row.push(cell); cell = ''; }
        else if (c === '\n' || c === '\r') {
          if (c === '\r' && text.charAt(i + 1) === '\n') i++;
          row.push(cell); cell = '';
          if (row.length > 1 || row[0] !== '') rows.push(row);
          row = [];
        } else { cell += c; }
        i++;
      }
      if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
      return rows;
    }

    function render(rows) {
      if (rows.length < 2) return;
      var head = rows[0].map(function (h) { return h.trim(); });
      var wanted = (parts.columns && parts.columns.length ? parts.columns : head.slice(0, 2));
      var idx = wanted.map(function (name) { return head.indexOf(name); });
      var cols = wanted.filter(function (_, k) { return idx[k] > -1; });
      idx = idx.filter(function (n) { return n > -1; });
      if (!cols.length) return;

      var thead = $('thead', table), tbody = $('tbody', table);
      thead.textContent = '';
      tbody.textContent = '';

      var hr = doc.createElement('tr');
      cols.forEach(function (name) {
        var th = doc.createElement('th');
        th.scope = 'col';
        th.textContent = name; // textContent: sheet data can never inject markup
        hr.appendChild(th);
      });
      thead.appendChild(hr);

      var shown = 0;
      rows.slice(1).forEach(function (r) {
        var first = (r[idx[0]] || '').trim();
        if (!first) return;
        var tr = doc.createElement('tr');
        idx.forEach(function (n) {
          var td = doc.createElement('td');
          td.textContent = (r[n] || '').trim();
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
        shown++;
      });
      if (count) count.textContent = shown + ' registered so far';
      section.hidden = false;
    }

    fetch(parts.csvUrl, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(function (t) { render(parseCsv(t)); })
      .catch(function (err) { if (window.console) console.warn('[HardSec] participants list unavailable:', err); });
  });
})();
