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
from referencing import Registry, Resource
from referencing.exceptions import Unresolvable
from referencing.jsonschema import DRAFT202012
from urllib.parse import unquote, urlsplit
ROOT = Path(__file__).resolve().parents[1]
_BOUNDARY_INPUTS = {}
PRODUCER_FIELDS = (
    'event_type', 'scope_kind', 'project_id', 'thread_id', 'run_id', 'node_id',
    'attempt_id', 'actor_ref', 'requested_account_ref', 'effective_account_ref',
    'occurred_at_utc', 'producer_sequence_id', 'correlation_id', 'causation_event_id',
    'parent_event_id', 'idempotency_key', 'payload_schema_id', 'payload', 'payload_ref',
    'redaction_profile', 'migration',
)


def load(path):
    return json.loads((ROOT / path).read_text())


def schema_reference_errors(documents, mirrors=()):
    """Resolve every schema reference, including unused branches and resources.

    Resources retain their document root and nested $id/anchor context. Local
    external bundles are loaded without network access and walked in full too.
    Storage mirrors use their declared source schema's root, not the row object.
    """
    pending = []
    errors = []

    def resource(value):
        return Resource.from_contents(value, default_specification=DRAFT202012)

    def retrieve(uri):
        nonlocal registry
        parsed = urlsplit(uri)
        if parsed.scheme != 'file' or parsed.netloc not in ['', 'localhost']:
            raise ValueError('schema resource is not in the local bundle: ' + uri)
        path = Path(unquote(parsed.path)).resolve()
        relative = path.relative_to(ROOT.resolve()).as_posix()
        value = resource(load(relative))
        registry = registry.with_resource(uri, value)
        if value.id():
            registry = registry.with_resource(value.id(), value)
        registry = registry.crawl()
        pending.append((relative, value, uri))
        return value

    registry = Registry(retrieve=retrieve)
    for path, document in documents.items():
        value = resource(document)
        uri = (ROOT / path).as_uri()
        registry = registry.with_resource(uri, value)
        if value.id():
            registry = registry.with_resource(value.id(), value)
        pending.append((path, value, uri))
    registry = registry.crawl()
    for label, schema, source_ref in mirrors:
        source_path = source_ref.split('#', 1)[0]
        base = documents[source_path].get('$id', (ROOT / source_path).as_uri())
        pending.append((label, resource(schema), base))
    visited = set()

    def walk(label, value, resolver, enter=True):
        if enter:
            resolver = resolver.in_subresource(value)
        marker = (id(value.contents), resolver._base_uri)
        if marker in visited:
            return
        visited.add(marker)
        if isinstance(value.contents, dict):
            for keyword in ['$ref', '$dynamicRef']:
                if keyword not in value.contents:
                    continue
                ref = value.contents[keyword]
                try:
                    resolved = resolver.lookup(ref)
                    # A reference to a scalar is not a usable JSON Schema.
                    if not isinstance(resolved.contents, (dict, bool)):
                        raise ValueError('reference target is not a schema')
                    walk(label + ' -> ' + ref, resource(resolved.contents), resolved.resolver, enter=False)
                except (Unresolvable, ValueError, TypeError) as exc:
                    errors.append(label + ': ' + keyword + '=' + str(ref) + ': ' + type(exc).__name__)
            for index, child in enumerate(value.subresources()):
                walk(label + '/subschema/' + str(index), child, resolver)

    while pending:
        label, value, uri = pending.pop(0)
        walk(label, value, registry.resolver(uri))
    return errors


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
    if len(raw) > 1048576:
        raise ValueError('source stage exceeds 1048576 encoded bytes')
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
    # JSON Schema's integer domain includes 1.0. The exact source codec already
    # gives it the same spelling as 1; use that spelling in every identity too.
    # Never convert an exact u64 through binary64.
    subjects = [canonical(payload[k]).decode('utf-8') if k == 'blocked_sequence' else payload[k]
                for k in contract['identity_fields']]
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
        node_id = None if context is None else context['node_id']
        return context is not None and payload.get('node_id') == node_id and bool(payload.get('dispatch_score_ref'))
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


def source_valid(c, prepared, completed, event, schemas, resolved_payload=None, payload_ref_verified=False, *, historical=False):
    if event['replay_policy'] != 'dedupe_by_idempotency_key' and not (historical and event['replay_policy'] == 'projector_replay_only'):
        return 'replay_only_not_appendable' if event['replay_policy'] == 'projector_replay_only' else 'join_refused'
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
    if len(source_bytes(prepared)) > 1048576:
        return 'source_stage_too_large'
    if len(source_bytes(completed)) > 1048576:
        return 'source_stage_too_large'
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
    # Application partition='app' is enforced by its schema; the immutable
    # application_scope check binds the server, and the next guard binds the
    # event partition. Avoid rechecking those same facts in a second predicate.
    if partition != completed['scope_partition'] or (c['scope_policy'] == 'project_only' and event['scope_kind'] != 'project'):
        return 'scope_refused'
    if event['payload_ref'] is not None:
        if not payload_ref_verified or resolved_payload != p:
            return 'payload_unavailable'
    elif event['payload'] != p:
        return 'join_refused'
    # Scope has its own guard above; keep this join independent of that rule.
    if any(event[k] != b[k] for k in b if k != 'scope_kind'):
        return 'join_refused'
    if event['event_type'] != c['event_type'] or event['payload_schema_id'] != c['payload_schema_id']:
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
    if c['event_type'] == 'usage.event' and p['usage_event_ref'] != event['event_id']:
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


def recovery(c, f, case, schemas=None):
    """Original-owner/receipt adapters are supplied witnesses, not native authentication."""
    if case.get('replay_policy', f['event_record']['replay_policy']) == 'projector_replay_only':
        return {'result': 'replay_only_not_appendable', 'external_effects': 0, 'append_count': 0, 'value': None}
    if not case['admitted']:
        return {'result': 'admission_refused', 'external_effects': 0, 'append_count': 0, 'value': None}
    if not case['source_present'] or not case['owner_proven'] or not case['backup_coherent'] or not case['permission'] or case['deleted']:
        return {'result': 'unavailable', 'external_effects': 0, 'append_count': 0, 'value': None}
    if not case['outcome_committed']:
        return {'result': 'fenced', 'external_effects': 0, 'append_count': 0, 'value': None}
    unavailable = {'result': 'unavailable', 'external_effects': 0, 'append_count': 0, 'value': None}
    schemas = load('Plans/dt_event_contracts.schema.json')['$defs'] if schemas is None else schemas
    prepared, completed, event = (f[key] for key in ['prepared_source', 'completed_source', 'event_record'])
    original = f['recovery_original']  # Frozen owner/Storage adapter observations.
    if not Draft202012Validator(load('Plans/event_record.schema.json'), format_checker=FormatChecker()).is_valid(event):
        return unavailable
    if source_valid(c, prepared, completed, event, schemas,
                    case.get('resolved_payload'), case.get('payload_ref_verified', False)) != 'accepted':
        return unavailable
    if prepared != original['prepared'] or completed != original['completed']:
        return unavailable
    if event != original['event']:
        return unavailable
    if not case['completed_present']:
        # Only finalize from the authenticated original outcome; never rerun it.
        return {'result': 'finalize_original', 'external_effects': 0, 'append_count': 0, 'value': f['completed_source']}
    if not case['append_issued']:
        return {'result': 'append_original', 'external_effects': 0, 'append_count': 1, 'value': f['event_record']}
    if not case['receipt_custody'] or not case['full_flush']:
        return {'result': 'fenced', 'external_effects': 0, 'append_count': 0, 'value': None}
    receipt = f['first_append_receipt']
    if receipt['event_id'] != event['event_id'] or receipt['sequence_id'] != event['sequence_id']:
        return unavailable
    if receipt != original['receipt']:
        return unavailable
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
    if t['storage_instance_id'] != context['source_storage_instance_id']:
        return 'source_changed'
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


def historical_read(c, prepared, completed, event, schemas, context):
    """Inspect a retained original under SP-580..596, without live admission.

    The original-owner adapter supplies the authenticated immutable closure;
    authentication itself remains assumed, exactly as for recovery/checkpoints.
    Current disclosure guards still apply. Live operation state is not evidence
    about whether an earlier operation was valid at its original occurrence.
    """
    unavailable = {'result': 'unavailable', 'value': None, 'external_effects': 0, 'append_count': 0}
    if (not context['reader_installed'] or context['withdrawn'] or not context['permission']
            or context['deleted'] or not context['source_present'] or not context['owner_proven']
            or not context['versions_supported']):
        return unavailable
    original = {'prepared': prepared, 'completed': completed, 'event': event}
    if original != context['authenticated_original']:
        return unavailable
    if not Draft202012Validator(load('Plans/event_record.schema.json'), format_checker=FormatChecker()).is_valid(event):
        return unavailable
    if source_valid(c, prepared, completed, event, schemas,
                    context.get('resolved_payload'), context.get('payload_ref_verified', False), historical=True) != 'accepted':
        return unavailable
    return {'result': 'retained', 'value': event, 'external_effects': 0, 'append_count': 0}


def historical_results(c, f, schemas):
    """Check 10: authentic history survives later lifecycle changes only."""
    prepared, completed, event = (copy.deepcopy(f[key]) for key in ['prepared_source', 'completed_source', 'event_record'])
    context = dict(f['historical_reader_oracle']['context'],
                   authenticated_original={'prepared': prepared, 'completed': completed, 'event': event},
                   live_before=copy.deepcopy(f['historical_reader_oracle']['live_before']))
    def read(a=prepared, b=completed, e=event, ctx=context):
        result = historical_read(c, a, b, e, schemas, ctx)
        return {'result': result['result'], 'exact_value': result['value'] == e if result['result'] == 'retained' else result['value'] is None,
                'external_effects': result['external_effects'], 'append_count': result['append_count']}
    results = {'live_transition_no_longer_valid': not transition(c['event_type'], completed['payload'], context['live_before'], completed['owner_result']),
               'changed_live_state': read(), 'live_state_unavailable': read(ctx=dict(context, live_before=None))}
    for key in ['withdrawn', 'permission', 'deleted', 'source_present', 'owner_proven', 'reader_installed', 'versions_supported']:
        results[key] = read(ctx=dict(context, **{key: not context[key]}))
    forged_event = dict(event, correlation_id='forged-correlation')
    results['forged_event'] = read(e=forged_event)
    results['forged_storage_metadata'] = read(e=dict(event, sequence_id=event['sequence_id'] + 1))
    forged_source = copy.deepcopy(completed); forged_source['owner_outcome_ref'] += '-forged'
    results['forged_source'] = read(b=forged_source)
    ref_event = dict(event, payload={}, payload_ref='payload:fixture-verified-pack-body')
    ref_context = dict(context, authenticated_original={'prepared': prepared, 'completed': completed, 'event': ref_event},
                       resolved_payload=completed['payload'], payload_ref_verified=True)
    results['verified_payload_ref'] = read(e=ref_event, ctx=ref_context)
    results['unverified_payload_ref'] = read(e=ref_event, ctx=dict(ref_context, payload_ref_verified=False))
    results['changed_payload_ref'] = read(e=ref_event, ctx=dict(ref_context, resolved_payload={}))
    replay_event = dict(event, replay_policy='projector_replay_only')
    replay_context = dict(context, authenticated_original={'prepared': prepared, 'completed': completed, 'event': replay_event})
    results['replay_only_changed_live_state'] = read(e=replay_event, ctx=replay_context)
    results['replay_only_live_state_unavailable'] = read(e=replay_event, ctx=dict(replay_context, live_before=None))
    # Also cover all Project/application/operation positives with frozen originals.
    results['variants'] = []
    for variant in f['positive_variants']:
        a, b, e = (variant[key] for key in ['prepared', 'completed', 'event'])
        ctx = dict(context, authenticated_original={'prepared': a, 'completed': b, 'event': e})
        results['variants'].append({'case': variant['case'], **read(a, b, e, ctx)})
    return results


def recommit(c, values):
    """Update observational identity copies after one semantic fixture change."""
    a, b, e = values
    if b['scope_partition'] == 'app':
        subjects = [canonical(b['payload'][k]).decode() if k == 'blocked_sequence' else b['payload'][k]
                    for k in c['identity_fields']]
        operation = sha([c['event_type'], b['original_owner_operation_id']] + subjects)
        a['owner_operation_id'] = b['owner_operation_id'] = operation
    key, eid = identity(c, b['payload'], b['scope_partition'], b if b['scope_partition'] == 'app' else None)
    for value in [a, b, e]:
        value['idempotency_key'] = key; value['event_id'] = eid
    if c['event_type'] == 'usage.event':
        b['payload']['usage_event_ref'] = eid
        if e['payload_ref'] is None:
            e['payload']['usage_event_ref'] = eid
    b['prepared_sha256'] = hashlib.sha256(source_bytes(a)).hexdigest()
    return a, b, e


def source_stage_boundary(c, variant, stage):
    """Schema-valid exact 1 MiB and 1 MiB+1 closures, with SP-337 pack routing.

    A prepared occurrence witness may precede the completed occurrence. For a
    completed stage, extend equal RFC 3339 fractional-zero witnesses together;
    the opaque outcome ref fills the final few codec bytes. No large fixture
    or arbitrary schema property is stored in the repository.
    """
    cache_key = (c['event_type'], stage, sha([variant[k] for k in ['prepared', 'completed', 'event']]))
    if cache_key in _BOUNDARY_INPUTS:
        return copy.deepcopy(_BOUNDARY_INPUTS[cache_key])
    original = copy.deepcopy([variant[k] for k in ['prepared', 'completed', 'event']])
    field = 'observed_at_utc' if c['event_type'] == 'usage.event' else 'ts'
    timestamp = original[1]['payload'][field]
    def extended(count):
        return timestamp[:-1] + ('' if '.' in timestamp else '.') + '0' * count + 'Z'
    def build(count):
        if stage == 'prepared':
            values = copy.deepcopy(original)
            values[0]['envelope_context']['occurred_at_utc'] = extended(count)
        else:
            def replace(value):
                if isinstance(value, dict):
                    return {k: replace(v) for k, v in value.items()}
                if isinstance(value, list):
                    return [replace(v) for v in value]
                return extended(count) if value == timestamp else value
            values = replace(original)
        a, b, e = recommit(c, values)
        e['payload'] = {}; e['payload_ref'] = 'payload:fixture-verified-pack-body'
        return a, b, e
    index = 0 if stage == 'prepared' else 1
    base = build(0); small = len(source_bytes(base[index]))
    slope = len(source_bytes(build(1)[index])) - small
    count = (1048576 - small) // slope
    good = build(count)
    while len(source_bytes(good[index])) > 1048576:
        count -= 1; good = build(count)
    gap = 1048576 - len(source_bytes(good[index]))
    if stage == 'prepared':
        good = build(count + gap)
    else:
        # MessagePack may change a string header at this boundary. Move the
        # timestamp back one unit so the filler never straddles that header.
        good = build(count - 1)
        prefix = good[1]['owner_outcome_ref']
        padding = 1048576 - len(source_bytes(good[index]))
        for _ in range(4):
            good[1]['owner_outcome_ref'] = prefix + 'x' * padding
            delta = 1048576 - len(source_bytes(good[index]))
            if not delta:
                break
            padding += delta
    assert len(source_bytes(good[index])) == 1048576
    bad = copy.deepcopy(good)
    if stage == 'prepared':
        bad[0]['envelope_context']['occurred_at_utc'] = bad[0]['envelope_context']['occurred_at_utc'][:-1] + '0Z'
        bad[1]['prepared_sha256'] = hashlib.sha256(source_bytes(bad[0])).hexdigest()
    else:
        bad[1]['owner_outcome_ref'] += 'x'
    assert len(source_bytes(bad[index])) == 1048577
    _BOUNDARY_INPUTS[cache_key] = good, bad  # Inputs only; never validation results.
    return good, bad


def recovery_mutations(c, f):
    """One-defect custody controls; adapter copies stay coherent when testing a join."""
    stages = [v for v in f['recovery_cases'] if v['expected']['result'] in ['original', 'append_original', 'finalize_original']]
    for stage in stages:
        for field, value in [('event_type', 'foreign.event'), ('event_id', 'evt_dt_forged')]:
            bad = copy.deepcopy(f); bad['event_record'][field] = value
            bad['recovery_original']['event'] = copy.deepcopy(bad['event_record'])
            if field == 'event_id':
                bad['first_append_receipt']['event_id'] = value
                bad['recovery_original']['receipt'] = copy.deepcopy(bad['first_append_receipt'])
            yield stage['case'] + '/' + field, bad, stage['input']
        bad = copy.deepcopy(f); bad['completed_source']['prepared_sha256'] = 'f' * 64
        bad['recovery_original']['completed'] = copy.deepcopy(bad['completed_source'])
        yield stage['case'] + '/prepare_commitment', bad, stage['input']
        bad = copy.deepcopy(f); bad['completed_source']['owner_outcome_ref'] += '-forged'
        yield stage['case'] + '/authenticated_owner', bad, stage['input']
        for field, value in [('sequence_id', f['event_record']['sequence_id'] + 1),
                             ('observed_at_utc', '2026-11-05T00:00:00Z'),
                             ('persisted_at_utc', '2026-11-05T00:00:00Z')]:
            bad = copy.deepcopy(f); bad['event_record'][field] = value
            # The receipt agrees with the candidate event. Only comparison
            # with Storage's frozen event is supposed to detect this forgery.
            bad['first_append_receipt']['sequence_id'] = bad['event_record']['sequence_id']
            bad['recovery_original']['receipt'] = copy.deepcopy(bad['first_append_receipt'])
            yield stage['case'] + '/storage_' + field, bad, stage['input']
        bad = copy.deepcopy(f); bad['event_record']['sequence_id'] = 'invalid-sequence'
        bad['recovery_original']['event'] = copy.deepcopy(bad['event_record'])
        bad['first_append_receipt']['sequence_id'] = 'invalid-sequence'
        bad['recovery_original']['receipt'] = copy.deepcopy(bad['first_append_receipt'])
        yield stage['case'] + '/envelope_schema', bad, stage['input']
        if stage['input']['append_issued']:
            for field, value in [('event_id', 'evt_dt_wrong_receipt'), ('sequence_id', f['first_append_receipt']['sequence_id'] + 1)]:
                bad = copy.deepcopy(f); bad['first_append_receipt'][field] = value
                bad['recovery_original']['receipt'] = copy.deepcopy(bad['first_append_receipt'])
                yield stage['case'] + '/receipt_' + field, bad, stage['input']
            for field in ['manifest_generation', 'byte_offset', 'durable_end_offset']:
                bad = copy.deepcopy(f); bad['first_append_receipt'][field] += 1
                yield stage['case'] + '/first_receipt_' + field, bad, stage['input']


def technical_checks(c, f, schemas, check):
    """Cycle-5 regressions run inside the complete checker, never an acceptance stub."""
    name = c['event_type']; slug = name.replace('.', '_')
    variants = [dict(prepared=f['prepared_source'], completed=f['completed_source'], event=f['event_record'])]
    variants += [v for v in f['positive_variants'] if v['event']['scope_kind'] == 'application'][:1]
    for variant in variants:
        scope = variant['event']['scope_kind']
        for stage in ['prepared', 'completed']:
            good, bad = source_stage_boundary(c, variant, stage)
            check(source_valid(c, *good, schemas, good[1]['payload'], True) == 'accepted', name + ': exact source-stage boundary ' + scope + '/' + stage)
            check(source_valid(c, *bad, schemas, bad[1]['payload'], True) == 'source_stage_too_large', name + ': oversized source stage ' + scope + '/' + stage)
            if scope == 'project':
                raw = canonical(good[0 if stage == 'prepared' else 1])
                check(decode_source(raw) == good[0 if stage == 'prepared' else 1], name + ': exact source decode boundary ' + stage)
                try:
                    decode_source(canonical(bad[0 if stage == 'prepared' else 1])); refused = False
                except ValueError:
                    refused = True
                check(refused, name + ': oversized source decode ' + stage)
        # Historical reader accepts every supported original replay policy in
        # both scopes, including after all live state has disappeared.
        for policy in ['dedupe_by_idempotency_key', 'projector_replay_only']:
            a, b, e = copy.deepcopy([variant[k] for k in ['prepared', 'completed', 'event']]); e['replay_policy'] = policy
            ctx = dict(f['historical_reader_oracle']['context'], live_before=None,
                       authenticated_original={'prepared': a, 'completed': b, 'event': e})
            check(historical_read(c, a, b, e, schemas, ctx)['result'] == 'retained', name + ': historical policy ' + scope + '/' + policy)
    for label, bad, case in recovery_mutations(c, f):
        check(recovery(c, bad, case, schemas) == {'result': 'unavailable', 'external_effects': 0, 'append_count': 0, 'value': None}, name + ': recovery custody ' + label)
    if name.startswith('approval.'):
        for integer in [1, 9007199254740993, 18446744073709551615]:
            values = copy.deepcopy([f[k] for k in ['prepared_source', 'completed_source', 'event_record']])
            def replace_sequence(value, number):
                if isinstance(value, dict):
                    return {k: number if k == 'blocked_sequence' else replace_sequence(v, number) for k, v in value.items()}
                if isinstance(value, list):
                    return [replace_sequence(v, number) for v in value]
                return value
            a, b, e = recommit(c, replace_sequence(values, integer))
            check(source_valid(c, a, b, e, schemas) == 'accepted', name + ': exact u64 identity ' + str(integer))
            decoded = [decode_source(canonical(v)) for v in [a, b, e]]
            check(source_valid(c, *decoded, schemas) == 'accepted', name + ': exact u64 round trip ' + str(integer))
            if integer == 1:
                aa, bb, ee = recommit(c, replace_sequence(values, 1.0))
                check(source_valid(c, aa, bb, ee, schemas) == 'accepted', name + ': schema-valid float integer source')
                check(identity(c, b['payload']) == identity(c, bb['payload']), name + ': equal integer representations have one identity')
                seen = {}; result = {'event': e, 'receipt': f['first_append_receipt']}
                append_model(seen, e['idempotency_key'], producer_semantic_digest(e), result)
                check(append_model(seen, ee['idempotency_key'], producer_semantic_digest(ee), None) == ('original', result) and len(seen) == 1,
                      name + ': equal integer retry returns original')
                check(source_valid(c, *[decode_source(canonical(v)) for v in [aa, bb, ee]], schemas) == 'accepted', name + ': float integer canonical round trip')
                check(not Draft202012Validator(schemas[slug], format_checker=FormatChecker()).is_valid(replace_sequence(e['payload'], 1.25)), name + ': fractional identity refused')


def checker_exit_code(failures):
    return int(bool(failures))


def oversized_inline(c, f):
    """A valid original closure whose sole defect is crossing SP-337's limit.

    RFC 3339 permits arbitrary fractional precision. Zero extension preserves
    the timestamp's value while growing every observational copy consistently.
    Recompute identities and the prepare commitment after changing the closure.
    Keep the large bytes generated, rather than storing them in the fixture.
    """
    a, b, e = copy.deepcopy([f[k] for k in ['prepared_source', 'completed_source', 'event_record']])
    field = 'observed_at_utc' if c['event_type'] == 'usage.event' else 'ts'
    original = e['payload'][field]
    extended = original[:-1] + ('' if '.' in original else '.') + '0' * 17000 + 'Z'
    def replace(value):
        if isinstance(value, dict):
            return {key: replace(child) for key, child in value.items()}
        if isinstance(value, list):
            return [replace(child) for child in value]
        return extended if value == original else value
    a, b, e = replace([a, b, e])
    key, eid = identity(c, b['payload'], b['scope_partition'])
    for item in [a, b, e]:
        item['idempotency_key'] = key
        item['event_id'] = eid
    if c['event_type'] == 'usage.event':
        b['payload']['usage_event_ref'] = e['payload']['usage_event_ref'] = eid
    b['prepared_sha256'] = hashlib.sha256(source_bytes(a)).hexdigest()
    return a, b, e


def semantic_case(f, case):
    """Apply one defect to an explicitly valid base and recommit its witnesses."""
    a, b, e = copy.deepcopy([f[k] for k in ['prepared_source', 'completed_source', 'event_record']])
    for change in case.get('base_changes', []):
        set_path(a, change['path'], change['value'])
    b['before'] = copy.deepcopy(a['before'])
    b['prepared_sha256'] = hashlib.sha256(source_bytes(a)).hexdigest()
    base = copy.deepcopy((a, b, e))
    set_path(b if case['path'][0] == 'owner_result' else a, case['path'], case['value'])
    b['before'] = copy.deepcopy(a['before'])
    b['prepared_sha256'] = hashlib.sha256(source_bytes(a)).hexdigest()
    return base, (a, b, e)


def envelope_case(c, f, field, value):
    """One envelope-witness disagreement; all other identity joins agree."""
    a, b, e = copy.deepcopy([f[k] for k in ['prepared_source', 'completed_source', 'event_record']])
    original = e[field]
    def change(value_object):
        if isinstance(value_object, dict):
            return {key: value if key == field and child == original else change(child)
                    for key, child in value_object.items()}
        if isinstance(value_object, list):
            return [change(child) for child in value_object]
        return value_object
    a, b, e = change([a, b, e])
    a['scope_partition'] = b['scope_partition'] = partition_for(e)
    key, eid = identity(c, b['payload'], b['scope_partition'])
    for item in [a, b, e]:
        item['idempotency_key'] = key; item['event_id'] = eid
    if c['event_type'] == 'usage.event':
        b['payload']['usage_event_ref'] = e['payload']['usage_event_ref'] = eid
    b['prepared_sha256'] = hashlib.sha256(source_bytes(a)).hexdigest()
    base = copy.deepcopy((a, b, e))
    a['envelope_context'][field] = b['envelope_context'][field] = original
    b['prepared_sha256'] = hashlib.sha256(source_bytes(a)).hexdigest()
    return base, (a, b, e)


def standing_results(c, f, schemas):
    """Ten independent, per-family standing oracles; no admission/native proof."""
    name = c['event_type']; slug = name.replace('.', '_')
    a, b, e = (copy.deepcopy(f[k]) for k in ['prepared_source', 'completed_source', 'event_record'])
    replay = dict(e, replay_policy='projector_replay_only')
    results = {'1': {'writer': source_valid(c, a, b, replay, schemas),
                     'retry': recovery(c, f, dict(f['recovery_cases'][0]['input'], replay_policy='projector_replay_only'), schemas)}}
    app = [v for v in f['positive_variants'] if v['event']['scope_kind'] == 'application']
    app_results = []
    for variant in app:
        x, y, z = (copy.deepcopy(variant[k]) for k in ['prepared', 'completed', 'event'])
        sid = y['application_scope']['server_id']; oid = y['owner_operation_id']
        expected = 'application@1:' + sid.encode().hex() + ':' + oid.encode().hex()
        negatives = []
        for key in ['application@1:' + sid + ':' + oid,
                    'application@1:' + 'other-server'.encode().hex() + ':' + oid.encode().hex(),
                    expected.replace('application@1:', 'application:')]:
            aa, bb, ee = copy.deepcopy((x, y, z))
            ee['idempotency_key'] = key; ee['event_id'] = 'evt_dt_' + hashlib.sha256(key.encode()).hexdigest()
            for item in [aa, bb]:
                item['idempotency_key'] = key; item['event_id'] = ee['event_id']
            if name == 'usage.event':
                bb['payload']['usage_event_ref'] = ee['event_id']; ee['payload']['usage_event_ref'] = ee['event_id']
            bb['prepared_sha256'] = hashlib.sha256(source_bytes(aa)).hexdigest()
            negatives.append(source_valid(c, aa, bb, ee, schemas))
        app_results.append({'case': variant['case'], 'exact_key': z['idempotency_key'] == expected,
                            'positive': source_valid(c, x, y, z, schemas), 'bad_keys': negatives})
    results['2'] = {'application_cases': app_results}
    if not app:
        bad_source = copy.deepcopy(a); bad_source['envelope_context']['scope_kind'] = 'application'
        results['2']['forbidden_application_scope'] = 'schema_refused' if not Draft202012Validator(schemas[slug + '_source'], format_checker=FormatChecker()).is_valid(bad_source) else 'accepted'
    aa, bb = copy.deepcopy((a, b)); aa['scope_partition'] = bb['scope_partition'] = e['project_id']
    bb['prepared_sha256'] = hashlib.sha256(source_bytes(aa)).hexdigest()
    project_cases = [(b, e)] + [(v['completed'], v['event']) for v in f['positive_variants'] if v['event']['scope_kind'] == 'project']
    results['3'] = {'encoded_positives': all(done['scope_partition'] == partition_for(event) for done, event in project_cases),
                    'raw_id': source_valid(c, aa, bb, e, schemas)}
    ref = dict(e, payload={}, payload_ref='payload:fixture-verified-pack-body')
    results['4'] = {'oversized_inline': source_valid(c, *oversized_inline(c, f), schemas),
                    'verified_ref': source_valid(c, a, b, ref, schemas, b['payload'], True),
                    'unverified_ref': source_valid(c, a, b, ref, schemas, b['payload'], False),
                    'changed_ref': source_valid(c, a, b, ref, schemas, {}, True)}
    case = copy.deepcopy(f['checkpoint_cases'][0]); cp = schemas[slug + '_checkpoint']
    case['proposed']['index_read_token']['generation_anchor_sha256'] += '\n'
    for token_owner in [case['context'], case['context']['verified_prefix']]:
        token_owner['current_token' if token_owner is case['context'] else 'index_read_token'] = copy.deepcopy(case['proposed']['index_read_token'])
    results['5'] = {'coherent_trailing_lf': checkpoint_result(c, case['previous'], case['proposed'], case['context'], cp)}
    key = e['idempotency_key']; seen = {}; original = {'event': e, 'receipt': f['first_append_receipt']}
    append_model(seen, key, producer_semantic_digest(e), original)
    metadata = []; producer = []
    for mutation in f['retry_oracle']['storage_metadata_mutations']:
        changed = dict(e, **{mutation['field']: mutation['value']})
        metadata.append(append_model(seen, key, producer_semantic_digest(changed), None) == ('original', original) and len(seen) == 1)
    for mutation in f['retry_oracle']['producer_mutations']:
        changed = dict(e, **{mutation['field']: mutation['value']})
        producer.append(append_model(seen, key, producer_semantic_digest(changed), None) == ('idempotency_conflict', None) and len(seen) == 1)
    results['6'] = {'metadata_original': metadata, 'producer_conflicts': producer}
    mismatches = []
    for path in [('storage_instance_id',), ('index_read_token', 'storage_instance_id'),
                 ('index_read_token', 'source_selection', 'storage_instance_id')]:
        case = copy.deepcopy(f['checkpoint_cases'][0])
        set_path(case['proposed'], path, '22222222-2222-4222-8222-222222222222')
        mismatches.append(checkpoint_result(c, case['previous'], case['proposed'], case['context'], cp))
    case = copy.deepcopy(f['checkpoint_cases'][0]); proposed = case['proposed']; token = proposed['index_read_token']
    foreign = '22222222-2222-4222-8222-222222222222'
    proposed['storage_instance_id'] = token['storage_instance_id'] = token['source_selection']['storage_instance_id'] = foreign
    token['checkpoint_key'] = 'event_record_index_checkpoint.v1:' + foreign
    token['checkpoint_ref'] = token['checkpoint_key'] + '#/generations/' + token['generation_id']
    case['context']['current_token'] = copy.deepcopy(token)
    case['context']['verified_prefix']['index_read_token'] = copy.deepcopy(token)
    mismatches.append(checkpoint_result(c, case['previous'], proposed, case['context'], cp))
    results['7'] = {'positive_matches_event': all(v['proposed']['storage_instance_id'] == v['proposed']['index_read_token']['storage_instance_id'] == v['proposed']['index_read_token']['source_selection']['storage_instance_id'] == b['storage_instance_id'] for v in f['checkpoint_cases'] if v['expected'] == 'published'),
                    'mismatches': mismatches}
    results['8'] = {'clean_exit': checker_exit_code([]), 'failure_exit': checker_exit_code([name + ': negative case'])}
    results['9'] = {'all_schema_references_resolved': True}  # Whole-bundle preflight in main.
    results['10'] = historical_results(c, f, schemas)
    return results


def main():
    contracts = load('Plans/dt_event_contracts.json')['families']
    schema_document = load('Plans/dt_event_contracts.schema.json')
    schemas = schema_document['$defs']
    fixtures = {f['event_type']: f for f in load('Plans/dt_event_contract_fixtures.json')['families']}
    registered = {f['event_type'] for f in load('Plans/event_family_registry.json')['families']}
    storage_schemas = {f['value_schema_ref']: f for f in load('Plans/storage_value_registry.json')['families']}
    checks = 0
    failures = []
    counts = {}
    standing = {}
    def check(ok, message):
        nonlocal checks
        checks += 1
        if not ok:
            failures.append(message)
    event_schema = load('Plans/event_record.schema.json')
    documents = {'Plans/dt_event_contracts.schema.json': schema_document,
                 'Plans/event_record.schema.json': event_schema}
    mirrors = [(row['family_id'], row['value_schema'], ref) for ref, row in storage_schemas.items()
               if ref.startswith('Plans/dt_event_contracts.schema.json#')]
    reference_errors = schema_reference_errors(documents, mirrors)
    if reference_errors:
        # No fixture may hide an invalid schema behind a successful alternative.
        for c in contracts:
            check(False, c['event_type'] + ': unresolved schema reference; see schema_reference_errors')
        print(json.dumps({'status': 'fail', 'families': len(contracts), 'checks': checks,
                          'failures': failures, 'schema_reference_errors': reference_errors,
                          'native_execution': 'NOT_RUN'}, indent=2))
        return checker_exit_code(failures)
    event_validator = Draft202012Validator(event_schema, format_checker=FormatChecker())
    for c in contracts:
        start = checks
        name = c['event_type']; slug = name.replace('.', '_'); f = fixtures[name]; p = f['valid_payload']
        for definition in [slug + '_checkpoint', slug + '_source', slug + '_application_source']:
            if definition in schemas:
                ref = 'Plans/dt_event_contracts.schema.json#/$defs/' + definition
                check(storage_schemas[ref]['value_schema'] == schemas[definition], name + ': exact Storage schema mirror ' + definition)
        identifier_checks(c, f, schemas, check)
        technical_checks(c, f, schemas, check)
        standing[name] = standing_results(c, f, schemas)
        for number in map(str, range(1, 11)):
            check(standing[name][number] == f['standing_check_oracles'][number], name + ': standing check ' + number)
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
                bad = copy.deepcopy(prep if key == 'stage' else stage); del bad[key]
                check(bool(list(sv.iter_errors(bad))), name + ': missing source ' + key)
            check(bool(list(sv.iter_errors(dict(stage, unexpected='refused')))), name + ': closed source')
        check(sha(prep) == f['source_byte_oracle']['prepared_sha256'], name + ': pinned original source digest')
        check(canonical(prep).hex() == f['source_byte_oracle']['prepared_hex'], name + ': pinned original source bytes')
        for case in f['semantic_negatives']:
            base, negative = semantic_case(f, case)
            check(source_valid(c, *base, schemas) == 'accepted', name + ': valid semantic base ' + case['case'])
            check(source_valid(c, *negative, schemas) == case['expected'], name + ': ' + case['case'])
        ref_event = copy.deepcopy(event); ref_event['payload'] = {}; ref_event['payload_ref'] = 'payload:fixture-verified-pack-body'
        check(source_valid(c, prep, done, ref_event, schemas, p, True) == 'accepted', name + ': separately governed payload resolves before joins')
        check(source_valid(c, prep, done, ref_event, schemas, p, False) == 'payload_unavailable', name + ': unverified pack body unavailable')
        check(source_valid(c, prep, done, ref_event, schemas, {}, True) == 'payload_unavailable', name + ': changed pack body unavailable')
        bad_scope = copy.deepcopy(prep); bad_scope['envelope_context']['scope_kind'] = 'application'
        check(not sv.is_valid(bad_scope), name + ': source schema refuses wrong envelope scope')
        for field, value in [('project_id', 'wrong-project'), ('run_id', 'wrong-run'), ('actor_ref', 'wrong-actor')]:
            base, negative = envelope_case(c, f, field, value)
            check(source_valid(c, *base, schemas) == 'accepted', name + ': valid envelope base ' + field)
            check(source_valid(c, *negative, schemas) != 'accepted', name + ': wrong envelope ' + field)
        for field in c['identity_fields']:
            a, bad = copy.deepcopy((prep, done)); v = bad['subject'][field]
            a['subject'][field] = bad['subject'][field] = v + 1 if isinstance(v, int) else v + '-other'
            bad['prepared_sha256'] = hashlib.sha256(source_bytes(a)).hexdigest()
            check(source_valid(c, a, bad, event, schemas) != 'accepted', name + ': wrong source subject ' + field)
        for case in f['positive_variants']:
            check(not list(event_validator.iter_errors(case['event'])), name + ': variant complete envelope ' + case['case'])
            check(source_valid(c, case['prepared'], case['completed'], case['event'], schemas) == 'accepted', name + ': ' + case['case'])
        for case in f.get('source_join_negatives', []):
            check(source_valid(c, case['prepared'], case['completed'], case['event'], schemas) == case['expected'], name + ': ' + case['case'])
        replay = copy.deepcopy(event); replay['replay_policy'] = 'projector_replay_only'
        check(source_valid(c, prep, done, replay, schemas) == 'replay_only_not_appendable', name + ': current writer refuses compatibility-only replay policy')
        retry = dict(f['recovery_cases'][0]['input'], replay_policy='projector_replay_only')
        check(recovery(c, f, retry, schemas) == {'result': 'replay_only_not_appendable', 'external_effects': 0, 'append_count': 0, 'value': None}, name + ': retry refuses compatibility-only replay policy')
        large = oversized_inline(c, f)
        check(validator.is_valid(large[2]['payload']) and event_validator.is_valid(large[2]), name + ': oversized closure retains valid payload/envelope schemas')
        check(source_valid(c, *large, schemas) == 'payload_ref_required', name + ': inline body over SP-337 limit requires payload ref')
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
            got = recovery(c, f, case['input'], schemas)
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
                      'per_family_checks': counts, 'standing_checks': standing, 'failures': failures, 'native_execution': 'NOT_RUN',
                      'boundary': 'original-owner and SP-278 authentication are assumed adapters; no native proof'}, indent=2))
    return checker_exit_code(failures)

if __name__ == '__main__':
    raise SystemExit(main())
