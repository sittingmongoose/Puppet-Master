#!/usr/bin/env python3
"""Ordinary-control journeys, exact downloaded output, responsive and motion evidence."""
import argparse,csv,hashlib,io,json,os,statistics,subprocess,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--outdir',type=Path,required=True);ap.add_argument('--scenario',choices=['simple','authority','plan','scheduled','normal'],required=True);ap.add_argument('--width',type=int,default=1440);ap.add_argument('--height',type=int,default=1000);ap.add_argument('--record',action='store_true');ap.add_argument('--dwell',type=int,default=100);a=ap.parse_args();o=a.outdir.resolve();o.mkdir(parents=True,exist_ok=True);target=o/'RESULT.json'
 if target.exists():ap.error('Use fresh output directory')
 raw=(ROOT/'index.html').read_bytes();r={'status':'running','scenario':a.scenario,'viewport':{'width':a.width,'height':a.height},'html_sha256':hashlib.sha256(raw).hexdigest(),'loading':'complete standalone via set_content','checks':[],'actions':[],'errors':[],'recorded':a.record};p=b=xv=rec=None;logs=[]
 def save():target.write_text(json.dumps(r,indent=2)+'\n')
 def ck(n,v):r['checks'].append({'name':n,'pass':bool(v)});save();assert v,n
 try:
  env=dict(os.environ)
  if a.record:
   f=open(o/'xvfb.log','w');logs.append(f);xv=subprocess.Popen(['Xvfb','-displayfd','1','-screen','0',f'{a.width}x{a.height}x24','-nolisten','tcp'],stdout=subprocess.PIPE,stderr=f,text=True);env['DISPLAY']=':'+xv.stdout.readline().strip()
  with sync_playwright() as pw:
   b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=not a.record,env=env,args=['--no-sandbox','--disable-dev-shm-usage','--start-fullscreen',f'--window-size={a.width},{a.height}','--window-position=0,0']);cx=b.new_context(viewport=r['viewport'],accept_downloads=True);p=cx.new_page();p.set_default_timeout(8000);p.on('pageerror',lambda e:r['errors'].append(str(e)));p.set_content(raw.decode(),wait_until='domcontentloaded');p.wait_for_function('window.__PM56_BOOT_OK');r['browser']=b.version
   if a.record:
    cd=cx.new_cdp_session(p);win=cd.send('Browser.getWindowForTarget')['windowId'];cd.send('Browser.setWindowBounds',{'windowId':win,'bounds':{'windowState':'fullscreen'}})
   def click(sel,label=None,dwell=None):
    loc=p.locator(sel).filter(visible=True).first;loc.scroll_into_view_if_needed();r['actions'].append({'label':label or sel,'browser_ms':p.evaluate('performance.now()')});loc.click();p.wait_for_timeout(a.dwell if dwell is None else dwell)
   def fill(sel,value,label):r['actions'].append({'label':label,'browser_ms':p.evaluate('performance.now()')});p.locator(sel).filter(visible=True).first.fill(value)
   def shot(name):p.mouse.move(a.width-10,30);p.screenshot(path=str(o/(name+'.png')))
   def g():return p.evaluate('PM56_GOAL.get()')
   def w():return p.evaluate('PM56_ORDER_EXPORT.snapshot()')
   def plan():return p.evaluate('PM56_PLANS.get(PM56_ORDER_EXPORT.snapshot().planId)')
   def td():return p.evaluate('PM56_TODOS.get(PM56_EXT.ctx().thread.id)')
   click('[data-action="open-demo"]','Open Demo Studio');ck('Four public exercises',p.locator('[data-action="b15-start"]').count()==4);flow='plan' if a.scenario=='normal' else a.scenario;click('[data-action="b15-start"][data-flow="'+flow+'"]','Set up '+flow+' input, without starting work');ck('No Goal or work before Send',g() is None and w() is None)
   if a.record:
    p.wait_for_timeout(2300);f=open(o/'ffmpeg.log','w');logs.append(f);rec=subprocess.Popen(['ffmpeg','-y','-f','x11grab','-framerate','60','-video_size',f'{a.width}x{a.height}','-i',env['DISPLAY'],'-an','-c:v','libx264','-preset','ultrafast','-crf','22','-pix_fmt','yuv420p','-fps_mode','passthrough','-enc_time_base','1:60000',str(o/'workflow.mkv')],stdin=subprocess.PIPE,stdout=f,stderr=f)
   p.evaluate('''()=>{window.__timing={raf:[],longTasks:[],start:performance.now()};window.__obs=new PerformanceObserver(l=>__timing.longTasks.push(...l.getEntries().map(x=>({start:x.startTime,duration:x.duration}))));__obs.observe({type:'longtask'});function tick(t){__timing.raf.push(t);window.__raf=requestAnimationFrame(tick)}window.__raf=requestAnimationFrame(tick)}''');shot('before-send')
   click('[data-action="send"]','Submit through ordinary composer');ck('Accepted composer cleared',p.evaluate('PM56_EXT.ctx().state.composer')=='');ck('Actual workflow owns the supplied input',bool(w()['source']['id']));click('[data-action="b15-hide-guide"]','Dismiss guide; ordinary controls remain')
   if a.scenario in ['plan','scheduled','normal']:
    ck('Plan created without execution',g() is None and not td() and plan()['status']=='ready');ck('User request precedes the Plan card',p.evaluate('PM56_EXT.ctx().thread.messages[0].role')=='user');click('[data-action="pd-info"]','Open ordinary Plan document');shot('plan-ready')
    if a.scenario=='normal':click('.editor-body [data-action="pd-build"]','Use primary Build, not Goal');ck('Primary Build creates no Goal',g() is None)
    else:
     click('.editor-body [data-action="pd-more-actions"]','Open secondary Plan actions')
     if a.scenario=='plan':click('[data-action="pd-build-goal"]','Explicit Build as Goal')
     else:
      click('[data-action="pd-build-at"]','Open Build At');click('[data-action="sched-set-build-kind"][data-value="one_time"]','Choose one-time schedule');p.locator('[data-sched-input="build-topology"]').select_option('goal_driven');shot('schedule-config');click('[data-action="sched-create-build"]','Commit schedule, not execution');ck('Scheduled Goal does not exist yet',g() is None and not td() and plan()['status']=='ready');r['schedule_before']=p.evaluate('PM56_SCHED.list().builds.find(x=>x.target_id===PM56_ORDER_EXPORT.snapshot().planId)');ck('Frozen topology is goal-driven',r['schedule_before']['execution_topology']=='goal_driven');shot('scheduled-no-goal');click('.schedule-item .schedule-details > summary','Open schedule Details');click('[data-action="sched-advance-window"]','Explicitly advance the local demonstration clock to the admitted occurrence');ck('Admitted dispatch creates bound Goal',g() is not None and plan()['approved'] is not None);click('[data-action="sched-close-dialog"]','Return to Plan and Goal')
   if a.scenario!='normal':
    if a.scenario in ['plan','scheduled'] and a.width<=1100:click('[data-action="return-to-chat"]','Return from the narrow Plan overlay to chat')
    click('[data-action="b15-goal"]','Open shared Goal Activity');click('[data-action="goal-pause"]','Pause through ordinary Goal control');before=td();p.wait_for_timeout(1150);ck('Pause stops actual shared work',g()['status']=='paused' and td()==before);shot('paused')
    head=p.evaluate('''()=>{const e=document.querySelector('.orders15-entry .working-head'); const r=e.getBoundingClientRect();return [...e.querySelectorAll('button')].map(b=>{const z=b.getBoundingClientRect();return {text:b.textContent.trim(),left:z.left,right:z.right,top:z.top,bottom:z.bottom,inside:z.left>=r.left&&z.right<=r.right+1&&z.top>=r.top&&z.bottom<=r.bottom+1,client:b.clientWidth,scroll:b.scrollWidth}})}''');r['work_header_geometry']=head;ck('Work-card shortcuts fully fit the actual column',bool(head) and all(x['inside'] and x['scroll']<=x['client']+1 for x in head))
    if a.scenario=='authority':
     original=g()['objective'];click('[data-action="goal-open-editor"], [data-action="goal-edit"]','Edit the objective in Activity');fill('[data-goal-input="objective"]',original+' Keep all five orders.','Type a direct objective revision');click('[data-action="goal-save"]','Save is explicit user approval');ck('Direct Save creates revision 2 and remains paused',g()['revision']==2 and g()['status']=='paused');shot('direct-save')
     click('[data-action="goal-details"]','Open objective detail');click('[data-action="goal-request-change"]','Request a proposed replacement through the ordinary composer');fill('[data-input="composer"]','Export all five supplied orders with exact cents and verify the CSV independently.','Request complete replacement');click('[data-action="send"]','Submit explicit replacement request');ck('Proposal leaves current objective unchanged',g()['revision']==2);shot('proposal-review');click('[data-action="goal-deny-proposal"]','Cancel this proposal');ck('Cancelled proposal preserves accepted revision',g()['revision']==2);click('[data-action="goal-request-change"]','Request replacement again');fill('[data-input="composer"]','Export all five supplied orders with exact cents and verify the CSV independently.','Provide requested replacement');click('[data-action="send"]','Submit requested replacement');click('[data-action="goal-approve-proposal"]','Approve the displayed replacement');ck('Approval creates one revision, not a resume',g()['revision']==3 and g()['status']=='paused');shot('approved-objective')
    if a.scenario in ['plan','scheduled']:ck('Paused Plan stays Building',plan()['status']=='building' and plan()['attention']['kind']=='paused')
    click('[data-action="goal-resume"]','Resume explicitly');p.wait_for_function('PM56_GOAL.get()?.status==="completed"',timeout=22000);ck('Goal completes only with current accepted evidence',len(g()['completion']['evidenceRefs'])==3);shot('completed-goal')
   else:p.wait_for_function('PM56_PLANS.get(PM56_ORDER_EXPORT.snapshot().planId).status==="completed"',timeout=22000);ck('Normal Plan completes without Goal',g() is None)
   ck('All required To-Dos have accepted item evidence',len(td())==3 and all(x['status']=='completed' and x['transitions'][-1]['cause_kind']=='outcome_satisfied' for x in td()));click('[data-action="b15-open"]','Open computed files');shot('computed-files');r['final_work']=w();r['final_goal']=g();r['final_todos']=td();r['plan']=plan() if w().get('planId') else None
   with p.expect_download() as dl:click('[data-action="b15-download"][data-artifact$="-export"]','Download exact committed CSV')
   path=o/'orders.csv';dl.value.save_as(str(path));data=path.read_bytes();rows=list(csv.DictReader(io.StringIO(data.decode())));ck('Downloaded file has all five rows and exact 22324-cent total',len(rows)==5 and sum(int(x['total_cents']) for x in rows)==22324);ck('Quotes, embedded newline, Unicode and spaces survive',rows[0]['customer']=='River, Inc.' and rows[1]['customer']=='Ada "A" Chen' and rows[2]['customer']=='North\nSouth' and rows[3]['customer']=='München Studio' and rows[4]['customer']=='Trailing space ');r['csv_sha256']=hashlib.sha256(data).hexdigest();expected=p.evaluate('PM56_DATA.artifacts.find(a=>a.id===PM56_ORDER_EXPORT.snapshot().outputs.export).content');ck('Download equals stored artifact bytes',data==expected.encode());ck('No Goal transcript card',p.evaluate('PM56_EXT.ctx().thread.messages.every(m=>m.type!=="goal-card")'))
   geometry=p.evaluate('''()=>[...document.querySelectorAll('.transcript,.editor-body,.orders15-workspace,.goal-section-v2,.activity-panel')].filter(e=>e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0).map(e=>({class:e.className,client:e.clientWidth,scroll:e.scrollWidth}))''');r['geometry']=geometry;ck('Visible content has no horizontal overflow',all(x['scroll']<=x['client']+1 for x in geometry));ck('No page errors',not r['errors']);ck('No undeclared action collisions',not p.evaluate('PM56_EXT.collisions'));timing=p.evaluate('()=>{cancelAnimationFrame(__raf);__obs.disconnect();return {...__timing,end:performance.now()}}');gaps=[y-x for x,y in zip(timing['raf'],timing['raf'][1:])];r['timing']={**timing,'median_raf_ms':statistics.median(gaps) if gaps else None,'max_raf_ms':max(gaps) if gaps else None,'intervals_over_25ms':sum(x>25 for x in gaps)}
   if rec:rec.communicate(b'q\n',timeout=20);ck('Encoder completed',rec.returncode==0);rec=None
   ck('Frozen HTML bytes unchanged',(ROOT/'index.html').read_bytes()==raw);r['status']='pass';save();b.close();b=None
 except Exception:
  r['status']='fail';r['failure']=traceback.format_exc();save();print(r['failure'],flush=True)
  if p:
   try:p.screenshot(path=str(o/'failure.png'),timeout=5000)
   except Exception:pass
 finally:
  if rec:
   try:rec.communicate(b'q\n',timeout=10)
   except Exception:rec.kill();rec.wait()
  if b:
   try:b.close()
   except Exception:pass
  if xv:xv.terminate();xv.wait(timeout=10)
  for f in logs:f.close()
 print(json.dumps({'scenario':a.scenario,'status':r['status'],'checks':len(r['checks']),'report':str(target)}));return 0 if r['status']=='pass' else 1
if __name__=='__main__':raise SystemExit(main())
