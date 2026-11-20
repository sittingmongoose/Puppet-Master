"""Recheck the source, progress, receipt and terminal rules used in Goal Update reader results."""

import json
from pathlib import Path

from pm_goal_dg5_methodb_stage3 import (
    SOURCE_AUDIT_ROOT, certified_payload_messages, edit_example, errors_list, require,
    source_audit_checks, test_rules,
)


REPORTS = Path('reports/event-authority-20261114')
CONSUMER = 'https://puppetmaster.local/schemas/goal_updated_consumer_contracts/1.0.0/schema.json#/$defs/'
UPDATE = ('https://puppetmaster.local/schemas/goal_update_command_custody/1.0.0/'
          'goal_update_command_custody.schema.json#/$defs/')
AUDITED = {'dg5:ace4bbe951ac01fc': 'AuditedProgress', 'dg5:95a2813c054bed6c': 'AuditedTerminal'}
READER_ROOTS = AUDITED

COMMON_FIELDS = {
    'source_audit': (('source_audit',), UPDATE + 'StorageSourceAudit', 5, 'updated-source-audit.json'),
    'progress': (('progress', 'record'), UPDATE + 'Progress', 5, 'updated-progress.json'),
}


def reader_fields(ident):
    terminal = ident == 'dg5:95a2813c054bed6c'
    request = 'updated-audit-request-terminal.json' if terminal else 'updated-audit-request.json'
    fields = COMMON_FIELDS | {'request': (('request',), CONSUMER + 'AuditReadRequest', 5, request)}
    if terminal:
        fields['terminal'] = (('terminal',), UPDATE + 'StorageTerminal', 5, 'updated-stored-terminal.json')
    return fields


def ref_of(node):
    return node.get('$ref')


def bound_reader_child(resolver, reference, field, path, child):
    root = resolver.lookup(reference).contents
    props = root['properties']
    require(path[0] in root['required'], 'the reader no longer requires the tested member')
    if field == 'progress':
        shape = props['progress']
        require(ref_of(shape) == CONSUMER + 'ProgressSnapshotWrapper',
                'the reader no longer uses the original progress snapshot')
        snapshot = resolver.lookup(CONSUMER + 'ProgressSnapshotWrapper').contents
        require(ref_of(snapshot['allOf'][0]) == UPDATE + 'StorageProgress' and
                ref_of(snapshot['allOf'][1]['properties']['record']) == child,
                'the reader snapshot no longer validates the same record')
    elif field == 'request' and reference.endswith(('AuditedProgress', 'AuditedTerminal')):
        require(ref_of(props['request']['allOf'][0]) == child,
                'the audit reader no longer validates the original request')
    else:
        require(ref_of(props[path[0]]) == child, 'the reader member refers to a different definition')


def run_reader_children(plain, bank, document, census, declaration, disabled, repo, definition, chosen):
    import pm_goal_dg5_closure as closure
    import pm_goal_go_schema_closure as go

    cases = {}
    fields = reader_fields(declaration['root'])
    for field in chosen:
        path, reference, stage, basename = fields[field]
        bound_reader_child(plain._resolver, CONSUMER + definition, field, path, reference)
        source = repo / REPORTS / f'goal-methodb-stage{stage}' / basename
        local = json.loads(source.read_text())
        require(all(local[key] == declaration[key] for key in ('source','family','census_sha256')),
                'reader child does not come from the original source and census')
        from pm_goal_dg_u_owners import banks

        actual = bank.validator(reference)
        observed = census['roots'][local['root']]
        require(json.loads(observed['schema'])['$ref'] == reference, 'reader child definition changed')
        original_bank, = [candidate for candidate in banks()
                          if closure._registry_digest(candidate.validator(reference)) == observed['registry_sha256']]
        schema = original_bank.validator(reference)
        same_reader_child(closure, actual, bank, schema, original_bank, local['root'], observed['clause_ids'])
        control = go.get(document, path)
        extra = (source_audit_checks(schema, original_bank, control, census, source, disabled)
                 if local['root'] == SOURCE_AUDIT_ROOT else None)
        rules, gaps = test_rules(schema, original_bank, control, local['root'], observed['clause_ids'],
                                 local['examples'], disabled, local.get('accepted_branches'), extra)
        require(not gaps, f'{field}: original nested rule examples left gaps')
        cases[field] = (path, reference, rules)
    return cases


def same_reader_child(closure, actual, bank, original, root_bank, root, expected):
    """The two banks may install extra definitions outside the copied member."""
    require(actual.schema == original.schema and type(actual) is type(original),
            'reader child validation calls differ')
    current_nodes, current_cells = closure._clause_inventory(closure.closure_validator(actual, root, bank))
    reference_nodes, reference_cells = closure._clause_inventory(closure.closure_validator(original, root, root_bank))
    require(current_cells == reference_cells == expected and
            {path: item['node'] for path,item in current_nodes.items()} ==
            {path: item['node'] for path,item in reference_nodes.items()},
            'reader child uses different exact definitions')
    resources = {rule.partition('#')[0] for rule in expected}
    require(all(uri in bank.pins and bank.pins[uri] == root_bank.pins.get(uri) for uri in resources),
            'the reader uses different source bytes for one of the copied rules')
    formats = {entry['node']['format'] for entry in current_nodes.values() if 'format' in entry['node']}
    for name in formats:
        current, current_errors = actual.format_checker.checkers[name]
        previous, previous_errors = original.format_checker.checkers[name]
        if current is previous:
            continue
        require(name == 'date-time' and current.__code__ is previous.__code__ and
                current_errors == previous_errors and current.__defaults__ == previous.__defaults__ and
                tuple(cell.cell_contents for cell in current.__closure__) ==
                tuple(cell.cell_contents for cell in previous.__closure__),
                f'reader child uses a different {name} check')


def reader_trial(plain, bank, go, validator, ident, nodes, name, keyword, control, case, disabled, sources, locations):
    status = case['reader_case']
    expected = case.get('before_rules')
    after = case.get('disabled_rules')
    source = None
    if status == 'projected':
        path, reference, claims = sources[case['field']]
        source = claims[name]
        if source['cls'] == 'UNREACHABLE':
            return reader_pin(validator, nodes, go, name, keyword, control, disabled)
        positive = source.get('control', go.get(control, path))
        candidate = source.get('invalid', source.get('input', positive))
        control = go.apply(control, path, positive)
        value = go.apply(control, path, candidate)
    elif status == 'pin':
        return reader_pin(validator, nodes, go, name, keyword, control, disabled)
    else:
        value = control
        for edit in case['edits']:
            if not edit['path'] and 'value' in edit:
                value = edit['value']
            else:
                value = edit_example(go, value, edit['path'], edit)
    require(not list(plain.iter_errors(control)) and not go.errors_of(validator, control),
            'the original reader refused the selected test document')
    before = go.errors_of(validator, value)
    original = errors_list(list(plain.iter_errors(value)))
    cut = go.errors_of(validator, value, disabled)
    restored = certified_payload_messages(go.errors_of(validator, value))
    require(original == certified_payload_messages(before) == restored, f'{name}: original reader message changed')
    if expected is not None:
        require(go.locations(before) == set(expected) and go.locations(cut) == set(after),
                f'{name}: the original or surviving reader rule changed')
    cut_text = certified_payload_messages(cut)
    if status == 'selector' or (source and source['cls']=='SELECTOR_OR_NEGATED'):
        require(original != cut_text, f'{name}: disabling the selector did not change its message')
        return dict(cls='SELECTOR_OR_NEGATED', control=control, input=value, original=original,
                    cut=cut_text, restored=restored, source=source or name)
    original_sites = {loc for loc in locations(before) if loc[2]==name}
    if source:
        original_sites = {loc for loc in original_sites if loc[1][:len(path)]==path}
        require(original_sites, f'{name}: the copied member never produced its original validation message')
    else:
        target=(keyword, tuple(case['path']), name)
        require(target in original_sites, f'{name}: the reader did not produce the target validation message')
        original_sites = {target}
    require(not original_sites & locations(cut), f'{name}: the target message remains after disabling the rule')
    result = dict(cls='KILLED', control=control, invalid=value, before=original, cut=cut_text, restored=restored)
    if not cut:
        return result
    if status == 'projected' and source.get('implication'):
        require(copied_messages(path, source['cut'], cut_text),
                f'{name}: the reader did not retain the original joined field messages')
        proof = dict(source=reference, field=path, rules=source['implication'])
    elif status in ('snapshot_only', 'audit_selection'):
        proof = reader_scope(bank, go, ident, name, case, cut)
    else:
        raise ValueError(f'{name}: another validation message remains without a checked premise')
    return dict(result, cls='COVERED_LATER', implication=proof)


def copied_messages(path, original, projected):
    # Each validator retains its full message. Compare the copied field by
    # exact leaf wording and the locations of its enclosing messages.
    def field_messages(listing):
        for at, _, keyword, message, context in listing:
            yield tuple(at), keyword, message if not context else None
            yield from field_messages(context)

    wanted = set(field_messages(original))
    actual = {(at[len(path):], keyword, message)
              for at, keyword, message in field_messages(projected) if at[:len(path)] == path}
    return bool(wanted) and wanted <= actual


def reader_pin(validator, nodes, go, name, keyword, control, disabled):
    proof = go.pinned_proof(nodes[name.rsplit('/',1)[0]], nodes, validator, keyword)
    require(proof and proof['cls']=='UNREACHABLE' and not go.errors_of(validator, control, disabled),
            f'{name}: the source does not establish this unreachable reader branch')
    return proof


def reader_scope(bank, go, ident, name, case, errors):
    resolver = bank.registry.resolver()
    reference = CONSUMER + READER_ROOTS[ident]
    root = resolver.lookup(reference).contents
    mode = case['reader_case']
    if mode == 'audit_selection':
        properties = root['properties']['request']['allOf']
        require(ref_of(properties[0]) == CONSUMER + 'AuditReadRequest', 'the original request definition changed')
        request = resolver.lookup(CONSUMER + 'AuditReadRequest').contents
        require('request' in root['required'] and 'selection' in request['required'],
                'audit results now admit a response without a request selection')
        general = [ref_of(branch) for branch in request['properties']['selection']['oneOf']]
        narrow = properties[1]['properties']['selection']
        selected = [ref_of(narrow)] if '$ref' in narrow else [ref_of(item) for item in narrow['oneOf']]
        require(set(general) == {CONSUMER + name for name in
                ('CurrentProgressSelection','ImmutableProgressSelection','TerminalMembersSelection')} and
                set(selected) < set(general), 'the audit variants no longer narrow the original selection')
        kinds = {}
        for uri in general:
            variant = resolver.lookup(uri).contents
            require(variant['type']=='object' and 'kind' in variant['required'], 'audit variants can overlap')
            kinds[uri] = variant['properties']['kind']['const']
        require(len(set(kinds.values())) == len(general) and
                (name == CONSUMER + 'AuditReadRequest/properties/selection/oneOf' or
                 any(name.startswith(uri + '/') for uri in set(general) - set(selected))),
                'this assertion is involved in an allowed audit selection')
        require(any(rule.startswith(tuple(uri+'/' for uri in selected)) for rule in go.locations(errors)),
                'the narrower selection did not refuse the same document')
        return dict(source=reference+'/properties/request/allOf/1', choices=selected,
                    premise='These result documents require a disjoint subset of the original request selections.')

    require(mode == 'snapshot_only', 'unexpected reader scope')
    field = case['field']
    wrapper = CONSUMER + 'ProgressSnapshotWrapper'
    require(field == 'progress' and field in root['required'] and ref_of(root['properties'][field]) == wrapper,
            'the reader no longer selects the progress snapshot')
    schema = resolver.lookup(wrapper).contents
    storage, required = schema['allOf']
    choice = ref_of(required['properties']['record'])
    require(ref_of(storage)==UPDATE+'StorageProgress' and
            choice == UPDATE+'Progress',
            'the original progress wrapper no longer requires the same selected definition')
    variants = resolver.lookup(UPDATE+'StorageProgress').contents
    require('record' in variants['required'] and [ref_of(v) for v in variants['properties']['record']['oneOf']] ==
            [UPDATE+'Progress', UPDATE+'ProgressHead'], 'the stored progress alternatives changed')
    head = resolver.lookup(UPDATE+'ProgressHead').contents
    phases = resolver.lookup(UPDATE+'Progress').contents['oneOf']
    require({'schema_id', 'snapshot_sha256'} <= set(head['required']) and head['additionalProperties'] is False and
            'phase' not in head['properties'] and
            all({'schema_id','phase'} <= set(phase['required']) and
                phase['properties']['schema_id']['const'] != head['properties']['schema_id']['const']
                for phase in phases), 'the head and progress record no longer have disjoint required shapes')
    excluded = UPDATE+'ProgressHead'
    require(name.startswith(excluded+'/') or name==UPDATE+'StorageProgress/properties/record/oneOf',
            'the alternative remains in the explicitly required reader definition')
    require(any(rule.startswith(choice+'/') for rule in go.locations(errors)),
            'the explicitly required reader definition did not refuse the same document')
    return dict(source=wrapper+'/allOf/1/properties/record', definition=choice,
                rejected_alternative=excluded,
                premise='The reader explicitly requires this one stored record definition.')
