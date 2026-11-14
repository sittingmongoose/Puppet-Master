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
