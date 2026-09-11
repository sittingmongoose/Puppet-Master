#!/usr/bin/env python3
"""Real-control Batch 14 journeys; recordings preserve acquisition timestamps.
No model calls, origin durability, native handlers or full-runtime certification.
"""
from __future__ import annotations
import argparse,hashlib,json,os,statistics,subprocess,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--outdir',type=Path,required=True);ap.add_argument('--scenario',choices=['thorough','exhaustive','budget','blocker'],required=True);ap.add_argument('--width',type=int,default=1440);ap.add_argument('--height',type=int,default=1000);ap.add_argument('--record',action='store_true');ap.add_argument('--dwell',type=int,default=120);a=ap.parse_args()
 o=a.outdir.resolve();o.mkdir(parents=True,exist_ok=True);report=o/'RESULT.json'
 if report.exists():ap.error('Use a fresh evidence directory.')
 raw=(ROOT/'index.html').read_bytes();r={'scenario':a.scenario,'viewport':{'width':a.width,'height':a.height},'html_sha256':hashlib.sha256(raw).hexdigest(),'loading':'set_content, complete standalone bytes','status':'running','checks':[],'actions':[],'errors':[],'recorded':a.record};xv=rec=browser=None;logs=[];p=None
 def save():report.write_text(json.dumps(r,indent=2)+'\n')
 def ck(name,v):r['checks'].append({'name':name,'pass':bool(v)});save();assert v,name
 try:
  env=dict(os.environ)
  if a.record:
   log=open(o/'xvfb.log','w');logs.append(log);xv=subprocess.Popen(['Xvfb','-displayfd','1','-screen','0',f'{a.width}x{a.height}x24','-nolisten','tcp'],stdout=subprocess.PIPE,stderr=log,text=True);env['DISPLAY']=':'+xv.stdout.readline().strip()
  with sync_playwright() as pw:
   browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=not a.record,env=env,args=['--no-sandbox','--disable-dev-shm-usage','--start-fullscreen',f'--window-size={a.width},{a.height}','--window-position=0,0']);ctx=browser.new_context(viewport=r['viewport'],accept_downloads=True);p=ctx.new_page();p.set_default_timeout(9000);p.on('pageerror',lambda e:r['errors'].append(str(e)));p.set_content(raw.decode(),wait_until='domcontentloaded');p.wait_for_function('window.__PM56_BOOT_OK');r['browser']=browser.version
   if a.record:
    cd=ctx.new_cdp_session(p);win=cd.send('Browser.getWindowForTarget')['windowId'];cd.send('Browser.setWindowBounds',{'windowId':win,'bounds':{'windowState':'fullscreen'}})
   def click(sel,label=None,dwell=None):
    loc=p.locator(sel).filter(visible=True).first;loc.scroll_into_view_if_needed();r['actions'].append({'label':label or sel,'browser_ms':p.evaluate('performance.now()')});loc.click();p.wait_for_timeout(a.dwell if dwell is None else dwell)
   def shot(name):p.mouse.move(a.width-12,35);p.screenshot(path=str(o/(name+'.png')))
   def snap():return p.evaluate('PM56_DEEP_PLAN.snapshot()')
   def research(key):click('[data-action="b14-research"][data-key="'+key+'"]','Inspect source: '+key);p.wait_for_function('(key)=>PM56_DEEP_PLAN.snapshot().questions.find(q=>q.key===key).state!=="researching"',arg=key)
   def answer_round():
    run=snap();ids=run['rounds'][-1]['questionIds'];before=run['budget']['questions_asked']
    for i,qid in enumerate(ids):
     ck('Shared host shows exact question '+qid,p.evaluate('PM56_EXT.ctx().state.questions[PM56_EXT.ctx().state.questionIndex].id')==qid)
     click('.decision-host .qs-reel [data-action="answer-choice"]','Accept the shown recommendation')
     if i<len(ids)-1:click('.decision-host [data-action="next-question"]','Next dependency-frontier decision')
    click('.decision-host [data-action="submit-questionnaire"]','Commit these answers')
    ck('Answering does not charge again',snap()['budget']['questions_asked']==before)
    ck('The round has real recorded answers',snap()['rounds'][-1]['status']=='answered' and len(snap()['rounds'][-1]['answers'])==len(ids))
   click('[data-action="open-demo"]','Open Demo Studio');ck('Four public Batch 14 exercises',p.locator('[data-action="b14-start"]').count()==4);click('[data-action="b14-start"][data-flow="'+a.scenario+'"]','Open '+a.scenario+' exercise')
   ck('Gallery sets up, but does not start discovery',snap() is None);ck('No current Plan is fabricated before Send',p.evaluate('PM56_PLANS.current(PM56_EXT.ctx().thread.id)') is None)
   if a.record:
    p.wait_for_timeout(2000);log=open(o/'ffmpeg.log','w');logs.append(log);rec=subprocess.Popen(['ffmpeg','-y','-f','x11grab','-framerate','60','-video_size',f'{a.width}x{a.height}','-i',env['DISPLAY'],'-an','-c:v','libx264','-preset','ultrafast','-crf','22','-pix_fmt','yuv420p','-fps_mode','passthrough','-enc_time_base','1:60000',str(o/'workflow.mkv')],stdin=subprocess.PIPE,stdout=log,stderr=log)
   p.evaluate('''()=>{window.__b14Timing={raf:[],longTasks:[],start:performance.now()};window.__b14Obs=new PerformanceObserver(l=>__b14Timing.longTasks.push(...l.getEntries().map(x=>({start:x.startTime,duration:x.duration}))));__b14Obs.observe({type:'longtask'});function tick(t){__b14Timing.raf.push(t);window.__b14RAF=requestAnimationFrame(tick)}window.__b14RAF=requestAnimationFrame(tick)}''')
   click('[data-action="send"]','Send through the ordinary composer');ck('One discovery started after accepted submission',snap()['status']=='collecting');ck('Sent composer is cleared',p.evaluate('PM56_EXT.ctx().state.composer')=='');ck('No Plan or To-Dos automatically created',p.evaluate('PM56_PLANS.current(PM56_EXT.ctx().thread.id)') is None)
   click('[data-action="b14-hide-guide"]','Dismiss the guide');click('[data-action="b14-open"]','Open ordinary discovery controls');ck('Zero questions charged by opening controls',snap()['budget']['questions_asked']==0);shot('discovery')
   if a.scenario in ['thorough','exhaustive']:
    click('[data-action="b14-reuse"]','Reuse the recorded answer');ck('Reused answer has source and no question charge',snap()['budget']['reused_answer_count']==1 and snap()['budget']['questions_asked']==0 and snap()['questions'][0]['sourceRef'])
    if a.scenario=='exhaustive':
     click('[data-deep-disclosure] > summary','Reveal source-revision exercise');click('[data-action="b14-research"][data-key="fields"]','Begin a source-bound check',dwell=20);click('[data-action="b14-revise-source"]','Change the source before completion',dwell=20);p.wait_for_function('PM56_DEEP_PLAN.snapshot().pending.every(p=>p.finished)');ck('Delayed stale check rejected',snap()['questions'][1]['state']=='stale' and snap()['budget']['research_resolved_count']==0);shot('stale-check')
    research('fields');ck('Research computes the actual inventory',snap()['questions'][1]['answer'].startswith('4 exportable' if a.scenario=='exhaustive' else '3 exportable'));ck('Research is not counted as user questions',snap()['budget']['questions_asked']==0 and snap()['budget']['research_resolved_count']==1)
    click('[data-action="b14-source"][data-source$="-inventory"]','Open the shared source artifact');ck('Actual source bytes visible','private_notes' in p.locator('.editor-body [data-artifact-id]').inner_text());shot('source');click('[data-action="close-editor"][data-id$="-inventory"]','Return to discovery')
    if a.scenario=='exhaustive':research('reference');ck('Recorded external extract is not called live research','not independently fetched' in snap()['evidence'][-1]['method'])
    click('[data-action="b14-questions"]','Present two eligible decisions');ck('Presentation charges two items, not the card',snap()['budget']['questions_asked']==2);before=snap()['rounds'][-1]['id'];shot('shared-questionnaire')
    click('.decision-host [data-action="close-decision"]','Close the question guide without losing the round');click('[data-action="b14-open"]','Reopen the source workspace');click('[data-action="b14-questions"]','Continue the same round');ck('Reopening preserves stable round and count',snap()['rounds'][-1]['id']==before and snap()['budget']['questions_asked']==2);answer_round();ck('Planning stops early at two questions',snap()['budget']['questions_remaining']==(13 if a.scenario=='exhaustive' else 8));shot('decisions-complete')
   else:
    ck('Duplicate participant proposal merged to twelve identities',len(snap()['questions'])==12 and len(snap()['questions'][0]['contributors'])==2)
    for n in [3,6,9,10]:
     click('[data-action="b14-questions"]','Present the next shared frontier');ck('Shared charged total '+str(n),snap()['budget']['questions_asked']==n);answer_round()
    ck('No auto-failure on exhaustion',snap()['status']=='collecting' and snap()['budget']['exhausted']);click('[data-action="b14-questions"]','Attempt another question at the ceiling');ck('Exhaustion keeps unasked item uncharged',snap()['budget']['questions_asked']==10 and snap()['questions'][10]['state']=='proposed');shot('base-exhausted')
    click('[data-action="b14-grill"]','Enable Grill Me on the same run');ck('Extension adds exactly 25 without resetting history',snap()['budget']['effective_limit']==35 and snap()['budget']['questions_asked']==10 and snap()['budget']['questions_remaining']==25)
    click('[data-action="b14-questions"]','Present the dependent eleventh decision');ck('Dependent twelfth question stays in the next frontier',len(snap()['rounds'][-1]['questionIds'])==1);answer_round();click('[data-action="b14-grill"]','Disable Grill Me without deleting answers');ck('Over-base history remains valid and intact',snap()['budget']['questions_asked']==11 and snap()['budget']['effective_limit']==10 and snap()['budget']['questions_remaining']==0 and snap()['questions'][10]['state']=='answered')
    click('[data-action="b14-questions"]','Try the next frontier after lowering allowance');ck('Lowered allowance refuses new presentation without failing run',snap()['questions'][11]['state']=='proposed' and snap()['status']=='collecting');shot('extension-off')
   click('[data-action="b14-preview"]','Preview the source-bound Plan');ck('Preview has not created a Plan',p.evaluate('PM56_PLANS.current(PM56_EXT.ctx().thread.id)') is None);click('[data-action="b14-preview-cancel"]','Cancel preview without applying');ck('Cancelling preserves answers and creates no Plan',p.evaluate('PM56_PLANS.current(PM56_EXT.ctx().thread.id)') is None);click('[data-action="b14-preview"]','Review again')
   if a.scenario=='exhaustive':
    click('[data-action="b14-revise-source"]','Change source after reviewing the preview');click('[data-action="b14-synthesize"]','Reject stale confirmation');ck('Stale preview creates no Plan',p.evaluate('PM56_PLANS.current(PM56_EXT.ctx().thread.id)') is None);research('fields');click('[data-action="b14-preview"]','Refresh review with current evidence');ck('Rechecking a fact does not inflate research count',snap()['budget']['research_resolved_count']==2)
   p.locator('.deep14-preview').scroll_into_view_if_needed();shot('plan-review');click('[data-action="b14-synthesize"]','Create one Deep Plan through its owner');run=snap();plan=p.evaluate('PM56_PLANS.get(PM56_DEEP_PLAN.snapshot().planId)');ck('Plan opens in its ordinary document tab',p.evaluate('PM56_EXT.ctx().state.activeEditor')=='plan:'+run['planId'] and p.locator('.editor-body [data-plan-id="'+run['planId']+'"]').count()==1);ck('Existing Plan owner returns one ready Plan',run['status']=='synthesized' and plan['status']=='ready' and plan['backend']=='ledger_bound');ck('No Build or scoped-unit materialization occurred',not plan.get('unitsMaterialized') and not plan.get('approved'));ck('Ledger and revision identities agree',plan['ledger']['plan_version']==plan['version']);ck('Plan inspector uses the same question counter',p.evaluate('PM56_PLANS.questionBudget("plan:"+PM56_DEEP_PLAN.snapshot().planId).questions_asked')==run['budget']['questions_asked']);ck('Process card remains available',p.locator('[data-action="b14-open"]').count()>0)
   eligible=p.evaluate('PM56_PLANS.eligible(PM56_DEEP_PLAN.snapshot().planId)');ck('Build follows explicit blocker rather than budget exhaustion',bool(eligible['build'])==(a.scenario!='blocker'));text=p.evaluate('PM56_PLANS.markdown(PM56_DEEP_PLAN.snapshot().planId)');ck('Plan preserves decision provenance and open-item truth','Question allowance' in text and ('Build blocker:' in text if a.scenario=='blocker' else 'Open, non-blocking:' in text if a.scenario=='budget' else 'CSV with explicit quoting' in text));ck('Exhaustive dimension preserved',('Exhaustive impact review' in text)==(a.scenario=='exhaustive'));shot('created-plan');r['final_run']=run;r['plan']=plan
   click('[data-action="b14-open"]','Return to the retained discovery');click('[data-deep-disclosure] > summary','Open export and history') if not p.locator('[data-deep-disclosure]').evaluate('e=>e.open') else None
   with p.expect_download() as d:click('[data-action="b14-export"]','Download the actual discovery record')
   d.value.save_as(str(o/'export.json'));out=json.loads((o/'export.json').read_text());ck('Export preserves source thread, Plan and question identities',out['threadId']==run['threadId'] and out['planId']==run['planId'] and out['budget']==run['budget'])
   p.wait_for_timeout(350);geometry=p.evaluate('''()=>[...document.querySelectorAll('.transcript,.editor-body,.deep14-workspace,.deep14-source')].filter(e=>e.getBoundingClientRect().width>0).map(e=>({selector:e.className,client:e.clientWidth,scroll:e.scrollWidth}))''');r['geometry']=geometry;ck('Visible surfaces do not scroll horizontally',all(g['scroll']<=g['client']+1 for g in geometry));ck('No browser errors',not r['errors']);ck('No undeclared action collisions',not p.evaluate('PM56_EXT.collisions'))
   timing=p.evaluate('()=>{cancelAnimationFrame(__b14RAF);__b14Obs.disconnect();return {...__b14Timing,end:performance.now()}}');gaps=[y-x for x,y in zip(timing['raf'],timing['raf'][1:])];r['timing']={**timing,'median_raf_ms':statistics.median(gaps) if gaps else None,'max_raf_ms':max(gaps) if gaps else None,'intervals_over_25ms':sum(x>25 for x in gaps)}
   if rec:rec.communicate(b'q\n',timeout=20);ck('Encoder completed',rec.returncode==0);rec=None
   ck('Frozen HTML unchanged',(ROOT/'index.html').read_bytes()==raw);r['status']='pass';save();browser.close();browser=None
 except Exception:
  r['status']='fail';r['failure']=traceback.format_exc();save();print(r['failure'],flush=True)
  if p:
   try:p.screenshot(path=str(o/'failure.png'),timeout=5000)
   except Exception:pass
 finally:
  if rec:
   try:rec.communicate(b'q\n',timeout=10)
   except Exception:rec.kill();rec.wait()
  if browser:
   try:browser.close()
   except Exception:pass
  if xv:xv.terminate();xv.wait(timeout=10)
  for f in logs:f.close()
 print(json.dumps({'scenario':a.scenario,'status':r['status'],'assertions':len(r['checks']),'report':str(report)}));return 0 if r['status']=='pass' else 1
if __name__=='__main__':raise SystemExit(main())
