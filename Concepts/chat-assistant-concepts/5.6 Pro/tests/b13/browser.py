#!/usr/bin/env python3
"""UI-driven B13 flows plus scoped negative ingress checks.
Chromium file:// navigation is blocked in the authoring environment; the exact
standalone bytes are loaded with set_content. No persistent-origin claim.
"""
from __future__ import annotations
import argparse,hashlib,json,os,statistics,subprocess,time,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--outdir',type=Path,required=True);ap.add_argument('--scenario',choices=['shape','stale','leads','dissent'],required=True);ap.add_argument('--width',type=int,default=1440);ap.add_argument('--height',type=int,default=1000);ap.add_argument('--record',action='store_true');ap.add_argument('--dwell',type=int,default=120);a=ap.parse_args()
 o=a.outdir.resolve();o.mkdir(parents=True,exist_ok=True);report=o/'RESULT.json'
 if report.exists():ap.error('Use a fresh directory; evidence cannot be overwritten.')
 raw=(ROOT/'index.html').read_bytes();r={'scenario':a.scenario,'viewport':{'width':a.width,'height':a.height},'html_sha256':hashlib.sha256(raw).hexdigest(),'loading':'exact UTF-8 bytes through set_content','status':'running','checks':[],'actions':[],'errors':[],'recorded':a.record};xv=rec=browser=None;logs=[];page=None
 def save():report.write_text(json.dumps(r,indent=2)+'\n')
 def ck(name,v):r['checks'].append({'name':name,'pass':bool(v)});assert v,name
 try:
  env=dict(os.environ)
  if a.record:
   xf=open(o/'xvfb.log','w');logs.append(xf);xv=subprocess.Popen(['Xvfb','-displayfd','1','-screen','0',f'{a.width}x{a.height}x24','-nolisten','tcp'],stdout=subprocess.PIPE,stderr=xf,text=True);env['DISPLAY']=':'+xv.stdout.readline().strip()
  with sync_playwright() as w:
   browser=w.chromium.launch(executable_path='/usr/bin/chromium',headless=not a.record,env=env,args=['--no-sandbox','--disable-dev-shm-usage','--start-fullscreen',f'--window-size={a.width},{a.height}','--window-position=0,0'])
   ctx=browser.new_context(viewport=r['viewport'],accept_downloads=True);p=page=ctx.new_page();p.set_default_timeout(8000);p.on('pageerror',lambda e:r['errors'].append(str(e)));p.set_content(raw.decode('utf-8'),wait_until='domcontentloaded');p.wait_for_function('window.__PM56_BOOT_OK');r['browser']=browser.version
   if a.record:
    cd=ctx.new_cdp_session(p);win=cd.send('Browser.getWindowForTarget')['windowId'];cd.send('Browser.setWindowBounds',{'windowId':win,'bounds':{'windowState':'fullscreen'}})
   def click(sel,label=None,dwell=None):
    loc=p.locator(sel).filter(visible=True).first;loc.scroll_into_view_if_needed();r['actions'].append({'label':label or sel,'browser_ms':p.evaluate('performance.now()')});loc.click();p.wait_for_timeout(a.dwell if dwell is None else dwell)
   def shot(name):p.mouse.move(a.width-12,35);p.screenshot(path=str(o/(name+'.png')))
   def lens():return p.evaluate('PM56_LENS.slice(PM56_EXT.ctx().thread.id)')
   def runsnap():return p.evaluate('PM56_BATCH13.currentRun()')
   def mode(name):
    click('[data-action="lens-open"]','Open compact Lens chooser');click(f'.overlay-menu [data-action="lens-mode"][data-value="{name}"]','Select '+name)
   def select(n):click(f'[data-action="lens-toggle"][data-id$="-m{n}"]','Select canonical message '+str(n))
   def decide(lead,kind,reason):
    p.locator(f'[data-lead-id="{lead}"] textarea').fill(reason);click(f'[data-action="b13-decide"][data-lead="{lead}"][data-kind="{kind}"]','Deliberately '+kind+' '+lead)
   def waitcheck(lead):p.wait_for_function('(id)=>PM56_BATCH13.currentRun().wonderer.leads.find(l=>l.id===id).state!=="research_pending" && PM56_BATCH13.currentRun().wonderer.pending.filter(t=>t.leadId===id).every(t=>t.finished)',arg=lead)
   click('[data-action="open-demo"]','Open Demo Studio');ck('Four new public demo entries',p.locator('[data-action="b13-start"]').count()==4);click(f'[data-action="b13-start"][data-flow="{a.scenario}"]','Open '+a.scenario)
   tid=p.evaluate('PM56_EXT.ctx().thread.id');r['thread_id']=tid
   if a.record:p.wait_for_timeout(4800)
   p.evaluate('''()=>{window.__b13Timing={raf:[],longTasks:[],start:performance.now()};window.__b13Obs=new PerformanceObserver(l=>__b13Timing.longTasks.push(...l.getEntries().map(x=>({start:x.startTime,duration:x.duration}))));__b13Obs.observe({type:'longtask'});function tick(t){__b13Timing.raf.push(t);window.__b13RAF=requestAnimationFrame(tick)}window.__b13RAF=requestAnimationFrame(tick)}''')
   if a.record:
    cmd=['ffmpeg','-hide_banner','-y','-thread_queue_size','1024','-f','x11grab','-framerate','60','-video_size',f'{a.width}x{a.height}','-draw_mouse','1','-i',env['DISPLAY']+'.0','-c:v','libx264','-preset','ultrafast','-crf','20','-pix_fmt','yuv420p','-threads','2','-fps_mode','passthrough','-enc_time_base','1:60000','-video_track_timescale','60000',str(o/'workflow.mp4')]
    fl=open(o/'ffmpeg.log','w');logs.append(fl);r['capture_command']=cmd;rec=subprocess.Popen(cmd,stdin=subprocess.PIPE,stdout=subprocess.DEVNULL,stderr=fl,env=env);p.wait_for_timeout(400)
   if a.scenario in ['shape','stale']:
    initial=p.evaluate('PM56_EXT.ctx().thread.messages.filter(m=>m.type==="text").map(m=>({id:m.id,body:m.body}))');ck('Opening Lens demo does not pre-apply shaping',lens()['mode']=='off' and not lens()['ops']);click('[data-action="b13-hide-guide"]','Dismiss guide; ordinary controls remain')
    if a.scenario=='shape':
     mode('mute');select(5);ck('Mute omits only selected source from effective context',p.evaluate('!PM56_LENS.effectiveHistory(PM56_EXT.ctx().thread.id).some(x=>x.id.endsWith("-m5"))'));click('[data-action="lens-seal"]','Seal muted operation')
     mode('focus');select(1);ck('Focus source has high priority and protection',p.evaluate('PM56_LENS.effectiveHistory(PM56_EXT.ctx().thread.id).find(x=>x.id.endsWith("-m1")).protected'));click('[data-action="lens-seal"]','Seal focus operation')
    mode('subcompact');select(2);select(4);before=p.evaluate('PM56_LENS.effectiveHistory(PM56_EXT.ctx().thread.id)');click('[data-action="lens-preview"]','Build source-linked preview')
    ck('Preview contains exact selected source text',initial[1]['body'] in lens()['preview']['summary']);ck('Preview is not effective context',before==p.evaluate('PM56_LENS.effectiveHistory(PM56_EXT.ctx().thread.id)'))
    geo=p.evaluate('''()=>{const a=document.querySelector('.lens-inline').getBoundingClientRect(),b=document.querySelector('.transcript').getBoundingClientRect();return {lensBottom:a.bottom,transcriptTop:b.top,position:getComputedStyle(document.querySelector('.lens-inline')).position,overflow:document.querySelector('.transcript').scrollWidth>document.querySelector('.transcript').clientWidth}}''')
    r['lens_geometry']=geo;ck('Lens pushes transcript down instead of overlaying it',geo['lensBottom']<=geo['transcriptTop']+1 and geo['position']!='absolute');ck('Transcript has no horizontal overflow during preview',not geo['overflow']);shot('preview')
    if a.scenario=='shape':
     click('[data-action="lens-cancel"]','Cancel summary preview');ck('Cancel preserves effective assembly',before==p.evaluate('PM56_LENS.effectiveHistory(PM56_EXT.ctx().thread.id)'));click('[data-action="lens-preview"]','Build another preview')
    else:
     old=lens()['preview']['id'];click('[data-action="b13-change-message"]','Revise the ranking source before Apply');ck('Source revision makes preview stale',lens()['preview']['status']=='stale');ck('Stale Apply is disabled',p.locator('[data-action="lens-apply"]').is_disabled())
     refused=p.evaluate('(id)=>PM56_LENS.engine.apply(PM56_EXT.ctx().thread.id,id)',old);ck('Late ingress cannot bypass disabled stale Apply',not refused['ok']);ck('Rejected ingress creates no operation',not lens()['ops']);shot('stale-rejected');click('[data-action="lens-preview"]','Refresh against the new source');ck('Refreshed preview has new identity',lens()['preview']['id']!=old);ck('Refreshed preview includes source revision', 'Revision 2' in lens()['preview']['summary'])
     click('[data-action="lens-source"][data-id$="-m2"]','Open full canonical source');ck('Source opens exact current message','Revision 2' in p.locator('.lens13-source').inner_text());shot('full-source');click('[data-action="close-editor"]','Return to conversation')
    preview=lens()['preview']['id'];click('[data-action="lens-apply"]','Apply reviewed summary');ck('One summary is actually assembled',p.evaluate('PM56_LENS.effectiveHistory(PM56_EXT.ctx().thread.id).filter(m=>m.kind==="summary").length')==1)
    n=len(lens()['ops']);again=p.evaluate('(id)=>PM56_LENS.engine.apply(PM56_EXT.ctx().thread.id,id)',preview);ck('Duplicate Apply reuses one operation',again.get('reused') and len(lens()['ops'])==n);shot('summary-applied')
    click('.pm-lens-card [data-action="lens-rehydrate"]','Rehydrate the full sources');ck('Rehydration restores full selected sources',not p.evaluate('PM56_LENS.effectiveHistory(PM56_EXT.ctx().thread.id).some(m=>m.kind==="summary")'));click('.pm-lens-card [data-action="lens-collapse"]','Collapse the current sources again');click('.pm-lens-card [data-action="lens-release"]','Release the summary operation')
    click('.lens-inline [data-action="lens-mode"][data-value="off"]','Turn Off and release every operation');ck('Turn Off releases all shaping',lens()['mode']=='off' and not lens()['ops']);ck('No lingering expanded Lens dock',p.locator('.lens-inline').count()==0)
    final=p.evaluate('PM56_EXT.ctx().thread.messages.filter(m=>m.type==="text").map(m=>({id:m.id,body:m.body}))');ck('Canonical message identities preserved',[m['id'] for m in initial]==[m['id'] for m in final]);ck('Canonical bodies preserved except explicit revision exercise',all(x==y for i,(x,y) in enumerate(zip(initial,final)) if not(a.scenario=='stale' and i==1)))
    click('[data-action="b13-effective"]','Inspect effective-context assembly');ck('All six canonical messages restored',p.evaluate('PM56_LENS.effectiveHistory(PM56_EXT.ctx().thread.id).filter(m=>m.kind==="message").length')==6);shot('effective-restored');r['final_lens']=lens()
   else:
    before_effect=p.evaluate('PM56_COLLAB.effects()');before_runs=p.evaluate('PM56_COLLAB.runs().length');ck('Configuration is detached; opening does not start a run',not p.evaluate('PM56_BATCH13.currentRun()'))
    ck('Wonderer checked additively',p.evaluate('PM56_COLLAB.draft().wonderer') is True);shot('configuration')
    click('[data-action="collab-modal-commit"]','Start configured BrainStorm');snap=runsnap();ck('Run keeps four core roles and one dedicated specialist',len(snap['participants'])==5 and len(snap['brainstorm']['attempts'])==4 and sum(x.get('additiveRoleKind')=='wonderer' for x in snap['participants'])==1)
    ck('Exactly one collaborative run admitted',p.evaluate('PM56_COLLAB.runs().length')==before_runs+1);ck('Local run creates no provider calls or usage charges',p.evaluate('PM56_COLLAB.effects().providerCalls')==before_effect['providerCalls'] and p.evaluate('PM56_COLLAB.effects().usageRecords')==before_effect['usageRecords']);click('[data-action="b13-open"]','Open leads and evidence');ck('Three connected hypotheses, none silently admitted',all(l['state']=='hypothesis' and not l['included'] and l['tether'] for l in runsnap()['wonderer']['leads']));ck('Unresearched include is disabled',p.locator('[data-action="b13-decide"][data-lead="fence"][data-kind="include"]').is_disabled());shot('initial-leads')
    click('[data-action="b13-core"]','Play recorded core proposals and votes');click('[data-action="b13-research"][data-lead="fence"]','Research ordering sample')
    if a.scenario=='dissent':
     click('[data-action="b13-source-change"]','Change evidence while the check is pending',dwell=80);waitcheck('fence');ck('Pending outdated response rejected',any(x['reason']=='stale_evidence' for x in runsnap()['wonderer']['rejected']));ck('Outdated conclusion cannot become included',runsnap()['wonderer']['leads'][0]['state']=='stale' and not runsnap()['wonderer']['leads'][0]['included']);shot('outdated-source');click('[data-action="b13-research"][data-lead="fence"]','Research current artifact version')
    waitcheck('fence');ck('Executed ordering sample records support without promotion',runsnap()['wonderer']['leads'][0]['state']=='researched' and not runsnap()['wonderer']['leads'][0]['included'])
    click('[data-action="b13-source"][data-lead="fence"]','Inspect shared source artifact');ck('Exact source is visible','latestRequest' in p.locator('.b13-source').inner_text());shot('source-artifact');click('[data-action="close-editor"][data-id^="wonder-source:"]','Return to lead dispositions')
    decide('fence','include','The current local sample supports the request fence. This is not a latency or live-worker result.')
    click('[data-action="b13-research"][data-lead="speed"]','Check measurement availability');waitcheck('speed');ck('Missing measurements remain inconclusive',runsnap()['wonderer']['leads'][1]['evidence']['outcome']=='inconclusive');ck('Inconclusive result cannot be included as fact',p.locator('[data-action="b13-decide"][data-lead="speed"][data-kind="include"]').is_disabled());decide('speed','exclude','No target-device measurements exist. Exclude the claimed speed improvement.')
    decide('fallback','user_decided','I choose a reversible rollout and accept the maintenance cost of the fallback.');p.wait_for_function('PM56_BATCH13.currentRun().wonderer.corePlayback.status==="completed"');snap=runsnap();r['pre_synthesis_core']=snap['brainstorm'];ck('Core round completed through existing protocol',snap['brainstorm']['phase']=='synthesis' and not snap['wonderer']['corePlayback']['errors']);ck('Core ballot contains no specialist vote',len(snap['brainstorm']['votes'])==4 and not any(v['participantId']==snap['wonderer']['participantId'] for v in snap['brainstorm']['votes']));ck('Core dissent preserved',len(snap['brainstorm']['dissent'])==(3 if a.scenario=='dissent' else 1));ck('Explicit user choice remains distinct from researched fact',snap['wonderer']['leads'][2]['state']=='user_decided' and snap['wonderer']['leads'][2]['evidence'] is None);ck('All leads deliberately disposed',p.evaluate('PM56_WONDERER.convergence(PM56_BATCH13.currentRun()).ok'))
    if a.scenario=='dissent':
     click('[data-action="b13-source-change"]','Change a source after inclusion');ck('Previously included result becomes stale',not runsnap()['wonderer']['leads'][0]['included']);ck('Stale evidence blocks synthesis',p.locator('.b13-convergence [data-action="collab-brainstorm-synthesize"]').is_disabled());click('[data-action="b13-research"][data-lead="fence"]','Recheck included source after its revision');waitcheck('fence');decide('fence','include','Version 3 confirms the ordering sample. The earlier result was correctly invalidated.')
    p.locator('.b13-convergence').scroll_into_view_if_needed();shot('convergence');click('.b13-convergence [data-action="collab-brainstorm-synthesize"]','Create one Deep Plan through the Plan owner');snap=runsnap();ck('One Plan identity returned by existing owner',snap['brainstorm']['synthesis']['planId']=='brainstorm-plan-'+snap['id']);ck('Synthesis did not mutate core votes or dissent',snap['brainstorm']['votes']==r['pre_synthesis_core']['votes'] and snap['brainstorm']['dissent']==r['pre_synthesis_core']['dissent']);ck('Source process card remains in transcript',p.locator('[data-action="b13-open"]').count()>=1)
    payload=p.evaluate('PM56_BRAINSTORM.planPayload(PM56_BATCH13.currentRun())');text=json.dumps(payload['blocks']);ck('Plan carries user-choice label and excluded uncertainty','Explicit user decision, not an established fact' in text and 'Excluded:' in text);ck('Included research has exact artifact-version reference',any(x['ref'].startswith('wonderer-evidence:') for x in payload['sourceRefs']));ck('No specialist claim replaces the core decision',payload['ledgerEntries'][1]['k']=='decision');ck('Duplicate synthesis returns same Plan identity',p.evaluate('PM56_BRAINSTORM.synthesize(PM56_BATCH13.currentRun().id).reused') is True);shot('deep-plan');r['final_run']=snap;r['plan_payload']=payload
   p.wait_for_timeout(350)
   geometry=p.evaluate('''()=>[...document.querySelectorAll('.transcript,.editor-content,.b13-workspace,.b13-source,.lens-inline')].filter(e=>e.getBoundingClientRect().width>0).map(e=>({selector:e.className,client:e.clientWidth,scroll:e.scrollWidth}))''');r['final_geometry']=geometry;ck('No horizontal overflow on tested visible surfaces',all(x['scroll']<=x['client']+1 for x in geometry));ck('No browser page errors',not r['errors']);ck('No undeclared extension action collisions',not p.evaluate('PM56_EXT.collisions||[]'))
   timing=p.evaluate('()=>{cancelAnimationFrame(__b13RAF);__b13Obs.disconnect();return {...__b13Timing,end:performance.now()}}');gaps=[y-x for x,y in zip(timing['raf'],timing['raf'][1:])];r['timing']={**timing,'median_raf_ms':statistics.median(gaps) if gaps else None,'p95_raf_ms':sorted(gaps)[int(len(gaps)*.95)] if gaps else None,'max_raf_ms':max(gaps) if gaps else None,'intervals_over_25ms':sum(v>25 for v in gaps)}
   if rec:rec.communicate(b'q\n',timeout=20);ck('Video encoder exited normally',rec.returncode==0);rec=None
   ck('Generated HTML stayed frozen during tests',(ROOT/'index.html').read_bytes()==raw);r['status']='pass';save();browser.close();browser=None
 except Exception:
  r['status']='fail';r['failure']=traceback.format_exc();save();print(r['failure'],flush=True)
  if page:
   try:page.screenshot(path=str(o/'failure.png'),timeout=4000)
   except Exception:pass
 finally:
  if rec:
   try:rec.communicate(b'q\n',timeout=10)
   except Exception:rec.kill();rec.wait()
  if browser:
   try:browser.close()
   except Exception:pass
  if xv:xv.terminate();xv.wait(timeout=10)
  for log in logs:log.close()
 print(json.dumps({'status':r['status'],'scenario':a.scenario,'checks':len(r['checks']),'errors':r['errors']},indent=2),flush=True);return 0 if r['status']=='pass' else 1
if __name__=='__main__':raise SystemExit(main())
