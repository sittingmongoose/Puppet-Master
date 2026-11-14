#!/usr/bin/env python3
"""Gated clause phases, eligible only after exact full-owner cut/restoration.

This supplements the original complete checker. Unsupported engine keywords,
masked full-owner cuts and reference-occurrence cuts earn no atomic credit.
"""
import argparse
import gzip
import hashlib
import json
from pathlib import Path
import subprocess
import sys
from urllib.parse import urldefrag

import pm_pnc019_s4o1 as cells

SUPPORTED={'type','const','enum','minimum','maximum','exclusiveMinimum','exclusiveMaximum',
           'multipleOf','minLength','maxLength','minItems','maxItems','uniqueItems','minProperties','maxProperties',
           'additionalProperties'}


def parts(pointer):
    return tuple(p.replace('~1','/').replace('~0','~') for p in pointer.split('/')[1:]) if pointer else ()


def run(row, evidence, out):
    path,fragment=urldefrag(row['schema'])
    schema=cells.read(path)
    if fragment:
        schema=cells.at(schema,parts(fragment))
    source=evidence/(row['event_type']+'.json.gz')
    proof=json.loads(gzip.decompress(source.read_bytes()))
    if proof['schema_sha256']!=row['schema_sha256'] or proof['fixture_sha256']!=row['fixture_sha256'] or proof['anomalies']:
        raise ValueError('stale or invalid full-owner evidence: '+row['event_type'])
    results=[]
    for case in proof['cases']:
        keyword=case['keyword']
        if keyword not in SUPPORTED or not case['single_clause_flip'] or not case['restored']:
            continue
        sp=parts(case['schema_path'])[:-1]
        ip=parts(case['instance_path'])
        node=cells.at(schema,sp)
        if keyword=='additionalProperties':
            if 'patternProperties' in node:
                continue
            atomic={'properties':{key:{} for key in node.get('properties',{})},'additionalProperties':False}
        else:
            atomic={keyword:node[keyword]}
        original=cells.at(row['controls'][case['control']],ip)
        label=row['event_type']+'/'+case['instance_path']+'/'+keyword+'/'+str(case['id'])
        job=dict(schema=atomic,control=original,negatives=[[None,case['replacement']]],label=label,
                 defect='Exact full-owner refusal and successful one-clause cut/restoration: '+case['schema_path'])
        name=row['event_type']+'.atomic.'+str(case['id'])+'.json.gz'
        job_path=out/(name+'.input.json')
        job_path.write_text(json.dumps(job))
        target=out/name
        if target.exists():
            target.unlink()
        process=subprocess.run([sys.executable,'-B',str(cells.ROOT/'scripts/pm_pnc019_schema_worker.py'),
                                '--input',str(job_path.resolve()),'--output',str(target.resolve())],cwd=out.resolve())
        if not target.exists():
            raise RuntimeError('atomic worker produced no report; exit '+str(process.returncode))
        data=gzip.decompress(target.read_bytes())
        report=json.loads(data)
        if (process.returncode==0)!=(report['status']=='PASS'):
            raise RuntimeError('atomic worker exit/report disagreement')
        job_path.unlink()
        results.append(dict(case_id=case['id'],schema_path=case['schema_path'],instance_path=case['instance_path'],
                            keyword=keyword,control=case['control'],full_owner_report=source.name,
                            tool_status=report['status'],proved=sum(r.get('proved',False) for r in report.get('rows',[])),
                            rows=len(report.get('rows',[])),failures=report.get('failures',[]),report=name,
                            report_sha256=hashlib.sha256(data).hexdigest()))
    summary=dict(event_type=row['event_type'],phases=results,
                 credit_boundary='Atomic schema phases with full-owner cut/restoration; no complete lifecycle mutation claim.')
    (out/(row['event_type']+'.atomic-summary.json')).write_text(json.dumps(summary,indent=2,default=str)+'\n')
    print(json.dumps(dict(family=row['event_type'],phases=len(results),proved=sum(r['proved'] for r in results),
                         failures=sum(r['tool_status']!='PASS' for r in results))),flush=True)
    return summary


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--evidence',type=Path,required=True)
    parser.add_argument('--out',type=Path,required=True)
    parser.add_argument('--family')
    args=parser.parse_args()
    args.out.mkdir(parents=True,exist_ok=True)
    selected=[r for r in cells.load_rows() if not args.family or r['event_type']==args.family]
    if not selected:
        parser.error('unknown family')
    results=[run(row,args.evidence,args.out) for row in selected]
    return int(any(p['tool_status']!='PASS' for r in results for p in r['phases']))


if __name__=='__main__':
    raise SystemExit(main())
