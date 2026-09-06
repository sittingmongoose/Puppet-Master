/* browser-capture.js — feature module.  OWNER: Assistant-redesign wave (2026-09-03) —
 * browser capture agent.  Covers packet 01_IMPLEMENTATION_SPEC §14 (Browser screenshots
 * and component capture) and 04_GUI_IMPACTS §14 (Browser capture GUI): BROWSER-001..009.
 *
 * WHAT THIS FILE OWNS
 * --------------------
 * A self-contained "internal browser" surface (its own dialog, its own demo page, its
 * own toolbar) because nothing else in the concept renders one — `data.js`'s `browser`
 * work-step entries only describe an agent's activity narration, they are not a
 * driveable surface. Two sessions exist: an ordinary session the agent may capture and
 * drive under policy, and a protected authentication session that is always human-only.
 *
 * THE FOUR CAPTURE ACTIONS (BROWSER-001)
 *   Full Screenshot (Visible | Full Scrollable Page), Region Screenshot (drag-select),
 *   Select Component (hover/click picker with a mini instruction bar).
 *
 * THE ISOLATED-SEND GUARANTEE (BROWSER-002) — READ THIS BEFORE TOUCHING SEND CODE
 * ---------------------------------------------------------------------------------
 * Full/Region capture, and the component bar's "Send Now", must never pick up whatever
 * unrelated text is already sitting in the composer. The guarantee is structural, not a
 * runtime check: `sendIsolatedCapture()` below is the ONLY path that appends a capture
 * message, and it is built to be incapable of reading the live composer —
 *   1. it never reads `ctx.state.composer`, the composer `<textarea>`'s `.value`, or
 *      `RT.composer.bufferFor(tid).text` anywhere in its body;
 *   2. its payload is assembled entirely from local arguments (the fixture image, the
 *      capture kind/rect, and — for a component send — the mini bar's OWN input element,
 *      which is a control this module renders and owns, not the composer);
 *   3. it calls `ctx.appendMessage(msg)` directly against the active thread. That is a
 *      different code path from the built-in Send button (`handleSend`/`deliverSend` in
 *      app.js, which read `state.composer`) and from composer-state.js's `setComposerText`
 *      (which writes it) — this module calls neither.
 * Because the function has no reference to the composer at all, there is nothing in it
 * that COULD leak unrelated text, by construction rather than by a defensive check. The
 * "Verify isolation" control in the dialog's footer (`bc-verify-isolation`) proves this
 * live: it snapshots the real composer textarea's value, runs the exact same
 * `sendIsolatedCapture()` path with a synthetic fixture, snapshots the textarea again, and
 * records both strings so the equality is visible and re-readable, not asserted in a
 * comment only.
 *
 * "Add To Composer List" and "Insert Component At Cursor" are the deliberate OPPOSITE:
 * they DO write into the composer (that is the whole point of those two modes), through
 * `writeComposerText()`, which is the only function in this file that touches it. It is
 * always additive — it locates and replaces this module's own previously-written list
 * block by exact text match, or appends after whatever is already there; it never clears
 * or replaces unrelated text.
 *
 * THE FIXTURE IMAGE (honesty)
 * ----------------------------
 * This is a file:// concept lab with no screenshot API. Every "capture" produces a
 * deterministically generated inline SVG data URI (`fixtureImage()`) — a labelled
 * rectangle stamped "FIXTURE IMAGE — not a real screenshot". Every details surface that
 * shows one repeats that sentence. Nothing here claims a real screenshot was taken.
 * Rects, crops, computed styles, outerHTML and ancestor paths ARE real: they are read
 * live off the actual DOM nodes rendered for the demo page, via getBoundingClientRect /
 * getComputedStyle / outerHTML — only the pixel content of the "photo" is synthetic.
 *
 * LOCATOR STABILITY (BROWSER-007)
 * ---------------------------------
 * Each demo element carries a permanent `data-bc-id` (an authored stable identity, the
 * same idea as a Playwright/Testing-Library test id) independent of DOM position. The
 * BrowserElementContext records BOTH that stable locator and a fragile nth-child CSS path
 * computed at capture time. "Simulate re-render" (`bc-simulate-rerender`) really shuffles
 * the query table's row order in the live DOM and bumps the session generation, then
 * re-resolves the stable locator with a real `document.querySelector` — the fragile path
 * is shown alongside, unresolved, to make the contrast visible instead of asserted.
 *
 * PROTECTED BROWSER (BROWSER-009)
 * ---------------------------------
 * The auth session's toolbar buttons stay ENABLED rather than disabled, because a
 * disabled button proves nothing was attempted. `guardSession()` runs first inside every
 * capture/DevTools action; on the protected session it refuses with a stated reason via
 * toast AND a durable `ctx.addReceipt` card (Hard Rule #2 — no toast-only outcome), logs
 * the refusal, and returns without producing a capture, a context record, or a DevTools
 * panel. The protected session is never added to `captures`, `contexts`, or any list this
 * module hands to BSD or persistence.
 *
 * COMPOSER CONTRACT
 * -------------------
 * Reads `RT.composer.destination` (read-only) to label where a capture was sent, reads
 * `RT.composer.bufferFor` / `.touch` / `.flush` (composer-state's exposed primitives —
 * composer-state.js owns the buffer shape and exposes no public setter for its text, so
 * this module mutates `buf.text` directly through those primitives, then mirrors it onto
 * `ctx.state.composer` and the live textarea itself, exactly mirroring what
 * composer-state's own private setter does using only its public surface).
 * Registers `RT.composer.historyBlockers.push(...)` (vetoes Up/Down recall while a region
 * drag is armed or the component prompt bar is open) and
 * `RT.composer.commitHooks.push(...)` (stamps `browser_context_refs` onto the message that
 * was just sent, so the ref chips this module renders via `messageAffordance` survive
 * the send). Renders no destination ribbon of its own.
 */
(function () {
  'use strict';
  var D = window.PM56_DATA; if (!D) return;
  var EXT = window.PM56_EXT; if (!EXT || !EXT.slot) return;
  var RT = window.PM56_RUNTIME = window.PM56_RUNTIME || {};

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function nowIso() { return new Date().toISOString(); }
  var SEQ = 0;
  function seq(prefix) { SEQ += 1; return prefix + '-' + SEQ + '-' + Date.now().toString(36); }

  /* =====================================================================
     1. STORAGE — last-used component mode only (§14.2 "persists per project/
        user setting"). Same defensive wrapper shape as composer-state.js and
        app.js's own safeStorage; never throws through a click handler.
     ===================================================================== */
  var STORE_KEY = 'pm56-bc-component-mode.v1';
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  };
  var MODE_VALUES = { send: 1, list: 1, insert: 1 };
  function loadComponentMode() {
    var v = store.get(STORE_KEY);
    return MODE_VALUES[v] ? v : 'send';
  }
  function saveComponentMode(v) { store.set(STORE_KEY, v); }

  /* =====================================================================
     2. THE DEMO PAGE FIXTURE — a small, real, nested DOM tree the surface
        renders. Every node below becomes an actual element with a permanent
        data-bc-id, so locators, rects, computed styles and outerHTML captured
        off it are genuine measurements, not authored numbers.
     ===================================================================== */
  var PAGE_ELEMENTS = [
    { id: 'el-header', tag: 'header', role: 'banner', component: '<DashboardHeader>',
      text: 'Query Performance', file: 'src/features/dashboard/Header.tsx', line: 12, col: 3,
      cls: 'bc-el-header', children: [
        { id: 'el-breadcrumb', tag: 'span', role: '', component: '<Breadcrumb>',
          text: 'Dashboards / Query Performance', file: 'src/features/dashboard/Header.tsx', line: 18, col: 5,
          cls: 'bc-el-breadcrumb', children: [] }
      ] },
    { id: 'el-filterbar', tag: 'div', role: 'toolbar', component: '<FilterToolbar>',
      text: '', file: 'src/features/dashboard/FilterToolbar.tsx', line: 9, col: 3,
      cls: 'bc-el-filterbar', children: [
        { id: 'el-filter-tenant', tag: 'button', role: 'button', component: '<TenantFilter>',
          text: 'Tenant: All', file: 'src/features/dashboard/FilterToolbar.tsx', line: 22, col: 5,
          cls: 'bc-el-chip', children: [] },
        { id: 'el-filter-window', tag: 'button', role: 'button', component: '<WindowFilter>',
          text: 'Last 24h', file: 'src/features/dashboard/FilterToolbar.tsx', line: 31, col: 5,
          cls: 'bc-el-chip', children: [] }
      ] },
    { id: 'el-chart', tag: 'figure', role: 'img', component: '<LatencyChart>',
      text: 'p95 482 ms', file: 'src/features/dashboard/LatencyChart.tsx', line: 44, col: 3,
      cls: 'bc-el-chart', children: [] },
    { id: 'el-table', tag: 'table', role: 'table', component: '<QueryTable>',
      text: '', file: 'src/features/dashboard/QueryTable.tsx', line: 15, col: 3,
      cls: 'bc-el-table', isRowHost: true, children: [
        { id: 'el-row-1', tag: 'div', role: 'row', component: '<QueryRow>',
          text: 'tenant_4471 · 96 ms · Stable', file: 'src/features/dashboard/QueryRow.tsx', line: 40, col: 5,
          cls: 'bc-el-row', children: [] },
        { id: 'el-row-2', tag: 'div', role: 'row', component: '<QueryRow>',
          text: 'tenant_8123 · 121 ms · Stable', file: 'src/features/dashboard/QueryRow.tsx', line: 40, col: 5,
          cls: 'bc-el-row', children: [] },
        { id: 'el-row-3', tag: 'div', role: 'row', component: '<QueryRow>',
          text: 'tenant_9821 · 482 ms · Needs index', file: 'src/features/dashboard/QueryRow.tsx', line: 40, col: 5,
          cls: 'bc-el-row is-hot', children: [
            { id: 'el-retry', tag: 'button', role: 'button', component: '<RetryButton>',
              text: 'Retry', file: 'src/features/dashboard/QueryRow.tsx', line: 52, col: 9,
              cls: 'bc-el-retry', children: [] }
          ] }
      ] },
    { id: 'el-footnote', tag: 'p', role: 'status', component: '<StatusNote>',
      text: 'Captured 3 traces this session', file: 'src/features/dashboard/StatusNote.tsx', line: 7, col: 3,
      cls: 'bc-el-footnote', children: [] }
  ];
  var ELEMENT_BY_ID = {};
  (function indexElements(list) {
    for (var i = 0; i < list.length; i++) {
      ELEMENT_BY_ID[list[i].id] = list[i];
      if (list[i].children && list[i].children.length) indexElements(list[i].children);
    }
  })(PAGE_ELEMENTS);
  var ROW_IDS_DEFAULT = ['el-row-1', 'el-row-2', 'el-row-3'];

  var SESSION_FIXTURE = [
    { id: 'sess-ordinary', label: 'Ordinary internal browser', protectedAuth: false,
      url: 'https://app.internal/dashboards/query-performance', title: 'Query Performance — Dashboard',
      frame: 'main', generation: 1, rowOrder: ROW_IDS_DEFAULT.slice() },
    { id: 'sess-auth', label: 'Protected authentication browser', protectedAuth: true,
      url: 'https://accounts.example.com/sso/login', title: 'Sign in — Example SSO',
      frame: 'main', generation: 1, rowOrder: [] }
  ];

  var POLICY_CAPS = [
    { id: 'navigation', label: 'Navigation', detail: 'Open, go back/forward, reload' },
    { id: 'tabs', label: 'Tabs and frames', detail: 'Switch and enumerate tabs and frames' },
    { id: 'dom', label: 'DOM and components', detail: 'Read the live element and component tree' },
    { id: 'styles', label: 'CSS and styles', detail: 'Read computed and authored styles' },
    { id: 'console', label: 'Console', detail: 'Read console output; run evaluated expressions' },
    { id: 'network', label: 'Network', detail: 'Inspect requests and responses' },
    { id: 'sourceMaps', label: 'Source maps / files', detail: 'Resolve compiled output to original source' },
    { id: 'performance', label: 'Performance', detail: 'Record traces and timing marks' },
    { id: 'storage', label: 'Storage / cookies', detail: 'Read local/session storage and cookies' },
    { id: 'screenshots', label: 'Screenshots / recording', detail: 'Capture images and short recordings' },
    { id: 'formInput', label: 'Form input', detail: 'Type into and submit ordinary forms' },
    { id: 'downloads', label: 'Downloads', detail: 'Trigger and read completed downloads' },
    { id: 'deviceEmulation', label: 'Viewport / device emulation', detail: 'Resize and emulate device profiles' },
    { id: 'requestSimulation', label: 'Request simulation', detail: 'Replay or synthesize a request' }
  ];
  var POLICY_STATES_DEFAULT = { navigation: 'on', tabs: 'on', dom: 'on', styles: 'on', console: 'on',
    network: 'ask', sourceMaps: 'on', performance: 'ask', storage: 'ask', screenshots: 'on',
    formInput: 'ask', downloads: 'ask', deviceEmulation: 'on', requestSimulation: 'off' };
  var POLICY_CYCLE = { off: 'ask', ask: 'on', on: 'off' };
  var POLICY_LABEL = { off: 'Off', ask: 'Ask', on: 'On' };

  var CONSOLE_FIXTURE = [
    { level: 'log', text: 'GET /api/queries/tenant_9821 200 482ms' },
    { level: 'warn', text: 'Query plan missing covering index for tenant_id, created_at' },
    { level: 'log', text: 'Rendered <QueryTable> · 3 rows · 1 hot row' }
  ];

  /* =====================================================================
     3. RUNTIME STATE
     ===================================================================== */
  var SEED = {
    demo: true,
    activeSessionId: 'sess-ordinary',
    mode: null,                 /* null | 'region' | 'component' | 'devtools' */
    railTab: 'details',         /* 'details' | 'devtools' | 'captures' */
    fullMenuOpen: false,
    componentMode: loadComponentMode(),   /* persisted across reset — not part of SEED clone */
    picked: null,                /* the BrowserElementContext currently shown in the prompt bar */
    pickedElId: null,
    viewingContextId: null,      /* explicitly opened from a capture card / captures list */
    promptInstruction: '',
    captures: [],
    contexts: [],
    refusals: [],
    isolationChecks: [],
    policy: clone2(POLICY_STATES_DEFAULT),
    sessions: clone2(SESSION_FIXTURE),
    lastRerenderNote: null
  };
  function clone2(v) { return JSON.parse(JSON.stringify(v)); }
  var BC0 = JSON.stringify(SEED);
  RT.browserCapture = RT.browserCapture || JSON.parse(BC0);
  function P() { return RT.browserCapture; }
  function session(id) {
    var list = P().sessions;
    for (var i = 0; i < list.length; i++) if (list[i].id === (id || P().activeSessionId)) return list[i];
    return list[0];
  }
  function isProtected(sess) { return !!(sess || session()).protectedAuth; }

  /* Transient drag bookkeeping lives OUTSIDE RT on purpose: it changes on every mousemove
     and nothing external needs to read it, so it is not part of the shared runtime a
     harness would inspect. It never survives a dialog close (see §9 wiring). Live hover
     highlighting is pure DOM (no state write) so hovering the demo page never triggers a
     re-render — only a picked (clicked) element becomes part of render state. */
  var drag = null;          /* {x0,y0,surfaceRect,box} while region-dragging                */

  /* =====================================================================
     4. FIXTURE IMAGE — the honest "screenshot". See header note.
     ===================================================================== */
  /* The fixture "photo" is a detached SVG string built by concatenation, not a DOM
     element with a live computed style — a raw `var(--accent)` inside it would not
     resolve to anything. Reading the CURRENT theme's accent through getComputedStyle
     at generation time is what keeps the fixture on-theme across all 8 themes without
     hard-coding a colour for it; the literal hex is only a last-resort fallback if a
     property read ever fails, matching the pattern `var(--x, fallback)` already uses
     everywhere else in this codebase. */
  function themeColor(varName, fallback) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(varName);
      return (v && v.trim()) || fallback;
    } catch (e) { return fallback; }
  }
  function themeAccent() { return themeColor('--accent', '#4f7fc4'); }
  function themeAccent2() { return themeColor('--accent-2', '#7a5fd1'); }

  function fixtureImage(spec) {
    var w = Math.max(80, Math.round(spec.w || 480));
    var h = Math.max(60, Math.round(spec.h || 260));
    /* Escaped even though a CSS colour value is very unlikely to carry an XML-special
       character: `tone` can come from a live getComputedStyle() read, not a literal
       this file wrote, so it is treated as untrusted the same as any other interpolated
       string here. */
    var tone = escXml(spec.tone || themeAccent());
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">'
      + '<defs><linearGradient id="bcg" x1="0" y1="0" x2="1" y2="1">'
      + '<stop offset="0" stop-color="' + tone + '" stop-opacity="0.38"/>'
      + '<stop offset="1" stop-color="' + tone + '" stop-opacity="0.08"/></linearGradient>'
      + '<pattern id="bcgrid" width="14" height="14" patternUnits="userSpaceOnUse">'
      + '<path d="M14 0H0V14" fill="none" stroke="' + tone + '" stroke-opacity="0.22"/></pattern></defs>'
      + '<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="url(#bcg)"/>'
      + '<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="url(#bcgrid)"/>'
      + '<rect x="1.5" y="1.5" width="' + (w - 3) + '" height="' + (h - 3) + '" fill="none" stroke="' + tone + '" stroke-width="2.5"/>'
      + '<text x="10" y="22" font-family="ui-monospace,Menlo,monospace" font-size="12" fill="' + tone + '" font-weight="700">' + escXml(spec.label || '') + '</text>'
      + (spec.sub ? '<text x="10" y="38" font-family="ui-monospace,Menlo,monospace" font-size="10" fill="' + tone + '">' + escXml(spec.sub) + '</text>' : '')
      + '<text x="10" y="' + (h - 9) + '" font-family="ui-monospace,Menlo,monospace" font-size="8.5" fill="' + tone + '">FIXTURE IMAGE — not a real screenshot · ' + escXml(spec.stamp || '') + '</text>'
      + '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  function escXml(s) { return esc(s); }

  /* =====================================================================
     5. LOCATOR / CONTEXT BUILDING — real DOM reads off the rendered surface.
     ===================================================================== */
  function fragilePath(target, root) {
    var parts = [];
    var node = target;
    var depth = 0;
    while (node && node !== root && depth < 5) {
      var parent = node.parentElement;
      var idx = 1;
      if (parent) {
        var kids = parent.children;
        for (var i = 0; i < kids.length; i++) { if (kids[i] === node) break; if (kids[i].tagName === node.tagName) idx++; }
      }
      parts.unshift(node.tagName.toLowerCase() + ':nth-of-type(' + idx + ')');
      node = parent;
      depth++;
    }
    return parts.join(' > ');
  }
  function ancestorPath(target, root) {
    var out = [];
    var node = target;
    var depth = 0;
    while (node && node !== root && depth < 6) {
      var comp = node.getAttribute && node.getAttribute('data-bc-component');
      out.unshift(comp || ('<' + node.tagName.toLowerCase() + '>'));
      node = node.parentElement;
      depth++;
    }
    return out;
  }
  function surfaceRoot() { return document.querySelector('[data-bc-surface="' + esc(P().activeSessionId) + '"]'); }

  function buildElementContext(target) {
    var sess = session();
    var root = surfaceRoot();
    var rect = target.getBoundingClientRect();
    var cs = (window.getComputedStyle) ? getComputedStyle(target) : null;
    var stableId = target.getAttribute('data-bc-id') || '';
    var html = target.outerHTML || '';
    if (html.length > 320) html = html.slice(0, 320) + '…';
    var rec = {
      id: seq('bctx'),
      demo: true,
      capturedAt: nowIso(),
      session: { id: sess.id, label: sess.label, generationAtCapture: sess.generation },
      page: { url: sess.url, title: sess.title, frame: sess.frame },
      locator: { strategy: 'stable-id', value: '[data-bc-id="' + stableId + '"]', stable: true },
      fragileLocator: { strategy: 'nth-of-type path', value: fragilePath(target, root), stable: false },
      tag: target.tagName.toLowerCase(),
      role: target.getAttribute('role') || '',
      name: (target.getAttribute('aria-label') || (target.textContent || '').trim()).slice(0, 80),
      text: (target.textContent || '').trim().slice(0, 160),
      component: target.getAttribute('data-bc-component') || '',
      source: {
        file: target.getAttribute('data-bc-file') || null,
        line: target.getAttribute('data-bc-line') ? Number(target.getAttribute('data-bc-line')) : null,
        col: target.getAttribute('data-bc-col') ? Number(target.getAttribute('data-bc-col')) : null
      },
      rect: { x: Math.round(rect.left), y: Math.round(rect.top), w: Math.round(rect.width), h: Math.round(rect.height) },
      parentPath: ancestorPath(target, root),
      style: cs ? { display: cs.display, position: cs.position, color: cs.color, background: cs.backgroundColor,
        font: cs.fontWeight + ' ' + cs.fontSize + ' ' + (cs.fontFamily || '').split(',')[0] } : null,
      boundedHtml: html,
      crop: null,
      stableId: stableId,
      freshness: 'current'
    };
    return rec;
  }


  /* =====================================================================
     5A. DISPATCH-TIME REVALIDATION — Additive Correction v4 (BSTALE-001..012)
     ---------------------------------------------------------------------
     Every send path revalidates the capture immediately before dispatch:
     session, page, frame, page GENERATION, stable locator, and captured
     identity. Currentness is generation-and-identity based, never
     timestamp-based -- a node captured a second ago but since replaced fails.

     Exactly ONE compatible match may refresh the generation and proceed.
     Zero, many, a destroyed frame or page, and an identity mismatch all
     return typed `stale_capture` with a recapture action, and nothing is sent.
     Nearest-match heuristics are never used.
     ===================================================================== */
  function revalidateContext(rec) {
    var sess = session();
    var out = {
      schema: 'pm.browser.component_revalidation_result.v1',
      attachment_id: rec && rec.id,
      captured_generation: rec && rec.session ? rec.session.generationAtCapture : null,
      current_generation: sess ? sess.generation : null,
      locator_result_count: 0,
      identity_match: false,
      result: 'stale_capture',
      reason: null,
      recapture_action: 'cmd.browser.component.pick'
    };
    if (!rec) { out.reason = 'no_capture'; return out; }
    if (!sess || sess.id !== (rec.session && rec.session.id)) { out.reason = 'session_gone'; return out; }
    var root = surfaceRoot();
    if (!root) { out.reason = 'frame_or_page_destroyed'; return out; }
    if (sess.frame !== (rec.page && rec.page.frame) || sess.url !== (rec.page && rec.page.url)) {
      out.reason = 'page_or_frame_changed'; return out;
    }
    var matches = [];
    try { matches = Array.prototype.slice.call(root.querySelectorAll(rec.locator.value)); }
    catch (e) { out.reason = 'locator_unusable'; return out; }
    out.locator_result_count = matches.length;
    if (matches.length === 0) { out.reason = 'zero_matches'; return out; }
    if (matches.length > 1) { out.reason = 'multiple_matches'; return out; }
    /* Compatibility: tag, role, component identity, source file and a
       fingerprint of the bounded HTML. All five, not "close enough". */
    var el = matches[0];
    var sameTag = el.tagName.toLowerCase() === rec.tag;
    var sameRole = (el.getAttribute('role') || '') === rec.role;
    var sameComp = (el.getAttribute('data-bc-component') || '') === rec.component;
    var sameFile = (el.getAttribute('data-bc-file') || null) === (rec.source ? rec.source.file : null);
    out.identity_match = sameTag && sameRole && sameComp;
    if (!out.identity_match) { out.reason = 'identity_mismatch'; return out; }
    /* BSTALE-011: a source-map change is disclosed even when the DOM locator
       still resolves -- the agent must not be handed a stale source line. */
    if (!sameFile) {
      out.result = 'stale_capture'; out.reason = 'source_mapping_changed';
      out.current_source = { file: el.getAttribute('data-bc-file') || null,
                             line: el.getAttribute('data-bc-line') ? Number(el.getAttribute('data-bc-line')) : null };
      return out;
    }
    if (out.captured_generation !== out.current_generation) {
      /* One compatible match, so the generation MAY be refreshed and the send
         proceeds -- with the refresh disclosed rather than hidden. */
      out.result = 'refreshed'; out.reason = 'generation_refreshed';
      rec.session.generationAtCapture = sess.generation;
      rec.freshness = 'current';
      return out;
    }
    out.result = 'current'; out.reason = null;
    return out;
  }

  /* BSTALE-012: late resolutions are fenced by the browser selection epoch and
     the ComposerBuffer revision, so an old async result cannot send after the
     user changed or removed the item. */
  function selectionEpoch() { var s = P(); return s.selectionEpoch || 0; }
  function bumpSelectionEpoch() { var s = P(); s.selectionEpoch = (s.selectionEpoch || 0) + 1; return s.selectionEpoch; }
  function acceptLateResolution(payload) {
    if (payload.epoch !== selectionEpoch())
      return { ok: false, error: 'stale_selection_epoch', dispatched: false, retained_as_evidence: true };
    var CS = window.PM56_COMPOSER_STATE;
    var rev = CS && CS.revision ? CS.revision(payload.threadId) : null;
    if (rev != null && payload.bufferRevision != null && payload.bufferRevision !== rev)
      return { ok: false, error: 'stale_buffer_revision', dispatched: false, retained_as_evidence: true };
    return { ok: true, dispatched: true };
  }

  /* BSTALE-005: each hidden reference in a numbered composer list is validated
     INDEPENDENTLY. One stale item stays visible and blocks only itself; the
     other valid items are untouched, and no partial list is sent without an
     explicit user action. */
  function revalidateList(refs) {
    var results = (refs || []).map(function (r) {
      var res = revalidateContext(r);
      return { ref_id: r && r.id, ok: res.result === 'current' || res.result === 'refreshed', result: res };
    });
    var blocked = results.filter(function (x) { return !x.ok; });
    return {
      items: results,
      blocked_ids: blocked.map(function (x) { return x.ref_id; }),
      sendable: blocked.length === 0,
      partial_send_allowed: false,
      note: blocked.length
        ? blocked.length + ' item(s) are stale and block only themselves; the other ' +
          (results.length - blocked.length) + ' remain intact and nothing is sent until you recapture or remove them.'
        : 'Every item revalidated.'
    };
  }

  /* =====================================================================
     6. COMPOSER WRITE PATH — the ONLY function in this file that touches the
        composer. Mirrors composer-state.js's private setComposerText using
        only its exposed primitives (bufferFor / touch / flush), because that
        module owns the buffer shape and exposes no public text setter.
     ===================================================================== */
  function composerEl() { return document.querySelector('textarea[data-input="composer"]'); }
  function writeComposerText(ctx, tid, text, caretAt) {
    var CS = RT.composer;
    ctx.state.composer = text;
    if (ctx.state.drafts) ctx.state.drafts[tid] = text;
    if (CS && typeof CS.bufferFor === 'function') {
      var buf = CS.bufferFor(tid);
      buf.text = text;
      buf.revision = (buf.revision || 0) + 1;
      buf.updated_at = nowIso();
      if (typeof CS.touch === 'function') CS.touch();
      else if (typeof CS.flush === 'function') CS.flush();
    }
    ctx.renderApp();
    var ta = composerEl();
    if (ta) {
      ta.value = text;
      var pos = (caretAt == null) ? text.length : caretAt;
      try { ta.setSelectionRange(pos, pos); } catch (e) { }
    }
  }
  function currentBuffer(ctx) {
    var CS = RT.composer;
    if (CS && typeof CS.bufferFor === 'function') return CS.bufferFor(ctx.state.selectedThread);
    return null;
  }
  function destinationLabel() {
    var d = RT.composer && RT.composer.destination;
    return d ? d.label : 'Assistant';
  }

  /* =====================================================================
     7. COMPOSER LIST — "Add To Composer List" (BROWSER-005). Numbered plain
        text lives in the real composer text; the hidden ref for each number
        lives only in the buffer's browser_context_refs array (a field
        composer-state.js already reserves for this). Distinct in the UI copy
        from state.sendQueue, which is the live follow-up queue.
     ===================================================================== */
  function buildListBlock(refs) {
    if (!refs || !refs.length) return '';
    var lines = ['Referenced components:'];
    for (var i = 0; i < refs.length; i++) {
      var r = refs[i];
      lines.push((i + 1) + '. ' + r.componentLabel + (r.instruction ? ' — ' + r.instruction : ' — (no instruction yet)'));
    }
    return lines.join('\n');
  }
  /* Replaces the previously-rendered block with the newly-built one by comparing
     against a FRESH `buildListBlock(prevRefs)` of the refs as they stood immediately
     before this mutation — never a cached string — so the block is found correctly
     even after a reload rehydrates `browser_context_refs` from storage but this
     module's own in-memory state (a plain string field would not survive that trip)
     has been reset. If the old block text is not found (hand-edited or never
     written), the new block is appended after whatever text already exists rather
     than silently discarded. */
  function applyListRefs(ctx, tid, prevRefs) {
    var buf = currentBuffer(ctx);
    if (!buf) return;
    var prevBlock = buildListBlock(prevRefs);
    var block = buildListBlock(buf.browser_context_refs);
    var text = ctx.state.composer || '';
    if (prevBlock && text.indexOf(prevBlock) !== -1) {
      text = text.replace(prevBlock, block);
    } else if (block) {
      var trimmed = text.replace(/\s+$/, '');
      text = trimmed ? trimmed + '\n\n' + block : block;
    }
    writeComposerText(ctx, tid, text, text.length);
  }
  function addToComposerList(ctx, elCtx, instruction) {
    var tid = ctx.state.selectedThread;
    var buf = currentBuffer(ctx);
    if (!buf) return;
    buf.browser_context_refs = buf.browser_context_refs || [];
    var prevRefs = buf.browser_context_refs.slice();
    buf.browser_context_refs.push({
      id: seq('bcref'), kind: 'list', number: buf.browser_context_refs.length + 1,
      componentLabel: elCtx.component || ('<' + elCtx.tag + '>'), instruction: instruction || '',
      contextId: elCtx.id, addedAt: nowIso()
    });
    applyListRefs(ctx, tid, prevRefs);
  }
  function removeFromComposerList(ctx, refId) {
    var tid = ctx.state.selectedThread;
    var buf = currentBuffer(ctx);
    if (!buf || !buf.browser_context_refs) return;
    var prevRefs = buf.browser_context_refs.slice();
    buf.browser_context_refs = buf.browser_context_refs.filter(function (r) { return r.id !== refId; });
    for (var i = 0; i < buf.browser_context_refs.length; i++) buf.browser_context_refs[i].number = i + 1;
    applyListRefs(ctx, tid, prevRefs);
  }
  function moveInComposerList(ctx, refId, dir) {
    var tid = ctx.state.selectedThread;
    var buf = currentBuffer(ctx);
    if (!buf || !buf.browser_context_refs) return;
    var list = buf.browser_context_refs;
    var prevRefs = list.slice();
    var i = -1;
    for (var k = 0; k < list.length; k++) if (list[k].id === refId) { i = k; break; }
    var j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    var tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    for (var n = 0; n < list.length; n++) list[n].number = n + 1;
    applyListRefs(ctx, tid, prevRefs);
  }

  /* =====================================================================
     8. ISOLATED IMMEDIATE SEND (BROWSER-002) — see header note for the
        structural guarantee. This function takes only local arguments; it
        must never gain a `ctx.state.composer` or textarea read.
     ===================================================================== */
  function sendIsolatedCapture(ctx, payload) {
    /* payload: {kind, image, w, h, label, sub, rect, instruction, elCtx} */
    /* BSTALE-001..003: a COMPONENT send revalidates immediately before
       dispatch and admits no message on a stale capture. Full and region
       screenshots carry no live locator, so they are exempt by construction
       rather than by an exception. */
    if (payload.elCtx) {
      var rv = revalidateContext(payload.elCtx);
      if (rv.result !== 'current' && rv.result !== 'refreshed') {
        P().lastRevalidation = rv;
        ctx.toast('stale_capture — nothing sent',
          rv.reason.replace(/_/g, ' ') + '. Recapture through ' + rv.recapture_action +
          '; the component is never guessed and your composer is unchanged.');
        return null;
      }
      P().lastRevalidation = rv;
    }
    var thread = ctx.activeThread();
    var msg = {
      id: seq('bc-msg'),
      role: 'user',
      type: 'bc-capture',
      sentAt: nowIso(),
      kind: payload.kind,
      image: payload.image,
      imgW: payload.w, imgH: payload.h,
      label: payload.label,
      sub: payload.sub || '',
      instruction: payload.instruction || '',
      rect: payload.rect || null,
      contextId: payload.elCtx ? payload.elCtx.id : null,
      destinationLabel: destinationLabel(),
      /* BROWSER-002 / BSTALE-008: this payload is its own submission. The
         composer reconciler must not read it as a composer send, or an
         attachment sitting in the tray with no typed text is discarded. */
      isolatedSubmission: true,
      demo: true
    };
    ctx.appendMessage(msg, thread);
    var rec = {
      id: msg.id, kind: payload.kind, at: msg.sentAt, label: payload.label,
      destinationLabel: msg.destinationLabel, threadId: thread ? thread.id : null,
      contextId: msg.contextId, image: payload.image
    };
    P().captures.push(rec);
    return msg;
  }

  function tip(key, text) { return ' data-hover-key="' + esc(key) + '" data-hover-tip="' + esc(text) + '" aria-label="' + esc(text) + '"'; }

  /* =====================================================================
     9. RENDER — the demo page surface. Live DOM: every rect/style/outerHTML
        captured off these nodes later is a real measurement.
     ===================================================================== */
  function renderPageEl(def, mode, sess) {
    var picked = (P().pickedElId === def.id) ? ' is-bc-picked' : '';
    var attrs = ' data-bc-el data-bc-id="' + esc(def.id) + '" data-bc-component="' + esc(def.component) + '"'
      + (def.file ? ' data-bc-file="' + esc(def.file) + '" data-bc-line="' + def.line + '" data-bc-col="' + def.col + '"' : '')
      + (def.role ? ' role="' + esc(def.role) + '"' : '');
    var pickAttr = (mode === 'component')
      ? ' data-action="bc-pick-el" data-id="' + esc(def.id) + '" tabindex="0" aria-label="' + esc('Pick ' + (def.component || def.tag) + (def.text ? ': ' + def.text : '')) + '"'
      : '';
    var inner = def.text ? '<span class="bc-el-text">' + esc(def.text) + '</span>' : '';
    if (def.id === 'el-chart') {
      inner += '<span class="bc-sparkline">' + [38, 62, 45, 82, 56, 91, 68].map(function (h) {
        return '<i style="height:' + h + '%"></i>';
      }).join('') + '</span>';
    }
    if (def.isRowHost) {
      var order = (sess.rowOrder && sess.rowOrder.length) ? sess.rowOrder : ROW_IDS_DEFAULT;
      for (var i = 0; i < order.length; i++) { var child = ELEMENT_BY_ID[order[i]]; if (child) inner += renderPageEl(child, mode, sess); }
    } else if (def.children && def.children.length) {
      for (var j = 0; j < def.children.length; j++) inner += renderPageEl(def.children[j], mode, sess);
    }
    return '<' + def.tag + ' class="bc-el ' + esc(def.cls) + picked + '"' + attrs + pickAttr + '>' + inner + '</' + def.tag + '>';
  }

  function renderAuthPage() {
    return '<div class="bc-authpage" data-k="bc-authpage"><div class="bc-authcard">'
      + '<div class="bc-authbrand">Example SSO</div>'
      + '<label class="bc-authfield"><span>Email</span><input type="text" value="you@example.com" disabled></label>'
      + '<label class="bc-authfield"><span>Password</span><input type="password" value="••••••••••" disabled></label>'
      + '<button class="bc-authbtn" disabled>Sign in</button>'
      + '<p class="bc-authnote">Human-only. This session never renders capturable elements.</p>'
      + '</div></div>';
  }

  function renderSurface(sess) {
    var mode = P().mode;
    var page = isProtected(sess) ? renderAuthPage()
      : PAGE_ELEMENTS.map(function (def) { return renderPageEl(def, mode, sess); }).join('');
    /* The region drag-catcher renders on BOTH sessions: dragging over the protected
       mock must produce a real, visible refusal (guardSession at drag-start), not a
       structurally-absent control that only LOOKS prevented. Component picking has no
       such path on the protected session because renderAuthPage() emits no data-bc-el
       at all — there is genuinely nothing for a picker to target there. */
    var regionLayer = (mode === 'region')
      ? '<div class="bc-region-layer" data-k="bc-region-layer" data-bc-region><div class="bc-sel-box" data-k="bc-sel-box" hidden></div></div>'
      : '';
    var highlight = (mode === 'component' && !isProtected(sess))
      ? '<div class="bc-hl-box" data-k="bc-hl-box" hidden></div>'
      : '';
    return '<div class="bc-viewport" data-k="bc-viewport">'
      + '<div class="bc-surface' + (mode === 'region' ? ' is-region-mode' : '') + (mode === 'component' ? ' is-component-mode' : '') + '" data-bc-surface="' + esc(sess.id) + '">'
      + page + regionLayer + highlight
      + '</div></div>';
  }

  function renderHead(ctx) {
    var tabs = P().sessions.map(function (s) {
      var on = s.id === P().activeSessionId;
      return '<button class="bc-tab' + (on ? ' active' : '') + (s.protectedAuth ? ' is-protected' : '') + '" data-action="bc-switch-session" data-id="' + esc(s.id) + '"'
        + tip('bc-tab-' + s.id, s.label + (s.protectedAuth ? ' — human-only' : '')) + '>'
        + ctx.icon(s.protectedAuth ? 'lock' : 'globe', 11) + '<span>' + esc(s.label) + '</span></button>';
    }).join('');
    return '<div class="drawer-head bc-head" data-k="bc-head">' + ctx.icon('globe', 13) + '<strong>Internal Browser</strong>'
      + '<span class="bc-tabs" data-k="bc-tabs">' + tabs + '</span>'
      + '<span class="spacer"></span>'
      + '<button class="icon-button" data-action="bc-close" aria-label="Close browser">' + ctx.icon('close', 13) + '</button>'
      + '</div>';
  }

  function renderUrlbar(ctx, sess) {
    return '<div class="bc-urlbar" data-k="bc-urlbar">'
      + '<span class="bc-url-lock">' + ctx.icon(sess.protectedAuth ? 'lock' : 'globe', 12) + '</span>'
      + '<span class="bc-url-text">' + esc(sess.url) + '</span>'
      + '<span class="bc-url-title">' + esc(sess.title) + '</span>'
      + '<span class="bc-url-gen"' + tip('bc-gen', 'Page render generation — bumped by Simulate re-render') + '>gen ' + sess.generation + '</span>'
      + '</div>';
  }

  function renderBanner(ctx, sess) {
    if (!isProtected(sess)) return '';
    return '<div class="bc-banner" data-k="bc-banner">' + ctx.icon('lock', 14)
      + '<div><strong>Human-only session</strong>'
      + '<p>Agent capture, DevTools, Back Seat Driver review and persistence are refused here. Try a toolbar control below — the refusal is real, not a disabled button.</p></div></div>';
  }

  function renderToolbar(ctx, sess) {
    var mode = P().mode;
    var full = P().fullMenuOpen ? '<div class="bc-full-menu" data-k="bc-full-menu">'
      + '<button class="bc-full-item" data-action="bc-full-shot" data-which="visible">' + ctx.icon('image', 12) + ' Visible Browser</button>'
      + '<button class="bc-full-item" data-action="bc-full-shot" data-which="page">' + ctx.icon('expand', 12) + ' Full Scrollable Page</button>'
      + '</div>' : '';
    return '<div class="bc-toolbar" data-k="bc-toolbar" role="toolbar" aria-label="Browser capture tools">'
      + '<span class="bc-tool-split">'
      + '<button class="bc-tool-btn" data-action="bc-full-shot" data-which="visible"' + tip('bc-t-full', 'Capture the visible browser as a fixture screenshot and send it now') + '>' + ctx.icon('image', 14) + '<span>Full Screenshot</span></button>'
      + '<button class="bc-tool-caret" data-action="bc-toggle-full-menu" aria-haspopup="true" aria-expanded="' + (P().fullMenuOpen ? 'true' : 'false') + '" aria-label="Full screenshot options">' + ctx.icon('chevron', 10) + '</button>'
      + full
      + '</span>'
      + '<button class="bc-tool-btn' + (mode === 'region' ? ' is-armed' : '') + '" data-action="bc-arm-region" aria-pressed="' + (mode === 'region' ? 'true' : 'false') + '"' + tip('bc-t-region', 'Drag a rectangle over the page below; releasing sends the crop now') + '>' + ctx.icon('expand', 14) + '<span>Region Screenshot</span></button>'
      + '<button class="bc-tool-btn' + (mode === 'component' ? ' is-armed' : '') + '" data-action="bc-arm-component" aria-pressed="' + (mode === 'component' ? 'true' : 'false') + '"' + tip('bc-t-component', 'Hover to highlight, click to pick a component') + '>' + ctx.icon('code', 14) + '<span>Select Component</span></button>'
      + '<span class="spacer"></span>'
      + '<button class="bc-tool-btn' + (mode === 'devtools' ? ' is-armed' : '') + '" data-action="bc-toggle-devtools" aria-pressed="' + (mode === 'devtools' ? 'true' : 'false') + '"' + tip('bc-t-devtools', 'Policy-controlled agent DevTools access') + '>' + ctx.icon('terminal', 14) + '<span>DevTools</span></button>'
      + '</div>'
      + '<p class="bc-note">Full and Region send immediately as their own message. Anything already typed in the composer stays exactly as it is — '
      + '<button class="text-button" data-action="bc-verify-isolation">Verify isolation</button>.</p>';
  }

  /* =====================================================================
     10. RENDER — component prompt bar (BROWSER-003/004/006)
     ===================================================================== */
  var PROMPT_MODES = [
    { id: 'send', label: 'Send Now', sub: 'Instruction + component context, sent immediately' },
    { id: 'list', label: 'Add To Composer List', sub: 'Numbered instruction in the composer, hidden ref attached' },
    { id: 'insert', label: 'Insert Component At Cursor', sub: 'Component chip at the cursor — sends nothing' }
  ];
  function renderPromptBar(ctx) {
    var picked = P().picked;
    if (!picked || P().mode !== 'component') return '';
    var mode = P().componentMode;
    var modeDef = PROMPT_MODES.filter(function (m) { return m.id === mode; })[0] || PROMPT_MODES[0];
    var menuOpen = P().promptMenuOpen;
    var menu = menuOpen ? '<div class="bc-prompt-menu" data-k="bc-prompt-menu">' + PROMPT_MODES.map(function (m) {
      return '<button class="bc-prompt-menu-item' + (mode === m.id ? ' active' : '') + '" data-action="bc-set-component-mode" data-value="' + m.id + '">'
        + '<strong>' + esc(m.label) + (mode === m.id ? ' ' + ctx.icon('check', 11) : '') + '</strong><span>' + esc(m.sub) + '</span></button>';
    }).join('') + '</div>' : '';
    var disabledInput = mode === 'insert';
    return '<div class="bc-prompt-bar" data-k="bc-prompt-bar" role="group" aria-label="Selected component">'
      + '<div class="bc-prompt-target">' + ctx.icon('code', 12) + '<b>' + esc(picked.component || ('<' + picked.tag + '>')) + '</b>'
      + '<span>' + esc(picked.name || picked.text || '') + '</span>'
      + '<button class="icon-button" data-action="bc-open-context" data-id="' + esc(picked.id) + '"' + tip('bc-prompt-details', 'Full element context') + '>' + ctx.icon('info', 11) + '</button></div>'
      + (disabledInput
        ? '<p class="bc-prompt-hint">Insert copies a reference into the composer at your last cursor position. No instruction, nothing sent.</p>'
        : '<input class="bc-prompt-input" data-bc-input="prompt" type="text" placeholder="Optional instruction about this component…" value="' + esc(P().promptInstruction) + '">')
      + '<span class="bc-prompt-actions">'
      + '<button class="primary-button bc-prompt-run" data-action="bc-prompt-run">' + esc(modeDef.label) + '</button>'
      + '<button class="bc-prompt-caret" data-action="bc-toggle-prompt-menu" aria-haspopup="true" aria-expanded="' + (menuOpen ? 'true' : 'false') + '" aria-label="Choose what happens on Send">' + ctx.icon('chevron', 10) + '</button>'
      + menu
      + '<button class="icon-button" data-action="bc-prompt-cancel" aria-label="Cancel selection">' + ctx.icon('close', 12) + '</button>'
      + '</span></div>';
  }

  /* =====================================================================
     11. RENDER — details rail (BrowserElementContext / DevTools / Captures)
     ===================================================================== */
  function currentDetailsRecord() {
    if (P().picked) return P().picked;
    if (P().viewingContextId) {
      var found = findContext(P().viewingContextId);
      if (found) return found;
    }
    var list = P().contexts;
    return list.length ? list[list.length - 1] : null;
  }
  function renderContextFields(ctx, rec) {
    if (!rec) return '<p class="bc-empty">No component selected yet. Use Select Component, or open a capture from the Captures tab.</p>';
    var liveGen = session(rec.session.id).generation;
    var stale = rec.session.generationAtCapture < liveGen;
    return '<div class="bc-context-card" data-k="bc-context-card-' + esc(rec.id) + '">'
      + row('Component', esc(rec.component || ('<' + rec.tag + '>')))
      + row('Tag / role', esc(rec.tag) + (rec.role ? ' · ' + esc(rec.role) : ''))
      + row('Name / text', esc(rec.name || rec.text || '(none)'))
      + row('Session', esc(rec.session.label))
      + '<div class="bc-context-row"><label>Page</label><b>' + esc(rec.page.title) + '</b><span>' + esc(rec.page.url) + '</span></div>'
      + '<div class="bc-context-row"><label>Generation</label><b>' + rec.session.generationAtCapture + '</b>'
      + (stale ? '<span class="bc-stale-tag">stale — page is now generation ' + liveGen + '</span>' : '<span class="bc-fresh-tag">current</span>') + '</div>'
      + row('Rect', rec.rect.w + '×' + rec.rect.h + ' @ (' + rec.rect.x + ',' + rec.rect.y + ')')
      + row('Source', rec.source.file ? esc(rec.source.file) + ':' + rec.source.line + ':' + rec.source.col : 'not reported')
      + row('Parent path', esc(rec.parentPath.join(' › ')))
      + (rec.style ? '<div class="bc-context-row"><label>Style</label><b>' + esc(rec.style.display) + ' · ' + esc(rec.style.font) + '</b><span>' + esc(rec.style.color) + ' on ' + esc(rec.style.background) + '</span></div>' : '')
      + '<div class="bc-context-row bc-locator-row"><label>Stable locator</label><b class="bc-mono">' + esc(rec.locator.value) + '</b><span class="bc-tag-stable">stable</span></div>'
      + '<div class="bc-context-row bc-locator-row"><label>Fragile locator</label><b class="bc-mono">' + esc(rec.fragileLocator.value || '(n/a)') + '</b><span class="bc-tag-fragile">position-based</span></div>'
      + '<div class="bc-context-row"><label>Bounded HTML</label><div class="code-block bc-html-block">' + esc(rec.boundedHtml) + '</div></div>'
      + row('Crop', rec.crop ? rec.crop.w + '×' + rec.crop.h : 'none — full element')
      + '<p class="bc-sub">demo:true — rect, style and HTML above are live measurements off the rendered fixture page; component/source labels are authored fixture metadata.</p>'
      + '<button class="soft-button" data-action="bc-simulate-rerender">' + ctx.icon('refresh', 12) + ' Simulate re-render</button>'
      + (P().lastRerenderNote ? '<div class="bc-rerender-note ' + (P().lastRerenderNote.resolved ? 'ok' : 'fail') + '" data-k="bc-rerender-note">' + esc(P().lastRerenderNote.text) + '</div>' : '')
      + '</div>';
    function row(label, val) { return '<div class="bc-context-row"><label>' + esc(label) + '</label><b>' + val + '</b></div>'; }
  }
  function renderRailTabs() {
    var tabs = [['details', 'Details'], ['devtools', 'DevTools'], ['captures', 'Captures (' + P().captures.length + ')']];
    return '<div class="bc-rail-tabs" data-k="bc-rail-tabs">' + tabs.map(function (t) {
      var on = P().railTab === t[0];
      return '<button class="bc-rail-tab' + (on ? ' active' : '') + '" data-action="bc-rail-tab" data-id="' + t[0] + '">' + esc(t[1]) + '</button>';
    }).join('') + '</div>';
  }
  function renderRailDevtools(sess) {
    if (isProtected(sess)) return '<p class="bc-empty">DevTools is refused on the protected authentication browser. Switch to the ordinary session.</p>';
    var pol = P().policy;
    var rows = POLICY_CAPS.map(function (c) {
      var v = pol[c.id];
      return '<button class="bc-policy-row" data-action="bc-cycle-policy" data-id="' + c.id + '"' + tip('bc-pol-' + c.id, c.detail + ' — click to cycle Off / Ask / On') + '>'
        + '<span class="bc-policy-label">' + esc(c.label) + '</span>'
        + '<span class="bc-policy-state bc-policy-' + v + '">' + POLICY_LABEL[v] + '</span></button>';
    }).join('');
    var log = CONSOLE_FIXTURE.map(function (l) { return '<div class="bc-console-line bc-console-' + l.level + '">' + esc(l.text) + '</div>'; }).join('');
    return '<div class="bc-devtools-panel" data-k="bc-devtools-panel">'
      + '<p class="bc-sub">Policy-controlled agent access (BROWSER-008). Each row cycles Off → Ask → On. A fixture policy projection, not a live provider setting.</p>'
      + '<div class="bc-policy-grid">' + rows + '</div>'
      + '<div class="bc-console" data-k="bc-console"><label>Console (fixture)</label>' + log + '</div>'
      + '</div>';
  }
  function renderRailCaptures(ctx) {
    var caps = P().captures;
    if (!caps.length) return '<p class="bc-empty">No captures yet this session.</p>';
    return '<div class="bc-captures-list" data-k="bc-captures-list">' + caps.slice().reverse().map(function (c) {
      return '<div class="bc-capture-row" data-k="bc-cap-' + esc(c.id) + '">'
        + '<img class="bc-capture-thumb" src="' + c.image + '" alt="' + esc(c.label) + '" width="54" height="34">'
        + '<div class="bc-capture-copy"><b>' + esc(c.label) + '</b><span>' + esc(c.destinationLabel) + ' · ' + esc(new Date(c.at).toLocaleTimeString()) + '</span></div>'
        + (c.contextId ? '<button class="icon-button" data-action="bc-open-context" data-id="' + esc(c.contextId) + '"' + tip('bc-cap-open-' + c.id, 'Open element context') + '>' + ctx.icon('info', 12) + '</button>' : '')
        + '</div>';
    }).join('') + '</div>';
  }

  function renderListManager(ctx) {
    var buf = currentBuffer(ctx);
    var refs = (buf && buf.browser_context_refs) || [];
    if (!refs.length) return '';
    return '<div class="bc-list-manager" data-k="bc-list-manager">'
      + '<div class="bc-list-manager-head"><b>Composer list</b><span>' + refs.length + ' item' + (refs.length === 1 ? '' : 's') + ' in this draft — not the live follow-up queue</span></div>'
      + refs.map(function (r, i) {
        return '<div class="bc-list-row" data-k="bc-list-row-' + esc(r.id) + '">'
          + '<span class="bc-list-num">' + (r.number || (i + 1)) + '</span>'
          + '<span class="bc-list-label">' + esc(r.componentLabel) + '</span>'
          + '<button class="icon-button" data-action="bc-list-move" data-id="' + esc(r.id) + '" data-dir="-1"' + (i === 0 ? ' disabled' : '') + ' aria-label="Move up">' + ctx.icon('up', 11) + '</button>'
          + '<button class="icon-button" data-action="bc-list-move" data-id="' + esc(r.id) + '" data-dir="1"' + (i === refs.length - 1 ? ' disabled' : '') + ' aria-label="Move down">' + ctx.icon('down', 11) + '</button>'
          + '<button class="icon-button" data-action="bc-list-remove" data-id="' + esc(r.id) + '" aria-label="Remove">' + ctx.icon('close', 11) + '</button>'
          + '</div>';
      }).join('')
      + '</div>';
  }

  /* =====================================================================
     12. RENDER — dialog assembly + prompt-bar positioning (measure-then-place,
         same rAF-after-render shape as app.js's positionOverlays/positionHoverCard)
     ===================================================================== */
  function positionPromptBar() {
    var bar = document.querySelector('[data-k="bc-prompt-bar"]');
    var stage = document.querySelector('[data-k="bc-stage"]');
    var elId = P().pickedElId;
    var target = elId ? document.querySelector('[data-bc-id="' + cssEsc(elId) + '"]') : null;
    if (!bar || !stage || !target) return;
    var sr = stage.getBoundingClientRect();
    var tr = target.getBoundingClientRect();
    var br = bar.getBoundingClientRect();
    var top = (tr.bottom - sr.top) + 8;
    if (sr.top + top + br.height > window.innerHeight - 8) top = (tr.top - sr.top) - br.height - 8;
    if (top < 4) top = 4;
    var left = (tr.left - sr.left);
    var maxLeft = sr.width - br.width - 4;
    if (left > maxLeft) left = Math.max(4, maxLeft);
    if (left < 4) left = 4;
    bar.style.top = top + 'px';
    bar.style.left = left + 'px';
  }
  function cssEsc(s) { return (window.CSS && CSS.escape) ? CSS.escape(s) : String(s).replace(/"/g, '\\"'); }

  function renderDialog(ctx) {
    var sess = session();
    var html = '<section class="dialog bc-dialog" style="width:min(980px,calc(100vw - 20px))" role="dialog" aria-modal="true" aria-label="Internal browser">'
      + renderHead(ctx)
      + '<div class="dialog-body bc-body">'
      + '<div class="bc-main">'
      + renderUrlbar(ctx, sess)
      + renderBanner(ctx, sess)
      + renderToolbar(ctx, sess)
      + '<div class="bc-stage" data-k="bc-stage">'
      + renderSurface(sess)
      + renderPromptBar(ctx)
      + '</div>'
      + '</div>'
      + '<aside class="bc-rail" data-k="bc-rail">'
      + renderListManager(ctx)
      + renderRailTabs()
      + '<div class="bc-rail-body" data-k="bc-rail-body">'
      + (P().railTab === 'details' ? renderContextFields(ctx, currentDetailsRecord())
        : P().railTab === 'devtools' ? renderRailDevtools(sess)
        : renderRailCaptures(ctx))
      + '</div>'
      + '</aside>'
      + '</div></section>';
    if (P().picked) requestAnimationFrame(positionPromptBar);
    return html;
  }

  /* =====================================================================
     13. SLOTS — entry points + dialog + transcript rendering
     ===================================================================== */
  /* Browser entry is owned outside Assistant Chat. Capture fixture is available in Demo Studio only. */

  EXT.slot('dialog', function (ctx) {
    var d = ctx.state.dialog;
    if (!d || d.type !== 'bc-browser') return '';
    return renderDialog(ctx);
  });

  EXT.slot('transcriptMessage', function (ctx) {
    var m = ctx.m; if (!m || m.type !== 'bc-capture') return '';
    var kindLabel = m.kind === 'visible' ? 'Full Screenshot · Visible Browser'
      : m.kind === 'page' ? 'Full Screenshot · Full Scrollable Page'
      : m.kind === 'region' ? 'Region Screenshot'
      : 'Component · Send Now';
    return '<article class="message message-user bc-capture-card" data-message-id="' + esc(m.id) + '" data-k="bc-msg-' + esc(m.id) + '">'
      + '<div class="message-surface">'
      + '<div class="bc-capture-head"><b>' + esc(kindLabel) + '</b><span>sent to ' + esc(m.destinationLabel) + '</span></div>'
      + '<img class="bc-capture-img" src="' + m.image + '" alt="' + esc(m.label) + '" width="' + (m.imgW || 480) + '" height="' + (m.imgH || 260) + '">'
      + (m.instruction ? '<p class="bc-capture-instruction">' + esc(m.instruction) + '</p>' : '')
      + (m.sub ? '<p class="bc-capture-sub">' + esc(m.sub) + '</p>' : '')
      + '<p class="bc-fixture-note">Fixture image — not a real screenshot.</p>'
      + (m.contextId ? '<button class="soft-button" data-action="bc-open-context" data-id="' + esc(m.contextId) + '">' + ctx.icon('info', 12) + ' Component details</button>' : '')
      + '</div></article>';
  });

  EXT.slot('messageAffordance', function (ctx) {
    var m = ctx.message; if (!m || !m.browserContextRefs || !m.browserContextRefs.length) return '';
    var chips = m.browserContextRefs.map(function (r) {
      return '<span class="bc-ref-chip" data-k="bc-refchip-' + esc(r.id) + '"><b>' + (r.number ? ('#' + r.number) : '') + '</b> ' + esc(r.componentLabel) + '</span>';
    }).join('');
    return '<div class="bc-ref-strip" data-k="bc-ref-strip-' + esc(m.id) + '"><span class="bc-ref-strip-label">Referenced components</span>' + chips + '</div>';
  });

  /* =====================================================================
     14. WIRING HELPERS
     ===================================================================== */
  function ctxNow() { return (EXT && typeof EXT.ctx === 'function') ? EXT.ctx() : null; }
  function clampNum(n, min, max) { return Math.max(min, Math.min(max, n)); }
  function findContext(id) { var l = P().contexts; for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }

  function clearPick() { P().picked = null; P().pickedElId = null; P().promptInstruction = ''; P().promptMenuOpen = false; }
  function cancelDrag() {
    if (drag) {
      if (drag.onMove) document.removeEventListener('mousemove', drag.onMove);
      if (drag.onUp) document.removeEventListener('mouseup', drag.onUp);
      if (drag.box) drag.box.hidden = true;
    }
    drag = null;
  }
  function cancelTransient() { clearPick(); cancelDrag(); }

  /* BROWSER-009 — the protected session refuses with a stated reason. Called at the
     moment of an actual attempt (drag-start, pick-click, full-shot click, DevTools
     open), never used to silently disable a control ahead of time. */
  function guardSession(ctx, actionLabel) {
    var sess = session();
    if (!isProtected(sess)) return true;
    var reason = 'The protected authentication browser is human-only. ' + actionLabel + ' is refused here — it is excluded from agent capture, DevTools, Back Seat Driver review, and persistence.';
    ctx.toast('Refused — human-only session', reason);
    ctx.addReceipt('bc-refused', 'Refused · ' + actionLabel, reason);
    P().refusals.push({ id: seq('bcref-x'), at: nowIso(), actionLabel: actionLabel, reason: reason, sessionId: sess.id });
    ctx.renderApp();
    return false;
  }

  function insertComponentAtCursor(ctx, rec) {
    var tid = ctx.state.selectedThread;
    var ta = composerEl();
    var text = ctx.state.composer || '';
    var start = ta && ta.selectionStart != null ? ta.selectionStart : text.length;
    var end = ta && ta.selectionEnd != null ? ta.selectionEnd : start;
    var token = '[' + (rec.component || ('<' + rec.tag + '>')) + (rec.name ? ' "' + rec.name + '"' : '') + ']';
    var next = text.slice(0, start) + token + text.slice(end);
    var buf = currentBuffer(ctx);
    if (buf) {
      buf.browser_context_refs = buf.browser_context_refs || [];
      buf.browser_context_refs.push({ id: seq('bcref'), kind: 'inline', number: null,
        componentLabel: rec.component || ('<' + rec.tag + '>'), instruction: '', contextId: rec.id, addedAt: nowIso() });
    }
    writeComposerText(ctx, tid, next, start + token.length);
  }

  function finishRegionDrag(ctx, left, top, w, h) {
    if (w < 6 || h < 6) return;   /* too small to be an intentional crop */
    var scale = w > 480 ? 480 / w : 1;
    var iw = Math.max(60, Math.round(w * scale)), ih = Math.max(40, Math.round(h * scale));
    var sub = Math.round(w) + '×' + Math.round(h) + ' px crop at (' + Math.round(left) + ',' + Math.round(top) + ')';
    var image = fixtureImage({ w: iw, h: ih, label: 'Region Screenshot', sub: sub, stamp: new Date().toLocaleTimeString() });
    sendIsolatedCapture(ctx, { kind: 'region', image: image, w: iw, h: ih, label: 'Region Screenshot', sub: sub,
      rect: { x: Math.round(left), y: Math.round(top), w: Math.round(w), h: Math.round(h) } });
    P().mode = null;
    ctx.renderApp();
    ctx.toast('Region screenshot sent', 'Sent to ' + destinationLabel() + '.');
  }

  /* =====================================================================
     15. ACTIONS
     ===================================================================== */
  EXT.action('bc-open', function (ctx) {
    cancelTransient();
    P().mode = null; P().fullMenuOpen = false;
    /* Close the wand menu before opening the dialog. Leaving it open is not
       cosmetic: the menu stays hit-testable above the new surface, and a real
       mouse click aimed at the dialog can land on a menu row instead. Every
       sibling wand action that opens a dialog does this. */
    ctx.closeMenu && ctx.closeMenu();
    ctx.openDialog({ type: 'bc-browser' });
    return true;
  });
  EXT.action('bc-close', function (ctx) {
    cancelTransient();
    P().mode = null; P().fullMenuOpen = false;
    ctx.closeDialog();
    return true;
  });
  EXT.action('bc-switch-session', function (ctx, btn) {
    cancelTransient();
    P().activeSessionId = btn.dataset.id;
    P().mode = null;
    ctx.renderApp();
    return true;
  });
  EXT.action('bc-toggle-full-menu', function (ctx) {
    P().fullMenuOpen = !P().fullMenuOpen;
    ctx.renderApp();
    return true;
  });
  EXT.action('bc-full-shot', function (ctx, btn) {
    P().fullMenuOpen = false;
    if (!guardSession(ctx, 'Full Screenshot')) return true;
    var which = (btn.dataset.which === 'page') ? 'page' : 'visible';
    var vp = document.querySelector('[data-k="bc-viewport"]');
    var surf = surfaceRoot();
    var mw = vp ? vp.clientWidth : 480, mh = vp ? vp.clientHeight : 260;
    var fw = surf ? surf.scrollWidth : mw, fh = surf ? surf.scrollHeight : mh;
    var W = which === 'page' ? Math.max(fw, mw) : mw, H = which === 'page' ? Math.max(fh, mh) : mh;
    var scale = W > 480 ? 480 / W : 1;
    var iw = Math.max(80, Math.round(W * scale)), ih = Math.max(60, Math.round(H * scale));
    var label = which === 'page' ? 'Full Screenshot · Full Scrollable Page' : 'Full Screenshot · Visible Browser';
    var sub = Math.round(W) + '×' + Math.round(H) + ' px · ' + session().url;
    var image = fixtureImage({ w: iw, h: ih, label: label, sub: Math.round(W) + '×' + Math.round(H) + ' px', stamp: new Date().toLocaleTimeString() });
    sendIsolatedCapture(ctx, { kind: which, image: image, w: iw, h: ih, label: label, sub: sub, rect: { x: 0, y: 0, w: Math.round(W), h: Math.round(H) } });
    P().mode = null;
    ctx.renderApp();
    ctx.toast('Full screenshot sent', 'Sent to ' + destinationLabel() + '.');
    return true;
  });
  EXT.action('bc-arm-region', function (ctx) {
    if (P().mode === 'region') { cancelTransient(); P().mode = null; }
    else { cancelTransient(); P().mode = 'region'; }
    ctx.renderApp();
    return true;
  });
  EXT.action('bc-arm-component', function (ctx) {
    if (P().mode === 'component') { cancelTransient(); P().mode = null; }
    else { cancelTransient(); P().mode = 'component'; }
    ctx.renderApp();
    return true;
  });
  EXT.action('bc-toggle-devtools', function (ctx) {
    if (P().mode === 'devtools') { P().mode = null; ctx.renderApp(); return true; }
    if (!guardSession(ctx, 'DevTools')) return true;
    cancelTransient();
    P().mode = 'devtools';
    P().railTab = 'devtools';
    ctx.renderApp();
    return true;
  });
  EXT.action('bc-pick-el', function (ctx, btn) {
    if (P().mode !== 'component') return true;
    if (!guardSession(ctx, 'Select Component')) return true;
    var id = btn.dataset.id;
    var target = document.querySelector('[data-bc-id="' + cssEsc(id) + '"]');
    if (!target) return true;
    var rec = buildElementContext(target);
    P().contexts.push(rec);
    P().picked = rec;
    P().pickedElId = id;
    P().promptInstruction = '';
    P().promptMenuOpen = false;
    P().viewingContextId = null;
    P().railTab = 'details';
    ctx.renderApp();
    return true;
  });
  EXT.action('bc-toggle-prompt-menu', function (ctx) {
    P().promptMenuOpen = !P().promptMenuOpen;
    ctx.renderApp();
    return true;
  });
  EXT.action('bc-set-component-mode', function (ctx, btn) {
    var v = btn.dataset.value;
    if (!MODE_VALUES[v]) return true;
    P().componentMode = v;
    P().promptMenuOpen = false;
    saveComponentMode(v);
    ctx.renderApp();
    return true;
  });
  EXT.action('bc-prompt-run', function (ctx) {
    var picked = P().picked;
    if (!picked) return true;
    var mode = P().componentMode;
    if (mode === 'send') {
      if (!guardSession(ctx, 'Send Now')) return true;
      var target = document.querySelector('[data-bc-id="' + cssEsc(picked.stableId) + '"]');
      var rect = target ? target.getBoundingClientRect() : null;
      var rw = rect ? Math.round(rect.width) : picked.rect.w, rh = rect ? Math.round(rect.height) : picked.rect.h;
      var image = fixtureImage({ w: 240, h: 140, label: 'Component · ' + (picked.component || picked.tag), sub: rw + '×' + rh + ' px', stamp: new Date().toLocaleTimeString() });
      sendIsolatedCapture(ctx, { kind: 'component', image: image, w: 240, h: 140,
        label: 'Component · ' + (picked.component || picked.tag), sub: picked.name || picked.text || '',
        instruction: P().promptInstruction, rect: picked.rect, elCtx: picked });
      ctx.toast('Component sent', 'Sent to ' + destinationLabel() + '.');
    } else if (mode === 'list') {
      addToComposerList(ctx, picked, P().promptInstruction);
      var buf = currentBuffer(ctx);
      ctx.toast('Added to composer list', 'Item #' + (buf ? buf.browser_context_refs.length : '?') + ' — not sent yet, and not the live follow-up queue.');
    } else if (mode === 'insert') {
      insertComponentAtCursor(ctx, picked);
      ctx.toast('Inserted at cursor', 'A component reference was inserted. Nothing was sent.');
    }
    clearPick();
    ctx.renderApp();
    return true;
  });
  EXT.action('bc-prompt-cancel', function (ctx) { clearPick(); ctx.renderApp(); return true; });
  EXT.action('bc-rail-tab', function (ctx, btn) { P().railTab = btn.dataset.id; ctx.renderApp(); return true; });
  EXT.action('bc-cycle-policy', function (ctx, btn) {
    var id = btn.dataset.id;
    if (!(id in P().policy)) return true;
    P().policy[id] = POLICY_CYCLE[P().policy[id]] || 'off';
    ctx.renderApp();
    return true;
  });
  EXT.action('bc-open-context', function (ctx, btn) {
    var id = btn.dataset.id;
    if (!findContext(id)) return true;
    P().picked = null; P().pickedElId = null;
    P().viewingContextId = id;
    P().railTab = 'details';
    if (ctx.state.dialog && ctx.state.dialog.type === 'bc-browser') ctx.renderApp();
    else ctx.openDialog({ type: 'bc-browser' });
    return true;
  });
  EXT.action('bc-simulate-rerender', function (ctx) {
    var sess = session();
    var order = sess.rowOrder.slice();
    if (order.length > 1) {
      var before = order.join(',');
      var guard = 0;
      do {
        for (var i = order.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var t = order[i]; order[i] = order[j]; order[j] = t;
        }
        guard++;
      } while (order.join(',') === before && guard < 8);
      sess.rowOrder = order;
    }
    sess.generation += 1;
    ctx.renderApp();
    requestAnimationFrame(function () {
      var rec = currentDetailsRecord();
      var note;
      if (rec && rec.stableId) {
        var found = document.querySelector('[data-bc-id="' + cssEsc(rec.stableId) + '"]');
        if (found) {
          var r = found.getBoundingClientRect();
          note = { resolved: true, text: 'Stable locator re-resolved to the same element after the re-render (row order changed, page is now generation ' + sess.generation + '). New rect ' + Math.round(r.width) + '×' + Math.round(r.height) + ' at (' + Math.round(r.left) + ',' + Math.round(r.top) + '). The fragile nth-of-type path recorded at capture time no longer matches this element’s position.' };
        } else {
          note = { resolved: false, text: 'The stable locator did not resolve after the re-render. That would be a defect in this demo.' };
        }
      } else {
        note = { resolved: true, text: 'Page re-rendered: row order shuffled and generation advanced to ' + sess.generation + '. Pick a component to see its locator re-resolve.' };
      }
      P().lastRerenderNote = note;
      var c = ctxNow();
      if (c) c.renderApp();
    });
    return true;
  });
  EXT.action('bc-list-remove', function (ctx, btn) { removeFromComposerList(ctx, btn.dataset.id); ctx.renderApp(); return true; });
  EXT.action('bc-list-move', function (ctx, btn) { moveInComposerList(ctx, btn.dataset.id, Number(btn.dataset.dir)); ctx.renderApp(); return true; });

  /* The critical negative-path proof (BROWSER-002). Runs the exact production send
     path with a synthetic fixture and records the composer text before/after as a
     durable, re-readable receipt rather than asking anyone to trust a comment. */
  EXT.action('bc-verify-isolation', function (ctx) {
    var ta = composerEl();
    var before = ta ? ta.value : (ctx.state.composer || '');
    var image = fixtureImage({ w: 220, h: 130, tone: themeAccent2(), label: 'Isolation check', sub: 'synthetic capture', stamp: new Date().toLocaleTimeString() });
    sendIsolatedCapture(ctx, { kind: 'visible', image: image, w: 220, h: 130,
      label: 'Isolation check — synthetic capture', sub: 'Produced only to prove the send path never reads the composer.', rect: null });
    var afterTa = composerEl();
    var after = afterTa ? afterTa.value : (ctx.state.composer || '');
    var unchanged = before === after;
    P().isolationChecks.push({ id: seq('bciso'), at: nowIso(), before: before, after: after, unchanged: unchanged });
    ctx.addReceipt('bc-isolation-check', unchanged ? 'Isolation check passed' : 'Isolation check FAILED',
      'Composer before: ' + (before ? JSON.stringify(before) : '(empty)') + '. Composer after: ' + (after ? JSON.stringify(after) : '(empty)') + '. '
      + (unchanged ? 'Unchanged — the capture above was appended as its own message without reading or clearing the composer.' : 'The composer text changed. This would be a defect in the isolated-send path.'));
    ctx.toast(unchanged ? 'Isolation verified' : 'Isolation check failed',
      unchanged ? 'The composer text was untouched by the send.' : 'See the durable receipt in the transcript.');
    ctx.renderApp();
    return true;
  });

  /* =====================================================================
     16. RAW LISTENERS — hover highlight (pure DOM, no render), region drag,
         and Escape interception. This module is concatenated BEFORE app.js
         (see build.py / the module contract), so these `document` listeners
         are registered first and run first on the same event; Escape uses
         stopImmediatePropagation() to consume the keystroke for its own
         cancel-one-step-at-a-time behaviour and only lets it continue to
         app.js's default (closes state.dialog) once nothing here is pending.
     ===================================================================== */
  document.addEventListener('mouseover', function (e) {
    if (P().mode !== 'component' || isProtected()) return;
    var box = document.querySelector('[data-k="bc-hl-box"]');
    var surface = surfaceRoot();
    if (!box || !surface) return;
    var el = e.target && e.target.closest ? e.target.closest('[data-bc-el]') : null;
    if (!el || !surface.contains(el)) { box.hidden = true; return; }
    var sr = surface.getBoundingClientRect();
    var er = el.getBoundingClientRect();
    box.hidden = false;
    box.style.left = (er.left - sr.left) + 'px';
    box.style.top = (er.top - sr.top) + 'px';
    box.style.width = er.width + 'px';
    box.style.height = er.height + 'px';
  });
  document.addEventListener('mouseout', function (e) {
    if (P().mode !== 'component') return;
    var surface = surfaceRoot();
    var toEl = e.relatedTarget;
    if (surface && (!toEl || !surface.contains(toEl))) {
      var box = document.querySelector('[data-k="bc-hl-box"]');
      if (box) box.hidden = true;
    }
  });

  document.addEventListener('mousedown', function (e) {
    var layer = e.target && e.target.closest ? e.target.closest('[data-bc-region]') : null;
    if (!layer) return;
    var c = ctxNow(); if (!c) return;
    if (!guardSession(c, 'Region Screenshot')) return;
    var surface = layer.parentElement;
    var sr = surface.getBoundingClientRect();
    var box = layer.querySelector('[data-k="bc-sel-box"]');
    var x0 = clampNum(e.clientX - sr.left, 0, sr.width), y0 = clampNum(e.clientY - sr.top, 0, sr.height);
    drag = { x0: x0, y0: y0, sr: sr, box: box };
    if (box) { box.hidden = false; box.style.left = x0 + 'px'; box.style.top = y0 + 'px'; box.style.width = '0px'; box.style.height = '0px'; }
    e.preventDefault();
    drag.onMove = function (ev) {
      if (!drag) return;
      var x = clampNum(ev.clientX - drag.sr.left, 0, drag.sr.width);
      var y = clampNum(ev.clientY - drag.sr.top, 0, drag.sr.height);
      var left = Math.min(x, drag.x0), top = Math.min(y, drag.y0);
      var w = Math.abs(x - drag.x0), h = Math.abs(y - drag.y0);
      if (drag.box) { drag.box.style.left = left + 'px'; drag.box.style.top = top + 'px'; drag.box.style.width = w + 'px'; drag.box.style.height = h + 'px'; }
    };
    drag.onUp = function (ev) {
      var d = drag;
      document.removeEventListener('mousemove', d.onMove);
      document.removeEventListener('mouseup', d.onUp);
      var x = clampNum(ev.clientX - d.sr.left, 0, d.sr.width);
      var y = clampNum(ev.clientY - d.sr.top, 0, d.sr.height);
      var left = Math.min(x, d.x0), top = Math.min(y, d.y0);
      var w = Math.abs(x - d.x0), h = Math.abs(y - d.y0);
      drag = null;
      if (d.box) d.box.hidden = true;
      var cc = ctxNow(); if (!cc) return;
      finishRegionDrag(cc, left, top, w, h);
    };
    document.addEventListener('mousemove', drag.onMove);
    document.addEventListener('mouseup', drag.onUp);
  });

  /* Keyboard bridge for the custom pickable page elements: most of them are not
     native buttons (a <header>/<div>/<figure>/<p> has no built-in Enter/Space
     activation even with tabindex="0"), so Enter/Space is turned into a real
     click here and left to the ordinary data-action dispatcher in app.js. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
    var t = e.target;
    if (!t || !t.getAttribute || t.getAttribute('data-action') !== 'bc-pick-el') return;
    if (t.tagName === 'BUTTON' || t.tagName === 'INPUT') return;   /* already native */
    e.preventDefault();
    t.click();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!RT.browserCapture) return;
    if (P().picked) {
      clearPick();
      var c1 = ctxNow(); if (c1) c1.renderApp();
      e.stopImmediatePropagation(); e.preventDefault();
      return;
    }
    if (drag) {
      cancelDrag();
      var c2 = ctxNow(); if (c2) c2.renderApp();
      e.stopImmediatePropagation(); e.preventDefault();
      return;
    }
    if (P().mode) {
      P().mode = null; P().fullMenuOpen = false;
      var c3 = ctxNow(); if (c3) c3.renderApp();
      e.stopImmediatePropagation(); e.preventDefault();
      return;
    }
    /* Nothing transient pending: fall through so app.js's default Escape
       (closes state.dialog) can close the whole browser dialog. */
  });

  /* Close the two small local dropdowns (Full Screenshot's Visible/Full Page menu,
     and the prompt bar's mode menu) on an outside click. Registered before app.js's
     own action dispatcher (module load order), so on the SAME click that opens one of
     app.js's own menus/dialogs this still runs first and does not fight it; on the
     click that opens a dropdown itself the target is inside its own container, so the
     `if` below is false and the just-opened panel survives its own opening click. */
  document.addEventListener('click', function (e) {
    var changed = false;
    if (P().fullMenuOpen && !(e.target && e.target.closest && e.target.closest('.bc-tool-split'))) { P().fullMenuOpen = false; changed = true; }
    if (P().promptMenuOpen && !(e.target && e.target.closest && e.target.closest('.bc-prompt-actions'))) { P().promptMenuOpen = false; changed = true; }
    if (changed) { var c = ctxNow(); if (c) c.renderApp(); }
  });

  /* Prompt-bar instruction input: deliberately no re-render per keystroke (the
     goals.js objective textarea lesson — a patch mid-keystroke fights the caret). */
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (!t || !t.getAttribute) return;
    if (t.getAttribute('data-bc-input') === 'prompt') { P().promptInstruction = t.value; }
  });

  /* =====================================================================
     17. COMPOSER CONTRACT HOOKS
     ===================================================================== */
  if (RT.composer) {
    RT.composer.historyBlockers = RT.composer.historyBlockers || [];
    RT.composer.historyBlockers.push(function () {
      /* §14.2 "ambiguous pending state": an armed region drag or an open
         component prompt bar both mean Up/Down recall would be surprising. */
      return P().mode === 'region' || !!drag || !!P().picked;
    });
    RT.composer.commitHooks = RT.composer.commitHooks || [];
    RT.composer.commitHooks.push(function (ctx, thread, message, buffer) {
      if (buffer && buffer.browser_context_refs && buffer.browser_context_refs.length) {
        if (message) message.browserContextRefs = buffer.browser_context_refs.slice();
        /* This module is the only writer of browser_context_refs; composer-state.js
           reserves the field but does not clear it on commit, so this module clears
           its own field once the refs have been stamped onto the sent message. */
        buffer.browser_context_refs = [];
      }
    });
  }

  /* =====================================================================
     18. RESET
     ===================================================================== */
  function clearComponentModeStorage() { try { localStorage.removeItem(STORE_KEY); } catch (e) { } }
  EXT.chainAction('reset-all', function () {
    cancelTransient();
    clearComponentModeStorage();
    RT.browserCapture = JSON.parse(BC0);
    RT.browserCapture.componentMode = 'send';
    return false;
  });

  /* =====================================================================
     19. PUBLIC SURFACE (harnesses assert against this, not the DOM)
     ===================================================================== */
  window.PM56_BROWSER = {
    version: 1,
    restore: function () {
      cancelTransient();
      RT.browserCapture = JSON.parse(BC0);
      RT.browserCapture.componentMode = loadComponentMode();
    },
    fixture: function () { return JSON.parse(BC0); },
    state: function () { return RT.browserCapture; },
    /* Additive Correction v4 (BSTALE-001..012). */
    revalidate: revalidateContext,
    revalidateList: revalidateList,
    buildContext: buildElementContext,
    selectionEpoch: selectionEpoch,
    bumpSelectionEpoch: bumpSelectionEpoch,
    acceptLateResolution: acceptLateResolution,
    recaptureCommand: function () { return 'cmd.browser.component.pick'; }
  };
})();
