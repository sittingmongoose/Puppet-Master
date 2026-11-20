#!/usr/bin/env python3
"""Check DF application-root implications for otherwise unvisited scope else clauses.

Reads, pins and preserves the raw inventory and raw failure counts. It checks
the exact application scope-constant implication and the declared nullable
post-manifest body root. Every other gap stays open. Implications earn zero
mutation credit; the one schema witness earns no gated/whole-lifecycle credit.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re

import pm_filesafe_c12_closure as X


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def application_else_implication(local, shared, item):
    names = re.findall(r'#/\$defs/([^/]+)/properties/scope/allOf/0/', item['route'])
    if not (item['schema'] == 'Plans/shared_integration_runtime.schema.json'
            and item['pointer'].startswith('/$defs/WorkflowScopeV2/allOf/0/else')
            and local['$id'] in item['route'] and len(names) == 1):
        return None
    name = names[0]
    declared = local['$defs'][name]['properties']['scope']['allOf'][1]['properties']['scope_kind']
    condition = shared['$defs']['WorkflowScopeV2']['allOf'][0]['if']
    if declared != {'const': 'application'} or condition != {'properties': {'scope_kind': {'const': 'application'}}}:
        return None
    return name


def post_manifest_null_witness(local, registry, graph, item):
    root = '#/$defs/application_records/properties/post_restore_manifest'
    if not (graph['event_type'] == 'safe_point.restored'
            and graph['application_body_roots'].get('post_restore_manifest') == root
            and item['phase'] == 'app_body_schema' and item['keyword'] == 'type'
            and item['schema'] == 'Plans/filesafe_event_sources/safe_point_restored.schema.json'
            and item['pointer'] == root[1:] + '/anyOf/1'
            and item['route'] == '/$ref:' + local['$id'] + root + '/anyOf/1'):
        return None
    node = local['$defs']['application_records']['properties']['post_restore_manifest']['anyOf'][1]
    assert node == {'type': 'null'} and X.digest(node) == item['node_sha256']
    validator = X.SG.SlotValidator({'$ref': local['$id'] + root}, registry=registry,
                                    format_checker=X.SG.format_checker())
    phase = 'app_body_schema'
    mutant = 'c12-not-a-post-manifest'
    assert X.T.codes(phase, X.C.schema_facts(validator, None)) == []
    found = X.errors(validator, mutant)
    assert X.expected_error(found, node, 'type', ())
    expected = ['application_body_schema']
    assert X.T.codes(phase, X.C.schema_facts(X.fresh(validator), mutant)) == expected
    saved = node.pop('type')
    try:
        clause_cut_accepts = not X.T.codes(phase, X.C.schema_facts(X.fresh(validator), mutant))
    finally:
        node['type'] = saved
    restored = X.T.codes(phase, X.C.schema_facts(X.fresh(validator), mutant))
    assert clause_cut_accepts and restored == expected and X.expected_error(X.errors(validator, mutant), node, 'type', ())
    entries = X.T.rows(phase)
    X.T._ROWS[phase] = [(name, lambda value, context: None, context) for name, predicate, context in entries]
    try:
        row_cut_accepts = not X.T.codes(phase, X.C.schema_facts(X.fresh(validator), mutant))
    finally:
        X.T._ROWS[phase] = entries
    assert row_cut_accepts and X.T.codes(phase, X.C.schema_facts(X.fresh(validator), mutant)) == expected
    return dict(kind='post_manifest_null_schema_witness', clause=item,
                control=None, control_sha256=X.digest(None), mutant=mutant, mutant_sha256=X.digest(mutant),
                expected_code=expected[0], actual=restored, clause_cut_accepts=clause_cut_accepts,
                row_cut_accepts=row_cut_accepts, restored_exact_refusal=True,
                scope='original declared complete body schema; zero whole-lifecycle or gated-row credit')


def check(family, directory):
    inventory = directory / (family + '.definition-inventory.json')
    gaps = directory / (family + '.uncovered-clauses.json')
    summary_path = directory / (family + '.schema-summary.json')
    summary = json.loads(summary_path.read_text())
    graph, documents, registry = X.SG.context(family)
    for resource in graph['resources'] + graph['preserved_project_resources']:
        assert sha(X.ROOT / resource['path']) == resource['sha256'], resource['path']
    local_path = f'Plans/filesafe_event_sources/{family.replace(".", "_")}.schema.json'
    local = documents[local_path]
    shared_path = 'Plans/shared_integration_runtime.schema.json'
    shared = documents[shared_path]
    branch = shared['$defs']['WorkflowScopeV2']['allOf'][0]
    proofs, remaining = [], []
    raw_gaps = json.loads(gaps.read_text())
    assert raw_gaps == [r for r in json.loads(inventory.read_text()) if not r['covered']]
    assert summary['failures'] == len(raw_gaps) + summary['covering']
    for item in raw_gaps:
        name = application_else_implication(local, shared, item)
        if name is None:
            witness = post_manifest_null_witness(local, registry, graph, item)
            if witness is not None:
                proofs.append(witness)
                continue
            remaining.append(item)
            continue
        declared = local['$defs'][name]['properties']['scope']['allOf'][1]['properties']['scope_kind']
        condition = branch['if']['properties']['scope_kind']
        node = shared
        for token in item['pointer'].strip('/').split('/'):
            token = token.replace('~1', '/').replace('~0', '~')
            node = node[int(token)] if isinstance(node, list) else node[token]
        assert X.digest(node[item['keyword']]) == item['constraint_sha256']
        assert X.digest(node) == item['node_sha256']
        proofs.append(dict(kind='application_scope_else', clause=item, implication='scope_kind is application or absent under the selected allOf const; in either case if/properties/const application succeeds, so else cannot execute at this root',
                           selector_path=local_path, selector_pointer=f'/$defs/{name}/properties/scope/allOf/1/properties/scope_kind',
                           selector=declared, selector_source_sha256=sha(X.ROOT / local_path),
                           condition_pointer='/$defs/WorkflowScopeV2/allOf/0/if/properties/scope_kind',
                           condition=condition, condition_source_sha256=sha(X.ROOT / shared_path)))
    result = dict(family=family, status='PASS' if not remaining and summary['covering'] == 0 else 'FAIL',
                  inventory_sha256=sha(inventory), raw_gaps_sha256=sha(gaps), raw_summary_sha256=sha(summary_path),
                  raw_failures=summary['failures'], proofs=proofs, remaining=remaining,
                  mutation_credit=sum(p['kind'] == 'post_manifest_null_schema_witness' for p in proofs), gated_row_credit=0)
    X.write(directory / (family + '.coverage-completion.json'), result)
    print(dict(family=family, status=result['status'],
               implications=sum(p['kind'] == 'application_scope_else' for p in proofs),
               schema_witnesses=result['mutation_credit'], remaining=len(remaining)), flush=True)
    return result['status'] == 'PASS'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family', choices=X.A.FAMILIES, action='append', required=True)
    parser.add_argument('--evidence', type=Path, required=True)
    args = parser.parse_args()
    return int(not all([check(family, args.evidence) for family in args.family]))


if __name__ == '__main__':
    raise SystemExit(main())
