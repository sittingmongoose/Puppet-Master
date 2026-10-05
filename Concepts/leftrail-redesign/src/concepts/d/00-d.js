/* Concept D (Polish): today's rail, polished. A skin concept: the shell's own Files, Source Control and Docker panels
   (#panel-files, #panel-source, #panel-docker) stay in place and keep every behaviour; d.css restyles them under
   html[data-rail-skin="d"], and this script adds what CSS cannot: status glyphs in place of pills, sentence-case
   labels and full words in place of abbreviations, text that stacks instead of shortening, the shell's dropdowns opened
   as the chat-style PMR.menu, and motion. Everything it changes is recorded and undone on destroy, so "Current" and
   the other concepts see the shell exactly as it was.

   Files: 00-d.js (state, glyphs, words), 10-skin.js (apply / undo), 20-fit.js (tabs, heads, thumb), 30-motion.js,
   40-bar.js (activity bar tile), 90-register.js. They share this wrapper's scope. */

const D = { on: false, undo: [], observers: [], listeners: [], bar: null };
const PANEL_IDS = ['panel-files', 'panel-source', 'panel-docker'];
const panelEls = () => PANEL_IDS.map(id => document.getElementById(id)).filter(Boolean);
const inPanels = el => !!(el && el.closest && el.closest('#panel-files, #panel-source, #panel-docker'));

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
};
/* phrases the shell shortens inside longer text: [pattern, replacement] over a text node's whole value */
const PHRASES = [
  [/^(\s*)Watching (\d+) · /, '$1Watching $2 folders · '],
];
const metaWords = s => String(s || '').replace(/\b(\d+) ctr\b/g, (m, n) => n + (n === '1' ? ' container' : ' containers')).replace(/\bctr\b/g, 'containers');
const OWNER = { All: 'All', Threads: 'Threads', Th: 'Threads', Orch: 'Orchestrator', Agents: 'Agents', Ag: 'Agents', Manual: 'Manual', Man: 'Manual' };

/* ---- status: a glyph whose shape is the state; colour comes from data-d-st on the element ---- */
const G = {
  ok: '<path d="M3.6 8.4l2.8 2.8 6-6.4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  live: '<circle cx="8" cy="8" r="4" fill="currentColor"/>',
  run: '<circle cx="8" cy="8" r="4" fill="currentColor"/>',
  current: '<circle cx="8" cy="8" r="3.6" fill="currentColor"/><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.3" opacity=".5"/>',
  idle: '<circle cx="8" cy="8" r="4.2" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  pending: '<circle cx="8" cy="8" r="4.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2.4 2"/>',
  warn: '<path d="M8 2.7l5.5 9.7H2.5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 6.6v2.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="10.9" r=".85" fill="currentColor"/>',
  fail: '<circle cx="8" cy="8" r="5.4" fill="currentColor"/><path d="M6 6l4 4M10 6l-4 4" stroke="var(--surface, #fff)" stroke-width="1.6" stroke-linecap="round"/>',
  blocked: '<circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4.6 11.4l6.8-6.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  stale: '<circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 5.3V8l1.9 1.3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  unknown: '<circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="1.6 1.8"/><path d="M6.6 6.7a1.5 1.5 0 1 1 2.1 1.4c-.5.2-.7.6-.7 1v.2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="8" cy="11" r=".8" fill="currentColor"/>',
  info: '<circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 7.4v3.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="5.3" r=".85" fill="currentColor"/>',
  conflict: '<path d="M4.2 3.8l7.6 8.4M11.8 3.8l-7.6 8.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  dirty: '<circle cx="8" cy="8" r="4.6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="8" r="1.9" fill="currentColor"/>',
  orphan: '<path d="M10.9 4.1A4.8 4.8 0 1 0 12.8 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12.6" cy="4.4" r="1.1" fill="currentColor"/>',
  stash: '<rect x="4.6" y="4" width="2.2" height="8" rx=".5" fill="currentColor"/><rect x="9.2" y="4" width="2.2" height="8" rx=".5" fill="currentColor"/>',
};
const svgFor = st => '<svg viewBox="0 0 16 16" width="12" height="12" focusable="false" aria-hidden="true">' + (G[st] || G.info) + '</svg>';
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
