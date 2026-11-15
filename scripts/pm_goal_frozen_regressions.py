#!/usr/bin/env python3
"""Read-only execution of canon-pinned restore regression programs.

This preserves their original assertions and catches. It earns regression
credit only: it supplies no guard proof, mutation kill or native claim.
All attempted artifact writes are redirected to the selected evidence folder.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[1]


def pins():
    d=json.loads((ROOT/'Plans/restore_point_deleted_contract_fixtures.json').read_text())
    out={}
    for key in ('frozen_joined_subject','retained_phase_subject','pending_schema_source','curated_pending_value_source','pending_recovery_subject'):
        row=d[key];p=Path(row['path']);actual=hashlib.sha256(p.read_bytes()).hexdigest()
        if actual!=row['sha256']:raise ValueError('Canon pin mismatch: '+key)
        out[str(p)]=actual
        if p.name=='manifest.json':
            for entry in json.loads(p.read_text())['files']:
                q=Path(entry['path']);q=q if q.is_absolute()else p.parent/q
                h=hashlib.sha256(q.read_bytes()).hexdigest()
                if h!=entry['sha256']:raise ValueError('Manifest file mismatch: '+str(q))
                out[str(q)]=h
    return d,out


def child(script,out):
    out.mkdir(parents=True,exist_ok=True)
    original_text=Path.write_text;original_bytes=Path.write_bytes
    writes=[]
    def target(path):
        return out/(hashlib.sha256(str(path).encode()).hexdigest()[:16]+'-'+path.name)
    def write_text(path,data,*args,**kwargs):
        q=target(path);result=original_text(q,data,*args,**kwargs)
        writes.append(dict(original_path=str(path),capture=str(q),sha256=hashlib.sha256(q.read_bytes()).hexdigest()))
        return result
    def write_bytes(path,data,*args,**kwargs):
        q=target(path);result=original_bytes(q,data,*args,**kwargs)
        writes.append(dict(original_path=str(path),capture=str(q),sha256=hashlib.sha256(q.read_bytes()).hexdigest()))
        return result
    Path.write_text=write_text;Path.write_bytes=write_bytes
    sys.dont_write_bytecode=True;sys.path.insert(0,str(script.parent))
    try:exec(compile(script.read_text(),str(script),'exec'),{'__name__':'__main__','__file__':str(script)})
    finally:
        Path.write_text=original_text;Path.write_bytes=original_bytes
        (out/'redirected-writes.json').write_text(json.dumps(writes,indent=1)+'\n')


def main():
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--out',type=Path,required=True);ap.add_argument('--child',type=Path)
    args=ap.parse_args()
    if args.child:child(args.child,args.out);return 0
    d,before=pins();args.out.mkdir(parents=True,exist_ok=True)
    phase=Path(d['retained_phase_subject']['path']).parent
    pending=Path(d['pending_recovery_subject']['path']).parent
    scripts=[phase/'test_phases.py',phase/'check_final_boundaries.py']+sorted(pending.glob('test_*.py'))
    results=[]
    for script in scripts:
        folder=args.out/(script.parent.parent.name+'-'+script.stem)
        log=args.out/(script.parent.parent.name+'-'+script.stem+'.log')
        with log.open('w')as handle:
            run=subprocess.run([sys.executable,str(Path(__file__).resolve()),'--child',str(script),'--out',str(folder)],stdout=handle,stderr=subprocess.STDOUT)
        results.append(dict(script=str(script),source_sha256=hashlib.sha256(script.read_bytes()).hexdigest(),exit_code=run.returncode,log=str(log),log_sha256=hashlib.sha256(log.read_bytes()).hexdigest()))
        print(script.name,'PASS'if run.returncode==0 else'FAIL',flush=True)
    _,after=pins()
    report=dict(status='PASS'if before==after and all(x['exit_code']==0 for x in results)else'FAIL',frozen_bytes_unchanged=before==after,pinned_files=len(before),runs=results,guard_credit=0,mutation_kill_credit=0,native_execution='NOT_RUN')
    (args.out/'regressions.json').write_text(json.dumps(report,indent=1)+'\n')
    return int(report['status']!='PASS')


if __name__=='__main__':sys.exit(main())
