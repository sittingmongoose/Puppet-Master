/* attachment-batch19.js — Batch 19: Attachments and bounded folders.
 * OWNER: B19 attachments delta. Covers v2:ATT-001..014 (REDESIGN_TRACEABILITY
 * statements) and v4:FOLDER-001..008 (FileManager.md Additive Correction v4,
 * F-084, SMSG-007..011, Prompt_Pipeline materialization, ACD-216 chips).
 *
 * THIS FILE OWNS
 * ---------------
 *   window.PM56_B19 = { admitViaCommand, addFileReference, commandCensus,
 *     freezeReferenceForTurn, materializeSelection, recordDispatchMaterialization,
 *     checkFolderDrift, saveToProject, requestDeletion, checkIntakeBounds,
 *     manifestForSelectedFolder, captureReferenceForSchedule }
 *   the `reference_capture` artifact renderer (capture-only scheduled refs);
 *   one RT.composer.commitHooks entry (per-turn capture + dispatch rows +
 *   retain holders). No slots, no actions, no second store.
 *
 * WHAT THIS FILE IS HONEST ABOUT
 * -------------------------------
 * 1. ONE COMMAND, ENFORCED AT THE CALL SITE. attachments.js admission routes
 *    (picker upload, drag/drop, project/folder/artifact reference rows,
 *    clipboard) call admitViaCommand(), which validates source+semantic_kind
 *    through the shared attachmentAdd() owner BEFORE any record is built. A
 *    refusal builds nothing. Seeded transcript fixtures predate the command
 *    surface and carry demo:true without a command stamp; the census exempts
 *    them explicitly rather than pretending they were admitted live.
 * 2. THE ALIAS IS FILE-ONLY. addFileReference() refuses semantic_kind folder
 *    and normalizes a file to cmd.chat.attachment.add; it never branches into
 *    a second handler. commandCensus() proves no cmd.chat.add_folder_reference
 *    (or any folder-specific command/handler/event/store) exists.
 * 3. CAPTURE, NOT EXECUTION. freezeReferenceForTurn/materializeSelection record
 *    exact hashes, versions and included/omitted lists the concept itself
 *    computed; they do not claim Prompt Pipeline or provider behavior. Receipt
 *    and manifest identities are separate objects; selecting content never
 *    mutates the attachment.
 * 4. saveToProject DELEGATES OR SAYS SO. FileSafe is not wired into this
 *    concept, so saveToProject() returns the exact delegation request it WOULD
 *    send plus an explicit filesafe_not_wired refusal. The Details button that
 *    calls it renders disabled with that reason. No file is written, moved, or
 *    claimed to be.
 * 5. NO NATIVE EFFECTS. Intake bounds (16 MiB/file, 32 MiB/selection, 256
 *    files) are enforced before bytes are read; violations refuse the whole
 *    selection with a stated reason. Session-local only.
 */
(function () {
  'use strict';
  var E = window.PM56_EXT; if (!E || !E.slot) return;
  var AT = window.PM56_ATTACHMENTS; if (!AT || !AT.attachmentAdd) return;
  var A = window.PM56_ARTIFACTS; if (!A) return;
  var RT = window.PM56_RUNTIME = window.PM56_RUNTIME || {};

  var uidSeq = 0;
  function b19Uid(prefix) {
    uidSeq += 1;
    return (prefix || 'b19') + '-' + Date.now().toString(36) + '-' + uidSeq.toString(36);
  }
  function nowIso() { return new Date().toISOString(); }
  function bad(error, detail) { return { ok: false, error: error, detail: detail || String(error).replace(/_/g, ' ') }; }

  /* =====================================================================
     1. COMMAND CONVERGENCE (FOLDER-001..003)
     ===================================================================== */
  var SOURCES = ['picker', 'drag_drop', 'file_manager', 'alias', 'clipboard'];

  /* Every live admission route calls this instead of building a record
     directly. `make` builds the attachment record; it runs ONLY after the
     shared command owner accepts the (source, semantic_kind) pair. */
  function admitViaCommand(req) {
    req = req || {};
    var source = req.source || 'picker';
    var kind = req.semantic_kind || 'file';
    var gate = AT.attachmentAdd({ semantic_kind: kind, source: source });
    if (!gate.ok) return gate;
    if (SOURCES.indexOf(source) < 0) return bad('invalid_request', 'unknown source path.');
    if (typeof req.make !== 'function') return bad('invalid_request', 'no record factory supplied.');
    var rec = req.make();
    if (!rec || typeof rec !== 'object') return bad('invalid_request', 'record factory produced nothing.');
    rec.command = 'cmd.chat.attachment.add';
    rec.source_path = source;
    rec.semantic_kind = kind;
    return { ok: true, record: rec, command: gate.command, handler: gate.handler };
  }

  /* FOLDER-002: the file-only compatibility alias. A folder is refused with
     the exact remediation; a file normalizes to the shared command. */
  function addFileReference(req) {
    req = req || {};
    if (req.semantic_kind === 'folder') return AT.addFileReferenceAlias({ semantic_kind: 'folder' });
    var res = AT.addFileReferenceAlias({ semantic_kind: 'file' });
    if (!res.ok) return res;
    if (typeof req.make === 'function') {
      var admitted = admitViaCommand({ source: 'alias', semantic_kind: 'file', make: req.make });
      if (!admitted.ok) return admitted;
      admitted.record.command = 'cmd.chat.add_file_reference';
      admitted.record.normalizes_to = 'cmd.chat.attachment.add';
      admitted.alias = res.alias;
      return admitted;
    }
    return res;
  }

  /* FOLDER-003 + F-084: the eight owned commands, the one alias, and proof
     that no folder-specific command/handler/event/store exists. */
  var OWNED_COMMANDS = [
    { id: 'cmd.chat.attachment.add', in_concept: 'admitViaCommand + att-pick-* / drop routes' },
    { id: 'cmd.chat.attachment.remove', in_concept: 'att-remove action' },
    { id: 'cmd.chat.attachment.retry', in_concept: 'att-retry action' },
    { id: 'cmd.chat.attachment.open', in_concept: 'att-open action' },
    { id: 'cmd.chat.attachment.download', in_concept: 'att-download action' },
    { id: 'cmd.chat.attachment.details', in_concept: 'att-details action' },
    { id: 'cmd.chat.attachment.freeze_reference', in_concept: 'freezeReferenceForTurn + schedule snapshot freeze' },
    { id: 'cmd.chat.attachment.save_to_project', in_concept: 'saveToProject (FileSafe delegation request; not wired)' }
  ];
  function commandCensus() {
    var extActions = (E._actions && Object.keys(E._actions)) || [];
    var folderSpecific = extActions.filter(function (name) {
      return /add_folder|folder_reference|folder_upload|folder_add/i.test(name);
    });
    var stores = [];
    if (window.PM56_FOLDER_STORE) stores.push('PM56_FOLDER_STORE');
    if (RT.folderAttachments && RT.folderAttachments !== RT.attachments) stores.push('RT.folderAttachments');
    return {
      ok: folderSpecific.length === 0 && stores.length === 0,
      commands: OWNED_COMMANDS.map(function (c) { return c.id; }),
      alias: 'cmd.chat.add_file_reference (file-only)',
      folder_specific_commands: folderSpecific,
      folder_specific_stores: stores,
      note: folderSpecific.length || stores.length
        ? 'Independent folder effect found; FOLDER-003 violated.'
        : 'No cmd.chat.add_folder_reference and no folder-specific handler, event, or storage family.'
    };
  }

  /* =====================================================================
     2. INTAKE BOUNDS + BOUNDED FOLDER MANIFESTS (ATT-010, FOLDER-004)
     ===================================================================== */
  var MAX_FILE = 16 * 1024 * 1024, MAX_TOTAL = 32 * 1024 * 1024, MAX_FILES = 256;

  /* Whole-selection refusal BEFORE any bytes are read. Mirrors the snapshot
     owner's limits so intake and scheduling never disagree. */
  function checkIntakeBounds(files) {
    var list = Array.isArray(files) ? files : [];
    if (!list.length) return bad('empty_selection', 'Nothing was selected.');
    if (list.length > MAX_FILES)
      return bad('snapshot_file_limit', 'This local concept accepts at most 256 files; no partial selection was kept.');
    var total = 0;
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      if (!f || typeof f.size !== 'number')
        return bad('invalid_selection', 'The selection contains an unreadable entry; nothing was kept.');
      if (f.size > MAX_FILE)
        return bad('snapshot_byte_limit', 'This local concept accepts 16 MiB per file; "' + (f.name || 'file') + '" exceeds it, so no partial selection was kept.');
      total += f.size;
      if (total > MAX_TOTAL)
        return bad('snapshot_byte_limit', 'This local concept accepts 32 MiB per selection; no partial selection was kept.');
    }
    return { ok: true, files: list.length, bytes: total };
  }

  /* FOLDER-004 manifest shape: exact root identity, entries/hash policy, the
     exclusions actually applied, the granted read scope, and materialization
     status. Built for device-selected folders; fixture folders already carry
     this shape from attachments.js. */
  var MANIFEST_EXCLUSIONS = ['node_modules/**', 'target/**', '*.lock', '.git/**'];
  function manifestForSelectedFolder(root, files) {
    var entries = (files || []).map(function (f) {
      return { path: f.webkitRelativePath || f.name, name: (f.webkitRelativePath || f.name).split('/').pop(), size: f.size };
    });
    entries.sort(function (a, b) { return a.path < b.path ? -1 : a.path > b.path ? 1 : 0; });
    var total = entries.reduce(function (n, f) { return n + f.size; }, 0);
    return {
      root_identity: root,
      totalFiles: entries.length,
      shown: entries,
      truncated: false,
      manifest_hash: null, /* assigned when the snapshot owner freezes the manifest */
      entries_policy: 'names and sizes only, depth unbounded within selection, ' + entries.length + ' of ' + entries.length + ' listed',
      hash_policy: 'manifest hashed at freeze; individual file bytes are hashed only when materialized',
      exclusions: MANIFEST_EXCLUSIONS.slice(),
      exclusions_note: 'Ignore rules declared by the concept; device selection already fixed the member set, so nothing further was filtered.',
      permissions: 'read-only, scoped to the selected device files for this session',
      materialization_status: 'selected_not_retained'
    };
  }

  /* =====================================================================
     3. PER-TURN CAPTURE + MATERIALIZATION TRUTH (ATT-007, ATT-012, FOLDER-008)
     ===================================================================== */
  /* ATT-007: a live reference retains the exact revision/hash materialized
     for EACH model turn, not just the latest. Called by the send commit hook
     and by the schedule-freeze path. */
  function freezeReferenceForTurn(rec, turn) {
    if (!rec || typeof rec !== 'object') return bad('invalid_attachment');
    if (rec.origin !== 'project_live_reference' && rec.origin !== 'project_frozen_snapshot' && rec.origin !== 'generated_artifact')
      return bad('capture_origin_unsupported', 'Only project and generated-artifact references carry per-turn captures.');
    rec.captured_turns = Array.isArray(rec.captured_turns) ? rec.captured_turns : [];
    var row = {
      turn: turn || 'unsent',
      captured_hash: rec.hash || null,
      captured_version: rec.version ? rec.version.label : null,
      captured_at: nowIso()
    };
    var last = rec.captured_turns[rec.captured_turns.length - 1];
    if (last && last.turn === row.turn && last.captured_hash === row.captured_hash)
      return { ok: true, replayed: true, row: last };
    rec.captured_turns.push(row);
    return { ok: true, row: row };
  }

  /* FOLDER-008: a materialization receipt is its OWN identity, separate from
     the manifest. Selecting content for a run records what was included and
     omitted and never mutates the attachment or its manifest. */
  function materializeSelection(rec, opts) {
    opts = opts || {};
    if (!rec || typeof rec !== 'object') return bad('invalid_attachment');
    var manifestHash = (rec.folder_manifest && (rec.folder_manifest.manifest_hash || rec.folder_manifest.root_identity)) || rec.hash || null;
    var before = JSON.stringify({ manifest: rec.folder_manifest || null, hash: rec.hash || null });
    var receipt = {
      receipt_id: b19Uid('mat'),
      schema: 'pm.concept.materialization_receipt.v1',
      attachment_id: rec.id || null,
      manifest_hash: manifestHash,
      turn: opts.turn || 'unsent',
      included: Array.isArray(opts.included) ? opts.included.slice() : [],
      omitted: Array.isArray(opts.omitted) ? opts.omitted.slice() : [],
      policy: opts.policy || 'bounded manifest selection; no recursive dump',
      created_at: nowIso()
    };
    rec.receipts = Array.isArray(rec.receipts) ? rec.receipts : [];
    rec.receipts.push(receipt);
    var after = JSON.stringify({ manifest: rec.folder_manifest || null, hash: rec.hash || null });
    if (before !== after) return bad('manifest_mutated', 'Selection must never mutate the attachment manifest.');
    return { ok: true, receipt: receipt };
  }

  /* ATT-012: deterministic per-dispatch rows derived from the record's OWN
     state (not from any model). History visibility never implies a future
     prompt inclusion; each row states what THIS dispatch did. */
  function dispatchStatusFor(rec) {
    if (!rec) return { status: 'omitted_by_budget', note: 'No attachment record.' };
    if (rec.process_state === 'failed' || (rec.filesafe && rec.filesafe.status === 'blocked'))
      return { status: 'blocked_by_policy', note: 'Never materialized — processing failed or the owner blocked it.' };
    if (rec.live_drift || rec.folder_drift)
      return { status: 'stale_reference', note: 'Materialized hash retained; the live source has since changed.' };
    if (rec.origin === 'folder_manifest')
      return { status: 'partially_materialized', note: 'Bounded manifest only — no recursive file contents were sent.' };
    if (rec.process_state !== 'ready')
      return { status: 'available', note: 'Visible in history; not yet processed, so nothing was sent.' };
    return { status: 'materialized', note: 'Exact retained version materialized within bounds.' };
  }

  function recordDispatchMaterialization(rec, turn) {
    if (!rec || typeof rec !== 'object') return bad('invalid_attachment');
    var s = dispatchStatusFor(rec);
    rec.materialization = Array.isArray(rec.materialization) ? rec.materialization : [];
    var row = { turn: turn || 'unsent', status: s.status, note: s.note, recorded_at: nowIso() };
    var last = rec.materialization[rec.materialization.length - 1];
    if (last && last.turn === row.turn && last.status === row.status)
      return { ok: true, replayed: true, row: last };
    rec.materialization.push(row);
    return { ok: true, row: row };
  }

  /* =====================================================================
     4. FOLDER DRIFT, SAVE-TO-PROJECT, RETENTION (FOLDER-006/007, ATT-013)
     ===================================================================== */
  /* FOLDER-006: a folder that changed after the message discloses captured
     versus current identity while preserving what the agent actually saw.
     The manifest and message history are never rewritten. */
  function checkFolderDrift(rec, current) {
    if (!rec || rec.origin !== 'folder_manifest' || !rec.folder_manifest)
      return bad('not_a_folder', 'Only folder-manifest attachments carry folder drift.');
    current = current || {};
    var captured = rec.folder_manifest.manifest_hash || rec.folder_manifest.root_identity;
    if (!current.manifest_hash || current.manifest_hash === captured) {
      rec.folder_drift = null;
      return { ok: true, changed: false };
    }
    rec.folder_drift = {
      captured_manifest_hash: captured,
      current_manifest_hash: current.manifest_hash,
      current_label: current.label || 'Current folder contents',
      changed_at: nowIso(),
      note: current.note || 'The folder changed after this message. The captured manifest below is what the agent saw.'
    };
    return { ok: true, changed: true, drift: rec.folder_drift };
  }

  /* F-084 save_to_project: delegates to FileSafe with exact path, permission
     and lineage binding. FileSafe is not wired into this concept, so this
     returns the exact request it WOULD send plus an explicit refusal. The
     Details button renders disabled with this reason; no write is performed
     or claimed. */
  function saveToProject(rec, opts) {
    opts = opts || {};
    if (!rec || typeof rec !== 'object') return bad('invalid_attachment');
    var request = {
      command: 'cmd.chat.attachment.save_to_project',
      delegates_to: 'FileSafe project write guard',
      attachment_id: rec.id || null,
      source_hash: rec.hash || null,
      source_version: rec.version ? rec.version.label : null,
      target_path: opts.path || null,
      permission: 'write:project-scope, explicit user confirmation required',
      lineage: { origin: rec.origin || null, thread_id: opts.threadId || null, message_id: opts.messageId || null }
    };
    if (!request.target_path)
      return { ok: false, error: 'save_path_required', request: request,
               detail: 'Choose a destination path first. FileSafe alone owns project writes.' };
    return { ok: false, error: 'filesafe_not_wired', request: request,
             detail: 'FileSafe is not wired into this concept lab — the request would route there in the full product. Nothing was written.' };
  }

  /* ATT-013: deletion cannot purge an artifact still referenced elsewhere.
     Retained snapshot artifacts go through the shared purge owner; the
     refusal names the blocking holder. Records with no retained artifact
     hold nothing to purge. */
  function requestDeletion(rec, holder) {
    if (!rec || typeof rec !== 'object') return bad('invalid_attachment');
    var ref = rec.snapshot_ref || rec.artifact_ref || null;
    if (!ref || !ref.artifact_id) return { ok: true, local_only: true,
      note: 'This record retains no shared artifact revision; removing the chip drops nothing else.' };
    var out = A.purge(ref);
    if (!out.ok) return { ok: false, error: out.error,
      detail: out.error === 'artifact_still_referenced'
        ? 'Not deleted: another message, schedule, or hold still references this exact revision.'
        : 'Deletion refused: ' + out.error + '.' };
    if (rec.retention) rec.retention.eligible_for_deletion = true;
    return { ok: true, purged: ref.artifact_id + '@V' + ref.artifact_version };
  }

  /* SMSG-007 capture branch for reference origins that carry no selectable
     bytes (live/frozen project refs, generated artifacts, external refs,
     source-control objects): freeze the EXACT hash/version at commit without
     retaining bytes. Returns a capture-only artifact revision the scheduler
     can resolve, retain and verify like any other snapshot. */
  function captureReferenceForSchedule(rec, scope, opts) {
    if (!rec || typeof rec !== 'object') return bad('invalid_attachment');
    var CAPTURABLE = { project_live_reference: 1, project_frozen_snapshot: 1, generated_artifact: 1,
      external_live_reference: 1, external_snapshot: 1, source_control_object: 1 };
    if (!CAPTURABLE[rec.origin]) return bad('capture_origin_unsupported', 'This origin needs selected bytes, not a capture.');
    if (!scope || !scope.projectId || !scope.threadId) return bad('capture_scope_required');
    var ref = { artifact_id: 'capture:' + scope.threadId + ':' + (rec.id || 'ref') + ':' + (rec.hash || 'nohash'),
      artifact_version: 1, project_id: scope.projectId, thread_id: scope.threadId };
    var q = { artifact_id: ref.artifact_id, artifact_version: 1, project_id: scope.projectId, thread_id: scope.threadId,
      renderer_kind: 'reference_capture', title: 'Captured reference · ' + (rec.name || rec.id),
      payload: { schema: 'pm.concept.reference_capture.v1', origin: rec.origin, name: rec.name || null,
        captured_hash: rec.hash || null, captured_version: rec.version ? rec.version.label : null,
        captured_at: nowIso(), note: 'Exact identity frozen at commit. No bytes retained; dispatch re-verifies availability, never substitutes latest.' },
      source_ref: { attachment_id: rec.id || null, source: 'exact_reference_capture' }, scan_status: 'not_scanned' };
    /* publish:false defers the write to the schedule transaction so a
       cancelled/failed form can never publish a detached capture. */
    if (opts && opts.publish === false)
      return { ok: true, ref: ref, q: q, frozen: frozenFor(rec, ref), deferred: true };
    var pub = A.publish(q);
    if (!pub.ok && !pub.replayed) return pub;
    return { ok: true, ref: ref, frozen: frozenFor(rec, ref), replayed: !!pub.replayed };
  }
  function frozenFor(rec, ref) {
    return { id: rec.id, name: rec.name, kind: rec.kind || 'file', origin: rec.origin,
      snapshot_ref: ref, artifact_ref: ref, content_hash: rec.hash || null,
      process_state: 'ready', captured_turns: rec.captured_turns || [] };
  }

  A.registerRenderer('reference_capture', function (q) {
    var p = q.payload || {};
    return '<p class="snapshot-note">Exact captured reference · no bytes retained</p>' +
      '<dl class="ar-identity"><dt>Origin</dt><dd>' + esc19(p.origin) + '</dd>' +
      '<dt>Captured hash</dt><dd><code>' + esc19(p.captured_hash) + '</code></dd>' +
      '<dt>Captured version</dt><dd>' + esc19(p.captured_version || 'single version') + '</dd></dl>' +
      '<p class="snapshot-note">Dispatch re-verifies this exact identity and holds or fails when it is unavailable.</p>';
  });
  function esc19(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* =====================================================================
     5. SEND COMMIT HOOK — per-turn truth is recorded, never inferred later
     ===================================================================== */
  if (RT.composer && RT.composer.commitHooks) {
    RT.composer.commitHooks.push(function (ctx, thread, message, buffer) {
      if (!message || !message.attachments || !message.attachments.length) return;
      var turn = (message.id || 'sent') + '';
      for (var i = 0; i < message.attachments.length; i++) {
        var rec = message.attachments[i];
        if (!rec || typeof rec !== 'object') continue;
        if (rec.origin === 'project_live_reference' || rec.origin === 'project_frozen_snapshot' || rec.origin === 'generated_artifact')
          freezeReferenceForTurn(rec, turn);
        recordDispatchMaterialization(rec, turn);
        var ref = rec.snapshot_ref || rec.artifact_ref;
        if (ref && ref.artifact_id && message.id) {
          try { A.retain(ref, { kind: 'message', id: message.id }); } catch (e) { /* retain is additive; a failure must not break send */ }
        }
      }
    });
  }

  window.PM56_B19 = {
    version: 1,
    admitViaCommand: admitViaCommand,
    addFileReference: addFileReference,
    commandCensus: commandCensus,
    checkIntakeBounds: checkIntakeBounds,
    manifestForSelectedFolder: manifestForSelectedFolder,
    freezeReferenceForTurn: freezeReferenceForTurn,
    materializeSelection: materializeSelection,
    recordDispatchMaterialization: recordDispatchMaterialization,
    checkFolderDrift: checkFolderDrift,
    saveToProject: saveToProject,
    requestDeletion: requestDeletion,
    captureReferenceForSchedule: captureReferenceForSchedule,
    limits: function () { return { fileBytes: MAX_FILE, totalBytes: MAX_TOTAL, files: MAX_FILES }; }
  };
})();
