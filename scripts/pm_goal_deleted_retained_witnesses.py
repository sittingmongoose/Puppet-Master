"""Pure retained-phase witnesses from an independently admitted Store snapshot.

These predicates validate the retained value/source relation; native admission
and final disclosure fences remain separately exercised by the complete reader.
"""
import copy
import json
import os
from pathlib import Path
import pm_goal_deleted_external_oracles as frozen
import pm_goal_deleted_retained_oracles as reads
import pm_goal_guard_tables as tables
import pm_goal_oracle_common as c

ROOT=Path(__file__).resolve().parents[1]


def main():
    collector=tables.COLLECTOR
    if not hasattr(reads,'RETAINED_CONTEXT'):reads.main()
    start=len(collector.failures)
    previous_scope=collector.family_scope;collector.family_scope='restore_point.deleted'
    fs,rr,complete,base=reads.RETAINED_CONTEXT
    model=copy.deepcopy(base['store']['model']);request=model.request()
    lease=model.open_read(request);snapshot=model.resolve_snapshot(lease)
    source=model.resolve_current_source(lease)
    terminal=snapshot['terminal_companion']['value'];created=snapshot['creation_companion']['value']
    seeds=[]
    def seed(fn,*args):
        label=fn.__code__.co_filename+':'+str(fn.__code__.co_firstlineno)+'/1'
        seeds.append((fn,dict(args=list(copy.deepcopy(args)),kwargs={}),label))
    seed(rr.current_source,snapshot,source)
    seed(rr.check_creation,snapshot)
    seed(rr.check_delete_result,snapshot['terminal_result']['value'],snapshot['terminal_result']['key'],terminal,snapshot['terminal_event'])
    seed(rr.semantic_read,snapshot,source)
    # One function, two different original receipts and chronology intervals.
    for ordinal,(op,event)in enumerate(((created,snapshot['created_event']),(terminal,snapshot['terminal_event'])),1):
        args=[op['append_receipt'],event,op['created_at_utc']if ordinal==1 else op['transitioned_at_utc'],op['committed_at_utc']]
        fn=rr.receipt_stored_join;label=fn.__code__.co_filename+':'+str(fn.__code__.co_firstlineno)+'/'+str(ordinal)
        seeds.append((fn,dict(args=copy.deepcopy(args),kwargs={}),label))
    # Native Store seams use real issued lease state. We never manufacture an
    # admission result merely to reach a later fence.
    def native(value):
        model=value['model'];lease=value['lease']
        try:
            if value['operation']=='snapshot':model.resolve_snapshot(lease)
            elif value['operation']=='source':model.resolve_current_source(lease)
            elif value['operation']=='authenticate':model.authenticate_exact_snapshot(lease,model.resolve_snapshot(lease))
            elif value['operation']=='disclose':model.revalidate_before_disclosure(lease,value['token'])
            else:raise ValueError('unknown native seam')
        except frozen.ExpectedRefusal as e:return e.errors
        return set()
    for operation,label in [('snapshot','actual issued current read lease'),('source','actual current source snapshot')]:
        value=dict(model=copy.deepcopy(model),lease=lease,operation=operation)
        collector.invoke('restore_point.deleted/retained-native/'+operation+'/control',native,value,True)
        value['lease']='lease:never-issued'
        collector.invoke('restore_point.deleted/retained-native/'+operation+'/foreign-lease',native,value,False)
    value=dict(model=copy.deepcopy(model),lease=lease,operation='authenticate')
    collector.invoke('restore_point.deleted/retained-native/authenticate/control',native,value,True)
    value['model'].rows['point']['value_bytes_base64']='AA=='
    collector.invoke('restore_point.deleted/retained-native/authenticate/changed-row-bytes',native,value,False)
    value=copy.deepcopy(base);value['late']=dict(kind='field',field='epoch',value=model.epoch+1,stage='before_disclosure')
    collector.invoke('restore_point.deleted/retained-native/disclose/owner-revision',complete,value,False)
    value=copy.deepcopy(base);value['late']=dict(kind='point_immutable',field='source_branch_id',value='branch:late-corruption',stage='after_read')
    collector.invoke('restore_point.deleted/retained-original/late-immutable-point',complete,value,False)
    value=copy.deepcopy(base);value['late']=dict(kind='field',field='permissions_allowed',value=False,stage='after_read')
    collector.invoke('restore_point.deleted/retained-native/late-permission-before-outer-release',complete,value,False)
    for name,path in [('creation_companion',('created_at_utc',)),('terminal_companion',('preflight','evaluated_at_utc')),('creation_result',('original_command_outcome','observed_at')),('terminal_result',('admitted_at_utc',))]:
        value=copy.deepcopy(base);row=value['store']['model'].rows[name]
        document=copy.deepcopy(row['value']);parent=document
        for key in path[:-1]:parent=parent[key]
        parent[path[-1]]='2026-06-01T00:00:00Z'
        value['store']['model'].rows[name]=fs.packrow(row['key'],document)
        collector.invoke('restore_point.deleted/retained-original/different-'+name,complete,value,False)
    for field,fn in [('creation_result',rr.check_creation),('terminal_result',rr.semantic_read)]:
        changed=copy.deepcopy(snapshot);changed[field]=None
        def missing(value,fn=fn):
            try:fn(*value['args'])
            except frozen.ExpectedRefusal as e:return e.errors
            return set()
        args=[changed]if field=='creation_result'else[changed,source]
        collector.invoke('restore_point.deleted/retained-phase/missing-'+field,missing,dict(args=args),False)
    changed=copy.deepcopy(snapshot);changed['terminal_event']=copy.deepcopy(changed['created_event']);changed['terminal_event_index']=copy.deepcopy(changed['created_event_index'])
    def family(value):
        try:rr.semantic_read(value['snapshot'],value['source'])
        except frozen.ExpectedRefusal as e:return e.errors
        return set()
    collector.invoke('restore_point.deleted/retained-phase/other-terminal-family',family,dict(snapshot=changed,source=source),False)
    from pm_goal_deleted_case_ops import Editor
    for fn,path,mode,expected in [
        (rr.check_delete_result,('args',0,'original_dispatch_custody','original_response','replayed'),'coherent_replay','stored original response is not current replay wrapper'),
        (rr.check_creation,('args',0,'creation_companion','value','command_request','project_id'),'coherent_depth4','complete original creation domain request'),
        (rr.check_creation,('args',0,'created_event','idempotency_key'),'coherent_scalar','creation native identity recipe')]:
        fnbase=next(value for seed_fn,value,label in seeds if seed_fn is fn)
        changed=Editor(fnbase,frozen.helper_hash_functions(5),version=5).edit(path,mode)
        def targeted(value,fn=fn):
            try:fn(*value['args'],**value['kwargs'])
            except frozen.ExpectedRefusal as e:return e.errors
            return set()
        result=collector.invoke('restore_point.deleted/retained-phase/targeted/'+expected,targeted,changed,False)
        if result!={'restore_point.deleted/retained/'+expected}:collector.failures.append(dict(case=expected,expected=expected,actual=sorted(result)))
    for fn,value,label in seeds:
        def evaluate(value,fn=fn):
            try:fn(*value['args'],**value['kwargs'])
            except frozen.ExpectedRefusal as e:return e.errors
            return set()
        collector.invoke('restore_point.deleted/retained-phase/control/'+label,evaluate,value,True)
    manifest=Path(c.load(ROOT/'Plans/restore_point_deleted_contract_fixtures.json')['retained_phase_subject']['path'])
    files=[(Path(row['path'])if Path(row['path']).is_absolute()else manifest.parent/row['path']).resolve()for row in c.load(manifest)['files']]
    bank=ROOT/'tests/fixtures/pnc019_goal_retained_helper_witnesses.json'
    frozen.replay_witnesses(collector,seeds,files,bank_path=bank)
    # Complete owner-schema boundaries observed only in this later phase also
    # get an accepted native input and a root-type first-refusal witness.
    for name,(fn,base,label)in list(frozen.SCHEMA_SEEDS.items()):
        if name in collector.candidates:continue
        def schema(value,fn=fn):
            try:fn(value)
            except frozen.ExpectedRefusal as e:return e.errors
            return set()
        collector.invoke('retained/schema/control/'+name,schema,base['args'][0],True)
        collector.invoke('retained/schema/root-type/'+name,schema,None,False)
    if os.environ.get('PNC019_RETAINED_EXPLORE')=='1':frozen.helper_witnesses(collector,seeds,files)
    collector.family_scope=previous_scope
    return int(len(collector.failures)>start)


def earlier_clause_proof(name,reports):
    from pm_goal_deleted_implications import proof
    return frozen.earlier_clause_proof(name,reports)or proof(name,reports)
