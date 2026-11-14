// PERF-R5: broad cursor carriers retain every arm main supports. Added wave-2 classes may stay.
import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
const path='Concepts/onboarding/opus-5.5/tools/active_descendant_rules.json';
const main=JSON.parse(execFileSync('git',['show','origin/main:'+path],{encoding:'utf8'}));
const actual=JSON.parse(readFileSync(new URL('./active_descendant_rules.json',import.meta.url),'utf8'));
const arms=r=>r.replacement.slice(r.replacement.lastIndexOf(':where(')+7,-1).split(',').map(s=>s.trim());
for(const id of [0,1,2,6])test('cursor rule '+id+' retains every main descendant arm',()=>{
 const before=main.rules.find(r=>r.rule===id),after=actual.rules.find(r=>r.rule===id);
 assert.equal(after.original,before.original);assert.equal(after.source,before.source);assert.equal(after.omit,before.omit);
 const entries=new Set(arms(after)),missing=arms(before).filter(s=>!entries.has(s));
 assert.deepEqual(missing,[],'main arms missing: '+missing.join(', '));
 assert.equal(after.replacement.slice(0,after.replacement.lastIndexOf(':where(')),before.replacement.slice(0,before.replacement.lastIndexOf(':where(')));
});
