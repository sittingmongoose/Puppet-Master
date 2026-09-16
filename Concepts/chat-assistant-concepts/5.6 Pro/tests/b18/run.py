#!/usr/bin/env python3
"""Bounded B18 groups; each command has its own external receipt and log."""
import argparse,hashlib,json,os,subprocess,sys,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent

def main():
 ap=argparse.ArgumentParser();ap.add_argument('group',choices=['handlers','surfaces','record','regressions']);ap.add_argument('--outdir',type=Path,required=True);a=ap.parse_args();o=a.outdir.resolve()
 if o==ROOT or ROOT in o.parents:ap.error('External evidence only')
 o.mkdir(parents=True,exist_ok=True);target=o/'RUN.json'
 if target.exists():ap.error('Use a fresh group output directory')
 raw=(ROOT/'index.html').read_bytes();py=sys.executable
 if a.group=='handlers':commands=[['node',str(HERE/'time.cjs')],[py,str(HERE/'handlers.py'),'--outdir',str(o/'cases')]]
 elif a.group=='regressions':commands=[[py,str(HERE.parent/'b17/boundaries.py'),'--outdir',str(o/'b17')],[py,str(HERE.parent/'b17/run.py'),'regressions','--outdir',str(o/'b01-b16')]]
 else:
  scenes=[(s,w,'orbit') for s in ['messages','windows'] for w in [1440,900,700]] if a.group=='surfaces' else [('messages',1440,'orbit'),('windows',900,'orbit'),('messages',700,'orbit'),('windows',700,'simple')]
  commands=[[py,str(HERE/'browser.py'),'--scenario',s,'--width',str(w),'--variant',v,'--outdir',str(o/f'{s}-{w}-{v}')]+(['--record'] if a.group=='record' else []) for s,w,v in scenes]
 r={'status':'running','group':a.group,'html_sha256':hashlib.sha256(raw).hexdigest(),'commands':[]}
 def save():target.write_text(json.dumps(r,indent=2)+'\n')
 save()
 for i,cmd in enumerate(commands):
  start=time.monotonic()
  with (o/f'command-{i:02}.log').open('w') as f:
   try:code=subprocess.run(cmd,cwd=ROOT,stdout=f,stderr=f,env={**os.environ,'PM_QA_WORKERS':'1'},timeout=2400).returncode
   except subprocess.TimeoutExpired:code=124
  row={'argv':cmd,'exit_code':code,'seconds':time.monotonic()-start,'log':f'command-{i:02}.log'};r['commands'].append(row);save();print(a.group,i,code,flush=True)
  if code and a.group!='regressions':break
 r['frozen_html_unchanged']=(ROOT/'index.html').read_bytes()==raw;r['standalone_equal']=(ROOT/'PM_Chat_Assistant_5.6_Pro_Standalone.html').read_bytes()==raw
 r['status']='pass' if len(r['commands'])==len(commands) and all(c['exit_code']==0 for c in r['commands']) and r['frozen_html_unchanged'] and r['standalone_equal'] else 'fail';save();return 0 if r['status']=='pass' else 1
if __name__=='__main__':raise SystemExit(main())
