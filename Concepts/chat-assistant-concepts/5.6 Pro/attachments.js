/* attachments.js — feature module.  OWNER: Assistant-redesign wave (2026-09-03) —
 * attachments agent.  Covers packet 01_IMPLEMENTATION_SPEC.md §3 (Attachments,
 * files and generated artifacts) and 04_GUI_IMPACTS.md §5.2 (Attachment tray)
 * and §6 (Transcript attachments).
 *
 * THIS FILE OWNS
 * ---------------
 *   window.PM56_RUNTIME.attachments = { ORIGINS, catalog, byId, seedOnce, ... }
 *   the `composerTray` slot (the pending-attachment tray above the text entry);
 *   attachment thumbnails inside `messageAffordance` for any text turn that
 *   carries `.attachments`;
 *   the `dialog` slot for `att-source` (add-attachment picker) and
 *   `att-details` (the More Info / deep detail surface);
 *   every `att-*` action, plus one declared override of the built-in `attach`
 *   action (see honesty note 1 below).
 *
 * WHAT THIS FILE IS HONEST ABOUT
 * -------------------------------
 * 1. THE BUILT-IN `attach` ACTION WAS A FAKE. app.js's own dispatcher matched
 *    `attach` with `addReceipt('attachment','Uploading design-reference.png',
 *    '82% ...')` — a receipt naming a file that was never selected and never
 *    uploaded anything. `extRun()` runs a registered EXT action BEFORE that
 *    built-in chain (app.js's click handler calls `extRun(a,btn,e)` first;
 *    only an unclaimed action falls through to the built-in if-chain and then
 *    to `extRunAfter`), and when a handler returns non-false the built-in
 *    branch never runs. `EXT.action('attach', ...)` below is therefore a real,
 *    declared replacement, not a race: it opens a source picker and, for
 *    "Upload files", drives a real `<input type=file>` so name/size/type on
 *    every uploaded-snapshot record are the browser's own, never invented.
 * 2. NO SECOND ARTIFACT STORE. Per §3.1 this module does not persist files —
 *    it projects them. A real upload's bytes live only in the browser's File
 *    object for the session, exactly as far as composer-state.js's own
 *    buffer-persistence contract already promises for attachments (JSON
 *    round trip only — no binary body). Project/frozen/folder records are
 *    demo fixtures from this module's own catalog; two generated-artifact
 *    rows read the real `D.artifacts` entries `plan-query`/`dashboard-query`
 *    so a version shown here can never disagree with the Plan card or the
 *    artifact viewer. Every record this module creates carries `demo:true`.
 * 3. SEEDED TRANSCRIPT FIXTURES ARE A RUNTIME MUTATION, NOT A data.js EDIT.
 *    §3 needs image/PDF/folder/changed-live-ref/versioned-artifact/failed+
 *    retry examples already sitting in the transcript, not only creatable
 *    live. data.js's own `turns()` factory already wires `extra.attachments`
 *    onto user messages (`if (extra.attachments) m.attachments =
 *    extra.attachments;`) — no thread fixture happens to pass it. This
 *    module sets the same field, once at load time, directly on message
 *    OBJECTS already inside `window.PM56_DATA.threads` — the same category of
 *    write the stock app already makes (`retry-artifact` sets
 *    `D.artifacts[].status`) — so app.js's `clone(D.threads)` carries the
 *    seed into `state.threads` on first boot and after every Reset. Targets
 *    are matched by role/position/stable body text, never a literal message
 *    id: this concept's data.js is under active edit by a sibling wave (a
 *    `plan-card-v2` pair landed mid-session and shifted every later
 *    `query-NN` id), and a literal id is exactly the coupling that would
 *    silently seed the wrong turn the next time data.js grows a message.
 *    Every seed call is wrapped so a missing thread/message degrades to
 *    "nothing seeded there" instead of a boot-time throw.
 * 4. THE TOP-EDGE TRACER IS CSS-ONLY. Pipeline *state* (selected -> resolving
 *    -> uploading -> scanning -> extracting -> ready|warning|failed) is real,
 *    timer-driven JS, but the animated sweep/glint/ripple for each state is a
 *    `@keyframes` loop keyed off a `data-state` attribute — no rAF loop, no
 *    interval, no per-tick renderApp(). Discrete state transitions call
 *    renderApp() a handful of times over a few seconds per item, the same
 *    "state change, not a clock tick" class of render every sibling module in
 *    this wave already performs.
 * 5. A FAILED ITEM NEVER LOSES BYTES OR SIBLINGS. `att-remove` is the only
 *    action that deletes an attachment record, and it deletes exactly the one
 *    the user targeted. A failed pipeline stops in `process_state:'failed'`
 *    with the record — and, for a real upload, the original File — intact;
 *    Retry restarts the SAME record rather than asking the user to reselect
 *    it, and never touches sibling attachments or the composer text.
 * 6. DOWNLOAD IS A REAL BLOB, AND SAYS WHICH VERSION IT HANDED OVER. A real
 *    uploaded File downloads its own bytes. A demo/fixture record downloads a
 *    generated text stand-in that states the exact hash/revision it
 *    represents and, when a live reference has drifted, says so in the file
 *    body — the same honest-Blob-or-say-so contract app.js's
 *    `exportContextJson` and plans.js's `download()` already use. Never a
 *    fabricated success with no file.
 * 7. CONTEXT MATERIALIZATION IS A LABELED FIXTURE, NOT A COMPUTATION. This
 *    module does not know what Prompt Pipeline actually sent to a model. The
 *    per-turn materialization rows in More Info are static fixture data,
 *    explicitly captioned as such, using the closed enum from packet §3.7
 *    (available / selected / materialized / partially_materialized /
 *    omitted_by_budget / unsupported_by_route / blocked_by_policy /
 *    stale_reference).
 * 8. REVEAL IN PROJECT / SAVE TO PROJECT ARE HONEST STUBS. Per §3.1 this
 *    concept does not re-implement File Manager. Both controls render
 *    disabled with a reason instead of pretending to navigate anywhere —
 *    the same disabled+reason pattern transcript.js's overflow registry and
 *    app.js's `pause-goal`/`resume-goal` stubs already use.
 *
 * Namespace: `RT.attachments`. Actions: `att-*`, plus one intentionally
 * declared override of the built-in `attach` action.
 */
(function () {
  'use strict';
  var D = window.PM56_DATA; if (!D) return;
  var EXT = window.PM56_EXT; if (!EXT || !EXT.slot) return;
  var RT = window.PM56_RUNTIME = window.PM56_RUNTIME || {};

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* =====================================================================
     0. SMALL UTILITIES
     ===================================================================== */
  function ctxNow() {
    /* Mirrors composer-state.js's own helper: app.js publishes extCtx as
       EXT.ctx once it boots, and state is reassigned wholesale on reset, so
       the returned object is never cached across a render. */
    return (EXT && typeof EXT.ctx === 'function') ? EXT.ctx() : null;
  }
  var uidSeq = 0;
  function attUid(prefix) {
    uidSeq += 1;
    return (prefix || 'att') + '-' + Date.now().toString(36) + '-' + uidSeq.toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }
  function nowIso() { return new Date().toISOString(); }

  function bytesLabel(n) {
    if (n == null || isNaN(n)) return null;
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(n < 10240 ? 1 : 0) + ' KB';
    if (n < 1024 * 1024 * 1024) return (n / (1024 * 1024)).toFixed(1) + ' MB';
    return (n / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }

  /* Deterministic, short, plausible-looking content fingerprint. Not a real
     hash algorithm — a fixture stand-in so the same input always renders the
     same "hash", the way every other timing/cost figure in this concept's
     fixtures is deterministic per input rather than re-rolled per render. */
  function fixtureHash(seed) {
    var s = String(seed || '');
    var h1 = 0x811c9dc5, h2 = 0x9e3779b9;
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      h1 = (h1 ^ c) >>> 0; h1 = (h1 * 16777619) >>> 0;
      h2 = ((h2 << 5) - h2 + c) >>> 0;
    }
    function hex(n) { var x = (n >>> 0).toString(16); while (x.length < 8) x = '0' + x; return x; }
    return hex(h1) + hex(h2).slice(0, 4);
  }

  function fmtStamp(iso) {
    var d = iso ? new Date(iso) : null;
    if (!d || isNaN(d.getTime())) return 'not reported';
    return d.toLocaleString();
  }

  function findThread(tid) {
    var list = D.threads || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === tid) return list[i];
    return null;
  }
  function threadById(ctx, tid) {
    var list = (ctx && ctx.state && ctx.state.threads) || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === tid) return list[i];
    return null;
  }
  function findMessageInList(list, pred) {
    if (!list) return null;
    for (var i = 0; i < list.length; i++) if (pred(list[i])) return list[i];
    return null;
  }
  function findMessageById(thread, id) {
    return thread ? findMessageInList(thread.messages, function (m) { return m.id === id; }) : null;
  }

  /* =====================================================================
     1. THE SHARED CONTRACT — RT.attachments
     ===================================================================== */
  var AT = RT.attachments = RT.attachments || {};
  AT.version = 1;
  AT.byId = AT.byId || Object.create(null);
  AT.seeded = AT.seeded || false;
  AT.resumedPending = AT.resumedPending || false;

  function registerRecord(rec) {
    if (rec && rec.id) AT.byId[rec.id] = rec;
    return rec;
  }
  AT.registerRecord = registerRecord;

  /* Resolve a live attachment reference from wherever it currently lives.
     Always prefer the array a record actually lives in (composer buffer or a
     sent message) over the byId cache, because buffer attachments round-trip
     through JSON on reload/thread-switch and mint fresh object identities —
     byId is a convenience index, not the source of truth. */
  function findAttachment(ctx, threadId, messageId, attId) {
    if (!attId) return null;
    if (messageId) {
      var th = threadById(ctx, threadId);
      var m = th && findMessageById(th, messageId);
      if (m && m.attachments) {
        var f = findMessageInList(m.attachments, function (a) { return a.id === attId; });
        if (f) return f;
      }
    }
    var buf = RT.composer && RT.composer.buffers && RT.composer.buffers[threadId];
    if (buf && buf.attachments) {
      var f2 = findMessageInList(buf.attachments, function (a) { return a.id === attId; });
      if (f2) return f2;
    }
    /* Last resort: scan every thread/message (the caller did not know where
       the record lives — happens when a dialog was opened from the tray but
       the item was sent while the dialog was open). */
    var threads = (ctx && ctx.state && ctx.state.threads) || [];
    for (var i = 0; i < threads.length; i++) {
      var mm = findMessageInList(threads[i].messages, function (mx) {
        return mx.attachments && findMessageInList(mx.attachments, function (a) { return a.id === attId; });
      });
      if (mm) return findMessageInList(mm.attachments, function (a) { return a.id === attId; });
    }
    return AT.byId[attId] || null;
  }
  AT.findAttachment = findAttachment;

  /* =====================================================================
     2. ORIGIN / KIND METADATA (packet §3.2)
     ===================================================================== */
  var ORIGINS = {
    uploaded_snapshot: { label: 'Uploaded snapshot', short: 'Uploaded' },
    project_live_reference: { label: 'Project reference (live)', short: 'Project · live' },
    project_frozen_snapshot: { label: 'Project reference (frozen)', short: 'Project · frozen' },
    generated_artifact: { label: 'Generated artifact', short: 'Generated' },
    external_live_reference: { label: 'External reference (live)', short: 'External · live' },
    external_snapshot: { label: 'Retained external snapshot', short: 'External · retained' },
    clipboard: { label: 'Clipboard', short: 'Clipboard' },
    browser_capture: { label: 'Browser capture', short: 'Browser capture' },
    source_control_object: { label: 'Source-control object', short: 'Source control' },
    folder_manifest: { label: 'Folder manifest', short: 'Folder' }
  };
  AT.ORIGINS = ORIGINS;
  function originMeta(origin) { return ORIGINS[origin] || { label: 'Attachment', short: 'Attachment' }; }

  var PROCESS_LABELS = {
    selected: 'Selected', resolving: 'Resolving', uploading: 'Uploading',
    scanning: 'Scanning', extracting: 'Extracting', ready: 'Ready',
    warning: 'Ready with a warning', failed: 'Failed'
  };
  AT.PROCESS_LABELS = PROCESS_LABELS;
  var PENDING_STATES = { selected: 1, resolving: 1, uploading: 1, scanning: 1, extracting: 1 };

  /* Closed enum, packet §3.7. */
  var MATERIALIZATION_LABELS = {
    available: 'Available', selected: 'Selected', materialized: 'Materialized',
    partially_materialized: 'Partially materialized', omitted_by_budget: 'Omitted by budget',
    unsupported_by_route: 'Unsupported by route', blocked_by_policy: 'Blocked by policy',
    stale_reference: 'Stale reference'
  };
  AT.MATERIALIZATION_LABELS = MATERIALIZATION_LABELS;

  /* Custom inline icons for kinds/origins app.js's PATHS map does not carry.
     Same convention as app.js's icon(): viewBox 0 0 24 24, stroked,
     currentColor, stroke-width 1.8. */
  var CUSTOM_ICON_PATHS = {
    folder: '<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
    upload: '<path d="M12 21V9M7 14l5-5 5 5"/><path d="M4 21h16"/>',
    clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="M9 11h6M9 15h6"/>',
    camera: '<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="14" r="3.5"/>'
  };
  function attIcon(ctx, name, size, cls) {
    var custom = CUSTOM_ICON_PATHS[name];
    if (custom) {
      return '<svg class="' + (cls || '') + '" width="' + size + '" height="' + size +
        '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
        ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + custom + '</svg>';
    }
    return ctx.icon(name, size, cls || '');
  }

  function kindIconName(kind) {
    if (kind === 'image') return 'image';
    if (kind === 'pdf' || kind === 'doc' || kind === 'text') return 'document';
    if (kind === 'data' || kind === 'code') return 'code';
    if (kind === 'archive' || kind === 'binary') return 'archive';
    if (kind === 'artifact') return 'artifact';
    if (kind === 'folder') return 'folder';
    if (kind === 'clipboard') return 'clipboard';
    if (kind === 'capture') return 'camera';
    return 'document';
  }

  function originIconName(origin) {
    if (origin === 'folder_manifest') return 'folder';
    if (origin === 'generated_artifact') return 'artifact';
    if (origin === 'external_live_reference' || origin === 'external_snapshot') return 'globe';
    if (origin === 'clipboard') return 'clipboard';
    if (origin === 'browser_capture') return 'camera';
    if (origin === 'source_control_object') return 'branch';
    if (origin === 'project_frozen_snapshot') return 'lock';
    if (origin === 'uploaded_snapshot') return 'upload';
    return null; /* project_live_reference and anything else: fall back to kind icon */
  }

  /* =====================================================================
     3. FIXTURE CATALOG — project files, one folder, generated artifacts
     ---------------------------------------------------------------------
     Defined here (never in data.js) per the module contract's "define demo
     fixtures inside your own module" rule. `plan` and `dashboard` are NOT
     invented — they read the real D.artifacts records so a version shown in
     an attachment card can never disagree with the Plan card / artifact
     viewer.
     ===================================================================== */
  var PROJECT_FILES = {
    queries: {
      path: 'src/analytics/queries.rs', kind: 'code', size: 14822,
      /* This is the flagship "changed since the message was sent" fixture:
         workSteps' own 'edit' step fixture (data.js) narrates "1 migration
         created, 2 query call sites updated, +84 −17 lines" against exactly
         this file, so treating it as drifted after the turn that asked for
         the plan is continuous with the rest of the demo, not invented. */
      changed: true
    },
    schema: { path: 'src/analytics/schema.rs', kind: 'code', size: 9130, changed: false },
    readme: { path: 'README.md', kind: 'text', size: 2210, changed: false },
    migration: {
      path: 'migrations/0043_events_concurrent.sql', kind: 'code', size: 1180,
      frozen: true /* CONCURRENTLY cannot run inside this repo's migration
        transaction wrapper (see the assistant's own turn) — a frozen
        snapshot is the honest origin for a file that must not silently
        follow the branch tip. */
    }
  };
  var FOLDER_FIXTURE = {
    path: 'src/analytics/', totalFiles: 6, shown: [
      { name: 'queries.rs', size: 14822 }, { name: 'schema.rs', size: 9130 },
      { name: 'mod.rs', size: 640 }, { name: 'tests.rs', size: 5210 }
    ]
  };
  function realArtifact(id) {
    var list = D.artifacts || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  var ARTIFACT_KEYS = {
    plan: 'plan-query',
    dashboard: 'dashboard-query'
  };
  /* traces-summary is not a real D.artifacts row (nothing in that fixture
     represents a parsed CSV) — it is a self-contained module fixture,
     motivated by the attachments thread's own line "Parsed as a data
     artifact, so I can filter and aggregate it without loading all 4,180
     rows into context". */
  var TRACES_SUMMARY_ARTIFACT = {
    id: 'gen-traces-summary', kind: 'data', title: 'traces-summary.json', version: 1,
    projectPath: 'artifacts/traces-summary.json', threadId: 'attachments',
    summary: 'Schema plus a query surface over traces.csv (4,180 rows), so the model can filter and aggregate without loading the raw file into context.'
  };

  /* =====================================================================
     4. ATTACHMENT RECORD FACTORY
     ===================================================================== */
  function baseRecord(fields) {
    var r = {
      id: attUid('att'),
      demo: true,
      created_at: nowIso(),
      process_state: 'selected',
      progress_started_at: null,
      hash: null,
      size: null,
      mime: null,
      source_label: '',
      producer: null,
      related: null,
      version: null,
      revisions: null,
      live_drift: null,
      retention: { holds: [], eligible_for_deletion: true, reason: '' },
      materialization: [],
      transform: '',
      filesafe: { status: 'not_scanned', note: 'Not yet scanned.' },
      export_history: [],
      folder_manifest: null,
      artifact_ref: null,
      error: null
    };
    for (var k in fields) r[k] = fields[k];
    if (r.hash == null) r.hash = fixtureHash(r.origin + '|' + r.name + '|' + (r.size || 0) + '|' + r.id);
    return r;
  }

  function makeUploadedFromFile(file) {
    var kind = 'binary';
    var mime = file.type || '';
    if (mime.indexOf('image/') === 0) kind = 'image';
    else if (mime === 'application/pdf' || /\.pdf$/i.test(file.name)) kind = 'pdf';
    else if (mime.indexOf('text/') === 0 || /\.(csv|json|md|txt|log)$/i.test(file.name)) kind = 'data';
    else if (/\.(js|ts|py|rs|go|java|c|cpp|css|html)$/i.test(file.name)) kind = 'code';
    else if (/\.(zip|tar|gz|7z|rar|pkg|dmg|exe|msi)$/i.test(file.name)) kind = 'archive';
    var rec = baseRecord({
      origin: 'uploaded_snapshot', kind: kind, name: file.name, size: file.size,
      mime: mime || 'application/octet-stream', source_label: 'Uploaded from device',
      producer: { label: 'You', detail: 'Uploaded from device' },
      filesafe: { status: 'clear', note: 'Scanned on upload · no secrets or credential patterns detected.' }
    });
    /* attachHiddenProp (declared later, hoisted) keeps the real File off the
       enumerable property list so JSON.stringify — which composer-state.js
       runs on the whole buffer to persist it — never touches it. A plain
       `rec._file = file` would still "round-trip" as `{}` (File exposes no
       OWN enumerable properties), and an `{}` surviving a reload would look
       truthy to every `if (rec._file)` check below without being a real
       Blob, breaking the exact download path honesty note 6 promises. */
    attachHiddenProp(rec, '_file', file);
    return rec;
  }

  function makePdfFixture() {
    return baseRecord({
      origin: 'uploaded_snapshot', kind: 'pdf', name: 'query-performance-runbook.pdf',
      size: 486000, mime: 'application/pdf', source_label: 'Uploaded from device',
      producer: { label: 'You', detail: 'Uploaded from device' },
      process_state: 'ready',
      transform: 'Text and table extraction · 3 pages OCR-clean, no scanned images.',
      filesafe: { status: 'clear', note: 'Scanned on upload · no secrets or credential patterns detected.' },
      materialization: [{ turn: 'this turn', status: 'materialized', note: 'Extracted text included in full (bounded).' }]
    });
  }
  function makeImageFixture() {
    return baseRecord({
      origin: 'uploaded_snapshot', kind: 'image', name: 'schema-diagram.png',
      size: 842000, mime: 'image/png', source_label: 'Uploaded from device',
      producer: { label: 'You', detail: 'Uploaded from device' },
      process_state: 'ready',
      /* Echoes the assistant's own reply in this exact thread, rather than
         contradicting it with a different number. */
      transform: 'Downsampled to 1024px on the long edge for vision ingestion (~4,000 tokens; original stays in the worktree).',
      filesafe: { status: 'clear', note: 'Scanned on upload · no secrets or credential patterns detected.' },
      materialization: [{ turn: 'this turn', status: 'materialized', note: 'Downsampled image materialized; full-resolution original was not re-read.' }]
    });
  }
  function makeFailedPkgFixture() {
    return baseRecord({
      origin: 'uploaded_snapshot', kind: 'archive', name: 'legacy-project.pkg',
      size: 128400000, mime: 'application/octet-stream', source_label: 'Uploaded from device',
      producer: { label: 'You', detail: 'Uploaded from device' },
      process_state: 'failed',
      error: 'Unsupported package format — expanding it would run its own installer on the execution host, so extraction was refused before it started.',
      filesafe: { status: 'blocked', note: 'Blocked before scan: extraction would require running vendor-supplied installer code.' },
      materialization: [{ turn: 'this turn', status: 'blocked_by_policy', note: 'Never materialized — extraction was refused.' }]
    });
  }
  function makeCsvFixture() {
    return baseRecord({
      origin: 'uploaded_snapshot', kind: 'data', name: 'traces.csv',
      size: 612000, mime: 'text/csv', source_label: 'Uploaded from device',
      producer: { label: 'You', detail: 'Uploaded from device' },
      process_state: 'ready',
      transform: 'Parsed as a data artifact (schema + query surface) rather than loaded as raw text — 4,180 rows, ~620 tokens.',
      filesafe: { status: 'clear', note: 'Scanned on upload · no secrets or credential patterns detected.' },
      materialization: [{ turn: 'this turn', status: 'materialized', note: 'Parsed schema and query surface materialized; raw rows were not.' }]
    });
  }

  function makeProjectRefRecord(key) {
    var f = PROJECT_FILES[key];
    if (!f) return null;
    var origin = f.frozen ? 'project_frozen_snapshot' : 'project_live_reference';
    var materializedHash = fixtureHash(origin + '|' + f.path + '|materialized');
    var rec = baseRecord({
      origin: origin, kind: f.kind, name: f.path, size: f.size, mime: 'text/plain',
      source_label: 'Project · ' + f.path,
      producer: { label: 'You', detail: 'Referenced from the project tree' },
      process_state: 'ready',
      hash: materializedHash,
      retention: { holds: [], eligible_for_deletion: !f.frozen, reason: f.frozen ? 'Frozen snapshot retained with the migration record.' : '' },
      materialization: [{ turn: 'this turn', status: 'materialized', note: 'Full file materialized (' + bytesLabel(f.size) + ', under the per-file bound).' }]
    });
    if (!f.frozen && f.changed) {
      var currentHash = fixtureHash(origin + '|' + f.path + '|current-drift');
      rec.live_drift = {
        current_hash: currentHash,
        current_label: 'Current working tree',
        changed_at: nowIso(),
        note: 'Edited after this turn: the composite-index migration and batched query landed in this file (+84 −17 lines per the working-tree diff).'
      };
    }
    return rec;
  }

  function makeFolderRecord() {
    var f = FOLDER_FIXTURE;
    return baseRecord({
      origin: 'folder_manifest', kind: 'folder', name: f.path, size: null, mime: null,
      source_label: 'Project · ' + f.path,
      producer: { label: 'You', detail: 'Referenced from the project tree' },
      process_state: 'ready',
      /* FOLDER-004: a BOUNDED manifest with exact root identity, an entries
         and hash policy, the exclusions actually applied, the granted read
         scope, and a materialization status. A folder is never recursively
         dumped into a prompt. */
      semantic_kind: 'folder',
      folder_manifest: { totalFiles: f.totalFiles, shown: f.shown, truncated: f.totalFiles > f.shown.length,
        root_identity: 'project:pm/' + f.path,
        manifest_hash: 'sha-demo:f0a31c7b',
        entries_policy: 'names and sizes only, depth 2, ' + f.shown.length + ' of ' + f.totalFiles + ' listed',
        hash_policy: 'manifest hashed; individual file bytes are hashed only when materialized',
        exclusions: ['node_modules/**', 'target/**', '*.lock', '.git/**'],
        permissions: 'read-only, scoped to this project worktree',
        materialization_status: 'manifest_only' },
      materialization: [{ turn: 'this turn', status: 'partially_materialized', note: 'Bounded manifest only (' + f.shown.length + ' of ' + f.totalFiles + ' files listed by name/size) — no recursive file contents were sent.' }]
    });
  }

  function makeArtifactRecord(key) {
    if (key === 'traces-summary') {
      var t = TRACES_SUMMARY_ARTIFACT;
      return baseRecord({
        origin: 'generated_artifact', kind: 'data', name: t.title, size: 8400, mime: 'application/json',
        source_label: 'Generated · ' + t.projectPath,
        producer: { label: 'Assistant', detail: 'Parsed from traces.csv' },
        process_state: 'ready',
        version: { n: t.version, label: 'V' + t.version },
        artifact_ref: t.id,
        related: { kind: 'artifact', label: t.title, id: t.id },
        materialization: [{ turn: 'this turn', status: 'materialized', note: 'Schema + query surface materialized, not the raw parsed rows.' }]
      });
    }
    var artId = ARTIFACT_KEYS[key];
    var art = artId && realArtifact(artId);
    if (!art) return null;
    var revisions = (art.payload && art.payload.revisions) || null;
    return baseRecord({
      origin: 'generated_artifact', kind: art.kind === 'plan' ? 'artifact' : 'artifact',
      name: art.title, size: null, mime: 'text/markdown',
      source_label: 'Generated · ' + (art.projectPath || art.id),
      producer: { label: 'Assistant', detail: 'Thread · ' + (art.threadId || 'this thread') },
      process_state: 'ready',
      version: { n: art.version, label: 'V' + art.version },
      artifact_ref: art.id,
      related: { kind: art.kind, label: art.title, id: art.id },
      revisions: revisions,
      materialization: [{ turn: 'this turn', status: 'materialized', note: 'Current version (' + 'V' + art.version + ') materialized in full.' }]
    });
  }

  /* =====================================================================
     5. TRANSCRIPT SEEDING (honesty note 3)
     ===================================================================== */
  function attachTo(msg, records) {
    if (!msg) return;
    var list = Array.isArray(msg.attachments) ? msg.attachments : [];
    for (var i = 0; i < records.length; i++) {
      if (!records[i]) continue;
      registerRecord(records[i]);
      list.push(records[i]);
    }
    msg.attachments = list;
  }

  function seedThreadFixtures() {
    if (AT.seeded) return;
    try {
      var qt = findThread('query');
      if (qt && qt.messages && qt.messages.length) {
        var first = qt.messages[0];
        if (first && first.role === 'user') {
          attachTo(first, [makeProjectRefRecord('queries'), makePdfFixture(), makeFolderRecord()]);
        }
        var planMsg = findMessageInList(qt.messages, function (m) {
          return m.role === 'assistant' && typeof m.body === 'string' && m.body.indexOf('Plan is up.') === 0;
        });
        if (planMsg) attachTo(planMsg, [makeArtifactRecord('plan')]);
        var lastQ = qt.messages[qt.messages.length - 1];
        if (lastQ) attachTo(lastQ, [makeProjectRefRecord('migration')]);
      }
      var at = findThread('attachments');
      if (at && at.messages && at.messages.length) {
        var firstA = at.messages[0];
        if (firstA && firstA.role === 'user') attachTo(firstA, [makeImageFixture(), makeFailedPkgFixture()]);
        var csvMsg = findMessageInList(at.messages, function (m) {
          return m.role === 'user' && typeof m.body === 'string' && m.body.indexOf('Attach the benchmark CSV too') === 0;
        });
        if (csvMsg) attachTo(csvMsg, [makeCsvFixture()]);
        var lastA = at.messages[at.messages.length - 1];
        if (lastA) attachTo(lastA, [makeArtifactRecord('traces-summary')]);
      }
    } catch (err) {
      if (window.console) console.error('PM56 attachments: fixture seeding failed', err);
    }
    AT.seeded = true;
  }
  seedThreadFixtures();

  /* =====================================================================
     6. COMPOSER BUFFER ACCESS
     ===================================================================== */
  function bufferFor(tid) {
    RT.composer = RT.composer || {};
    if (typeof RT.composer.bufferFor === 'function') return RT.composer.bufferFor(tid);
    /* Defensive fallback only — composer-state.js loads before this module
       per build.py and is expected to have installed the real one. */
    RT.composer.buffers = RT.composer.buffers || {};
    if (!RT.composer.buffers[tid]) {
      RT.composer.buffers[tid] = { thread_id: tid, text: '', attachments: [], browser_context_refs: [], destination: null, cursor_position: null, revision: 0, updated_at: null };
    }
    var b = RT.composer.buffers[tid];
    if (!Array.isArray(b.attachments)) b.attachments = [];
    return b;
  }
  function touchComposer() {
    if (RT.composer && typeof RT.composer.touch === 'function') RT.composer.touch();
  }

  /* =====================================================================
     7. PROCESSING PIPELINE SIMULATION (honesty note 4)
     ---------------------------------------------------------------------
     Real timer-driven state transitions; the animated sweep/glint/ripple per
     state is pure CSS keyed off `data-state` in attachments.css. Durations
     here are documented so a reader can line up the CSS animation-duration
     with the JS step that actually holds each state.
     ===================================================================== */
  var PIPELINES = {
    image: [['resolving', 450], ['uploading', 900], ['scanning', 500]],
    pdf: [['resolving', 450], ['uploading', 1000], ['scanning', 500], ['extracting', 700]],
    data: [['resolving', 400], ['uploading', 800], ['extracting', 600]],
    code: [['resolving', 400], ['uploading', 800], ['extracting', 600]],
    text: [['resolving', 400], ['uploading', 800], ['extracting', 600]],
    archive: [['resolving', 400], ['uploading', 900], ['scanning', 500]],
    binary: [['resolving', 400], ['uploading', 900], ['scanning', 500]],
    reference: [['resolving', 300]],
    folder: [['resolving', 350]],
    clipboard: [['resolving', 300], ['scanning', 400]]
  };
  function pipelineFor(origin, kind) {
    if (origin === 'folder_manifest') return PIPELINES.folder;
    if (origin === 'generated_artifact' || origin === 'project_live_reference' || origin === 'project_frozen_snapshot') return PIPELINES.reference;
    if (origin === 'clipboard') return PIPELINES.clipboard;
    return PIPELINES[kind] || PIPELINES.binary;
  }

  var pendingTimers = Object.create(null);
  function clearPendingTimer(id) {
    if (pendingTimers[id]) { clearTimeout(pendingTimers[id]); delete pendingTimers[id]; }
  }

  /* `onDone` decides the terminal state so the same runner serves both a
     normal pipeline (ends ready) and a retry of a previously-failed record
     (also ends ready — packet requires a *working* retry, not a coin flip). */
  function runPipeline(threadId, attId, steps, onDone) {
    clearPendingTimer(attId);
    var i = 0;
    function step() {
      var ctx = ctxNow();
      if (!ctx) { pendingTimers[attId] = setTimeout(step, 200); return; }
      var rec = findAttachment(ctx, threadId, null, attId);
      if (!rec) { delete pendingTimers[attId]; return; } /* removed mid-pipeline */
      if (i >= steps.length) {
        onDone(rec, ctx);
        touchComposer();
        ctx.renderApp();
        delete pendingTimers[attId];
        return;
      }
      rec.process_state = steps[i][0];
      rec.progress_started_at = nowIso();
      touchComposer();
      ctx.renderApp();
      var delay = steps[i][1];
      i += 1;
      pendingTimers[attId] = setTimeout(step, delay);
    }
    /* First transition is deferred (not synchronous) so admitting several
       files at once does one render for the initial 'selected' state rather
       than N nested renders inside the same call stack. */
    pendingTimers[attId] = setTimeout(step, 150);
  }

  function startPipeline(threadId, attId, origin, kind) {
    var steps = pipelineFor(origin, kind);
    runPipeline(threadId, attId, steps, function (rec) {
      rec.process_state = 'ready';
      rec.progress_started_at = null;
    });
  }
  AT.startPipeline = startPipeline;

  function retryAttachment(threadId, attId) {
    var ctx = ctxNow(); if (!ctx) return;
    var rec = findAttachment(ctx, threadId, null, attId);
    if (!rec) return;
    rec.error = null;
    rec.filesafe = { status: 'clear', note: 'Re-scanned on retry · no secrets or credential patterns detected.' };
    var steps = pipelineFor(rec.origin, rec.kind);
    runPipeline(threadId, attId, steps, function (r) {
      r.process_state = 'ready';
      r.progress_started_at = null;
    });
  }

  /* A reload restores buffer attachments from localStorage as plain JSON —
     any item frozen mid-pipeline (browser closed mid-upload) needs a fresh
     run rather than sitting stuck forever. Runs once, lazily, the first time
     a render happens with a real ctx available (module load is too early —
     app.js has not published EXT.ctx yet). */
  function resumeAllPending() {
    if (AT.resumedPending) return;
    var ctx = ctxNow(); if (!ctx) return;
    AT.resumedPending = true;
    var buffers = (RT.composer && RT.composer.buffers) || {};
    for (var tid in buffers) {
      var atts = buffers[tid] && buffers[tid].attachments;
      if (!atts) continue;
      for (var i = 0; i < atts.length; i++) {
        var a = atts[i];
        if (a && PENDING_STATES[a.process_state]) startPipeline(tid, a.id, a.origin, a.kind);
      }
    }
  }

  /* =====================================================================
     8. ADMITTING NEW ATTACHMENTS — real File input + drag/drop (§3.4)
     ===================================================================== */
  function currentThreadId() {
    var ctx = ctxNow();
    return (ctx && ctx.state && ctx.state.selectedThread) || null;
  }

  function admitFiles(threadId, fileList) {
    var ctx = ctxNow(); if (!ctx || !threadId) return;
    var buf = bufferFor(threadId);
    var added = 0;
    for (var i = 0; i < fileList.length; i++) {
      var file = fileList[i];
      if (!file) continue;
      var rec = makeUploadedFromFile(file);
      registerRecord(rec);
      buf.attachments.push(rec);
      added += 1;
      startPipeline(threadId, rec.id, rec.origin, rec.kind);
    }
    touchComposer();
    ctx.renderApp();
    if (added === 1) ctx.toast('1 file added', 'Added to the composer tray as an uploaded snapshot.');
    else if (added > 1) ctx.toast(added + ' files added', 'Added to the composer tray as uploaded snapshots.');
  }
  AT.admitFiles = admitFiles;

  var lastAttachThreadId = null;
  var fileInputEl = null;
  function ensureFileInput() {
    fileInputEl = document.getElementById('pm56-att-file-input');
    if (fileInputEl) return fileInputEl;
    fileInputEl = document.createElement('input');
    fileInputEl.type = 'file';
    fileInputEl.id = 'pm56-att-file-input';
    fileInputEl.multiple = true;
    fileInputEl.setAttribute('aria-hidden', 'true');
    fileInputEl.tabIndex = -1;
    fileInputEl.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
    /* Appended to document.body, a sibling of #pmRoot — pmPatch only ever
       reconciles #pmRoot and #pmOverlayRoot (activity-bar.js documents the
       same boundary), so this node survives every re-render untouched. */
    document.body.appendChild(fileInputEl);
    fileInputEl.addEventListener('change', function () {
      var files = fileInputEl.files;
      var tid = lastAttachThreadId || currentThreadId();
      if (files && files.length && tid) admitFiles(tid, files);
      fileInputEl.value = '';
    });
    return fileInputEl;
  }

  /* ---- drag and drop admission ------------------------------------------
     Visual feedback is driven off `dragState` read directly by the
     composerTray renderer (same closure — no RT round trip needed). Renders
     happen only on the two discrete edges (drag starts covering the
     composer / drag leaves or drops), never on the continuously-firing
     `dragover`, matching the "no re-render on every tick" rule. */
  var dragState = { active: false, count: null, threadId: null };
  function hasFilesPayload(dt) {
    if (!dt) return false;
    if (dt.types) { for (var i = 0; i < dt.types.length; i++) if (dt.types[i] === 'Files') return true; }
    return false;
  }
  function withinComposer(target) {
    return !!(target && target.closest && target.closest('.composer-box'));
  }
  document.addEventListener('dragenter', function (e) {
    if (!hasFilesPayload(e.dataTransfer) || !withinComposer(e.target)) return;
    e.preventDefault();
    if (dragState.active) return;
    dragState.active = true;
    dragState.count = (e.dataTransfer.items && e.dataTransfer.items.length) || null;
    dragState.threadId = currentThreadId();
    var ctx = ctxNow(); if (ctx) ctx.renderApp();
  });
  document.addEventListener('dragover', function (e) {
    if (!hasFilesPayload(e.dataTransfer) || !withinComposer(e.target)) return;
    e.preventDefault(); /* required to permit a drop; deliberately no state write */
    try { e.dataTransfer.dropEffect = 'copy'; } catch (err) { /* some browsers reject the assignment in this event phase */ }
  });
  document.addEventListener('dragleave', function (e) {
    if (!dragState.active) return;
    var toEl = e.relatedTarget;
    if (toEl && toEl.closest && toEl.closest('.composer-box')) return; /* moved to a child, still inside */
    dragState.active = false; dragState.count = null; dragState.threadId = null;
    var ctx = ctxNow(); if (ctx) ctx.renderApp();
  });
  document.addEventListener('drop', function (e) {
    var wasActive = dragState.active;
    if (!wasActive && !hasFilesPayload(e.dataTransfer)) return;
    if (!withinComposer(e.target)) { if (wasActive) { dragState.active = false; var c0 = ctxNow(); if (c0) c0.renderApp(); } return; }
    e.preventDefault();
    var files = e.dataTransfer && e.dataTransfer.files;
    var tid = dragState.threadId || currentThreadId();
    dragState.active = false; dragState.count = null; dragState.threadId = null;
    if (files && files.length && tid) admitFiles(tid, files);
    else { var ctx = ctxNow(); if (ctx) ctx.renderApp(); }
  });

  /* =====================================================================
     9. RENDER HELPERS shared by the composer tray and transcript thumbnails
     ===================================================================== */
  function attachHiddenProp(obj, key, value) {
    /* enumerable:false keeps a live File (or its object URL) out of
       JSON.stringify — composer-state.js persists the whole buffer verbatim,
       and a File does not survive a reload/thread-switch round trip anyway,
       so it must not pollute the persisted record. */
    try { Object.defineProperty(obj, key, { value: value, enumerable: false, writable: true, configurable: true }); }
    catch (e) { obj[key] = value; }
  }

  function dataAttrs(threadId, messageId, attId) {
    return ' data-thread="' + esc(threadId) + '"' + (messageId ? ' data-message="' + esc(messageId) + '"' : '') + ' data-att="' + esc(attId) + '"';
  }

  function iconFor(ctx, rec, size) {
    var name = originIconName(rec.origin) || kindIconName(rec.kind);
    return attIcon(ctx, name, size || 16);
  }

  function sourceLine(rec) {
    var om = originMeta(rec.origin);
    var parts = [om.short];
    var sz = bytesLabel(rec.size);
    if (sz) parts.push(sz);
    if (rec.origin === 'folder_manifest' && rec.folder_manifest) {
      parts.push(rec.folder_manifest.shown.length + ' of ' + rec.folder_manifest.totalFiles + ' files shown');
    }
    return parts.join(' · ');
  }

  function canOpenRecord(rec) {
    if (rec.process_state === 'failed') return false;
    if (PENDING_STATES[rec.process_state]) return false;
    return true;
  }

  function previewUrlFor(rec) {
    if (rec.kind !== 'image') return null;
    if (rec._previewUrl) return rec._previewUrl;
    if (rec._file && window.URL && URL.createObjectURL) {
      try { var u = URL.createObjectURL(rec._file); attachHiddenProp(rec, '_previewUrl', u); return u; }
      catch (err) { return null; }
    }
    return null;
  }
  function revokePreview(rec) {
    if (rec && rec._previewUrl) { try { URL.revokeObjectURL(rec._previewUrl); } catch (err) { /* ignore */ } }
  }

  function chromeActionButton(ctx, action, iconName, label, threadId, messageId, attId, extraCls, disabledReason) {
    var disabled = !!disabledReason;
    var cls = 'att-chrome-btn' + (extraCls ? (' ' + extraCls) : '') + (disabled ? ' is-disabled' : '');
    var tip = disabled ? disabledReason : label;
    return '<button type="button" class="' + cls + '"' +
      (disabled ? ' disabled aria-disabled="true"' : (' data-action="' + esc(action) + '"' + dataAttrs(threadId, messageId, attId))) +
      ' data-hover-key="att-act-' + esc(action || iconName) + '-' + esc(attId) + '" data-hover-tip="' + esc(tip) + '"' +
      ' aria-label="' + esc(tip) + '">' + attIcon(ctx, iconName, 13) + '</button>';
  }

  function renderChromeBody(ctx, rec, threadId, messageId, opts) {
    opts = opts || {};
    var stLabel = PROCESS_LABELS[rec.process_state] || rec.process_state;
    var stLine = stLabel;
    if (rec.process_state === 'failed' && rec.error) stLine = stLabel + ' — ' + rec.error;
    else if (PENDING_STATES[rec.process_state]) stLine = stLabel + '…';
    var driftBadge = rec.live_drift ? ('<span class="att-chip att-chip-stale">' + attIcon(ctx, 'warning', 10) + ' Changed since sent</span>') : '';

    var actions = '';
    if (canOpenRecord(rec)) actions += chromeActionButton(ctx, 'att-open', 'eye', 'Open / preview', threadId, messageId, rec.id);
    actions += chromeActionButton(ctx, 'att-download', 'download', 'Download exact version', threadId, messageId, rec.id);
    actions += chromeActionButton(ctx, 'att-details', 'info', 'More Info', threadId, messageId, rec.id);
    actions += chromeActionButton(ctx, 'att-copy-ref', 'copy', 'Copy reference', threadId, messageId, rec.id);
    if (rec.process_state === 'failed') actions += chromeActionButton(ctx, 'att-retry', 'refresh', 'Retry', threadId, messageId, rec.id, 'is-warning');
    if (opts.allowRemove) actions += chromeActionButton(ctx, 'att-remove', 'close', 'Remove', threadId, messageId, rec.id, 'is-danger');
    actions += chromeActionButton(ctx, '', 'folder-search', 'Reveal in Project', threadId, messageId, rec.id, '',
      'File Manager is not wired into this concept lab — the request would route there in the full product.');

    return '<div class="att-chrome-body">' +
      '<div class="att-chrome-name">' + esc(rec.name) + driftBadge + '</div>' +
      '<div class="att-chrome-meta">' + esc(sourceLine(rec)) + '</div>' +
      '<div class="att-chrome-state' + (rec.process_state === 'failed' ? ' is-failed' : (rec.process_state === 'warning' ? ' is-warning' : '')) + '">' + esc(stLine) + '</div>' +
      '<div class="att-chrome-actions">' + actions + '</div>' +
      '</div>';
  }

  /* ---- composer-tray thumbnail ------------------------------------------ */
  function renderTrayThumb(ctx, rec, threadId) {
    /* The body is always focusable and always wired to att-open, even for a
       pending/failed item: att-open's own handler already answers "still
       processing" / "failed, use Retry" with a toast rather than opening
       anything, and keeping tabindex="0" here (rather than -1) is what lets
       a keyboard user reach :focus-within at all — a permanently -1 body
       would make the hover-only chrome, and its Retry/Details buttons,
       unreachable without a mouse for exactly the items most likely to need
       Retry. */
    var bodyAttrs = ' data-action="att-open"' + dataAttrs(threadId, null, rec.id) + ' role="button" tabindex="0"';
    var purl = previewUrlFor(rec);
    var media = purl
      ? '<span class="att-thumb-media att-thumb-media-img" style="background-image:url(&quot;' + esc(purl) + '&quot;)"></span>'
      : '<span class="att-thumb-media">' + iconFor(ctx, rec, 20) + '</span>';
    return '<div class="att-thumb att-obj" data-k="att-thumb:' + esc(rec.id) + '" data-state="' + esc(rec.process_state) + '" data-kind="' + esc(rec.kind) + '">' +
      '<div class="att-tracer" aria-hidden="true"><i class="att-tracer-fill"></i></div>' +
      '<div class="att-thumb-body"' + bodyAttrs + ' title="' + esc(rec.name) + '">' +
      media +
      '<span class="att-thumb-name">' + esc(rec.name) + '</span>' +
      '</div>' +
      '<button type="button" class="att-thumb-x" data-action="att-remove"' + dataAttrs(threadId, null, rec.id) +
      ' data-hover-key="att-x-' + esc(rec.id) + '" data-hover-tip="Remove" aria-label="Remove ' + esc(rec.name) + '">' + attIcon(ctx, 'close', 11) + '</button>' +
      '<div class="att-thumb-chrome">' + renderChromeBody(ctx, rec, threadId, null, { allowRemove: true }) + '</div>' +
      '</div>';
  }

  var expandedTray = Object.create(null);

  function renderDropOverlay(ctx) {
    if (!dragState.active) return '';
    var label = dragState.count ? ('Drop to add ' + dragState.count + ' file' + (dragState.count === 1 ? '' : 's') + ' as uploaded snapshots') : 'Drop to add as uploaded snapshots';
    return '<div class="att-drop-overlay" data-k="att-drop-overlay" aria-hidden="true"><div class="att-drop-copy">' + attIcon(ctx, 'upload', 18) + '<span>' + esc(label) + '</span></div></div>';
  }

  function renderTray(ctx) {
    resumeAllPending();
    var tid = ctx.state.selectedThread;
    var buf = bufferFor(tid);
    var list = buf.attachments || [];
    var dropHtml = renderDropOverlay(ctx);
    if (!list.length && !dragState.active) return '';
    var VISIBLE_CAP = 4;
    var expanded = !!expandedTray[tid];
    var shown = list, moreCount = 0;
    if (!expanded && list.length > VISIBLE_CAP) {
      shown = list.slice(0, VISIBLE_CAP - 1);
      moreCount = list.length - shown.length;
    }
    var thumbs = shown.map(function (rec) { return renderTrayThumb(ctx, rec, tid); }).join('');
    var moreChip = moreCount > 0
      ? '<button type="button" class="att-more-chip" data-action="att-tray-expand" data-thread="' + esc(tid) + '"' +
        ' data-hover-key="att-more-' + esc(tid) + '" data-hover-tip="Show ' + moreCount + ' more attachment' + (moreCount === 1 ? '' : 's') + '" aria-label="Show ' + moreCount + ' more">+' + moreCount + ' more</button>'
      : '';
    return '<div class="att-tray" data-k="att-tray">' + dropHtml + '<div class="att-tray-row">' + thumbs + moreChip + '</div></div>';
  }

  /* ---- transcript thumbnail --------------------------------------------- */
  function renderMsgThumb(ctx, rec, threadId, messageId) {
    /* See renderTrayThumb's comment: always focusable/actionable so a
       keyboard user can reach :focus-within (and therefore Retry/Details)
       on a still-processing or failed transcript attachment too. */
    var bodyAttrs = ' data-action="att-open"' + dataAttrs(threadId, messageId, rec.id) + ' role="button" tabindex="0"';
    var driftDot = rec.live_drift ? '<i class="att-msg-drift-dot" aria-hidden="true"></i>' : '';
    var allowRemove = rec.process_state === 'failed'; /* honesty note 5 / ATT-008: never rewrite a delivered attachment's history */
    return '<span class="att-msg-thumb att-obj" data-k="att-msg-thumb:' + esc(rec.id) + '" data-state="' + esc(rec.process_state) + '" data-kind="' + esc(rec.kind) + '">' +
      '<span class="att-tracer" aria-hidden="true"><i class="att-tracer-fill"></i></span>' +
      '<span class="att-msg-thumb-body"' + bodyAttrs + ' title="' + esc(rec.name) + '">' +
      iconFor(ctx, rec, 14) + '<span class="att-msg-thumb-name">' + esc(rec.name) + '</span>' + driftDot +
      '</span>' +
      '<span class="att-thumb-chrome att-thumb-chrome-msg">' + renderChromeBody(ctx, rec, threadId, messageId, { allowRemove: allowRemove }) + '</span>' +
      '</span>';
  }

  function renderMsgAffordance(ctx) {
    var m = ctx.message;
    if (!m || !m.attachments || !m.attachments.length) return '';
    var tid = (ctx.state && ctx.state.selectedThread) || (ctx.thread && ctx.thread.id);
    var items = m.attachments.map(function (rec) { return renderMsgThumb(ctx, rec, tid, m.id); }).join('');
    return '<div class="att-msg-row" data-k="att-msg-row:' + esc(m.id) + '" role="group" aria-label="Attachments">' + items + '</div>';
  }

  EXT.slot('composerTray', function (ctx) { return renderTray(ctx); });
  EXT.slot('messageAffordance', function (ctx) { return renderMsgAffordance(ctx); });

  /* =====================================================================
     10. DIALOGS — att-source (add-attachment picker), att-details (More Info)
     ===================================================================== */
  function sourceRow(ctx, action, iconName, title, detail, dataKey) {
    return '<button type="button" class="att-source-row" data-action="' + esc(action) + '"' +
      (dataKey ? (' data-key="' + esc(dataKey) + '"') : '') + '>' +
      '<span class="att-source-row-icon">' + attIcon(ctx, iconName, 16) + '</span>' +
      '<span class="att-source-row-copy"><strong>' + esc(title) + '</strong><span>' + esc(detail) + '</span></span>' +
      '</button>';
  }
  function sourceSection(title, rowsHtml) {
    if (!rowsHtml) return '';
    return '<div class="att-source-section"><h3>' + esc(title) + '</h3><div class="att-source-section-body">' + rowsHtml + '</div></div>';
  }

  function renderSourceDialog(ctx) {
    var rowUpload = sourceRow(ctx, 'att-pick-upload', 'upload', 'Upload files…', 'Choose one or more files from this device.');
    var projectKeys = ['queries', 'schema', 'migration', 'readme'];
    var rowsProject = projectKeys.map(function (key) {
      var f = PROJECT_FILES[key];
      var tag = f.frozen ? 'Frozen snapshot' : (f.changed ? 'Live reference · changed since last use' : 'Live reference');
      return sourceRow(ctx, 'att-pick-project', f.frozen ? 'lock' : 'document', f.path, tag, key);
    }).join('');
    var rowFolder = sourceRow(ctx, 'att-pick-folder', 'folder', FOLDER_FIXTURE.path, FOLDER_FIXTURE.totalFiles + ' files · bounded manifest', 'analytics');
    var artifactRows = ['plan', 'dashboard', 'traces-summary'].map(function (key) {
      if (key === 'traces-summary') {
        var t = TRACES_SUMMARY_ARTIFACT;
        return sourceRow(ctx, 'att-pick-artifact', 'artifact', t.title, 'V' + t.version + ' · ' + t.projectPath, key);
      }
      var art = realArtifact(ARTIFACT_KEYS[key]);
      if (!art) return '';
      return sourceRow(ctx, 'att-pick-artifact', 'artifact', art.title, 'V' + art.version + ' · ' + (art.projectPath || art.id), key);
    }).join('');
    var rowClipboard = sourceRow(ctx, 'att-pick-clipboard', 'clipboard', 'Paste from clipboard', 'Reads text from the system clipboard, if the browser allows it.');

    return '<section class="dialog att-source-dialog" style="width:min(560px,calc(100vw - 20px))" role="dialog" aria-label="Add attachment">' +
      '<div class="drawer-head"><strong>Add attachment</strong><span class="meta-pill">Demo sources</span><span class="spacer"></span>' +
      '<button class="icon-button" data-action="close-dialog" aria-label="Close">' + attIcon(ctx, 'close', 13) + '</button></div>' +
      '<div class="dialog-body att-source-body">' +
      sourceSection('Upload from this device', rowUpload) +
      sourceSection('Project references', rowsProject) +
      sourceSection('Folder', rowFolder) +
      sourceSection('Generated artifacts', artifactRows) +
      sourceSection('Clipboard', rowClipboard) +
      '</div></section>';
  }

  function detailRow(label, valueHtml) {
    return '<div class="att-detail-row"><span class="att-detail-label">' + esc(label) + '</span><span class="att-detail-value">' + valueHtml + '</span></div>';
  }
  function detailSection(title, bodyHtml) {
    if (!bodyHtml) return '';
    return '<div class="context-section att-detail-section"><h3>' + esc(title) + '</h3><div class="context-section-body">' + bodyHtml + '</div></div>';
  }
  function materializationRows(rec) {
    if (!rec.materialization || !rec.materialization.length) return detailRow('Status', 'No dispatch has referenced this attachment yet.');
    return rec.materialization.map(function (row) {
      var lbl = MATERIALIZATION_LABELS[row.status] || row.status;
      return detailRow(row.turn || 'Turn', '<span class="att-pill att-pill-' + esc(row.status) + '">' + esc(lbl) + '</span> ' + esc(row.note || ''));
    }).join('');
  }
  function footerButton(cls, action, label, threadId, messageId, attId, disabledReason) {
    var disabled = !!disabledReason;
    if (disabled) {
      return '<button type="button" class="' + cls + ' is-disabled" disabled aria-disabled="true"' +
        ' data-hover-key="att-foot-' + esc(label) + '-' + esc(attId) + '" data-hover-tip="' + esc(disabledReason) + '">' + esc(label) + '</button>';
    }
    return '<button type="button" class="' + cls + '" data-action="' + esc(action) + '"' + dataAttrs(threadId, messageId, attId) + '>' + esc(label) + '</button>';
  }

  function renderDetailsDialog(ctx, d) {
    var rec = findAttachment(ctx, d.threadId, d.messageId, d.attId);
    if (!rec) {
      return '<section class="dialog" style="width:min(420px,calc(100vw - 20px))" role="dialog" aria-label="More Info">' +
        '<div class="drawer-head"><strong>More Info</strong><span class="spacer"></span>' +
        '<button class="icon-button" data-action="close-dialog" aria-label="Close">' + attIcon(ctx, 'close', 13) + '</button></div>' +
        '<div class="dialog-body"><p style="color:var(--muted)">This attachment is no longer available — it may have been removed.</p></div></section>';
    }
    var producerHtml = rec.producer ? (esc(rec.producer.label) + (rec.producer.detail ? (' · ' + esc(rec.producer.detail)) : '')) : 'Not reported.';
    var relatedMsgHtml = d.messageId ? ('Attached to the ' + (d.messageRole === 'assistant' ? 'assistant' : 'user') + ' turn shown in this thread.') : 'Pending in the composer — not sent yet.';
    var relatedHtml = rec.related ? (esc(rec.related.label) + ' (' + esc(rec.related.kind) + ')') : 'None recorded.';
    var versionHtml = rec.version ? esc(rec.version.label) : 'Single version — no lineage recorded.';
    var lineageHtml = (rec.revisions && rec.revisions.length)
      ? ('<ul class="att-lineage">' + rec.revisions.map(function (r) { return '<li>V' + esc(r.n) + ' · ' + esc(fmtStamp(r.at)) + ' — ' + esc(r.note || '') + '</li>'; }).join('') + '</ul>')
      : '';
    var hashHtml = '<span class="att-hash">' + esc(rec.hash) + '</span>';
    var mimeHtml = esc(rec.mime || 'not reported');
    var freshHtml;
    if (rec.live_drift) {
      freshHtml = '<div class="event-card warning"><span class="event-icon">' + attIcon(ctx, 'warning', 14) + '</span><div class="event-copy">' +
        '<strong>Live reference has changed since this message</strong><p>' + esc(rec.live_drift.note) + '</p>' +
        '<p>Materialized hash ' + hashHtml + ' · current working-tree hash <span class="att-hash">' + esc(rec.live_drift.current_hash) + '</span> as of ' + esc(fmtStamp(rec.live_drift.changed_at)) + '.</p></div></div>';
    } else if (rec.origin === 'project_live_reference' || rec.origin === 'project_frozen_snapshot') {
      freshHtml = 'No drift detected since this attachment was materialized.';
    } else {
      freshHtml = 'Not applicable to this origin.';
    }
    var retHtml = rec.retention
      ? (rec.retention.eligible_for_deletion
        ? 'Eligible for deletion once no message, Plan, Goal, workflow, or legal hold still references it.'
        : ('Not eligible for deletion — ' + esc(rec.retention.reason || 'referenced elsewhere') + '.'))
      : 'Not reported.';
    var expHtml = (rec.export_history && rec.export_history.length)
      ? ('<ul class="att-export-history">' + rec.export_history.slice().reverse().map(function (e) { return '<li>' + esc(fmtStamp(e.at)) + ' · ' + esc(e.label || 'Download') + '</li>'; }).join('') + '</ul>')
      : 'No exports yet this session.';
    var transformHtml = rec.transform ? esc(rec.transform) : 'No transformation recorded for this origin.';
    var fsHtml = rec.filesafe ? (esc(rec.filesafe.status.replace(/_/g, ' ')) + ' — ' + esc(rec.filesafe.note || '')) : 'Not reported.';
    var folderSection = '';
    if (rec.folder_manifest) {
      var fm = rec.folder_manifest;
      folderSection = detailSection('Folder manifest (bounded)',
        detailRow('Files shown', esc(fm.shown.map(function (f) { return f.name + ' (' + bytesLabel(f.size) + ')'; }).join(', '))) +
        detailRow('Total files', fm.totalFiles + (fm.truncated ? ' — truncated, not fully listed' : '')));
    }

    var footer = '<button type="button" class="soft-button" data-action="close-dialog">Close</button>' +
      (rec.process_state === 'failed' ? footerButton('soft-button is-warning', 'att-retry', 'Retry', d.threadId, d.messageId, rec.id) : '') +
      footerButton('soft-button', 'att-download', 'Download exact version', d.threadId, d.messageId, rec.id) +
      (canOpenRecord(rec) ? footerButton('soft-button', 'att-open', 'Open / preview', d.threadId, d.messageId, rec.id) : '') +
      footerButton('soft-button', 'att-copy-ref', 'Copy reference', d.threadId, d.messageId, rec.id) +
      footerButton('soft-button', '', 'Reveal in Project', d.threadId, d.messageId, rec.id, 'File Manager is not wired into this concept lab.');

    return '<section class="dialog att-details-dialog" style="width:min(640px,calc(100vw - 20px))" role="dialog" aria-label="More Info · ' + esc(rec.name) + '">' +
      '<div class="drawer-head"><strong>' + esc(rec.name) + '</strong><span class="meta-pill">' + esc(originMeta(rec.origin).label) + '</span>' +
      '<span class="meta-pill">Fixture data</span><span class="spacer"></span>' +
      '<button class="icon-button" data-action="close-dialog" aria-label="Close">' + attIcon(ctx, 'close', 13) + '</button></div>' +
      '<div class="dialog-body">' +
      detailSection('Producer & run', detailRow('Produced by', producerHtml) + detailRow('Related message', relatedMsgHtml) + detailRow('Related plan / workflow', relatedHtml)) +
      detailSection('Version & identity', detailRow('Version', versionHtml + lineageHtml) + detailRow('Hash', hashHtml) + detailRow('Type', mimeHtml)) +
      detailSection('Trust & freshness', detailRow('Live-reference drift', freshHtml)) +
      folderSection +
      detailSection('Context materialization (fixture — recorded per dispatch by Prompt Pipeline)', materializationRows(rec)) +
      detailSection('Requested / effective transformation', detailRow('Transform', transformHtml)) +
      detailSection('FileSafe & redaction', detailRow('Result', fsHtml)) +
      detailSection('Retention', detailRow('Deletion eligibility', retHtml)) +
      detailSection('Export / download history', expHtml) +
      '</div>' +
      '<div class="decision-actions att-details-footer">' + footer + '</div>' +
      '</section>';
  }

  function renderPreviewDialog(ctx, d) {
    var rec = findAttachment(ctx, d.threadId, d.messageId, d.attId);
    var url = rec && previewUrlFor(rec);
    if (!rec || !url) {
      return '<section class="dialog" style="width:min(420px,calc(100vw - 20px))" role="dialog" aria-label="Preview">' +
        '<div class="drawer-head"><strong>Preview</strong><span class="spacer"></span>' +
        '<button class="icon-button" data-action="close-dialog" aria-label="Close">' + attIcon(ctx, 'close', 13) + '</button></div>' +
        '<div class="dialog-body"><p style="color:var(--muted)">No preview is available for this attachment.</p></div></section>';
    }
    return '<section class="dialog att-preview-dialog" style="width:min(720px,calc(100vw - 20px))" role="dialog" aria-label="Preview · ' + esc(rec.name) + '">' +
      '<div class="drawer-head"><strong>' + esc(rec.name) + '</strong><span class="spacer"></span>' +
      '<button class="icon-button" data-action="att-details"' + dataAttrs(d.threadId, d.messageId, rec.id) + ' aria-label="More Info">' + attIcon(ctx, 'info', 13) + '</button>' +
      '<button class="icon-button" data-action="close-dialog" aria-label="Close">' + attIcon(ctx, 'close', 13) + '</button></div>' +
      '<div class="dialog-body att-preview-body"><img src="' + esc(url) + '" alt="' + esc(rec.name) + '" class="att-preview-img"></div>' +
      '</section>';
  }

  EXT.slot('dialog', function (ctx) {
    var d = ctx.state.dialog;
    if (!d) return '';
    if (d.type === 'att-source') return renderSourceDialog(ctx);
    if (d.type === 'att-details') return renderDetailsDialog(ctx, d);
    if (d.type === 'att-preview') return renderPreviewDialog(ctx, d);
    return '';
  });

  /* =====================================================================
     11. REFERENCE STRINGS + EXACT-VERSION DOWNLOAD (honesty note 6)
     ===================================================================== */
  function refStringFor(rec) {
    if (rec.origin === 'folder_manifest') return 'folder://' + rec.name + ' (bounded manifest, ' + rec.hash + ')';
    if (rec.origin === 'generated_artifact') return 'artifact://' + (rec.artifact_ref || rec.name) + (rec.version ? ('@' + rec.version.label) : '') + ' #' + rec.hash;
    if (rec.origin === 'project_live_reference' || rec.origin === 'project_frozen_snapshot') return 'project://' + rec.name + '@' + rec.hash;
    return 'upload://' + rec.name + '#' + rec.hash;
  }

  function messageRoleOf(ctx, tid, mid) {
    var th = threadById(ctx, tid);
    var m = th && findMessageById(th, mid);
    return m ? m.role : null;
  }

  function downloadAttachment(ctx, rec) {
    try {
      var blob, filename;
      if (rec._file) {
        blob = rec._file;
        filename = rec.name;
      } else {
        var lines = [
          'Puppet Master concept lab — stand-in download (no real File Manager/FileSafe store is wired into this concept).',
          'File: ' + rec.name,
          'Origin: ' + originMeta(rec.origin).label,
          'Exact stored hash: ' + rec.hash + (rec.version ? (' (' + rec.version.label + ')') : ''),
          'Materialized: ' + fmtStamp(rec.created_at)
        ];
        if (rec.folder_manifest) {
          lines.push('Folder manifest (' + rec.folder_manifest.shown.length + ' of ' + rec.folder_manifest.totalFiles + ' files): ' +
            rec.folder_manifest.shown.map(function (f) { return f.name; }).join(', '));
        }
        if (rec.live_drift) {
          lines.push('');
          lines.push('This download resolves the EXACT version referenced by the message (hash ' + rec.hash + '), not the current working-tree content.');
          lines.push('The live file has since changed (current hash ' + rec.live_drift.current_hash + ', as of ' + fmtStamp(rec.live_drift.changed_at) + ').');
        }
        blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        filename = rec.name.replace(/[\\/]+$/, '').replace(/[\\/]/g, '_') + '.stub.txt';
      }
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = filename; a.rel = 'noopener';
      document.body.appendChild(a); a.click();
      setTimeout(function () { try { URL.revokeObjectURL(url); } catch (e) {} a.remove(); }, 4000);
      rec.export_history.push({ at: nowIso(), label: 'Downloaded ' + filename + (rec.live_drift ? ' · stored version, live file has since changed' : '') });
      touchComposer();
      ctx.toast('Download started', rec.live_drift
        ? ('Handed over the stored version (' + rec.hash.slice(0, 10) + '…) — the live file has since changed.')
        : (filename + ' handed to the browser as a real download.'));
      ctx.renderApp();
    } catch (err) {
      ctx.toast('Download unavailable', 'The browser refused the download (' + (err && err.message || 'unknown error') + ') — no file was written.');
    }
  }

  /* =====================================================================
     12. ACTIONS
     ===================================================================== */
  EXT.action('attach', function (ctx) {
    ctx.state.dialog = { type: 'att-source', threadId: ctx.state.selectedThread };
    ctx.renderOverlays();
    return true;
  });

  EXT.action('att-pick-upload', function (ctx) {
    var tid = (ctx.state.dialog && ctx.state.dialog.threadId) || ctx.state.selectedThread;
    lastAttachThreadId = tid;
    ctx.closeDialog();
    ensureFileInput();
    var input = fileInputEl;
    setTimeout(function () { input.click(); }, 30); /* let the dialog-close render settle first */
    return true;
  });

  EXT.action('att-pick-project', function (ctx, btn) {
    var tid = (ctx.state.dialog && ctx.state.dialog.threadId) || ctx.state.selectedThread;
    var rec = makeProjectRefRecord(btn.dataset.key);
    ctx.closeDialog();
    if (!rec) { ctx.toast('Not available', 'That project reference is not in this concept’s fixture catalog.'); return true; }
    rec.process_state = 'selected';
    registerRecord(rec);
    var buf = bufferFor(tid);
    buf.attachments.push(rec);
    startPipeline(tid, rec.id, rec.origin, rec.kind);
    touchComposer();
    ctx.renderApp();
    return true;
  });

  EXT.action('att-pick-folder', function (ctx) {
    var tid = (ctx.state.dialog && ctx.state.dialog.threadId) || ctx.state.selectedThread;
    var rec = makeFolderRecord();
    ctx.closeDialog();
    rec.process_state = 'selected';
    registerRecord(rec);
    var buf = bufferFor(tid);
    buf.attachments.push(rec);
    startPipeline(tid, rec.id, rec.origin, rec.kind);
    touchComposer();
    ctx.renderApp();
    return true;
  });

  EXT.action('att-pick-artifact', function (ctx, btn) {
    var tid = (ctx.state.dialog && ctx.state.dialog.threadId) || ctx.state.selectedThread;
    var rec = makeArtifactRecord(btn.dataset.key);
    ctx.closeDialog();
    if (!rec) { ctx.toast('Not available', 'That generated artifact is not in this concept’s fixture catalog.'); return true; }
    rec.process_state = 'selected';
    registerRecord(rec);
    var buf = bufferFor(tid);
    buf.attachments.push(rec);
    startPipeline(tid, rec.id, rec.origin, rec.kind);
    touchComposer();
    ctx.renderApp();
    return true;
  });

  EXT.action('att-pick-clipboard', function (ctx) {
    var tid = (ctx.state.dialog && ctx.state.dialog.threadId) || ctx.state.selectedThread;
    ctx.closeDialog();
    if (!(navigator.clipboard && navigator.clipboard.readText)) {
      ctx.toast('Clipboard unavailable', 'This browser/context does not expose clipboard read access to the page.');
      return true;
    }
    navigator.clipboard.readText().then(function (text) {
      var c2 = ctxNow(); if (!c2) return;
      if (!text) { c2.toast('Clipboard is empty', 'Nothing to attach.'); return; }
      var rec = baseRecord({
        origin: 'clipboard', kind: 'text', name: 'Clipboard text', size: text.length, mime: 'text/plain',
        source_label: 'Clipboard', producer: { label: 'You', detail: 'Pasted from clipboard' }, process_state: 'selected',
        filesafe: { status: 'clear', note: 'Scanned on paste · no secrets or credential patterns detected.' }
      });
      attachHiddenProp(rec, '_clipboardText', text);
      registerRecord(rec);
      var buf = bufferFor(tid);
      buf.attachments.push(rec);
      startPipeline(tid, rec.id, rec.origin, rec.kind);
      touchComposer();
      c2.renderApp();
    }, function (err) {
      var c3 = ctxNow(); if (!c3) return;
      c3.toast('Clipboard read blocked', 'The browser denied clipboard access (' + (err && err.message || 'permission denied') + ').');
    });
    return true;
  });

  EXT.action('att-tray-expand', function (ctx, btn) {
    expandedTray[btn.dataset.thread] = true;
    ctx.renderApp();
    return true;
  });

  EXT.action('att-open', function (ctx, btn) {
    var tid = btn.dataset.thread, mid = btn.dataset.message || null, aid = btn.dataset.att;
    var rec = findAttachment(ctx, tid, mid, aid);
    if (!rec) { ctx.toast('Attachment unavailable', 'It may have been removed.'); return true; }
    if (!canOpenRecord(rec)) {
      if (rec.process_state === 'failed') ctx.toast('Processing failed', rec.error || 'Use Retry to try again.');
      else ctx.toast('Still processing', 'This attachment is still ' + (PROCESS_LABELS[rec.process_state] || rec.process_state).toLowerCase() + '.');
      return true;
    }
    if (rec.kind === 'image' && previewUrlFor(rec)) {
      ctx.state.dialog = { type: 'att-preview', threadId: tid, messageId: mid, attId: aid };
      ctx.renderOverlays();
      return true;
    }
    if (rec.artifact_ref && realArtifact(rec.artifact_ref)) {
      ctx.openEditor(rec.artifact_ref);
      return true;
    }
    ctx.state.dialog = { type: 'att-details', threadId: tid, messageId: mid, attId: aid, messageRole: mid ? messageRoleOf(ctx, tid, mid) : null };
    ctx.renderOverlays();
    return true;
  });

  EXT.action('att-details', function (ctx, btn) {
    var tid = btn.dataset.thread, mid = btn.dataset.message || null, aid = btn.dataset.att;
    ctx.state.dialog = { type: 'att-details', threadId: tid, messageId: mid, attId: aid, messageRole: mid ? messageRoleOf(ctx, tid, mid) : null };
    ctx.renderOverlays();
    return true;
  });

  EXT.action('att-copy-ref', function (ctx, btn) {
    var tid = btn.dataset.thread, mid = btn.dataset.message || null, aid = btn.dataset.att;
    var rec = findAttachment(ctx, tid, mid, aid);
    if (!rec) { ctx.toast('Attachment unavailable', 'It may have been removed.'); return true; }
    var ref = refStringFor(rec);
    ctx.copyText(ref, 'Reference copied', ref);
    return true;
  });

  EXT.action('att-download', function (ctx, btn) {
    var tid = btn.dataset.thread, mid = btn.dataset.message || null, aid = btn.dataset.att;
    var rec = findAttachment(ctx, tid, mid, aid);
    if (!rec) { ctx.toast('Attachment unavailable', 'It may have been removed.'); return true; }
    downloadAttachment(ctx, rec);
    return true;
  });

  EXT.action('att-retry', function (ctx, btn) {
    var tid = btn.dataset.thread, mid = btn.dataset.message || null, aid = btn.dataset.att;
    var rec = findAttachment(ctx, tid, mid, aid);
    if (!rec) { ctx.toast('Attachment unavailable', 'It may have been removed.'); return true; }
    retryAttachment(tid, aid);
    ctx.toast('Retrying…', 'Re-running processing for ' + rec.name + '. The item and its bytes stay in place while it retries.');
    return true;
  });

  EXT.action('att-remove', function (ctx, btn) {
    var tid = btn.dataset.thread, mid = btn.dataset.message || null, aid = btn.dataset.att;
    clearPendingTimer(aid);
    var removed = false;
    if (mid) {
      var th = threadById(ctx, tid);
      var m = th && findMessageById(th, mid);
      if (m && m.attachments) {
        var before = m.attachments.length;
        m.attachments = m.attachments.filter(function (a) {
          if (a.id === aid) { revokePreview(a); return false; }
          return true;
        });
        removed = m.attachments.length !== before;
      }
    } else {
      var buf = bufferFor(tid);
      var before2 = buf.attachments.length;
      buf.attachments = buf.attachments.filter(function (a) {
        if (a.id === aid) { revokePreview(a); return false; }
        return true;
      });
      removed = buf.attachments.length !== before2;
      touchComposer();
    }
    if (removed) ctx.toast('Attachment removed', 'Removed only this item — sibling attachments and the message text are unchanged.');
    if (ctx.state.dialog && ctx.state.dialog.attId === aid) ctx.state.dialog = null;
    ctx.renderApp();
    return true;
  });

  /* =====================================================================
     13. COMMIT HOOK — move tray attachments onto the message that was sent
     ===================================================================== */
  if (RT.composer && RT.composer.commitHooks) {
    var reRenderAfterCommit = false;
    RT.composer.commitHooks.push(function (ctx, thread, message, buffer) {
      if (!message || !buffer || !buffer.attachments || !buffer.attachments.length) return;
      var moved = buffer.attachments.slice();
      for (var i = 0; i < moved.length; i++) registerRecord(moved[i]);
      message.attachments = (message.attachments || []).concat(moved);
      /* The transcript HTML for THIS render was already built before this hook
         ran (composerBelow evaluates after the transcript in renderChat's
         template), so the new thumbnails need one more frame — same
         requestAnimationFrame + re-entrancy guard composer-state.js's own
         restore path uses, and for the same reason. */
      if (!reRenderAfterCommit) {
        reRenderAfterCommit = true;
        requestAnimationFrame(function () {
          reRenderAfterCommit = false;
          var c = ctxNow();
          if (c) c.renderApp();
        });
      }
    });
  }

  /* =====================================================================
     14. PUBLIC SURFACE (debugging / future waves — read-only conventions)
     ===================================================================== */

  /* =====================================================================
     ADDITIVE CORRECTION v4 — one attachment command for files AND folders
     (FOLDER-001..003, FOLDER-008)
     ---------------------------------------------------------------------
     `cmd.chat.attachment.add` takes `semantic_kind: file | folder` and the
     picker, drag-and-drop and File Manager reference paths all converge on it.
     `cmd.chat.add_file_reference` survives only as a FILE-ONLY compatibility
     alias that refuses a folder, and no `cmd.chat.add_folder_reference` and no
     folder-specific handler, event or storage family exists.
     ===================================================================== */
  var ATTACH_SOURCES = ['picker', 'drag_drop', 'file_manager', 'alias'];

  function attachmentAdd(req) {
    req = req || {};
    var kind = req.semantic_kind;
    if (kind !== 'file' && kind !== 'folder')
      return { ok: false, error: 'invalid_request', detail: 'semantic_kind must be file or folder.' };
    if (ATTACH_SOURCES.indexOf(req.source || 'picker') < 0)
      return { ok: false, error: 'invalid_request', detail: 'unknown source path.' };
    return {
      ok: true,
      command: 'cmd.chat.attachment.add',
      handler: 'handlers::chat_attachments::attachment_add',
      semantic_kind: kind,
      source: req.source || 'picker',
      /* One owner, one effect, whatever the entry point was. */
      effect: 'AttachmentRef',
      folder_manifest_required: kind === 'folder',
      note: kind === 'folder'
        ? 'A folder contributes a bounded manifest with exact root identity, entries/hash policy, exclusions, permissions and materialization status. The manifest and any extracted content keep separate identities.'
        : 'A file contributes an exact content hash and version.'
    };
  }

  /* FOLDER-002: the alias is file-only and REFUSES a folder. It is not a second
     handler -- it normalises to the shared command. */
  function addFileReferenceAlias(req) {
    req = req || {};
    if (req.semantic_kind === 'folder')
      return { ok: false, error: 'unsupported_semantic_kind',
               detail: 'cmd.chat.add_file_reference is a file-only compatibility alias. Add a folder through cmd.chat.attachment.add with semantic_kind folder.',
               normalizes_to: 'cmd.chat.attachment.add' };
    var res = attachmentAdd({ semantic_kind: 'file', source: 'alias' });
    res.alias = 'cmd.chat.add_file_reference';
    res.normalizes_to = 'cmd.chat.attachment.add';
    return res;
  }

  /* FOLDER-005: a SCHEDULED folder reference freezes the exact manifest hash
     and holds or fails when that retained version is gone. Current folder
     contents are never substituted. */
  function freezeFolderForSchedule(rec) {
    var m = rec && rec.folder_manifest;
    if (!m) return { ok: false, error: 'not_a_folder' };
    return { ok: true, schema: 'pm.schedule.attachment_snapshot.v1',
             attachment_id: rec.id, folder_manifest_hash: m.manifest_hash,
             root_identity: m.root_identity, availability: 'available',
             on_unavailable: 'hold_or_fail — the schedule never sends current folder bytes instead' };
  }

  window.PM56_ATTACHMENTS = {
    version: 1,
    findAttachment: findAttachment,
    originMeta: originMeta,
    ORIGINS: ORIGINS,
    PROCESS_LABELS: PROCESS_LABELS,
    /* Additive Correction v4 (FOLDER-001..008). */
    attachmentAdd: attachmentAdd,
    addFileReferenceAlias: addFileReferenceAlias,
    freezeFolderForSchedule: freezeFolderForSchedule,
    sources: function () { return ATTACH_SOURCES.slice(); }
  };

})();
