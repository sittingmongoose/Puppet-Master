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
      case 'pause': return goal.canPause !== false && goal.status === 'running';
      case 'resume': return goal.canResume !== false && (goal.status === 'paused' || goal.status === 'blocked');
      case 'stop': return goal.canStop !== false && goal.status !== 'complete';
      /* Clear is a distinct operation from Stop and stays available on a terminal goal. */
      case 'clear': return goal.canClear !== false;
      case 'edit': return goal.canEdit !== false;
      default: return true;
    }
  }

  function act(threadId, action) {
    var goal = goalFor(threadId);
    if (!goal) return false;
    var toast = global.PMXToast;

    switch (action) {
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
      case 'expand': goal.expanded = true; break;
      case 'collapse': goal.expanded = false; break;
      default:
        if (toast) toast.show(global.PMXData.fmt.label(action));
    }
    if (store) store.touchView('surfaces');
    return true;
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

  global.PMXSurfaces = {
    bind: bind,
    attach: attach,
    activeFor: activeFor,
    yieldForQuestion: yieldForQuestion,
    goalFor: goalFor,
    canAct: canAct,
    act: act,
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
    act: act
  };
})(window);
