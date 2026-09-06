#!/usr/bin/env python3
"""Reproduce T49 from a verified immutable published TestPMConcept checkpoint.
Usage: python build_testpm_assistant_settings.py [--out ...] [--check]
The full upstream builder remains subject to its own unchanged gates.
"""
from pathlib import Path
import argparse,hashlib,json,re,subprocess,tempfile
import assistant_settings_source as source
HERE=Path(__file__).resolve().parent
BASE=HERE/'base/TestPMConcept-assistant-settings-base.html'
PIN=json.loads((HERE/'assistant_settings_checkpoint.json').read_text())
def need(ok,why):
    if not ok:raise SystemExit(why)
def run():
    args=argparse.ArgumentParser();args.add_argument('--out',type=Path,default=HERE.parent/'TestPMConcept.html');args.add_argument('--check',action='store_true');args.add_argument('--report',type=Path);a=args.parse_args()
    raw=BASE.read_bytes();need(hashlib.sha256(raw).hexdigest()==PIN['sha256'],'Checkpoint hash mismatch; do not silently repin')
    before=raw.decode('utf-8');notes={};after=source.apply(before,notes,need)
    # Exact all-non-Settings script equality, not merely a token scan.
    pattern=r'<script\b([^>]*)>(.*?)</script>'
    old=re.findall(pattern,before,re.S);new=re.findall(pattern,after,re.S)
    need(len(old)==len(new),'Unexpected script added or removed')
    for (attrs,a0),(attrs1,a1) in zip(old,new):
        need(attrs==attrs1,'Script identity drift')
        if not any('id="'+x+'"' in attrs for x in ['pm4-settings-js','pm7-settings-data']):need(a0==a1,'Non-Settings source changed: '+attrs)
    with tempfile.TemporaryDirectory() as tmp:
        checked=0
        for i,(attrs,body) in enumerate(new):
            if 'application/json' in attrs:json.loads(body);continue
            if not body.strip():continue
            f=Path(tmp)/(str(i)+'.js');f.write_text(body);r=subprocess.run(['node','--check',str(f)],capture_output=True,text=True)
            need(r.returncode==0,r.stderr);checked+=1
    data=after.encode('utf-8');report={'build':'verified_checkpoint_plus_T49','upstream_complete_build':'blocked before T49 by pre-existing T45 tour source/guard mismatch','checkpoint':PIN,'transform':notes,'script_syntax_checks':checked,'output_sha256':hashlib.sha256(data).hexdigest(),'all_non_settings_scripts_byte_identical':True}
    if a.check:need(a.out.is_file() and a.out.read_bytes()==data,'Output differs from a fresh checkpoint build')
    else:a.out.parent.mkdir(parents=True,exist_ok=True);a.out.write_bytes(data)
    if a.report:a.report.parent.mkdir(parents=True,exist_ok=True);a.report.write_text(json.dumps(report,indent=2)+'\n')
    print(('Checked' if a.check else 'Built')+' '+str(a.out)+' '+report['output_sha256'][:16]);print('All non-Settings scripts identical; '+str(checked)+' scripts parse.')
if __name__=='__main__':run()
