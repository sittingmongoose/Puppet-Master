/* turn-verify.mjs -- Chat WOW acceptance (2026-09-26).
 *
 *   node turn-verify.mjs [--file index.html] [--json out.json] [--cpu-throttle 4]
 *   (--cpu-throttle slows the page's CPU N times through CDP, so frames run long
 *   the way they do on a loaded machine)
 *
 * Every check reads painted state or a measured quantity (rects, samples taken
 * every frame in the page, rendered audio), never a dispatch count. Scenarios run
 * real sends through the composer so the flight, queue and Stop behave as they do
 * for a person. Headless Chromium over file://.
 */
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const ROOT = decodeURIComponent(path.dirname(new URL(import.meta.url).pathname));
const FILE = path.resolve(opt('file', path.join(ROOT, 'index.html')));
const THROTTLE = Number(opt('cpu-throttle', 1));
const OUT = opt('json', null);
const results = [];
let group = null;
const check = (label, ok, detail) => { results.push({ group, label, pass: !!ok, detail: detail === undefined ? null : detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail !== undefined ? '  ' + JSON.stringify(detail).slice(0, 220) : ''}`); return ok; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
async function fresh(opts = {}) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.__errs = []; page.on('pageerror', e => page.__errs.push(e.message));
  if (THROTTLE > 1) { const cdp = await page.context().newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE }); }
  await page.goto('file://' + FILE); await page.bringToFront();
  await page.waitForFunction(() => window.PM56_DEMO && window.PM56_STREAM, null, { timeout: 20000 });
  await sleep(900);
  await page.evaluate(() => PM56_DEMO.completeWorking());
  if (opts.wide !== false) {
    for (let i = 0; i < 4; i++) { const b = await page.$('[data-action="close-editor"]'); if (!b) break; await b.click(); await sleep(120); }
  }
  return page;
}
async function typeSend(page, text) {
  const ta = await page.$('textarea[data-input="composer"]');
  await ta.click(); await ta.fill(text); await sleep(60);
  await page.click('[data-action="send"]');
}
async function safe(name, fn) { group = name; try { await fn(); } catch (e) { check(`${name} [threw]`, false, String(e).split('\n')[0]); } }

/* ------------------------------------------------------------------ send */
await safe('send flight', async () => {
  const p = await fresh();
  await p.evaluate(() => PM56_DEMO.selectThread('live-turn'));
  await sleep(400);
  const ta = await p.$('textarea[data-input="composer"]');
  await ta.click(); await ta.fill('Walk me through the steps for the rollout.'); await sleep(60);
  /* sample every frame from the click: is the sent text painted somewhere? */
  await p.evaluate(() => {
    window.__fs = [];
    const t0 = performance.now();
    const tick = () => {
      const fly = document.querySelector('.tx-fly-text');
      const users = [...document.querySelectorAll('.transcript-inner > .message-user')];
      const bub = users[users.length - 1];
      const bubVisible = !!bub && !bub.hasAttribute('data-flight') && parseFloat(getComputedStyle(bub.querySelector('.message-surface')).opacity) > 0.5;
      const flyVisible = !!fly && parseFloat(getComputedStyle(fly).opacity) > 0.05;
      const ta = document.querySelector('textarea[data-input="composer"]');
      window.__fs.push({ t: Math.round(performance.now() - t0), fly: flyVisible, bub: bubVisible, field: !!(ta && ta.value.trim()) });
      if (performance.now() - t0 < 900) requestAnimationFrame(tick);
    };
    document.querySelector('[data-action="send"]').addEventListener('click', () => requestAnimationFrame(tick), { once: true, capture: true });
  });
  await p.click('[data-action="send"]');
  await sleep(1100);
  const fs_ = await p.evaluate(() => window.__fs);
  const gaps = fs_.filter(f => !f.fly && !f.bub && !f.field);
  check('the sent text is painted in every frame of the send (field, flight or bubble)', gaps.length === 0, { frames: fs_.length, blank: gaps.slice(0, 3) });
  check('a flight layer carries the text', fs_.some(f => f.fly), fs_.filter(f => f.fly).length);
  const landed = await p.evaluate(() => { const u = [...document.querySelectorAll('.transcript-inner > .message-user')].pop(); return { flightAttr: u.hasAttribute('data-flight'), layers: document.querySelectorAll('.tx-fly').length }; });
  check('the bubble has landed and the flight layers are gone after 1.1s', !landed.flightAttr && landed.layers === 0, landed);
  const pend = await p.evaluate(() => { const a = [...document.querySelectorAll('.transcript-inner > .message-assistant')].pop(); return a ? { s: a.getAttribute('data-streaming'), label: !!a.querySelector('.tx-pending'), words: a.querySelectorAll('.tx-w').length } : null; });
  check('the reply waits visibly (thinking) or has started writing', pend && (pend.s === 'pending' && pend.label || pend.s === 'live' || pend.words > 0), pend);
  /* stream: words grow monotonically and the list never re-renders under it */
  const series = await p.evaluate(async () => {
    const out = []; const a = [...document.querySelectorAll('.transcript-inner > .message-assistant')].pop();
    const island = a.querySelector('.tx-stream');
    for (let i = 0; i < 60; i++) { await new Promise(r => setTimeout(r, 70)); out.push({ w: a.querySelectorAll('.tx-w').length, same: a.querySelector('.tx-stream') === island }); if (!a.hasAttribute('data-streaming')) break; }
    return out;
  });
  const mono = series.every((s, i) => i === 0 || s.w >= series[i - 1].w || s.w === 0);
  check('words only ever grow while streaming', mono, series.map(s => s.w).join(','));
  check('the stream island is never remounted mid-stream', series.filter(s => s.w > 0).every(s => s.same));
  await sleep(2500);
  const fin = await p.evaluate(() => { const a = [...document.querySelectorAll('.transcript-inner > .message-assistant')].pop(); return { streaming: a.hasAttribute('data-streaming'), list: a.querySelectorAll('.message-body ol li').length, code: a.querySelectorAll('.message-body pre code').length, text: a.textContent.slice(0, 60) }; });
  check('the reply hands back as rich text: a numbered list and a code block', !fin.streaming && fin.list >= 4 && fin.code === 1, fin);
  check('no page errors during send and stream', p.__errs.length === 0, p.__errs.slice(0, 2));
  await p.close();
});

/* --------------------------------------------------------------- stop */
await safe('stop mid-stream', async () => {
  const p = await fresh();
  await p.evaluate(() => PM56_DEMO.selectThread('live-turn')); await sleep(300);
  await typeSend(p, 'Sweep all themes at every viewport.');
  await p.waitForFunction(() => { const a = [...document.querySelectorAll('.transcript-inner > .message-assistant')].pop(); return a && a.querySelectorAll('.tx-w').length > 3; }, null, { timeout: 6000 });
  const stop = await p.$('[data-action="stop-run"]');
  check('Stop is in the composer while the reply is written', !!stop);
  await stop.click(); await sleep(400);
  const r = await p.evaluate(() => { const a = [...document.querySelectorAll('.transcript-inner > .message-assistant')].pop(); return { streaming: a.hasAttribute('data-streaming'), stopped: !!a.querySelector('.tx-terminal-stopped'), len: a.querySelector('.message-body').textContent.trim().length, send: !!document.querySelector('[data-action="send"]') }; });
  check('Stop keeps the partial reply and marks it Stopped; Send returns', !r.streaming && r.stopped && r.len > 5 && r.send, r);
  await p.close();
});

/* -------------------------------------------------------- busy sends */
/* DL-108: sends while a reply is written queue by default; Stop never advances
   the queue; Send now steers (the reply so far stays, unmarked) and sends only
   that message. */
await safe('busy sends', async () => {
  const p = await fresh();
  await p.evaluate(() => PM56_DEMO.selectThread('live-turn')); await sleep(300);
  const users = () => p.evaluate(() => document.querySelectorAll('.transcript-inner > .message-user').length);
  const queued = () => p.evaluate(() => document.querySelectorAll('.send-queue-row').length);
  const writing = () => p.waitForFunction(() => { const a = [...document.querySelectorAll('.transcript-inner > .message-assistant')].pop(); return a && a.querySelectorAll('.tx-w').length > 3; }, null, { timeout: 6000 });
  const u0 = await users();
  await typeSend(p, 'Walk me through the steps for the rollout.'); await writing();
  await typeSend(p, 'Also list the risks.'); await sleep(200);
  check('a send while the reply is written joins the queue', (await queued()) === 1 && (await users()) === u0 + 1, { queued: await queued(), users: (await users()) - u0 });
  await p.click('[data-action="stop-run"]'); await sleep(1500);
  check('Stop does not advance the queue', (await queued()) === 1 && (await users()) === u0 + 1, { queued: await queued(), users: (await users()) - u0 });
  /* Send now on a queued message while a new reply is written: it steers */
  await p.click('.send-queue-row [data-action="queue-send-now"]'); await writing();
  await typeSend(p, 'First queued.'); await sleep(150);
  await typeSend(p, 'Second queued.'); await sleep(150);
  const before = await p.evaluate(() => ({ users: document.querySelectorAll('.transcript-inner > .message-user').length, q: document.querySelectorAll('.send-queue-row').length }));
  await p.click('.send-queue-row [data-action="queue-send-now"]'); await sleep(600);
  const r = await p.evaluate(() => {
    const as = [...document.querySelectorAll('.transcript-inner > .message-assistant')];
    const steered = as[as.length - 2];
    return { users: document.querySelectorAll('.transcript-inner > .message-user').length, q: document.querySelectorAll('.send-queue-row').length,
      steeredMarked: !!(steered && steered.querySelector('.tx-terminal')), steeredText: steered ? steered.textContent.trim().length : 0, writing: !!document.querySelector('[data-streaming]') };
  });
  check('Send now steers: the reply so far stays unmarked and only that message is sent', r.users === before.users + 1 && r.q === before.q - 1 && !r.steeredMarked && r.steeredText > 5 && r.writing, { before, after: r });
  check('no page errors during busy sends', p.__errs.length === 0, p.__errs.slice(0, 2));
  await p.close();
});

/* ------------------------------------------------------------ live turn */
await safe('live agent turn', async () => {
  const p = await fresh();
  await p.evaluate(() => PM56_DEMO.selectThread('live-turn')); await sleep(300);
  await p.evaluate(() => {
    window.__lt = { gaps: [], liveMax: 0, narrLeading: false, narrCap: false, birth: false };
    const t0 = performance.now();
    const tick = () => {
      const t = document.querySelector('.transcript');
      const us = document.querySelectorAll('.transcript-inner > [data-role="user"]'), u = us[us.length - 1];
      window.__lt.gaps.push({ t: Math.round(performance.now() - t0), g: Math.round(t.scrollHeight - t.clientHeight - t.scrollTop), stick: PM56_EXT.ctx().isSticky(), u: u ? Math.round(u.getBoundingClientRect().top * 10) / 10 : null, strip: !!document.querySelector('.transcript-inner > .working-card .orbit-strip') });
      window.__lt.liveMax = Math.max(window.__lt.liveMax, document.querySelectorAll('.working-card .orbit-node.live').length);
      if (document.querySelector('.working-card .orbit-narration')) window.__lt.narrLeading = true;
      if (document.querySelector('.working-card .orbit-narr-cap')) window.__lt.narrCap = true;
      const card = document.querySelector('.transcript-inner > .working-card');
      if (card && card.getAnimations().some(a => a.effect && a.effect.getKeyframes().some(k => k.clipPath))) window.__lt.birth = true;
      if (performance.now() - t0 < 26000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await typeSend(p, "Add the composite index and prove it's faster.");
  await sleep(26500);
  const lt = await p.evaluate(() => window.__lt);
  const late = lt.gaps.filter(s => s.t > 1500);
  const away = late.filter(s => s.g > 24);
  /* the follow is a glide (a critically damped approach), so a step of new
     content is closed over a few frames by design; what must never happen is the
     view staying away -- the longest stretch more than 24px off the bottom */
  let run = 0, longest = 0, from = null, longestAt = null;
  late.forEach((s, i) => { if (s.g > 24) { if (from == null) from = s.t; if (s.t - from >= longest) { longest = s.t - from; longestAt = from; } } else from = null; });
  const stretch = late.filter(s => longestAt != null && s.t >= longestAt && s.t <= longestAt + longest).map(s => s.t + ':' + s.g);
  check('follow-along holds through the whole turn (never more than 24px away for longer than 300ms)',
    longest <= 300, { samples: late.length, away: away.length, worst: Math.max(...late.map(s => s.g)), longestAwayMs: longest, longestFrom: longestAt, stretch: stretch.slice(0, 12) });
  check('follow-along stays engaged', late.every(s => s.stick), late.filter(s => !s.stick).slice(0, 3));
  /* the view only ever moves up (following) or eases down (a released room):
     a drop faster than 0.4px/ms is a snap. Measured before the room holds: the
     fold's clamp snapped back 33px in one frame (~2px/ms) and a narration tuck
     pulled the thread down 36px in four frames (~0.7px/ms); a released room
     eases at ~0.2px/ms. Speed, not pixels per sample: frames here are 12-40ms. */
  const drops = [];
  late.forEach((s, i) => { const q = late[i - 1]; if (q && s.u != null && q.u != null && s.u - q.u > 2 && (s.u - q.u) / Math.max(1, s.t - q.t) > 0.4) drops.push({ t: s.t, by: +(s.u - q.u).toFixed(1), ms: s.t - q.t }); });
  check('the thread never jumps down mid-turn (no clamp snaps back)', drops.length === 0, drops.slice(0, 4));
  /* while the card folds and the answer starts, the reader's view stays put:
     the fold runs ~690ms before its strip mounts, the answer mounting with it */
  const i0 = late.findIndex(s => s.strip);
  const win = i0 < 0 ? [] : late.filter(s => s.t >= late[i0].t - 750 && s.t <= late[i0].t + 300 && s.u != null);
  const span = win.length ? Math.max(...win.map(s => s.u)) - Math.min(...win.map(s => s.u)) : null;
  check('the view holds still while the card folds and the answer starts', win.length > 5 && span <= 1, { samples: win.length, movedPx: span });
  check('the working card is born from the turn mark (clip-path unfold)', lt.birth);
  check('parallel reads are live at the same time', lt.liveMax >= 3, lt.liveMax);
  check('narration streams at the card foot, then tucks into the caption', lt.narrLeading && lt.narrCap, { leading: lt.narrLeading, caption: lt.narrCap });
  const end = await p.evaluate(() => ({ strip: !!document.querySelector('.transcript-inner > .working-card .orbit-strip'), answer: [...document.querySelectorAll('.transcript-inner > .message-assistant')].pop().textContent.includes('composite index is in') }));
  check('the card folds into its strip and the answer streams in', end.strip && end.answer, end);
  /* the reader's wheel wins */
  await p.evaluate(() => PM56_DEMO.selectThread('live-turn'));
  await sleep(300);
  await typeSend(p, 'Walk me through the steps for the rollout.');
  /* wheel over the transcript itself, once the streaming reply has made it scroll */
  await p.waitForFunction(() => { const t = document.querySelector('.transcript'); return document.querySelector('[data-streaming]') && t.scrollHeight - t.clientHeight > 260; }, null, { timeout: 10000, polling: 50 }).catch(() => {});
  const tr = await p.evaluate(() => { const r = document.querySelector('.transcript').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await p.mouse.move(tr.x, tr.y); await p.mouse.wheel(0, -500); await sleep(1500);
  const g = await p.evaluate(() => { const t = document.querySelector('.transcript'); return { gap: Math.round(t.scrollHeight - t.clientHeight - t.scrollTop), stick: PM56_EXT.ctx().isSticky() }; });
  check('a wheel-up during a stream is never pulled back to the bottom', g.gap > 150 && !g.stick, g);
  check('no page errors during the live turn', p.__errs.length === 0, p.__errs.slice(0, 2));
  await p.close();
});

/* --------------------------------------------------------- trouble turn */
await safe('trouble mid-turn', async () => {
  const p = await fresh();
  await p.evaluate(() => PM56_DEMO.trigger('Trouble mid-turn'));
  await p.waitForFunction(() => document.querySelector('.working-card .orbit-node.failed'), null, { timeout: 15000 }).catch(() => {});
  check('a failed subject is flagged on the ring', await p.evaluate(() => !!document.querySelector('.working-card .orbit-node.failed .orbit-node-flag')));
  await p.waitForFunction(() => document.querySelector('[data-action="live-approve"]'), null, { timeout: 15000 }).catch(() => {});
  const ask = await p.evaluate(() => { const b = document.querySelector('[data-action="live-approve"]'); const card = b && b.closest('.transcript-inner > *'); return { ask: !!b, family: card && card.getAttribute('data-family'), core: (document.querySelector('.working-card .orbit-core strong') || {}).textContent, waiting: !!document.querySelector('.working-card .orbit-node.waiting') }; });
  check('the run waits for approval: Needs-you item, waiting node, "Waiting for you" core', ask.ask && ask.family === 'needs' && ask.waiting && /Waiting for you/.test(ask.core || ''), ask);
  await p.click('[data-action="live-approve"]');
  await p.waitForFunction(() => document.querySelector('.transcript-inner > .working-card .orbit-strip'), null, { timeout: 15000 }).catch(() => {});
  const done = await p.evaluate(() => ({ strip: !!document.querySelector('.transcript-inner > .working-card .orbit-strip'), approved: !!document.querySelector('[data-msg-type="live-approved"]') }));
  check('approving resumes the run to completion and records the approval', done.strip && done.approved, done);
  await p.close();
});

/* ------------------------------------------------------------- scale */
await safe('long run stays legible', async () => {
  const p = await fresh();
  await p.evaluate(() => PM56_DEMO.trigger('Long agent turn'));
  await p.waitForFunction(() => { const r = Object.values(PM56_EXT.ctx().state.works).find(x => x.id && x.id.startsWith('turn')); return r && r.clock > 60; }, null, { timeout: 90000, polling: 500 });
  const n = await p.evaluate(() => ({ nodes: document.querySelectorAll('.working-card .orbit-node').length, clusters: document.querySelectorAll('.working-card .orbit-node.cluster').length }));
  check('140 subjects render as 30 nodes or fewer, with clusters', n.nodes <= 30 && n.clusters > 0, n);
  /* Spaced like real ticks, so every node has settled between samples (a tight
     synchronous loop freezes the animation timeline and measures entrances that
     never happen in use). Judged against a full render of the same state, not a
     fixed budget: on the review VM (software rendering) the ring re-space alone
     costs ~25ms, because every node's transform transition restarts. */
  const cost = await p.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const c = PM56_EXT.ctx(); const tick = [], full = [];
    for (let i = 0; i < 5; i++) { await wait(520); let t0 = performance.now(); PM56_DEMO.tickOnce(); tick.push(performance.now() - t0); await wait(520); t0 = performance.now(); c.renderApp(); void document.querySelector('.transcript').scrollTop; full.push(performance.now() - t0); }
    const med = a => +a.sort((x, y) => x - y)[2].toFixed(1);
    return { tick: med(tick), full: med(full) };
  });
  /* measured 45-50ms against 72-98ms here; about half of the tick is the ring
     re-space itself (Chat updates.md, cost at scale) */
  check('a work tick at scale costs less than a full render of the same state', cost.tick < cost.full, cost);
  await p.close();
});

/* ---------------------------------------------------------- families */
await safe('item families', async () => {
  const p = await fresh();
  const ids = await p.evaluate(() => PM56_EXT.ctx().state.threads.map(t => t.id));
  let missing = [], total = 0, sideways = [];
  for (const id of ids) {
    await p.evaluate(id => PM56_DEMO.selectThread(id), id); await sleep(120);
    const r = await p.evaluate(() => [...document.querySelectorAll('.transcript-inner > *')].filter(e => !e.getAttribute('data-family')).map(e => e.className.split(' ')[0]));
    total += await p.evaluate(() => document.querySelectorAll('.transcript-inner > *').length);
    if (r.length) missing.push({ id, r });
    /* the Python browser harnesses fail their first geometry check on any
       sideways overflow, even hidden: the spine once overflowed by the gutter */
    const over = await p.evaluate(() => { const t = document.querySelector('.transcript'); return t.scrollWidth - t.clientWidth; });
    if (over > 0) sideways.push({ id, over });
  }
  check('every transcript item in every thread names its family', missing.length === 0, { total, missing: missing.slice(0, 3) });
  check('no thread overflows the transcript sideways (scrollWidth == clientWidth)', sideways.length === 0, sideways.slice(0, 4));
  /* the same at the narrowest chat pane the app produces (~234px: a 900px
     window with the browser-capture panel open), where a rigid action row, a
     no-wrap ledger title and a long token in a ticket column once overflowed */
  await p.addStyleTag({ content: '.chat-stage{width:240px!important;max-width:240px!important;flex:none!important}' });
  await sleep(300);
  const narrow = [];
  for (const id of ids) {
    await p.evaluate(id => PM56_DEMO.selectThread(id), id); await sleep(120);
    const o = await p.evaluate(() => { const t = document.querySelector('.transcript'); return { cw: t.clientWidth, over: t.scrollWidth - t.clientWidth }; });
    if (o.over > 1) narrow.push({ id, ...o });
  }
  check('no thread overflows sideways in a ~234px chat pane', narrow.length === 0, narrow.slice(0, 4));
  /* accent budget (Basic Dark): who paints with the accent */
  const scan = await p.evaluate(() => {
    const acc = getComputedStyle(document.body).getPropertyValue('--accent').trim();
    const probe = document.createElement('i'); probe.style.color = acc; document.body.appendChild(probe); const accRgb = getComputedStyle(probe).color; probe.remove();
    const ALLOW = el => el.closest('[data-family="needs"], .working-card:not(.is-done), .primary-button, .pd-build, .send-button, .tx-caret, [data-streaming], .qs, .decision-host');
    const out = [];
    const threads = ['query', 'subagents', 'recovery-scheduling', 'goal-replan', 'crew', 'visuals', 'attachments', 'route'];
    return { accRgb, threads };
  });
  const offenders = [];
  for (const id of scan.threads) {
    await p.evaluate(id => PM56_DEMO.selectThread(id), id); await sleep(150);
    const o = await p.evaluate(accRgb => {
      /* the accent's jobs: live work, things that need the reader, the one
         primary action, Send/Stop */
      const ALLOW = el => el.closest('[data-family="needs"], .working-card:not(.is-done), .primary-button, .pd-build, .send-button, .tx-caret, [data-streaming], .qs, .decision-host, .collab-status-working, .pd-attn');
      const res = [];
      document.querySelectorAll('.transcript-inner *').forEach(el => {
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') return;
        const hit = [cs.color, cs.backgroundColor, cs.borderTopColor].some(c => c === accRgb);
        if (hit && !ALLOW(el)) res.push((el.className && el.className.baseVal == null ? el.className : el.tagName).toString().split(' ').slice(0, 2).join('.'));
      });
      return res;
    }, scan.accRgb);
    o.forEach(x => offenders.push(id + ':' + x));
  }
  const uniq = [...new Set(offenders)];
  check('the accent is not spent on decoration (Basic Dark transcript)', uniq.length === 0, uniq.slice(0, 12));
  await p.close();
});

/* ------------------------------------------------------------- voices */
await safe('voices', async () => {
  for (const v of ['friendly', 'glass', 'retro']) {
    const p = await fresh();
    await p.evaluate(v => { PM56_DEMO.setVoice(v); PM56_DEMO.selectThread('live-turn'); }, v); await sleep(300);
    await typeSend(p, 'Summarize where we are.');
    await sleep(4200);
    const r = await p.evaluate(() => { const a = [...document.querySelectorAll('.transcript-inner > .message-assistant')].pop(); return { voice: document.querySelector('.transcript').getAttribute('data-voice'), done: !a.hasAttribute('data-streaming'), items: a.querySelectorAll('.message-body li').length, fly: document.querySelectorAll('.tx-fly').length }; });
    check(`${v}: send, stream and settle complete in the ${v} voice`, r.voice === v && r.done && r.items >= 3 && r.fly === 0 && p.__errs.length === 0, { ...r, errs: p.__errs.slice(0, 1) });
    await p.close();
  }
});

/* ------------------------------------------------------------- sound */
await safe('sound', async () => {
  const p = await fresh();
  const levels = await p.evaluate(async () => {
    const out = [];
    for (const f of PM56_SOUND.FAMILIES) for (const e of PM56_SOUND.EVENTS) { const r = await PM56_SOUND.renderWav(f, e); out.push({ f, e, db: r ? +r.peakDb.toFixed(1) : null }); }
    return out;
  });
  const loud = levels.filter(l => l.db == null || l.db > -18);
  check('every event in every kit renders, peak at or under -18 dBFS', loud.length === 0, loud.slice(0, 5));
  const quiet = levels.filter(l => l.db != null && l.db < -60);
  check('no event is silent (above -60 dBFS)', quiet.length === 0, quiet.slice(0, 5));
  await p.evaluate(() => PM56_DEMO.selectThread('live-turn')); await sleep(300);
  await p.mouse.click(700, 400);                                   /* a real gesture arms audio */
  await typeSend(p, 'Walk me through the steps for the rollout.');
  await sleep(6500);
  const log = await p.evaluate(() => PM56_SOUND.log.map(x => x.ev));
  const order = ['send', 'first', 'complete'].map(e => log.indexOf(e));
  check('a send plays send, first word and complete in order', order.every(i => i >= 0) && order[0] < order[1] && order[1] < order[2], log.slice(-8));
  const btn = await p.$('[data-action="chat-sound-toggle"]');
  check('the chat header carries the sound toggle', !!btn);
  await btn.click(); await sleep(150);
  check('one click mutes', await p.evaluate(() => PM56_SOUND.muted === true));
  await p.close();
});

await browser.close();
const pass = results.filter(r => r.pass).length, fail = results.length - pass;
console.log(`\nturn-verify: ${pass} pass / ${fail} fail`);
if (OUT) fs.writeFileSync(OUT, JSON.stringify({ pass, fail, results }, null, 1));
process.exit(fail ? 1 : 0);
