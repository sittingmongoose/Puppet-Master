/* Deterministic demo/test trigger registry (DEMO_TRIGGER_CONTRACT v2).
   These are harness controls, not production toolbar commands. */
window.PMChatDemoTriggers = (() => {
  let seq = 1;

  function ctx() {
    const api = window.PMChatHost && window.PMChatHost.api;
    if (!api) return null;
    return { store: api.store, env: api.env, winId: api.env.winId ? api.env.winId() : "w1" };
  }

  function key(c) { return c.store.activeKey(); }

  function activeGroup(c) {
    const eff = c.store.effectiveSettings(key(c));
    return c.store.catalog().find(p => p.provider === eff.provider) || null;
  }

  function injectQuest(c, payload) {
    const t = c.store.demoThread(key(c));
    const q = {
      id: "q-rt-" + (seq++), status: "incomplete", createdAt: new Date().toISOString(), currentQuestionIndex: 0,
      questions: (payload && payload.questions) || [
        { id: "a", prompt: "Which surface should this decision live in?", kind: "single select", required: true, options: ["Settings", "Chat", "Both"] },
        { id: "b", prompt: "How cautious should the default be?", kind: "single select", required: false, options: ["Ask every time", "Remember per thread", "Remember globally"] },
        { id: "c", prompt: "Add a note for the handoff?", kind: "freeform", required: false }
      ]
    };
    c.store.mutate(() => { (t.questionnaires = t.questionnaires || []).push(q); });
    return q.id;
  }

  const T = {
    "history.peek": (c, p) => { c.store.setPin(c.winId, false); },
    "history.pin_compact": (c, p) => { c.store.setPin(c.winId, true); c.store.setPinMode(c.winId, "compact"); },
    "history.pin_full": (c, p) => { c.store.setPin(c.winId, true); c.store.setPinMode(c.winId, "full"); },
    "history.unpin": (c, p) => { c.store.setPin(c.winId, false); },
    "history.switch_thread": (c, p) => { c.store.switchThread(p && p.id ? p.id : "thread-02"); },

    "question.prepare": (c, p) => injectQuest(c, p),
    "question.open": (c, p) => injectQuest(c, p),
    "question.select": (c, p) => {
      const q = c.store.activeQuestionnaire(key(c));
      if (!q) return;
      const question = q.questions[c.store.questIndex(q, key(c))];
      c.store.questSetAnswer(q, question, question.kind === "multi select" ? [question.options[0]] : [question.options[p && p.option != null ? p.option : 0]]);
    },
    "question.next": (c, p) => { const q = c.store.activeQuestionnaire(key(c)); if (q) c.store.questGoTo(q, c.store.questIndex(q, key(c)) + 1); },
    "question.validation_error": (c, p) => { const q = c.store.activeQuestionnaire(key(c)); if (q) return c.store.questValid(q) ? "valid" : "invalid"; },
    "question.skip": (c, p) => { const q = c.store.activeQuestionnaire(key(c)); if (q) c.store.questSkip(q); },
    "question.cancel": (c, p) => { const q = c.store.activeQuestionnaire(key(c)); if (q) c.store.questCancel(q); },
    "question.submit": (c, p) => {
      const q = c.store.activeQuestionnaire(key(c));
      if (!q) return;
      q.questions.forEach(x => {
        if (x.kind !== "freeform") c.store.questSetAnswer(q, x, [x.options[0]]);
      });
      c.store.questSubmit(q);
    },

    "goal.start": (c, p) => {
      const t = c.store.demoThread(key(c));
      c.store.mutate(() => {
        if (!t.activeGoal) {
          t.activeGoal = {
            id: "goal-rt-" + (seq++), title: (p && p.title) || "Session goal", objective: (p && p.title) || "Demonstrate goal lifecycle",
            status: "running", workedSeconds: 0, totalElapsedSeconds: 0, canEdit: true, canPause: true, canResume: true, canStop: true, canClear: true,
            phases: ["Audit", "Implement", "Verify"], progress: { complete: 0, total: 3, subgoalsActive: 0 }
          };
        }
        const st = c.store.thread(key(c));
        st.goalCleared = false; st.goalStatus = null; st.goalPhaseIdx = 0;
      });
    },
    "goal.progress": (c, p) => { c.store.goalAdvance(key(c)); const t = c.store.demoThread(key(c)); if (t.activeGoal && t.activeGoal.progress) c.store.mutate(() => { t.activeGoal.progress.complete = Math.min(t.activeGoal.progress.total, t.activeGoal.progress.complete + 1); }); },
    "goal.pause": (c, p) => c.store.goalAct(key(c), "pause"),
    "goal.resume": (c, p) => c.store.goalAct(key(c), "resume"),
    "goal.update": (c, p) => c.store.goalSaveObjective(key(c), (p && p.text) || "Updated objective · Compact Now must never rewrite the canonical transcript."),
    "goal.replan": (c, p) => c.store.goalSaveObjective(key(c), (p && p.text) || "Replanned objective after material edit."),
    "goal.blocked": (c, p) => c.store.mutate(() => { c.store.thread(key(c)).goalStatus = "blocked"; }),
    "goal.complete": (c, p) => c.store.mutate(() => { c.store.thread(key(c)).goalStatus = "complete"; }),

    "todo.add": (c, p) => c.store.todoAdd(key(c), (p && p.label) || "New task from harness"),
    "todo.complete": (c, p) => { const td = c.store.todoList(key(c)); const it = td && td.items.find(x => x.state !== "complete"); if (it) c.store.todoSetState(key(c), it.id, "complete"); },
    "todo.reopen": (c, p) => { const td = c.store.todoList(key(c)); const it = td && td.items.slice().reverse().find(x => x.state === "complete"); if (it) c.store.todoSetState(key(c), it.id, "pending"); },
    "todo.block": (c, p) => { const td = c.store.todoList(key(c)); const it = td && td.items.find(x => x.state === "pending" || x.state === "running"); if (it) c.store.todoSetState(key(c), it.id, "blocked"); },

    "subagent.spawn": (c, p) => c.store.subagentSpawn(key(c), { name: (p && p.name) || "Harness specialist " + seq, task: (p && p.task) || "Scoped research", currentActivity: "Queued", route: "Qwen 3.8" }),
    "subagent.queue": (c, p) => c.store.subagentSetStatus(key(c), lastAgent(c), "queued"),
    "subagent.progress": (c, p) => c.store.subagentSetStatus(key(c), lastAgent(c), "running"),
    "subagent.complete": (c, p) => c.store.subagentSetStatus(key(c), lastAgent(c), "complete"),
    "subagent.fail": (c, p) => c.store.subagentSetStatus(key(c), lastAgent(c), "failed"),
    "subagent.retry": (c, p) => c.store.subagentSetStatus(key(c), lastAgent(c), "retrying"),

    "activity.thinking_summary": (c, p) => c.store.activityAdvance(key(c), { kind: "thought", label: "Thinking for 2s", summary: (p && p.text) || "Concise user-visible rationale." }),
    "activity.search": (c, p) => c.store.activityAdvance(key(c), { kind: "exploration", label: "Searched 6 related threads", count: 6 }),
    "activity.read": (c, p) => c.store.activityAdvance(key(c), { kind: "exploration", label: "Read 7 plan and concept files", count: 7, items: ["Plans/assistant-chat-design.md", "threads/provider-selector.js"] }),
    "activity.fetch": (c, p) => c.store.activityAdvance(key(c), { kind: "fetch", label: "Fetched provider docs", count: 2 }),
    "activity.browser": (c, p) => c.store.activityAdvance(key(c), { kind: "browser", label: "Checked pinning at 4 widths", count: 4 }),
    "activity.test": (c, p) => c.store.activityAdvance(key(c), { kind: "completion", label: "Passed interaction checks" }),
    "activity.edit": (c, p) => c.store.activityAdvance(key(c), { kind: "edit", label: "Made 1 edit", added: 24, removed: 8, items: ["threads/provider-selector.js"] }),
    "activity.generate": (c, p) => c.store.activityAdvance(key(c), { kind: "generate", label: "Generating assets — 2 images", count: 2 }),

    "diff.create": (c, p) => c.store.diffCreate(key(c), { label: (p && p.label) || "Harness change set", files: [{ path: "threads/access-controls.css", added: 12, removed: 4, status: "modified" }] }),
    "diff.update": (c, p) => { const g = c.store.diffGroups(key(c))[0]; if (g) c.store.diffUpdate(key(c), g.id, g.files[0].path, 9, 3); },
    "diff.open": (c, p) => { const g = c.store.diffGroups(key(c))[0]; if (g) openDiff(c, g); },

    "artifact.loading": (c, p) => withArt(c, p, (id) => c.store.artSetStatus(key(c), id, "loading", false)),
    "artifact.ready": (c, p) => withArt(c, p, (id) => c.store.artSetStatus(key(c), id, "ready", true)),
    "artifact.switch": (c, p) => { const arts = c.store.threadArtifacts(key(c)); if (arts.length) c.store.artSwitch(c.winId, arts[(p && p.index) || 0 % arts.length].id); },
    "artifact.error": (c, p) => withArt(c, p, (id) => c.store.artSetStatus(key(c), id, "error", false)),
    "artifact.close": (c, p) => c.store.artClose(c.winId),

    "decision.approval_open": (c, p) => c.store.approvalInject(key(c), { question: (p && p.question) || "Run 2 commands?", scope: "Workspace only · Needed to run the test suite", details: [{ k: "Commands", v: "cargo test · cargo fmt --check" }, { k: "Persistence", v: "none" }], safer: "run with --offline" }),
    "decision.details": (c, p) => { const s = c.store.thread(key(c)); const a = s.approvals.find(x => !x.resolved); if (a) c.store.mutate(() => { s.expandedByIds["ap:" + a.id] = true; }); },
    "decision.approve": (c, p) => { const s = c.store.thread(key(c)); const a = s.approvals.find(x => !x.resolved); if (a) c.store.approvalResolve(key(c), a.id, "allow-once"); },
    "decision.deny": (c, p) => { const s = c.store.thread(key(c)); const a = s.approvals.find(x => !x.resolved); if (a) c.store.approvalResolve(key(c), a.id, "deny"); },
    "decision.branch": (c, p) => c.store.warningInject(key(c), { tier: "confirm", kind: "route", text: "Switching models replays this conversation without the current provider cache.", detail: "Requested route uses a separate paid connection; cache and pricing do not carry over.", pending: { provider: "Anthropic", model: "Opus 5" }, choices: ["Continue here", "Switch here", "Branch with this model", "Start new chat", "Cancel"] }),

    "thread.send_request": (c, p) => c.store.threadRequestSend((p && p.target) || "thread-04", (p && p.text) || "Please quote the routing decisions table."),
    "thread.receive_response": (c, p) => { const s = c.store.thread(key(c)); const r = s.threadRequests.find(x => x.status === "sent"); if (r) c.store.threadRequestReceive(key(c), r.id, "Response attached with provenance; bounded range only."); },
    "thread.spawn_related": (c, p) => c.store.spawnRelated(key(c), (p && p.title) || "Related research", (p && p.text) || "Spawned to research this branch in parallel."),
    "thread.branch": (c, p) => c.store.branchFrom(key(c), (p && p.msgId) || null, { switchTo: !!(p && p.switchTo) }),

    "system.port_collision": (c, p) => c.store.warningInject(key(c), { tier: "confirm", kind: "collision", text: "Port 4173 is owned by the Usage concept visual-test server.", detail: "Safe alternative is 4174; taking it does not disturb the other worktree.", choices: ["Use port 4174", "Cancel"] }),
    "system.worktree_collision": (c, p) => c.store.warningInject(key(c), { tier: "confirm", kind: "collision", text: "Another worktree is writing to components/billing/PlanCard.tsx.", detail: "The other writer started 6 minutes ago. Safe action: queue this edit behind theirs or edit a copy.", choices: ["Queue behind writer", "Edit a copy", "Cancel"] }),
    "system.cross_project": (c, p) => c.store.crossProjectWarn(key(c), (p && p.project) || "Usage redesign"),
    "system.compact_now": (c, p) => c.store.compactNow(key(c)),
    "system.redirect": (c, p) => c.store.redirectTurn(key(c), (p && p.text) || "Focus on the access profiles first."),
    "system.crew": (c, p) => c.store.crewSet(key(c), { title: "Harness crew", summary: "2 requested · 1 concurrent · 2 waves", members: [ { role: "Reviewer", route: "Qwen 3.8 · workspace key", state: "running" }, { role: "Researcher", route: "Kimi K3 · developer key", state: "queued" } ], note: "Scoped to this thread." }),

    // ---- final cumulative packet triggers (v3 domains) ----
    "bsd.auto_eval": (c, p) => { c.store.bsdEvalStart(key(c)); setTimeout(() => c.store.bsdResolve("silent"), 900); },
    "bsd.advice": (c, p) => { c.store.bsdEvalStart(key(c)); setTimeout(() => c.store.bsdResolve("advice", (p && p.text) || "Consider splitting this change into two reviewable steps before the next turn."), 900); },
    "bsd.timeout": (c, p) => { c.store.bsdEvalStart(key(c)); setTimeout(() => c.store.bsdResolve("timeout"), 900); },
    "bsd.unavailable": (c, p) => c.store.bsdResolve("unavailable"),
    "bsd.set_on": (c, p) => c.store.bsdSet("on", "thread"),
    "bsd.set_off": (c, p) => c.store.bsdSet("off", "thread"),

    "conn.offline": (c, p) => c.store.connSetStatus("offline"),
    "conn.queue_send": (c, p) => c.store.connQueue({ threadKey: key(c), text: (p && p.text) || "Queued while offline — will send on reconnect.", attachments: [] }),
    "conn.reconnect": (c, p) => c.store.connReconnect(),
    "conn.snapshot": (c, p) => c.store.connSnapshot("Snapshot catch-up: history synced from Home Server."),
    "conn.server_work": (c, p) => c.store.connServerWork(key(c)),

    "notify.push": (c, p) => c.store.notifyPush({ title: (p && p.title) || "Goal needs approval", body: (p && p.body) || "Two commands are waiting on your decision.", kind: (p && p.kind) || "approval", threadKey: key(c) }),
    "notify.open_inbox": (c, p) => { window.dispatchEvent(new CustomEvent("pmq-open-inbox")); },

    "attachment.unsupported": (c, p) => {
      const id = (p && p.id) || "att-demo-video";
      const k = key(c);
      const st = c.store.thread(k);
      c.store.mutate(() => {
        if (!st.draft.attachments.some(x => (typeof x === "string" ? x : x.id) === id)) st.draft.attachments.push(id);
      });
      c.store.attachSetRoute(k, id, "unsupported", false);
      c.store.warningInject(k, { tier: "confirm", kind: "attachment", text: "This model cannot read video.", detail: "The attachment arrived on a text-only route. Extract the frames in PM, or route the original to an alternate model with your consent.", pendingAttach: id, choices: ["Cancel", "Extract in PM", "Use Gemini"] });
    },
    "attachment.alternate_consent": (c, p) => {
      const id = (p && p.id) || "att-demo-video";
      c.store.warningInject(key(c), { tier: "confirm", kind: "attachment", text: "Route the original to an alternate model?", detail: "Consent is required once; PM keeps the lineage from the original attachment.", pendingAttach: id, choices: ["Cancel", "Consent once"] });
    },

    "ops.port_conflict": (c, p) => {
      c.store.opsAddPort(key(c), { port: 3000, owner: "checkout redesign in another worktree", threadKey: key(c), worktree: "checkout-redesign", suggestion: 3001 });
      c.store.warningInject(key(c), { tier: "confirm", kind: "collision", text: "Port 3000 is owned by checkout redesign in another worktree.", detail: "Requested 3000 for the visual-test server. The safe alternative is 3001; taking it does not disturb the other worktree.", choices: ["Use 3001", "Cancel"] });
    },
    "ops.worktree_waiting": (c, p) => c.store.opsAddWorktree(key(c), { name: "checkout-redesign", state: "waiting-writer", owner: "checkout redesign" }),
    "ops.session_list": (c, p) => {
      c.store.opsAddSession(key(c), { kind: "browser", label: "Browser Program capture · smoke pass", state: "running" });
      c.store.opsAddSession(key(c), { kind: "debug", label: "Debug session · provider-selector.js", state: "attached" });
      c.store.opsAddSession(key(c), { kind: "backup", label: "Backup · nightly snapshot", state: "complete" });
    },

    "provider.setup_required": (c, p) => { const g = activeGroup(c); if (g) c.store.mutate(() => { g.setupState = "install-required"; }); },
    "provider.update_available": (c, p) => { const g = activeGroup(c); if (g) c.store.mutate(() => { g.setupState = "update-available"; }); },

    "capacity.forecast": (c, p) => c.store.warningInject(key(c), { tier: "confirm", kind: "capacity", text: "Requested specialists: 6 · Recommended concurrent: 2 · 3 waves.", detail: "Reason: provider allowance and verification reserve. Required independent roles cannot be dropped. Forecast, not guarantee.", forecast: { requested: 6, recommended: 2, waves: 3, reason: "provider allowance and verification reserve" }, choices: ["Start waves", "Cancel"] }),
    "system.reset": (c, p) => {
      try { localStorage.removeItem(window.PMChatStore.STORAGE_KEY); } catch (e) {}
      location.reload();
    }
  };

  function lastAgent(c) {
    const s = c.store.thread(key(c));
    if (s.subagentExtra.length) return s.subagentExtra[s.subagentExtra.length - 1].name;
    const g = c.store.subagentGroups(key(c));
    return g.length && g[0].agents.length ? g[0].agents[g[0].agents.length - 1].name : null;
  }

  function withArt(c, p, fn) {
    let arts = c.store.threadArtifacts(key(c));
    if (!arts.length) {
      const s = c.store.thread(key(c));
      c.store.mutate(() => { s.extraArtifacts.push({ id: "art-rt-" + (seq++), title: "Harness artifact", kind: "document", projectPath: "Tastebook" }); });
      arts = c.store.threadArtifacts(key(c));
    }
    const id = (p && p.id) || arts[0].id;
    fn(id);
    c.store.artOpen(c.winId, id);
  }

  function openDiff(c, g) {
    const s = c.store.thread(key(c));
    let art = c.store.threadArtifacts(key(c)).find(x => x.id === "art-" + g.id);
    if (!art) {
      art = { id: "art-" + g.id, title: g.label, kind: "multi_file_diff", files: g.files, projectPath: "Tastebook" };
      c.store.mutate(() => { s.extraArtifacts.push(art); });
    }
    c.store.artOpen(c.winId, art.id);
  }

  function apply(name, payload) {
    const c = ctx();
    if (!c) return { ok: false, error: "host not ready" };
    const fn = T[name];
    if (!fn) return { ok: false, error: "unknown trigger " + name };
    const out = fn(c, payload || {});
    return { ok: true, result: out == null ? null : out };
  }

  window.__pmDemoTrigger = apply;
  window.__pmDemoTriggers = () => Object.keys(T);

  return { apply, names: () => Object.keys(T) };
})();
