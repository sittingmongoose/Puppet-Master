"""DC guard-table suites for the gated shared tool (scripts/pm_guard_isolation.py, gated at 004bdedd63).

Adapter only: no table module imports it, so the tool scans just the phase table under test.
Every witness of the full checker runs once under the checker's observation recorder:
contract probes (scripts/pm_collaboration_events.py:contract_probes, including the schema
shape cases and the sweep part 2A witnesses), fixture positives, transition sequence steps,
the integrity collectors at baseline and every integrity case. An accepted invocation supplies
control observations for every phase it passed. A refused invocation's FIRST refusal gives the
negative: the observation of the phase holding that refusal, targeted at the refusing row. A
witness whose refusal is not tracked, or whose expected result differs, is reported, never
relabelled. Nothing here repairs, caches or decides a checker result.
"""
import copy
import hashlib
import pickle
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_guard_isolation as g  # noqa: E402
import pm_collaboration_events as dc  # noqa: E402

RETURN_SOURCE = 'return g.Case(table, check, context)'
INTEGRITY = ('int_', 'fix_', 'shared_')
# Witnesses kept as refused negatives in the full checker but not used as single-row table proof, with the reason.
EXCLUDED_PATTERNS = [
    (r'source/source_.*:roster', 'two rows by construction: an extra slot in slot_requirements contradicts every copy of the roster '
     '(captured control SF45, record specs SF46, body roster SF47); original_control:participant_slot_ids, r2:semantic_roster '
     'and the p2a roster witnesses prove each row alone'),
]


def key(value):
    return hashlib.sha256(pickle.dumps(value, protocol=5)).hexdigest()


def excluded(pair):
    for pattern, reason in EXCLUDED_PATTERNS:
        if re.fullmatch(pattern, pair):
            return reason
    return None


def run_recorded(action):
    dc.RECORDER = records = []
    try:
        result = action()
    finally:
        dc.RECORDER = None
    return result, records


def family_of(probe):
    et = probe.get('event_type')
    if et is None and isinstance(probe.get('value'), dict):
        et = probe['value'].get('event_type')
    if et is None and probe.get('source_case'):
        et = probe['source_case']['value'].get('event_type')
    if et is None and probe.get('domain') == 'shape':
        definition = probe.get('definition', '')
        et = next((f for f in dc.EVENT_TYPES if definition in (dc.TOKEN[f], dc.TOKEN[f] + '_application', dc.TOKEN[f] + '_project')), None)
    return et if et in dc.EVENT_TYPES else 'shared'


def witnesses(root=dc.ROOT):
    """(pair id, family, expected, action, kind) for every witness; kind is product or integrity."""
    fx = dc.load(dc.FIXTURE_PATH, root)
    siid, epoch = fx['storage_context']['storage_instance_id'], fx['storage_context']['recovery_epoch']
    for probe in dc.contract_probes(root):
        yield (probe['domain'] + '/' + probe['case_id'], family_of(probe), probe['expected'],
               (lambda probe=probe: dc.evaluate_probe(probe, root)), 'product')
    for c in fx['payloads']:
        yield ('fixture/payload/' + c['case_id'], c['event_type'], None, (lambda c=c: dc.payload_rejection(c['event_type'], c['payload'], epoch, root)), 'product')
    for c in fx['valid_events']:
        yield ('fixture/event/' + c['case_id'], c['event_type'], None, (lambda c=c: dc.envelope_rejection(c['event_type'], c['record'], siid, epoch, root)), 'product')
    for c in fx['transition_cases']:
        positive = dict(c, value=c['valid_value'], prestate=c['valid_prestate'])
        yield ('fixture/transition_counterpart/' + c['case_id'], c['event_type'], None, (lambda positive=positive: dc.evaluate_probe(positive, root)), 'product')
    for s in fx['transition_sequences']:
        state = dc.Reducer(s['admitted_event_types'], s['storage_instance_id'], s['recovery_epoch'])
        for i, st in enumerate(s['steps']):
            if st['expected'] in ('appended', 'exact_retry'):
                probe = dict(domain='transition', case_id=s['case_id'] + ':' + str(i), value=st['payload'], expected=None,
                             event_type=st['event_type'], prestate=copy.deepcopy(state.__dict__))
                yield ('fixture/sequence/' + probe['case_id'], st['event_type'], None, (lambda probe=probe: dc.evaluate_probe(probe, root)), 'product')
            state.apply(st['event_type'], st['payload'])
    # Integrity collectors: the baseline gives controls, each integrity case one negative.
    for target in ('payload_schema_failures', 'projection_schema_failures', 'owner_unit_failures', 'ledger_failures', 'registry_membership_failures',
                   'reference_failures', 'physical_binding_failures', 'fixture_report', 'ats_failures', 'probe_failures'):
        yield ('integrity/baseline/' + target, 'shared', [], (lambda target=target: dc.evaluate_integrity(dict(target=target), root)), 'integrity')
    yield ('integrity/baseline/table_order_errors', 'shared', [], (lambda: [e['check'] for e in dc.table_order_errors()]), 'integrity')
    for case in dc.integrity_cases(root):
        yield (case['case_id'], 'shared', [case['expected']], (lambda case=case: dc.evaluate_integrity(case, root)), 'integrity')
    for case in dc.pm_collab_p2a_cases.integrity_controls(dc, root):
        yield (case['case_id'], 'shared', [], (lambda case=case: dc.evaluate_integrity(case, root)), 'integrity')


def outcome_matches(kind, expected, result):
    if kind == 'integrity':
        return sorted(set(result)) == sorted(set(expected))
    return result == expected


def collect(families=None, root=dc.ROOT, flips=True, progress=None):
    """Replay every witness once; return per-phase controls/negatives and findings."""
    suites, findings = {}, []
    for n, (pair, family, expected, action, kind) in enumerate(witnesses(root)):
        if families is not None and family not in families:
            continue
        if progress and n % 2000 == 0:
            progress(n)
        result, records = run_recorded(action)
        if kind == 'integrity':
            records = [r for r in records if r[0].startswith(INTEGRITY)]
        if not outcome_matches(kind, expected, result):
            findings.append(dict(kind='unexpected_result', pair=pair, expected=expected, found=result))
            continue
        refused = [r for r in records if r[2] is not None]
        accepted = not expected
        if accepted:
            if refused:
                # An accepted witness may still have recorded a refusal only where the checker treats it as a result.
                findings.append(dict(kind='accepted_with_refusal', pair=pair, rows=[r[2][0] for r in refused][:3]))
                continue
            for phase, observed, _ in records:
                slot = suites.setdefault(phase, dict(controls={}, negatives={}))
                k = key(observed)
                if k not in slot['controls']:
                    slot['controls'][k] = dict(id=f'control/{len(slot["controls"])}/{pair}', value=observed, family=family)
            continue
        reason = excluded(pair)
        if reason:
            findings.append(dict(kind='excluded_from_table_proof', pair=pair, reason=reason))
            continue
        if not refused:
            findings.append(dict(kind='untracked_refusal', pair=pair))
            continue
        if kind == 'integrity' and len(refused) != 1:
            findings.append(dict(kind='integrity_not_single_record', pair=pair, rows=[r[2][0] for r in refused]))
            continue
        phase, observed, (row, code) = refused[0]
        slot = suites.setdefault(phase, dict(controls={}, negatives={}))
        flip = complete_boundary_flip(action, kind, phase, row) if flips else None
        k = key((row, observed))
        if k not in slot['negatives']:
            slot['negatives'][k] = dict(id=f'negative/{pair}', value=observed, target=row, code=code, family=family,
                                        defect=f'{pair} ({family}): one source change', aliases=[], flips=[flip], families={family})
        else:
            slot['negatives'][k]['aliases'].append(pair)
            slot['negatives'][k]['flips'].append(flip)
            slot['negatives'][k]['families'].add(family)
    for slot in suites.values():
        for n in slot['negatives'].values():
            n['families'] = sorted(n['families'])
    return suites, findings


def complete_boundary_flip(action, kind, phase, row):
    """Re-run the whole witness with only its refusing row swapped to always-pass.

    'accepted' means the complete checker path then accepts it; otherwise the next refusing
    (phase, row) is reported. Tool credit is per phase table; this is lane evidence only.
    """
    entries = dc.table_rows(phase)
    dc._TABLE_ROWS[phase] = [(n, (lambda value, context: None) if n == row else p, c) for n, p, c in entries]
    try:
        result, records = run_recorded(action)
    except Exception as exc:  # derivation that relied on the cut row
        return 'refused_later:derivation_requires_cut_row:' + type(exc).__name__
    finally:
        dc._TABLE_ROWS[phase] = entries
        dc.RECORDER = None
    if kind == 'integrity':
        records = [r for r in records if r[0].startswith(INTEGRITY)]
        refused = [r for r in records if r[2] is not None]
        return 'accepted' if not result and not refused else 'refused_later:' + (refused[0][0] + ':' + refused[0][2][0] if refused else 'untracked:' + ','.join(result))
    refused = [r for r in records if r[2] is not None]
    if result is None:
        return 'accepted'
    return 'refused_later:' + (refused[0][0] + ':' + refused[0][2][0] if refused else 'untracked')


def lane_matrix(phase, controls, negatives):
    """Cheap direct check of every row on every case (the tool repeats it under certification)."""
    rows = dc.table_rows(phase)
    problems = []
    for c in controls:
        failing = [n for n, p, ctx in rows if p(c['value'], ctx) is not None]
        if failing:
            problems.append(dict(case=c['id'], kind='control_refused', rows=failing))
    for n in negatives:
        failing = [name for name, p, ctx in rows if p(n['value'], ctx) is not None]
        if failing != [n['target']]:
            problems.append(dict(case=n['id'], kind='not_single_row', target=n['target'], rows=failing))
    return problems


def tool_controls(controls, limit):
    """Every family's first control of the phase, then the rest in recorded order, up to limit."""
    chosen, seen = [], set()
    for c in controls:
        if c['family'] not in seen:
            seen.add(c['family'])
            chosen.append(c)
    for c in controls:
        if len(chosen) >= limit:
            break
        if c not in chosen:
            chosen.append(c)
    return chosen


def suite_for(phase, slot, control_limit=40):
    module = dc.table_module(phase)
    controls = tool_controls(list(slot['controls'].values()), control_limit)
    negatives = list(slot['negatives'].values())
    if not controls:
        return None
    by_family = {}
    for c in controls:
        by_family.setdefault(c['family'], c['id'])
    first = controls[0]['id']
    gc = [g.Control(c['id'], copy.deepcopy(c['value']), 'synthetic') for c in controls]
    gn = [g.Negative(n['id'], copy.deepcopy(n['value']), n['target'], n['code'], by_family.get(n['family'], first), n['defect']) for n in negatives]
    path = f'scripts/pm_collab_table_{phase}.py'
    return g.Suite(f'DC {phase}', module.case, gc, gn, (path,), ROOT,
                   non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                          'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])
