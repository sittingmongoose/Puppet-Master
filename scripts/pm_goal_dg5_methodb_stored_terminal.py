"""Check the conjoined member rules in the stored Goal Update terminal."""
import re

from pm_goal_dg5_methodb_stage3 import (
    IDENTITY, NORMALIZED, certified_payload_messages, each_error, edit_example, errors_list,
    nonterminal_outcome_implication, require, terminal_result_implication,
)

UPDATE = NORMALIZED.removesuffix('NormalizedIdentity')
COMMAND = IDENTITY.removesuffix('IdentityEnvelope') + 'CommandOutcomeRecord'
RESPONSE = 'https://puppetmaster.local/schemas/ui_command_response/2.0.0/ui_command_response.schema.json#'
TERMINAL = UPDATE + 'Terminal'
RESULT_SCHEMA = {'path': 'Plans/goal_runtime_contracts.schema.json',
                 'json_pointer': '#/$defs/GoalUpdateResultV2', 'schema_id': 'pm.goal.update.result.v2'}


def terminal_branches(nodes):
    wrapper = nodes[UPDATE+'StorageTerminal']['node']
    terminal = nodes[TERMINAL]['node']
    branch = {variant['properties']['kind']['const']: variant for variant in terminal['oneOf']}
    require('record' in wrapper['required'] and wrapper['properties']['record']['$ref'] == TERMINAL and
            set(branch) == {'succeeded','no_effect','unknown'} and len(terminal['oneOf']) == len(branch) and
            all({'kind','outcome','response'} <= set(choice['required']) for choice in branch.values()),
            'stored terminal no longer selects a unique branch through its required kind')
    return branch


def stored_terminal_shared_rule(nodes, name, path, control, actual, go, v, expected):
    branches = terminal_branches(nodes)
    require(expected and go.locations(actual) == set(expected), 'stored terminal counterpart messages changed')
    outcome, response = nodes[COMMAND]['node'], nodes[RESPONSE]['node']
    variants = {kind: {part: branch['properties'][part]['$ref'] for part in ('outcome','response')}
                for kind, branch in branches.items()}
    for pair in variants.values():
        for part, ref in pair.items():
            shared = COMMAND if part == 'outcome' else RESPONSE.removesuffix('#')
            require(nodes[ref]['node']['allOf'][0]['$ref'] == shared, 'Terminal branch no longer uses the shared schema')
    chosen = variants[control['record']['kind']]
    part, member = path[1], path[-1]
    primary = chosen[part] + '/allOf/1/properties/'
    before = {kind: nodes[ref[part]]['node']['allOf'][1]['properties'] for kind, ref in variants.items()}
    selected = before[control['record']['kind']]

    if name.startswith(COMMAND):
        require(name in (COMMAND+'/properties/owner_result_ref/oneOf',
                         COMMAND+'/properties/owner_result_sha256/oneOf'),
                'unexpected terminal outcome rule')
        base = outcome['properties'][member]
        case = outcome['allOf'][1]
        allowed = case['if']['properties']['outcome']['enum']
        require({'outcome',member} <= set(outcome['required']) and all(
            set(item['outcome'].get('enum', [item['outcome'].get('const')])) <= set(allowed)
            for item in before.values()) and base['oneOf'][0]['$ref'] == case['then']['properties'][member]['$ref'] and
            base['oneOf'][1]['type'] == 'null', 'terminal outcomes do not all require the same result member')
        source = COMMAND + '/allOf/1/then/properties/' + member
        text = 'Every stored terminal outcome selects the same nonnull alternative for this member.'
    else:
        condition = response['allOf']
        require({'response_kind','result_status','ack_status','replayed','original_dispatch_id',
                 'owner_result_ref','owner_result_schema_ref','error'} <= set(response['required']),
                'the response conditions no longer use mandatory members')
        if name.startswith(primary):
            if member == 'original_dispatch_id':
                require(selected['replayed']['const'] is False and
                        condition[13]['if']['properties']['replayed']['const'] is True and
                        condition[13]['else']['properties'][member]['type'] == selected[member]['type'] == 'null',
                        'the original dispatch must be null in this unreplayed response')
                source = RESPONSE+'/allOf/13/else/properties/'+member+'/type'
            elif member == 'replayed':
                require(selected[member]['const'] is False and selected['original_dispatch_id']['type'] == 'null' and
                        nodes[IDENTITY.removesuffix('IdentityEnvelope')+'Id']['node']['type'] == 'string' and
                        condition[13]['if']['properties'][member]['const'] is True and
                        condition[13]['then']['properties']['original_dispatch_id']['$ref'] == '#/$defs/Id',
                        'the replay branch no longer requires a nonnull original dispatch')
                source = RESPONSE+'/allOf/13/then/properties/original_dispatch_id'
            elif member == 'response_kind':
                other = condition[3]
                require(selected[member]['const'] == 'owner_operation' and
                        set(response['properties'][member]['enum']) ==
                        {'owner_operation',*other['if']['properties'][member]['enum']} and
                        other['then']['properties']['owner_result_schema_ref']['type'] == 'null' and
                        selected['owner_result_schema_ref']['const'] == RESULT_SCHEMA,
                        'each alternative kind must require a null owner result schema')
                source = RESPONSE+'/allOf/3/then/properties/owner_result_schema_ref/type'
            elif member == 'ack_status':
                rejected = condition[6]
                require(response['properties'][member]['enum'] == ['accepted','rejected'] and
                        selected[member]['const'] == 'accepted' and selected['result_status']['const'] is not None and
                        rejected['if']['properties'][member]['const'] == 'rejected' and
                        rejected['then']['properties']['result_status']['type'] == 'null',
                        'the rejected branch no longer conflicts with the required result status')
                source = RESPONSE+'/allOf/6/then/properties/result_status/type'
            elif member == 'error':
                require(selected['result_status']['const'] in condition[9]['if']['properties']['result_status']['enum'] and
                        condition[9]['then']['properties'][member]['type'] == selected[member]['type'] == 'null',
                        'the response condition no longer requires the same null error')
                source = RESPONSE+'/allOf/9/then/properties/error/type'
            else:
                raise ValueError('unexpected stored response member')
            text = 'The same stored response variant and original response condition enforce this member.'
        elif name == RESPONSE+'/allOf/6/then/properties/event_refs/maxItems':
            require(selected[member]['maxItems'] == condition[6]['then']['properties'][member]['maxItems'] == 0 and
                    all(kind == 'no_effect' or details['ack_status']['const'] == 'accepted'
                        for kind, details in before.items()) and condition[6]['if']['properties']['ack_status']['const'] == 'rejected',
                    'only rejected no-effect responses should take this branch')
            source = primary+member+'/maxItems'
            text = 'Only a no-effect response can be rejected, and it has the same empty event list bound.'
        elif name == RESPONSE+'/properties/'+member+'/oneOf':
            choices = response['properties'][member]['oneOf']
            require(len(choices) == 2 and choices[1]['type']=='null', 'the shared response alternatives changed')
            if member in ('command_outcome_ref','operation_id','owner_identity'):
                require(all(row['response_kind']['const']=='owner_operation' for row in before.values()) and
                        condition[2]['if']['properties']['response_kind']['const'] == 'owner_operation' and
                        condition[2]['then']['properties'][member]['$ref'] == choices[0]['$ref'],
                        'the owning response no longer requires the same nonnull alternative')
                source = RESPONSE+'/allOf/2/then/properties/'+member
            elif member == 'error':
                valid_statuses = {value for row in before.values()
                                  for value in row['result_status'].get('enum',[row['result_status'].get('const')])}
                with_error = set(condition[8]['if']['properties']['result_status']['enum'])
                without_error = set(condition[9]['if']['properties']['result_status']['enum'])
                require(valid_statuses <= with_error | without_error | {None} and
                        condition[8]['then']['properties'][member]['$ref'] == choices[0]['$ref'] and
                        nodes[RESPONSE + '/$defs/UICommandError']['node']['type'] == 'object' and
                        condition[9]['then']['properties'][member]['type'] == 'null' and
                        condition[7]['if']['properties']['ack_status']['const'] == 'accepted' and
                        condition[7]['then']['properties']['result_status']['type'] == 'string' and
                        condition[6]['if']['properties']['ack_status']['const'] == 'rejected' and
                        condition[6]['then']['properties'][member]['$ref'] == choices[0]['$ref'] and
                        response['properties']['ack_status']['enum']==['accepted','rejected'],
                        'every response status must select one of the same error alternatives')
                source = RESPONSE+'/allOf/8/then/properties/error'
            else:
                raise ValueError('unexpected shared response alternative')
            text = 'The required response variant selects the same nonnull or null alternative.'
        else:
            raise ValueError('unexpected terminal implication')
    source_node = nodes.get(source, {}).get('node', {})
    referenced = source_node.get('$ref')
    resolved = source
    while referenced:
        resolved = resolved.split('#', 1)[0] + referenced if referenced.startswith('#') else referenced
        referenced = nodes[resolved]['node'].get('$ref')
    if name == RESPONSE + '/properties/error/oneOf':
        active = control['record']['response']
        index = (6 if active['result_status'] is None else 8 if active['result_status'] in with_error else 9)
        chosen_source = RESPONSE + f'/allOf/{index}/then/properties/error'
        if index == 9:
            resolved = chosen_source + '/type'
    sites = go.locations(selected_terminal_errors(nodes, actual, control, (part,)))
    if name.startswith(primary) and member in ('response_kind', 'ack_status'):
        base_rule = RESPONSE + '/properties/' + member + '/enum'
        if base_rule in sites:
            resolved = base_rule
    require(any(rule == resolved or rule.startswith(resolved + '/') for rule in sites),
            f'{name}: the expected counterpart did not refuse in the selected terminal branch')
    return dict(source=source, observed=resolved, path=path, premise=text)


def selected_terminal_errors(nodes, errors, control, field):
    branch = terminal_branches(nodes)[control['record']['kind']]
    index = next(i for i, choice in enumerate(nodes[TERMINAL]['node']['oneOf']) if choice is branch)
    schema_prefix = ('properties', 'record', 'oneOf', index)
    return [child for error in errors for child in error.context
            if tuple(child.absolute_schema_path)[:len(schema_prefix)] == schema_prefix and
            tuple(child.absolute_path)[:len(field)+1] == ('record', *field)]


def finite_terminal_pins(nodes, validator, go, info, keyword, guard):
    terminal_branches(nodes)
    checked = []
    for reach in info['reach']:
        scope = go.scope_of(reach, nodes)
        path = reach['ipath']
        allowed = go.pinned(nodes, path, scope, exclude=(id(info['node']), keyword))
        require(allowed and all(go.holds(validator, info['node'], value, info['resolver'])
                               for value in allowed.values()),
                'the stored variant no longer constrains the complete set of values')
        scoped_sources = set()
        for loc, node in nodes.items():
            if not ({'const', 'enum'} & node['node'].keys() or node['node'].get('type') == 'null'):
                continue
            if node['node'] is info['node'] and keyword in ('const','enum','type'):
                continue
            for candidate in node['reach']:
                at = candidate['ipath']
                if path[:len(at)] == at and go.applies(candidate, scope):
                    scoped_sources.add(loc)
        require(scoped_sources, 'missing source for a stored terminal pin')
        checked.append(dict(path=path, sources=sorted(scoped_sources), allowed=list(allowed.values())))
    require(checked, 'no stored terminal sources found')
    return dict(guard=guard, checks=checked, premise='Every applicable terminal variant fixes the member to accepted values.')


def terminal_rule_trial(plain, nodes, validator, go, name, example, control, disabled, locations, keyword):
    mode = example['terminal_case']
    terminal_branches(nodes)
    info = nodes[name.rsplit('/', 1)[0]]
    if mode == 'unreachable':
        proof = go.pinned_proof(info, nodes, validator, keyword)
        require(proof and proof['cls'] == 'UNREACHABLE' and not go.errors_of(validator, control, disabled),
                f'{name}: stored terminal branch is reachable')
        return proof
    invalid = control
    for edit in example['edits']:
        if not edit['path'] and 'value' in edit:
            invalid = edit['value']
        else:
            invalid = edit_example(go, invalid, edit['path'], edit)
    before = go.errors_of(validator, invalid)
    actual = errors_list(list(plain.iter_errors(invalid)))
    cut = go.errors_of(validator, invalid, disabled)
    restored = certified_payload_messages(go.errors_of(validator, invalid))
    require(certified_payload_messages(before) == actual == restored, f'{name}: original exact messages changed')
    require(go.locations(before) == set(example['before_rules']) and
            go.locations(cut) == set(example['disabled_rules']),
            f'{name}: changed or surviving validation rule differs from the example')
    cut_messages = certified_payload_messages(cut)
    if mode == 'selector':
        require(actual != cut_messages, f'{name}: the exact selector messages did not change')
        return dict(cls='SELECTOR_OR_NEGATED', control=control, input=invalid, original=actual,
                    cut=cut_messages, restored=restored, source=example.get('selector_source', name))
    at = example['path']
    target = (keyword, tuple(at), name)
    require(target in locations(before) and target not in locations(cut),
            f'{name}: the target validation message did not disappear')
    entry = dict(cls='KILLED', control=control, invalid=invalid, before=actual, cut=cut_messages, restored=restored)
    if mode == 'independent':
        require(not cut, f'{name}: a second rule still refuses the document')
        return entry
    require(cut and mode in ('finite_pin','shared_outcome','nested_result','shared_rule','nonempty_reference'),
            'missing checked source implication')
    expected = example['disabled_rules']
    if mode == 'finite_pin':
        proof = finite_terminal_pins(nodes, validator, go, info, keyword, name)
    elif mode == 'shared_outcome':
        proof = nonterminal_outcome_implication(nodes, name, at, cut, go, expected)
    elif mode == 'nested_result':
        selected = selected_terminal_errors(nodes, cut, control, ('result',))
        require(selected, 'the nested result did not continue to refuse')
        proof = terminal_result_implication(nodes, name, at, selected, go, locations, validator,
                                           sorted(go.locations(selected)))
    elif mode == 'nonempty_reference':
        source = name.removesuffix('/minLength') + '/pattern'
        require(keyword == 'minLength' and info['node']['minLength'] == 1 and
                re.search(info['node']['pattern'], '') is None and source in expected,
                'the source reference pattern must refuse the empty string')
        proof = dict(source=source, premise='The same reference pattern refuses the empty string.')
    else:
        proof = stored_terminal_shared_rule(nodes, name, at, control, cut, go, validator, expected)
    return dict(entry, cls='COVERED_LATER', implication=proof)
