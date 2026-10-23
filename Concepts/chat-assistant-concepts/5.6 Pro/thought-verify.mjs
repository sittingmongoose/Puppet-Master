/* thought-verify.mjs -- Thought Stream acceptance (DL-234, 2026-10-23).
 *
 *   node thought-verify.mjs [--page standalone|pm7] [--file <page>] [--json out.json] [--only <text>]
 *   node thought-verify.mjs --node         (the source checks alone; no browser)
 *
 * The live thinking block (thought-stream.js) on either page, through the shared host adapter (tests/chat-target.mjs).
 * Every browser check reads painted state or a quantity measured every frame in the page (rects, classes, attributes,
 * the polite status), never a dispatch count; the scenarios send through the composer, as a person does.
 *
 *   node     the recorded turns that share reasoning, the replies whose fixed waits turn-verify relies on (none),
 *            the build order, the hosted Studio entry and copy, the retired preview-only wording, no pills or stripes;
 *            Lines shown while thinking: one set of choices (4, 6, 8, 12, 16) and one default (8) in the chat, the
 *            Settings row, its adapter, its placement under Show thinking and Plans/settings_inventory.json
 *   auto     live: the block heads the turn, the reply waits hidden, words only grow, never more than the default
 *            eight lines, which fade at the top once the reasoning runs past them; the fold starts no later than the
 *            answer's first word and lands folded; the folded line says how long it thought with its gist; it
 *            reopens and folds by click and by Enter; no clamp snap, follow holds; exactly two polite statuses
 *            (start, end), the transcript is not a live region
 *   expanded the block never caps and stays open beside the answer, without a gist
 *   agent    an agent turn: no working card while it thinks; in the card's first frame the block is done and folded;
 *            block, card, answer in that order; no clamp snap and the reader stays at the bottom
 *   lines    Lines shown while thinking (Jared, 2026-10-23: "Default 8, adjustable in settings."), with a long thought
 *            (a test fixture: the recorded reply's reasoning lengthened in the page, so every choice overflows): the
 *            default is 8; each choice caps the live window at exactly that many lines and fades the rest; the fold
 *            and follow-along hold at every size; a 16-line agent turn folds before its card with no snap; a change
 *            mid-thought glides to the new height; Expanded stays uncapped at any choice; Reduced Motion lands each
 *            height at once
 *   prefs    the preference round trip: the composer's Thought Stream menu and New chat defaults (both pages), and
 *            Settings (PMConcept7): a change reaches every block on screen, in both directions; the same for Lines
 *            shown while thinking (the composer's lines list, New chat defaults' second dropdown, and the Settings
 *            row itself, under Show thinking), with Settings refusing a choice it does not offer
 *   reduced  Reduced Motion: words born still, the fold and the label land at once, the reply still streams
 *   stop     Stop while it thinks keeps the reasoning shown so far and the reply's Stopped marker
 *   hover    the line's hover tag carries a real label and detail (PMConcept7's controller; the standalone card)
 *   studio   Demo Studio's While it thinks and Always open play to their end without writing the preference
 *   contrast the reasoning, the line and the gist read 4.5:1 or better on the painted pixels, in all ten looks
 */
import { chromium } from 'playwright';
import { launchChatBrowser, chatTarget, testGeometry, LOOKS } from './tests/chat-target.mjs';
import path from 'path';
import fs from 'fs';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const ROOT = decodeURIComponent(path.dirname(new URL(import.meta.url).pathname));
const ONLY = opt('only', '');
const OUT = opt('json', null);
const NODE_ONLY = argv.includes('--node');
const results = [];
let group = null;
const check = (label, ok, detail) => { results.push({ group, label, pass: !!ok, sizeContext: NODE_ONLY ? null : testGeometry(), detail: detail === undefined ? null : detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail !== undefined ? '  ' + JSON.stringify(detail).slice(0, 260) : ''}`); return ok; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ID = 'general.interaction.thought-stream';
const LID = 'general.interaction.thought-stream-lines';
const CHOICES = [4, 6, 8, 12, 16];
const Q = 'Should the index lead with tenant_id or created_at?';
const AGENT_Q = "Add the composite index and prove it's faster.";
/* a long thought (the lines group's fixture): sr-index's and lt-build's recorded reasoning, lengthened in the page so it
   runs past the largest window at either page's column; the product's recorded turns are left as they are */
const LONG = [
  'Two orders to compare for the composite index. With created_at first, one tenant’s read walks the whole date range and throws away every other tenant’s rows: the planner can use the leading column only for the range, so the tenant filter turns into a scan over everything in that window.',
  'With tenant_id first, the planner seeks straight to the tenant and then reads created_at in index order, which also covers the ORDER BY created_at DESC the dashboard sends. Equality columns lead and the range column follows; this query fits that rule exactly, and so do the two other slow queries in the benchmark.',
  'The write side matters too. Every insert touches this index once whichever order I pick, so the write amplification is the same; what changes is page locality. Tenant-first keeps each tenant’s new rows together at the right edge of its own key range, which the read-heavy mix rewards, and the hot pages stay in memory.',
  'Cardinality backs it up: about four thousand tenants and one hundred eighty million rows, so tenant_id alone narrows a read to roughly forty-five thousand rows, and created_at inside it narrows the seven-day window to a few hundred. A partial index would save space but the dashboard asks for any window, so it does not fit here.',
  'Before calling it, I will check the plan with EXPLAIN on the three slow queries, confirm the index is used for the sort as well as the filter, and compare p95 against the baseline the benchmark recorded yesterday. If the planner still sorts in memory, the column order is wrong for that query and I will say so.',
  'One more risk is the migration itself. Building the index concurrently avoids a long lock on the events table, but it cannot run inside a transaction, so the migration needs the no-transaction marker on both its up and down steps, or the rollback test will fail inside the harness.',
  'Last, the old single-column index on created_at. Once the composite index exists, the planner should stop choosing it for these reads; I will leave it in place for this change, note it as a candidate to drop, and let the next benchmark run show whether anything still depends on it.'
].join('\n\n');

/* ------------------------------------------------------------------ node: the sources */
group = 'node';
{
  const data = read('data.js'), build = read('build.py'), css = read('thought-stream.css'), js = read('thought-stream.js');
  const bridge = read('pm7-port/js/50-demo-bridge.js'), feats = read('assistant-features.js');
  const studio = JSON.parse(fs.readFileSync(path.join(ROOT, '../../onboarding/opus-5.5/src/copy.d/75-demo-studio.json'), 'utf8'));
  const rows = fs.readFileSync(path.join(ROOT, '../../onboarding/opus-5.5/src/settings/o55/rows.d/64-chat-port.json'), 'utf8');
  const thinkOf = id => { const i = data.indexOf(`id:'${id}'`); if (i < 0) return null; const j = data.indexOf("id:'", i + 6); return data.slice(i, j < 0 ? undefined : j).includes('thinking:{'); };
  const sharing = ['lt-build', 'lt-trouble', 'lt-long', 'sr-index', 'sr-benchmark', 'sr-migration'];
  check('N1 the recorded agent turns and three replies share their reasoning (data.js thinking)', sharing.every(id => thinkOf(id) === true), Object.fromEntries(sharing.map(id => [id, thinkOf(id)])));
  /* turn-verify's send flight, busy sends, voices and sound groups wait fixed times on these two replies */
  check('N2 the replies turn-verify times with fixed waits answer at once, with no thinking (sr-steps, sr-summary)', thinkOf('sr-steps') === false && thinkOf('sr-summary') === false, { steps: thinkOf('sr-steps'), summary: thinkOf('sr-summary') });
  const mods = (build.match(/MODULES=\[([\s\S]*?)\]\n/) || [])[1] || '';
  const order = ['turn-stream', 'thought-stream', 'thought-demo'].map(m => mods.indexOf(`'${m}'`));
  check('N3 the build loads thought-stream and its demo after turn-stream (both pages read MODULES)', order.every(i => i >= 0) && order[0] < order[1] && order[1] < order[2], order);
  check('N4 the hosted Studio lists the Thought Stream pair, with its copy', /\['thinking', \[\['auto', 'thought-demo-start'\], \['expanded', 'thought-demo-start'\]\]\]/.test(bridge)
    && !!studio.studio?.chat?.guided?.groups?.thinking?.title && !!studio.studio?.chat?.guided?.items?.['thinking-auto']?.sub && !!studio.studio?.chat?.guided?.items?.['thinking-expanded']?.sub,
    { group: studio.studio?.chat?.guided?.groups?.thinking, auto: studio.studio?.chat?.guided?.items?.['thinking-auto']?.title, expanded: studio.studio?.chat?.guided?.items?.['thinking-expanded']?.title });
  check('N5 no wording says the chat only previews the choice (Settings help, New chat defaults fine print)', !/previews the choice|do not show live thinking|doesn’t change replies yet/.test(rows + feats), { rows: (rows.match(/"help": "Shown[^"]*"/) || [])[0] });
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  check('N6 the block draws no pill, no coloured side stripe, no glow and no !important', !/999px|border-left\s*:\s*\d|box-shadow\s*:\s*0 0 \d|text-shadow|!important/.test(stripped), null);
  check('N7 the live words are never a live region; one polite status speaks for the block', /role', 'status'/.test(js) && /aria-live', 'polite'/.test(js) && !/aria-live="/.test(js), null);
  /* Lines shown while thinking: one set of choices and one default everywhere they are written down */
  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, '../../../Plans/settings_inventory.json'), 'utf8')).settings;
  const irow = inv.find(r => r.id === LID), trow = inv.find(r => r.id === ID);
  const rrow = JSON.parse(rows).rows[LID] || {};
  const kit = fs.readFileSync(path.join(ROOT, '../../onboarding/opus-5.5/src/settings/kit.d/28-chat-port.js'), 'utf8');
  const place = JSON.parse(fs.readFileSync(path.join(ROOT, '../../onboarding/opus-5.5/src/settings/o55/placement.d/64-chat-port.json'), 'utf8'));
  const jsChoices = ((js.match(/var LINES = \[([^\]]*)\], DEFAULT_LINES = (\d+);/) || []).slice(1));
  const words = CHOICES.map(String);
  const lineFacts = { js: jsChoices, rows: rrow.choices, kit: (kit.match(/'general\.interaction\.thought-stream-lines': \[([^\]]*)\]/) || [])[1], inventory: irow && { options: irow.options, default: irow.default, type: irow.type, scope: irow.scope } };
  check('N8 Lines shown while thinking offers 4, 6, 8, 12 and 16, default 8, in the chat, the Settings row, its adapter and the inventory',
    jsChoices[0] === CHOICES.join(', ') && jsChoices[1] === '8' && JSON.stringify(rrow.choices) === JSON.stringify(words) && words.every(w => rrow.options?.[w] === w + ' lines')
      && lineFacts.kit === words.map(w => `'${w}'`).join(', ') && !!irow && JSON.stringify(irow.options) === JSON.stringify(words) && irow.default === '8' && irow.type === 'select'
      && JSON.stringify(irow.scope) === JSON.stringify(trow && trow.scope) && words.every(w => irow.option_labels?.[w] === w + ' lines') && irow.label === rrow.label, lineFacts);
  const after = place.sections?.['app-chat-view']?.after || {};
  check('N9 the Settings row sits right under Show thinking, before History in new workspaces; the chat no longer says six lines',
    after[LID] === ID && after['general.interaction.chat-history-list'] === LID && Object.keys(after).indexOf(LID) > Object.keys(after).indexOf(ID)
      && (place.overrides || []).some(o => o.section === 'app-chat-view' && o.ids.indexOf(LID) === o.ids.indexOf(ID) + 1)
      && !/six lines|last six|CAP_LINES/.test(js + css), { after });
}
if (NODE_ONLY) finish();

/* ------------------------------------------------------------------ browser */
const target = chatTarget(argv);
const HOSTED = target.kind === 'pm7';
const P = HOSTED ? '#pmRoot ' : '';
const browser = await launchChatBrowser(chromium);
async function safe(name, fn) { if (ONLY && !name.includes(ONLY)) return; group = name; try { await fn(); } catch (e) { check(`${name} [threw]`, false, String(e).split('\n')[0]); } }
async function fresh(o = {}) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.__errs = []; page.on('pageerror', e => page.__errs.push(e.message));
  if (o.reduced) await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('file://' + target.file);
  await page.waitForFunction(() => window.PM56_DEMO && window.PM56_STREAM && window.PM56_THOUGHT, null, { timeout: 30000 });
  await sleep(800);
  await page.evaluate(() => PM56_DEMO.completeWorking());
  if (!HOSTED) for (let i = 0; i < 4; i++) { const b = await page.$('[data-action="close-editor"]'); if (!b) break; await b.click(); await sleep(120); }
  if (o.column) await page.setViewportSize({ width: o.column, height: 900 });
  if (o.mode) await setMode(page, o.mode);
  return page;
}
/* the preference: Settings' stored row on PMConcept7, the chat's own value in the standalone (it has no Settings) */
async function setMode(page, mode) {
  if (HOSTED) {
    const ok = await page.evaluate(([id, mode]) => window.PM56_PORT.settings.set(id, mode), [ID, mode]);
    if (!ok && await page.evaluate(([id]) => PM_CHAT_SETTINGS.values()[id], [ID]) !== mode) throw new Error('Settings refused ' + mode);
    await page.waitForFunction(mode => PM56_EXT.ctx().state.capabilities.thought === mode, mode, { timeout: 3000 });
  } else await page.evaluate(mode => { const c = PM56_EXT.ctx(); c.state.capabilities.thought = mode; c.renderApp(); }, mode);
}
/* Lines shown while thinking: Settings' stored row on PMConcept7, the chat's own value in the standalone */
async function setLines(page, n) {
  if (HOSTED) {
    const ok = await page.evaluate(([id, v]) => window.PM56_PORT.settings.set(id, v), [LID, String(n)]);
    if (!ok && await page.evaluate(([id]) => PM_CHAT_SETTINGS.values()[id], [LID]) !== String(n)) throw new Error('Settings refused ' + n);
  } else await page.evaluate(n => { const c = PM56_EXT.ctx(); c.state.capabilities.thoughtLines = n; c.renderApp(); }, n);
  await page.waitForFunction(n => PM56_THOUGHT.lines.current() === n, n, { timeout: 3000 });
}
/* back to the default before a page closes: PMConcept7's Settings outlive the page (the next one reads them), so the
   stored row is restored to its default (unchanged), and the standalone's value goes back to 8 */
async function resetLines(page) {
  if (HOSTED) await page.evaluate(id => window.PM56_PORT.settings.set(id, null), LID);
  else await page.evaluate(() => { const c = PM56_EXT.ctx(); c.state.capabilities.thoughtLines = 8; c.renderApp(); });
}
const linesNow = page => page.evaluate(([id, hosted]) => ({ chat: PM56_THOUGHT.lines.current(), state: PM56_EXT.ctx().state.capabilities.thoughtLines, settings: hosted ? PM_CHAT_SETTINGS.values()[id] : null }), [LID, HOSTED]);
/* the long thought's pages: PMConcept7 draws a wider column than the standalone and releases the reasoning's words
   more slowly, so its pages use a 560 px column, and every long thought thinks for 9 s (the most a thought may) */
const LCOL = HOSTED ? 560 : null;
async function longThought(page, ms = 9000) {
  await page.evaluate(([text, ms]) => {
    const D = window.PM56_DATA, r = D.scriptedReplies.find(x => x.id === 'sr-index'), t = D.liveTurns.find(x => x.id === 'lt-build');
    r.thinking = Object.assign({}, r.thinking, { text, ms });
    t.thinking = Object.assign({}, t.thinking, { text, ms });
  }, [LONG, ms]);
}
/* the turn on screen has finished: no thought live, nothing streaming (a send while busy would queue, not reply) */
async function settled(page) {
  await page.waitForFunction(P => { const inner = document.querySelector(P + '.chat-stage .transcript-inner'); return !!inner && !inner.querySelector('[data-streaming]') && !PM56_THOUGHT.active().length; }, P, { timeout: 45000, polling: 200 });
  await sleep(400);
}
async function openLive(page) {
  await page.evaluate(() => { PM56_DEMO.selectThread('live-turn'); const c = PM56_EXT.ctx(); c.state.mode = 'Agent'; c.renderApp(); });
  await sleep(400);
}
async function send(page, text) {
  const ta = await page.$(P + 'textarea[data-input="composer"]');
  await ta.click(); await ta.fill(text); await sleep(60);
  await page.click(P + '[data-action="send"]');
}
/* one sample per frame for `ms`: the block, its reply, the reader's view and the polite status */
async function sample(page, ms) {
  await page.evaluate(([ms, P]) => {
    const t0 = performance.now();
    const W = window.__tt = { s: [], status: [], done: false, t0 };
    const tick = () => {
      const inner = document.querySelector(P + '.chat-stage .transcript-inner'), tr = document.querySelector(P + '.chat-stage .transcript');
      const T = inner ? [...inner.querySelectorAll(':scope > .message-thought')].pop() : null;
      let R = null; if (T) { for (let n = T.nextElementSibling; n; n = n.nextElementSibling) if (n.matches('.message-assistant:not(.message-thought)')) { R = n; break; } }
      const clip = T && T.querySelector('.tt-clip'), flow = clip && clip.firstElementChild, p = flow && flow.querySelector('p');
      const us = inner ? inner.querySelectorAll(':scope > [data-role="user"]') : [], u = us[us.length - 1];
      const st = document.getElementById('pm56-thought-status'), stx = st ? st.textContent : '';
      if (stx && (!W.status.length || W.status[W.status.length - 1].text !== stx)) W.status.push({ t: Math.round(performance.now() - t0), text: stx });
      W.s.push({ t: Math.round(performance.now() - t0), T: !!T, st: T ? T.dataset.thoughtState : null, open: T ? T.dataset.thoughtOpen : null, sm: T ? T.getAttribute('data-streaming') : null,
        pend: !!(T && T.querySelector('.tx-pending b')), ch: clip ? +clip.getBoundingClientRect().height.toFixed(1) : null, fh: flow ? flow.offsetHeight : null,
        lh: p ? parseFloat(getComputedStyle(p).lineHeight) : null, capped: !!(clip && clip.classList.contains('tt-capped')), folded: !!(clip && clip.classList.contains('tt-folded')),
        tw: T ? T.querySelectorAll('.tt-w').length : 0, R: !!R, rw: R ? R.querySelectorAll('.tx-w').length : 0, before: !!(T && R && (T.compareDocumentPosition(R) & 4)),
        u: u ? Math.round(u.getBoundingClientRect().top * 10) / 10 : null, g: tr ? Math.round(tr.scrollHeight - tr.clientHeight - tr.scrollTop) : null, stick: PM56_EXT.ctx().isSticky(),
        /* for a failure's trace: the list's height, the reply's height and the room hold's floor */
        ih: inner ? inner.offsetHeight : null, rh: R ? Math.round(R.getBoundingClientRect().height) : null, floor: document.documentElement.style.getPropertyValue('--tx-hold-min') || null });
      if (performance.now() - t0 < ms) requestAnimationFrame(tick); else W.done = true;
    };
    requestAnimationFrame(tick);
  }, [ms, P]);
}
const samples = page => page.evaluate(() => window.__tt);
const lastThought = (page) => page.evaluate(P => { const a = [...document.querySelectorAll(P + '.chat-stage .transcript-inner > .message-thought')].pop(); if (!a) return null; const h = a.querySelector('.tt-head'), clip = a.querySelector('.tt-clip'), body = a.querySelector('.tt-body');
  return { id: a.dataset.messageId, state: a.dataset.thoughtState, open: a.dataset.thoughtOpen, label: h.textContent.replace(/\s+/g, ' ').trim(), expanded: h.getAttribute('aria-expanded'), controls: h.getAttribute('aria-controls'), bodyId: body.id, bodyHidden: body.getAttribute('aria-hidden'), role: body.getAttribute('role'), ch: +clip.getBoundingClientRect().height.toFixed(1), fh: clip.firstElementChild.offsetHeight, folded: clip.classList.contains('tt-folded'), capped: clip.classList.contains('tt-capped'), gist: !!a.querySelector('.tt-gist') }; }, P);
/* the turn-verify predicates: the view never stays more than 24px off the bottom for longer than 300ms, and never
   drops faster than 0.4px/ms (a clamp snapping back) */
function followVerdicts(s) {
  const late = s.filter(x => x.t > 1500 && x.g != null);
  let from = null, longest = 0, at = null;
  late.forEach(x => { if (x.g > 24) { if (from == null) from = x.t; if (x.t - from >= longest) { longest = x.t - from; at = from; } } else from = null; });
  const drops = [];
  late.forEach((x, i) => { const q = late[i - 1]; if (q && x.u != null && q.u != null && x.u - q.u > 2 && (x.u - q.u) / Math.max(1, x.t - q.t) > 0.4) drops.push({ t: x.t, by: +(x.u - q.u).toFixed(1), ms: x.t - q.t }); });
  return { longest, at, drops, worst: late.length ? Math.max(...late.map(x => x.g)) : null, samples: late.length, unstuck: late.filter(x => !x.stick).length };
}

/* ------------------------------------------------------------------ auto */
await safe('auto', async () => {
  const p = await fresh({ mode: 'Auto' });
  await openLive(p);
  await sample(p, 11000);
  await send(p, Q);
  await sleep(11500);
  const W = await samples(p), s = W.s;
  const first = s.find(x => x.T);
  check('A1 the thinking block heads the turn while the model thinks: its line is the placeholder (the model\'s name, is thinking)', first && first.sm === 'pending' && first.pend && first.st === 'thinking', first);
  const thinking = s.filter(x => x.T && x.st === 'thinking');
  check('A2 the reply waits hidden under the block until the reasoning hands over', thinking.length > 20 && thinking.every(x => !x.R), { frames: thinking.length, withReply: thinking.filter(x => x.R).length });
  const mono = thinking.every((x, i) => i === 0 || x.tw >= thinking[i - 1].tw);
  check('A3 the reasoning streams in: its words only grow while it thinks', mono && thinking[thinking.length - 1].tw > 40, { last: thinking[thinking.length - 1]?.tw, mono });
  /* the recorded reasoning runs about eight lines here, so it may or may not pass the default window; the lines group
     overflows every choice on purpose */
  const lh = (thinking.find(x => x.lh) || {}).lh || 20, maxH = Math.max(...thinking.map(x => x.ch || 0)), over = thinking.filter(x => x.fh > lh * 8 + 8);
  check('A4 Auto never shows more than the default eight lines while it thinks; past them the window is capped and fades at the top', maxH <= lh * 8 + 1 && over.every(x => x.capped), { maxH, cap: lh * 8, overflowingFrames: over.length, cappedFrames: over.filter(x => x.capped).length });
  const ai = s.findIndex(x => x.R && x.rw > 0), a = s[ai];
  check('A5 Auto folds when the answer starts: in the frame its first word shows, the block is done and folding', a && a.st === 'done' && a.open === '0' && a.before, a);
  const after = a ? s.filter(x => x.t > a.t && x.t <= a.t + 600) : [];
  const landed = after.find(x => x.ch <= 0.5 && x.folded);
  check('A6 the fold lands folded (0px, hidden) within the fold\'s time', !!landed && landed.t - a.t <= 520, landed ? { ms: landed.t - a.t } : { tail: after.slice(-2) });
  const T = await lastThought(p);
  check('A7 the folded line says how long it thought, with its gist; collapsed to assistive tech', /^Thought for \d+s · Equality before range/.test(T.label) && T.expanded === 'false' && T.bodyHidden === 'true' && T.controls === T.bodyId && T.role === 'group', T);
  const head = P + `.message-thought[data-message-id="${T.id}"] .tt-head`;
  await p.click(head); await sleep(700);
  const o1 = await lastThought(p);
  check('A8 a click opens the folded block to its whole reasoning', o1.open === '1' && o1.expanded === 'true' && o1.bodyHidden == null && Math.abs(o1.ch - o1.fh) <= 1 && !o1.capped && !o1.gist, o1);
  await p.focus(head); await p.keyboard.press('Enter'); await sleep(700);
  const o2 = await lastThought(p);
  check('A9 Enter on the focused line folds it again (keyboard reachable)', o2.open === '0' && o2.expanded === 'false' && o2.ch <= 0.5, o2);
  const f = followVerdicts(s);
  check('A10 the fold never pulls the thread down (no clamp snap) and follow-along holds through the turn (<=300ms away)', f.drops.length === 0 && f.longest <= 300 && f.unstuck === 0, f);
  const st = W.status;
  check('A11 screen readers hear two polite statuses, start and end, never the words', st.length === 2 && /is thinking\.$/.test(st[0].text) && /^Thought for \d+ seconds?\.$/.test(st[1].text), st);
  const live = await p.evaluate(P => ({ transcript: document.querySelector(P + '.chat-stage .transcript').getAttribute('aria-live'), role: document.getElementById('pm56-thought-status')?.getAttribute('role'), polite: document.getElementById('pm56-thought-status')?.getAttribute('aria-live') }), P);
  check('A12 the transcript is not a live region; the status is role=status, polite', !live.transcript && live.role === 'status' && live.polite === 'polite', live);
  check('A13 no page errors', p.__errs.length === 0, p.__errs.slice(0, 2));
  await p.close();
});

/* ------------------------------------------------------------------ expanded */
await safe('expanded', async () => {
  const p = await fresh({ mode: 'Expanded' });
  await openLive(p);
  await sample(p, 11000);
  await send(p, Q);
  await sleep(11500);
  const s = (await samples(p)).s, thinking = s.filter(x => x.T && x.st === 'thinking');
  check('E1 Expanded never caps the reasoning while it thinks', thinking.length > 20 && thinking.every(x => !x.capped) && thinking[thinking.length - 1].ch >= thinking[thinking.length - 1].fh - 24, { frames: thinking.length, last: thinking[thinking.length - 1] });
  const a = s.find(x => x.R && x.rw > 0);
  check('E2 Expanded stays open when the answer starts', a && a.st === 'done' && a.open === '1', a);
  const T = await lastThought(p);
  check('E3 Expanded stays open beside the finished answer: whole reasoning, no gist, expanded', T.open === '1' && T.expanded === 'true' && Math.abs(T.ch - T.fh) <= 1 && !T.gist && /^Thought for \d+s$/.test(T.label), T);
  check('E4 no page errors', p.__errs.length === 0, p.__errs.slice(0, 2));
  await p.close();
});

/* ------------------------------------------------------------------ agent */
await safe('agent', async () => {
  const p = await fresh({ mode: 'Auto' });
  await openLive(p);
  await p.evaluate(([ms, P]) => {
    const W = window.__tta = { s: [] }, t0 = performance.now();
    const tick = () => {
      const inner = document.querySelector(P + '.chat-stage .transcript-inner'), tr = document.querySelector(P + '.chat-stage .transcript');
      const T = inner ? [...inner.querySelectorAll(':scope > .message-thought')].pop() : null;
      const card = T ? (() => { for (let n = T.nextElementSibling; n; n = n.nextElementSibling) if (n.matches('.working-card') || n.querySelector(':scope > .working-card')) return n; return null; })() : null;
      const us = inner ? inner.querySelectorAll(':scope > [data-role="user"]') : [], u = us[us.length - 1];
      W.s.push({ t: Math.round(performance.now() - t0), T: !!T, st: T ? T.dataset.thoughtState : null, open: T ? T.dataset.thoughtOpen : null, card: !!card,
        before: !!(T && card && (T.compareDocumentPosition(card) & 4)), u: u ? Math.round(u.getBoundingClientRect().top * 10) / 10 : null,
        g: tr ? Math.round(tr.scrollHeight - tr.clientHeight - tr.scrollTop) : null, stick: PM56_EXT.ctx().isSticky() });
      if (performance.now() - t0 < ms) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [9000, P]);
  await send(p, "Add the composite index and prove it's faster.");
  await sleep(9500);
  const s = (await p.evaluate(() => window.__tta)).s;
  const thinking = s.filter(x => x.T && x.st === 'thinking');
  check('G1 no working card while the model thinks; the reasoning streams first', thinking.length > 20 && thinking.every(x => !x.card), { frames: thinking.length, withCard: thinking.filter(x => x.card).length });
  const born = s.find(x => x.card);
  check('G2 Auto folds as the first tool call starts: the block is done and folded above the card in the card\'s first frame', born && born.st === 'done' && born.open === '0' && born.before, born);
  const f = followVerdicts(s);
  check('G3 the card\'s birth and the fold never snap the thread down; the reader stays at the bottom', f.drops.length === 0 && f.unstuck === 0, f);
  results.push({ group: 'agent', label: 'G-follow (diagnostic: the catch-up after the card\'s birth, turn-verify\'s predicate applies there)', pass: true, diagnostic: true, sizeContext: testGeometry(), detail: f });
  check('G4 no page errors', p.__errs.length === 0, p.__errs.slice(0, 2));
  await p.close();
});

/* ------------------------------------------------------------------ lines */
await safe('lines', async () => {
  const p = await fresh({ mode: 'Auto', column: LCOL });
  const def = await linesNow(p), defChanged = HOSTED ? await p.evaluate(id => PM_CHAT_SETTINGS.changed()[id], LID) : null;
  check('L1 Lines shown while thinking defaults to 8' + (HOSTED ? ' (Settings holds its stored default, unchanged)' : ''), def.chat === 8 && def.state === 8 && (!HOSTED || (def.settings === '8' && !defChanged)), { def, defChanged });
  await longThought(p);
  await openLive(p);
  const sizes = {};
  for (const n of [8, 4, 6, 12, 16]) {
    if (n !== 8) await setLines(p, n);
    await sample(p, 13500);
    await send(p, Q);
    await sleep(14000);
    const s = (await samples(p)).s, thinking = s.filter(x => x.T && x.st === 'thinking');
    const lh = (thinking.find(x => x.lh) || {}).lh || 20, cap = Math.round(lh * n), maxH = Math.max(...thinking.map(x => x.ch || 0));
    const over = thinking.filter(x => x.fh > cap + 8), above = thinking.filter(x => x.ch > cap + 1);
    sizes[n] = { lh, cap, maxH, overflowingFrames: over.length, cappedFrames: over.filter(x => x.capped).length, frames: thinking.length };
    check(`L-${n} ${n} lines: the live window rises to exactly ${n} lines and no further; the rest fades at the top`, thinking.length > 20 && Math.abs(maxH - cap) <= 1.5 && above.length === 0 && over.length > 10 && over.every(x => x.capped), sizes[n]);
    /* the turns before this one are on screen too: the answer is the first reply word after this thought began */
    const from = s.findIndex(x => x.T && x.st === 'thinking'), a = from < 0 ? null : s.slice(from).find(x => x.R && x.rw > 0);
    const landed = a ? s.find(x => x.t > a.t && x.t <= a.t + 600 && x.ch <= 0.5 && x.folded) : null, f = followVerdicts(s);
    const ftrace = f.drops.length ? s.filter(x => x.t >= f.drops[0].t - 300 && x.t <= f.drops[0].t + 150).map(x => ({ t: x.t, u: x.u, g: x.g, ih: x.ih, rh: x.rh, rw: x.rw, floor: x.floor, ch: x.ch })) : undefined;
    check(`L-${n} ${n} lines: it folds as the answer starts and lands folded; no clamp snap, follow-along holds (<=300ms away)`, !!a && a.st === 'done' && a.open === '0' && !!landed && landed.t - a.t <= 520 && f.drops.length === 0 && f.longest <= 300 && f.unstuck === 0,
      { fold: a ? { st: a.st, open: a.open, landedMs: landed ? landed.t - a.t : null, at: a.t } : null, follow: f, trace: ftrace });
    await settled(p);
  }
  results.push({ group: 'lines', label: 'L-sizes (diagnostic: per choice, line height, cap, tallest window, frames past the cap)', pass: true, diagnostic: true, sizeContext: testGeometry(), detail: sizes });
  /* the tallest window in an agent turn: the reasoning folds as it ends and the card enters into the room it gave back */
  await p.evaluate(() => { const c = PM56_EXT.ctx(); c.state.mode = 'Agent'; c.renderApp(); });
  await p.evaluate(([ms, P]) => {
    const W = window.__tta = { s: [] }, t0 = performance.now();
    const tick = () => {
      const inner = document.querySelector(P + '.chat-stage .transcript-inner'), tr = document.querySelector(P + '.chat-stage .transcript');
      const T = inner ? [...inner.querySelectorAll(':scope > .message-thought')].pop() : null;
      const card = T ? (() => { for (let n = T.nextElementSibling; n; n = n.nextElementSibling) if (n.matches('.working-card') || n.querySelector(':scope > .working-card')) return n; return null; })() : null;
      const clip = T && T.querySelector('.tt-clip'), us = inner ? inner.querySelectorAll(':scope > [data-role="user"]') : [], u = us[us.length - 1];
      W.s.push({ t: Math.round(performance.now() - t0), T: !!T, st: T ? T.dataset.thoughtState : null, open: T ? T.dataset.thoughtOpen : null, card: !!card, ch: clip ? +clip.getBoundingClientRect().height.toFixed(1) : null,
        before: !!(T && card && (T.compareDocumentPosition(card) & 4)), u: u ? Math.round(u.getBoundingClientRect().top * 10) / 10 : null,
        g: tr ? Math.round(tr.scrollHeight - tr.clientHeight - tr.scrollTop) : null, stick: PM56_EXT.ctx().isSticky(),
        /* for a failure's trace: the card's height, the list's height and the room hold's floor */
        cardH: card ? Math.round(card.getBoundingClientRect().height) : null, ih: inner ? inner.offsetHeight : null, floor: document.documentElement.style.getPropertyValue('--tx-hold-min') || null });
      if (performance.now() - t0 < ms) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [13500, P]);
  await send(p, AGENT_Q);
  await sleep(14000);
  const g = (await p.evaluate(() => window.__tta)).s, gThinking = g.filter(x => x.T && x.st === 'thinking'), born = g.find(x => x.card), gf = followVerdicts(g);
  const gMax = Math.max(...gThinking.map(x => x.ch || 0));
  check('L-agent 16 lines in an agent turn: no card while it thinks; the window reaches 16 lines, then folds before the card enters', gThinking.length > 20 && gThinking.every(x => !x.card) && gMax >= sizes[16].cap - 1.5 && !!born && born.st === 'done' && born.open === '0' && born.before,
    { frames: gThinking.length, tallest: gMax, born });
  const trace = gf.drops.length ? g.filter(x => x.t >= gf.drops[0].t - 400 && x.t <= gf.drops[0].t + 200).map(x => ({ t: x.t, u: x.u, g: x.g, cardH: x.cardH, ih: x.ih, floor: x.floor, ch: x.ch })) : undefined;
  check('L-agent the fold of a 16-line window and the card\'s birth never snap the thread down; the reader stays at the bottom', gf.drops.length === 0 && gf.unstuck === 0, trace ? Object.assign({}, gf, { trace }) : gf);
  check('L-errors no page errors', p.__errs.length === 0, p.__errs.slice(0, 2));
  await resetLines(p);
  await p.close();

  /* a change while it thinks: the window glides to its new height, and back. Before, a window that grew by more than
     40 px jumped to 40 px short of its target in one frame (the growth clamp), so the check is that the change takes
     time and passes through the heights in between */
  const attempts = [], takeovers = [];
  const liveLabel = 'L-live a change to 16 lines mid-thought glides the window open to 16 lines (no step), and back to 4 glides it closed';
  let conclusive = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const q = await fresh({ mode: 'Auto', column: LCOL });
    try {
      await longThought(q);
      await openLive(q);
      await setLines(q, 4);
      await sample(q, 12000);
      await send(q, Q);
      /* the reasoning has run well past 16 lines while the window shows 4 */
      try {
        await q.waitForFunction(P => { const a = [...document.querySelectorAll(P + '.transcript-inner > .message-thought')].pop(); const c = a && a.querySelector('.tt-clip'), p = c && c.querySelector('p');
          const lh = p ? parseFloat(getComputedStyle(p).lineHeight) : 20; return a && a.dataset.thoughtState === 'thinking' && c.classList.contains('tt-capped') && c.firstElementChild.offsetHeight > lh * 16 + 24; }, P, { timeout: 9000, polling: 50 });
      } catch (error) {
        if (error?.name !== 'TimeoutError') throw error;
        attempts.push({ attempt, upAt: null, left: null, reason: 'not past 16 lines while thinking' });
        continue;
      }
      const upAt = await q.evaluate(() => performance.now() - window.__tt.t0);
      const left = await q.evaluate(P => { const L = PM56_THOUGHT.active().pop(); const s = window.__tt.s, first = s.find(x => x.T && x.st === 'thinking');
        return L && first ? Math.round(first.t + L.ms - (performance.now() - window.__tt.t0)) : null; }, P);
      attempts.push({ attempt, upAt, left });
      await setLines(q, 16);
      await sleep(600);
      const downAt = await q.evaluate(() => performance.now() - window.__tt.t0);
      await setLines(q, 4);
      await sleep(700);
      /* A late setup is inconclusive for the two glides, but still witnesses the fold taking over from its current height. */
      if (left == null || left < 1500) {
        await q.waitForFunction(P => { const a = [...document.querySelectorAll(P + '.transcript-inner > .message-thought')].pop(); return a && a.dataset.thoughtState !== 'thinking'; }, P, { timeout: 3000 });
        await sleep(600);
      }
      const ls = (await samples(q)).s, llh = (ls.find(x => x.lh) || {}).lh || 20, c4 = Math.round(llh * 4), c16 = Math.round(llh * 16);
      function glide(fromT, a, b) {
        const run = ls.filter(x => x.T && x.st === 'thinking' && x.t >= fromT - 20);
        const startI = run.findIndex(x => Math.abs(x.ch - a) > 1), endI = run.findIndex(x => Math.abs(x.ch - b) <= 2);
        if (startI < 0 || endI < 0 || endI < startI) return { ok: false, startI, endI, tail: run.slice(0, 4) };
        const span = run.slice(startI, endI + 1), first = Math.abs(span[0].ch - a), whole = Math.abs(b - a);
        const between = span.filter(x => Math.min(a, b) + 2 < x.ch && x.ch < Math.max(a, b) - 2).length;
        const monotone = span.every((x, i) => i === 0 || (b > a ? x.ch >= span[i - 1].ch - 0.5 : x.ch <= span[i - 1].ch + 0.5));
        return { ok: first <= whole * 0.5 && between >= 4 && span[span.length - 1].t - span[0].t >= 80 && monotone, firstStep: +first.toFixed(1), whole, between, ms: span[span.length - 1].t - span[0].t, monotone };
      }
      const up = glide(upAt, c4, c16), down = glide(downAt, c16, c4);
      const lastThinking = ls.findLastIndex(x => x.T && x.st === 'thinking'), tail = ls.slice(lastThinking);
      const handed = lastThinking >= 0 ? tail.find(x => x.T && x.st !== 'thinking') : null;
      const downLanded = ls.some(x => x.T && x.st === 'thinking' && x.t >= downAt && Math.abs(x.ch - c4) <= 2);
      if (handed && handed.t >= upAt && !downLanded) {
        const landed = tail.find(x => x.t >= handed.t && x.t - handed.t <= 520 && x.ch <= 0.5 && x.folded);
        const monotone = tail.every((x, i) => i === 0 || x.ch <= tail[i - 1].ch + 0.5);
        const ok = handed.ch <= tail[0].ch + 0.5 && monotone && !!landed;
        takeovers.push({ attempt, ok, lastThinking: tail[0], handed, landedMs: landed ? landed.t - handed.t : null, monotone,
          trace: ok ? undefined : tail });
      }
      check('L-live no page errors', q.__errs.length === 0, { attempt, errors: q.__errs.slice(0, 2) });
      if (left != null && left >= 1500) {
        conclusive = true;
        check(liveLabel, up.ok && down.ok, { up, down, lh: llh, attempts });
        break;
      }
    } finally {
      try { await resetLines(q); } finally { await q.close(); }
    }
  }
  if (!conclusive) check(liveLabel, false, { inconclusive: attempts });
  check('L-live a thought that ends mid-glide folds from the height it reached', takeovers.every(x => x.ok),
    takeovers.length ? { ran: true, attempts: takeovers } : { ran: false });

  /* Expanded is never capped, whatever the lines */
  const e = await fresh({ mode: 'Expanded', column: LCOL });
  await longThought(e);
  await setLines(e, 4);
  await openLive(e);
  await sample(e, 11000);
  await send(e, Q);
  await sleep(11500);
  const es = (await samples(e)).s.filter(x => x.T && x.st === 'thinking'), elh = (es.find(x => x.lh) || {}).lh || 20, eLast = es[es.length - 1];
  check('L-expanded Always open ignores the lines: at 4 lines the long reasoning is never capped and shows whole', es.length > 20 && es.every(x => !x.capped) && !!eLast && eLast.ch > elh * 16 && eLast.ch >= eLast.fh - 24, { frames: es.length, last: eLast });
  check('L-expanded no page errors', e.__errs.length === 0, e.__errs.slice(0, 2));
  await resetLines(e);
  await e.close();

  /* Reduced Motion: each height lands at once */
  const r = await fresh({ mode: 'Auto', reduced: true, column: LCOL });
  await longThought(r);
  await openLive(r);
  await setLines(r, 6);
  await sample(r, 11000);
  await send(r, Q);
  await r.waitForFunction(P => { const a = [...document.querySelectorAll(P + '.transcript-inner > .message-thought')].pop(); const c = a && a.querySelector('.tt-clip'); return a && a.dataset.thoughtState === 'thinking' && c && c.classList.contains('tt-capped'); }, P, { timeout: 8000 });
  await sleep(300);
  await setLines(r, 12);
  await sleep(1200);
  const rs = (await samples(r)).s.filter(x => x.T && x.st === 'thinking'), rlh = (rs.find(x => x.lh) || {}).lh || 20;
  const sixes = rs.filter(x => x.fh > rlh * 6 + 8 && x.ch <= rlh * 6 + 1.5), between = rs.filter(x => x.ch > rlh * 6 + 1.5 && x.ch < rlh * 12 - 1.5 && x.fh > rlh * 12 + 8);
  const twelve = rs.filter(x => Math.abs(x.ch - Math.round(rlh * 12)) <= 1.5);
  check('L-reduced under Reduced Motion the window sits at exactly 6 lines, then at exactly 12 the frame after the change (no frames in between)', sixes.length > 5 && sixes.every(x => Math.abs(x.ch - Math.round(rlh * 6)) <= 1.5) && twelve.length > 5 && between.length === 0,
    { sixFrames: sixes.length, twelveFrames: twelve.length, between: between.slice(0, 3) });
  check('L-reduced no page errors', r.__errs.length === 0, r.__errs.slice(0, 2));
  await resetLines(r);
  await r.close();
});

/* ------------------------------------------------------------------ prefs */
await safe('prefs', async () => {
  const p = await fresh({ mode: 'Auto' });
  await openLive(p);
  await send(p, Q);
  await p.waitForFunction(P => { const a = [...document.querySelectorAll(P + '.transcript-inner > .message-thought')].pop(); const r = a && a.nextElementSibling; return a && a.dataset.thoughtState === 'done' && r && !r.hasAttribute('data-streaming'); }, P, { timeout: 15000 });
  await sleep(500);
  const pick = async value => {
    /* the composer's wand, its Preferences group, the Thought Stream row, then the choice: the menu a person uses */
    await p.click(P + '[data-action="open-menu"][data-menu="wand"]'); await sleep(350);
    if (!(await p.$('#pmOverlayRoot [data-submenu="thought-menu"]'))) { await p.click('#pmOverlayRoot [data-action="polish-wand-group"][data-group="preferences"]'); await sleep(350); }
    await p.click('#pmOverlayRoot [data-submenu="thought-menu"]'); await sleep(350);
    await p.click(`#pmOverlayRoot [data-action="set-thought-cap"][data-value="${value}"]`); await sleep(700);
  };
  const state = () => p.evaluate(([id, hosted]) => ({ chat: PM56_EXT.ctx().state.capabilities.thought, settings: hosted ? PM_CHAT_SETTINGS.values()[id] : null }), [ID, HOSTED]);
  await pick('Expanded');
  const s1 = await state(), t1 = await lastThought(p);
  check('P1 the composer\'s Thought Stream menu sets Always open, and a folded block on screen opens' + (HOSTED ? '; Settings stores it' : ''), s1.chat === 'Expanded' && (!HOSTED || s1.settings === 'Expanded') && t1.open === '1' && Math.abs(t1.ch - t1.fh) <= 1, { s1, t1 });
  await pick('Auto');
  const s2 = await state(), t2 = await lastThought(p);
  check('P2 back to While it thinks: the block folds again' + (HOSTED ? '; Settings stores it' : ''), s2.chat === 'Auto' && (!HOSTED || s2.settings === 'Auto') && t2.open === '0' && t2.ch <= 0.5, { s2, t2 });
  /* New chat defaults: the same value through its own guarded path */
  await p.evaluate(() => { const b = document.createElement('button'); b.dataset.action = 'af-settings-open'; (document.querySelector('#pmRoot') || document.body).appendChild(b); b.click(); b.remove(); });
  await sleep(500);
  const ok = await p.evaluate(() => window.PM56_FEATURES.setDefault('thought', 'Expanded'));
  await sleep(500);
  const s3 = await state(), t3 = await lastThought(p);
  check('P3 New chat defaults\' Thought Stream sets the same value and the block follows' + (HOSTED ? '; Settings stores it' : ''), ok && s3.chat === 'Expanded' && (!HOSTED || s3.settings === 'Expanded') && t3.open === '1', { ok, s3, t3 });
  await p.evaluate(() => { const b = document.querySelector('#pmOverlayRoot [data-action="close-dialog"]'); if (b) b.click(); });
  await sleep(300);
  /* Lines shown while thinking: the composer's list under Thought Stream, then New chat defaults' second dropdown, each
     through its own control */
  await p.click(P + '[data-action="open-menu"][data-menu="wand"]'); await sleep(350);
  if (!(await p.$('#pmOverlayRoot [data-submenu="thought-menu"]'))) { await p.click('#pmOverlayRoot [data-action="polish-wand-group"][data-group="preferences"]'); await sleep(350); }
  await p.click('#pmOverlayRoot [data-submenu="thought-menu"]'); await sleep(350);
  const listed = await p.evaluate(() => [...document.querySelectorAll('#pmOverlayRoot [data-overlay="sidecar"] [data-action="set-thought-lines"]')].map(b => b.textContent.trim() + (b.classList.contains('active') ? '*' : '')));
  await p.click('#pmOverlayRoot [data-action="set-thought-lines"][data-value="12"]'); await sleep(600);
  const l1 = await linesNow(p), menuGone = !(await p.$('#pmOverlayRoot [data-overlay="sidecar"]'));
  check('P7 the composer\'s Thought Stream menu lists 4 to 16 lines (8 checked) and sets 12' + (HOSTED ? '; Settings stores "12"' : ''), JSON.stringify(listed) === JSON.stringify(['4 lines', '6 lines', '8 lines*', '12 lines', '16 lines']) && l1.chat === 12 && l1.state === 12 && (!HOSTED || l1.settings === '12') && menuGone, { listed, l1, menuGone });
  await p.evaluate(() => { const b = document.createElement('button'); b.dataset.action = 'af-settings-open'; (document.querySelector('#pmRoot') || document.body).appendChild(b); b.click(); b.remove(); });
  await sleep(600);
  const shown = await p.evaluate(() => (document.querySelector('#pmOverlayRoot [data-field="thoughtLines"]') || {}).textContent || '');
  await p.click('#pmOverlayRoot [data-field="thoughtLines"]'); await sleep(450);
  await p.click('.overlay-menu [data-action="shared-choice-pick"][data-value="6"]'); await sleep(600);
  const l2 = await linesNow(p), shown2 = await p.evaluate(() => (document.querySelector('#pmOverlayRoot [data-field="thoughtLines"]') || {}).textContent || '');
  const sheet = await p.evaluate(() => { const b = document.querySelector('#pmOverlayRoot .pmx-sheet .pmx-body'); return b ? { scroll: b.scrollHeight, client: b.clientHeight } : null; });
  check('P8 New chat defaults\' Lines shown while thinking dropdown reads the value in force and sets 6' + (HOSTED ? '; Settings stores "6"' : '') + '; the sheet still fits without scrolling',
    /^12 lines/.test(shown.trim()) && /^6 lines\s*Shown while it thinks$/.test(shown2.replace(/\s+/g, ' ').trim()) && l2.chat === 6 && l2.state === 6 && (!HOSTED || l2.settings === '6') && !!sheet && sheet.scroll <= sheet.client + 1,
    { shown, shown2, l2, sheet });
  /* the sheet's tallest state with the second dropdown: Always open (still set from P3) and a naming model that isn't
     available, whose note sits under Name new chats (tests/pmx-surfaces/prefs.mjs: it "must not scroll either") */
  await p.evaluate(() => window.PM56_FEATURES.setDefault('title', 'model:opus5-personal')); await sleep(900);
  const tall = await p.evaluate(() => { const sh = document.querySelector('#pmOverlayRoot .pmx-sheet'), b = sh && sh.querySelector('.pmx-body');
    return b ? { scroll: b.scrollHeight, client: b.clientHeight, warn: !!sh.querySelector('.pmx-dflt-warn-note'), thought: window.PM56_EXT.ctx().state.capabilities.thought } : null; });
  check('P8b in its tallest state (Always open, a naming model that isn\'t available) New chat defaults still fits without scrolling', !!tall && tall.warn && tall.thought === 'Expanded' && tall.scroll <= tall.client + 1, tall);
  await p.evaluate(() => window.PM56_FEATURES.setDefault('title', 'default')); await sleep(400);
  await p.evaluate(() => { const b = document.querySelector('#pmOverlayRoot [data-action="close-dialog"]'); if (b) b.click(); });
  await sleep(300);
  if (HOSTED) {
    const okS = await p.evaluate(id => PM56_PORT.settings.set(id, 'Auto'), ID); await sleep(500);
    const s4 = await state(), t4 = await lastThought(p);
    check('P4 a change in Settings reaches the chat: every block follows (Settings -> chat)', okS && s4.chat === 'Auto' && s4.settings === 'Auto' && t4.open === '0', { okS, s4, t4 });
    const help = await p.evaluate(() => document.documentElement.outerHTML.includes('Shown when the model shares its reasoning. While it thinks folds it to one line once the answer starts; Always open keeps it beside the answer.'));
    check('P5 the Settings row help describes the live display, not a preview', help && !(await p.evaluate(() => document.documentElement.outerHTML.includes('previews the choice in New chat defaults'))), { help });
    /* the Settings row itself: under Show thinking, its own dropdown, and the chat follows */
    await p.evaluate(() => document.querySelector('#tab-settings').click()); await sleep(900);
    await p.evaluate(id => PM51.revealSetting(id), LID);
    await p.waitForFunction(id => { const r = document.querySelector(`[id="setting-${id}"]`); return r && r.getBoundingClientRect().height > 0; }, LID, { timeout: 8000 });
    await sleep(600);
    const row = await p.evaluate(([id, tid]) => { const r = document.querySelector(`[id="setting-${id}"]`);
      return { prev: r.previousElementSibling?.id, next: r.nextElementSibling?.id, label: r.querySelector('.setting-label')?.textContent.trim(), help: r.querySelector('.setting-description')?.textContent.trim(),
        value: r.querySelector('.pm51-dd-value')?.textContent.trim(), options: [...r.querySelectorAll('select option')].map(o => o.value + '=' + o.textContent.trim()), tid }; }, [LID, ID]);
    check('P9 the Settings row "Lines shown while thinking" sits right under Show thinking, offers 4 to 16 lines and shows the value in force (6 lines)',
      row.prev === 'setting-' + ID && row.next === 'setting-general.interaction.chat-history-list' && /^Lines shown while thinking/.test(row.label || '') && /older lines fade at the top/.test(row.help || '')
        && JSON.stringify(row.options) === JSON.stringify(CHOICES.map(n => `${n}=${n} lines`)) && row.value === '6 lines', row);
    await p.click(`[id="setting-${LID}"] .pm51-dd-trigger`); await sleep(450);
    await p.locator('.pm51-dd-list.is-open .pm51-popout-item', { hasText: '16 lines' }).first().click(); await sleep(700);
    const l3 = await linesNow(p), shown3 = await p.evaluate(id => document.querySelector(`[id="setting-${id}"] .pm51-dd-value`)?.textContent.trim(), LID);
    check('P10 choosing 16 lines in the Settings row reaches the chat (Settings -> chat)', l3.settings === '16' && l3.chat === 16 && l3.state === 16 && shown3 === '16 lines', { l3, shown3 });
    const refused = await p.evaluate(id => [PM56_PORT.settings.set(id, '7'), PM56_PORT.settings.set(id, 'Auto'), PM56_PORT.settings.set(id, 8)], LID), l4 = await linesNow(p);
    check('P11 Settings refuses a choice it does not offer (7, Auto, the number 8); the chat keeps 16', refused.every(x => x === false) && l4.chat === 16 && l4.settings === '16', { refused, l4 });
    await p.evaluate(() => { const t = document.querySelector('#tab-home') || [...document.querySelectorAll('.page-tab')].find(x => x.dataset.page === 'home'); if (t) t.click(); });
    await sleep(500);
  }
  await resetLines(p);
  check('P6 no page errors', p.__errs.length === 0, p.__errs.slice(0, 2));
  await p.close();
});

/* ------------------------------------------------------------------ reduced */
await safe('reduced', async () => {
  const p = await fresh({ mode: 'Auto', reduced: true });
  await openLive(p);
  await p.evaluate(P => {
    window.__ttr = { words: 0, animatedWords: 0, clipAnims: 0, labelAnims: 0 };
    new MutationObserver(list => list.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType !== 1) return;
      const ws = n.matches && n.matches('.tt-w') ? [n] : n.querySelectorAll ? [...n.querySelectorAll('.tt-w')] : [];
      ws.forEach(w => { window.__ttr.words++; if (getComputedStyle(w).animationName !== 'none' || w.getAnimations().length) window.__ttr.animatedWords++; });
    }))).observe(document.querySelector(P + '.chat-stage .transcript-inner'), { childList: true, subtree: true });
    const tick = () => { const c = document.querySelector(P + '.message-thought .tt-clip'); if (c && c.getAnimations().length) window.__ttr.clipAnims++; const l = document.querySelector(P + '.message-thought .tt-label'); if (l && l.getAnimations().length) window.__ttr.labelAnims++; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, P);
  await sample(p, 10000);
  await send(p, Q);
  await sleep(10500);
  const r = await p.evaluate(() => window.__ttr), s = (await samples(p)).s;
  check('R1 under Reduced Motion the reasoning words are born still', r.words > 40 && r.animatedWords === 0, r);
  const a = s.find(x => x.R && x.rw > 0);
  check('R2 the fold lands at once (folded in the answer\'s first frame, no running animation)', a && a.st === 'done' && a.ch <= 0.5 && a.folded && r.clipAnims === 0 && r.labelAnims === 0, { a, r });
  const T = await lastThought(p), done = await p.evaluate(P => { const a = [...document.querySelectorAll(P + '.transcript-inner > .message-assistant:not(.message-thought)')].pop(); return { streaming: a.hasAttribute('data-streaming'), words: a.querySelector('.message-body').textContent.trim().length }; }, P);
  check('R3 the reply still streams and settles; the block ends folded with its line', !done.streaming && done.words > 100 && T.open === '0' && /^Thought for/.test(T.label), { done, T });
  check('R4 no page errors', p.__errs.length === 0, p.__errs.slice(0, 2));
  await p.close();
});

/* ------------------------------------------------------------------ stop */
await safe('stop', async () => {
  const p = await fresh({ mode: 'Auto' });
  await openLive(p);
  await send(p, Q);
  await p.waitForFunction(P => { const a = [...document.querySelectorAll(P + '.transcript-inner > .message-thought')].pop(); return a && a.querySelectorAll('.tt-w').length > 25; }, P, { timeout: 8000 });
  const words = await p.evaluate(P => [...document.querySelectorAll(P + '.transcript-inner > .message-thought')].pop().querySelectorAll('.tt-w').length, P);
  await p.click(P + '[data-action="stop-run"]'); await sleep(600);
  const T = await lastThought(p), r = await p.evaluate(P => { const a = [...document.querySelectorAll(P + '.transcript-inner > .message-assistant:not(.message-thought)')].pop(); const t = [...document.querySelectorAll(P + '.transcript-inner > .message-thought')].pop(); return { stopped: !!(a && a.querySelector('.tx-terminal-stopped')), streaming: !!document.querySelector(P + '.transcript-inner [data-streaming]'), send: !!document.querySelector(P + '[data-action="send"]'), kept: t.querySelectorAll('.tt-w').length, after: !!(t && a && (t.compareDocumentPosition(a) & 4)) }; }, P);
  check('S1 Stop while it thinks ends the thought where it was ("Thinking ended after Ns") and keeps the words shown', T.state === 'ended' && /^Thinking ended after \d+s$/.test(T.label) && r.kept >= words && r.kept < 120, { T, r, words });
  check('S2 the reply under it shows its Stopped marker; nothing is left streaming; Send returns', r.stopped && r.after && !r.streaming && r.send, r);
  check('S3 no page errors', p.__errs.length === 0, p.__errs.slice(0, 2));
  await p.close();
});

/* ------------------------------------------------------------------ hover */
await safe('hover', async () => {
  const p = await fresh({ mode: 'Auto' });
  await openLive(p);
  await send(p, Q);
  await p.waitForFunction(P => { const a = [...document.querySelectorAll(P + '.transcript-inner > .message-thought')].pop(); return a && a.dataset.thoughtState === 'done'; }, P, { timeout: 15000 });
  await sleep(4500);
  await p.keyboard.press('Tab');
  const T = await lastThought(p), head = P + `.message-thought[data-message-id="${T.id}"] .tt-head`;
  await p.focus(head); await sleep(1700);
  const tag = await p.evaluate(([hosted, sel]) => {
    const el = document.querySelector(sel);
    if (hosted) { const v = document.querySelector('#pm-hover-tag-visual[data-open="true"]'); return { open: !!v, mine: window.PM_HOVER_TAG_CONTROLLER?.active === el, text: v ? v.textContent.replace(/\s+/g, ' ').trim() : '', label: el.getAttribute('data-pm-hover-label'), detail: el.getAttribute('data-pm-hover-detail') }; }
    const o = document.querySelector('#pmOverlayRoot > [data-overlay="hover"]'); return { open: !!o, mine: !!o && (o.dataset.hoverSig || '').includes(el.dataset.hoverKey), text: o ? o.textContent.replace(/\s+/g, ' ').trim() : '', label: null, detail: null };
  }, [HOSTED, head]);
  check('H1 keyboard focus on the line opens its hover tag', tag.open && tag.mine, tag);
  check('H2 the tag carries real copy: "Show thinking" and what it does', /Show thinking/.test(tag.text) && /Opens the reasoning the model shared before it answered/.test(tag.text) && (!HOSTED || (tag.label === 'Show thinking' && /^Opens the reasoning/.test(tag.detail || ''))), tag);
  check('H3 no page errors', p.__errs.length === 0, p.__errs.slice(0, 2));
  await p.close();
});

/* ------------------------------------------------------------------ studio */
await safe('studio', async () => {
  for (const flow of ['auto', 'expanded']) {
    const p = await fresh({ mode: 'Auto' });
    const before = await p.evaluate(([id, hosted]) => hosted ? PM_CHAT_SETTINGS.values()[id] : PM56_EXT.ctx().state.capabilities.thought, [ID, HOSTED]);
    const tile = await target.demoTrigger(p, 'thought-demo-start', flow);
    await tile.click();
    await p.waitForFunction(() => window.PM56_THOUGHT_DEMOS && window.PM56_THOUGHT_DEMOS.snapshot(), null, { timeout: 8000 });
    await p.waitForFunction(flow => { const s = PM56_THOUGHT_DEMOS.snapshot(); return s && s.phase === 'answered' && (flow === 'expanded' || s.reopened); }, flow, { timeout: 30000, polling: 250 }).catch(() => {});
    /* the guide keeps each sentence on screen for at least its hold (recorded-play.js HOLD_SAY) */
    await sleep(2900);
    const snap = await p.evaluate(() => PM56_THOUGHT_DEMOS.snapshot()), T = await lastThought(p);
    const after = await p.evaluate(([id, hosted]) => hosted ? PM_CHAT_SETTINGS.values()[id] : PM56_EXT.ctx().state.capabilities.thought, [ID, HOSTED]);
    const guide = await p.evaluate(() => (document.querySelector('.thought-demo-guide .pmx-guide-step') || {}).textContent || '');
    check(`D-${flow} Demo Studio's ${flow === 'auto' ? 'While it thinks' : 'Always open'} plays to its end: ${flow === 'auto' ? 'folded when the answer started, then opened from its line' : 'open beside the answer'}`,
      snap && snap.phase === 'answered' && T && T.open === '1' && (flow === 'auto' ? snap.reopened : T.state === 'done') && /^Done/.test(guide), { snap, T, guide: guide.slice(0, 120) });
    check(`D-${flow} the example never writes the Thought Stream preference`, before === after && after === 'Auto', { before, after });
    check(`D-${flow} no page errors`, p.__errs.length === 0, p.__errs.slice(0, 2));
    await p.close();
  }
});

/* ------------------------------------------------------------------ contrast: the painted pixels, ten looks */
async function pixelRatio(page, sel, attempt = 0) {
  /* switchThread fades the list from .4 to 1. Read its alpha only after that
     fade finishes: screenshot({ animations: 'disabled' }) finishes it too, so
     an earlier alpha would be blended against a later, fully painted frame. */
  await page.waitForFunction(sel => {
    const list = document.querySelector(sel)?.closest('.transcript-inner');
    return !!list && parseFloat(getComputedStyle(list).opacity) === 1
      && !list.getAnimations().some(a => a.playState !== 'finished' && a.effect?.getKeyframes().some(k => k.opacity != null));
  }, sel, { timeout: 5000 });
  const geo = await page.evaluate(sel => {
    const el = document.querySelector(sel); if (!el) return null;
    el.scrollIntoView({ block: 'center', behavior: 'instant' });
    /* the first line of the text, whole: the union of its runs (the reasoning is a span per word), inside the element */
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), runs = [];
    for (let t = tw.nextNode(); t; t = tw.nextNode()) { if (!t.textContent.trim()) continue; const rg = document.createRange(); rg.selectNodeContents(t); runs.push(...[...rg.getClientRects()].filter(q => q.width > 1 && q.height > 4)); }
    if (!runs.length) return null;
    const top = runs[0].top, line = runs.filter(q => Math.abs(q.top - top) < 2), box = el.getBoundingClientRect();
    const left = Math.max(box.left, Math.min(...line.map(q => q.left))), right = Math.min(box.right, Math.max(...line.map(q => q.right)));
    const r = { left, top, width: right - left, height: Math.max(...line.map(q => q.height)) };
    if (r.width < 4) return null;
    let op = 1; for (let x = el; x && x.nodeType === 1; x = x.parentElement) op *= parseFloat(getComputedStyle(x).opacity || '1');
    el.setAttribute('data-ttpx', '1');
    return { color: getComputedStyle(el).color, op, box: { left: box.left, top: box.top, width: box.width, height: box.height }, rect: { x: Math.max(0, r.left), y: Math.max(0, r.top), w: Math.min(r.width, 360), h: r.height } };
  }, sel);
  if (!geo) return null;
  await page.evaluate(() => { const st = document.createElement('style'); st.id = 'ttpx-hide'; st.textContent = '[data-ttpx="1"], [data-ttpx="1"] * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; }'; document.head.appendChild(st); });
  await sleep(80);
  const png = await page.screenshot({ clip: { x: geo.rect.x, y: geo.rect.y, width: Math.max(4, geo.rect.w), height: Math.max(4, geo.rect.h) }, animations: 'disabled' });
  const after = await page.evaluate(sel => {
    const box = document.querySelector(sel)?.getBoundingClientRect();
    document.getElementById('ttpx-hide')?.remove(); document.querySelectorAll('[data-ttpx]').forEach(x => x.removeAttribute('data-ttpx'));
    return box ? { left: box.left, top: box.top, width: box.width, height: box.height } : null;
  }, sel);
  /* scrollIntoView and a screenshot's animation finish can move the text after
     its crop was measured (observed: 38px). Retry only an invalid crop, never a
     stable low ratio; keep C1's same pixels and 4.5:1 predicate. */
  if (!after || Object.keys(geo.box).some(k => Math.abs(after[k] - geo.box[k]) > .25)) {
    results.push({ group: 'contrast', label: 'C-capture (diagnostic, not a check)', pass: true, diagnostic: true, sizeContext: testGeometry(), detail: { sel, attempt, before: geo.box, after } });
    if (attempt >= 2) throw new Error('Thought text moved during all three contrast captures: ' + sel);
    return pixelRatio(page, sel, attempt + 1);
  }
  return page.evaluate(async ([b64, color, op]) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const k = document.createElement('canvas'); k.width = k.height = 1; const kc = k.getContext('2d'); kc.fillStyle = color; kc.fillRect(0, 0, 1, 1);
    const ink = kc.getImageData(0, 0, 1, 1).data, fg = { r: ink[0], g: ink[1], b: ink[2] }, a = ink[3] / 255 * op;
    const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
    let min = 99;
    for (const fy of [0.35, 0.5, 0.65]) for (let i = 1; i <= 7; i++) {
      const d = g.getImageData(Math.floor(img.width * i / 8), Math.floor(img.height * fy), 1, 1).data, bg = { r: d[0], g: d[1], b: d[2] };
      const f = { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a) };
      const L1 = lum(f), L2 = lum(bg); min = Math.min(min, (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05));
    }
    return Math.round(min * 100) / 100;
  }, [png.toString('base64'), geo.color, geo.op]);
}
await safe('contrast', async () => {
  const p = await fresh({ mode: 'Auto' });
  const out = {}, low = [];
  for (const look of LOOKS) {
    await target.theme(p, look);
    /* two settled blocks, painted as the chat paints them: one kept open (the reasoning and its line), one folded (its
       line and gist) */
    await p.evaluate(() => {
      const c = PM56_EXT.ctx(), t = c.state.threads.find(x => x.id === 'live-turn');
      t.messages = t.messages.filter(m => !/^tt-px-/.test(m.id));
      const text = 'Two orders to compare. With created_at first, one tenant’s read walks the whole date range and throws away every other tenant’s rows.\n\nWith tenant_id first, the planner seeks straight to the tenant and then reads created_at in index order, which also covers the ORDER BY.';
      t.messages.push({ id: 'tt-px-open', role: 'assistant', type: 'thought', thoughtMode: 'Expanded', runtime: { model: 'Claude Sonnet 4.6' }, thought: { text, gist: 'Equality before range: tenant_id leads', secs: 5, state: 'done' } });
      t.messages.push({ id: 'tt-px-fold', role: 'assistant', type: 'thought', thoughtMode: 'Auto', runtime: { model: 'Claude Sonnet 4.6' }, thought: { text, gist: 'Equality before range: tenant_id leads', secs: 4, state: 'done' } });
      c.switchThread('live-turn'); c.renderApp(); c.stickToBottom(true);
    });
    await sleep(700);
    const sels = { reasoning: P + '.message-thought[data-message-id="tt-px-open"] .tt-flow p', line: P + '.message-thought[data-message-id="tt-px-open"] .tt-done',
      folded: P + '.message-thought[data-message-id="tt-px-fold"] .tt-done', gist: P + '.message-thought[data-message-id="tt-px-fold"] .tt-gist' };
    out[look] = {};
    for (const [k, sel] of Object.entries(sels)) { const r = await pixelRatio(p, sel); out[look][k] = r; if (!(r >= 4.5)) low.push({ look, k, r }); }
  }
  check('C1 the reasoning, its line and the folded gist read 4.5:1 or better on the painted pixels in all ten looks', low.length === 0 && Object.keys(out).length === 10, { low, worst: Math.min(...Object.values(out).flatMap(o => Object.values(o).filter(v => v != null))) });
  check('C2 no page errors', p.__errs.length === 0, p.__errs.slice(0, 2));
  results.push({ group: 'contrast', label: 'C-table (diagnostic, not a check)', pass: true, diagnostic: true, sizeContext: testGeometry(), detail: out });
  await p.close();
});

await browser.close();
finish();

function finish() {
  const counted = results.filter(r => !r.diagnostic);
  const pass = counted.filter(r => r.pass).length, fail = counted.length - pass;
  console.log(`\nthought-verify: ${pass} pass / ${fail} fail`);
  if (OUT) fs.writeFileSync(OUT, JSON.stringify({ page: NODE_ONLY ? 'node' : target.kind, pass, fail, results: counted, diagnostics: results.filter(r => r.diagnostic) }, null, 1));
  process.exit(fail ? 1 : 0);
}
