"""DF guard-table suites for the gated shared tool (scripts/pm_guard_isolation.py).

Adapter only: no table module imports it, so the tool scans just the phase
table under test. Every existing DF witness runs once under the checkers'
observation recorder (pm_filesafe_tables.RECORDER):

- authority positives, materialization/issued negatives and protocol traces
  (Plans/filesafe_event_authority_fixtures.json), source graphs, retention
  bindings and the wrong-assignment probes of the complete authority CLI;
- payload positives, negatives, identity vectors and self-checks
  (Plans/filesafe_event_contract_fixtures.json) and the schema-graph
  reference negatives of both CLIs;
- retention oracle cases (Plans/filesafe_event_retention_fixtures.json) and
  the date-time format cases (Plans/filesafe_event_format_fixtures.json);
- the sweep part 2A witnesses (Plans/filesafe_event_p2a_cases.json).

Every phase evaluation whose rows all pass is a control observation. A checker
negative contributes the observation of its FIRST refusing phase, targeted at
the refusing row; a decision-model witness (protocol step, retention outcome)
contributes every refusing observation of its model phases, because each one
decided a modelled result. Observations refused by two rows of one table, and
expected refusals that no row issued, are reported, never relabelled. Nothing
here repairs, caches or decides a checker result.
"""
import copy
import hashlib
import importlib
import json
import pickle
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_guard_isolation as g  # noqa: E402
import pm_filesafe_tables as tables  # noqa: E402
import pm_filesafe_event_authority as A  # noqa: E402
import pm_filesafe_event_contracts as C  # noqa: E402
import pm_filesafe_retention as RT  # noqa: E402
import pm_filesafe_schema_graph as SG  # noqa: E402
from jsonschema import Draft202012Validator  # noqa: E402

RETURN_SOURCE = 'return g.Case(table, check, context)'
STEP = tables.STEP  # protocol step marker in recorded traces
MODEL_PREFIXES = ('proto_', 'retention_scope', 'retention_delete', 'retention_capacity', 'retention_overflow',
                  'retention_compact', 'runyear_')
CONTROL_CAP = 40
# Tables whose rows no input can refuse: the identity recipe self-checks
# recompute a pure function on the same input. They stay as checks and earn
# no credit (see the report's unproved-by-construction table).
UNPROVABLE = {'contract_identity_selfcheck': 'identity recipe self-checks of a pure function: a deep-copied retry, '
              'another family name and another operation_id are recomputed from the same positive; no input can '
              'make a deterministic function disagree with itself or collide on these distinct preimages'}


def key(value):
    return hashlib.sha256(pickle.dumps(value, protocol=5)).hexdigest()


def is_model(phase):
    return phase.startswith(MODEL_PREFIXES)


def recorded(action):
    """(outcome, records) for one witness invocation; records are table evaluations."""
    tables.RECORDER = records = []
    try:
        try:
            outcome = action()
        except Exception as error:  # an untracked failure is reported, never credited
            outcome = 'UNTRACKED:' + type(error).__name__ + ':' + str(error)[:120]
    finally:
        tables.RECORDER = None
    return outcome, records


def witnesses(families=None):
    """(id, family, kind, action) for every witness. kind: control | negative | model."""
    pack = A.load('Plans/filesafe_event_authority_fixtures.json')
    out = []
    for row in pack['families']:
        family = row['event_type']
        if families is not None and family not in families:
            continue
        out.append((f'{family}/graph', family, 'control', lambda f=family: A.graph_failures(f)))
        graph, _ = A.context(family)
        for policy in ('PENDING_RETENTION_DECISION', 'RP-AUTHORITY-INDEFINITE', 'RP-OPERATIONAL-2555D', 'RP-RUNTIME-365D'):
            if policy != graph['retention_policy_ref']:
                out.append((f'{family}/wrong_retention/{policy}', family, 'negative',
                            lambda f=family, p=policy: A.retention_binding_failures(f, p)))
        out.append((f'{family}/membership', family, 'control', lambda f=family: A.real_admission(f)))
        for case in row['positive']:
            def positive(case=case, f=family):
                found = A.materialization_failures(f, case['candidate'], case['bank'])
                expected = {k: case['candidate'][k] for k in ('event', 'custody')}
                for stored in ('issued', 'retained_boundary'):
                    found = found + A.issued_failures(f, case['bank'][stored].get(expected['event']['event_id']), expected, case['bank'])
                return found
            out.append((f'{family}/positive/{case["id"]}', family, 'control', positive))
        for index, case in enumerate(row['negative']):
            out.append((f'{family}/negative/{index}/{case["id"]}', family, 'negative',
                        lambda case=case, f=family, r=row: authority_negative(f, r, case)))
        for index, case in enumerate(row['protocol']):
            out.append((f'{family}/protocol/{index}/{case["id"]}', family, 'model',
                        lambda case=case, f=family, r=row: protocol_trace(f, r, case)))
    cpack = json.loads((ROOT / 'Plans/filesafe_event_contract_fixtures.json').read_text())
    for row in cpack['families']:
        family = row['event_type']
        if families is not None and family not in families:
            continue
        out.append((f'{family}/contract_cli', family, 'control', lambda f=family: contract_cli(f)))
        for case in row['negative_payloads']:
            out.append((f'{family}/contract_negative/{case["case_id"]}', family, 'negative',
                        lambda case=case, f=family: contract_negative(f, case)))
        graph, documents, _ = SG.context(family)
        reference_pack = json.loads((ROOT / 'Plans/filesafe_schema_graph_fixtures.json').read_text())
        for case in next(r['negative'] for r in reference_pack['families'] if r['event_type'] == family):
            out.append((f'{family}/reference_negative/{case["id"]}', family, 'negative',
                        lambda case=case, f=family: reference_negative(f, case)))
    rpack = json.loads((ROOT / 'Plans/filesafe_event_retention_fixtures.json').read_text())
    registry = json.loads((ROOT / 'Plans/storage_value_registry.json').read_text())['retention_policies']
    for row in rpack['families']:
        family = row['event_type']
        if families is not None and family not in families:
            continue
        policy = next(r for r in registry if r['policy_id'] == row['project_policy_ref'])
        out.append((f'{family}/retention_check', family, 'control', lambda f=family: RT.check(f)))
        for case in row['cases']:
            out.append((f'{family}/retention/{case["id"]}', family, 'model',
                        lambda case=case, p=policy: RT.outcome(case, p)))
    fmt = json.loads((ROOT / 'Plans/filesafe_event_format_fixtures.json').read_text())
    for case in fmt['cases']:
        out.append(('shared/format/' + case['id'], 'shared', 'negative' if not case['accepted'] else 'control',
                    lambda case=case: SG.date_time(case['value'])))
    out.append(('shared/fixture_census', 'shared', 'control',
                lambda: A.check(families=(), pack={'families': [{'event_type': f} for f in A.FAMILIES]})['failures']))
    import pm_filesafe_p2a_cases as p2a
    out.extend(p2a.witnesses(families))
    return out


def authority_negative(family, row, case):
    base = row['positive'][case.get('positive_index', 0)]
    candidate, bank = copy.deepcopy((base['candidate'], base['bank']))
    for edit in case['edits']:
        A.mutate(candidate if edit['target'] == 'candidate' else bank, edit['path'], edit.get('value'), edit.get('remove', False))
    if case.get('layer') == 'issued':
        expected = {k: candidate[k] for k in ('event', 'custody')}
        return A.issued_failures(family, bank['issued'].get(candidate['event']['event_id']), expected, bank)
    return A.materialization_failures(family, candidate, bank)


def protocol_trace(family, row, case):
    base = row['positive'][case.get('positive_index', 0)]
    candidate, bank = copy.deepcopy((base['candidate'], base['bank']))
    oracle = A.ProtocolOracle(family, candidate, bank)
    results = []
    for step in case['steps']:
        if 'edit' in step:
            edit = step['edit']
            A.mutate(candidate if edit['target'] == 'candidate' else bank, edit['path'], edit.get('value'), edit.get('remove', False))
            continue
        if tables.RECORDER is not None:
            tables.RECORDER.append(STEP)
        results.append(oracle.step(step['action'], candidate))
    return results


def contract_cli(family):
    schema = json.loads((ROOT / ('Plans/event_payloads/' + family.replace('.', '_') + '_v2.schema.json')).read_text())
    SG.schema_document_refused(schema)
    graph, documents, registry = SG.context(family)
    SG.reference_failures(graph, documents, registry)
    validator = Draft202012Validator(schema, registry=registry, format_checker=SG.format_checker())
    row = next(r for r in json.loads((ROOT / 'Plans/filesafe_event_contract_fixtures.json').read_text())['families']
               if r['event_type'] == family)
    for p in row['positive_payloads']:
        tables.refused('contract_payload_schema', {'errors': C.schema_errors(validator, p)})
        C.semantic(p)
    for vector in row['identity_vectors']:
        p = row['positive_payloads'][vector['payload_index']]
        tables.refused('contract_identity_vector', {'computed': list(C.identity(family, p)), 'expected': vector['expected']})
    p = row['positive_payloads'][0]
    q = copy.deepcopy(p)
    q['operation_id'] += '2'
    tables.refusals('contract_identity_selfcheck', {
        'first': list(C.identity(family, p)), 'retry': list(C.identity(family, copy.deepcopy(p))),
        'event_id': C.identity(family, p)[1], 'other_family_event_id': C.identity(family + '.other', p)[1],
        'other_operation': list(C.identity(family, q))})
    return []


def contract_negative(family, case):
    schema = json.loads((ROOT / ('Plans/event_payloads/' + family.replace('.', '_') + '_v2.schema.json')).read_text())
    graph, documents, registry = SG.context(family)
    validator = Draft202012Validator(schema, registry=registry, format_checker=SG.format_checker())
    if tables.refused('contract_payload_schema', {'errors': C.schema_errors(validator, case['payload'])}):
        return ['payload_schema']
    if case['layer'] == 'semantic' and not C.semantic(case['payload']):
        return ['payload_semantics']
    return []


def reference_negative(family, case):
    graph, documents, _ = SG.context(family)
    mutated_graph = copy.deepcopy(graph)
    mutated_documents = dict(documents)
    path = case['resource_path']
    if case.get('remove_resource'):
        mutated_graph['resources'] = [r for r in graph['resources'] if r['path'] != path]
        del mutated_documents[path]
    else:
        document = copy.deepcopy(documents[path])
        definition = {'$ref': case['unresolved_ref']}
        if 'nested_id' in case:
            definition['$id'] = case['nested_id']
        document.setdefault('$defs', {})['df_unexercised_negative'] = definition
        mutated_documents[path] = document
    return SG.reference_failures(mutated_graph, mutated_documents)


def collect(families=None, flips=True):
    """Replay every witness once; return per-phase controls/negatives and findings."""
    suites, findings = {}, []

    def slot(phase):
        return suites.setdefault(phase, dict(controls={}, negatives={}))

    def add_negative(phase, observed, row, code, wid, family, control_id, flip):
        s = slot(phase)
        k = key((row, observed))
        if k not in s['negatives']:
            s['negatives'][k] = dict(id=f'negative/{len(s["negatives"])}/{wid}', value=observed, target=row, code=code,
                                     control=control_id, family=family, defect=f'{wid}: one source change',
                                     aliases=[], flips=[flip] if flip else [])
        else:
            s['negatives'][k]['aliases'].append(wid)
            if flip:
                s['negatives'][k]['flips'].append(flip)

    for wid, family, kind, action in witnesses(families):
        outcome, records = recorded(action)
        if isinstance(outcome, str) and outcome.startswith('UNTRACKED:'):
            findings.append(dict(kind='untracked_exception', witness=wid, detail=outcome))
            continue
        steps = [[]]
        for record in records:
            if record is STEP:
                steps.append([])
            else:
                steps[-1].append(record)
        records = [r for r in records if r is not STEP]
        for phase, observed, refusal in records:
            if not refusal:
                s = slot(phase)
                k = key(observed)
                if k not in s['controls']:
                    s['controls'][k] = dict(id=f'control/{len(s["controls"])}/{wid}', value=observed, family=family)
        refused = [r for r in records if r[2]]
        if kind == 'control':
            if refused and not wid.endswith(('/graph', '/retention_check', '/fixture_census')) or (refused and outcome):
                findings.append(dict(kind='control_refused', witness=wid, phases=[r[0] for r in refused][:4], outcome=str(outcome)[:200]))
            continue
        if kind == 'model':
            # Each protocol step (or retention outcome) is decided by its first
            # refusal; every refusing model-phase observation also decided a result.
            targets = []
            for step in steps:
                step_refused = [r for r in step if r[2]]
                for r in step_refused[:1] + [r for r in step_refused[1:] if is_model(r[0])]:
                    if r not in targets:
                        targets.append(r)
        else:
            targets = refused[:1]
            if not refused:
                findings.append(dict(kind='negative_without_table_refusal', witness=wid, outcome=str(outcome)[:200]))
        for phase, observed, refusal in targets:
            if len(refusal) > 1:
                findings.append(dict(kind='two_row_observation', witness=wid, phase=phase, rows=[r for r, _ in refusal]))
                continue
            row, code = refusal[0]
            control_id = next((c['id'] for c in slot(phase)['controls'].values() if c['family'] == family), None)
            flip = complete_boundary_flip(action, phase, row) if flips and kind == 'negative' else None
            add_negative(phase, observed, row, code, wid, family, control_id, flip)
    return suites, findings


def complete_boundary_flip(action, phase, row):
    """Re-run the whole witness with only its refusing row swapped to always-pass.

    'accepted' means the complete boundary then accepts it; otherwise the next
    refusing (phase, row) is reported: a later row that independently watches
    the same source fact. Tool credit is per table; this is lane evidence.
    """
    entries = tables.rows(phase)
    tables._ROWS[phase] = [(n, (lambda value, context: None) if n == row else p, c) for n, p, c in entries]
    try:
        outcome, records = recorded(action)
    finally:
        tables._ROWS[phase] = entries
    if isinstance(outcome, str) and outcome.startswith('UNTRACKED:'):
        return 'refused_later:derivation_requires_cut_row:' + outcome.split(':')[1]
    refused = [r for r in records if r[2]]
    if not refused and not outcome:
        return 'accepted'
    if not refused:
        return 'refused_later:untracked'
    return 'refused_later:' + refused[0][0] + ':' + refused[0][2][0][0]


def lane_matrix(phase, controls, negatives):
    """Direct check of every row on every case (the tool repeats it under certification)."""
    rows = tables.rows(phase)
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


def chosen_controls(slot):
    """Every family's first control, then the rest in recorded order, up to CONTROL_CAP."""
    controls = list(slot['controls'].values())
    first, seen = [], set()
    for c in controls:
        if c['family'] not in seen:
            seen.add(c['family'])
            first.append(c)
    rest = [c for c in controls if c not in first]
    chosen = (first + rest)[:max(CONTROL_CAP, len(first))]
    needed = {n['control'] for n in slot['negatives'].values()}
    chosen += [c for c in controls if c['id'] in needed and c not in chosen]
    return chosen


def suite_for(phase, slot):
    module = importlib.import_module('pm_filesafe_table_' + phase)
    controls = chosen_controls(slot)
    negatives = list(slot['negatives'].values())
    if not controls:
        return None
    first = controls[0]['id']
    ids = {c['id'] for c in controls}
    gc = [g.Control(c['id'], copy.deepcopy(c['value']), 'synthetic') for c in controls]
    gn = [g.Negative(n['id'], copy.deepcopy(n['value']), n['target'], n['code'],
                     n['control'] if n['control'] in ids else first, n['defect']) for n in negatives]
    path = f'scripts/pm_filesafe_table_{phase}.py'
    return g.Suite(f'DF {phase}', module.case, gc, gn, (path,), ROOT,
                   non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                          'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])
