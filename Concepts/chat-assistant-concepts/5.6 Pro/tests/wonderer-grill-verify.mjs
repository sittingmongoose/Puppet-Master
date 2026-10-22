#!/usr/bin/env node
/* tests/wonderer-grill-verify.mjs - DL-218 (2026-10-16): the Wonderer runs alongside a Crew, a Chat Room or a BrainStorm and
 * the agents decide its leads; Grill Me is a switch that makes whoever already talks to you grill you.
 *
 *   node tests/wonderer-grill-verify.mjs              engine rules (wonderer-protocol.js, grill-protocol.js) and
 *                                                     static scans of the sources; no browser, a few seconds
 *   node tests/wonderer-grill-verify.mjs --browser    also plays every Demo Studio flow in Chromium against
 *                                                     index.html and checks what the screen shows
 *   options: --page standalone|pm7, --file <html> (default ./index.html), --cdp <endpoint> (attach to a running GPU browser, such as an
 *            agent-browser session, instead of launching one), --json <path> (write the report)
 *
 * The browser pass imports playwright, then playwright-core. It never passes --disable-gpu.
 * The rules include the steer of 2026-10-20 from the two Plans reviews: a Chat Room never waits for the Wonderer; 3 to 5
 * leads is a target (0 to 5 allowed); leads are decided as they arrive, and nothing new reaches the team once it writes
 * the result; grilling waits on lookups; Grill Me turned on mid-run gates only the step that uses its answers; the first
 * pass runs during intake and a later pass queues behind core work. */
import { chatTarget, testGeometry } from './chat-target.mjs';
import { launchGpuBrowser, gpuPage } from './gpu-browser.mjs';
import { grillFooterGeometry } from './grill-footer-geometry.mjs';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2), opt = n => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const results = [];
const paintFailures = [];
let phase = 'node';
const target = chatTarget(argv);
/* the Batch 14-17 and 19 examples (2026-10-22), added once their recordings land */
const AX_MORE = [
  { name: 'To-Do graphs · Parallel outputs, honest progress', action: 'b16-start', flow: 'parallel', moves: ['[data-action="pd-build"]'] },
  { name: 'To-Do graphs · Refine a list without losing work', action: 'b16-start', flow: 'restructure', moves: ['[data-action="pd-build-goal"]'] },
  { name: 'To-Do graphs · Every item, even number 5,000', action: 'b16-start', flow: 'large' },
  { name: 'Plan recovery · Recover without starting over', action: 'b17-start', flow: 'recovery', moves: ['[data-action="pd-build"]'] },
  { name: 'Plan recovery · Read the exact evidence', action: 'b17-start', flow: 'documents' },
  { name: 'Attachments · Attach, retry and remove', action: 'b19-start', flow: 'intake' },
  { name: 'Attachments · Live references and drift', action: 'b19-start', flow: 'live' },
  { name: 'Attachments · Folders stay bounded', action: 'b19-start', flow: 'folder' },
  /* '@q': an Ask Card round with unfilled required decisions, answered as a person would (a choice per question, Next,
     then Submit); C: the reviewed Plan's confirm; B: Build */
  { name: 'Deep Plan · A few decisions, a complete plan', action: 'b14-start', flow: 'thorough', moves: ['@q', '[data-action="b14-synthesize"]', '[data-action="pd-build"]'], max: 120000 },
  { name: 'Deep Plan · Research can become stale', action: 'b14-start', flow: 'exhaustive', moves: ['@q', '[data-action="b14-synthesize"]', '[data-action="b14-synthesize"]', '[data-action="pd-build"]'], max: 150000 },
  { name: 'Deep Plan · One allowance, every participant', action: 'b14-start', flow: 'budget', moves: ['@q', '@q', '@q', '@q', '@q', '[data-action="b14-synthesize"]', '[data-action="pd-build"]'], max: 180000 },
  { name: 'Deep Plan · An open decision can block Build', action: 'b14-start', flow: 'blocker', moves: ['@q', '@q', '@q', '@q', '@q', '[data-action="b14-synthesize"]'], max: 180000 },
  { name: 'Simple Goal · A Goal that produces a real file', action: 'b15-start', flow: 'simple' },
  { name: 'Simple Goal · You own the objective', action: 'b15-start', flow: 'authority', moves: ['[data-action="goal-save"]', '[data-action="goal-deny-proposal"]', '[data-action="goal-approve-proposal"]'], max: 120000 },
  { name: 'Simple Goal · Build a Plan as a Goal', action: 'b15-start', flow: 'plan', moves: ['[data-action="pd-build-goal"]'] },
  { name: 'Simple Goal · A future build is not a Goal yet', action: 'b15-start', flow: 'scheduled', moves: ['#pmOverlayRoot [data-action="sched-create-build"]'], max: 120000 }
];
function check(name, pass, detail) { results.push({ name, phase, pass: !!pass, detail: pass ? '' : String(detail == null ? '' : detail), ...(phase === 'browser' ? { sizeContext: testGeometry() } : {}) }); if (!pass || phase === 'browser') console.log((pass ? 'PASS  ' : 'FAIL  ') + name + (!pass && detail ? '  -- ' + detail : '')); }
const { Protocol, STATUS_WORD } = require(path.join(ROOT, 'wonderer-protocol.js'));
const GE = require(path.join(ROOT, 'grill-protocol.js'));

/* ------------------------------------------------------------------ engine: the Wonderer's leads (CWR-041) */
function runOf(kind, withWonderer = true) {
  const ps = [{ id: 'a', role: 'Architecture', additiveRoleKind: 'none' }, { id: 'b', role: 'Product', additiveRoleKind: 'none' }];
  if (withWonderer) ps.push({ id: 'w', role: 'Wonderer', additiveRoleKind: 'wonderer' });
  return { id: 'r-' + kind, kind, status: 'running', purpose: 'Keep typing responsive', participants: ps, messages: [{ id: 'm1', senderKind: 'participant', senderId: 'a', body: 'x' }] };
}
const ANG = [{ key: 'history' }, { key: 'adjacent' }, { key: 'scale' }];
const lead = (id, o = {}) => Object.assign({ id, angle: 'adjacent', title: 'Lead ' + id, tether: 'Connects to the topic.', source: { kind: 'url', url: 'https://example.org/' + id } }, o);
function delivered(kind, n = 4) {
  const q = new Protocol(), r = runOf(kind);
  q.attach(r, { kind, seed: r.purpose });
  const p = q.requestPass(r, { by: { kind: 'start' } }).pass;
  const out = q.deliver(r, p.id, { summary: 'Explored around the topic.', angles: ANG, leads: Array.from({ length: n }, (_, i) => lead('l' + (i + 1))) });
  return { q, r, p, out };
}
const coord = { role: 'coordinator', name: 'Coordinator' }, mod = { role: 'moderator', name: 'Moderator' };
{
  const q = new Protocol(), r = runOf('crew', false);
  check('W1 the Wonderer runs only as its own participant (no Wonderer, no record)', q.attach(r, { seed: 'x' }).error === 'wonderer_not_configured');
  check('W1b Review has no Wonderer', new Protocol().attach(Object.assign(runOf('review'), { kind: 'review' }), { seed: 'x' }).error === 'kind_has_no_wonderer');
}
{
  const q = new Protocol(), r = runOf('crew'); q.attach(r, { seed: 'x' });
  check('W2 the first pass starts with the run', q.requestPass(r, { by: { kind: 'start' } }).ok);
  check('W2b a pass waits until the one exploring is delivered', q.requestPass(r, { by: { kind: 'participant', id: 'a' }, messageId: 'm1' }).error === 'pass_running');
  q.deliver(r, r.wonderer.passes[0].id, { summary: 's', angles: ANG, leads: [lead('a1'), lead('a2'), lead('a3')] });
  check('W2c a further pass needs an addressed message', q.requestPass(r, { by: { kind: 'participant', id: 'a' } }).error === 'pass_request_must_be_addressed');
  check('W2d the Wonderer never asks for its own pass', q.requestPass(r, { by: { kind: 'participant', id: 'w' }, messageId: 'm1' }).error === 'wonderer_cannot_request_pass');
  const p2 = q.requestPass(r, { by: { kind: 'participant', id: 'a', name: 'Architecture' }, messageId: 'm1' });
  check('W2e a helper can ask for pass 2', p2.ok && p2.pass.askedIn === 'm1');
  q.deliver(r, p2.pass.id, { summary: 's', angles: ANG, leads: [lead('b1'), lead('b2'), lead('b3')] });
  const p3 = q.requestPass(r, { by: { kind: 'user' }, messageId: 'm1' });
  q.failPass(r, p3.pass.id, 'timed_out');
  check('W2f a failed further pass does not count toward the two', q.passesLeft(r) === 1 && p3.pass.n === 3);
  const p4 = q.requestPass(r, { by: { kind: 'user' }, messageId: 'm1' });
  /* R12: the retry keeps its further-pass number (3) with a new attempt identity, and no pass number passes 3 */
  check('W2h a retried further pass keeps its number with a new attempt identity (R12)', p4.ok && p4.pass.n === 3 && p4.pass.attempt === 2 && p4.pass.attemptId !== p3.pass.attemptId && p4.pass.id !== p3.pass.id, JSON.stringify(p4.pass && { n: p4.pass.n, attempt: p4.pass.attempt, id: p4.pass.id }));
  q.deliver(r, p4.pass.id, { summary: 's', angles: ANG, leads: [lead('c1'), lead('c2'), lead('c3')] });
  check('W2g at most two further passes that did not fail', q.requestPass(r, { by: { kind: 'coordinator' }, messageId: 'm1' }).error === 'pass_limit' && q.passesLeft(r) === 0);
  check('W2i every pass number runs 1 to 3 (R12)', r.wonderer.passes.every(x => x.n >= 1 && x.n <= 3), r.wonderer.passes.map(x => x.n + ':' + x.status).join(' '));
  /* a pass asked for after a failed first pass is pass 2 (CWR-041) */
  const r2 = runOf('crew'); q.attach(r2, { seed: 'x' }); const f1 = q.requestPass(r2, { by: { kind: 'start' } }); q.failPass(r2, f1.pass.id, 'failed');
  check('W2j a pass asked for after a failed first pass is pass 2', q.requestPass(r2, { by: { kind: 'user' }, messageId: 'm1' }).pass.n === 2);
}
{
  const { q, r } = delivered('crew', 3);
  const qd = q.requestPass(r, { by: { kind: 'participant', id: 'a', name: 'A' }, messageId: 'm1', queue: true });
  check('W2k a later pass with no slot free is queued, never waiting its turn', qd.ok && qd.queued && r.wonderer.passes[1].status === 'queued' && q.gate(r).code === 'exploring');
  check('W2l a queued pass starts when a slot frees up', q.startQueued(r).ok && r.wonderer.passes[1].status === 'exploring');
}
{
  const q = new Protocol(), r = runOf('crew'); q.attach(r, { seed: 'x' });
  const p = q.requestPass(r, { by: { kind: 'start' } }).pass;
  check('W3 a pass works three or four angles', q.deliver(r, p.id, { summary: 's', angles: [{ key: 'history' }], leads: [lead('a'), lead('b'), lead('c')] }).error === 'three_or_four_angles');
  const res = q.deliver(r, p.id, { summary: 's', angles: ANG, leads: [lead('a'), lead('b', { tether: '' }), lead('c', { source: {} }), lead('d'), lead('e')] });
  check('W3b a lead without a tether is dropped as drift; one without a source is not delivered', res.ok && res.dropped.some(d => d.id === 'b' && d.reason === 'drift_no_tether') && res.dropped.some(d => d.id === 'c' && d.reason === 'no_source'));
  check('W3c every delivered lead carries an angle, a tether and a source', r.wonderer.leads.every(l => l.angle && l.tether && (l.source.url || l.source.messageId)));
  const q2 = new Protocol(), r2 = runOf('crew'); q2.attach(r2, { seed: 'x' });
  const p2 = q2.requestPass(r2, { by: { kind: 'start' } }).pass;
  check('W3d more than five leads is refused', q2.deliver(r2, p2.id, { summary: 's', angles: ANG, leads: ['a', 'b', 'c', 'd', 'e', 'f'].map(x => lead(x)) }).error === 'at_most_five_leads');
  const two = q2.deliver(r2, p2.id, { summary: 's', angles: ANG, leads: [lead('a'), lead('b')], stopReason: 'shapes repeated' });
  check('W3e 3 to 5 is a target: a pass may stop early with fewer', two.ok && r2.wonderer.passes[0].stoppedEarly && r2.wonderer.leads.length === 2);
  const q3 = new Protocol(), r3 = runOf('chat_room'); q3.attach(r3, { seed: 'x' });
  const p3 = q3.requestPass(r3, { by: { kind: 'start' } }).pass;
  check('W3f a pass with no new leads is a truthful result', q3.deliver(r3, p3.id, { summary: 's', angles: ANG, leads: [] }).ok && r3.wonderer.passes[0].status === 'delivered' && r3.wonderer.passes[0].leadIds.length === 0);
}
{
  const { q, r, p } = delivered('brainstorm');
  check('W4 a BrainStorm pass is held until every blind proposal is in', p && r.wonderer.passes[0].status === 'held' && !q.visible(r, p.id));
  check('W4b no decision on a held lead', q.dispose(r, 'l1', { kind: 'use', reason: 'x', by: coord }).error === 'lead_held_until_proposals_in');
  check('W4c release needs every proposal in', q.release(r, {}).error === 'blind_proposals_not_in' && q.release(r, { proposalsIn: true }).ok && q.visible(r, p.id));
  check('W4d Write the plan waits while held', (() => { const r2 = delivered('brainstorm').r; return new Protocol().gate(r2).code === 'held'; })());
}
{
  const { q, r } = delivered('crew');
  check('W5 the Coordinator records each decision', q.dispose(r, 'l1', { kind: 'use', reason: 'fits', by: mod }).error === 'coordinator_records_dispositions');
  check('W5b the Wonderer never decides its own lead', q.dispose(r, 'l1', { kind: 'use', reason: 'fits', by: { role: 'wonderer', id: 'w' } }).error === 'wonderer_cannot_dispose');
  check('W5c a decision without a one-line reason is refused', q.dispose(r, 'l1', { kind: 'use', reason: '', by: coord }).error === 'one_line_reason_required' && q.dispose(r, 'l1', { kind: 'use', reason: 'a\nb', by: coord }).error === 'one_line_reason_required');
  check('W5d explore queues research; use and set aside do not', q.dispose(r, 'l1', { kind: 'explore', reason: 'worth a look', by: coord }).ok && r.wonderer.leads[0].research.status === 'queued' && q.dispose(r, 'l2', { kind: 'use', reason: 'fits', by: coord }).ok && !r.wonderer.leads[1].research);
  check('W5e the reason and who recorded it are kept', r.wonderer.leads[1].disposition.reason === 'fits' && r.wonderer.leads[1].disposition.by.name === 'Coordinator');
  const room = delivered('chat_room');
  check('W5f in a Chat Room the Moderator records it', room.q.dispose(room.r, 'l1', { kind: 'use', reason: 'fits', by: mod }).ok && room.q.dispose(room.r, 'l2', { kind: 'use', reason: 'fits', by: coord }).error === 'moderator_records_dispositions');
  check('W6 the Wonderer never explores its own leads', q.startResearch(r, 'l1', { role: 'wonderer', id: 'w' }).error === 'wonderer_cannot_research');
  check('W6b Check it works on any lead, whatever its decision', q.checkIt(r, 'l2').ok && r.wonderer.leads[1].research.via === 'check_it' && r.wonderer.leads[1].disposition.kind === 'use');
  const again = q.checkIt(r, 'l2');
  check('W6d Check it on a lead already in research shows that research, no second one', again.ok && again.existing && again.research.via === 'check_it');
  check('W6c Check it on a finished run is refused', new Protocol().checkIt(delivered('crew').r, 'l1', { takesRequests: false }).error === 'run_takes_no_requests');
  q.startResearch(r, 'l1', { id: 'a', name: 'Architecture' });
  check('W7 supported needs evidence', q.finishResearch(r, 'l1', { outcome: 'supported', note: 'yes' }).error === 'supported_needs_evidence');
  check('W7b an explored lead ends supported with evidence', q.finishResearch(r, 'l1', { outcome: 'supported', note: 'it holds', evidence: { label: 'Sample' } }).ok && q.status(r.wonderer.leads[0]) === 'supported');
  check('W7c status words are the six canon words', ['waiting', 'exploring', 'using', 'set_aside', 'supported', 'not_supported'].every(k => !!STATUS_WORD[k]) && STATUS_WORD.waiting === 'Waiting for the team');
}
{
  const { q, r } = delivered('crew', 3);
  check('W8 a Crew’s final result waits while a lead is undecided', q.gate(r).code === 'undecided');
  q.dispose(r, 'l1', { kind: 'explore', reason: 'look', by: coord }); q.dispose(r, 'l2', { kind: 'use', reason: 'fits', by: coord }); q.dispose(r, 'l3', { kind: 'set_aside', reason: 'no', by: coord });
  check('W8b ... and while a lead is in research', q.gate(r).code === 'research');
  q.startResearch(r, 'l1', { id: 'a', name: 'A' }); q.finishResearch(r, 'l1', { outcome: 'not_supported', note: 'nothing found' });
  check('W8c ... and goes on once every lead is decided and back', q.gate(r).ok && q.status(r.wonderer.leads[0]) === 'not_supported');
  const room = delivered('chat_room');
  check('W8d a Chat Room never waits on a lead', room.q.gate(room.r).ok);
  check('W8e a room’s summary lists an undecided lead as not taken up', room.q.listing(room.r).every(x => x.word === 'Not taken up'));
  const c = q.counts(r);
  check('W8f the card counts leads explored, used, set aside and undecided', c.explored === 1 && c.used === 1 && c.setAside === 1 && c.undecided === 0);
  check('W9 the Wonderer never votes and never takes a turn', !q.canVote({ additiveRoleKind: 'wonderer' }) && !q.canTakeTurn({ additiveRoleKind: 'wonderer' }) && q.canVote({ additiveRoleKind: 'none' }));
  q.close(r);
  check('W10 once the team writes the result, a new pass and Check it are refused with that reason', q.requestPass(r, { by: { kind: 'user' }, messageId: 'm1' }).error === 'lead_admission_closed' && q.checkIt(r, 'l3').error === 'lead_admission_closed');
}

/* ------------------------------------------------------------------ engine: Grill Me (CWR-042, SS-038, APR-072) */
const TREE = [
  { id: 'd1', prompt: 'A?', options: [{ label: 'Yes' }, { label: 'No' }], recommended: 'Yes' },
  { id: 'd2', prompt: 'B?', options: [{ label: 'Yes' }, { label: 'No' }], recommended: 'Yes' },
  { id: 'f1', kind: 'fact', title: 'A fact' },
  { id: 'd3', prompt: 'C?', options: [{ label: 'Yes' }, { label: 'No' }], recommended: 'Yes', dependsOn: ['d1'] },
  { id: 'd4', prompt: 'D?', options: [{ label: 'Yes' }, { label: 'No' }], recommended: 'Yes', dependsOn: ['f1'] }
];
{
  const s = GE.create({ by: 'coordinator', tree: [{ id: 'f', kind: 'fact', title: 'A fact' }, { id: 'd', prompt: 'D?', options: [{ label: 'Yes' }, { label: 'No' }], recommended: 'Yes', dependsOn: ['f'] }] }).session;
  const r = GE.next(s);
  check('G0 when every question left hangs on a running lookup, the session waits and says what it looks up', r.waiting === 'research' && s.status === 'grilling' && GE.waiting(s) && GE.lookups(s).length === 1);
  check('G0b it never jumps to What we agreed while a lookup runs', s.status !== 'agreeing' && GE.agreed(s).decisions.length === 0);
  const later = GE.create({ by: 'coordinator', tree: TREE, gate: 'part:export', gateLabel: 'the export part' }).session;
  check('G0c a later session gates one named step', later.gate === 'part:export' && later.later === true);
}
check('G1 Grill Me has no participant of its own: only the one who talks to you grills', GE.create({ by: 'grill_me', tree: TREE }).error === 'grill_needs_the_one_who_talks_to_you' && ['coordinator', 'moderator', 'assistant'].every(b => GE.create({ by: b, tree: TREE }).ok));
check('G1b every decision carries a recommended answer', GE.create({ by: 'coordinator', tree: [{ id: 'x', prompt: 'X?', options: [{ label: 'a' }, { label: 'b' }] }] }).error === 'decision_needs_recommended_answer');
{
  const s = GE.create({ by: 'coordinator', tree: JSON.parse(JSON.stringify(TREE)) }).session, r1 = GE.next(s);
  check('G2 a round asks the whole frontier at once', r1.opened === 1 && r1.ids.join() === 'd1,d2');
  check('G2b a fact is routed to research, never asked', GE.node(s, 'f1').state === 'researching' && !r1.ids.includes('f1'));
  check('G2c a question that hangs on an open one waits for a later round', !r1.ids.includes('d3') && !r1.ids.includes('d4'));
  check('G2d a question already open stays out of the round (one round at a time)', GE.next(s).reused === true);
  GE.acceptRound(s);
  check('G3 one action accepts the whole round', GE.questions(s).every(n => n.answer === n.recommended));
  const r2 = GE.submitRound(s);
  check('G3b research never holds the round: only what hangs on the fact waits', r2.opened === 2 && r2.ids.join() === 'd3');
  GE.answer(s, 'd3', null);
  const r3 = GE.submitRound(s);
  check('G3c with research out, the session waits rather than asking a fact', r3.waiting === 'research');
  const r4 = GE.factFound(s, 'f1', 'found it');
  check('G3d the fact unlocks its decision', r4.opened === 3 && r4.ids.join() === 'd4');
  GE.acceptRound(s); GE.submitRound(s);
  const a = GE.agreed(s);
  check('G4 What we agreed lists every decision and every one left open', s.status === 'agreeing' && a.decisions.length === 3 && a.open.length === 1 && a.open[0].id === 'd3' && /weren’t sure/.test(a.open[0].why));
  check('G4b nothing acts until Confirm (the session holds)', GE.holds(s));
  check('G4c Keep going reopens the open decisions', GE.keepGoing(s).opened === 4 && GE.round(s).ids.join() === 'd3');
  GE.answer(s, 'd3', 'Yes'); GE.submitRound(s);
  check('G4d Confirm ends the hold', GE.confirm(s).ok && !GE.holds(s) && s.status === 'confirmed');
}
{
  const s = GE.create({ by: 'assistant', tree: JSON.parse(JSON.stringify(TREE)) }).session; GE.next(s);
  const w = GE.wrapUp(s);
  check('G5 Wrap up ends the interview and leaves the rest open', w.ended === 'wrap_up' && GE.agreed(s).open.some(o => o.id === 'd3' && /wrapped up/.test(o.why)));
  const c = GE.create({ by: 'moderator', tree: JSON.parse(JSON.stringify(TREE)), cap: 1 }).session; GE.next(c);
  check('G5b the question limit is a safety net that ends the session', GE.questions(c).length === 1 && (GE.acceptRound(c), GE.submitRound(c)).ended === 'cap');
  check('G5c Confirm before the end is refused', GE.confirm(GE.create({ by: 'coordinator', tree: TREE }).session).error === 'nothing_to_confirm_yet');
}
/* B2 (engine half): Wrap up never submits a draft; only answers you gave stand, the rest of the round is open */
{
  const s = GE.create({ by: 'assistant', tree: JSON.parse(JSON.stringify(TREE)) }).session; GE.next(s);
  GE.answer(s, 'd2', 'No');
  const w = GE.wrapUp(s), a = GE.agreed(s);
  check('G6 Wrap up keeps only the answer you gave; the untouched question is open, not answered (B2)', w.ended === 'wrap_up' && a.decisions.length === 1 && a.decisions[0].id === 'd2' && a.decisions[0].took === 'own' && a.open.some(o => o.id === 'd1' && /Not answered: you wrapped up/.test(o.why)), JSON.stringify(a.decisions.concat(a.open)));
}
/* M6, R2, m9: one counter per run; a question is charged once, on its first presentation; at the limit Keep going
   revisits but admits no new question */
{
  const bank = GE.localBank(4);
  const s1 = GE.create({ by: 'coordinator', tree: JSON.parse(JSON.stringify(TREE)), bank }).session; GE.next(s1);
  GE.acceptRound(s1); GE.submitRound(s1);                /* d1, d2 charged; d3 asked next (3) */
  GE.answer(s1, 'd3', null); GE.submitRound(s1);         /* d3 not sure; waits on f1 */
  GE.factFound(s1, 'f1', 'x'); GE.acceptRound(s1); GE.submitRound(s1); /* d4 (4): the bank is full */
  check('G7 a session charges the run’s one counter once per question (4 of 4)', GE.counter(s1).asked === 4 && GE.counter(s1).limit === 4, JSON.stringify(GE.counter(s1)));
  const before = GE.counter(s1).asked, kg = GE.keepGoing(s1);
  check('G7b Keep going asks the Not sure decision again for free (no second charge, M6)', kg.opened && GE.round(s1).ids.join() === 'd3' && GE.counter(s1).asked === before, JSON.stringify({ kg, asked: GE.counter(s1).asked }));
  GE.acceptRound(s1); GE.submitRound(s1);
  const s2 = GE.create({ by: 'coordinator', tree: [{ id: 'e1', prompt: 'E?', options: [{ label: 'Yes' }, { label: 'No' }], recommended: 'Yes' }], bank, gate: 'part:x' }).session;
  const n2 = GE.next(s2);
  check('G7c a later session borrows the same counter: at the limit it admits no new question (R2)', n2.ended === 'cap' && GE.counter(s2).asked === 4 && GE.agreed(s2).open.some(o => o.id === 'e1' && /limit/.test(o.why)), JSON.stringify(n2));
  const kg2 = GE.keepGoing(s1.status === 'confirmed' ? s1 : s1);
  check('G7d at the limit Keep going still revisits answers already given, free (ACD-503)', kg2.opened && GE.counter(s1).asked === 4 && GE.round(s1).ids.join() === 'd1,d2,d4', JSON.stringify(kg2));
  const s3 = GE.create({ by: 'assistant', tree: JSON.parse(JSON.stringify(TREE)), bank: GE.localBank(10) }).session; GE.next(s3); GE.answer(s3, 'd1', null); GE.answer(s3, 'd2', 'Yes'); GE.submitRound(s3);
  GE.wrapUp(s3); const charged = GE.counter(s3).asked, again = GE.reopen(s3, 'd1');
  check('G7e Ask again reopens one open decision without charging it again', again.opened && GE.round(s3).ids.join() === 'd1' && GE.counter(s3).asked === charged);
  const off = GE.create({ by: 'coordinator', tree: JSON.parse(JSON.stringify(TREE)) }).session; GE.next(off);
  check('G8 Grill Me turned off ends a session like Wrap up, open items listed (M2)', GE.switchOff(off).ended === 'switched_off' && GE.agreed(off).open.length >= 2 && GE.agreed(off).decisions.length === 0);
  const m = GE.map(GE.create({ by: 'assistant', tree: JSON.parse(JSON.stringify(TREE)) }).session);
  check('G9 the design tree knows what each decision unlocks', m.find(n => n.id === 'd1').unlocks.join() === 'd3' && m.find(n => n.id === 'f1').unlocks.join() === 'd4');
  /* round 2, ruling 1 (Astra F1 = Opus N1): a revisit left untouched withdraws nothing. Answer all four (d2 your own),
     Keep going revisits them; Wrap up, the limit or Grill Me off all give back the four submitted answers */
  const drain = k => { for (let i = 0; i < 8 && k.status === 'grilling'; i++) { if (GE.round(k)) { GE.acceptRound(k); GE.submitRound(k); } else if (GE.lookups(k).length) GE.factFound(k, 'f1', 'x'); } };
  const kept = why => { const k = GE.create({ by: 'assistant', tree: JSON.parse(JSON.stringify(TREE)) }).session; GE.next(k); GE.answer(k, 'd2', 'No'); GE.acceptRound(k); GE.submitRound(k); drain(k);
    const before = GE.agreed(k).decisions.map(d => d.id + '=' + d.answer + '/' + d.took).sort().join(); GE.keepGoing(k); const revisit = GE.round(k).ids.slice();
    if (why === 'off') GE.switchOff(k); else GE.wrapUp(k); const after = GE.agreed(k).decisions.map(d => d.id + '=' + d.answer + '/' + d.took).sort().join(); return { before, after, revisit, open: GE.agreed(k).open.length }; };
  const kw = kept('wrap'), ko = kept('off');
  check('G10 Keep going then an untouched Wrap up (or Grill Me off) keeps every submitted answer, downstream ones included (R2 ruling 1)', kw.before.split(',').length === 4 && kw.after === kw.before && ko.after === ko.before && kw.open === 0 && kw.revisit.length >= 2, JSON.stringify({ kw, ko }));
  /* ... while a revisited answer you change, or say Not sure about, replaces it */
  const kc = GE.create({ by: 'assistant', tree: JSON.parse(JSON.stringify(TREE)) }).session; GE.next(kc); drain(kc); GE.keepGoing(kc);
  GE.answer(kc, 'd1', 'No'); GE.answer(kc, 'd2', null); GE.wrapUp(kc);
  const kca = GE.agreed(kc);
  check('G11 in a revisit, a changed answer replaces the kept one and Not sure opens it (R2 ruling 1)', kca.decisions.some(d => d.id === 'd1' && d.answer === 'No' && d.took === 'own') && kca.open.some(o => o.id === 'd2' && o.reason === 'not_sure'), JSON.stringify(kca));
}

/* ------------------------------------------------------------------ static: the sources say the same */
const JS = readdirSync(ROOT).filter(f => f.endsWith('.js')).map(f => [f, readFileSync(path.join(ROOT, f), 'utf8')]);
const src = Object.fromEntries(JS);
const hits = (re, files) => JS.filter(([f]) => !files || files.includes(f)).flatMap(([f, s]) => (s.match(re) || []).map(m => f + ': ' + m.slice(0, 60)));
const grillPart = hits(/additiveRoleKind\s*:\s*'grill_me'|role\s*:\s*'Grill Me'|persona\s*:\s*'Implementer'\s*,\s*additiveRoleKind\s*:\s*'grill/g);
check('S1 no source makes a Grill Me participant, roster row or Persona', grillPart.length === 0, grillPart.join('; '));
check('S2 the specialist defaults give Grill Me no model, Persona or seat', !/SPECIALIST_DEFAULTS\s*=\s*\{[^}]*grillMe/.test(src['collaboration.js']) && !/SPECIALIST_SEAT\s*=\s*\{[^}]*grillMe/.test(src['collaboration.js']));
check('S3 the cast plate draws no Grill Me seat; the kettle rides the hub', !/role:\s*'grill'/.test(src['collaboration.js']) && /grill:\s*!!d\.grillMe/.test(src['collaboration.js']));
check('S4 the shelf says what the Wonderer does and that it never votes', /Explores around the topic for the team to weigh\. Never votes\./.test(src['collaboration.js']) && !/marked hypothesis/.test(src['collaboration.js']));
check('S4b the shelf says when it questions you and names who asks first', /'Questions you ' \+ when/.test(src['collaboration.js']) && /esc\(who\) \+ ' asks first/.test(src['collaboration.js']) && /'The Moderator' : 'The Coordinator'/.test(src['collaboration.js']));
check('S5 a room round never addresses the Wonderer', /filter\(pid=>!wonderer\(/.test(src['room-protocol.js']));
check('S5d a Chat Room never waits for the Wonderer’s pass', !/waiting_for_wonderer_first_pass/.test(src['room-protocol.js']) && !/waiting_for_wonderer_first_pass/.test(src['room-view.js']));
check('S5e synthesis and the final result close the run to new passes and Check it', /engine\.close\(r\)/.test(src['brainstorm-protocol.js']) && /engine\.close\(r\)/.test(src['crew-protocol.js']));
check('S5b a BrainStorm vote from the Wonderer is refused', /wonderer_never_votes/.test(src['brainstorm-protocol.js']));
check('S5c the Wonderer lane never says it waits its turn', !/waits its turn|waiting its turn/.test(src['wonderer-grill.js'].replace(/\/\*[\s\S]*?\*\//g, '')));
check('S6 the BrainStorm Wonderer workspace has no user decide controls', !/b13-decide|user_decided|Use as my decision/.test(src['lens-wonderer-batch13.js']));
check('S6b Write the plan and the Crew’s result read one gate', /WG\.engine\.gate\(r\)|PM56_WG\.engine\.gate\(r\)/.test(src['brainstorm-protocol.js']) && /WG\.engine\.gate\(r\)/.test(src['crew-protocol.js']));
/* round 2 nits (CONCEPT-ROUND2-RULINGS.md 11-17), read from the sources */
const CSSF = Object.fromEntries(readdirSync(ROOT).filter(f => f.endsWith('.css')).map(f => [f, readFileSync(path.join(ROOT, f), 'utf8')]));
check('R2-n11 one plain line per BrainStorm Grill Me toggle: the numbers fold into it, the technical "Effective question maximum" line only without PM56_WG', /if \(!WG_\(\)\) run\.messages\.push\(mkMsg\(run, \{[^}]*Effective question maximum/.test(src['collaboration.js']) && /function limitWords/.test(src['wonderer-grill.js']));
check('R2-n12 mid-run copy lowercases only the first letter of a part title', /t\.charAt\(0\)\.toLowerCase\(\)\+t\.slice\(1\)/.test(src['crew-protocol.js']) && !/a\.title\|\|'next'\)\.replace\(\/\\\.\$\/,''\)\.toLowerCase\(\)/.test(src['crew-protocol.js']));
check('R2-n13 the cap and done branch says "No more questions to ask." when decisions are left open', /No more questions to ask\./.test(src['wonderer-grill-demos.js']) && /No more questions to ask\./.test(src['lens-wonderer-batch13.js']));
check('R2-n14 a held BrainStorm pass says why once, on its held note; rows say Waiting for the team', !/note = '<p class="wg-lead-why">Held until every blind proposal is in\./.test(src['wonderer-grill.js']) && /held\?'Leads held for now'/.test(src['lens-wonderer-batch13.js']));
check('R2-n15 24 px above the Wonderer section in the Room transcript', /\.pmx-rv-scriptwrap \+ \.wg-section \{ margin-top: 24px; \}/.test(CSSF['wonderer-grill.css']));
check('R2-n16 a lead row reads like the listing: the team’s decision first, then research; the team’s reason in --muted', /return dec \+ head \+ note;/.test(src['wonderer-grill.js']) && /\.wg-team-why \{ color: var\(--muted\); \}/.test(CSSF['wonderer-grill.css']));
check('R2-n17 What we agreed’s title has a real face in Friendly and Retro (700)', /body\[data-theme\^="friendly"\] \.wg-agreed-title, body\[data-theme\^="retro"\] \.wg-agreed-title \{ font-weight: 700; \}/.test(CSSF['wonderer-grill.css']));

/* ------------------------------------------------------------------ contrast on the painted pixels (round 2, ruling 4)
   Hide only the measured text, screenshot its first line, sample the background the browser actually painted there
   (gradients, tints, translucency and images included), and composite the text colour (with its opacity chain) over
   each sample; the lowest ratio counts. This replaces compositing flat background colours, which missed the Ask
   Card's radial tint (Astra F4). */
async function pixelRatios(page, sels) {
  const out = {};
  for (const sel of sels) {
    /* the first match that is really on screen: brought into view, and the topmost element at its text's centre */
    let info = await page.evaluate(sel => {
      document.querySelectorAll('[data-pxc]').forEach(x => x.removeAttribute('data-pxc'));
      const textBox = el => { const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); for (let t = tw.nextNode(); t; t = tw.nextNode()) { if (!t.textContent.trim()) continue; const rg = document.createRange(); rg.selectNodeContents(t); const r = [...rg.getClientRects()].find(r => r.width > 4 && r.height > 4); if (r) return r; } return null; };
      for (const el of document.querySelectorAll(sel)) {
        if (!el.getClientRects().length || !el.textContent.trim() || getComputedStyle(el).visibility === 'hidden') continue;
        let r = textBox(el); if (!r) continue;
        if (r.top < 0 || r.bottom > innerHeight) { el.scrollIntoView({ block: 'center', behavior: 'instant' }); r = textBox(el); if (!r) continue; }
        const hit = document.elementFromPoint(r.left + Math.min(r.width / 2, 20), r.top + r.height / 2);
        if (hit && (hit === el || el.contains(hit))) { el.setAttribute('data-pxc', '1'); return true; }
      }
      return null;
    }, sel);
    if (!info) continue;
    await page.waitForTimeout(120);
    const geo = await page.evaluate(() => {
      const el = document.querySelector('[data-pxc="1"]'); if (!el) return null;
      const cs = getComputedStyle(el), tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), rects = [];
      for (let t = tw.nextNode(); t; t = tw.nextNode()) { if (!t.textContent.trim() || (t.parentElement && t.parentElement.closest('svg'))) continue; const rg = document.createRange(); rg.selectNodeContents(t); rects.push(...[...rg.getClientRects()].filter(r => r.width > 4 && r.height > 4)); }
      const r = rects[0] || el.getBoundingClientRect();
      let op = 1; for (let x = el; x && x.nodeType === 1; x = x.parentElement) op *= parseFloat(getComputedStyle(x).opacity || '1');
      return { color: cs.color, op, rect: { x: Math.max(0, r.left), y: Math.max(0, r.top), w: Math.min(r.width, 360), h: r.height } };
    });
    if (!geo || geo.rect.w < 4) { await page.evaluate(() => document.querySelectorAll('[data-pxc]').forEach(x => x.removeAttribute('data-pxc'))); continue; }
    Object.assign(info === true ? (info = {}) : info, geo);
    const vp = page.viewportSize(); if (info.rect.y + info.rect.h > vp.height || info.rect.x + 4 > vp.width) { await page.evaluate(() => document.querySelectorAll('[data-pxc]').forEach(x => x.removeAttribute('data-pxc'))); continue; }
    info.rect.w = Math.min(info.rect.w, vp.width - info.rect.x);
    await page.evaluate(() => { const st = document.createElement('style'); st.id = 'pxc-hide'; st.textContent = '[data-pxc="1"], [data-pxc="1"] * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; text-decoration-color: transparent !important; transition: none !important; } [data-pxc="1"] svg, [data-pxc="1"] .nx-i { visibility: hidden !important; }'; document.head.appendChild(st); });
    await page.waitForTimeout(80);
    /* a live chat may still scroll (a run posting, the transcript keeping to its end): clip where the text is when the
       shot is taken, and take it again if the text moved while it was being taken */
    const at = () => page.evaluate(() => { const el = document.querySelector('[data-pxc="1"]'); if (!el) return null; const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); for (let t = tw.nextNode(); t; t = tw.nextNode()) { if (!t.textContent.trim() || (t.parentElement && t.parentElement.closest('svg'))) continue; const rg = document.createRange(); rg.selectNodeContents(t); const r = [...rg.getClientRects()].find(r => r.width > 4 && r.height > 4); if (r) return { x: Math.max(0, r.left), y: Math.max(0, r.top) }; } return null; });
    let png = null, attempts = [];
    for (let k = 0; k < 4; k++) {
      const p0 = await at(); if (!p0 || p0.y < 0 || p0.y + info.rect.h > vp.height) break;
      info.rect.x = p0.x; info.rect.y = p0.y;
      const shot = await page.screenshot({ clip: { x: info.rect.x, y: info.rect.y, width: Math.max(4, Math.min(info.rect.w, vp.width - info.rect.x)), height: Math.max(4, info.rect.h) }, animations: 'disabled' });
      const p1 = await at();
      attempts.push({ before: p0, after: p1 });
      if (p1 && Math.abs(p1.x - p0.x) < 1 && Math.abs(p1.y - p0.y) < 1) { png = shot; break; }
      await page.waitForTimeout(250);
    }
    if (!png) { await page.evaluate(() => { const st = document.getElementById('pxc-hide'); if (st) st.remove(); document.querySelectorAll('[data-pxc]').forEach(x => x.removeAttribute('data-pxc')); }); paintFailures.push({ selector: sel, attempts, sizeContext: testGeometry() }); out[sel] = 0; continue; }
    await page.evaluate(() => { const st = document.getElementById('pxc-hide'); if (st) st.remove(); document.querySelectorAll('[data-pxc]').forEach(x => x.removeAttribute('data-pxc')); });
    out[sel] = await page.evaluate(async ([b64, color, op]) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      // Resolve computed CSS Color 4 inks through the browser too (PM7 tokens can compute to color(srgb ...)).
      const inkCanvas = document.createElement('canvas'); inkCanvas.width = inkCanvas.height = 1;
      const inkContext = inkCanvas.getContext('2d'); inkContext.fillStyle = color; inkContext.fillRect(0, 0, 1, 1);
      const rgba = inkContext.getImageData(0, 0, 1, 1).data, fg = { r: rgba[0], g: rgba[1], b: rgba[2] }, a = rgba[3] / 255 * op;
      const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
      let min = 99;
      for (const fy of [0.35, 0.5, 0.65]) for (let i = 1; i <= 7; i++) {
        const d = g.getImageData(Math.floor(img.width * i / 8), Math.floor(img.height * fy), 1, 1).data, bg = { r: d[0], g: d[1], b: d[2] };
        const f = { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a) };
        const L1 = lum(f), L2 = lum(bg); min = Math.min(min, (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05));
      }
      return Math.round(min * 100) / 100;
    }, [png.toString('base64'), info.color, info.op]);
  }
  return out;
}

/* ------------------------------------------------------------------ browser: what the screen shows */
async function browser() {
  let pw = null;
  for (const m of ['playwright', 'playwright-core']) { try { pw = await import(m); break; } catch (e) { } }
  if (!pw) { check('B0 a browser is available (playwright or playwright-core)', false, 'neither module resolves from ' + ROOT); return; }
  const chromium = pw.chromium || (pw.default && pw.default.chromium);
  const cdp = opt('--cdp');
  const b = await launchGpuBrowser(chromium);
  const ctx = b.contexts()[0];
  const page = gpuPage(b);
  const errs = []; page.on('pageerror', e => errs.push(String(e && e.message || e)));
  await page.setViewportSize({ width: 1440, height: 900 });
  const load = async () => { await target.load(page); await target.resize(page, { width: 1440, height: 900 }); };
  const ev = (fn, a) => page.evaluate(fn, a);
  const act = (name, data) => ev(([n, d]) => {
    const b = document.createElement('button'); Object.assign(b.dataset, d || {}); b.type = 'button'; b.dataset.action = n;
    (window.PM56_HOST?.root?.() || document.body).appendChild(b);
    try { b.click(); window.PM56_EXT.ctx().renderApp(); } finally { b.remove(); }
  }, [name, data || {}]);
  const sleep = ms => page.waitForTimeout(ms);
  const startSheet = async (holdFacts = false) => {
    await page.locator('#pmOverlayRoot .pmx-sheet .pmx-foot .primary-button').last().click();
    if (holdFacts) await ev(() => PM56_CLOCK.setScale(.01));
    await sleep(1400);
  };
  /* answer every round with Accept all until What we agreed is open; notes whether it waited on a lookup on the way */
  const answerAll = async (maxMs = 30000, resumeOnLookup = false) => {
    let resumed = false; const t0 = Date.now();
    await ev(() => {
      const root = window.PM56_HOST?.root?.() || document.body, tid = PM56_EXT.ctx().state.selectedThread;
      const p = window.__c56AnswerLookup = { seen: false, witness: null, since: null, samples: 0, agreedFacts: null };
      const read = () => {
        if (p.agreedFacts == null && PM56_EXT.ctx().state.selectedThread === tid && root.querySelector('.wg-agreed[data-state="open"]')) {
          const run = PM56_COLLAB.run(PM56_WG_DEMOS.snapshot()?.runId);
          p.agreedFacts = run?.grill?.tree.filter(n => n.kind === 'fact').map(n => ({ id: n.id, state: n.state })) || [];
        }
        const el = [...root.querySelectorAll('.wg-lookup')].find(el => /next round waits for it/.test(el.textContent));
        const r = el?.getBoundingClientRect(), h = r && document.elementFromPoint(r.left + Math.min(20, r.width / 2), r.top + r.height / 2);
        if (el && r.width && r.height && h && (h === el || el.contains(h)) && PM56_EXT.ctx().state.selectedThread === tid) {
          const now = performance.now(); if (p.since == null) p.since = now; p.samples++;
          if (p.samples >= 2 && now - p.since >= 200) { p.seen = true; p.witness = { thread: tid, first: p.since, last: now, samples: p.samples, text: el.textContent }; }
        } else { p.since = null; p.samples = 0; }
      };
      p.observer = new MutationObserver(read); p.observer.observe(root, { childList: true, subtree: true, characterData: true }); p.timer = setInterval(read, 100); read();
    });
    const done = async agreed => {
      const observed = await ev(() => {
        const r = PM56_COLLAB.run(PM56_WG_DEMOS.snapshot()?.runId);
        return { seen: !!__c56AnswerLookup.seen, witness: __c56AnswerLookup.witness, agreedFacts: __c56AnswerLookup.agreedFacts, facts: r?.grill?.tree.filter(n => n.kind === 'fact').map(n => ({ id: n.id, state: n.state })) || [] };
      });
      return { agreed, waited: observed.seen && (!resumeOnLookup || observed.agreedFacts?.length > 0 && observed.agreedFacts.every(n => n.state === 'found')), lookupWitness: observed.witness, factsWhenAgreedOpened: observed.agreedFacts, factsAfter: observed.facts };
    };
    try {
    while (Date.now() - t0 < maxMs) {
      if (resumeOnLookup && !resumed && await ev(() => __c56AnswerLookup.seen)) { await ev(() => PM56_CLOCK.setScale(1)); resumed = true; }
      if (await ev(() => !!document.querySelector('.wg-agreed[data-state="open"]'))) return await done(true);
      if (await ev(() => !!document.querySelector('.qs-grill [data-action="qs-accept-round"]'))) {
        await page.locator('.qs-grill [data-action="qs-accept-round"]').first().click({ timeout: 1500 }).catch(e => { if (!/Timeout|detached|not attached/.test(e.message)) throw e; });
        await sleep(500); continue;
      }
      await sleep(500);
    }
    return await done(false);
    } finally { await ev(resume => { window.__c56AnswerLookup?.observer.disconnect(); clearInterval(window.__c56AnswerLookup?.timer); delete window.__c56AnswerLookup; if (resume) PM56_CLOCK.setScale(1); }, resumeOnLookup); }
  };
  const wonLanes = () => ev(() => [...document.querySelectorAll('.pmx-lane[data-k*=":"]')].filter(l => /Wonderer/.test(l.querySelector('.pmx-lane-name')?.textContent || '')).map(l => l.textContent));
  const disabledSynthesis = async run => {
    const selector = '[data-action="collab-brainstorm-synthesize"][data-run="' + run + '"]';
    const state = await ev(({ selector, run }) => {
      const b = [...document.querySelectorAll(selector)].find(b => b.getBoundingClientRect().width && b.getBoundingClientRect().height);
      const g = PM56_WG.gate(PM56_COLLAB.run(run));
      return { present: !!b, native: !!b?.disabled, aria: b?.getAttribute('aria-disabled'), gateBefore: { ok: g.ok, code: g.code } };
    }, { selector, run });
    if (!state.present || state.native || target.kind !== 'pm7' || state.aria !== 'true') return { ...state, disabled: state.present ? state.native : null };
    await ev(() => {
      const original = PM56_EXT._actions['collab-brainstorm-synthesize'];
      if (typeof original !== 'function') throw new Error('Missing synthesis action for inertness probe');
      const p = window.__c56SynthesisProbe = { original, calls: 0 };
      PM56_EXT._actions['collab-brainstorm-synthesize'] = function (...args) { p.calls++; return original.apply(this, args); };
    });
    try {
      const button = page.locator(selector).filter({ visible: true }).first(); await button.scrollIntoViewIfNeeded();
      const point = await button.evaluate(b => { const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, h = document.elementFromPoint(x, y); return { x, y, painted: !!h && (h === b || b.contains(h)) }; });
      if (!point.painted) return { ...state, disabled: null, error: 'Disabled Write the plan is not painted at its click point' };
      const beforeClick = await ev(run => { const g = PM56_WG.gate(PM56_COLLAB.run(run)); return { ok: g.ok, code: g.code }; }, run);
      if (beforeClick.ok) return { ...state, gateAfter: beforeClick, disabled: null, transitioned: true };
      await page.mouse.click(point.x, point.y);
      const after = await ev(run => { const g = PM56_WG.gate(PM56_COLLAB.run(run)); return { calls: __c56SynthesisProbe.calls, gateAfter: { ok: g.ok, code: g.code } }; }, run);
      return { ...state, ...after, disabled: after.gateAfter.ok ? null : after.calls === 0, transitioned: !!after.gateAfter.ok };
    } finally { await ev(() => { PM56_EXT._actions['collab-brainstorm-synthesize'] = __c56SynthesisProbe.original; delete window.__c56SynthesisProbe; }); }
  };
  try {
    await load();
    /* WGV_ONLY=r2: the round 2 checks alone (a quick local loop; the full pass runs everything) */
    if (['r2', 'contrast'].includes(process.env.WGV_ONLY)) { await reviewRound2({ page, ev, act, sleep, startSheet, answerAll }); check('B7 no page errors', !errs.length, errs.slice(0, 3).join(' | ')); if (cdp) await b.close().catch(() => {}); else await b.close(); return; }
    /* WGV_ONLY=r1: the round 1 checks alone (a quick local loop) */
    if (process.env.WGV_ONLY === 'r1') { await reviewRound1({ page, ev, act, sleep, startSheet, answerAll }); check('B7 no page errors', !errs.length, errs.slice(0, 3).join(' | ')); if (cdp) await b.close().catch(() => {}); else await b.close(); return; }
    /* WGV_ONLY=rx: the recorded-examples checks alone (2026-10-21) */
    if (['rx', 'rx-starting', 'rx-tail'].includes(process.env.WGV_ONLY)) { await target.resize(page, { width: 1440, height: 900 }); await recordedExamples({ page, ev, act, sleep }); check('B7 no page errors', !errs.length, errs.slice(0, 3).join(' | ')); if (cdp) await b.close().catch(() => {}); else await b.close(); return; }
    /* WGV_ONLY=ax: every other Demo Studio example plays on its own (2026-10-22) */
    if (process.env.WGV_ONLY === 'ax') { await target.resize(page, { width: 1440, height: 900 }); await otherExamples({ page, ev, sleep }); check('B7 no page errors', !errs.length, errs.slice(0, 3).join(' | ')); if (cdp) await b.close().catch(() => {}); else await b.close(); return; }
    /* sheets: the shelf, the plate */
    for (const [kind, who] of [['crew', 'The Coordinator'], ['chat_room', 'The Moderator'], ['brainstorm', 'The Coordinator']]) {
      await ev(k => { const C = window.PM56_COLLAB, c = window.PM56_EXT.ctx(); c.switchThread('query'); C.openConfigure(k); const d = C.draft(); d.purpose = 'Make search easier to reach.'; d.wonderer = true; d.grillMe = true; c.openDialog({ type: 'collab-configure' }); c.renderOverlays(); }, kind);
      await sleep(700);
      const s = await ev(() => { const sh = document.querySelector('#pmOverlayRoot .pmx-sheet'); const g = sh.querySelector('.pmx-spec[data-k="pmx-spec-grillMe"]');
        return { plateGrillSeat: !!sh.querySelector('[data-k*=":grill"]'), kettle: !!sh.querySelector('.pmx-plate [data-grill="1"]'), switchItem: g && g.getAttribute('data-switch') === '1',
          picker: !!(g && g.querySelector('.shared-picker-button')), helper: g ? g.textContent : '', rosterGrill: [...sh.querySelectorAll('.pmx-row')].some(r => /Grill Me/.test(r.textContent)),
          wonderHelp: (sh.querySelector('.pmx-spec[data-k="pmx-spec-wonderer"]') || {}).textContent || '' }; });
      check('B1 ' + kind + ' sheet: no Grill Me seat in the plate, no roster row', !s.plateGrillSeat && !s.rosterGrill, JSON.stringify(s));
      check('B1b ' + kind + ' sheet: the lead stands behind the kettle', s.kettle);
      check('B1c ' + kind + ' sheet: Grill Me is a switch with no model picker, naming who questions you', s.switchItem && !s.picker && s.helper.includes(who), s.helper);
      check('B1d ' + kind + ' sheet: the Wonderer explores and never votes', /Never votes/.test(s.wonderHelp));
      await act('collab-modal-cancel').catch(() => {}); await ev(() => { const c = window.PM56_EXT.ctx(); c.closeDialog(); c.renderApp(); });
    }
    /* the Crew */
    // Keep the recorded fact pending while the precondition reads run, then let
    // its real timer finish once the lookup line has appeared in the chat.
    await ev(() => { PM56_CLOCK.setScale(1); window.PM56_WG_DEMOS.start('crew'); }); await sleep(900); await startSheet(true);
    const crew = await ev(() => { const s = window.PM56_WG_DEMOS.snapshot(), r = window.PM56_COLLAB.run(s.runId); return { id: r.id, grill: r.config.grill_me_enabled, facts: r.grill?.tree.filter(n => n.kind === 'fact').map(n => ({ id: n.id, state: n.state })), parts: r.participants.map(p => p.additiveRoleKind), q: document.querySelector('.qs-grill-bar') ? document.querySelector('.qs-grill-bar').textContent : '', pre: [...document.querySelectorAll('.qs-ask-opt.is-on .qs-rec')].length }; });
    check('B2 a Crew with Grill Me on adds nobody', crew.grill === true && !crew.parts.some(k => /grill/.test(k)) && crew.parts.filter(k => k === 'wonderer').length === 1, JSON.stringify(crew.parts));
    check('B2b the round is the questionnaire, the Coordinator grilling, the recommended answer preselected', /The Coordinator is grilling you/.test(crew.q) && crew.pre === 1, crew.q);
    const split = await ev(id => window.PM56_CREW.claim(id, 'normalize', { epoch: window.PM56_COLLAB.run(id).stopEpoch, sourceHash: window.PM56_COLLAB.run(id).crew.input.sourceHash }), crew.id);
    check('B2c the split waits for Confirm', split.error === 'grill_me_waits_for_confirm', JSON.stringify(split));
    const crewAns = await answerAll(40000, true);
    check('B2e grilling waited on a lookup instead of jumping to What we agreed', crewAns.waited, JSON.stringify(crewAns));
    results.at(-1).measured = { before: crew.facts, ...crewAns };
    const agreed = await ev(() => { const a = document.querySelector('.wg-agreed[data-state="open"]'); return a ? { rows: a.querySelectorAll('.wg-agreed-row').length, confirm: !!a.querySelector('[data-action="wg-confirm"]'), keep: !!a.querySelector('[data-action="wg-keep-going"]') } : null; });
    check('B2d What we agreed lists every decision, with Confirm and Keep going', agreed && agreed.rows === 5 && agreed.confirm && agreed.keep, JSON.stringify(agreed));
    if (process.env.WGV_ONLY === 'b2') { check('B7 no page errors', !errs.length, errs.slice(0, 3).join(' | ')); await b.close(); return; }
    await page.locator('.wg-agreed [data-action="wg-confirm"]').first().click();
    /* the recordings are paced for a person (2026-10-21); this pass reads their order, so it plays them 3x faster */
    const pace = k => ev(k => window.PM56_CLOCK.setScale(k), k);
    await pace(3);
    let laneBad = [], seen = 0, sawQueued = false, laterHeld = null, laterOther = false;
    for (let i = 0; i < 110; i++) {
      await sleep(700);
      const ls = await wonLanes(); seen += ls.length; laneBad = laneBad.concat(ls.filter(t => /waits its turn|waiting its turn/.test(t)));
      if (ls.some(t => /queued/.test(t))) sawQueued = true;
      const st = await ev(id => { const r = window.PM56_COLLAB.run(id), W = window.PM56_WG, s = W.activeSession(r); return { st: r.status, later: !!(s && s.later), held: W.stepHeld(r, 'part:export'), running: r.crew.assignments.filter(a => a.status === 'running' && a.id !== 'export').length, ex: (r.crew.assignments.find(a => a.id === 'export') || {}).status }; }, crew.id);
      if (st.later && st.held && laterHeld === null) laterHeld = await ev(id => window.PM56_CREW.claim(id, 'export', { epoch: window.PM56_COLLAB.run(id).stopEpoch, sourceHash: window.PM56_COLLAB.run(id).crew.input.sourceHash }), crew.id);
      if (st.later && st.running) laterOther = true;
      if (st.later && await ev(() => !!document.querySelector('[data-action="qs-accept-round"]'))) { await sleep(2500); await page.locator('[data-action="qs-accept-round"]').first().click().catch(() => {}); await sleep(1200); await page.locator('.wg-agreed[data-state="open"] [data-action="wg-confirm"]').first().click().catch(() => {}); }
      if (st.st === 'completed') break;
    }
    await pace(1);
    check('B3 the Wonderer lane shows, and never says it waits its turn', seen > 0 && !laneBad.length, laneBad[0] || 'no Wonderer lane seen');
    check('B3e a later pass with no free slot is queued, and its lane says so', sawQueued);
    check('B3f a later decision gates only the export part; the other parts keep going', laterHeld && laterHeld.error === 'grill_me_waits_for_confirm' && laterOther, JSON.stringify({ laterHeld, laterOther }));
    const done = await ev(id => { const r = window.PM56_COLLAB.run(id), W = window.PM56_WG; return { st: r.status, leads: r.crew.summary && r.crew.summary.leads ? r.crew.summary.leads.length : 0, total: W.engine.counts(r).total, explore: r.crew.assignments.filter(a => a.leadId && a.readOnly).length, wAssign: r.crew.assignments.some(a => r.participants.find(p => p.id === a.participantId)?.additiveRoleKind === 'wonderer'), cards: document.querySelectorAll('.wg-card').length }; }, crew.id);
    check('B3b the Crew finished and its result lists every lead', done.st === 'completed' && done.leads === done.total && done.total === 7, JSON.stringify(done));
    const closed = await ev(id => { const r = window.PM56_COLLAB.run(id), W = window.PM56_WG; return [W.engine.requestPass(r, { by: { kind: 'user' }, messageId: 'x' }).error, W.engine.checkIt(r, 'l3').error]; }, crew.id);
    check('B3g after the final result starts, a new pass and Check it are refused (the team is writing the result)', closed.every(e => e === 'lead_admission_closed'), closed.join(','));
    check('B3c explored leads became read-only parts; the Wonderer got no part', done.explore === 2 && !done.wAssign, JSON.stringify(done));
    check('B3d one Wonderer card per pass in the main chat', done.cards === 2, String(done.cards));
    /* the BrainStorm */
    await ev(() => window.PM56_WG_DEMOS.start('brainstorm')); await sleep(900); await startSheet();
    const bsId = await ev(() => window.PM56_BATCH13.currentRun().id);
    await sleep(3200);
    const held = await ev(id => { const r = window.PM56_COLLAB.run(id), W = window.PM56_WG; return { status: r.wonderer.passes[0].status, visible: W.engine.visible(r, r.wonderer.passes[0].id), phase: r.brainstorm.phase }; }, bsId);
    check('B4 a BrainStorm holds the Wonderer’s leads while the helpers draft', held.status === 'held' && !held.visible, JSON.stringify(held));
    /* while Grill Me holds it, the card stands at Understand the ask: nobody is drawn writing, and the sentence agrees */
    const gcard = await ev(() => { const el = document.querySelector('.transcript .collab-kind-brainstorm'); return el ? { notes: el.querySelectorAll('.pmx-bs-note').length, now: (el.querySelector('.pmx-track-now, [class*="track"] b') || {}).textContent || '', text: el.textContent } : null; });
    check('B4e while you are grilled the BrainStorm card draws no “writing” notes and stands at Understand the ask, naming Grill Me', !!gcard && gcard.notes === 0 && /Understand the ask/.test(gcard.text) && /Grill Me/.test(gcard.text) && !/proposals waits/.test(gcard.text), JSON.stringify(gcard && { notes: gcard.notes, now: gcard.now, text: gcard.text.slice(0, 300) }));
    await answerAll(30000);
    const early = await ev(id => { const r = window.PM56_COLLAB.run(id), a = r.brainstorm.attempts[0]; return window.PM56_BRAINSTORM.submitProposal(id, { epoch: r.stopEpoch, sourceHash: r.brainstorm.input.sourceHash, attemptId: a.id, assignmentRevision: a.assignmentRevision, proposal: {} }); }, bsId);
    check('B4b the blind proposals wait for Confirm', early.error === 'grill_me_waits_for_confirm', JSON.stringify(early));
    await page.locator('.wg-agreed [data-action="wg-confirm"]').first().click();
    await act('b13-open', { run: bsId }); await sleep(600); await pace(3);
    let normalized = null, waits = [], disabledEvidence = [], checked = false, firstPassAt = null;
    for (let i = 0; i < 120; i++) {
      await sleep(600);
      const st = await ev(id => { const r = window.PM56_COLLAB.run(id), W = window.PM56_WG, b = r.brainstorm; return { phase: b.phase, proposals: b.attempts.filter(a => a.status === 'completed').length, n: b.attempts.length, held: r.wonderer.passes[0].status, gate: W.gate(r), synth: !!b.synthesis, votes: (b.votes || []).length, wVote: (b.votes || []).some(v => r.participants.find(p => p.id === v.participantId)?.additiveRoleKind === 'wonderer'), undecidedLong: r.wonderer.leads.filter(l => !l.disposition && W.engine.visible(r, l.passId)).length }; }, bsId);
      if (st.proposals > 0 && firstPassAt === null) firstPassAt = st.held;
      if (!normalized && st.held === 'delivered') normalized = st;
      if (st.phase === 'vote' && !checked) { checked = true; await act('wg-check-it', { run: bsId, lead: 'instant' }); }
      if (st.phase === 'synthesis' && !st.gate.ok) { const dom = await disabledSynthesis(bsId); disabledEvidence.push({ gate: st.gate.code, ...dom }); if (!dom.gateBefore.ok && !dom.transitioned) waits.push(dom.gateBefore.code + ':' + dom.disabled); }
      if (st.phase === 'synthesis' && st.gate.ok) break;
      if (st.wVote) { check('B5 the Wonderer never votes', false, 'a Wonderer vote was recorded'); break; }
    }
    await pace(1);
    check('B4d the first pass ran during intake, before any blind proposal took a slot', firstPassAt === 'held', String(firstPassAt));
    check('B4c the leads are released only once every blind proposal is in', normalized && normalized.proposals === normalized.n && normalized.phase !== 'blind_proposals', JSON.stringify(normalized));
    check('B5 Write the plan waits for a pass in flight and for research (never for you), with the button disabled', waits.some(w => /^exploring:true/.test(w)) && waits.some(w => /^research:true/.test(w)) && !waits.some(w => /:false$/.test(w)), waits.join(','));
    results.at(-1).measured = disabledEvidence;
    const refused = await ev(id => { const r = window.PM56_COLLAB.run(id); return window.PM56_WG.gate(r).ok; }, bsId);
    await act('collab-brainstorm-synthesize', { run: bsId }); await sleep(1500);
    const plan = await ev(id => { const r = window.PM56_COLLAB.run(id), p = window.PM56_BRAINSTORM.planPayload(r); return { synth: !!r.brainstorm.synthesis, text: JSON.stringify(p.blocks), total: window.PM56_WG.engine.counts(r).total }; }, bsId);
    /* M4: every lead keeps the team's decision, its reason and recorder, and a research result is added under it */
    const decided = plan.text.match(/ — (Explore|Use|Set aside) \(the Coordinator: [^)]+\)/g) || [], researched = plan.text.match(/ — Explore \(the Coordinator: [^)]+\) → (Supported|Not supported): /g) || [];
    check('B5b the Plan lists every lead with the team’s decision and reason, and research under it (M4)', refused && plan.synth && /Wonderer leads/.test(plan.text) && decided.length === plan.total && researched.length >= 3, JSON.stringify({ total: plan.total, decided: decided.length, researched: researched.length }));
    if (process.env.WGV_ONLY === 'b5') { check('B7 no page errors', !errs.length, errs.slice(0, 3).join(' | ')); await b.close(); return; }
    /* Grill Me turned on mid-run (the 'dissent' recording) */
    await ev(() => { const b = document.createElement('button'); b.dataset.flow = 'dissent'; window.PM56_EXT.run('b13-start', b, new Event('click')); }); await sleep(900); await startSheet();
    const dsId = await ev(() => window.PM56_BATCH13.currentRun().id);
    await act('collab-brainstorm-toggle-grill', { run: dsId }); await pace(3);
    let mid = null, voteHeld = null, debatedWhileHeld = false;
    for (let i = 0; i < 90; i++) {
      await sleep(600);
      const st = await ev(id => { const r = window.PM56_COLLAB.run(id), W = window.PM56_WG, s = W.activeSession(r); return { phase: r.brainstorm.phase, later: !!(s && s.later), gate: s && s.gate, held: W.stepHeld(r, 'vote'), debates: r.brainstorm.debates.length, open: !!document.querySelector('[data-action="qs-accept-round"]') }; }, dsId);
      if (st.later && !mid) mid = st;
      if (st.held && st.debates > 0) debatedWhileHeld = true;
      if (st.held && st.phase === 'evidence' && voteHeld === null) voteHeld = await ev(id => { const r = window.PM56_COLLAB.run(id), a = r.brainstorm.attempts[0]; return window.PM56_BRAINSTORM.vote(id, a.participantId, { epoch: r.stopEpoch, sourceHash: r.brainstorm.input.sourceHash, proposalId: r.brainstorm.proposals[0].id, position: 'support', confidence: 'high', reason: 'x', evidenceRefs: ['requirements'] }); }, dsId);
      if (st.held && st.phase === 'evidence' && st.open) { await page.locator('[data-action="qs-accept-round"]').first().click(); await sleep(1300); await page.locator('.wg-agreed[data-state="open"] [data-action="wg-confirm"]').first().click(); }
      if (st.phase === 'synthesis') break;
    }
    await pace(1);
    check('B8 Grill Me turned on mid-run grills you at the next chapter, gating only the vote', mid && mid.gate === 'vote', JSON.stringify(mid));
    check('B8b work already running continues: the debate went on while the vote waited', debatedWhileHeld && voteHeld && voteHeld.error === 'grill_me_waits_for_confirm', JSON.stringify({ debatedWhileHeld, voteHeld }));
    check('B8c after Confirm the vote goes on', await ev(id => window.PM56_COLLAB.run(id).brainstorm.phase, dsId) === 'synthesis');
    /* the Chat Room */
    await ev(() => window.PM56_WG_DEMOS.start('room')); await sleep(900); await startSheet(); await sleep(1500);
    const roomId = await ev(() => window.PM56_WG_DEMOS.snapshot().runId);
    const r0 = await ev(id => { const r = window.PM56_COLLAB.run(id); return window.PM56_ROOM.beginRound(id, window.PM56_ROOM.envelope(id)); }, roomId);
    check('B6 round 1 waits for Confirm', r0.error === 'grill_me_waits_for_confirm', JSON.stringify(r0));
    const roomDock = await ev(() => (document.querySelector('.pmx-dock-say') || {}).textContent || '');
    check('B6g while the Moderator grills you, the dock says that move, not the room’s “start the first round”', /Moderator is grilling you/.test(roomDock) && !/start the first round/.test(roomDock), roomDock);
    await answerAll(30000);
    await page.locator('.wg-agreed [data-action="wg-confirm"]').first().click(); await sleep(3500);
    const onTime = await ev(id => { const r = window.PM56_COLLAB.run(id), W = window.PM56_WG; return { exploring: W.engine.state(r).passes[0].status === 'exploring', gate: window.PM56_ROOM.roundGate(r) }; }, roomId);
    check('B6a round 1 starts on time: the room never waits for the Wonderer', onTime.gate === null, JSON.stringify(onTime));
    let roomChecked = null;
    /* the rounds run by themselves (2026-10-21): as a person would, Check lead 3 once the Moderator has decided it,
       during round 1, so Design checks it in round 2 (M3) */
    let r3checked = false;
    for (let i = 0; i < 40 && !r3checked; i++) {
      r3checked = await ev(id => { const r = window.PM56_COLLAB.run(id), l = window.PM56_WG.engine.lead(r, 'r3'); if (!l || !l.disposition || l.research) return !!(l && l.research);
        const b = document.createElement('button'); b.dataset.run = id; b.dataset.lead = 'r3'; window.PM56_EXT.run('wg-check-it', b, new Event('click')); return true; }, roomId);
      if (!r3checked) await sleep(500);
    }
    for (let i = 0; i < 14; i++) {
      await act('wg-demo-step'); await sleep(7000);
      if (await ev(id => window.PM56_COLLAB.run(id).status, roomId) === 'completed') break;
      /* Check it on a decided lead the recording never researches: a core helper picks it up and reports back */
      if (!roomChecked) roomChecked = await ev(id => { const r = window.PM56_COLLAB.run(id), l = (r.wonderer.leads || []).find(x => x.disposition && !x.research && !/^r[23]$/.test(x.id));
        if (!l) return null; const b = document.createElement('button'); b.dataset.run = id; b.dataset.lead = l.id; window.PM56_EXT.run('wg-check-it', b, new Event('click')); return l.id; }, roomId);
    }
    const chk = await ev(([id, lid]) => { const r = window.PM56_COLLAB.run(id), l = lid && window.PM56_WG.engine.lead(r, lid), w = r.participants.find(p => p.additiveRoleKind === 'wonderer');
      return l ? { id: lid, via: l.research && l.research.via, status: l.research && l.research.status, by: l.research && l.research.by, byWonderer: !!(l.research && l.research.by && l.research.by.id === w.id) } : null; }, [roomId, roomChecked]);
    check('B6f Check it on a lead the recording has no step for: a core helper researches it and it comes back (nothing waits on it forever)', !!chk && chk.via === 'check_it' && /^(supported|not_supported)$/.test(chk.status) && !chk.byWonderer && !!chk.by, JSON.stringify(chk));
    const arrival = await ev(id => { const r = window.PM56_COLLAB.run(id), ms = r.messages, pi = ms.findIndex(m => m.messageType === 'wonderer_pass'), first = ms.findIndex(m => m.roomRound === 1 && m.senderKind === 'participant'); return { pi, first, decided: r.wonderer.leads.every(l => !!l.disposition), early: r.wonderer.passes[1] && r.wonderer.passes[1].stoppedEarly }; }, roomId);
    check('B6d the first pass joined the room between turns, after round 1 began', arrival.pi > arrival.first && arrival.first >= 0, JSON.stringify(arrival));
    check('B6e the Moderator decided each lead as it arrived; pass 2 stopped early with fewer leads', arrival.decided && arrival.early, JSON.stringify(arrival));
    const room = await ev(id => { const r = window.PM56_COLLAB.run(id), w = r.participants.find(p => p.additiveRoleKind === 'wonderer'), sum = r.messages.find(m => m.roomConclusion); return { st: r.status, wTurn: r.messages.some(m => m.senderId === w.id && m.roomRound), sum: sum ? sum.body : '', total: window.PM56_WG.engine.counts(r).total }; }, roomId);
    check('B6b the Wonderer takes no turn in any round', room.st === 'completed' && !room.wTurn, JSON.stringify({ st: room.st, wTurn: room.wTurn }));
    check('B6c the room’s summary lists every lead with what the room did with it', (room.sum.match(/^- /gm) || []).length === room.total && /Use \(the Moderator|Set aside \(the Moderator/.test(room.sum), room.sum.slice(-300));
    /* m1: a lead the Moderator decided never ends the room reading "not taken up" (the summary, or the leads update
       written as the room ends) */
    const m1room = await ev(id => { const r = window.PM56_COLLAB.run(id), msgs = r.messages.filter(m => m.roomConclusion || m.roomLeadsUpdate).map(m => m.body); const last = {}; msgs.forEach(b => b.split('\n').filter(x => /^- /.test(x)).forEach(x => { last[x.split(' — ')[0]] = x; })); const bad = r.wonderer.leads.filter(l => l.disposition && /not taken up/.test(last['- ' + l.title] || '')); return bad.map(l => l.id); }, roomId);
    check('B6h no lead the Moderator decided ends the room as “not taken up” (m1)', !m1room.length, JSON.stringify(m1room));
    /* M3: lead 3 is scripted, so Design checks it (never the fallback); the guide's words follow its real decision; every
       research note is a real result from the recording, and no summary carries stub copy */
    const m3 = await ev(id => { const r = window.PM56_COLLAB.run(id), W = window.PM56_WG, r3 = W.engine.lead(r, 'r3'), by = r3 && r3.research && r3.research.by, who = by && r.participants.find(p => p.id === by.id);
      const notes = r.wonderer.leads.filter(l => l.research && /^(supported|not_supported)$/.test(l.research.status)).map(l => ({ id: l.id, note: l.research.note || '', fx: !!(l.check && l.check.note === l.research.note) }));
      const sums = r.messages.filter(m => m.roomConclusion || m.roomLeadsUpdate).map(m => m.body).join('\n');
      return { r3: r3 && { via: r3.research && r3.research.via, st: r3.research && r3.research.status, by: who && (who.role || who.name) }, notes, stub: /stub|placeholder|lorem|TODO|a core helper checked it/i.test(sums + notes.map(n => n.note).join(' ')) }; }, roomId);
    check('R1-M3 the scripted lead 3 is checked by Design, every research note is the recording’s real result, no stub copy', !!m3.r3 && m3.r3.via === 'check_it' && /Design/.test(m3.r3.by || '') && /^(supported|not_supported)$/.test(m3.r3.st) && m3.notes.length >= 2 && m3.notes.every(n => n.note.length > 20 && n.fx) && !m3.stub, JSON.stringify(m3).slice(0, 600));
    /* the Deep Plan */
    await ev(() => window.PM56_WG_DEMOS.start('deepplan')); await sleep(1500);
    const tid = await ev(() => window.PM56_WG_DEMOS.snapshot().threadId);
    const noPlan = () => ev(t => !window.PM56_EXT.ctx().state.threads.find(x => x.id === t).messages.some(m => m.type === 'plan-card-v2'), tid);
    await page.locator('.qs-grill [data-action="qs-accept-round"]').first().click(); await sleep(1500);
    await page.locator('.qs-grill [data-action="qs-accept-round"]').first().click(); await sleep(2000);
    const look = await ev(t => { const s = window.PM56_WG.threadSession(t); return { waiting: window.PM56_WG.grill.waiting(s), status: s.status, line: (document.querySelector('.wg-lookup') || {}).textContent || '' }; }, tid);
    check('APR-072c grilling waits on a lookup and shows it is looking things up', look.waiting && look.status === 'grilling' && /Looking things up/.test(look.line), JSON.stringify(look));
    await answerAll(30000);
    check('APR-072 no Plan document before Confirm', await noPlan());
    await page.locator('.wg-agreed [data-action="wg-confirm"]').first().click(); await sleep(2500);
    let written = false; for (let i = 0; i < 20 && !written; i++) { written = !(await noPlan()); if (!written) await sleep(500); }
    check('APR-072b the Plan is written after Confirm', written);
    await reviewRound1({ page, ev, act, sleep, startSheet, answerAll });
    await reviewRound2({ page, ev, act, sleep, startSheet, answerAll });
    if (process.env.WGV_ONLY !== 'core') {
      await recordedExamples({ page, ev, act, sleep });
      await otherExamples({ page, ev, sleep });
    }
    check('B7 no page errors', !errs.length, errs.slice(0, 3).join(' | '));
  } catch (e) { check('B0 the browser pass ran to the end', false, e && e.stack || e); }
  if (cdp) await b.close().catch(() => {}); else await b.close();
}
/* ------------------------------------------------------------------ every other Demo Studio example plays on its own (2026-10-22)
   Jared said yes to doing for every other Demo Studio example what 2026-10-21 did for the Crew, BrainStorm, Review, Chat Room
   and Wonderer ones: after Start each plays to its end by itself, and stops only where the real product waits for you (an
   approval of work, a confirm, a decision a run waits on) or at the end. AX-*: each example is started the way a person
   starts it (Demo Studio, its trigger, the setup sheet's Start where it has one); after that the pass clicks nothing but
   the documented waits (`moves`, pressed in order when the guide says "Your move"), and checks that it reaches its end
   (a guide sentence starting "Done", or `endAt: 'yours'`: its last product wait), that something moves within 2 s of
   Start and nothing sits still for long (the longest gap between two things changing, waits excluded, under 9 s of
   motion time), that the guide's only button is Replay, that every narrated sentence stays 2 s or more, and that the
   playback runs 12-100 s of motion time (waits excluded). A capture-phase listener counts every trusted click after Start:
   only the documented moves may appear. Times are motion time (PM56_CLOCK); the pass runs the recordings 3x faster. */
const AX_EXAMPLES = [
  { name: 'Memory · A note a test proves', action: 'memory-demo-start', flow: 'verified' },
  { name: 'Memory · Your rule stays yours', action: 'memory-demo-start', flow: 'locked', endAt: 'yours' },
  { name: 'Teach · Save a rule from a message', action: 'teach-demo-start', flow: 'capture' },
  { name: 'Teach · When a reply misses your rule', action: 'teach-demo-start', flow: 'missed', endAt: 'yours' },
  { name: 'Teach · Edit a rule, then turn it off', action: 'teach-demo-start', flow: 'correct', moves: ['[data-action="teach-revoke-confirm"]'] },
  { name: 'Revert · Revert one whole change', action: 'revert-demo-start', flow: 'whole', moves: ['#pmOverlayRoot [data-action="af-revert-confirm"]'] },
  { name: 'Revert · Your later edit is protected', action: 'revert-demo-start', flow: 'conflict', moves: ['#pmOverlayRoot [data-action="af-revert-confirm"]'] },
  { name: 'ELI5 · Simple answers in one chat', action: 'eli5-demo-start', flow: 'override' },
  { name: 'ELI5 · Back to your usual setting', action: 'eli5-demo-start', flow: 'inherit' },
  { name: 'Plan · Build a small Plan', action: 'plan-demo-start', flow: 'complete', moves: ['[data-action="pd-build"]'] },
  { name: 'Plan · Stop and revise', action: 'plan-demo-start', flow: 'revise', moves: ['[data-action="pd-build"]'] },
  { name: 'Debug · Reproduce, repair, and close', action: 'debug-demo-start', flow: 'repair', moves: ['[data-action="debug-apply"]'] },
  { name: 'Debug · Protect a changed target', action: 'debug-demo-start', flow: 'drift', moves: ['[data-action="debug-apply"]', '[data-action="debug-rebind"]', '[data-action="debug-apply"]'] },
  { name: 'Back Seat Driver · Catch a missing measurement', action: 'bsd12-start', flow: 'survives' },
  { name: 'Back Seat Driver · Resolve it before it reaches you', action: 'bsd12-start', flow: 'resolves' },
  { name: 'Plan scheduling · Schedule and build', action: 'schedule-demo-start', flow: 'due', moves: ['#pmOverlayRoot [data-action="sched-create-build"]'] },
  { name: 'Plan scheduling · Revise a scheduled Plan', action: 'schedule-demo-start', flow: 'revise', moves: ['#pmOverlayRoot [data-action="sched-create-build"]', '#pmOverlayRoot [data-action="sched-rebind-build"]'] },
  { name: 'Plan scheduling · Cancel a scheduled build', action: 'schedule-demo-start', flow: 'cancel', moves: ['#pmOverlayRoot [data-action="sched-create-build"]'] },
  { name: 'Batch 18 · Send the version you scheduled', action: 'b18-start', flow: 'messages' },
  { name: 'Batch 18 · One build, across two windows', action: 'b18-start', flow: 'windows', moves: ['#pmOverlayRoot [data-action="sched-create-build"]'] },
  { name: 'Batch 18 · Schedule a frozen Crew', action: 'b18c-start', flow: 'crew', moves: ['#pmOverlayRoot [data-action="sched-create-build"]'] },
  { name: 'Batch 18 · Send to the same discussion', action: 'b18c-start', flow: 'room', sheet: true, max: 110000 },
  { name: 'Batch 18 · Keep a folder unchanged', action: 'b18c-start', flow: 'folder' },
  { name: 'Context Lens · Shape, summarize, and restore', action: 'b13-start', flow: 'shape' },
  { name: 'Context Lens · A preview is not a promise', action: 'b13-start', flow: 'stale' }
].concat(AX_MORE);
async function otherExamples({ page, ev, sleep }) {
  const SCALE = +(process.env.AX_SCALE || 3), only = process.env.AX_ONLY ? new RegExp(process.env.AX_ONLY, 'i') : null;
  const width = +(process.env.AX_WIDTH || 1440);
  const selected = AX_EXAMPLES.filter(x => !only || only.test(x.name + ' ' + x.action + ' ' + x.flow));
  if (!selected.length) throw new Error('AX_ONLY matched no examples');
  if (width !== 1440) await target.resize(page, { width, height: 900 });
  for (const x of selected) {
    const label = 'AX ' + x.name + (width !== 1440 ? ' @' + width : '');
    /* a fresh page for each example: what one leaves behind (a schedule, an open document) never starts the next */
    await target.load(page); await sleep(600);
    await ev(k => window.PM56_CLOCK.setScale(k), x.scale || SCALE);
    /* the recorder: guide sentences (motion time), guide buttons, trusted clicks, and when anything on screen last changed */
    await ev(() => {
      if (window.__axStop) window.__axStop();
      const K = window.PM56_CLOCK, log = window.__ax = { t0: K.now(), sentences: [], buttons: {}, clicks: 0, changes: [], yours: 0 };
      const vis = n => n && n.isConnected && (n.checkVisibility ? n.checkVisibility() : n.getClientRects().length > 0);
      const read = () => {
        const t = K.now(), all = [...document.querySelectorAll('.pmx-guide')].filter(vis);
        const g = all.find(n => n.closest('#pmOverlayRoot')) || all[0], text = g ? (g.querySelector('.pmx-guide-step') || g).textContent.trim() : '';
        const last = log.sentences[log.sentences.length - 1];
        if (!last || last.text !== text) log.sentences.push({ t, text, yours: /^Your move/.test(text) });
        all.forEach(n => n.querySelectorAll('button').forEach(b => { if (vis(b) && !b.classList.contains('pmx-guide-close')) log.buttons[b.textContent.trim()] = 1; }));
      };
      /* the recording's finger (.rec-tap) counts as movement; the guide's next-step hairline is CSS only */
      const mo = new MutationObserver(ms => { if (ms.some(m => !(m.target.closest && m.target.closest('.pmx-guide-next')))) log.changes.push(K.now()); requestAnimationFrame(read); });
      mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['data-state', 'aria-expanded', 'value', 'class'] });
      const onClick = e => { if (e.isTrusted) log.clicks++; };
      document.addEventListener('click', onClick, true);
      const iv = setInterval(read, 150); read();
      window.__axStop = () => { mo.disconnect(); clearInterval(iv); document.removeEventListener('click', onClick, true); read(); };
    });
    /* Start, the way a person does: Demo Studio, the example's trigger (and its setup sheet's Start) */
    const trig = await target.demoTrigger(page, x.action, x.flow);
    if (!(await trig.count())) { check(label + ': is in Demo Studio', false, x.action + ' ' + x.flow); continue; }
    await trig.scrollIntoViewIfNeeded(); await trig.click();
    if (x.sheet) { await page.waitForFunction(() => !!document.querySelector('#pmOverlayRoot .pmx-sheet .pmx-foot .primary-button'), null, { timeout: 8000 }).catch(() => {}); await page.locator('#pmOverlayRoot .pmx-sheet .pmx-foot .primary-button').last().click(); }
    await ev(() => { const x = window.__ax; x.t0 = window.PM56_CLOCK.now(); x.startClicks = x.clicks; x.changes = x.changes.filter(t => t >= x.t0); });
    const t0 = Date.now(), max = x.max || 90000, moves = (x.moves || []).slice();
    let ended = false, pressed = 0, waitMs = 0;
    while (Date.now() - t0 < max) {
      const st = await ev(() => { const vis = n => n && (n.checkVisibility ? n.checkVisibility() : n.getClientRects().length > 0), all = [...document.querySelectorAll('.pmx-guide')].filter(vis);
        const g = all.find(n => n.closest('#pmOverlayRoot')) || all[0], text = g ? (g.querySelector('.pmx-guide-step') || g).textContent.trim() : '';
        return { text, err: Object.values(window.PM56_RECPLAY.snapshot()).some(p => p.errors.length) }; });
      if (/^Done\b/.test(st.text) || st.err) { ended = !st.err; break; }
      if (/^Your move/.test(st.text)) {
        if (!moves.length && x.endAt === 'yours') { ended = true; break; }
        if (moves.length) {
          /* a person reads the question before answering it (excluded from the playback time) */
          const w0 = await ev(() => window.PM56_CLOCK.now()); await sleep(700);
          /* the control a person can reach: of the visible matches, the one on top at its own centre (at a narrow width an
             open document covers the chat's copy of the same control) */
          if (moves[0] === '@q') {
            const pick = sel => ev(sel => { const b = [...document.querySelectorAll(sel)].find(b => !b.disabled && (b.checkVisibility ? b.checkVisibility() : b.getClientRects().length)); if (!b) return false; b.scrollIntoView({ block: 'nearest' }); return true; }, sel);
            const clickSel = async sel => { if (!(await pick(sel))) return false; await page.locator(sel).filter({ visible: true }).first().click(); await sleep(450); return true; };
            let answered = false;
            for (let k = 0; k < 16; k++) {
              if (!(await pick('.decision-host .qs-reel'))) break;
              await clickSel('.decision-host .qs-reel [data-action="answer-choice"]');
              if (await clickSel('.decision-host [data-action="submit-questionnaire"]')) { answered = true; break; }
              await clickSel('.decision-host [data-action="next-question"]');
            }
            if (answered) { moves.shift(); pressed++; await ev(() => { window.__ax.yours++; }); }
            waitMs += (await ev(() => window.PM56_CLOCK.now())) - w0; await sleep(400); continue;
          }
          const sel = moves[0], nth = await ev(sel => [...document.querySelectorAll(sel)].findIndex(b => { if (!(b.checkVisibility ? b.checkVisibility() : b.getClientRects().length)) return false;
            b.scrollIntoView({ block: 'nearest' }); const q = b.getBoundingClientRect(), top = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return !!top && (top === b || b.contains(top)); }), sel);
          if (nth >= 0) { await page.locator(sel).nth(nth).click(); moves.shift(); pressed++; await ev(() => { window.__ax.yours++; }); }
          waitMs += (await ev(() => window.PM56_CLOCK.now())) - w0; await sleep(400); continue;
        }
      }
      await sleep(200);
    }
    const r = await ev(() => { window.__axStop && window.__axStop(); const x = window.__ax, K = window.PM56_CLOCK, now = K.now(), P = window.PM56_RECPLAY.snapshot();
      const s = x.sentences.filter(e => e.text && e.t >= x.t0 - 5000), timed = s.slice(0, -1).map((e, i) => ({ text: e.text, d: s[i + 1].t - e.t, yours: e.yours })).filter(e => !e.yours);
      const ch = x.changes.filter(t => t >= x.t0), first = ch.length ? ch[0] - x.t0 : null;
      let gap = 0; for (let i = 1; i < ch.length; i++) gap = Math.max(gap, ch[i] - ch[i - 1]);
      return { total: Math.round(now - x.t0), first: first == null ? null : Math.round(first), gap: Math.round(gap), minDwell: timed.length ? Math.round(Math.min(...timed.map(e => e.d))) : null, short: timed.filter(e => e.d < 2000).map(e => e.text.slice(0, 40) + ' ' + Math.round(e.d)),
        buttons: Object.keys(x.buttons), clicks: x.clicks - (x.startClicks || 0), yours: x.yours, sentences: s.length, last: s.length ? s[s.length - 1].text.slice(0, 120) : '', errors: [].concat(...Object.values(P).map(p => p.errors)) }; });
    const play = r.total - waitMs, doc = (x.moves || []).length ? ' (your moves: ' + x.moves.length + ')' : x.endAt === 'yours' ? ' (it ends on your move)' : '';
    check(label + ': plays on its own from Start to its end' + doc, ended && pressed === (x.moves || []).length && !r.errors.length, JSON.stringify({ ended, pressed, last: r.last, errors: r.errors }));
    if (x.action === 'b16-start' && x.flow === 'restructure') {
      const work = await ev(() => { const w = PM56_B16_WORK.snapshot(), p = w && PM56_PLANS.get(w.planId), old = w?.restructure?.original_binding;
        const b = old && PM56_TODOS.bindings(w.threadId).find(b => b.binding_id === old.binding_id);
        return { refined: !!old, sameAttempt: !!b && ['todo_id', 'work_id', 'attempt_id', 'expected_outcome'].every(k => b[k] === old[k]),
          samePlan: !!p && w.restructure?.plan_hash === PM56_PLANS.hash(p.plan_id), complete: !!p && p.status === 'completed' && PM56_B16_WORK.inspect(w.id, p).complete }; });
      check(label + ': refinement retains the admitted attempt and approved Plan through accepted completion', work.refined && work.sameAttempt && work.samePlan && work.complete, JSON.stringify(work));
    }
    /* an Ask Card round takes several clicks (a choice per question, Next, Submit): counted as the one move it is */
    const qRounds = (x.moves || []).filter(m => m === '@q').length;
    check(label + ': no click after Start but the documented moves', qRounds ? r.clicks >= pressed && r.clicks <= pressed + qRounds * 16 : r.clicks === pressed, JSON.stringify({ clicks: r.clicks, pressed }));
    check(label + ': something moves within 2 s of Start, and nothing sits still for long', r.first != null && r.first <= 2000 && r.gap <= 9000 * 1, JSON.stringify({ first: r.first, gap: r.gap }));
    check(label + ': the guide narrates (its only button is Replay)', r.buttons.every(b => b === 'Replay') && r.sentences >= 3, JSON.stringify({ buttons: r.buttons, sentences: r.sentences }));
    check(label + ': paced to follow (every narrated sentence stays 2 s or more; the playback, less your moves, runs 12-100 s)', r.minDwell != null && r.minDwell >= 2000 && play >= 12000 && play <= 100000, JSON.stringify({ minDwell: r.minDwell, short: r.short, play }));
  }
}
/* ------------------------------------------------------------------ recorded examples play on their own (2026-10-21)
   Jared (Edge, 1680x1300): "The recorded example of the chat room keeps asking me to click Next Round and stuff. I
   thought it would be automated. When you click Show all, it doesn't, it compacts the box. The BrainStorm demo doesn't
   work at all. Neither does Review. Neither does Crew. Also, the card starts with the chevron down; click it and it just
   flips the chevron up, click again and it compacts."
   RX-*: every listed example, from Start, with no click but the moves the product itself waits for (the Ask Card, What
   we agreed's Confirm, Write the plan, Next Round, Summarize Now, End discussion), reaches its end or its documented wait
   point; no card says Starting for more than 2 s; the guide shows no button but Replay; nothing on screen offers Play
   the recording, Watch the Crew work or Do this step; each guide sentence after Start stays at least 2 s (but the brief
   "Starting" one, which the 2 s rule bounds) and the playback runs 12-100 s. Times are motion time (PM56_CLOCK): the
   pass runs the recordings 3x faster than a person watches them, so a Starting span also counts 3x the browser's own
   render time.
   SA-*: Show all lists every lane in place and Show fewer folds back; the card never folds. CV-*: the chevron always
   matches the card, and its first click changes it. */
async function recordedExamples({ page, ev, act, sleep }) {
  const SCALE = Number(opt('--rx-scale') || 3), fast = k => ev(k => window.PM56_CLOCK.setScale(k), k);
  const onlyStarting = process.env.WGV_ONLY === 'rx-starting';
  const onlyTail = process.env.WGV_ONLY === 'rx-tail';
  if (![1, 3].includes(SCALE)) throw new Error('--rx-scale must be 1 (normal pace) or 3 (original accelerated verifier)');
  const until = (fn, arg, ms = 60000) => page.waitForFunction(fn, arg, { timeout: ms, polling: 120 }).then(() => true, () => false);
  const click = async sel => { try { const l = page.locator(sel).first(); if (await l.count() && await l.isVisible()) { await l.click({ timeout: 3000 }); return true; } } catch (e) { } return false; };
  const sheetStart = async () => { await until(() => !!document.querySelector('#pmOverlayRoot .pmx-sheet .pmx-foot .primary-button'), null, 8000); await page.locator('#pmOverlayRoot .pmx-sheet .pmx-foot .primary-button').last().click(); await ev(() => { if (window.__rx && window.__rx.started == null) window.__rx.started = window.PM56_CLOCK.now(); }); };
  /* the recorder: every visible guide sentence (motion time), every guide button, how long each card said Starting, and
     any retired control anywhere on screen */
  const record = () => ev(() => {
    if (window.__rxStop) window.__rxStop();
    const K = window.PM56_CLOCK, log = window.__rx = { t0: K.now(), guide: [], buttons: {}, starting: {}, banned: [], held: 0 };
    let queued = false, lastT = K.now(), lastHeld = false;
    /* time Grill Me spends asking you (the Ask Card, What we agreed, its lookups) is the interview, not the playback */
    const asking = () => { const W = window.PM56_WG, c = window.PM56_EXT.ctx(), tid = c.state.selectedThread; if (!W) return false;
      const ts = W.threadSession(tid); if (ts && (ts.status === 'grilling' || ts.status === 'agreeing')) return true;
      return window.PM56_COLLAB.runsForThread(tid).some(r => W.holds(r) || !!W.activeSession(r)); };
    const read = () => {
      queued = false; const t = K.now();
      if (log.started != null) { if (lastHeld) log.held += t - lastT; } lastT = t; const wasHeld = lastHeld; lastHeld = asking();
      const g = [...document.querySelectorAll('.pmx-guide')].filter(n => n.getClientRects().length)[0];
      const text = g ? (g.querySelector('.pmx-guide-step') || g).textContent.trim() : '';
      if (!log.guide.length || log.guide[log.guide.length - 1].text !== text) log.guide.push({ t, text, asking: lastHeld || (log.askedUntil != null && t - log.askedUntil < 300) });
      if (wasHeld && !lastHeld) log.askedUntil = t;
      if (g && log.started != null) g.querySelectorAll('button').forEach(b => { const l = b.textContent.trim(); if (l) log.buttons[l] = 1; });
      document.querySelectorAll('.transcript article.pmx-run[data-run-id]').forEach(c => {
        const id = c.getAttribute('data-run-id'), s = c.querySelector('.pmx-sentence'), on = c.getAttribute('data-density') === 'starting' || !!(s && /^Starting\b/.test(s.textContent.trim()));
        const x = log.starting[id] || (log.starting[id] = { since: null, max: 0 });
        if (on && x.since == null) x.since = t; if (!on && x.since != null) { x.max = Math.max(x.max, t - x.since); x.since = null; }
      });
      document.querySelectorAll('button').forEach(b => { if (b.getClientRects().length && /Play the recording|Watch the Crew work|Do this step/.test(b.textContent)) log.banned.push(b.textContent.trim()); });
    };
    const mo = new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(read); } });
    mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['data-density'] });
    const iv = setInterval(read, 200); read();
    window.__rxStop = () => { mo.disconnect(); clearInterval(iv); read(); };
  });
  const report = () => ev(() => { window.__rxStop && window.__rxStop(); const x = window.__rx, K = window.PM56_CLOCK, now = K.now();
    Object.values(x.starting).forEach(s => { if (s.since != null) s.max = Math.max(s.max, now - s.since); });
    /* a sentence shown while Grill Me asks you ends when you answer (here at once), and the one your answer brings may
       meet the next recorded step at once: their times are yours, not the pace */
    const from = x.started != null ? x.started : x.t0, g = x.guide.filter(e => e.text), timed = g.slice(0, -1).map((e, i) => ({ text: e.text, t: e.t, d: g[i + 1].t - e.t, asking: e.asking }))
      .filter(e => e.t >= from - 1 && !e.asking && !/^(Starting\b|The room is starting)/.test(e.text));
    return { total: Math.round(now - from - x.held), interview: Math.round(x.held), starting: Math.round(Math.max(0, ...Object.values(x.starting).map(s => s.max))), minDwell: timed.length ? Math.round(Math.min(...timed.map(e => e.d))) : null,
      short: timed.filter(e => e.d < 2000).map(e => e.text.slice(0, 50) + ' ' + Math.round(e.d)), buttons: Object.keys(x.buttons), banned: [...new Set(x.banned)], sentences: g.length }; });
  const verdict = (name, r, ok, extra) => {
    const buttonsOk = r.buttons.every(b => b === 'Replay');
    check('RX ' + name + ': plays on its own from Start to its end or wait point' + (extra ? ' (' + extra + ')' : ''), ok, JSON.stringify(r).slice(0, 500));
    check('RX ' + name + ': no card says Starting for more than 2 s, and nothing offers Play the recording, Watch the Crew work or Do this step', r.starting <= 2000 && !r.banned.length, JSON.stringify({ starting: r.starting, banned: r.banned }));
    check('RX ' + name + ': the guide narrates (its only button is Replay)', buttonsOk && r.sentences >= 2, JSON.stringify({ buttons: r.buttons, sentences: r.sentences }));
    check('RX ' + name + ': paced to follow (every guide sentence stays 2 s or more; the playback, less any Grill Me interview, runs 12-100 s)', r.minDwell != null && r.minDwell >= 2000 && r.total >= 12000 && r.total <= 100000, JSON.stringify({ minDwell: r.minDwell, short: r.short, total: r.total }));
  };
  const runOf = (kind) => ev(k => { const c = window.PM56_EXT.ctx(); const r = window.PM56_COLLAB.runsForThread(c.state.selectedThread).filter(x => x.kind === k).pop(); return r ? r.id : null; }, kind);
  const st = id => ev(id => { const r = window.PM56_COLLAB.run(id); if (!r) return {}; return { status: r.status, phase: r.brainstorm ? r.brainstorm.phase : r.review ? r.review.phase : '', synth: !!(r.brainstorm && r.brainstorm.synthesis), decision: !!(r.brainstorm && r.brainstorm.decision), rounds: r.chatRoom ? r.chatRoom.roundsSoFar : null, inRound: !!(r.chatRoom && r.chatRoom.round && !r.chatRoom.round.complete), summary: !!(r.chatRoom && r.chatRoom.summary) }; }, id);
  /* the user's own move on the card: the product's control, pressed where a person would */
  const cardMove = async (id, action) => click('.transcript [data-run-id="' + id + '"] [data-action="' + action + '"]');

  await fast(SCALE);
  let id = null, ok;
  if (!onlyTail) {
  /* Crew: Delegate and verify */
  await act('crew-demo-start', { flow: 'delegation' }); await sleep(900);
  await record(); await sheetStart();
  await until(() => true, null, 300); id = await runOf('crew');
  ok = await until(id => window.PM56_COLLAB.run(id) && window.PM56_COLLAB.run(id).status === 'completed', id, 60000);
  verdict('Crew · Delegate and verify', await report(), ok);
  if (!onlyStarting) {
  /* Crew Auto: its rules saved, it sends its three requests itself and brings in a Crew for the big job */
  await act('crew-demo-start', { flow: 'auto' }); await sleep(900);
  await record(); await sheetStart();
  ok = await until(() => { const s = window.PM56_CREW_DEMOS.snapshot(); return !!(s && s.evaluations.length === 3 && s.runId && window.PM56_COLLAB.run(s.runId).status === 'completed'); }, null, 60000);
  const autoSnap = await ev(() => { const s = window.PM56_CREW_DEMOS.snapshot(); return s ? s.evaluations.map(e => e.which + ':' + (e.result.admitted ? 'crew' : e.result.reason)) : null; });
  verdict('Crew · Crew Auto', await report(), ok, (autoSnap || []).join(' '));
  }
  /* BrainStorm, both recordings: to Ready to write the plan (your move), then Write the plan on the card */
  for (const flow of ['synthesis', 'constraint']) {
    await act('brainstorm-demo-start', { flow }); await sleep(900);
    await record(); await sheetStart();
    await until(() => true, null, 300); id = await runOf('brainstorm');
    const waited = await until(id => { const r = window.PM56_COLLAB.run(id); return r && r.brainstorm.phase === 'synthesis' && !!r.brainstorm.decision && !r.brainstorm.synthesis; }, id, 60000);
    const rep = await report();
    const wrote = waited && await cardMove(id, 'collab-brainstorm-synthesize') && await until(id => !!window.PM56_COLLAB.run(id).brainstorm.synthesis, id, 15000);
    verdict('BrainStorm · ' + flow, rep, waited && wrote, 'waits at Ready to write the plan; Write the plan on the card writes it');
  }
  /* Review, both recordings: to the finished report */
  if (!onlyStarting) for (const flow of ['single', 'multi']) {
    await act('review-demo-start', { flow }); await sleep(900);
    await record(); await sheetStart();
    await until(() => true, null, 300); id = await runOf('review');
    ok = await until(id => window.PM56_COLLAB.run(id).status === 'completed', id, 60000);
    verdict('Review · ' + flow, await report(), ok);
  }
  /* Chat Room, both recordings (Jared, 2026-10-21: a Chat Room runs its rounds by itself): Start opens round 1, every
     round follows by itself, and the room waits only at the end of its rounds. The discussion waits there (Summarize
     Now, End discussion on the card); the plan example's Moderator sums up by itself, and you promote the summary. */
  for (const flow of ['discussion', 'plan']) {
    await act('room-demo-start', { flow }); await sleep(900);
    await record(); await sheetStart();
    await until(() => true, null, 300); id = await runOf('chat_room');
    const max = flow === 'plan' ? 1 : 2;
    const waited = await until(([id, max]) => { const r = window.PM56_COLLAB.run(id), s = r.chatRoom; return s.roundsSoFar >= max && (!s.round || s.round.complete) && !!window.PM56_ROOM.waitsFor(r); }, [id, max], 60000);
    const at = await ev(id => { const r = window.PM56_COLLAB.run(id), g = [...document.querySelectorAll('.pmx-guide')].filter(n => n.getClientRects().length)[0], c = document.querySelector('.transcript [data-run-id="' + id + '"]');
      return { why: window.PM56_ROOM.waitsFor(r), rounds: r.chatRoom.roundsSoFar, summary: !!r.chatRoom.summary, density: c && c.getAttribute('data-density'), guide: g ? g.textContent : '', ask: [...document.querySelectorAll('button')].some(b => /Ask Everyone/.test(b.textContent)) }; }, id);
    check('RX Chat Room · ' + flow + ': every round plays with no click after Start, and the room waits only at the end of its rounds' + (flow === 'plan' ? ' (the Moderator summed up by itself)' : ''),
      waited && at.why === 'last' && at.rounds === max && at.density === 'attention' && !at.ask && (flow === 'plan' ? at.summary && /promote the summary/.test(at.guide) : !at.summary && /waits for you now/.test(at.guide)), JSON.stringify(at).slice(0, 400));
    const rep = await report();
    let ok2;
    if (flow === 'plan') ok2 = await cardMove(id, 'room-promote') && await until(id => window.PM56_COLLAB.run(id).chatRoom.promotions.length === 1, id, 10000);
    else ok2 = await cardMove(id, 'collab-room-summarize') && await until(id => !!window.PM56_COLLAB.run(id).chatRoom.summary, id, 10000) && await cardMove(id, 'room-finish') && await until(id => window.PM56_COLLAB.run(id).status === 'completed', id, 10000);
    verdict('Chat Room · ' + flow, rep, waited && ok2, flow === 'plan' ? 'then a promotion from the card' : 'then Summarize Now and End discussion on the card');
  }
  if (onlyStarting) return;
  }

  {
  /* AR: automatic rounds, production behaviour (Jared, 2026-10-21) */
  const room = async (flow, pause) => { await act('room-demo-start', { flow }); await sleep(900);
    if (pause) { await page.locator('#pmOverlayRoot [data-collab-input="cfg-pauseBetweenRounds"]').first().click(); await sleep(400); }
    await sheetStart(); await until(() => true, null, 300); return runOf('chat_room'); };
  const rs = id => ev(id => { const r = window.PM56_COLLAB.run(id), s = r.chatRoom, D = window.PM56_ROOM_DEMOS; return { st: r.status, rounds: s.roundsSoFar, round: s.round ? s.round.number : 0, inRound: !!(s.round && !s.round.complete), replies: r.messages.filter(m => m.roomRound).length, speaking: !!(D.speaking(id)), why: window.PM56_ROOM.waitsFor(r), pausing: !!s.pausing, sys: r.messages.filter(m => m.senderKind === 'system').map(m => m.body) }; }, id);
  /* the dock item the room publishes (it shows once the card is off screen; the tone is what it would say) */
  const dock = id => ev(id => { const it = (window.PM56_PMX._dockItems(window.PM56_EXT.ctx()) || []).find(x => x.runId === id); return it ? it.tone : ''; }, id);
  const presentOf = id => ev(id => window.PM56_COLLAB.sentenceOf ? window.PM56_COLLAB.sentenceOf(window.PM56_COLLAB.run(id)).status : '', id);
  /* AR1 Start opens round 1 (no Ask Everyone), and round 2 follows with no click; between rounds it reads live */
  await fast(1);
  id = await room('discussion', false);
  const r1at = await until(id => { const s = window.PM56_COLLAB.run(id).chatRoom; return !!(s.round && s.round.number === 1); }, id, 2500);
  const askBtn = await ev(() => [...document.querySelectorAll('button')].some(b => b.getClientRects().length && /Ask Everyone/.test(b.textContent)));
  check('AR1 Start Chat Room opens round 1 by itself within 2 s; nothing offers Ask Everyone', r1at && !askBtn, JSON.stringify({ r1at, askBtn }));
  await fast(SCALE);
  await until(id => { const s = window.PM56_COLLAB.run(id).chatRoom; return s.roundsSoFar === 1 && (!s.round || s.round.complete); }, id, 60000);
  await fast(0.1);
  const beat = { ...(await rs(id)), present: await presentOf(id), dock: await dock(id), card: await ev(id => { const c = document.querySelector('.transcript [data-run-id="' + id + '"]'); return c ? { d: c.getAttribute('data-density'), t: (c.querySelector('.pmx-sentence') || {}).textContent || '', next: !!c.querySelector('[data-action="collab-room-next-round"]') } : null; }, id) };
  await fast(SCALE);
  const r2 = await until(id => { const s = window.PM56_COLLAB.run(id).chatRoom; return !!(s.round && s.round.number === 2); }, id, 30000);
  check('AR2 a finished round is not your move: between rounds the card, dock and status read live ("Round 1 done · Round 2 starting"), no Next Round', !beat.why && beat.present !== 'yourmove' && beat.dock !== 'yourmove' && beat.card && beat.card.d === 'live' && /Round 1 done/.test(beat.card.t) && /Round 2 starting/.test(beat.card.t) && !beat.card.next, JSON.stringify(beat));
  check('AR3 round 2 starts with no click', r2);
  /* AR4 Pause during a turn holds at the turn boundary; nothing moves while paused; Resume goes on with the rounds */
  await fast(1);
  await until(id => !!window.PM56_ROOM_DEMOS.speaking(id), id, 15000);
  const ap0 = await rs(id);
  await act('collab-pause', { run: id }); await sleep(200);
  const ap1 = await rs(id);
  await fast(SCALE);
  await until(([id, n]) => window.PM56_COLLAB.run(id).messages.filter(m => m.roomRound).length > n, [id, ap0.replies], 20000); await sleep(200);
  const ap2 = await rs(id); await sleep(2000);
  const ap3 = await rs(id);
  check('AR4 Pause during a turn holds the room at the turn boundary: the speaker finishes, then it is paused and nothing moves', ap1.st === 'running' && ap1.pausing && ap2.st === 'paused' && ap2.replies === ap0.replies + 1 && ap3.st === 'paused' && ap3.replies === ap2.replies && !ap3.speaking, JSON.stringify({ ap0, ap1, ap2, ap3 }));
  check('AR4b a paused room waits for you: the dock says your move', await dock(id) === 'yourmove');
  await act('collab-resume', { run: id });
  const resumed = await until(id => { const r = window.PM56_COLLAB.run(id), s = r.chatRoom; return s.roundsSoFar === 2 && (!s.round || s.round.complete); }, id, 60000);
  await fast(0.1);
  const endS = { ...(await rs(id)), present: await presentOf(id), dock: await dock(id) };
  await fast(1);
  check('AR5 Resume goes on with the rounds to the end; the room waits only after its last round (your move: This room used all its rounds)', resumed && endS.why === 'last' && endS.present === 'yourmove' && endS.dock === 'yourmove', JSON.stringify(endS));
  /* AR6 a message sent during a round is queued and goes to the room at the next round, which answers it */
  id = await room('discussion', false);
  await until(id => !!window.PM56_ROOM_DEMOS.speaking(id), id, 15000);
  const q = await ev(id => { const R = window.PM56_ROOM, e = R.enqueue(id, 'Please weigh in on a shortcut hint.', { kind: 'workflow', destinationKind: 'chat_room', refId: id, label: 'Chat Room' }); window.PM56_EXT.ctx().renderApp(); return e.ok; }, id);
  await fast(SCALE);
  const delivered = await until(id => { const r = window.PM56_COLLAB.run(id); return r.messages.some(m => m.senderKind === 'user' && /shortcut hint/.test(m.body)); }, id, 60000);
  const answered = await until(id => { const r = window.PM56_COLLAB.run(id), u = r.messages.find(m => m.senderKind === 'user' && /shortcut hint/.test(m.body)); return !!u && r.messages.some(m => m.roomRound === 2 && m.replyTo === u.id); }, id, 60000);
  const qs = await ev(id => { const r = window.PM56_COLLAB.run(id), u = r.messages.find(m => m.senderKind === 'user' && /shortcut hint/.test(m.body)); return { queued: (r.chatRoom.queued || []).length, at: u ? r.messages.indexOf(u) : -1, r1: r.messages.filter(m => m.roomRound === 1).map(m => r.messages.indexOf(m)) }; }, id);
  check('AR6 a message sent during a round is queued, goes to the room when that round ends, and the next round answers it (no click)', q && delivered && answered && qs.queued === 0 && qs.at > Math.max(...qs.r1), JSON.stringify({ q, delivered, answered, qs }));
  await fast(1);

  /* PB: Pause between rounds. The sheet (off by default, its summary says so), the card and the panel (a switch that works
     mid-run, keeps the focus, and writes one plain line per change) */
  await act('room-demo-start', { flow: 'discussion' }); await sleep(900);
  const sh0 = await ev(() => { const i = document.querySelector('#pmOverlayRoot [data-collab-input="cfg-pauseBetweenRounds"]'), rb = document.querySelector('#pmOverlayRoot .pmx-foot, #pmOverlayRoot .pmx-sheet'); return { has: !!i, checked: i && i.checked, role: i && i.getAttribute('role'), near: !!(i && i.closest('.pmx-ctl') && i.closest('.pmx-ctl').previousElementSibling && /Rounds/.test(i.closest('.pmx-ctl').previousElementSibling.textContent)), say: (document.querySelector('#pmOverlayRoot .pmx-sheet') || {}).textContent || '' }; });
  await page.focus('#pmOverlayRoot [data-collab-input="cfg-pauseBetweenRounds"]'); await page.keyboard.press('Space'); await sleep(500);
  const sh1 = await ev(() => { const i = document.querySelector('#pmOverlayRoot [data-collab-input="cfg-pauseBetweenRounds"]'), a = document.activeElement; return { checked: i && i.checked, focus: a === i, say: (document.querySelector('#pmOverlayRoot .pmx-sheet') || {}).textContent || '' }; });
  check('PB1 the sheet has Pause between rounds beside Rounds, off by default; Space turns it on, the focus stays on it, and the summary says the room waits after each round',
    sh0.has && sh0.checked === false && sh0.role === 'switch' && sh0.near && /one after another/.test(sh0.say) && sh1.checked && sh1.focus && /waiting for you after each one/.test(sh1.say), JSON.stringify({ sh0: { ...sh0, say: undefined }, sh1: { ...sh1, say: undefined } }));
  await sheetStart(); await until(() => true, null, 300); id = await runOf('chat_room');
  await fast(SCALE);
  const w1 = await until(id => { const r = window.PM56_COLLAB.run(id); return r.chatRoom.roundsSoFar === 1 && window.PM56_ROOM.waitsFor(r) === 'between'; }, id, 60000);
  await sleep(1500);
  const w1s = { ...(await rs(id)), dock: await dock(id), present: await presentOf(id) };
  check('PB2 with it on, the room waits after round 1 ("Round 1 done · your move", the dock says your move)', w1 && w1s.rounds === 1 && !w1s.inRound && w1s.why === 'between' && w1s.dock === 'yourmove' && w1s.present === 'yourmove', JSON.stringify(w1s));
  await cardMove(id, 'collab-room-next-round');
  const one = await until(id => { const r = window.PM56_COLLAB.run(id); return r.chatRoom.roundsSoFar === 2 && (!r.chatRoom.round || r.chatRoom.round.complete); }, id, 60000);
  check('PB3 Next Round starts exactly one round, and the room waits again after it', one && (await rs(id)).why === 'last' && (await rs(id)).round === 2);
  await fast(1);
  /* mid-run, on the card: on during round 1 → round 1 finishes, then the room waits; off while it waits → round 2 at once */
  id = await room('discussion', false);
  await until(id => !!window.PM56_ROOM_DEMOS.speaking(id), id, 15000);
  const sel = where => '[data-room-pause="' + where + '"][data-run="' + id + '"]';
  await page.focus(sel('card')); await page.keyboard.press('Space'); await sleep(400);
  const c1 = await ev(([id, s]) => { const i = document.querySelector(s), r = window.PM56_COLLAB.run(id); return { on: r.chatRoom.pauseBetween, checked: i && i.checked, aria: i && i.getAttribute('aria-checked'), focus: document.activeElement === i, inRound: !!(r.chatRoom.round && !r.chatRoom.round.complete) }; }, [id, sel('card')]);
  await fast(SCALE);
  await until(id => window.PM56_COLLAB.run(id).chatRoom.roundsSoFar === 1, id, 60000); await sleep(1500);
  const c2 = await rs(id);
  check('PB4 the card’s switch works mid-round with Space and keeps the focus; that round finishes (no turn cancelled) and the room then waits',
    c1.on && c1.checked && c1.aria === 'true' && c1.focus && c1.inRound && c2.rounds === 1 && c2.replies === 3 && !c2.inRound && c2.why === 'between', JSON.stringify({ c1, c2 }));
  await fast(1);
  await act('collab-open-panel', { run: id }); await sleep(900);
  await page.focus(sel('view')); await page.keyboard.press('Space'); await sleep(200);
  const v1 = await ev(([id, s]) => { const i = document.querySelector(s), r = window.PM56_COLLAB.run(id); return { on: r.chatRoom.pauseBetween, focus: document.activeElement === i, round2: !!(r.chatRoom.round && r.chatRoom.round.number === 2) }; }, [id, sel('view')]);
  const sysLines = (await rs(id)).sys.filter(t => /^Pause between rounds is (on|off)\.$/.test(t));
  check('PB5 the panel’s switch, turned off while the room waits, starts round 2 at once; the focus stays on it', !v1.on && v1.focus && v1.round2, JSON.stringify(v1));
  check('PB6 each change writes one plain line in the room’s transcript', sysLines.join('|') === 'Pause between rounds is on.|Pause between rounds is off.', sysLines.join('|'));
  await fast(SCALE); await until(id => window.PM56_COLLAB.run(id).chatRoom.roundsSoFar === 2, id, 60000); await fast(1);
  await ev(() => { const c = window.PM56_EXT.ctx(); c.state.editorRevealed = false; c.renderApp(); });
  }
  /* the Wonderer and Grill Me examples: the Ask Card and Confirm are the only moves; the room waits between rounds */
  const answer = async (stop, ms = 90000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await ev(stop.fn, stop.arg)) return true; if (await click('.qs-grill [data-action="qs-accept-round"]')) { await sleep(250); continue; } if (await click('.wg-agreed[data-state="open"] [data-action="wg-confirm"]')) { await sleep(250); continue; } await sleep(200); } return false; };
  for (const flow of ['crew', 'room', 'brainstorm', 'deepplan']) {
    await ev(f => window.PM56_WG_DEMOS.start(f), flow); await sleep(1000);
    await record(); if (flow !== 'deepplan') await sheetStart();
    await sleep(400);
    const stop = flow === 'crew' ? { fn: () => { const s = window.PM56_WG_DEMOS.snapshot(), r = s && s.runId && window.PM56_COLLAB.run(s.runId); return !!(r && r.status === 'completed'); } }
      : flow === 'room' ? { fn: () => { const s = window.PM56_WG_DEMOS.snapshot(), r = s && s.runId && window.PM56_COLLAB.run(s.runId); return !!(r && r.chatRoom.roundsSoFar >= 1 && (!r.chatRoom.round || r.chatRoom.round.complete)); } }
      : flow === 'brainstorm' ? { fn: () => { const r = window.PM56_BATCH13.currentRun(); return !!(r && r.brainstorm.phase === 'synthesis' && window.PM56_WONDERER.gateState(r).ok && !r.brainstorm.synthesis); } }
      : { fn: () => { const s = window.PM56_WG_DEMOS.snapshot(); return !!(s && s.planId); } };
    ok = await answer(stop, 120000);
    const rep = await report();
    const err = await ev(() => { const s = window.PM56_WG_DEMOS.snapshot(); return s && s.error; });
    verdict('Wonderer and Grill Me · ' + flow, rep, ok && !err, flow === 'room' ? 'waits between rounds' : flow === 'brainstorm' ? 'waits at Write the plan' : 'to the end');
  }
  /* the BrainStorm whose rule beats the vote, with the Wonderer: no Grill Me, so no move at all before Write the plan */
  await act('b13-start', { flow: 'dissent' }); await sleep(1000);
  await record(); await sheetStart();
  ok = await until(() => { const r = window.PM56_BATCH13.currentRun(); return !!(r && r.brainstorm.phase === 'synthesis' && window.PM56_WONDERER.gateState(r).ok); }, null, 90000);
  verdict('Wonderer · a rule beats the vote', await report(), ok, 'no move until Write the plan');

  /* RC: the run's own controls work while it plays, as in the product. Open Panel opens the run view and the playback
     goes on; Pause holds it (nothing moves); Resume goes on; Cancel ends it, and the guide offers Replay. */
  await act('crew-demo-start', { flow: 'delegation' }); await sleep(900); await sheetStart();
  await until(() => true, null, 300); id = await runOf('crew');
  await until(id => window.PM56_COLLAB.run(id).crew.assignments.some(a => a.status === 'done'), id, 30000);
  await act('crew-open-work', { run: id }); await sleep(500);
  const opened = await ev(id => window.PM56_EXT.ctx().state.activeEditor === 'crew-work:' + id, id);
  await act('collab-pause', { run: id }); await sleep(300);
  const p0 = await ev(id => { const r = window.PM56_COLLAB.run(id); return { st: r.status, a: r.crew.assignments.map(a => a.status).join(','), ev: window.PM56_CREW_DEMOS.snapshot().events.length }; }, id);
  await sleep(3000);
  const p1 = await ev(id => { const r = window.PM56_COLLAB.run(id); return { st: r.status, a: r.crew.assignments.map(a => a.status).join(','), ev: window.PM56_CREW_DEMOS.snapshot().events.length }; }, id);
  check('RC Crew: Pause on the card holds the recording where it is (nothing moves while it is paused)', p0.st === 'paused' && p1.st === 'paused' && p0.a === p1.a && p0.ev === p1.ev, JSON.stringify({ p0, p1 }));
  await act('collab-resume', { run: id });
  const resumed = await until(id => window.PM56_COLLAB.run(id).status === 'completed', id, 40000);
  check('RC Crew: Open Panel opens its run view while it plays, and after Resume it plays on to the end', opened && resumed, JSON.stringify({ opened, resumed }));
  await act('brainstorm-demo-start', { flow: 'synthesis' }); await sleep(900); await sheetStart();
  await until(() => true, null, 300); id = await runOf('brainstorm');
  await until(id => window.PM56_COLLAB.run(id).brainstorm.attempts.filter(a => a.status === 'completed').length >= 2, id, 30000);
  await act('collab-cancel', { run: id }); await sleep(300);
  const c0 = await ev(id => window.PM56_COLLAB.run(id).brainstorm.attempts.filter(a => a.status === 'completed').length, id);
  await sleep(3000);
  const c1 = await ev(id => { const r = window.PM56_COLLAB.run(id), g = [...document.querySelectorAll('.pmx-guide')].filter(n => n.getClientRects().length)[0]; return { st: r.status, n: r.brainstorm.attempts.filter(a => a.status === 'completed').length, buttons: g ? [...g.querySelectorAll('button')].map(b => b.textContent.trim()).filter(Boolean) : [] }; }, id);
  check('RC BrainStorm: Cancel on the card ends the recording (nothing more arrives) and the guide offers Replay', /^cancel/.test(c1.st) && c1.n === c0 && c1.buttons.includes('Replay'), JSON.stringify({ c0, c1 }));
  await fast(1);

  /* SA: Show all lists every lane in place and Show fewer folds back; the card never folds. The room's between-round
     card (Jared's report) folds its lanes under "+N more · Show all"; the Wonderer Crew has five parts. */
  const lanes = id => ev(id => { const c = document.querySelector('.transcript article.pmx-run[data-run-id="' + id + '"]'); if (!c) return null;
    const vis = el => !!el && getComputedStyle(el).display !== 'none' && el.getClientRects().length > 0;
    return { density: c.getAttribute('data-density'), lanes: [...c.querySelectorAll('.pmx-lanes > .pmx-lane')].filter(vis).length, more: [...c.querySelectorAll('.pmx-lanes > .pmx-lanes-more:not(.pmx-lanes-less)')].filter(vis).map(b => b.textContent.trim()), less: [...c.querySelectorAll('.pmx-lanes > .pmx-lanes-less')].filter(vis).length, actions: [...c.querySelectorAll('.pmx-lanes > .pmx-lanes-more')].filter(vis).map(b => b.dataset.action) }; }, id);
  /* every lane the "+N more" row counts comes into view: what showed plus N (a Wonderer lane rides along on its own) */
  const showAll = async (name, id) => {
    const a = await lanes(id), want = a ? a.lanes + (+((/\+(\d+) more/.exec(a.more[0] || '') || [])[1] || 0)) : -1;
    const shown = await click('.transcript article.pmx-run[data-run-id="' + id + '"] .pmx-lanes > .pmx-lanes-more:not(.pmx-lanes-less):not([style*="none"])');
    await sleep(500); const b = await lanes(id);
    await click('.transcript article.pmx-run[data-run-id="' + id + '"] .pmx-lanes > .pmx-lanes-less'); await sleep(500); const c = await lanes(id);
    check('SA ' + name + ': Show all lists every lane in place, with Show fewer; the card does not fold', !!a && a.more.length === 1 && /Show all/.test(a.more[0]) && shown && b.density === a.density && b.density !== 'collapsed' && b.lanes === want && b.less === 1 && !b.more.length && b.actions.every(x => x === 'collab-show-lanes'), JSON.stringify({ a, b }));
    check('SA ' + name + ': Show fewer folds the lanes back, and the card stays as it was', !!c && c.density === a.density && c.lanes === a.lanes && c.more.length === 1 && !c.less, JSON.stringify({ a, c }));
  };
  await act('room-demo-start', { flow: 'discussion' }); await sleep(900); await sheetStart(); await fast(SCALE);
  await until(() => true, null, 300); id = await runOf('chat_room');
  await until(id => { const r = window.PM56_COLLAB.run(id), s = r.chatRoom; return s.roundsSoFar === 2 && window.PM56_ROOM.waitsFor(r) === 'last'; }, id, 60000); await fast(1); await sleep(600);
  await showAll('Chat Room at the end of its rounds (attention card, Jared’s report)', id);
  await target.resize(page, { width: 480, height: 900 }); await sleep(600);
  await showAll('Chat Room at the end of its rounds, 480 px', id);
  await target.resize(page, { width: 1440, height: 900 }); await sleep(600);
  await ev(() => window.PM56_WG_DEMOS.start('crew')); await sleep(1000);
  await ev(() => { const i = document.querySelector('#pmOverlayRoot [data-collab-input="grillMe"]'); if (i && i.checked) i.click(); }); await sleep(300);
  await sheetStart(); await fast(SCALE);
  id = await ev(() => window.PM56_WG_DEMOS.snapshot().runId);
  await until(id => window.PM56_COLLAB.run(id).crew.assignments.length >= 5 && window.PM56_COLLAB.run(id).status === 'running', id, 60000);
  await fast(0.05); await sleep(500);
  await showAll('Crew with five parts (live card)', id);
  await fast(1);

  /* CV: the chevron. A card that shows its body has one chevron, Collapse (chevron up, expanded); its first click folds
     the card; the folded card's chevron is Expand, and its first click opens it again. A receipt opens and folds back. */
  const chev = id => ev(id => { const c = document.querySelector('.transcript [data-run-id="' + id + '"]'); if (!c) return null;
    const b = [...c.querySelectorAll('[data-action="collab-toggle-expand"]')].filter(x => x.getClientRects().length);
    return { density: c.getAttribute('data-density') || (c.matches('.pmx-receipt, .pmx-ledger') ? 'receipt' : ''), n: b.length, label: b[0] && b[0].getAttribute('aria-label'), expanded: b[0] && b[0].getAttribute('aria-expanded'), up: !!(b[0] && /chevron-up/.test(b[0].innerHTML)), receipt: !c.matches('article.pmx-run') }; }, id);
  const press = async id => { await click('.transcript [data-run-id="' + id + '"] [data-action="collab-toggle-expand"]'); await sleep(450); return chev(id); };
  const folded = x => x.density === 'collapsed' || x.density === 'receipt' || x.receipt;
  const matches = x => !!x && x.n === 1 && (folded(x) ? x.label === 'Expand' && x.expanded === 'false' && !x.up : x.label === 'Collapse' && x.expanded === 'true' && x.up);
  const cycle = async (name, id) => {
    const a = await chev(id), b = await press(id), c = await press(id);
    const opened = a && folded(a);
    check('CV ' + name + ': the chevron matches the card, and its first click changes it (' + (a && a.density) + ' → ' + (b && b.density) + ' → ' + (c && c.density) + ')',
      matches(a) && matches(b) && matches(c) && (opened ? !folded(b) : folded(b)) && c.density === a.density, JSON.stringify({ a, b, c }));
  };
  /* a starting card (Jared's report): the BrainStorm recording held at Starting, so the face can be read */
  await act('brainstorm-demo-start', { flow: 'synthesis' }); await sleep(900); await fast(0.02); await sheetStart(); await sleep(500);
  id = await runOf('brainstorm');
  await cycle('BrainStorm, Starting', id);
  await fast(1);
  for (const [kind, flow] of [['crew-demo-start', 'delegation'], ['review-demo-start', 'multi']]) {
    await act(kind, { flow }); await sleep(900); await sheetStart(); await sleep(2600);
    id = await runOf(kind === 'crew-demo-start' ? 'crew' : 'review');
    await cycle((kind === 'crew-demo-start' ? 'Crew' : 'Review') + ', live', id);
  }
  await act('room-demo-start', { flow: 'plan' }); await sleep(900); await sheetStart(); await fast(SCALE);
  await until(() => true, null, 300); id = await runOf('chat_room');
  await until(id => { const r = window.PM56_COLLAB.run(id); return !!r.chatRoom.summary && window.PM56_ROOM.waitsFor(r) === 'last'; }, id, 60000); await fast(1); await sleep(500);
  await cycle('Chat Room, your move after its last round', id);
  /* a finished card: the receipt opens with its chevron, then folds back */
  await act('crew-demo-start', { flow: 'delegation' }); await sleep(900); await sheetStart(); await fast(SCALE);
  id = await runOf('crew'); await until(id => window.PM56_COLLAB.run(id).status === 'completed', id, 60000); await fast(1); await sleep(600);
  await ev(() => { const c = window.PM56_EXT.ctx(); c.state.composer = ''; const t = c.state.threads.find(x => x.id === c.state.selectedThread); t.messages.push({ id: 'rx-u-' + Date.now(), role: 'user', type: 'text', body: 'Thanks.' }); c.renderApp(); }); await sleep(700);
  await cycle('Crew, finished (receipt)', id);
  /* the Wonderer and Grill Me cards: the round map's toggle says what it shows */
  await ev(() => window.PM56_WG_DEMOS.start('deepplan')); await until(() => !!document.querySelector('.qs-grill-maptoggle'), null, 15000);
  const m0 = await ev(() => { const b = document.querySelector('.qs-grill-maptoggle'); return { e: b.getAttribute('aria-expanded'), map: !!document.getElementById('qs-grill-map') }; });
  await click('.qs-grill-maptoggle'); await sleep(500);
  const m1 = await ev(() => { const b = document.querySelector('.qs-grill-maptoggle'); return { e: b.getAttribute('aria-expanded'), map: !!document.getElementById('qs-grill-map') }; });
  await click('.qs-grill-maptoggle'); await sleep(500);
  const m2 = await ev(() => { const b = document.querySelector('.qs-grill-maptoggle'); return { e: b.getAttribute('aria-expanded'), map: !!document.getElementById('qs-grill-map') }; });
  check('CV Grill Me round map: its chevron matches what shows, and each click changes it', m0.e === String(m0.map) && m1.e === String(m1.map) && m2.e === String(m2.map) && m1.e !== m0.e && m2.e === m0.e, JSON.stringify({ m0, m1, m2 }));
}
/* ------------------------------------------------------------------ concept review, round 1 (2026-10-21)
   Every finding of CONCEPT-REVIEW-ASTRA.md and CONCEPT-REVIEW-OPUS.md, replayed the way the reviewers reproduced it,
   so it stays fixed. PM56_CLOCK runs the recordings faster where only the order of things matters. */
async function reviewRound1({ page, ev, act, sleep, startSheet, answerAll }) {
  const fast = k => ev(k => window.PM56_CLOCK.setScale(k), k);
  const until = (fn, arg, ms = 60000) => page.waitForFunction(fn, arg, { timeout: ms }).then(() => true, () => false);
  const click = async sel => { try { const l = page.locator(sel).first(); if (await l.count() && await l.isVisible()) { await l.click({ timeout: 3000 }); return true; } } catch (e) { } return false; };
  const roundOpen = () => until(() => !!document.querySelector('.qs-grill [data-action="qs-accept-round"]'), null, 20000);
  const thread = () => ev(() => window.PM56_WG_DEMOS.snapshot().threadId);
  const agreedOf = t => ev(t => { const s = window.PM56_WG.threadSession(t), a = window.PM56_WG.grill.agreed(s); return { st: s.status, ended: a.endedBy, dec: a.decisions.map(d => d.id + '=' + d.answer + '/' + d.took), open: a.open.map(o => o.id + ':' + o.why), asked: a.counter.asked }; }, t);
  /* play a recorded run to its end, answering every round with its recommendations and confirming every agreement
     (a later decision asks again mid-run, so a run may need more than one Confirm) */
  const finish = async (id, ms = 120000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const st = await ev(id => { const r = window.PM56_COLLAB.run(id), s = window.PM56_WG_DEMOS.snapshot(); return r.status === 'completed' ? 'done' : s && s.error ? 'error:' + s.error : ''; }, id); if (st) return st; if (await click('.wg-agreed[data-state="open"] [data-action="wg-confirm"]')) { await sleep(500); continue; } if (await click('.qs-grill [data-action="qs-accept-round"]')) { await sleep(800); continue; } await sleep(400); } return 'timeout'; };
  const confirmAll = async (ms = 40000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await click('.wg-agreed[data-state="open"] [data-action="wg-confirm"]')) return true; if (await click('.qs-grill [data-action="qs-accept-round"]')) { await sleep(900); continue; } await sleep(400); } return false; };

  /* B2 = R1: Wrap up with the drafts untouched settles nothing (Deep Plan) */
  await ev(() => window.PM56_WG_DEMOS.start('deepplan')); await roundOpen(); await sleep(600);
  let t = await thread();
  await click('.qs-grill [data-action="qs-wrap-up"]'); await sleep(1800);
  let ag = await agreedOf(t);
  check('R1-B2 Wrap up with every draft untouched settles nothing: the round is open, not answered', ag.st === 'agreeing' && !ag.dec.length && ag.open.some(o => /^d-where:Not answered: you wrapped up/.test(o)) && ag.open.some(o => /^d-rank:Not answered/.test(o)), JSON.stringify(ag));
  /* B2b: an answer you picked counts; the untouched one does not */
  await ev(() => window.PM56_WG_DEMOS.start('deepplan')); await roundOpen(); await sleep(600); t = await thread();
  await page.locator('.qs-grill .qs-ask-opt').nth(1).click(); await sleep(400);
  await click('.qs-grill [data-action="qs-wrap-up"]'); await sleep(1800);
  ag = await agreedOf(t);
  check('R1-B2b Wrap up keeps the answer you picked and leaves the untouched one open', ag.dec.join() === 'd-where=Allow an upload for big collections/own' && ag.open.some(o => /^d-rank:Not answered/.test(o)), JSON.stringify(ag));

  /* M6 = R2: Not sure, then Keep going asks it again for free; Ask again is offered on the open row */
  await ev(() => window.PM56_WG_DEMOS.start('deepplan')); await roundOpen(); await sleep(600); t = await thread();
  await click('.qs-grill [data-action="skip-question"]'); await sleep(500);
  await answerAll(40000);
  ag = await agreedOf(t);
  const askAgain = await ev(() => !!document.querySelector('.wg-agreed[data-state="open"] [data-action="wg-ask-again"][data-node="d-where"]'));
  await click('.wg-agreed[data-state="open"] [data-action="wg-keep-going"]'); await sleep(1500);
  const kg = await ev(t => { const s = window.PM56_WG.threadSession(t), rd = window.PM56_WG.grill.round(s); return { asked: window.PM56_WG.grill.counter(s).asked, ids: rd ? rd.ids : [] }; }, t);
  check('R1-M6 Keep going asks the Not sure decision again without charging it twice', ag.open.some(o => /^d-where:You said/.test(o)) && askAgain && kg.ids.includes('d-where') && kg.asked === ag.asked, JSON.stringify({ before: ag.asked, kg, askAgain }));

  /* R7: the written plan follows a confirmed alternative answer */
  await ev(() => window.PM56_WG_DEMOS.start('deepplan')); await roundOpen(); await sleep(600); t = await thread();
  await click('.qs-grill [data-action="next-question"]'); await sleep(500);
  await page.locator('.qs-grill .qs-ask-opt').nth(1).click(); await sleep(300);
  await answerAll(40000); await click('.wg-agreed[data-state="open"] [data-action="wg-confirm"]');
  await until(t => window.PM56_EXT.ctx().state.threads.find(x => x.id === t).messages.some(m => m.type === 'plan-card-v2'), t, 15000);
  const plan = await ev(() => { const id = window.PM56_WG_DEMOS.snapshot().planId, p = window.PM56_PLANS.all()[id]; return JSON.stringify(p && p.revisions[1]); });
  check('R1-R7 the Plan written after Confirm follows “Rank by recency instead”', /ranked by recency/.test(plan) && !/ranking stays as it is/i.test(plan) && /Rank by recency instead/.test(plan), plan.slice(0, 300));

  /* R6: a Crew recording with the Wonderer removed plays to the end; one with Grill Me off grills nobody */
  await ev(() => window.PM56_WG_DEMOS.start('crew')); await sleep(1400);
  await ev(() => { const i = document.querySelector('#pmOverlayRoot [data-collab-input="wonderer"]'); if (i && i.checked) i.click(); });
  await sleep(500); await startSheet(); await fast(4);
  const r6 = (await finish(await ev(() => window.PM56_WG_DEMOS.snapshot().runId))) === 'done';
  const r6s = await ev(() => { const s = window.PM56_WG_DEMOS.snapshot(), r = window.PM56_COLLAB.run(s.runId); return { st: r.status, error: s.error, w: !!r.wonderer, grill: !!r.grill }; });
  check('R1-R6 a Crew recording with the Wonderer removed plays to the end, Grill Me still on', r6 && r6s.st === 'completed' && !r6s.error && !r6s.w && r6s.grill, JSON.stringify(r6s));
  await fast(1);
  await ev(() => window.PM56_WG_DEMOS.start('crew')); await sleep(1400);
  await ev(() => { const i = document.querySelector('#pmOverlayRoot [data-collab-input="grillMe"]'); if (i && i.checked) i.click(); });
  await sleep(500); await startSheet(); await fast(4);
  const r6b = (await finish(await ev(() => window.PM56_WG_DEMOS.snapshot().runId))) === 'done';
  const r6bs = await ev(() => { const s = window.PM56_WG_DEMOS.snapshot(), r = window.PM56_COLLAB.run(s.runId); return { st: r.status, error: s.error, sessions: window.PM56_WG.sessionsOf(r).length, bank: r.grillBank }; });
  check('R1-R6b with Grill Me off nobody grills you: no session and no question bank', r6b && r6bs.st === 'completed' && !r6bs.error && r6bs.sessions === 0 && !r6bs.bank, JSON.stringify(r6bs));
  await fast(1);
  await ev(() => { const b = document.createElement('button'); b.dataset.flow = 'leads'; window.PM56_EXT.run('b13-start', b, new Event('click')); }); await sleep(1000);
  await ev(() => { const i = document.querySelector('#pmOverlayRoot [data-collab-input="wonderer"]'); if (i && i.checked) i.click(); }); await sleep(500);
  const need = await ev(() => { const b = [...document.querySelectorAll('#pmOverlayRoot .pmx-sheet .pmx-foot .primary-button')].pop(); return { disabled: !!(b && b.disabled), ariaDisabled: b?.getAttribute('aria-disabled'), text: (document.querySelector('#pmOverlayRoot .pmx-sheet') || {}).textContent || '' }; });
  // PM7 keeps disabled controls focusable for their hover descriptions. An ARIA
  // appearance alone is insufficient: a painted click must invoke no action and
  // leave both the run count and configure sheet unchanged.
  if (target.kind === 'pm7' && !need.disabled && need.ariaDisabled === 'true') {
    await ev(() => {
      const original = PM56_EXT._actions['collab-modal-commit'];
      if (typeof original !== 'function') throw new Error('Missing configure commit action');
      const p = window.__c56NeedProbe = { original, calls: 0, runs: PM56_COLLAB.runs().length };
      PM56_EXT._actions['collab-modal-commit'] = function (...args) { p.calls++; return original.apply(this, args); };
    });
    try {
      const button = page.locator('#pmOverlayRoot .pmx-sheet .pmx-foot .primary-button').last();
      await button.scrollIntoViewIfNeeded();
      const point = await button.evaluate(el => {
        const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
        const hit = document.elementFromPoint(x, y);
        return { x, y, painted: r.width > 0 && r.height > 0 && !!hit && (hit === el || el.contains(hit)) };
      });
      if (!point.painted) throw new Error('Disabled Start is not painted at its click point');
      await page.mouse.click(point.x, point.y); await sleep(100);
      need.probe = await ev(() => ({ calls: __c56NeedProbe.calls, beforeRuns: __c56NeedProbe.runs, afterRuns: PM56_COLLAB.runs().length, sheet: !!document.querySelector('#pmOverlayRoot .pmx-sheet') }));
      need.disabled = need.probe.calls === 0 && need.probe.beforeRuns === need.probe.afterRuns && need.probe.sheet;
    } catch (e) { need.error = e.message; }
    finally { await ev(() => { PM56_EXT._actions['collab-modal-commit'] = __c56NeedProbe.original; delete window.__c56NeedProbe; }); }
  }
  check('R1-R6c a recording that needs the Wonderer says so before Start and does not start', need.disabled && /follows the Wonderer’s leads/.test(need.text), JSON.stringify({ disabled: need.disabled }));
  results.at(-1).measured = need;
  await ev(() => { const c = window.PM56_EXT.ctx(); c.closeDialog ? c.closeDialog() : (c.state.dialog = null); c.renderOverlays(); });

  /* R11: the Grill Me switch is named, described and keeps the keyboard focus */
  await ev(() => { const C = window.PM56_COLLAB, c = window.PM56_EXT.ctx(); c.switchThread('query'); C.openConfigure('crew'); const d = C.draft(); d.purpose = 'Export the collection.'; d.wonderer = true; d.grillMe = true; c.openDialog({ type: 'collab-configure' }); c.renderOverlays(); }); await sleep(700);
  const sw = await ev(() => { const i = document.querySelector('#pmOverlayRoot [data-collab-input="grillMe"]'), d = i && document.getElementById(i.getAttribute('aria-describedby') || ''); return { label: i && i.getAttribute('aria-label'), role: i && i.getAttribute('role'), described: d ? d.textContent : '' }; });
  await page.focus('#pmOverlayRoot [data-collab-input="grillMe"]'); await page.keyboard.press('Space'); await sleep(500);
  const after = await ev(() => { const a = document.activeElement; return { on: a && a.getAttribute && a.getAttribute('data-collab-input'), checked: a && a.checked, ring: a && a.closest && getComputedStyle(a.closest('.pmx-add')).outlineStyle }; });
  check('R1-R11 the switch is named Grill Me, described by its helper, and keeps focus with a visible ring after Space', sw.label === 'Grill Me' && sw.role === 'switch' && /questions you/i.test(sw.described) && after.on === 'grillMe' && after.checked === false && after.ring !== 'none', JSON.stringify({ sw, after }));
  await ev(() => { const c = window.PM56_EXT.ctx(); c.state.dialog = null; c.renderOverlays(); });

  /* R5 + M1: a Crew with the Wonderer; the lane during a lookup; your extra pass while the recording owns the next */
  await ev(() => window.PM56_WG_DEMOS.start('crew')); await sleep(1400); await startSheet(); await roundOpen(); await sleep(600);
  let crew = await ev(() => window.PM56_WG_DEMOS.snapshot().runId);
  for (let i = 0; i < 2; i++) { await click('.qs-grill [data-action="qs-accept-round"]'); await sleep(1200); }
  const looking = await until(id => { const s = window.PM56_WG.sessionOf('run:' + id); return s && window.PM56_WG.grill.waiting(s); }, crew, 8000);
  await act('wg-open-round', { key: 'run:' + crew }); await sleep(600);
  const r5 = await ev(id => { const s = window.PM56_WG.sessionOf('run:' + id); return { st: s.status, agreed: !!document.querySelector('.wg-agreed[data-state="open"]'), lookup: !!document.querySelector('.wg-lookup') }; }, crew);
  check('R1-R5 opening the lead’s lane during a lookup shows the lookup, never What we agreed', looking && r5.st === 'grilling' && !r5.agreed && r5.lookup, JSON.stringify(r5));
  await confirmAll(40000);
  await until(id => window.PM56_COLLAB.run(id).crew.assignments.some(a => a.status === 'running'), crew, 30000);
  await act('wg-ask-pass', { run: crew }); await sleep(400);
  const m1 = await ev(id => { const r = window.PM56_COLLAB.run(id); return { mine: r.wonderer.passes.filter(p => p.by.kind === 'user').length, ask: window.PM56_WG.askState(r) }; }, crew);
  check('R1-M1 while the recording owns the next pass, yours is refused with a stated reason (no deadlock)', m1.mine === 0 && !m1.ask.ok && /recording asks|exploring|queued/.test(m1.ask.say), JSON.stringify(m1));
  await fast(4);
  await until(id => { const r = window.PM56_COLLAB.run(id), w = r.wonderer; return w.reserved === 0 && w.passes.length === 2 && w.passes[1].status === 'delivered' && r.status === 'running'; }, crew, 60000);
  await act('wg-ask-pass', { run: crew }); await sleep(300);
  const mine = await ev(id => { const r = window.PM56_COLLAB.run(id), p = r.wonderer.passes.find(x => x.by.kind === 'user'); return p ? { n: p.n, status: p.status } : null; }, crew);
  const m1b = (await finish(crew)) === 'done';
  const m1s = await ev(id => { const r = window.PM56_COLLAB.run(id), s = window.PM56_WG_DEMOS.snapshot(); return { st: r.status, error: s.error, passes: r.wonderer.passes.map(p => p.n + ':' + p.by.kind + ':' + p.status) }; }, crew);
  check('R1-M1b a pass you ask for after the scripted ones is pass 3, and the recording still finishes', !!mine && mine.n === 3 && m1b && !m1s.error, JSON.stringify({ mine, m1s }));
  const lin = await ev(id => { const r = window.PM56_COLLAB.run(id), x = window.PM56_WG.engine.listing(r).find(l => l.id === 'l5'); return x; }, crew);
  check('R1-M4 after research the lead keeps the team’s decision, reason and recorder beside its result', lin && lin.disposition === 'explore' && /line break/.test(lin.dispositionReason) && lin.recordedBy === 'Coordinator' && lin.research === 'not_supported' && !!lin.researchNote, JSON.stringify(lin));
  await fast(1);

  /* m5 + R4 (Crew): Grill Me turned on mid-run grills you at the next assignment; only that part waits */
  await ev(() => window.PM56_WG_DEMOS.start('crew')); await sleep(1400);
  await ev(() => { const i = document.querySelector('#pmOverlayRoot [data-collab-input="grillMe"]'); if (i && i.checked) i.click(); }); await sleep(400); await startSheet(); await fast(3);
  crew = await ev(() => window.PM56_WG_DEMOS.snapshot().runId);
  await until(id => window.PM56_COLLAB.run(id).crew.assignments.some(a => a.status === 'running'), crew, 40000);
  await act('wg-toggle-grill', { run: crew });
  const began = await until(id => window.PM56_WG.sessionsOf(window.PM56_COLLAB.run(id)).length === 1, crew, 40000);
  const cm = await ev(id => { const r = window.PM56_COLLAB.run(id), s = window.PM56_WG.sessionsOf(r)[0]; return { gate: s && s.gate, running: r.crew.assignments.filter(a => a.status === 'running').map(a => a.id), bank: r.grillBank && r.grillBank.effective_limit }; }, crew);
  check('R1-m5 Crew: Grill Me turned on mid-run grills you before the next part; running parts go on', began && /^part:/.test(cm.gate) && cm.bank === 25, JSON.stringify(cm));
  await fast(4);
  check('R1-m5b the Crew finishes after that Confirm', (await finish(crew)) === 'done');
  await fast(1);

  /* B1: Check it on a held BrainStorm lead reaches no core participant before the Evidence round */
  await ev(() => { const b = document.createElement('button'); b.dataset.flow = 'leads'; window.PM56_EXT.run('b13-start', b, new Event('click')); }); await sleep(900); await startSheet();
  const bs = await ev(() => window.PM56_BATCH13.currentRun().id);
  await until(id => { const w = window.PM56_COLLAB.run(id).wonderer; return w.passes[0] && w.passes[0].status === 'held'; }, bs, 20000);
  await act('wg-check-it', { run: bs, lead: 'speed' }); await sleep(3500);
  const held = await ev(id => { const r = window.PM56_COLLAB.run(id), l = window.PM56_WG.engine.lead(r, 'speed'), row = document.querySelector('[data-k$=":speed"]'); return { rs: l.research && l.research.status, via: l.research && l.research.via, by: l.research && l.research.by, phase: r.brainstorm.phase }; }, bs);
  check('R1-B1 a held lead you Check is recorded, not researched, while the helpers draft alone', held.rs === 'queued' && held.via === 'check_it' && !held.by && /intake|blind/.test(held.phase), JSON.stringify(held));
  await confirmAll(30000); await fast(5);
  let startPhase = null;
  for (let i = 0; i < 200 && !startPhase; i++) { await sleep(150); startPhase = await ev(id => { const r = window.PM56_COLLAB.run(id), l = window.PM56_WG.engine.lead(r, 'speed'); return l.research && l.research.status !== 'queued' ? r.brainstorm.phase : null; }, bs); }
  check('R1-B1b it is researched in the Evidence round, by a core helper', startPhase === 'evidence', String(startPhase));
  await until(id => { const r = window.PM56_COLLAB.run(id); return r.wonderer.corePlayback.status === 'completed'; }, bs, 120000);
  await fast(1);

  /* M2 + R4 (BrainStorm): on then off clears the request; on during the Debate grills at the next chapter; off during
     an open round ends it like Wrap up; the vote waits for that Confirm */
  const dissent = async () => { await ev(() => { const b = document.createElement('button'); b.dataset.flow = 'dissent'; window.PM56_EXT.run('b13-start', b, new Event('click')); }); await sleep(900); await startSheet(); return ev(() => window.PM56_BATCH13.currentRun().id); };
  let d = await dissent();
  await act('collab-brainstorm-toggle-grill', { run: d }); await act('collab-brainstorm-toggle-grill', { run: d });
  await fast(6);
  await until(id => window.PM56_COLLAB.run(id).brainstorm.votes.length >= 4, d, 90000);
  const m2 = await ev(id => { const r = window.PM56_COLLAB.run(id); return { pending: !!r.grillPending, sessions: window.PM56_WG.sessionsOf(r).length, on: window.PM56_WG.grillOn(r) }; }, d);
  check('R1-M2 turning Grill Me on and then off before the boundary clears the request: nobody is grilled', !m2.pending && m2.sessions === 0 && !m2.on, JSON.stringify(m2));
  await fast(1);
  d = await dissent(); await fast(5);
  await until(id => window.PM56_COLLAB.run(id).brainstorm.phase === 'debate', d, 60000);
  await fast(1); await act('collab-brainstorm-toggle-grill', { run: d }); await fast(5);
  const late = await until(id => { const s = window.PM56_WG.sessionsOf(window.PM56_COLLAB.run(id))[0]; return !!s && !!window.PM56_WG.grill.round(s); }, d, 60000);
  await fast(1);
  const r4 = await ev(id => { const r = window.PM56_COLLAB.run(id), s = window.PM56_WG.sessionsOf(r)[0]; return { gate: s.gate, phase: r.brainstorm.phase, votes: r.brainstorm.votes.length }; }, d);
  check('R1-R4 Grill Me turned on during the Debate grills you at the next chapter; the vote waits', late && r4.gate === 'vote' && r4.votes === 0, JSON.stringify(r4));
  await act('collab-brainstorm-toggle-grill', { run: d }); await sleep(800);
  const offS = await ev(id => { const s = window.PM56_WG.sessionsOf(window.PM56_COLLAB.run(id))[0]; return { st: s.status, ended: s.endedBy, agreed: !!document.querySelector('.wg-agreed[data-state="open"]') }; }, d);
  check('R1-M2b turning it off with a round open ends the session like Wrap up, open items listed', offS.st === 'agreeing' && offS.ended === 'switched_off' && offS.agreed, JSON.stringify(offS));
  const heldVote = await ev(id => { const r = window.PM56_COLLAB.run(id), a = r.brainstorm.attempts[0]; return window.PM56_BRAINSTORM.vote(id, a.participantId, { epoch: r.stopEpoch, sourceHash: r.brainstorm.input.sourceHash, position: 'support', proposalId: r.brainstorm.proposals[0].id, confidence: 'medium', reason: 'x', evidenceRefs: [] }).error; }, d);
  await click('.wg-agreed[data-state="open"] [data-action="wg-confirm"]'); await fast(6);
  const voted = await until(id => window.PM56_COLLAB.run(id).brainstorm.votes.length >= 4, d, 60000);
  check('R1-R4b the vote waited for that Confirm, then went on', heldVote === 'grill_me_waits_for_confirm' && voted, String(heldVote));
  await fast(1);

  /* m5 (Chat Room): Grill Me turned on mid-run grills you before the next round */
  await ev(() => window.PM56_WG_DEMOS.start('room')); await sleep(1400);
  await ev(() => { const i = document.querySelector('#pmOverlayRoot [data-collab-input="grillMe"]'); if (i && i.checked) i.click(); }); await sleep(400); await startSheet(); await sleep(1200);
  const room = await ev(() => window.PM56_WG_DEMOS.snapshot().runId);
  /* the room opens round 1 by itself (2026-10-21); Grill Me turned on during it questions you at the next boundary */
  await until(id => { const c = window.PM56_COLLAB.run(id).chatRoom; return !!(c.round && !c.round.complete); }, room, 20000);
  await act('wg-toggle-grill', { run: room }); await fast(4);
  await until(id => { const r = window.PM56_COLLAB.run(id); return r.chatRoom.roundsSoFar === 1 && window.PM56_WG.sessionsOf(r).length > 0; }, room, 60000);
  await fast(1); await sleep(800);
  const rm = await ev(id => { const r = window.PM56_COLLAB.run(id), s = window.PM56_WG.sessionsOf(r)[0]; return { gate: s && s.gate, round2: !!(r.chatRoom.round && r.chatRoom.round.number === 2) }; }, room);
  check('R1-m5c Chat Room: Grill Me turned on mid-run grills you before round 2, and round 2 waits', rm.gate === 'round:2' && !rm.round2, JSON.stringify(rm));
  await confirmAll(30000);
  check('R1-m5d round 2 starts by itself after that Confirm (no click)', await until(id => { const r = window.PM56_COLLAB.run(id); return !!(r.chatRoom.round && r.chatRoom.round.number === 2); }, room, 15000));

  /* m10: an ordinary Plan's Question budget "Turn Grill Me on" starts the real grilling on that Plan's thread, over
     the Plan's own counter; its Revise waits for Confirm; Confirm lets it go */
  const plan10 = await ev(() => { const c = window.PM56_EXT.ctx(), all = Object.values(window.PM56_PLANS.all()); const p = all.find(x => x.status === 'ready' && !x.grillMe && c.state.threads.some(t => t.id === x.thread_id)); if (!p) return null; window.PM56_DEMO.selectThread(p.thread_id); return { id: p.plan_id, tid: p.thread_id }; });
  let m10 = { plan: plan10 };
  if (plan10) {
    await sleep(600);
    await act('pd-inspect', { id: plan10.id }); await sleep(500);
    const onBtn = await click('[data-action="pd-q-grill"][data-id="' + plan10.id + '"]');
    await roundOpen(); await sleep(500);
    m10.on = onBtn;
    m10.card = await ev(() => { const g = document.querySelector('.qs-grill'); return g ? g.textContent.replace(/\s+/g, ' ').slice(0, 200) : ''; });
    m10.held = await ev(tid => window.PM56_WG.threadHolds(tid, 'revise'), plan10.tid);
    await act('pd-revise', { id: plan10.id }); await sleep(400);
    m10.toast = await ev(() => window.PM56_EXT.ctx().state.toast.map(t => t.title).join(' | '));
    m10.bank = await ev(id => { const s = window.PM56_PLANS.budgetOwner && window.PM56_PLANS.budgetOwner.projection('plan:' + id); return s ? s.questions_asked : null; }, plan10.id);
    /* the Plan's own thread: answer its rounds and confirm by what is on screen (the recorded examples' snapshot is
       another thread's) */
    for (let i = 0; i < 30; i++) {
      const st = await ev(tid => { const s = window.PM56_WG.threadSession(tid); return s ? s.status : ''; }, plan10.tid);
      if (st === 'confirmed') break;
      if (await click('.wg-agreed[data-state="open"] [data-action="wg-confirm"]')) { await sleep(700); continue; }
      if (await click('.qs-grill [data-action="qs-accept-round"]')) { await sleep(900); continue; }
      await sleep(500);
    }
    m10.after = await ev(tid => window.PM56_WG.threadHolds(tid, 'revise'), plan10.tid);
  }
  check('R1-m10 an ordinary Plan’s Turn Grill Me on grills you on its thread, Revise waits for Confirm, then goes', !!plan10 && m10.on && /assistant/i.test(m10.card) && m10.held === true && /Revise waits/i.test(m10.toast) && m10.bank >= 1 && m10.after === false, JSON.stringify(m10));

  /* M5 + m8 = R10: required words read at 4.5:1 or better on their real background, NieR's Recommended included, in
     a light and a dark theme of every family */
  const measure = sels => pixelRatios(page, sels);
  /* the recordings play at a readable pace now (2026-10-21), so ones started by earlier checks may still be playing in
     other chats; they are cancelled first, so nothing redraws the chat while its pixels are read */
  await ev(() => { const C = window.PM56_COLLAB; C.runs().filter(r => ['running', 'paused'].includes(r.status) && C.provenance && C.provenance(r.id) === 'recorded').forEach(r => { const b = document.createElement('button'); b.dataset.run = r.id; window.PM56_EXT.run('collab-cancel', b, new Event('click')); }); window.PM56_EXT.ctx().renderApp(); });
  await sleep(600);
  const crewThread = await ev(id => window.PM56_COLLAB.run(id).threadId, (await ev(() => (window.PM56_COLLAB.runs().filter(r => r.kind === 'crew' && r.wonderer && r.status === 'completed').pop() || {}).id)));
  const low = {};
  for (const theme of ['basic-dark', 'basic-light', 'glass-light', 'friendly-light', 'retro-dark', 'nier-dark', 'nier-light']) {
    await ev(() => window.PM56_CLOCK.setScale(1));
    await target.theme(page, theme); await sleep(400);
    await ev(() => window.PM56_WG_DEMOS.start('deepplan')); await roundOpen(); await sleep(700);
    await ev(() => window.PM56_CLOCK.setScale(.01));
    const a = await measure(['.qs-ask-opt.is-on .qs-rec', '.qs-grill-note', '.qs-grill-meta']);
    await ev(t => { const c = window.PM56_EXT.ctx(); c.switchThread(t); c.renderApp(); }, crewThread); await sleep(700);
    await ev(() => { const el = document.querySelector('.transcript .wg-card'); if (el) el.scrollIntoView({ block: 'start' }); }); await sleep(400);
    const b = await measure(['.wg-who', '.wg-hyp', '.wg-lead-src', '.wg-agreed-prov', '.wg-lead-decision']);
    Object.entries({ ...a, ...b }).forEach(([k, v]) => { if (v < 4.5) low[theme + ' ' + k] = v; });
    low['n:' + theme] = Object.keys({ ...a, ...b }).length;
  }
  await ev(() => window.PM56_CLOCK.setScale(1));
  await target.theme(page, 'basic-dark');
  const misses = Object.entries(low).filter(([k]) => !/^n:/.test(k)), counted = Object.entries(low).filter(([k]) => /^n:/.test(k)).map(([k, v]) => v);
  check('R1-R10 required words and the Recommended mark meet 4.5:1 on their real background in seven themes (' + counted.join('/') + ' measured)', !misses.length && counted.every(n => n >= 6), JSON.stringify(Object.fromEntries(misses)));
}
/* ------------------------------------------------------------------ concept review, round 2 (final, 2026-10-21)
   CONCEPT-ROUND2-RULINGS.md items 1-10, one check each, replayed on the path the reviewer reported
   (CONCEPT-REVIEW-ASTRA-R2.md F1-F8, CONCEPT-REVIEW-OPUS-R2.md N1-N4 and n-a). */
async function reviewRound2({ page, ev, act, sleep, startSheet, answerAll }) {
  const fast = k => ev(k => window.PM56_CLOCK.setScale(k), k);
  const until = (fn, arg, ms = 60000) => page.waitForFunction(fn, arg, { timeout: ms }).then(() => true, () => false);
  const click = async sel => { try { const l = page.locator(sel).first(); if (await l.count() && await l.isVisible()) { await l.click({ timeout: 3000 }); return true; } } catch (e) { } return false; };
  const roundOpen = () => until(() => !!document.querySelector('.qs-grill [data-action="qs-accept-round"]'), null, 20000);
  const thread = () => ev(() => window.PM56_WG_DEMOS.snapshot().threadId);
  const agreedOf = t => ev(t => { const s = window.PM56_WG.threadSession(t), a = window.PM56_WG.grill.agreed(s); return { st: s.status, ended: a.endedBy, dec: a.decisions.map(d => d.id + '=' + d.answer + '/' + d.took), open: a.open.map(o => o.id + ':' + o.why), asked: a.counter.asked }; }, t);
  const reset = async () => { await ev(() => { const b = document.createElement('button'); b.dataset.action = 'reset-all'; (window.PM56_HOST?.root() || document.body).appendChild(b); b.click(); b.remove(); }); await sleep(900); };
  const confirmThread = async (tid, ms = 40000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const st = await ev(t => { const s = window.PM56_WG.threadSession(t); return s ? s.status : ''; }, tid); if (st === 'confirmed') return true; if (await click('.wg-agreed[data-state="open"] [data-action="wg-confirm"]')) { await sleep(700); continue; } if (await click('.qs-grill [data-action="qs-accept-round"]')) { await sleep(900); continue; } await sleep(400); } return false; };
  const acceptLabel = () => ev(() => { const b = document.querySelector('.qs-grill [data-action="qs-accept-round"]'); return b ? b.textContent.replace(/\s+/g, ' ').trim() : ''; });

  if (process.env.WGV_ONLY !== 'contrast') {
  /* 1 (Astra F1 = Opus N1): Keep going followed by an untouched Wrap up keeps every answer you submitted */
  await ev(() => window.PM56_WG_DEMOS.start('deepplan')); await roundOpen(); await sleep(600);
  let t = await thread();
  await click('.qs-grill [data-action="next-question"]'); await sleep(400);
  await page.locator('.qs-grill .qs-ask-opt').nth(1).click(); await sleep(300);
  await answerAll(40000);
  const a5 = await agreedOf(t);
  await click('.wg-agreed[data-state="open"] [data-action="wg-keep-going"]'); await roundOpen(); await sleep(700);
  const revisitLabel = await acceptLabel();
  const revisit = await ev(t => window.PM56_WG.grill.round(window.PM56_WG.threadSession(t)).ids, t);
  await click('.qs-grill [data-action="qs-wrap-up"]'); await sleep(1800);
  const aw = await agreedOf(t);
  /* Opus's order: Not sure on the first, accept the rest; Keep going brings back only the Not sure one (a first-time
     recommendation, untouched): Wrap up leaves it open and keeps the other four */
  await ev(() => window.PM56_WG_DEMOS.start('deepplan')); await roundOpen(); await sleep(600);
  const t2 = await thread();
  await click('.qs-grill [data-action="skip-question"]'); await sleep(400);
  await answerAll(40000);
  await click('.wg-agreed[data-state="open"] [data-action="wg-keep-going"]'); await roundOpen(); await sleep(700);
  await click('.qs-grill [data-action="qs-wrap-up"]'); await sleep(1800);
  const ao = await agreedOf(t2);
  /* ... and the full revisit after that: Keep going (the Not sure one), accept; Keep going (every answer), Wrap up */
  await click('.wg-agreed[data-state="open"] [data-action="wg-keep-going"]'); await roundOpen(); await sleep(700);
  await click('.qs-grill [data-action="qs-accept-round"]'); await sleep(1500);
  await answerAll(30000);
  await click('.wg-agreed[data-state="open"] [data-action="wg-keep-going"]'); await roundOpen(); await sleep(700);
  await click('.qs-grill [data-action="qs-wrap-up"]'); await sleep(1800);
  const ao2 = await agreedOf(t2);
  check('R2-1 Keep going then an untouched Wrap up keeps every submitted answer (5 with Rank by recency instead stay 5; Opus order 5 stay 5); a first-time untouched recommendation stays open',
    a5.dec.length === 5 && aw.dec.length === 5 && aw.dec.some(d => d === 'd-rank=Rank by recency instead/own') && aw.asked === a5.asked && revisit.length >= 2 &&
    ao.dec.length === 3 && ao.open.some(o => /^d-where:Not answered: you wrapped up/.test(o)) && ao.open.some(o => /^d-fallback:Not asked/.test(o)) && ao2.dec.length === 5,
    JSON.stringify({ a5: a5.dec.length, aw, revisit, ao, ao2: ao2.dec.length }).slice(0, 900));

  /* 6 (Astra F6): the revisit round holds your earlier answers, so it never offers to "Accept all N recommended" */
  check('R2-6 a revisit of your earlier answers (Rank by recency instead among them) is never labelled "Accept all N recommended"', !!revisitLabel && !/recommended/i.test(revisitLabel) && /Send/.test(revisitLabel), revisitLabel);

  /* 2 (Astra F2): a Plan revision never publishes before Confirm: Revise targeted first, then Grill Me on, then Send;
     and the destination-provider route */
  await reset();
  const plan = await ev(() => { const c = window.PM56_EXT.ctx(), all = Object.values(window.PM56_PLANS.all()); const p = all.find(x => x.plan_id === 'ap-index') || all.find(x => x.status === 'ready' && c.state.threads.some(t => t.id === x.thread_id)); window.PM56_DEMO.selectThread(p.thread_id); return { id: p.plan_id, tid: p.thread_id, v: p.version, grill: !!p.grillMe }; });
  await sleep(600);
  const ver = () => ev(id => window.PM56_PLANS.all()[id].version, plan.id);
  const dest = () => ev(() => { const d = window.PM56_RUNTIME.composer.destination; return d ? d.kind : null; });
  await act('pd-revise', { id: plan.id }); await sleep(400);
  const d0 = await dest();
  await act('pd-inspect', { id: plan.id }); await sleep(500);
  await click('[data-action="pd-q-grill"][data-id="' + plan.id + '"]'); await roundOpen(); await sleep(600);
  const d1 = await dest();
  await page.locator('.qs-grill .qs-ask-opt').nth(1).click(); await sleep(300);
  /* a send while the thread's turn is busy is queued and delivered when the turn ends (app.js handleSend): the check
     follows it through the queue, so either way it reaches revision admission */
  const sendText = async txt => { await page.locator('.composer-input').first().fill(txt); await sleep(150); await page.locator('[data-action="send"]').first().click(); await sleep(700);
    await until(t => { const c = window.PM56_EXT.ctx(); return !((c.state.sendQueue || {})[t] || []).length || c.state.toast.some(x => /Revise waits/.test(x.title)); }, plan.tid, 30000); await sleep(500); };
  const f2read = () => ev(([id, tid]) => { const c = window.PM56_EXT.ctx(), s = window.PM56_WG.threadSession(tid), t = c.state.threads.find(x => x.id === tid);
    return { v: window.PM56_PLANS.all()[id].version, st: s && s.status, words: String(c.state.composer || '') + ' | ' + ((c.state.sendQueue || {})[tid] || []).map(q => q.text).join(' | '), receipts: t.messages.filter(m => m.type === 'plan-revision-receipt').length }; }, [plan.id, plan.tid]);
  const r0 = await ev(([id, tid]) => window.PM56_EXT.ctx().state.threads.find(x => x.id === tid).messages.filter(m => m.type === 'plan-revision-receipt').length, [plan.id, plan.tid]);
  await sendText('Narrow this plan to its first step.');
  const f2a = await f2read();
  await ev(id => { const R = window.PM56_RUNTIME, c = window.PM56_EXT.ctx(); const ds = R.composer.destinationProviders.map(f => f(c)).reduce((a, b) => a.concat(b || []), []); R.composer.destination = ds.find(d => d.refId === id) || null; c.state.composer = ''; c.renderApp(); }, plan.id); await sleep(300);
  await sendText('Narrow this plan to its first step, by the picker.');
  const f2b = await f2read();
  const confirmed = await confirmThread(plan.tid);
  await ev(([id, tid]) => { const c = window.PM56_EXT.ctx(); c.state.composer = ''; (c.state.sendQueue || {})[tid] = []; c.renderApp(); }, [plan.id, plan.tid]);
  await act('pd-revise', { id: plan.id }); await sleep(300);
  await sendText('Narrow this plan to its first step.');
  await until(([id, v]) => window.PM56_PLANS.all()[id].version === v + 1, [plan.id, plan.v], 30000);
  const f2c = await ev(id => window.PM56_PLANS.all()[id].version, plan.id);
  check('R2-2 a Plan revision is refused before Confirm on every route (targeted before Grill Me came on; the destination picker), your words are kept; after Confirm it is admitted',
    d0 === 'plan-revision' && d1 === 'plan-revision' && f2a.v === plan.v && f2a.st === 'grilling' && /Narrow this plan to its first step\./.test(f2a.words) && f2a.receipts === r0 && f2b.v === plan.v && /by the picker/.test(f2b.words) && f2b.receipts === r0 && confirmed && f2c === plan.v + 1,
    JSON.stringify({ plan, d0, d1, r0, f2a, f2b, confirmed, f2c }));

  /* 3 (Astra F3): turning a Plan's Grill Me off keeps the pick you made, clears the Ask Card and shows one What we
     agreed that waits for Confirm */
  await reset();
  const p3 = await ev(() => { const all = Object.values(window.PM56_PLANS.all()); const p = all.find(x => x.plan_id === 'ap-index'); window.PM56_DEMO.selectThread(p.thread_id); return { id: p.plan_id, tid: p.thread_id }; });
  await sleep(600);
  await act('pd-inspect', { id: p3.id }); await sleep(500);
  await click('[data-action="pd-q-grill"][data-id="' + p3.id + '"]'); await roundOpen(); await sleep(600);
  await page.locator('.qs-grill .qs-ask-opt').nth(1).click(); await sleep(300);
  await act('pd-inspect', { id: p3.id }); await sleep(500);
  await click('[data-action="pd-q-grill"][data-id="' + p3.id + '"]'); await sleep(600);
  await ev(() => { const c = window.PM56_EXT.ctx(); c.state.dialog = null; c.renderApp(); }); await sleep(600);
  const f3 = await ev(tid => { const c = window.PM56_EXT.ctx(), s = window.PM56_WG.threadSession(tid), a = window.PM56_WG.grill.agreed(s); return { st: s.status, ended: a.endedBy, dec: a.decisions.map(d => d.id + '=' + d.answer), card: !!document.querySelector('.qs-grill'), bound: !!c.state.wgGrill, agreed: document.querySelectorAll('.wg-agreed[data-state="open"]').length }; }, p3.tid);
  check('R2-3 turning a Plan’s Grill Me off keeps “Narrow it to the first step”, clears the Ask Card and its binding, and shows one What we agreed for Confirm',
    f3.st === 'agreeing' && f3.ended === 'switched_off' && f3.dec.includes('d-scope=Narrow it to the first step') && !f3.card && !f3.bound && f3.agreed === 1, JSON.stringify(f3));
  }

  /* 4 (Astra F4 + Opus N4 + n-a): contrast on the painted pixels in ten looks: the round bar over its tint, the map's
     frontier, the source line, who asked for a pass, and the rest of the required words */
  await reset();
  await ev(() => window.PM56_WG_DEMOS.start('crew')); await sleep(1400); await startSheet(); await fast(5);
  await until(() => !!document.querySelector('.transcript .wg-card .wg-lead-src'), null, 40000);
  await fast(0.01);
  const crewT = await thread();
  // Arm Deep Plan's interval at its normal cadence before freezing pixels.
  // Its interval uses ms(450) once; starting at .01 leaves a 45s interval
  // after restoring scale 1 and can outlast answerAll's genuine fact wait.
  await fast(1);
  await ev(() => window.PM56_WG_DEMOS.start('deepplan')); await roundOpen(); await sleep(800);
  const dpT = await thread();
  await fast(0.01);
  const low4 = {}, n4 = {}, pixels4 = {};
  for (const look of ['basic-dark', 'basic-light', 'glass-dark', 'glass-light', 'friendly-dark', 'friendly-light', 'retro-dark', 'retro-light', 'nier-dark', 'nier-light']) {
    await target.theme(page, look); await sleep(400);
    await ev(x => window.PM56_DEMO.selectThread(x), dpT); await sleep(500);
    if (!(await ev(() => !!document.querySelector('.qs-grill')))) await act('wg-open-round', { key: 'thread:' + dpT });
    await sleep(600);
    const a = await pixelRatios(page, ['.qs-grill-meta', '.qs-grill-note', '.qs-grill-tally .wg-tree-tally-i', '.qs-ask-opt.is-on .qs-rec']);
    if (await click('.qs-grill [data-action="qs-grill-map"]')) { await sleep(500); Object.assign(a, await pixelRatios(page, ['.qs-grill-map .wg-tree-li[data-state="frontier"] .wg-tree-d', '.qs-grill-map .wg-tree-li[data-state="waiting"] .wg-tree-d'])); await click('.qs-grill [data-action="qs-grill-map"]'); }
    await ev(x => window.PM56_DEMO.selectThread(x), crewT); await sleep(500);
    await click('.qs-grill .qs-ask-x'); await sleep(300);
    await ev(() => { const e = document.querySelector('.transcript .wg-card'); if (e) e.scrollIntoView({ block: 'start' }); }); await sleep(400);
    Object.assign(a, await pixelRatios(page, ['.transcript .wg-card .wg-lead-src', '.transcript .wg-card .wg-pass-title .wg-fine', '.transcript .wg-card .wg-who', '.transcript .wg-card-foot .wg-fine']));
    Object.entries(a).forEach(([k, v]) => { if (v < 4.5) low4[look + ' ' + k] = v; });
    n4[look] = Object.keys(a).length; pixels4[look] = a;
  }
  await target.theme(page, 'basic-dark'); await fast(1);
  check('R2-4 required words read 4.5:1 or better on the painted pixels in ten looks (the round bar over its tint, the map frontier, the source line, who asked for a pass)',
    !Object.keys(low4).length && Object.values(n4).every(n => n >= 8), JSON.stringify({ low4, n4 }));
  results[results.length - 1].measured = { ratios: pixels4, counts: n4 };
  if (process.env.WGV_ONLY === 'contrast') return;

  /* D1 (ruling 18): the map draws its dependencies, has no tally of its own, keeps the question in view at 1440 x 900,
     and marks the question on screen; in What we agreed it gives the structure without repeating the answers */
  await ev(x => window.PM56_DEMO.selectThread(x), dpT); await sleep(400);
  if (!(await ev(() => !!document.querySelector('.qs-grill')))) await act('wg-open-round', { key: 'thread:' + dpT });
  await sleep(500);
  if (!(await ev(() => !!document.querySelector('.qs-grill-map')))) await click('.qs-grill [data-action="qs-grill-map"]');
  await sleep(500);
  const dd1 = await ev(() => { const m = document.querySelector('.qs-grill-map'), t = document.querySelector('.qs-grill .qs-ask-title'), o = document.querySelector('.qs-grill .qs-ask-opt'), body = document.querySelector('.qs-grill .qs-ask-body').getBoundingClientRect(), r = t && t.getBoundingClientRect(), ro = o && o.getBoundingClientRect(), lim = Math.min(body.bottom, innerHeight);
    return { tally: !!(m && m.querySelector('.wg-tree-tally')), guides: m ? m.querySelectorAll('.wg-tg').length : 0, current: m ? m.querySelectorAll('[data-current="1"]').length : 0, title: !!r && r.top >= body.top - 1 && r.bottom <= lim, option: !!ro && ro.top + 12 < lim }; });
  await click('.qs-grill [data-action="qs-grill-map"]'); await sleep(300);
  await answerAll(40000);
  await click('.wg-agreed[data-state="open"] .wg-agreed-map > summary'); await sleep(500);
  const dd1b = await ev(() => { const a = document.querySelector('.wg-agreed[data-state="open"]'); if (!a) return { missing: true }; const rows = [...a.querySelectorAll('.wg-tree-li[data-state="settled"]')]; return { settled: rows.length, repeat: rows.filter(li => li.querySelector('.wg-tree-d')).length, guides: a.querySelectorAll('.wg-tg').length, tally: !!a.querySelector('.wg-tree-tally') }; });
  check('R2-D1 the design tree draws its dependencies, has no tally of its own, keeps the question in view at 1440 x 900 and marks it; What we agreed shows the structure without repeating answers',
    !dd1.tally && dd1.guides >= 2 && dd1.current === 1 && dd1.title && dd1.option && dd1b.settled >= 4 && dd1b.repeat === 0 && dd1b.guides >= 2 && !dd1b.tally, JSON.stringify({ dd1, dd1b }));
  /* D2 (ruling 19): eight rim dots, a caption, every lit angle named without hover, the status marks in the gutter */
  await ev(x => window.PM56_DEMO.selectThread(x), crewT); await sleep(500); await click('.qs-grill .qs-ask-x'); await sleep(300);
  const dd2 = await ev(() => { const c = document.querySelector('.transcript .wg-card'); if (!c) return { missing: true }; const leads = c.querySelectorAll('.wg-lead');
    return { dots: c.querySelectorAll('.wg-compass .wg-cmp-ray circle').length, lit: c.querySelectorAll('.wg-compass .wg-cmp-ray[data-on="1"]').length, cap: (c.querySelector('.wg-cmp-cap') || {}).textContent || '', named: c.querySelectorAll('.wg-cmp-legend .wg-cmp-key').length, leads: leads.length, gutter: c.querySelectorAll('.wg-lead-n > .wg-st-mark').length, inline: c.querySelectorAll('.wg-lead-status .wg-st-mark').length }; });
  check('R2-D2 the compass draws all eight rim positions, captions "N of 8 angles", names every lit angle without hover, and each lead’s status mark sits in its number gutter',
    dd2.dots === 8 && dd2.lit >= 1 && new RegExp('^' + dd2.lit + ' of 8 angles$').test(dd2.cap) && dd2.named === dd2.lit && dd2.gutter === dd2.leads && dd2.leads >= 3 && dd2.inline === 0, JSON.stringify(dd2));
  /* D3 (ruling 20, chosen): Accept all is the filled primary while every answer is the recommendation, Next takes it
     back once you touch one */
  await ev(() => window.PM56_WG_DEMOS.start('deepplan')); await roundOpen(); await sleep(700);
  const kind = () => ev(() => { const a = document.querySelector('.qs-grill [data-action="qs-accept-round"]'), n = document.querySelector('.qs-grill-foot [data-action="next-question"], .qs-grill-foot [data-action="submit-questionnaire"]'); return { accept: a && a.className.split(' ')[0], next: n && n.className.split(' ')[0] }; });
  const dd3a = await kind();
  await page.locator('.qs-grill .qs-ask-opt').nth(1).click(); await sleep(400);
  const dd3b = await kind();
  check('R2-D3 Accept all is the primary while nothing is touched; once an answer is touched, Next is the primary again', dd3a.accept === 'primary-button' && dd3a.next === 'soft-button' && dd3b.accept === 'soft-button' && dd3b.next === 'primary-button', JSON.stringify({ dd3a, dd3b }));
  await fast(1);

  /* 5 (Astra F5 = Opus n-d): on a recorded example, Space on Grill Me (and on the Wonderer) never drops focus to BODY,
     and the switch can be turned back on */
  await reset();
  await ev(() => window.PM56_WG_DEMOS.start('crew')); await sleep(1400);
  const f5 = {};
  for (const key of ['grillMe', 'wonderer']) {
    await page.focus('#pmOverlayRoot [data-collab-input="' + key + '"]'); await page.keyboard.press('Space'); await sleep(500);
    const off = await ev(k => { const a = document.activeElement, i = document.querySelector('#pmOverlayRoot [data-collab-input="' + k + '"]'); return { focus: a === document.body ? 'BODY' : (a && (a.getAttribute('data-collab-input') || a.getAttribute('data-k') || a.tagName)), checked: i ? i.checked : null, disabled: i ? i.disabled : null }; }, key);
    await page.keyboard.press('Space'); await sleep(500);
    const on = await ev(k => { const a = document.activeElement, i = document.querySelector('#pmOverlayRoot [data-collab-input="' + k + '"]'); return { focus: a === document.body ? 'BODY' : (a && a.getAttribute('data-collab-input')), checked: i ? i.checked : null }; }, key);
    f5[key] = { off, on };
  }
  check('R2-5 on a recorded example, Space turns Grill Me and the Wonderer off and on again, and the focus stays on the switch (never BODY)',
    ['grillMe', 'wonderer'].every(k => f5[k].off.focus === k && f5[k].off.checked === false && !f5[k].off.disabled && f5[k].on.focus === k && f5[k].on.checked === true), JSON.stringify(f5));
  await ev(() => { const c = window.PM56_EXT.ctx(); c.state.dialog = null; c.renderOverlays(); });

  /* 7 (Astra F7): a session that begins on an exhausted bank posts its What we agreed at once */
  await reset();
  await ev(() => window.PM56_WG_DEMOS.start('room')); await sleep(1400);
  await ev(() => { const i = document.querySelector('#pmOverlayRoot [data-collab-input="grillMe"]'); if (i && i.checked) i.click(); }); await sleep(400); await startSheet(); await sleep(1200);
  const room = await ev(() => window.PM56_WG_DEMOS.snapshot().runId);
  await until(id => { const c = window.PM56_COLLAB.run(id).chatRoom; return !!(c.round && !c.round.complete); }, room, 20000);
  await act('wg-toggle-grill', { run: room });
  await ev(id => { const b = window.PM56_WG.bankFor('run:' + id); const items = []; for (let i = 1; i <= 25; i++) items.push({ id: 'seed-' + i, prompt: 'Seeded question ' + i }); return b.charge(items); }, room);
  await fast(4);
  await until(id => { const r = window.PM56_COLLAB.run(id); return r.chatRoom.roundsSoFar === 1 && window.PM56_WG.sessionsOf(r).length > 0; }, room, 60000);
  await fast(1); await sleep(900);
  const f7 = await ev(id => { const r = window.PM56_COLLAB.run(id), s = window.PM56_WG.sessionsOf(r).slice(-1)[0], c = s && window.PM56_WG.grill.counter(s); const t = window.PM56_EXT.ctx().state.threads.find(x => x.id === r.threadId); return { st: s && s.status, ended: s && s.endedBy, counter: c && c.asked + '/' + c.limit, card: !!(s && t.messages.some(m => m.type === 'wg-agreed' && m.sessionId === s.id)), shown: !!document.querySelector('.wg-agreed[data-state="open"]') }; }, room);
  check('R2-7 a session that begins on an exhausted bank (25 of 25) posts its What we agreed card at once', f7.st === 'agreeing' && f7.ended === 'cap' && f7.counter === '25/25' && f7.card && f7.shown, JSON.stringify(f7));

  /* 8 (Astra F8): the recorded Crew's late-on question is about the part it actually holds */
  await reset();
  await ev(() => window.PM56_WG_DEMOS.start('crew')); await sleep(1400);
  await ev(() => { const i = document.querySelector('#pmOverlayRoot [data-collab-input="grillMe"]'); if (i && i.checked) i.click(); }); await sleep(400); await startSheet(); await fast(3);
  const crew = await ev(() => window.PM56_WG_DEMOS.snapshot().runId);
  await until(id => window.PM56_COLLAB.run(id).crew.assignments.some(a => a.status === 'running'), crew, 60000);
  await act('wg-toggle-grill', { run: crew });
  await until(id => window.PM56_WG.sessionsOf(window.PM56_COLLAB.run(id)).some(s => /^part:/.test(s.gate)), crew, 90000);
  await fast(1);
  const f8 = await ev(id => { const r = window.PM56_COLLAB.run(id), s = window.PM56_WG.sessionsOf(r).find(x => /^part:/.test(x.gate)), part = s.gate.slice(5), a = r.crew.assignments.find(x => x.id === part), q = s.tree[0];
    return { gate: s.gate, part, title: a && a.title, lead: !!(a && a.leadId), qid: q.id, prompt: q.prompt, why: q.why, held: a && a.status }; }, crew);
  const want8 = { normalize: /title/i, quoting: /quote/i, export: /rows|order/i };
  const fits8 = f8.lead ? new RegExp(String(f8.title).replace(/^Explore /, ''), 'i').test(f8.prompt) : !!(want8[f8.part] && want8[f8.part].test(f8.prompt));
  await confirmThread(await thread(), 30000);
  const go8 = await until(([id, part]) => { const a = window.PM56_COLLAB.run(id).crew.assignments.find(x => x.id === part); return a && a.status !== 'pending'; }, [crew, f8.part], 60000);
  check('R2-8 the recorded Crew’s late-on question is about the part it holds (' + f8.part + '), and Confirm releases that part', fits8 && f8.held === 'pending' && go8, JSON.stringify(f8));
  await fast(1);

  /* 9 (Opus N2): at phone width the safety note stays, the tally goes, and the foot is one row with "Accept all" */
  await target.resize(page, { width: 400, height: 860 }); await sleep(500);
  await ev(() => window.PM56_WG_DEMOS.start('deepplan')); await roundOpen(); await sleep(900);
  const f9 = await ev(grillFooterGeometry);
  f9.sizeContext = testGeometry();
  await target.resize(page, { width: 1440, height: 900 }); await sleep(400);
  check('R2-9 at 400 px the “nothing acts until you confirm” note stays, the tally hides, and the foot is one row with “Accept all”', f9.note && !f9.tally && f9.accept === 'Accept all' && f9.rows === 1, JSON.stringify(f9));
  results[results.length - 1].measured = f9;
  results[results.length - 1].sizeContext = f9.sizeContext;

  /* 10 (Opus N3): the shelf never cuts off "Never votes." or any helper: Retro at 1440 and 400, and 460-519 px */
  const shelf = () => ev(() => [...document.querySelectorAll('#pmOverlayRoot .pmx-spec')].map(sp => { const h = sp.querySelector('.pmx-help'), b = sp.querySelector('.pmx-spec-copy > b'), lh = parseFloat(getComputedStyle(b).lineHeight) || 18;
    return { name: b.textContent, cut: !!h && (h.scrollWidth > h.clientWidth + 1 || getComputedStyle(h).textOverflow === 'ellipsis' && getComputedStyle(h).whiteSpace === 'nowrap'), help: h ? h.textContent : '', nameClip: b.scrollWidth > b.clientWidth + 1, nameLines: Math.round(b.getBoundingClientRect().height / lh) }; }));
  const f10 = {};
  for (const [look, w] of [['retro-light', 1440], ['retro-dark', 1440], ['retro-light', 400], ['retro-dark', 400], ['basic-dark', 460], ['basic-dark', 480], ['basic-dark', 500], ['basic-dark', 519]]) {
    await target.resize(page, { width: w, height: 900 }, 'window'); await target.theme(page, look); await sleep(300);
    await ev(() => window.PM56_WG_DEMOS.start('crew')); await sleep(1300);
    f10[look + '@' + w] = await shelf();
    await ev(() => { const c = window.PM56_EXT.ctx(); c.state.dialog = null; c.renderOverlays(); });
  }
  await target.resize(page, { width: 1440, height: 900 }); await target.theme(page, 'basic-dark'); await sleep(300);
  const bad10 = Object.entries(f10).filter(([k, v]) => !v.length || v.some(x => x.cut || x.nameClip || x.nameLines > 1) || !v.some(x => /Never votes\./.test(x.help))).map(([k, v]) => k + ' ' + JSON.stringify(v));
  check('R2-10 the shelf never cuts off a helper (“Never votes.” whole in Retro at 1440 and 400) and no name is clipped or wrapped at 460-519 px', !bad10.length, bad10.join(' | ').slice(0, 900));
}
if (argv.includes('--browser')) { phase = 'browser'; await browser(); }
const failed = results.filter(r => !r.pass);
const counts = Object.fromEntries(['node', 'browser'].map(phase => [phase, { checks: results.filter(r => r.phase === phase).length, failed: failed.filter(r => r.phase === phase).length }]));
console.log('wonderer-grill-verify: ' + results.length + ' checks, ' + failed.length + ' failed (' + counts.node.checks + ' node, ' + counts.browser.checks + ' browser)');
if (opt('--json')) writeFileSync(opt('--json'), JSON.stringify({ page: target.kind, file: target.file, checks: results.length, failed: failed.length, counts, paintFailures, results }, null, 2));
process.exitCode = failed.length ? 1 : 0;
