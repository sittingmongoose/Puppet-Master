// R100 T1/T2/T3: the measured states must decide the verdict, including an already-applied light and visible opacity.
import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
// node tools/usage-hover-pause-verdict.selftest.mjs [check file]: the argument runs the same assertions against another
// revision of the check, which is how each item's RED run shows the old verdict misjudging a constructed record.
const { judge, outerCap, uninterruptedIntent, judgeShortHandoff, r5MountQualified, r5MountProduct, r5BurstGate } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../checks/usage-hover-pause.check.mjs');
import { burstState } from '../helpers/burst-rest.mjs';
// R125 #6: the probe's deadline comes from the record's last input, as the recorder arms it (520 + 150). The old
// fixture injected 650 and so credited 20 ms of lateness in the nominal control though the probe fired at the real
// deadline; a control's lateness must be the queue's, not the fixture's.
const LAST_INPUT = 520;
const make = () => ({
 wheels:[100,200,300,400,500],scrolls:[120,220,320,420,520],ops:[{t:101,op:'wheel'},{t:670,op:null}],
 probe:{due:LAST_INPUT+150,fired:670},
 trans:[],cls:[{t:680,card:'new',on:true}],loaf:[],
 frames:Array.from({length:112},(_,i)=>{const t=100+i*10;return {t,top:i,card:'new',lit:t>=680?['new']:[],near:[],tools:t>=680?.9:0,op:t<670?'wheel':null,highlights:0};})
});
function withTimer(r) {
 // Fixtures can set timer explicitly when timing the entry itself.
 const timer = { inputDue: r.probe.due, armed: r.probe.due - 150, entered: Math.max(r.probe.due, r.probe.fired) };
 return { timer, ...r };
}
const j = (r) => judge(withTimer(r),{rest:'old',back:400});
test('a sampled quiet pause and visibly restored target pass',()=>{const r=j(make());assert.equal(r.r1.ok,true);assert.equal(r.r2.ok,true);});
test('an engine light persisting on the starting card fails R1',()=>{const r=make();Object.assign(r.frames.find(f=>f.t===300),{card:'old',lit:['old']});assert.equal(j(r).r1.ok,false);});
test('ordinary main chart selections are outside the narrowed engine verdict',()=>{const r=make();r.frames.find(f=>f.t===300).highlights=1;assert.equal(j(r).r1.ok,true);});
test('the marked tail after the last scroll is part of R1',()=>{const r=make();r.frames.find(f=>f.t===600).lit=['old'];assert.equal(j(r).r1.ok,false);});
test('fewer than five sampled active frames cannot pass R1',()=>{const r=make();r.frames=r.frames.filter(f=>f.t>=680);assert.equal(j(r).r1.ok,false);});
test('a starting card with tools still revealed after their fade cannot pass R1',()=>{const r=make();Object.assign(r.frames.find(f=>f.t===400),{card:'old',tools:1});assert.equal(j(r).r1.ok,false);});
test('an approved segmented-control color transition is not a forbidden card reveal',()=>{const r=make();r.trans.push({t:300,card:'new',under:true,prop:'color',cls:'pmu-seg-button',approved:true});assert.equal(j(r).r1.ok,true);});
test('a transitionrun or ten-percent opacity cannot stand in for visibly returned tools',()=>{const r=make();r.trans.push({t:680,card:'new',under:true,prop:'opacity',cls:'pmu-cardtools'});for(const f of r.frames)if(f.t>=680&&f.t<860)f.tools=.1;assert.equal(j(r).r2.ok,false);});
test('a lit card whose tools never visibly return cannot pass R2',()=>{const r=make();r.trans.push({t:680,card:'new',under:true,prop:'opacity',cls:'pmu-cardtools'});for(const f of r.frames)f.tools=0;assert.equal(j(r).r2.ok,false);});
test('a later marked hold in the same input window must also be judged',()=>{
 const r=make();r.ops=[{t:101,op:'wheel'},{t:250,op:null},{t:270,op:'wheel'},{t:670,op:null}];
 for(const f of r.frames)f.op=(f.t<250||f.t>=270&&f.t<670)?'wheel':null;
 r.frames.find(f=>f.t===600).lit=['old'];assert.equal(j(r).r1.ok,false);
});
test('an explicitly marked PMH exit is not a new hover-in transition on the starting card',()=>{
 const r=make();r.trans.push({t:180,card:'old',under:true,prop:'opacity',cls:'pmu-card pmh-out',exiting:true});assert.equal(j(r).r1.ok,true);
});
test('delayed starting-head transitions toward neutral are exits, while entries still fail',()=>{
 const exits=[['opacity','pmu-cardtools','1','0'],['opacity','pmu-h','1','0'],['margin-right','pmu-cardtitles','108px','0px'],['pointer-events','pmu-cardtools','auto','none']];
 for(const [prop,cls,from,to] of exits){const r=make();r.trans.push({t:180,card:'old',under:true,prop,cls,from,to});assert.equal(j(r).r1.ok,true,prop);}
 const r=make();r.trans.push({t:180,card:'old',under:true,prop:'opacity',cls:'pmu-cardtools',from:'0',to:'1'});assert.equal(j(r).r1.ok,false);
});

test('R123 P-1: a head-tools slide during the hold fails R1, on a passing card and on the held one',()=>{
 const r=make();r.trans.push({t:180,card:'new',under:true,prop:'transform',cls:'pmu-headtools',from:'none',to:'matrix(1,0,0,1,-103,0)'});assert.equal(j(r).r1.ok,false);
 const h=make();h.trans.push({t:180,card:'old',under:true,prop:'transform',cls:'pmu-headtools',from:'matrix(1,0,0,1,-103,0)',to:'none'});assert.equal(j(h).r1.ok,false);
 const c=make();c.trans.push({t:200,card:'new',under:true,prop:'color',cls:'pmu-caveat'});assert.equal(j(c).r1.ok,false);
});

test('typed main chart transitions are allowed while CSS hover row leakage still fails',()=>{const r=make();r.trans.push({t:300,card:'new',under:true,prop:'opacity',cls:'pmu-mark is-hl-dim',chartControlled:true});assert.equal(j(r).r1.ok,true);r.trans.push({t:320,card:'new',under:true,prop:'background-color',cls:'pmu-row',chartControlled:false});assert.equal(j(r).r1.ok,false);});

test('an early release with enough quiet frames still fails R1 and R2',()=>{
 const r=make();
 r.ops=[{t:101,op:'wheel'},{t:290,op:null}];
 r.cls=[{t:300,card:'new',on:true}];
 for(const f of r.frames)Object.assign(f,{op:f.t<290?'wheel':null,lit:f.t>=300?['new']:[],tools:f.t>=300?.9:0});
 const result=j(r);
 assert.equal(result.r1.ok,false);
 assert.equal(result.r2.ok,false);
 assert.equal(result.r2.ms,null);
});
test('lighting before the real rest deadline fails both rows even under the marker',()=>{
 const r=make();
 r.frames.find(f=>f.t===650).lit=['new'];
 assert.equal(j(r).r1.ok,false);
 assert.equal(j(r).r2.ok,false);
});

// TB6 item 2: the pause's end is judged against the host's own measured timer lateness, and the return in drawn frames.
test('TB6 item 2: a late pause end within the host timer lateness passes, with the return counted in frames',()=>{
 const r=make();
 r.ops=[{t:101,op:'wheel'},{t:700,op:null}];
 r.probe={due:670,fired:695};
 r.cls=[{t:710,card:'new',on:true}];
 for(const f of r.frames)Object.assign(f,{op:f.t<700?'wheel':null,lit:f.t>=710?['new']:[],tools:f.t>=710?.9:0});
 const v=j(r);
 assert.equal(v.r2.end,180);
 assert.equal(v.r2.late,25);
 assert.equal(v.r2.back,10);
 assert.equal(v.r2.backFrames,1);
 assert.equal(v.r2.ok,true);
});
test('TB6 item 2 RED: the same 180 ms end is could-not-judge when the probe shows no timer lateness',()=>{
 const r=make();
 r.ops=[{t:101,op:'wheel'},{t:700,op:null}];
 r.probe={due:670,fired:670};
 r.cls=[{t:710,card:'new',on:true}];
 for(const f of r.frames)Object.assign(f,{op:f.t<700?'wheel':null,lit:f.t>=710?['new']:[],tools:f.t>=710?.9:0});
 assert.equal(j(r).r2.end,180);
 assert.equal(j(r).r2.ok,false);
});
test('TB6 item 2 RED: a light three drawn frames after the pause end fails, though 190 ms is inside the outer cap',()=>{
 const r=make();
 r.ops=[{t:101,op:'wheel'},{t:670,op:null}];
 r.cls=[{t:710,card:'new',on:true}];
 for(const f of r.frames)Object.assign(f,{op:f.t<670?'wheel':null,lit:f.t>=710?['new']:[],tools:f.t>=710?.9:0});
 const v=j(r);
 assert.equal(v.r2.ms,190);
 assert.equal(v.r2.back,40);
 assert.equal(v.r2.backFrames,4);
 assert.equal(v.r2.ok,false);
});
test('TB6 item 2: the 400 ms outer cap fails a page that returns very late even inside two long frames',()=>{
 const r=make();
 r.ops=[{t:101,op:'wheel'},{t:670,op:null}];
 r.cls=[{t:970,card:'new',on:true}];
 r.frames=Array.from({length:14},(_,i)=>({t:100+i*150,top:i,card:'new',lit:i>=6?['new']:[],near:[],tools:i>=6?.9:0,op:i<4?'wheel':null,highlights:0}));
 const v=j(r);
 assert.equal(v.r2.back,330);
 assert.equal(v.r2.backFrames,3);
 assert.equal(v.r2.ok,false);
});
// R125 #2: the occupied sample is counted. Two dark samples and a return on the third used to read 2 and pass.
test('R125 #2: a light first seen on the third sample after the pause end fails',()=>{
 const r=make();
 r.ops=[{t:101,op:'wheel'},{t:670,op:null}];
 r.cls=[{t:700,card:'new',on:true}];
 for(const f of r.frames)Object.assign(f,{op:f.t<670?'wheel':null,lit:f.t>=700?['new']:[],tools:f.t>=700?.9:0});
 const v=j(r);
 assert.equal(v.r2.end,150);
 assert.equal(v.r2.back,30);
 assert.equal(v.r2.backFrames,3);
 assert.equal(v.r2.ok,false);
});
test('R125 #2 control: a return on the second sample is still within two frames',()=>{
 const r=make();
 r.ops=[{t:101,op:'wheel'},{t:670,op:null}];
 r.cls=[{t:690,card:'new',on:true}];
 for(const f of r.frames)Object.assign(f,{op:f.t<670?'wheel':null,lit:f.t>=690?['new']:[],tools:f.t>=690?.9:0});
 const v=j(r);
 assert.equal(v.r2.backFrames,2);
 assert.equal(v.r2.ok,true);
});
// R125 #3: a marker that outlives the nominal deadline must not be excused by a light that came back in the gap.
test('R125 #3: a return seen before the marker removal fails, even when the marker outlives the deadline',()=>{
 const r=make();
 r.ops=[{t:101,op:'wheel'},{t:720,op:null}];
 r.probe={due:670,fired:720};
 r.cls=[{t:690,card:'new',on:true}];
 for(const f of r.frames)Object.assign(f,{op:f.t<720?'wheel':null,lit:f.t>=690?['new']:[],tools:f.t>=690?.9:0});
 const v=j(r);
 assert.equal(v.r2.end,200);
 assert.equal(v.r2.late,50);
 assert.equal(v.r2.back,null);
 assert.equal(v.r2.early,3);
 assert.equal(v.r2.ok,false);
});
test('R125 #3 control: the same late end passes when the return follows the marker removal',()=>{
 const r=make();
 r.ops=[{t:101,op:'wheel'},{t:720,op:null}];
 r.probe={due:670,fired:720};
 r.cls=[{t:730,card:'new',on:true}];
 for(const f of r.frames)Object.assign(f,{op:f.t<720?'wheel':null,lit:f.t>=730?['new']:[],tools:f.t>=730?.9:0});
 const v=j(r);
 assert.equal(v.r2.end,200);
 assert.equal(v.r2.back,10);
 assert.equal(v.r2.early,0);
 assert.equal(v.r2.ok,true);
});
// R125 #4: the outer cap is a ceiling; --set back= may only lower it, never widen it.
test('R125 #4: --set back can only lower the 400 ms ceiling',()=>{
 assert.equal(outerCap(500),400);
 assert.equal(outerCap(400),400);
 assert.equal(outerCap(250),250);
 for(const v of [undefined,null,'',0,-50,NaN,'nonsense']) assert.equal(outerCap(v),400,String(v));
});
test('R125 #4 RED: a 480 ms return passes an unbounded cap and fails the 400 ms ceiling',()=>{
 const r=make();
 r.ops=[{t:101,op:'wheel'},{t:970,op:null}];
 r.probe={due:670,fired:970};
 r.cls=[{t:980,card:'new',on:true}];
 for(const f of r.frames)Object.assign(f,{op:f.t<970?'wheel':null,lit:f.t>=980?['new']:[],tools:f.t>=980?.9:0});
 assert.equal(judge(withTimer(r),{rest:'old',back:500}).r2.ok,true,'480 ms after the last input inside an unbounded cap');
 assert.equal(judge(withTimer(r),{rest:'old',back:outerCap(500)}).r2.ok,false,'the same record at the clamped ceiling');
});
// R125 #6: the fixture models the recorder, whose deadline is the last input plus the rest.
test('R125 #6: the fixture probe deadline is the last input plus the 150 ms rest, with no credited lateness',()=>{
 const r=make();
 assert.equal(r.probe.due,Math.max(r.wheels.at(-1),r.scrolls.at(-1))+150);
 assert.equal(j(r).r2.late,0);
 assert.equal(j(r).r2.ok,true);
});
// R125 #1: the page's own return work gets a fixed budget, not the measured work.
test('R125 #1: a few ms of the page\'s own return work pass, a long fit does not',()=>{
 const small=make();
 small.ops=[{t:101,op:'wheel'},{t:676,op:null}];
 small.probe={due:670,fired:670};
 small.cls=[{t:686,card:'new',on:true}];
 for(const f of small.frames)Object.assign(f,{op:f.t<676?'wheel':null,lit:f.t>=686?['new']:[],tools:f.t>=686?.9:0});
 const a=j(small);
 assert.equal(a.r2.work,6);
 assert.equal(a.r2.ok,true,'a 6 ms fit is inside the 16 ms budget');
 const long=make();
 long.ops=[{t:101,op:'wheel'},{t:750,op:null}];
 long.probe={due:670,fired:670};
 long.cls=[{t:760,card:'new',on:true}];
 for(const f of long.frames)Object.assign(f,{op:f.t<750?'wheel':null,lit:f.t>=760?['new']:[],tools:f.t>=760?.9:0});
 const b=j(long);
 assert.equal(b.r2.work,80);
 assert.equal(b.r2.ok,false,'R125\'s 80 ms fit is outside the budget even with an on-time host');
});
// TB6 item 1: a 258 ms driver gap is reported as a broken burst; a 30 ms cadence is not.
test('TB6 item 1: a 258 ms driver gap is reported as a broken burst; a 30 ms cadence is not',()=>{
 const r=make();
 r.wheels=[100,130,160,418,448,478,508];
 r.scrolls=[120,420,520];
 assert.deepEqual(j(r).burst,{maxGap:258,rest:150,broke:true});
 assert.equal(j(make()).burst.broke,false);
});

test('R113 T3: even a momentary marker gap before the first sampled frame fails the hold', () => {
 const r = make();
 r.ops = [{t:101,op:'wheel'},{t:124,op:null},{t:124,op:'wheel'},{t:670,op:null}];
 assert.equal(j(r).r1.ok, false);
});
test('R117 T2: an unmarked sampled gap fails even if the recorder missed a marker change', () => {
 const r = make();
 r.frames.find(f => f.t === 300).op = null;
 assert.equal(j(r).r1.ok, false);
 assert.equal(j(r).r2.ok, false);
});

test('R100 T8: a delegated pointerover inside the same column rearms the pending intent', () => {
 const record = { enterIndex: 0, overs: [100], applied: 214 };
 assert.equal(uninterruptedIntent(record), true);
 assert.equal(uninterruptedIntent({...record, overs:[100, 107]}), false);
 assert.equal(uninterruptedIntent({...record, overs:[100, 225]}), true);
});
test('R117 T3: a visible proxy during the burst fails even with dark card classes', () => {
 const r = make();
 r.frames.find(f => f.t === 300).proxyLit = true;
 assert.equal(j(r).r1.ok, false);
 assert.equal(j(r).r2.ok, false);
});
test('R117 T3: the card lighting up cannot substitute for a required proxy', () => {
 const r = make();
 for (const f of r.frames) Object.assign(f, { proxyRequired: true, proxyBack: false });
 assert.equal(j(r).r2.ok, false);
 for (const f of r.frames) f.proxyBack = f.t >= 690;
 assert.equal(j(r).r2.ok, true);
});

test('TB7 H1 (R132-6): a correctly armed callback keeps its prompt clear across a queue gap; a late arm cannot spend the return-work budget', () => {
 const r = make();
 r.ops = [{t:101,op:'wheel'},{t:685,op:null}];
 r.timer = { inputDue: 670, armed: 520, entered: 685 };
 for (const f of r.frames) Object.assign(f, { op: f.t < 685 ? 'wheel' : null, lit: f.t >= 690 ? ['new'] : [], tools: f.t >= 690 ? .9 : 0 });
 r.cls = [{t:690,card:'new',on:true}];
 // R132-6: armed at the input, the 15 ms probe-to-callback gap is queue scheduling; the clear at entry is prompt
 // (callbackWork 0) and the total endDelay 165 ms is inside rest + probe lateness + work + 2.
 assert.equal(j(r).r2.ok, true);
 // a late arm is the product's own delay: the same entry now fails
 r.timer = { inputDue: 670, armed: 560, entered: 685 };
 assert.equal(j(r).r2.ok, false);
 // entry delay still cannot spend the return-work budget: work past RETURN_WORK_MS fails even armed right
 r.timer = { inputDue: 670, armed: 520, entered: 685 };
 r.ops = [{t:101,op:'wheel'},{t:702,op:null}];
 for (const f of r.frames) Object.assign(f, { op: f.t < 702 ? 'wheel' : null, lit: f.t >= 706 ? ['new'] : [], tools: f.t >= 706 ? .9 : 0 });
 r.cls = [{t:706,card:'new',on:true}];
 assert.equal(j(r).r2.ok, false);
});
test('TB7 H2: a task mutation between samples cannot claim the previous frame', () => {
 const r = make();
 r.cls = [{t:692,card:'new',on:true}];
 for (const f of r.frames) Object.assign(f, { lit: f.t >= 700 ? ['new'] : [], tools: f.t >= 680 ? .9 : 0 });
 assert.equal(j(r).r2.backFrames, 3);
 assert.equal(j(r).r2.ok, false);
});
test('TB7 H3: class-on before the same-task marker release fails even without a sampled early frame', () => {
 const r = make();
 r.ops[1].order = 3;
 r.cls = [{t:670,order:2,card:'new',on:true}];
 assert.equal(j(r).r2.ok, false);
 r.cls[0].order = 4;
 assert.equal(j(r).r2.ok, true);
});

test('a glow may start at zero opacity if it visibly returns before the outer cap', () => {
 const r = make();
 for (const f of r.frames) Object.assign(f, { proxyRequired: true, proxyArmed: f.t >= 690, proxyBack: f.t >= 700 });
 assert.equal(j(r).r2.backFrames, 2);
 assert.equal(j(r).r2.ok, true);
 for (const f of r.frames) f.proxyBack = f.t >= 930;
 assert.equal(j(r).r2.ok, false);
});

test('TB6 follow-up 5: a scroll can bridge the gap between two wheels', () => {
 const r = make();
 r.wheels = [100, 130, 160, 320, 420, 500];
 r.scrolls = [120, 220, 340, 440, 520];
 const v = j(r);
 assert.equal(v.r1.ok, true);
 assert.equal(v.r2.ok, true);
 assert.equal(v.burst.broke, false);
 r.scrolls = r.scrolls.filter(t => t !== 220);
 assert.equal(j(r).burst.broke, true);
});

test('V6 P5: only a witnessed early idle release qualifies, and it must retain the pause', () => {
 const r = {
  mode: 'move', focused: 'health', pre: { top: 0 }, wheels: [{t: 101, trusted: true}], moves: 0,
  scrolls: [{t: 103, top: 1, op: 'wheel'}],
  keys: [{t: 113, key: 'm', trusted: true, focused: 'health'}, {t: 139, key: 'Escape', trusted: true}],
  key: 'm', point: [50, 50],
  markers: [
   {t: 127, gesture: {kb: true, type: 'move'}, op: 'move', dragHeld: true, handoff: true, hovered: true},
   {t: 155, op: 'wheel', dragHeld: false, hovered: true}
  ],
  frames: [{t: 160, op: 'wheel', hovered: true}],
  ends: [{t: 253, live: true, gesture: false, op: null, point: [50, 50]}], after: {op: null, hovered: true}
 };
 assert.equal(judgeShortHandoff(r).ok, true);
 r.markers[0].handoff = false;
 assert.deepEqual([judgeShortHandoff(r).qualified, judgeShortHandoff(r).ok], [true, false]);
 r.markers[0].handoff = true;
 r.markers[1].op = null;
 assert.deepEqual([judgeShortHandoff(r).qualified, judgeShortHandoff(r).ok], [true, false]);
 r.markers[1].t = 260;
 assert.equal(judgeShortHandoff(r).qualified, false);
});

test('R117 T3: a visible proxy before a late marker clear is an early return', () => {
 const r = make();
 r.ops[1].t = 720;
 r.probe.fired = 720;
 r.cls = [{t:730,card:'new',on:true}];
 for (const f of r.frames) Object.assign(f, {op:f.t<720?'wheel':null,lit:f.t>=730?['new']:[],tools:f.t>=730?.9:0});
 r.frames.find(f => f.t === 700).proxyLit = true;
 assert.equal(j(r).r2.ok, false);
});

// PM7PERF-R5-UNQUALIFIED-RETURNS-COUNTED + R135-F2: TIB-FILMS' real R5 mount records (reviews/TIB-FILMS-REPORT.md,
// films under /mnt/Cursor/PuppetMaster-Evidence/tests/pm7-tib-20261121/films/): ALL 12 p6 mount attempts delivered
// with scrolls 0 and max wheel gaps 302.3-778.1 ms, so roomMountRace's burstState(holdInputs(...)) computes
// burstBroke true on every one (head retry 3: 156/203 wheels, 302.3 ms; base retry 3: 153/203, 472.1 ms). A broke
// burst keeps the R5-CASCADE SKIP, never could-not-judge; the fixtures derive burstBroke from the record's own
// timestamps as the check does, not a hardcoded false the code cannot produce. Could-not-judge needs an INTACT
// burst with failed input delivery (Chrome coalescing wheels below 80% on a busy host). A product fault on a
// qualified intact burst must FAIL the product row, never hide as could-not-judge.
const r5Record = (delivered, gapMs, idleReturnMs) => {
	const ts = []; let t = 1000;
	for (let i = 0; i < delivered; i++) { ts.push(t); t += i === 40 ? gapMs : 30; }
	const last = ts.at(-1);
	return {
		room: 'overview', liveRoom: 'overview', oldPaused: true, moves: 0, swaps: 2, targetHovered: true, pointerOnBoard: true, mountedTop: 0,
		wheels: ts.map((t) => ({ t, trusted: true })),
		ends: [{ t: ts[40] + idleReturnMs, live: true, room: 'overview' }, { t: last + 160, live: true, room: 'overview' }],
		last, during: Array.from({ length: 100 }, (_, i) => ({ t: 1000 + i * 60 }))
	};
};
const r5Args = (r) => ({ inputs: 203, activated: true, burstBroke: burstState(r.wheels).broke, during: r.during, destinationTop: 0 });
test('R5 films: the head retry 3 record (156/203 wheels, 302.3 ms gap) broke its burst and keeps the CASCADE skip', () => {
	const r = r5Record(156, 302.3, 169.9);
	assert.equal(burstState(r.wheels).broke, true, 'the archived record\'s own gaps break the burst');
	assert.equal(r5MountQualified(r, r5Args(r)), false);
	assert.equal(r5BurstGate({ qualified: false, burstBroke: burstState(r.wheels).broke }), 'skip');
});
test('R5 films: the base retry 3 record (153/203 wheels, 472.1 ms gap) broke its burst and keeps the CASCADE skip', () => {
	const r = r5Record(153, 472.1, 155.1);
	assert.equal(burstState(r.wheels).broke, true);
	assert.equal(r5MountQualified(r, r5Args(r)), false);
	assert.equal(r5BurstGate({ qualified: false, burstBroke: burstState(r.wheels).broke }), 'skip');
});
test('R5: an intact but coalesced delivery (150/203 wheels, 30 ms cadence) is could-not-judge', () => {
	const r = r5Record(150, 30, 0);
	r.ends = [{ t: r.last + 160, live: true, room: 'overview' }];
	assert.equal(burstState(r.wheels).broke, false);
	assert.equal(r5MountQualified(r, r5Args(r)), false);
	assert.equal(r5BurstGate({ qualified: false, burstBroke: burstState(r.wheels).broke }), 'could-not-judge');
});
test('R5: an intact 203-wheel burst keeps its qualification and judges', () => {
	const r = r5Record(203, 30, 0);
	r.ends = [{ t: r.last + 160, live: true, room: 'overview' }];
	assert.equal(r5MountQualified(r, r5Args(r)), true);
	assert.equal(r5BurstGate({ qualified: true, burstBroke: burstState(r.wheels).broke }), 'judge');
	assert.equal(r5MountProduct(r, { last: r.last, during: r.during }), true);
});
test('R5: a broke burst keeps the R5-CASCADE skip, not a second failing row', () => {
	assert.equal(r5BurstGate({ qualified: false, burstBroke: true }), 'skip');
});
// R135-F2 RED: on a quiet host an intact 203-wheel burst qualifies; a product fault must then FAIL, not read
// could-not-judge. The base mixed these assertions into r5MountQualified, so each of these records was rejected
// as unqualified input and suppressed behind the could-not-judge row. R136-N1: the mount-fault fixtures model
// the real page (62-boards-data.js: overview has no provider widget, accounts no skyline; samples push only
// while the live board IS the destination room and targetHovered matches a room-exclusive selector), so a
// failed or wrong mount leaves during [] and targetHovered false — qualification must still pass on the
// intact input, and the product row must FAIL.
test('R135-F2: a qualified burst whose old board never enters the wheel pause fails the product row', () => {
	const r = r5Record(203, 30, 0);
	r.ends = [{ t: r.last + 160, live: true, room: 'overview' }];
	r.oldPaused = false;
	assert.equal(r5MountQualified(r, r5Args(r)), true, 'input delivery is intact; the fault is the product\'s');
	assert.equal(r5BurstGate({ qualified: true, burstBroke: burstState(r.wheels).broke }), 'judge');
	assert.equal(r5MountProduct(r, { last: r.last, during: r.during }), false);
});
test('R135-F2: a qualified burst whose pause ends before the last wheel fails the product row', () => {
	const r = r5Record(203, 30, 0);
	r.ends = [{ t: r.last - 40, live: true, room: 'overview' }];
	assert.equal(r5MountQualified(r, r5Args(r)), true);
	assert.equal(r5MountProduct(r, { last: r.last, during: r.during }), false);
});
test('R135-F2/R136-N1: a qualified burst that never swaps the board fails the product row', () => {
	const r = r5Record(203, 30, 0);
	r.ends = [{ t: r.last + 160, live: true, room: 'overview' }];
	r.swaps = 0; r.liveRoom = 'accounts'; r.during = []; r.targetHovered = false;
	assert.equal(r5MountQualified(r, r5Args(r)), true, 'the input was delivered intact; the mount failure is the product\'s');
	assert.equal(r5BurstGate({ qualified: true, burstBroke: burstState(r.wheels).broke }), 'judge');
	assert.equal(r5MountProduct(r, { last: r.last, during: r.during }), false);
});
test('R135-F2/R136-N1: a qualified burst whose live board is another room fails the product row', () => {
	const r = r5Record(203, 30, 0);
	r.ends = [{ t: r.last + 160, live: true, room: 'overview' }];
	r.liveRoom = 'accounts'; r.during = []; r.targetHovered = false;
	assert.equal(r5MountQualified(r, r5Args(r)), true);
	assert.equal(r5MountProduct(r, { last: r.last, during: r.during }), false);
});
test('R136-N1: the pointer off the board before the burst is unqualified input, not a product fault', () => {
	const r = r5Record(203, 30, 0);
	r.ends = [{ t: r.last + 160, live: true, room: 'overview' }];
	r.pointerOnBoard = false;
	assert.equal(r5MountQualified(r, r5Args(r)), false);
	assert.equal(r5BurstGate({ qualified: false, burstBroke: burstState(r.wheels).broke }), 'could-not-judge');
});
test('R136-N1: a mounted room the pointer is not over fails the product row', () => {
	const r = r5Record(203, 30, 0);
	r.ends = [{ t: r.last + 160, live: true, room: 'overview' }];
	r.targetHovered = false;
	assert.equal(r5MountQualified(r, r5Args(r)), true);
	assert.equal(r5MountProduct(r, { last: r.last, during: r.during }), false);
});
test('R136-N1: a mounted room with too few burst samples fails the product row', () => {
	const r = r5Record(203, 30, 0);
	r.ends = [{ t: r.last + 160, live: true, room: 'overview' }];
	r.during = r.during.slice(0, 5);
	assert.equal(r5MountQualified(r, r5Args(r)), true);
	assert.equal(r5MountProduct(r, { last: r.last, during: r.during }), false);
});

test('R136-C2: a mounted room that keeps a nonzero scroll position fails the product row, not input qualification', () => {
	const r = r5Record(203, 30, 0);
	r.ends = [{ t: r.last + 160, live: true, room: 'overview' }];
	r.mountedTop = 120;
	assert.equal(r5MountQualified(r, r5Args(r)), true, 'the pre-burst calibration and delivered input are still qualified');
	assert.equal(r5MountProduct(r, { last: r.last, during: r.during }), false, 'the post-mount scroll reset is a product assertion');
});

// R132-FOLLOWUPS 6 (R132-REPORT.md): a 4 ms unrelated task between the probe callback and the product's correctly
// armed wheelEnd callback failed a prompt marker clear at :235. The gap between separate timer callbacks is queue
// scheduling when timer.armed shows the product requested its 150 ms timeout at the input.
test('R132-6: a 4 ms queue gap between the probe and a correctly armed product callback passes', () => {
	const r = make();
	r.ops = [{t:101,op:'wheel'},{t:676,op:null}];
	r.timer = { inputDue: 670, armed: 520, entered: 674 };
	for (const f of r.frames) Object.assign(f, { op: f.t < 676 ? 'wheel' : null });
	assert.equal(j(r).r2.entryGap, 4);
	assert.equal(j(r).r2.ok, true);
});
test('R132-6: a late arm with the same entry still fails', () => {
	const r = make();
	r.ops = [{t:101,op:'wheel'},{t:676,op:null}];
	r.timer = { inputDue: 670, armed: 560, entered: 674 };
	for (const f of r.frames) Object.assign(f, { op: f.t < 676 ? 'wheel' : null });
	assert.equal(j(r).r2.ok, false);
});
test('R132-6: a correctly armed callback whose return exceeds the total endDelay bound still fails', () => {
	const r = make();
	r.ops = [{t:101,op:'wheel'},{t:700,op:null}];
	r.timer = { inputDue: 670, armed: 520, entered: 698 };
	for (const f of r.frames) Object.assign(f, { op: f.t < 700 ? 'wheel' : null, lit: f.t >= 700 ? ['new'] : [], tools: f.t >= 700 ? .9 : 0 });
	r.cls = [{t:700,card:'new',on:true}];
	assert.equal(j(r).r2.ok, false);
});

// PM7PERF-V6-P5-IDLE-COVERAGE: on headless Alexis the native short-M/R witness defers the marker (+181-228 ms) and
// the idle release (+341-403 ms) past the original 150 ms wheel deadline (V-REPORT.md §19, triage T2.3). The input
// setup is intact; the host cannot qualify it. That must read as a named host limit, not a silent coverage gap or a
// setup failure.
test('V6 P5 coverage: a deferred native marker/release past the deadline is a named host limit', () => {
	const r = { mode: 'move', key: 'm', focused: 'health', pre: { top: 0 }, wheels: [{t: 100, trusted: true}], moves: 0,
		scrolls: [{t: 103, top: 40, op: 'wheel'}],
		keys: [{t: 120, key: 'm', trusted: true, focused: 'health'}, {t: 270, key: 'Escape', trusted: true}],
		point: [50, 50],
		markers: [{t: 300, gesture: {kb: true, type: 'move'}, op: 'move', dragHeld: true, handoff: true, hovered: true},
			{t: 480, op: 'wheel', dragHeld: false, hovered: true, gesture: null}],
		frames: [], ends: [{t: 500, live: true, gesture: false, op: null, point: [50, 50]}], after: {op: null, hovered: true} };
	const v = judgeShortHandoff(r);
	assert.equal(v.qualified, false);
	assert.equal(v.hostLimit, true, 'the intact input with a deferred release is the host limit, not a setup failure');
	assert.equal(v.markerAfterScrollMs, 197);
	assert.equal(v.releaseAfterScrollMs, 377);
	// a setup failure is not the host limit
	r.wheels[0].trusted = false;
	assert.equal(judgeShortHandoff(r).hostLimit, false);
});
