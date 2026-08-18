/* =====================================================================
   GAP 2 — LAYOUT WITH THE REAL WEBFONTS LOADED  (u11-prism)
   Independent audit 2026-08-17. READ-ONLY on the concept.
   Writes only:  <audit>/audit-evidence/probes/fonts-loaded-layout-probe.json

   Why: the whole file:// probe suite measured clipped text with 5 of the 8
   Google webfonts unresolved, so every clipping finding was taken under
   FALLBACK font metrics. This probe serves the same concept tree over a
   loopback http origin (127.0.0.1:8097) so the CSS font stack actually
   resolves, waits for document.fonts.ready, asserts document.fonts.size,
   then re-runs the IDENTICAL clipped-text predicate. It then re-runs the
   same sweep over file:// in the same process so the two columns are
   comparable line for line.

   The clipped-text predicate below is copied verbatim from the audit
   harness (audit-probe.mjs clippedText/cssPath/inHiddenPane) so the numbers
   are directly comparable to the numbers already in the audit.
   ===================================================================== */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const CONCEPT = '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept';
const AUDIT = '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/audit-evidence';
const SCRATCH = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad';
const PROFILE = path.join(SCRATCH, 'gap2-profile');
const OUT = path.join(AUDIT, 'probes', 'fonts-loaded-layout-probe.json');
const SHOTS = path.join(AUDIT, 'screenshots');
const CHROME = '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const PORT = 8097;
const NAV_TIMEOUT = 40000;
const ACT_TIMEOUT = 15000;
const VH = 1000;
const WIDTHS = [360, 520, 768];
const ROOMS = ['overview', 'plans', 'costs', 'accounts', 'free', 'context', 'analytics',
  'ledger', 'attention', 'cache', 'tools', 'signals', 'authority'];

fs.mkdirSync(PROFILE, { recursive: true });
fs.mkdirSync(SHOTS, { recursive: true });
const req = createRequire(path.join(CONCEPT, '.verify', 'node_modules', '__probe.js'));
const { chromium } = req('playwright-core');

/* ---------------- read-only static server over the concept tree -------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.ttf': 'font/ttf', '.ico': 'image/x-icon', '.md': 'text/markdown; charset=utf-8' };
const served = [];
const server = http.createServer((rq, rs) => {
  let u = decodeURIComponent((rq.url || '/').split('?')[0]);
  if (u === '/') u = '/u11-prism.html';
  const f = path.normalize(path.join(CONCEPT, u));
  if (!f.startsWith(CONCEPT + path.sep) || !fs.existsSync(f) || !fs.statSync(f).isFile()) {
    served.push({ url: u, status: 404 }); rs.writeHead(404); rs.end('not found'); return;
  }
  served.push({ url: u, status: 200 });
  rs.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream',
    'cache-control': 'no-store' });
  fs.createReadStream(f).pipe(rs);          /* READ ONLY — never opened for write */
});
await new Promise((r, j) => { server.once('error', j); server.listen(PORT, '127.0.0.1', r); });
const HTTP_URL = 'http://127.0.0.1:' + PORT + '/u11-prism.html';
const FILE_URL = 'file://' + CONCEPT + '/u11-prism.html';

/* --------------- in-page measurement lib (verbatim predicate) ---------- */
const LIB = `
window.__F = (function () {
  function cssPath(el, maxUp) {
    if (!el || el.nodeType !== 1) return '';
    var parts = [], node = el, up = 0, cap = maxUp || 14;
    while (node && node.nodeType === 1 && up <= cap) {
      var seg = node.tagName.toLowerCase();
      if (node.id) { parts.unshift(seg + '#' + node.id); break; }
      if (node.hasAttribute('data-pane')) { parts.unshift(seg + '[data-pane="' + node.getAttribute('data-pane') + '"]'); break; }
      if (node.hasAttribute('data-u11-page')) { parts.unshift(seg + '[data-u11-page="' + node.getAttribute('data-u11-page') + '"]'); break; }
      var cls = (node.getAttribute('class') || '').trim().split(/\\s+/).filter(Boolean)
        .filter(function (c) { return !/^(active|on|is-|uw-enter|pm-hidden)/.test(c); }).slice(0, 3);
      if (cls.length) seg += '.' + cls.join('.');
      if (node.parentElement) {
        var sibs = Array.prototype.filter.call(node.parentElement.children, function (c) { return c.tagName === node.tagName; });
        if (sibs.length > 1) seg += ':nth-of-type(' + (sibs.indexOf(node) + 1) + ')';
      }
      parts.unshift(seg);
      node = node.parentElement; up++;
    }
    return parts.join('>');
  }
  function inHiddenPane(el) { return !!(el.closest && el.closest('.pm-hidden')); }
  /* ---- VERBATIM from audit-probe.mjs clippedText() ---- */
  function clippedText(limit) {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var seen = new Set(), viol = [], collapsed = [], truncated = 0, spills = 0, zeroW = 0, checked = 0;
    var node;
    while ((node = w.nextNode())) {
      if (!node.nodeValue || !node.nodeValue.trim()) continue;
      var el = node.parentElement;
      if (!el || seen.has(el)) continue;
      seen.add(el);
      if (inHiddenPane(el)) continue;
      if (el.checkVisibility && !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true, contentVisibilityAuto: true })) continue;
      var st0 = getComputedStyle(el);
      if (st0.display === 'none' || st0.visibility === 'hidden') continue;
      checked++;
      var sw = el.scrollWidth, cw = el.clientWidth;
      var r = el.getBoundingClientRect();
      if ((cw === 0 || r.width < 1) && sw > 1) {
        zeroW++;
        if (collapsed.length < (limit || 25)) {
          collapsed.push({ sel: cssPath(el, 4), clientWidth: cw, scrollWidth: sw, rectW: +r.width.toFixed(1),
            display: st0.display, flexBasis: st0.flexBasis, minWidth: st0.minWidth, overflowX: st0.overflowX,
            parentGridTemplate: el.parentElement ? getComputedStyle(el.parentElement).gridTemplateColumns : null,
            kind: 'collapsed-to-zero-width',
            text: (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 70) });
        }
        continue;
      }
      if (r.width <= 0 || r.height <= 0) continue;
      if (sw <= cw + 1) continue;
      var s = st0;
      if (s.textOverflow === 'ellipsis') continue;
      var clips = s.overflowX !== 'visible';
      if (clips) truncated++; else spills++;
      if (viol.length < (limit || 25)) {
        viol.push({ sel: cssPath(el, 4), scrollWidth: sw, clientWidth: cw, over: sw - cw,
          overflowX: s.overflowX, whiteSpace: s.whiteSpace, textOverflow: s.textOverflow,
          cls: (el.getAttribute('class') || '').trim(),
          fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight,
          renderedFont: null,
          kind: clips ? 'truncated-no-ellipsis' : 'spills-outside-box',
          text: (el.innerText || el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 60) });
      }
    }
    return { checkedLeaves: checked, total: truncated + spills + zeroW,
      truncatedNoEllipsis: truncated, spillsOutsideBox: spills, collapsedToZeroWidth: zeroW,
      sample: viol, collapsedSample: collapsed };
  }
  function pageOverflow() {
    var se = document.scrollingElement;
    return { scrollWidth: se.scrollWidth, clientWidth: se.clientWidth, over: se.scrollWidth - se.clientWidth,
      bodyScrollWidth: document.body.scrollWidth, innerWidth: window.innerWidth };
  }
  /* the specific class the prior finding named */
  function attstatusCensus() {
    var els = Array.prototype.slice.call(document.querySelectorAll('.u11w-attstatus'));
    var vis = els.filter(function (e) { return !inHiddenPane(e) && (e.offsetWidth || e.offsetHeight); });
    var over = vis.filter(function (e) { return e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).textOverflow !== 'ellipsis'; });
    return {
      totalInDom: els.length, visibleInActiveRoom: vis.length, overflowing: over.length,
      widths: over.slice(0, 40).map(function (e) {
        var s = getComputedStyle(e);
        return { scrollWidth: e.scrollWidth, clientWidth: e.clientWidth, over: e.scrollWidth - e.clientWidth,
          text: (e.textContent || '').trim().slice(0, 30), fontFamily: s.fontFamily, fontSize: s.fontSize,
          fontWeight: s.fontWeight, letterSpacing: s.letterSpacing, textTransform: s.textTransform };
      }),
      allVisibleWidths: vis.slice(0, 60).map(function (e) {
        return { sw: e.scrollWidth, cw: e.clientWidth, t: (e.textContent || '').trim().slice(0, 20) };
      })
    };
  }
  /* measured text advance of the exact strings that clip, per family */
  function advance(text, fontShorthand) {
    var c = document.createElement('canvas').getContext('2d');
    c.font = fontShorthand;
    return +c.measureText(text).width.toFixed(2);
  }
  function fontState() {
    var fams = ['Inter', 'Nunito', 'Outfit', 'Quicksand', 'Rajdhani', 'Sora', 'JetBrains Mono', 'Cal Sans'];
    var checks = {}, loadedFams = {}, faces = [];
    try {
      fams.forEach(function (f) { checks[f] = document.fonts.check('700 11px "' + f + '"'); });
      document.fonts.forEach(function (ff) {
        var k = ff.family.replace(/^["']|["']$/g, '');
        loadedFams[k] = loadedFams[k] || { count: 0, statuses: {} };
        loadedFams[k].count++;
        loadedFams[k].statuses[ff.status] = (loadedFams[k].statuses[ff.status] || 0) + 1;
        if (faces.length < 6) faces.push({ family: k, weight: ff.weight, status: ff.status });
      });
    } catch (e) { checks._err = String(e); }
    var probe = document.querySelector('.u11w-attstatus') || document.querySelector('.u11-kt') || document.body;
    var cs = getComputedStyle(probe);
    return {
      docFontsStatus: document.fonts.status, docFontsSize: document.fonts.size,
      familyChecks: checks, loadedFamilies: loadedFams, sampleFaces: faces,
      cssVars: {
        displayFont: getComputedStyle(document.documentElement).getPropertyValue('--display-font').trim(),
        bodyFont: getComputedStyle(document.documentElement).getPropertyValue('--body-font').trim(),
        monoFont: getComputedStyle(document.documentElement).getPropertyValue('--mono-font').trim()
      },
      probeElement: { sel: probe.className || probe.tagName, fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight },
      advances: {
        'completed @ 700 9px Rajdhani': advance('completed', '700 9px Rajdhani, sans-serif'),
        'completed @ 700 9px sans-serif': advance('completed', '700 9px sans-serif'),
        'completed @ computed font of .u11w-attstatus': advance('completed', cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily)
      },
      fontCdnResources: (function () {
        try {
          return performance.getEntriesByType('resource')
            .filter(function (e) { return /fonts\\.(googleapis|gstatic)\\.com/.test(e.name); })
            .map(function (e) { return { name: e.name.slice(0, 90), transferSize: e.transferSize,
              decodedBodySize: e.decodedBodySize, duration: +e.duration.toFixed(1) }; }).slice(0, 8);
        } catch (e) { return []; }
      })()
    };
  }
  return { clippedText: clippedText, pageOverflow: pageOverflow, attstatusCensus: attstatusCensus,
    fontState: fontState, cssPath: cssPath, advance: advance };
})();
`;

/* -------------------------------------------------------------------- run */
const ctx = await chromium.launchPersistentContext(PROFILE, {
  headless: true, executablePath: CHROME, viewport: { width: 1280, height: VH },
  args: ['--headless', '--disable-gpu', '--no-sandbox', '--no-first-run',
    '--no-default-browser-check', '--remote-debugging-port=9482', '--font-render-hinting=none']
});

const out = {
  meta: {
    probe: 'gap2-fonts-loaded-layout', generated: new Date().toISOString(),
    httpOrigin: HTTP_URL, fileOrigin: FILE_URL,
    predicate: 'VERBATIM copy of audit-probe.mjs clippedText(): per leaf-text element, (clientWidth===0||rectW<1)&&scrollWidth>1 => collapsed-to-zero-width; else scrollWidth > clientWidth+1 AND computed text-overflow !== "ellipsis" => truncated-no-ellipsis (overflow-x clipping) or spills-outside-box (overflow-x visible)',
    fixture: 'theme friendly-dark, disclosure "advanced" (all widget types mounted), widget layout storage cleared per page — same configuration as the audit\'s G1 cross-room sweep',
    widths: WIDTHS, rooms: ROOMS, viewportHeight: VH
  },
  fontState: {}, sweep: {}, ledger360: {}, comparison: {}, requests: {}, errors: []
};

async function newPage(width, disclosure, blockFontCdn) {
  const p = await ctx.newPage();
  await p.setViewportSize({ width, height: VH });
  if (blockFontCdn) {
    /* genuine fallback control: the CSS font stack cannot resolve at all */
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  }
  const rec = { consoleErrors: [], pageErrors: [], requestFailed: [], fontReq: [], non2xx: [] };
  p.on('console', m => { if (m.type() === 'error') rec.consoleErrors.push(m.text().slice(0, 200)); });
  p.on('pageerror', e => rec.pageErrors.push(String(e).slice(0, 200)));
  p.on('requestfailed', r => rec.requestFailed.push(r.url().slice(0, 110) + ' :: ' + ((r.failure() && r.failure().errorText) || '?')));
  p.on('response', r => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) rec.fontReq.push({ url: r.url().slice(0, 90), status: r.status() });
    if (r.status() >= 400) rec.non2xx.push({ url: r.url().slice(0, 90), status: r.status() });
  });
  p._rec = rec;
  await p.addInitScript(LIB);
  await p.addInitScript(({ theme, disc }) => {
    try {
      Object.keys(localStorage).filter(k => /^pmw:/.test(k) || /^u11:/.test(k)).forEach(k => localStorage.removeItem(k));
      localStorage.setItem('pm.theme', theme);
      localStorage.setItem('u11:disclosure', JSON.stringify(disc));
    } catch (e) {}
  }, { theme: 'friendly-dark', disc: disclosure });
  p.setDefaultTimeout(ACT_TIMEOUT);
  p.setDefaultNavigationTimeout(NAV_TIMEOUT);
  return p;
}

async function loadAndSettleFonts(p, url, requireFonts) {
  await p.goto(url, { waitUntil: 'load', timeout: NAV_TIMEOUT });
  await p.waitForSelector('.us-page.u11', { timeout: 20000 });
  /* the stylesheet is swapped in by the preload onload handler; give it room,
     then block on document.fonts.ready */
  const fontsReady = await p.evaluate(async (needFonts) => {
    const t0 = performance.now();
    try { await document.fonts.ready; } catch (e) {}
    /* if the CSS arrived late, ready may have resolved before the faces were
       registered — poll (bounded) until the registry stops growing */
    let last = -1, stableFor = 0;
    while (performance.now() - t0 < 12000) {
      const n = document.fonts.size;
      if (n === last) { stableFor++; if (stableFor >= 4 && (!needFonts || n >= 100)) break; }
      else { stableFor = 0; last = n; }
      await new Promise(r => setTimeout(r, 250));
      try { await document.fonts.ready; } catch (e) {}
    }
    return { size: document.fonts.size, status: document.fonts.status, waitedMs: Math.round(performance.now() - t0) };
  }, requireFonts);
  await p.waitForTimeout(1600);            /* relayout after face swap */
  return fontsReady;
}

async function gotoRoom(p, room) {
  const ok = await p.evaluate((r) => {
    const it = document.querySelector('.u11-rail .u11-item[data-tab="' + r + '"]');
    if (!it) return false;
    it.click(); return true;
  }, room);
  await p.waitForTimeout(750);
  return ok;
}

/* the ACTUAL font the rasteriser used for a node — the only unambiguous
   answer to "was this measured under the webfont or a fallback?" */
async function platformFonts(p, selector, limit) {
  try {
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
    const doc = await cdp.send('DOM.getDocument', { depth: 1 });
    const q = await cdp.send('DOM.querySelectorAll', { nodeId: doc.root.nodeId, selector });
    const rows = [];
    for (const nodeId of (q.nodeIds || []).slice(0, limit || 6)) {
      try {
        const pf = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
        rows.push({ nodeId, fonts: (pf.fonts || []).map(f => ({ familyName: f.familyName, glyphCount: f.glyphCount, isCustomFont: f.isCustomFont })) });
      } catch (e) { rows.push({ nodeId, err: String(e.message || e).slice(0, 90) }); }
    }
    await cdp.detach().catch(() => {});
    return { selector, matched: (q.nodeIds || []).length, rows };
  } catch (e) { return { selector, err: String(e.message || e).slice(0, 140) }; }
}

/* ------------------------------------------------- one full sweep per origin */
async function sweep(label, url, requireFonts, blockFontCdn) {
  const res = { label, url, fontsRequired: requireFonts, fontCdnBlocked: !!blockFontCdn,
    perWidth: {}, fontState: null, load: null, requestNotes: {}, platformFonts: {} };
  for (const w of WIDTHS) {
    const p = await newPage(w, 'advanced', blockFontCdn);
    let ld;
    try { ld = await loadAndSettleFonts(p, url, requireFonts); }
    catch (e) { out.errors.push(label + ' @' + w + ' load failed: ' + e.message); await p.close(); continue; }
    const fstate = await p.evaluate(() => window.__F.fontState());
    if (w === WIDTHS[0]) { res.load = ld; res.fontState = fstate; }
    res.perWidth['w' + w] = { load: ld, docFontsSize: fstate.docFontsSize, familyChecks: fstate.familyChecks, rooms: {} };
    for (const room of ROOMS) {
      try {
        await gotoRoom(p, room);
        const m = await p.evaluate(() => ({
          clipped: window.__F.clippedText(40), page: window.__F.pageOverflow(),
          att: window.__F.attstatusCensus(),
          cards: document.querySelectorAll('.uw[data-uid]').length,
          activePane: document.querySelector('.u11-pane:not(.pm-hidden)').getAttribute('data-pane')
        }));
        res.perWidth['w' + w].rooms[room] = {
          activePaneConfirmed: m.activePane, cards: m.cards,
          clippedTextTotal: m.clipped.total, truncatedNoEllipsis: m.clipped.truncatedNoEllipsis,
          spillsOutsideBox: m.clipped.spillsOutsideBox, collapsedToZeroWidth: m.clipped.collapsedToZeroWidth,
          leavesChecked: m.clipped.checkedLeaves, pageOverflow: m.page.over,
          attstatus: { visible: m.att.visibleInActiveRoom, overflowing: m.att.overflowing,
            widths: m.att.widths.slice(0, 6) },
          sample: m.clipped.sample.slice(0, 10),
          collapsedSample: m.clipped.collapsedSample.slice(0, 4)
        };
        if (room === 'ledger' && w === 360) {
          const full = await p.evaluate(() => ({ clipped: window.__F.clippedText(120), att: window.__F.attstatusCensus() }));
          res.ledger360 = {
            clippedTextTotal: full.clipped.total, truncatedNoEllipsis: full.clipped.truncatedNoEllipsis,
            spillsOutsideBox: full.clipped.spillsOutsideBox, collapsedToZeroWidth: full.clipped.collapsedToZeroWidth,
            leavesChecked: full.clipped.checkedLeaves,
            attstatus: full.att,
            allSpillSamples: full.clipped.sample.filter(s => s.kind === 'spills-outside-box').slice(0, 40),
            allCollapsedSamples: full.clipped.collapsedSample.slice(0, 12),
            spillClassHistogram: full.clipped.sample.reduce((a, s) => (a[s.cls || '(none)'] = (a[s.cls || '(none)'] || 0) + 1, a), {})
          };
          res.platformFonts.ledger360_attstatus = await platformFonts(p, '.u11w-attstatus', 6);
          res.platformFonts.ledger360_atttok = await platformFonts(p, '.u11w-atttok', 4);
          res.platformFonts.ledger360_kicker = await platformFonts(p, '.u11-kt', 2);
          const tag = res.fontCdnBlocked ? 'fontsblocked' : (url.startsWith('file:') ? 'fileorigin' : 'fontsloaded');
          try { await p.screenshot({ path: path.join(SHOTS, 'gap2-ledger-360-' + tag + '.png'), fullPage: false }); } catch (e) {}
        }
      } catch (e) { out.errors.push(label + ' ' + room + '@' + w + ': ' + e.message); }
    }
    res.requestNotes['w' + w] = {
      fontResponses: p._rec.fontReq.slice(0, 8), fontResponseCount: p._rec.fontReq.length,
      requestFailed: p._rec.requestFailed.slice(0, 8), requestFailedCount: p._rec.requestFailed.length,
      consoleErrors: p._rec.consoleErrors.slice(0, 5), consoleErrorCount: p._rec.consoleErrors.length,
      pageErrors: p._rec.pageErrors.slice(0, 5), non2xx: p._rec.non2xx.slice(0, 5)
    };
    await p.close();
  }
  return res;
}

/* three arms:
   A fontsLoaded  — http loopback origin, font CDN reachable  (the condition GAP 2 asks for)
   B fontsBlocked — http loopback origin, font CDN aborted     (a GENUINE fallback control)
   C fileOrigin   — file://, font CDN reachable                (reproduces the audit's own runs) */
const armA = await sweep('A fonts-loaded (http loopback 127.0.0.1:8097, CDN reachable)', HTTP_URL, true, false);
out.sweep.fontsLoaded = armA;
out.ledger360.fontsLoaded = armA.ledger360 || null;
out.fontState.fontsLoaded = armA.fontState;

const armB = await sweep('B fonts-BLOCKED control (http loopback, fonts.googleapis/gstatic aborted)', HTTP_URL, false, true);
out.sweep.fontsBlocked = armB;
out.ledger360.fontsBlocked = armB.ledger360 || null;
out.fontState.fontsBlocked = armB.fontState;

const armC = await sweep('C file:// origin as the audit ran it (CDN reachable)', FILE_URL, false, false);
out.sweep.fileOrigin = armC;
out.ledger360.fileOrigin = armC.ledger360 || null;
out.fontState.fileOrigin = armC.fontState;

/* --------------------------------------------------------- comparison table */
function cell(arm, w, room) {
  const a = (((out.sweep[arm] || {}).perWidth || {})['w' + w] || {}).rooms || {};
  const r = a[room] || {};
  return { total: r.clippedTextTotal, spills: r.spillsOutsideBox, truncated: r.truncatedNoEllipsis,
    zeroW: r.collapsedToZeroWidth, leaves: r.leavesChecked, attOver: r.attstatus && r.attstatus.overflowing };
}
const table = {};
for (const room of ROOMS) {
  table[room] = {};
  for (const w of WIDTHS) {
    const A = cell('fontsLoaded', w, room), B = cell('fontsBlocked', w, room), C = cell('fileOrigin', w, room);
    const d = (A.total == null || B.total == null) ? null : A.total - B.total;
    table[room]['w' + w] = {
      A_fontsLoaded: A, B_fontsBlocked: B, C_fileOrigin: C,
      deltaLoadedMinusBlocked: d,
      fileOriginMatchesFontsLoaded: A.total === C.total,
      verdict: (A.total == null || B.total == null) ? 'incomplete'
        : (A.total === 0 && B.total === 0) ? 'clean under every font condition'
        : (A.total === 0 && B.total > 0) ? 'FALLBACK-ONLY ARTIFACT (present only when the webfonts are unavailable)'
        : (A.total > 0 && B.total === 0) ? 'REAL ONLY WITH THE WEBFONTS LOADED'
        : (A.total === B.total) ? 'REAL and font-independent'
        : 'REAL under both, magnitude font-dependent'
    };
  }
}
out.comparison = {
  note: 'per room per width: A = webfonts loaded over the loopback http origin; B = same origin with the font CDN aborted (genuine fallback metrics); C = file:// exactly as the audit ran it',
  table,
  fontDependentCells: Object.entries(table).flatMap(([room, ws]) =>
    Object.entries(ws).filter(([, v]) => v.deltaLoadedMinusBlocked !== null && v.deltaLoadedMinusBlocked !== 0)
      .map(([w, v]) => ({ room, width: w, blocked: v.B_fontsBlocked.total, loaded: v.A_fontsLoaded.total, verdict: v.verdict }))),
  cellsClipped_A_fontsLoaded: Object.entries(table).flatMap(([room, ws]) => Object.entries(ws).filter(([, v]) => v.A_fontsLoaded.total > 0).map(([w, v]) => ({ room, width: w, total: v.A_fontsLoaded.total, spills: v.A_fontsLoaded.spills, zeroW: v.A_fontsLoaded.zeroW }))),
  cellsClipped_B_fontsBlocked: Object.entries(table).flatMap(([room, ws]) => Object.entries(ws).filter(([, v]) => v.B_fontsBlocked.total > 0).map(([w, v]) => ({ room, width: w, total: v.B_fontsBlocked.total }))),
  cellsClipped_C_fileOrigin: Object.entries(table).flatMap(([room, ws]) => Object.entries(ws).filter(([, v]) => v.C_fileOrigin.total > 0).map(([w, v]) => ({ room, width: w, total: v.C_fileOrigin.total }))),
  fileOriginReproducesFontsLoaded: Object.values(table).every(ws => Object.values(ws).every(v => v.fileOriginMatchesFontsLoaded)),
  themeFontStackUnderTest: {
    theme: 'friendly-dark',
    note: 'friendly-* themes reference only Cal Sans / Nunito / Quicksand / JetBrains Mono. Inter, Outfit, Rajdhani and Sora are referenced by the basic-*, glass-* and retro-* themes only, so under friendly-dark the browser is CORRECT not to download them and document.fonts.check() on those four returns false without any font being "missing".',
    attstatusFontVar: '--mono-font  =>  JetBrains Mono (u11-widgets.css:259)'
  }
};
out.requests.servedPathsSample = served.slice(0, 12);
out.requests.servedCount = served.length;
out.requests.served404 = served.filter(s => s.status === 404);

await ctx.close();
server.close();
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));

/* --------------------------------------------------------------- stdout */
const A = out.fontState.fontsLoaded || {}, B = out.fontState.fontsBlocked || {}, C = out.fontState.fileOrigin || {};
console.log('=== GAP2 ===');
for (const [n, s] of [['A http+fonts', A], ['B http+BLOCKED', B], ['C file://', C]]) {
  console.log(n.padEnd(16) + ' fonts.size=' + String(s.docFontsSize).padEnd(5) + ' status=' + String(s.docFontsStatus).padEnd(8) +
    ' checks=' + JSON.stringify(s.familyChecks));
  console.log(''.padEnd(16) + ' probe .u11w-attstatus computed=' + JSON.stringify(s.probeElement) + ' advance=' + JSON.stringify(s.advances));
}
console.log('');
console.log('room'.padEnd(11) + WIDTHS.map(w => ('@' + w + ' A/B/C').padEnd(18)).join(''));
for (const room of ROOMS) {
  let line = room.padEnd(11);
  for (const w of WIDTHS) {
    const c = table[room]['w' + w];
    line += ((c.A_fontsLoaded.total + '/' + c.B_fontsBlocked.total + '/' + c.C_fileOrigin.total)).padEnd(18);
  }
  console.log(line);
}
console.log('');
for (const k of ['fontsLoaded', 'fontsBlocked', 'fileOrigin']) {
  const l = out.ledger360[k] || {};
  console.log('ledger@360 ' + k.padEnd(13) + ': ' + JSON.stringify({ total: l.clippedTextTotal, spills: l.spillsOutsideBox,
    truncated: l.truncatedNoEllipsis, zeroW: l.collapsedToZeroWidth, leaves: l.leavesChecked,
    attVisible: (l.attstatus || {}).visibleInActiveRoom, attOver: (l.attstatus || {}).overflowing }));
}
console.log('platform fonts (actual rasteriser font) for .u11w-attstatus:');
for (const k of ['fontsLoaded', 'fontsBlocked', 'fileOrigin']) {
  const pf = ((out.sweep[k] || {}).platformFonts || {}).ledger360_attstatus;
  console.log('  ' + k.padEnd(13) + ' ' + JSON.stringify(pf && pf.rows ? pf.rows.slice(0, 2) : pf));
}
console.log('font-dependent cells: ' + JSON.stringify(out.comparison.fontDependentCells));
console.log('file:// reproduces fonts-loaded everywhere: ' + out.comparison.fileOriginReproducesFontsLoaded);
console.log('errors: ' + JSON.stringify(out.errors));
console.log('WROTE ' + OUT);
process.exit(0);
