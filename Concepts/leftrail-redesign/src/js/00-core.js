/* PMR core: the shared helpers every rail concept builds on (window.PMR).
   Concept files run in their own wrapper and use only window.PMR; core files share one scope. */

const PMR = window.PMR = window.PMR || {};
PMR.version = 'polish-published-2026-10-09';

/* ---------- DOM builder ------------------------------------------------------------------------------------------ */
/* h('div.pmr-row.is-open', { attrs }, child, [children], 'text')
   attrs: class (string|array), text, html, style (string|object), on: { click: fn }, dataset: {}, any attribute.
   null/false/undefined children are skipped; strings become text nodes. */
function h(spec, attrs, ...kids) {
  const m = /^([a-z0-9-]+)?((?:\.[\w-]+)*)(?:#([\w-]+))?$/i.exec(spec || 'div') || [];
  const el = document.createElement(m[1] || 'div');
  if (m[2]) el.className = m[2].slice(1).split('.').join(' ');
  if (m[3]) el.id = m[3];
  if (attrs && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) { kids.unshift(attrs); attrs = null; }
  if (attrs) {
    for (const k of Object.keys(attrs)) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') { const c = Array.isArray(v) ? v.filter(Boolean).join(' ') : v; if (c) el.className = (el.className ? el.className + ' ' : '') + c; }
      else if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style') { if (typeof v === 'string') el.style.cssText = v; else for (const s of Object.keys(v)) { if (s.startsWith('--')) el.style.setProperty(s, v[s]); else el.style[s] = v[s]; } }
      else if (k === 'on') { for (const ev of Object.keys(v)) el.addEventListener(ev, v[ev]); }
      else if (k === 'dataset') { for (const d of Object.keys(v)) if (v[d] != null) el.dataset[d] = v[d]; }
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, String(v));
    }
  }
  append(el, kids);
  return el;
}
function append(el, kids) {
  for (const k of kids) {
    if (k == null || k === false) continue;
    if (Array.isArray(k)) append(el, k);
    else el.appendChild(k instanceof Node ? k : document.createTextNode(String(k)));
  }
  return el;
}
PMR.h = h;
PMR.append = append;

/* ---------- icons ------------------------------------------------------------------------------------------------ */
/* PM_ICONS names (see DATA.md). Returns <span class="pmr-ico"> holding the SVG; unknown names render an empty box so
   the layout never jumps. The neon glyph set (pm7-glyphs, RAIL) draws first: NEON maps each rail name to its glyph
   (the map's "Rail and Settings bridge" group, T-bridge, plus T-jj's undo/oplog, which reach icon() through
   menus). SIZE is the static render size per icon class (never measured: the boxes stay exactly as the CSS sizes
   them) and ROLE the glyph's own role. The file-type icons draw as the page, alert as the warning mark; a name
   PMG cannot draw keeps the old drawing. */
const NEON = {
  folder: 'folder', chevL: 'chevron-left', scissors: 'scissors', clipboard: 'clipboard', eyeOff: 'eye-off',
  compose: 'compose', chat: 'chat', files: 'folder', search: 'search', source: 'branch', actions: 'pipeline',
  docker: 'container', tests: 'check-circle', agents: 'robot', artifacts: 'archive', chevD: 'chevron-down',
  chevR: 'chevron-right', x: 'close', plus: 'plus', minus: 'minus', check: 'check', warn: 'warning', info: 'info',
  refresh: 'refresh', external: 'open', diff: 'diff', merge: 'merge', pr: 'pull-request', trash: 'trash',
  play: 'play', stop: 'stop', eye: 'eye', copy: 'copy', terminal: 'terminal', cog: 'settings', filter: 'filter',
  clock: 'clock', layers: 'layers', flame: 'flame', upload: 'upload', link: 'link', user: 'user',
  spark: 'sparkles', bell: 'bell', pull: 'download', push: 'upload', fetch: 'swap', branch: 'branch',
  stash: 'stash', folderOpen: 'folder', globe: 'globe', monitor: 'monitor', pin: 'pin', key: 'key',
  book: 'notebook', camera: 'camera', file: 'page', arrowUp: 'arrow-up', arrowDn: 'arrow-down', grip: 'grip',
  edit: 'edit', filePlus: 'file-plus', folderPlus: 'folder-plus', boxMinus: 'minus', boxPlus: 'plus',
  pause: 'pause', stepOver: 'step-over', stepInto: 'step-into', stepOut: 'step-out', bpLine: 'bp-line',
  bpCond: 'bp-cond', bpLog: 'bp-log', undo: 'undo', oplog: 'history', alert: 'st-warning',
  rust: 'page', svelte: 'page', sql: 'page', md: 'page', ts: 'page', toml: 'page', yml: 'page', xml: 'page',
};
const NEON_ROLE = {
  folder: 'concept', chevL: 'control', scissors: 'concept', clipboard: 'concept', eyeOff: 'control',
  compose: 'concept', chat: 'concept', files: 'concept', search: 'concept', source: 'control', actions: 'concept',
  docker: 'concept', tests: 'concept', agents: 'concept', artifacts: 'control', chevD: 'control',
  chevR: 'control', x: 'control', plus: 'control', minus: 'control', check: 'concept', warn: 'concept',
  info: 'concept', refresh: 'control', external: 'control', diff: 'control', merge: 'control', pr: 'concept',
  trash: 'control', play: 'control', stop: 'control', eye: 'concept', copy: 'control', terminal: 'concept',
  cog: 'control', filter: 'control', clock: 'concept', layers: 'concept', flame: 'concept', upload: 'concept',
  link: 'control', user: 'concept', spark: 'concept', bell: 'concept', pull: 'concept', push: 'concept',
  fetch: 'control', branch: 'control', stash: 'control', folderOpen: 'concept', globe: 'concept',
  monitor: 'concept', pin: 'control', key: 'concept', book: 'concept', camera: 'concept', file: 'concept',
  arrowUp: 'control', arrowDn: 'control', grip: 'control', edit: 'control', filePlus: 'control',
  folderPlus: 'control', boxMinus: 'control', boxPlus: 'control', pause: 'control', stepOver: 'control',
  stepInto: 'control', stepOut: 'control', bpLine: 'concept', bpCond: 'concept', bpLog: 'concept',
  undo: 'control', oplog: 'concept', alert: 'concept',
  rust: 'concept', svelte: 'concept', sql: 'concept', md: 'concept', ts: 'concept', toml: 'concept',
  yml: 'concept', xml: 'concept',
};
/* the review switcher's own classes are not listed: rail_layer keeps their prefix out of the published page,
   so the switcher (review-only) takes the default size */
const NEON_SIZE = {
  'pmr-btn-ico': 15, 'pmr-mi-ico': 15, 'pmr-mi-sub': 13, 'pmr-trigger-ico': 14, 'pmr-trigger-chev': 14,
  'pmr-c-act-ico': 16, 'pmr-c-act-chev': 14, 'pmr-c-mini-ico': 14,
  'pmr-c-rico': 16, 'pmr-c-filter-ico': 14, 'pmr-c-lens-kick-ico': 14, 'pmr-c-chev': 12,
  'pmr-c-title-chev': 14, 'pmr-c-footline-ico': 15, 'pmr-c-footline-chev': 14, 'pmr-c-sync-chev': 13,
  'pmr-b-act-ico': 16, 'pmr-b-act-chev': 14, 'pmr-b-chev': 14, 'pmr-b-crumbsep': 12, 'pmr-b-disc-chev': 12,
  'pmr-b-port-ico': 14, 'pmr-b-title-chev': 14, 'pmr-b-back-ico': 16, 'pmr-b-twist': 12, 'pmr-b-ficon': 16,
  'pmr-b-filter-ico': 14, 'd-plus': 13, 'd-select-ico': 16, 'd-select-chev': 12, 'd-fold-chev': 13,
};
PMR.neonMap = NEON;
PMR.neonRole = NEON_ROLE;
function icon(name, cls) {
  const s = h('span', { class: ['pmr-ico', cls], 'aria-hidden': 'true', 'data-ico-name': name || '' });
  let svg = '';
  const G = window.PMG, g = (name && NEON[name]) || name;
  if (g && G && G.has(g)) svg = G.icon(g, NEON_SIZE[cls] || 16, 'nx-r-' + (NEON_ROLE[name] || 'concept'));
  if (!svg) {
    try { if (name && typeof window.PMIcon === 'function') svg = window.PMIcon(name) || ''; } catch (e) { svg = ''; }
    if (!svg && name && window.PM_ICONS && typeof window.PM_ICONS[name] === 'string') svg = window.PM_ICONS[name];
  }
  if (svg) s.innerHTML = svg;
  return s;
}
PMR.icon = icon;

/* ---------- hover tags ------------------------------------------------------------------------------------------- */
/* The shell's hover-tag layer (PMHoverTag) reads data-pm-hover-label / -detail. Never use a bare title. */
function hover(el, label, detail) {
  if (!el || !label) return el;
  el.setAttribute('data-pm-hover-label', label);
  if (detail) el.setAttribute('data-pm-hover-detail', detail);
  if (!el.getAttribute('aria-label') && !el.textContent.trim()) el.setAttribute('aria-label', label);
  return el;
}
PMR.hover = hover;

/* ---------- actions ---------------------------------------------------------------------------------------------- */
/* An Action (DATA.md) becomes contract attributes. The document-level PM_DEMO router dispatches data-demo-action
   clicks, so a rendered element only has to carry the attributes. */
function actionAttrs(a) {
  if (!a) return {};
  const o = {};
  if (a.cmd) o['data-demo-action'] = a.cmd;
  if (a.arg != null && a.arg !== '') o['data-demo-arg'] = a.arg;
  if (a.commandId) o['data-command-id'] = a.commandId;
  if (a.uiActionId) o['data-ui-action-id'] = a.uiActionId;
  if (a.availability) o['data-availability'] = a.availability;
  if (a.disabledReason) o['data-disabled-reason'] = a.disabledReason;
  if (a.disabled) { o['aria-disabled'] = 'true'; o['data-demo-reason'] = a.disabled; }
  if (a.canon) o['data-canon'] = a.canon;
  if (a.attrs) for (const k of Object.keys(a.attrs)) o[k] = a.attrs[k];
  return o;
}
PMR.actionAttrs = actionAttrs;

/* button(action, { variant: 'text' | 'icon' | 'primary' | 'quiet' | 'row', label?: false, cls }) */
function button(a, opts) {
  opts = opts || {};
  const variant = opts.variant || 'text';
  const showLabel = opts.label !== false && variant !== 'icon';
  const el = h('button', Object.assign({ type: 'button', class: ['pmr-btn', 'pmr-btn-' + variant, a.danger && 'is-danger', a.primary && 'is-primary', opts.cls] }, actionAttrs(a)),
    a.icon ? icon(a.icon, 'pmr-btn-ico') : null,
    showLabel ? h('span.pmr-btn-label', { text: a.label }) : null,
    showLabel && a.key ? h('kbd.pmr-key', { text: a.key }) : null);
  if (!showLabel) hover(el, a.label, a.disabled || (a.key ? a.key : ''));
  else if (a.disabled) hover(el, a.label, a.disabled);
  if (a.menu && opts.menus && opts.menus[a.menu]) {
    el.setAttribute('aria-haspopup', 'menu');
    el.addEventListener('click', ev => { ev.preventDefault(); PMR.menu.toggle(opts.menus[a.menu], el, { menus: opts.menus }); });
  }
  return el;
}
PMR.button = button;

/* ---------- small utilities -------------------------------------------------------------------------------------- */
PMR.util = {
  clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
  uid: (() => { let n = 0; return p => (p || 'pmr') + '-' + (++n).toString(36); })(),
  raf: fn => window.requestAnimationFrame(fn),
  frames: n => new Promise(res => { let i = 0; const step = () => (++i >= (n || 1) ? res() : window.requestAnimationFrame(step)); window.requestAnimationFrame(step); }),
  debounce(fn, ms) { let t = 0; return function () { const args = arguments, self = this; clearTimeout(t); t = setTimeout(() => fn.apply(self, args), ms); }; },
  plural: (n, one, many) => n + ' ' + (n === 1 ? one : (many || one + 's')),
  flatten(items) { const out = []; (function walk(list, depth) { (list || []).forEach(it => { out.push({ item: it, depth }); if (it.children) walk(it.children, depth + 1); }); })(items, 0); return out; },
  /* middle-truncate a file name but keep the extension visible (Files readability, deep-dive recommendation) */
  midName(name, max) {
    if (!name || name.length <= max) return name;
    const dot = name.lastIndexOf('.');
    const ext = dot > 0 && name.length - dot <= 8 ? name.slice(dot) : '';
    const stem = ext ? name.slice(0, dot) : name;
    const budget = Math.max(4, max - ext.length - 1);
    const head = Math.ceil(budget * 0.6), tail = budget - head;
    return stem.slice(0, head) + '…' + (tail > 0 ? stem.slice(stem.length - tail) : '') + ext;
  },
};

/* ---------- motion ----------------------------------------------------------------------------------------------- */
/* Every scripted animation goes through Element.animate, which the shell's Animation speed setting already scales.
   Durations come from the theme family so each family keeps its personality (Retro snaps, Friendly hops, Glass glides). */
const FAMILY_MOTION = {
  basic:    { fast: 140, med: 220, slow: 320, ease: 'cubic-bezier(.22,1,.36,1)', spring: 'cubic-bezier(.3,1.25,.5,1)', steps: 0 },
  friendly: { fast: 160, med: 260, slow: 380, ease: 'cubic-bezier(.22,1,.36,1)', spring: 'cubic-bezier(.34,1.56,.64,1)', steps: 0 },
  glass:    { fast: 180, med: 300, slow: 420, ease: 'cubic-bezier(.16,1,.3,1)', spring: 'cubic-bezier(.22,1.2,.36,1)', steps: 0 },
  retro:    { fast: 100, med: 160, slow: 220, ease: 'steps(3, end)', spring: 'steps(4, end)', steps: 4 },
};
PMR.motion = {
  reduced() {
    const de = document.documentElement;
    return de.getAttribute('data-motion') === 'reduced' || de.getAttribute('data-reduced-motion') === '1'
      || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  },
  family() {
    if (document.documentElement.getAttribute('data-o55-nier') === 'on') return 'basic';
    const t = document.documentElement.getAttribute('data-theme') || 'basic-dark';
    return t.split('-')[0] in FAMILY_MOTION ? t.split('-')[0] : 'basic';
  },
  nier() { return document.documentElement.getAttribute('data-o55-nier') === 'on'; },
  spec() { return FAMILY_MOTION[this.family()]; },
  /* animate(el, keyframes, { dur: 'fast'|'med'|'slow'|ms, ease: 'ease'|'spring'|css, delay }) -> Animation | null */
  animate(el, frames, o) {
    if (!el || !el.animate) return null;
    o = o || {};
    if (this.reduced()) { try { const last = frames[frames.length - 1]; if (last && o.keep) Object.assign(el.style, last); } catch (e) { /* ignore */ } return null; }
    const s = this.spec();
    const dur = typeof o.dur === 'number' ? o.dur : (s[o.dur || 'med'] || s.med);
    const ease = o.ease === 'spring' ? s.spring : (o.ease && o.ease !== 'ease' ? o.ease : s.ease);
    try { return el.animate(frames, { duration: dur, easing: ease, delay: o.delay || 0, fill: o.fill || 'both' }); } catch (e) { return null; }
  },
  /* FLIP: measure, mutate, play the difference */
  flip(els, mutate, o) {
    const list = Array.from(els || []);
    const first = new Map(list.map(el => [el, el.getBoundingClientRect()]));
    mutate();
    if (this.reduced()) return;
    list.forEach(el => {
      const a = first.get(el), b = el.getBoundingClientRect();
      const dx = a.left - b.left, dy = a.top - b.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      this.animate(el, [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], Object.assign({ dur: 'med', ease: 'spring', fill: 'none' }, o));
    });
  },
  /* entrance stagger: runs once per call, never on scroll */
  stagger(nodes, o) {
    o = o || {};
    const list = Array.from(nodes || []).slice(0, o.max || 18);
    const step = o.step != null ? o.step : (this.family() === 'retro' ? 0 : 22);
    list.forEach((n, i) => this.animate(n, o.frames || [{ opacity: 0, transform: `translateY(${o.dy != null ? o.dy : 6}px)` }, { opacity: 1, transform: 'none' }],
      { dur: o.dur || 'med', ease: o.ease || 'ease', delay: i * step, fill: 'backwards' }));
  },
  /* height tween to the measured size (expanders): open/close a body element */
  height(el, open, o) {
    if (!el) return null;
    o = o || {};
    if (this.reduced()) { el.style.height = open ? '' : '0px'; el.hidden = !open; return null; }
    el.hidden = false;
    const from = el.getBoundingClientRect().height;
    el.style.height = open ? 'auto' : '0px';
    const to = open ? el.scrollHeight : 0;
    el.style.height = from + 'px';
    el.style.overflow = 'hidden';
    const anim = this.animate(el, [{ height: from + 'px' }, { height: to + 'px' }], { dur: o.dur || 'med', ease: o.ease || (open ? 'spring' : 'ease'), fill: 'none' });
    const done = () => { el.style.height = open ? '' : '0px'; el.style.overflow = open ? '' : 'hidden'; if (!open) el.hidden = true; };
    if (anim) anim.onfinish = done; else done();
    return anim;
  },
};

/* ---------- live state that concepts share ----------------------------------------------------------------------- */
/* Selections and toggles a person makes (worktree root, engine, expanded rows) survive a concept switch, so comparing
   concepts is fair. Per-viewer convenience only; every read and write is guarded. */
PMR.state = (() => {
  const KEY = 'pmr.state.v1';
  let s = {};
  try { s = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { s = {}; }
  const save = PMR.util.debounce(() => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* storage off */ } }, 300);
  const subs = new Set();
  return {
    get: (k, d) => (k in s ? s[k] : d),
    set(k, v) { s[k] = v; save(); subs.forEach(fn => { try { fn(k, v); } catch (e) { /* ignore */ } }); },
    on(fn) { subs.add(fn); return () => subs.delete(fn); },
  };
})();
