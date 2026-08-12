import { ARTIFACT_STATES, BSD_OPTIONS, STORAGE_KEY, clamp, stableId } from "./definitions.js";

const STATE_SCHEMA = "pm.chat.5_6_sol.prototype_state.v1";

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
  const [baseline, extension, scenario, matrix] = await Promise.all([
    fetchJson("../data/original_demoData.json"),
    fetchJson("../data/sol-extensions.json"),
    fetchJson("../data/extended_demo_scenario.json"),
    fetchJson("../data/original_testMatrix.json")
  ]);
  const threads = [...baseline.threads, ...extension.threads];
  return {
    baseline,
    extension,
    scenario,
    matrix,
    threads,
    threadMap: Object.fromEntries(threads.map((thread) => [thread.id, thread])),
    scriptedReplyMap: Object.fromEntries(baseline.scriptedReplies.map((reply) => [reply.id, reply]))
  };
}

function initialThreadViews(data) {
  return Object.fromEntries(data.threads.map((thread) => [thread.id, {
    draft: thread.draftState?.text ?? "",
    draftAttachments: clone(thread.draftState?.attachments ?? []),
    draftHistory: thread.draftState?.text ? [{ id: `${thread.id}-draft-1`, text: thread.draftState.text, savedAt: thread.draftState.savedAt }] : [],
    searchQuery: "",
    scrollAnchor: thread.messages.at(-1)?.id ?? null,
    followingLatest: true,
    longExpanded: {},
    workExpanded: {},
    contextSelection: [],
    questionDrafts: {},
    scriptCursor: thread.scriptedReplyCursor ?? 0
  }]));
}

function defaultUi(data, defaults) {
  const primaryThreadId = data.extension.primary_thread_id ?? "thread-11";
  return {
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
      selectedId: "artifact-code",
      priorSelectedId: null,
      message: "Artifact ready"
    },
    threadViews: initialThreadViews(data),
    threadMeta: {},
    addedMessages: {},
    spawnedThreads: [],
    popup: null,
    popupReturnFocus: null,
    popupPane: "providers",
    demoControllerOpen: false,
    search: { scope: "Current Thread", query: "", selectedResult: null },
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
      activeId: "q-sol-primary",
      phase: "open",
      answers: {},
      skips: {},
      validation: "",
      receipt: null
    },
    operational: clone(data.extension.operational_fixture),
    agentActive: true,
    activeRunToken: 0,
    workingSummary: "Inspecting the current concept architecture",
    workedSeconds: 86,
    attachmentResolution: { state: "none", label: "No attachment route pending", detail: "" },
    routeWarning: null,
    approval: null,
    communication: { state: "idle", message: "No cross-thread request active", source: primaryThreadId, target: "thread-03", requestId: null },
    branch: { state: "idle", message: "No branch operation active", sourceMessageId: null, restorePointId: "restore-2026-08-10-01" },
    network: { transport: "Live", domain: "Live", serverWork: "Server work continuing", lastCursor: 4281, snapshotCursor: 4281 },
    outbox: [],
    replayedOperationIds: [],
    grants: { crossProject: "Off", scope: "None", message: "Cross-project access is off by default" },
    notification: { state: "none", message: "App-wide outcomes route to the title-bar inbox" },
    resourceSelection: null,
    activityPhase: 1,
    triggerReceipts: [],
    deterministicCounter: 1,
    deterministicTime: data.extension.deterministic_clock_start,
    statusLine: "Interactive fixture ready",
    focusRequest: null
  };
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
    recordReceipt(ui, "route.unavailable", ui.route.warning);
    return;
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
  const handlers = {
    "history.closed": () => { ui.historyMode = "closed"; },
    "history.peek": () => { ui.historyMode = "peek"; },
    "history.pinned_full": () => { ui.historyMode = "pinned full"; },
    "history.pinned_compact": () => { ui.historyMode = "pinned compact"; },
    "artifact.loading": () => { ui.artifact.state = "loading"; ui.artifact.message = "Loading selected artifact"; },
    "artifact.ready": () => { ui.artifact.state = "ready"; ui.artifact.message = "Artifact ready"; },
    "artifact.updated": () => { ui.artifact.state = "updated"; ui.artifact.message = "A newer artifact version is available"; },
    "artifact.error": () => { ui.artifact.state = "error"; ui.artifact.message = "Artifact could not be loaded. Retry keeps the current selection."; },
    "artifact.retry": () => { ui.artifact.state = "loading"; ui.artifact.message = "Retrying artifact load"; },
    "question.preparing": () => { ui.question.phase = "preparing"; },
    "question.open": () => { ui.question.phase = "open"; },
    "question.answer": () => {
      const question = selectedQuestion(ui);
      if (!question) return;
      const fallback = question.type === "multi-select"
        ? [question.options?.[0] ?? "First option"]
        : question.type === "freeform"
          ? "Use the evidence-backed default and retain a reversible receipt."
          : question.options?.[0] ?? "Accepted";
      ui.question.answers[question.id] = fallback;
      delete ui.question.skips[question.id];
      ui.question.validation = "";
    },
    "question.skip": () => {
      const question = selectedQuestion(ui);
      if (!question) return;
      ui.question.skips[question.id] = true;
      delete ui.question.answers[question.id];
    },
    "question.cancel": () => { ui.question.phase = "cancelled"; ui.question.receipt = "Questionnaire cancelled; ordinary draft preserved"; },
    "question.submit": () => { ui.question.phase = "submitted"; ui.question.receipt = "Answers submitted with explicit skips"; },
    "goal.start": () => { ui.operational.goal.state = "running"; },
    "goal.pause": () => { ui.operational.goal.state = "paused"; },
    "goal.resume": () => { ui.operational.goal.state = "running"; },
    "goal.replan": () => { ui.operational.goal.state = "replanning"; ui.operational.goal.phase = "Impact analysis"; },
    "goal.block": () => { ui.operational.goal.state = "blocked"; ui.operational.goal.blockedReason = "Visual acceptance evidence is missing"; ui.operational.goal.attemptedRecovery = "Rebuilt the frame and reran geometry probes"; ui.operational.goal.nextSafeAction = "Inspect the served frame directly"; },
    "goal.recover": () => { ui.operational.goal.state = "running"; ui.operational.goal.blockedReason = ""; ui.operational.goal.phase = "Recovery verification"; },
    "goal.stop": () => { ui.operational.goal.state = "stopped"; },
    "goal.complete": () => { ui.operational.goal.state = "complete"; ui.operational.goal.progress = 100; },
    "todo.all_states": () => {
      const states = ["pending", "running", "verifying", "complete", "blocked", "failed", "skipped", "cancelled", "stale", "replanned"];
      ui.operational.todos.forEach((todo, index) => { todo.state = states[index % states.length]; });
    },
    "subagent.all_states": () => {
      const states = ["running", "waiting", "blocked", "retrying", "fallback", "complete"];
      ui.operational.subagents.forEach((agent, index) => { agent.state = states[index % states.length]; });
    },
    "crew.waves": () => { ui.operational.crew.state = ui.operational.crew.state === "wave 1 of 3" ? "wave 2 of 3" : "wave 1 of 3"; },
    "activity.advance": () => { ui.activityPhase = (ui.activityPhase % 5) + 1; },
    "diff.create": () => { ui.operational.diff.state = "created"; },
    "diff.update": () => { ui.operational.diff.state = "updated"; ui.operational.diff.additions += 7; },
    "approval.request": () => { ui.approval = { state: "pending", title: "Approve protected write", summary: "One repository file would change", evidenceOpen: false }; },
    "route.warning": () => { ui.routeWarning = { state: "pending", title: "Route changes privacy and cache reuse", detail: "The alternate account uses another provider boundary and cannot reuse the current prompt cache." }; },
    "attachment.native": () => { ui.attachmentResolution = { state: "native", label: "Native", detail: "The selected model can read this text file directly." }; },
    "attachment.transformed": () => { ui.attachmentResolution = { state: "transformed", label: "PM transformed", detail: "Audio is converted to a bounded transcript artifact with lineage." }; },
    "attachment.alternate": () => { ui.attachmentResolution = { state: "alternate", label: "Alternate model", detail: "Consent is required because provider, privacy, and allowance change." }; },
    "attachment.unsupported": () => { ui.attachmentResolution = { state: "unsupported", label: "Unsupported", detail: "No truthful route is available for this attachment." }; },
    "context.lens": () => { ui.context.lensOpen = true; ui.context.mode = "Focus"; },
    "context.compact_now": () => { ui.context.ringPercent = 38; ui.context.compactReceipt = "Compacted 24 messages; canonical history and branch ancestry preserved"; },
    "thread.request": () => { ui.communication = { state: "requested", message: "Bounded request sent to Planning Wizard handoff", source: ui.activeThreadId, target: "thread-03", requestId: "thread-request-006" }; },
    "thread.await": () => { ui.communication.state = "awaiting"; ui.communication.message = "Awaiting target response without copying its transcript"; },
    "thread.spawn": () => { ui.communication.state = "spawned"; ui.communication.message = "Sibling thread spawned with bounded selected references"; },
    "thread.branch": () => { ui.branch.state = "branched"; ui.branch.message = "Sibling branch created; source thread and workspace files are unchanged"; },
    "thread.rewind": () => { ui.branch.state = "rewound"; ui.branch.message = "Conversation view rewound to the selected message; files were not rolled back"; },
    "thread.restore": () => { ui.branch.state = "restored"; ui.branch.message = "Immutable restore point applied to a sibling branch"; },
    "turn.redirect": () => { ui.branch.state = "redirected"; ui.branch.message = "Active turn redirected; original attempt and partial output retained"; },
    "cross_project.grant": () => { ui.grants = { crossProject: "Read only", scope: "Once", message: "One bounded read grant; it will not persist" }; },
    "resource.port_collision": () => { ui.resourceSelection = "Port collision · use OS-assigned port"; },
    "resource.worktree_collision": () => { ui.resourceSelection = "Worktree lease conflict · request isolated worktree"; },
    "resource.test_debug_state": () => { ui.resourceSelection = "Tests running · debug paused · retained logs available"; },
    "bsd.off": () => { ui.bsd = { mode: "Off", state: "off", message: "Back Seat Driver disabled", scope: "current thread" }; },
    "bsd.auto_idle": () => { ui.bsd = { mode: "Auto", state: "idle", message: "No risk signal; no evaluation ran", scope: "current thread" }; },
    "bsd.auto_active": () => { ui.bsd = { mode: "Auto", state: "evaluating", message: "Evaluating a bounded route delta", scope: "current thread" }; },
    "bsd.on": () => { ui.bsd = { mode: "On", state: "on", message: "Manual review requested for every turn", scope: "current thread" }; },
    "bsd.silent": () => { ui.bsd.state = "silent result"; ui.bsd.message = "Evaluation completed with no advice"; },
    "bsd.advice": () => { ui.bsd.state = "advice"; ui.bsd.message = "Keep the artifact outside model context until explicitly admitted"; },
    "bsd.timeout": () => { ui.bsd.state = "timeout"; ui.bsd.message = "BSD timed out; primary turn continued"; },
    "bsd.unavailable": () => { ui.bsd.state = "unavailable"; ui.bsd.message = "BSD route unavailable; primary authority unchanged"; },
    "provider.setup": () => { ui.route.warning = "Sign-in needed on Build Host East · Open Provider Settings"; },
    "provider.update": () => { ui.route.warning = "Official CLI update ready · user action required"; },
    "provider.rollback": () => { ui.route.warning = "Verified rollback available from Provider Settings"; },
    "network.offline": () => { ui.network.transport = "Offline"; ui.network.domain = "Cached"; },
    "network.reconnect": () => { ui.network.transport = "Synchronizing"; ui.network.domain = "Replay pending"; },
    "network.replay": () => { const delivered = replayOutbox(ui); ui.network.transport = "Live"; ui.network.domain = "Snapshot catch-up"; return `${delivered} queued command${delivered === 1 ? "" : "s"} replayed exactly once`; },
    "network.snapshot": () => { ui.network.transport = "Live"; ui.network.domain = "Live"; ui.network.snapshotCursor = ui.network.lastCursor + 17; },
    "notification.inline_outcome": () => { ui.notification = { state: "inline", message: "Task outcome shown inline; app-wide copy added to the title-bar inbox" }; }
  };
  if (handlers[trigger]) {
    const result = handlers[trigger]();
    recordReceipt(ui, trigger, typeof result === "string" ? result : `Trigger completed: ${trigger.replaceAll("_", " ")}`);
  } else if (trigger === "scenario.reset") {
    return "reset";
  } else {
    recordReceipt(ui, trigger, `Trigger is truthfully unavailable in this fixture: ${trigger}`);
  }
  return "handled";
}

function reduce(current, action, data, defaults) {
  const ui = clone(current);
  ui.revision += 1;
  ui.focusRequest = null;
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
      ui.historyMode = action.value;
      recordReceipt(ui, "history.geometry", `History is ${action.value}`);
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
      ui.activeThreadId = action.value;
      ui.popup = null;
      ui.focusRequest = "composer";
      recordReceipt(ui, "thread.select", `Restored ${action.value} with its local draft and view state`);
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
      if (action.threadId) ui.activeThreadId = action.threadId;
      ui.search.selectedResult = action.messageId;
      currentView(ui).longExpanded[action.messageId] = true;
      ui.popup = null;
      ui.focusRequest = `message-${action.messageId}`;
      recordReceipt(ui, "search.jump", "Loaded the exact stored range and revealed the match");
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
      recordReceipt(ui, "context.compact_now", ui.context.compactReceipt);
      break;
    case "question-phase":
      setQuestionPhase(ui, action.value, action.message ?? `Questionnaire ${action.value}`);
      break;
    case "question-answer": {
      const question = selectedQuestion(ui);
      if (question) {
        ui.question.answers[question.id] = action.value;
        delete ui.question.skips[question.id];
        ui.question.validation = "";
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
      }
      break;
    }
    case "question-back": {
      const questionnaire = activeQuestionnaire(ui);
      if (questionnaire && questionnaire.activeIndex > 0) questionnaire.activeIndex -= 1;
      ui.question.validation = "";
      ui.focusRequest = "question-prompt";
      break;
    }
    case "question-skip": {
      const question = selectedQuestion(ui);
      if (question) {
        ui.question.skips[question.id] = !ui.question.skips[question.id];
        if (ui.question.skips[question.id]) delete ui.question.answers[question.id];
      }
      break;
    }
    case "question-cancel":
      ui.question.phase = "cancelled";
      ui.question.receipt = "Questionnaire cancelled; existing answers retained in the historical record";
      ui.focusRequest = "composer";
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
        recordReceipt(ui, "question.submit", "Questionnaire submission started");
      }
      break;
    }
    case "question-submitted":
      ui.question.phase = "submitted";
      ui.question.receipt = `Submitted ${Object.keys(ui.question.answers).length} answers and ${Object.values(ui.question.skips).filter(Boolean).length} explicit skips`;
      ui.focusRequest = "composer";
      recordReceipt(ui, "question.receipt", ui.question.receipt);
      break;
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
      recordReceipt(ui, "goal.update", "Goal edit saved and visible replan started");
      break;
    case "todo-cycle": {
      const states = ["pending", "running", "verifying", "complete", "blocked", "failed", "skipped", "cancelled", "stale", "replanned"];
      const todo = ui.operational.todos.find((item) => item.id === action.value);
      if (todo) todo.state = states[(states.indexOf(todo.state) + 1) % states.length];
      break;
    }
    case "subagent-cycle": {
      const states = ["requested", "admitted", "queued", "running", "waiting", "blocked", "retrying", "fallback", "stopped", "complete"];
      const agent = ui.operational.subagents.find((item) => item.id === action.value);
      if (agent) agent.state = states[(states.indexOf(agent.state) + 1) % states.length];
      break;
    }
    case "crew-advance":
      ui.operational.crew.state = ui.operational.crew.state === "wave 1 of 3" ? "wave 2 of 3" : ui.operational.crew.state === "wave 2 of 3" ? "wave 3 of 3" : "complete";
      break;
    case "activity-advance":
      ui.activityPhase = (ui.activityPhase % ui.operational.activity.length) + 1;
      recordReceipt(ui, "activity.advance", `Activity phase ${ui.activityPhase} active`);
      break;
    case "diff-update":
      ui.operational.diff.state = "updated";
      ui.operational.diff.additions += 3;
      ui.operational.diff.deletions += 1;
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
    case "run-trigger":
      if (runNamedTrigger(ui, data, action.value) === "reset") return defaultUi(data, defaults);
      break;
    case "queue-user-message": {
      const view = currentView(ui);
      const text = String(action.value ?? view.draft).trim();
      if (!text) break;
      const operationId = stableId("client-op", ui.deterministicCounter++);
      const messageId = stableId(`${ui.activeThreadId}-local`, ui.deterministicCounter++);
      const offline = ui.network.transport === "Offline";
      const message = {
        id: messageId,
        role: "user",
        body: text,
        sentAt: nextTime(ui, 4),
        runtime: { provider: ui.route.provider, model: ui.route.model, persona: "Current thread", mode: ui.conversationMode, effort: ui.route.effort, workedSeconds: 0, totalElapsedSeconds: 0 },
        eligibleForEdit: true,
        collapsedByDefault: text.length > 900,
        clientOperationId: operationId,
        deliveryState: offline ? "queued to send" : ui.agentActive ? "redirecting active turn" : "sent"
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
      recordReceipt(ui, "chat.scripted_reply", "Prewritten fixture response appended; no semantic-answer claim made");
      break;
    default:
      break;
  }
  return ui;
}

export function createPrototypeStore(data, defaults = {}) {
  const seed = defaultUi(data, defaults);
  let ui = deepMerge(seed, readPersisted());
  const listeners = new Set();
  const activeTimers = new Set();

  function notify(action) {
    listeners.forEach((listener) => listener({ data, ui, action }));
  }

  function dispatch(action, options = {}) {
    ui = reduce(ui, action, data, defaults);
    persistUi(ui);
    if (options.notify !== false) notify(action);
    return ui;
  }

  function clearTimers() {
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
      if (ui.activeRunToken !== runToken || !ui.agentActive) return;
      dispatch({ type: "work-summary", value: reply.workingSummarySequence[index], seconds: 4 });
      await wait(ui.reducedMotion ? 24 : Math.min(520, reply.stepDurationsMs[index] ?? 360));
    }
    if (ui.activeRunToken !== runToken || !ui.agentActive) return;
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
    reset() {
      localStorage.removeItem(STORAGE_KEY);
      ui = defaultUi(data, defaults);
      notify({ type: "scenario.reset" });
    },
    getMessages(threadId = ui.activeThreadId) {
      return threadMessages(data, ui, threadId);
    }
  };
}
