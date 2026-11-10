"""DG6B guard-table suites for the gated shared tool (scripts/pm_guard_isolation.py).

Adapter only: no table module imports it, so the tool scans just the phase
table under test. The complete checker (pm-dg6b-event-contracts.py run) is
replayed once per family under its observation recorder. Every negative the
checker asserts (expect_failure: the Probe corpus, the fixture negatives and the
round-9 witnesses) hands over the table evaluations of its call; the
observation of the phase holding its FIRST refusal becomes a tool negative,
targeted at the refusing row. Every phase evaluation recorded outside a
negative that passed becomes a control of that phase. Nothing here repairs,
caches or decides a checker result.
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

_SPEC = importlib.util.spec_from_file_location('pm_dg6b_event_contracts', ROOT / 'scripts/pm-dg6b-event-contracts.py')
dg = importlib.util.module_from_spec(_SPEC)
sys.modules['pm_dg6b_event_contracts'] = dg
_SPEC.loader.exec_module(dg)

RETURN_SOURCE = 'return g.Case(table, check, context)'

# Legacy Probe guard label -> the table rows that may hold its first refusal.
# A probe refused elsewhere is reported (first_refusal_outside_label), never relabelled.
PROBE_ROWS = {
    'payload_subject_domain': ('PS01',), 'payload_shape_extension': ('PS01',), 'payload_shape_missing_subject': ('PS01',),
    'payload_integer_type': ('PS01', 'ER01'), 'payload_owner_vocabulary': ('PS01',), 'owner_io_request': ('OQ01',),
    'owner_io_result': ('OR01',), 'resolution_closed_shape': ('RT01',), 'original_server_required': ('PS01', 'AS01'),
    'writer': ('SG01',), 'access': ('SG02',), 'definition_writer': ('DW01',), 'protected': ('PM02',),
    'mirror': ('PM01',), 'confirmation': ('PF01',), 'source_trust': ('PV01', 'IM'), 'cas': ('PK01', 'DC01', 'UC'),
    'reach': ('PX01',), 'envelope_schema_version': ('ER01',), 'payload_transport_join': ('PJ01',),
    'identity': ('ID01',), 'envelope_source_join': ('EJ',), 'envelope_integer_type': ('ER01',),
    'cadence': ('CD01',), 'observation_only_hook': ('PS01',), 'protected_identity': ('PM03',),
    'home_scope': ('PH', 'PL01'), 'override_lineage': ('OE', 'OO'), 'creation_source': ('CR',),
    'partition': ('PA', 'PS01'), 'retry_immutability': ('RY',), 'historical_provenance': ('HF0',),
    'historical_withdrawn': ('HF0',), 'historical_access': ('HF0',), 'historical_storage_source': ('HS01',),
    'payload_ref_unavailable': ('RA',), 'payload_ref_integrity': ('TI', 'OF', 'RF'), 'operation_actor_ref_pattern': ('OP01',),
    'operation_source_join': ('OJ01', 'OH', 'OP01'), 'operation_value_too_large': ('OV01',),
    'current_writer_policy': ('AP',), 'idempotency_key': ('IK01',), 'checkpoint_storage_join': ('CJ',),
    'checkpoint_schema': ('CK01',), 'scope': ('AU01', 'SC01', 'SS01', 'PC0', 'PSS01'), 'inline_body_too_large': ('IS01',),
    'original_source_join': ('FS', 'RQ', 'QK', 'RR', 'HC', 'LC01', 'SL'), 'resolution_value_too_large': ('RZ01',),
    'resolution_source_join': ('RJ01',), 'resolution_storage_schema': ('RT01',), 'resolution_schema': ('RS01',),
    # Sweep part 2B: retained originals Storage never sealed are refused by SP-1101 custody first.
    'historical_original_recipe': ('HR01',),
}


def key(value):
    return hashlib.sha256(pickle.dumps(value, protocol=5)).hexdigest()


class Collector:
    """Receives each asserted negative from expect_failure while its call is live."""

    def __init__(self, flips=True):
        self.negatives, self.findings, self.flips = [], [], flips

    def __call__(self, name, label, expected, records, call):
        refused = [r for r in records if r[3] is not None]
        if not refused:
            self.findings.append(dict(kind='untracked_refusal', family=name, label=label))
            return
        context, phase, observed, (row, code) = refused[0]
        if code != expected:
            self.findings.append(dict(kind='code_mismatch', family=name, label=label, row=row, code=code, expected=expected))
            return
        guard = label.split(':', 1)[1].split('/')[0] if ':' in label else None
        entry = dict(family=name, label=label, phase=phase, value=observed, row=row, code=code,
                     flip=self.complete_boundary_flip(call, phase, row) if self.flips else None)
        probe = PROBE_GUARDS.get((name, label))
        # A typed or shape defect of a guarded field is refused first by its schema
        # occurrence (the probe's expected code says so); that is its own label.
        if probe is not None and not row.startswith(PROBE_ROWS.get(probe, (row,))) and code not in SCHEMA_CODES:
            self.findings.append(dict(kind='first_refusal_outside_label', family=name, label=label, guard=probe, row=row))
        self.negatives.append(entry)

    @staticmethod
    def complete_boundary_flip(call, phase, row):
        """Re-run the negative's whole call with only its refusing row swapped to always-pass.

        'accepted' means the complete boundary then accepts it; otherwise the next
        refusing (phase, row) is reported: a later row that independently watches the
        same source fact. The tool's credit is per phase table; this is lane evidence
        about the complete checker path only.
        """
        entries = dg.table_rows(phase)
        saved_recorder, saved_collector = dg.RECORDER, dg.COLLECTOR
        dg._TABLE_ROWS[phase] = [(n, (lambda value, context: None) if n == row else p, c) for n, p, c in entries]
        dg.RECORDER, dg.COLLECTOR = [], None
        try:
            call()
        except dg.TableRefusal as exc:
            return 'refused_later:' + exc.phase + ':' + exc.row
        except Exception as exc:  # derivation that relied on the cut row; lane evidence only
            return 'refused_later:derivation_requires_cut_row:' + type(exc).__name__
        else:
            return 'accepted'
        finally:
            dg._TABLE_ROWS[phase] = entries
            dg.RECORDER, dg.COLLECTOR = saved_recorder, saved_collector
        return 'unreachable'


PROBE_GUARDS = {}
SCHEMA_CODES = ('adapter_schema', 'payload_schema', 'event_record_schema', 'operation_schema', 'source_io_schema',
                'resolution_storage_schema', 'resolution_schema', 'selected_result_schema', 'checkpoint_schema', 'payload_types')


def collect(family, flips=True):
    """Replay the complete checker for one family; return (controls, negatives, findings, result)."""
    global PROBE_GUARDS
    from pm_dg6b_full_oracles import family_probes
    PROBE_GUARDS = {}
    fixtures = dg.strict_json((ROOT / 'Plans/dg6b_event_contract_fixtures.json').read_text())
    for row in fixtures['families']:
        if row['event_type'] == family:
            for probe in family_probes(vars(dg), row):
                PROBE_GUARDS[(family, probe.id)] = probe.guard
    collector = Collector(flips)
    dg.RECORDER, dg.COLLECTOR = [], collector
    try:
        result = dg.run(family=family)
        records = dg.RECORDER
    finally:
        dg.RECORDER, dg.COLLECTOR = None, None
    controls = {}
    for context, phase, observed, refusal in records:
        if refusal is not None:
            collector.findings.append(dict(kind='refusal_outside_negative', family=context, phase=phase, refusal=refusal))
            continue
        slot = controls.setdefault((phase, context), {})
        slot.setdefault(key(observed), observed)
    return controls, collector.negatives, collector.findings, result


def suites(controls, negatives):
    """(phase, family) -> dict(controls=[(id, value)], negatives=[dict]) with distinct values."""
    out = {}
    for (phase, context), values in controls.items():
        slot = out.setdefault((phase, context), dict(controls={}, negatives={}))
        for k, value in values.items():
            slot['controls'].setdefault(k, dict(id=f'control/{context}/{phase}/{len(slot["controls"])}', value=value))
    for n in negatives:
        slot = out.setdefault((n['phase'], n['family']), dict(controls={}, negatives={}))
        k = key((n['row'], n['value']))
        if k not in slot['negatives']:
            slot['negatives'][k] = dict(id=f'negative/{n["family"]}/{n["label"]}#{len(slot["negatives"])}', value=n['value'], target=n['row'],
                                        code=n['code'], labels=[n['label']], flips=[n['flip']])
        else:
            slot['negatives'][k]['labels'].append(n['label'])
            slot['negatives'][k]['flips'].append(n['flip'])
    return out


def merged(collected, family):
    """Family suites with the shared witnesses of the same phase merged in (shared-only phases stay shared)."""
    result = {}
    family_phases = {phase for (phase, context) in collected if context == family}
    for (phase, context), slot in collected.items():
        if context != family:
            continue
        both = dict(controls=dict(slot['controls']), negatives=dict(slot['negatives']))
        shared = collected.get((phase, 'shared'))
        if shared:
            for k, c in shared['controls'].items():
                both['controls'].setdefault(k, c)
            for k, n in shared['negatives'].items():
                both['negatives'].setdefault(k, n)
        result[phase, family] = both
    for (phase, context), slot in collected.items():
        if context == 'shared' and phase not in family_phases:
            result[phase, 'shared'] = slot
    return result


# Rows a family's own complete path cannot reach, with the reason. Only these rows
# may take a recorded negative of the same table from the named donor family; the
# report lists every borrowed cell separately from the family's own cells.
AUTH = lambda f: f.startswith('auth.')  # noqa: E731
PERSONA = lambda f: f.startswith('persona.')  # noqa: E731
NON_PERSONA = lambda f: not f.startswith('persona.')  # noqa: E731
BORROW = {
    ('source_scope', 'SC01_source_scope'): (NON_PERSONA, 'persona.created',
        'the closed non-Persona source adapter embeds the same strict WorkflowScopeV2 with formats, '
        'so AS01 refuses an invalid source scope first; only the Persona owner-request scope reaches SC01'),
    ('retry', 'RY02_idempotency_key'): (PERSONA, 'auth.github.authenticated',
        'the Persona scope key holds the Server and partition, so an equal event_id recomputes an equal key '
        '(RY01 and IK01 decide it); only a non-Persona application retry from another Server reaches RY02'),
    ('original_server', 'OS01_server_string'): (PERSONA, 'auth.github.authenticated',
        'Persona identity reads the Server from the payload scope, whose type shape (PT01) refuses a non-string first'),
    ('partition', 'PA01_scope_partition'): (AUTH, 'plugin.loaded',
        'auth families are application scoped, and WorkflowScopeV2 fixes an application partition to app '
        '(AS01/SC01 decide it); only a Project scope reaches PA01'),
    ('envelope_a', 'EJ07_project_id'): (AUTH, 'plugin.loaded',
        'auth families are application scoped and the EventRecord schema forces project_id null there; '
        'a kind change is EJ06; only a Project scope reaches EJ07'),
}


def borrow(phase, family, slot, pool):
    """Add declared donor negatives for rows the family cannot reach; return what was borrowed."""
    targets = {n['target'] for n in slot['negatives'].values()}
    borrowed = []
    for name, _, _ in dg.table_rows(phase):
        rule = BORROW.get((phase, name))
        if name in targets or rule is None or not rule[0](family):
            continue
        donor = next((n for n in pool.get(rule[1], []) if n['phase'] == phase and n['row'] == name), None)
        if donor is None:
            continue
        k = key((name, donor['value']))
        slot['negatives'].setdefault(k, dict(id=f'borrowed/{rule[1]}/{donor["label"]}', value=donor['value'], target=name,
                                             code=donor['code'], labels=['borrowed:' + rule[1] + ':' + donor['label']],
                                             flips=[None]))
        borrowed.append(dict(row=name, donor=rule[1], label=donor['label'], reason=rule[2]))
    return borrowed


def lane_matrix(phase, controls, negatives):
    """Cheap direct check of every row on every case (the tool repeats it under certification)."""
    rows = dg.table_rows(phase)
    problems = []
    for c in controls:
        failing = [n for n, p, ctx in rows if p(c['value'], ctx) is not None]
        if failing:
            problems.append(dict(case=c['id'], kind='control_refused', rows=failing))
    for n in negatives:
        failing = [name for name, p, ctx in rows if p(n['value'], ctx) is not None]
        if failing != [n['target']]:
            problems.append(dict(case=n['id'], kind='not_single_row', target=n['target'], rows=failing, labels=n['labels'][:3]))
    return problems


def nearest(controls, value):
    return min(controls, key=lambda c: (len(g.typed_changes(c['value'], value)), c['id']))


def suite_for(phase, family, slot):
    module = dg.table_module(phase)
    controls = list(slot['controls'].values())
    negatives = list(slot['negatives'].values())
    if not controls:
        return None
    gc = [g.Control(c['id'], copy.deepcopy(c['value']), 'synthetic') for c in controls]
    gn = []
    for n in negatives:
        control = nearest(controls, n['value'])
        changed = ', '.join(g.pointer(tuple(p)) for p in g.typed_changes(control['value'], n['value'])) or 'none'
        gn.append(g.Negative(n['id'], copy.deepcopy(n['value']), n['target'], n['code'], control['id'],
                             f"{n['labels'][0]} ({family}): one source change; observation differs at {changed}"))
    path = f'scripts/pm_dg6b_table_{phase}.py'
    return g.Suite(f'DG6B {phase} [{family}]', module.case, gc, gn, (path,), ROOT,
                   non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                          'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])
