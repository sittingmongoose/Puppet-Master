#!/usr/bin/env python3
"""Batch 14 cross-owner browser boundaries. Controlled failure inputs are named.
The real action dispatcher and real product owners are exercised; input injection
is never labelled user interaction or native runtime proof.
"""
import argparse,hashlib,http.server,json,threading,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--outdir',type=Path,required=True);ap.add_argument('--case',default='all');a=ap.parse_args();o=a.outdir.resolve();o.mkdir(parents=True,exist_ok=True);target=o/'RESULT.json'
 if target.exists():ap.error('Use fresh evidence directory')
 raw=(ROOT/'index.html').read_bytes();r={'status':'running','html_sha256':hashlib.sha256(raw).hexdigest(),'cases':[],'loading':'set_content; navigation paths tested separately'}
 def save():target.write_text(json.dumps(r,indent=2)+'\n')
 with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  def run(name,fn):
   if a.case not in ['all',name]:return
   row={'name':name,'checks':[],'status':'running','errors':[]};r['cases'].append(row);save();cx=b.new_context(viewport={'width':1440,'height':1000},accept_downloads=True);p=cx.new_page();p.set_default_timeout(7000);p.on('pageerror',lambda e:row['errors'].append(str(e)))
   def ck(n,v):row['checks'].append({'name':n,'pass':bool(v)});save();assert v,n
   def click(s):p.locator(s).filter(visible=True).first.click();p.wait_for_timeout(110)
   def snap():return p.evaluate('PM56_DEEP_PLAN.snapshot()')
   def act(action,**data):return p.evaluate('(d)=>PM56_EXT.run(d.action,{dataset:d.data},new Event("click"))',{'action':action,'data':data})
   def seed(flow='thorough'):click('[data-action="open-demo"]');click('[data-action="b14-start"][data-flow="'+flow+'"]');click('[data-action="send"]');click('[data-action="b14-hide-guide"]');click('[data-action="b14-open"]')
   def answer():
    qs=snap()['rounds'][-1]['questionIds']
    for i in range(len(qs)):
     click('.decision-host .qs-reel [data-action="answer-choice"]')
     if i+1<len(qs):click('.decision-host [data-action="next-question"]')
    click('.decision-host [data-action="submit-questionnaire"]')
   def ready():
    seed();click('[data-action="b14-research"][data-key="fields"]');p.wait_for_function('PM56_DEEP_PLAN.snapshot().questions.find(q=>q.key==="fields").state==="researched"');click('[data-action="b14-questions"]');answer();click('[data-action="b14-preview"]');click('[data-action="b14-synthesize"]');return snap()['planId']
   def plan():return p.evaluate('PM56_PLANS.get(PM56_DEEP_PLAN.snapshot().planId)')
   def td():return p.evaluate('PM56_TODOS.get(PM56_EXT.ctx().thread.id)')
   try:
    p.set_content(raw.decode(),wait_until='domcontentloaded');p.wait_for_function('window.__PM56_BOOT_OK');fn(p,ck,click,snap,act,seed,answer,ready,plan,td,row)
    ck('No browser errors',not row['errors']);row['status']='pass'
   except Exception:row['status']='fail';row['failure']=traceback.format_exc();print(row['failure'],flush=True)
   finally:
    try:p.screenshot(path=str(o/(name+'.png')))
    except Exception:pass
    cx.close();save()
  def build(p,ck,click,snap,act,seed,answer,ready,plan,td,row):
   id=ready();ck('Correct Plan editor is active',p.evaluate('PM56_EXT.ctx().state.activeEditor')=='plan:'+id);ck('Auto reuse precedes presentation',snap()['budget']['reused_answer_count']==1 and snap()['budget']['questions_asked']==2);ck('No To-Dos before explicit Build',not td());click('.editor-body [data-action="pd-build"]');q=plan();items=td();ck('Build creates three actual To-Dos',q['status']=='building' and len(items)==3 and all(t['status']=='pending' for t in items));ck('Bound unit validation occurs at Build',q['unitsMaterialized']['validated'] and q['unitsMaterialized']['validation_kind']=='local_scoped_template_validation' and q['unitsMaterialized']['count']==3);ck('Exact version and source worktree frozen',q['approved']['version']==1 and q['approved']['worktree']==snap()['worktreeId'] and q['approved']['project_id']==snap()['projectId']);ck('Every To-Do maps to the same approved Plan',all(t['plan_id']==id and t['plan_version']==1 and t['plan_step_ids'] for t in items));ck('No global index or WorkNodes',not q['unitsMaterialized']['globalIndex'] and q['unitsMaterialized']['worknodes']==0 and q['unitsMaterialized']['nodeSeeds']==0 and not q['approved']['orchestrator']);act('pd-build',id=id);ck('Repeated handler cannot duplicate work',len(td())==3);act('pd-cancel',id=id)
  run('explicit_build',build)
  def reject(p,ck,click,snap,act,seed,answer,ready,plan,td,row):
   id=ready();row['controlled_input']='Inject invalid scoped templates and explicit blockers, then call the real pd-build handler; no substitute admission algorithm.'
   baseline=p.evaluate('JSON.stringify(PM56_PLANS.get(PM56_DEEP_PLAN.snapshot().planId))');p.evaluate('()=>{const q=PM56_PLANS.get(PM56_DEEP_PLAN.snapshot().planId);window.__oldUnits=structuredClone(q.planunits);q.planunits[0].acceptance=[]}');act('pd-build',id=id);ck('Invalid bundle refuses actual handler',plan()['status']=='ready' and not plan().get('approved') and not td() and not plan().get('unitsMaterialized'))
   p.evaluate('()=>{const q=PM56_PLANS.get(PM56_DEEP_PLAN.snapshot().planId);q.planunits=structuredClone(__oldUnits);q.planunits[0].deps=[q.planunits[2].id]}');act('pd-build',id=id);ck('Cyclic unit bundle refuses without work',plan()['status']=='ready' and not td())
   p.evaluate('()=>{const q=PM56_PLANS.get(PM56_DEEP_PLAN.snapshot().planId);q.planunits=structuredClone(__oldUnits);q.blockers=[{id:"permission",build_blocking:true,resolved:false,why:"Permission decision required"}]}');act('pd-build',id=id);ck('Explicit blocker enforced below disabled button',plan()['status']=='ready' and not plan().get('approved') and not td());p.evaluate('PM56_PLANS.get(PM56_DEEP_PLAN.snapshot().planId).blockers=[]')
   p.evaluate('()=>{window.__materialize=PM56_TODOS.materializeForPlan;PM56_TODOS.materializeForPlan=()=>({ok:false,error:"controlled_owner_refusal"})}');act('pd-build',id=id);ck('Typed To-Do-owner failure rolls back admission',plan()['status']=='ready' and not plan().get('approved') and not td() and not plan().get('scheduleInvalidation'));p.evaluate('()=>{PM56_TODOS.materializeForPlan=__materialize;}');ck('No rejected path changed Plan after inputs restored',p.evaluate('JSON.stringify(PM56_PLANS.get(PM56_DEEP_PLAN.snapshot().planId))')==baseline)
  run('build_rejections',reject)
  def scope_build(p,ck,click,snap,act,seed,answer,ready,plan,td,row):
   id=ready();before=plan();p.evaluate('PM56_EXT.ctx().thread.worktreeId="controlled-replacement"');act('pd-build',id=id);ck('Worktree drift rejects actual Build',plan()==before and not td());ck('Disabled reason identifies bound scope',not p.evaluate('PM56_PLANS.eligible(PM56_DEEP_PLAN.snapshot().planId).build'))
  run('build_scope',scope_build)
  def revision(p,ck,click,snap,act,seed,answer,ready,plan,td,row):
   id=ready();old=plan();n=snap()['budget']['questions_asked'];click('.editor-body [data-action="pd-revise"]');p.locator('[data-input="composer"]').fill('Keep the rollout opt-in and make the rollback instructions explicit.');click('[data-action="send"]');p.wait_for_function('PM56_PLANS.get(PM56_DEEP_PLAN.snapshot().planId).version===2');now=plan();ck('Composer revision keeps Plan and question counter',now['plan_id']==id and snap()['budget']['questions_asked']==n);ck('V1 remains exact and ledger follows V2',now['revisions']['1']==old['revisions']['1'] and now['ledger']['plan_version']==2 and now['ledger']['entries'][-1]['k']=='correction');ck('Revision does not Build or duplicate To-Dos',not td() and not now.get('approved'));click('[data-action="pd-info"][data-id="'+id+'"]');ck('Existing Plan tab reused',p.evaluate('(id)=>PM56_EXT.ctx().state.editorTabs.filter(x=>x==="plan:"+id).length',id)==1)
  run('revision_counter',revision)
  def held(p,ck,click,snap,act,seed,answer,ready,plan,td,row):
   ready();before=snap();count=p.evaluate('PM56_EXT.ctx().thread.messages.length');p.locator('[data-input="composer"]').fill('Create another Deep Plan without resolving this one.');click('[data-action="send"]');ck('Held submission preserves text',p.evaluate('PM56_EXT.ctx().state.composer')=='Create another Deep Plan without resolving this one.');ck('Held send appends no message or second discovery',p.evaluate('PM56_EXT.ctx().thread.messages.length')==count and snap()==before)
  run('held_composer',held)
  def foreign(p,ck,click,snap,act,seed,answer,ready,plan,td,row):
   seed();rid=snap()['id'];p.evaluate('()=>{let c=PM56_EXT.ctx();c.state.questions=[{id:"foreign-question",prompt:"Unrelated question",type:"choice",options:["Keep"],answer:"",required:true}];c.state.decision={type:"question"};c.renderApp();c.renderOverlays()}');act('b14-questions',run=rid);ck('Another questionnaire cannot be displaced',p.evaluate('PM56_EXT.ctx().state.questions[0].id')=='foreign-question' and snap()['budget']['questions_asked']==0);ck('No B14 round created',len(snap()['rounds'])==0)
  run('foreign_questionnaire',foreign)
  def drafts(p,ck,click,snap,act,seed,answer,ready,plan,td,row):
   seed('budget');click('[data-action="b14-questions"]');click('.decision-host .qs-reel [data-action="answer-choice"]');chosen=p.evaluate('PM56_EXT.ctx().state.questions[0].answer');click('.decision-host [data-action="close-decision"]');click('[data-action="b14-open"]');click('[data-action="b14-questions"]');ck('Partial answer survives closing host',p.evaluate('PM56_EXT.ctx().state.questions[0].answer')==chosen and snap()['budget']['questions_asked']==3);round=snap()['activeRound'];thread=snap()['threadId'];p.evaluate('PM56_EXT.ctx().switchThread("query")');p.evaluate('(id)=>PM56_EXT.ctx().switchThread(id)',thread);click('[data-action="b14-open"]');click('[data-action="b14-questions"]');ck('Thread return preserves draft, round and count',snap()['activeRound']==round and snap()['budget']['questions_asked']==3 and p.evaluate('PM56_EXT.ctx().state.questions[0].answer')==chosen);answer()
  run('question_drafts',drafts)
  def cancelled(p,ck,click,snap,act,seed,answer,ready,plan,td,row):
   seed();rid=snap()['id'];click('[data-action="b14-research"][data-key="fields"]');act('b14-cancel',run=rid);p.wait_for_timeout(1000);ck('Cancelled late result creates no fact or Plan',snap()['status']=='cancelled' and snap()['budget']['research_resolved_count']==0 and p.evaluate('PM56_PLANS.current(PM56_EXT.ctx().thread.id)') is None);p.locator('[data-input="composer"]').fill('Try a new bounded discovery.');click('[data-action="send"]');ck('New run gets a fresh Plan and counter',snap()['id']!=rid and snap()['budget']['questions_asked']==0 and snap()['budget']['research_resolved_count']==0)
  run('cancel_and_restart',cancelled)
  def doc(p,ck,click,snap,act,seed,answer,ready,plan,td,row):
   seed('budget');alpha=snap();rid=alpha['id'];p.locator('[data-input="composer"]').fill('Alpha draft');p.evaluate('PM56_EXT.ctx().switchThread("query")');p.locator('[data-input="composer"]').fill('Beta draft must survive');p.evaluate('(id)=>PM56_EXT.ctx().openEditor("deep-discovery:"+id)',rid);click('[data-deep-disclosure] > summary');
   with p.expect_download() as d:click('[data-action="b14-export"]')
   path=o/'cross-thread-export.json';d.value.save_as(str(path));x=json.loads(path.read_text());ck('Open Alpha document exports Alpha while Beta active',x['threadId']==alpha['threadId'] and x['projectId']==alpha['projectId']);ck('Export preserves Beta draft and active thread',p.evaluate('PM56_EXT.ctx().state.composer')=='Beta draft must survive' and p.evaluate('PM56_EXT.ctx().thread.id')=='query');click('[data-action="b14-questions"]');ck('Answering Alpha deliberately switches to Alpha',p.evaluate('PM56_EXT.ctx().thread.id')==alpha['threadId']);p.evaluate('PM56_EXT.ctx().switchThread("query")');ck('Targeted questionnaire preserves Beta composer',p.evaluate('PM56_EXT.ctx().state.composer')=='Beta draft must survive')
  run('document_identity',doc)
  def generic(p,ck,click,snap,act,seed,answer,ready,plan,td,row):
   # Use ordinary new-thread and mode controls, not an exercise identity.
   click('[data-action="new-thread"]');click('[data-action="open-menu"][data-menu="mode"]');p.locator('[data-action="set-mode"][data-value="Deep Plan"]').hover();p.wait_for_selector('[data-action="set-plan-strategy"][data-value="Exhaustive"]');ck('Three exact Deep Plan choices',p.locator('[data-action="set-plan-strategy"]').evaluate_all('(es)=>es.map(e=>e.dataset.value)')==['Thorough','Exhaustive','BrainStorm']);click('[data-action="set-plan-strategy"][data-value="Exhaustive"]')
   p.locator('[data-input="composer"]').fill('Investigate a keyboard shortcut conflict in my editor.');click('[data-action="send"]');click('[data-action="b14-open"]');click('[data-action="b14-questions"]');answer();click('[data-action="b14-preview"]');click('[data-action="b14-synthesize"]');text=p.evaluate('PM56_PLANS.markdown(PM56_DEEP_PLAN.snapshot().planId)');ck('Non-fixture request yields its own scoped Plan','keyboard shortcut conflict' in text);ck('No fabricated export facts or prior answer',snap()['budget']['research_resolved_count']==0 and snap()['budget']['reused_answer_count']==0 and 'export contract' not in text and 'source data' not in text);ck('Requested Exhaustive stays frozen',snap()['strategy']=='deep_exhaustive')
  run('generic_request',generic)
  def settings(p,ck,click,snap,act,seed,answer,ready,plan,td,row):
   seed();before=snap();p.evaluate('()=>{let c=PM56_EXT.ctx();c.state.deepPlanStrategy="Exhaustive";c.state.grillMe=true;c.renderApp()}');ck('Future preferences cannot rewrite active strategy or allowance',snap()['strategy']==before['strategy'] and snap()['budget']==before['budget']);click('[data-action="b14-grill"]');ck('Explicit run reconfiguration changes only Grill allowance',snap()['budget']['effective_limit']==35 and snap()['strategy']=='deep_thorough')
  run('frozen_strategy',settings)
  def navigation(p,ck,click,snap,act,seed,answer,ready,plan,td,row):
   server=http.server.ThreadingHTTPServer(('127.0.0.1',0),lambda *args,**kwargs:http.server.SimpleHTTPRequestHandler(*args,directory=str(ROOT),**kwargs));th=threading.Thread(target=server.serve_forever,daemon=True);th.start();row['paths']=[]
   try:
    for url in [(ROOT/'index.html').as_uri(),'http://127.0.0.1:'+str(server.server_port)+'/index.html']:
     pp=p.context.new_page();entry={'url':url,'booted':False}
     try:pp.goto(url,wait_until='domcontentloaded',timeout=12000);pp.wait_for_function('window.__PM56_BOOT_OK',timeout=5000);entry['booted']=True
     except Exception as e:entry['error']=str(e)
     row['paths'].append(entry);pp.close()
    ck('Both ordinary navigation paths actually attempted',len(row['paths'])==2);ck('Complete set_content fallback boots',p.evaluate('!!window.__PM56_BOOT_OK'))
   finally:server.shutdown();server.server_close()
  run('ordinary_loading',navigation)
  def layouts(p,ck,click,snap,act,seed,answer,ready,plan,td,row):
   seed('budget');themes=p.evaluate('PM56_DATA.themes.map(x=>x.id)');row['layouts']=[]
   for width in [700,900,1440]:
    p.set_viewport_size({'width':width,'height':1000})
    for theme in themes:
     click('[data-action="open-demo"]');p.locator('[data-input="theme"]').select_option(theme);click('[data-action="close-dialog"]');p.wait_for_timeout(140)
     for surface in ['discovery','questionnaire']:
      if surface=='questionnaire':act('b14-questions',run=snap()['id']);p.wait_for_timeout(100)
      gs=p.evaluate('''()=>[...document.querySelectorAll('.transcript,.editor-body,.deep14-workspace,.decision-host')].filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height).map(e=>({class:e.className,client:e.clientWidth,scroll:e.scrollWidth}))''');row['layouts'].append({'width':width,'theme':theme,'surface':surface,'geometry':gs});ck(f'{width} {theme} {surface} no horizontal overflow',all(g['scroll']<=g['client']+1 for g in gs))
      if surface=='questionnaire':act('close-decision');act('b14-open',run=snap()['id'])
     if theme in ['basic-dark','friendly-light','glass-dark']:p.screenshot(path=str(o/f'layout-{width}-{theme}.png'))
   ck('Layout rendering never recharges a round',snap()['budget']['questions_asked']==3);ck('Eight themes exercised',len(themes)==8)
  run('responsive_layouts',layouts)
  b.close()
 r['status']='pass' if r['cases'] and all(x['status']=='pass' for x in r['cases']) else 'fail';r['assertions']=sum(len(c['checks']) for c in r['cases']);save();print(json.dumps({'status':r['status'],'cases':len(r['cases']),'assertions':r['assertions'],'report':str(target)}));return 0 if r['status']=='pass' else 1
if __name__=='__main__':raise SystemExit(main())
