// js/80-card.js (T.CommandCard) against a small DOM stub: preview windows, status words, actions, the disclosure,
// in-place updates, the shared running timer, and the source bans. Run: node harness/checks/card.test.mjs
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
assert.equal(card.q('pmt-card-more').textContent, '209 more lines');
assert.equal(card.q('pmt-card-status').textContent, 'Exit 101');
assert.equal(card.q('pmt-card-time').textContent, '1:02');
assert.equal(card.q('pmt-card-who').textContent, 'Builder ran in api');
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
assert.equal(card.q('pmt-card-more').textContent, '199 more lines');
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
assert.equal(done.q('pmt-card-status').textContent, 'Exit 0');
assert.equal(done.q('pmt-card-who').textContent, 'You ran in ~');

/* status words */
const made = [];
const word = (s, x = {}) => { const c = C.create(Object.assign({ command: 'x', status: s }, x)); made.push(c); return c.q('pmt-card-status').textContent; };
assert.equal(word('running'), 'Running'); assert.equal(word('waiting'), 'Needs input'); assert.equal(word('interrupted', { exitCode: 130 }), 'Interrupted');
assert.equal(word('failed'), 'Failed'); assert.equal(word('ok', { exitCode: 0 }), 'Exit 0');

/* blank edges, carriage returns, controls and long lines */
const tidy = C.create({ command: 'x', status: 'ok', lines: ['a', '', 'b', 'progress 10%\rprogress 100%', 'c\x07d', 'y'.repeat(1500), '', '  '], totalLines: 8 });
assert.deepEqual(lines(tidy).slice(0, 3), ['b', 'progress 100%', 'cd']);
assert.equal(lines(tidy)[3].length, 1000); assert.ok(lines(tidy)[3].endsWith('…'));
assert.equal(tidy.q('pmt-card-more').textContent, '2 more lines', 'the lines above the window; trailing blanks are not counted');

/* failure line: shown in the head only while it is not among the preview lines */
const fl = "thread 'main' panicked at src/media/import.rs:128:14:";
const f1 = C.create({ command: 'x', status: 'failed', exitCode: 101, lines: [fl].concat(out(8)), failureLine: fl });
assert.equal(f1.q('pmt-card-fail').hidden, false); assert.equal(f1.q('pmt-card-fail').textContent, fl);
C.update(f1, { expanded: true });
assert.equal(f1.q('pmt-card-fail').hidden, true);
assert.ok(f1.qa('pmt-card-line-bad').some(n => n.textContent === fl));
assert.equal(C.failureLineOf(['ok', 'error[E0425]: cannot find value `batch`', 'done']), 'error[E0425]: cannot find value `batch`');

/* running: no Rerun while live, an output band only once there is output, the timer ticks from startedAt */
const run = C.create({ command: 'cargo test', cwd: '~/tastebook/api', status: 'running', startedAt: Date.now() - 12000, lines: [], by: 'agent:Builder', onOpen() {}, onRerun() {} });
document.body.appendChild(run);
assert.equal(act(run, 'rerun').hidden, true); assert.equal(run.q('pmt-card-out').hidden, true);
assert.equal(run.q('pmt-card-time').textContent, '0:12');
assert.match(run.q('pmt-card-time').getAttribute('aria-label'), /^Running for 12 seconds$/);
C.update(run, { lines: ['Compiling'] });
assert.equal(run.q('pmt-card-out').hidden, false);
/* the timer wakes on the elapsed second's boundary, so 0:13 shows within a few ms of 13 s, not up to a second late */
const t0 = Date.now(), started = Date.now() - 12000;
C.update(run, { startedAt: started });
while (run.q('pmt-card-time').textContent === '0:12' && Date.now() - t0 < 1500) await new Promise(r => setTimeout(r, 5));
assert.equal(run.q('pmt-card-time').textContent, '0:13', 'the shared timer advanced the elapsed text');
assert.ok(Date.now() - started - 13000 < 60, 'the second changed on time (' + (Date.now() - started - 13000) + ' ms late)');
C.update(run, { status: 'ok', exitCode: 0, elapsedMs: 13400 });
assert.equal(act(run, 'rerun').hidden, false); assert.equal(run.q('pmt-card-time').textContent, '0:13');
assert.match(run.q('pmt-card-time').getAttribute('aria-label'), /^Took 13 seconds$/);

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
assert.ok(!/\bwindow\.PMT\b/.test(src), 'PMT is assigned by 90-kind.js only');
/* settle every live card: the shared timer then stops by itself and the process exits */
made.forEach(c => C.update(c, { status: 'ok' }));
console.log('card.test ok');
