#!/usr/bin/env python3
"""Run the gated Method B tool on DCW tables, in bounded serial groups.

Collect complete-path observations first (--collect). --from-collection avoids
repeating fixture construction for each independent table batch. Large raw
reports belong on local disk, not in this repository.
"""
import argparse
import importlib
import json
import pickle
import signal
import time
from pathlib import Path

import pm_guard_isolation as g
from pm_dcw_guard_suites import collect, suite_for


def memory():
    return int(next(l.split()[1] for l in Path('/proc/meminfo').read_text().splitlines()
                    if l.startswith('MemAvailable:')))/1048576


def wait_start():
    while memory()<13.5:
        print('waiting for 13.5 GiB before heavy start',flush=True);time.sleep(15)


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--collect',action='store_true')
    parser.add_argument('--from-collection');parser.add_argument('--out',required=True)
    parser.add_argument('--start',type=int,default=0);parser.add_argument('--count',type=int,default=16)
    args=parser.parse_args();signal.alarm(5400);out=Path(args.out);out.mkdir(parents=True,exist_ok=True)
    wait_start()
    if args.collect:
        c=collect(progress=lambda c:print('cases',sum(c['counts'].values()),flush=True))
        (out/'collection.pkl').write_bytes(pickle.dumps(c,protocol=5))
        summary={k:v for k,v in c.items() if k not in ('controls','negatives')}
        summary['controls']=list(c['controls']);summary['negative_rows']={k:len(v) for k,v in c['negatives'].items()}
        (out/'collection-summary.json').write_text(json.dumps(summary,indent=2)+'\n')
        if c['mismatches'] or c['untracked']:raise SystemExit(1)
        return
    c=pickle.loads(Path(args.from_collection).read_bytes())
    if c['mismatches'] or c['untracked']:raise SystemExit('collection has unresolved findings')
    paths=sorted((Path(__file__).resolve().parent).glob('pm_dcw_table_[0-9][0-9][0-9].py'))
    results=[]
    for p in paths[args.start:args.start+args.count]:
        wait_start();suite=suite_for(p.stem,c)
        if not suite.negatives:
            results.append(dict(table=p.stem,status='unproved',reason='no complete-path negative in the lane corpus'))
            continue
        print('tool',p.stem,len(suite.controls),len(suite.negatives),flush=True)
        report=g.run(suite,memory=g.MemoryGate(pause_when_low=10,resume_at=13.5,poll=15))
        (out/(p.stem+'.json')).write_text(json.dumps(report,indent=2)+'\n')
        (out/(p.stem+'.md')).write_text(g.markdown(report))
        summary=dict(table=p.stem,status=report.get('status'),rows=report.get('rows'),errors=report.get('errors'))
        results.append(summary)
        print(p.stem,report.get('status'),flush=True)
    (out/('batch-%03d.json'%args.start)).write_text(json.dumps(results,indent=2)+'\n')


if __name__=='__main__':main()
