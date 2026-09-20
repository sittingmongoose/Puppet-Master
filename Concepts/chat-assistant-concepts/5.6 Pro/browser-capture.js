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
 *
 * BATCH 20 — CURRENTNESS AT DISPATCH (BSTALE-001..012). Every component-send path
 * revalidates immediately before admission through the shared `preSendValidators`
 * owner mechanism (normal Send, keyboard Send, targeted send, deferred queue
 * Send-now, /goal and Plan-revision all funnel through app.js `deliverSend`,
 * which runs validators before any effect-claiming hook, so one validator
 * covers them):
 * - Compatibility is tag + role + component + source file + line/col + the bounded
 *   fingerprint `bc-fp.v1` (whitespace-collapsed outerHTML with transient pick chrome
 *   stripped). Recency never declares a capture fresh.
 * - Refresh never mutates the retained capture: the original record is immutable
 *   evidence and the refreshed dispatch context is recorded separately.
 * - Revalidation resolves the RECORDED session (never the active one) and its own
 *   surface. A surface that is merely unmounted (dialog closed, session backgrounded)
 *   with an unchanged generation stays current, because no mutation is possible while
 *   unmounted; an advanced generation without a live DOM is unverifiable (stale).
 *   Dialog-open-but-surface-gone is a destroyed frame. Unknown session ids never fall
 *   back to session one.
 * - Late results are fenced by the selection epoch (bumped on pick/cancel/remove/
 *   retarget/session change) and the ComposerBuffer revision.
 * - Policy (screenshots/dom/console) is enforced at every capture/DevTools operation
 *   including API entries: Off refuses, Ask holds for an explicit single-use allow,
 *   and permission/policy changes between preparation and commit refuse.
 * - Isolated sends route to the actual current destination through the collaboration
 *   owner (run reference with exact recipient); ended/missing/unsupported destinations
 *   refuse without redirecting to Assistant.
 * - Scheduling a live ref is refused (shared scheduler); `bc-freeze-snapshots`
 *   converts live refs to immutable `browser_snapshot` artifacts through the shared
 *   artifact/attachment owners, and dispatch resolves retained bytes only.
 * - Recapture reuses the same component picker (`cmd.browser.component.pick`); no
 *   recapture command exists. Fixture images stay labeled fixtures throughout.
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
      frame: 'main', generation: 1, rowOrder: ROW_IDS_DEFAULT.slice(), replaced: {}, duplicated: [] },
    { id: 'sess-auth', label: 'Protected authentication browser', protectedAuth: true,
      url: 'https://accounts.example.com/sso/login', title: 'Sign in — Example SSO',
      frame: 'main', generation: 1, rowOrder: [], replaced: {}, duplicated: [] }
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
    lastRerenderNote: null,
    /* B20 (BSTALE-012/004/005/009): selection epoch, single-use policy grants,
       recapture target, admission holds, per-context revalidation/refresh logs,
       and the chip-prune log. All reset with the session like the rest of SEED. */
    selectionEpoch: 0,
    pendingAllow: null,
    allowOnce: null,
    recaptureRefId: null,
    lastAdmissionHold: null,
    revalidationLog: {},
    refreshLog: {},
    chipPruneLog: []
  };
  function clone2(v) { return JSON.parse(JSON.stringify(v)); }
  var BC0 = JSON.stringify(SEED);
  RT.browserCapture = RT.browserCapture || JSON.parse(BC0);
  function P() { return RT.browserCapture; }
  function session(id) {
    var list = P().sessions;
    var want = (id == null) ? P().activeSessionId : id;
    for (var i = 0; i < list.length; i++) if (list[i].id === want) return list[i];
    /* B20: an explicit unknown id never falls back to session one (that turned a
       destroyed identity into an implicit ordinary session). The no-arg render path
       keeps the old fallback so a corrupt active id cannot crash the dialog. */
    return (id == null) ? list[0] : null;
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
  function surfaceRoot() { return surfaceFor(P().activeSessionId); }
  /* B20: revalidation resolves the RECORDED session's own surface, never the active
     one — a backgrounded session is unmounted, not destroyed. */
  function surfaceFor(sid) {
    if (sid == null) return null;
    return document.querySelector('[data-bc-surface="' + esc(sid) + '"]');
  }

  /* B20 — bounded fingerprint policy `bc-fp.v1`. The fingerprint covers tag, role,
     component identity, source file, and the whitespace-collapsed bounded outerHTML
     with transient pick chrome stripped (the `is-bc-picked` class and the pick-mode
     `data-action`/`tabindex`/`aria-label` this module adds at render time — the
     fixture elements carry no authored aria-label, so stripping it cannot hide a
     real accessible-name change here; `data-id` is pick chrome too, not the
     stable `data-bc-id` locator. Source line/col are compared separately so a
     same-file mapping drift reports as `source_mapping_changed` with the current
     identity, not as a generic mismatch. */
  var FP_POLICY = 'bc-fp.v1:tag|role|component|file|ws-collapsed-outerHTML-320';
  function normalizedHtml(el) {
    var c = el.cloneNode(true);
    if (c.classList) c.classList.remove('is-bc-picked');
    /* All pick-mode-only chrome is stripped: the fingerprint must be identical
       whether the live surface currently renders with pick affordances or not
       (dialog reopened, mode off), so mode changes never read as page change. */
    c.removeAttribute('data-action'); c.removeAttribute('data-id');
    c.removeAttribute('tabindex'); c.removeAttribute('aria-label');
    var h = c.outerHTML || '';
    h = h.replace(/\s+/g, ' ');
    if (h.length > 320) h = h.slice(0, 320) + '…';
    return h;
  }
  function fingerprintOf(el) {
    var s = el.tagName.toLowerCase() + '|' + (el.getAttribute('role') || '')
      + '|' + (el.getAttribute('data-bc-component') || '') + '|' + (el.getAttribute('data-bc-file') || '')
      + '|' + normalizedHtml(el);
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return 'fnv1a32:' + (h >>> 0).toString(16);
  }
  function liveRectOf(el) {
    var r = el.getBoundingClientRect();
    return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
  }
  function liveStyleOf(el) {
    if (!window.getComputedStyle) return null;
    var cs = getComputedStyle(el);
    return { display: cs.display, position: cs.position, color: cs.color, background: cs.backgroundColor,
      font: cs.fontWeight + ' ' + cs.fontSize + ' ' + (cs.fontFamily || '').split(',')[0] };
  }

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
      freshness: 'current',
      /* B20: bounded identity fingerprint + the policy that defines it. */
      fingerprint: fingerprintOf(target),
      fingerprintPolicy: FP_POLICY
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
  function logRevalidation(rec, out) {
    if (!rec || !rec.id) return out;
    P().revalidationLog = P().revalidationLog || {};
    P().revalidationLog[rec.id] = { at: nowIso(), result: out.result, reason: out.reason,
      captured_generation: out.captured_generation, current_generation: out.current_generation,
      locator_result_count: out.locator_result_count };
    P().lastRevalidation = out;
    return out;
  }
  function revalidateContext(rec) {
    var out = {
      schema: 'pm.browser.component_revalidation_result.v1',
      attachment_id: rec && rec.id,
      captured_generation: rec && rec.session ? rec.session.generationAtCapture : null,
      current_generation: null,
      locator_result_count: 0,
      identity_match: false,
      result: 'stale_capture',
      reason: null,
      recapture_action: 'cmd.browser.component.pick'
    };
    if (!rec) { out.reason = 'no_capture'; return logRevalidation(rec, out); }
    /* B20: the RECORDED session is resolved strictly — never the active one, and
       an unknown id never falls back to session one. */
    var sess = session(rec.session && rec.session.id);
    if (!sess) { out.reason = 'session_gone'; return logRevalidation(rec, out); }
    out.current_generation = sess.generation;
    if (sess.frame !== (rec.page && rec.page.frame) || sess.url !== (rec.page && rec.page.url)) {
      out.reason = 'page_or_frame_changed'; return logRevalidation(rec, out);
    }
    /* Defensive: a protected-session context can never be captured (picking is
       refused there), so one that appears is refused outright. */
    if (sess.protectedAuth) { out.reason = 'protected_session'; return logRevalidation(rec, out); }
    /* B20-R01: recorded session mutations resolve independent of mounting. The
       duplicate/replace fixtures record their mutation in session state, so a
       known-ambiguous or known-replaced target holds even with the surface
       unmounted (dialog closed or session backgrounded). Generation equality
       alone never proves uniqueness. */
    if (rec.stableId && sess.duplicated && sess.duplicated.indexOf(rec.stableId) >= 0) {
      out.locator_result_count = 2;
      out.reason = 'multiple_matches';
      out.detail = 'The recorded page authority holds two live elements under this locator; the capture is ambiguous whether or not the browser surface is mounted.';
      return logRevalidation(rec, out);
    }
    var replEntry = (rec.stableId && sess.replaced) ? sess.replaced[rec.stableId] : null;
    var replApplies = !!replEntry && (replEntry.atGeneration == null || !rec.session
      || rec.session.generationAtCapture == null || rec.session.generationAtCapture < replEntry.atGeneration);
    if (replApplies) {
      out.reason = 'identity_mismatch';
      out.detail = 'The recorded page authority replaced this target after the capture; the old capture cannot resolve to it.';
      return logRevalidation(rec, out);
    }
    var root = surfaceFor(sess.id);
    if (!root) {
      var dlg = null;
      try { var c0 = ctxNow(); dlg = c0 && c0.state ? c0.state.dialog : null; } catch (e) { }
      if (dlg && dlg.type === 'bc-browser' && P().activeSessionId === sess.id) {
        out.reason = 'frame_or_page_destroyed'; return logRevalidation(rec, out);
      }
      /* B20-R3-F1: a directly observed failure is not cleared by unmounting.
         When the last recorded observation for this capture failed and nothing
         changed since (same captured/current generation), no new
         compatible-target evidence exists, so the closed surface cannot
         declare it fresh. It holds as unverified until a live re-resolution
         succeeds or the user recaptures. Captures with no observed failure
         keep the clean closed-session path below. */
      var lastObs = (rec.id && P().revalidationLog) ? P().revalidationLog[rec.id] : null;
      if (lastObs && lastObs.result === 'stale_capture'
          && lastObs.captured_generation === out.captured_generation
          && lastObs.current_generation === out.current_generation) {
        out.reason = 'unverified_after_observed_failure';
        out.detail = 'The last live check observed ' + String(lastObs.reason).replace(/_/g, ' ')
          + '; closing the browser did not re-verify the target. Reopen the browser so the live element can be checked, or recapture.';
        out.unmounted = true;
        return logRevalidation(rec, out);
      }
      /* B20: the surface is merely unmounted (dialog closed or session
         backgrounded). Recorded mutations were already resolved above, so only
         a page with no recorded change and an unchanged generation stays
         current; an advanced generation cannot be verified without the live
         DOM and is stale, not guessed. */
      if (out.captured_generation === out.current_generation) {
        out.result = 'current'; out.reason = null; out.unmounted = true; out.identity_match = true;
        return logRevalidation(rec, out);
      }
      out.reason = 'generation_unverifiable';
      out.detail = 'The page advanced while its surface was not mounted; reopen the browser so the live element can be checked, or recapture.';
      return logRevalidation(rec, out);
    }
    var matches = [];
    try { matches = Array.prototype.slice.call(root.querySelectorAll(rec.locator.value)); }
    catch (e) { out.reason = 'locator_unusable'; return logRevalidation(rec, out); }
    out.locator_result_count = matches.length;
    if (matches.length === 0) { out.reason = 'zero_matches'; return logRevalidation(rec, out); }
    if (matches.length > 1) { out.reason = 'multiple_matches'; return logRevalidation(rec, out); }
    /* Compatibility: tag, role, component identity, source reference and the
       bounded fingerprint. All of them, not "close enough". */
    var el = matches[0];
    var sameTag = el.tagName.toLowerCase() === rec.tag;
    var sameRole = (el.getAttribute('role') || '') === rec.role;
    var sameComp = (el.getAttribute('data-bc-component') || '') === rec.component;
    out.identity_match = sameTag && sameRole && sameComp;
    if (!out.identity_match) { out.reason = 'identity_mismatch'; return logRevalidation(rec, out); }
    /* BSTALE-011: a source-map change is disclosed even when the DOM locator
       still resolves -- the agent must not be handed a stale source line. The
       same-file line/col case is included: an unchanged filename with an
       invalidated mapping is still a changed mapping. This precedes the
       fingerprint so a mapping drift reports with the current source identity
       rather than as a generic substance mismatch. */
    var liveFile = el.getAttribute('data-bc-file') || null;
    var liveLine = el.getAttribute('data-bc-line') ? Number(el.getAttribute('data-bc-line')) : null;
    var liveCol = el.getAttribute('data-bc-col') ? Number(el.getAttribute('data-bc-col')) : null;
    var capSrc = rec.source || {};
    if (liveFile !== (capSrc.file == null ? null : capSrc.file)
        || liveLine !== (capSrc.line == null ? null : capSrc.line)
        || liveCol !== (capSrc.col == null ? null : capSrc.col)) {
      out.result = 'stale_capture'; out.reason = 'source_mapping_changed';
      out.current_source = { file: liveFile, line: liveLine, col: liveCol };
      out.detail = 'The captured source mapping no longer resolves; the agent receives the current source identity or a recapture requirement.';
      return logRevalidation(rec, out);
    }
    /* B20: the fingerprint actually compared (previously only asserted). A
       same-tag/role/component/source element with changed substance is stale. */
    if (rec.fingerprint && fingerprintOf(el) !== rec.fingerprint) {
      out.identity_match = false;
      out.reason = 'fingerprint_mismatch';
      out.detail = 'The live element differs under ' + FP_POLICY + '; recency alone never declares a capture fresh.';
      return logRevalidation(rec, out);
    }
    if (out.captured_generation !== out.current_generation) {
      /* One compatible match, so the generation MAY be refreshed and the send
         proceeds -- with the refresh disclosed rather than hidden. B20: the
         retained capture is NOT mutated; the refreshed dispatch context is
         recorded separately so old evidence never looks newly observed. */
      out.result = 'refreshed'; out.reason = 'generation_refreshed';
      out.dispatched_context = {
        generation: sess.generation,
        rect: liveRectOf(el),
        dom: normalizedHtml(el),
        style: liveStyleOf(el),
        source: { file: liveFile, line: liveLine, col: liveCol },
        refreshedAt: nowIso()
      };
      P().refreshLog = P().refreshLog || {};
      P().refreshLog[rec.id] = { at: nowIso(), from: out.captured_generation, to: sess.generation };
      return logRevalidation(rec, out);
    }
    out.result = 'current'; out.reason = null;
    return logRevalidation(rec, out);
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
  /* B20: the numbered block carries list refs only. Inline chips live as tokens in
     the surrounding text, not as block rows (previously a later list rebuild
     silently absorbed inline refs into the numbering). */
  function listRefsOf(refs) { return (refs || []).filter(function (r) { return r.kind !== 'inline'; }); }
  function renumberListRefs(refs) {
    var n = 0;
    for (var i = 0; i < refs.length; i++) if (refs[i].kind !== 'inline') refs[i].number = ++n;
  }
  function buildListBlock(refs) {
    var list = listRefsOf(refs);
    if (!list.length) return '';
    var lines = ['Referenced components:'];
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      lines.push((r.number || (i + 1)) + '. ' + r.componentLabel + (r.instruction ? ' — ' + r.instruction : ' — (no instruction yet)')
        + (r.stale ? ' — STALE (' + String(r.stale.reason || 'stale').replace(/_/g, ' ') + ')' : ''));
    }
    return lines.join('\n');
  }
  /* B20 (BSTALE-006): a visible chip/token that the user deleted or changed must
     not leave hidden context behind to be sent later. Inline refs whose exact
     token is absent from both the sent payload and the live composer are
     detached (logged, not sent). List refs are authoritative while their derived
     block is intact; a hand-deleted or hand-rewritten block detaches the list,
     because its rows no longer map to hidden refs. Ordinary typing around a
     token never creates, duplicates or rebinds refs — this only ever removes. */
  function pruneDetachedRefs(ctx, buf, raw) {
    var refs = (buf && buf.browser_context_refs) || [];
    if (!refs.length) return [];
    var live = (ctx && ctx.state ? ctx.state.composer : '') || '';
    var union = live + '\n' + (raw || '') + '\n' + (buf.text || '');
    var block = buildListBlock(refs);
    var blockGone = !!block && union.indexOf(block) < 0;
    var kept = [], pruned = [];
    for (var i = 0; i < refs.length; i++) {
      var r = refs[i];
      if (r.kind === 'inline') {
        if (r.token && union.indexOf(r.token) < 0) { pruned.push(r); continue; }
      } else if (blockGone) { pruned.push(r); continue; }
      kept.push(r);
    }
    if (pruned.length) {
      buf.browser_context_refs = kept;
      P().chipPruneLog.push({ at: nowIso(), threadId: buf.thread_id || null,
        pruned: pruned.map(function (r) { return { id: r.id, kind: r.kind || 'list', label: r.componentLabel }; }) });
    }
    return pruned;
  }
  /* Replaces the previously-rendered block with the newly-built one by comparing
     against a FRESH `buildListBlock(prevRefs)` of the refs as they stood immediately
     before this mutation — never a cached string — so the block is found correctly
     even after a reload rehydrates `browser_context_refs` from storage but this
     module's own in-memory state (a plain string field would not survive that trip)
     has been reset. If the old block text is not found (hand-edited or never
     written), the new block is appended after whatever text already exists rather
     than silently discarded. */
  /* B20-R05: the before-mutation refs as value snapshots, not a shallow slice.
     Every list mutation below edits the SAME ref objects (instruction,
     numbers, stale marks), so a slice still aliases the new state and the old
     block can never be found for replacement. Only the fields the visible
     block projects are snapshotted. */
  function snapshotListRefs(refs) {
    return (refs || []).map(function (r) {
      return { kind: r.kind, number: r.number, componentLabel: r.componentLabel,
        instruction: r.instruction, stale: r.stale ? { reason: r.stale.reason } : null };
    });
  }
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
    var prevRefs = snapshotListRefs(buf.browser_context_refs);
    buf.browser_context_refs.push({
      id: seq('bcref'), kind: 'list', number: 0,
      componentLabel: elCtx.component || ('<' + elCtx.tag + '>'), instruction: instruction || '',
      contextId: elCtx.id, addedAt: nowIso()
    });
    renumberListRefs(buf.browser_context_refs);
    applyListRefs(ctx, tid, prevRefs);
  }
  function removeFromComposerList(ctx, refId) {
    var tid = ctx.state.selectedThread;
    var buf = currentBuffer(ctx);
    if (!buf || !buf.browser_context_refs) return;
    var prevRefs = snapshotListRefs(buf.browser_context_refs);
    var dropped = null;
    buf.browser_context_refs = buf.browser_context_refs.filter(function (r) { if (r.id === refId) dropped = r; return r.id !== refId; });
    if (!dropped) return;
    renumberListRefs(buf.browser_context_refs);
    /* B20: removing an inline ref also removes its exact token text, so no
       visible token is left behind to suggest a context that is gone. */
    if (dropped.kind === 'inline' && dropped.token && ctx.state.composer && ctx.state.composer.indexOf(dropped.token) >= 0) {
      ctx.state.composer = ctx.state.composer.replace(dropped.token, '');
      if (ctx.state.drafts) ctx.state.drafts[tid] = ctx.state.composer;
    }
    bumpSelectionEpoch();
    applyListRefs(ctx, tid, prevRefs);
  }
  function editListInstruction(ctx, refId, instruction) {
    var tid = ctx.state.selectedThread;
    var buf = currentBuffer(ctx);
    if (!buf || !buf.browser_context_refs) return;
    var prevRefs = snapshotListRefs(buf.browser_context_refs);
    for (var i = 0; i < buf.browser_context_refs.length; i++) {
      if (buf.browser_context_refs[i].id === refId) buf.browser_context_refs[i].instruction = instruction;
    }
    applyListRefs(ctx, tid, prevRefs);
  }
  function moveInComposerList(ctx, refId, dir) {
    var tid = ctx.state.selectedThread;
    var buf = currentBuffer(ctx);
    if (!buf || !buf.browser_context_refs) return;
    var list = buf.browser_context_refs;
    var prevRefs = snapshotListRefs(list);
    /* B20: reorder moves within the list kind only; inline chips have no order. */
    var spots = [];
    for (var k = 0; k < list.length; k++) if (list[k].kind !== 'inline') spots.push(k);
    var at = -1;
    for (var s = 0; s < spots.length; s++) if (list[spots[s]].id === refId) at = s;
    if (at < 0) return;
    var other = at + dir;
    if (other < 0 || other >= spots.length) return;
    var tmp = list[spots[at]]; list[spots[at]] = list[spots[other]]; list[spots[other]] = tmp;
    renumberListRefs(list);
    bumpSelectionEpoch();
    applyListRefs(ctx, tid, prevRefs);
  }

  /* =====================================================================
     8. ISOLATED IMMEDIATE SEND (BROWSER-002) — see header note for the
        structural guarantee. This function takes only local arguments; it
        must never gain a `ctx.state.composer` or textarea read.
     ===================================================================== */
  /* B20: isolated sends route to the ACTUAL current destination through the shared
     collaboration owner — not merely its display label. A workflow/participant
     destination is validated (run exists, non-terminal, participant exists, room
     turn rules pass, thread matches); anything else refuses with a stated reason
     and never silently redirects to Assistant. Other destination kinds have no
     isolated-delivery route in their owner and refuse honestly rather than fake
     a delivery with a label. */
  var TERMINAL_RUN = { completed: 1, canceled: 1, failed: 1 };
  function resolveIsolatedDestination(ctx) {
    var tid = ctx.state.selectedThread;
    var buf = (RT.composer && typeof RT.composer.bufferFor === 'function') ? RT.composer.bufferFor(tid) : null;
    var dest = (buf && buf.destination) || (RT.composer && RT.composer.destination) || null;
    if (!dest || dest.kind === 'assistant') return { ok: true, assistant: true, label: 'Assistant', dest: null };
    if (dest.kind !== 'workflow' && dest.kind !== 'participant') {
      return { ok: false, error: 'destination_kind_unsupported',
        detail: 'Isolated capture delivery to a ' + (dest.kind || 'detached') + ' destination has no route in its owner. The capture was not sent; pick a collaboration run or Assistant.' };
    }
    var COL = window.PM56_COLLAB;
    var run = (COL && typeof COL.run === 'function') ? COL.run(dest.refId) : null;
    if (!run) {
      return { ok: false, error: 'destination_unavailable',
        detail: 'The targeted collaboration run no longer exists. The capture was not sent and was not redirected to Assistant.' };
    }
    if (TERMINAL_RUN[run.status]) {
      return { ok: false, error: 'destination_ended',
        detail: 'The targeted run has ended (' + run.status + '). The capture was not sent and was not redirected to Assistant; retarget or clear the destination.' };
    }
    if (dest.participantId) {
      var found = false;
      for (var i = 0; i < (run.participants || []).length; i++) if (run.participants[i].id === dest.participantId) found = true;
      if (!found) {
        return { ok: false, error: 'participant_missing',
          detail: 'The targeted participant is not on this run. The capture was not sent.' };
      }
    }
    var ROOM = window.PM56_ROOM;
    if (ROOM && typeof ROOM.owns === 'function' && ROOM.owns(run.id)) {
      var pre = (typeof ROOM.canSend === 'function') ? ROOM.canSend(run.id, dest) : { ok: true };
      if (!pre.ok) {
        return { ok: false, error: pre.error || 'room_not_accepting',
          detail: 'The room refuses a new turn now (' + (pre.error || 'not accepting') + '). The capture was not sent.' };
      }
      var thread = ctx.activeThread();
      if (!thread || thread.id !== run.threadId) {
        return { ok: false, error: 'wrong_thread',
          detail: 'This room lives on another thread. The capture was not sent there from here.' };
      }
    }
    return { ok: true, assistant: false, label: dest.label || 'Destination', dest: dest, run: run };
  }
  function sendIsolatedCapture(ctx, payload) {
    /* payload: {kind, image, w, h, label, sub, rect, instruction, elCtx, gate} */
    /* B20: the effect boundary re-checks the gate the action took (or guards
       directly when called without one, e.g. the isolation prover). */
    if (payload.gate) {
      if (!checkAttempt(ctx, payload.gate, 'Capture send')) return null;
    } else if (!guardSession(ctx, 'Capture send', 'screenshots')) return null;
    /* B20-R03: the final operation enforces the DOM grant itself before any
       live re-read — a screenshots-only gate never authorizes DOM inspection.
       A gate that already covers DOM is the operation's single-use
       authorization (re-guarding would consume one grant twice); anything else
       is fully guarded here, including direct API calls. */
    var gateCaps = payload.gate ? (payload.gate.capabilities || [payload.gate.capability]) : [];
    if (payload.elCtx && gateCaps.indexOf('dom') < 0 && !guardSession(ctx, 'Capture send', 'dom')) return null;
    /* BSTALE-001..003: a COMPONENT send revalidates immediately before
       dispatch and admits no message on a stale capture. Full and region
       screenshots carry no live locator, so they are exempt by construction
       rather than by an exception. */
    var refreshNote = null;
    if (payload.elCtx) {
      var rv = revalidateContext(payload.elCtx);
      if (rv.result !== 'current' && rv.result !== 'refreshed') {
        ctx.toast('stale_capture — nothing sent',
          rv.reason.replace(/_/g, ' ') + '. Recapture through ' + rv.recapture_action +
          '; the component is never guessed and your composer is unchanged.');
        ctx.addReceipt('bc-refused', 'stale_capture — nothing sent',
          'Reason: ' + rv.reason + '. The selected component and instruction are preserved for recapture; the composer is unchanged.');
        return null;
      }
      if (rv.result === 'refreshed') refreshNote = rv;
    }
    var route = resolveIsolatedDestination(ctx);
    if (!route.ok) {
      ctx.toast('Not sent — destination refused', route.detail);
      ctx.addReceipt('bc-destination-refused', 'Not sent — destination refused', route.error + '. ' + route.detail);
      return null;
    }
    var thread = ctx.activeThread();
    var refBody = (payload.instruction ? payload.instruction + '\n' : '')
      + '[Browser capture · ' + payload.kind + ' · ' + payload.label + ']';
    var msg = {
      id: seq('bc-msg'),
      role: 'user',
      type: 'bc-capture',
      body: refBody,
      sentAt: nowIso(),
      kind: payload.kind,
      image: payload.image,
      imgW: payload.w, imgH: payload.h,
      label: payload.label,
      sub: payload.sub || '',
      instruction: payload.instruction || '',
      rect: payload.rect || null,
      contextId: payload.elCtx ? payload.elCtx.id : null,
      destinationLabel: route.label,
      destinationRef: route.dest ? { kind: route.dest.kind, refId: route.dest.refId,
        participantId: route.dest.participantId || null, runStatus: route.run.status } : null,
      /* BROWSER-002 / BSTALE-008: this payload is its own submission. The
         composer reconciler must not read it as a composer send, or an
         attachment sitting in the tray with no typed text is discarded. */
      isolatedSubmission: true,
      demo: true
    };
    /* B20-R04: when this send validated a compatible refresh, the actual
       refreshed dispatch DOM/style/geometry/source/generation is bound to the
       admitted message under the same projection name the ordinary commit
       hook uses — the original captured evidence stays immutable. */
    if (refreshNote && refreshNote.dispatched_context && payload.elCtx) {
      msg.browserDispatchedContexts = {};
      msg.browserDispatchedContexts[payload.elCtx.id] = clone2(refreshNote.dispatched_context);
    }
    ctx.appendMessage(msg, thread);
    /* The thread message is written once; a collaboration destination receives
       the reference through its own owner, mirroring the ordinary commit hook. */
    if (route.run) {
      var ROOM2 = window.PM56_ROOM;
      var buf2 = (RT.composer && typeof RT.composer.bufferFor === 'function') ? RT.composer.bufferFor(thread.id) : null;
      if (ROOM2 && typeof ROOM2.owns === 'function' && ROOM2.owns(route.run.id)) {
        var got = ROOM2.receiveUser(route.run.id, msg, { destination: route.dest }, thread);
        if (!got.ok) {
          ctx.addReceipt('bc-destination-refused', 'Run reference not recorded',
            'The room refused the reference (' + (got.error || 'refused') + ') after the thread message was written. The capture card above is intact; advance the room and resend.');
        }
      } else {
        var COL2 = window.PM56_COLLAB;
        COL2.appendMessage(route.run.id, { senderKind: 'user', senderName: 'You', messageType: 'message',
          body: refBody + ' (capture ' + msg.id + (msg.contextId ? ', context ' + msg.contextId : '') + ')',
          recipientIds: route.dest.participantId ? [route.dest.participantId] : [],
          createdAt: msg.sentAt });
        if (route.run.kind === 'chat_room' && route.run.chatRoom) {
          var p0 = null;
          for (var k = 0; k < (route.run.participants || []).length; k++) {
            if (!route.dest.participantId || route.run.participants[k].id === route.dest.participantId) { p0 = route.run.participants[k]; break; }
          }
          if (p0) COL2.appendMessage(route.run.id, { senderKind: 'participant', senderId: p0.id, senderName: p0.name,
            messageType: 'response', body: 'Noted — folding that into the current round rather than answering in isolation.' });
        }
      }
    }
    var rec = {
      id: msg.id, kind: payload.kind, at: msg.sentAt, label: payload.label,
      destinationLabel: msg.destinationLabel, destinationRef: msg.destinationRef,
      threadId: thread ? thread.id : null, contextId: msg.contextId, image: payload.image,
      refreshed: refreshNote ? { from: refreshNote.captured_generation, to: refreshNote.current_generation } : null,
      dispatched_context: (refreshNote && refreshNote.dispatched_context) ? clone2(refreshNote.dispatched_context) : null
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
    /* B20: render-durable demo mutations. `replaced` swaps one element's live
       component identity and content (same tag/locator/file); `duplicated`
       renders a second live node under the same locator. Both survive renders
       because they live in session state, not in hand-edited DOM. */
    var ov = (sess && sess.replaced && sess.replaced[def.id]) || null;
    var comp = ov ? ov.component : def.component;
    var picked = (P().pickedElId === def.id) ? ' is-bc-picked' : '';
    var attrs = ' data-bc-el data-bc-id="' + esc(def.id) + '" data-bc-component="' + esc(comp) + '"'
      + (def.file ? ' data-bc-file="' + esc(def.file) + '" data-bc-line="' + def.line + '" data-bc-col="' + def.col + '"' : '')
      + (def.role ? ' role="' + esc(def.role) + '"' : '');
    var pickAttr = (mode === 'component')
      ? ' data-action="bc-pick-el" data-id="' + esc(def.id) + '" tabindex="0" aria-label="' + esc('Pick ' + (comp || def.tag) + (def.text ? ': ' + def.text : '')) + '"'
      : '';
    var inner = ov ? ov.html : (def.text ? '<span class="bc-el-text">' + esc(def.text) + '</span>' : '');
    if (def.id === 'el-chart') {
      inner += '<span class="bc-sparkline">' + [38, 62, 45, 82, 56, 91, 68].map(function (h) {
        return '<i style="height:' + h + '%"></i>';
      }).join('') + '</span>';
    }
    if (!ov) {
      if (def.isRowHost) {
        var order = (sess.rowOrder && sess.rowOrder.length) ? sess.rowOrder : ROW_IDS_DEFAULT;
        for (var i = 0; i < order.length; i++) { var child = ELEMENT_BY_ID[order[i]]; if (child) inner += renderPageEl(child, mode, sess); }
      } else if (def.children && def.children.length) {
        for (var j = 0; j < def.children.length; j++) inner += renderPageEl(def.children[j], mode, sess);
      }
    }
    var out = '<' + def.tag + ' class="bc-el ' + esc(def.cls) + picked + '"' + attrs + pickAttr + '>' + inner + '</' + def.tag + '>';
    /* The duplicate twin keeps the same locator but takes no pick action of its
       own, so one pick target stays while the locator itself is ambiguous. */
    if (!ov && sess && sess.duplicated && sess.duplicated.indexOf(def.id) >= 0) {
      out += '<' + def.tag + ' class="bc-el ' + esc(def.cls) + '"' + attrs + '>' + inner + '</' + def.tag + '>';
    }
    return out;
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
      + '<button class="text-button" data-action="bc-verify-isolation">Verify isolation</button>.</p>'
      + renderAllowBanner(ctx);
  }
  /* B20: the explicit single-use allow for Ask-held actions. */
  function renderAllowBanner(ctx) {
    var hold = P().pendingAllow;
    if (!hold) return '';
    var heldCaps = hold.capabilities || [hold.capability];
    var heldLabel = heldCaps.map(function (c) { return CAP_LABEL[c] || c; }).join(' + ');
    return '<div class="bc-allow-banner" data-k="bc-allow-banner" role="alert">'
      + ctx.icon('lock', 12)
      + '<span><b>Held for approval</b> — ' + esc(hold.actionLabel) + ' (' + esc(heldLabel) + ' policy is Ask). Nothing was captured or sent.</span>'
      + '<button class="primary-button" data-action="bc-allow-once">Allow once</button>'
      + '<button class="soft-button" data-action="bc-deny-allow">Deny</button>'
      + '</div>';
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
    /* B20: an unknown recorded session is shown as gone, never as session one. */
    var liveSess = session(rec.session.id);
    var gone = !liveSess;
    var liveGen = gone ? null : liveSess.generation;
    var stale = !gone && rec.session.generationAtCapture < liveGen;
    var lastRv = (P().revalidationLog || {})[rec.id];
    var refresh = (P().refreshLog || {})[rec.id];
    return '<div class="bc-context-card" data-k="bc-context-card-' + esc(rec.id) + '">'
      + row('Component', esc(rec.component || ('<' + rec.tag + '>')))
      + row('Tag / role', esc(rec.tag) + (rec.role ? ' · ' + esc(rec.role) : ''))
      + row('Name / text', esc(rec.name || rec.text || '(none)'))
      + row('Session', esc(rec.session.label) + (gone ? ' <span class="bc-stale-tag">session gone</span>' : ''))
      + '<div class="bc-context-row"><label>Page</label><b>' + esc(rec.page.title) + '</b><span>' + esc(rec.page.url) + '</span></div>'
      + '<div class="bc-context-row"><label>Generation</label><b>' + rec.session.generationAtCapture + '</b>'
      + (gone ? '<span class="bc-stale-tag">session gone — no live generation</span>'
        : stale ? '<span class="bc-stale-tag">stale — page is now generation ' + liveGen + '</span>' : '<span class="bc-fresh-tag">current</span>') + '</div>'
      + row('Captured', esc(rec.capturedAt || 'unknown'))
      + row('Fingerprint', esc(rec.fingerprint || 'not recorded') + (rec.fingerprintPolicy ? ' <span class="bc-sub">' + esc(rec.fingerprintPolicy) + '</span>' : ''))
      + row('Last revalidation', lastRv ? esc(lastRv.result + (lastRv.reason ? ' · ' + lastRv.reason : '') + ' · gen ' + lastRv.captured_generation + '→' + lastRv.current_generation) : 'not yet revalidated')
      + (refresh ? row('Refreshed', 'generation ' + refresh.from + '→' + refresh.to + ' — original evidence kept; dispatch used a separately recorded context') : '')
      + row('Rect', rec.rect.w + '×' + rec.rect.h + ' @ (' + rec.rect.x + ',' + rec.rect.y + ')')
      + row('Source', rec.source.file ? esc(rec.source.file) + ':' + rec.source.line + ':' + rec.source.col : 'not reported')
      + row('Parent path', esc(rec.parentPath.join(' › ')))
      + (rec.style ? '<div class="bc-context-row"><label>Style</label><b>' + esc(rec.style.display) + ' · ' + esc(rec.style.font) + '</b><span>' + esc(rec.style.color) + ' on ' + esc(rec.style.background) + '</span></div>' : '')
      + '<div class="bc-context-row bc-locator-row"><label>Stable locator</label><b class="bc-mono">' + esc(rec.locator.value) + '</b><span class="bc-tag-stable">stable</span></div>'
      + '<div class="bc-context-row bc-locator-row"><label>Fragile locator</label><b class="bc-mono">' + esc(rec.fragileLocator.value || '(n/a)') + '</b><span class="bc-tag-fragile">position-based</span></div>'
      + '<div class="bc-context-row"><label>Bounded HTML</label><div class="code-block bc-html-block">' + esc(rec.boundedHtml) + '</div></div>'
      + row('Crop', rec.crop ? rec.crop.w + '×' + rec.crop.h : 'none — full element')
      + '<p class="bc-sub">demo:true — rect, style and HTML above are live measurements off the rendered fixture page; component/source labels are authored fixture metadata.</p>'
      + '<div class="bc-sim-row"><button class="soft-button" data-action="bc-simulate-rerender">' + ctx.icon('refresh', 12) + ' Simulate re-render</button>'
      + '<button class="soft-button" data-action="bc-simulate-replace" title="Replace the live element with an incompatible component (same tag and locator)">Replace live target</button>'
      + '<button class="soft-button" data-action="bc-simulate-duplicate" title="Render a second live node under the same locator">Duplicate locator</button></div>'
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
    var list = listRefsOf(refs);
    return '<div class="bc-list-manager" data-k="bc-list-manager">'
      + '<div class="bc-list-manager-head"><b>Composer list</b><span>' + refs.length + ' item' + (refs.length === 1 ? '' : 's') + ' in this draft — not the live follow-up queue</span></div>'
      + refs.map(function (r) {
        var inline = r.kind === 'inline';
        var at = inline ? -1 : list.indexOf(r);
        var staleTag = r.stale ? '<span class="bc-stale-tag" title="' + esc(r.stale.detail || r.stale.reason) + '">stale · ' + esc(String(r.stale.reason || '').replace(/_/g, ' ')) + '</span>' : '';
        return '<div class="bc-list-row' + (r.stale ? ' is-stale' : '') + '" data-k="bc-list-row-' + esc(r.id) + '">'
          + (inline ? '<span class="bc-list-chip">chip</span>' : '<span class="bc-list-num">' + (r.number || '') + '</span>')
          + '<span class="bc-list-label">' + esc(r.componentLabel) + '</span>'
          + staleTag
          + (r.stale ? '<button class="soft-button" data-action="bc-recapture-ref" data-id="' + esc(r.id) + '">Recapture</button>' : '')
          + (!inline ? '<input class="bc-list-instr" data-bc-input="list-instr" data-id="' + esc(r.id) + '" type="text" value="' + esc(r.instruction || '') + '" placeholder="Instruction" aria-label="Instruction for ' + esc(r.componentLabel) + '">' : '')
          + (!inline ? '<button class="icon-button" data-action="bc-list-move" data-id="' + esc(r.id) + '" data-dir="-1"' + (at <= 0 ? ' disabled' : '') + ' aria-label="Move up">' + ctx.icon('up', 11) + '</button>' : '')
          + (!inline ? '<button class="icon-button" data-action="bc-list-move" data-id="' + esc(r.id) + '" data-dir="1"' + (at < 0 || at >= list.length - 1 ? ' disabled' : '') + ' aria-label="Move down">' + ctx.icon('down', 11) + '</button>' : '')
          + '<button class="icon-button" data-action="bc-list-remove" data-id="' + esc(r.id) + '" aria-label="Remove">' + ctx.icon('close', 11) + '</button>'
          + '</div>';
      }).join('')
      + '<button class="soft-button" data-action="bc-freeze-snapshots" title="Freeze every live reference into an immutable snapshot for scheduling">Freeze ' + refs.length + ' for scheduling</button>'
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

  /* B20: clearing a selection supersedes it — the epoch advances so late results
     from the abandoned selection are discarded, not dispatched. */
  function clearPick() {
    P().picked = null; P().pickedElId = null; P().promptInstruction = ''; P().promptMenuOpen = false;
    P().recaptureRefId = null;
    bumpSelectionEpoch();
  }
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
     open), never used to silently disable a control ahead of time.
     B20 (BROWSER-008): ordinary sessions are gated by the per-capability policy at
     the same boundary. Off refuses; Ask holds for one explicit single-use allow;
     a permission or policy change between preparation and commit refuses. */
  var CAP_LABEL = { screenshots: 'Screenshots / recording', dom: 'DOM and components', console: 'Console' };
  function guardSession(ctx, actionLabel, capId) {
    var sess = session();
    if (!isProtected(sess)) return guardPolicy(ctx, actionLabel, capId || 'screenshots');
    var reason = 'The protected authentication browser is human-only. ' + actionLabel + ' is refused here — it is excluded from agent capture, DevTools, Back Seat Driver review, and persistence.';
    ctx.toast('Refused — human-only session', reason);
    ctx.addReceipt('bc-refused', 'Refused · ' + actionLabel, reason);
    P().refusals.push({ id: seq('bcref-x'), at: nowIso(), actionLabel: actionLabel, reason: reason, sessionId: sess.id });
    ctx.renderApp();
    return false;
  }
  function guardPolicy(ctx, actionLabel, capId) {
    var v = (P().policy || {})[capId];
    if (v == null) v = 'on';
    if (v === 'on') return true;
    if (v === 'off') {
      var reason = (CAP_LABEL[capId] || capId) + ' policy is Off. ' + actionLabel + ' is refused — change the policy in the DevTools tab to run it.';
      ctx.toast('Refused — policy Off', reason);
      ctx.addReceipt('bc-refused', 'Refused · ' + actionLabel, reason);
      P().refusals.push({ id: seq('bcref-x'), at: nowIso(), actionLabel: actionLabel, capability: capId, reason: reason, sessionId: session().id });
      ctx.renderApp();
      return false;
    }
    /* Ask: a live single-use grant is consumed silently; otherwise hold for an
       explicit allow. The hold records its preparation so a permission or policy
       change before the allow expires it. B20-R3-F2: grants are a per-capability
       set (null when empty) so sibling approvals never overwrite each other;
       holds carry the full outstanding set with single-cap aliases kept. */
    if (P().allowOnce && P().allowOnce[capId]) {
      delete P().allowOnce[capId];
      if (!Object.keys(P().allowOnce).length) P().allowOnce = null;
      return true;
    }
    var already = P().pendingAllow && (P().pendingAllow.capability === capId
      || (P().pendingAllow.capabilities && P().pendingAllow.capabilities.indexOf(capId) >= 0));
    P().pendingAllow = { capability: capId, capabilities: [capId], actionLabel: actionLabel, at: nowIso(),
      permissions: ctx.state.permissions, policy: v, policies: {} };
    P().pendingAllow.policies[capId] = v;
    ctx.toast('Approval needed', actionLabel + ' needs a one-time allow (' + (CAP_LABEL[capId] || capId) + ' policy is Ask). Use Allow once below, then run the action again.');
    if (!already) ctx.addReceipt('bc-allow-hold', 'Held · ' + actionLabel, 'Policy Ask holds this action until you explicitly allow it once. Nothing was captured or sent.');
    ctx.renderApp();
    return false;
  }
  /* A gate snapshot is taken by an action right after its guard passes and handed
     to the effect helper, which re-checks it at the commit boundary. */
  function gateSnapshot(ctx, capId) {
    return { capability: capId, permissions: ctx.state.permissions,
      policy: (P().policy || {})[capId] == null ? 'on' : P().policy[capId] };
  }
  function checkAttempt(ctx, gate, actionLabel) {
    if (!gate) return true;
    /* B20-R03: gates may cover one capability (legacy single shape) or the
       full intersection an operation needs. Every covered capability and the
       permission identity must be unchanged since preparation. */
    var caps = gate.capabilities || [gate.capability];
    var cur = gateSnapshotCaps(ctx, caps);
    var same = cur.permissions === gate.permissions && caps.every(function (c) {
      var before = gate.policies ? gate.policies[c] : gate.policy;
      return cur.policies[c] === before;
    });
    if (!same) {
      var reason = 'Permissions or policy changed between preparation and commit. ' + actionLabel + ' is refused — run it again under the current settings.';
      ctx.toast('Refused — settings changed', reason);
      ctx.addReceipt('bc-refused', 'Refused · ' + actionLabel, reason);
      P().refusals.push({ id: seq('bcref-x'), at: nowIso(), actionLabel: actionLabel, capability: caps.join('+'), reason: reason, sessionId: session().id });
      ctx.renderApp();
      return false;
    }
    return true;
  }
  /* B20-R03: guard every capability an operation actually needs. A screenshots
     grant is not a DOM grant: component dispatch re-reads and shares live DOM
     content, so DOM Off/Ask governs it however screenshots is set.
     B20-R3-F2: one operation resolves its FULL required set together. Off
     refuses terminally; Ask caps without a grant hold as one set; grants are
     consumed only after every cap passes, at this successful admission
     boundary — never one-by-one before the sibling approval exists. */
  function guardSessionCaps(ctx, actionLabel, capIds) {
    var sess = session();
    if (isProtected(sess)) return guardSession(ctx, actionLabel, capIds[0]);
    if (capIds.length === 1) return guardPolicy(ctx, actionLabel, capIds[0]);
    var i, v;
    for (i = 0; i < capIds.length; i++) {
      v = (P().policy || {})[capIds[i]];
      if (v == null) v = 'on';
      if (v === 'off') { guardPolicy(ctx, actionLabel, capIds[i]); return false; }
    }
    var missing = capIds.filter(function (c) {
      var pv = (P().policy || {})[c];
      if (pv == null) pv = 'on';
      if (pv !== 'ask') return false;
      return !(P().allowOnce && P().allowOnce[c]);
    });
    if (missing.length) {
      var prev = P().pendingAllow;
      var sameHold = prev && prev.capabilities && prev.capabilities.length === missing.length
        && missing.every(function (c) { return prev.capabilities.indexOf(c) >= 0; });
      var labels = missing.map(function (c) { return CAP_LABEL[c] || c; }).join(' + ');
      P().pendingAllow = { capability: missing[0], capabilities: missing.slice(), actionLabel: actionLabel,
        at: nowIso(), permissions: ctx.state.permissions, policy: 'ask', policies: {} };
      missing.forEach(function (c) { P().pendingAllow.policies[c] = 'ask'; });
      ctx.toast('Approval needed', actionLabel + ' needs a one-time allow (' + labels + ' policy is Ask). Use Allow once below, then run the action again.');
      if (!sameHold) ctx.addReceipt('bc-allow-hold', 'Held · ' + actionLabel, 'Policy Ask holds this action until you explicitly allow it once. Nothing was captured or sent.');
      ctx.renderApp();
      return false;
    }
    if (P().allowOnce) {
      capIds.forEach(function (c) { delete P().allowOnce[c]; });
      if (!Object.keys(P().allowOnce).length) P().allowOnce = null;
    }
    return true;
  }
  function gateSnapshotCaps(ctx, capIds) {
    var g = { capabilities: capIds.slice(), permissions: ctx.state.permissions, policies: {} };
    for (var i = 0; i < capIds.length; i++) {
      g.policies[capIds[i]] = (P().policy || {})[capIds[i]] == null ? 'on' : P().policy[capIds[i]];
    }
    return g;
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
        componentLabel: rec.component || ('<' + rec.tag + '>'), instruction: '', contextId: rec.id, addedAt: nowIso(),
        token: token });
    }
    writeComposerText(ctx, tid, next, start + token.length);
  }

  function finishRegionDrag(ctx, left, top, w, h, prep) {
    if (w < 6 || h < 6) return;   /* too small to be an intentional crop */
    /* B20: the drag spans time, so the commit re-checks the preparation gate
       and the epoch/revision fence. A stale result is discarded, not sent. */
    if (prep && !checkAttempt(ctx, prep.gate, 'Region Screenshot')) { P().mode = null; ctx.renderApp(); return; }
    if (prep) {
      var fence = acceptLateResolution({ epoch: prep.epoch, threadId: prep.threadId, bufferRevision: prep.rev });
      if (!fence.ok) {
        ctx.toast('Region result discarded', 'The selection or composer changed mid-drag (' + fence.error.replace(/_/g, ' ') + '). Nothing was sent.');
        ctx.addReceipt('bc-discarded', 'Region result discarded', 'Stale asynchronous result discarded, not dispatched: ' + fence.error + '.');
        P().mode = null;
        ctx.renderApp();
        return;
      }
    }
    var scale = w > 480 ? 480 / w : 1;
    var iw = Math.max(60, Math.round(w * scale)), ih = Math.max(40, Math.round(h * scale));
    var sub = Math.round(w) + '×' + Math.round(h) + ' px crop at (' + Math.round(left) + ',' + Math.round(top) + ')';
    var image = fixtureImage({ w: iw, h: ih, label: 'Region Screenshot', sub: sub, stamp: new Date().toLocaleTimeString() });
    var sent = sendIsolatedCapture(ctx, { kind: 'region', image: image, w: iw, h: ih, label: 'Region Screenshot', sub: sub,
      rect: { x: Math.round(left), y: Math.round(top), w: Math.round(w), h: Math.round(h) },
      gate: (prep && prep.gate) || gateSnapshot(ctx, 'screenshots') });
    P().mode = null;
    ctx.renderApp();
    if (sent) ctx.toast('Region screenshot sent', 'Sent to ' + sent.destinationLabel + '.');
  }
  function bufferRevisionOf(tid) {
    var CS = window.PM56_COMPOSER_STATE;
    return (CS && typeof CS.revision === 'function') ? CS.revision(tid) : null;
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
    if (!guardSession(ctx, 'Full Screenshot', 'screenshots')) return true;
    var gate = gateSnapshot(ctx, 'screenshots');
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
    var sent = sendIsolatedCapture(ctx, { kind: which, image: image, w: iw, h: ih, label: label, sub: sub, rect: { x: 0, y: 0, w: Math.round(W), h: Math.round(H) }, gate: gate });
    P().mode = null;
    ctx.renderApp();
    if (sent) ctx.toast('Full screenshot sent', 'Sent to ' + sent.destinationLabel + '.');
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
    if (!guardSession(ctx, 'DevTools', 'console')) return true;
    cancelTransient();
    P().mode = 'devtools';
    P().railTab = 'devtools';
    ctx.renderApp();
    return true;
  });
  EXT.action('bc-pick-el', function (ctx, btn) {
    if (P().mode !== 'component') return true;
    if (!guardSession(ctx, 'Select Component', 'dom')) return true;
    var id = btn.dataset.id;
    var target = document.querySelector('[data-bc-id="' + cssEsc(id) + '"]');
    if (!target) return true;
    var rec = buildElementContext(target);
    P().contexts.push(rec);
    P().picked = rec;
    P().pickedElId = id;
    /* A recapture preserves the stale item's instruction; a fresh pick starts empty. */
    if (!P().recaptureRefId) P().promptInstruction = '';
    P().promptMenuOpen = false;
    P().viewingContextId = null;
    P().railTab = 'details';
    bumpSelectionEpoch();
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
  /* B20 (BSTALE-004): a recapture replaces the stale ref's identity in place —
     same list number or same chip position — instead of appending a duplicate. */
  function replaceRefForRecapture(ctx, refId, elCtx, instruction) {
    var tid = ctx.state.selectedThread;
    var buf = currentBuffer(ctx);
    if (!buf || !buf.browser_context_refs) return false;
    var prevRefs = snapshotListRefs(buf.browser_context_refs);
    var at = -1;
    for (var i = 0; i < buf.browser_context_refs.length; i++) {
      if (buf.browser_context_refs[i].id === refId) { at = i; break; }
    }
    if (at < 0) return false;
    var ref = buf.browser_context_refs[at];
    ref.contextId = elCtx.id;
    ref.componentLabel = elCtx.component || ('<' + elCtx.tag + '>');
    if (instruction) ref.instruction = instruction;
    delete ref.stale;
    if (ref.kind === 'inline') {
      var next = '[' + (elCtx.component || ('<' + elCtx.tag + '>')) + (elCtx.name ? ' "' + elCtx.name + '"' : '') + ']';
      if (ref.token && ctx.state.composer && ctx.state.composer.indexOf(ref.token) >= 0) {
        ctx.state.composer = ctx.state.composer.replace(ref.token, next);
        if (ctx.state.drafts) ctx.state.drafts[tid] = ctx.state.composer;
      }
      ref.token = next;
    }
    P().recaptureRefId = null;
    bumpSelectionEpoch();
    applyListRefs(ctx, tid, prevRefs);
    return true;
  }
  EXT.action('bc-prompt-run', function (ctx) {
    var picked = P().picked;
    if (!picked) return true;
    var mode = P().componentMode;
    if (mode === 'send') {
      /* B20-R03: a component send re-reads live DOM and shares it, so it needs
         the DOM grant as well as the screenshots grant. */
      if (!guardSessionCaps(ctx, 'Send Now', ['dom', 'screenshots'])) return true;
      var target = document.querySelector('[data-bc-id="' + cssEsc(picked.stableId) + '"]');
      var rect = target ? target.getBoundingClientRect() : null;
      var rw = rect ? Math.round(rect.width) : picked.rect.w, rh = rect ? Math.round(rect.height) : picked.rect.h;
      var image = fixtureImage({ w: 240, h: 140, label: 'Component · ' + (picked.component || picked.tag), sub: rw + '×' + rh + ' px', stamp: new Date().toLocaleTimeString() });
      var sent = sendIsolatedCapture(ctx, { kind: 'component', image: image, w: 240, h: 140,
        label: 'Component · ' + (picked.component || picked.tag), sub: picked.name || picked.text || '',
        instruction: P().promptInstruction, rect: picked.rect, elCtx: picked,
        gate: gateSnapshotCaps(ctx, ['dom', 'screenshots']) });
      /* B20: success feedback follows the accepted result only. A refusal keeps
         the selected component and instruction for recapture. */
      if (!sent) { ctx.renderApp(); return true; }
      ctx.toast('Component sent', 'Sent to ' + sent.destinationLabel + '.');
    } else if (mode === 'list') {
      if (P().recaptureRefId && replaceRefForRecapture(ctx, P().recaptureRefId, picked, P().promptInstruction)) {
        ctx.toast('Recaptured', 'The stale item now points at the component you just picked. Nothing was sent yet.');
      } else {
        addToComposerList(ctx, picked, P().promptInstruction);
        var buf = currentBuffer(ctx);
        var n = buf ? listRefsOf(buf.browser_context_refs).length : '?';
        ctx.toast('Added to composer list', 'Item #' + n + ' — not sent yet, and not the live follow-up queue.');
      }
    } else if (mode === 'insert') {
      if (P().recaptureRefId && replaceRefForRecapture(ctx, P().recaptureRefId, picked, P().promptInstruction)) {
        ctx.toast('Recaptured', 'The stale chip now points at the component you just picked. Nothing was sent yet.');
      } else {
        insertComponentAtCursor(ctx, picked);
        ctx.toast('Inserted at cursor', 'A component reference was inserted. Nothing was sent.');
      }
    }
    clearPick();
    ctx.renderApp();
    return true;
  });
  /* B20 (BSTALE-004): recapture reuses the one component picker — no
     `cmd.browser.component.recapture` is minted. The stale item's instruction
     and position are preserved; the re-pick replaces its identity. */
  EXT.action('bc-recapture-ref', function (ctx, btn) {
    var buf = currentBuffer(ctx);
    var refs = (buf && buf.browser_context_refs) || [];
    var ref = null;
    for (var i = 0; i < refs.length; i++) if (refs[i].id === btn.dataset.id) ref = refs[i];
    if (!ref) return true;
    cancelTransient();
    P().recaptureRefId = ref.id;
    P().promptInstruction = ref.instruction || '';
    if (!ctx.state.dialog || ctx.state.dialog.type !== 'bc-browser') ctx.openDialog({ type: 'bc-browser' });
    P().mode = 'component';
    P().railTab = 'details';
    bumpSelectionEpoch();
    ctx.toast('Recapture', 'Pick the component again in the same picker; your instruction is kept and nothing is sent until you run it.');
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
    if (!guardSession(ctx, 'Simulate re-render', 'dom')) return true;
    var sess = session();
    /* A fresh render restores authored content, clearing earlier demo
       replacements/duplications so the page is exercisable again. */
    var clearedDemo = (sess.replaced && Object.keys(sess.replaced).length) || (sess.duplicated && sess.duplicated.length);
    sess.replaced = {}; sess.duplicated = [];
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
    var epoch = selectionEpoch();
    ctx.renderApp();
    requestAnimationFrame(function () {
      /* B20: the late note is fenced — a superseded selection must not have a
         stale resolution narrative attached to it. */
      if (epoch !== selectionEpoch()) return;
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
        note = { resolved: true, text: 'Page re-rendered: row order shuffled and generation advanced to ' + sess.generation + '.' + (clearedDemo ? ' Earlier demo replacements/duplications were cleared.' : '') + ' Pick a component to see its locator re-resolve.' };
      }
      P().lastRerenderNote = note;
      var c = ctxNow();
      if (c) c.renderApp();
    });
    return true;
  });
  /* B20: ordinary fixture controls that make the CURRENT record's target
     incompatible (replaced component) or ambiguous (duplicated locator) in the
     live DOM, so re-render/hold/recapture flows are exercisable through normal
     controls. They mutate only the demo page, never the retained capture. */
  EXT.action('bc-simulate-replace', function (ctx) {
    if (!guardSession(ctx, 'Simulate component replace', 'dom')) return true;
    var rec = currentDetailsRecord();
    if (!rec || !rec.stableId) { ctx.toast('Nothing to replace', 'Pick a component first.'); return true; }
    var sess = session();
    sess.replaced = sess.replaced || {};
    sess.generation += 1;
    sess.replaced[rec.stableId] = { component: '<ReplacedComponent>', atGeneration: sess.generation,
      html: '<span class="bc-el-text">Replaced at generation ' + sess.generation + '</span>' };
    bumpSelectionEpoch();
    ctx.toast('Component replaced', 'The live element kept its tag and locator but is now a different component. Sends against the old capture will hold as stale.');
    ctx.renderApp();
    return true;
  });
  EXT.action('bc-simulate-duplicate', function (ctx) {
    if (!guardSession(ctx, 'Simulate duplicate locator', 'dom')) return true;
    var rec = currentDetailsRecord();
    if (!rec || !rec.stableId) { ctx.toast('Nothing to duplicate', 'Pick a component first.'); return true; }
    var sess = session();
    sess.duplicated = sess.duplicated || [];
    if (sess.duplicated.indexOf(rec.stableId) < 0) sess.duplicated.push(rec.stableId);
    /* B20-R01: duplicating the locator mutates the page, so the recorded
       generation advances like every other page mutation. */
    sess.generation += 1;
    bumpSelectionEpoch();
    ctx.toast('Locator duplicated', 'Two live elements now share the locator. Sends against the capture will hold as ambiguous until the page changes.');
    ctx.renderApp();
    return true;
  });
  /* B20: the explicit single-use allow for Ask-held actions. The hold's
     preparation is re-checked: a permission or policy change expires it. */
  EXT.action('bc-allow-once', function (ctx) {
    var hold = P().pendingAllow;
    if (!hold) return true;
    /* B20-R3-F2: one explicit allow grants the whole held set together, so a
       two-capability operation can complete; every held cap is still fenced by
       the permission/policy identity recorded at hold time. */
    var caps = hold.capabilities || [hold.capability];
    var expired = ctx.state.permissions !== hold.permissions || caps.some(function (c) {
      var before = hold.policies ? hold.policies[c] : hold.policy;
      return ((P().policy || {})[c] || 'on') !== before;
    });
    if (expired) {
      P().pendingAllow = null;
      ctx.toast('Approval expired', 'Permissions or policy changed while the action was held. Run it again to hold a fresh approval.');
      ctx.renderApp();
      return true;
    }
    P().pendingAllow = null;
    P().allowOnce = P().allowOnce || {};
    caps.forEach(function (c) { P().allowOnce[c] = { at: nowIso() }; });
    ctx.toast('Allowed once', hold.actionLabel + ' may run one time. Run the action again; the grant is consumed, not blanket.');
    ctx.renderApp();
    return true;
  });
  EXT.action('bc-deny-allow', function (ctx) {
    P().pendingAllow = null;
    ctx.toast('Not allowed', 'The held action stays refused. Nothing was captured or sent.');
    ctx.renderApp();
    return true;
  });
  /* B20 (BSTALE-007): freeze live refs into immutable snapshots through the
     shared artifact owner. Whole-selection bound: every ref must resolve to a
     current (or refreshably compatible) context or nothing is frozen. A live
     selector is never scheduled; the schedule form keeps refusing live refs. */
  EXT.action('bc-freeze-snapshots', function (ctx) {
    /* B20-R03: freezing retains live DOM and a capture preview, so it needs
       the DOM grant as well as the screenshots grant. */
    if (!guardSessionCaps(ctx, 'Freeze browser snapshots', ['dom', 'screenshots'])) return true;
    var prepGate = gateSnapshotCaps(ctx, ['dom', 'screenshots']);
    var tid = ctx.state.selectedThread;
    var buf = currentBuffer(ctx);
    var refs = (buf && buf.browser_context_refs) || [];
    if (!refs.length) { ctx.toast('Nothing to freeze', 'The composer holds no browser references.'); return true; }
    var A = window.PM56_ARTIFACTS;
    var scope = (window.PM56_GOAL && typeof window.PM56_GOAL.scope === 'function') ? window.PM56_GOAL.scope(tid) : null;
    if (!A || !scope) {
      ctx.toast('Freeze unavailable', 'The shared artifact owner or thread scope is missing; live refs stay live and unscheduled.');
      return true;
    }
    var prevRefs = snapshotListRefs(refs);
    var items = [];
    for (var i = 0; i < refs.length; i++) {
      var ref = refs[i];
      var rec = ref.contextId ? findContext(ref.contextId) : null;
      if (!rec) {
        ctx.toast('Freeze refused', (ref.componentLabel || 'A reference') + ' no longer has its captured context in this session. Recapture it first; nothing was frozen.');
        ctx.addReceipt('bc-freeze-refused', 'Freeze refused — context missing', 'Nothing was frozen and the composer is unchanged.');
        return true;
      }
      if (rec.session && rec.session.id && session(rec.session.id) && session(rec.session.id).protectedAuth) {
        ctx.toast('Freeze refused', 'Protected-session content is never frozen. Nothing was frozen.');
        return true;
      }
      var rv = revalidateContext(rec);
      if (rv.result !== 'current' && rv.result !== 'refreshed') {
        ctx.toast('Freeze refused — stale reference', (ref.componentLabel || 'A reference') + ' is ' + rv.reason.replace(/_/g, ' ') + '. Recapture it first; nothing was frozen and no partial snapshot was kept.');
        ctx.addReceipt('bc-freeze-refused', 'Freeze refused — stale reference', 'Reason: ' + rv.reason + '. Recapture through ' + rv.recapture_action + ', then freeze again. Nothing was frozen.');
        return true;
      }
      items.push({ ref: ref, rec: rec, rv: rv });
    }
    if (!checkAttempt(ctx, prepGate, 'Freeze browser snapshots')) return true;
    /* B20-R07: the multi-publish commits inside the existing shared command
       transaction. Each publish joins the open transaction, so any refusal
       rolls back only this operation's new artifacts and a clean retry works. */
    var TX = window.PM56_TX;
    if (!TX || typeof TX.run !== 'function') {
      ctx.toast('Freeze unavailable', 'The shared command transaction is missing; live refs stay live and unscheduled rather than freezing partially.');
      return true;
    }
    var frozen = TX.run(function () {
      var staged = [];
      for (var k = 0; k < items.length; k++) {
        var it = items[k], fresh = it.rv.result === 'refreshed' && it.rv.dispatched_context ? it.rv.dispatched_context : null;
      /* The tray chip keeps the full descriptive name. Its hover chrome
         measures 226px exactly like every B19 chip (shared tray owner); the
         resulting narrow-composer overflow is the carried inherited failure,
         pinned exactly by the schedule narrow shots, not a B20 regression. */
      var aid = 'snapshot:' + tid + ':' + it.ref.id;
      var payload = {
        schema: 'pm.concept.browser_snapshot.v1',
        frozen_at: nowIso(),
        ref_kind: it.ref.kind || 'list',
        instruction: it.ref.instruction || '',
        frozen_session: { id: it.rec.session.id, label: it.rec.session.label },
        frozen_page: { url: it.rec.page.url, title: it.rec.page.title, frame: it.rec.page.frame },
        frozen_generation: fresh ? fresh.generation : it.rec.session.generationAtCapture,
        locator: it.rec.locator,
        tag: it.rec.tag, role: it.rec.role, component: it.rec.component,
        source: fresh ? fresh.source : it.rec.source,
        rect: fresh ? fresh.rect : it.rec.rect,
        style: fresh ? fresh.style : it.rec.style,
        parent_path: it.rec.parentPath,
        /* Real measurements retained: the bounded DOM, not pixels. The fixture
           preview below carries the same honesty label as every capture. */
        frozen_dom: fresh ? fresh.dom : normalizedHtmlForRecord(it.rec),
        fingerprint: it.rec.fingerprint || null,
        fingerprint_policy: FP_POLICY,
        captured_at: it.rec.capturedAt,
        fixture_preview: {
          disclosure: 'FIXTURE IMAGE — not a real screenshot',
          image: fixtureImage({ w: 240, h: 140, label: 'Frozen · ' + (it.rec.component || it.rec.tag), sub: 'retained snapshot', stamp: new Date().toLocaleTimeString() })
        }
      };
      var record = { artifact_id: aid, artifact_version: 1, project_id: scope.projectId, thread_id: scope.threadId,
        renderer_kind: 'browser_snapshot', title: 'Browser snapshot · ' + (it.ref.componentLabel || it.rec.component || it.rec.tag),
        payload: payload, source_ref: { browser_ref_id: it.ref.id, context_id: it.rec.id, source: 'frozen_live_browser_context' },
        scan_status: 'not_scanned' };
        var pub = A.publish(record);
        if (!pub.ok) TX.fail(pub.error || 'freeze_publish_refused');
        var sref = { artifact_id: aid, artifact_version: 1, project_id: scope.projectId, thread_id: scope.threadId };
        staged.push({ id: 'bcsnap-' + it.ref.id, name: record.title, kind: 'capture', origin: 'browser_capture',
          command: 'cmd.chat.attachment.add', source_path: 'browser_freeze', semantic_kind: 'file',
          process_state: 'ready', snapshot_ref: sref, artifact_ref: { artifact_id: aid, artifact_version: 1, project_id: scope.projectId, thread_id: scope.threadId },
          content_hash: pub.revision.content_key, folder_manifest_hash: null, browser_snapshot: true,
          frozen_browser_ref: { ref_id: it.ref.id, kind: it.ref.kind || 'list', instruction: it.ref.instruction || '' } });
      }
      return { ok: true, attachments: staged };
    });
    if (!frozen.ok) {
      var rolledBack = !frozen.rollback || frozen.rollback.complete !== false;
      ctx.toast('Freeze failed — rolled back', 'The shared artifact owner refused a snapshot (' + (frozen.error || 'refused') + '). '
        + (rolledBack ? 'Nothing was kept and the composer is unchanged; retry the same freeze.' : 'Rollback reported conflicts; inspect retained artifacts before retrying.'));
      ctx.addReceipt('bc-freeze-failed', 'Freeze failed — rolled back',
        'Reason: ' + (frozen.error || 'refused') + '. ' + (rolledBack ? 'No partial snapshot was kept; live refs and the composer are unchanged.' : 'Rollback conflicts: ' + JSON.stringify((frozen.rollback || {}).conflicts || [])));
      ctx.renderApp();
      return true;
    }
    var attachments = frozen.attachments;
    /* All snapshots published: convert the buffer (live refs out, retained
       attachments in) and remove the derived block text and inline tokens. */
    var oldText = ctx.state.composer || '';
    for (var t = 0; t < refs.length; t++) {
      if (refs[t].kind === 'inline' && refs[t].token && oldText.indexOf(refs[t].token) >= 0) {
        oldText = oldText.replace(refs[t].token, '');
      }
    }
    ctx.state.composer = oldText;
    if (ctx.state.drafts) ctx.state.drafts[tid] = oldText;
    buf.browser_context_refs = [];
    buf.attachments = (buf.attachments || []).concat(attachments);
    bumpSelectionEpoch();
    applyListRefs(ctx, tid, prevRefs);
    var trimmed = (ctx.state.composer || '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/\s+$/, '');
    if (trimmed !== ctx.state.composer) writeComposerText(ctx, tid, trimmed, trimmed.length);
    ctx.toast('Browser snapshots frozen', attachments.length + ' retained snapshot' + (attachments.length === 1 ? '' : 's') + ' ready. Open Schedule Message to commit; dispatch resolves these bytes only.');
    ctx.addReceipt('bc-frozen', 'Browser snapshots frozen', attachments.length + ' immutable snapshot(s) retained in the shared artifact owner: '
      + attachments.map(function (a) { return a.snapshot_ref.artifact_id; }).join(', ') + '. Live refs are cleared; dispatch never re-resolves a live selector.');
    ctx.renderApp();
    return true;
  });
  /* The retained DOM for a never-refreshed record is its captured bounded HTML
     (already a plain string); refreshed records carry the live rebuild. */
  function normalizedHtmlForRecord(rec) { return rec.boundedHtml || ''; }
  /* B20: the shared artifact owner renders and exports frozen browser snapshots.
     Retained bytes are the measured DOM/source/rect — never a live re-resolve —
     and the preview keeps its fixture disclosure. */
  (function registerBrowserSnapshotRenderer() {
    var A = window.PM56_ARTIFACTS;
    if (!A || !A.registerRenderer || A.kinds().indexOf('browser_snapshot') >= 0) return;
    A.registerRenderer('browser_snapshot', function (q) {
      var p = q.payload || {};
      var src = p.source || {};
      function ro(k, v) { return '<div class="bc-context-row"><label>' + esc(k) + '</label><b>' + v + '</b></div>'; }
      return '<p class="snapshot-note">Frozen browser context · retained ' + esc(p.frozen_at || 'unknown time') + ' · no live selector is resolved at dispatch</p>'
        + '<div class="bc-context-card">'
        + ro('Component', esc(p.component || ('<' + (p.tag || '?') + '>')))
        + ro('Page', esc((p.frozen_page || {}).title || '') + ' · ' + esc((p.frozen_page || {}).url || ''))
        + ro('Generation', esc(String(p.frozen_generation == null ? '?' : p.frozen_generation)))
        + ro('Locator', '<span class="bc-mono">' + esc((p.locator || {}).value || '') + '</span>')
        + ro('Source', src.file ? esc(src.file) + ':' + src.line + ':' + src.col : 'not reported')
        + ro('Rect', p.rect ? (p.rect.w + '×' + p.rect.h + ' @ (' + p.rect.x + ',' + p.rect.y + ')') : 'none')
        + (p.instruction ? ro('Instruction', esc(p.instruction)) : '')
        + '<div class="bc-context-row"><label>Retained DOM</label><div class="code-block bc-html-block">' + esc(p.frozen_dom || '') + '</div></div>'
        + '</div>'
        + (p.fixture_preview && p.fixture_preview.image ? '<img class="bc-capture-img" src="' + p.fixture_preview.image + '" alt="Frozen browser preview" width="240" height="140"><p class="bc-fixture-note">Fixture image — not a real screenshot.</p>' : '');
    });
    A.registerExporter('browser_snapshot', function (q) {
      var text = JSON.stringify({ schema: 'pm.concept.browser_snapshot_bundle.v1', snapshot: q }, null, 2);
      /* B20-R06: real UTF-8 encoding through the shared artifact owner. The old
         per-code-unit low-byte truncation destroyed every non-ASCII character. */
      var bytes = new TextEncoder().encode(text);
      return { name: 'browser-snapshot-v' + q.artifact_version + '.json', bytes: bytes, mime: 'application/json' };
    });
  })();
  EXT.action('bc-list-remove', function (ctx, btn) { removeFromComposerList(ctx, btn.dataset.id); ctx.renderApp(); return true; });
  EXT.action('bc-list-move', function (ctx, btn) { moveInComposerList(ctx, btn.dataset.id, Number(btn.dataset.dir)); ctx.renderApp(); return true; });

  /* The critical negative-path proof (BROWSER-002). Runs the exact production send
     path with a synthetic fixture and records the composer text before/after as a
     durable, re-readable receipt rather than asking anyone to trust a comment. */
  EXT.action('bc-verify-isolation', function (ctx) {
    /* B20: this API entry enforces the same gate as the buttons. */
    if (!guardSession(ctx, 'Verify isolation', 'screenshots')) return true;
    var ta = composerEl();
    var before = ta ? ta.value : (ctx.state.composer || '');
    var image = fixtureImage({ w: 220, h: 130, tone: themeAccent2(), label: 'Isolation check', sub: 'synthetic capture', stamp: new Date().toLocaleTimeString() });
    var proved = sendIsolatedCapture(ctx, { kind: 'visible', image: image, w: 220, h: 130,
      label: 'Isolation check — synthetic capture', sub: 'Produced only to prove the send path never reads the composer.', rect: null,
      gate: gateSnapshot(ctx, 'screenshots') });
    if (!proved) {
      P().isolationChecks.push({ id: seq('bciso'), at: nowIso(), before: before, after: before, unchanged: true, note: 'not run — the send was refused (see refusal above)' });
      ctx.renderApp();
      return true;
    }
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
    if (!guardSession(c, 'Region Screenshot', 'screenshots')) return;
    var surface = layer.parentElement;
    var sr = surface.getBoundingClientRect();
    var box = layer.querySelector('[data-k="bc-sel-box"]');
    var x0 = clampNum(e.clientX - sr.left, 0, sr.width), y0 = clampNum(e.clientY - sr.top, 0, sr.height);
    /* B20: snapshot the gate + fence at drag-start; the mouseup commit verifies. */
    drag = { x0: x0, y0: y0, sr: sr, box: box,
      gate: gateSnapshot(c, 'screenshots'), epoch: selectionEpoch(),
      threadId: c.state.selectedThread, rev: bufferRevisionOf(c.state.selectedThread) };
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
      finishRegionDrag(cc, left, top, w, h, d);
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
  /* B20: list instruction edits commit on change (blur/Enter), not per keystroke,
     so the block rebuild never fights the caret. */
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t || !t.getAttribute || t.getAttribute('data-bc-input') !== 'list-instr') return;
    var c = ctxNow(); if (!c) return;
    editListInstruction(c, t.getAttribute('data-id'), t.value);
    var c2 = ctxNow(); if (c2) c2.renderApp();
  });

  /* =====================================================================
     17. COMPOSER CONTRACT HOOKS
     ===================================================================== */
  /* B20 (BSTALE-001..006): the pre-admission veto. Every ordinary send path funnels
     through app.js `deliverSend` (Send button, Cmd/Ctrl+Enter, targeted send,
     deferred queue Send-now, /goal, Plan revision), which consults validators
     BEFORE any admission. Each
     hidden ref is revalidated independently; one stale item blocks the whole
     submission (a partial list is never sent without an explicit recapture or
     removal), stays visible and marked, and the composer is preserved. */
  function preSendVeto(ctx, thread, raw) {
    var tid = thread && thread.id;
    var buf = (RT.composer && typeof RT.composer.bufferFor === 'function') ? RT.composer.bufferFor(tid) : null;
    var refs = (buf && buf.browser_context_refs) || [];
    if (!refs.length) return false;
    /* B20-R03: admitting refs re-reads and shares live DOM content, so the DOM
       grant is enforced here too. Policy-only (not session-based): refs span
       recorded sessions, and protected content is refused per-ref below. */
    if (!guardPolicy(ctx, 'Send with browser references', 'dom')) {
      return { claimed: true, preserveComposer: true };
    }
    pruneDetachedRefs(ctx, buf, raw);
    refs = buf.browser_context_refs || [];
    if (!refs.length) return false;
    var results = refs.map(function (r) {
      var rec = r.contextId ? findContext(r.contextId) : null;
      var res = rec ? revalidateContext(rec) : {
        schema: 'pm.browser.component_revalidation_result.v1', attachment_id: r.contextId || null,
        captured_generation: null, current_generation: null, locator_result_count: 0,
        identity_match: false, result: 'stale_capture', reason: 'context_missing',
        detail: 'The captured context is no longer in this session (for example after a reload). Recapture the component.',
        recapture_action: 'cmd.browser.component.pick'
      };
      return { ref: r, rec: rec, res: res, ok: res.result === 'current' || res.result === 'refreshed' };
    });
    var bad = results.filter(function (x) { return !x.ok; });
    if (!bad.length) {
      /* All current: carry refreshed dispatch contexts to the commit stamp. */
      P().pendingDispatchContexts = {};
      results.forEach(function (x) {
        if (x.res.result === 'refreshed' && x.res.dispatched_context) {
          P().pendingDispatchContexts[x.ref.id] = x.res.dispatched_context;
        }
        if (x.ref.stale) delete x.ref.stale;
      });
      return false;
    }
    /* Hold: snapshot the block BEFORE marking (so the marked rebuild replaces
       the exact current text), mark each stale item, clear marks that healed. */
    var prevRefs = snapshotListRefs(refs);
    bad.forEach(function (x) {
      x.ref.stale = { reason: x.res.reason, detail: x.res.detail || null, at: nowIso() };
    });
    results.forEach(function (x) { if (x.ok && x.ref.stale) delete x.ref.stale; });
    /* A deferred (queue) send arrives with the text in `raw`, not the composer;
       the spliced queue entry is gone, so the held text is restored to the
       composer here rather than lost. Normal sends are already identical. */
    if (raw && ctx.state.composer.indexOf(raw) < 0) {
      ctx.state.composer = ctx.state.composer ? ctx.state.composer + '\n' + raw : raw;
      if (ctx.state.drafts) ctx.state.drafts[tid] = ctx.state.composer;
    }
    /* B20-R3-F3: capture visibility BEFORE applyListRefs re-marks the block
       below (markers change the block's exact bytes while preserving the
       user's text). At this point the held input is verbatim in the composer,
       so deferred dispatch must not also keep the queue entry. */
    var heldVisible = !raw || ctx.state.composer.indexOf(raw) >= 0;
    applyListRefs(ctx, tid, prevRefs);
    P().lastAdmissionHold = { at: nowIso(), threadId: tid, total: refs.length,
      blocked: bad.map(function (x) { return { id: x.ref.id, label: x.ref.componentLabel, reason: x.res.reason }; }) };
    var names = bad.map(function (x) { return (x.ref.componentLabel || 'component') + ' (' + x.res.reason.replace(/_/g, ' ') + ')'; }).join('; ');
    ctx.toast('Send held — stale browser context', names + '. Recapture or remove the marked items; nothing was sent and your draft is intact.');
    ctx.addReceipt('bc-admission-hold', 'Send held — stale browser context',
      bad.length + ' of ' + refs.length + ' referenced components are stale: ' + names
      + '. Nothing was sent, no partial list went out, and the draft is unchanged. Recapture through the component picker or remove the marked items, then send again.');
    ctx.renderApp();
    return { claimed: true, preserveComposer: true, textPreserved: heldVisible };
  }
  if (RT.composer) {
    RT.composer.historyBlockers = RT.composer.historyBlockers || [];
    RT.composer.historyBlockers.push(function () {
      /* §14.2 "ambiguous pending state": an armed region drag or an open
         component prompt bar both mean Up/Down recall would be surprising. */
      return P().mode === 'region' || !!drag || !!P().picked;
    });
    /* B20-R02: the veto is an unconditional validator, not one more claim hook:
       deliverSend runs validators before any hook can admit the submission, so
       hook order can never bypass capture validation again. */
    RT.composer.preSendValidators = RT.composer.preSendValidators || [];
    RT.composer.preSendValidators.push(preSendVeto);
    RT.composer.commitHooks = RT.composer.commitHooks || [];
    RT.composer.commitHooks.push(function (ctx, thread, message, buffer) {
      if (buffer && buffer.browser_context_refs && buffer.browser_context_refs.length) {
        if (message) {
          message.browserContextRefs = buffer.browser_context_refs.slice();
          if (P().pendingDispatchContexts) message.browserDispatchedContexts = P().pendingDispatchContexts;
        }
        P().pendingDispatchContexts = null;
        /* This module is the only writer of browser_context_refs; composer-state.js
           reserves the field but does not clear it on commit, so this module clears
           its own field once the refs have been stamped onto the sent message. */
        buffer.browser_context_refs = [];
      } else {
        P().pendingDispatchContexts = null;
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
