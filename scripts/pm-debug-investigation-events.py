#!/usr/bin/env python3
"""Static DDBG planning contract oracles. No runtime/admission authority.

Every product refusal comes from a named guard-table row
(pm_debug_investigation_guards_<phase>.py, run through
pm_debug_investigation_transitions.py). This runner asserts the fixture
oracles: positives accept, each negative is refused by exactly one phase and
by the row it names, and the identity/digest/retry vectors hold.
"""
import copy
import json
import os
from pathlib import Path
from jsonschema import Draft202012Validator
from jsonschema.exceptions import SchemaError
import pm_debug_investigation_guard_constants as constants
from pm_debug_investigation_guards_retained import identity, semantic_digest
from pm_debug_investigation_transitions import (
    FAILED_REASONS, admission_probes, admission_refusal, candidate, candidate_refusal, candidate_result,
    cleanup_retry_refusal, load_documents, phase_results, reference_probes, retained_probes, retained_refusal,
    retry_request_probes, row_label, schema_reference_refusal)
import pm_debug_investigation_transitions as production

ROOT = Path(__file__).resolve().parents[1]
INSTRUMENTATION_EVENT = 'debug.investigation.instrumentation_state_changed'
# Each closed vocabulary a predicate uses for its domain, and the schema enum it must equal.
VOCABULARIES = (
    ('LIFECYCLE_STATES', 'lifecycle_source', 'state'), ('LIFECYCLE_PHASES', 'lifecycle_source', 'phase'),
    ('LIFECYCLE_STATES', 'state_changed', 'previous_state'), ('LIFECYCLE_PHASES', 'state_changed', 'previous_phase'),
    ('CONTEXT_STATES', 'context_item_state_changed', 'state'), ('INSTR_STATES', 'instrumentation_state_changed', 'state'),
    ('CLEANUP_RESULTS', 'instrumentation_state_changed', 'rollback_state'),
    ('INSTR_STATES', 'instrumentation_source', 'state'), ('CLEANUP_RESULTS', 'instrumentation_source', 'cleanup_result'),
    ('TRANSITION_KINDS', 'instrumentation_change_detail', 'transition_kind'))


def patched_case(case, patches):
    result = copy.deepcopy(case)
    for path, value in patches.items():
        target = result
        parts = path.split('.')
        for key in parts[:-1]:
            target = target[key]
        target[parts[-1]] = value
    return result


def main():
    schema = json.loads((ROOT/'Plans/debug_investigation_event_payloads.schema.json').read_text())
    fixture = json.loads((ROOT/'Plans/debug_investigation_event_fixtures.json').read_text())
    try:
        Draft202012Validator.check_schema(schema)
    except SchemaError as exc:
        print(json.dumps({'status': 'FAIL', 'failures': ['invalid companion schema: ' + exc.message]}))
        return True
    reference = schema_reference_refusal(schema)
    if reference is not None:
        print(json.dumps({'status': 'FAIL', 'failures': ['unresolved_schema_reference: ' + reference]}))
        return True
    load_documents(schema)
    registry = json.loads((ROOT/'Plans/event_family_registry.json').read_text())
    admitted = {r['event_type'] for r in registry['families']}
    failures = []
    rows = []
    # PM_DDBG_FAMILY=<event type> runs the per-family oracles of that family
    # only (the standing-check probes corrupt one family each); unset, every
    # family and the nine-family totals are checked.
    only = os.environ.get('PM_DDBG_FAMILY')
    if only is not None and only not in {meta['event_type'] for meta in fixture['cases']}:
        print(json.dumps({'status': 'FAIL', 'failures': ['PM_DDBG_FAMILY names no fixture family: ' + only]}))
        return True
    def check(ok, description):
        if not ok:
            failures.append(description)
    for name, definition, field in VOCABULARIES:
        check(tuple(schema['$defs'][definition]['properties'][field]['enum']) == getattr(constants, name),
              'domain vocabulary ' + name + ' equals ' + definition + '.' + field)
    _, probe_negatives = reference_probes(schema)
    for label, value, row, code in probe_negatives:
        check(schema_reference_refusal(value) == code, 'schema reference probe: ' + label)
    for meta in fixture['cases']:
        if only is not None and meta['event_type'] != only:
            continue
        case = candidate(meta)
        event, payload = case['event_type'], case['payload']
        name = event.rsplit('.', 1)[1]
        definition = schema['$defs'][name]
        Draft202012Validator.check_schema(definition)
        validator = Draft202012Validator(definition)
        check(validator.is_valid(payload), event + ': positive payload')
        check(candidate_result(case) == (None, None, None), event + ': positive semantic joins/transition')
        check(meta.get('outcome') != 'held_for_jared', event + ': resolved decision hold')
        for transition in meta.get('transition_cases', []):
            probe = patched_case(case, transition['patches'])
            check(candidate_refusal(probe) == transition['expected_refusal'],
                  event + ': transition ' + transition['case'])
        if name in ('instrumentation_state_changed', 'state_changed'):
            check(meta.get('retention_policy_ref') == 'RP-OPERATIONAL-2555D@1.0.0',
                  event + ': exact current G02 Project policy')
        if name == 'instrumentation_state_changed':
            request_validator = Draft202012Validator(schema['$defs']['cleanup_retry_request'])
            controls, negatives = retry_request_probes(meta['retry_request_cases'])
            for label, request in controls:
                check(request_validator.is_valid(request), event + ': typed retry request ' + label)
                check(cleanup_retry_refusal(request['retries_used'], request['authorized']) is None,
                      event + ': initiation ' + label)
            for label, request, row, code in negatives:
                result, reason = production.run_phase(production.retry.retry_request_case, request)
                check(row_label(result) == row if result else False, event + ': initiation row ' + label)
                check(reason == code, event + ': initiation ' + label)
                check(request_validator.is_valid(request) == (not row.startswith('cleanup_retry_request#')),
                      event + ': published retry schema agrees ' + label)
            required_kinds = set(schema['$defs']['instrumentation_change_detail']['properties']['transition_kind']['enum'])
            covered = {patched_case(case, row['patches'])['detail_records']['detail:op1']['transition_kind']
                       for row in meta['transition_cases']}
            check(covered == required_kinds, event + ': every DL-429 transition kind has a positive')
        if name == 'state_changed':
            failed_reasons = {patched_case(case, row['patches'])['payload'].get('stop_reason_code')
                              for row in meta['transition_cases']
                              if patched_case(case, row['patches'])['payload']['state'] == 'failed'}
            check(failed_reasons == set(FAILED_REASONS), event + ': all six Failed endings have positives')
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
            for resolution in meta['mode_cases']:
                probe = patched_case(case, resolution['patches'])
                check(bool(resolution['source_ref']), event + ': resolution source')
                check(candidate_refusal(probe) == resolution['expected_refusal'],
                      event + ': owner resolution ' + resolution['case'])
                if resolution['expected_refusal']:
                    refusing = [result for result in phase_results(probe) if result[1]]
                    check(len(refusing) == 1 and row_label(refusing[0][1]) == resolution['guard'],
                          event + ': owner resolution row ' + resolution['case'])
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
            check(candidate_refusal(no_op) == 'no_op', event + ': no-op emits zero events')
            checks += 2
        if name == 'verification_recorded':
            oversized = patched_case(case, {'payload.artifact_refs': ['artifact:' + str(i) + ':' + 'a' * 230 for i in range(100)]})
            check(validator.is_valid(oversized['payload']), event + ': oversized resolved body remains structurally valid')
            check(candidate_refusal(oversized) == 'payload_reference_required', event + ': SP-337 oversized body cannot be inline')
            checks += 2
        # Each fixture negative starts from a valid base, is refused by
        # exactly one phase, by the row it names, with its expected code; the
        # published schema (pattern included) agrees with the payload phase.
        valid_bases = {}
        for negative in meta['negative_cases']:
            negative_base = patched_case(case, negative.get('base_patches', {}))
            key = json.dumps(negative_base, sort_keys=True)
            if key not in valid_bases:
                valid_bases[key] = candidate_result(negative_base) == (None, None, None)
            check(valid_bases[key], event + ': valid base for ' + negative['case'])
            bad = patched_case(negative_base, negative['patches'])
            results = phase_results(bad)
            refusing = [result for result in results if result[1]]
            # The complete path is the phases in order; its refusal is the first refusing phase.
            reason = refusing[0][2] if refusing else None
            check(reason == negative['expected_refusal'], event + ': ' + negative['case'])
            appends = int(reason is None)
            check(appends == negative['expected_appends'] == 0, event + ': zero-append ' + negative['case'])
            check(len(refusing) == 1, event + ': exactly one phase refuses ' + negative['case'])
            check(bool(refusing) and row_label(refusing[0][1]) == negative.get('guard'),
                  event + ': named row refuses ' + negative['case'])
            check(validator.is_valid(bad['payload']) == (not refusing or refusing[0][0] != 'payload'),
                  event + ': published payload schema agrees ' + negative['case'])
            checks += 5
        bad_scope = patched_case(case, {'payload.project_id': 'other-project'}) if name == 'started' else patched_case(case, {'envelope.project_id': 'other-project'})
        check(candidate_refusal(bad_scope) == 'project_scope_mismatch', event + ': concrete Project join refusal')
        for policy, reason in [('projector_replay_only', 'replay_only_not_appendable'),
                               ('append_once', 'writer_policy_mismatch'),
                               ('dedupe_by_event_id', 'writer_policy_mismatch')]:
            bad_policy = patched_case(case, {'envelope.replay_policy': policy})
            check(admission_refusal(bad_policy, admitted=True, retention='resolved') == reason,
                  event + ': current append/retry refuses ' + policy)
        controls, negatives = admission_probes(case)
        for label, value in controls:
            check(admission_refusal(**value) is None, event + ': admission control ' + label)
        for label, value, row, code in negatives:
            check(admission_refusal(**value) == code, event + ': admission probe ' + label)
        check(bool(meta.get('native_oracles')) and all(o.get('execution_status') == 'NOT_RUN' for o in meta['native_oracles']), event + ': authored native obligations retained, NOT_RUN')
        # The reader-only historical replay policy is valid in its original
        # retained edition; current writer gating must not reach that original.
        controls, negatives = retained_probes(case)
        for label, value in controls:
            check(retained_refusal(value['case'], value['original'], value['withdrawn']) is None,
                  event + ': retained original ignores live state/writer policy')
        for label, value, row, code in negatives:
            check(retained_refusal(value['case'], value['original'], value['withdrawn']) == code,
                  event + ': historical ' + label)
        historical = controls[0][1]
        forged = patched_case(historical['case'], {'payload.operation_id': 'forged'})
        check(retained_refusal(forged, historical['original']) == 'forged_history_identity', event + ': historical forged identity')
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
        for retry in meta.get('retry_cases', []):
            probe = patched_case(case, retry['patches'])
            same = semantic_digest(probe) == semantic_digest(case)
            check(retry['expected_result'] in ('original_receipt', 'semantic_digest_changed'),
                  event + ': closed digest-field oracle result')
            check(same == (retry['expected_result'] == 'original_receipt'),
                  event + ': retry ' + retry['case'])
        # This is a transient-reader fixture assertion, not a new checkpoint.
        check(case.get('family_checkpoint') == 'none_required', event + ': no durable family checkpoint')
        check(admission_refusal(case) == 'unregistered', event + ': admission refusal')
        check(admission_refusal(case, admitted=True) == 'retention_unresolved', event + ': retention refusal')
        check(admission_refusal(case, admitted=True, retention='resolved', withdrawn=True) == 'withdrawn', event + ': withdrawal refusal')
        rows.append({'event_type':event,'schema_checks':checks,'outcome':'prepared_without_admission','native_execution':'NOT_RUN'})
    expected = 9 if only is None else 1
    check(len(rows) == expected and len({r['event_type'] for r in rows}) == expected, 'nine distinct prepared families')
    check(sum(r['outcome'] == 'prepared_without_admission' for r in rows) == expected, 'nine prepared families')
    check(bool(fixture.get('native_obligations')), 'shared native obligations retained, NOT_RUN')
    scope = 'Static payload/identity/refusal oracles only; native NOT_RUN.' + ('' if only is None else ' Family ' + only + ' only.')
    print(json.dumps({'status':'FAIL' if failures else 'PASS','rows':rows,'failures':failures,'scope':scope},indent=2))
    return bool(failures)

if __name__ == '__main__':
    raise SystemExit(main())
