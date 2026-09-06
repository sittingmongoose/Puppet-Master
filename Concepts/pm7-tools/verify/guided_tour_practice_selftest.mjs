/* Pure concept fixture tests; no browser, native handler, or real planning proof. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const source=execFileSync('python3',[fileURLToPath(new URL('../guided_tour_practice_source.py',import.meta.url))],{encoding:'utf8'});
const create=new Function(`${source}; return createGuidedPlanningPractice;`)();
const model=create({goal:'Create a book-club website.'});
let passed=0;
function test(name,fn){fn();passed++;console.log(`PASS ${name}`);}
function step(state,action,value){const result=model.apply(state,action,value);assert.equal(result.ok,true,result.error);return result.state;}
function review(answer='organizers'){
  let f=model.create();f=step(f,'project');f=step(f,'goal',f.goal);f=step(f,'guided');f=step(f,'outcomes');f=step(f,'answer',answer);return step(f,'review');
}
test('Edit opens a choice without changing the answer or declaring completion',()=>{
  const before=review(),after=step(before,'edit');assert.equal(after.answer,'organizers');assert.equal(after.editing,true);assert.equal(after.edited,false);assert.equal(after.review_visible,true);assert.equal(after.consequence_revision,0);assert.equal(before.editing,false);
});
test('different answer changes only dependent practice state',()=>{
  const before=review(),editing=step(before,'edit'),after=step(editing,'answer','me');
  assert.equal(after.edited,true);assert.equal(after.editing,false);assert.equal(after.consequence_revision,1);assert.equal(after.review_visible,true);
  for(const key of ['goal','goal_submitted','outcomes_visible','project_selected','guided_selected'])assert.equal(after[key],before[key]);
  assert.equal(model.view(after).access_state,'not_needed');
});
test('same answer cannot satisfy an edit',()=>{
  const f=step(review(),'edit'),result=model.apply(f,'answer','organizers');assert.equal(result.ok,false);assert.equal(result.state,f);assert.equal(f.edited,false);
});
test('unsure stays unresolved in the question and review',()=>{
  const f=review('unsure'),view=model.view(f);assert.equal(view.access_state,'unresolved');assert.match(view.access,/needs a decision/);assert.match(view.unresolved,/needs a decision/);
});
test('all nine initial and changed-answer combinations are consistent',()=>{
  for(const before of model.choices)for(const after of model.choices){const f=step(review(before),'edit'),result=model.apply(f,'answer',after);assert.equal(result.ok,before!==after);assert.equal(result.state.edited,before!==after);assert.equal(result.state.work_started,false);}
});
test('Show Me chooses a genuinely different answer for every initial choice',()=>{
  for(const answer of model.choices){const f=step(review(answer),'edit'),choice=model.view(f).edit_choice;assert.notEqual(choice,answer);assert.equal(step(f,'answer',choice).edited,true);}
});
test('missing prerequisites and invalid choices fail without mutation',()=>{
  for(const [action,value] of [['goal','a'],['outcomes'],['answer','me'],['why'],['review'],['edit'],['unknown']]){const f=model.create(),r=model.apply(f,action,value);assert.equal(r.ok,false,action);assert.equal(r.state,f);}
  const f=review();assert.equal(model.apply(f,'answer','invalid').ok,false);assert.equal(model.apply(f,'goal',' ').ok,false);
});
test('each additional genuine edit advances the consequence revision once',()=>{
  let f=review('me');f=step(step(f,'edit'),'answer','organizers');f=step(step(f,'edit'),'answer','unsure');assert.equal(f.consequence_revision,2);assert.equal(model.view(f).access_state,'unresolved');
});
test('every local action remains non-executing and bounded',()=>{
  const f=review();for(const action of ['project','goal','guided','outcomes','answer','why','review','edit']){const r=model.apply(f,action,action==='answer'?'me':f.goal);assert.equal(r.work_started,false);assert.equal(r.production_receipt,false);assert.equal(r.concept_simulation_only,true);}
});
console.log(JSON.stringify({passed,scope:'pure guided-example reducer only'}));
