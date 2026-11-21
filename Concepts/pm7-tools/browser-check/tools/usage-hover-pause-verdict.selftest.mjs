// R100 T1/T2/T3: the measured states must decide the verdict, including an already-applied light and visible opacity.
import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
// node tools/usage-hover-pause-verdict.selftest.mjs [check file]: the argument runs the same assertions against another
// revision of the check, which is how each item's RED run shows the old verdict misjudging a constructed record.
const { judge, outerCap, uninterruptedIntent } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../checks/usage-hover-pause.check.mjs');
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
const j = (r) => judge(r,{rest:'old',back:400});
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
 r.probe={due:650,fired:690};
 r.cls=[{t:710,card:'new',on:true}];
 for(const f of r.frames)Object.assign(f,{op:f.t<700?'wheel':null,lit:f.t>=710?['new']:[],tools:f.t>=710?.9:0});
 const v=j(r);
 assert.equal(v.r2.end,180);
 assert.equal(v.r2.late,40);
 assert.equal(v.r2.back,10);
 assert.equal(v.r2.backFrames,1);
 assert.equal(v.r2.ok,true);
});
test('TB6 item 2 RED: the same 180 ms end is could-not-judge when the probe shows no timer lateness',()=>{
 const r=make();
 r.ops=[{t:101,op:'wheel'},{t:700,op:null}];
 r.probe={due:650,fired:650};
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
 assert.equal(judge(r,{rest:'old',back:500}).r2.ok,true,'480 ms after the last input inside an unbounded cap');
 assert.equal(judge(r,{rest:'old',back:outerCap(500)}).r2.ok,false,'the same record at the clamped ceiling');
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
