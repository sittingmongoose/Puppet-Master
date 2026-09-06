#!/usr/bin/env python3
"""Read-only checks for the remaining a4111ec WNC review issues.

Run: python live_repo_followup.py --repo /path/to/Puppet-Master
Imports the real validator and mutates fixture copies in memory. Does not run
broad gates, generate governance artifacts, or execute product runtime.
This script was syntax-checked, NOT executed on a complete checkout by the
reviewer. Exit 0: all checks pass; 1: a check fails; 2: baseline/environment error.
"""
from __future__ import annotations
import argparse
import copy
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys
from typing import Any
sys.dont_write_bytecode = True


def main() -> int:
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--repo',type=Path,required=True)
    a=p.parse_args(); root=a.repo.resolve()
    spec=importlib.util.spec_from_file_location('wnc_live_review',root/'scripts/pm-working-notebook-contracts.py')
    if spec is None or spec.loader is None:
        print(json.dumps({'status':'environment_error','detail':'Cannot load validator'})); return 2
    v=importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(v)
        fixtures=v.load_json(v.FIXTURES_PATH); schema=v.load_json(v.SCHEMA_PATH); registry=v.load_json(v.REGISTRY_PATH)
        baseline=v.run_validation(fixtures=fixtures,schema=schema,registry=registry)
    except Exception as e:
        print(json.dumps({'status':'environment_error','detail':repr(e)},indent=2)); return 2
    if baseline.get('status')!='pass':
        print(json.dumps({'status':'baseline_failed','detail':baseline},indent=2)); return 2
    rows=[]
    def record(name: str, passed: bool, detail: Any=None):
        rows.append({'check':name,'passed':passed,'detail':detail})
    def run_fixture(obj):
        try: return v.run_validation(fixtures=obj,schema=schema,registry=registry)
        except Exception as e: return {'status':'error','detail':repr(e)}
    record('unmodified full validator baseline',True)
    substitutions=[
        ('neg_body_over_limit',{'path':'entry_envelopes[0].epistemic_kind','value':'verified'}),
        ('neg_read_negative_offset',{'path':'tool_requests[1].args.range.convention','value':'mixed_byte_and_char'}),
        ('neg_supersede_null_expected_revision',{'path':'tool_requests[6].args.operation','value':'deleted'}),
    ]
    for case_id,mutation in substitutions:
        obj=copy.deepcopy(fixtures)
        match=next((n for n in obj['negative'] if n['negative_id']==case_id),None)
        if match is None:
            record('preserve coverage intent for '+case_id,False,'Case missing or renamed; review explicit replacement evidence'); continue
        original=copy.deepcopy(match['mutation']); match['mutation']=mutation
        result=run_fixture(obj)
        record('reject same-record semantic replacement: '+case_id,result.get('status')=='fail',
               {'original_mutation':original,'replacement':mutation,'validator_status':result.get('status'),
                'failed_checks':[x for x in result.get('checks',[]) if x.get('status')!='pass']})
    tools=(root/'Plans/Tools.md').read_text(encoding='utf-8')
    marker='**`notebook_supersede`'
    section=tools.split(marker,1)[1].split('\n\n',1)[0] if marker in tools else ''
    signature=re.search(r'Input:\s*`([^`]+)`',section)
    record('registered supersede signature names request_id',bool(signature and 'request_id' in signature.group(1)),
           signature.group(1) if signature else 'Signature not found; inspect updated owner')
    def errors(request):
        return v.validate_with_jsonschema({'$schema':schema.get('$schema'), '$defs':schema['$defs'],
                                          '$ref':'#/$defs/tool_request'},request)
    control=next(copy.deepcopy(r) for r in fixtures['positive']['tool_requests'] if r['tool']=='notebook_supersede')
    record('valid supersede control',not bool(errors(control)))
    for field in ['expected_revision','operation','request_id']:
        obj=copy.deepcopy(control); obj['args'].pop(field,None)
        e=errors(obj); record('supersede rejects missing '+field,bool(e),e[:3])
    ci=next(i for i,r in enumerate(fixtures['positive']['tool_requests']) if r['tool']=='notebook_write' and r['args']['operation']=='create')
    ui=next(i for i,r in enumerate(fixtures['positive']['tool_requests']) if r['tool']=='notebook_write' and r['args']['operation']=='update')
    for operation in ['create','update','append']:
        i=ci if operation=='create' else ui
        for body,expected in [('é'*32768,'pass'),('é'*32768+'a','fail')]:
            obj=copy.deepcopy(fixtures); obj['positive']['tool_requests'][i]['args'].update(operation=operation,body=body)
            result=run_fixture(obj)
            record(f'{operation}: {len(body.encode("utf-8"))} byte boundary',result.get('status')==expected,
                   {'expected':expected,'observed':result.get('status')})
    try:
        g=subprocess.run(['git','-C',str(root),'rev-parse','HEAD'],capture_output=True,text=True,check=False)
        head=g.stdout.strip() if g.returncode==0 else None
    except OSError: head=None
    report={'status':'pass' if all(r['passed'] for r in rows) else 'fail',
            'head':head,'review_reference':'a4111ec28b91f0f8ebbec139a43db8416771fbcf',
            'boundary':'static contracts only; runtime NOT_RUN','checks':rows}
    print(json.dumps(report,indent=2))
    return 0 if report['status']=='pass' else 1

if __name__=='__main__': sys.exit(main())
