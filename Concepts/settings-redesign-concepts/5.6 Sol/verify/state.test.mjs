import test from "node:test";
import assert from "node:assert/strict";
import {
  MODEL_NAME,
  THEMES,
  CONCEPTS,
  CATEGORIES,
  PROVIDERS,
  ROLE_ASSIGNMENTS,
  MEMORY_GISTS,
  TERMINAL_PROFILES,
  MANAGERS,
  MANAGER_INVENTORIES,
  CONCEPT_MANAGER_ASSIGNMENTS,
  FLOW_TEMPLATES,
  DETERMINISTIC_TRIGGERS,
  SCENARIOS,
  VALUE_STATES,
  SPELLING_FIXTURE,
  SETUP_SESSIONS,
  RECENT_CHANGES,
  RECEIPT_HISTORY,
  allSettings,
  buildSearchIndex
} from "../_shared/data.mjs";
import { SettingsStore, scoreQuery } from "../_shared/state.mjs";
import { MOTION_BLUEPRINTS, MOTION_KINDS } from "../_shared/motion.mjs";

const normalizedValueState = (value) => value === "Effective value differs"
  ? "effective-difference"
  : String(value).toLowerCase().replace(/\s+/g, "-");

test("flagship fixtures keep exact model identity and packet-sized inventories", () => {
  assert.equal(MODEL_NAME, "5.6 Sol");
  assert.equal(Object.keys(CONCEPTS).length, 4);
  assert.equal(THEMES.length, 8);
  assert.equal(CATEGORIES.length, 10);
  assert.equal(Object.keys(SCENARIOS).length, 12);
  assert.equal(PROVIDERS.length, 7);
  assert.equal(ROLE_ASSIGNMENTS.length, 11);
  assert.ok(MANAGERS.length >= 10);
  assert.ok(allSettings().length >= 70);
  assert.ok(MEMORY_GISTS.length >= 8);
  assert.equal(TERMINAL_PROFILES.length, 4);
  assert.equal(SETUP_SESSIONS.length, 3);
  assert.ok(RECENT_CHANGES.length >= 6);
  assert.ok(RECEIPT_HISTORY.length >= 3);
  assert.ok(Object.values(CONCEPTS).every((concept) => concept.title.includes(MODEL_NAME)));
  for (const managerId of ["context", "personas", "crew", "mcp", "lsp", "extensions", "media"]) {
    assert.ok(MANAGER_INVENTORIES[managerId]?.items?.length, `${managerId} needs a searchable inventory`);
  }
});

test("four motion systems cover every semantic moment with distinct signatures and bounded timing", () => {
  assert.deepEqual(MOTION_KINDS, ["navigate", "category", "search", "jump", "scrollspy", "disclosure", "refresh", "save", "reorder", "drawer", "transaction", "preview"]);
  const expectedReducedRoles = {
    "index-house": "address-marker",
    switchboard: "signal-marker",
    wayfinder: "waypoint-current",
    ledger: "rule"
  };
  const navigateSignatures = new Set();
  for (const [conceptId, blueprint] of Object.entries(MOTION_BLUEPRINTS)) {
    assert.equal(blueprint.reducedRole, expectedReducedRoles[conceptId]);
    assert.ok(blueprint.timing.feedback >= 70 && blueprint.timing.feedback <= 120, `${conceptId} feedback timing`);
    assert.ok(blueprint.timing.local >= 160 && blueprint.timing.local <= 240, `${conceptId} local timing`);
    assert.ok(blueprint.timing.major >= 260 && blueprint.timing.major <= 420, `${conceptId} major timing`);
    for (const kind of MOTION_KINDS) {
      assert.ok(Array.isArray(blueprint[kind]) && blueprint[kind].length > 0, `${conceptId} lacks ${kind}`);
      assert.ok(blueprint[kind].length <= 6, `${conceptId} ${kind} exceeds the six-item stagger cap`);
      assert.ok(Math.max(...blueprint[kind].map((step) => step.delay || 0)) <= 180, `${conceptId} ${kind} exceeds the 180ms stagger cap`);
    }
    navigateSignatures.add(blueprint.navigate.map((step) => `${step.role}:${step.effect}`).join("|"));
  }
  assert.equal(navigateSignatures.size, 4, "the concepts must not share one navigation choreography");
});

test("normalized provider graph has valid account, connection, product, model, adapter, and evidence references", () => {
  const globalIds = new Set();
  for (const provider of PROVIDERS) {
    const accountIds = new Set(provider.accounts.map((entry) => entry.id));
    const connectionIds = new Set(provider.connections.map((entry) => entry.id));
    const productIds = new Set(provider.products.map((entry) => entry.id));
    const adapterIds = new Set(provider.runtimeAdapters.map((entry) => entry.id));
    for (const collection of [provider.accounts, provider.connections, provider.products, provider.models, provider.runtimeAdapters]) {
      for (const entity of collection) {
        assert.ok(!globalIds.has(entity.id), `duplicate normalized entity id ${entity.id}`);
        globalIds.add(entity.id);
      }
    }
    assert.ok(accountIds.has(provider.activeAccountId) || provider.activeAccountId === null);
    assert.ok(accountIds.has(provider.inFlightAccountId) || provider.inFlightAccountId === null);
    for (const connection of provider.connections) assert.ok(accountIds.has(connection.accountId), `${connection.id} has an unknown account`);
    for (const product of provider.products) {
      assert.ok(accountIds.has(product.accountId), `${product.id} has an unknown account`);
      assert.ok(connectionIds.has(product.connectionId), `${product.id} has an unknown connection`);
      for (const modelId of product.modelIds) assert.ok(provider.models.some((model) => model.id === modelId), `${product.id} has an unknown model`);
    }
    for (const model of provider.models) {
      assert.ok(model.capabilityEvidence.length >= 4, `${model.id} needs capability evidence`);
      assert.ok(model.productIds.every((id) => productIds.has(id)), `${model.id} has an unknown product`);
      assert.ok(model.runtimeAdapterIds.every((id) => adapterIds.has(id)), `${model.id} has an unknown adapter`);
    }
  }
  const fixtureText = JSON.stringify(PROVIDERS);
  for (const expectation of ["CLI-owned OAuth", "API billing", "Server connection", "No authentication", "signed-out", "not-installed", "generation failed", "exhausted"]) {
    assert.match(fixtureText, new RegExp(expectation, "i"), `provider fixtures miss ${expectation}`);
  }
});

test("every semantic value state is represented with provenance, scope, exposure, effects, and requirements", () => {
  const settings = allSettings();
  const represented = new Set(settings.map((entry) => entry.valueState));
  for (const state of VALUE_STATES) assert.ok(represented.has(state), `missing ${state}`);
  for (const entry of settings) {
    assert.ok(entry.source, `${entry.id} has no source`);
    assert.ok(entry.scope, `${entry.id} has no scope`);
    assert.ok(entry.exposure, `${entry.id} has no exposure`);
    assert.ok(Array.isArray(entry.effects), `${entry.id} effects must be normalized`);
    assert.ok(Array.isArray(entry.requirements), `${entry.id} requirements must be normalized`);
  }
  const store = new SettingsStore("ledger");
  const storeStates = new Set([...store.settings.values()].map((entry) => entry.valueState));
  for (const state of VALUE_STATES) assert.ok(storeStates.has(normalizedValueState(state)), `store normalization lost ${state}`);
  const recommendation = [...store.settings.values()].find((entry) => entry.recommended);
  assert.ok(recommendation);
  assert.notEqual(recommendation.recommended, recommendation.valueState === "recommended", "recommendation must remain independent of value state");
});

test("search is fuzzy, global, and returns structured exact destinations", () => {
  const store = new SettingsStore("index-house");
  const crash = store.search("crash recov")[0];
  assert.equal(crash.targetId, "experience.startup.recovery");
  assert.deepEqual(crash.destination, {
    type: "setting",
    categoryId: "experience",
    subcategoryId: "startup-defaults",
    settingId: "experience.startup.recovery"
  });
  const terminal = store.search("terminal profiles")[0];
  assert.equal(terminal.destination.managerId, "terminal");
  assert.ok(store.search("control agents").some((entry) => entry.targetId === "safety"));
  assert.ok(scoreQuery({ title: "Assistant memory", haystack: "evidence recall", kind: "Manager" }, "memry") > 0);
  assert.ok(buildSearchIndex().length >= 170);

  const notice = SCENARIOS.attention.notices.find((entry) => entry.id.includes("work-claude"));
  const result = store.dispatch({ type: "navigate.destination", destination: notice.destination });
  assert.equal(result.ok, true);
  assert.equal(store.state.managerId, "providers");
  assert.equal(store.state.managerTab, "accounts");
  assert.equal(store.state.selectedProviderId, "claude");
  assert.equal(store.state.selectedAccountId, "claude-work");

  const usage = store.search("measured balance").find((entry) => entry.id === "open-usage-detail");
  assert.ok(usage, "Usage handoff search result is missing");
  const usageResult = store.dispatch({ type: "navigate.destination", destination: usage.destination });
  assert.equal(usageResult.ok, true);
  assert.equal(store.state.screen, "manager");
  assert.equal(store.state.managerId, "providers");
  assert.equal(store.state.managerTab, "usage");
  assert.equal(usageResult.focusRequest.selector, '[data-focus-key="provider-usage-heading"]');
  assert.notEqual(store.state.categoryId, undefined, "Usage handoff must never fall through to an undefined category");
});

test("dispatch returns a structured result and semantic focus is one-shot", () => {
  const store = new SettingsStore("wayfinder");
  const result = store.dispatch({ type: "navigate.setting", settingId: "experience.input.project-dictionary-manage" });
  assert.equal(result.action, "navigate.setting");
  assert.equal(result.ok, true);
  assert.ok(result.scopes.includes("focus"));
  assert.match(result.motionKey, /wayfinder/);
  assert.equal(result.focusRequest.kind, "setting");
  assert.equal(result.focusRequest.id, "experience.input.project-dictionary-manage");
  assert.ok(store.state.advancedSections.includes("experience:appearance-input"));
  const requestId = result.focusRequest.requestId;
  const consumed = store.dispatch({ type: "focus.consume", requestId });
  assert.equal(consumed.value.kind, "setting");
  assert.equal(store.state.focusRequest, null);
  store.dispatch({ type: "setting.update", settingId: "experience.input.project-dictionary", value: "Do not use" });
  assert.equal(store.state.focusRequest, null, "later local edits must not resurrect a consumed deep-link focus request");
  const drawer = store.dispatch({ type: "navigation.toggle", open: true });
  assert.equal(drawer.focusRequest.kind, "drawer");
  assert.equal(drawer.focusRequest.selector, "#categoryNavigator button");
  store.openManager("providers", "overview");
  const tab = store.dispatch({ type: "manager.tab", tab: "models" });
  assert.equal(tab.focusRequest.selector, '[role="tab"][data-manager-tab="models"]');

  const indexStore = new SettingsStore("index-house");
  indexStore.dispatch({ type: "navigate.category", categoryId: "experience" });
  indexStore.dispatch({ type: "navigation.toggle", open: true });
  const evidence = indexStore.dispatch({ type: "inspector.toggle", open: true });
  assert.equal(evidence.focusRequest.kind, "drawer");
  assert.equal(evidence.focusRequest.selector, '#workspaceInspector [data-focus-key="inspector-heading"]');
  assert.equal(indexStore.state.inspectorOpen, true);
  assert.equal(indexStore.state.navigationOpen, false, "evidence and category drawers must not remain open together");
  indexStore.dispatch({ type: "inspector.toggle", open: false });
  assert.equal(indexStore.state.inspectorOpen, false);
});

test("validated settings preserve rejected drafts and distinguish default from inherited", () => {
  const store = new SettingsStore("ledger");
  const id = "planning.goal.concurrency";
  const setting = store.settings.get(id);
  const previous = setting.value;
  assert.equal(store.updateSetting(id, 99), false);
  assert.equal(setting.value, previous);
  assert.equal(setting.invalidDraft, 99);
  assert.match(setting.validationError, /12 or less/);
  assert.equal(store.updateSetting(id, 6), true);
  assert.equal(setting.value, 6);
  assert.equal(setting.validationError, null);
  assert.equal(store.resetSetting(id), true);
  assert.equal(setting.value, setting.defaultValue);
  assert.equal(setting.status, "default");

  const inheritedId = "experience.input.project-dictionary";
  assert.equal(store.updateSetting(inheritedId, "Do not use"), true);
  assert.equal(store.useInheritedSetting(inheritedId), true);
  assert.equal(store.settings.get(inheritedId).status, "inherited");
  assert.ok(store.receiptHistory.some((entry) => entry.title === "Inherited value active"));
});

test("theme, density, and reduction settings share the effective presentation state", () => {
  const store = new SettingsStore("index-house");
  assert.equal(store.setPresentation({ theme: "Basic Light", density: "compact", reducedMotionOverride: true, direction: "rtl", textScale: 1.35 }), true);
  assert.equal(store.state.theme, "basic-light");
  assert.equal(store.state.density, "compact");
  assert.equal(store.state.reducedMotion, true);
  assert.equal(store.state.presentation.direction, "rtl");
  assert.equal(store.state.presentation.textScale, 1.35);
  assert.equal(store.settings.get("experience.appearance.theme").value, "Basic Light");
  assert.equal(store.settings.get("experience.appearance.density").value, "Compact");
  assert.equal(store.settings.get("experience.appearance.motion").effectiveValue, true);
  store.state.osReducedMotion = true;
  store.setPresentation({ reducedMotionOverride: false });
  assert.equal(store.state.reducedMotion, true, "OS reduction must remain effective when explicit reduction is off");
});

test("all twelve scenario overlays are deterministic and Calm/Setup summaries cannot contradict fixtures", () => {
  const store = new SettingsStore("switchboard");
  for (const scenarioId of Object.keys(SCENARIOS)) {
    assert.equal(store.setScenario(scenarioId), true, scenarioId);
    assert.equal(store.state.scenario, scenarioId);
    assert.deepEqual(store.state.scenarioOverlay, SCENARIOS[scenarioId].entityOverlay || SCENARIOS[scenarioId].overlay || {});
  }
  store.setScenario("calm");
  assert.equal(store.setupSessions.length, 0);
  assert.ok(CATEGORIES.every((entry) => store.categoryStatus(entry.id) === "Ready"));
  assert.equal(store.settings.get("code.language.python").available, true);
  store.setScenario("setup");
  assert.equal(store.setupSessions.length, 3);
  assert.equal(store.provider("antigravity").state, "setup");
  store.setScenario("managed");
  assert.equal(store.settings.get("context.retention.raw").status, "managed");
  store.setScenario("effective-difference");
  assert.equal(store.settings.get("planning.goal.effective").status, "effective-difference");
});

test("provider refresh deduplicates, quarantines failures, and preserves last-known-good rows", async () => {
  const store = new SettingsStore("switchboard");
  store.setScenario("degraded");
  const before = store.provider("openai").models.map((model) => model.id);
  let refreshStarts = 0;
  store.subscribe((_state, event) => { if (event.action === "provider-refresh-start") refreshStarts += 1; });
  const first = store.refreshProvider("openai");
  const second = store.refreshProvider("openai");
  assert.deepEqual(store.state.refreshingProviderIds, ["openai"], "refresh must expose a visible in-flight state before settling");
  assert.deepEqual(await Promise.all([first, second]), [false, false]);
  assert.equal(refreshStarts, 1);
  assert.deepEqual(store.provider("openai").models.map((model) => model.id), before);
  assert.equal(store.provider("openai").catalogue.quarantine.length >= 1, true);
  assert.equal(store.providerOperations.filter((entry) => entry.action === "refresh").length, 1);
  assert.ok(store.receiptHistory.some((entry) => /last-known-good/.test(entry.message)));
  await store.whenIdle();
  assert.equal(store.state.refreshingProviderIds.length, 0);
});

test("future account selection does not mutate captured in-flight routing and emits once", () => {
  const store = new SettingsStore("switchboard");
  store.setScenario("normal");
  const provider = store.provider("openai");
  const capturedInFlight = provider.inFlightAccountId;
  let routeEvents = 0;
  store.subscribe((_state, event) => { if (event.action === "provider-account") routeEvents += 1; });
  const result = store.dispatch({ type: "provider.account.use", providerId: "openai", accountId: "openai-work" });
  assert.equal(result.ok, true);
  assert.equal(provider.activeAccountId, "openai-work");
  assert.equal(provider.inFlightAccountId, capturedInFlight);
  assert.equal(routeEvents, 1, "one user action must produce one route event");
  assert.match(store.state.receipts.at(-1).message, /in-flight request/);
});

test("model capability gates and all role assignments protect high-quality planning routes", () => {
  const store = new SettingsStore("switchboard");
  store.setScenario("normal");
  assert.equal(store.setModelSpeed("sol-56-mini", "Fast"), false);
  assert.equal(store.setModelSpeed("sol-56", "Fast"), true);
  assert.equal(store.model("sol-56").model.speed, "Fast");
  assert.equal(store.setModelEffort("sol-56", "Extra high"), true);
  assert.equal(store.setModelEffort("sol-56-mini", "Extra high"), false);
  assert.equal(store.assignRole("planning", "5.6 Sol Mini"), false);
  assert.equal(store.roles.find((entry) => entry.id === "planning").route, "Use Main Assistant");
  assert.equal(store.assignRole("planning", "5.6 Sol — Personal Codex"), true);
  assert.equal(store.roles.length, 11);
});

test("Memory edits and restores append immutable versions; discard Undo preserves history", () => {
  const store = new SettingsStore("wayfinder");
  const memory = store.memories.find((entry) => entry.id === "gist-provider-route") || store.memories[0];
  const originalVersion = memory.version;
  const originalCount = memory.versions.length;
  const immutableSnapshot = memory.versions[0];
  assert.equal(Object.isFrozen(immutableSnapshot), true);
  assert.equal(store.editMemory(memory.id, { summary: `${memory.summary} Corrected.` }), true);
  assert.equal(memory.version, originalVersion + 1);
  assert.equal(memory.versions.length, originalCount + 1);
  assert.equal(store.verifyMemory(memory.id), true);
  const preRestoreVersion = memory.version;
  assert.equal(store.restoreMemory(memory.id, 1), true);
  assert.equal(memory.version, preRestoreVersion + 1, "restore must create a new version");
  assert.equal(memory.versions.at(-1).restoredFrom, 1);
  assert.equal(memory.versions[0], immutableSnapshot, "prior immutable snapshot identity must remain intact");
  const versionCount = memory.versions.length;
  assert.equal(store.discardMemory(memory.id), true);
  assert.equal(store.memories.some((entry) => entry.id === memory.id), false);
  assert.equal(store.undoDiscardMemory(), true);
  assert.equal(store.memories.find((entry) => entry.id === memory.id).versions.length, versionCount);
  assert.equal(store.state.memoryUndo, null);
});

test("Terminal keeps saved and draft state separate, blocks dirty switches, validates bounds, and records diagnostics", () => {
  const store = new SettingsStore("ledger");
  const profile = store.terminal();
  const originalSize = profile.saved.fontSize;
  assert.equal(store.updateTerminal("fontSize", originalSize + 2), true);
  assert.equal(profile.draft.fontSize, originalSize + 2);
  assert.equal(profile.saved.fontSize, originalSize);
  assert.equal(profile.dirty, true);
  const other = store.terminals.find((entry) => entry.id !== profile.id);
  assert.equal(store.selectTerminal(other.id), false);
  assert.deepEqual(store.state.pendingTerminalSwitch, { fromId: profile.id, toId: other.id });
  assert.equal(store.resolveTerminalSwitch("discard"), true);
  assert.equal(store.state.selectedTerminalId, other.id);
  assert.equal(store.terminals.find((entry) => entry.id === profile.id).dirty, false);
  assert.equal(store.updateTerminal("fontSize", 200), false);
  assert.equal(store.runTerminalDiagnostics(other.id).simulation, true);
  assert.ok(store.receiptHistory.some((entry) => /diagnostics/i.test(entry.title)));
});

test("all five explicit spelling actions work and technical content remains excluded without autocorrect", () => {
  const base = new SettingsStore("index-house");
  assert.equal(base.spelling.draft, SPELLING_FIXTURE.draft.sentence);
  assert.equal(base.spellingCandidates().length, 1);
  assert.equal(base.spelling.lastAction, null);
  const actions = [
    ["replace-once", (store) => assert.match(store.spelling.draft, /repository/)],
    ["ignore-once", (store) => assert.equal(store.spelling.ignoredOnce.length, 1)],
    ["ignore-draft", (store) => assert.ok(store.spelling.ignoredForDraft.includes("repositry"))],
    ["add-personal", (store) => assert.ok(store.spelling.personalDictionary.includes("repositry"))],
    ["add-project", (store) => assert.ok(store.spelling.projectDictionary.includes("repositry"))]
  ];
  for (const [action, verify] of actions) {
    const store = new SettingsStore("index-house");
    assert.equal(store.spellAction(action, { word: "repositry", replacement: "repository" }), true, action);
    verify(store);
    assert.equal(store.spelling.lastAction.automatic, false);
    assert.equal(store.spellingCandidates().length, 0);
  }
  for (const [text, context] of [
    ["repositry()", { kind: "code" }],
    ["https://example.test/repositry", {}],
    ["/project/repositry/file.rs", {}],
    ["git repositry inspect", {}],
    ["9fe31a7", {}],
    ["data-concept-model", { kind: "identifier" }],
    ["5.6 Sol", { kind: "model" }],
    ["repositry", { literal: true }]
  ]) assert.equal(base.spellingCandidates(text, context).length, 0, text);
});

test("generic manager fixtures expose health, requested/effective state, history, diagnostics, and honest receipts", () => {
  const store = new SettingsStore("index-house");
  for (const managerId of Object.keys(MANAGER_INVENTORIES)) {
    const inventory = store.managerItems(managerId);
    assert.ok(inventory.items.length > 0, managerId);
    assert.ok(inventory.items.some((entry) => entry.status || entry.health || entry.state), `${managerId} needs health/state`);
    assert.ok(inventory.items.every((entry) => entry.requested !== undefined && entry.effective !== undefined), `${managerId} needs requested/effective data on every row`);
    assert.ok(inventory.items.every((entry) => entry.detail || entry.summary || entry.description), `${managerId} needs detail on every row`);
    assert.ok(inventory.items.every((entry) => entry.history), `${managerId} needs history on every row`);
    assert.ok(inventory.items.every((entry) => Array.isArray(entry.diagnostics) && entry.diagnostics.length), `${managerId} needs diagnostics on every row`);
    assert.ok(inventory.items.every((entry) => !entry.diagnostics.some((item) => /Fixture reference:/i.test(String(item)))), `${managerId} exposes a raw fixture reference`);
    assert.ok(inventory.items.every((entry) => entry.status), `${managerId} needs a human display status`);
  }
  assert.equal(MANAGER_INVENTORIES.personas.items[0].comparisonAuthored, false, "Personas must not receive a synthetic requested/effective comparison");
  assert.equal(MANAGER_INVENTORIES.mcp.items[0].comparisonAuthored, true, "MCP explicitly authored requested/effective state");
  store.setScenario("unavailable");
  const media = store.managerItems("media");
  assert.equal(media.items.find((entry) => entry.id === "local-audio-route").status, "Offline", "scenario resource overlays must reach normalized manager items");
  const before = store.receiptHistory.length;
  assert.equal(store.runProviderAction("repair", "claude"), true);
  assert.equal(store.receiptHistory.length, before + 1);
  assert.equal(store.receiptHistory.at(-1).simulation, true);
  assert.match(store.receiptHistory.at(-1).message, /simulated/i);
});

test("whenIdle resolves to a detached normalized snapshot after pending work settles", async () => {
  const store = new SettingsStore("ledger");
  store.setScenario("normal");
  const refresh = store.refreshProvider("openai");
  const snapshot = await store.whenIdle();
  assert.equal(await refresh, true);
  assert.equal(snapshot.state.refreshingProviderIds.length, 0);
  assert.equal(snapshot.providers.length, 7);
  assert.equal(snapshot.roles.length, 11);
  assert.equal(snapshot.memories.length, store.memories.length);
  snapshot.state.screen = "tampered";
  snapshot.providers[0].name = "tampered";
  assert.notEqual(store.state.screen, "tampered");
  assert.notEqual(store.providers[0].name, "tampered");
});


test("final concept assignments cover every packet manager family without collapsing distinct systems", () => {
  assert.deepEqual(Object.fromEntries(Object.entries(CONCEPT_MANAGER_ASSIGNMENTS).map(([id, managers]) => [id, managers.length])), {
    "index-house": 8,
    switchboard: 6,
    wayfinder: 11,
    ledger: 13
  });
  for (const [conceptId, managerIds] of Object.entries(CONCEPT_MANAGER_ASSIGNMENTS)) {
    assert.equal(new Set(managerIds).size, managerIds.length, `${conceptId} repeats a manager family`);
    for (const managerId of managerIds) {
      assert.ok(MANAGERS.some((entry) => entry.id === managerId), `${conceptId} references unknown ${managerId}`);
      if (!["providers", "memory", "terminal"].includes(managerId)) assert.ok(MANAGER_INVENTORIES[managerId]?.items?.length, `${conceptId}/${managerId} has no inventory`);
    }
  }
  for (const distinct of ["commands-shortcuts", "mcp", "skills", "plugins", "tools"]) {
    assert.ok(CONCEPT_MANAGER_ASSIGNMENTS.wayfinder.includes(distinct), `${distinct} was improperly collapsed`);
  }
});

test("provider installations preserve explicit ownership, auth, official-source, update, shadow, and rollback boundaries", () => {
  const store = new SettingsStore("switchboard");
  const all = store.providers.flatMap((provider) => (provider.installations || []).map((installation) => ({ provider, installation })));
  assert.ok(all.some(({ installation }) => installation.selected));
  assert.ok(all.some(({ installation }) => installation.shadowed));
  assert.ok(all.some(({ installation }) => /unknown/i.test(installation.ownershipConfidence)));
  assert.ok(all.some(({ installation }) => /CLI-owned OAuth/i.test(installation.authBoundary)));
  assert.ok(all.some(({ installation }) => /PM-direct OAuth/i.test(installation.authBoundary)));
  assert.ok(all.every(({ installation }) => installation.officialSource));
  assert.ok(all.every(({ installation }) => installation.updatePolicy));
  const selected = all.find(({ installation }) => installation.actions?.some((action) => /update/i.test(action)));
  assert.ok(selected);
  assert.ok(store.runProviderInstallationAction(selected.provider.id, selected.installation.id, "Update from official source"));
  assert.equal(store.state.activeFlow.kind, "provider-update");
  assert.equal(store.advanceFlow({ outcome: "fail" }).status, "failed");
  assert.equal(store.state.activeFlow.rollbackAvailable, true);
  assert.equal(store.rollbackFlow().status, "rolled-back");
});

test("settings import transaction hard-gates conflict choice and records verified completion", () => {
  const store = new SettingsStore("ledger");
  assert.ok(FLOW_TEMPLATES["settings-import"].choices.includes("Merge"));
  store.openManager("settings-lifecycle");
  store.startFlow("settings-import", { managerId: "settings-lifecycle", resourceId: "settings-import" });
  for (let index = 0; index < 3; index += 1) store.advanceFlow();
  assert.equal(store.state.activeFlow.stageIndex, 3);
  assert.equal(store.advanceFlow(), false);
  assert.equal(store.state.activeFlow.status, "choice-required");
  assert.equal(store.chooseFlow("Merge"), true);
  while (store.state.activeFlow.status !== "complete") store.advanceFlow();
  assert.ok(store.state.flowHistory.some((flow) => flow.kind === "settings-import" && flow.choice === "Merge"));
});

test("all deterministic review triggers are unique, reachable, and disclose fixture status", () => {
  assert.equal(DETERMINISTIC_TRIGGERS.length, 24);
  assert.equal(new Set(DETERMINISTIC_TRIGGERS.map((entry) => entry.id)).size, 24);
  for (const fixture of DETERMINISTIC_TRIGGERS) {
    const concept = fixture.managerId && Object.entries(CONCEPT_MANAGER_ASSIGNMENTS).find(([, managers]) => managers.includes(fixture.managerId))?.[0] || "index-house";
    const store = new SettingsStore(concept);
    const result = store.triggerFixture(fixture.id);
    assert.equal(result.id, fixture.id);
    assert.equal(store.state.activeFixture, fixture.id);
    assert.ok(store.receiptHistory.some((entry) => /review fixture/i.test(entry.title)));
  }
});

test("appearance preview is reversible and custom theme validation exposes safe fallback", () => {
  const store = new SettingsStore("switchboard");
  const original = store.state.theme;
  assert.equal(store.previewTheme("retro-dark"), true);
  assert.equal(store.state.theme, "retro-dark");
  assert.equal(store.revertThemePreview(), true);
  assert.equal(store.state.theme, original);
  const invalid = store.validateCustomTheme('unsupported_token = "yes"');
  assert.equal(invalid.state, "invalid");
  assert.equal(invalid.fallback, "friendly-dark");
});

test("persistent reset restores the complete authored state", () => {
  const store = new SettingsStore("switchboard");
  store.applyReviewState({ theme: "retro-light", density: "compact", reducedMotion: true, direction: "rtl", textScale: 1.35 });
  store.openManager("appearance");
  store.triggerFixture("theme-invalid-token");
  store.startFlow("theme", { managerId: "appearance" });
  store.resetPersistentDemo();
  assert.equal(store.state.screen, "home");
  assert.equal(store.state.managerId, null);
  assert.equal(store.state.theme, "friendly-dark");
  assert.equal(store.state.density, "automatic");
  assert.equal(store.state.reducedMotionOverride, null);
  assert.equal(store.state.presentation.direction, "ltr");
  assert.equal(store.state.presentation.textScale, 1);
  assert.equal(store.state.activeFixture, null);
  assert.equal(store.state.activeFlow, null);
  assert.equal(store.state.persistence.restored, false);
});

