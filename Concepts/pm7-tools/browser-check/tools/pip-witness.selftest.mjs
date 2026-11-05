// Contract tests for the structural half (helpers/pip-witness.mjs paintContract, evaluateWitness) on synthetic records:
// no browser, no motion evidence. The in-page witness that writes these records is exercised by the filmed negatives.
// Run: node pip-witness.selftest.mjs
import assert from 'node:assert/strict';
import { FIELDS, paintContract, evaluateWitness } from '../helpers/pip-witness.mjs';

const F = Object.fromEntries(FIELDS.map((k, i) => [k, i]));
const strings = ['', 'friendly-light', 'welcome', 'start', 'Pip missing from the stage', 'animation@pst-svg', 'pstOn@content',
	'head:clip=none|mask=none|filter=url|attr=', 'controller:clip=none|mask=linear-gradient(transparent, transparent)|filter=|attr='];
const S = (x) => strings.indexOf(x);
let seq = 0;
const rec = (o = {}) => {
	const r = new Array(FIELDS.length).fill(0);
	Object.assign(r, { [F.seq]: ++seq, [F.t]: seq * 16.7, [F.look]: S('friendly-light'), [F.pipTheme]: S('friendly-light'), [F.cls]: 'v', [F.why]: 0, [F.label]: S('welcome'), [F.screen]: S('welcome'),
		[F.hx]: 500, [F.hy]: 580, [F.hw]: 140, [F.hh]: 90, [F.cx]: 520, [F.cy]: 350, [F.cw]: 120, [F.ch]: 55, [F.placed]: 1, [F.headVis]: 1, [F.ctlVis]: 1, [F.strVis]: 1,
		[F.opHead]: 1000, [F.opCtl]: 1000, [F.opStr]: 1000, [F.leafArea]: 9000, [F.clipFrac]: 1000, [F.sig]: 0, [F.dim]: 1000, [F.foreign]: 0, [F.gone]: 0 });
	for (const [k, v] of Object.entries(o)) r[F[k]] = v;
	return r;
};
const recs = [];
for (let i = 0; i < 45; i++) recs.push(rec({ cal: 1, calPhase: 1 }));
for (let i = 0; i < 24; i++) recs.push(rec({ cal: 1, calPhase: 2, cls: 'h', headVis: 0, ctlVis: 0 }));
for (let i = 0; i < 45; i++) recs.push(rec({ cal: 1, calPhase: 3 }));
for (let i = 0; i < 40; i++) recs.push(rec());
const w = { recs, strings, cals: [{ ok: true, id: 1, label: 'friendly-light start' }], F };
const { why } = paintContract(w);
let checks = 0;
assert.deepEqual(why(rec()), []); checks++;
assert.match(why(rec({ gone: 1, why: S('Pip missing from the stage') }))[0], /missing from the stage/); checks++;
assert.ok(why(rec({ foreign: S('animation@pst-svg'), opHead: 0, opCtl: 0 })).some((x) => /not one of the stage's own effects: animation@pst-svg/.test(x))); checks++;
assert.ok(why(rec({ sig: S('head:clip=none|mask=none|filter=url|attr=') })).some((x) => /filter on Pip or its ancestors that its look's calibration did not have/.test(x))); checks++;
assert.ok(why(rec({ sig: S('controller:clip=none|mask=linear-gradient(transparent, transparent)|filter=|attr=') })).some((x) => /controller:clip=none\|mask=linear-gradient/.test(x))); checks++;
assert.ok(why(rec({ dim: 0 })).some((x) => /brightness 0/.test(x))); checks++;
assert.ok(why(rec({ leafArea: 0 })).some((x) => /painted leaves 0/.test(x))); checks++;
/* the whole judgement: one missing-Pip frame among clean ones fails the run's paint assertion */
const bad = { ...w, recs: [...recs, rec({ gone: 1, why: S('Pip missing from the stage'), placed: 0 })] };
const paint = (x) => evaluateWitness(x).find((a) => /are painted/.test(a.name));
assert.equal(paint(w).ok, true); assert.equal(paint(bad).ok, false); checks++;
/* an own effect ('a') is not a visible frame: not judged by the paint contract */
assert.equal(paint({ ...w, recs: [...recs, rec({ cls: 'a', why: S('pstOn@content'), opHead: 0 })] }).ok, true); checks++;
console.log(`PASS ${checks}: clean frame, missing Pip, stray ancestor animation, an unseen head filter, an unseen controller mask, brightness 0, no painted leaves, run judgement, own effect excused`);
