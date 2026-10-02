/* Status glyphs: state is carried by shape AND colour AND a word, never by colour alone and never by a pill.
   glyph(state) -> <span class="pmr-glyph" data-state> with a 12px SVG drawn in currentColor.
   statusEl(status, { word: true|false }) -> glyph + word. Colours come from --pmr-st-<state> (src/css/00-tokens.css). */

const GLYPH_PATHS = {
  ok:        '<path d="M3.5 8.4l2.9 2.9 6.1-6.6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  running:   '<circle cx="8" cy="8" r="4.2" fill="currentColor"/>',
  paused:    '<rect x="4.6" y="3.8" width="2.3" height="8.4" rx=".6" fill="currentColor"/><rect x="9.1" y="3.8" width="2.3" height="8.4" rx=".6" fill="currentColor"/>',
  stopped:   '<circle cx="8" cy="8" r="4.4" fill="none" stroke="currentColor" stroke-width="1.7"/>',
  pending:   '<circle cx="8" cy="8" r="4.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2.2 2.1"/>',
  warn:      '<path d="M8 2.6l5.6 9.9H2.4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 6.6v2.7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="8" cy="11" r=".9" fill="currentColor"/>',
  failed:    '<circle cx="8" cy="8" r="5.4" fill="currentColor"/><path d="M5.9 5.9l4.2 4.2M10.1 5.9l-4.2 4.2" stroke="var(--pmr-glyph-cut, #fff)" stroke-width="1.6" stroke-linecap="round"/>',
  blocked:   '<circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4.6 11.4l6.8-6.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  stale:     '<circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 5.2V8l2 1.4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  unknown:   '<circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="1.6 1.8"/><path d="M6.6 6.6a1.5 1.5 0 1 1 2.1 1.4c-.5.2-.7.6-.7 1v.3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="8" cy="11" r=".8" fill="currentColor"/>',
  info:      '<circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 7.4v3.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="5.3" r=".85" fill="currentColor"/>',
  conflict:  '<path d="M4 3.5l8 9M12 3.5l-8 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
};
/* file states read as their letter (F-074); these map to a glyph only where a glyph is asked for */
const STATE_ALIAS = { modified: 'warn', added: 'ok', deleted: 'failed', untracked: 'pending', ignored: 'stopped', conflict: 'conflict' };
const STATE_LETTER = { modified: 'M', added: 'A', deleted: 'D', untracked: '?', conflict: 'C' };

function glyph(state, cls) {
  const st = GLYPH_PATHS[state] ? state : (STATE_ALIAS[state] || 'info');
  const el = PMR.h('span', { class: ['pmr-glyph', cls], 'data-state': state || 'info', 'aria-hidden': 'true' });
  el.innerHTML = '<svg viewBox="0 0 16 16" width="12" height="12" focusable="false">' + GLYPH_PATHS[st] + '</svg>';
  return el;
}
function statusEl(status, opts) {
  opts = opts || {};
  if (!status) return null;
  const st = status.state || 'info';
  const el = PMR.h('span', { class: ['pmr-status', opts.cls], 'data-state': st });
  el.appendChild(glyph(st));
  if (opts.word !== false && status.word) el.appendChild(PMR.h('span.pmr-status-word', { text: status.word }));
  else if (status.word) el.setAttribute('aria-label', status.word);
  return el;
}
function letterEl(letter, state) {
  if (!letter) return null;
  const map = { M: 'modified', A: 'added', D: 'deleted', '?': 'untracked', C: 'conflict' };
  const st = state || map[letter] || 'info';
  return PMR.h('span', { class: 'pmr-letter', 'data-state': st, text: letter, 'aria-label': st });
}
PMR.glyph = glyph;
PMR.statusEl = statusEl;
PMR.letterEl = letterEl;
PMR.STATE_LETTER = STATE_LETTER;
/* strongest child status for folder roll-ups (F-074 precedence C > D > M > A > ?) */
PMR.rollup = items => {
  const rank = { conflict: 5, deleted: 4, modified: 3, added: 2, untracked: 1 };
  let best = null, n = 0;
  PMR.util.flatten(items).forEach(({ item }) => {
    const st = item.letter ? ({ M: 'modified', A: 'added', D: 'deleted', '?': 'untracked', C: 'conflict' })[item.letter] : null;
    if (!st || item.kind === 'folder') return;
    n += 1;
    if (!best || rank[st] > rank[best]) best = st;
  });
  return best ? { state: best, count: n } : null;
};
