/* O55.util — DOM helpers, a small keyed DOM morph (keeps focus, input values and running animations on unchanged
   nodes, so a state update never replays an entrance), live-region announcements and a disposer registry. */
(function () {
  'use strict';
  const O55 = window.O55;
  const U = O55.util = {};

  U.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  U.$ = (sel, root) => (root || document).querySelector(sel);
  U.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  let serial = 0;
  U.uid = (prefix) => `${prefix || 'o55'}-${Date.now().toString(36)}-${(++serial).toString(36)}`;
  U.clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.slug = (s) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  U.attrs = (obj) => Object.entries(obj || {}).filter(([, v]) => v !== false && v != null)
    .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${U.esc(v)}"`)).join('');
  U.icon = function icon(name, cls) {
    const map = window.PM_ICONS || {};
    const svg = map[name] || map.info || '';
    return `<span class="o55-ico${cls ? ' ' + cls : ''}" aria-hidden="true">${svg}</span>`;
  };

  /* Deterministic PRNG (mulberry32) so fixtures, fingerprints and sound noise are reproducible in films. */
  U.rng = function rng(seed) {
    let a = typeof seed === 'number' ? seed : U.hash(String(seed));
    return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  U.hash = function hash(str) { let h = 2166136261 >>> 0; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

  /* ---- morph ---------------------------------------------------------------------------------------------- */
  const keyOf = (n) => (n.nodeType === 1 ? n.getAttribute('data-key') : null);
  const same = (a, b) => a.nodeType === b.nodeType && (a.nodeType !== 1 || (a.tagName === b.tagName && (a.id || '') === (b.id || '')));

  function patchAttributes(a, b) {
    /* live hosts (data-morph-skip) keep attributes their owner added at runtime */
    if (!a.hasAttribute('data-morph-skip')) for (const { name } of Array.from(a.attributes)) if (!b.hasAttribute(name)) a.removeAttribute(name);
    for (const { name, value } of Array.from(b.attributes)) if (a.getAttribute(name) !== value) a.setAttribute(name, value);
    if (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT') {
      if (document.activeElement !== a && 'value' in b && a.value !== b.value) a.value = b.value;
      if (a.type === 'checkbox' || a.type === 'radio') a.checked = b.hasAttribute('checked');
    }
  }
  function patchNode(a, b) {
    if (a.nodeType === 3 || a.nodeType === 8) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
    patchAttributes(a, b);
    if (a.hasAttribute('data-morph-skip')) return;
    morphChildren(a, b);
  }
  function morphChildren(from, to) {
    const olds = Array.from(from.childNodes);
    const keyed = new Map();
    for (const n of olds) { const k = keyOf(n); if (k) keyed.set(k, n); }
    const used = new Set();
    const result = [];
    let oi = 0;
    for (const tn of Array.from(to.childNodes)) {
      const k = keyOf(tn);
      let match = null;
      if (k) { match = keyed.get(k) || null; if (match && used.has(match)) match = null; if (match && !same(match, tn)) match = null; }
      else {
        while (oi < olds.length && (used.has(olds[oi]) || keyOf(olds[oi]))) oi++;
        if (oi < olds.length && same(olds[oi], tn)) match = olds[oi++];
      }
      if (match) { used.add(match); patchNode(match, tn); result.push(match); } else result.push(tn);
    }
    for (const n of olds) if (!used.has(n)) from.removeChild(n);
    let ref = from.firstChild;
    for (const n of result) { if (n === ref) { ref = ref.nextSibling; continue; } from.insertBefore(n, ref); }
  }
  U.morph = function morph(target, html) {
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    morphChildren(target, tpl.content);
  };
  /* Morph from already-parsed nodes. SVG content must come through here: an SVG fragment parsed outside <svg> lands
     in the HTML namespace and renders nothing. */
  U.morphFrom = function morphFrom(target, sourceParent) { morphChildren(target, sourceParent); };

  /* ---- disposers ---------------------------------------------------------------------------------------------- */
  U.bag = function bag() {
    const fns = [];
    return {
      add(fn) { fns.push(fn); return fn; },
      on(el, ev, fn, opts) { el.addEventListener(ev, fn, opts); fns.push(() => el.removeEventListener(ev, fn, opts)); },
      dispose() { while (fns.length) { try { fns.pop()(); } catch (_) {} } }
    };
  };

  /* ---- announcements ------------------------------------------------------------------------------------------ */
  U.announce = function announce(text, root) {
    const host = root || document.getElementById('pm-o55-onboarding') || document.body;
    let live = host.querySelector(':scope > .o55-live');
    if (!live) { live = document.createElement('div'); live.className = 'o55-live'; live.setAttribute('aria-live', 'polite'); live.setAttribute('role', 'status'); host.appendChild(live); }
    live.textContent = '';
    window.setTimeout(() => { live.textContent = text; }, 30);
  };

  U.copyText = async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (_) {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (_) {} ta.remove(); return ok;
    }
  };
})();
