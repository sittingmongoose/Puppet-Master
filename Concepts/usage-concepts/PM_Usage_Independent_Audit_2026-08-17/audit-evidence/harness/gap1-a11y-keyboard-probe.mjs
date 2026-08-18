/* =====================================================================
   GAP 1 — KEYBOARD / ASSISTIVE-TECHNOLOGY PASS  (u11-prism)
   Independent audit 2026-08-17. READ-ONLY on the concept.
   Writes only:  <audit>/audit-evidence/probes/a11y-keyboard-probe.json
   Drives file:// (per task), isolated temp profile, bounded timeouts.

   Evidence rules obeyed here:
   - focus is moved by REAL Tab / Arrow / Enter / Escape key events;
   - computed style is captured while the element actually holds keyboard
     focus, AFTER the CSS opacity transition has settled;
   - roles and accessible names come from the Chrome DevTools Protocol
     accessibility tree (Accessibility.getPartialAXTree by objectId),
     not from a hand-rolled name algorithm;
   - "reached by Tab" is decided by ELEMENT IDENTITY (a marker property
     stamped on the node), never by a CSS-path string, so two identical
     "Duplicate" buttons in different widgets are never confused.
   ===================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const CONCEPT = '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept';
const AUDIT = '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/audit-evidence';
const SCRATCH = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad';
const PROFILE = path.join(SCRATCH, 'gap1-profile');
const OUT = path.join(AUDIT, 'probes', 'a11y-keyboard-probe.json');
const CHROME = '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const PAGE_URL = 'file://' + CONCEPT + '/u11-prism.html';
const NAV_TIMEOUT = 30000;
const ACT_TIMEOUT = 12000;
const MAX_TABS = 400;
const SETTLE = 240;   /* > --motion-fast, so opacity transitions have landed */

fs.mkdirSync(PROFILE, { recursive: true });
const req = createRequire(path.join(CONCEPT, '.verify', 'node_modules', '__probe.js'));
const { chromium } = req('playwright-core');

const out = {
  meta: {
    probe: 'gap1-a11y-keyboard', generated: new Date().toISOString(), url: PAGE_URL,
    method: 'real Tab/Arrow/Enter/Escape key events; computed style read while the node held keyboard focus and after a ' + SETTLE + 'ms transition settle; roles/names from CDP Accessibility.getPartialAXTree(objectId); Tab reachability decided by element identity marker'
  },
  a_tab_order: null, b_focus_visibility: null, b2_outside_us_page: null,
  c_rail_tab_semantics: null, d_disclosure_semantics: null,
  e_opensettings_buttons: null, f_scope_popover: null, g_aria_census: null
};

/* --------------------------------------------------------------- in-page */
const LIB = `
window.__G1 = (function () {
  var seq = [];
  function dataAttrs(el) { var o = {}; for (var i = 0; i < el.attributes.length; i++) { var a = el.attributes[i]; if (a.name.indexOf('data-') === 0) o[a.name] = a.value; } return o; }
  function ariaAttrs(el) { var o = {}; for (var i = 0; i < el.attributes.length; i++) { var a = el.attributes[i]; if (a.name.indexOf('aria-') === 0 || a.name === 'role') o[a.name] = a.value; } return o; }
  function accName(el) {
    if (!el || el.nodeType !== 1) return '';
    var lb = el.getAttribute && el.getAttribute('aria-labelledby');
    if (lb) { var t = lb.split(/\\s+/).map(function (id) { var n = document.getElementById(id); return n ? n.textContent.trim() : ''; }).join(' ').trim(); if (t) return t; }
    var al = el.getAttribute && el.getAttribute('aria-label');
    if (al && al.trim()) return al.trim();
    var txt = (el.innerText || el.textContent || '').replace(/\\s+/g, ' ').trim();
    if (txt) return txt.slice(0, 120);
    var ti = el.getAttribute && el.getAttribute('title');
    if (ti && ti.trim()) return ti.trim();
    return '';
  }
  function styleSnap(el) {
    var s = getComputedStyle(el);
    return { outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth, outlineColor: s.outlineColor,
      outlineOffset: s.outlineOffset, boxShadow: s.boxShadow, borderColor: s.borderTopColor,
      borderWidth: s.borderTopWidth, backgroundColor: s.backgroundColor, color: s.color,
      opacity: s.opacity, filter: s.filter, visibility: s.visibility };
  }
  function opacityChain(el) {
    var n = el, worst = 1, who = null;
    while (n && n !== document.documentElement) {
      var o = parseFloat(getComputedStyle(n).opacity || '1');
      if (o < worst) { worst = o; who = shortSel(n); }
      n = n.parentElement;
    }
    return { minOpacity: worst, at: who };
  }
  function shortSel(el) {
    if (!el || el.nodeType !== 1) return '';
    var s = el.tagName.toLowerCase();
    if (el.id) return s + '#' + el.id;
    var cls = (el.getAttribute('class') || '').trim().split(/\\s+/).filter(Boolean).slice(0, 3);
    if (cls.length) s += '.' + cls.join('.');
    return s;
  }
  /* a path that identifies WHICH widget instance a control belongs to */
  function pathOf(el) {
    var parts = [], n = el, up = 0;
    while (n && n.nodeType === 1 && up < 10) {
      var seg = shortSel(n);
      if (n.classList && n.classList.contains('uw') && n.getAttribute('data-w')) seg += '[data-w="' + n.getAttribute('data-w') + '"]';
      if (n.hasAttribute && n.hasAttribute('data-pane')) { parts.unshift('section[data-pane="' + n.getAttribute('data-pane') + '"]'); break; }
      parts.unshift(seg);
      if (n.id) break;
      n = n.parentElement; up++;
    }
    return parts.join('>');
  }
  function widgetOf(el) {
    var uw = el.closest ? el.closest('.uw') : null;
    if (!uw) return null;
    var t = uw.querySelector('.uw-title, .uw-t, h3, h4');
    return { dataW: uw.getAttribute('data-w'), dataUid: uw.getAttribute('data-uid'),
      title: t ? (t.textContent || '').trim().slice(0, 60) : null };
  }
  function record(settled) {
    var el = document.activeElement;
    if (!el || el === document.body || el === document.documentElement) return { atDocument: true, tag: el ? el.tagName.toLowerCase() : 'null' };
    var alreadySeen = seq.indexOf(el);
    if (alreadySeen === -1) { seq.push(el); el.__g1seen = true; }
    var r = el.getBoundingClientRect();
    var pane = el.closest ? el.closest('[data-pane]') : null;
    return {
      idx: alreadySeen === -1 ? seq.length - 1 : alreadySeen,
      repeatOfIdx: alreadySeen === -1 ? null : alreadySeen,
      tag: el.tagName.toLowerCase(), sel: pathOf(el), id: el.id || null,
      cls: (el.getAttribute('class') || '').trim() || null,
      accName: accName(el), role: el.getAttribute('role') || null,
      tabindex: el.getAttribute('tabindex'), type: el.getAttribute('type') || null,
      disabled: !!el.disabled, aria: ariaAttrs(el), data: dataAttrs(el),
      widget: widgetOf(el),
      pane: pane ? pane.getAttribute('data-pane') : null,
      insideUsPage: !!(el.closest && el.closest('.us-page')),
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      inViewport: r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth,
      hasSize: r.width > 0 && r.height > 0,
      focusVisibleMatches: (function () { try { return el.matches(':focus-visible'); } catch (e) { return null; } })(),
      focusedStyle: styleSnap(el), ancestorOpacity: opacityChain(el), settled: !!settled
    };
  }
  function unfocusedFor(i) {
    var el = seq[i]; if (!el) return null;
    return { idx: i, unfocusedStyle: styleSnap(el), stillInDom: document.contains(el), ancestorOpacity: opacityChain(el) };
  }
  function blurAll() { try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) {} }
  function reset() { seq.forEach(function (e) { try { delete e.__g1seen; } catch (x) {} }); seq = []; }
  function seqLen() { return seq.length; }
  function contains(el) { return seq.indexOf(el) !== -1; }
  return { record: record, unfocusedFor: unfocusedFor, blurAll: blurAll, reset: reset, seqLen: seqLen,
    accName: accName, pathOf: pathOf, shortSel: shortSel, styleSnap: styleSnap,
    ariaAttrs: ariaAttrs, dataAttrs: dataAttrs, opacityChain: opacityChain, widgetOf: widgetOf, contains: contains };
})();
`;

function colorAlpha(c) {
  if (!c) return 0;
  const m = /rgba?\(([^)]+)\)/.exec(c);
  if (!m) return 1;
  const p = m[1].split(',').map(s => parseFloat(s.trim()));
  return p.length >= 4 ? p[3] : 1;
}
const px = v => parseFloat(String(v || '0')) || 0;

function classifyIndicator(rec, un) {
  const f = rec.focusedStyle, u = (un && un.unfocusedStyle) || {};
  const outlineOn = f.outlineStyle !== 'none' && px(f.outlineWidth) > 0 && colorAlpha(f.outlineColor) > 0.05;
  const shadowChanged = f.boxShadow !== u.boxShadow && f.boxShadow !== 'none';
  const borderChanged = f.borderColor !== u.borderColor;
  const bgChanged = f.backgroundColor !== u.backgroundColor;
  const selfOrAncestorInvisible = rec.ancestorOpacity && rec.ancestorOpacity.minOpacity < 0.08;
  const styleExists = outlineOn || shadowChanged || borderChanged || bgChanged;
  const reasons = [];
  if (outlineOn) reasons.push('outline ' + f.outlineWidth + ' ' + f.outlineStyle + ' ' + f.outlineColor + ' offset ' + f.outlineOffset);
  if (shadowChanged) reasons.push('box-shadow changes on focus');
  if (borderChanged) reasons.push('border-color changes on focus');
  if (bgChanged) reasons.push('background changes on focus');
  if (!styleExists) reasons.push('NO computed difference between focused and unfocused: outline ' + f.outlineStyle + '/' + f.outlineWidth + ', shadow unchanged, border unchanged, background unchanged');
  if (selfOrAncestorInvisible) reasons.push('element or ancestor still at opacity ' + rec.ancestorOpacity.minOpacity + ' (' + rec.ancestorOpacity.at + ') AFTER transition settle');
  return {
    focusStyleRuleFires: styleExists,
    paintsWhereUserCanSeeIt: styleExists && !selfOrAncestorInvisible,
    hasVisibleIndicator: styleExists && !selfOrAncestorInvisible,
    outlineOn, shadowChanged, borderChanged, bgChanged,
    invisibleAtFocusTime: selfOrAncestorInvisible,
    invisibleAt: selfOrAncestorInvisible ? rec.ancestorOpacity.at : null,
    minOpacityAtFocusTime: rec.ancestorOpacity ? rec.ancestorOpacity.minOpacity : null,
    reasons
  };
}

/* -------------------------------------------------------------------- run */
const ctx = await chromium.launchPersistentContext(PROFILE, {
  headless: true, executablePath: CHROME, viewport: { width: 1700, height: 1000 },
  args: ['--headless', '--disable-gpu', '--no-sandbox', '--no-first-run',
    '--no-default-browser-check', '--remote-debugging-port=9481', '--font-render-hinting=none']
});
const page = await ctx.newPage();
page.setDefaultTimeout(ACT_TIMEOUT);
await page.addInitScript((kv) => { try { Object.keys(kv).forEach(k => localStorage.setItem(k, kv[k])); } catch {} },
  { 'pm.theme': 'friendly-dark', 'u11:disclosure': '"essentials"', 'u11:scope': '"scope:all"' });
await page.addInitScript(LIB);
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(String(e).slice(0, 300)));

await page.goto(PAGE_URL, { waitUntil: 'load', timeout: NAV_TIMEOUT });
await page.waitForSelector('.us-page.u11', { timeout: 15000 });
await page.waitForTimeout(2200);

const cdp = await ctx.newCDPSession(page);
await cdp.send('DOM.enable');
await cdp.send('Accessibility.enable');

/* AX by objectId — no nodeId round trip, so it survives DOM churn */
async function axOfActive() {
  try {
    const ev = await cdp.send('Runtime.evaluate', { expression: 'document.activeElement', returnByValue: false });
    if (!ev.result || !ev.result.objectId) return { axError: 'no objectId' };
    const tree = await cdp.send('Accessibility.getPartialAXTree', { objectId: ev.result.objectId, fetchRelatives: false });
    await cdp.send('Runtime.releaseObject', { objectId: ev.result.objectId }).catch(() => {});
    const nodes = (tree && tree.nodes) || [];
    const self = nodes[nodes.length - 1] || nodes[0];
    if (!self) return { axError: 'empty tree' };
    return {
      axRole: self.role ? self.role.value : null,
      axName: self.name ? String(self.name.value == null ? '' : self.name.value) : null,
      axNameFrom: self.name && self.name.sources ? (self.name.sources.find(s => s.value) || {}).type || null : null,
      axIgnored: !!self.ignored,
      axIgnoredReasons: (self.ignoredReasons || []).map(r => r.name),
      axProps: (self.properties || []).reduce((a, p) => (a[p.name] = p.value && p.value.value, a), {})
    };
  } catch (e) { return { axError: String(e.message || e).slice(0, 160) }; }
}
async function axOf(selector) {
  try {
    const ev = await cdp.send('Runtime.evaluate', { expression: 'document.querySelector(' + JSON.stringify(selector) + ')', returnByValue: false });
    if (!ev.result || !ev.result.objectId) return { axError: 'not found' };
    const tree = await cdp.send('Accessibility.getPartialAXTree', { objectId: ev.result.objectId, fetchRelatives: false });
    await cdp.send('Runtime.releaseObject', { objectId: ev.result.objectId }).catch(() => {});
    const nodes = (tree && tree.nodes) || [];
    const self = nodes[nodes.length - 1] || nodes[0];
    if (!self) return { axError: 'empty' };
    return { axRole: self.role ? self.role.value : null, axName: self.name ? String(self.name.value == null ? '' : self.name.value) : null,
      axIgnored: !!self.ignored, axProps: (self.properties || []).reduce((a, p) => (a[p.name] = p.value && p.value.value, a), {}) };
  } catch (e) { return { axError: String(e.message || e).slice(0, 160) }; }
}

/* ==================================================== (a) FULL TAB ORDER */
await page.evaluate(() => { window.__G1.reset(); window.__G1.blurAll(); });
const startActive = await page.evaluate(() => (document.activeElement || {}).tagName || null);

const steps = [];
let wrapped = false, wrapAfter = null, trapAt = null, cycleAt = null, stallCount = 0, lastIdx = -2;

for (let i = 0; i < MAX_TABS; i++) {
  await page.keyboard.press('Tab');
  await page.waitForTimeout(SETTLE);                 /* let opacity transitions land */
  const rec = await page.evaluate(() => window.__G1.record(true));
  if (rec.atDocument) { wrapped = true; wrapAfter = steps.length - 1; break; }
  Object.assign(rec, await axOfActive());
  if (rec.repeatOfIdx !== null) {
    if (rec.repeatOfIdx === lastIdx) { stallCount++; } else { stallCount = 0; }
    if (cycleAt === null) cycleAt = { pressNumber: i + 1, revisitedIdx: rec.repeatOfIdx, sel: rec.sel, accName: rec.accName };
    if (stallCount >= 2) { trapAt = { pressNumber: i + 1, idx: rec.repeatOfIdx, sel: rec.sel, accName: rec.accName, note: 'Tab did not move focus for 3 consecutive presses' }; steps.push(rec); break; }
    steps.push(rec);
    if (rec.repeatOfIdx === 0) break;                /* true wrap back to first stop */
    lastIdx = rec.repeatOfIdx;
    continue;
  }
  lastIdx = rec.idx;
  steps.push(rec);
}

const uniqueStops = [];
const seenIdx = new Set();
for (const s of steps) { if (!seenIdx.has(s.idx)) { seenIdx.add(s.idx); uniqueStops.push(s); } }

await page.evaluate(() => window.__G1.blurAll());
await page.waitForTimeout(SETTLE + 120);
const seqLen = await page.evaluate(() => window.__G1.seqLen());
const unfocused = await page.evaluate((n) => { const o = []; for (let i = 0; i < n; i++) o.push(window.__G1.unfocusedFor(i)); return o; }, seqLen);

out.a_tab_order = {
  activeElementAtStart: startActive,
  tabPressCount: steps.length + (wrapped ? 1 : 0),
  uniqueFocusStops: uniqueStops.length,
  wrappedToDocumentBody: wrapped, wrappedAfterStopIdx: wrapAfter,
  cycleDetected: cycleAt, focusTrapDetected: trapAt,
  order: uniqueStops.map(s => ({
    idx: s.idx, tag: s.tag, sel: s.sel, id: s.id, accName: s.accName,
    axRole: s.axRole || null, axName: s.axName || null, axIgnored: s.axIgnored || false,
    axIgnoredReasons: s.axIgnoredReasons || [], role: s.role, tabindex: s.tabindex,
    pane: s.pane, insideUsPage: s.insideUsPage, widget: s.widget, aria: s.aria, data: s.data,
    rect: s.rect, inViewport: s.inViewport
  }))
};

/* --------- interactive census + unreachable set, decided by identity */
out.a_tab_order.interactive_census = await page.evaluate(() => {
  const SEL = 'button, a[href], input, select, textarea, [tabindex], [role="button"], [role="option"], [role="tab"], [role="menuitem"], [contenteditable="true"]';
  const all = Array.from(document.querySelectorAll(SEL));
  function vis(el) {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    if (el.checkVisibility && !el.checkVisibility({ checkOpacity: false, checkVisibilityCSS: true })) return false;
    return true;
  }
  const rows = all.map(el => ({
    sel: window.__G1.pathOf(el), tag: el.tagName.toLowerCase(),
    accName: window.__G1.accName(el).slice(0, 80), data: window.__G1.dataAttrs(el),
    tabindex: el.getAttribute('tabindex'), disabled: !!el.disabled, visible: vis(el),
    opacityChain: window.__G1.opacityChain(el),
    inHiddenPane: !!(el.closest('.pm-hidden') || el.closest('[hidden]')),
    insideClosedPopover: !!(el.closest('#u11Pop') && !document.getElementById('u11Pop').classList.contains('on')),
    reachedByTab: !!el.__g1seen,
    widget: window.__G1.widgetOf(el)
  }));
  const candidate = rows.filter(r => r.visible && !r.inHiddenPane && !r.insideClosedPopover && r.tabindex !== '-1' && !r.disabled);
  return {
    totalMatches: all.length, visibleMatches: rows.filter(r => r.visible).length,
    tabbableCandidates: candidate.length,
    reachedByTab: candidate.filter(r => r.reachedByTab).length,
    notReachedByTab: candidate.filter(r => !r.reachedByTab).length,
    notReached: candidate.filter(r => !r.reachedByTab),
    negativeTabindexVisible: rows.filter(r => r.visible && r.tabindex === '-1').length,
    negativeTabindexVisibleSample: rows.filter(r => r.visible && r.tabindex === '-1').slice(0, 8)
  };
});

/* ============================================ (b) FOCUS VISIBILITY TABLE */
const fv = uniqueStops.map(s => {
  const un = unfocused[s.idx] || null;
  const cls = classifyIndicator(s, un);
  return {
    idx: s.idx, sel: s.sel, accName: s.accName, axRole: s.axRole || null,
    insideUsPage: s.insideUsPage, widget: s.widget,
    focusVisibleMatches: s.focusVisibleMatches,
    focusedOutline: s.focusedStyle.outlineWidth + ' ' + s.focusedStyle.outlineStyle + ' ' + s.focusedStyle.outlineColor + ' / offset ' + s.focusedStyle.outlineOffset,
    unfocusedOutline: un ? (un.unfocusedStyle.outlineWidth + ' ' + un.unfocusedStyle.outlineStyle) : null,
    focusedBoxShadow: s.focusedStyle.boxShadow, unfocusedBoxShadow: un ? un.unfocusedStyle.boxShadow : null,
    selfOpacityWhileFocused: s.focusedStyle.opacity,
    minAncestorOpacityWhileFocused: s.ancestorOpacity ? s.ancestorOpacity.minOpacity : null,
    minAncestorOpacityUnfocused: un && un.ancestorOpacity ? un.ancestorOpacity.minOpacity : null,
    verdict: cls
  };
});
out.b_focus_visibility = {
  measured: fv.length,
  withVisibleIndicator: fv.filter(r => r.verdict.hasVisibleIndicator).length,
  withoutVisibleIndicator: fv.filter(r => !r.verdict.hasVisibleIndicator).length,
  focusStyleRuleNeverFires: fv.filter(r => !r.verdict.focusStyleRuleFires).length,
  styleFiresButInvisible: fv.filter(r => r.verdict.focusStyleRuleFires && r.verdict.invisibleAtFocusTime).length,
  offenders: fv.filter(r => !r.verdict.hasVisibleIndicator),
  all: fv
};

/* ================================= (c) 13-ROOM RAIL — TABLIST SEMANTICS */
async function railSnapshot() {
  return page.evaluate(() => {
    const nav = document.querySelector('nav.u11-rail');
    const items = Array.from(document.querySelectorAll('.u11-rail .u11-item'));
    const tabItems = items.filter(b => b.hasAttribute('data-tab'));
    const panes = Array.from(document.querySelectorAll('.u11-pane'));
    return {
      nav: nav ? { tag: nav.tagName.toLowerCase(), role: nav.getAttribute('role'), ariaLabel: nav.getAttribute('aria-label'),
        aria: window.__G1.ariaAttrs(nav), childButtonCount: nav.querySelectorAll('button').length } : null,
      railItemCount: items.length, roomButtonCount: tabItems.length,
      items: tabItems.map(b => ({ tab: b.getAttribute('data-tab'), active: b.classList.contains('active'),
        tag: b.tagName.toLowerCase(), role: b.getAttribute('role'), ariaSelected: b.getAttribute('aria-selected'),
        ariaCurrent: b.getAttribute('aria-current'), ariaControls: b.getAttribute('aria-controls'),
        ariaExpanded: b.getAttribute('aria-expanded'), allAria: window.__G1.ariaAttrs(b), id: b.id || null,
        tabindex: b.getAttribute('tabindex') })),
      counts: {
        withRoleTab: tabItems.filter(b => b.getAttribute('role') === 'tab').length,
        withAriaSelected: tabItems.filter(b => b.hasAttribute('aria-selected')).length,
        withAriaCurrent: tabItems.filter(b => b.hasAttribute('aria-current')).length,
        withAriaControls: tabItems.filter(b => b.hasAttribute('aria-controls')).length,
        withAnyAria: tabItems.filter(b => Array.from(b.attributes).some(a => a.name.indexOf('aria-') === 0)).length,
        withRovingTabindex: tabItems.filter(b => b.hasAttribute('tabindex')).length
      },
      roleTablistAnywhere: document.querySelectorAll('[role="tablist"]').length,
      roleTabAnywhere: document.querySelectorAll('[role="tab"]').length,
      roleTabpanelAnywhere: document.querySelectorAll('[role="tabpanel"]').length,
      panes: panes.map(p => ({ pane: p.getAttribute('data-pane'), tag: p.tagName.toLowerCase(), role: p.getAttribute('role'),
        ariaLabel: p.getAttribute('aria-label'), ariaLabelledby: p.getAttribute('aria-labelledby'),
        ariaHidden: p.getAttribute('aria-hidden'), hiddenAttr: p.hasAttribute('hidden'),
        pmHidden: p.classList.contains('pm-hidden'), computedDisplay: getComputedStyle(p).display,
        id: p.id || null, tabindex: p.getAttribute('tabindex'), allAria: window.__G1.ariaAttrs(p) })),
      paneCounts: {
        total: panes.length,
        withRoleTabpanel: panes.filter(p => p.getAttribute('role') === 'tabpanel').length,
        withAriaLabel: panes.filter(p => p.hasAttribute('aria-label')).length,
        withAriaLabelledby: panes.filter(p => p.hasAttribute('aria-labelledby')).length,
        withAriaHidden: panes.filter(p => p.hasAttribute('aria-hidden')).length,
        withHiddenAttr: panes.filter(p => p.hasAttribute('hidden')).length,
        withId: panes.filter(p => p.id).length
      },
      activePane: document.querySelector('.u11-pane:not(.pm-hidden)') ? document.querySelector('.u11-pane:not(.pm-hidden)').getAttribute('data-pane') : null,
      liveRegions: document.querySelectorAll('[aria-live]').length,
      liveRegionDetail: Array.from(document.querySelectorAll('[aria-live]')).map(n => ({ sel: window.__G1.shortSel(n), live: n.getAttribute('aria-live'), text: (n.textContent || '').trim().slice(0, 60) }))
    };
  });
}
const railBefore = await railSnapshot();
const axRailNav = await axOf('nav.u11-rail');
const axRailItem = await axOf('.u11-rail .u11-item[data-tab="overview"]');
const axPaneOverview = await axOf('.u11-pane[data-pane="overview"]');

await page.click('.u11-rail .u11-item[data-tab="costs"]', { timeout: ACT_TIMEOUT });
await page.waitForTimeout(1200);
const railAfterClick = await railSnapshot();
const axRailItemAfter = await axOf('.u11-rail .u11-item[data-tab="costs"]');

const kbSwitch = await page.evaluate(() => {
  const b = document.querySelector('.u11-rail .u11-item[data-tab="ledger"]');
  if (!b) return { ok: false };
  b.focus(); return { ok: document.activeElement === b, sel: window.__G1.pathOf(b) };
});
await page.keyboard.press('Enter');
await page.waitForTimeout(1200);
const railAfterKeyboard = await railSnapshot();
/* arrow keys on the rail: does the rail behave like a tablist at all? */
await page.evaluate(() => document.querySelector('.u11-rail .u11-item[data-tab="ledger"]').focus());
await page.keyboard.press('ArrowDown');
await page.waitForTimeout(500);
const railArrow = await page.evaluate(() => ({
  activeElement: window.__G1.pathOf(document.activeElement),
  activeTab: document.activeElement.getAttribute ? document.activeElement.getAttribute('data-tab') : null,
  activePane: document.querySelector('.u11-pane:not(.pm-hidden)') ? document.querySelector('.u11-pane:not(.pm-hidden)').getAttribute('data-pane') : null
}));

function diffAria(a, b) {
  const d = [];
  a.items.forEach((it, i) => {
    const jt = b.items[i]; if (!jt) return;
    if (JSON.stringify(it.allAria) !== JSON.stringify(jt.allAria)) d.push({ tab: it.tab, before: it.allAria, after: jt.allAria });
  });
  return {
    itemAriaChanges: d,
    paneAriaChanged: JSON.stringify(a.panes.map(p => p.allAria)) !== JSON.stringify(b.panes.map(p => p.allAria)),
    navAriaChanged: JSON.stringify(a.nav && a.nav.aria) !== JSON.stringify(b.nav && b.nav.aria),
    activeClassMovedFrom: a.items.filter(i => i.active).map(i => i.tab),
    activeClassMovedTo: b.items.filter(i => i.active).map(i => i.tab)
  };
}
out.c_rail_tab_semantics = {
  before: railBefore, ax: { nav: axRailNav, roomButton_overview: axRailItem, pane_overview: axPaneOverview, roomButton_costs_afterSwitch: axRailItemAfter },
  afterPointerRoomSwitch_costs: railAfterClick,
  keyboardSwitchSetup: kbSwitch, afterKeyboardRoomSwitch_ledger: railAfterKeyboard,
  arrowDownOnRail: railArrow,
  ariaDiff_pointerSwitch: diffAria(railBefore, railAfterClick),
  ariaDiff_keyboardSwitch: diffAria(railAfterClick, railAfterKeyboard),
  claims: {
    'nav[aria-label] holding plain buttons': !!(railBefore.nav && railBefore.nav.tag === 'nav' && railBefore.nav.ariaLabel && railBefore.nav.childButtonCount > 0),
    'NO role=tablist': railBefore.roleTablistAnywhere === 0 && !(railBefore.nav && railBefore.nav.role === 'tablist'),
    'NO role=tab': railBefore.counts.withRoleTab === 0 && railBefore.roleTabAnywhere === 0,
    'NO aria-selected on room buttons': railBefore.counts.withAriaSelected === 0,
    'NO aria-current on room buttons': railBefore.counts.withAriaCurrent === 0,
    'goTo() writes no aria at all': (() => { const d1 = diffAria(railBefore, railAfterClick), d2 = diffAria(railAfterClick, railAfterKeyboard);
      return d1.itemAriaChanges.length === 0 && !d1.paneAriaChanged && d2.itemAriaChanges.length === 0 && !d2.paneAriaChanged; })(),
    'panes have aria-label but no role=tabpanel / aria-labelledby':
      railBefore.paneCounts.withAriaLabel === railBefore.paneCounts.total &&
      railBefore.paneCounts.withRoleTabpanel === 0 && railBefore.paneCounts.withAriaLabelledby === 0
  }
};
await page.click('.u11-rail .u11-item[data-tab="overview"]', { timeout: ACT_TIMEOUT }).catch(() => {});
await page.waitForTimeout(1000);

/* ============================== (d) DISCLOSURE CONTROL #u11Disc SEMANTICS */
async function discSnapshot() {
  return page.evaluate(() => {
    const host = document.getElementById('u11Disc');
    const bs = host ? Array.from(host.querySelectorAll('button')) : [];
    return {
      host: host ? { role: host.getAttribute('role'), aria: window.__G1.ariaAttrs(host) } : null,
      buttons: bs.map(b => ({ level: b.getAttribute('data-disc'), text: (b.textContent || '').trim(),
        classes: b.getAttribute('class'), hasOnClass: b.classList.contains('on'),
        ariaPressed: b.getAttribute('aria-pressed'), ariaChecked: b.getAttribute('aria-checked'),
        ariaCurrent: b.getAttribute('aria-current'), ariaSelected: b.getAttribute('aria-selected'),
        ariaDescribedby: b.getAttribute('aria-describedby'), title: b.getAttribute('title'),
        allAria: window.__G1.ariaAttrs(b), computedBg: getComputedStyle(b).backgroundColor,
        computedColor: getComputedStyle(b).color, computedBorderColor: getComputedStyle(b).borderTopColor })),
      captionText: (document.getElementById('u11DiscCap') || {}).textContent || null,
      captionAria: (function () { const c = document.getElementById('u11DiscCap'); return c ? window.__G1.ariaAttrs(c) : null; })(),
      advOnlyVisible: Array.from(document.querySelectorAll('.u11-advonly')).filter(e => e.offsetWidth || e.offsetHeight).length,
      advOnlyTotal: document.querySelectorAll('.u11-advonly').length
    };
  });
}
const discEssentials = await discSnapshot();
const axDiscEssentialsBtn = await axOf('#u11Disc button[data-disc="essentials"]');
await page.click('#u11Disc button[data-disc="advanced"]', { timeout: ACT_TIMEOUT });
await page.waitForTimeout(1000);
const discAdvanced = await discSnapshot();
const axDiscAdvancedBtn = await axOf('#u11Disc button[data-disc="advanced"]');
const axDiscHost = await axOf('#u11Disc');
out.d_disclosure_semantics = {
  essentials: discEssentials, advanced_after_click: discAdvanced,
  ax: { host: axDiscHost, essentialsButton_whileEssentialsActive: axDiscEssentialsBtn, advancedButton_whileAdvancedActive: axDiscAdvancedBtn },
  claims: {
    'active level carries only class="on"': discAdvanced.buttons.every(b => b.ariaPressed === null && b.ariaChecked === null && b.ariaCurrent === null && b.ariaSelected === null) && discAdvanced.buttons.some(b => b.hasOnClass),
    'no aria-pressed in the group': discAdvanced.buttons.every(b => b.ariaPressed === null),
    'no aria-checked in the group': discAdvanced.buttons.every(b => b.ariaChecked === null),
    'no aria-current in the group': discAdvanced.buttons.every(b => b.ariaCurrent === null),
    'no aria-selected in the group': discAdvanced.buttons.every(b => b.ariaSelected === null),
    'host role is group (not radiogroup/tablist)': !!(discAdvanced.host && discAdvanced.host.role === 'group'),
    'selection state conveyed only visually': discAdvanced.buttons.filter(b => b.hasOnClass).length === 1 && discAdvanced.buttons.every(b => Object.keys(b.allAria).filter(k => k !== 'role').length === 0),
    'class="on" moved on click (so state DID change)': discEssentials.buttons.filter(b => b.hasOnClass).map(b => b.level).join() !== discAdvanced.buttons.filter(b => b.hasOnClass).map(b => b.level).join()
  }
};
await page.click('#u11Disc button[data-disc="essentials"]', { timeout: ACT_TIMEOUT }).catch(() => {});
await page.waitForTimeout(900);

/* ===================== (e) "Open Usage settings" FOOTER BUTTONS */
const OPEN_SEL = '[data-u11-act="opensettings"]';
const roomList = ['overview', 'plans', 'costs', 'accounts', 'free', 'context', 'analytics',
  'ledger', 'attention', 'cache', 'tools', 'signals', 'authority'];
const perRoom = {};
let totalActive = 0;
for (const room of roomList) {
  await page.evaluate((r) => { const b = document.querySelector('.u11-rail .u11-item[data-tab="' + r + '"]'); if (b) b.click(); }, room);
  await page.waitForTimeout(900);
  const info = await page.evaluate((sel) => {
    const btns = Array.from(document.querySelectorAll(sel));
    const active = btns.filter(b => { const p = b.closest('[data-pane]'); return p && !p.classList.contains('pm-hidden'); });
    return {
      count: btns.length, inActivePane: active.length,
      rows: active.map(b => {
        const r = b.getBoundingClientRect();
        const foot = b.closest('.u11w-foot');
        const prev = document.activeElement;
        let focusable = false;
        try { b.focus(); focusable = document.activeElement === b; } catch (e) {}
        const focusVisible = (() => { try { return b.matches(':focus-visible'); } catch (e) { return null; } })();
        const cs = getComputedStyle(b);
        const footOpacityFocused = foot ? getComputedStyle(foot).opacity : null;
        try { if (prev && prev.focus) prev.focus(); } catch (e) {}
        return { tag: b.tagName.toLowerCase(), type: b.getAttribute('type'), text: (b.textContent || '').trim(),
          disabled: !!b.disabled, tabindex: b.getAttribute('tabindex'), ariaHidden: b.getAttribute('aria-hidden'),
          ariaDisabled: b.getAttribute('aria-disabled'), role: b.getAttribute('role'), title: b.getAttribute('title'),
          rect: { w: Math.round(r.width), h: Math.round(r.height) },
          widget: window.__G1.widgetOf(b), pane: b.closest('[data-pane]').getAttribute('data-pane'),
          footerOpacityAtRestThenFocused: footOpacityFocused,
          programmaticallyFocusable: focusable, focusVisibleWhileFocused: focusVisible,
          focusedOutline: cs.outlineWidth + ' ' + cs.outlineStyle };
      })
    };
  }, OPEN_SEL);
  perRoom[room] = { totalInDom: info.count, inActivePane: info.inActivePane, rows: info.rows };
  totalActive += info.inActivePane;
}
await page.evaluate(() => { const b = document.querySelector('.u11-rail .u11-item[data-tab="overview"]'); if (b) b.click(); });
await page.waitForTimeout(1000);

const openSettingsInTabOrder = uniqueStops.filter(s => s.data && s.data['data-u11-act'] === 'opensettings');
const axOpenSettings = await axOf('[data-u11-act="opensettings"]');

/* is there ANY listener for the CustomEvent this button dispatches? */
const listenerProbe = await page.evaluate(() => {
  let sawOwn = false;
  const h = () => { sawOwn = true; };
  document.addEventListener('u11:opensettings', h, { once: true });
  document.dispatchEvent(new CustomEvent('u11:opensettings'));
  document.removeEventListener('u11:opensettings', h);
  /* dispatching the event should, if a handler existed, mutate the settings sprout */
  return { ownListenerFired: sawOwn,
    sproutHiddenAfterBareDispatch: document.getElementById('u11SheetSprout').hidden,
    sproutHTMLLenAfterBareDispatch: document.getElementById('u11SheetSprout').innerHTML.length,
    openDialogsAfterBareDispatch: document.querySelectorAll('[role="dialog"]:not([hidden])').length };
});

function snapState() {
  return page.evaluate(() => ({
    bodyHTMLLen: document.body.innerHTML.length,
    sproutHidden: document.getElementById('u11SheetSprout').hidden,
    sproutHTMLLen: document.getElementById('u11SheetSprout').innerHTML.length,
    exportSproutHidden: document.getElementById('u11ExportSprout').hidden,
    openDialogs: document.querySelectorAll('[role="dialog"]:not([hidden])').length,
    visibleDialogs: Array.from(document.querySelectorAll('[role="dialog"]')).filter(d => d.offsetWidth || d.offsetHeight).length,
    toasts: document.querySelectorAll('.rail-toast, .pm-toast, .us-toast, .uw-toast').length,
    activePane: document.querySelector('.u11-pane:not(.pm-hidden)') ? document.querySelector('.u11-pane:not(.pm-hidden)').getAttribute('data-pane') : null,
    scrollY: window.scrollY,
    activeElement: window.__G1.pathOf(document.activeElement)
  }));
}
/* reach the button by REAL Tab presses so :focus-visible is authentic */
const reachByTab = await (async () => {
  await page.evaluate(() => window.__G1.blurAll());
  for (let i = 0; i < 120; i++) {
    await page.keyboard.press('Tab');
    const hit = await page.evaluate(() => {
      const ae = document.activeElement;
      return ae && ae.getAttribute && ae.getAttribute('data-u11-act') === 'opensettings'
        ? { tabPresses: 0, sel: window.__G1.pathOf(ae), accName: window.__G1.accName(ae),
            focusVisible: (() => { try { return ae.matches(':focus-visible'); } catch (e) { return null; } })() }
        : null;
    });
    if (hit) { hit.tabPresses = i + 1; return hit; }
  }
  return null;
})();
await page.waitForTimeout(SETTLE);
const beforeEnter = await snapState();
const axAtRealFocus = await axOfActive();
await page.keyboard.press('Enter');
await page.waitForTimeout(800);
const afterEnter = await snapState();
await page.keyboard.press('Space');
await page.waitForTimeout(800);
const afterSpace = await snapState();

/* control case: the header settings button, which is wired */
await page.evaluate(() => document.getElementById('u11Settings').focus());
const beforeHeaderEnter = await snapState();
await page.keyboard.press('Enter');
await page.waitForTimeout(1000);
const afterHeaderEnter = await snapState();
await page.keyboard.press('Escape');
await page.waitForTimeout(600);

out.e_opensettings_buttons = {
  selector: OPEN_SEL,
  perRoom_counts: Object.fromEntries(Object.entries(perRoom).map(([k, v]) => [k, { totalInDom: v.totalInDom, inActivePane: v.inActivePane }])),
  totalMountedInActivePanesAcrossAll13Rooms: totalActive,
  allRowsOverview: perRoom.overview.rows,
  everyRowIsRealButtonType: Object.values(perRoom).every(v => v.rows.every(r => r.tag === 'button' && r.type === 'button')),
  everyRowFocusable: Object.values(perRoom).every(v => v.rows.every(r => r.programmaticallyFocusable)),
  anyRowDisabledOrAriaHidden: Object.values(perRoom).some(v => v.rows.some(r => r.disabled || r.ariaHidden || r.ariaDisabled)),
  countInTabOrderOfOverviewRoom: openSettingsInTabOrder.length,
  tabOrderEntries: openSettingsInTabOrder.map(s => ({ idx: s.idx, sel: s.sel, accName: s.accName, axRole: s.axRole, axName: s.axName, widget: s.widget })),
  axNode: axOpenSettings,
  reachedByRealTabPresses: reachByTab,
  axAtRealKeyboardFocus: axAtRealFocus,
  listenerProbe,
  stateBeforeEnter: beforeEnter, stateAfterEnter: afterEnter, stateAfterSpace: afterSpace,
  enterChangedNothing: JSON.stringify({ ...beforeEnter, activeElement: 0 }) === JSON.stringify({ ...afterEnter, activeElement: 0 }),
  controlCase_headerSettingsButton: { before: beforeHeaderEnter, afterEnter: afterHeaderEnter,
    wired: beforeHeaderEnter.sproutHidden !== afterHeaderEnter.sproutHidden || beforeHeaderEnter.sproutHTMLLen !== afterHeaderEnter.sproutHTMLLen }
};

/* ===================================== (f) SCOPE POPOVER (#u11Pop) a11y */
await page.evaluate(() => { const b = document.querySelector('.u11-rail .u11-item[data-tab="overview"]'); if (b) b.click(); });
await page.waitForTimeout(800);
const popTrigger = await page.evaluate(() => {
  const t = document.querySelector('[data-scope-open]');
  if (!t) return null;
  t.focus();
  return { focusable: document.activeElement === t, sel: window.__G1.pathOf(t), aria: window.__G1.ariaAttrs(t),
    accName: window.__G1.accName(t).slice(0, 120), ariaExpanded: t.getAttribute('aria-expanded'),
    ariaControls: t.getAttribute('aria-controls') };
});
const axTrigger = await axOf('[data-scope-open]');
await page.keyboard.press('Enter');
await page.waitForTimeout(900);
const popOpenState = await page.evaluate(() => {
  const pop = document.getElementById('u11Pop'), list = document.getElementById('u11PopList'), ae = document.activeElement;
  const rows = Array.from(list ? list.querySelectorAll('.u11-pop-row') : []);
  const trig = document.querySelector('[data-scope-open]');
  return {
    popHasOnClass: pop.classList.contains('on'), popAria: window.__G1.ariaAttrs(pop),
    popHiddenAttr: pop.hasAttribute('hidden'), popAriaModal: pop.getAttribute('aria-modal'),
    popComputedDisplay: getComputedStyle(pop).display, popTabindex: pop.getAttribute('tabindex'),
    triggerAriaExpandedWhileOpen: trig ? trig.getAttribute('aria-expanded') : null,
    listAria: window.__G1.ariaAttrs(list), listAriaActivedescendant: list.getAttribute('aria-activedescendant'),
    listTabindex: list.getAttribute('tabindex'), rowCount: rows.length,
    rowsWithId: rows.filter(r => r.id).length, rowsWithRoleOption: rows.filter(r => r.getAttribute('role') === 'option').length,
    rowsWithAriaSelectedTrue: rows.filter(r => r.getAttribute('aria-selected') === 'true').length,
    rowsTabindexMinus1: rows.filter(r => r.getAttribute('tabindex') === '-1').length,
    activeElement: ae ? { sel: window.__G1.pathOf(ae), role: ae.getAttribute('role'),
      ariaSelected: ae.getAttribute('aria-selected'), scopeid: ae.getAttribute('data-scopeid'),
      insidePop: pop.contains(ae) } : null,
    scrimAria: window.__G1.ariaAttrs(document.getElementById('u11PopScrim')),
    scrimPointerEvents: getComputedStyle(document.getElementById('u11PopScrim')).pointerEvents,
    focusMovedIntoPop: pop.contains(document.activeElement),
    bodyAriaHidden: document.body.getAttribute('aria-hidden'),
    usPageAriaHiddenWhileModalOpen: (document.querySelector('.us-page') || {}).getAttribute
      ? document.querySelector('.us-page').getAttribute('aria-hidden') : null,
    usPageInertWhileModalOpen: (document.querySelector('.us-page') || {}).hasAttribute
      ? document.querySelector('.us-page').hasAttribute('inert') : null
  };
});
const axPopRow = await axOf('#u11PopList .u11-pop-row.on');
const axPopList = await axOf('#u11PopList');
const axPopX = await axOf('#u11PopX');

/* Tab walk out of the open popover, and keep walking to show where it lands */
const trapWalk = [];
for (let i = 0; i < 8; i++) {
  await page.keyboard.press('Tab');
  await page.waitForTimeout(180);
  const st = await page.evaluate(() => {
    const pop = document.getElementById('u11Pop'), ae = document.activeElement;
    const atBody = ae === document.body || ae === document.documentElement;
    const scrim = document.getElementById('u11PopScrim');
    const sr = scrim ? scrim.getBoundingClientRect() : null;
    const ar = ae && ae.getBoundingClientRect ? ae.getBoundingClientRect() : null;
    return {
      insidePop: !atBody && pop.contains(ae), atDocumentBody: atBody,
      sel: atBody ? '(document body — focus left the document tabbing order)' : window.__G1.pathOf(ae),
      accName: atBody ? '' : window.__G1.accName(ae).slice(0, 70),
      popStillOn: pop.classList.contains('on'),
      focusedElementIsBehindScrim: !atBody && !pop.contains(ae) && !!(sr && ar && ar.width > 0),
      scrimOpacity: scrim ? getComputedStyle(scrim).opacity : null,
      focusVisible: atBody ? null : (() => { try { return ae.matches(':focus-visible'); } catch (e) { return null; } })(),
      focusedOutline: atBody ? null : (getComputedStyle(ae).outlineWidth + ' ' + getComputedStyle(ae).outlineStyle),
      minAncestorOpacity: atBody ? null : window.__G1.opacityChain(ae).minOpacity
    };
  });
  trapWalk.push(st);
}
/* arrow-key model */
await page.evaluate(() => {
  const list = document.getElementById('u11PopList');
  const on = list.querySelector('.u11-pop-row.on') || list.querySelector('.u11-pop-row');
  if (on) on.focus();
});
const beforeArrow = await page.evaluate(() => ({
  ae: window.__G1.pathOf(document.activeElement),
  scopeid: document.activeElement.getAttribute ? document.activeElement.getAttribute('data-scopeid') : null,
  activedescendant: document.getElementById('u11PopList').getAttribute('aria-activedescendant'),
  ariaSelectedTrueCount: document.getElementById('u11PopList').querySelectorAll('[aria-selected="true"]').length
}));
await page.keyboard.press('ArrowDown'); await page.waitForTimeout(220);
await page.keyboard.press('ArrowDown'); await page.waitForTimeout(220);
const afterArrow = await page.evaluate(() => {
  const list = document.getElementById('u11PopList'), ae = document.activeElement;
  const lr = list.getBoundingClientRect(), ar = ae.getBoundingClientRect();
  return { ae: window.__G1.pathOf(ae), scopeid: ae.getAttribute ? ae.getAttribute('data-scopeid') : null,
    ariaSelected: ae.getAttribute ? ae.getAttribute('aria-selected') : null,
    activedescendant: list.getAttribute('aria-activedescendant'),
    focusedRowInsideListViewport: ar.top >= lr.top - 1 && ar.bottom <= lr.bottom + 1,
    focusVisible: (() => { try { return ae.matches(':focus-visible'); } catch (e) { return null; } })(),
    focusedOutline: getComputedStyle(ae).outlineWidth + ' ' + getComputedStyle(ae).outlineStyle + ' ' + getComputedStyle(ae).outlineColor,
    ariaSelectedTrueCount: list.querySelectorAll('[aria-selected="true"]').length };
});
/* Home/End and Tab-into-list behaviour */
await page.keyboard.press('End'); await page.waitForTimeout(250);
const afterEnd = await page.evaluate(() => ({ scopeid: document.activeElement.getAttribute ? document.activeElement.getAttribute('data-scopeid') : null,
  isLastRow: document.activeElement === document.getElementById('u11PopList').querySelector('.u11-pop-row:last-of-type') }));
/* Esc → focus return (keyboard-opened) */
await page.keyboard.press('Escape');
await page.waitForTimeout(800);
const afterEsc = await page.evaluate(() => {
  const pop = document.getElementById('u11Pop'), ae = document.activeElement, trig = document.querySelector('[data-scope-open]');
  return { popStillOn: pop.classList.contains('on'), activeElement: window.__G1.pathOf(ae),
    activeIsTrigger: ae === trig, activeIsBody: ae === document.body, triggerExists: !!trig,
    triggerAriaExpandedAfterClose: trig ? trig.getAttribute('aria-expanded') : null };
});
/* second cycle: pointer-open then Esc */
await page.click('[data-scope-open]', { timeout: ACT_TIMEOUT });
await page.waitForTimeout(800);
const popOpen2 = await page.evaluate(() => ({ on: document.getElementById('u11Pop').classList.contains('on'), ae: window.__G1.pathOf(document.activeElement) }));
await page.keyboard.press('Escape');
await page.waitForTimeout(700);
const afterEsc2 = await page.evaluate(() => {
  const trig = document.querySelector('[data-scope-open]');
  return { popStillOn: document.getElementById('u11Pop').classList.contains('on'),
    activeElement: window.__G1.pathOf(document.activeElement), activeIsTrigger: document.activeElement === trig };
});
/* third: does selecting a row by keyboard Enter work and return focus? */
await page.click('[data-scope-open]', { timeout: ACT_TIMEOUT });
await page.waitForTimeout(800);
await page.keyboard.press('ArrowDown'); await page.waitForTimeout(200);
await page.keyboard.press('Enter');
await page.waitForTimeout(1200);
const afterSelect = await page.evaluate(() => {
  const trig = document.querySelector('[data-scope-open]');
  return { popStillOn: document.getElementById('u11Pop').classList.contains('on'),
    activeElement: window.__G1.pathOf(document.activeElement), activeIsTrigger: document.activeElement === trig,
    activeIsBody: document.activeElement === document.body,
    scopeChip: (document.getElementById('u11ScopeChip') || {}).textContent || null,
    liveRegionText: Array.from(document.querySelectorAll('[aria-live]')).map(n => (n.textContent || '').trim().slice(0, 80)) };
});

out.f_scope_popover = {
  trigger: popTrigger, axTrigger,
  openedByKeyboardEnter: popOpenState,
  ax: { row: axPopRow, list: axPopList, closeButton: axPopX },
  tabWalkFromInsidePopover: trapWalk,
  focusTrapPresent: trapWalk.length > 0 && trapWalk.every(s => s.insidePop),
  firstTabLeftThePopover: trapWalk.length > 0 && !trapWalk[0].insidePop,
  popStayedOpenWhileFocusOutside: trapWalk.some(s => !s.insidePop && s.popStillOn),
  arrowKeys: { before: beforeArrow, after: afterArrow, afterEnd },
  usesAriaActivedescendant: afterArrow.activedescendant != null,
  movesRealFocus: afterArrow.ae !== beforeArrow.ae,
  escFromKeyboardOpen: afterEsc, secondCycle_pointerOpen: popOpen2, escFromPointerOpen: afterEsc2,
  keyboardSelectRow: afterSelect
};

/* ------------------ (b2) controls that live OUTSIDE .us-page ------------ */
out.b2_outside_us_page = await page.evaluate(() => {
  /* the generic focus ring is scoped ".us-page :is(button,[tabindex],input,select,a):focus-visible".
     anything mounted outside .us-page can only get a ring from its own rule. */
  const hosts = ['#u11Pop', '#u11PopScrim', '.u11rd', '#u11SheetSprout', '#u11ExportSprout', '.u11ctx-det'];
  const rows = [];
  hosts.forEach(h => {
    const host = document.querySelector(h);
    if (!host) { rows.push({ host: h, present: false }); return; }
    const insideUsPage = !!host.closest('.us-page');
    const ctrls = Array.from(host.querySelectorAll('button, a[href], input, select, [tabindex]'));
    rows.push({ host: h, present: true, insideUsPage, controlCount: ctrls.length,
      controls: ctrls.slice(0, 12).map(c => {
        const sel = window.__G1.shortSel(c);
        /* does ANY stylesheet rule give this element a focus-visible outline? */
        let matched = [];
        for (const sheet of Array.from(document.styleSheets)) {
          let rules; try { rules = sheet.cssRules; } catch (e) { continue; }
          if (!rules) continue;
          for (const r of Array.from(rules)) {
            if (!r.selectorText || r.selectorText.indexOf('focus') === -1) continue;
            const parts = r.selectorText.split(',').map(s => s.trim());
            for (const p of parts) {
              const base = p.replace(/:focus-visible|:focus-within|:focus/g, '');
              try { if (base && c.matches(base)) { matched.push(p + ' { ' + (r.style.outline || r.style.outlineWidth || r.style.boxShadow || r.style.opacity || '') + ' }'); break; } } catch (e) {}
            }
          }
        }
        return { sel, tag: c.tagName.toLowerCase(), accName: window.__G1.accName(c).slice(0, 60),
          tabindex: c.getAttribute('tabindex'), matchingFocusRules: Array.from(new Set(matched)).slice(0, 6) };
      }) });
  });
  return { note: 'the shared focus ring rule is .us-page :is(button,[tabindex],input,select,a):focus-visible in _shared/usage-shared.css:218', hosts: rows };
});

/* ================================================== (g) STATIC ARIA CENSUS */
async function census(label) {
  const c = await page.evaluate(() => {
    const all = document.querySelectorAll('*');
    const byAttr = {}, byRole = {}, ariaOwners = {};
    let withAny = 0;
    all.forEach(el => {
      let any = false;
      for (let i = 0; i < el.attributes.length; i++) {
        const n = el.attributes[i].name;
        if (n.indexOf('aria-') === 0) {
          byAttr[n] = (byAttr[n] || 0) + 1; any = true;
          const owner = el.closest('#u11Pop') ? '#u11Pop' : el.closest('.u11-rail') ? '.u11-rail'
            : el.closest('.u11-pane') ? '.u11-pane' : el.closest('.us-head, header') ? 'page header'
            : el.closest('.pm6-sidebar, .pm6-tb, nav') ? 'app shell' : 'other';
          ariaOwners[n] = ariaOwners[n] || {};
          ariaOwners[n][owner] = (ariaOwners[n][owner] || 0) + 1;
        }
        if (n === 'role') { byRole[el.attributes[i].value] = (byRole[el.attributes[i].value] || 0) + 1; any = true; }
      }
      if (any) withAny++;
    });
    const ah = Array.from(document.querySelectorAll('[aria-hidden]'));
    return {
      totalElements: all.length, elementsWithAnyAriaOrRole: withAny,
      ariaAttributeCounts: byAttr, ariaAttributeOwners: ariaOwners, roleValueCounts: byRole,
      totalAriaAttributeInstances: Object.values(byAttr).reduce((a, b) => a + b, 0),
      totalRoleInstances: Object.values(byRole).reduce((a, b) => a + b, 0),
      ariaHiddenByTag: ah.reduce((a, e) => (a[e.tagName.toLowerCase()] = (a[e.tagName.toLowerCase()] || 0) + 1, a), {}),
      ariaCurrentWhere: Array.from(document.querySelectorAll('[aria-current]')).map(e => window.__G1.pathOf(e)),
      ariaPressedWhere: Array.from(document.querySelectorAll('[aria-pressed]')).map(e => window.__G1.pathOf(e)),
      ariaLiveWhere: Array.from(document.querySelectorAll('[aria-live]')).map(e => ({ sel: window.__G1.pathOf(e), live: e.getAttribute('aria-live') })),
      landmarks: { nav: document.querySelectorAll('nav').length, main: document.querySelectorAll('main, [role="main"]').length,
        header: document.querySelectorAll('header').length, h1: document.querySelectorAll('h1').length,
        h2: document.querySelectorAll('h2').length,
        skipLinks: Array.from(document.querySelectorAll('a[href^="#"]')).filter(a => /skip/i.test(a.textContent || '')).length },
      tabbedSurfaceRequirement: {
        rooms: 13,
        needed: { 'role=tablist': 1, 'role=tab': 13, 'aria-selected on tabs': 13, 'aria-controls on tabs': 13,
          'role=tabpanel': 13, 'aria-labelledby on panels': 13, 'roving tabindex on tabs': 13, 'aria-live room announcement': 1 },
        presentInsideRailAndPanes: {
          'role=tablist': document.querySelectorAll('.u11-rail [role="tablist"], nav.u11-rail[role="tablist"]').length,
          'role=tab': document.querySelectorAll('.u11-rail [role="tab"]').length,
          'aria-selected on room buttons': document.querySelectorAll('.u11-rail .u11-item[data-tab][aria-selected]').length,
          'aria-controls on room buttons': document.querySelectorAll('.u11-rail .u11-item[data-tab][aria-controls]').length,
          'role=tabpanel': document.querySelectorAll('.u11-pane[role="tabpanel"]').length,
          'aria-labelledby on panes': document.querySelectorAll('.u11-pane[aria-labelledby]').length,
          'tabindex on room buttons': document.querySelectorAll('.u11-rail .u11-item[data-tab][tabindex]').length,
          'aria-live inside rail or panes': document.querySelectorAll('.u11-rail [aria-live], .u11-panes [aria-live]').length
        }
      }
    };
  });
  c._label = label;
  return c;
}
/* popover closed (steady state) */
await page.keyboard.press('Escape').catch(() => {});
await page.waitForTimeout(700);
const censusClosed = await census('scope popover CLOSED (steady state)');
await page.click('[data-scope-open]', { timeout: ACT_TIMEOUT }).catch(() => {});
await page.waitForTimeout(800);
const censusOpen = await census('scope popover OPEN (100 listbox rows mounted)');
await page.keyboard.press('Escape').catch(() => {});
await page.waitForTimeout(500);
out.g_aria_census = { steadyState: censusClosed, withScopePopoverOpen: censusOpen };

out.meta.pageErrors = pageErrors;

await page.close();
await ctx.close();
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));

/* -------------------------------------------------------------- stdout */
const A = out.a_tab_order, B = out.b_focus_visibility, E = out.e_opensettings_buttons, F = out.f_scope_popover;
console.log('=== GAP1 ===');
console.log('unique tab stops: ' + A.uniqueFocusStops + '  wrappedToBody=' + A.wrappedToDocumentBody +
  '  cycle=' + JSON.stringify(A.cycleDetected) + '  trap=' + JSON.stringify(A.focusTrapDetected));
console.log('tabbable candidates=' + A.interactive_census.tabbableCandidates + ' reached=' + A.interactive_census.reachedByTab +
  ' NOT reached=' + A.interactive_census.notReachedByTab + '  negative-tabindex visible=' + A.interactive_census.negativeTabindexVisible);
console.log('focus indicator: ok=' + B.withVisibleIndicator + ' missing=' + B.withoutVisibleIndicator +
  ' (ruleNeverFires=' + B.focusStyleRuleNeverFires + ', firesButInvisible=' + B.styleFiresButInvisible + ')');
console.log('AX sample: ' + JSON.stringify(A.order.slice(0, 3).map(o => [o.axRole, o.axName])));
console.log('rail claims: ' + JSON.stringify(out.c_rail_tab_semantics.claims));
console.log('rail ax nav/item/pane: ' + JSON.stringify([out.c_rail_tab_semantics.ax.nav, out.c_rail_tab_semantics.ax.roomButton_overview, out.c_rail_tab_semantics.ax.pane_overview]));
console.log('disc claims: ' + JSON.stringify(out.d_disclosure_semantics.claims));
console.log('opensettings: activeTotal=' + E.totalMountedInActivePanesAcrossAll13Rooms + ' perRoom=' + JSON.stringify(E.perRoom_counts));
console.log('opensettings tab-reach=' + JSON.stringify(E.reachedByRealTabPresses) + ' ax=' + JSON.stringify(E.axNode) +
  ' enterChangedNothing=' + E.enterChangedNothing + ' headerControlWired=' + E.controlCase_headerSettingsButton.wired);
console.log('popover: trap=' + F.focusTrapPresent + ' firstTabLeft=' + F.firstTabLeftThePopover +
  ' stayedOpenWithFocusOutside=' + F.popStayedOpenWhileFocusOutside +
  ' activedescendant=' + F.usesAriaActivedescendant + ' ariaModal=' + F.openedByKeyboardEnter.popAriaModal +
  ' escReturn=' + F.escFromKeyboardOpen.activeIsTrigger + '/' + F.escFromPointerOpen.activeIsTrigger +
  ' selectReturn=' + JSON.stringify(F.keyboardSelectRow));
console.log('census(closed): ' + JSON.stringify(out.g_aria_census.steadyState.ariaAttributeCounts) +
  ' roles ' + JSON.stringify(out.g_aria_census.steadyState.roleValueCounts));
console.log('tabbed-surface present: ' + JSON.stringify(out.g_aria_census.steadyState.tabbedSurfaceRequirement.presentInsideRailAndPanes));
console.log('pageErrors: ' + pageErrors.length);
console.log('WROTE ' + OUT);
process.exit(0);
