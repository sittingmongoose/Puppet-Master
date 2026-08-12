/* ============================================================================
   Kimi K3 — final cumulative packet overlay (window.K3_DEMO_PACKET).

   EXTENDS demo-data.js + demo-augment.js. Merged LAST in K3Data.init.
   Adds the packet decision-layer fixture: provider catalog, four new
   threads (16-19), worktrees, port leases, crew templates, sync profile,
   and BSD store seeds. Existing 15 threads are never reduced or rewritten.

   Merge semantics (implemented by K3Data.init):
   - messagePatches / messageInserts: same mechanics as K3_DEMO_AUGMENT.
   - threadAppends: whole thread records deep-cloned onto DATA.threads.
   - catalogs: deep-cloned to DATA.catalogs (providers, worktrees, ...).
   - storeSeeds: written to the K3Store semantic slice only when no
     persisted/user value exists (persisted sessions always win).

   Deterministic: fixed ids and UTC timestamps only. No Date.now().
   ========================================================================== */
(function () {
  'use strict';

  var T = '2026-08-08T';

  function rt(over) {
    return Object.assign({
      provider: 'Anthropic',
      model: 'Claude Sonnet 4.5',
      persona: 'Assistant',
      mode: 'Agent',
      effort: 'High',
      workedSeconds: 30,
      totalElapsedSeconds: 30,
      tokenCount: 2400,
      contextUsed: 41200,
      contextLimit: 200000,
      estimatedCost: 0.03
    }, over || {});
  }
  function msg(id, role, body, at, runtime, extra) {
    var m = {
      id: id,
      role: role,
      body: body,
      sentAt: T + at,
      runtime: runtime || rt(),
      eligibleForEdit: role === 'user',
      collapsedByDefault: false
    };
    if (extra) Object.keys(extra).forEach(function (k) { m[k] = extra[k]; });
    return m;
  }

  // --- provider catalog -------------------------------------------------------
  var providers = [
    {
      id: 'anthropic', name: 'Anthropic', icon: 'provider-anthropic', status: 'ok',
      accounts: [
        { id: 'work', label: 'Work', connection: { kind: 'api-key', label: 'API key', status: 'ok' } },
        { id: 'personal', label: 'Personal', connection: { kind: 'claude-cli', label: 'Claude CLI', status: 'ok', note: 'Sign in with the Claude CLI — PM does not handle this login' } }
      ],
      models: [
        { id: 'claude-sonnet-4.5', label: 'Claude Sonnet 4.5', short: 'Sonnet 4.5', capabilities: { effort: true, fast: true, vision: true, context: 200000 }, priceTier: 'plan', status: 'ok' },
        { id: 'claude-opus-4.1', label: 'Claude Opus 4.1', short: 'Opus 4.1', capabilities: { effort: true, fast: false, vision: true, context: 200000 }, priceTier: 'plan', status: 'ok' },
        { id: 'claude-haiku-4.5', label: 'Claude Haiku 4.5', short: 'Haiku 4.5', capabilities: { effort: false, fast: true, vision: true, context: 200000 }, priceTier: 'plan', status: 'ok' }
      ]
    },
    {
      id: 'openai', name: 'OpenAI', icon: 'provider-openai', status: 'ok',
      accounts: [
        { id: 'work', label: 'Work', connection: { kind: 'api-key', label: 'API key', status: 'api-key-required', note: 'API key required — open Provider Settings to connect' } }
      ],
      models: [
        { id: 'gpt-5.2', label: 'GPT-5.2', short: 'GPT-5.2', capabilities: { effort: true, fast: true, vision: true, context: 256000 }, priceTier: 'metered', status: 'ok' },
        { id: 'gpt-5.2-codex', label: 'GPT-5.2 Codex', short: 'GPT-5.2 Codex', capabilities: { effort: true, fast: false, vision: false, context: 256000 }, priceTier: 'metered', status: 'ok' }
      ]
    },
    {
      id: 'google', name: 'Google', icon: 'provider-google', status: 'ok',
      accounts: [
        { id: 'personal', label: 'Personal', connection: { kind: 'oauth', label: 'Google account', status: 'sign-in-required', note: 'Sign-in required — open Provider Settings to continue' } }
      ],
      models: [
        { id: 'gemini-3-pro', label: 'Gemini 3 Pro', short: 'Gemini 3 Pro', capabilities: { effort: true, fast: true, vision: true, video: true, context: 1000000 }, priceTier: 'metered', status: 'ok' }
      ]
    },
    {
      id: 'xai', name: 'xAI', icon: 'provider-xai', status: 'ok',
      accounts: [
        { id: 'work', label: 'Work', connection: { kind: 'api-key', label: 'API key', status: 'update-available', note: 'Update available — scheduled when idle' } }
      ],
      models: [
        { id: 'grok-4.5', label: 'Grok 4.5', short: 'Grok 4.5', capabilities: { effort: true, fast: true, vision: true, context: 131072 }, priceTier: 'metered', status: 'ok' }
      ]
    },
    {
      id: 'ollama', name: 'Ollama (local)', icon: 'provider-ollama', status: 'ok',
      accounts: [
        { id: 'local', label: 'Local', connection: { kind: 'local-cli', label: 'Ollama CLI', status: 'cli-not-found', note: 'CLI not found — install Ollama to use local models' } }
      ],
      models: [
        { id: 'qwen3-32b', label: 'Qwen3 32B', short: 'Qwen3 32B', capabilities: { effort: false, fast: false, vision: false, context: 32768 }, priceTier: 'local', status: 'unavailable', unavailableReason: 'CLI not found — install Ollama to use local models' }
      ]
    }
  ];

  // --- thread-16: canonical showcase ------------------------------------------
  var thread16 = {
    id: 'thread-16',
    title: 'Provider settings redesign — live',
    project: 'Puppet Master',
    pinned: true,
    archived: false,
    threadState: 'running',
    updatedAt: T + '14:32:00Z',
    initialVisibleMessageCount: 50,
    scriptedReplyCursor: 0,
    scriptedReplyIds: ['reply-01', 'reply-02', 'reply-03'],
    tags: ['showcase', 'providers'],
    activeGoal: {
      id: 'goal-16-provider-settings',
      title: 'Redesign the Provider Settings manager',
      objective: 'Ship the provider/account/model route picker with explicit connections, setup states, and material route warnings.',
      status: 'running',
      phase: 'Verification',
      workedSeconds: 1874,
      totalElapsedSeconds: 2610,
      canEdit: true, canPause: true, canResume: false, canStop: true, canClear: true,
      expanded: false,
      progress: { done: 3, total: 8 }
    },
    todo: {
      id: 'todo-16',
      items: [
        { id: 'td1', label: 'Map provider/account/model route model', state: 'complete' },
        { id: 'td2', label: 'Collect capability evidence per route', state: 'complete' },
        { id: 'td3', label: 'Draft picker layout with icon rail', state: 'complete' },
        { id: 'td4', label: 'Wire effort and Normal/Fast submenus', state: 'running' },
        { id: 'td5', label: 'Add setup states and deep links', state: 'pending' },
        { id: 'td6', label: 'Add material route warning card', state: 'pending' },
        { id: 'td7', label: 'Verify with Browser Program pass', state: 'pending' },
        { id: 'td8', label: 'Write migration note for Plans', state: 'pending' }
      ]
    },
    subagentGroups: [{
      id: 'sg-16-providers',
      label: 'Provider research routes',
      state: 'working',
      counts: { working: 1, complete: 1, blocked: 1, waiting: 1 },
      agents: [
        { name: 'Claude route researcher', task: 'Map Anthropic account routes and connections', route: 'anthropic/work/claude-sonnet-4.5', status: 'working', currentActivity: 'Reading Multi-Account.md', workedSeconds: 204 },
        { name: 'OpenAI route researcher', task: 'Complete the GPT-5.2 capability matrix', route: 'openai/work/gpt-5.2', status: 'complete', currentActivity: 'Completed capability matrix', workedSeconds: 167 },
        { name: 'Gemini route researcher', task: 'Verify Gemini 3 Pro video intake limits', route: 'google/personal/gemini-3-pro', status: 'waiting for capacity', currentActivity: 'Queued — provider allowance reserve', workedSeconds: 12 },
        { name: 'Local model scout', task: 'Assess Qwen3 32B as a local fallback', route: 'ollama/local/qwen3-32b', status: 'blocked', currentActivity: 'Blocked — Ollama CLI not found', workedSeconds: 0 }
      ]
    }],
    diffGroups: [{
      id: 'diff-16-settings',
      label: 'Provider settings redesign edits',
      files: [
        { path: 'Concepts/settings/ProviderManager.tsx', added: 214, removed: 96, status: 'edited' },
        { path: 'Concepts/settings/provider-routes.ts', added: 88, removed: 12, status: 'edited' },
        { path: 'docs/provider-settings.md', added: 47, removed: 0, status: 'added' }
      ]
    }],
    questionnaires: [{
      id: 'q-16-scope',
      status: 'incomplete',
      createdAt: T + '13:05:00Z',
      currentQuestionIndex: 0,
      questions: [
        { id: 'q1', prompt: 'Which providers must appear in the first picker rail?', kind: 'multi select', required: true, options: ['Anthropic', 'OpenAI', 'Google', 'xAI', 'Ollama (local)'], selected: [] },
        { id: 'q2', prompt: 'Where should material route warnings appear?', kind: 'single select', required: true, options: ['Inline card in the thread', 'Modal before switching', 'Both'], selected: [] },
        { id: 'q3', prompt: 'Anything the migration note must call out?', kind: 'freeform', required: false, draft: '' }
      ]
    }],
    artifacts: [
      { id: 'art-16-code', title: 'ProviderSettings.tsx', kind: 'code', projectPath: 'Concepts/settings/ProviderSettings.tsx', openTarget: 'editor tab', status: 'ready' },
      { id: 'art-16-diff', title: 'Provider settings — 3-file diff', kind: 'diff', projectPath: 'Concepts/settings/', openTarget: 'editor tab', status: 'ready' },
      { id: 'art-16-shot', title: 'Settings redesign — test screenshot', kind: 'image', projectPath: 'captures/provider-settings.png', openTarget: 'editor tab', status: 'updated' },
      { id: 'art-16-report', title: 'Provider route verification report', kind: 'report', projectPath: 'docs/provider-route-report.md', openTarget: 'editor tab', status: 'ready' }
    ],
    browserSessions: [
      { id: 'bp-16-verify', title: 'Provider settings verification', status: 'complete', openTarget: 'editor tab', currentPage: 'Settings — Providers', pagesVisited: 6, screenshots: 3, program: 'Browser Program' }
    ],
    threadRequests: [],
    messages: [
      msg('t16-m0001', 'user', 'Redesign the Provider Settings manager. I want one picker that shows provider, account, and model as a single route — with explicit connection state, favorites, recents, and honest setup states when a route is not configured. Research the provider matrix first, then implement and verify it.', '13:00:00Z', rt({ workedSeconds: 0, totalElapsedSeconds: 0, tokenCount: 0 })),
      msg('t16-m0002', 'assistant', 'Plan: (1) map the provider/account/model route model from Multi-Account and Models System, (2) confirm scope with two short question rounds, (3) run a Goal with a research crew across routes, (4) implement the picker and warnings, (5) verify with a Browser Program pass and report.', '13:00:20Z', rt({ workedSeconds: 20, totalElapsedSeconds: 20 })),
      msg('t16-m0003', 'assistant', 'Two scoping questions are ready below — they decide the picker rail contents and where route warnings live.', '13:01:00Z', rt({ workedSeconds: 8, totalElapsedSeconds: 40 })),
      msg('t16-m0004', 'assistant', 'Questionnaire submitted — Which providers must appear in the first picker rail? (2 of 2 questions answered.)', '13:06:10Z', rt({ workedSeconds: 0, totalElapsedSeconds: 0 }), {
        completedQuestionnaire: {
          id: 'q-16-rail', status: 'submitted', createdAt: T + '13:02:00Z', resolvedAt: T + '13:06:10Z', currentQuestionIndex: 1,
          questions: [
            { id: 'q1', prompt: 'Which providers must appear in the first picker rail?', kind: 'multi select', required: true, options: ['Anthropic', 'OpenAI', 'Google', 'xAI', 'Ollama (local)'], selected: ['Anthropic', 'OpenAI', 'Google', 'Ollama (local)'] },
            { id: 'q2', prompt: 'Should unavailable routes stay visible?', kind: 'single select', required: true, options: ['Visible with reason', 'Hidden'], selected: ['Visible with reason'] }
          ]
        }
      }),
      msg('t16-m0005', 'assistant', 'Goal started: "Redesign the Provider Settings manager". Route is frozen for the Goal — retarget it explicitly if the model or access profile changes.', '13:07:00Z', rt({ workedSeconds: 4, totalElapsedSeconds: 300 })),
      msg('t16-m0006', 'assistant', 'Created 8 Todos under the Goal, from route mapping through the migration note. Progress now tracks in the work surfaces.', '13:07:20Z', rt({ workedSeconds: 6, totalElapsedSeconds: 320 })),
      msg('t16-m0007', 'assistant', 'Retrieved the relevant sources: Multi-Account.md, Models_System.md, CLI_Bridged_Providers.md, the current Settings manager, and two prior chat threads about route pickers.', '13:09:00Z', rt({ workedSeconds: 44, totalElapsedSeconds: 420 })),
      msg('t16-m0008', 'assistant', 'Grouped research pass complete.', '13:14:00Z', rt({ workedSeconds: 214, totalElapsedSeconds: 700, tokenCount: 18200 }), {
        activityGroup: {
          id: 'activity-16-research', status: 'complete', workedSeconds: 214, compactLabel: '4 stages completed',
          stages: [
            { kind: 'exploration', label: 'Read project sources', count: 14, durationSeconds: 96, status: 'complete', summary: 'Read Multi-Account, Models System, CLI provider docs, and the current settings manager.' },
            { kind: 'search', label: 'Searched repository', count: 6, durationSeconds: 38, status: 'complete', summary: 'Searched for route, account, and connection vocabulary across Plans and Concepts.' },
            { kind: 'web', label: 'Checked provider docs', count: 3, durationSeconds: 52, status: 'complete', summary: 'Confirmed capability claims against current provider documentation.' },
            { kind: 'browser', label: 'Browser Program inspection', count: 1, durationSeconds: 28, status: 'complete', summary: 'Captured the existing Provider Settings page structure and spacing.' }
          ]
        }
      }),
      msg('t16-m0009', 'assistant', 'Port 3000 is used by the checkout redesign in worktree wt-checkout. I will use 3001 for the verification server instead — the conflict and owner are listed in the Ops surface.', '13:15:00Z', rt({ workedSeconds: 6, totalElapsedSeconds: 760 })),
      msg('t16-m0010', 'assistant', 'Spawned four research children on different routes. Two run now; Gemini is queued for sustainable capacity; the local scout is blocked because the Ollama CLI is not installed.', '13:16:00Z', rt({ workedSeconds: 10, totalElapsedSeconds: 820 })),
      msg('t16-m0011', 'assistant', 'OpenAI route research is complete; the Gemini child is still queued behind the provider allowance reserve. Partial matrix is attached to the Goal evidence.', '13:24:00Z', rt({ workedSeconds: 30, totalElapsedSeconds: 1300 })),
      msg('t16-m0012', 'assistant', 'Picker implementation is in. Three files changed: the manager surface, the route model, and a new migration note — +349 / -108 across the diff.', '13:40:00Z', rt({ workedSeconds: 402, totalElapsedSeconds: 2260, tokenCount: 30800 })),
      msg('t16-m0013', 'assistant', 'Ran a Browser Program verification pass over the new picker: rail filter, favorites, and the effort submenu all hold at 520 and 1200 widths. Three captures attached.', '13:55:00Z', rt({ workedSeconds: 96, totalElapsedSeconds: 2400 })),
      msg('t16-m0014', 'assistant', '', '13:56:00Z', rt({ workedSeconds: 2, totalElapsedSeconds: 2460 }), {
        approvalCard: {
          id: 'ap-16-1',
          title: 'Run 2 commands?',
          scope: 'Workspace only',
          reason: 'Needed to run the settings test suite',
          commands: ['npm run test -- settings-providers', 'npm run build'],
          files: ['Concepts/settings/**'],
          servers: [], domains: [],
          persistence: 'Allow once applies to this run only',
          saferAlternative: 'Run the read-only static checks instead',
          receipts: ['Node v22.18.0', '2 test files, 41 assertions'],
          decision: null
        }
      }),
      msg('t16-m0015', 'assistant', '', '13:57:00Z', rt({ workedSeconds: 1, totalElapsedSeconds: 2520 }), {
        routeWarningCard: {
          id: 'rw-16-1', kind: 'route-switch',
          headline: 'Switch to Gemini 3 Pro?',
          primary: 'This restarts the prompt cache — earlier context is re-sent to a new provider.',
          fromLabel: 'Anthropic · Work · Claude Sonnet 4.5',
          toLabel: 'Google · Personal · Gemini 3 Pro',
          consequences: [
            { kind: 'cache', text: 'Prompt cache restarts; earlier context is re-sent.' },
            { kind: 'privacy', text: 'Hosting, terms, and data location change with the provider.' },
            { kind: 'cost', text: 'Usage bills to a different account and plan.' },
            { kind: 'context', text: 'Context window changes from 200k to 1M tokens.' }
          ],
          choices: ['continue', 'branch', 'new', 'cancel'],
          status: 'open'
        }
      }),
      msg('t16-m0016', 'assistant', 'Four artifacts are ready: the picker source, the 3-file diff, a test screenshot, and the verification report.', '14:00:00Z', rt({ workedSeconds: 12, totalElapsedSeconds: 2560 })),
      msg('t16-m0017', 'assistant', '', '14:00:10Z', rt({ workedSeconds: 0, totalElapsedSeconds: 2560 }), {
        marker: { kind: 'artifact-left', artifactId: 'art-16-code', title: 'ProviderSettings.tsx' }
      }),
      msg('t16-m0018', 'assistant', 'Provider Settings redesign verified. All 41 assertions pass; the picker, warnings, and setup states render at every supported width. Worked 31m 14s across 43m 30s elapsed (the turn waited on questionnaire answers and the capacity queue).', '14:01:00Z', rt({ workedSeconds: 1874, totalElapsedSeconds: 2610, tokenCount: 52400 }), {
        activityGroup: {
          id: 'activity-16-final', status: 'complete', workedSeconds: 1874, compactLabel: 'Verification complete',
          stages: [
            { kind: 'completion', label: 'Verified provider settings redesign', durationSeconds: 96, status: 'complete', summary: '41 assertions passed; captures attached to the report artifact.' }
          ]
        }
      }),
      msg('t16-m0019', 'assistant', 'Drafting the rollout checklist for the remaining providers — first the OpenAI key connection, then the Google sign-in, then…', '14:05:00Z', rt({ workedSeconds: 18, totalElapsedSeconds: 18 }), {
        redirectMarker: { state: 'interrupted', note: 'Interrupted — redirected by you' }
      }),
      msg('t16-m0020', 'user', 'Hold on — skip the rollout checklist. Compare the two Anthropic accounts first; I need the work/personal split documented.', '14:05:40Z', rt({ workedSeconds: 0, totalElapsedSeconds: 0, tokenCount: 0 }), {
        redirectMarker: { state: 'redirected', note: 'Redirected the active turn' }
      }),
      msg('t16-m0021', 'assistant', 'Resumed with the new instruction. Work vs Personal on Anthropic: same models, separate connections — Work uses the API key connection, Personal signs in through the Claude CLI. Billing, allowance, and cache never mix across the two routes.', '14:06:30Z', rt({ workedSeconds: 26, totalElapsedSeconds: 68 }), {
        redirectMarker: { state: 'resumed', note: 'Resumed with redirected instruction' }
      }),
      msg('t16-m0022', 'assistant', '', '14:08:00Z', rt({ workedSeconds: 2, totalElapsedSeconds: 120 }), {
        branchCard: {
          id: 'br-16-1', kind: 'branch',
          title: 'Provider settings — Gemini comparison',
          sourceThreadId: 'thread-16', sourceTitle: 'Provider settings redesign — live',
          atMessageId: 't16-m0015',
          lineageNote: 'Branched before the route switch; attachments and citations preserved.'
        }
      })
    ]
  };

  // --- thread-17: attachment + cross-project ----------------------------------
  var thread17 = {
    id: 'thread-17',
    title: 'Video attachment route decision',
    project: 'Puppet Master',
    pinned: false,
    archived: false,
    threadState: 'blocked',
    updatedAt: T + '12:40:00Z',
    initialVisibleMessageCount: 50,
    scriptedReplyCursor: 0,
    scriptedReplyIds: ['reply-04'],
    tags: ['attachments'],
    activeGoal: null,
    todo: null,
    subagentGroups: [],
    diffGroups: [],
    questionnaires: [],
    artifacts: [],
    browserSessions: [],
    threadRequests: [],
    messages: [
      msg('t17-m0001', 'user', 'I attached demo.mov (the 48 MB walkthrough). Pull the three claims it makes about route pickers and check them against the Plans.', '11:50:00Z', rt({ workedSeconds: 0, totalElapsedSeconds: 0, tokenCount: 0 })),
      msg('t17-m0002', 'assistant', '', '11:50:05Z', rt({ workedSeconds: 1, totalElapsedSeconds: 1 }), {
        attachmentCard: {
          id: 'att-17-1',
          file: { name: 'demo.mov', kind: 'video', size: '48 MB' },
          state: 'consent',
          reason: 'This model cannot read video.',
          options: ['cancel', 'extract', 'alternate'],
          alternateRoute: 'google/personal/gemini-3-pro',
          alternateLabel: 'Use Gemini',
          derived: [], lineage: []
        }
      }),
      msg('t17-m0003', 'user', 'Extract in PM — keep it on this route.', '11:50:40Z', rt({ workedSeconds: 0, totalElapsedSeconds: 0, tokenCount: 0 })),
      msg('t17-m0004', 'assistant', '', '11:51:00Z', rt({ workedSeconds: 12, totalElapsedSeconds: 20 }), {
        attachmentCard: {
          id: 'att-17-1',
          file: { name: 'demo.mov', kind: 'video', size: '48 MB' },
          state: 'resolved-transform',
          reason: 'Video transformed in PM.',
          options: [],
          derived: [
            { kind: 'transcript', label: 'Transcript (2:14)' },
            { kind: 'frames', label: '6 selected frames' }
          ],
          lineage: ['demo.mov']
        }
      }),
      msg('t17-m0005', 'assistant', 'From the transcript and frames: the walkthrough claims (1) route pickers must show the active account, (2) cache restarts must warn before switching, (3) local models need an install state. Claims 1 and 2 match Multi-Account and the packet; claim 3 matches the provider-CLI adjudication (explicit, official-source install).', '11:54:00Z', rt({ workedSeconds: 88, totalElapsedSeconds: 180 })),
      msg('t17-m0006', 'assistant', '', '11:55:00Z', rt({ workedSeconds: 1, totalElapsedSeconds: 240 }), {
        routeWarningCard: {
          id: 'rw-17-1', kind: 'attachment-reevaluate',
          headline: 'Re-check retained attachments?',
          primary: 'Switching models changes what the retained demo.mov extract can use.',
          fromLabel: 'Anthropic · Work · Claude Sonnet 4.5',
          toLabel: 'OpenAI · Work · GPT-5.2',
          consequences: [
            { kind: 'attachment', text: 'Retained video extract stays usable; a new native read would need the alternate route.' },
            { kind: 'cache', text: 'Prompt cache restarts on the new provider.' }
          ],
          choices: ['continue', 'branch', 'new', 'cancel'],
          status: 'open'
        }
      }),
      msg('t17-m0007', 'user', 'The checklist lives in Project A (Tastebook), but the fix lands in Project B (Checkout redesign). Set that up.', '12:10:00Z', rt({ workedSeconds: 0, totalElapsedSeconds: 0, tokenCount: 0 })),
      msg('t17-m0008', 'assistant', '', '12:10:05Z', rt({ workedSeconds: 1, totalElapsedSeconds: 1 }), {
        crossProjectCard: {
          id: 'xp-17-1',
          readProject: 'Project A — Tastebook',
          writeProject: 'Project B — Checkout redesign',
          state: 'open'
        }
      }),
      msg('t17-m0009', 'assistant', 'Cross-project work is denied by default. The grant above stays one-time unless you allow it for this Goal; read and write are listed separately.', '12:10:20Z', rt({ workedSeconds: 2, totalElapsedSeconds: 15 })),
      msg('t17-m0010', 'assistant', '', '12:12:00Z', rt({ workedSeconds: 0, totalElapsedSeconds: 0 }), {
        bsdAdviceCard: {
          id: 'bsd-17-1',
          summary: 'BSD advice: the demo.mov extract duplicates frames already attached to the diff — reuse the diff lineage instead of re-extracting.',
          detail: 'Frames 2 and 5 are byte-identical to the diff captures. Reusing them keeps one lineage chain.',
          state: 'available'
        }
      }),
      msg('t17-m0011', 'assistant', '', '12:12:30Z', rt({ workedSeconds: 0, totalElapsedSeconds: 0 }), {
        bsdResult: { kind: 'silent', summary: 'BSD checked the follow-up plan — no advice.' }
      })
    ]
  };

  // --- thread-18: offline/reconnect + typed thread ops ------------------------
  var thread18 = {
    id: 'thread-18',
    title: 'Home Server reconnect',
    project: 'Puppet Master',
    pinned: false,
    archived: false,
    threadState: 'idle',
    updatedAt: T + '10:20:00Z',
    initialVisibleMessageCount: 50,
    scriptedReplyCursor: 0,
    scriptedReplyIds: ['reply-05'],
    tags: ['sync'],
    activeGoal: {
      id: 'goal-18-reconnect-copy',
      title: 'Reconnect copy pass',
      objective: 'Merge the reconnect and queue copy updates across the chat surfaces.',
      status: 'paused',
      workedSeconds: 320,
      totalElapsedSeconds: 900,
      canEdit: true, canPause: false, canResume: true, canStop: true, canClear: true,
      expanded: false,
      progress: { done: 2, total: 5 }
    },
    todo: null,
    subagentGroups: [],
    diffGroups: [],
    questionnaires: [],
    artifacts: [],
    browserSessions: [],
    threadRequests: [{
      id: 'tr-18-1',
      sourceThread: 'thread-18',
      targetThread: 'thread-09',
      sender: 'Assistant (Kimi K3)',
      boundedTask: 'Summarize the scrollback pacing findings from messages 40-90',
      evidenceRefs: ['thread-09:t09-m0041', 'thread-09:t09-m0063'],
      scope: 'read-only, bounded range',
      budget: '1 response, 400 words max',
      createdAt: T + '10:02:00Z',
      status: 'answered',
      respondedAt: T + '10:04:30Z',
      resultRefs: ['thread-09:summary-scrollback-01']
    }],
    spawnedThreads: [{
      id: 'thread-18-child-01',
      title: 'Scrollback pacing — child research',
      kind: 'child',
      sourceMessageId: 't18-m0004',
      createdAt: T + '10:05:00Z',
      status: 'complete'
    }],
    restorePoints: [{
      id: 'rp-18-1', label: 'Before reconnect copy merge', at: T + '10:10:00Z', messageCount: 7
    }],
    messages: [
      msg('t18-m0001', 'user', 'Home Server dropped mid-review — queue this: merge the reconnect copy pass when you are back.', '09:55:00Z', rt({ workedSeconds: 0, totalElapsedSeconds: 0, tokenCount: 0 }), { opId: 'thread-18-1' }),
      msg('t18-m0002', 'assistant', '', '09:58:10Z', rt({ workedSeconds: 0, totalElapsedSeconds: 0 }), {
        receiptCard: {
          id: 'rc-18-1', kind: 'reconnect',
          title: 'Reconnected to Home TrueNAS',
          lines: [
            { label: 'Replayed', value: '1 queued message — applied once' },
            { label: 'Fence', value: 'thread-18-1 already applied — skipped on retry' },
            { label: 'Catch-up', value: 'Snapshot applied; 3 buffered events delivered' }
          ]
        }
      }),
      msg('t18-m0003', 'assistant', '', '09:58:20Z', rt({ workedSeconds: 0, totalElapsedSeconds: 0 }), {
        receiptCard: {
          id: 'rc-18-2', kind: 'server-continuation',
          title: 'Goal continued on the server while you were away',
          lines: [
            { label: 'Goal', value: 'Reconnect copy pass' },
            { label: 'Progress', value: '2 of 5 sections merged' },
            { label: 'Owner', value: 'Home TrueNAS (server-owned)' }
          ]
        }
      }),
      msg('t18-m0004', 'user', 'Ask the long-history thread for its scrollback pacing findings before we merge copy.', '10:01:40Z', rt({ workedSeconds: 0, totalElapsedSeconds: 0, tokenCount: 0 })),
      msg('t18-m0005', 'assistant', '', '10:02:00Z', rt({ workedSeconds: 2, totalElapsedSeconds: 4 }), {
        threadRequestCard: { id: 'trc-18-1', requestId: 'tr-18-1' }
      }),
      msg('t18-m0006', 'assistant', 'Request answered by thread-09. Result ref thread-09:summary-scrollback-01: keep 50-message pages, rehydrate on jump, never unload the composer. Only the selected excerpts entered this thread — no transcript copy.', '10:04:40Z', rt({ workedSeconds: 4, totalElapsedSeconds: 160 })),
      msg('t18-m0007', 'assistant', '', '10:05:10Z', rt({ workedSeconds: 2, totalElapsedSeconds: 170 }), {
        branchCard: {
          id: 'br-18-1', kind: 'spawn',
          title: 'Scrollback pacing — child research',
          sourceThreadId: 'thread-18', sourceTitle: 'Home Server reconnect',
          atMessageId: 't18-m0004',
          lineageNote: 'Spawned child thread with the two selected evidence refs only.'
        }
      }),
      msg('t18-m0008', 'assistant', '', '10:10:00Z', rt({ workedSeconds: 1, totalElapsedSeconds: 480 }), {
        restorePointCard: { id: 'rp-18-1', label: 'Before reconnect copy merge', at: T + '10:10:00Z', messageCount: 7 }
      }),
      msg('t18-m0009', 'user', 'Actually, rewind to before the merge. I want the queue copy separated first.', '10:15:00Z', rt({ workedSeconds: 0, totalElapsedSeconds: 0, tokenCount: 0 })),
      msg('t18-m0010', 'assistant', 'Rewound 2 messages into a collapsed region — nothing was deleted. Restore point "Before reconnect copy merge" can bring them back.', '10:15:20Z', rt({ workedSeconds: 3, totalElapsedSeconds: 500 }), {
        rewoundMarker: { kind: 'rewound', count: 2, restorePointId: 'rp-18-1' }
      })
    ]
  };

  // --- thread-19: crew + capacity ----------------------------------------------
  var thread19 = {
    id: 'thread-19',
    title: 'Crew review — provider matrix',
    project: 'Puppet Master',
    pinned: false,
    archived: false,
    threadState: 'running',
    updatedAt: T + '15:05:00Z',
    initialVisibleMessageCount: 50,
    scriptedReplyCursor: 0,
    scriptedReplyIds: ['reply-06'],
    tags: ['crew'],
    activeGoal: null,
    todo: null,
    subagentGroups: [],
    diffGroups: [],
    questionnaires: [],
    artifacts: [],
    browserSessions: [],
    threadRequests: [],
    crew: {
      templateId: 'crew-provider-matrix',
      templateLabel: 'Provider matrix review',
      members: [
        { role: 'Researcher', route: 'anthropic/work/claude-sonnet-4.5', status: 'complete', workedSeconds: 240 },
        { role: 'Implementer', route: 'openai/work/gpt-5.2', status: 'complete', workedSeconds: 310 },
        { role: 'Verifier', route: 'google/personal/gemini-3-pro', status: 'queued', workedSeconds: 0 },
        { role: 'Reviewer', route: 'xai/work/grok-4.5', status: 'queued', workedSeconds: 0 }
      ],
      waves: { concurrent: 2, queued: 2, total: 3 }
    },
    capacityForecast: {
      requested: 6,
      recommended: 2,
      waves: 3,
      reason: 'provider allowance and verification reserve'
    },
    messages: [
      msg('t19-m0001', 'user', 'Run a crew review of the provider matrix. Four roles, and keep two lanes free for the verification reserve.', '14:40:00Z', rt({ workedSeconds: 0, totalElapsedSeconds: 0, tokenCount: 0 })),
      msg('t19-m0002', 'assistant', 'Crew started from the "Provider matrix review" template: Researcher and Implementer run now; Verifier and Reviewer queue as wave two. Crew selection is local to this thread.', '14:40:20Z', rt({ workedSeconds: 6, totalElapsedSeconds: 20 })),
      msg('t19-m0003', 'assistant', 'Shared board activity so far.', '14:52:00Z', rt({ workedSeconds: 320, totalElapsedSeconds: 700 }), {
        activityGroup: {
          id: 'activity-19-board', status: 'complete', workedSeconds: 320, compactLabel: '3 stages completed',
          stages: [
            { kind: 'exploration', label: 'Researcher — matrix sources', count: 11, durationSeconds: 150, status: 'complete', summary: 'Read provider docs and account isolation notes on the Anthropic route.' },
            { kind: 'edit', label: 'Implementer — matrix table', count: 2, durationSeconds: 120, status: 'complete', summary: 'Drafted the capability matrix on the OpenAI route.' },
            { kind: 'search', label: 'Cross-checks', count: 4, durationSeconds: 50, status: 'complete', summary: 'Searched for conflicting capability claims.' }
          ]
        }
      }),
      msg('t19-m0004', 'assistant', 'Researcher result (Anthropic · Work · Sonnet 4.5): account isolation holds; the same model under two accounts is two distinct routes with separate caches.', '14:55:00Z', rt({ workedSeconds: 20, totalElapsedSeconds: 900 })),
      msg('t19-m0005', 'assistant', 'Implementer result (OpenAI · Work · GPT-5.2): matrix table drafted with effort/Fast capability columns; two claims flagged for the Verifier wave.', '14:58:00Z', rt({ workedSeconds: 18, totalElapsedSeconds: 1080 })),
      msg('t19-m0006', 'assistant', 'Parent synthesis: the matrix is consistent except Fast availability, which the Verifier will settle next wave. Requested 6 specialists; the forecast recommends 2 concurrent across 3 waves — provider allowance and verification reserve. This is a forecast, not a guarantee.', '15:00:00Z', rt({ workedSeconds: 24, totalElapsedSeconds: 1200 })),
      msg('t19-m0007', 'assistant', '', '15:01:00Z', rt({ workedSeconds: 0, totalElapsedSeconds: 1260 }), {
        bsdResult: { kind: 'duplicate', summary: 'BSD suppressed a duplicate matrix row suggestion.' }
      }),
      msg('t19-m0008', 'user', 'Good. Keep the queued wave order as is.', '15:03:00Z', rt({ workedSeconds: 0, totalElapsedSeconds: 0, tokenCount: 0 })),
      msg('t19-m0009', 'assistant', 'Wave order preserved: Verifier, then Reviewer. Independent results stay attributed to their own routes; the parent only reduces.', '15:05:00Z', rt({ workedSeconds: 4, totalElapsedSeconds: 1380 }))
    ]
  };

  window.K3_DEMO_PACKET = {
    messagePatches: [],
    messageInserts: [],
    threadAppends: [thread16, thread17, thread18, thread19],
    catalogs: {
      providers: providers,
      worktrees: [
        { id: 'wt-checkout', label: 'checkout redesign', state: 'conflict-detected', owner: 'thread-10', portLease: 3000, detail: 'Merge conflict in the checkout flow; patch staged' },
        { id: 'wt-docs', label: 'docs refresh', state: 'isolated-clean', owner: 'thread-13', portLease: null, detail: 'Isolated and clean' },
        { id: 'wt-legacy', label: 'legacy import', state: 'patch-preserved', owner: 'thread-07', portLease: null, cleanup: 'pending', detail: 'Patch preserved after a failed merge; cleanup pending' },
        { id: 'wt-media', label: 'media pipeline', state: 'waiting-for-writer', owner: 'thread-19', portLease: null, detail: 'Waiting for the Verifier wave to write' }
      ],
      portLeases: [
        { port: 3000, state: 'leased', owner: 'wt-checkout', ownerLabel: 'checkout redesign', threadId: 'thread-10' },
        { port: 3001, state: 'free', owner: null, ownerLabel: null, threadId: null }
      ],
      crewTemplates: [
        { id: 'crew-provider-matrix', label: 'Provider matrix review', roles: ['Researcher', 'Implementer', 'Verifier', 'Reviewer'], reserveReason: 'Keeps provider allowance and the verification reserve available' }
      ],
      syncProfile: {
        homeServer: 'Home TrueNAS',
        executionHost: 'This Windows computer',
        environment: 'Windows 11 Pro',
        transport: 'LAN'
      },
      domainNotes: [
        { id: 'dn-search', name: 'Search index', state: 'failed', note: 'sync failed · retry', at: T + '14:02:00Z' }
      ]
    },
    storeSeeds: {
      bsdState: {
        'thread-16': { mode: 'auto', scope: 'thread', autoActive: false, lastResult: { kind: 'advice', summary: 'Two Anthropic accounts expose the same model with separate caches and billing.', at: T + '13:50:00Z' } },
        'thread-19': { mode: 'on', scope: 'thread', autoActive: false, lastResult: { kind: 'duplicate', summary: 'Duplicate matrix row suggestion suppressed.', at: T + '15:01:00Z' } }
      }
    }
  };
})();
