#!/usr/bin/env node
/* tests/wonderer-grill-verify.mjs - DL-218 (2026-10-16): the Wonderer runs alongside a Crew, a Chat Room or a BrainStorm and
 * the agents decide its leads; Grill Me is a switch that makes whoever already talks to you grill you.
 *
 *   node tests/wonderer-grill-verify.mjs              engine rules (wonderer-protocol.js, grill-protocol.js) and
 *                                                     static scans of the sources; no browser, a few seconds
 *   node tests/wonderer-grill-verify.mjs --browser    also plays every Demo Studio flow in Chromium against
 *                                                     index.html and checks what the screen shows
 *   options: --file <html> (default ./index.html), --cdp <endpoint> (attach to a running GPU browser, such as an
 *            agent-browser session, instead of launching one), --json <path> (write the report)
 *
 * The browser pass imports playwright, then playwright-core. It never passes --disable-gpu.
 * The rules include the steer of 2026-10-20 from the two Plans reviews: a Chat Room never waits for the Wonderer; 3 to 5
 * leads is a target (0 to 5 allowed); leads are decided as they arrive, and nothing new reaches the team once it writes
 * the result; grilling waits on lookups; Grill Me turned on mid-run gates only the step that uses its answers; the first
 * pass runs during intake and a later pass queues behind core work. */
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2), opt = n => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const results = [];
function check(name, pass, detail) { results.push({ name, pass: !!pass, detail: pass ? '' : String(detail == null ? '' : detail) }); if (!pass) console.log('FAIL  ' + name + (detail ? '  -- ' + detail : '')); }
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

/* ------------------------------------------------------------------ browser: what the screen shows */
async function browser() {
  let pw = null;
  for (const m of ['playwright', 'playwright-core']) { try { pw = await import(m); break; } catch (e) { } }
  if (!pw) { check('B0 a browser is available (playwright or playwright-core)', false, 'neither module resolves from ' + ROOT); return; }
  const chromium = pw.chromium || (pw.default && pw.default.chromium);
  const cdp = opt('--cdp'), FILE = path.resolve(opt('--file') || path.join(ROOT, 'index.html'));
  const b = cdp ? await chromium.connectOverCDP(cdp) : await chromium.launch({ headless: true, args: ['--allow-file-access-from-files', '--no-sandbox'] });
  const ctx = cdp ? b.contexts()[0] : await b.newContext();
  const page = cdp ? ctx.pages()[0] : await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e && e.message || e)));
  await page.setViewportSize({ width: 1440, height: 900 });
  const load = async () => { await page.goto(pathToFileURL(FILE).href); await page.waitForFunction(() => window.__PM56_BOOT_OK === true, null, { timeout: 30000 }); await page.waitForTimeout(1500); };
  const ev = (fn, a) => page.evaluate(fn, a);
  const act = (name, data) => ev(([n, d]) => { const b = document.createElement('button'); Object.assign(b.dataset, d || {}); window.PM56_EXT.run(n, b, new Event('click')); window.PM56_EXT.ctx().renderApp(); }, [name, data || {}]);
  const sleep = ms => page.waitForTimeout(ms);
  const startSheet = async () => { await page.locator('#pmOverlayRoot .pmx-sheet .pmx-foot .primary-button').last().click(); await sleep(1400); };
  /* answer every round with Accept all until What we agreed is open; notes whether it waited on a lookup on the way */
  const answerAll = async (maxMs = 30000) => {
    let waited = false; const t0 = Date.now();
    while (Date.now() - t0 < maxMs) {
      if (await ev(() => !!document.querySelector('.wg-agreed[data-state="open"]'))) return { agreed: true, waited };
      if (await ev(() => !!document.querySelector('.qs-grill [data-action="qs-accept-round"]'))) { await page.locator('.qs-grill [data-action="qs-accept-round"]').first().click(); await sleep(1300); continue; }
      if (await ev(() => !!document.querySelector('.wg-lookup'))) waited = true;
      await sleep(500);
    }
    return { agreed: false, waited };
  };
  const wonLanes = () => ev(() => [...document.querySelectorAll('.pmx-lane[data-k*=":"]')].filter(l => /Wonderer/.test(l.querySelector('.pmx-lane-name')?.textContent || '')).map(l => l.textContent));
  try {
    await load();
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
    await ev(() => window.PM56_WG_DEMOS.start('crew')); await sleep(900); await startSheet();
    const crew = await ev(() => { const s = window.PM56_WG_DEMOS.snapshot(), r = window.PM56_COLLAB.run(s.runId); return { id: r.id, grill: r.config.grill_me_enabled, parts: r.participants.map(p => p.additiveRoleKind), q: document.querySelector('.qs-grill-bar') ? document.querySelector('.qs-grill-bar').textContent : '', pre: [...document.querySelectorAll('.qs-ask-opt.is-on .qs-rec')].length }; });
    check('B2 a Crew with Grill Me on adds nobody', crew.grill === true && !crew.parts.some(k => /grill/.test(k)) && crew.parts.filter(k => k === 'wonderer').length === 1, JSON.stringify(crew.parts));
    check('B2b the round is the questionnaire, the Coordinator grilling, the recommended answer preselected', /The Coordinator is grilling you/.test(crew.q) && crew.pre === 1, crew.q);
    const split = await ev(id => window.PM56_CREW.claim(id, 'normalize', { epoch: window.PM56_COLLAB.run(id).stopEpoch, sourceHash: window.PM56_COLLAB.run(id).crew.input.sourceHash }), crew.id);
    check('B2c the split waits for Confirm', split.error === 'grill_me_waits_for_confirm', JSON.stringify(split));
    const crewAns = await answerAll(40000);
    check('B2e grilling waited on a lookup instead of jumping to What we agreed', crewAns.waited, JSON.stringify(crewAns));
    const agreed = await ev(() => { const a = document.querySelector('.wg-agreed[data-state="open"]'); return a ? { rows: a.querySelectorAll('.wg-agreed-row').length, confirm: !!a.querySelector('[data-action="wg-confirm"]'), keep: !!a.querySelector('[data-action="wg-keep-going"]') } : null; });
    check('B2d What we agreed lists every decision, with Confirm and Keep going', agreed && agreed.rows === 5 && agreed.confirm && agreed.keep, JSON.stringify(agreed));
    await page.locator('.wg-agreed [data-action="wg-confirm"]').first().click();
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
    await act('b13-open', { run: bsId }); await sleep(600);
    let normalized = null, waits = [], checked = false, firstPassAt = null;
    for (let i = 0; i < 120; i++) {
      await sleep(600);
      const st = await ev(id => { const r = window.PM56_COLLAB.run(id), W = window.PM56_WG, b = r.brainstorm; return { phase: b.phase, proposals: b.attempts.filter(a => a.status === 'completed').length, n: b.attempts.length, held: r.wonderer.passes[0].status, gate: W.gate(r), synth: !!b.synthesis, votes: (b.votes || []).length, wVote: (b.votes || []).some(v => r.participants.find(p => p.id === v.participantId)?.additiveRoleKind === 'wonderer'), undecidedLong: r.wonderer.leads.filter(l => !l.disposition && W.engine.visible(r, l.passId)).length }; }, bsId);
      if (st.proposals > 0 && firstPassAt === null) firstPassAt = st.held;
      if (!normalized && st.held === 'delivered') normalized = st;
      if (st.phase === 'vote' && !checked) { checked = true; await act('wg-check-it', { run: bsId, lead: 'instant' }); }
      if (st.phase === 'synthesis' && !st.gate.ok) { const dom = await ev(() => { const b = document.querySelector('[data-action="collab-brainstorm-synthesize"]'); return b ? b.disabled : null; }); waits.push(st.gate.code + ':' + dom); }
      if (st.phase === 'synthesis' && st.gate.ok) break;
      if (st.wVote) { check('B5 the Wonderer never votes', false, 'a Wonderer vote was recorded'); break; }
    }
    check('B4d the first pass ran during intake, before any blind proposal took a slot', firstPassAt === 'held', String(firstPassAt));
    check('B4c the leads are released only once every blind proposal is in', normalized && normalized.proposals === normalized.n && normalized.phase !== 'blind_proposals', JSON.stringify(normalized));
    check('B5 Write the plan waits for a pass in flight and for research (never for you), with the button disabled', waits.some(w => /^exploring:true/.test(w)) && waits.some(w => /^research:true/.test(w)) && !waits.some(w => /:false$/.test(w)), waits.join(','));
    const refused = await ev(id => { const r = window.PM56_COLLAB.run(id); return window.PM56_WG.gate(r).ok; }, bsId);
    await act('collab-brainstorm-synthesize', { run: bsId }); await sleep(1500);
    const plan = await ev(id => { const r = window.PM56_COLLAB.run(id), p = window.PM56_BRAINSTORM.planPayload(r); return { synth: !!r.brainstorm.synthesis, text: JSON.stringify(p.blocks), total: window.PM56_WG.engine.counts(r).total }; }, bsId);
    /* M4: every lead keeps the team's decision, its reason and recorder, and a research result is added under it */
    const decided = plan.text.match(/ — (Explore|Use|Set aside) \(the Coordinator: [^)]+\)/g) || [], researched = plan.text.match(/ — Explore \(the Coordinator: [^)]+\) → (Supported|Not supported): /g) || [];
    check('B5b the Plan lists every lead with the team’s decision and reason, and research under it (M4)', refused && plan.synth && /Wonderer leads/.test(plan.text) && decided.length === plan.total && researched.length >= 3, JSON.stringify({ total: plan.total, decided: decided.length, researched: researched.length }));
    /* Grill Me turned on mid-run (the 'dissent' recording) */
    await ev(() => { const b = document.createElement('button'); b.dataset.flow = 'dissent'; window.PM56_EXT.run('b13-start', b, new Event('click')); }); await sleep(900); await startSheet();
    const dsId = await ev(() => window.PM56_BATCH13.currentRun().id);
    await act('collab-brainstorm-toggle-grill', { run: dsId });
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
    check('APR-072b the Plan is written after Confirm', !(await noPlan()));
    await reviewRound1({ page, ev, act, sleep, startSheet, answerAll });
    check('B7 no page errors', !errs.length, errs.slice(0, 3).join(' | '));
  } catch (e) { check('B0 the browser pass ran to the end', false, e && e.stack || e); }
  if (cdp) await b.close().catch(() => {}); else await b.close();
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
  const need = await ev(() => { const b = [...document.querySelectorAll('#pmOverlayRoot .pmx-sheet .pmx-foot .primary-button')].pop(); return { disabled: !!(b && b.disabled), text: (document.querySelector('#pmOverlayRoot .pmx-sheet') || {}).textContent || '' }; });
  check('R1-R6c a recording that needs the Wonderer says so before Start and does not start', need.disabled && /follows the Wonderer’s leads/.test(need.text), JSON.stringify({ disabled: need.disabled }));
  await ev(() => { const c = window.PM56_EXT.ctx(); c.closeDialog ? c.closeDialog() : (c.state.dialog = null); c.renderOverlays(); });

  /* R11: the Grill Me switch is named, described and keeps the keyboard focus */
  await ev(() => { const C = window.PM56_COLLAB, c = window.PM56_EXT.ctx(); c.switchThread('query'); C.openConfigure('crew'); const d = C.draft(); d.purpose = 'Export the collection.'; d.wonderer = true; d.grillMe = true; c.openDialog({ type: 'collab-configure' }); c.renderOverlays(); }); await sleep(700);
  const sw = await ev(() => { const i = document.querySelector('#pmOverlayRoot [data-collab-input="grillMe"]'), d = i && document.getElementById(i.getAttribute('aria-describedby') || ''); return { label: i && i.getAttribute('aria-label'), role: i && i.getAttribute('role'), described: d ? d.textContent : '' }; });
  await page.focus('#pmOverlayRoot [data-collab-input="grillMe"]'); await page.keyboard.press('Space'); await sleep(500);
  const after = await ev(() => { const a = document.activeElement; return { on: a && a.getAttribute && a.getAttribute('data-collab-input'), checked: a && a.checked, ring: a && a.closest && getComputedStyle(a.closest('.pmx-add')).outlineStyle }; });
  check('R1-R11 the switch is named Grill Me, described by its helper, and keeps focus with a visible ring after Space', sw.label === 'Grill Me' && sw.role === 'switch' && /questions you/.test(sw.described) && after.on === 'grillMe' && after.checked === false && after.ring !== 'none', JSON.stringify({ sw, after }));
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
  await act('collab-room-next-round', { run: room }); await fast(4);
  await until(id => { const c = window.PM56_COLLAB.run(id).chatRoom; return c.roundsSoFar === 1 && (!c.round || c.round.complete); }, room, 60000);
  await fast(1); await act('wg-toggle-grill', { run: room }); await act('collab-room-next-round', { run: room }); await sleep(800);
  const rm = await ev(id => { const r = window.PM56_COLLAB.run(id), s = window.PM56_WG.sessionsOf(r)[0]; return { gate: s && s.gate, round2: !!(r.chatRoom.round && r.chatRoom.round.number === 2) }; }, room);
  check('R1-m5c Chat Room: Grill Me turned on mid-run grills you before round 2, and round 2 waits', rm.gate === 'round:2' && !rm.round2, JSON.stringify(rm));
  await confirmAll(30000); await act('collab-room-next-round', { run: room }); await sleep(600);
  check('R1-m5d round 2 starts after that Confirm', await ev(id => { const r = window.PM56_COLLAB.run(id); return !!(r.chatRoom.round && r.chatRoom.round.number === 2); }, room));

  /* m10: an ordinary Plan's Question budget "Turn Grill Me on" starts the real grilling on that Plan's thread, over
     the Plan's own counter; its Revise waits for Confirm; Confirm lets it go */
  await ev(() => { const b = document.createElement('button'); b.dataset.action = 'reset-all'; document.body.appendChild(b); b.click(); b.remove(); }); await sleep(800);
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
    await answerAll(40000); await click('.wg-agreed[data-state="open"] [data-action="wg-confirm"]'); await sleep(600);
    m10.after = await ev(tid => window.PM56_WG.threadHolds(tid, 'revise'), plan10.tid);
  }
  check('R1-m10 an ordinary Plan’s Turn Grill Me on grills you on its thread, Revise waits for Confirm, then goes', !!plan10 && m10.on && /assistant/i.test(m10.card) && m10.held === true && /Revise waits/i.test(m10.toast) && m10.bank >= 1 && m10.after === false, JSON.stringify(m10));

  /* M5 + m8 = R10: required words read at 4.5:1 or better on their real background, NieR's Recommended included, in
     a light and a dark theme of every family */
  const measure = sels => ev(sels => {
    const parse = c => { const m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
    const over = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
    const bgOf = el => { const layers = []; for (let x = el; x && x.nodeType === 1; x = x.parentElement) { const c = parse(getComputedStyle(x).backgroundColor); if (c && c.a > 0) layers.push(c); if (c && c.a >= 1) break; } let acc = parse(getComputedStyle(document.documentElement).backgroundColor) || { r: 0, g: 0, b: 0, a: 1 }; if (acc.a < 1) acc = over(acc, { r: 255, g: 255, b: 255, a: 1 }); for (let i = layers.length - 1; i >= 0; i--) acc = over(layers[i], acc); return acc; };
    const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
    const ratio = el => { const fg = parse(getComputedStyle(el).color), bg = bgOf(el); let op = 1; for (let x = el; x && x.nodeType === 1; x = x.parentElement) op *= parseFloat(getComputedStyle(x).opacity || '1'); const f = over({ ...fg, a: (fg.a == null ? 1 : fg.a) * op }, bg); const a = lum(f), b = lum(bg); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05); };
    const out = {};
    for (const sel of sels) { const el = [...document.querySelectorAll(sel)].find(e => e.getClientRects().length && e.textContent.trim()); if (el) out[sel] = Math.round(ratio(el) * 100) / 100; }
    return out;
  }, sels);
  const crewThread = await ev(id => window.PM56_COLLAB.run(id).threadId, (await ev(() => (window.PM56_COLLAB.runs().filter(r => r.kind === 'crew' && r.wonderer && r.status === 'completed').pop() || {}).id)));
  const low = {};
  for (const theme of ['basic-dark', 'basic-light', 'glass-light', 'friendly-light', 'retro-dark', 'nier-dark', 'nier-light']) {
    await ev(t => window.PM56_DEMO.setTheme(t), theme); await sleep(400);
    await ev(() => window.PM56_WG_DEMOS.start('deepplan')); await roundOpen(); await sleep(700);
    const a = await measure(['.qs-ask-opt.is-on .qs-rec', '.qs-grill-note', '.qs-grill-meta']);
    await ev(t => { const c = window.PM56_EXT.ctx(); c.switchThread(t); c.renderApp(); }, crewThread); await sleep(700);
    await ev(() => { const el = document.querySelector('.transcript .wg-card'); if (el) el.scrollIntoView({ block: 'start' }); }); await sleep(400);
    const b = await measure(['.wg-who', '.wg-hyp', '.wg-lead-src', '.wg-agreed-prov', '.wg-lead-decision']);
    Object.entries({ ...a, ...b }).forEach(([k, v]) => { if (v < 4.5) low[theme + ' ' + k] = v; });
    low['n:' + theme] = Object.keys({ ...a, ...b }).length;
  }
  await ev(() => window.PM56_DEMO.setTheme('basic-dark'));
  const misses = Object.entries(low).filter(([k]) => !/^n:/.test(k)), counted = Object.entries(low).filter(([k]) => /^n:/.test(k)).map(([k, v]) => v);
  check('R1-R10 required words and the Recommended mark meet 4.5:1 on their real background in seven themes (' + counted.join('/') + ' measured)', !misses.length && counted.every(n => n >= 6), JSON.stringify(Object.fromEntries(misses)));
}
if (argv.includes('--browser')) await browser();
const failed = results.filter(r => !r.pass);
console.log('wonderer-grill-verify: ' + results.length + ' checks, ' + failed.length + ' failed');
if (opt('--json')) writeFileSync(opt('--json'), JSON.stringify({ checks: results.length, failed: failed.length, results }, null, 2));
process.exitCode = failed.length ? 1 : 0;
