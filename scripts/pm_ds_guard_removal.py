#!/usr/bin/env python3
"""Inventory and independently weaken lane DS checker guards. No source files are mutated."""
from __future__ import annotations
import argparse
import ast
import copy
import inspect
import json
import textwrap
from pathlib import Path
from unittest.mock import patch
import pm_event_authority_ds_round2 as round2
import pm_home_layout_v2_slot_receipt as home
import pm_browser_workspace_created as created
import pm_browser_workspace_created_v2 as v2
import pm_browser_workspace_reset as reset

ROOT=Path(__file__).resolve().parents[1]

def load(p):return json.loads((ROOT/p).read_text())

def guards(fn):
    source=textwrap.dedent(inspect.getsource(fn));tree=ast.parse(source)
    # Every conditional refusal/accumulation is inventoried, including dormant guards with no negative.
    for n in ast.walk(tree):
        if not isinstance(n,ast.If):continue
        if not any(isinstance(x,(ast.Return,ast.Raise)) or (isinstance(x,ast.Call) and isinstance(x.func,ast.Attribute) and x.func.attr in ('append','extend')) for stmt in n.body for x in ast.walk(stmt)):
            continue
        yield n.lineno,ast.unparse(n.test),tree

def weaken(fn,line,tree):
    class Remove(ast.NodeTransformer):
        def visit_If(self,node):
            if node.lineno==line:node.test=ast.Constant(False)
            return self.generic_visit(node)
    namespace=dict(inspect.unwrap(fn).__globals__)
    exec(compile(ast.fix_missing_locations(Remove().visit(copy.deepcopy(tree))),inspect.getsourcefile(inspect.unwrap(fn)),'exec'),namespace)
    return namespace[fn.__name__]

def cohort():
    cases=[];groups=[]
    checker=home.Checker(ROOT);fixtures=load(home.FIXTURES);valid={v['id']:v for v in fixtures['valid']};store=home.PayloadStore.from_fixture(fixtures['payload_store'])
    for negative in fixtures['invalid']:
        if negative.get('rejected_by')=='schema':continue
        base=valid[negative['base']];value=home.apply_ops(base['value'],negative['ops']);changed_store=store.apply(negative.get('payload_store_ops',[]))
        def accepts(v=value,d=base['definition'],s=changed_store):return not checker.semantic(d,v,s)
        cases.append(('home:'+negative['id'],accepts))
    for fn in (home.value_limit_check,home.event_checks,home.binding_checks,home.source_bytes_check,home.slot_invariants,home.receipt_invariants,home.PayloadStore.resolve,home.Checker.reference_invariants):
        groups.append((home,fn,cases.copy()))
    gate,context=created.candidate_gate(ROOT)
    create=load(created.FIXTURE_PATH)['creation_fixture'];source=next(v for v in gate.load_json('Plans/browser_event_admission_fixtures.json')['valid'] if v['case_id']==create['event_case_id']);base={'event':gate.fixture_event(source,1),**{k:create[k] for k in ('request','result','witness')}}
    creation_cases=[]
    for n in load(created.FIXTURE_PATH)['creation_invalid']:
        changed=copy.deepcopy(base);gate.set_pointer(changed[n['target']],n['pointer'],n['value'])
        creation_cases.append(('created:'+n['case_id'],lambda b=changed:not created.creation_preflight_failures(**b)))
    for n in load(created.FIXTURE_PATH)['checkpoint_invalid']:
        changed=copy.deepcopy(load(created.FIXTURE_PATH)['checkpoint_fixture']);gate.set_pointer(changed,n['pointer'],n['value'])
        creation_cases.append(('created-checkpoint:'+n['case_id'],lambda b=changed:not created.checkpoint_failures(b)))
    groups += [(created,created.creation_preflight_failures,creation_cases),(created,created.checkpoint_failures,creation_cases),(gate,gate.candidate_failures,creation_cases)]
    reset_cases=[];base=reset.fixture_values()[0]
    for n in load(reset.FIXTURE_PATH)['reset_invalid']:
        changed=copy.deepcopy(base);gate.set_pointer(changed[n['target']],n['pointer'],n['value'])
        reset_cases.append(('reset:'+n['case_id'],lambda b=changed:not reset.reset_preflight_failures(**b)))
    groups.append((reset,reset.reset_preflight_failures,reset_cases))
    # Checkpoint and transition entry points are retained in the inventory even when their
    # guards have no authored single-defect fixture in these files. Such a row is never PASS.
    for module,names in ((v2,('core_relation_failures','index_token_failures','checkpoint_failures','generation_failures','source_failures','advance_failures','cleanup_failures')),
                         (reset,('checkpoint_failures','checkpoint_core_failures','generation_admission_failures','index_token_failures'))):
        for name in names:groups.append((module,getattr(module,name),[]))
    comp=load('Plans/context_compaction_completion_contract_fixtures.json');valid={v['name']:v for v in comp['valid']};comp_cases=[]
    for n in comp['invalid']:
        changed=copy.deepcopy(valid[n['base_valid']]['payload']);changed.update(n.get('patch',{}))
        for key in n.get('remove',[]):changed.pop(key,None)
        comp_cases.append(('compaction:'+n['name'],lambda p=changed:not round2.compaction_payload_errors(p)))
    for n in comp['invalid_events']:
        changed=copy.deepcopy(comp['valid_event']);changed.update(n.get('patch',{}));comp_cases.append(('compaction-event:'+n['name'],lambda p=changed:not round2.compaction_event_errors(p)))
    groups += [(round2,round2.compaction_payload_errors,comp_cases),(round2,round2.compaction_event_errors,comp_cases)]
    extra=round2.build().negatives
    cases=[(name,fn) for name,_,fn in extra]
    import pm_event_payload_route as route
    groups.extend((module,fn,cases) for module,fn in ((route,route.resolved_body),(round2,round2.layout_event_errors),(round2,round2.compaction_history)))
    # Every remaining checker conditional is inventoried, even when this lane has no executable
    # own-defect witness. Do not silently omit a guard to present check 11 as complete.
    seen={id(fn) for _,fn,_ in groups}
    for module in (home,created,v2,reset,gate,round2,route):
        for name,obj in vars(module).items():
            functions=[]
            if inspect.isfunction(obj) and obj.__module__==module.__name__: functions=[obj]
            elif inspect.isclass(obj) and obj.__module__==module.__name__:
                functions=[v for v in vars(obj).values() if inspect.isfunction(v)]
            for fn in functions:
                if id(fn) not in seen:
                    groups.append((module,fn,[]));seen.add(id(fn))
    return groups

def audit():
    table=[];baseline_failures=[]
    modules=[home,created,v2,reset,round2]
    source_hashes={str(Path(m.__file__).relative_to(ROOT)):__import__('hashlib').sha256(Path(m.__file__).read_bytes()).hexdigest() for m in modules}
    for relative in ('scripts/pm_ds_guard_removal.py','scripts/pm_event_payload_route.py','scripts/pm-browser-event-admission.py'):
        source_hashes[relative]=__import__('hashlib').sha256((ROOT/relative).read_bytes()).hexdigest()
    groups=cohort()
    checked=set()
    for _,_,cases in groups:
        for name,test in cases:
            if name in checked:continue
            checked.add(name)
            try:
                if test():baseline_failures.append({'case':name,'accepted_before_weakening':True})
            except Exception as exc:baseline_failures.append({'case':name,'exception':repr(exc)})
    if baseline_failures:
        return {'status':'fail','baseline_failures':baseline_failures,'guard_count':0,'witnessed_guard_count':0,'guard_removal_table':[],'source_sha256':source_hashes,'claim':'No ablation is valid until every negative rejects before weakening.'}
    for module,fn,cases in groups:
        print('audit '+fn.__qualname__+' cases='+str(len(cases)),flush=True)
        baseline={}
        for name,test in cases:
            try:baseline[name]=bool(test())
            except Exception as exc:baseline_failures.append({'case':name,'exception':repr(exc)});continue
            if baseline[name]:baseline_failures.append({'case':name,'accepted_before_weakening':True})
        for line,condition,tree in guards(fn):
            altered=weaken(fn,line,tree);flipped=[];stayed=[];exceptions=[]
            owner=fn.__qualname__.split('.')[0]
            target=getattr(module,owner) if '.' in fn.__qualname__ and inspect.isclass(getattr(module,owner,None)) else module
            with patch.object(target,fn.__name__,altered):
                for name,test in cases:
                    try:(flipped if test() else stayed).append(name)
                    except Exception as exc:exceptions.append({'case':name,'exception':repr(exc)})
            table.append({'guard':str(Path(inspect.getsourcefile(inspect.unwrap(fn))).relative_to(ROOT))+':'+str(inspect.getsourcelines(fn)[1]+line-1),
                          'function':fn.__qualname__,'condition':condition,'negatives_that_flip':flipped,'negatives_that_stay_rejected':stayed,
                          'exceptions':exceptions,'status':'witnessed' if flipped and not exceptions else 'partial',
                          'limit':'Flips are observed, not automatically assigned as this guard\'s own defect. Empty/exception rows remain open.'})
    for path,digest in source_hashes.items():
        if __import__('hashlib').sha256((ROOT/path).read_bytes()).hexdigest()!=digest:
            baseline_failures.append({'source_changed_during_audit':path})
    return {'source_sha256':source_hashes,'schema_id':'pm.ds.whole_lane_guard_removal.v1','status':'partial','baseline_failures':baseline_failures,
            'guard_count':len(table),'witnessed_guard_count':sum(r['status']=='witnessed' for r in table),
            'guard_removal_table':table,'claim':'Inventory and actual source-condition ablations; no complete check-11 claim while any row is partial or ownership unadjudicated.'}

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path);parser.add_argument('--self-test',action='store_true');args=parser.parse_args()
    if args.self_test:
        with patch(__name__+'.cohort',return_value=[(round2,round2.compaction_payload_errors,[('injected_accepted_negative',lambda:True)])]):
            bad=audit()
        good=bad['status']=='fail' and bad['guard_count']==0 and bool(bad['baseline_failures'])
        print(json.dumps({'status':'pass' if good else 'fail','injected_accepted_negative_refused_before_ablation':good}));return not good
    if args.output is None:parser.error('--output is required unless --self-test')
    result=audit();args.output.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='guard_removal_table'},indent=2));return bool(result['baseline_failures'])
if __name__=='__main__':raise SystemExit(main())
