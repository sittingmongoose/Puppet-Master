#!/usr/bin/env python3
"""Measure the inherited Lens chooser through entry motion and settled frames.
Both tested documents boot as complete standalone content. The original B13
assertion is not changed: this probe distinguishes transient spring geometry
from persistent placement errors.
"""
import argparse,hashlib,json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--baseline-html',type=Path,required=True);ap.add_argument('--outdir',type=Path,required=True);a=ap.parse_args();o=a.outdir.resolve();o.mkdir(parents=True,exist_ok=True)
if (o/'RESULT.json').exists():ap.error('Use a fresh output directory.')
r={'status':'running','runs':[],'claim_boundary':'DOM geometry sampling during real menu entry, not browser paint timing or a complete motion audit.'}
with sync_playwright() as w:
 b=w.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,path in [('baseline-b13',a.baseline_html),('final-b14',ROOT/'index.html')]:
  raw=path.read_bytes();p=b.new_page(viewport={'width':1440,'height':1000});p.set_content(raw.decode(),wait_until='domcontentloaded');p.wait_for_function('window.__PM56_BOOT_OK')
  p.locator('[data-action="open-demo"]').click();p.wait_for_timeout(100);p.locator('[data-action="b13-start"][data-flow="shape"]').click();p.wait_for_timeout(100)
  p.evaluate('''()=>{window.__anchor={start:performance.now(),rows:[]};function tick(t){const a=document.querySelector('.pm-lens-trigger'),m=document.querySelector('.overlay-menu.lens-strip');if(a&&m){let ar=a.getBoundingClientRect(),mr=m.getBoundingClientRect();__anchor.rows.push({ms:t-__anchor.start,right_error:ar.right-mr.right,width:mr.width,left:mr.left})}if(t-__anchor.start<2600)requestAnimationFrame(tick);else __anchor.done=true}requestAnimationFrame(tick)}''')
  p.locator('[data-action="lens-open"]').click();p.wait_for_function('window.__anchor.done');j=p.evaluate('__anchor');rows=j['rows'];settled=[x for x in rows if x['ms']>=1300];assert len(settled)>10
  verdict=all(abs(x['right_error'])<2 and x['width']<=301 and x['left']>=0 for x in settled)
  # A single early in-bounds observation can precede a later overshoot, which
  # makes a wait-then-separate-read assertion race without any product change.
  good=[i for i,x in enumerate(rows) if abs(x['right_error'])<2 and x['width']<=301]
  race=bool(good and any(abs(x['right_error'])>=2 or x['width']>301 for x in rows[good[0]+1:]))
  r['runs'].append({'build':label,'html_sha256':hashlib.sha256(raw).hexdigest(),'rows':rows,'early_in_bounds_then_out_of_bounds':race,'max_width':max(x['width'] for x in rows),'max_right_error':max(abs(x['right_error']) for x in rows),'settled_pass':verdict});p.screenshot(path=str(o/(label+'.png')));p.close()
 b.close()
r['status']='pass' if all(x['settled_pass'] for x in r['runs']) else 'fail';(o/'RESULT.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps({**{k:r[k] for k in ['status','claim_boundary']},'runs':[{k:v for k,v in x.items() if k!='rows'} for x in r['runs']]},indent=2));raise SystemExit(0 if r['status']=='pass' else 1)
