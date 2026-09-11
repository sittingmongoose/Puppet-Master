#!/usr/bin/env python3
"""Batch 15 final-byte, real-handler and ordinary-control checks. Evidence stays external."""
import argparse,hashlib,json,os,subprocess,sys,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent

def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('operation',choices=['verify','regressions','record']);ap.add_argument('--outdir',type=Path,required=True);a=ap.parse_args();o=a.outdir.resolve()
 if o==ROOT or ROOT in o.parents:ap.error('Evidence must be outside sources.')
 o.mkdir(parents=True,exist_ok=True);target=o/'RUN.json'
 if target.exists():ap.error('Use a fresh evidence directory.')
 subprocess.run([sys.executable,str(ROOT/'build.py'),'--check'],check=True)
 raw=(ROOT/'index.html').read_bytes();r={'operation':a.operation,'status':'running','html_sha256':hashlib.sha256(raw).hexdigest(),'commands':[]}
 py=sys.executable
 if a.operation=='regressions':commands=[[py,str(HERE.parent/'b14/run.py'),op,'--outdir',str(o/op)] for op in ['regressions','verify']]
 elif a.operation=='verify':commands=[[py,str(HERE/'boundaries.py'),'--outdir',str(o/'boundaries')],[py,str(HERE/'surfaces.py'),'--outdir',str(o/'surfaces')]]+[[py,str(HERE/'browser.py'),'--scenario',s,'--width',str(w),'--outdir',str(o/f'{s}-{w}')] for s,w in [('simple',1440),('authority',900),('authority',700),('plan',1440),('plan',700),('scheduled',900),('normal',1440)]]
 else:commands=[[py,str(HERE/'browser.py'),'--scenario',s,'--width',str(w),'--record','--dwell','240','--outdir',str(o/f'{s}-{w}')] for s,w in [('simple',1440),('authority',900),('plan',700),('scheduled',1440)]]
 def save():target.write_text(json.dumps(r,indent=2)+'\n')
 save()
 for n,cmd in enumerate(commands):
  start=time.monotonic()
  with open(o/f'command-{n:02d}.log','w') as log:p=subprocess.run(cmd,cwd=ROOT,stdout=log,stderr=log,env={**os.environ,'PM_QA_WORKERS':'1'})
  r['commands'].append({'argv':cmd,'exit_code':p.returncode,'seconds':time.monotonic()-start,'log':f'command-{n:02d}.log'});save()
 r['source_unchanged']=(ROOT/'index.html').read_bytes()==raw;r['standalone_equal']=(ROOT/'PM_Chat_Assistant_5.6_Pro_Standalone.html').read_bytes()==raw;r['status']='pass' if r['source_unchanged'] and r['standalone_equal'] and all(x['exit_code']==0 for x in r['commands']) else 'fail';save();print(json.dumps({'status':r['status'],'report':str(target)}));return 0 if r['status']=='pass' else 1
if __name__=='__main__':raise SystemExit(main())
