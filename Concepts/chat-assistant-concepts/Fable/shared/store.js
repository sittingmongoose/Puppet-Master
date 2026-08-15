// Fable — semantic store. One owner of durable state; every concept is a projection.
// Mirrors the product's DRY rule: presentation components render owner state, never hold it.
// Persistence: localStorage under one namespace; docked and pop-out share it by design.

import { loadFixture, EXTRA_THREADS, EXTRA_SCRIPTED_REPLIES, FAVORITE_ROUTES } from "./data.js";

const LS_KEY = "pm-fable-chat-v1";

const DEFAULT_THREAD_LOCAL = () => ({
  route: { provider: "anthropic", account: "anthropic-max", model: "fable-5" },
  requestedRoute: null,           // set when requested differs from effective
  effort: "Medium",
  fast: false,
  persona: "default-persona",
  mode: "Agent",                  // Agent | Plan | Review
  access: "Auto",                 // one of ACCESS_MODES
  accessLimitedBy: null,          // e.g. "Review mode"
  bsd: "auto",                    // off | auto | on
  bsdState: "idle",
  bsdScope: null,                 // "This turn" | "Current thread"
  worktree: null,
});

function clone(v) { return JSON.parse(JSON.stringify(v)); }

export class Store {
  constructor() {
    this.listeners = new Map();   // event -> Set<fn>
    this.anyListeners = new Set();
    this.state = null;
    this._persistTimer = null;
    this._turnTimers = [];
  }

  // ---------- events ----------
  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.listeners.get(event).delete(fn);
  }
  onAny(fn) { this.anyListeners.add(fn); return () => this.anyListeners.delete(fn); }
  emit(event, detail) {
    (this.listeners.get(event) || []).forEach((fn) => fn(detail));
    this.anyListeners.forEach((fn) => fn(event, detail));
    this._schedulePersist();
  }

  // ---------- boot ----------
  async init() {
    const fixture = await loadFixture();
    const threads = {};
    const order = [];
    for (const t of fixture.threads) { threads[t.id] = this._normalizeThread(t); order.push(t.id); }
    for (const t of EXTRA_THREADS) { threads[t.id] = this._normalizeThread(clone(t)); order.push(t.id); }
    const replies = {};
    for (const r of fixture.scriptedReplies) replies[r.id] = r;
    for (const r of EXTRA_SCRIPTED_REPLIES) replies[r.id] = r;

    this.state = {
      threads, threadOrder: order, scriptedReplies: replies,
      currentThreadId: "thread-01",
      // workspace geometry
      historyState: "closed",           // closed | peek | pinned-compact | pinned-full
      historyRequested: "closed",       // what the user asked for (full may fall back to compact)
      artifact: { openId: null, status: "closed", byThread: {} }, // status: closed|loading|ready|updated|error
      mount: "docked",                  // docked | popout
      // per-thread view state (scroll anchors, expansions) — local view state by canon
      view: {},                          // threadId -> { expandedMessages:{}, expandedGroups:{}, scrollAnchor:null, atBottom:true, lensPanelOpen:false }
      // transient turn state per thread
      turns: {},                         // threadId -> { active, phase, stepIndex, summary, workedSeconds, redirected, startedAt }
      // search
      search: { open: false, query: "", scope: "thread", results: [], activeResult: null },
      // context lens
      lens: {},                          // threadId -> { selections: {msgId: 'mute'|'focus'|'subcompact-pending'|'subcompact'}, panelOpen: false, receipts: [] }
      // thread-local controls
      local: {},                         // threadId -> DEFAULT_THREAD_LOCAL()
      // questionnaire runtime (index into thread.questionnaires + answers kept on questionnaire)
      // approvals + warnings queue (transient but persisted)
      approvals: [],                     // {id, threadId, title, scope, detail, actions, state}
      warnings: [],                      // {id, threadId, kind, title, body, actions, state}
      // offline / sync
      sync: { transport: "Live", domains: { thread: "Live", goal: "Live", usage: "Live" }, outbox: [], replayLog: [], lastReplayAt: null },
      // notifications routed to canonical title-bar stack (count only — no chat panel)
      titlebarNotifications: 2,
      // receipts (compact now, goal completion, redirects, grants)
      receipts: [],
      // provider-CLI runtime-demand flow (final adjudication)
      providerSetup: null,
      // context ring
      ring: {},                          // threadId -> { used, limit, segments:[{kind,label,tokens}], cacheNote }
      // capacity / crew
      crew: { wave: 1, waves: 3, concurrent: 2, queued: 1 },
      seq: 1000,
    };

    for (const id of order) {
      this.state.view[id] = { expandedMessages: {}, expandedGroups: {}, scrollAnchor: null, atBottom: true };
      this.state.local[id] = DEFAULT_THREAD_LOCAL();
      this.state.lens[id] = { selections: {}, panelOpen: false, receipts: [] };
      this.state.ring[id] = this._defaultRing(id);
    }
    // Thread-local flavor differences out of the box
    if (this.state.local["thread-17"]) {
      this.state.local["thread-17"].mode = "Agent";
      this.state.local["thread-17"].access = "Auto accept edits";
    }
    if (this.state.local["thread-14"]) {
      this.state.local["thread-14"].mode = "Review";
      this.state.local["thread-14"].access = "Full Access";
      this.state.local["thread-14"].accessLimitedBy = "Review mode";
    }
    if (this.state.local["thread-18"]) this.state.local["thread-18"].bsd = "off";

    this._restore();
    return this;
  }

  _normalizeThread(t) {
    t.messages = t.messages || [];
    t.questionnaires = (t.questionnaires || []).map((q) => ({
      title: q.title || "A few questions",
      skipped: {}, freeform: {}, ...q,
    }));
    t.draftState = t.draftState || { currentText: "", revisionHistory: [] };
    t.draftState.attachments = t.draftState.attachments || [];
    return t;
  }

  _defaultRing(threadId) {
    const t = this.state ? this.state.threads[threadId] : null;
    const last = t && t.messages.length ? t.messages[t.messages.length - 1] : null;
    const used = last && last.runtime ? last.runtime.contextUsed || 38000 : 38000;
    const limit = last && last.runtime ? last.runtime.contextLimit || 200000 : 200000;
    return {
      used, limit,
      segments: [
        { kind: "system", label: "System and rules", tokens: Math.round(used * 0.08) },
        { kind: "persona", label: "Persona capsule", tokens: Math.round(used * 0.02) },
        { kind: "history", label: "Conversation", tokens: Math.round(used * 0.62) },
        { kind: "tools", label: "Selected tools", tokens: Math.round(used * 0.1) },
        { kind: "retrieval", label: "Retrieved context", tokens: Math.round(used * 0.13) },
        { kind: "working", label: "Working set", tokens: Math.round(used * 0.05) },
      ],
      cacheNote: "Prefix cached · last reuse 2m ago",
    };
  }

  // ---------- persistence ----------
  _schedulePersist() {
    clearTimeout(this._persistTimer);
    this._persistTimer = setTimeout(() => this.persist(), 180);
  }
  persist() {
    if (!this.state) return;
    const s = this.state;
    const drafts = {}, questionnaires = {}, locals = {}, lenses = {}, views = {};
    for (const id of s.threadOrder) {
      const t = s.threads[id];
      drafts[id] = t.draftState;
      questionnaires[id] = t.questionnaires;
      locals[id] = s.local[id];
      lenses[id] = { selections: s.lens[id].selections, receipts: s.lens[id].receipts };
      views[id] = { expandedMessages: s.view[id].expandedMessages, expandedGroups: s.view[id].expandedGroups };
    }
    const payload = {
      v: 1, currentThreadId: s.currentThreadId,
      historyState: s.historyState, historyRequested: s.historyRequested,
      artifact: { openId: s.artifact.openId, status: s.artifact.status, byThread: s.artifact.byThread },
      mount: s.mount, drafts, questionnaires, locals, lenses, views,
      outbox: s.sync.outbox, replayLog: s.sync.replayLog,
      receipts: s.receipts.slice(-40),
    };
    try { localStorage.setItem(LS_KEY, JSON.stringify(payload)); } catch (e) { /* storage full — prototype tolerates */ }
  }
  _restore() {
    let raw = null;
    try { raw = localStorage.getItem(LS_KEY); } catch (e) { return; }
    if (!raw) return;
    let p; try { p = JSON.parse(raw); } catch (e) { return; }
    if (!p || p.v !== 1) return;
    const s = this.state;
    if (p.currentThreadId && s.threads[p.currentThreadId]) s.currentThreadId = p.currentThreadId;
    if (p.historyState) { s.historyState = p.historyState; s.historyRequested = p.historyRequested || p.historyState; }
    if (p.artifact) s.artifact = { ...s.artifact, ...p.artifact };
    for (const id of s.threadOrder) {
      if (p.drafts && p.drafts[id]) s.threads[id].draftState = p.drafts[id];
      if (p.questionnaires && p.questionnaires[id]) s.threads[id].questionnaires = p.questionnaires[id];
      if (p.locals && p.locals[id]) s.local[id] = { ...DEFAULT_THREAD_LOCAL(), ...p.locals[id] };
      if (p.lenses && p.lenses[id]) Object.assign(s.lens[id], p.lenses[id]);
      if (p.views && p.views[id]) Object.assign(s.view[id], p.views[id]);
    }
    if (Array.isArray(p.outbox)) s.sync.outbox = p.outbox;
    if (Array.isArray(p.replayLog)) s.sync.replayLog = p.replayLog;
    if (Array.isArray(p.receipts)) s.receipts = p.receipts;
  }
  resetPersistence() {
    try { localStorage.removeItem(LS_KEY); } catch (e) { /* noop */ }
  }

  // ---------- selectors ----------
  get thread() { return this.state.threads[this.state.currentThreadId]; }
  get local() { return this.state.local[this.state.currentThreadId]; }
  get view() { return this.state.view[this.state.currentThreadId]; }
  get turn() { return this.state.turns[this.state.currentThreadId] || null; }
  get lensState() { return this.state.lens[this.state.currentThreadId]; }
  get ringState() { return this.state.ring[this.state.currentThreadId]; }
  threadList({ includeArchived = false } = {}) {
    return this.state.threadOrder
      .map((id) => this.state.threads[id])
      .filter((t) => includeArchived || !t.archived);
  }
  activeQuestionnaire(threadId = this.state.currentThreadId) {
    const t = this.state.threads[threadId];
    return (t.questionnaires || []).find((q) => q.status === "incomplete") || null;
  }
  queuedQuestionnaires(threadId = this.state.currentThreadId) {
    const t = this.state.threads[threadId];
    return (t.questionnaires || []).filter((q) => q.status === "queued");
  }
  nextSeq(prefix) { return `${prefix}-${++this.state.seq}`; }

  // ---------- thread selection ----------
  selectThread(id) {
    if (!this.state.threads[id] || id === this.state.currentThreadId) return;
    this.state.currentThreadId = id;
    // artifact selection is per-thread restorable
    const remembered = this.state.artifact.byThread[id];
    if (remembered && remembered.openId) {
      this.state.artifact.openId = remembered.openId;
      this.state.artifact.status = remembered.status === "error" ? "error" : "ready";
    } else {
      this.state.artifact.openId = null;
      this.state.artifact.status = "closed";
    }
    this.emit("thread");
    this.emit("transcript");
    this.emit("artifact");
    this.emit("route");
    this.emit("composer");
    this.emit("work");
    this.emit("question");
  }

  // ---------- history geometry ----------
  setHistory(state, { requested = true } = {}) {
    this.state.historyState = state;
    if (requested) this.state.historyRequested = state;
    this.emit("history");
  }
  // called by window concepts when space forces pinned-full → pinned-compact
  degradeHistory() {
    if (this.state.historyState === "pinned-full") {
      this.state.historyState = "pinned-compact";
      this.emit("history");
    }
  }
  restoreHistoryIfRoom() {
    if (this.state.historyRequested === "pinned-full" && this.state.historyState !== "pinned-full") {
      this.state.historyState = "pinned-full";
      this.emit("history");
    }
  }

  // ---------- artifacts ----------
  openArtifact(artifactId, { simulate = "ready" } = {}) {
    const s = this.state;
    s.artifact.openId = artifactId;
    s.artifact.status = "loading";
    s.artifact.byThread[s.currentThreadId] = { openId: artifactId, status: "loading" };
    this.emit("artifact");
    clearTimeout(this._artifactTimer);
    this._artifactTimer = setTimeout(() => {
      if (s.artifact.openId !== artifactId) return;
      s.artifact.status = simulate === "error" ? "error" : "ready";
      s.artifact.byThread[s.currentThreadId] = { openId: artifactId, status: s.artifact.status };
      this.emit("artifact");
    }, 650);
  }
  artifactUpdated() {
    if (this.state.artifact.openId && this.state.artifact.status !== "closed") {
      this.state.artifact.status = "updated";
      this.emit("artifact");
    }
  }
  artifactError() {
    if (this.state.artifact.openId) { this.state.artifact.status = "error"; this.emit("artifact"); }
  }
  retryArtifact() {
    if (this.state.artifact.openId) this.openArtifact(this.state.artifact.openId);
  }
  closeArtifact() {
    const s = this.state;
    s.artifact.openId = null;
    s.artifact.status = "closed";
    s.artifact.byThread[s.currentThreadId] = { openId: null, status: "closed" };
    this.emit("artifact");
  }

  // ---------- mount ----------
  setMount(mount) {
    if (mount === this.state.mount) return;
    this.state.mount = mount;
    this.emit("mount");
  }

  // ---------- drafts ----------
  setDraft(text) {
    const d = this.thread.draftState;
    d.currentText = text;
    this.emit("composer");
  }
  saveDraftRevision() {
    const d = this.thread.draftState;
    const text = (d.currentText || "").trim();
    if (!text) return;
    const last = d.revisionHistory[d.revisionHistory.length - 1];
    if (last && last.text === text) return;               // deduplicated
    d.revisionHistory.push({ savedAt: new Date().toISOString(), text });
    if (d.revisionHistory.length > 12) d.revisionHistory.shift();  // bounded
  }
  restoreDraftRevision(index) {
    const d = this.thread.draftState;
    const rev = d.revisionHistory[index];
    if (!rev) return;
    this.saveDraftRevision();
    d.currentText = rev.text;
    this.emit("composer");
  }
  clearDraft() {
    this.saveDraftRevision();
    this.thread.draftState.currentText = "";
    this.thread.draftState.attachments = [];
    this.emit("composer");
  }
  addAttachment(att) {
    this.thread.draftState.attachments.push(att);
    this.emit("composer");
  }
  removeAttachment(id) {
    const d = this.thread.draftState;
    d.attachments = d.attachments.filter((a) => a.id !== id);
    this.emit("composer");
  }

  // ---------- turn engine (fake send — scripted, never interprets text) ----------
  isAgentActive(threadId = this.state.currentThreadId) {
    const turn = this.state.turns[threadId];
    return !!(turn && turn.active);
  }
  composerButton() {
    const draft = (this.thread.draftState.currentText || "").trim();
    if (this.isAgentActive()) return draft ? "send" : "stop";
    return "send";
  }
  sendMessage() {
    const s = this.state;
    const threadId = s.currentThreadId;
    const t = this.thread;
    const text = (t.draftState.currentText || "").trim();
    if (!text) return false;

    if (s.sync.transport === "Offline") {
      return this._queueOffline(text);
    }
    if (this.isAgentActive(threadId)) {
      return this._redirectActiveTurn(text);
    }
    this._appendUserMessage(threadId, text);
    this._startScriptedTurn(threadId);
    return true;
  }
  _appendUserMessage(threadId, text, { redirect = false } = {}) {
    const t = this.state.threads[threadId];
    const id = this.nextSeq(threadId.replace("thread-", "t") + "-m");
    t.messages.push({
      id, role: "user", body: text, sentAt: new Date().toISOString(),
      runtime: { provider: "Anthropic", model: "Fable 5", persona: this.state.local[threadId].persona, mode: this.state.local[threadId].mode, effort: this.state.local[threadId].effort, workedSeconds: 0, totalElapsedSeconds: 0, tokenCount: Math.max(8, Math.round(text.length / 4)), contextUsed: this.state.ring[threadId].used, contextLimit: this.state.ring[threadId].limit, estimatedCost: null },
      eligibleForEdit: true, collapsedByDefault: false,
      redirect,
    });
    t.updatedAt = new Date().toISOString();
    t.draftState.currentText = "";
    t.draftState.attachments = [];
    this.emit("transcript", { appended: id });
    this.emit("composer");
  }
  _startScriptedTurn(threadId) {
    const s = this.state;
    const t = s.threads[threadId];
    const replyId = t.scriptedReplyIds && t.scriptedReplyIds[t.scriptedReplyCursor % (t.scriptedReplyIds.length || 1)];
    const reply = replyId ? s.scriptedReplies[replyId] : null;

    // Live locus contract (video 3): phases carry a kind, a label, and detail
    // rows that accumulate within the phase; the next phase replaces them.
    // Rich replies declare workingPhases; legacy workingSummarySequence maps to
    // single-line phases so the fixture's scripted replies stay valid.
    let phases;
    if (reply && reply.workingPhases) {
      phases = reply.workingPhases;
    } else if (reply) {
      phases = reply.workingSummarySequence.map((label, i) => ({
        kind: "generate", label, items: [], durationMs: reply.stepDurationsMs[i] || 1000,
      }));
    } else {
      phases = [{ kind: "generate", label: "Working", items: [], durationMs: 1200 }];
    }

    const turn = {
      active: true, phase: "working", stepIndex: 0,
      summary: phases[0].label, phaseKind: phases[0].kind,
      liveItems: [],                 // detail rows accumulated in the current phase
      phaseKinds: [phases[0].kind],  // sequence so far (condensed icon strip)
      workedSeconds: 0, startedAt: Date.now(),
      replyId, redirected: false,
    };
    s.turns[threadId] = turn;
    t.threadState = "running";
    this.emit("composer");
    this.emit("work");
    this.emit("thread");

    const tick = setInterval(() => {
      if (!turn.active) return clearInterval(tick);
      turn.workedSeconds = Math.round((Date.now() - turn.startedAt) / 1000);
      this.emit("turn-tick");
    }, 1000);
    this._turnTimers.push(tick);

    let elapsed = 0;
    phases.forEach((ph, i) => {
      const dur = ph.durationMs || 1000;
      // items tick in progressively inside the phase window
      (ph.items || []).forEach((item, ii) => {
        const at = elapsed + Math.round(((ii + 1) / ((ph.items.length || 1) + 1)) * dur);
        const h = setTimeout(() => {
          if (!turn.active || turn.stepIndex !== i) return;
          turn.liveItems = turn.liveItems.concat([item]);
          if (item.countLabel) turn.summary = item.countLabel;
          this.emit("work");
        }, at);
        this._turnTimers.push(h);
      });
      if (i > 0) {
        const h = setTimeout(() => {
          if (!turn.active) return;
          turn.stepIndex = i;
          turn.summary = ph.label;
          turn.phaseKind = ph.kind;
          turn.liveItems = [];               // replacement, not accumulation
          turn.phaseKinds = turn.phaseKinds.concat([ph.kind]);
          this.emit("work");
        }, elapsed);
        this._turnTimers.push(h);
      }
      elapsed += dur;
    });
    const done = setTimeout(() => this._completeTurn(threadId), elapsed + 400);
    this._turnTimers.push(done);
  }
  // Deterministic phase injection for the activity.* trigger family.
  injectTurnPhase(threadId, kind, label, items = []) {
    const s = this.state;
    let turn = s.turns[threadId];
    if (!turn || !turn.active) {
      turn = {
        active: true, phase: "working", stepIndex: 0,
        summary: label, phaseKind: kind, liveItems: [],
        phaseKinds: [kind], workedSeconds: 0, startedAt: Date.now(),
        replyId: null, redirected: false, injected: true,
      };
      s.turns[threadId] = turn;
      s.threads[threadId].threadState = "running";
      const tick = setInterval(() => {
        if (!turn.active) return clearInterval(tick);
        turn.workedSeconds = Math.round((Date.now() - turn.startedAt) / 1000);
        this.emit("turn-tick");
      }, 1000);
      this._turnTimers.push(tick);
      this.emit("composer");
      this.emit("thread");
    } else {
      turn.stepIndex += 1;
      turn.summary = label;
      turn.phaseKind = kind;
      turn.liveItems = [];
      turn.phaseKinds = turn.phaseKinds.concat([kind]);
    }
    items.forEach((item, ii) => {
      const h = setTimeout(() => {
        if (!turn.active || turn.phaseKind !== kind) return;
        turn.liveItems = turn.liveItems.concat([item]);
        if (item.countLabel) turn.summary = item.countLabel;
        this.emit("work");
      }, 260 * (ii + 1));
      this._turnTimers.push(h);
    });
    this.emit("work");
  }
  _completeTurn(threadId) {
    const s = this.state;
    const turn = s.turns[threadId];
    if (!turn || !turn.active) return;
    const t = s.threads[threadId];
    const reply = turn.replyId ? s.scriptedReplies[turn.replyId] : null;
    turn.active = false;
    turn.phase = "complete";
    const id = this.nextSeq(threadId.replace("thread-", "t") + "-m");
    t.messages.push({
      id, role: "assistant",
      body: reply ? reply.body : "Done.",
      sentAt: new Date().toISOString(),
      runtime: reply ? { ...reply.runtime, workedSeconds: turn.workedSeconds || reply.runtime.workedSeconds } : { provider: "Anthropic", model: "Fable 5", persona: "default-persona", mode: "Agent", effort: "Medium", workedSeconds: turn.workedSeconds, totalElapsedSeconds: turn.workedSeconds, tokenCount: 300, contextUsed: s.ring[threadId].used, contextLimit: s.ring[threadId].limit, estimatedCost: null },
      eligibleForEdit: false, collapsedByDefault: false,
      activitySummary: reply ? reply.activitySummary : null,
      interrupted: false,
    });
    t.scriptedReplyCursor = (t.scriptedReplyCursor || 0) + 1;
    t.threadState = "idle";
    t.updatedAt = new Date().toISOString();
    this.emit("transcript", { appended: id });
    this.emit("composer");
    this.emit("work");
    this.emit("thread");
  }
  stopTurn() {
    const s = this.state;
    const threadId = s.currentThreadId;
    const turn = s.turns[threadId];
    if (!turn || !turn.active) return;
    const t = s.threads[threadId];
    const reply = turn.replyId ? s.scriptedReplies[turn.replyId] : null;
    turn.active = false;
    turn.phase = "stopped";
    this._turnTimers.forEach(clearTimeout);
    this._turnTimers = [];
    const id = this.nextSeq(threadId.replace("thread-", "t") + "-m");
    t.messages.push({
      id, role: "assistant",
      body: reply && reply.stopResultBody ? reply.stopResultBody : "Stopped. Partial work is preserved.",
      sentAt: new Date().toISOString(),
      runtime: { provider: "Anthropic", model: "Fable 5", persona: "default-persona", mode: this.local.mode, effort: this.local.effort, workedSeconds: turn.workedSeconds, totalElapsedSeconds: turn.workedSeconds, tokenCount: 120, contextUsed: s.ring[threadId].used, contextLimit: s.ring[threadId].limit, estimatedCost: null },
      eligibleForEdit: false, collapsedByDefault: false, interrupted: true,
    });
    t.threadState = "idle";
    this.emit("transcript", { appended: id });
    this.emit("composer");
    this.emit("work");
    this.emit("thread");
  }
  _redirectActiveTurn(text) {
    const s = this.state;
    const threadId = s.currentThreadId;
    const turn = s.turns[threadId];
    this._appendUserMessage(threadId, text, { redirect: true });
    if (turn && turn.active) {
      turn.redirected = true;
      turn.summary = "Steering with your correction";
      this.emit("work");
      this.addReceipt({ kind: "redirect", title: "Active turn redirected", detail: "Original attempt and partial output preserved; the turn resumed with your correction." });
    }
    return true;
  }

  // ---------- offline / outbox / replay ----------
  setTransport(state) {
    this.state.sync.transport = state;
    if (state === "Offline") {
      this.state.sync.domains = { thread: "Cached", goal: "Server work continuing", usage: "Cached" };
    } else if (state === "Live") {
      this.state.sync.domains = { thread: "Live", goal: "Live", usage: "Live" };
    }
    this.emit("sync");
  }
  setDomainState(domain, state) {
    this.state.sync.domains[domain] = state;
    this.emit("sync");
  }
  _queueOffline(text) {
    const s = this.state;
    const t = this.thread;
    const key = `out-${s.currentThreadId}-${t.messages.length}-${text.length}`;
    if (s.sync.outbox.some((o) => o.idempotencyKey === key && o.state !== "failed")) return false;
    s.sync.outbox.push({
      id: this.nextSeq("out"), threadId: s.currentThreadId, text,
      idempotencyKey: key, queuedAt: new Date().toISOString(), state: "Queued to send",
    });
    t.draftState.currentText = "";
    this.emit("sync");
    this.emit("composer");
    return true;
  }
  reconnectAndReplay() {
    const s = this.state;
    s.sync.transport = "Reconnect";
    this.emit("sync");
    setTimeout(() => {
      s.sync.transport = "Replay";
      this.emit("sync");
      setTimeout(() => {
        // idempotent: only entries not already replayed apply once
        const pending = s.sync.outbox.filter((o) => o.state === "Queued to send" && !s.sync.replayLog.includes(o.idempotencyKey));
        for (const o of pending) {
          s.sync.replayLog.push(o.idempotencyKey);
          o.state = "sent";
          this._appendUserMessage(o.threadId, o.text);
          this._startScriptedTurn(o.threadId);
        }
        s.sync.outbox = s.sync.outbox.filter((o) => o.state !== "sent");
        s.sync.lastReplayAt = new Date().toISOString();
        s.sync.transport = "Live";
        s.sync.domains = { thread: "Live", goal: "Live", usage: "Synchronizing" };
        this.emit("sync");
        setTimeout(() => { s.sync.domains.usage = "Live"; this.emit("sync"); }, 1500);
      }, 900);
    }, 700);
  }
  snapshotCatchUp() {
    const s = this.state;
    s.sync.transport = "Snapshot catch-up";
    this.emit("sync");
    setTimeout(() => {
      s.sync.transport = "Live";
      s.sync.domains = { thread: "Live", goal: "Live", usage: "Live" };
      this.addReceipt({ kind: "sync", title: "Snapshot applied", detail: "Thread state caught up from a server snapshot; buffered live events applied after the snapshot point." });
      this.emit("sync");
    }, 1100);
  }

  // ---------- questionnaires ----------
  prepareQuestionnaire(def) {
    const t = this.thread;
    t.questionnaires.push({ skipped: {}, freeform: {}, ...def, status: "preparing" });
    this.emit("question");
    setTimeout(() => {
      const q = t.questionnaires.find((x) => x.id === def.id);
      if (q && q.status === "preparing") {
        q.status = this.activeQuestionnaire() && this.activeQuestionnaire().id !== q.id ? "queued" : "incomplete";
        this.emit("question");
      }
    }, 1400);
  }
  promoteQueuedQuestionnaire() {
    const t = this.thread;
    if (this.activeQuestionnaire()) return;
    const q = (t.questionnaires || []).find((x) => x.status === "queued");
    if (q) { q.status = "incomplete"; q.currentQuestionIndex = q.currentQuestionIndex || 0; this.emit("question"); }
  }
  answerQuestion(qid, questionId, value, { toggle = false } = {}) {
    const q = this._findQuestionnaire(qid);
    if (!q) return;
    const question = q.questions.find((x) => x.id === questionId);
    if (!question) return;
    if (question.kind === "freeform") {
      q.freeform[questionId] = value;
      question.selected = value ? [value] : [];
    } else if (question.kind === "multi select") {
      const set = new Set(question.selected);
      if (toggle && set.has(value)) set.delete(value); else set.add(value);
      question.selected = [...set];
    } else {
      question.selected = [value];
    }
    delete q.skipped[questionId];
    this.emit("question");
  }
  navigateQuestion(qid, index) {
    const q = this._findQuestionnaire(qid);
    if (!q) return;
    q.currentQuestionIndex = Math.max(0, Math.min(q.questions.length - 1, index));
    this.emit("question");
  }
  skipQuestion(qid, questionId) {
    const q = this._findQuestionnaire(qid);
    if (!q) return;
    q.skipped[questionId] = true;
    const i = q.questions.findIndex((x) => x.id === questionId);
    if (i < q.questions.length - 1) q.currentQuestionIndex = i + 1;
    this.emit("question");
  }
  unskipQuestion(qid, questionId) {
    const q = this._findQuestionnaire(qid);
    if (!q) return;
    delete q.skipped[questionId];
    this.emit("question");
  }
  cancelQuestionnaire(qid) {
    const q = this._findQuestionnaire(qid);
    if (!q) return;
    q.status = "cancelled";
    q.resolvedAt = new Date().toISOString();
    this.emit("question");
    this.promoteQueuedQuestionnaire();
  }
  submitQuestionnaire(qid) {
    const q = this._findQuestionnaire(qid);
    if (!q) return { ok: false };
    const missing = q.questions.filter((x) => x.required && !q.skipped[x.id] && (!x.selected || x.selected.length === 0));
    if (missing.length) {
      return { ok: false, missing: missing.map((m) => m.id) };
    }
    q.status = "submitting";
    this.emit("question");
    setTimeout(() => {
      q.status = "submitted";
      q.resolvedAt = new Date().toISOString();
      this.addReceipt({ kind: "questionnaire", title: `Answers submitted — ${q.title}`, detail: `${q.questions.length} questions, ${Object.keys(q.skipped).length} skipped.` });
      this.emit("question");
      this.promoteQueuedQuestionnaire();
    }, 900);
    return { ok: true };
  }
  _findQuestionnaire(qid) {
    for (const id of this.state.threadOrder) {
      const q = (this.state.threads[id].questionnaires || []).find((x) => x.id === qid);
      if (q) return q;
    }
    return null;
  }

  // ---------- goal ----------
  setGoalStatus(status, extra = {}) {
    const t = this.thread;
    if (!t.activeGoal && status !== "Running") return;
    if (!t.activeGoal) return;
    const g = t.activeGoal;
    g.status = status.toLowerCase();
    delete g.replanApplied;
    if (status === "Blocked") {
      g.blocked = extra.blocked || {
        cause: "Port 8080 is held by the preview server",
        scope: "Integration test lane",
        attempted: "Waited two minutes, retried once",
        whyStopped: "Freeing the port would kill a process this Goal does not own",
        nextSafeAction: "Approve moving the preview to another port, or free it manually",
      };
    } else {
      delete g.blocked;
    }
    if (status === "Complete") {
      g.completionReceipt = { at: new Date().toISOString(), summary: extra.summary || "Objective met; evidence recorded; worktrees integrated." };
      this.addReceipt({ kind: "goal", title: `Goal complete — ${g.title}`, detail: g.completionReceipt.summary });
    }
    this.emit("work");
  }
  startGoal(def) {
    const t = this.thread;
    t.activeGoal = def;
    this.emit("work");
  }
  clearGoal() {
    const t = this.thread;
    t.activeGoal = null;
    this.emit("work");
  }
  editGoal(newObjective) {
    const t = this.thread;
    if (!t.activeGoal) return;
    t.activeGoal.pendingEdit = {
      objective: newObjective,
      impact: "Material change: wave plan revalidates, settlement lane re-scopes, two todos replanned.",
    };
    this.emit("work");
  }
  confirmGoalEdit() {
    const t = this.thread;
    const g = t.activeGoal;
    if (!g || !g.pendingEdit) return;
    g.objective = g.pendingEdit.objective;
    delete g.pendingEdit;
    // Scenario v2's updated_replan: a distinct visible state after an applied
    // material update, until the next status change clears it.
    g.replanApplied = { at: new Date().toISOString(), note: "Objective updated — plan revalidated" };
    this.addReceipt({ kind: "goal", title: "Goal replanned", detail: "Objective updated with visible impact analysis; frozen running turns keep prior state until their safe boundary." });
    this.emit("work");
  }
  advanceGoalPhase() {
    const g = this.thread.activeGoal;
    if (!g || !g.phases || !g.phases.length) return;
    g.phaseIndex = Math.min(g.phases.length - 1, (g.phaseIndex || 0) + 1);
    delete g.replanApplied;
    this.addReceipt({ kind: "goal", title: `Goal phase — ${g.phases[g.phaseIndex]}`, detail: `Phase ${g.phaseIndex + 1} of ${g.phases.length}.` });
    this.emit("work");
  }

  // ---------- todos / subagents ----------
  setTodoState(itemId, state) {
    const t = this.thread;
    if (!t.todo) return;
    const item = t.todo.items.find((x) => x.id === itemId);
    if (item) { item.state = state; this.emit("work"); }
  }
  setSubagentStatus(groupId, agentName, status, activity) {
    const t = this.thread;
    const g = (t.subagentGroups || []).find((x) => x.id === groupId);
    if (!g) return;
    const a = g.agents.find((x) => x.name === agentName);
    if (a) {
      a.status = status;
      if (activity) a.currentActivity = activity;
      this.recountSubagents(g);
      this.emit("work");
    }
  }
  recountSubagents(g) {
    g.counts = { working: 0, complete: 0, blocked: 0, waiting: 0, failed: 0, retrying: 0 };
    for (const ag of g.agents) {
      if (ag.status === "working") g.counts.working++;
      else if (ag.status === "complete") g.counts.complete++;
      else if (ag.status === "blocked") g.counts.blocked++;
      else if (ag.status === "failed") g.counts.failed++;
      else if (ag.status === "retrying") g.counts.retrying++;
      else g.counts.waiting++;
    }
  }
  failSubagent(groupId, agentName, reason) {
    const g = (this.thread.subagentGroups || []).find((x) => x.id === groupId);
    const a = g && g.agents.find((x) => x.name === agentName);
    if (!a) return;
    a.status = "failed";
    a.currentActivity = reason || "Failed — see run detail";
    this.recountSubagents(g);
    this.emit("work");
  }
  retrySubagent(groupId, agentName) {
    const g = (this.thread.subagentGroups || []).find((x) => x.id === groupId);
    const a = g && g.agents.find((x) => x.name === agentName);
    if (!a) return;
    a.status = "retrying";
    a.currentActivity = "Retrying with the same bounded task";
    this.recountSubagents(g);
    this.emit("work");
    setTimeout(() => {
      if (a.status === "retrying") {
        a.status = "working";
        a.currentActivity = "Resumed after retry";
        this.recountSubagents(g);
        this.emit("work");
      }
    }, 1800);
  }

  // ---------- context lens ----------
  lensSelect(msgId, op) {
    const l = this.lensState;
    if (op === "clear") { delete l.selections[msgId]; }
    else if (op === "Subcompact") { l.selections[msgId] = "subcompact-pending"; }
    else if (op === "Mute") { l.selections[msgId] = "mute"; }
    else if (op === "Focus") { l.selections[msgId] = "focus"; }
    this.emit("lens");
  }
  lensApplySubcompact() {
    const l = this.lensState;
    const pending = Object.entries(l.selections).filter(([, v]) => v === "subcompact-pending");
    const batch = pending.slice(0, 25);   // one Apply covers up to 25 messages
    for (const [id] of batch) l.selections[id] = "subcompact";
    const remaining = pending.length - batch.length;
    l.receipts.push({
      at: new Date().toISOString(),
      op: "Subcompact applied",
      count: batch.length,
      note: remaining > 0 ? `${remaining} still pending — apply again to continue` : "Summaries hold rehydration handles",
    });
    this.emit("lens");
    return { applied: batch.length, remaining };
  }
  compactNow() {
    const r = this.ringState;
    const before = r.used;
    r.used = Math.round(r.used * 0.55);
    r.segments = r.segments.map((seg) => ({ ...seg, tokens: Math.round(seg.tokens * (seg.kind === "history" ? 0.4 : 0.9)) }));
    this.addReceipt({
      kind: "compact",
      title: "Compact Now",
      detail: `Context reduced from ${Math.round(before / 1000)}k to ${Math.round(r.used / 1000)}k tokens. Canonical history and branch ancestry preserved; summaries carry rehydration handles.`,
    });
    this.emit("lens");
    this.emit("ring");
  }

  // ---------- routes / access / bsd ----------
  setRoute(ref, { effort, fast } = {}) {
    const local = this.local;
    const prev = local.route;
    local.route = ref;
    if (effort !== undefined) local.effort = effort;
    if (fast !== undefined) local.fast = fast;
    local.requestedRoute = null;
    this.emit("route");
    return prev;
  }
  setRequestedVsEffective(requested, effective, reason) {
    const local = this.local;
    local.requestedRoute = { ...requested, reason };
    local.route = effective;
    this.emit("route");
  }
  setEffort(effort) { this.local.effort = effort; this.emit("route"); }
  setFast(fast) { this.local.fast = fast; this.emit("route"); }
  setPersona(p) { this.local.persona = p; this.emit("route"); }
  setMode(mode) {
    const local = this.local;
    local.mode = mode;
    if (mode === "Review" && local.access === "Full Access") local.accessLimitedBy = "Review mode";
    else local.accessLimitedBy = null;
    this.emit("route");
  }
  setAccess(access) {
    const local = this.local;
    local.access = access;
    local.accessLimitedBy = (local.mode === "Review" && access === "Full Access") ? "Review mode" : null;
    this.emit("route");
  }
  setBsd(value, scope) {
    const local = this.local;
    local.bsd = value;
    local.bsdScope = scope || null;
    local.bsdState = value === "off" ? "idle" : local.bsdState;
    this.emit("route");
  }
  setBsdState(state) { this.local.bsdState = state; this.emit("route"); }

  // ---------- approvals / warnings ----------
  requestApproval(def) {
    this.state.approvals.push({ state: "open", ...def, id: def.id || this.nextSeq("appr") });
    this.emit("approval");
  }
  resolveApproval(id, outcome) {
    const a = this.state.approvals.find((x) => x.id === id);
    if (a) {
      a.state = outcome;
      a.resolvedAt = new Date().toISOString();
      this.addReceipt({ kind: "approval", title: `${a.title} — ${outcome}`, detail: a.scope });
      this.emit("approval");
    }
  }
  raiseWarning(def) {
    this.state.warnings.push({ state: "open", ...def, id: def.id || this.nextSeq("warn") });
    this.emit("warning");
  }
  resolveWarning(id, action) {
    const w = this.state.warnings.find((x) => x.id === id);
    if (!w) return;
    w.state = "resolved";
    w.chosen = action;
    this.addReceipt({ kind: "warning", title: `${w.title}`, detail: `Chosen: ${action}` });
    if (w.kind === "route") {
      if (action === "Continue here") {
        // Requested route stays visible; effective route switches truthfully.
        const requested = { ...this.local.route };
        this.setRequestedVsEffective(
          requested,
          { provider: "openai", account: "openai-team", model: "gpt-56-pro" },
          "Attachment needs video transcription this route cannot run"
        );
      } else if (action === "Branch with new model") {
        const last = this.thread.messages[this.thread.messages.length - 1];
        if (last) {
          const id2 = this.branchFrom(last.id, { withModel: { provider: "openai", account: "openai-team", model: "gpt-56-pro" }, title: `${this.thread.title} — new model` });
          if (id2) this.selectThread(id2);
        }
      } else if (action === "Start new chat") {
        const id2 = this.branchFrom(this.thread.messages[0].id, { title: "New chat — transcription route" });
        if (id2) {
          this.state.threads[id2].messages = [];
          this.state.threads[id2].tags = ["spawned"];
          this.selectThread(id2);
        }
      }
    }
    this.emit("warning");
  }

  // ---------- receipts / message ops ----------
  addReceipt(r) {
    this.state.receipts.push({ at: new Date().toISOString(), ...r });
    this.emit("receipt");
  }
  toggleMessageExpanded(msgId) {
    const v = this.view;
    v.expandedMessages[msgId] = !v.expandedMessages[msgId];
    this.emit("transcript-view", { msgId });
  }
  toggleGroupExpanded(groupId) {
    const v = this.view;
    v.expandedGroups[groupId] = !v.expandedGroups[groupId];
    this.emit("transcript-view", { groupId });
  }

  // ---------- branch / rewind / restore ----------
  branchFrom(msgId, { withModel = null, title = null } = {}) {
    const s = this.state;
    const src = this.thread;
    const idx = src.messages.findIndex((m) => m.id === msgId);
    if (idx < 0) return null;
    const id = this.nextSeq("thread-b");
    const branched = {
      id, title: title || `${src.title} — branch`, project: src.project,
      pinned: false, archived: false, threadState: "idle",
      updatedAt: new Date().toISOString(),
      initialVisibleMessageCount: 50,
      tags: ["branch"], branchOf: { thread: src.id, message: msgId },
      messages: clone(src.messages.slice(0, idx + 1)),
      activeGoal: null, todo: null, subagentGroups: [], diffGroups: [],
      questionnaires: [], artifacts: clone(src.artifacts || []), browserSessions: [],
      draftState: { currentText: "", attachments: [], revisionHistory: [] },
      scriptedReplyCursor: 0, scriptedReplyIds: clone(src.scriptedReplyIds || []),
    };
    s.threads[id] = this._normalizeThread(branched);
    s.threadOrder.push(id);
    s.view[id] = { expandedMessages: {}, expandedGroups: {}, scrollAnchor: null, atBottom: true };
    s.local[id] = clone(s.local[src.id]);
    if (withModel) s.local[id].route = withModel;
    s.lens[id] = { selections: {}, panelOpen: false, receipts: [] };
    s.ring[id] = this._defaultRing(src.id);
    this.addReceipt({ kind: "branch", title: "Branched thread", detail: `From ${src.title} at ${msgId}. Source thread unchanged; workspace files untouched.` });
    this.emit("thread");
    return id;
  }
  createRestorePoint(label) {
    const t = this.thread;
    t.restorePoints = t.restorePoints || [];
    const rp = { id: this.nextSeq("rp"), label: label || `Restore point ${t.restorePoints.length + 1}`, at: new Date().toISOString(), messageCount: t.messages.length, immutable: true };
    t.restorePoints.push(rp);
    this.addReceipt({ kind: "restore-point", title: "Restore point created", detail: `${rp.label} — immutable marker at ${t.messages.length} messages.` });
    this.emit("thread");
    return rp;
  }
  rewindTo(msgId) {
    // Rewind = branch that becomes the working leaf; source history preserved via branch record.
    const branchId = this.branchFrom(msgId, { title: `${this.thread.title} — rewound` });
    if (branchId) {
      this.addReceipt({ kind: "rewind", title: "Rewound", detail: "New leaf from the chosen point; original history preserved; files not rolled back." });
      this.selectThread(branchId);
    }
    return branchId;
  }

  // ---------- provider-CLI runtime demand (final adjudication flow) ----------
  // requirement detected → inspect existing installs → Provider Setup Required
  // → deep-link with preserved continuation → explicit Install (official source)
  // → separate authenticate → readiness verify → resume only if continuation
  // is still current; stale continuations are rejected with a receipt.
  demandProviderSetup(providerId, operation, routeRef) {
    const ps = {
      provider: providerId,
      operation,
      routeRef,
      continuationId: this.nextSeq("cont"),
      current: true,
      stage: "inspecting",
    };
    this.state.providerSetup = ps;
    this.emit("provider-setup");
    setTimeout(() => {
      if (this.state.providerSetup !== ps) return;
      ps.stage = "required";
      this.addReceipt({
        kind: "provider",
        title: "Provider Setup Required",
        detail: `No compatible installation for this route. Continuation ${ps.continuationId} preserved for: ${operation}. Setup opens the exact Provider Settings row.`,
      });
      this.emit("provider-setup");
    }, 700);
    return ps;
  }
  providerSetupInstall() {
    const ps = this.state.providerSetup;
    if (!ps || ps.stage !== "required") return;
    ps.stage = "installing";
    this.emit("provider-setup");
    setTimeout(() => {
      if (this.state.providerSetup !== ps) return;
      ps.stage = "verifying-install";
      this.emit("provider-setup");
      setTimeout(() => {
        if (this.state.providerSetup !== ps) return;
        ps.stage = "authenticating";
        this.addReceipt({
          kind: "provider",
          title: "Provider CLI installed",
          detail: "Acquired from the official provider source for the exact selected Host. Publisher, provenance, version, architecture, license, and adapter compatibility verified. Authentication is a separate step.",
        });
        this.emit("provider-setup");
      }, 900);
    }, 1100);
  }
  providerSetupAuthenticate() {
    const ps = this.state.providerSetup;
    if (!ps || ps.stage !== "authenticating") return;
    ps.stage = "verifying-readiness";
    this.emit("provider-setup");
    setTimeout(() => {
      if (this.state.providerSetup !== ps) return;
      ps.stage = "ready";
      this.emit("provider-setup");
      setTimeout(() => {
        if (this.state.providerSetup !== ps) return;
        if (ps.current) {
          ps.stage = "resumed";
          if (ps.routeRef) {
            const route = this.state.local[this.state.currentThreadId];
            route.route = ps.routeRef;
            route.requestedRoute = null;
            this.emit("route");
          }
          this.addReceipt({ kind: "provider", title: "Continuation resumed", detail: `${ps.operation} resumed — continuation ${ps.continuationId} was still current.` });
        } else {
          ps.stage = "stale";
          this.addReceipt({ kind: "provider", title: "Stale continuation rejected", detail: `${ps.operation} was NOT resumed — the originating operation changed while setup ran. Start it again from its surface.` });
        }
        this.emit("provider-setup");
      }, 700);
    }, 800);
  }
  invalidateProviderContinuation() {
    const ps = this.state.providerSetup;
    if (ps) { ps.current = false; this.emit("provider-setup"); }
  }
  dismissProviderSetup() {
    this.state.providerSetup = null;
    this.emit("provider-setup");
  }

  // ---------- ring ----------
  bumpRing(tokens) {
    const r = this.ringState;
    r.used = Math.min(r.limit, r.used + tokens);
    this.emit("ring");
  }
}

export const store = new Store();
