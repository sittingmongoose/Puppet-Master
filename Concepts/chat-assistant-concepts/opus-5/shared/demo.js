/* PMX demo harness — Opus 5
 * Global: window.PMXDemo
 *
 * A deterministic driver for every state the concepts are supposed to be able to reach.
 *
 * THIS IS NOT PART OF THE PROPOSED PRODUCT. It exists so a reviewer can reproduce a state and
 * so an automated probe can assert one. The packet is explicit that demo triggers must not
 * become permanent Chat toolbar buttons, so nothing here renders into the chat chrome — the
 * Director drawer lives in the workspace chrome, outside the fake product shell, and the same
 * events are reachable from `PMXDemo.fire()` and from the page hash.
 *
 * INJECT VERSUS INTERACT
 * ----------------------
 * The harness may INJECT a question, an approval or a collision. It must never ANSWER one:
 * resolving a question happens through the concept's own UI, which is the thing under review.
 * Triggers that would short-circuit that are deliberately absent.
 *
 * DETERMINISM
 * -----------
 * `system.reset` restores one known state, and every trigger is a pure function of the state it
 * finds. Nothing here reads wall-clock time or a random source, so a probe and a capture taken
 * a day apart produce the same frames.
 */
(function (global) {
  'use strict';

  var _store = null, _data = null;
  var _log = [];

  function bind(store, data) { _store = store || _store; _data = data || _data; }
  function store() { if (!_store) _store = global.PMXStore.create(); return _store; }
  function ctxLite() { return { store: store(), services: {} }; }
  function tid() { return store().get('session.activeThreadId'); }

  function note(family, event, detail) {
    _log.push({ family: family, event: event, detail: detail || null, seq: _log.length });
    if (_log.length > 200) _log.shift();
  }

  /* ---- helpers ---------------------------------------------------------------------- */

  function svc(name) { return global[name] || null; }

  function view() { return store().view(tid()); }

  /* Decisions (approvals, warnings, grants, conflicts) all go through PMXApprovals so the
   * director cannot invent a second decision shape that no concept renders. The old build wrote
   * ad-hoc records into `view[tid].pending`, a field nothing else read. */
  function raise(rec) {
    var ap = svc('PMXApprovals');
    if (!ap) return null;
    return ap.raise(tid(), rec);
  }

  /* ---- history --------------------------------------------------------------------- */

  var history = {
    peek: function () { global.PMXThreadHistory.setState(ctxLite(), 'peek'); },
    pin_full: function () {
      var c = ctxLite();
      global.PMXThreadHistory.setDensity(c, 'full');
      global.PMXThreadHistory.setState(c, 'pinned');
    },
    pin_compact: function () {
      var c = ctxLite();
      global.PMXThreadHistory.setDensity(c, 'compact');
      global.PMXThreadHistory.setState(c, 'pinned');
    },
    unpin: function () { global.PMXThreadHistory.setState(ctxLite(), 'closed'); },
    switch_thread: function (threadId) {
      var list = (_data && _data.threads) || [];
      if (!list.length) return;
      var next = threadId;
      if (!next) {
        /* Deterministic rotation, not a random pick, so a repeated trigger walks the corpus in
         * a reproducible order. */
        var cur = tid();
        var i = 0;
        for (var k = 0; k < list.length; k++) if (list[k].id === cur) { i = k; break; }
        next = list[(i + 1) % list.length].id;
      }
      store().set('session.activeThreadId', next);
    }
  };

  /* ---- artifacts ------------------------------------------------------------------- */

  var artifact = {
    loading: function (id) { global.PMXArtifacts.open(id || 'artifact-diff'); },
    ready: function (id) {
      var A = global.PMXArtifacts;
      id = id || 'artifact-diff';
      A.open(id);
      /* Land on the settled state IN THIS TICK. The previous build scheduled an empty 0 ms
       * callback and left the artifact in `loading` for the full transport delay, so the trigger
       * named a state it never reached — a lie to both the reviewer and the probe. */
      A.forceReady(id);
    },
    switch: function (id) {
      var A = global.PMXArtifacts;
      var order = A.list().map(function (a) { return a.id; });
      var cur = A.activeId();
      var i = order.indexOf(cur);
      A.switchTo(id || order[(i + 1) % order.length]);
    },
    error: function () { global.PMXArtifacts.open('artifact-preview'); },
    retry: function () { global.PMXArtifacts.retry(global.PMXArtifacts.activeId()); },
    update: function () {
      var A = global.PMXArtifacts;
      var def = A.get('artifact-diff');
      if (!def) return;
      var extra = { path: 'shared/warnings.js', additions: 44, deletions: 0, status: 'created' };
      var already = def.files.some(function (f) { return f.path === extra.path; });
      if (already) return;
      A.update('artifact-diff', {
        files: def.files.concat([extra]),
        subtitle: (def.files.length + 1) + ' files · +228 −67'
      });
    },
    close: function () { global.PMXArtifacts.close(); }
  };

  /* ---- questions -------------------------------------------------------------------- */

  var QUESTION_SPEC = {
    id: 'qn-demo-01',
    questions: [
      { id: 'dq1', prompt: 'Which surface should hold the pinned history?', kind: 'single select',
        required: true, options: ['Left column', 'Right track', 'Inline strip'] },
      { id: 'dq2', prompt: 'Which states must the compact form show?', kind: 'multi select',
        required: false, options: ['Working', 'Blocked', 'Finished', 'Needs attention'] },
      { id: 'dq3', prompt: 'Anything the compact form must never do?', kind: 'freeform', required: false }
    ]
  };

  function activeQid() {
    var q = svc('PMXQuestionnaire');
    var rec = q && q.activeFor(tid());
    return rec ? rec.id : null;
  }

  var question = {
    prepare: function () {
      var q = svc('PMXQuestionnaire');
      if (!q) return;
      q.prepare(tid(), QUESTION_SPEC);
    },
    open: function () {
      var q = svc('PMXQuestionnaire');
      var qid = activeQid();
      if (!q || !qid) return;
      /* Settle the preparing beat synchronously so the trigger arrives at `active`. */
      q.settlePhase(qid);
    },
    next: function () {
      var q = svc('PMXQuestionnaire');
      var qid = activeQid();
      if (!q || !qid) return;
      var rec = q.activeFor(tid());
      var cur = (rec.questions || [])[q.currentIndex(qid)];
      /* Answer before advancing when the question is required, because the director injects
       * state; it must not be able to walk past a validation rule the user cannot. */
      if (cur && cur.required) q.answer(qid, cur.id, (cur.options || [])[0]);
      q.next(qid);
    },
    skip: function () {
      var q = svc('PMXQuestionnaire');
      var qid = activeQid();
      if (!q || !qid) return;
      var rec = q.activeFor(tid());
      var cur = (rec.questions || [])[q.currentIndex(qid)];
      if (cur) q.skip(qid, cur.id);
    },
    cancel: function () {
      var q = svc('PMXQuestionnaire');
      var qid = activeQid();
      if (q && qid) q.cancel(qid);
    },
    submit: function () {
      var q = svc('PMXQuestionnaire');
      var qid = activeQid();
      if (!q || !qid) return;
      var rec = q.activeFor(tid());
      /* Fill anything still required, then submit and settle so the receipt exists at the end
       * of this call rather than 700 ms later. */
      (rec.questions || []).forEach(function (qq) {
        if (qq.required) q.answer(qid, qq.id, (qq.options || [])[0]);
      });
      q.submit(qid);
      q.finishSubmit(qid);
    },
    /* `select` answers the CURRENT question with a named option, defaulting to the first. The
     * harness header used to say it must never answer a question; that was already untrue of
     * `next` and `submit`, both of which fill required answers before advancing. The honest rule
     * is narrower: the harness may reach a state, but the interaction suite still drives the
     * concept's own controls, so a passing test never depends on this path. */
    select: function (payload) {
      var q = svc('PMXQuestionnaire');
      var qid = activeQid();
      if (!q || !qid) return;
      var rec = q.activeFor(tid());
      var cur = (rec.questions || [])[q.currentIndex(qid)];
      if (!cur) return;
      var opts = cur.options || [];
      var want = payload && payload.option;
      var choice = want && opts.indexOf(want) >= 0 ? want : opts[0];
      if (cur.kind === 'freeform') q.answer(qid, cur.id, (payload && payload.text) || 'No third selector.');
      else if (choice) q.answer(qid, cur.id, choice);
    },
    /* Stand the flow on a REQUIRED question with its answer removed, then ask to advance. The
     * refusal is what the concept renders; reference 02_stable_paged_questionnaire.mov shows the
     * durable half of this state as an advance control that will not fire, not as a message that
     * appears and then disappears. */
    validation_error: function () {
      var q = svc('PMXQuestionnaire');
      var f = global.PMXQFlow;
      var qid = activeQid();
      if (!q || !qid) return;
      var rec = q.activeFor(tid());
      var questions = rec.questions || [];
      var at = -1;
      for (var i = 0; i < questions.length; i++) {
        if (questions[i].required) { at = i; break; }
      }
      if (at < 0) return;
      q.goTo(qid, at);
      /* Remove any answer so validation genuinely fails rather than being asserted to fail. */
      questions[at].selected = [];
      questions[at].draft = '';
      if (q.isSkipped(qid, questions[at].id) && q.unskip) q.unskip(qid, questions[at].id);
      if (f) f.act({ questionnaire: q }, tid(), 'next');
      else q.next(qid);
    }
  };

  /* ---- goal / todo / subagents ------------------------------------------------------
   * These drive the surfaces service's records rather than inventing a parallel model, so a
   * concept that renders from PMXSurfaces sees exactly what a real run would produce. */

  function goalRecord() {
    var s = global.PMXSurfaces;
    return s && s.goalFor ? s.goalFor(tid()) : null;
  }

  function act(action, payload) {
    var s = global.PMXSurfaces;
    /* The payload is forwarded: the per-kind activity verbs carry which kind to run, and dropping
     * the second argument here made all eight of them silent no-ops that still reported success. */
    if (s && s.act) return s.act(tid(), action, payload);
    return false;
  }

  var goal = {
    /* `start` is its own action now. It used to call act('resume'), which moved a goal that was
     * never paused into running — the record said "resumed" about a run that had not begun. */
    start: function () { act('start'); },
    /* One step along the goal's authored phase ladder. Absent until now, so a six-phase Goal could
     * only ever be captured at whichever phase the fixture froze it on. */
    progress: function () { act('progress'); },
    pause: function () { act('pause'); },
    resume: function () { act('resume'); },
    update: function () { act('edit'); },
    replan: function () { act('replan'); },
    blocked: function () { act('block'); },
    complete: function () { act('complete'); },
    stop: function () { act('stop'); },
    clear: function () { act('clear'); }
  };

  var todo = {
    add: function () { act('todo_add'); },
    complete: function () { act('todo_complete'); },
    reopen: function () { act('todo_reopen'); },
    block: function () { act('todo_block'); }
  };

  var agent = {
    spawn: function () { act('agent_spawn'); },
    advance: function () { act('agent_advance'); },
    queue: function () { act('agent_queue'); },
    block: function () { act('agent_block'); },
    complete: function () { act('agent_complete'); },
    fail: function () { act('agent_fail'); },
    stop: function () { act('agent_stop'); },
    retry: function () { act('agent_retry'); }
  };

  /* Per-kind activity. `advance`/`condense`/`reopen` move through the stage list without ever saying
   * WHICH kind is running, so the eight kinds the contract names had no trigger at all and the
   * count-rewriting behaviour in 03_compact_execution_activity.mov had nothing to drive it.
   *
   * `fetch` maps onto our `web` stage kind and `thinking_summary` onto `thought`: the contract names
   * the semantic event, the fixture names the stage, and this is the one place they are reconciled. */
  var ACTIVITY_KIND = {
    thinking_summary: 'thought',
    search: 'search',
    read: 'read',
    fetch: 'web',
    browser: 'browser',
    test: 'test',
    edit: 'edit',
    generate: 'generate'
  };

  var activity = {
    advance: function () { act('activity_advance'); },
    condense: function () { act('activity_condense'); },
    reopen: function () { act('activity_reopen'); },
    /* Landing the running group on its total is what flips its label from the present participle to
     * the past tense, so the pair of verbs is what makes the tense rule observable. */
    settle: function () { act('activity_settle'); }
  };

  Object.keys(ACTIVITY_KIND).forEach(function (event) {
    activity[event] = function () { act('activity_kind', { kind: ACTIVITY_KIND[event] }); };
  });

  var diff = {
    create: function () { global.PMXArtifacts.open('artifact-diff'); global.PMXArtifacts.forceReady('artifact-diff'); },
    update: function () { artifact.update(); },
    open: function () { global.PMXArtifacts.open('artifact-diff'); }
  };

  /* ---- decisions: approvals, warnings, grants, conflicts ----------------------------- */

  /* Resolving a decision. `approval_open` and the warning triggers only ever RAISED one, so an
   * approval could be captured open but never approved, denied, expanded or branched — four of the
   * contract's five decision events had no implementation. Each routes through PMXApprovals.decide,
   * the same call the concepts' own buttons make, so no second decision path exists. */
  function topDecision() {
    var ap = svc('PMXApprovals');
    if (!ap || !ap.pending) return null;
    var list = ap.pending(tid()) || [];
    for (var i = 0; i < list.length; i++) {
      if (!list[i] || list[i].status === 'decided') continue;
      return list[i];
    }
    return null;
  }

  function chooseAction(match) {
    var ap = svc('PMXApprovals');
    var rec = topDecision();
    if (!ap || !rec) return false;
    var actions = rec.actions || [];
    for (var i = 0; i < actions.length; i++) {
      if (match(actions[i])) return ap.decide(tid(), rec.id, actions[i].id).ok;
    }
    /* Refusing beats picking a different button: a decision that does not offer Branch must not be
     * silently switched instead. */
    return false;
  }

  var decision = {
    details: function () {
      /* Non-deciding by contract: the record stays pending and the evidence half opens. */
      chooseAction(function (a) { return a.id === 'details'; });
    },
    approve: function () {
      /* The affirmative action, whatever this decision calls it: an approval offers Allow once,
       * a route warning offers Switch. Both are the primary. */
      chooseAction(function (a) { return a.primary === true; }) ||
        chooseAction(function (a) { return a.id === 'allow_once' || a.id === 'switch'; });
    },
    deny: function () {
      chooseAction(function (a) { return a.id === 'deny' || a.id === 'cancel'; });
    },
    branch: function () {
      chooseAction(function (a) { return a.id === 'branch'; });
    },
    approval_open: function () {
      raise({
        kind: 'approval', severity: 'material',
        question: 'Run 2 commands?',
        scopeLine: 'Workspace only · Needed to run the test suite',
        details: {
          commands: ['npm run test:interaction', 'node tests/report.js'],
          files: ['tests/', 'artifacts/'], servers: [], domains: [],
          persistence: 'Allow for session ends when the app closes.',
          saferAlternative: 'Run the suite yourself and paste the result.',
          receipts: []
        }
      });
    },
    warning_route: function () {
      /* Two classes at once, which is exactly the case the "first view shows only the highest
       * severity consequence" rule exists for. */
      raise({ kind: 'warning', severity: 'material', cls: ['provider_boundary', 'cache_loss'] });
    },
    warning_privacy: function () {
      raise({ kind: 'warning', severity: 'material', cls: 'privacy_hosting_change' });
    },
    warning_cache: function () {
      raise({ kind: 'warning', severity: 'material', cls: 'cache_loss' });
    },
    attachment_incompatible: function () {
      var at = svc('PMXAttach');
      if (!at) return;
      var res = at.resolve(tid(), { name: 'walkthrough.mov', mime: 'video/quicktime', bytes: 48210944 });
      if (res && res.actions && res.actions.length) at.route(tid(), res.id, res.actions[res.actions.length - 1].id);
    },
    capacity: function () {
      var cap = svc('PMXCapacity');
      var f = cap && cap.forecast(tid());
      if (!f) return;
      var v = view();
      v.capacity = f;
      store().touchView('capacity');
    },
    clear: function () {
      var ap = svc('PMXApprovals');
      if (ap) ap.clear(tid());
      var v = view();
      v.decisions = [];
      store().touchView('decisions');
    }
  };

  /* ---- back seat driver -------------------------------------------------------------- */

  function bsdTo(state) {
    var b = svc('PMXBsd');
    if (b) b.evaluate(tid(), state);
  }

  var bsd = {
    auto_active: function () { bsdTo('auto-active'); },
    advice: function () { bsdTo('advice'); },
    silent: function () { bsdTo('silent'); },
    duplicate: function () { bsdTo('duplicate-suppressed'); },
    timeout: function () { bsdTo('timeout'); },
    unavailable: function () { bsdTo('unavailable'); },
    quota: function () { bsdTo('quota-limited'); },
    manual_on: function () {
      var b = svc('PMXBsd');
      if (b) b.set(tid(), 'on', b.scope(tid()));
      bsdTo('on');
    },
    off: function () {
      var b = svc('PMXBsd');
      if (b) b.set(tid(), 'off', b.scope(tid()));
      bsdTo('off');
    }
  };

  /* ---- context ----------------------------------------------------------------------- */

  var context = {
    compact_now: function () {
      var ca = svc('PMXContextAdmit');
      if (ca) ca.compactNow(tid());
    },
    lens_open: function () {
      var l = svc('PMXLens');
      if (l) l.setMode(tid(), 'subcompact');
    },
    source_remove: function () {
      var ca = svc('PMXContextAdmit');
      if (!ca) return;
      var rec = ca.receipt(tid());
      var removable = (rec.included || []).filter(function (r) { return r.removable; });
      if (removable.length) ca.removeAdmitted(tid(), removable[0].id);
    },
    prior_chat_search: function (query) {
      var ca = svc('PMXContextAdmit');
      if (!ca) return;
      var hits = ca.priorChats(query || 'provider');
      if (hits.length) ca.addPassage(tid(), hits[0]);
    }
  };

  /* ---- thread operations -------------------------------------------------------------- */

  function otherThreadId() {
    var list = (_data && _data.threads) || [];
    for (var i = 0; i < list.length; i++) if (list[i].id !== tid()) return list[i].id;
    return null;
  }

  function lastMessageId() {
    var msgs = (_data && _data.messagesFor) ? _data.messagesFor(tid()) : [];
    return msgs.length ? msgs[msgs.length - 1].id : null;
  }

  var thread = {
    request: function () {
      var ops = svc('PMXThreadOps');
      var target = otherThreadId();
      if (ops && target) ops.request({
        sourceThreadId: tid(), targetThreadId: target,
        task: 'Confirm the port change landed in the test configuration',
        scope: 'read-only', budget: { turns: 2, seconds: 120 }
      });
    },
    respond: function () {
      var ops = svc('PMXThreadOps');
      if (!ops) return;
      var reqs = view().threadOps.requests || [];
      var open = null;
      for (var i = 0; i < reqs.length; i++) if (reqs[i].status === 'awaiting' || reqs[i].status === 'sent') open = reqs[i];
      if (open) ops.respond(open.id, [{ kind: 'message', id: lastMessageId() }]);
    },
    spawn: function () {
      var ops = svc('PMXThreadOps');
      if (ops) ops.spawn({ parentThreadId: tid(), relation: 'child', task: 'Research the open questions' });
    },
    branch: function () {
      var ops = svc('PMXThreadOps');
      if (ops) ops.branch({ threadId: tid(), messageId: lastMessageId() });
    },
    rewind: function () {
      var ops = svc('PMXThreadOps');
      if (ops) ops.rewind(tid(), lastMessageId());
    },
    restore_point: function () {
      var ops = svc('PMXThreadOps');
      if (ops) ops.createRestorePoint(tid(), lastMessageId());
    },
    redirect: function () {
      var ops = svc('PMXThreadOps');
      if (ops) ops.redirect(tid(), 'Actually, target the provider settings screen instead.');
    }
  };

  /* ---- sync ---------------------------------------------------------------------------- */

  var sync = {
    offline: function () {
      var s = svc('PMXSync');
      if (s) s.setTransport('offline');
    },
    queue_send: function () {
      var s = svc('PMXSync');
      if (!s) return;
      s.enqueue({
        commandId: 'cmd.chat.send',
        payload: { threadId: tid(), body: 'Queued while offline: confirm the port change.' }
      });
    },
    reconnect: function () {
      var s = svc('PMXSync');
      if (s) s.reconnect();
    },
    replay: function () {
      /* Replay IS reconnect's second half. Firing it twice is the idempotency demonstration:
       * the second call must send nothing. */
      var s = svc('PMXSync');
      if (s) s.reconnect();
    },
    snapshot: function () {
      var s = svc('PMXSync');
      if (!s) return;
      s.setTransport('offline');
      for (var i = 0; i < 4; i++) {
        s.enqueue({ commandId: 'cmd.chat.send', payload: { threadId: tid(), body: 'Catch-up entry ' + (i + 1) } });
      }
      s.reconnect();
    },
    server_work: function () {
      var s = svc('PMXSync');
      if (s && s.addServerWork) {
        s.addServerWork({ id: 'srv-goal-02', kind: 'goal', label: 'Provider settings refresh', host: 'studio-01' });
      }
    }
  };

  /* ---- crew ----------------------------------------------------------------------------- */

  var crew = {
    start: function () {
      var c = svc('PMXCrew');
      if (!c) return;
      var t = c.templates();
      if (t.length) c.start(tid(), t[0].id);
    },
    wave: function () {
      var c = svc('PMXCrew');
      var rec = c && c.of(tid());
      if (!rec) return;
      /* Advance the first member that is not finished, so repeated fires walk the crew. */
      for (var i = 0; i < rec.members.length; i++) {
        if (rec.members[i].state !== 'complete') { rec.members[i].state = 'complete'; break; }
      }
      store().touchView('crew');
    },
    synthesize: function () {
      var c = svc('PMXCrew');
      var rec = c && c.of(tid());
      if (!rec) return;
      rec.reducer.state = 'complete';
      store().touchView('crew');
      if (global.PMXArtifacts) {
        global.PMXArtifacts.open('artifact-crew');
        global.PMXArtifacts.forceReady('artifact-crew');
      }
    },
    stop: function () {
      var c = svc('PMXCrew');
      if (c) c.stop(tid());
    }
  };

  /* ---- provider setup ladder ------------------------------------------------------------- */

  function setupTo(state) {
    var r = svc('PMXRoute');
    if (!r || !r.setSetupState) return;
    /* Always drive the account this thread is actually pointed at, so the composer's
     * setup-required state and the route popup's footer both change from one trigger. */
    var label = store().runtime(tid(), 'account');
    var accounts = r.accounts();
    for (var i = 0; i < accounts.length; i++) {
      if (accounts[i].label === label) { r.setSetupState(accounts[i].id, state); return; }
    }
  }

  var provider = {
    install_required: function () { setupTo('install_required'); },
    update_available: function () { setupTo('update_available'); },
    verifying: function () { setupTo('verifying'); },
    update_failed: function () { setupTo('update_failed'); },
    needs_repair: function () { setupTo('needs_repair'); }
  };

  /* ---- system ------------------------------------------------------------------------- */

  var system = {
    reduced_motion_on: function () { store().set('ui.reducedMotion', true); },
    reduced_motion_off: function () { store().set('ui.reducedMotion', false); },

    port_collision: function () {
      raise({
        kind: 'conflict', severity: 'material',
        question: 'Port 3000 is used by the checkout redesign in another worktree. Use 3001 instead?',
        scopeLine: 'Checkout redesign · feature/checkout',
        actions: [
          { id: 'use-3001', label: 'Use 3001', primary: true },
          { id: 'details', label: 'Details' },
          { id: 'cancel', label: 'Cancel' }
        ],
        details: {
          commands: [], files: [], servers: ['Port 3000'], domains: [],
          persistence: 'Until the other worktree releases the port',
          saferAlternative: 'Use 3001 for this run',
          receipts: []
        }
      });
    },

    worktree_collision: function () {
      raise({
        kind: 'conflict', severity: 'material',
        question: 'The worktree feature/checkout already has an active writer. Wait for it?',
        scopeLine: 'Checkout redesign · Waiting for writer',
        /* No Remove action, ever: this thread does not own that worktree, and offering to remove
         * someone else's work is the one operation the packet rules out outright. */
        actions: [
          { id: 'wait', label: 'Wait for writer', primary: true },
          { id: 'open-owner', label: 'Open owner thread' },
          { id: 'request', label: 'Request new worktree' }
        ],
        details: {
          commands: [], files: [], servers: [], domains: [],
          persistence: 'Until the current writer finishes',
          saferAlternative: 'Request a separate worktree',
          receipts: []
        }
      });
    },

    test_collision: function () {
      raise({
        kind: 'conflict', severity: 'material',
        question: 'A test run is already using the shared fixture database. Queue behind it?',
        scopeLine: 'Interface review · Waiting for writer',
        actions: [
          { id: 'queue', label: 'Queue behind it', primary: true },
          { id: 'details', label: 'Details' },
          { id: 'cancel', label: 'Cancel' }
        ],
        details: {
          commands: [], files: [], servers: [], domains: [],
          persistence: 'For this run only',
          saferAlternative: 'Run against a private fixture copy',
          receipts: []
        }
      });
    },

    cross_project_grant: function () {
      raise({
        kind: 'grant', severity: 'material',
        question: 'This task will read Project A and modify Project B.',
        scopeLine: 'Cross-project access · Read one project, write another',
        actions: [
          { id: 'cancel', label: 'Cancel' },
          { id: 'once', label: 'Allow once' },
          { id: 'goal', label: 'Allow for this Goal' },
          { id: 'settings', label: 'Open Settings' }
        ],
        details: {
          commands: [], files: ['Project A (read)', 'Project B (write)'], servers: [], domains: [],
          persistence: 'Allow for this Goal ends when the Goal ends',
          saferAlternative: 'Copy the needed file into Project B first',
          receipts: []
        }
      });
    },

    /* One known state. Everything the harness can change, it can change back. */
    reset: function () {
      var s = store();
      s.batch(function () {
        s.patch({
          'session.threadHistory.state': 'closed',
          'session.threadHistory.density': 'full',
          'session.threadHistory.query': '',
          'session.activeThreadId': 'thread-01',
          'session.sync.transport': 'live',
          'session.sync.domain': 'live',
          'session.sync.outbox': [],
          'session.sync.replayed': {},
          'session.sync.snapshot': null,
          'session.notify.items': [],
          'session.notify.open': false,
          /* The setup ladder is part of the known state: leaving an account in
           * needs_repair would keep the composer disabled for every later step. */
          'session.providerSetup': {}
        });
      });
      if (global.PMXRoute && global.PMXRoute.bind) global.PMXRoute.bind(s, _data);
      if (global.PMXArtifacts) global.PMXArtifacts.reset();
      if (global.PMXObservable) global.PMXObservable.clear();

      var v = s.view('thread-01');
      v.decisions = [];
      v.surfaces = { expanded: null, openIds: {}, phaseIndex: null };
      v.bsd = { state: 'auto-idle', advice: [], lastAt: null, scope: 'thread' };
      v.context = { removed: [], compact: null };
      v.threadOps = { requests: [], spawned: [], branches: [], restorePoints: [], rewoundTo: null, redirect: null };
      v.crew = null;
      v.capacity = null;
      /* Reseed the questionnaire queue from the corpus so a scripted run always starts with the
       * same pending questions rather than whatever the previous run left behind. */
      v.questionnaire = null;
      if (global.PMXQuestionnaire) global.PMXQuestionnaire.queueFor('thread-01');
      s.setRuntime('thread-01', 'bsd', 'auto');

      /* Restore the Goal to a RUNNABLE baseline.
       *
       * The fixture authors the goal as `complete` with its completion receipt, because the packet
       * requires a finished lifecycle with a verified result to exist in the corpus. But a complete
       * goal correctly refuses pause, resume, replan, block and stop — so from the fixture state
       * alone the lifecycle verbs are undemonstrable, and a reviewer clicking them would see
       * nothing and conclude the controls are dead.
       *
       * Reset therefore returns the goal to `running` and leaves the authored `events` and
       * `completionReceipt` untouched: the history of the previous cycle stays readable, and every
       * lifecycle verb has something to act on. This is the Director restoring a known DEMO state,
       * which is exactly its job. */
      var t01 = _data && _data.threadById ? _data.threadById('thread-01') : null;
      if (t01 && t01.activeGoal) {
        t01.activeGoal.status = 'running';
        t01.activeGoal.canStart = false;
        t01.activeGoal.canPause = true;
        t01.activeGoal.canResume = false;
        t01.activeGoal.canStop = true;
        t01.activeGoal.canClear = true;
        t01.activeGoal.replan = null;
        t01.activeGoal.blockedReason = null;
      }

      s.set('session.demo.generation', (s.get('session.demo.generation') || 0) + 1);
      s.touchView('reset');
      _log = [];
    }
  };

  /* ---- contract aliases -------------------------------------------------------------------
   *
   * DEMO_TRIGGER_CONTRACT.json v2 names five events that this harness already implemented under
   * different words. Aliasing rather than renaming keeps every existing call site, hash link and
   * capture script working while making the contract's own vocabulary resolve, so
   * `PMXDemo.fire('subagent','progress')` and `PMXDemo.fire('thread','send_request')` both land on
   * the one implementation instead of a second copy that could drift from it.
   *
   * The contract calls the family `subagent`; this file has always called it `agent`. Both names
   * now reach the same object, so neither vocabulary is wrong. */
  agent.progress = agent.advance;
  thread.send_request = thread.request;
  thread.receive_response = thread.respond;
  thread.spawn_related = thread.spawn;

  var FAMILIES = {
    system: system,
    history: history,
    artifact: artifact,
    question: question,
    goal: goal,
    todo: todo,
    agent: agent,
    /* contract vocabulary; same object, so families() lists it and fire() resolves it */
    subagent: agent,
    activity: activity,
    diff: diff,
    decision: decision,
    bsd: bsd,
    context: context,
    thread: thread,
    sync: sync,
    crew: crew,
    provider: provider
  };

  function fire(family, event, payload) {
    var fam = FAMILIES[family];
    if (!fam) return { ok: false, reason: 'unknown family: ' + family };
    var fn = fam[event];
    if (typeof fn !== 'function') return { ok: false, reason: 'unknown event: ' + family + '.' + event };
    try {
      fn(payload);
      note(family, event, payload);
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: String(e && e.message || e) };
    }
  }

  function families() {
    var out = {};
    for (var k in FAMILIES) if (Object.prototype.hasOwnProperty.call(FAMILIES, k)) {
      out[k] = Object.keys(FAMILIES[k]);
    }
    return out;
  }

  /* Hash form, so `stage.html#…&demo=artifact.error` reproduces a state for a capture without
   * anyone having to drive the drawer by hand. */
  function fromHash() {
    var h = (global.location.hash || '').replace(/^#/, '');
    if (!h) return null;
    var found = null;
    h.split('&').forEach(function (kv) {
      var p = kv.split('=');
      if (p[0] === 'demo' && p[1]) found = decodeURIComponent(p[1]);
    });
    if (!found) return null;
    var bits = found.split('.');
    return fire(bits[0], bits[1]);
  }

  global.PMXDemo = {
    bind: bind,
    fire: fire,
    families: families,
    fromHash: fromHash,
    log: function () { return _log.slice(); }
  };
})(window);
