import { ARTIFACT_STATES, BSD_OPTIONS, STORAGE_KEY, clamp, stableId } from "./definitions.js";

const STATE_SCHEMA = "pm.chat.5_6_sol.prototype_state.v4";

const THREAD_LOCAL_KEYS = [
  "route",
  "routeBrowse",
  "routeSearch",
  "providerSetup",
  "conversationMode",
  "access",
  "bsd",
  "context",
  "thoughts",
  "question",
  "operational",
  "agentActive",
  "activeRunToken",
  "communication",
  "branch",
  "attachmentResolution",
  "routeWarning",
  "approval",
  "warnings",
  "grants",
  "resourceSelection",
  "activityPhase",
  "workingSummary",
  "workedSeconds",
  "motionCue"
];

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function deepMerge(base, overlay) {
  if (Array.isArray(base) || Array.isArray(overlay)) return clone(overlay ?? base);
  if (!base || typeof base !== "object") return overlay ?? base;
  const merged = { ...base };
  Object.entries(overlay ?? {}).forEach(([key, value]) => {
    merged[key] = value && typeof value === "object" && !Array.isArray(value)
      ? deepMerge(base[key] ?? {}, value)
      : clone(value);
  });
  return merged;
}

async function fetchJson(relativePath) {
  const url = new URL(relativePath, import.meta.url);
  if (url.protocol === "file:") {
    return new Promise((resolveData, rejectData) => {
      const request = new XMLHttpRequest();
      request.open("GET", url.href, true);
      request.responseType = "json";
      request.addEventListener("load", () => {
        if (request.status !== 0 && (request.status < 200 || request.status >= 300)) {
          rejectData(new Error(`Could not load ${relativePath}: ${request.status}`));
          return;
        }
        try {
          resolveData(request.response ?? JSON.parse(request.responseText));
        } catch (error) {
          rejectData(new Error(`Could not parse ${relativePath}: ${error.message}`));
        }
      });
      request.addEventListener("error", () => rejectData(new Error(`Could not load ${relativePath} from the local fixture`)));
      request.send();
    });
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load ${relativePath}: ${response.status}`);
  return response.json();
}

export async function loadPrototypeData() {
  const [baseline, extensionSource, legacyScenario, matrix, correctedScenario, triggerContract] = await Promise.all([
    fetchJson("../data/original_demoData.json"),
    fetchJson("../data/sol-extensions.json"),
    fetchJson("../data/extended_demo_scenario.json"),
    fetchJson("../data/original_testMatrix.json"),
    fetchJson("../data/demo-scenario-manifest.json"),
    fetchJson("../data/demo-trigger-contract.json")
  ]);
  const extension = clone(extensionSource);
  const correctedQuestions = {
    id: "q-provider-route",
    title: "Provider settings and Chat access redesign",
    state: "open",
    activeIndex: 0,
    questions: correctedScenario.questions.map((question) => ({
      ...clone(question),
      kind: question.type.replaceAll("_", " "),
      required: question.id !== "q3"
    }))
  };
  extension.questionnaires = [correctedQuestions, ...extension.questionnaires.filter((item) => item.id !== correctedQuestions.id)];
  extension.operational_fixture = {
    ...extension.operational_fixture,
    goal: {
      ...extension.operational_fixture.goal,
      objective: correctedScenario.goal.title,
      phase: correctedScenario.goal.phases[0],
      state: "running",
      progress: 18
    },
    todos: correctedScenario.todos.map((label, index) => ({ id: `todo-${index + 1}`, label, state: index === 0 ? "running" : "pending" })),
    subagents: correctedScenario.subagents.map((agent, index) => ({
      id: `agent-${index + 1}`,
      role: agent.name,
      route: agent.route,
      state: agent.state_sequence[0],
      stateSequence: clone(agent.state_sequence),
      elapsed: index === 1 ? "2m 08s" : "Waiting",
      summary: index === 0 ? "Auditing the interface system" : index === 1 ? "Researching provider adapter boundaries" : "Reserved for Slint and test review"
    })),
    crew: { ...extension.operational_fixture.crew, state: "wave 1 of 3", capacity: "2 concurrent of 3", reserve: "1 verification route retained", members: 3 },
    activity: [
      { domain: "Thinking summary", state: "complete", summary: "Provider-exposed planning summary retained" },
      { domain: "Thread search", state: "complete", summary: correctedScenario.activity_groups[0].summary },
      { domain: "File read", state: "complete", summary: correctedScenario.activity_groups[1].summary },
      { domain: "Fetch", state: "complete", summary: "Fetched bounded owner references with source receipts" },
      { domain: "BrowserWorkspace", state: "running", summary: correctedScenario.activity_groups[3].summary },
      { domain: "Tests", state: "waiting", summary: correctedScenario.activity_groups[5].summary },
      { domain: "Edits", state: "complete", summary: correctedScenario.activity_groups[4].summary },
      { domain: "Generated output", state: "pending", summary: "Implementation handoff generation queued" }
    ],
    diff: {
      state: "updated",
      open: false,
      files: correctedScenario.diff_files.length,
      additions: correctedScenario.diff_files.reduce((sum, item) => sum + item.additions, 0),
      deletions: correctedScenario.diff_files.reduce((sum, item) => sum + item.deletions, 0),
      entries: clone(correctedScenario.diff_files)
    },
    resources: extension.operational_fixture.resources.map((resource) => resource.kind === "Port" ? {
      ...resource,
      state: "conflict",
      summary: `${correctedScenario.resource_collision.requested} occupied by ${correctedScenario.resource_collision.occupied_by}`,
      action: `Use ${correctedScenario.resource_collision.safe_alternative}`
    } : resource)
  };
  const scenarioKinds = {
    multi_file_diff: "multi-file diff",
    visual_preview: "test screenshot",
    test_report: "report document",
    document: "report document"
  };
  const correctedArtifacts = correctedScenario.artifacts.map((artifact, index) => ({
    id: artifact.id,
    kind: scenarioKinds[artifact.type] ?? artifact.type.replaceAll("_", " "),
    title: artifact.title,
    version: `v${index + 1}`,
    state: "ready",
    summary: index === 0 ? "Three-file change set with exact additions and deletions." : index === 1 ? "Inspectable provider and account routing preview." : index === 2 ? "Interaction, keyboard, width, theme, and reduced-motion evidence." : "Owner-routed implementation impact and portability guidance.",
    owner: "Artifact Service"
  }));
  extension.artifacts = [...correctedArtifacts, ...extension.artifacts.filter((artifact) => !correctedArtifacts.some((item) => item.id === artifact.id))];
  const antigravity = extension.route_catalog.find((provider) => provider.provider === "Google")?.accounts
    .find((account) => account.id === "antigravity-cli")?.models.find((model) => model.id === "ag-pro");
  if (antigravity) {
    antigravity.setupRequired = true;
    antigravity.providerCliId = "google-antigravity-cli";
    antigravity.reason = "Provider CLI setup required on Build Host East · Native environment";
  }
  const threads = [...baseline.threads, ...extension.threads];
  correctedScenario.history_rows.forEach((title, index) => {
    if (threads[index]) threads[index] = { ...threads[index], title };
  });
  const contractTriggers = Object.entries(triggerContract.families).flatMap(([family, events]) => events.map((event) => `${family}.${event}`));
  const supplementalTriggers = [
    "provider.setup_required", "provider.existing_found", "provider.use_existing", "provider.install_intent", "provider.install_approved", "provider.install_verified", "provider.install_failed",
    "provider.auth_required", "provider.authenticated", "provider.readiness_verified", "provider.continuation_resumed", "provider.continuation_stale_rejected",
    "provider.continuation_expired_rejected", "provider.continuation_topology_mismatch_rejected",
    "attachment.native", "attachment.transformed", "attachment.alternate", "attachment.unsupported",
    "context.lens", "context.compact_now", "bsd.off", "bsd.auto_idle", "bsd.auto_active", "bsd.on", "bsd.advice", "bsd.timeout", "bsd.unavailable",
    "network.offline", "network.domain_failure", "network.reconnect", "network.replay", "network.snapshot", "notification.inline_outcome", "scenario.reset"
  ];
  const scenario = {
    ...legacyScenario.scenarios,
    corrected: correctedScenario,
    trigger_contract: triggerContract,
    contract_trigger_ids: contractTriggers,
    deterministic_triggers: [...contractTriggers, ...supplementalTriggers]
  };
  return {
    baseline,
    extension,
    scenario,
    matrix,
    triggerContract,
    correctedScenario,
    threads,
    threadMap: Object.fromEntries(threads.map((thread) => [thread.id, thread])),
    scriptedReplyMap: Object.fromEntries(baseline.scriptedReplies.map((reply) => [reply.id, reply]))
  };
}

function initialThreadViews(data, threadLocalSeed) {
  return Object.fromEntries(data.threads.map((thread) => [thread.id, {
    draft: thread.draftState?.text ?? "",
    draftAttachments: clone(thread.draftState?.attachments ?? []),
    draftHistory: thread.draftState?.text ? [{ id: `${thread.id}-draft-1`, text: thread.draftState.text, savedAt: thread.draftState.savedAt }] : [],
    searchQuery: "",
    scrollAnchor: thread.messages.at(-1)?.id ?? null,
    followingLatest: true,
    longExpanded: {},
    workExpanded: { "quiet-work-details": true },
    contextSelection: [],
    questionDrafts: {},
    scriptCursor: thread.scriptedReplyCursor ?? 0,
    local: clone(threadLocalSeed)
  }]));
}

function providerSupplyChainPlan(operationId, primaryThreadId, topologyGeneration) {
  return {
    schema_id: "pm.provider_cli_supply_chain_plan.fixture.v1",
    fixture_only: true,
    plan_status: "expected_source_contract",
    plan_id: `provider-cli-plan:${primaryThreadId}:001`,
    operation_id: operationId,
    provider_id: "google",
    provider_cli_product: "google-antigravity-cli",
    host_environment_ref: "host-environment:build-host-east:native",
    execution_host_id: "build-host-east",
    execution_environment_id: "native",
    topology_generation: topologyGeneration,
    official_source_kind: "provider_documented_package_manager_route",
    official_source_ref: "fixture://provider-manifest/google-antigravity-cli/official-release-route-v1",
    publisher_identity: "Google fixture publisher identity",
    package_or_artifact_identity: "google-antigravity-cli-fixture-package",
    manager_or_installer_identity: "provider-owned installer fixture",
    version: "2.8.4-fixture",
    channel: "stable-fixture",
    target_os: "linux",
    target_architecture: "x86_64",
    signature_or_attestation_ref: "fixture://provider-proof/google-antigravity-cli/signature-attestation",
    trust_root_ref: "fixture://provider-proof/google-antigravity-cli/trust-root",
    notarization_ref: null,
    sbom_ref: "fixture://provider-proof/google-antigravity-cli/sbom",
    license_ref: "fixture://provider-proof/google-antigravity-cli/license",
    redistribution_disposition: "official_source_only",
    compatibility_manifest_ref: "fixture://provider-proof/google-antigravity-cli/compatibility-manifest",
    known_bad_check_ref: "fixture://provider-proof/google-antigravity-cli/known-bad-check"
  };
}

function providerSupplyChainProof(setup, observedAt, overrides = {}) {
  const plan = setup.supplyChainPlan;
  return {
    schema_id: "pm.provider_cli_supply_chain_proof.fixture.v1",
    proof_status: "downloaded_fixture_receipt",
    fixture_only: true,
    proof_id: `provider-cli-proof:${setup.originatingOperationRef}:${setup.operationRevision}`,
    operation_id: setup.originatingOperationRef,
    attempt_id: `provider-cli-attempt:${setup.operationRevision}`,
    installation_id: `${setup.providerCliId}:${setup.hostId}:${setup.environmentId}`,
    installation_generation: "installation-generation-0",
    provider_id: plan.provider_id,
    provider_cli_product: setup.providerCliId,
    host_environment_ref: plan.host_environment_ref,
    execution_host_id: setup.hostId,
    execution_environment_id: setup.environmentId,
    topology_generation: setup.topologyGeneration,
    official_source_kind: setup.officialSourceKind,
    official_source_ref: setup.officialSourceRef,
    publisher_identity: plan.publisher_identity,
    package_or_artifact_identity: plan.package_or_artifact_identity,
    manager_or_installer_identity: plan.manager_or_installer_identity,
    version: plan.version,
    channel: plan.channel,
    target_os: plan.target_os,
    target_architecture: plan.target_architecture,
    artifact_sha256: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    signature_or_attestation_ref: plan.signature_or_attestation_ref,
    trust_root_ref: plan.trust_root_ref,
    notarization_ref: plan.notarization_ref,
    sbom_ref: plan.sbom_ref,
    license_ref: plan.license_ref,
    redistribution_disposition: plan.redistribution_disposition,
    compatibility_manifest_ref: plan.compatibility_manifest_ref,
    known_bad_check_ref: plan.known_bad_check_ref,
    download_receipt_ref: "fixture://provider-proof/google-antigravity-cli/download-receipt-001",
    verification_receipt_ref: null,
    rollback_artifact_proof_ref: null,
    observed_at: observedAt,
    ...overrides
  };
}

function providerSetupSeed(primaryThreadId) {
  const operationId = `chat-route-select:${primaryThreadId}`;
  const topologyGeneration = "topology-generation-17";
  return {
    providerCliId: "google-antigravity-cli",
    provider: "Google",
    setupState: "required",
    installState: "missing",
    discoveredInstallationRef: null,
    acquisitionConsentReceipt: null,
    officialSource: "Google-documented stable package route",
    officialSourceKind: "provider_documented_package_manager_route",
    officialSourceRef: "fixture://provider-manifest/google-antigravity-cli/official-release-route-v1",
    installedByDefault: false,
    requiresUserAction: true,
    authSeparate: true,
    provenance: "Not inspected until explicit install or existing-installation selection",
    version: "Unknown",
    architecture: "Unknown",
    license: "Review at install",
    hostId: "build-host-east",
    hostLabel: "Build Host East",
    host: "Build Host East",
    environmentId: "native",
    environmentLabel: "Native environment",
    environment: "Native environment",
    runtimeFamily: "native",
    topologyGeneration,
    exactRow: "Agent-Config › Providers › Google › Antigravity CLI › Build Host East / Native environment",
    authState: "not started",
    accountRef: null,
    readinessState: "blocked on installation",
    modelCatalogRevision: null,
    originatingOperationRef: operationId,
    continuationToken: "continuation-sol-provider-001",
    operationRevision: 1,
    expectedRevision: 1,
    expectedTopologyGeneration: topologyGeneration,
    intentState: "pending",
    expiresAt: "2026-08-15T00:00:00.000Z",
    current: true,
    currentnessState: "current",
    currentnessReasons: [],
    resumeCount: 0,
    consumedAt: null,
    coalescingKey: "google-antigravity-cli:build-host-east:native",
    result: "not resumed",
    message: "Provider Setup Required before this route can be used.",
    handoffOpen: false,
    autoInitialAcquisitionAllowed: false,
    supplyChainPlan: providerSupplyChainPlan(operationId, primaryThreadId, topologyGeneration),
    supplyChainProof: null
  };
}

function assessProviderContinuation(setup, deterministicTime) {
  const reasons = [];
  if (!setup?.continuationToken) reasons.push("continuation token missing");
  if (setup?.intentState !== "pending") reasons.push(`originating intent is ${setup?.intentState ?? "missing"}`);
  if (Number(setup?.operationRevision) !== Number(setup?.expectedRevision)) reasons.push("operation revision changed");
  if (!setup?.topologyGeneration || setup.topologyGeneration !== setup.expectedTopologyGeneration) reasons.push("topology generation changed");
  const expiresAt = Date.parse(setup?.expiresAt ?? "");
  const observedAt = Date.parse(deterministicTime ?? "");
  if (!Number.isFinite(expiresAt) || !Number.isFinite(observedAt)) reasons.push("continuation expiry is invalid");
  else if (observedAt > expiresAt) reasons.push("continuation expired");
  if (Number(setup?.resumeCount ?? 0) > 0) reasons.push("continuation already consumed");
  return { current: reasons.length === 0, state: reasons.length === 0 ? "current" : "stale", reasons };
}

function refreshProviderContinuationProjection(ui) {
  if (!ui.providerSetup) return { current: false, state: "missing", reasons: ["provider setup missing"] };
  const assessment = assessProviderContinuation(ui.providerSetup, ui.deterministicTime);
  ui.providerSetup.current = assessment.current;
  ui.providerSetup.currentnessState = assessment.state;
  ui.providerSetup.currentnessReasons = assessment.reasons;
  return assessment;
}

function createThreadLocalSeed(data, primaryThreadId) {
  return {
    route: {
      provider: "OpenAI",
      accountId: "openai-team",
      accountLabel: "Team subscription",
      connection: "Studio Workstation",
      modelId: "5.6-sol",
      model: "5.6 Sol",
      effort: "High",
      speed: "Normal",
      favorite: true,
      requested: "OpenAI · Team subscription · 5.6 Sol",
      effective: "OpenAI · Team subscription · 5.6 Sol",
      warning: null
    },
    routeBrowse: { provider: "OpenAI", accountId: "openai-team" },
    routeSearch: "",
    providerSetup: providerSetupSeed(primaryThreadId),
    conversationMode: "Agent",
    access: { requested: "Ask for approval", effective: "Ask for approval", limitation: "" },
    bsd: { mode: "Auto", state: "idle", message: "Evaluates only when risk or phase signals trigger it", scope: "current thread" },
    context: {
      ringPercent: 62,
      lensOpen: false,
      mode: "Off",
      selectedMessages: [],
      includedSources: ["Current thread", "Goal state", "Selected Plan passages"],
      omittedSources: ["Muted prior turn", "Unselected artifact body"],
      compactReceipt: null,
      memory: "2 evidence-backed Gists active · 1 fading from retrieval",
      cache: "Prompt prefix reusable · fresh 3 minutes ago"
    },
    thoughts: { keepActiveOpen: false },
    question: {
      queue: clone(data.extension.questionnaires),
      activeId: data.extension.questionnaires[0]?.id,
      phase: "open",
      answers: {},
      skips: {},
      validation: "",
      receipt: null
    },
    operational: clone(data.extension.operational_fixture),
    agentActive: true,
    activeRunToken: 0,
    communication: { state: "idle", message: "No cross-thread request active", source: primaryThreadId, target: "thread-03", requestId: null },
    branch: { state: "idle", message: "No branch operation active", sourceMessageId: null, restorePointId: "restore-2026-08-10-01" },
    attachmentResolution: { state: "none", label: "No attachment route pending", detail: "" },
    routeWarning: null,
    approval: null,
    warnings: [],
    grants: { crossProject: "Off", scope: "None", message: "Cross-project access is off by default" },
    resourceSelection: null,
    activityPhase: 1,
    workingSummary: "Auditing provider settings and Assistant Chat controls",
    workedSeconds: 86,
    motionCue: null
  };
}

function restoreThreadLocal(ui, threadId = ui.activeThreadId) {
  const local = ui.threadViews[threadId]?.local;
  if (!local) return;
  THREAD_LOCAL_KEYS.forEach((key) => { ui[key] = clone(local[key]); });
}

function syncThreadLocal(ui, threadId = ui.activeThreadId) {
  const view = ui.threadViews[threadId];
  if (!view) return;
  view.local ??= {};
  THREAD_LOCAL_KEYS.forEach((key) => { view.local[key] = clone(ui[key]); });
}

function switchActiveThread(ui, threadId) {
  if (!threadId || !ui.threadViews[threadId] || threadId === ui.activeThreadId) return false;
  syncThreadLocal(ui, ui.activeThreadId);
  ui.activeThreadId = threadId;
  restoreThreadLocal(ui, threadId);
  ui.popup = null;
  ui.focusRequest = "composer";
  return true;
}

function defaultUi(data, defaults) {
  const primaryThreadId = data.extension.primary_thread_id ?? "thread-11";
  const threadLocalSeed = createThreadLocalSeed(data, primaryThreadId);
  const ui = {
    schemaId: STATE_SCHEMA,
    revision: 0,
    selectedWindow: defaults.windowId ?? "window-01",
    selectedThreadConcept: defaults.threadId ?? "thread-01",
    activeThreadId: primaryThreadId,
    theme: defaults.theme ?? "basic-dark",
    chatWidth: 975,
    reducedMotion: defaults.reducedMotion ?? false,
    mount: "docked",
    railOpen: true,
    sidePanelOpen: true,
    historyMode: "pinned compact",
    historyFilter: "",
    artifact: {
      state: "ready",
      selectedId: "artifact-diff",
      priorSelectedId: null,
      message: "Artifact ready"
    },
    threadViews: initialThreadViews(data, threadLocalSeed),
    threadMeta: {},
    addedMessages: {},
    spawnedThreads: [],
    popup: null,
    popupReturnFocus: null,
    popupPane: "providers",
    demoControllerOpen: false,
    search: { scope: "Current Thread", query: "", selectedResult: null },
    ...clone(threadLocalSeed),
    thoughts: { keepActiveOpen: false },
    agentActive: true,
    activeRunToken: 0,
    attachmentResolution: { state: "none", label: "No attachment route pending", detail: "" },
    routeWarning: null,
    approval: null,
    network: { transport: "Live", domain: "Live", serverWork: "Server work continuing", lastCursor: 4281, snapshotCursor: 4281 },
    outbox: [],
    replayedOperationIds: [],
    grants: { crossProject: "Off", scope: "None", message: "Cross-project access is off by default" },
    notification: {
      state: "closed",
      message: "App-wide outcomes route to the title-bar inbox",
      unread: 2,
      items: [
        { id: "fixture-notification-usage", title: "Usage forecast updated", detail: "Reserve capacity remains available for final synthesis.", at: "2026-08-10T22:27:00.000Z" },
        { id: "fixture-notification-snapshot", title: "Snapshot retained", detail: "The latest reconnect snapshot passed its cursor check.", at: "2026-08-10T22:29:00.000Z" }
      ]
    },
    resourceSelection: null,
    triggerReceipts: [],
    deterministicCounter: 1,
    deterministicTime: data.extension.deterministic_clock_start,
    statusLine: "Interactive fixture ready",
    focusRequest: null
  };
  syncThreadLocal(ui);
  return ui;
}

function readPersisted() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    return parsed?.schemaId === STATE_SCHEMA ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function persistUi(ui) {
  try {
    const serializable = clone(ui);
    serializable.popup = null;
    serializable.popupReturnFocus = null;
    serializable.focusRequest = null;
    serializable.motionCue = null;
    Object.values(serializable.threadViews ?? {}).forEach((view) => { if (view.local) view.local.motionCue = null; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (_error) {
    // The prototype remains usable if storage is unavailable. The UI exposes the failure on demand.
  }
}

function nextTime(ui, seconds = 7) {
  const date = new Date(ui.deterministicTime);
  date.setUTCSeconds(date.getUTCSeconds() + seconds);
  ui.deterministicTime = date.toISOString();
  return ui.deterministicTime;
}

function recordReceipt(ui, trigger, result) {
  ui.triggerReceipts.unshift({
    id: stableId("receipt", ui.deterministicCounter++),
    trigger,
    result,
    at: nextTime(ui, 1)
  });
  ui.triggerReceipts = ui.triggerReceipts.slice(0, 30);
  ui.statusLine = result;
}

function currentView(ui) {
  return ui.threadViews[ui.activeThreadId];
}

function threadMessages(data, ui, threadId) {
  const base = data.threadMap[threadId]?.messages ?? [];
  return [...base, ...(ui.addedMessages[threadId] ?? [])];
}

function setQuestionPhase(ui, phase, message) {
  ui.question.phase = phase;
  ui.question.validation = "";
  recordReceipt(ui, `question.${phase}`, message);
}

function activeQuestionnaire(ui) {
  return ui.question.queue.find((questionnaire) => questionnaire.id === ui.question.activeId) ?? ui.question.queue[0];
}

function selectedQuestion(ui) {
  const questionnaire = activeQuestionnaire(ui);
  return questionnaire?.questions?.[questionnaire.activeIndex ?? 0] ?? null;
}

function setRouteFromModel(ui, data, providerName, accountId, modelId) {
  const provider = data.extension.route_catalog.find((item) => item.provider === providerName);
  const account = provider?.accounts.find((item) => item.id === accountId);
  const model = account?.models.find((item) => item.id === modelId);
  if (!provider || !account || !model) return;
  if (!model.available) {
    ui.route.warning = model.reason || "This model is unavailable";
    if (model.setupRequired) {
      ui.providerSetup = {
        ...providerSetupSeed(ui.activeThreadId),
        providerCliId: model.providerCliId ?? "unknown-provider-cli",
        provider: provider.provider,
        hostLabel: account.connection,
        originatingOperationRef: `chat-route-select:${ui.activeThreadId}:${provider.provider}:${model.id}`,
        continuationToken: `continuation-${ui.deterministicCounter++}`,
        operationRevision: Number(ui.providerSetup?.operationRevision ?? 0) + 1,
        expectedRevision: Number(ui.providerSetup?.operationRevision ?? 0) + 1,
        handoffOpen: true
      };
      ui.providerSetup.supplyChainPlan.operation_id = ui.providerSetup.originatingOperationRef;
      ui.providerSetup.supplyChainPlan.plan_id = `provider-cli-plan:${ui.activeThreadId}:${ui.providerSetup.operationRevision}`;
      ui.popupPane = "provider-setup";
    }
    recordReceipt(ui, "route.unavailable", ui.route.warning);
    return;
  }
  if (ui.providerSetup?.current) {
    ui.providerSetup.operationRevision = Number(ui.providerSetup.operationRevision ?? 0) + 1;
    ui.providerSetup.intentState = "superseded";
    ui.providerSetup.result = "superseded by route selection";
  }
  ui.route.provider = provider.provider;
  ui.route.accountId = account.id;
  ui.route.accountLabel = account.label;
  ui.route.connection = account.connection;
  ui.route.modelId = model.id;
  ui.route.model = model.label;
  ui.route.effort = model.efforts[0] ?? "Not supported";
  ui.route.speed = model.speeds[0] ?? "Normal";
  ui.route.requested = `${provider.provider} · ${account.label} · ${model.label}`;
  ui.route.effective = ui.route.requested;
  ui.route.warning = null;
  ui.popupPane = "tuning";
  recordReceipt(ui, "route.select", `Selected ${ui.route.requested}`);
}

function replayOutbox(ui) {
  let delivered = 0;
  ui.outbox.forEach((item) => {
    if (ui.replayedOperationIds.includes(item.operationId)) return;
    ui.replayedOperationIds.push(item.operationId);
    item.state = "delivered";
    const messages = ui.addedMessages[item.threadId] ?? [];
    const match = messages.find((message) => message.clientOperationId === item.operationId);
    if (match) match.deliveryState = "sent";
    delivered += 1;
  });
  return delivered;
}

function runNamedTrigger(ui, data, trigger) {
  const aliases = {
    "history.closed": "history.unpin",
    "history.pinned_full": "history.pin_full",
    "history.pinned_compact": "history.pin_compact",
    "question.preparing": "question.prepare",
    "question.answer": "question.select",
    "goal.block": "goal.blocked",
    "approval.request": "decision.approval_open",
    "thread.request": "thread.send_request",
    "thread.await": "thread.receive_response",
    "thread.spawn": "thread.spawn_related",
    "resource.port_collision": "system.port_collision",
    "resource.worktree_collision": "system.worktree_collision",
    "provider.setup": "provider.setup_required",
    "scenario.reset": "system.reset"
  };
  const canonical = aliases[trigger] ?? trigger;
  if (canonical === "system.reset") return "reset";

  const answerSelectedQuestion = () => {
    const question = selectedQuestion(ui);
    if (!question) return;
    const kind = String(question.kind ?? question.type ?? "single select").replaceAll("_", " ");
    ui.question.answers[question.id] = kind === "multi select"
      ? [question.options?.[0] ?? "First option"]
      : kind === "freeform"
        ? "Use the evidence-backed default and retain a reversible receipt."
        : question.options?.[0] ?? "Accepted";
    delete ui.question.skips[question.id];
    ui.question.validation = "";
  };
  const targetAgent = () => ui.operational.subagents.at(-1);
  const addWarning = (index) => {
    const warning = data.correctedScenario?.warnings?.[index];
    if (warning && !ui.warnings.includes(warning)) ui.warnings.push(warning);
    return warning;
  };
  const setActivity = (domain, summary) => {
    let index = ui.operational.activity.findIndex((item) => item.domain === domain);
    if (index < 0) {
      ui.operational.activity.push({ domain, state: "running", summary });
      index = ui.operational.activity.length - 1;
    }
    ui.operational.activity.forEach((item, itemIndex) => {
      if (itemIndex < index && item.state === "running") item.state = "complete";
    });
    ui.operational.activity[index].state = "running";
    ui.operational.activity[index].summary = summary;
    ui.activityPhase = index + 1;
    ui.workingSummary = summary;
  };
  const handlers = {
    "history.peek": () => { ui.historyMode = "peek"; },
    "history.pin_compact": () => { ui.historyMode = "pinned compact"; },
    "history.pin_full": () => {
      ui.historyMode = ui.chatWidth <= 1000 ? "pinned compact" : "pinned full";
      return ui.historyMode === "pinned full" ? "Full history pinned" : "Full history requested; compact pin retained to protect the transcript at this width";
    },
    "history.unpin": () => { ui.historyMode = "closed"; },
    "history.switch_thread": () => {
      const ids = data.threads.map((thread) => thread.id);
      const next = ids[(ids.indexOf(ui.activeThreadId) + 1) % ids.length];
      switchActiveThread(ui, next);
      return `Switched to ${data.threadMap[next]?.title ?? next}; its local state was restored`;
    },
    "question.prepare": () => { ui.question.phase = "preparing"; ui.question.validation = ""; },
    "question.open": () => { ui.question.phase = "open"; ui.question.validation = ""; },
    "question.select": answerSelectedQuestion,
    "question.next": () => {
      const questionnaire = activeQuestionnaire(ui);
      if (questionnaire && questionnaire.activeIndex < questionnaire.questions.length - 1) questionnaire.activeIndex += 1;
      ui.question.phase = "open";
      ui.question.validation = "";
    },
    "question.validation_error": () => {
      const question = selectedQuestion(ui);
      if (question) { delete ui.question.answers[question.id]; delete ui.question.skips[question.id]; }
      ui.question.phase = "open";
      ui.question.validation = "Choose an answer or explicitly skip this question before continuing.";
    },
    "question.skip": () => {
      const question = selectedQuestion(ui);
      if (question) { ui.question.skips[question.id] = true; delete ui.question.answers[question.id]; }
    },
    "question.cancel": () => { ui.question.phase = "cancelled"; ui.question.receipt = "Questionnaire cancelled; ordinary draft preserved"; },
    "question.submit": () => { ui.question.phase = "submitted"; ui.question.receipt = "Answers submitted with explicit skips and one idempotent receipt"; },
    "goal.start": () => { ui.operational.goal.state = "running"; ui.operational.goal.progress = Math.max(8, ui.operational.goal.progress); ui.operational.goal.startedAt ??= "2026-08-13T20:00:00.000Z"; },
    "goal.progress": () => { ui.operational.goal.state = "running"; ui.operational.goal.progress = Math.min(92, ui.operational.goal.progress + 17); ui.operational.goal.phase = "Implement"; },
    "goal.pause": () => { ui.operational.goal.state = "paused"; },
    "goal.resume": () => { ui.operational.goal.state = "running"; ui.operational.goal.phase = "Verify"; },
    "goal.update": () => { ui.operational.goal.state = "replanning"; ui.operational.goal.objective = "Redesign provider controls, Chat access flow, and exact setup handoff"; },
    "goal.replan": () => { ui.operational.goal.state = "replanning"; ui.operational.goal.phase = "Impact analysis"; },
    "goal.blocked": () => { ui.operational.goal.state = "blocked"; ui.operational.goal.blockedReason = "Visual acceptance evidence is missing"; ui.operational.goal.attemptedRecovery = "Rebuilt the frame and reran geometry probes"; ui.operational.goal.nextSafeAction = "Inspect the served frame directly"; },
    "goal.complete": () => { ui.operational.goal.state = "complete"; ui.operational.goal.phase = "Handoff"; ui.operational.goal.progress = 100; },
    "goal.recover": () => { ui.operational.goal.state = "running"; ui.operational.goal.blockedReason = ""; ui.operational.goal.phase = "Recovery verification"; },
    "goal.stop": () => { ui.operational.goal.state = "stopped"; },
    "todo.add": () => { ui.operational.todos.push({ id: stableId("todo", ui.deterministicCounter++), label: "Review the new provider setup return receipt", state: "pending" }); },
    "todo.complete": () => { const todo = ui.operational.todos.find((item) => item.state !== "complete"); if (todo) todo.state = "complete"; },
    "todo.reopen": () => { const todo = ui.operational.todos.find((item) => item.state === "complete"); if (todo) todo.state = "pending"; },
    "todo.block": () => { const todo = ui.operational.todos.find((item) => item.state !== "complete") ?? ui.operational.todos[0]; if (todo) todo.state = "blocked"; },
    "todo.all_states": () => { const states = ["pending", "running", "verifying", "complete", "blocked", "failed", "skipped", "cancelled", "stale", "replanned"]; ui.operational.todos.forEach((todo, index) => { todo.state = states[index % states.length]; }); },
    "subagent.spawn": () => { ui.operational.subagents.push({ id: stableId("agent", ui.deterministicCounter++), role: "Accessibility verifier", route: "5.6 Sol", state: "requested", elapsed: "Waiting", summary: "Bounded keyboard and contrast review requested" }); addWarning(2); },
    "subagent.queue": () => { if (targetAgent()) targetAgent().state = "queued"; },
    "subagent.progress": () => { if (targetAgent()) { targetAgent().state = "running"; targetAgent().elapsed = "48s"; } },
    "subagent.complete": () => { if (targetAgent()) { targetAgent().state = "complete"; targetAgent().summary = "Bounded review returned to the parent"; } },
    "subagent.fail": () => { if (targetAgent()) { targetAgent().state = "failed"; targetAgent().summary = "Route failed; parent retained authority and evidence"; } },
    "subagent.retry": () => { if (targetAgent()) { targetAgent().state = "retrying"; targetAgent().summary = "Retrying on the explicitly selected route"; } },
    "subagent.all_states": () => { const states = ["running", "waiting", "blocked", "retrying", "fallback", "complete"]; ui.operational.subagents.forEach((agent, index) => { agent.state = states[index % states.length]; }); },
    "crew.waves": () => { ui.operational.crew.state = ui.operational.crew.state === "wave 1 of 3" ? "wave 2 of 3" : "wave 1 of 3"; },
    "activity.thinking_summary": () => setActivity("Thinking summary", "Provider-exposed planning summary updated"),
    "activity.search": () => setActivity("Thread search", "Searched 6 related project threads"),
    "activity.read": () => setActivity("File read", "Read 7 plan and concept files"),
    "activity.fetch": () => setActivity("Fetch", "Fetched bounded provider-owner references"),
    "activity.browser": () => setActivity("BrowserWorkspace", "Checked pinning and question flow at 4 widths"),
    "activity.test": () => setActivity("Tests", "Running interaction and reduced-motion checks"),
    "activity.edit": () => setActivity("Edits", "Made 1 create and 3 edits"),
    "activity.generate": () => setActivity("Generated output", "Generated the implementation-impact handoff"),
    "activity.advance": () => { ui.activityPhase = (ui.activityPhase % ui.operational.activity.length) + 1; },
    "diff.create": () => { ui.operational.diff.state = "created"; ui.operational.diff.open = false; },
    "diff.update": () => { ui.operational.diff.state = "updated"; ui.operational.diff.additions += 7; },
    "diff.open": () => { ui.operational.diff.open = true; ui.artifact.selectedId = "artifact-diff"; ui.artifact.state = "ready"; ui.artifact.message = "Assistant Chat change set open in the left workspace"; },
    "artifact.loading": () => { ui.artifact.state = "loading"; ui.artifact.message = "Loading selected artifact"; },
    "artifact.ready": () => { ui.artifact.state = "ready"; ui.artifact.message = "Artifact ready"; },
    "artifact.switch": () => { const ids = data.extension.artifacts.slice(0, 4).map((item) => item.id); ui.artifact.selectedId = ids[(ids.indexOf(ui.artifact.selectedId) + 1) % ids.length]; ui.artifact.state = "ready"; },
    "artifact.error": () => { ui.artifact.state = "error"; ui.artifact.message = "Artifact could not be loaded. Retry keeps the current selection."; },
    "artifact.close": () => { ui.artifact.state = "closed"; ui.artifact.message = "Artifact workspace closed; selection retained"; },
    "artifact.updated": () => { ui.artifact.state = "updated"; ui.artifact.message = "A newer artifact version is available"; },
    "artifact.retry": () => { ui.artifact.state = "loading"; ui.artifact.message = "Retrying artifact load"; },
    "decision.approval_open": () => { ui.approval = { state: "pending", title: "Approve protected write", summary: "One repository file would change", evidenceOpen: false }; },
    "decision.details": () => { if (!ui.approval) handlers["decision.approval_open"](); ui.approval.evidenceOpen = true; },
    "decision.approve": () => { if (!ui.approval) handlers["decision.approval_open"](); ui.approval.state = "approved"; },
    "decision.deny": () => { if (!ui.approval) handlers["decision.approval_open"](); ui.approval.state = "declined"; },
    "decision.branch": () => { ui.routeWarning = { state: "branched", title: "Route changes privacy and cache reuse", detail: "A sibling branch uses the alternate provider without mutating the source conversation." }; ui.branch.state = "branched"; ui.branch.message = "Sibling branch created for the material route change"; },
    "route.warning": () => { const warning = addWarning(0); ui.routeWarning = { state: "pending", title: "Route changes privacy and cache reuse", detail: warning ?? "The alternate account uses another provider boundary and cannot reuse the current prompt cache." }; },
    "thread.send_request": () => { ui.communication = { state: "requested", message: "Bounded request sent to Planning Wizard handoff", source: ui.activeThreadId, target: "thread-03", requestId: `thread-request-${ui.deterministicCounter++}` }; },
    "thread.receive_response": () => { ui.communication.state = "received"; ui.communication.message = "Target returned a bounded response without copying its transcript"; },
    "thread.spawn_related": () => {
      const id = stableId("related-thread", ui.deterministicCounter++);
      ui.spawnedThreads.push({ id, title: "Provider setup follow-up", project: "Puppet Master", pinned: false, archived: false, threadState: "ready", updatedAt: nextTime(ui, 1), messages: [] });
      ui.threadMeta[id] = { title: "Provider setup follow-up", threadState: "ready" };
      ui.threadViews[id] = clone(currentView(ui));
      ui.threadViews[id].draft = "";
      ui.threadViews[id].draftHistory = [];
      ui.addedMessages[id] = [];
      ui.communication.state = "spawned";
      ui.communication.message = "Related thread spawned with bounded selected references";
    },
    "thread.branch": () => { ui.branch.state = "branched"; ui.branch.message = "Sibling branch created; source thread and workspace files are unchanged"; },
    "thread.rewind": () => { ui.branch.state = "rewound"; ui.branch.message = "Conversation view rewound to the selected message; files were not rolled back"; },
    "thread.restore": () => { ui.branch.state = "restored"; ui.branch.message = "Immutable restore point applied to a sibling branch"; },
    "turn.redirect": () => { ui.branch.state = "redirected"; ui.branch.message = "Active turn redirected; original attempt and partial output retained"; },
    "system.port_collision": () => { ui.resourceSelection = "Port 4173 collision · safely route this fixture to 4174"; },
    "system.worktree_collision": () => { ui.resourceSelection = "Worktree lease conflict · request an isolated worktree"; },
    "resource.test_debug_state": () => { ui.resourceSelection = "Tests running · debug paused · retained logs available"; },
    "attachment.native": () => { ui.attachmentResolution = { state: "native", label: "Native", detail: "The selected model can read this text file directly." }; },
    "attachment.transformed": () => { ui.attachmentResolution = { state: "transformed", label: "PM transformed", detail: "Audio is converted to a bounded transcript artifact with lineage." }; },
    "attachment.alternate": () => { const warning = addWarning(1); ui.attachmentResolution = { state: "alternate", label: "Alternate model", detail: warning ?? "Consent is required because provider, privacy, and allowance change." }; },
    "attachment.unsupported": () => { ui.attachmentResolution = { state: "unsupported", label: "Unsupported", detail: "No truthful route is available for this attachment." }; },
    "context.lens": () => { ui.context.lensOpen = true; ui.context.mode = "Focus"; },
    "context.compact_now": () => { ui.context.ringPercent = 38; ui.context.compactReceipt = "Compacted 24 messages; canonical history and branch ancestry preserved"; },
    "cross_project.grant": () => { ui.grants = { crossProject: "Read only", scope: "Once", message: "One bounded read grant; it will not persist" }; },
    "bsd.off": () => { ui.bsd = { mode: "Off", state: "off", message: "Back Seat Driver disabled", scope: "current thread" }; },
    "bsd.auto_idle": () => { ui.bsd = { mode: "Auto", state: "idle", message: "No risk signal; no evaluation ran; initial provider acquisition remains prohibited", scope: "current thread" }; },
    "bsd.auto_active": () => { ui.bsd = { mode: "Auto", state: "evaluating", message: "Evaluating a bounded route delta; it cannot approve initial provider acquisition", scope: "current thread" }; },
    "bsd.on": () => { ui.bsd = { mode: "On", state: "on", message: "Manual review requested for every turn; it cannot silently install a provider CLI", scope: "current thread" }; },
    "bsd.silent": () => { ui.bsd.state = "silent result"; ui.bsd.message = "Evaluation completed with no advice"; },
    "bsd.advice": () => { ui.bsd.state = "advice"; ui.bsd.message = "Keep the artifact outside model context until explicitly admitted"; },
    "bsd.timeout": () => { ui.bsd.state = "timeout"; ui.bsd.message = "BSD timed out; primary turn continued"; },
    "bsd.unavailable": () => { ui.bsd.state = "unavailable"; ui.bsd.message = "BSD route unavailable; primary authority unchanged"; },
    "provider.setup_required": () => { ui.providerSetup = { ...providerSetupSeed(ui.activeThreadId), handoffOpen: true }; ui.route.warning = ui.providerSetup.message; ui.popup = "route"; ui.popupPane = "provider-setup"; },
    "provider.existing_found": () => { ui.providerSetup.setupState = "selection required"; ui.providerSetup.installState = "existing installation found"; ui.providerSetup.discoveredInstallationRef = "discovered-installation-01"; ui.providerSetup.version = "2.8.4"; ui.providerSetup.architecture = "x86_64"; ui.providerSetup.supplyChainPlan.plan_status = "existing_installation_discovered"; ui.providerSetup.message = "Existing installation found; explicit selection and validation are required before authentication."; },
    "provider.use_existing": () => {
      if (!ui.providerSetup.discoveredInstallationRef) { ui.providerSetup.message = "No inspected existing installation is available to select."; return ui.providerSetup.message; }
      ui.providerSetup.installState = "selected existing"; ui.providerSetup.setupState = "authentication required"; ui.providerSetup.provenance = "Existing installation explicitly selected after discovery and validation"; ui.providerSetup.supplyChainProof = providerSupplyChainProof(ui.providerSetup, ui.deterministicTime, { proof_status: "existing_installation_selected_and_validated", installation_id: ui.providerSetup.discoveredInstallationRef, installation_generation: "installation-generation-existing-1", download_receipt_ref: "fixture://provider-proof/google-antigravity-cli/existing-installation-origin-receipt-001", verification_receipt_ref: "fixture://provider-proof/google-antigravity-cli/existing-installation-validation" }); ui.providerSetup.authState = "required"; ui.providerSetup.readinessState = "blocked on authentication"; ui.providerSetup.message = "Existing installation selected and its adoption proof recorded. Authentication remains a separate action.";
    },
    "provider.install_intent": () => { ui.providerSetup.setupState = "awaiting explicit consent"; ui.providerSetup.installState = "consent required"; ui.providerSetup.supplyChainPlan.plan_status = "awaiting_explicit_consent"; ui.providerSetup.supplyChainProof = null; ui.providerSetup.message = "Review official source and exact Host / Environment before approving installation. No supply-chain proof exists before acquisition begins."; },
    "provider.install_approved": () => { ui.providerSetup.acquisitionConsentReceipt = `consent-${ui.deterministicCounter++}`; ui.providerSetup.setupState = "installation in progress"; ui.providerSetup.installState = "installing"; ui.providerSetup.provenance = "Google-documented stable package route selected by the user"; ui.providerSetup.supplyChainPlan.plan_status = "explicitly_approved"; ui.providerSetup.supplyChainProof = providerSupplyChainProof(ui.providerSetup, ui.deterministicTime); ui.providerSetup.message = "Explicit install approved for Build Host East / Native environment; exact staged-download proof recorded."; },
    "provider.install_verified": () => {
      if (!ui.providerSetup.acquisitionConsentReceipt) { ui.providerSetup.installState = "blocked without consent"; ui.providerSetup.message = "Installation did not start because initial acquisition has no explicit consent receipt."; return ui.providerSetup.message; }
      if (!ui.providerSetup.supplyChainProof) { ui.providerSetup.installState = "blocked without supply-chain proof"; ui.providerSetup.message = "Installation verification failed closed because the staged acquisition has no supply-chain proof."; return ui.providerSetup.message; }
      ui.providerSetup.installState = "verified"; ui.providerSetup.setupState = "authentication required"; ui.providerSetup.provenance = "Official source, signature or attestation, trust root, adapter, architecture, license, compatibility, and known-bad checks verified"; ui.providerSetup.version = "2.8.4"; ui.providerSetup.architecture = "x86_64"; ui.providerSetup.supplyChainProof.proof_status = "verified_fixture_receipt"; ui.providerSetup.supplyChainProof.installation_generation = "installation-generation-1"; ui.providerSetup.supplyChainProof.verification_receipt_ref = "fixture://provider-proof/google-antigravity-cli/verification-receipt-001"; ui.providerSetup.supplyChainProof.observed_at = ui.deterministicTime; ui.providerSetup.authState = "required"; ui.providerSetup.readinessState = "blocked on authentication"; ui.providerSetup.message = "Installation and exact supply-chain proof verified. Authentication remains a separate user action.";
    },
    "provider.install_failed": () => { ui.providerSetup.setupState = "installation failed"; ui.providerSetup.installState = "failed"; if (ui.providerSetup.supplyChainProof) ui.providerSetup.supplyChainProof.proof_status = "install_failed_fixture_receipt"; ui.providerSetup.authState = "not started"; ui.providerSetup.readinessState = "blocked on installation"; ui.providerSetup.message = "Installation failed before activation; no authentication was attempted and the originating operation remains preserved."; },
    "provider.auth_required": () => {
      if (ui.providerSetup.installState !== "verified" && ui.providerSetup.installState !== "selected existing") { ui.providerSetup.setupState = "installation required"; ui.providerSetup.authState = "blocked until installation"; ui.providerSetup.readinessState = "blocked on installation"; ui.providerSetup.message = "Authentication stayed blocked because no verified installation or explicitly selected existing installation is available."; return ui.providerSetup.message; }
      ui.providerSetup.setupState = "authentication required"; ui.providerSetup.authState = "required"; ui.providerSetup.readinessState = "blocked on authentication"; ui.providerSetup.message = "Authentication is required in a separate protected browser session.";
    },
    "provider.authenticated": () => {
      if (ui.providerSetup.installState !== "verified" && ui.providerSetup.installState !== "selected existing") { ui.providerSetup.authState = "blocked until installation"; return "Authentication stayed blocked because no verified installation is selected"; }
      ui.providerSetup.setupState = "readiness verification required"; ui.providerSetup.authState = "authenticated"; ui.providerSetup.accountRef = "account-profile-google-01"; ui.providerSetup.readinessState = "verification required"; ui.providerSetup.message = "Authentication receipt recorded without exposing browser-session content or secrets. Provider and model readiness remain separate.";
    },
    "provider.readiness_verified": () => {
      if (ui.providerSetup.authState !== "authenticated") { ui.providerSetup.readinessState = "blocked on authentication"; return "Readiness stayed blocked until separate authentication completes"; }
      ui.providerSetup.setupState = "ready"; ui.providerSetup.readinessState = "model ready"; ui.providerSetup.modelCatalogRevision = "catalog-r17"; ui.providerSetup.message = "Provider, account, adapter, and model readiness verified.";
    },
    "provider.continuation_resumed": () => {
      const assessment = refreshProviderContinuationProjection(ui);
      if (!assessment.current || ui.providerSetup.readinessState !== "model ready") { ui.providerSetup.result = "not resumed"; ui.providerSetup.message = `Originating operation was not resumed: ${assessment.reasons.join(", ") || "provider readiness is incomplete"}.`; return ui.providerSetup.message; }
      ui.providerSetup.result = "resumed once"; ui.providerSetup.resumeCount += 1; ui.providerSetup.intentState = "complete"; ui.providerSetup.consumedAt = ui.deterministicTime; ui.providerSetup.message = "Current continuation resumed the originating route selection exactly once."; refreshProviderContinuationProjection(ui);
    },
    "provider.continuation_stale_rejected": () => { ui.providerSetup.operationRevision += 1; const assessment = refreshProviderContinuationProjection(ui); ui.providerSetup.result = "stale rejected"; ui.providerSetup.message = `Superseded continuation rejected: ${assessment.reasons.join(", ")}. No route or operation changed.`; },
    "provider.continuation_expired_rejected": () => { ui.deterministicTime = "2026-08-15T00:00:01.000Z"; const assessment = refreshProviderContinuationProjection(ui); ui.providerSetup.result = "expired rejected"; ui.providerSetup.message = `Expired continuation rejected: ${assessment.reasons.join(", ")}. No route or operation changed.`; },
    "provider.continuation_topology_mismatch_rejected": () => { ui.providerSetup.topologyGeneration = "topology-generation-18"; const assessment = refreshProviderContinuationProjection(ui); ui.providerSetup.result = "topology mismatch rejected"; ui.providerSetup.message = `Topology-mismatched continuation rejected: ${assessment.reasons.join(", ")}. No route or operation changed.`; },
    "provider.update": () => { ui.route.warning = "Official CLI update ready · explicit post-consent maintenance action required"; },
    "provider.rollback": () => { ui.route.warning = "Verified rollback available from the shared provider lifecycle owner"; },
    "network.offline": () => { ui.network.transport = "Offline"; ui.network.domain = "Cached"; },
    "network.domain_failure": () => { ui.network.transport = "Live"; ui.network.domain = "Error"; ui.network.serverWork = "Server work continuing; domain catch-up can retry independently"; },
    "network.reconnect": () => { ui.network.transport = "Synchronizing"; ui.network.domain = "Replay pending"; },
    "network.replay": () => { const delivered = replayOutbox(ui); ui.network.transport = "Live"; ui.network.domain = "Snapshot catch-up"; return `${delivered} queued command${delivered === 1 ? "" : "s"} replayed exactly once`; },
    "network.snapshot": () => { ui.network.transport = "Live"; ui.network.domain = "Live"; ui.network.snapshotCursor = Math.max(ui.network.snapshotCursor, ui.network.lastCursor + 17); },
    "notification.inline_outcome": () => {
      const item = { id: "fixture-notification-task-outcome", title: "Task outcome", detail: "Provider setup evidence is ready for review; app-wide copy retained at the canonical title-bar boundary.", at: ui.deterministicTime };
      const items = [item, ...(ui.notification.items ?? []).filter((existing) => existing.id !== item.id)];
      ui.notification = { ...ui.notification, state: "open", message: "Task outcome shown inline; app-wide copy opened in the title-bar inbox", unread: 0, items };
      return "Task outcome rendered in the title-bar inbox";
    }
  };
  if (handlers[canonical]) {
    const result = handlers[canonical]();
    recordReceipt(ui, trigger, typeof result === "string" ? result : `Trigger completed: ${trigger.replaceAll("_", " ")}`);
  } else {
    recordReceipt(ui, trigger, `Trigger is truthfully unavailable in this fixture: ${trigger}`);
  }
  return "handled";
}

function reduce(current, action, data, defaults) {
  const ui = clone(current);
  ui.revision += 1;
  ui.focusRequest = null;
  ui.motionCue = null;
  switch (action.type) {
    case "select-window":
      ui.selectedWindow = action.value;
      recordReceipt(ui, "workspace.window", `Mounted ${action.value}`);
      break;
    case "select-thread-concept":
      ui.selectedThreadConcept = action.value;
      recordReceipt(ui, "workspace.thread", `Mounted ${action.value}`);
      break;
    case "select-theme":
      ui.theme = action.value;
      break;
    case "set-width":
      ui.chatWidth = clamp(action.value, 520, 1200);
      if (ui.chatWidth <= 1000 && ui.historyMode === "pinned full") ui.historyMode = "pinned compact";
      break;
    case "toggle-reduced-motion":
      ui.reducedMotion = action.value ?? !ui.reducedMotion;
      recordReceipt(ui, "workspace.reduced_motion", ui.reducedMotion ? "Reduced motion enabled" : "Full motion enabled");
      break;
    case "set-mount":
      ui.mount = action.value;
      recordReceipt(ui, "workspace.mount", `Remounted as ${action.value}; semantic state retained`);
      break;
    case "toggle-rail":
      ui.railOpen = action.value ?? !ui.railOpen;
      break;
    case "toggle-side-panel":
      ui.sidePanelOpen = action.value ?? !ui.sidePanelOpen;
      break;
    case "history-set":
      ui.historyMode = action.value === "pinned full" && ui.chatWidth <= 1000 ? "pinned compact" : action.value;
      recordReceipt(ui, "history.geometry", action.value === "pinned full" && ui.historyMode !== action.value
        ? "Full history requested; compact pin retained to protect the transcript at this width"
        : `History is ${action.value}`);
      break;
    case "history-filter":
      ui.historyFilter = action.value;
      break;
    case "artifact-state":
      if (ARTIFACT_STATES.includes(action.value)) ui.artifact.state = action.value;
      ui.artifact.message = action.message ?? `Artifact state: ${action.value}`;
      break;
    case "artifact-select":
      ui.artifact.priorSelectedId = ui.artifact.selectedId;
      ui.artifact.selectedId = action.value;
      ui.artifact.state = "loading";
      ui.artifact.message = "Loading selected artifact";
      recordReceipt(ui, "artifact.switch", `Opening ${action.value} in the left workspace`);
      break;
    case "artifact-ready":
      ui.artifact.state = "ready";
      ui.artifact.message = "Artifact ready";
      break;
    case "select-thread":
      if (switchActiveThread(ui, action.value)) recordReceipt(ui, "thread.select", `Restored ${action.value} with its local draft and view state`);
      break;
    case "set-draft": {
      const view = currentView(ui);
      view.draft = action.value;
      break;
    }
    case "save-draft-revision": {
      const view = currentView(ui);
      const text = view.draft.trim();
      if (text && view.draftHistory.at(-1)?.text !== text) {
        view.draftHistory.push({ id: stableId("draft", ui.deterministicCounter++), text, savedAt: nextTime(ui, 2) });
        view.draftHistory = view.draftHistory.slice(-8);
        recordReceipt(ui, "draft.revision", "Draft revision saved locally");
      }
      break;
    }
    case "restore-draft": {
      const view = currentView(ui);
      const revision = view.draftHistory.find((item) => item.id === action.value);
      if (revision) {
        view.draft = revision.text;
        ui.focusRequest = "composer";
        recordReceipt(ui, "draft.restore", "Earlier draft revision restored");
      }
      break;
    }
    case "clear-draft":
      currentView(ui).draft = "";
      recordReceipt(ui, "draft.clear", "Current draft cleared; revision history retained");
      break;
    case "edit-from-message": {
      const message = threadMessages(data, ui, ui.activeThreadId).find((item) => item.id === action.value);
      if (message?.role === "user" && message.eligibleForEdit) {
        currentView(ui).draft = message.body;
        ui.focusRequest = "composer";
        recordReceipt(ui, "chat.edit", "Eligible user message copied into the composer as a new editable draft");
      }
      break;
    }
    case "set-status":
      recordReceipt(ui, action.trigger ?? "ui.feedback", action.value);
      break;
    case "toggle-long-message":
      currentView(ui).longExpanded[action.value] = !currentView(ui).longExpanded[action.value];
      break;
    case "toggle-work-group":
      currentView(ui).workExpanded[action.value] = !currentView(ui).workExpanded[action.value];
      ui.motionCue = { domain: "work", state: currentView(ui).workExpanded[action.value] ? "reopen" : "condense", targetId: action.value, nonce: ui.revision };
      break;
    case "thought-setting":
      ui.thoughts.keepActiveOpen = action.value ?? !ui.thoughts.keepActiveOpen;
      recordReceipt(ui, "thought.disclosure", ui.thoughts.keepActiveOpen ? "Active provider-exposed summaries stay open" : "Thought summaries remain collapsed until requested");
      break;
    case "open-popup": {
      const initialFocus = {
        search: "search-input",
        route: "route-search",
        context: "context-close",
        access: "access-close",
        bsd: "bsd-close",
        "draft-history": "draft-close",
        "thread-more": "thread-more-close"
      };
      const returnFocus = {
        search: "search-trigger",
        route: "route-trigger",
        context: "context-trigger",
        access: "access-trigger",
        bsd: "bsd-trigger",
        "draft-history": "composer",
        "thread-more": "thread-more-trigger"
      };
      if (ui.popup === action.value) {
        ui.popup = null;
        ui.focusRequest = ui.popupReturnFocus ?? returnFocus[action.value] ?? null;
        ui.popupReturnFocus = null;
      } else {
        ui.popup = action.value;
        ui.popupPane = action.pane ?? "root";
        ui.popupReturnFocus = returnFocus[action.value] ?? null;
        ui.focusRequest = initialFocus[action.value] ?? null;
      }
      break;
    }
    case "set-popup-pane":
      ui.popupPane = action.value;
      break;
    case "close-popup":
      ui.popup = null;
      ui.focusRequest = action.returnFocus ?? ui.popupReturnFocus ?? null;
      ui.popupReturnFocus = null;
      break;
    case "toggle-controller":
      ui.demoControllerOpen = !ui.demoControllerOpen;
      break;
    case "search-query":
      ui.search.query = action.value;
      break;
    case "search-scope":
      ui.search.scope = action.value;
      break;
    case "search-select":
      if (action.threadId) switchActiveThread(ui, action.threadId);
      ui.search.selectedResult = action.messageId;
      currentView(ui).longExpanded[action.messageId] = true;
      ui.popup = null;
      ui.focusRequest = `message-${action.messageId}`;
      recordReceipt(ui, "search.jump", "Loaded the exact stored range and revealed the match");
      break;
    case "route-search":
      ui.routeSearch = action.value;
      break;
    case "route-model":
      setRouteFromModel(ui, data, action.provider, action.accountId, action.modelId);
      break;
    case "route-provider": {
      const provider = data.extension.route_catalog.find((item) => item.provider === action.value);
      if (provider) {
        ui.routeBrowse.provider = provider.provider;
        ui.routeBrowse.accountId = provider.accounts[0]?.id ?? "";
      }
      break;
    }
    case "route-account":
      ui.routeBrowse.provider = action.provider;
      ui.routeBrowse.accountId = action.accountId;
      break;
    case "route-effort":
      ui.route.effort = action.value;
      recordReceipt(ui, "route.effort", `Effort set to ${action.value}; picker remains open`);
      break;
    case "route-speed":
      ui.route.speed = action.value;
      recordReceipt(ui, "route.speed", `Speed set to ${action.value}; picker remains open`);
      break;
    case "route-favorite":
      ui.route.favorite = !ui.route.favorite;
      break;
    case "set-mode":
      ui.conversationMode = action.value;
      if (action.value === "Review" && ui.access.requested === "Full Access") {
        ui.access.effective = "Ask for approval";
        ui.access.limitation = "Limited by Review mode";
      } else {
        ui.access.effective = ui.access.requested;
        ui.access.limitation = "";
      }
      break;
    case "set-access":
      ui.access.requested = action.value;
      ui.access.effective = ui.conversationMode === "Review" && action.value === "Full Access" ? "Ask for approval" : action.value;
      ui.access.limitation = ui.access.effective !== action.value ? "Limited by Review mode" : "";
      recordReceipt(ui, "access.set", ui.access.limitation ? `${action.value} requested · ${ui.access.limitation}` : `${action.value} active`);
      break;
    case "set-bsd":
      if (BSD_OPTIONS.includes(action.value)) {
        ui.bsd.mode = action.value;
        ui.bsd.state = action.value === "Off" ? "off" : action.value === "Auto" ? "idle" : "on";
        ui.bsd.message = action.value === "Auto" ? "Evaluates only when risk or phase signals trigger it" : action.value === "On" ? "Manual review requested for every turn" : "Back Seat Driver disabled";
        recordReceipt(ui, "bsd.set", `BSD ${action.value}`);
      }
      break;
    case "context-mode":
      ui.context.mode = action.value;
      ui.context.lensOpen = action.value !== "Off";
      recordReceipt(ui, "context.lens", `${action.value} applied to selected messages`);
      break;
    case "context-toggle-message": {
      const selected = new Set(ui.context.selectedMessages);
      selected.has(action.value) ? selected.delete(action.value) : selected.add(action.value);
      ui.context.selectedMessages = [...selected].slice(0, 25);
      break;
    }
    case "context-apply-subcompact":
      ui.context.mode = "Subcompact";
      ui.context.compactReceipt = `Subcompacted ${ui.context.selectedMessages.length || 1} selected message region${ui.context.selectedMessages.length === 1 ? "" : "s"}; rehydration handles retained`;
      recordReceipt(ui, "context.subcompact", ui.context.compactReceipt);
      break;
    case "context-compact-now":
      ui.context.ringPercent = Math.max(24, ui.context.ringPercent - 21);
      ui.context.compactReceipt = "Compact Now completed; canonical history and ancestry preserved";
      ui.motionCue = { domain: "work", state: "condense", nonce: ui.revision };
      recordReceipt(ui, "context.compact_now", ui.context.compactReceipt);
      break;
    case "question-phase":
      setQuestionPhase(ui, action.value, action.message ?? `Questionnaire ${action.value}`);
      ui.motionCue = { domain: "question", state: action.value === "preparing" ? "prepare" : "open", nonce: ui.revision };
      break;
    case "question-answer": {
      const question = selectedQuestion(ui);
      if (question) {
        ui.question.answers[question.id] = action.value;
        delete ui.question.skips[question.id];
        ui.question.validation = "";
        ui.motionCue = { domain: "question", state: "select", targetId: question.id, nonce: ui.revision };
      }
      break;
    }
    case "question-toggle-answer": {
      const question = selectedQuestion(ui);
      if (question) {
        const selected = new Set(ui.question.answers[question.id] ?? []);
        selected.has(action.value) ? selected.delete(action.value) : selected.add(action.value);
        ui.question.answers[question.id] = [...selected];
        delete ui.question.skips[question.id];
        ui.motionCue = { domain: "question", state: "select", targetId: question.id, nonce: ui.revision };
      }
      break;
    }
    case "question-next": {
      const questionnaire = activeQuestionnaire(ui);
      const question = selectedQuestion(ui);
      const answer = question ? ui.question.answers[question.id] : null;
      if (question?.required && !ui.question.skips[question.id] && (answer == null || answer === "" || (Array.isArray(answer) && !answer.length))) {
        ui.question.validation = "Choose an answer or explicitly skip this question before continuing.";
      } else if (questionnaire && questionnaire.activeIndex < questionnaire.questions.length - 1) {
        questionnaire.activeIndex += 1;
        ui.question.validation = "";
        ui.focusRequest = "question-prompt";
        ui.motionCue = { domain: "question", state: "page", targetId: questionnaire.questions[questionnaire.activeIndex]?.id, nonce: ui.revision };
      }
      break;
    }
    case "question-back": {
      const questionnaire = activeQuestionnaire(ui);
      if (questionnaire && questionnaire.activeIndex > 0) questionnaire.activeIndex -= 1;
      ui.question.validation = "";
      ui.focusRequest = "question-prompt";
      ui.motionCue = { domain: "question", state: "page", nonce: ui.revision };
      break;
    }
    case "question-skip": {
      const question = selectedQuestion(ui);
      if (question) {
        ui.question.skips[question.id] = !ui.question.skips[question.id];
        if (ui.question.skips[question.id]) delete ui.question.answers[question.id];
        ui.motionCue = { domain: "question", state: "select", targetId: question.id, nonce: ui.revision };
      }
      break;
    }
    case "question-cancel":
      ui.question.phase = "cancelled";
      ui.question.receipt = "Questionnaire cancelled; existing answers retained in the historical record";
      ui.focusRequest = "composer";
      ui.motionCue = { domain: "question", state: "receipt", nonce: ui.revision };
      recordReceipt(ui, "question.cancel", ui.question.receipt);
      break;
    case "question-submit": {
      const questionnaire = activeQuestionnaire(ui);
      const missing = questionnaire?.questions.filter((question) => question.required && !ui.question.skips[question.id] && (ui.question.answers[question.id] == null || ui.question.answers[question.id] === "" || (Array.isArray(ui.question.answers[question.id]) && !ui.question.answers[question.id].length))) ?? [];
      if (missing.length) {
        ui.question.validation = `${missing.length} required answer${missing.length === 1 ? " is" : "s are"} still missing.`;
      } else {
        ui.question.phase = "submitting";
        ui.question.receipt = "Answers and explicit skips are ready to submit";
        ui.motionCue = { domain: "question", state: "submit", nonce: ui.revision };
        recordReceipt(ui, "question.submit", "Questionnaire submission started");
      }
      break;
    }
    case "question-submitted":
      {
      const completedQuestionnaire = activeQuestionnaire(ui);
      if (completedQuestionnaire) completedQuestionnaire.state = "submitted";
      ui.question.phase = "submitted";
      ui.question.receipt = `Submitted ${Object.keys(ui.question.answers).length} answers and ${Object.values(ui.question.skips).filter(Boolean).length} explicit skips`;
      const completedIndex = ui.question.queue.findIndex((item) => item.id === ui.question.activeId);
      const queued = ui.question.queue.find((item, index) => index > completedIndex && item.state !== "submitted");
      if (queued) { ui.question.activeId = queued.id; queued.activeIndex = 0; queued.state = "queued"; }
      ui.focusRequest = "composer";
      ui.motionCue = { domain: "question", state: "receipt", nonce: ui.revision };
      recordReceipt(ui, "question.receipt", ui.question.receipt);
      break;
      }
    case "question-next-queue": {
      const index = ui.question.queue.findIndex((item) => item.id === ui.question.activeId);
      const next = ui.question.queue[index + 1] ?? ui.question.queue[0];
      if (next) {
        ui.question.activeId = next.id;
        next.activeIndex = 0;
        ui.question.phase = "open";
        ui.question.validation = "";
        ui.motionCue = { domain: "question", state: "open", targetId: next.id, nonce: ui.revision };
        recordReceipt(ui, "question.queue", `Opened ${next.title}`);
      }
      break;
    }
    case "goal-action": {
      const goal = ui.operational.goal;
      const value = action.value;
      if (value === "pause") goal.state = "paused";
      if (value === "resume" || value === "start") goal.state = "running";
      if (value === "stop") goal.state = "stopped";
      if (value === "complete") { goal.state = "complete"; goal.progress = 100; }
      if (value === "block") { goal.state = "blocked"; goal.blockedReason = "A required owner decision is missing"; goal.attemptedRecovery = "Checked the current owner registry and candidate aliases"; goal.nextSafeAction = "Request the named owner decision"; }
      if (value === "recover") { goal.state = "running"; goal.blockedReason = ""; goal.phase = "Recovery verification"; }
      if (value === "replan") { goal.state = "replanning"; goal.phase = "Impact analysis"; goal.progress = Math.max(goal.progress, 44); }
      if (value === "edit") goal.editing = true;
      if (value === "clear") goal.cleared = true;
      if (value === "view") goal.detailsOpen = !goal.detailsOpen;
      ui.motionCue = { domain: "work", state: ["view", "edit"].includes(value) ? "reopen" : value === "clear" ? "condense" : "progress", targetId: "goal", nonce: ui.revision };
      recordReceipt(ui, `goal.${value}`, `Goal is ${goal.cleared ? "cleared from view" : goal.state}`);
      break;
    }
    case "goal-objective":
      ui.operational.goal.objective = action.value;
      break;
    case "goal-save-edit":
      ui.operational.goal.editing = false;
      ui.operational.goal.state = "replanning";
      ui.operational.goal.phase = "Impact analysis for edited objective";
      ui.motionCue = { domain: "work", state: "progress", targetId: "goal", nonce: ui.revision };
      recordReceipt(ui, "goal.update", "Goal edit saved and visible replan started");
      break;
    case "todo-add":
      runNamedTrigger(ui, data, "todo.add");
      ui.motionCue = { domain: "work", state: "reopen", targetId: "todos", nonce: ui.revision };
      break;
    case "todo-cycle": {
      const states = ["pending", "running", "verifying", "complete", "blocked", "failed", "skipped", "cancelled", "stale", "replanned"];
      const todo = ui.operational.todos.find((item) => item.id === action.value);
      if (todo) todo.state = states[(states.indexOf(todo.state) + 1) % states.length];
      ui.motionCue = { domain: "work", state: "progress", targetId: action.value, nonce: ui.revision };
      break;
    }
    case "subagent-spawn":
      runNamedTrigger(ui, data, "subagent.spawn");
      ui.motionCue = { domain: "work", state: "reopen", targetId: "subagents", nonce: ui.revision };
      break;
    case "subagent-cycle": {
      const states = ["requested", "admitted", "queued", "running", "waiting", "blocked", "retrying", "fallback", "stopped", "complete"];
      const agent = ui.operational.subagents.find((item) => item.id === action.value);
      if (agent) agent.state = states[(states.indexOf(agent.state) + 1) % states.length];
      ui.motionCue = { domain: "work", state: "progress", targetId: action.value, nonce: ui.revision };
      break;
    }
    case "crew-advance":
      ui.operational.crew.state = ui.operational.crew.state === "wave 1 of 3" ? "wave 2 of 3" : ui.operational.crew.state === "wave 2 of 3" ? "wave 3 of 3" : "complete";
      break;
    case "activity-advance":
      ui.activityPhase = (ui.activityPhase % ui.operational.activity.length) + 1;
      ui.motionCue = { domain: "work", state: "progress", targetId: `activity-${ui.activityPhase - 1}`, nonce: ui.revision };
      recordReceipt(ui, "activity.advance", `Activity phase ${ui.activityPhase} active`);
      break;
    case "diff-update":
      ui.operational.diff.state = "updated";
      ui.operational.diff.additions += 3;
      ui.operational.diff.deletions += 1;
      ui.motionCue = { domain: "work", state: "progress", targetId: "diff", nonce: ui.revision };
      break;
    case "diff-open":
      runNamedTrigger(ui, data, "diff.open");
      ui.motionCue = { domain: "work", state: "reopen", targetId: "diff", nonce: ui.revision };
      break;
    case "approval-open":
      ui.approval = { state: "pending", title: "Approve protected write", summary: "One file outside the current lease would change", evidenceOpen: false };
      break;
    case "approval-details":
      if (ui.approval) ui.approval.evidenceOpen = !ui.approval.evidenceOpen;
      break;
    case "approval-decision":
      if (ui.approval) ui.approval.state = action.value;
      recordReceipt(ui, "approval.decision", `Approval ${action.value}`);
      break;
    case "route-warning-open":
      ui.routeWarning = { state: "pending", title: "Route changes privacy and cache reuse", detail: "The alternate provider cannot reuse the current prompt cache and receives the selected attachment." };
      break;
    case "route-warning-decision":
      if (ui.routeWarning) ui.routeWarning.state = action.value;
      if (action.value === "branch") ui.branch = { state: "branched", message: "New branch created with the requested route", sourceMessageId: null, restorePointId: null };
      recordReceipt(ui, "route.warning", `Route warning decision: ${action.value}`);
      break;
    case "attachment-resolve":
      ui.attachmentResolution = { state: action.value, label: action.label, detail: action.detail };
      recordReceipt(ui, "attachment.resolve", `${action.label} route selected`);
      break;
    case "communication-action":
      runNamedTrigger(ui, data, `thread.${action.value}`);
      break;
    case "branch-action":
      runNamedTrigger(ui, data, action.value === "redirect" ? "turn.redirect" : `thread.${action.value}`);
      break;
    case "network-action":
      runNamedTrigger(ui, data, `network.${action.value}`);
      break;
    case "provider-action":
      runNamedTrigger(ui, data, `provider.${action.value}`);
      break;
    case "grant-once":
      runNamedTrigger(ui, data, "cross_project.grant");
      break;
    case "resource-select":
      ui.resourceSelection = action.value;
      recordReceipt(ui, "resource.details", action.value);
      break;
    case "notification-outcome":
      runNamedTrigger(ui, data, "notification.inline_outcome");
      break;
    case "notification-toggle":
      ui.notification.state = ui.notification.state === "open" ? "closed" : "open";
      if (ui.notification.state === "open") ui.notification.unread = 0;
      recordReceipt(ui, "notification.inbox", ui.notification.state === "open" ? "Title-bar notification inbox opened" : "Title-bar notification inbox closed");
      break;
    case "notification-close":
      ui.notification.state = "closed";
      recordReceipt(ui, "notification.inbox", "Title-bar notification inbox closed");
      break;
    case "run-trigger":
      if (runNamedTrigger(ui, data, action.value) === "reset") {
        const reset = defaultUi(data, defaults);
        if (action.value === "system.reset") recordReceipt(reset, action.value, "Known initial fixture state restored");
        return reset;
      }
      if (action.value.startsWith("question.")) ui.motionCue = { domain: "question", state: action.value.endsWith("prepare") ? "prepare" : action.value.endsWith("submit") || action.value.endsWith("cancel") ? "receipt" : action.value.endsWith("next") ? "page" : action.value.endsWith("select") ? "select" : "open", nonce: ui.revision };
      if (/^(goal|todo|subagent|activity|diff)\./.test(action.value)) ui.motionCue = { domain: "work", state: /open|add|spawn/.test(action.value) ? "reopen" : "progress", nonce: ui.revision };
      break;
    case "queue-user-message": {
      const view = currentView(ui);
      const text = String(action.value ?? view.draft).trim();
      if (!text) break;
      const operationId = stableId("client-op", ui.deterministicCounter++);
      const messageId = stableId(`${ui.activeThreadId}-local`, ui.deterministicCounter++);
      const offline = ui.network.transport === "Offline";
      const redirecting = ui.agentActive && !offline;
      const message = {
        id: messageId,
        role: "user",
        body: text,
        sentAt: nextTime(ui, 4),
        runtime: { provider: ui.route.provider, model: ui.route.model, persona: "Current thread", mode: ui.conversationMode, effort: ui.route.effort, workedSeconds: 0, totalElapsedSeconds: 0 },
        eligibleForEdit: true,
        collapsedByDefault: text.length > 900,
        clientOperationId: operationId,
        deliveryState: offline ? "queued to send" : redirecting ? "redirecting active turn" : "sent"
      };
      ui.addedMessages[ui.activeThreadId] = [...(ui.addedMessages[ui.activeThreadId] ?? []), message];
      if (offline) ui.outbox.push({ operationId, threadId: ui.activeThreadId, messageId, state: "queued" });
      if (ui.agentActive && !offline) {
        ui.branch.state = "redirected";
        ui.branch.message = "Active turn redirected; the prior attempt remains in history";
      }
      if (view.draft && view.draftHistory.at(-1)?.text !== view.draft) view.draftHistory.push({ id: stableId("draft", ui.deterministicCounter++), text: view.draft, savedAt: nextTime(ui, 1), state: "sent" });
      view.draft = "";
      ui.agentActive = !offline;
      ui.activeRunToken += 1;
      ui.workingSummary = offline ? "Queued locally until reconnect" : "Starting the next scripted fixture response";
      ui.motionCue = { domain: "message", state: offline ? "queued" : redirecting ? "redirect" : "commit", messageId, nonce: ui.revision };
      ui.focusRequest = "composer";
      recordReceipt(ui, offline ? "outbox.queue" : "chat.send", offline ? "Message queued with one stable operation ID" : "Exact user text appended; scripted sequence started");
      break;
    }
    case "stop-run":
      ui.agentActive = false;
      ui.activeRunToken += 1;
      ui.workingSummary = "Scripted work stopped; completed evidence retained";
      recordReceipt(ui, "chat.stop", "Active scripted response stopped from the composer");
      break;
    case "work-summary":
      ui.workingSummary = action.value;
      ui.workedSeconds += action.seconds ?? 3;
      break;
    case "append-scripted-reply":
      ui.addedMessages[ui.activeThreadId] = [...(ui.addedMessages[ui.activeThreadId] ?? []), action.message];
      currentView(ui).scriptCursor += 1;
      ui.agentActive = false;
      ui.workingSummary = "Scripted response complete";
      ui.motionCue = { domain: "message", state: "commit", messageId: action.message.id, nonce: ui.revision };
      recordReceipt(ui, "chat.scripted_reply", "Prewritten fixture response appended; no semantic-answer claim made");
      break;
    default:
      break;
  }
  refreshProviderContinuationProjection(ui);
  syncThreadLocal(ui);
  return ui;
}

export function createPrototypeStore(data, defaults = {}) {
  const seed = defaultUi(data, defaults);
  let ui = deepMerge(seed, readPersisted());
  const listeners = new Set();
  const activeTimers = new Set();
  let widthPersistTimer = null;

  function notify(action) {
    listeners.forEach((listener) => listener({ data, ui, action }));
  }

  function dispatch(action, options = {}) {
    ui = reduce(ui, action, data, defaults);
    if (action.type === "set-width") {
      if (widthPersistTimer) clearTimeout(widthPersistTimer);
      widthPersistTimer = setTimeout(() => {
        widthPersistTimer = null;
        persistUi(ui);
      }, 140);
    } else {
      if (widthPersistTimer) {
        clearTimeout(widthPersistTimer);
        widthPersistTimer = null;
      }
      persistUi(ui);
    }
    if (options.notify !== false) notify(action);
    return ui;
  }

  function clearTimers() {
    if (widthPersistTimer) {
      clearTimeout(widthPersistTimer);
      widthPersistTimer = null;
    }
    activeTimers.forEach((timer) => clearTimeout(timer));
    activeTimers.clear();
  }

  function wait(milliseconds) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        activeTimers.delete(timer);
        resolve();
      }, milliseconds);
      activeTimers.add(timer);
    });
  }

  async function playScriptedReply(threadId, runToken) {
    if (ui.network.transport === "Offline") return;
    const thread = data.threadMap[threadId];
    const view = ui.threadViews[threadId];
    const replyIds = thread?.scriptedReplyIds ?? [];
    const replyId = replyIds[view?.scriptCursor % Math.max(1, replyIds.length)] ?? data.baseline.scriptedReplies[view?.scriptCursor % data.baseline.scriptedReplies.length]?.id;
    const reply = data.scriptedReplyMap[replyId] ?? data.baseline.scriptedReplies[0];
    for (let index = 0; index < reply.workingSummarySequence.length; index += 1) {
      if (ui.activeThreadId !== threadId || ui.activeRunToken !== runToken || !ui.agentActive) return;
      dispatch({ type: "work-summary", value: reply.workingSummarySequence[index], seconds: 4 });
      await wait(ui.reducedMotion ? 24 : Math.min(520, reply.stepDurationsMs[index] ?? 360));
    }
    if (ui.activeThreadId !== threadId || ui.activeRunToken !== runToken || !ui.agentActive) return;
    const message = {
      id: stableId(`${threadId}-scripted`, ui.deterministicCounter++),
      role: "assistant",
      body: reply.body,
      sentAt: nextTime(ui, 7),
      runtime: clone(reply.runtime),
      eligibleForEdit: false,
      collapsedByDefault: reply.body.length > 900,
      activitySummary: reply.activitySummary,
      deliveryState: "sent"
    };
    dispatch({ type: "append-scripted-reply", message });
  }

  function sendDraft() {
    const draft = currentView(ui).draft;
    if (!draft.trim() && ui.agentActive) {
      dispatch({ type: "stop-run" });
      return;
    }
    if (!draft.trim()) return;
    dispatch({ type: "queue-user-message", value: draft });
    const token = ui.activeRunToken;
    const threadId = ui.activeThreadId;
    if (ui.network.transport !== "Offline") playScriptedReply(threadId, token);
  }

  return {
    getState: () => ({ data, ui }),
    dispatch,
    sendDraft,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy() {
      clearTimers();
      listeners.clear();
    },
    reset(options = {}) {
      clearTimers();
      localStorage.removeItem(STORAGE_KEY);
      ui = defaultUi(data, defaults);
      if (options.notify !== false) notify({ type: "scenario.reset" });
    },
    getMessages(threadId = ui.activeThreadId) {
      return threadMessages(data, ui, threadId);
    }
  };
}
