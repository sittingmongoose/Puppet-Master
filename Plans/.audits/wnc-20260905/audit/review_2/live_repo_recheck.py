#!/usr/bin/env python3
"""Read-only, in-memory probes for the WNC repair recheck.

Run from any location:
  python live_repo_recheck.py --repo /path/to/Puppet-Master > recheck.json

Requires the repository validator's Python dependencies (including jsonschema).
Does not edit the repository, run broad gates, or execute product runtime.
This script was syntax-checked in the review environment, but NOT executed
against a full checkout there; source_fragment_probes.py is the executed suite.
Exit 0 means the intended outcomes below hold; exit 1 means at least one fails.
"""
from __future__ import annotations
import argparse
import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import unittest
from typing import Any

sys.dont_write_bytecode = True
EXPECTED_REF = '07382a95e9765890c8b56ab291c29144da60bf81'


def load_module(path: Path, name: str):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f'Cannot load {path}')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, required=True)
    args = parser.parse_args()
    root = args.repo.resolve()
    script = root / 'scripts/pm-working-notebook-contracts.py'
    if not script.is_file():
        parser.error(f'Validator not found at {script}')
    validator = load_module(script, 'wnc_recheck_validator')
    fixtures = validator.load_json(validator.FIXTURES_PATH)
    schema = validator.load_json(validator.SCHEMA_PATH)
    registry = validator.load_json(validator.REGISTRY_PATH)
    git = subprocess.run(['git', '-C', str(root), 'rev-parse', 'HEAD'], capture_output=True, text=True)
    ref = git.stdout.strip() if git.returncode == 0 else None
    observations: list[dict[str, Any]] = []

    def record(name: str, actual: str, expected: str, detail: Any = None):
        observations.append({'probe':name, 'actual':actual, 'expected':expected,
                             'passed':actual == expected, 'detail':detail})

    def isolated_errors(definition: str, value: Any) -> list[str]:
        selected = {'$schema':schema.get('$schema'), '$defs':schema['$defs'], '$ref':f'#/$defs/{definition}'}
        return validator.validate_with_jsonschema(selected, value)

    def full_report(mutated: dict[str, Any]) -> dict[str, Any]:
        try:
            return validator.run_validation(fixtures=mutated, schema=schema, registry=registry)
        except Exception as exc:
            return {'status':'fail', 'exception':repr(exc)}

    baseline = full_report(fixtures)
    record('unmodified full validator control', baseline['status'], 'pass', baseline.get('checks'))
    if baseline['status'] != 'pass':
        print(json.dumps({'head':ref, 'scope':'baseline failed; mutation results would be confounded',
                          'observations':observations}, indent=2))
        return 1

    requests = fixtures['positive']['tool_requests']
    write_i = next(i for i,r in enumerate(requests) if r['tool']=='notebook_write' and r['args'].get('operation')=='create')
    super_i = next(i for i,r in enumerate(requests) if r['tool']=='notebook_supersede')
    chat = next(copy.deepcopy(r) for r in requests if r['tool']=='chatread')
    create = copy.deepcopy(requests[write_i])
    supersede = copy.deepcopy(requests[super_i])

    def request_check(name: str, request: dict, expected: str):
        errors=isolated_errors('tool_request', request)
        record(name, 'rejected' if errors else 'accepted', expected, errors[:5])

    request_check('valid chatread control',chat,'accepted')
    request_check('empty chatread args',{'tool':'chatread','args':{}},'rejected')
    request_check('empty notebook_write args',{'tool':'notebook_write','args':{}},'rejected')
    for field,value in [('epistemic_kind','observation'),('provenance_refs',[]),('validity_refs',[])]:
        obj=copy.deepcopy(create); obj['args'][field]=value
        request_check(f'documented write field {field}',obj,'accepted')
    obj=copy.deepcopy(supersede)
    obj['args'].pop('expected_revision',None); obj['args'].pop('target_state',None); obj['args'].pop('operation',None)
    request_check('supersede must not omit both action and CAS revision',obj,'rejected')
    obj=copy.deepcopy(supersede); obj['args']['expected_revision']=None
    request_check('supersede with null CAS revision',obj,'rejected')
    obj=copy.deepcopy(create); obj['args']['body']='é'*32769
    mutated=copy.deepcopy(fixtures); mutated['positive']['tool_requests'][write_i]=obj
    result=full_report(mutated)
    record('65,538-byte create body must fail full validator',result['status'],'fail',result.get('checks'))

    transition=copy.deepcopy(fixtures['positive']['context_transitions'][0])
    record('valid transition control','rejected' if isolated_errors('context_transition_record',transition) else 'accepted','accepted')
    for field,value in [('admission_receipt_ref',None),('new_context_window_id',None),('effective_controller','unavailable')]:
        obj=copy.deepcopy(transition); obj[field]=value
        errors=isolated_errors('context_transition_record',obj)
        record('success-state '+field+'='+str(value),'rejected' if errors else 'accepted','rejected',errors[:3])
    obj=copy.deepcopy(transition); obj.pop('admission_receipt_ref',None)
    errors=isolated_errors('context_transition_record',obj)
    record('success-state without receipt property','rejected' if errors else 'accepted','rejected',errors[:3])

    mutations=[]
    obj=copy.deepcopy(fixtures); obj['negative']=[]; mutations.append(('empty negative set',obj))
    obj=copy.deepcopy(fixtures); obj['acceptance_scenario_map']['scenarios'].pop('WNC-A26',None); mutations.append(('missing scenario key',obj))
    obj=copy.deepcopy(fixtures)
    obj['acceptance_scenario_map']['scenarios']={k:None for k in obj['acceptance_scenario_map']['scenarios']}
    mutations.append(('all scenario records replaced by null',obj))
    obj=copy.deepcopy(fixtures)
    for row in obj['acceptance_scenario_map']['scenarios'].values():
        if isinstance(row,dict) and row.get('disposition')=='static_fixture': row['refs']=['not_a_real_fixture[999]']
    mutations.append(('invalid static evidence references',obj))
    obj=copy.deepcopy(fixtures)
    for row in obj['acceptance_scenario_map']['scenarios'].values():
        if isinstance(row,dict) and row.get('disposition')=='static_fixture': row.pop('refs',None)
    mutations.append(('missing static evidence references',obj))
    obj=copy.deepcopy(fixtures)
    for neg in obj['negative']:
        neg['mutation']={'path':'tool_requests[0].tool','value':'notebook_dump_all'}
    mutations.append(('all expected negative ids repointed to identical mutation',obj))
    obj=copy.deepcopy(fixtures)
    for neg in obj['negative']: neg['rejects']='not_a_real_family[999]'
    mutations.append(('all declared negative rejection targets invalid',obj))
    for name,obj in mutations:
        report=full_report(obj)
        record(name,report['status'],'fail',[c for c in report.get('checks',[]) if c.get('status')!='pass'])

    # Execute just the seven published regression methods against a schema with
    # the two target definitions disabled. Passing is BAD in this ablation.
    testpath=root / 'tests/test_pm_working_notebook_contracts.py'
    if testpath.is_file():
        testmodule=load_module(testpath,'wnc_published_test_recheck')
        weakened=copy.deepcopy(schema)
        weakened['$defs']['tool_request']={}
        weakened['$defs']['context_transition_record']={}
        names=[
            'test_chatread_with_empty_args_rejected',
            'test_notebook_write_with_empty_args_rejected',
            'test_read_with_negative_offset_rejected',
            'test_unknown_argument_name_rejected',
            'test_success_without_admission_property_rejected',
            'test_success_with_null_new_window_rejected',
            'test_success_with_unavailable_controller_rejected',
        ]
        for name in names:
            case=testmodule.WorkingNotebookContractTests(methodName=name)
            case.schema=weakened; case.fixtures=fixtures; case.registry=registry
            try:
                getattr(case,name)()
                outcome='still_passes'
            except AssertionError:
                outcome='detects_removed_contract'
            except Exception as exc:
                outcome='unexpected_error:'+repr(exc)
            record('ablation '+name,outcome,'detects_removed_contract')

    report={'reviewed_ref':EXPECTED_REF, 'executed_head':ref,
            'head_matches_review':ref==EXPECTED_REF,
            'evidence_boundary':'full repository static validator + in-memory mutations + seven selected unit methods; no runtime and no broad governance gates',
            'observation_count':len(observations),
            'failed_expected_outcomes':sum(not r['passed'] for r in observations),
            'observations':observations}
    print(json.dumps(report,indent=2))
    return 1 if report['failed_expected_outcomes'] else 0

if __name__=='__main__':
    raise SystemExit(main())
