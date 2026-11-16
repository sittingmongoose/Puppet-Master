#!/usr/bin/env python3
"""W4 successor qualification, separate from unfinished original-path closure.

Default exit 2 deliberately preserves the whole-corpus completion requirement.
--qualify-only checks only the explicit older scoped-routing repair. Neither
schema specimens nor these setup probes count as original D06 path oracles.
"""
from __future__ import annotations

import argparse
import copy
import json
import tempfile
from pathlib import Path

from pm_goal_own_c_oracles import Suite, equal, require
from pm_goal_own_c3_w34b_roots import ROOT, W4Roots, pinned, sha, check_binding


def qualified_roots(roots):
    results = []
    require('w4/complete_method_roster', [r['method'] for r in roots.selection['methods']] == list(roots.method_definitions))
    for entry in roots.selection['methods']:
        require('w4/method_selection', entry['selection'] == 'Plans/goal_run_cancelled_w4_contracts/selection.v1.json')
        require('w4/method_routing', entry['routing'] == 'Plans/goal_run_cancelled_w4_contracts/routing.v1.json')
        method = entry['complete_method']
        require('w4/method_identity', entry['method'] == method['method'])
        require('w4/method_contract', equal(method, roots.method_definitions[entry['method']]))
        boundaries = [(key, 'native_consumer', method[key]['$ref'])
                      for key in ('request_schema', 'success_schema', 'unavailable_schema')]
        boundaries.extend(('private/' + str(i), row['realm'], row['schema']['$ref'])
                          for i, row in enumerate(method['private_arguments']))
        for role, realm, reference in boundaries:
            destination, result = roots.resolve(realm, reference)
            results.append(dict(method=method['method'], role=role, realm=realm,
                                ref=reference, resolved_realm=destination,
                                resolved_base=result.resolver._base_uri))
    return results


def route_variant(roots, mutate, selection_mutate=lambda selection: None):
    """Coherent mutations of NEW selection metadata only, never original pins.

    Recommit the newly authored route in the test-only selection copy so each
    setup negative reaches its own predicate instead of a stale route digest.
    The canonical files and every original manifest/hash remain unchanged.
    """
    route, selection = copy.deepcopy(roots.route), copy.deepcopy(roots.selection)
    mutate(route)
    selection_mutate(selection)
    with tempfile.TemporaryDirectory(prefix='pm-w4-routing-') as temporary:
        path = Path(temporary) / 'routing.json'
        path.write_text(json.dumps(route, indent=2) + '\n')
        selection['routing'] = dict(path=str(path), sha256=sha(path.read_bytes()))
        return W4Roots(selection=selection, routing=route)


def projection_variant(roots, mutate, mismatch=False):
    """Copied newly authored selection files; every original remains untouched."""
    selection = copy.deepcopy(roots.selection)
    physical = pinned(selection['projection_selection'])
    resources = pinned(selection['projection_resources'])
    schema = pinned(resources['successor_resource'])
    with tempfile.TemporaryDirectory(prefix='pm-w4-successor-') as temporary:
        folder = Path(temporary)
        mutate(physical, resources, schema)
        def write(name, value):
            path = folder / name
            path.write_text(json.dumps(value, indent=2) + '\n')
            return dict(path=str(path), sha256=sha(path.read_bytes()))
        # Keep every new physical/resource copy coherent. None of these are
        # original banks or original source hashes.
        schema_pin = dict(write('new-schema.json', schema), retrieval_uri=resources['successor_resource']['retrieval_uri'])
        resources['successor_resource'] = copy.deepcopy(schema_pin)
        physical['new_whole_schema'] = copy.deepcopy(schema_pin)
        if mismatch:
            physical['new_whole_schema']['retrieval_uri'] = 'https://puppetmaster.invalid/substituted-selection'
        selection['projection_selection'] = write('physical.json', physical)
        selection['projection_resources'] = write('resources.json', resources)
        return W4Roots(selection=selection)


def predecessor_pin_variant(roots):
    """One incorrect original-file hash, coherent in ALL authored copies."""
    selection, route = copy.deepcopy(roots.selection), copy.deepcopy(roots.route)
    resources = pinned(selection['projection_resources'])
    selection['predecessor']['sha256'] = route['predecessor']['sha256'] = resources['original_bank_sha256'] = '0' * 64
    with tempfile.TemporaryDirectory(prefix='pm-w4-predecessor-') as temporary:
        for key, value in [('routing', route), ('projection_resources', resources)]:
            path = Path(temporary) / (key + '.json')
            path.write_text(json.dumps(value, indent=2) + '\n')
            selection[key] = dict(path=str(path), sha256=sha(path.read_bytes()))
        return W4Roots(selection=selection, routing=route)


def qualify():
    roots = W4Roots()
    suite = Suite()
    suite.case('routing/all_whole_realms_eager', lambda: require('qualification/eager',
        all(row['unresolved'] == 0 for row in roots.audit_rows)))
    methods = qualified_roots(roots)
    suite.case('routing/all_method_boundaries', lambda: require('qualification/methods', len(methods) == 37))
    suite.case('routing/exact_occurrence_census', lambda: require('qualification/occurrences',
        len(roots.edges) == 22 and len({r['schema_location'] for r in roots.edges}) == 11))
    target = roots.route['absolute_target_uri']
    destination = roots.route['target_realm']
    original = pinned(roots.selection['predecessor'])
    for alias in roots.route['source_retrieval_aliases']:
        source = roots.documents['native_consumer'][alias]
        resolver = roots.registries['native_consumer'].resolver(alias)
        # Match the source resource's explicit original $id, never a guessed base.
        from referencing import Resource
        from referencing.jsonschema import DRAFT202012
        resolver = resolver.in_subresource(Resource.from_contents(source, default_specification=DRAFT202012))
        from pm_goal_own_c3_w34b_roots import pointer
        for site in roots.route['sites']:
            node = pointer(source, site['schema_location'].rsplit('/', 1)[0])
            name = 'routing/edge/' + str(roots.route['source_retrieval_aliases'].index(alias)) + site['schema_location']
            def edge(node=node, resolver=resolver, site=site):
                realm, result = roots.lookup('native_consumer', resolver, site['literal_reference'], node)
                require('qualification/target_realm', realm == destination)
                require('qualification/target_whole', result.resolver._registry == roots.registries[destination])
                expected = roots.registries[destination].resolver().lookup(target + '#' + site['literal_reference'].split('#')[1])
                require('qualification/target_definition', equal(result.contents, expected.contents))
            suite.case(name, edge)
            suite.case(name + '/alternate_literal',
                lambda resolver=resolver, node=node, site=site: roots.lookup('native_consumer', resolver,
                    target + '#' + site['literal_reference'].split('#')[1], node), 'w4/route_reference')
        suite.case('routing/unlisted_source/' + str(roots.route['source_retrieval_aliases'].index(alias)),
            lambda resolver=resolver: roots.lookup('native_consumer', resolver,
                'inputs/Plans/plans_to_code_handoff.schema.json#/$defs/worknode_completion_receipt',
                {'$ref': 'inputs/Plans/plans_to_code_handoff.schema.json#/$defs/worknode_completion_receipt'}), 'w4/route_source')
        suite.case('routing/unlisted_location/' + str(roots.route['source_retrieval_aliases'].index(alias)),
            lambda resolver=resolver, source=source: roots.lookup('native_consumer', resolver,
                'inputs/Plans/plans_to_code_handoff.schema.json#/$defs/worknode_completion_receipt', source), 'w4/route_location')
    # The URI exists with different whole bytes in current and retained realms.
    # This is the positive/negative control for accidental ambient bank merging.
    common = 'https://puppetmaster.local/schemas/plans_to_code_handoff.schema.json'
    suite.case('routing/nested_realm_isolation', lambda: require('qualification/isolation',
        roots.origins['native_consumer'][common][1] != roots.origins[destination][common][1]))
    suite.case('routing/no_network', lambda: route_variant(roots, lambda r: r.__setitem__('network_fallback', True)), 'w4/no_network')
    suite.case('routing/no_merge', lambda: route_variant(roots, lambda r: r.__setitem__('whole_bank_merge', True)), 'w4/no_merge')
    suite.case('routing/predecessor_selection', lambda: route_variant(roots,
        lambda r: r['predecessor'].__setitem__('path', 'substituted')), 'w4/predecessor_selection')
    suite.case('routing/retained_realm_selection', lambda: route_variant(roots,
        lambda r: r['target_realm_selection'].__setitem__('realm', 'substituted')), 'w4/retained_realm_selection')
    suite.case('routing/target_whole_binding', lambda: route_variant(roots,
        lambda r: r['target_whole'].__setitem__('sha256', '0' * 64)), 'w4/target_binding')
    suite.case('routing/projection_predecessor', lambda: projection_variant(roots,
        lambda physical, resources, schema: resources.__setitem__('original_bank_sha256', '0' * 64)), 'w4/projection_predecessor')
    suite.case('routing/projection_resource_selection', lambda: projection_variant(roots,
        lambda physical, resources, schema: None, mismatch=True), 'w4/projection_resource_selection')
    origin = roots.origins['native_consumer'][common]
    locations = pinned(roots.selection['whole_resource_locations'])
    path = locations.get(origin[0] + '@' + origin[1], origin[0])
    raw = (ROOT / path).read_bytes()
    require('qualification/original_binding_bytes', sha(raw) == origin[1])
    # An exact relocated file remains valid. A byte-distinct, parsed-equal
    # whole JSON document cannot rebind the URI. This direct registration
    # component has no unrelated dangling-reference defect after rebinding.
    suite.case('routing/relocated_exact_whole_resource',
        lambda: check_binding(origin, ('relocated-exact-whole.json', origin[1], origin[2])))
    suite.case('routing/no_resource_rebinding',
        lambda: check_binding(origin, ('byte-distinct-whole.json', sha(raw + b'\n'), origin[2])), 'w4/no_rebinding/hash')
    alternate_pointer = '/$defs/' + next(iter(json.loads(raw)['$defs']))
    suite.case('routing/no_pointer_rebinding',
        lambda: check_binding(origin, (origin[0], origin[1], alternate_pointer)), 'w4/no_rebinding/pointer')
    for keyword, value in [('$dynamicRef', '#missing'), ('$recursiveRef', '#missing'),
                           ('$dynamicAnchor', 'unused'), ('$recursiveAnchor', True)]:
        suite.case('routing/unused_dynamic_keyword/' + keyword,
            lambda k=keyword, v=value: projection_variant(roots,
                lambda physical, resources, schema: schema['$defs'].__setitem__('UnusedInvalid', {k: v})),
            'w4/no_unsupported_dynamic_reference')
    suite.case('routing/unused_dangling_reference', lambda: projection_variant(roots,
        lambda physical, resources, schema: schema['$defs'].__setitem__('UnusedInvalid', {'$ref': 'https://puppetmaster.invalid/unavailable'})),
        'w4/unresolved_reference')
    suite.case('routing/source_alias_census', lambda: route_variant(roots,
        lambda r: r['source_retrieval_aliases'].pop()), 'w4/route_source_aliases')
    suite.case('routing/literal_declaration', lambda: route_variant(roots,
        lambda r: r['sites'][0].__setitem__('literal_reference', target + '#/$defs/worknode_completion_receipt')), 'w4/route_literal')
    # Remove one declaration; eager qualification must still visit that inactive
    # site and refuse, rather than silently skipping it as an unused definition.
    suite.case('routing/missing_inactive_location', lambda: route_variant(roots,
        lambda r: r['sites'].pop()), 'w4/route_location')
    stale = copy.deepcopy(roots.route)
    stale['schema_id'] = 'substituted-unselected-edition'
    suite.case('routing/stale_new_route_commitment', lambda: W4Roots(selection=roots.selection, routing=stale), 'w4/route_commitment')
    # Change both authored predecessor copies, so the immutable original-byte
    # check, rather than disagreement between the copies, owns the failure.
    suite.case('routing/substituted_predecessor_pin', lambda: predecessor_pin_variant(roots),
        'w4/whole_hash/' + roots.selection['predecessor']['path'])
    suite.case('routing/predecessor_bytes_unchanged', lambda: require('qualification/predecessor',
        equal(pinned(roots.selection['predecessor']), original)))
    for field, guard in [('selection', 'w4/method_selection'), ('routing', 'w4/method_routing'),
                         ('complete_method', 'w4/method_identity')]:
        candidate = copy.copy(roots)
        candidate.selection = copy.deepcopy(roots.selection)
        if field == 'complete_method':
            candidate.selection['methods'][0][field]['method'] = 'substituted'
        else:
            candidate.selection['methods'][0][field] = 'substituted'
        suite.case('routing/method/' + field, lambda c=candidate: qualified_roots(c), guard)
    candidate = copy.copy(roots)
    candidate.selection = copy.deepcopy(roots.selection)
    # Replace one six-boundary method with another genuine six-boundary
    # method, keeping signatures and the total boundary count coherent.
    candidate.selection['methods'][2] = copy.deepcopy(candidate.selection['methods'][3])
    suite.case('routing/method/substituted_roster', lambda: qualified_roots(candidate), 'w4/complete_method_roster')
    candidate = copy.copy(roots)
    candidate.selection = copy.deepcopy(roots.selection)
    candidate.selection['methods'][0]['complete_method']['success_schema']['$ref'] = roots.selection['methods'][1]['complete_method']['success_schema']['$ref']
    suite.case('routing/method/substituted_signature', lambda: qualified_roots(candidate), 'w4/method_contract')
    for field, guard in [('network_fallback', 'w4/no_network'), ('whole_bank_merge', 'w4/no_merge')]:
        for index, value in enumerate(('false', 0, None, [], {})):
            suite.case('routing/type/' + field + '/' + str(index),
                lambda f=field, v=value: route_variant(roots, lambda r: r.__setitem__(f, v)), guard)
    return roots, methods, suite


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--qualify-only', action='store_true')
    args = parser.parse_args()
    roots, methods, suite = qualify()
    result = dict(status='FAIL' if suite.failures else 'QUALIFIED_SCHEMA_ROUTING_ONLY',
        whole_root_closure={'goal_run.cancelled': 'NOT_COMPLETE_ORIGINAL_CORPUS_NOT_EXECUTED'},
        original_path_oracles=dict(positive=0, negative=0),
        qualification_checks=dict(positive=sum(r['valid'] for r in suite.rows),
                                  negative=sum(not r['valid'] for r in suite.rows)),
        bank_audits=roots.audit_rows, exact_cross_realm_occurrences=roots.edges,
        method_boundaries=methods, cases=suite.rows, failures=suite.failures,
        guard_negative_map={guard: [r['id'] for r in suite.rows if r['expected_guard'] == guard]
                            for guard in sorted({r['expected_guard'] for r in suite.rows if r['expected_guard']})},
        guard_isolation='Setup/qualification guard inventory only; no local removal engine. Shared guard-isolation sweep remains required.',
        native_execution='NOT_RUN', completion='NOT_COMPLETE_NO_PROVEN_UNFILLABLE_BLOCKER')
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({key: result[key] for key in ('status', 'whole_root_closure', 'original_path_oracles', 'qualification_checks', 'failures')}))
    return 1 if suite.failures else (0 if args.qualify_only else 2)


if __name__ == '__main__':
    raise SystemExit(main())
