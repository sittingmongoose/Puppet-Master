#!/usr/bin/env python3
"""Read-only prepared FileSafe source/envelope/receipt and protocol oracles.

Synthetic owner banks model independent original custody. They are not native
acceptance evidence. Real registry admission remains absent, native NOT_RUN.
"""
from __future__ import annotations
import copy
import hashlib
import importlib.util
import json
from functools import lru_cache
from pathlib import Path
from urllib.parse import urljoin
from datetime import datetime
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012
import pm_filesafe_event_contracts as payload_owner
from pm_projects_refresh_contracts import semantic_hash

ROOT = Path(__file__).resolve().parents[1]
FAMILIES = (
    'filesafe.command_denied', 'filesafe.destructive_override_denied',
    'filesafe.destructive_override_granted', 'filesafe.destructive_override_requested',
    'filesafe.guard_init_failed', 'filesafe.path_denied', 'filesafe.policy_degraded',
    'safe_point.created', 'safe_point.restored',
)
STAGES = ('original_intent', 'body_commit', 'prepared_event', 'append',
          'first_receipt', 'terminal_publication', 'history_read',
          'backup_restore', 'withdrawal', 'retention_release')

def load(path):
    return json.loads((ROOT/path).read_text())

@lru_cache(maxsize=1)
def storage_owner():
    path = ROOT/'scripts/pm-implementation-readiness.py'
    spec = importlib.util.spec_from_file_location('filesafe_case_l_oracle',path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def full_commitment(event):
    return hashlib.sha256(storage_owner().canonical_messagepack_bytes([
        'pm.storage.original_event_value_commitment.v1','1.0.0',
        'pm.seglog_frame_v2.event_value.canonical_msgpack.v1',
        event['schema_id'], event['schema_version'], event])).hexdigest()

def source_commitment(source):
    record = {k:v for k,v in source.items() if k != 'accepted_source_sha256'}
    request=source['original_request']
    preimage = {'schema_id':source['schema_id'],'schema_version':source['schema_version'],
                'scope':request['scope'],'semantic_record':record,
                'immutable_identity':{'source_ref':source['source_ref'],
                    'storage_instance_id':source['storage_instance_id'],
                    'operation_id':request['operation_id']}}
    if request['scope']['scope_kind'] == 'application':
        return semantic_hash('accepted_source',preimage)
    return hashlib.sha256(storage_owner().canonical_messagepack_bytes(preimage)).hexdigest()

@lru_cache(maxsize=None)
def context(family):
    slug=family.replace('.','_')
    graph=load(f'Plans/filesafe_event_sources/{slug}.contract.json')
    docs={row['path']:load(row['path']) for row in graph['resources']}
    shared=docs['Plans/shared_integration_runtime.schema.json']
    registry=Registry()
    for row in graph['resources']:
        path=row['path'];doc=docs[path]
        resource=Resource.from_contents(doc,default_specification=DRAFT202012)
        registry=registry.with_resource(row['uri'],resource)
        registry=registry.with_resource('https://puppetmaster.local/'+path,resource)
    # Legacy opaque shared $id is resolved literally and relative to each payload realm.
    for row in graph['resources']:
        registry=registry.with_resource(urljoin(row['uri'],shared['$id']),Resource.from_contents(shared))
    schema=docs[f'Plans/filesafe_event_sources/{slug}.schema.json']
    def validator(root):
        return Draft202012Validator({'$ref':schema['$id']+'#/$defs/'+root},registry=registry,format_checker=FormatChecker())
    return graph,validator

def graph_failures(family):
    graph,validator=context(family)
    failures=[]
    if graph['event_type'] != family: failures.append('graph_family')
    value={k:v for k,v in graph.items() if k!='graph_sha256'}
    if semantic_hash('source_graph',value) != graph['graph_sha256']: failures.append('graph_hash')
    if tuple(s['role'] for s in graph['ordered_stages']) != STAGES: failures.append('stage_order')
    if [s['ordinal'] for s in graph['ordered_stages']] != list(range(len(STAGES))): failures.append('stage_ordinals')
    if len(graph['methods']) != 2: failures.append('method_count')
    for kind,method in zip(('project','application'),graph['methods']):
        expected=f'owner.filesafe.{family.replace(".","_")}.original_source.{kind}@1.0.0'
        if method['interface_id'] != expected or method['component'] != graph['producer']: failures.append('method_binding')
        if method['adoption_disposition'] != 'specified_unimplemented': failures.append('native_adoption_overclaim')
        for key in ('input_root_ref','output_root_ref'):
            path,fragment=method[key].split('#')
            node=load(path)
            for part in fragment.strip('/').split('/'): node=node[part]
            Draft202012Validator.check_schema(node)
    for row in graph['resources']+graph['preserved_project_resources']:
        if hashlib.sha256((ROOT/row['path']).read_bytes()).hexdigest() != row['sha256']: failures.append('resource_hash:'+row['path'])
    for row in graph['resources']:
        doc=load(row['path']);Draft202012Validator.check_schema(doc)
        if doc.get('$id',row['uri']) != row['uri']: failures.append('resource_uri')
    if graph['retention_policy_ref'] != 'PENDING_RETENTION_DECISION': failures.append('retention_changed')
    if graph['native_admission'] != 'unavailable_until_complete_owner_adoption': failures.append('admission_overclaim')
    return failures

def real_admission(family):
    return 'missing_event_registration' if not any(r['event_type']==family for r in load('Plans/event_family_registry.json')['families']) else 'registered_requires_independent_depth'

def instant(value):
    return datetime.fromisoformat(value.replace('Z','+00:00'))

def materialization_failures(family, candidate, bank):
    graph,validator=context(family)
    if list(validator('materialization').iter_errors(candidate)): return ['materialization_schema']
    source,event,custody=(candidate[k] for k in ('source','event','custody'))
    p=event['payload'];req=source['original_request'];scope=req['scope'];ctx=req['execution_context']
    if list(validator('Result').iter_errors(p)): return ['payload_schema']
    failures=[]
    def require(condition,code):
        if not condition: failures.append(code)
    # Independently selected immutable source, not self-authentication by its hash.
    require(bank['sources'].get(source['source_ref'])==source,'original_source_not_selected')
    require(source['storage_instance_id']==bank['storage_instance_id'] and source['writer_epoch']==bank['writer_epoch'],'original_owner_epoch')
    require(source_commitment(source)==source['accepted_source_sha256'],'source_commitment')
    require(source['original_result']==p,'original_result_join')
    require(event['event_type']==family,'family_join')
    slug=family.replace('.','_')
    require(event['payload_schema_id']==load(f'Plans/event_payloads/{slug}_v2.schema.json')['$id'],'payload_selector')
    require(payload_owner.semantic(p),'payload_semantics')
    require(req['scope']==p['scope'] and req['execution_context']==p['execution_context'] and req['operation_id']==p['operation_id'],'request_context_join')
    for k in graph['request_payload_joins']:
        require(req.get(k)==p.get(k),'request_subject_join:'+k)
    require(event['scope_kind']==scope['scope_kind'] and event['project_id']==scope['project_id'],'envelope_scope')
    for key in ('thread_id','run_id'):
        require(event[key]==ctx[key],'envelope_'+key)
    for key in ('node_id','attempt_id'):
        require(event[key]==p.get(key),'envelope_'+key)
    require(event['actor_ref']==req['actor_ref'],'envelope_actor')
    require(event['occurred_at_utc']==p['ts'],'envelope_original_timestamp')
    require(event['correlation_id']==req['operation_id'],'envelope_operation')
    require(event['redaction_profile']=='no_secrets' and event['payload_ref'] is None and event['replay_policy']=='dedupe_by_idempotency_key','envelope_read_policy')
    key,eid=payload_owner.identity(family,p)
    require((event['idempotency_key'],event['event_id'])==(key,eid),'envelope_identity')
    members=source['body_members']
    require(sorted(m['role'] for m in members)==sorted(graph['required_body_roles']),'body_role_set')
    for member in members+[{'ref':req['original_input_ref'],'sha256':req['original_input_sha256']}]:
        raw=bank['bodies'].get(member['ref'])
        require(isinstance(raw,str) and hashlib.sha256(bytes.fromhex(raw)).hexdigest()==member['sha256'],'original_body_missing_or_changed')
    if family in ('filesafe.destructive_override_granted','filesafe.destructive_override_requested','safe_point.created','safe_point.restored'):
        require(all(ctx[k] for k in ('thread_id','run_id','root_id','root_generation','working_directory')),'effect_context_required')
    if scope['scope_kind']=='application' and family.startswith('safe_point.'):
        require(p['node_id'] is None and p['attempt_id'] is None,'application_orchestrator_ids')
    if family=='filesafe.destructive_override_granted':
        granted=p['authorized_scope'];requested=req['requested_scope']
        require(payload_owner.override_scope_semantic(requested,p) and payload_owner.override_subset(granted,requested),'grant_subset')
        require(instant(p['issued_at']) < instant(p['expires_at']) <= instant(req['maximum_expires_at']),'grant_expiry')
        require(instant(p['ts']) <= instant(p['expires_at']),'grant_expired_at_issue')
    if 'native_project_record' in source:
        original=source['native_project_record']
        require(original['project_id']==scope['project_id'],'original_project_scope')
        for key in graph['original_project_joins']:
            expected=scope['project_id'] if key=='project_id' else p.get(key)
            require(original.get(key)==expected,'original_project_subject:'+key)
        role=next(m for m in members if m['role']==graph['original_project_body_role'])
        raw=bank['bodies'].get(role['ref'])
        require(isinstance(raw,str) and bytes.fromhex(raw)==storage_owner().canonical_messagepack_bytes(original),'original_project_body_value')
        if family=='safe_point.created':
            require(original['created_at_utc']==p['ts'] and original['created_by_actor_ref']==req['actor_ref'],'original_capture_actor_time')
    if family=='safe_point.created':
        fields=('worktree_id','worktree_path','branch_name','HEAD_sha')
        require(not any(k in p for k in fields) or all(p.get(k) for k in fields),'partial_worktree')
        # Independent manifest metadata in the synthetic owner bank, not event declarations.
        require(bank['manifests'].get(source['source_ref'])=={k:p.get(k) for k in fields+('snapshot_manifest_ref','snapshot_manifest_sha256','content_state_sha256')},'manifest_identity')
    if family=='filesafe.policy_degraded':require(p['authoritative_enforcement_intact'] is True,'enforcement_not_intact')
    require(custody['storage_instance_id']==source['storage_instance_id'],'receipt_storage')
    for k in ('event_id','event_type','idempotency_key'):
        require(custody[k]==event[k],'receipt_'+k)
    require(custody['scope_partition']==scope['scope_partition'],'receipt_partition')
    require(custody['producer_semantic_digest']==storage_owner().event_producer_semantic_digest(event),'receipt_semantic_digest')
    require(custody['original_event_value_commitment']['sha256']==full_commitment(event),'receipt_full_value')
    receipt=custody['first_append_receipt']
    require(receipt['event_id']==event['event_id'] and receipt['sequence_id']==event['sequence_id'],'receipt_sequence')
    require(receipt['durability_class']=='barrier' and receipt['durability_state']=='synced','receipt_durability')
    require(bank['issued'].get(event['event_id'])=={'event':event,'custody':custody},'original_issued_custody')
    return failures

class ProtocolOracle:
    """Finite synthetic protocol traces. No filesystem/process or actual append."""
    def __init__(self,family,candidate,bank):
        self.family,self.original,self.bank=family,candidate,bank
        self.phase='empty';self.prepared=None;self.issued=None;self.receipt=None
        self.writer_fenced=False;self.reader_fenced=False;self.rebuilt=None
        self.domain_effects=0;self.original_owner_actions=0
    def step(self,action,candidate=None):
        c=candidate or self.original
        if action=='owner_commit':
            if self.writer_fenced:return 'writer_fenced'
            if materialization_failures(self.family,c,self.bank):return 'source_unavailable'
            if self.phase!='empty':return 'already_committed'
            self.phase='owner_committed';self.original_owner_actions+=1;return self.phase
        if action=='prepare':
            if self.phase!='owner_committed':return 'body_commit_required'
            self.prepared=copy.deepcopy(c['event']);self.phase='prepared';return self.phase
        if action=='append':
            if self.phase!='prepared':return 'prepared_event_required'
            self.issued=copy.deepcopy(self.prepared);self.phase='appended';return self.phase
        if action=='receipt':
            if self.phase!='appended':return 'append_required'
            if materialization_failures(self.family,c,self.bank):return 'receipt_unavailable'
            self.receipt=copy.deepcopy(c['custody']);self.phase='receipted';return self.phase
        if action=='terminal':
            if self.receipt is None:return 'first_receipt_required'
            self.phase='terminal';return 'original_terminal'
        if action=='crash':return 'crashed_no_new_effect'
        if action=='recover':
            # All intact original phases survive; uncertain/old-backup source is unavailable.
            if materialization_failures(self.family,c,self.bank):return 'recovery_fenced'
            return self.phase
        if action=='retry':
            if self.issued is None:return 'original_pending'
            if storage_owner().event_producer_semantic_digest(c['event']) != storage_owner().event_producer_semantic_digest(self.issued):return 'semantic_conflict'
            if self.issued['event_id'] not in self.bank['issued']:return 'dedupe_unavailable'
            if self.receipt is None:return 'resolve_original_first_receipt'
            return {'event':copy.deepcopy(self.issued),'custody':copy.deepcopy(self.receipt)}
        if action=='withdraw_writer':self.writer_fenced=True;return 'writer_fenced'
        if action=='withdraw_reader':
            if not self.writer_fenced:return 'writer_cutoff_required'
            if self.prepared and not self.receipt:return 'pending_reconciliation_required'
            self.reader_fenced=True;return 'reader_fenced'
        if action=='rebuild':
            if not self.reader_fenced:return 'reader_fence_required'
            # Full survivor set, not a guessed empty cursor or caller-chosen rows.
            for survivor in self.bank['issued'].values():
                sources=[s for s in self.bank['sources'].values() if s['original_result']==survivor['event']['payload']]
                if len(sources)!=1 or materialization_failures(self.family,{'source':sources[0],**survivor},self.bank):return 'survivor_verification_failed'
            self.rebuilt=copy.deepcopy(self.bank['issued']);return 'retained_survivors_verified'
        if action=='publish_reader':
            if self.rebuilt != self.bank['issued']:return 'verified_rebuild_required'
            self.reader_fenced=False;return 'reader_generation_published'
        if action=='read':
            if self.reader_fenced:return 'reader_unavailable'
            if materialization_failures(self.family,c,self.bank):return 'read_unavailable'
            return 'original_history_no_effect'
        raise ValueError('unknown action '+action)

def mutate(document,path,value,remove=False):
    parts=path.split('/')[1:];node=document
    for part in parts[:-1]:node=node[int(part)] if isinstance(node,list) else node[part]
    key=int(parts[-1]) if isinstance(node,list) else parts[-1]
    if remove:del node[key]
    else:node[key]=copy.deepcopy(value)

def check():
    pack=load('Plans/filesafe_event_authority_fixtures.json');failures=[];counts={}
    if tuple(r['event_type'] for r in pack['families'])!=FAMILIES:failures.append('fixture_family_census')
    for row in pack['families']:
        family=row['event_type'];counts[family]={'positive':0,'negative':0,'protocol':0}
        failures += [family+':'+f for f in graph_failures(family)]
        if real_admission(family)!='missing_event_registration':failures.append(family+':membership_changed')
        for case in row['positive']:
            found=materialization_failures(family,case['candidate'],case['bank'])
            if found:failures.append(case['id']+':'+','.join(found))
            counts[family]['positive']+=1
        base=row['positive'][0]
        for case in row['negative']:
            negative_base=row['positive'][case.get('positive_index',0)]
            candidate,bank=copy.deepcopy((negative_base['candidate'],negative_base['bank']))
            for edit in case['edits']:
                mutate(candidate if edit['target']=='candidate' else bank,edit['path'],edit.get('value'),edit.get('remove',False))
            found=materialization_failures(family,candidate,bank)
            if not found:failures.append(case['id']+':negative_accepted')
            if case.get('expected_error') and case['expected_error'] not in found:failures.append(case['id']+':wrong_error:'+','.join(found))
            counts[family]['negative']+=1
        for case in row['protocol']:
            candidate,bank=copy.deepcopy((base['candidate'],base['bank']));oracle=ProtocolOracle(family,candidate,bank)
            for step in case['steps']:
                if 'edit' in step:
                    edit=step['edit'];mutate(candidate if edit['target']=='candidate' else bank,edit['path'],edit.get('value'),edit.get('remove',False));continue
                result=oracle.step(step['action'],candidate)
                expected=step['expected']
                if expected=='ORIGINAL_FULL_RESULT':expected={'event':base['candidate']['event'],'custody':base['candidate']['custody']}
                if result!=expected:failures.append(case['id']+':'+step['action']+':'+str(result))
            if oracle.domain_effects!=0 or oracle.original_owner_actions>1:failures.append(case['id']+':replayed_effect')
            counts[family]['protocol']+=1
    return {'status':'fail' if failures else 'pass','families':counts,'failures':failures,'native_execution':'NOT_RUN','membership':'ABSENT','authority':'synthetic contract cases only'}

if __name__=='__main__':
    result=check();print(json.dumps(result,indent=2));raise SystemExit(result['status']!='pass')
