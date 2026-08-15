import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  CONCEPTS,
  GENERIC_MANAGER_STATE_DEFINITIONS,
  MANAGERS,
  MANAGER_STATE_FIXTURE_IDS,
  THEMES,
  buildCompactSearchMetadata,
  buildManagerStateFixture
} from "../_shared/data.mjs";
import {
  PROVIDER_CLI_ACQUISITION_POLICY,
  PROVIDER_POLICY_CASES,
  PROVIDER_SETUP_CONTINUATION_FIXTURE,
  buildProviderInstallationScaleFixture
} from "../_shared/manager-data.mjs";
import {
  BoundedSubscriptionRegistry,
  ObservableWorkRegistry,
  PERMIT_OUTCOMES,
  ProviderSetupProjectionRegistry,
  RuntimeResourceGovernorProjection,
  WORK_STATES,
  normalizeObservableWork
} from "../_shared/runtime-contracts.mjs";
import { SettingsStore } from "../_shared/state.mjs";

const CONCEPT_ROOT = fileURLToPath(new URL("../", import.meta.url));
const STATE_MODULE_URL = new URL("../_shared/state.mjs", import.meta.url).href;
const MANAGER_STATES = Object.keys(GENERIC_MANAGER_STATE_DEFINITIONS);

function memoryStorage() {
  const values = new Map();
  const calls = { get: 0, set: 0, remove: 0 };
  return {
    calls,
    getItem(key) {
      calls.get += 1;
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      calls.set += 1;
      values.set(key, String(value));
    },
    removeItem(key) {
      calls.remove += 1;
      values.delete(key);
    },
    value(key) {
      return values.get(key) || null;
    }
  };
}

async function openLoadedManager(store, managerId, tab = "overview") {
  assert.equal(store.openManager(managerId, tab, { deferFrame: false }), true);
  await store.whenIdle();
  assert.equal(store.state.managerHydration[managerId]?.state, "hydrated", `${managerId} did not hydrate`);
  return store.managerInventory(managerId);
}

test("Home and compact search do not evaluate the detail module in a fresh process", () => {
  const script = `
    import { SettingsStore } from ${JSON.stringify(STATE_MODULE_URL)};
    const store = new SettingsStore("index-house", { storage: null });
    const baseline = store.runtimeStats();
    const results = store.search("provider");
    const after = store.runtimeStats();
    process.stdout.write(JSON.stringify({
      screen: store.state.screen,
      searchRows: store.searchIndex.length,
      resultCount: results.length,
      managerCacheCount: after.startup.liveProjectionLoadedManagerCount,
      providerProbes: after.startup.providerProbes,
      beforeLoaded: baseline.detailModuleLoaded,
      afterLoaded: after.detailModuleLoaded,
      loads: globalThis.__pmSettingsDetailModuleLoads || 0
    }));
    store.destroy();
  `;
  const child = spawnSync(process.execPath, ["--input-type=module", "--eval", script], { encoding: "utf8" });
  assert.equal(child.status, 0, child.stderr);
  const result = JSON.parse(child.stdout);
  assert.equal(result.screen, "home");
  assert.equal(result.searchRows, 148);
  assert.ok(result.resultCount > 0 && result.resultCount <= 12);
  assert.equal(result.managerCacheCount, 0);
  assert.equal(result.providerProbes, 0);
  assert.equal(result.beforeLoaded, false);
  assert.equal(result.afterLoaded, false);
  assert.equal(result.loads, 0);
});

test("compact search is exactly 148 rows, deterministically scales past 825, caps results, and carries no manager payload", () => {
  const baseline = buildCompactSearchMetadata();
  const largeA = buildCompactSearchMetadata({ scaleFixtureCount: 900 });
  const largeB = buildCompactSearchMetadata({ scaleFixtureCount: 900 });
  assert.equal(baseline.length, 148);
  assert.equal(largeA.length, 900);
  assert.deepEqual(largeA, largeB);
  assert.ok(largeA.every((row) => Object.keys(row).sort().join(",") === "destination,id,keywords,title"));

  const store = new SettingsStore("switchboard", { storage: null });
  const fixture = store.installLargeCatalogSearchFixture(825);
  assert.deepEqual(fixture, {
    rows: 825,
    attachedManagerRecords: 0,
    attachedProviderRecords: 0,
    rawPaths: 0,
    simulated: true,
    deterministic: true
  });
  assert.equal(store.search("scale fixture", 100).length, 12);
  assert.equal(store.runtimeStats().startup.liveProjectionLoadedManagerCount, 0);
  assert.equal(store.runtimeStats().detailModuleLoaded, false);
  store.destroy();
});

test("one selected manager loads detailed data exactly once", async () => {
  const before = Number(globalThis.__pmSettingsDetailModuleLoads || 0);
  const store = new SettingsStore("wayfinder", { storage: null });
  assert.equal(store.runtimeStats().detailModuleLoaded, false);
  await openLoadedManager(store, "providers", "installations");
  assert.equal(store.runtimeStats().detailModuleLoads, 1);
  assert.equal(Number(globalThis.__pmSettingsDetailModuleLoads || 0), before + 1);
  await openLoadedManager(store, "memory");
  assert.equal(store.runtimeStats().detailModuleLoads, 1, "a second manager must reuse the evaluated detail module");
  store.destroy();
});

test("manager cache is bounded and inactive detail subscriptions release with reference counts", async () => {
  const store = new SettingsStore("ledger", { storage: null });
  for (const managerId of ["providers", "memory", "terminal", "context"]) await openLoadedManager(store, managerId);
  const active = store.runtimeStats();
  assert.ok(active.cache.currentBytes <= active.cache.budgetBytes);
  assert.ok(active.cache.inactiveReadyCount <= 2);
  assert.equal(active.subscriptions.heavy_key_count, 1);
  assert.equal(active.subscriptions.total_ref_count, 1);
  store.openHome();
  assert.equal(store.runtimeStats().subscriptions.total_ref_count, 0);

  const subscriptions = new BoundedSubscriptionRegistry({ maxHeavySubscriptions: 1 });
  const first = subscriptions.acquire("manager:providers", { heavy: true });
  const second = subscriptions.acquire("manager:providers", { heavy: true });
  assert.ok(first && second);
  assert.equal(subscriptions.acquire("manager:memory", { heavy: true }), false);
  assert.equal(subscriptions.stats().total_ref_count, 2);
  assert.equal(first.release(), true);
  assert.equal(first.release(), false, "release handles are idempotent");
  assert.equal(subscriptions.stats().total_ref_count, 1);
  assert.equal(second.release(), true);
  assert.equal(subscriptions.stats().key_count, 0);
  store.destroy();
});

test("virtual windows mount at most 40 rows and keep the stable selected row included", () => {
  const store = new SettingsStore("index-house", { storage: null });
  const rows = Array.from({ length: 100 }, (_, index) => ({ id: `row-${index + 1}` }));
  const window = store.windowedItems("fixture", rows, { start: 0, size: 100, selectedId: "row-96" });
  assert.ok(window.mounted <= 40, `mounted ${window.mounted} rows`);
  assert.ok(window.items.some((row) => row.id === "row-96"), "selected row fell outside the mounted window");
  assert.equal(new Set(window.items.map((row) => row.id)).size, window.items.length);
  store.destroy();
});

test("transient interaction produces zero persistence writes; durable changes batch and obey the byte limit", () => {
  const storage = memoryStorage();
  const store = new SettingsStore("ledger", { storage });
  store.setSearch("provider");
  store.emit("scrollspy");
  store.emit("focus-consumed");
  assert.equal(store.flushPersistence({ explicit: true }), false);
  assert.equal(storage.calls.set, 0);

  store.setPresentation({ theme: "basic-light" });
  store.setPresentation({ density: "compact" });
  store.setPresentation({ reducedMotionOverride: true });
  assert.equal(storage.calls.set, 0, "durable changes should remain batched before a flush");
  assert.equal(store.flushPersistence({ explicit: true }), true);
  assert.equal(storage.calls.set, 1);
  const persisted = JSON.parse(storage.value("pm.settings.sol.final.ledger"));
  for (const transientKey of ["search", "searchQuery", "searchOpen", "focusRequest", "listWindows", "observableWork", "governorProjection"]) {
    assert.equal(Object.hasOwn(persisted.state, transientKey), false, `${transientKey} leaked into durable state`);
  }

  store.state.customThemeDraft = "x".repeat(70_000);
  store.emit("presentation");
  assert.equal(store.flushPersistence({ explicit: true }), false);
  assert.equal(storage.calls.set, 1, "oversize payload must not replace the prior durable payload");
  assert.equal(store.persistenceStats().rejectedOversize, 1);
  assert.equal(store.persistenceStats().payloadLimitBytes, 64 * 1024);
  store.destroy();
});

test("RuntimeResourceGovernor is the sole projection owner and exposes all six exact outcomes", () => {
  assert.deepEqual(PERMIT_OUTCOMES, ["admitted", "queued", "admitted_degraded", "blocked_permission", "blocked_resource", "cancelled"]);
  const governor = new RuntimeResourceGovernorProjection({ now: () => "2026-08-14T00:00:00.000Z" });
  for (const outcome of PERMIT_OUTCOMES) {
    const request = governor.request({ resource_family: "fixture", requested: { units: 1 } });
    const result = governor.applyProjection({ request_id: request.request_id, outcome, generation: 1 });
    assert.equal(result.effective.outcome, outcome);
    assert.equal(result.effective.supplied_by, "RuntimeResourceGovernor");
  }
  assert.equal(governor.applyProjection({ request_id: "missing", outcome: "admitted" }), false);
  assert.equal(governor.applyProjection({ request_id: governor.list()[0].requested.request_id, outcome: "invented" }), false);
  const store = new SettingsStore("index-house", { storage: null });
  assert.equal(store.runtimeStats().policyOwner, "RuntimeResourceGovernor");
  assert.equal(store.runtimeStats().progressOwner, "ObservableWork");
  store.destroy();
});

test("ObservableWork preserves truthful fields and waits and never fabricates a determinate denominator", () => {
  assert.ok(WORK_STATES.includes("waiting_provider"));
  assert.ok(WORK_STATES.includes("waiting_host"));
  assert.ok(WORK_STATES.includes("waiting_network"));
  assert.ok(WORK_STATES.includes("waiting_resource"));
  assert.ok(WORK_STATES.includes("waiting_permission"));
  assert.ok(WORK_STATES.includes("waiting_for_sign_in"));
  assert.ok(WORK_STATES.includes("waiting_for_idle"));
  assert.ok(WORK_STATES.includes("waiting_user"));
  const unknown = normalizeObservableWork({
    operation_id: "unknown-total",
    owner_domain: "fixture",
    scope_refs: ["project:one"],
    object_refs: ["manager:providers"],
    title: "Refresh provider",
    human_phase: "Waiting for provider",
    state: "waiting_provider",
    progress_kind: "determinate",
    progress_source: "unknown",
    completed: 9,
    total: 10,
    unit: "models",
    wait_reason: "Provider has not supplied a trustworthy total",
    can_cancel: true,
    can_background: true,
    can_retry: true,
    blocking_scope: "selected manager"
  }, () => "2026-08-14T00:00:00.000Z");
  assert.equal(unknown.wait_reason, "Provider has not supplied a trustworthy total");
  assert.equal(Object.hasOwn(unknown, "completed"), false);
  assert.equal(Object.hasOwn(unknown, "total"), false);
  assert.equal(Object.hasOwn(unknown, "unit"), false);
  const measured = normalizeObservableWork({ progress_kind: "determinate", progress_source: "measured", completed: 9, total: 10, unit: "models" });
  assert.deepEqual([measured.completed, measured.total, measured.unit], [9, 10, "models"]);
});

test("ObservableWork cancel, retry, and background transitions are capability-gated", () => {
  const store = new SettingsStore("switchboard", { storage: null });
  const cancellable = store.observableWork.create({ operation_id: "cancel-me", state: "running", can_cancel: true, can_retry: false });
  assert.equal(store.cancelObservableWork(cancellable.operation_id).state, "cancelled");
  assert.equal(store.cancelObservableWork(cancellable.operation_id), false);
  assert.equal(store.retryObservableWork(cancellable.operation_id).state, "queued");
  const backgroundable = store.observableWork.create({ operation_id: "background-me", state: "running", can_background: true });
  assert.equal(store.backgroundObservableWork(backgroundable.operation_id).state, "backgrounded");
  assert.equal(store.backgroundObservableWork(backgroundable.operation_id), false);
  store.destroy();
});

test("cancelling manager-load work fences its late commit and retry starts a fresh generation", async () => {
  const store = new SettingsStore("switchboard", { storage: null });
  assert.equal(store.openManager("context", "overview", { deferFrame: true }), true);
  const pending = store.observableWork.list().find((entry) => entry.object_refs.includes("manager:context"));
  assert.ok(pending, "manager load did not publish ObservableWork");
  const cancelledGeneration = store.state.managerHydration.context.generation;
  assert.equal(store.cancelObservableWork(pending.operation_id).state, "cancelled");
  await store.whenIdle();
  assert.equal(store.state.managerHydration.context.state, "cancelled");
  assert.equal(store.managerInventory("context"), null, "cancelled load committed a late manager payload");
  assert.equal(store.observableWork.get(pending.operation_id).state, "cancelled");

  const retried = store.retryObservableWork(pending.operation_id);
  assert.equal(retried.state, "accepted");
  assert.ok(retried.generation > pending.generation);
  await store.whenIdle();
  assert.equal(store.state.managerHydration.context.state, "hydrated");
  assert.ok(store.state.managerHydration.context.generation > cancelledGeneration);
  assert.ok(store.managerInventory("context"));
  store.destroy();
});

test("cancelling provider-refresh work fences late completion and retry dispatches a fresh generation", async () => {
  const store = new SettingsStore("index-house", { storage: null });
  await openLoadedManager(store, "providers", "models");
  const provider = store.provider("openai");
  const originalVersion = provider.catalogue.version;
  const refresh = store.refreshProvider("openai");
  const pending = store.observableWork.list().find((entry) => entry.object_refs.includes("catalogue:openai"));
  assert.ok(pending, "provider refresh did not publish ObservableWork");
  assert.equal(store.cancelObservableWork(pending.operation_id).state, "cancelled");
  assert.equal(await refresh, false);
  assert.equal(provider.catalogue.version, originalVersion, "cancelled refresh committed a late catalogue version");
  assert.equal(store.observableWork.get(pending.operation_id).state, "cancelled");
  assert.equal(store.providerOperations.filter((entry) => entry.action === "refresh").length, 0);

  const retried = store.retryObservableWork(pending.operation_id);
  assert.equal(retried.state, "accepted");
  assert.ok(retried.generation > pending.generation);
  await store.whenIdle();
  assert.notEqual(provider.catalogue.version, originalVersion);
  const accepted = store.providerOperations.find((entry) => entry.action === "refresh" && entry.outcome === "accepted");
  assert.ok(accepted, "retry did not dispatch a fresh provider refresh");
  assert.ok(accepted.detail.generation > pending.generation);
  store.destroy();
});

test("retrying failed or cancelled active flows restores an actionable active state", async () => {
  const store = new SettingsStore("ledger", { storage: null });
  await openLoadedManager(store, "testing-debug");

  const failed = store.startFlow("test", { managerId: "testing-debug", resourceId: "browser-tests" });
  assert.ok(failed);
  const failure = store.advanceFlow({ outcome: "fail", reason: "Deterministic retry fixture" });
  assert.equal(failure.status, "failed");
  const failedRetry = store.retryObservableWork(failure.operation_id);
  assert.equal(failedRetry.state, "accepted");
  assert.equal(store.state.activeFlow.status, "active");
  assert.equal(store.state.activeFlow.rollbackAvailable, false);
  assert.equal(store.state.activeFlow.failureReason, null);
  assert.ok(failedRetry.generation > failure.generation);
  assert.notEqual(store.advanceFlow(), false, "failed flow remained non-actionable after retry");

  const cancellable = store.startFlow("test", { managerId: "testing-debug", resourceId: "native-tests" });
  const cancelled = store.cancelObservableWork(cancellable.operation_id);
  assert.equal(cancelled.state, "cancelled");
  assert.equal(store.state.activeFlow.status, "cancelled");
  const cancelledRetry = store.retryObservableWork(cancellable.operation_id);
  assert.equal(cancelledRetry.state, "accepted");
  assert.equal(store.state.activeFlow.status, "active");
  assert.ok(cancelledRetry.generation > cancellable.generation);
  assert.notEqual(store.advanceFlow(), false, "cancelled flow remained non-actionable after retry");
  store.destroy();
});

test("provider CLI policy rejects every silent first-acquisition initiator", () => {
  const negative = PROVIDER_CLI_ACQUISITION_POLICY.negativeContract.join(" ");
  for (const initiator of ["Project", "model", "provider", "Goal", "Plan", "WorkNode", "agent", "Auto", "On"]) {
    assert.match(negative, new RegExp(`\\b${initiator}\\b`));
  }
  assert.equal(PROVIDER_CLI_ACQUISITION_POLICY.initialAcquisition.requiresExplicitUserAction, true);
  assert.equal(PROVIDER_CLI_ACQUISITION_POLICY.initialAcquisition.requiresExactHostAndEnvironmentSelection, true);
  assert.equal(PROVIDER_CLI_ACQUISITION_POLICY.initialAcquisition.requiresOfficialSource, true);
  assert.equal(PROVIDER_CLI_ACQUISITION_POLICY.initialAcquisition.authenticationIsSeparate, true);
  assert.equal(PROVIDER_CLI_ACQUISITION_POLICY.postConsentLifecycle.mayAuthorizeFirstAcquisition, false);
});

test("provider setup reviews the official source before consent and keeps exact Host/Environment and install/auth separation", () => {
  const registry = new ProviderSetupProjectionRegistry({ now: () => "2026-08-14T00:00:00.000Z" });
  const initial = registry.fromDemand({
    provider_ref: "openai",
    provider_label: "OpenAI",
    host_ref: "host-windows",
    host_label: "Windows build host",
    environment_ref: "env-wsl-ubuntu",
    environment_label: "Ubuntu 24.04 in WSL",
    official_source: "Official OpenAI source",
    continuation_token: "continue-7",
    continuation_revision: 7
  });
  assert.equal(initial.demand_result, "Setup Required");
  assert.equal(initial.acquisition_started, false);
  assert.equal(initial.host_ref, "host-windows");
  assert.equal(initial.environment_ref, "env-wsl-ubuntu");
  assert.equal(registry.consent(initial.session_ref, initial.revision), false);
  const reviewed = registry.reviewOfficialSource(initial.session_ref, initial.revision);
  assert.equal(reviewed.official_source_reviewed, true);
  const consented = registry.consent(reviewed.session_ref, reviewed.revision);
  assert.equal(consented.initial_consent_recorded, true);
  assert.equal(registry.startAuthentication(consented.session_ref, consented.revision), false);
  assert.equal(registry.setMaintenancePolicy(consented.session_ref, consented.revision, "automatic_when_idle"), false);
  const installing = registry.startInstall(consented.session_ref, consented.revision);
  assert.equal(installing.installation, "installing");
  assert.equal(installing.authentication, "not_started");
  const installed = registry.finishInstall(installing.session_ref, installing.revision, { ok: true });
  assert.equal(installed.installation, "ready");
  assert.equal(installed.authentication, "not_started");
  const authenticating = registry.startAuthentication(installed.session_ref, installed.revision);
  assert.equal(authenticating.authentication, "in_progress");
  const ready = registry.finishAuthentication(authenticating.session_ref, authenticating.revision, { ok: true });
  assert.equal(ready.state, "ready");
  const maintained = registry.setMaintenancePolicy(ready.session_ref, ready.revision, "automatic_when_idle");
  assert.equal(maintained.post_consent_maintenance_allowed, true);
  assert.equal(registry.resume(ready.session_ref, "stale", 6), false);
  assert.equal(registry.resume(ready.session_ref, "continue-7", 7).resumed, true);
});

test("identical provider setup requests coalesce while stale continuations fail closed", () => {
  const registry = new ProviderSetupProjectionRegistry();
  const input = { provider_ref: "claude", host_ref: "host-mac", environment_ref: "macos-native", continuation_token: "current", continuation_revision: 3 };
  const first = registry.setupRequired(input);
  const second = registry.setupRequired({ ...input, continuation_token: "different-origin" });
  assert.equal(second.session_ref, first.session_ref);
  assert.equal(second.coalesced_into_session_ref, first.session_ref);
  assert.equal(PROVIDER_SETUP_CONTINUATION_FIXTURE.coalescing.identicalRequestsShareOneSetupOperation, true);
  assert.equal(PROVIDER_SETUP_CONTINUATION_FIXTURE.staleRejectionFixture.originatingOperationResumed, false);
});

test("a compatible existing provider installation can be selected without acquisition or authentication", async () => {
  const store = new SettingsStore("index-house", { storage: null });
  await openLoadedManager(store, "providers", "installations");
  const selected = store.selectExistingProviderInstallation("codex-store-selected", "openai");
  assert.equal(selected.outcome, "selected_existing");
  assert.equal(selected.installationId, "codex-store-selected");
  assert.equal(selected.authentication, "authenticated");
  assert.match(store.receiptHistory.at(-1).message, /No software was acquired and authentication remains separate/);
  store.destroy();
});

test("the 100-installation fixture remains compact, deterministic, and detail-deferred", () => {
  const fixture = buildProviderInstallationScaleFixture(100);
  assert.equal(fixture.total, 100);
  assert.equal(fixture.summaryRows.length, 100);
  assert.equal(new Set(fixture.summaryRows.map((row) => row.id)).size, 100);
  assert.equal(fixture.baselineProviderArraysExpanded, false);
  assert.ok(fixture.summaryRows.every((row) => row.source.official === true));
  assert.ok(fixture.summaryRows.every((row) => row.technicalDetails.hydration === "deferred"));
  assert.ok(fixture.summaryRows.every((row) => row.technicalDetails.rawPathDataIncluded === false));
  assert.deepEqual(fixture, buildProviderInstallationScaleFixture(100));
  assert.ok(PROVIDER_POLICY_CASES.some((entry) => entry.id === "provider-case-post-consent-update"));
  assert.ok(PROVIDER_POLICY_CASES.some((entry) => entry.id === "provider-case-official-provenance-failure"));
});

test("all eight manager-state fixtures are isolated, deterministic, and idempotent for every manager", () => {
  assert.deepEqual(MANAGER_STATES, ["loading", "empty", "error", "offline", "unavailable", "managed_inherited", "requested_effective", "degraded"]);
  for (const manager of MANAGERS) {
    assert.equal(MANAGER_STATE_FIXTURE_IDS[manager.id].length, 8, manager.id);
    for (const state of MANAGER_STATES) {
      const first = buildManagerStateFixture(manager.id, state);
      const second = buildManagerStateFixture(manager.id, state);
      assert.deepEqual(first, second);
      assert.notEqual(first, second);
      first.reason = "local mutation";
      assert.equal(buildManagerStateFixture(manager.id, state).reason, GENERIC_MANAGER_STATE_DEFINITIONS[state].reason);
      assert.equal(first.id, `manager-state.${manager.id}.${state}`);
    }
  }
});

test("all four 47-family coverage documents use the closed vocabulary and leave unresolved Server mutation fail-closed", async () => {
  const concepts = ["concept-01-index-house", "concept-02-switchboard", "concept-03-wayfinder", "concept-04-ledger"];
  for (const concept of concepts) {
    const coverage = JSON.parse(readFileSync(`${CONCEPT_ROOT}/${concept}/manager-coverage.json`, "utf8"));
    assert.equal(coverage.schema_id, "pm.settings_manager_coverage.v2");
    assert.equal(coverage.source_family_count, 47);
    assert.equal(coverage.full_classification_matrix.length, 47);
    assert.deepEqual(coverage.classification_vocabulary, ["demonstrated", "shared_grammar", "deferred_named_owner", "missing"]);
    assert.equal(Object.values(coverage.classification_counts).reduce((sum, value) => sum + value, 0), 47);
    assert.ok(coverage.full_classification_matrix.every((entry) => coverage.classification_vocabulary.includes(entry.classification)));
    assert.ok(coverage.full_classification_matrix.every((entry) => entry.required_state_evidence.parameterized_fixture_ids.length === 8));
    const serverRows = coverage.full_classification_matrix.filter((entry) => ["future-server-module-shell", "corrected-server-insertion"].includes(entry.source_family_id));
    assert.equal(serverRows.length, 2);
    for (const server of serverRows) {
      assert.deepEqual({ classification: server.classification, owner: server.owner, owner_status: server.owner_status, mutation_enabled: server.mutation_enabled }, {
        classification: "missing",
        owner: null,
        owner_status: "unresolved",
        mutation_enabled: false
      });
      assert.match(server.residual_risk, /mutation(?:-| (?:is |remains )?)blocked/i);
    }
  }
  const store = new SettingsStore("ledger", { storage: null });
  const inventory = await openLoadedManager(store, "future-server-shell");
  assert.equal(inventory.owner, null);
  assert.equal(inventory.ownerStatus, "unresolved");
  assert.equal(inventory.mutationEnabled, false);
  assert.match(inventory.primaryAction, /inspect/i);
  assert.ok(inventory.items.every((item) => item.owner === null && item.ownerStatus === "unresolved" && item.disabled === true));
  assert.ok(inventory.items.flatMap((item) => item.actions).every((action) => /inspect/i.test(action)));
  store.destroy();
});

test("model prompt projection is compact and excludes raw provider, resource, and runtime state", async () => {
  const store = new SettingsStore("wayfinder", { storage: null });
  await openLoadedManager(store, "providers");
  const projection = store.modelPromptProjection();
  assert.deepEqual(Object.keys(projection).sort(), ["omitted", "operations", "policy_free", "provider_summary", "settings_summary"]);
  assert.equal(projection.policy_free, true);
  const serialized = JSON.stringify(projection);
  for (const forbidden of ["runtimeAdapters", "installations", "technicalDetails", "binary paths", "credentials", "permit tables"]) {
    if (projection.omitted.includes(forbidden)) continue;
    assert.doesNotMatch(serialized, new RegExp(`\\"${forbidden}\\"`));
  }
  assert.ok(projection.omitted.includes("raw resource state"));
  assert.ok(projection.omitted.includes("runtime pool policy"));
  store.destroy();
});

test("theme and reduced-motion effective state is truthful, and sound stop is idempotent", async () => {
  assert.equal(THEMES.length, 8);
  assert.equal(Object.keys(CONCEPTS).length, 4);
  const store = new SettingsStore("ledger", { storage: null });
  assert.equal(store.setPresentation({ theme: "Basic Light", reducedMotionOverride: true }), true);
  assert.equal(store.state.theme, "basic-light");
  assert.equal(store.state.reducedMotion, true);
  store.state.osReducedMotion = true;
  store.setPresentation({ reducedMotionOverride: false });
  assert.equal(store.state.reducedMotion, true, "OS reduced motion remains effective when the explicit override is off");

  const sounds = await openLoadedManager(store, "notifications-sounds");
  const resource = sounds.items[0];
  assert.equal(store.previewSound(resource.id).state, "playing");
  assert.equal(store.stopSoundPreview(), true);
  assert.equal(store.state.soundPreview.state, "stopped");
  assert.equal(store.stopSoundPreview(), false, "a stopped preview must not emit another stop transition");
  store.destroy();
});

test("all runtime fixtures remain explicitly simulated rather than native certification", () => {
  const store = new SettingsStore("index-house", { storage: null });
  const stats = store.runtimeStats();
  assert.equal(stats.simulated, true);
  assert.equal(stats.nativeRuntimeCertified, false);
  assert.equal(store.performanceTelemetry().hardwareCertified, false);
  assert.match(store.performanceTelemetry().note, /no native Slint or physical-hardware certification claim/i);
  store.destroy();
});
