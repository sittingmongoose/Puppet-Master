#!/usr/bin/env python3
"""Batch 13 source-only verification launcher. Installs nothing; output is external.
Require Node, Python Playwright and Chromium. Recording also requires Xvfb and
FFmpeg. A 60 Hz acquisition target is not a claim of continuous 60 fps rendering.
"""
from pathlib import Path
import argparse,hashlib,json,subprocess,sys
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent

def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('operation',choices=['verify','boundaries','record-shape','record-stale','record-leads','record-dissent']);ap.add_argument('--outdir',type=Path,required=True);a=ap.parse_args();o=a.outdir.resolve()
 if o==ROOT or ROOT in o.parents:ap.error('Choose an output directory outside the source tree.')
 o.mkdir(parents=True,exist_ok=True);report=o/'RUN.json'
 if report.exists():ap.error('Use a new output directory.')
 subprocess.run([sys.executable,str(ROOT/'build.py'),'--check'],check=True)
 raw=(ROOT/'index.html').read_bytes();r={'operation':a.operation,'html_sha256':hashlib.sha256(raw).hexdigest(),'status':'running','commands':[]}
 if a.operation=='verify':
  commands=[['node',str(HERE/'protocol.test.cjs'),str(o/'protocol.json')]]+[[sys.executable,str(HERE/'browser.py'),'--scenario',s,'--outdir',str(o/s)] for s in ['shape','stale','leads','dissent']]
 elif a.operation=='boundaries':commands=[[sys.executable,str(HERE/'boundaries.py'),'--outdir',str(o/'boundaries')]]
 else:commands=[[sys.executable,str(HERE/'browser.py'),'--scenario',a.operation[7:],'--width','1280','--height','900','--dwell','350','--record','--outdir',str(o/a.operation[7:])]]
 report.write_text(json.dumps(r,indent=2)+'\n')
 for cmd in commands:
  p=subprocess.run(cmd,cwd=ROOT);r['commands'].append({'argv':cmd,'exit_code':p.returncode});report.write_text(json.dumps(r,indent=2)+'\n')
  if p.returncode:r['status']='fail';report.write_text(json.dumps(r,indent=2)+'\n');return p.returncode
 r['source_unchanged']=(ROOT/'index.html').read_bytes()==raw;r['status']='pass' if r['source_unchanged'] else 'source_changed';report.write_text(json.dumps(r,indent=2)+'\n');return 0 if r['status']=='pass' else 1
if __name__=='__main__':raise SystemExit(main())
