#!/usr/bin/env python3
"""Ordinary Batch 16 controls, downloads, responsive layout and native capture.
The supplied hierarchy is a rendering fixture; only its final lookup executes.
"""
import argparse, csv, hashlib, io, json, os, statistics, subprocess, traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--outdir',type=Path,required=True);ap.add_argument('--scenario',choices=['parallel','restructure','large'],required=True);ap.add_argument('--width',type=int,default=1440);ap.add_argument('--height',type=int,default=1000);ap.add_argument('--record',action='store_true');ap.add_argument('--variant',choices=['orbit','simple'],default='orbit');ap.add_argument('--dwell',type=int,default=90);a=ap.parse_args();o=a.outdir.resolve();o.mkdir(parents=True,exist_ok=True);target=o/'RESULT.json'
 if target.exists():ap.error('Use fresh output directory')
 raw=(ROOT/'index.html').read_bytes();r={'status':'running','scenario':a.scenario,'viewport':{'width':a.width,'height':a.height},'html_sha256':hashlib.sha256(raw).hexdigest(),'loading':'complete standalone via set_content; normal file URL blocked by environment','checks':[],'actions':[],'errors':[],'recorded':a.record,'working_variant':a.variant};p=b=xv=rec=None;logs=[]
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
   def shot(name):p.mouse.move(a.width-10,30);p.screenshot(path=str(o/(name+'.png')))
   def w():return p.evaluate('PM56_B16_WORK.snapshot()')
   def plan():return p.evaluate('PM56_PLANS.get(PM56_B16_WORK.snapshot().planId)')
   def td():return p.evaluate('PM56_TODOS.get(PM56_EXT.ctx().thread.id)')
   def back():
    if a.width<=1100 and p.locator('[data-action="return-to-chat"]').filter(visible=True).count():click('[data-action="return-to-chat"]','Return to chat')
   def more():
    if p.locator('[data-action="pd-inspect"]').filter(visible=True).count()==0:click('[data-action="pd-more-actions"]','Open Plan secondary controls')
   def openplan():
    back();click('[data-action="pd-info"], [data-action="pd-expand"]','Open exact Plan in shared editor')
   def goal():
    openplan();more();click('[data-action="pd-inspect"]','Open Plan record and identity');click('[data-action="pd-open-goal"]','Navigate to the exact bound Goal')
   def geometry(label):
    data=p.evaluate('''()=>[...document.querySelectorAll('.transcript,.editor-body,.b16-workspace,.todo-panel,.todo-selected-detail,.goal-section-v2,.activity-panel,.pd-md')].filter(e=>e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0).map(e=>({class:e.className,client:e.clientWidth,scroll:e.scrollWidth}))''');r.setdefault('geometry',{})[label]=data;ck(label+' has no horizontal content overflow',all(x['scroll']<=x['client']+1 for x in data))
   click('[data-action="open-demo"]','Open Demo Studio');p.locator('select[data-input="variant"][data-family="2"]').first.select_option('8' if a.variant=='simple' else '1');ck('Three public Batch 16 exercises',p.locator('[data-action="b16-start"]').count()==3);click('[data-action="b16-start"][data-flow="'+a.scenario+'"]','Prepare supplied input without execution');ck('No work before Send',w() is None)
   if a.record:
    p.wait_for_timeout(1200);f=open(o/'ffmpeg.log','w');logs.append(f);rec=subprocess.Popen(['ffmpeg','-y','-f','x11grab','-framerate','60','-video_size',f'{a.width}x{a.height}','-i',env['DISPLAY'],'-an','-c:v','libx264','-preset','ultrafast','-crf','22','-pix_fmt','yuv420p','-fps_mode','passthrough','-enc_time_base','1:60000',str(o/'workflow.mkv')],stdin=subprocess.PIPE,stdout=f,stderr=f)
   p.evaluate('''()=>{window.__timing={raf:[],longTasks:[],start:performance.now()};window.__obs=new PerformanceObserver(l=>__timing.longTasks.push(...l.getEntries().map(x=>({start:x.startTime,duration:x.duration}))));__obs.observe({type:'longtask'});function tick(t){__timing.raf.push(t);window.__raf=requestAnimationFrame(tick)}window.__raf=requestAnimationFrame(tick)}''');shot('before-send')
   click('[data-action="send"]','Submit through ordinary composer');ck('Accepted composer is cleared',p.evaluate('PM56_EXT.ctx().state.composer')=='');ck('Shared work owns supplied source',bool(w()['source']['id']));click('[data-action="b16-dismiss"]','Dismiss instructions');ck('Instructions are dismissed',p.locator('.b16-guide').count()==0)
   if a.scenario=='large':
    ck('All 5,050 items retained without Plan or Goal',len(td())==5050 and w().get('planId') is None and p.evaluate('PM56_GOAL.get()') is None);click('[data-action="b16-todos"]','Open pinned To-Do Activity');ck('Full list is virtualized, not truncated',0<p.locator('.todo-virtual-row').count()<30)
    p.locator('[data-todo-search]').fill('catalog-05000');p.wait_for_timeout(180);ck('Search finds last exact ID and ancestry',p.locator('.todo-virtual-row').count()==2);shot('search-last-item');before=td();click('[data-action="todo-toggle-parent"]','Collapse last parent');ck('Collapse writes no work state and hides descendants',td()==before and p.locator('.todo-virtual-row').count()==1);click('[data-action="todo-toggle-parent"]','Expand last parent');ck('Expansion keeps exact item IDs and reveals descendants',td()==before and p.locator('.todo-virtual-row').count()==2)
    p.locator('[data-todo-search]').fill('');p.wait_for_timeout(160);click('[data-action="todo-reveal-last"]','Scroll to final item in uncapped hierarchy');ck('Last item is reachable by scrolling',p.locator('[data-action="todo-admit"][data-id$="catalog-05000"]').filter(visible=True).count()==1);shot('last-viewport');click('[data-action="todo-admit"][data-id$="catalog-05000"]','Admit the one actual bounded lookup');click('[data-action="todo-complete"][data-id$="catalog-05000"]','Compute exact identity lookup');click('[data-action="todo-open-work"][data-id$="catalog-05000"]','Open exact work binding');ck('Exact work navigation is visible',p.locator('.todo-opened-work').count()==1);ck('Only one leaf executed, all other fixtures retained',len(td())==5050 and sum(t['status']=='completed' for t in td())==1);shot('exact-work');geometry('large hierarchy')
   else:
    ck('Plan does not imply Goal or work',p.evaluate('PM56_GOAL.get()') is None and not td());md=p.evaluate('PM56_PLANS.markdown(PM56_B16_WORK.snapshot().planId)');ph=p.evaluate('PM56_PLANS.hash(PM56_B16_WORK.snapshot().planId)');r['approved_markdown_sha256']=hashlib.sha256(md.encode()).hexdigest();openplan();shot('plan-before-build')
    if a.scenario=='parallel':click('[data-action="pd-build"]','Ordinary Build, without a Goal')
    else:more();click('[data-action="pd-build-goal"]','Explicit Build as Goal');goal()
    p.wait_for_function('PM56_TODOS.get()?.filter(t=>t.status==="in_progress"&&!PM56_TODOS.get().some(c=>c.parent_todo_id===t.todo_id)).length===2',timeout=9000)
    if a.scenario=='restructure':click('[data-action="goal-pause"]','Pause at the admitted-work boundary',dwell=10);ck('Pause retains two admitted work bindings',p.evaluate('PM56_GOAL.get().status')=='paused' and len(p.evaluate('PM56_TODOS.bindings(PM56_EXT.ctx().thread.id)'))==2);shot('paused-goal')
    else:ck('Ordinary Build created no Goal',p.evaluate('PM56_GOAL.get()') is None)
    back();click('[data-action="b16-todos"]','Inspect shared concurrent To-Dos');ck('Concurrent leaves appear separately',sum(t['status']=='in_progress' and bool(t['parent_todo_id']) for t in td())==2);shot('concurrent-todos');geometry('concurrent To-Dos')
    if a.scenario=='parallel':
     p.wait_for_function('PM56_B16_WORK.snapshot().outputs.summary&&!PM56_B16_WORK.snapshot().outputs.csv',timeout=6000);shot('out-of-order-summary');ck('Later-listed summary finished before CSV',bool(w()['outputs'].get('summary')) and not w()['outputs'].get('csv'))
    else:
     binding_before=p.evaluate('JSON.stringify(PM56_TODOS.bindings(PM56_EXT.ctx().thread.id))');click('[data-action="b16-open"]','Open output workspace while paused');click('[data-action="b16-preview-restructure"]','Preview identity-preserving refinement');shot('refinement-preview');click('[data-action="b16-apply-restructure"]','Apply the atomic list refinement');ck('Refinement preserved exact binding bytes',w().get('restructure') is not None and p.evaluate('JSON.stringify(PM56_TODOS.bindings(PM56_EXT.ctx().thread.id))')==binding_before);shot('refined-workspace');geometry('refinement workspace')
     openplan();click('[data-action="pd-view"][data-value="markdown"]','Read immutable Markdown with separate progress rail');p.wait_for_timeout(250);ck('Displayed Markdown is approved bytes',p.locator('.pd-md pre').filter(visible=True).first.text_content()==md)
     rails=p.evaluate('''()=>[...document.querySelectorAll('.pd-md-mark[data-step-state]')].filter(e=>e.getBoundingClientRect().width>0).map(e=>({id:e.dataset.blockId,top:e.getBoundingClientRect().top,target:[...e.closest('.pd-md').querySelectorAll('.pd-md-block')].find(b=>b.dataset.blockId===e.dataset.blockId)?.getBoundingClientRect().top}))''');r['markdown_rail_geometry']=rails;ck('Progress rail aligns with actual wrapped blocks',bool(rails) and all(x.get('target') is not None and abs(x['top']-x['target'])<6 for x in rails));shot('paused-markdown');geometry('paused Markdown')
     more();click('[data-action="pd-export"]','Open shared export dialog');ck('Export separates document and execution report',p.locator('[data-content-kind="plan_document"]').count()==1 and p.locator('[data-content-kind="execution_report"]').count()==1)
     with p.expect_download() as dl:click('[data-action="pd-export-do"][data-kind="plan_document"][data-format="markdown"]','Export approved Plan during execution')
     dp=o/'approved-plan.md';dl.value.save_as(str(dp));ck('In-flight Plan export is byte exact',dp.read_bytes()==md.encode());click('[data-action="pd-dlg-close"]','Close export receipt');more();click('[data-action="pd-export"]','Choose separate execution report')
     with p.expect_download() as dl:click('[data-action="pd-export-do"][data-kind="execution_report"][data-format="bundle"]','Export exact run report during execution')
     dp=o/'execution-report.json';dl.value.save_as(str(dp));report=json.loads(dp.read_text());r['execution_report']=report;ck('Report has the exact Plan/run identity',report['plan_run_id']==plan()['approved']['plan_run_id'] and report['plan_hash']==ph);click('[data-action="pd-dlg-close"]','Close report receipt');click('[data-action="pd-view"][data-value="rich"]','Return to Rich Text');shot('paused-rich');goal();click('[data-action="goal-resume"]','Resume the retained attempts')
    p.wait_for_function('PM56_PLANS.get(PM56_B16_WORK.snapshot().planId).status==="completed"',timeout=22000);ck('Completed only after accepted output checks',p.evaluate('PM56_B16_WORK.inspect(PM56_B16_WORK.snapshot().id,PM56_PLANS.get(PM56_B16_WORK.snapshot().planId)).complete'))
    ck('Approved document bytes never changed',p.evaluate('PM56_PLANS.markdown(PM56_B16_WORK.snapshot().planId)')==md and p.evaluate('PM56_PLANS.hash(PM56_B16_WORK.snapshot().planId)')==ph);back();click('[data-action="b16-todos"]','Inspect inline completed hierarchy');ck('Completed items stay inline, no Done section',len(td())==4 and all(t['status']=='completed' for t in td()) and p.locator('.todo-title.is-struck').count()==4);shot('completed-todos');geometry('completed To-Dos');click('[data-action="b16-open"]','Open computed files');shot('computed-files');geometry('computed files')
    with p.expect_download() as dl:click('[data-action="b16-download"][data-artifact$=":csv"]','Download the actual CSV')
    dp=o/'customers.csv';dl.value.save_as(str(dp));rows=list(csv.DictReader(io.StringIO(dp.read_text())));ck('Downloaded CSV contains five rows and exact total',len(rows)==5 and sum(int(x['total_cents']) for x in rows)==22324);ck('Download matches committed output',dp.read_bytes()==p.evaluate('PM56_DATA.artifacts.find(a=>a.id===PM56_B16_WORK.snapshot().outputs.csv).content').encode());r['download_sha256']=hashlib.sha256(dp.read_bytes()).hexdigest();r['final_plan']=plan();r['final_goal']=p.evaluate('PM56_GOAL.get()')
   r['final_work']=w();r['final_todos']=td();ck('No page errors',not r['errors']);ck('No undeclared action collisions',not p.evaluate('PM56_EXT.collisions'))
   timing=p.evaluate('()=>{cancelAnimationFrame(__raf);__obs.disconnect();return {...__timing,end:performance.now()}}');gaps=[y-x for x,y in zip(timing['raf'],timing['raf'][1:])];r['timing']={**timing,'median_raf_ms':statistics.median(gaps) if gaps else None,'max_raf_ms':max(gaps) if gaps else None,'intervals_over_25ms':sum(x>25 for x in gaps)}
   if rec:rec.communicate(b'q\n',timeout=20);ck('Capture encoder completed',rec.returncode==0);rec=None
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
