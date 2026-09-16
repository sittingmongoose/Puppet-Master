#!/usr/bin/env python3
"""Ordinary controls on complete frozen HTML. External evidence only.
PDF test materializes the actual popup's print document; it does not claim the
application itself saved a PDF. Video media inside the Plan is fixture content,
not this driver's final workflow capture.
"""
import argparse,hashlib,json,os,statistics,subprocess,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--outdir',type=Path,required=True);ap.add_argument('--scenario',choices=['recovery','documents','revision'],required=True);ap.add_argument('--width',type=int,default=1440);ap.add_argument('--height',type=int,default=1000);ap.add_argument('--record',action='store_true');ap.add_argument('--variant',choices=['orbit','simple'],default='orbit');ap.add_argument('--dwell',type=int,default=100);a=ap.parse_args();o=a.outdir.resolve();o.mkdir(parents=True,exist_ok=True);target=o/'RESULT.json'
 if target.exists():ap.error('Use a fresh directory')
 raw=(ROOT/'index.html').read_bytes();r={'status':'running','scenario':a.scenario,'viewport':{'width':a.width,'height':a.height},'html_sha256':hashlib.sha256(raw).hexdigest(),'loading':'complete standalone via set_content; no durable-origin restart proof','checks':[],'actions':[],'errors':[],'recorded':a.record,'variant':a.variant};p=b=xv=rec=None;logs=[]
 def save():target.write_text(json.dumps(r,indent=2)+'\n')
 def ck(n,v):
  r['checks'].append({'name':n,'pass':bool(v)});save()
  if not v and p:
   try:p.screenshot(path=str(o/'failure.png'));(o/'failure-dom.html').write_text(p.content())
   except Exception:pass
  assert v,n
 try:
  env=dict(os.environ)
  if a.record:
   f=open(o/'xvfb.log','w');logs.append(f);xv=subprocess.Popen(['Xvfb','-displayfd','1','-screen','0',f'{a.width}x{a.height}x24','-nolisten','tcp'],stdout=subprocess.PIPE,stderr=f,text=True);env['DISPLAY']=':'+xv.stdout.readline().strip()
  with sync_playwright() as pw:
   b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=not a.record,env=env,args=['--no-sandbox','--disable-dev-shm-usage','--start-fullscreen',f'--window-size={a.width},{a.height}','--window-position=0,0']);cx=b.new_context(viewport=r['viewport'],accept_downloads=True);p=cx.new_page();p.set_default_timeout(9000);p.on('pageerror',lambda e:r['errors'].append(str(e)));p.set_content(raw.decode(),wait_until='domcontentloaded');p.wait_for_function('window.__PM56_BOOT_OK');r['browser']=b.version
   if a.record:
    cd=cx.new_cdp_session(p);win=cd.send('Browser.getWindowForTarget')['windowId'];cd.send('Browser.setWindowBounds',{'windowId':win,'bounds':{'windowState':'fullscreen'}})
   def click(sel,label=None,dwell=None):
    loc=p.locator(sel).filter(visible=True).first;loc.scroll_into_view_if_needed();r['actions'].append({'label':label or sel,'browser_ms':p.evaluate('performance.now()')});loc.click();p.wait_for_timeout(a.dwell if dwell is None else dwell)
   def shot(name):p.mouse.move(a.width-10,30);p.screenshot(path=str(o/(name+'.png')))
   def w():return p.evaluate('PM56_B17_WORK.snapshot()')
   def plan():return p.evaluate('PM56_PLANS.get(PM56_B17_WORK.snapshot().planId)')
   def back():
    if a.width<=1100 and p.locator('[data-action="return-to-chat"]').filter(visible=True).count():click('[data-action="return-to-chat"]','Return from document to chat')
   def openplan():
    back();click('[data-action="pd-info"], [data-action="pd-expand"]','Open exact Plan in editor')
   def more():
    if p.locator('.editor-body [data-action="pd-inspect"]').filter(visible=True).count()==0:click('.editor-body [data-action="pd-more-actions"]','Open Plan secondary controls')
   def export(kind,fmt,name):
    more();click('.editor-body [data-action="pd-export"]','Open shared export control')
    with p.expect_download() as dl:click(f'[data-action="pd-export-do"][data-kind="{kind}"][data-format="{fmt}"]',f'Export {kind} as {fmt}')
    path=o/name;dl.value.save_as(str(path));click('[data-action="pd-dlg-close"]','Close export receipt');return path
   def geometry(label):
    data=p.evaluate('''()=>[...document.querySelectorAll('.transcript,.editor-body,.b17-workspace,.pd-card,.pd-md,.pd-dialog,.ar-document')].filter(e=>e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0).map(e=>({class:e.className,client:e.clientWidth,scroll:e.scrollWidth}))''');r.setdefault('geometry',{})[label]=data;ck(label+' has no horizontal content overflow',bool(data) and all(x['scroll']<=x['client']+1 for x in data))
   click('[data-action="open-demo"]','Open Demo Studio');p.locator('select[data-input="variant"][data-family="2"]').first.select_option('8' if a.variant=='simple' else '1');ck('Both Batch 17 workflows are exposed',p.locator('[data-action="b17-start"]').count()==2)
   click('[data-action="b17-start"][data-flow="'+('documents' if a.scenario=='documents' else 'recovery')+'"]','Prepare local inputs, not execution');ck('No Plan or attempt before Send',w()['planId'] is None and not w()['attempts'])
   if a.record:
    p.wait_for_timeout(500);f=open(o/'ffmpeg.log','w');logs.append(f);rec=subprocess.Popen(['ffmpeg','-y','-f','x11grab','-framerate','60','-video_size',f'{a.width}x{a.height}','-i',env['DISPLAY'],'-an','-c:v','libx264','-preset','ultrafast','-crf','22','-pix_fmt','yuv420p','-fps_mode','passthrough','-enc_time_base','1:60000',str(o/'workflow.mkv')],stdin=subprocess.PIPE,stdout=f,stderr=f)
   p.evaluate('''()=>{window.__timing={raf:[],longTasks:[],start:performance.now()};window.__obs=new PerformanceObserver(l=>__timing.longTasks.push(...l.getEntries().map(x=>({start:x.startTime,duration:x.duration}))));__obs.observe({type:'longtask'});function tick(t){__timing.raf.push(t);window.__raf=requestAnimationFrame(tick)}window.__raf=requestAnimationFrame(tick)}''')
   shot('01-prepared');click('[data-action="send"]','Send through the ordinary composer');ck('Plan exists without implicit Build or Goal',plan()['status']=='ready' and not w()['attempts'] and p.evaluate('PM56_GOAL.get()') is None)
   md=p.evaluate('PM56_PLANS.markdown(PM56_B17_WORK.snapshot().planId)');ph=p.evaluate('PM56_PLANS.hash(PM56_B17_WORK.snapshot().planId)');r['initial_markdown_sha256']=hashlib.sha256(md.encode()).hexdigest();r['initial_plan_hash']=ph;openplan();geometry('ready Plan');shot('02-plan-ready')
   # Reopening the ordinary title must deduplicate the same editor identity.
   tabs=p.evaluate('PM56_EXT.ctx().state.editorTabs');openplan();ck('Repeated Plan navigation creates no duplicate tab',p.evaluate('PM56_EXT.ctx().state.editorTabs')==tabs)
   if a.scenario in ['recovery','revision']:
    click('.editor-body [data-action="pd-build"]','Approve and Build this exact version')
    p.wait_for_function('PM56_PLANS.get(PM56_B17_WORK.snapshot().planId).attention?.kind==="failed"',timeout=20000)
    ck('A real failed lookup keeps Building as primary control',plan()['status']=='building' and w()['failure']['reason']=='rate_input_disconnected' and p.locator('.editor-body .pd-build').inner_text()=='Building…');ck('Only normalization completed before failure',list(w()['outputs'])==['normalize']);run=plan()['approved']['plan_run_id'];normalized=w()['outputs']['normalize'];geometry('failed Plan');shot('03-actual-failure')
    if a.scenario=='recovery':
     click('.editor-body [data-action="pd-attn"][data-value="retry"]','Retry before repairing input is refused');ck('Unrepaired Retry does not mint an attempt',len(w()['attempts'])==2 and w()['failure'] is not None)
     back();click('[data-action="b17-open"]','Open supplied-input workspace');geometry('workspace');shot('04-repair-workspace');click('[data-action="b17-reconnect"]','Reconnect the original retained V1 input');click('[data-action="b17-open-plan"]','Return to the same Plan');click('.editor-body [data-action="pd-attn"][data-value="retry"]','Retry through the Plan recovery owner');ck('Retry admits attempt 2 without changing normalized output',len(w()['attempts'])==3 and w()['attempts'][-1]['attempt_id']=='attempt2' and w()['outputs']['normalize']==normalized);shot('05-retry-admitted')
     p.wait_for_function('PM56_PLANS.get(PM56_B17_WORK.snapshot().planId).status==="completed"',timeout=22000);ck('Completed result uses the original PlanRun',plan()['approved']['plan_run_id']==run and p.locator('.editor-body .pd-build').inner_text()=='Completed');ck('All outcomes have accepted evidence',p.evaluate('PM56_TODOS.outcomeSummary(PM56_EXT.ctx().thread.id,PM56_PLANS.get(PM56_B17_WORK.snapshot().planId).requiredTodoIds).ok'))
     shot('06-completed');more();click('.editor-body [data-action="pd-open-todos"]','Inspect inline completed To-Dos');ck('Three ordinary completed leaves, no separate Done group',len(p.evaluate('PM56_TODOS.get()'))==3 and p.locator('.todo-title.is-struck').count()==3);geometry('completed To-Dos');shot('07-completed-todos');openplan()
     path=export('execution_report','bundle','execution-report.json');report=json.loads(path.read_text());ck('Report preserves exact Plan and run identity',report['plan_run_id']==run and report['plan_hash']==ph)
     back();click('[data-action="b17-open"]','Inspect exact computed outputs');click('.b17-outputs section:nth-child(2) [data-action="open-artifact"]','Open retained total artifact');ck('Actual computed total is 9532 cents',p.locator('.ar-source').first.inner_text().find('9532')>=0)
     with p.expect_download() as dl:click('[data-action="ar-download"]','Download the exact total revision')
     path=o/'computed-total.json';dl.value.save_as(str(path));result=json.loads(path.read_text());ck('Downloaded bytes contain independently expected total and 3 rows',result['total_cents']=='9532' and len(result['lines'])==3);r['result_sha256']=hashlib.sha256(path.read_bytes()).hexdigest();shot('08-exact-output');openplan();ck('Approved bytes unchanged by failure and recovery',p.evaluate('PM56_PLANS.markdown(PM56_B17_WORK.snapshot().planId)')==md and p.evaluate('PM56_PLANS.hash(PM56_B17_WORK.snapshot().planId)')==ph)
    else:
     more();ck('Direct Revise is not offered during in-flight work',p.locator('.editor-body [data-action="pd-revise"]').count()==0);click('.editor-body [data-action="pd-stop-revise"]','Stop active execution before revising');ck('Safe stop keeps Building while fencing the old run and targeting ordinary composer',plan()['status']=='building' and plan()['attention']['kind']=='paused' and p.evaluate('PM56_PLANS.buildLabel(PM56_B17_WORK.snapshot().planId)')=='Building…' and p.evaluate('PM56_RUNTIME.composer.destination.kind')=='plan-revision');back();p.locator('[data-input="composer"]').fill('Include a note that disconnected inputs need explicit reconnection before Retry.');click('[data-action="send"]','Request the new document revision');ck('New V2 preserves V1 and does not auto-build',plan()['version']==2 and plan()['status']=='ready' and len(plan()['revisions'])==2);openplan();shot('04-revised-v2');more();click('.editor-body [data-action="pd-inspect"]','Inspect version history');geometry('version history');shot('05-history');click('[data-action="open-artifact"][data-version="1"]','Open original V1 by retained identity');
     # This navigation intentionally closes the originating modal.
     if p.locator('[data-action="pd-dlg-close"]').filter(visible=True).count():click('[data-action="pd-dlg-close"]','Close originating history modal')
     ck('Original V1 opens without V2 revision note',p.locator('.ar-document').count()==1 and 'V2 incorporates' not in p.locator('.ar-document').inner_text());geometry('retained V1');shot('06-retained-v1');openplan();more();click('.editor-body [data-action="pd-cancel"]','Explicitly cancel unfinished V2');ck('Canceled control remains terminal after old timer interval',plan()['status']=='canceled');p.wait_for_timeout(1500);ck('No old callback admitted after stop/revise/cancel',list(w()['outputs'])==['normalize'] and plan()['status']=='canceled');shot('07-canceled')
   else:
    # Exercise the retained full renderer set with ordinary view controls.
    ck('Every frozen embed remains in full Rich view',p.locator('.editor-body .pd-embed-real').count()==10)
    ck('No Plan editor or contenteditable body exists',p.locator('.pd-rich [contenteditable="true"]').count()==0)
    p.locator('.editor-body .ar-graph-svg').first.scroll_into_view_if_needed();shot('03-graph');geometry('graph document')
    frame=p.frame_locator('.editor-body iframe.ar-interactive');frame.locator('#filter').fill('A-002');ck('Isolated table filter actually changes retained rows',frame.locator('#rows tr').count()==1 and frame.locator('#rows').inner_text().startswith('A-002'));p.locator('.editor-body iframe.ar-interactive').scroll_into_view_if_needed();shot('04-interactive');ck('Frame has script capability but no same-origin or navigation grants',p.locator('.editor-body iframe.ar-interactive').get_attribute('sandbox')=='allow-scripts')
    p.locator('.editor-body video').scroll_into_view_if_needed();p.locator('.editor-body video').evaluate('v=>v.play()');p.wait_for_timeout(300);ck('Retained video decodes and plays',p.locator('.editor-body video').evaluate('v=>v.currentTime>0&&v.videoWidth>0'));p.locator('.editor-body video').evaluate('v=>v.pause()');shot('05-media');ck('Reference image decoded',p.locator('.editor-body .ar-image').evaluate('x=>x.complete&&x.naturalWidth>0'))
    click('.editor-body [data-action="pd-view"][data-value="markdown"]','Switch to the same read-only Markdown');ck('Markdown is the exact structured revision serialization',p.locator('.editor-body .pd-md pre').text_content()==md);geometry('Markdown');shot('06-markdown');path=export('plan_document','markdown','plan-v1.md');ck('Downloaded Markdown is byte-identical',path.read_bytes()==md.encode());click('.editor-body [data-action="pd-view"][data-value="rich"]','Return to Rich Text');
    back();click('[data-action="b17-open"]','Open source workspace');click('[data-action="b17-source-v2"]','Publish distinct source V2');ck('V2 source publication does not change approved Plan',p.evaluate('PM56_PLANS.markdown(PM56_B17_WORK.snapshot().planId)')==md and p.evaluate('PM56_PLANS.hash(PM56_B17_WORK.snapshot().planId)')==ph);click('[data-action="b17-open-plan"]','Return to exact Plan V1');
    table=p.locator('.editor-body .pd-embed-real[data-block-id$=":rows"]');table.locator('[data-action="open-artifact"]').click();ck('Embed opens retained V1 despite newer V2',p.locator('.ar-document').get_attribute('data-artifact-version')=='1' and 'NEW-V2' not in p.locator('.ar-document').inner_text());shot('07-open-v1');openplan();
    more();click('.editor-body [data-action="pd-export"]','Open PDF document export');
    with p.expect_popup() as pp:click('[data-action="pd-export-do"][data-kind="plan_document"][data-format="pdf"]','Open the actual browser print document')
    popup=pp.value;popup.wait_for_load_state('domcontentloaded');popup.wait_for_function('Array.from(document.images).every(i=>i.complete)');popup.pdf(path=str(o/'approved-plan.pdf'),print_background=True,prefer_css_page_size=True);print_html=popup.content();(o/'print-document.html').write_text(print_html);text=popup.locator('body').inner_text();r['pdf_print_text']=text;ck('PDF path uses static fallbacks, no iframe/video',popup.locator('iframe,video,script').count()==0 and 'Interactive table · static fallback' in text and 'Video · static fallback' in text);ck('Print keeps exact V1 data and explicit unavailable attachment',all(x in text for x in ['A-001','A-002','A-003','Unavailable research attachment','missing']) and 'NEW-V2' not in text);ck('Every embed retains caption and identity in print',all(b['caption'] in text and b['artifact_id'] in text for b in w()['embeds']));popup.close();click('[data-action="pd-dlg-close"]','Close truthful print handoff receipt');ck('PDF handoff does not change document hash',p.evaluate('PM56_PLANS.hash(PM56_B17_WORK.snapshot().planId)')==ph);shot('08-after-exports')
    more();click('.editor-body [data-action="pd-inspect"]','Read Plan backend and revision provenance');ck('Regular backend remains direct with no scoped PlanUnits',p.locator('.pd-sec-backend').inner_text().find('no PlanUnits')>=0 and plan()['backend']=='direct');geometry('Plan Details');shot('09-details');click('[data-action="pd-dlg-close"]','Close Details');ck('Document exploration never admitted work',not w()['attempts'] and plan()['status']=='ready')
   ck('No page exceptions',not r['errors']);ck('No duplicate local action registration',not p.evaluate('PM56_EXT.collisions'));r['final_work']=w();r['final_plan']=plan()
   timing=p.evaluate('()=>{cancelAnimationFrame(__raf);__obs.disconnect();return {...__timing,end:performance.now()}}');gaps=[y-x for x,y in zip(timing['raf'],timing['raf'][1:])];r['timing']={**timing,'median_raf_ms':statistics.median(gaps) if gaps else None,'max_raf_ms':max(gaps) if gaps else None,'intervals_over_25ms':sum(x>25 for x in gaps)}
   if rec:rec.communicate(b'q\n',timeout=20);ck('Capture encoder completed',rec.returncode==0);rec=None
   ck('Frozen HTML bytes unchanged',(ROOT/'index.html').read_bytes()==raw);r['status']='pass';save();b.close();b=None
 except Exception:
  r['status']='fail';r['failure']=traceback.format_exc();save();print(r['failure'],flush=True)
  if p:
   try:p.screenshot(path=str(o/'failure.png'),timeout=6000)
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
