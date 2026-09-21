#!/usr/bin/env python3
"""Ordinary-control B18 completion journeys on the full frozen HTML.
Selected-device scene uses the browser's genuine File input with external files;
sample-folder scene is deliberately labelled fixture input, not OS enumeration.
"""
import argparse,base64,hashlib,json,os,subprocess,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--outdir',type=Path,required=True);ap.add_argument('--scenario',choices=['crew','room','folder','device'],required=True);ap.add_argument('--width',type=int,default=1440);ap.add_argument('--height',type=int,default=1000);ap.add_argument('--record',action='store_true');ap.add_argument('--variant',choices=['orbit','simple'],default='orbit');a=ap.parse_args();o=a.outdir.resolve();o.mkdir(parents=True,exist_ok=True);target=o/'RESULT.json'
 if target.exists():ap.error('Use a fresh directory')
 raw=(ROOT/'index.html').read_bytes();r={'status':'running','scenario':a.scenario,'width':a.width,'height':a.height,'html_sha256':hashlib.sha256(raw).hexdigest(),'driver_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'checks':[],'actions':[],'errors':[],'recorded':a.record,'variant':a.variant,'scope':'complete generated HTML, ordinary controls; local clock and explicitly labelled fixture inputs; no provider or server claims'};xv=rec=b=p=pw=None;logs=[]
 def save():target.write_text(json.dumps(r,indent=2)+'\n')
 def ck(name,value):r['checks'].append({'name':name,'pass':bool(value)});save();assert value,name
 try:
  env=dict(os.environ)
  if a.record:
   f=open(o/'xvfb.log','w');logs.append(f);xv=subprocess.Popen(['Xvfb','-displayfd','1','-screen','0',f'{a.width}x{a.height}x24','-nolisten','tcp'],stdout=subprocess.PIPE,stderr=f,text=True);env['DISPLAY']=':'+xv.stdout.readline().strip()
  pw=sync_playwright().start()
  b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=not a.record,env=env,args=['--no-sandbox','--disable-dev-shm-usage','--start-fullscreen',f'--window-size={a.width},{a.height}','--window-position=0,0']);cx=b.new_context(viewport={'width':a.width,'height':a.height},accept_downloads=True);p=cx.new_page();p.set_default_timeout(9000);p.on('pageerror',lambda e:r['errors'].append(str(e)));p.set_content(raw.decode(),wait_until='domcontentloaded');p.wait_for_function('window.__PM56_BOOT_OK');r['browser']=b.version
  if a.record:
   cd=cx.new_cdp_session(p);win=cd.send('Browser.getWindowForTarget')['windowId'];cd.send('Browser.setWindowBounds',{'windowId':win,'bounds':{'windowState':'fullscreen'}})
  def click(sel,label=None):
   loc=p.locator(sel).filter(visible=True).first;loc.scroll_into_view_if_needed();r['actions'].append({'label':label or sel,'browser_ms':p.evaluate('performance.now()')});loc.click();p.wait_for_timeout(220 if a.record else 90);save()
  def fill(sel,value):
   loc=p.locator(sel).filter(visible=True).first;loc.fill(value);loc.press('Tab');p.wait_for_timeout(60)
  def pick(family,value,label=None):click('[data-action="sched-pick-'+family+'"]',label or 'Pick '+family);p.wait_for_timeout(250);click('.overlay-menu [data-action="shared-choice-pick"][data-value="'+value+'"]','Choose '+family+' '+value)
  def shot(name):
   p.wait_for_timeout(420);p.mouse.move(a.width-8,25);p.screenshot(path=str(o/(name+'.png')));boxes=p.evaluate("""()=>[...document.querySelectorAll('.transcript,.editor-body,.b18-guide,.b18c-guide,.sched-dialog,.collab-panel,.collab-configure,.ar-document,.snapshot-manifest')].filter(x=>x.clientWidth&&x.clientHeight).map(x=>({class:x.className,width:x.clientWidth,scroll:x.scrollWidth}))""");r.setdefault('geometry',{})[name]=boxes;ck(name+' no horizontal overflow',bool(boxes) and all(x['scroll']<=x['width']+1 for x in boxes))
  def back():
   if a.width<=1100 and p.locator('[data-action="return-to-chat"]').filter(visible=True).count():click('[data-action="return-to-chat"]','Return to chat')
  def clock(action,label):
   back()
   if p.locator('.b18-clock').count() and not p.locator('.b18-clock').evaluate('e=>e.open'):click('.b18-clock summary','Open explicit local clock')
   click('[data-action="'+action+'"]',label)
  def message():return p.evaluate('PM56_B18C.snapshot().message')
  def build():return p.evaluate('PM56_B18.snapshot().build')
  message_forms=0
  def schedule_message():
   nonlocal message_forms
   message_forms+=1
   click('[data-action="open-menu"][data-menu="wand"]','Open composer wand')
   if not p.locator('[data-action="sched-open-message"]').filter(visible=True).count():click('[data-action="polish-wand-group"][data-group="schedule"]','Open Scheduling')
   click('[data-action="sched-open-message"]','Schedule Message')
   fill('[data-sched-input="msg-date"]','2027-05-10');fill('[data-sched-input="msg-time"]','22:00');pick('msg-tz','America/New_York');shot('03-frozen-schedule-form-'+str(message_forms));click('[data-action="sched-create-message"]','Commit through shared scheduler');p.wait_for_function('PM56_B18C.snapshot().message?.state==="scheduled"');ck('Composer cleared after committed schedule',p.locator('[data-input="composer"]').input_value()=='');shot('04-pending-schedule-'+str(message_forms));click('[data-action="sched-close-dialog"]','Close schedule manager')
  click('[data-action="open-demo"]','Open Demo Studio');p.wait_for_timeout(500);p.locator('select[data-input="variant"][data-family="2"]').filter(visible=True).first.select_option('8' if a.variant=='simple' else '1');ck('All three continuation workflows exposed',p.locator('[data-action="b18c-start"]').count()==3);click('[data-action="b18c-start"][data-flow="'+('folder' if a.scenario=='device' else a.scenario)+'"]','Prepare workflow, not a schedule')
  if a.record:
   p.wait_for_timeout(350);f=open(o/'ffmpeg.log','w');logs.append(f);rec=subprocess.Popen(['ffmpeg','-y','-f','x11grab','-framerate','60','-video_size',f'{a.width}x{a.height}','-i',env['DISPLAY'],'-an','-c:v','libx264','-preset','ultrafast','-crf','22','-pix_fmt','yuv420p','-fps_mode','passthrough','-enc_time_base','1:60000',str(o/'workflow.mkv')],stdin=subprocess.PIPE,stdout=f,stderr=f)
  p.evaluate("""()=>{window.__b18ctiming={raf:[],longTasks:[]};window.__b18cobs=new PerformanceObserver(l=>__b18ctiming.longTasks.push(...l.getEntries().map(x=>({start:x.startTime,duration:x.duration}))));__b18cobs.observe({type:'longtask'});function tick(t){__b18ctiming.raf.push(t);window.__b18craf=requestAnimationFrame(tick)}window.__b18craf=requestAnimationFrame(tick)}""")
  shot('01-prepared')
  if a.scenario=='crew':
   before=p.evaluate('PM56_COLLAB.runs().length');click('[data-action="send"]','Send ordinary Plan request');p.wait_for_function('PM56_B17_WORK.snapshot().planId');pid=p.evaluate('PM56_B17_WORK.snapshot().planId');click('[data-action="pd-info"],[data-action="pd-expand"]','Open exact Plan')
   if not p.locator('.editor-body [data-action="pd-build-at"]').count():click('.editor-body [data-action="pd-more-actions"]','Open Plan secondary actions')
   click('.editor-body [data-action="pd-build-at"]','Schedule, not Build Now');pick('build-topology','crew');click('[data-action="sched-configure-crew"]','Configure Crew through shared modal');fill('[data-collab-input="name"]','Retained three-role Crew');shot('02-crew-configuration');ck('Configuring creates no run',p.evaluate('PM56_COLLAB.runs().length')==before and p.evaluate('PM56_PLANS.get(PM56_B17_WORK.snapshot().planId).status')=='ready');click('[data-action="collab-modal-commit"]','Use this Crew without starting it');p.wait_for_selector('[data-sched-input="build-start"]');fill('[data-sched-input="build-start"]','22:00');fill('[data-sched-input="build-pause"]','23:00');pick('build-tz','America/New_York');shot('03-crew-schedule-form');click('[data-action="sched-create-build"]','Commit frozen Crew schedule');ck('Future schedule has no CrewRun or PlanRun',p.evaluate('PM56_COLLAB.runs().length')==before and not build()['dispatchReceipt']);shot('04-pending-crew');click('[data-action="sched-close-dialog"]','Close schedule');clock('b18-window-open','Evaluate true window opening');cr=build()['dispatchReceipt']['crew_run_id'];pr=build()['plan_run_id'];ck('One CrewRun, PlanRun and To-Do hierarchy admitted',p.evaluate('PM56_COLLAB.runs().length')==before+1 and bool(cr) and len(p.evaluate('PM56_TODOS.get()'))==3);ck('Actual Crew card visible in transcript',p.locator('[data-run-id="'+cr+'"]').count()==1)
   p.wait_for_function('PM56_B17_WORK.snapshot().outputs.normalize',timeout=18000);normalized=p.evaluate('PM56_B17_WORK.snapshot().outputs.normalize');clock('b18-window-wind','Wind down after real normalization');ck('Safe window wait preserves Crew identity',p.evaluate('PM56_PLANS.get(PM56_B17_WORK.snapshot().planId).attention.kind')=='window' and p.evaluate('id=>PM56_COLLAB.run(id).status',cr)=='waiting');click('[data-action="collab-open-panel"][data-run="'+cr+'"]','Inspect frozen assignments');ck('Visible assignment projection and explicit local constraint',p.locator('.plan-crew-assignment').count()==3 and 'No provider' in p.locator('.plan-crew-summary').inner_text());shot('05-crew-safe-window');click('[data-action="close-dialog"]','Close Crew panel');clock('b18-window-next','Resume the same Crew in next window');ck('No second Crew or PlanRun on recurrence',build()['plan_run_id']==pr and build()['dispatchReceipt']['crew_run_id']==cr and p.evaluate('PM56_COLLAB.runs().length')==before+1);shot('06-same-crew-resumed');p.wait_for_function('PM56_PLANS.get(PM56_B17_WORK.snapshot().planId).status==="completed"',timeout=24000);ck('Original normalization retained',p.evaluate('PM56_B17_WORK.snapshot().outputs.normalize')==normalized);click('[data-action="collab-open-panel"][data-run="'+cr+'"]','Open completed Crew');ck('Evidence-backed Crew completion agrees with Plan',p.evaluate('id=>PM56_COLLAB.run(id).status',cr)=='completed' and p.evaluate('id=>PM56_COLLAB.completion(id).clean_completion',cr));shot('07-completed-crew');click('[data-action="collab-panel-tab"][data-tab="participants"]','Open participant roster');ck('Configured slots not collapsed',p.locator('.collab-panel .collab-participant').count()==3);shot('08-participant-roster');click('.collab-panel .collab-participant','Inspect admitted work for selected slot');ck('Participant links actual admitted work',p.locator('.plan-crew-participant-work').count()==1 and 'succeeded' in p.locator('.plan-crew-participant-work').inner_text());shot('09-participant-work');click('[data-action="close-dialog"]','Close roster');clock('b18-window-next','Repeat occurrence after completion');ck('Terminal recurrence cannot restart Crew',build()['state']=='completed' and p.evaluate('PM56_COLLAB.runs().length')==before+1);r.update(crew_run_id=cr,plan_run_id=pr)
  elif a.scenario=='room':
   click('[data-action="collab-modal-commit"]','Start recorded Chat Room from mandatory configuration');rid=p.evaluate('PM56_B18C.snapshot().roomId');ck('One room exists without schedule',bool(rid) and not message());click('[data-action="b18c-target-room"]','Target ordinary composer to this room');fill('[data-input="composer"]','Keep the visible Search button; review the optional shortcut.');text=p.locator('[data-input="composer"]').input_value();shot('02-targeted-composer');schedule_message();ck('Exact run and assignment generation frozen',message()['destination_ref']['refId']==rid and bool(message()['destination_ref']['scheduled_binding']));click('[data-action="collab-toggle-more"][data-run="'+rid+'"]','Open room controls');click('[data-action="collab-pause"][data-run="'+rid+'"]','Pause destination');clock('b18c-message-due','Evaluate while destination paused');ck('Paused destination holds, never falls back',message()['state']=='held' and not p.evaluate('PM56_EXT.ctx().thread.messages.some(m=>m.viaSchedule)'));shot('05-held-room');click('[data-action="collab-resume"][data-run="'+rid+'"]','Explicitly resume exact room');clock('b18c-message-due','Deliver exact scheduled input');mid=message()['dispatchedMessageId'];ck('Shared object appears exactly once in each transcript',p.evaluate('x=>{const r=PM56_COLLAB.run(x.rid),t=PM56_EXT.ctx().thread,a=t.messages.filter(m=>m.id===x.mid),b=r.messages.filter(m=>m.id===x.mid);return a.length===1&&b.length===1&&a[0]===b[0]&&a[0].body===x.text}',{'rid':rid,'mid':mid,'text':text}));clock('b18c-message-repeat','Replay same delivery');ck('Exactly one recipient delivery receipt',p.evaluate('id=>PM56_COLLAB.run(id).scheduledDeliveries.length',rid)==1);click('[data-action="collab-open-panel"][data-run="'+rid+'"]','Open first addressed discussion');click('[data-action="collab-room-next-round"][data-run="'+rid+'"]','Discuss the first scheduled message');p.wait_for_function('id=>PM56_COLLAB.run(id).chatRoom.round?.complete',arg=rid);ck('Recorded replies keep original scheduled message edge',p.evaluate('x=>PM56_COLLAB.run(x.rid).messages.filter(m=>m.replyTo===x.mid).length',{'rid':rid,'mid':mid})==3);shot('06-first-addressed-round');back();click('[data-action="b18c-target-participant"]','Target a single existing participant');fill('[data-input="composer"]','One direct scheduled follow-up, not a broadcast.');schedule_message();clock('b18c-message-due','Deliver to selected participant only');direct=message()['dispatchedMessageId'];ck('Participant addressing preserved',p.evaluate('x=>PM56_COLLAB.run(x.rid).messages.find(m=>m.id===x.mid).recipientIds.length',{'rid':rid,'mid':direct})==1);click('[data-action="collab-open-panel"][data-run="'+rid+'"]','Open discussion');ck('Scheduled text visible in collaboration transcript',text in p.locator('.room-document').inner_text() and 'One direct scheduled follow-up' in p.locator('.room-document').inner_text());shot('07-shared-transcript');click('[data-action="collab-room-next-round"][data-run="'+rid+'"]','Discuss only the addressed participant');p.wait_for_function('id=>PM56_COLLAB.run(id).chatRoom.round?.complete',arg=rid);ck('Exactly one recorded reply addresses direct scheduled message',p.evaluate('x=>PM56_COLLAB.run(x.rid).messages.filter(m=>m.replyTo===x.mid).length',{'rid':rid,'mid':direct})==1);shot('08-direct-addressed-round');r.update(collaboration_run_id=rid,message_id=mid,direct_message_id=direct)
  else:
   expected={'notes.txt':b'# Snapshot note\r\nOriginal V1 '+ '—'.encode()+b' keep this line.\r\n<script>not executed</script>\r\n','data/numbers.bin':bytes([0,1,2,13,10,127,128,254,255]),'empty.txt':b''}
   if a.scenario=='device':
    selected=o/'SelectedFolder'
    for name,data in expected.items():path=selected/name;path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(data)
    with p.expect_file_chooser() as chooser:click('[data-action="att-upload-folder"]','Select actual external directory through browser File input')
    chooser.value.set_files(str(selected));p.wait_for_function('PM56_COMPOSER_STATE.bufferFor(PM56_EXT.ctx().thread.id).attachments.length===1');r['selection_source']='actual external files through File chooser'
   else:click('[data-action="b18c-sample-folder"]','Load explicitly labelled sample Files');r['selection_source']='labelled generated File fixture'
   ck('Selected complete three-file input, not a cropped preview',p.evaluate('PM56_COMPOSER_STATE.bufferFor(PM56_EXT.ctx().thread.id).attachments[0].folder_manifest.totalFiles')==3);shot('02-folder-selection');schedule_message();ref=message()['attachment_refs'][0]['snapshot_ref'];record=p.evaluate('ref=>PM56_ARTIFACTS.resolve(ref).revision.record',ref);ck('All selected bytes retained with exact manifest',len(record['payload']['files'])==3 and message()['attachment_refs'][0]['folder_manifest_hash']==record['payload']['manifest_sha256']);r['snapshot_ref']=ref
   if a.scenario=='folder':clock('b18c-replace-source','Replace source selection with V2 fixture')
   else:
    for name in expected:(selected/name).write_bytes(b'NEW SOURCE V2 MUST NOT BE SUBSTITUTED')
    r['external_files_changed_after_snapshot']=True
   clock('b18c-toggle-member','Disconnect one retained member');clock('b18c-message-due','Evaluate incomplete retained folder');ck('One missing member holds entire scheduled message',message()['state']=='held' and not p.evaluate('PM56_EXT.ctx().thread.messages.some(m=>m.viaSchedule)'));shot('05-held-folder');clock('b18c-toggle-member','Restore original retained member');clock('b18c-message-due','Deliver exact original folder');clock('b18c-message-repeat','Replay delivered folder');ck('One exact scheduled message, no duplicate',message()['state']=='sent' and p.evaluate('PM56_EXT.ctx().thread.messages.filter(m=>m.viaSchedule).length')==1);click('.b18c-controls [data-action="open-artifact"]','Open exact retained folder');ck('Full manifest opens in shared artifact editor',p.locator('.snapshot-manifest > div').count()==3);shot('06-retained-manifest')
   with p.expect_download() as dl:click('[data-action="ar-download"]','Download complete retained folder bundle')
   path=o/'retained-folder.json';dl.value.save_as(str(path));bundle=json.loads(path.read_text());found={entry['payload']['filename']:base64.b64decode(entry['payload']['base64']) for entry in bundle['files']};ck('Actual bundle contains every original byte including empty file',all(found[Path(name).name]==data for name,data in expected.items()) and len(found)==3);ck('Bundle member SHA-256 independently recomputed',all(hashlib.sha256(base64.b64decode(f['payload']['base64'])).hexdigest()==f['payload']['sha256'] for f in bundle['files']));r['bundle_sha256']=hashlib.sha256(path.read_bytes()).hexdigest()
   member=p.locator('.snapshot-manifest > div').filter(has_text='notes.txt');member.locator('[data-action="open-artifact"]').click();ck('Original text still V1; HTML remains literal',p.locator('.ar-source').first.inner_text().find('Original V1')>=0 and p.locator('.ar-document script').count()==0);shot('07-original-file')
   with p.expect_download() as dl:click('[data-action="ar-download"]','Download actual original file bytes')
   path=o/'notes.txt';dl.value.save_as(str(path));ck('Actual file download preserves CRLF, Unicode and literal HTML',path.read_bytes()==expected['notes.txt']);r['file_sha256']=hashlib.sha256(path.read_bytes()).hexdigest()
  ck('No page errors or action collisions',not r['errors'] and not p.evaluate('PM56_EXT.collisions'));r['timing']=p.evaluate('()=>{cancelAnimationFrame(__b18craf);__b18cobs.disconnect();return __b18ctiming}');r['source_unchanged']=(ROOT/'index.html').read_bytes()==raw;ck('Frozen HTML unchanged',r['source_unchanged']);r['status']='pass';save()
  if rec:rec.communicate(b'q\n',timeout=15);rec=None
  b.close();b=None
 except Exception:
  r['status']='fail';r['failure']=traceback.format_exc();save();print(r['failure'],flush=True)
  if p:
   try:p.screenshot(path=str(o/'failure.png'));(o/'failure-dom.html').write_text(p.content())
   except Exception:pass
 finally:
  if rec:
   try:rec.communicate(b'q\n',timeout=15)
   except Exception:rec.kill();rec.wait()
  if b:
   try:b.close()
   except Exception:pass
  if pw:pw.stop()
  if xv:xv.terminate();xv.wait(timeout=10)
  for f in logs:f.close()
 print(r['status'],a.scenario,a.width,len(r['checks']),flush=True);return 0 if r['status']=='pass' else 1
if __name__=='__main__':raise SystemExit(main())
