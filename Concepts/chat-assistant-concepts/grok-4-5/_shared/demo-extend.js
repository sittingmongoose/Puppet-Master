/* Grok 4.5 — additive demo enrichment (disclosed corpus pass).
   Does not replace demoData.json; mutates a clone after load.
   SPEC_GAPS: provisional demo fixtures for thoughts/activity/collapse/markdown. */
(function () {
  'use strict';

  function byId(threads, id) {
    for (var i = 0; i < threads.length; i++) {
      if (threads[i] && threads[i].id === id) return threads[i];
    }
    return null;
  }

  function msg(thread, id) {
    var list = (thread && thread.messages) || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === id) return list[i];
    }
    return null;
  }

  function assistantMsgs(thread) {
    return ((thread && thread.messages) || []).filter(function (m) {
      return m && m.role === 'assistant';
    });
  }

  function stampSpread(thread, baseHour) {
    var list = (thread && thread.messages) || [];
    var h = baseHour == null ? 9 : baseHour;
    list.forEach(function (m, i) {
      if (!m) return;
      var mins = (i * 7) % 60;
      var hour = h + Math.floor(i / 8);
      var day = '2026-07-28';
      m.sentAt =
        day +
        'T' +
        String(hour).padStart(2, '0') +
        ':' +
        String(mins).padStart(2, '0') +
        ':00.000Z';
      if (m.runtime && typeof m.runtime === 'object') {
        if (m.runtime.workedSeconds == null) m.runtime.workedSeconds = 8 + (i % 40);
        if (m.runtime.totalElapsedSeconds == null) {
          m.runtime.totalElapsedSeconds = (m.runtime.workedSeconds || 0) + 4 + (i % 12);
        }
      }
    });
  }

  var MD_SAMPLE =
    'Here is a concrete sketch you can keep iterating.\n\n' +
    '**Import ranking** for first release:\n\n' +
    '- Recipe websites (structured scrape)\n' +
    '- Plain text paste\n' +
    '- Photos (OCR later)\n\n' +
    'Keep the mapper honest about drift in `recipe_mapper.rs`:\n\n' +
    '```rust\npub fn map_import(src: &ImportSource) -> Result<RecipeDraft, MapError> {\n' +
    '    match src.kind {\n' +
    '        ImportKind::Web => map_web(src),\n' +
    '        ImportKind::Text => map_text(src),\n' +
    '        _ => Err(MapError::Unsupported),\n' +
    '    }\n' +
    '}\n```\n\n' +
    'Next: confirm whether photos block launch or ship as a soft path.';

  var LONG_PROSE =
    'That changes the flow from setup-first to progressive collection. We can keep the ' +
    'first session useful with a single empty plan, one suggested next action, and a quiet ' +
    'import affordance that never blocks reading. When they later paste a recipe, we attach ' +
    'it to the same thread instead of opening a wizard that resets context.\n\n' +
    'I would also keep preference memory explicit: if they say they dislike cilantro, record ' +
    'it as a durable preference and surface a short confirmation chip — never silently rewrite ' +
    'ingredients. Edits stay visible in the transcript so the human can undo.\n\n' +
    'If you want, I can draft the first-session checklist as a Goal with three todos and a ' +
    'single subagent for importer probing.';

  function apply(data) {
    if (!data || !Array.isArray(data.threads)) return data;
    var threads = data.threads;

    // Collapse: long bodies should self-collapse without harness mutation
    threads.forEach(function (th) {
      (th.messages || []).forEach(function (m) {
        if (!m || m.role !== 'assistant') return;
        var len = (m.body && String(m.body).length) || 0;
        if (len >= 700) m.collapsedByDefault = true;
      });
    });

    var t01 = byId(threads, 'thread-01');
    if (t01) {
      stampSpread(t01, 14);
      var a = assistantMsgs(t01);
      if (a[0] && !(a[0].thoughtSegments && a[0].thoughtSegments.length)) {
        a[0].thoughtSegments = [
          { id: 'th-t01-1', title: 'Reading constraints', body: 'Prioritize progressive collection over setup-first.', durationSeconds: 4 },
          { id: 'th-t01-2', title: 'Import pressure', body: 'Web + text first; photos soft-path.', durationSeconds: 6 }
        ];
      }
      if (a[1]) {
        a[1].body = LONG_PROSE;
        a[1].activityGroup = {
          id: 'ag-t01-1',
          status: 'completed',
          title: 'Checked onboarding constraints',
          summary: '3 tools · import + retention',
          items: [
            { id: 'ag1', label: 'Read recipe planner notes', status: 'done' },
            { id: 'ag2', label: 'Compare setup-first vs progressive', status: 'done' },
            { id: 'ag3', label: 'Draft import ranking', status: 'done' }
          ]
        };
      }
      if (a[2]) {
        a[2].body = MD_SAMPLE;
      }
      if (!t01.activeGoal) {
        t01.activeGoal = {
          id: 'goal-t01',
          title: 'First-session tastebook plan',
          status: 'running',
          summary: 'Progressive collection without blocking import.',
          objective: 'Progressive collection without blocking import.',
          workedSeconds: 420,
          canPause: true,
          canResume: false,
          canStop: true,
          canClear: true,
          canEdit: true,
          expanded: true,
          tasks: [
            { id: 'gt1', label: 'Map import sources', state: 'complete' },
            { id: 'gt2', label: 'Draft preference chips', state: 'running' },
            { id: 'gt3', label: 'Review empty-plan first session', state: 'pending' }
          ],
          subgoals: [
            { id: 'sg1', title: 'Import recovery', status: 'running' },
            { id: 'sg2', title: 'Preference boundaries', status: 'pending' }
          ],
          evidence: [
            { id: 'ev1', summary: '3 recipe sites sampled' },
            { id: 'ev2', summary: 'Onboarding brief draft started' }
          ]
        };
      } else {
        var g = t01.activeGoal;
        if (!g.tasks) {
          g.tasks = [
            { id: 'gt1', label: 'Map import sources', state: 'complete' },
            { id: 'gt2', label: 'Draft preference chips', state: 'running' }
          ];
        }
        if (!g.subgoals) {
          g.subgoals = [{ id: 'sg1', title: 'Import recovery', status: 'running' }];
        }
        if (!g.evidence) {
          g.evidence = [{ id: 'ev1', summary: '3 recipe sites sampled' }];
        }
        if (g.canClear == null) g.canClear = true;
        if (g.canEdit == null) g.canEdit = true;
        if (!g.objective && g.summary) g.objective = g.summary;
      }
      t01.pinned = true;
      if (!t01.browserSessions || !t01.browserSessions.length) {
        t01.browserSessions = [
          {
            id: 'br-taste-1',
            title: 'Recipe import docs',
            url: 'https://example.com/import'
          },
          {
            id: 'br-taste-2',
            title: 'Preference chip patterns',
            url: 'https://example.com/chips'
          }
        ];
      }
      if (!t01.draftState) t01.draftState = {};
      if (!t01.draftState.attachments || !t01.draftState.attachments.length) {
        t01.draftState.attachments = [
          { id: 'att-seed', name: 'tastebook-notes.md', mime: 'text/markdown' }
        ];
      }
      if (!t01.draftState.revisionHistory || !t01.draftState.revisionHistory.length) {
        t01.draftState.revisionHistory = [
          {
            savedAt: new Date(Date.now() - 3600000).toISOString(),
            text: 'Earlier draft: rank import sources before preferences.',
            attachments: []
          },
          {
            savedAt: new Date(Date.now() - 600000).toISOString(),
            text: 'Current direction: progressive chips, no blocking import.',
            attachments: [{ id: 'att-seed', name: 'tastebook-notes.md' }]
          }
        ];
      }
      if (!t01.todo || !t01.todo.length) {
        t01.todo = [
          { id: 'td1', text: 'Rank import sources', status: 'done' },
          { id: 'td2', text: 'Define preference chip UX', status: 'open' },
          { id: 'td3', text: 'Sketch empty-plan first session', status: 'open' }
        ];
      }
    }

    var t02 = byId(threads, 'thread-02');
    if (t02) {
      stampSpread(t02, 10);
      var a2 = assistantMsgs(t02);
      if (a2[0]) {
        a2[0].thoughtSegments = [
          { id: 'th-t02-1', title: 'Goal runtime', body: 'Keep Pause/Resume reachable beside transcript.', durationSeconds: 3 }
        ];
      }
      if (a2[1]) a2[1].body = MD_SAMPLE;
      if (!t02.subagentGroups || !t02.subagentGroups.length) {
        t02.subagentGroups = [
          {
            id: 'sa-t02',
            title: 'Importer probe',
            status: 'completed',
            agents: [{ id: 'a1', name: 'web-fetch', status: 'done', detail: 'Sampled 3 recipe sites' }]
          }
        ];
      }
    }

    var t03 = byId(threads, 'thread-03');
    if (t03) {
      stampSpread(t03, 11);
      var m5 = msg(t03, 't03-m0005');
      if (m5) {
        if ((m5.body || '').length < 900) {
          m5.body =
            (m5.body || '') +
            '\n\n' +
            LONG_PROSE +
            '\n\n' +
            'Appendix — retention window discussion continues so collapse can exercise a real long turn.';
        }
        m5.collapsedByDefault = true;
      }
      var a3 = assistantMsgs(t03);
      if (a3[2]) {
        a3[2].activityGroup = {
          id: 'ag-t03',
          status: 'completed',
          title: 'Diff review',
          summary: '1 file',
          items: [{ id: 'd1', label: 'recipe_mapper.rs', status: 'done' }]
        };
      }
      if (!t03.diffGroups || !t03.diffGroups.length) {
        t03.diffGroups = [
          {
            id: 'diff-t03',
            title: 'mapper sketch',
            files: [{ path: 'src/recipe_mapper.rs', added: 24, removed: 3 }]
          }
        ];
      }
    }

    var t04 = byId(threads, 'thread-04');
    if (t04) {
      stampSpread(t04, 16);
      var a4 = assistantMsgs(t04);
      if (a4[0]) a4[0].body = MD_SAMPLE;
      if (!t04.artifacts || !t04.artifacts.length) {
        t04.artifacts = [
          { id: 'art-1', title: 'Onboarding brief', projectPath: 'docs/onboarding-brief.md' }
        ];
      }
    }

    // Spread surfaces onto more threads so subset states need less harness mutation
    ['thread-05', 'thread-06', 'thread-07', 'thread-08'].forEach(function (id, idx) {
      var th = byId(threads, id);
      if (!th) return;
      stampSpread(th, 8 + idx);
      var as = assistantMsgs(th);
      if (as[0] && (!as[0].thoughtSegments || !as[0].thoughtSegments.length)) {
        as[0].thoughtSegments = [
          { id: 'th-' + id, title: 'Scan', body: 'Keep the human conversation primary.', durationSeconds: 2 }
        ];
      }
      if (as[1] && (as[1].body || '').length < 280) {
        as[1].body = (as[1].body || '') + '\n\n' + '**Next check:** confirm narrow-width reading still holds with surfaces open.';
      }
      if (idx === 0 && !th.activeGoal) {
        th.activeGoal = {
          id: 'goal-' + id,
          title: 'Weekend project plan',
          status: 'paused',
          summary: 'Paused while imports settle.'
        };
      }
      if (idx === 1 && (!th.todo || !th.todo.length)) {
        th.todo = [
          { id: 't-' + id + '-1', text: 'Pin the reading measure', status: 'open' },
          { id: 't-' + id + '-2', text: 'Verify search jump', status: 'open' }
        ];
      }
    });

    // Long thread: ensure a few rich turns
    var t09 = byId(threads, 'thread-09');
    if (t09) {
      stampSpread(t09, 7);
      var a9 = assistantMsgs(t09);
      if (a9[3]) a9[3].body = MD_SAMPLE;
      if (a9[5]) {
        a9[5].body = LONG_PROSE;
        a9[5].collapsedByDefault = true;
      }
      if (a9[7] && (!a9[7].activityGroup)) {
        a9[7].activityGroup = {
          id: 'ag-t09',
          status: 'completed',
          title: 'Batch skim',
          summary: '4 tools',
          items: [
            { id: 'x1', label: 'Index messages', status: 'done' },
            { id: 'x2', label: 'Collapse long turns', status: 'done' }
          ]
        };
      }
    }

    /* V2 packet scenario enrichment — settings-provider-chat-redesign */
    var t01v = byId(threads, 'thread-01');
    if (t01v) {
      t01v.title = 'Settings redesign bakeoff';
      t01v.state = 'active';
      t01v.threadState = 'active';
      t01v.tags = (function () {
        var out = [];
        var seen = Object.create(null);
        (t01v.tags || []).concat(['goal', 'v2-scenario']).forEach(function (t) {
          if (!t || seen[t]) return;
          seen[t] = true;
          out.push(t);
        });
        return out;
      })();
      var v2Goal = {
        id: 'goal-provider-redesign',
        title: 'Redesign provider controls and Chat access flow',
        objective:
          'Audit the provider settings and Assistant Chat controls, improve multi-account routing and access warnings, preserve Slint portability, test every theme, and produce an implementation handoff without editing PMConcept7.',
        summary:
          'Audit → Research → Prototype → Implement → Verify → Handoff without touching PMConcept7.',
        status: 'running',
        phase: 'Implement',
        workedSeconds: 94,
        expanded: false,
        canPause: true,
        canResume: false,
        canStop: true,
        canClear: true,
        canEdit: true,
        tasks: [
          { id: 'gt-v2-1', label: 'Audit picker + routes', state: 'complete' },
          { id: 'gt-v2-2', label: 'Pin geometry + access profiles', state: 'running' },
          { id: 'gt-v2-3', label: 'Artifact workspace + handoff', state: 'pending' }
        ],
        subgoals: [
          { id: 'sg-v2-1', title: 'Provider rail + favorites', status: 'running' },
          { id: 'sg-v2-2', title: 'Cache / attachment warnings', status: 'pending' }
        ],
        evidence: [
          { id: 'ev-v2-1', summary: '4 widths verified for pin + question flow' },
          { id: 'ev-v2-2', summary: 'Interaction probes green under reduced motion' }
        ]
      };
      t01v.activeGoal = v2Goal;
      t01v.goal = v2Goal;
      var v2Todos = [
        { id: 'td1', text: 'Audit the current model and account picker', status: 'completed', done: true, state: 'done' },
        { id: 'td2', text: 'Map requested and effective provider routes', status: 'completed', done: true, state: 'done' },
        { id: 'td3', text: 'Design pinned-history geometry', status: 'completed', done: true, state: 'done' },
        { id: 'td4', text: 'Implement the four access profiles', status: 'open', state: 'open' },
        { id: 'td5', text: 'Add cache and attachment route warnings', status: 'blocked', state: 'blocked' },
        { id: 'td6', text: 'Add the left artifact workspace', status: 'open', state: 'open' },
        { id: 'td7', text: 'Run theme, width, keyboard, and reduced-motion tests', status: 'open', state: 'open' },
        { id: 'td8', text: 'Write the implementation-impact handoff', status: 'open', state: 'open' }
      ];
      t01v.todo = v2Todos;
      t01v.todos = { id: 'Todo', items: v2Todos };
      t01v.subagentGroups = [
        {
          id: 'sag-v2',
          label: 'Specialists',
          state: 'running',
          counts: { working: 1, complete: 1, waiting: 1 },
          agents: [
            { id: 'sa-1', name: 'Interface systems auditor', route: 'Fable', status: 'completed' },
            { id: 'sa-2', name: 'Provider adapter researcher', route: 'Kimi K3', status: 'running' },
            { id: 'sa-3', name: 'Slint and test reviewer', route: 'Qwen 3.8', status: 'queued' }
          ],
          children: [
            { name: 'Interface systems auditor', route: 'Fable', status: 'completed' },
            { name: 'Provider adapter researcher', route: 'Kimi K3', status: 'running' },
            { name: 'Slint and test reviewer', route: 'Qwen 3.8', status: 'queued' }
          ]
        }
      ];
      t01v.activity = [
        { kind: 'thinking_summary', summary: 'Thinking · route ownership stays in Settings; Chat only picks the live route' },
        { kind: 'thread_search', summary: 'Searched 6 related project threads' },
        { kind: 'file_read', summary: 'Read 7 plan and concept files' },
        { kind: 'web_research', summary: 'Compared 4 current provider and approval implementations' },
        { kind: 'browser_test', summary: 'Checked pinning and question flow at 4 widths' },
        { kind: 'edit', summary: 'Made 1 create and 3 edits', diff: '+184 -67' },
        { kind: 'verification', summary: 'Passed interaction and reduced-motion checks' }
      ];
      t01v.diffGroups = [
        {
          id: 'diff-v2',
          label: 'Assistant Chat change set',
          files: [
            { path: 'threads/provider-selector.js', added: 92, removed: 18, status: 'modified' },
            { path: 'threads/access-controls.css', added: 61, removed: 39, status: 'modified' },
            { path: 'verification/interaction-probes.mjs', added: 31, removed: 10, status: 'modified' }
          ]
        }
      ];
      t01v.artifacts = [
        { id: 'artifact-diff', title: 'Assistant Chat change set', type: 'multi_file_diff', kind: 'diff', projectPath: 'Concepts/chat-assistant-concepts/grok-4-5/' },
        { id: 'artifact-preview', title: 'Provider selector preview', type: 'visual_preview', kind: 'image' },
        { id: 'artifact-test', title: 'Interaction verification report', type: 'test_report', kind: 'report' },
        { id: 'artifact-handoff', title: 'Implementation impact handoff', type: 'document', kind: 'document' }
      ];
      /* Always append curated V2 beats once (idempotent via marker id). */
      t01v.messages = t01v.messages || [];
      var hasV2Beat = t01v.messages.some(function (m) {
        return m && m.id === 't01-v2-0';
      });
      if (!hasV2Beat) {
        var extras = [
          { role: 'user', body: 'Audit provider settings and Chat access controls. Preserve Slint portability. Do not edit PMConcept7.' },
          { role: 'assistant', body: 'Understood. I will clarify policy ownership, start a Goal across Audit→Handoff, and keep the Chat bar compact while work surfaces stay inspectable.' },
          { role: 'assistant', body: 'Questionnaire receipt · Settings owns provider policy; Chat chooses the current route · cache emphasis: Branch with the new model · artifacts required: diff, preview, test, handoff.' },
          { role: 'assistant', body: 'Goal started · Redesign provider controls and Chat access flow · phase Audit → Research.' },
          { role: 'assistant', body: 'Todos created (8). One item blocked on attachment route warning design; will reopen after the cache warning lands.' },
          { role: 'assistant', body: 'Thinking summary · Keep favorites and multi-account routes distinct even when the model id matches.\n\nSearched 6 related project threads · Read 7 plan and concept files · Compared 4 provider approval implementations.' },
          { role: 'assistant', body: 'Resource note · Port 4173 is occupied by the Usage concept visual-test server. Using 4174 for this bakeoff.' },
          { role: 'assistant', body: 'Spawned specialists · Interface systems auditor (Fable) completed · Provider adapter researcher (Kimi K3) running · Slint and test reviewer (Qwen 3.8) queued.' },
          { role: 'assistant', body: 'Diff update · threads/provider-selector.js +92/−18 · access-controls.css +61/−39 · interaction-probes.mjs +31/−10 · +184 −67 total.' },
          { role: 'assistant', body: 'Verification · Browser checks at four widths passed. Reduced-motion path stays readable. Left artifact workspace ready for diff, preview, test report, and handoff.' },
          { role: 'assistant', body: 'Approval needed · Full Access would open network for the vision alternate route. Recommend Allow once for frame extraction, then return to Ask for approval.' },
          { role: 'assistant', body: 'Updated the provider selector and access flow, preserved thread-local state, verified responsive pinning, and produced four inspectable artifacts.\n\nAll targeted interaction probes passed · Worked for 1m 34s.' },
          { role: 'user', body: 'Branch from the cache-warning decision and keep this thread as the source.' },
          { role: 'assistant', body: 'Branched · Compact Now left raw tool dumps out of the child thread; Goal and open Todos remain included. Source thread stays pinned.' }
        ];
        extras.forEach(function (ex, i) {
          t01v.messages.push({
            id: 't01-v2-' + i,
            role: ex.role,
            body: ex.body,
            createdAt: '2026-08-05T12:' + String(10 + i).padStart(2, '0') + ':00.000Z',
            sentAt: '2026-08-05T12:' + String(10 + i).padStart(2, '0') + ':00.000Z',
            eligibleForEdit: ex.role === 'user'
          });
        });
      }
    }

    /* History row state variety + credible previews across threads */
    var histStates = [
      ['thread-01', 'active', true, 'Settings redesign bakeoff'],
      ['thread-02', 'goal-running', false, 'Usage feature review'],
      ['thread-03', 'goal-paused', false, 'Planning Wizard audit'],
      ['thread-04', 'blocked-approval', false, 'PRD Builder source intake'],
      ['thread-05', 'subagents', false, 'Provider multi-account routing'],
      ['thread-06', 'completed', false, 'Claude CLI profile isolation'],
      ['thread-07', 'failed', false, 'Antigravity CLI headless update'],
      ['thread-08', 'archived', true, 'Free models catalog refresh'],
      ['thread-09', 'ordinary', false, 'Models.dev capability sync'],
      ['thread-10', 'branched', false, 'Context Lens motion study'],
      ['thread-11', 'waiting', false, 'Compact Now and branching'],
      ['thread-12', 'active', false, 'MCP July specification review'],
      ['thread-13', 'ordinary', false, 'Memory degradation audit'],
      ['thread-14', 'completed', false, 'Persona context-footprint audit'],
      ['thread-15', 'ordinary', false, 'Crew capacity planning'],
      ['thread-16', 'blocked-approval', false, 'Worktree collision recovery'],
      ['thread-17', 'completed', false, 'Slint 1.17.1 port notes'],
      ['thread-18', 'active', false, 'Assistant Chat visual testing']
    ];
    var previews = {
      'thread-02': 'Goal running · forecast reset paths and provider quota chips.',
      'thread-03': 'Goal paused · Wizard topic review waiting on your next decision.',
      'thread-04': 'Blocked · approval required before reading the PRD source pack.',
      'thread-05': 'Three specialists in flight · requested Crew exceeds remaining capacity.',
      'thread-06': 'Completed · profile isolation notes handed off.',
      'thread-07': 'Failed · headless update retry available after port collision.',
      'thread-08': 'Archived · catalog refresh kept for reference.',
      'thread-10': 'Branched from mute/focus motion study.',
      'thread-11': 'Waiting · Compact Now finished; confirm Included vs Left out.',
      'thread-12': 'MCP July spec deltas still need a Slint-safe reading.',
      'thread-13': 'Memory degradation: prefer explicit chips over silent rewrite.',
      'thread-14': 'Persona footprint audit closed with Subcompact receipts.',
      'thread-15': 'Crew capacity: run two at a time; reserve synthesis budget.',
      'thread-16': 'Blocked · worktree feature/chat already has a writer; switch or wait.',
      'thread-17': 'Completed · Slint 1.17.1 port notes handed to implementation.',
      'thread-18': 'Active · theme/width/reduced-motion visual matrix still running.'
    };
    /* Ensure ≥18 history rows exist even when demoData ships 15 threads. */
    histStates.forEach(function (row) {
      if (byId(threads, row[0])) return;
      threads.push({
        id: row[0],
        title: row[3],
        state: row[1],
        threadState: row[1],
        pinned: Boolean(row[2]),
        messages: []
      });
    });

    histStates.forEach(function (row) {
      var th = byId(threads, row[0]);
      if (!th) return;
      th.title = row[3];
      th.state = row[1];
      th.threadState = row[1];
      if (row[2]) th.pinned = true;
      if (row[1] === 'archived') th.archived = true;
      if (previews[row[0]] && (!th.messages || !th.messages.length)) {
        th.messages = [
          {
            id: row[0] + '-seed-u',
            role: 'user',
            body: previews[row[0]],
            createdAt: '2026-08-04T16:00:00.000Z'
          },
          {
            id: row[0] + '-seed-a',
            role: 'assistant',
            body: 'Noted. I will keep this thread honest about status · ' + row[1] + '.',
            createdAt: '2026-08-04T16:01:00.000Z'
          }
        ];
      } else if (previews[row[0]] && th.messages && th.messages[0] && row[0] !== 'thread-01') {
        /* Soft-stamp first assistant preview when present */
        var firstA = (th.messages || []).filter(function (m) {
          return m && m.role === 'assistant';
        })[0];
        if (firstA && String(firstA.body || '').length < 40) {
          firstA.body = previews[row[0]];
        }
      }
    });



    /* Step 8 fixtures: BSD Auto+On, offline queue sample, restore points, Browser Program activity. */
    var t01s8 = byId(threads, 'thread-01');
    if (t01s8) {
      t01s8.localState = t01s8.localState || {};
      t01s8.localState.bsd = t01s8.localState.bsd || {
        mode: 'auto',
        scope: 'thread',
        visual: 'auto-idle',
        adviceId: null
      };
      if (!t01s8.restorePoints || !t01s8.restorePoints.length) {
        var rpMsg = null;
        (t01s8.messages || []).some(function (m) {
          if (m && m.id === 't01-v2-3') {
            rpMsg = m;
            return true;
          }
          return false;
        });
        if (!rpMsg && t01s8.messages && t01s8.messages.length) rpMsg = t01s8.messages[0];
        if (rpMsg) {
          t01s8.restorePoints = [
            {
              id: 'rp-demo-goal-start',
              threadId: 'thread-01',
              messageId: rpMsg.id,
              label: 'After Goal start',
              createdAt: '2026-08-05T12:13:00.000Z',
              messageIndex: (t01s8.messages || []).indexOf(rpMsg)
            }
          ];
        }
      }
      t01s8.activity = t01s8.activity || [];
      var hasBp = t01s8.activity.some(function (a) {
        return a && /Browser Program/i.test(String(a.summary || a.kind || ''));
      });
      if (!hasBp) {
        t01s8.activity.push({
          kind: 'browser',
          summary: 'Browser Program · settings route capture in progress · Expert profile'
        });
      }
      /* Replace stale verification/ paths in demo diffs with report paths (ConceptHub forbids verification/). */
      (t01s8.diffGroups || []).forEach(function (g) {
        (g.files || []).forEach(function (f) {
          if (f && String(f.path || '').indexOf('verification/') !== -1) {
            f.path = 'interaction-test-report.json';
          }
        });
      });
      var hasOfflineBeat = (t01s8.messages || []).some(function (m) {
        return m && m.id === 't01-s8-offline';
      });
      if (!hasOfflineBeat) {
        t01s8.messages = t01s8.messages || [];
        t01s8.messages.push({
          id: 't01-s8-offline',
          role: 'user',
          body: 'Queue this while offline · reconnect must deliver exactly once.',
          createdAt: '2026-08-05T12:40:00.000Z',
          sentAt: '2026-08-05T12:40:00.000Z',
          runtime: { delivery: 'queued', outboxId: 'ob-demo-offline-1' },
          eligibleForEdit: true
        });
      }
    }

    data.sessionExtras = data.sessionExtras || {};
    data.sessionExtras.sync = data.sessionExtras.sync || {
      state: 'live',
      routeLabel: 'Home Server · This Windows computer',
      cursor: 0
    };
    data.sessionExtras.outbox = data.sessionExtras.outbox || [
      {
        id: 'ob-demo-offline-1',
        kind: 'send',
        payload: { threadId: 'thread-01', text: 'Queue this while offline · reconnect must deliver exactly once.' },
        status: 'acked',
        createdAt: '2026-08-05T12:40:00.000Z',
        ackedAt: '2026-08-05T12:41:00.000Z'
      }
    ];
    data.sessionExtras.bsdDemo = {
      auto: 'auto-idle → auto-active glow only while advising',
      on: 'manual On distinct non-glow treatment'
    };

    /* Step4–7 feature fixtures: capacity forecast, crew thread-local, compact-work compositions, notifications. */
    data.sessionExtras = data.sessionExtras || {};
    data.sessionExtras.capacityForecast =
      'Requested specialists: 6 · Recommended concurrent: 2 · 3 waves · Reason: provider allowance and verification reserve';
    data.sessionExtras.notifications = [
      {
        id: 'ntf-demo-1',
        title: 'Snapshot catch-up ready',
        body: 'Server work continuing · open title-bar inbox when convenient.',
        tone: 'info',
        read: false,
        createdAt: '2026-08-05T12:00:00.000Z'
      },
      {
        id: 'ntf-demo-2',
        title: 'Browser Program finished',
        body: 'Expert Browser Program captured the settings route.',
        tone: 'success',
        read: false,
        createdAt: '2026-08-05T12:05:00.000Z'
      }
    ];

    var compactWork = {
      'thread-01': 'pm-cw-folio',
      'thread-02': 'pm-cw-beats',
      'thread-03': 'pm-cw-shelves',
      'thread-04': 'pm-cw-yield',
      'thread-05': 'pm-cw-condenser',
      'thread-06': 'pm-cw-margin',
      'thread-07': 'pm-cw-focus',
      'thread-08': 'pm-cw-breath'
    };
    Object.keys(compactWork).forEach(function (tid) {
      var th = byId(threads, tid);
      if (!th) return;
      th.compactWorkComposition = compactWork[tid];
      th.localState = th.localState || {};
      if (th.localState.spellcheckEnabled == null) th.localState.spellcheckEnabled = true;
      if (!th.localState.crewId) th.localState.crewId = tid === 'thread-05' ? 'review-wave' : 'research-pair';
    });

    var t05 = byId(threads, 'thread-05');
    if (t05) {
      t05.capacityForecast =
        'Requested specialists: 6 · Recommended concurrent: 2 · 3 waves · Reason: provider allowance and verification reserve';
      t05.crew = {
        requested: 'review-wave',
        effective: 'research-pair',
        reason: 'Adaptive route · capacity prefers Research pair for this turn',
        threadLocal: true
      };
    }

    data.behaviorNotes =
      (data.behaviorNotes || '') +
      ' | Grok demo-extend: thoughts/activity/markdown/collapse/surfaces/goal-depth/browser/attach enrichment applied at load.' +
      ' | V2 scenario: settings-provider-chat-redesign fixtures on thread-01 + history row variety.' +
      ' | Step8: ≥18 history rows, BSD Auto/On samples, offline/outbox sample, restore point, Browser Program activity, notifications.';
    return data;
  }

  window.PMChatDemoExtend = { apply: apply };
})();
