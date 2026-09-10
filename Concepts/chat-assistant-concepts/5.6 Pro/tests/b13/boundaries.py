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
   p=b.new_page(viewport={'width':1440,'height':1000});p.set_default_timeout(7000);p.on('pageerror',lambda e:r['errors'].append(str(e)));p.set_content(raw.decode('utf-8'),wait_until='domcontentloaded');p.wait_for_function('window.__PM56_BOOT_OK');return p
  def click(p,s):p.locator(s).filter(visible=True).first.click();p.wait_for_timeout(100)
  def start(p,flow):click(p,'[data-action="open-demo"]');click(p,f'[data-action="b13-start"][data-flow="{flow}"]')
  def commit(p):click(p,'[data-action="collab-modal-commit"]')
  def snap(p):return p.evaluate('PM56_BATCH13.currentRun()')
  p=None
  try:
   p=fresh();before=p.evaluate('({runs:PM56_COLLAB.runs().length,artifacts:PM56_DATA.artifacts.length,model:PM56_EXT.ctx().state.model,persona:PM56_EXT.ctx().state.persona})');start(p,'leads');click(p,'.collab-configure-foot [data-action="collab-modal-cancel"]');after=p.evaluate('({runs:PM56_COLLAB.runs().length,artifacts:PM56_DATA.artifacts.length,model:PM56_EXT.ctx().state.model,persona:PM56_EXT.ctx().state.persona})');ck('Cancel detached configuration starts no run, artifact, or identity change',before==after);r['cases'].append('cancel-start');p.close()
   p=fresh();start(p,'leads');commit(p);rid=snap(p)['id'];tid=snap(p)['threadId'];click(p,'[data-action="b13-open"]');click(p,'[data-action="b13-research"][data-lead="fence"]');p.evaluate('PM56_EXT.ctx().switchThread("query")');p.wait_for_timeout(1550);ck('Late callback stays with original run after thread switch',p.evaluate('(id)=>PM56_COLLAB.run(id).wonderer.leads[0].state',rid)=='researched');ck('Other thread receives no Wonderer record',p.evaluate('!PM56_BATCH13.currentRun()'));p.evaluate('(id)=>PM56_EXT.ctx().switchThread(id)',tid);click(p,'[data-action="b13-open"]');click(p,'[data-action="b13-research"][data-lead="fence"]');click(p,'.b13-workspace [data-action="collab-pause"]');p.wait_for_timeout(1600);ck('Pause fences in-flight local research',bool(snap(p)['wonderer']['rejected']));ck('Pause stays owner state',snap(p)['status']=='paused');click(p,'.b13-workspace [data-action="collab-resume"]');ck('Resume does not silently replay or include result',not snap(p)['wonderer']['leads'][0]['included']);click(p,'[data-action="b13-research"][data-lead="fence"]');p.wait_for_timeout(1500);ck('Explicit retry after resume succeeds',snap(p)['wonderer']['leads'][0]['state']=='researched');r['cases'].append('thread-pause-resume');p.close()
   p=fresh();start(p,'leads');commit(p);rid=snap(p)['id'];click(p,'[data-action="b13-open"]');click(p,'[data-action="b13-research"][data-lead="fence"]');p.evaluate('''id=>{const el=document.createElement('button');el.dataset.run=id;PM56_EXT.run('collab-cancel',el,new Event('click'))}''',rid);p.wait_for_timeout(1600);ck('Existing owner cancel rejects late research',snap(p)['status']=='canceled' and bool(snap(p)['wonderer']['rejected']));ck('Cancel creates no Plan',p.evaluate('!PM56_PLANS.current(PM56_EXT.ctx().thread.id)'));r['cases'].append('cancel-late-ingress');p.close()
   p=fresh();start(p,'shape');tid=p.evaluate('PM56_EXT.ctx().thread.id');p.evaluate('''()=>{const t=PM56_EXT.ctx().thread,L=PM56_LENS.engine;L.setMode(t.id,'subcompact');L.toggle(t.id,t.messages[0].id);L.toggle(t.id,t.messages[1].id);const p=L.preview(t.id).preview;L.apply(t.id,p.id);const b=document.createElement('button');b.dataset.id=t.messages[3].id;PM56_EXT.run('branch-from-message',b,new Event('click'));}''');ck('Existing branch route inherited only source-valid shaping',p.evaluate('PM56_EXT.ctx().thread.id')!=tid and len(p.evaluate('PM56_LENS.slice(PM56_EXT.ctx().thread.id).ops'))==1);ck('Branch did not inherit preview',p.evaluate('PM56_LENS.slice(PM56_EXT.ctx().thread.id).preview') is None);r['cases'].append('real-branch-dispatch');p.close()
   p=fresh();start(p,'shape');click(p,'[data-action="lens-open"]');p.wait_for_function("()=>{const a=document.querySelector('.pm-lens-trigger').getBoundingClientRect(),m=document.querySelector('.overlay-menu.lens-strip').getBoundingClientRect();return Math.abs(a.right-m.right)<2&&m.width<=301}");g=p.evaluate('''()=>{const a=document.querySelector('.pm-lens-trigger').getBoundingClientRect(),m=document.querySelector('.overlay-menu.lens-strip').getBoundingClientRect();return {ar:a.right,mr:m.right,ml:m.left,w:m.width}}''');ck('Compact chooser is anchored to Lens button',abs(g['ar']-g['mr'])<2 and g['w']<=301);click(p,'.overlay-menu [data-action="lens-mode"][data-value="mute"]');click(p,'[data-action="lens-toggle"]');click(p,'[data-action="lens-seal"]');click(p,'.lens13-operations summary');p.wait_for_timeout(2600);ck('Lens operations disclosure survives heartbeat redraw',p.locator('.lens13-operations').get_attribute('open') is not None);r['cases'].append('anchor-and-disclosure');p.close()
   p=fresh();start(p,'leads');commit(p);click(p,'[data-action="b13-open"]');click(p,'.b13-technical summary');click(p,'[data-action="b13-core"]');p.wait_for_timeout(800);ck('Wonderer technical disclosure survives async redraw',p.locator('.b13-technical').get_attribute('open') is not None);p.locator('[data-lead-id="fence"] textarea').fill('Unsent disposition explanation');p.wait_for_timeout(1000);ck('Disposition draft survives core progress',p.locator('[data-lead-id="fence"] textarea').input_value()=='Unsent disposition explanation');r['cases'].append('disclosure-and-draft');p.close()
   p=fresh();start(p,'shape');themes=p.evaluate('PM56_DATA.themes.map(t=>t.id)');r['themes']=themes
   for width in [700,900,1440]:
    p.set_viewport_size({'width':width,'height':900})
    for theme in themes:
     click(p,'[data-action="open-demo"]');p.locator('[data-input="theme"]').select_option(theme);click(p,'[data-action="close-dialog"]');click(p,'[data-action="lens-open"]');click(p,'.overlay-menu [data-action="lens-mode"][data-value="subcompact"]');p.evaluate('''()=>{const c=PM56_EXT.ctx(),L=PM56_LENS.engine;L.clear(c.thread.id);L.toggle(c.thread.id,c.thread.messages[0].id);L.toggle(c.thread.id,c.thread.messages[1].id);L.preview(c.thread.id);c.renderApp();}''');p.wait_for_timeout(180)
     geo=p.evaluate('''()=>[...document.querySelectorAll('.transcript,.lens-inline,.lens13-controls')].map(e=>({c:e.clientWidth,s:e.scrollWidth,h:e.getBoundingClientRect().height}))''');ok=all(x['s']<=x['c']+1 and x['h']>0 for x in geo);ck(f'{theme} at {width}: Lens visible, no horizontal overflow',ok);r['matrix'].append({'theme':theme,'width':width,'geometry':geo})
     p.screenshot(path=str(o/f'lens-{theme}-{width}.png'))
   r['cases'].append('lens-theme-width-matrix');p.close()
   p=fresh();start(p,'leads');commit(p);click(p,'[data-action="b13-open"]')
   for width in [700,900,1440]:
    p.set_viewport_size({'width':width,'height':900})
    for theme in themes:
     click(p,'[data-action="open-demo"]');p.locator('[data-input="theme"]').select_option(theme);click(p,'[data-action="close-dialog"]');p.wait_for_timeout(180);geo=p.locator('.b13-workspace').evaluate('(e)=>({s:e.scrollWidth,c:e.clientWidth})');ck(f'{theme} at {width}: Wonderer no horizontal overflow',geo['s']<=geo['c']+1);r['matrix'].append({'theme':theme,'width':width,'surface':'wonderer','geometry':geo});p.screenshot(path=str(o/f'wonderer-{theme}-{width}.png'))
   r['cases'].append('wonderer-theme-width-matrix');ck('No browser page errors',not r['errors']);ck('Final HTML frozen',(ROOT/'index.html').read_bytes()==raw);r['status']='pass';save()
  except Exception:
   r['status']='fail';r['failure']=traceback.format_exc();save();print(r['failure'])
   if p:
    try:p.screenshot(path=str(o/'failure.png'))
    except Exception:pass
  finally:b.close()
 print(json.dumps({'status':r['status'],'checks':len(r['checks']),'cases':len(r['cases'])},indent=2));return 0 if r['status']=='pass' else 1
if __name__=='__main__':raise SystemExit(main())
