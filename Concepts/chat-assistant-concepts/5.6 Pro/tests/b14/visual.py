#!/usr/bin/env python3
"""Settled narrow-layout screenshots and existing Step Rail Simple controls.
Complements (does not replace) the 48-cell geometry sweep and recordings.
"""
import argparse,hashlib,json,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--outdir',type=Path,required=True);a=ap.parse_args();o=a.outdir.resolve();o.mkdir(parents=True,exist_ok=True);out=o/'RESULT.json'
 if out.exists():ap.error('Use a fresh evidence directory.')
 raw=(ROOT/'index.html').read_bytes();r={'status':'running','html_sha256':hashlib.sha256(raw).hexdigest(),'checks':[],'screenshots':[],'errors':[]}
 def save():out.write_text(json.dumps(r,indent=2)+'\n')
 def ck(n,v):r['checks'].append({'name':n,'pass':bool(v)});save();assert v,n
 try:
  with sync_playwright() as w:
   b=w.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage']);c=b.new_context(viewport={'width':900,'height':1000});p=c.new_page();p.on('pageerror',lambda e:r['errors'].append(str(e)));p.set_default_timeout(8000);p.set_content(raw.decode(),wait_until='domcontentloaded');p.wait_for_function('window.__PM56_BOOT_OK')
   def click(sel):p.locator(sel).filter(visible=True).first.click();p.wait_for_timeout(160)
   def shot(name):p.mouse.move(12,35);p.wait_for_timeout(1300);p.screenshot(path=str(o/(name+'.png')));r['screenshots'].append(name+'.png')
   click('[data-action="open-demo"]');click('[data-action="b14-start"][data-flow="thorough"]');click('[data-action="send"]');click('[data-action="b14-hide-guide"]');click('[data-action="b14-open"]');click('[data-action="b14-research"][data-key="fields"]');p.wait_for_function('PM56_DEEP_PLAN.snapshot().questions.find(q=>q.key==="fields").state==="researched"')
   for width,theme in [(700,'basic-dark'),(900,'basic-dark'),(700,'friendly-light'),(900,'friendly-light'),(700,'glass-dark'),(900,'glass-dark')]:
    p.set_viewport_size({'width':width,'height':1000});click('[data-action="open-demo"]');p.locator('[data-input="theme"]').select_option(theme);click('[data-action="close-dialog"]');shot(f'settled-{width}-{theme}-discovery')
    ck(f'{width} {theme} settled discovery visible',p.locator('.deep14-workspace').is_visible() and p.locator('.deep14-workspace').evaluate('e=>Number(getComputedStyle(e).opacity)')>.98)
    click('[data-action="b14-questions"]');shot(f'settled-{width}-{theme}-questions');ck(f'{width} {theme} shared questionnaire visible',p.locator('.decision-host .qs-reel').is_visible())
    click('.decision-host [data-action="close-decision"]');click('[data-action="b14-open"]')
   ck('Visual review does not charge the same round again',p.evaluate('PM56_DEEP_PLAN.snapshot().budget.questions_asked')==2)
   p.set_viewport_size({'width':1440,'height':1000});click('[data-action="open-demo"]');p.locator('[data-input="theme"]').select_option('basic-dark');p.locator('[data-input="variant"][data-family="2"]').first.select_option('8');ck('Step Rail Simple selected through public control',p.evaluate('PM56_EXT.ctx().state.variants[2]')==8)
   click('[data-action="repair-demo"][data-scenario="work-simple"]');p.wait_for_timeout(1200)
   card=p.locator('.working-card').filter(visible=True).last;card.scroll_into_view_if_needed();wid=card.get_attribute('data-card');r['working_card']=wid
   def rec():return p.evaluate('(id)=>{let s=PM56_EXT.ctx().state;return id!=="primary"&&s.works[id]||s.work}',wid)
   def control(a):p.locator('.working-card[data-card="'+wid+'"] [data-action="'+a+'"]').first.click();p.wait_for_timeout(160)
   ck('Existing activity card uses simplified variant',int(card.get_attribute('data-working-variant'))==8)
   if rec()['running']:control('pause-working')
   ck('Pause uses the existing work owner',not rec()['running']);step=rec()['step'];control('step-working');ck('Step advances an existing operation',rec()['step']>step);control('start-working');ck('Resume starts existing sequence',rec()['running']);p.wait_for_timeout(1100);control('pause-working');control('toggle-work-history');ck('History remains independently operable',rec()['expanded']);shot('step-rail-simple-history')
   ck('No browser error',not r['errors']);ck('Frozen generated HTML unchanged',(ROOT/'index.html').read_bytes()==raw);r['status']='pass';save();b.close()
 except Exception:r['status']='fail';r['failure']=traceback.format_exc();save();print(r['failure'])
 print(json.dumps({'status':r['status'],'checks':len(r['checks']),'report':str(out)}));return 0 if r['status']=='pass' else 1
if __name__=='__main__':raise SystemExit(main())
