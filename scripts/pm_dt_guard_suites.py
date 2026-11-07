"""DT guard-table suites for the gated shared tool (scripts/pm_guard_isolation.py).

Adapter only: no table module imports it, so the tool scans just the phase
table under test. Every witness call of the complete DT checker (the per-family
checks in pm-dt-event-contracts.py:family_checks, the shared blocks, and the
ported corpora in pm_dt_guard_cases.py) runs once under the checker's
observation recorder. A top-level call with no refusal supplies controls (the
observation of every phase it passed). A call refused by a row supplies one
negative: the observation of the phase holding its FIRST refusal, targeted at
that row with that row's code. Nothing here repairs, caches or decides a
checker result. Corpus negatives that are not refused are reported, never
relabelled.
"""
import copy
import hashlib
import importlib.util
import pickle
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_guard_isolation as g  # noqa: E402

_SPEC = importlib.util.spec_from_file_location('pm_dt_event_contracts', ROOT / 'scripts/pm-dt-event-contracts.py')
dt = importlib.util.module_from_spec(_SPEC)
sys.modules['pm_dt_event_contracts'] = dt
_SPEC.loader.exec_module(dt)
import pm_dt_guard_cases as corpora  # noqa: E402

ENTRIES = ('source_valid', 'recovery', 'checkpoint_result', 'historical_read', 'transition', 'gate_score_join',
           'tool_request_join', 'usage_values_valid', 'denial_emission', 'batch_join', 'append_model', 'identity',
           'decode_source', 'accounting_totals', 'schema_accepts', 'references_refusal', 'retention_eligible',
           'projection_outcome')
RETURN_SOURCE = 'return g.Case(table, check, context)'
# Witnesses kept in the full checker (still refused there) but not used as
# table-row proof, with the reason: each is two rows by construction, and the
# named single-row witnesses prove each row of the set alone. Entry: (phase,
# exact row set, reason). Any other multi-row negative is an open finding.
LIVE_STATE = ('retained-reader live-state witness (historical_results live_transition_no_longer_valid): the later live '
              'state differs in several facts by design; it shows the live transition no longer holds, not one defect')
EXCLUDED = [
    ('src_schema', ('SV08_prepared_schema', 'SV09_completed_schema'),
     'coherent by design: identifier_checks puts the trailing-LF original hash in both original stages so only schema grammar '
     'can refuse it; the table SV08/SV09 one-stage witnesses prove each row alone'),
    ('src_identity', ('SV27_event_key', 'SV28_event_id', 'SV29_captured_key', 'SV30_captured_id'),
     'coherent forged identity: standing check 2 and the app_key corpus put the forged key and its derived event id on the event '
     'and both captured stages, so every copy row refuses; the table SV27..SV30 witnesses change one copy each'),
    ('cp_token', ('CP13_current_token', 'CP14_token_storage', 'CP15_checkpoint_storage', 'CP16_selection_storage', 'CP17_checkpoint_key'),
     'standing check 7 (fixture-pinned oracle) changes a Storage identity copy without refreshing the current token; the corpus '
     'storage/* and coherent_foreign witnesses refresh it and prove CP14..CP16 alone'),
    ('cp_token', ('CP13_current_token', 'CP16_selection_storage'),
     'standing check 7 (fixture-pinned oracle) changes the selection Storage copy without refreshing the current token; '
     'storage/index_read_token/source_selection/storage_instance_id proves CP16 alone'),
    ('tool_request', ('TJ3_node_omits_tool', 'TJ4_node_before_tool'),
     'turning a tool request into a node request leaves both the payload and the blocked tool_use_id present; '
     'node_extra_tool and node_before_tool prove each row alone'),
    ('tr_approval_requested', ('AR2_actions_present', 'AR3_actions_copy'),
     'an emptied payload action list also differs from the blocked actions; the coherent empty-list witness proves AR2 alone'),
    ('tr_approval_granted', ('AG1_requested', 'AG3_not_paused', 'AG4_not_revoked'), LIVE_STATE),
    ('tr_requirements', ('RQ1_blocked', 'RQ2_questions', 'RQ3_copies'), LIVE_STATE),
    ('denial', ('DE2_decision', 'DE3_not_dispatched'), LIVE_STATE),
    ('tr_tool_started', ('TS1_admitted', 'TS2_allowed'), LIVE_STATE),
    ('tr_config_migrated', ('CM2_legacy_value', 'CM6_enum_mapping'),
     'the payload legacy value is read by its copy row and by the mapping row; before-only witnesses prove CM2 and coherent '
     'witnesses prove CM6'),
    ('gate_score', ('GS3_dispatch_ref_copy', 'GS7_scored_ref'),
     'an emptied payload dispatch ref also differs from the dispatch copy; missing_ref_coherent proves GS7 and before-only '
     'witnesses prove GS3'),
    ('gate_score', ('GS4_dispatch_tuple_copy', 'GS6_scored_node'),
     'a payload dispatch tuple naming another node also differs from the dispatch copy; coherent tuple witnesses prove GS6 and '
     'before-only witnesses prove GS4'),
    ('tr_gate_failed_b', ('GF6_evidence_present', 'GF7_evidence_copy'),
     'an emptied payload evidence list also differs from the report evidence; coherent witnesses prove GF6 and one-sided ones GF7'),
    ('tr_gate_passed_b', ('GP7_evidence_present', 'GP8_evidence_copy'),
     'an emptied payload evidence list also differs from the report evidence; coherent witnesses prove GP7 and one-sided ones GP8'),
    ('tr_requirements', ('RQ2_questions', 'RQ3_copies'),
     'an emptied blocked question set also differs from the payload copy; the other witnesses prove each row alone'),
    ('tr_tool_denied', ('TD1_copies', 'TD2_not_executed'),
     'the payload denial field is compared with its policy copy (TD1) and with its value rule; coherent witnesses prove TD2 and '
     'policy-only witnesses prove TD1'),
    ('tr_tool_denied', ('TD1_copies', 'TD3_headless'),
     'the payload denial field is compared with its policy copy (TD1) and with its value rule; coherent witnesses prove TD3 and '
     'policy-only witnesses prove TD1'),
    ('tr_tool_denied', ('TD1_copies', 'TD4_no_failure_class'),
     'the payload denial field is compared with its policy copy (TD1) and with its value rule; coherent witnesses prove TD4 and '
     'policy-only witnesses prove TD1'),
    ('tr_tool_invoked', ('TI3_web_copies', 'TI6_copies'),
     'payload meta is compared with the web request (TI3) and with its owner-result copy (TI6); outcome-coherent witnesses prove '
     'TI3 and outcome-only witnesses prove TI6'),
    ('tr_tool_invoked', ('TI2_web_tool', 'TI3_web_copies', 'TI6_copies'),
     'a payload meta tool_id is compared with the tool name (TI2), the web request (TI3) and the owner-result copy (TI6); '
     'the other witnesses prove each row alone'),
    ('tr_usage_a', ('UE2_adjusted_after_settled', 'UE5_adjusted_at'),
     'moving a record to adjusted from an unsettled state also leaves it without adjusted_at_utc; the other witnesses prove each row alone'),
    ('usage_values_a', ('UV2_cost_copies', 'UV3_unknown_cost'),
     'changing only the payload cost status also breaks its cost-record copy; record-coherent witnesses prove UV3'),
    ('usage_values_a', ('UV1_cost_amount_copy', 'UV3_unknown_cost'),
     'changing only the cost-record amount also breaks its payload copy; record-coherent witnesses prove UV3'),
    ('tr_worktree_deleted_b', ('WD8_no_blockers', 'WD10_no_safe_points'),
     'the coherent corpus sets the same safe point on the allocation and the payload; one-sided witnesses prove each row'),
    ('tr_worktree_deleted_b', ('WD8_no_blockers', 'WD9_no_active_locks'),
     'the coherent corpus sets the same lock on the allocation and the payload; one-sided witnesses prove each row'),
    ('tr_worktree_deleted_b', ('WD6_before_lock_checked', 'WD7_payload_lock_checked'),
     'the coherent corpus clears file_lock_checked on both the allocation and the payload; one-sided witnesses prove each row'),
    ('batch_parent', ('BJ03_child_ids', 'BJ04_unique_children'),
     'missing_url_child drops a child, so the declared list differs and names more ids than children; the table BJ04 witness '
     'proves BJ04 alone'),
]


def key(value):
    return hashlib.sha256(pickle.dumps(value, protocol=5)).hexdigest()


class Collector:
    """Segments the checker's table evaluations by top-level witness call."""

    def __init__(self):
        self.depth = 0
        self.family = None
        self.records = None
        self.segments = []
        self.unlabelled = []
        self.stray = []

    def install(self):
        for name in ENTRIES:
            setattr(dt, name, self.wrap(name, getattr(dt, name)))

    def wrap(self, name, function):
        def wrapped(*args, **kwargs):
            outer = self.depth == 0
            if outer:
                self.records = []
                dt.RECORDER = self.records
            self.depth += 1
            try:
                return function(*args, **kwargs)
            finally:
                self.depth -= 1
                if outer:
                    dt.RECORDER = self.stray
                    segment = dict(entry=name, family=self.family, records=self.records, label=None)
                    self.segments.append(segment)
                    self.unlabelled.append(segment)
                    self.records = None
        wrapped.__wrapped__ = function
        return wrapped

    def label(self, message):
        for segment in self.unlabelled:
            segment['label'] = message
        self.unlabelled = []

    def check(self, ok, message):
        self.label(message)
        if not ok:
            raise AssertionError('checker assertion failed during collection: ' + message)


def collect(families=None):
    """Run every witness once; return (segments, findings)."""
    collector = Collector()
    collector.install()
    dt.RECORDER = collector.stray
    findings = []
    inputs = dt.checker_inputs()
    contracts = [c for c in inputs['contracts'] if families is None or c['event_type'] in families]
    schemas = inputs['schemas']
    try:
        for c in contracts:
            name = c['event_type']
            collector.family = name
            dt.family_checks(c, inputs, collector.check)
            f = inputs['fixtures'][name]
            built = []
            for corpus in (corpora.source_corpus, corpora.checkpoint_corpus, corpora.other_corpus):
                built.extend(corpus(dt, c, f, schemas))
            built.extend(corpora.boundary_corpus(dt, c, f))
            collector.label(name + ': corpus construction')
            for label, call, accepting in built:
                result = call()
                accepted = any(result == item for item in accepting) if isinstance(accepting, set) else result == accepting
                if accepted:
                    findings.append(dict(kind='corpus_negative_accepted', family=name, label=label))
                collector.label(name + ': corpus ' + label)
        for block in dt.SHARED_BLOCKS:
            family = 'shared' if block.startswith('shared/') else block
            if families is not None and family not in families:
                continue
            collector.family = family
            dt.shared_checks(inputs, collector.check, block)
            collector.label(block + ': shared block')
        references = reference_witnesses(collector)
        findings.extend(references)
    finally:
        dt.RECORDER = None
        for name in ENTRIES:
            setattr(dt, name, getattr(dt, name).__wrapped__)
    if collector.stray:
        findings.append(dict(kind='table_evaluated_outside_witness', phases=sorted({r[0] for r in collector.stray})))
    return collector.segments, findings


def reference_witnesses(collector):
    """Standing check 9 controls: a resolved bundle and one dangling reference per location."""
    collector.family = 'shared'
    findings = []
    base = 'https://puppetmaster.local/standing-ref-controls/'
    root = {'$id': base + 'root.json', '$defs': {
        'unused_external': {'$ref': 'external.json#entry'},
        'nested': {'$id': 'nested/child.json', '$defs': {'target': {'type': 'string'}}, '$ref': '#/$defs/target'},
        'local': {'$anchor': 'here', 'type': 'string'}, 'unused_local': {'$ref': '#here'}}}
    external = {'$id': base + 'external.json', '$defs': {'good': {'$anchor': 'entry', 'type': 'string'}}}
    documents = {'Plans/standing-root.json': root, 'Plans/standing-external.json': external}
    if dt.references_refusal(dt.schema_reference_errors(documents)) is not None:
        findings.append(dict(kind='reference_control_refused'))
    collector.label('shared: reference control resolved')
    for location in ['unused_definition', 'optional', 'alternative', 'external_unused']:
        changed = copy.deepcopy(documents)
        bad = {'$ref': '#/$defs/missing_control'}
        if location == 'unused_definition':
            changed['Plans/standing-root.json']['$defs']['unused'] = bad
        elif location == 'optional':
            changed['Plans/standing-root.json']['properties'] = {'unused': bad}
        elif location == 'alternative':
            changed['Plans/standing-root.json']['anyOf'] = [True, bad]
        else:
            changed['Plans/standing-external.json']['$defs']['unused'] = bad
        if dt.references_refusal(dt.schema_reference_errors(changed)) is None:
            findings.append(dict(kind='reference_negative_accepted', location=location))
        collector.label('shared: dangling reference ' + location)
    return findings


def rows_of(phase):
    return dt.table_rows(phase)


def classify(segments):
    """Per phase: controls and negatives (all families), and multi-row findings."""
    phases = {p: dict(controls={}, negatives={}) for p in dt.TABLE_PHASES}
    for index, segment in enumerate(segments):
        refusals = [r for r in segment['records'] if r[2] is not None]
        label = f"{segment['family']}/{segment['entry']}/{index}: {segment['label']}"
        if not refusals:
            for phase, observed, _ in segment['records']:
                slot = phases[phase]['controls']
                k = key(observed)
                if k not in slot:
                    slot[k] = dict(id=f'control/{len(slot)}/{label}', value=observed, families={segment['family']}, aliases=0)
                else:
                    slot[k]['families'].add(segment['family'])
                    slot[k]['aliases'] += 1
            continue
        phase, observed, (row, code) = refusals[0]
        slot = phases[phase]['negatives']
        k = key((row, observed))
        if k not in slot:
            slot[k] = dict(id=f'negative/{len(slot)}/{label}', value=observed, target=row, code=code,
                           families={segment['family']}, witnesses=[label])
        else:
            slot[k]['families'].add(segment['family'])
            slot[k]['witnesses'].append(label)
    return phases


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
    picked_controls = []
    seen_families = set()
    for c in controls:
        family = sorted(c['families'])[0]
        if family not in seen_families and len(picked_controls) < max_controls:
            picked_controls.append(c); seen_families.add(family)
    for c in controls:
        if len(picked_controls) >= max_controls:
            break
        if c not in picked_controls:
            picked_controls.append(c)
    return picked_controls, chosen


def suite_for(phase, controls, negatives):
    module = dt.table_module(phase)
    if not controls:
        return None
    first = controls[0]['id']
    gc = [g.Control(c['id'], copy.deepcopy(c['value']), 'synthetic') for c in controls]
    gn = [g.Negative(n['id'], copy.deepcopy(n['value']), n['target'], n['code'], first,
                     'one source change from a valid DT witness: ' + '; '.join(n['witnesses'][:2])) for n in negatives]
    path = f'scripts/pm_dt_table_{phase}.py'
    return g.Suite(f'DT {phase}', module.case, gc, gn, (path,), ROOT,
                   non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                          'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])
