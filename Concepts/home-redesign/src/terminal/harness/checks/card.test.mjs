// js/80-card.js (T.CommandCard) against a small DOM stub: preview windows, status words and exit words, the
// earlier-lines count, the glyph slot, attribution, actions, the disclosure, in-place updates, the shared running
// timer, and the source rules (bans, the motion language per look, Reduced Motion and NieR gating, the type floor,
// small-control radii). The stub has no layout, so every paint lands at once; motion is watched in harness/card-lab.html.
// Run: node harness/checks/card.test.mjs
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
import assert from 'node:assert/strict';
const here = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const src = fs.readFileSync(path.join(root, 'js', '80-card.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', '80-card.css'), 'utf8');
const lab = fs.readFileSync(path.join(root, 'harness', 'card-lab.html'), 'utf8');

/* ---- a DOM just big enough for the card ---- */
class Node_ {
  constructor(tag, doc) { this.tagName = tag; this.ownerDocument = doc; this.childNodes = []; this.parentNode = null; this.attrs = {}; this.listeners = {}; this._text = ''; this.hidden = false; this.className = ''; }
  get isConnected() { let n = this; while (n.parentNode) n = n.parentNode; return n === this.ownerDocument.body; }
  appendChild(c) { if (c.tagName === '#fragment') { c.childNodes.slice().forEach(k => this.appendChild(k)); c.childNodes = []; return c; } if (c.parentNode) c.parentNode.removeChild(c); c.parentNode = this; this.childNodes.push(c); return c; }
  removeChild(c) { const i = this.childNodes.indexOf(c); if (i >= 0) this.childNodes.splice(i, 1); c.parentNode = null; return c; }
  get textContent() { return this.tagName === '#text' ? this._text : this.childNodes.map(c => c.textContent).join(''); }
  set textContent(v) { if (this.tagName === '#text') { this._text = String(v); return; } this.childNodes.forEach(c => { c.parentNode = null; }); this.childNodes = []; if (v !== '' && v != null) this.appendChild(this.ownerDocument.createTextNode(String(v))); }
  set innerHTML(v) { this.childNodes = []; this._html = v; }
  setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'class') this.className = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  hasAttribute(k) { return k in this.attrs; }
  removeAttribute(k) { delete this.attrs[k]; }
  get classList() { const self = this; const list = () => self.className.split(/\s+/).filter(Boolean);
    return { contains: c => list().includes(c), add: c => { if (!list().includes(c)) self.className = list().concat(c).join(' '); },
      remove: c => { self.className = list().filter(x => x !== c).join(' '); },
      toggle: (c, on) => { const has = list().includes(c); const want = on === undefined ? !has : !!on; if (want && !has) self.className = list().concat(c).join(' '); if (!want && has) self.className = list().filter(x => x !== c).join(' '); return want; } }; }
  addEventListener(t, fn) { (this.listeners[t] || (this.listeners[t] = [])).push(fn); }
  contains(n) { for (; n; n = n.parentNode) if (n === this) return true; return false; }
  closest(sel) { const m = /^\[([\w-]+)\]$/.exec(sel); for (let n = this; n && n.tagName !== '#doc'; n = n.parentNode) if (m && n.hasAttribute && n.hasAttribute(m[1])) return n; return null; }
  all(pred, out = []) { for (const c of this.childNodes) { if (pred(c)) out.push(c); if (c.childNodes) c.all(pred, out); } return out; }
  q(cls) { return this.all(n => n.classList && n.classList.contains(cls))[0] || null; }
  qa(cls) { return this.all(n => n.classList && n.classList.contains(cls)); }
  click() { let n = this; const ev = { target: this, type: 'click' }; for (; n; n = n.parentNode) (n.listeners.click || []).forEach(fn => fn(Object.assign({}, ev, { currentTarget: n }))); }
}
class Doc { constructor() { this.tagName = '#doc'; this.body = new Node_('body', this); }
  createElement(t) { return new Node_(t, this); } createElementNS(ns, t) { return new Node_(t, this); }
  createTextNode(s) { const n = new Node_('#text', this); n._text = String(s); return n; }
  createDocumentFragment() { return new Node_('#fragment', this); } }

const document = new Doc();
const T = {};
new Function('window', 'T', 'document', src)({}, T, document);
const C = T.CommandCard;
assert.equal(typeof C.create, 'function'); assert.equal(typeof C.update, 'function');
assert.equal(C.COLLAPSED_LINES, 5); assert.equal(C.EXPANDED_LINES, 15);

const visible = (card, cls) => card.qa(cls).filter(n => !n.hidden);
const lines = (card) => card.qa('pmt-card-line').map(n => n.textContent);
const act = (card, key) => card.all(n => n.getAttribute && n.getAttribute('data-pmt-act') === key)[0];
const out = range => Array.from({ length: range }, (_, i) => 'line ' + (i + 1));

/* collapsed: last 5, "N more lines"; expanded: last 15 */
let calls = [];
const spec = { command: 'cargo test --workspace', cwd: '/home/jared/tastebook/api', status: 'failed', exitCode: 101, elapsedMs: 62400,
  lines: out(40), totalLines: 214, by: 'agent:Builder', onOpen: (s, el) => calls.push(['open', el]), onRerun: () => calls.push(['rerun']),
  onViewOutput: () => calls.push(['view']), onToggle: (x) => calls.push(['toggle', x]) };
const card = C.create(spec);
document.body.appendChild(card);
assert.deepEqual(lines(card), ['line 36', 'line 37', 'line 38', 'line 39', 'line 40']);
assert.equal(card.q('pmt-card-more').textContent, '209 earlier lines', 'the lines above the window, counted at its top');
assert.equal(card.q('pmt-card-more-n').textContent, '209');
assert.equal(card.q('pmt-card-status').textContent, 'Failed');
assert.equal(card.q('pmt-card-exit').textContent, 'exited 101', 'the exit code reads as words');
assert.equal(card.q('pmt-card-exitbox').hidden, false);
assert.equal(card.getAttribute('aria-label'), 'Command cargo test --workspace, Failed, exited 101');
assert.equal(card.q('pmt-card-time').textContent, '1:02');
assert.equal(card.q('pmt-card-who').textContent, 'Builder ran in api');
assert.equal(card.q('pmt-card-name').textContent, 'Builder');
assert.equal(card.q('pmt-card-who').getAttribute('data-pmt-who'), 'agent', 'an agent-typed command carries the agent mark');
/* the glyph slot holds exactly one mark, so the neon glyph rollout swaps one thing */
const slot = card.q('pmt-card-gi');
assert.equal(slot.childNodes.length, 1); assert.equal(slot.childNodes[0].className, 'pmt-card-g');
assert.equal(card.q('pmt-card-cmd').getAttribute('data-pm-hover-label'), 'cargo test --workspace');
assert.equal(card.q('pmt-card-cwd').getAttribute('data-pm-hover-label'), '/home/jared/tastebook/api');
assert.equal(card.getAttribute('data-pmt-status'), 'failed');
assert.equal(card.getAttribute('data-pmt-expanded'), 'false');
/* a live session: Open in Terminal and Rerun, never View output */
assert.equal(act(card, 'open').hidden, false); assert.equal(act(card, 'rerun').hidden, false); assert.equal(act(card, 'view').hidden, true);
assert.ok(act(card, 'open').classList.contains('pmt-card-act-primary'));
act(card, 'open').click(); assert.equal(calls[0][0], 'open'); assert.equal(calls[0][1], card);
/* the disclosure is a real button that owns aria-expanded and aria-controls */
const tg = card.q('pmt-card-toggle');
assert.equal(tg.tagName, 'button'); assert.equal(tg.getAttribute('aria-expanded'), 'false');
assert.equal(tg.getAttribute('aria-controls'), card.q('pmt-card-out').id);
tg.click();
assert.deepEqual(calls.at(-1), ['toggle', true]);
assert.equal(card.getAttribute('data-pmt-expanded'), 'true'); assert.equal(tg.getAttribute('aria-expanded'), 'true');
assert.equal(lines(card).length, 15); assert.equal(lines(card)[0], 'line 26');
assert.equal(card.q('pmt-card-more').textContent, '199 earlier lines');
assert.equal(card.q('pmt-card-cwd').textContent, '/home/jared/tastebook/api', 'expanded shows the whole folder');

/* in-place update keeps the same element and its parts */
const head = card.q('pmt-card-head');
C.update(card, { expanded: false, lines: out(3), totalLines: 3 });
assert.equal(card.q('pmt-card-head'), head);
assert.deepEqual(lines(card), ['line 1', 'line 2', 'line 3']); assert.equal(card.q('pmt-card-more').hidden, true);

/* no live session: View output, never a fabricated Open in Terminal */
const done = C.create({ command: 'mkdir -p target/bench', cwd: '~', status: 'ok', elapsedMs: 40, lines: [], by: 'user', onViewOutput() {}, onRerun() {} });
assert.equal(act(done, 'open').hidden, true); assert.equal(act(done, 'view').hidden, false);
assert.ok(act(done, 'view').classList.contains('pmt-card-act-primary'));
assert.deepEqual(lines(done), ['No output']);
assert.equal(done.q('pmt-card-status').textContent, 'Done');
assert.equal(done.q('pmt-card-exit').textContent, 'exited 0');
assert.equal(done.q('pmt-card-who').textContent, 'You ran in ~');
assert.equal(done.q('pmt-card-who').getAttribute('data-pmt-who'), 'user');

/* status words */
const made = [];
const word = (s, x = {}) => { const c = C.create(Object.assign({ command: 'x', status: s }, x)); made.push(c); return c.q('pmt-card-status').textContent; };
assert.equal(word('running'), 'Running'); assert.equal(word('waiting'), 'Needs input'); assert.equal(word('interrupted', { exitCode: 130 }), 'Interrupted');
assert.equal(word('failed'), 'Failed'); assert.equal(word('ok', { exitCode: 0 }), 'Done');
/* exit words: once stopped, when there is a code; never while live */
const exitOf = (s, x = {}) => { const c = C.create(Object.assign({ command: 'x', status: s }, x)); made.push(c); return c.q('pmt-card-exitbox').hidden ? null : c.q('pmt-card-exit').textContent; };
assert.equal(exitOf('interrupted', { exitCode: 130 }), 'exited 130'); assert.equal(exitOf('interrupted'), null);
assert.equal(exitOf('failed'), null); assert.equal(exitOf('ok'), 'exited 0');
assert.equal(exitOf('running', { exitCode: 3 }), null); assert.equal(exitOf('waiting'), null);
/* one earlier line is singular */
const one = C.create({ command: 'x', status: 'ok', lines: out(6), totalLines: 6 }); made.push(one);
assert.equal(one.q('pmt-card-more').textContent, '1 earlier line');
/* a status change keeps the slot and swaps its one mark */
const sw = C.create({ command: 'x', status: 'running' }); made.push(sw);
const swSlot = sw.q('pmt-card-gi'), swMark = swSlot.childNodes[0];
C.update(sw, { status: 'ok', exitCode: 0 });
assert.equal(sw.q('pmt-card-gi'), swSlot); assert.equal(swSlot.childNodes.length, 1); assert.notEqual(swSlot.childNodes[0], swMark);
assert.equal(sw.q('pmt-card-status').textContent, 'Done', 'no ghost word is left behind');

/* blank edges, carriage returns, controls and long lines */
const tidy = C.create({ command: 'x', status: 'ok', lines: ['a', '', 'b', 'progress 10%\rprogress 100%', 'c\x07d', 'y'.repeat(1500), '', '  '], totalLines: 8 });
assert.deepEqual(lines(tidy).slice(0, 3), ['b', 'progress 100%', 'cd']);
assert.equal(lines(tidy)[3].length, 1000); assert.ok(lines(tidy)[3].endsWith('…'));
assert.equal(tidy.q('pmt-card-more').textContent, '2 earlier lines', 'the lines above the window; trailing blanks are not counted');

/* failure line: shown in the head only while it is not among the preview lines */
const fl = "thread 'main' panicked at src/media/import.rs:128:14:";
const f1 = C.create({ command: 'x', status: 'failed', exitCode: 101, lines: [fl].concat(out(8)), failureLine: fl });
assert.equal(f1.q('pmt-card-fail').hidden, false); assert.equal(f1.q('pmt-card-fail').textContent, fl);
/* it may wrap after a module or path separator before it breaks a word; the break points add no characters */
assert.equal(f1.q('pmt-card-fail').all(n => n.tagName === 'wbr').length, 2, 'after each / of src/media/import.rs');
C.update(f1, { expanded: true });
assert.equal(f1.q('pmt-card-fail').hidden, true);
assert.ok(f1.qa('pmt-card-line-bad').some(n => n.textContent === fl));
C.update(f1, { expanded: false });
assert.equal(f1.q('pmt-card-fail').hidden, false); assert.equal(f1.q('pmt-card-fail').textContent, fl, 'back in the head, words and all');
assert.equal(C.failureLineOf(['ok', 'error[E0425]: cannot find value `batch`', 'done']), 'error[E0425]: cannot find value `batch`');

/* running: no Rerun while live, an output band only once there is output, the timer ticks from startedAt */
const run = C.create({ command: 'cargo test', cwd: '~/tastebook/api', status: 'running', startedAt: Date.now() - 12000, lines: [], by: 'agent:Builder', onOpen() {}, onRerun() {} });
document.body.appendChild(run);
assert.equal(act(run, 'rerun').hidden, true); assert.equal(run.q('pmt-card-out').hidden, true);
assert.equal(run.q('pmt-card-time').textContent, '0:12');
assert.match(run.q('pmt-card-time').getAttribute('aria-label'), /^Running for 12 seconds$/);
C.update(run, { lines: ['Compiling'] });
assert.equal(run.q('pmt-card-out').hidden, false);
/* the timer wakes on the elapsed second's boundary, so 0:13 shows within a few ms of 13 s, not up to a second late.
   Judged by a control timer due 60 ms after that boundary, not by the clock: on a loaded machine both wake late (Nas1,
   2026-10-16), but timers still fire in the order they are due, so the text has changed when the control fires only if
   the card's timer was due first. Started 12.5 s ago, the next second is half a second away, where a timer running on
   its own one-second beat would be half a second late */
const started = Date.now() - 12500;
C.update(run, { startedAt: started });
const atControl = await new Promise(r => setTimeout(() => r({ text: run.q('pmt-card-time').textContent, late: Date.now() - started - 13060 }), started + 13060 - Date.now()));
assert.equal(atControl.text, '0:13', 'the second changed on time: before a timer due 60 ms after it (which fired ' + atControl.late + ' ms late)');
C.update(run, { status: 'ok', exitCode: 0, elapsedMs: 13400 });
assert.equal(act(run, 'rerun').hidden, false); assert.equal(run.q('pmt-card-time').textContent, '0:13');
assert.match(run.q('pmt-card-time').getAttribute('aria-label'), /^Took 13 seconds$/);

/* the who-part of a command with no folder and no author is hidden with its separator */
const bare = C.create({ command: 'x', status: 'ok' }); made.push(bare);
assert.equal(bare.q('pmt-card-who').hidden, true);

/* no internal ids in visible text: the only id is the preview's DOM id for aria-controls */
assert.ok(!/pmt-card-\d/.test(card.textContent));

/* source bans (the layer lint's rules, checked here so the card never trips them) */
const emoji = /\p{Extended_Pictographic}/u;
for (const [name, text] of [['80-card.js', src], ['80-card.css', css], ['card-lab.html', lab]]) {
  assert.ok(!emoji.test(text), name + ': no emoji');
  assert.ok(!/pill/i.test(text), name + ': no pill');
  assert.ok(!/:has\(/.test(text), name + ': no :has(');
  assert.ok(!/border-(left|inline-start)\s*:\s*([2-9]|\d{2,})px/.test(text), name + ': no side stripe');
  assert.ok(!/border-(left|inline-start)-width\s*:\s*([2-9]|\d{2,})px/.test(text), name + ': no side stripe width');
  assert.ok(!/@media[^{]*(min|max)-width/.test(text), name + ': no viewport-width media query');
}
assert.ok(/^\(function \(\) \{/m.test(src) && src.trim().endsWith('})();'), 'one IIFE block');

/* the motion language of Concepts/onboarding/opus-5.5/src/css/30-art.css, one curve per look */
for (const [look, curve] of [['Basic', 'cubic-bezier(0.2, 0, 0, 1)'], ['Friendly', 'cubic-bezier(0.34, 1.56, 0.64, 1)'],
  ['Glass', 'cubic-bezier(0.05, 0.7, 0.1, 1)'], ['Retro', 'steps(6, end)'], ['NieR', 'steps(8, end)']]) assert.ok(css.includes(curve), look + ' curve ' + curve);
const rules = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}@]+)\{([^{}]*)\}/g)].map(m => ({ sel: m[1].trim(), body: m[2] }));
/* anything that travels (a height, a scroll, a word sliding to its width) is motion only where motion is allowed */
for (const r of rules) {
  const travel = /--pmt-card-t-(size|scroll|window|widen|turn|press)\s*:\s*([1-9]\d*)ms/.exec(r.body);
  if (!travel) continue;
  assert.ok(/:not\(\[data-motion="reduced"\]\)/.test(r.sel), 'travel only without Reduced Motion: ' + r.sel.slice(0, 90));
  if (!/html\[data-o55-nier="on"\]/.test(r.sel)) assert.ok(/:not\(\[data-o55-nier="on"\]\)/.test(r.sel), 'a look\'s motion stays out of NieR: ' + r.sel.slice(0, 90));
  else assert.ok(/\[data-o55-nier-parts~="(slice|decode|glitch)"\]/.test(r.sel), 'NieR motion only under an installed Motion part: ' + r.sel.slice(0, 90));
}
/* loops (the turning glyph, the blinking cursor square and caret) only with motion allowed, never in NieR */
for (const r of rules) if (/infinite/.test(r.body)) assert.ok(/:not\(\[data-motion="reduced"\]\)/.test(r.sel), 'a loop only without Reduced Motion: ' + r.sel.slice(0, 90));
/* the calm floor: Reduced Motion keeps short fades through the page's own stilling rule */
assert.ok(/html\[data-motion="reduced"\]:not\(\[data-o55-nier="on"\]\) \.pmt-card :is\([^)]*pmt-card-line-in[^)]*\) \{\s*animation-duration: 120ms !important;/.test(css), 'calm fades survive Reduced Motion');
/* NieR: no glow, filter or blur anywhere in the card */
assert.ok(!/\bfilter\s*:|blur\(|text-shadow|drop-shadow/.test(css), 'no filter, blur or glow');
/* text at least 11 px; small controls at most 6 px round */
for (const m of css.matchAll(/font-size:\s*([\d.]+)px/g)) assert.ok(+m[1] >= 11, 'text at least 11 px: ' + m[0]);
for (const m of css.matchAll(/--pmt-card-btn-radius:\s*([\d.]+)px/g)) assert.ok(+m[1] <= 6, 'small controls at most 6 px round: ' + m[0]);
/* the lab loads its faces from files that exist, and can end the running test every way */
for (const m of lab.matchAll(/url\("([^"]+\.woff2)"\)/g)) assert.ok(fs.existsSync(path.join(root, 'harness', m[1])), 'lab font exists: ' + m[1]);
for (const k of ['ok', 'failed', 'interrupted', 'waiting']) assert.ok(lab.includes('data-lab-end="' + k + '"'), 'lab finishes as ' + k);
assert.ok(!/\bwindow\.PMT\b/.test(src), 'PMT is assigned by 90-kind.js only');
/* settle every live card: the shared timer then stops by itself and the process exits */
made.forEach(c => C.update(c, { status: 'ok' }));
console.log('card.test ok');
