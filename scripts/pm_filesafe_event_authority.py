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
import struct
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
    failures.extend(retention_binding_failures(family,graph['retention_policy_ref']))
    if graph['native_admission'] != 'unavailable_until_complete_owner_adoption': failures.append('admission_overclaim')
    return failures

def retention_binding_failures(family, policy):
    expected_retention = {
        'filesafe.destructive_override_granted': 'RP-AUTHORITY-INDEFINITE',
        'filesafe.policy_degraded': 'RP-OPERATIONAL-2555D',
    }.get(family, 'PENDING_RETENTION_DECISION')
    return ['retention_changed'] if policy != expected_retention else []

def real_admission(family):
    return 'missing_event_registration' if not any(r['event_type']==family for r in load('Plans/event_family_registry.json')['families']) else 'registered_requires_independent_depth'

def instant(value):
    return datetime.fromisoformat(value.replace('Z','+00:00'))

def decode_original(raw, codec):
    """Strict decoder for the closed integer/string/bool application record domain."""
    data=bytes.fromhex(raw)
    if codec=='RFC8785':
        from pm_projects_refresh_contracts import unique_object
        value=json.loads(data,object_pairs_hook=unique_object)
        if storage_owner().jcs_bytes(value)!=data:raise ValueError('noncanonical JSON')
        return value
    offset=0
    def take(n):
        nonlocal offset
        if offset+n>len(data):raise ValueError('torn MessagePack')
        result=data[offset:offset+n];offset+=n;return result
    def integer(n,signed=False):return int.from_bytes(take(n),'big',signed=signed)
    def read():
        tag=integer(1)
        if tag<128:return tag
        if tag>=224:return tag-256
        if tag in (192,194,195):return {192:None,194:False,195:True}[tag]
        if tag in range(204,208):return integer(2**(tag-204))
        if tag in range(208,212):return integer(2**(tag-208),True)
        if 160<=tag<=191:return take(tag-160).decode('utf-8')
        if tag in (217,218,219):return take(integer({217:1,218:2,219:4}[tag])).decode('utf-8')
        if 144<=tag<=159 or tag in (220,221):
            n=tag-144 if tag<160 else integer(2 if tag==220 else 4)
            return [read() for _ in range(n)]
        if 128<=tag<=143 or tag in (222,223):
            n=tag-128 if tag<144 else integer(2 if tag==222 else 4);result={}
            for _ in range(n):
                key=read()
                if not isinstance(key,str) or key in result:raise ValueError('duplicate/nonstring key')
                result[key]=read()
            return result
        raise ValueError('unsupported MessagePack type')
    value=read()
    if offset!=len(data) or storage_owner().canonical_messagepack_bytes(value)!=data:
        raise ValueError('noncanonical MessagePack')
    return value


def application_original_failures(family, candidate, bank):
    graph,validator=context(family);source=candidate['source'];req=source['original_request']
    records=source['application_records'];p=candidate['event']['payload'];failures=[]
    def require(ok,code):
        if not ok:failures.append('application_'+code)
    members={v['role']:v for v in source['body_members']}
    decoded={}
    schema=load(f'Plans/filesafe_event_sources/{family.replace(".","_")}.schema.json')
    for role,fragment in graph['application_body_roots'].items():
        member=members.get(role)
        if member is None:failures.append('application_body_role');continue
        try:
            value=decode_original(bank['bodies'][member['ref']],graph['application_body_codecs'][role])
            selected=Draft202012Validator({'$ref':schema['$id']+fragment},
                registry=validator('materialization')._registry,format_checker=FormatChecker())
            if role.endswith('request'):
                # Addressing fields are outside the original request-byte preimage.
                expected={k:v for k,v in req.items() if k not in ('original_input_ref','original_input_sha256')}
                checked={**value,'original_input_ref':req['original_input_ref'],'original_input_sha256':req['original_input_sha256']}
            else:expected=records[role];checked=value
            require(not list(selected.iter_errors(checked)),'body_schema:'+role)
            require(value==expected,'body_value:'+role);decoded[role]=value
        except (KeyError,ValueError,TypeError,UnicodeError,struct.error):
            failures.append('application_body_decode:'+role)
    if len(decoded)!=len(graph['application_body_roots']):return failures
    def digest(value):return hashlib.sha256(storage_owner().jcs_bytes(value)).hexdigest()
    manifests=[records[k] for k in records if 'manifest' in k and records[k] is not None]
    inventory=records['snapshot_blobs'];blobs=inventory['blobs']
    require(len({v['payload_id'] for v in blobs})==len(blobs),'blob_inventory_unique')
    for record in records.values():
        if record is not None:
            require(record['scope']==req['scope'] and record['execution_context']==req['execution_context'],'record_context')
    for manifest in manifests:
        entries=manifest['entries'];paths=[e['identity']['canonical_absolute_path'] for e in entries]
        require(paths==sorted(set(paths),key=lambda x:x.encode('utf-8')),'manifest_path_order')
        require(manifest['entry_count']==len(entries),'manifest_entry_count')
        require(manifest['total_bytes']==sum(e['length'] for e in entries if e['present']),'manifest_total_bytes')
        scm=manifest['scm']
        if scm is not None:
            require(scm['worktree_path']==req['execution_context']['working_directory']
                and scm['index_state_sha256']==digest(scm['index_entries']),'manifest_scm')
        for entry in entries:
            identity=entry['identity'];ctx=req['execution_context'];path=identity['canonical_absolute_path']
            require(all(identity[k]==ctx[k] for k in ('root_id','root_generation','host_id','environment_id')),'entry_context')
            # Synthetic lexical boundary. Native realpath/reparse/CAS checks stay NOT_RUN.
            root=ctx['working_directory'].rstrip('/\\')
            require(path.startswith(root+'/') and '..' not in path.split('/') and '/.git/' not in path,'entry_root')
            require(not entry['ignored'] or entry['authorized_write_set'],'ignored_scope')
            if entry['present'] and entry['kind']=='file':
                matches=[v for v in blobs if v['payload_id']==entry['payload_id']]
                require(len(matches)==1,'manifest_blob_inventory')
                if matches:
                    blob=matches[0];raw=bank['bodies'].get(blob['ref'])
                    try:body=bytes.fromhex(raw)
                    except (TypeError,ValueError):body=None
                    require(body is not None and len(body)==blob['length']==entry['length']
                        and hashlib.sha256(body).hexdigest()==blob['sha256']==entry['blob_sha256'],'blob_value')
                    require(bank.get('payloads',{}).get(blob['payload_id'])==raw,'payload_store_selection')
            elif entry['kind']=='symlink' and entry['present']:
                require(entry['symlink_target_hex'] is not None and entry['payload_id'] is None,'symlink_value')
            else:require(entry['payload_id'] is None,'nonfile_payload')
    referenced={e['payload_id'] for mf in manifests for e in mf['entries'] if e['payload_id'] is not None}
    require(referenced=={b['payload_id'] for b in blobs},'complete_blob_inventory')
    sp=records['safe_point_record'];mf=records['snapshot_manifest'];mh=digest(mf)
    require(sp['safe_point_id']==p['safe_point_id'] and sp['run_id']==p['run_id']
        and sp['node_id'] is None and sp['attempt_id'] is None
        and sp['worktree_path']==req['execution_context']['working_directory'],'safe_point_subject')
    require(sp['snapshot_manifest_ref']==members['snapshot_manifest']['ref']
        and sp['snapshot_manifest_sha256']==mh==sp['content_state_sha256']
        and sp['entry_count']==mf['entry_count'] and sp['total_bytes']==mf['total_bytes']
        and sp['snapshot_format_version']==mf['snapshot_format_version']
        and sp['content_scope_version']==mf['content_scope_version'] and sp['scm']==mf['scm'],'safe_point_manifest')
    if family=='safe_point.created':
        require(all(sp[k]==p[k] for k in ('baseline_ref','replan_generation','snapshot_format_version','content_scope_version','snapshot_manifest_ref','snapshot_manifest_sha256','content_state_sha256','capture_status')),'capture_result')
        require(sp['capture_operation_id']==req['operation_id'] and sp['created_at_utc']==p['ts'] and sp['created_by_actor_ref']==req['actor_ref'],'capture_origin')
        fields=('worktree_id','worktree_path','branch_name','HEAD_sha')
        require((mf['scm'] is None and not any(k in p for k in fields)) or
            (mf['scm'] is not None and all(mf['scm'][k]==p.get(k) for k in fields)),'capture_scm')
    else:
        tx=records['restore_transaction'];eq=records['equality_result'];pre=records['pre_restore_manifest'];post=records['post_restore_manifest']
        preh=digest(pre);posth=digest(post) if post is not None else None
        require(all(tx.get(k)==p.get(k) for k in ('safe_point_id','restore_transaction_id','run_id','node_id','attempt_id','restore_outcome','target_state_sha256','pre_restore_state_sha256','post_restore_state_sha256','conflict_reason_code','recovered_after_restart')),'transaction_result')
        require(tx['canonical_safe_point_key']=='application@1:'+req['scope']['server_id'].encode().hex()+':'+p['safe_point_id'].encode().hex(),'safe_point_key')
        require(tx['target_manifest_ref']==members['snapshot_manifest']['ref'] and tx['pre_restore_manifest_ref']==members['pre_restore_manifest']['ref']
            and tx['target_manifest_sha256']==tx['target_state_sha256']==mh
            and tx['pre_restore_manifest_sha256']==tx['pre_restore_state_sha256']==preh
            and tx['post_restore_state_sha256']==posth,'transaction_manifest')
        require(eq['restore_transaction_id']==tx['restore_transaction_id'] and eq['safe_point_id']==tx['safe_point_id']
            and eq['target_manifest_sha256']==mh and eq['pre_restore_manifest_sha256']==preh
            and eq['post_restore_manifest_sha256']==posth,'equality_subject')
        require(eq['scm_equal_target']==(post is not None and post['scm']==mf['scm'])
            and eq['scm_equal_pre_restore']==(post is not None and post['scm']==pre['scm']),'equality_scm')
        require(set(sp['hold_refs']).issubset(tx['hold_refs']) and eq['hold_refs']==tx['hold_refs']
            and eq['fence_active']==tx['fence_active'] and eq['path_mutation_count']==tx['path_mutation_count'],'hold_join')
        ops=tx['operations'];op_paths=[o['identity']['canonical_absolute_path'] for o in ops]
        require(len({o['operation_id'] for o in ops})==len(ops) and len(set(op_paths))==len(op_paths)
            and op_paths==sorted(op_paths,key=lambda x:x.encode('utf-8')),'operation_order')
        before={e['identity']['canonical_absolute_path']:e for e in pre['entries']};target={e['identity']['canonical_absolute_path']:e for e in mf['entries']}
        require({k for k in before.keys()|target.keys() if before.get(k)!=target.get(k)}.issubset(op_paths),'operation_coverage')
        for op in ops:
            path=op['identity']['canonical_absolute_path'];b=before.get(path);t=target.get(path)
            require((b or t) is not None and op['identity']==(t or b)['identity']
                and op['expected_before_sha256']==(b['blob_sha256'] if b else None)
                and op['target_sha256']==(t['blob_sha256'] if t else None)
                and op['expected_before_type']==(b['kind'] if b else None)
                and op['target_type']==(t['kind'] if t else None),'operation_subject')
            require((op['operation_kind'] not in ('create','replace') or bool(op['stage_ref']))
                and (op['operation_kind']!='delete' or bool(op['tombstone_ref'])),'operation_staging')
        require(tx['operation_cursor']<=len(ops) and tx['path_mutation_count']<=len(ops)
            and bool(tx['mutation_lease_ref']) and tx['updated_at_utc']==p['ts']
            and (tx['restart_count']>0)==p['recovered_after_restart'],'journal_cursor_lease')
        outcome=p['restore_outcome'];phase=tx['phase'];count=tx['path_mutation_count']
        valid={
            'restored_clean':phase=='committed' and posth==mh and eq['scm_equal_target'] and tx['operation_cursor']==len(ops),
            'restore_failed':phase=='rolled_back' and posth==preh and eq['scm_equal_pre_restore'],
            'restore_skipped':phase=='committed' and mh==preh==posth and count==0,
            'restore_refused':phase=='rolled_back' and posth==preh and count==0,
            'restore_recovery_required':phase=='recovery_required' and tx['fence_active'] and bool(tx['hold_refs']) and posth not in (mh,preh),
        }
        require(valid.get(outcome,False),'outcome_equality')
        require(tx['fence_active']==(outcome=='restore_recovery_required'),'outcome_fence')
        if outcome in ('restored_clean','restore_failed'):
            state='applied' if outcome=='restored_clean' else 'rolled_back'
            require(all(o['state']==state for o in ops) and tx['operation_cursor']==len(ops),'outcome_operations')
        if outcome in ('restore_skipped','restore_refused'):
            require(tx['operation_cursor']==0 and all(o['state']=='pending' for o in ops),'no_mutation_operations')
    return failures

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
    roles=graph.get('application_required_body_roles',graph['required_body_roles']) if scope['scope_kind']=='application' else graph['required_body_roles']
    require(sorted(m['role'] for m in members)==sorted(roles),'body_role_set')
    for member in members+[{'ref':req['original_input_ref'],'sha256':req['original_input_sha256']}]:
        raw=bank['bodies'].get(member['ref'])
        require(isinstance(raw,str) and hashlib.sha256(bytes.fromhex(raw)).hexdigest()==member['sha256'],'original_body_missing_or_changed')
    if family in ('filesafe.destructive_override_granted','filesafe.destructive_override_requested','safe_point.created','safe_point.restored'):
        require(all(ctx[k] for k in ('thread_id','run_id','root_id','root_generation','working_directory')),'effect_context_required')
    if scope['scope_kind']=='application' and family.startswith('safe_point.'):
        require(p['node_id'] is None and p['attempt_id'] is None,'application_orchestrator_ids')
        failures.extend(application_original_failures(family,candidate,bank))
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

def issued_failures(family, value, expected):
    """Resolve complete issued authority without reopening disposed domain controls."""
    if not isinstance(value, dict) or set(value) != {'event', 'custody'}:
        return ['issued_custody_missing']
    _, validator = context(family)
    if value != expected:
        return ['issued_original_changed']
    event, custody = value['event'], value['custody']
    schema = load(f'Plans/filesafe_event_sources/{family.replace(".","_")}.schema.json')
    # Validate the two exact imported roots, without requiring an original command/grant.
    for key in ('event', 'custody'):
        selected = Draft202012Validator(schema['$defs']['materialization']['properties'][key],
            registry=validator('materialization')._registry, format_checker=FormatChecker())
        if list(selected.iter_errors(value[key])): return ['issued_schema']
    if (custody['event_id'] != event['event_id'] or custody['event_type'] != family
        or custody['idempotency_key'] != event['idempotency_key']
        or custody['producer_semantic_digest'] != storage_owner().event_producer_semantic_digest(event)
        or custody['original_event_value_commitment']['sha256'] != full_commitment(event)
        or custody['first_append_receipt']['event_id'] != event['event_id']
        or custody['first_append_receipt']['sequence_id'] != event['sequence_id']
        or custody['first_append_receipt']['durability_state'] != 'synced'
        or custody['first_append_receipt']['durability_class'] != 'barrier'):
        return ['issued_full_value_receipt']
    return []


class ProtocolOracle:
    """Finite synthetic protocol traces. No filesystem/process or actual append."""
    def __init__(self,family,candidate,bank):
        self.family,self.original,self.bank=family,candidate,bank
        self.phase='empty';self.prepared=None;self.issued=None;self.receipt=None
        self.writer_fenced=False;self.reader_fenced=False;self.rebuilt=None
        self.domain_effects=0;self.original_owner_actions=0
        # Synthetic durable journal and independently selected retained-source boundary.
        # Neither is reconstructed from a retry candidate or the current issued map.
        self.durable={'phase':'empty','original':None,'pending':False,'recovery_refused':False}
        self.boundary=copy.deepcopy(bank['retained_boundary'])
        self.source_generation=bank['source_generation'];self.reader_generation=bank['reader_generation']
        self.crashed=False
    def resolve_issued(self):
        original=self.durable['original'] or self.original
        value=self.bank['issued'].get(original['event']['event_id'])
        expected={k:original[k] for k in ('event','custody')}
        return None if (self.bank['storage_instance_id']!=original['custody']['storage_instance_id']
            or issued_failures(self.family,value,expected)) else value
    def coverage_valid(self):
        return (self.bank['source_generation']==self.source_generation
            and set(self.bank['issued'])==set(self.boundary)
            and all(not issued_failures(self.family,self.bank['issued'].get(k),v)
                    for k,v in self.boundary.items()))
    def step(self,action,candidate=None):
        c=candidate or self.original
        if self.crashed and action not in ('crash','recover'):
            return 'recovery_required'
        if action=='owner_commit':
            if self.writer_fenced:return 'writer_fenced'
            if materialization_failures(self.family,c,self.bank):return 'source_unavailable'
            if self.phase!='empty':return 'already_committed'
            self.phase='owner_committed';self.original_owner_actions+=1
            self.durable.update(phase=self.phase,original=copy.deepcopy(c),pending=True)
            return self.phase
        if action=='prepare':
            if self.phase!='owner_committed':return 'body_commit_required'
            if self.durable['recovery_refused']:return 'recovery_fenced'
            self.prepared=copy.deepcopy(self.durable['original']['event']);self.phase='prepared'
            self.durable['phase']=self.phase;return self.phase
        if action=='append':
            if self.phase!='prepared':return 'prepared_event_required'
            if self.durable['recovery_refused']:return 'recovery_fenced'
            self.issued=copy.deepcopy(self.prepared);self.phase='appended'
            self.durable['phase']=self.phase;return self.phase
        if action=='receipt':
            if self.phase!='appended':return 'append_required'
            if self.durable['recovery_refused'] or materialization_failures(self.family,c,self.bank) or self.resolve_issued() is None:return 'receipt_unavailable'
            self.receipt=copy.deepcopy(self.resolve_issued()['custody']);self.phase='receipted'
            self.durable['phase']=self.phase;return self.phase
        if action=='terminal':
            if self.durable['recovery_refused']:return 'recovery_fenced'
            if self.receipt is None:return 'first_receipt_required'
            if self.resolve_issued() is None:return 'recovery_fenced'
            self.phase='terminal';self.durable.update(phase=self.phase,pending=False)
            return 'original_terminal'
        if action=='crash':
            self.phase=None;self.prepared=None;self.issued=None;self.receipt=None
            self.rebuilt=None
            self.crashed=True;return 'crashed_no_new_effect'
        if action=='recover':
            self.crashed=False;phase=self.durable['phase']
            original=self.durable['original'] or self.original
            issued=self.resolve_issued()
            failures=(issued is None if phase in ('receipted','terminal')
                      else bool(materialization_failures(self.family,original,self.bank)))
            if failures:
                self.durable['recovery_refused']=True
                return 'recovery_fenced'
            self.durable['recovery_refused']=False;self.phase=phase
            if phase in ('prepared','appended','receipted','terminal'):self.prepared=copy.deepcopy(original['event'])
            if phase in ('appended','receipted','terminal'):self.issued=copy.deepcopy(issued['event'])
            if phase in ('receipted','terminal'):self.receipt=copy.deepcopy(issued['custody'])
            return self.phase
        if action=='retry':
            if self.durable['recovery_refused']:return 'dedupe_unavailable'
            if self.durable['phase'] not in ('appended','receipted','terminal'):return 'original_pending'
            original=self.durable['original']['event']
            if storage_owner().event_producer_semantic_digest(c['event']) != storage_owner().event_producer_semantic_digest(original):return 'semantic_conflict'
            value=self.resolve_issued()
            if value is None:return 'dedupe_unavailable'
            if self.receipt is None:return 'resolve_original_first_receipt'
            return copy.deepcopy(value)
        if action=='withdraw_writer':self.writer_fenced=True;return 'writer_fenced'
        if action=='withdraw_reader':
            if not self.writer_fenced:return 'writer_cutoff_required'
            if self.durable['pending']:return 'pending_reconciliation_required'
            self.reader_fenced=True;return 'reader_fenced'
        if action=='rebuild':
            if not self.reader_fenced:return 'reader_fence_required'
            self.rebuilt=None
            if self.durable['pending'] or not self.coverage_valid():return 'survivor_verification_failed'
            self.rebuilt=copy.deepcopy(self.bank['issued']);return 'retained_survivors_verified'
        if action=='publish_reader':
            if (not self.reader_fenced or self.rebuilt is None
                or self.rebuilt != self.bank['issued'] or not self.coverage_valid()
                or self.bank['reader_generation']!=self.reader_generation):return 'verified_rebuild_required'
            self.bank['reader_generation']+=1;self.reader_generation+=1
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
        graph,_=context(family)
        for policy in ('PENDING_RETENTION_DECISION','RP-AUTHORITY-INDEFINITE','RP-OPERATIONAL-2555D'):
            if policy!=graph['retention_policy_ref'] and not retention_binding_failures(family,policy):
                failures.append(family+':wrong_retention_assignment_accepted')
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
            protocol_base=row['positive'][case.get('positive_index',0)]
            candidate,bank=copy.deepcopy((protocol_base['candidate'],protocol_base['bank']));oracle=ProtocolOracle(family,candidate,bank)
            for step in case['steps']:
                if 'edit' in step:
                    edit=step['edit'];mutate(candidate if edit['target']=='candidate' else bank,edit['path'],edit.get('value'),edit.get('remove',False));continue
                result=oracle.step(step['action'],candidate)
                expected=step['expected']
                if expected=='ORIGINAL_FULL_RESULT':expected={k:protocol_base['candidate'][k] for k in ('event','custody')}
                if result!=expected:failures.append(case['id']+':'+step['action']+':'+str(result))
            if oracle.domain_effects!=0 or oracle.original_owner_actions>1:failures.append(case['id']+':replayed_effect')
            counts[family]['protocol']+=1
    return {'status':'fail' if failures else 'pass','families':counts,'failures':failures,'native_execution':'NOT_RUN','membership':'ABSENT','authority':'synthetic contract cases only'}

if __name__=='__main__':
    result=check();print(json.dumps(result,indent=2));raise SystemExit(result['status']!='pass')
