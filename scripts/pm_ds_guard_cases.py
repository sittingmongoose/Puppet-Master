"""Capture existing owner test inputs at their actual checker seams for DS guard proofs.

No test or checker is bypassed. The unchanged suites must pass before their cases
are reused. Captures are in memory and carry their test id and original result.
"""
from __future__ import annotations
import copy
import hashlib
import importlib.util
import inspect
import io
import json
import sys
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CHECKERS={'pm_browser_workspace_created.py','pm_browser_workspace_created_v2.py','pm_browser_workspace_reset.py','pm-browser-event-admission.py'}
PURE={'creation_preflight_failures','reset_preflight_failures','checkpoint_failures','checkpoint_core_failures','core_relation_failures','core_failures','legacy_failures',
      'index_token_failures','generation_admission_failures','generation_failures','source_failures','advance_failures','cleanup_failures',
      'candidate_failures','event_failures','central_binding_failures','binding_failures','authority_binding_failures'}
METHODS={'create','reset','resolve_append','advance','replace','cleanup','disclose','withdraw','workspace_history_fact'}
ACCEPTED={'creation_committed_and_published','committed_original_ack_lost','original_result_no_effect','original_result_no_reset',
          'reset_event_committed_and_published','reset_event_committed_ack_lost','checkpoint_committed_no_runtime_effect','historical_fact_no_runtime_authority',
          'historical_reset_fact_no_runtime_authority','eligible_retired_generation_removed','already_withdrawn_original_anchor','withdrawn_publication_fenced'}

class Globals:
    def __init__(self,mapping):object.__setattr__(self,'mapping',mapping)
    def __getattr__(self,key):
        try:return self.mapping[key]
        except KeyError:raise AttributeError(key) from None
    def __setattr__(self,key,value):self.mapping[key]=value
    def __delattr__(self,key):del self.mapping[key]


def capture():
    modules=[]
    for name in ('test_pm_browser_workspace_created','test_pm_browser_workspace_reset'):
        spec=importlib.util.spec_from_file_location('ds_capture_'+name,ROOT/'tests'/(name+'.py'))
        module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);modules.append(module)
    active={};records={};targets={};discovered={};current=['setup']
    class Result(unittest.TextTestResult):
        def startTest(self,test):
            current[0]=test.id();print('reuse '+test.id(),flush=True);super().startTest(test)
    def profile(frame,event,result):
        name=frame.f_code.co_name
        if name not in PURE and name not in METHODS:return
        filename=frame.f_code.co_filename.rsplit('/',1)[-1]
        if filename not in CHECKERS:return
        if event=='call':
            if 'self' in frame.f_locals:
                target=type(frame.f_locals['self']);fn=getattr(target,name,None)
            else:
                target=targets.setdefault(id(frame.f_globals),Globals(frame.f_globals));fn=frame.f_globals.get(name)
            if fn is None:return
            discovered.setdefault((id(target),fn.__qualname__),(target,fn,[]))
            # Capture the outer contract call only. Its replay still reaches every
            # nested guard; registering nested functions preserves the inventory.
            if active:return
            try:
                params=inspect.signature(fn).parameters
                values={k:copy.deepcopy(frame.f_locals[k]) for k in params if k in frame.f_locals}
            except (ValueError,TypeError):return
            active[id(frame)]=(target,fn,values,current[0])
        elif event=='return' and id(frame) in active:
            target,fn,values,test=active.pop(id(frame))
            if name in PURE:
                if not isinstance(result,list):return
                negative=bool(result);kind='errors'
            elif isinstance(result,str):
                negative=result not in ACCEPTED;kind='outcome'
            elif isinstance(result,dict) and 'outcome' in result:
                negative=not result['outcome'].startswith('historical_');kind='history'
            else:return
            # Stable argument identity, excluding mutable object addresses.
            def simple(v):
                if hasattr(v,'__dict__'):return {'class':type(v).__qualname__,'state':{k:simple(x) for k,x in vars(v).items()}}
                if isinstance(v,dict):return {k:simple(x) for k,x in v.items()}
                if isinstance(v,(tuple,list)):return [simple(x) for x in v]
                if callable(v):return getattr(v,'__qualname__',repr(v))
                return str(v) if isinstance(v,Path) else v
            try:encoded=json.dumps(simple(values),sort_keys=True,default=repr)
            except (TypeError,ValueError):return
            identity=(id(target),fn.__qualname__,hashlib.sha256(encoded.encode()).hexdigest())
            records.setdefault(identity,(target,fn,values,test,copy.deepcopy(result),negative,kind))
    suite=unittest.TestSuite(unittest.defaultTestLoader.loadTestsFromModule(m) for m in modules)
    stream=io.StringIO();runner=unittest.TextTestRunner(stream=stream,resultclass=Result)
    old=sys.getprofile();sys.setprofile(profile)
    try:result=runner.run(suite)
    finally:sys.setprofile(old)
    if not result.wasSuccessful():raise AssertionError('existing guard-case suites failed: '+stream.getvalue())
    groups={};positives=[];failures=[];scoped_faults=[]
    for index,(target,fn,values,test,expected,negative,kind) in enumerate(records.values()):
        name='inherited:'+Path(inspect.getsourcefile(inspect.unwrap(fn))).name+':'+fn.__qualname__+':'+str(index)+':'+test.rsplit('.',1)[-1]
        def invoke(t=target,n=fn.__name__,v=values):
            # The captured tuple is a private snapshot of read-only schemas/validators.
            # Gate predicates never mutate it; all event/state/observation inputs remain fresh.
            inputs={k:(x if k=='context' and isinstance(x,tuple) and len(x)==5 else copy.deepcopy(x)) for k,x in v.items()}
            return getattr(t,n)(**inputs)
        try:actual=invoke()
        except Exception as exc:failures.append({'case':name,'exception':repr(exc)});continue
        if actual!=expected:
            if test.endswith('.test_contract_durable_token_is_the_sp278_projection') and fn.__name__=='binding_failures':
                scoped_faults.append({'test':test,'case':name,'kind':'dependency_fault_control',
                    'reason':'The original test patches load(CONTRACT_PATH) with a ten-field token. Its assertion passed inside that exact mock scope; replaying only the row cannot reproduce it.',
                    'captured_result':expected,'outside_mock_result':actual,'guard_witness_claimed':False})
                continue
            failures.append({'case':name,'captured_result_not_reproducible':True,'expected':expected,'actual':actual});continue
        if not negative:
            positives.append((name,invoke,expected));continue
        def accepts(call=invoke,k=kind):
            value=call()
            if k=='errors':return not value
            if k=='history':return value['outcome'].startswith('historical_')
            return value in ACCEPTED
        groups.setdefault((id(target),fn.__qualname__),(target,fn,[]))[2].append((name,accepts))
    if failures:raise AssertionError('captured cases must reproduce before ablation: '+json.dumps(failures[:5]))
    for identity,group in discovered.items():groups.setdefault(identity,group)
    return list(groups.values()),positives,{'tests_run':result.testsRun,'unique_checker_calls':len(records),'negative_cases':sum(len(g[2]) for g in groups.values()),'positive_controls':len(positives),'scoped_fault_controls':scoped_faults}
