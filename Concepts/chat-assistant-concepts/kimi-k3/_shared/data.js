/* ============================================================================
   Kimi K3 — demo data facade (window.K3Data).

   Merges window.K3_DEMO_DATA with the window.K3_DEMO_AUGMENT overlay and
   serves the whole prototype: thread listing, message access, full-body
   search, scripted replies with working/stop lifecycle, drafts, thread
   management, Context Lens state, and questionnaires.

   - No fetch: the dataset ships as JS and is cloned in memory at init.
   - Everything is synchronous after init; scripted replies pace themselves
     with setTimeout and report through K3.emit('data', evt).
   - Durable UI-facing state (drafts, lens, questionnaires) lives in the
     K3Store semantic slice so it survives remount and simulated restart.
   - New record ids are prefixed 'k3-'; timestamps are UTC ISO strings.
   ========================================================================== */
(function () {
  'use strict';

  var LENS_SELECT_CAP = 25;
  var DRAFT_REVISION_CAP = 8;

  // --- module state ---------------------------------------------------------
  var DATA = null;              // merged, mutable dataset
  var threadsById = {};         // threadId -> thread
  var messageIndex = {};        // messageId -> {threadId, message}
  var lowerBodies = {};         // messageId -> lowercase body (search index)
  var replyById = {};           // replyId -> scripted reply
  var lensExamplesByThread = {};// threadId -> applied lens from the augment
  var rng = mulberry32(1);
  var idCounter = 0;
  var working = {};             // threadId -> {summary, startedAtMs, replyId, reply, timers[]}

  // --- small helpers --------------------------------------------------------
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function nowIso() { return new Date().toISOString(); }
  function uid(kind) {
    idCounter += 1;
    return 'k3-' + kind + '-' + Date.now().toString(36) + '-' + idCounter;
  }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function isObj(v) { return v != null && typeof v === 'object'; }
  function arr(v) { return Array.isArray(v) ? v : []; }

  function emit(evt) {
    if (typeof window !== 'undefined' && window.K3 && typeof window.K3.emit === 'function') {
      window.K3.emit('data', evt);
    }
  }
  function storeGet(path, fallback) {
    var s = (typeof window !== 'undefined') && window.K3Store;
    return (s && typeof s.get === 'function') ? s.get(path, fallback) : fallback;
  }
  function storeSet(path, value) {
    var s = (typeof window !== 'undefined') && window.K3Store;
    if (s && typeof s.set === 'function') s.set(path, value);
  }

  function indexMessage(threadId, message) {
    messageIndex[message.id] = { threadId: threadId, message: message };
    lowerBodies[message.id] = String(message.body || '').toLowerCase();
  }
  function reindexThread(thread) {
    arr(thread.messages).forEach(function (m) { indexMessage(thread.id, m); });
  }
  function latestAssistantRuntime(thread) {
    var msgs = arr(thread && thread.messages);
    for (var i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'assistant' && isObj(msgs[i].runtime)) return msgs[i].runtime;
    }
    return null;
  }
  function runtimeTemplate(thread) {
    var src = latestAssistantRuntime(thread) || {};
    return {
      provider: src.provider || 'Moonshot',
      model: src.model || 'Kimi K3',
      persona: src.persona || 'Assistant',
      mode: src.mode || 'Agent',
      effort: src.effort || 'Medium',
      workedSeconds: 0,
      totalElapsedSeconds: 0,
      tokenCount: 0,
      contextUsed: src.contextUsed || 0,
      contextLimit: src.contextLimit || 128000,
      estimatedCost: 0
    };
  }

  // --- init / merge -----------------------------------------------------------
  function applyPatch(patch) {
    var hit = patch && messageIndex[patch.id];
    if (!hit || !isObj(patch.set)) return false;
    var msg = hit.message;
    Object.keys(patch.set).forEach(function (key) {
      if (key === 'runtime' && isObj(patch.set.runtime) && isObj(msg.runtime)) {
        Object.assign(msg.runtime, patch.set.runtime);
      } else {
        msg[key] = patch.set[key];
      }
    });
    lowerBodies[msg.id] = String(msg.body || '').toLowerCase();
    return true;
  }
  function applyInsert(ins) {
    var thread = ins && threadsById[ins.threadId];
    if (!thread || !isObj(ins.message)) return false;
    var msgs = arr(thread.messages);
    var at = -1;
    for (var i = 0; i < msgs.length; i++) {
      if (msgs[i].id === ins.afterMessageId) { at = i; break; }
    }
    if (at < 0) at = msgs.length - 1;
    msgs.splice(at + 1, 0, ins.message);
    thread.messages = msgs;
    indexMessage(thread.id, ins.message);
    return true;
  }

  function seedDraftsFromDataset() {
    var existing = storeGet('drafts', null);
    if (existing && Object.keys(existing).length > 0) return; // persisted state wins
    var drafts = {};
    DATA.threads.forEach(function (t) {
      var d = t.draftState;
      if (!d) return;
      var hasText = typeof d.currentText === 'string' && d.currentText.length > 0;
      var hasRevs = arr(d.revisionHistory).length > 0;
      var hasAttach = arr(d.attachments).length > 0;
      if (!hasText && !hasRevs && !hasAttach) return;
      drafts[t.id] = {
        text: hasText ? d.currentText : '',
        attachments: arr(d.attachments).slice(),
        revisions: arr(d.revisionHistory).slice(-DRAFT_REVISION_CAP)
      };
    });
    if (Object.keys(drafts).length > 0) storeSet('drafts', drafts);
  }

  function seedLensFromAugment() {
    var lens = storeGet('lens', {}) || {};
    var changed = false;
    Object.keys(lensExamplesByThread).forEach(function (threadId) {
      if (lens[threadId]) return; // persisted user state wins
      var applied = lensExamplesByThread[threadId];
      lens[threadId] = {
        mode: null,
        selecting: false,
        selectedIds: [],
        applied: {
          muted: arr(applied.muted).slice(),
          focused: arr(applied.focused).slice(),
          subcompacted: arr(applied.subcompacted).map(function (s) {
            return { ids: arr(s.ids).slice(), summary: String(s.summary || '') };
          })
        }
      };
      changed = true;
    });
    if (changed) storeSet('lens', lens);
  }

  // --- scripted reply lifecycle ----------------------------------------------
  function jitter(ms) { return Math.max(40, Math.round(ms * (0.8 + rng() * 0.4))); }

  function clearWorking(threadId) {
    var w = working[threadId];
    if (!w) return;
    w.timers.forEach(clearTimeout);
    delete working[threadId];
  }

  function appendMessage(thread, message) {
    thread.messages = arr(thread.messages);
    thread.messages.push(message);
    thread.updatedAt = nowIso();
    indexMessage(thread.id, message);
    emit({ type: 'message-added', threadId: thread.id, message: message });
    return message;
  }

  function startScriptedReply(thread) {
    var ids = arr(thread.scriptedReplyIds);
    if (ids.length === 0) { emit({ type: 'idle', threadId: thread.id }); return; }
    var cursor = typeof thread.scriptedReplyCursor === 'number' ? thread.scriptedReplyCursor : 0;
    var reply = replyById[ids[cursor % ids.length]];
    thread.scriptedReplyCursor = (cursor + 1) % ids.length; // cycles even on stop
    if (!reply) { emit({ type: 'idle', threadId: thread.id }); return; }

    var sequence = arr(reply.workingSummarySequence);
    var durations = arr(reply.stepDurationsMs);
    var first = sequence[0] || 'Working on a reply';
    var w = {
      summary: first,
      startedAtMs: Date.now(),
      replyId: reply.id,
      reply: reply,
      timers: []
    };
    working[thread.id] = w;
    emit({
      type: 'working', threadId: thread.id,
      working: { active: true, summary: first, startedAt: new Date(w.startedAtMs).toISOString(), replyId: reply.id }
    });

    var elapsed = 0;
    for (var i = 0; i < sequence.length; i++) {
      elapsed += jitter(durations[i] != null ? durations[i] : 600);
      (function (stepIndex, atMs) {
        w.timers.push(setTimeout(function () {
          if (!working[thread.id]) return;
          if (stepIndex < sequence.length) {
            w.summary = sequence[stepIndex];
            emit({ type: 'working-step', threadId: thread.id, summary: w.summary });
          } else {
            finishScriptedReply(thread, w);
          }
        }, atMs));
      })(i + 1, elapsed);
    }
    if (sequence.length === 0) {
      w.timers.push(setTimeout(function () { finishScriptedReply(thread, w); }, 400));
    }
  }

  function finishScriptedReply(thread, w) {
    if (!working[thread.id]) return;
    clearWorking(thread.id);
    var reply = w.reply;
    var runtime = Object.assign({}, reply.runtime);
    var message = {
      id: uid('msg'),
      role: 'assistant',
      body: String(reply.body || ''),
      sentAt: nowIso(),
      runtime: runtime,
      eligibleForEdit: false,
      collapsedByDefault: false,
      activityGroup: {
        id: uid('activity'),
        status: 'complete',
        workedSeconds: runtime.workedSeconds || 0,
        compactLabel: String(reply.activitySummary || 'Reply completed'),
        stages: [
          {
            kind: 'completion',
            label: 'Completed scripted reply',
            durationSeconds: runtime.workedSeconds || 0,
            status: 'complete',
            summary: String(reply.activitySummary || 'Reply completed')
          }
        ]
      }
    };
    appendMessage(thread, message);
    emit({ type: 'idle', threadId: thread.id });
  }

  // --- Context Lens helpers ---------------------------------------------------
  function blankApplied() { return { muted: [], focused: [], subcompacted: [] }; }
  function readLens(threadId) {
    var raw = storeGet('lens.' + threadId, null);
    var applied = blankApplied();
    if (raw && isObj(raw.applied)) {
      applied.muted = arr(raw.applied.muted).slice();
      applied.focused = arr(raw.applied.focused).slice();
      applied.subcompacted = arr(raw.applied.subcompacted).map(function (s) {
        return { ids: arr(s.ids).slice(), summary: String(s.summary || '') };
      });
    }
    return {
      selecting: !!(raw && raw.selecting),
      mode: raw && raw.mode != null ? raw.mode : null,
      selectedIds: arr(raw && raw.selectedIds).slice(),
      applied: applied
    };
  }
  function writeLens(threadId, lens) { storeSet('lens.' + threadId, lens); }

  // --- questionnaire helpers --------------------------------------------------
  function readQState(threadId, qid) {
    var all = storeGet('questionnaires.' + threadId, null);
    var s = all && all[qid];
    return {
      answers: (s && isObj(s.answers)) ? s.answers : {},
      skipped: (s && isObj(s.skipped)) ? s.skipped : {},
      currentIndex: (s && typeof s.currentIndex === 'number') ? s.currentIndex : null,
      status: (s && typeof s.status === 'string') ? s.status : null,
      resolvedAt: (s && typeof s.resolvedAt === 'string') ? s.resolvedAt : null
    };
  }
  function writeQState(threadId, qid, state) {
    var all = storeGet('questionnaires.' + threadId, {}) || {};
    all[qid] = state;
    storeSet('questionnaires.' + threadId, all);
  }
  function isUnresolvedStatus(status) { return status === 'incomplete' || status === 'queued'; }
  function mergedQuestionnaire(thread, q) {
    var st = readQState(thread.id, q.id);
    var questions = arr(q.questions).map(function (qq) {
      var copy = Object.assign({}, qq);
      var answer = st.answers[qq.id];
      if (qq.kind === 'freeform') {
        copy.draft = typeof answer === 'string' ? answer : String(qq.draft || '');
        copy.selected = arr(qq.selected).slice();
      } else {
        copy.selected = Array.isArray(answer) ? answer.slice() : arr(qq.selected).slice();
        copy.options = arr(qq.options).slice();
      }
      copy.skipped = st.skipped[qq.id] === true;
      return copy;
    });
    return {
      id: q.id,
      status: st.status || q.status || 'incomplete',
      createdAt: q.createdAt || null,
      currentQuestionIndex: st.currentIndex != null ? st.currentIndex : (q.currentQuestionIndex || 0),
      resolvedAt: st.resolvedAt,
      questions: questions
    };
  }
  function baseQuestionnaire(thread, qid) {
    var list = arr(thread && thread.questionnaires);
    for (var i = 0; i < list.length; i++) if (list[i].id === qid) return list[i];
    return null;
  }
  // A resolved questionnaire stays in the transcript as a historical record.
  function appendQuestionnaireRecord(thread, mq, resolution) {
    var firstPrompt = mq.questions.length ? mq.questions[0].prompt : mq.id;
    var verb = resolution === 'submitted' ? 'Questionnaire submitted' : 'Questionnaire cancelled';
    var answeredCount = mq.questions.filter(function (qq) {
      if (qq.kind === 'freeform') return typeof qq.draft === 'string' && qq.draft.trim().length > 0;
      return arr(qq.selected).length > 0;
    }).length;
    var body = resolution === 'submitted'
      ? verb + ' — ' + firstPrompt + ' (' + answeredCount + ' of ' + mq.questions.length + ' questions answered.)'
      : verb + ' — ' + firstPrompt + ' (No answers were applied.)';
    var message = {
      id: uid('msg'),
      role: 'assistant',
      body: body,
      sentAt: nowIso(),
      runtime: runtimeTemplate(thread),
      eligibleForEdit: false,
      collapsedByDefault: false,
      completedQuestionnaire: JSON.parse(JSON.stringify(mq))
    };
    message.completedQuestionnaire.status = resolution;
    appendMessage(thread, message);
    return message;
  }

  // === public facade ===========================================================
  var K3Data = {
    ready: false,

    init: function (opts) {
      var seed = (opts && typeof opts.seed === 'number') ? opts.seed : 1;
      rng = mulberry32(seed || 1);
      var base = (typeof window !== 'undefined') && window.K3_DEMO_DATA;
      if (!base || !Array.isArray(base.threads)) {
        throw new Error('K3Data.init: window.K3_DEMO_DATA with a threads array is required (load _shared/demo-data.js first).');
      }
      DATA = JSON.parse(JSON.stringify(base));
      threadsById = {};
      messageIndex = {};
      lowerBodies = {};
      replyById = {};
      lensExamplesByThread = {};
      working = {};

      DATA.threads.forEach(function (t) {
        threadsById[t.id] = t;
        reindexThread(t);
      });
      arr(DATA.scriptedReplies).forEach(function (r) { replyById[r.id] = r; });

      var aug = (typeof window !== 'undefined') && window.K3_DEMO_AUGMENT;
      if (aug) {
        arr(aug.messagePatches).forEach(applyPatch);
        arr(aug.messageInserts).forEach(applyInsert);
        arr(aug.lensExamples).forEach(function (ex) {
          if (ex && ex.threadId) lensExamplesByThread[ex.threadId] = ex.applied || blankApplied();
        });
      }

      // Final cumulative packet overlay (merged AFTER the augment; same
      // mechanics plus whole-thread appends, catalogs, and store seeds).
      var pkt = (typeof window !== 'undefined') && window.K3_DEMO_PACKET;
      if (pkt) {
        arr(pkt.messagePatches).forEach(applyPatch);
        arr(pkt.messageInserts).forEach(applyInsert);
        arr(pkt.threadAppends).forEach(function (t) {
          if (!t || !t.id || threadsById[t.id]) return;
          var copy = JSON.parse(JSON.stringify(t));
          DATA.threads.push(copy);
          threadsById[copy.id] = copy;
          reindexThread(copy);
        });
        if (isObj(pkt.catalogs)) {
          DATA.catalogs = JSON.parse(JSON.stringify(pkt.catalogs));
        }
        if (isObj(pkt.storeSeeds)) {
          Object.keys(pkt.storeSeeds).forEach(function (key) {
            var seedVal = pkt.storeSeeds[key];
            var cur = storeGet(key, null);
            if (isObj(seedVal) && !Array.isArray(seedVal)) {
              // blankSemantic ships empty objects for these keys, so merge
              // missing subkeys instead of testing the top-level for null.
              var merged = isObj(cur) ? cur : {};
              var changed = false;
              Object.keys(seedVal).forEach(function (sub) {
                if (merged[sub] == null) { merged[sub] = JSON.parse(JSON.stringify(seedVal[sub])); changed = true; }
              });
              if (changed) storeSet(key, merged);
            } else if (cur == null) {
              storeSet(key, JSON.parse(JSON.stringify(seedVal)));
            }
          });
        }
      }

      seedDraftsFromDataset();
      seedLensFromAugment();
      K3Data.ready = true;
      return K3Data.stats();
    },

    stats: function () {
      var messages = 0;
      arr(DATA && DATA.threads).forEach(function (t) { messages += arr(t.messages).length; });
      return {
        threads: DATA ? DATA.threads.length : 0,
        messages: messages,
        replies: DATA ? arr(DATA.scriptedReplies).length : 0
      };
    },

    listThreads: function () {
      return arr(DATA && DATA.threads).map(function (t) {
        var msgs = arr(t.messages);
        var last = msgs[msgs.length - 1];
        var body = last ? String(last.body || '') : '';
        var draft = K3Data.getDraft(t.id);
        var pending = K3Data.questionnaires(t.id).filter(function (q) { return isUnresolvedStatus(q.status); }).length;
        var initCount = typeof t.initialVisibleMessageCount === 'number' ? t.initialVisibleMessageCount : msgs.length;
        return {
          id: t.id,
          title: t.title || t.id,
          project: t.project || '',
          pinned: !!t.pinned,
          archived: !!t.archived,
          threadState: t.threadState || 'idle',
          updatedAt: t.updatedAt || null,
          messageCount: msgs.length,
          preview: body.length > 90 ? body.slice(0, 90).trim() + '...' : body,
          hasGoal: !!t.activeGoal,
          goalStatus: t.activeGoal ? (t.activeGoal.status || null) : null,
          hasTodo: !!t.todo,
          hasSubagents: arr(t.subagentGroups).length > 0,
          hasDiff: arr(t.diffGroups).length > 0,
          questionnairePending: pending,
          hasDraft: !!(draft && ((draft.text && draft.text.length > 0) || arr(draft.revisions).length > 0)),
          hasArtifacts: arr(t.artifacts).length > 0,
          hasBrowser: arr(t.browserSessions).length > 0,
          longHistory: msgs.length > initCount
        };
      });
    },

    thread: function (id) { return threadsById[id] || null; },
    messages: function (id) {
      var t = threadsById[id];
      return t ? arr(t.messages) : [];
    },
    message: function (id) {
      var hit = messageIndex[id];
      return hit ? hit.message : null;
    },

    visibleWindow: function (id) {
      var t = threadsById[id];
      var total = t ? arr(t.messages).length : 0;
      var initial = t && typeof t.initialVisibleMessageCount === 'number' ? t.initialVisibleMessageCount : total;
      return { total: total, initialCount: clamp(initial, 0, total) };
    },

    search: function (query, opts) {
      var empty = { results: [], grouped: {} };
      if (typeof query !== 'string' || query.trim() === '') return empty;
      var q = query.toLowerCase();
      var scope = (opts && opts.scope) || 'all';
      var threadId = opts && opts.threadId;
      if (scope === 'current') {
        threadId = threadId || storeGet('activeThreadId', null);
        if (!threadId || !threadsById[threadId]) return empty;
      }
      var results = [];
      var grouped = {};
      arr(DATA && DATA.threads).forEach(function (t) {
        if (scope === 'current' && t.id !== threadId) return;
        if (opts && opts.threadId && scope !== 'current' && t.id !== threadId) return;
        arr(t.messages).forEach(function (m) {
          var lower = lowerBodies[m.id];
          if (lower == null) return;
          var idx = lower.indexOf(q);
          if (idx < 0) return;
          var bodyStr = String(m.body || '');
          var start = Math.max(0, idx - 70);
          var end = Math.min(bodyStr.length, idx + query.length + 70);
          var snippet = (start > 0 ? '...' : '') + bodyStr.slice(start, end).trim() + (end < bodyStr.length ? '...' : '');
          var lensState = K3Data.messageLensState(t.id, m.id);
          var collapsed = m.collapsedByDefault === true || storeGet('collapsedMessages.' + m.id, false) === true;
          if (storeGet('expandedMessages.' + m.id, false) === true) collapsed = false;
          var isSummary = readLens(t.id).applied.subcompacted.some(function (s) {
            return s.summary && bodyStr === s.summary;
          });
          results.push({
            threadId: t.id,
            threadTitle: t.title || t.id,
            messageId: m.id,
            role: m.role || 'assistant',
            snippet: snippet,
            lensState: lensState,
            inCollapsedRegion: collapsed,
            isSubcompactSummary: isSummary
          });
          grouped[t.id] = (grouped[t.id] || 0) + 1;
        });
      });
      return { results: results, grouped: grouped };
    },

    // --- composer / scripted replies -----------------------------------------
    // opts: {opId, queued, noReply}. opId fences idempotent offline replay:
    // a second send carrying an already-applied opId is skipped (returns null).
    send: function (threadId, text, opts) {
      var thread = threadsById[threadId];
      if (!thread) return null;
      var opId = opts && typeof opts.opId === 'string' ? opts.opId : null;
      var applied = null;
      if (opId) {
        applied = storeGet('appliedOps', {}) || {};
        if (applied[opId]) return null; // already applied — skipped
      }
      var message = {
        id: uid('msg'),
        role: 'user',
        body: String(text == null ? '' : text), // appended exactly as typed
        sentAt: nowIso(),
        runtime: runtimeTemplate(thread),
        eligibleForEdit: true,
        collapsedByDefault: false
      };
      if (opId) message.opId = opId;
      if (opts && opts.queued) message.queued = true; // "Queued to send" badge
      appendMessage(thread, message);
      if (opId) {
        applied[opId] = true;
        storeSet('appliedOps', applied);
      }
      if (opts && opts.noReply) return message;
      if (working[threadId]) return message; // steering: never restart or stop
      startScriptedReply(thread);
      return message;
    },

    // Clear the offline "Queued to send" badge after a successful replay.
    markMessageSent: function (threadId, opId) {
      var thread = threadsById[threadId];
      if (!thread) return false;
      var msgs = arr(thread.messages);
      for (var i = 0; i < msgs.length; i++) {
        if (msgs[i].opId === opId && msgs[i].queued) {
          msgs[i].queued = false;
          emit({ type: 'outbox-changed', threadId: threadId });
          return true;
        }
      }
      return false;
    },

    stop: function (threadId) {
      var thread = threadsById[threadId];
      var w = working[threadId];
      if (!thread || !w) return false;
      var elapsedSeconds = Math.round(((Date.now() - w.startedAtMs) / 1000) * 10) / 10;
      var reply = w.reply || {};
      clearWorking(threadId);
      var runtime = Object.assign({}, reply.runtime, { workedSeconds: elapsedSeconds });
      var message = {
        id: uid('msg'),
        role: 'assistant',
        body: String(reply.stopResultBody || 'The reply was stopped before completion.'),
        sentAt: nowIso(),
        runtime: runtime,
        eligibleForEdit: false,
        collapsedByDefault: false,
        isStoppedResult: true
      };
      thread.messages = arr(thread.messages);
      thread.messages.push(message);
      thread.updatedAt = nowIso();
      indexMessage(threadId, message);
      emit({ type: 'stopped', threadId: threadId, message: message });
      emit({ type: 'idle', threadId: threadId });
      return true;
    },

    workingState: function (threadId) {
      var w = working[threadId];
      if (!w) return null;
      return {
        active: true,
        summary: w.summary,
        startedAt: new Date(w.startedAtMs).toISOString(),
        workedSeconds: function () {
          return Math.round(((Date.now() - w.startedAtMs) / 1000) * 10) / 10;
        }
      };
    },

    isActive: function (threadId) { return !!working[threadId]; },

    // --- drafts (durable via the K3Store 'drafts' slice) -----------------------
    getDraft: function (threadId) {
      var d = storeGet('drafts.' + threadId, null);
      if (!d || !isObj(d)) return null;
      return {
        text: typeof d.text === 'string' ? d.text : '',
        attachments: arr(d.attachments).slice(),
        revisions: arr(d.revisions).slice()
      };
    },
    saveDraft: function (threadId, text, attachments) {
      var cur = K3Data.getDraft(threadId) || { text: '', attachments: [], revisions: [] };
      var next = {
        text: String(text == null ? '' : text),
        attachments: attachments != null ? arr(attachments).slice() : cur.attachments,
        revisions: cur.revisions
      };
      storeSet('drafts.' + threadId, next);
      var t = threadsById[threadId];
      if (t) {
        t.draftState = {
          currentText: next.text,
          attachments: next.attachments.slice(),
          revisionHistory: next.revisions.slice()
        };
      }
      return next;
    },
    pushRevision: function (threadId) {
      var cur = K3Data.getDraft(threadId) || { text: '', attachments: [], revisions: [] };
      var revisions = cur.revisions.slice();
      var last = revisions[revisions.length - 1];
      if (!last || last.text !== cur.text) { // dedupe identical consecutive
        revisions.push({ savedAt: nowIso(), text: cur.text });
        if (revisions.length > DRAFT_REVISION_CAP) revisions = revisions.slice(-DRAFT_REVISION_CAP);
      }
      var next = { text: cur.text, attachments: cur.attachments, revisions: revisions };
      storeSet('drafts.' + threadId, next);
      var t = threadsById[threadId];
      if (t) {
        t.draftState = {
          currentText: next.text,
          attachments: next.attachments.slice(),
          revisionHistory: next.revisions.slice()
        };
      }
      return revisions;
    },
    clearDraft: function (threadId) { // distinct from send: sending never clears
      storeSet('drafts.' + threadId, null);
      var t = threadsById[threadId];
      if (t) t.draftState = { currentText: '', attachments: [], revisionHistory: [] };
    },

    // --- thread management ------------------------------------------------------
    createThread: function (title) {
      var genericReplies = arr(DATA.scriptedReplies).slice(0, 3).map(function (r) { return r.id; });
      var thread = {
        id: uid('thread'),
        title: String(title || 'New thread'),
        project: 'Puppet Master',
        pinned: false,
        archived: false,
        threadState: 'idle',
        updatedAt: nowIso(),
        initialVisibleMessageCount: 50,
        messages: [],
        subagentGroups: [],
        diffGroups: [],
        questionnaires: [],
        artifacts: [],
        browserSessions: [],
        draftState: null,
        scriptedReplyCursor: 0,
        scriptedReplyIds: genericReplies,
        tags: [],
        isNew: true
      };
      DATA.threads.unshift(thread);
      threadsById[thread.id] = thread;
      emit({ type: 'threads-changed' });
      return thread;
    },
    renameThread: function (id, title) {
      var t = threadsById[id];
      if (!t) return false;
      t.title = String(title || t.title);
      t.updatedAt = nowIso();
      emit({ type: 'threads-changed' });
      return true;
    },
    pinThread: function (id, pinned) {
      var t = threadsById[id];
      if (!t) return false;
      t.pinned = !!pinned;
      emit({ type: 'threads-changed' });
      return true;
    },
    archiveThread: function (id, archived) {
      var t = threadsById[id];
      if (!t) return false;
      t.archived = !!archived;
      emit({ type: 'threads-changed' });
      return true;
    },
    deleteThread: function (id) {
      var idx = arr(DATA && DATA.threads).findIndex(function (t) { return t.id === id; });
      if (idx < 0) return false;
      clearWorking(id);
      arr(DATA.threads[idx].messages).forEach(function (m) {
        delete messageIndex[m.id];
        delete lowerBodies[m.id];
      });
      DATA.threads.splice(idx, 1);
      delete threadsById[id];
      emit({ type: 'threads-changed' });
      return true;
    },
    exportThread: function (id) {
      var t = threadsById[id];
      return t ? JSON.stringify(t, null, 2) : null;
    },
    branchThread: function (id, atMessageId) {
      var src = threadsById[id];
      if (!src) return null;
      var msgs = arr(src.messages);
      var at = msgs.findIndex(function (m) { return m.id === atMessageId; });
      if (at < 0) at = msgs.length - 1;
      var cloned = msgs.slice(0, at + 1).map(function (m) {
        var copy = JSON.parse(JSON.stringify(m));
        copy.id = uid('msg');
        return copy;
      });
      var thread = {
        id: uid('thread'),
        title: 'Branch of ' + (src.title || src.id),
        project: src.project || '',
        pinned: false,
        archived: false,
        threadState: 'idle',
        updatedAt: nowIso(),
        initialVisibleMessageCount: 50,
        messages: cloned,
        subagentGroups: [],
        diffGroups: [],
        questionnaires: [],
        artifacts: [],
        browserSessions: [],
        draftState: null,
        scriptedReplyCursor: 0,
        scriptedReplyIds: arr(src.scriptedReplyIds).slice(),
        tags: arr(src.tags).slice(),
        isNew: true
      };
      DATA.threads.unshift(thread);
      threadsById[thread.id] = thread;
      reindexThread(thread);
      emit({ type: 'threads-changed' });
      return thread;
    },

    // --- Context Lens ---------------------------------------------------------
    lensState: function (threadId) { return readLens(threadId); },
    setSelecting: function (threadId, selecting) {
      var lens = readLens(threadId);
      lens.selecting = !!selecting;
      writeLens(threadId, lens);
      return lens;
    },
    toggleSelect: function (threadId, msgId) {
      var lens = readLens(threadId);
      var i = lens.selectedIds.indexOf(msgId);
      if (i >= 0) {
        lens.selectedIds.splice(i, 1);
      } else {
        if (lens.selectedIds.length >= LENS_SELECT_CAP) return { error: 'limit' };
        lens.selectedIds.push(msgId);
      }
      writeLens(threadId, lens);
      return { selectedIds: lens.selectedIds.slice() };
    },
    applyLens: function (threadId, mode) {
      var lens = readLens(threadId);
      if (lens.selectedIds.length > LENS_SELECT_CAP) return { error: 'limit' };
      var ids = lens.selectedIds.slice();
      if (mode === 'mute') {
        ids.forEach(function (id) {
          if (lens.applied.muted.indexOf(id) < 0) lens.applied.muted.push(id);
        });
      } else if (mode === 'focus') {
        ids.forEach(function (id) {
          if (lens.applied.focused.indexOf(id) < 0) lens.applied.focused.push(id);
        });
      } else if (mode === 'subcompact') {
        if (ids.length > 0) {
          lens.applied.subcompacted.push({
            ids: ids,
            summary: 'Condensed ' + ids.length + ' selected messages into this summary. Source messages remain in canonical history.'
          });
        }
      } else {
        return { error: 'unknown-mode' };
      }
      lens.mode = mode;
      lens.selectedIds = [];
      lens.selecting = false;
      writeLens(threadId, lens);
      emit({ type: 'lens-changed', threadId: threadId });
      return lens;
    },
    turnOffLens: function (threadId) {
      writeLens(threadId, {
        mode: 'off',
        selecting: false,
        selectedIds: [],
        applied: blankApplied()
      });
      emit({ type: 'lens-changed', threadId: threadId });
    },
    messageLensState: function (threadId, msgId) {
      var applied = readLens(threadId).applied;
      if (applied.muted.indexOf(msgId) >= 0) return 'muted';
      if (applied.focused.indexOf(msgId) >= 0) return 'focused';
      for (var i = 0; i < applied.subcompacted.length; i++) {
        if (applied.subcompacted[i].ids.indexOf(msgId) >= 0) return 'subcompacted';
      }
      return null;
    },

    // --- questionnaires ---------------------------------------------------------
    questionnaires: function (threadId) {
      var t = threadsById[threadId];
      if (!t) return [];
      return arr(t.questionnaires)
        .map(function (q) { return mergedQuestionnaire(t, q); })
        .sort(function (a, b) {
          return String(a.createdAt || '').localeCompare(String(b.createdAt || '')); // oldest first
        });
    },
    activeQuestionnaire: function (threadId) {
      var queue = K3Data.questionnaires(threadId);
      for (var i = 0; i < queue.length; i++) {
        if (isUnresolvedStatus(queue[i].status)) return queue[i];
      }
      return null;
    },
    answerQuestion: function (threadId, qid, questionId, value) {
      var t = threadsById[threadId];
      var base = baseQuestionnaire(t, qid);
      if (!base) return false;
      var st = readQState(threadId, qid);
      st.answers[questionId] = Array.isArray(value) ? value.slice() : String(value == null ? '' : value);
      delete st.skipped[questionId];
      writeQState(threadId, qid, st);
      emit({ type: 'questionnaire-updated', threadId: threadId, questionnaireId: qid });
      return true;
    },
    skipQuestion: function (threadId, qid, questionId) {
      var t = threadsById[threadId];
      var base = baseQuestionnaire(t, qid);
      if (!base) return false;
      var st = readQState(threadId, qid);
      st.skipped[questionId] = true;
      var idx = arr(base.questions).findIndex(function (qq) { return qq.id === questionId; });
      var cur = st.currentIndex != null ? st.currentIndex : (base.currentQuestionIndex || 0);
      if (idx >= 0 && idx === cur) {
        st.currentIndex = clamp(idx + 1, 0, Math.max(0, arr(base.questions).length - 1));
      }
      writeQState(threadId, qid, st);
      emit({ type: 'questionnaire-updated', threadId: threadId, questionnaireId: qid });
      return true;
    },
    navigateQuestion: function (threadId, qid, index) {
      var t = threadsById[threadId];
      var base = baseQuestionnaire(t, qid);
      if (!base) return false;
      var st = readQState(threadId, qid);
      st.currentIndex = clamp(index | 0, 0, Math.max(0, arr(base.questions).length - 1));
      writeQState(threadId, qid, st);
      emit({ type: 'questionnaire-updated', threadId: threadId, questionnaireId: qid });
      return st.currentIndex;
    },
    submitQuestionnaire: function (threadId, qid) {
      var t = threadsById[threadId];
      var base = baseQuestionnaire(t, qid);
      if (!t || !base) return { error: 'not-found' };
      var mq = mergedQuestionnaire(t, base);
      var missing = mq.questions.filter(function (qq) {
        if (!qq.required) return false;
        if (qq.kind === 'freeform') return !(typeof qq.draft === 'string' && qq.draft.trim().length > 0);
        return arr(qq.selected).length === 0;
      }).map(function (qq) { return qq.id; });
      if (missing.length > 0) return { error: 'incomplete', missing: missing };
      var st = readQState(threadId, qid);
      st.status = 'submitted';
      st.resolvedAt = nowIso();
      writeQState(threadId, qid, st);
      mq.status = 'submitted';
      appendQuestionnaireRecord(t, mq, 'submitted');
      emit({ type: 'questionnaire-resolved', threadId: threadId, questionnaireId: qid, status: 'submitted' });
      return { status: 'submitted' };
    },
    cancelQuestionnaire: function (threadId, qid) {
      var t = threadsById[threadId];
      var base = baseQuestionnaire(t, qid);
      if (!t || !base) return { error: 'not-found' };
      var mq = mergedQuestionnaire(t, base);
      var st = readQState(threadId, qid);
      st.status = 'cancelled';
      st.resolvedAt = nowIso();
      writeQState(threadId, qid, st);
      mq.status = 'cancelled';
      appendQuestionnaireRecord(t, mq, 'cancelled');
      emit({ type: 'questionnaire-resolved', threadId: threadId, questionnaireId: qid, status: 'cancelled' });
      return { status: 'cancelled' };
    },

    // --- final cumulative packet: routes, thread-local state, catalogs --------
    // Resolved per-thread settings: threadLocal fields win over project
    // defaults (routeDefaults / legacy selectors slice). Null = inherit.
    effective: function (threadId) {
      var tl = storeGet('threadLocal.' + threadId, null) || {};
      var defaults = storeGet('routeDefaults', {}) || {};
      var selectors = storeGet('selectors', {}) || {};
      var defaultKey = defaults.providerId && defaults.modelId
        ? defaults.providerId + '/' + (defaults.accountId || '') + '/' + defaults.modelId
        : null;
      var routeKey = tl.route != null ? tl.route : defaultKey;
      var route = routeKey ? K3Data.routeByKey(routeKey) : null;
      var rawBsd = storeGet('bsdState.' + threadId, null) || {};
      return {
        route: route,
        routeKey: route ? route.key : null,
        access: tl.access != null ? tl.access : 'ask',
        bsd: {
          mode: rawBsd.mode != null ? rawBsd.mode : 'auto',
          scope: rawBsd.scope != null ? rawBsd.scope : 'thread',
          autoActive: rawBsd.autoActive === true,
          lastResult: rawBsd.lastResult != null ? rawBsd.lastResult : null
        },
        persona: tl.persona != null ? tl.persona : (selectors.persona != null ? selectors.persona : null),
        mode: tl.mode != null ? tl.mode : (selectors.mode != null ? selectors.mode : null),
        effort: tl.effort != null ? tl.effort : (defaults.effort != null ? defaults.effort : (selectors.effort != null ? selectors.effort : null)),
        speed: tl.speed != null ? tl.speed : (defaults.speed != null ? defaults.speed : null),
        worktree: tl.worktree != null ? tl.worktree : (selectors.worktree != null ? selectors.worktree : null),
        crew: tl.crew != null ? tl.crew : null,
        // which fields carry a "This thread" override (scope chips)
        overrides: {
          route: tl.route != null,
          access: tl.access != null,
          bsd: storeGet('bsdState.' + threadId, null) != null,
          persona: tl.persona != null,
          mode: tl.mode != null,
          effort: tl.effort != null,
          speed: tl.speed != null,
          worktree: tl.worktree != null,
          crew: tl.crew != null
        }
      };
    },
    setThreadLocal: function (threadId, patch) {
      var cur = storeGet('threadLocal.' + threadId, null) || {};
      Object.keys(patch || {}).forEach(function (k) { cur[k] = patch[k]; });
      storeSet('threadLocal.' + threadId, cur);
      return cur;
    },
    clearThreadLocal: function (threadId, field) {
      var cur = storeGet('threadLocal.' + threadId, null);
      if (!cur) return;
      if (field) delete cur[field]; else cur = {};
      storeSet('threadLocal.' + threadId, cur);
    },
    // Explicit bulk apply: snapshot the current project route default onto the
    // listed threads (confirmation dialog lives in the route controller).
    applyDefaultsToThreads: function (threadIds) {
      var defaults = storeGet('routeDefaults', {}) || {};
      var key = defaults.providerId && defaults.modelId
        ? defaults.providerId + '/' + (defaults.accountId || '') + '/' + defaults.modelId
        : null;
      arr(threadIds).forEach(function (tid) {
        if (!threadsById[tid] || !key) return;
        K3Data.setThreadLocal(tid, { route: key, effort: defaults.effort != null ? defaults.effort : null, speed: defaults.speed != null ? defaults.speed : null });
      });
    },

    providerCatalog: function () {
      return arr(DATA && DATA.catalogs && DATA.catalogs.providers);
    },
    routeByKey: function (routeKey) {
      if (typeof routeKey !== 'string') return null;
      var parts = routeKey.split('/');
      if (parts.length < 3) return null;
      var pid = parts[0], aid = parts[1], mid = parts.slice(2).join('/');
      var providers = K3Data.providerCatalog();
      for (var i = 0; i < providers.length; i++) {
        var p = providers[i];
        if (p.id !== pid) continue;
        var account = null, model = null;
        arr(p.accounts).forEach(function (a) { if (a.id === aid) account = a; });
        arr(p.models).forEach(function (m) { if (m.id === mid) model = m; });
        if (!account || !model) return null;
        var conn = account.connection || {};
        var status = 'ok', reason = null;
        if (model.status && model.status !== 'ok') { status = model.status; reason = model.unavailableReason || null; }
        else if (conn.status && conn.status !== 'ok') { status = conn.status; reason = conn.note || null; }
        else if (p.status && p.status !== 'ok') { status = p.status; reason = p.note || null; }
        return {
          key: pid + '/' + aid + '/' + mid,
          providerId: pid, accountId: aid, modelId: mid,
          providerName: p.name || pid,
          providerIcon: p.icon || ('provider-' + pid),
          accountLabel: account.label || aid,
          connectionKind: conn.kind || null,
          connectionLabel: conn.label || conn.kind || '',
          modelLabel: model.label || mid,
          modelShort: model.short || model.label || mid,
          capabilities: model.capabilities || {},
          priceTier: model.priceTier || null,
          status: status,
          unavailableReason: reason
        };
      }
      return null;
    },
    threadRequests: function (threadId) {
      var t = threadsById[threadId];
      return t ? arr(t.threadRequests) : [];
    },
    worktrees: function () { return arr(DATA && DATA.catalogs && DATA.catalogs.worktrees); },
    portLeases: function () { return arr(DATA && DATA.catalogs && DATA.catalogs.portLeases); },
    crewTemplates: function () { return arr(DATA && DATA.catalogs && DATA.catalogs.crewTemplates); },
    domainNotes: function () { return arr(DATA && DATA.catalogs && DATA.catalogs.domainNotes); },
    connectionInfo: function () {
      var p = (DATA && DATA.catalogs && DATA.catalogs.syncProfile) || {};
      var tid = storeGet('activeThreadId', null);
      var eff = tid ? K3Data.effective(tid) : null;
      return {
        homeServer: p.homeServer || 'Home TrueNAS',
        executionHost: p.executionHost || 'This Windows computer',
        environment: p.environment || 'Windows 11 Pro',
        route: eff && eff.route
          ? eff.route.providerName + ' · ' + eff.route.accountLabel + ' · ' + eff.route.modelLabel
          : 'Not configured'
      };
    },

    // Controllers append transcript record messages (cards, receipts, markers)
    // through here so indexing, runtime, and events stay consistent.
    appendRecord: function (threadId, fields) {
      var thread = threadsById[threadId];
      if (!thread) return null;
      var message = Object.assign({
        id: uid('msg'),
        role: 'assistant',
        body: '',
        sentAt: nowIso(),
        runtime: runtimeTemplate(thread),
        eligibleForEdit: false,
        collapsedByDefault: false
      }, fields || {});
      appendMessage(thread, message);
      return message;
    },
    // Generic re-render nudge after a controller mutates a thread record.
    touchThread: function (threadId, eventType) {
      var t = threadsById[threadId];
      if (t) t.updatedAt = nowIso();
      emit({ type: eventType || 'threads-changed', threadId: threadId });
    },

    // --- restart simulation -----------------------------------------------------
    simulateRestart: function () {
      Object.keys(working).forEach(clearWorking); // a crash loses in-flight work
      var s = (typeof window !== 'undefined') && window.K3Store;
      if (s && typeof s.simulateRestart === 'function') s.simulateRestart();
      emit({ type: 'restarted' });
    }
  };

  window.K3Data = K3Data;
})();
