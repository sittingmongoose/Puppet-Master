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
  /* The neon glyph set draws first (pm7-glyphs D44, rollout ONBOARDING step 1; Usage's 00-core.js is the worked
     example). NEON maps each PM_ICONS name to its glyph (the catalog's "Shell icons (PM_ICONS)" group: every map.json
     row with table T-core, field glyph). U.icon asks window.PMG first and keeps PM_ICONS only as the fallback for
     names PMG cannot draw. NEON_ROLE is the glyph's own role (control for an interactive affordance: close, expand,
     restart, pen, gear, toolbox, branch and the sound pair, mirroring Usage and the rail where the same name appears;
     concept for everything else). NEON_SIZE is empty on purpose: no caller passes a class (the one call site is
     U.icon(b.icon) in 60-ui-core.js) and no CSS rule sizes .o55-ico or its svg, so every glyph renders at the default
     16 with explicit width/height (the PM_ICONS svgs carry neither). The neon svg string is cached per (glyph, size,
     role); no box size changes. window.PM_ICONS itself is never changed: the Planning Wizard and the Orchestrator
     read it and get no adoption. */
  const NEON = {
    palette: 'palette', brain: 'brain', shield: 'shield', terminal: 'terminal', puzzle: 'puzzle',
    clipboard: 'clipboard', branch: 'branch', film: 'film', globe: 'globe', masks: 'users',
    toolbox: 'wrench', gear: 'settings', wave: 'hand', search: 'search', star: 'star',
    scales: 'scales', sparkle: 'sparkles', restart: 'refresh', check: 'check', checkCircle: 'check-circle',
    close: 'close', soundOn: 'speaker', soundOff: 'speaker-off', folder: 'folder', home: 'home',
    robot: 'robot', wand: 'wand', plant: 'sprout', party: 'party', plug: 'plug',
    bolt: 'lightning', telescope: 'telescope', dial: 'gauge', warning: 'warning', rocket: 'rocket',
    info: 'info', layers: 'layers', bell: 'bell', lock: 'lock', expand: 'expand',
    pen: 'edit', comment: 'chat'
  };
  const NEON_ROLE = {
    restart: 'control', close: 'control', gear: 'control', toolbox: 'control', pen: 'control',
    expand: 'control', branch: 'control', soundOn: 'control', soundOff: 'control'
  };
  const NEON_SIZE = {};
  const ICON_CACHE = Object.create(null);
  const roleFor = (name) => NEON_ROLE[name] || 'concept';
  /* the size for a class list: the first token NEON_SIZE knows, else 16 (Usage's sizeOf; no caller passes one) */
  const sizeOf = (cls) => {
    const t = String(cls || '').split(/\s+/);
    for (let i = 0; i < t.length; i++) if (NEON_SIZE[t[i]]) return NEON_SIZE[t[i]];
    return 16;
  };
  U.icon = function icon(name, cls) {
    /* only names in NEON go to PMG: an unmapped name always draws its own PM_ICONS drawing, even if PMG ever
       gains a glyph of that name (t3-usage-pm7 review, 2026-10-11) */
    const map = window.PM_ICONS || {};
    const G = window.PMG, g = name ? NEON[name] : '';
    let svg = '';
    if (g && G && typeof G.has === 'function' && G.has(g)) {
      const role = roleFor(name), size = sizeOf(cls), key = g + '|' + size + '|' + role;
      svg = ICON_CACHE[key];
      if (!svg) {
        try { svg = G.icon(g, size, 'nx-r-' + role); } catch (_) { svg = ''; }
        if (svg) ICON_CACHE[key] = svg;
      }
    }
    if (!svg) svg = map[name] || map.info || '';
    return `<span class="o55-ico${cls ? ' ' + cls : ''}" aria-hidden="true">${svg}</span>`;
  };
  /* The window's own drawings ask the neon set the same way (rollout ONBOARDING, round 2): U.nx draws one glyph, U.mark
     one status mark of the shared vocabulary; each returns '' when PMG cannot draw it, so its caller keeps the drawing
     it had. Both strings are cached per argument list (the screens re-render on every state change), in the form the
     browser serialises them (a host that compares a slot's innerHTML with a fresh string, as the sound and look slots
     do, then finds it unchanged, and U.morph sees no difference). A mark is lit and still (nx-still: it draws on once
     and never loops) unless `moving` is set: only working moves. */
  const NX_CACHE = Object.create(null);
  const serialised = (html) => {
    if (!html || typeof document === 'undefined') return html || '';
    const t = document.createElement('template'); t.innerHTML = html; return t.innerHTML;
  };
  U.nx = function nx(glyph, size, role, cls) {
    const G = window.PMG;
    if (!glyph || !G || typeof G.has !== 'function' || !G.has(glyph)) return '';
    const key = 'g|' + glyph + '|' + size + '|' + role + '|' + (cls || '');
    if (NX_CACHE[key] == null) {
      try { NX_CACHE[key] = serialised(G.icon(glyph, size, 'nx-r-' + role + (cls ? ' ' + cls : ''))); } catch (_) { NX_CACHE[key] = ''; }
    }
    return NX_CACHE[key];
  };
  U.mark = function mark(status, size, cls, moving) {
    const G = window.PMG;
    if (!status || !G || typeof G.hasStatus !== 'function' || !G.hasStatus(status)) return '';
    const c = (moving ? '' : 'nx-still') + (cls ? (moving ? '' : ' ') + cls : '');
    const key = 's|' + status + '|' + size + '|' + c;
    if (NX_CACHE[key] == null) {
      try { NX_CACHE[key] = serialised(G.status(status, size, c)); } catch (_) { NX_CACHE[key] = ''; }
    }
    return NX_CACHE[key];
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
      /* A protected field's template never carries what was typed (it is never stored), so a same-screen redraw (typing
         in another field, a ? note, Plain English or Expert, a demo hint) keeps what the person typed there; it is
         emptied only when the screen says nothing was typed (data-o55-typed="false"), when its action reads it, or with
         the screen itself (a new screen, Back) (final check FO-6). */
      const kept = a.hasAttribute('data-o55-protected') && b.hasAttribute('data-o55-protected') && b.value === '' && b.getAttribute('data-o55-typed') !== 'false';
      if (document.activeElement !== a && 'value' in b && a.value !== b.value && !kept) a.value = b.value;
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

  /* A page whose permissions policy blocks the clipboard (a sandboxed preview, T3's file preview) logs a policy
     violation on every writeText even though the rejection is caught: there it goes straight to the fallback */
  const clipboardBlocked = () => { try { const p = document.permissionsPolicy || document.featurePolicy; return !!p && typeof p.allowsFeature === 'function' && !p.allowsFeature('clipboard-write'); } catch (_) { return false; } };
  U.copyText = async function copyText(text) {
    try { if (clipboardBlocked() || !navigator.clipboard) throw new Error('blocked'); await navigator.clipboard.writeText(text); return true; } catch (_) {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (_) {} ta.remove(); return ok;
    }
  };
})();
