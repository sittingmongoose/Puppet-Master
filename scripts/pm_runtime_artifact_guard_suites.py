"""DR guard-table suites for the gated shared tool (scripts/pm_guard_isolation.py).

Adapter only: it is not imported by any table module, so the tool scans just
the phase table under test. Every causal witness pair of the full checker
(pm_runtime_artifact_guard_cases and the round 6-9 constructors) runs once
under the checker's observation recorder. Its valid invocation supplies the
phase observations that become controls; its single-defect invocation must be
refused by a table row, and the observation of the phase holding that FIRST
refusal becomes the negative, targeted at the refusing row. A pair whose
first refusal falls outside the rows its legacy label names is reported, not
relabelled silently. Nothing here repairs, caches or decides a checker result.
"""
import copy
import hashlib
import importlib.util
import json
import pickle
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_guard_isolation as g  # noqa: E402

_SPEC = importlib.util.spec_from_file_location('pm_runtime_artifact_event_drafts', ROOT / 'scripts/pm-runtime-artifact-event-drafts.py')
dr = importlib.util.module_from_spec(_SPEC)
sys.modules['pm_runtime_artifact_event_drafts'] = dr
_SPEC.loader.exec_module(dr)

# Legacy row label -> new row-name prefixes that may hold its first refusal.
# Forwarded labels name the reused boundary the original forwarded to.
SCHEMA = ('S07_', 'S02_', 'S04_', 'N01_', 'S03_')
FULL = ('F0', 'F1', 'V0') + SCHEMA
AGREE = ('browser_', 'usage_', 'trace_')
LEGACY = {
    'D01': SCHEMA, 'D02': ('D02',), 'D03': ('D03',), 'D04': ('D04',), 'D05': ('D05',), 'D06': ('D06',), 'D07': ('D07',),
    'D08': ('D08',), 'D09': ('D09',), 'D10': ('D10',), 'D11': ('D11',), 'D12': SCHEMA + AGREE, 'D13': ('D13',),
    'D14': ('D14',), 'D15': ('D15',), 'D16': ('D16',), 'D17': ('D17', 'I01'), 'D18': ('D18',),
    'B01': AGREE, 'B02': ('B02',), 'B03': ('B03',),
    'H01': ('H01',), 'H02': ('H02',), 'H03': ('H03',), 'H04': ('H04',), 'H05': ('H05',), 'H06': FULL, 'H07': ('H07',),
    'F01': FULL, **{f'F{i:02}': (f'F{i:02}',) for i in range(2, 14)},
    'V01': SCHEMA, 'V02': ('V02',), 'V03': ('V03',), 'V04': ('V04',), 'V05': ('V05',), 'V06': SCHEMA, 'V07': ('V07',),
    'A01': ('A01',), 'A02': ('A02',), 'A03': ('A03',), 'A04': ('A04',), 'A05': ('A05',), 'A06': SCHEMA, 'A07': FULL,
    'P01': ('P01',), 'P02': ('P02',), 'P03': ('P03',),
    'C01': ('C01',), 'C02': SCHEMA, 'C03': ('C03',), 'C04': ('C04',), 'C05': ('C05',), 'C06': ('C06',) + FULL,
    'C07': ('C07',), 'C08': ('C08',), 'C09': ('C09',), 'C10': ('C10', 'C11'), 'C11': ('C11', 'C10'), 'C12': ('C12',),
    'C13': ('C13',), 'C14': ('C14',),
    'O01': ('O01',), 'O02': ('O02',), 'O03': SCHEMA + ('O03',), 'O04': ('O04',), 'O05': ('O05',), 'O06': ('O06',),
    'O07': ('O07',), 'O08': ('O08',), 'O09': ('O09',), 'O10': ('O10',), 'O11': FULL, 'O12': ('O12',), 'O13': ('H0',),
    'S01': ('S01',), 'S02': ('S02',), 'S03': ('S03',), 'S04': ('S04',), 'S05': ('S05',), 'S06': ('S06',), 'S07': ('S07',),
    'I01': ('I01',), 'I02': ('I02',), 'I03': ('I03',), 'N01': ('N01',),
}
RETURN_SOURCE = 'return g.Case(table, check, context)'
# Witness pairs kept in the full checker but not used as table-row proof, with the reason.
EXCLUDED = {
    'H07/{family}/deleted_body_refs': 'result classification witness: a deleted body yields metadata_only, which is a reader result, not a refusal',
    'C04/{family}/primary_selection_selected_segment_generation_float': 'two rows by construction: a live-selection change contradicts both the frontier (C04f) and token (C04g) copies; wrong_frontier_store and wrong_token_source_store prove each row alone',
    'C04/{family}/primary_selection_selected_segment_generation_boolean': 'two rows by construction (as above)',
    'C04/{family}/primary_selection_recovery_epoch_boolean': 'two rows by construction (as above)',
    'C04/{family}/primary_selection_manifest_generation_boolean': 'two rows by construction (as above)',
    'C04/{family}/primary_selection_recovery_epoch_float': 'two rows by construction (as above)',
    'C04/{family}/primary_selection_manifest_generation_float': 'two rows by construction (as above)',
}


EXCLUDED_PATTERNS = [
    ('B01', 'runtime_artifact.cost_usage', r'refs_usage_(event_ref|record_id)_(schema|inline|packed).*',
     'two rows by construction: cost_usage compares refs.<field> with both the root copy and the body copy; '
     'root_<field> and body_<field> witnesses prove each copy row alone'),
    ('O11', 'runtime_artifact.restore_point', r'numeric_.*_forged_first_receipt',
     'two rows by construction: a forged predecessor receipt is carried by both supplied copies (result and custody), '
     'so F12 and F13 refuse together; original_result, original_custody and receipt_copy prove each row alone'),
    ('O03', 'runtime_artifact.restore_point', r'.*_wrong_type_(2|3)',
     'two rows by construction: 0.0/1.0 where the owner snapshot needs a boolean violate the type row (S07) and the '
     'number row (N01); the integer, string, null and container variants prove S07 alone (number spelling is part 2B)'),
]


def excluded(guard, family, name):
    import re
    for g_, f_, pattern, reason in EXCLUDED_PATTERNS:
        if guard == g_ and family == f_ and re.fullmatch(pattern, name):
            return reason
    return EXCLUDED.get(f'{guard}/{{family}}/{name}')


def key(value):
    return hashlib.sha256(pickle.dumps(value, protocol=5)).hexdigest()


def run_recorded(action):
    """(accepted, records) for one witness invocation; records are table evaluations."""
    dr.RECORDER = records = []
    try:
        accepted = dr_accepted(action)
    finally:
        dr.RECORDER = None
    return accepted, records


def dr_accepted(action):
    from pm_runtime_artifact_guard_cases import accepted
    return accepted(lambda: action(dr))


def witness_pairs():
    from pm_runtime_artifact_guard_cases import cases
    return cases(dr)


def collect(families=None):
    """Replay every witness pair once; return per (phase, family) controls/negatives and findings."""
    suites, findings = {}, []
    for guard, family, name, good, bad in witness_pairs():
        if families is not None and family not in families:
            continue
        pair = f'{guard}/{family}/{name}'
        reason = excluded(guard, family, name)
        if reason:
            findings.append(dict(kind='excluded_from_table_proof', pair=pair, reason=reason))
            continue
        ok, good_records = run_recorded(good)
        refused_ok = [r for r in good_records if r[2] is not None]
        if not ok:
            findings.append(dict(kind='positive_refused', pair=pair, records=[r[0] for r in refused_ok][:3]))
            continue
        bad_ok, bad_records = run_recorded(bad)
        refused = [r for r in bad_records if r[2] is not None]
        if bad_ok:
            findings.append(dict(kind='negative_accepted', pair=pair))
            continue
        if not refused:
            findings.append(dict(kind='untracked_refusal', pair=pair))
            continue
        phase, observed, (row, code) = refused[0]
        if not row.startswith(LEGACY.get(guard, (guard,))):
            findings.append(dict(kind='first_refusal_outside_label', pair=pair, phase=phase, row=row))
        slot = suites.setdefault((phase, family), dict(controls={}, negatives={}))
        control_id = None
        for record_phase, record_observed, record_refusal in good_records:
            if record_refusal is None:
                s = suites.setdefault((record_phase, family), dict(controls={}, negatives={}))
                k = key(record_observed)
                if k not in s['controls']:
                    s['controls'][k] = dict(id=f'control/{len(s["controls"])}/{pair}', value=record_observed)
                if record_phase == phase and control_id is None:
                    control_id = s['controls'][k]['id']
        flip = complete_boundary_flip(bad, phase, row)
        k = key((row, observed))
        if k not in slot['negatives']:
            slot['negatives'][k] = dict(id=f'negative/{pair}', value=observed, target=row, code=code,
                                        control=control_id, defect=f'{guard} witness {name} ({family}): one source change',
                                        aliases=[], flips=[flip])
        else:
            slot['negatives'][k]['aliases'].append(pair)
            slot['negatives'][k]['flips'].append(flip)
    return suites, findings


def complete_boundary_flip(bad, phase, row):
    """Re-run the whole witness with only its refusing row swapped to always-pass.

    'accepted' means the complete boundary then accepts it; otherwise the next
    refusing (phase, row) is reported: a later row that independently watches
    the same source fact. The tool's credit is per phase table; this is lane
    evidence about the complete checker path only.
    """
    entries = dr.table_rows(phase)
    dr._TABLE_ROWS[phase] = [(n, (lambda value, context: None) if n == row else p, c) for n, p, c in entries]
    try:
        accepted, records = run_recorded(bad)
    except Exception as exc:  # derivation that relied on the cut row; lane evidence only
        return 'refused_later:derivation_requires_cut_row:' + type(exc).__name__
    finally:
        dr._TABLE_ROWS[phase] = entries
        dr.RECORDER = None
    if accepted:
        return 'accepted'
    refused = [r for r in records if r[2] is not None]
    return 'refused_later:' + (refused[0][0] + ':' + refused[0][2][0] if refused else 'untracked')


def lane_matrix(phase, controls, negatives):
    """Cheap direct check of every row on every case (the tool repeats it under certification)."""
    rows = dr.table_rows(phase)
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


def suite_for(phase, family, slot):
    module_name, factory_name = dr.TABLE_PHASES[phase]
    module = importlib.import_module('pm_runtime_artifact_table_' + module_name)
    controls = list(slot['controls'].values())
    negatives = list(slot['negatives'].values())
    if not controls:
        return None
    first = controls[0]['id']
    gc = [g.Control(c['id'], copy.deepcopy(c['value']), 'synthetic') for c in controls]
    gn = [g.Negative(n['id'], copy.deepcopy(n['value']), n['target'], n['code'], n['control'] or first, n['defect']) for n in negatives]
    path = f'scripts/pm_runtime_artifact_table_{module_name}.py'
    return g.Suite(f'DR {phase} [{family}]', getattr(module, factory_name), gc, gn, (path,), ROOT,
                   non_guards=[g.NonGuard(path, factory_name, 'return', RETURN_SOURCE,
                                          'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])
