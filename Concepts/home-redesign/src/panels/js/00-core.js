/* PMW core: the namespace, small DOM helpers, an event emitter, storage, the look, and motion.
   Every file in src/panels/js shares one strict scope (tools/home_layer.py wraps them together), so the helpers here
   are plain functions. Public API: window.PM_HOME (CONTRACT.md); engine internals for tests: window.PMW. */

var PMW = window.PMW = window.PMW || {};
var PM_HOME = window.PM_HOME = window.PM_HOME || {};
PMW.version = 1;
PM_HOME.contractVersion = 1;

var doc = document, root = doc.documentElement;

/* ---- DOM ---- */
function h(tag, attrs, kids) {
  var el = doc.createElement(tag);
  if (attrs) {
    for (var k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') { for (var s in v) el.style.setProperty(s, v[s]); }
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  if (kids != null) append(el, kids);
  return el;
}
function append(el, kids) {
  if (kids == null || kids === false) return el;
  if (Array.isArray(kids)) { for (var i = 0; i < kids.length; i++) append(el, kids[i]); return el; }
  el.appendChild(typeof kids === 'string' || typeof kids === 'number' ? doc.createTextNode(String(kids)) : kids);
  return el;
}
function qs(sel, from) { return (from || doc).querySelector(sel); }
function qsa(sel, from) { return Array.prototype.slice.call((from || doc).querySelectorAll(sel)); }
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function rectOf(el) { var r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }
function setAttr(el, name, value) {
  if (value == null || value === false) { if (el.hasAttribute(name)) el.removeAttribute(name); return; }
  var v = value === true ? '' : String(value);
  if (el.getAttribute(name) !== v) el.setAttribute(name, v);
}
function setText(el, text) { text = String(text == null ? '' : text); if (el.textContent !== text) el.textContent = text; }

/* ---- events ---- */
function emitter() {
  var map = {};
  return {
    on: function (name, fn) {
      (map[name] = map[name] || []).push(fn);
      return function () { var a = map[name]; if (!a) return; var i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); };
    },
    emit: function (name, data) {
      var a = (map[name] || []).slice();
      for (var i = 0; i < a.length; i++) {
        try { a[i](data); } catch (err) { try { console.error('[pm-home] listener for ' + name + ' failed', err); } catch (_) {} }
      }
    }
  };
}
var bus = PMW.bus = emitter();
PM_HOME.on = function (name, fn) { return bus.on(name, fn); };

/* ---- frame batching ---- */
var frameQueue = [], frameId = 0;
function nextFrame(fn) {
  frameQueue.push(fn);
  if (!frameId) frameId = requestAnimationFrame(function () {
    frameId = 0;
    var q = frameQueue; frameQueue = [];
    for (var i = 0; i < q.length; i++) { try { q[i](); } catch (err) { try { console.error('[pm-home] frame task failed', err); } catch (_) {} } }
  });
}

/* ---- storage (never throws; a failed write reports false) ---- */
var store = PMW.store = {
  get: function (key) {
    try { var raw = localStorage.getItem(key); return raw == null ? null : JSON.parse(raw); } catch (_) { return null; }
  },
  set: function (key, value) {
    try {
      if (PMW.faults && PMW.faults.failNextWrite) { PMW.faults.failNextWrite = false; return false; }
      var raw = JSON.stringify(value);
      localStorage.setItem(key, raw);
      return localStorage.getItem(key) === raw;
    } catch (_) { return false; }
  },
  remove: function (key) { try { localStorage.removeItem(key); } catch (_) {} }
};
PMW.faults = { failNextWrite: false };

function projectId() {
  var label = qs('#projectMenuLabel');
  var name = label && label.textContent ? label.textContent.trim() : '';
  return (name || 'tastebook').toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
}
PMW.projectId = projectId;

/* ---- look ---- */
function look() {
  var theme = root.getAttribute('data-theme') || 'basic-dark';
  var m = /^([a-z]+)-(light|dark)$/.exec(theme);
  return {
    family: m ? m[1] : 'basic',
    mode: m ? m[2] : 'dark',
    nier: root.getAttribute('data-o55-nier') === 'on',
    reduced: reducedMotion()
  };
}
function reducedMotion() {
  if (root.getAttribute('data-motion') === 'reduced') return true;
  try {
    if (window.O55 && O55.motion && typeof O55.motion.reduced === 'function') return !!O55.motion.reduced();
  } catch (_) {}
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { return false; }
}
PMW.look = look;
PMW.reduced = reducedMotion;
PM_HOME.look = look;

(function watchLook() {
  var last = JSON.stringify(look());
  var mo = new MutationObserver(function () {
    var now = JSON.stringify(look());
    if (now === last) return;
    last = now;
    nextFrame(function () { bus.emit('look', look()); });
  });
  mo.observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier', 'data-o55-nier-parts', 'data-motion'] });
  try {
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function () { bus.emit('look', look()); });
  } catch (_) {}
})();

/* ---- motion tokens (ms); every duration is 0 under Reduced Motion ---- */
var MOTION = PMW.MOTION = { fast: 120, med: 180, slow: 260, settle: 200 };
function dur(name) { return reducedMotion() ? 0 : (MOTION[name] || 0); }
PMW.dur = dur;

/* ---- announcements (one polite live region of our own) ---- */
var liveEl = null, liveTimer = 0;
function announce(text) {
  if (!text) return;
  if (!liveEl) {
    liveEl = h('p', { id: 'pmw-live', class: 'pmw-sr', role: 'status', 'aria-live': 'polite' });
    doc.body.appendChild(liveEl);
  }
  clearTimeout(liveTimer);
  liveEl.textContent = '';
  liveTimer = setTimeout(function () { liveEl.textContent = text; }, 30);
}
PMW.announce = announce;
PM_HOME.announce = announce;

/* ---- the overlay root (CONTRACT section 14) ---- */
function overlay() {
  var el = qs('#pmw-overlay');
  if (!el) { el = h('div', { id: 'pmw-overlay' }); doc.body.appendChild(el); }
  return el;
}
PMW.overlay = overlay;

/* ---- id helpers ---- */
var uidSeq = 0;
function uid(prefix) { uidSeq += 1; return (prefix || 'u') + uidSeq.toString(36); }
PMW.uid = uid;

/* ---- platform ---- */
var IS_MAC = /Mac|iPhone|iPad/.test(navigator.platform || '') || /Mac OS X/.test(navigator.userAgent || '');
PMW.isMac = IS_MAC;
function keyLabel(combo) {
  if (!combo) return '';
  if (!IS_MAC) return combo;
  return combo.replace(/Ctrl\+/g, '⌘').replace(/Alt\+/g, '⌥').replace(/Shift\+/g, '⇧');
}
PMW.keyLabel = keyLabel;
