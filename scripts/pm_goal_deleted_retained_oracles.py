"""Deleted retained-read model, sealed recipe selection and complete store snapshots.

The native owner is the existing TEST_ONLY fixture Store. No native claim is
made. Original frozen files remain unchanged; only refusal transport and full
schema format validation are adapted in memory.
"""
import base64
import copy
import hashlib
import importlib
import inspect
import json
import pickle
from pathlib import Path
import sys
from referencing import Registry
import pm_goal_guard_tables as tables
import pm_goal_oracle_common as c
import pm_goal_deleted_external_oracles as frozen
import pm_goal_deleted_components as components
import pm_goal_retained as retained
from pm_goal_shared_oracles import check_read

ROOT=Path(__file__).resolve().parents[1]
SNAPSHOTS=[]


class Refused(frozen.ExpectedRefusal):
    def __init__(self,code):
        super().__init__({code});self.code=code


def need(condition,label):
    frame=inspect.currentframe().f_back
    code=tables.decide('restore_point.deleted/retained/'+label,condition,
                      site=(frame.f_code.co_filename,frame.f_lineno))
    if code is not None:raise Refused(code)


def backing(store):
    # Issued read leases and the injected race callback are ephemeral. Every
    # other model field, every canonical row, source and sealed recipe is kept.
    return dict(model={k:copy.deepcopy(v)for k,v in vars(store['model']).items()
                       if k not in ('issued','authenticate_exact_snapshot','open_read','revalidate_before_disclosure')},
                recipes=copy.deepcopy(store['recipes']))


def digest(value):return hashlib.sha256(pickle.dumps(value,protocol=5)).hexdigest()


def make_value(model):
    event=next(copy.deepcopy(f['event'])for f in model.generic['current_source']['frames']
               if f['event']['event_type']=='restore_point.deleted')
    custody,receipt,native_catalog=components.issue(event,model.storage_instance_id,copy.deepcopy(model.rows),frozen.FIXTURE_CONTEXT[0].G['mp'])
    recipes=dict(original_value=copy.deepcopy(event),custody=custody,content_permitted=True,
                 storage_instance_id=model.storage_instance_id,sealed_receipts=[receipt],
                 installed_recipes=[receipt['original']['recipe']],installed_native_component_recipes=native_catalog)
    return dict(store=dict(model=model,recipes=recipes),original=event,
                storage=model.storage_instance_id,request=model.request(),candidate=None,late=None)


def apply_late(store,action,fs):
    if not action:return
    model=store['model']
    if action['kind']=='field':setattr(model,action['field'],copy.deepcopy(action['value']))
    elif action['kind']=='point_hold':
        row=model.rows['point'];value=copy.deepcopy(row['value']);value['hold_refs']=['late:actual-hold']
        model.rows['point']=fs.packrow(row['key'],value)
    elif action['kind']=='point_immutable':
        row=model.rows['point'];document=copy.deepcopy(row['value']);document[action['field']]=action['value']
        model.rows['point']=fs.packrow(row['key'],document)
    elif action['kind']=='receipt_missing':store['recipes']['sealed_receipts']=[]
    elif action['kind']=='receipt_ambiguous':store['recipes']['sealed_receipts']*=2
    else:raise ValueError('unknown retained race action')


def evaluator(rr,fs,frozen):
    def check(value):
        input_sha256=digest(value)
        store=value['store'];model=store['model'];before=backing(store)
        expected=copy.deepcopy(store);apply_late(expected,value.get('late'),fs)
        expected=backing(expected);errors=set();changed=[False];read_lease=[None]
        def recipe():
            result=check_read(dict(store=store['recipes'],event=value['original'],storage=value['storage'],
                                   **({'recipe_override':value['recipe_override']}if 'recipe_override'in value else {})))
            if not result['errors']:components.select(store['recipes'],model,need)
            return result['errors']
        try:
            original_open=model.open_read
            def open_with_recipe(request):
                lease=original_open(request)  # Current admission precedes original lookup.
                read_lease[0]=lease
                found=recipe()
                if found:raise frozen.ExpectedRefusal(found)
                return lease
            model.open_read=open_with_recipe
            if not errors:
                original_auth=model.authenticate_exact_snapshot
                def auth(lease,snapshot):
                    original_auth(lease,snapshot)
                    if not changed[0]and(value.get('late')or{}).get('stage','after_authentication')=='after_authentication':
                        apply_late(store,value.get('late'),fs);changed[0]=True
                model.authenticate_exact_snapshot=auth
                original_fence=model.revalidate_before_disclosure
                def fence(lease,token):
                    if not changed[0]and(value.get('late')or{}).get('stage')=='before_disclosure':
                        apply_late(store,value.get('late'),fs);changed[0]=True
                    return original_fence(lease,token)
                model.revalidate_before_disclosure=fence
                native_out=rr.read_present(value['request'],model,value['candidate'])
                if not changed[0]and(value.get('late')or{}).get('stage')=='after_read':
                    apply_late(store,value.get('late'),fs);changed[0]=True
                errors=recipe()  # No receipt acquisition or recipe fallback at disclosure.
                if not errors:
                    old=store['recipes']['custody']['rows']
                    for name,row in model.rows.items():
                        if name=='point':
                            strip=lambda x:{k:v for k,v in x.items()if k not in ('status','hold_refs')}
                            need(c.same_json_value(strip(row['value']),strip(old[name]['value'])),'full original immutable point value')
                        else:need(c.same_json_value(row,old[name]),'full original canonical companion/result '+name)
                    model.revalidate_before_disclosure(read_lease[0],native_out['read_token'])
        except Refused as e:errors={e.code}
        except frozen.ExpectedRefusal as e:errors=e.errors
        after=backing(store)
        target=expected if changed[0]else before
        if digest(after)!=digest(target):raise AssertionError('read changed backing store beyond the explicitly injected owner race')
        SNAPSHOTS.append(dict(input_sha256=input_sha256,before_sha256=digest(before),after_sha256=digest(after),
            before_pickle_base64=base64.b64encode(pickle.dumps(before,protocol=5)).decode(),
            after_pickle_base64=base64.b64encode(pickle.dumps(after,protocol=5)).decode(),external_owner_change=value.get('late')))
        return dict(errors=errors,store_snapshot_sha256=digest(before),store_after_sha256=digest(after))
    return check


def snapshot_json(value):
    if isinstance(value,(set,frozenset)):return {'fixture_set':sorted(value)}
    raise TypeError('unsupported snapshot metadata: '+type(value).__name__)


def main():
    import pm_goal_deleted_external_oracles as frozen
    collector=tables.COLLECTOR
    if collector is None:raise RuntimeError('Run through pm_goal_guard_sweep.py')
    if not hasattr(frozen,'FIXTURE_CONTEXT'):frozen.main()
    start=len(collector.failures)
    previous_scope=collector.family_scope;collector.family_scope='restore_point.deleted'
    pin=c.load(ROOT/'Plans/restore_point_deleted_contract_fixtures.json')['retained_phase_subject']
    manifest=Path(pin['path']);raw=manifest.read_bytes()
    if hashlib.sha256(raw).hexdigest()!=pin['sha256']:raise ValueError('retained phase manifest pin')
    c.SOURCE_BINDINGS[str(manifest.resolve())]=pin['sha256']
    for row in json.loads(raw)['files']:
        path=Path(row['path']);path=path if path.is_absolute()else manifest.parent/path
        if hashlib.sha256(path.read_bytes()).hexdigest()!=row['sha256']:raise ValueError('retained phase resource pin: '+str(path))
        c.SOURCE_BINDINGS[str(path.resolve())]=row['sha256']
    sys.path.insert(0,str(manifest.parent));sys.dont_write_bytecode=True
    fs=importlib.import_module('fixture_store');rr=importlib.import_module('retained_read')
    # Construct this independently admitted fixture before changing read seams.
    model=fs.FixtureStore('deleted')
    fs.need=rr.need=need
    old=rr.Draft202012Validator
    def schema(document,**kwargs):return frozen.Schema(old(document,**kwargs),Registry())
    rr.Draft202012Validator=schema
    check=evaluator(rr,fs,frozen);base=make_value(model)
    collector.invoke('restore_point.deleted/retained/present',check,base,True)
    for kind in ('missing','ambiguous','another_original','bad_seal','unknown_recipe','foreign_store','override','access'):
        value=copy.deepcopy(base);recipes=value['store']['recipes']
        if kind=='missing':recipes['sealed_receipts']=[]
        elif kind=='ambiguous':recipes['sealed_receipts']*=2
        elif kind=='another_original':recipes['sealed_receipts'][0]['original']['binding']['event_id']+=':foreign'
        elif kind=='bad_seal':recipes['sealed_receipts'][0]['seal']='0'*64
        elif kind=='unknown_recipe':recipes['installed_recipes']=[]
        elif kind=='foreign_store':value['storage']='22222222-2222-4222-8222-222222222222'
        elif kind=='override':value['recipe_override']='caller-selected'
        elif kind=='access':recipes['content_permitted']=False
        collector.invoke('restore_point.deleted/retained/receipt/'+kind,check,value,False)
    for kind in ('missing','ambiguous'):
        value=copy.deepcopy(base)
        if kind=='missing':value['store']['recipes']['installed_native_component_recipes']=[]
        else:value['store']['recipes']['installed_native_component_recipes']*=2
        collector.invoke('restore_point.deleted/retained/native-recipe/'+kind,check,value,False)
    corpus=c.load(ROOT/'Plans/event_number_recipe_corpus.json')
    from pm_event_numbers_corpus import _value
    for case in (x for x in corpus['cases']if x['op']=='uint64'and 'value'in x and 'error'in x):
        value=copy.deepcopy(base);value['store']['model'].rows['terminal_companion']['value']['append_receipt']['sequence_id']=_value(case['value'])
        collector.invoke('restore_point.deleted/retained/shared-uint64/'+case['id'],check,value,False)
    value=copy.deepcopy(base);value['store']['model'].rows['terminal_companion']['value']['append_receipt']['sequence_id']=components.n.current_integer_token('9'*4400)
    collector.invoke('restore_point.deleted/retained/shared-uint64/4400-digits',check,value,False)
    for field,bad in [('registration_current',False),('source_origin_admitted',False),('backup_coherent',False),('migration_supported',False),('permissions_allowed',False),('quarantined',True),('installed_bindings',set())]:
        value=copy.deepcopy(base);setattr(value['store']['model'],field,bad)
        collector.invoke('restore_point.deleted/retained/entry/'+field,check,value,False)
        value=copy.deepcopy(base);value['late']=dict(kind='field',field=field,value=bad)
        collector.invoke('restore_point.deleted/retained/late/'+field,check,value,False)
    for kind in ('point_hold','receipt_missing','receipt_ambiguous'):
        value=copy.deepcopy(base);value['late']=dict(kind=kind)
        collector.invoke('restore_point.deleted/retained/late/'+kind,check,value,False)
    for field in ('project_id','storage_instance_id','restore_point_id','reader_binding'):
        value=copy.deepcopy(base);value['request'][field]+=':foreign'
        collector.invoke('restore_point.deleted/retained/request/'+field,check,value,False)
    candidate_model=copy.deepcopy(model);lease=candidate_model.open_read(candidate_model.request())
    snapshot=candidate_model.resolve_snapshot(lease)
    for label,mutate in [('caller_boolean',lambda s:s.update(already_admitted=True)),('foreign_lease',lambda s:s.update(read_lease_ref='lease:foreign')),('foreign_origin',lambda s:s['store_origin'].update(owner_resolution_ref='caller-issued')),('changed_point',lambda s:s['point']['value'].update(source_branch_id='foreign-branch'))]:
        value=copy.deepcopy(base);value['candidate']=copy.deepcopy(snapshot);mutate(value['candidate'])
        collector.invoke('restore_point.deleted/retained/snapshot/'+label,check,value,False)
    # One snapshot per complete read, including explicitly modeled owner races.
    out=collector.checkpoint_path
    if out:
        out.mkdir(parents=True,exist_ok=True)
        (out/'retained-store-snapshots.json').write_text(json.dumps(SNAPSHOTS,indent=1,default=snapshot_json)+'\n')
    globals()['RETAINED_CONTEXT']=(fs,rr,check,base)
    collector.family_scope=previous_scope
    return int(len(collector.failures)>start)
