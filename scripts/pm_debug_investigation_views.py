"""DDBG production entry points that need the gated shared rules (sweep part 2B).

The shared-rule and retained-history phases judge views: each view member is a
shared helper's verdict for one field (pm_event_datetime.date_time with the
field owner's profile, pm_event_numbers.current_integer with the slot's
published bounds, storage_uint64, producer_semantic_digest with the lane's
type-sensitive slots, storage_value_bytes EVENT_VALUE), a recomputed identity
or digest, or a type-exact stand-in, built here before any table runs. The
complete candidate path (candidate_result) runs the shared-rule phase first, so
a value the guard tool cannot render is refused before a later table sees it.

This module is kept out of the guard-isolation adapter's import closure (the
tool's prescan follows every repository import and refuses the shared helpers'
reflection); the adapter reads the views this module writes
(--write-guard-views) to scripts/pm_debug_investigation_guard_views.json,
pinned by the SHA-256 of every input file.
"""
import copy
import hashlib
import json
import sys
from pathlib import Path

from pm_event_numbers import loads_current_json

import pm_debug_investigation_shared_rules as rules
import pm_debug_investigation_transitions as production
from pm_debug_investigation_transitions import (
    BATTERY_FAMILY, EVENT_TIME_ACCEPTED, EVENT_TIME_REFUSED, INSTRUMENTATION_EVENT, INTEGER_SLOTS, NOT_A_TIME,
    STORAGE_TIME_ACCEPTED, STORAGE_TIME_REFUSED, UINT64_ACCEPTED, UINT64_REFUSED, detail_of, family_of,
    float_of, patched, phases, published_bounds, retained, retry, run_phase, shared)

ROOT = Path(__file__).resolve().parents[1]


SHARED_KEYS = ('occurred_at_utc', 'observed_at_utc', 'persisted_at_utc', 'producer_sequence_id', 'sequence_id',
               'item_count', 'artifact_count', 'binding_revision', 'retry_count_before', 'retry_count_after',
               'attempt_number', 'retry_count', 'retries_used', 'producer', 'payload_bytes', 'detail_bytes')


def empty_shared_view():
    return {key: None for key in SHARED_KEYS}


def shared_view(case):
    """The shared-rule phase input for a candidate (sweep part 2B): each member is a shared helper's verdict
    for one field (its refusal reason, or None when it accepts or the field is absent) or a measured size.
    CV-1101: date_time with the EventRecord profile at occurred_at_utc and CV-253's storage_utc_z profile at
    observed_at_utc/persisted_at_utc. CV-1100: current_integer with each schema slot's published bounds, at
    EventRecord producer_sequence_id (minimum 0, nullable) and the producer projection's qualification
    (producer_semantic_bytes, the slots type-sensitive). SP-1100: storage_uint64 at a Storage sequence_id and
    EVENT_VALUE bytes for the SP-337 inline payload and the referenced detail."""
    bounds = published_bounds()
    view = empty_shared_view()
    if type(case) is not dict:
        return view
    envelope = case.get('envelope')
    if type(envelope) is dict:
        for field, profile in rules.TIMESTAMP_PROFILES:
            if field in envelope:
                view[field] = rules.date_time_refusal(envelope[field], profile)
        if envelope.get('producer_sequence_id') is not None:
            view['producer_sequence_id'] = rules.integer_refusal(envelope['producer_sequence_id'],
                                                                 *bounds['producer_sequence_id'])
        if 'sequence_id' in envelope:
            view['sequence_id'] = rules.uint64_refusal(envelope['sequence_id'])
    family = family_of(case)
    detail = detail_of(case) if family == 'instrumentation_state_changed' else None
    places = {'payload': case.get('payload'), 'detail': detail, 'source': case.get('instrumentation_source')}
    for key, _, slot_family, location, members in INTEGER_SLOTS:
        if slot_family is None or slot_family != family:
            continue
        container = places[location]
        for member in members[:-1]:
            container = container.get(member) if type(container) is dict else None
        if type(container) is dict and members[-1] in container:
            view[key] = rules.integer_refusal(container[members[-1]], *bounds[key])
    view['producer'] = rules.producer_refusal(case)
    if 'payload' in case:
        view['payload_bytes'] = rules.event_value_size(case['payload'])
    if detail is not None:
        view['detail_bytes'] = rules.event_value_size(detail)
    return view


def retry_shared_view(request):
    """The shared-rule phase input for a typed cleanup retry request: current_integer at retries_used."""
    view = empty_shared_view()
    if type(request) is dict and 'retries_used' in request:
        view['retries_used'] = rules.integer_refusal(request['retries_used'], *published_bounds()['retries_used'])
    return view



def phase_input(name, case):
    """What a phase's table judges: the shared-rule view for the shared phase, the candidate otherwise."""
    return shared_view(case) if name == 'shared' else case


def run_named(name, factory, case):
    return run_phase(factory, phase_input(name, case))


def phase_results(case):
    """Every phase of the family run on its own: [(phase, row, code)].

    A candidate the shared-rule phase refuses for a value the guard tool cannot
    render (an integer of thousands of digits, a fractional-token carrier) is
    judged by candidate_result only: later tables would raise on it."""
    return [(name, *run_named(name, factory, case)) for name, factory in phases(case)]


def candidate_result(case):
    """The complete candidate append path: the first refusing phase, or (None, None, None)."""
    for name, factory in phases(case):
        row, code = run_named(name, factory, case)
        if row is not None:
            return name, row, code
    return None, None, None


def candidate_refusal(case):
    return candidate_result(case)[2]



def instrumentation_refusal(case):
    """The shared-rule phase (it holds the detail and source integer slots and the detail size), then the
    instrumentation phases."""
    probe = dict(case, event_type=INSTRUMENTATION_EVENT)
    for name, factory in phases(probe):
        if name != 'shared' and not name.startswith('instrumentation'):
            continue
        row, code = run_named(name, factory, probe if name == 'shared' else case)
        if row is not None:
            return code
    return None


def retry_result(request):
    """The typed retry initiation path: the shared-rule phase (retries_used), then the request table."""
    for name, factory, value in (('shared', shared.shared_case, retry_shared_view(request)),
                                 ('retry_request', retry.retry_request_case, request)):
        row, code = run_phase(factory, value)
        if row is not None:
            return name, row, code
    return None, None, None


def cleanup_retry_refusal(retries_used, authorized):
    """Owner's typed initiation decision, before allocating an attempt/body."""
    return retry_result({'retries_used': retries_used, 'authorized': authorized})[2]



def identity_list(case):
    result = rules.identity(case.get('event_type'), case.get('project_id'), case.get('payload'))
    return None if result is None else list(result)


def storage_tokens(case):
    envelope = case.get('envelope') if type(case.get('envelope')) is dict else {}
    return {field: rules.exact_token(envelope[field]) if field in envelope else ['absent']
            for field in ('sequence_id', 'observed_at_utc', 'persisted_at_utc')}


def original_profiles(case):
    """The original's own Storage metadata and source time under each field owner's profile (SP-1101 keeps
    broad EventRecord source times readable; CV-253 holds Storage history to storage_utc_z)."""
    envelope = case.get('envelope') if type(case.get('envelope')) is dict else {}
    result = {field: rules.date_time_refusal(envelope[field], profile) if field in envelope else None
              for field, profile in rules.TIMESTAMP_PROFILES}
    result['sequence_id'] = rules.uint64_refusal(envelope['sequence_id']) if 'sequence_id' in envelope else None
    return result


def retained_view(case, original, withdrawn=False):
    """The retained-history phase input: recomputed identities and digests (shared qualified RFC 8785), the
    original's own metadata verdicts and type-exact Storage stand-ins. No raw record is passed on."""
    frozen = original['case']
    return {'withdrawn': withdrawn, 'original_admission': list(original['original_admission']),
            'recipe_ref': original['recipe_ref'],
            'offered_family': case.get('event_type'), 'original_family': frozen.get('event_type'),
            'offered_identity': identity_list(case), 'original_identity': identity_list(frozen),
            'recorded_identity': frozen.get('expected_identity'),
            'offered_digest': rules.semantic_digest(case), 'original_digest': rules.semantic_digest(frozen),
            'offered_storage': storage_tokens(case), 'original_storage': storage_tokens(frozen),
            'original_profiles': original_profiles(frozen)}


def retained_refusal(case, original, withdrawn=False):
    """Read the original Storage projection, never the current owner transition.

    Source authentication and historical admission/recipe custody are native
    obligations. These vectors compare a selected original with the offered read.
    """
    return run_phase(retained.retained_case, retained_view(case, original, withdrawn))[1]



def shared_probes(case):
    """(controls, negatives, unrenderable) candidates for the shared-rule phase of one family.

    controls and negatives are candidates (negatives as (id, candidate, row, code));
    each negative changes one member of a valid candidate. unrenderable lists
    negatives whose value the guard tool cannot render (a fractional-token carrier
    from the shared parser, an integer of thousands of digits): the shared-rule
    phase refuses them first, and candidate_result is their complete path.
    """
    controls, negatives, unrenderable = [], [], []
    family = family_of(case)
    if case['event_type'] == BATTERY_FAMILY:
        for text in EVENT_TIME_ACCEPTED:
            controls.append(('source time ' + repr(text), patched(case, ('envelope', 'occurred_at_utc'), text)))
        for field in ('observed_at_utc', 'persisted_at_utc'):
            for text in STORAGE_TIME_ACCEPTED + ('2026-11-04T00:00:01Z',):
                controls.append((field + ' ' + repr(text), patched(case, ('envelope', field), text)))
        for number in UINT64_ACCEPTED:
            controls.append(('Storage sequence ' + repr(number), patched(case, ('envelope', 'sequence_id'), number)))
        for number in (None, 0, 2 ** 53):
            controls.append(('producer sequence ' + repr(number), patched(case, ('envelope', 'producer_sequence_id'), number)))
        for text in EVENT_TIME_REFUSED + NOT_A_TIME:
            negatives.append(('source time ' + repr(text), patched(case, ('envelope', 'occurred_at_utc'), text),
                              'shared.occurred_at_utc', 'invalid_timestamp'))
        for field in ('observed_at_utc', 'persisted_at_utc'):
            for text in STORAGE_TIME_REFUSED + NOT_A_TIME[:1]:
                negatives.append((field + ' ' + repr(text), patched(case, ('envelope', field), text),
                                  'shared.' + field, 'invalid_timestamp'))
        for number in UINT64_REFUSED:
            negatives.append(('Storage sequence ' + repr(number), patched(case, ('envelope', 'sequence_id'), number),
                              'shared.sequence_id', 'number_domain'))
        for number in (-1, 1.0, '1', True):
            negatives.append(('producer sequence ' + repr(number), patched(case, ('envelope', 'producer_sequence_id'), number),
                              'shared.producer_sequence_id', 'number_domain'))
        negatives.append(('producer sequence beyond binary64 exactness', patched(case, ('envelope', 'producer_sequence_id'), 2 ** 53 + 1),
                          'shared.producer', 'producer_unqualified'))
    places = {'payload': ('payload',), 'detail': ('detail_records', case['payload'].get('detail_ref')),
              'source': ('instrumentation_source',)}
    for key, _, slot_family, location, members in INTEGER_SLOTS:
        if slot_family != family:
            continue
        path = places[location] + members
        current = case
        for part in path:
            current = current[part]
        row = 'shared.' + {'retry_count_before': 'detail_retry_count_before', 'retry_count_after': 'detail_retry_count_after',
                           'attempt_number': 'detail_attempt_number', 'retry_count': 'source_retry_count'}.get(key, key)
        negatives.append((key + ' as a binary64 integral value', patched(case, path, float_of(current)), row, 'number_domain'))
        unrenderable.append((key + ' as a fractional JSON token', patched(case, path, loads_current_json(str(current) + '.0')),
                             row, 'number_domain'))
        if location == 'payload':
            controls.append((key + ' at 2^53', patched(case, path, 2 ** 53)))
            negatives.append((key + ' beyond binary64 exactness', patched(case, path, 2 ** 53 + 1),
                              'shared.producer', 'producer_unqualified'))
            unrenderable.append((key + ' with 4400 digits', patched(case, path, loads_current_json('9' * 4400)),
                                 'shared.producer', 'producer_unqualified'))
        else:
            unrenderable.append((key + ' with 4400 digits', patched(case, path, loads_current_json('9' * 4400)),
                                 row, 'number_domain'))
    return controls, negatives, unrenderable


def retry_shared_probes(request):
    """(negatives, unrenderable) retry requests for the shared-rule phase: retries_used as a binary64
    integral value, as a fractional JSON token and with 4400 digits."""
    used = request['retries_used']
    negatives = [('retries_used as a binary64 integral value', dict(request, retries_used=float_of(used)),
                  'shared.retries_used', 'number_domain')]
    unrenderable = [('retries_used as a fractional JSON token', dict(request, retries_used=loads_current_json(str(used) + '.0')),
                     'shared.retries_used', 'number_domain'),
                    ('retries_used with 4400 digits', dict(request, retries_used=loads_current_json('9' * 4400)),
                     'shared.retries_used', 'number_domain')]
    return negatives, unrenderable


# ---------------------------------------------------------------------------
# Guard-isolation inputs for the two view-judging phases. The adapter
# (pm_debug_investigation_guard_suites.shared_suite / retained_suite) reads
# them from GUARD_VIEWS and refuses them unless every input file below still
# has the SHA-256 recorded with them.
# ---------------------------------------------------------------------------

GUARD_VIEWS = 'scripts/pm_debug_investigation_guard_views.json'
GUARD_VIEW_INPUTS = (
    'Plans/debug_investigation_event_fixtures.json', 'Plans/debug_investigation_event_payloads.schema.json',
    'Plans/event_record.schema.json', 'scripts/pm_debug_investigation_views.py',
    'scripts/pm_debug_investigation_shared_rules.py', 'scripts/pm_debug_investigation_transitions.py',
    'scripts/pm_debug_investigation_guard_constants.py', 'scripts/pm_debug_investigation_guard_suites.py',
    'scripts/pm_event_numbers.py', 'scripts/pm_event_datetime.py', 'scripts/pm_event_index_binding.py')


def input_hashes():
    return {relative: hashlib.sha256((ROOT / relative).read_bytes()).hexdigest() for relative in GUARD_VIEW_INPUTS}


def guard_views():
    """{'shared_suite': {controls, negatives}, 'retained_suite': [[prefix, controls, negatives]]}: the exact
    views the adapter's two suites judge, every negative naming its row."""
    import pm_debug_investigation_guard_suites as suites
    raw = (ROOT / suites.FIXTURE).read_bytes()
    metas = suites.fixture_cases()
    if loads_current_json(raw)['cases'] != metas:
        raise ValueError('the fixture reads differently under the shared current parser')
    production.load_documents()
    kept, negatives = [], []

    def control_id(view, cid):
        same = next((kid for kid, kvalue in kept if kvalue == view), None)
        if same is None:
            kept.append([cid, view])
            return cid
        return same
    retained_probes = []
    for meta in metas:
        case = production.candidate(meta)
        prefix = suites.short(meta['event_type'])
        for cid, value in suites.family_controls(meta):
            control_id(shared_view(value), cid)
        for nid, value, base, label, defect in suites.family_negatives(meta):
            if label.startswith('shared.'):
                negatives.append([nid, shared_view(value), control_id(shared_view(base), 'base of ' + nid), label, defect])
        controls, probe_negatives, unrenderable = shared_probes(case)
        for cid, value in controls:
            control_id(shared_view(value), prefix + ': ' + cid)
        for nid, value, label, code in probe_negatives + unrenderable:
            negatives.append([prefix + ': ' + nid, shared_view(value), control_id(shared_view(case), prefix + ': base'), label, nid])
        if 'retry_request_cases' in meta:
            requests, request_negatives = production.retry_request_probes(meta['retry_request_cases'])
            for cid, request in requests:
                control_id(retry_shared_view(request), prefix + ': retry ' + cid)
            first = control_id(retry_shared_view(requests[0][1]), prefix + ': retry ' + requests[0][0])
            extra, extra_unrenderable = retry_shared_probes(requests[0][1])
            for nid, request, label, code in request_negatives + extra + extra_unrenderable:
                if label.startswith('shared.'):
                    negatives.append([prefix + ': retry ' + nid, retry_shared_view(request), first, label, nid])
        controls, retained_negatives = production.retained_probes(case)
        retained_probes.append([prefix, [[cid, retained_view(**value)] for cid, value in controls],
                                [[nid, retained_view(**value), label, code] for nid, value, label, code in retained_negatives]])
    return {'shared_suite': {'controls': kept, 'negatives': negatives}, 'retained_suite': retained_probes}


def write_guard_views():
    document = {'about': 'Guard-isolation inputs of the DDBG shared-rule and retained-history phases, written by '
                         'python3 scripts/pm_debug_investigation_views.py --write-guard-views; the adapter refuses '
                         'them unless every input still has the recorded SHA-256.',
                'inputs': input_hashes(), 'views': guard_views()}
    (ROOT / GUARD_VIEWS).write_text(json.dumps(document, indent=1, sort_keys=True) + '\n')


def check_guard_views():
    """True when the committed views equal a fresh build and their recorded input hashes are current."""
    document = json.loads((ROOT / GUARD_VIEWS).read_text())
    return document['inputs'] == input_hashes() and document['views'] == json.loads(json.dumps(guard_views()))


if __name__ == '__main__':
    if sys.argv[1:] == ['--write-guard-views']:
        write_guard_views()
    elif sys.argv[1:] == ['--check-guard-views']:
        current = check_guard_views()
        print(json.dumps({'status': 'PASS' if current else 'FAIL', 'guard_views': GUARD_VIEWS}))
        raise SystemExit(0 if current else 1)
    else:
        raise SystemExit('usage: pm_debug_investigation_views.py --write-guard-views | --check-guard-views')
