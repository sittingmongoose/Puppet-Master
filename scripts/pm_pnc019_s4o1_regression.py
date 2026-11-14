#!/usr/bin/env python3
"""Run the unchanged complete owner checkers covering s4o1's 94 families.

Run under long-job and a MemoryMax=2G scope. This driver runs serially and
waits for at least 12 GiB MemAvailable before each checker. It records failed
checks as failures; an exception or exit code never becomes a mutation kill.
"""
import argparse
import gzip
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import time

import pm_pnc019_s4o1 as cells

COMMANDS = [
    ('DG6A-alert', 'pm-alert-event-contracts-check.py', []),
    ('DG6A-concern', 'pm-concern-created-contracts-check.py', []),
    ('DT', 'pm-dt-event-contracts.py', []),
    ('DG6B', 'pm-dg6b-event-contracts.py', []),
    ('DC', 'pm_collaboration_events.py', ['--self-test']),
    ('DS15', 'pm-ds15-event-contracts.py', []),
    ('DCW', 'pm_bundle_revision_events.py', []),
    ('DCH', 'pm_dch_events.py', []),
    ('DCH-stop', 'pm_dch_stop.py', []),
    ('DO', 'pm-orchestrator-event-contracts.py', []),
    ('DFM', 'pm-filemanager-event-contracts.py', []),
    ('DF', 'pm_filesafe_event_contracts.py', []),
    ('DF-authority', 'pm_filesafe_event_authority.py', []),
    ('DS-p2b', 'pm_ds_p2b_cases.py', ['--check']),
]


def snapshot():
    paths = sorted(set(cells.ROOT.glob('Plans/*custody*.json')) | set(cells.ROOT.glob('Plans/*receipt*.json')))
    return {str(p.relative_to(cells.ROOT)):cells.sha(p) for p in paths}


def memory_floor():
    while True:
        available = int(next(line.split()[1] for line in Path('/proc/meminfo').read_text().splitlines() if line.startswith('MemAvailable:')))
        if available >= 12 * 1024 * 1024:
            return
        print('waiting for 12 GiB available RAM', flush=True)
        time.sleep(15)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out',type=Path,required=True)
    parser.add_argument('--only')
    parser.add_argument('--only-prefix')
    parser.add_argument('--retained-snapshots',action='store_true')
    args=parser.parse_args()
    args.out.mkdir(parents=True,exist_ok=True)
    memory_floor()
    commands=list(COMMANDS)
    selected=cells.load_rows()
    for row in selected:
        if row['lane']=='DS15' and 'ds15_deck2_fixtures' in row['fixture']:
            commands.append(('DS15-deck2-'+row['event_type'],'pm-ds15-deck2-contracts.py',['--family',row['event_type']]))
        if row['lane']=='DG6A' and 'card5_event_contracts' in row['fixture']:
            commands.append(('DG6A-'+row['event_type'],'pm-card5-event-contracts-check.py',['--family',row['event_type']]))
    commands.append(('DS','pm_event_authority_ds_round4.py',['--output',str(args.out/'DS-complete.json')]))
    summaries=[]
    for label,script,options in commands:
        if args.only and label!=args.only:
            continue
        if args.only_prefix and not label.startswith(args.only_prefix):
            continue
        memory_floor()
        before=snapshot()
        command=[sys.executable,'-B','scripts/'+script,*options]
        if args.retained_snapshots:
            if label=='DC':
                options=[]
            command=[sys.executable,'-B','scripts/pm_pnc019_retained_snapshot.py',
                     '--output',str((args.out/(label+'.retained.json')).resolve()),'scripts/'+script,*options]
        start=time.monotonic()
        with (args.out/(label+'.log')).open('wb') as stream:
            process=subprocess.run(command,cwd=cells.ROOT,stdout=stream,stderr=subprocess.STDOUT)
        raw=(args.out/(label+'.log')).read_bytes()
        (args.out/(label+'.log.gz')).write_bytes(gzip.compress(raw,mtime=0))
        (args.out/(label+'.log')).unlink()
        after=snapshot()
        result=dict(label=label,command=command,exit_code=process.returncode,seconds=round(time.monotonic()-start,2),
                    script_sha256=cells.sha(cells.ROOT/'scripts'/script),log=label+'.log.gz',
                    log_sha256=hashlib.sha256(raw).hexdigest(),custody_file_snapshot_before=before,
                    custody_file_snapshot_after=after,custody_files_unchanged=before==after,
                    snapshot_boundary='Committed custody catalogue bytes only; in-memory read-store nonmutation requires the owner oracle.')
        summaries.append(result)
        (args.out/'summary.json').write_text(json.dumps(summaries,indent=2)+'\n')
        print(json.dumps({k:v for k,v in result.items() if not k.startswith('custody_file_snapshot')}),flush=True)
    return int(any(r['exit_code']!=0 or not r['custody_files_unchanged'] for r in summaries))


if __name__=='__main__':
    raise SystemExit(main())
