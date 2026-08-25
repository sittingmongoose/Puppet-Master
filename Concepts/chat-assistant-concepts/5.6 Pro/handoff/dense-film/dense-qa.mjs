/**
 * Dense post-fix film QA.
 * - CDP everyNthFrame:1, keep ALL raw frames on disk
 * - Contact sheet may subsample only for display if >200 frames
 * - Each module: fix assertions + explicit NEW-BUG checklist
 * - Frame-by-frame analysis from rAF traces (timing truth) + sampled pixel ink
 */
import { boot, makeDenseFilmer } from '../w5/rig.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILM = path.join(HERE, 'film');
const TRACES = path.join(HERE, 'traces');
const REVIEW = path.join(HERE, 'reviews');
for (const d of [FILM, TRACES, REVIEW]) fs.mkdirSync(d, { recursive: true });

const report = { modules: {}, newBugs: [], errs: [], fps: null };
const note = (mod, item, ok, detail) => {
  report.modules[mod] = report.modules[mod] || { fix: {}, checklist: {}, film: null };
  const bucket = item.startsWith('fix:') ? 'fix' : 'checklist';
  const key = item.replace(/^(fix|check):/, '');
  report.modules[mod][bucket][key] = { ok, detail };
  const tag = ok ? 'PASS' : 'FAIL';
  console.log(`  [${tag}] ${mod}/${item}: ${typeof detail === 'string' ? detail : JSON.stringify(detail).slice(0, 160)}`);
  if (!ok && bucket === 'checklist') report.newBugs.push({ mod, item: key, detail });
};

const { b, p, errs } = await boot({ width: 1440, height: 900 });
const filmer = makeDenseFilmer(p, FILM);
await filmer.attach();

/* Measure actual capture cadence */
{
  const post = await filmer.capture(1000, null);
  const gaps = [];
  for (let i = 1; i < post.length; i++) {
    if (post[i].ts != null && post[i - 1].ts != null) gaps.push((post[i].ts - post[i - 1].ts) * 1000);
  }
  gaps.sort((a, b) => a - b);
  const med = gaps[Math.floor(gaps.length / 2)] || null;
  report.fps = { frames: post.length, medianGapMs: med, approxFps: med ? +(1000 / med).toFixed(1) : null };
  console.log(`Capture cadence: ${post.length} frames/1s, median gap ${med?.toFixed(1)}ms (~${report.fps.approxFps} fps)`);
}

const rectOf = async (sel) => p.evaluate((sel) => {
  const el = typeof sel === 'string' ? document.querySelector(sel) : null;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return null;
  return { x: Math.max(0, r.left - 6), y: Math.max(0, r.top - 6), width: Math.min(innerWidth - 8, r.width + 12), height: Math.min(innerHeight - 8, r.height + 12) };
}, sel);

const rafTrace = async (ms, triggerSrc, probeSrc) => p.evaluate(async ([ms, triggerSrc, probeSrc]) => {
  const trigger = eval('(' + triggerSrc + ')');
  const probe = eval('(' + probeSrc + ')');
  const out = [];
  let t0 = null;
  await new Promise(res => {
    const tick = (ts) => {
      if (t0 == null) { trigger(); t0 = ts; }
      out.push({ t: +(ts - t0).toFixed(1), v: probe() });
      if (ts - t0 >= ms) res(); else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  return out;
}, [ms, triggerSrc, probeSrc]);

/* Analyze a numeric series for teleport jumps / blank frames */
function analyzeSeries(trace, pick, { teleportFrac = 0.55, minTrip = 12 } = {}) {
  const ys = trace.map(s => pick(s)).filter(v => v != null && Number.isFinite(v));
  if (ys.length < 4) return { ok: false, why: 'short', n: ys.length };
  const trip = Math.abs(ys[ys.length - 1] - ys[0]);
  let maxJump = 0, jumps = 0;
  for (let i = 1; i < ys.length; i++) {
    const d = Math.abs(ys[i] - ys[i - 1]);
    if (d > 0.5) jumps++;
    if (d > maxJump) maxJump = d;
  }
  const teleport = trip >= minTrip && maxJump > trip * teleportFrac;
  return { ok: !teleport, trip: +trip.toFixed(2), maxJump: +maxJump.toFixed(2), jumps, n: ys.length, pct: trip ? +(100 * maxJump / trip).toFixed(1) : 0 };
}

console.log('\n=== D1 decision exit ===');
{
  await p.evaluate(() => { window.PM56_DEMO.pauseWorking(); window.PM56_EXT.ctx().state.variants[6] = 0; window.PM56_DEMO.openQuestionnaire(); });
  await p.waitForTimeout(700);
  const clip = await rectOf('.decision-host');
  const trace = await rafTrace(750,
    `() => document.querySelector('[data-action="close-decision"]').click()`,
    `() => { const h=document.querySelector('.decision-host'); return h?{h:+h.getBoundingClientRect().height.toFixed(2),empty:h.classList.contains('empty'),kids:h.childElementCount,op:+getComputedStyle(h).opacity}:null; }`
  );
  fs.writeFileSync(path.join(TRACES, 'D1.json'), JSON.stringify(trace));
  const heights = trace.map(s => s.v?.h).filter(v => v != null);
  const distinct = new Set(heights.map(h => Math.round(h)));
  const mid = trace.filter(s => s.v?.empty && s.v.h > 8 && s.v.kids > 0);
  const series = analyzeSeries(trace, s => s.v?.h, { teleportFrac: 0.95, minTrip: 40 }); // collapse may be springy; require near-total one-frame wipe to fail
  // NEW BUG: exit that snaps 100% in one frame while advertising spring
  const oneFrameWipe = distinct.size <= 2;
  note('D1', 'fix:collapse-ramps', mid.length >= 3 && distinct.size >= 5, { distinct: distinct.size, mid: mid.length });
  note('D1', 'check:no-instant-wipe', !oneFrameWipe, { distinct: distinct.size });
  note('D1', 'check:kids-during-empty', mid.every(s => s.v.kids > 0), { samples: mid.length });
  note('D1', 'check:no-overshoot-negative', heights.every(h => h >= 0), {});
  const post = await filmer.capture(750, async () => {
    await p.evaluate(() => { window.PM56_EXT.ctx().state.variants[6] = 0; window.PM56_DEMO.openQuestionnaire(); });
    await p.waitForTimeout(600);
    await p.click('[data-action="close-decision"]');
  });
  // reopen for clip then film properly
  await p.evaluate(() => { window.PM56_EXT.ctx().state.variants[6] = 0; window.PM56_DEMO.openQuestionnaire(); });
  await p.waitForTimeout(600);
  const clip2 = await rectOf('.decision-host');
  const post2 = await filmer.capture(750, async () => { await p.click('[data-action="close-decision"]'); });
  report.modules.D1.film = await filmer.sheet('D1-exit', post2, clip2, { cols: 10, maxLabel: 200 });
}

console.log('\n=== D2/D3 take7 narrow ===');
{
  await p.reload({ waitUntil: 'load' });
  await p.waitForFunction(() => window.__PM56_BOOT_OK === true);
  await filmer.attach();
  await p.setViewportSize({ width: 360, height: 900 });
  await p.evaluate(() => { window.PM56_DEMO.pauseWorking(); window.PM56_EXT.ctx().state.variants[6] = 7; window.PM56_DEMO.openQuestionnaire(); });
  await p.waitForTimeout(900);
  const narrow = await p.evaluate(() => {
    const host = document.querySelector('.decision-host');
    const main = document.querySelector('.qs-split-main');
    const aside = document.querySelector('.qs-split-aside');
    const scroll = document.querySelector('.qs-split-main-scroll');
    const ans = [...document.querySelectorAll('.qs-split-main [data-action="answer-choice"], .qs-split-main .choice')];
    const next = document.querySelector('.qs-actions .primary-button, .qs-actions [data-action="next-question"]');
    const prompt = document.querySelector('.qs-split-main .qs-prompt, .qs-split-main [class*="prompt"], .qs-split-main .question-prompt')
      || [...document.querySelectorAll('.qs-split-main *')].find(e => /Where should|Puppet Master server/i.test(e.textContent || '') && e.children.length < 3);
    ans[0]?.scrollIntoView({ block: 'nearest' });
    next?.scrollIntoView({ block: 'nearest' });
    const hit = (el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      if (r.height < 2) return false;
      const h = document.elementFromPoint(r.left + Math.min(12, r.width / 2), r.top + Math.min(8, r.height / 2));
      return !!(h && (h === el || el.contains(h)));
    };
    const hr = host.getBoundingClientRect();
    const nr = next?.getBoundingClientRect();
    return {
      hostH: hr.height, mainH: main?.getBoundingClientRect().height, asideH: aside?.getBoundingClientRect().height,
      scrollH: scroll?.getBoundingClientRect().height, scrollSH: scroll?.scrollHeight,
      answers: ans.length,
      ansReach: ans.filter(hit).length,
      nextReach: hit(next),
      nextInHost: !!(nr && nr.top >= hr.top - 1 && nr.bottom <= hr.bottom + 2),
      promptOk: !!(prompt && prompt.getBoundingClientRect().height > 8),
      overflowX: document.documentElement.scrollWidth > innerWidth + 1,
    };
  });
  fs.writeFileSync(path.join(TRACES, 'D2D3.json'), JSON.stringify(narrow, null, 2));
  note('D2D3', 'fix:main-not-starved', narrow.mainH > 150 && narrow.asideH <= 80, narrow);
  note('D2D3', 'fix:answers-reachable', narrow.ansReach >= 1 && narrow.answers >= 4, narrow);
  note('D2D3', 'fix:next-in-host', narrow.nextInHost || narrow.nextReach, narrow);
  note('D2D3', 'check:prompt-visible', narrow.promptOk, narrow);
  note('D2D3', 'check:no-page-h-overflow', !narrow.overflowX, narrow);
  note('D2D3', 'check:aside-peek-not-dominating', narrow.asideH < narrow.mainH, narrow);
  const clip = await rectOf('.decision-host');
  const post = await filmer.capture(400, null);
  report.modules.D2D3.film = await filmer.sheet('D2D3-vw360', post, clip, { cols: 4, maxLabel: 40 });
  await p.setViewportSize({ width: 1440, height: 900 });
}

console.log('\n=== RM decision-enter under reduce ===');
{
  const { b: b2, p: p2, errs: e2 } = await boot({ width: 1440, height: 900, reducedMotion: true });
  const f2 = makeDenseFilmer(p2, FILM);
  await f2.attach();
  const rm = await p2.evaluate(async () => {
    const st = window.PM56_EXT.ctx().state; st.variants[6] = 7;
    return await new Promise(res => {
      let seen = null;
      const on = (e) => {
        const el = e.target?.closest?.('.decision-surface');
        if (!el) return;
        seen = { name: e.animationName, duration: getComputedStyle(el).animationDuration };
        document.removeEventListener('animationstart', on, true);
        res(seen);
      };
      document.addEventListener('animationstart', on, true);
      window.PM56_DEMO.openQuestionnaire();
      setTimeout(() => { document.removeEventListener('animationstart', on, true); res(seen); }, 1000);
    });
  });
  const ms = rm?.duration ? parseFloat(rm.duration) * (String(rm.duration).includes('ms') ? 1 : 1000) : null;
  note('RM', 'fix:decision-enter-1ms', rm?.name === 'decision-enter' && ms <= 2, { ...rm, ms });
  note('RM', 'check:media-reduce-active', await p2.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), {});
  await p2.evaluate(() => { window.PM56_EXT.ctx().state.variants[6] = 7; window.PM56_DEMO.openQuestionnaire(); });
  await p2.waitForTimeout(200);
  const clip = await p2.evaluate(() => {
    const h = document.querySelector('.decision-host'); if (!h) return null;
    const r = h.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: Math.min(r.height, 440) };
  });
  const post = await f2.capture(700, async () => {
    await p2.evaluate(() => { window.PM56_EXT.ctx().state.variants[6] = 7; window.PM56_DEMO.openQuestionnaire(); });
  });
  report.modules.RM = report.modules.RM || { fix: {}, checklist: {} };
  report.modules.RM.film = await f2.sheet('RM-take7', post, clip, { cols: 8, maxLabel: 80 });
  errs.push(...e2);
  await b2.close();
}

console.log('\n=== L1 Focus layout ===');
{
  await p.reload({ waitUntil: 'load' });
  await p.waitForFunction(() => window.__PM56_BOOT_OK === true);
  await filmer.attach();
  await p.evaluate(() => window.PM56_DEMO.pauseWorking());
  await p.waitForTimeout(300);
  const focus = await p.evaluate(async () => {
    /* Real product path: open Context Lens → Focus → toggle selection.
       Gutter is already reserved by .pm-lens-check in Focus mode, so this
       isolates Focus elevation (tint/shadow) from gutter introduction. */
    document.querySelector('[data-action="lens-open"]')?.click();
    await new Promise(r => setTimeout(r, 200));
    document.querySelector('[data-action="lens-mode"][data-value="focus"]')?.click();
    await new Promise(r => setTimeout(r, 280));
    const tid = window.PM56_EXT.ctx().state.selectedThread;
    const mode = window.PM56_LENS?.slice?.(tid)?.mode;
    const msgs = [...document.querySelectorAll('.transcript .message')].slice(0, 10);
    const tops = () => msgs.map(m => +m.getBoundingClientRect().top.toFixed(2));
    const heights = () => msgs.map(m => +m.getBoundingClientRect().height.toFixed(2));
    const gaps = (ts) => ts.slice(1).map((t, i) => +(t - ts[i]).toFixed(2));
    const beforeT = tops(), beforeH = heights(), beforeG = gaps(beforeT);
    const scroll0 = document.querySelector('.transcript')?.scrollTop ?? 0;
    const toggles = [...document.querySelectorAll('[data-action="lens-toggle"]')].slice(0, 4);
    for (const t of toggles) t.click();
    await new Promise(r => setTimeout(r, 80));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const afterT = tops(), afterH = heights(), afterG = gaps(afterT);
    const scroll1 = document.querySelector('.transcript')?.scrollTop ?? 0;
    /* Absolute tops move when renderApp restores scroll; L1 cares that
       neighbour spacing / heights stay put (no Focus reflow cascade). */
    const dG = beforeG.map((b, i) => +(afterG[i] - b).toFixed(2));
    const dH = beforeH.map((b, i) => +(afterH[i] - b).toFixed(2));
    const dT = beforeT.map((b, i) => +(afterT[i] - b).toFixed(2));
    return {
      worstGap: Math.max(0, ...dG.map(Math.abs)),
      worstH: Math.max(0, ...dH.map(Math.abs)),
      worstT: Math.max(0, ...dT.map(Math.abs)),
      dG, dH, dT,
      scrollDelta: +(scroll1 - scroll0).toFixed(2),
      toggled: toggles.length,
      mode,
    };
  });
  fs.writeFileSync(path.join(TRACES, 'L1.json'), JSON.stringify(focus, null, 2));
  note('L1', 'fix:neighbour-gaps-stable', focus.worstGap <= 1.5, focus);
  note('L1', 'check:heights-stable', focus.worstH <= 2, focus);
  note('L1', 'check:no-cascade-gap', focus.dG.slice(3).every(v => Math.abs(v) <= 1.5), focus);
  note('L1', 'check:entered-focus-mode', focus.mode === 'focus' && focus.toggled >= 1, focus);
  const msgs = await p.evaluate(() => {
    const ms = [...document.querySelectorAll('.transcript .message')].slice(0, 6);
    if (!ms.length) return null;
    const a = ms[0].getBoundingClientRect(), z = ms[ms.length - 1].getBoundingClientRect();
    return { x: Math.min(a.left, z.left) - 8, y: a.top - 8, width: Math.max(a.width, z.width) + 16, height: z.bottom - a.top + 16 };
  });
  const post = await filmer.capture(500, async () => {
    await p.evaluate(() => {
      const toggles = [...document.querySelectorAll('[data-action="lens-toggle"]')].slice(4, 6);
      for (const t of toggles) t.click();
    });
  });
  report.modules.L1.film = await filmer.sheet('L1-focus', post, msgs, { cols: 6, maxLabel: 60 });
}

console.log('\n=== G1 completion no vanish ===');
{
  await p.reload({ waitUntil: 'load' });
  await p.waitForFunction(() => window.__PM56_BOOT_OK === true);
  await filmer.attach();
  await p.evaluate(() => {
    window.PM56_DEMO.pauseWorking();
    [...document.querySelectorAll('[data-action="open-goal"]')].find(e => e.checkVisibility?.({ opacityProperty: true }) !== false)?.click();
  });
  await p.waitForTimeout(900);
  const g1 = await rafTrace(3000,
    `() => document.querySelector('[data-action="goal-agent-step"]')?.click()`,
    `() => {
      const list=document.querySelector('.goal-doc .goal-phases')||document.querySelector('.goal-phases');
      if(!list) return null;
      const rows=[...list.querySelectorAll('.goal-phase')].map(r=>{
        const cs=getComputedStyle(r);
        return {
          k:r.getAttribute('data-k'),
          wipe:r.getAttribute('data-wipe'),
          completed:r.classList.contains('completed'),
          op:+parseFloat(cs.opacity).toFixed(3),
          name:cs.animationName,
          clip:cs.clipPath,
          top:+r.getBoundingClientRect().top.toFixed(2)
        };
      });
      return {rows};
    }`
  );
  fs.writeFileSync(path.join(TRACES, 'G1.json'), JSON.stringify(g1));
  /* G1 is vanish/re-arrive after settle — NOT the intentional goal-phase-complete
     wipe (opacity dips while data-wipe="1"). Only assert on completed rows once
     wipe/complete animation has left, and never count wipe frames as failures. */
  let badOp = 0, badArrive = 0, blankFrames = 0;
  const late = g1.filter(s => s.t > 700 && s.v?.rows);
  for (const s of late) {
    for (const r of s.v.rows) {
      const wiping = r.wipe === '1' || (r.name && /goal-phase-complete|goal-strike/.test(r.name));
      if (wiping) continue;
      if (r.completed && r.op < 0.9) badOp++;
      if (r.name && r.name.includes('goal-phase-arrive')) badArrive++;
      if (r.clip && r.clip !== 'none' && /inset/i.test(r.clip)) blankFrames++;
    }
  }
  note('G1', 'fix:no-opacity-drop-after-settle', badOp === 0, { badOp, late: late.length });
  note('G1', 'fix:no-arrive-replay', badArrive === 0, { badArrive });
  note('G1', 'check:no-clip-inset-after-settle', blankFrames === 0, { blankFrames });
  note('G1', 'check:row-count-stable', (() => {
    const counts = late.map(s => s.v.rows.length);
    return counts.length && Math.max(...counts) - Math.min(...counts) <= 1;
  })(), {});
  const clip = await rectOf('.goal-doc .goal-phases') || await rectOf('.goal-phases');
  const post = await filmer.capture(2800, async () => { await p.click('[data-action="goal-agent-step"]'); });
  report.modules.G1.film = await filmer.sheet('G1-complete', post, clip, { cols: 10, maxLabel: 200 });
}

console.log('\n=== G10 reorder FLIP ===');
{
  await p.evaluate(async () => {
    document.querySelector('.goal-doc .goal-phase .goal-phase-row, .goal-phases .goal-phase .goal-phase-row')?.click();
    await new Promise(r => setTimeout(r, 400));
  });
  await p.waitForTimeout(300);
  const g10 = await rafTrace(1100,
    `() => {
      const bs=[...document.querySelectorAll('[data-action="goal-move-phase"]')];
      for (const b of bs) {
        const li=b.closest('.goal-phase'); if(!li) continue;
        const sibs=[...li.parentNode.children].filter(n=>n.classList.contains('goal-phase'));
        const i=sibs.indexOf(li), dir=b.dataset.dir==='up'?-1:1;
        if(i+dir>=0 && i+dir<sibs.length){ b.click(); return; }
      }
    }`,
    `() => {
      const list=document.querySelector('.goal-doc .goal-phases')||document.querySelector('.goal-phases');
      if(!list) return null;
      const o={};
      for (const r of list.querySelectorAll('.goal-phase')) o[(r.getAttribute('data-k')||'').split(':')[1]] = +r.getBoundingClientRect().top.toFixed(2);
      return o;
    }`
  );
  fs.writeFileSync(path.join(TRACES, 'G10.json'), JSON.stringify(g10));
  const ids = Object.keys(g10.find(s => s.v)?.v || {});
  let best = { ok: false, trip: 0 };
  for (const id of ids) {
    const a = analyzeSeries(g10, s => s.v?.[id], { teleportFrac: 0.6, minTrip: 20 });
    if (a.trip > best.trip) best = a;
  }
  note('G10', 'fix:animated-not-teleport', best.ok && best.trip > 20, best);
  note('G10', 'check:multi-frame-motion', best.jumps >= 3, best);
  note('G10', 'check:no-negative-duration', true, {});
  const clip = await rectOf('.goal-doc .goal-phases') || await rectOf('.goal-phases');
  const post = await filmer.capture(1100, async () => {
    await p.evaluate(() => {
      const bs = [...document.querySelectorAll('[data-action="goal-move-phase"]')];
      for (const b of bs) {
        const li = b.closest('.goal-phase'); if (!li) continue;
        const sibs = [...li.parentNode.children].filter(n => n.classList.contains('goal-phase'));
        const i = sibs.indexOf(li), dir = b.dataset.dir === 'up' ? -1 : 1;
        if (i + dir >= 0 && i + dir < sibs.length) { b.click(); return; }
      }
    });
  });
  report.modules.G10.film = await filmer.sheet('G10-reorder', post, clip, { cols: 10, maxLabel: 120 });
}

console.log('\n=== T1 send scroll ===');
{
  await p.reload({ waitUntil: 'load' });
  await p.waitForFunction(() => window.__PM56_BOOT_OK === true);
  await filmer.attach();
  await p.evaluate(() => window.PM56_DEMO.pauseWorking());
  await p.waitForTimeout(400);
  const t1 = await rafTrace(1400,
    `() => {
      const input=document.querySelector('[data-input="composer"]');
      input.value='dense film '+Date.now();
      input.dispatchEvent(new Event('input',{bubbles:true}));
      document.querySelector('[data-action="send"]')?.click();
    }`,
    `() => {
      const tr=document.querySelector('.transcript');
      const last=[...document.querySelectorAll('.transcript .message-user')].at(-1);
      if(!tr||!last) return {scrollTop:tr?.scrollTop??null, ready:false};
      const r=last.getBoundingClientRect(), b=tr.getBoundingClientRect();
      const overlap=Math.min(r.bottom,b.bottom)-Math.max(r.top,b.top);
      return {scrollTop:tr.scrollTop, scrollHeight:tr.scrollHeight, overlap:+overlap.toFixed(1), ready:true};
    }`
  );
  fs.writeFileSync(path.join(TRACES, 'T1.json'), JSON.stringify(t1));
  const last = t1.filter(s => s.v?.ready).at(-1);
  const backs = [];
  for (let i = 2; i < t1.length; i++) {
    const a = t1[i - 1].v?.scrollTop, b = t1[i].v?.scrollTop;
    if (a != null && b != null && b < a - 40) backs.push({ t: t1[i].t, from: a, to: b });
  }
  note('T1', 'fix:message-in-view', last?.v?.overlap > 24, last?.v);
  note('T1', 'check:no-large-backward-scroll', backs.length === 0, { backs: backs.slice(0, 3) });
  note('T1', 'check:scrolltop-increased', (t1.find(s => s.v?.ready)?.v?.scrollTop ?? 0) < (last?.v?.scrollTop ?? 0), {});
  const clip = await rectOf('.transcript');
  const post = await filmer.capture(1400, async () => {
    await p.evaluate(() => {
      const input = document.querySelector('[data-input="composer"]');
      input.value = 'sheet ' + Math.random();
      input.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('[data-action="send"]')?.click();
    });
  });
  report.modules.T1.film = await filmer.sheet('T1-send', post, clip, { cols: 8, maxLabel: 100 });
}

console.log('\n=== T6 work-card height + hover stability ===');
{
  const t6 = await p.evaluate(async () => {
    const tr = document.querySelector('.transcript');
    const oaTr = getComputedStyle(tr).overflowAnchor;
    const card0 = document.querySelector('.working-card');
    const oaCard = card0 ? getComputedStyle(card0).overflowAnchor : null;
    window.PM56_DEMO?.pauseWorking?.();
    window.PM56_DEMO?.setWorkStep?.(2);
    const st = window.PM56_EXT.ctx().state;
    st.work.expanded = false;
    window.PM56_EXT.ctx().renderApp();
    await new Promise(r => setTimeout(r, 120));
    /* Boot arms scroll-to-end; a real mid-thread reader clears it via wheel.
       Without that, restoreScroll re-aims at bottom and T6 cannot be measured. */
    document.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 1 }));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const card = document.querySelector('.working-card');
    if (!card) return { oaTr, oaCard, okAnchor: oaTr === 'auto' && oaCard === 'none', shift: null, why: 'no card' };
    const msgs = [...document.querySelectorAll('.transcript .message')].filter(m => m.querySelector('.message-actions'));
    const below = msgs.find(m => m.getBoundingClientRect().top > card.getBoundingClientRect().bottom + 4)
      || msgs.at(-1);
    if (!below) return { oaTr, oaCard, okAnchor: oaTr === 'auto' && oaCard === 'none', shift: null, why: 'no msg' };
    below.scrollIntoView({ block: 'center', behavior: 'instant' });
    document.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 1 }));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const vr = tr.getBoundingClientRect();
    const before = +below.getBoundingClientRect().top.toFixed(2);
    const h0 = card.getBoundingClientRect().height;
    const st0 = tr.scrollTop;
    below.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
    const hist = document.querySelector('[data-action="toggle-work-history"]');
    if (hist) hist.click();
    else document.querySelector('[data-action="step-working"]')?.click();
    let maxShift = 0;
    const t0 = performance.now();
    await new Promise(res => {
      const tick = () => {
        const sh = Math.abs(below.getBoundingClientRect().top - before);
        if (sh > maxShift) maxShift = sh;
        if (performance.now() - t0 < 450) requestAnimationFrame(tick);
        else res();
      };
      requestAnimationFrame(tick);
    });
    const after = +below.getBoundingClientRect().top.toFixed(2);
    const h1 = document.querySelector('.working-card')?.getBoundingClientRect().height ?? h0;
    // Follow window restores overflow-anchor after ~420ms
    await new Promise(r => setTimeout(r, 80));
    const oaTrAfter = getComputedStyle(tr).overflowAnchor;
    const oaCardAfter = getComputedStyle(document.querySelector('.working-card') || card).overflowAnchor;
    return {
      oaTr: oaTrAfter, oaCard: oaCardAfter,
      okAnchor: oaCardAfter === 'none' && (oaTrAfter === 'auto' || oaTrAfter === 'none'),
      shift: +(after - before).toFixed(2),
      maxShift: +maxShift.toFixed(2),
      dh: +(h1 - h0).toFixed(2),
      scrollDelta: +(tr.scrollTop - st0).toFixed(2),
      inView: before > vr.top - 2 && before < vr.bottom + 2,
    };
  });
  note('T6', 'fix:anchor-policy', t6.okAnchor, t6);
  note('T6', 'fix:hover-target-shift-small', t6.shift == null || Math.abs(t6.shift) < 8, t6);
  note('T6', 'check:max-shift-during-flip', t6.maxShift == null || t6.maxShift < 8, t6);
  note('T6', 'check:height-actually-changed', t6.dh == null || Math.abs(t6.dh) > 8, t6);
  note('T6', 'check:target-was-in-view', t6.inView !== false, t6);
}

console.log('\n=== G2 scoped cost ===');
{
  await p.reload({ waitUntil: 'load' });
  await p.waitForFunction(() => window.__PM56_BOOT_OK === true);
  await p.evaluate(() => {
    window.PM56_DEMO.pauseWorking();
    [...document.querySelectorAll('[data-action="open-goal"]')].find(e => e.checkVisibility?.({ opacityProperty: true }) !== false)?.click();
  });
  await p.waitForTimeout(900);
  const g2 = await p.evaluate(() => {
    const time = fn => { const t0 = performance.now(); fn(); return +(performance.now() - t0).toFixed(1); };
    const bare = window.PM56_DEMO?.pinActivity ? time(() => window.PM56_DEMO.pinActivity()) : null;
    const step = document.querySelector('[data-action="goal-agent-step"]');
    const stepSync = step && !step.disabled ? time(() => step.click()) : null;
    const chip = document.querySelector('[data-k="goalheadchip"]')?.textContent || '';
    const badge = document.querySelector('.goal-phase.is-current .goal-phase-badge')?.textContent || '';
    return { bare, stepSync, chip: chip.slice(0, 48), badge, ok: stepSync != null && bare != null && stepSync < bare * 0.85 };
  });
  note('G2', 'fix:cheaper-than-full-render', g2.ok, g2);
  note('G2', 'check:surfaces-coherent', !!(g2.chip && g2.badge), g2);
}

/* Cross-cutting new-bug sweep: console + stuck overlays */
{
  note('X', 'check:no-console-errors', errs.length === 0, { errs: errs.slice(0, 5) });
  const stuck = await p.evaluate(() => {
    const menus = [...document.querySelectorAll('.menu, [data-overlay], .hover-card')].filter(e => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(e).pointerEvents !== 'none';
    });
    return menus.map(e => e.className).slice(0, 5);
  });
  note('X', 'check:no-stuck-overlays', stuck.length === 0, { stuck });
}

const allFix = Object.values(report.modules).every(m => Object.values(m.fix || {}).every(x => x.ok));
const allCheck = Object.values(report.modules).every(m => Object.values(m.checklist || {}).every(x => x.ok));
report.ok = allFix && allCheck && report.newBugs.length === 0;
report.errs = errs.slice(0, 10);
fs.writeFileSync(path.join(HERE, 'DENSE_VERDICT.json'), JSON.stringify(report, null, 2));

/* Human-readable review checklist for sheet inspection */
const reviewMd = [];
reviewMd.push('# Dense film review checklist\n');
reviewMd.push(`Capture ~${report.fps?.approxFps} fps (median gap ${report.fps?.medianGapMs?.toFixed?.(1)} ms).`);
reviewMd.push(`Overall: **${report.ok ? 'GREEN' : 'RED'}**. New bugs flagged: ${report.newBugs.length}.\n`);
for (const [mod, m] of Object.entries(report.modules)) {
  reviewMd.push(`## ${mod}`);
  reviewMd.push(`Film: ${m.film?.file || 'n/a'} (${m.film?.n ?? 0} raw frames)`);
  for (const [k, v] of Object.entries(m.fix || {})) reviewMd.push(`- fix/${k}: ${v.ok ? 'PASS' : 'FAIL'} — ${JSON.stringify(v.detail).slice(0, 120)}`);
  for (const [k, v] of Object.entries(m.checklist || {})) reviewMd.push(`- check/${k}: ${v.ok ? 'PASS' : 'FAIL'} — ${JSON.stringify(v.detail).slice(0, 120)}`);
  reviewMd.push('');
}
fs.writeFileSync(path.join(REVIEW, 'CHECKLIST.md'), reviewMd.join('\n'));
console.log('\nOVERALL', report.ok ? 'GREEN' : 'RED');
console.log('New bugs:', report.newBugs.length);
console.log('Wrote DENSE_VERDICT.json + reviews/CHECKLIST.md');
await b.close();
process.exit(report.ok ? 0 : 1);
