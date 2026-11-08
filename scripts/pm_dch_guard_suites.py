"""DCH guard-table suites for the gated shared tool (scripts/pm_guard_isolation.py).

Adapter only: no table module imports it, so the tool scans just the phase
table under test. Every witness call of the complete DCH checkers runs once
under the checker's observation recorder: the ordinary checker
(pm_dch_events.main, one family at a time, including the round 5-8 oracle
corpora and the table witnesses) and the separate Stop checker
(pm_dch_stop.main). A top-level model call with no refusal supplies controls
(the observation of every phase it passed). A call refused by a row supplies
one negative: the observation of the phase holding its FIRST refusal,
targeted at that row with that row's code. Nothing here repairs, caches or
decides a checker result. Witness calls are segmented by the outermost public
model function; a table evaluation outside any segment is reported.
"""
import contextlib
import copy
import hashlib
import io
import json
import pickle
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_guard_isolation as g  # noqa: E402
import pm_dch_events as dch  # noqa: E402
import pm_dch_stop as stop  # noqa: E402

ENTRIES = ('record_number_rule', 'input_types_valid', 'resolve_body', 'valid_scope_partition', 'joins', 'retry_outcome',
           'historical_read_valid', 'test_joins', 'checkpoint_joins', 'checkpoint_storage_valid', 'archive_joins',
           'references_valid', 'reference_closure_refusal')
STOP_ENTRIES = ('resolve_value', 'request_valid', 'outcome_valid', 'save_outcome', 'read_outcome', 'queue_can_advance',
                'index_read_valid', 'retirement_ready')
STOP_FAMILY = 'chat.response_stop_requested'
RETURN_SOURCE = 'return g.Case(table, check, context)'
# Witnesses kept in the full checker (still refused there) but not used as
# table-row proof, with the reason: each is two rows by construction, and the
# named single-row witnesses prove each row of the set alone. Entry: (phase,
# exact row set, reason). Any other multi-row negative is an open finding.
BOTH_RECORDS = ('two records by construction: the pair carries the policy on both the original and the retry; the one-sided '
                'pairs (original only, retry only) prove each row alone')
EXCLUDED = [
    ('rn_recipe', ('RN02_store_type', 'RN03_digest_type'),
     'an empty provenance object lacks both the Store and the digest by construction (round7 recipe_selector/type/7); '
     'recipe_selector/type/8 (digest only) and the table witness RN02_store_type (Store only) prove each row alone'),
    ('jn_envelope_a', ('JN03_event_id', 'JN04_idempotency_key'),
     'coherent foreign identity: round6 retained_start/*/foreign re-keys the start under another Store, so the event id and '
     'the key derived from it both differ from the recomputation; the ordinary envelope-mismatch witnesses change one copy each'),
    ('rt_policy', ('RT02_original_replay_only', 'RT03_retry_replay_only'), BOTH_RECORDS),
    ('rt_policy', ('RT04_original_policy', 'RT05_retry_policy'), BOTH_RECORDS),
    ('rt_original', ('RT07_retry_envelope', 'RT08_retry_payload'),
     'a retained strict-v3 original reused as the retry carries its malformed timestamp in both occurred_at_utc and the payload '
     'ts, which the joins require to be equal; the table witness RT07_retry_envelope and the payload-only retry witnesses '
     'prove each row alone'),
    ('hr_flags', ('HR02_envelope_schema', 'HR03_payload_schema'),
     'round7 current_history_format/ts puts the malformed timestamp in both occurred_at_utc and the payload ts (the joins '
     'require them equal); the envelope-only and payload-only history witnesses prove each row alone'),
    ('cp_store', ('CP04_value_store', 'CP05_token_store', 'CP06_selection_store', 'CP07_root_store'),
     'the join oracle source_storage_instance changes the actual Store under every copy at once; outer/token/selection_'
     'storage_instance and the table witness CP07_root_store change one copy each'),
    ('st_retirement', ('RR01_contract_specified', 'RR02_storage_materialized', 'RR03_restart_verified', 'RR04_recovery_verified'),
     'the three real retirement applications are pending on four conditions by design (an honest cutover-pending state, '
     'not one defect); the fixture retirement cases change one condition each'),
]


def key(value):
    return hashlib.sha256(pickle.dumps(value, protocol=5)).hexdigest()


def witness_label(depth=2):
    """Name of the oracle case being evaluated, read from the calling frames."""
    frame = sys._getframe(depth)
    hops = 0
    while frame is not None and hops < 12:
        local = frame.f_locals
        oracle = local.get('oracle')
        if hasattr(oracle, 'name'):
            return 'oracle ' + oracle.name
        if isinstance(oracle, dict) and 'name' in oracle:
            return frame.f_code.co_name + ':' + str(frame.f_lineno) + ' oracle ' + str(oracle['name'])
        case = local.get('case')
        if isinstance(case, dict) and 'id' in case and 'name' in case:
            return 'stop case ' + case['id'] + ' ' + case['name']
        if frame.f_code.co_name in ('main', 'table_witness_checks'):
            return frame.f_code.co_filename.rsplit('/', 1)[-1] + ':' + frame.f_code.co_name + ':' + str(frame.f_lineno)
        frame = frame.f_back
        hops += 1
    return 'unlabelled'


class Collector:
    """Segments the checkers' table evaluations by top-level witness call; classifies each segment at once."""

    def __init__(self):
        self.depth = 0
        self.family = None
        self.records = None
        self.stray = []
        self.calls = 0
        self.refused_calls = 0
        self.phases = {p: dict(controls={}, negatives={}) for p in dch.TABLE_PHASES}

    def install(self):
        self.saved = []
        for module, names in ((dch, ENTRIES), (stop, STOP_ENTRIES)):
            for name in names:
                original = getattr(module, name)
                self.saved.append((module, name, original))
                setattr(module, name, self.wrap(name, original))

    def uninstall(self):
        for module, name, original in self.saved:
            setattr(module, name, original)

    def wrap(self, name, function):
        def wrapped(*args, **kwargs):
            outer = self.depth == 0
            if outer:
                self.records = []
                dch.RECORDER = self.records
                label = witness_label()
            self.depth += 1
            try:
                return function(*args, **kwargs)
            finally:
                self.depth -= 1
                if outer:
                    dch.RECORDER = self.stray
                    self.classify(name, label, self.records)
                    self.records = None
        wrapped.__wrapped__ = function
        return wrapped

    def classify(self, entry, label, records):
        self.calls += 1
        refusals = [r for r in records if r[2] is not None]
        witness = f'{self.family}/{entry}: {label}'
        if not refusals:
            for phase, observed, _ in records:
                slot = self.phases[phase]['controls']
                k = key(observed)
                if k not in slot:
                    slot[k] = dict(id=f'control/{len(slot)}/{witness}', value=observed, families={self.family}, aliases=0)
                else:
                    slot[k]['families'].add(self.family)
                    slot[k]['aliases'] += 1
            return
        self.refused_calls += 1
        phase, observed, (row, code) = refusals[0]
        slot = self.phases[phase]['negatives']
        k = key((row, observed))
        if k not in slot:
            slot[k] = dict(id=f'negative/{len(slot)}/{witness}', value=observed, target=row, code=code,
                           families={self.family}, witnesses=[witness])
        else:
            slot[k]['families'].add(self.family)
            if len(slot[k]['witnesses']) < 20:
                slot[k]['witnesses'].append(witness)


def collect(families=None):
    """Run every witness once; return (collector, findings)."""
    collector = Collector()
    collector.install()
    findings = []
    contracts = json.loads((ROOT / 'Plans/dch_event_contracts.json').read_text())['rows']
    names = [r['event_type'] for r in contracts]
    try:
        for name in names:
            if families is not None and name not in families:
                continue
            collector.family = name
            dch.SELECTED_FAMILY = name
            dch.RECORDER = collector.stray
            buffer = io.StringIO()
            with contextlib.redirect_stdout(buffer):
                code = dch.main()
            report = json.loads(buffer.getvalue())
            if code or report['status'] != 'pass':
                findings.append(dict(kind='checker_failed', family=name, failures=report['failures'][:20]))
        if families is None or STOP_FAMILY in families:
            collector.family = STOP_FAMILY
            dch.SELECTED_FAMILY = None
            buffer = io.StringIO()
            with contextlib.redirect_stdout(buffer):
                code = stop.main()
            report = json.loads(buffer.getvalue())
            if code or report['status'] != 'pass':
                findings.append(dict(kind='checker_failed', family=STOP_FAMILY, failures=report['failures'][:20]))
    finally:
        dch.RECORDER = None
        dch.SELECTED_FAMILY = None
        collector.uninstall()
    if collector.stray:
        findings.append(dict(kind='table_evaluated_outside_witness', phases=sorted({r[0] for r in collector.stray})))
    return collector, findings


def rows_of(phase):
    return dch.table_rows(phase)


def lane_matrix(phase, controls, negatives):
    """Direct check of every row on every case, uncapped (the tool repeats it under certification)."""
    rows = rows_of(phase)
    problems = []
    for c in controls:
        failing = [n for n, p, ctx in rows if p(c['value'], ctx) is not None]
        if failing:
            problems.append(dict(case=c['id'], kind='control_refused', rows=failing))
    for n in negatives:
        failing = [name for name, p, ctx in rows if p(n['value'], ctx) is not None]
        if failing != [n['target']]:
            problems.append(dict(case=n['id'], kind='not_single_row', target=n['target'], rows=failing,
                                 witnesses=n['witnesses'][:5]))
    return problems


def excluded(phase, rows, negative):
    for p, row_set, reason in EXCLUDED:
        if p == phase and set(rows) == set(row_set):
            return reason
    return None


def select(phase, controls, negatives, per_row=5, max_controls=4):
    """Tool cases: per row up to per_row distinct negatives, families round-robin; up to max_controls controls."""
    chosen = []
    for row, _, _ in rows_of(phase):
        mine = [n for n in negatives if n['target'] == row]
        by_family = {}
        for n in mine:
            by_family.setdefault(sorted(n['families'])[0], []).append(n)
        order = []
        while len(order) < per_row and any(by_family.values()):
            for family in sorted(by_family):
                if by_family[family] and len(order) < per_row:
                    order.append(by_family[family].pop(0))
        chosen.extend(order)
    picked = []
    seen = set()
    for c in controls:
        family = sorted(c['families'])[0]
        if family not in seen and len(picked) < max_controls:
            picked.append(c)
            seen.add(family)
    for c in controls:
        if len(picked) >= max_controls:
            break
        if c not in picked:
            picked.append(c)
    return picked, chosen


def suite_for(phase, controls, negatives):
    module = dch.table_module(phase)
    if not controls:
        return None
    first = controls[0]['id']
    gc = [g.Control(c['id'], copy.deepcopy(c['value']), 'synthetic') for c in controls]
    gn = [g.Negative(n['id'], copy.deepcopy(n['value']), n['target'], n['code'], first,
                     'one source change from a valid DCH witness: ' + '; '.join(n['witnesses'][:2])) for n in negatives]
    path = f'scripts/pm_dch_table_{phase}.py'
    return g.Suite(f'DCH {phase}', module.case, gc, gn, (path,), ROOT,
                   non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                          'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])
