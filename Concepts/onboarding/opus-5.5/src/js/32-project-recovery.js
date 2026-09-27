/* O55.projectRecovery — Project creation recovery consumer (PJCT-007/PJCT-008, PWIZ-021, FGI-021).
   The Creating screen delegates every recovery decision here so the semantics stay exact and testable:
   - Only the exact cmd.project.new_github_repo / GI-042 chain anchors a remote-create recovery. new_local
     never does; add_existing has no owned remote-create chain today. No generic recovery authority.
   - An exact replay of the original terminal key re-observes the retained result with no new effect.
   - A verified-created remote with failed local setup retains its recovery/composition/evidence and advances
     only through a fresh cmd.project.resume_creation attempt fenced by one active claim; settled effects
     never rerun. Failure before any remote effect offers reviewed safe-new-attempt choices only. An
     unknown remote outcome is reconciliation-only: no retry, create, continue, delete, or inferred identity.
   - Continue Setup, Open Repository, Delete Repository project the retained owner route availability.
     Open dispatches only cmd.forge.repository.open_in_browser on the verified binding; Delete is a separate
     target-confirmed cmd.forge.repository.delete, never automatic rollback, never Project-local.
   - Remote verdicts arrive only as deliberately injected owner-shaped results adopted through the shared
     O55.ownerResults seam (operation/target/generation/nonce/postcondition gates). Transport timers never
     fabricate a remote outcome, and concept booleans never grant dispatch authority: without a host the
     concept always fails closed.
   Consumed owner-shaped result fields are documented in
   reports/packet-integration-completion-20260926/project-concept-consumer.md. */
(function () {
  'use strict';
  const O55 = window.O55, U = O55.util;

  const NEW_GITHUB_REPO = 'cmd.project.new_github_repo';
  const RESUME_CREATION = 'cmd.project.resume_creation';
  const OPEN_IN_BROWSER = 'cmd.forge.repository.open_in_browser';
  const REPOSITORY_DELETE = 'cmd.forge.repository.delete';
  const EFFECTS = ['remote_repository_create', 'source_preparation', 'clone_connect', 'history_init',
    'settings_rebind_apply', 'registry_publication'];
  const REMOTE_STATES = ['verified_created', 'failed_before_effect', 'unknown'];
  const SHA256 = /^[0-9a-f]{64}$/;
  const nonEmpty = (v) => typeof v === 'string' && v.length > 0;

  /* The exact owned chain. Everything else keeps its current fixture journey with no recovery claim. */
  function isGithubRemoteChain(d) {
    return !!d && d.project_mode === 'new' && d.online_mode === 'new' && d.forge === 'github';
  }
  function originalCommandFor(d) {
    if (!d || d.project_mode === 'later') return null;
    if (isGithubRemoteChain(d)) return NEW_GITHUB_REPO;
    return d.project_mode === 'new' ? 'cmd.project.new_local' : 'cmd.project.add_existing';
  }
  /* A private destination reservation: never listed, selected, emitted, or bound until the terminal
     listed/persisted result publishes it. */
  function reserveDestinationId(d) {
    return 'pending:' + d.project_draft_ref + ':r' + d.project_draft_revision;
  }
  function beginOriginal(cm, d) {
    const cmd = originalCommandFor(d);
    const tag = U.slug(String(d.project_draft_ref || '')).slice(0, 40) + ':r' + (d.project_draft_revision || 1);
    const short = cmd === NEW_GITHUB_REPO ? 'new-github' : (d.project_mode === 'new' ? 'new-local' : 'add-existing');
    cm.original = { command: cmd, instance: 'command:project:' + short + ':' + tag,
      key: 'idempotency:project:' + short + ':' + tag, operation_ref: 'operation:project:' + short + ':' + tag,
      draft_revision: d.project_draft_revision || 1 };
    return cm.original;
  }

  /* Display-only route fallback when an adopted report carries no owner route projection. It is never
     dispatch authority: effective dispatch stays unavailable without a host (see effectiveContinue). */
  function derivedRoutes(state) {
    if (state === 'verified_created') return {
      continue_setup: { available: false, reason: 'central_dispatch_unavailable', resume_eligible: true, eligible_reason: 'owner_join_holds' },
      open_repository: { available: true, reason: 'verified_binding_present' },
      delete_repository: { available: false, reason: 'forge_owner_gated' } };
    if (state === 'unknown') return {
      continue_setup: { available: false, reason: 'remote_unknown_reconcile_only', resume_eligible: false, eligible_reason: 'owner_join_not_held' },
      open_repository: { available: false, reason: 'no_verified_binding' },
      delete_repository: { available: false, reason: 'remote_unknown_reconcile_only' } };
    return {
      continue_setup: { available: false, reason: 'no_verified_remote_identity', resume_eligible: false, eligible_reason: 'owner_join_not_held' },
      open_repository: { available: false, reason: 'no_verified_binding' },
      delete_repository: { available: false, reason: 'no_verified_binding' } };
  }
  function validBinding(b) {
    return !!b && nonEmpty(b.provider) && nonEmpty(b.normalized_host) && nonEmpty(b.account_id) && nonEmpty(b.provider_repository_id);
  }
  function sameBinding(a, b) {
    return !!a && !!b && a.provider === b.provider && a.normalized_host === b.normalized_host &&
      a.account_id === b.account_id && a.provider_repository_id === b.provider_repository_id;
  }

  function beginCreateRequest(OR, cm, d) {
    if (!cm.or_create) cm.or_create = OR.begin(NEW_GITHUB_REPO, { project: d.project_draft_ref, generation: d.project_draft_revision });
    return cm.or_create;
  }
  /* Adopt the owner's terminal create report. Replaying an already-settled recovery is refused here:
     replayOriginal() is the only re-observe path. Checks run before the seam adoption so a refused
     report consumes nothing. */
  function adoptCreateResult(OR, cm, d, res) {
    if (!res) return { ok: false, reason: 'pending_no_result' };
    if (!cm.or_create) return { ok: false, reason: 'create_not_armed' };
    const state = res.remote_effect;
    if (!REMOTE_STATES.includes(state)) return { ok: false, reason: 'remote_effect_unknown' };
    if (!nonEmpty(res.terminal_result_ref) || !SHA256.test(res.terminal_result_sha256 || '')) return { ok: false, reason: 'terminal_ref_missing' };
    if (!Number.isInteger(res.composition_revision) || res.composition_revision < 1 || !SHA256.test(res.composition_sha256 || '')) return { ok: false, reason: 'composition_missing' };
    const bind = res.reviewed_setup_binding || {};
    if (bind.project_draft_ref !== d.project_draft_ref || bind.project_draft_revision !== d.project_draft_revision) return { ok: false, reason: 'stale_setup_binding' };
    if (state === 'verified_created' && (!validBinding(res.repository_binding) || !nonEmpty(res.forge_create_result_ref) || !nonEmpty(res.forge_create_receipt_ref))) {
      return { ok: false, reason: 'binding_missing' };
    }
    if (cm.recovery && cm.recovery.remote_effect_state !== 'unknown') return { ok: false, reason: 'recovery_already_settled' };
    if (cm.recovery && (res.recovery_id !== cm.recovery.recovery_id || res.composition_revision < cm.recovery.composition_revision)) {
      return { ok: false, reason: 'recovery_mismatch' };
    }
    if (!nonEmpty(res.recovery_id)) return { ok: false, reason: 'recovery_id_missing' };
    if (res.accepted === true) {
      if (state !== 'verified_created' || !nonEmpty(res.listed_project_id)) return { ok: false, reason: 'listed_evidence_missing' };
      const se = res.settled_effects || {};
      for (const e of EFFECTS) {
        if (!se[e] || !nonEmpty(se[e].result_ref) || !nonEmpty(se[e].receipt_ref)) return { ok: false, reason: 'effect_ref_missing' };
      }
      if (se.remote_repository_create.result_ref !== res.forge_create_result_ref ||
          se.remote_repository_create.receipt_ref !== res.forge_create_receipt_ref) {
        return { ok: false, reason: 'effect_ref_missing' };
      }
    }
    const retained = res.settled_effects || {};
    for (const [effect, evidence] of Object.entries(retained)) {
      if (!EFFECTS.includes(effect) || !evidence || !nonEmpty(evidence.result_ref) || !nonEmpty(evidence.receipt_ref)) return { ok: false, reason: 'effect_ref_missing' };
      if (state !== 'verified_created') return { ok: false, reason: 'effect_state_mismatch' };
      if (effect === 'remote_repository_create' && (evidence.result_ref !== res.forge_create_result_ref || evidence.receipt_ref !== res.forge_create_receipt_ref)) return { ok: false, reason: 'effect_ref_mismatch' };
    }
    const v = OR.adopt(cm.or_create, res, { generation: d.project_draft_revision });
    if (!v.ok) return v;
    const settled = JSON.parse(JSON.stringify(retained));
    if (state === 'verified_created') {
      settled.remote_repository_create = { result_ref: res.forge_create_result_ref, receipt_ref: res.forge_create_receipt_ref };
    }
    const remaining = EFFECTS.filter((e) => !settled[e]);
    cm.recovery = { recovery_id: res.recovery_id, original_command_id: NEW_GITHUB_REPO,
      original_command_instance_id: cm.original && cm.original.instance, original_idempotency_key: cm.original && cm.original.key,
      original_operation_ref: cm.original && cm.original.operation_ref,
      original_terminal_result_ref: res.terminal_result_ref, original_terminal_result_sha256: res.terminal_result_sha256,
      reviewed_setup_binding: bind, remote_effect_state: state,
      forge_create_result_ref: state === 'verified_created' ? res.forge_create_result_ref : null,
      forge_create_receipt_ref: state === 'verified_created' ? res.forge_create_receipt_ref : null,
      repository_binding: state === 'verified_created' ? res.repository_binding : null,
      reconciliation_refs: Array.isArray(res.reconciliation_refs) ? res.reconciliation_refs.slice(0, 32) : [],
      settled_effects: settled, remaining_effects: remaining, active_resume_claim: null,
      composition_revision: res.composition_revision, composition_sha256: res.composition_sha256,
      route_availability: res.route_availability || derivedRoutes(state),
      failure_reason: res.failure_reason || null };
    cm.or_resume = null; cm.resumeAttempt = null; cm.deleteConfirm = false; cm.deleteReceipt = null;
    /* An accepted terminal report lists the Project at once: no recovery round is needed. */
    if (res.accepted === true && state === 'verified_created' && nonEmpty(res.listed_project_id)) {
      EFFECTS.forEach((e) => { settled[e] = { result_ref: res.settled_effects[e].result_ref, receipt_ref: res.settled_effects[e].receipt_ref }; });
      cm.recovery.remaining_effects = [];
      cm.publishable = { project_id: res.listed_project_id, via: 'accepted_create' };
    } else {
      cm.publishable = null;
    }
    return { ok: true, state };
  }
  /* Original terminal-key replay: re-observe the retained result. No new effect, no identity change. */
  function replayOriginal(cm) {
    const r = cm.recovery;
    if (!r) return { ok: false, reason: 'nothing_retained' };
    cm.replayCount = (cm.replayCount || 0) + 1;
    return { ok: true, replayed: true, terminal_result_ref: r.original_terminal_result_ref,
      terminal_result_sha256: r.original_terminal_result_sha256,
      settled_effect_names: Object.keys(r.settled_effects), remaining_effects: r.remaining_effects.slice() };
  }

  /* A fresh resume attempt identity, bound to the retained recovery. Forming it is not dispatch. */
  function formResumeAttempt(cm) {
    const r = cm.recovery;
    cm.resumeSeq = Math.max(cm.resumeSeq || 1, 1) + 1;
    const tag = U.slug(String(r.recovery_id || '')).slice(0, 32) + ':a' + cm.resumeSeq;
    cm.resumeAttempt = { command: RESUME_CREATION, instance: 'command:project:resume:' + tag,
      key: 'idempotency:project:resume:' + tag, sequence: cm.resumeSeq,
      authorization_ref: 'consent:project-resume:' + tag };
    return cm.resumeAttempt;
  }
  function armResumeRequest(OR, cm, d) {
    if (!cm.recovery || cm.recovery.remote_effect_state !== 'verified_created') return { ok: false, reason: 'no_verified_recovery' };
    if (!cm.or_resume) { formResumeAttempt(cm); cm.or_resume = OR.begin(RESUME_CREATION, { project: d.project_draft_ref, generation: d.project_draft_revision }); }
    return { ok: true, attempt: cm.resumeAttempt, request: cm.or_resume };
  }
  /* Adopt an owner resume result: one active fenced claim, remaining effects only, exact composition.
     Concept checks run before the seam adoption so a refused result consumes nothing. */
  function adoptResumeResult(OR, cm, d, res) {
    const r = cm.recovery;
    if (!r || r.remote_effect_state !== 'verified_created') return { ok: false, reason: 'no_verified_recovery' };
    if (!res) return { ok: false, reason: 'pending_no_result' };
    if (!cm.or_resume || !cm.resumeAttempt) return { ok: false, reason: 'resume_not_armed' };
    const att = res.attempt || {};
    if (!nonEmpty(att.command_instance_id) || !nonEmpty(att.idempotency_key) || !(att.sequence >= 2) ||
        att.command_instance_id.indexOf('command:project:resume:') !== 0 || att.idempotency_key.indexOf('idempotency:project:resume:') !== 0 ||
        att.idempotency_key === (cm.original && cm.original.key) ||
        att.command_instance_id !== cm.resumeAttempt.instance || att.idempotency_key !== cm.resumeAttempt.key ||
        att.sequence !== cm.resumeAttempt.sequence || !Number.isInteger(att.claim_generation) || att.claim_generation < 1 ||
        !nonEmpty(att.claimed_at_utc)) {
      return { ok: false, reason: 'resume_identity_invalid' };
    }
    const claim = r.active_resume_claim;
    if (claim && (claim.attempt_command_instance_id !== att.command_instance_id || claim.attempt_idempotency_key !== att.idempotency_key || claim.claim_generation !== att.claim_generation)) {
      return { ok: false, reason: 'concurrent_resume_active' };
    }
    if (res.recovery_ref !== r.recovery_id || res.recovery_composition_revision !== r.composition_revision ||
        res.recovery_composition_sha256 !== r.composition_sha256) {
      return { ok: false, reason: 'stale_composition' };
    }
    const now = res.settled_now || {};
    const names = Object.keys(now);
    if (!names.length) return { ok: false, reason: 'no_effects_settled' };
    for (const e of names) {
      if (!r.remaining_effects.includes(e)) return { ok: false, reason: 'settled_effect_repeated' };
      if (!nonEmpty(now[e].result_ref) || !nonEmpty(now[e].receipt_ref)) return { ok: false, reason: 'effect_ref_missing' };
    }
    const left = r.remaining_effects.filter((e) => !names.includes(e));
    const want = Array.isArray(res.remaining_effects) ? res.remaining_effects : null;
    if (!want || want.length !== left.length || !left.every((e) => want.includes(e))) return { ok: false, reason: 'remaining_mismatch' };
    if (!left.length && !nonEmpty(res.listed_project_id)) return { ok: false, reason: 'listed_evidence_missing' };
    const v = OR.adopt(cm.or_resume, res, { generation: d.project_draft_revision });
    if (!v.ok) return v;
    if (!claim) {
      r.active_resume_claim = { attempt_command_instance_id: att.command_instance_id, attempt_idempotency_key: att.idempotency_key,
        claim_generation: att.claim_generation, claimed_at_utc: att.claimed_at_utc };
    }
    names.forEach((e) => { r.settled_effects[e] = { result_ref: now[e].result_ref, receipt_ref: now[e].receipt_ref }; });
    r.remaining_effects = left;
    if (res.route_availability) r.route_availability = res.route_availability;
    cm.publishable = !left.length && r.settled_effects.registry_publication
      ? { project_id: res.listed_project_id, via: 'resume' } : null;
    return { ok: true, settled: names, remaining: left.slice(), publishable: cm.publishable };
  }

  /* Effective Continue Setup dispatch. The owner join may hold while dispatch stays unavailable; without
     a host the concept always fails closed with the exact reason. */
  function effectiveContinue(OR, cm, d) {
    const r = cm.recovery;
    if (!r || r.remote_effect_state !== 'verified_created') return { available: false, reason: r && r.remote_effect_state === 'unknown' ? 'remote_unknown_reconcile_only' : 'no_verified_remote_identity' };
    const retained = (r.route_availability || {}).continue_setup || {};
    const draftCurrent = (r.reviewed_setup_binding || {}).project_draft_revision === d.project_draft_revision &&
      (r.reviewed_setup_binding || {}).project_draft_ref === d.project_draft_ref;
    const claim = r.active_resume_claim;
    const claimLive = !claim || !cm.resumeAttempt ||
      (claim.attempt_command_instance_id === cm.resumeAttempt.instance && claim.attempt_idempotency_key === cm.resumeAttempt.key);
    if (!draftCurrent) return { available: false, reason: 'stale_setup_binding' };
    if (!claimLive) return { available: false, reason: 'concurrent_resume_active' };
    return { available: false, reason: retained.reason === 'concurrent_resume_active' ? 'concurrent_resume_active' : 'central_dispatch_unavailable' };
  }
  function effectiveOpen(cm) {
    const r = cm.recovery;
    if (!r || r.remote_effect_state !== 'verified_created' || !validBinding(r.repository_binding)) {
      return { available: false, reason: 'no_verified_binding' };
    }
    const retained = (r.route_availability || {}).open_repository || {};
    if (retained.available === false) return { available: false, reason: retained.reason || 'no_verified_binding' };
    return { available: false, reason: 'central_dispatch_unavailable' };
  }
  function effectiveDelete(cm) {
    const r = cm.recovery;
    if (!r) return { available: false, reason: 'no_verified_binding' };
    if (r.remote_effect_state === 'unknown') return { available: false, reason: 'remote_unknown_reconcile_only' };
    if (r.remote_effect_state !== 'verified_created' || !validBinding(r.repository_binding)) {
      return { available: false, reason: 'no_verified_binding' };
    }
    return { available: false, reason: 'forge_owner_gated' };
  }

  function beginDeleteRequest(OR, cm, d) {
    const g = effectiveDelete(cm);
    if (g.reason !== 'forge_owner_gated' || !cm.deleteConfirm) return { ok: false, reason: cm.deleteConfirm ? g.reason : 'delete_not_confirmed' };
    if (!cm.or_delete) cm.or_delete = OR.begin(REPOSITORY_DELETE, { project: d.project_draft_ref, generation: d.project_draft_revision });
    return { ok: true, request: cm.or_delete };
  }
  /* Adopt a Forge delete result. It records its own receipt only: never rollback, never recovery
     mutation, never Project-local execution. */
  function adoptDeleteResult(OR, cm, d, res) {
    const r = cm.recovery;
    if (!r || r.remote_effect_state !== 'verified_created') return { ok: false, reason: 'no_verified_recovery' };
    if (!res) return { ok: false, reason: 'pending_no_result' };
    if (!cm.deleteConfirm) return { ok: false, reason: 'delete_not_confirmed' };
    if (!cm.or_delete) return { ok: false, reason: 'delete_not_armed' };
    if (!sameBinding(res.target_binding, r.repository_binding)) return { ok: false, reason: 'delete_target_mismatch' };
    if (res.verified_create_result_ref !== r.forge_create_result_ref || res.verified_create_receipt_ref !== r.forge_create_receipt_ref) {
      return { ok: false, reason: 'delete_ref_mismatch' };
    }
    if (!nonEmpty(res.delete_result_ref) || !nonEmpty(res.delete_receipt_ref)) return { ok: false, reason: 'delete_ref_missing' };
    const v = OR.adopt(cm.or_delete, res, { generation: d.project_draft_revision });
    if (!v.ok) return v;
    cm.deleteReceipt = { result_ref: res.delete_result_ref, receipt_ref: res.delete_receipt_ref };
    return { ok: true };
  }

  /* Pending-destination Settings staging through the build.py SETTINGS_EXPOSE bridge. The bound
     reservation and current reviewed draft travel with every call; the bridge never touches the
     selected Project. Target, currentness, and adopted receipt are checked here, not trusted. */
  function stagePendingSettings(st, cm, d, sourceId, cats, opts) {
    if (!st || typeof st.applyPending !== 'function') return { ok: false, reason: 'settings_owner_missing' };
    const res = st.applyPending(sourceId, { destination_project_id: cm.pendingProjectId,
      draft_ref: d.project_draft_ref, draft_revision: d.project_draft_revision, fixture_project_id: cm.fixtureProjectId }, cats, opts || {});
    if (!res || !res.ok) return { ok: false, reason: (res && res.reason) || 'settings_rejected' };
    if (res.destination_project_id !== cm.pendingProjectId) return { ok: false, reason: 'settings_target_mismatch' };
    if (res.source_project_id !== sourceId) return { ok: false, reason: 'settings_source_mismatch' };
    if (res.draft_revision !== d.project_draft_revision) return { ok: false, reason: 'settings_draft_stale' };
    if (!nonEmpty(res.receipt)) return { ok: false, reason: 'settings_receipt_missing' };
    cm.stagedSettings = { key: res.reservation_key || cm.pendingProjectId, destination: cm.pendingProjectId,
      source: sourceId, receipt: res.receipt, count: res.count || 0, fixture: !!res.fixtureMode };
    return { ok: true, count: cm.stagedSettings.count, fixture: cm.stagedSettings.fixture };
  }
  function publishStagedSettings(st, cm, projectId, d) {
    if (!cm.stagedSettings) return { ok: true, published: false };
    if (!nonEmpty(projectId)) return { ok: false, reason: 'settings_publish_no_target' };
    if (!st || typeof st.publishPending !== 'function') return { ok: false, reason: 'settings_owner_missing' };
    const res = st.publishPending(cm.stagedSettings.key, projectId, { draft_ref: d.project_draft_ref, draft_revision: d.project_draft_revision });
    if (!res || !res.ok) return { ok: false, reason: (res && res.reason) || 'settings_publish_failed' };
    if (res.project_id !== projectId) return { ok: false, reason: 'settings_target_mismatch' };
    cm.stagedSettings = null;
    return { ok: true, published: true, project_id: projectId };
  }
  function discardStagedSettings(st, cm) {
    if (!cm.stagedSettings) return { ok: true, discarded: false };
    try { if (st && typeof st.discardPending === 'function') st.discardPending(cm.stagedSettings.key); } catch (_) {}
    cm.stagedSettings = null;
    return { ok: true, discarded: true };
  }
  function resetRecovery(cm) {
    cm.original = null; cm.or_create = null; cm.or_resume = null; cm.or_delete = null; cm.resumeAttempt = null;
    cm.resumeSeq = 0; cm.recovery = null; cm.publishable = null; cm.replayCount = 0;
    cm.deleteConfirm = false; cm.deleteReceipt = null; cm.stagedSettings = null; cm.pendingProjectId = null;
  }

  O55.projectRecovery = { NEW_GITHUB_REPO, RESUME_CREATION, OPEN_IN_BROWSER, REPOSITORY_DELETE, EFFECTS,
    isGithubRemoteChain, originalCommandFor, reserveDestinationId, beginOriginal, derivedRoutes,
    beginCreateRequest, adoptCreateResult, replayOriginal, formResumeAttempt, armResumeRequest,
    adoptResumeResult, effectiveContinue, effectiveOpen, effectiveDelete, beginDeleteRequest,
    adoptDeleteResult, stagePendingSettings, publishStagedSettings, discardStagedSettings, resetRecovery };
})();
