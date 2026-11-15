"""Read-only run.started adoption/retention fixtures on the Goal guard boundary.

Only pure function definitions from the canon-pinned dependency are loaded;
its top-level fixture generators never execute. Native execution is NOT_RUN.
"""
import ast
import base64
import copy
import datetime
import hashlib
import inspect
import os
import pickle
import json
from pathlib import Path
from types import SimpleNamespace
import pm_goal_oracle_common as c
import pm_goal_guard_tables as tables
import pm_event_numbers as numbers
from pm_goal_time import instant

ROOT=Path(__file__).resolve().parents[1]


def run_domain(bundle):
    """SP-265 domain joins after SP-278 separates birth and traversal cursors."""
    e,s,i,cp,q=(bundle[k] for k in ('event','snapshot','index','checkpoint','lookup'))
    p=e['payload'];g=c.Gates()
    def check(ok,label):g.require('run.started/adoption/domain/'+label,ok)
    scope='project~'+base64.urlsafe_b64encode(e['project_id'].encode()).decode().rstrip('=')
    check(e['project_id']==p['project_id']==s['project_id']==i['project_id']==cp['project_id']==q['requested_project_id'],'project_join')
    check(scope==i['scope_partition']==cp['scope_partition'],'scope_encoding')
    check(e['run_id']==p['run_id']==s['run_id']==q['requested_run_id'],'run_lookup_join')
    check(e['thread_id']==s['thread_id']==p.get('thread_id'),'thread_join')
    check(i['event_id']==e['event_id'],'event_identity')
    check(i['sequence_id']==e['sequence_id']==i['source_locator']['sequence_id'],'sequence_join')
    check(cp['first_retained_sequence_id']<=cp['index_through_sequence_id'],'coverage_order')
    # v2 adopted Storage payload recipe, independently qualified JCS for the
    # immutable runtime snapshot and producer semantic preimage.
    check(i['payload_sha256']==hashlib.sha256(numbers.storage_value_bytes(p)).hexdigest(),'source_payload_hash')
    check(i['producer_semantic_digest']==numbers.producer_semantic_digest(e),'producer_semantic_digest')
    check(s['snapshot_sha256']==hashlib.sha256(numbers.qualified_jcs({k:v for k,v in s.items()if k not in ('snapshot_ref','snapshot_sha256')})).hexdigest(),'immutable_snapshot_hash')
    check(p['requested_effective_snapshot_ref']==s['snapshot_ref']==f"requested_effective_runtime.v1:{scope}:{s['snapshot_id']}:{s['snapshot_sha256']}",'immutable_snapshot_ref')
    for k in ('requested_runtime_mode','runtime_mode','requested_mode_overlay','effective_mode_overlay','requested_strategy','strategy','strategy_resolution_reason','requested_platform','effective_platform','requested_model','effective_model','requested_account_id','effective_account_id','requested_persona','effective_persona'):
        check(p[k]==s[k],'snapshot_join_'+k)
    check(q['index_key']==f"event_record_index.v2:{scope}:{e['sequence_id']:020d}:{e['event_id']}",'index_key')
    check(q['checkpoint_key']==f"run_started_index_checkpoint.v1:{cp['storage_instance_id']}:{scope}",'checkpoint_key')
    check(cp['index_checkpoint_ref']==i['publication_locator']['checkpoint_ref'],'global_checkpoint_ref')
    h=lambda x:hashlib.sha256(numbers.qualified_jcs(x)).hexdigest()
    check(e['idempotency_key']=='run-start:'+h([e['project_id'],e['run_id']]),'new_start_key')
    check(e['event_id']=='evt_run_start_'+h([cp['storage_instance_id'],e['project_id'],e['run_id']]),'new_start_id')
    return g.errors


def domain_witnesses(collector,base):
    def payload_hash(b):
        b['index']['payload_sha256']=hashlib.sha256(numbers.storage_value_bytes(b['event']['payload'])).hexdigest()
        b['index']['producer_semantic_digest']=numbers.producer_semantic_digest(b['event'])
    def refs(b):
        ss=b['snapshot'];scope='project~'+base64.urlsafe_b64encode(b['event']['project_id'].encode()).decode().rstrip('=')
        ss['snapshot_ref']=f"requested_effective_runtime.v1:{scope}:{ss['snapshot_id']}:{ss['snapshot_sha256']}"
        b['event']['payload']['requested_effective_snapshot_ref']=ss['snapshot_ref'];payload_hash(b)
    def snapshot_hash(b):
        ss=b['snapshot'];ss['snapshot_sha256']=hashlib.sha256(numbers.qualified_jcs({k:v for k,v in ss.items()if k not in ('snapshot_ref','snapshot_sha256')})).hexdigest();refs(b)
    def emit(label,fn):
        value=copy.deepcopy(base);fn(value)
        result=collector.invoke('run.started/adoption/single-defect/'+label,run_domain,value,False)
        expected={'run.started/adoption/domain/'+label}
        if result!=expected:collector.failures.append(dict(case=label,expected=sorted(expected),actual=sorted(result)))
    collector.invoke('run.started/adoption/domain/control',run_domain,base,True)
    for label,root,key in [('project_join','lookup','requested_project_id'),('scope_encoding','index','scope_partition'),('run_lookup_join','lookup','requested_run_id'),('event_identity','index','event_id'),('source_payload_hash','index','payload_sha256'),('producer_semantic_digest','index','producer_semantic_digest'),('index_key','lookup','index_key'),('checkpoint_key','lookup','checkpoint_key'),('global_checkpoint_ref','checkpoint','index_checkpoint_ref')]:
        emit(label,lambda b,r=root,k=key:b[r].__setitem__(k,b[r][k][:-1]+('1'if b[r][k][-1:]!='1'else'2')))
    def thread(b):b['snapshot']['thread_id']='other-thread';snapshot_hash(b)
    emit('thread_join',thread)
    emit('sequence_join',lambda b:b['index']['source_locator'].__setitem__('sequence_id',b['event']['sequence_id']+1))
    emit('coverage_order',lambda b:b['checkpoint'].__setitem__('first_retained_sequence_id',b['checkpoint']['index_through_sequence_id']+1))
    def bad_hash(b):b['snapshot']['snapshot_sha256']='0'*64;refs(b)
    emit('immutable_snapshot_hash',bad_hash)
    def bad_ref(b):b['snapshot']['snapshot_ref']=b['snapshot']['snapshot_ref'][:-64]+'0'*64;b['event']['payload']['requested_effective_snapshot_ref']=b['snapshot']['snapshot_ref'];payload_hash(b)
    emit('immutable_snapshot_ref',bad_ref)
    fields=('requested_runtime_mode','runtime_mode','requested_mode_overlay','effective_mode_overlay','requested_strategy','strategy','strategy_resolution_reason','requested_platform','effective_platform','requested_model','effective_model','requested_account_id','effective_account_id','requested_persona','effective_persona')
    specs=c.load(ROOT/'Plans/requested_effective_runtime.schema.json')['properties']
    for field in fields:
        spec=specs[field];old=base['snapshot'][field]
        choices=spec.get('enum')or next((x['enum']for x in spec.get('anyOf',[])if 'enum'in x),None)
        replacement=next((x for x in choices if x!=old),None)if choices else 'other'
        def change(b,k=field,v=replacement):b['snapshot'][k]=v;snapshot_hash(b)
        emit('snapshot_join_'+field,change)
    def start_key(b):b['event']['idempotency_key']+=':other';payload_hash(b)
    emit('new_start_key',start_key)
    def start_id(b):
        e=b['event'];e['event_id']+=':other';b['index']['event_id']=e['event_id'];scope=b['index']['scope_partition'];b['lookup']['index_key']=f"event_record_index.v2:{scope}:{e['sequence_id']:020d}:{e['event_id']}"
    emit('new_start_id',start_id)


def main():
    import pm_goal_deleted_external_oracles as frozen
    collector=tables.COLLECTOR
    if collector is None:raise RuntimeError('Run with pm_goal_guard_sweep.py')
    if not hasattr(frozen,'FIXTURE_CONTEXT'):frozen.main()
    dep,subject,seeds=frozen.FIXTURE_CONTEXT
    start=len(collector.failures)
    pin=c.load(ROOT/'Plans/restore_point_deleted_contract_fixtures.json')['frozen_joined_subject']
    directory=Path(pin['path']).parent
    source=directory/'check-sources/adoption_v4_check.py'
    manifest=c.load(Path(pin['path']))
    row=next(r for r in manifest['files']if Path(r['path']).name==source.name)
    if hashlib.sha256(source.read_bytes()).hexdigest()!=row['sha256']:raise ValueError('adoption source pin')
    # The adapter's imported dependency namespaces already retain their exact
    # frozen resources, schema keywords, qualified numeric/date-time helpers.
    ns={**vars(dep),**dep.AD}
    from pm_goal_complete_oracles import resources
    registry=resources({ROOT/'Plans/event_index_consumer_adoption.schema.json',ROOT/'Plans/event_record.schema.json',ROOT/'Plans/requested_effective_runtime.schema.json',ROOT/'Plans/event_payload_run_started.schema.json'})
    def validator(schema,**kwargs):
        return c.StrictValidator(c.runtime_schema(schema),registry=registry,format_checker=c.FORMATS)
    def require_domain(value):
        errors=run_domain(value)
        if errors:raise frozen.ExpectedRefusal(errors)
    ns.update(require_domain=require_domain,successor=c.load(ROOT/'Plans/event_index_consumer_adoption.schema.json')['$defs'],
        contracts=c.load(ROOT/'Plans/event_record_index_checkpoint.schema.json'),
        Draft202012Validator=validator,FormatChecker=lambda:c.FORMATS,
        PL=ROOT/'Plans',ns=dep.G,cns=dep.C,created_domain=dep.created_domain,
        run_domain=run_domain,expect=frozen.expect,
        datetime=SimpleNamespace(datetime=SimpleNamespace(fromisoformat=instant),timedelta=datetime.timedelta))
    ns['runvals']={k:validator(v)for k,v in {
        'event':c.load(ROOT/'Plans/event_record.schema.json'),
        'snapshot':c.load(ROOT/'Plans/requested_effective_runtime.schema.json'),
        'checkpoint':ns['successor']['run_started_checkpoint_v2'],
        'index':dep.G['iv'].original.schema if hasattr(dep.G['iv'],'original')else dep.G['iv'].schema}.items()}
    names={'current','selection','token','token_check','cursor','birth_binding','shape','checkpoint_core','check_created_generation_admission','parse_time','run_core','run_retired_entry','check_run_history_shape','check_run_generation_admission','run_retention_eligible','cleanup_run_history','can_reserve_run_successor','validate'}
    tree=ast.parse(source.read_text())
    class DomainBoundary(ast.NodeTransformer):
        def visit_Expr(self,node):
            call=node.value
            if isinstance(call,ast.Call) and isinstance(call.func,ast.Name) and call.func.id=='expect' and len(call.args)>1 and isinstance(call.args[1],ast.BinOp) and 'run immutable snapshot/domain join' in ast.unparse(call.args[1]):
                return ast.copy_location(ast.Expr(value=ast.Call(func=ast.Name(id='require_domain',ctx=ast.Load()),args=[ast.Name(id='run',ctx=ast.Load())],keywords=[])),node)
            return self.generic_visit(node)
    tree=ast.fix_missing_locations(DomainBoundary().visit(tree))
    nodes=[n for n in tree.body if isinstance(n,ast.FunctionDef)and n.name in names]
    exec(compile(ast.Module(body=nodes,type_ignores=[]),str(source),'exec'),ns)
    ns['parse_time']=instant
    # The original aggregate domain predicate returns labels. Its rows above
    # also run as complete boundaries, so failures retain stable identities.
    helper_seeds=[];seed_counts={};seen=set();capturing=[True]
    for key,fn in list(ns.items()):
        if not inspect.isfunction(fn)or fn.__code__.co_filename!=str(source)or 'expect'not in fn.__code__.co_names:continue
        label=str(source)+':'+str(fn.__code__.co_firstlineno)
        def wrapper(*args,__fn=fn,__label=label,**kwargs):
            result=__fn(*args,**kwargs)
            if capturing[0]and seed_counts.get(__label,0)<8:
                value=dict(args=list(args),kwargs=kwargs);fingerprint=hashlib.sha256(pickle.dumps((__label,value),protocol=5)).hexdigest()
                if fingerprint not in seen:
                    seen.add(fingerprint);seed_counts[__label]=seed_counts.get(__label,0)+1
                    helper_seeds.append((__fn,copy.deepcopy(value),__label+'/'+str(seed_counts[__label])))
            return result
        ns[key]=wrapper
    def evaluate(value):
        try:ns['validate'](value)
        except frozen.ExpectedRefusal as e:return e.errors
        return set()
    packet=c.load(ROOT/'Plans/event_index_consumer_adoption_fixtures.json')
    for label,value in packet['positive'].items():
        collector.invoke('run.started/adoption/'+label,evaluate,value,True)
    for case in packet['negative']:
        collector.invoke('run.started/adoption/'+case['case_id'],evaluate,case['value'],False)
    capturing[0]=False
    domain_witnesses(collector,packet['positive']['both_full_owner_joins']['run_started'])
    def shape(value):
        try:ns['shape'](value)
        except frozen.ExpectedRefusal as e:return e.errors
        return set()
    base=packet['positive']['both_full_owner_joins']
    collector.invoke('run.started/adoption/shapes/control',shape,base,True)
    paths=[('successor_handoff','run_generation_admission'),('successor_handoff','created_generation_admission'),('original_creation_publication',),('original_creation_commit_transaction',)]+[('run_started',k)for k in ns['runvals']]+[('run_started','event','payload')]+[('restore_created',k)for k in ('event','index','checkpoint','record','companion')]+[('restore_created','event','payload'),('generic','checkpoint')]
    for path in paths:
        value=copy.deepcopy(base);parent=value
        for key in path[:-1]:parent=parent[key]
        parent[path[-1]]=None
        collector.invoke('run.started/adoption/shapes/root-type/'+str(path),shape,value,False)
    retention=c.load(ROOT/'Plans/run_started_checkpoint_retention_fixtures.json')
    def eligible(value):
        try:
            result=ns['run_retention_eligible'](value['root'],value['selection'])
            g=c.Gates();g.require('run.started/retention/eligible',result)
            return g.errors
        except frozen.ExpectedRefusal as e:return e.errors
    for case in retention['cases']:
        collector.invoke('run.started/retention/'+case['case_id'],eligible,
                         {k:case[k]for k in ('root','selection')},case['expected_eligible'])
    # Exercise the four authored retention claims as complete proposed-state
    # boundaries. The old helper's copy-preservation assertion is a harness
    # postcondition; the independent before/after checks below are product rows.
    root=retention['cases'][0]['root'];decision=retention['cases'][0]['selection']
    def reservation(value):
        g=c.Gates()
        g.require('run.started/retention/reservation_root_schema',ns['runvals']['checkpoint'].is_valid(value))
        if not g.errors:g.require('run.started/retention/reservation_capacity',ns['can_reserve_run_successor'](value))
        return g.errors
    def cleanup(value):
        before,after,selection=(value[k]for k in ('before','after','selection'))
        try:
            permitted=ns['run_retention_eligible'](before,selection)
        except frozen.ExpectedRefusal as e:return e.errors
        g=c.Gates();g.require('run.started/retention/cleanup_eligible',permitted)
        if g.errors:return g.errors
        selected=selection['selected_retired_publication_id']
        g.require('run.started/retention/cleanup_current_core',c.same_json_value(
            {k:v for k,v in before.items()if k!='retired_generations'},
            {k:v for k,v in after.items()if k!='retired_generations'}))
        g.require('run.started/retention/cleanup_exact_survivors',
            [x['publication_id']for x in after['retired_generations']]==
            [x['publication_id']for x in before['retired_generations']if x['publication_id']!=selected])
        if not g.errors:
            g.require('run.started/retention/cleanup_sibling_bytes',
                ns['mp'](after['retired_generations'])==ns['mp']([x for x in before['retired_generations']if x['publication_id']!=selected]))
        return g.errors
    cleaned=copy.deepcopy(root);cleaned['retired_generations']=[x for x in cleaned['retired_generations']if x['publication_id']!=decision['selected_retired_publication_id']]
    collector.invoke('run.started/retention/three-full-slots',reservation,root,False)
    collector.invoke('run.started/retention/cleanup-then-reserve',reservation,cleaned,True)
    fourth=copy.deepcopy(root);fourth['retired_generations'].append(copy.deepcopy(root['retired_generations'][0]))
    collector.invoke('run.started/retention/fourth-generation-schema',reservation,fourth,False)
    proposed=dict(before=root,after=cleaned,selection=decision)
    collector.invoke('run.started/retention/cleanup/control',cleanup,proposed,True)
    for label in ('cleanup_current_core','cleanup_exact_survivors','cleanup_sibling_bytes','cleanup_eligible'):
        value=copy.deepcopy(proposed)
        if label=='cleanup_current_core':value['after']['updated_at_utc']='2026-09-12T20:06:00Z'
        elif label=='cleanup_exact_survivors':value['after']['retired_generations']=[]
        elif label=='cleanup_sibling_bytes':value['after']['retired_generations'][0]['hold_refs']=['actual-different-sibling']
        else:value['selection']['evaluated_at_utc']='2026-09-11T20:00:00Z'
        result=collector.invoke('run.started/retention/cleanup/'+label,cleanup,value,False)
        if result!={'run.started/retention/'+label}:collector.failures.append(dict(case=label,actual=sorted(result)))
    files=[(Path(r['path'])if Path(r['path']).is_absolute()else directory/r['path']).resolve()for r in manifest['files']]
    bank_path=ROOT/'tests/fixtures/pnc019_goal_adoption_helper_witnesses.json'
    if bank_path.exists():
        bank=c.load(bank_path);available={json.dumps(frozen.seed_ref(fn,label,files),sort_keys=True):(fn,base,label)for fn,base,label in helper_seeds};editors={}
        for number,case in enumerate(bank['cases']):
            key=json.dumps(case['seed'],sort_keys=True)
            if key not in available:
                collector.failures.append(dict(case='adoption-bank/'+str(number),kind='seed_missing'));continue
            fn,base,label=available[key]
            def check(value,fn=fn):
                try:fn(*value['args'],**value['kwargs'])
                except frozen.ExpectedRefusal as refusal:return refusal.errors
                return set()
            collector.invoke('adoption-bank/control/'+str(number),check,base,True)
            from pm_goal_deleted_case_ops import Editor
            version=case.get('hash_recipe_version',2)
            editor_key=(key,version)
            if editor_key not in editors:editors[editor_key]=Editor(base,frozen.helper_hash_functions(version),version=version)
            value=editors[editor_key].edit(tuple(case['path']),case['operation'])
            if (__import__('pm_goal_guard_sweep').digest(value)if case.get('input_digest')=='frozen_function_context_v1'else hashlib.sha256(pickle.dumps(value,protocol=5)).hexdigest())!=case['input_sha256']:
                collector.failures.append(dict(case='adoption-bank/'+str(number),kind='input_sha256'));continue
            result=collector.invoke('adoption-bank/single-defect/'+str(number),check,value,False)
            if set(result)!={case['expected_refusal']}:
                collector.failures.append(dict(case='adoption-bank/'+str(number),kind='refusal',expected=case['expected_refusal'],actual=sorted(result)))
    if os.environ.get('PNC019_ADOPTION_EXPLORE')=='1':
        frozen.helper_witnesses(collector,helper_seeds,files)
    globals()['ADOPTION_CONTEXT']=(ns,evaluate,eligible)
    return int(len(collector.failures)>start)
