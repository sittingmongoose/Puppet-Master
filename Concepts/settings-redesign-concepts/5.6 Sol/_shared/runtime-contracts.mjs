/*
 * Concept-only projections for shared runtime owners.
 *
 * Nothing in this module schedules machine work, chooses an admission result,
 * installs software, authenticates a provider, or claims production evidence.
 * It gives the Settings concepts truthful, bounded projections of those owners.
 */

export const PERMIT_OUTCOMES = Object.freeze([
  "admitted",
  "queued",
  "admitted_degraded",
  "blocked_permission",
  "blocked_resource",
  "cancelled"
]);

export const WORK_STATES = Object.freeze([
  "accepted",
  "queued",
  "starting",
  "running",
  "synchronizing",
  "waiting_provider",
  "waiting_host",
  "waiting_network",
  "waiting_resource",
  "waiting_permission",
  "waiting_for_sign_in",
  "waiting_for_idle",
  "waiting_user",
  "retrying",
  "backgrounded",
  "degraded",
  "stalled",
  "committing",
  "verifying",
  "rolling_back",
  "completed",
  "failed",
  "cancelled",
  "recovery_required"
]);

export const PROGRESS_KINDS = Object.freeze(["none", "indeterminate", "determinate"]);
export const PROGRESS_SOURCES = Object.freeze(["measured", "provider_reported", "derived", "unknown"]);

const TERMINAL_WORK_STATES = new Set(["completed", "failed", "cancelled", "recovery_required"]);

function copy(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function instant(now) {
  return typeof now === "function" ? now() : new Date().toISOString();
}

function oneOf(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function compactRefs(value) {
  return [...new Set((Array.isArray(value) ? value : value ? [value] : []).filter(Boolean).map(String))];
}

export function normalizeObservableWork(input = {}, now = null) {
  const at = input.last_activity_at || instant(now);
  const progressKind = oneOf(input.progress_kind, PROGRESS_KINDS, "indeterminate");
  const progressSource = oneOf(input.progress_source, PROGRESS_SOURCES, "unknown");
  const state = oneOf(input.state, WORK_STATES, "accepted");
  const projection = {
    operation_id: String(input.operation_id || "operation-unassigned"),
    owner_domain: String(input.owner_domain || "shared-runtime"),
    scope_refs: compactRefs(input.scope_refs || input.scope_ref),
    object_refs: compactRefs(input.object_refs || input.object_ref),
    title: String(input.title || "Operation"),
    human_phase: String(input.human_phase || "Accepted"),
    state,
    progress_kind: progressKind,
    progress_source: progressSource,
    wait_reason: input.wait_reason ? String(input.wait_reason) : null,
    queue_reason: input.queue_reason ? String(input.queue_reason) : null,
    last_activity_at: at,
    heartbeat_at: input.heartbeat_at || at,
    can_cancel: Boolean(input.can_cancel) && !TERMINAL_WORK_STATES.has(state),
    can_background: Boolean(input.can_background) && !TERMINAL_WORK_STATES.has(state),
    can_retry: Boolean(input.can_retry),
    blocking_scope: input.blocking_scope ? String(input.blocking_scope) : "none",
    result_refs: compactRefs(input.result_refs || input.result_ref),
    receipt_refs: compactRefs(input.receipt_refs || input.receipt_ref),
    generation: Math.max(1, Number(input.generation) || 1),
    evidence_kind: "simulated_deterministic_projection"
  };

  const completed = Number(input.completed);
  const total = Number(input.total);
  if (progressKind === "determinate" && progressSource !== "unknown" && Number.isFinite(completed) && Number.isFinite(total) && total > 0 && completed >= 0 && completed <= total && input.unit) {
    projection.completed = completed;
    projection.total = total;
    projection.unit = String(input.unit);
  }
  return freeze(projection);
}

export class ObservableWorkRegistry {
  constructor(options = {}) {
    this._records = new Map();
    this._sequence = 0;
    this._now = options.now || null;
  }

  create(input = {}) {
    const operationId = String(input.operation_id || `observable-work-${++this._sequence}`);
    const record = normalizeObservableWork({ ...input, operation_id: operationId }, this._now);
    this._records.set(operationId, record);
    return copy(record);
  }

  update(operationId, changes = {}, expectedGeneration = null) {
    const current = this._records.get(operationId);
    if (!current) return false;
    const expected = expectedGeneration ?? changes.expected_generation ?? current.generation;
    if (Number(expected) !== current.generation) return false;
    const next = normalizeObservableWork({
      ...current,
      ...changes,
      operation_id: current.operation_id,
      generation: current.generation,
      last_activity_at: changes.last_activity_at || instant(this._now),
      heartbeat_at: changes.heartbeat_at || instant(this._now)
    }, this._now);
    this._records.set(operationId, next);
    return copy(next);
  }

  supersede(operationId, changes = {}) {
    const current = this._records.get(operationId);
    if (!current) return false;
    const next = normalizeObservableWork({
      ...current,
      ...changes,
      operation_id: current.operation_id,
      generation: current.generation + 1,
      last_activity_at: instant(this._now),
      heartbeat_at: instant(this._now)
    }, this._now);
    this._records.set(operationId, next);
    return copy(next);
  }

  get(operationId) {
    return copy(this._records.get(operationId) || null);
  }

  list(predicate = null) {
    const records = [...this._records.values()];
    return copy(typeof predicate === "function" ? records.filter(predicate) : records);
  }

  remove(operationId) {
    return this._records.delete(operationId);
  }

  clear() {
    this._records.clear();
  }
}

export const OBSERVABLE_WORK_FIXTURES = freeze({
  queued: normalizeObservableWork({ operation_id: "fixture-work-queued", owner_domain: "settings-concept", title: "Queued fixture", human_phase: "Waiting for an admitted runtime turn", state: "queued", progress_kind: "indeterminate", progress_source: "unknown", queue_reason: "Supplied governor projection queued this request", can_cancel: true, can_background: true, blocking_scope: "operation", generation: 1 }),
  waiting_network: normalizeObservableWork({ operation_id: "fixture-work-network", owner_domain: "settings-concept", title: "Network wait fixture", human_phase: "Waiting for the network", state: "waiting_network", progress_kind: "indeterminate", progress_source: "unknown", wait_reason: "Deterministic offline or slow-network fixture", can_cancel: true, can_retry: true, blocking_scope: "operation", generation: 1 }),
  waiting_resource: normalizeObservableWork({ operation_id: "fixture-work-resource", owner_domain: "settings-concept", title: "Resource wait fixture", human_phase: "Waiting for a runtime permit", state: "waiting_resource", progress_kind: "indeterminate", progress_source: "unknown", wait_reason: "Supplied governor projection has not admitted this work", can_cancel: true, can_background: true, blocking_scope: "operation", generation: 1 }),
  degraded: normalizeObservableWork({ operation_id: "fixture-work-degraded", owner_domain: "settings-concept", title: "Degraded fixture", human_phase: "Continuing with retained cached content", state: "degraded", progress_kind: "indeterminate", progress_source: "unknown", wait_reason: "Deterministic pressure fixture reduced optional work", can_cancel: true, can_background: true, can_retry: true, blocking_scope: "none", generation: 1 }),
  stalled: normalizeObservableWork({ operation_id: "fixture-work-stalled", owner_domain: "settings-concept", title: "Stalled fixture", human_phase: "No recent activity", state: "stalled", progress_kind: "indeterminate", progress_source: "unknown", wait_reason: "Deterministic heartbeat fixture expired", can_cancel: true, can_background: true, can_retry: true, blocking_scope: "operation", generation: 1 }),
  cancelled: normalizeObservableWork({ operation_id: "fixture-work-cancelled", owner_domain: "settings-concept", title: "Cancelled fixture", human_phase: "Cancelled", state: "cancelled", progress_kind: "none", progress_source: "unknown", can_cancel: false, can_background: false, can_retry: true, blocking_scope: "none", generation: 1 })
});

export class RuntimeResourceGovernorProjection {
  constructor(options = {}) {
    this._sequence = 0;
    this._requests = new Map();
    this._effective = new Map();
    this._now = options.now || null;
  }

  request(input = {}) {
    const requestId = String(input.request_id || `permit-request-${++this._sequence}`);
    const request = freeze({
      request_id: requestId,
      owner_domain: String(input.owner_domain || "settings"),
      resource_family: String(input.resource_family || "unspecified"),
      scope_refs: compactRefs(input.scope_refs || input.scope_ref),
      requested: copy(input.requested || {}),
      requested_at: instant(this._now),
      evidence_kind: "settings_request_only"
    });
    this._requests.set(requestId, request);
    return copy(request);
  }

  applyProjection(input = {}) {
    const requestId = String(input.request_id || "");
    if (!this._requests.has(requestId) || !PERMIT_OUTCOMES.includes(input.outcome)) return false;
    const projection = freeze({
      request_id: requestId,
      outcome: input.outcome,
      effective: copy(input.effective || {}),
      queue_reason: input.queue_reason ? String(input.queue_reason) : null,
      wait_reason: input.wait_reason ? String(input.wait_reason) : null,
      lease_ref: input.lease_ref ? String(input.lease_ref) : null,
      generation: Math.max(1, Number(input.generation) || 1),
      projected_at: instant(this._now),
      supplied_by: "RuntimeResourceGovernor",
      evidence_kind: "simulated_deterministic_projection"
    });
    this._effective.set(requestId, projection);
    return this.projection(requestId);
  }

  projection(requestId) {
    const requested = this._requests.get(requestId);
    if (!requested) return null;
    return freeze({ requested: copy(requested), effective: copy(this._effective.get(requestId) || null) });
  }

  cancelRequest(requestId, generation = 1) {
    if (!this._requests.has(requestId)) return false;
    return this.applyProjection({ request_id: requestId, outcome: "cancelled", generation, wait_reason: "Cancelled by the requesting surface" });
  }

  list() {
    return [...this._requests.keys()].map((id) => this.projection(id));
  }
}

export const GOVERNOR_PROJECTION_FIXTURES = freeze({
  normal: { outcome: "admitted", effective: { cache_budget_bytes: 1048576, speculative_prewarm: false, helper_wave_limit: 4 } },
  queued: { outcome: "queued", effective: { cache_budget_bytes: 524288, speculative_prewarm: false, helper_wave_limit: 1, retain_cached_content: true }, queue_reason: "Deterministic admission queue fixture" },
  "resource-wait": { outcome: "blocked_resource", effective: { cache_budget_bytes: 393216, speculative_prewarm: false, helper_wave_limit: 0, retain_cached_content: true }, wait_reason: "Deterministic runtime resource wait fixture" },
  legacy: { outcome: "admitted_degraded", effective: { cache_budget_bytes: 393216, speculative_prewarm: false, helper_wave_limit: 1, decorative_motion: "static", scheduling: "waves" }, wait_reason: "Deterministic legacy profile" },
  "low-memory": { outcome: "admitted_degraded", effective: { cache_budget_bytes: 262144, speculative_prewarm: false, helper_wave_limit: 1, retain_cached_content: true }, wait_reason: "Deterministic low-memory pressure" },
  "slow-network": { outcome: "admitted_degraded", effective: { cache_budget_bytes: 524288, speculative_prewarm: false, helper_wave_limit: 2, retain_cached_content: true }, wait_reason: "Deterministic slow-network fixture" },
  offline: { outcome: "blocked_resource", effective: { cache_budget_bytes: 524288, speculative_prewarm: false, helper_wave_limit: 0, retain_cached_content: true }, wait_reason: "Deterministic offline fixture" },
  metered: { outcome: "queued", effective: { cache_budget_bytes: 393216, speculative_prewarm: false, helper_wave_limit: 1, retain_cached_content: true }, queue_reason: "Deterministic metered-network policy projection" },
  thermal: { outcome: "admitted_degraded", effective: { cache_budget_bytes: 393216, speculative_prewarm: false, helper_wave_limit: 1, decorative_motion: "static", scheduling: "waves" }, wait_reason: "Deterministic thermal-pressure fixture" },
  "large-catalog": { outcome: "admitted_degraded", effective: { cache_budget_bytes: 786432, speculative_prewarm: false, helper_wave_limit: 2, scheduling: "waves", retain_cached_content: true }, wait_reason: "Deterministic large-catalog fixture" }
});

export const PERFORMANCE_PROFILES = freeze(Object.fromEntries(
  Object.entries(GOVERNOR_PROJECTION_FIXTURES).map(([id, governor]) => [id, {
    id,
    label: id.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" "),
    simulated: true,
    deterministic: true,
    hardware_certified: false,
    inactive_manager_limit: id === "normal" ? 2 : 1,
    cache_budget_bytes: governor.effective.cache_budget_bytes,
    speculative_prewarm: false,
    helper_wave_limit: governor.effective.helper_wave_limit,
    decorative_motion: governor.effective.decorative_motion || "normal",
    retain_cached_content: governor.effective.retain_cached_content !== false,
    scheduling: governor.effective.scheduling || "bounded",
    governor
  }])
));

export class BoundedSubscriptionRegistry {
  constructor(options = {}) {
    this.maxHeavySubscriptions = Math.max(1, Number(options.maxHeavySubscriptions) || 1);
    this._entries = new Map();
  }

  acquire(key, options = {}) {
    const normalized = String(key || "");
    if (!normalized) return false;
    const heavy = options.heavy !== false;
    const existing = this._entries.get(normalized);
    if (!existing && heavy && [...this._entries.values()].filter((entry) => entry.heavy).length >= this.maxHeavySubscriptions) return false;
    const entry = existing || { key: normalized, heavy, refs: 0, owner: options.owner || null };
    entry.refs += 1;
    this._entries.set(normalized, entry);
    let released = false;
    return {
      key: normalized,
      release: () => {
        if (released) return false;
        released = true;
        return this.release(normalized);
      }
    };
  }

  release(key) {
    const entry = this._entries.get(String(key));
    if (!entry) return false;
    entry.refs -= 1;
    if (entry.refs <= 0) this._entries.delete(entry.key);
    return true;
  }

  clear() {
    this._entries.clear();
  }

  stats() {
    const entries = [...this._entries.values()].map((entry) => ({ ...entry }));
    return freeze({
      key_count: entries.length,
      heavy_key_count: entries.filter((entry) => entry.heavy).length,
      total_ref_count: entries.reduce((sum, entry) => sum + entry.refs, 0),
      entries
    });
  }
}

export class ProviderSetupProjectionRegistry {
  constructor({ workRegistry = new ObservableWorkRegistry(), now = null } = {}) {
    this.work = workRegistry;
    this._now = now;
    this._sequence = 0;
    this._sessions = new Map();
    this._activeByTarget = new Map();
  }

  setupRequired(input = {}) {
    const targetKey = [input.provider_ref || "provider", input.host_ref || "host", input.environment_ref || "environment"].map(String).join("::");
    const activeSessionId = this._activeByTarget.get(targetKey);
    if (activeSessionId && this._sessions.has(activeSessionId)) {
      return freeze({ ...this.project(activeSessionId), coalesced_into_session_ref: activeSessionId });
    }
    const sessionId = `provider-setup-${++this._sequence}`;
    const revision = 1;
    const session = {
      session_id: sessionId,
      target_key: targetKey,
      provider_ref: String(input.provider_ref || "provider"),
      provider_label: String(input.provider_label || "Provider"),
      host_ref: String(input.host_ref || "host"),
      host_label: String(input.host_label || "This host"),
      environment_ref: String(input.environment_ref || "environment"),
      environment_label: String(input.environment_label || "Native environment"),
      official_source: String(input.official_source || "Official provider source"),
      official_source_reviewed: false,
      official_source_reviewed_at: null,
      setup_deep_link: String(input.setup_deep_link || `settings://providers/${encodeURIComponent(String(input.provider_ref || "provider"))}/installations/${encodeURIComponent(String(input.host_ref || "host"))}/${encodeURIComponent(String(input.environment_ref || "environment"))}`),
      state: "setup_required",
      consented: false,
      install_state: "not_started",
      auth_state: "not_started",
      continuation_token: String(input.continuation_token || `continuation-${sessionId}`),
      continuation_revision: Math.max(1, Number(input.continuation_revision) || 1),
      continuation_current: true,
      originating_operation_ref: String(input.originating_operation_ref || "originating-operation"),
      originating_operation_label: String(input.originating_operation_label || "Continue the originating operation"),
      compatible_existing: copy(input.compatible_existing || null),
      maintenance_policy: String(input.maintenance_policy || "ask_first"),
      revision,
      created_at: instant(this._now),
      operation_id: null
    };
    this._sessions.set(sessionId, session);
    this._activeByTarget.set(targetKey, sessionId);
    return this.project(sessionId);
  }

  fromDemand(input = {}) {
    const projection = this.setupRequired(input);
    return freeze({ ...projection, demand_result: "Setup Required", acquisition_started: false, reason: "Auto, On, Project, model, Goal, WorkNode, and agent demand cannot authorize initial provider CLI acquisition." });
  }

  consent(sessionId, expectedRevision) {
    const session = this._sessions.get(sessionId);
    if (!session || Number(expectedRevision) !== session.revision || session.consented || !session.official_source_reviewed) return false;
    session.consented = true;
    session.consent_record = {
      decision_id: `consent-${session.session_id}`,
      actor: "user",
      scope: "first_acquisition",
      source_reviewed: true,
      granted_at: instant(this._now)
    };
    session.state = "installation_ready_to_start";
    session.revision += 1;
    return this.project(sessionId);
  }

  reviewOfficialSource(sessionId, expectedRevision) {
    const session = this._sessions.get(sessionId);
    if (!session || Number(expectedRevision) !== session.revision || session.official_source_reviewed) return false;
    session.official_source_reviewed = true;
    session.official_source_reviewed_at = instant(this._now);
    session.state = "source_reviewed";
    session.revision += 1;
    return this.project(sessionId);
  }

  startInstall(sessionId, expectedRevision) {
    const session = this._sessions.get(sessionId);
    if (!session || !session.consented || Number(expectedRevision) !== session.revision || session.install_state !== "not_started") return false;
    session.install_state = "installing";
    session.state = "installing";
    session.revision += 1;
    const work = this.work.create({
      owner_domain: "provider-installation-lifecycle",
      scope_refs: [`host:${session.host_ref}`, `environment:${session.environment_ref}`],
      object_refs: [`provider:${session.provider_ref}`],
      title: `Install ${session.provider_label}`,
      human_phase: `Acquiring from ${session.official_source}`,
      state: "waiting_permission",
      progress_kind: "indeterminate",
      progress_source: "unknown",
      wait_reason: "Initial installation requires the recorded explicit consent and runtime authority",
      can_cancel: true,
      can_background: true,
      blocking_scope: "provider setup",
      generation: session.revision
    });
    session.operation_id = work.operation_id;
    return this.project(sessionId);
  }

  finishInstall(sessionId, expectedRevision, result = {}) {
    const session = this._sessions.get(sessionId);
    if (!session || Number(expectedRevision) !== session.revision || session.install_state !== "installing") return false;
    session.install_state = result.ok === false ? "failed" : "ready";
    session.state = result.ok === false ? "installation_failed" : "authentication_required";
    session.revision += 1;
    this.work.update(session.operation_id, {
      state: result.ok === false ? "failed" : "completed",
      human_phase: result.ok === false ? "Installation failed" : "Installation verified",
      can_retry: result.ok === false,
      result_refs: result.result_refs,
      receipt_refs: result.receipt_refs
    }, expectedRevision);
    return this.project(sessionId);
  }

  startAuthentication(sessionId, expectedRevision) {
    const session = this._sessions.get(sessionId);
    if (!session || Number(expectedRevision) !== session.revision || session.install_state !== "ready" || session.auth_state !== "not_started") return false;
    session.auth_state = "in_progress";
    session.state = "authentication_in_progress";
    session.revision += 1;
    return this.project(sessionId);
  }

  finishAuthentication(sessionId, expectedRevision, result = {}) {
    const session = this._sessions.get(sessionId);
    if (!session || Number(expectedRevision) !== session.revision || session.auth_state !== "in_progress") return false;
    session.auth_state = result.ok === false ? "failed" : "ready";
    session.state = result.ok === false ? "authentication_failed" : "ready";
    session.revision += 1;
    return this.project(sessionId);
  }

  resume(sessionId, continuationToken, continuationRevision) {
    const session = this._sessions.get(sessionId);
    if (!session || session.continuation_token !== continuationToken || session.continuation_revision !== Number(continuationRevision) || session.state !== "ready") return false;
    session.continuation_revision += 1;
    session.continuation_current = false;
    session.revision += 1;
    this._activeByTarget.delete(session.target_key);
    return freeze({ resumed: true, current: true, setup: this.project(sessionId) });
  }

  setMaintenancePolicy(sessionId, expectedRevision, policy) {
    const session = this._sessions.get(sessionId);
    const allowed = ["ask_first", "automatic_when_idle", "manual"];
    if (!session || Number(expectedRevision) !== session.revision || !allowed.includes(policy)) return false;
    if (policy === "automatic_when_idle" && (!session.consented || session.install_state !== "ready")) return false;
    session.maintenance_policy = policy;
    session.revision += 1;
    return this.project(sessionId);
  }

  maintenancePolicy(sessionId) {
    const session = this._sessions.get(sessionId);
    if (!session) return null;
    return freeze({ policy: session.maintenance_policy, post_consent_maintenance_allowed: session.consented && session.install_state === "ready", revision: session.revision });
  }

  project(sessionId) {
    const session = this._sessions.get(sessionId);
    if (!session) return null;
    return freeze({
      session_ref: session.session_id,
      provider_ref: session.provider_ref,
      provider: session.provider_label,
      target: `${session.host_label} · ${session.environment_label}`,
      host_ref: session.host_ref,
      host_label: session.host_label,
      environment_ref: session.environment_ref,
      environment_label: session.environment_label,
      official_source: session.official_source,
      official_source_reviewed: session.official_source_reviewed,
      official_source_reviewed_at: session.official_source_reviewed_at,
      setup_deep_link: session.setup_deep_link,
      state: session.state,
      initial_consent_recorded: session.consented,
      consent_record: copy(session.consent_record || null),
      installation: session.install_state,
      authentication: session.auth_state,
      operation_ref: session.operation_id,
      continuation_token: session.continuation_token,
      continuation_revision: session.continuation_revision,
      continuation_current: session.continuation_current,
      originating_operation_ref: session.originating_operation_ref,
      originating_operation_label: session.originating_operation_label,
      compatible_existing: copy(session.compatible_existing),
      maintenance_policy: session.maintenance_policy,
      post_consent_maintenance_allowed: session.consented && session.install_state === "ready",
      revision: session.revision,
      simulated: true,
      deterministic: true
    });
  }
}
