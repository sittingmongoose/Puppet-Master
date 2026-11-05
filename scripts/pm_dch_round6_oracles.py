#!/usr/bin/env python3
"""Round-six DCH context, integer-domain and retained-start witnesses.

Malformed contexts have coherent dependent identities and source commitments.
Encoding-crash controls assert a structured refusal separately from primitive
schema/type witnesses, so unencodable input is never a guard-flipping shortcut.
"""
import copy
from dataclasses import dataclass
import hashlib
import json
import msgpack
from pathlib import Path
from jsonschema import Draft202012Validator
from pm_dch_formats import FormatChecker
from pm_dch_round5_oracles import checkpoint_source, reference_storage, evaluate as evaluate5

ROOT = Path(__file__).resolve().parents[1]
MAX = (1 << 53) - 1

def commitment(m, record):
    # Independently construct exact bytes for an intentionally inadmissible
    # retained input. The production encoder must refuse these numeric values.
    def ordered(v):
        if type(v) is dict:return {k:ordered(v[k]) for k in sorted(v,key=lambda k:k.encode('utf-8'))}
        if type(v) is list:return [ordered(x) for x in v]
        return v
    return hashlib.sha256(msgpack.packb(ordered(record),use_bin_type=True,strict_types=True)).hexdigest()

@dataclass
class Case:
    name: str
    surface: str
    args: tuple
    expected: object = False

def replaced(value, path, replacement):
    result = copy.deepcopy(value); target = result
    for key in path[:-1]: target = target[key]
    target[path[-1]] = copy.deepcopy(replacement)
    return result

def integer_paths(value, path=()):
    if type(value) is int: yield path, value
    elif type(value) is dict:
        for k, v in value.items(): yield from integer_paths(v, path+(k,))
    elif type(value) is list:
        for k, v in enumerate(value): yield from integer_paths(v, path+(k,))

def cases(m, Case=Case):
    rows = json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']
    if getattr(m, 'SELECTED_FAMILY', None): rows = [r for r in rows if r['event_type'] == m.SELECTED_FAMILY]
    fs = json.loads((ROOT/'Plans/dch_event_contract_fixtures.json').read_text())
    cs = json.loads((ROOT/'Plans/dch_checkpoint_fixtures.json').read_text())
    out = []
    def add(name, surface, *args, expected=False):
        out.append(Case(name, surface, tuple(copy.deepcopy(args)), expected))
    wrong_stores = [None, False, True, 0, 1, [], {}, {'nested':'object'}, '', 'x'*513,
                    'not-a-uuid', '00000000000040008000000000000001', m.STORAGE_INSTANCE+'\n']
    for row in rows:
        event = row['event_type']; c = next(c for c in cs if c['event_type'] == event)
        schema = json.loads((ROOT/c['schema_ref'].split('#')[0]).read_text())
        payload_schema = json.loads((ROOT/row['payload_schema_ref']).read_text())
        for f in [f for f in fs if f['event_type'] == event]:
            prefix = event+'/'+f['edition']+'/round6/'
            for n, store in enumerate(wrong_stores):
                record = copy.deepcopy(f['record']); witness = copy.deepcopy(f['historical_source'])
                record['event_id'] = m.identity(event, f['valid'], store)
                record['idempotency_key'] = m.idempotency_key(event, f['valid'], store)
                witness.update(storage_instance_id=store, source_value_sha256=commitment(m, record))
                add(prefix+'storage_descriptor/'+str(n), 'history', record, row, witness, payload_schema)
            # Type/range witnesses have one fact; physical/read/retry refusals
            # below exercise the actual public paths and explicitly forbid exceptions.
            for n in [-MAX, MAX]:
                add(prefix+'integer_endpoint/'+str(n), 'types', {'exit_code': n}, expected=True)
            for n in [-MAX-1, MAX+1, (1<<64)-1, 1<<64, 1<<100]:
                add(prefix+'integer_domain/'+str(n), 'types', {'exit_code': n})
                add(prefix+'encoder_domain/'+str(n), 'encoder_refusal', n, expected=True)
            for n in [-MAX-1, MAX+1]:
                add(prefix+'encoder_bound/'+str(n), 'encoding', n)
            for field in ['producer_sequence_id','sequence_id']:
                for n in [MAX, MAX+1, (1<<64)-1, 1<<64, 1<<100]:
                    record = copy.deepcopy(f['record']); record[field] = n
                    add(prefix+'envelope_integer/'+field+'/'+str(n), 'payload',
                        json.loads((ROOT/'Plans/event_record.schema.json').read_text()), record, expected=n==MAX)
                    add(prefix+'writer_integer/'+field+'/'+str(n), 'acceptance_result', 'joins', (record,event), n==MAX, expected=True)
                    add(prefix+'retry_integer/'+field+'/'+str(n), 'retry_result', record, record,
                        'original_result' if n==MAX else 'invalid_input_type', expected=True)
                    if n < 1<<64:
                        # This is a current-recipe write observation, not the independently
                        # receipted earlier original with the same semantic body.
                        record = {**record, 'observed_at_utc':'2026-11-04T00:00:08Z'}
                        witness = copy.deepcopy(f['historical_source']); witness['source_value_sha256'] = commitment(m, record)
                        add(prefix+'history_integer/'+field+'/'+str(n), 'acceptance_result', 'history',
                            (record,row,witness,payload_schema), n==MAX, expected=True)
            # Both terminal families retain the exact original source in either
            # Store/transport/policy combination; current live state is irrelevant.
            if 'test_source' in f:
                for n in [-MAX, MAX]:
                    if 'exit_code' not in f['valid']:continue
                    payload=copy.deepcopy(f['valid']);source=copy.deepcopy(f['test_source'])
                    payload['exit_code']=source['outcome']['exit_code']=n
                    add(prefix+'signed_exit_boundary/'+str(n),'test',payload,source,event,payload_schema,expected=True)
                start_row = next(r for r in json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']
                                 if r['event_type']=='chat.thread_worktree_pre_merge_test_started')
                start_fixture = next(g for g in fs if g['event_type']==start_row['event_type'] and g['edition']==f['edition'])
                start_checkpoint = next(g for g in cs if g['event_type']==start_row['event_type'])
                for store in [m.STORAGE_INSTANCE, '00000000-0000-4000-8000-000000000002']:
                    for reference in [False, True]:
                        for compatibility in [False, True]:
                            _, src, _ = checkpoint_source(m,start_checkpoint,start_fixture,start_row,store,reference,compatibility)
                            source = copy.deepcopy(f['test_source']); source['started'] = src['event_record']
                            source['started_access'] = {**src['event_access'], 'storage_instance_id':store,
                                'source_value_sha256':src['index_row']['source_value_sha256'],
                                'payload_source':src.get('payload_source')}
                            source['outcome']['started_event_id'] = source['started']['event_id']
                            payload = {**f['valid'],'started_event_id':source['started']['event_id']}
                            label = prefix+'retained_start/'+store[-4:]+'/'+str(reference)+'/'+str(compatibility)
                            add(label+'/positive', 'test', payload, source, event, payload_schema, expected=True)
                            for field, value in [('event_withdrawn',True),('deleted',True),('retained',False),
                                                 ('authorized',False),('hold_access_allowed',False)]:
                                bad = copy.deepcopy(source); bad['started_access'][field] = value
                                add(label+'/'+field, 'test', payload, bad, event, payload_schema)
                            bad = copy.deepcopy(source); bad['started']['observed_at_utc'] = '2026-11-04T00:00:09Z'
                            add(label+'/forged', 'test', payload, bad, event, payload_schema)
                            # Foreign identity is internally re-keyed, committed
                            # and joined to the terminal; only actual Store differs.
                            bad = copy.deepcopy(source)
                            foreign = m.identity(start_row['event_type'],start_fixture['valid'],
                                                 '00000000-0000-4000-8000-000000000099')
                            bad['started']['event_id'] = foreign
                            bad['started']['idempotency_key'] = m.idempotency_key(start_row['event_type'],start_fixture['valid'],
                                                 '00000000-0000-4000-8000-000000000099')
                            bad['outcome']['started_event_id'] = foreign
                            bad['started_access']['source_value_sha256'] = commitment(m,bad['started'])
                            add(label+'/foreign', 'test', {**payload,'started_event_id':foreign}, bad, event, payload_schema)
                for slot in ['retained','authorized','hold_access_allowed','deleted','event_withdrawn']:
                    for wrong in ['false','0',None,[],{'nested':'object'},0,1]:
                        bad=copy.deepcopy(f['test_source']);bad['started_access'][slot]=wrong
                        add(prefix+'start_access_type/'+slot+'/'+json.dumps(wrong),'test',f['valid'],bad,event,payload_schema)
            # Every declared logical integer has its own raw-schema upper/lower
            # guard witness. Runtime exact-type and domain witnesses stay separate.
            for path, _ in integer_paths(f['valid']):
                add(prefix+'payload_max/'+'.'.join(map(str,path)), 'payload', payload_schema,
                    replaced(f['valid'],path,MAX), expected=True)
                for n in [MAX+1,-MAX-1]:
                    candidate=replaced(f['valid'],path,n)
                    # Existing nonnegative minima already own the lower refusal.
                    add(prefix+'payload_bound/'+'.'.join(map(str,path))+'/'+str(n), 'payload', payload_schema, candidate)
        prefix=event+'/checkpoint/round6/'
        for path, _ in integer_paths(c['maximum_history']):
            # Positive at the admitted upper boundary; copies must be coherent
            # for a full checkpoint, while these primitive probes validate schema.
            add(prefix+'schema_max/'+'.'.join(map(str,path)), 'payload', schema,
                replaced(c['maximum_history'],path,MAX), expected=True)
            add(prefix+'schema_overflow/'+'.'.join(map(str,path)), 'payload', schema,
                replaced(c['maximum_history'],path,MAX+1))
        for n in [MAX, MAX+1, (1<<64)-1, 1<<64, 1<<100]:
            value=copy.deepcopy(c['valid']);source=copy.deepcopy(c['source'])
            value['revision']=source['publication']['revision']=n
            add(prefix+'revision/'+str(n), 'acceptance_result', 'checkpoint',
                (value,source,row,c['key'],schema), n==MAX, expected=True)
    return out

def evaluate(m, c, envelope):
    a=c.args
    if c.surface=='acceptance_result':
        surface,args,expected=a
        if surface=='joins': actual=m.joins(*args)
        else: actual=evaluate5(m,Case(c.name,surface,args),envelope)
        return type(actual) is bool and actual is expected
    if c.surface=='retry_result': return m.retry_outcome(a[0],a[1])==a[2]
    if c.surface=='encoder_refusal':
        try:m.body_bytes(a[0])
        except ValueError:return True
        return False
    if c.surface=='encoding':
        try:m.body_bytes(a[0])
        except ValueError:return False
        return True
    if c.surface=='test':
        return Draft202012Validator(a[3],format_checker=FormatChecker()).is_valid(a[0]) and m.test_joins(*a[:3])
    return evaluate5(m,c,envelope)
