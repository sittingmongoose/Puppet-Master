/* The Run view kind (D9; CONTRACT section 2; digest 05 section 7): Crew, Review, Chat Room and BrainStorm, and the
   evidence a review or a BrainStorm cites. One run is one tab: collab-run:<run> maps to the kind's own id
   (crew-work:, review:, room:, brainstorm:) through canonical(). Every run draws in the shared run frame
   (PMW.frames.run): title, kind mark and word, one status line, Pause / Message / More, a cast plate of drawn puppets,
   in-content tabs as text toggles with plain counts, and a 220 px aside beside the main column when the body is at
   least 900 px wide (below it otherwise). The runs live: the Crew's clock runs, the review's readers finish one by one
   and the report arrives, the Chat Room plays another round, the BrainStorm writes its plan. Nothing moves while the
   tab is hidden, and under Reduced Motion text arrives whole. Sizes key on the tab body (@container pmw-body). */

var SVGNS = 'http://www.w3.org/2000/svg';
function h(tag, attrs, kids) {
  var el = document.createElement(tag);
  if (attrs) {
    for (var k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  return add(el, kids);
}
function add(el, kids) {
  if (kids == null || kids === false) return el;
  if (Array.isArray(kids)) { for (var i = 0; i < kids.length; i++) add(el, kids[i]); return el; }
  el.appendChild(typeof kids === 'string' || typeof kids === 'number' ? document.createTextNode(String(kids)) : kids);
  return el;
}
function sv(tag, attrs, kids) {
  var el = document.createElementNS(SVGNS, tag);
  for (var k in (attrs || {})) if (attrs[k] != null) el.setAttribute(k, String(attrs[k]));
  return add(el, kids);
}
function money(v) { return '$' + Number(v).toFixed(2); }
function thousands(v) { return Number(v).toLocaleString('en-US'); }
function clock(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

/* ---- drawn marks: puppets (the seat hue is a token, so NieR inks them), state corners, chapter dots ---- */
function puppet(hue, size, you) {
  var s = sv('svg', { viewBox: '0 0 28 34', width: size || 28, height: Math.round((size || 28) * 34 / 28), class: 'pmw-run-pupsvg', 'aria-hidden': 'true' });
  if (you) add(s, [sv('circle', { cx: 14, cy: 10, r: 4.2 }), sv('path', { d: 'M5.5 31c0-6 3.8-10 8.5-10s8.5 4 8.5 10' })]);
  else add(s, [sv('path', { class: 'pmw-run-pupbar', d: 'M5 2.5h18M14 2.5v3.3' }), sv('path', { class: 'pmw-run-pupstr', d: 'M7 2.5l1.4 14M21 2.5l-1.4 14' }),
    sv('circle', { cx: 14, cy: 9.6, r: 3.8 }), sv('path', { d: 'M14 13.4v9M8.4 16.5l5.6 2.4 5.6-2.4M14 22.4l-3.6 8.6M14 22.4l3.6 8.6' })]);
  var wrap = h('span', { class: 'pmw-run-pup' + (you ? ' is-you' : ''), style: hue ? '--seat: var(--pmw-run-h' + hue + ')' : null });
  wrap.appendChild(s);
  return wrap;
}
var STATE_WORD = { working: 'working', done: 'done', needs: 'needs your OK', queued: 'waits its turn', idle: 'waiting', failed: 'failed', aside: 'set aside', reading: 'reading on their own' };
function stateMark(state, label) {
  var s = sv('svg', { viewBox: '0 0 12 12', width: 12, height: 12, class: 'pmw-run-smark is-' + state, role: label ? 'img' : null, 'aria-label': label || null, 'aria-hidden': label ? null : 'true' });
  s.appendChild(sv('circle', { class: 'pmw-run-smbg', cx: 6, cy: 6, r: 5.6 }));
  if (state === 'done') s.appendChild(sv('path', { d: 'M3.4 6.2l1.8 1.8 3.4-3.8' }));
  else if (state === 'working' || state === 'reading') s.appendChild(sv('path', { d: 'M6 2.8a3.2 3.2 0 1 1-3.2 3.2' }));
  else if (state === 'needs') s.appendChild(sv('path', { d: 'M6 3v3.4M6 8.6v.1' }));
  else if (state === 'failed') s.appendChild(sv('path', { d: 'M4 4l4 4M8 4 4 8' }));
  else if (state === 'queued') s.appendChild(sv('path', { d: 'M6 3.4V6l1.8 1.2' }));
  else if (state === 'aside') s.appendChild(sv('path', { d: 'M3.6 8.4l4.8-4.8' }));
  else s.appendChild(sv('path', { d: 'M3.8 6h4.4' }));
  return s;
}
function agreeMark(kind, label) {
  var s = sv('svg', { viewBox: '0 0 14 14', width: 14, height: 14, class: 'pmw-run-agree is-' + kind, role: 'img', 'aria-label': label });
  if (kind === 'yes') s.appendChild(sv('rect', { x: 2.5, y: 2.5, width: 9, height: 9, rx: 2 }));
  else if (kind === 'unsure') s.appendChild(sv('circle', { cx: 7, cy: 7, r: 4.5 }));
  else if (kind === 'no') s.appendChild(sv('path', { d: 'M3 11 11 3' }));
  else s.appendChild(sv('path', { d: 'M5 7h4' }));
  return s;
}
var MARKS = {
  review: '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M3.5 2.5h6l2.5 2.5v2.5M3.5 2.5v11h4M10.5 8.8a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2zM12.1 12.5l1.8 1.8"/></svg>',
  room: '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M2.5 3h7.5v5.5H6.2l-2.2 1.8V8.5H2.5zM12.2 6h1.3v5.5h-1.3v1.8l-2.2-1.8H7v-1.2"/></svg>',
  brainstorm: '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M8 14V8.5M8 8.5 3.8 4.3M8 8.5l4.2-4.2M8 8.5V2.8M3.8 4.3V2.8M12.2 4.3V2.8"/></svg>'
};

/* ---- the runs (the chat's seed runs, collaboration.js; copy kept plain, hashes and ids never shown) ---- */
var TYPES = {
  crew: { prefix: 'crew-work:', word: 'Crew', overview: 'Summary', icon: 'run', helpers: 'helpers', hub: 'a Coordinator hands out the work', promise: 'Helpers can’t do more than this chat: same tools and Skills, and it asks first.' },
  review: { prefix: 'review:', word: 'Review · Multi-Pass', overview: 'Report', icon: MARKS.review, helpers: 'reviewers', hub: 'each reads on its own', promise: 'Reviewers only read. They can’t change your files.' },
  room: { prefix: 'room:', word: 'Chat Room', overview: 'Discussion', icon: MARKS.room, helpers: 'helpers', hub: 'a Moderator calls on them', promise: 'Talking changes nothing. You pick what, if anything, to keep.' },
  brainstorm: { prefix: 'brainstorm:', word: 'BrainStorm', overview: 'How they decided', icon: MARKS.brainstorm, helpers: 'helpers', hub: 'a Coordinator hands out the work', promise: 'Helpers can’t do more than this chat: same tools and Skills, and it asks first.' }
};
var RUNS = {
  'crew-query-perf': {
    type: 'crew', title: 'Crew · Query Performance Rollout', thread: 'Query performance', clock: 134, cost: 0.34, limit: 6, limitMin: 30, tokens: [61200, 8800],
    input: { label: 'The job', text: 'Execute the accepted index-and-batching plan under a coordinator, in parallel where assignments are independent.' },
    hubSeat: { role: 'Coordinator', sub: 'Parent assistant', cost: 0.09 }, you: 'one checked result', note: '3 at a time',
    caption: 'All 3 work at once. You get one checked result.',
    people: [
      { id: 'migration', role: 'Migration Engineer', model: 'Sonnet 4.6', full: 'Claude Sonnet 4.6', persona: 'Implementer', state: 'working', doing: 'Publishing the write-amplification comparison.', cost: 0.16, agent: 'thread-agent-migration' },
      { id: 'bench', role: 'Benchmark Runner', model: 'Qwen 3.8 Coder', full: 'Qwen 3.8 Coder', persona: 'Implementer', state: 'queued', doing: 'Starts after part 1; three at a time are already working.', cost: 0.05, agent: 'thread-agent-bench' },
      { id: 'rollback', role: 'Rollback Auditor', model: 'GLM 5.2', full: 'GLM 5.2', persona: 'Reviewer', state: 'needs', doing: 'Needs your OK to restore a snapshot on a shared host.', cost: 0.04, agent: 'thread-agent-rollback',
        ask: 'Rehearsing the rollback restores a schema snapshot on a shared host. That needs your approval; this helper can’t give it to itself.' }],
    parts: [
      { title: 'Split migration 0043 into a no-transaction file', who: 'Migration Engineer', when: 'can start right away', state: 'done', doneWhen: 'A no-transaction migration file plus a green migration test run.',
        proof: 'migrations/0043_events_tenant_created.sql landed with pm:no-transaction; the migration tests are green.' },
      { title: 'Measure write amplification at 50,000 inserts', who: 'Benchmark Runner', when: 'starts after part 1', state: 'queued', doneWhen: 'A measured (not estimated) write-overhead percentage against 50,000 inserts.' },
      { title: 'Rehearse the rollback against a restored snapshot', who: 'Rollback Auditor', when: 'starts after part 1', state: 'needs', doneWhen: 'A recorded rehearsal with the restore and down-migration timings.',
        blocked: 'Rehearsing the rollback requires restoring a schema snapshot on a shared host; that needs approval this helper can’t give itself.' }],
    messages: [
      { who: 'hub', name: 'Coordinator', at: '0:12', what: 'handed out the parts', text: 'Three independent-enough assignments: split the migration, measure amplification, rehearse rollback. The last two both depend on the first; they do not depend on each other.' },
      { who: 'migration', at: '1:31', what: 'finished part 1', text: 'Migration split and merged. Test suite is green. Publishing evidence now.' },
      { who: 'rollback', at: '1:48', what: 'asked for your OK', tone: 'warn', text: 'The rollback rehearsal needs a restored snapshot on a shared host. I will not grant myself that permission, so I am asking you.' },
      { who: 'system', at: '1:49', text: 'The Rollback Auditor’s request is waiting for you. Its part is blocked, not failed, and the rest of the Crew carries on.' }]
  },
  'review-orchestrator-boundary': {
    type: 'review', title: 'Multi-Pass Review · Orchestrator Boundary Changes', thread: 'Architecture review', clock: 248, cost: 0.71, limit: 3, limitMin: 20, tokens: [96000, 12100],
    input: { label: 'Locked at Start', text: 'Your latest changes' }, hubSeat: { role: 'Adjudicator', sub: 'compares notes', cost: 0.12, plain: true }, you: 'one report',
    note: 'Screens: each reviewer reads alone.', caption: '3 reviewers read on their own, then compare notes. You get one report.', screens: true,
    snapshot: 'orchestrator-subagent-integration.md, the execution limits section, taken 5:38 PM',
    people: [
      { id: 'r1', role: 'Reviewer 1', model: 'Opus 5', full: 'Claude Opus 5', persona: 'Reviewer', state: 'reading', doing: 'Reading the locked changes.', cost: 0.26, agent: 'thread-agent-plan', at: 3 },
      { id: 'r2', role: 'Reviewer 2', model: 'GLM 5.2', full: 'GLM 5.2', persona: 'Reviewer', state: 'reading', doing: 'Reading the locked changes.', cost: 0.11, agent: 'thread-agent-orphan', at: 6 },
      { id: 'r3', role: 'Reviewer 3', model: 'Opus 5', full: 'Claude Opus 5', persona: 'Reviewer', state: 'reading', doing: 'Reading the locked changes.', cost: 0.22, agent: 'thread-agent-motion', at: 8, setAside: true }],
    findings: [
      { id: 'f1', sev: 'Critical', disp: 'Confirmed', claim: 'A nested Crew inside a Crew can ask for child concurrency that is never held to the orchestrator’s total active-agent ceiling.',
        proof: 'Reproduced: a nested request admits 6 when the ceiling is 4.', fix: 'Hold nested concurrency to the ceiling still free when it starts, not only at the top level.', votes: ['yes', 'yes', 'aside'], evidence: 'ev-1' },
      { id: 'f2', sev: 'Minor', disp: 'Unsure', claim: 'A retried child attempt does not log its own retry, only the original attempt.', proof: 'A log sample; it may come from an older build.',
        fix: 'Add the retry attempt to the child log line if it reproduces on the current changes.', votes: ['yes', 'unsure', 'aside'], evidence: 'ev-2',
        dissent: 'Reviewer 1 still holds this as a real minor finding; Reviewer 2 could not confirm it from the locked changes.' },
      { id: 'f3', sev: 'Major', disp: 'Confirmed', claim: 'The rule that ties a whole Crew to one provider is enforced but not written down anywhere a reviewer can cite.', proof: 'No section of the owner documents states it.',
        fix: 'Write the rule into the orchestrator owner document and point to it from Collaborative Workflows, section 5.5.', votes: ['none', 'yes', 'aside'], evidence: 'ev-3' }],
    messages: [
      { who: 'system', at: '0:02', text: 'Your latest changes were locked at the start. All three reviewers began at once, and none could see another’s notes.' },
      { who: 'r3', at: '3:10', what: 'set its notes aside', tone: 'warn', text: 'The file changed after I started, so I read a newer version than the others. Set my findings aside instead of mixing them in.' },
      { who: 'hub', name: 'Adjudicator', at: '4:05', what: 'compared notes', text: 'Merged 2 of 3 reports into 3 findings (one duplicate). 2 confirmed, 1 unsure with the disagreement kept, 1 set aside for reading a different version.' }]
  },
  'chatroom-onboarding': {
    type: 'room', title: 'Chat Room · Onboarding Redesign Options', thread: 'Crew and shared work', clock: 402, cost: 0.22, limit: 4, rounds: 2, maxRounds: 5, tokens: [38400, 5200],
    input: { label: 'The topic', text: 'Debate three onboarding directions before anything is written to a Plan.' },
    hubSeat: { role: 'Moderator', sub: 'Product Manager', cost: 0.06, does: 'Picks who speaks next and sums up each round.' }, you: 'pick what to keep',
    caption: 'A Moderator calls on 3 helpers, round by round. You pick what to keep.',
    people: [
      { id: 'product', role: 'Product', model: 'Sonnet 4.6', full: 'Claude Sonnet 4.6', persona: 'Product Manager', state: 'idle', doing: 'Waiting for the next round.', cost: 0.05, agent: 'thread-agent-theme' },
      { id: 'design', role: 'Design Systems', model: 'Opus 5', full: 'Claude Opus 5', persona: 'Architect', state: 'idle', doing: 'Waiting for the next round.', cost: 0.08, agent: 'thread-agent-probe' },
      { id: 'growth', role: 'Growth', model: 'Qwen 3.8 Coder', full: 'Qwen 3.8 Coder', persona: 'Implementer', state: 'idle', doing: 'Waiting for the next round.', cost: 0.03, agent: 'thread-agent-tokens' }],
    messages: [
      { who: 'you', at: '5:37 PM', text: 'Three options on the table: progressive disclosure, a guided checklist, or skip-by-default with a resume banner. Go.' },
      { who: 'product', at: '5:38 PM', text: 'Skip-by-default measures better in the first session but worse in week-two retention in every dataset I can cite. I would not default to it without a resume nudge that is louder than a banner.' },
      { who: 'design', at: '5:38 PM', text: '@Product agreed on the nudge. Progressive disclosure is the safest default from a design-systems angle: it reuses components we already have, and the guided checklist needs four new ones.' },
      { who: 'growth', at: '5:39 PM', text: 'From growth data on the last three launches, the guided checklist has the best completion rate when it is under 5 steps. I would not rule it out purely on build cost.' },
      { who: 'hub', name: 'Moderator', at: '5:40 PM', round: 2, close: true, text: 'Round 2 close: leaning progressive disclosure with a louder resume nudge, growth dissenting toward a short guided checklist. Nothing here is a Plan yet; say the word and I will promote a conclusion.' }],
    nextRounds: [
      [{ who: 'product', text: 'If the checklist stays under five steps, I can live with it as the resume nudge itself rather than a separate banner.' },
        { who: 'design', text: 'Then build the checklist from the disclosure parts we already have: four steps, no new components.' },
        { who: 'growth', text: 'That is the version I would test. Four steps, dismissible, and it comes back once on the second visit.' },
        { who: 'hub', close: true, text: 'Round 3 close: a four-step checklist built from existing parts doubles as the resume nudge. Nobody is dissenting now.' }],
      [{ who: 'growth', text: 'One risk: teams that skip it twice should never see it again. Otherwise it reads as nagging.' },
        { who: 'product', text: 'Agreed. Two skips and it stays gone; the steps live on in Help.' },
        { who: 'design', text: 'No objection. The Help entry reuses the same four step cards.' },
        { who: 'hub', close: true, text: 'Round 4 close: same direction, plus two skips and it never returns. Ready to promote whenever you are.' }],
      [{ who: 'product', text: 'Nothing new from me; the last close stands.' }, { who: 'design', text: 'Same here.' }, { who: 'growth', text: 'Same.' },
        { who: 'hub', close: true, text: 'Round 5 close, the last one: the four-step checklist stands. The room is done; promote it or let it go.' }]]
  },
  'brainstorm-provider-failover': {
    type: 'brainstorm', title: 'BrainStorm · Provider Failover Strategy', thread: 'Deep Plan', clock: 1260, cost: 2.68, limit: 14, limitMin: 45, tokens: [214000, 31500],
    input: { label: 'The question', text: 'How should the assistant switch providers when one runs out of quota?' },
    hubSeat: { role: 'Coordinator', sub: 'Claude Opus 5', cost: 0.50 }, you: 'one plan', note: 'Screens: each drafts alone; nobody sees the others’ ideas.',
    caption: '4 helpers draft alone, debate and vote. You get one plan.',
    chapters: ['Understand', 'Draft alone', 'Line up', 'Debate', 'Check facts', 'Vote', 'Write the plan'], chapter: 5,
    people: [
      { id: 'arch', role: 'Architecture', model: 'Opus 5', full: 'Claude Opus 5', persona: 'Architect', state: 'done', doing: 'Proposal in; voted for B.', cost: 0.71, agent: 'thread-agent-schema' },
      { id: 'product', role: 'Product', model: 'Sonnet 4.6', full: 'Claude Sonnet 4.6', persona: 'Product Manager', state: 'done', doing: 'Proposal in; disagrees with where the room leans.', cost: 0.44, agent: 'thread-agent-query' },
      { id: 'impl', role: 'Implementation', model: 'Qwen 3.8 Coder', full: 'Qwen 3.8 Coder', persona: 'Implementer', state: 'done', doing: 'Proposal in; voted for B.', cost: 0.38, agent: 'thread-agent-fallback' },
      { id: 'adv', role: 'Adversarial Review', model: 'GLM 5.2', full: 'GLM 5.2', persona: 'Reviewer', state: 'done', doing: 'Ruled out the fully automatic variant: it breaks one of your rules.', cost: 0.36, agent: 'thread-agent-evidence' }],
    specialists: [{ id: 'wonderer', role: 'Wonderer', model: 'Sonnet 4.6', full: 'Claude Sonnet 4.6', persona: 'Wonderer', state: 'done', doing: 'Handed 4 leads to the fact check. Doesn’t vote.', cost: 0.29, agent: 'thread-agent-test', sub: 'doesn’t vote' }],
    options: [
      { key: 'A', title: 'A failover pool Puppet Master owns', by: 'Architecture', approach: 'A failover pool with a health-checked ring per kind of work.',
        how: 'Every provider is checked every few seconds; one that fails leaves its ring until it recovers.', gains: 'One failover decision for everything; no drift between features.', costs: 'A new always-on health check to run.', tally: '1 against' },
      { key: 'B', title: 'Automatic for work, ask for personal', by: 'Product', approach: 'Automatic failover for work accounts; explicit confirmation before any personal-account spend.',
        how: 'A policy switch per account; nothing in the data changes.', gains: 'Protects the one rule people named twice without being asked.', costs: 'One extra decision mid-incident for personal accounts.', tally: '3 for', lead: true },
      { key: 'C', title: 'One resolver with circuit breakers', by: 'Implementation', approach: 'A shared resolver with a circuit breaker per provider; failover belongs to the resolver, not the screen.',
        how: 'Wrap the existing resolver; no caller changes.', gains: 'The smallest change, and it reuses tested code.', costs: 'Breaker thresholds need real incident data to tune.', tally: 'no votes' }],
    votes: [
      { who: 'Architecture', pos: 'for', opt: 'B', sure: 'very sure', why: 'C’s breaker is the right mechanism, but B’s account boundary has to sit above it as policy.' },
      { who: 'Implementation', pos: 'for', opt: 'B', sure: 'fairly sure', why: 'It builds on C’s resolver without conflict.' },
      { who: 'Adversarial Review', pos: 'for', opt: 'B', sure: 'very sure', why: 'The only option that keeps your personal-account rule.' },
      { who: 'Product', pos: 'against', opt: 'A', sure: 'fairly sure', why: 'A fully automatic pool still risks a silent personal-account switch unless the confirmation is added back, and then it is B with more machinery.' }],
    messages: [
      { who: 'system', at: '0:40', text: 'Questions so far: 9 of 20 asked and answered, 2 duplicates merged, and 2 factual questions sent to research instead of to you. Grill Me is off, so the limit stays at 20.' },
      { who: 'arch', at: '4:12', what: 'drafted alone', text: 'Proposal submitted before seeing anyone else’s: a failover pool Puppet Master owns, health-checked.' },
      { who: 'adv', at: '11:30', what: 'ruled something out', tone: 'warn', text: 'The early fully automatic cross-account variant of the pool breaks a rule you set. It is ruled out however the vote goes.' },
      { who: 'product', at: '19:02', what: 'voted', text: 'Disagreeing with where the room leans: the account-spend boundary has to be built in, not left to each caller.' }]
  }
};
var EVIDENCE = {
  'review-orchestrator-boundary': {
    'ev-1': { label: 'orchestrator-subagent-integration.md · lines 2–3', file: 'orchestrator-subagent-integration.md', cites: 'Finding 1 · Critical · Confirmed', hi: [2, 3],
      lines: ['## Execution limits', 'totalActiveAgents: 4            # the ceiling every run shares', 'crew.childConcurrency: inherit  # held to the ceiling at the top level only',
        'review.reviewerCount: 3', 'retry.maxAttempts: 2', 'retry.logAttempt: original      # the first attempt only'] },
    'ev-2': { label: 'orchestrator-subagent-integration.md · line 6', file: 'orchestrator-subagent-integration.md', cites: 'Finding 2 · Minor · Unsure', hi: [6],
      lines: ['## Execution limits', 'totalActiveAgents: 4            # the ceiling every run shares', 'crew.childConcurrency: inherit  # held to the ceiling at the top level only',
        'review.reviewerCount: 3', 'retry.maxAttempts: 2', 'retry.logAttempt: original      # the first attempt only'] },
    'ev-3': { label: 'Collaborative_Workflows.md · section 5.5', file: 'Collaborative_Workflows.md', cites: 'Finding 3 · Major · Confirmed', hi: [3, 4],
      lines: ['### 5.5 Providers in a Crew', 'A Crew lists the helpers it runs and the model each one asks for.', 'Helpers in one Crew may use different models.', '(No sentence here says a Crew is tied to one provider.)', 'See also: the orchestrator owner document.'] }
  },
  'brainstorm-provider-failover': {
    'src-1': { label: 'Provider status-page latency samples', file: 'research/provider-status-samples.csv', cites: 'Option A · the health-checked ring', hi: [3, 4],
      lines: ['provider,window,first_token_p95_ms,errors', 'anthropic,normal,410,0', 'anthropic,quota-exhausted,—,100%', 'alibaba,during-anthropic-outage,290,0.4%', 'moonshot,normal,265,0'] }
  }
};

/* run state that outlives a tab (pause, progress, rounds), keyed by run */
var LIVE = {};
function liveOf(runId) {
  var run = RUNS[runId];
  if (!LIVE[runId]) LIVE[runId] = { paused: false, cancelled: false, clock: run ? run.clock : 0, readT: 0, done: false, rounds: run && run.rounds || 0,
    messages: run ? run.messages.slice() : [], ticks: null, todos: 0, promoted: [], writing: 0, grill: false };
  return LIVE[runId];
}

/* ---- ids and labels ---- */
function parseRun(tabId) {
  var m = /^(review|brainstorm)-evidence:([^:]+):(.+)$/.exec(tabId);
  if (m) return { evidence: true, type: m[1], runId: m[2], eid: m[3] };
  m = /^(collab-run|crew-work|review|room|brainstorm):(.+)$/.exec(tabId);
  return m ? { runId: m[2] } : { runId: null };
}
function runLabel(run) {
  if (run.type === 'room') return 'Chat Room · ' + run.title.replace(/^Chat Room · /, '');
  if (run.type === 'review' && !/^(Review|Multi-Pass Review|Single Agent Review)\b/.test(run.title)) return 'Review · ' + run.title;
  return run.title;   // titles already start with their kind word (the chat doubled "Crew · Crew ·")
}
function labelFor(tabId) {
  var ref = parseRun(tabId);
  if (ref.evidence) return ref.type === 'review' ? 'Review evidence' : 'BrainStorm evidence';
  var run = RUNS[ref.runId];
  return run ? runLabel(run) : 'Run';
}
function personOf(run, id) {
  var all = run.people.concat(run.specialists || []);
  for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
  return null;
}
function hueOf(run, id) {
  var all = run.people.concat(run.specialists || []);
  var i = all.findIndex(function (p) { return p.id === id; });
  return i < 0 ? 0 : (i % 5) + 1;
}

/* ---- the kind ---- */
function mountRun(host, state, api) {
  var ref = parseRun(api.id);
  if (ref.evidence) return mountEvidence(host, api, ref);
  var run = RUNS[ref.runId] || null;
  var T = run ? TYPES[run.type] : null;
  var L = run ? liveOf(ref.runId) : null;
  var st = { tab: state.tab || 'overview', person: state.person || null, filter: state.filter || null };
  var frame = null, visible = false, disposed = false, timer = 0, streamTimer = 0;
  api.update({ label: labelFor(api.id), title: run ? run.title + ' · ' + T.word : 'Run' });

  if (!run) {
    host.appendChild(PMW.frames.run({ title: 'This run is not available', kind: { icon: 'run', word: 'Run' }, status: ['It may have been removed, or it belongs to another project.'],
      main: [h('p', { class: 'pmw-run-lead', text: 'Open it again from the chat card that started it.' })] }));
    return {};
  }

  /* ---- status ---- */
  function finishedReview() { return run.type === 'review' && L.done; }
  function statusItems() {
    if (L.cancelled) return [{ text: 'Cancelled' }, 'everything so far is kept', money(run.cost) + ' spent'];
    if (L.paused) return [{ text: 'Paused' }, 'nothing is lost', clock(L.clock)];
    if (run.type === 'crew') return [{ text: 'Running' }, clock(L.clock), 'started by you', money(run.cost) + ' of ' + money(run.limit)];
    if (run.type === 'review') {
      if (L.done) return [{ text: 'Completed' }, '2 to fix · 1 unsure', 'Your files were never changed'];
      return [{ text: 'Running' }, 'Reading on their own', 'Your files are never changed'];
    }
    if (run.type === 'room') {
      if (L.streaming) return [{ text: 'Round ' + L.rounds + ' of ' + run.maxRounds }, (L.speaking || 'The room') + ' is speaking'];
      if (L.rounds >= run.maxRounds) return [{ text: 'All ' + run.maxRounds + ' rounds done' }, 'The Moderator summed it up', 'Your move'];
      return [{ text: 'Round ' + L.rounds + ' done' }, 'The Moderator summed it up', 'Your move'];
    }
    if (run.type === 'brainstorm') {
      if (L.writing === 2) return [{ text: 'Plan written' }, 'one Deep Plan, with the disagreement kept in it', 'nothing gets built yet'];
      if (L.writing === 1) return [{ text: 'Writing the plan' }, 'the disagreement stays in it'];
      return [{ text: 'Voting' }, '4 helpers and a Wonderer', 'nothing gets built yet'];
    }
    return [];
  }
  function repaintStatus() {
    if (!frame) return;
    var old = frame._head.querySelector('.pmw-doc-meta');
    if (old) old.replaceWith(PMW.frames.meta(statusItems()));
    frame.setAttribute('data-state', runState());
  }
  function runState() { return L.cancelled ? 'cancelled' : L.paused ? 'paused' : finishedReview() || L.writing === 2 ? 'done' : 'running'; }

  /* ---- actions ---- */
  function shortName() { return run.type === 'room' ? 'Chat Room' : T.word.split(' · ')[0]; }
  function message(person) {
    var at = '@' + (person ? person.role : shortName()) + ' ';
    if (PMW.standIn && typeof PMW.standIn.prefill === 'function') { PMW.standIn.prefill(at); return; }
    PMW.toast('Write in the chat beside this panel, starting with ' + at.trim());
  }
  function togglePause() {
    L.paused = !L.paused;
    if (L.paused) stopTimers(); else startTimers();
    render();
    api.announce(L.paused ? run.title + ' paused. Nothing is lost.' : run.title + ' resumed');
  }
  function moreSpec() {
    var word = shortName();
    var rows = [];
    if (!L.cancelled && !(finishedReview())) rows.push({ id: 'cancel', label: 'Cancel ' + word + '...', icon: 'stop', danger: true, submenu: { id: 'run-cancel', title: 'Cancel this ' + word + '?', meta: 'Everything so far is kept.', rows: [
      { id: 'yes', label: 'Cancel ' + word, danger: true, run: function () { L.cancelled = true; L.paused = false; stopTimers(); render(); api.announce(word + ' cancelled. Everything so far is kept.'); } },
      { id: 'no', label: 'Keep going', run: function () {} }] } });
    if (run.type === 'crew') rows.push({ id: 'setup', label: 'Change setup...', icon: 'rename', disabled: !L.cancelled, reason: 'This Crew builds one plan version. Cancel it first.', run: function () { PMW.toast('Setup opens in the chat'); } });
    else rows.push({ id: 'setup', label: finishedReview() || L.cancelled ? 'Run again with changes...' : 'Change setup...', icon: 'rename', run: function () { PMW.toast('Setup opens in the chat'); } });
    if (run.type === 'review') rows.push({ id: 'again', label: 'Run another review', icon: 'reload', run: function () { PMW.toast('A new review starts from the chat card'); } });
    rows.push('-');
    rows.push({ id: 'transcript', label: 'Download transcript', icon: 'output', disabled: true, reason: 'Not available in this preview.' });
    rows.push({ id: 'newpanel', label: 'Open in new panel', icon: 'newPanel', run: function () { PMW.moveTabToNewPanel(api.id); } });
    return { id: 'run-more', title: run.title, rows: rows, width: 300, align: 'end' };
  }
  function headActions() {
    var acts = [];
    var over = L.cancelled || finishedReview() || L.writing === 2;
    if (!over) acts.push({ label: L.paused ? 'Resume' : 'Pause', icon: L.paused ? 'play' : 'pause', detail: L.paused ? 'Carry on where it stopped' : 'Nothing is lost', run: togglePause });
    if (!over) acts.push({ label: 'Message', icon: 'message', detail: 'Write to the whole ' + shortName() + ' from the chat', run: function () { message(null); } });
    acts.push({ label: 'More', icon: 'moreH', detail: 'Cancel, setup, transcript', menu: moreSpec });
    if (run.type === 'room' && !L.cancelled) {
      var left = run.maxRounds - L.rounds;
      acts.push({ label: 'Summarize now', icon: 'document', detail: 'The Moderator sums up what the room has said', disabled: L.streaming || L.paused, run: summarizeNow });
      acts.push({ label: left > 0 ? 'Next round (' + (L.rounds + 1) + ' of ' + run.maxRounds + ')' : 'No rounds left', primary: left > 0, icon: 'play', detail: 'Each helper speaks once more',
        disabled: left <= 0 || L.streaming || L.paused, run: nextRound });
    }
    return acts;
  }

  /* ---- the cast plate ---- */
  function seat(p, run2) {
    var b = h('button', { type: 'button', class: 'pmw-run-seat pmw-cur is-' + seatState(p), 'data-pmh': 'icon', 'data-pm-hover-label': p.role,
      'data-pm-hover-detail': 'Open their transcript · ' + p.model + ' · ' + STATE_WORD[seatState(p)], 'aria-label': p.role + ', ' + p.model + ', ' + STATE_WORD[seatState(p)] + '. Open their transcript' });
    var pup = puppet(hueOf(run2, p.id), 28);
    pup.appendChild(stateMark(seatState(p)));
    add(b, [pup, h('b', { text: p.role }), h('small', { text: p.sub || p.model })]);
    b.addEventListener('click', function () { openTranscript(p); });
    return b;
  }
  function seatState(p) {
    if (run.type === 'review') {
      if (L.readT >= p.at) return p.setAside ? 'aside' : 'done';
      return 'reading';
    }
    return p.state;
  }
  function openTranscript(p) {
    api.open({ id: p.agent, kind: 'transcript', label: p.role, title: p.role + ' in ' + run.title });
  }
  function plate() {
    var fig = h('div', { class: 'pmw-run-castwrap' });
    if (run.chapters) {
      var bar = h('ol', { class: 'pmw-run-chapters', 'aria-label': 'Where the BrainStorm is' });
      run.chapters.forEach(function (c, i) {
        var now = L.writing ? 6 : run.chapter, s = i < now ? 'done' : i === now ? 'now' : 'next';
        bar.appendChild(h('li', { class: 'is-' + s, 'aria-current': s === 'now' ? 'step' : null }, [h('i', { class: 'pmw-run-chdot', 'aria-hidden': 'true' }), h('span', { text: c })]));
      });
      fig.appendChild(bar);
    }
    var cast = h('div', { class: 'pmw-run-cast' + (run.people.length + (run.specialists || []).length > 4 ? ' is-many' : ''), role: 'group', 'aria-label': 'Who is in this run' });
    cast.appendChild(h('div', { class: 'pmw-run-cin' }, [h('small', { text: run.input.label }), h('b', { text: run.input.text })]));
    cast.appendChild(h('i', { class: 'pmw-run-wire', 'aria-hidden': 'true' }));
    var hub = h('div', { class: 'pmw-run-hub' + (run.hubSeat.plain ? ' is-plain' : '') });
    if (!run.hubSeat.plain) hub.appendChild(puppet(0, 26));
    else hub.appendChild(h('i', { class: 'pmw-run-hubdot', 'aria-hidden': 'true' }));
    add(hub, [h('b', { text: run.hubSeat.role }), h('small', { text: run.hubSeat.sub })]);
    cast.appendChild(hub);
    cast.appendChild(h('i', { class: 'pmw-run-wire', 'aria-hidden': 'true' }));
    var seats = h('div', { class: 'pmw-run-seats' });
    run.people.forEach(function (p, i) {
      if (i && run.screens) seats.appendChild(h('i', { class: 'pmw-run-screen', 'aria-hidden': 'true' }));
      seats.appendChild(seat(p, run));
    });
    (run.specialists || []).forEach(function (p) { seats.appendChild(h('i', { class: 'pmw-run-wing', 'aria-hidden': 'true' })); seats.appendChild(seat(p, run)); });
    cast.appendChild(seats);
    cast.appendChild(h('i', { class: 'pmw-run-wire is-dashed', 'aria-hidden': 'true' }));
    cast.appendChild(h('div', { class: 'pmw-run-you' }, [puppet(0, 26, true), h('b', { text: 'You' }), h('small', { text: run.you })]));
    fig.appendChild(cast);
    var noteText = [run.note, run.type === 'room' ? 'Moderator guides · round ' + L.rounds + ' of ' + run.maxRounds : null].filter(Boolean).join(' · ');
    if (noteText) fig.appendChild(h('p', { class: 'pmw-run-castnote', text: noteText }));
    fig.appendChild(h('p', { class: 'pmw-run-castcap', text: run.caption }));
    return fig;
  }

  /* ---- the tabs ---- */
  function counts() {
    var team = run.people.length + (run.specialists || []).length + (run.type === 'room' ? 1 : 0);
    return { conv: L.messages.length, team: team };
  }
  function tabItems() {
    var c = counts();
    if (run.type === 'room') return [{ value: 'overview', label: 'Discussion', count: c.conv }, { value: 'team', label: 'Team', count: c.team }, { value: 'cost', label: 'Cost' }];
    return [{ value: 'overview', label: T.overview }, { value: 'conv', label: 'Conversation', count: c.conv }, { value: 'team', label: 'Team', count: c.team }, { value: 'cost', label: 'Cost' }];
  }
  function fillMain(main) {
    main.textContent = '';
    var kids;
    if (st.person && st.tab === 'team') kids = personView(personOf(run, st.person));
    else if (st.tab === 'conv') kids = conversation(true);
    else if (st.tab === 'team') kids = team();
    else if (st.tab === 'cost') kids = cost();
    else kids = overview();
    add(main, kids);
  }

  /* timeline rows: mark | who · when · what | text */
  function msgRow(m, i) {
    if (m.who === 'system') return h('li', { class: 'pmw-run-msg is-system', 'data-pmh': 'off' }, [h('p', { text: m.text })]);
    var p = m.who === 'you' || m.who === 'hub' ? null : personOf(run, m.who);
    var name = m.who === 'you' ? 'You' : m.who === 'hub' ? (m.name || run.hubSeat.role) : p ? p.role : 'Helper';
    var markEl = m.who === 'you' ? puppet(0, 20, true) : puppet(m.who === 'hub' ? 0 : hueOf(run, m.who), 20);
    var whoLine = h('p', { class: 'pmw-run-who' }, [h('b', { text: name }), h('span', { text: ' · ' + (m.at || 'now') + (m.what ? ' · ' + m.what : '') })]);
    if (m.tone === 'warn') whoLine.insertBefore(stateMark('needs', 'Needs attention'), whoLine.firstChild.nextSibling);
    var body = h('p', { class: 'pmw-run-text', 'data-pmh': 'off', 'data-i': String(i) }, [m.shown != null ? m.text.split(' ').slice(0, m.shown).join(' ') : m.text]);
    return h('li', { class: 'pmw-run-msg' + (m.tone ? ' is-' + m.tone : ''), 'data-who': m.who }, [markEl, h('div', { class: 'pmw-run-msgb' }, [whoLine, body])]);
  }
  function conversation(withPicker) {
    var out = [];
    if (withPicker) {
      var who = st.filter ? personOf(run, st.filter) : null;
      var pick = h('button', { type: 'button', class: 'pmw-run-picker', 'aria-haspopup': 'menu', 'data-pmh': 'icon', 'data-pm-hover-label': 'Show one person', 'data-pm-hover-detail': 'Or everyone' },
        [h('span', { text: who ? 'Showing ' + who.role : 'Showing everyone' }), PMW.icon('chevronDown', { size: 12 })]);
      pick.addEventListener('click', function () {
        var rows = [{ id: 'all', label: 'Everyone', checked: !st.filter, run: function () { st.filter = null; rerenderMain(); } }].concat(
          run.people.concat(run.specialists || []).map(function (p) {
            return { id: p.id, label: p.role, sub: p.model + ' · ' + p.persona, checked: st.filter === p.id, run: function () { st.filter = p.id; rerenderMain(); } };
          }));
        PMW.menu.open(pick, { id: 'run-filter', title: 'Show messages from', rows: rows, width: 260 });
      });
      out.push(pick);
    }
    var list = h('ol', { class: 'pmw-run-tl' });
    L.messages.forEach(function (m, i) { if (!st.filter || m.who === st.filter) list.appendChild(msgRow(m, i)); });
    if (!list.children.length) list.appendChild(h('li', { class: 'pmw-run-msg is-system' }, [h('p', { text: 'Nothing from them yet.' })]));
    out.push(list);
    return out;
  }
  function team() {
    function row(p, isHub) {
      var stt = isHub ? 'working' : seatState(p);
      var b = h('button', { type: 'button', class: 'pmw-run-trow pmw-cur', 'data-pmh': 'icon', 'data-pm-hover-label': isHub ? p.role : 'Open ' + p.role, 'data-pm-hover-detail': isHub ? (p.does || 'Runs the room') : 'What they are doing, and their messages' }, [
        puppet(isHub ? 0 : hueOf(run, p.id), 22),
        h('span', { class: 'pmw-run-tname' }, [h('b', { text: p.role }), h('small', { text: isHub ? p.sub : p.full + ' · ' + p.persona })]),
        h('span', { class: 'pmw-run-tout' }, [isHub ? null : stateMark(stt), isHub ? (p.does || 'hands out the work and checks it') : STATE_WORD[stt]]),
        h('span', { class: 'pmw-run-tcost', text: money(p.cost) })]);
      if (isHub) b.setAttribute('aria-disabled', 'true');
      else b.addEventListener('click', function () { st.person = p.id; rerenderMain(); });
      return b;
    }
    var core = h('div', { class: 'pmw-run-team' }, (run.type === 'room' ? [row(run.hubSeat, true)] : []).concat(run.people.map(function (p) { return row(p); })));
    var out = [PMW.frames.section('Core team', run.people.length + ' ' + T.helpers + ' · ' + T.hub, core)];
    if (run.specialists && run.specialists.length) {
      out.push(PMW.frames.section('Specialists', 'they never replace a helper, and their work isn’t counted as the team’s', h('div', { class: 'pmw-run-team' }, run.specialists.map(function (p) { return row(p); }))));
    }
    return out;
  }
  function personView(p) {
    if (!p) { st.person = null; return team(); }
    var stt = seatState(p);
    var back = h('button', { type: 'button', class: 'pmw-run-back', 'data-pmh': 'icon', 'data-pm-hover-label': 'Back to the team' }, [PMW.icon('back', { size: 14 }), h('span', { text: 'Team' })]);
    back.addEventListener('click', function () { st.person = null; rerenderMain(); });
    var mine = L.messages.filter(function (m) { return m.who === p.id; });
    var out = [back, h('div', { class: 'pmw-run-person' }, [puppet(hueOf(run, p.id), 34), h('div', null, [h('h2', { text: p.role }),
      PMW.frames.meta([p.full, p.persona, { text: STATE_WORD[stt], state: stt === 'needs' ? 'warn' : stt === 'failed' ? 'bad' : stt === 'done' ? 'ok' : null }, money(p.cost)])])]),
      h('p', { class: 'pmw-run-lead', text: p.doing })];
    if (p.ask) out.push(PMW.frames.notice(p.ask + ' Answer in the chat card: Allow once or Don’t allow.', { state: 'warn', icon: 'lock' }));
    out.push(h('div', { class: 'pmw-run-btns' }, [PMW.frames.button({ label: 'Open their transcript', icon: 'transcript', run: function () { openTranscript(p); } }),
      PMW.frames.button({ label: 'Message ' + p.role, icon: 'message', run: function () { message(p); } })]));
    var list = h('ol', { class: 'pmw-run-tl' });
    mine.forEach(function (m) { list.appendChild(msgRow(m, L.messages.indexOf(m))); });
    out.push(PMW.frames.section('Their messages', mine.length ? String(mine.length) : 'none yet', mine.length ? list : h('p', { class: 'pmw-run-fine', text: 'They have not said anything in this run yet.' })));
    return out;
  }
  function cost() {
    var tin = run.tokens[0], tout = run.tokens[1];
    var pct = Math.min(100, run.cost / run.limit * 100);
    var who = run.people.concat(run.specialists || []).concat([run.hubSeat]);
    return [
      PMW.frames.section('What it cost', null, [h('p', { class: 'pmw-run-big', text: money(run.cost) + ' so far' }),
        h('p', { class: 'pmw-run-lead', text: thousands(tin) + ' tokens read and ' + thousands(tout) + ' written. Tokens measure AI use, roughly ¾ of a word each. It read about ' + Math.round(tin / 1000) + 'k and wrote about ' + Math.round(tout / 1000) + 'k.' })]),
      PMW.frames.section('Your limit', money(run.limit) + (run.limitMin ? ' or ' + run.limitMin + ' min' : run.maxRounds ? ' or ' + run.maxRounds + ' rounds' : ''), [
        h('div', { class: 'pmw-run-meter', role: 'meter', 'aria-valuemin': '0', 'aria-valuemax': String(run.limit), 'aria-valuenow': String(run.cost), 'aria-label': 'Spent of the limit' }, [h('span', { style: 'width:' + pct + '%' })]),
        h('p', { class: 'pmw-run-lead', text: 'It stops at ' + money(run.limit) + (run.limitMin ? ' or after ' + run.limitMin + ' min' : run.maxRounds ? ' or after round ' + run.maxRounds : '') + ', and keeps everything made so far.' })]),
      PMW.frames.section('Who used what', null, h('ul', { class: 'pmw-run-costs' }, who.map(function (p) {
        return h('li', null, [h('span', { text: p.role }), h('span', { class: 'pmw-run-dim', text: p.full || p.sub || '' }), h('b', { text: money(p.cost) })]);
      })))];
  }

  /* ---- overview per kind ---- */
  function overview() {
    if (run.type === 'crew') return crewSummary();
    if (run.type === 'review') return reviewReport();
    if (run.type === 'room') return roomDiscussion();
    return brainstormDecided();
  }
  function partMark(s) { return stateMark(s === 'done' ? 'done' : s === 'needs' ? 'needs' : s === 'queued' ? 'queued' : 'working', s === 'done' ? 'Checked' : s === 'needs' ? 'Needs your OK' : 'Waits its turn'); }
  function crewSummary() {
    var teamList = h('ul', { class: 'pmw-run-plain' }, [h('li', null, [h('b', { text: 'Coordinator' }), ' hands out the parts and checks each one.'])].concat(run.people.map(function (p) {
      return h('li', null, [h('b', { text: p.role }), ' ', h('span', { class: 'pmw-run-dim', text: '(' + p.model + ')' }), ' ', p.doing]);
    })));
    var parts = h('ol', { class: 'pmw-run-parts' }, run.parts.map(function (pt, i) {
      var word = pt.state === 'done' ? 'Checked' : pt.state === 'needs' ? 'Needs your OK' : 'Waits its turn';
      var li = h('li', { class: 'pmw-run-part is-' + pt.state }, [h('div', { class: 'pmw-run-parthead' }, [h('span', { class: 'pmw-run-partn', text: String(i + 1) }), h('b', { text: pt.title })]),
        PMW.frames.meta([pt.who, pt.when, { text: word, state: pt.state === 'done' ? 'ok' : pt.state === 'needs' ? 'warn' : null }]),
        h('p', null, [h('span', { class: 'pmw-run-lbl', text: 'Done when: ' }), pt.doneWhen])]);
      li.querySelector('.pmw-run-parthead').appendChild(partMark(pt.state));
      if (pt.proof) li.appendChild(h('p', null, [h('span', { class: 'pmw-run-lbl', text: 'Proof: ' }), h('span', { class: 'pmw-run-mono', text: pt.proof })]));
      if (pt.blocked) li.appendChild(h('p', { class: 'pmw-run-warnline' }, [stateMark('needs'), ' ', pt.blocked]));
      return li;
    }));
    var planBtn = PMW.frames.button({ label: 'Open the plan', icon: 'plan', run: function () { api.open({ id: 'plan:ap-index', kind: 'plan', label: 'Tenant-scoped analytics read path' }); } });
    return [
      PMW.frames.section('The team', null, teamList),
      PMW.frames.section('The plan', run.parts.length + ' parts · 3 at a time', [parts,
        h('p', { class: 'pmw-run-lead' }, ['Builds the plan Tenant-scoped analytics read path, version 5. To change the plan, stop the Crew first.']),
        h('div', { class: 'pmw-run-btns' }, [planBtn]),
        h('p', { class: 'pmw-run-fine', text: 'Mark as done asks what shows it’s finished, for example “tests pass: 42/42”. A command just running isn’t proof.' })]),
      PMW.frames.section('As it happens', 'the last 3 messages', h('ol', { class: 'pmw-run-tl' }, L.messages.slice(-3).map(function (m) { return msgRow(m, L.messages.indexOf(m)); }))),
      PMW.frames.section('What the Crew started from', null, h('p', { class: 'pmw-run-lead', text: run.input.text + ' Each part was checked before the next one that depends on it could start.' }))
    ];
  }
  function reviewReport() {
    var aside = run.people.filter(function (p) { return p.setAside; })[0];
    if (!L.done) {
      var rows = h('div', { class: 'pmw-run-team is-static' }, run.people.map(function (p) {
        var s = seatState(p);
        return h('div', { class: 'pmw-run-trow is-static' }, [puppet(hueOf(run, p.id), 22), h('span', { class: 'pmw-run-tname' }, [h('b', { text: p.role }), h('small', { text: p.full })]),
          h('span', { class: 'pmw-run-tout' }, [stateMark(s), s === 'reading' ? 'reading on their own' : s === 'aside' ? 'done; set aside' : 'done reading'])]);
      }));
      var out = [PMW.frames.section('The report isn’t ready yet', null, [h('p', { class: 'pmw-run-lead', text: 'Three reviewers are reading on their own; they can’t see each other’s notes yet.' }), rows])];
      if (L.readT >= aside.at) out.push(PMW.frames.section('Set aside', 'never mixed in', h('p', { class: 'pmw-run-lead' }, [h('b', { text: aside.role + ': ' }), 'this reviewer saw an older version of the file.'])));
      return out;
    }
    if (!L.ticks) L.ticks = run.findings.map(function (f) { return f.disp === 'Confirmed'; });
    var list = h('ol', { class: 'pmw-run-findings' });
    run.findings.forEach(function (f, i) {
      var box = h('input', { type: 'checkbox', class: 'pmw-run-tick', id: 'pmw-run-f-' + api.id.length + '-' + i, 'aria-label': 'Make a To-Do of finding ' + (i + 1) });
      box.checked = !!L.ticks[i];
      box.addEventListener('change', function () { L.ticks[i] = box.checked; var c = act.querySelector('.pmw-run-todos span'); if (c) c.textContent = 'Create To-Dos (' + L.ticks.filter(Boolean).length + ')'; });
      var li = h('li', { class: 'pmw-run-finding pmw-cur' + (box.checked ? ' pmw-chosen' : '') }, [box, h('div', { class: 'pmw-run-fbody' }, [
        PMW.frames.meta([{ text: f.sev, state: f.sev === 'Critical' ? 'bad' : f.sev === 'Major' ? 'warn' : null }, f.disp]),
        h('p', { class: 'pmw-run-claim', text: f.claim }),
        h('p', null, [h('span', { class: 'pmw-run-lbl', text: 'Why: ' }), f.proof, ' ', h('button', { type: 'button', class: 'pmw-run-link', 'data-pmh': 'icon', 'data-pm-hover-label': 'Open the evidence',
          'data-pm-hover-detail': 'The exact lines every reviewer read', onclick: function () { api.open({ id: 'review-evidence:' + ref.runId + ':' + f.evidence, kind: 'run', label: 'Review evidence' }); } }, ['See the lines'])]),
        h('p', null, [h('span', { class: 'pmw-run-lbl', text: 'Suggested fix: ' }), f.fix]),
        f.dissent ? h('p', { class: 'pmw-run-dissent' }, [h('span', { class: 'pmw-run-lbl', text: 'Still disagrees: ' }), f.dissent]) : null])]);
      box.addEventListener('change', function () { li.classList.toggle('pmw-chosen', box.checked); });
      list.appendChild(li);
    });
    var act = h('div', { class: 'pmw-run-btns' }, [
      PMW.frames.button({ label: 'Create To-Dos (' + L.ticks.filter(Boolean).length + ')', primary: true, icon: 'check', run: function () {
        var n = L.ticks.filter(Boolean).length;
        if (!n) { PMW.toast('Tick at least one finding first'); return; }
        L.todos += n; PMW.toast(n + ' To-Do' + (n === 1 ? '' : 's') + ' added to the chat'); rerenderMain();
      } }),
      PMW.frames.button({ label: 'Send findings to an agent', icon: 'agent', run: function () { PMW.toast('Pick the agent in the chat; it gets the ticked findings'); } }),
      PMW.frames.button({ label: 'Run another review', icon: 'reload', run: function () { PMW.toast('A new review starts from the chat card'); } })]);
    act.firstChild.classList.add('pmw-run-todos');
    var out = [PMW.frames.section('What they found', '2 to fix · 1 unsure', [list, act,
      h('p', { class: 'pmw-run-fine', text: 'Ticked: the ones reviewers confirmed. Only ticked findings become To-Dos. Nothing is fixed for you.' }),
      L.todos ? h('p', { class: 'pmw-run-receipt' }, [stateMark('done'), ' Added ' + L.todos + ' To-Do' + (L.todos === 1 ? '' : 's') + ' to the chat · just now']) : null])];
    // how they agreed: finding by reviewer
    var grid = h('table', { class: 'pmw-run-agreegrid' });
    grid.appendChild(h('thead', null, [h('tr', null, [h('th', { scope: 'col', text: 'Finding' })].concat(run.people.map(function (p) { return h('th', { scope: 'col', text: p.role }); })))]));
    var tb = h('tbody');
    run.findings.forEach(function (f, i) {
      tb.appendChild(h('tr', null, [h('th', { scope: 'row', text: (i + 1) + '. ' + f.sev })].concat(f.votes.map(function (v) {
        var lab = v === 'yes' ? 'agrees' : v === 'unsure' ? 'not sure' : v === 'no' ? 'disagrees' : v === 'aside' ? 'set aside' : 'did not raise it';
        return h('td', null, [agreeMark(v === 'aside' ? 'none' : v, lab), h('span', { class: 'pmw-run-agreew', text: lab })]);
      }))));
    });
    grid.appendChild(tb);
    out.push(PMW.frames.section('How they agreed', null, [h('div', { class: 'pmw-run-tablewrap' }, [grid]),
      h('p', { class: 'pmw-run-fine pmw-run-legend' }, [agreeMark('yes', 'filled'), ' agrees  ', agreeMark('unsure', 'ring'), ' not sure  ', agreeMark('no', 'slash'), ' disagrees  ', agreeMark('none', 'dash'), ' did not raise it or set aside'])]));
    out.push(PMW.frames.section('Set aside', 'never mixed in', h('p', { class: 'pmw-run-lead' }, [h('b', { text: aside.role + ': ' }), 'this reviewer saw a newer version of the file than the others, so its findings are listed here and not counted.'])));
    return out;
  }
  function roomDiscussion() {
    var closes = L.messages.filter(function (m) { return m.close && m.shown == null; });
    var last = closes[closes.length - 1];
    var out = [];
    if (last) {
      var promo = h('div', { class: 'pmw-run-promo' }, [h('span', { class: 'pmw-run-lbl', text: 'Promote to' })].concat(['To-Do', 'Plan', 'Goal'].map(function (w) {
        return h('button', { type: 'button', class: 'pmw-run-link', 'data-pmh': 'icon', 'data-pm-hover-label': 'Promote to a ' + w, 'data-pm-hover-detail': 'Keeps a link back to this message', onclick: function () {
          L.promoted.push(w); PMW.toast('Promoted to a ' + w); rerenderMain();
        } }, [w]);
      })));
      out.push(PMW.frames.section('Where the room landed', 'Moderator · after round ' + (last.round || L.rounds), [
        h('p', { class: 'pmw-run-landed' }, [stateMark('done'), h('span', { text: last.text.replace(/ Nothing here is a Plan yet.*$/, '') })]),
        h('p', { class: 'pmw-run-lead', text: 'Nothing here is a Plan yet. Say the word and the Moderator promotes a conclusion.' }), promo,
        h('p', { class: 'pmw-run-fine', text: 'Keeps a link back to this message.' }),
        L.promoted.length ? h('p', { class: 'pmw-run-receipt' }, [stateMark('done'), ' Promoted to ' + L.promoted.join(', ') + ' · just now']) : null]));
    }
    out.push(PMW.frames.section('The discussion', L.messages.length + ' messages', conversation(false)));
    return out;
  }
  function brainstormDecided() {
    var out = [h('p', { class: 'pmw-run-lead', text: '3 ideas, drafted without seeing each other, boiled down to 3 options.' })];
    var call = h('div', { class: 'pmw-run-callout' }, [h('p', null, [h('b', { text: L.writing === 2 ? 'The plan is written. ' : 'Ready to write the plan. ' }),
      L.writing === 2 ? 'One Deep Plan, with the disagreement kept in it. Nothing gets built until you say so.' : 'One Deep Plan, with the disagreement kept in it. Nothing gets built yet.'])]);
    call.appendChild(PMW.frames.button({ label: L.writing === 2 ? 'Open the plan' : L.writing === 1 ? 'Writing...' : 'Write the plan', primary: L.writing !== 1, icon: 'plan', disabled: L.writing === 1 || L.cancelled, run: writePlan }));
    out.push(call);
    var opts = h('div', { class: 'pmw-run-options' }, run.options.map(function (o) {
      return h('article', { class: 'pmw-run-option' + (o.lead ? ' is-lead pmw-chosen' : '') }, [
        h('p', { class: 'pmw-run-optk' }, [h('span', { class: 'pmw-run-optl', text: o.key }), h('span', { class: 'pmw-run-tally', text: o.tally })]),
        h('h3', { text: o.title }), h('p', { class: 'pmw-run-optby', text: 'Drafted by ' + o.by }), h('p', { text: o.approach }),
        h('dl', null, [h('dt', { text: 'How' }), h('dd', { text: o.how }), h('dt', { text: 'Gains' }), h('dd', { text: o.gains }), h('dt', { text: 'Costs' }), h('dd', { text: o.costs })])]);
    }));
    out.push(PMW.frames.section('The options', L.writing ? 'voting closed · 4 of 4 in' : 'voting now · 4 of 4 in', opts));
    out.push(PMW.frames.section('The recommendation', null, h('p', { class: 'pmw-run-lead', text: 'Option B as the policy, built on option C’s resolver: work accounts fail over automatically through a breaker per provider, and any personal-account spend stops for your confirmation.' })));
    out.push(PMW.frames.section('Still disagrees', 'kept in the plan so you can weigh it', h('blockquote', { class: 'pmw-run-quote', 'data-pmh': 'off' }, [h('p', { text: 'C’s resolver-level breaker is the right plumbing, but without B’s account boundary sitting visibly above it, a future caller could still wire automatic personal-account failover through the resolver by accident.' }), h('footer', { text: 'Product · fairly sure' })])));
    var vt = h('table', { class: 'pmw-run-votes' }, [h('thead', null, [h('tr', null, ['Who', 'Vote', 'How sure', 'Why'].map(function (c) { return h('th', { scope: 'col', text: c }); }))]),
      h('tbody', null, run.votes.map(function (v) {
        return h('tr', null, [h('th', { scope: 'row', 'data-l': 'Who', text: v.who }), h('td', { 'data-l': 'Vote' }, [agreeMark(v.pos === 'for' ? 'yes' : 'no', v.pos), ' ' + v.pos + ' ' + v.opt]), h('td', { 'data-l': 'How sure', text: v.sure }), h('td', { 'data-l': 'Why', text: v.why })]);
      }))]);
    out.push(PMW.frames.section('How they voted', '3 for B · 1 against A', vt));
    out.push(PMW.frames.section('Sources and earlier answers', null, h('ul', { class: 'pmw-run-plain' }, [
      h('li', null, [h('button', { type: 'button', class: 'pmw-run-link', 'data-pmh': 'icon', 'data-pm-hover-label': 'Open the evidence', onclick: function () { api.open({ id: 'brainstorm-evidence:' + ref.runId + ':src-1', kind: 'run', label: 'BrainStorm evidence' }); } }, ['Provider status-page latency samples']), ' · checked during Check facts']),
      h('li', { text: 'Two earlier answers of yours: never spend from a personal account without asking first.' })])));
    out.push(PMW.frames.section('Also considered', 'ruled out', h('p', { class: 'pmw-run-lead' }, [h('b', { text: 'Fully automatic cross-account failover. ' }), 'It breaks your rule “Never spend from a personal account without explicit confirmation.” Votes can’t override a rule.'])));
    out.push(PMW.frames.section('Wonderer’s ideas', 'hypotheses, not checked yet', h('ul', { class: 'pmw-run-plain' }, [
      h('li', { text: 'CDN edge failover favours a gradual canary percentage over a binary cutover. It could let option A shed traffic gradually instead of all at once.' }),
      h('li', { text: 'Airlines publish their overbooking compensation rule in advance rather than deciding case by case. It argues for a fixed, disclosed spending policy, as in option B.' })])));
    return out;
  }

  /* ---- the aside ---- */
  function asideBlock(title, kids) { return h('section', { class: 'pmw-run-asec' }, [h('h3', { text: title })].concat(kids)); }
  function aside() {
    if (run.type === 'crew') return [asideBlock('Spent', [h('p', { class: 'pmw-run-abig', text: money(run.cost) }), h('p', { text: 'of ' + money(run.limit) + ' or ' + run.limitMin + ' min' })]),
      asideBlock('Team', [h('p', { text: '3 helpers · 3 at a time' }), h('p', { text: 'Coordinator: the assistant in this thread' })]),
      asideBlock('Promise', [h('p', { text: T.promise })])];
    if (run.type === 'review') return [asideBlock('Snapshot', [h('p', { text: 'Of ' + run.snapshot + '. Every reviewer read that exact version.' })]),
      asideBlock('Spent', [h('p', { class: 'pmw-run-abig', text: money(run.cost) })]), asideBlock('Promise', [h('p', { text: 'Review never changes your files and never repairs anything on its own.' })])];
    if (run.type === 'room') return [asideBlock('At the table', [h('ul', { class: 'pmw-run-seatlist' }, [h('li', null, [h('b', { text: 'Moderator' }), ' · Product Manager', h('small', { text: run.hubSeat.does })])].concat(
      run.people.map(function (p) { return h('li', null, [h('b', { text: p.role }), ' · ' + p.persona]); })))]),
      asideBlock('Moderator guides', [h('p', { text: 'up to ' + run.maxRounds + ' rounds · ' + L.rounds + ' so far' })]),
      asideBlock('Spent', [h('p', { text: money(run.cost) + ' so far of your ' + money(run.limit) + ' limit' })]), asideBlock('Promise', [h('p', { text: T.promise })])];
    var grill = h('input', { type: 'checkbox', class: 'pmw-run-grill', id: 'pmw-run-grill-' + ref.runId });
    grill.checked = !!L.grill;
    grill.addEventListener('change', function () { L.grill = grill.checked; render(); api.announce(L.grill ? 'Grill Me on: up to 45 questions' : 'Grill Me off: up to 20 questions'); });
    return [asideBlock('Voting', [h('p', { text: '4 of 4 in.' }), h('p', null, [h('b', { text: 'Wonderer' }), ' abstains: its ideas stay hypotheses until checked.'])]),
      asideBlock('Questions for you', [h('p', { text: 'up to ' + (L.grill ? 45 : 20) + '. 9 asked so far, shared by everyone. It’s a limit, not a target.' }),
        h('label', { class: 'pmw-run-check', for: grill.id }, [grill, h('span', null, [h('b', { text: 'Grill Me' }), h('small', { text: 'Allow up to 25 more questions. The 9 already asked still count.' })])])]),
      asideBlock('Spent', [h('p', { class: 'pmw-run-abig', text: money(run.cost) + ' so far' }), h('p', { text: 'of your ' + money(run.limit) + ' limit' })])];
  }

  /* ---- live behaviour (only while visible, never while paused) ---- */
  function tick() {
    if (!visible || L.paused || L.cancelled || disposed) return;
    if (run.type === 'crew') { L.clock += 1; repaintStatus(); }
    if (run.type === 'review' && !L.done) {
      var before = run.people.map(seatState).join();
      L.readT += 1;
      var after = run.people.map(seatState).join();
      if (L.readT >= 10) {
        L.done = true;
        api.announce('Review finished: 2 to fix, 1 unsure');
        stopTimers();
        render();
      } else if (before !== after) render();
    }
  }
  function startTimers() {
    stopTimers();
    if (L.paused || L.cancelled) return;
    if (run.type === 'crew' || (run.type === 'review' && !L.done)) timer = setInterval(tick, 1000);
    if (L.streaming) stream();
  }
  function stopTimers() { clearInterval(timer); timer = 0; clearTimeout(streamTimer); streamTimer = 0; }
  function nextRound() {
    var script = run.nextRounds[L.rounds - run.rounds];
    if (!script || L.streaming) return;
    L.rounds += 1;
    L.streaming = true;
    var t0 = L.rounds === 3 ? '5:44 PM' : L.rounds === 4 ? '5:49 PM' : '5:53 PM';
    L.queue = script.map(function (m) { return Object.assign({ at: t0, round: L.rounds, name: m.who === 'hub' ? 'Moderator' : null }, m); });
    api.announce('Round ' + L.rounds + ' started');
    render();
    stream();
  }
  function summarizeNow() {
    L.messages.push({ who: 'hub', name: 'Moderator', at: 'now', what: 'summed up early', close: true, round: L.rounds,
      text: 'Summary so far: the room leans toward progressive disclosure with a louder resume nudge; a short guided checklist is the open alternative.' });
    render();
    api.announce('The Moderator summed up the room');
  }
  function stream() {
    clearTimeout(streamTimer);
    if (!L.streaming) return;
    var cur = L.messages[L.messages.length - 1];
    if (!cur || cur.shown == null || cur.shown >= cur.text.split(' ').length) {
      if (cur && cur.shown != null) { delete cur.shown; }
      var nx = L.queue.shift();
      if (!nx) {
        L.streaming = false; L.speaking = null;
        run.people.forEach(function (p) { p.state = 'idle'; });
        render();
        api.announce('Round ' + L.rounds + ' done. Your move.');
        return;
      }
      var reduced = PMW.reduced() || !visible;
      nx.shown = reduced ? null : 0;
      L.messages.push(nx);
      var sp = nx.who === 'hub' ? null : personOf(run, nx.who);
      run.people.forEach(function (p) { p.state = sp && p.id === sp.id ? 'working' : 'idle'; });
      L.speaking = sp ? sp.role : 'The Moderator';
      render();
      streamTimer = setTimeout(stream, reduced ? 250 : 120);
      return;
    }
    if (!visible || PMW.reduced()) { delete cur.shown; render(); streamTimer = setTimeout(stream, 200); return; }
    cur.shown += 2;
    var el = frame && frame.querySelector('.pmw-run-text[data-i="' + (L.messages.length - 1) + '"]');
    if (el) el.textContent = cur.text.split(' ').slice(0, cur.shown).join(' ');
    streamTimer = setTimeout(stream, 60);
  }
  function writePlan() {
    if (L.writing === 2) { api.split('auto', { id: 'deep-discovery:b14-thorough-1', kind: 'plan', label: 'Deep Plan · discovery' }); return; }
    L.writing = 1;
    render();
    var t = setTimeout(function () {
      L.writing = 2;
      if (!disposed) { render(); api.announce('The plan is written'); api.split('auto', { id: 'deep-discovery:b14-thorough-1', kind: 'plan', label: 'Deep Plan · discovery' }); }
    }, PMW.reduced() ? 400 : 1400);
    later.push(t);
  }
  var later = [];

  /* ---- render ---- */
  function rerenderMain() {
    if (!frame) return;
    fillMain(frame._main);
    if (frame._tabs) {
      var items = tabItems();
      Array.prototype.forEach.call(frame._tabs.children, function (b, i) { var sm = b.querySelector('small'); if (sm && items[i] && items[i].count != null) sm.textContent = String(items[i].count); });
    }
  }
  function render() {
    if (disposed) return;
    var keep = frame && frame._scroll ? frame._scroll.scrollTop : 0;
    host.textContent = '';
    frame = PMW.frames.run({
      title: run.title,
      kind: { icon: T.icon, word: T.word },
      status: statusItems(),
      actions: headActions(),
      plate: plate(),
      tabs: { items: tabItems(), value: st.tab, onChange: function (v) { st.tab = v; st.person = null; rerenderMain(); } },
      main: [],
      aside: aside(),
      cls: 'pmw-run-k pmw-run-t-' + run.type
    });
    frame.setAttribute('data-state', runState());
    if (run.type === 'room' && !L.cancelled) frame._head.appendChild(h('p', { class: 'pmw-run-helper', text: L.rounds < run.maxRounds ? 'Each helper speaks once more.' : 'The room has used all its rounds.' }));
    frame._scroll.setAttribute('tabindex', '-1');
    fillMain(frame._main);
    host.appendChild(frame);
    if (keep) frame._scroll.scrollTop = keep;
  }
  render();

  return {
    onShow: function () { visible = true; render(); startTimers(); },
    onHide: function () {
      visible = false;
      stopTimers();
      // a round in progress finishes at once rather than animating out of sight
      if (L.streaming) { var cur = L.messages[L.messages.length - 1]; if (cur) delete cur.shown; while (L.queue && L.queue.length) L.messages.push(L.queue.shift()); L.streaming = false; L.speaking = null; }
    },
    focus: function () { if (frame && frame._scroll) frame._scroll.focus({ preventScroll: true }); },
    unmount: function () { disposed = true; stopTimers(); later.forEach(clearTimeout); },
    serialize: function () { return { tab: st.tab, person: st.person, filter: st.filter }; }
  };
}

/* the evidence a run cites: the exact lines, numbered, with the cited ones marked */
function mountEvidence(host, api, ref) {
  var run = RUNS[ref.runId], ev = EVIDENCE[ref.runId] && EVIDENCE[ref.runId][ref.eid];
  api.update({ label: labelFor(api.id), title: ev ? ev.label : 'Evidence' });
  var kindWord = (ref.type === 'review' ? 'Review evidence' : 'BrainStorm evidence') + (run ? ' · ' + run.title : '');
  var back = { label: ref.type === 'review' ? 'Back to the report' : 'Back to the BrainStorm', icon: 'back', run: function () {
    api.open({ id: (ref.type === 'review' ? 'review:' : 'brainstorm:') + ref.runId, kind: 'run', label: run ? runLabel(run) : null });
  } };
  if (!ev) {
    host.appendChild(PMW.frames.run({ title: 'This evidence is not available', kind: { icon: 'document', word: kindWord }, status: ['It may belong to an earlier run.'], actions: run ? [back] : [], main: [] }));
    return {};
  }
  var pre = h('pre', { class: 'pmw-code pmw-run-evcode', 'data-pmh': 'off', tabindex: '0', 'aria-label': ev.file });
  var code = h('code');
  ev.lines.forEach(function (line, i) {
    var on = ev.hi.indexOf(i + 1) >= 0;
    code.appendChild(h('span', { class: 'pmw-run-evl' + (on ? ' is-hi' : '') }, [h('span', { class: 'pmw-run-evn', 'aria-hidden': 'true', text: String(i + 1) }), line || ' ']));
  });
  pre.appendChild(code);
  var range = ev.hi.length > 1 ? 'lines ' + ev.hi[0] + '–' + ev.hi[ev.hi.length - 1] : 'line ' + ev.hi[0];
  var frame = PMW.frames.run({
    title: ev.label, kind: { icon: 'document', word: kindWord },
    status: ref.type === 'review' ? [{ text: 'The exact version every reviewer read' }, 'snapshot 5:38 PM'] : [{ text: 'Checked during Check facts' }, 'kept as it was read'],
    actions: [back],
    main: [h('p', { class: 'pmw-run-fine pmw-run-evfile' }, [PMW.icon('file', { size: 13 }), ' ', ev.file]), pre,
      h('p', { class: 'pmw-run-lead', text: 'The marked ' + range + ' are the ones the ' + (ref.type === 'review' ? 'report' : 'BrainStorm') + ' points to.' })],
    aside: [h('section', { class: 'pmw-run-asec' }, [h('h3', { text: 'Cited by' }), h('p', { text: ev.cites })]),
      h('section', { class: 'pmw-run-asec' }, [h('h3', { text: 'Read-only' }), h('p', { text: 'Evidence is kept exactly as it was read; nothing here can change it.' })])],
    cls: 'pmw-run-k pmw-run-ev'
  });
  frame._scroll.setAttribute('tabindex', '-1');
  host.appendChild(frame);
  return { focus: function () { frame._scroll.focus({ preventScroll: true }); } };
}

PM_HOME.registerKind('run', {
  label: 'Run',
  group: 'Runs',
  icon: 'run',
  prefixes: ['collab-run:', 'crew-work:', 'review:', 'room:', 'brainstorm:', 'review-evidence:', 'brainstorm-evidence:'],
  min: { w: 360, h: 200 },
  document: true,
  idFor: function (spec) {
    var r = spec.run || spec.runId;
    return r && RUNS[r] ? TYPES[RUNS[r].type].prefix + r : r ? 'collab-run:' + r : null;
  },
  /* one run is one tab: the chat's generic collab-run:<run> is the run's own kind id */
  canonical: function (id) {
    var m = /^collab-run:(.+)$/.exec(id);
    if (m && RUNS[m[1]]) return TYPES[RUNS[m[1]].type].prefix + m[1];
    return id;
  },
  mount: mountRun
});

PM_HOME.catalog.add('run', Object.keys(RUNS).map(function (id) {
  var r = RUNS[id], T = TYPES[r.type];
  var sub = r.type === 'crew' ? 'Crew · running · 3 helpers' : r.type === 'review' ? 'Review · 3 reviewers' : r.type === 'room' ? 'Chat Room · round 2 of 5' : 'BrainStorm · voting';
  return { id: T.prefix + id, label: runLabel(r), sub: sub + ' · ' + r.thread, icon: 'run', keywords: T.word + ' ' + r.thread, spec: { id: T.prefix + id, kind: 'run', label: runLabel(r) } };
}).concat([{ id: 'review-evidence:review-orchestrator-boundary:ev-1', label: 'Review evidence', sub: 'orchestrator-subagent-integration.md · lines 2–3', icon: 'document',
  keywords: 'evidence review lines', spec: { id: 'review-evidence:review-orchestrator-boundary:ev-1', kind: 'run', label: 'Review evidence' } }]));

/* a run opened in the background is mounted lazily; name it now so its strip label is right */
PM_HOME.on('open', function (e) {
  if (!e || e.kind !== 'run' || !e.created) return;
  var t = (PM_HOME.tabs() || []).filter(function (x) { return x.tabId === e.tabId; })[0];
  if (t && (t.label === 'Run' || !t.label)) PM_HOME.update(e.tabId, { label: labelFor(e.tabId) });
});
