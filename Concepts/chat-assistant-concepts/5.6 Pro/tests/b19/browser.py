#!/usr/bin/env python3
"""Ordinary-control B19 attachment journeys on the full frozen HTML.
Device scene uses the browser's genuine File input with external files;
sample flows are explicitly labelled fixture input, not OS enumeration.
"""
import argparse,base64,hashlib,json,os,subprocess,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--outdir',type=Path,required=True);ap.add_argument('--scenario',choices=['intake','live','folder','device'],required=True);ap.add_argument('--width',type=int,default=1440);ap.add_argument('--height',type=int,default=1000);ap.add_argument('--record',action='store_true');ap.add_argument('--variant',choices=['orbit','simple'],default='orbit');ap.add_argument('--reduced-motion',action='store_true');a=ap.parse_args();o=a.outdir.resolve();o.mkdir(parents=True,exist_ok=True);target=o/'RESULT.json'
 if target.exists():ap.error('Use a fresh directory')
 raw=(ROOT/'index.html').read_bytes();r={'status':'running','scenario':a.scenario,'width':a.width,'height':a.height,'html_sha256':hashlib.sha256(raw).hexdigest(),'driver_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'checks':[],'actions':[],'errors':[],'recorded':a.record,'variant':a.variant,'reduced_motion':a.reduced_motion,'scope':'complete generated HTML, ordinary controls; local clock and explicitly labelled fixture inputs; no provider or server claims'};xv=rec=b=p=pw=None;logs=[]
 def save():target.write_text(json.dumps(r,indent=2)+'\n')
 def ck(name,value):r['checks'].append({'name':name,'pass':bool(value)});save();assert value,name
 try:
  env=dict(os.environ)
  if a.record:
   f=open(o/'xvfb.log','w');logs.append(f);xv=subprocess.Popen(['Xvfb','-displayfd','1','-screen','0',f'{a.width}x{a.height}x24','-nolisten','tcp'],stdout=subprocess.PIPE,stderr=f,text=True);env['DISPLAY']=':'+xv.stdout.readline().strip()
  ctxkw={'viewport':{'width':a.width,'height':a.height},'accept_downloads':True}
  if a.reduced_motion:ctxkw['reduced_motion']='reduce'
  pw=sync_playwright().start()
  b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=not a.record,env=env,args=['--no-sandbox','--disable-dev-shm-usage','--start-fullscreen',f'--window-size={a.width},{a.height}','--window-position=0,0']);cx=b.new_context(**ctxkw);p=cx.new_page();p.set_default_timeout(9000);p.on('pageerror',lambda e:r['errors'].append(str(e)));p.set_content(raw.decode(),wait_until='domcontentloaded');p.wait_for_function('window.__PM56_BOOT_OK');r['browser']=b.version
  if a.record:
   cd=cx.new_cdp_session(p);win=cd.send('Browser.getWindowForTarget')['windowId'];cd.send('Browser.setWindowBounds',{'windowId':win,'bounds':{'windowState':'fullscreen'}})
  def click(sel,label=None):
   loc=p.locator(sel).filter(visible=True).first;loc.scroll_into_view_if_needed();r['actions'].append({'label':label or sel,'browser_ms':p.evaluate('performance.now()')});loc.click();p.wait_for_timeout(220 if a.record else 90);save()
  def fill(sel,value):
   loc=p.locator(sel).filter(visible=True).first;loc.fill(value);loc.press('Tab');p.wait_for_timeout(60)
  def pick(family,value,label=None):click('[data-action="sched-pick-'+family+'"]',label or 'Pick '+family);p.wait_for_timeout(250);click('.overlay-menu [data-action="shared-choice-pick"][data-value="'+value+'"]','Choose '+family+' '+value)
  def shot(name):
   p.wait_for_timeout(420);p.mouse.move(a.width-8,25);p.screenshot(path=str(o/(name+'.png')));boxes=p.evaluate("""()=>[...document.querySelectorAll('.transcript,.editor-body,.b19-guide,.att-details-dialog,.att-tray,.sched-dialog,.ar-document,.snapshot-manifest')].filter(x=>x.clientWidth&&x.clientHeight).map(x=>({class:x.className,width:x.clientWidth,scroll:x.scrollWidth}))""");r.setdefault('geometry',{})[name]=boxes;ck(name+' no horizontal overflow',bool(boxes) and all(x['scroll']<=x['width']+1 for x in boxes))
  def back():
   if a.width<=1100 and p.locator('[data-action="return-to-chat"]').filter(visible=True).count():click('[data-action="return-to-chat"]','Return to chat')
  def tray():return p.evaluate('PM56_COMPOSER_STATE.bufferFor(PM56_EXT.ctx().thread.id).attachments')
  def schedule_message():
   click('[data-action="open-menu"][data-menu="wand"]','Open composer wand')
   if not p.locator('[data-action="sched-open-message"]').filter(visible=True).count():click('[data-action="polish-wand-group"][data-group="schedule"]','Open Scheduling')
   click('[data-action="sched-open-message"]','Schedule Message')
   fill('[data-sched-input="msg-date"]','2027-05-10');fill('[data-sched-input="msg-time"]','22:00');pick('msg-tz','America/New_York');shot('03-frozen-schedule-form');click('[data-action="sched-create-message"]','Commit through shared scheduler');ck('Composer cleared after committed schedule',p.locator('[data-input="composer"]').input_value()=='');shot('04-pending-schedule');click('[data-action="sched-close-dialog"]','Close schedule manager')
  click('[data-action="open-demo"]','Open Demo Studio');p.wait_for_timeout(500);p.locator('select[data-input="variant"][data-family="2"]').filter(visible=True).first.select_option('8' if a.variant=='simple' else '1');ck('All three B19 workflows exposed',p.locator('[data-action="b19-start"]').count()==3);click('[data-action="b19-start"][data-flow="'+('folder' if a.scenario=='device' else a.scenario)+'"]','Prepare workflow, not a schedule')
  if a.record:
   p.wait_for_timeout(350);f=open(o/'ffmpeg.log','w');logs.append(f);rec=subprocess.Popen(['ffmpeg','-y','-f','x11grab','-framerate','60','-video_size',f'{a.width}x{a.height}','-i',env['DISPLAY'],'-an','-c:v','libx264','-preset','ultrafast','-crf','22','-pix_fmt','yuv420p','-fps_mode','passthrough','-enc_time_base','1:60000',str(o/'workflow.mkv')],stdin=subprocess.PIPE,stdout=f,stderr=f)
  p.evaluate("""()=>{window.__b19timing={raf:[],longTasks:[]};window.__b19obs=new PerformanceObserver(l=>__b19timing.longTasks.push(...l.getEntries().map(x=>({start:x.startTime,duration:x.duration}))));__b19obs.observe({type:'longtask'});function tick(t){__b19timing.raf.push(t);window.__b19raf=requestAnimationFrame(tick)}window.__b19raf=requestAnimationFrame(tick)}""")
  shot('01-prepared')
  if a.reduced_motion:
   ck('Reduced-motion media query honored',p.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches"))
   ck('Tracer carries no animation under reduced motion',p.evaluate("()=>{const el=document.querySelector('.att-tracer');if(!el)return true;const cs=getComputedStyle(el);return cs.animationName==='none'||cs.animationDuration==='0s'}"))
  if a.scenario=='intake':
   ck('Two samples admitted through the real intake path',len(tray())==2 and all(x.get('command')=='cmd.chat.attachment.add' for x in tray()));shot('02-intake-tray')
   fill('[data-input="composer"]','Keep this composer text through retry and removal.');text=p.locator('[data-input="composer"]').input_value()
   click('.b19-guide [data-action="b19-retry-failed"]','Retry the failed sample through its ordinary control')
   p.wait_for_function('PM56_COMPOSER_STATE.bufferFor(PM56_EXT.ctx().thread.id).attachments.every(a=>a.process_state==="ready")',timeout=15000)
   ck('Retry preserves siblings and composer text',len(tray())==2 and p.locator('[data-input="composer"]').input_value()==text);shot('02b-retried')
   second=tray()[1]['id'];p.locator(f'.att-tray .att-thumb[data-k="att-thumb:{second}"]').hover();p.wait_for_timeout(350)
   click(f'.att-tray .att-thumb[data-k="att-thumb:{second}"] .att-thumb-x','Remove one chip through its ordinary control')
   ck('Remove drops only its record',len(tray())==1 and p.locator('[data-input="composer"]').input_value()==text);shot('02c-removed')
   with p.expect_download() as dl:click('.b19-guide [data-action="b19-download-first"]','Download the ready sample')
   path=o/'sample-notes.txt';dl.value.save_as(str(path));ck('Downloaded bytes match the admitted sample',path.read_bytes()==b'alpha\nbeta\n');r['download_sha256']=hashlib.sha256(path.read_bytes()).hexdigest()
   click('[data-action="send"]','Send with the remaining attachment');p.wait_for_function('PM56_EXT.ctx().thread.messages.length>=1')
   ck('Dispatched attachment carries per-dispatch truth',p.evaluate('PM56_EXT.ctx().thread.messages[0].attachments[0].materialization.length>=1'));shot('05-sent-with-attachment')
   second=o/'second.txt';second.write_bytes(b'second adjacent message bytes')
   click('[data-action="attach"]','Open the attach picker')
   with p.expect_file_chooser() as ch2:click('[data-action="att-pick-upload"]','Attach a second file through the genuine File input')
   ch2.value.set_files(str(second));p.wait_for_function('PM56_COMPOSER_STATE.bufferFor(PM56_EXT.ctx().thread.id).attachments.every(a=>a.process_state==="ready")')
   fill('[data-input="composer"]','Second adjacent message.');click('[data-action="send"]','Send the second message')
   p.wait_for_function('PM56_EXT.ctx().thread.messages.filter(m=>m.role==="user").length===2')
   thumbs=p.locator('.message .att-msg-thumb');ck('Two adjacent message thumbs',thumbs.count()>=2)
   thumbs.nth(1).hover();p.wait_for_timeout(400)
   thumbs.nth(1).locator('.att-thumb-chrome .att-chrome-btn[aria-label="More Info"]').click();p.wait_for_timeout(300)
   ck('Real hover reveals clickable chrome between adjacent messages',p.locator('.att-details-dialog').count()==1);shot('06-adjacent-hover-details');click('[data-action="close-dialog"]','Close Details')
  elif a.scenario=='live':
   ck('Live and frozen refs admitted with command identity',len(tray())==2 and tray()[0].get('command')=='cmd.chat.attachment.add' and tray()[1].get('normalizes_to')=='cmd.chat.attachment.add')
   click('[data-action="open-demo"]','Reopen Demo Studio for theme pass');theme_sel=p.locator('select[data-input="theme"]').filter(visible=True).first;theme_vals=theme_sel.evaluate('e=>[...e.options].map(o=>o.value)');r['themes']=theme_vals
   for tv in theme_vals:theme_sel.select_option(tv);p.wait_for_timeout(150)
   ck('Every theme applies without errors',len(theme_vals)>=2 and not r['errors']);click('[data-action="close-dialog"]','Close Demo Studio');shot('02-themes-applied')
   click('.b19-guide [data-action="b19-open-live-details"]','Open live Details through its ordinary control')
   want=p.evaluate('PM56_COMPOSER_STATE.bufferFor(PM56_EXT.ctx().thread.id).attachments[0].hash');html=p.locator('.att-details-dialog').inner_text();ck('Details shows exact captured hash',(want in html));shot('03-live-details');click('[data-action="close-dialog"]','Close Details')
   click('.b19-guide [data-action="b19-simulate-drift"]','Simulate a working-tree change')
   ck('Drift badge discloses on the chip',p.locator('.att-tray .att-chip-stale').count()==1)
   drift=p.evaluate('PM56_COMPOSER_STATE.bufferFor(PM56_EXT.ctx().thread.id).attachments[0].live_drift.current_hash')
   with p.expect_download() as dl:click('.b19-guide [data-action="b19-download-stored"]','Download the stored version')
   path=o/'stored.txt';dl.value.save_as(str(path));raw_dl=path.read_bytes();ck('Stored-version download states captured hash and drift',want.encode() in raw_dl and drift.encode() in raw_dl and b'not the current working-tree content' in raw_dl);shot('04-drifted')
   fill('[data-input="composer"]','Pin this exact live reference.');click('[data-action="send"]','Send to record per-turn captures');p.wait_for_function('PM56_EXT.ctx().thread.messages.length>=1')
   ck('Per-turn capture rows recorded at send',len(p.evaluate('PM56_EXT.ctx().thread.messages[0].attachments[0].captured_turns'))>=1);shot('05-sent-live')
  else:
   expected={'notes.txt':b'# Snapshot note\r\nOriginal V1 '+ '—'.encode()+b' keep this line.\r\n<script>not executed</script>\r\n','data/numbers.bin':bytes([0,1,2,13,10,127,128,254,255]),'empty.txt':b''}
   if a.scenario=='device':
    selected=o/'SelectedFolder'
    for name,data in expected.items():path=selected/name;path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(data)
    fix0=tray()[0]['id'];p.locator(f'.att-tray .att-thumb[data-k="att-thumb:{fix0}"]').hover();p.wait_for_timeout(350)
    click(f'.att-tray .att-thumb[data-k="att-thumb:{fix0}"] .att-thumb-x','Clear the prepared fixture through its ordinary control')
    p.wait_for_function('PM56_COMPOSER_STATE.bufferFor(PM56_EXT.ctx().thread.id).attachments.length===0')
    click('[data-action="attach"]','Open the attach picker')
    with p.expect_file_chooser() as chooser:click('[data-action="att-upload-folder"]','Select actual external directory through browser File input')
    chooser.value.set_files(str(selected));p.wait_for_function('PM56_COMPOSER_STATE.bufferFor(PM56_EXT.ctx().thread.id).attachments.length===1');r['selection_source']='actual external files through File chooser'
   else:r['selection_source']='labelled generated folder fixture'
   want_total=3 if a.scenario=='device' else 6
   ck('Folder carries a bounded manifest with policies',p.evaluate('PM56_COMPOSER_STATE.bufferFor(PM56_EXT.ctx().thread.id).attachments[0].folder_manifest.totalFiles')==want_total and bool(p.evaluate('PM56_COMPOSER_STATE.bufferFor(PM56_EXT.ctx().thread.id).attachments[0].folder_manifest.entries_policy')));shot('02-folder-selection')
   click('.b19-guide [data-action="b19-open-folder-details"]','Open manifest Details');dt=p.locator('.att-details-dialog').inner_text().lower();ck('Manifest Details shows root, policies and scope','root identity' in dt and 'read scope' in dt and 'exclusions applied' in dt);shot('03-manifest-details');click('[data-action="close-dialog"]','Close Details')
   click('.b19-guide [data-action="b19-record-receipt"]','Record a materialization receipt')
   ck('Receipt identity separate from manifest',p.evaluate('PM56_COMPOSER_STATE.bufferFor(PM56_EXT.ctx().thread.id).attachments[0].receipts.length')==1)
   if a.scenario=='folder':
    fill('[data-input="composer"]','Try to schedule bytes that were never selected.')
    click('[data-action="open-menu"][data-menu="wand"]','Open composer wand')
    if not p.locator('[data-action="sched-open-message"]').filter(visible=True).count():click('[data-action="polish-wand-group"][data-group="schedule"]','Open Scheduling')
    click('[data-action="sched-open-message"]','Schedule Message')
    fill('[data-sched-input="msg-date"]','2027-05-10');fill('[data-sched-input="msg-time"]','22:00');pick('msg-tz','America/New_York')
    click('[data-action="sched-create-message"]','Attempt the commit');p.wait_for_timeout(600)
    ck('Byteless folder fixture refuses with a stated reason, composer intact','needs selected bytes' in p.locator('.sched-form-error').inner_text() and p.locator('[data-input="composer"]').input_value()!='');shot('04-honest-schedule-refusal');click('[data-action="sched-close-dialog"]','Close schedule manager')
   else:
    fill('[data-input="composer"]','Hold this exact folder.');schedule_message();ref=p.evaluate('PM56_SCHED.list().messages.at(-1).attachment_refs[0]')
    ck('Schedule binds the frozen manifest hash',bool(ref.get('folder_manifest_hash')));record=p.evaluate('ref=>PM56_ARTIFACTS.resolve(ref).revision.record',ref['snapshot_ref'])
    ck('All selected bytes retained with exact manifest',len(record['payload']['files'])==3 and ref['folder_manifest_hash']==record['payload']['manifest_sha256']);r['snapshot_ref']=ref['snapshot_ref']
    p.evaluate('()=>{const arts=PM56_DATA.artifacts;const root=PM56_ARTIFACTS.resolve(PM56_SCHED.list().messages.at(-1).attachment_refs[0].snapshot_ref).revision.record;arts.find(x=>x.id===root.payload.files[0].ref.artifact_id).revisionAvailability={1:"missing"};return true;}');r['injected']='one retained member disconnected (labelled injection, not a UI proof)'
    held=p.evaluate('()=>{const m=PM56_SCHED.list().messages.at(-1);return PM56_SCHED.dispatchMessageAt(m.scheduled_dispatch_id,Date.parse(m.scheduled_at_utc));}')
    ck('Missing member holds the dispatch naming the ref',held.get('held') and 'retained_file' in str(held.get('error')));shot('05-held-folder')
    p.evaluate('()=>{const arts=PM56_DATA.artifacts;const root=PM56_ARTIFACTS.resolve(PM56_SCHED.list().messages.at(-1).attachment_refs[0].snapshot_ref).revision.record;arts.find(x=>x.id===root.payload.files[0].ref.artifact_id).revisionAvailability={1:"available"};return true;}')
    sent=p.evaluate('()=>{const m=PM56_SCHED.list().messages.at(-1);return PM56_SCHED.dispatchMessageAt(m.scheduled_dispatch_id,Date.parse(m.scheduled_at_utc));}')
    ck('Exact original folder delivers after restore',sent.get('ok'));shot('06-delivered-folder')
    p.locator('.message .att-msg-thumb .att-msg-thumb-body').first.click();p.wait_for_timeout(400)
    ck('Retained folder opens in the shared artifact editor',p.locator('.snapshot-manifest > div').count()==3);shot('07-retained-manifest')
    with p.expect_download() as dl:click('[data-action="ar-download"]','Download complete retained folder bundle')
    path=o/'retained-folder.json';dl.value.save_as(str(path));bundle=json.loads(path.read_text());found={entry['payload']['filename']:base64.b64decode(entry['payload']['base64']) for entry in bundle['files']};ck('Actual bundle contains every original byte including empty file',all(found[Path(name).name]==data for name,data in expected.items()) and len(found)==3);r['bundle_sha256']=hashlib.sha256(path.read_bytes()).hexdigest()
  ck('No page errors or action collisions',not r['errors'] and not p.evaluate('PM56_EXT.collisions'));r['timing']=p.evaluate('()=>{cancelAnimationFrame(__b19raf);__b19obs.disconnect();return __b19timing}');r['source_unchanged']=(ROOT/'index.html').read_bytes()==raw;ck('Frozen HTML unchanged',r['source_unchanged']);r['status']='pass';save()
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
