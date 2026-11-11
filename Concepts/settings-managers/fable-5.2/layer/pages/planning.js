/* Settings managers, rethought (Fable 5.2): the chapter "Planning & goals".
   Today this is the plain page Planning & Interviews (34 rows) and the manager Goals & Automation (Defaults, Templates,
   Recovery, Checks), which lives in another chapter, "Memory & Automation". Here the two are one chapter that follows a
   big job from start to end: a plan is made, a Goal does the work, something may go wrong, the work is checked.
   - A Goal template has a page of its own. Edit and Export call PMConcept7's own actions; Duplicate and Delete exist
     in PMConcept7 only as items of a "More actions" menu with no action name, so they do the same thing here, on the
     same demo state.
   - Whatever a Goal takes from another page (its model, its helpers, asking before a risky step, limits, how long
     proof is kept) is shown as what it is set to, with a link to the page that owns it.
   - Every question limit is on the Plans page; Review, which checks finished work, is on "Checking the work". */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX) return;
  const ui = SMX.ui, d = SMX.d, h = SMX.h, S = SMX.sec;
  const kit = () => W.PM51, eng = () => W.PM12_KIMI;
  const DOC = W.document;

  /* ------------------------------------------------------------------ small helpers */
  const on = (v) => v === true || v === 'on' || v === 'true';
  const val = (id) => SMX.val(id);
  const word = (id, v) => { try { return String(kit().valueLabel(id, v === undefined ? val(id) : v)); } catch (e) { return String(v === undefined ? val(id) : v); } };
  const and = (list) => (list.length < 2 ? list.join('') : `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`);
  const count = d.plural;
  const toggle = (onNow, o) => { try { return kit().toggle(onNow, o); } catch (e) { return ''; } };
  const select = (value, options, o) => { try { return kit().dropdown(value, options, o); } catch (e) { return ''; } };
  const srows = (list) => { try { return kit().scoped.rows(list.filter(Boolean)); } catch (e) { return list.filter(Boolean).join(''); } };
  const facts = (pairs) => ui.facts(pairs.filter(Boolean));
  const enc = encodeURIComponent;
  const newId = (p) => `${p}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`;
  const write = (fn) => { const st = eng().getState(); fn(st); eng().setState(st); SMX.fresh(); SMX.soon(30); };
  const nb = (html) => `<span class="smx-nb">${html}</span>`;   // a link and the comma or full stop after it stay together
  const uncover = (page, ids) => { if (page && page.covers) for (const id of ids) delete page.covers[id]; };
  const everydayModel = () => { const v = val('ai.models.default-model'); return v ? word('ai.models.default-model', v) : 'the everyday model'; };
  const withCurrent = (list, v) => (!v || list.includes(v) ? list : [v, ...list]);
  /* rows that say what a choice owned by another page is set to; the link goes to wherever that setting is placed */
  const elsewhere = (title, help, rows) => ui.card({ cls: 'smx-things-card', title, help, body: `<div class="smx-things">${rows.filter(Boolean).map(([name, v, go, reveal]) => { const w = reveal ? SMX.where(reveal) : null; const to = w ? w.route : go; return `<div class="smx-thing is-clickable" role="button" tabindex="0" data-smx-go="${h(to)}"${reveal ? ` data-smx-reveal="${h(reveal)}"` : ''}><span class="smx-thing-copy"><span class="smx-thing-name">${h(name)}</span><span class="smx-thing-sub">${h(v)} · ${h(SMX.pageName(to))}</span></span><span class="smx-thing-end"><span class="smx-thing-go">${SMX.icon('go')}</span></span></div>`; }).join('')}</div>` });
  /* The framework's "show me that setting" centres the row with scrollIntoView, which also scrolls the app's window
     (the title bar slides out of sight and nothing brings it back). While one of this lane's pages is showing, the
     window is put back at once; the page's own scroller keeps the row in view. */
  if (!SMX.shellGuard) {
    SMX.shellGuard = true;
    W.addEventListener('scroll', (e) => {
      const t = e.target; if (t !== DOC && t !== DOC.body && t !== DOC.documentElement) return;
      if (SMX.view !== 'new' || !/^(memory|planning)(\/|$)/.test(String(SMX.route || ''))) return;
      if (DOC.body.scrollTop) DOC.body.scrollTop = 0;
      if (DOC.documentElement.scrollTop) DOC.documentElement.scrollTop = 0;
    }, true);
  }

  /* when PMConcept7's template helper makes or saves a template, the manager selects it; the page follows */
  const follow = (st, key, routeOf) => {
    const sel = ((st.pm51 || {}).sel || {})[key] || ''; const k = 'sel:' + key; const seen = SMX.local.flags[k];
    SMX.local.flags[k] = sel;
    if (seen === undefined || !sel || sel === seen) return;
    const to = routeOf(sel); if (to && to !== SMX.route) W.setTimeout(() => SMX.go(to), 0);
  };

  /* ================================================================== words
     Rows of this chapter whose own words point at a place that moved, or use PMConcept7's inner names ("goal mode",
     "the Auditor", "degraded"). Their ids, values and controls stay. */
  if (SMX.reword) SMX.reword(Object.assign({}, ...['branching.plan.quick-question-limit', 'branching.plan.standard-question-limit', 'branching.plan.thorough-question-limit', 'branching.deep-plan.thorough-question-limit', 'branching.deep-plan.exhaustive-question-limit'].map((id) => ({ [id]: { help: 'Grill Me adds its extra questions to this.' } })), {
    'branching.crew.brainstorm-question-limit': { label: 'BrainStorm', help: 'The most questions a BrainStorm may ask you before it plans.' },
    'branching.crew.grill-me-question-extension': { help: 'Added to the limits above whenever Grill Me is on.' },
    'planning.verification.goal-checkpoint-cadence': { help: 'How often a Goal saves where it is, so it can carry on from there.' },
    'planning.verification.repair-loop': { help: 'After a failed check: give up at once, try a few fixes, or keep trying.' },
    'planning.verification.repair-budget-exhaustion': { help: 'Stop the work, or finish it marked “not fully checked”.' },
    'planning.verification.goal-replan-behavior': { help: 'When a Goal makes a fresh plan: only after a failure, when the work drifts, or after every step.' },
    'planning.verification.goal-replan-events': { help: 'When you change something that matters halfway: pause and plan again, treat it as a firm rule at once, or only note it.' },
    'planning.verification.quality-preference': { help: 'One dial for how careful the checks are.' },
    'planning.verification.evidence-detail': { label: 'How much detail a Goal saves as it works', help: 'From short notes up to everything, kept for good.' }
  }));

  /* ================================================================== readers */
  const PL = 'planning.interview.', PV = 'planning.verification.';
  const Q = { Quick: 'branching.plan.quick-question-limit', Standard: 'branching.plan.standard-question-limit', Thorough: 'branching.plan.thorough-question-limit' };
  const QD = { Thorough: 'branching.deep-plan.thorough-question-limit', Exhaustive: 'branching.deep-plan.exhaustive-question-limit' };
  const G = { kind: PV + 'goal-template', write: PV + 'goal-write-mode', model: 'ai.models.goal-worker-model', checker: 'ai.models.goal-verifier-model', quality: PV + 'quality-preference', validation: PV + 'validation-pass', independent: PV + 'independent-review', receipts: PV + 'completion-receipts', receipt: PV + 'receipt-type', reports: PV + 'report-visibility', risky: 'safety.approvals.boundary-enforcement', crews: 'branching.crew.crew-enabled', helpers: 'branching.subagents.enable-subagents' };
  const goals = (st) => ((st.pm51 || {}).goals) || {};
  const defaults = (st) => goals(st).defaults || {};
  const verification = (st) => goals(st).verification || {};
  const templates = (st) => st.goalTemplates || [];
  /* PMConcept7 gives each example template its kind of job and its checks the first time the Goals manager draws;
     before that the same facts are read from the fields they are made from */
  const KIND_OF = { implementation: 'feature_build', audit: 'audit_and_repair', research: 'repo_research' };
  const QUALITY_OF = { Thorough: 'thorough', Standard: 'balanced', Fast: 'fast', Balanced: 'balanced' };
  const QUALITY = { fast: ['Faster', 'Light checks. Good for small, low-risk jobs.'], balanced: ['Balanced', 'The usual tests and one review.'], thorough: ['More thorough', 'Every check, an independent review, and proof kept.'] };
  const KIND_ICON = { feature_build: 'rocket', bug_fix: 'alert', test_until_pass: 'test', refactor: 'wand', migration: 'route', audit_and_repair: 'shield', repo_research: 'search', doc_update: 'file', ledger_to_plan_transfer: 'list', governance_seal: 'lock' };
  const PHASE_HELP = {
    Understand: 'Read the request, the plan, and the constraints.', Plan: 'Break the work into steps with owners and checks.', Build: 'Do the work, handing bounded tasks to helpers when useful.', Verify: 'Run the tests and reviews the template asks for.', Deliver: 'Package clean files and report honestly.',
    Inventory: 'List what exists before judging it.', Audit: 'Compare the implementation with what was promised.', Repair: 'Fix what the audit found.', 'Re-audit': 'Check the repairs with fresh eyes.', Certify: 'Record what was verified and how.',
    Frame: 'Agree on the question and what a good answer looks like.', Research: 'Gather current, primary sources.', Compare: 'Weigh the options against each other.', Decide: 'Record the decision and why.'
  };
  const kindOf = (t) => (t.props && t.props[G.kind]) || KIND_OF[t.id] || '';
  const kindLabel = (v) => (v ? word(G.kind, v) : 'Kind of job not set');
  const qualityOf = (t) => (QUALITY[t.quality] ? t.quality : QUALITY_OF[t.verification] || 'balanced');
  const tplRoute = (id) => `planning/goals/${enc(id)}`;
  const crewsOn = () => on(val(G.crews));
  const helpersWord = () => (!on(val(G.helpers)) ? 'Off' : on(val('branching.subagents.parallel-subagents')) ? `On, up to ${Number(val('branching.subagents.max-parallel')) || 4} at once` : 'On, taking turns');
  const planQuestions = () => Number(val(Q[String(val(PL + 'plan-default-depth'))] || Q.Standard)) || 0;
  const deepQuestions = () => { const v = String(val(PL + 'deep-plan-default-depth')); return Number(val(QD[v] || 'branching.crew.brainstorm-question-limit')) || 0; };
  const steps = (list) => { try { return kit().steps(list); } catch (e) { return ''; } };

  /* ================================================================== Plans (the chapter's first page) */
  const pathStep = (n, name, text, go, o = {}) => `<button type="button" class="smx-path-step" data-smx-go="${h(go)}"${o.reveal ? ` data-smx-reveal="${h(o.reveal)}"` : ''}${o.anchor ? ` data-smx-anchor-to="${h(o.anchor)}"` : ''}><span class="smx-path-n">${n}</span><span class="smx-path-name">${h(name)}</span><span class="smx-path-text">${h(text)}</span></button>`;
  const pathArrow = `<span class="smx-path-arrow" aria-hidden="true">${SMX.icon('arrowRight')}</span>`;
  SMX.extend('planning', {
    purpose: 'Before it builds, the assistant can write a plan and ask you about it. A Goal is a big job it then keeps working on by itself.',
    keywords: ['plan', 'deep plan', 'wizard', 'interview', 'grill me', 'questions', 'topics', 'requirements', 'goal'],
    lead: (ctx) => {
      const st = ctx.st; const dd = defaults(st); const v = verification(st);
      const deep = String(val(PL + 'deep-plan-default-depth')); const offered = on(val(PL + 'recommend-wizard'));
      const topics = Array.isArray(val(PL + 'builder-topics')) ? val(PL + 'builder-topics').length : 0;
      return [
        { key: 'summary', html: ui.summary({ icon: 'map', tone: 'ready', lines: [
          `A new plan is ${ui.b(word(PL + 'plan-default-depth'))}: it may ask you up to ${ui.b(count(planQuestions(), 'question'))} before it writes. A Deep Plan is ${ui.b(word(PL + 'deep-plan-default-depth'))} and may ask up to ${ui.b(String(deepQuestions()))}${/brainstorm/i.test(deep) ? ', with several personas debating the answer' : ''}.`,
          `${offered ? `For a big request the assistant offers the ${ui.b('Planning Wizard')}, which interviews you about ${count(topics, 'topic')} first.` : 'The Planning Wizard is not offered by itself; you can still ask for it.'} A finished plan can be handed on as a ${nb(ui.word('Goal', { go: 'planning/goals' }) + ',')} which then does the work.`
        ] }) },
        { key: 'path', html: `<section class="smx-path" aria-label="How a big job goes">${pathStep(1, 'A plan is made', `${word(PL + 'plan-default-depth')} · up to ${count(planQuestions(), 'question')}`, 'planning', { reveal: PL + 'plan-default-depth' })}${pathArrow}${pathStep(2, 'You look it over', on(val(PL + 'auto-open-deep-plan')) ? 'A Deep Plan opens for you to read and mark up' : 'Work starts without a review', 'planning', { reveal: PL + 'auto-open-deep-plan' })}${pathArrow}${pathStep(3, 'A Goal does the work', `Starts with ${dd.persona || 'Assistant'}${crewsOn() && dd.crew ? ` and ${dd.crew}` : ''} · ${count(templates(st).length, 'template')}`, 'planning/goals')}${pathArrow}${pathStep(4, 'The work is checked', `${word(G.quality)} checks · ${v.confirm ? 'you confirm at the end' : 'no final confirmation'}`, 'planning/proof')}</section><p class="smx-path-also">If a Goal is interrupted or a check fails, it saves its progress and tries to recover: ${ui.link({ label: 'When something goes wrong', go: 'planning/recovery' })}</p>` }
      ];
    },
    sections: [
      { key: 'plans', title: 'Plan and Deep Plan', help: 'A plan is quick. A Deep Plan looks harder and asks you more before anything is built.', ids: [PL + 'plan-default-depth', PL + 'deep-plan-default-depth', PL + 'auto-open-deep-plan', PL + 'plan-panel-sticky'] },
      { key: 'wizard', title: 'The Planning Wizard', help: 'For a big request the wizard interviews you first, so nothing is missed.', ids: [PL + 'recommend-wizard', PL + 'workflow-style', PL + 'plan-thoroughness', PL + 'web-research-mode'] },
      { key: 'checklist', title: 'Big jobs without a plan', help: 'When you did not ask for a plan and the job has many steps, the assistant writes its own checklist first, so that no step is dropped.', ids: ['planning.interview.todo-auto-use'] },
    ],
    more: [
      { key: 'questions', title: 'How many questions a plan may ask', help: 'The most each kind of plan may ask you before it writes. When Grill Me is on, its extra questions are added to the limit.', ids: [Q.Quick, Q.Standard, Q.Thorough, QD.Thorough, QD.Exhaustive, 'branching.crew.brainstorm-question-limit', 'branching.crew.grill-me-question-extension', PL + 'deep-plan-grill-me'] },
      { key: 'wizard-more', title: 'How the wizard talks to you', ids: [PL + 'prompting-style', PL + 'require-arch-confirmation'] },
      { key: 'topics', title: 'Topics the interview covers', help: 'A skipped topic is faster, but the plan guesses more.', ids: [PL + 'builder-topics', PL + 'topic-depth', PL + 'scope-probe-questions', PL + 'min-questions-per-topic', PL + 'max-questions-per-topic'] },
      { key: 'helpers', title: 'Who helps with a plan', help: 'Which personas ask, draft and review, and who reads the pictures you attach. Reading pictures follows AI providers › Pictures, voice & video unless you choose here.', ids: [PL + 'builder-persona-mode', PL + 'builder-intake-persona', PL + 'builder-drafting-persona', PL + 'builder-review-personas', PL + 'vision-provider', PL + 'prefer-gemini-gui'] },
      { key: 'files', title: 'Files and formats', help: 'What you may attach, and the format of what comes out.', ids: [PL + 'requirements-max-files', PL + 'requirements-max-file-size', PL + 'output-format', PL + 'plan-default-export'] }
    ],
    moreLabel: 'Questions, topics, helpers and files', moreHelp: 'How many questions a plan may ask, what the interview covers, and who helps',
    expert: [
      { key: 'overrides', title: 'Expert overrides', help: 'Fine-grained wizard overrides. Most people never need these.', ids: [PL + 'builder-preferences'] },
      S('plan-session', { title: 'Only for the wizard session that is open', help: 'One-time choices the wizard normally asks you itself. They are kept here so nothing is lost; changing them outside a session changes nothing you can see.', ids: [PL + 'wizard-intent', PL + 'wizard-project-path', PL + 'topic-checklist', PL + 'run-all-topics', PL + 'requirements-upload-order'] })
    ],
    changes: [
      { was: 'Planning & Interviews is a plain page of 34 rows: 20 shown at equal weight under four headings, 14 more under “More options”. Goals & Automation, which a plan hands over to, is in another chapter (“Memory & Automation”).', now: 'One chapter. It opens with two sentences that say how deep a plan goes and how many questions it may ask, then a picture of the four steps of a big job; each step opens the page that sets it. Eight rows follow in two groups.' },
      { was: 'Question limits are in two managers: five on this page under “More options”, and “Questions it may ask you” (BrainStorm) and “Extra questions in Grill Me” on Personas & Crews › Group work. Each of the five says “Grill Me adds more (set in Personas › Crews)”, which names a tab that does not hold it.', now: 'All seven limits and “Start Deep Plans with Grill Me” are one group here, first under More options. The five rows now say that Grill Me adds its extra questions to them, and the BrainStorm limit is named “BrainStorm”.' },
      { was: '“This wizard session only” (5 rows such as “What kind of project (this session)”) sits under “More options” among lasting settings; the page itself says the wizard normally asks them.', now: 'They are kept, under For experts, with a line saying they belong to one session of the wizard.' },
      { was: '“Who reads pictures and screenshots” is a second picker for a choice Media & Output already owns (“Media & Vision has the app-wide choice; this one is for planning”).', now: 'The row is kept as planning’s exception, folded under “Who helps with a plan”, and its group says which page owns the choice.' }
    ]
  });

  /* ================================================================== Goals */
  SMX.act('template-duplicate', (el) => {
    const id = el.getAttribute('data-id'); const nid = newId('template'); let name = '';
    write((st) => { const t = templates(st).find((x) => x.id === id); if (!t) return; const copy = JSON.parse(JSON.stringify(t)); copy.id = nid; copy.name = `${t.name} copy`; copy.props = Object.assign({}, t.props || {}, { [G.kind]: kindOf(t) }); copy.quality = qualityOf(t); name = copy.name; st.goalTemplates.push(copy); });
    if (name) { SMX.toast('Template duplicated', name); SMX.go(tplRoute(nid)); }
  });
  SMX.act('template-delete', (el) => {
    const t = templates(eng().getState()).find((x) => x.id === el.getAttribute('data-id')); if (!t) return;
    kit().confirm(`Delete “${t.name}”?`, 'Goals already started from it are not affected.', 'Delete', () => {
      write((st) => { st.goalTemplates = templates(st).filter((x) => x.id !== t.id); });
      SMX.toast('Template deleted', t.name, 'warning'); SMX.go('planning/goals', { replace: true });
    }, true);
  });
  SMX.extend('planning/goals', {
    purpose: 'A Goal is a big job the assistant keeps working on by itself, phase by phase, until it is checked and done. This page sets what a new Goal starts with.',
    blurb: (ctx) => `A new Goal starts with ${defaults(ctx.st).persona || 'Assistant'} · ${count(templates(ctx.st).length, 'template')}`,
    status: () => ({ text: word(G.write), tone: 'info' }),
    keywords: ['goal', 'goals', 'autonomous', 'template', 'schedule', 'scheduled', 'phases', 'default persona', 'default crew'],
    lead: (ctx) => {
      const st = ctx.st; const dd = defaults(st); const list = templates(st); const personas = (st.personas || []).map((p) => p.name), crews = (st.crews || []).map((c) => c.name);
      follow(st, 'goals', (id) => (list.some((t) => t.id === id) ? tplRoute(id) : ''));
      const crewNow = crews.find((n) => n.toLowerCase() === String(dd.crew || '').toLowerCase()) || dd.crew || '';
      const ownModel = !/^same as/i.test(word(G.model));
      return [
        { key: 'summary', html: ui.summary({ icon: 'target', tone: 'ready', lines: [
          `A new Goal starts with ${ui.b(dd.persona || 'Assistant')}${crewsOn() && crewNow ? `, who can call on ${ui.b(crewNow)}` : ''}. What it may change is set to ${ui.b(word(G.write))}.`,
          `You start a Goal in a chat, or the Planning Wizard hands one over when a plan is ready. You watch it, pause it and stop it there too; nothing on this page starts one.`
        ] }) },
        { key: 'templates', html: ui.things({ title: 'Goal templates', help: 'A template is a ready-made recipe for a Goal: the kind of job, who does it, its phases and how carefully it checks. You pick one when you start a Goal.',
          items: list.map((t) => ({ icon: KIND_ICON[kindOf(t)] || 'rocket', name: t.name, tag: kindLabel(kindOf(t)), sub: t.description || '', sub2: `${count((t.phases || []).length, 'phase')} · done by ${t.persona} · ${QUALITY[qualityOf(t)][0].toLowerCase()} checks`, go: tplRoute(t.id) })),
          empty: { icon: 'target', title: 'No templates yet', text: 'Make one for a job you will ask for again. Then pick it when you start a Goal in a chat.', fix: { label: 'New template', action: 'pm51-goals-template-new' } } }) },
        { key: 'tasks', html: ui.tasks([
          { icon: 'plus', title: 'Make a template', sub: 'Five guided steps: name, kind of job, who, its phases, its checks', action: 'pm51-goals-template-new' },
          { icon: 'restore', title: 'Choose what happens when it gets stuck', sub: 'Saving progress, fixing a failed check', go: 'planning/recovery' },
          { icon: 'check', title: 'Choose how the work is checked', sub: 'Tests, reviews and the receipt', go: 'planning/proof' }
        ], { title: 'What do you want to do?', cols: 3 }) },
        { key: 'starts', html: ui.card({ anchor: 'starts', title: 'A new Goal starts with', help: 'A template can change any of these for the Goals started from it.', body: ui.rows([
          { label: 'Persona', help: 'Who does the work.', control: select(dd.persona, withCurrent(personas, dd.persona), { action: 'pm51-goals-default', data: { key: 'persona' }, label: 'Default persona' }) },
          { label: 'Crew', help: crewsOn() ? 'The team the persona can call on.' : 'The team the persona can call on. Crews are turned off, so this waits until you turn them on.', control: select(crewNow, withCurrent(crews, crewNow), { action: 'pm51-goals-default', data: { key: 'crew' }, label: 'Default crew' }) }
        ]) + srows([ui.setting(G.write)]) }) },
        { key: 'elsewhere', html: elsewhere('Decided on other pages', 'A Goal follows the same choices as everything else. Each has one home; here is what it is set to.', [
          ['The model that does the work', ownModel ? `${word(G.model)}, in place of the everyday model` : `The everyday model, ${everydayModel()}`, 'ai/models', G.model],
          ['The model that checks the work', /^same as/i.test(word(G.checker)) ? `The everyday model, ${everydayModel()}` : word(G.checker), 'ai/models', G.checker],
          ['Helpers', helpersWord(), 'memory/helpers', ''],
          ['Whether crews are used at all', crewsOn() ? 'They are' : 'Crews are turned off', 'memory/crews', G.crews],
          ['Before a risky step: deleting files, sending changes, paid access', on(val(G.risky)) ? 'It asks you first' : 'It does not ask first', 'safety/asking', G.risky],
          ['How long and how much one Goal may use', 'Limits for one run', 'safety/limits', 'memory.limits.goal-token-budget'],
          ['How a running Goal is drawn in a chat', 'Progress of long work', 'assistant/view', 'general.interaction.run-graph-mode']
        ]) }
      ];
    },
    sections: [
      { key: 'watch', title: 'Keeping an eye on a running Goal', help: 'How stuck work is spotted, and how you hear about it.', ids: [PV + 'true-blocker-escalation', PV + 'blocker-detail', PV + 'stall-detection'] }
    ],
    more: [
      { key: 'watch-more', title: 'Checking in', ids: [PV + 'heartbeat-interval', PV + 'cloud-local-display'] },
      S('goals-scheduling', { title: 'Goals that run on a schedule', help: 'What happens around the hours a Goal is allowed to run.', ids: ['safety.approvals.schedule-missed-policy', 'safety.approvals.schedule-grace-minutes', 'safety.approvals.schedule-wind-down-minutes', 'safety.approvals.schedule-resume-next-window', 'safety.approvals.schedule-dst-policy'] }),
      { key: 'library', html: () => ui.card({ title: 'Phases a template can use', help: 'The phase library. A template picks from these, in its own order, and can add phases of its own.', body: steps(Object.keys(PHASE_HELP).map((p) => ({ title: p, desc: PHASE_HELP[p] }))) }), count: 0 }
    ],
    moreLabel: 'Schedules, checking in and the phase library', moreHelp: 'Less common choices',
    expert: [{ key: 'wins', html: () => ui.card({ title: 'Which choice wins', body: facts([['Order', 'The template, then the persona, then this page, then the AI provider’s own default'], ['If the chosen model is not available', 'The named fallback is used, and the Goal’s summary says so'], ['Where models are chosen', 'AI providers › Which model does what']]) }), count: 0 }],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'How Goals work', action: 'pm51-goals-help' }, { label: 'Put the Goal defaults back to how they came', action: 'pm51-goals-reset' }]) }],
    covers: { [G.write]: 'The third row of “A new Goal starts with” on this page.', [G.kind]: 'On each Goal template’s own page: “Kind of job”.' },
    changes: [
      { was: 'Goals & Automation is a manager of 4 tabs in the chapter “Memory & Automation”. Its first tab, Defaults, is 17 rows: scheduled runs and how the progress graph is drawn come before a newcomer has seen what a Goal is.', now: 'It is three pages of “Planning & goals”. This one says in two sentences who a new Goal starts with and where a Goal is started, then lists the templates, then three rows of defaults. Schedules are folded; the progress graph moved to Chat & assistant › What the chat shows.' },
      { was: 'Templates is a list beside a detail pane; Duplicate, Export and Delete are items of a “More actions” menu, and the 14 phases a template can use are listed on another tab (Recovery › More options).', now: 'A template has its own page with Edit, Duplicate, Export and Delete as ordinary buttons. The phase library is folded on this page, where the templates are.' },
      { was: '“Model for Goal work — Set in AI Providers” shows the model that does the work with a “Change” link; the model that checks the work has no such row. “Helpers — Set in Personas & Crews” is a second pointer row; “Extra approval for risky steps” is a third, on another tab.', now: 'One list, “Decided on other pages”: both models, helpers, asking before a risky step, limits, and how a running Goal is drawn, each with what it is set to and a link.' },
      { was: '“Reset Goal defaults” and “How Goals work” repeat under all four tabs.', now: 'Once, at the foot of this page.' }
    ]
  });

  /* ---- one Goal template ------------------------------------------------------------------------------------------ */
  const tplOf = (ctx) => templates(ctx.st).find((t) => t.id === (ctx.params || {}).id) || null;
  SMX.page({
    id: 'planning/goals/:id', chapter: 'planning', parent: 'planning/goals',
    title: (ctx) => { const t = tplOf(ctx); return t ? t.name : 'Goal template'; },
    nav: (ctx) => { const t = tplOf(ctx); return t ? t.name : 'Goal template'; },
    purpose: (ctx) => { const t = tplOf(ctx); return t ? t.description || '' : ''; },
    legacy: [['memory', 'goals', 'templates', 'goals']],
    headSide: (ctx) => { const t = tplOf(ctx); return t ? ui.btn({ label: 'Edit', icon: 'edit', primary: true, small: false, action: 'pm51-goals-template-edit', data: { id: t.id } }) : ''; },
    lead: (ctx) => {
      const st = ctx.st; const t = tplOf(ctx);
      follow(st, 'goals', (id) => (templates(st).some((x) => x.id === id) ? tplRoute(id) : ''));
      if (!t) return [{ key: 'gone', html: ui.card({ title: 'This template is no longer there', body: ui.btn({ label: 'Back to Goals', go: 'planning/goals' }) }) }];
      const phases = t.phases || []; const q = QUALITY[qualityOf(t)]; const persona = (st.personas || []).find((p) => p.name === t.persona);
      let kindRow = ''; try { kindRow = kit().scoped.row(G.kind, kindOf(t), { scope: 'template', data: { id: t.id }, noChanged: true, help: 'What sort of job this is. It tells a Goal what “done” looks like.' }); } catch (e) { kindRow = ''; }
      return [
        { key: 'summary', html: ui.summary({ icon: KIND_ICON[kindOf(t)] || 'rocket', tone: 'ready', lines: [
          `A Goal started from ${ui.b(t.name)} goes through ${ui.b(count(phases.length, 'phase'))}, is done by ${persona ? nb(ui.word(t.persona, { go: `memory/personas/${enc(persona.id)}` }) + ',') : ui.b(t.persona || 'nobody yet') + ','} and checks its work with ${ui.b(q[0].toLowerCase())} checks.`,
          'You pick a template when you start a Goal in a chat. Changing it here does not change Goals that are already running.'
        ] }) },
        { key: 'steps', html: ui.card({ title: 'Its phases, in order', help: 'A Goal moves through these one after another.', body: steps(phases.map((p) => ({ title: p, desc: PHASE_HELP[p] || 'A phase of your own.' }))) }) },
        { key: 'choices', html: ui.card({ title: 'This template’s choices', help: 'Edit, at the top of the page, walks through all of them: name, kind of job, who, the phases and the checks.', body: srows([kindRow]) + ui.rows([
          { label: 'Who does it', help: 'The persona that does the work.', value: t.persona || 'Not chosen', control: persona ? ui.btn({ label: `Open ${persona.name}`, go: `memory/personas/${enc(persona.id)}`, ghost: true }) : '' },
          { label: 'Model', help: `Named by this template, so it is used in place of the persona’s and of the everyday model, ${everydayModel()}.`, value: t.route || 'The everyday model', control: ui.btn({ label: 'Which model does what', go: 'ai/models', ghost: true }) },
          { label: 'How carefully it checks', help: q[1], value: q[0], control: ui.btn({ label: 'Checking the work', go: 'planning/proof', ghost: true }) }
        ]) }) },
        { key: 'actions', html: `<div class="smx-btn-row">${ui.btn({ label: 'Duplicate', icon: 'copy', do: 'template-duplicate', data: { id: t.id } })}${ui.btn({ label: 'Export…', icon: 'download', action: 'pm51-goals-template-export', data: { id: t.id } })}${ui.btn({ label: 'Delete this template…', icon: 'trash', danger: true, do: 'template-delete', data: { id: t.id } })}</div>` }
      ];
    },
    more: [{ key: 'adds', when: (ctx) => !!tplOf(ctx), html: (ctx) => { const t = tplOf(ctx); if (!t) return ''; return ui.card({ title: 'What it adds to the defaults', help: 'Where a Goal started from this template differs from “A new Goal starts with”.', body: facts([['Stops to ask', (t.checkpoints || []).join(' · ') || 'As the defaults say'], ['Helpers', t.subagents || 'As the defaults say'], ['Checks', QUALITY[qualityOf(t)][0]], ['Proof it keeps', t.evidence || 'As the defaults say']]) }); }, count: 0 }],
    moreLabel: 'What it adds to the defaults', moreHelp: 'Where this template differs',
    expert: [{ key: 'tech', when: (ctx) => !!tplOf(ctx), html: (ctx) => { const t = tplOf(ctx); if (!t) return ''; return ui.card({ title: 'Technical details', body: facts([['Template id', t.id], ['Kind', kindOf(t) || 'none'], ['Phases', String((t.phases || []).length)]]) }); }, count: 0 }],
    changes: [
      { was: 'A template is a pane beside the list: “What it does”, “Kind of job” (the only row that can be changed), then “Persona”, “Model route” and “Checks” as text with no way to change them from where they are read.', now: 'A page. One sentence says what a Goal started from it does; its phases come next; then its four choices, each saying where it is changed (Edit opens the five guided steps) and which page it answers to.' },
      { was: '“Model route — Balanced coding route” is a third place a Goal’s model is named, with no word on which one wins.', now: 'The row says the template’s model is used in place of the persona’s and of the everyday model, and links to “Which model does what”.' },
      { was: 'Duplicate, Export and Delete are behind “More actions”.', now: 'Edit is the button at the top of the page; Duplicate, Export and Delete are buttons at its foot, Delete last.' }
    ]
  });

  /* ================================================================== When something goes wrong */
  const REPAIR = { 'Don’t try': 'does not try a fix', "Don't try": 'does not try a fix', 'A few tries': 'tries a few fixes', 'Keep trying': 'keeps trying fixes until it passes' };
  const STEP_IN = { Pause: 'pauses', Cancel: 'cancels the work', 'Ask me which': 'asks which you meant, pause or cancel' };
  SMX.extend('planning/recovery', {
    blurb: () => { const cadence = word(PV + 'goal-checkpoint-cadence'), repair = word(PV + 'repair-loop'); return `${/never/i.test(cadence) ? 'Does not save progress as it goes' : `Saves progress ${cadence.toLowerCase()}`} · ${(REPAIR[repair] || repair.toLowerCase()).replace(' until it passes', '')} when a check fails`; },
    status: () => (/never/i.test(word(PV + 'goal-checkpoint-cadence')) ? { text: 'Not saving progress', tone: 'attention' } : on(val(PV + 'goal-auto-resume')) ? { text: 'Picks up by itself', tone: 'ready' } : { text: 'Waits for you', tone: 'info' }),
    keywords: ['resume', 'retry', 'checkpoint', 'saved point', 'repair', 'replan', 'interrupt', 'stuck', 'roll back'],
    lead: () => {
      const cadence = word(PV + 'goal-checkpoint-cadence'); const resume = on(val(PV + 'goal-auto-resume')); const repair = word(PV + 'repair-loop');
      const tried = /few/i.test(repair) ? `; when the tries run out it ${/finish/i.test(word(PV + 'repair-budget-exhaustion')) ? 'finishes, marked “not fully checked”' : 'stops the work'}` : '';
      const never = /never/i.test(cadence);
      return [
        { key: 'summary', html: ui.summary({ icon: 'restore', tone: 'ready', lines: [
          never ? `A Goal ${ui.b('does not save its progress')} as it goes, so after a restart or a lost connection there is no saved point to pick up from.`
            : `A Goal saves its progress ${ui.b(cadence.toLowerCase())}${resume ? ` and, after a restart or a lost connection, ${ui.b('picks up where it left off')}` : `; after a restart it ${ui.b('waits for you')} to start it again`}.`,
          `When a check fails it ${ui.b(REPAIR[repair] || `follows “${repair}”`)}${tried}. If you step in, it ${ui.b(STEP_IN[word(PV + 'goal-interruption')] || word(PV + 'goal-interruption').toLowerCase())}.`
        ] }) }
      ];
    },
    sections: [
      { key: 'interrupt', title: 'If something interrupts it', help: 'A restart, a lost connection, or you stepping in.', ids: [PV + 'goal-auto-resume', PV + 'goal-checkpoint-cadence', PV + 'goal-interruption'] },
      { key: 'saved', html: () => ui.card({ title: 'What a saved point holds', help: 'A saved point is where a Goal can carry on from. It is not a backup of your files.', body: facts([['Saved', 'The phase it is on, its to-do list, its helpers, changes not yet finished, and what comes next'], ['Programs that were running', 'Noted, never assumed to have survived'], ['Passwords and keys', 'Pointed to, never stored in the saved point'], ['The same failure again and again', 'The Goal pauses instead of going round in circles']]) }) },
      { key: 'fails', title: 'When a check fails', help: 'How many times it tries a fix, and what happens then.', ids: [PV + 'repair-loop', PV + 'repair-budget-exhaustion', PV + 'degraded-mode'] },
      { key: 'mind', title: 'If the plan has to change', help: 'When a Goal rethinks its plan, and what it does when you change your mind halfway.', ids: [PV + 'goal-replan-events', PV + 'goal-replan-behavior'] }
    ],
    more: [
      { key: 'ways', title: 'How it tries to fix a failed check', help: 'The ways it may try, in order, and a fresh look after each fix.', ids: [PV + 'repair-strategies', PV + 'auditor-loop'] },
      { key: 'stop', title: 'Stopping', ids: [PV + 'interrupt-settlement'] }
    ],
    moreLabel: 'Ways to fix, and stopping cleanly', moreHelp: 'Ten ways it may try a fix, and what a stop leaves behind',
    tail: () => [
      { key: 'related', html: elsewhere('Related, but not the same', 'Four things keep something for later. Each has its own page.', [
        ['A backup', 'A copy of your work kept somewhere else, in case a computer is lost', 'keeping', ''],
        ['The history of this project', 'What happened and when, and going back to an earlier point', 'keeping/history', ''],
        ['A memory', 'A short note the assistant keeps between chats; it fades when unused', 'memory', ''],
        ['Before a risky step', on(val(G.risky)) ? 'A Goal asks you first, like everything else' : 'A Goal does not ask first', 'safety/asking', G.risky]
      ]) },
      { key: 'links', html: ui.links([{ label: 'How Goals work', action: 'pm51-goals-help' }, { label: 'Limits for one run', go: 'safety/limits' }]) }
    ],
    changes: [
      { was: 'Recovery is the third tab of Goals & Automation: 11 rows, among them “Ways to fix, in order” with 10 choices (“Patch it”, “Replan”, “Split the step”…), shown at the same weight as “Pick up where it left off”.', now: 'Two sentences say what a Goal does when it is interrupted and when a check fails. Eight rows follow in three groups; the ten ways to fix and two finer points are folded.' },
      { was: '“What a checkpoint holds”, the definition of the thing this tab is about, is under “More options” beneath a library of 14 phases.', now: 'It is a card right under “Save progress”, and says a saved point is not a backup. The phase library moved to Goals, where templates are.' },
      { was: 'Nothing tells a saved point from a backup, from the project’s history or from a memory: four managers each keep “something for later” in their own words.', now: 'A short list, “Related, but not the same”, names the other three in one line each and links to them.' },
      { was: '“Extra approval for risky steps — Goals follow the same rule as everything else, set in Permissions” is a row on this tab with a “Change” link.', now: 'The link is in the list above and on Goals › “Decided on other pages”. The choice itself stays under Safety & permissions.' }
    ]
  });

  /* ================================================================== Checking the work */
  const proofPage = SMX.extend('planning/proof', {
    purpose: 'What must be true before a Goal is called done, who reviews it, and the receipt it writes: the record of what was checked.',
    blurb: (ctx) => `${word(G.quality)} checks · ${verification(ctx.st).confirm ? 'you confirm at the end' : 'finishes without asking you'}`,
    status: () => (on(val(G.receipts)) ? { text: 'Writes a receipt', tone: 'ready' } : { text: 'No receipt', tone: 'off' }),
    keywords: ['verify', 'verification', 'receipt', 'evidence', 'proof', 'review', 'reviewers', 'code health', 'test profile', 'ask me to confirm', 'confirm', 'done'],
    lead: (ctx) => {
      const v = verification(ctx.st); const multi = String(val(PV + 'review-strategy') || '') === 'Multi-pass';
      const parts = [on(val(G.validation)) ? 'a second pass looks over the result' : '', on(val(G.independent)) ? 'someone other than the builder reviews it' : ''].filter(Boolean);
      return [
        { key: 'summary', html: ui.summary({ icon: 'check', tone: 'ready', lines: [
          `Before a Goal is called done it runs ${ui.b(word(G.quality).toLowerCase())} checks with the test profile ${ui.b(v.profile || 'none chosen')}${parts.length ? `; ${h(and(parts))}` : ''}.`,
          `${v.confirm ? `Then it ${ui.b('waits for you to confirm')}` : `It ${ui.b('finishes without waiting for you')}`}${on(val(G.receipts)) ? ` and writes a ${ui.b('receipt')}: what was checked, how, and what is left.` : '. No receipt is written.'} ${ui.word(multi ? count(Number(val(PV + 'review-reviewer-count')) || 3, 'independent reviewer') : 'One reviewer', { go: 'planning/proof', reveal: PV + 'review-strategy' })} ${multi ? 'take' : 'takes'} part in a Review.`
        ] }) }
      ];
    },
    sections: [
      { key: 'done', html: (ctx) => { const st = ctx.st; const v = verification(st); const profiles = (st.testProfiles || []).map((p) => p.name); return ui.card({ title: 'Before a Goal is called done', help: 'The checks that run in a Goal’s Verify phase.', body: srows([ui.setting(G.quality)]) + ui.rows([
        { label: 'Test profile to run', help: 'A profile is a set of tests. They are set up under Code & tools › Testing.', control: select(v.profile, withCurrent(profiles, v.profile), { action: 'pm51-goals-verification', data: { key: 'profile' }, label: 'Test profile' }) }
      ]) + srows([ui.setting(G.validation), ui.setting(G.independent)]) + ui.rows([
        { label: 'Ask me to confirm', help: 'The Goal waits for you before it is marked complete.', control: toggle(!!v.confirm, { action: 'pm51-goals-verification-toggle', data: { key: 'confirm' }, label: 'Ask me to confirm' }) }
      ]) }); } },
      { key: 'receipt', html: () => { let name = 'Receipt strength', help = ''; try { const s = kit().setting(G.receipt); name = kit().rowLabel(s); help = kit().rowHelp(s); } catch (e) { /* the plain words stand */ } return ui.card({ title: 'The receipt', help: 'A finished Goal can write down what it checked, so you do not have to take its word for it.', body: srows([ui.setting(G.receipts)]) + ui.rows([
        { label: name, help, covers: G.receipt, value: on(val(G.receipts)) ? null : 'None while receipts are off', muted: true, control: ui.btn({ label: 'What each means', icon: 'info', action: 'pm51-goals-receipts-help' }) },
        { label: 'How long proof is kept', help: 'With every other “keep for” choice, under Backups & history.', control: ui.btn({ label: 'How long things are kept', icon: 'arrowRight', go: 'keeping/cleanup', reveal: PV + 'evidence-retention-days' }) }
      ]) }); } }
    ],
    more: [
      { key: 'review', title: 'Review: who checks finished work', help: 'Independent reviewers read the work and report. A Review never fixes anything itself; fixing is a separate step.', ids: [PV + 'review-strategy', PV + 'review-reviewer-count', PV + 'review-roster', PV + 'review-blind-initial-pass', PV + 'review-peer-corroboration', PV + 'review-preserve-dissent', PV + 'review-auto-repair'] },
      S('goals-evidence', { title: 'What proof a Goal keeps', help: 'How much goes into a receipt.', ids: [PV + 'evidence-span', PV + 'source-evidence-layers', PV + 'receipt-evidence-policy', PV + 'evidence-detail'] }),
      { key: 'reports', title: 'Check reports', ids: [G.reports] },
      S('toolchain-code-gate', { title: 'Code health check', help: 'Looks for code problems before work moves on to the next step.' })
    ],
    moreLabel: 'Reviewers, proof and the code health check', moreHelp: 'Who reviews, what a receipt holds, and checks between steps',
    expert: [S('goals-verification-more', { title: 'Stricter proof', help: 'Fine-tune how much proof counts as done. A wrong choice here can block every Goal.' })],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'How Goals work', action: 'pm51-goals-help' }, { label: 'Set up test profiles', go: 'code/testing' }, { label: 'Other group sessions: BrainStorm and Chat Room', go: 'memory/crews' }]) }],
    covers: { [G.quality]: 'The first row of “Before a Goal is called done” on this page.', [G.validation]: 'In “Before a Goal is called done” on this page.', [G.independent]: 'In “Before a Goal is called done” on this page.', [G.receipts]: 'The first row of “The receipt” on this page.', [G.receipt]: 'The row “Receipt strength” of “The receipt” on this page.' },
    changes: [
      { was: 'Checks is the fourth tab of Goals & Automation: 9 rows under “Before a Goal is called done”, 4 under “Goal evidence”, and 7 under “More options” (“Proof needed”, “Limits for background Goals”, “Checks for each kind of step — Policy defaults”).', now: 'Two sentences say what happens before a Goal is called done. Two cards follow: the five checks, and the receipt. Proof details are folded; the seven strict rows are under For experts with a warning.' },
      { was: 'Review, which checks finished work, is on Personas & Crews › Group work between BrainStorm and Chat Room; the Personas “Defaults” tab then needs a row to point back to it.', now: 'Review’s 7 rows are here, beside “Never let the builder grade its own work”. Crews & group work lists Review with a link to this page.' },
      { was: '“Check code health before work moves on” gates a Goal’s progress but is on Toolchain › Language servers.', now: 'It is here, folded, as “Code health check”.' },
      { was: '“How long proof is kept” has an “Open” link to Testing & Debug › History; “Run test profile” names profiles that are set up in a third manager.', now: 'Both rows say where the choice lives and link to it: How long things are kept, and Testing.' }
    ]
  });
  uncover(proofPage, [G.reports]);

  /* search: Goal templates by name */
  (SMX.thingSources = SMX.thingSources || []).push((st) => templates(st).map((t) => ({ title: t.name, sub: 'Planning & goals › Goals › a template', route: tplRoute(t.id) })));
})(window);
