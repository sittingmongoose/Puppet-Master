#!/usr/bin/env python3
"""Ordinary UI: Deep Plan/Goal binding, reciprocal routes, Activity, optional Step Rail."""
import argparse,hashlib,json,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--outdir',type=Path,required=True);a=ap.parse_args();o=a.outdir.resolve();o.mkdir(parents=True,exist_ok=True);target=o/'RESULT.json'
 if target.exists():ap.error('Use fresh output directory')
 raw=(ROOT/'index.html').read_bytes();r={'status':'running','html_sha256':hashlib.sha256(raw).hexdigest(),'cases':[]}
 def save():target.write_text(json.dumps(r,indent=2)+'\n')
 with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  def run(name,fn):
   row={'name':name,'status':'running','checks':[],'errors':[]};r['cases'].append(row);save();cx=b.new_context(viewport={'width':1440,'height':1000});p=cx.new_page();p.set_default_timeout(7000);p.on('pageerror',lambda e:row['errors'].append(str(e)))
   def ck(n,v):row['checks'].append({'name':n,'pass':bool(v)});save();assert v,n
   def click(sel):p.locator(sel).filter(visible=True).first.click();p.wait_for_timeout(100)
   def shot(name):p.screenshot(path=str(o/(name+'.png')))
   try:
    p.set_content(raw.decode(),wait_until='domcontentloaded');p.wait_for_function('window.__PM56_BOOT_OK');fn(p,ck,click,shot,row);ck('No page errors',not row['errors']);ck('No undeclared action collisions',not p.evaluate('PM56_EXT.collisions'));row['status']='pass'
   except Exception:row['status']='fail';row['failure']=traceback.format_exc();print(row['failure'],flush=True);shot(name+'-failure')
   finally:cx.close();save()
  def deep(p,ck,click,shot,row):
   click('[data-action="open-demo"]');click('[data-action="b14-start"][data-flow="thorough"]');click('[data-action="send"]');click('[data-action="b14-hide-guide"]');click('[data-action="b14-open"]');click('[data-action="b14-research"][data-key="fields"]');p.wait_for_function('PM56_DEEP_PLAN.snapshot().questions.find(q=>q.key==="fields").state==="researched"');click('[data-action="b14-questions"]');qs=p.evaluate('PM56_DEEP_PLAN.snapshot().rounds.slice(-1)[0].questionIds.length')
   for i in range(qs):
    click('.decision-host .qs-reel [data-action="answer-choice"]')
    if i+1<qs:click('.decision-host [data-action="next-question"]')
   click('.decision-host [data-action="submit-questionnaire"]');click('[data-action="b14-preview"]');click('[data-action="b14-synthesize"]');p.evaluate('()=>{window.__plan=PM56_PLANS.get(PM56_DEEP_PLAN.snapshot().planId);window.__units=__plan.planunits;window.__doc=PM56_PLANS.markdown(__plan.plan_id);window.__ledger=__plan.ledger}');ck('Deep Plan created without a Goal or To-Dos',p.evaluate('!PM56_GOAL.get()&&!PM56_TODOS.get()?.length&&__plan.backend==="ledger_bound"&&__units.length===3'))
   click('.editor-body [data-action="pd-more-actions"]');click('[data-action="pd-build-goal"]');ck('Deep Plan atomically binds exactly one Goal and run',p.evaluate('!!PM56_GOAL.get()&&Object.keys(PM56_PLANS.runs()).length===1&&__plan.goalBinding.goal_id===PM56_GOAL.get().id'));ck('Bound bundle is the same actual scoped array',p.evaluate('PM56_PLANS.scopedBundle(__plan.goalBinding.planunit_bundle_ref)===__units&&__plan.planunits===__units'));ck('Ledger and approved document are unchanged',p.evaluate('__plan.ledger===__ledger&&PM56_PLANS.markdown(__plan.plan_id)===__doc'));ck('Binding addresses the existing thread To-Do list',p.evaluate('__plan.goalBinding.todo_list_ref==="todos:"+PM56_EXT.ctx().thread.id&&PM56_TODOS.get().length===3&&PM56_TODOS.get().every(t=>t.plan_id===__plan.plan_id)'))
   
   if p.locator('.editor-body [data-action="pd-more-actions"]').get_attribute('aria-expanded')!='true':click('.editor-body [data-action="pd-more-actions"]')
   click('[data-action="pd-inspect"]');click('[data-action="pd-open-goal"]');click('[data-action="goal-details"]');p.wait_for_function('PM56_GOAL.get()?.status==="blocked"');ck('Unimplemented Deep Plan execution blocks without completing work',p.evaluate('__plan.status==="building"&&PM56_TODOS.get().every(t=>t.status==="pending")&&PM56_GOAL.get().blockedReason.includes("adapter")'));ck('Blocked owner exposes a disabled Resume and exact reason',p.locator('[data-action="goal-resume"]').filter(visible=True).first.is_disabled());click('[data-action="goal-bound-open-plan"]');ck('Reciprocal navigation deduplicates exact Plan tab',p.evaluate('PM56_EXT.ctx().state.editorTabs.filter(x=>x==="plan:"+__plan.plan_id).length===1'));shot('deep-bound-paused');
   if p.locator('.editor-body [data-action="pd-more-actions"]').get_attribute('aria-expanded')!='true':click('.editor-body [data-action="pd-more-actions"]')
   click('[data-action="pd-inspect"]');click('[data-action="pd-open-goal"]');click('[data-action="goal-cancel"]');ck('Cancel removes Goal projection and fences Plan',p.evaluate('PM56_GOAL.get()===null&&__plan.status==="canceled"'));row['scope']='Real B14 discovery and B15 goal-driven admission; no deep-plan provider execution/completion claim.'
  run('deep_identity_and_routes',deep)
  def activity(p,ck,click,shot,row):
   click('[data-action="open-demo"]');p.locator('[data-input="variant"][data-family="2"]').first.select_option('8');click('[data-action="b15-start"][data-flow="simple"]');click('[data-action="send"]');click('[data-action="b15-hide-guide"]');ck('Actual workflow uses existing Step Rail Simple',p.locator('.orders15-entry [data-working-variant="8"]').count()==1);p.locator('[data-hover-domain="goal"]').hover();p.wait_for_timeout(750);ck('Goal hover exposes ordinary Pause',p.locator('#activity-domain-preview [data-action="goal-pause"],.ab-card [data-action="goal-pause"]').filter(visible=True).count()>0);shot('step-rail-goal-hover');click('#activity-domain-preview [data-action="goal-pause"],.ab-card [data-action="goal-pause"]');ck('Hover Pause controls the actual Goal',p.evaluate('PM56_GOAL.get().status')=='paused');click('[data-action="b15-goal"]');ck('Default Activity is pinned',p.locator('.activity-panel[data-pinned="true"]').count()==1);click('[data-action="unpin-activity"]');ck('Explicit unpin uses shared transient Activity',p.locator('.activity-panel.transient').count()==1);shot('transient-goal');click('[data-action="pin-activity"]');ck('Pin returns to shared in-layout Activity',p.locator('.activity-panel[data-pinned="true"]').count()==1);ck('Owned work label is truthful while paused','Paused' in p.locator('.orders15-entry .working-head').inner_text());click('[data-action="goal-resume"]');p.wait_for_function('PM56_GOAL.get()?.status==="completed"',timeout=22000);ck('Step Rail retains real accepted completion',p.evaluate('PM56_TODOS.get().every(t=>t.status==="completed")'));shot('step-rail-completed')
  run('activity_and_step_rail',activity);b.close()
 r['frozen_html_unchanged']=(ROOT/'index.html').read_bytes()==raw;r['assertions']=sum(len(c['checks']) for c in r['cases']);r['status']='pass' if all(c['status']=='pass' for c in r['cases']) and r['frozen_html_unchanged'] else 'fail';save();print(json.dumps({'status':r['status'],'assertions':r['assertions']}));return 0 if r['status']=='pass' else 1
if __name__=='__main__':raise SystemExit(main())
