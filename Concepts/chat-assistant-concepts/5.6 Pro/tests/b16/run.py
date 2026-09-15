#!/usr/bin/env python3
"""Bounded Batch 16 verification entry point. No installations or repository writes.
Results go outside the source tree. 'regressions' runs the retained B1-B15 corpus.
'core' and 'surfaces' are separate from actual final archive installer testing.
"""
import argparse,hashlib,json,os,subprocess,sys,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent

def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('operation',choices=['core','surfaces','regressions','record']);ap.add_argument('--outdir',type=Path,required=True);a=ap.parse_args();o=a.outdir.resolve()
 if o==ROOT or ROOT in o.parents:ap.error('Choose an external output directory')
 o.mkdir(parents=True,exist_ok=True);target=o/'RUN.json'
 if target.exists():ap.error('Choose a fresh result directory')
 raw=(ROOT/'index.html').read_bytes();r={'operation':a.operation,'status':'running','html_sha256':hashlib.sha256(raw).hexdigest(),'commands':[]};py=sys.executable
 if a.operation=='core':
  commands=[['node',str(HERE/'graph.js')],['node',str(HERE/'controller.js')],[py,str(HERE/'boundaries.py'),'--outdir',str(o/'handlers')]]
 elif a.operation=='regressions':commands=[[py,str(HERE.parent/'b15/run.py'),op,'--outdir',str(o/op)] for op in ['regressions','verify']]
 else:
  scenes=[(s,w,'orbit') for s in ['parallel','restructure','large'] for w in [1440,900,700]] if a.operation=='surfaces' else [('parallel',1440,'orbit'),('restructure',700,'orbit'),('large',900,'orbit'),('parallel',900,'simple')]
  commands=[[py,str(HERE/'browser.py'),'--scenario',s,'--width',str(w),'--height','1000','--variant',v,'--outdir',str(o/f'{s}-{w}-{v}')]+(['--record','--dwell','150'] if a.operation=='record' else []) for s,w,v in scenes]
 def save():target.write_text(json.dumps(r,indent=2)+'\n')
 save()
 for n,cmd in enumerate(commands):
  start=time.monotonic()
  with (o/f'command-{n:02d}.log').open('w') as log:p=subprocess.run(cmd,cwd=ROOT,stdout=log,stderr=log,env={**os.environ,'PM_QA_WORKERS':'1'})
  r['commands'].append({'argv':cmd,'exit_code':p.returncode,'seconds':time.monotonic()-start,'log':f'command-{n:02d}.log'});save()
 r['frozen_html_unchanged']=(ROOT/'index.html').read_bytes()==raw;r['status']='pass' if r['frozen_html_unchanged'] and all(x['exit_code']==0 for x in r['commands']) else 'fail';save();print(json.dumps({'status':r['status'],'report':str(target)}));return 0 if r['status']=='pass' else 1
if __name__=='__main__':raise SystemExit(main())
