#!/usr/bin/env python3
"""DT contract oracles: schema, original-source, transition, recovery and checkpoint vectors.

Models assume the named original-owner/SP-278 authentication adapters. They do not
execute native Storage, redb, provider or Git operations and never admit a family.
"""
import base64
import copy
import hashlib
import json
import struct
import rfc8785
from pm_event_index_binding import binding_bytes
from datetime import datetime
from decimal import Decimal
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
ROOT = Path(__file__).resolve().parents[1]
PRODUCER_FIELDS = (
    'event_type', 'scope_kind', 'project_id', 'thread_id', 'run_id', 'node_id',
    'attempt_id', 'actor_ref', 'requested_account_ref', 'effective_account_ref',
    'occurred_at_utc', 'producer_sequence_id', 'correlation_id', 'causation_event_id',
    'parent_event_id', 'idempotency_key', 'payload_schema_id', 'payload', 'payload_ref',
    'redaction_profile', 'migration',
)


def load(path):
    return json.loads((ROOT / path).read_text())


def canonical(value):
    """pm.dt.source.json.v1: exact integers, plain finite decimals, UTF-8 key order."""
    def encode(v):
        if v is None:
            return 'null'
        if isinstance(v, bool):
            return 'true' if v else 'false'
        if isinstance(v, int):
            return str(v)
        if isinstance(v, (float, Decimal)):
            d = Decimal(str(v))
            if not d.is_finite():
                raise ValueError('nonfinite number')
            if d == 0:
                return '0'
            s = format(d, 'f')
            return s.rstrip('0').rstrip('.') if '.' in s else s
        if isinstance(v, str):
            v.encode('utf-8', errors='strict')
            return json.dumps(v, ensure_ascii=False, separators=(',', ':'))
        if isinstance(v, list):
            return '[' + ','.join(encode(x) for x in v) + ']'
        if isinstance(v, dict) and all(isinstance(k, str) for k in v):
            return '{' + ','.join(encode(k) + ':' + encode(v[k]) for k in sorted(v, key=lambda x: x.encode('utf-8'))) + '}'
        raise ValueError('unsupported value')
    return encode(value).encode('utf-8')


def decode_source(raw):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError('duplicate key')
            result[key] = value
        return result
    value = json.loads(raw.decode('utf-8'), object_pairs_hook=unique, parse_float=Decimal,
                       parse_constant=lambda _: (_ for _ in ()).throw(ValueError('nonfinite number')))
    if canonical(value) != raw:
        raise ValueError('noncanonical source bytes')
    return value


def sha(value):
    return hashlib.sha256(canonical(value)).hexdigest()


def producer_semantic_bytes(event):
    """CV-EventRecord's exact caller-owned projection and RFC 8785 hash domain.

    This retry oracle's fixtures use RFC 8785's representable numeric domain;
    pm.dt.source.json.v1 remains the separate exact-u64 source custody codec.
    """
    return rfc8785.dumps({key: event[key] for key in PRODUCER_FIELDS})


def producer_semantic_digest(event):
    return hashlib.sha256(producer_semantic_bytes(event)).hexdigest()


def patterned_values(schema, value, path=()):
    """Visit concrete identifier values, including nullable/alternative schemas."""
    if isinstance(value, str) and 'pattern' in schema:
        yield path, value, schema
    if isinstance(value, dict):
        for key, child in value.items():
            yield from patterned_values(schema.get('properties', {}).get(key, {}), child, path + (key,))
    if isinstance(value, list):
        for index, child in enumerate(value):
            yield from patterned_values(schema.get('items', {}), child, path + (index,))
    for keyword in ['anyOf', 'oneOf', 'allOf']:
        for branch in schema.get(keyword, []):
            yield from patterned_values(branch, value, path)


def set_path(value, path, replacement):
    for key in path[:-1]:
        value = value[key]
    value[path[-1]] = replacement


def identifier_checks(c, f, schemas, check):
    """F7: mutate every populated patterned value, not just one token hash."""
    name = c['event_type']; slug = name.replace('.', '_')
    cases = [(slug, f['valid_payload']), (slug + '_source', f['prepared_source']),
             (slug + '_source', f['completed_source']), (slug + '_checkpoint', f['checkpoint'])]
    for variant in f['positive_variants']:
        source = slug + ('_application_source' if variant['event']['scope_kind'] == 'application' else '_source')
        cases.extend([(source, variant['prepared']), (source, variant['completed'])])
    for definition, value in cases:
        validator = Draft202012Validator(schemas[definition], format_checker=FormatChecker())
        for path, identifier, rule in patterned_values(schemas[definition], value):
            exact = rule.get('minLength') == rule.get('maxLength') and 'maxLength' in rule
            check(exact or rule['pattern'].endswith(r'(?![\s\S])'), name + ': full-string identifier guard ' + definition + str(path))
            bad = copy.deepcopy(value); set_path(bad, path, identifier + '\n')
            check(not validator.is_valid(bad), name + ': trailing-LF identifier refused ' + definition + str(path))
    # Keep all token witnesses coherent, so schema grammar alone must refuse.
    for path, identifier, _ in patterned_values(schemas[slug + '_checkpoint'], f['checkpoint']):
        case = copy.deepcopy(f['checkpoint_cases'][0])
        set_path(case['proposed'], path, identifier + '\n')
        case['context']['current_token'] = copy.deepcopy(case['proposed']['index_read_token'])
        case['context']['verified_prefix']['index_read_token'] = copy.deepcopy(case['proposed']['index_read_token'])
        check(checkpoint_result(c, case['previous'], case['proposed'], case['context'], schemas[slug + '_checkpoint']) == 'schema_refused',
              name + ': coherent trailing-LF checkpoint refused ' + str(path))
    # Coherently changed original hash plus payload must still fail grammar.
    hash_join = {'config.migrated': ('source_sha256', 'source_sha256'),
                 'usage.event': ('observation_sha256', 'provider_payload_hash')}.get(name)
    if hash_join:
        for variant in [dict(prepared=f['prepared_source'], completed=f['completed_source'], event=f['event_record'])] + f['positive_variants']:
            a, b, e = (copy.deepcopy(variant[k]) for k in ['prepared', 'completed', 'event'])
            before_field, payload_field = hash_join
            if a['before'][before_field] is None:
                continue
            a['before'][before_field] += '\n'; b['before'][before_field] += '\n'
            b['payload'][payload_field] += '\n'; e['payload'][payload_field] += '\n'
            b['prepared_sha256'] = hashlib.sha256(source_bytes(a)).hexdigest()
            check(source_valid(c, a, b, e, schemas) == 'schema_refused', name + ': coherent trailing-LF payload hash refused')


def partition_for(event):
    if event['scope_kind'] == 'application':
        return 'app' if event['project_id'] is None else None
    if not event['project_id']:
        return None
    return 'project~' + base64.urlsafe_b64encode(event['project_id'].encode()).decode().rstrip('=')


def application_bytes(value):
    """CV-366 physical MessagePack, preserving finite binary64 and exact integers."""
    if isinstance(value, int) and not isinstance(value, bool) and value < 0:
        if value >= -32:
            return bytes([value & 255])
        for minimum, marker, fmt in [(-128, b'\xd0', '>b'), (-32768, b'\xd1', '>h'), (-2147483648, b'\xd2', '>i'), (-9223372036854775808, b'\xd3', '>q')]:
            if value >= minimum:
                return marker + struct.pack(fmt, value)
        raise ValueError('signed integer outside int64')
    if isinstance(value, float):
        if not __import__('math').isfinite(value):
            raise ValueError('nonfinite number')
        return b'\xcb' + struct.pack('>d', value)
    if isinstance(value, list):
        # The shared codec supplies the minimal container header, not a new hash domain.
        header = binding_bytes([None] * len(value))[:len(binding_bytes([None] * len(value))) - len(value)]
        return header + b''.join(application_bytes(x) for x in value)
    if isinstance(value, dict):
        header = binding_bytes({k: None for k in value})
        count = len(value)
        prefix_size = 1 if count < 16 else 3 if count <= 65535 else 5
        return header[:prefix_size] + b''.join(binding_bytes(k) + application_bytes(value[k]) for k in sorted(value, key=lambda k: k.encode('utf-8')))
    return binding_bytes(value)


def source_bytes(value):
    return application_bytes(value) if value['envelope_context']['scope_kind'] == 'application' else canonical(value)


def identity(contract, payload, partition='project~cHJvamVjdC0x', application=None):
    subjects = [str(payload[k]) if isinstance(payload[k], int) else payload[k] for k in contract['identity_fields']]
    if partition == 'app':
        if application is None:
            raise ValueError('missing original application identity')
        operation = sha([contract['event_type'], application['original_owner_operation_id']] + subjects)
        if operation != application['owner_operation_id']:
            raise ValueError('wrong original application operation')
        key = 'application@1:' + application['application_scope']['server_id'].encode().hex() + ':' + operation.encode().hex()
    else:
        # Array elements are strings, without u64/IEEE-754 rounding.
        key = 'dt:' + sha([contract['event_type'], partition] + subjects)
    return key, 'evt_dt_' + hashlib.sha256(key.encode()).hexdigest()


def append_model(seen, key, digest, result):
    if key in seen:
        old_digest, original = seen[key]
        return ('original', original) if old_digest == digest else ('idempotency_conflict', None)
    seen[key] = (digest, copy.deepcopy(result))
    return 'appended', result


def transition(name, payload, before, outcome):
    """The separately authored owner predicates for each exact family."""
    if name in ['gate.evaluation_started', 'gate.failed', 'gate.passed'] and not gate_score_join(payload, before, outcome):
        return False
    if name == 'approval.requested':
        return before['episode_state'] == 'blocked' and bool(payload['allowed_action_ids']) and payload['allowed_action_ids'] == before['allowed_action_ids'] and tool_request_join(payload, before)
    if name == 'approval.granted':
        return before['episode_state'] == 'requested' and before['human_authenticated'] and not before['paused'] and not before['revoked'] and payload['allowed_action_id'] in before['allowed_action_ids'] and tool_request_join(payload, before)
    if name == 'approval.denied':
        return before['episode_state'] == 'requested' and tool_request_join(payload, before)
    if name == 'approval.timeout':
        return before['episode_state'] == 'requested' and time_value(payload['ts']) >= time_value(before['deadline_at_utc']) and tool_request_join(payload, before)
    if name == 'config.migrated':
        return before['first_load'] and payload['legacy_value'] == before['legacy_value'] and payload['source_ref'] == before['source_ref'] and payload['source_sha256'] == before['source_sha256'] and payload['result_ref'] == outcome['committed_settings_ref'] and {'single': 'None', 'per_phase': 'Phase', 'per_task': 'Task'}.get(payload['legacy_value']) == payload['enum_value']
    if name == 'gate.evaluation_started':
        return before['evaluation_state'] == 'allocated' and payload['evaluation_id'] == before['evaluation_id']
    if name == 'gate.failed':
        return before['evaluation_state'] == 'started' and payload['evaluation_id'] == before['evaluation_id'] and payload['gate_id'] == before['gate_id'] and outcome['report_status'] == 'FAIL' and not outcome['question_ids'] and bool(payload['evidence_refs']) and payload['evidence_refs'] == outcome['evidence_refs'] and payload['failure_reason_code'] == outcome['failure_reason_code']
    if name == 'gate.passed':
        return before['evaluation_state'] == 'started' and payload['evaluation_id'] == before['evaluation_id'] and payload['gate_id'] == before['gate_id'] and outcome['report_status'] == 'PASS' and not outcome['question_ids'] and outcome['all_predicates_pass'] and bool(payload['evidence_refs']) and payload['evidence_refs'] == outcome['evidence_refs']
    if name == 'requirements.clarification_requested':
        return before['report_status'] == 'BLOCKED' and bool(before['question_ids']) and all(payload[k] == before[k] for k in ['question_ids', 'report_ref', 'wizard_id', 'thread_id'])
    if name == 'run.background_enqueued':
        return before['queue_state'] == 'committed' and all(payload[k] == before[k] for k in ['enqueue_id', 'queue_record_ref', 'scope_ref', 'host_ref', 'root_ref'])
    if name == 'tool.denied':
        fields = ['denial_reason_code', 'blocked_sequence', 'approval_scope_key', 'blocked_reason_code', 'failure_class', 'allowed_action_ids', 'headless_denied', 'permission_snapshot_id', 'executed_at_all']
        return denial_emission(before) == 'emit' and all(payload[k] == before[k] for k in fields) and not payload['executed_at_all'] and payload['headless_denied'] == (payload['blocked_reason_code'] == 'headless_ask_denied') and payload['failure_class'] is None
    if name == 'tool.execution_completed':
        return before['execution_state'] == 'started' and all(payload.get(k) == outcome[k] for k in ['result_ref', 'outcome', 'duration_ms'])
    if name == 'tool.execution_started':
        return before['execution_state'] == 'admitted' and before['policy_decision'] == 'allow' and before['schema_valid'] and before['hooks_pass']
    if name == 'tool.invoked':
        request = before['web_request']
        meta = payload.get('meta')
        web_join = request is None and meta is None or request is not None and meta is not None and payload['tool_name'] == meta['tool_id'] and all(meta.get(k) == v for k, v in request.items() if k != 'parent_event_id')
        return web_join and before['dispatch_state'] == 'started' and outcome['dispatch_state'] == 'attempted_completed' and all(payload.get(k) == outcome[k] for k in ['success', 'latency_ms', 'index_used', 'meta'])
    if name == 'usage.event':
        previous = before['prior_settlement_status']
        state = payload['settlement_status']
        if previous in ['settled', 'adjusted', 'failed'] and state in ['observed', 'streaming_partial', 'unknown']:
            return False
        if state == 'adjusted' and previous not in ['settled', 'adjusted']:
            return False
        if previous is not None and not before['prior_usage_event_ref']:
            return False
        if state == 'settled' and not payload.get('settled_at_utc'):
            return False
        if state == 'adjusted' and not payload.get('adjusted_at_utc'):
            return False
        return payload.get('parent_run_id') == before['parent_run_id'] and all(payload.get(k) == before[k] for k in ['usage_record_id', 'dedupe_key', 'provider_attempt_ref', 'parent_usage_record_id', 'account_id', 'billing_entity_id', 'provider_account_ref']) and payload['raw_payload_ref'] == before['observation_ref'] and payload['provider_payload_hash'] == before['observation_sha256'] and usage_values_valid(payload)
    if name == 'worktree.created':
        return before['allocation_state'] == 'allocated' and outcome['allocation_state'] == 'created' and all(payload.get(k) == before[k] for k in ['branch_name', 'worktree_path', 'repo_id', 'run_id', 'lane_id', 'package_id'])
    if name == 'worktree.deleted':
        return before['allocation_state'] == 'cleanup_eligible' and outcome['allocation_state'] == 'deleted' and before['elapsed_grace_ms'] >= payload['grace_period_ms'] and before['file_lock_checked'] and payload['file_lock_checked'] and not any(before[k] for k in ['active_lock_refs', 'safe_point_refs', 'terminal_session_refs', 'editor_session_refs', 'blocked_recovery_refs']) and not payload.get('active_lock_refs') and not payload.get('safe_point_refs') and all(payload.get(k) == before[k] for k in ['repo_id', 'run_id', 'lane_id', 'package_id'])
    return False


def gate_score_join(payload, before, outcome):
    """Numeric gate results retain Executor's dispatch context, not a new score policy."""
    if payload.get('score') != outcome['score'] or payload.get('score_threshold') != before['score_threshold']:
        return False
    if any(payload.get(k) != before[k] for k in ['dispatch_score_ref', 'dispatch_score_tuple']):
        return False
    if 'score' in payload or 'score_threshold' in payload:
        context = payload.get('dispatch_score_tuple')
        return context is not None and payload.get('node_id') == context['node_id'] and bool(payload.get('dispatch_score_ref'))
    return True


def denial_emission(before):
    # FileSafe is fenced pending the competing-owner decision, not resolved here.
    if before['denial_origin'] == 'filesafe':
        return 'owner_conflict_stopped'
    if before['denial_origin'] not in ['policy', 'user'] or before['policy_decision'] != 'deny' or before['dispatch_state'] != 'not_dispatched':
        return 'no_emission'
    return 'emit'


def time_value(s):
    return datetime.fromisoformat(s.replace('Z', '+00:00'))


def tool_request_join(payload, before):
    if before['request_kind'] == 'tool':
        return payload.get('tool_use_id') is not None and payload['tool_use_id'] == before['tool_use_id']
    return 'tool_use_id' not in payload and before['tool_use_id'] is None


def usage_values_valid(p):
    cost = p['cost']
    if p['cost_microdollars'] != cost['cost_microdollars']:
        return False
    if any(p[k] != cost[k] for k in ['currency', 'cost_status', 'pricing_snapshot_id', 'pricing_source', 'pricing_effective_at', 'pricing_version']):
        return False
    if cost['cost_status'] == 'unknown' and (cost['cost_microdollars'] is not None or cost['cost_minor_units'] is not None):
        return False
    if cost['cost_status'] in ['hidden_subscription', 'hidden_byok'] and p['display_cost_policy'] == 'show':
        return False
    if cost['cost_status'] in ['priced', 'estimated'] and any(cost[k] is None for k in ['pricing_snapshot_id', 'pricing_source', 'pricing_effective_at', 'pricing_version']):
        return False
    quota = p['quota']
    if quota['quota_status'] in ['unknown', 'disabled', 'not_exposed']:
        if any(quota[k] is not None for k in ['quota_remaining', 'quota_used', 'quota_limit', 'reset_at', 'cooldown_until']):
            return False
    if quota.get('credits_status', 'unknown') in ['unknown', 'disabled', 'not_exposed'] and quota.get('credits_remaining') is not None:
        return False
    if quota['window_kind'] == 'unknown' and (quota['reset_at'] is not None or quota['cooldown_until'] is not None):
        return False
    return True


def accounting_totals(p):
    # cache_write_1h is a subset of cache_write, never a second bucket.
    incoming, outgoing = p['input_total'], p['output_total']
    if incoming is not None and not p['counting_semantics']['cache_is_input_subset']:
        parts = [p['cache_read'], p['cache_write']]
        incoming = incoming + sum(parts) if all(x is not None for x in parts) else None
    if outgoing is not None and not p['counting_semantics']['reasoning_is_output_subset']:
        outgoing = outgoing + p['reasoning'] if p['reasoning'] is not None else None
    return {'input': incoming, 'output': outgoing, 'provider_total': p['provider_total'], 'cost_microdollars': p['cost_microdollars']}


def source_valid(c, prepared, completed, event, schemas, resolved_payload=None, payload_ref_verified=False):
    if event['replay_policy'] == 'projector_replay_only':
        return 'replay_only_not_appendable'
    if event['payload_ref'] is None:
        try:
            if len(application_bytes(event['payload'])) > 16384:
                return 'payload_ref_required'
        except ValueError:
            return 'schema_refused'
    slug = c['event_type'].replace('.', '_')
    source_is_app = completed['envelope_context']['scope_kind'] == 'application'
    source_definition = slug + ('_application_source' if source_is_app else '_source')
    if source_definition not in schemas:
        return 'scope_refused'
    validator = Draft202012Validator(schemas[source_definition], format_checker=FormatChecker())
    if list(validator.iter_errors(prepared)) or list(validator.iter_errors(completed)):
        return 'schema_refused'
    if prepared['stage'] != 'prepared' or completed['stage'] != 'completed' or completed['prepared_sha256'] != hashlib.sha256(source_bytes(prepared)).hexdigest():
        return 'original_source_refused'
    immutable = (['application_scope', 'original_owner_operation_id', 'owner_operation_id'] if source_is_app else []) + ['storage_instance_id', 'scope_partition', 'event_type', 'event_id', 'idempotency_key', 'producer', 'owner_ref', 'owner_revision', 'subject', 'before', 'captured_at_utc', 'runtime_context']
    if any(prepared[k] != completed[k] for k in immutable):
        return 'original_source_refused'
    a, b = prepared['envelope_context'], completed['envelope_context']
    if any(a[k] != b[k] for k in a if k != 'occurred_at_utc'):
        return 'original_source_refused'
    p = completed['payload']
    partition = partition_for(event)
    if event['scope_kind'] != completed['envelope_context']['scope_kind']:
        return 'scope_refused'
    if event['scope_kind'] == 'application' and (completed['application_scope']['scope_partition'] != partition or completed['application_scope']['server_id'] != prepared['application_scope']['server_id']):
        return 'scope_refused'
    if partition != completed['scope_partition'] or (c['scope_policy'] == 'project_only' and event['scope_kind'] != 'project'):
        return 'scope_refused'
    if event['payload_ref'] is not None:
        if not payload_ref_verified or resolved_payload != p:
            return 'payload_unavailable'
    elif event['payload'] != p:
        return 'join_refused'
    if any(event[k] != b[k] for k in b):
        return 'join_refused'
    if event['event_type'] != c['event_type'] or event['payload_schema_id'] != c['payload_schema_id'] or event['replay_policy'] != 'dedupe_by_idempotency_key':
        return 'join_refused'
    if any(p[k] != completed['subject'][k] for k in c['identity_fields']):
        return 'join_refused'
    try:
        key, eid = identity(c, p, partition, completed if partition == 'app' else None)
    except ValueError:
        return 'identity_refused'
    if key != event['idempotency_key'] or eid != event['event_id'] or key != completed['idempotency_key'] or eid != completed['event_id']:
        return 'identity_refused'
    for k in ['run_id', 'thread_id', 'node_id', 'attempt_id', 'project_id']:
        if k in p and p[k] != event[k]:
            return 'join_refused'
    if event['occurred_at_utc'] != p.get('ts', p.get('observed_at_utc')):
        return 'join_refused'
    if any(p.get(k) != v for k, v in completed['runtime_context'].items()):
        return 'join_refused'
    if c['event_type'] == 'usage.event' and p['usage_event_ref'] != eid:
        return 'join_refused'
    if c['event_type'] == 'tool.invoked' and completed['before']['web_request'] is not None and event['parent_event_id'] != completed['before']['web_request'].get('parent_event_id'):
        return 'join_refused'
    if not transition(c['event_type'], p, completed['before'], completed['owner_result']):
        return 'transition_refused'
    return 'accepted'


def batch_join(parent, children):
    p = parent['event']['payload']; pm = p['meta']
    if pm.get('batch_role') != 'parent' or not children:
        return False
    if pm['child_tool_use_ids'] != [v['event']['payload']['tool_use_id'] for v in children] or len(set(pm['child_tool_use_ids'])) != len(children):
        return False
    for child in children:
        e = child['event']; q = e['payload']; cm = q['meta']
        if cm.get('batch_role') != 'child' or cm['batch_id'] != pm['batch_id'] or cm['parent_tool_use_id'] != p['tool_use_id'] or e['parent_event_id'] != parent['event']['event_id'] or not q.get('provider_attempt_ref') or q['tool_use_id'] == p['tool_use_id']:
            return False
        if any(e[k] != parent['event'][k] for k in ['run_id', 'attempt_id', 'project_id', 'scope_kind']):
            return False
    return p['success'] == all(v['event']['payload']['success'] for v in children)


def recovery(c, f, case):
    """Original-owner/receipt adapters are supplied witnesses, not native authentication."""
    if case.get('replay_policy', f['event_record']['replay_policy']) == 'projector_replay_only':
        return {'result': 'replay_only_not_appendable', 'external_effects': 0, 'append_count': 0, 'value': None}
    if not case['admitted']:
        return {'result': 'admission_refused', 'external_effects': 0, 'append_count': 0, 'value': None}
    if not case['source_present'] or not case['owner_proven'] or not case['backup_coherent'] or not case['permission'] or case['deleted']:
        return {'result': 'unavailable', 'external_effects': 0, 'append_count': 0, 'value': None}
    if not case['outcome_committed']:
        return {'result': 'fenced', 'external_effects': 0, 'append_count': 0, 'value': None}
    if not case['completed_present']:
        # Only finalize from the authenticated original outcome; never rerun it.
        return {'result': 'finalize_original', 'external_effects': 0, 'append_count': 0, 'value': f['completed_source']}
    if not case['append_issued']:
        return {'result': 'append_original', 'external_effects': 0, 'append_count': 1, 'value': f['event_record']}
    if not case['receipt_custody'] or not case['full_flush']:
        return {'result': 'fenced', 'external_effects': 0, 'append_count': 0, 'value': None}
    return {'result': 'original', 'external_effects': 0, 'append_count': 0, 'value': {'event': f['event_record'], 'receipt': f['first_append_receipt']}}


def checkpoint_result(c, old, proposed, context, schema):
    if list(Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(proposed)):
        return 'schema_refused'
    if not context['admitted'] or not context['reader_installed'] or context['withdrawn'] or not context['permission'] or context['deleted']:
        return 'unavailable'
    if context['expected_previous'] != old or not context['lease_current']:
        return 'cas_lost'
    if proposed['index_read_token'] != context['current_token']:
        return 'source_changed'
    t = proposed['index_read_token']
    if proposed['storage_instance_id'] != t['storage_instance_id'] or t['source_selection']['storage_instance_id'] != t['storage_instance_id']:
        return 'source_changed'
    if t['checkpoint_key'] != 'event_record_index_checkpoint.v1:' + t['storage_instance_id'] or t['checkpoint_ref'] != t['checkpoint_key'] + '#/generations/' + t['generation_id'] or t['index_dataset_name'] != 'event_record_index.v2@' + t['generation_id']:
        return 'source_changed'
    if proposed['scope_partition'] != context['scope_partition'] or not context['source_verified'] or not context['coverage_complete'] or not context['versions_supported']:
        return 'unavailable'
    rows = context['source_rows']
    prefix = context['verified_prefix']
    expected_prefix = {'index_read_token': proposed['index_read_token'], 'row_set_sha256': sha(rows), 'row_count': len(rows), 'first_sequence_id': rows[0]['sequence_id'] if rows else None, 'through_sequence_id': rows[-1]['sequence_id'] if rows else None}
    if prefix != expected_prefix:
        return 'unavailable'
    through = rows[-1]['sequence_id'] if rows else None
    matches = [r for r in rows if r['event_type'] == c['event_type'] and r['scope_partition'] == proposed['scope_partition']]
    last = matches[-1]['event_id'] if matches else None
    if proposed['examined_through_sequence_id'] != through or proposed['last_applied_event_id'] != last or not proposed['filter_complete']:
        return 'coverage_refused'
    if proposed['state'] != 'current' or proposed['health'] != 'healthy' or proposed['withdrawn_at_utc'] is not None:
        return 'unavailable'
    if old and old['state'] == 'withdrawn' and not context['governed_rebuild']:
        return 'unavailable'
    if old and old['examined_through_sequence_id'] is not None and (through is None or through < old['examined_through_sequence_id']) and not context['governed_rebuild']:
        return 'coverage_refused'
    return 'published'


def main():
    contracts = load('Plans/dt_event_contracts.json')['families']
    schemas = load('Plans/dt_event_contracts.schema.json')['$defs']
    fixtures = {f['event_type']: f for f in load('Plans/dt_event_contract_fixtures.json')['families']}
    registered = {f['event_type'] for f in load('Plans/event_family_registry.json')['families']}
    storage_schemas = {f['value_schema_ref']: f for f in load('Plans/storage_value_registry.json')['families']}
    checks = 0
    failures = []
    counts = {}
    def check(ok, message):
        nonlocal checks
        checks += 1
        if not ok:
            failures.append(message)
    event_validator = Draft202012Validator(load('Plans/event_record.schema.json'), format_checker=FormatChecker())
    for c in contracts:
        start = checks
        name = c['event_type']; slug = name.replace('.', '_'); f = fixtures[name]; p = f['valid_payload']
        for definition in [slug + '_checkpoint', slug + '_source', slug + '_application_source']:
            if definition in schemas:
                ref = 'Plans/dt_event_contracts.schema.json#/$defs/' + definition
                check(storage_schemas[ref]['value_schema'] == schemas[definition], name + ': exact Storage schema mirror ' + definition)
        identifier_checks(c, f, schemas, check)
        validator = Draft202012Validator(schemas[slug], format_checker=FormatChecker())
        check(not list(validator.iter_errors(p)), name + ': positive payload')
        check(name not in registered, name + ': no registry admission')
        for key in f['required_field_negatives']:
            negative = copy.deepcopy(p); del negative[key]
            check(bool(list(validator.iter_errors(negative))), name + ': missing payload ' + key)
        for key, val in [('unexpected', 'refused'), ('schema_id', 'wrong'), ('schema_version', '2.0.0')]:
            check(bool(list(validator.iter_errors(dict(p, **{key: val})))), name + ': invalid payload ' + key)
        prep, done, event = f['prepared_source'], f['completed_source'], f['event_record']
        check(not list(event_validator.iter_errors(event)), name + ': complete current EventRecord envelope')
        check(source_valid(c, prep, done, event, schemas) == 'accepted', name + ': original source accepted')
        for stage in [prep, done]:
            check(decode_source(canonical(stage)) == stage, name + ': source canonical bytes')
            sc = schemas[slug + '_source']; Draft202012Validator.check_schema(sc)
            sv = Draft202012Validator(sc, format_checker=FormatChecker())
            for key in sc['required']:
                bad = copy.deepcopy(stage); del bad[key]
                check(bool(list(sv.iter_errors(bad))), name + ': missing source ' + key)
            check(bool(list(sv.iter_errors(dict(stage, unexpected='refused')))), name + ': closed source')
        check(sha(prep) == f['source_byte_oracle']['prepared_sha256'], name + ': pinned original source digest')
        check(canonical(prep).hex() == f['source_byte_oracle']['prepared_hex'], name + ': pinned original source bytes')
        for case in f['semantic_negatives']:
            a, b = copy.deepcopy(prep), copy.deepcopy(done)
            target = b if case['path'][0] == 'owner_result' else a
            for key in case['path'][:-1]: target = target[key]
            target[case['path'][-1]] = case['value']
            b['before'] = copy.deepcopy(a['before']); b['prepared_sha256'] = sha(a)
            check(source_valid(c, a, b, event, schemas) == case['expected'], name + ': ' + case['case'])
        ref_event = copy.deepcopy(event); ref_event['payload'] = {}; ref_event['payload_ref'] = 'payload:fixture-verified-pack-body'
        check(source_valid(c, prep, done, ref_event, schemas, p, True) == 'accepted', name + ': separately governed payload resolves before joins')
        check(source_valid(c, prep, done, ref_event, schemas, p, False) == 'payload_unavailable', name + ': unverified pack body unavailable')
        check(source_valid(c, prep, done, ref_event, schemas, {}, True) == 'payload_unavailable', name + ': changed pack body unavailable')
        for field, value in [('scope_kind', 'application'), ('project_id', 'wrong-project'), ('run_id', 'wrong-run'), ('actor_ref', 'wrong-actor')]:
            bad = copy.deepcopy(event); bad[field] = value
            check(source_valid(c, prep, done, bad, schemas) != 'accepted', name + ': wrong envelope ' + field)
        for field in c['identity_fields']:
            bad = copy.deepcopy(done); v = bad['subject'][field]; bad['subject'][field] = v + 1 if isinstance(v, int) else v + '-other'
            check(source_valid(c, prep, bad, event, schemas) != 'accepted', name + ': wrong source subject ' + field)
        for case in f['positive_variants']:
            check(not list(event_validator.iter_errors(case['event'])), name + ': variant complete envelope ' + case['case'])
            check(source_valid(c, case['prepared'], case['completed'], case['event'], schemas) == 'accepted', name + ': ' + case['case'])
        for case in f.get('source_join_negatives', []):
            check(source_valid(c, case['prepared'], case['completed'], case['event'], schemas) == case['expected'], name + ': ' + case['case'])
        replay = copy.deepcopy(event); replay['replay_policy'] = 'projector_replay_only'
        check(source_valid(c, prep, done, replay, schemas) == 'replay_only_not_appendable', name + ': current writer refuses compatibility-only replay policy')
        retry = dict(f['recovery_cases'][0]['input'], replay_policy='projector_replay_only')
        check(recovery(c, f, retry) == {'result': 'replay_only_not_appendable', 'external_effects': 0, 'append_count': 0, 'value': None}, name + ': retry refuses compatibility-only replay policy')
        oversized = copy.deepcopy(event); oversized['payload'] = {'body': 'x' * 16385}
        check(source_valid(c, prep, done, oversized, schemas) == 'payload_ref_required', name + ': inline body over SP-337 limit requires payload ref')
        for case in f.get('application_identity_negatives', []):
            original = next(v for v in f['positive_variants'] if v['case'] == 'authenticated_application_source')
            a, b, e = (copy.deepcopy(original[k]) for k in ['prepared', 'completed', 'event'])
            for item in [a, b]:
                if '.' in case['field']:
                    x, y = case['field'].split('.'); item[x][y] = case['value']
                else:
                    item[case['field']] = case['value']
            b['prepared_sha256'] = hashlib.sha256(source_bytes(a)).hexdigest()
            check(source_valid(c, a, b, e, schemas) == case['expected'], name + ': app ' + case['case'])
        for case in f['retention_cases']:
            value = case['input']
            anchor, days = (value.get('run_completed_at'), 365) if value['policy'] == 'RP-RUNTIME-365D' else (value.get('terminal_at'), 2555) if value['policy'] == 'RP-OPERATIONAL-2555D' else (None, None)
            eligible = anchor is not None and (time_value(value['now']) - time_value(anchor)).days >= days and not value['held'] and not value['dependent']
            check(eligible == case['expected_eligible'], name + ': retention ' + case['case'])
        check(f['retention_binding_oracle'] == c.get('retention_binding'), name + ': exact retention binding')
        if c.get('retention_binding'):
            binding = c['retention_binding']
            check('one Server-wide counterpart bucket' in binding['application_bucket'], name + ': SP-349 app counting boundary')
            if name == 'usage.event':
                check(binding['setting_key'] == 'ai.usage.usage-retention' and binding['default_days'] == 90 and not binding['deletion_enabled'] and not binding['admission_enabled'], name + ': decided Usage setting with adapter fenced')
        for case in f['projection_retention_cases']:
            outcome = 'capacity_fenced' if len(case['held_generations']) == case['existing_generations'] else 'retire_unheld_derived_only'
            check(outcome == case['expected'], name + ': ' + case['case'])
        key, eid = identity(c, p, done['scope_partition']); seen = {}; result = {'event': event, 'receipt': f['first_append_receipt']}
        check((key, eid) == (f['identity_oracle']['idempotency_key'], f['identity_oracle']['event_id']), name + ': pinned identity')
        check(identity(c, p, 'project~b3RoZXI') != (key, eid), name + ': scope identity isolation')
        digest = producer_semantic_digest(event)
        oracle = f['retry_oracle']
        check(producer_semantic_bytes(event).hex() == oracle['producer_semantic_bytes_hex'] and digest == oracle['producer_semantic_digest'], name + ': pinned caller semantic bytes/digest')
        check(append_model(seen, key, digest, result) == ('appended', result), name + ': first append')
        check(append_model(seen, key, digest, None) == ('original', result) and len(seen) == 1, name + ': duplicate returns original full value and receipt')
        for case in oracle['storage_metadata_mutations']:
            changed = copy.deepcopy(event); changed[case['field']] = case['value']
            check(event_validator.is_valid(changed), name + ': metadata retry valid envelope ' + case['field'])
            check(producer_semantic_digest(changed) == digest, name + ': metadata excluded from semantic digest ' + case['field'])
            check(append_model(seen, key, producer_semantic_digest(changed), None) == ('original', result) and len(seen) == 1,
                  name + ': metadata retry returns original full event/receipt ' + case['field'])
        for case in oracle['producer_mutations']:
            changed = copy.deepcopy(event); changed[case['field']] = case['value']
            check(producer_semantic_digest(changed) != digest, name + ': producer field in semantic digest ' + case['field'])
            check(append_model(seen, key, producer_semantic_digest(changed), None) == ('idempotency_conflict', None) and len(seen) == 1,
                  name + ': changed producer field conflicts ' + case['field'])
        check(append_model(seen, key, 'different', None) == ('idempotency_conflict', None), name + ': semantic conflict')
        for case in f['recovery_cases']:
            got = recovery(c, f, case['input'])
            check(got == case['expected'], name + ': ' + case['case'])
        cp = schemas[slug + '_checkpoint']; Draft202012Validator.check_schema(cp); cv = Draft202012Validator(cp, format_checker=FormatChecker())
        check(len(cp['properties']['index_read_token']['required']) == 9, name + ': nine stored token fields')
        for key in cp['required']:
            bad = copy.deepcopy(f['checkpoint']); del bad[key]
            check(bool(list(cv.iter_errors(bad))), name + ': missing checkpoint ' + key)
        for case in f['checkpoint_cases']:
            got = checkpoint_result(c, case['previous'], case['proposed'], case['context'], cp)
            check(got == case['expected'], name + ': ' + case['case'])
            stored = case['proposed'] if got == 'published' else case['previous']
            check(stored == case['expected_stored'], name + ': exact checkpoint publication ' + case['case'])
        check(f['native_execution'] == 'NOT_RUN', name + ': native boundary')
        counts[name] = checks - start
    for vector in load('Plans/dt_event_contract_fixtures.json')['source_codec_vectors']:
        try:
            value = decode_source(vector['bytes'].encode('utf-8')); accepted = True
        except (ValueError, UnicodeError, json.JSONDecodeError):
            value = None; accepted = False
        check(accepted == vector['accepted'], 'source codec: ' + vector['case'])
    for vector in load('Plans/dt_event_contract_fixtures.json')['messagepack_integer_vectors']:
        try:
            actual = application_bytes(vector['value']).hex()
        except ValueError:
            actual = None
        check(actual == vector['expected_hex'], 'MessagePack integer: ' + vector['case'])
    usage = fixtures['usage.event']
    for case in fixtures['tool.denied']['non_emission_cases']:
        disposition = denial_emission(case['before'])
        check(disposition == case['expected'], 'tool.denied emission boundary: ' + case['case'])
        check((1 if disposition == 'emit' else 0) == case['append_count'], 'tool.denied append boundary: ' + case['case'])
    web = fixtures['tool.invoked']
    for case in web['batch_cases']:
        parent = copy.deepcopy(next(v for v in web['positive_variants'] if v['case'] == case['parent_case']))
        children = [copy.deepcopy(next(v for v in web['positive_variants'] if v['case'] == name)) for name in case['child_cases']]
        for change in case.get('changes', []):
            target = parent if change['target'] == 'parent' else children[change['target']]
            for field in change['path'][:-1]:
                target = target[field]
            target[change['path'][-1]] = change['value']
        check(batch_join(parent, children) == case['expected'], 'tool.invoked batch: ' + case['case'])
    for case in usage['accounting_cases']:
        check(accounting_totals(case['payload']) == case['expected'], 'usage accounting: ' + case['case'])
    for case in usage['usage_value_negatives']:
        check(not usage_values_valid(case['payload']), 'usage cost/quota: ' + case['case'])
    for case in usage['daily_total_cases']:
        original = case['daily_total']; backup = case['backup_captured_total']
        total = original if backup is None else backup
        actual = {'detail_retirement': 'eligible_under_owner_setting' if case['daily_committed'] else 'held', 'visible_total': total, 'canonical_total': total}
        if backup is not None:
            actual['lost_after_backup'] = original - backup
        check(actual == case['expected'], 'usage daily totals: ' + case['case'])
    # Replacement semantics: revisions replace one contribution, a new billed retry adds its own.
    for case in usage['settlement_accounting_cases']:
        contributions = {}
        for observation in case['observations']:
            if observation['settlement_status'] in ['settled', 'adjusted'] or observation['accepted_partial']:
                contributions[observation['usage_record_id']] = observation['cost_microdollars']
        known = [v for v in contributions.values() if v is not None]
        check(sum(known) == case['expected_known_cost_microdollars'] and len(contributions) == case['expected_records'], 'usage replacement: ' + case['case'])
    print(json.dumps({'status': 'pass' if not failures else 'fail', 'families': len(contracts), 'checks': checks,
                      'per_family_checks': counts, 'failures': failures, 'native_execution': 'NOT_RUN',
                      'boundary': 'original-owner and SP-278 authentication are assumed adapters; no native proof'}, indent=2))
    return bool(failures)

if __name__ == '__main__':
    raise SystemExit(main())
