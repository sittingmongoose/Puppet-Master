"""Read-only adapter for the canon-pinned restore_point.deleted original suite.

Frozen source bytes are never edited. The adapter replaces only the fixture
assertion transport with named Goal tables, and schema validation with the
same complete schemas and shared format checker. Unexpected exceptions stay
exceptions; they are never accepted as negative-case kills.
"""
import hashlib
import importlib
import inspect
import json
from pm_goal_time import instant
from pathlib import Path
import sys
from collections import OrderedDict

from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012
import pm_goal_oracle_common as c
import pm_goal_guard_tables as tables

ROOT = Path(__file__).resolve().parents[1]
SCHEMAS = {}
RESOURCES = {}
CREATED_DIGEST = None
SCHEMA_SEEDS = {}
SCHEMA_RESULTS = {}
HASH_FUNCTIONS = {}
HELPER_HASH_FUNCTIONS = {}
SOURCE_BUILDER = None
FINGERPRINTS = OrderedDict()


def frozen_fingerprint(value, *, compact=False):
    """Bounded memoization of these read-only frozen schema objects only."""
    key=(id(value),compact)
    if key not in FINGERPRINTS:
        raw=json.dumps(value,sort_keys=True,**({'separators':(',',':')} if compact else {})).encode()
        FINGERPRINTS[key]=(value,hashlib.sha256(raw).hexdigest())
        if len(FINGERPRINTS)>1024:FINGERPRINTS.popitem(last=False)
    else:FINGERPRINTS.move_to_end(key)
    return FINGERPRINTS[key][1]


class ExpectedRefusal(Exception):
    def __init__(self, errors):
        self.errors = set(errors)


def expect(condition, label):
    frame = inspect.currentframe().f_back
    name = 'restore_point.deleted/original/'+label
    code = tables.decide(name, condition, site=(frame.f_code.co_filename,frame.f_lineno))
    if code is not None:
        raise ExpectedRefusal({code})


class Schema:
    def __init__(self, original, registry):
        self.original = original
        base = original._resolver._base_uri
        # Preserve the original resolver's root binding as well as every
        # registered resource; a fragment validator may have an anonymous root.
        resources = []
        fingerprints = []
        for uri,resource in original._resolver._registry._resources.items():
            if uri.startswith('https://json-schema.org/') or uri.startswith('http://json-schema.org/'):
                continue
            fingerprint = frozen_fingerprint(resource.contents,compact=True)
            fingerprints.append((uri,fingerprint))
            if fingerprint not in RESOURCES:
                RESOURCES[fingerprint] = Resource.from_contents(
                    c.runtime_schema(resource.contents),default_specification=DRAFT202012)
            resources.append((uri,RESOURCES[fingerprint]))
        key = (base,frozen_fingerprint(original.schema),tuple(sorted(fingerprints)))
        if key in SCHEMAS:
            self.validator = SCHEMAS[key]
            return
        closed = registry.with_resources(resources)
        self.validator = c.StrictValidator(c.runtime_schema(original.schema), registry=closed,
            _resolver=closed.resolver(base),format_checker=c.FORMATS)
        SCHEMAS[key] = self.validator

    def validate(self, value):
        key = frozen_fingerprint(self.original.schema)
        name = 'restore_point.deleted/original/schema/'+key
        # This is the original helper's complete schema predicate, retaining
        # every owner keyword. It is not per-keyword/occurrence proof credit.
        import pickle
        cache_key=(id(self.validator),hashlib.sha256(pickle.dumps(value,protocol=5)).digest())
        if cache_key not in SCHEMA_RESULTS:
            if len(SCHEMA_RESULTS)>50000:SCHEMA_RESULTS.clear()
            SCHEMA_RESULTS[cache_key]=self.validator.is_valid(value)
        holds=SCHEMA_RESULTS[cache_key]
        code = tables.decide(name,holds,site=(__file__,inspect.currentframe().f_lineno))
        if code is not None:
            raise ExpectedRefusal({code})
        if name not in SCHEMA_SEEDS:
            import copy
            SCHEMA_SEEDS[name]=(self.validate,dict(args=[copy.deepcopy(value)],kwargs={}),name)

    def is_valid(self, value):
        import pickle
        key=(id(self.validator),hashlib.sha256(pickle.dumps(value,protocol=5)).digest())
        if key not in SCHEMA_RESULTS:
            if len(SCHEMA_RESULTS)>50000:SCHEMA_RESULTS.clear()
            SCHEMA_RESULTS[key]=self.validator.is_valid(value)
        return SCHEMA_RESULTS[key]

    def iter_errors(self, value):
        # The original callers that enumerate errors still use their actual
        # schema. A refusal is routed through the complete schema boundary.
        self.validate(value)
        return iter(())


def created_result(a):
    """Literal assert-to-guard port of the pinned created_result_check.check.

    Preserve its frozen digest recipe; no current semantic codec is selected
    while inspecting an older original receipt.
    """
    o,n,r,u = (a[k] for k in ('original_command_outcome','original_normalized_request',
                             'original_owner_result','original_ui_response'))
    expect(a['project_id']==o['identity']['project_id'],'SP274/project')
    expect(o['identity']==n['owner_identity'],'SP274/owner_identity')
    expect(o['command_id']==n['command_id']==a['command_id'],'SP274/command')
    expect(o['idempotency_key']==n['idempotency_key']==a['idempotency_key'],'SP274/idempotency')
    expect(o['payload_sha256']==n['payload_sha256'],'SP274/payload_digest')
    expect(o['target_generation']==n['target_generation'],'SP274/target_generation')
    expect(o['dispatch_frame_id']==n['dispatch_frame_id'],'SP274/dispatch_frame')
    expect(o['identity']['operation_id']==n['operation_id'],'SP274/operation')
    expect(o['identity']['command_instance_id']==n['command_instance_id'],'SP274/instance')
    if a['state']=='terminal':
        expect(r['command_request_sha256']==a['command_request_sha256'],'SP274/request_digest')
        expect(CREATED_DIGEST(r)==a['owner_result_sha256']==o['owner_result_sha256'],'SP274/result_digest')
        expect(u['owner_result_ref']==o['owner_result_ref'],'SP274/result_ref')
        expect(u['owner_result_schema_ref']==o['owner_result_schema_ref'],'SP274/result_schema')
        expect(u['owner_identity']==o['identity'],'SP274/response_identity')
        expect(u['command_outcome_ref']==a['command_outcome_ref'],'SP274/outcome_ref')
        expect(u['dispatch_id']==a['original_dispatch_id'],'SP274/dispatch')
        expect(u['request_ref']==n['request_ref'],'SP274/request_ref')
        expect(u['receipt_ref']==r['receipt_ref']==o['result_receipt_ref'],'SP274/receipt_ref')
        expect(u['command_id']==o['command_id'],'SP274/response_command')
        expect(u['command_instance_id']==n['command_instance_id'],'SP274/response_instance')
        expect(u['operation_id']==n['operation_id'],'SP274/response_operation')
        if r['outcome']=='created':
            expect(CREATED_DIGEST(a['original_append_receipt'])==r['append_receipt_sha256']
                and a['original_append_receipt']['event_id']==r['created_event_id']
                and u['event_refs']==[r['created_event_id']],'SP274/original_append')


def legacy_other(value):
    import datetime,re
    if type(value)is bool:return not value
    if type(value)in (int,float):return value+1
    if type(value)is bytes:return value+b'x'
    if value is None:return 'fixture-other'
    if type(value)is str:
        if re.fullmatch('[0-9a-f]{64}',value) or re.fullmatch('[0-9a-f-]{36}',value):return ('1'if value[0]!='1'else'2')+value[1:]
        if re.fullmatch(r'\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ',value):return (datetime.datetime.fromisoformat(value[:-1]+'+00:00')+datetime.timedelta(seconds=1)).isoformat().replace('+00:00','Z')
        return value+'-other'
    if isinstance(value,(list,dict)):return None
    raise TypeError('unsupported fixture leaf')


def seed_ref(function,label,files):
    if label.startswith('restore_point.deleted/original/schema/'):
        return dict(schema=label)
    ordinal=int(label.rsplit('/',1)[1]);fn=function.__func__ if inspect.ismethod(function)else function
    if fn is created_result:return dict(adapter='created_result',ordinal=ordinal)
    path=Path(fn.__code__.co_filename).resolve()
    return dict(manifest_file_index=files.index(path),function_line=fn.__code__.co_firstlineno,ordinal=ordinal)


def replay_witnesses(collector,seeds,files):
    import ast,copy,pickle
    bank_path=ROOT/'tests/fixtures/pnc019_goal_frozen_helper_witnesses.json'
    bank=json.loads(bank_path.read_text());available={}
    for fn,base,label in seeds:
        try:ref=seed_ref(fn,label,files)
        except (ValueError,TypeError):continue
        available[json.dumps(ref,sort_keys=True)]=(fn,base,label)
    found=set();editors={}
    for number,case in enumerate(bank['cases']):
        slot=available.get(json.dumps(case['seed'],sort_keys=True))
        if slot is None:
            collector.failures.append(dict(case='frozen-fixture/'+str(number),kind='seed_missing',seed=case['seed']));continue
        fn,base,label=slot
        def evaluate(value,fn=fn):
            try:fn(*value['args'],**value['kwargs'])
            except ExpectedRefusal as refusal:return refusal.errors
            return set()
        collector.invoke('frozen-fixture/control/'+str(number),evaluate,base,True)
        value=copy.deepcopy(base);parent=value
        for key in case['path'][:-1]:parent=parent[key]
        if case['operation']=='legacy_other':
            parent[case['path'][-1]]=legacy_other(parent[case['path'][-1]])
        elif case['operation'].startswith('source_'):
            from pm_goal_deleted_case_ops import source_edit
            value=source_edit(base,case['operation'],SOURCE_BUILDER,HASH_FUNCTIONS)
        else:
            from pm_goal_deleted_case_ops import Editor
            key=(json.dumps(case['seed'],sort_keys=True),case.get('hash_recipe_version',1))
            if key not in editors:editors[key]=Editor(base,HELPER_HASH_FUNCTIONS if case.get('hash_recipe_version')==2 else HASH_FUNCTIONS)
            value=editors[key].edit(tuple(case['path']),case['operation'])
        if hashlib.sha256(pickle.dumps(value,protocol=5)).hexdigest()!=case['input_sha256']:
            collector.failures.append(dict(case='frozen-fixture/'+str(number),kind='input_sha256'));continue
        source='frozen-fixture/single-defect/'+str(number)
        result=collector.invoke(source,evaluate,value,False)
        if set(result)!={case['expected_refusal']}:
            collector.failures.append(dict(case=source,kind='refusal',expected=case['expected_refusal'],actual=sorted(result)));continue
        target=case['expected_refusal'];candidate=collector.candidates.get(target)
        if candidate is None:
            collector.failures.append(dict(case=source,kind='not_first_refusal',expected=target));continue
        found.add(target)
    return found


def helper_witnesses(collector,seeds,files):
    """Find first-refusal witnesses from real helper inputs; never credit crashes."""
    import copy,os,pickle
    from pm_goal_deleted_case_ops import Editor,nodes
    found=set(collector.candidates);attempted=0;skipped={};selected=[]
    limit=int(os.environ.get('PNC019_FROZEN_ATTEMPTS_PER_SEED','500'))
    part,total=map(int,os.environ.get('PNC019_FROZEN_PART','0/1').split('/'))
    def checkpoint():
        collector.checkpoint()
        if collector.checkpoint_path:
            (collector.checkpoint_path/'new-frozen-witnesses.json').write_text(json.dumps(selected,indent=1)+'\n')
    for ordinal,(function,base,label) in enumerate(seeds):
        if ordinal%total!=part:continue
        def evaluate(value,fn=function):
            try:fn(*value['args'],**value['kwargs'])
            except ExpectedRefusal as refusal:return refusal.errors
            return set()
        collector.invoke('frozen-helper/control/'+label,evaluate,base,True)
        code=function.__func__.__code__ if inspect.ismethod(function) else function.__code__
        end=max(line for _,_,line in code.co_lines() if line is not None)
        wanted={name for name,row in collector.rows.items() if any(site[0]==code.co_filename and code.co_firstlineno<=site[1]<=end for site in row['sites'])}-found
        if inspect.ismethod(function) and isinstance(function.__self__,Schema):
            wanted={'restore_point.deleted/original/schema/'+frozen_fingerprint(function.__self__.original.schema)}-found
        if not wanted:continue
        editor=Editor(base,HELPER_HASH_FUNCTIONS)
        seed_attempts=0
        constants=set(x for x in code.co_consts if type(x)is str)
        paths=list(nodes(base))
        paths.sort(key=lambda item:(item[0][-1] not in constants if item[0] else True,len(item[0]),repr(item[0])))
        for path,original in paths:
            if not path or path[0]=='args'and len(path)<=2 or path==('kwargs',):continue
            if seed_attempts>=limit:break
            large=isinstance(original,(dict,list))and len(pickle.dumps(original,protocol=5))>20000
            modes=['simple','coherent','remove','coherent_remove','rename','coherent_rename']
            first_by_operation={}
            if isinstance(original,str) and 'T' in original and original.endswith('Z'):modes.append('coherent_backward')
            for mode in modes:
                if large and mode not in ('remove','rename'):continue
                operation='remove'if mode.endswith('remove')else'rename'if mode.endswith('rename')else'replace'
                prior=first_by_operation.get(operation)
                if mode.startswith('coherent')and prior and ('schema'in prior.lower()or(type(original)is str and __import__('re').fullmatch('[0-9a-f]{64}',original))):continue
                try:changed=editor.edit(path,mode)
                except (TypeError,ValueError,KeyError,IndexError):continue
                attempted+=1;seed_attempts+=1
                if attempted%250==0:
                    print('frozen attempts',attempted,'new witnesses',len(selected),'helper',label,file=sys.stderr,flush=True);checkpoint()
                previous=collector.active;collector.active=[]
                try:result=evaluate(copy.deepcopy(changed))
                except Exception as exc:
                    skipped[type(exc).__name__]=skipped.get(type(exc).__name__,0)+1;continue
                finally:observed=collector.active;collector.active=previous
                if len(result)!=1:continue
                target=next(iter(result));first=next((name for name,holds in observed if not holds),None)
                if not mode.startswith('coherent'):first_by_operation[operation]=first
                if first!=target or target in found:continue
                source='frozen-helper/'+mode+'/'+label+'/'+repr(path)
                collector.invoke(source,evaluate,changed,False)
                collector.candidates[target]=(evaluate,copy.deepcopy(changed),source)
                collector.snapshots[target]=copy.deepcopy(changed)
                record=dict(expected_refusal=target,seed=seed_ref(function,label,files),path=list(path),operation=mode,hash_recipe_version=2,input_sha256=hashlib.sha256(pickle.dumps(changed,protocol=5)).hexdigest())
                selected.append(record);found.add(target);wanted.discard(target)
                if not wanted:break
            if not wanted:break
        checkpoint()
    collector.frozen_exploration=dict(attempts=attempted,selected=len(selected),nonwitness_exceptions=skipped)
    checkpoint()


def main():
    global CREATED_DIGEST,HASH_FUNCTIONS,HELPER_HASH_FUNCTIONS,SOURCE_BUILDER
    collector = tables.COLLECTOR
    if collector is None:
        raise RuntimeError('Run with pm_goal_guard_sweep.py --source pm_goal_deleted_external_oracles')
    start = len(collector.failures)
    pin = c.load(ROOT/'Plans/restore_point_deleted_contract_fixtures.json')['frozen_joined_subject']
    manifest_path = Path(pin['path'])
    if hashlib.sha256(manifest_path.read_bytes()).hexdigest() != pin['sha256']:
        raise ValueError('restore_point.deleted frozen manifest pin')
    manifest = json.loads(manifest_path.read_text())
    directory = manifest_path.parent
    for row in manifest['files']:
        path = Path(row['path'])
        if not path.is_absolute():
            path = directory/path
        if hashlib.sha256(path.read_bytes()).hexdigest() != row['sha256']:
            raise ValueError('frozen resource changed: '+str(path))
    old_path = list(sys.path)
    old_bytecode = sys.dont_write_bytecode
    saved = []
    helper_seeds=[]
    seed_counts={}
    seen_inputs=set()
    capturing=[True]
    sys.dont_write_bytecode = True
    try:
        sys.path.insert(0,str(directory))
        subject = importlib.import_module('validate_deleted_v3')
        dependency = importlib.import_module('dependency_runtime')
        docs = {}
        for folder in (dependency.S,dependency.F,directory):
            for path in folder.glob('*.json'):
                data = json.loads(path.read_text())
                if isinstance(data,dict) and '$id' in data and '$schema' in data:
                    docs[data['$id']] = data
        registry = Registry().with_resources((uri,Resource.from_contents(c.runtime_schema(doc),
            default_specification=DRAFT202012)) for uri,doc in docs.items())
        namespaces = [vars(subject),vars(dependency),dependency.G,dependency.AD,dependency.C,dependency.R,
                      vars(subject.OC),vars(subject.SC)]
        seen = set()
        def patch(namespace, name, value):
            key = (id(namespace),name)
            if key not in seen:
                saved.append((namespace,name,namespace[name]))
                seen.add(key)
            namespace[name] = value
        for namespace in namespaces:
            if 'expect' in namespace:
                patch(namespace,'expect',expect)
            for key,value in list(namespace.items()):
                if key in ('cv','iv','ev','ev1','payload_validator') and hasattr(value,'validate'):
                    patch(namespace,key,Schema(value,registry))
                elif key == 'validators' and isinstance(value,dict):
                    patch(namespace,key,{k:Schema(v,registry) for k,v in value.items()})
        patch(vars(subject.SC),'require',expect)
        for namespace in namespaces:
            for name in ('dt','parse','parse_time'):
                if name in namespace and inspect.isfunction(namespace[name]) and 'fromisoformat' in namespace[name].__code__.co_names:
                    patch(namespace,name,instant)
        CREATED_DIGEST = dependency.R['digest']
        HASH_FUNCTIONS={name:dependency.G[name] for name in ('dig','mpdig','bdig')}
        HELPER_HASH_FUNCTIONS={**HASH_FUNCTIONS,**{name:dependency.G[name]for name in ('rows_hash','prefix_hash','sem')}}
        SOURCE_BUILDER=dependency.G['source']
        patch(vars(subject),'created_result_check',created_result)
        original_validator = subject.validator
        def validator(schema):
            return Schema(original_validator(schema),registry)
        for namespace in namespaces:
            if 'validator' in namespace:
                patch(namespace,'validator',validator)
        import copy,pickle,functools
        # Capture complete accepted helper calls from the existing frozen
        # positives. Constructors/generators and external IO are not invoked.
        for namespace in namespaces:
            for key,fn in list(namespace.items()):
                if not inspect.isfunction(fn):
                    continue
                if not {'expect','require','validator','validate','validate_native','validate_creation_context','validate_original_result'}.intersection(fn.__code__.co_names):
                    continue
                if fn is expect or fn.__name__=='validator':continue
                label=fn.__code__.co_filename+':'+str(fn.__code__.co_firstlineno)
                def wrapper(*args,__fn=fn,__label=label,**kwargs):
                    result=__fn(*args,**kwargs)
                    if capturing[0] and seed_counts.get(__label,0)<8:
                        try:
                            value=dict(args=list(args),kwargs=kwargs)
                            fingerprint=hashlib.sha256(pickle.dumps((__label,value),protocol=5)).hexdigest()
                            if fingerprint not in seen_inputs:
                                seen_inputs.add(fingerprint)
                                seed_counts[__label]=seed_counts.get(__label,0)+1
                                helper_seeds.append((__fn,copy.deepcopy(value),__label+'/'+str(seed_counts[__label])))
                        except (TypeError,ValueError):pass
                    return result
                patch(namespace,key,wrapper)
        def evaluate(value):
            try:
                subject.validate(value)
            except ExpectedRefusal as refusal:
                return refusal.errors
            return set()
        cases = json.loads((directory/'joined-v3-examples.json').read_text())
        for label,value in cases['positive'].items():
            collector.invoke('restore_point.deleted/frozen/'+label,evaluate,value,True)
        for case in cases['negative']:
            value = case.get('fixture',case.get('value'))
            collector.invoke('restore_point.deleted/frozen/'+case['id'],evaluate,value,False)
        capturing[0]=False
        for name,(fn,base,label) in list(SCHEMA_SEEDS.items()):
            def schema_boundary(value,fn=fn):
                try:fn(value)
                except ExpectedRefusal as refusal:return refusal.errors
                return set()
            collector.invoke('frozen-schema/control/'+name,schema_boundary,base['args'][0],True)
            collector.invoke('frozen-schema/root-type/'+name,schema_boundary,None,False)
        all_seeds=list(SCHEMA_SEEDS.values())+helper_seeds
        globals()['FIXTURE_CONTEXT']=(dependency,subject,all_seeds)
        files=[(Path(r['path']) if Path(r['path']).is_absolute() else directory/r['path']).resolve() for r in manifest['files']]
        replay_witnesses(collector,all_seeds,files)
        import os
        if os.environ.get('PNC019_FROZEN_EXPLORE')=='1':
            helper_witnesses(collector,all_seeds,files)
    finally:
        # The adapter stays installed for cut replay in this isolated process.
        # No frozen file was written, and the process owns these imports.
        sys.path[:] = old_path
        sys.dont_write_bytecode = old_bytecode
    return int(len(collector.failures)>start)
