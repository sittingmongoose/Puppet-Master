#!/usr/bin/env python3
"""Scoped integration boundaries, existing-entry smoke, and theme/width matrix.
Fixture setup and deliberately invalid dispatches are identified separately from
normal user controls. Outputs must go outside the concept source tree.
"""
import argparse,hashlib,json,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--outdir',type=Path,required=True);a=ap.parse_args();o=a.outdir.resolve();o.mkdir(parents=True,exist_ok=True)
 if (o/'RESULT.json').exists():ap.error('Use a fresh evidence directory.')
 raw=(ROOT/'index.html').read_bytes();r={'html_sha256':hashlib.sha256(raw).hexdigest(),'status':'running','checks':[],'errors':[],'matrix':[],'cases':[]}
 def save():(o/'RESULT.json').write_text(json.dumps(r,indent=2)+'\n')
 def ck(name,v):r['checks'].append({'name':name,'pass':bool(v)});save();assert v,name
 with sync_playwright() as w:
  b=w.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  def fresh():
   p=b.new_page(viewport={'width':1440,'height':1000});p.set_default_timeout(7000);p.add_init_script('window.PM56_RECPLAY_HOLD=true');p.on('pageerror',lambda e:r['errors'].append(str(e)));p.set_content(raw.decode('utf-8'),wait_until='domcontentloaded');p.wait_for_function('window.__PM56_BOOT_OK');return p
  def click(p,s):p.locator(s).filter(visible=True).first.click();p.wait_for_timeout(100)
  def start(p,flow):click(p,'[data-action="open-demo"]');click(p,f'[data-action="b13-start"][data-flow="{flow}"]')
  def commit(p):click(p,'[data-action="collab-modal-commit"]')
  def snap(p):return p.evaluate('PM56_BATCH13.currentRun()')
  # (2026-10-22) DL-218: the Wonderer flows are BrainStorm recordings that play on the run's own clock from Start BrainStorm
  # (dissent: no Grill Me interview first); the team decides each lead, you only Check it. These cases use the run's own
  # controls (Pause, Resume, Cancel, Check it, Open the leads) while it plays.
  def until(p,fn,arg=None,timeout=60000):p.wait_for_function(fn,arg=arg,timeout=timeout,polling=150)
  def wstate(p,rid):return p.evaluate('(id)=>{const r=PM56_COLLAB.run(id),w=r.wonderer;return {status:r.status,phase:r.brainstorm.phase,step:w.corePlayback.step,leads:w.leads.map(l=>[l.id,l.disposition&&l.disposition.kind,l.research&&l.research.status].join(":")),passes:w.passes.map(x=>x.status).join(","),messages:r.messages.length}}',rid)
  def open_leads(p,rid):
   loc=p.locator('[data-action="wg-open-leads"][data-run="'+rid+'"]').filter(visible=True)
   if loc.count():loc.first.click();p.wait_for_timeout(150)
   else:p.evaluate('(id)=>{const b=document.createElement("button");b.dataset.run=id;PM56_EXT.run("wg-open-leads",b,new Event("click"))}',rid)
   p.wait_for_selector('.b13-workspace')
  def theme(p,t):
   # crossing NieR Mode's edge plays its reboot moment, whose cover holds presses until the new look is painted
   click(p,'[data-action="open-demo"]');p.locator('[data-input="theme"]').select_option(t);p.wait_for_function('v=>PM56_EXT.ctx().state.theme===v&&!document.getElementById("o55np-reboot")',arg=t,timeout=9000);click(p,'[data-action="close-dialog"]')
  p=None
  try:
   p=fresh();before=p.evaluate('({runs:PM56_COLLAB.runs().length,artifacts:PM56_DATA.artifacts.length,model:PM56_EXT.ctx().state.model,persona:PM56_EXT.ctx().state.persona})');start(p,'leads');click(p,'.collab-configure-foot [data-action="collab-modal-cancel"]');after=p.evaluate('({runs:PM56_COLLAB.runs().length,artifacts:PM56_DATA.artifacts.length,model:PM56_EXT.ctx().state.model,persona:PM56_EXT.ctx().state.persona})');ck('Cancel detached configuration starts no run, artifact, or identity change',before==after);r['cases'].append('cancel-start');p.close()
   p=fresh();start(p,'dissent');commit(p);rid=snap(p)['id'];tid=snap(p)['threadId'];until(p,'(id)=>PM56_COLLAB.run(id).brainstorm.phase==="blind_proposals"',rid)
   p.evaluate('PM56_EXT.ctx().switchThread("query")');ck('Another chat shows no Wonderer run',p.evaluate('!PM56_BATCH13.currentRun()'));until(p,'(id)=>{const r=PM56_COLLAB.run(id);return r.wonderer.leads.some(l=>l.disposition)}',rid)
   ck('While you look at another chat the recording goes on with its own run, and nothing lands in that chat',p.evaluate('(id)=>PM56_COLLAB.run(id).wonderer.leads.some(l=>l.disposition)',rid) and not p.evaluate('PM56_EXT.ctx().thread.messages.some(m=>/Wonderer|Lead \\d/.test(m.body||""))'))
   p.evaluate('(id)=>PM56_EXT.ctx().switchThread(id)',tid);open_leads(p,rid);click(p,'.b13-workspace [data-action="collab-pause"]');p.wait_for_timeout(300);held=wstate(p,rid);p.wait_for_timeout(3500)
   ck('Pause holds the recording where it is: nothing moves while it is paused',held['status']=='paused' and wstate(p,rid)==held)
   click(p,'.b13-workspace [data-action="collab-resume"]');until(p,'(a)=>PM56_COLLAB.run(a.id).wonderer.corePlayback.step>a.step',{'id':rid,'step':held['step']},30000)
   now=dict(x.split(':',1) for x in wstate(p,rid)['leads']);was=dict(x.split(':',1) for x in held['leads'])
   ck('Resume goes on from the same step: every decision made before Pause is kept, none twice',p.evaluate('(id)=>PM56_COLLAB.run(id).status',rid)=='running' and all(now.get(k,'').split(':')[0]==v.split(':')[0] for k,v in was.items() if v.split(':')[0]) and len(now)==len(p.evaluate('(id)=>PM56_COLLAB.run(id).wonderer.leads',rid)))
   r['cases'].append('thread-pause-resume');p.close()
   p=fresh();start(p,'dissent');commit(p);rid=snap(p)['id'];until(p,'(id)=>{const r=PM56_COLLAB.run(id);return ["evidence","vote"].includes(r.brainstorm.phase)}',rid,90000);open_leads(p,rid)
   click(p,'.b13-workspace [data-action="wg-check-it"][data-lead="debounce"]');ck('Check it sends the set-aside lead to research',p.evaluate('(id)=>{const l=PM56_WG.engine.lead(PM56_COLLAB.run(id),"debounce");return !!l.research}',rid))
   p.evaluate('''id=>{const el=document.createElement('button');el.dataset.run=id;PM56_EXT.run('collab-cancel',el,new Event('click'))}''',rid);gone=wstate(p,rid);p.wait_for_timeout(4000)
   ck('Cancel ends the recording: nothing more lands, research included',gone['status']=='canceled' and wstate(p,rid)==gone);ck('Cancel creates no Plan',p.evaluate('!PM56_PLANS.current(PM56_EXT.ctx().thread.id)'))
   ck('The guide offers Replay',p.locator('.b13-guide button').filter(has_text='Replay').count()>=1)
   r['cases'].append('cancel-late-ingress');p.close()
   p=fresh();start(p,'shape');tid=p.evaluate('PM56_EXT.ctx().thread.id');p.evaluate('''()=>{const t=PM56_EXT.ctx().thread,L=PM56_LENS.engine;L.setMode(t.id,'subcompact');L.toggle(t.id,t.messages[0].id);L.toggle(t.id,t.messages[1].id);const p=L.preview(t.id).preview;L.apply(t.id,p.id);const b=document.createElement('button');b.dataset.id=t.messages[3].id;PM56_EXT.run('branch-from-message',b,new Event('click'));}''');ck('Existing branch route inherited only source-valid shaping',p.evaluate('PM56_EXT.ctx().thread.id')!=tid and len(p.evaluate('PM56_LENS.slice(PM56_EXT.ctx().thread.id).ops'))==1);ck('Branch did not inherit preview',p.evaluate('PM56_LENS.slice(PM56_EXT.ctx().thread.id).preview') is None);r['cases'].append('real-branch-dispatch');p.close()
   p=fresh();start(p,'shape');click(p,'[data-action="lens-open"]');p.wait_for_function("()=>{const a=document.querySelector('.pm-lens-trigger').getBoundingClientRect(),m=document.querySelector('.overlay-menu.lens-strip').getBoundingClientRect();return Math.abs(a.right-m.right)<2&&m.width<=301&&document.querySelector('.overlay-menu.lens-strip').getAnimations().every(x=>x.playState!=='running'&&x.playState!=='pending')}");g=p.evaluate('''()=>{const a=document.querySelector('.pm-lens-trigger').getBoundingClientRect(),m=document.querySelector('.overlay-menu.lens-strip').getBoundingClientRect();return {ar:a.right,mr:m.right,ml:m.left,w:m.width}}''');ck('Compact chooser is anchored to Lens button',abs(g['ar']-g['mr'])<2 and g['w']<=301);click(p,'.overlay-menu [data-action="lens-mode"][data-value="mute"]');click(p,'[data-action="lens-toggle"]');click(p,'[data-action="lens-seal"]');click(p,'.lens13-operations summary');p.wait_for_timeout(2600);ck('Lens operations disclosure survives heartbeat redraw',p.locator('.lens13-operations').get_attribute('open') is not None);r['cases'].append('anchor-and-disclosure');p.close()
   p=fresh();start(p,'dissent');commit(p);rid=snap(p)['id'];until(p,'(id)=>{const w=PM56_COLLAB.run(id).wonderer;return w.passes[0].status!=="held"&&w.leads.some(l=>l.dossier)}',rid,90000);open_leads(p,rid)
   ck('Wonderer workspace has no Technical details (card 8)',p.locator('.b13-workspace').evaluate('(e)=>!/Technical details/.test(e.textContent)'))
   d=p.locator('.b13-workspace .wg-dossier').first;d.locator('summary').click();n0=wstate(p,rid)['messages'];until(p,'(a)=>PM56_COLLAB.run(a.id).messages.length>=a.n+2',{'id':rid,'n':n0})
   ck('An opened Dossier stays open while the recording moves on',p.locator('.b13-workspace .wg-dossier').first.get_attribute('open') is not None)
   r['cases'].append('no-tech-and-dossier');p.close()
   p=fresh();start(p,'shape');themes=p.evaluate('PM56_DATA.themes.map(t=>t.id)');r['themes']=themes
   for width in [700,900,1440]:
    p.set_viewport_size({'width':width,'height':900})
    for theme_id in themes:
     theme(p,theme_id);click(p,'[data-action="lens-open"]');click(p,'.overlay-menu [data-action="lens-mode"][data-value="subcompact"]');p.evaluate('''()=>{const c=PM56_EXT.ctx(),L=PM56_LENS.engine;L.clear(c.thread.id);L.toggle(c.thread.id,c.thread.messages[0].id);L.toggle(c.thread.id,c.thread.messages[1].id);L.preview(c.thread.id);c.renderApp();}''');p.wait_for_timeout(180)
     geo=p.evaluate('''()=>[...document.querySelectorAll('.transcript,.lens-inline,.lens13-controls')].map(e=>({c:e.clientWidth,s:e.scrollWidth,h:e.getBoundingClientRect().height}))''');ok=all(x['s']<=x['c']+1 and x['h']>0 for x in geo);ck(f'{theme_id} at {width}: Lens visible, no horizontal overflow',ok);r['matrix'].append({'theme':theme_id,'width':width,'geometry':geo})
     p.screenshot(path=str(o/f'lens-{theme_id}-{width}.png'))
   r['cases'].append('lens-theme-width-matrix');p.close()
   p=fresh();start(p,'dissent');commit(p);rid=snap(p)['id'];open_leads(p,rid)
   for width in [700,900,1440]:
    p.set_viewport_size({'width':width,'height':900})
    for theme_id in themes:
     theme(p,theme_id);p.wait_for_timeout(180);geo=p.locator('.b13-workspace').evaluate('(e)=>({s:e.scrollWidth,c:e.clientWidth})');ck(f'{theme_id} at {width}: Wonderer no horizontal overflow',geo['s']<=geo['c']+1);r['matrix'].append({'theme':theme_id,'width':width,'surface':'wonderer','geometry':geo});p.screenshot(path=str(o/f'wonderer-{theme_id}-{width}.png'))
   r['cases'].append('wonderer-theme-width-matrix');ck('No browser page errors',not r['errors']);ck('Final HTML frozen',(ROOT/'index.html').read_bytes()==raw);r['status']='pass';save()
  except Exception:
   r['status']='fail';r['failure']=traceback.format_exc();save();print(r['failure'])
   if p:
    try:p.screenshot(path=str(o/'failure.png'))
    except Exception:pass
  finally:b.close()
 print(json.dumps({'status':r['status'],'checks':len(r['checks']),'cases':len(r['cases'])},indent=2));return 0 if r['status']=='pass' else 1
if __name__=='__main__':raise SystemExit(main())
