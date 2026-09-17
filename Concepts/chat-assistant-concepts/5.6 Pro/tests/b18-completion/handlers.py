#!/usr/bin/env python3
"""Fresh-context tests against the complete frozen HTML and actual commands."""
import argparse,hashlib,json,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--outdir',type=Path,required=True);ap.add_argument('--case');a=ap.parse_args();a.outdir.mkdir(parents=True,exist_ok=True);target=a.outdir/'RESULT.json'
 if target.exists():ap.error('Use a fresh directory')
 raw=(ROOT/'index.html').read_bytes();driver='\n'.join((ROOT/'tests/b18-completion'/name).read_text() for name in ['handlers.js']);out={'status':'running','html_sha256':hashlib.sha256(raw).hexdigest(),'driver_sha256':hashlib.sha256(driver.encode()).hexdigest(),'cases':[]}
 def save():target.write_text(json.dumps(out,indent=2)+'\n')
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  p=browser.new_page();p.set_content(raw.decode(),wait_until='domcontentloaded');p.wait_for_function('window.__PM56_BOOT_OK');p.evaluate(driver);names=p.evaluate('Object.keys(B18_CASES)');p.close()
  for name in names:
   if a.case and name!=a.case:continue
   row={'name':name,'status':'running','errors':[],'checks':[]};out['cases'].append(row);save();cx=browser.new_context(viewport={'width':1440,'height':1000});p=cx.new_page();p.on('pageerror',lambda e:row['errors'].append(str(e)))
   try:
    p.set_content(raw.decode(),wait_until='domcontentloaded');p.wait_for_function('window.__PM56_BOOT_OK');p.evaluate(driver)
    p.evaluate('''async n=>{window.__checks=[];await B18_CASES[n]((name,pass)=>{__checks.push({name,pass:!!pass});if(!pass)throw Error(name)});}''',name)
    row['checks']=p.evaluate('__checks');assert row['checks'] and all(x['pass'] for x in row['checks']);assert not row['errors'];assert not p.evaluate('PM56_EXT.collisions');row['status']='pass'
   except Exception:row['status']='fail';row['failure']=traceback.format_exc();row['checks']=p.evaluate('window.__checks||[]');p.screenshot(path=str(a.outdir/(name+'.png')))
   cx.close();save();print(name,row['status'],len(row['checks']),flush=True)
  browser.close()
 out['source_unchanged']=(ROOT/'index.html').read_bytes()==raw;out['status']='pass' if out['cases'] and out['source_unchanged'] and all(x['status']=='pass' for x in out['cases']) else 'fail';out['assertions']=sum(len(x['checks']) for x in out['cases']);save();return 0 if out['status']=='pass' else 1
if __name__=='__main__':raise SystemExit(main())
