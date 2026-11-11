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
from pm_event_numbers import Refusal, current_integer, loads_current_json, producer_semantic_digest, storage_uint64
import pm_debug_investigation_guard_constants as constants
from pm_debug_investigation_shared_rules import (
    TYPE_SENSITIVE_PATHS, digest_fields_are_producer_projection, identity, producer_projection, semantic_digest)
from pm_debug_investigation_transitions import (
    FAILED_REASONS, admission_probes, admission_refusal, candidate, load_documents, reference_probes, retained_probes,
    retry_request_probes, row_label, schema_reference_refusal)
import pm_debug_investigation_transitions as production
from pm_debug_investigation_views import (
    candidate_refusal, candidate_result, cleanup_retry_refusal, phase_results, retained_refusal)
import pm_debug_investigation_views as views

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


def read_json(relative):
    """CV-1100 raw ingress: the shared current parser (duplicate keys, lone surrogates, -0, 01 and
    non-finite tokens refuse; integers are exact at any length; fractional tokens stay Decimal)."""
    return loads_current_json((ROOT / relative).read_bytes())


def integral_float(value):
    return type(value) is float and value.is_integer()


def member(value, path):
    for key in path:
        value = value.get(key) if type(value) is dict else None
    return value


def same_on_projection(case):
    """Every phase gives the same result on its projected input as on the full candidate."""
    return all(views.run_named(name, factory, production.projected(name, case)) == views.run_named(name, factory, case)
               for name, factory in production.phases(case))


def single_refusal(case, row, code):
    """(ok, results): exactly one phase refuses, by the named row, with the code."""
    results = phase_results(case)
    refusing = [result for result in results if result[1]]
    return (len(refusing) == 1 and row_label(refusing[0][1]) == row and refusing[0][2] == code), results


CORPUS_RAW_OPS = ('token', 'parse', 'parse_token', 'slot')


def typed_value(value):
    if type(value) is dict and set(value) == {'@int'}:
        return loads_current_json(value['@int'])
    return value


def corpus_values(corpus):
    """Every number-scope value of the shared corpus: raw spellings (token, parse, parse_token, slot, json_number)
    and exact integers (integer, uint64), plus the 4400-digit integers, raw and exact."""
    raws, exacts = [], []
    for case in corpus['cases']:
        if case.get('date_time_profile'):
            continue
        if case.get('op') in CORPUS_RAW_OPS and type(case.get('raw')) is str:
            raws.append(case['raw'])
        elif case.get('op') == 'json_number' and type(case.get('token')) is str:
            raws.append(case['token'])
        elif case.get('op') in ('integer', 'uint64'):
            value = typed_value(case.get('value'))
            if type(value) is int:
                exacts.append(value)
    raws += ['9' * 4400, '-' + '9' * 4400]
    exacts.append(loads_current_json('9' * 4400))
    unique_raws = list(dict.fromkeys(raws))
    unique_exacts = []
    for value in exacts:
        if not any(value == seen for seen in unique_exacts):
            unique_exacts.append(value)
    return unique_raws, unique_exacts


def corpus_expectation(value, minimum, maximum, case_for_projection):
    """Composed from the shared helpers only: the slot's current_integer, then the producer projection's
    qualification (with the lane's type-sensitive slots)."""
    try:
        current_integer(value, minimum=minimum, maximum=maximum)
    except Refusal:
        return 'slot'
    if case_for_projection is not None:
        try:
            producer_semantic_digest(producer_projection(case_for_projection), type_sensitive_paths=TYPE_SENSITIVE_PATHS)
        except Refusal:
            return 'producer'
    return 'accepted'


def corpus_checks(fixture_cases, check):
    """The shared number corpus through the complete checker: each raw spelling written as JSON text at the
    exported item_count slot and parsed by the lane's raw ingress, then the complete append route and the
    digest/retry route; each exact integer at item_count, at the bounded retries_used slot (retry route), at
    an envelope Storage sequence_id (append route) and at a retained original's sequence_id (history route)."""
    corpus = read_json('Plans/event_number_recipe_corpus.json')
    raws, exacts = corpus_values(corpus)
    meta = next(m for m in fixture_cases if m['event_type'] == 'debug.investigation.exported')
    base = candidate(meta)
    marker = '"item_count": 0'
    text = json.dumps(base)
    if text.count(marker) != 1:
        raise RuntimeError('corpus: exported base must hold item_count 0 exactly once')
    tallies = {'raw_inputs': 0, 'exact_inputs': 0, 'route_runs': 0, 'parse_refused': 0, 'slot_refused': 0,
               'producer_refused': 0, 'accepted': 0, 'disagreements': 0}
    item_bounds = production.published_bounds()['item_count']
    retry_bounds = production.published_bounds()['retries_used']

    def append_route(probe, label):
        expected = corpus_expectation(member(probe, ('payload', 'item_count')), *item_bounds, probe)
        want = {'slot': ('shared', 'shared.item_count', 'number_domain'),
                'producer': ('shared', 'shared.producer', 'producer_unqualified'), 'accepted': (None, None, None)}[expected]
        got = candidate_result(probe)
        got = (got[0], row_label(got[1]) if got[1] else None, got[2])
        digest = semantic_digest(probe)
        tallies['route_runs'] += 2
        tallies[{'slot': 'slot_refused', 'producer': 'producer_refused', 'accepted': 'accepted'}[expected]] += 1
        # The digest recipe qualifies the projection alone (CV-1100); slot bounds are the append route's.
        try:
            producer_semantic_digest(producer_projection(probe), type_sensitive_paths=TYPE_SENSITIVE_PATHS)
            qualifies = True
        except Refusal:
            qualifies = False
        ok = got == want and (digest is not None) == qualifies
        if ok and expected == 'accepted':
            # A retry of the same record keeps the original receipt; a changed count conflicts.
            ok = semantic_digest(copy.deepcopy(probe)) == digest
            if member(probe, ('payload', 'item_count')) != 0:
                ok = ok and semantic_digest(base) != digest
        if not ok:
            tallies['disagreements'] += 1
        check(ok, 'shared corpus through the complete checker: ' + label)

    for raw in raws:
        tallies['raw_inputs'] += 1
        try:
            probe = loads_current_json(text.replace(marker, '"item_count": ' + raw))
        except Refusal:
            tallies['parse_refused'] += 1
            continue
        append_route(probe, 'raw ' + raw[:24])
    for value in exacts:
        tallies['exact_inputs'] += 1
        label = 'exact ' + (hex(value) if abs(value) > 10 ** 30 else str(value))
        append_route(production.patched(base, ('payload', 'item_count'), value), label + ' at item_count')
        request = {'retries_used': value, 'authorized': True}
        try:
            current_integer(value, minimum=retry_bounds[0], maximum=retry_bounds[1])
            want_retry = 'retry_ceiling' if value >= constants.RETRY_CEILING else None
        except Refusal:
            want_retry = 'number_domain'
        tallies['route_runs'] += 1
        okay = cleanup_retry_refusal(value, True) == want_retry
        tallies['disagreements'] += not okay
        check(okay, 'shared corpus through the retry route: ' + label)
        try:
            storage_uint64(value)
            want_storage = None
        except Refusal:
            want_storage = 'number_domain'
        stored = production.patched(base, ('envelope', 'sequence_id'), value)
        got = candidate_refusal(stored)
        tallies['route_runs'] += 1
        okay = got == want_storage
        tallies['disagreements'] += not okay
        check(okay, 'shared corpus at a Storage sequence_id (append route): ' + label)
        controls, _ = retained_probes(base)
        historical = controls[0][1]
        original = copy.deepcopy(historical['original'])
        original['case']['envelope']['sequence_id'] = value
        offered = copy.deepcopy(historical['case'])
        offered['envelope']['sequence_id'] = value
        got = retained_refusal(offered, original)
        tallies['route_runs'] += 1
        okay = got == (None if want_storage is None else 'invalid_history_metadata')
        tallies['disagreements'] += not okay
        check(okay, 'shared corpus at a retained original sequence_id (history route): ' + label)
    return tallies


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
    schema = read_json('Plans/debug_investigation_event_payloads.schema.json')
    fixture = read_json('Plans/debug_investigation_event_fixtures.json')
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
    registry = read_json('Plans/event_family_registry.json')
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
            check(same_on_projection(probe), event + ': every phase gives the same result on its projected input ' + transition['case'])
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
                # Each retry negative is refused by exactly one of the two retry phases (shared rules, request).
                results = [(name, *production.run_phase(factory, value)) for name, factory, value in (
                    ('shared', production.shared.shared_case, views.retry_shared_view(request)),
                    ('retry_request', production.retry.retry_request_case, request))]
                refusing = [result for result in results if result[1]]
                check(len(refusing) == 1, event + ': exactly one retry phase refuses ' + label)
                check(views.retry_result(request)[1:] == refusing[0][1:] if refusing else False,
                      event + ': the complete retry path reports that phase ' + label)
                check(row_label(refusing[0][1]) == row if refusing else False, event + ': initiation row ' + label)
                check(refusing[0][2] == code if refusing else False, event + ': initiation ' + label)
                # The published schema refuses every request-schema and retries_used defect except a binary64
                # integral value, which a stock integer type accepts and current_integer refuses.
                published_refuses = row.startswith('cleanup_retry_request#') or (
                    row == 'shared.retries_used' and not integral_float(request.get('retries_used')))
                check(request_validator.is_valid(request) == (not published_refuses),
                      event + ': published retry schema agrees ' + label)
            retry_negatives, retry_unrenderable = views.retry_shared_probes(controls[0][1])
            for label, request, row, code in retry_negatives + retry_unrenderable:
                result = views.retry_result(request)
                check(result[0] == 'shared' and row_label(result[1]) == row and result[2] == code,
                      event + ': shared-rule retry probe ' + label)
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
        # SP-1100 (sweep part 2B): bodies inline under EVENT_VALUE bytes, including former JSON-escaped
        # oversized negatives, are accepted by the complete checker.
        for row in meta.get('encoding_cases', []):
            probe = patched_case(case, row['patches'])
            check(validator.is_valid(probe['payload']), event + ': encoding case is schema-valid ' + row['case'])
            check(candidate_result(probe) == (None, None, None) and row['expected_refusal'] is None,
                  event + ': encoding case accepted ' + row['case'])
            check(same_on_projection(probe), event + ': encoding case projection ' + row['case'])
            checks += 1
        # CV-1101 / CV-1100 / SP-1100 shared-rule probes: controls accept; each negative is refused by the
        # shared-rule row it names alone; an unrenderable value is refused there first.
        shared_controls, shared_negatives, shared_unrenderable = views.shared_probes(case)
        for label, probe in shared_controls:
            check(candidate_result(probe) == (None, None, None), event + ': shared-rule control ' + label)
            check(same_on_projection(probe), event + ': shared-rule control projection ' + label)
            checks += 1
        for label, probe, row, code in shared_negatives:
            ok, results = single_refusal(probe, row, code)
            check(ok, event + ': shared-rule negative refused by its row alone ' + label)
            check(all(views.run_named(name, factory, production.projected(name, probe)) == result[1:]
                      for (name, factory), result in zip(production.phases(probe), results)),
                  event + ': shared-rule negative projection ' + label)
            checks += 1
        for label, probe, row, code in shared_unrenderable:
            result = candidate_result(probe)
            check(result[0] == 'shared' and row_label(result[1]) == row and result[2] == code,
                  event + ': shared-rule refuses before any later table ' + label)
            checks += 1
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
            check(all(views.run_named(name, factory, production.projected(name, bad)) == result[1:]
                      for (name, factory), result in zip(production.phases(bad), results)),
                  event + ': every phase gives the same row on its projected input ' + negative['case'])
            # The complete path is the phases in order; its refusal is the first refusing phase.
            reason = refusing[0][2] if refusing else None
            check(reason == negative['expected_refusal'], event + ': ' + negative['case'])
            appends = int(reason is None)
            check(appends == negative['expected_appends'] == 0, event + ': zero-append ' + negative['case'])
            check(len(refusing) == 1, event + ': exactly one phase refuses ' + negative['case'])
            check(bool(refusing) and row_label(refusing[0][1]) == negative.get('guard'),
                  event + ': named row refuses ' + negative['case'])
            # The published payload schema refuses what the payload phases refuse, and a payload integer-slot
            # defect the shared-rule rows refuse, except a binary64 integral value (a stock integer type
            # accepts it; current_integer refuses it).
            slot_path = production.PAYLOAD_SLOT_ROWS.get(row_label(refusing[0][1])) if refusing else None
            published_refuses = bool(refusing) and (refusing[0][0] in ('payload', 'payload_values') or (
                slot_path is not None and not integral_float(member(bad['payload'], slot_path))))
            check(validator.is_valid(bad['payload']) == (not published_refuses),
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
        check(digest_fields_are_producer_projection(), event + ': digest fields are the CV-317 producer projection')
        base_digest = semantic_digest(case)
        check(type(base_digest) is str and len(base_digest) == 64, event + ': semantic digest qualifies (CV-1100)')
        check(semantic_digest(changed_case) != base_digest, event + ': semantic digest conflict')
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
    corpus = corpus_checks(fixture['cases'], check) if only is None else None
    expected = 9 if only is None else 1
    check(len(rows) == expected and len({r['event_type'] for r in rows}) == expected, 'nine distinct prepared families')
    check(sum(r['outcome'] == 'prepared_without_admission' for r in rows) == expected, 'nine prepared families')
    check(bool(fixture.get('native_obligations')), 'shared native obligations retained, NOT_RUN')
    scope = 'Static payload/identity/refusal oracles only; native NOT_RUN.' + ('' if only is None else ' Family ' + only + ' only.')
    print(json.dumps({'status':'FAIL' if failures else 'PASS','rows':rows,'failures':failures,'shared_corpus':corpus,'scope':scope},indent=2))
    return bool(failures)

if __name__ == '__main__':
    raise SystemExit(main())
