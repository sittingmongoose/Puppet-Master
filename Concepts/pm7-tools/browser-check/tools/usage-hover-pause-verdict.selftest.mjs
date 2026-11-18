// R100 T1/T2/T3: the measured states must decide the verdict, including an already-applied light and visible opacity.
import test from 'node:test';
import assert from 'node:assert/strict';
import { judge } from '../checks/usage-hover-pause.check.mjs';
const make = () => ({
 wheels:[100,200,300,400,500],scrolls:[120,220,320,420,520],ops:[{t:101,op:'wheel'},{t:670,op:null}],
 trans:[],cls:[{t:680,card:'new',on:true}],loaf:[],
 frames:Array.from({length:112},(_,i)=>{const t=100+i*10;return {t,top:i,card:'new',lit:t>=680?['new']:[],near:[],tools:t>=680?.9:0,op:t<670?'wheel':null,highlights:0};})
});
const j = (r) => judge(r,{rest:'old',back:200});
test('a sampled quiet pause and visibly restored target pass',()=>{const r=j(make());assert.equal(r.r1.ok,true);assert.equal(r.r2.ok,true);});
test('an engine light persisting on the starting card fails R1',()=>{const r=make();Object.assign(r.frames.find(f=>f.t===300),{card:'old',lit:['old']});assert.equal(j(r).r1.ok,false);});
test('an already-applied provider or donut highlight fails R1 without any new transition',()=>{const r=make();r.frames.find(f=>f.t===300).highlights=1;assert.equal(j(r).r1.ok,false);});
test('the marked tail after the last scroll is part of R1',()=>{const r=make();r.frames.find(f=>f.t===600).highlights=1;assert.equal(j(r).r1.ok,false);});
test('fewer than five sampled active frames cannot pass R1',()=>{const r=make();r.frames=r.frames.filter(f=>f.t>=680);assert.equal(j(r).r1.ok,false);});
test('a starting card with tools still revealed after their fade cannot pass R1',()=>{const r=make();Object.assign(r.frames.find(f=>f.t===400),{card:'old',tools:1});assert.equal(j(r).r1.ok,false);});
test('an approved segmented-control color transition is not a forbidden card reveal',()=>{const r=make();r.trans.push({t:300,card:'new',under:true,prop:'color',cls:'pmu-seg-button',approved:true});assert.equal(j(r).r1.ok,true);});
test('a transitionrun or ten-percent opacity cannot stand in for visibly returned tools',()=>{const r=make();r.trans.push({t:680,card:'new',under:true,prop:'opacity',cls:'pmu-cardtools'});for(const f of r.frames)if(f.t>=680&&f.t<860)f.tools=.1;assert.equal(j(r).r2.ok,false);});
test('a lit card whose tools never visibly return cannot pass R2',()=>{const r=make();r.trans.push({t:680,card:'new',under:true,prop:'opacity',cls:'pmu-cardtools'});for(const f of r.frames)f.tools=0;assert.equal(j(r).r2.ok,false);});
