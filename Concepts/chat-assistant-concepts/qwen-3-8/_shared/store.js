window.PMChatStore = (() => {
  const STORAGE_KEY = "pmc-qwen38.store";
  const REV_CAP = 24;

  const PROVIDER_MODEL = {
    Anthropic: "Opus 5",
    OpenAI: "GPT-5.6 Pro",
    Alibaba: "Qwen 3.8",
    Moonshot: "Kimi K3"
  };
  const MODEL_PERSONA = {
    "Opus 5": "Product designer",
    "GPT-5.6 Pro": "Systems reviewer",
    "Qwen 3.8": "Interface engineer",
    "Kimi K3": "Research analyst"
  };

  function blankThreadState(thread) {
    return {
      loadedCount: Math.min(thread.initialVisibleMessageCount || 50, thread.messages.length),
      collapsedIds: [],
      expandedByIds: {},
      expandedActivity: [],
      expandedThoughts: [],
      expandedSubagents: [],
      goalExpanded: false,
      goalCleared: false,
      goalStatus: null,
      goalObjective: null,
      replanCount: 0,
      todoCollapsed: false,
      lens: { mode: "off", selected: [], applied: { mute: [], focus: [], subcompact: [] } },
      draft: { text: "", attachments: [], revisions: [] },
      questIndex: {},
      questSkipped: {},
      questCancelled: [],
      questSubmitted: [],
      scrollAnchorId: null,
      stickToBottom: true,
      searchReturn: null,
      sentMessages: [],
      replyCursor: thread.scriptedReplyCursor || 0,
      typingSince: null,
      settings: null,
      todos: null,
      subagentExtra: [],
      subagentStatus: {},
      goalPhaseIdx: null,
      activityLive: null,
      diffExtra: [],
      artState: {},
      approvals: [],
      warnings: [],
      threadRequests: [],
      restorePoints: [],
      rewindAnchor: null,
      redirectNote: null,
      compactEvents: [],
      spellDisabled: false,
      spellIgnoredDraft: [],
      crew: null,
      extraArtifacts: [],
      attachRoutes: {}
    };
  }

  function create(data) {
    const listeners = new Set();
    let persistTimer = null;
    const state = {
      v: 1,
      session: {
        activeThreadKey: data.threads[0].id,
        provider: "Alibaba",
        model: "Qwen 3.8",
        persona: "Interface engineer",
        mode: "Agent",
        effort: "Medium",
        speed: "Normal",
        access: "Ask for approval",
        keepThoughtExpanded: false,
        favorites: ["Qwen 3.8"],
        recentModels: [],
        spellPersonal: [],
        spellProject: []
      },
      threads: {},
      extraThreads: [],
      running: null,
      ui: { pinnedByWin: {}, pinModeByWin: {}, artwsByWin: {} }
    };

    data.threads.forEach(t => { state.threads[t.id] = blankThreadState(t); });

    let snapshot = null;
    try { snapshot = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (e) { snapshot = null; }
    if (snapshot && snapshot.v === 1 && snapshot.threads) {
      Object.keys(snapshot.threads).forEach(k => {
        const st = state.threads[k];
        const sv = snapshot.threads[k];
        if (!st || !sv) return;
        ["collapsedIds", "expandedByIds", "expandedActivity", "expandedThoughts", "expandedSubagents",
         "goalExpanded", "goalCleared", "goalStatus", "goalObjective", "replanCount", "todoCollapsed",
         "draft", "questIndex", "questSkipped", "questCancelled", "questSubmitted", "sentMessages", "replyCursor",
         "settings", "todos", "subagentExtra", "subagentStatus", "goalPhaseIdx", "activityLive", "diffExtra",
         "artState", "approvals", "warnings", "threadRequests", "restorePoints", "rewindAnchor", "redirectNote",
         "compactEvents", "spellDisabled", "spellIgnoredDraft", "crew", "extraArtifacts", "attachRoutes"
        ].forEach(f => { if (sv[f] !== undefined) st[f] = sv[f]; });
        if (sv.lens) st.lens = Object.assign(st.lens, sv.lens);
      });
      if (snapshot.session) state.session = Object.assign(state.session, snapshot.session);
      if (snapshot.ui) {
        state.ui.pinnedByWin = Object.assign({}, snapshot.ui.pinnedByWin || {});
        state.ui.pinModeByWin = Object.assign({}, snapshot.ui.pinModeByWin || {});
        state.ui.artwsByWin = Object.assign({}, snapshot.ui.artwsByWin || {});
      }
      if (snapshot.extraThreads) state.extraThreads = snapshot.extraThreads;
    }

    data.threads.forEach(t => {
      const st = state.threads[t.id];
      if (t.seedApprovals) st.approvals = t.seedApprovals.map(x => Object.assign({}, x));
      if (t.seedWarnings) st.warnings = t.seedWarnings.map(x => Object.assign({}, x));
      if (t.seedRequests) st.threadRequests = t.seedRequests.map(x => Object.assign({}, x));
      if (t.crew) st.crew = Object.assign({}, t.crew);
      if (t.seedActivityLive) st.activityLive = Object.assign({}, t.seedActivityLive);
    });

    data.threads.forEach(t => {
      const st = state.threads[t.id];
      const sv = snapshot && snapshot.threads && snapshot.threads[t.id];
      if (t.draftState && (!sv || sv.draft === undefined)) {
        st.draft = {
          text: t.draftState.currentText || "",
          attachments: (t.draftState.attachments || []).slice(),
          revisions: (t.draftState.revisionHistory || []).map(r => ({ savedAt: r.savedAt, text: r.text }))
        };
      }
    });

    function cmd(id, payload) { if (window.PMChatCommands) window.PMChatCommands.dispatch(id, payload); }

    const runTimers = [];

    function emit() { listeners.forEach(fn => { try { fn(); } catch (e) { console.error(e); } }); }

    function persist() {
      clearTimeout(persistTimer);
      persistTimer = setTimeout(() => {
        try {
          const { v, session, threads, ui } = state;
          const out = { v, session, threads: {}, ui };
          Object.keys(threads).forEach(k => {
            const t = threads[k];
            out.threads[k] = Object.assign({}, t, { scrollAnchorId: null, typingSince: null });
          });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
        } catch (e) {}
      }, 300);
    }

    function mutate(fn) {
      fn();
      emit();
      persist();
    }

    function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

    function demoThread(key) { return data.threads.find(t => t.id === key) || state.extraThreads.find(t => t.id === key); }
    function allThreads() { return data.threads.concat(state.extraThreads); }
    function thread(key) { return state.threads[key]; }
    function activeKey() { return state.session.activeThreadKey; }

    function messages(key) {
      const t = demoThread(key);
      const st = state.threads[key];
      return t.messages.concat(st ? st.sentMessages : []);
    }

    function loadedMessages(key) {
      const all = messages(key);
      const st = state.threads[key];
      return all.slice(Math.max(0, all.length - st.loadedCount));
    }

    function findMessage(key, msgId) { return messages(key).find(m => m.id === msgId); }

    function lastUserContext(key) {
      const all = messages(key);
      for (let i = all.length - 1; i >= 0; i--) if (all[i].runtime) return all[i].runtime;
      return { provider: "Alibaba", model: "Qwen 3.8", persona: "Interface engineer", mode: "Agent", effort: "Medium", workedSeconds: 0, totalElapsedSeconds: 0, tokenCount: 900, contextUsed: 5000, contextLimit: 128000, estimatedCost: 0.01 };
    }

    const index = [];
    function buildIndex() {
      index.length = 0;
      allThreads().forEach(t => {
        t.messages.forEach((m, i) => index.push({ threadKey: t.id, msgId: m.id, idx: i, body: m.body, lower: m.body.toLowerCase() }));
      });
    }
    buildIndex();

    function liveIndex() {
      const arr = index.slice();
      Object.keys(state.threads).forEach(k => {
        state.threads[k].sentMessages.forEach((m, i) => {
          arr.push({ threadKey: k, msgId: m.id, idx: 100000 + i, body: m.body, lower: m.body.toLowerCase(), sent: true });
        });
      });
      return arr;
    }

    function search(q, scope, threadKey) {
      const needle = (q || "").trim().toLowerCase();
      if (!needle) return [];
      const src = liveIndex().filter(r => r.lower.includes(needle));
      const scoped = scope === "thread" ? src.filter(r => r.threadKey === threadKey) : src;
      return scoped.map(r => {
        const pos = r.lower.indexOf(needle);
        const start = Math.max(0, pos - 42);
        const snippet = (start > 0 ? "…" : "") + r.body.slice(start, pos + needle.length + 58).replace(/\n+/g, " ") + "…";
        return { threadKey: r.threadKey, msgId: r.msgId, idx: r.idx, matchStart: pos, matchEnd: pos + needle.length, snippet };
      }).slice(0, 120);
    }

    function groupedSearch(q) {
      const results = search(q, "all");
      const groups = [];
      const byThread = {};
      results.forEach(r => { (byThread[r.threadKey] = byThread[r.threadKey] || []).push(r); });
      allThreads().forEach(t => {
        if (byThread[t.id]) groups.push({ thread: t, results: byThread[t.id].slice(0, 8), total: byThread[t.id].length });
      });
      return groups;
    }

    function replyFor(key) {
      const t = demoThread(key);
      const st = state.threads[key];
      const ids = t.scriptedReplyIds || [];
      if (!ids.length) return null;
      const id = ids[st.replyCursor % ids.length];
      return data.scriptedReplies.find(r => r.id === id);
    }

    function ensureRunningShape() {
      if (!state.running) return null;
      return state.running;
    }

    function send(text) {
      const key = activeKey();
      const st = state.threads[key];
      const body = String(text == null ? "" : text);
      if (!body.trim() && !st.draft.attachments.length) return false;
        const rt = lastUserContext(key);
        const eff = effectiveSettings(key);
        const worked = st.typingSince ? Math.max(1, Math.round((Date.now() - st.typingSince) / 1000)) : Math.round(Math.random() * 20 + 6);
      const userMsg = {
        id: key + "-sent-u" + (st.sentMessages.filter(m => m.role === "user").length + 1) + "-" + Date.now(),
        role: "user",
        body: body,
        sentAt: new Date().toISOString(),
        runtime: {
          provider: eff.provider,
          model: eff.model,
          persona: eff.persona,
          mode: eff.mode,
          effort: eff.effort,
          workedSeconds: worked,
          totalElapsedSeconds: worked,
          tokenCount: Math.max(40, Math.round(body.length / 3.6)),
          contextUsed: Math.min(rt.contextLimit, rt.contextUsed + 400),
          contextLimit: rt.contextLimit,
          estimatedCost: 0.01
        },
        eligibleForEdit: false,
        collapsedByDefault: false
      };
      mutate(() => {
        st.sentMessages = st.sentMessages.concat([userMsg]);
        if (st.draft.text && st.draft.text !== (st.draft.revisions.length ? st.draft.revisions[st.draft.revisions.length - 1].text : "")) {
          st.draft.revisions = st.draft.revisions.concat([{ savedAt: new Date().toISOString(), text: st.draft.text }]).slice(-REV_CAP);
        }
        st.draft.text = "";
        st.draft.attachments = [];
        st.typingSince = null;
        st.stickToBottom = true;
      });
      startRun(key);
      return true;
    }

    function startRun(key) {
      const reply = replyFor(key);
      if (!reply) return;
      clearRunTimers();
      state.running = {
        threadKey: key,
        replyId: reply.id,
        stepIndex: 0,
        startedAt: Date.now(),
        steps: reply.workingSummarySequence || ["Preparing the scripted response"],
        durations: reply.stepDurationsMs || [700]
      };
      emit();
      scheduleStep(key, reply, 0);
    }

    function scheduleStep(key, reply, i) {
      const dur = (reply.stepDurationsMs || [700])[Math.min(i, (reply.stepDurationsMs || [700]).length - 1)] || 700;
      const t = setTimeout(() => {
        if (!state.running || state.running.threadKey !== key) return;
        if (i + 1 < (reply.workingSummarySequence || []).length) {
          state.running.stepIndex = i + 1;
          emit();
          scheduleStep(key, reply, i + 1);
        } else {
          finishRun(key, reply);
        }
      }, Math.max(240, dur));
      runTimers.push(t);
    }

    function finishRun(key, reply) {
      const st = state.threads[key];
      const msg = {
        id: key + "-sent-a" + (st.sentMessages.filter(m => m.role === "assistant").length + 1) + "-" + Date.now(),
        role: "assistant",
        body: reply.body,
        sentAt: new Date().toISOString(),
        runtime: Object.assign({}, reply.runtime),
        eligibleForEdit: false,
        collapsedByDefault: false
      };
      mutate(() => {
        st.sentMessages = st.sentMessages.concat([msg]);
        st.replyCursor = st.replyCursor + 1;
        state.running = null;
        st.stickToBottom = true;
      });
      clearRunTimers();
    }

    function stopRun() {
      const run = state.running;
      if (!run) return;
      const reply = data.scriptedReplies.find(r => r.id === run.replyId);
      const st = state.threads[run.threadKey];
      const worked = Math.max(1, Math.round((Date.now() - run.startedAt) / 1000));
      const base = lastUserContext(run.threadKey);
      const msg = {
        id: run.threadKey + "-stop-" + Date.now(),
        role: "assistant",
        body: reply ? reply.stopResultBody : "The scripted response was stopped before completion.",
        sentAt: new Date().toISOString(),
        runtime: {
          provider: state.session.provider, model: state.session.model, persona: state.session.persona,
          mode: state.session.mode, effort: state.session.effort,
          workedSeconds: worked, totalElapsedSeconds: worked,
          tokenCount: 0, contextUsed: base.contextUsed, contextLimit: base.contextLimit, estimatedCost: 0
        },
        eligibleForEdit: false,
        collapsedByDefault: false,
        stopped: true
      };
      clearRunTimers();
      mutate(() => {
        st.sentMessages = st.sentMessages.concat([msg]);
        state.running = null;
      });
    }

    function clearRunTimers() { while (runTimers.length) clearTimeout(runTimers.pop()); }

    function workedSeconds(run) {
      return run ? Math.max(0, Math.round((Date.now() - run.startedAt) / 1000)) : 0;
    }

    function isRunning(key) { return state.running && state.running.threadKey === key; }

    function togglePin(winId) {
      mutate(() => {
        state.ui = state.ui || { pinnedByWin: {} };
        state.ui.pinnedByWin = state.ui.pinnedByWin || {};
        state.ui.pinnedByWin[winId] = !state.ui.pinnedByWin[winId];
      });
    }

    function isPinned(winId) {
      return !!(state.ui && state.ui.pinnedByWin && state.ui.pinnedByWin[winId]);
    }

    const lastRunningByThread = {};
    const readyDrawUntil = {};
    function statusForThread(t, running) {
      const key = t.id;
      if (running) {
        lastRunningByThread[key] = true;
        delete readyDrawUntil[key];
        return { glyph: "working", blocked: false, draw: false };
      }
      const st = t.threadState;
      let glyph, blocked = false;
      if (st === "running" || st === "working") glyph = "working";
      else if (st === "blocked") { glyph = "attention"; blocked = true; }
      else if (st === "awaiting question") glyph = "attention";
      else if (st === "paused") glyph = "paused";
      else glyph = "ready";
      if (glyph === "ready" && lastRunningByThread[key]) {
        lastRunningByThread[key] = false;
        readyDrawUntil[key] = Date.now() + 700;
      }
      const draw = glyph === "ready" && !!readyDrawUntil[key] && Date.now() < readyDrawUntil[key];
      return { glyph, blocked, draw };
    }

    function setDraft(text) {
      const st = state.threads[activeKey()];
      if (!st.typingSince && text) st.typingSince = Date.now();
      st.draft.text = text;
      persist();
    }

    function pushRevision() {
      const st = state.threads[activeKey()];
      const text = st.draft.text;
      const last = st.draft.revisions.length ? st.draft.revisions[st.draft.revisions.length - 1].text : null;
      if (!text || text === last) return;
      st.draft.revisions = st.draft.revisions.concat([{ savedAt: new Date().toISOString(), text }]).slice(-REV_CAP);
      persist();
    }

    function restoreRevision(idx) {
      const st = state.threads[activeKey()];
      const rev = st.draft.revisions[idx];
      if (!rev) return;
      mutate(() => { st.draft.text = rev.text; });
      cmd("cmd.composer.draft.restore", { revision_index: idx });
    }

    function clearDraft() {
      const st = state.threads[activeKey()];
      mutate(() => {
        if (st.draft.text) {
          st.draft.revisions = st.draft.revisions.concat([{ savedAt: new Date().toISOString(), text: st.draft.text }]).slice(-REV_CAP);
        }
        st.draft.text = "";
      });
    }

    function activeQuestionnaire(key) {
      const t = demoThread(key);
      const st = state.threads[key];
      const quests = (t.questionnaires || []).slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      for (const q of quests) {
        if (st.questSubmitted.includes(q.id) || st.questCancelled.includes(q.id)) continue;
        return q;
      }
      return null;
    }

    function questRecords(key) {
      const t = demoThread(key);
      const st = state.threads[key];
      return (t.questionnaires || []).filter(q => st.questSubmitted.includes(q.id) || st.questCancelled.includes(q.id));
    }

    function questIndex(quest, key) {
      const st = state.threads[key || activeKey()];
      if (st.questIndex[quest.id] == null) st.questIndex[quest.id] = quest.currentQuestionIndex || 0;
      return st.questIndex[quest.id];
    }

    function questAnswer(quest, q) {
      const st = state.threads[activeKey()];
      st.questIndex[quest.id] = st.questIndex[quest.id];
      const answers = (st.questAnswers = st.questAnswers || {});
      const qa = (answers[quest.id] = answers[quest.id] || {});
      if (!qa[q.id]) {
        qa[q.id] = q.kind === "freeform" ? { draft: q.draft || "" } : { selected: (q.selected || []).slice() };
      }
      return qa[q.id];
    }

    function questSetAnswer(quest, q, value) {
      mutate(() => {
        const ans = questAnswer(quest, q);
        if (q.kind === "freeform") ans.draft = value;
        else ans.selected = value;
      });
    }

    function questValid(quest) {
      return quest.questions.every(q => {
        if (!q.required) return true;
        const ans = questAnswer(quest, q);
        return q.kind === "freeform" ? true : (ans.selected && ans.selected.length > 0);
      });
    }

    function questGoTo(quest, idx) {
      const key = activeKey();
      mutate(() => {
        const st = state.threads[key];
        st.questIndex[quest.id] = Math.max(0, Math.min(quest.questions.length - 1, idx));
      });
    }

    function questSkip(quest) {
      const key = activeKey();
      const idx = questIndex(quest, key);
      mutate(() => {
        const st = state.threads[key];
        (st.questSkipped[quest.id] = st.questSkipped[quest.id] || []);
        const qid = quest.questions[idx].id;
        if (!st.questSkipped[quest.id].includes(qid)) st.questSkipped[quest.id].push(qid);
        if (idx < quest.questions.length - 1) st.questIndex[quest.id] = idx + 1;
      });
      cmd("cmd.questionnaire.skip", { questionnaire_id: quest.id });
    }

    function questSubmit(quest) {
      if (!questValid(quest)) return;
      mutate(() => {
        const st = state.threads[activeKey()];
        st.questSubmitted = st.questSubmitted.concat([quest.id]);
      });
      cmd("cmd.questionnaire.submit", { questionnaire_id: quest.id });
    }

    function questCancel(quest) {
      mutate(() => {
        const st = state.threads[activeKey()];
        st.questCancelled = st.questCancelled.concat([quest.id]);
      });
      cmd("cmd.questionnaire.cancel", { questionnaire_id: quest.id });
    }

    function lensToggle(msgId) {
      const st = state.threads[activeKey()];
      const lens = st.lens;
      if (lens.mode === "off") return;
      cmd("cmd.context_lens.toggle", { mode: lens.mode, message_id: msgId });
      mutate(() => {
        if (lens.mode === "subcompact") {
          const i = lens.selected.indexOf(msgId);
          if (i >= 0) lens.selected.splice(i, 1);
          else if (lens.selected.length < 25) lens.selected.push(msgId);
        } else {
          const bucket = lens.applied[lens.mode];
          const i = bucket.indexOf(msgId);
          if (i >= 0) bucket.splice(i, 1);
          else if (bucket.length < 25) bucket.push(msgId);
          ["mute", "focus"].forEach(m => {
            if (m !== lens.mode) {
              const j = lens.applied[m].indexOf(msgId);
              if (j >= 0) lens.applied[m].splice(j, 1);
            }
          });
          const s = lens.selected.indexOf(msgId);
          if (s >= 0) lens.selected.splice(s, 1);
        }
      });
    }

    function lensSetMode(mode) {
      const st = state.threads[activeKey()];
      mutate(() => {
        st.lens.mode = mode;
        st.lens.selected = [];
        if (mode === "off") st.lens.applied = { mute: [], focus: [], subcompact: [] };
      });
      cmd("cmd.context_lens.set_mode", { mode: mode });
    }

    function lensApplySubcompact() {
      const st = state.threads[activeKey()];
      mutate(() => {
        const take = st.lens.selected.slice(0, 25);
        take.forEach(id => {
          if (!st.lens.applied.subcompact.includes(id)) st.lens.applied.subcompact.push(id);
          ["mute", "focus"].forEach(m => {
            const j = st.lens.applied[m].indexOf(id);
            if (j >= 0) st.lens.applied[m].splice(j, 1);
          });
        });
        st.lens.selected = [];
      });
      cmd("cmd.context_lens.apply", { count: st.lens.applied.subcompact.length });
    }

    function lensClearMessage(msgId) {
      const st = state.threads[activeKey()];
      mutate(() => {
        ["mute", "focus", "subcompact"].forEach(m => {
          const i = st.lens.applied[m].indexOf(msgId);
          if (i >= 0) st.lens.applied[m].splice(i, 1);
        });
      });
    }

    function lensShapeOf(msgId) {
      const lens = state.threads[activeKey()].lens;
      if (lens.applied.mute.includes(msgId)) return "muted";
      if (lens.applied.focus.includes(msgId)) return "focused";
      if (lens.applied.subcompact.includes(msgId)) return "subcompacted";
      return null;
    }

    function lensHasShaping() {
      const lens = state.threads[activeKey()].lens;
      return lens.applied.mute.length + lens.applied.focus.length + lens.applied.subcompact.length > 0;
    }

    function toggleLongMessage(msgId) {
      const st = state.threads[activeKey()];
      mutate(() => {
        const cur = st.expandedByIds[msgId];
        st.expandedByIds[msgId] = cur === undefined ? true : !cur;
      });
    }

    function isLongCollapsed(msg) {
      if (!msg || !msg.collapsedByDefault) return false;
      const st = state.threads[activeKey()];
      const v = st.expandedByIds[msg.id];
      return v === undefined ? true : !v;
    }

    function setSession(patch) { mutate(() => { Object.assign(state.session, patch); }); }

    function switchThread(key) {
      if (!state.threads[key]) return;
      if (key === state.session.activeThreadKey) return;
      mutate(() => { state.session.activeThreadKey = key; });
      cmd("cmd.chat.open_thread", { thread_id: key });
    }

    function goalEffectiveStatus(key) {
      const t = demoThread(key);
      const st = state.threads[key];
      if (!t.activeGoal || st.goalCleared) return null;
      return st.goalStatus || t.activeGoal.status;
    }

    function goalAct(key, action) {
      const t = demoThread(key);
      const st = state.threads[key];
      if (!t.activeGoal) return;
      mutate(() => {
        if (action === "pause") st.goalStatus = "paused";
        else if (action === "resume") st.goalStatus = "running";
        else if (action === "stop") st.goalStatus = "stopped";
        else if (action === "clear") { st.goalCleared = true; }
        else if (action === "expand") st.goalExpanded = true;
        else if (action === "collapse") st.goalExpanded = false;
      });
      if (action === "pause" || action === "resume" || action === "stop" || action === "clear") {
        cmd("cmd.goal." + action, { thread_id: key, goal_id: t.activeGoal.id });
      }
    }

    function goalSaveObjective(key, text) {
      const t = demoThread(key);
      const st = state.threads[key];
      mutate(() => {
        st.goalObjective = text;
        st.replanCount = st.replanCount + 1;
        st.goalExpanded = true;
      });
      cmd("cmd.goal.edit", { thread_id: key, goal_id: t && t.activeGoal ? t.activeGoal.id : null });
    }

    function serializeState() {
      const { v, session, threads, ui } = state;
      const out = { v, session, threads: {}, ui: ui || { pinnedByWin: {} } };
      Object.keys(threads).forEach(k => {
        out.threads[k] = Object.assign({}, threads[k], { typingSince: null });
      });
      return JSON.stringify(out);
    }

    function restoreState(snap) {
      try {
        const parsed = typeof snap === "string" ? JSON.parse(snap) : snap;
        if (!parsed || !parsed.threads) return;
        Object.keys(parsed.threads).forEach(k => {
          if (state.threads[k]) state.threads[k] = Object.assign(state.threads[k], parsed.threads[k]);
        });
        if (parsed.session) state.session = Object.assign(state.session, parsed.session);
        if (parsed.ui) state.ui = Object.assign(state.ui || {}, parsed.ui);
        emit();
      } catch (e) {}
    }

    function resetForRestart() {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    }

    // ---- v2 extension: pin governor + artifact workspace ----
    function setPin(winId, on) { mutate(() => { state.ui.pinnedByWin[winId] = !!on; }); }
    function pinMode(winId) { return state.ui.pinModeByWin[winId] === "compact" ? "compact" : "full"; }
    function setPinMode(winId, mode) {
      if (state.ui.pinModeByWin[winId] === mode) return;
      mutate(() => { state.ui.pinModeByWin[winId] = mode; });
    }
    function artWs(winId) {
      state.ui.artwsByWin = state.ui.artwsByWin || {};
      if (!state.ui.artwsByWin[winId]) state.ui.artwsByWin[winId] = { open: false, activeId: null };
      return state.ui.artwsByWin[winId];
    }
    function artOpen(winId, artId) {
      mutate(() => { const a = artWs(winId); a.open = true; if (artId) a.activeId = artId; });
      cmd("cmd.artifact.open_workspace", { artifact_id: artId || null });
    }
    function artClose(winId) { mutate(() => { artWs(winId).open = false; }); }
    function artSwitch(winId, artId) { mutate(() => { const a = artWs(winId); a.activeId = artId; a.open = true; }); }
    function artEntry(key, artId) {
      const st = state.threads[key];
      if (!st.artState[artId]) st.artState[artId] = { status: "ready", version: 1 };
      return st.artState[artId];
    }
    function artStatusOf(key, artId) { return artEntry(key, artId).status; }
    function artSetStatus(key, artId, status, bump) {
      mutate(() => {
        const e = artEntry(key, artId);
        e.status = status;
        if (bump) e.version = (e.version || 1) + 1;
      });
      if (status === "loading") {
        setTimeout(() => {
          const st = state.threads[key];
          if (st && st.artState[artId] && st.artState[artId].status === "loading") artSetStatus(key, artId, "ready", false);
        }, 1400);
      }
    }
    function threadArtifacts(key) {
      const t = demoThread(key);
      const st = state.threads[key];
      return (t.artifacts || []).concat(st ? st.extraArtifacts : []);
    }

    // ---- v2 extension: thread-local settings, access, speed, favorites ----
    const ACCESS_PROFILES = ["Ask for approval", "Auto accept edits", "Auto", "Full Access"];
    const LIMITING_MODES = ["Ask", "Plan", "Deep Plan"];
    function effectiveSettings(key) {
      const st = state.threads[key || activeKey()];
      return Object.assign({
        provider: state.session.provider, model: state.session.model, persona: state.session.persona,
        mode: state.session.mode, effort: state.session.effort, speed: state.session.speed, access: state.session.access
      }, st && st.settings ? st.settings : {});
    }
    function setThreadSettings(key, patch, scope) {
      mutate(() => {
        if (scope === "session") Object.assign(state.session, patch);
        else {
          const st = state.threads[key];
          st.settings = Object.assign(st.settings || {}, patch);
        }
      });
    }
    function accessNote(key) {
      const s = effectiveSettings(key);
      if (LIMITING_MODES.includes(s.mode) && (s.access === "Auto" || s.access === "Full Access")) {
        return s.access + " · Limited by " + s.mode + " mode";
      }
      return null;
    }
    function favoriteToggle(modelName) {
      mutate(() => {
        const f = state.session.favorites;
        const i = f.indexOf(modelName);
        if (i >= 0) f.splice(i, 1); else f.push(modelName);
      });
    }
    function catalog() { return data.catalog || []; }
    function catalogModel(name) {
      for (const p of catalog()) for (const m of p.models) if (m.name === name) return { provider: p.provider, model: m };
      return null;
    }
    function modelConsequence(key, next) {
      const cur = effectiveSettings(key);
      if (next.model === cur.model && next.provider === cur.provider) return null;
      const nm = catalogModel(next.model);
      const cm = catalogModel(cur.model);
      if (next.provider !== cur.provider) {
        return { tier: "modal", kind: "privacy", text: "Switching to " + next.provider + " routes this thread through a different provider boundary.", detail: "Requested route " + next.provider + " / " + next.model + " uses a separate paid connection and credential identity. Provider cache and prior context do not carry over." };
      }
      if (nm && cm && nm.model.context < cm.model.context) {
        return { tier: "modal", kind: "context", text: next.model + " has a smaller context window; included history would be reduced.", detail: "Context drops from " + cm.model.context + " to " + nm.model.context + " tokens. Older turns would be represented by summary only." };
      }
      return { tier: "confirm", kind: "cache", text: "Switching models replays this conversation without the current provider cache.", detail: "The provider will reprocess prior turns; cached prompt pricing and latency no longer apply. Usage records the replay separately." };
    }
    function applyModelChange(key, sel, scope) {
      const patch = { provider: sel.provider, model: sel.model };
      if (sel.effort) patch.effort = sel.effort;
      if (sel.speed) patch.speed = sel.speed;
      setThreadSettings(key, patch, scope);
      mutate(() => {
        const r = state.session.recentModels;
        const i = r.indexOf(sel.model);
        if (i >= 0) r.splice(i, 1);
        r.unshift(sel.model);
        state.session.recentModels = r.slice(0, 4);
      });
      reevalAttachments(key);
    }
    function reevalAttachments(key) {
      const st = state.threads[key];
      if (!st) return;
      mutate(() => {
        st.draft.attachments.forEach(a => {
          const r = st.attachRoutes[a.id];
          if (r) r.reeval = true;
        });
      });
    }
    function attachRouteFor(key, attach) {
      const st = state.threads[key];
      const forced = st.attachRoutes[attach.id] && st.attachRoutes[attach.id].route;
      if (forced) return forced;
      const s = effectiveSettings(key);
      const cm = catalogModel(s.model);
      const caps = cm ? cm.model.caps : { video: false, audio: false };
      const kind = attach.kind || "file";
      if (kind === "video" || kind === "audio") {
        if (caps[kind]) return "native";
        if (kind === "video" || kind === "audio") {
          const alt = catalog().some(p => p.models.some(m => m.caps && m.caps[kind]));
          return alt ? "pm-or-alternate" : "pm";
        }
      }
      if (kind === "zip" || kind === "pdf" || kind === "image") return "native-or-pm";
      return "native";
    }
    function attachSetRoute(key, attachId, route, consented) {
      mutate(() => {
        const st = state.threads[key];
        st.attachRoutes[attachId] = { route: route, consented: !!consented, reeval: false };
      });
    }
    function noSafeRoute(key, attach) {
      const kind = attach.kind;
      return (kind === "video" || kind === "audio") && !catalog().some(p => p.models.some(m => m.caps && m.caps[kind]));
    }

    // ---- v2 extension: approvals + tiered warnings ----
    let seq = 1;
    function approvalInject(key, ap) {
      const id = "ap-" + (seq++);
      mutate(() => { state.threads[key].approvals.push(Object.assign({ id: id, resolved: null }, ap)); });
      return id;
    }
    function approvalResolve(key, id, action) {
      mutate(() => {
        const a = state.threads[key].approvals.find(x => x.id === id);
        if (a) a.resolved = action;
      });
      cmd("cmd.approval." + action, { approval_id: id });
    }
    function warningInject(key, w) {
      const id = "wr-" + (seq++);
      mutate(() => { state.threads[key].warnings.push(Object.assign({ id: id, resolved: null }, w)); });
      return id;
    }
    function warningResolve(key, id, action) {
      mutate(() => {
        const w = state.threads[key].warnings.find(x => x.id === id);
        if (w) w.resolved = action;
      });
      cmd("cmd.warning." + action, { warning_id: id });
    }

    // ---- v2 extension: restore points, rewind, branch, inter-thread ----
    function restorePointCreate(key, msgId) {
      const id = "rp-" + (seq++);
      mutate(() => { state.threads[key].restorePoints.push({ id: id, msgId: msgId, at: new Date().toISOString() }); });
      cmd("cmd.chat.create_restore_point", { thread_id: key, message_id: msgId });
      return id;
    }
    function rewindTo(key, rpId) {
      mutate(() => {
        const st = state.threads[key];
        const rp = st.restorePoints.find(x => x.id === rpId);
        st.rewindAnchor = rp ? rp.msgId : null;
        st.stickToBottom = false;
      });
      cmd("cmd.chat.rewind", { thread_id: key, restore_point: rpId });
    }
    function rewindClear(key) { mutate(() => { state.threads[key].rewindAnchor = null; }); }
    function branchFrom(key, msgId, opts) {
      const src = demoThread(key);
      if (!src) return null;
      const all = messages(key);
      const idx = msgId ? all.findIndex(m => m.id === msgId) : all.length - 1;
      const ms = all.slice(0, idx + 1).map(m => Object.assign({}, m));
      const n = state.extraThreads.filter(t => t.id.indexOf(key + "-b") === 0).length + 1;
      const id = key + "-b" + n;
      const nt = {
        id: id, title: (opts && opts.title) || (src.title + " — branch"), project: src.project,
        pinned: false, threadState: "idle", updatedAt: new Date().toISOString(), archived: false,
        initialVisibleMessageCount: Math.max(1, ms.length), scriptedReplyIds: src.scriptedReplyIds || [],
        scriptedReplyCursor: 0, messages: ms, questionnaires: [], artifacts: (src.artifacts || []).slice(),
        branchOf: { thread: key, msgId: msgId || null, model: (opts && opts.model) || null }, tags: src.tags || []
      };
      mutate(() => {
        state.extraThreads.push(nt);
        state.threads[id] = blankThreadState(nt);
        if (opts && opts.switchTo) state.session.activeThreadKey = id;
      });
      buildIndex();
      cmd("cmd.chat.thread.branch", { source_thread: key, new_thread: id });
      return id;
    }
    function threadRequestSend(targetKey, text) {
      const key = activeKey();
      const id = "tr-" + (seq++);
      mutate(() => {
        state.threads[key].threadRequests.push({ id: id, target: targetKey, text: text, status: "sent", response: null, at: new Date().toISOString() });
      });
      cmd("cmd.chat.thread.request_send", { target_thread: targetKey });
      return id;
    }
    function threadRequestReceive(key, reqId, responseText) {
      mutate(() => {
        const r = state.threads[key].threadRequests.find(x => x.id === reqId);
        if (r) { r.status = "answered"; r.response = responseText; }
      });
      cmd("cmd.chat.thread.request_receive", { request_id: reqId });
    }
    function spawnRelated(key, title, intro) {
      const src = demoThread(key);
      const id = key + "-c" + (state.extraThreads.filter(t => t.id.indexOf(key + "-c") === 0).length + 1);
      const nt = {
        id: id, title: title || (src ? src.title + " — related" : "Related thread"), project: src ? src.project : "Tastebook",
        pinned: false, threadState: "running", updatedAt: new Date().toISOString(), archived: false,
        initialVisibleMessageCount: 2, scriptedReplyIds: src ? (src.scriptedReplyIds || []) : [], scriptedReplyCursor: 0,
        messages: [
          { id: id + "-m1", role: "user", body: intro || "Spawned from " + (src ? src.title : key) + " to research this branch in parallel.", sentAt: new Date().toISOString() },
          { id: id + "-m2", role: "assistant", body: "On it — I will report back in the parent thread when the research completes.", sentAt: new Date().toISOString() }
        ],
        questionnaires: [], artifacts: [], parentThread: key, tags: []
      };
      mutate(() => {
        state.extraThreads.push(nt);
        state.threads[id] = blankThreadState(nt);
        state.threads[key].threadRequests.push({ id: "sp-" + (seq++), target: id, text: title || "related research", status: "spawned", response: null, at: new Date().toISOString() });
      });
      buildIndex();
      cmd("cmd.chat.thread.spawn_related", { new_thread: id });
      return id;
    }
    function redirectTurn(key, text) {
      mutate(() => {
        const st = state.threads[key];
        st.redirectNote = text;
        if (state.running && state.running.threadKey === key) {
          state.running.redirected = text;
          state.running.steps = state.running.steps.concat(["Redirecting toward: " + text.slice(0, 48)]);
        }
      });
      cmd("cmd.chat.turn.redirect", { thread_id: key });
    }

    // ---- v2 extension: todos / subagents / goal phases / live activity / diffs ----
    function todoList(key) {
      const t = demoThread(key);
      const st = state.threads[key];
      if (st.todos) return st.todos;
      return t.todo || null;
    }
    function todoEnsure(key) {
      const st = state.threads[key];
      if (!st.todos) {
        const t = demoThread(key);
        st.todos = { id: (t.todo && t.todo.id) || "todo-rt", items: ((t.todo && t.todo.items) || []).map(x => Object.assign({}, x)) };
      }
      return st.todos;
    }
    function todoAdd(key, label) {
      mutate(() => {
        const td = todoEnsure(key);
        td.items.push({ id: "ti-" + (seq++), label: label, state: "pending" });
      });
    }
    function todoSetState(key, itemId, stt) {
      mutate(() => {
        const td = todoEnsure(key);
        const it = td.items.find(x => x.id === itemId);
        if (it) it.state = stt;
      });
    }
    function subagentGroups(key) {
      const t = demoThread(key);
      const st = state.threads[key];
      const base = (t.subagentGroups || []).map(g => Object.assign({}, g, { agents: g.agents.map(a => {
        const ov = st.subagentStatus[a.name];
        return ov ? Object.assign({}, a, { status: ov }) : a;
      }) }));
      if (st.subagentExtra.length) {
        base.push({ id: "sg-rt", label: "Spawned this session", state: "running", counts: null, agents: st.subagentExtra.map(a => Object.assign({}, a)) });
      }
      return base;
    }
    function subagentSpawn(key, agent) {
      mutate(() => {
        state.threads[key].subagentExtra.push(Object.assign({ status: "queued", workedSeconds: 0 }, agent));
      });
    }
    function subagentSetStatus(key, name, status) {
      mutate(() => {
        const st = state.threads[key];
        const extra = st.subagentExtra.find(a => a.name === name);
        if (extra) extra.status = status;
        else st.subagentStatus[name] = status;
      });
    }
    function goalPhases(key) {
      const t = demoThread(key);
      return (t.activeGoal && t.activeGoal.phases) || null;
    }
    function goalPhaseIdx(key) {
      const st = state.threads[key];
      if (st.goalPhaseIdx != null) return st.goalPhaseIdx;
      return 0;
    }
    function goalAdvance(key) {
      mutate(() => {
        const st = state.threads[key];
        const ph = goalPhases(key);
        st.goalPhaseIdx = Math.min((ph ? ph.length - 1 : 5), goalPhaseIdx(key) + 1);
      });
    }
    function activityLive(key) { return state.threads[key].activityLive; }
    function activityAdvance(key, stage) {
      mutate(() => {
        const st = state.threads[key];
        if (!st.activityLive) {
          st.activityLive = { id: "live-act", status: "running", workedSeconds: 0, compactLabel: "", stages: [] };
        }
        st.activityLive.stages.push(Object.assign({ status: "complete" }, stage));
        const n = st.activityLive.stages.reduce((acc, s) => acc + (s.count || 1), 0);
        st.activityLive.compactLabel = n + " tools used";
      });
    }
    function activitySetStatus(key, status) {
      mutate(() => {
        const st = state.threads[key];
        if (st.activityLive) st.activityLive.status = status;
      });
    }
    function diffGroups(key) {
      const t = demoThread(key);
      const st = state.threads[key];
      return (t.diffGroups || []).concat(st.diffExtra);
    }
    function diffCreate(key, group) {
      mutate(() => { state.threads[key].diffExtra.push(Object.assign({ id: "dg-" + (seq++) }, group)); });
    }
    function diffUpdate(key, groupId, path, added, removed) {
      mutate(() => {
        const st = state.threads[key];
        const all = (demoThread(key).diffGroups || []).concat(st.diffExtra);
        const g = all.find(x => x.id === groupId);
        if (!g) return;
        const f = g.files.find(x => x.path === path);
        if (f) { f.added += added; f.removed += removed; }
        else g.files.push({ path: path, added: added, removed: removed, status: "modified" });
      });
    }

    // ---- v2 extension: compact now, crew, capacity, cross-project ----
    function compactNow(key) {
      mutate(() => {
        state.threads[key].compactEvents.push({ at: new Date().toISOString(), summary: "Model-facing context compacted; canonical transcript unchanged." });
      });
      cmd("cmd.context.compact_now", { thread_id: key });
    }
    function crewSet(key, crew) { mutate(() => { state.threads[key].crew = crew; }); }
    function crewOf(key) { return state.threads[key].crew; }
    function crossProjectWarn(key, targetProject, text) {
      return warningInject(key, {
        tier: "modal", kind: "cross-project", text: text || "This request reads another project (" + targetProject + ").",
        detail: "Cross-project work is off by default. Choose a scope: allow once, allow for this thread, or review Settings. This choice never persists silently.",
        choices: ["Allow once", "This thread", "Open Settings", "Cancel"]
      });
    }

    // ---- v2 extension: spellcheck ----
    function spellAdd(word, dict) {
      mutate(() => {
        const arr = dict === "project" ? state.session.spellProject : state.session.spellPersonal;
        if (!arr.includes(word)) arr.push(word);
      });
    }
    function spellIgnoreDraft(key, word) {
      mutate(() => {
        const st = state.threads[key];
        if (!st.spellIgnoredDraft.includes(word)) st.spellIgnoredDraft.push(word);
      });
    }
    function spellSetDisabled(key, on) { mutate(() => { state.threads[key].spellDisabled = !!on; }); }

    const store = {
      data, state,
      PROVIDER_MODEL, MODEL_PERSONA,
      demoThread, allThreads, thread, activeKey, messages, loadedMessages, findMessage,
      mutate, subscribe, emit,
      search, groupedSearch,
      replyFor, send, stopRun, isRunning, workedSeconds,
      togglePin, isPinned, statusForThread,
      setDraft, pushRevision, restoreRevision, clearDraft,
      activeQuestionnaire, questRecords, questIndex, questAnswer, questSetAnswer, questValid,
      questGoTo, questSkip, questSubmit, questCancel,
      lensToggle, lensSetMode, lensApplySubcompact, lensClearMessage, lensShapeOf, lensHasShaping,
      toggleLongMessage, isLongCollapsed,
      setSession, switchThread,
      goalEffectiveStatus, goalAct, goalSaveObjective,
      serializeState, restoreState, resetForRestart, persist,
      setPin, pinMode, setPinMode,
      artWs, artOpen, artClose, artSwitch, artStatusOf, artSetStatus, artEntry, threadArtifacts,
      ACCESS_PROFILES, effectiveSettings, setThreadSettings, accessNote, favoriteToggle,
      catalog, catalogModel, modelConsequence, applyModelChange, attachRouteFor, attachSetRoute, noSafeRoute,
      approvalInject, approvalResolve, warningInject, warningResolve,
      restorePointCreate, rewindTo, rewindClear, branchFrom,
      threadRequestSend, threadRequestReceive, spawnRelated, redirectTurn,
      todoList, todoAdd, todoSetState, subagentGroups, subagentSpawn, subagentSetStatus,
      goalPhases, goalPhaseIdx, goalAdvance, activityLive, activityAdvance, activitySetStatus,
      diffGroups, diffCreate, diffUpdate,
      compactNow, crewSet, crewOf, crossProjectWarn,
      spellAdd, spellIgnoreDraft, spellSetDisabled
    };
    return store;
  }

  return { create, STORAGE_KEY, PROVIDER_MODEL, MODEL_PERSONA };
})();
