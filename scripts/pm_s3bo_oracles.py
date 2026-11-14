"""PNC-019 s3bo: bounded executable contract oracles, not native execution.

The complete checker projects raw operands (or the named shared validator's
result) into <=8-row tables. The table predicates are its actual decisions.
Source, stored event, receipt, retained store and presented copies are distinct.
No source is reconstructed while reading. See ATS-2206 for claim boundaries.
"""
import base64
import copy
import hashlib
import importlib
import json
import re
from pathlib import Path

from jsonschema import Draft202012Validator
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012
from pm_event_datetime import date_time, format_checker, EVENT_RECORD, STORAGE_UTC_Z
from pm_event_numbers import (
    Refusal, current_integer, storage_uint64, loads_current_json,
    producer_semantic_bytes, producer_semantic_digest, storage_value_bytes, full_value_commitment,
    EVENT_VALUE, RecipeTuple, OriginalBinding, OriginalCustody, FrozenRecipe,
    RetainedDispatcher,
)

ROOT = Path(__file__).resolve().parents[1]
BASE_GRADE = 'reports/event-authority-20261114/depth-s3b-registered-families.json'
FAMILIES = tuple(json.loads((ROOT / BASE_GRADE).read_text())['pass_counts'])
REGISTRY = json.loads((ROOT / 'Plans/event_family_registry.json').read_text())
FAMILY = {r['event_type']: r for r in REGISTRY['families'] if r['event_type'] in FAMILIES}
TIME = '2026-11-14T12:00:00Z'
STORE = '11111111-1111-4111-8111-111111111111'
SERVER = 'server-A'
PROJECT = 'project-A'
TOKEN_FIELDS = ('storage_instance_id', 'checkpoint_key', 'checkpoint_ref', 'generation_id',
                'generation_anchor_sha256', 'frontier_revision', 'frontier_sha256',
                'index_dataset_name', 'source_selection')
CATALOGS = {}


def read_json(path):
    return json.loads((ROOT / path).read_text())


def sha(data):
    return hashlib.sha256(data).hexdigest()


def lp(*values):
    return b''.join(len(v.encode()).to_bytes(8, 'big') + v.encode() for v in values)


def partition(project):
    return 'app' if project is None else 'project~' + base64.urlsafe_b64encode(project.encode()).decode().rstrip('=')


def schema_for(family):
    row = FAMILY[family]
    if 'payload_schema' in row:
        return row['payload_schema']
    spec = row['payload_schema_ref']
    node = read_json(spec['path'])
    for key in spec['json_pointer'].lstrip('#/').split('/'):
        if key:
            node = node[key]
    return node


def catalog(root):
    """Eagerly collect only the transitive owner resources; never retrieve URLs."""
    fingerprint=sha(json.dumps(root,sort_keys=True).encode())
    if fingerprint in CATALOGS:return CATALOGS[fingerprint]
    docs = {root['$id']: root}
    available = None
    while True:
        refs = set()
        def walk(node):
            if isinstance(node, dict):
                if '$ref' in node and not node['$ref'].startswith('#'):
                    refs.add(node['$ref'].split('#')[0])
                for child in node.values():
                    walk(child)
            elif isinstance(node, list):
                for child in node:
                    walk(child)
        for doc in tuple(docs.values()):
            walk(doc)
        missing = refs - docs.keys()
        if not missing:
            result=Registry().with_resources((uri, Resource.from_contents(doc,default_specification=DRAFT202012)) for uri, doc in docs.items())
            CATALOGS[fingerprint]=result
            return result
        if available is None:
            available = {}
            for path in (ROOT / 'Plans').glob('*.schema.json'):
                doc = json.loads(path.read_text())
                if '$id' in doc:
                    available[doc['$id']] = doc
                    available['https://puppetmaster.local/Plans/'+path.name] = doc
            for row in read_json('Plans/storage_value_registry.json')['families']:
                doc=row.get('value_schema',{})
                if '$id' in doc:available[doc['$id']]=doc
        for uri in missing:
            docs[uri] = available[uri]


VALIDATORS = {}


def validator(schema):
    key = sha(json.dumps(schema,sort_keys=True).encode())
    if key not in VALIDATORS:
        VALIDATORS[key] = Draft202012Validator(schema, registry=catalog(schema), format_checker=format_checker(profile=EVENT_RECORD))
    return VALIDATORS[key]


def schema_errors(schema, value):
    """All keywords retained, including not/allOf/oneOf/if/then/else/format.

    Do not stringify an offending arbitrary-precision number: the shared number
    guard precedes schemas, and errors are rendered by path/keyword only.
    """
    return [list(e.absolute_path) + [e.validator] for e in validator(schema).iter_errors(value)]


def sample(schema, root=None, name=''):
    """Fixture constructor only; no acceptance decision or source authority."""
    root = root or schema
    if '$ref' in schema:
        ref = schema['$ref']
        if ref.startswith('#'):
            target = root
            for key in ref.lstrip('#/').split('/'):
                target = target[key]
            return sample(target, root, name)
        uri, _, pointer = ref.partition('#')
        target = catalog(root).resolver().lookup(uri).contents
        for key in pointer.lstrip('/').split('/'):
            if key:
                target = target[key]
        return sample(target, target, name)
    if 'const' in schema:
        return copy.deepcopy(schema['const'])
    if 'enum' in schema:
        return copy.deepcopy(schema['enum'][0])
    if ('oneOf' in schema or 'anyOf' in schema) and 'properties' not in schema:
        return sample(schema.get('oneOf', schema.get('anyOf'))[0], root, name)
    kind = schema.get('type')
    if isinstance(kind, list):
        kind = kind[0]
    if kind == 'object' or 'properties' in schema:
        return {k: sample(schema.get('properties', {}).get(k, {}), root, k) for k in schema.get('required', [])}
    if kind == 'array':
        if 'prefixItems' in schema:
            return [sample(s, root, name) for s in schema['prefixItems']]
        return [sample(schema.get('items', {}), root, name) for _ in range(schema.get('minItems', 0))]
    if kind == 'integer':
        return schema.get('minimum', 0)
    if kind == 'number':
        return 0
    if kind == 'boolean':
        return True
    if kind == 'null':
        return None
    if schema.get('format') == 'date-time' or name.endswith('_at_utc'):
        return TIME
    pattern = schema.get('pattern', '')
    if '[0-9a-f]{64}' in pattern:
        prefix = pattern.split('[0-9a-f]')[0].lstrip('^')
        return prefix.replace('\\.', '.') + 'a' * 64
    if name == 'project_id':
        return PROJECT
    if name == 'storage_instance_id':
        return STORE
    if name == 'scope_partition':
        return partition(PROJECT)
    if name in ('type', 'event_type'):
        return 'test.event'
    if 'hash' in name or 'sha256' in name:
        return 'a' * 64
    return 'source-A'


def payload(family, project):
    result = sample(schema_for(family))
    if 'project_id' in schema_for(family).get('properties', {}):
        if project is None:
            result.pop('project_id', None)
        else:
            result['project_id'] = project
    if family == 'platform.capability_evaluated':
        result.update(requested_state='not_requested', effective_state='not_evaluated',
                      degradation_reason='none', resolution_source=None, selected_evidence_ref=None, evidence_refs=[])
        result['capability_ref']['capability_id'] = 'platform.test'
    if family == 'restore_point.corrupt':
        result.update(expected_hash='a' * 64, observed_hash='b' * 64)
    if family == 'safe_point.recovery_unavailable':
        result['allowed_action_ids'] = ['open_details','locate_and_verify_recovery','replan','abandon_recovery']
    if family == 'storage.boot_recovery':
        result['integrity_ids'] = ['pm.storage.integrity.v1:'+'a'*64]
        result['active_segment_ref'] = 'pm.storage.segment.v1:0:0:active:'+'a'*64
    if family == 'storage.recovery_applied':
        result['user_disclosure_required'] = False
    if family == 'storage.integrity_detected':
        result.update(impact_precision='exact_byte_range', affected_byte_range=[0, 8])
    return result


def identity(family, source, p):
    """Only recipes explicitly given by s3b; inherited recipes are not invented."""
    scope = partition(source['project_id'])
    if family == 'storage.deletion_lifecycle_changed':
        did = 'del_' + sha(lp('storage.deletion/request/v1', scope, source['request_key']))
        component = family + ':' + did + ':' + str(source['ordinal'])
        key = ('application@1:' if scope == 'app' else 'storage-deletion@1:') + SERVER.encode().hex() + ':' + component.encode().hex()
        eid = 'er_del_' + sha(lp('storage.deletion_lifecycle_changed/event/v1', STORE.encode().hex(), scope, component))
        return {'deletion_id': did, 'event_id': eid, 'idempotency_key': key}
    if family == 'storage.value_quarantine_changed':
        qid = 'qtn_' + sha(lp('storage.value_quarantine/detect/v1', STORE.encode().hex(), source['source_family_id'],
                             source['source_locator_ref'], source['raw_sha256'], str(source['occurrence'])))
        component = family + ':' + qid + ':' + p['state']
        key = ('application@1:' if scope == 'app' else 'storage-quarantine@1:') + SERVER.encode().hex() + ':' + component.encode().hex()
        return {'quarantine_id': qid, 'event_id': 'er_qtn_' + sha(lp('storage.value_quarantine_changed/event/v1', STORE.encode().hex(), scope, component)), 'idempotency_key': key}
    if family == 'restore_point.corrupt':
        digest = sha(lp('restore_point.corrupt/corrupt/v1', source['project_id'], p['restore_point_id']))
        return {'event_id': 'er_rpx_' + digest, 'idempotency_key': 'rpx_' + digest}
    if family == 'restore_point.applied':
        digest = sha(lp('restore_point.applied/apply/v1', source['project_id'], source['request_key']))
        return {'application_id':'rpa_'+digest, 'event_id':'er_rpa_'+digest,'idempotency_key':'rpa_'+digest}
    if family == 'safe_point.recovery_unavailable':
        digest = sha(lp('safe_point.recovery_unavailable/establish/v1', source['project_id'], source['anchor_id']))
        return {'event_id': 'er_sru_' + digest, 'idempotency_key': 'sru_' + digest}
    return {}


def semantic(event):
    return {k: v for k, v in event.items() if k not in ('sequence_id', 'observed_at_utc', 'persisted_at_utc')}


def caught(call, *args, **kw):
    try:
        call(*args, **kw)
    except Refusal as exc:
        return exc.reason
    return None


def timestamps(node, path=()):
    if isinstance(node, dict):
        for key, value in node.items():
            if isinstance(value, str) and (key.endswith('_at_utc') or key in ('ts', 'purge_deadline_utc')):
                yield path + (key,), value
            else:
                yield from timestamps(value, path + (key,))
    elif isinstance(node, list):
        for i, value in enumerate(node):
            yield from timestamps(value, path + (i,))


def integers(node, schema, root=None, path=()):
    root = root or schema
    if '$ref' in schema and schema['$ref'].startswith('#'):
        target = root
        for key in schema['$ref'].lstrip('#/').split('/'):
            target = target[key]
        yield from integers(node, target, root, path)
    elif '$ref' in schema:
        uri,_,pointer=schema['$ref'].partition('#')
        document=catalog(root).resolver().lookup(uri).contents
        target=document
        for key in pointer.lstrip('/').split('/'):
            if key:target=target[key]
        yield from integers(node,target,document,path)
    elif isinstance(node, dict):
        for key, value in node.items():
            yield from integers(value, schema.get('properties', {}).get(key, {}), root, path + (key,))
    elif isinstance(node, list):
        for i, value in enumerate(node):
            slots = schema.get('prefixItems', [])
            child = slots[i] if i < len(slots) else schema.get('items', {})
            if isinstance(child, dict):
                yield from integers(value, child, root, path + (i,))
    elif schema.get('type') == 'integer' or (isinstance(schema.get('type'),list) and 'integer' in schema['type'] and node is not None):
        yield path, node, schema


def patterns(node,schema,root=None,path=()):
    root=root or schema
    if '$ref' in schema:
        uri,_,pointer=schema['$ref'].partition('#')
        document=catalog(root).resolver().lookup(uri).contents if uri else root
        target=document
        for key in pointer.lstrip('/').split('/'):
            if key:target=target[key]
        yield from patterns(node,target,document,path)
    if isinstance(node,str) and 'pattern' in schema:
        yield path,node,schema['pattern']
    if isinstance(node,dict):
        for key,value in node.items():
            yield from patterns(value,schema.get('properties',{}).get(key,{}),root,path+(key,))
    elif isinstance(node,list):
        for i,value in enumerate(node):
            slots=schema.get('prefixItems',[])
            child=slots[i] if i<len(slots) else schema.get('items',{})
            if isinstance(child,dict):yield from patterns(value,child,root,path+(i,))


def pattern_errors(node,schema):
    return [list(path) for path,value,pattern in patterns(node,schema)
            if pattern.startswith('^') and pattern.endswith('$') and not pattern.endswith('\\$')
            and re.fullmatch(pattern,value) is None]


def build(family, project=None):
    policy = FAMILY[family]['scope_policy']
    if policy == 'project_only':
        project = PROJECT
    source = dict(project_id=project, request_key='request-A', ordinal=1, occurrence=1,
                  source_family_id='stored-family', source_locator_ref='locator-A', raw_sha256=sha(b'raw'),
                  anchor_id='anchor-A', thread_id='thread-A', command_digest=sha(b'command-A'))
    p = payload(family, project)
    ids = identity(family, source, p)
    for key in ('deletion_id', 'quarantine_id', 'application_id'):
        if key in ids:
            p[key] = ids[key]
    event = dict(schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project' if project else 'application',
                 event_id=ids.get('event_id', 'event-A'), event_type=family, project_id=project,
                 thread_id=None, run_id=None, node_id=None, attempt_id=None, actor_ref='actor-A',
                 requested_account_ref=None, effective_account_ref=None, occurred_at_utc=TIME,
                 observed_at_utc=TIME, persisted_at_utc=TIME, sequence_id=41, producer_sequence_id=None,
                 correlation_id='correlation-A', causation_event_id=None, parent_event_id=None,
                 idempotency_key=ids.get('idempotency_key', 'key-A'), payload_schema_id=FAMILY[family]['payload_schema_id'],
                 payload=p, payload_ref=None, redaction_profile='no_secrets', replay_policy='dedupe_by_idempotency_key',
                 migration={k: None for k in ('migrated_from_schema_id','migrated_from_schema_version','migration_id','compatibility_event_type')})
    if family == 'restore_point.applied':
        event['thread_id'] = p['new_thread_id']
    if family == 'safe_point.recovery_unavailable':
        event['run_id'], event['node_id'] = p['run_id'], p['node_id']
        p['receipt_ref'] = 'event_append_receipt_custody.v1:' + STORE + ':' + sha(event['event_id'].encode())
    if family == 'seglog.event_appended':
        p.update(seq=17, type='source.event', event_ref='original-event', segment_ref='segment-A')
    selection_schema=read_json('Plans/event_record_index_checkpoint.schema.json')
    selection=sample(selection_schema['$defs']['source_selection'],selection_schema)
    token = dict(zip(TOKEN_FIELDS, (STORE, 'event_record_index_checkpoint.v1:' + STORE, 'checkpoint-A',
                                  'eig_'+'c'*64, 'a'*64, 1, 'b'*64, 'event_record_index', selection)))
    physical = storage_value_bytes(event, profile=EVENT_VALUE)
    receipt = dict(event_id=event['event_id'], sequence_id=event['sequence_id'],
                   segment_generation=3,segment_name='seg-000003-00000000000000000041.active',
                   byte_offset=512,commit_group_id='group-A',durability_class='barrier',durable_end_offset=2304,
                   durability_state='synced',manifest_generation=17,acknowledged_at_utc=TIME)
    trace = ['source_capture', 'record_cas', 'barrier_append', 'first_receipt', 'publish']
    if family == 'storage.value_quarantine_changed':
        trace.insert(1, 'raw_fsync')
    if family == 'restore_point.applied':
        trace = ['reserve_ids','materialize','record_cas','barrier_append','first_receipt','publish']
    if family == 'restore_point.corrupt':
        trace.insert(1, 'filesafe_attest')
    result = dict(family=family, source=source, event=event, stored_event=copy.deepcopy(event),
                  receipt=receipt, full_value_sha256=full_value_commitment(event), original_receipt=copy.deepcopy(receipt), token=token, live_token=dict(token, redb_snapshot_id='snapshot-A'),
                  live_snapshot='snapshot-A', covered_sequences=[41], history=[copy.deepcopy(event)],
                  current_permission={'actor-A': ['read']}, viewer='actor-A', deleted_subjects=[],
                  pending_event=copy.deepcopy(event), native_before={'point':'source-record','thread':'thread-source',
                    'branch':'branch-source','worktree':'worktree-source','files':{'file-A':'original'},
                    'index':'index-source','queue':['queued-A'],'safe_points':['safe-A']},
                  native_after={}, trace=trace, effects=['publish'],
                  cas={'expected_revision': 1, 'actual_revision': 1}, emitter=EMITTERS[family],
                  retry_receipt=copy.deepcopy(receipt), retry_effects=[],
                  writer_cutoff=50, append_sequence=41, reader_version='active',
                  retained_ref='original-A', request_recipe=None,
                  source_selection=copy.deepcopy(selection), raw_export_surface='protected',
                  platform_marker_persisted=False)
    # Independently sealed immutable owner bytes. Read requests cannot add a receipt.
    result['sealed_store'] = {'original-A': [dict(event=copy.deepcopy(event), receipt=copy.deepcopy(receipt),
                                                recipe='s3bo-original-v1', resource_hash=source_resources_hash())]}
    result['read_store_before'] = copy.deepcopy(result['sealed_store'])
    result['native_after']=copy.deepcopy(result['native_before'])
    result['reference'] = {'seq':17, 'type':'source.event','event_ref':'original-event','segment_ref':'segment-A'}
    result['restore'] = {'session_opened': 10, 'accepted_at': 11, 'epoch': 2, 'operation_epoch': 2,
                         'identity':'new-operation', 'capability_identity':'new-operation',
                         'floor': {'status':'unavailable','revision':3},
                         'anchor_before':9, 'anchor_after':9}
    result['aftermath'] = {'receipt_sequence':41,'frontier_before':40,'frontier_after':41,
                            'generation_before':'generation-A','generation_after':'generation-B',
                            'checkpoint_owner':'projector.storage.event_record_index@1.0.0',
                            'action':'invalidate_and_rebuild','restart_effects':[]}
    result['record_history']=[]
    result['terminal_commits']=[]
    result['dedupe_store']={'key-A':{'request_digest':source['command_digest'],'receipt':copy.deepcopy(receipt)}}
    result['retry_key']='key-A'
    result['retry_request_digest']=source['command_digest']
    result['cutoff_trace']=['cutoff','drain','fence']
    result['read_effects']=[]
    result['persisted_read_outputs']={}
    result['prior_state']='initial'
    result['restore']['capability_digest']=source['command_digest']
    return result


EMITTERS = {
 'platform.capability_evaluated':'platform.capability_evaluation.v1',
 'restore_point.applied':'assistant_chat.restore_point_application.v1',
 'restore_point.corrupt':'assistant_chat.restore_point_corruption.v1',
 'restore_point.created':'assistant_chat.restore_point_creation.v1',
 'restore_point.expired':'storage.restore_point_expiry.v1',
 'safe_point.recovery_unavailable':'filesafe.recovery_unavailable.durability_unit.v1',
 'seglog.event_appended':'storage.seglog_append_observability_writer.v1',
 'storage.boot_recovery':'storage.boot_recovery.publish.v1',
 'storage.compaction_lifecycle_changed':'storage.compaction.owner.v1',
 'storage.deletion_lifecycle_changed':'storage.deletion_lifecycle.coordinator.v1',
 'storage.integrity_detected':'storage.integrity_detector.v1',
 'storage.recovery_applied':'StorageRecoveryCoordinator',
 'storage.retention_hold_changed':'storage.retention_hold.coordinator.v1',
 'storage.value_quarantine_changed':'storage.value_quarantine.coordinator.v1',
}


def source_resources_hash():
    return sha((ROOT / 'Plans/event_family_registry.json').read_bytes() + (ROOT / 'Plans/event_record.schema.json').read_bytes())


class SealedOwner:
    def __init__(self, store):
        self.store = store

    def authenticated_original(self, ref):
        rows = self.store.get(ref, [])
        if len(rows) != 1:
            raise Refusal('sealed_receipt_missing_or_ambiguous')
        row = rows[0]
        event = row['event']
        binding = original_binding(event)
        recipe = recipe_tuple(row['recipe'], row['resource_hash'])
        return OriginalCustody(binding, recipe, storage_value_bytes(event, profile=EVENT_VALUE),
                               b'original-result', storage_value_bytes(row['receipt'], profile=EVENT_VALUE))


def original_binding(event):
    return OriginalBinding(STORE, event['scope_kind'], SERVER, event['project_id'], event['event_type'],
                           event['event_id'], event['idempotency_key'], 'operation-A',
                           producer_semantic_digest(semantic(event)))


def recipe_tuple(recipe, resource_hash):
    return RecipeTuple('s3bo', '1.0.0', 'pm.event.v0', '2.0.0', 'payload', '1.0.0',
                       'event-record', recipe, 'cv317', EVENT_VALUE, 'cv339', 'source-v1',
                       'payload-v1', resource_hash)


def retained(case):
    """SP-1101 dispatch, recipe from the unique sealed receipt only.

    A missing/ambiguous/other-original/unknown-recipe receipt is unavailable.
    Verify byte/result/receipt/source commitments before current disclosure.
    The installed frozen recipe catalogue is separate from the selected row.
    """
    owner = SealedOwner(case['sealed_store'])
    event = case['stored_event']
    expected = original_binding(event)
    recipe = recipe_tuple('s3bo-original-v1',source_resources_hash())
    expected_bytes = storage_value_bytes(event, profile=EVENT_VALUE)
    expected_receipt = storage_value_bytes(case['original_receipt'], profile=EVENT_VALUE)
    def verify(original):
        return (original.record_bytes == expected_bytes and original.receipt_bytes == expected_receipt
                and original.result_bytes == b'original-result')
    dispatch = RetainedDispatcher(owner, {recipe: FrozenRecipe(verify)})
    return dispatch.resolve(case['retained_ref'], expected, recipe_override=case['request_recipe'],
                            disclose=lambda binding: True)


def quarantine_resolution_error(case):
    """E8-5: derive resolution from canonical state plus its original receipt.

    There is no resolved/fresh/verified flag. The fixture holds the canonical
    resolution event and the independently retained first-receipt record.
    Existing native source and DL-068 disposal obligations remain separate.
    """
    disposal=case['quarantine_disposal'];event=disposal['resolution_event']
    if event is None:return None
    if event['payload']['state'] not in ('migrated','rebuilt','reset_to_default','restored'):
        return 'resolution_state'
    if event['payload']['quarantine_id']!=case['event']['payload']['quarantine_id']:
        return 'resolution_subject'
    ids=identity(case['family'],case['source'],event['payload'])
    if event['event_id']!=ids['event_id'] or event['idempotency_key']!=ids['idempotency_key']:
        return 'resolution_identity'
    receipts=disposal['resolution_receipts'].get(event['event_id'],[])
    if len(receipts)!=1:return 'resolution_receipt_missing_or_ambiguous'
    row=receipts[0]
    if row['event']!=event:return 'resolution_event_join'
    if row['receipt']['event_id']!=event['event_id'] or row['receipt']['sequence_id']!=event['sequence_id']:
        return 'resolution_receipt_join'
    if row['full_value_sha256']!=full_value_commitment(event):return 'resolution_full_value'
    if row['receipt']['durability_class']!='barrier' or row['receipt']['durability_state']!='synced':
        return 'resolution_not_durable'
    effect=disposal['resolution_transition']
    if effect['to_state']!=event['payload']['state'] or event['event_id'] not in effect['event_refs']:
        return 'resolution_effect_join'
    if effect['input_sha256']!=case['source']['raw_sha256']:
        return 'resolution_effect_input'
    if effect['output_sha256']!=sha(bytes.fromhex(disposal['resolved_value_bytes_hex'])):
        return 'resolution_effect_output'
    for key in ('sequence_id','segment_generation','byte_offset','durable_end_offset','manifest_generation'):
        error=caught(storage_uint64,row['receipt'][key])
        if error:return error
    error=caught(date_time,effect['occurred_at_utc'],profile=EVENT_RECORD)
    if error:return error
    return caught(date_time,row['receipt']['acknowledged_at_utc'],profile=EVENT_RECORD)


# Each row is ONE invariant. 'error' operands are the complete output of the
# named shared/full-schema validator, not lane-authored acceptance flags.
ROWS = [
 ('envelope_schema','schema','error','EventRecord validates under its complete owner schema.'),
 ('payload_schema','schema','error','Payload validates against this exact registered owner schema, all keywords intact.'),
 ('integer_domain','numbers','error','Every schema integer slot uses current_integer with its owner bounds.'),
 ('storage_sequence','numbers','error','Storage sequence_id uses storage_uint64, independent of producer JCS.'),
 ('physical_value','numbers','error','The full stored EventRecord uses storage_value_bytes EVENT_VALUE.'),
 ('producer_jcs','numbers','error','Full producer projection uses producer_semantic_bytes before effects.'),
 ('source_time','datetime','error','Source timestamps use date_time EVENT_RECORD without normalization.'),
 ('storage_time','datetime','error','Observed and persisted times use date_time STORAGE_UTC_Z.'),
 ('ack_time','datetime','error','AppendReceipt acknowledged_at_utc uses EVENT_RECORD (E5-2).'),
 ('scope_partition','scope','equal','Partition is app or project~base64url of the exact project id.'),
 ('project_join','scope','equal','Envelope Project equals independently held source Project.'),
 ('payload_project','scope','equal','Payload Project agrees with source scope when present.'),
 ('application_key','identity','equal','Deletion/quarantine application or Project key uses its exact owner recipe.'),
 ('event_identity','identity','equal','Event ID recomputes from the original owner recipe where specified.'),
 ('subject_identity','identity','equal','Deletion/quarantine subject identity is computed from original source inputs.'),
 ('thread_join','identity','equal','Applied envelope thread is the reserved new thread, never the source thread.'),
 ('pending_copy','joins','equal','Frozen pending event equals its independently held stored EventRecord.'),
 ('receipt_event','joins','equal','First receipt event ID joins the independently held stored EventRecord.'),
 ('receipt_sequence','joins','equal','First receipt sequence joins the independently held stored EventRecord.'),
 ('receipt_full_value','joins','equal','First receipt full-value hash commits complete Storage event bytes.'),
 ('history_copy','joins','equal','History contains the original stored event, not a substituted copy.'),
 ('retry_receipt','retry','equal','A semantic retry returns exact original first-receipt bytes.'),
 ('retry_effects','retry','empty','An original retry has zero new effects.'),
 ('replay_policy','retry','not_equal','Current append/retry cannot choose projector_replay_only.'),
 ('record_cas','protocol','equal','Record CAS compares against actual held revision.'),
 ('append_order','protocol','before','Record CAS precedes barrier append.'),
 ('receipt_order','protocol','before','First receipt precedes dependent publication.'),
 ('raw_order','protocol','before','Quarantine raw custody fsync precedes record CAS.'),
 ('materialize_order','protocol','before','Application reserves target IDs before materialization.'),
 ('attest_order','protocol','before','Corruption FileSafe attestation precedes record CAS.'),
 ('source_preserved','protocol','equal','Application preserves source thread, branch, worktree and safe-point data.'),
 ('stored_token','read','equal','Stored read token is exactly DL-076 nine fields.'),
 ('live_snapshot','read','equal','Live disclosure joins the actual current snapshot, never a stored snapshot.'),
 ('token_join','read','equal','Each durable token value matches the current live token.'),
 ('source_selection','read','equal','Live token source selection matches actual CURRENT-selected coverage.'),
 ('coverage','read','contains','Coverage proves the event sequence before filtering history.'),
 ('read_permission','read','contains','Current viewer permission is checked immediately before disclosure.'),
 ('deletion_fence','read','not_contains','Deleted source subjects cannot be disclosed.'),
 ('sealed_dispatch','retained','error','Retained recipe selected only from unique independently sealed original receipt.'),
 ('store_snapshot','retained','equal','Retained read preserves the complete sealed store snapshot.'),
 ('writer_cutoff','withdrawal','less','Current append is below the installed writer cutoff.'),
 ('reader_fence','withdrawal','equal','Withdrawn readers cannot disclose retained events.'),
 ('restore_time','restore','greater','New Hold/Boot operation is accepted after the post-restore session opens.'),
 ('restore_epoch','restore','equal','Boot operation uses the new recovery epoch.'),
 ('restore_capability','restore','equal','Fresh capability binds this exact accepted operation, not a copied group.'),
 ('anchor_monotone','restore','equal','Older restore never rolls the external Boot anchor back.'),
 ('floor_unavailable','restore','equal','An older restore never re-establishes earliest completeness.'),
 ('aftermath_receipt','aftermath','less_equal','Recovery aftermath follows a verified first receipt.'),
 ('aftermath_owner','aftermath','equal','Only the generic projector owns the checkpoint advance.'),
 ('aftermath_generation','aftermath','not_equal','Rebuild action publishes a fresh index generation.'),
 ('aftermath_restart','aftermath','empty','A covered frontier on restart repeats no aftermath.'),
 ('reference_seq','seglog','equal','Seglog sequence joins the referenced original event.'),
 ('reference_type','seglog','equal','Seglog type joins the referenced original event.'),
 ('reference_event','seglog','equal','Seglog event_ref joins the referenced original event.'),
 ('reference_segment','seglog','equal','Seglog segment_ref joins actual original segment custody.'),
 ('quarantine_export','quarantine','equal','Raw quarantine bytes leave only through protected explicit export.'),
 ('anchor_receipt','anchor','equal','Recovery-unavailable receipt_ref names its own SP-286 first receipt custody key.'),
 ('auxiliary_schema','companion','error','SP-2202/2203 custody and SP-2209 read output retain every owner schema keyword.'),
 ('auxiliary_time','companion','error','Custody timestamps use the shared Storage UTC-Z profile.'),
 ('emitter','family','equal','SP-2200..2204 events are appended only by their named owner emitter.'),
 ('deletion_ordinal','family','equal','Deletion transition ordinal follows the actual durable event_refs length.'),
 ('quarantine_occurrence','family','equal','Quarantine occurrence is one plus matching purged records, never a caller count.'),
 ('corrupt_terminal','family','empty','A corruption commit cannot follow a deletion or expiry commit for the point.'),
 ('dedupe_available','dedupe','contains','Retry requires an actual original key in independently held dedupe custody.'),
 ('request_digest','dedupe','equal','Same request key with a changed normalized request digest conflicts.'),
 ('withdrawal_order','withdrawal','equal','Withdrawal installs cutoff, drains obligations, then fences the reader.'),
 ('passive_reads','read','empty','Passive event history never appends, dispatches or advances a checkpoint.'),
 ('platform_marker','platform','empty','Live platform read-through markers are never persisted.'),
 ('deletion_edge','transitions','contains','Deletion follows the closed ordinary graph; terminal purge has no successor.'),
 ('quarantine_edge','transitions','contains','Quarantine follows its closed acyclic graph, without direct detected resolution.'),
 ('purge_holds','transitions','empty','Deletion cannot enter purge_pending or purged while hold blockers remain.'),
 ('payload_pattern','patterns','error','Anchored payload identifiers consume the entire string, including a final LF.'),
 ('auxiliary_pattern','patterns','error','Anchored custody identifiers consume the entire string, including a final LF.'),
 ('run_context','context','equal','Recovery-unavailable envelope run joins its original episode payload run.'),
 ('node_context','context','equal','Recovery-unavailable envelope node joins its original episode payload node.'),
 ('restore_digest','restore','equal','Fresh-operation capability binds the complete accepted-operation digest.'),
 ('receipt_schema','receipt','error','The first receipt validates as the complete closed CV-339 AppendReceipt.'),
 ('receipt_numbers','receipt','error','Every Storage-assigned receipt integer uses shared storage_uint64.'),
 ('token_schema','token_shape','error','The complete live SP-278 read token keeps every owner schema keyword.'),
 ('token_numbers','token_shape','error','Every stored/live SP-278 integer slot uses shared current_integer with its exact owner range.'),
 ('quarantine_delete_image','quarantine_delete','equal','Deleted-scope raw bytes remain until resolution and while held; resolution without holds deletes them.'),
 ('resolution_state','quarantine_delete','contains','The canonical transition is a successful existing resolution state.'),
 ('resolution_subject','quarantine_delete','equal','The resolution event belongs to this exact quarantined value.'),
 ('resolution_event_id','quarantine_delete','equal','The original resolution event ID follows the quarantine owner recipe.'),
 ('resolution_key','quarantine_delete','equal','The resolution idempotency key follows the quarantine owner recipe.'),
 ('resolution_receipt_count','quarantine_delete','equal','Exactly one independent original first receipt exists for the resolution event.'),
 ('resolution_receipt_event','quarantine_delete','equal','The first receipt names the exact resolution event.'),
 ('resolution_receipt_sequence','quarantine_delete','equal','The first receipt sequence joins the original resolution event sequence.'),
 ('resolution_commitment','quarantine_delete','equal','The resolution full-value commitment binds the complete original event.'),
 ('resolution_barrier','quarantine_delete','equal','The resolution first receipt is barrier-class.'),
 ('resolution_receipt_schema','quarantine_delete','error','The complete resolution first receipt keeps every CV-339 schema keyword.'),
 ('resolution_numbers','quarantine_delete','error','Every resolution receipt Storage integer uses shared storage_uint64.'),
 ('resolution_time','quarantine_delete','error','Resolution first-receipt acknowledgement uses the EventRecord date-time profile.'),
 ('resolution_effect_event','quarantine_delete','contains','The original resolution transition receipt names this event.'),
 ('resolution_effect_state','quarantine_delete','equal','The original dependent-effect transition has the resolution event state.'),
 ('resolution_effect_input','quarantine_delete','equal','The dependent-effect transition binds the original quarantined raw hash.'),
 ('resolution_effect_output','quarantine_delete','equal','The dependent-effect output hash matches the actual captured resolved value bytes.'),
 ('resolution_effect_time','quarantine_delete','error','The original resolution transition time uses the EventRecord date-time profile.'),
]
ROW = {r[0]: r for r in ROWS}
TABLES = tuple(dict.fromkeys(r[1] for r in ROWS))


def operands(case):
    """Prepare independent raw operands without making a row's decision."""
    family = case['family']; event = case['event']; stored = case['stored_event']
    v = {name: {'applies': False, 'left':None,'right':None} for name in ROW}
    def put(name, left, right=None, applies=True):
        v[name] = {'applies': applies, 'left':left, 'right':right}
    envelope_schema=read_json('Plans/event_record.schema.json')
    if type(event) is not dict or not set(envelope_schema['required']) <= event.keys():
        put('envelope_schema',schema_errors(envelope_schema,event))
        return v
    p=event['payload'];payload_schema=schema_for(family)
    if type(p) is not dict or not set(payload_schema.get('required',[])) <= p.keys():
        put('payload_schema',schema_errors(payload_schema,p))
        return v
    receipt_document=read_json('Plans/event_append_receipt_contracts.schema.json')
    receipt_schema=dict(receipt_document,**{'$ref':'#/$defs/AppendReceipt'})
    if type(case['receipt']) is not dict or not set(receipt_document['$defs']['AppendReceipt']['required']) <= case['receipt'].keys():
        put('receipt_schema',schema_errors(receipt_schema,case['receipt']))
        return v
    source = case['source']
    source_number_error=None;source_count_ready=True
    if family=='storage.deletion_lifecycle_changed':
        source_number_error=caught(current_integer,source['ordinal'],minimum=1)
        source_count_ready=source_number_error is None and source['ordinal']==len(case['record_history'])+1
    elif family=='storage.value_quarantine_changed':
        source_number_error=caught(current_integer,source['occurrence'],minimum=1)
        purged_count=sum(r.get('state')=='purged' and r.get('source_family_id')==source['source_family_id']
                         and r.get('source_locator_ref')==source['source_locator_ref']
                         and r.get('raw_sha256')==source['raw_sha256'] for r in case['record_history'])
        source_count_ready=source_number_error is None and source['occurrence']==purged_count+1
    # Do not stringify an unadmitted arbitrary-precision count. Native counts
    # come from the complete original sequence; source admission owns a forged
    # value before its decimal identity recipe is reached, without a digit cap.
    ids = identity(family, source, p) if source_count_ready else {}
    numeric = [caught(current_integer, value, minimum=schema.get('minimum'), maximum=schema.get('maximum'))
               for _path, value, schema in integers(p, schema_for(family))]
    if source_number_error:numeric.append(source_number_error)
    if 'auxiliary' in case:
        numeric += [caught(current_integer,value,minimum=schema.get('minimum'),maximum=schema.get('maximum'))
                    for _path,value,schema in integers(case['auxiliary']['value'],case['auxiliary']['schema'])]
    put('integer_domain', [x for x in numeric if x])
    put('storage_sequence', caught(storage_uint64, event['sequence_id']))
    put('physical_value', caught(storage_value_bytes, event, profile=EVENT_VALUE))
    # Invalid numbers cannot be formatted by jsonschema and are owned by the
    # shared numeric row. This precondition is computed independently, never
    # from a table result, so cutting one row does not change another's inputs.
    physical_ok = v['physical_value']['left'] is None
    numeric_ok = not any(numeric) and v['storage_sequence']['left'] is None
    # Shared CV-1101 owns format; the complete schema is still evaluated, and
    # every non-format keyword diagnostic is kept. No owner clause is removed.
    put('envelope_schema', [e for e in schema_errors(read_json('Plans/event_record.schema.json'),event) if e[-1]!='format'] if physical_ok and numeric_ok else [], applies=physical_ok and numeric_ok)
    put('payload_schema', [e for e in schema_errors(schema_for(family),p) if e[-1]!='format'] if physical_ok and numeric_ok else [], applies=physical_ok and numeric_ok)
    put('payload_pattern',pattern_errors(p,schema_for(family)) if physical_ok and numeric_ok and not v['payload_schema']['left'] else [],applies=physical_ok and numeric_ok and not v['payload_schema']['left'])
    put('producer_jcs', caught(producer_semantic_bytes, semantic(event)), applies=physical_ok)
    source_errors=[]; storage_errors=[]
    for path, value in timestamps(event):
        target = storage_errors if path in [('observed_at_utc',),('persisted_at_utc',)] else source_errors
        error = caught(date_time, value, profile=STORAGE_UTC_Z if target is storage_errors else EVENT_RECORD)
        if error: target.append((path,error))
    put('source_time', source_errors); put('storage_time', storage_errors)
    put('ack_time', caught(date_time,case['receipt']['acknowledged_at_utc'],profile=EVENT_RECORD))
    put('scope_partition',case.get('scope_partition',partition(source['project_id'])),partition(source['project_id']))
    put('project_join',event['project_id'],source['project_id'])
    put('payload_project',p.get('project_id'),source['project_id'], 'project_id' in schema_for(family).get('properties',{}))
    put('application_key',event['idempotency_key'],ids.get('idempotency_key'),bool(ids) and family in ('storage.deletion_lifecycle_changed','storage.value_quarantine_changed','restore_point.applied'))
    put('event_identity',event['event_id'],ids.get('event_id'),bool(ids))
    for key in ('deletion_id','quarantine_id','application_id'):
        if key in ids: put('subject_identity',p.get(key),ids[key])
    put('thread_join',event['thread_id'],p.get('new_thread_id'),family=='restore_point.applied')
    put('pending_copy',storage_value_bytes(case['pending_event'],profile=EVENT_VALUE).hex(),storage_value_bytes(stored,profile=EVENT_VALUE).hex())
    put('receipt_event',case['receipt']['event_id'],stored['event_id'])
    put('receipt_sequence',case['receipt']['sequence_id'],stored['sequence_id'])
    put('receipt_full_value',case['full_value_sha256'],full_value_commitment(stored))
    put('history_copy',storage_value_bytes(case['history'],profile=EVENT_VALUE).hex(),storage_value_bytes([stored],profile=EVENT_VALUE).hex())
    put('retry_receipt',case['retry_receipt'],case['original_receipt']);put('retry_effects',case['retry_effects'],[])
    put('replay_policy',event['replay_policy'],'projector_replay_only')
    put('record_cas',case['cas']['expected_revision'],case['cas']['actual_revision'])
    trace = case['trace']
    put('append_order',trace.index('record_cas'),trace.index('barrier_append'))
    put('receipt_order',trace.index('first_receipt'),trace.index('publish'))
    put('raw_order',trace.index('raw_fsync') if 'raw_fsync' in trace else -1,trace.index('record_cas'),family=='storage.value_quarantine_changed')
    put('materialize_order',trace.index('reserve_ids') if 'reserve_ids' in trace else -1,trace.index('materialize') if 'materialize' in trace else -1,family=='restore_point.applied')
    put('attest_order',trace.index('filesafe_attest') if 'filesafe_attest' in trace else -1,trace.index('record_cas'),family=='restore_point.corrupt')
    put('source_preserved',case['native_after'],case['native_before'],family=='restore_point.applied')
    put('stored_token', sorted(case['token']),sorted(TOKEN_FIELDS))
    put('live_snapshot',case['live_token']['redb_snapshot_id'],case['live_snapshot'])
    put('token_join',{k:case['token'].get(k) for k in TOKEN_FIELDS},{k:case['live_token'].get(k) for k in TOKEN_FIELDS})
    put('source_selection',case['live_token']['source_selection'],case['source_selection'])
    put('coverage',stored['sequence_id'],case['covered_sequences'])
    put('read_permission','read',case['current_permission'].get(case['viewer'],[]))
    put('deletion_fence',source['thread_id'],case['deleted_subjects'])
    put('sealed_dispatch',caught(retained,case));put('store_snapshot',case['sealed_store'],case['read_store_before'])
    put('writer_cutoff',case['append_sequence'],case['writer_cutoff']);put('reader_fence',case['reader_version'],'active')
    restore=case['restore']; applies=family in ('storage.boot_recovery','storage.retention_hold_changed')
    put('restore_time',restore['accepted_at'],restore['session_opened'],applies)
    put('restore_epoch',restore['operation_epoch'],restore['epoch'],family=='storage.boot_recovery')
    put('restore_capability',restore['capability_identity'],restore['identity'],applies)
    put('restore_digest',restore['capability_digest'],source['command_digest'],applies)
    put('anchor_monotone',restore['anchor_after'],restore['anchor_before'],family=='storage.boot_recovery')
    put('floor_unavailable',restore['floor']['status'],'unavailable',family=='storage.boot_recovery')
    aftermath=case['aftermath'];applies=family=='storage.recovery_applied'
    put('aftermath_receipt',aftermath['receipt_sequence'],aftermath['frontier_after'],applies)
    put('aftermath_owner',aftermath['checkpoint_owner'],'projector.storage.event_record_index@1.0.0',applies)
    put('aftermath_generation',aftermath['generation_before'],aftermath['generation_after'],applies and aftermath['action']=='invalidate_and_rebuild')
    put('aftermath_restart',aftermath['restart_effects'],[],applies)
    for key, row in [('seq','reference_seq'),('type','reference_type'),('event_ref','reference_event'),('segment_ref','reference_segment')]:
        put(row,p.get(key),case['reference'][key],family=='seglog.event_appended' and not any(numeric) and not v['payload_pattern']['left'])
    put('quarantine_export',case['raw_export_surface'],'protected',family=='storage.value_quarantine_changed')
    put('anchor_receipt',p.get('receipt_ref'),'event_append_receipt_custody.v1:' + STORE + ':' + sha(stored['event_id'].encode()),family=='safe_point.recovery_unavailable')
    if 'auxiliary' in case:
        auxiliary=case['auxiliary']
        put('auxiliary_schema',[e for e in schema_errors(auxiliary['schema'],auxiliary['value']) if e[-1]!='format'] if not any(numeric) else [],applies=not any(numeric))
        put('auxiliary_pattern',pattern_errors(auxiliary['value'],auxiliary['schema']) if not any(numeric) and not v['auxiliary_schema']['left'] else [],applies=not any(numeric) and not v['auxiliary_schema']['left'])
        errors=[]
        for path,value in timestamps(auxiliary['value']):
            profile=STORAGE_UTC_Z if family in ('restore_point.applied','restore_point.corrupt') or path[-1] in ('observed_at_utc','persisted_at_utc') else EVENT_RECORD
            if path[-1]=='acknowledged_at_utc':profile=EVENT_RECORD
            error=caught(date_time,value,profile=profile)
            if error:errors.append((path,error))
        put('auxiliary_time',errors)
    put('emitter',case['emitter'],EMITTERS[family],family in ('storage.deletion_lifecycle_changed','storage.value_quarantine_changed','restore_point.applied','restore_point.corrupt','safe_point.recovery_unavailable'))
    put('deletion_ordinal',source['ordinal'],len(case['record_history'])+1,family=='storage.deletion_lifecycle_changed' and source_number_error is None)
    purged=[r for r in case['record_history'] if r.get('state')=='purged' and r.get('source_family_id')==source['source_family_id'] and r.get('source_locator_ref')==source['source_locator_ref'] and r.get('raw_sha256')==source['raw_sha256']]
    put('quarantine_occurrence',source['occurrence'],len(purged)+1,family=='storage.value_quarantine_changed' and source_number_error is None)
    put('corrupt_terminal',case['terminal_commits'],[],family=='restore_point.corrupt')
    put('dedupe_available',case['retry_key'],list(case['dedupe_store']))
    prior=case['dedupe_store'].get(case['retry_key'])
    put('request_digest',case['retry_request_digest'],prior['request_digest'] if prior else None,prior is not None)
    put('withdrawal_order',case['cutoff_trace'],['cutoff','drain','fence'])
    put('passive_reads',case['read_effects'],[])
    put('platform_marker',list(case['persisted_read_outputs']),[],family=='platform.capability_evaluated')
    deletion_edges=[['initial','requested'],['requested','logically_hidden'],['logically_hidden','held'],
                    ['logically_hidden','purge_pending'],['held','purge_pending'],['purge_pending','purged'],
                    ['requested','failed'],['logically_hidden','failed'],['purge_pending','failed']]
    quarantine_edges=[['initial','detected'],['detected','secured']]
    quarantine_edges += [['secured',state] for state in ('migrated','rebuilt','reset_to_default','restored','recovery_blocked')]
    quarantine_edges += [[state,'purged'] for state in ('migrated','rebuilt','reset_to_default','restored')]
    put('deletion_edge',[case['prior_state'],p.get('state')],deletion_edges,family=='storage.deletion_lifecycle_changed')
    # Failed deletion retry has no fixed bypass edge; complete re-admission
    # remains an unimplemented boundary and is reported, never guessed here.
    put('quarantine_edge',[case['prior_state'],p.get('state')],quarantine_edges,family=='storage.value_quarantine_changed')
    put('purge_holds',p.get('hold_blockers',[]),[],family=='storage.deletion_lifecycle_changed' and p.get('state') in ('purge_pending','purged'))
    put('run_context',event['run_id'],p.get('run_id'),family=='safe_point.recovery_unavailable')
    put('node_context',event['node_id'],p.get('node_id'),family=='safe_point.recovery_unavailable')
    document=read_json('Plans/event_append_receipt_contracts.schema.json')
    receipt_schema=dict(document,**{'$ref':'#/$defs/AppendReceipt'})
    number_errors=[caught(storage_uint64,case['receipt'].get(key)) for key in ('sequence_id','segment_generation','byte_offset','durable_end_offset','manifest_generation')]
    put('receipt_numbers',[e for e in number_errors if e])
    put('receipt_schema',[e for e in schema_errors(receipt_schema,case['receipt']) if e[-1]!='format'] if not any(number_errors) else [],applies=not any(number_errors))
    token_document=read_json('Plans/event_record_index_checkpoint.schema.json')
    token_schema=dict(token_document,**{'$ref':'#/$defs/read_token'})
    token_errors=[]
    for token in (case['token'],case['live_token']):
        for path,value,schema in integers(token,token_schema):
            error=caught(current_integer,value,minimum=schema.get('minimum'),maximum=schema.get('maximum'))
            if error:token_errors.append((path,error))
    put('token_numbers',token_errors)
    put('token_schema',schema_errors(token_schema,case['live_token']) if not token_errors else [],applies=not token_errors)
    if 'quarantine_disposal' in case and source_count_ready:
        disposal=case['quarantine_disposal'];error=quarantine_resolution_error(case)
        event=disposal['resolution_event']
        if event is not None:
            ids=identity(case['family'],case['source'],event['payload'])
            put('resolution_state',event['payload']['state'],['migrated','rebuilt','reset_to_default','restored'])
            put('resolution_subject',event['payload']['quarantine_id'],case['event']['payload']['quarantine_id'])
            put('resolution_event_id',event['event_id'],ids['event_id'])
            put('resolution_key',event['idempotency_key'],ids['idempotency_key'])
            receipts=disposal['resolution_receipts'].get(event['event_id'],[])
            put('resolution_receipt_count',len(receipts),1)
            if len(receipts)==1:
                row=receipts[0];receipt=row['receipt']
                put('resolution_receipt_event',receipt['event_id'],event['event_id'])
                put('resolution_receipt_sequence',receipt['sequence_id'],event['sequence_id'])
                put('resolution_commitment',row['full_value_sha256'],full_value_commitment(event))
                put('resolution_barrier',receipt['durability_class'],'barrier')
                errors=[caught(storage_uint64,receipt.get(key)) for key in ('sequence_id','segment_generation','byte_offset','durable_end_offset','manifest_generation')]
                put('resolution_numbers',[e for e in errors if e])
                put('resolution_receipt_schema',[e for e in schema_errors(receipt_schema,receipt) if e[-1]!='format'] if not any(errors) else [],applies=not any(errors))
                put('resolution_time',caught(date_time,receipt['acknowledged_at_utc'],profile=EVENT_RECORD))
            effect=disposal['resolution_transition']
            put('resolution_effect_event',event['event_id'],effect['event_refs'])
            put('resolution_effect_state',effect['to_state'],event['payload']['state'])
            put('resolution_effect_input',effect['input_sha256'],case['source']['raw_sha256'])
            put('resolution_effect_output',effect['output_sha256'],sha(bytes.fromhex(disposal['resolved_value_bytes_hex'])))
            put('resolution_effect_time',caught(date_time,effect['occurred_at_utc'],profile=EVENT_RECORD))
        # Actual hold rows are retained in the canonical union. A hold cannot
        # be cleared by a quarantine transition or by scope deletion.
        held=any(row['state']=='held' for row in disposal['hold_records'].values())
        resolved=disposal['resolution_event'] is not None and error is None
        expected={} if resolved and not held else disposal['raw_before']
        put('quarantine_delete_image',disposal['raw_after'],expected)
    return v


def table_names():
    return [table + '_' + str(i//8) for table in TABLES for i in range(0,len([r for r in ROWS if r[1]==table]),8)]


def table_rows(name):
    group, n = name.rsplit('_',1)
    return [r for r in ROWS if r[1]==group][int(n)*8:int(n)*8+8]


def table_module(name):
    return importlib.import_module('pm_s3bo_table_'+name)


def evaluate(case, cut=None):
    """The same complete boundary used by fixtures, mutations and guard proof.

    Return all independent refusals for isolation diagnostics. Runtime callers
    use the first row in this stable table order. Only table predicates refuse.
    """
    values=operands(case); errors=[]
    for name in table_names():
        model=table_module(name).case(values)
        for row in table_rows(name):
            if row[0] == cut: continue
            code = model.table.guards[row[0]].predicate(values,None)
            if code is not None:
                errors.append((row[0],code))
    return errors, values
