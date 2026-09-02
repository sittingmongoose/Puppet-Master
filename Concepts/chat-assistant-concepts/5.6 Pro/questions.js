/* questions.js — feature module.  OWNER: Wave 4 — Decisions agent (item 15a: structurally distinct question/decision options)
 *
 * Load order (see build.py): data.js, motion.js, variants-*.js, then EVERY feature
 * module, then app.js.  Modules therefore run BEFORE the app boots, so anything
 * registered here is live on the very first render — no re-render, no flash.
 *
 * WHAT THIS FILE FIXES
 * --------------------
 * `state.variants[6]` ("Question & decision") offers nine named options.  The
 * first eight used to be pure cosmetics in `styles.css:242` — per-option
 * declaration counts of 0 · 2 · 2 · 3 · 1 · 2 · 1 · 5, with options 4
 * ("Step Sequence") and 6 ("Queue Stack") consisting of a single declaration
 * each.  `renderDecisionHost()` stamped `data-variant` on the host and then
 * rendered one identical `.decision-surface` for all of them.  Names that
 * promise a structure and deliver a corner radius are the same defect the
 * Activity Detail family had, one surface over.
 *
 * The nine options below are nine different DOM structures over ONE derived
 * model.  That matters because six decision types reach this slot — question,
 * question-preparing, question-submitting, plan (review and revise), permission
 * and conflict — so nine hand-written surfaces would have been fifty-four.
 *
 * WHAT IT ALSO REPAIRS, WHILE HERE
 *   1. `q.why` is per-question in the fixture; the stock surface printed ONE
 *      hardcoded sentence ("This answer changes host selection, fallback routing,
 *      and the resulting Plan artifact") under every question, including the ones
 *      it was false for.  Every rationale is now the fixture's own.
 *   2. The summary page read `state.questions[0..2].answer` by index and printed
 *      three hardcoded field names.  It now derives from whatever is answered.
 *   3. `D.questionFlows` (1 active, 2 queued, 1 completed) had no reader at all.
 *      The queue is now real: `qs-open-flow` opens a queued flow, keeping the
 *      draft answers of the one you left — which is what the fixture's own note
 *      claims happens.  Queue Stack peeks and Evidence Split queue rows ARE
 *      the queue; header chrome does not restate it.
 *   4. Plan evidence came from a hardcoded string.  It now comes from
 *      `artifacts[plan-query].payload` (decision, acceptance, revisions), and the
 *      permission surface names the real `operational.hosts`.
 *
 * The evidence PANE stays option 7's differentiator, deliberately: only take 7
 * emits `.decision-evidence` / `.qs-evidence`, and questions.css shows it only
 * under `[data-variant="7"]`.  That is the property the deleted unscoped
 * `@media` rule in styles.css:294 used to destroy at narrow widths.  Other takes
 * surface the same `model.evidence` inside their own structure (a `<dl>` field, a
 * step body, a mono record row, a disclosure) or not at all — which is the point
 * of having nine structures rather than one with nine skins.
 */
(function () {
  'use strict';
  var EXT = window.PM56_EXT;
  if (!EXT || !EXT.slot) return;

  var TAKES = 9;
  var TAKE_NAMES = ['Stable Card', 'Morphing Composer', 'Anchored Sheet', 'Side Inspector',
    'Step Sequence', 'Technical Decision', 'Queue Stack', 'Evidence Split', 'Ask Card'];
  var FILE_PATHS = ['src/analytics/queries.rs', 'src/analytics/schema.rs', 'src/analytics/index_hints.rs',
    'src/analytics/bench.rs', 'migrations/0043_tenant_created_index.sql', 'docs/query-performance.md'];
  var OTHER_PLACEHOLDER = 'Something else…';

  /* `D.labels` carries no host-state map (it has ten others). Declaring the three
     values locally is the honest option — the alternative is painting the raw
     enum, which is the defect the label sweep was opened for. Flagged for Wave 5:
     this belongs in data.js beside `worktreeState`. */
  /* Prefer the shared registry (D.labels.hostState); the local map is only a fallback so
     this module still renders if it is ever loaded against an older fixture. */
  var HOST_STATE = (window.PM56_DATA && window.PM56_DATA.labels && window.PM56_DATA.labels.hostState)
    || { online: 'Online', degraded: 'Degraded', offline: 'Offline' };

  /* ------------------------------------------------------------------ fixture */
  function flowsOf(ctx) {
    var f = ctx.D && ctx.D.questionFlows;
    return Array.isArray(f) ? f : [];
  }
  /* The active flow is DERIVED from the questions the app is holding, never from
     a module variable. globalReset() replaces `state` wholesale from DEFAULT
     (which re-clones D.questions, i.e. the deployment flow), so a cached id would
     survive a reset that the data did not. This cannot drift. */
  function activeFlow(ctx) {
    var qs = ctx.state.questions || [], all = flowsOf(ctx);
    var first = qs.length && qs[0] ? qs[0].id : null;
    for (var i = 0; i < all.length; i++) {
      var fq = all[i].questions || [];
      if (first && fq.length && fq[0].id === first) return all[i];
    }
    return all[0] || null;
  }
  function hasAnswer(q) {
    if (!q) return false;
    if (Array.isArray(q.attachments) && q.attachments.length) return true;
    if (String(q.other == null ? '' : q.other).trim()) return true;
    if (Array.isArray(q.answer)) return q.answer.length > 0;
    return String(q.answer == null ? '' : q.answer).trim().length > 0;
  }
  function answerText(q) {
    if (!hasAnswer(q)) return '';
    var parts = [];
    if (Array.isArray(q.answer) && q.answer.length) parts.push(q.answer.join(', '));
    else if (q.answer != null && String(q.answer).trim() && !Array.isArray(q.answer)) parts.push(String(q.answer));
    if (String(q.other || '').trim()) parts.push(String(q.other).trim());
    if (Array.isArray(q.attachments) && q.attachments.length) {
      parts.push(q.attachments.map(function (a) { return a.path || a.name; }).join(', '));
    }
    return parts.join(' · ');
  }
  function answeredCount(qs) {
    var n = 0;
    for (var i = 0; i < qs.length; i++) if (hasAnswer(qs[i])) n++;
    return n;
  }
  function shortLabel(q) {
    var p = String((q && q.prompt) || '').replace(/\s+/g, ' ').trim().replace(/[?.]+$/, '');
    return p.length > 54 ? p.slice(0, 53).replace(/[ ,;:]+$/, '') + '…' : p;
  }
  function clockOf(ctx, iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  function lbl(ctx, map, v) {
    var m = ctx.D && ctx.D.labels && ctx.D.labels[map];
    return (m && m[v]) || v;
  }
  /* Module state hangs off `state.qs`. DEFAULT does not carry it, so every reader
     tolerates undefined — that is the reset path, not a bug. */
  function qsState(ctx) {
    return ctx.state.qs || (ctx.state.qs = { fold: false, drafts: {}, mention: null, leaving: false, reelDir: 'next' });
  }
  function currentQuestion(ctx) {
    var qs = ctx.state.questions || [];
    var idx = Math.min(Math.max(ctx.state.questionIndex | 0, 0), Math.max(qs.length - 1, 0));
    return qs[idx] || null;
  }

  /* ------------------------------------------------------------- the queue */
  /* Every flow except the one on screen. The pill count and this list are the
     same array, so a count can never disagree with what is listed. */
  function queueOf(ctx, flow) {
    return flowsOf(ctx).filter(function (f) { return !flow || f.id !== flow.id; })
      .map(function (f) {
        var qs = f.questions || [];
        return {
          id: f.id, title: f.title, state: f.state,
          stateLabel: lbl(ctx, 'questionFlowState', f.state),
          note: f.note, threadId: f.threadId,
          total: qs.length, answered: answeredCount(qs),
          openedAt: clockOf(ctx, f.openedAt)
        };
      });
  }

  /* ================================================================== MODEL */
  function buildModel(ctx) {
    var d = ctx.state.decision;
    if (!d) return null;
    if (d.type === 'question') return questionModel(ctx);
    if (d.type === 'question-preparing') return waitModel(ctx, 'preparing');
    if (d.type === 'question-submitting') return waitModel(ctx, 'submitting');
    if (d.type === 'plan') return planModel(ctx);
    if (d.type === 'permission') return permissionModel(ctx);
    if (d.type === 'conflict') return conflictModel(ctx);
    return null; /* unknown type: decline, app.js renders its own fallback */
  }

  function questionModel(ctx) {
    var qs = ctx.state.questions || [];
    var last = Math.max(qs.length - 1, 0);
    var idx = Math.min(Math.max(ctx.state.questionIndex | 0, 0), last);
    var q = qs[idx] || { prompt: '', type: 'text', options: [] };
    var flow = activeFlow(ctx);
    var ans = answeredCount(qs);
    var queue = queueOf(ctx, flow);

    var input;
    if (q.type === 'choice' || q.type === 'multi') {
      input = {
        kind: q.type,
        action: q.type === 'choice' ? 'answer-choice' : 'answer-multi',
        options: (q.options || []).slice(0, 4).map(function (o) {
          return {
            value: o, label: o, hint: '',
            selected: q.type === 'choice' ? q.answer === o
              : (Array.isArray(q.answer) && q.answer.indexOf(o) >= 0)
          };
        })
      };
    } else if (q.type === 'text') {
      input = {
        kind: 'text', inputKey: 'question-other', value: String(q.other != null && q.other !== '' ? q.other : (q.answer || '')),
        placeholder: OTHER_PLACEHOLDER
      };
    } else {
      input = {
        kind: 'summary',
        rows: qs.filter(function (x) { return x !== q; }).map(function (x) {
          return { label: shortLabel(x), value: answerText(x) || 'Not answered', ok: hasAnswer(x) };
        })
      };
    }

    var evidence = [{ label: 'Why this matters', lines: [q.why || (flow && flow.note) || ''] }];
    var done = qs.filter(hasAnswer);
    evidence.push({
      label: 'Answers so far',
      lines: done.length ? done.map(function (x) { return shortLabel(x) + ' — ' + answerText(x); })
        : ['Nothing answered yet. Nothing is submitted until the summary page is seen.']
    });
    if (flow && flow.note) evidence.push({ label: 'About this flow', lines: [flow.note] });

    return {
      type: 'question',
      take: takeOf(ctx),
      key: 'q:' + (flow ? flow.id : 'none') + ':' + (q.id || idx),
      icon: 'todo',
      title: (flow && flow.title) || 'Questionnaire',
      subtitle: (flow && flow.note) || '',
      meta: [{ text: ans + '/' + qs.length + ' answered', tone: ans === qs.length ? 'ok' : '' }],
      prompt: q.prompt,
      required: !!q.required,
      note: q.why || '',
      input: input,
      evidence: evidence,
      steps: qs.map(function (x, i) {
        return {
          id: x.id || ('q' + i), index: i, label: shortLabel(x),
          state: i === idx ? 'current' : (hasAnswer(x) ? 'done' : (i < idx ? 'skipped' : 'todo')),
          detail: hasAnswer(x) ? answerText(x) : (i < idx ? 'Skipped — still answerable' : 'Not answered'),
          action: 'qs-goto-question', data: { index: String(i) }
        };
      }),
      stepsLabel: 'Questions',
      queue: queue,
      progress: { pct: qs.length ? Math.round(ans / qs.length * 100) : 0, label: ans + ' of ' + qs.length + ' answered' },
      actions: [
        { a: 'cancel-questionnaire', label: 'Cancel questionnaire', kind: 'text danger' },
        { a: 'skip-question', label: 'Skip', kind: 'text' },
        { a: 'prev-question', label: 'Back', kind: 'soft', icon: 'left', disabled: idx === 0 },
        idx === last
          ? { a: 'submit-questionnaire', label: 'Submit answers', kind: 'primary', icon: 'send', after: true }
          : { a: 'next-question', label: 'Next', kind: 'primary', icon: 'chevron', after: true }
      ],
      closable: true
    };
  }

  function waitModel(ctx, phase) {
    var flow = activeFlow(ctx);
    var preparing = phase === 'preparing';
    return {
      type: preparing ? 'preparing' : 'submitting',
      take: takeOf(ctx),
      key: 'wait:' + phase,
      icon: preparing ? 'sparkles' : 'send',
      title: preparing ? 'Preparing questions' : 'Submitting answers',
      subtitle: (flow && flow.title) || '',
      meta: [{ text: preparing ? 'Resolving' : 'Attaching', tone: 'wait' }],
      prompt: preparing
        ? 'Resolving what is already known so the assistant asks only material questions.'
        : 'Answers are being attached to the durable thread and planning context.',
      required: false,
      note: preparing
        ? 'Nothing is asked twice: a value already present in the thread is not re-asked.'
        : 'The flow stays readable after submission; answers are not discarded.',
      input: { kind: 'progress', pct: preparing ? 72 : 100, scan: preparing },
      evidence: [{
        label: preparing ? 'Being resolved' : 'Being attached',
        lines: flow ? [(flow.questions || []).length + ' questions in ' + flow.title, flow.note] : []
      }],
      steps: null,
      queue: queueOf(ctx, flow),
      progress: { pct: preparing ? 72 : 100, label: preparing ? 'Resolving known values' : 'Attaching answers' },
      actions: [],
      closable: preparing
    };
  }

  function planArtifact(ctx) {
    var arts = (ctx.D && ctx.D.artifacts) || [];
    for (var i = 0; i < arts.length; i++) if (arts[i].id === 'plan-query') return arts[i];
    return arts[0] || null;
  }
  function planModel(ctx) {
    var art = planArtifact(ctx) || {};
    var pay = art.payload || {};
    var revise = ctx.state.decision && ctx.state.decision.mode === 'revise';
    var rev = ctx.state.planRevision | 0;
    var revisions = pay.revisions || [];
    var current = revisions.filter(function (r) { return r.n === rev; })[0] || revisions[revisions.length - 1] || null;

    var evidence = [];
    if (pay.decision) evidence.push({ label: 'Decision', lines: [pay.decision] });
    if (pay.acceptance) evidence.push({ label: 'Acceptance criteria', lines: pay.acceptance.slice() });
    if (current) evidence.push({ label: 'Revision ' + current.n, lines: [current.note] });

    return {
      type: 'plan',
      take: takeOf(ctx),
      key: 'plan:' + (revise ? 'revise' : 'review') + ':' + rev,
      icon: 'document',
      title: revise ? 'Revise the Plan' : 'Plan ready for review',
      subtitle: art.summary || '',
      /* `DEFAULT.planRevision` is a literal 3 while `artifacts[plan-query].version`
         is 4 and the fixture ships four revisions. Two numbers for one quantity.
         Neither file is mine to change, so the surface STATES the disagreement
         instead of quietly picking a winner. */
      meta: [{ text: 'Revision ' + rev, tone: '' },
        { text: lbl(ctx, 'artifactStatus', art.status || 'ready'), tone: art.status === 'ready' ? 'ok' : '' }]
        .concat((art.version && art.version !== rev) ? [{ text: 'Artifact at v' + art.version, tone: 'wait' }] : []),
      prompt: art.title || 'Plan',
      required: false,
      /* The plan's one-line rationale is its DECISION statement, not its summary
         — the summary is already the subtitle, and a surface that prints the
         same sentence twice is stating one fact as two. */
      note: pay.decision || art.summary || '',
      input: revise
        ? { kind: 'text', inputKey: 'plan-feedback', value: (ctx.state.decision && ctx.state.decision.feedback) || '',
            placeholder: 'Describe what the next immutable Plan revision should change…' }
        : { kind: 'none' },
      evidence: evidence,
      /* A plan really does have a sequence, and it is not the questionnaire's:
         the immutable revision history the fixture already carries. */
      steps: revisions.map(function (r) {
        return {
          id: 'rev-' + r.n, index: r.n, label: 'Revision ' + r.n,
          state: r.n < rev ? 'done' : (r.n === rev ? 'current' : 'todo'),
          detail: r.note, action: 'open-artifact', data: { id: 'plan-query' }
        };
      }),
      stepsLabel: 'Revisions',
      queue: queueOf(ctx, activeFlow(ctx)),
      progress: null,
      actions: revise
        ? [{ a: 'cancel-plan', label: 'Cancel', kind: 'text' },
           { a: 'open-artifact', label: 'View full Plan', kind: 'soft', icon: 'eye', data: { id: 'plan-query' } },
           { a: 'submit-plan-revision', label: 'Create revision', kind: 'primary' }]
        : [{ a: 'cancel-plan', label: 'Cancel', kind: 'text' },
           { a: 'open-artifact', label: 'View full Plan', kind: 'soft', icon: 'eye', data: { id: 'plan-query' } },
           { a: 'revise-plan', label: 'Revise', kind: 'soft', icon: 'edit' },
           { a: 'approve-plan', label: 'Approve And Build', kind: 'primary' }],
      closable: true
    };
  }

  function permissionModel(ctx) {
    var hosts = (ctx.D && ctx.D.operational && ctx.D.operational.hosts) || [];
    var exec = hosts.filter(function (h) { return h.role === 'execution'; });
    return {
      type: 'permission',
      take: takeOf(ctx),
      key: 'perm:host',
      icon: 'lock',
      title: 'Permission required',
      subtitle: 'Execution host',
      meta: [{ text: 'Execution host', tone: 'need' }, { text: 'Once', tone: '' }],
      prompt: 'Reconnect to Windows execution host and resume browser control?',
      required: true,
      note: 'The prior host connection dropped during step 7. The checkpoint is intact; no command will be replayed twice.',
      input: { kind: 'none' },
      evidence: [
        { label: 'Command scope', lines: ['Reconnect host', 'Restore browser session', 'Continue from checkpoint', 'No schema mutation'] },
        { label: 'Execution hosts', lines: exec.map(function (h) {
            return h.label + ' — ' + (HOST_STATE[h.state] || h.state) + (h.detail ? ' · ' + h.detail : '');
          }) }
      ],
      steps: [
        { id: 'p-scope', index: 0, label: 'Scope', state: 'done', detail: 'Reconnect host · restore browser session · continue from checkpoint' },
        { id: 'p-risk', index: 1, label: 'Blast radius', state: 'done', detail: 'No schema mutation. Nothing already executed is replayed.' },
        { id: 'p-decide', index: 2, label: 'Your decision', state: 'current', detail: 'Approve once, or deny and keep the checkpoint.' }
      ],
      stepsLabel: 'Request',
      queue: queueOf(ctx, activeFlow(ctx)),
      progress: null,
      actions: [
        { a: 'deny-permission', label: 'Deny', kind: 'soft' },
        { a: 'approve-permission', label: 'Approve once', kind: 'primary', icon: 'check', after: true }
      ],
      closable: true
    };
  }

  function conflictModel(ctx) {
    var opts = [
      { value: 'indexes', label: 'Approve indexes', hint: 'Fast, reversible first step' },
      { value: 'views', label: 'Use materialized views', hint: 'Faster reads, refresh state' },
      { value: 'override', label: 'Override policy', hint: 'Permit schema reviewer changes' }
    ];
    var agents = (ctx.D && ctx.D.subagents) || [];
    var named = agents.filter(function (a) { return a.id === 'agent-query' || a.id === 'agent-schema'; });
    return {
      type: 'conflict',
      take: takeOf(ctx),
      key: 'conflict:mediation',
      icon: 'warning',
      title: 'Resolve agent recommendation',
      subtitle: 'Two child agents disagree; the parent mediates.',
      meta: [{ text: named.length + ' agents', tone: '' }, { text: 'Mediated', tone: 'need' }],
      prompt: 'Choose the next safe implementation path',
      required: true,
      note: 'Given the 95% read workload and modest write rate, the composite index is the safer first step.',
      input: { kind: 'choice', action: 'resolve-conflict', options: opts },
      evidence: [
        { label: 'Parent mediation', lines: ['Given the 95% read workload and modest write rate, the composite index is the safer first step. Materialized views remain a follow-up after measuring index performance.'] },
        { label: 'Who disagreed', lines: named.length
            ? named.map(function (a) { return a.name + ' — ' + lbl(ctx, 'subagentStatus', a.status) + (a.current ? ' · ' + a.current : ''); })
            : ['Child agent records are not loaded.'] }
      ],
      steps: opts.map(function (o, i) {
        return { id: 'c-' + o.value, index: i, label: o.label, state: 'todo', detail: o.hint,
          action: 'resolve-conflict', data: { value: o.value } };
      }),
      stepsLabel: 'Candidate paths',
      queue: queueOf(ctx, activeFlow(ctx)),
      progress: null,
      actions: [],
      closable: true
    };
  }

  function takeOf(ctx) {
    var v = (ctx.state.variants && ctx.state.variants[6]) | 0;
    return v >= 0 && v < TAKES ? v : 0;
  }

  /* ============================================================== FRAGMENTS */
  function iconOf(ctx, name, size) { return ctx.icon(name, size || 12); }

  function pills(ctx, m) {
    return m.meta.map(function (p) {
      return '<span class="meta-pill qs-pill' + (p.tone ? ' qs-pill-' + p.tone : '') + '">' + ctx.esc(p.text) + '</span>';
    }).join('');
  }
  function closeBtn(ctx, m) {
    if (!m.closable) return '';
    return '<button class="icon-button qs-close" data-action="close-decision" title="Close and return later; answers are preserved" aria-label="Close decision">'
      + iconOf(ctx, 'close', 12) + '</button>';
  }
  function head(ctx, m, cls) {
    return '<div class="qs-head' + (cls ? ' ' + cls : '') + '" data-k="qs-head">'
      + '<span class="event-icon qs-head-icon">' + iconOf(ctx, m.icon, 13) + '</span>'
      + '<strong class="qs-title">' + ctx.esc(m.title) + '</strong>'
      + pills(ctx, m)
      + '<span class="spacer"></span>' + closeBtn(ctx, m) + '</div>';
  }
  function actionBtn(ctx, a) {
    var cls = a.kind === 'primary' ? 'primary-button'
      : a.kind === 'soft' ? 'soft-button'
        : a.kind === 'text danger' ? 'text-button danger' : 'text-button';
    var data = '';
    if (a.data) for (var k in a.data) if (Object.prototype.hasOwnProperty.call(a.data, k)) data += ' data-' + k + '="' + ctx.esc(a.data[k]) + '"';
    var g = a.icon ? iconOf(ctx, a.icon, 12) : '';
    var body = a.after ? ctx.esc(a.label) + ' ' + g : (g ? g + ' ' + ctx.esc(a.label) : ctx.esc(a.label));
    /* An icon-only button still has to say what it is: take 1 renders Back as a
       glyph, and an unnamed control is an accessibility defect, not a style. */
    var named = a.label ? '' : ' aria-label="' + ctx.esc(a.aria || a.a) + '" title="' + ctx.esc(a.aria || a.a) + '"';
    return '<button class="' + cls + ' qs-action" data-action="' + ctx.esc(a.a) + '"' + data + named
      + (a.disabled ? ' disabled' : '') + ' data-k="qs-act:' + ctx.esc(a.a) + '">' + body + '</button>';
  }
  function actions(ctx, m, cls) {
    if (!m.actions.length) return '';
    return '<div class="qs-actions' + (cls ? ' ' + cls : '') + '" data-k="qs-actions">'
      + m.actions.map(function (a) { return actionBtn(ctx, a); }).join('') + '</div>';
  }
  function progressBar(ctx, m) {
    if (!m.progress) return '';
    return '<div class="qs-progress" data-k="qs-progress" title="' + ctx.esc(m.progress.label) + '">'
      + '<div class="qs-progress-track"><i style="width:' + m.progress.pct + '%"></i></div>'
      + '<span class="qs-progress-label">' + ctx.esc(m.progress.label) + '</span></div>';
  }
  function ticks(ctx, m) {
    if (!m.steps || m.type !== 'question') return '';
    return '<div class="qs-ticks" data-k="qs-ticks">' + m.steps.map(function (s, i) {
      return '<button type="button" class="qs-tick is-' + s.state + '" data-action="qs-goto-question" data-index="'
        + s.index + '" aria-label="Question ' + (s.index + 1) + '" data-k="qs-tick:' + ctx.esc(s.id) + '"></button>';
    }).join('') + '</div>';
  }
  function askSpine(ctx, m) {
    if (!m.steps || m.type !== 'question') return '';
    var idx = Math.min(Math.max(ctx.state.questionIndex | 0, 0), Math.max(m.steps.length - 1, 0));
    return '<div class="qs-spine" data-k="qs-spine">'
      + '<div class="qs-spine-track" aria-hidden="true"></div>'
      + m.steps.map(function (s) {
        return '<button type="button" class="qs-spine-slot is-' + s.state + '" data-action="qs-goto-question" data-index="'
          + s.index + '" aria-label="Question ' + (s.index + 1) + '" data-k="qs-spine:' + ctx.esc(s.id) + '"></button>';
      }).join('')
      + '<div class="qs-spine-thumb" aria-hidden="true">' + (idx + 1) + '</div>'
      + '</div>';
  }
  function reel(ctx, m, inner) {
    var st = qsState(ctx);
    var dir = st.reelDir || 'next';
    var live = '<div class="qs-reel qs-reel-' + dir + '" data-k="qs-reel:' + ctx.esc(m.key) + '">' + inner + '</div>';
    if (m.take === 8 && st.outgoingHtml) {
      var out = '<div class="qs-reel-out qs-reel-out-' + dir + '" aria-hidden="true">' + st.outgoingHtml + '</div>';
      st.outgoingHtml = null;
      st.outgoingH = null;
      return '<div class="qs-reel-stage" data-k="qs-reel-stage">' + out + live + '</div>';
    }
    return live;
  }
  function reduceMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function fileName(p) {
    var s = String(p || '');
    var i = s.lastIndexOf('/');
    return i >= 0 ? s.slice(i + 1) : s;
  }
  function otherRow(ctx, m, style) {
    if (m.type !== 'question') return '';
    var kind = (m.input && m.input.kind) || '';
    if (kind === 'summary' || kind === 'progress' || kind === 'none') return '';
    var q = currentQuestion(ctx) || {};
    var other = String(q.other != null && q.other !== '' ? q.other : (kind === 'text' ? (q.answer || '') : ''));
    var atts = Array.isArray(q.attachments) ? q.attachments : [];
    var st = qsState(ctx);
    var mention = st.mention && st.mention.open;
    var query = (st.mention && st.mention.query) || '';
    var qlc = query.toLowerCase();
    var paths = FILE_PATHS.filter(function (p) { return !qlc || p.toLowerCase().indexOf(qlc) >= 0; });
    var chips = atts.map(function (a, i) {
      var label = a.path || a.name || '';
      return '<button type="button" class="qs-file-chip" data-action="qs-chip-remove" data-index="' + i
        + '" title="' + ctx.esc(label) + '">@' + ctx.esc(label) + '<span aria-hidden="true">×</span></button>';
    }).join('');
    var sprout = mention
      ? '<div class="qs-mention" role="listbox" data-k="qs-mention">' + (paths.length ? paths.map(function (p) {
          return '<button type="button" class="qs-mention-item" role="option" data-action="qs-mention-pick" data-path="'
            + ctx.esc(p) + '">' + ctx.esc(p) + '</button>';
        }).join('') : '<span class="qs-mention-empty">No matching files</span>') + '</div>'
      : '';
    var otherN = 1;
    if (kind !== 'text') {
      var presetN = (m.input && m.input.options) ? Math.min(m.input.options.length, 4) : 0;
      otherN = presetN + 1;
    }
    var otherOn = !!(q.otherOn) || !!String(other).trim() || atts.length > 0;
    var mark = '';
    if (style === 'ask' && kind !== 'text') {
      mark = '<button type="button" class="qs-ask-mark qs-ask-mark-' + (kind === 'multi' ? 'check' : 'radio')
        + (otherOn ? ' is-on' : '') + '" data-action="qs-select-other" aria-label="Something else"></button>';
    }
    return '<div class="qs-other' + (style ? ' qs-other-' + style : '') + (otherOn && style === 'ask' ? ' is-on' : '')
      + '"' + (style === 'ask' && kind !== 'text' ? ' data-action="qs-select-other"' : '')
      + ' data-k="qs-other" style="--i:' + (otherN - 1) + '">'
      + mark
      + '<span class="qs-num">' + otherN + '.</span>'
      + '<div class="qs-other-field">'
      + '<div class="qs-other-line">'
      + chips
      + '<input type="text" class="qs-other-input" data-input="question-other" data-k="qs-text:question-other" placeholder="'
      + ctx.esc(OTHER_PLACEHOLDER) + '" value="' + ctx.esc(other) + '" autocomplete="off" spellcheck="false">'
      + '<button type="button" class="icon-button qs-attach" data-action="qs-attach" title="Attach a file" aria-label="Attach a file">'
      + iconOf(ctx, 'attach', 16) + '</button>'
      + '</div>'
      + sprout
      + '</div></div>';
  }
  function askNote(ctx, m) {
    if (m.type !== 'question') return '';
    var q = currentQuestion(ctx) || {};
    var other = String(q.other != null && q.other !== '' ? q.other : (q.answer || ''));
    var atts = Array.isArray(q.attachments) ? q.attachments : [];
    var st = qsState(ctx);
    var mention = st.mention && st.mention.open;
    var query = (st.mention && st.mention.query) || '';
    var qlc = query.toLowerCase();
    var paths = FILE_PATHS.filter(function (p) { return !qlc || p.toLowerCase().indexOf(qlc) >= 0; });
    var chips = atts.map(function (a, i) {
      var label = a.path || a.name || '';
      return '<button type="button" class="qs-file-chip" data-action="qs-chip-remove" data-index="' + i
        + '" title="' + ctx.esc(label) + '">@' + ctx.esc(label) + '<span aria-hidden="true">×</span></button>';
    }).join('');
    var sprout = mention
      ? '<div class="qs-mention" role="listbox" data-k="qs-mention">' + (paths.length ? paths.map(function (p) {
          return '<button type="button" class="qs-mention-item" role="option" data-action="qs-mention-pick" data-path="'
            + ctx.esc(p) + '">' + ctx.esc(p) + '</button>';
        }).join('') : '<span class="qs-mention-empty">No matching files</span>') + '</div>'
      : '';
    return '<div class="qs-ask-note" data-k="qs-note" style="--i:1">'
      + '<div class="qs-ask-note-eyebrow">Optional note</div>'
      + '<div class="qs-ask-note-well">'
      + chips
      + '<textarea class="qs-other-input qs-ask-note-input" data-input="question-other" data-k="qs-text:question-other" rows="3" placeholder="'
      + ctx.esc('Type a constraint, or leave blank to skip.') + '" autocomplete="off" spellcheck="false">'
      + ctx.esc(other) + '</textarea>'
      + '<button type="button" class="icon-button qs-attach" data-action="qs-attach" title="Attach a file" aria-label="Attach a file">'
      + iconOf(ctx, 'attach', 16) + '</button>'
      + sprout
      + '</div></div>';
  }
  function optNum(i) {
    return '<span class="qs-num">' + (i + 1) + '.</span>';
  }

  /* The input, in four idioms. Same data-action vocabulary in all four, so
     app.js's own handlers stay the ones doing the work. Choice and multi
     questions always carry numbered presets plus a permanent next-number
     Something else row; text questions are that row alone. */
  function inputHtml(ctx, m, style) {
    var input = m.input || { kind: 'none' };
    if (input.kind === 'none') return '';
    if (input.kind === 'progress') {
      return '<div class="qs-wait" data-k="qs-wait"><div class="qs-progress-track' + (input.scan ? ' is-scan' : '') + '">'
        + '<i style="width:' + input.pct + '%"></i></div></div>';
    }
    if (input.kind === 'summary') {
      if (style === 'ask') {
        var all = ctx.state.questions || [];
        var cur = currentQuestion(ctx);
        return '<div class="qs-ask-review" data-k="qs-review">' + all.map(function (x, i) {
          if (x === cur || x.type === 'summary') return '';
          var ok = hasAnswer(x);
          return '<button type="button" class="qs-ask-review-row' + (ok ? ' is-ok' : ' is-empty')
            + '" data-action="qs-goto-question" data-index="' + i
            + '" data-k="qs-review:' + i + '" style="--i:' + i + '">'
            + '<span class="qs-ask-review-disc">' + (i + 1) + '</span>'
            + '<span class="qs-ask-review-copy">'
            + '<span class="qs-ask-review-a">' + ctx.esc(answerText(x) || 'Not answered') + '</span>'
            + '<span class="qs-ask-review-q">' + ctx.esc(String(x.prompt || '').replace(/\s+/g, ' ').trim()) + '</span></span>'
            + (ok ? '<span class="qs-ask-review-done">' + iconOf(ctx, 'check', 12) + '</span>' : '')
            + '</button>';
        }).join('') + '</div>';
      }
      return '<div class="qs-summary" data-k="qs-summary">' + input.rows.map(function (r) {
        return '<div class="qs-summary-row' + (r.ok ? ' is-ok' : '') + '">'
          + '<span class="qs-summary-k">' + ctx.esc(r.label) + '</span>'
          + '<span class="qs-summary-v">' + ctx.esc(r.value) + '</span></div>';
      }).join('') + '</div>';
    }
    if (input.kind === 'text') {
      return style === 'ask' ? askNote(ctx, m) : otherRow(ctx, m, style);
    }
    var multi = input.kind === 'multi';
    var act = input.action;
    var opts = (input.options || []).slice(0, 4);
    var body;
    if (style === 'chips') {
      body = '<div class="qs-chips" data-k="qs-opts">' + opts.map(function (o, i) {
        return '<button type="button" class="qs-chip' + (o.selected ? ' is-on' : '') + '" data-action="' + ctx.esc(act)
          + '" data-value="' + ctx.esc(o.value) + '" data-k="qs-opt:' + ctx.esc(o.value) + '" style="--i:' + i + '">'
          + optNum(i)
          + (o.selected ? '<span class="qs-chip-mark">' + iconOf(ctx, 'check', 11) + '</span>' : '')
          + ctx.esc(o.label) + '</button>';
      }).join('') + '</div>';
    } else if (style === 'rows') {
      body = '<div class="qs-tech-opts" data-k="qs-opts">' + opts.map(function (o, i) {
        return '<button type="button" class="qs-tech-opt' + (o.selected ? ' is-on' : '') + '" data-action="' + ctx.esc(act)
          + '" data-value="' + ctx.esc(o.value) + '" data-k="qs-opt:' + ctx.esc(o.value) + '" style="--i:' + i + '">'
          + '<span class="qs-tech-key">' + (i + 1) + '.</span>'
          + '<span class="qs-tech-val">' + ctx.esc(o.label) + '</span>'
          + '<span class="qs-tech-state">' + (o.selected ? (multi ? 'included' : 'selected') : '—') + '</span>'
          + (o.hint ? '<span class="qs-tech-hint">' + ctx.esc(o.hint) + '</span>' : '') + '</button>';
      }).join('') + '</div>';
    } else if (style === 'stack') {
      body = '<div class="qs-opt-stack" data-k="qs-opts">' + opts.map(function (o, i) {
        return '<button type="button" class="qs-opt-row' + (o.selected ? ' is-on' : '') + '" data-action="' + ctx.esc(act)
          + '" data-value="' + ctx.esc(o.value) + '" data-k="qs-opt:' + ctx.esc(o.value) + '" style="--i:' + i + '">'
          + optNum(i)
          + '<span class="qs-opt-box">' + (o.selected ? iconOf(ctx, 'check', 10) : '') + '</span>'
          + '<span class="qs-opt-text"><strong>' + ctx.esc(o.label) + '</strong>'
          + (o.hint ? '<span>' + ctx.esc(o.hint) + '</span>' : '') + '</span></button>';
      }).join('') + '</div>';
    } else if (style === 'ask') {
      body = '<div class="qs-ask-opts' + (multi ? ' is-multi' : ' is-choice') + '" data-k="qs-opts">' + opts.map(function (o, i) {
        return '<button type="button" class="qs-ask-opt' + (o.selected ? ' is-on' : '') + (multi ? ' is-multi' : ' is-choice')
          + '" data-action="' + ctx.esc(act)
          + '" data-value="' + ctx.esc(o.value) + '" data-k="qs-opt:' + ctx.esc(o.value) + '" style="--i:' + i + '">'
          + '<span class="qs-ask-mark qs-ask-mark-' + (multi ? 'check' : 'radio') + (o.selected ? ' is-on' : '')
          + '" aria-hidden="true"></span>'
          + optNum(i)
          + '<span class="qs-ask-opt-label">' + ctx.esc(o.label) + '</span></button>';
      }).join('') + '</div>';
    } else {
      body = '<div class="choice-grid qs-grid" data-k="qs-opts">' + opts.map(function (o, i) {
        return '<button type="button" class="choice' + (o.selected ? ' selected' : '') + '" data-action="' + ctx.esc(act)
          + '" data-value="' + ctx.esc(o.value) + '" data-k="qs-opt:' + ctx.esc(o.value) + '" style="--i:' + i + '">'
          + optNum(i)
          + '<strong>' + ctx.esc(o.label) + '</strong>'
          + (o.hint ? '<br><span class="qs-grid-hint">' + ctx.esc(o.hint) + '</span>' : '') + '</button>';
      }).join('') + '</div>';
    }
    return body + otherRow(ctx, m, style);
  }

  function promptHtml(ctx, m, cls) {
    return '<div class="qs-prompt' + (cls ? ' ' + cls : '') + '" data-k="qs-prompt">' + ctx.esc(m.prompt)
      + (m.required ? '<span class="qs-req" title="Required">*</span>' : '') + '</div>';
  }
  function noteHtml(ctx, m, cls) {
    if (!m.note) return '';
    return '<p class="qs-note' + (cls ? ' ' + cls : '') + '" data-k="qs-note">' + ctx.esc(m.note) + '</p>';
  }
  function queueRows(ctx, m, style) {
    if (!m.queue || !m.queue.length) return '';
    return m.queue.map(function (f) {
      return '<button class="qs-queue-row is-' + ctx.esc(f.state) + (style ? ' qs-queue-' + style : '')
        + '" data-action="qs-open-flow" data-flow="' + ctx.esc(f.id) + '" data-k="qs-flow:' + ctx.esc(f.id) + '">'
        + '<span class="qs-queue-state">' + ctx.esc(f.stateLabel) + '</span>'
        + '<span class="qs-queue-title">' + ctx.esc(f.title) + '</span>'
        + '<span class="qs-queue-count">' + f.answered + '/' + f.total + '</span></button>';
    }).join('');
  }
  function evidenceHtml(ctx, m) {
    if (!m.evidence || !m.evidence.length) return '';
    /* The ONLY emitter of .decision-evidence / .qs-evidence in this module.
       questions.css shows it under [data-variant="7"] alone, so the narrow-width
       regression that flattened this family cannot recur through a shared rule. */
    return m.evidence.map(function (e) {
      return '<div class="decision-evidence qs-evidence" data-k="qs-ev:' + ctx.esc(e.label) + '">'
        + '<strong>' + ctx.esc(e.label) + '</strong>'
        + e.lines.filter(Boolean).map(function (l) { return '<p>' + ctx.esc(l) + '</p>'; }).join('')
        + '</div>';
    }).join('');
  }

  /* ================================================================ TAKE 0 */
  /* Stable Card — one centred card, one column, nothing moves. The reference. */
  function take0(ctx, m) {
    return '<section class="decision-surface qs qs-card" data-qs="0" data-k="qs:0">'
      + head(ctx, m)
      + '<div class="qs-body qs-scroll">'
      + ticks(ctx, m)
      + reel(ctx, m, promptHtml(ctx, m) + inputHtml(ctx, m, 'grid') + noteHtml(ctx, m))
      + '</div>'
      + actions(ctx, m, 'qs-actions-end')
      + '</section>';
  }

  /* ================================================================ TAKE 1 */
  /* Morphing Composer — no card at all. The decision reads as the composer
     having morphed into a question: one bar, options inline, a send button
     where send always is. The field is keyed on the question, so only the
     FIELD replays its morph when the question changes; the bar does not. */
  function take1(ctx, m) {
    var send = m.actions.filter(function (a) { return a.kind === 'primary'; })[0];
    var back = m.actions.filter(function (a) { return a.a === 'prev-question'; })[0];
    var rest = m.actions.filter(function (a) { return a.kind !== 'primary' && a.a !== 'prev-question'; });
    return '<div class="qs qs-morph" data-qs="1" data-k="qs:1">'
      + '<div class="qs-morph-bar" data-k="qs-morph-bar">'
      + '<span class="qs-morph-badge" title="' + ctx.esc(m.title) + '">' + iconOf(ctx, m.icon, 13) + '</span>'
      + reel(ctx, m, '<div class="qs-morph-prompt">' + ctx.esc(m.prompt) + (m.required ? '<span class="qs-req">*</span>' : '') + '</div>'
        + inputHtml(ctx, m, 'chips'))
      + ((back || send) ? '<div class="qs-morph-controls">'
        + (back ? actionBtn(ctx, { a: back.a, label: '', aria: 'Back to the previous question', kind: 'soft', icon: 'left', disabled: back.disabled }) : '')
        + (send ? actionBtn(ctx, send) : '') + '</div>' : '')
      + '</div>'
      + '<div class="qs-morph-under">'
      + '<strong class="qs-title qs-morph-name">' + ctx.esc(m.title) + '</strong>'
      + pills(ctx, m)
      + '<span class="spacer"></span>'
      + rest.map(function (a) { return actionBtn(ctx, a); }).join('')
      + closeBtn(ctx, m)
      + '</div>'
      + ticks(ctx, m)
      + '</div>';
  }

  /* ================================================================ TAKE 2 */
  /* Anchored Sheet — full-bleed, flush to the bottom edge of the host, grabber
     at the top, a scrolling body and a footer bar that stays put. Evidence is a
     disclosure here rather than a pane: a sheet has room for one thing at a
     time, so the reader opens it. */
  function take2(ctx, m) {
    var open = !!qsState(ctx).fold;
    return '<section class="qs qs-sheet" data-qs="2" data-k="qs:2">'
      + '<div class="qs-sheet-grip" aria-hidden="true"></div>'
      + head(ctx, m, 'qs-sheet-head')
      + '<div class="qs-sheet-body qs-scroll">'
      + ticks(ctx, m)
      + reel(ctx, m, promptHtml(ctx, m, 'qs-prompt-lg')
        + ((m.subtitle && m.subtitle !== m.note && m.subtitle !== m.prompt)
          ? '<p class="qs-sub" data-k="qs-sub">' + ctx.esc(m.subtitle) + '</p>' : '')
        + inputHtml(ctx, m, 'stack'))
      + '<button class="qs-fold-trigger" data-action="qs-toggle-fold" data-k="qs-fold-trigger" aria-expanded="' + (open ? 'true' : 'false') + '">'
      + iconOf(ctx, open ? 'collapse' : 'expand', 11) + ' <span>' + (open ? 'Hide the reasoning' : 'Why this is being asked') + '</span></button>'
      + (open ? '<div class="qs-fold" data-k="qs-fold">' + m.evidence.map(function (e) {
        return '<div class="qs-fold-block"><strong>' + ctx.esc(e.label) + '</strong>'
          + e.lines.filter(Boolean).map(function (l) { return '<p>' + ctx.esc(l) + '</p>'; }).join('') + '</div>';
      }).join('') + '</div>' : '')
      + (m.queue.length ? '<div class="qs-queue qs-queue-sheet" data-k="qs-queue">' + queueRows(ctx, m, 'sheet') + '</div>' : '')
      + '</div>'
      + '<div class="qs-sheet-foot">' + actions(ctx, m, 'qs-actions-spread') + '</div>'
      + '</section>';
  }

  /* ================================================================ TAKE 3 */
  /* Side Inspector — the decision docks to the right as a narrow inspector and
     states its facts as a field list, prompt at the top, input at the bottom,
     actions stacked full width. Nothing here is a two-column split; the whole
     surface is the aside. */
  function take3(ctx, m) {
    var fields = inspectorFields(ctx, m);
    return '<section class="decision-surface qs qs-inspector" data-qs="3" data-k="qs:3">'
      + head(ctx, m, 'qs-inspector-head')
      /* Input BEFORE the field list: the first screenshot pass put the fields
         first and the actual answer control fell below the fold, which is the
         "present but unreachable" failure this wave exists to remove. */
      + '<div class="qs-inspector-body qs-scroll">'
      + ticks(ctx, m)
      + reel(ctx, m, promptHtml(ctx, m, 'qs-prompt-sm') + inputHtml(ctx, m, 'stack'))
      + '<dl class="qs-dl" data-k="qs-dl">' + fields.map(function (f) {
        return '<div class="qs-dl-row" data-k="qs-dl:' + ctx.esc(f.k) + '"><dt>' + ctx.esc(f.k) + '</dt><dd>' + ctx.esc(f.v) + '</dd></div>';
      }).join('') + '</dl>'
      + '</div>'
      + actions(ctx, m, 'qs-actions-stack')
      + '</section>';
  }
  function inspectorFields(ctx, m) {
    var out = [];
    if (m.type === 'question') {
      var flow = activeFlow(ctx);
      var qs = ctx.state.questions || [];
      var idx = Math.min(Math.max(ctx.state.questionIndex | 0, 0), Math.max(qs.length - 1, 0));
      out.push({ k: 'Flow state', v: flow ? lbl(ctx, 'questionFlowState', flow.state) : '—' });
      out.push({ k: 'Question', v: (idx + 1) + ' of ' + qs.length });
      out.push({ k: 'Required', v: m.required ? 'Yes' : 'No' });
      out.push({ k: 'Opened', v: (flow && clockOf(ctx, flow.openedAt)) || '—' });
      out.push({ k: 'Expiry', v: (flow && flow.expiresAt) ? clockOf(ctx, flow.expiresAt) : 'None — it waits' });
      out.push({ k: 'Answered', v: m.progress ? m.progress.label : '—' });
      out.push({ k: 'Queue', v: m.queue.filter(function (f) { return f.state === 'queued'; }).length + ' waiting' });
    } else {
      out.push({ k: 'Decision', v: m.title });
      out.push({ k: 'Subject', v: m.subtitle || m.prompt });
    }
    if (m.note) out.push({ k: 'Why', v: m.note });
    return out;
  }

  /* ================================================================ TAKE 4 */
  /* Step Sequence — a real spine with one node per step. For a questionnaire the
     steps are the questions (and the current one carries the input inline); for
     a plan they are the fixture's immutable revision history; for a permission
     or a conflict they are the stages of the request. Every node is clickable
     where clicking it means something. */
  function take4(ctx, m) {
    var steps = m.steps || [];
    return '<section class="decision-surface qs qs-seq" data-qs="4" data-k="qs:4">'
      + head(ctx, m, 'qs-seq-head')
      + '<div class="qs-seq-body qs-scroll">'
      + ticks(ctx, m)
      + '<div class="qs-seq-label">' + ctx.esc(m.stepsLabel || 'Steps') + '</div>'
      + '<ol class="qs-steps" data-k="qs-steps">'
      + steps.map(function (s) {
        var inner = '<div class="qs-step-head"><strong>' + ctx.esc(s.label) + '</strong>'
          + '<span class="qs-step-state">' + ctx.esc(stateWord(s.state, m.type)) + '</span></div>'
          + '<p class="qs-step-detail">' + ctx.esc(s.detail || '') + '</p>';
        var body = s.action
          ? '<button class="qs-step-body" data-action="' + ctx.esc(s.action) + '"' + dataAttrs(ctx, s.data) + '>' + inner + '</button>'
          : '<div class="qs-step-body">' + inner + '</div>';
        var live = s.state === 'current' && m.input && m.input.kind !== 'none'
          ? '<div class="qs-step-live">' + reel(ctx, m, inputHtml(ctx, m, 'stack') + noteHtml(ctx, m, 'qs-note-sm')) + '</div>' : '';
        return '<li class="qs-step is-' + s.state + '" data-k="qs-step:' + ctx.esc(s.id) + '">'
          + '<span class="qs-step-dot">' + (s.state === 'done' ? iconOf(ctx, 'check', 10) : '') + '</span>'
          + body + live + '</li>';
      }).join('')
      + '</ol>'
      + (steps.length ? '' : promptHtml(ctx, m) + inputHtml(ctx, m, 'stack'))
      + '</div>'
      + actions(ctx, m, 'qs-actions-end')
      + '</section>';
  }
  /* A revision is not "Answered" and a candidate path is not "Waiting". The
     first screenshot pass printed questionnaire vocabulary over a plan's
     revision history, which reads as the surface not knowing what it is
     showing — the same class of mislabel as painting a raw enum. */
  var STEP_WORDS = {
    question: { done: 'Answered', current: 'Now', skipped: 'Skipped', todo: 'Waiting' },
    plan: { done: 'Superseded', current: 'Under review', skipped: 'Skipped', todo: 'Newer' },
    permission: { done: 'Stated', current: 'Now', skipped: 'Skipped', todo: 'Waiting' },
    conflict: { done: 'Chosen', current: 'Now', skipped: 'Skipped', todo: 'Choose' }
  };
  function stateWord(s, type) {
    var map = STEP_WORDS[type] || STEP_WORDS.question;
    return map[s] || map.todo;
  }
  function dataAttrs(ctx, d) {
    var out = '';
    if (d) for (var k in d) if (Object.prototype.hasOwnProperty.call(d, k)) out += ' data-' + k + '="' + ctx.esc(d[k]) + '"';
    return out;
  }

  /* ================================================================ TAKE 5 */
  /* Technical Decision — the decision as a record, not as prose. Monospace
     key/value rows, keyed options, and the rationale rendered as more record
     rows rather than as a pane. */
  function take5(ctx, m) {
    var rows = techRows(ctx, m);
    return '<section class="decision-surface qs qs-tech" data-qs="5" data-k="qs:5">'
      + head(ctx, m, 'qs-tech-head')
      + '<div class="qs-tech-body qs-scroll">'
      + ticks(ctx, m)
      + '<div class="qs-tech-rows" data-k="qs-tech-rows">' + rows.map(function (r) {
        return '<div class="qs-tech-row" data-k="qs-tr:' + ctx.esc(r.k) + '"><span class="qs-tech-k">' + ctx.esc(r.k)
          + '</span><span class="qs-tech-v">' + ctx.esc(r.v) + '</span></div>';
      }).join('') + '</div>'
      + reel(ctx, m, '<div class="qs-tech-prompt" data-k="qs-tech-prompt">' + ctx.esc(m.prompt) + (m.required ? '<span class="qs-req">*</span>' : '') + '</div>'
        + inputHtml(ctx, m, 'rows'))
      + '<div class="qs-tech-rows qs-tech-why" data-k="qs-tech-why">' + m.evidence.map(function (e) {
        return e.lines.filter(Boolean).map(function (l, i) {
          return '<div class="qs-tech-row"><span class="qs-tech-k">' + ctx.esc(i === 0 ? e.label : '') + '</span>'
            + '<span class="qs-tech-v">' + ctx.esc(l) + '</span></div>';
        }).join('');
      }).join('') + '</div>'
      + '</div>'
      + actions(ctx, m, 'qs-actions-mono')
      + '</section>';
  }
  function techRows(ctx, m) {
    var out = [];
    if (m.type === 'question') {
      var flow = activeFlow(ctx);
      var qs = ctx.state.questions || [];
      var idx = Math.min(Math.max(ctx.state.questionIndex | 0, 0), Math.max(qs.length - 1, 0));
      var q = qs[idx] || {};
      out.push({ k: 'flow', v: (flow && flow.id) || '—' });
      out.push({ k: 'state', v: flow ? lbl(ctx, 'questionFlowState', flow.state) : '—' });
      out.push({ k: 'question', v: (q.id || '—') + '  ' + (idx + 1) + '/' + qs.length });
      out.push({ k: 'kind', v: q.type || '—' });
      out.push({ k: 'required', v: q.required ? 'yes' : 'no' });
      out.push({ k: 'answer', v: answerText(q) || '(none)' });
      out.push({ k: 'thread', v: (flow && flow.threadId) || '—' });
    } else if (m.type === 'plan') {
      out.push({ k: 'artifact', v: 'plan-query' });
      out.push({ k: 'revision', v: String(ctx.state.planRevision | 0) });
      out.push({ k: 'mode', v: (ctx.state.decision && ctx.state.decision.mode === 'revise') ? 'revise' : 'review' });
      out.push({ k: 'title', v: m.prompt });
    } else {
      out.push({ k: 'decision', v: m.type });
      out.push({ k: 'subject', v: m.subtitle || m.prompt });
    }
    return out;
  }

  /* ================================================================ TAKE 6 */
  /* Queue Stack — the queue IS the structure. The live decision is the top card;
     every other flow in the fixture is a real card behind it, and clicking one
     brings it forward, preserving the draft answers of the flow you left. This
     is the take that makes `2 queued` mean something. */
  function take6(ctx, m) {
    var behind = m.queue.slice(0, 3);
    return '<div class="qs qs-stack" data-qs="6" data-k="qs:6">'
      + behind.map(function (f, i) {
        return '<button class="qs-stack-peek is-' + ctx.esc(f.state) + '" data-depth="' + (behind.length - i)
          + '" data-action="qs-open-flow" data-flow="' + ctx.esc(f.id) + '" data-k="qs-peek:' + ctx.esc(f.id) + '">'
          + '<span class="qs-peek-state">' + ctx.esc(f.stateLabel) + '</span>'
          + '<span class="qs-peek-title">' + ctx.esc(f.title) + '</span>'
          + '<span class="qs-peek-count">' + f.answered + '/' + f.total + '</span>'
          + '</button>';
      }).join('')
      + '<section class="decision-surface qs-stack-live" data-k="qs-live">'
      + head(ctx, m, 'qs-stack-head')
      + '<div class="qs-stack-body qs-scroll">'
      + ticks(ctx, m)
      + reel(ctx, m, promptHtml(ctx, m) + inputHtml(ctx, m, 'grid') + noteHtml(ctx, m))
      + '</div>'
      + actions(ctx, m, 'qs-actions-end')
      + '</section>'
      + '</div>';
  }

  /* ================================================================ TAKE 7 */
  /* Evidence Split — the one take that keeps a persistent evidence pane, in a
     second column. The pane is the differentiator, so questions.css shows
     `.qs-evidence` under `[data-variant="7"]` only, and the narrow-width tier is
     a CONTAINER query on the surface: the binding constraint is the resizable
     editor split, which a viewport media query cannot see. */
  function take7(ctx, m) {
    return '<section class="decision-surface qs qs-split" data-qs="7" data-k="qs:7">'
      + head(ctx, m, 'qs-split-head')
      + '<div class="qs-split-body">'
      + '<div class="qs-split-main">'
      + '<div class="qs-split-main-scroll">'
      + ticks(ctx, m)
      + reel(ctx, m, promptHtml(ctx, m) + inputHtml(ctx, m, 'grid'))
      /* NOT the note: the pane's first block already IS the rationale, and
         printing it twice on one surface is the contradiction-by-duplication
         this project keeps finding. The spare column height goes to the queue,
         which the pane does not carry — and only for a questionnaire, where a
         queue of other flows is the thing waiting behind this one. */
      + (m.type === 'question' && m.queue.length
        ? '<div class="qs-queue qs-queue-split" data-k="qs-queue">' + queueRows(ctx, m, 'split') + '</div>' : '')
      + '</div>'
      + actions(ctx, m, 'qs-actions-end')
      + '</div>'
      + '<aside class="qs-split-aside qs-scroll" data-k="qs-aside">' + evidenceHtml(ctx, m) + '</aside>'
      + '</div>'
      + '</section>';
  }

  /* ================================================================ TAKE 8 */
  /* Ask Card — the reference-video layout in PM tokens. Prompt is the title,
     ticks are a vertical rail on the right. Footer is Back, Question N of M,
     Skip (not on review), Next or Submit. Choice does not auto-advance.
     Composer stays below, unchanged. */
  function take8(ctx, m) {
    if (m.type !== 'question') return take0(ctx, m);
    var qs = ctx.state.questions || [];
    var last = Math.max(qs.length - 1, 0);
    var idx = Math.min(Math.max(ctx.state.questionIndex | 0, 0), last);
    var review = m.input && m.input.kind === 'summary';
    var q = currentQuestion(ctx);
    var sub = '';
    if (m.input && m.input.kind === 'multi') {
      var selN = (q && Array.isArray(q.answer)) ? q.answer.length : 0;
      if (q && String(q.other || '').trim()) selN += 1;
      sub = '<div class="qs-ask-sub" data-k="qs-ask-sub">Select all that apply'
        + (selN ? ' · ' + selN + ' selected' : '') + '</div>';
    }
    var back = { a: 'prev-question', label: 'Back', kind: 'soft', disabled: idx === 0 };
    var skip = review ? null : { a: 'skip-question', label: 'Skip', kind: 'text' };
    var next = idx === last
      ? { a: 'submit-questionnaire', label: 'Submit', kind: 'primary' }
      : { a: 'next-question', label: 'Next', kind: 'primary' };
    return '<section class="decision-surface qs qs-ask" data-qs="8" data-k="qs:8">'
      + '<button type="button" class="qs-ask-x" data-action="close-decision" title="Close and return later; answers are preserved" aria-label="Close decision">'
      + iconOf(ctx, 'close', 12) + '</button>'
      + '<div class="qs-ask-row">'
      + reel(ctx, m, promptHtml(ctx, m, 'qs-ask-title') + sub + inputHtml(ctx, m, 'ask'))
      + askSpine(ctx, m)
      + '</div>'
      + '<div class="qs-ask-foot" data-k="qs-ask-foot">'
      + '<span class="qs-ask-count" data-k="qs-ask-n:' + idx + '">Question ' + (idx + 1) + ' of ' + qs.length + '</span>'
      + actionBtn(ctx, back)
      + (skip ? actionBtn(ctx, skip) : '')
      + actionBtn(ctx, next)
      + '</div>'
      + '</section>';
  }

  function orreryHtml() {
    return '<span class="qs-orrery" aria-hidden="true">'
      + '<span class="qs-orrery-ring qs-orrery-a"></span>'
      + '<span class="qs-orrery-ring qs-orrery-b"></span>'
      + '<i class="qs-orrery-bead"></i>'
      + '<i class="qs-orrery-bead"></i>'
      + '<i class="qs-orrery-bead"></i>'
      + '</span>';
  }
  function waitPill(ctx, m) {
    var label = m.type === 'preparing' ? 'Preparing questions…' : 'Submitting answers…';
    var spin = (m.take === 8 || takeOf(ctx) === 8)
      ? orreryHtml()
      : '<span class="qs-orbit" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
    return '<div class="qs qs-pill-beat" data-k="qs-pill">'
      + '<span class="qs-pill-label">' + ctx.esc(label) + '</span>'
      + spin
      + '</div>';
  }
  function wrapShell(ctx, m, html) {
    var st = qsState(ctx);
    var phase = (m.type === 'preparing' || m.type === 'submitting') ? m.type : 'active';
    var origin = m.take === 3 ? 'right' : (m.take === 1 ? 'composer' : 'bottom');
    if (phase === 'preparing' || phase === 'submitting') st.morphPlayed = false;
    var will = (phase === 'active' && !st.morphPlayed && !st.leaving) ? ' qs-will-open' : '';
    var leave = st.leaving ? (st.leaveKind === 'submit' ? ' is-leaving is-leaving-submit' : ' is-leaving') : '';
    return '<div class="qs-shell qs-phase-' + phase + ' qs-origin-' + origin + will + leave
      + '" data-k="qs-shell" data-phase="' + phase + '" data-take="' + m.take + '">' + html + '</div>';
  }

  var RENDERERS = [take0, take1, take2, take3, take4, take5, take6, take7, take8];

  /* ================================================================== SLOT */
  EXT.slot('questionSurface', function (ctx) {
    var m;
    try { m = buildModel(ctx); } catch (err) { console.error('questions.js model threw', err); return ''; }
    if (!m) return '';
    var st = qsState(ctx);
    if (!document.querySelector('.decision-host .qs-shell')) st.morphPlayed = false;
    if (m.type === 'preparing' || m.type === 'submitting') return wrapShell(ctx, m, waitPill(ctx, m));
    var fn = RENDERERS[m.take] || RENDERERS[0];
    return wrapShell(ctx, m, fn(ctx, m));
  });

  /* ================================================================ ACTIONS */
  function CH(name, fn) { (EXT.chainAction ? EXT.chainAction : EXT.action).call(EXT, name, fn); }
  function clearAuto(ctx) {
    var st = qsState(ctx);
    if (st.autoTimer) { clearTimeout(st.autoTimer); st.autoTimer = null; }
  }
  function beginLeave(ctx, after, kind) {
    var st = qsState(ctx);
    if (st.leaving) return;
    clearAuto(ctx);
    st.mention = null;
    st.leaveKind = kind || 'close';
    var shell = document.querySelector('.qs-shell');
    var finish = function () {
      st.leaving = false;
      st.leaveKind = null;
      st.morphPlayed = false;
      ctx.state.decision = null;
      if (after) after();
      ctx.renderApp();
    };
    if (reduceMotion() || !shell || !shell.animate) {
      finish();
      return;
    }
    st.leaving = true;
    var once = false;
    var wrapped = function () {
      if (once) return;
      once = true;
      clearTimeout(watchdog);
      finish();
    };
    var watchdog = setTimeout(wrapped, 1400);
    playClose(shell, st.leaveKind, wrapped);
  }

  function captureReel(ctx) {
    if (takeOf(ctx) !== 8) return;
    var el = document.querySelector('.qs-ask .qs-reel');
    var shell = document.querySelector('.decision-host .qs-shell');
    var st = qsState(ctx);
    if (el) st.outgoingHtml = el.innerHTML;
    st.needSpring = true;
    st.spineJump = true;
    var spine = document.querySelector('.qs-spine');
    var thumb = spine && spine.querySelector('.qs-spine-thumb');
    if (spine && thumb) {
      st.spineFromTop = thumb.getBoundingClientRect().top - spine.getBoundingClientRect().top;
    }
    if (shell) {
      var h = Math.round(shell.getBoundingClientRect().height);
      shell.__qsH = h;
      shell.style.height = h + 'px';
    }
  }
  function popAskSelect(value) {
    if (reduceMotion()) return;
    requestAnimationFrame(function () {
      var row = null;
      if (value === '__other__') {
        row = document.querySelector('.qs-ask .qs-other-ask, .qs-ask .qs-other');
      } else if (value != null && value !== '') {
        var opts = document.querySelectorAll('.qs-ask-opt[data-value]');
        var i;
        for (i = 0; i < opts.length; i++) {
          if (opts[i].getAttribute('data-value') === value) { row = opts[i]; break; }
        }
      }
      if (!row || !row.animate) return;
      row.animate(
        [{ transform: 'scale(1.04)' }, { transform: 'scale(1)' }],
        { duration: 280, easing: morphEaseOut() }
      );
    });
  }

  /* Jump to a question. The stepper, the inspector rail and the tick row all use
     it, and it is a real navigation: `next-question` refuses to advance past an
     unanswered required question, but going BACK to one has never been gated. */
  EXT.action('qs-goto-question', function (ctx, btn) {
    var qs = ctx.state.questions || [];
    var i = parseInt(btn.getAttribute('data-index'), 10);
    if (isNaN(i)) return true;
    var next = ctx.clamp(i, 0, Math.max(qs.length - 1, 0));
    var st = qsState(ctx);
    if (next === (ctx.state.questionIndex | 0)) return true;
    st.reelDir = next < (ctx.state.questionIndex | 0) ? 'prev' : 'next';
    st.mention = null;
    clearAuto(ctx);
    captureReel(ctx);
    ctx.state.questionIndex = next;
    ctx.renderApp();
    return true;
  });

  /* Open a queued (or completed) flow. Saves the answers of the flow being left
     under `state.qs.drafts`, restores the target's if it has any — which is what
     the fixture's own note claims ("waits indefinitely and keeps its draft"). */
  EXT.action('qs-open-flow', function (ctx, btn) {
    var id = btn.getAttribute('data-flow');
    var target = flowsOf(ctx).filter(function (f) { return f.id === id; })[0];
    if (!target) return true;
    var st = qsState(ctx);
    var leaving = activeFlow(ctx);
    if (leaving) {
      st.drafts = st.drafts || {};
      st.drafts[leaving.id] = (ctx.state.questions || []).map(function (q) {
        return { answer: q.answer, other: q.other, attachments: q.attachments };
      });
    }
    if (target.threadId && (ctx.state.threads || []).some(function (t) { return t.id === target.threadId; })) {
      ctx.switchThread(target.threadId); /* clears state.decision — so set it after */
    }
    var fresh = ctx.clone(target.questions || []);
    var saved = st.drafts && st.drafts[target.id];
    if (saved) fresh.forEach(function (q, i) {
      if (saved[i] === undefined) return;
      if (saved[i] && typeof saved[i] === 'object' && !Array.isArray(saved[i])) {
        q.answer = saved[i].answer;
        q.other = saved[i].other;
        q.attachments = saved[i].attachments;
      } else {
        q.answer = saved[i];
      }
    });
    ctx.state.questions = fresh;
    ctx.state.questionIndex = 0;
    ctx.state.decision = { type: 'question' };
    st.mention = null;
    st.reelDir = 'next';
    ctx.renderApp();
    ctx.toast(target.title, target.note || '');
    return true;
  });

  EXT.action('qs-toggle-fold', function (ctx) {
    var st = qsState(ctx);
    st.fold = !st.fold;
    ctx.renderApp();
    return true;
  });

  EXT.action('qs-attach', function (ctx) {
    var q = currentQuestion(ctx);
    if (!q) return true;
    q.attachments = Array.isArray(q.attachments) ? q.attachments : [];
    var used = {};
    q.attachments.forEach(function (a) { if (a && a.path) used[a.path] = 1; });
    var path = FILE_PATHS.filter(function (p) { return !used[p]; })[0] || FILE_PATHS[0];
    if (used[path] && q.attachments.some(function (a) { return a.path === path; })) return true;
    q.attachments.push({ name: fileName(path), path: path });
    ctx.renderApp();
    return true;
  });
  EXT.action('qs-chip-remove', function (ctx, btn) {
    var q = currentQuestion(ctx);
    if (!q || !Array.isArray(q.attachments)) return true;
    var i = parseInt(btn.getAttribute('data-index'), 10);
    if (isNaN(i)) return true;
    q.attachments.splice(i, 1);
    ctx.renderApp();
    return true;
  });
  EXT.action('qs-mention-pick', function (ctx, btn) {
    var q = currentQuestion(ctx);
    if (!q) return true;
    var path = btn.getAttribute('data-path') || '';
    q.attachments = Array.isArray(q.attachments) ? q.attachments : [];
    if (path && !q.attachments.some(function (a) { return a.path === path; })) {
      q.attachments.push({ name: fileName(path), path: path });
    }
    var v = String(q.other || '');
    var at = v.lastIndexOf('@');
    if (at >= 0) q.other = v.slice(0, at).replace(/\s+$/, '');
    if (q.type === 'text') q.answer = q.other;
    qsState(ctx).mention = null;
    ctx.renderApp();
    return true;
  });

  EXT.action('qs-select-other', function (ctx, btn, ev) {
    var t = ev && ev.target;
    if (t && t.closest && t.closest('input, textarea, .qs-attach, .qs-file-chip, .qs-mention')) return true;
    var q = currentQuestion(ctx);
    if (!q) return true;
    if (q.type === 'choice') q.answer = '';
    q.otherOn = true;
    qsState(ctx).mention = null;
    ctx.renderApp();
    if (takeOf(ctx) === 8) popAskSelect('__other__');
    requestAnimationFrame(function () {
      var inp = document.querySelector('.qs-ask .qs-other-input');
      if (inp) inp.focus();
    });
    return true;
  });

  CH('answer-choice', function (ctx, btn) {
    var q = currentQuestion(ctx);
    if (q) { q.other = ''; q.otherOn = false; }
    qsState(ctx).mention = null;
    clearAuto(ctx);
    if (takeOf(ctx) === 8) popAskSelect(btn && btn.getAttribute('data-value'));
    return false;
  });
  CH('answer-multi', function (ctx, btn) {
    if (takeOf(ctx) === 8) popAskSelect(btn && btn.getAttribute('data-value'));
    return false;
  });
  CH('next-question', function (ctx) {
    qsState(ctx).reelDir = 'next';
    qsState(ctx).mention = null;
    clearAuto(ctx);
    if (takeOf(ctx) !== 8) return false;
    var q = currentQuestion(ctx);
    if (q && q.required && !hasAnswer(q)) return false;
    captureReel(ctx);
    var qs = ctx.state.questions || [];
    ctx.state.questionIndex = Math.min(qs.length - 1, (ctx.state.questionIndex | 0) + 1);
    ctx.renderApp();
    return true;
  });
  CH('prev-question', function (ctx) {
    qsState(ctx).reelDir = 'prev';
    qsState(ctx).mention = null;
    clearAuto(ctx);
    if (takeOf(ctx) !== 8) return false;
    captureReel(ctx);
    ctx.state.questionIndex = Math.max(0, (ctx.state.questionIndex | 0) - 1);
    ctx.renderApp();
    return true;
  });
  CH('skip-question', function (ctx) {
    qsState(ctx).reelDir = 'next';
    qsState(ctx).mention = null;
    clearAuto(ctx);
    if (takeOf(ctx) === 8) captureReel(ctx);
    return false;
  });

  EXT.action('close-decision', function (ctx) {
    var d = ctx.state.decision;
    if (!d || (d.type !== 'question' && d.type !== 'question-preparing' && d.type !== 'question-submitting')) return false;
    beginLeave(ctx);
    return true;
  });
  EXT.action('cancel-questionnaire', function (ctx) {
    beginLeave(ctx, function () {
      ctx.addReceipt('question-receipt', 'Questionnaire cancelled', 'The explicit cancellation is recorded. Existing answers remain in thread history.');
    }, 'close');
    return true;
  });
  EXT.action('submit-questionnaire', function (ctx) {
    var qs = ctx.state.questions || [];
    var missing = null;
    for (var i = 0; i < qs.length; i++) if (qs[i].required && !hasAnswer(qs[i])) { missing = qs[i]; break; }
    if (missing) { ctx.toast('Required answers remain', missing.prompt); return true; }
    beginLeave(ctx, function () {
      ctx.state.questionQueue = Math.max(0, (ctx.state.questionQueue | 0) - 1);
      ctx.addReceipt('question-receipt', 'Questionnaire submitted', '5 answers attached to the deployment planning context.');
    }, 'submit');
    return true;
  });

  document.addEventListener('input', function (e) {
    var t = e.target;
    if (!t || t.getAttribute('data-input') !== 'question-other') return;
    var ctx = EXT.ctx && EXT.ctx({});
    if (!ctx || !ctx.state) return;
    var q = (ctx.state.questions || [])[ctx.state.questionIndex | 0];
    if (!q) return;
    var v = t.value;
    var hadPreset = q.type === 'choice' && String(q.answer || '').trim();
    q.other = v;
    if (q.type === 'choice') q.answer = '';
    if (q.type === 'text') q.answer = v;
    if (String(v).trim()) q.otherOn = true;
    var at = v.lastIndexOf('@');
    var after = at >= 0 ? v.slice(at + 1) : '';
    var openAt = at >= 0 && !/\s/.test(after);
    var st = qsState(ctx);
    var was = !!(st.mention && st.mention.open);
    if (openAt) st.mention = { open: true, query: after };
    else st.mention = null;
    if (openAt || was || hadPreset) ctx.renderApp();
  });

  document.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    var ctx = EXT.ctx && EXT.ctx({});
    if (!ctx || !ctx.state || !ctx.state.decision || ctx.state.decision.type !== 'question') return;
    var el = e.target;
    if (el && el.closest && el.closest('input, textarea, select, [contenteditable="true"], .dialog, .overlay-menu')) return;
    var k = e.key;
    if (k < '1' || k > '5') return;
    var n = k.charCodeAt(0) - 48;
    var opts = document.querySelectorAll('.decision-host [data-action="answer-choice"], .decision-host [data-action="answer-multi"]');
    var other = document.querySelector('.decision-host [data-input="question-other"]');
    var otherN = opts.length + 1;
    if (n >= 1 && n <= opts.length) {
      var btn = opts[n - 1];
      if (btn) { e.preventDefault(); btn.click(); }
      return;
    }
    if (n === otherN && other) {
      e.preventDefault();
      var otherMark = document.querySelector('.qs-ask-mark[data-action="qs-select-other"]');
      if (otherMark) otherMark.click();
      else other.focus();
    }
  });

  function cssVar(name, fallback) {
    var v = '';
    try { v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); } catch (e) {}
    return v || fallback;
  }
  function morphEaseOut() { return cssVar('--pm-ease-pop', 'cubic-bezier(.22,.80,.28,1)'); }
  function morphEaseIn() { return cssVar('--pm-ease-in', 'cubic-bezier(.55,.06,.68,.19)'); }
  function innerSurface(shell) {
    return shell.querySelector('.qs-ask, .qs-card, .qs-sheet, .qs-inspector, .qs-morph, .qs-seq, .qs-tech, .qs-stack, .qs-split, .qs');
  }
  function pillFace(label, extraClass) {
    var face = document.createElement('div');
    face.className = 'qs-pill-beat qs-morph-face' + (extraClass ? ' ' + extraClass : '');
    face.innerHTML = '<span class="qs-pill-label"></span>' + orreryHtml();
    face.querySelector('.qs-pill-label').textContent = label;
    return face;
  }
  function setAskDock(shell) {
    var stage = document.querySelector('.chat-stage');
    if (!stage || !shell) return;
    var host = document.querySelector('.decision-host');
    var h = (host && !host.classList.contains('empty'))
      ? host.getBoundingClientRect().height
      : shell.getBoundingClientRect().height;
    if (!(h > 0)) h = 44;
    stage.style.setProperty('--decision-h', Math.round(h) + 'px');
  }
  function trackAskDock(shell, flag, ms) {
    var start = performance.now();
    var limit = ms || 800;
    function tick() {
      setAskDock(shell);
      if (shell[flag] && performance.now() - start < limit) requestAnimationFrame(tick);
      else setAskDock(shell);
    }
    requestAnimationFrame(tick);
  }
  function cancelAnims(el) {
    if (!el || !el.getAnimations) return;
    el.getAnimations().forEach(function (a) {
      try { a.cancel(); } catch (e0) {}
    });
  }
  function playAnim(el, frames, opts, then) {
    if (!el || !el.animate) { if (then) then(); return null; }
    var a = el.animate(frames, opts);
    var once = false;
    var end = function () {
      if (once) return;
      once = true;
      if (then) then(a);
    };
    if (a.finished) a.finished.then(end, end);
    else {
      a.onfinish = end;
      a.oncancel = end;
      setTimeout(end, (opts && opts.duration ? opts.duration : 0) + 80);
    }
    return a;
  }
  function playOpen(shell) {
    if (!shell || shell.__qsOpening) return;
    var ctx = window.PM56_EXT && window.PM56_EXT.ctx && window.PM56_EXT.ctx({});
    var st = ctx && qsState(ctx);
    if (reduceMotion() || !shell.animate) {
      shell.classList.remove('qs-will-open');
      if (st) st.morphPlayed = true;
      return;
    }
    shell.__qsOpening = true;
    shell.__qsOpened = false;
    if (st) st.morphPlayed = true;
    var inner = innerSurface(shell);
    shell.classList.add('qs-measure');
    shell.style.height = 'auto';
    shell.style.overflow = 'visible';
    void shell.offsetHeight;
    var target = Math.max(
      inner ? Math.round(inner.getBoundingClientRect().height) : 0,
      inner ? inner.scrollHeight : 0,
      shell.scrollHeight,
      140
    );
    shell.classList.remove('qs-measure');
    shell.style.height = '44px';
    shell.style.overflow = 'hidden';
    var peak = Math.round(target * 1.065);
    var dip = Math.round(target * 0.985);
    var ease = morphEaseOut();
    shell.classList.add('qs-opening');
    shell.style.position = 'relative';
    shell.style.overflow = 'hidden';
    shell.style.borderRadius = '999px';
    shell.style.transformOrigin = '50% 100%';
    if (inner) {
      inner.style.filter = 'blur(18px)';
      inner.style.transformOrigin = '50% 100%';
    }
    var face = pillFace('Preparing questions…', 'qs-open-face');
    shell.appendChild(face);
    void shell.offsetHeight;
    shell.classList.remove('qs-will-open');
    setAskDock(shell);
    requestAnimationFrame(snapSpineThumb);
    trackAskDock(shell, '__qsOpening', 520);
    function finishOpen() {
      if (shell.__qsOpened) return;
      shell.__qsOpened = true;
      cancelAnims(inner);
      cancelAnims(shell);
      if (face) cancelAnims(face);
      if (inner) {
        inner.style.filter = '';
        inner.style.transform = '';
        inner.style.transformOrigin = '';
      }
      if (face && face.parentNode) face.parentNode.removeChild(face);
      shell.classList.remove('qs-will-open', 'qs-opening');
      shell.style.height = '';
      shell.style.borderRadius = '';
      shell.style.overflow = '';
      shell.style.position = '';
      shell.style.transform = '';
      shell.style.transformOrigin = '';
      shell.__qsH = target;
      shell.__qsOpening = false;
      setAskDock(shell);
      snapSpineThumb();
    }
    setTimeout(finishOpen, 560);
    playAnim(shell, [
      { height: '44px', borderRadius: '999px', transform: 'scaleY(1)' },
      { height: '50px', borderRadius: '999px', transform: 'scaleY(1.04)' }
    ], { duration: 100, easing: ease, fill: 'forwards' }, function () {
      if (shell.__qsOpened) return;
      playAnim(shell, [
        { height: '50px', borderRadius: '999px', transform: 'scaleY(1.04)' },
        { height: peak + 'px', borderRadius: '22px', transform: 'scaleY(1)' }
      ], { duration: 180, easing: ease, fill: 'forwards' }, function () {
        if (shell.__qsOpened) return;
        playAnim(shell, [
          { height: peak + 'px', borderRadius: '22px', transform: 'scaleY(1)' },
          { height: dip + 'px', borderRadius: '22px', transform: 'scaleY(1)', offset: 0.55 },
          { height: target + 'px', borderRadius: '22px', transform: 'none' }
        ], { duration: 90, easing: ease, fill: 'forwards' }, finishOpen);
      });
      if (face) {
        playAnim(face, [
          { opacity: 1, filter: 'blur(0px)' },
          { opacity: 0, filter: 'blur(20px)' }
        ], { duration: 90, fill: 'forwards', easing: ease });
      }
      if (inner) {
        playAnim(inner, [
          { filter: 'blur(18px)', transform: 'scaleY(0.88)' },
          { filter: 'blur(20px)', transform: 'scaleY(1.08)', offset: 0.62 },
          { filter: 'none', transform: 'none' }
        ], { duration: 270, easing: ease, fill: 'forwards' });
      }
    });
  }
  function playClose(shell, kind, done) {
    if (!shell || !shell.animate) { if (done) done(); return; }
    var h = Math.max(shell.getBoundingClientRect().height, 44);
    var take = shell.getAttribute('data-take');
    var radius = take === '8' ? '22px' : (getComputedStyle(innerSurface(shell) || shell).borderRadius || '22px');
    var ease = morphEaseOut();
    var finished = false;
    function finishClose() {
      if (finished) return;
      finished = true;
      shell.__qsClosing = false;
      if (done) done();
    }
    shell.classList.add('qs-morphing', 'qs-closing');
    shell.__qsClosing = true;
    shell.style.position = 'relative';
    shell.style.overflow = 'hidden';
    shell.style.height = h + 'px';
    shell.style.minHeight = '0';
    shell.style.transformOrigin = '50% 100%';
    var inner = innerSurface(shell);
    if (inner) {
      inner.style.transformOrigin = '50% 100%';
      inner.style.minHeight = '0';
    }
    void shell.offsetHeight;
    trackAskDock(shell, '__qsClosing', 1200);
    var face = null;
    if (kind === 'submit') {
      face = pillFace('Submitting answers…', 'qs-open-face');
      shell.appendChild(face);
    }
    playAnim(shell, [
      { height: h + 'px', borderRadius: radius, transform: 'scaleY(1)' },
      { height: h + 'px', borderRadius: radius, transform: 'scaleY(1.04)' }
    ], { duration: 90, easing: ease, fill: 'forwards' }, function () {
      if (finished) return;
      playAnim(shell, [
        { height: h + 'px', borderRadius: radius, transform: 'scaleY(1.04)' },
        { height: '50px', borderRadius: '999px', transform: 'scaleY(1)' }
      ], { duration: 180, easing: ease, fill: 'forwards' }, function () {
        if (finished) return;
        playAnim(shell, [
          { height: '50px', borderRadius: '999px', transform: 'scaleY(1)' },
          { height: '44px', borderRadius: '999px', transform: 'scaleY(1)' }
        ], { duration: 90, easing: ease, fill: 'forwards' }, function (settle) {
          if (finished) return;
          try { if (settle && settle.commitStyles) settle.commitStyles(); } catch (e) {}
          shell.style.height = '44px';
          shell.style.borderRadius = '999px';
          shell.style.transform = 'none';
          setAskDock(shell);
          setTimeout(function () {
            if (finished) return;
            playAnim(shell, [
              { transform: 'translateY(0) scaleY(1)', opacity: 1, filter: 'blur(0px)' },
              { transform: 'translateY(40px) scaleY(0.88)', opacity: 0, filter: 'blur(8px)' }
            ], { duration: kind === 'submit' ? 220 : 140, easing: morphEaseIn(), fill: 'forwards' }, finishClose);
          }, kind === 'submit' ? 300 : 0);
        });
      });
    });
    if (inner) {
      playAnim(inner, [
        { filter: 'blur(0px)', opacity: 1, transform: 'scaleY(1)' },
        { filter: 'blur(8px)', opacity: 1, transform: 'scaleY(1.08)', offset: 0.25 },
        { filter: 'blur(18px)', opacity: 0, transform: 'scaleY(0.88)' }
      ], { duration: 270, easing: ease, fill: 'forwards' });
    }
    if (face) {
      playAnim(face, [
        { opacity: 0, filter: 'blur(16px)' },
        { opacity: 0, filter: 'blur(16px)', offset: 0.33 },
        { opacity: 1, filter: 'blur(0px)' }
      ], { duration: 270, fill: 'forwards', easing: ease });
    }
  }
  function springHeight(shell) {
    if (!shell || shell.__qsOpening || shell.__qsClosing) return;
    if (shell.classList.contains('qs-will-open') || shell.classList.contains('qs-morphing')) return;
    if (reduceMotion() || !shell.animate) return;
    if (shell.getAttribute('data-take') !== '8') return;
    var inner = innerSurface(shell);
    var next = Math.max(inner ? inner.offsetHeight : 0, 44);
    var prev = shell.__qsH;
    if (shell.__qsSpringing) {
      prev = Math.round(shell.getBoundingClientRect().height) || prev;
      shell.getAnimations().forEach(function (a) { try { a.cancel(); } catch (e0) {} });
    }
    if (!prev) { shell.__qsH = next; return; }
    if (Math.abs(next - prev) < 6) {
      shell.__qsH = next;
      return;
    }
    shell.__qsSpringing = true;
    shell.style.height = prev + 'px';
    void shell.offsetHeight;
    trackAskDock(shell, '__qsSpringing', 420);
    var delta = Math.abs(next - prev);
    var pop = Math.round(next + (delta > 24 ? Math.max(6, delta * 0.05) : 0));
    var anim = shell.animate([
      { height: prev + 'px' },
      { height: pop + 'px', offset: 0.62 },
      { height: next + 'px' }
    ], { duration: 320, easing: morphEaseOut(), fill: 'forwards' });
    anim.onfinish = function () {
      try { if (anim.commitStyles) anim.commitStyles(); } catch (e) {}
      try { anim.cancel(); } catch (e2) {}
      shell.style.height = '';
      shell.style.overflow = '';
      shell.__qsH = next;
      shell.__qsSpringing = false;
      setAskDock(shell);
    };
  }
  function spineThumbTop(spine, thumb) {
    var cur = spine.querySelector('.qs-spine-slot.is-current') || spine.querySelector('.qs-spine-slot');
    if (!cur) return 0;
    var sr = cur.getBoundingClientRect();
    var pr = spine.getBoundingClientRect();
    var th = thumb ? thumb.offsetHeight : 16;
    return sr.top - pr.top + (sr.height - th) / 2;
  }
  function snapSpineThumb() {
    var spine = document.querySelector('.qs-spine');
    var thumb = spine && spine.querySelector('.qs-spine-thumb');
    if (!spine || !thumb) return;
    thumb.style.top = Math.round(spineThumbTop(spine, thumb)) + 'px';
    thumb.style.transform = '';
  }
  function springSpineThumb(jump) {
    var spine = document.querySelector('.qs-spine');
    var thumb = spine && spine.querySelector('.qs-spine-thumb');
    if (!spine || !thumb) return;
    var to = spineThumbTop(spine, thumb);
    var ctx = window.PM56_EXT && window.PM56_EXT.ctx && window.PM56_EXT.ctx({});
    var st = ctx && qsState(ctx);
    var from = st && st.spineFromTop;
    thumb.style.top = Math.round(to) + 'px';
    if (!jump || reduceMotion() || !thumb.animate || from == null || Math.abs(to - from) < 2) return;
    thumb.animate(
      [
        { top: from + 'px', transform: 'scale(1)' },
        { top: Math.round(from + (to - from) * 0.55) + 'px', transform: 'scale(1.28)', offset: 0.45 },
        { top: Math.round(to + (to > from ? 3 : -3)) + 'px', transform: 'scale(1.04)', offset: 0.78 },
        { top: to + 'px', transform: 'scale(1)' }
      ],
      { duration: 400, easing: morphEaseOut(), fill: 'forwards' }
    ).onfinish = function () {
      thumb.style.top = Math.round(to) + 'px';
      thumb.style.transform = '';
    };
  }
  function syncMorph() {
    var shell = document.querySelector('.decision-host .qs-shell');
    if (!shell) return;
    if (shell.classList.contains('qs-will-open') && !shell.__qsOpening) playOpen(shell);
    else {
      var ctx = window.PM56_EXT && window.PM56_EXT.ctx && window.PM56_EXT.ctx({});
      var st = ctx && qsState(ctx);
      if (st && st.needSpring) {
        st.needSpring = false;
        springHeight(shell);
      }
      if (shell.getAttribute('data-take') === '8') {
        var jump = !!(st && st.spineJump);
        if (st) st.spineJump = false;
        springSpineThumb(jump);
      }
    }
  }
  function bindMorph() {
    if (document.documentElement.__qsMorphBound) { syncMorph(); return; }
    document.documentElement.__qsMorphBound = true;
    new MutationObserver(function () { requestAnimationFrame(syncMorph); }).observe(document.documentElement, {
      childList: true, subtree: true, attributes: true, attributeFilter: ['data-phase']
    });
    requestAnimationFrame(syncMorph);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindMorph);
  else bindMorph();

  /* Published for the verification harness: a structural fingerprint that does
     not depend on reading the DOM, so a harness can cross-check what it painted
     against what the module believed it was painting. */
  window.PM56_QUESTIONS = {
    version: 1,
    takes: TAKES,
    names: TAKE_NAMES.slice(),
    model: function () {
      var ctx = window.PM56_EXT && window.PM56_EXT.ctx && window.PM56_EXT.ctx({});
      if (!ctx) return null;
      var m = buildModel(ctx);
      if (!m) return null;
      return {
        type: m.type, take: m.take, key: m.key, title: m.title,
        prompt: m.prompt, note: m.note, inputKind: m.input.kind,
        options: (m.input.options || []).map(function (o) { return o.value; }),
        evidence: m.evidence.map(function (e) { return e.label; }),
        steps: (m.steps || []).map(function (s) { return s.id + ':' + s.state; }),
        queue: m.queue.map(function (f) { return f.id + ':' + f.state; }),
        actions: m.actions.map(function (a) { return a.a; })
      };
    },
    activeFlowId: function () {
      var ctx = window.PM56_EXT && window.PM56_EXT.ctx && window.PM56_EXT.ctx({});
      var f = ctx && activeFlow(ctx);
      return f ? f.id : null;
    }
  };
})();
