#!/usr/bin/env python3
"""Inventory and independently weaken lane DS checker guards. No source files are mutated."""
from __future__ import annotations
import argparse
import ast
import copy
import inspect
import json
import textwrap
import io
from contextlib import redirect_stdout
import sys
from functools import lru_cache
from contextlib import ExitStack
from pathlib import Path
from unittest.mock import patch
import pm_event_authority_ds_round2 as round2
import pm_home_layout_v2_slot_receipt as home
import pm_browser_workspace_created as created
import pm_browser_workspace_created_v2 as v2
import pm_browser_workspace_reset as reset

ROOT=Path(__file__).resolve().parents[1]
INHERITED_SUMMARY={}
POSITIVE_CONTROLS=[]

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
    import pm_ds_guard_cases as inherited
    inherited_groups,positives,summary=inherited.capture()
    INHERITED_SUMMARY.update(summary)
    POSITIVE_CONTROLS.extend(positives)
    groups.extend(inherited_groups)
    import pm_event_authority_ds_round3 as round3
    targeted=round3.build()
    cases=[(name,fn) for name,_,fn in targeted.negatives]
    # Feed new controls to every real checker they reach, selected by actual baseline traces below.
    groups.extend((module,fn,cases) for module,fn,_ in list(groups) if cases)
    return groups

def audit():
    table=[];baseline_failures=[]
    modules=[home,created,v2,reset,round2]
    source_hashes={str(Path(m.__file__).relative_to(ROOT)):__import__('hashlib').sha256(Path(m.__file__).read_bytes()).hexdigest() for m in modules}
    for relative in ('scripts/pm_ds_guard_removal.py','scripts/pm_ds_guard_cases.py','scripts/pm_event_authority_ds_round3.py','scripts/pm_event_payload_route.py','scripts/pm-browser-event-admission.py','scripts/pm-implementation-readiness.py'):
        source_hashes[relative]=__import__('hashlib').sha256((ROOT/relative).read_bytes()).hexdigest()
    groups=cohort()
    # A source-condition mutation cannot affect a case that never calls that function.
    # Trace each baseline; keep every unrelated negative in the reported stay-rejected set.
    all_cases={name:test for _,_,cases in groups for name,test in cases}
    import pm_event_payload_route as route
    traces={}
    for ordinal,(name,test) in enumerate(all_cases.items()):
        if ordinal%25==0:print('baseline '+str(ordinal)+'/'+str(len(all_cases)),flush=True)
        # Match the cold eager state used by mutations; warm caches cannot hide dependencies.
        route._eager_done.clear()
        calls=set()
        def trace(frame,event,arg):
            if event=='call':calls.add((frame.f_code.co_filename,frame.f_code.co_firstlineno,id(frame.f_globals)))
        old=sys.getprofile();sys.setprofile(trace)
        try:
            if test():baseline_failures.append({'case':name,'accepted_before_weakening':True})
        except Exception as exc:baseline_failures.append({'case':name,'exception':repr(exc)})
        finally:sys.setprofile(old)
        traces[name]=calls
    if baseline_failures:
        return {'status':'fail','baseline_failures':baseline_failures,'guard_count':0,'witnessed_guard_count':0,'guard_removal_table':[],'source_sha256':source_hashes,'claim':'No ablation is valid until every negative rejects before weakening.'}
    unique={}
    for module,fn,cases in groups:
        unique.setdefault((id(module),id(fn)),(module,fn))
    from pm_ds_guard_cases import static_browser_contexts
    with static_browser_contexts(fn for _,fn in unique.values()) as clear_contexts:
        for module,fn in unique.values():
            code=inspect.unwrap(fn).__code__;identity=(code.co_filename,code.co_firstlineno,id(inspect.unwrap(fn).__globals__))
            cases=[(name,test) for name,test in all_cases.items() if identity in traces[name]]
            unrelated=sorted(set(all_cases)-{n for n,_ in cases})
            print('audit '+fn.__qualname__+' cases='+str(len(cases)),flush=True)
            for line,condition,tree in guards(fn):
                import pm_event_payload_route as route
                route._eager_done.clear()
                clear_contexts()
                altered=weaken(fn,line,tree);flipped=[];stayed=[];exceptions=[]
                owner=fn.__qualname__.split('.')[0]
                target=getattr(module,owner) if '.' in fn.__qualname__ and inspect.isclass(getattr(module,owner,None)) else module
                aliases=[]
                with ExitStack() as stack:
                    stack.enter_context(patch.object(target,fn.__name__,altered))
                    if fn in (home._exact_numeric_type,home._ecma_pattern):
                        keyword='type' if fn is home._exact_numeric_type else 'pattern'
                        stack.enter_context(patch.dict(home.Home4Validator.VALIDATORS,{keyword:altered}))
                        aliases.append('Home4Validator.VALIDATORS['+keyword+'] (same captured function)')
                    for class_name in ('ReplayOracle','CandidateReplayOracle'):
                        cls=getattr(module,class_name,None)
                        if cls is not None and getattr(cls,'contract_failures',None) is fn:
                            stack.enter_context(patch.object(cls,'contract_failures',staticmethod(altered)))
                            aliases.append(class_name+'.contract_failures (same captured function)')
                    for name,test in cases:
                        try:(flipped if test() else stayed).append(name)
                        except Exception as exc:exceptions.append({'case':name,'exception':repr(exc)})
                route._eager_done.clear()
                clear_contexts()
                table.append({'guard':str(Path(inspect.getsourcefile(inspect.unwrap(fn))).relative_to(ROOT))+':'+str(inspect.getsourcelines(fn)[1]+line-1),
                              'function':fn.__qualname__,'condition':condition,'negatives_that_flip':flipped,'negatives_that_stay_rejected':sorted(stayed+unrelated),
                              'affected_case_count':len(cases),'unchanged_noncallers':len(unrelated),'named_alias_set':aliases,'namespace':inspect.unwrap(fn).__globals__.get('__name__'),
                              'exceptions':exceptions,'status':'witnessed' if flipped and not exceptions else 'partial',
                              'limit':"Actual source-condition ablation. Noncallers are unchanged by construction; flips need refusal ownership adjudication. Empty/exception rows remain open."})
    for path,digest in source_hashes.items():
        if __import__('hashlib').sha256((ROOT/path).read_bytes()).hexdigest()!=digest:
            baseline_failures.append({'source_changed_during_audit':path})
    return {'source_sha256':source_hashes,'schema_id':'pm.ds.whole_lane_guard_removal.v2','status':'partial','baseline_failures':baseline_failures,
            'inherited_case_reuse':INHERITED_SUMMARY,'distinct_negative_count':len(all_cases),'guard_removal_complete':False,'trace_policy':'Eager cache cold for each baseline and mutation; fixed context construction cached only within a mutation; successful standard-library schema-definition checks memoized by complete JSON document; no input validation result cached.',
            'guard_count':len(table),'witnessed_guard_count':sum(r['status']=='witnessed' for r in table),
            'guard_removal_table':table,'claim':'Inventory plus inherited checker/state-machine cases and actual source-condition ablations; no complete check-11 claim while any row is partial or ownership unadjudicated.'}

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path);parser.add_argument('--self-test',action='store_true');args=parser.parse_args()
    if args.self_test:
        with patch(__name__+'.cohort',return_value=[(round2,round2.compaction_payload_errors,[('injected_accepted_negative',lambda:True)])]):
            with redirect_stdout(io.StringIO()):bad=audit()
        good=bad['status']=='fail' and bad['guard_count']==0 and bool(bad['baseline_failures'])
        print(json.dumps({'status':'pass' if good else 'fail','injected_accepted_negative_refused_before_ablation':good}));return not good
    if args.output is None:parser.error('--output is required unless --self-test')
    # Pure hash memoization only; keys are exact bytes and no check is disabled.
    import pm_event_payload_route as route
    cached=lru_cache(maxsize=128)(home.blake3_hex)
    from pm_ds_guard_cases import validated_schema_documents
    with validated_schema_documents(),patch.object(home,'blake3_hex',cached),patch.object(route,'blake3_hex',cached):
        result=audit()
    args.output.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='guard_removal_table'},indent=2));return bool(result['baseline_failures'])
if __name__=='__main__':raise SystemExit(main())
