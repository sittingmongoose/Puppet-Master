
  window.PM56_DATA = {
    /* enum -> human copy; no raw enum value is ever user-facing */
    labels,
    /* working animation */
    workSteps, phaseMeta, phaseRows, phaseGroups,
    /* activity domains */
    artifacts, subagents, subagentGroups, todos, changes,
    /* conversation */
    threads,
    /* context (consumed by the Wave 3 Context agent) */
    contextSources, contextWindow, contextCompaction, contextByThread, compactionOutcomes,
    /* configuration */
    recipes, themes, models, accounts, accountsNeedingAttention,
    questions, questionFlows, questionQueueDepth,
    /* operations */
    operational, warnings, scriptedReplies, drafts,
    workingTakes, transcriptTakes
  };

  /* Final feature manifest used by the concept lab's self-audit and Demo
     Studio. Every count below is DERIVED from the collections above --
     the previous version hand-listed four numbers that the fixtures
     disproved (10 artifact kinds against 13 records, 8 demo threads
     against 24, 9 working states against 14 steps, and a 5-item artifact
     status list that never mentioned `loading`). A manifest that has to
     be edited by hand when a fixture changes is a manifest that lies. */
  const D0 = window.PM56_DATA;
  const uniq = (xs) => [...new Set(xs)];
  const cap = (s) => String(s).replace(/^./, (c) => c.toUpperCase());

  window.PM56_FEATURE_MANIFEST = Object.freeze({
    context: ['Compact Now', 'More Details', 'Current window', 'Tokens loaded', 'Cache hit', 'Source composition'],
    activityDomains: ['Goal', 'Todo', 'Subagents', 'Changes', 'Artifacts'],
    workingControls: ['Start', 'Pause', 'Step', 'Complete', 'Reset', 'History'],
    workingStates: D0.workSteps.map((s) => s.label),
    workingTakes: D0.workingTakes.slice(),
    transcriptTakes: D0.transcriptTakes.slice(),
    decisions: ['Approve', 'Revise', 'Build', 'Questionnaire', 'Permission', 'Conflict'],
    messageActions: ['Copy', 'Edit and branch', 'Re-answer', 'More details'],
    threadActions: ['Pin', 'Rename', 'Fork', 'Archive', 'Restore', 'Search'],
    demoThreads: D0.threads.map((t) => t.title),
    artifactKinds: uniq(D0.artifacts.map((a) => a.kind)).map(cap),
    artifactStates: uniq(D0.artifacts.map((a) => a.status)).map((s) => D0.labels.artifactStatus[s] || cap(s)),
    changeStates: uniq(D0.changes.map((c) => c.status)).map((s) => D0.labels.changeStatus[s] || cap(s)),
    subagentStates: uniq(D0.subagents.map((a) => a.status)).map((s) => D0.labels.subagentStatus[s] || cap(s)),
    todoStates: uniq(D0.todos.map((t) => t.status)).map((s) => D0.labels.todoStatus[s] || cap(s)),
    modelStates: uniq(D0.models.map((m) => m.status)).map((s) => D0.labels.modelStatus[s] || cap(s)),
    worktreeStates: uniq(D0.operational.worktrees.map((w) => w.state)).map((s) => D0.labels.worktreeState[s] || cap(s)),
    contextFamilies: D0.contextSources.map((s) => s.family),
    selectors: ['Persona', 'Model', 'Mode', 'Permissions', 'Worktree'],
    persistence: ['No passive questionnaire expiry', 'Per-thread drafts', 'Draft history'],

    /* The one place a number appears, it is computed. */
    counts: Object.freeze({
      threads: D0.threads.length,
      activeThreads: D0.threads.filter((t) => !t.archived).length,
      archivedThreads: D0.threads.filter((t) => t.archived).length,
      messages: D0.threads.reduce((s, t) => s + t.messages.length, 0),
      minThreadMessages: Math.min(...D0.threads.map((t) => t.messages.length)),
      maxThreadMessages: Math.max(...D0.threads.map((t) => t.messages.length)),
      changedFiles: D0.changes.length,
      diffHunks: D0.changes.reduce((s, c) => s + (c.hunks ? c.hunks.length : 0), 0),
      linesAdded: D0.changes.reduce((s, c) => s + (c.add || 0), 0),
      linesDeleted: D0.changes.reduce((s, c) => s + (c.del || 0), 0),
      subagents: D0.subagents.length,
      todos: D0.todos.length,
      artifacts: D0.artifacts.length,
      models: D0.models.length,
      workSteps: D0.workSteps.length,
      phaseRowSets: Object.keys(D0.phaseRows).length,
      accounts: D0.accounts.length,
      accountsNeedingAttention: D0.accountsNeedingAttention.length,
      questionFlows: D0.questionFlows.length,
      questions: D0.questionFlows.reduce((s, f) => s + f.questions.length, 0),
      questionsQueued: D0.questionQueueDepth,
      contextSources: D0.contextSources.length,
      contextThreads: Object.keys(D0.contextByThread).length,
      worktrees: D0.operational.worktrees.length,
      portLeases: D0.operational.ports.length,
      warnings: D0.warnings.length,
      scriptedReplies: D0.scriptedReplies.length,
      drafts: D0.drafts.length
    }),

    /* Families 2 and 5 are owned by data.js and derived. The other five
       option-name arrays live in app.js's renderDemoDialog(), so their
       size is stated as a contract, not measured -- if app.js ever ships
       a family with a different length, that is the mismatch to fix. */
    optionFamilies: Object.freeze({
      bodyVariants: 8,
      historyVariants: 8,
      workingVariants: D0.workingTakes.length,
      activityVariants: 8,
      detailVariants: 8,
      transcriptVariants: D0.transcriptTakes.length,
      questionVariants: 8
    })
  });
})();
