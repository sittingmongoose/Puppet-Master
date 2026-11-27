"""Bind cancellation candidate assertions to their registered complete sources."""

from collections import defaultdict
import hashlib
import json
from pathlib import Path
from urllib.parse import urljoin

from pm_goal_dg5_methodb_stage3 import each_error, errors_list, require
from pm_goal_dg5_projection_examples import exact_message_digest, related_projection_rules


def registered_payload_nodes(plain, bank, ids, original_source):
    """Preserve the exact inventory locations of the producer and payload imports."""
    manifest_path = Path(original_source) / 'Plans/goal_workflow_cancel_schema_resources.json'
    manifest = json.loads(manifest_path.read_bytes())
    imports = ('/goal_run_cancelled.v3.schema.json', '/producer-submission.schema.json',
               '/workflow_cancel_producer_submission.v1.schema.json')

    def registrations(obj):
        if isinstance(obj, dict):
            if 'complete_document_sha256' in obj and 'retrieval_uri' in obj:
                yield obj
            for value in obj.values():
                yield from registrations(value)
        elif isinstance(obj, list):
            for value in obj:
                yield from registrations(value)

    registered = list(registrations(manifest))
    sources = defaultdict(dict)
    for location in {rule.rsplit('/', 1)[0] for rule in ids}:
        uri, pointer = location.split('#', 1)
        if not uri.endswith(imports):
            continue
        pins = {(v['path'], v['complete_document_sha256']) for v in registered if v['retrieval_uri']==uri}
        pin, = pins
        previous = sources[pin].setdefault(pointer, location)
        require(previous == location, f'the cited source has two assertions at {pointer}')
    require(len(sources) == 2, 'the literal producer and payload imports are required')

    result = {}
    registries = (plain._resolver._registry, *bank.registries.values())
    for (path, digest), locations in sources.items():
        raw = (Path(original_source) / path).read_bytes()
        require(hashlib.sha256(raw).hexdigest() == digest, 'registered whole schema bytes changed')
        payload = json.loads(raw)
        serialized = json.dumps(payload, separators=(',', ':'))
        aliases = {v['retrieval_uri'] for v in registered
                   if (v['path'], v['complete_document_sha256']) == (path, digest)}
        require(len(aliases) == 2 and any(urljoin(uri, payload['$id']) in aliases - {uri} for uri in aliases),
                'the import address and its declared schema scope changed')

        def record(node, pointer):
            if isinstance(node, dict):
                if pointer in locations:
                    result[id(node)] = locations[pointer]
                for name, child in node.items():
                    record(child, pointer + '/' + name.replace('~', '~0').replace('/', '~1'))
            elif isinstance(node, list):
                for number, child in enumerate(node):
                    record(child, pointer + f'/{number}')

        for registry in registries:
            for uri in sorted(aliases):
                if uri in registry:
                    node = registry[uri].contents
                    require(json.dumps(node, separators=(',', ':')) == serialized,
                            'the installed import differs from its registered whole schema')
                    record(node, '')
        require(set(locations.values()) <= set(result.values()), 'a literal source location was lost')
    return result


def inventory(plain, bank, root, ids, source):
    """Walk the owner's reference handlers with the registered source locations."""
    import pm_goal_dg5_closure as closure

    locations = {}
    registries = (plain._resolver._registry, *bank.registries.values())
    source_locations = {rule.rsplit('/', 1)[0] for rule in ids}
    from referencing.exceptions import Unresolvable
    for location in sorted(source_locations):
        for registry in registries:
            try:
                node = registry.resolver().lookup(location).contents
            except Unresolvable:
                continue
            previous = locations.setdefault(id(node), location)
            require(previous == location, f'{location}: registered rule location is ambiguous')

    def record(node, path):
        if isinstance(node, dict):
            locations.setdefault(id(node), path)
            for name, child in node.items():
                record(child, path + '/' + name.replace('~', '~0').replace('/', '~1'))
        elif isinstance(node, list):
            for offset, child in enumerate(node):
                record(child, path + f'/{offset}')

    preferred = {location.split('#', 1)[0] for location in source_locations}
    for uri in sorted(preferred):
        for registry in registries:
            if uri in registry:
                record(registry[uri].contents, uri + '#')
    for registry in registries:
        for uri in sorted(registry):
            if 'puppetmaster.local' in uri or uri.startswith('file:'):
                record(registry[uri].contents, uri + '#')
    locations.update(registered_payload_nodes(plain, bank, ids, source))
    nodes, walked = closure._scoped_census(plain, root, bank, lambda _, node: locations.get(id(node)))
    return nodes, walked, locations


def candidate_implication(plain, guarded, nodes, name, cut, peers):
    import pm_goal_dg5_closure as closure
    import pm_goal_go_schema_closure as go

    location, keyword = name.rsplit('/', 1)
    node = nodes[location]['node']
    if keyword == 'type' and location.endswith('/event_payload'):
        condition = node['allOf'][0]
        covering = location + '/allOf/0/then/not'
        require(node[keyword] == 'object' and set(condition['if']) == {'properties', 'required'}
                and condition['then']['not'] == {'required': ['rollback_refs']}
                and go.locations(cut) == {covering},
                'the non-object must still be refused by the original negated requirement')
        return dict(source=covering,
                    premise='The conditional and required rules ignore non-objects, so the negation refuses them.')
    if peers:
        require(name not in peers and go.locations(cut) & set(peers),
                'the separate rule must still refuse at the cited source')
        return related_projection_rules(plain, nodes, name, peers, go, closure, require)
    proof = go.pinned_proof(nodes[location], nodes, guarded, keyword)
    require(proof and proof['cls'] in ('UNREACHABLE', 'COVERED_BY_CONST'),
            f'{name}: no checked reason for the remaining refusal')
    return dict(source=location, premise=proof['proof'])


def trial(plain, guarded, nodes, name, example, accepted, disabled_check):
    import pm_goal_dg5_closure as closure
    import pm_goal_go_schema_closure as go

    invalid = example['document']
    guard = closure._guard_for_location(name)
    before = go.errors_of(guarded, invalid)
    disabled = go.errors_of(guarded, invalid, () if disabled_check == 'rule' else {guard})
    restored = go.errors_of(guarded, invalid)
    actual, switched = errors_list(before), errors_list(disabled)
    require(actual == errors_list(list(plain.iter_errors(invalid))) == errors_list(restored)
            and actual != switched
            and exact_message_digest(actual) == example['before_sha256']
            and exact_message_digest(switched) == example['disabled_sha256'],
            f'{name}: the original, disabled or restored validation messages changed')
    evidence = dict(control=accepted, invalid=invalid, before=actual, cut=switched,
                    restored=errors_list(restored), source=name)
    if example.get('selector'):
        location, word = name.rsplit('/', 1)
        require(('/if/' in name and word in ('const', 'required')) or name.endswith('/not/required'),
                'expected a literal branch selector')
        context = 'if' if '/if/' in name else 'not'
        require(any(any(entry[0] == context for entry in reach['ctx'])
                    for reach in nodes[location]['reach']), 'the selected rule no longer reaches the branch')
        return dict(evidence, cls='SELECTOR_OR_NEGATED')
    require(any(getattr(error, 'oracle_guard', None) == guard and list(error.absolute_path) == example['path']
                for error in each_error(before))
            and all(getattr(error, 'oracle_guard', None) != guard for error in each_error(disabled)),
            f'{name}: the selected message did not disappear')
    if not disabled:
        return dict(evidence, cls='KILLED')
    proof = candidate_implication(plain, guarded, nodes, name, disabled, example.get('related', []))
    return dict(evidence, cls='COVERED_LATER', implication=proof)
