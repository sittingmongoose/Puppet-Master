#!/usr/bin/env python3
"""DG-OWN-A source/custody state-machine oracles, ATS-1110..1112.

TEST_ONLY: private owner stores below model original issuance. They are not a
native installation, and do not exercise complete inherited native arguments.
No guard-removal machinery is implemented here; the inventory is sweep input.
"""
from __future__ import annotations

import base64
import copy
import datetime
import hashlib
import json
from pathlib import Path
import re
import sys
from urllib.parse import urldefrag, urljoin

import jsonschema
import msgpack
from blake3 import blake3
from referencing import Registry, Resource
from pm_goal_run_stop_block_oracles import recipe, LEGAL, EDGES
from pm_goal_oracle_common import integer_number, same_json_value, semantic_digest, SEMANTIC_FIELDS

ROOT = Path(__file__).resolve().parents[1]
PKG = ROOT / 'Plans/goal_run_stop_block_contracts'
PROFILE = 'pm.executor.workflow_source.all_writers.stop_block.v1'
TIME = '2026-11-05T00:00:00Z'
SID = '00000000-0000-4000-8000-000000000001'
SCOPE = dict(storage_instance_id=SID, scope_partition='project~cHJvamVjdDphbHBoYQ',
             project_id='project:alpha', goal_id='goal:1', goal_run_id='run:1')
WRITERS = {'goal_run.stopped': 'owner.executor.workflow_run.stop.v1',
           'goal_run.blocked': 'owner.executor.workflow_run.block.v1'}
GUARDS: dict[str, list[str]] = {}


class Refusal(Exception):
    pass


def require(code, value):
    if not value:
        raise Refusal(code)


def packed(value):
    """Bounded test physical bytes; preserve number types, never normalize floats."""
    if isinstance(value, dict):
        value = {k: unpacked_order(v) for k, v in sorted(value.items())}
    return msgpack.packb(value, use_bin_type=True)


def unpacked_order(value):
    if isinstance(value, dict):
        return {k: unpacked_order(v) for k, v in sorted(value.items())}
    if isinstance(value, list):
        return [unpacked_order(v) for v in value]
    return value


def sha(value):
    return hashlib.sha256(packed(value)).hexdigest()


def k(value):
    return base64.urlsafe_b64encode(value.encode()).decode().rstrip('=')


def utc(value):
    if type(value) is not str or not re.fullmatch(r'\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?Z', value):
        return False
    try:
        datetime.datetime.fromisoformat(value)
        return True
    except ValueError:
        return False


def baseline(family):
    f = json.loads((ROOT / 'Plans/goal_run_stop_block_oracle_fixtures.json').read_text())['families'][family]
    payload = copy.deepcopy(f['payload_cases'][0]['value'])
    payload.update(project_id=SCOPE['project_id'], goal_id=SCOPE['goal_id'])
    payload['payload']['goal_run_id'] = SCOPE['goal_run_id']
    op = 'op:pause:1' if family.endswith('stopped') else 'op:block:1'
    event_id, key = recipe(family, {**SCOPE, 'expected_goal_run_revision': 3, 'operation_id': op})
    payload['idempotency_key'] = key
    payload['occurred_at_utc'] = TIME
    event = dict(schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project',
                 event_id=event_id, event_type=family, project_id=SCOPE['project_id'],
                 thread_id=None, run_id=SCOPE['goal_run_id'], node_id=None, attempt_id=None,
                 actor_ref=payload['actor_ref'], requested_account_ref=payload['requested_account_ref'],
                 effective_account_ref=payload['effective_account_ref'], occurred_at_utc=TIME,
                 observed_at_utc=TIME, persisted_at_utc=TIME, sequence_id=1,
                 producer_sequence_id=None, correlation_id=payload['correlation_id'],
                 causation_event_id=None, parent_event_id=None, idempotency_key=key,
                 payload_schema_id=payload['schema_version'], payload=payload, payload_ref=None,
                 redaction_profile='default', replay_policy='normal', migration=None)
    # Select actual closed envelope enums; don't infer their names from a sibling.
    schema = json.loads((ROOT/'Plans/event_record.schema.json').read_text())
    for name in ['redaction_profile','replay_policy']:
        rule=schema['properties'][name]
        if 'enum' in rule:event[name]=next(v for v in rule['enum'] if v!='projector_replay_only')
    native = dict(scope=copy.deepcopy(SCOPE), revision=3, status='running',
                  activation_revision=2, activation_state='started', goal_revision=2,
                  protected={'worknodes':['wn:1'],'scheduler_epoch':1,'run_control_epoch':4})
    goal = dict(project_id=SCOPE['project_id'], goal_id=SCOPE['goal_id'], revision=2,
                state='active', objective_text='fixture objective', control_epoch=3)
    cause = dict(scope=copy.deepcopy(SCOPE), operation_id=op, native_revision=3,
                 kind='settlement' if family.endswith('stopped') else 'block',
                 issuer='owner.bounded_safe_stop' if family.endswith('stopped') else 'owner.scheduler',
                 evidence=['evidence:1'], mutation_started=False, complete=True,
                 unresolved=[], required_flush=True, safe_point='safe_point:1')
    native_key='native:'+SCOPE['goal_run_id'];cause_key='cause:'+op
    issued={native_key:native,cause_key:cause,'goal':goal}
    return dict(family=family, operation_id=op, route='cmd.orchestrator.pause' if family.endswith('stopped') else 'scheduler.run_block',
                profile=PROFILE, native_key=native_key, cause_key=cause_key,
                expected_revision=3, event=event, sources=issued,
                actual_registration={'profile':PROFILE,'writers':list(WRITERS.values()),'birth_operation':'native-birth:1'},
                actual_birth={'profile':PROFILE,'original_registration':'native-birth:1','scope':copy.deepcopy(SCOPE)},
                permission=True, recovery_hold=False, storage_writable=True, writer_withdrawn=False,
                reader_withdrawn=False, fail_at=None, final_change=None,
                supplied_receipt=None, supplied_digest=None, retry_event=None,
                live_native=None, late_append_family=None, new_evidence=True,
                storage_owner={'sequence_id':1,'observed_at_utc':TIME,'persisted_at_utc':TIME,'issued':{}})


def schema_check(schema, value, code):
    try:
        formats=jsonschema.FormatChecker(formats=())
        formats.checks('date-time')(utc)
        formats.checks('uuid')(lambda v: type(v) is str and re.fullmatch(r'[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}',v) is not None)
        errors=list(jsonschema.Draft202012Validator(schema,format_checker=formats).iter_errors(value))
    except Exception as exc:
        raise Refusal(code+':schema_error:'+str(exc)) from exc
    require(code, not errors)


def store_part(value, packs):
    raw=packed(value)
    if len(raw)<=16384:return {'inline':copy.deepcopy(value),'payload_ref':None}
    identity=blake3(raw).hexdigest();packs[identity]=raw
    part={'inline':None,'payload_ref':{'blake3':identity,'byte_size':len(raw),'media_type':'application/msgpack'}}
    assert len(packed(part))<=16384  # Fixed-size constructed output, not an input guard.
    return part


def resolve_part(part,packs):
    if part['payload_ref'] is None:
        require('part/inline_size',len(packed(part))<=16384)
        return part['inline']
    ref=part['payload_ref']
    require('part/type',ref['media_type']=='application/msgpack')
    require('part/present',ref['blake3'] in packs)
    raw=packs[ref['blake3']]
    require('part/hash',blake3(raw).hexdigest()==ref['blake3'])
    require('part/size',len(raw)==ref['byte_size'])
    return msgpack.unpackb(raw,raw=False)


def run_writer(c):
    """Return actual bounded phase outputs; callers never supply afterimages."""
    family=c['family'];store=copy.deepcopy(c['sources']);event=copy.deepcopy(c['event'])
    registration=c['actual_registration'];birth=c['actual_birth'];op=c['operation_id']
    require('registration/profile',c['profile']==registration['profile']==PROFILE)
    require('birth/original',birth['original_registration']==registration['birth_operation'])
    require('birth/profile',birth['profile']==registration['profile'])
    require('registration/writer',WRITERS[family] in registration['writers'])
    require('birth/scope',birth['scope']==SCOPE)
    require('route',c['route'] in (['cmd.orchestrator.pause','cmd.runtime.abort_run'] if family.endswith('stopped') else ['scheduler.run_block']))
    require('authority/permission',c['permission'] is True)
    require('authority/recovery',c['recovery_hold'] is False)
    require('authority/storage',c['storage_writable'] is True)
    require('writer/withdrawal',c['writer_withdrawn'] is False)
    require('native/exists',c['native_key'] in store)
    require('cause/exists',c['cause_key'] in store)
    native=store[c['native_key']];cause=store[c['cause_key']];goal=store['goal']
    require('native/scope',native['scope']==SCOPE)
    require('native/value_revision_type',integer_number(native['revision']))
    require('goal/revision_type',integer_number(goal['revision']))
    require('native/revision_type',integer_number(c['expected_revision']))
    require('native/revision',c['expected_revision']==native['revision'])
    require('native/status',native['status'] in LEGAL[family])
    if native['status']==family.split('.')[1]:
        require('native/self_evidence',c['new_evidence'] is True)
    require('cause/scope',cause['scope']==SCOPE)
    require('cause/operation',cause['operation_id']==op)
    require('cause/revision_type',integer_number(cause['native_revision']))
    require('cause/revision',cause['native_revision']==native['revision'])
    require('cause/kind',cause['kind']==('settlement' if family.endswith('stopped') else 'block'))
    require('cause/issuer',cause['issuer']==('owner.bounded_safe_stop' if family.endswith('stopped') else 'owner.scheduler'))
    require('cause/complete',cause['complete'] is True)
    require('cause/mutation_type',type(cause['mutation_started']) is bool)
    require('cause/unresolved',cause['unresolved']==[])
    if family.endswith('stopped'):
        require('cause/required_flush',cause['required_flush'] is True)
        if event['payload']['payload']['resumable'] is True:
            require('cause/safe_point',event['payload']['payload']['safe_point_ref']==cause['safe_point'] and cause['safe_point'] is not None)
    require('event/replay_policy',event['replay_policy']!='projector_replay_only')
    require('event/family',event['event_type']==family)
    require('event/dispatch',c['late_append_family'] in (None,family))
    schema=json.loads((ROOT/'Plans/executor_cancellation_contracts/schemas'/('goal-run-stopped.v3.schema.json' if family.endswith('stopped') else 'goal-run-blocked.v3.schema.json')).read_text())
    schema_check(schema,event['payload'],'event/payload_schema')
    require('event/scope',event['scope_kind']=='project' and event['project_id']==SCOPE['project_id'])
    require('event/run',event['run_id']==SCOPE['goal_run_id'])
    payload=event['payload']
    require('event/payload_scope',payload['project_id']==SCOPE['project_id'] and payload['goal_id']==SCOPE['goal_id'])
    require('event/payload_run',payload['payload']['goal_run_id']==SCOPE['goal_run_id'])
    require('event/goal_revision',payload['goal_revision']==goal['revision'])
    require('event/expected',payload['expected_goal_run_revision']==native['revision'])
    require('event/successor',payload['goal_run_revision']==native['revision']+1)
    event_id,key=recipe(family,{**SCOPE,'expected_goal_run_revision':native['revision'],'operation_id':op})
    require('event/identity',event['event_id']==event_id)
    require('event/key',event['idempotency_key']==key)
    require('event/inner_key',payload['idempotency_key']==key)
    require('event/payload_selector',event['payload_schema_id']==payload['schema_version'])
    for label in ['requested_account_ref','effective_account_ref','actor_ref','correlation_id','occurred_at_utc']:
        require('event/join/'+label,event[label]==payload[label])
    semantic={key:event[key] for key in SEMANTIC_FIELDS}
    if c['supplied_digest'] is not None:require('event/digest',c['supplied_digest']==semantic_digest(event))
    frozen=copy.deepcopy(event)
    for field in ['sequence_id','observed_at_utc','persisted_at_utc']:
        frozen[field]=None  # Unassigned producer request, never caller authority.
    trace=['prepared'];intent={'operation_id':op,'event':frozen,'before':copy.deepcopy(native),'semantic':semantic_digest(event)}
    if c['fail_at']=='prepared':return {'outcome':'recovery_required','trace':trace,'intent':intent,'native':native,'goal':goal}
    require('final/native',c['final_change']!='native')
    require('final/permission',c['final_change']!='permission')
    require('final/source',c['final_change']!='source')
    after=copy.deepcopy(native);after.update(status=family.split('.')[1],revision=native['revision']+1)
    # One simulated transaction publishes both actual native result and D01.
    d01={'operation_id':op,'before_sha256':sha(native),'after_sha256':sha(after),'profile':PROFILE}
    trace.append('native_committed')
    if c['fail_at']=='native_committed':return {'outcome':'recovery_required','trace':trace,'intent':intent,'native':after,'d01':d01,'goal':goal}
    storage=c['storage_owner']
    stored_event=copy.deepcopy(event)
    for field in ['sequence_id','observed_at_utc','persisted_at_utc']:
        stored_event[field]=storage[field]
    receipt=dict(event_id=event_id,sequence_id=storage['sequence_id'],segment_generation=1,segment_name='segment-1',byte_offset=0,
                 commit_group_id='group:1',durability_class='barrier',durable_end_offset=123,
                 durability_state='synced',manifest_generation=1,acknowledged_at_utc=TIME)
    candidate_first={'receipt':receipt,'event':stored_event,'whole_value_sha256':sha(stored_event)}
    if event_id in storage['issued']:
        original_event=storage['issued'][event_id]['event']
        require('storage/semantic_body',same_json_value({key:original_event[key] for key in SEMANTIC_FIELDS},semantic))
    else:
        storage['issued'][event_id]=copy.deepcopy(candidate_first)
    first=copy.deepcopy(storage['issued'][event_id]);receipt=first['receipt']
    if c['supplied_receipt'] is not None:require('receipt/original',c['supplied_receipt']==receipt)
    trace.append('event_issued')
    if c['retry_event'] is not None:
        require('retry/replay_policy',c['retry_event']['replay_policy']!='projector_replay_only')
        retry={key:c['retry_event'][key] for key in SEMANTIC_FIELDS}
        require('retry/semantic',same_json_value(retry,semantic))
    if c['fail_at']=='event_issued':return {'outcome':'recovery_required','trace':trace,'intent':intent,'native':after,'d01':d01,'first':first,'goal':goal}
    trace.append('published')
    return dict(outcome='published',trace=trace,intent=intent,native=after,d01=d01,first=first,goal=goal,
                terminal='command_result' if family.endswith('stopped') else 'scheduler_pass')


def recover(c, result):
    # No effects are repeated; exact original pending identity/candidate required.
    require('recovery/operation',result['intent']['operation_id']==c['operation_id'])
    frozen=copy.deepcopy(c['event'])
    for field in ['sequence_id','observed_at_utc','persisted_at_utc']:frozen[field]=None
    require('recovery/frozen',packed(result['intent']['event'])==packed(frozen))
    if result['outcome']=='published':return result
    if result['trace'][-1]=='event_issued':
        resumed=copy.deepcopy(result);resumed['outcome']='published';resumed['trace'].append('published');return resumed
    return result


def inspect(c,result,current=False):
    require('reader/withdrawal',c['reader_withdrawn'] is False)
    require('reader/original_result',result['outcome']=='published')
    require('reader/whole_value',sha(result['first']['event'])==result['first']['whole_value_sha256'])
    require('reader/receipt',result['first']['receipt']['event_id']==result['first']['event']['event_id'])
    original=c['storage_owner']['issued'].get(result['first']['event']['event_id'])
    require('reader/original_custody',original is not None and sha(result['first'])==sha(original))
    if current:require('reader/current_native',c['live_native'] is None or packed(c['live_native'])==packed(result['native']))
    return copy.deepcopy(result['first'])


def project(c, rows, *, stale=False, crash=None, cutover=True, token_storage=SID):
    require('project/token_storage',token_storage==SCOPE['storage_instance_id'])
    require('project/birth',c['actual_birth']['profile']==PROFILE)
    status='started';revision=3
    for row in rows:
        require('project/original',row['outcome']=='published')
        require('project/event_custody',sha(row['first']['event'])==row['first']['whole_value_sha256'])
        ev=row['first']['event'];payload=ev['payload'];family=ev['event_type']
        require('project/edge',(status,family) in EDGES)
        require('project/native_before',payload['expected_goal_run_revision']==revision)
        require('project/native_after',payload['goal_run_revision']==revision+1)
        status=family.split('.')[1];revision+=1
    require('project/cas',stale is False)
    # This exercises atomic outcome selection, not SB5's physical token/anchor
    # algorithm. Never mint a production-domain anchor from this bounded slice.
    seed='01'*32;anchor=sha(['TEST_ONLY_BOUNDED_GENERATION',SCOPE,PROFILE,seed])
    gen='grsbg_'+anchor
    row_key='goal_run_stop_block_projection.v1:'+k(SCOPE['project_id'])+':'+k(SCOPE['goal_run_id'])
    candidate={'row':dict(generation_id=gen,lifecycle_status=status,revision=revision,key=row_key),
               'checkpoint':dict(generation_id=gen,count=len(rows),status='current' if cutover else 'staged')}
    if crash=='before':return {'row':None,'checkpoint':None}
    # One return assignment represents one bounded atomic transaction.
    return candidate


def eager_resources():
    bank=json.loads((PKG/'resource-bank.json').read_text());count=0
    refs=0;unresolved=[]
    for realm,description in bank.items():
        if description['mode']!='fresh_whole_resource_namespace':continue
        registry=Registry()
        for row in description['resources']:
            registry=registry.with_resource(row['retrieval_uri'],Resource.from_contents(row['schema']))
        own=json.loads((PKG/'contracts.schema.json').read_text())
        registry=registry.with_resource(own['$id'],Resource.from_contents(own))
        # The new own contract adopts exactly this current shared original root.
        for path in ['Plans/event_append_receipt_contracts.schema.json','Plans/event_record.schema.json']:
            d=json.loads((ROOT/path).read_text());registry=registry.with_resource(d['$id'],Resource.from_contents(d))
        registry=registry.crawl()
        def visit(value,resolver):
            nonlocal refs
            if isinstance(value,dict):
                if '$id' in value:resolver=resolver.in_subresource(Resource.from_contents(value,default_specification=__import__('referencing.jsonschema',fromlist=['DRAFT202012']).DRAFT202012))
                if '$ref' in value:
                    try:resolver.lookup(value['$ref']);refs+=1
                    except Exception as exc:unresolved.append({'realm':realm,'ref':value['$ref'],'error':str(exc)})
                for k,v in value.items():
                    if k!='$ref':visit(v,resolver)
            elif isinstance(value,list):
                for v in value:visit(v,resolver)
        for row in description['resources']:
            visit(row['schema'],registry.resolver(row['retrieval_uri']));count+=1
        visit(own,registry.resolver(own['$id']))
    if unresolved:raise ValueError(json.dumps(unresolved[:40]))
    return count,refs


def main():
    results=[];failures=[]
    def check(name,fn,expected=None):
        try:
            fn();got=None
        except Refusal as exc:got=str(exc)
        except Exception as exc:got='ERROR:'+repr(exc)
        if expected is not None:GUARDS.setdefault(expected,[]).append(name)
        results.append({'id':name,'expected':expected,'actual':got})
        if got!=expected:failures.append(results[-1])
    def mutate(base,path,value):
        c=copy.deepcopy(base);target=c
        path=[c['cause_key'] if item=='$cause' else c['native_key'] if item=='$native' else item for item in path]
        for item in path[:-1]:target=target[item]
        target[path[-1]]=value;return c
    cases=json.loads((PKG/'oracle-fixtures.json').read_text())
    for family in WRITERS:
        c=baseline(family)
        check(family+'/published',lambda:run_writer(c))
        one=copy.deepcopy(c);one['expected_revision']=1
        one['storage_owner']['issued']={}
        one['sources'][one['native_key']]['revision']=1
        one['sources'][one['cause_key']]['native_revision']=1
        one['event']['payload']['expected_goal_run_revision']=1
        one['event']['payload']['goal_run_revision']=2
        event_id,key=recipe(family,{**SCOPE,'expected_goal_run_revision':1,'operation_id':one['operation_id']})
        one['event']['event_id']=event_id;one['event']['idempotency_key']=key;one['event']['payload']['idempotency_key']=key
        check(family+'/revision_one_positive',lambda:run_writer(one))
        check(family+'/cause_boolean_alias',lambda:run_writer(mutate(one,['sources',one['cause_key'],'native_revision'],True)),'cause/revision_type')
        check(family+'/native_boolean_alias',lambda:run_writer(mutate(one,['sources',one['native_key'],'revision'],True)),'native/value_revision_type')
        goal_one=copy.deepcopy(c);goal_one['sources']['goal']['revision']=1;goal_one['event']['payload']['goal_revision']=1
        goal_one['storage_owner']['issued']={}
        check(family+'/goal_revision_one_positive',lambda:run_writer(goal_one))
        check(family+'/goal_boolean_alias',lambda:run_writer(mutate(goal_one,['sources','goal','revision'],True)),'goal/revision_type')
        for case in cases['common_negatives']:
            check(family+'/'+case['id'],lambda case=case:run_writer(mutate(c,case['path'],case['value'])),case['refusal'])
        for status in sorted(set(['ready','running','provisional_success','verifying','failed_verification','repairing','blocked','stopped','certified','failed','cancelled'])):
            changed=mutate(c,['sources',c['native_key'],'status'],status)
            check(family+'/status/'+status,lambda changed=changed:run_writer(changed),None if status in LEGAL[family] else 'native/status')
        self_case=mutate(c,['sources',c['native_key'],'status'],family.split('.')[1]);self_case['new_evidence']=False
        check(family+'/self_without_new_evidence',lambda:run_writer(self_case),'native/self_evidence')
        if family.endswith('stopped'):
            check(family+'/failed_required_flush',lambda:run_writer(mutate(c,['sources',c['cause_key'],'required_flush'],False)),'cause/required_flush')
            changed=mutate(c,['sources',c['cause_key'],'safe_point'],'foreign')
            check(family+'/unresolved_safe_point',lambda:run_writer(changed),'cause/safe_point')
        for field in ['permission','recovery_hold','storage_writable']:
            for wrong in ['false','0',0,None,[],{}]:
                code={'permission':'authority/permission','recovery_hold':'authority/recovery','storage_writable':'authority/storage'}[field]
                check(family+'/wrong_type/'+field+'/'+repr(wrong),lambda field=field,wrong=wrong:run_writer(mutate(c,[field],wrong)),code)
        for wrong in ['false','0',0,None,[],{}]:
            check(family+'/cause_type/'+repr(wrong),lambda wrong=wrong:run_writer(mutate(c,['sources',c['cause_key'],'mutation_started'],wrong)),'cause/mutation_type')
        for stamp in ['2026-11-05T24:00:00Z','2026-11-05T00:00:00','2026-02-30T00:00:00Z',TIME+'\n','2026-11-05T00:00:60Z']:
            case=mutate(c,['event','occurred_at_utc'],stamp);case['event']['payload']['occurred_at_utc']=stamp
            expected='event/payload_schema'
            check(family+'/timestamp/'+repr(stamp),lambda case=case:run_writer(case),expected)
        # Each change below affects one semantic fact; all derived mirrors agree.
        for label in ['event_id','idempotency_key']:
            check(family+'/forged/'+label,lambda label=label:run_writer(mutate(c,['event',label],'forged')), 'event/identity' if label=='event_id' else 'event/key')
        for phase in ['prepared','native_committed','event_issued']:
            interrupted=mutate(c,['fail_at'],phase);out=run_writer(interrupted)
            check(family+'/fault/'+phase,lambda out=out:require('fault/outcome',out['outcome']=='recovery_required'))
            if phase=='event_issued':
                check(family+'/lost_ack_original',lambda out=out:require('fault/replay',recover(c,out)['first']==out['first']))
        original=run_writer(c)
        fresh=baseline(family);fresh['event']['sequence_id']=99
        fresh['event']['observed_at_utc']='2026-11-05T00:00:01Z'
        fresh['event']['persisted_at_utc']='2026-11-05T00:00:02Z'
        assigned=run_writer(fresh)
        check(family+'/storage_assigns_first_metadata',lambda:require('assignment',all(assigned['first']['event'][field]==fresh['storage_owner'][field] for field in ['sequence_id','observed_at_utc','persisted_at_utc'])))
        changed=copy.deepcopy(c);changed['event']['correlation_id']='different';changed['event']['payload']['correlation_id']='different'
        check(family+'/first_append_identity_conflict',lambda:run_writer(changed),'storage/semantic_body')
        for name,value in [('sequence_id',99),('observed_at_utc','2026-11-05T00:00:01Z'),('persisted_at_utc','2026-11-05T00:00:02Z')]:
            retry=copy.deepcopy(c['event']);retry[name]=value;changed=mutate(c,['retry_event'],retry)
            check(family+'/storage_metadata_retry/'+name,lambda changed=changed:run_writer(changed))
        retry=copy.deepcopy(c['event']);retry['payload']['expected_goal_run_revision']=3.0
        check(family+'/equivalent_integral_retry',lambda:run_writer(mutate(c,['retry_event'],retry)))
        retry=copy.deepcopy(c['event']);retry['correlation_id']='different';retry['payload']['correlation_id']='different'
        check(family+'/semantic_retry',lambda:run_writer(mutate(c,['retry_event'],retry)),'retry/semantic')
        retry=copy.deepcopy(c['event']);retry['replay_policy']='projector_replay_only'
        check(family+'/replay_only_retry',lambda:run_writer(mutate(c,['retry_event'],retry)),'retry/replay_policy')
        check(family+'/forged_receipt',lambda:run_writer(mutate(c,['supplied_receipt'],{**original['first']['receipt'],'sequence_id':99})),'receipt/original')
        retained=mutate(c,['live_native'],{'status':'cancelled'});retained['writer_withdrawn']=True
        check(family+'/retained_after_live_writer_change',lambda:inspect(retained,original))
        check(family+'/current_after_live_change',lambda:inspect(retained,original,True),'reader/current_native')
        check(family+'/withdrawn_reader',lambda:inspect(mutate(c,['reader_withdrawn'],True),original),'reader/withdrawal')
        forged=copy.deepcopy(original);forged['first']['event']['sequence_id']=99
        check(family+'/forged_historical_metadata',lambda:inspect(c,forged),'reader/whole_value')
        forged_coherent=copy.deepcopy(original)
        forged_coherent['first']['event']['sequence_id']=99;forged_coherent['first']['receipt']['sequence_id']=99
        forged_coherent['first']['whole_value_sha256']=sha(forged_coherent['first']['event'])
        check(family+'/forged_coherent_metadata',lambda:inspect(c,forged_coherent),'reader/original_custody')
        check(family+'/projection',lambda:project(c,[original]))
        check(family+'/projection_wrong_storage',lambda:project(c,[original],token_storage='foreign'),'project/token_storage')
        check(family+'/projection_stale_cas',lambda:project(c,[original],stale=True),'project/cas')
        check(family+'/atomic_crash_before',lambda:require('atomic',project(c,[original],crash='before')=={'row':None,'checkpoint':None}))
        check(family+'/atomic_crash_after',lambda:require('atomic',all(project(c,[original],crash='after').values())))
        lost=copy.deepcopy(original);lost['outcome']='recovery_required'
        check(family+'/reader_pending',lambda:inspect(c,lost),'reader/original_result')
        wrong=copy.deepcopy(original);wrong['first']['receipt']['event_id']='foreign'
        check(family+'/reader_foreign_receipt',lambda:inspect(c,wrong),'reader/receipt')
        check(family+'/project_pending',lambda:project(c,[lost]),'project/original')
        check(family+'/project_forged_custody',lambda:project(c,[forged]),'project/event_custody')
        wrong=copy.deepcopy(original);wrong['first']['event']['event_type']='goal_run.replanned';wrong['first']['whole_value_sha256']=sha(wrong['first']['event'])
        check(family+'/project_unsupported_edge',lambda:project(c,[wrong]),'project/edge')
        # Change each original revision fact coherently with its value commitment.
        for field,code in [('expected_goal_run_revision','project/native_before'),('goal_run_revision','project/native_after')]:
            wrong=copy.deepcopy(original);wrong['first']['event']['payload'][field]+=1;wrong['first']['whole_value_sha256']=sha(wrong['first']['event'])
            check(family+'/project_'+field,lambda wrong=wrong:project(c,[wrong]),code)
        wrong=copy.deepcopy(original);wrong['intent']['operation_id']='foreign'
        check(family+'/recover_foreign_operation',lambda:recover(c,wrong),'recovery/operation')
        wrong=copy.deepcopy(original);wrong['intent']['event']['actor_ref']='foreign'
        check(family+'/recover_changed_candidate',lambda:recover(c,wrong),'recovery/frozen')
        check(family+'/project_old_birth',lambda:project(mutate(c,['actual_birth','profile'],'old'),[original]),'project/birth')
    packs={};value={'whole_original_source': '\U0001f9f5'*20000};part=store_part(value,packs)
    check('parts/large_source_roundtrip',lambda:require('roundtrip',resolve_part(part,packs)==value))
    wrong=copy.deepcopy(part);wrong['payload_ref']['byte_size']+=1
    check('parts/false_byte_size',lambda:resolve_part(wrong,packs),'part/size')
    wrong=copy.deepcopy(part);wrong['payload_ref']['media_type']='text/plain'
    check('parts/false_media',lambda:resolve_part(wrong,packs),'part/type')
    check('parts/missing_original',lambda:resolve_part(part,{}),'part/present')
    altered={part['payload_ref']['blake3']:b'forged'}
    check('parts/forged_original',lambda:resolve_part(part,altered),'part/hash')
    check('parts/overlimit_inline',lambda:resolve_part({'inline':value,'payload_ref':None},{}),'part/inline_size')
    try:resource_count,ref_count=eager_resources()
    except Exception as exc:resource_count=ref_count=0;failures.append({'eager_resources':repr(exc)})
    output=dict(status='fail' if failures else 'pass',native_execution='NOT_RUN',source_installation='TEST_ONLY',
                case_count=len(results),positive_count=sum(r['expected'] is None for r in results),
                negative_count=sum(r['expected'] is not None for r in results),resource_count=resource_count,
                resolved_refs=ref_count,guard_negative_inventory=GUARDS,failures=failures,
                limits=['Complete inherited native argument execution, actual original source acquisition and physical durable token/CAS implementation are not exercised by this bounded model.','Shared number-domain/format/guard-isolation sweep remains required.'])
    print(json.dumps(output,indent=2))
    return 1 if failures else 0


if __name__=='__main__':sys.exit(main())
