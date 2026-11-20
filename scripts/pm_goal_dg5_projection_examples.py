"""Validate fixed examples against the cancellation projection rules."""

import hashlib
import json


def exact_message_digest(messages):
    return hashlib.sha256(json.dumps(messages, ensure_ascii=True, separators=(',', ':')).encode()).hexdigest()


def implies(plain, keyword, node, peer_keyword, peer, go):
    if keyword == peer_keyword and keyword in (
            'type', 'const', 'enum', 'pattern', 'format', 'minLength', 'maxLength'):
        if go.value_key(node[keyword]) == go.value_key(peer[keyword]):
            return 'The other rule uses the same validation keyword and expected value.'
    if keyword in ('type', 'enum', 'pattern') and peer_keyword in ('const', 'enum'):
        values = [peer['const']] if peer_keyword == 'const' else peer['enum']
        check = plain.evolve(schema={keyword: node[keyword]})
        if all(not list(check.iter_errors(value)) for value in values):
            return 'Every value permitted by the other rule passes this assertion.'
    if keyword == peer_keyword == 'required' and set(node[keyword]) <= set(peer[peer_keyword]):
        return 'The other rule requires every member named here.'
    closure = {'additionalProperties', 'unevaluatedProperties'}
    if node is peer and {keyword, peer_keyword} == closure and node[keyword] is node[peer_keyword] is False:
        if not {'$ref', 'allOf', 'anyOf', 'oneOf', 'if', 'dependentSchemas', 'patternProperties'} & node.keys():
            return 'Both rules permit exactly the same named properties of this object.'
    if keyword == 'minLength' and node[keyword] == 1 and peer_keyword == 'format' and peer[peer_keyword] == 'date-time':
        from pm_goal_own_c_oracles import utc

        if plain.format_checker.checkers['date-time'][0] is utc and not utc('') and utc('2026-11-05T09:00:00Z'):
            return 'The installed full UTC time match requires at least one character.'


def related_projection_rules(plain, nodes, name, peers, go, closure, require):
    location, label = name.rsplit('/', 1)
    info = nodes[location]
    node = info['node']
    keyword, = [word for word in go.clauses_of(node) if closure.clause_name(node, word) == label]
    supported = []
    for reach in info['reach']:
        applicable = []
        scope = go.scope_of(reach, nodes)
        for source in peers:
            place, suffix = source.rsplit('/', 1)
            other = nodes[place]
            other_word, = [word for word in go.clauses_of(other['node'])
                           if closure.clause_name(other['node'], word) == suffix]
            if any(r['ipath'] == reach['ipath'] and go.applies(r, scope) for r in other['reach']):
                reason = implies(plain, keyword, node, other_word, other['node'], go)
                if reason:
                    applicable.append(dict(source=source, premise=reason))
        require(applicable, f'{name}: some reached branch lacks a separate validation rule')
        supported.append(dict(path=list(reach['ipath']), checks=applicable))
    return supported


def special_projection_rule(nodes, name, cut, validator, go, require):
    location, keyword = name.rsplit('/', 1)
    item = nodes[location]
    node = item['node']
    if location.endswith('/event_payload') and keyword == 'type':
        first, _ = node['allOf']
        condition = first['if']
        closing = first['then']['not']
        source = location + '/allOf/0/then/not'
        require(node[keyword] == 'object' and set(condition) == {'properties', 'required'}
                and closing == {'required': ['rollback_refs']} and source in go.locations(cut),
                'the cancelled payload must still refuse a non-object under the original negated requirement')
        return dict(source=source, premise='The conditional and required rules ignore non-objects, so the negation refuses them.')
    proof = go.pinned_proof(item, nodes, validator, keyword)
    require(proof and proof['cls'] == 'UNREACHABLE',
            f'{name}: the original typed projection must rule out this branch')
    return dict(source=location, premise=proof['proof'])


def storage_projection_width(plain, nodes, name, path, cut, go, require):
    from pm_goal_own_c_oracles import exact_pattern, uuid_string

    source, word = name.rsplit('/', 1)
    node = nodes[source]['node']
    if source.endswith('/properties/storage_instance_id'):
        identity = source.endswith('#/$defs/EventIdentity/properties/storage_instance_id')
        require(path == (['event_identity', 'storage_instance_id'] if identity else ['storage_instance_id'])
                and (identity or source.endswith('#/$defs/StorageProjection/properties/storage_instance_id')),
                'the stored projection UUID has a different source')
        grammar = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'
        require(word in ('minLength', 'maxLength', 'format', 'pattern')
                and node['minLength'] == node['maxLength'] == 36
                and node['pattern'] == '^' + grammar + '$' and node['format'] == 'uuid'
                and plain.VALIDATORS['pattern'] is exact_pattern
                and plain.format_checker.checkers['uuid'][0] is uuid_string
                and grammar in uuid_string.__code__.co_consts,
                'the installed UUID predicates no longer use the same 36-character grammar')
        covering = {source + '/' + member for member in {'pattern', 'format'} - {word}}
        require(go.locations(cut) == covering, 'the expected matching UUID rules must still refuse')
        return dict(source=source, covering_rules=sorted(covering),
                    premise='The two full matches accept exactly the same 36-character UUID grammar.')
    require(source.endswith('#/$defs/PayloadRef/properties/blake3')
            and path == ['content', 'event_ref', 'blake3']
            and word in ('minLength', 'maxLength') and node['minLength'] == node['maxLength'] == 64
            and node['pattern'] == '^[0-9a-f]{64}$' and plain.VALIDATORS['pattern'] is exact_pattern,
            'the stored reference digest does not have the declared exact-width pattern')
    peer = source + '/pattern'
    require(peer in go.locations(cut), 'the digest pattern must still refuse in the selected content form')
    return dict(source=source, covering_rules=[peer],
                premise='The full hexadecimal pattern accepts exactly 64 characters.')


def verify_projection_example(plain, validator, nodes, name, example, controls, disabled_check, require, errors_list):
    import pm_goal_dg5_closure as closure
    import pm_goal_go_schema_closure as go
    from pm_goal_dg5_methodb_stage3 import each_error, edit_example

    definition = plain.schema['$ref'].rsplit('#', 1)[1]
    wrapped = definition == '/$defs/StorageProjection'
    require(wrapped or definition in ('/$defs/CombinedStorageProjection', '/$defs/CancelledProjection'),
            'these examples are for the cancellation projection definitions')
    control = controls[example['projection_example']]
    invalid = control if example.get('control_only') else edit_example(go, control, example['path'], example)
    before = go.errors_of(validator, invalid)
    guard = closure._guard_for_location(name)
    disabled = () if disabled_check == 'rule' else {guard}
    cut = go.errors_of(validator, invalid, disabled)
    restored = go.errors_of(validator, invalid)
    actual, switched = errors_list(before), errors_list(cut)
    require(actual == errors_list(list(plain.iter_errors(invalid))) == errors_list(restored)
            and actual != switched
            and exact_message_digest(actual) == example['before_sha256']
            and exact_message_digest(switched) == example['disabled_sha256'],
            f'{name}: the exact original, disabled, or restored messages changed')
    record = dict(control=control, invalid=invalid, before=actual, cut=switched, restored=actual, source=name)
    if example.get('selector'):
        require('/if/' in name or name.endswith('/not/required'),
                f'{name}: expected a conditional or negated rule')
        return dict(record, cls='SELECTOR_OR_NEGATED')
    require(any(getattr(error, 'oracle_guard', None) == guard
                and list(error.absolute_path) == example['message_path'] for error in each_error(before))
            and guard not in {getattr(error, 'oracle_guard', None) for error in each_error(cut)},
            f'{name}: the targeted message did not disappear')
    if not cut:
        return dict(record, cls='KILLED')
    if example.get('related'):
        peers = example['related']
        require(name not in peers and go.locations(cut) & set(peers), f'{name}: expected an independent refusal')
        proof = related_projection_rules(plain, nodes, name, peers, go, closure, require)
    elif example.get('storage_width'):
        require(wrapped, 'stored wrapper width proof used outside the legacy decoder')
        proof = storage_projection_width(plain, nodes, name, example['message_path'], cut, go, require)
    else:
        proof = special_projection_rule(nodes, name, cut, validator, go, require)
    return dict(record, cls='COVERED_LATER', implication=proof)
