#!/usr/bin/env python3
"""Batch 14 concept checks. Output is external; no installs or source writes.
Node, Python Playwright and Chromium required; Xvfb and FFmpeg for recording.
A 60 Hz acquisition target is not a claim of smooth 60-fps rendering.
"""
import argparse,hashlib,json,os,subprocess,sys,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent

def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('operation',choices=['verify','regressions','record-thorough','record-exhaustive','record-budget','record-blocker']);ap.add_argument('--outdir',type=Path,required=True);a=ap.parse_args();o=a.outdir.resolve()
 if o==ROOT or ROOT in o.parents:ap.error('Output must be outside source tree.')
 o.mkdir(parents=True,exist_ok=True);out=o/'RUN.json'
 if out.exists():ap.error('Use a fresh evidence directory.')
 subprocess.run([sys.executable,str(ROOT/'build.py'),'--check'],check=True)
 raw=(ROOT/'index.html').read_bytes();r={'operation':a.operation,'html_sha256':hashlib.sha256(raw).hexdigest(),'status':'running','commands':[]}
 if a.operation=='verify':
  commands=[['node',str(HERE/'protocol.test.cjs'),str(o/'protocol.json')]]+[[sys.executable,str(HERE/'browser.py'),'--scenario',f,'--outdir',str(o/f)] for f in ['thorough','exhaustive','budget','blocker']]+[[sys.executable,str(HERE/'boundaries.py'),'--outdir',str(o/'boundaries')]]
 elif a.operation=='regressions':
  commands=[[sys.executable,str(HERE.parent/'b11/run.py'),'verify','--outdir',str(o/'b11')],[sys.executable,str(HERE.parent/'b11/run.py'),'regressions','--outdir',str(o/'b01-b10')],[sys.executable,str(HERE.parent/'b11-repair/run.py'),'--outdir',str(o/'repair')],[sys.executable,str(HERE.parent/'b12/run.py'),'verify','--outdir',str(o/'b12')],[sys.executable,str(HERE.parent/'b13/run.py'),'verify','--outdir',str(o/'b13')],[sys.executable,str(HERE.parent/'b13/run.py'),'boundaries','--outdir',str(o/'b13-boundaries')]]
 else:commands=[[sys.executable,str(HERE/'browser.py'),'--scenario',a.operation[7:],'--width','1280','--height','900','--dwell','150','--record','--outdir',str(o/a.operation[7:])]]
 def save():out.write_text(json.dumps(r,indent=2)+'\n')
 save()
 for n,cmd in enumerate(commands):
  start=time.monotonic()
  with open(o/f'command-{n:02d}.log','w') as log:p=subprocess.run(cmd,cwd=ROOT,stdout=log,stderr=log,env={**os.environ,'PM_QA_WORKERS':'1'})
  r['commands'].append({'argv':cmd,'exit_code':p.returncode,'seconds':time.monotonic()-start,'log':f'command-{n:02d}.log'});save()
  if p.returncode and a.operation!='regressions':r['status']='fail';save();return p.returncode
 r['source_unchanged']=(ROOT/'index.html').read_bytes()==raw;r['status']='pass' if r['source_unchanged'] and all(x['exit_code']==0 for x in r['commands']) else 'fail';save();print(json.dumps({'status':r['status'],'report':str(out)}));return 0 if r['status']=='pass' else 1
if __name__=='__main__':raise SystemExit(main())
