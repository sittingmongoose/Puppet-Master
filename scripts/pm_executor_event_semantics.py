#!/usr/bin/env python3
"""Static relational/trace oracles for prepared Executor events; never a native adapter."""
import copy
import base64
import hashlib
import json
import re
from datetime import datetime, timedelta
from email.utils import parsedate_to_datetime
from pathlib import Path

import jsonschema
from pm_executor_schema_refs import check_references, check_lane_schemas, reference_cases
import msgpack
from blake3 import blake3

ROOT = Path(__file__).resolve().parents[1]
DATE_TIME_CHECKER = jsonschema.FormatChecker()
DATE_TIME = re.compile(r'[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt][0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?(?:[Zz]|[+-][0-9]{2}:[0-9]{2})')


def require(condition, reason):
    if not condition:
        raise ValueError(reason)


# These predicates run before indexing/parsing their inputs. Keeping their exact
# refusal boundary callable lets fixture controls prove guards without treating a
# later missing-object exception as a duplicate or suppressing downstream checks.
def validate_payload_map_keys(item):
    require(all(type(key) is str for key in item), 'payload map string keys')


def validate_pack_presence(pack):
    require(pack is not None, 'missing payload pack')


def validate_source_timezone(result):
    require(result.tzinfo is not None, 'source clock timezone')


def validate_retry_classification(classification):
    require(classification not in ('graph_integrity', 'verification_failed', 'reviewer_findings', 'quota_exceeded'), 'no blind retry')


def validate_retry_policy_domain(classification, limits):
    require(classification in limits, 'classified retry policy domain')


def validate_retry_after_header(header):
    require(isinstance(header, str) and bool(header), 'original Retry-After header')


def validate_retry_after_timezone(deadline):
    require(deadline.tzinfo is not None, 'Retry-After date timezone')


def validate_auth_refresh(refresh):
    require(refresh is not None and refresh['attempts'] == 1 and refresh['result'] == 'refreshed',
            'one successful original auth refresh')


def validate_source_record_set(records, expected_slots):
    require(set(records) == expected_slots, 'source record set')


def validate_transition_rules(rules):
    require(len(rules) == 1, 'illegal predecessor')


def validate_dependency_presence(dependency, field):
    require(dependency is not None, 'missing dependency ' + field)


def canonical(value):
    # Fixture domain is strings, booleans, null, safe integers, lists and objects.
    validate_canonical_domain(value)
    return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':'))


def validate_canonical_domain(value):
    """Refuse float aliases before any identity, body or custody digest is made."""
    if type(value) is dict:
        validate_payload_map_keys(value)
        for item in value.values():
            validate_canonical_domain(item)
    elif type(value) is list:
        for item in value:
            validate_canonical_domain(item)
    else:
        require(value is None or type(value) in (str, bool, int), 'canonical integer value domain')


def same_value(left, right):
    """Compare typed JSON values; Python's True == 1 cannot join source facts."""
    return canonical(left) == canonical(right)


def fixture_encoding(value):
    """Exact test-input comparison, including deliberately invalid float inputs.

    This is authoring notation only, never an identity or semantic digest codec.
    """
    return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':'))


def expand_fixture_literals(value):
    """Expand only local fixture authoring notation, before any validation.

    Long boundary strings/hex bytes use explicit repetition to keep fixture files
    reviewable. Direct capture/schema/append validators never expand user input.
    """
    if type(value) is dict:
        if set(value) == {'fixture_text_parts'}:
            parts = []
            for part in value['fixture_text_parts']:
                if type(part) is str:
                    parts.append(part)
                else:
                    require(type(part) is dict and set(part) == {'text', 'repeat'}
                            and type(part['text']) is str and type(part['repeat']) is int
                            and part['repeat'] >= 0, 'fixture repetition syntax')
                    parts.append(part['text'] * part['repeat'])
            return ''.join(parts)
        return {key: expand_fixture_literals(item) for key, item in value.items()}
    if type(value) is list:
        return [expand_fixture_literals(item) for item in value]
    return value


def digest(value):
    return hashlib.sha256(canonical(value).encode()).hexdigest()


def at(value, path):
    for part in path.split('.'):
        value = value[part]
    return value


def schema_validate(path, value, *, whole_schema_refs=True):
    schema = json.loads((ROOT / path).read_text())
    if whole_schema_refs:
        check_references(schema, path)
    checker = jsonschema.FormatChecker()
    checker.checks('date-time')(valid_timestamp)
    jsonschema.Draft202012Validator(schema, format_checker=checker).validate(value)


def valid_timestamp(value):
    return (isinstance(value, str) and DATE_TIME.fullmatch(value) is not None
            and DATE_TIME_CHECKER.conforms(value, 'date-time'))


def validate_append_policy(contract, policy):
    # Compatibility rebuilds use the read path, never the current append model.
    require(policy != 'projector_replay_only', 'replay_only_not_appendable')
    require(contract['replay_policy'] == policy == 'dedupe_by_idempotency_key',
            'family append replay policy')


def validate_historical_policy(contract, policy):
    # The retained-source digest below pins the original; this path has no writes.
    require(policy in (contract['replay_policy'], 'projector_replay_only'),
            'historical replay policy domain')


def payload_bytes(value):
    """Case L-2 canonical MessagePack for these fixtures' integer/string domain.

    This is uncompressed logical payload transport, not the SP-278 digest
    wrapper, producer-semantic digest, or a complete native EventRecord codec.
    """
    def ordered(item):
        if type(item) is dict:
            validate_payload_map_keys(item)
            return {key: ordered(item[key]) for key in sorted(item, key=lambda key: key.encode('utf-8'))}
        if type(item) is list:
            return [ordered(child) for child in item]
        require(item is None or type(item) in (str, int, bool), 'unsupported fixture payload value')
        return item
    return msgpack.packb(ordered(value), use_bin_type=True, strict_types=True)


def validate_payload_transport(payload, envelope, packs, viewer):
    """Compose SP-337 with the logical source body; captures are not wire schemas."""
    raw = payload_bytes(payload)
    ref = envelope['payload_ref']
    if ref is None:
        require(envelope['payload'] == payload, 'inline logical payload join')
        require(len(raw) <= 16 * 1024, 'oversized_inline_payload')
        return
    require(envelope['payload'] == {}, 'referenced payload cannot remain inline')
    require(type(ref) is dict and set(ref) == {'blake3', 'byte_size', 'media_type'},
            'resolved SP-337 descriptor')
    require(type(ref['byte_size']) is int and ref['byte_size'] == len(raw), 'payload ref byte size')
    require(ref['media_type'] == 'application/msgpack', 'payload ref media type')
    pack = packs.get(ref['blake3'])
    validate_pack_presence(pack)
    stored = bytes.fromhex(pack['bytes_hex'])
    require(pack['bytes_hex'] == stored.hex(), 'exact normalized pack bytes')
    require(blake3(stored).hexdigest() == ref['blake3'], 'payload pack BLAKE3')
    require(type(pack['byte_size']) is int and len(stored) == pack['byte_size'] == ref['byte_size'],
            'payload pack byte size')
    require(pack['media_type'] == ref['media_type'], 'payload pack media type')
    require(stored == raw, 'payload pack logical source body')
    require(pack['project_id'] == payload['project_id'], 'payload pack Project custody')
    require(pack['storage_instance_id'] == envelope['storage_instance_id'], 'payload pack Storage custody')
    require(pack['durable'] is True, 'payload pack before referencing record')
    require(pack['deleted_at'] is None and viewer in pack['readers'], 'payload pack disclosure custody')


def source_observation(adapter, records):
    """Derive values and absence from complete owner reads, never the event mirror."""
    observed = {}
    for field, path in adapter['joins'].items():
        try:
            value = at(records, path)
        except KeyError:
            continue
        # The episode's explicit null means no attempt existed at this transition.
        if field == 'attempt_id' and value is None:
            continue
        observed[field] = value
    return observed


def instant(value):
    require(valid_timestamp(value), 'whole-string source timestamp')
    result = datetime.fromisoformat(value)
    validate_source_timezone(result)
    return result


def validate_retry(contract, payload, records):
    """Apply EP-032/SP-238 to the original per-error counter and scheduling facts."""
    retry, failure = records['retry']['body'], records['failure']['body']
    name, classification = contract['event_type'], failure['failure_class']
    require(retry['failure_class'] == payload['failure_class'] == classification, 'retry classification')
    require(retry['error_id'] == failure['error_id'], 'per-error counter identity')
    require(type(retry['used']) is int and type(failure['retry_count_before']) is int and retry['used'] >= 0
            and retry['used'] == failure['retry_count_before'], 'original per-error retry counter')
    attempt_slot = 'prior_attempt' if name == 'run.node_retry_scheduled' else 'attempt'
    require(failure['attempt_id'] == records[attempt_slot]['body']['attempt_id'], 'original failed attempt')
    if name == 'run.node_retry_scheduled':
        require(retry['prior_attempt_id'] == failure['attempt_id'], 'classified prior attempt')
    validate_retry_classification(classification)
    limits = {'provider_transient': 3, 'rate_limited': 3,
              'structured_output_invalid': 2, 'auth_expired': 1}
    policy_owner = 'Plans/Executor_Protocol.md#EP-032'
    if classification == 'storage_io':
        storage_class = failure['storage_io_class']
        require(storage_class == retry['storage_io_class'], 'original Storage classification')
        require(storage_class in ('interrupted', 'transient_busy'), 'Storage retry class')
        limit = 3 if storage_class == 'interrupted' else 1
        policy_owner = 'Plans/storage-plan.md#SP-238'
        require(retry['new_executor_attempt'] is False and retry['successor_attempt_id'] is None,
                'Storage adapter retry cannot create an Executor attempt')
    else:
        validate_retry_policy_domain(classification, limits)
        require(retry['storage_io_class'] is None and failure['storage_io_class'] is None, 'foreign Storage policy')
        limit = limits[classification]
    require(retry['policy_owner_ref'] == policy_owner, 'classified owner policy provenance')
    require(type(retry['limit']) is int and retry['limit'] == limit, 'exact classified retry limit')
    require(retry['used'] < retry['limit'], 'per-error retry budget')
    if 'retry_count' in payload:
        require(payload['retry_count'] == retry['used'] + 1, 'classified retry ordinal')
    failed = instant(failure['failed_at_utc'])
    received = instant(failure['response_received_at_utc'])
    scheduled = instant(retry['scheduled_at_utc'])
    observed = instant(payload['ts'])
    require(received <= failed <= scheduled <= observed, 'original failure/scheduling clocks')
    delay = timedelta(0)
    if classification == 'provider_transient':
        delay = timedelta(seconds=2 ** retry['used'])
    elif classification == 'rate_limited':
        header = failure['retry_after_header']
        if header is None:
            delay = timedelta(seconds=30)
        else:
            validate_retry_after_header(header)
            if header.isascii() and header.isdecimal():
                deadline = received + timedelta(seconds=int(header))
            else:
                deadline = parsedate_to_datetime(header)
                validate_retry_after_timezone(deadline)
            delay = max(deadline - scheduled, timedelta(0))
    elif classification == 'auth_expired':
        refresh = failure['refresh']
        validate_auth_refresh(refresh)
        require(failed <= instant(refresh['completed_at_utc'])
                <= instant(refresh['client_rebuilt_at_utc']) <= scheduled, 'refresh and client rebuild before retry')
    elif classification == 'storage_io' and failure['storage_io_class'] == 'transient_busy':
        delay = timedelta(milliseconds=250)
    if classification != 'rate_limited':
        require(failure['retry_after_header'] is None, 'Retry-After belongs to rate_limited')
    if classification != 'auth_expired':
        require(failure['refresh'] is None, 'refresh belongs to auth_expired')
    until = instant(retry['backoff_until_utc'])
    require(until == scheduled + delay, 'original classified retry deadline')
    if name in ('run.node_backoff_started', 'run.node_backoff_expired'):
        require(delay > timedelta(0), 'classified policy has no timed backoff')
    if name == 'run.node_backoff_expired':
        require(observed >= until, 'early timer')
    elif name == 'run.node_backoff_started':
        require(instant(payload['backoff_until_utc']) == until, 'original start timer join')
        require(until >= observed, 'backoff deadline')


def validate_score_domain(ready, selected):
    for score in ready + [item['score_tuple'] for item in selected]:
        require(type(score['manual_priority']) is int and 0 <= score['manual_priority'] <= 100,
                'scheduler manual_priority integer 0..100')
        require(valid_timestamp(score['ready_since_utc']), 'whole-string score timestamp')


def validate_capture(contract, payload, capture, *, historical=False):
    """Check normalized owner reads, independently joined parents, and committed post-state.

    Captures are unpersisted test data. Native code must obtain the complete records
    through the owners, validate their existing schemas and hold the writer/read fence.
    No caller-controlled `*_valid` flag is accepted here as authority.
    """
    schema_validate(contract['schema_ref'], payload)
    if historical:
        validate_historical_policy(contract, capture['envelope']['replay_policy'])
    else:
        validate_append_policy(contract, capture['envelope']['replay_policy'])
    validate_payload_transport(payload, capture['envelope'], capture['payload_packs'], capture['viewer'])
    validate_canonical_domain(capture)
    adapter = contract['semantic_adapter']
    require(capture['adapter'] == adapter['id'], 'adapter dispatch')
    require(capture['family'] == contract['event_type'], 'family dispatch')
    scope = capture['scope']
    require(scope['project_id'] == payload['project_id'], 'scope Project')
    partition = 'project~' + base64.urlsafe_b64encode(payload['project_id'].encode()).decode().rstrip('=')
    require(scope['scope_partition'] == partition, 'scope partition')
    require(scope['storage_instance_id'] == capture['envelope']['storage_instance_id'], 'storage root')
    for field in ('project_id', 'run_id', 'thread_id', 'attempt_id'):
        if field in payload:
            require(same_value(capture['envelope'].get(field), payload[field]), 'envelope ' + field)
    records = capture['records']
    expected_slots = set(adapter['source_records'])
    if contract['event_type'] in ('node.blocked', 'node.unblocked'):
        episode_attempt = records['episode']['body']['attempt_id']
        require(payload.get('attempt_id') == episode_attempt, 'episode attempt presence')
        if episode_attempt is None:
            expected_slots.discard('attempt')
            require('attempt_id' not in capture['envelope'], 'pre-attempt envelope omission')
        else:
            require(records['attempt']['body']['attempt_id'] == episode_attempt, 'episode attempt record')
    validate_source_record_set(records, expected_slots)
    for slot, owner in adapter['source_records'].items():
        if slot not in expected_slots:
            continue
        record = records[slot]
        require(record['owner'] == owner, 'source owner ' + slot)
        require(record['project_id'] == scope['project_id'], 'source Project ' + slot)
        require(record['storage_instance_id'] == scope['storage_instance_id'], 'source root ' + slot)
        require(same_value(record['revision'], capture['expected_revisions'][slot]), 'source revision ' + slot)
        require(record['sha256'] == digest(record['body']), 'source digest ' + slot)
        require(record['parents'] == {parent: records[parent]['ref'] for parent in adapter['parent_joins'][slot]}, 'source parents ' + slot)
    for field, path in adapter['joins'].items():
        if field in payload:
            require(same_value(payload[field], at(records, path)), 'source join ' + field)
    original = source_observation(adapter, records)
    require(same_value(original, payload), 'complete source observation/presence')
    if contract['event_type'] == 'attempt.started':
        execution = records['execution']['body']
        account_relevant = (execution.get('requested_account_id') is not None
                            or execution.get('effective_account_id') is not None
                            or execution['requested_account_binding'] != 'none')
        if account_relevant:
            require(all(execution.get(field) for field in
                        ('requested_account_snapshot_id', 'effective_account_snapshot_id')),
                    'account interpretation requires original snapshots')
    if 'node' in records:
        node, run = records['node']['body'], records['run']['body']
        require(node['workgraph_id'] == run['workgraph_id']
                and node['workgraph_revision'] == run['workgraph_revision'], 'installed graph join')
        require(node['source_request_id'] == records['operation']['body']['source_request_id'], 'materialization request join')
    transition = capture['transition']
    # Retain the mirror consistency check, but authenticate its complete field set
    # against the independently hashed source records above.
    require(same_value(transition['observed_payload'], original), 'conditional presence/original observation')
    require(same_value(transition['event_sequence'], payload['event_sequence']), 'reserved sequence')
    require(same_value(transition['revision'], records[adapter['transition_record']]['revision']), 'transition revision')
    require(transition['before'] == records[adapter['transition_record']]['body']['state'], 'source predecessor')
    rules = [r for r in adapter['transitions']
             if transition['before'] == r['before']
             and all(payload.get(k) == v for k, v in r.get('when', {}).items())]
    validate_transition_rules(rules)
    require(transition['after'] == rules[0]['after'], 'illegal successor')
    require(capture['post_state']['state'] == transition['after'], 'post-state')
    require(same_value(capture['post_state']['revision'], transition['revision'] + 1), 'post-state CAS')
    require(same_value(capture['post_state']['event_sequence'], payload['event_sequence']), 'post-state sequence')
    effects = adapter.get('effects_by_failure_class', {}).get(payload.get('failure_class'), adapter['effects'])
    require(capture['post_state']['effects'] == effects, 'post-state effects')
    for path, expected in adapter['requirements'].items():
        require(at(records, path) == expected, 'owner predicate ' + path)
    validate_dependencies(contract, payload, capture)
    name = contract['event_type']
    if name == 'attempt.completed':
        require((payload['terminal_state'] == 'done') == payload.get('success', False), 'terminal outcome classification')
    if name == 'node.blocked':
        body = records['episode']['body']
        require(payload.get('attempt_id') == body.get('attempt_id'), 'pre-attempt omission')
        if payload.get('requires_safe_point_restore'):
            require(bool(payload.get('safe_point_id')) and bool(payload.get('anchor_ref')), 'restore anchor')
    if name == 'node.unblocked':
        body = records['episode']['body']
        require(body['chosen_action'] in body['allowed_action_ids'], 'current ordered action')
        require(body['resolution'] == payload['resolution'], 'resolution evidence')
        require(body['restore_result'] == 'committed' if payload['resolution'] == 'safe_point_restored'
                else body['prerequisite_state'] == 'resolved', 'resolution barrier')
    if name.startswith('remediation.'):
        lineage = records['lineage']['body']
        require(payload['child_attempt_id'] != payload['remediation_parent_attempt_id'], 'child is parent')
        require(payload['remediation_parent_attempt_id'] == records['parent_attempt']['body']['attempt_id'], 'parent attempt record')
        require(payload['child_attempt_id'] == records['child_attempt']['body']['attempt_id'], 'child attempt record')
        require(payload['remediation_root_id'] == records['root']['body']['remediation_root_id'], 'remediation root record')
        require(lineage['generation'] <= lineage['ceiling'], 'remediation ceiling')
        require(same_value(lineage['generation'], lineage['remediation_generation']), 'normalized remediation generation')
        require(payload['remediation_generation'] <= lineage['ceiling'], 'joined remediation generation ceiling')
        if name == 'remediation.resolved' and payload['resolution'] == 'fixed':
            require(lineage['child_result'] == 'done', 'fixed without successful child')
    if name in ('run.node_backoff_started', 'run.node_backoff_expired', 'run.node_retry_scheduled'):
        validate_retry(contract, payload, records)
    if name == 'scheduler.pass':
        scheduler = records['scheduler']['body']
        operation = records['operation']['body']
        validate_score_domain(operation['ready_nodes'], operation['selected_nodes'])
        validate_score_domain([], scheduler['selected_nodes'])
        validate_score_domain(payload['ready_nodes'], payload['selected_nodes'])
        require(scheduler['selected_nodes'] == payload['selected_nodes'], 'scheduler source selection')
        ready = payload['ready_nodes']
        selected = [x['node_id'] for x in payload['selected_nodes']]
        excluded = [x['node_id'] for x in payload['non_selected_nodes']]
        ids = [x['node_id'] for x in ready]
        require(len(set(ids)) == len(ids) and len(set(selected + excluded)) == len(selected + excluded), 'duplicate candidate')
        require(set(ids) == set(selected + excluded), 'candidate partition')
        require(len(selected) == min(len(ready), payload['available_slots']), 'fill available capacity')
        lanes = {'remediation': 3, 'unblocker': 2, 'normal': 1}
        ordered = sorted(ready, key=lambda x: (-lanes[x['scheduler_lane']], -x['manual_priority'], -x['transitive_unblock_count'], x['ready_since_utc'], x['node_id']))
        require(selected == [x['node_id'] for x in ordered[:len(selected)]], 'score ordering')
        by_id = {x['node_id']: x for x in ready}
        for item in payload['selected_nodes']:
            require(item['score_tuple'] == by_id[item['node_id']] and item['lane'] == by_id[item['node_id']]['scheduler_lane'], 'selected score')
        wakes = sorted(scheduler['wakes'], key=lambda x: (x['recorded_at_utc'], x['event_id']))
        require(bool(wakes) and payload['wake_reason'] == wakes[0]['reason'], 'primary wake')
        require(payload.get('coalesced_wake_reasons', []) == [x['reason'] for x in wakes[1:]], 'coalesced wakes')
        require(payload.get('wake_event_refs', []) == [x['event_id'] for x in wakes[1:]], 'wake event joins')
        if scheduler['recovered']:
            require(payload['wake_reason'] == 'startup_recovered', 'first recovery wake')
        if payload['wake_reason'] == 'watchdog_recheck':
            require(all(x['reason'] == 'watchdog_recheck' for x in wakes), 'watchdog pending event')
    expected_trace = ['admission', 'dependency_commit', 'body_commit', 'append', 'first_receipt', 'owner_cas', 'publish']
    require(capture['trace'] == expected_trace, 'publication ordering')
    return True


def validate_dependencies(contract, payload, capture):
    """Verify complete owner-resolved bodies for the viewer of this read."""
    adapter = contract['semantic_adapter']
    records, scope = capture['records'], capture['scope']
    for field, ref in capture['dependency_refs'].items():
        dependency = capture['dependencies'].get(ref)
        validate_dependency_presence(dependency, field)
        require(payload.get(field) == ref, 'dependency payload ref ' + field)
        require(dependency['project_id'] == payload['project_id'], 'dependency scope ' + field)
        require(dependency['storage_instance_id'] == scope['storage_instance_id'], 'dependency root ' + field)
        require(dependency['sha256'] == digest(dependency['body']), 'dependency hash ' + field)
        require(dependency['deleted_at'] is None, 'deleted dependency ' + field)
        require(capture['viewer'] in dependency['readers'], 'dependency authorization ' + field)
        if field == 'execution_unit_context_ref':
            # Shared dependency instances keep their existing owner validation.
            # The DX whole-document gate owns the sixteen payloads and proof schema.
            schema_validate('Plans/execution_unit_context.schema.json', dependency['body'],
                            whole_schema_refs=False)
        if field in ('runtime_snapshot_ref', 'execution_unit_context_ref'):
            for key in ('project_id', 'run_id', 'thread_id', 'node_id', 'attempt_id'):
                if key in dependency['body'] and key in payload:
                    require(same_value(dependency['body'][key], payload[key]), 'runtime subject ' + key)
            for key in adapter['context_join_fields']:
                require(same_value(dependency['body'].get(key), records['execution']['body'].get(key)), 'runtime identity ' + key)
    reference_fields = {k for k in payload if k.endswith('_ref') or k.endswith('_snapshot_id') or k == 'safe_point_id'}
    require(set(capture['dependency_refs']) == reference_fields, 'complete dependency resolution')
    for field in adapter['evidence_lists']:
        for ref in payload.get(field, []):
            dependency = capture['dependencies'].get(ref)
            require(dependency is not None and dependency['project_id'] == payload['project_id']
                    and dependency['storage_instance_id'] == scope['storage_instance_id']
                    and dependency['sha256'] == digest(dependency['body'])
                    and dependency['deleted_at'] is None and capture['viewer'] in dependency['readers'],
                    'evidence list dependency ' + field)


def validate_history(contract, payload, original, retained_source_sha256, disclosure):
    """Finite retained-source read oracle, independent of today's live lifecycle.

    The hash is a test observation of immutable retained-source custody, not a new
    persisted event field or native admission proof. Original transition predicates
    use the original owner reads; disclosure uses current access/withdrawal fences.
    """
    require(digest(original) == retained_source_sha256, 'retained original source custody')
    # Authenticate the immutable original and its then-valid lifecycle first.
    # The recorded viewer is evidence of original disclosure, never a current grant.
    validate_capture(contract, payload, original['capture'], historical=True)
    require(disclosure['reader_active'], 'reader_withdrawn')
    require(disclosure['source_available'], 'source_unavailable')
    require(disclosure['event_deleted_at'] is None, 'event_deleted')
    require(disclosure['viewer'] in disclosure['event_readers'], 'event access')
    require(disclosure['project_id'] == payload['project_id'], 'history Project')
    require(disclosure['storage_instance_id'] == original['capture']['scope']['storage_instance_id'],
            'history Storage root')
    # These are fresh owner read observations, separate from the pinned original.
    current = {**original['capture'], 'viewer': disclosure['viewer'],
               'payload_packs': disclosure['payload_packs'],
               'dependencies': disclosure['dependencies']}
    validate_payload_transport(payload, current['envelope'], current['payload_packs'], current['viewer'])
    validate_dependencies(contract, payload, current)
    return {'result': 'history_only', 'effects': 0}


def run_trace(contract, payload, scenario):
    """Small deterministic model of receipt custody, restart and reader fences."""
    from pm_executor_event_contracts import identity
    rows, effects, first = {}, 0, None
    writer, reader, generation, frontier = True, True, 1, 0
    token = (generation, frontier)
    outputs = []
    for operation in scenario['operations']:
        action = operation['op']
        if action in ('append', 'replay'):
            try:
                validate_append_policy(contract, operation.get('replay_policy', contract['replay_policy']))
            except ValueError as error:
                outputs.append(str(error))
                continue
            p = copy.deepcopy(payload)
            p.update(operation.get('payload_changes', {}))
            try:
                schema_validate(contract['schema_ref'], p)
            except (ValueError, jsonschema.ValidationError):
                outputs.append('invalid_payload')
                continue
            try:
                validate_payload_transport(p, {
                    'payload': operation.get('inline_payload', p),
                    'payload_ref': operation.get('payload_ref'),
                    'storage_instance_id': 'store-001',
                }, operation.get('payload_packs', {}), operation.get('viewer', 'viewer-001'))
            except ValueError as error:
                outputs.append(str(error))
                continue
            key = identity(contract, p, 'store-001')
            if key in rows:
                prior = rows[key]
                if prior is None:
                    outputs.append('dedupe_unavailable')
                elif prior['digest'] != digest(p):
                    outputs.append('idempotency_conflict')
                else:
                    outputs.append(prior['receipt'])
            elif not writer:
                outputs.append('writer_withdrawn')
            elif action == 'replay':
                outputs.append('missing_original')
            else:
                first = 'first-receipt-001'
                rows[key] = {'digest': digest(p), 'receipt': first, 'result': copy.deepcopy(p)}
                effects += 1
                frontier += 1
                outputs.append('ack_lost' if operation.get('lose_ack') else first)
        elif action == 'crash':
            outputs.append('restarted')
        elif action == 'lose_custody':
            rows[identity(contract, payload, 'store-001')] = None
            outputs.append('custody_unavailable')
        elif action == 'withdraw_writer':
            writer = False
            outputs.append('writer_closed')
        elif action == 'withdraw_reader':
            reader = False
            outputs.append('reader_closed')
        elif action == 'compact':
            generation += 1
            outputs.append('source_generation_changed')
        elif action == 'refresh_token':
            token = (generation, frontier)
            outputs.append('token_refreshed')
        elif action == 'read':
            outputs.append('reader_withdrawn' if not reader else 'stale_token' if token != (generation, frontier) else 'history_only')
        elif action == 'rebuild':
            outputs.append('rebuilt' if rows and all(x is not None for x in rows.values()) else 'source_unavailable')
        else:
            raise ValueError('unknown trace operation ' + action)
    return {'outputs': outputs, 'effects': effects}


def mutate(value, changes):
    result = copy.deepcopy(value)
    for change in changes:
        parts = change['path'].split('/')
        target = result
        for part in parts[:-1]:
            target = target[int(part)] if isinstance(target, list) else target[part]
        key = int(parts[-1]) if isinstance(target, list) else parts[-1]
        if change.get('delete'):
            del target[key]
        else:
            target[key] = change['value']
    return result


def run_helper_case(case):
    """Exercise prerequisite predicates before their dependent dereferences."""
    name, value = case['helper'], case['value']
    operations = {
        'fixture_literals': lambda: expand_fixture_literals({'fixture_text_parts': value['parts']}),
        'payload_map_keys': lambda: validate_payload_map_keys(dict(value)),
        'pack_presence': lambda: validate_pack_presence(value),
        'source_timezone': lambda: validate_source_timezone(datetime.fromisoformat(value)),
        'instant': lambda: instant(value),
        'retry_classification': lambda: validate_retry_classification(value),
        'retry_policy_domain': lambda: validate_retry_policy_domain(value, {'provider_transient': 3, 'rate_limited': 3, 'structured_output_invalid': 2, 'auth_expired': 1}),
        'retry_after_header': lambda: validate_retry_after_header(value),
        'retry_after_timezone': lambda: validate_retry_after_timezone(parsedate_to_datetime(value)),
        'auth_refresh': lambda: validate_auth_refresh(value),
        'source_record_set': lambda: validate_source_record_set(value['records'], set(value['expected_slots'])),
        'transition_rules': lambda: validate_transition_rules(value),
        'dependency_presence': lambda: validate_dependency_presence(value, case['field']),
    }
    return operations[name]()


def run_numeric_case(contract, baseline, case):
    """Probe the declared fixture numeric domain before hashing or encoding."""
    from pm_executor_event_contracts import identity
    number = json.loads(case['spelling'])
    payload = {**baseline['payload'], 'event_sequence': number}
    boundary = case['boundary']
    if boundary == 'identity':
        return identity(contract, payload, 'store-001')
    if boundary == 'digest':
        return digest(payload)
    if boundary == 'canonical':
        return canonical({'nested': [number]})
    if boundary == 'payload_bytes':
        return payload_bytes(payload)
    raise ValueError('unknown numeric boundary ' + boundary)


def main():
    contracts = json.loads((ROOT / 'Plans/executor_event_contracts.json').read_text())['families']
    failures = check_lane_schemas(contracts)
    if failures:
        print(json.dumps({'status': 'fail', 'schema_reference_failures': failures, 'native_execution': 'NOT_RUN'}, indent=2))
        return 1
    fixture_doc = json.loads((ROOT / 'Plans/executor_event_semantic_fixtures.json').read_text())
    # Deliberately invalid authoring literals are only expanded by their own case.
    families = expand_fixture_literals(fixture_doc['families'])
    helper_cases = fixture_doc.get('helper_cases', [])
    ref_fixtures = json.loads((ROOT / 'Plans/executor_event_schema_reference_fixtures.json').read_text())['families']
    for case in helper_cases:
        try:
            run_helper_case(case)
            result, reason = 'accept', None
        except ValueError as error:
            result, reason = 'reject', str(error)
        if result != case['expected'] or reason != case.get('reason'):
            failures.append(['helper', case['case'], result, reason])
    count, traces, score_cases, schema_cases, ref_cases, history_cases, numeric_cases = 0, 0, 0, 0, 0, 0, 0
    require(set(families) == {c['event_type'] for c in contracts}, 'fixture family closure')
    for contract in contracts:
        family = families[contract['event_type']]
        failures.extend(reference_cases(contract, ref_fixtures[contract['event_type']]))
        ref_cases += len(ref_fixtures[contract['event_type']])
        for case in family.get('numeric_cases', []):
            numeric_cases += 1
            try:
                actual = run_numeric_case(contract, family['baseline'], case)
                result = 'accept'
                # JSON -0 decodes to integer zero. It must have exactly the same
                # identity/digest/bytes as 0, never a second spelling downstream.
                canonical_spelling = str(json.loads(case['spelling']))
                control = run_numeric_case(contract, family['baseline'],
                                           {**case, 'spelling': canonical_spelling})
                require(actual == control, 'numeric spelling canonical result')
            except ValueError:
                result = 'reject'
            if result != case['expected']:
                failures.append([contract['event_type'], case['case'], result])
        for case in family['cases']:
            count += 1
            specimen = mutate(family['baseline'], case['changes'])
            if 'seed_changes' in case:
                seed = mutate(family['baseline'], case['seed_changes'])
                validate_capture(contract, seed['payload'], seed['capture'])
                require(fixture_encoding(mutate(seed, case['defect_changes'])) == fixture_encoding(specimen),
                        'coherent negative seed ' + case['case'])
            try:
                validate_capture(contract, specimen['payload'], specimen['capture'])
                result = 'accept'
            except (ValueError, KeyError, jsonschema.ValidationError):
                result = 'reject'
            if result != case['expected']:
                failures.append([contract['event_type'], case['case'], result])
        for case in family.get('history_cases', []):
            history_cases += 1
            original = mutate(family['baseline'], case['original_changes'])
            payload = copy.deepcopy(family['baseline']['payload'])
            payload.update(case['event_changes'])
            if 'seed_disclosure' in case:
                validate_history(contract, payload, original, case['retained_source_sha256'],
                                 case['seed_disclosure'])
                require(fixture_encoding(mutate(case['seed_disclosure'], case['disclosure_changes']))
                        == fixture_encoding(case['disclosure']),
                        'coherent disclosure seed ' + case['case'])
            try:
                actual = validate_history(contract, payload, original,
                                          case.get('retained_source_sha256', family['retained_source_sha256']), case['disclosure'])
                result, reason = ('accept' if actual == {'result': 'history_only', 'effects': 0} else 'invalid_effects'), None
            except (ValueError, KeyError, jsonschema.ValidationError) as error:
                result, reason = 'reject', str(error)
            if result != case['expected']:
                failures.append([contract['event_type'], case['case'], result])
            if 'reason' in case and (reason is None or not reason.startswith(case['reason'])):
                failures.append([contract['event_type'], case['case'], reason])
            # The same event must fail current-writer predicates using the later
            # live source; passing history cannot be an accidental ignored check.
            live = mutate(family['baseline'], case['live_changes'])
            try:
                validate_capture(contract, payload, live['capture'])
                current_result = 'accept'
            except (ValueError, KeyError, jsonschema.ValidationError):
                current_result = 'reject'
            if current_result != 'reject':
                failures.append([contract['event_type'], case['case'] + '-live-control', current_result])
        for scenario in family['traces']:
            traces += 1
            actual = run_trace(contract, family['baseline']['payload'], scenario)
            if actual != scenario['expected']:
                failures.append([contract['event_type'], scenario['case'], actual])
        for case in family.get('score_domain_cases', []):
            score_cases += 1
            try:
                validate_score_domain(case['ready_nodes'], case['selected_nodes'])
                result = 'accept'
            except (ValueError, KeyError):
                result = 'reject'
            if result != case['expected']:
                failures.append([contract['event_type'], case['case'], result])
        for case in family.get('schema_cases', []):
            schema_cases += 1
            if 'valid_seed' in case:
                schema_validate(contract['schema_ref'], case['valid_seed'])
            try:
                # Test each schema's exact-end guard independently of our stricter
                # format checker and of every relational/source comparison.
                schema = json.loads((ROOT / contract['schema_ref']).read_text())
                jsonschema.Draft202012Validator(schema, format_checker=jsonschema.FormatChecker()).validate(case['payload'])
                result = 'accept'
            except (ValueError, jsonschema.ValidationError):
                result = 'reject'
            if result != case['expected']:
                failures.append([contract['event_type'], case['case'], result])
    print(json.dumps({'status': 'fail' if failures else 'pass', 'families': len(families), 'source_transition_cases': count, 'receipt_replay_withdrawal_traces': traces, 'source_score_domain_cases': score_cases, 'isolated_schema_cases': schema_cases, 'schema_reference_cases': ref_cases, 'historical_read_cases': history_cases, 'numeric_boundary_cases': numeric_cases, 'helper_cases': len(helper_cases), 'failures': failures, 'native_execution': 'NOT_RUN'}, indent=2))
    return bool(failures)


if __name__ == '__main__':
    raise SystemExit(main())
