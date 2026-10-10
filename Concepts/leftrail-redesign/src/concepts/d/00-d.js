/* Concept D (Polish): today's rail, polished. A skin concept: the shell's own nine rail panels (Files, Search, Source
   Control, Actions & Pipelines, Docker, Testing, Debug & Run, Agents, Runtime Artifacts) stay in place and keep every
   behaviour; d.css restyles them under
   html[data-rail-skin="d"], and this script adds what CSS cannot: status glyphs in place of pills, sentence-case
   labels and full words in place of abbreviations, text that stacks instead of shortening, the shell's dropdowns opened
   as the chat-style PMR.menu, and motion. Everything it changes is recorded and undone on destroy, so "Current" and
   the other concepts see the shell exactly as it was.

   Files: 00-d.js (state, glyphs, words), 10-skin.js (apply / undo), 20-fit.js (tabs, heads, thumb), 30-motion.js,
   40-bar.js (activity bar tile), 90-register.js. They share this wrapper's scope. */

const D = { on: false, undo: [], observers: [], listeners: [], bar: null };
/* the nine rail panels in activity-bar order; keep in step with PANEL_IDS in tools/build_d_css.py (the § macro) */
const PANEL_IDS = ['panel-files', 'panel-search', 'panel-source', 'panel-git', 'panel-docker', 'panel-testing', 'panel-run', 'panel-agents', 'panel-artifacts'];
const PANEL_SEL = PANEL_IDS.map(id => '#' + id).join(', ');
const panelEls = () => PANEL_IDS.map(id => document.getElementById(id)).filter(Boolean);
const inPanels = el => !!(el && el.closest && el.closest(PANEL_SEL));
/* per-panel passes: a panel's own script file calls panelHook('panel-x', { apply(panel, animate), show(panel, info),
   unmount(panel) }) at load. apply runs after the shared passes on every (re)apply, show when the panel opens,
   unmount before the undo registry runs. Every DOM change a hook makes still goes through remember()/setAttr()/
   addClass()/inject() so "Current" is byte-identical after a switch. */
const PANEL_HOOKS = [];
function panelHook(id, hook) { PANEL_HOOKS.push(Object.assign({ id }, hook)); }
const hooksFor = (panel, fn) => PANEL_HOOKS.filter(h => h.id === panel.id && typeof h[fn] === 'function');

/* ---- undo registry: every change the skin makes is reversible ---- */
function remember(fn) { D.undo.push(fn); }
function undoAll() { while (D.undo.length) { const fn = D.undo.pop(); try { fn(); } catch (e) { /* node gone */ } } }
function listen(target, type, fn, opts) { target.addEventListener(type, fn, opts); D.listeners.push(() => target.removeEventListener(type, fn, opts)); }
function setAttr(el, name, value) {
  if (!el.hasAttribute('data-d-a-' + name)) {
    const had = el.hasAttribute(name), old = el.getAttribute(name);
    el.setAttribute('data-d-a-' + name, '1');
    remember(() => { el.removeAttribute('data-d-a-' + name); if (had) el.setAttribute(name, old); else el.removeAttribute(name); });
  }
  if (value == null) el.removeAttribute(name); else el.setAttribute(name, value);
}
function addClass(el, cls) { if (el.classList.contains(cls)) return; el.classList.add(cls); remember(() => el.classList.remove(cls)); }
function inject(parent, node, before) { parent.insertBefore(node, before || null); remember(() => node.remove()); return node; }
/* an element's own text (its direct text nodes, not its children's) */
function ownText(el) { let s = ''; el.childNodes.forEach(n => { if (n.nodeType === 3) s += n.nodeValue; }); return s.trim(); }
function setOwnText(el, text) {
  const nodes = Array.from(el.childNodes).filter(n => n.nodeType === 3 && n.nodeValue.trim());
  if (!nodes.length) return;
  if (!('_dOrig' in el)) {
    const orig = nodes.map(n => n.nodeValue);
    el._dOrig = orig;
    remember(() => {
      const live = Array.from(el.childNodes).filter(n => n.nodeType === 3 && n.nodeValue.trim());
      if (live.length) { live[0].nodeValue = orig.join(''); live.slice(1).forEach(n => n.remove()); }
      delete el._dOrig; delete el._dText;
    });
  }
  const first = nodes[0];
  const lead = (first.nodeValue.match(/^\s*/) || [''])[0];
  first.nodeValue = lead + text;
  nodes.slice(1).forEach(n => { n.nodeValue = ''; });
  el._dText = text;
}

/* ---- words: sentence case for the shell's UPPERCASE labels, full words for its abbreviations ---- */
const PROPER = { git: 'Git', github: 'GitHub', docker: 'Docker', jujutsu: 'Jujutsu', unraid: 'Unraid', pr: 'PR', ci: 'CI', cpu: 'CPU', id: 'ID', api: 'API', ssh: 'SSH' };
function sentence(s) {
  if (!s || /[a-z]/.test(s)) return s;                       // only rewrite labels written in capitals
  const low = s.toLowerCase().replace(/\b[a-z]+\b/g, w => PROPER[w] || w);
  return low.charAt(0).toUpperCase() + low.slice(1);
}
const capFirst = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
/* exact texts the shell abbreviates or writes in ASCII; matched whole, trimmed */
const WORDS = {
  'ctx default': 'Context: default',
  '9 ctr': '9 containers',
  'CPU avg': 'CPU average',
  'MEM avg': 'Memory average',
  'MEM': 'Memory',
  'Commit tpl': 'Commit template',
  'Push tpl': 'Push template',
  '7 · 2': '7 branches · 2 stashes',
  'v1.2 -> Unraid': 'v1.2 → Unraid',
  '+ New Worktree': 'New worktree',
  '+ New branch': 'New branch',
  'Open in Panel': 'Open in panel',
  'vm not running — start colima · Retry': 'VM not running — start colima · Retry',
};
/* ages and elapsed times the shell writes as "4m", "2h", "1d", "12s ago", "up 3h", "1m 48s" are spelled out the way the
   Jujutsu rows write them ("4 minutes", "2 hours ago", "1 minute 48 seconds"); a decimal measurement keeps its unit
   symbol ("3.4s", "84.6s"), and a hash that starts with a digit ("3d9be21") is not an age */
const AGE_UNIT = { s: 'second', m: 'minute', h: 'hour', d: 'day', w: 'week' };
const AGE_RX = /(^|[\s(·—–])(\d+)([smhdw])(?=$|[\s),;·—–])/g;
const ageWords = (m, pre, n, u) => pre + n + ' ' + AGE_UNIT[u] + (n === '1' ? '' : 's');
/* phrases the shell shortens inside longer text: [pattern, replacement] over a text node's whole value (10-skin
   applyWords; text in code, kbd and pre is left as written) */
const PHRASES = [
  [/^(\s*)Watching (\d+) · /, '$1Watching $2 folders · '],
  [AGE_RX, ageWords],
];
const metaWords = s => String(s || '').replace(/\b(\d+) ctr\b/g, (m, n) => n + (n === '1' ? ' container' : ' containers')).replace(/\bctr\b/g, 'containers');
const OWNER = { All: 'All', Threads: 'Threads', Th: 'Threads', Orch: 'Orchestrator', Agents: 'Agents', Ag: 'Agents', Manual: 'Manual', Man: 'Manual' };

/* ---- status: a glyph whose shape is the state; colour comes from data-d-st on the element ----
   One family on a 16-unit grid. Definite states are solid badges with the mark knocked out (done, failed, warning,
   blocked, info, conflict); live things are a dot with a halo; stopped is a ring; pending is a dashed ring that
   turns slowly; changed is a half-filled circle; a stash is a tray. Knock-outs are masks, so they show whatever
   is behind the glyph (a shelf tint, a selected row) instead of a guessed surface colour. */
let maskSeq = 0;
const SOLID = {
  ok:       { shape: '<circle cx="8" cy="8" r="6.5"/>', cut: '<path d="M5 8.3l2 2 4-4.4" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>' },
  fail:     { shape: '<circle cx="8" cy="8" r="6.5"/>', cut: '<path d="M5.7 5.7l4.6 4.6M10.3 5.7l-4.6 4.6" stroke-width="1.7" stroke-linecap="round"/>' },
  warn:     { shape: '<path d="M8 1.6c.5 0 .9.3 1.2.7l5.4 9.6c.6 1-.1 2.3-1.3 2.3H2.7c-1.2 0-1.9-1.3-1.3-2.3L6.8 2.3c.3-.4.7-.7 1.2-.7z"/>', cut: '<path d="M8 5.6v3.6" stroke-width="1.7" stroke-linecap="round"/><circle cx="8" cy="11.6" r="1" stroke="none" fill="#000"/>' },
  blocked:  { shape: '<circle cx="8" cy="8" r="6.5"/>', cut: '<path d="M4.9 8h6.2" stroke-width="1.8" stroke-linecap="round"/>' },
  info:     { shape: '<circle cx="8" cy="8" r="6.5"/>', cut: '<path d="M8 7.3v3.7" stroke-width="1.7" stroke-linecap="round"/><circle cx="8" cy="5" r="1" stroke="none" fill="#000"/>' },
  conflict: { shape: '<path d="M8 1.2l6.8 6.8L8 14.8 1.2 8z" stroke-linejoin="round"/>', cut: '<path d="M6.1 6.1l3.8 3.8M9.9 6.1l-3.8 3.8" stroke-width="1.6" stroke-linecap="round"/>' },
};
const G = {
  live: '<circle cx="8" cy="8" r="6.4" fill="currentColor" opacity=".2"/><circle cx="8" cy="8" r="3.6" fill="currentColor"/>',
  run: '<circle cx="8" cy="8" r="6.4" fill="currentColor" opacity=".2"/><circle cx="8" cy="8" r="3.6" fill="currentColor"/>',
  current: '<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="8" r="3" fill="currentColor"/>',
  idle: '<circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" stroke-width="1.7"/>',
  pending: '<g class="d-spin"><circle cx="8" cy="8" r="5.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-dasharray="3.1 2.76" stroke-linecap="round"/></g>',
  stale: '<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 4.8V8l2.2 1.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  unknown: '<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 1.8"/><path d="M6.5 6.5a1.6 1.6 0 1 1 2.2 1.5c-.5.2-.7.6-.7 1.1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="11.3" r=".9" fill="currentColor"/>',
  dirty: '<circle cx="8" cy="8" r="5.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 2.4a5.6 5.6 0 0 0 0 11.2z" fill="currentColor"/>',
  orphan: '<path d="M11.4 3.6A5.6 5.6 0 1 0 13.6 8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="13.2" cy="4.1" r="1.3" fill="currentColor"/>',
  stash: '<path d="M2.5 9.2l1.6-5.1c.2-.6.7-1 1.3-1h5.2c.6 0 1.1.4 1.3 1l1.6 5.1v2.6c0 .8-.6 1.4-1.4 1.4H3.9c-.8 0-1.4-.6-1.4-1.4z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M2.6 9.2h3.1l.9 1.4h2.8l.9-1.4h3.1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
};
function svgFor(st) {
  let body = G[st];
  if (!body) {
    const s = SOLID[st] || SOLID.info, id = 'dgm' + (++maskSeq);
    body = '<defs><mask id="' + id + '" maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16"><rect width="16" height="16" fill="#fff"/>'
      + '<g stroke="#000">' + s.cut + '</g></mask></defs><g mask="url(#' + id + ')" fill="currentColor">' + s.shape + '</g>';
  }
  return '<svg viewBox="0 0 16 16" width="12" height="12" focusable="false" aria-hidden="true">' + body + '</svg>';
}
function glyph(st, pulse) {
  const s = PMR.h('span', { class: 'd-gl', 'aria-hidden': 'true', 'data-gl': st });
  s.innerHTML = svgFor(st);
  if (pulse) s.setAttribute('data-pulse', '');
  return s;
}
/* a status word -> state */
const STATE_WORDS = [
  [/^(ok|ready|exists|in use|authenticated|reachable|healthy|clean|valid|passed|done|success|saved|synced|verified|up|current)\b/i, 'ok'],
  [/^(running|live|connected|watching)\b/i, 'live'],
  [/^(restarting|building|crash)/i, 'run'],
  [/^(outcome pending|pending|waiting|queued|not built|checking|scheduled)\b/i, 'pending'],
  [/^(stale|outdated)\b/i, 'stale'],
  [/^(dirty|modified|unsaved)\b/i, 'dirty'],
  [/^orphan/i, 'orphan'],
  [/^(not configured|attention|degraded|warning|partial)\b/i, 'warn'],
  [/^(unknown|unverified)\b/i, 'unknown'],
  [/^(failed|failing|error|errored|unreachable|crashed|exited|invalid|offline)\b/i, 'fail'],
  [/^blocked\b/i, 'blocked'],
  [/^conflict/i, 'conflict'],
];
function stateOfWord(word) {
  const w = String(word || '').trim();
  for (const [rx, st] of STATE_WORDS) if (rx.test(w)) return st;
  return null;
}
function stateOfChip(el, word) {
  if (el.classList.contains('pm7-post-state')) {
    const ds = el.getAttribute('data-state');
    const map = { ready: 'ok', pending: 'pending', unknown: 'unknown', attention: 'warn', blocked: 'blocked', conflicted: 'conflict' };
    if (ds && map[ds]) return map[ds];
  }
  if (el.classList.contains('sh-pill')) {
    if (el.classList.contains('clean')) return 'ok';
    if (el.classList.contains('dirty')) return 'dirty';
    if (el.classList.contains('orphan')) return 'orphan';
  }
  const byWord = stateOfWord(word);
  if (byWord) return byWord;
  if (el.classList.contains('pm-chip-ok')) return 'ok';
  if (el.classList.contains('pm-chip-warn')) return 'warn';
  if (el.classList.contains('pm-chip-err') || el.classList.contains('pm-chip-errored')) return 'fail';
  return /^\d/.test(String(word).trim()) ? 'info' : 'pending';
}
/* a coloured dot -> state, from its class or the colour the markup paints it */
function stateOfDot(el) {
  const c = el.classList;
  if (c.contains('dot-run')) return 'run';
  if (c.contains('dot-err')) return 'fail';
  if (c.contains('dot-warn')) return 'warn';
  if (c.contains('dot-idle')) return 'pending';
  if (c.contains('dot-ok')) return 'live';
  const bg = el.getAttribute('style') || '';
  if (/--graph-running/.test(bg)) return 'run';
  if (/--graph-failed|--accent-error/.test(bg)) return 'fail';
  if (/--accent-warning/.test(bg)) return 'warn';
  if (/--text-muted|--text-secondary|--graph-pending/.test(bg)) return 'idle';
  if (/--graph-passed|--accent-lime|--accent-green/.test(bg)) return 'live';
  return 'info';
}
