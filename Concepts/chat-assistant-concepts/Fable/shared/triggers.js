// Fable — deterministic trigger engine. Every trigger id from the packet's
// extended_demo_scenario.json maps to a real store mutation. Raw dotted ids stay
// in data attributes; the console renders human labels from strings.js.

import { store } from "./store.js";
import { TRIGGER_LABELS } from "./strings.js";
import { ATTACHMENTS, SCENARIO_V2_WARNINGS, SCENARIO_V2_COLLISION, SCENARIO_V2_DIFF } from "./data.js";

function ensureGoal() {
  if (!store.thread.activeGoal) {
    store.startGoal({
      id: "goal-demo", title: "Provider routing refactor",
      objective: "Split requested route, resolution, and settlement; keep the chat-facing API stable.",
      status: "running", workedSeconds: 0, totalElapsedSeconds: 0,
      canEdit: true, canPause: true, canResume: false, canStop: true, canClear: false, expanded: true,
    });
  }
}

function ensureTodo() {
  if (!store.thread.todo) {
    store.thread.todo = {
      id: "todo-demo",
      items: [
        { id: "td-d1", label: "Split route model", state: "complete" },
        { id: "td-d2", label: "Extract resolution engine", state: "running" },
        { id: "td-d3", label: "Settlement records", state: "verifying" },
        { id: "td-d4", label: "Explicit fallback chain", state: "pending" },
        { id: "td-d5", label: "API shim for chat layer", state: "blocked" },
        { id: "td-d6", label: "Legacy resolver removal", state: "skipped" },
        { id: "td-d7", label: "Migration dry run", state: "stale" },
        { id: "td-d8", label: "Test harness update", state: "replanned" },
      ],
    };
    store.emit("work");
  }
}

const QUESTION_DEF = () => ({
  id: "q-demo-" + Date.now(),
  title: "Route fallback decisions",
  status: "preparing",
  createdAt: new Date().toISOString(),
  currentQuestionIndex: 0,
  questions: [
    { id: "qd-1", prompt: "When the requested account hits its window, should PM queue, fall back to the API-key account, or ask each time?", kind: "single select", required: true, options: ["Queue until the window resets", "Fall back to the API-key route", "Ask each time"], selected: [] },
    { id: "qd-2", prompt: "Which signals should surface a material route warning?", kind: "multi select", required: true, options: ["Privacy boundary change", "Paid continuation", "Context size change", "Cache reuse loss"], selected: [] },
    { id: "qd-3", prompt: "Anything the fallback chain must never do?", kind: "freeform", required: false, options: [], selected: [] },
  ],
});

export const TRIGGERS = {
  // ---- history geometry ----
  "history.closed": () => store.setHistory("closed"),
  "history.peek": () => store.setHistory("peek"),
  "history.pinned_full": () => store.setHistory("pinned-full"),
  "history.pinned_compact": () => store.setHistory("pinned-compact"),

  // ---- artifact lifecycle ----
  "artifact.loading": () => { const a = firstArtifact(); if (a) { store.openArtifact(a.id); } },
  "artifact.ready": () => { const a = firstArtifact(); if (a) { store.openArtifact(a.id); } },
  "artifact.updated": () => { const a = firstArtifact(); if (!store.state.artifact.openId && a) store.openArtifact(a.id); setTimeout(() => store.artifactUpdated(), 700); },
  "artifact.error": () => { const a = firstArtifact(); if (a) { store.openArtifact(a.id, { simulate: "error" }); } },
  "artifact.retry": () => store.retryArtifact(),

  // ---- questionnaire lifecycle ----
  "question.preparing": () => store.prepareQuestionnaire(QUESTION_DEF()),
  "question.open": () => {
    const q = store.activeQuestionnaire();
    if (!q) { const def = QUESTION_DEF(); def.status = "incomplete"; store.thread.questionnaires.push(store._normalizeThread({ questionnaires: [def] }).questionnaires[0]); store.emit("question"); }
  },
  "question.answer": () => {
    const q = store.activeQuestionnaire();
    if (q) { const cur = q.questions[q.currentQuestionIndex]; if (cur && cur.options.length) store.answerQuestion(q.id, cur.id, cur.options[0]); }
  },
  "question.skip": () => {
    const q = store.activeQuestionnaire();
    if (q) { const cur = q.questions[q.currentQuestionIndex]; if (cur) store.skipQuestion(q.id, cur.id); }
  },
  "question.cancel": () => { const q = store.activeQuestionnaire(); if (q) store.cancelQuestionnaire(q.id); },
  "question.submit": () => {
    const q = store.activeQuestionnaire();
    if (q) {
      for (const question of q.questions) {
        if (question.required && (!question.selected || !question.selected.length) && question.options.length) {
          store.answerQuestion(q.id, question.id, question.options[0]);
        }
      }
      store.submitQuestionnaire(q.id);
    }
  },

  // ---- goal lifecycle ----
  "goal.start": () => { ensureGoal(); store.setGoalStatus("Running"); },
  "goal.pause": () => { ensureGoal(); store.setGoalStatus("Paused"); },
  "goal.resume": () => { ensureGoal(); store.setGoalStatus("Running"); },
  "goal.replan": () => { ensureGoal(); store.editGoal("Split routing, add fallback receipts, and cover the CLI account isolation cases."); },
  "goal.block": () => { ensureGoal(); store.setGoalStatus("Blocked"); },
  "goal.recover": () => { ensureGoal(); store.setGoalStatus("Running"); store.addReceipt({ kind: "goal", title: "Goal recovered", detail: "Preview server moved to port 8081 after approval; integration lane resumed." }); },
  "goal.stop": () => { ensureGoal(); store.setGoalStatus("Stopped"); },
  "goal.complete": () => { ensureGoal(); store.setGoalStatus("Complete", { summary: "Routing split landed across three waves; receipts recorded; API shim verified." }); },

  // ---- aggregates ----
  "todo.all_states": () => ensureTodo(),
  "subagent.all_states": () => {
    const t = store.thread;
    t.subagentGroups = [{
      id: "sub-demo", label: "Specialists", state: "running",
      counts: { working: 1, complete: 1, blocked: 1, waiting: 1 },
      agents: [
        { name: "Route model", task: "Split route structs", currentActivity: "Editing route.rs", status: "working", workedSeconds: 640, route: "Fable 5 · jared — Max plan" },
        { name: "Resolution", task: "Extract resolution engine", currentActivity: "Done — 4 files, tests green", status: "complete", workedSeconds: 1210, route: "GPT-5.6 Pro · jared — Team" },
        { name: "Settlement", task: "Settlement records", currentActivity: "Blocked — waiting on port 8080", status: "blocked", workedSeconds: 300, route: "Qwen 3.8 · platyr-dev" },
        { name: "Harness", task: "Test harness update", currentActivity: "Queued — capacity window", status: "waiting", workedSeconds: 0, route: "Fable 5 · Platyr — API key" },
      ],
    }];
    store.emit("work");
  },
  "crew.waves": () => {
    store.state.crew = { wave: 2, waves: 3, concurrent: 2, queued: 1 };
    store.addReceipt({ kind: "crew", title: "Crew wave advanced", detail: "Wave 2 of 3 running two specialists; one queued behind the capacity window; integration reserve preserved." });
    store.emit("work");
  },
  "activity.advance": () => {
    const turn = store.state.turns[store.state.currentThreadId];
    if (turn && turn.active) {
      turn.stepIndex++;
      turn.summary = ["Reading call sites", "Editing 3 files", "Running focused tests", "Writing summary"][turn.stepIndex % 4];
      store.emit("work");
    } else {
      store.setDraft("Advance the refactor");
      store.sendMessage();
    }
  },

  // ---- diff / approval / route warning ----
  "diff.create": () => {
    const t = store.thread;
    if (!t.diffGroups.some((d) => d.id === "diff-demo")) {
      t.diffGroups.push({ id: "diff-demo", label: "Fallback chain — three files", files: [
        { path: "src/routing/fallback.rs", added: 74, removed: 0, status: "created" },
        { path: "src/routing/route.rs", added: 18, removed: 6, status: "modified" },
        { path: "src/chat/api_shim.rs", added: 9, removed: 2, status: "modified" },
      ]});
    }
    store.emit("work");
  },
  "diff.update": () => {
    const t = store.thread;
    const d = t.diffGroups[t.diffGroups.length - 1];
    if (d) { d.files[0].added += 12; d.label += ""; store.emit("work"); store.artifactUpdated(); }
  },
  "approval.request": () => store.requestApproval({
    threadId: store.state.currentThreadId,
    title: "Run integration tests against the staging database?",
    scope: "cargo test --features staging · reads staging schema, writes nothing",
    detail: "Exact commands: cargo test -p routing --features staging. Files: none written. Domains: staging.platyr.internal. Persistence: this approval covers this run only. Safer alternative: run against the local fixture database.",
    actions: ["Approve", "Deny"],
  }),
  "route.warning": () => store.raiseWarning({
    threadId: store.state.currentThreadId,
    kind: "route",
    title: "Continuing switches provider boundary",
    body: "Video transcription needs GPT-5.6 Pro under jared — Team. That crosses a privacy boundary (Anthropic → OpenAI), loses the cached prefix, and bills the Team plan.",
    actions: ["Continue here", "Branch with new model", "Start new chat", "Cancel", "Details"],
  }),

  // ---- attachments ----
  "attachment.native": () => store.addAttachment({ ...ATTACHMENTS[0] }),
  "attachment.transformed": () => store.addAttachment({ ...ATTACHMENTS[1] }),
  "attachment.alternate": () => { store.addAttachment({ ...ATTACHMENTS[2] }); TRIGGERS["route.warning"](); },
  "attachment.unsupported": () => store.addAttachment({ ...ATTACHMENTS[3] }),

  // ---- context ----
  "context.lens": () => {
    const l = store.lensState;
    l.panelOpen = true;
    const msgs = store.thread.messages.slice(2, 6);
    if (msgs[0]) l.selections[msgs[0].id] = "mute";
    if (msgs[1]) l.selections[msgs[1].id] = "focus";
    if (msgs[2]) l.selections[msgs[2].id] = "subcompact-pending";
    if (msgs[3]) l.selections[msgs[3].id] = "subcompact-pending";
    store.emit("lens");
  },
  "context.compact_now": () => store.compactNow(),

  // ---- cross-thread ----
  "thread.request": () => store.addReceipt({
    kind: "thread-request",
    title: "Request sent to Failing import tests",
    detail: "Bounded task: confirm quarantined tests. Scope: read only. Budget: one response. Idempotency key retained.",
  }),
  "thread.await": () => {
    store.addReceipt({ kind: "thread-await", title: "Awaiting response", detail: "Target thread is inactive; it resumes to answer, then returns to rest." });
    setTimeout(() => store.addReceipt({ kind: "thread-result", title: "Response from Failing import tests", detail: "Two quarantined: exif_strip_survives_resize and zip_bomb_guard, pending the guard threshold fix." }), 1600);
  },
  "thread.spawn": () => {
    const id = store.branchFrom(store.thread.messages[store.thread.messages.length - 1].id, { title: "Spawned — guard threshold fix" });
    if (id) { store.state.threads[id].tags = ["spawned child"]; store.state.threads[id].branchOf.kind = "spawn"; store.emit("thread"); }
  },
  "thread.branch": () => {
    const mid = store.thread.messages[Math.max(0, store.thread.messages.length - 3)];
    if (mid) store.branchFrom(mid.id);
  },
  "thread.rewind": () => {
    const mid = store.thread.messages[Math.max(0, store.thread.messages.length - 3)];
    if (mid) store.rewindTo(mid.id);
  },
  "thread.restore": () => store.createRestorePoint("Before API shim wave"),

  // ---- turn / grants ----
  "turn.redirect": () => {
    if (!store.isAgentActive()) { store.setDraft("Refactor the settlement lane first"); store.sendMessage(); }
    setTimeout(() => { store.setDraft("Actually — keep settlement, do the fallback chain first"); store.sendMessage(); }, 900);
  },
  "cross_project.grant": () => store.requestApproval({
    threadId: store.state.currentThreadId,
    title: "Allow reading Tastebook's import pipeline?",
    scope: "Cross-project read · Tastebook → Puppet Master · scope: Thread",
    detail: "Read-only access to src/services/importer.rs and its tests. Grant scope: this thread. One-time grants never silently persist.",
    actions: ["Allow for this thread", "Allow once", "Deny"],
  }),

  // ---- operational awareness ----
  "resource.port_collision": () => store.raiseWarning({
    threadId: store.state.currentThreadId,
    kind: "resource",
    title: "Port 8080 is held by the preview server",
    body: "The integration lane wants 8080. PM will not kill a process this Goal does not own. Move the test lane to 8081, or free the port manually.",
    actions: ["Use 8081", "Wait", "Details"],
  }),
  "resource.worktree_collision": () => store.raiseWarning({
    threadId: store.state.currentThreadId,
    kind: "resource",
    title: "Worktree lease conflict",
    body: "crew/refactor-lane-b is leased to Crew wave 2 with three uncommitted edits. Patches are preserved; the lane integrates when the lease releases.",
    actions: ["Wait for lease", "Open worktree", "Details"],
  }),
  "resource.test_debug_state": () => store.addReceipt({
    kind: "ops",
    title: "Test and debug snapshot",
    detail: "128 passed, 2 failed, 4 skipped. Debug session paused at importer.rs:214. Nightly backup 412 MB at 01:00. Two restore points available.",
  }),

  // ---- BSD ----
  "bsd.off": () => store.setBsd("off"),
  "bsd.auto_idle": () => { store.setBsd("auto"); store.setBsdState("idle"); },
  "bsd.auto_active": () => {
    store.setBsd("auto"); store.setBsdState("evaluating");
    setTimeout(() => { if (store.local.bsdState === "evaluating") store.setBsdState("silent result"); }, 2600);
  },
  "bsd.on": () => store.setBsd("on"),
  "bsd.silent": () => { store.setBsd("auto"); store.setBsdState("silent result"); },
  "bsd.advice": () => {
    store.setBsd("auto"); store.setBsdState("advice");
    store.addReceipt({ kind: "bsd", title: "Back Seat Driver advice", detail: "The fallback chain retries the same account twice before switching — consider one retry, then switch, to stay inside the window." });
  },
  "bsd.timeout": () => { store.setBsd("auto"); store.setBsdState("timeout"); },
  "bsd.unavailable": () => { store.setBsd("auto"); store.setBsdState("unavailable"); },

  // ---- provider setup ----
  "provider.setup": () => store.addReceipt({ kind: "provider", title: "Provider setup", detail: "Google route needs sign-in. Antigravity CLI owns this sign-in; PM opens the official page and returns you here. The profile stays with the Execution Host." }),
  "provider.update": () => store.addReceipt({ kind: "provider", title: "Scheduled provider update", detail: "Grok CLI 3.2 → 3.3 scheduled for tonight's window. Verification runs before the route returns to Ready." }),
  "provider.rollback": () => store.addReceipt({ kind: "provider", title: "Provider rollback", detail: "Grok CLI 3.3 verification failed; rolled back to 3.2. Route stays available; repair is queued." }),

  // ---- network ----
  "network.offline": () => store.setTransport("Offline"),
  "network.reconnect": () => store.reconnectAndReplay(),
  "network.replay": () => store.reconnectAndReplay(),
  "network.snapshot": () => store.snapshotCatchUp(),

  // ---- misc ----
  "notification.inline_outcome": () => store.addReceipt({ kind: "inline", title: "Tests finished", detail: "Focused routing tests: 34 passed. Inline outcome belongs to this task; app-wide events go to the title-bar stack." }),
  "scenario.reset": () => { store.resetPersistence(); location.reload(); },
};

function firstArtifact() {
  const t = store.thread;
  return (t.artifacts && t.artifacts[0]) || null;
}

// ---------------------------------------------------------------------------
// v2 trigger contract (pm.chat_assistant_demo_trigger_contract.v2, restored by
// the correction packet). Every family/event below is a first-class
// deterministic trigger; the earlier dotted ids above remain as aliases.
// Renderers vary by concept while consuming the same semantic events.
// ---------------------------------------------------------------------------
const ACTIVITY_PHASES = {
  thinking_summary: { label: "Thinking for 3s", items: [{ text: "Considering the routing split before touching the picker." }] },
  search: { label: "Searching 6 related project threads", items: [{ text: "Provider multi-account routing" }, { text: "Free models catalog refresh" }, { text: "Settings redesign bakeoff" }] },
  read: { label: "Reading 7 plan and concept files", items: [{ text: "Plans/assistant-chat-design.md" }, { text: "Plans/FinalGUISpec.md" }, { text: "shared/components.js" }] },
  fetch: { label: "Comparing 4 provider implementations", items: [{ text: "Requested-versus-effective display patterns" }, { text: "Cache-loss warning language" }] },
  browser: { label: "Checking pinning at 4 widths", items: [{ text: "520, 750, 975, 1200 — floor held" }] },
  test: { label: "Running focused interaction probes", items: [{ text: "34 passed, 0 failed" }] },
  edit: { label: "Making 1 create and 3 edits", items: [{ text: "threads/provider-selector.js", side: "+92 −18" }, { text: "threads/access-controls.css", side: "+61 −39" }, { text: "verification/interaction-probes.mjs", side: "+31 −10" }] },
  generate: { label: "Writing the implementation handoff", items: [{ text: "docs/handoff/provider-redesign-impact.md" }] },
};

function latestOpenDecision(kind) {
  const tid = store.state.currentThreadId;
  const pool = kind === "approval"
    ? store.state.approvals.filter((a) => a.threadId === tid && a.state === "open")
    : store.state.warnings.filter((w) => w.threadId === tid && w.state === "open");
  return pool[pool.length - 1] || null;
}

// Snapshot of the original trigger implementations so same-named v2 entries
// delegate to the real behavior instead of recursing into themselves.
const V1 = { ...TRIGGERS };

const V2_TRIGGERS = {
  // ---- history ----
  "history.peek": () => store.setHistory("peek"),
  "history.pin_compact": () => store.setHistory("pinned-compact"),
  "history.pin_full": () => store.setHistory("pinned-full"),
  "history.unpin": () => store.setHistory("closed"),
  "history.switch_thread": () => {
    const list = store.threadList();
    const idx = list.findIndex((t) => t.id === store.state.currentThreadId);
    const next = list[(idx + 1) % list.length];
    if (next) store.selectThread(next.id);
  },

  // ---- question ----
  "question.prepare": () => V1["question.preparing"](),
  "question.open": () => {
    store.promoteQueuedQuestionnaire();
    if (!store.activeQuestionnaire()) V1["question.open"]();
  },
  "question.select": () => V1["question.answer"](),
  "question.next": () => {
    const q = store.activeQuestionnaire();
    if (q) store.navigateQuestion(q.id, q.currentQuestionIndex + 1);
  },
  "question.validation_error": () => {
    const q = store.activeQuestionnaire();
    if (!q) return;
    // Deterministic: clear a required question's answer, then attempt submit so
    // every composition shows its required-gate error truthfully.
    const req = q.questions.find((x) => x.required);
    if (req) { req.selected = []; delete q.skipped[req.id]; }
    store.submitQuestionnaire(q.id);
  },
  "question.skip": () => V1["question.skip"](),
  "question.cancel": () => V1["question.cancel"](),
  "question.submit": () => V1["question.submit"](),

  // ---- goal ----
  "goal.start": () => V1["goal.start"](),
  "goal.progress": () => { ensureGoal(); store.advanceGoalPhase(); },
  "goal.pause": () => V1["goal.pause"](),
  "goal.resume": () => V1["goal.resume"](),
  "goal.update": () => { ensureGoal(); store.editGoal(store.thread.activeGoal.objective + " Cover CLI account isolation."); },
  "goal.replan": () => { ensureGoal(); if (!store.thread.activeGoal.pendingEdit) store.editGoal(store.thread.activeGoal.objective + " Cover CLI account isolation."); store.confirmGoalEdit(); },
  "goal.blocked": () => V1["goal.block"](),
  "goal.complete": () => V1["goal.complete"](),

  // ---- todo ----
  "todo.add": () => {
    ensureTodo();
    const t = store.thread.todo;
    t.items.push({ id: store.nextSeq("td"), label: "Fold review feedback into the handoff", state: "pending" });
    store.emit("work");
  },
  "todo.complete": () => {
    ensureTodo();
    const item = store.thread.todo.items.find((i) => i.state !== "complete");
    if (item) store.setTodoState(item.id, "complete");
  },
  "todo.reopen": () => {
    ensureTodo();
    const done = [...store.thread.todo.items].reverse().find((i) => i.state === "complete");
    if (done) store.setTodoState(done.id, "pending");
  },
  "todo.block": () => {
    ensureTodo();
    const item = store.thread.todo.items.find((i) => i.state === "pending");
    if (item) store.setTodoState(item.id, "blocked");
  },

  // ---- subagent ----
  "subagent.spawn": () => {
    const t = store.thread;
    if (!t.subagentGroups.length) V1["subagent.all_states"]();
    else {
      const g = t.subagentGroups[0];
      g.agents.push({ name: "Handoff writer", task: "Draft the impact handoff", currentActivity: "Queued", status: "waiting", workedSeconds: 0, route: "Fable 5 · Platyr — API key" });
      store.recountSubagents(g);
      store.emit("work");
    }
  },
  "subagent.queue": () => {
    const g = (store.thread.subagentGroups || [])[0];
    if (!g) return;
    const a = g.agents.find((x) => x.status === "working");
    if (a) store.setSubagentStatus(g.id, a.name, "waiting", "Queued — capacity window");
  },
  "subagent.progress": () => {
    const g = (store.thread.subagentGroups || [])[0];
    if (!g) return;
    const a = g.agents.find((x) => x.status === "working") || g.agents.find((x) => x.status === "waiting");
    if (a) store.setSubagentStatus(g.id, a.name, "working", "Comparing adapter capability evidence");
  },
  "subagent.complete": () => {
    const g = (store.thread.subagentGroups || [])[0];
    if (!g) return;
    const a = g.agents.find((x) => x.status === "working");
    if (a) store.setSubagentStatus(g.id, a.name, "complete", "Done — results attached to the run");
  },
  "subagent.fail": () => {
    const g = (store.thread.subagentGroups || [])[0];
    if (!g) return;
    const a = g.agents.find((x) => x.status === "working") || g.agents.find((x) => x.status === "waiting") || g.agents[g.agents.length - 1];
    if (a) store.failSubagent(g.id, a.name, "Failed — reduced-motion probe crashed the review pass");
  },
  "subagent.retry": () => {
    const g = (store.thread.subagentGroups || [])[0];
    if (!g) return;
    const a = g.agents.find((x) => x.status === "failed");
    if (a) store.retrySubagent(g.id, a.name);
  },

  // ---- activity (eight v2 kinds) ----
  ...Object.fromEntries(Object.entries(ACTIVITY_PHASES).map(([kind, ph]) => [
    `activity.${kind}`,
    () => store.injectTurnPhase(store.state.currentThreadId, kind, ph.label, ph.items),
  ])),

  // ---- diff ----
  "diff.create": () => {
    const t = store.thread;
    if (t.id === "thread-19") {
      if (!t.diffGroups.some((d) => d.id === SCENARIO_V2_DIFF.id)) t.diffGroups.push(JSON.parse(JSON.stringify(SCENARIO_V2_DIFF)));
      store.emit("work");
    } else V1["diff.create"]();
  },
  "diff.update": () => V1["diff.update"](),
  "diff.open": () => {
    const t = store.thread;
    const target = (t.artifacts || []).find((a) => a.kind === "multi-file diff");
    if (target) store.openArtifact(target.id);
    else store.openArtifact("art-diff");
  },

  // ---- artifact ----
  "artifact.loading": () => V1["artifact.loading"](),
  "artifact.ready": () => V1["artifact.ready"](),
  "artifact.switch": () => {
    const t = store.thread;
    const list = t.artifacts || [];
    if (!list.length) return;
    const idx = list.findIndex((a) => a.id === store.state.artifact.openId);
    store.openArtifact(list[(idx + 1) % list.length].id);
  },
  "artifact.error": () => V1["artifact.error"](),
  "artifact.close": () => store.closeArtifact(),

  // ---- decision ----
  "decision.approval_open": () => V1["approval.request"](),
  "decision.details": () => {
    const a = latestOpenDecision("approval");
    const d = a || latestOpenDecision("warning");
    if (d) { d.detailsOpen = !d.detailsOpen; store.emit(a ? "approval" : "warning"); }
  },
  "decision.approve": () => {
    const a = latestOpenDecision("approval");
    if (a) store.resolveApproval(a.id, "Approve");
  },
  "decision.deny": () => {
    const a = latestOpenDecision("approval");
    if (a) store.resolveApproval(a.id, "Deny");
  },
  "decision.branch": () => {
    const w = latestOpenDecision("warning");
    if (w && w.kind === "route") store.resolveWarning(w.id, "Branch with new model");
  },

  // ---- thread ----
  "thread.send_request": () => V1["thread.request"](),
  "thread.receive_response": () => store.addReceipt({
    kind: "thread-result",
    title: "Response received",
    detail: "Open conversation, Add passage to context, Branch from this point, and Copy link are available on the result.",
  }),
  "thread.spawn_related": () => V1["thread.spawn"](),
  "thread.branch": () => V1["thread.branch"](),

  // ---- system ----
  "system.port_collision": () => store.raiseWarning({
    threadId: store.state.currentThreadId,
    kind: "resource",
    title: `Port ${SCENARIO_V2_COLLISION.requested} is held by the ${SCENARIO_V2_COLLISION.occupiedBy}`,
    body: `The verification lane wants ${SCENARIO_V2_COLLISION.requested}. PM will not stop a process this Goal does not own. Safe alternative: ${SCENARIO_V2_COLLISION.safeAlternative}.`,
    actions: [`Use ${SCENARIO_V2_COLLISION.safeAlternative}`, "Wait", "Details"],
    detail: "Typed lease conflict: the requested port is leased to another owner with a live heartbeat. Using the safe alternative updates this lane's lease only.",
  }),
  "system.worktree_collision": () => V1["resource.worktree_collision"](),
  "system.reset": () => V1["scenario.reset"](),
};

// Scenario v2 verbatim warning surfacing (route cache, video vision, capacity).
V2_TRIGGERS["warning.cache_replay"] = () => store.raiseWarning({
  threadId: store.state.currentThreadId,
  kind: "route",
  title: "Provider cache will not follow this switch",
  body: SCENARIO_V2_WARNINGS[0],
  actions: ["Continue here", "Branch with new model", "Start new chat", "Cancel", "Details"],
  detail: "Replaying without the provider cache re-sends the full effective context on the first turn of the new route.",
});
V2_TRIGGERS["warning.video_route"] = () => store.raiseWarning({
  threadId: store.state.currentThreadId,
  kind: "route",
  title: "This model cannot inspect video natively",
  body: SCENARIO_V2_WARNINGS[1],
  actions: ["Continue here", "Branch with new model", "Cancel", "Details"],
  detail: "Frame extraction is a bounded PM transformation with retained lineage; the configured vision route crosses a provider boundary and needs consent.",
});
V2_TRIGGERS["warning.capacity"] = () => store.raiseWarning({
  threadId: store.state.currentThreadId,
  kind: "resource",
  title: "Included usage will not finish eight specialists",
  body: SCENARIO_V2_WARNINGS[2],
  actions: ["Run two at a time", "Wait for reset", "Details"],
  detail: "Sustainable pace: two concurrent specialists in waves with an explicit synthesis reserve. Required roles never silently disappear.",
});

Object.assign(TRIGGERS, V2_TRIGGERS);

export function fireTrigger(id) {
  const fn = TRIGGERS[id];
  if (fn) { fn(); return true; }
  return false;
}

// ---------------------------------------------------------------------------
// The showcase story — the packet's 25 required story beats, played in order
// on the primary showcase thread (thread-17, the provider-routing refactor).
// Deterministic pacing; every beat is one of the deterministic triggers plus
// two scripted sends (offline queue and redirect) driven through the store.
// ---------------------------------------------------------------------------
export const SHOWCASE_STORY = [
  { beat: "long_user_request", label: "The provider-redesign request opens the work", run: () => { store.selectThread("thread-19"); } },
  { beat: "goal_start", label: "The Goal starts — Audit phase", run: () => { store.setGoalStatus("Running"); } },
  { beat: "bsd_auto_evaluation", label: "BSD Auto evaluates a risky phase", run: () => TRIGGERS["bsd.auto_active"]() },
  { beat: "history_retrieval", label: "Prior history is retrieved from another thread", run: () => TRIGGERS["thread.send_request"]() },
  { beat: "question_prepare_open", label: "The redesign questions open", run: () => { store.promoteQueuedQuestionnaire(); }, wait: 1600 },
  { beat: "question_answer_skip_revisit_submit", label: "Answer, skip the cache question, submit", run: () => { TRIGGERS["question.select"](); setTimeout(() => { TRIGGERS["question.next"](); TRIGGERS["question.skip"](); }, 400); setTimeout(() => TRIGGERS["question.submit"](), 1000); }, wait: 2800 },
  { beat: "eight_todos", label: "Eight named tasks on the board", run: () => { /* thread-19 ships its eight scenario todos */ store.emit("work"); } },
  { beat: "plans_code_web_browser_activity", label: "Search, read, fetch, browser, edit, test phases", run: () => { store.setDraft("Run the audit lane now"); store.sendMessage(); }, wait: 16000 },
  { beat: "port_or_worktree_collision", label: "Port 4173 collision caught safely", run: () => TRIGGERS["system.port_collision"]() },
  { beat: "three_child_agents_different_routes", label: "Three specialists on Fable, Kimi K3, Qwen 3.8", run: () => { const g = store.thread.subagentGroups[0]; if (g) { store.setSubagentStatus(g.id, "Interface systems auditor", "working", "Auditing the picker"); } } },
  { beat: "capacity_two_concurrent_one_queued", label: "Capacity: two at a time with synthesis reserve", run: () => TRIGGERS["warning.capacity"]() },
  { beat: "child_complete_block_retry", label: "A child fails and retries", run: () => { TRIGGERS["subagent.fail"](); setTimeout(() => TRIGGERS["subagent.retry"](), 900); }, wait: 3200 },
  { beat: "multi_phase_activity", label: "The live locus advances phase by phase", run: () => TRIGGERS["activity.generate"](), wait: 2200 },
  { beat: "material_route_warning", label: "Cache-replay route warning asks first", run: () => TRIGGERS["warning.cache_replay"]() },
  { beat: "attachment_resolution", label: "A video attachment needs the vision route", run: () => { store.addAttachment({ id: "att-video-t19", name: "picker-walkthrough.mp4", size: "96 MB", cls: "Alternate model", detail: SCENARIO_V2_WARNINGS[1] }); TRIGGERS["warning.video_route"](); } },
  { beat: "three_file_diff", label: "The manifest's three-file change set lands", run: () => TRIGGERS["diff.create"]() },
  { beat: "four_artifacts", label: "Four artifacts: diff, preview, test report, handoff", run: () => TRIGGERS["artifact.ready"](), wait: 1400 },
  { beat: "artifact_open_left", label: "The change set opens left of Chat", run: () => TRIGGERS["diff.open"](), wait: 1400 },
  { beat: "history_pinned_with_artifact", label: "History pins beside the artifact", run: () => TRIGGERS["history.pin_full"]() },
  { beat: "offline_queued_send_replay_once", label: "Offline: queued send replays exactly once", run: () => { TRIGGERS["network.offline"](); setTimeout(() => { store.setDraft("Queued while offline — deliver exactly once"); store.sendMessage(); }, 500); setTimeout(() => TRIGGERS["network.reconnect"](), 1200); }, wait: 4200 },
  { beat: "active_turn_redirect", label: "A correction redirects the active turn", run: () => TRIGGERS["turn.redirect"](), wait: 2600 },
  { beat: "thread_request_and_response", label: "Another thread answers the request", run: () => TRIGGERS["thread.receive_response"]() },
  { beat: "goal_pause_resume_replan_block_recover_complete", label: "Goal: pause, resume, update, replan, block, recover, complete", run: () => { TRIGGERS["goal.pause"](); setTimeout(() => TRIGGERS["goal.resume"](), 400); setTimeout(() => TRIGGERS["goal.update"](), 800); setTimeout(() => TRIGGERS["goal.replan"](), 1300); setTimeout(() => TRIGGERS["goal.blocked"](), 1900); setTimeout(() => TRIGGERS["goal.recover"](), 2500); setTimeout(() => TRIGGERS["goal.complete"](), 3100); }, wait: 4000 },
  { beat: "final_receipt", label: "Completion — verified, worked for 1m 34s", run: () => { store.setDraft("Close it out with the verification lane"); store.sendMessage(); }, wait: 6000 },
  { beat: "branch_or_reanswer", label: "A branch preserves the source thread", run: () => TRIGGERS["thread.branch"]() },
];

let showcaseTimer = null;
export function runShowcase(onStep) {
  stopShowcase();
  let i = 0;
  const step = () => {
    if (i >= SHOWCASE_STORY.length) { if (onStep) onStep(null); showcaseTimer = null; return; }
    const s = SHOWCASE_STORY[i];
    if (onStep) onStep({ index: i, total: SHOWCASE_STORY.length, label: s.label });
    try { s.run(); } catch (e) { /* a beat must never halt the story */ }
    i += 1;
    showcaseTimer = setTimeout(step, s.wait || 1500);
  };
  step();
}
export function stopShowcase() {
  if (showcaseTimer) { clearTimeout(showcaseTimer); showcaseTimer = null; }
}

export function triggerCatalog() {
  return Object.keys(TRIGGERS).map((id) => ({ id, label: TRIGGER_LABELS[id] || id }));
}
