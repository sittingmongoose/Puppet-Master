#!/usr/bin/env python3
"""Read-only prepared FileSafe source/envelope/receipt and protocol oracles.

Synthetic owner banks model independent original custody. They are not native
acceptance evidence. Real registry admission remains absent, native NOT_RUN.

Sweep part 2A: every product refusal is one named row of a Method B guard table
(pm_filesafe_tables, scripts/pm_filesafe_table_<phase>.py). Each function below
derives the observation of the phase it is about to evaluate and refuses only
through the rows; a reused boundary (selected source, payload resolution,
payload semantics, issued custody, survivor coverage) keeps its caller's
legacy refusal code.
"""
from __future__ import annotations
import copy
import hashlib
import importlib.util
import json
import struct
import blake3
from functools import lru_cache
from pathlib import Path
from datetime import datetime
from jsonschema import Draft202012Validator
from referencing import Resource
from referencing.jsonschema import DRAFT202012
import pm_filesafe_event_contracts as payload_owner
import pm_filesafe_schema_graph as schema_graph
import pm_filesafe_retention as retention_owner
import pm_filesafe_tables as tables
from pm_projects_refresh_contracts import semantic_hash
from pm_event_numbers import (APP_PHYSICAL, EVENT_VALUE, FrozenRecipe, OriginalBinding, OriginalCustody,
                              RecipeTuple, Refusal, RetainedDispatcher, decode_storage_value, full_value_commitment,
                              loads_current_json, producer_semantic_digest, qualified_jcs, storage_value_bytes)

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
    """CV-339 original_event_value_commitment.sha256 (shared SP-1100 EVENT_VALUE route)."""
    return full_value_commitment(event)


def full_value_facts(event):
    """Observation: (CV-339 commitment or None, SP-1100 refusal reason or None)."""
    try:
        return full_value_commitment(event), None
    except Refusal as error:
        return None, error.reason


def producer_facts(event):
    """Observation: (CV-317 producer semantic digest or None, the qualified-JCS facts)."""
    try:
        return producer_semantic_digest(event), {'binary64': False, 'decimal': False, 'other': False}
    except Refusal as error:
        return None, {'binary64': error.reason == 'jcs_binary64', 'decimal': error.reason == 'jcs_decimal',
                      'other': error.reason not in ('jcs_binary64', 'jcs_decimal')}

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

def source_commitment_or_none(source):
    """Observation: the recomputed source commitment, or None when the frozen
    local recipe cannot encode the value (for example an integer outside the
    canonical MessagePack range). The commitment row then refuses; the recipe
    itself is unchanged."""
    try:
        return source_commitment(source)
    except (KeyError, ValueError, TypeError, OverflowError):
        return None


def exact_value_equal(left, right):
    """Compare complete JSON values without Python's bool/int/float aliases.

    This is a join, not a new serializer or commitment recipe. Float hex keeps
    signed zero distinct when an authentic original recipe admits a float.
    """
    if type(left) is not type(right):
        return False
    if type(left) is dict:
        return (left.keys() == right.keys()
                and all(exact_value_equal(left[k], right[k]) for k in left))
    if type(left) is list:
        return (len(left) == len(right)
                and all(exact_value_equal(a, b) for a, b in zip(left, right)))
    if type(left) is float:
        return left.hex() == right.hex()
    return type(left) in (str, int, bool, type(None)) and left == right


def schema_errors(validator, instance):
    """Observation: the number of structural errors the selected schema reports."""
    return payload_owner.schema_facts(validator, instance)['errors']


def schema_facts(validator, instance):
    """Observation: structural errors and CV-1100 integer-slot refusals of one schema pass."""
    return payload_owner.schema_facts(validator, instance)


def selected_source_failures(family, source, bank):
    """Verify selected original custody before joining it to the caller's view.

    Use the existing original-source schema and commitment recipe on both write
    and body-history paths. Do not apply current writer epochs/numeric admission
    to a retained original, coerce its primitives or restamp its commitment.
    """
    selected = bank['sources'].get(source['source_ref'])
    refused = tables.codes('selected_source_present', {'present': selected is not None})
    if refused:
        return refused
    refused = tables.codes('selected_source_schema', {'errors': schema_errors(context(family)[1]('source'), selected)})
    if refused:
        return refused
    try:
        computed = source_commitment(selected)
    except (KeyError, ValueError, TypeError, OverflowError):
        computed = None
    refused = tables.codes('selected_source_commitment', {'computed': computed, 'recorded': selected['accepted_source_sha256']})
    if refused:
        return refused
    return tables.codes('selected_source_join', {'exact_equal': exact_value_equal(selected, source)})

@lru_cache(maxsize=None)
def context(family):
    slug=family.replace('.','_')
    graph,docs,registry=schema_graph.context(family)
    schema=docs[f'Plans/filesafe_event_sources/{slug}.schema.json']
    def validator(root):
        return schema_graph.SlotValidator({'$ref':schema['$id']+'#/$defs/'+root},registry=registry,format_checker=schema_graph.format_checker())
    return graph,validator

def graph_failures(family, graph=None):
    graph_ctx,validator=context(family)
    graph = graph_ctx if graph is None else graph
    failures=[]
    value={k:v for k,v in graph.items() if k!='graph_sha256'}
    failures += tables.codes('graph_identity', {
        'event_type': graph['event_type'], 'family': family,
        'graph_sha256': graph['graph_sha256'], 'computed_sha256': semantic_hash('source_graph',value)})
    stages = graph['ordered_stages']
    failures += tables.codes('graph_stages', {
        'roles': [s['role'] for s in stages], 'ordinal_types': [type(s['ordinal']).__name__ for s in stages],
        'ordinals': [s['ordinal'] for s in stages]})
    failures += tables.codes('graph_method_count', {'method_count': len(graph['methods'])})
    for kind,method in zip(('project','application'),graph['methods']):
        expected=f'owner.filesafe.{family.replace(".","_")}.original_source.{kind}@1.0.0'
        failures += tables.codes('graph_method', {
            'interface_id': method['interface_id'], 'expected_interface': expected,
            'component': method['component'], 'producer': graph['producer'],
            'adoption': method['adoption_disposition']})
        for key in ('input_root_ref','output_root_ref'):
            path,fragment=method[key].split('#')
            node=load(path)
            for part in fragment.strip('/').split('/'): node=node[part]
            if schema_graph.schema_document_refused(node): failures.append('method_root_schema')
    for row in graph['resources']+graph['preserved_project_resources']:
        if tables.refused('graph_resource_hash', {
                'computed_sha256': hashlib.sha256((ROOT/row['path']).read_bytes()).hexdigest(),
                'recorded_sha256': row['sha256']}):
            failures.append('resource_hash:'+row['path'])
    for row in graph['resources']:
        doc=load(row['path'])
        if schema_graph.schema_document_refused(doc): failures.append('resource_schema:'+row['path'])
        failures += tables.codes('graph_resource_uri', {'document_id': doc.get('$id',row['uri']), 'uri': row['uri']})
    failures += tables.codes('graph_admission', {'native_admission': graph['native_admission']})
    _,docs,registry=schema_graph.context(family)
    failures.extend(schema_graph.reference_failures(graph,docs,registry))
    failures.extend(schema_graph.negative_case_failures(family,graph,docs))
    failures.extend(retention_binding_failures(family,graph['retention_policy_ref']))
    failures.extend(retention_owner.binding_failures(family,graph))
    failures.extend(retention_owner.check(family))
    return failures

def retention_binding_failures(family, policy):
    expected_retention = {
        'filesafe.destructive_override_granted': 'RP-AUTHORITY-INDEFINITE',
        'filesafe.policy_degraded': 'RP-OPERATIONAL-2555D',
        'safe_point.created': 'RP-RUNTIME-365D',
        'safe_point.restored': 'RP-RUNTIME-365D',
    }.get(family, 'PENDING_RETENTION_DECISION')
    return tables.codes('retention_assignment', {'policy': policy, 'expected': expected_retention})

def real_admission(family, registry=None):
    registry = load('Plans/event_family_registry.json') if registry is None else registry
    matches = len([r for r in registry['families'] if r['event_type']==family])
    return 'registered_requires_independent_depth' if tables.refused('membership', {'registered_matches': matches}) else 'missing_event_registration'

def instant(value):
    return datetime.fromisoformat(value.upper().replace('Z','+00:00'))

def decode_original(raw, codec):
    """Decode one original body with the codec its write-time edition selected.

    pm.application.physical_messagepack.v1 is the shared SP-1100 APP_PHYSICAL
    decoder (canonical bytes only); RFC8785 bodies are unique-key JSON whose
    CV-1100 qualified RFC 8785 encoding equals the stored bytes exactly.
    """
    data=bytes.fromhex(raw)
    if codec=='RFC8785':
        from pm_projects_refresh_contracts import unique_object
        value=json.loads(data,object_pairs_hook=unique_object)
        if qualified_jcs(value)!=data:raise ValueError('noncanonical JSON')
        return value
    if codec==APP_PHYSICAL:
        return decode_storage_value(data, profile=APP_PHYSICAL)
    raise ValueError('unsupported original body codec')


def event_payload(family, event, bank):
    """Resolve SP-337 from independently selected durable synthetic pack custody.

    The envelope's existing string ref contains a canonical JSON descriptor.
    The decoded semantic root is never copied back into the stored EventRecord.
    Physical pack durability remains native NOT_RUN.
    """
    inline = event['payload']
    refused = tables.codes('payload_jcs', payload_owner.jcs_facts(inline))
    if refused:
        return None, refused
    refused = tables.codes('payload_inline_size', {'inline_bytes': len(payload_owner.payload_bytes(inline))})
    if refused:
        return None, refused
    ref = event['payload_ref']
    if ref is None:
        return inline, []
    try:
        descriptor, parse_error = json.loads(ref), None
    except (ValueError, TypeError, UnicodeError) as error:
        descriptor, parse_error = None, type(error).__name__
    refused = tables.codes('payload_ref_parse', {'parse_error': parse_error})
    if refused:
        return None, refused
    _, validator = context(family)
    refused = tables.codes('payload_ref_descriptor', schema_facts(validator('payload_reference'), descriptor))
    if refused:
        return None, refused
    if tables.refused('descriptor_jcs', payload_owner.jcs_facts(descriptor)):
        return None, ['payload_reference_shape']
    refused = tables.codes('payload_ref_shape', {
        'canonical_text': payload_owner.payload_bytes(descriptor).decode('utf-8'), 'ref': ref, 'inline': inline})
    if refused:
        return None, refused
    payload_id = descriptor['payload_id']
    stored = bank['payloads'].get(payload_id) if isinstance(bank.get('payloads'), dict) else None
    try:
        raw, hex_valid = bytes.fromhex(stored), True
    except (TypeError, ValueError):
        raw, hex_valid = None, False
    refused = tables.codes('payload_ref_store', {
        'stored': isinstance(bank.get('payloads'), dict) and payload_id in bank['payloads'], 'hex_valid': hex_valid})
    if refused:
        return None, refused
    refused = tables.codes('payload_ref_custody', {
        'raw_length': len(raw), 'byte_size': descriptor['byte_size'],
        'computed_id': 'blake3:' + blake3.blake3(raw).hexdigest(), 'payload_id': payload_id,
        'durable_ids': list(bank['durable_payload_ids'])})
    if refused:
        return None, refused
    # Strict canonical decoding also rejects duplicate keys and trailing bytes.
    try:
        value, decode_error = decode_original(raw.hex(), 'RFC8785'), None
    except (KeyError, ValueError, TypeError, UnicodeError) as error:
        value, decode_error = None, type(error).__name__
    refused = tables.codes('payload_ref_decode', {'decode_error': decode_error})
    if refused:
        return None, refused
    return value, []


def application_original_failures(family, candidate, bank):
    graph,validator=context(family);source=candidate['source'];req=source['original_request']
    records=source['application_records'];p=source['original_result'];failures=[]
    members={v['role']:v for v in source['body_members']}
    decoded={}
    schema=load(f'Plans/filesafe_event_sources/{family.replace(".","_")}.schema.json')
    # SP-1101: the body codecs come from the write-time edition Storage custody
    # recorded for this original source, never from the caller or a probe.
    entry=(bank.get('original_custody') or {}).get(source['source_ref'])
    refused=tables.codes('app_codec_pin', {
        'entry_present': isinstance(entry, dict),
        'recorded_manifest': entry.get('resource_manifest_sha256') if isinstance(entry, dict) else None,
        'installed_manifest': resource_manifest(family)})
    if refused:
        return failures+refused
    codecs=frozen_codecs(family)
    for role,fragment in graph['application_body_roots'].items():
        member=members.get(role)
        if tables.refused('app_body_role', {'member_present': member is not None}):
            failures.append('application_body_role');continue
        decode_error=None
        try:
            value=decode_original(bank['bodies'][member['ref']],codecs[role])
            selected=schema_graph.SlotValidator({'$ref':schema['$id']+fragment},
                registry=validator('materialization')._registry,format_checker=schema_graph.format_checker())
            if role.endswith('request'):
                # Addressing fields are outside the original request-byte preimage.
                expected={k:v for k,v in req.items() if k not in ('original_input_ref','original_input_sha256')}
                checked={**value,'original_input_ref':req['original_input_ref'],'original_input_sha256':req['original_input_sha256']}
            else:expected=records[role];checked=value
            errors=schema_errors(selected,checked);value_equal=exact_value_equal(value,expected)
        except (KeyError,ValueError,TypeError,UnicodeError,struct.error) as error:
            decode_error=type(error).__name__
        if tables.refused('app_body_decode', {'decode_error': decode_error}):
            failures.append('application_body_decode:'+role);continue
        facts={'errors': errors, 'value_equal': value_equal}
        failures += [code+':'+role for code in tables.codes('app_body_schema', facts)+tables.codes('app_body_check', facts)]
        decoded[role]=value
    if len(decoded)!=len(graph['application_body_roots']):return failures
    # Manifest and index digests are SHA-256 of CV-1100 qualified RFC 8785.
    for record in [records[k] for k in records if 'manifest' in k and records[k] is not None]:
        for value in (record, *(() if record['scm'] is None else (record['scm']['index_entries'],))):
            refused=tables.codes('manifest_jcs', payload_owner.jcs_facts(value))
            if refused:
                return failures+refused
    def digest(value):return hashlib.sha256(qualified_jcs(value)).hexdigest()
    utf8=lambda x:x.encode('utf-8')
    manifests=[records[k] for k in records if 'manifest' in k and records[k] is not None]
    inventory=records['snapshot_blobs'];blobs=inventory['blobs']
    failures += tables.codes('app_inventory', {
        'payload_ids': [v['payload_id'] for v in blobs], 'distinct_count': len({v['payload_id'] for v in blobs})})
    for record in records.values():
        if record is not None:
            failures += tables.codes('app_record_context', {
                'record_scope': record['scope'], 'request_scope': req['scope'],
                'record_context': record['execution_context'], 'request_context': req['execution_context']})
    ctx=req['execution_context']
    for manifest in manifests:
        entries=manifest['entries'];paths=[e['identity']['canonical_absolute_path'] for e in entries]
        scm=manifest['scm']
        failures += tables.codes('app_manifest', {
            'paths': paths, 'sorted_unique_paths': sorted(set(paths),key=utf8),
            'entry_count': manifest['entry_count'], 'entries_length': len(entries),
            'total_bytes': manifest['total_bytes'], 'present_length_sum': sum(e['length'] for e in entries if e['present']),
            'scm_present': scm is not None, 'scm_worktree_path': None if scm is None else scm['worktree_path'],
            'working_directory': ctx['working_directory'],
            'index_state_sha256': None if scm is None else scm['index_state_sha256'],
            'computed_index_sha256': None if scm is None else digest(scm['index_entries'])})
        for entry in entries:
            identity=entry['identity'];path=identity['canonical_absolute_path']
            failures += tables.codes('app_entry_context', {
                **{k: identity[k] for k in ('root_id','root_generation','host_id','environment_id')},
                **{'ctx_'+k: ctx[k] for k in ('root_id','root_generation','host_id','environment_id')}})
            # Synthetic lexical boundary. Native realpath/reparse/CAS checks stay NOT_RUN.
            failures += tables.codes('app_entry_path', {
                'path': path, 'root': ctx['working_directory'].rstrip('/\\') if isinstance(ctx['working_directory'], str) else None,
                'ignored': entry['ignored'], 'authorized_write_set': entry['authorized_write_set']})
            if entry['present'] and entry['kind']=='file':
                matches=[v for v in blobs if v['payload_id']==entry['payload_id']]
                failures += tables.codes('app_entry_blob_match', {'match_count': len(matches)})
                if matches:
                    blob=matches[0];raw=bank['bodies'].get(blob['ref'])
                    try:body=bytes.fromhex(raw)
                    except (TypeError,ValueError):body=None
                    refused=tables.codes('app_entry_blob_bytes', {'body_valid': body is not None})
                    failures += refused
                    if not refused:
                        failures += tables.codes('app_entry_blob_value', {
                            'body_length': len(body), 'blob_length': blob['length'], 'entry_length': entry['length'],
                            'body_sha256': hashlib.sha256(body).hexdigest(), 'blob_sha256': blob['sha256'],
                            'entry_sha256': entry['blob_sha256']})
                        facts={'body_address': 'blake3:' + blake3.blake3(body).hexdigest(),
                               'blob_payload_id': blob['payload_id'], 'entry_payload_id': entry['payload_id']}
                        failures += tables.codes('app_entry_blob_address', facts)+tables.codes('app_entry_blob_join', facts)
                    failures += tables.codes('app_entry_blob_store', {
                        'store_raw': bank.get('payloads',{}).get(blob['payload_id']), 'raw': raw})
            else:
                failures += tables.codes('app_entry_symlink', {
                    'present_symlink': entry['kind']=='symlink' and bool(entry['present']),
                    'symlink_target_present': entry['symlink_target_hex'] is not None,
                    'payload_id_present': entry['payload_id'] is not None})
    referenced={e['payload_id'] for mf in manifests for e in mf['entries'] if e['payload_id'] is not None}
    failures += tables.codes('app_blob_inventory_complete', {
        'referenced': sorted(referenced), 'inventory': sorted({b['payload_id'] for b in blobs})})
    sp=records['safe_point_record'];mf=records['snapshot_manifest'];mh=digest(mf)
    failures += tables.codes('app_safe_point_ids', {'record_node_id': sp['node_id'], 'record_attempt_id': sp['attempt_id']})
    failures += tables.codes('app_safe_point_subject', {
        'record_safe_point_id': sp['safe_point_id'], 'result_safe_point_id': p['safe_point_id'],
        'record_run_id': sp['run_id'], 'result_run_id': p['run_id'],
        'record_node_id': sp['node_id'], 'record_attempt_id': sp['attempt_id'],
        'record_worktree_path': sp['worktree_path'], 'working_directory': ctx['working_directory']})
    failures += tables.codes('app_safe_point_manifest_a', {
        'manifest_ref': sp['snapshot_manifest_ref'], 'member_ref': members['snapshot_manifest']['ref'],
        'manifest_sha256': sp['snapshot_manifest_sha256'], 'computed_manifest_sha256': mh,
        'content_state_sha256': sp['content_state_sha256'],
        'record_entry_count': sp['entry_count'], 'manifest_entry_count': mf['entry_count']})
    failures += tables.codes('app_safe_point_manifest_b', {
        'record_total_bytes': sp['total_bytes'], 'manifest_total_bytes': mf['total_bytes'],
        'record_format_version': sp['snapshot_format_version'], 'manifest_format_version': mf['snapshot_format_version'],
        'record_scope_version': sp['content_scope_version'], 'manifest_scope_version': mf['content_scope_version'],
        'record_scm': sp['scm'], 'manifest_scm': mf['scm']})
    if family=='safe_point.created':
        result_keys_a=('baseline_ref','replan_generation','snapshot_format_version','content_scope_version')
        result_keys_b=('snapshot_manifest_ref','snapshot_manifest_sha256','content_state_sha256','capture_status')
        failures += tables.codes('app_capture_result_a', {**{'record_'+k: sp[k] for k in result_keys_a}, **{'result_'+k: p[k] for k in result_keys_a}})
        failures += tables.codes('app_capture_result_b', {**{'record_'+k: sp[k] for k in result_keys_b}, **{'result_'+k: p[k] for k in result_keys_b}})
        failures += tables.codes('app_capture_origin', {
            'capture_operation_id': sp['capture_operation_id'], 'request_operation_id': req['operation_id'],
            'created_at_utc': sp['created_at_utc'], 'result_ts': p['ts'],
            'created_by_actor_ref': sp['created_by_actor_ref'], 'request_actor_ref': req['actor_ref']})
        fields=('worktree_id','worktree_path','branch_name','HEAD_sha')
        if mf['scm'] is None:
            failures += tables.codes('app_capture_scm_absent', {k+'_present': k in p for k in fields})
        else:
            failures += tables.codes('app_capture_scm_present', {**{'scm_'+k: mf['scm'][k] for k in fields}, **{'result_'+k: p.get(k) for k in fields}})
    else:
        tx=records['restore_transaction'];eq=records['equality_result'];pre=records['pre_restore_manifest'];post=records['post_restore_manifest']
        preh=digest(pre);posth=digest(post) if post is not None else None
        # A pre-append source may not yet have the result-event pointer. Once
        # populated it names this exact original event, never another result.
        failures += tables.codes('app_result_event', {'result_event_ref': tx['result_event_ref'], 'event_id': candidate['event']['event_id']})
        keys_a=('safe_point_id','restore_transaction_id','run_id','node_id','attempt_id','restore_outcome')
        keys_b=('target_state_sha256','pre_restore_state_sha256','post_restore_state_sha256','conflict_reason_code','recovered_after_restart')
        failures += tables.codes('app_transaction_ids', {**{'tx_'+k: tx.get(k) for k in ('node_id','attempt_id')}, **{'result_'+k: p.get(k) for k in ('node_id','attempt_id')}})
        failures += tables.codes('app_transaction_result_a', {**{'tx_'+k: tx.get(k) for k in keys_a}, **{'result_'+k: p.get(k) for k in keys_a}})
        failures += tables.codes('app_transaction_result_b', {**{'tx_'+k: tx.get(k) for k in keys_b}, **{'result_'+k: p.get(k) for k in keys_b}})
        failures += tables.codes('app_safe_point_key', {
            'key': tx['canonical_safe_point_key'],
            'expected_key': 'application@1:'+req['scope']['server_id'].encode().hex()+':'+p['safe_point_id'].encode().hex()})
        failures += tables.codes('app_transaction_manifest', {
            'target_manifest_ref': tx['target_manifest_ref'], 'target_member_ref': members['snapshot_manifest']['ref'],
            'pre_manifest_ref': tx['pre_restore_manifest_ref'], 'pre_member_ref': members['pre_restore_manifest']['ref'],
            'target_manifest_sha256': tx['target_manifest_sha256'], 'target_state_sha256': tx['target_state_sha256'],
            'computed_target_sha256': mh, 'pre_manifest_sha256': tx['pre_restore_manifest_sha256'],
            'pre_state_sha256': tx['pre_restore_state_sha256'], 'computed_pre_sha256': preh,
            'post_state_sha256': tx['post_restore_state_sha256'], 'computed_post_sha256': posth})
        failures += tables.codes('app_equality_subject', {
            'eq_transaction_id': eq['restore_transaction_id'], 'tx_transaction_id': tx['restore_transaction_id'],
            'eq_safe_point_id': eq['safe_point_id'], 'tx_safe_point_id': tx['safe_point_id'],
            'eq_target_sha256': eq['target_manifest_sha256'], 'computed_target_sha256': mh,
            'eq_pre_sha256': eq['pre_restore_manifest_sha256'], 'computed_pre_sha256': preh,
            'eq_post_sha256': eq['post_restore_manifest_sha256'], 'computed_post_sha256': posth})
        failures += tables.codes('app_equality_scm', {
            'scm_equal_target': eq['scm_equal_target'], 'scm_equal_pre_restore': eq['scm_equal_pre_restore'],
            'post_present': post is not None, 'post_scm': None if post is None else post['scm'],
            'target_scm': mf['scm'], 'pre_scm': pre['scm']})
        failures += tables.codes('app_hold_join', {
            'sp_hold_refs': sp['hold_refs'], 'tx_hold_refs': tx['hold_refs'], 'eq_hold_refs': eq['hold_refs'],
            'eq_fence_active': eq['fence_active'], 'tx_fence_active': tx['fence_active'],
            'eq_path_mutation_count': eq['path_mutation_count'], 'tx_path_mutation_count': tx['path_mutation_count']})
        ops=tx['operations'];op_paths=[o['identity']['canonical_absolute_path'] for o in ops]
        failures += tables.codes('app_operation_order', {
            'operation_ids': [o['operation_id'] for o in ops], 'distinct_operation_ids': len({o['operation_id'] for o in ops}),
            'paths': op_paths, 'distinct_paths': len(set(op_paths)), 'sorted_paths': sorted(op_paths,key=utf8)})
        before={e['identity']['canonical_absolute_path']:e for e in pre['entries']};target={e['identity']['canonical_absolute_path']:e for e in mf['entries']}
        changed=sorted({k for k in before.keys()|target.keys() if before.get(k)!=target.get(k)})
        failures += tables.codes('app_operation_coverage', {'changed_paths': changed, 'operation_paths': op_paths})
        content=('kind','payload_id','blob_sha256','length','symlink_target_hex','gitlink_oid')
        for op in ops:
            path=op['identity']['canonical_absolute_path'];b=before.get(path);t=target.get(path)
            b=b if b and b['present'] else None
            t=t if t and t['present'] else None
            refused=tables.codes('app_operation_present', {'subject_present': (b or t) is not None})
            failures += refused
            if not refused:
                failures += tables.codes('app_operation_subject', {
                    'identity': op['identity'], 'subject_identity': (t or b)['identity'],
                    'expected_before_sha256': op['expected_before_sha256'], 'before_sha256': b['blob_sha256'] if b else None,
                    'target_sha256': op['target_sha256'], 'target_blob_sha256': t['blob_sha256'] if t else None,
                    'expected_before_type': op['expected_before_type'], 'before_kind': b['kind'] if b else None,
                    'target_type': op['target_type'], 'target_kind': t['kind'] if t else None})
            kind=op['operation_kind']
            kind_facts={
                'kind': kind, 'before_present': b is not None, 'target_present': t is not None,
                'before_content': None if b is None else {k: b[k] for k in content},
                'target_content': None if t is None else {k: t[k] for k in content}}
            failures += tables.codes('app_operation_presence', kind_facts)
            failures += tables.codes('app_operation_kind', {
                'kind': kind, 'before_present': b is not None, 'target_present': t is not None,
                'before_content': None if b is None else {k: b[k] for k in content},
                'target_content': None if t is None else {k: t[k] for k in content}})
            failures += tables.codes('app_operation_staging', {
                'kind': kind, 'stage_ref': op['stage_ref'], 'tombstone_ref': op['tombstone_ref']})
        failures += tables.codes('app_journal_lease', {'mutation_lease_ref': tx['mutation_lease_ref']})
        failures += tables.codes('app_journal', {
            'operation_cursor': tx['operation_cursor'], 'operation_count': len(ops),
            'path_mutation_count': tx['path_mutation_count'], 'mutation_lease_ref': tx['mutation_lease_ref'],
            'updated_at_utc': tx['updated_at_utc'], 'result_ts': p['ts'],
            'restart_count': tx['restart_count'], 'recovered_after_restart': p['recovered_after_restart']})
        outcome=p['restore_outcome'];count=tx['path_mutation_count']
        # The closed Result schema admits exactly these five outcomes.
        equality={
            'restored_clean': ('app_outcome_clean', {'phase': tx['phase'], 'post_sha256': posth, 'target_sha256': mh,
                               'scm_equal_target': eq['scm_equal_target'], 'operation_cursor': tx['operation_cursor'], 'operation_count': len(ops)}),
            'restore_failed': ('app_outcome_failed', {'phase': tx['phase'], 'post_sha256': posth, 'pre_sha256': preh,
                               'scm_equal_pre_restore': eq['scm_equal_pre_restore']}),
            'restore_skipped': ('app_outcome_skipped', {'phase': tx['phase'], 'target_sha256': mh, 'pre_sha256': preh,
                                'post_sha256': posth, 'path_mutation_count': count}),
            'restore_refused': ('app_outcome_refused', {'phase': tx['phase'], 'post_sha256': posth, 'pre_sha256': preh,
                                'path_mutation_count': count}),
            'restore_recovery_required': ('app_outcome_recovery', {'phase': tx['phase'], 'fence_active': tx['fence_active'],
                                          'hold_refs': tx['hold_refs'], 'post_sha256': posth, 'target_sha256': mh, 'pre_sha256': preh}),
        }
        phase,facts=equality[outcome]
        state={'app_outcome_clean': 'app_outcome_clean_state', 'app_outcome_failed': 'app_outcome_failed_state',
               'app_outcome_skipped': 'app_outcome_skipped_state', 'app_outcome_refused': 'app_outcome_refused_state',
               'app_outcome_recovery': 'app_outcome_recovery_holds'}.get(phase)
        failures += (tables.codes(state, facts) if state else [])+tables.codes(phase, facts)
        failures += tables.codes('app_outcome_fence', {'fence_active': tx['fence_active'], 'outcome': outcome})
        if outcome in ('restored_clean','restore_failed'):
            state='applied' if outcome=='restored_clean' else 'rolled_back'
            failures += tables.codes('app_outcome_operations', {
                'states': [o['state'] for o in ops], 'expected_state': state,
                'operation_cursor': tx['operation_cursor'], 'operation_count': len(ops)})
        if outcome in ('restore_skipped','restore_refused'):
            failures += tables.codes('app_no_mutation', {'operation_cursor': tx['operation_cursor'], 'states': [o['state'] for o in ops]})
    return failures

def materialization_failures(family, candidate, bank):
    graph,validator=context(family)
    facts = schema_facts(validator('materialization'), candidate)
    refused = tables.codes('mat_schema', facts)
    if refused: return refused
    refused = tables.codes('mat_integer_slots', facts)
    if refused: return refused
    source,event,custody=(candidate[k] for k in ('source','event','custody'))
    refused = tables.codes('mat_numbers', {'bank_epoch_type': type(bank['writer_epoch']).__name__})
    if refused: return refused
    refused = tables.codes('mat_replay', {'replay_policy': event['replay_policy']})
    if refused: return refused
    p, payload_errors = event_payload(family, event, bank)
    if payload_errors: return payload_errors
    req=source['original_request'];scope=req['scope'];ctx=req['execution_context']
    refused = tables.codes('mat_payload_schema', schema_facts(validator('Result'), p))
    if refused: return refused
    failures=[]
    # Independently selected immutable source, not self-authentication by its hash.
    if selected_source_failures(family,source,bank): failures.append('original_source_not_selected')
    failures += tables.codes('mat_source_owner', {
        'source_storage': source['storage_instance_id'], 'bank_storage': bank['storage_instance_id'],
        'source_epoch': source['writer_epoch'], 'bank_epoch': bank['writer_epoch'],
        'result_equal': source['original_result']==p})
    failures += tables.codes('mat_source_commitment', {
        'computed_commitment': source_commitment_or_none(source), 'recorded_commitment': source['accepted_source_sha256']})
    slug=family.replace('.','_')
    failures += tables.codes('mat_selectors', {
        'event_type': event['event_type'], 'family': family, 'payload_schema_id': event['payload_schema_id'],
        'expected_schema_id': load(f'Plans/event_payloads/{slug}_v2.schema.json')['$id']})
    if not payload_owner.semantic(p, inline=event['payload_ref'] is None): failures.append('payload_semantics')
    failures += tables.codes('mat_request_context', {
        'request_scope': req['scope'], 'payload_scope': p['scope'],
        'request_context': req['execution_context'], 'payload_context': p['execution_context'],
        'request_operation': req['operation_id'], 'payload_operation': p['operation_id']})
    for k in graph['request_payload_joins']:
        if tables.refused('mat_request_subject', {'request_value': req.get(k), 'payload_value': p.get(k)}):
            failures.append('request_subject_join:'+k)
    failures += tables.codes('mat_envelope_kind', {'event_scope_kind': event['scope_kind'], 'scope_kind': scope['scope_kind']})
    failures += tables.codes('mat_envelope_subject', {
        'event_project_id': event['project_id'], 'scope_project_id': scope['project_id'],
        'event_thread_id': event['thread_id'], 'ctx_thread_id': ctx['thread_id'],
        'event_run_id': event['run_id'], 'ctx_run_id': ctx['run_id'],
        'event_node_id': event['node_id'], 'payload_node_id': p.get('node_id'),
        'event_attempt_id': event['attempt_id'], 'payload_attempt_id': p.get('attempt_id'),
        'event_actor': event['actor_ref'], 'request_actor': req['actor_ref']})
    key,eid=payload_owner.identity(family,p)
    failures += tables.codes('mat_envelope_meta', {
        'occurred_at_utc': event['occurred_at_utc'], 'payload_ts': p['ts'],
        'correlation_id': event['correlation_id'], 'request_operation': req['operation_id'],
        'redaction_profile': event['redaction_profile'], 'replay_policy': event['replay_policy'],
        'idempotency_key': event['idempotency_key'], 'computed_key': key,
        'event_id': event['event_id'], 'computed_event_id': eid})
    members=source['body_members']
    roles=graph.get('application_required_body_roles',graph['required_body_roles']) if scope['scope_kind']=='application' else graph['required_body_roles']
    failures += tables.codes('mat_body_roles', {'roles': sorted(m['role'] for m in members), 'required': sorted(roles)})
    for member in members+[{'ref':req['original_input_ref'],'sha256':req['original_input_sha256']}]:
        raw=bank['bodies'].get(member['ref'])
        failures += tables.codes('mat_body_member', {
            'raw_type': type(raw).__name__, 'recorded_sha256': member['sha256'],
            'computed_sha256': hashlib.sha256(bytes.fromhex(raw)).hexdigest() if isinstance(raw,str) else None})
    if family in ('filesafe.destructive_override_granted','filesafe.destructive_override_requested','safe_point.created','safe_point.restored'):
        facts={k: ctx[k] for k in ('thread_id','run_id','root_id','root_generation','working_directory')}
        failures += tables.codes('mat_effect_run', facts)+tables.codes('mat_effect_context', facts)
    if scope['scope_kind']=='application' and family.startswith('safe_point.'):
        failures += tables.codes('mat_application_ids', {'node_id': p['node_id'], 'attempt_id': p['attempt_id']})
        failures.extend(application_original_failures(family,candidate,bank))
    if family=='filesafe.destructive_override_granted':
        granted=p['authorized_scope'];requested=req['requested_scope']
        if not (payload_owner.override_scope_semantic(requested,p) and payload_owner.override_subset(granted,requested)):
            failures.append('grant_subset')
        failures += tables.codes('mat_grant_order', {
            'issued_us': payload_owner.instant_us(p['issued_at']), 'expires_us': payload_owner.instant_us(p['expires_at'])})
        failures += tables.codes('mat_grant_window', {
            'expires_us': payload_owner.instant_us(p['expires_at']),
            'maximum_us': payload_owner.instant_us(req['maximum_expires_at']), 'ts_us': payload_owner.instant_us(p['ts'])})
    if 'native_project_record' in source:
        original=source['native_project_record']
        role=next(m for m in members if m['role']==graph['original_project_body_role'])
        raw=bank['bodies'].get(role['ref'])
        failures += tables.codes('mat_project_body_present', {'raw_type': type(raw).__name__})
        try:
            original_bytes = storage_owner().canonical_messagepack_bytes(original)
        except (KeyError, ValueError, TypeError, OverflowError):
            original_bytes = None
        failures += tables.codes('mat_project_original', {
            'original_project_id': original['project_id'], 'scope_project_id': scope['project_id'],
            'raw_type': type(raw).__name__,
            'body_equal': isinstance(raw,str) and original_bytes is not None and bytes.fromhex(raw)==original_bytes})
        for key in graph['original_project_joins']:
            expected=scope['project_id'] if key=='project_id' else p.get(key)
            if tables.refused('mat_project_subject', {'original_value': original.get(key), 'expected_value': expected}):
                failures.append('original_project_subject:'+key)
        if family=='safe_point.created':
            failures += tables.codes('mat_capture_origin', {
                'created_at': original['created_at_utc'], 'payload_ts': p['ts'],
                'created_by': original['created_by_actor_ref'], 'request_actor': req['actor_ref']})
    if family=='safe_point.created':
        fields=('worktree_id','worktree_path','branch_name','HEAD_sha')
        failures += tables.codes('mat_capture_worktree', {'any_present': any(k in p for k in fields), **{k: p.get(k) for k in fields}})
        # Independent manifest metadata in the synthetic owner bank, not event declarations.
        failures += tables.codes('mat_manifest_identity', {
            'bank_manifest': bank['manifests'].get(source['source_ref']),
            'payload_manifest': {k:p.get(k) for k in fields+('snapshot_manifest_ref','snapshot_manifest_sha256','content_state_sha256')}})
    if family=='filesafe.policy_degraded':
        failures += tables.codes('mat_policy_degraded', {'intact': p['authoritative_enforcement_intact']})
    failures += tables.codes('mat_receipt_ids', {
        'custody_storage': custody['storage_instance_id'], 'source_storage': source['storage_instance_id'],
        'custody_event_id': custody['event_id'], 'event_id': event['event_id'],
        'custody_event_type': custody['event_type'], 'event_type': event['event_type'],
        'custody_key': custody['idempotency_key'], 'idempotency_key': event['idempotency_key'],
        'custody_partition': custody['scope_partition'], 'scope_partition': scope['scope_partition']})
    receipt=custody['first_append_receipt']
    digest, jcs = producer_facts(event)
    refused = tables.codes('producer_jcs', jcs)
    failures += refused or tables.codes('mat_semantic_digest', {'custody_digest': custody['producer_semantic_digest'], 'computed_digest': digest})
    commitment, reason = full_value_facts(event)
    refused = tables.codes('full_value_bytes', {'reason': reason})
    failures += refused or tables.codes('mat_full_value', {
        'custody_commitment': custody['original_event_value_commitment']['sha256'], 'computed_commitment': commitment})
    receipt_facts = {'durability_state': receipt['durability_state']}
    failures += tables.codes('mat_receipt_state', receipt_facts)
    failures += tables.codes('mat_receipt_values', {
        'receipt_event_id': receipt['event_id'], 'event_id': event['event_id'],
        'receipt_sequence_id': receipt['sequence_id'], 'sequence_id': event['sequence_id'],
        'durability_class': receipt['durability_class'], 'durability_state': receipt['durability_state'],
        'issued_equal': bank['issued'].get(event['event_id'])=={'event':event,'custody':custody}})
    return failures

def issued_failures(family, value, expected, bank):
    """Resolve complete issued authority without reopening disposed domain controls."""
    refused = tables.codes('issued_shape', {
        'value_type': type(value).__name__, 'keys': sorted(value) if isinstance(value, dict) else None})
    if refused: return refused
    _, validator = context(family)
    refused = tables.codes('issued_original', {'equal': value == expected})
    if refused: return refused
    event, custody = value['event'], value['custody']
    schema = load(f'Plans/filesafe_event_sources/{family.replace(".","_")}.schema.json')
    # Validate the two exact imported roots, without requiring an original command/grant.
    for key in ('event', 'custody'):
        selected = schema_graph.SlotValidator(schema['$defs']['materialization']['properties'][key],
            registry=validator('materialization')._registry, format_checker=schema_graph.format_checker())
        refused = tables.codes('issued_schema', schema_facts(selected, value[key]))
        if refused: return refused
    payload, payload_errors = event_payload(family, event, bank)
    if payload_errors: return payload_errors
    _, selected = context(family)
    refused = tables.codes('issued_payload_schema', schema_facts(selected('Result'), payload))
    if refused: return refused
    if not payload_owner.semantic(payload, inline=event['payload_ref'] is None):
        return ['issued_payload']
    refused = tables.codes('issued_receipt_ids', {
        'custody_event_id': custody['event_id'], 'event_id': event['event_id'],
        'custody_event_type': custody['event_type'], 'family': family,
        'custody_key': custody['idempotency_key'], 'idempotency_key': event['idempotency_key']})
    if refused: return refused[:1]
    receipt = custody['first_append_receipt']
    digest, jcs = producer_facts(event)
    refused = tables.codes('producer_jcs', jcs) or tables.codes('issued_semantic_digest', {
        'custody_digest': custody['producer_semantic_digest'], 'computed_digest': digest})
    if refused: return ['issued_full_value_receipt'] if refused != ['producer_digest_unavailable'] else refused
    commitment, reason = full_value_facts(event)
    refused = tables.codes('full_value_bytes', {'reason': reason}) or tables.codes('issued_full_value', {
        'custody_commitment': custody['original_event_value_commitment']['sha256'], 'computed_commitment': commitment})
    if refused: return ['issued_full_value_receipt'] if refused != ['full_value_unavailable'] else refused
    refused = tables.codes('issued_receipt_state', {'durability_state': receipt['durability_state']})
    if refused: return refused
    return tables.codes('issued_receipt_values', {
        'receipt_event_id': receipt['event_id'], 'event_id': event['event_id'],
        'receipt_sequence_id': receipt['sequence_id'], 'sequence_id': event['sequence_id'],
        'durability_state': receipt['durability_state'], 'durability_class': receipt['durability_class']})[:1]


# --- SP-1101 retained originals (shared RetainedDispatcher) ---------------------------------
# The synthetic bank's original_custody map models Storage's sealed custody catalogue: for each
# issued original (and each original source) it records the write-time edition and the SHA-256
# manifest of the frozen resources the original was written against. The installed
# tuple -> frozen-verifier map is built from this head's resource bytes, outside request data;
# an original whose recorded manifest differs (a replaced same-URI resource) resolves to no
# verifier. The static model has one Server, so server_id is a fixed constant on both sides;
# the binding's commitment field carries the CV-339 original event value commitment of the
# EventRecord original (the original source commitment stays bound by the selected-source rows).
DF_SERVER = 'filesafe-static-oracle'
DF_EDITIONS = ('DF-prepared-v2',)
LOCAL_SOURCE_PROFILES = {'project': 'pm.filesafe.original_source.canonical_msgpack_sha256.v1',
                         'application': 'pm.application.semantic_hash.v1:accepted_source'}


@lru_cache(maxsize=None)
def resource_manifest(family):
    """SHA-256 of the frozen resource manifest: every selected and preserved resource's bytes."""
    graph = context(family)[0]
    rows = [[row['path'], hashlib.sha256((ROOT / row['path']).read_bytes()).hexdigest()]
            for row in graph['resources'] + graph['preserved_project_resources']]
    return hashlib.sha256(qualified_jcs(rows)).hexdigest()


def frozen_codecs(family):
    """The application body codec map of the installed (this head's) frozen edition."""
    return dict(context(family)[0]['application_body_codecs'])


def recipe_tuple(family, scope_kind, edition, manifest):
    slug = family.replace('.', '_')
    payload_schema = load(f'Plans/event_payloads/{slug}_v2.schema.json')
    graph = context(family)[0]
    return RecipeTuple(
        envelope_schema_id='pm.event.v0', envelope_schema_version='2.0.0',
        payload_schema_id=payload_schema['$id'], payload_schema_version='2.0.0',
        owner_source_id=graph['schema_id'], owner_edition=edition,
        registry_revision='prepared-unadmitted:' + family, identity_recipe='df-event-v2',
        producer_recipe='CV-317 RFC8785 producer projection', physical_profile=EVENT_VALUE,
        full_value_profile='pm.storage.original_event_value_commitment.v1@1.0.0',
        local_source_profile=LOCAL_SOURCE_PROFILES[scope_kind], payload_profile='SP-337 RFC8785 application/json',
        resource_manifest_sha256=manifest)


def binding_of(value):
    """The SP-1101 binding of one {event, custody} original (raises Refusal on a malformed one)."""
    event, custody = value['event'], value['custody']
    return OriginalBinding(
        storage_instance_id=custody['storage_instance_id'], scope_kind=event['scope_kind'], server_id=DF_SERVER,
        project_id=event['project_id'], event_type=event['event_type'], event_id=event['event_id'],
        idempotency_key=event['idempotency_key'], owner_operation_id=event['correlation_id'],
        source_commitment=custody['original_event_value_commitment']['sha256'])


class DFOriginalOwner:
    """The original owner over the bank's sealed custody: authenticated originals, never request data."""

    def __init__(self, family, bank):
        self.family, self.bank = family, bank

    def authenticated_original(self, original_ref):
        value = self.bank['issued'].get(original_ref)
        entry = (self.bank.get('original_custody') or {}).get(original_ref)
        if not isinstance(value, dict) or set(value) != {'event', 'custody'} or not isinstance(entry, dict):
            raise Refusal('original_missing')
        binding = binding_of(value)
        recipe = recipe_tuple(self.family, binding.scope_kind, entry.get('write_time_edition', ''),
                              entry.get('resource_manifest_sha256', ''))
        return OriginalCustody(binding=binding, recipe=recipe,
                               record_bytes=storage_value_bytes(value['event'], profile=EVENT_VALUE),
                               result_bytes=storage_value_bytes(value['event']['payload'], profile=EVENT_VALUE),
                               receipt_bytes=storage_value_bytes(value['custody'], profile=EVENT_VALUE))


def installed_recipes(family, verify):
    """The exact tuple -> frozen verifier map, installed from this head's resources outside request data."""
    manifest = resource_manifest(family)
    return {recipe_tuple(family, kind, edition, manifest): FrozenRecipe(verify)
            for edition in DF_EDITIONS for kind in ('project', 'application')}


def retained_failures(family, event_id, expected, bank):
    """Resolve one retained original through SP-1101, then verify it under its frozen recipe.

    One authenticated recipe selection from Storage custody (no caller override, no
    current-then-legacy probing); the frozen verifier recomputes the complete original
    (issued rows) joined to the independently retained expectation.
    """
    found = []

    def verify(custody):
        found.extend(issued_failures(family, bank['issued'].get(event_id), expected, bank))
        return not found
    try:
        expected_binding = binding_of(expected)
        RetainedDispatcher(DFOriginalOwner(family, bank), installed_recipes(family, verify)).resolve(
            event_id, expected_binding, disclose=lambda binding: True)
        reason = None
    except Refusal as error:
        reason = error.reason
    if found:
        return found
    facts = {'reason': reason}
    return tables.codes('retained_dispatch', facts) + tables.codes('retained_dispatch_other', facts)


def materialization_raw_failures(family, raw, bank):
    """A current candidate given as JSON text: CV-1100 current raw grammar, then materialization."""
    try:
        candidate, reason = loads_current_json(raw), None
    except Refusal as error:
        candidate, reason = None, error.reason
    refused = tables.codes('current_raw_json', {'reason': reason})
    if refused:
        return refused
    return materialization_failures(family, candidate, bank)


def generation_refused(bank_value, oracle_value):
    """Reused reader-generation compare-and-set boundary (exact integers, then equality)."""
    return tables.refused('proto_reader_generation', {
        'bank_type': type(bank_value).__name__, 'oracle_type': type(oracle_value).__name__,
        'bank_generation': bank_value, 'oracle_generation': oracle_value})


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
        if tables.refused('proto_resolve_storage', {
                'bank_storage': self.bank['storage_instance_id'], 'custody_storage': original['custody']['storage_instance_id']}):
            return None
        return None if retained_failures(self.family,original['event']['event_id'],expected,self.bank) else value
    def coverage_valid(self):
        if tables.refused('proto_coverage_generation', {
                'bank_type': type(self.bank['source_generation']).__name__, 'oracle_type': type(self.source_generation).__name__,
                'bank_generation': self.bank['source_generation'], 'oracle_generation': self.source_generation}):
            return False
        if tables.refused('proto_coverage_keys', {'issued_keys': sorted(self.bank['issued']), 'boundary_keys': sorted(self.boundary)}):
            return False
        unverified=len([k for k,v in self.boundary.items() if retained_failures(self.family,k,v,self.bank)])
        return not tables.refused('proto_coverage_verified', {'unverified_count': unverified})
    def step(self,action,candidate=None):
        c=candidate or self.original
        # Eligibility is independent of the producer semantic digest. Keep its
        # Storage-owned field selection and retained-issued lookup unchanged.
        if action in ('owner_commit','prepare','append','receipt','retry'):
            refused=tables.first('proto_replay', {'replay_policy': c['event']['replay_policy']})
            if refused: return refused
        if action not in ('crash','recover'):
            refused=tables.first('proto_crashed', {'crashed': self.crashed})
            if refused: return refused
        if action=='owner_commit':
            refused=tables.first('proto_commit_fence', {'writer_fenced': self.writer_fenced})
            if refused: return refused
            refused=tables.first('proto_commit_source', {'failure_count': len(materialization_failures(self.family,c,self.bank))})
            if refused: return refused
            refused=tables.first('proto_commit_phase', {'phase': self.phase})
            if refused: return refused
            self.phase='owner_committed';self.original_owner_actions+=1
            self.durable.update(phase=self.phase,original=copy.deepcopy(c),pending=True)
            return self.phase
        if action=='prepare':
            refused=tables.first('proto_prepare_gate', {'phase': self.phase, 'recovery_refused': self.durable['recovery_refused']})
            if refused: return refused
            refused=tables.first('proto_prepare_payload', {'payload_error_count': len(event_payload(self.family,self.durable['original']['event'],self.bank)[1])})
            if refused: return refused
            self.prepared=copy.deepcopy(self.durable['original']['event']);self.phase='prepared'
            self.durable['phase']=self.phase;return self.phase
        if action=='append':
            refused=tables.first('proto_append_gate', {'phase': self.phase, 'recovery_refused': self.durable['recovery_refused']})
            if refused: return refused
            refused=tables.first('proto_append_payload', {'payload_error_count': len(event_payload(self.family,self.prepared,self.bank)[1])})
            if refused: return refused
            self.issued=copy.deepcopy(self.prepared);self.phase='appended'
            self.durable['phase']=self.phase;return self.phase
        if action=='receipt':
            refused=tables.first('proto_receipt_phase', {'phase': self.phase})
            if refused: return refused
            refused=tables.first('proto_receipt_recovery', {'recovery_refused': self.durable['recovery_refused']})
            if refused: return refused
            refused=tables.first('proto_receipt_source', {'failure_count': len(materialization_failures(self.family,c,self.bank))})
            if refused: return refused
            refused=tables.first('proto_receipt_issued', {'issued_resolved': self.resolve_issued() is not None})
            if refused: return refused
            self.receipt=copy.deepcopy(self.resolve_issued()['custody']);self.phase='receipted'
            self.durable['phase']=self.phase;return self.phase
        if action=='terminal':
            refused=tables.first('proto_terminal_gate', {'recovery_refused': self.durable['recovery_refused'], 'receipt_present': self.receipt is not None})
            if refused: return refused
            refused=tables.first('proto_terminal_issued', {'issued_resolved': self.resolve_issued() is not None})
            if refused: return refused
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
            if phase in ('receipted','terminal'):
                refused=tables.first('proto_recover_issued', {'issued_resolved': issued is not None})
            else:
                refused=tables.first('proto_recover_source', {'failure_count': len(materialization_failures(self.family,original,self.bank))})
            if refused:
                self.durable['recovery_refused']=True
                return refused
            self.durable['recovery_refused']=False;self.phase=phase
            if phase in ('prepared','appended','receipted','terminal'):self.prepared=copy.deepcopy(original['event'])
            if phase in ('appended','receipted','terminal'):self.issued=copy.deepcopy(issued['event'])
            if phase in ('receipted','terminal'):self.receipt=copy.deepcopy(issued['custody'])
            return self.phase
        if action=='retry':
            refused=tables.first('proto_retry_gate', {'recovery_refused': self.durable['recovery_refused'], 'durable_phase': self.durable['phase']})
            if refused: return refused
            original=self.durable['original']['event']
            retry_digest, jcs = producer_facts(c['event'])
            refused=tables.first('producer_jcs', jcs)
            if refused: return refused
            refused=tables.first('proto_retry_semantic', {
                'retry_digest': retry_digest, 'original_digest': producer_semantic_digest(original)})
            if refused: return refused
            value=self.resolve_issued()
            refused=tables.first('proto_retry_result', {'issued_resolved': value is not None, 'receipt_present': self.receipt is not None})
            if refused: return refused
            return copy.deepcopy(value)
        if action=='withdraw_writer':self.writer_fenced=True;return 'writer_fenced'
        if action=='withdraw_reader':
            refused=tables.first('proto_withdraw_reader', {'writer_fenced': self.writer_fenced, 'pending': self.durable['pending']})
            if refused: return refused
            self.reader_fenced=True;return 'reader_fenced'
        if action=='rebuild':
            refused=tables.first('proto_rebuild_gate', {'reader_fenced': self.reader_fenced})
            if refused: return refused
            self.rebuilt=None
            refused=tables.first('proto_rebuild_pending', {'pending': self.durable['pending']})
            if refused: return refused
            if not self.coverage_valid():return 'survivor_verification_failed'
            self.rebuilt=copy.deepcopy(self.bank['issued']);return 'retained_survivors_verified'
        if action=='publish_reader':
            if (tables.refused('proto_publish_gate', {
                    'reader_fenced': self.reader_fenced, 'rebuilt_present': self.rebuilt is not None,
                    'rebuilt_equal': self.rebuilt == self.bank['issued']})
                or not self.coverage_valid()
                or generation_refused(self.bank['reader_generation'], self.reader_generation)):
                return 'verified_rebuild_required'
            self.bank['reader_generation']+=1;self.reader_generation+=1
            self.reader_fenced=False;return 'reader_generation_published'
        if action in ('read','read_body'):
            refused=tables.first('proto_read_fence', {'reader_fenced': self.reader_fenced})
            if refused: return refused
            # Historical authority is the independently retained issued value and
            # unchanged first receipt, not the current writer's epoch/controls.
            eid=c['event']['event_id'];expected=self.boundary.get(eid)
            value=self.bank['issued'].get(eid)
            if (tables.refused('proto_read_boundary', {'boundary_present': expected is not None})
                or tables.refused('proto_read_custody', {
                    'bank_boundary_equal': self.bank['retained_boundary'].get(eid)==expected,
                    'candidate_equal': {k:c[k] for k in ('event','custody')}==expected,
                    'bank_storage': self.bank['storage_instance_id'], 'custody_storage': expected['custody']['storage_instance_id']})
                or generation_refused(self.bank['reader_generation'], self.reader_generation)
                or retained_failures(self.family,eid,expected,self.bank)):
                return 'read_unavailable'
            if action=='read_body':
                # A separate body-dependent request retains the original owner's
                # availability fence. An event-row read never recreates a body.
                source=c['source'];request=source['original_request']
                if (tables.refused('proto_body_schema', {'errors': schema_errors(context(self.family)[1]('source'), source)})
                    or selected_source_failures(self.family,source,self.bank)
                    or tables.refused('proto_body_commitment', {'computed': source_commitment_or_none(source), 'recorded': source['accepted_source_sha256']})
                    or tables.refused('proto_body_result', {'result_equal': source['original_result']==event_payload(self.family,c['event'],self.bank)[0]})):
                    return 'read_unavailable'
                members=source['body_members']+[{'ref':request['original_input_ref'],
                                                'sha256':request['original_input_sha256']}]
                for member in members:
                    raw=self.bank['bodies'].get(member['ref'])
                    if tables.refused('proto_body_member', {
                            'raw_type': type(raw).__name__, 'recorded_sha256': member['sha256'],
                            'computed_sha256': hashlib.sha256(bytes.fromhex(raw)).hexdigest() if isinstance(raw,str) else None}):
                        return 'read_unavailable'
                if self.family.startswith('safe_point.') and request['scope']['scope_kind']=='application' and application_original_failures(self.family,c,self.bank):
                    return 'read_unavailable'
            return 'original_history_no_effect'
        raise ValueError('unknown action '+action)

def mutate(document,path,value,remove=False):
    parts=path.split('/')[1:];node=document
    for part in parts[:-1]:node=node[int(part)] if isinstance(node,list) else node[part]
    key=int(parts[-1]) if isinstance(node,list) else parts[-1]
    if remove:del node[key]
    else:node[key]=copy.deepcopy(value)

def check(families=FAMILIES, pack=None):
    pack=load('Plans/filesafe_event_authority_fixtures.json') if pack is None else pack
    failures=tables.codes('fixture_census', {'families': [r['event_type'] for r in pack['families']]})
    failures+=schema_graph.format_case_failures();counts={}
    order=tables.table_order_errors()
    if order:failures.append('shared:table_require_order:'+','.join(order))
    for row in pack['families']:
        if row['event_type'] not in families: continue
        family=row['event_type'];counts[family]={'positive':0,'negative':0,'protocol':0}
        graph_errors=graph_failures(family)
        failures += [family+':'+f for f in graph_errors]
        if any(f.startswith('unresolved_schema_ref:') for f in graph_errors):
            continue
        graph,_=context(family)
        for policy in ('PENDING_RETENTION_DECISION','RP-AUTHORITY-INDEFINITE','RP-OPERATIONAL-2555D','RP-RUNTIME-365D'):
            if policy!=graph['retention_policy_ref'] and not retention_binding_failures(family,policy):
                failures.append(family+':wrong_retention_assignment_accepted')
        if real_admission(family)!='missing_event_registration':failures.append(family+':membership_changed')
        for case in row['positive']:
            found=materialization_failures(family,case['candidate'],case['bank'])
            expected={k:case['candidate'][k] for k in ('event','custody')}
            for stored in ('issued','retained_boundary'):
                found += issued_failures(family,case['bank'][stored].get(expected['event']['event_id']),expected,case['bank'])
            if found:failures.append(case['id']+':'+','.join(found))
            counts[family]['positive']+=1
        base=row['positive'][0]
        for case in row['negative']:
            negative_base=row['positive'][case.get('positive_index',0)]
            candidate,bank=copy.deepcopy((negative_base['candidate'],negative_base['bank']))
            for edit in case['edits']:
                mutate(candidate if edit['target']=='candidate' else bank,edit['path'],edit.get('value'),edit.get('remove',False))
            if case.get('layer') == 'issued':
                expected={k:candidate[k] for k in ('event','custody')}
                found=issued_failures(family,bank['issued'].get(candidate['event']['event_id']),expected,bank)
            else:
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
    import pm_filesafe_p2a_cases as p2a
    if families:
        failures.extend(p2a.case_failures(set(families) | {'shared'}, boundary=(
            'materialization', 'materialization_raw', 'issued', 'protocol', 'graph', 'retention_binding', 'retention_check', 'membership', 'census')))
    return {'status':'fail' if failures else 'pass','families':counts,'failures':failures,'native_execution':'NOT_RUN','membership':'ABSENT','authority':'synthetic contract cases only'}


if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family', choices=FAMILIES)
    args=parser.parse_args()
    result=check((args.family,) if args.family else FAMILIES);print(json.dumps(result,indent=2));raise SystemExit(result['status']!='pass')
