#!/usr/bin/env python3
"""Static DDBG planning contract oracles. No runtime/admission authority."""
import copy
import base64
import hashlib
import json
from pathlib import Path
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
HELD_EVENT = 'debug.investigation.instrumentation_state_changed'


def writer_policy_refusal(case):
    policy = case['envelope']['replay_policy']
    if policy == 'projector_replay_only':
        return 'replay_only_not_appendable'
    if policy != 'dedupe_by_idempotency_key':
        return 'writer_policy_mismatch'
    return None


def semantic_digest(case):
    # Contracts EventRecord producer_semantic_digest, not the Storage receipt
    # digest. These are bounded JSON vectors, not a native RFC 8785 codec proof.
    fields = ('scope_kind', 'project_id', 'thread_id', 'run_id', 'node_id',
              'attempt_id', 'actor_ref', 'requested_account_ref',
              'effective_account_ref', 'occurred_at_utc', 'producer_sequence_id',
              'correlation_id', 'causation_event_id', 'parent_event_id',
              'idempotency_key', 'payload_schema_id', 'payload_ref',
              'redaction_profile', 'migration')
    body = {key: case['envelope'].get(key) for key in fields}
    body.update(event_type=case['event_type'], payload=case['payload'])
    return hashlib.sha256(json.dumps(body, ensure_ascii=False, sort_keys=True,
                                     separators=(',', ':')).encode()).hexdigest()


def candidate_refusal(case, validator):
    """Static candidate model; envelope/owner are projections, not new schemas."""
    payload, envelope, owner = case['payload'], case['envelope'], case['owner_record']
    if reason := writer_policy_refusal(case):
        return reason
    if not validator.is_valid(payload):
        return 'invalid_payload'
    project = case['project_id']
    if not isinstance(project, str) or not project:
        return 'project_scope_mismatch'
    partition = 'project~' + base64.urlsafe_b64encode(project.encode()).decode().rstrip('=')
    if (not project or envelope['scope_kind'] != 'project'
            or envelope['project_id'] != project or owner['project_id'] != project
            or case['scope_partition'] != partition
            or owner['investigation_id'] != payload['investigation_id']
            or ('project_id' in payload and payload['project_id'] != project)):
        return 'project_scope_mismatch'
    for key in ('thread_id', 'run_id'):
        if envelope.get(key) != owner.get(key):
            return 'project_scope_mismatch'
        if key in payload and payload[key] != owner.get(key):
            return 'project_scope_mismatch'
    if case['event_type'] == 'debug.investigation.started':
        resolution = case['mode_resolution']  # fixture projection, not payload
        if payload['runtime_mode'] == 'yolo' and not resolution['explicit_yolo']:
            return 'explicit_yolo_required'
        if (resolution['from_planning'] and payload['runtime_mode'] in ('regular', 'yolo')
                and not resolution['approval_received']):
            return 'planning_approval_required'
    if (case['event_type'] == 'debug.investigation.context_item_state_changed'
            and payload['previous_state'] == payload['state']):
        return 'no_op'
    # These static vectors are inline; external bodies/receipts retain SP-337's
    # native verification obligation rather than a fabricated pack-store model.
    if len(json.dumps(payload, ensure_ascii=False, separators=(',', ':')).encode()) > 16384:
        return 'payload_reference_required'
    if case['event_type'] == HELD_EVENT:
        return 'instrumentation_mapping_unresolved'
    return None

def patched_case(case, patches):
    result = copy.deepcopy(case)
    for path, value in patches.items():
        target = result
        parts = path.split('.')
        for key in parts[:-1]:
            target = target[key]
        target[parts[-1]] = value
    return result

def identity(event, project, payload):
    preimage = [event, project, payload['investigation_id'], payload['operation_id']]
    digest = hashlib.sha256(json.dumps(preimage, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
    return 'debug:' + digest, 'evt_debug_' + digest

def refusal(case, admitted=False, retention='PENDING_RETENTION_DECISION', withdrawn=False):
    if reason := writer_policy_refusal(case):
        return reason
    if withdrawn:
        return 'withdrawn'
    if not admitted:
        return 'unregistered'
    if retention == 'PENDING_RETENTION_DECISION':
        return 'retention_unresolved'
    return None

def main():
    schema = json.loads((ROOT/'Plans/debug_investigation_event_payloads.schema.json').read_text())
    fixture = json.loads((ROOT/'Plans/debug_investigation_event_fixtures.json').read_text())
    registry = json.loads((ROOT/'Plans/event_family_registry.json').read_text())
    admitted = {r['event_type'] for r in registry['families']}
    failures = []
    rows = []
    def check(ok, description):
        if not ok:
            failures.append(description)
    for case in fixture['cases']:
        event, payload = case['event_type'], case['payload']
        name = event.rsplit('.', 1)[1]
        definition = schema['$defs'][name]
        Draft202012Validator.check_schema(definition)
        validator = Draft202012Validator(definition)
        held = event == HELD_EVENT
        check(validator.is_valid(payload), event + ': structural held candidate' if held else event + ': positive payload')
        check(candidate_refusal(case, validator) == ('instrumentation_mapping_unresolved' if held else None),
              event + ': held candidate refusal' if held else event + ': positive semantic joins/transition')
        check(case.get('outcome') == 'held_for_jared' if held else case.get('outcome') != 'held_for_jared', event + ': exact hold disposition')
        if held:
            check(bool(case.get('hold_question')), event + ': exact unanswered question')
        check(event not in admitted, event + ': must remain unadmitted')
        checks = 2
        for key in definition['required']:
            bad = copy.deepcopy(payload)
            del bad[key]
            check(not validator.is_valid(bad), event + ': missing ' + key)
            checks += 1
        for bad in [dict(payload, raw_log_dump='secret'), dict(payload, schema_version='2.0.0')]:
            check(not validator.is_valid(bad), event + ': closed payload/version')
            checks += 1
        if name == 'started':
            # Cases cite the workflow owner that supplies the resolution. The
            # closed schema does not purport to classify every enum product.
            for resolution in case['mode_cases']:
                probe = patched_case(case, resolution['patches'])
                check(bool(resolution['source_ref']), event + ': resolution source')
                check(candidate_refusal(probe, validator) == resolution['expected_refusal'],
                      event + ': owner resolution ' + resolution['case'])
                checks += 1
            debug_payload = dict(payload, requested_mode_overlay='debug',
                                 effective_mode_overlay='debug', runtime_mode='regular')
            mode_negatives = [
                dict(debug_payload, requested_mode_overlay='not_a_mode'),
                dict(debug_payload, effective_mode_overlay='scrubbed'),
                dict(debug_payload, effective_mode_overlay='plan'),
                dict(debug_payload, runtime_mode='ask'),
                dict(debug_payload, runtime_mode='plan'),
                dict(debug_payload, runtime_mode='invented'),
            ]
            for bad in mode_negatives:
                check(not validator.is_valid(bad), event + ': forbidden Debug/enum tuple')
                checks += 1
        if name == 'context_item_state_changed':
            no_op = patched_case(case, {'payload.state': payload['previous_state']})
            check(validator.is_valid(no_op['payload']), event + ': no-op is structurally valid')
            check(candidate_refusal(no_op, validator) == 'no_op', event + ': no-op emits zero events')
            checks += 2
        if name == 'verification_recorded':
            oversized = patched_case(case, {'payload.artifact_refs': ['artifact:' + str(i) + ':' + 'a' * 230 for i in range(100)]})
            check(validator.is_valid(oversized['payload']), event + ': oversized resolved body remains structurally valid')
            check(candidate_refusal(oversized, validator) == 'payload_reference_required', event + ': SP-337 oversized body cannot be inline')
            checks += 2
        # Each fixture's negative is executed by the same candidate gate as its
        # positive. Merely changing an identity preimage cannot prove a join.
        for negative in case['negative_cases']:
            bad = patched_case(case, negative['patches'])
            reason = candidate_refusal(bad, validator)
            check(reason == negative['expected_refusal'], event + ': ' + negative['case'])
            appends = int(reason is None)
            check(appends == negative['expected_appends'] == 0, event + ': zero-append ' + negative['case'])
            checks += 2
        bad_scope = patched_case(case, {'payload.project_id': 'other-project'}) if name == 'started' else patched_case(case, {'envelope.project_id': 'other-project'})
        check(candidate_refusal(bad_scope, validator) == 'project_scope_mismatch', event + ': concrete Project join refusal')
        for policy, reason in [('projector_replay_only', 'replay_only_not_appendable'),
                               ('append_once', 'writer_policy_mismatch'),
                               ('dedupe_by_event_id', 'writer_policy_mismatch')]:
            bad_policy = patched_case(case, {'envelope.replay_policy': policy})
            check(refusal(bad_policy, admitted=True, retention='resolved') == reason,
                  event + ': current append/retry refuses ' + policy)
        check(bool(case.get('native_oracles')) and all(o.get('execution_status') == 'NOT_RUN' for o in case['native_oracles']), event + ': authored native obligations retained, NOT_RUN')
        original_key, original_id = identity(event, case['project_id'], payload)
        check([original_key, original_id] == case['expected_identity'], event + ': exact identity vector')
        check(identity(event, 'other-project', payload) != (original_key, original_id), event + ': scope substitution')
        other = dict(payload, operation_id='different-operation')
        check(identity(event, case['project_id'], other) != (original_key, original_id), event + ': distinct operation')
        # Same immutable identity, altered semantic body must conflict rather than append again.
        changed = dict(payload, **{case['mutation_field']:case['mutation_value']})
        check(validator.is_valid(changed), event + ': changed-body vector must stay schema-valid')
        check(identity(event, case['project_id'], changed) == (original_key, original_id), event + ': retry identity')
        changed_case = dict(case, payload=changed)
        check(semantic_digest(changed_case) != semantic_digest(case), event + ': semantic digest conflict')
        custody = {original_key:(semantic_digest(case), 'original-synced-receipt')}
        check(custody[original_key] == (semantic_digest(copy.deepcopy(case)), 'original-synced-receipt'), event + ': lost ACK original custody')
        # Field-selection probes isolate digest equality; changing a scope/key
        # is not claimed to be a schema-valid retry under the same identity.
        for retry in case.get('retry_cases', []):
            probe = patched_case(case, retry['patches'])
            same = semantic_digest(probe) == semantic_digest(case)
            check(retry['expected_result'] in ('original_receipt', 'semantic_digest_changed'),
                  event + ': closed digest-field oracle result')
            check(same == (retry['expected_result'] == 'original_receipt'),
                  event + ': retry ' + retry['case'])
        # This is a transient-reader fixture assertion, not a new checkpoint.
        check(held or case.get('family_checkpoint') == 'none_required', event + ': no durable family checkpoint')
        check(refusal(case) == 'unregistered', event + ': admission refusal')
        check(refusal(case, admitted=True) == 'retention_unresolved', event + ': retention refusal')
        check(refusal(case, admitted=True, retention='resolved', withdrawn=True) == 'withdrawn', event + ': withdrawal refusal')
        rows.append({'event_type':event,'schema_checks':checks,'outcome':'held_for_jared' if held else 'prepared_without_admission','native_execution':'NOT_RUN'})
    check(len(rows) == 8 and len({r['event_type'] for r in rows}) == 8, 'eight distinct draft families')
    check(sum(r['outcome'] == 'prepared_without_admission' for r in rows) == 7, 'seven prepared families; instrumentation held')
    check('state_changed' not in schema['$defs'], 'owner question cannot be answered by a schema')
    check(bool(fixture.get('native_obligations')), 'shared native obligations retained, NOT_RUN')
    print(json.dumps({'status':'FAIL' if failures else 'PASS','rows':rows,'failures':failures,'scope':'Static payload/identity/refusal oracles only; native NOT_RUN.'},indent=2))
    return bool(failures)

if __name__ == '__main__':
    raise SystemExit(main())
