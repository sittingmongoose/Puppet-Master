/* PMF Product Onboarding — core: namespace, utilities, storage, motion flags.
   Concept simulation. State and motion are expressed as data (poses, phases,
   commands) so the model ports to Slint properties/timers/commands. */
(function () {
  'use strict';
  if (window.PMF_ONBOARDING) return;

  var PMF = window.PMF_ONBOARDING = {
    schema_id: 'pm.onboarding.pmf.concept_api.v1',
    concept_simulation_only: true,
    version: '2026-09-04',
    storage_key: 'pmf.onboarding.v1',
    receipts: [],
    commands: [],
    events: []
  };

  // ---- utils ---------------------------------------------------------------
  var U = PMF.util = {};
  U.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  U.$ = function (sel, root) { return (root || document).querySelector(sel); };
  U.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  U.h = function (strings) { // tagged template: values escaped unless wrapped by U.raw
    var out = strings[0];
    for (var i = 1; i < arguments.length; i++) {
      var v = arguments[i];
      if (v && v.__raw) out += v.__raw;
      else if (Array.isArray(v)) out += v.map(function (x) { return x && x.__raw ? x.__raw : U.esc(x); }).join('');
      else out += U.esc(v);
      out += strings[i];
    }
    return { __raw: out };
  };
  U.raw = function (s) { return { __raw: String(s) }; };
  U.str = function (r) { return r && r.__raw != null ? r.__raw : String(r == null ? '' : r); };
  // Global motion time scale (concept/film instrumentation): 1 = real time, 4 = quarter speed.
  U.timeScale = function () { var v = window.__pmfTimeScale; return v > 0 ? v : 1; };
  U.sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms * U.timeScale()); }); };
  U.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  U.lerp = function (a, b, t) { return a + (b - a) * t; };
  U.uid = function (p) { return (p || 'pmf') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); };
  U.clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  U.now = function () { return new Date().toISOString(); };
  U.family = function () {
    var t = document.documentElement.getAttribute('data-theme') || 'friendly-dark';
    return t.split('-')[0];
  };
  U.mode = function () {
    var t = document.documentElement.getAttribute('data-theme') || 'friendly-dark';
    return /light$/.test(t) ? 'light' : 'dark';
  };
  U.reduced = function () {
    var de = document.documentElement;
    if (de.getAttribute('data-reduced-motion') === '1' || de.getAttribute('data-motion') === 'reduced') return true;
    try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  };
  // easing library (shared by the art tweens; theme picks the curve)
  var E = U.ease = {
    linear: function (t) { return t; },
    outQuint: function (t) { return 1 - Math.pow(1 - t, 5); },
    outCubic: function (t) { return 1 - Math.pow(1 - t, 3); },
    inOutCubic: function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    inOutSine: function (t) { return -(Math.cos(Math.PI * t) - 1) / 2; },
    outBack: function (t) { var c1 = 1.2, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    steps: function (n) { return function (t) { return Math.min(1, Math.floor(t * n + 1e-9) / n + (t >= 1 ? 0 : 0)); }; },
    // critically-damped-ish spring approximation with gentle overshoot
    spring: function (t) { return t >= 1 ? 1 : 1 - Math.exp(-4.6 * t) * Math.cos(5.6 * t); }
  };
  U.easeFor = function (family, kind) {
    // kind: 'move' | 'in' | 'out'
    if (family === 'retro') return kind === 'out' ? E.steps(4) : E.steps(7);
    if (family === 'basic') return kind === 'move' ? E.inOutCubic : E.outCubic;
    if (family === 'glass') return kind === 'move' ? E.inOutSine : E.outQuint;
    return kind === 'move' ? E.spring : E.outQuint; // friendly
  };
  U.durFor = function (family, kind) {
    var base = { move: 720, in: 520, out: 260 }[kind] || 500;
    var mul = { friendly: 1, glass: 1.25, retro: .85, basic: .7 }[family] || 1;
    if (U.reduced()) return 1;
    return Math.round(base * mul * U.timeScale());
  };

  // ---- storage (draft + completion) -----------------------------------------
  var S = PMF.store = {};
  S.read = function () { try { return JSON.parse(localStorage.getItem(PMF.storage_key) || 'null'); } catch (e) { return null; } };
  S.write = function (obj) { try { localStorage.setItem(PMF.storage_key, JSON.stringify(obj)); return true; } catch (e) { return false; } };
  S.clear = function () { try { localStorage.removeItem(PMF.storage_key); } catch (e) {} };

  // ---- receipts / commands / events (observable, truthful) ------------------
  PMF.command = function (id, payload) {
    var rec = { command_id: id, at: U.now(), idempotency_key: U.uid('idem'), payload: payload || {} };
    PMF.commands.push(rec);
    if (PMF.commands.length > 400) PMF.commands.shift();
    return rec;
  };
  PMF.receipt = function (kind, status, detail) {
    var rec = { receipt_id: U.uid('rcpt'), kind: kind, status: status, at: U.now(), detail: detail || {} };
    PMF.receipts.push(rec);
    if (PMF.receipts.length > 400) PMF.receipts.shift();
    return rec;
  };
  PMF.emit = function (name, detail) {
    var ev = { name: name, at: U.now(), detail: detail || {} };
    PMF.events.push(ev);
    if (PMF.events.length > 400) PMF.events.shift();
    try { document.dispatchEvent(new CustomEvent('pmf.onboarding.' + name, { detail: detail || {} })); } catch (e) {}
  };

  // ---- icons (inline SVG, stroke currentColor; no glyph fonts, no emoji) ---
  function ic(body, vb) { return '<svg viewBox="' + (vb || '0 0 24 24') + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>'; }
  PMF.icons = {
    check: ic('<path d="M5 12.5l4.2 4.2L19 7"/>'),
    x: ic('<path d="M6 6l12 12M18 6L6 18"/>'),
    laptop: ic('<rect x="3.5" y="5" width="17" height="11" rx="2"/><path d="M2 19h20"/>'),
    server: ic('<rect x="4" y="3.5" width="16" height="7" rx="1.6"/><rect x="4" y="13.5" width="16" height="7" rx="1.6"/><path d="M8 7h.01M8 17h.01"/>'),
    device: ic('<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M11 18h2"/>'),
    folder: ic('<path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h4l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>'),
    cloud: ic('<path d="M7 18.5h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.2 9.6 4.5 4.5 0 0 0 7 18.5z"/>'),
    spark: ic('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>'),
    shield: ic('<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/>'),
    layers: ic('<path d="M12 4l8 4-8 4-8-4z"/><path d="M4 12l8 4 8-4"/><path d="M4 16l8 4 8-4"/>'),
    plus: ic('<path d="M12 5v14M5 12h14"/>'),
    back: ic('<path d="M15 6l-6 6 6 6"/>'),
    next: ic('<path d="M9 6l6 6-6 6"/>'),
    key: ic('<circle cx="8" cy="14" r="4"/><path d="M11 11l8-8M15 5l3 3"/>'),
    globe: ic('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17"/>'),
    search: ic('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/>'),
    edit: ic('<path d="M4 20h4l10-10-4-4L4 16z"/><path d="M13 7l4 4"/>'),
    external: ic('<path d="M14 4h6v6M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>'),
    lock: ic('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    wifi: ic('<path d="M3 9.5a13 13 0 0 1 18 0M6.5 13a8 8 0 0 1 11 0M10 16.5a3 3 0 0 1 4 0"/><path d="M12 20h.01"/>'),
    qr: ic('<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h3v3h-3zM17 17h3v3h-3zM20 14h.01M14 20h.01"/>'),
    clock: ic('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    warn: ic('<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.5h.01"/>'),
    info: ic('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>'),
    play: ic('<path d="M8 5.5v13l10-6.5z"/>'),
    refresh: ic('<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/>'),
    home: ic('<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>'),
    branch: ic('<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="8" r="2.5"/><path d="M6 8.5v7M18 10.5c0 4-12 2-12 5"/>'),
    box: ic('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>'),
    sun: ic('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>'),
    moon: ic('<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>'),
    sparkles: ic('<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M5 17l.8 2.2L8 20l-2.2.8L5 23l-.8-2.2L2 20l2.2-.8z"/><path d="M19 15l.6 1.6 1.6.6-1.6.6L19 19.4l-.6-1.6-1.6-.6 1.6-.6z"/>'),
    users: ic('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4.5-6.2"/>'),
    copy: ic('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/>'),
    download: ic('<path d="M12 4v11M7 10l5 5 5-5"/><path d="M4 19h16"/>'),
    terminal: ic('<path d="M5 7l5 5-5 5M12 17h7"/>'),
    file: ic('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>'),
    chevron: ic('<path d="M6 9l6 6 6-6"/>'),
    tour: ic('<path d="M4 5h16v11H4z"/><path d="M9 20h6M12 16v4"/><path d="M10 8.5l4 2.5-4 2.5z"/>'),
    wand: ic('<path d="M15 4l5 5L7 22 2 17z"/><path d="M14 5l5 5"/><path d="M18 2l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>')
  };
  PMF.icon = function (name) { return U.raw(PMF.icons[name] || PMF.icons.info); };
})();
