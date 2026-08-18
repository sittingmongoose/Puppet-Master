/* AXIS 6 probe — capacity envelope, forecasts, reserves, time kinds, timestamps.
   READ-ONLY against the original concept over file://. Writes only into scratchpad. */
import { chromium } from '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad/replay-sandbox/.verify/node_modules/playwright-core/index.mjs';
import fs from 'node:fs';

const CHROME = '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const URL = 'file:///mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/u11-prism.html';
const OUT = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad/axis6';

const out = { started: new Date().toISOString(), groups: {} };

const browser = await chromium.launch({
  executablePath: CHROME,
  args: ['--headless=new', '--disable-gpu', '--no-sandbox', '--allow-file-access-from-files',
    '--no-first-run', '--no-default-browser-check']
});
const ctx = await browser.newContext({ viewport: { width: 1700, height: 1100 } });
const page = await ctx.newPage();
const consoleMsgs = [];
page.on('console', (m) => consoleMsgs.push(m.type() + ': ' + m.text()));
page.on('pageerror', (e) => consoleMsgs.push('pageerror: ' + e.message));
await page.goto(URL, { waitUntil: 'load' });
await page.waitForSelector('article.uw', { timeout: 20000 });
await page.waitForTimeout(600);

async function setDisc(lvl) {
  await page.click(`[data-disc="${lvl}"]`);
  await page.waitForTimeout(450);
}
async function expandMore() {
  await page.evaluate(() => {
    const g = document.querySelector('#u11MoreGrp');
    if (g && g.classList.contains('closed')) {
      const btn = document.querySelector('[data-more-toggle]');
      if (btn) btn.click(); else g.classList.remove('closed');
    }
  });
  await page.waitForTimeout(250);
}
async function goTab(name) {
  await expandMore();
  await page.click(`.u11-rail .u11-item[data-tab="${name}"]`, { timeout: 8000 });
  await page.waitForTimeout(450);
}

/* ---------- G1: raw data facts (ground truth) ---------- */
out.groups.G1_data = await page.evaluate(() => {
  const d = window.U11;
  return {
    now: d.meta && d.meta.now,
    runs: d.runs.map((r) => ({
      id: r.id, kind: r.kind, owningSurface: r.owningSurface, status: r.status,
      capacity: r.capacity, requested: r.requested, admitted: r.admitted, queued: r.queued,
      reservedFor: r.reservedFor, forecastId: r.forecastId,
      startedAt: r.startedAt,
      timing: r.timing ? {
        elapsedMs: r.timing.elapsedMs,
        rows: r.timing.rows,
        rowSumMs: r.timing.rows.reduce((a, b) => a + b.ms, 0),
        pcts: r.timing.rows.map((x) => Math.round(x.ms / r.timing.elapsedMs * 100)),
        pctSum: r.timing.rows.reduce((a, b) => a + Math.round(b.ms / r.timing.elapsedMs * 100), 0)
      } : null,
      memberStates: (r.members || []).map((m) => m.state + (m.queuedReason ? '/' + m.queuedReason : ''))
    })),
    forecasts: d.forecasts,
    owningSurfaceValues: Array.from(new Set(d.runs.map((r) => r.owningSurface))),
    queuedReasonValues: Array.from(new Set([].concat(...d.runs.map((r) => (r.members || []).map((m) => m.queuedReason))).filter(Boolean))),
    startedVsElapsed: d.runs.map((r) => ({
      id: r.id,
      startedAt: r.startedAt,
      nowMinusStartedMin: r.startedAt ? Math.round((Date.parse(d.meta.now) - Date.parse(r.startedAt)) / 60000) : null,
      elapsedMin: r.timing ? Math.round(r.timing.elapsedMs / 60000) : null
    })),
    operationalPhases: d.operational.map((o) => ({ id: o.id, kind: o.kind, phases: o.phases, providerUsage: o.providerUsage })),
    hasPeakConcurrency: JSON.stringify(d.runs).indexOf('peak') !== -1,
    forecastKeys: d.forecasts.map((f) => Object.keys(f).concat(Object.keys(f.inputs).map((k) => 'inputs.' + k)))
  };
});

/* ---------- G2: capacity widget rendered text (overview + plans, all disclosure levels) ---------- */
const capTexts = {};
for (const lvl of ['essentials', 'standard', 'advanced']) {
  await setDisc(lvl);
  for (const room of ['overview', 'plans']) {
    await goTab(room);
    const t = await page.evaluate(() => {
      const pane = document.querySelector('.u11-pane:not(.pm-hidden)');
      const cards = Array.from(pane.querySelectorAll('article.uw'));
      const cap = cards.find((c) => /Completion capacity/.test(c.innerText));
      if (!cap) return null;
      const cs = getComputedStyle(cap);
      const env = cap.querySelector('.u11w-capenv');
      return {
        text: cap.innerText,
        visible: cs.display !== 'none' && cap.offsetHeight > 0,
        capenvText: env ? env.innerText : null,
        capenvVisible: env ? (getComputedStyle(env).display !== 'none' && env.offsetHeight > 0 && env.getClientRects().length > 0) : false,
        capenvClientW: env ? env.clientWidth : null,
        capenvScrollW: env ? env.scrollWidth : null,
        tiles: Array.from(cap.querySelectorAll('.u11w-tile, .uw-tile')).map((x) => x.innerText.replace(/\n/g, ' | ')),
        ctas: Array.from(cap.querySelectorAll('button')).map((b) => b.innerText.trim()).filter(Boolean)
      };
    });
    capTexts[lvl + '/' + room] = t;
  }
}
out.groups.G2_capacity_widget = capTexts;

/* ---------- G3: runs widget (ledger room, standard+) ---------- */
await setDisc('advanced');
await goTab('ledger');
out.groups.G3_runs_widget = await page.evaluate(() => {
  const pane = document.querySelector('.u11-pane:not(.pm-hidden)');
  const cards = Array.from(pane.querySelectorAll('article.uw'));
  const runsCard = cards.find((c) => /Runs & agents/.test(c.innerText));
  const opsCard = cards.find((c) => /Maintenance & operations/.test(c.innerText));
  return {
    runsText: runsCard ? runsCard.innerText : null,
    operationsText: opsCard ? opsCard.innerText : null
  };
});

/* ---------- G4: run detail panels for all three runs ---------- */
const rd = {};
for (const runId of ['run:goal-47', 'run:plan-12', 'run:crew-3']) {
  const opened = await page.evaluate((rid) => {
    if (window.U11RunDetail && window.U11RunDetail.open) { window.U11RunDetail.open(rid); return 'api'; }
    return 'no-api';
  }, runId);
  await page.waitForTimeout(500);
  rd[runId] = await page.evaluate(() => {
    const p = document.querySelector('.u11rd');
    if (!p) return { present: false };
    const kvs = Array.from(p.querySelectorAll('.u11rd-kv')).map((k) => k.innerText.replace(/\n/g, ' = '));
    const trows = Array.from(p.querySelectorAll('.u11rd-trow')).map((r) => ({
      text: r.innerText.replace(/\n/g, ' | '),
      fill: r.querySelector('i') ? r.querySelector('i').getAttribute('data-fill') : null
    }));
    return {
      present: true,
      visible: getComputedStyle(p).display !== 'none' && p.offsetHeight > 0,
      text: p.innerText,
      kvs,
      admitLines: Array.from(p.querySelectorAll('.u11rd-admitline')).map((x) => x.innerText),
      timingRows: trows,
      timingFillSum: trows.reduce((a, b) => a + Number(b.fill || 0), 0),
      sections: Array.from(p.querySelectorAll('.u11rd-sech')).map((s) => s.innerText.replace(/\n/g, ' · ')),
      fc: p.querySelector('.u11rd-fc') ? p.querySelector('.u11rd-fc').innerText : null
    };
  });
  rd[runId].openMode = opened;
  await page.evaluate(() => { if (window.U11RunDetail && window.U11RunDetail.close) window.U11RunDetail.close(); });
  await page.waitForTimeout(200);
}
out.groups.G4_run_detail = rd;

/* ---------- G5: full-document time-string sweep for 12-hour / ambiguity ---------- */
const timeSweep = { rooms: {}, zone: null };
timeSweep.zone = await page.evaluate(() => ({
  zone: window.U11time.zone, isFallback: window.U11time.zoneIsFallback,
  resolved: Intl.DateTimeFormat().resolvedOptions().timeZone,
  sampleWhen: window.U11time.when(window.U11.meta.now, window.U11.meta.now, 'reset'),
  sampleFull: window.U11time.full(window.U11.meta.now),
  sampleClock: window.U11time.clock(Date.parse(window.U11.meta.now)),
  sampleStamp: window.U11time.stamp(window.U11.meta.now)
}));
const ROOMS = ['overview', 'plans', 'costs', 'accounts', 'free', 'context', 'analytics', 'ledger', 'attention', 'cache', 'tools', 'signals', 'authority'];
for (const room of ROOMS) {
  await goTab(room);
  timeSweep.rooms[room] = await page.evaluate(() => {
    const pane = document.querySelector('.u11-pane:not(.pm-hidden)');
    const t = pane ? pane.innerText : '';
    const ampm = t.match(/\b\d{1,2}(:\d{2})?\s?(AM|PM|am|pm|a\.m\.|p\.m\.)\b/g) || [];
    const clocks = t.match(/\b\d{1,2}:\d{2}(:\d{2})?\b/g) || [];
    const clocksWithZone = t.match(/\b\d{1,2}:\d{2}(:\d{2})?\s+[A-Z]{2,5}\b/g) || [];
    return { chars: t.length, ampm, clocks, clocksWithZone };
  });
}
out.groups.G5_time_sweep = timeSweep;

/* ---------- G6: wait-time-vs-provider-active hygiene ---------- */
await goTab('ledger');
out.groups.G6_wait_hygiene = await page.evaluate(() => {
  const d = window.U11;
  /* does any rendered surface add a wait row into a provider-active figure? */
  const bodyText = document.body.innerText;
  return {
    latencySumMs: d.attempts.reduce((a, b) => a + (b.latencyMs || 0), 0),
    attemptsWithLatency: d.attempts.filter((a) => a.latencyMs != null).length,
    mentionsProviderActive: /provider active/i.test(bodyText),
    queueNoteRendered: /never inflate provider tokens/i.test(document.body.innerText)
  };
});

/* ---------- G7: forecast copy / advisory framing ---------- */
out.groups.G7_forecast_copy = await page.evaluate(() => {
  const d = window.U11;
  const all = document.documentElement.innerHTML;
  return {
    advicePhrase: /advice, not a promise|not a promise|advisory|estimate only/i.test(all),
    wordAdvice: (all.match(/\badvice\b/gi) || []).length,
    likelihoodWords: {
      likely: (all.match(/\blikely\b/gi) || []).length,
      uncertain: (all.match(/\buncertain\b/gi) || []).length,
      unlikely: (all.match(/\bunlikely\b/gi) || []).length
    },
    forecastRecommendations: d.forecasts.map((f) => f.recommendation),
    forecastConfidence: d.forecasts.map((f) => f.confidence),
    hasLikelihoodField: d.forecasts.map((f) => ({ id: f.id, keys: Object.keys(f) })),
    reservedNumeric: d.runs.map((r) => ({ id: r.id, reservedFor: r.reservedFor, reservedQty: r.reservedQty === undefined ? 'ABSENT' : r.reservedQty }))
  };
});

/* ---------- G8: capacity envelope value distinctness ---------- */
out.groups.G8_envelope_distinct = await page.evaluate(() => {
  return window.U11.runs.map((r) => {
    const c = r.capacity;
    return {
      id: r.id, ...c, admittedNow: r.admitted.now,
      effEqAdvertised: c.effectiveNow === c.providerAdvertised,
      sustEqEffective: c.predictedSustainable === c.effectiveNow,
      admittedEqSustainable: r.admitted.now === c.predictedSustainable,
      distinctValues: Array.from(new Set([c.hardMax, c.configuredPreferred, c.providerAdvertised, c.effectiveNow, c.predictedSustainable, r.admitted.now])).length
    };
  });
});

/* ---------- G9: overview capacity tile aggregate math ---------- */
await setDisc('advanced');
await goTab('overview');
out.groups.G9_aggregate = await page.evaluate(() => {
  const d = window.U11;
  const running = d.runs.filter((r) => r.status === 'running');
  const sum = (f) => running.reduce((a, r) => a + f(r), 0);
  const pane = document.querySelector('.u11-pane:not(.pm-hidden)');
  const cap = Array.from(pane.querySelectorAll('article.uw')).find((c) => /Completion capacity/.test(c.innerText));
  return {
    runningCount: running.length,
    sumRequested: sum((r) => r.requested.children != null ? r.requested.children : r.requested.members),
    sumAdmitted: sum((r) => r.admitted.now),
    sumQueued: sum((r) => r.queued.children != null ? r.queued.children : r.queued.members),
    sumWaves: sum((r) => r.queued.waves),
    maxWaves: Math.max(...running.map((r) => r.queued.waves)),
    perRunHardMax: running.map((r) => r.capacity.hardMax),
    renderedTiles: cap ? Array.from(cap.querySelectorAll('.uw-tile, .u11w-tile')).map((t) => t.innerText.replace(/\n/g, ' ')) : null,
    capTextHead: cap ? cap.innerText.slice(0, 700) : null
  };
});

/* ---------- G10: screenshots ---------- */
await goTab('overview');
await page.screenshot({ path: OUT + '/ax6-overview-capacity.png' });
await page.evaluate(() => window.U11RunDetail.open('run:goal-47'));
await page.waitForTimeout(600);
await page.screenshot({ path: OUT + '/ax6-rundetail-goal47.png' });
await page.evaluate(() => window.U11RunDetail.close());
await page.waitForTimeout(200);
await page.evaluate(() => window.U11RunDetail.open('run:plan-12'));
await page.waitForTimeout(600);
await page.screenshot({ path: OUT + '/ax6-rundetail-plan12.png' });

out.console = consoleMsgs;
out.finished = new Date().toISOString();
fs.writeFileSync(OUT + '/probe6.json', JSON.stringify(out, null, 1));
console.log('done', consoleMsgs.length, 'console msgs');
await browser.close();
