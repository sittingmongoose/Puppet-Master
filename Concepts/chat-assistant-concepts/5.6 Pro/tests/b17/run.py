#!/usr/bin/env python3
"""Bounded Batch 17 groups on frozen HTML; no installation, Git write, or push.
Actual archive testing is a separate group and must use the deliverable ZIPs.
"""
import argparse,hashlib,json,os,subprocess,sys,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent

def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('group',choices=['handlers','surfaces','regressions','record']);ap.add_argument('--outdir',type=Path,required=True);a=ap.parse_args();o=a.outdir.resolve()
 if o==ROOT or ROOT in o.parents:ap.error('Evidence must be external')
 o.mkdir(parents=True,exist_ok=True);target=o/'RUN.json'
 if target.exists():ap.error('Use a fresh output path')
 raw=(ROOT/'index.html').read_bytes();py=sys.executable
 if a.group=='handlers':commands=[[py,str(HERE/'boundaries.py'),'--outdir',str(o/'cases')]]
 elif a.group=='regressions':
  # Retain original tests; apply only hash-pinned current-owner test adaptations
  # in an external corpus. ADAPTATION.json records every changed test span.
  from legacy_current_contract import prepare
  scratch=prepare(ROOT,o/'current-contract-corpus')
  commands=[[py,str(scratch/'tests/b16/run.py'),op,'--outdir',str(o/op)] for op in ['core','regressions','surfaces']]
 else:
  scenes=[(s,w,'orbit') for s in ['recovery','documents','revision'] for w in [1440,900,700]] if a.group=='surfaces' else [('recovery',1440,'orbit'),('documents',900,'orbit'),('revision',700,'orbit'),('recovery',900,'simple')]
  commands=[[py,str(HERE/'browser.py'),'--scenario',s,'--width',str(w),'--variant',v,'--outdir',str(o/f'{s}-{w}-{v}')]+(['--record','--dwell','180'] if a.group=='record' else []) for s,w,v in scenes]
 r={'status':'running','group':a.group,'html_sha256':hashlib.sha256(raw).hexdigest(),'commands':[]}
 def save():target.write_text(json.dumps(r,indent=2)+'\n')
 save()
 for i,cmd in enumerate(commands):
  start=time.monotonic()
  with (o/f'command-{i:02}.log').open('w') as log:
   try:p=subprocess.run(cmd,cwd=ROOT,stdout=log,stderr=log,env={**os.environ,'PM_QA_WORKERS':'1'},timeout=2400);code=p.returncode
   except subprocess.TimeoutExpired:code=124
  r['commands'].append({'argv':cmd,'exit_code':code,'seconds':time.monotonic()-start,'log':f'command-{i:02}.log'});save();print(a.group,i,code,flush=True)
 r['frozen_html_unchanged']=(ROOT/'index.html').read_bytes()==raw;r['standalone_equal']=(ROOT/'PM_Chat_Assistant_5.6_Pro_Standalone.html').read_bytes()==raw
 r['status']='pass' if r['commands'] and all(x['exit_code']==0 for x in r['commands']) and r['frozen_html_unchanged'] and r['standalone_equal'] else 'fail';save();return 0 if r['status']=='pass' else 1
if __name__=='__main__':raise SystemExit(main())
