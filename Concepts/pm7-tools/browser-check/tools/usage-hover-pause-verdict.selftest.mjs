// R100 T1/T2/T3: the measured states must decide the verdict, including an already-applied light and visible opacity.
import test from 'node:test';
import assert from 'node:assert/strict';
import { judge } from '../checks/usage-hover-pause.check.mjs';
const make = () => ({
 wheels:[100,200,300,400,500],scrolls:[120,220,320,420,520],ops:[{t:101,op:'wheel'},{t:670,op:null}],
 probe:{due:650,fired:670},
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
 assert.equal(v.r2.backFrames,0);
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
 assert.equal(v.r2.backFrames,3);
 assert.equal(v.r2.ok,false);
});
test('TB6 item 2: the 400 ms outer cap fails a page that returns very late even inside two long frames',()=>{
 const r=make();
 r.ops=[{t:101,op:'wheel'},{t:670,op:null}];
 r.cls=[{t:970,card:'new',on:true}];
 r.frames=Array.from({length:14},(_,i)=>({t:100+i*150,top:i,card:'new',lit:i>=6?['new']:[],near:[],tools:i>=6?.9:0,op:i<4?'wheel':null,highlights:0}));
 const v=j(r);
 assert.equal(v.r2.back,330);
 assert.equal(v.r2.backFrames,2);
 assert.equal(v.r2.ok,false);
});
// TB6 item 1: a 258 ms driver gap is reported as a broken burst; a 30 ms cadence is not.
test('TB6 item 1: a 258 ms driver gap is reported as a broken burst; a 30 ms cadence is not',()=>{
 const r=make();
 r.wheels=[100,130,160,418,448,478,508];
 assert.deepEqual(j(r).burst,{maxGap:258,rest:150,broke:true});
 assert.equal(j(make()).burst.broke,false);
});
