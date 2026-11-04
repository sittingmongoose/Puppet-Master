#!/usr/bin/env python3
"""Static relational/trace oracles for prepared Executor events; never a native adapter."""
import copy
import base64
import hashlib
import json
from datetime import datetime
from pathlib import Path

import jsonschema

ROOT = Path(__file__).resolve().parents[1]


def require(condition, reason):
    if not condition:
        raise ValueError(reason)


def canonical(value):
    # Fixture domain is strings, booleans, null, safe integers, lists and objects.
    return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':'))


def digest(value):
    return hashlib.sha256(canonical(value).encode()).hexdigest()


def at(value, path):
    for part in path.split('.'):
        value = value[part]
    return value


def schema_validate(path, value):
    schema = json.loads((ROOT / path).read_text())
    jsonschema.Draft202012Validator(schema, format_checker=jsonschema.FormatChecker()).validate(value)


def validate_capture(contract, payload, capture):
    """Check normalized owner reads, independently joined parents, and committed post-state.

    Captures are unpersisted test data. Native code must obtain the complete records
    through the owners, validate their existing schemas and hold the writer/read fence.
    No caller-controlled `*_valid` flag is accepted here as authority.
    """
    schema_validate(contract['schema_ref'], payload)
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
            require(capture['envelope'].get(field) == payload[field], 'envelope ' + field)
    records = capture['records']
    expected_slots = set(adapter['source_records'])
    if contract['event_type'] in ('node.blocked', 'node.unblocked'):
        if 'attempt_id' not in payload:
            expected_slots.discard('attempt')
            require(capture['envelope'].get('attempt_id') is None, 'pre-attempt envelope')
    require(set(records) == expected_slots, 'source record set')
    for slot, owner in adapter['source_records'].items():
        if slot not in expected_slots:
            continue
        record = records[slot]
        require(record['owner'] == owner, 'source owner ' + slot)
        require(record['project_id'] == scope['project_id'], 'source Project ' + slot)
        require(record['storage_instance_id'] == scope['storage_instance_id'], 'source root ' + slot)
        require(record['revision'] == capture['expected_revisions'][slot], 'source revision ' + slot)
        require(record['sha256'] == digest(record['body']), 'source digest ' + slot)
        require(record['parents'] == {parent: records[parent]['ref'] for parent in adapter['parent_joins'][slot]}, 'source parents ' + slot)
    for field, path in adapter['joins'].items():
        if field in payload:
            require(payload[field] == at(records, path), 'source join ' + field)
    if 'node' in records:
        node, run = records['node']['body'], records['run']['body']
        require(node['workgraph_id'] == run['workgraph_id']
                and node['workgraph_revision'] == run['workgraph_revision'], 'installed graph join')
        require(node['source_request_id'] == records['operation']['body']['source_request_id'], 'materialization request join')
    transition = capture['transition']
    # The original reserved observation determines conditional presence. Comparing
    # only present event fields would let omission hide auth/timeout/recovery facts.
    require(transition['observed_payload'] == payload, 'conditional presence/original observation')
    require(transition['event_sequence'] == payload['event_sequence'], 'reserved sequence')
    require(transition['revision'] == records[adapter['transition_record']]['revision'], 'transition revision')
    require(transition['before'] == records[adapter['transition_record']]['body']['state'], 'source predecessor')
    rules = [r for r in adapter['transitions']
             if transition['before'] == r['before']
             and all(payload.get(k) == v for k, v in r.get('when', {}).items())]
    require(len(rules) == 1, 'illegal predecessor')
    require(transition['after'] == rules[0]['after'], 'illegal successor')
    require(capture['post_state']['state'] == transition['after'], 'post-state')
    require(capture['post_state']['revision'] == transition['revision'] + 1, 'post-state CAS')
    require(capture['post_state']['event_sequence'] == payload['event_sequence'], 'post-state sequence')
    require(capture['post_state']['effects'] == adapter['effects'], 'post-state effects')
    for path, expected in adapter['requirements'].items():
        require(at(records, path) == expected, 'owner predicate ' + path)
    for field, ref in capture['dependency_refs'].items():
        dependency = capture['dependencies'].get(ref)
        require(dependency is not None, 'missing dependency ' + field)
        require(payload.get(field) == ref, 'dependency payload ref ' + field)
        require(dependency['project_id'] == payload['project_id'], 'dependency scope ' + field)
        require(dependency['storage_instance_id'] == scope['storage_instance_id'], 'dependency root ' + field)
        require(dependency['sha256'] == digest(dependency['body']), 'dependency hash ' + field)
        require(dependency['deleted_at'] is None, 'deleted dependency ' + field)
        require(capture['viewer'] in dependency['readers'], 'dependency authorization ' + field)
        if field == 'execution_unit_context_ref':
            schema_validate('Plans/execution_unit_context.schema.json', dependency['body'])
        if field in ('runtime_snapshot_ref', 'execution_unit_context_ref'):
            for key in ('project_id', 'run_id', 'thread_id', 'node_id', 'attempt_id'):
                if key in dependency['body'] and key in payload:
                    require(dependency['body'][key] == payload[key], 'runtime subject ' + key)
            for key in adapter['context_join_fields']:
                require(dependency['body'].get(key) == records['execution']['body'].get(key), 'runtime identity ' + key)
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
        if name == 'remediation.resolved' and payload['resolution'] == 'fixed':
            require(lineage['child_result'] == 'done', 'fixed without successful child')
    if name in ('run.node_backoff_started', 'run.node_backoff_expired', 'run.node_retry_scheduled'):
        retry = records['retry']['body']
        require(retry['used'] < retry['limit'], 'per-error retry budget')
        require(retry['failure_class'] == payload['failure_class'], 'retry classification')
        require(retry['failure_class'] not in ('graph_integrity', 'verification_failed', 'reviewer_findings', 'quota_exceeded'), 'no blind retry')
        if retry['failure_class'] == 'storage_io':
            require(retry['storage_io_class'] in ('interrupted', 'transient_busy'), 'Storage retry class')
            require(retry['new_executor_attempt'] is False, 'Storage adapter retry')
        if name == 'run.node_backoff_expired':
            require(datetime.fromisoformat(payload['ts']) >= datetime.fromisoformat(retry['backoff_until_utc']), 'early timer')
        elif name == 'run.node_backoff_started':
            require(datetime.fromisoformat(payload['backoff_until_utc']) >= datetime.fromisoformat(payload['ts']), 'backoff deadline')
    if name == 'scheduler.pass':
        scheduler = records['scheduler']['body']
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
            p = copy.deepcopy(payload)
            p.update(operation.get('payload_changes', {}))
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


def main():
    contracts = json.loads((ROOT / 'Plans/executor_event_contracts.json').read_text())['families']
    families = json.loads((ROOT / 'Plans/executor_event_semantic_fixtures.json').read_text())['families']
    failures, count, traces = [], 0, 0
    require(set(families) == {c['event_type'] for c in contracts}, 'fixture family closure')
    for contract in contracts:
        family = families[contract['event_type']]
        for case in family['cases']:
            count += 1
            specimen = mutate(family['baseline'], case['changes'])
            try:
                validate_capture(contract, specimen['payload'], specimen['capture'])
                result = 'accept'
            except (ValueError, KeyError, jsonschema.ValidationError):
                result = 'reject'
            if result != case['expected']:
                failures.append([contract['event_type'], case['case'], result])
        for scenario in family['traces']:
            traces += 1
            actual = run_trace(contract, family['baseline']['payload'], scenario)
            if actual != scenario['expected']:
                failures.append([contract['event_type'], scenario['case'], actual])
    print(json.dumps({'status': 'fail' if failures else 'pass', 'families': len(families), 'source_transition_cases': count, 'receipt_replay_withdrawal_traces': traces, 'failures': failures, 'native_execution': 'NOT_RUN'}, indent=2))
    return bool(failures)


if __name__ == '__main__':
    raise SystemExit(main())
