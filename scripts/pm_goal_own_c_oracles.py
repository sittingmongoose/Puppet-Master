#!/usr/bin/env python3
"""DG-OWN-C TEST_ONLY contract adapters; NOT a complete inherited native-root corpus.

No native capabilities, Event Authority, admission or 12/12 result are asserted.
New guard inventory/negative IDs are exported for the later shared isolation tool;
this file deliberately contains no guard-removal/proof engine or new numeric codec.
"""
from __future__ import annotations
import argparse
import base64
import copy
import datetime as dt
import hashlib
from fractions import Fraction
import json
from pathlib import Path
import re
import sys
from urllib.parse import urldefrag
import jsonschema
import msgpack
from blake3 import blake3
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012
from pm_goal_oracle_common import canonical, SEMANTIC_FIELDS  # existing bounded TEST_ONLY codec; shared number sweep remains required

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = ROOT / 'Plans/goal_own_c_contracts/contracts.schema.json'
FAMILIES = ('goal.updated', 'goal.cancelled', 'goal_run.started', 'goal_run.cancelled', 'goal_run.certified')
ROLES = ('goal', 'host_stop', 'plan', 'workflow', 'scheduler', 'sir')
FORMAT = jsonschema.FormatChecker(formats=())

@FORMAT.checks('date-time')
def utc(value):
    if type(value) is not str:
        return True  # schema's type predicate owns wrong types
    if re.fullmatch(r'[0-9]{4}-[0-9]{2}-[0-9]{2}T(?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](?:\.[0-9]+)?Z', value) is None:
        return False
    try:
        dt.datetime.fromisoformat(value[:-1]+'+00:00')
    except ValueError:
        return False
    return True


@FORMAT.checks('uuid')
def uuid_string(value):
    if type(value) is not str:
        return True
    return re.fullmatch(r'[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}',value) is not None


def instant(value):
    """Exact ordering for the NEW provider UTC grammar; preserve fractional precision."""
    if type(value) is not str or not utc(value):
        raise ValueError('invalid new-provider UTC instant')
    whole,_,fraction=value[:-1].partition('.')
    y,month,day,hour,minute,second=map(int,re.split('[-T:]',whole))
    return (y,month,day,hour,minute,second,Fraction(int(fraction),10**len(fraction)) if fraction else Fraction(0))


def exact_pattern(validator, pattern, instance, schema):
    if type(instance) is str and re.fullmatch(pattern, instance) is None:
        yield jsonschema.ValidationError('full string does not match pattern')

Validator = jsonschema.validators.extend(jsonschema.Draft202012Validator, {'pattern': exact_pattern})

def sha(raw):
    return hashlib.sha256(raw).hexdigest()

def equal(a,b):
    # Exact source comparisons must not alias bool with int. No number serializer.
    if type(a) is not type(b):
        return False
    if type(a) is dict:
        return a.keys()==b.keys() and all(equal(a[k], b[k]) for k in a)
    if type(a) is list:
        return len(a)==len(b) and all(equal(x,y) for x,y in zip(a,b))
    return a==b

class Refusal(Exception):
    pass

def require(guard, condition):
    if condition is not True:
        raise Refusal(guard)

class SchemaBank:
    """Each bank is isolated. Resolve all refs eagerly, including unused defs."""
    def __init__(self, path):
        self.schema=json.loads(path.read_text())
        self.registry=Registry().with_resource(self.schema['$id'],Resource.from_contents(self.schema,default_specification=DRAFT202012))
        self._walk(self.schema,self.registry.resolver(self.schema['$id']))
    def _walk(self,node,resolver):
        if type(node) is dict:
            if '$ref' in node:
                resolver.lookup(node['$ref'])
            for value in node.values():self._walk(value,resolver)
        elif type(node) is list:
            for value in node:self._walk(value,resolver)
    def validate(self,name,value):
        root={'$ref':self.schema['$id']+'#/$defs/'+name}
        errors=list(Validator(root,registry=self.registry,format_checker=FORMAT).iter_errors(value))
        if errors:
            e=errors[0]
            raise Refusal('schema/'+name+'/'+ '/'.join(map(str,e.absolute_path))+'/'+str(e.validator))

class ApprovalOwner:
    """Private TEST_ONLY owner state, independent of caller request and hashes."""
    def __init__(self, request, bank):
        self.bank=bank
        self.original_request=copy.deepcopy(request)
        self.target=copy.deepcopy(request['target'])
        self.messages={request['source_message_id']:('agent',request['target']['scope']['thread_id'],request['actor_ref']),request['instruction_message_id']:('user',request['target']['scope']['thread_id'])}
        self.instruction=copy.deepcopy(request['target'])
        self.accepted_dispatch=copy.deepcopy(request)
        self.request_raw=canonical(request)
        self.approval={'schema_id':'pm.goal.update.approval_request.v1','schema_version':'1.0.0','approval_id':'approval:1','proposal_request_ref':'proposal:1','proposal_request_sha256':sha(self.request_raw),'target':copy.deepcopy(request['target']),'source_message_id':request['source_message_id'],'instruction_message_id':request['instruction_message_id'],'created_at_utc':'2026-11-05T00:00:00Z','expires_at_utc':'2026-11-06T00:00:00Z'}
        self.resolution={'approval_id':'approval:1','request_sha256':sha(self.request_raw),'decision':'approved','approver_ref':'person:1','decided_at_utc':'2026-11-05T00:01:00Z','approval_owner_epoch':2,'protected_person_decision_ref':'person-decision:1'}
        self.person_decision=copy.deepcopy(self.resolution)
        self.epoch=2
        self.permission=True
        self.withdrawn=False
        self.now='2026-11-05T01:00:00Z'
    def capture(self,request):
        self.bank.validate('GoalUpdateProposalRequest',request)
        require('U/dispatch',equal(request,self.accepted_dispatch))
        require('U/target',equal(request['target'],self.target))
        require('U/source_message',self.messages.get(request['source_message_id'])==('agent',request['target']['scope']['thread_id'],request['actor_ref']))
        require('U/instruction_message',self.messages.get(request['instruction_message_id'])==('user',request['target']['scope']['thread_id']))
        require('U/instruction_target',equal(request['target'],self.instruction))
        require('U/permission',self.permission is True)
        require('U/withdrawn',self.withdrawn is False)
        return copy.deepcopy(self.approval)
    def resolve_for_mutation(self, request, supplied_resolution, helper=lambda owner:None, candidate_helper=lambda owner,candidate:None):
        self.capture(request)
        self.bank.validate('ApprovalRequest',self.approval)
        self.bank.validate('ApprovalResolution',supplied_resolution)
        self._check_resolution(supplied_resolution)
        captured_approval=copy.deepcopy(self.approval)
        candidate=copy.deepcopy(supplied_resolution)
        helper(self)
        candidate_helper(self,candidate)
        # Lower boundary and outer final boundary both independently repeat the whole predicate.
        self.capture(request)
        self.bank.validate('ApprovalRequest',self.approval)
        self.bank.validate('ApprovalResolution',candidate)
        self._check_resolution(supplied_resolution)
        require('U/final_approval',equal(captured_approval,self.approval))
        require('U/final_resolution_candidate',equal(candidate,self.resolution))
        return candidate
    def _check_resolution(self,value):
        require('U/original_resolution',equal(value,self.resolution))
        require('U/person_decision',equal(value,self.person_decision))
        require('U/request_bytes',value['request_sha256']==sha(self.request_raw))
        require('U/approval_identity',value['approval_id']==self.approval['approval_id'])
        require('U/approval_target',equal(self.approval['target'],self.original_request['target']))
        require('U/approval_request_hash',self.approval['proposal_request_sha256']==sha(self.request_raw))
        require('U/approval_source_message',self.approval['source_message_id']==self.original_request['source_message_id'])
        require('U/approval_instruction_message',self.approval['instruction_message_id']==self.original_request['instruction_message_id'])
        require('U/approved',value['decision']=='approved')
        require('U/owner_epoch_source_type',type(self.epoch) is int)
        if type(self.epoch) is int:
            require('U/owner_epoch',value['approval_owner_epoch']==self.epoch)
        require('U/expiry',self.approval['expires_at_utc'] is None or instant(self.now)<instant(self.approval['expires_at_utc']))

class MigrationOwner:
    """Bounded original-membership/CAS/atomicity adapter, never a native source implementation."""
    def __init__(self):
        self.originals={role:{'key':'TEST_ONLY:'+role,'bytes':('original '+role).encode(),'pending':[],'receipts':['original-receipt:'+role]} for role in ROLES}
        self.stop={'user_stop_epoch':9,'continuation_epoch':7,'stop_latched':True}
        self.associations=['plan-run:1']
        self.unknown=[]
        self.writer_epoch=3
        self.root_epoch=4
        self.enrolled=None
        self.results={}
        self.withdrawn=False
    def capture(self):
        return {'owners':copy.deepcopy(self.originals),'stop':copy.deepcopy(self.stop),'associations':copy.deepcopy(self.associations),'unknown':copy.deepcopy(self.unknown),'writer_epoch':self.writer_epoch,'root_epoch':self.root_epoch}
    def commit(self,identity,capture,helper=lambda owner:None,fault=None):
        # A known immutable result replays BEFORE live-source checks. Never re-enroll.
        if identity in self.results:
            original,result=self.results[identity]
            require('M/replay_identity',equal(capture,original))
            return copy.deepcopy(result)
        self._check(capture)
        helper(self)
        self._check(capture)
        if self.unknown:
            result={'disposition':'blocked_unresolved','pending':copy.deepcopy(self.unknown),'stop':copy.deepcopy(self.stop)}
        else:
            result={'disposition':'enrolled','members':copy.deepcopy(capture),'stop':copy.deepcopy(self.stop)}
        if fault=='before_commit':
            raise Refusal('M/interrupted_before_commit')
        # One TEST_ONLY atomic assignment stands for the authored real Storage transaction.
        next_results=copy.deepcopy(self.results)
        next_results[identity]=(copy.deepcopy(capture),copy.deepcopy(result))
        self.enrolled,self.results=(copy.deepcopy(result) if result['disposition']=='enrolled' else self.enrolled),next_results
        if fault=='after_commit':
            raise Refusal('M/acknowledgement_lost')
        return result
    def _check(self,c):
        require('M/owner_set',type(c.get('owners')) is dict and set(c['owners'])==set(ROLES))
        for role in ROLES:
            if role not in c['owners']:
                continue  # membership is owned solely by M/owner_set
            require('M/source/'+role,equal(c['owners'][role],self.originals[role]))
        for field in ('user_stop_epoch','continuation_epoch'):
            require('M/stop/'+field+'/source_type',type(self.stop[field]) is int)
            require('M/stop/'+field+'/type',type(c['stop'].get(field)) is int)
            if type(c['stop'].get(field)) is int and type(self.stop[field]) is int:
                require('M/stop/'+field+'/value',c['stop'][field]==self.stop[field])
        require('M/stop/stop_latched/source_type',type(self.stop['stop_latched']) is bool)
        require('M/stop/stop_latched/type',type(c['stop'].get('stop_latched')) is bool)
        if type(c['stop'].get('stop_latched')) is bool and type(self.stop['stop_latched']) is bool:
            require('M/stop/stop_latched/value',c['stop']['stop_latched'] is self.stop['stop_latched'])
        require('M/associations',equal(c['associations'],self.associations))
        require('M/unknown',equal(c['unknown'],self.unknown))
        for field in ('writer_epoch','root_epoch'):
            current=getattr(self,field)
            require('M/'+field+'/source_type',type(current) is int)
            require('M/'+field+'/type',type(c[field]) is int)
            if type(c[field]) is int and type(current) is int:
                require('M/'+field+'/value',c[field]==current)
        require('M/withdrawn',self.withdrawn is False)

class EventOwner:
    """Exact active registry payload dispatch + independent raw first-value custody slice.

    Full native causal schemas/receipts are explicitly outside this slice. Do not
    substitute this adapter's receipt for SP-286/CF-06 complete real values.
    """
    def __init__(self,family,event):
        self.family=family
        self.event=copy.deepcopy(event)
        self.original=copy.deepcopy(event)
        self.storage='00000000-0000-4000-8000-000000000001'
        self.receipt={'storage_instance_id':self.storage,'event_id':event['event_id'],'sequence_id':event['sequence_id']}
        self.withdrawn=False
        self.current=True
    def read(self,candidate,receipt,storage,historical=False,helper=lambda owner:None):
        self._check(candidate,receipt,storage,historical)
        output=copy.deepcopy(self.original)
        helper(self)
        self._check(output,receipt,storage,historical)
        return output
    def _check(self,c,r,storage,historical):
        require('W/'+self.family+'/family',c['event_type']==self.family)
        require('W/'+self.family+'/storage',storage==self.storage)
        require('W/'+self.family+'/original_value',equal({k:v for k,v in c.items() if k!='event_type'},{k:v for k,v in self.original.items() if k!='event_type'}))
        require('W/'+self.family+'/first_receipt',equal(r,self.receipt))
        require('W/'+self.family+'/withdrawn',self.withdrawn is False)
        if not historical:
            require('W/'+self.family+'/current',self.current is True)
    def append(self,event):
        require('W/'+self.family+'/append_family',event['event_type']==self.family)
        require('W/'+self.family+'/replay_policy',event['replay_policy']!='projector_replay_only')
        # Equality excludes only Storage-owned metadata. No caller admission flag.
        # Exactly the existing CV-339 semantic-field list. event_type is compared
        # separately above; replay policy is the independent current-writer gate.
        fields=[k for k in SEMANTIC_FIELDS if k!='event_type']
        require('W/'+self.family+'/semantic_retry',equal({k:event[k] for k in fields},{k:self.original[k] for k in fields}))
        return copy.deepcopy(self.receipt)

class PayloadStore:
    """SP-337 byte/reference/durability and whole-stored-part measurement seams."""
    def __init__(self, raw):
        self.raw=raw
        self.media_type='application/json'
        self.pack_durable=True
        self.ref={'blake3':blake3(raw).hexdigest(),'byte_size':len(raw),'media_type':self.media_type}
    def resolve(self,ref):
        require('P/reference_type',type(ref) is dict)
        require('P/id_type',type(ref['blake3']) is str)
        require('P/id',ref['blake3']==blake3(self.raw).hexdigest())
        require('P/size_type',type(ref['byte_size']) is int)
        require('P/size',ref['byte_size']==len(self.raw))
        require('P/media_type',type(ref['media_type']) is str and ref['media_type']==self.media_type)
        require('P/durable',self.pack_durable is True)
        return self.raw
    def admit_parts(self,record,operation):
        # Canonical field order changes no encoded size. No hash/identity recipe is introduced.
        require('P/record_size',len(msgpack.packb(record,use_bin_type=True))<=16384)
        require('P/operation_size',len(msgpack.packb(operation,use_bin_type=True))<=16384)


class Suite:
    def __init__(self):self.rows=[];self.failures=[]
    def case(self,id,run,expected=None):
        try:run();got=None
        except Refusal as e:got=str(e)
        except Exception as e:got='ERROR:'+type(e).__name__+':'+str(e)
        self.rows.append({'id':id,'expected_guard':expected,'observed_guard':got,'valid':expected is None})
        if got!=expected:self.failures.append({'id':id,'expected':expected,'observed':got})
    def negative(self,id,baseline,mutation,run,guard):
        # Always prove its independent baseline accepted; copies never alias a previous case.
        self.case(id+'/baseline',lambda:run(copy.deepcopy(baseline)))
        value=copy.deepcopy(baseline);mutation(value)
        self.case(id,lambda:run(value),guard)


def event_fixture(family):
    row=next(x for x in json.loads((ROOT/'Plans/event_family_registry.json').read_text())['families'] if x['event_type']==family)
    f=json.loads((ROOT/'Plans/goal_current_writer_oracle_fixtures.json').read_text())['families'][family]
    payload=copy.deepcopy(f['payload_cases'][0]['value'])
    if family.startswith('goal_run.'):
        payload.pop('expected_goal_revision',None)
        payload['schema_version']=row['payload_schema_id']
        payload['expected_goal_run_revision']=1;payload['goal_run_revision']=2
        payload['idempotency_key']='TEST_ONLY:original-native-key'
    schema=json.loads((ROOT/row['payload_schema_ref']['path']).read_text())
    errors=list(Validator(schema,format_checker=FORMAT).iter_errors(payload))
    require('setup/'+family+'/active_payload',not errors)
    event=copy.deepcopy(json.loads((ROOT/'Plans/run_started_consumer_contract_fixtures.json').read_text())['base']['event'])
    event.update(event_type=family,event_id='TEST_ONLY:event:'+family,project_id=payload['project_id'],thread_id=payload.get('thread_id'),run_id=payload.get('payload',{}).get('goal_run_id'),payload_schema_id=row['payload_schema_id'],payload=payload,idempotency_key=payload.get('idempotency_key','TEST_ONLY:key:'+family))
    for k in ('actor_ref','requested_account_ref','effective_account_ref','occurred_at_utc','correlation_id'):
        if k in payload:event[k]=payload[k]
    if 'cancelled_at_utc' in payload:
        event['occurred_at_utc']=payload['cancelled_at_utc']
    event['observed_at_utc']=event['occurred_at_utc']
    event['persisted_at_utc']=event['occurred_at_utc']
    # Exact current whole Event schema, independent of family payload schema above.
    v=Validator(json.loads((ROOT/'Plans/event_record.schema.json').read_text()),format_checker=FORMAT)
    require('setup/'+family+'/whole_event',not list(v.iter_errors(event)))
    return event


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--output');args=parser.parse_args()
    s=Suite()
    manifest=json.loads((ROOT/'Plans/goal_own_c_contracts/resources.json').read_text())
    require('setup/new_bank_count',len(manifest['resources'])==1)
    resource=manifest['resources'][0]
    require('setup/new_bank_path',resource['path']=='Plans/goal_own_c_contracts/contracts.schema.json')
    require('setup/new_bank_hash',resource['sha256']==sha(SCHEMA.read_bytes()))
    require('setup/new_bank_uri',resource['retrieval_uri']==json.loads(SCHEMA.read_text())['$id'])
    bank=SchemaBank(SCHEMA)
    methods=json.loads((ROOT/'Plans/goal_own_c_contracts/methods.json').read_text())
    for method in methods['methods']:
        for field in ('request_schema_ref','result_schema_ref'):
            bank.registry.resolver().lookup(method[field])
        projection=method.get('independently_acquired_private_projection')
        if projection:
            # Original realm remains isolated; no global schema merge or alias.
            old=json.loads((ROOT/projection['original_resource_bank']).read_text())
            registry=Registry()
            locations={x['declared_path']:x for x in projection.get('whole_resource_locations',[])}
            for resource in old['resources']:
                location=locations.get(resource['path'])
                if location:
                    require('setup/original_location_hash',location['sha256']==resource['sha256'])
                path=location['exact_original_path'] if location else resource['path']
                raw=(ROOT/path).read_bytes()
                require('setup/original_resource_hash',sha(raw)==resource['sha256'])
                registry=registry.with_resource(resource['retrieval_uri'],Resource.from_contents(json.loads(raw),default_specification=DRAFT202012))
            registry.resolver().lookup(projection['whole_schema_ref'])
    scope={'storage_instance_id':'00000000-0000-4000-8000-000000000001','project_id':'project:alpha','thread_id':'thread:1','goal_id':'goal:1'}
    req={'schema_id':'pm.goal.update.proposal_request.v1','schema_version':'1.0.0','command_id':'cmd.chat.goal.propose_update','command_instance_id':'proposal:1','target':{'scope':scope,'expected_revision':3,'expected_currentness_hash':'a'*64,'objective_text':'exact replacement\n'},'actor_ref':'agent:1','permission_snapshot_ref':'permission:1','source_message_id':'message:agent','instruction_message_id':'message:user','return_route_ref':'route:1'}
    def approve(owner):return owner.resolve_for_mutation(copy.deepcopy(owner.original_request),copy.deepcopy(owner.resolution))
    s.case('U/complete_provider',lambda:approve(ApprovalOwner(req,bank)))
    for text in ('','same text','  keep whitespace\n','🙂'*4000):
        def textcase(text=text):
            r=copy.deepcopy(req);r['target']['objective_text']=text;approve(ApprovalOwner(r,bank))
        s.case('U/text/'+str(len(text)),textcase)
    mutations=[('dispatch',lambda o:o.accepted_dispatch.update(actor_ref='other'),'U/dispatch'),('target',lambda o:o.target.update(expected_revision=4),'U/target'),('source',lambda o:o.messages.update({'message:agent':('user','thread:1','agent:1')}),'U/source_message'),('source_actor',lambda o:o.messages.update({'message:agent':('agent','thread:1','foreign-agent')}),'U/source_message'),('source_thread',lambda o:o.messages.update({'message:agent':('agent','foreign-thread','agent:1')}),'U/source_message'),('instruction_message',lambda o:o.messages.update({'message:user':('agent','thread:1')}),'U/instruction_message'),('instruction_target',lambda o:o.instruction.update(objective_text='other'),'U/instruction_target'),('permission',lambda o:setattr(o,'permission',False),'U/permission'),('withdrawal',lambda o:setattr(o,'withdrawn',True),'U/withdrawn'),('epoch',lambda o:setattr(o,'epoch',3),'U/owner_epoch'),('expiry',lambda o:setattr(o,'now','2026-11-07T00:00:00Z'),'U/expiry'),('request_bytes',lambda o:(o.resolution.update(request_sha256='0'*64),o.person_decision.update(request_sha256='0'*64)),'U/request_bytes')]
    for id,mutation,guard in mutations:
        owner=ApprovalOwner(req,bank);mutation(owner)
        s.case('U/'+id,lambda owner=owner:approve(owner),guard)
    owner=ApprovalOwner(req,bank);owner.approval['expires_at_utc']=None
    s.case('U/null_expiry_preserves_other_guards',lambda owner=owner:approve(owner))
    for now,expires,expected in [('2026-11-05T01:00:00.12345670Z','2026-11-05T01:00:00.12345671Z',None),('2026-11-05T01:00:00.12345672Z','2026-11-05T01:00:00.12345671Z','U/expiry'),('2026-11-05T01:00:00Z','2026-11-05T01:00:00.000Z','U/expiry')]:
        owner=ApprovalOwner(req,bank);owner.now=now;owner.approval['expires_at_utc']=expires
        s.case('U/exact_expiry/'+now,lambda owner=owner:approve(owner),expected)
    for wrong in (True,'1',None,[],{}):
        owner=ApprovalOwner(req,bank);owner.epoch=1;owner.resolution['approval_owner_epoch']=1;owner.person_decision=copy.deepcopy(owner.resolution);owner.epoch=wrong
        s.case('U/source_epoch_type/'+repr(wrong),lambda owner=owner:approve(owner),'U/owner_epoch_source_type')
    for decision in ('denied','expired','revoked'):
        owner=ApprovalOwner(req,bank);owner.resolution['decision']=decision;owner.person_decision=copy.deepcopy(owner.resolution)
        s.case('U/decision/'+decision,lambda owner=owner:approve(owner),'U/approved')
    for stage in ('capture_helper','resolution_helper','before_body'):
        owner=ApprovalOwner(req,bank)
        s.case('U/final/'+stage,lambda owner=owner:owner.resolve_for_mutation(req,copy.deepcopy(owner.resolution),lambda o:setattr(o,'withdrawn',True)),'U/withdrawn')
    owner=ApprovalOwner(req,bank)
    s.case('U/final/changed_immutable_approval',lambda owner=owner:owner.resolve_for_mutation(req,copy.deepcopy(owner.resolution),lambda o:o.approval.update(created_at_utc='2026-11-05T00:00:01Z')),'U/final_approval')
    owner=ApprovalOwner(req,bank)
    s.case('U/final/changed_resolution_candidate',lambda owner=owner:owner.resolve_for_mutation(req,copy.deepcopy(owner.resolution),candidate_helper=lambda o,c:c.update(approver_ref='forged-after-helper')),'U/final_resolution_candidate')
    owner=ApprovalOwner(req,bank);bad=copy.deepcopy(owner.resolution);bad['approver_ref']='forged'
    s.case('U/forged_resolution',lambda:owner.resolve_for_mutation(req,bad),'U/original_resolution')
    owner=ApprovalOwner(req,bank);owner.person_decision['approver_ref']='different original person'
    s.case('U/person_decision',lambda:approve(owner),'U/person_decision')
    owner=ApprovalOwner(req,bank);owner.approval['approval_id']='different approval'
    s.case('U/approval_identity',lambda:approve(owner),'U/approval_identity')
    for field,val,guard in [('target',dict(req['target'],objective_text='foreign'),'U/approval_target'),('proposal_request_sha256','b'*64,'U/approval_request_hash'),('source_message_id','foreign','U/approval_source_message'),('instruction_message_id','foreign','U/approval_instruction_message')]:
        owner=ApprovalOwner(req,bank);owner.approval[field]=val
        s.case('U/approval_join/'+field,lambda owner=owner:approve(owner),guard)
    # Exact schemas: change one leaf only, keeping schema semantics separate from joins.
    for name,base in [('GoalUpdateProposalRequest',req),('ApprovalRequest',ApprovalOwner(req,bank).approval),('ApprovalResolution',ApprovalOwner(req,bank).resolution)]:
        for field in list(base):
            value=copy.deepcopy(base);del value[field]
            s.case('schema/'+name+'/required/'+field,lambda name=name,value=value:bank.validate(name,value),'schema/'+name+'//required')
        value=copy.deepcopy(base);value['extension']=True
        s.case('schema/'+name+'/extra',lambda name=name,value=value:bank.validate(name,value),'schema/'+name+'//additionalProperties')
    for value in (True,0,1,'3',None,[],{}):
        if type(value) is int and value==1:continue
        r=copy.deepcopy(req);r['target']['expected_revision']=value
        guard='minimum' if type(value) is int else 'type'
        s.case('schema/revision/'+repr(value),lambda r=r:bank.validate('GoalUpdateProposalRequest',r),'schema/GoalUpdateProposalRequest/target/expected_revision/'+guard)
    for value in ('a'*63,'a'*64+'\n','A'*64):
        r=copy.deepcopy(req);r['target']['expected_currentness_hash']=value
        s.case('schema/hash/'+repr(value[:5])+str(len(value)),lambda r=r:bank.validate('GoalUpdateProposalRequest',r),'schema/GoalUpdateProposalRequest/target/expected_currentness_hash/pattern')
    for t in ('2026-11-05T24:00:00Z','2026-02-30T00:00:00Z','2026-11-05 00:00:00Z','2026-11-05T00:00:00','2026-11-05T00:00:60Z','2026-11-05T00:00:00Z\n','2026-11-05T00:00:00.Z'):
        value=copy.deepcopy(ApprovalOwner(req,bank).resolution);value['decided_at_utc']=t
        s.case('schema/time/'+t,lambda value=value:bank.validate('ApprovalResolution',value),'schema/ApprovalResolution/decided_at_utc/format')
    for role in ROLES:
        owner=MigrationOwner();captured=owner.capture();captured['owners'][role]['bytes']=b'forged but well typed'
        s.case('M/foreign/'+role,lambda o=owner,c=captured:o.commit('m:1',c),'M/source/'+role)
    for field in ('user_stop_epoch','continuation_epoch','stop_latched'):
        for wrong in ('false','0',None,[],{},False if field!='stop_latched' else 1):
            owner=MigrationOwner();c=owner.capture();c['stop'][field]=wrong
            s.case('M/stop/'+field+'/'+repr(wrong),lambda o=owner,c=c:o.commit('m:1',c),'M/stop/'+field+'/type')
    for field in ('user_stop_epoch','continuation_epoch','stop_latched'):
        for wrong in (1,'true',None,[],{}) if field=='stop_latched' else (True,'1',None,[],{}):
            owner=MigrationOwner()
            if field!='stop_latched':owner.stop[field]=1
            c=owner.capture();owner.stop[field]=wrong
            s.case('M/source_stop_type/'+field+'/'+repr(wrong),lambda o=owner,c=c:o.commit('m:1',c),'M/stop/'+field+'/source_type')
        owner=MigrationOwner();c=owner.capture();c['stop'][field]=False if field=='stop_latched' else 10
        s.case('M/stop_value/'+field,lambda o=owner,c=c:o.commit('m:1',c),'M/stop/'+field+'/value')
    for field in ('writer_epoch','root_epoch'):
        for wrong in (True,'1',None,[],{}):
            owner=MigrationOwner();c=owner.capture();c[field]=wrong
            s.case('M/captured_epoch_type/'+field+'/'+repr(wrong),lambda o=owner,c=c:o.commit('m:1',c),'M/'+field+'/type')
            owner=MigrationOwner();setattr(owner,field,1);c=owner.capture();setattr(owner,field,wrong)
            s.case('M/source_epoch_type/'+field+'/'+repr(wrong),lambda o=owner,c=c:o.commit('m:1',c),'M/'+field+'/source_type')
    for name,mut,guard in [('owner_set',lambda c:c['owners'].pop('plan'),'M/owner_set'),('association',lambda c:c.update(associations=[]),'M/associations'),('unknown',lambda c:c.update(unknown=['unresolved:1']),'M/unknown'),('writer_epoch',lambda c:c.update(writer_epoch=4),'M/writer_epoch/value'),('root_epoch',lambda c:c.update(root_epoch=5),'M/root_epoch/value')]:
        owner=MigrationOwner();c=owner.capture();mut(c)
        s.case('M/'+name,lambda o=owner,c=c:o.commit('m:1',c),guard)
    for name in ('source_drift','stop_race','withdrawal'):
        owner=MigrationOwner();c=owner.capture()
        helper={'source_drift':lambda o:o.originals['plan'].update(bytes=b'changed'),'stop_race':lambda o:o.stop.update(user_stop_epoch=10),'withdrawal':lambda o:setattr(o,'withdrawn',True)}[name]
        guard={'source_drift':'M/source/plan','stop_race':'M/stop/user_stop_epoch/value','withdrawal':'M/withdrawn'}[name]
        s.case('M/final/'+name,lambda o=owner,c=c,h=helper:o.commit('m:1',c,h),guard)
    def successful_migration():
        o=MigrationOwner();c=o.capture();r=o.commit('m:1',c)
        require('test/migration_preserves',equal(r['stop'],c['stop']) and equal(r['members']['associations'],c['associations']))
        o.stop['user_stop_epoch']=10
        require('test/migration_replay',equal(o.commit('m:1',c),r))
    s.case('M/preserved_Stop_and_original_replay',successful_migration)
    def unknown_migration():
        o=MigrationOwner();o.unknown=['original-unknown:1'];r=o.commit('m:1',o.capture())
        require('test/unknown_preserved',r['disposition']=='blocked_unresolved' and o.enrolled is None and o.unknown==['original-unknown:1'])
    s.case('M/unknown_never_empty',unknown_migration)
    for fault,guard in [('before_commit','M/interrupted_before_commit'),('after_commit','M/acknowledgement_lost')]:
        o=MigrationOwner();c=o.capture();s.case('M/fault/'+fault,lambda o=o,c=c,fault=fault:o.commit('m:1',c,fault=fault),guard)
        s.case('M/fault/'+fault+'/atomic',lambda o=o,fault=fault:require('test/atomic',bool(o.results)==(fault=='after_commit') and bool(o.enrolled)==(fault=='after_commit')))
        s.case('M/fault/'+fault+'/recover',lambda o=o,c=c:o.commit('m:1',c))
    o=MigrationOwner();c=o.capture();o.commit('m:1',c);c['associations']=[]
    s.case('M/replay_conflict',lambda:o.commit('m:1',c),'M/replay_identity')
    # Whole new migration/result/storage roots have executable schema specimens.
    selection={'owner':'StorageMigrationCoordinator','physical_key':'TEST_ONLY:source:1','schema_ref':'TEST_ONLY:original-schema:1','sha256':'b'*64}
    image={'selection':selection,'codec_id':'TEST_ONLY:original-codec:1','bytes_hex':b'original source bytes'.hex(),'origin':selection}
    mapping={'role':'goal','sources':[image],'pending_operations':[],'prior_receipts':[selection]}
    migration={'scope':scope,'migration_id':'m:1','expected_writer_domain':selection,'owner_mappings':[dict(copy.deepcopy(mapping),role=role) for role in ROLES]}
    result={'scope':scope,'migration_id':'m:1','disposition':'enrolled','capture_sha256':'c'*64,'original_stop':{'user_stop_epoch':9,'continuation_epoch':7,'stop_latched':True},'original_association_refs':[selection],'pending_operation_ids':[],'prior_receipts':[selection],'published_members':[selection],'writer_domain':selection}
    part={'scope':scope,'migration_id':'m:1','ordinal':0,'part_count':1,'whole_manifest_sha256':'d'*64,'members':[selection]}
    raw=canonical(req);payload=PayloadStore(raw)
    stored={'schema_id':'pm.storage_value.goal_update_proposal.v1','schema_version':'1.0.0','scope':scope,'physical_key':'goal_update_proposal.v1:TEST_ONLY','proposal_command_instance_id':'proposal:1','original_request_sha256':sha(raw),'content':{'kind':'payload_ref','reference':payload.ref}}
    resolution={'schema_id':'pm.storage_value.goal_update_approval_resolution.v1','schema_version':'1.0.0','scope':scope,'physical_key':'goal_update_approval_resolution.v1:TEST_ONLY','resolution':ApprovalOwner(req,bank).resolution}
    selector={'scope':scope,'migration_id':'m:1'}
    wreq=dict(selector,withdrawal_id='w:1',expected_original_result=selection,expected_writer_domain=selection)
    wresult=dict(selector,withdrawal_id='w:1',disposition='withdrawn',original_result=selection,fenced_writer_domain=selection,preserved_pending_operation_ids=[])
    for name,base in [('MigrationSelector',selector),('MigrationWithdrawalRequest',wreq),('MigrationWithdrawalResult',wresult),('MigrationRequest',migration),('MigrationResult',result),('ManifestPart',part),('SourceImage',image),('StorageProposal',stored),('StorageApprovalResolution',resolution)]:
        s.case('schema/'+name+'/complete',lambda name=name,base=base:bank.validate(name,base))
        for field in base:
            value=copy.deepcopy(base);del value[field]
            s.case('schema/'+name+'/required/'+field,lambda name=name,value=value:bank.validate(name,value),'schema/'+name+'//required')
        value=copy.deepcopy(base);value['extra']=True
        s.case('schema/'+name+'/extra',lambda name=name,value=value:bank.validate(name,value),'schema/'+name+'//additionalProperties')
    for name,base,path,value,guard in [
        ('GoalUpdateProposalRequest',req,['target','scope','storage_instance_id'],'a'*36,'format'),
        ('GoalUpdateProposalRequest',req,['target','scope','storage_instance_id'],scope['storage_instance_id']+'\n','format'),
        ('GoalUpdateProposalRequest',req,['target','scope','storage_instance_id'],'a'*32,'format'),
        ('GoalUpdateProposalRequest',req,['target','objective_text'],'x'*4001,'maxLength'),
        ('GoalUpdateProposalRequest',req,['target','objective_text'],'\ud800','pattern'),
        ('GoalUpdateProposalRequest',req,['target','objective_text'],False,'type'),
        ('GoalUpdateProposalRequest',req,['target','expected_currentness_hash'],64,'type'),
        ('GoalUpdateProposalRequest',req,['source_message_id'],'','minLength'),
        ('GoalUpdateProposalRequest',req,['instruction_message_id'],'','minLength'),
        ('ManifestPart',part,['ordinal'],-1,'minimum'),
        ('ManifestPart',part,['part_count'],0,'minimum'),
        ('ManifestPart',part,['part_count'],True,'type'),
        ('SourceImage',image,['bytes_hex'],'ab\n','pattern'),
        ('SourceImage',image,['bytes_hex'],'a','pattern'),
        ('MigrationResult',result,['disposition'],'withdrawn','enum'),
        ('MigrationResult',result,['original_stop','stop_latched'],'false','type'),
        ('MigrationResult',result,['original_stop','user_stop_epoch'],-1,'minimum'),
        ('MigrationRequest',migration,['owner_mappings'],{},'type'),
    ]:
        v=copy.deepcopy(base);parent=v
        for key in path[:-1]:parent=parent[key]
        parent[path[-1]]=value
        expected='schema/'+name+'/'+ '/'.join(path)+'/'+guard
        s.case('schema/edge/'+name+'/'+ '/'.join(path)+'/'+repr(value)[:30],lambda name=name,v=v:bank.validate(name,v),expected)
    s.case('P/whole_reference',lambda:require('test/payload_exact',payload.resolve(payload.ref)==raw))
    for field,value,guard in [('blake3','0'*64,'P/id'),('blake3',7,'P/id_type'),('byte_size',len(raw)+1,'P/size'),('byte_size',True,'P/size_type'),('media_type','image/png','P/media_type')]:
        ref=copy.deepcopy(payload.ref);ref[field]=value
        s.case('P/ref/'+field+'/'+repr(value),lambda ref=ref:payload.resolve(ref),guard)
    s.case('P/ref_wrong_type',lambda:payload.resolve('ref'),'P/reference_type')
    broken=PayloadStore(raw);broken.pack_durable=False
    s.case('P/ack_before_pack',lambda:broken.resolve(broken.ref),'P/durable')
    s.case('P/compact_parts',lambda:payload.admit_parts(stored,{'request_sha256':sha(raw),'content_ref':payload.ref}))
    s.case('P/record_oversize',lambda:payload.admit_parts({'body':'x'*16385},{}),'P/record_size')
    s.case('P/operation_oversize_after_reference',lambda:payload.admit_parts(stored,{'retained_duplicate_body':'x'*16385}),'P/operation_size')
    r=copy.deepcopy(req);r['target']['objective_text']='🙂'*4000
    large=PayloadStore(canonical(r));bigstored=copy.deepcopy(stored);bigstored['content']['reference']=large.ref
    s.case('P/maximum_unicode_request_reference',lambda:large.admit_parts(bigstored,{'request_sha256':sha(large.raw),'content_ref':large.ref}))
    s.case('P/maximum_unicode_exact_read',lambda:require('test/large_payload',large.resolve(large.ref)==canonical(r)))
    for family in FAMILIES:
        event=event_fixture(family)
        o=EventOwner(family,event)
        s.case(family+'/whole_payload_event_and_custody',lambda o=o:o.read(o.event,o.receipt,o.storage))
        for field,val,guard in [('event_type','foreign.family','family'),('observed_at_utc','2026-11-05T12:00:00Z','original_value'),('sequence_id',999,'original_value')]:
            c=copy.deepcopy(event);c[field]=val
            s.case(family+'/forged/'+field,lambda c=c,o=o:o.read(c,o.receipt,o.storage),'W/'+family+'/'+guard)
        c=copy.deepcopy(o.receipt);c['sequence_id']=999
        s.case(family+'/forged_receipt',lambda c=c,o=o:o.read(o.event,c,o.storage),'W/'+family+'/first_receipt')
        s.case(family+'/foreign_checkpoint_Storage',lambda o=o:o.read(o.event,o.receipt,'foreign'),'W/'+family+'/storage')
        for history in (False,True):
            o=EventOwner(family,event);o.current=False
            s.case(family+'/changed_live/'+str(history),lambda o=o,history=history:o.read(o.event,o.receipt,o.storage,historical=history),None if history else 'W/'+family+'/current')
        for stage in ('entry','source_helper','receipt_helper','final_disclosure'):
            o=EventOwner(family,event)
            s.case(family+'/withdraw/'+stage,lambda o=o:o.read(o.event,o.receipt,o.storage,historical=True,helper=lambda x:setattr(x,'withdrawn',True)),'W/'+family+'/withdrawn')
        for retry in (False,True):
            o=EventOwner(family,event);c=copy.deepcopy(event);c['replay_policy']='projector_replay_only'
            s.case(family+'/append_replay_only/'+str(retry),lambda o=o,c=c:o.append(c),'W/'+family+'/replay_policy')
        o=EventOwner(family,event);c=copy.deepcopy(event);c['event_type']='foreign.family'
        s.case(family+'/foreign_append_family',lambda o=o,c=c:o.append(c),'W/'+family+'/append_family')
        c=copy.deepcopy(event);c['correlation_id']='changed-semantic'
        s.case(family+'/unequal_semantic_retry',lambda o=o,c=c:o.append(c),'W/'+family+'/semantic_retry')
        c=copy.deepcopy(event);c['sequence_id']=987;c['observed_at_utc']='2026-11-05T02:00:00Z';c['persisted_at_utc']='2026-11-05T03:00:00Z'
        s.case(family+'/Storage_metadata_only_retry',lambda o=o,c=c:require('test/first_receipt',equal(o.append(c),o.receipt)))
        c=copy.deepcopy(event);c['replay_policy']='projector_replay_only';o=EventOwner(family,c)
        s.case(family+'/retained_replay_only',lambda o=o:o.read(o.event,o.receipt,o.storage,historical=True))
    guards={}
    for row in s.rows:
        if row['expected_guard']:guards.setdefault(row['expected_guard'],[]).append(row['id'])
    result={'status':'fail' if s.failures else 'pass','scope':'TEST_ONLY new provider/migration plus exact active payload/Event dispatch and independent custody slice; full inherited native-root corpus NOT_RUN','native_execution':'NOT_RUN','complete_inherited_oracles':'PARTIAL','cases':len(s.rows),'positive_cases':sum(x['valid'] for x in s.rows),'negative_cases':sum(not x['valid'] for x in s.rows),'guards_with_negative_ids':guards,'failures':s.failures,'case_results':s.rows}
    if args.output:Path(args.output).write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({k:v for k,v in result.items() if k not in ('case_results','guards_with_negative_ids')},indent=2))
    return bool(s.failures)
if __name__=='__main__':
    try:sys.exit(main())
    except Exception as exc:
        print(json.dumps({'status':'error','reason':str(exc),'type':type(exc).__name__}));sys.exit(2)
