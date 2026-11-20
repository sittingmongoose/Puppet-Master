// Native hover style can resolve inside the input's RunTask before its first JavaScript event listener.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(process.argv[2] || new URL('../checks/perf-hover-restyle.check.mjs', import.meta.url), 'utf8');
const a = source.indexOf('function restyled('), b = source.indexOf('// in the page: mark', a);
const { restyled } = new Function(source.slice(a,b) + '\nreturn {restyled};')();
const events = Array.from({ length: 4 }, (_, i) => {
 const start = i * 100000 + 10000;
 return [
  { name:'UpdateLayoutTree',ph:'X',ts:start-1000,dur:100,pid:1,tid:1,args:{elementCount:900} },
  { name:'RunTask',ph:'X',ts:start,dur:10000,pid:1,tid:1 },
  { name:'UpdateLayoutTree',ph:'X',ts:start+1000,dur:1700,pid:1,tid:1,args:{elementCount:38} },
  { name:'jr:test:'+i,cat:'blink.user_timing',ts:start+4000,pid:1,tid:1 },
  { name:'UpdateLayoutTree',ph:'X',ts:start+5000,dur:100,pid:1,tid:1,args:{elementCount:3} }
 ];
}).flat();
assert.deepEqual(restyled(events,'jr:test:'),[38,38,38,38], 'include native pre-listener work in this input task; exclude earlier unrelated tasks');
assert.deepEqual(restyled(events.filter((e)=>e.name!=='RunTask'),'jr:test:'),[null,null,null,null], 'missing task coverage is unjudgeable');
const paired=events.flatMap((e)=>e.name==='RunTask'?[{...e,ph:'B',dur:undefined},{...e,ph:'E',ts:e.ts+e.dur,dur:undefined}]:[e]);
assert.deepEqual(restyled(paired,'jr:test:'),[38,38,38,38]);
console.log('PASS native input RunTask includes its pre-listener recalc, excludes prior work, and requires complete task coverage');
// PM7PERF-HOVER-FIRST-COUNT-NULL (lane M, m6, Alexis): the first input's own task ran 92.2 ms and its recalc sat in it
// 83.8 ms after the mark. The window ends 60 ms after the input's task, so that input is measured, not null; it never
// reaches the next input's mark, so a big restyle of the next input is not counted for this one.
const slow = Array.from({ length: 4 }, (_, i) => {
 const start = i * 450000 + 10000, len = i === 0 ? 92200 : 6000, at = i === 0 ? 83800 : 2000;
 return [
  { name:'RunTask',ph:'X',ts:start,dur:len,pid:1,tid:1 },
  { name:'jr:slow:'+i,cat:'blink.user_timing',ts:start,pid:1,tid:1 },
  { name:'UpdateLayoutTree',ph:'X',ts:start+at,dur:500,pid:1,tid:1,args:{elementCount:i === 0 ? 56 : 50} }
 ];
}).flat();
const old = [], where = [];
assert.deepEqual(restyled(slow,'jr:slow:',{ old, where }),[56,50,50,50], 'a recalc inside a long input task is measured');
assert.deepEqual(old,[null,50,50,50], 'the old mark+60 ms window read the first input as null (the false "could not judge")');
assert.deepEqual(where[0],[83.8,92.2], 'where the first recalc fell and where the task ended, in ms after the mark');
// still bites: a whole-document restyle in that long task is counted, not lost
const big = slow.map((e) => e.name === 'UpdateLayoutTree' && e.ts === 10000 + 83800 ? { ...e, args: { elementCount: 2400 } } : e);
assert.deepEqual(restyled(big,'jr:slow:'),[2400,50,50,50], 'a whole-document restyle in a long first input is counted');
// the next input's restyle never counts for this one: marks 30 ms apart, the second input's big recalc at +35 ms
const close = [
 { name:'RunTask',ph:'X',ts:0,dur:5000,pid:1,tid:1 }, { name:'jr:near:0',cat:'blink.user_timing',ts:1000,pid:1,tid:1 },
 { name:'UpdateLayoutTree',ph:'X',ts:3000,dur:100,pid:1,tid:1,args:{elementCount:40} },
 { name:'RunTask',ph:'X',ts:31000,dur:5000,pid:1,tid:1 }, { name:'jr:near:1',cat:'blink.user_timing',ts:31000,pid:1,tid:1 },
 { name:'UpdateLayoutTree',ph:'X',ts:35000,dur:100,pid:1,tid:1,args:{elementCount:900} }
];
assert.deepEqual(restyled(close,'jr:near:'),[40,900], 'the window stops at the next input mark');
console.log('PASS a long first input task (92 ms, recalc at 84 ms) is measured where the old window read null; the window stops at the next mark');
