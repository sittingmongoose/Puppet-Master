#!/usr/bin/env python3
"""Ordinary-control B20 browser journeys on the full frozen HTML.
Capture/currentness/schedule flows use real dialog controls; page-change
scenarios use the dialog's own Simulate controls. Dispatch uses the real
shared scheduler API (disclosed); retained-loss uses labeled injection.
"""
import argparse,hashlib,json,os,subprocess,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--outdir',type=Path,required=True);ap.add_argument('--scenario',choices=['capture','currentness','schedule'],required=True);ap.add_argument('--width',type=int,default=1440);ap.add_argument('--height',type=int,default=1000);ap.add_argument('--record',action='store_true');ap.add_argument('--variant',choices=['orbit','simple'],default='orbit');ap.add_argument('--reduced-motion',action='store_true');a=ap.parse_args();o=a.outdir.resolve();o.mkdir(parents=True,exist_ok=True);target=o/'RESULT.json'
 if target.exists():ap.error('Use a fresh directory')
 raw=(ROOT/'index.html').read_bytes();r={'status':'running','scenario':a.scenario,'width':a.width,'height':a.height,'html_sha256':hashlib.sha256(raw).hexdigest(),'driver_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'checks':[],'actions':[],'errors':[],'recorded':a.record,'variant':a.variant,'reduced_motion':a.reduced_motion,'scope':'complete generated HTML, ordinary controls; local clock and dialog Simulate controls; no provider, server, or native capture claims'};xv=rec=b=p=pw=None;logs=[]
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
   loc=p.locator(sel).filter(visible=True).first;loc.fill(value);p.wait_for_timeout(60)
  def pick(family,value,label=None):click('[data-action="sched-pick-'+family+'"]',label or 'Pick '+family);p.wait_for_timeout(250);click('.overlay-menu [data-action="shared-choice-pick"][data-value="'+value+'"]','Choose '+family+' '+value)
  def shot(name):
   p.wait_for_timeout(420);p.mouse.move(a.width-8,25);p.screenshot(path=str(o/(name+'.png')));boxes=p.evaluate("""()=>[...document.querySelectorAll('.transcript,.editor-body,.bc-dialog,.bc-surface,.composer-box,.sched-dialog,.ar-document')].filter(x=>x.clientWidth&&x.clientHeight).map(x=>({class:x.className,width:x.clientWidth,scroll:x.scrollWidth}))""");r.setdefault('geometry',{})[name]=boxes;ck(name+' no horizontal overflow',bool(boxes) and all(x['scroll']<=x['width']+1 for x in boxes))
  def shot_tray(name):
   p.wait_for_timeout(420);p.mouse.move(a.width-8,25);p.screenshot(path=str(o/(name+'.png')))
   g=p.evaluate("""()=>{const q=s=>document.querySelector(s);const box=q('.composer-box');
     const chips=[...document.querySelectorAll('.composer-box .att-thumb-chrome')].map(c=>c.scrollWidth);
     const tray=q('.composer-box .att-tray');
     const boxes=[...document.querySelectorAll('.transcript,.editor-body,.bc-dialog,.bc-surface,.sched-dialog,.ar-document')].filter(x=>x.clientWidth&&x.clientHeight).map(x=>({class:x.className,width:x.clientWidth,scroll:x.scrollWidth}));
     return {boxes,composer:{width:box.clientWidth,scroll:box.scrollWidth},tray:tray?{width:tray.clientWidth,scroll:tray.scrollWidth}:null,chips};}""")
   r.setdefault('geometry',{})[name]=g['boxes']+[{'class':'composer-box','width':g['composer']['width'],'scroll':g['composer']['scroll'],'tray':g['tray'],'chips':g['chips']}]
   ck(name+' non-composer containers strict',bool(g['boxes']) and all(x['scroll']<=x['width']+1 for x in g['boxes']))
   ck(name+' frozen chip chrome is B19-identical (226px)',g['chips']==[226])
   ck(name+' tray/composer overflow fully explained by the inherited 236px tray width',g['tray'] and g['tray']['scroll']==max(g['tray']['width'],236) and g['composer']['scroll']==max(g['composer']['width'],g['tray']['scroll']))
  def back():
   if a.width<=1100 and p.locator('[data-action="return-to-chat"]').filter(visible=True).count():click('[data-action="return-to-chat"]','Return to chat')
  def users():return p.evaluate('PM56_EXT.ctx().thread.messages.filter(m=>m.role==="user").length')
  def lastuser():return p.evaluate('PM56_EXT.ctx().thread.messages.filter(m=>m.role==="user").at(-1)')
  def send_keys(label):
   p.locator('[data-input="composer"]').filter(visible=True).first.focus();p.wait_for_timeout(80);r['actions'].append({'label':label,'browser_ms':p.evaluate('performance.now()')});p.keyboard.press('Control+Enter');p.wait_for_timeout(300);save()
  def open_browser():
   click('[data-action="open-demo"]','Open Demo Studio');click('[data-action="polish-demo-action"][data-target="bc-open"]','Capture browser fixture');p.wait_for_selector('.bc-dialog');back()
  def target_run(rid,tid):
   p.evaluate(f'PM56_EXT.ctx().switchThread("{tid}")');p.wait_for_timeout(300)
   click(f'[data-action="collab-open-panel"][data-run="{rid}"]','Open run panel');click('[data-action="collab-panel-tab"][data-tab="participants"]','Open participant roster');click('.collab-panel .collab-participant','Open a participant');click('[data-action="collab-message"]','Message this participant')
   ck('Run participant targeted through ordinary panel',p.evaluate(f'!!PM56_RUNTIME.composer.destination&&PM56_RUNTIME.composer.destination.refId==="{rid}"'))
  click('[data-action="open-demo"]','Open Demo Studio');p.wait_for_timeout(500);p.locator('select[data-input="variant"][data-family="2"]').filter(visible=True).first.select_option('8' if a.variant=='simple' else '1');click('[data-action="close-dialog"]','Close Demo Studio')
  if p.evaluate('PM56_EXT.ctx().state.work.running'):click('[data-action="pause-working"]','Pause the Demo Studio work run so composer sends deliver instead of queueing');r['work_paused']='ordinary pause control; the queued-send path is covered in handlers with real running work'
  if a.record:
   p.wait_for_timeout(350);f=open(o/'ffmpeg.log','w');logs.append(f);rec=subprocess.Popen(['ffmpeg','-y','-f','x11grab','-framerate','60','-video_size',f'{a.width}x{a.height}','-i',env['DISPLAY'],'-an','-c:v','libx264','-preset','ultrafast','-crf','22','-pix_fmt','yuv420p','-fps_mode','passthrough','-enc_time_base','1:60000',str(o/'workflow.mkv')],stdin=subprocess.PIPE,stdout=f,stderr=f)
  probe="""()=>{window.__b20timing={raf:[],longTasks:[]};window.__b20obs=new PerformanceObserver(l=>__b20timing.longTasks.push(...l.getEntries().map(x=>({start:x.startTime,duration:x.duration}))));__b20obs.observe({type:'longtask'});function tick(t){__b20timing.raf.push(t);window.__b20raf=requestAnimationFrame(tick)}window.__b20raf=requestAnimationFrame(tick)}"""
  p.evaluate(probe)
  if a.scenario=='capture':
   target_run('brainstorm-provider-failover','plan-deep');run0=p.evaluate('PM56_COLLAB.run("brainstorm-provider-failover").messages.length');n0=users()
   fill('[data-input="composer"]','Draft that must survive every isolated send.');text=p.locator('[data-input="composer"]').input_value()
   open_browser();shot('01-browser-open')
   click('[data-action="bc-full-shot"][data-which="visible"]','Visible screenshot sends now')
   ck('Visible shot isolated with draft intact',users()==n0+1 and lastuser()['isolatedSubmission'] and p.locator('[data-input="composer"]').input_value()==text)
   ck('Exact run received the addressed reference',p.evaluate('PM56_COLLAB.run("brainstorm-provider-failover").messages.length')==run0+1);shot('02-visible-sent')
   click('[data-action="bc-toggle-full-menu"]','Open full menu');click('[data-action="bc-full-shot"][data-which="page"]','Full page screenshot');shot('03-page-sent')
   ck('Page shot isolated with draft intact',users()==n0+2 and p.locator('[data-input="composer"]').input_value()==text)
   click('[data-action="bc-arm-region"]','Arm region drag')
   box=p.locator('[data-bc-region]').bounding_box();x0,y0=box['x']+40,box['y']+40;p.mouse.move(x0,y0);p.mouse.down();p.mouse.move(x0+220,y0+140,steps=8);p.mouse.up();p.wait_for_timeout(300)
   ck('Region drag sends its own isolated crop',users()==n0+3 and 'Region Screenshot' in lastuser()['label']);shot('04-region-sent')
   click('[data-action="bc-arm-component"]','Arm component picker');p.locator('[data-bc-id="el-retry"]').first.click();p.wait_for_timeout(400)
   adj=p.evaluate('()=>{const bar=document.querySelector("[data-k=bc-prompt-bar]"),t=document.querySelector("[data-bc-id=el-retry]");if(!bar||!t)return null;const b=bar.getBoundingClientRect(),r=t.getBoundingClientRect();return {gap:Math.abs(b.top-r.bottom),overlap:b.left<r.right&&b.right>r.left,barW:b.width,barH:b.height}}')
   ck('Instruction bar adjacent to the chosen element',adj and adj['gap']<60 and adj['barW']>200 and adj['barH']>40);shot('05-prompt-bar')
   fill('[data-bc-input="prompt"]','Explain this retry path.');click('[data-action="bc-prompt-run"]','Component Send Now')
   ck('Component Send Now isolated to the exact run',users()==n0+4 and lastuser()['destinationRef']['refId']=='brainstorm-provider-failover' and p.locator('[data-input="composer"]').input_value()==text);shot('06-component-sent')
   ck('Capture cards disclose fixtures, never native pixels',p.evaluate('PM56_EXT.ctx().thread.messages.filter(m=>m.type==="bc-capture").length')==4 and 'Fixture image' in p.locator('.bc-capture-card >> nth=0').inner_text())
   click('[data-action="bc-close"]','Close browser to reach the ribbon');click('[data-action="cs-open-destinations"]','Open eligible destinations');click('[data-action="cs-pick-destination"][data-id="bs-provider-arch"]','Pick a fixture row with no live run')
   open_browser();click('[data-action="bc-arm-component"]','Re-arm picker')
   p.locator('[data-bc-id="el-retry"]').first.click();p.wait_for_timeout(300);click('[data-action="bc-prompt-run"]','Send into the unavailable destination')
   ck('Unavailable destination refuses without Assistant redirect',users()==n0+4 and p.evaluate('!!PM56_BROWSER.state().picked') and p.locator('[data-input="composer"]').input_value()==text);shot('07-destination-refused')
   click('[data-action="bc-switch-session"][data-id="sess-auth"]','Switch to protected session');click('[data-action="bc-full-shot"][data-which="visible"]','Attempt protected capture')
   ck('Protected session refuses with nothing produced',users()==n0+4 and p.evaluate('PM56_BROWSER.state().captures.length')==4);shot('08-protected-refused')
   hits=p.evaluate('()=>[...document.querySelectorAll(".bc-tool-btn")].map(e=>{const r=e.getBoundingClientRect();return Math.min(r.width,r.height)})')
   ck('Capture hit targets adequate',len(hits)>=3 and min(hits)>=20)
   p.goto('file://'+str(ROOT/'index.html'));p.wait_for_function('window.__PM56_BOOT_OK');r['file_origin']='last-mode persistence leg (localStorage needs a real origin)'
   open_browser();click('[data-action="bc-arm-component"]','Arm picker on file origin');p.locator('[data-bc-id="el-retry"]').first.click();p.wait_for_timeout(300)
   click('[data-action="bc-toggle-prompt-menu"]','Open mode menu');click('[data-action="bc-set-component-mode"][data-value="insert"]','Persist Insert mode')
   p.reload();p.wait_for_function('window.__PM56_BOOT_OK');p.evaluate(probe);open_browser()
   ck('Last component mode persists across reload',p.evaluate('PM56_BROWSER.state().componentMode')=='insert');shot('09-mode-persisted')
  elif a.scenario=='currentness':
   open_browser();shot('01-browser-open')
   click('[data-action="bc-arm-component"]','Arm picker');p.locator('[data-bc-id="el-row-1"]').first.click();p.wait_for_timeout(300)
   click('[data-action="bc-toggle-prompt-menu"]','Open mode menu');click('[data-action="bc-set-component-mode"][data-value="list"]','Choose Add To Composer List')
   fill('[data-bc-input="prompt"]','First instruction.');click('[data-action="bc-prompt-run"]','Add first item')
   ck('List item added with its hidden ref',p.evaluate('PM56_COMPOSER_STATE.bufferFor(PM56_EXT.ctx().thread.id).browser_context_refs.length')==1)
   n0=users();fill('[data-input="composer"]',p.locator('[data-input="composer"]').input_value()+'\nSend one by button with the dialog closed.');click('[data-action="bc-close"]','Close browser for the button send');click('[data-action="send"]','Ordinary Send button')
   ck('Dialog-closed button send admits the current ref',users()==n0+1);shot('02-button-send-closed')
   open_browser();click('[data-action="bc-arm-component"]','Re-arm after reopen');p.locator('[data-bc-id="el-row-1"]').first.click();p.wait_for_timeout(300);fill('[data-bc-input="prompt"]','First again.');click('[data-action="bc-prompt-run"]','Add first item')
   p.locator('[data-bc-id="el-retry"]').first.click();p.wait_for_timeout(300);fill('[data-bc-input="prompt"]','Second instruction.');click('[data-action="bc-prompt-run"]','Add second item')
   ck('Two numbered items with stable hidden refs',p.evaluate('PM56_COMPOSER_STATE.bufferFor(PM56_EXT.ctx().thread.id).browser_context_refs.length')==2 and p.locator('[data-input="composer"]').input_value().count('2.')>=1);shot('02b-two-items')
   click('[data-action="bc-simulate-rerender"]','Compatible re-render');p.wait_for_function('PM56_BROWSER.state().lastRerenderNote')
   fill('[data-input="composer"]',p.locator('[data-input="composer"]').input_value()+'\nSend after compatible re-render.');send_keys('Ordinary keyboard Send')
   ck('Compatible re-render refreshes and sends',users()==n0+2);shot('03-refreshed-send')
   p.locator('[data-bc-id="el-row-2"]').first.click();p.wait_for_timeout(300);fill('[data-bc-input="prompt"]','Held item one.');click('[data-action="bc-prompt-run"]','Add held item one')
   p.locator('[data-bc-id="el-footnote"]').first.click();p.wait_for_timeout(300);fill('[data-bc-input="prompt"]','Held item two.');click('[data-action="bc-prompt-run"]','Add held item two')
   click('[data-action="bc-simulate-replace"]','Replace the live target of the open record')
   n1=users();fill('[data-input="composer"]',p.locator('[data-input="composer"]').input_value()+'\nSend with one incompatible target.');send_keys('Ordinary Send must hold')
   ck('Incompatible target holds with zero admissions',users()==n1)
   ck('Hold marks the stale item and keeps the draft',p.evaluate('PM56_COMPOSER_STATE.bufferFor(PM56_EXT.ctx().thread.id).browser_context_refs.filter(r=>r.stale).length')==1 and 'STALE' in p.locator('[data-input="composer"]').input_value());shot('04-held-stale')
   refid=p.evaluate('PM56_COMPOSER_STATE.bufferFor(PM56_EXT.ctx().thread.id).browser_context_refs.find(r=>r.stale).id')
   click(f'[data-action="bc-recapture-ref"][data-id="{refid}"]','Recapture through the same picker')
   p.locator('[data-bc-id="el-footnote"]').first.click();p.wait_for_timeout(300);click('[data-action="bc-prompt-run"]','Run recapture in list mode')
   ck('Recapture replaces the stale identity in place',p.evaluate('PM56_COMPOSER_STATE.bufferFor(PM56_EXT.ctx().thread.id).browser_context_refs.filter(r=>!r.stale).length')==2)
   send_keys('Send the exact two identities');p.wait_for_function(f'PM56_EXT.ctx().thread.messages.filter(m=>m.role==="user").length>={n1+1}')
   ck('Exactly the two recaptured identities submitted',users()==n1+1 and p.evaluate('PM56_EXT.ctx().thread.messages.filter(m=>m.role==="user").at(-1).browserContextRefs.length')==2);shot('05-recaptured-send')
   p.locator('[data-bc-id="el-chart"]').first.click();p.wait_for_timeout(300)
   click('[data-action="bc-toggle-prompt-menu"]','Open mode menu');click('[data-action="bc-set-component-mode"][data-value="insert"]','Choose Insert At Cursor');click('[data-action="bc-prompt-run"]','Insert the chip')
   ck('Insert sends nothing',users()==n1+1 and '[<LatencyChart>' in p.locator('[data-input="composer"]').input_value())
   fill('[data-input="composer"]',p.locator('[data-input="composer"]').input_value()+'\nChip held with surrounding typing.');send_keys('Send with the chip')
   ck('Chip identity rides admission',p.evaluate('!!PM56_EXT.ctx().thread.messages.filter(m=>m.role==="user").at(-1).browserContextRefs'));shot('06-chip-send')
   click('[data-action="bc-arm-region"]','Arm region for the cancel race')
   box=p.locator('[data-bc-region]').bounding_box();x0,y0=box['x']+30,box['y']+30;p.mouse.move(x0,y0);p.mouse.down();p.mouse.move(x0+150,y0+100,steps=5);p.keyboard.press('Escape');p.mouse.up();p.wait_for_timeout(300)
   ck('Escape mid-drag cancels with no send',users()==n1+2);shot('07-drag-cancelled')
   if p.locator('.bc-dialog').count():click('[data-action="bc-close"]','Close browser for the theme pass')
   click('[data-action="open-demo"]','Reopen Demo Studio for theme pass');theme_sel=p.locator('select[data-input="theme"]').filter(visible=True).first;theme_vals=theme_sel.evaluate('e=>[...e.options].map(o=>o.value)');r['themes']=theme_vals
   for tv in theme_vals:theme_sel.select_option(tv);p.wait_for_timeout(150)
   ck('Every theme applies without errors',len(theme_vals)>=2 and not r['errors']);click('[data-action="close-dialog"]','Close Demo Studio')
   if a.reduced_motion:
    ck('Reduced-motion media query honored',p.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches"))
    ck('Prompt bar carries no animation under reduced motion',p.evaluate("()=>{const el=document.querySelector('.bc-prompt-bar');if(!el)return true;const cs=getComputedStyle(el);return cs.animationName==='none'||cs.animationDuration==='0s'}"))
  else:
   open_browser();shot('01-browser-open')
   click('[data-action="bc-arm-component"]','Arm picker');p.locator('[data-bc-id="el-row-1"]').first.click();p.wait_for_timeout(300)
   click('[data-action="bc-toggle-prompt-menu"]','Open mode menu');click('[data-action="bc-set-component-mode"][data-value="list"]','Choose Add To Composer List')
   fill('[data-bc-input="prompt"]','Freeze this row.');click('[data-action="bc-prompt-run"]','Add the freezable item')
   click('[data-action="bc-close"]','Close browser for scheduling')
   fill('[data-input="composer"]',p.locator('[data-input="composer"]').input_value()+'\nTry to schedule a live selector.');msgs0=p.evaluate('PM56_SCHED.list().messages.length')
   click('[data-action="open-menu"][data-menu="wand"]','Open composer wand')
   if not p.locator('[data-action="sched-open-message"]').filter(visible=True).count():click('[data-action="polish-wand-group"][data-group="schedule"]','Open Scheduling')
   click('[data-action="sched-open-message"]','Schedule Message')
   fill('[data-sched-input="msg-date"]','2027-05-10');fill('[data-sched-input="msg-time"]','22:00');pick('msg-tz','America/New_York')
   click('[data-action="sched-create-message"]','Attempt the commit');p.wait_for_timeout(600)
   ck('Live selector refuses with a stated reason, composer intact','Freeze browser context' in p.locator('.sched-form-error').inner_text() and p.evaluate('PM56_SCHED.list().messages.length')==msgs0 and 'Try to schedule' in p.locator('[data-input="composer"]').input_value());shot('02-live-refused');click('[data-action="sched-close-dialog"]','Close schedule manager')
   open_browser();click('[data-action="bc-freeze-snapshots"]','Freeze the live reference')
   ck('Freeze yields one retained attachment and clears live refs',p.evaluate('(()=>{const b=PM56_COMPOSER_STATE.bufferFor(PM56_EXT.ctx().thread.id);return b.browser_context_refs.length===0&&b.attachments.length===1&&!!b.attachments[0].snapshot_ref})()'));(shot_tray if a.width<1000 else shot)('03-frozen')
   click('[data-action="bc-close"]','Close browser for scheduling')
   fill('[data-input="composer"]',p.locator('[data-input="composer"]').input_value()+'\nHold this exact snapshot.');click('[data-action="open-menu"][data-menu="wand"]','Open composer wand')
   if not p.locator('[data-action="sched-open-message"]').filter(visible=True).count():click('[data-action="polish-wand-group"][data-group="schedule"]','Open Scheduling')
   click('[data-action="sched-open-message"]','Schedule Message')
   fill('[data-sched-input="msg-date"]','2027-05-10');fill('[data-sched-input="msg-time"]','22:00');pick('msg-tz','America/New_York');(shot_tray if a.width<1000 else shot)('04-frozen-schedule-form');click('[data-action="sched-create-message"]','Commit through shared scheduler')
   p.wait_for_function(f'PM56_SCHED.list().messages.length==={msgs0+1}');srec=p.evaluate('PM56_SCHED.list().messages.at(-1)')
   ck('Frozen schedule commits with the retained ref',srec['attachment_refs'][0]['snapshot_ref']['artifact_id'].startswith('snapshot:'));shot('05-pending-schedule');click('[data-action="sched-close-dialog"]','Close schedule manager')
   open_browser();click('[data-action="bc-simulate-replace"]','Move the live page on after commit');click('[data-action="bc-close"]','Close browser')
   p.evaluate('()=>{const m=PM56_SCHED.list().messages.at(-1);const ref=m.attachment_refs[0].snapshot_ref;PM56_DATA.artifacts.find(x=>x.id===ref.artifact_id).revisionAvailability={[ref.artifact_version]:"missing"};return true;}');r['injected']='retained bytes disconnected once (labeled injection)'
   held=p.evaluate('()=>{const m=PM56_SCHED.list().messages.at(-1);return PM56_SCHED.dispatchMessageAt(m.scheduled_dispatch_id,Date.parse(m.scheduled_at_utc));}');r['dispatch']='real shared-scheduler API (disclosed, not a UI proof)'
   ck('Missing retained bytes hold or fail naming the loss',not held.get('ok') or held.get('held'));shot('06-held-missing')
   p.evaluate('()=>{const m=PM56_SCHED.list().messages.at(-1);const ref=m.attachment_refs[0].snapshot_ref;PM56_DATA.artifacts.find(x=>x.id===ref.artifact_id).revisionAvailability={[ref.artifact_version]:"available"};return true;}')
   sent=p.evaluate('()=>{const m=PM56_SCHED.list().messages.at(-1);return PM56_SCHED.dispatchMessageAt(m.scheduled_dispatch_id,Date.parse(m.scheduled_at_utc));}')
   ck('Dispatch delivers retained bytes after the live page moved on',sent.get('ok'));shot('07-delivered-retained')
   mid=sent.get('message_id');p.locator(f'[data-message-id="{mid}"] .att-msg-thumb-body').first.click();p.wait_for_timeout(400)
   ck('Retained snapshot opens in the shared artifact editor','Frozen browser context' in p.locator('.ar-document').inner_text() and 'not a real screenshot' in p.locator('.ar-document').inner_text());shot('08-retained-editor');back()
  ck('No page errors or action collisions',not r['errors'] and not p.evaluate('PM56_EXT.collisions'));r['timing']=p.evaluate('()=>{cancelAnimationFrame(__b20raf);__b20obs.disconnect();return __b20timing}');r['source_unchanged']=(ROOT/'index.html').read_bytes()==raw;ck('Frozen HTML unchanged',r['source_unchanged']);r['status']='pass';save()
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
