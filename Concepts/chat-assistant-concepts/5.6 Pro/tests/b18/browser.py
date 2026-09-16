#!/usr/bin/env python3
"""Ordinary Batch18 controls on the complete generated HTML; no provider/timer service."""
import argparse,hashlib,json,traceback,os,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--outdir',type=Path,required=True);ap.add_argument('--scenario',choices=['messages','windows'],required=True);ap.add_argument('--width',type=int,default=1440);ap.add_argument('--height',type=int,default=1000);ap.add_argument('--record',action='store_true');ap.add_argument('--variant',default='orbit',choices=['orbit','simple']);a=ap.parse_args();o=a.outdir.resolve();o.mkdir(parents=True,exist_ok=True);target=o/'RESULT.json'
 if target.exists():ap.error('Use a new output directory')
 raw=(ROOT/'index.html').read_bytes();r={'status':'running','scenario':a.scenario,'width':a.width,'height':a.height,'html_sha256':hashlib.sha256(raw).hexdigest(),'checks':[],'actions':[],'errors':[],'recorded':a.record,'variant':a.variant,'scope':'actual ordinary controls and explicit local clock; not background/server/durable proof'};xv=rec=b=None;logs=[]
 def save():target.write_text(json.dumps(r,indent=2)+'\n')
 def ck(n,v):r['checks'].append({'name':n,'pass':bool(v)});save();assert v,n
 try:
  env=dict(os.environ)
  if a.record:
   f=open(o/'xvfb.log','w');logs.append(f);xv=subprocess.Popen(['Xvfb','-displayfd','1','-screen','0',f'{a.width}x{a.height}x24','-nolisten','tcp'],stdout=subprocess.PIPE,stderr=f,text=True);env['DISPLAY']=':'+xv.stdout.readline().strip()
  with sync_playwright() as pw:
   b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=not a.record,env=env,args=['--no-sandbox','--disable-dev-shm-usage','--start-fullscreen',f'--window-size={a.width},{a.height}','--window-position=0,0']);cx=b.new_context(viewport={'width':a.width,'height':a.height},accept_downloads=True);p=cx.new_page();p.set_default_timeout(9000);p.on('pageerror',lambda e:r['errors'].append(str(e)));p.set_content(raw.decode(),wait_until='domcontentloaded');p.wait_for_function('window.__PM56_BOOT_OK');r['browser']=b.version
   if a.record:
    cd=cx.new_cdp_session(p);win=cd.send('Browser.getWindowForTarget')['windowId'];cd.send('Browser.setWindowBounds',{'windowId':win,'bounds':{'windowState':'fullscreen'}})
   def click(sel,label=None):
    loc=p.locator(sel).filter(visible=True).first;
    try:loc.scroll_into_view_if_needed()
    except Exception:
     p.screenshot(path=str(o/'failure.png'));(o/'failure-dom.html').write_text(p.content());raise
    r['actions'].append({'label':label or sel,'browser_ms':p.evaluate('performance.now()')});loc.click();p.wait_for_timeout(220 if a.record else 80);save()
   def fill(sel,value):p.locator(sel).filter(visible=True).first.fill(value);p.locator(sel).filter(visible=True).first.press('Tab');p.wait_for_timeout(50)
   def shot(name):
    p.mouse.move(a.width-8,25);p.screenshot(path=str(o/(name+'.png')))
    boxes=p.evaluate("""()=>[...document.querySelectorAll('.transcript,.editor-body,.b18-guide,.sched-dialog')].filter(x=>x.clientWidth&&x.clientHeight).map(x=>({class:x.className,width:x.clientWidth,scroll:x.scrollWidth}))""");r.setdefault('geometry',{})[name]=boxes;ck(name+' no horizontal overflow',bool(boxes) and all(x['scroll']<=x['width']+1 for x in boxes))
   def snap():return p.evaluate('PM56_B18.snapshot()')
   def message():return snap()['message']
   def build():return snap()['build']
   def back():
    if a.width<=1100 and p.locator('[data-action="return-to-chat"]').filter(visible=True).count():click('[data-action="return-to-chat"]','Return to chat')
   def clock(action,label):
    back()
    if not p.locator('.b18-clock').get_attribute('open'): # empty boolean attribute is a falsey string
     if not p.locator('.b18-clock').evaluate('e=>e.open'):click('.b18-clock summary','Open explicit local clock controls')
    click('[data-action="'+action+'"]',label)
   click('[data-action="open-demo"]','Open Demo Studio');p.locator('select[data-input="variant"][data-family="2"]').first.select_option('8' if a.variant=='simple' else '1');ck('Both B18 workflows exposed',p.locator('[data-action="b18-start"]').count()==2);click('[data-action="b18-start"][data-flow="'+a.scenario+'"]','Prepare local inputs only');ck('No schedule before explicit creation',not message() and not build())
   if a.record:
    p.wait_for_timeout(350);f=open(o/'ffmpeg.log','w');logs.append(f);rec=subprocess.Popen(['ffmpeg','-y','-f','x11grab','-framerate','60','-video_size',f'{a.width}x{a.height}','-i',env['DISPLAY'],'-an','-c:v','libx264','-preset','ultrafast','-crf','22','-pix_fmt','yuv420p','-fps_mode','passthrough','-enc_time_base','1:60000',str(o/'workflow.mkv')],stdin=subprocess.PIPE,stdout=f,stderr=f)
   p.evaluate("""()=>{window.__b18timing={raf:[],longTasks:[]};new PerformanceObserver(l=>__b18timing.longTasks.push(...l.getEntries().map(x=>({start:x.startTime,duration:x.duration})))).observe({type:'longtask'});function tick(t){__b18timing.raf.push(t);window.__b18raf=requestAnimationFrame(tick)}window.__b18raf=requestAnimationFrame(tick)}""")
   shot('01-prepared')
   if a.scenario=='messages':
    frozen_text=p.locator('[data-input="composer"]').input_value();click('[data-action="open-menu"][data-menu="wand"]','Open composer wand');click('[data-action="polish-wand-group"][data-group="schedule"]','Open Scheduling group');click('[data-action="sched-open-message"]','Schedule Message from wand')
    fill('[data-sched-input="msg-date"]','2027-05-10');fill('[data-sched-input="msg-time"]','22:00');p.locator('[data-sched-input="msg-tz"]').select_option('America/New_York');shot('02-exact-schedule-form');click('[data-action="sched-create-message"]','Commit exact message snapshot');ck('One pending record with exact text and V1',message()['text']==frozen_text and message()['attachment_refs'][0]['artifact_version']==1 and message()['state']=='scheduled');ck('Composer consumed after commit',p.locator('[data-input="composer"]').input_value()=='');ck('Four separate manager categories',p.locator('.sched-tabs [role="tab"]').count()==4);shot('03-scheduled-manager');click('[data-action="sched-close-dialog"]','Close manager')
    sid=message()['scheduled_dispatch_id'];clock('b18-source-v2','Publish source V2 without rebinding');clock('b18-toggle-input','Disconnect retained V1');clock('b18-message-due','Evaluate scheduled time');ck('Exact missing V1 holds without sending',message()['state']=='held' and not p.evaluate('PM56_EXT.ctx().thread.messages.some(m=>m.viaSchedule)'));shot('04-held-v1')
    clock('b18-toggle-input','Restore the same V1');clock('b18-message-due','Retry frozen dispatch');p.wait_for_function('PM56_B18.snapshot().outputs.length===1');ck('Sent links actual user message',message()['state']=='sent' and bool(message()['dispatchedMessageId']));ck('True local computation uses 21, not V2 value 999',p.locator('.b18-result').inner_text().find('Sum: 21')>=0);ck('Failed attempt retained beside successful attempt',len(message()['dispatch_attempts'])==2);shot('05-sent-result')
    clock('b18-message-repeat','Replay same delivery ticket');ck('No duplicate message or result',p.evaluate('PM56_EXT.ctx().thread.messages.filter(m=>m.viaSchedule).length')==1 and len(snap()['outputs'])==1);click('.b18-result [data-action="open-artifact"]','Inspect exact result identity');ck('Shared artifact viewer shows V1 lineage',p.locator('.ar-source').first.inner_text().find('"artifact_version": 1')>=0);shot('06-result-artifact');back()
    click('[data-action="sched-card-details"][data-id="'+sid+'"]','Open historical receipt details');click('[data-action="sched-focus-record"][data-id="'+sid+'"]','Open exact schedule in manager')
    p.locator('[data-sched-input="manager-status"]').select_option('completed');fill('[data-sched-input="manager-query"]','Add the values');ck('Historical filter retains Sent and exact schedule ID',p.locator('.sched-dialog [data-schedule-id="'+sid+'"]').count()==1);shot('07-sent-history');r['computed_sum']=21;r['schedule_id']=sid
   else:
    click('[data-action="send"]','Send ordinary Plan request');p.wait_for_function('PM56_B17_WORK.snapshot().planId');pid=p.evaluate('PM56_B17_WORK.snapshot().planId');click('[data-action="pd-info"],[data-action="pd-expand"]','Open exact Plan');
    if not p.locator('.editor-body [data-action="pd-build-at"]').count():click('.editor-body [data-action="pd-more-actions"]','Open Plan secondary controls')
    click('.editor-body [data-action="pd-build-at"]','Build At, not Build Now');fill('[data-sched-input="build-start"]','22:00');fill('[data-sched-input="build-pause"]','23:00');p.locator('[data-sched-input="build-tz"]').select_option('America/New_York');shot('02-window-form');click('[data-action="sched-create-build"]','Commit recurring window');ck('No runtime before dispatch',not build()['dispatchReceipt'] and p.evaluate('PM56_PLANS.get(PM56_B17_WORK.snapshot().planId).status')=='ready');shot('03-pending-window');click('[data-action="sched-close-dialog"]','Close build schedule');clock('b18-window-open','Evaluate true opening boundary');run=build()['plan_run_id'];ck('Opening admits one run and three To-Dos',bool(run) and len(p.evaluate('PM56_TODOS.get(PM56_EXT.ctx().thread.id)'))==3)
    p.wait_for_function('PM56_B17_WORK.snapshot().outputs.normalize',timeout=18000);normalized=p.evaluate('PM56_B17_WORK.snapshot().outputs.normalize');clock('b18-window-wind','Wind down at a safe boundary');ck('Primary remains Building, window wait secondary',p.evaluate('PM56_PLANS.buildLabel(PM56_B17_WORK.snapshot().planId)')=='Building…' and p.evaluate('PM56_PLANS.get(PM56_B17_WORK.snapshot().planId).attention.kind')=='window' and 'Paused at window wind-down' in p.locator('.plan-schedule-line').first.inner_text());shot('04-wind-down-safe');p.wait_for_timeout(1600);ck('Completed normalization retained without new total',p.evaluate('Object.keys(PM56_B17_WORK.snapshot().outputs).join(",")')=='normalize');clock('b18-window-close','Evaluate pause boundary');shot('05-window-closed');clock('b18-window-next','Resume at next eligible opening');ck('Same run resumed, no new run',build()['plan_run_id']==run and p.evaluate('PM56_PLANS.get(PM56_B17_WORK.snapshot().planId).attention') is None);shot('06-same-run-resumed');p.wait_for_function('PM56_PLANS.get(PM56_B17_WORK.snapshot().planId).status==="completed"',timeout=24000);ck('Normalization identity unchanged through completion',p.evaluate('PM56_B17_WORK.snapshot().outputs.normalize')==normalized);clock('b18-plan','Inspect completed Plan');ck('Completed control is truthful',p.locator('.editor-body .pd-build').inner_text()=='Completed');shot('07-completed-plan');clock('b18-window-next','Deliver another nightly occurrence after completion');ck('No recurring restart after terminal result',build()['state']=='completed' and build()['plan_run_id']==run);shot('08-terminal-recurrence');r['plan_run_id']=run
   ck('No script errors or action collisions',not r['errors'] and not p.evaluate('PM56_EXT.collisions'));r['timing']=p.evaluate('()=>{cancelAnimationFrame(__b18raf);return __b18timing}');r['source_unchanged']=(ROOT/'index.html').read_bytes()==raw;ck('Frozen HTML unchanged',r['source_unchanged']);r['status']='pass';save();b.close();b=None
 except Exception:
  r['status']='fail';r['failure']=traceback.format_exc();save();print(r['failure'],flush=True)
  try:p.screenshot(path=str(o/'failure.png'));(o/'failure-dom.html').write_text(p.content())
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
 print(r['status'],a.scenario,a.width,len(r['checks']),flush=True);return 0 if r['status']=='pass' else 1
if __name__=='__main__':raise SystemExit(main())
