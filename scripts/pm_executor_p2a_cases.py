"""DX sweep part 2A and part 2B witnesses (Plans/executor_event_p2a_cases.json): build and run each one.

Each witness names a valid seed of its own family (the family baseline, a named accepted capture,
history, shape or trace case) and the exact changes that make it; the changes are frozen in the
fixture, including every recomputed copy and digest. A negative names the one guard-table row that
must refuse it; the semantic CLI fails unless the checker refuses it at exactly that row. Controls
(expected accept) name no row. Contract-route witnesses change only the named contract fields of a
copy of the family contract; they never edit Plans/executor_event_contracts.json.
"""
import copy
import json

import pm_executor_event_semantics as sem


def seed_document(case, family, shapes):
    """The named valid seed as one document the frozen changes apply to."""
    kind, name = case['seed']['kind'], case['seed'].get('name')
    if kind == 'capture':
        if name == 'baseline':
            return copy.deepcopy(family['baseline'])
        source = next(row for row in family['cases'] if row['case'] == name)
        return sem.mutate(family['baseline'], source['changes'])
    if kind == 'history':
        source = next(row for row in family['history_cases'] if row['case'] == name)
        return {'original': sem.mutate(family['baseline'], source['original_changes']),
                'payload': {**copy.deepcopy(family['baseline']['payload']), **source['event_changes']},
                'retained_source_sha256': source.get('retained_source_sha256', family['retained_source_sha256']),
                'disclosure': copy.deepcopy(source['disclosure'])}
    if kind == 'shape':
        return copy.deepcopy(next(row for row in shapes if row['case'] == name))
    if kind == 'trace':
        return copy.deepcopy(next(row for row in family['traces'] if row['case'] == name))
    if kind == 'literal':
        return copy.deepcopy(case['seed']['value'])
    raise RuntimeError('unknown p2a seed kind ' + kind)


def action(case, contract, family, shapes, existing, root):
    """A zero-argument callable running the witness through the complete checker route it names."""
    from pm_executor_event_contracts import validate, identity, contract_integrity, identity_replay_facts
    import pm_executor_schema_refs as refs
    route = case['route']
    document = sem.mutate(seed_document(case, family, shapes), case.get('changes', []))
    mutated = sem.mutate(contract, case.get('contract_changes', []))
    if route == 'capture':
        return lambda: sem.validate_capture(mutated, document['payload'], document['capture'])
    if route == 'history':
        return lambda: sem.validate_history(mutated, document['payload'], document['original'],
                                            document['retained_source_sha256'], document['disclosure'])
    if route == 'shape':
        return lambda: validate(mutated, document['payload'], document['context'])
    if route == 'trace':
        return lambda: sem.run_trace(mutated, family['baseline']['payload'], document)
    if route == 'helper':
        return lambda: sem.run_helper_case(document)
    if route == 'canonical':
        return lambda: sem.canonical(json.loads(document['json']))
    if route == 'numeric':
        return lambda: sem.run_numeric_case(mutated, family['baseline'], document)
    if route == 'type_route':
        return lambda: sem.type_case_specimens(family, shapes, document)
    if route == 'identity':
        return lambda: identity(mutated, document['payload'], document['storage_instance_id'])
    if route == 'identity_replay':
        def replay():
            facts = identity_replay_facts(mutated, copy.deepcopy(document['payload']))
            sem.refuse('identity_replay', {k: facts[k] for k in ('identity', 'sequence_changed_identity')})
            return True
        return replay
    if route == 'contract_integrity':
        cases = [row for row in shapes if row['event_type'] == contract['event_type']]
        cases = [row for row in cases if row['expected'] in document.get('keep_expected', ['accept', 'reject'])]
        registry = set(existing) | set(document.get('admitted', []))
        return lambda: contract_integrity(mutated, registry, cases)
    if route == 'stock_schema':
        return lambda: sem.stock_schema_validate(contract['schema_ref'], document['payload'])
    if route == 'schema':
        # The strict payload-schema boundary with the explicitly registered CV-1101 date-time predicate.
        return lambda: sem.schema_validate(contract['schema_ref'], document['payload'])
    if route == 'score':
        return lambda: sem.validate_score_domain(document['ready_nodes'], document['selected_nodes'])
    if route == 'schema_document':
        return lambda: refs.check_document(document['schema'])
    if route == 'schema_reference':
        return lambda: refs.check_references(document['schema'], contract['schema_ref'])
    if route == 'integrity_closure':
        return lambda: sem.check_family_closure(document['fixture_families'], document['contract_families'])
    if route == 'integrity_type_case':
        return lambda: sem.check_type_case(document)
    if route == 'integrity_capture_seed':
        return lambda: sem.check_capture_seed(family, document)
    if route == 'integrity_disclosure_seed':
        return lambda: sem.check_disclosure_seed(document)
    if route == 'integrity_shape_seed':
        return lambda: sem.check_shape_seed(document)
    if route == 'integrity_numeric':
        return lambda: sem.numeric_case(mutated, family['baseline'], document)
    if route == 'integrity_contract_set':
        return lambda: sem.check_contract_set(document['event_types'])
    if route == 'integrity_table_order':
        return lambda: sem.check_table_order_text(document['phase'], document['swap'])
    raise RuntimeError('unknown p2a route ' + route)


def witnesses(doc, contracts, families, shapes_all, existing, root):
    """(pair id, family, expected, action, kind) for the suite builder."""
    for case in doc['cases']:
        name = case['family']
        if name not in contracts:
            continue
        shapes = [row for row in shapes_all if row['event_type'] == name]
        kind = ('trace' if 'expected_outputs' in case else
                'integrity' if case['route'].startswith(('integrity', 'contract_integrity')) else 'product')
        expected = case['expected_outputs'] if kind == 'trace' else case['expected']
        yield ('p2a/' + case['id'], name, expected, action(case, contracts[name], families[name], shapes, existing, root), kind)


def run(doc, contracts, families, shapes_all, existing, root):
    """Run every witness for the selected families; failures name the case and what happened."""
    failures, count = [], 0
    for case in doc['cases']:
        if case['family'] not in contracts:
            continue
        count += 1
        name = case['family']
        shapes = [row for row in shapes_all if row['event_type'] == name]
        call = action(case, contracts[name], families[name], shapes, existing, root)
        if 'expected_outputs' in case:
            try:
                outputs = call()
            except sem.TableRefusal as error:
                failures.append(['p2a', case['id'], 'refused', error.row])
                continue
            if outputs != case['expected_outputs']:
                failures.append(['p2a', case['id'], outputs])
            continue
        try:
            call()
            found = None
        except sem.TableRefusal as error:
            found = error.row
        expected_row = case.get('row') if case['expected'] == 'reject' else None
        if found != expected_row:
            failures.append(['p2a', case['id'], case['expected'], expected_row, found])
    return failures, count
