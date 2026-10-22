#!/usr/bin/env python3
"""UI-driven B13 flows plus scoped negative ingress checks.
Chromium file:// navigation is blocked in the authoring environment; the exact
standalone bytes are loaded with set_content. No persistent-origin claim.
"""
from __future__ import annotations
import argparse,hashlib,json,os,statistics,subprocess,time,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
# (2026-10-22) recorded examples play on their own after Start; this journey drives its example by hand, so the
# recording holds (PM56_RECPLAY_HOLD, recorded-play.js); tests/wonderer-grill-verify.mjs AX checks the playback itself
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
   ctx=browser.new_context(viewport=r['viewport'],accept_downloads=True);ctx.add_init_script('window.PM56_RECPLAY_HOLD=true');p=page=ctx.new_page();p.set_default_timeout(8000);p.on('pageerror',lambda e:r['errors'].append(str(e)));p.set_content(raw.decode('utf-8'),wait_until='domcontentloaded');p.wait_for_function('window.__PM56_BOOT_OK');r['browser']=browser.version
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
    # (2026-10-22, DL-218 and 2026-10-21's recorded playback) the Wonderer examples are BrainStorm recordings that play
    # on their own from Start BrainStorm: the Wonderer's leads are held until every blind proposal is in, the team
    # decides each one in the Debate (the Coordinator records it with a reason), explored leads are researched in the
    # Evidence round by a core helper, and Write the plan waits only for the team. The journey waits for the
    # recording's own moments and makes only the user's moves: the Grill Me interview (leads), Check it (the one
    # override), turning Grill Me on mid-run (dissent) and Write the plan. PM56_RECPLAY_HOLD does not hold this
    # recording (it is the run's own clock, not PM56_RECPLAY), so nothing here is driven by hand.
    js_lead='(id)=>{const r=PM56_BATCH13.currentRun(),l=PM56_WG.engine.lead(r,id);return l?JSON.parse(JSON.stringify(l)):null}'
    def lead(i):return p.evaluate(js_lead,i)
    def until(fn,arg=None,timeout=150000):p.wait_for_function(fn,arg=arg,timeout=timeout,polling=150)
    def bs():return p.evaluate('(()=>{const r=PM56_BATCH13.currentRun();return {phase:r.brainstorm.phase,status:r.status,proposals:r.brainstorm.proposals.length,votes:r.brainstorm.votes.length,passes:r.wonderer.passes.map(x=>({n:x.n,status:x.status,by:x.by.kind})),gate:PM56_WONDERER.gateState(r)}})()')
    def tap(sel,label):
     # the Ask Card and What we agreed re-render as the interview moves; a press that meets a re-render is pressed again
     for _ in range(6):
      try:click(sel,label);return True
      except Exception as e:
       if 'not attached' not in str(e) and 'Timeout' not in str(e):raise
       p.wait_for_timeout(250)
     return False
    def back():
     if a.width<=1100 and p.locator('[data-action="return-to-chat"]').filter(visible=True).count():click('[data-action="return-to-chat"]','Return to chat')
    def card_or_view(sel):
     loc=p.locator(sel).filter(visible=True)
     if not loc.count():back()
     return sel
    before_effect=p.evaluate('PM56_COLLAB.effects()');before_runs=p.evaluate('PM56_COLLAB.runs().length');ck('Configuration is detached; opening does not start a run',not p.evaluate('PM56_BATCH13.currentRun()'))
    ck('The Wonderer is on the team'+(' and Grill Me is on' if a.scenario=='leads' else ', Grill Me off'),p.evaluate('PM56_COLLAB.draft().wonderer') is True and p.evaluate('PM56_COLLAB.draft().grillMe')==(a.scenario=='leads'));shot('configuration')
    click('[data-action="collab-modal-commit"]','Start BrainStorm');snap=runsnap();rid=snap['id'];wid=snap['wonderer']['participantId']
    ck('Run keeps four core helpers and one Wonderer',len(snap['participants'])==5 and len(snap['brainstorm']['attempts'])==4 and sum(x.get('additiveRoleKind')=='wonderer' for x in snap['participants'])==1)
    ck('Exactly one collaborative run admitted',p.evaluate('PM56_COLLAB.runs().length')==before_runs+1);ck('Local run creates no provider calls or usage charges',p.evaluate('PM56_COLLAB.effects().providerCalls')==before_effect['providerCalls'] and p.evaluate('PM56_COLLAB.effects().usageRecords')==before_effect['usageRecords'])
    if a.scenario=='leads':
     until('()=>!!document.querySelector(".qs-grill [data-action=\\"qs-accept-round\\"]")',timeout=20000);s=bs()
     ck('Grill Me questions you at intake, before anyone drafts',s['phase']=='intake' and not p.evaluate('PM56_BATCH13.currentRun().brainstorm.attempts.some(x=>x.status==="completed")'));ck('Meanwhile the Wonderer explores its first pass',s['passes'][0]['status'] in ('exploring','held'));shot('grill-at-intake')
     for _ in range(150):
      if p.locator('.wg-agreed[data-state="open"] [data-action="wg-confirm"]').filter(visible=True).count():break
      if p.locator('.qs-grill [data-action="qs-accept-round"]').filter(visible=True).count():tap('.qs-grill [data-action="qs-accept-round"]','Answer the Ask Card round (the recommended answers)')
      else:p.wait_for_timeout(400)
     ck('Confirm pressed',tap('.wg-agreed[data-state="open"] [data-action="wg-confirm"]','Confirm What we agreed: the blind proposals wait for it'))
    until('()=>{const r=PM56_BATCH13.currentRun();return r.brainstorm.phase==="blind_proposals"&&r.brainstorm.attempts.some(x=>x.status==="completed")}')
    s=bs();ck('While the helpers draft alone, the Wonderer\'s leads are held',s['passes'][0]['status']=='held' and p.evaluate('(()=>{const r=PM56_BATCH13.currentRun();return !r.wonderer.leads.some(l=>PM56_WG.engine.visible(r,l.passId))})()'));shot('leads-held')
    until('()=>{const r=PM56_BATCH13.currentRun();return ["normalize","debate","evidence","vote","synthesis"].includes(r.brainstorm.phase)&&r.wonderer.passes[0].status!=="held"}')
    ck('Every proposal is in, so the leads are released to the team',p.evaluate('(()=>{const r=PM56_BATCH13.currentRun();return r.brainstorm.attempts.every(x=>x.status==="completed")&&r.messages.some(m=>/released to the team/.test(m.body||""))})()'))
    if a.scenario=='dissent':
     # your optional move: turn Grill Me on mid-run from Open Panel; the Coordinator asks at the next chapter, only the vote waits
     click('.transcript [data-run-id="'+rid+'"] [data-action="brainstorm-open-results"]','Open Panel');click('[data-action="collab-brainstorm-toggle-grill"][data-run="'+rid+'"]','Turn Grill Me on mid-run');back()
     ck('Turning Grill Me on mid-run starts nothing now; it asks at the next chapter',p.evaluate('(()=>{const r=PM56_BATCH13.currentRun();return PM56_WG.grillOn(r)&&r.status==="running"})()'))
     until('()=>!!document.querySelector(".qs-grill [data-action=\\"qs-accept-round\\"]")',timeout=60000);asked_at=bs()['phase']
     ck('The Coordinator asks before the vote, and only the vote waits',asked_at in ('normalize','debate','evidence'));shot('midrun-grill')
     p.wait_for_timeout(4000);s=bs();ck('The debate goes on while you are asked; the vote has not started',s['votes']==0 and s['phase'] in ('normalize','debate','evidence','vote'))
     for _ in range(150):
      if p.locator('.wg-agreed[data-state="open"] [data-action="wg-confirm"]').filter(visible=True).count():break
      if p.locator('.qs-grill [data-action="qs-accept-round"]').filter(visible=True).count():tap('.qs-grill [data-action="qs-accept-round"]','Answer the mid-run Ask Card')
      else:p.wait_for_timeout(400)
     ck('The vote still has not started before your Confirm',bs()['votes']==0);ck('Confirm pressed',tap('.wg-agreed[data-state="open"] [data-action="wg-confirm"]','Confirm: the vote may go on'))
    first=['fence','speed','instant','debounce'];until('(ids)=>{const r=PM56_BATCH13.currentRun();return ids.every(i=>{const l=PM56_WG.engine.lead(r,i);return l&&l.disposition})}',first)
    d={i:lead(i)['disposition'] for i in first};r['first_pass_decisions']=d
    ck('The team decides each first-pass lead in the Debate, with a reason',[d[i]['kind'] for i in first]==['explore','explore','use','set_aside'] and all(len(d[i].get('reason') or '')>10 for i in first))
    ck('The Coordinator records each decision in the discussion',p.evaluate('(()=>{const r=PM56_BATCH13.currentRun();return ["explore","explore","use","set aside"].every((w,i)=>r.messages.some(m=>m.senderKind==="coordinator"&&new RegExp("^Lead "+(i+1)+": "+w+"\\\\.").test(m.body||"")))})()'))
    if a.scenario=='leads':
     until('()=>{const r=PM56_BATCH13.currentRun();return ["reorder","index","fulltext"].every(i=>{const l=PM56_WG.engine.lead(r,i);return l&&l.disposition})}')
     ck('A helper asks for a second pass in the Debate; it queues behind the debate and its leads are decided on delivery',p.evaluate('(()=>{const r=PM56_BATCH13.currentRun(),q=r.wonderer.passes[1];return !!q&&q.by.kind==="participant"&&["reorder","index","fulltext"].map(i=>PM56_WG.engine.lead(r,i).disposition.kind).join()==="explore,use,set_aside"})()'))
    click(card_or_view('[data-action="wg-open-leads"][data-run="'+rid+'"]'),'Open the Wonderer\'s leads');p.wait_for_selector('.b13-workspace')
    ck('Wonderer workspace has no Technical details (card 8)',p.locator('.b13-workspace').evaluate('(e)=>!/Technical details/.test(e.textContent)'));ck('Nothing in the workspace asks you to decide a lead',p.locator('.b13-workspace [data-action="b13-decide"],.b13-workspace textarea').count()==0);shot('initial-leads')
    # your one override: Check it sends a lead the team only used to research anyway
    until('()=>{const r=PM56_BATCH13.currentRun();return ["evidence","vote","synthesis"].includes(r.brainstorm.phase)}');click('.b13-workspace [data-action="wg-check-it"][data-lead="instant"]','Check it: send the used lead to research anyway')
    ck('Check it is your request in the discussion',p.evaluate('(()=>{const r=PM56_BATCH13.currentRun();return r.messages.some(m=>m.senderKind==="user"&&/^Check it: lead 3/.test(m.body||""))})()'))
    until('()=>{const l=PM56_WG.engine.lead(PM56_BATCH13.currentRun(),"instant");return !!l.research&&["supported","not_supported"].includes(l.research.status)}',timeout=60000);x=lead('instant')['research']
    ck('A core helper checks it, because you asked; the Wonderer never researches its own leads',x['via']=='check_it' and x['by'] and x['by'].get('id')!=wid and x['status']=='supported')
    until('()=>{const r=PM56_BATCH13.currentRun();return r.brainstorm.phase==="synthesis"}',timeout=150000)
    if a.scenario=='leads':
     until('()=>{const r=PM56_BATCH13.currentRun(),q=r.wonderer.passes[2];return !!q&&q.status==="exploring"}',timeout=60000)
     ck('While the last pass explores, Write the plan waits, for the team, not for you',not p.evaluate('PM56_WONDERER.gateState(PM56_BATCH13.currentRun()).ok') and p.locator('.b13-convergence [data-action="collab-brainstorm-synthesize"]').is_disabled());shot('write-the-plan-waits')
    until('()=>PM56_WONDERER.gateState(PM56_BATCH13.currentRun()).ok',timeout=150000);snap=runsnap();r['pre_synthesis_core']=snap['brainstorm']
    ck('Every lead has the team\'s decision and nothing is in research',all(l.get('disposition') and not (l.get('research') and l['research']['status'] in ('queued','running')) for l in snap['wonderer']['leads']))
    fence,speed=lead('fence')['research'],lead('speed')['research']
    ck('The ordering sample supports the fence, with its exact evidence version',fence['status']=='supported' and fence['evidence']['artifactId']==snap['wonderer']['artifactIds'][0] and 'version 1' in fence['evidence']['label'])
    ck('Missing measurements leave the speed lead not supported',speed['status']=='not_supported' and 'No device measurements' in speed['note'])
    ck('Explored leads are researched by core helpers, never by the Wonderer',all(l['research']['by']['id']!=wid for l in snap['wonderer']['leads'] if l.get('research')))
    ck('Core ballot contains no Wonderer vote',len(snap['brainstorm']['votes'])==4 and not any(v['participantId']==wid for v in snap['brainstorm']['votes']))
    ck('Core dissent preserved',len(snap['brainstorm']['dissent'])>=1);r['dissent']=snap['brainstorm']['dissent']
    if a.scenario=='dissent':
     ck('The rule beats the vote: the local option is chosen although the hosted one has more support',snap['brainstorm']['decision']['selectedProposalId']=='worker' and sum(v.get('proposalId')=='hosted' for v in snap['brainstorm']['votes'])>sum(v.get('proposalId')=='worker' for v in snap['brainstorm']['votes']))
    ck('The guide says Write the plan is your move',p.evaluate('(()=>{const g=[...document.querySelectorAll(".b13-guide")].find(n=>n.getClientRects().length);return !!g&&/your move/.test(g.textContent)})()'))
    p.locator('.b13-convergence').scroll_into_view_if_needed();shot('convergence');click('.b13-convergence [data-action="collab-brainstorm-synthesize"]','Write the plan: one Deep Plan through the Plan owner');snap=runsnap()
    ck('One Plan identity returned by existing owner',snap['brainstorm']['synthesis']['planId']=='brainstorm-plan-'+snap['id']);ck('Writing the plan did not change core votes or dissent',snap['brainstorm']['votes']==r['pre_synthesis_core']['votes'] and snap['brainstorm']['dissent']==r['pre_synthesis_core']['dissent'])
    payload=p.evaluate('PM56_BRAINSTORM.planPayload(PM56_BATCH13.currentRun())');text=json.dumps(payload['blocks'],ensure_ascii=False);leads_all=snap['wonderer']['leads']
    ck('The plan lists every Wonderer lead with the team\'s decision',all(l['title'] in text for l in leads_all) and sum(e['k']=='wonderer_lead' for e in payload['ledgerEntries'])==len(leads_all) and all('the team:' in e['v'] for e in payload['ledgerEntries'] if e['k']=='wonderer_lead'))
    lines=p.evaluate('PM56_WG.listingText(PM56_BATCH13.currentRun())');used=[l for l in leads_all if l['disposition']['kind']=='use'];r['plan_listing']=lines;r['final_run']=snap
    ck('In the plan a lead the team used stays a hypothesis; one you had checked shows its result',len(used)>=1 and all(any(x.startswith(str(l['n'])+'. ') and x in text and (x.endswith('(a hypothesis, not a fact)') if not l.get('research') else (('→ Supported: ' in x or '→ Not supported: ' in x) and not x.endswith('(a hypothesis, not a fact)'))) for x in lines) for l in used))
    ck('Supported research carries an exact evidence reference',any(x['ref'].startswith('wonderer-evidence:'+snap['id']+':fence') for x in payload['sourceRefs']))
    ck('Duplicate Write the plan returns the same Plan identity',p.evaluate('PM56_BRAINSTORM.synthesize(PM56_BATCH13.currentRun().id).reused') is True);shot('deep-plan');r['final_run']=snap;r['plan_payload']=payload

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
