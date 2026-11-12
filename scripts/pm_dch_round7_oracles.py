#!/usr/bin/env python3
"""Protected original-recipe and mandatory format witnesses, all DCH families."""
import copy
import hashlib
import json
from pathlib import Path
from pm_dch_round5_oracles import Case, checkpoint_source, evaluate as evaluate5
from pm_dch_formats import refused_by_predicate, validator as current_validator
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
# CV-1101 (shared check, gated 58c2816ff3) expectations, written by hand and
# independently of the predicate: (value, source, utc_z). `source` is the broad
# EventRecord profile of occurred_at_utc; `utc_z` is CV-253's storage_utc_z for
# observed_at_utc/persisted_at_utc and, identically, the registered predicate plus
# the unchanged owner-schema terminal uppercase-Z pattern of the DCH-owned ts and
# retired_at_utc. Entries 0-14 keep their earlier order (case names are stable);
# 15-23 were added in sweep part 2B. Before part 2B the DCH-local grammar refused
# entries 4, 10 and 11 everywhere and every second 60.
DATES = [
    ('2026-11-04T00:00:00', False, False),               # missing zone
    ('2026/11/04T00:00:00Z', False, False),              # wrong separators
    ('2026-13-04T00:00:00Z', False, False),              # month 13
    ('2026-02-29T00:00:00Z', False, False),              # not a leap year
    ('0000-11-04T00:00:00Z', True, True),                # RFC 3339 year 0000
    ('2026-11-04T24:00:00Z', False, False),              # hour 24
    ('2026-11-04T00:60:00Z', False, False),              # minute 60
    ('2026-11-04T00:00:60Z', False, False),              # not an announced leap second
    ('2026-11-04T00:00:00.Z', False, False),             # empty fraction
    ('2026-11-04T00:00:00Z\n', False, False),            # trailing LF
    ('2026-11-04t00:00:00z', True, False),               # lowercase t and z
    ('2026-11-04T00:00:00+00:00', True, False),          # zero offset
    ('2024-02-29T23:59:59Z', True, True),
    ('2026-11-04T00:00:00.1Z', True, True),
    ('2026-11-04T00:00:00.123456789123Z', True, True),   # no fraction ceiling
    ('2026-11-04 00:00:00Z', False, False),              # space separator
    ('2026-11-04T00:00:00+24:00', False, False),         # offset hour 24
    ('2016-12-31T23:59:60+01:00', False, False),         # offset-adjusted: not a leap second
    ('2016-12-31T23:59:60Z', True, True),                # announced leap second (IERS)
    ('2017-01-01T00:59:60+01:00', True, False),          # the same leap second at +01:00
    ('2026-11-04t00:00:00Z', True, True),                # lowercase t, uppercase Z
    ('2026-11-04T00:00:00z', True, False),               # lowercase z
    ('2026-11-04T01:00:00+01:00', True, False),          # nonzero offset
    ('2026-11-04T00:00:00-00:00', True, False),          # negative zero offset
]
# Retained strict-v3 originals whose timestamps CV-1101 refuses. Their recorded
# checker skipped format, which never made them owner-valid history (CV-1101,
# SP-1101): the frozen verifier refuses them, and no single-defect negative is
# derived from them (access, forged-byte and retry negatives use valid originals).
OWNER_INVALID_ORIGINALS = frozenset({'strict-v3/date/2026-11-04T00:00:00.Z', 'strict-v3/date/2026-11-04T24:00:00Z',
                                     'strict-v3/date/2026-13-04T00:00:00Z', 'strict-v3/date/2026/11/04T00:00:00Z'})
OWNER_INVALID_CHECKPOINT_RETIRED = '2026/11/04T00:00:00Z'
BAD_URLS = ['https://[not-an-ip]/pull/1', 'https://[::gg]/pull/1',
            'https://host/%ZZ', 'https://^invalid.example/pull/1',
            'https://host/%', 'https://host/%0', 'https://host/%gg',
            'https://host:bad/pull/1', 'https:///pull/1',
            'https://host/pull/1\n', 'http://host/pull/1',
            'https://[::1/pull/1', 'https://host/has space']
GOOD_URLS = ['https://host/pull/1', 'https://[2001:db8::1]:443/pull/1',
             'https://host/%20?q=a%2Fb#part', 'https://[v1.a:b]/pull/1', 'https://[V1.a:b]/pull/1']


def cases(m, Case=Case):
    rows = json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']
    fs = json.loads((ROOT/'Plans/dch_event_contract_fixtures.json').read_text())
    cs = json.loads((ROOT/'Plans/dch_checkpoint_fixtures.json').read_text())
    originals = json.loads((ROOT/'Plans/dch_retained_history_fixtures.json').read_text())
    selected = getattr(m, 'SELECTED_FAMILY', None)
    out = []
    def add(name, surface, *args, expected=False):
        out.append(Case(name, surface, tuple(copy.deepcopy(args)), expected))
    for row in rows:
        event = row['event_type']
        if selected and event != selected: continue
        schema = json.loads((ROOT/row['payload_schema_ref']).read_text())
        c = next(c for c in cs if c['event_type'] == event)
        checkpoint_schema = json.loads((ROOT/c['schema_ref'].split('#')[0]).read_text())
        for n,bad in enumerate([False,True,0,1,'0','false',[],{}, {'storage_instance_id':m.STORAGE_INSTANCE,'source_value_sha256':0}]):
            add(event+'/recipe_selector/type/'+str(n),'recipe_selector',bad)
        for recipe, original in m.RETAINED_RECIPES.items():
            for path in [row['payload_schema_ref'], c['schema_ref'].split('#')[0], 'Plans/event_record.schema.json']:
                definition=copy.deepcopy(original['schemas'][path]);definition.setdefault('$defs',{})['unvisited']={'$ref':'#/$defs/DCH_MISSING'}
                add(event+'/recipe_selector/reference/'+recipe+'/'+path,'references',definition,ROOT/path)
        for f in [f for f in fs if f['event_type'] == event]:
            prefix = event+'/'+f['edition']+'/round7/'
            for field in ['ts', 'occurred_at_utc', 'observed_at_utc', 'persisted_at_utc']:
                for n, (bad, source_ok, utc_z_ok) in enumerate(DATES):
                    good = source_ok if field == 'occurred_at_utc' else utc_z_ok
                    if field == 'ts':
                        p = {**f['valid'], 'ts':bad}
                        add(prefix+'date/payload/'+str(n), 'payload', schema, p, expected=good)
                    else:
                        record = {**f['record'], field:bad}
                        add(prefix+'date/envelope/'+field+'/'+str(n), 'payload',
                            json.loads((ROOT/'Plans/event_record.schema.json').read_text()), record, expected=good)
            # CV-1101: the installed shared predicate itself refuses, through the
            # validator (the error's cause is its Refusal), at every field kind.
            envelope_schema = json.loads((ROOT/'Plans/event_record.schema.json').read_text())
            for field, bad, reason in [('occurred_at_utc', '2026-11-04T24:00:00Z', 'date_time_hour'),
                                       ('observed_at_utc', '2026-11-04T00:00:00Z\n', 'date_time_syntax'),
                                       ('persisted_at_utc', '2026-11-04T00:00:60Z', 'date_time_leap_second')]:
                add(prefix+'predicate/'+field, 'predicate', envelope_schema, {**f['record'], field: bad}, reason, expected=True)
            add(prefix+'predicate/ts', 'predicate', schema, {**f['valid'], 'ts': '2026-02-29T00:00:00Z'}, 'date_time_day', expected=True)
            if 'pr_url' in f['valid']:
                for n, bad in enumerate(BAD_URLS+GOOD_URLS):
                    add(prefix+'uri/'+str(n), 'payload', schema, {**f['valid'], 'pr_url':bad}, expected=n>=len(BAD_URLS))
            # Current originals cannot claim any prior recipe. The only changed
            # fact is the claim; original bytes/custody remain fully valid.
            for claimed in ['raw-v1','normalized-v2','strict-v3','unknown',None,0,False,[],{}]:
                witness = {**f['historical_source'], 'recipe_id':claimed}
                add(prefix+'forged_current_recipe/'+json.dumps(claimed), 'history', f['record'], row, witness, schema)
            # Exact malformed formats also go through the real retained path,
            # with independently committed *current* bytes, not a stale hash.
            # ts values the DCH-owned ts profile refuses (occurred_at_utc carries the same string).
            ts_refused = [(n, value) for n, (value, _, utc_z_ok) in enumerate(DATES) if not utc_z_ok]
            for field, values in [('ts',ts_refused),('pr_url',list(enumerate(BAD_URLS)) if 'pr_url' in f['valid'] else [])]:
                for n,bad in values:
                    r=copy.deepcopy(f['record']);r['payload'][field]=bad
                    r['observed_at_utc']='2026-11-04T00:00:08Z'
                    if field=='ts':r['occurred_at_utc']=bad
                    w={**f['historical_source'],'source_value_sha256':hashlib.sha256(m.body_bytes(r)).hexdigest()}
                    # Some exact old source bytes have protected earlier receipts;
                    # they are retained positives below, not current negatives.
                    if m.record_number_rule(w) != m.CURRENT_RULE: continue
                    add(prefix+'current_history_format/'+field+'/'+str(n), 'history', r, row, w, schema)
        registered = next(s['value_schema'] for s in json.loads((ROOT/'Plans/storage_value_registry.json').read_text())['families'] if s['value_schema_id']==checkpoint_schema['$id'])
        bad=copy.deepcopy(c['with_history']);bad['history'][0]['retired_at_utc']='2026-11-04T00:60:00Z'
        add(event+'/checkpoint/round7/predicate/retired_at_utc','predicate',checkpoint_schema,bad,'date_time_minute',expected=True)
        for copy_name, definition in [('selected',checkpoint_schema),('registered',registered)]:
            for n,(bad, _, utc_z_ok) in enumerate(DATES):
                value=copy.deepcopy(c['with_history']);value['history'][0]['retired_at_utc']=bad
                add(event+'/checkpoint/round7/date/'+copy_name+'/'+str(n), 'payload', definition, value, expected=utc_z_ok)
        for original in [o for o in originals['events'] if o['event_type']==event]:
            r,w=original['record'],original['witness']
            prefix=event+'/'+original['edition']+'/round7/retained/'+original['case']
            owner_valid = original['case'] not in OWNER_INVALID_ORIGINALS
            add(prefix+'/positive', 'history', r,row,w,schema,expected=owner_valid)
            retry=copy.deepcopy(r)
            retry['sequence_id']=int(retry['sequence_id'])
            retry['producer_sequence_id']=None
            retry['payload']=copy.deepcopy(next(f['valid'] for f in fs if f['event_type']==event and f['edition']==original['edition'])) if retry['payload_ref'] is None else {}
            retry['occurred_at_utc']=next(f['record']['occurred_at_utc'] for f in fs if f['event_type']==event and f['edition']==original['edition'])
            if r['replay_policy']=='projector_replay_only':
                add(prefix+'/retry_compatibility_refusal','retained_retry_result',r,retry,w,'replay_only_not_appendable',expected=True)
            elif original['rule']=='raw-v1':
                add(prefix+'/retry_positive','retained_retry',r,retry,w,expected=True)
                add(prefix+'/retry_forged_recipe','retained_retry',r,retry,{**w,'recipe_id':'unknown'})
                add(prefix+'/retry_withdrawn','retained_retry',r,retry,{**w,'event_withdrawn':True})
                add(prefix+'/retry_forged_bytes','retained_retry',{**r,'observed_at_utc':'2026-11-04T00:00:09Z'},retry,w)
            else:
                if original['rule']=='strict-v3' and not owner_valid or original['case'].startswith('strict-v3/uri/'):
                    add(prefix+'/retry_old_format_is_not_current','retained_retry_result',r,r,w,'invalid_input_type',expected=True)
                # An owner-invalid original refuses before any comparison (invalid_input_type).
                add(prefix+'/retry_current_semantic_conflict','retained_retry_result',r,retry,w,
                    'conflict' if owner_valid else 'invalid_input_type',expected=True)

            # Single claim alteration cannot choose another schema/encoder.
            for claimed in ['strict-v4','raw-v1','normalized-v2','strict-v3','unknown']:
                if claimed==original['rule']:continue
                add(prefix+'/recipe/'+claimed,'history',r,row,{**w,'recipe_id':claimed},schema)
            if owner_valid:
                for field,bad in [('retained',False),('authorized',False),('hold_access_allowed',False),('event_withdrawn',True),('deleted',True)]:
                    add(prefix+'/access/'+field,'history',r,row,{**w,field:bad},schema)
                forged={**r,'observed_at_utc':'2026-11-04T00:00:09Z'}
                add(prefix+'/forged_bytes','history',forged,row,w,schema)
            # A current derived checkpoint may reference an old numeric original.
            # Its own integers use the strict write recipe; only the stored
            # source/index sequence retains its original representation.
            f=next(f for f in fs if f['event_type']==event and f['edition']==original['edition'])
            value,source,key=checkpoint_source(m,c,f,row,w['storage_instance_id'])
            source['event_record']=copy.deepcopy(r)
            source['event_access']={k:v for k,v in w.items() if k not in ['storage_instance_id','source_value_sha256','payload_source']}
            source['index_row']['source_value_sha256']=w['source_value_sha256']
            source['index_row']['sequence_id']=r['sequence_id']
            value['last_sequence_id']=int(r['sequence_id'])
            if 'payload_source' in w:source['payload_source']=copy.deepcopy(w['payload_source'])
            add(prefix+'/checkpoint_positive','checkpoint',value,source,row,key,checkpoint_schema,expected=owner_valid)
            add(prefix+'/checkpoint_forged_recipe','checkpoint',value,{**source,'event_access':{**source['event_access'],'recipe_id':'unknown'}},row,key,checkpoint_schema)
        for original in [o for o in originals['checkpoints'] if o['event_type']==event]:
            prefix=event+'/checkpoint/round7/retained/'+original.get('case', original['rule'])
            v,s=original['value'],original['source']
            owner_valid = v['history'][0]['retired_at_utc'] != OWNER_INVALID_CHECKPOINT_RETIRED
            add(prefix+'/positive','retained_checkpoint',v,s,row,original['key'],expected=owner_valid)
            add(prefix+'/forged_recipe','retained_checkpoint',v,{**s,'checkpoint_access':{**s['checkpoint_access'],'recipe_id':'unknown'}},row,original['key'])
            # Logical mutation keeps source relations fixed: original byte
            # commitment alone distinguishes a forged retired timestamp.
            bad=copy.deepcopy(v);bad['history'][0]['retired_at_utc']='2026-11-04T00:00:09Z'
            add(prefix+'/forged_bytes','retained_checkpoint',bad,s,row,original['key'])
            if original['rule']=='raw-v1':
                raw=m.body_bytes(v,'raw-v1');digest=m.blake3.blake3(raw).hexdigest()
                physical=copy.deepcopy(s)
                physical['checkpoint_storage']={'pointer':{'payload_ref':f'payload:v1:{digest}:{len(raw)}:application/msgpack'},'pack':{'body':copy.deepcopy(v),'key':'payload:v1:'+digest,'byte_size':len(raw),'media_type':'application/msgpack','storage_instance_id':s['storage_instance_id'],'domain_key':original['key'],'scope_partition':v['scope_partition'],'event_type':event,'authorized':True,'hold_access_allowed':True,'deleted':False,'bytes_durable':True,'index_durable':True,'readback_verified':True}}
                add(prefix+'/reference_positive','retained_checkpoint',v,physical,row,original['key'],expected=True)
                alias=copy.deepcopy(physical);alias['checkpoint_storage']['pack']['body']['history'][0]['last_sequence_id']=int(v['history'][0]['last_sequence_id'])
                add(prefix+'/reference_numeric_bytes','retained_checkpoint',v,alias,row,original['key'])

        # A terminal validates its independently retained start under the very
        # same recipe dispatch, including compatibility and referenced bodies.
        for f in [f for f in fs if f['event_type']==event and 'test_source' in f]:
            for original in [o for o in originals['events'] if o['event_type']=='chat.thread_worktree_pre_merge_test_started' and o['edition']==f['edition']]:
                source=copy.deepcopy(f['test_source']);source['started']=copy.deepcopy(original['record']);source['started_access']=copy.deepcopy(original['witness'])
                payload=copy.deepcopy(f['valid']);payload['started_event_id']=source['started']['event_id'];source['outcome']['started_event_id']=source['started']['event_id']
                prefix=event+'/'+f['edition']+'/round7/start/'+original['case']
                add(prefix+'/positive','test',payload,source,event,schema,expected=original['case'] not in OWNER_INVALID_ORIGINALS)
                add(prefix+'/forged_recipe','test',payload,{**source,'started_access':{**source['started_access'],'recipe_id':'unknown'}},event,schema)
    return out


def predicate_refused(schema, instance, reason):
    """True when the shared CV-1101 predicate's own Refusal (with this reason) caused a validation error."""
    return refused_by_predicate(current_validator(schema), instance, reason)


def evaluate(m,c,envelope):
    if c.surface=='predicate':return predicate_refused(*c.args)
    if c.surface=='retained_retry':return m.retry_outcome(c.args[0],c.args[1],True,c.args[2])=='original_result'
    if c.surface=='retained_retry_result':return m.retry_outcome(c.args[0],c.args[1],True,c.args[2])==c.args[3]
    if c.surface=='recipe_selector':return m.record_number_rule(*c.args) is not None
    if c.surface=='references':return m.references_valid(*c.args)
    if c.surface=='retained_checkpoint':return m.checkpoint_joins(*c.args)
    if c.surface=='test':return current_validator(c.args[3]).is_valid(c.args[0]) and m.test_joins(*c.args[:3])
    return evaluate5(m,c,envelope)
