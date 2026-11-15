"""Executable authored boundaries for goal.created, restore_point.deleted, run.started.

Owner resources and every schema keyword stay intact. Native execution is NOT_RUN.
The run-start joins use separate envelope, payload, snapshot, index and checkpoint
copies; hashes are recomputed from the owner's real preimages.
"""
import base64
import copy
import hashlib
import json
from pathlib import Path
from urllib.parse import urldefrag
import pm_goal_oracle_common as c
import pm_goal_guard_tables as tables
import pm_event_numbers as n

ROOT = Path(__file__).resolve().parents[1]


def resources(paths):
    """Resolve the closed transitive schema graph; never fetch a URL."""
    available = {}
    aliases = {}
    for path in list((ROOT/'Plans').glob('*.schema.json')) + list((ROOT/'Plans/event_payloads/goal_runtime').glob('*.schema.json')):
        document = c.load(path)
        file_uri = 'https://puppetmaster.local/'+path.relative_to(ROOT).as_posix()
        available[file_uri] = path
        aliases[file_uri] = path
        if '$id' in document:
            available[document['$id']] = path
            if path.parent.name == 'goal_runtime' and ':' not in document['$id']:
                uri = 'https://puppetmaster.local/schemas/event_payloads/goal_runtime/'+document['$id']
                available[uri] = path
                aliases[uri] = path
        available[path.name] = path
    selected = set(paths)
    done = set()
    def refs(value):
        if isinstance(value, dict):
            if '$ref' in value:
                yield urldefrag(value['$ref'])[0]
            for child in value.values():
                yield from refs(child)
        elif isinstance(value, list):
            for child in value:
                yield from refs(child)
    while selected != done:
        for path in tuple(selected-done):
            for uri in refs(c.load(path)):
                if uri:
                    selected.add(available[uri])
            done.add(path)
    return c.schema_registry(sorted(selected), aliases={k:v for k,v in aliases.items() if v in selected})


def schema_checker(path, pointer, registry, *, payload=None):
    schema = c.load(path)
    v = c.validator({'$ref':schema['$id']+pointer}, registry, current=True)
    payload_schema = c.load(payload) if payload is not None else None
    pv = c.validator(payload_schema,registry,current=True) if payload_schema is not None else None
    def check(value):
        gates = c.Gates()
        gates.require('complete/owner_schema/'+str(path.relative_to(ROOT))+pointer,v.is_valid(value))
        if not gates.errors and pv is not None:
            gates.require('run.started/selected_payload_schema',value['payload_schema_id']==payload_schema['$id'])
            gates.require('complete/owner_schema/'+str(payload.relative_to(ROOT)),pv.is_valid(value['payload']))
        return gates.errors
    return check


def run_joins(bundle):
    g = c.Gates()
    ev, snapshot, index, checkpoint, lookup = (bundle[k] for k in ('event','snapshot','index','checkpoint','lookup'))
    payload = ev['payload']
    for key in ('project_id', 'run_id'):
        g.require('run.started/lookup/'+key, lookup['requested_'+key] == ev[key])
        g.require('run.started/payload/'+key, payload[key] == ev[key])
        g.require('run.started/snapshot/'+key, snapshot[key] == ev[key])
    for key in ('requested_runtime_mode','runtime_mode','requested_mode_overlay','effective_mode_overlay',
                'requested_strategy','strategy','strategy_resolution_reason','requested_platform','effective_platform',
                'requested_model','effective_model','requested_account_id','effective_account_id',
                'requested_persona','effective_persona'):
        g.require('run.started/runtime/'+key, snapshot[key] == payload[key])
    digest = hashlib.sha256(n.qualified_jcs({k:v for k,v in snapshot.items()
                                           if k not in ('snapshot_sha256','snapshot_ref')})).hexdigest()
    g.require('run.started/snapshot_digest', snapshot['snapshot_sha256'] == digest)
    part = 'project~'+base64.urlsafe_b64encode(ev['project_id'].encode()).decode().rstrip('=')
    ref = 'requested_effective_runtime.v1:'+part+':'+snapshot['snapshot_id']+':'+digest
    g.require('run.started/snapshot_ref', snapshot['snapshot_ref'] == ref)
    g.require('run.started/payload_snapshot_ref', payload['requested_effective_snapshot_ref'] == snapshot['snapshot_ref'])
    for key in ('event_id','sequence_id','event_type','project_id','idempotency_key','correlation_id',
                'causation_event_id','persisted_at_utc','redaction_profile'):
        g.require('run.started/index/'+key, c.same_json_value(index[key],ev[key]))
    g.require('run.started/index_payload_digest', index['payload_sha256'] == hashlib.sha256(n.qualified_jcs(payload)).hexdigest())
    g.require('run.started/index_producer_digest', index['producer_semantic_digest'] == n.producer_semantic_digest(ev))
    g.require('run.started/checkpoint_scope', checkpoint['project_id'] == ev['project_id'] and checkpoint['scope_partition'] == part)
    g.require('run.started/index_partition', index['scope_partition'] == part)
    for key in ('segment_generation','segment_name','byte_offset'):
        g.require('run.started/source_cursor/'+key, checkpoint['source_cursor'][key] == index['source_locator'][key])
    g.require('run.started/source_cursor/sequence_id',checkpoint['source_cursor']['last_sequence_id'] == index['sequence_id'])
    for key in ('manifest_generation','recovery_epoch','survivor_prefix_sha256'):
        g.require('run.started/publication/'+key,checkpoint['source_cursor'][key] == index['publication_locator'][key])
    g.require('run.started/full_index_checkpoint',checkpoint['index_checkpoint_ref'] == index['publication_locator']['checkpoint_ref'])
    g.require('run.started/coverage',checkpoint['first_retained_sequence_id'] <= ev['sequence_id'] <= checkpoint['index_through_sequence_id'])
    g.require('run.started/index_key', lookup['index_key'] == f'event_record_index.v2:{part}:{ev["sequence_id"]:020d}:{ev["event_id"]}')
    g.require('run.started/checkpoint_key', lookup['checkpoint_key'] == 'run_started_index_checkpoint.v1:'+checkpoint['storage_instance_id']+':'+part)
    return g.errors


def extra_joins(collector, base):
    """One changed owner copy; derived hashes/keys are kept coherent."""
    def payload_hash(b):
        b['index']['payload_sha256']=hashlib.sha256(n.qualified_jcs(b['event']['payload'])).hexdigest()
        b['index']['producer_semantic_digest']=n.producer_semantic_digest(b['event'])
    def snapshot_hash(b):
        s=b['snapshot'];s['snapshot_sha256']=hashlib.sha256(n.qualified_jcs({k:v for k,v in s.items() if k not in ('snapshot_sha256','snapshot_ref')})).hexdigest()
        part='project~'+base64.urlsafe_b64encode(b['event']['project_id'].encode()).decode().rstrip('=')
        s['snapshot_ref']='requested_effective_runtime.v1:'+part+':'+s['snapshot_id']+':'+s['snapshot_sha256']
        b['event']['payload']['requested_effective_snapshot_ref']=s['snapshot_ref'];payload_hash(b)
    def emit(name, mutate):
        value=copy.deepcopy(base);mutate(value)
        result=collector.invoke('run.started/single-defect/'+name,run_joins,value,False)
        if set(result)!={'run.started/'+name}:
            collector.failures.append(dict(case='run.started/single-defect/'+name,expected='run.started/'+name,actual=sorted(result)))
    for field in ('project_id','run_id'):
        emit('lookup/'+field,lambda b,f=field:b['lookup'].__setitem__('requested_'+f,b['lookup']['requested_'+f]+':other'))
        def payload(b,f=field):
            b['event']['payload'][f]+=':other';payload_hash(b)
        emit('payload/'+field,payload)
        def snapshot(b,f=field):
            b['snapshot'][f]+=':other';snapshot_hash(b)
        emit('snapshot/'+field,snapshot)
    schema=c.load(ROOT/'Plans/event_payload_run_started.schema.json')
    fields=('requested_runtime_mode','runtime_mode','requested_mode_overlay','effective_mode_overlay','requested_strategy','strategy','strategy_resolution_reason','requested_platform','effective_platform','requested_model','effective_model','requested_account_id','effective_account_id','requested_persona','effective_persona')
    for field in fields:
        spec=schema['properties'][field];old=base['event']['payload'][field]
        enum=spec.get('enum') or next((x['enum'] for x in spec.get('anyOf',[]) if 'enum'in x),None)
        value=next((x for x in enum if x!=old),None) if enum else ('fixture/other' if 'model'in field else 'fixture-other')
        def change(b,f=field,v=value):
            b['event']['payload'][f]=v;payload_hash(b)
        emit('runtime/'+field,change)
    emit('snapshot_digest',lambda b:b['snapshot'].__setitem__('snapshot_sha256','0'*64))
    def ref(b):
        b['snapshot']['snapshot_ref']=b['snapshot']['snapshot_ref'][:-64]+'0'*64
        b['event']['payload']['requested_effective_snapshot_ref']=b['snapshot']['snapshot_ref'];payload_hash(b)
    emit('snapshot_ref',ref)
    def payload_ref(b):
        b['event']['payload']['requested_effective_snapshot_ref']=b['snapshot']['snapshot_ref'][:-64]+'0'*64;payload_hash(b)
    emit('payload_snapshot_ref',payload_ref)
    for field in ('event_id','event_type','project_id','idempotency_key','correlation_id','causation_event_id','persisted_at_utc','redaction_profile'):
        value='2026-11-14T12:00:00Z' if field=='persisted_at_utc' else 'fixture-other'
        emit('index/'+field,lambda b,f=field,v=value:b['index'].__setitem__(f,v))
    def sequence(b):
        b['event']['sequence_id']-=1
        e=b['event'];part='project~'+base64.urlsafe_b64encode(e['project_id'].encode()).decode().rstrip('=')
        b['lookup']['index_key']=f'event_record_index.v2:{part}:{e["sequence_id"]:020d}:{e["event_id"]}'
    emit('index/sequence_id',sequence)
    emit('index_payload_digest',lambda b:b['index'].__setitem__('payload_sha256','0'*64))
    emit('index_producer_digest',lambda b:b['index'].__setitem__('producer_semantic_digest','0'*64))
    for key in ('project_id','scope_partition'):
        emit('checkpoint_scope',lambda b,k=key:b['checkpoint'].__setitem__(k,b['checkpoint'][k]+':other'))
    emit('index_partition',lambda b:b['index'].__setitem__('scope_partition',b['index']['scope_partition']+':other'))
    for field in ('segment_generation','segment_name','byte_offset'):
        def cursor(b,f=field):
            old=b['checkpoint']['source_cursor'][f];b['checkpoint']['source_cursor'][f]=old+1 if type(old)is int else old+':other'
        emit('source_cursor/'+field,cursor)
    emit('source_cursor/sequence_id',lambda b:b['checkpoint']['source_cursor'].__setitem__('last_sequence_id',b['checkpoint']['source_cursor']['last_sequence_id']+1))
    for field in ('manifest_generation','recovery_epoch','survivor_prefix_sha256'):
        def publication(b,f=field):
            old=b['checkpoint']['source_cursor'][f];b['checkpoint']['source_cursor'][f]=old+1 if type(old)is int else '0'*64
        emit('publication/'+field,publication)
    emit('full_index_checkpoint',lambda b:b['checkpoint'].__setitem__('index_checkpoint_ref','fixture-other'))
    emit('coverage',lambda b:b['checkpoint'].__setitem__('first_retained_sequence_id',b['event']['sequence_id']+1))
    emit('index_key',lambda b:b['lookup'].__setitem__('index_key',b['lookup']['index_key']+':other'))
    emit('checkpoint_key',lambda b:b['lookup'].__setitem__('checkpoint_key',b['lookup']['checkpoint_key']+':other'))


def main():
    collector = tables.COLLECTOR
    if collector is None:
        raise RuntimeError('Run through pm_goal_guard_sweep.py --source pm_goal_complete_oracles')
    start = len(collector.failures)
    goal = c.load(ROOT/'Plans/goal_start_command_contract_fixtures.json')
    restore = c.load(ROOT/'Plans/restore_point_deleted_contract_fixtures.json')
    run = c.load(ROOT/'Plans/run_started_consumer_contract_fixtures.json')
    paths = {ROOT/x['schema_ref'].split('#')[0] for x in goal['cases']}
    paths.add(ROOT/'Plans/restore_point_deleted_contracts.schema.json')
    paths.update(ROOT/'Plans'/p for p in ('event_record.schema.json','requested_effective_runtime.schema.json',
                                        'run_started_consumer_contracts.schema.json','event_payload_run_started.schema.json'))
    registry = resources(paths)
    checks = {}
    for case in goal['cases']:
        path, _, pointer = case['schema_ref'].partition('#')
        key = (path, pointer)
        checks.setdefault(key, schema_checker(ROOT/path, '#'+pointer, registry))
        collector.invoke('goal.created/'+case['id'], checks[key], case['value'], case['expected']=='valid')
    check = lambda definition: schema_checker(ROOT/'Plans/restore_point_deleted_contracts.schema.json', '#/$defs/'+definition, registry)
    for case in restore['value_shape_cases']:
        collector.invoke('restore_point.deleted/'+case['id'], check(case['definition']), case['value'], case['valid'])
    target = {
        'event': ('event_record.schema.json', '#'),
        'snapshot': ('requested_effective_runtime.schema.json', '#'),
        'checkpoint': ('run_started_consumer_contracts.schema.json', '#/$defs/checkpoint'),
    }
    for case in run['schema_cases']:
        if case['target'] == 'index':
            schema = next(row['value_schema'] for row in c.load(ROOT/'Plans/storage_value_registry.json')['families']
                          if row['family_id']=='event_record_index')
            v = c.validator(schema, registry)
            def index(value, v=v):
                gate = c.Gates()
                gate.require('complete/owner_schema/Plans/storage_value_registry.json#/families/event_record_index/value_schema',v.is_valid(value))
                return gate.errors
            evaluate = index
        else:
            path,pointer = target[case['target']]
            evaluate = schema_checker(ROOT/'Plans'/path,pointer,registry,
                payload=ROOT/'Plans/event_payload_run_started.schema.json' if case['target']=='event' else None)
        collector.invoke('run.started/'+case['case_id'], evaluate, case['value'],case['expect_valid'])
    for case in run['static_join_cases']:
        collector.invoke('run.started/'+case['case_id'],run_joins,case['bundle'],case['expect_valid'])
    extra_joins(collector,run['base'])
    foreign=copy.deepcopy(run['base']['event'])
    foreign['payload_schema_id']='https://puppetmaster.local/schemas/event_payloads/run_started/foreign'
    selected=schema_checker(ROOT/'Plans/event_record.schema.json','#',registry,payload=ROOT/'Plans/event_payload_run_started.schema.json')
    collector.invoke('run.started/single-defect/selected_payload_schema',selected,foreign,False)
    for key,evaluate in checks.items():
        collector.invoke('goal.created/schema-root-type/'+str(key),evaluate,None,False)
    return int(len(collector.failures)>start)
