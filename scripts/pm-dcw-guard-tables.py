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


RESUME_AT=13.5


def wait_start(threshold=None):
    threshold=RESUME_AT if threshold is None else threshold
    while memory()<threshold:
        print('waiting for %s GiB before heavy start'%threshold,flush=True);time.sleep(15)


def collection_progress(collection):
    print('cases',sum(collection['counts'].values()),flush=True)
    if memory()<10:
        print('collection paused below 10 GiB',flush=True)
        wait_start()


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--collect',action='store_true')
    parser.add_argument('--from-collection');parser.add_argument('--out',required=True)
    parser.add_argument('--start',type=int,default=0);parser.add_argument('--count',type=int,default=16);parser.add_argument('--include-unproved',action='store_true')
    # Stream E memory rule (2026-11-11 23:22Z, 2026-11-12 01:05Z): a run capped at 2 GiB RSS that pauses
    # below 10 GiB may start or resume at 11 GiB. Table batches are capped by the tool's MemoryGate
    # (max_rss 2048 MiB). Collection has no cap of its own; a caller that caps it externally
    # (systemd-run MemoryMax=2G) passes --resume-at 11. The default stays 13.5.
    parser.add_argument('--pause-when-low',type=float,default=10);parser.add_argument('--resume-at',type=float,default=13.5)
    args=parser.parse_args();signal.alarm(5400);out=Path(args.out);out.mkdir(parents=True,exist_ok=True)
    global RESUME_AT;RESUME_AT=args.resume_at
    wait_start()
    if args.collect:
        c=collect(progress=collection_progress)
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
        if not suite.negatives and not args.include_unproved:
            results.append(dict(table=p.stem,status='unproved',reason='no complete-path negative in the lane corpus'))
            continue
        print('tool',p.stem,len(suite.controls),len(suite.negatives),flush=True)
        report=g.run(suite,memory=g.MemoryGate(max_rss=2048,pause_when_low=args.pause_when_low,resume_at=args.resume_at,poll=15))
        (out/(p.stem+'.json')).write_text(json.dumps(report,indent=2)+'\n')
        (out/(p.stem+'.md')).write_text(g.markdown(report))
        summary=dict(table=p.stem,status=report.get('status'),rows=report.get('rows'),errors=report.get('errors'))
        results.append(summary)
        print(p.stem,report.get('status'),flush=True)
    (out/('batch-%03d.json'%args.start)).write_text(json.dumps(results,indent=2)+'\n')
    if any(r['status']=='FAIL' for r in results):raise SystemExit(1)


if __name__=='__main__':main()
