/* ChatSemanticStore — semantic state for Grok 4.5 chat concepts. */
(function () {
  'use strict';

  var MODEL_LABEL = 'Grok 4.5';
  var DRAFT_REVISION_CAP = 24;
  var STATUS_LABELS = {
    running: 'Running',
    stopped: 'Stopped',
    paused: 'Paused',
    blocked: 'Blocked',
    complete: 'Complete',
    incomplete: 'Incomplete',
    queued: 'Queued',
    submitted: 'Submitted',
    cancelled: 'Cancelled',
    canceled: 'Cancelled',
    pending: 'Pending',
    active: 'Active',
    waiting: 'Waiting'
  };

  function clone(data) {
    if (typeof structuredClone === 'function') {
      try {
        return structuredClone(data);
      } catch (_) {
        /* fall through */
      }
    }
    return JSON.parse(JSON.stringify(data));
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function formatStatus(s) {
    if (s == null || s === '') return '';
    var raw = String(s);
    var key = raw.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
    if (STATUS_LABELS[key]) return STATUS_LABELS[key];
    if (STATUS_LABELS[raw.toLowerCase()]) return STATUS_LABELS[raw.toLowerCase()];
    return raw
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\b\w/g, function (c) {
        return c.toUpperCase();
      });
  }

  function emptyDraft() {
    return { text: '', attachments: [], updatedAt: null, editingMessageId: null };
  }

  function hydrateDraft(draftState) {
    if (!draftState) return emptyDraft();
    var attachments = draftState.attachments || [];
    return {
      text: draftState.currentText != null ? String(draftState.currentText) : '',
      attachments: clone(attachments),
      updatedAt: null
    };
  }

  function hydrateDraftRevisions(draftState) {
    if (!draftState || !Array.isArray(draftState.revisionHistory)) return [];
    return draftState.revisionHistory.map(function (rev) {
      return {
        savedAt: rev.savedAt || null,
        text: rev.text != null ? String(rev.text) : '',
        attachments: clone(rev.attachments || [])
      };
    });
  }

  function defaultLens() {
    return {
      mode: 'off',
      selectionIds: [],
      mutedIds: [],
      focusedIds: [],
      subcompacts: []
    };
  }

  function defaultThreadUi(goal) {
    return {
      scrollAnchor: null,
      stickToBottom: true,
      expandedMessageIds: Object.create(null),
      expandedThoughtIds: Object.create(null),
      expandedSubagentIds: Object.create(null),
      goalExpanded: !!(goal && goal.expanded),
      todoCollapsed: false,
      activityExpanded: false,
      threadHistoryQuery: ''
    };
  }

  function collectActivity(messages) {
    var out = [];
    var seen = Object.create(null);
    (messages || []).forEach(function (m) {
      var g = m && m.activityGroup;
      if (!g || !g.id || seen[g.id]) return;
      seen[g.id] = true;
      out.push(clone(g));
    });
    return out;
  }

  function hydrateThread(src) {
    var messages = clone(src.messages || []);
    var goal = src.activeGoal
      ? clone(src.activeGoal)
      : src.goal
        ? clone(src.goal)
        : null;
    var todos = null;
    if (src.todo) todos = clone(src.todo);
    else if (src.todos) todos = clone(src.todos);
    var groups = clone(src.subagentGroups || []);
    groups.forEach(function (g) {
      if (!g) return;
      if (!g.agents && g.children) g.agents = clone(g.children);
      if (!g.children && g.agents) g.children = clone(g.agents);
    });
    var fromMsgs = collectActivity(messages);
    var topActivity = Array.isArray(src.activity) ? clone(src.activity) : [];
    var activity = topActivity.length ? topActivity.concat(fromMsgs) : fromMsgs;
    return {
      id: src.id,
      title: src.title || src.id,
      pinned: !!src.pinned,
      archived: !!src.archived,
      state: src.threadState || src.state || null,
      tags: clone(src.tags || []),
      project: src.project || null,
      updatedAt: src.updatedAt || null,
      messages: messages,
      draft: hydrateDraft(src.draftState),
      draftRevisions: hydrateDraftRevisions(src.draftState),
      lens: defaultLens(),
      goal: goal,
      todos: todos,
      subagentGroups: groups,
      diffGroups: clone(src.diffGroups || []),
      activity: activity,
      questionnaires: clone(src.questionnaires || []),
      artifacts: clone(src.artifacts || []),
      browserSessions: clone(src.browserSessions || []),
      scriptedReplyIds: clone(src.scriptedReplyIds || []),
      scriptedReplyCursor: src.scriptedReplyCursor | 0,
      initialVisibleMessageCount:
        src.initialVisibleMessageCount != null
          ? src.initialVisibleMessageCount | 0
          : messages.length
    };
  }

  function messageIdPrefix(threadId) {
    var m = String(threadId || '').match(/^thread-(\d+)$/i);
    if (m) return 't' + m[1] + '-m';
    return String(threadId || 'msg') + '-m';
  }

  function nextMessageId(thread) {
    var prefix = messageIdPrefix(thread.id);
    var used = Object.create(null);
    thread.messages.forEach(function (msg) {
      used[msg.id] = true;
    });
    var n = thread.messages.length + 1;
    var id;
    do {
      id = prefix + String(n).padStart(4, '0');
      n += 1;
    } while (used[id]);
    return id;
  }

  function snippetAround(body, query, radius) {
    var text = String(body || '');
    var q = String(query || '');
    if (!q) return text.slice(0, radius * 2);
    var idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return text.slice(0, radius * 2);
    var start = Math.max(0, idx - radius);
    var end = Math.min(text.length, idx + q.length + radius);
    var snip = text.slice(start, end);
    if (start > 0) snip = '…' + snip;
    if (end < text.length) snip = snip + '…';
    return snip;
  }

  function uniquePush(list, ids) {
    var seen = Object.create(null);
    list.forEach(function (id) {
      seen[id] = true;
    });
    (ids || []).forEach(function (id) {
      if (!id || seen[id]) return;
      seen[id] = true;
      list.push(id);
    });
  }

  function removeIds(list, ids) {
    var drop = Object.create(null);
    (ids || []).forEach(function (id) {
      drop[id] = true;
    });
    for (var i = list.length - 1; i >= 0; i--) {
      if (drop[list[i]]) list.splice(i, 1);
    }
  }

  function create(demoData) {
    var data = clone(demoData || {});
    var scriptedReplies = Object.create(null);
    (data.scriptedReplies || []).forEach(function (reply) {
      if (reply && reply.id) scriptedReplies[reply.id] = reply;
    });

    var threads = Object.create(null);
    var threadList = Array.isArray(data.threads) ? data.threads : [];
    threadList.forEach(function (src) {
      if (!src || !src.id) return;
      threads[src.id] = hydrateThread(src);
    });

    var threadKeys = Object.keys(threads);
    var firstKey = threadKeys[0] || null;

    var session = {
      activeThreadKey: firstKey,
      personaId: 'interface-engineer',
      modelId: 'grok-4-5',
      defaultModelId: 'grok-4-5',
      threadModelOverride: null,
      modeId: 'agent',
      effortId: 'high',
      speedMode: 'normal',
      accessProfile: 'ask',
      providerId: 'xai',
      accountId: 'work',
      crewId: '',
      crewDefaultPrompted: false,
      crewConfirmOpen: false,
      crewPendingConfirm: null,
      favoritesModelIds: ['grok-4-5', 'grok'],
      worktreeId: null,
      keepThoughtExpandedWhileActive: true,
      historyPinned: false,
      historyMode: 'closed',
      artifactWorkspace: {
        open: false,
        artifactId: null,
        status: 'ready',
        queue: [],
        scrollTop: 0,
        errorMessage: null
      },
      artifactCatalog: [],
      crew: { requested: null, effective: null, waves: [] },
      approval: null,
      warning: null,
      compactNow: { status: 'idle', progress: 0 },
      spellcheckEnabled: true
    };

    var search = {
      query: '',
      scope: 'current',
      selectedResultId: null,
      focusedTargetMessageId: null,
      highlightUntil: null
    };

    var ui = { perThread: Object.create(null) };
    threadKeys.forEach(function (key) {
      ui.perThread[key] = defaultThreadUi(threads[key].goal);
    });

    var demo = {
      replyCursorByThread: Object.create(null),
      runningByThread: Object.create(null)
    };
    threadKeys.forEach(function (key) {
      demo.replyCursorByThread[key] = threads[key].scriptedReplyCursor | 0;
      demo.runningByThread[key] = null;
    });

    var listeners = [];
    var version = 0;

    function emit() {
      version += 1;
      listeners.slice().forEach(function (fn) {
        try {
          fn();
        } catch (_) {
          /* subscriber errors stay isolated */
        }
      });
    }

    function requireThread(threadId) {
      var t = threads[threadId];
      if (!t) throw new Error('Unknown thread: ' + threadId);
      return t;
    }

    function ensureUi(threadId) {
      if (!ui.perThread[threadId]) {
        ui.perThread[threadId] = defaultThreadUi(threads[threadId] && threads[threadId].goal);
      }
      return ui.perThread[threadId];
    }

    function subscribe(fn) {
      if (typeof fn !== 'function') return function () {};
      listeners.push(fn);
      return function unsubscribe() {
        var i = listeners.indexOf(fn);
        if (i >= 0) listeners.splice(i, 1);
      };
    }

    function getSnapshot() {
      return {
        version: version,
        modelLabel: MODEL_LABEL,
        session: clone(session),
        threads: clone(threads),
        search: clone(search),
        ui: clone(ui),
        demo: clone(demo)
      };
    }

    function selectThread(id) {
      if (!threads[id]) return;
      session.activeThreadKey = id;
      emit();
    }

    function getActiveThread() {
      return session.activeThreadKey ? threads[session.activeThreadKey] || null : null;
    }

    function getVisibleMessages(threadId) {
      var t = requireThread(threadId);
      var n = t.initialVisibleMessageCount | 0;
      if (n <= 0 || n >= t.messages.length) return t.messages.slice();
      return t.messages.slice(t.messages.length - n);
    }

    function ensureMessageVisible(threadId, messageId) {
      var t = requireThread(threadId);
      var idx = -1;
      for (var i = 0; i < t.messages.length; i++) {
        if (t.messages[i].id === messageId) {
          idx = i;
          break;
        }
      }
      if (idx < 0) return false;
      var needed = t.messages.length - idx;
      if (needed > (t.initialVisibleMessageCount | 0)) {
        t.initialVisibleMessageCount = needed;
        emit();
      }
      return true;
    }

    function appendUserMessage(threadId, text) {
      var t = requireThread(threadId);
      var body = text == null ? '' : String(text);
      var msg = {
        id: nextMessageId(t),
        role: 'user',
        body: body,
        sentAt: nowIso(),
        runtime: null,
        eligibleForEdit: true,
        collapsedByDefault: body.length > 900
      };
      t.messages.push(msg);
      t.updatedAt = msg.sentAt;
      t.draft = emptyDraft();
      emit();
      return msg;
    }

    function setRunning(threadId, runState) {
      requireThread(threadId);
      demo.runningByThread[threadId] = runState == null ? null : clone(runState);
      emit();
    }

    function appendAssistantFromReply(threadId, replyObj) {
      var t = requireThread(threadId);
      var reply = replyObj || {};
      var msg = {
        id: nextMessageId(t),
        role: 'assistant',
        body: reply.body != null ? String(reply.body) : '',
        sentAt: nowIso(),
        runtime: reply.runtime ? clone(reply.runtime) : null,
        eligibleForEdit: false,
        collapsedByDefault: false
      };
      if (reply.activitySummary) {
        msg.activityGroup = {
          id: 'activity-' + msg.id,
          status: 'complete',
          compactLabel: reply.activitySummary,
          stages: []
        };
        t.activity.push(clone(msg.activityGroup));
      }
      t.messages.push(msg);
      t.updatedAt = msg.sentAt;
      demo.runningByThread[threadId] = null;
      emit();
      return msg;
    }

    function appendStoppedResult(threadId, stopBody) {
      var t = requireThread(threadId);
      var msg = {
        id: nextMessageId(t),
        role: 'assistant',
        body: stopBody != null ? String(stopBody) : 'Stopped before completion.',
        sentAt: nowIso(),
        runtime: null,
        eligibleForEdit: false,
        collapsedByDefault: false,
        stopped: true
      };
      t.messages.push(msg);
      t.updatedAt = msg.sentAt;
      var run = demo.runningByThread[threadId];
      if (run) {
        run.stopped = true;
        demo.runningByThread[threadId] = run;
      } else {
        demo.runningByThread[threadId] = null;
      }
      emit();
      return msg;
    }

    function advanceScriptedCursor(threadId) {
      var t = requireThread(threadId);
      var len = (t.scriptedReplyIds || []).length;
      if (len > 0) {
        t.scriptedReplyCursor = ((t.scriptedReplyCursor | 0) + 1) % len;
      } else {
        t.scriptedReplyCursor = (t.scriptedReplyCursor | 0) + 1;
      }
      demo.replyCursorByThread[threadId] = t.scriptedReplyCursor;
      emit();
      return t.scriptedReplyCursor;
    }

    function getNextScriptedReply(threadId) {
      var t = requireThread(threadId);
      var ids = t.scriptedReplyIds || [];
      if (!ids.length) return null;
      var cursor = (t.scriptedReplyCursor | 0) % ids.length;
      var id = ids[cursor];
      var reply = scriptedReplies[id];
      return reply ? clone(reply) : null;
    }

    function setDraft(threadId, partial) {
      var t = requireThread(threadId);
      var p = partial || {};
      if (p.text != null) t.draft.text = String(p.text);
      if (p.attachments != null) t.draft.attachments = clone(p.attachments);
      if (Object.prototype.hasOwnProperty.call(p, 'editingMessageId')) {
        t.draft.editingMessageId = p.editingMessageId || null;
      }
      t.draft.updatedAt = nowIso();
      emit();
    }

    /** Edit → send rewind: replace body and drop subsequent messages (demo GAP-005). */
    function applyEditedMessageRewind(threadId, messageId, text) {
      var t = requireThread(threadId);
      var idx = -1;
      for (var i = 0; i < t.messages.length; i++) {
        if (t.messages[i].id === messageId) {
          idx = i;
          break;
        }
      }
      if (idx < 0) return null;
      var body = text == null ? '' : String(text);
      t.messages[idx].body = body;
      t.messages[idx].editedAt = nowIso();
      t.messages[idx].eligibleForEdit = true;
      t.messages = t.messages.slice(0, idx + 1);
      demo.runningByThread[threadId] = null;
      t.draft = emptyDraft();
      t.updatedAt = nowIso();
      emit();
      return t.messages[idx];
    }

    function pushDraftRevision(threadId) {
      var t = requireThread(threadId);
      var text = t.draft.text || '';
      if (!text) return null;
      var last = t.draftRevisions[t.draftRevisions.length - 1];
      if (last && last.text === text) return last;
      var rev = {
        savedAt: nowIso(),
        text: text,
        attachments: clone(t.draft.attachments || [])
      };
      t.draftRevisions.push(rev);
      while (t.draftRevisions.length > DRAFT_REVISION_CAP) t.draftRevisions.shift();
      emit();
      return rev;
    }

    function clearDraft(threadId) {
      var t = requireThread(threadId);
      t.draft = emptyDraft();
      emit();
    }

    function setSearch(partial) {
      var p = partial || {};
      if (p.query != null) search.query = String(p.query);
      if (p.scope === 'current' || p.scope === 'all') search.scope = p.scope;
      if ('selectedResultId' in p) search.selectedResultId = p.selectedResultId;
      if ('focusedTargetMessageId' in p) search.focusedTargetMessageId = p.focusedTargetMessageId;
      if ('highlightUntil' in p) search.highlightUntil = p.highlightUntil;
      emit();
    }

    function searchMessages(opts) {
      var o = opts || {};
      var query = String(o.query != null ? o.query : search.query || '').trim();
      if (!query) return [];
      var scope = o.scope || search.scope || 'current';
      var activeId = o.activeThreadId || session.activeThreadKey;
      var keys =
        scope === 'all'
          ? Object.keys(threads)
          : activeId && threads[activeId]
            ? [activeId]
            : [];
      var qLower = query.toLowerCase();
      var results = [];
      keys.forEach(function (tid) {
        var t = threads[tid];
        t.messages.forEach(function (msg) {
          var body = msg.body != null ? String(msg.body) : '';
          if (body.toLowerCase().indexOf(qLower) === -1) return;
          results.push({
            threadId: tid,
            messageId: msg.id,
            snippet: snippetAround(body, query, 48)
          });
        });
      });
      return results;
    }

    function setLens(threadId, partial) {
      var t = requireThread(threadId);
      var p = partial || {};
      Object.keys(p).forEach(function (k) {
        t.lens[k] = clone(p[k]);
      });
      emit();
    }

    function applyLensMuteFocus(threadId, mode, ids) {
      var t = requireThread(threadId);
      var list = Array.isArray(ids) ? ids.slice(0, 25) : [];
      var m = String(mode || '').toLowerCase();
      if (m !== 'mute' && m !== 'focus') return;
      t.lens.mode = m;
      t.lens.selectionIds = list.slice();
      if (m === 'mute') {
        uniquePush(t.lens.mutedIds, list);
        removeIds(t.lens.focusedIds, list);
      } else {
        uniquePush(t.lens.focusedIds, list);
        removeIds(t.lens.mutedIds, list);
      }
      emit();
    }

    function applyLensSubcompact(threadId, ids, summary) {
      var t = requireThread(threadId);
      var list = Array.isArray(ids) ? ids.slice(0, 25) : [];
      if (!list.length) return null;
      t.lens.mode = 'subcompact';
      t.lens.selectionIds = list.slice();
      var entry = {
        id: 'subcompact-' + Date.now().toString(36),
        sourceIds: list.slice(),
        summary: summary != null ? String(summary) : ''
      };
      t.lens.subcompacts.push(entry);
      removeIds(t.lens.mutedIds, list);
      removeIds(t.lens.focusedIds, list);
      emit();
      return entry;
    }

    function turnOffLens(threadId) {
      var t = requireThread(threadId);
      t.lens.mode = 'off';
      t.lens.selectionIds = [];
      emit();
    }

    function goalAction(threadId, action) {
      var t = requireThread(threadId);
      var act = String(action || '');
      var g = t.goal;
      var threadUi = ensureUi(threadId);

      if (act === 'toggleExpand') {
        if (g) g.expanded = !g.expanded;
        threadUi.goalExpanded = g ? !!g.expanded : !threadUi.goalExpanded;
        emit();
        return;
      }
      if (!g) return;

      if (act === 'pause') {
        g.status = 'paused';
        g.canPause = false;
        g.canResume = true;
        g.canStop = true;
        g.canClear = true;
      } else if (act === 'resume') {
        g.status = 'running';
        g.canPause = true;
        g.canResume = false;
        g.canStop = true;
        g.canClear = true;
      } else if (act === 'stop') {
        g.status = 'stopped';
        g.canPause = false;
        g.canResume = false;
        g.canStop = false;
        g.canClear = true;
      } else if (act === 'clear') {
        t.goal = null;
        threadUi.goalExpanded = false;
      } else if (act === 'edit') {
        g.expanded = true;
        threadUi.goalExpanded = true;
        g.editing = true;
        if (!g.objective && g.summary) g.objective = g.summary;
        if (!g.objective) g.objective = g.title || '';
      } else if (act === 'edit-cancel') {
        g.editing = false;
      } else if (act === 'edit-save') {
        /* Objective text applied by UI before calling; keep flag clear. */
        g.editing = false;
        g.expanded = true;
        threadUi.goalExpanded = true;
      } else if (act === 'replan') {
        g.status = 'replanning';
        g.replanNote =
          'Replan is provisional in this concept (GAP-009) — no planner run; edit the goal or tasks yourself.';
        g.expanded = true;
        threadUi.goalExpanded = true;
        g.canPause = false;
        g.canResume = true;
        g.canStop = true;
        g.canClear = true;
      }
      emit();
    }

    function getActiveQuestionnaire(threadId) {
      var t = requireThread(threadId);
      var qs = t.questionnaires || [];
      var i;
      for (i = 0; i < qs.length; i++) {
        if (qs[i].status === 'incomplete' || qs[i].status === 'active') return qs[i];
      }
      for (i = 0; i < qs.length; i++) {
        if (qs[i].status === 'queued') {
          qs[i].status = 'incomplete';
          emit();
          return qs[i];
        }
      }
      return null;
    }

    function findQuestion(q, questionId) {
      var questions = (q && q.questions) || [];
      for (var i = 0; i < questions.length; i++) {
        if (questions[i].id === questionId) return questions[i];
      }
      return null;
    }

    function answerQuestion(threadId, questionId, answer) {
      var q = getActiveQuestionnaire(threadId);
      if (!q) return false;
      var question = findQuestion(q, questionId);
      if (!question) return false;
      question.skipped = false;
      if (question.kind === 'freeform') {
        question.draft = answer != null ? String(answer) : '';
      } else if (question.kind === 'multi select') {
        question.selected = Array.isArray(answer) ? clone(answer) : answer != null ? [answer] : [];
      } else {
        question.selected = Array.isArray(answer)
          ? clone(answer)
          : answer != null
            ? [answer]
            : [];
      }
      emit();
      return true;
    }

    function skipQuestion(threadId) {
      var q = getActiveQuestionnaire(threadId);
      if (!q) return false;
      var idx = q.currentQuestionIndex | 0;
      var questions = q.questions || [];
      if (idx < 0 || idx >= questions.length) return false;
      questions[idx].skipped = true;
      if (idx < questions.length - 1) q.currentQuestionIndex = idx + 1;
      emit();
      return true;
    }

    /** Answer current question; advance in-place when more remain, else submit. */
    function answerAndAdvanceQuestionnaire(threadId, questionId, answer) {
      if (!answerQuestion(threadId, questionId, answer)) {
        return { ok: false, reason: 'answer' };
      }
      var q = getActiveQuestionnaire(threadId);
      if (!q) return { ok: false, reason: 'none' };
      var idx = q.currentQuestionIndex | 0;
      var questions = q.questions || [];
      if (idx < questions.length - 1) {
        q.currentQuestionIndex = idx + 1;
        emit();
        return { ok: true, advanced: true, done: false };
      }
      var submitted = submitQuestionnaire(threadId);
      return {
        ok: !!(submitted && submitted.ok),
        advanced: false,
        done: !!(submitted && submitted.ok),
        reason: submitted && submitted.reason
      };
    }

    function appendQuestionnaireRecord(thread, questionnaire, status, summary) {
      var pairs = (questionnaire.questions || []).map(function (qq) {
        var answer = '';
        if (qq.skipped) answer = '(skipped)';
        else if (qq.kind === 'freeform') answer = qq.draft || '';
        else if (Array.isArray(qq.selected)) answer = qq.selected.join(', ');
        return { question: qq.prompt, answer: answer };
      });
      var msg = {
        id: nextMessageId(thread),
        role: 'assistant',
        body: summary || 'Questionnaire ' + status + '.',
        sentAt: nowIso(),
        runtime: null,
        eligibleForEdit: false,
        collapsedByDefault: false,
        completedQuestionnaire: {
          id: questionnaire.id,
          status: status,
          summary: summary || questionnaire.id,
          questionsAndAnswers: pairs,
          collapsed: true
        }
      };
      thread.messages.push(msg);
      thread.updatedAt = msg.sentAt;
      return msg;
    }

    function cancelQuestionnaire(threadId) {
      var t = requireThread(threadId);
      var q = getActiveQuestionnaire(threadId);
      if (!q) return false;
      q.status = 'cancelled';
      appendQuestionnaireRecord(t, q, 'cancelled', 'Questionnaire cancelled');
      emit();
      return true;
    }

    function submitQuestionnaire(threadId) {
      var t = requireThread(threadId);
      var q = getActiveQuestionnaire(threadId);
      if (!q) return { ok: false, reason: 'none' };
      var missing = [];
      (q.questions || []).forEach(function (qq) {
        if (!qq.required || qq.skipped) return;
        if (qq.kind === 'freeform') {
          if (!qq.draft) missing.push(qq.id);
        } else if (!qq.selected || !qq.selected.length) {
          missing.push(qq.id);
        }
      });
      if (missing.length) return { ok: false, reason: 'required', missing: missing };
      q.status = 'submitted';
      appendQuestionnaireRecord(t, q, 'submitted', 'Questionnaire submitted');
      emit();
      return { ok: true };
    }

    function toggleMessageExpanded(threadId, messageId) {
      var threadUi = ensureUi(threadId);
      threadUi.expandedMessageIds[messageId] = !threadUi.expandedMessageIds[messageId];
      emit();
    }

    function setScrollAnchor(threadId, anchor) {
      ensureUi(threadId).scrollAnchor = anchor == null ? null : clone(anchor);
      emit();
    }

    function setSelector(key, value) {
      var allowed = {
        personaId: true,
        modelId: true,
        modeId: true,
        effortId: true,
        speedMode: true,
        accessProfile: true,
        providerId: true,
        accountId: true,
        crewId: true,
        worktreeId: true,
        keepThoughtExpandedWhileActive: true,
        activeThreadKey: true,
        historyPinned: true,
        historyMode: true,
        spellcheckEnabled: true
      };
      if (!allowed[key]) return;
      if (key === 'activeThreadKey') {
        selectThread(value);
        return;
      }
      if (key === 'historyPinned') {
        session.historyPinned = !!value;
        session.historyMode = value ? 'pinned_full' : 'closed';
        emit();
        return;
      }
      if (key === 'historyMode') {
        setHistoryMode(value);
        return;
      }
      session[key] = value;
      emit();
    }

    function setHistoryMode(mode) {
      var allowed = { closed: 1, peek: 1, pinned_compact: 1, pinned_full: 1 };
      if (!allowed[mode]) mode = 'closed';
      session.historyMode = mode;
      session.historyPinned = mode === 'pinned_compact' || mode === 'pinned_full';
      emit();
      return mode;
    }

    function pinThread(threadId, pinned) {
      var t = requireThread(threadId);
      t.pinned = pinned != null ? !!pinned : !t.pinned;
      t.updatedAt = nowIso();
      emit();
      return t.pinned;
    }

    function renameThread(threadId, title) {
      var t = requireThread(threadId);
      var next = String(title || '').trim();
      if (!next) return t.title;
      t.title = next;
      t.updatedAt = nowIso();
      emit();
      return t.title;
    }

    function archiveThread(threadId, archived) {
      var t = requireThread(threadId);
      t.archived = archived != null ? !!archived : !t.archived;
      t.updatedAt = nowIso();
      emit();
      return t.archived;
    }

    function deleteThread(threadId) {
      if (!threads[threadId]) return false;
      delete threads[threadId];
      if (ui.perThread) delete ui.perThread[threadId];
      if (session.activeThreadKey === threadId) {
        var keys = Object.keys(threads);
        session.activeThreadKey = keys[0] || null;
      }
      emit();
      return true;
    }

    function branchThread(threadId) {
      var t = requireThread(threadId);
      var nid = 'thread-branch-' + Date.now().toString(36);
      threads[nid] = {
        id: nid,
        title: (t.title || 'Chat') + ' (branch)',
        pinned: false,
        archived: false,
        state: t.state,
        tags: clone(t.tags || []),
        project: t.project,
        updatedAt: nowIso(),
        messages: clone(t.messages || []),
        draft: emptyDraft(),
        draftRevisions: [],
        lens: defaultLens(),
        goal: t.goal ? clone(t.goal) : null,
        todos: t.todos ? clone(t.todos) : null,
        subagentGroups: clone(t.subagentGroups || []),
        diffGroups: clone(t.diffGroups || []),
        activity: clone(t.activity || []),
        questionnaires: [],
        artifacts: clone(t.artifacts || []),
        browserSessions: clone(t.browserSessions || []),
        scriptedReplyIds: clone(t.scriptedReplyIds || []),
        scriptedReplyCursor: t.scriptedReplyCursor | 0,
        initialVisibleMessageCount: (t.messages || []).length
      };
      ui.perThread[nid] = defaultThreadUi(threads[nid].goal);
      session.activeThreadKey = nid;
      emit();
      return nid;
    }

    function addAttachment(threadId, attachment) {
      var t = requireThread(threadId);
      if (!t.draft.attachments) t.draft.attachments = [];
      t.draft.attachments.push(
        attachment && typeof attachment === 'object'
          ? clone(attachment)
          : {
              id: 'att-' + Date.now().toString(36),
              name: String(attachment || 'file.txt')
            }
      );
      t.draft.updatedAt = nowIso();
      emit();
      return t.draft.attachments;
    }

    function removeAttachment(threadId, index) {
      var t = requireThread(threadId);
      var list = t.draft.attachments || [];
      var i = index | 0;
      if (i < 0 || i >= list.length) return list;
      list.splice(i, 1);
      t.draft.updatedAt = nowIso();
      emit();
      return list;
    }

    function serializeState() {
      var threadPayload = Object.create(null);
      Object.keys(threads).forEach(function (key) {
        var t = threads[key];
        threadPayload[key] = {
          id: t.id,
          title: t.title,
          pinned: t.pinned,
          archived: t.archived,
          state: t.state,
          tags: clone(t.tags),
          project: t.project,
          messages: clone(t.messages),
          draft: clone(t.draft),
          draftRevisions: clone(t.draftRevisions),
          lens: clone(t.lens),
          goal: clone(t.goal),
          todos: clone(t.todos),
          subagentGroups: clone(t.subagentGroups),
          diffGroups: clone(t.diffGroups),
          activity: clone(t.activity),
          questionnaires: clone(t.questionnaires),
          artifacts: clone(t.artifacts),
          browserSessions: clone(t.browserSessions),
          scriptedReplyIds: clone(t.scriptedReplyIds),
          scriptedReplyCursor: t.scriptedReplyCursor,
          initialVisibleMessageCount: t.initialVisibleMessageCount
        };
      });
      return {
        version: 1,
        modelLabel: MODEL_LABEL,
        session: clone(session),
        search: clone(search),
        ui: clone(ui),
        demo: clone(demo),
        threads: threadPayload
      };
    }

    function restoreState(snapshot) {
      if (!snapshot || typeof snapshot !== 'object') return false;
      if (snapshot.session) {
        Object.keys(session).forEach(function (k) {
          if (k in snapshot.session) session[k] = clone(snapshot.session[k]);
        });
      }
      if (snapshot.search) {
        Object.keys(search).forEach(function (k) {
          if (k in snapshot.search) search[k] = clone(snapshot.search[k]);
        });
      }
      if (snapshot.ui && snapshot.ui.perThread) {
        Object.keys(snapshot.ui.perThread).forEach(function (key) {
          ui.perThread[key] = clone(snapshot.ui.perThread[key]);
        });
      }
      if (snapshot.demo) {
        if (snapshot.demo.replyCursorByThread) {
          demo.replyCursorByThread = clone(snapshot.demo.replyCursorByThread);
        }
        if (snapshot.demo.runningByThread) {
          demo.runningByThread = clone(snapshot.demo.runningByThread);
        }
      }
      if (snapshot.threads) {
        Object.keys(snapshot.threads).forEach(function (key) {
          var src = snapshot.threads[key];
          if (!src || typeof src !== 'object') return;
          if (!threads[key]) {
            /* Demo-created threads must survive serialize → remount / ?restore=1. */
            threads[key] = {
              id: src.id || key,
              title: src.title || key,
              pinned: !!src.pinned,
              archived: !!src.archived,
              state: src.state != null ? src.state : null,
              tags: clone(src.tags || []),
              project: src.project != null ? clone(src.project) : null,
              updatedAt: src.updatedAt || null,
              messages: clone(src.messages || []),
              draft: clone(src.draft || emptyDraft()),
              draftRevisions: clone(src.draftRevisions || []),
              lens: clone(src.lens || defaultLens()),
              goal: src.goal != null ? clone(src.goal) : null,
              todos: src.todos != null ? clone(src.todos) : null,
              subagentGroups: clone(src.subagentGroups || []),
              diffGroups: clone(src.diffGroups || []),
              activity: clone(src.activity || []),
              questionnaires: clone(src.questionnaires || []),
              artifacts: clone(src.artifacts || []),
              browserSessions: clone(src.browserSessions || []),
              scriptedReplyIds: clone(src.scriptedReplyIds || []),
              scriptedReplyCursor: src.scriptedReplyCursor | 0,
              initialVisibleMessageCount: src.initialVisibleMessageCount | 0
            };
            if (!ui.perThread[key]) ui.perThread[key] = defaultThreadUi(threads[key].goal);
            if (!(key in demo.replyCursorByThread)) {
              demo.replyCursorByThread[key] = threads[key].scriptedReplyCursor | 0;
            }
            if (!(key in demo.runningByThread)) demo.runningByThread[key] = null;
            return;
          }
          var t = threads[key];
          [
            'title',
            'pinned',
            'archived',
            'state',
            'tags',
            'project',
            'messages',
            'draft',
            'draftRevisions',
            'lens',
            'goal',
            'todos',
            'subagentGroups',
            'diffGroups',
            'activity',
            'questionnaires',
            'artifacts',
            'browserSessions',
            'scriptedReplyIds',
            'scriptedReplyCursor',
            'initialVisibleMessageCount'
          ].forEach(function (field) {
            if (field in src) t[field] = clone(src[field]);
          });
        });
      }
      emit();
      return true;
    }

    function getTestState() {
      var state = serializeState();
      window.__pmChatState = state;
      return state;
    }

    var store = {
      modelLabel: MODEL_LABEL,
      formatStatus: formatStatus,
      subscribe: subscribe,
      getSnapshot: getSnapshot,
      selectThread: selectThread,
      getActiveThread: getActiveThread,
      getVisibleMessages: getVisibleMessages,
      ensureMessageVisible: ensureMessageVisible,
      appendUserMessage: appendUserMessage,
      setRunning: setRunning,
      appendAssistantFromReply: appendAssistantFromReply,
      appendStoppedResult: appendStoppedResult,
      advanceScriptedCursor: advanceScriptedCursor,
      getNextScriptedReply: getNextScriptedReply,
      setDraft: setDraft,
      applyEditedMessageRewind: applyEditedMessageRewind,
      pushDraftRevision: pushDraftRevision,
      clearDraft: clearDraft,
      setSearch: setSearch,
      searchMessages: searchMessages,
      setLens: setLens,
      applyLensMuteFocus: applyLensMuteFocus,
      applyLensSubcompact: applyLensSubcompact,
      turnOffLens: turnOffLens,
      goalAction: goalAction,
      getActiveQuestionnaire: getActiveQuestionnaire,
      answerQuestion: answerQuestion,
      skipQuestion: skipQuestion,
      cancelQuestionnaire: cancelQuestionnaire,
      answerAndAdvanceQuestionnaire: answerAndAdvanceQuestionnaire,
      submitQuestionnaire: submitQuestionnaire,
      toggleMessageExpanded: toggleMessageExpanded,
      setScrollAnchor: setScrollAnchor,
      setSelector: setSelector,
      setHistoryMode: setHistoryMode,
      _emit: emit,
      notify: emit,
      pinThread: pinThread,
      renameThread: renameThread,
      archiveThread: archiveThread,
      deleteThread: deleteThread,
      branchThread: branchThread,
      addAttachment: addAttachment,
      removeAttachment: removeAttachment,
      serializeState: serializeState,
      restoreState: restoreState,
      getTestState: getTestState,
      // live handles for host wiring (same object identity across gets)
      get session() {
        return session;
      },
      get threads() {
        return threads;
      },
      get search() {
        return search;
      },
      get ui() {
        return ui;
      },
      get demo() {
        return demo;
      }
    };

    getTestState();
    return store;
  }

  window.PMChatStore = {
    create: create,
    formatStatus: formatStatus
  };
})();
