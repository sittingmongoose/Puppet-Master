"""DF sweep part 2A witnesses: Plans/filesafe_event_p2a_cases.json.

Each case is a coherent single-defect negative (or a decision-model trace) for
a guard row the earlier fixtures left unproved. It is built from a named valid
seed of its own family by scripts/pm-filesafe-p2a-cases.py: one fact changes and
every copy that is not the defect moves with it (original bodies re-encoded and
rehashed, source commitments recomputed, the selected-source bank copy, the
EventRecord custody digests and the issued and retained-boundary copies). The
builder keeps a case only when the complete checker refuses it at exactly its
target row as the first refusal; both CLIs check every case again
(case_failures). Kinds and the boundary each one runs through:

materialization, issued   complete materialization / retained issued custody
protocol                  ProtocolOracle steps (each step's expected result)
graph                     graph_failures on an edited source graph (rehashed)
retention_binding         pm_filesafe_retention.binding_failures on an edited graph
retention_check           pm_filesafe_retention.check on an edited registry or fixture
membership                real_admission against a registry that names the family
census                    the authority CLI's fixture family census
schema_meta               a schema document refused by the Draft 2020-12 meta-schema
identity_vector           a recorded identity vector that disagrees with the recipe
payload_semantic          the payload owner's semantic oracle on a schema-valid payload
"""
import copy
import json
from pathlib import Path

import pm_filesafe_tables as tables

ROOT = Path(__file__).resolve().parents[1]
CASES = ROOT / 'Plans/filesafe_event_p2a_cases.json'
MODEL_KINDS = ('protocol',)
_PACK = {}


def cases():
    if not CASES.exists():
        return []
    return json.loads(CASES.read_text())['cases']


def authority_pack():
    if 'pack' not in _PACK:
        import pm_filesafe_event_authority as A
        _PACK['pack'] = A.load('Plans/filesafe_event_authority_fixtures.json')
    return _PACK['pack']


def seed(family, index):
    row = next(r for r in authority_pack()['families'] if r['event_type'] == family)
    return row['positive'][index]


def apply_edits(document, edits):
    import pm_filesafe_event_authority as A
    for edit in edits:
        A.mutate(document, edit['path'], edit.get('value'), edit.get('remove', False))


def run(case):
    """The complete boundary outcome of one case (codes, step results or a value)."""
    import pm_filesafe_event_authority as A
    import pm_filesafe_event_contracts as C
    import pm_filesafe_retention as RT
    import pm_filesafe_schema_graph as SG
    kind, family = case['kind'], case.get('family')
    if kind in ('materialization', 'materialization_raw', 'issued', 'protocol'):
        base = seed(family, case['positive_index'])
        candidate, bank = copy.deepcopy((base['candidate'], base['bank']))
        apply_edits(candidate, [e for e in case.get('edits', []) if e['target'] == 'candidate'])
        apply_edits(bank, [e for e in case.get('edits', []) if e['target'] == 'bank'])
        if kind == 'materialization':
            return A.materialization_failures(family, candidate, bank)
        if kind == 'materialization_raw':
            raw = json.dumps(candidate, ensure_ascii=False)
            for old, new in case['spellings']:
                assert raw.count(old) == 1, old
                raw = raw.replace(old, new)
            return A.materialization_raw_failures(family, raw, bank)
        if kind == 'issued':
            expected = {k: candidate[k] for k in ('event', 'custody')}
            return A.issued_failures(family, bank['issued'].get(candidate['event']['event_id']), expected, bank)
        oracle = A.ProtocolOracle(family, candidate, bank)
        results = []
        for step in case['steps']:
            if 'edit' in step:
                edit = step['edit']
                A.mutate(candidate if edit['target'] == 'candidate' else bank, edit['path'], edit.get('value'), edit.get('remove', False))
                continue
            if tables.RECORDER is not None:
                tables.RECORDER.append(STEP)
            result = oracle.step(step['action'], candidate)
            results.append(result if isinstance(result, str) else 'ORIGINAL_FULL_RESULT')
        return results
    if kind in ('graph', 'retention_binding'):
        graph = copy.deepcopy(A.context(family)[0])
        apply_edits(graph, case['graph_edits'])
        if not case.get('keep_graph_hash'):
            from pm_projects_refresh_contracts import semantic_hash
            graph['graph_sha256'] = semantic_hash('source_graph', {k: v for k, v in graph.items() if k != 'graph_sha256'})
        if kind == 'graph':
            return A.graph_failures(family, graph)
        return RT.binding_failures(family, graph)
    if kind == 'retention_check':
        registry = json.loads((ROOT / 'Plans/storage_value_registry.json').read_text())
        fixtures = json.loads((ROOT / 'Plans/filesafe_event_retention_fixtures.json').read_text())
        apply_edits(registry, case.get('registry_edits', []))
        apply_edits(fixtures, case.get('fixture_edits', []))
        return RT.check(family, registry=registry, fixtures=fixtures)
    if kind == 'membership':
        return [] if A.real_admission(family, registry=case['registry']) == 'missing_event_registration' else ['membership_changed']
    if kind == 'census':
        return A.check(families=(), pack={'families': [{'event_type': f} for f in case['families']]})['failures']
    if kind == 'schema_meta':
        return ['schema_document_invalid'] if SG.schema_document_refused(case['document']) else []
    if kind == 'identity_vector':
        payload = C.contract_positive(family, case['payload_index'])
        return C.identity_vector_failures(family, payload, case['expected'])
    if kind == 'payload_semantic':
        return C.payload_failures(family, case['payload'], 'semantic')
    raise ValueError('unknown p2a case kind ' + kind)


STEP = tables.STEP


def first_refusal(case):
    """(outcome, first refusing (phase, row) or None) under the recorder."""
    previous = tables.RECORDER
    tables.RECORDER = records = []
    try:
        outcome = run(case)
    finally:
        tables.RECORDER = previous
    if case['kind'] == 'protocol':
        steps, current = [], []
        for record in records:
            if record is STEP:
                current = []
                steps.append(current)
            else:
                current.append(record)
        index = case['target_step']
        refused = [r for r in steps[index] if r[2]]
    elif case['kind'] == 'census':
        # The census CLI also runs the format self-test first; only the census row decides here.
        refused = [r for r in records if r is not STEP and r[2] and r[0] == 'fixture_census']
    else:
        refused = [r for r in records if r[2] and r is not STEP]
    first = (refused[0][0], refused[0][2][0][0]) if refused else None
    if case['kind'] == 'protocol':
        model = [(r[0], r[2][0][0]) for r in refused if r[0].startswith('proto_')]
        if case['target_row'] in [row for _, row in model]:
            first = next(m for m in model if m[1] == case['target_row'])
    return outcome, first


def case_failures(families=None, boundary=None):
    """CLI check: every case is refused, at its target row, with its expected result."""
    failures = []
    for case in cases():
        if families is not None and case.get('family', 'shared') not in families and case.get('family') is not None:
            continue
        if boundary is not None and case['kind'] not in boundary:
            continue
        outcome, first = first_refusal(case)
        if first is None or first[1] != case['target_row']:
            failures.append(f"{case['id']}:p2a_target_row:{first}")
        if case['kind'] == 'protocol':
            if outcome != case['expected_results']:
                failures.append(f"{case['id']}:p2a_steps:{outcome}")
        elif case['expected_error'] not in outcome:
            failures.append(f"{case['id']}:p2a_expected_error:{outcome}")
    return failures


def witnesses(families=None):
    """(id, family, kind, action) for the guard-table suite builder."""
    out = []
    for case in cases():
        family = case.get('family') or 'shared'
        if families is not None and family not in families:
            continue
        kind = 'model' if case['kind'] in MODEL_KINDS else 'negative'
        out.append(('p2a/' + case['id'], family, kind, lambda case=case: run(case)))
    return out
