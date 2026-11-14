"""Lane DS sweep part 2B witnesses: CV-1101 date-time, the cross-resource CV-1100 class fix, SP-1101 dispatch.

Negatives start from a named valid parent (the part 2A parents in scripts/pm_ds_p2a_cases.py), change one fact
and run the complete checker entry point; ``check`` requires each to be the first refusal of its checker call at
exactly its target row. A date-time negative also names the shared CV-1101 refusal reason, which must be the
cause of a validation error of the very validator that row reads (the shared predicate, not a pattern, refuses).
Positives run the complete checker and require acceptance; several are the part 2A timestamp witnesses whose
spellings CV-1101 makes owner-valid (recorded fixture-expectation changes). ``witness_seals`` lists the
originals the part 2B SP-1101 witnesses need sealed in Storage's custody stand-in
(Plans/ds_original_custody.json, written by scripts/pm_ds_retained.py --write-custody); negatives that must
stay unsealed are never in it.

usage: python3 scripts/pm_ds_p2b_cases.py --check
"""
from __future__ import annotations

import argparse
import copy
import json
import sys
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_ds_tables as T  # noqa: E402
import pm_ds_p2a_cases as p2a  # noqa: E402
import pm_ds_retained as retained  # noqa: E402
import pm_contract_formats as formats  # noqa: E402
import pm_event_payload_route as route  # noqa: E402
import pm_event_authority_ds_round2 as ds  # noqa: E402
import pm_event_authority_ds_round3 as d3  # noqa: E402
import pm_browser_workspace_created as created  # noqa: E402
import pm_browser_workspace_created_v2 as v2  # noqa: E402
import pm_browser_workspace_reset as reset  # noqa: E402
from pm_event_numbers import Refusal  # noqa: E402

NEGATIVES = []   # (id, phase, row, call, cause) with cause None or (probe, shared reason)
POSITIVES = []   # (id, call, note): call returns True exactly when the complete checker accepts
LEAP = '2016-12-31T23:59:60Z'
GATE_PRODUCER = 'BrowserRuntimeService.workspace'


def negative(phase, row, ident, cause=None):
    def register(fn):
        NEGATIVES.append((ident, phase, row, fn, cause))
        return fn
    return register


def positive(ident, note):
    def register(fn):
        POSITIVES.append((ident, fn, note))
        return fn
    return register


def reasons(errors):
    """Every shared Refusal reason that causes one of these validation errors (nested contexts included)."""
    out, work = set(), list(errors)
    while work:
        error = work.pop()
        if isinstance(error.cause, Refusal):
            out.add(error.cause.reason)
        work.extend(error.context or ())
    return out


def envelope_probe(event):
    return reasons(route.validator(json.loads((ROOT / retained.ENVELOPES[event['schema_version']]).read_text())).iter_errors(event))


# ------------------------------------------------------------------ parents
def admission():
    return p2a.admission()


def created_event():
    return p2a.created_base()['event']                      # browser.workspace.created, EventRecord 3.0.0


def closed_event():
    gate, _, cases, _ = admission()
    return gate.fixture_event(cases['browser.workspace.closed'], 7)   # EventRecord 2.0.0 (inventoried root)


def candidate(event):
    gate, context, _, rows = admission()
    return gate.candidate_failures(event, rows[event['event_type']]['producer_component'], context)


def accepted_candidate(event):
    return candidate(event) == []


# ------------------------------------------------------------------ CV-253 storage_utc_z at the Storage fields (current EventRecords)
for _ident, _parent, _field, _value, _reason in (
        ('storage-observed-plus-zero-v3', created_event, 'observed_at_utc', '2026-09-10T00:00:01+00:00', 'date_time_utc_z'),
        ('storage-persisted-lowercase-z-v3', created_event, 'persisted_at_utc', '2026-09-10T00:00:02z', 'date_time_utc_z'),
        ('storage-observed-minus-zero-v2', closed_event, 'observed_at_utc', '2026-09-10T00:00:01-00:00', 'date_time_utc_z'),
        ('storage-persisted-offset-v2', closed_event, 'persisted_at_utc', '2026-09-10T01:00:02+01:00', 'date_time_utc_z'),
        ('occurred-hour-24-v3', created_event, 'occurred_at_utc', '2026-09-10T24:00:00Z', 'date_time_hour'),
        ('occurred-trailing-lf-v2', closed_event, 'occurred_at_utc', '2026-09-10T00:00:00Z\n', 'date_time_syntax'),
        ('occurred-illegitimate-leap-v2', closed_event, 'occurred_at_utc', '2026-09-10T00:00:60Z', 'date_time_leap_second')):
    def _make(parent=_parent, field=_field, value=_value):
        event = parent()
        event[field] = value
        return event
    negative('gate_candidate_envelope', 'GC04_envelope_schema', 'dt/' + _ident,
             cause=(lambda make=_make: envelope_probe(make()), _reason))(lambda make=_make: candidate(make()))


for _ident, _parent, _changes, _note in (
        ('occurred-lowercase-offset-fraction-v3', created_event, {'occurred_at_utc': '2026-09-09t19:00:00.123456789012-05:00'},
         'CV-1101 event_record profile: lowercase t, an offset and a 12-digit fraction are owner-valid at occurred_at_utc'),
        ('occurred-leap-second-v2', closed_event, {'occurred_at_utc': LEAP}, 'a legitimate leap second is owner-valid'),
        ('storage-long-fraction-v2', closed_event, {'observed_at_utc': '2026-09-10T00:00:01.123456789012Z'},
         'storage_utc_z limits no fraction digits'),
        ('storage-leap-second-v3', created_event, {'persisted_at_utc': '2016-12-31T23:59:60.5Z'},
         'storage_utc_z keeps legitimate UTC leap seconds')):
    positive('dt/' + _ident, _note)(lambda parent=_parent, changes=_changes: accepted_candidate({**parent(), **changes}))


@negative('comp_event_entry', 'CE02_envelope_schema', 'dt/compaction-observed-plus-zero', cause=(
    lambda: envelope_probe({**p2a.compaction_event(), 'observed_at_utc': '2026-11-04T00:00:00+00:00'}), 'date_time_utc_z'))
def _():
    event = p2a.compaction_event()
    event['observed_at_utc'] = '2026-11-04T00:00:00+00:00'
    return ds.compaction_event_errors(event)


def layout_storage_event():
    slot, event = p2a.layout_parts()
    event['persisted_at_utc'] = event['persisted_at_utc'].replace('Z', 'z')
    return slot, event


@negative('layout_envelope', 'LE04_envelope_schema', 'dt/layout-persisted-lowercase-z',
          cause=(lambda: envelope_probe(layout_storage_event()[1]), 'date_time_utc_z'))
def _():
    slot, event = layout_storage_event()
    return ds.layout_event_errors(event, binding=slot['binding'])


# ------------------------------------------------------------------ CV-1101 at the checkpoint and cleanup times
def v1_checkpoint(**changes):
    cp, _ = p2a.created_checkpoint()
    cp.update(changes)
    return cp


def v1_probe(cp):
    return reasons(created.Draft202012Validator(created.checkpoint_bundle(ROOT), format_checker=formats.FormatChecker()).iter_errors(cp))


@negative('cr_checkpoint_entry', 'CC01_schema', 'dt/v1-updated-hour-24',
          cause=(lambda: v1_probe(v1_checkpoint(updated_at_utc='2026-09-11T24:00:00Z')), 'date_time_hour'))
def _():
    return created.checkpoint_failures(v1_checkpoint(updated_at_utc='2026-09-11T24:00:00Z'))


for _ident, _changes, _note in (
        ('v1-updated-leap', {'updated_at_utc': LEAP}, 'was CC03_updated_calendar (part 2A); a legitimate leap second is owner-valid'),
        ('v1-withdrawn-lowercase-z', {'state': 'withdrawn', 'withdrawn_at_utc': 'lowercase'},
         'was CC04_withdrawn_grammar (part 2A); lowercase z is owner-valid under the event_record profile'),
        ('v1-withdrawn-leap', {'state': 'withdrawn', 'withdrawn_at_utc': LEAP, 'updated_at_utc': LEAP},
         'was CC05_withdrawn_calendar (part 2A)')):
    def _v1(changes=_changes):
        cp = v1_checkpoint(**changes)
        if cp['withdrawn_at_utc'] == 'lowercase':
            cp['withdrawn_at_utc'] = cp['updated_at_utc'].replace('Z', 'z')
        return created.checkpoint_failures(cp) == []
    positive('dt/' + _ident, _note)(_v1)


def v2_core(**changes):
    checkpoint, _, _, _ = p2a.v2_values()
    core = {k: copy.deepcopy(v) for k, v in checkpoint.items() if k != 'retired_generations'}
    core.update(changes)
    return core


for _row, _field, _changes, _reason in (
        ('V2R06_updated_datetime', 'updated_at_utc', {'updated_at_utc': '2026-09-11T20:00:00.Z'}, 'date_time_syntax'),
        ('V2R07_withdrawn_datetime', 'withdrawn_at_utc', {'state': 'withdrawn', 'withdrawn_at_utc': '2026-09-11T20:00:00'}, 'date_time_syntax'),
        ('V2R08_published_datetime', 'published_at_utc', {'published_at_utc': '2026-02-30T20:00:00Z'}, 'date_time_day')):
    negative('v2_core_times', _row, 'dt/v2-' + _field, cause=(
        lambda c=_changes, f=_field: {formats.date_time_refusal(v2_core(**c)[f])}, _reason))(
        lambda c=_changes: v2.core_relation_failures(v2_core(**c)))


def v2_initial_ok(mutate):
    """The complete v2 checkpoint checker accepts the fixture checkpoint with one timestamp change."""
    checkpoint, _, _, _ = p2a.v2_values()
    mutate(checkpoint)
    return v2.checkpoint_failures(checkpoint) == []


positive('dt/v2-withdrawn-lowercase-z', 'was V2R07_withdrawn_grammar (part 2A); the complete v2 checkpoint checker')(
    lambda: v2_initial_ok(lambda c: c.update(state='withdrawn', withdrawn_at_utc=c['updated_at_utc'].replace('Z', 'z'))))
positive('dt/v2-withdrawn-leap', 'was V2R10_withdrawn_calendar (part 2A)')(
    lambda: v2_initial_ok(lambda c: c.update(state='withdrawn', withdrawn_at_utc=LEAP, updated_at_utc=LEAP, published_at_utc=LEAP)))
positive('dt/v2-published-leap', 'was V2R11_published_calendar (part 2A)')(
    lambda: v2_initial_ok(lambda c: c.update(published_at_utc=LEAP, updated_at_utc=LEAP)))


def reset_checkpoint(**changes):
    _, c, _, _ = reset.fixture_values()
    c.update(changes)
    return c


@negative('rs_checkpoint_schema', 'RK01_checkpoint_schema', 'dt/reset-updated-trailing-lf', cause=(
    lambda: reasons(reset.validators(ROOT)['checkpoint'].iter_errors(reset_checkpoint(updated_at_utc='2026-09-11T20:00:00Z\n'))),
    'date_time_syntax'))
def _():
    return reset.checkpoint_failures(reset_checkpoint(updated_at_utc='2026-09-11T20:00:00Z\n'))


for _ident, _changes, _note in (
        ('reset-withdrawn-lowercase-z', {'state': 'withdrawn'}, 'was RC07_withdrawn_grammar (part 2A)'),
        ('reset-updated-leap', {'updated_at_utc': LEAP, 'published_at_utc': LEAP}, 'was RC09_updated_calendar (part 2A)'),
        ('reset-withdrawn-leap', {'state': 'withdrawn', 'withdrawn_at_utc': LEAP, 'updated_at_utc': LEAP, 'published_at_utc': LEAP},
         'was RC10_withdrawn_calendar (part 2A)'),
        ('reset-published-leap', {'published_at_utc': LEAP, 'updated_at_utc': LEAP}, 'was RC11_published_calendar (part 2A)')):
    def _reset(changes=_changes):
        c = reset_checkpoint(**changes)
        if c['state'] == 'withdrawn' and 'withdrawn_at_utc' not in changes:
            c['withdrawn_at_utc'] = c['updated_at_utc'].replace('Z', 'z')
        return reset.checkpoint_failures(c) == []
    positive('dt/' + _ident, _note)(_reset)


@negative('rs_cleanup__2', 'RU11_cleanup_time', 'dt/reset-cleanup-zoneless',
          cause=(lambda: {formats.date_time_refusal('2026-09-19T00:00:00')}, 'date_time_syntax'))
def _():
    return p2a.reset_cleanup(at='2026-09-19T00:00:00')


positive('dt/reset-cleanup-offset', 'an offset cleanup time is owner-valid and compares on the exact instant')(
    lambda: p2a.reset_cleanup(at='2026-09-18T20:00:00-04:00') == 'eligible_retired_generation_removed')
positive('dt/compaction-committed-leap', 'was CP02_commit_time_valid (part 2A): a legitimate leap second passes storage_utc_z and the owner pattern')(
    lambda: ds.compaction_payload_errors({**p2a.compaction_event()['payload'], 'committed_at_utc': LEAP}) == [])


@negative('comp_payload_schema', 'CP01_payload_schema', 'dt/compaction-committed-lowercase-z', cause=(
    lambda: reasons(route.validator(ds.load('Plans/event_payload_context_compaction_completed.schema.json'), profile=formats.STORAGE_UTC_Z)
                    .iter_errors({**p2a.compaction_event()['payload'], 'committed_at_utc': '2026-11-04T00:00:00z'})), 'date_time_utc_z'))
def _():
    return ds.compaction_payload_errors({**p2a.compaction_event()['payload'], 'committed_at_utc': '2026-11-04T00:00:00z'})


# ------------------------------------------------------------------ CV-1100 across resources (validator class keeps itself)
for _ident, _path in (('home4-prior-layout-revision-float', ('prior_layout', 'revision')),
                      ('home4-payload-new-layout-revision-float', ('event_semantics', 'payload', 'new_layout_revision'))):
    def _float(path=_path):
        slot = p2a.home_value('home4_readback_verified_slot')
        node = slot
        for key in path[:-1]:
            node = node[key]
        node[path[-1]] = float(node[path[-1]])
        return p2a.home_check('transaction_slot', slot)
    negative('h4_schema', 'H4S01_transaction_slot', 'num/' + _ident)(_float)


# ------------------------------------------------------------------ SP-1101: retained originals (sealed custody + RetainedDispatcher)
def created_history(event, source=None):
    body, _ = route.resolved_body(event, historical=True)
    subject = {k: body['context'][k] for k in created.SUBJECT}
    return created.workspace_history_fact(event, subject, source_verified=True, access_allowed=True, deletion_allows_audit=True,
                                          checkpoint_read_token_valid=True, historical_source=source)


def history_ok(event, source=None):
    return created_history(event, source)['outcome'] == 'historical_creation_fact'


def retained_created(ident, version='3.0.0', **changes):
    event = created_event()
    event.update(event_id='event-ds-p2b-' + ident, schema_version=version, **changes)
    return event


def retained_float(ident):
    event = retained_created(ident, '2.0.0')
    event['payload']['facts']['workspace_generation'] = float(event['payload']['facts']['workspace_generation'])
    return event


def retained_storage_offset(ident):
    return retained_created(ident, '2.0.0', observed_at_utc='2026-09-10T00:00:01+00:00')


def retained_broad_times(ident):
    return retained_created(ident, '2.0.0', occurred_at_utc='2026-09-09t19:00:00.123456789012-05:00')


def compaction_retained():
    return p2a.compaction_event()


def layout_retained(ident, recipe_payload):
    """A retained layout original with one integral float revision (the event id stays the one its operation
    digest forms, I5): the stock-domain original floats prior_layout_revision, the typed one new_layout_revision."""
    slot, event = p2a.layout_parts()
    field = {'layout-float-stock': 'prior_layout_revision', 'layout-float-typed': 'new_layout_revision'}[ident]
    event['payload'][field] = float(event['payload'][field])
    return slot, event, recipe_payload


def case_l_original():
    base = created_event()
    base['schema_version'] = '2.0.0'
    value, original = d3.normalized({'event': base})
    value['replay_policy'] = 'projector_replay_only'
    return value, original


def witness_seals():
    """(event, legacy source or None, (edition, envelope, payload profile, source profile)) for every original the
    part 2B witnesses need sealed. Deterministic; the unsealed negatives are never listed."""
    E = retained.EDITION
    seals = [
        (retained_float('retained-float-stock'), None, (E, '2.0.0', 'original-json-schema', retained.NO_SOURCE)),
        (retained_float('retained-float-typed'), None, (E, '2.0.0', 'typed-integer', retained.NO_SOURCE)),
        (retained_storage_offset('retained-storage-offset'), None, (E, '2.0.0', 'original-json-schema', retained.NO_SOURCE)),
        (retained_broad_times('retained-broad-times'), None, (E, '2.0.0', 'original-json-schema', retained.NO_SOURCE)),
        (retained_created('recipe-v0'), None, ('ds-retained.v0', '3.0.0', 'original-json-schema', retained.NO_SOURCE)),
        (retained_created('wrong-edition'), None, (E, '2.0.0', 'original-json-schema', retained.NO_SOURCE)),
        (retained_created('sealed-base'), None, (E, '3.0.0', 'original-json-schema', retained.NO_SOURCE)),
    ]
    for ident, payload in (('layout-float-stock', 'original-json-schema'), ('layout-float-typed', 'typed-integer')):
        _, event, profile = layout_retained(ident, payload)
        seals.append((event, None, (E, '3.0.0', profile, retained.NO_SOURCE)))
    value, original = case_l_original()
    seals.append((value, original, (E, '2.0.0', 'original-json-schema', retained.CASE_L)))
    return seals


positive('sp1101/retained-stock-integer-read', 'a 2.0.0 original sealed under the original JSON Schema integer domain reads with its integral float')(
    lambda: history_ok(retained_float('retained-float-stock')))
positive('sp1101/retained-broad-times-read', 'owner-valid lowercase/offset/long-fraction source time reads under the frozen CV-1101 profile, spelling kept')(
    lambda: history_ok(retained_broad_times('retained-broad-times')))
positive('sp1101/case-l-sealed-source-read', 'a Case-L original reads with the legacy source sealed beside it')(
    lambda: (lambda v, o: not admission()[0].candidate_failures(v, GATE_PRODUCER, admission()[1], historical=True, historical_source=o))(*case_l_original()))
positive('sp1101/layout-stock-read', 'a layout original sealed under original-json-schema reads its integral float revision')(
    lambda: (lambda slot, event, payload: not ds.layout_event_errors(event, binding=slot['binding'], historical=True,
                                                                     **ds.layout_history_observation(event, 'workspace-layout-v2/original-json-schema')))(
        *layout_retained('layout-float-stock', 'original-json-schema')))


@negative('gate_candidate_joins', 'GC06_payload_schema', 'sp1101/retained-typed-integer-refuses-float')
def _():
    return created_history(retained_float('retained-float-typed'))   # the record cannot select the older domain


@negative('gate_candidate_envelope', 'GC04_envelope_schema', 'sp1101/retained-storage-offset', cause=(
    lambda: envelope_probe(retained_storage_offset('retained-storage-offset')), 'date_time_utc_z'))
def _():
    return created_history(retained_storage_offset('retained-storage-offset'))


@negative('ds_retained_custody', 'OX01_original_sealed', 'sp1101/created-unsealed')
def _():
    return created_history(retained_created('never-sealed'))


@negative('ds_retained_custody', 'OX02_original_binding', 'sp1101/created-binding-incomplete')
def _():
    return created_history(retained_created('sealed-base', correlation_id=''))


@negative('ds_retained_custody', 'OX03_original_authentic', 'sp1101/created-coherent-forgery')
def _():
    return created_history(retained_created('sealed-base', actor_ref='actor:forged'))


@negative('ds_retained_custody', 'OX04_recipe_installed', 'sp1101/created-recipe-not-installed')
def _():
    return created_history(retained_created('recipe-v0'))


@negative('ds_retained_custody', 'OX05_original_verified', 'sp1101/created-wrong-edition-selection')
def _():
    return created_history(retained_created('wrong-edition'))


@negative('ds_retained_custody', 'OX01_original_sealed', 'sp1101/reset-unsealed')
def _():
    event = p2a.reset_base()['event']
    event['event_id'] = 'event-ds-p2b-reset-never-sealed'
    body, _ = route.resolved_body(event, historical=True)
    subject = {k: body['context'][k] for k in reset.SUBJECT}
    return reset.workspace_history_fact(event, subject, admitted=True, source_verified=True, access_allowed=True,
                                        deletion_allows_audit=True, checkpoint_read_token_valid=True)


@negative('ds_retained_custody', 'OX01_original_sealed', 'sp1101/replay-unsealed')
def _():
    gate, context, _, _ = admission()
    event = retained_created('replay-never-sealed', '2.0.0')
    return gate.ReplayOracle().consume(event, GATE_PRODUCER, context)


@negative('ds_retained_custody', 'OX03_original_authentic', 'sp1101/case-l-source-not-sealed')
def _():
    value, original = case_l_original()
    original['source']['segment_name'] = 'segment-00000000000000000009.seg'
    gate, context, _, _ = admission()
    return gate.candidate_failures(value, GATE_PRODUCER, context, historical=True, historical_source=original)


@negative('ds_retained_custody', 'OX01_original_sealed', 'sp1101/compaction-unsealed')
def _():
    event = compaction_retained()
    event['event_id'] = 'evt_compaction_ds_p2b_never_sealed'
    return ds.compaction_history(event, verified=True, withdrawn=False, deleted=False, live_revision=1)


@negative('ds_retained_custody', 'OX01_original_sealed', 'sp1101/layout-unsealed')
def _():
    slot, event = p2a.layout_parts()
    event['event_id'] = 'event-ds-p2b-layout-never-sealed'
    return ds.layout_event_errors(event, binding=slot['binding'], historical=True, **ds.layout_history_observation(event))


@negative('layout_payload', 'LE07_payload_schema', 'sp1101/layout-named-recipe-selects-nothing')
def _():
    slot, event, _ = layout_retained('layout-float-typed', 'typed-integer')
    # the reader names the older domain; the sealed typed-integer recipe decides
    return ds.layout_event_errors(event, binding=slot['binding'], historical=True,
                                  **ds.layout_history_observation(event, 'workspace-layout-v2/original-json-schema'))


# ------------------------------------------------------------------ check
def cases():
    """(id, zero-argument call) for every part 2B witness, negatives then positives (guard collection sources)."""
    return [(ident, fn) for ident, _, _, fn, _ in NEGATIVES] + [(ident, fn) for ident, fn, _ in POSITIVES]


def check(only=None):
    rows = []
    for ident, phase, row, fn, cause in NEGATIVES:
        if only and only not in ident:
            continue
        T.RECORDER = []
        result = {'id': ident, 'kind': 'negative', 'phase': phase, 'row': row}
        try:
            fn()
        except Exception as exc:  # a witness that raises proves nothing
            result['exception'] = repr(exc)[:300]
        records, T.RECORDER = T.RECORDER, None
        first, target = set(), []
        for p, _, refusing, call in records:
            if refusing and call not in first:
                first.add(call)
                if p == phase or p.startswith(phase + '__'):
                    target.append(refusing)
        result['target_observations'] = target[:4]
        ok = 'exception' not in result and [row] in target
        if cause is not None:
            probe, reason = cause
            try:
                found = sorted(probe())
            except Exception as exc:  # noqa: BLE001
                found = ['exception: ' + repr(exc)[:120]]
            result['shared_reasons'] = found
            result['expected_reason'] = reason
            ok = ok and reason in found
        result['ok'] = ok
        rows.append(result)
    for ident, fn, note in POSITIVES:
        if only and only not in ident:
            continue
        result = {'id': ident, 'kind': 'positive', 'note': note}
        try:
            result['ok'] = fn() is True
        except Exception as exc:  # noqa: BLE001
            result['ok'], result['exception'] = False, repr(exc)[:300]
        rows.append(result)
    negatives = [r for r in rows if r['kind'] == 'negative']
    return {'schema_id': 'pm.ds.p2b_witness_check.v1', 'status': 'pass' if all(r['ok'] for r in rows) else 'fail',
            'witnesses': len(rows), 'negatives': len(negatives), 'positives': len(rows) - len(negatives),
            'passing': sum(r['ok'] for r in rows), 'custody': retained.check_custody(), 'cases': rows}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', required=True)
    parser.add_argument('--only')
    args = parser.parse_args()
    result = check(args.only)
    print(json.dumps(result, indent=1))
    return 0 if result['status'] == 'pass' and result['custody']['status'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
