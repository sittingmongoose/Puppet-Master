/* =====================================================================
   GAP 3 — TIMEZONE RENDERING UNDER A NON-US ZONE + TIME PARTITION MATH
   Independent audit 2026-08-17. READ-ONLY on the concept.
   Writes only: <audit>/audit-evidence/probes/timezone-and-time-partition-probe.json

   Three browser launches, each a SEPARATE browser process with its own
   isolated profile and its own process env TZ:
       1. TZ unset (inherit the sandbox default)   — the audit's own condition
       2. TZ=UTC             — 'UTC' has no '/', the trigger for the fallback path
       3. TZ=Asia/Kolkata    — +05:30, no US-style 3-letter abbreviation

   In each launch we dump:
     (a) every timezone label the UI renders (scraped from rendered text)
     (b) the pinned instant 2026-08-04T18:42:00Z through every public
         U11time renderer, plus Intl's own view of the resolved zone
     (c) 12-hour / AM-PM detection and date-ambiguity detection over the
         complete rendered text of all 13 rooms
     (d) the run:goal-47 run-detail Timing block as RENDERED TEXT: nine
         partition labels, their bar percentages (data-fill and the --wf
         custom property), their duration strings, the section header
         "ELAPSED …" and the "Started …" key/value row.
   ===================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const CONCEPT = '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept';
const AUDIT = '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/audit-evidence';
const SCRATCH = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad';
const OUT = path.join(AUDIT, 'probes', 'timezone-and-time-partition-probe.json');
const SHOTS = path.join(AUDIT, 'screenshots');
const CHROME = '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const PAGE_URL = 'file://' + CONCEPT + '/u11-prism.html';
const PINNED = '2026-08-04T18:42:00Z';
const NAV_TIMEOUT = 30000;
const ACT_TIMEOUT = 12000;
const ROOMS = ['overview', 'plans', 'costs', 'accounts', 'free', 'context', 'analytics',
  'ledger', 'attention', 'cache', 'tools', 'signals', 'authority'];

fs.mkdirSync(SHOTS, { recursive: true });
const req = createRequire(path.join(CONCEPT, '.verify', 'node_modules', '__probe.js'));
const { chromium } = req('playwright-core');

const LIB = `
window.__T = (function () {
  var TIME_RE = /\\b([01]?\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d)?\\b/;
  var AMPM_RE = /\\b(1[0-2]|0?[1-9]):[0-5]\\d\\s?(?:AM|PM|am|pm|a\\.m\\.|p\\.m\\.)\\b/;
  /* a zone label is whatever trails a clock: EDT / EST / UTC / GMT+5:30 / IST */
  var ZONE_AFTER_TIME = /\\b(?:[01]?\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d)?\\s+([A-Z]{2,5}|GMT[+\\u2212-]\\d{1,2}(?::\\d{2})?|UTC[+\\u2212-]?\\d*(?::\\d{2})?)\\b/g;
  function textNodes(root) {
    var w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (t) {
        var p = t.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEMPLATE') return NodeFilter.FILTER_REJECT;
        if (p.closest('.pm-hidden') || p.closest('[hidden]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var out = [], n;
    while ((n = w.nextNode())) { var v = (n.nodeValue || '').replace(/\\s+/g, ' ').trim(); if (v) out.push({ text: v, host: hostOf(n.parentElement) }); }
    return out;
  }
  function hostOf(el) {
    if (!el) return '';
    var s = el.tagName.toLowerCase();
    var cls = (el.getAttribute('class') || '').trim().split(/\\s+/).filter(Boolean).slice(0, 2);
    if (cls.length) s += '.' + cls.join('.');
    var pane = el.closest('[data-pane]');
    return (pane ? pane.getAttribute('data-pane') + ' :: ' : '') + s;
  }
  function zoneLabels(root) {
    var counts = {}, samples = {};
    textNodes(root).forEach(function (t) {
      var m;
      ZONE_AFTER_TIME.lastIndex = 0;
      while ((m = ZONE_AFTER_TIME.exec(t.text))) {
        var z = m[1];
        counts[z] = (counts[z] || 0) + 1;
        if (!samples[z]) samples[z] = { text: t.text.slice(0, 90), host: t.host };
      }
    });
    return { counts: counts, samples: samples };
  }
  function clockStrings(root) {
    var all = [];
    textNodes(root).forEach(function (t) {
      if (TIME_RE.test(t.text)) all.push(t);
    });
    return all;
  }
  function twelveHour(root) {
    var hits = [];
    textNodes(root).forEach(function (t) { if (AMPM_RE.test(t.text)) hits.push(t); });
    return hits;
  }
  /* a clock string with no zone label and no date next to it is ambiguous:
     the reader cannot tell which zone or which calendar day it belongs to */
  function ambiguous(root) {
    var hits = [];
    var DATE_RE = /\\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Mon|Tue|Wed|Thu|Fri|Sat|Sun)\\b/;
    var ZONE_RE = /\\b([A-Z]{2,5}|GMT[+\\u2212-]\\d|UTC)\\b/;
    clockStrings(root).forEach(function (t) {
      var hasZone = ZONE_RE.test(t.text), hasDate = DATE_RE.test(t.text);
      if (!hasZone) hits.push({ text: t.text.slice(0, 90), host: t.host, hasDate: hasDate, hasZone: hasZone });
    });
    return hits;
  }
  function hourHistogram(root) {
    var h = {};
    var re = /\\b([01]?\\d|2[0-3]):([0-5]\\d)\\b/g;
    textNodes(root).forEach(function (t) {
      var m; re.lastIndex = 0;
      while ((m = re.exec(t.text))) { var k = String(parseInt(m[1], 10)); h[k] = (h[k] || 0) + 1; }
    });
    return h;
  }
  function timeApi(pinned) {
    var T = window.U11time;
    if (!T) return { err: 'U11time missing' };
    var out = {
      zone: T.zone, zoneIsFallback: T.zoneIsFallback,
      intlResolvedTimeZone: (function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return 'ERR ' + e; } })(),
      intlResolvedHourCycle: (function () { try { return Intl.DateTimeFormat('en-US', { hour: '2-digit' }).resolvedOptions().hourCycle; } catch (e) { return null; } })(),
      intlResolvedLocale: (function () { try { return Intl.DateTimeFormat().resolvedOptions().locale; } catch (e) { return null; } })(),
      jsDateGetTimezoneOffsetMin: new Date(pinned).getTimezoneOffset(),
      jsDateToString: new Date(pinned).toString(),
      jsToLocaleTimeString: new Date(pinned).toLocaleTimeString(),
      pinnedInstant: pinned,
      renderers: {}
    };
    var t = pinned;
    ['clock', 'clockSec', 'zoneAbbr', 'atClock', 'atDayClock', 'atMonthDayClock', 'stamp', 'full'].forEach(function (k) {
      try { out.renderers[k] = T[k](k === 'clock' || k === 'clockSec' || k === 'zoneAbbr' ? Date.parse(t) : t); }
      catch (e) { out.renderers[k] = 'ERR ' + e.message; }
    });
    /* the reset-style relative renderer, 4h into the future from the pinned now */
    try { out.renderers['when(+4h, reset)'] = T.when(Date.parse(t) + 4 * 3600000, t, 'reset'); } catch (e) { out.renderers['when(+4h, reset)'] = 'ERR'; }
    try { out.renderers['when(+5d, reset)'] = T.when(Date.parse(t) + 5 * 86400000 + 9 * 3600000, t, 'reset'); } catch (e) {}
    try { out.renderers['when(+28d, expiry)'] = T.when(Date.parse(t) + 28 * 86400000, t, 'expiry'); } catch (e) {}
    try { out.renderers['dur(124min)'] = T.dur(124 * 60000); } catch (e) {}
    try { out.renderers['dur(128min)'] = T.dur(128 * 60000); } catch (e) {}
    /* what the SAME instant should look like in the actual system zone */
    try {
      var sysZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      out.correctForSystemZone = new Intl.DateTimeFormat('en-US', { timeZone: sysZone, hourCycle: 'h23',
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }).format(new Date(t));
      out.renderedByU11 = T.atClock(t);
      out.systemZoneUsed = sysZone;
    } catch (e) { out.correctForSystemZone = 'ERR'; }
    return out;
  }
  function runDetailTiming() {
    var panel = document.querySelector('.u11rd');
    if (!panel) return { err: 'run detail panel not in DOM' };
    var open = panel.classList.contains('on');
    var sechs = Array.prototype.slice.call(panel.querySelectorAll('.u11rd-sech')).map(function (s) {
      var cs = getComputedStyle(s);
      return { rawTextContent: (s.textContent || '').replace(/\\s+/g, ' ').trim(),
        renderedInnerText: (s.innerText || '').replace(/\\s+/g, ' ').trim(),
        textTransform: cs.textTransform, fontFamily: cs.fontFamily };
    });
    var kvs = Array.prototype.slice.call(panel.querySelectorAll('.u11rd-kv')).map(function (k) {
      return { key: (k.querySelector('span') || {}).textContent || '', value: (k.querySelector('b') || {}).textContent || '' };
    });
    var rows = Array.prototype.slice.call(panel.querySelectorAll('.u11rd-trow')).map(function (r) {
      var fill = r.querySelector('.u11rd-tbar i');
      var cs = fill ? getComputedStyle(fill) : null;
      var bar = r.querySelector('.u11rd-tbar');
      return {
        label: (r.querySelector('.u11rd-tlab') || {}).textContent || '',
        dataFill: fill ? fill.getAttribute('data-fill') : null,
        inlineWf: fill ? (fill.getAttribute('style') || '') : null,
        computedFillWidthPx: fill ? Math.round(fill.getBoundingClientRect().width * 100) / 100 : null,
        computedBarWidthPx: bar ? Math.round(bar.getBoundingClientRect().width * 100) / 100 : null,
        computedFillPctOfBar: (fill && bar && bar.getBoundingClientRect().width > 0)
          ? Math.round(fill.getBoundingClientRect().width / bar.getBoundingClientRect().width * 1000) / 10 : null,
        valueText: (r.querySelector('b') || {}).textContent || '',
        classes: r.getAttribute('class')
      };
    });
    var barSum = rows.reduce(function (a, r) { return a + (parseFloat(r.dataFill) || 0); }, 0);
    function minsOf(s) {
      var m = /^(?:(\\d+)h\\s*)?(\\d+)m$/.exec((s || '').trim());
      if (m) return (parseInt(m[1] || '0', 10) * 60) + parseInt(m[2], 10);
      var d = /^(\\d+)d\\s*(\\d+)h$/.exec((s || '').trim());
      if (d) return parseInt(d[1], 10) * 1440 + parseInt(d[2], 10) * 60;
      var sec = /^(\\d+)s$/.exec((s || '').trim());
      if (sec) return 0;
      return null;
    }
    var partMins = rows.map(function (r) { return minsOf(r.valueText); });
    var timingHeader = sechs.filter(function (s) { return /ELAPSED|elapsed/i.test(s.rawTextContent); })[0] || null;
    var elapsedMins = timingHeader ? minsOf((/(?:elapsed|ELAPSED)\\s*(.+)$/i.exec(timingHeader.rawTextContent) || [])[1]) : null;
    return {
      panelOpen: open,
      titleText: (panel.querySelector('.u11rd-title') || {}).textContent || null,
      idLine: (panel.querySelector('.u11rd-idline') || {}).textContent || null,
      sectionHeaders: sechs,
      timingSectionHeader: timingHeader,
      keyValueRows: kvs,
      startedRow: kvs.filter(function (k) { return /^Started/.test(k.key); })[0] || null,
      partitionRows: rows,
      partitionCount: rows.length,
      barPercentSum: Math.round(barSum * 10) / 10,
      partitionMinutes: partMins,
      partitionMinuteSum: partMins.every(function (v) { return v != null; }) ? partMins.reduce(function (a, b) { return a + b; }, 0) : null,
      elapsedHeaderMinutes: elapsedMins,
      noteText: (panel.querySelector('.u11rd-note') || {}).textContent || null
    };
  }
  return { zoneLabels: zoneLabels, clockStrings: clockStrings, twelveHour: twelveHour,
    ambiguous: ambiguous, hourHistogram: hourHistogram, timeApi: timeApi,
    runDetailTiming: runDetailTiming, textNodes: textNodes };
})();
`;

const RUN_IDS = ['run:goal-47', 'run:plan-12', 'run:crew-3'];

async function runOne(label, tz, port) {
  const profile = path.join(SCRATCH, 'gap3-profile-' + label.replace(/[^a-z0-9]/gi, '_'));
  fs.rmSync(profile, { recursive: true, force: true });
  fs.mkdirSync(profile, { recursive: true });
  const env = { ...process.env };
  if (tz === null) delete env.TZ; else env.TZ = tz;

  const ctx = await chromium.launchPersistentContext(profile, {
    headless: true, executablePath: CHROME, viewport: { width: 1700, height: 1000 },
    env,
    args: ['--headless', '--disable-gpu', '--no-sandbox', '--no-first-run',
      '--no-default-browser-check', '--remote-debugging-port=' + port, '--font-render-hinting=none']
  });
  const res = { label, processEnvTZ: tz === null ? '(unset — sandbox default)' : tz, port };
  const page = await ctx.newPage();
  page.setDefaultTimeout(ACT_TIMEOUT);
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e).slice(0, 250)));
  await page.addInitScript((kv) => { try { Object.keys(kv).forEach(k => localStorage.setItem(k, kv[k])); } catch {} },
    { 'pm.theme': 'friendly-dark', 'u11:disclosure': '"advanced"', 'u11:scope': '"scope:all"' });
  await page.addInitScript(LIB);
  await page.goto(PAGE_URL, { waitUntil: 'load', timeout: NAV_TIMEOUT });
  await page.waitForSelector('.us-page.u11', { timeout: 15000 });
  await page.waitForTimeout(2200);

  /* ---- (b) the time API + Intl, and the fallback flag ---- */
  res.timeApi = await page.evaluate((p) => window.__T.timeApi(p), PINNED);
  res.fixtureNowFromData = await page.evaluate(() => { try { return window.U11.meta.now; } catch (e) { return null; } });

  /* ---- (a)+(c) rendered labels / 12-hour / ambiguity across all 13 rooms ---- */
  res.perRoom = {};
  const agg = { zoneCounts: {}, twelveHour: [], ambiguous: [], hourHistogram: {}, clockSamples: [] };
  for (const room of ROOMS) {
    await page.evaluate((r) => { const it = document.querySelector('.u11-rail .u11-item[data-tab="' + r + '"]'); if (it) it.click(); }, room);
    await page.waitForTimeout(800);
    const m = await page.evaluate(() => ({
      zones: window.__T.zoneLabels(document.body),
      twelve: window.__T.twelveHour(document.body),
      amb: window.__T.ambiguous(document.body),
      hours: window.__T.hourHistogram(document.body),
      clocks: window.__T.clockStrings(document.body).slice(0, 14)
    }));
    res.perRoom[room] = {
      zoneLabelCounts: m.zones.counts, zoneLabelSamples: m.zones.samples,
      twelveHourHits: m.twelve.length, twelveHourSamples: m.twelve.slice(0, 5),
      ambiguousClockCount: m.amb.length, ambiguousSamples: m.amb.slice(0, 6),
      clockStringSamples: m.clocks.map(c => c.text.slice(0, 80))
    };
    Object.entries(m.zones.counts).forEach(([k, v]) => { agg.zoneCounts[k] = (agg.zoneCounts[k] || 0) + v; });
    Object.entries(m.hours).forEach(([k, v]) => { agg.hourHistogram[k] = (agg.hourHistogram[k] || 0) + v; });
    m.twelve.forEach(t => { if (agg.twelveHour.length < 12) agg.twelveHour.push({ room, ...t }); });
    m.amb.forEach(t => { if (agg.ambiguous.length < 25) agg.ambiguous.push({ room, ...t }); });
    m.clocks.slice(0, 4).forEach(c => { if (agg.clockSamples.length < 40) agg.clockSamples.push({ room, text: c.text.slice(0, 80), host: c.host }); });
  }
  res.aggregate = {
    zoneLabelCountsAllRooms: agg.zoneCounts,
    distinctZoneLabels: Object.keys(agg.zoneCounts),
    twelveHourHitsAllRooms: agg.twelveHour.length, twelveHourSamples: agg.twelveHour,
    ambiguousClockStringsAllRooms: agg.ambiguous.length, ambiguousSamples: agg.ambiguous,
    renderedHourHistogram: agg.hourHistogram,
    anyHourAbove12: Object.keys(agg.hourHistogram).some(h => parseInt(h, 10) > 12),
    clockSamples: agg.clockSamples
  };

  /* ---- header "as of" label ---- */
  res.headerAsOf = await page.evaluate(() => {
    const cands = Array.from(document.querySelectorAll('.us-head, .us-head-sub, .u11-imeta, .u11-km, [data-meta="overview"]'));
    return cands.map(c => ({ sel: (c.getAttribute('class') || c.tagName), text: (c.innerText || c.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120) }))
      .filter(x => x.text);
  });

  /* ---- (d) run detail for every run ---- */
  res.runDetail = {};
  for (const rid of RUN_IDS) {
    await page.evaluate((r) => { const it = document.querySelector('.u11-rail .u11-item[data-tab="' + r + '"]'); if (it) it.click(); }, 'ledger');
    await page.waitForTimeout(700);
    const opened = await page.evaluate((id) => {
      if (!window.U11RunDetail) return { ok: false, why: 'U11RunDetail missing' };
      window.U11RunDetail.open(id);
      return { ok: true };
    }, rid);
    await page.waitForTimeout(1100);
    const t = await page.evaluate(() => window.__T.runDetailTiming());
    /* zone labels and 12h detection INSIDE the open run detail panel only */
    const inPanel = await page.evaluate(() => {
      const p = document.querySelector('.u11rd');
      if (!p) return null;
      return { zones: window.__T.zoneLabels(p), twelve: window.__T.twelveHour(p),
        amb: window.__T.ambiguous(p),
        fullText: (p.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 1400) };
    });
    res.runDetail[rid] = { opened, timing: t, panelScan: inPanel };
    if (rid === 'run:goal-47') {
      try { await page.screenshot({ path: path.join(SHOTS, 'gap3-rundetail-goal47-' + label.replace(/[^a-z0-9]/gi, '_') + '.png') }); } catch (e) {}
    }
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(500);
  }

  /* ---- arithmetic verdicts for A06-05, computed from the RENDERED text ---- */
  const g = res.runDetail['run:goal-47'] && res.runDetail['run:goal-47'].timing;
  if (g && !g.err) {
    res.a06_05_verdict = {
      partitionCount: g.partitionCount,
      partitionValueStrings: g.partitionRows.map(r => r.label + ' = ' + r.valueText + ' (' + r.dataFill + '%)'),
      partitionMinuteSum: g.partitionMinuteSum,
      elapsedHeaderText: g.timingSectionHeader ? g.timingSectionHeader.renderedInnerText : null,
      elapsedHeaderMinutes: g.elapsedHeaderMinutes,
      barPercentSum: g.barPercentSum,
      startedRowRendered: g.startedRow,
      partitionSumVsElapsed: (g.partitionMinuteSum != null && g.elapsedHeaderMinutes != null)
        ? g.partitionMinuteSum - g.elapsedHeaderMinutes : null,
      barSumOver100: g.barPercentSum != null ? +(g.barPercentSum - 100).toFixed(1) : null
    };
  }
  res.pageErrors = pageErrors;
  await page.close();
  await ctx.close();
  return res;
}

const out = {
  meta: {
    probe: 'gap3-timezone-and-time-partition', generated: new Date().toISOString(),
    url: PAGE_URL, pinnedInstant: PINNED,
    method: 'three separate browser processes, each with its own isolated profile and its own process env TZ; every number below is scraped from RENDERED text or computed geometry, never from the fixture source',
    fixtureFacts: {
      'u11-data.js:27 NOW_ISO': '2026-08-04T18:42:00Z',
      'u11-time.js:17 FALLBACK_ZONE': 'America/New_York',
      'u11-time.js:20 zone accept test': "z.indexOf('/') !== -1  — so any IANA id without a slash (UTC, GMT, EST5EDT-style, Zulu) is REJECTED and silently replaced by America/New_York",
      'run:goal-47 timing.elapsedMs': '124 min',
      'run:goal-47 timing.rows (9)': '12 + 47 + 31 + 9 + 6 + 0 + 19 + 0 + 4 = 128 min',
      'run:goal-47 startedAt': 'NOW - 130 min'
    },
    runIdsOpened: RUN_IDS
  },
  runs: {}
};

out.runs.default = await runOne('1-TZ-unset-default', null, 9491);
out.runs.utc = await runOne('2-TZ-UTC', 'UTC', 9492);
out.runs.kolkata = await runOne('3-TZ-Asia-Kolkata', 'Asia/Kolkata', 9493);

/* ---------------------------------------------------------- cross verdicts */
const R = out.runs;
out.verdicts = {
  a06_06_timezoneFallback: {
    claim: 'u11-time.js has a timezone fallback defect and the pinned instant renders as "14:42 EDT"',
    perLaunch: Object.fromEntries(Object.entries(R).map(([k, v]) => [k, {
      processEnvTZ: v.processEnvTZ,
      intlResolvedTimeZone: v.timeApi.intlResolvedTimeZone,
      U11time_zone: v.timeApi.zone,
      U11time_zoneIsFallback: v.timeApi.zoneIsFallback,
      renderedAtClock: v.timeApi.renderers.atClock,
      renderedFull: v.timeApi.renderers.full,
      whatTheSystemZoneWouldSay: v.timeApi.correctForSystemZone,
      zoneLabelsActuallyOnScreen: v.aggregate.distinctZoneLabels
    }])),
    fallbackTriggered: Object.fromEntries(Object.entries(R).map(([k, v]) => [k, v.timeApi.zoneIsFallback])),
    rendersEDTDespiteSystemZone: Object.fromEntries(Object.entries(R).map(([k, v]) => [k,
      v.timeApi.zone === 'America/New_York' && v.timeApi.intlResolvedTimeZone !== 'America/New_York'])),
    pinnedRendersAs1442EDT: Object.fromEntries(Object.entries(R).map(([k, v]) => [k, v.timeApi.renderers.atClock]))
  },
  twelveHour: Object.fromEntries(Object.entries(R).map(([k, v]) => [k, {
    hits: v.aggregate.twelveHourHitsAllRooms, samples: v.aggregate.twelveHourSamples.slice(0, 4),
    anyRenderedHourAbove12: v.aggregate.anyHourAbove12, hourHistogram: v.aggregate.renderedHourHistogram
  }])),
  ambiguity: Object.fromEntries(Object.entries(R).map(([k, v]) => [k, {
    clockStringsWithNoZoneLabel: v.aggregate.ambiguousClockStringsAllRooms,
    samples: v.aggregate.ambiguousSamples.slice(0, 8)
  }])),
  a06_05_timePartitions: Object.fromEntries(Object.entries(R).map(([k, v]) => [k, v.a06_05_verdict || null]))
};

fs.writeFileSync(OUT, JSON.stringify(out, null, 2));

/* --------------------------------------------------------------- stdout */
console.log('=== GAP3 ===');
for (const [k, v] of Object.entries(R)) {
  console.log('--- ' + v.label + '  (process env TZ=' + v.processEnvTZ + ') ---');
  console.log('  Intl resolved zone      : ' + v.timeApi.intlResolvedTimeZone + '   hourCycle=' + v.timeApi.intlResolvedHourCycle + '  locale=' + v.timeApi.intlResolvedLocale);
  console.log('  U11time.zone            : ' + v.timeApi.zone + '   zoneIsFallback=' + v.timeApi.zoneIsFallback);
  console.log('  pinned ' + PINNED + ':');
  console.log('     U11time.atClock      : ' + v.timeApi.renderers.atClock);
  console.log('     U11time.stamp        : ' + v.timeApi.renderers.stamp);
  console.log('     U11time.full         : ' + v.timeApi.renderers.full);
  console.log('     when(+4h,reset)      : ' + v.timeApi.renderers['when(+4h, reset)']);
  console.log('     correct for sys zone : ' + v.timeApi.correctForSystemZone);
  console.log('  zone labels on screen   : ' + JSON.stringify(v.aggregate.zoneLabelCountsAllRooms));
  console.log('  12-hour/AM-PM hits      : ' + v.aggregate.twelveHourHitsAllRooms + '  hoursAbove12=' + v.aggregate.anyHourAbove12);
  console.log('  clocks with no zone lbl : ' + v.aggregate.ambiguousClockStringsAllRooms);
  const g = v.a06_05_verdict;
  if (g) {
    console.log('  run:goal-47 timing header: ' + g.elapsedHeaderText);
    console.log('    Started row           : ' + JSON.stringify(g.startedRowRendered));
    console.log('    partitions            : ' + g.partitionCount + '  minutes sum=' + g.partitionMinuteSum +
      '  vs elapsed header=' + g.elapsedHeaderMinutes + ' (delta ' + g.partitionSumVsElapsed + ')');
    console.log('    bar % sum             : ' + g.barPercentSum + ' (over 100 by ' + g.barSumOver100 + ')');
    g.partitionValueStrings.forEach(s => console.log('      ' + s));
  }
  console.log('  pageErrors: ' + v.pageErrors.length);
}
console.log('WROTE ' + OUT);
process.exit(0);
