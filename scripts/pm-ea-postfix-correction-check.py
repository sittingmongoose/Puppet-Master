#!/usr/bin/env python3
"""Verify each MERGE3 revision against Git and kill correction-pin mutations."""
import argparse
import copy
import json
from pathlib import Path
import subprocess
from unittest.mock import patch

import pm_ea_postfix_corrections as c

ROOT = Path(__file__).resolve().parents[1]


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--output', type=Path)
    p.add_argument('--self-test', action='store_true')
    args = p.parse_args()
    rows = {r['event_type']:r for r in json.loads((ROOT/c.REGISTRY).read_text())['families']}
    checks, findings, mutations = [], [], []
    for path in sorted((ROOT/c.DIRECTORY).glob('*.json')):
        doc = json.loads(path.read_text())
        event = doc['event_type']
        record = json.loads((ROOT/c.RECORDS/(event+'.json')).read_text())
        try:
            witness, predecessor = c.witness(record, ROOT)
            if witness['registry_row'] != rows[event]:
                raise ValueError('current live row differs from the correction successor')
            checks.append(dict(event_type=event,application_commit=witness['application_commit'],
                source_commit=witness['source_commit'],decision_ref=witness['decision_ref']))
        except (ValueError, KeyError, TypeError, OSError, subprocess.SubprocessError) as exc:
            findings.append(dict(event_type=event,error=str(exc)))
            continue
        if not args.self_test:
            continue
        cases = []
        changed = copy.deepcopy(doc);changed['source_commit'] = witness['application_commit']
        cases.append(('substitute the application as predecessor',changed,record,False))
        changed = copy.deepcopy(doc);changed['predecessor_record_sha256']='0'*64
        cases.append(('forge predecessor record hash',changed,record,False))
        changed = copy.deepcopy(doc);changed['registry_after']['family_count']+=1
        cases.append(('change correction registry count',changed,record,False))
        changed = copy.deepcopy(doc);changed['registry_row']['family_revision']='999.0.0'
        changed_record = copy.deepcopy(record);changed_record['registry_row_sha256']=c.canonical(changed['registry_row'])
        cases.append(('substitute an unreviewed family revision',changed,changed_record,False))
        changed_record=copy.deepcopy(record);changed_record['registry_before']['sha256']='0'*64
        cases.append(('change original append checkpoint',doc,changed_record,False))
        changed=copy.deepcopy(doc);changed['applied_record_sha256']='0'*64
        cases.append(('forge immutable application record hash',changed,record,True))
        original_read=Path.read_bytes
        for name, changed, candidate, committed in cases:
            body=(json.dumps(changed,indent=1,ensure_ascii=False)+'\n').encode()
            def read_bytes(selected, raw=body):
                return raw if selected.resolve()==path.resolve() else original_read(selected)
            killed=False
            with patch.object(Path,'read_bytes',read_bytes):
                try:c.witness(candidate,ROOT,require_committed=committed)
                except (ValueError,KeyError,TypeError,OSError,subprocess.SubprocessError):killed=True
            mutations.append(dict(event_type=event,mutation=name,killed=killed))
            if not killed:findings.append(dict(event_type=event,error='mutation survived: '+name))
    result=dict(schema_id='pm.ea.postfix_correction_check.v1',families=len(checks),checks=checks,
        native_execution='NOT_RUN',findings=findings,mutations=mutations)
    if args.output:args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(dict(families=len(checks),findings=len(findings),mutations=len(mutations))))
    return int(bool(findings))


if __name__=='__main__':
    raise SystemExit(main())
