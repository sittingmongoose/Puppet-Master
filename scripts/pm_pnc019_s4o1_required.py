#!/usr/bin/env python3
"""Prove required-member phases; report exactly the gated tool's credit.

An original full-owner-schema negative must first refuse at the exact required
member occurrence. Only then is that same payload's required-member phase
submitted to the gated tool. Required members are never cut as one aggregate.
No whole-family PASS is inferred from these bounded phases.
"""
import argparse
import copy
import gzip
import hashlib
import json
from pathlib import Path
import subprocess
import sys

import pm_pnc019_s4o1 as cells


def run(row, out, width=1):
    from urllib.parse import urldefrag
    from pm_event_datetime import EVENT_RECORD, format_checker
    reg, documents = cells.registry()
    path, frag = urldefrag(row['schema'])
    resolver = reg.resolver((cells.ROOT / path).resolve().as_uri())
    schema = resolver.lookup('#' + frag).contents if frag else documents[(cells.ROOT/path).resolve().as_uri()]
    if '$id' in schema:
        resolver = reg.resolver(schema['$id'])
    validator = cells.CurrentValidator(schema, registry=reg, _resolver=resolver, format_checker=format_checker(profile=EVENT_RECORD))
    results, seen = [], set()
    for ci, payload in enumerate(row['controls']):
        if cells.errors(validator, payload):
            continue
        for sp, ip, node, original in cells.schema_nodes(schema, payload, reg, resolver=resolver):
            required = [m for m in node.get('required', []) if isinstance(original, dict) and m in original]
            key = (sp, ip)
            if not required or key in seen:
                continue
            seen.add(key)
            for start in range(0, len(required), width):
                group = required[start:start+width]
                negatives = []
                for member in group:
                    candidate = copy.deepcopy(payload)
                    del cells.at(candidate, ip)[member]
                    errors = cells.errors(validator, candidate)
                    matched = cells.exact_refusal(errors, 'required', sp, ip, member)
                    if matched:
                        negatives.append((member, copy.deepcopy(cells.at(candidate, ip))))
                label = row['event_type'] + '/' + cells.pointer(sp) + '/' + str(start)
                name = row['event_type'] + '.' + str(len(results)) + '.json.gz'
                job_path=out/(name+'.input.json')
                job_path.write_text(json.dumps(dict(required=group,control=original,negatives=negatives,label=label)))
                process=subprocess.run([sys.executable,'-B',str(cells.ROOT/'scripts/pm_pnc019_schema_worker.py'),
                                        '--input',str(job_path.resolve()),'--output',str((out/name).resolve())],cwd=out.resolve())
                if not (out/name).exists():
                    raise RuntimeError('guard worker produced no report; exit '+str(process.returncode))
                data=gzip.decompress((out/name).read_bytes())
                report=json.loads(data)
                if (process.returncode==0)!=(report['status']=='PASS'):
                    raise RuntimeError('guard worker exit/report disagreement')
                job_path.unlink()
                results.append(dict(schema_path=cells.pointer(sp), instance_path=cells.pointer(ip), control=ci,
                                    required=group, exact_full_owner_refusals=len(negatives), tool_status=report['status'],
                                    proved=sum(r.get('proved', False) for r in report.get('rows', [])),
                                    rows=len(report.get('rows', [])), failures=report.get('failures', []),
                                    report=name, report_sha256=hashlib.sha256(data).hexdigest()))
                print(json.dumps({'family':row['event_type'],'phase':len(results),'status':report['status'],
                                  'proved':results[-1]['proved'],'rows':results[-1]['rows']}), flush=True)
    summary = {'event_type':row['event_type'], 'phases': results,
               'credit_boundary':'Required-member schema phases only; complete family criterion remains PARTIAL.'}
    (out/(row['event_type']+'.required-summary.json')).write_text(json.dumps(summary, indent=2, default=str)+'\n')
    return summary


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family')
    parser.add_argument('--start-position',type=int,default=1)
    parser.add_argument('--end-position',type=int,default=94)
    parser.add_argument('--rows-per-table',type=int,choices=range(1,9),default=1)
    parser.add_argument('--out',required=True,type=Path)
    args=parser.parse_args()
    args.out.mkdir(parents=True,exist_ok=True)
    selected=[r for r in cells.load_rows()
              if args.start_position<=r['position']<=args.end_position and (not args.family or r['event_type']==args.family)]
    if not selected:
        parser.error('unknown family')
    summaries=[run(row,args.out,args.rows_per_table) for row in selected]
    return int(any(p['tool_status']!='PASS' for r in summaries for p in r['phases']))


if __name__=='__main__':
    raise SystemExit(main())
