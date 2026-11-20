#!/usr/bin/env python3
"""Verify each MERGE3 revision against Git and kill correction-pin mutations."""
import argparse
import copy
from collections import Counter
import json
from pathlib import Path
import re
import subprocess
from unittest.mock import patch

import pm_ea_postfix_corrections as c

ROOT = Path(__file__).resolve().parents[1]
REQUIRED_DECISIONS={f'Plans/Decision_Log.md#DL-{number}' for number in range(2451,2596)}


def coverage_problems(records, witnesses, decisions):
    """Derive required families from authorized DL-077 records, not the directory.

    The fixed authorization range cannot disappear when an input tree predates
    the correction round. Every decision, record and exact witness must exist.
    """
    findings=[]
    counts=Counter(decisions)
    bad_decisions=sorted(ref for ref in REQUIRED_DECISIONS if counts[ref]!=1)
    if bad_decisions:findings.append(dict(error='required_correction_decisions_missing_or_ambiguous',decisions=bad_decisions))
    authorized=[]
    for name,record in records:
        decision=record.get('decision_ref')
        if decision in REQUIRED_DECISIONS:
            event=record.get('event_type')
            if not isinstance(event,str) or name!=event+'.json':
                findings.append(dict(error='authorized_record_family_path_mismatch',path=name));continue
            if record.get('postfix_correction')!=c.DIRECTORY+'/'+name:
                findings.append(dict(error='authorized_record_witness_pointer_mismatch',event_type=event))
            authorized.append((event,decision))
        elif record.get('postfix_correction'):
            findings.append(dict(error='correction_record_has_no_round_authority',path=name,decision=decision))
    record_counts=Counter(decision for event,decision in authorized)
    missing=sorted(ref for ref in REQUIRED_DECISIONS if record_counts[ref]!=1)
    if missing:findings.append(dict(error='required_correction_records_missing_or_ambiguous',decisions=missing))
    expected={event for event,decision in authorized}
    if not expected:findings.append(dict(error='authorized_correction_set_empty'))
    events=Counter(event for event,decision in authorized)
    if any(count!=1 for count in events.values()):findings.append(dict(error='duplicate_authorized_family'))
    names=Counter(name for name,doc in witnesses)
    identities=Counter(doc.get('event_type') for name,doc in witnesses)
    expected_paths={event+'.json' for event in expected}
    actual=set(names)
    if actual!=expected_paths:
        findings.append(dict(error='correction_witness_coverage_mismatch',
            missing=sorted(expected_paths-actual),unexpected=sorted(actual-expected_paths)))
    for name,doc in witnesses:
        if names[name]!=1 or identities[doc.get('event_type')]!=1 or name!=str(doc.get('event_type'))+'.json':
            findings.append(dict(error='correction_witness_identity_or_path_ambiguous',path=name))
        expected_ref=next((decision for event,decision in authorized if event==doc.get('event_type')),None)
        if expected_ref is None or doc.get('decision_ref')!=expected_ref:
            findings.append(dict(error='correction_witness_authority_mismatch',path=name))
    return findings,expected


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--output', type=Path)
    p.add_argument('--self-test', action='store_true')
    p.add_argument('--root',type=Path,default=ROOT,help='actual full Git input tree (default: this checkout)')
    args = p.parse_args()
    root=args.root.resolve()
    rows = {r['event_type']:r for r in json.loads((root/c.REGISTRY).read_text())['families']}
    records=[(p.name,json.loads(p.read_text())) for p in sorted((root/c.RECORDS).glob('*.json'))]
    paths=sorted((root/c.DIRECTORY).glob('*.json'))
    witnesses=[(p.name,json.loads(p.read_text())) for p in paths]
    decisions=['Plans/Decision_Log.md#'+x for x in re.findall(r'(?m)^plan_unit_id: (DL-\d+)\s*$',(root/'Plans/Decision_Log.md').read_text())]
    findings,expected=coverage_problems(records,witnesses,decisions)
    checks,mutations=[],[]
    if args.self_test and not findings:
        cases=[('empty witness directory',records,[],decisions),
               ('one witness removed',records,witnesses[1:],decisions),
               ('one authority record removed',[x for x in records if x[1].get('event_type')!=witnesses[0][1]['event_type']],witnesses,decisions),
               ('missing authorized decision',records,witnesses,[x for x in decisions if x!='Plans/Decision_Log.md#DL-2451']),
               ('empty pre-correction inputs',[],[],[]),
               ('duplicate witness identity',records,witnesses+[('duplicate.json',witnesses[0][1])],decisions)]
        for name,candidate_records,candidate_witnesses,candidate_decisions in cases:
            errors,_=coverage_problems(candidate_records,candidate_witnesses,candidate_decisions)
            killed=bool(errors)
            mutations.append(dict(mutation=name,killed=killed))
            if not killed:findings.append(dict(error='coverage mutation survived',mutation=name))
    for path in paths:
        doc = json.loads(path.read_text())
        event = doc['event_type']
        try:
            record = json.loads((root/c.RECORDS/(event+'.json')).read_text())
            witness, predecessor = c.witness(record, root)
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
                try:c.witness(candidate,root,require_committed=committed)
                except (ValueError,KeyError,TypeError,OSError,subprocess.SubprocessError):killed=True
            mutations.append(dict(event_type=event,mutation=name,killed=killed))
            if not killed:findings.append(dict(event_type=event,error='mutation survived: '+name))
    result=dict(schema_id='pm.ea.postfix_correction_check.v1',families=len(checks),checks=checks,
        required_families=len(expected),required_decisions=len(REQUIRED_DECISIONS),discovered_witnesses=len(paths),
        input_revision=subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD'],text=True).strip(),
        native_execution='NOT_RUN',findings=findings,mutations=mutations)
    if args.output:args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(dict(families=len(checks),findings=len(findings),mutations=len(mutations))))
    return int(bool(findings))


if __name__=='__main__':
    raise SystemExit(main())
