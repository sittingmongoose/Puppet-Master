"""DX guard-table suites for the gated shared tool (scripts/pm_guard_isolation.py, gated at 004bdedd63).

Adapter only: no table module imports it, so the tool scans just the phase table under test.
Every witness of the DX checkers runs once under the checkers' observation recorder: semantic
capture/history/type/numeric/score/schema/reference/workgraph/helper/golden cases and their valid
seeds, contract shape cases and seeds, receipt/replay traces, the CLI fixture-integrity checks and
the sweep part 2A witnesses (Plans/executor_event_p2a_cases.json). An accepted invocation supplies
control observations for every phase it passed. A refused invocation's refusal gives the negative:
the observation of the phase holding that refusal, targeted at the refusing row. A trace's refusals
are its expected outputs, so each one is a negative. A witness whose refusal is not tracked, or
whose result differs from its expectation, is reported, never relabelled. Nothing here repairs,
caches or decides a checker result.
"""
import copy
import hashlib
import json
import pickle
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / 'scripts') not in sys.path:
    sys.path.insert(0, str(ROOT / 'scripts'))
import pm_guard_isolation as g  # noqa: E402
import pm_executor_event_semantics as sem  # noqa: E402
sys.modules.setdefault('pm_executor_event_semantics', sem)
import pm_executor_event_contracts as con  # noqa: E402
import pm_executor_schema_refs as refs  # noqa: E402

RETURN_SOURCE = 'return g.Case(table, check, context)'
P2A_CASES = 'Plans/executor_event_p2a_cases.json'


def key(value):
    return hashlib.sha256(pickle.dumps(value, protocol=5)).hexdigest()


class Recorder:
    """Ordered (phase, observation, first refusal) records of one witness run."""

    def __init__(self):
        self.records = []

    def record(self, phase, observed, found):
        self.records.append((phase, copy.deepcopy(observed), found))


def run_recorded(action):
    sem.RECORDER = recorder = Recorder()
    try:
        try:
            result = ('accept', action())
        except sem.TableRefusal as error:
            result = ('reject', (error.phase, error.row, str(error)))
        except Exception as error:  # untracked: reported, never relabelled
            result = ('untracked', type(error).__name__ + ': ' + str(error)[:200])
    finally:
        sem.RECORDER = None
    return result, recorder.records


def load(path, root=ROOT):
    return json.loads((root / path).read_text())


def witnesses(root=ROOT):
    """(pair id, family, expected, action, kind) for every witness the DX CLIs run, plus part 2A witnesses.

    expected is 'accept' or 'reject'; kind is 'product', 'trace' (expected holds the outputs) or 'integrity'.
    """
    contracts = load('Plans/executor_event_contracts.json', root)['families']
    fixture_doc = load('Plans/executor_event_semantic_fixtures.json', root)
    families = sem.expand_fixture_literals(fixture_doc['families'])
    type_fixtures = load('Plans/executor_event_type_fixtures.json', root)['families']
    shapes_all = sem.expand_fixture_literals(load('Plans/executor_event_contract_fixtures.json', root))['cases']
    ref_fixtures = load('Plans/executor_event_schema_reference_fixtures.json', root)['families']
    registry = load('Plans/event_family_registry.json', root)
    existing = {f['event_type'] for f in registry['families']}
    by_name = {c['event_type']: c for c in contracts}
    yield ('integrity/contract_set', 'shared', 'accept', lambda: sem.check_contract_set([c['event_type'] for c in contracts]), 'integrity')
    yield ('integrity/closure', 'shared', 'accept', lambda: sem.check_family_closure(families, by_name), 'integrity')
    yield ('integrity/table_order', 'shared', 'accept', lambda: sem.check_table_order(root), 'integrity')
    for case in fixture_doc.get('helper_cases', []):
        yield ('helper/' + case['case'], 'shared', case['expected'], (lambda case=case: sem.run_helper_case(case)), 'product')
    for case in fixture_doc.get('canonical_golden_cases', []):
        yield ('golden/' + case['case'], 'shared', case['expected'], (lambda case=case: sem.canonical(json.loads(case['json']))), 'product')
    for contract in contracts:
        name = contract['event_type']
        family = families[name]
        shapes = [row for row in shapes_all if row['event_type'] == name]
        prefix = name + '/'
        for path in [contract['schema_ref'], 'Plans/executor_event_source_proofs.schema.json']:
            yield (prefix + 'lane_schema/' + path, name, 'accept',
                   (lambda path=path: refs.check_references(json.loads((root / path).read_text()), path)), 'integrity')
        yield (prefix + 'integrity/contract', name, 'accept',
               (lambda contract=contract, shapes=shapes: con.contract_integrity(contract, existing, shapes)), 'integrity')
        yield (prefix + 'integrity/identity_replay', name, 'accept',
               (lambda contract=contract, shapes=shapes: identity_replay(contract, shapes[0]['payload'])), 'integrity')
        for case in family.get('workgraph_id_cases', []):
            seed = family['baseline']['capture']['records'][case['slot']]['body']['workgraph_id']
            yield (prefix + 'workgraph_seed/' + case['case'], name, 'accept',
                   (lambda seed=seed, case=case: sem.validate_workgraph_id(seed, case['slot'])), 'product')
            yield (prefix + 'workgraph/' + case['case'], name, case['expected'],
                   (lambda case=case: sem.validate_workgraph_id(case['value'], case['slot'])), 'product')
        for case in type_fixtures[name]:
            seed, specimen = sem.type_case_specimens(family, shapes, case)
            yield (prefix + 'type_seed/' + case['case'], name, 'accept',
                   (lambda contract=contract, case=case, seed=seed: sem.validate_type_case(contract, case['route'], seed)), 'product')
            yield (prefix + 'integrity/type_case/' + case['case'], name, 'accept',
                   (lambda case=case: sem.check_type_case(case)), 'integrity')
            yield (prefix + 'type/' + case['case'], name, case['expected'],
                   (lambda contract=contract, case=case, specimen=specimen: sem.validate_type_case(contract, case['route'], specimen)), 'product')
        original_schema = json.loads((root / contract['schema_ref']).read_text())
        for case in ref_fixtures[name]:
            changes = copy.deepcopy(case['changes'])
            for change in changes:
                if change['path'] == '$defs':
                    change['value'] = {**original_schema.get('$defs', {}), **change['value']}
            schema = sem.mutate(original_schema, changes)
            yield (prefix + 'ref/' + case['case'], name, case['expected'],
                   (lambda schema=schema, contract=contract: refs.check_references(schema, contract['schema_ref'])), 'product')
        for case in family.get('numeric_cases', []):
            yield (prefix + 'numeric/' + case['case'], name, case['expected'],
                   (lambda contract=contract, family=family, case=case: sem.numeric_case(contract, family['baseline'], case)), 'product')
        for case in family['cases']:
            specimen = sem.mutate(family['baseline'], case['changes'])
            if 'seed_changes' in case:
                seed = sem.mutate(family['baseline'], case['seed_changes'])
                yield (prefix + 'capture_seed/' + case['case'], name, 'accept',
                       (lambda contract=contract, seed=seed: sem.validate_capture(contract, seed['payload'], seed['capture'])), 'product')
                yield (prefix + 'integrity/capture_seed/' + case['case'], name, 'accept',
                       (lambda family=family, case=case: sem.check_capture_seed(family, case)), 'integrity')
            yield (prefix + 'capture/' + case['case'], name, case['expected'],
                   (lambda contract=contract, specimen=specimen: sem.validate_capture(contract, specimen['payload'], specimen['capture'])), 'product')
        for case in family.get('history_cases', []):
            original = sem.mutate(family['baseline'], case['original_changes'])
            payload = copy.deepcopy(family['baseline']['payload'])
            payload.update(case['event_changes'])
            retained = case.get('retained_source_sha256', family['retained_source_sha256'])
            if 'seed_disclosure' in case:
                yield (prefix + 'history_seed/' + case['case'], name, 'accept',
                       (lambda contract=contract, payload=payload, original=original, case=case: sem.validate_history(
                           contract, payload, original, case['retained_source_sha256'], case['seed_disclosure'])), 'product')
                yield (prefix + 'integrity/disclosure_seed/' + case['case'], name, 'accept',
                       (lambda case=case: sem.check_disclosure_seed(case)), 'integrity')
            yield (prefix + 'history/' + case['case'], name, case['expected'],
                   (lambda contract=contract, payload=payload, original=original, retained=retained, case=case: history_result(
                       sem.validate_history(contract, payload, original, retained, case['disclosure']))), 'product')
            live = sem.mutate(family['baseline'], case['live_changes'])
            yield (prefix + 'history_live/' + case['case'], name, 'reject',
                   (lambda contract=contract, payload=payload, live=live: sem.validate_capture(contract, payload, live['capture'])), 'product')
        for scenario in family['traces']:
            yield (prefix + 'trace/' + scenario['case'], name, scenario['expected'],
                   (lambda contract=contract, family=family, scenario=scenario: sem.run_trace(contract, family['baseline']['payload'], scenario)),
                   'trace')
        for case in family.get('score_domain_cases', []):
            yield (prefix + 'score/' + case['case'], name, case['expected'],
                   (lambda case=case: sem.validate_score_domain(case['ready_nodes'], case['selected_nodes'])), 'product')
        for case in family.get('schema_cases', []):
            if 'valid_seed' in case:
                yield (prefix + 'schema_seed/' + case['case'], name, 'accept',
                       (lambda contract=contract, case=case: sem.schema_validate(contract['schema_ref'], case['valid_seed'])), 'product')
            route = sem.schema_validate if case.get('format_route') == 'strict' else sem.stock_schema_validate
            yield (prefix + 'schema/' + case['case'], name, case['expected'],
                   (lambda contract=contract, case=case, route=route: route(contract['schema_ref'], case['payload'])), 'product')
        for case in shapes:
            if 'seed' in case:
                yield (prefix + 'shape_seed/' + case['case'], name, 'accept',
                       (lambda contract=contract, case=case: con.validate(contract, case['seed']['payload'], case['seed']['context'])), 'product')
                yield (prefix + 'integrity/shape_seed/' + case['case'], name, 'accept',
                       (lambda case=case: sem.check_shape_seed(case)), 'integrity')
            yield (prefix + 'shape/' + case['case'], name, case['expected'],
                   (lambda contract=contract, case=case: con.validate(contract, case['payload'], case['context'])), 'product')
    path = root / P2A_CASES
    if path.exists():
        import pm_executor_p2a_cases as p2a
        for witness in p2a.witnesses(load(P2A_CASES, root), by_name, families, shapes_all, existing, root):
            yield witness


def history_result(actual):
    if actual != {'result': 'history_only', 'effects': 0}:
        raise RuntimeError('invalid history effects')
    return actual


def identity_replay(contract, payload):
    facts = con.identity_replay_facts(contract, copy.deepcopy(payload))
    sem.refuse('identity_replay', {k: facts[k] for k in ('identity', 'sequence_changed_identity')})
    sem.refuse('identity_replay_fixed', {k: facts[k] for k in ('identity', 'metadata_changed_identity', 'other_storage_event_id',
                                                                'recomputed_identity', 'digest', 'metadata_changed_digest')})
    return True


def collect(families=None, root=ROOT, flips=True, progress=None):
    """Replay every witness once; return per-phase controls/negatives and findings."""
    suites, findings, counts = {}, [], {'witnesses': 0, 'accepted': 0, 'refused': 0, 'traces': 0}
    fallback = {}
    for n, (pair, family, expected, action, kind) in enumerate(witnesses(root)):
        if families is not None and family not in families:
            continue
        if progress and n % 2000 == 0:
            progress(n)
        counts['witnesses'] += 1
        result, records = run_recorded(action)
        if kind == 'trace':
            counts['traces'] += 1
            if result[0] != 'accept' or result[1] != expected:
                findings.append(dict(kind='unexpected_result', pair=pair, expected=expected, found=result))
                continue
            for phase, observed, found in records:
                slot = suites.setdefault(phase, dict(controls={}, negatives={}))
                if found is None:
                    add_control(slot, observed, pair, family)
                else:
                    add_negative(slot, observed, found, pair, family,
                                 complete_boundary_flip(action, kind, phase, found[0], expected) if flips else None)
            continue
        if result[0] == 'untracked':
            findings.append(dict(kind='untracked_refusal', pair=pair, found=result[1]))
            continue
        if result[0] != expected:
            findings.append(dict(kind='unexpected_result', pair=pair, expected=expected, found=result))
            continue
        refused = [r for r in records if r[2] is not None]
        if result[0] == 'accept':
            counts['accepted'] += 1
            if refused:
                findings.append(dict(kind='accepted_with_refusal', pair=pair, rows=[r[2][0] for r in refused][:3]))
                continue
            for phase, observed, _ in records:
                add_control(suites.setdefault(phase, dict(controls={}, negatives={})), observed, pair, family)
            continue
        counts['refused'] += 1
        if len(refused) != 1 or refused[0][0] != result[1][0] or refused[0][2][0] != result[1][1]:
            findings.append(dict(kind='refusal_not_single_record', pair=pair, rows=[(r[0], r[2][0]) for r in refused]))
            continue
        phase, observed, found = refused[0]
        for earlier_phase, earlier, passed in records:
            if passed is None:
                add_control(fallback.setdefault(earlier_phase, dict(controls={}, negatives={})), earlier, pair, family)
        add_negative(suites.setdefault(phase, dict(controls={}, negatives={})), observed, found, pair, family,
                     complete_boundary_flip(action, kind, phase, found[0], expected) if flips else None)
    for phase, slot in suites.items():
        if not slot['controls'] and phase in fallback:
            slot['controls'] = fallback[phase]['controls']
            slot['controls_from_refused_witnesses'] = True
        for negative in slot['negatives'].values():
            negative['families'] = sorted(negative['families'])
    return suites, findings, counts


def add_control(slot, observed, pair, family):
    k = key(observed)
    if k not in slot['controls']:
        slot['controls'][k] = dict(id=f'control/{len(slot["controls"])}/{pair}', value=observed, family=family)


def add_negative(slot, observed, found, pair, family, flip):
    row, code = found
    k = key((row, observed))
    if k not in slot['negatives']:
        slot['negatives'][k] = dict(id=f'negative/{pair}', value=observed, target=row, code=code, family=family,
                                    defect=f'{pair} ({family}): one source change', aliases=[], flips=[flip], families={family})
    else:
        slot['negatives'][k]['aliases'].append(pair)
        slot['negatives'][k]['flips'].append(flip)
        slot['negatives'][k]['families'].add(family)


def complete_boundary_flip(action, kind, phase, row, expected):
    """Re-run the whole witness with only its refusing row swapped to always-pass.

    'accepted' means the complete checker path then accepts it (a trace: its outputs change);
    otherwise the next refusing (phase, row) is reported. Tool credit is per phase table; this is
    lane evidence only.
    """
    entries = sem.table_rows(phase)
    sem._TABLE_ROWS[phase] = [(n, (lambda value, context: None) if n == row else p, c) for n, p, c in entries]
    try:
        result, records = run_recorded(action)
    finally:
        sem._TABLE_ROWS[phase] = entries
    if kind == 'trace':
        return 'accepted' if result[0] == 'accept' and result[1] != expected else 'refused_later:trace_outputs_unchanged'
    if result[0] == 'accept':
        return 'accepted'
    if result[0] == 'untracked':
        return 'refused_later:derivation_requires_cut_row:' + result[1].split(':')[0]
    return 'refused_later:' + result[1][0] + ':' + result[1][1]


def lane_matrix(phase, controls, negatives):
    """Cheap direct check of every row on every case (the tool repeats it under certification)."""
    rows = sem.table_rows(phase)
    problems = []

    def failing_rows(case):
        failing = []
        for name, predicate, context in rows:
            try:
                if predicate(case['value'], context) is not None:
                    failing.append(name)
            except Exception as error:  # a predicate must be total over every observation of its phase
                problems.append(dict(case=case['id'], kind='predicate_error', row=name, error=type(error).__name__))
        return failing
    for c in controls:
        failing = failing_rows(c)
        if failing:
            problems.append(dict(case=c['id'], kind='control_refused', rows=failing))
    for n in negatives:
        failing = failing_rows(n)
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
    return chosen[:max(limit, len(seen))]


def suite_for(phase, slot, control_limit=40):
    module = sem.table_module(phase)
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
    path = f'scripts/{sem.TABLE_PREFIX}{phase}.py'
    return g.Suite(f'DX {phase}', module.case, gc, gn, (path,), ROOT,
                   non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                          'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])
