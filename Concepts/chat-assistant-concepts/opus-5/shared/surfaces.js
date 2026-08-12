/* PMX work surfaces — Opus 5
 *
 * Goal, Todo, subagents, diffs, and activity are SEPARATE underlying records even when a
 * concept presents them together. Any subset may be present: none, one, several, or all.
 * They appear only when relevant, and a thread never permanently reserves space for a
 * surface that is not active.
 *
 * This module also carries the Goal and Activity helpers, so a concept has one place to ask
 * "what is going on in this thread" without reaching into three different owners.
 */
(function (global) {
  'use strict';

  var store = null;
  function bind(s) { store = s; }
  /* Alias matching shared/questionnaire.js's attach(store, data) wiring precedent. Canonical
   * data always comes from the PMXData singleton here (see data()), so the second argument
   * is accepted and ignored. */
  function attach(s) { bind(s); }
  function data() { return global.PMXData.get(); }

  function threadOf(threadId) {
    var d = data();
    return d ? d.threadById(threadId) : null;
  }

  /* Activity is recorded per MESSAGE (msg.activityGroup), not per thread, so "the thread's
   * current activity" is the most recent message that still carries one - the freshest tool
   * trail worth showing alongside Goal/Todo/subagents/diffs. */
  function latestActivityGroup(t) {
    var msgs = t && t.messages;
    if (!msgs || !msgs.length) return null;
    for (var i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].activityGroup) return msgs[i].activityGroup;
    }
    return null;
  }

  /* Absent members are null, never empty placeholders — that is what lets a concept render
   * nothing at all rather than an empty frame. */
  function activeFor(threadId) {
    var t = threadOf(threadId);
    if (!t) return { goal: null, todo: null, subagents: null, diffs: null, activity: null };
    var yielded = store ? !!store.view(threadId).surfacesYielded : false;
    if (yielded) {
      /* Yielded for a question. The state continues underneath; it is simply not shown. */
      return { goal: null, todo: null, subagents: null, diffs: null, activity: null, yielded: true };
    }
    return {
      goal: t.activeGoal || null,
      todo: t.todo || null,
      subagents: (t.subagentGroups && t.subagentGroups.length) ? t.subagentGroups : null,
      diffs: (t.diffGroups && t.diffGroups.length) ? t.diffGroups : null,
      activity: latestActivityGroup(t),
      yielded: false
    };
  }

  /* Underlying state CONTINUES while yielded. Nothing is discarded, so everything reappears
   * intact once the questionnaire resolves. */
  function yieldForQuestion(threadId, on) {
    if (!store) return;
    var v = store.view(threadId);
    var next = !!on;
    /* Emit ONLY on a real change. A render pass calls this every time it draws the
     * questionnaire, so an unconditional notify turns render -> notify -> render into
     * unbounded recursion and blows the stack. */
    if (v.surfacesYielded === next) return;
    v.surfacesYielded = next;
    store.touchView('surfaces');
  }

  /* ---------------------------------------------------------------- goal */

  function goalFor(threadId) {
    var t = threadOf(threadId);
    return t ? (t.activeGoal || null) : null;
  }

  function canAct(goal, action) {
    if (!goal) return false;
    switch (action) {
      /* A goal is started exactly once. Offering Start on anything but an idle goal is what
       * let the demo path fake a resumption (D12). */
      /* Start is allowed from idle AND from a terminal state, because re-running a finished goal is
       * a legitimate action and refusing it would leave the control dead on every completed thread.
       * What it must never do is masquerade as `resume` on a goal that never ran — that distinction
       * is the defect this gate exists for. */
      case 'start': return goal.canStart !== false &&
        (goal.status === 'idle' || goal.status === 'complete' || goal.status === 'stopped');
      case 'pause': return goal.canPause !== false && goal.status === 'running';
      case 'resume': return goal.canResume !== false && (goal.status === 'paused' || goal.status === 'blocked');
      case 'stop': return goal.canStop !== false && goal.status !== 'complete';
      /* Clear is a distinct operation from Stop and stays available on a terminal goal. */
      case 'clear': return goal.canClear !== false;
      case 'edit': return goal.canEdit !== false;
      case 'replan': return goal.status === 'running' || goal.status === 'paused' || goal.status === 'blocked';
      case 'block': return goal.status === 'running';
      case 'complete': return goal.status === 'running' || goal.status === 'replanning';
      /* Expand and collapse are presentation and are never gated; the permissive default
       * covers them. An UNKNOWN verb is refused in act(), not here, because canAct answers
       * "is this allowed", not "does this exist". */
      default: return true;
    }
  }

  /* ---- Todo, subagent and activity actions -------------------------------------------------
   *
   * These are separate from the goal verbs above because they mutate DIFFERENT records: the goal
   * switch owns the goal's lifecycle, and these own the task list, the subagent group and the
   * activity run. They live in this module rather than in the demo director for the same reason the
   * goal verbs do — the records belong to the surfaces service, and a director that reached in and
   * mutated them directly would be a second writer with no gate.
   *
   * Each returns false when there is nothing to act on, so a control bound to one of them can report
   * honestly instead of appearing to work.
   */
  function todoAct(threadId, action) {
    var t = threadOf(threadId);
    var todo = t && t.todo;
    if (!todo || !todo.items || !todo.items.length) return false;
    var items = todo.items;
    var i;

    if (action === 'todo_add') {
      items.push({
        id: 'g' + (items.length + 1),
        text: 'Confirm the change against the settings screen',
        state: 'pending'
      });
      if (store) store.touchView('surfaces');
      return true;
    }

    if (action === 'todo_complete') {
      /* Complete the first item that is not already done, preferring the active one. A blocked item
       * is deliberately skipped: completing it would erase the reason it is blocked. */
      for (i = 0; i < items.length; i++) {
        if (items[i].state === 'active') { items[i].state = 'done'; break; }
      }
      if (i === items.length) {
        for (i = 0; i < items.length; i++) {
          if (items[i].state === 'pending') { items[i].state = 'done'; break; }
        }
      }
      if (i === items.length) return false;
      /* The next pending item becomes active, so the list always shows where work is. */
      for (var j = 0; j < items.length; j++) {
        if (items[j].state === 'pending') { items[j].state = 'active'; break; }
      }
      if (store) store.touchView('surfaces');
      return true;
    }

    if (action === 'todo_reopen') {
      for (i = items.length - 1; i >= 0; i--) {
        if (items[i].state === 'done') { items[i].state = 'active'; if (store) store.touchView('surfaces'); return true; }
      }
      return false;
    }
    return false;
  }

  var AGENT_NEXT = {
    agent_advance: { from: ['queued'], to: 'running' },
    agent_queue: { from: ['running'], to: 'queued' },
    agent_block: { from: ['running', 'queued'], to: 'blocked' },
    agent_complete: { from: ['running'], to: 'completed' },
    agent_fail: { from: ['running'], to: 'failed' },
    agent_stop: { from: ['running', 'queued'], to: 'stopped' },
    agent_retry: { from: ['failed', 'stopped'], to: 'running' }
  };

  function agentAct(threadId, action) {
    var t = threadOf(threadId);
    var groups = (t && t.subagentGroups) || [];
    if (!groups.length) return false;
    var group = groups[0];
    group.agents = group.agents || [];

    if (action === 'agent_spawn') {
      var n = group.agents.length + 1;
      group.agents.push({
        id: 'ag-' + n,
        name: 'Specialist ' + n,
        role: 'Reader',
        state: 'queued',
        /* A spawned agent carries its route from the moment it exists: an agent whose route is
         * unknown cannot be reasoned about, and the capacity forecast is expressed in routes. */
        route: (store ? store.runtime(threadId, 'account') + ' \u00b7 ' + store.runtime(threadId, 'model') : 'unknown'),
        workedSeconds: 0,
        resultRef: null
      });
      if (store) store.touchView('surfaces');
      return true;
    }

    var rule = AGENT_NEXT[action];
    if (!rule) return false;
    for (var i = 0; i < group.agents.length; i++) {
      var a = group.agents[i];
      if (rule.from.indexOf(a.state) < 0) continue;
      a.state = rule.to;
      if (action === 'agent_block') a.blockedReason = 'Waiting on the port change in the test configuration.';
      if (action === 'agent_retry') a.attempts = (a.attempts || 1) + 1;
      if (action === 'agent_complete') a.resultRef = a.resultRef || 'Finished and handed back its findings.';
      if (store) store.touchView('surfaces');
      return true;
    }
    /* No agent was in a state this verb applies to. Refusing is the honest answer — the previous
     * behaviour would have reported success for a transition that never happened. */
    return false;
  }

  function activityAct(threadId, action) {
    var t = threadOf(threadId);
    if (!t) return false;
    var stages = t.activityStages || [];
    if (!stages.length) return false;
    var v = store ? store.view(threadId) : null;
    if (!v) return false;
    v.surfaces = v.surfaces || { expanded: null, openIds: {}, phaseIndex: null };

    if (action === 'activity_advance') {
      var next = (v.surfaces.phaseIndex == null ? 0 : v.surfaces.phaseIndex + 1);
      if (next >= stages.length) next = stages.length - 1;
      v.surfaces.phaseIndex = next;
      if (store) store.touchView('surfaces');
      return true;
    }
    if (action === 'activity_condense') {
      /* Condensing is what turns a finished run into a durable index. The phase pointer is cleared
       * because a condensed group has no current phase — reopening chooses one again. */
      v.surfaces.phaseIndex = null;
      v.surfacesYielded = true;
      if (store) store.touchView('surfaces');
      return true;
    }
    if (action === 'activity_reopen') {
      v.surfacesYielded = false;
      v.surfaces.phaseIndex = 0;
      if (store) store.touchView('surfaces');
      return true;
    }
    return false;
  }

  function act(threadId, action) {
    /* Todo, subagent and activity verbs are dispatched FIRST. They do not touch the goal, so
     * requiring a goal to exist — or passing them through canAct, which only knows goal
     * lifecycle — would refuse them for a reason that has nothing to do with them. */
    if (action.indexOf('todo_') === 0) return todoAct(threadId, action);
    if (action.indexOf('agent_') === 0) return agentAct(threadId, action);
    if (action.indexOf('activity_') === 0) return activityAct(threadId, action);

    var goal = goalFor(threadId);
    if (!goal) return false;
    /* D12: every branch below MUTATES the goal, so the gate has to run before the switch and
     * not inside each case. Without it, act(tid,'resume') on a goal that was never started
     * flipped it to running and announced a resumption that never happened — and the
     * transcript then carries that lie forever. */
    if (!canAct(goal, action)) return false;
    var toast = global.PMXToast;

    switch (action) {
      case 'start':
        /* Only reachable while status is 'idle' (see canAct). This branch is the honest
         * replacement for the old demo path that reached for 'resume'. */
        goal.status = 'running'; goal.canStart = false; goal.canPause = true; goal.canResume = false;
        if (toast) toast.show('Goal started');
        break;
      case 'pause':
        goal.status = 'paused'; goal.canPause = false; goal.canResume = true;
        if (toast) toast.show('Goal paused');
        break;
      case 'resume':
        goal.status = 'running'; goal.canPause = true; goal.canResume = false;
        if (toast) toast.show('Goal resumed');
        break;
      case 'stop':
        goal.status = 'stopped'; goal.canPause = false; goal.canResume = false;
        if (toast) toast.show('Goal stopped. Its record and evidence are kept.');
        break;
      case 'clear':
        /* Distinct from Stop: clearing removes the goal from the thread rather than
         * terminating a run that keeps its record. */
        if (threadOf(threadId)) threadOf(threadId).activeGoal = null;
        if (toast) toast.show('Goal cleared from this conversation');
        break;
      case 'edit':
        /* A material edit does not silently replace the objective. It gates scheduling,
         * shows replan feedback, then resumes according to runtime behavior. */
        goal.status = 'replanning';
        goal.replan = {
          reason: 'The objective was edited while work was in progress.',
          impact: 'Scheduling is paused while the task list is reconciled.',
          pausedScheduling: true
        };
        if (toast) toast.show('Objective edited. Scheduling paused while tasks are replanned.');
        global.setTimeout(function () {
          if (goal.status !== 'replanning') return;
          goal.status = 'running';
          if (store) store.touchView('surfaces');
        }, 2600);
        break;
      case 'replan':
        /* Distinct from `edit`: a replan is the runtime reconsidering its own plan, not the user
         * changing the objective. Both pause scheduling, and only one of them names the user. */
        goal.status = 'replanning';
        goal.replan = {
          reason: 'The runtime replanned after the port conflict.',
          impact: 'Scheduling is paused while the task list is reconciled.',
          pausedScheduling: true
        };
        if (toast) toast.show('Replanning. Scheduling paused while tasks are reconciled.');
        break;
      case 'block':
        goal.status = 'blocked';
        goal.canPause = false; goal.canResume = true;
        goal.blockedReason = 'The test configuration still names port 3000.';
        if (toast) toast.show('Goal blocked. The reason is recorded on the goal.');
        break;
      case 'complete':
        goal.status = 'complete';
        goal.canPause = false; goal.canResume = false; goal.canStop = false;
        /* A completion with no receipt leaves nothing durable behind, which is the whole point of
         * completionReceipt() existing. */
        goal.completionReceipt = goal.completionReceipt || {
          at: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
          verified: true,
          artifacts: ['artifact-diff'],
          elapsedSeconds: goal.totalElapsedSeconds || 0,
          workedSeconds: goal.workedSeconds || 0
        };
        if (toast) toast.show('Goal complete');
        break;
      case 'expand': goal.expanded = true; break;
      case 'collapse': goal.expanded = false; break;
      default:
        /* An action no branch implements is a failure, not a notification. The old
         * fall-through showed a toast built from the verb and then returned true, so an
         * unimplemented control looked like it had worked (D12). */
        return false;
    }
    if (store) store.touchView('surfaces');
    return true;
  }

  /* The Goal Runtime owns phase state; SHARED_PROCESS_RULES forbids a second Goal system, so
   * this is a PROJECTION of whatever the runtime published, in priority order: an authored
   * phase list, then the lifecycle event trail, then the coarse status. */
  var PHASES = ['Planning', 'Working', 'Verifying', 'Complete'];

  /* Lifecycle events name TRANSITIONS (start/pause/resume/replan/blocked/complete), not
   * phases, so the trail is read for the state it left the goal in. */
  function statusFromEvents(events) {
    if (!events || !events.length) return null;
    switch (events[events.length - 1].phase) {
      case 'start': case 'resume': return 'running';
      case 'pause': return 'paused';
      case 'replan': return 'replanning';
      case 'blocked': return 'blocked';
      case 'complete': return 'complete';
      case 'stop': return 'stopped';
      default: return null;
    }
  }

  function phaseIndexForStatus(status) {
    switch (status) {
      case 'idle': case 'replanning': return 1;
      case 'verifying': return 3;
      case 'complete': return 4;
      /* running, paused, blocked and stopped all sit in Working: a halted goal reached that
       * phase and nothing later ever ran. */
      default: return 2;
    }
  }

  function lastEventAt(goal, phase) {
    var events = (goal && goal.events) || [];
    for (var i = events.length - 1; i >= 0; i--) {
      if (events[i].phase === phase) return events[i].at || null;
    }
    return null;
  }

  /* index is 1-based because every concept renders it as "Phase <index> of <total>". */
  function phaseOf(goal) {
    if (!goal) return null;
    var list = goal.phases;
    if (list && list.length) {
      var idx = typeof goal.phaseIndex === 'number' ? goal.phaseIndex : 0;
      if (idx < 0) idx = 0;
      if (idx > list.length - 1) idx = list.length - 1;
      var entry = list[idx];
      return {
        index: idx + 1,
        total: list.length,
        label: typeof entry === 'string' ? entry : ((entry && entry.label) || '')
      };
    }
    /* status is the live field act() mutates, so it outranks the historical event trail; the
     * trail is only consulted for a record that carries history but no current status. */
    var status = goal.status || statusFromEvents(goal.events) || 'running';
    var index = phaseIndexForStatus(status);
    return {
      index: index,
      total: PHASES.length,
      /* Stopped keeps its ladder position but not the ladder's label: calling a halted goal
       * "Working" would claim work that is not happening. */
      label: status === 'stopped' ? 'Stopped' : PHASES[index - 1]
    };
  }

  /* Null until the goal actually completed. A receipt with empty evidence would read as
   * "finished, nothing to show", which is worse than showing no receipt at all. */
  function completionReceipt(goal) {
    if (!goal) return null;
    var authored = goal.completionReceipt;
    if (!authored && goal.status !== 'complete') return null;
    var r = authored || {};
    return {
      at: r.at || goal.completedAt || lastEventAt(goal, 'complete') || null,
      /* Verification is a separate outcome from completion: a goal can finish unverified, and
       * the receipt has to be able to say so. */
      verified: typeof r.verified === 'boolean'
        ? r.verified
        : !!(goal.verification && goal.verification.result === 'passed'),
      artifacts: (r.artifacts || goal.artifacts || []).slice(),
      elapsedSeconds: typeof r.elapsedSeconds === 'number' ? r.elapsedSeconds : (goal.totalElapsedSeconds || 0),
      workedSeconds: typeof r.workedSeconds === 'number' ? r.workedSeconds : (goal.workedSeconds || 0)
    };
  }

  /* ---------------------------------------------------------------- activity */

  function activityGroupFor(msg) {
    return msg && msg.activityGroup ? msg.activityGroup : null;
  }

  function activityStages(group) {
    return group && group.stages ? group.stages.slice() : [];
  }

  function condenseLabel(group) {
    if (!group) return '';
    if (group.compactLabel) return group.compactLabel;
    var n = (group.stages || []).length;
    return n === 1 ? '1 step' : n + ' steps';
  }

  /* ---------------------------------------------------------------- subagents */

  function subagentSummary(group) {
    if (!group) return '';
    var c = group.counts || {};
    var parts = [];
    if (c.working) parts.push(c.working + ' working');
    if (c.complete) parts.push(c.complete + ' complete');
    if (c.blocked) parts.push(c.blocked + ' blocked');
    /* Ordinary words with spaces. The stored enum is waiting_for_parent; it must never
     * reach display prose in that form. */
    if (c.waiting) parts.push(c.waiting + ' waiting for parent');
    return parts.join(', ');
  }

  /* ---------------------------------------------------------------- capacity */

  /* thread-01's forecast is pinned because 03_...:69-72 froze those four values as the
   * demonstrated example every concept is read against; deriving them would let an unrelated
   * fixture edit silently rewrite copy the packet fixed. Every other thread is derived. */
  var PINNED_FORECAST = {
    'thread-01': {
      requested: 6,
      recommendedConcurrent: 2,
      waves: 3,
      reason: 'provider allowance and verification reserve'
    }
  };

  function agentsOf(t) {
    var out = [], groups = (t && t.subagentGroups) || [], ags, i, j;
    for (i = 0; i < groups.length; i++) {
      ags = groups[i].agents || [];
      for (j = 0; j < ags.length; j++) out.push(ags[j]);
    }
    return out;
  }

  /* A compact forecast, not a guarantee (03_...:75). It reads state and writes nothing: a
   * concept calls this from inside a render pass, so a store write here would re-enter the
   * render that asked for it — the same recursion yieldForQuestion guards against. */
  function forecast(threadId) {
    var agents = agentsOf(threadOf(threadId));
    var roles = [], i;
    for (i = 0; i < agents.length; i++) {
      if (agents[i] && agents[i].name) roles.push(agents[i].name);
    }
    /* A fixture may author the forecast on the view slice; that authored record wins over the
     * derivation, but never over the shape. */
    var seeded = store ? store.view(threadId).capacity : null;
    var src = PINNED_FORECAST[threadId] || seeded || null;
    var requested = src && typeof src.requested === 'number' ? src.requested : agents.length;
    var concurrent = src && typeof src.recommendedConcurrent === 'number'
      ? src.recommendedConcurrent
      : Math.min(2, requested);
    return {
      requested: requested,
      recommendedConcurrent: concurrent,
      waves: src && typeof src.waves === 'number'
        ? src.waves
        : (concurrent > 0 ? Math.ceil(requested / concurrent) : 0),
      reason: (src && src.reason) || 'provider allowance and verification reserve',
      requiredRoles: roles,
      /* ALWAYS empty, by rule (03_...:77): a required independent role cannot be silently
       * dropped. When the governor cannot admit one now it is admitted later as a QUEUED
       * subagent, so no code path can populate this. It stays in the shape so a concept can
       * state "none dropped" from the record instead of from an assumption. */
      droppedRoles: []
    };
  }

  /* ---------------------------------------------------------------- crew */

  /* Crew is a multi-child execution strategy, not a Persona and not a mode (03_...:81). A
   * template therefore names roles and the route each role runs on; `kind` is the role's
   * function and is projected away by templates(), which the contract fixes at
   * { id, name, roles:[{ name, route }] }.
   *
   * Routes are written in the `<Account label> · <Model>` form PMXRoute produces, so the same
   * string can sit beside a crew member here and beside a subagent elsewhere without a second
   * formatter. Both Anthropic accounts appear, which is also the proof that the same model on
   * two accounts is two distinct routes. */
  var TEMPLATES = [
    {
      id: 'crew-interface-review',
      name: 'Interface review crew',
      roles: [
        { name: 'Layout reviewer', kind: 'Reviewer', route: 'Anthropic — Work · Opus 5' },
        { name: 'Accessibility reviewer', kind: 'Reviewer', route: 'OpenAI — Team · GPT-5.6 Pro' },
        { name: 'Copy reviewer', kind: 'Reviewer', route: 'Anthropic — Personal · Sonnet 5' }
      ]
    },
    {
      id: 'crew-provider-migration',
      name: 'Provider migration crew',
      roles: [
        { name: 'Route mapper', kind: 'Researcher', route: 'Anthropic — Work · Opus 5' },
        { name: 'Settings surveyor', kind: 'Researcher', route: 'OpenAI — Team · GPT-5.6 Mini' },
        { name: 'Test author', kind: 'Implementer', route: 'Anthropic — Work · Haiku 4.5' },
        { name: 'Verification reviewer', kind: 'Verifier', route: 'Anthropic — Personal · Sonnet 5' }
      ]
    }
  ];

  function nowIso() { return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'); }

  /* waves and board entries point at members by id, so a member needs one; the id is derived
   * from the role name rather than a counter so a rendered board line survives a reorder. */
  function memberIdOf(name) {
    return 'm-' + String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function crewTemplates() {
    var out = [], i, j, roles;
    for (i = 0; i < TEMPLATES.length; i++) {
      roles = [];
      for (j = 0; j < TEMPLATES[i].roles.length; j++) {
        roles.push({ name: TEMPLATES[i].roles[j].name, route: TEMPLATES[i].roles[j].route });
      }
      out.push({ id: TEMPLATES[i].id, name: TEMPLATES[i].name, roles: roles });
    }
    return out;
  }

  function templateById(id) {
    for (var i = 0; i < TEMPLATES.length; i++) {
      if (TEMPLATES[i].id === id) return TEMPLATES[i];
    }
    return null;
  }

  function crewOf(threadId) {
    if (!store) return null;
    return store.view(threadId).crew || null;
  }

  /* Writes view[threadId].crew and nothing else. Writing session.defaults.crew here would make
   * one thread's Crew choice leak into every other thread, which 03_...:95 forbids. */
  function startCrew(threadId, templateId) {
    if (!store) return null;
    var tpl = templateById(templateId);
    if (!tpl) return null;

    /* Wave size comes from the capacity forecast rather than from the template, so the Crew
     * schedule and the Usage/resource reason it shows are the same number. */
    var cap = forecast(threadId);
    var concurrent = cap.recommendedConcurrent > 0 ? cap.recommendedConcurrent : 1;
    var members = [], waves = [], board = [], at = nowIso();
    var i, role, id, wave = null;

    for (i = 0; i < tpl.roles.length; i++) {
      role = tpl.roles[i];
      id = memberIdOf(role.name);
      members.push({
        id: id,
        name: role.name,
        role: role.kind,
        route: role.route,
        /* Everything past the first wave is QUEUED, never dropped — the same rule that keeps
         * PMXCapacity.droppedRoles empty. */
        state: i < concurrent ? 'running' : 'queued',
        resultRef: null
      });
      if (i % concurrent === 0) { wave = []; waves.push(wave); }
      wave.push(id);
      if (i < concurrent) board.push({ at: at, memberId: id, text: 'Started on ' + role.route });
    }

    var rec = {
      id: 'crew-' + threadId + '-' + tpl.id,
      templateId: tpl.id,
      name: tpl.name,
      members: members,
      waves: waves,
      board: board,
      /* The parent reducer synthesises only once the members have produced independent
       * results, so it starts waiting with nothing to point at. */
      reducer: { state: 'waiting', synthesisRef: null },
      reason: concurrent + ' concurrent across ' + waves.length
        + (waves.length === 1 ? ' wave · ' : ' waves · ') + cap.reason
    };
    store.setView(threadId, 'crew', rec);
    return rec;
  }

  function stopCrew(threadId) {
    if (!store) return false;
    if (!store.view(threadId).crew) return false;
    store.setView(threadId, 'crew', null);
    return true;
  }

  global.PMXSurfaces = {
    bind: bind,
    attach: attach,
    activeFor: activeFor,
    yieldForQuestion: yieldForQuestion,
    goalFor: goalFor,
    canAct: canAct,
    act: act,
    phaseOf: phaseOf,
    completionReceipt: completionReceipt,
    activityGroupFor: activityGroupFor,
    activityStages: activityStages,
    condenseLabel: condenseLabel,
    subagentSummary: subagentSummary
  };

  /* The contract exposes activity and goal helpers under their own service names too, so a
   * concept can call either without knowing they share an implementation. */
  global.PMXActivity = {
    groupFor: activityGroupFor,
    stages: activityStages,
    condenseLabel: condenseLabel
  };
  global.PMXGoals = {
    forThread: goalFor,
    can: canAct,
    act: act,
    phaseOf: phaseOf,
    completionReceipt: completionReceipt
  };

  /* Capacity and Crew are separate service names because a concept asks them separate
   * questions, but they share this file so the wave arithmetic has exactly one owner. */
  global.PMXCapacity = {
    bind: bind,
    forecast: forecast
  };
  global.PMXCrew = {
    bind: bind,
    templates: crewTemplates,
    of: crewOf,
    start: startCrew,
    stop: stopCrew
  };
})(window);
