#!/usr/bin/env python3
"""Run adversarial tests of actual application handlers, not a mock protocol."""
import argparse,hashlib,json,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--outdir',type=Path,required=True);ap.add_argument('--case');a=ap.parse_args();o=a.outdir.resolve();o.mkdir(parents=True,exist_ok=True);target=o/'RESULT.json'
 if target.exists():ap.error('Use a fresh output directory')
 raw=(ROOT/'index.html').read_bytes();driver=(HERE/'handler-cases.js').read_text();r={'status':'running','html_sha256':hashlib.sha256(raw).hexdigest(),'driver_sha256':hashlib.sha256(driver.encode()).hexdigest(),'cases':[],'scope':'actual concept handlers; controlled fault injection is not ordinary interaction or native evidence'}
 def save():target.write_text(json.dumps(r,indent=2)+'\n')
 with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  probe=b.new_page();probe.set_content(raw.decode(),wait_until='domcontentloaded');probe.wait_for_function('window.__PM56_BOOT_OK');probe.evaluate(driver);names=probe.evaluate('Object.keys(B15_CASES)');probe.close()
  for name in names:
   if a.case and name!=a.case:continue
   row={'name':name,'status':'running','checks':[],'errors':[]};r['cases'].append(row);save();cx=b.new_context(viewport={'width':1440,'height':1000});p=cx.new_page();p.set_default_timeout(7000);p.on('pageerror',lambda e:row['errors'].append(str(e)))
   def check(n,v):row['checks'].append({'name':n,'pass':bool(v)});save()
   p.expose_function('recordCheck',check)
   try:
    p.set_content(raw.decode(),wait_until='domcontentloaded');p.wait_for_function('window.__PM56_BOOT_OK');p.evaluate(driver);p.evaluate('async name=>{window.__checks=[];await B15_CASES[name]((n,v)=>{__checks.push({name:n,pass:!!v});if(!v)throw Error(n)});return __checks}',name);row['checks']=p.evaluate('__checks')
    # Synchronous test callbacks also fail through the recorded result gate.
    p.wait_for_timeout(120);assert row['checks'] and all(c['pass'] for c in row['checks']), 'Failed recorded assertion'
    assert not row['errors'],row['errors'];assert not p.evaluate('PM56_EXT.collisions'),'Action collisions';row['status']='pass'
   except Exception:row['status']='fail';row['failure']=traceback.format_exc();row['checks']=p.evaluate('window.__checks||[]');p.screenshot(path=str(o/(name+'-failure.png')))
   finally:cx.close();save()
   print(name,row['status'],len(row['checks']),flush=True)
  b.close()
 r['frozen_html_unchanged']=(ROOT/'index.html').read_bytes()==raw;r['status']='pass' if r['cases'] and all(c['status']=='pass' for c in r['cases']) and r['frozen_html_unchanged'] else 'fail';r['assertions']=sum(len(c['checks']) for c in r['cases']);save();return 0 if r['status']=='pass' else 1
if __name__=='__main__':raise SystemExit(main())
