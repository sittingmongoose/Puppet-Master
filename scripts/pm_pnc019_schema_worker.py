#!/usr/bin/env python3
"""Run one source-bound schema phase in a clean guard-tool process."""
import argparse
import gzip
import json
from pathlib import Path

import pm_guard_isolation as g
import pm_pnc019_required_table as required_phase
import pm_pnc019_scalar_phase as scalar_phase

ROOT = Path(__file__).resolve().parents[1]
SOURCE = 'scripts/pm_pnc019_required_table.py'
ALLOWANCES = [
    ('selected', 'return', 'return value', 'Select the unchanged complete payload at this required-member phase.'),
    ('case', 'return', 'return g.Case(table, check, context)', 'Return the fresh engine case without deciding acceptance.'),
    ('case', 'call_review', 'g.SchemaCatalog(DOCUMENTS, roots=(URI,))', 'Build a fresh catalogue for the exact source-bound required-member group.'),
    ('case', 'call_review', 'g.schema_table(catalog, {URI: selected})', 'Build the engine table; one row per required member, with no grouped bypass.'),
    ('case', 'data_operation', '{URI: selected}', 'Bind the one declared root to the unchanged-payload selector.'),
    ('case.check', 'call_review', 'table.validate(URI, value, context)', 'Invoke the original complete schema phase through engine attribution.'),
]


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input',type=Path,required=True)
    parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args()
    job=json.loads(args.input.read_text())
    phase=scalar_phase if 'schema' in job else required_phase
    source='scripts/pm_pnc019_scalar_phase.py' if 'schema' in job else SOURCE
    schema=job['schema'] if 'schema' in job else {'required':job['required']}
    phase.DOCUMENTS={phase.URI:{'$schema':'https://json-schema.org/draft/2020-12/schema',**schema}}
    preview=phase.case()
    labels={r.member:r.id for r in preview.table._schema.catalog.guards.values() if r.classification=='guard'}
    if not 1<=len(preview.table.guards)<=8:
        raise ValueError('schema phase must contain 1..8 real guard rows')
    if 'schema' in job and len(preview.table.guards)!=1:
        raise ValueError('atomic schema job must have exactly one guard')
    if 'schema' in job:
        labels={None:next(iter(preview.table.guards))}
    suite=g.Suite(job['label'],phase.case,[g.Control('valid',job['control'],'synthetic')],
                  [g.Negative('negative/'+str(member),value,labels[member],preview.table.guards[labels[member]].refusal_code,
                              'valid',job.get('defect','Remove only required member '+str(member))) for member,value in job['negatives']],
                  (source,),ROOT)
    suite.non_guards=[g.NonGuard(source,function,kind,text,reason) for function,kind,text,reason in ALLOWANCES]
    report=g.run(suite,memory=g.MemoryGate(1536,12,12,15,2700))
    data=json.dumps(report,sort_keys=True,indent=1,default=str).encode()+b'\n'
    args.output.write_bytes(gzip.compress(data,mtime=0))
    return int(report['status']!='PASS')


if __name__=='__main__':
    raise SystemExit(main())
