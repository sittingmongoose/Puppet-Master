"""DG6A sweep part 2A witnesses: one-defect cases for guard-table rows no earlier case refused alone.

Each witness starts from a valid fixture parent of its own family, changes one fact, moves every
copy that observes that fact (recomputed request digests, the candidate record fields the concern
recipe derives from the command), runs the complete checker function and asserts its exact result.
Rows that no input can refuse first are not given witnesses here; their proofs are in the report and
in the `*_entailed` tables. Case generation only: this module decides no refusal. The checker mains
call these builders; the guard-table runner records the rows they reach.
"""
import copy

UUID_OTHER = '00000000-0000-4000-8000-000000000009'


def _node(schema, path):
    """The schema node at a properties path, following local $ref (for enum candidates)."""
    node = schema
    for key in path:
        node = node.get('properties', {}).get(key, {})
        while '$ref' in node:
            target = schema
            for part in node['$ref'][2:].split('/'):
                target = target[part]
            node = target
    return node


def alternatives(value, node=None):
    """Deterministic schema-plausible replacements for a leaf, other than the value itself."""
    out = [v for v in (node or {}).get('enum', []) if v != value]
    if type(value) is bool:
        out.append(not value)
    elif type(value) is int:
        out += [value + 1, value + 2]
    elif value is None:
        out += ['pmref:test:other', 'fixture2', UUID_OTHER, 1]
    elif type(value) is str:
        if len(value) >= 20 and value[4] == '-' and value[10] in 'Tt':
            out += [value[:17] + ('01' if value[17:19] != '01' else '02') + value[19:]]
        out += ['pmref:test:other', 'fixture2', value + 'x', UUID_OTHER, 'b' * 64, 'eig_' + 'b' * 64, 'project~AAAA', 'app']
    elif type(value) is list:
        out += [value + value[:1], [], ['pmref:test:other'], value + ['pmref:test:other']]
    return [v for v in out if not (type(v) is type(value) and v == value)]


def key_witnesses(base, section, keys, node_of, fix, check, code_of, skip=()):
    """One witness per key: change base[section][key] alone (plus fix), refused exactly [code_of(key)].

    Returns (count, missing): keys with no candidate refused exactly at their row.
    """
    count, missing = 0, []
    for key in keys:
        if key in skip or key not in base[section]:
            continue
        found = False
        for candidate in alternatives(base[section][key], node_of(key)):
            value = copy.deepcopy(base)
            value[section][key] = copy.deepcopy(candidate)
            try:
                fix(value, key)
            except ValueError:
                continue  # outside the semantic recipe domain: the schema refuses it first, no witness here
            if check(value) == [code_of(key)]:
                found = True
                count += 1
                break
        if not found:
            missing.append(key)
    return count, missing


def expect(actual, expected, name):
    assert actual == expected, (name, actual, expected)
    return 1


def expect_unavailable(reader, request, expected, guards, name, unavailable):
    try:
        reader(request, expected)
    except unavailable as error:
        assert error.guards == guards, (name, error.guards, guards)
        return 1
    raise AssertionError(('history witness accepted', name))


# ------------------------------------------------------------------ alert shared library
ALERT_SCHEMA_FIXED = ('command_id', 'handler_target', 'mute_scope')  # const in both command and payload schemas


def alert_operation(owner, tables, family, fixtures, op_schema):
    """Command/payload per-field witnesses (request digest recomputed), one per declared command field.

    Parents are the family's valid operation cases. An optional field no parent carries is first
    added coherently to command and payload (and to the candidate owner state, for mute_expires_at),
    and that parent must itself be accepted before the command copy alone is changed.
    """
    parents = [copy.deepcopy(c['value']) for c in fixtures['operation_cases'] if c['valid']]
    keys = tables.fields('alert_command_keys_a') + tables.fields('alert_command_keys_b')
    declared = [k for k in keys if k in op_schema['properties']['original_command']['properties'] and k not in ALERT_SCHEMA_FIXED]

    def fix(value, key):
        value['request_digest'] = owner.request_digest(value['original_command'], value['payload'])
    count, unwitnessed = 0, []
    for key in declared:
        pool = [parent for parent in parents if key in parent['original_command']]
        if not pool:
            for seed in ['2026-11-06T00:00:00Z', 'fixture'] + alternatives(None):
                parent = copy.deepcopy(parents[0])
                parent['original_command'][key] = parent['payload'][key] = seed
                if key == 'mute_expires_at':
                    parent['candidate_owner_state'][key] = seed
                try:
                    fix(parent, key)
                except ValueError:
                    continue  # the seed is outside the semantic recipe domain; it is no valid parent
                if not owner.operation_errors(parent, op_schema):
                    pool = [parent]
                    break
        found = False
        for parent in pool:
            assert not owner.operation_errors(parent, op_schema), (family['event_type'], key)
            n, missing = key_witnesses(parent, 'original_command', [key], lambda k: _node(op_schema, ['original_command', k]), fix,
                                       lambda value: owner.operation_errors(value, op_schema),
                                       lambda k: 'original command/payload ' + k)
            if n:
                count, found = count + n, True
                break
        if not found:
            unwitnessed.append(key)
    assert not unwitnessed, (family['event_type'], 'command keys without a witness', unwitnessed)
    return count


def append_witnesses(owner, family, fixtures):
    """append_result rows with no fixture witness: non-object evidence, event type, settled receipt."""
    count = 0
    committed = copy.deepcopy(fixtures['append_operations']['committed'])
    settled = copy.deepcopy(fixtures['append_operations']['settled'])
    expected = copy.deepcopy(fixtures['history']['expected']['event'])
    event_type = family['event_type']
    count += expect(owner.append_result_errors(committed, [], [], event_type),
                    ['foreign original append family/scope/identity'], 'append_expected_not_object')
    foreign = dict(expected, event_type=event_type + '_other')
    count += expect(owner.append_result_errors(committed, copy.deepcopy(foreign), foreign, event_type),
                    ['foreign original append family/scope/identity'], 'append_foreign_event_type')
    no_receipt = dict(expected, receipt=None)
    count += expect(owner.append_result_errors(settled, copy.deepcopy(no_receipt), no_receipt, event_type),
                    ['foreign original append-result reference'], 'append_settled_receipt_not_object')
    return count


def checkpoint_witnesses(owner, checker, checkpoint, cp_schema, original_context, server=False):
    """checkpoint_token rows: the token source selection alone, and (app scope) the server id alone."""
    count = 0
    value = copy.deepcopy(checkpoint)
    value['index_read_token']['source_selection']['storage_instance_id'] = UUID_OTHER
    count += expect(checker(value, cp_schema, original_context), ['foreign Storage token'], 'checkpoint_selection_storage')
    if server and 'server_id' in checkpoint and 'server_id' in original_context:
        value = copy.deepcopy(checkpoint)
        value['server_id'] = UUID_OTHER
        count += expect(checker(value, cp_schema, original_context), ['foreign original-event context: server_id'],
                        'checkpoint_server_id')
    return count


def protocol_shape_witnesses(protocol, context, original, kind):
    """protocol_shape rows: a non-object context and each container of the kind."""
    count = expect(protocol([], original), ['invalid protocol shape'], 'protocol_context_not_object')
    variants = ([('authority', 'pmref:test:authority'), ('authority', {k: v for k, v in context['authority'].items() if k != 'source_refs'})]
                if kind == 'concern' else [('retry_command', 'x'), ('retry_payload', None)])
    for key, bad in variants:
        value = copy.deepcopy(context)
        value[key] = bad
        count += expect(protocol(value, original), ['invalid protocol shape'], 'protocol_' + key)
    return count


def retained_retry_witnesses(owner, protocol, context, operation, retry_code, append_code):
    """retry_retained rows RR02, RR03, RR05 on a settled original (the append join refuses the same copy)."""
    count = 0
    for name, change in (('unknown_edition', lambda e: e.update(event_type=e['event_type'] + '_other')),
                         ('stored_not_object', lambda e: e.update(payload='stored')),
                         ('stored_not_operation_payload', lambda e: e['payload'].update(correlation_id='fixture2'))):
        value = copy.deepcopy(context)
        for key in ('append_original', 'append_resolution'):
            change(value[key])
        count += expect(protocol(value, operation), [retry_code, append_code], 'retry_' + name)
    return count


def current_retry_witnesses(protocol, context, operation, code, prepare):
    """retry_current rows on a prepared original: a non-semantic preimage and a changed body."""
    original = prepare(copy.deepcopy(operation))
    base = copy.deepcopy(context)
    count = 0
    value = copy.deepcopy(base)
    value['retry_payload'] = dict(value['retry_payload'], correlation_id=1.5)
    count += expect(protocol(value, original), [code], 'retry_current_preimage')
    value = copy.deepcopy(base)
    value['retry_payload'] = dict(value['retry_payload'], correlation_id='fixture2')
    count += expect(protocol(value, original), [code], 'retry_current_changed_body')
    return count


def history_witnesses(shared, fixture, checkpoint, reader):
    """history_shape, history_event and history_original rows with no fixture witness."""
    base = shared.history_request(fixture, checkpoint)
    expected = copy.deepcopy(fixture['history']['expected'])
    case_ref = fixture['history']['case_checkpoint_ref']
    base['checkpoint']['index_read_token']['checkpoint_ref'] = case_ref
    expected['checkpoint']['index_read_token']['checkpoint_ref'] = case_ref
    assert reader(copy.deepcopy(base), copy.deepcopy(expected))['event_refs'] == [expected['event']['event_ref']]
    unavailable = shared.HistoryUnavailable
    count = expect_unavailable(reader, [], expected, ['history_shape'], 'history_request_not_object', unavailable)
    shapes = [('request_member', [], 'disclosure', None), ('checkpoint_object', ['checkpoint'], None, 'x'),
              ('event_object', ['event'], None, []), ('disclosure_object', ['disclosure'], None, None),
              ('checkpoint_member', ['checkpoint'], 'state', None), ('event_member', ['event'], 'event_ref', None),
              ('payload_object', ['event', 'payload'], None, 'false'), ('disclosure_member', ['disclosure'], 'withdrawn', None)]
    for name, path, drop, bad in shapes:
        request = copy.deepcopy(base)
        if drop is not None:
            parent = request
            for key in path:
                parent = parent[key]
            del parent[drop]
        else:
            parent = request
            for key in path[:-1]:
                parent = parent[key]
            parent[path[-1]] = bad
        count += expect_unavailable(reader, request, expected, ['history_shape'], 'history_' + name, unavailable)
    request, original = copy.deepcopy(base), copy.deepcopy(expected)
    request['event']['observed_at_utc'] = original['event']['observed_at_utc'] = '2026-11-04T25:00:00Z'
    count += expect_unavailable(reader, request, original, ['event_original'], 'history_event_instants', unavailable)
    for field, values in (('observed_at_utc', ('2026-11-04T18:00:00Z', '2026-11-04T18:00:01Z')),
                          ('persisted_at_utc', ('2026-11-04T18:00:00Z', '2026-11-04T18:00:01Z'))):
        request, original = copy.deepcopy(base), copy.deepcopy(expected)
        original['event'][field], request['event'][field] = values
        count += expect_unavailable(reader, request, original, ['event_original'], 'history_event_' + field, unavailable)
    request = copy.deepcopy(base)
    request['event']['extra_member'] = 'x'
    count += expect_unavailable(reader, request, expected, ['event_original'], 'history_event_members', unavailable)
    request = copy.deepcopy(base)
    request['event']['scope_partition'] = 'project~AAAA'
    count += expect_unavailable(reader, request, expected, ['event_original'], 'history_event_scope_partition', unavailable)
    request, original = copy.deepcopy(base), copy.deepcopy(expected)
    request['event']['payload']['schema_version'] = original['event']['payload']['schema_version'] = '9.0.0'
    count += expect_unavailable(reader, request, original, ['historical_payload'], 'history_edition_unknown', unavailable)
    request, original = copy.deepcopy(base), copy.deepcopy(expected)
    for receipt in (request['event']['receipt'], original['event']['receipt']):
        receipt['first_append_receipt']['acknowledged_at_utc'] = '2026-11-04T25:00:00Z'
    count += expect_unavailable(reader, request, original, ['original_receipt'], 'history_receipt_instants', unavailable)
    original = copy.deepcopy(expected)
    original['event']['valid_when_written'] = False
    count += expect_unavailable(reader, copy.deepcopy(base), original, ['original_admission'], 'history_original_not_admitted', unavailable)
    return count


# ------------------------------------------------------------------ panel
PANEL_SCHEMA_FIXED = ('command_id', 'panel_id', 'target_host')  # const in both command and payload schemas


def panel_operation(owner, tables, family, operation, op_schema, payload_schema):
    def fix(value, key):
        value['request_digest'] = owner.request_digest(value['original_command'], value['payload'])
    event = family['event_type']
    declared = [k for k in tables.fields('panel_command_keys') if k in op_schema['properties']['original_command']['properties']
                and k in payload_schema['properties'] and k not in PANEL_SCHEMA_FIXED]
    assert all(k in operation['original_command'] for k in declared), (event, 'declared command key absent from the parent')
    count, missing = key_witnesses(operation, 'original_command', tables.fields('panel_command_keys'),
                                   lambda key: _node(op_schema, ['original_command', key]), fix,
                                   lambda value: owner.operation_errors(value, op_schema, payload_schema, event),
                                   lambda key: 'frozen command/payload ' + key, skip=PANEL_SCHEMA_FIXED)
    assert not missing, (event, 'command keys without a witness', missing)
    return count


def panel_home_project(owner, payload_cases, payload_schema):
    """PP03: a home_workspace interaction without a project (application scope, CV-366 key kept)."""
    for case in payload_cases:
        value = case['value']
        if case['valid'] and value['project_id'] is None:
            altered = dict(value, origin='home_workspace')
            return expect(owner.payload_errors(altered, payload_schema), ['missing original Home context'], 'home_without_project')
    raise AssertionError('no valid application-scope panel payload parent')


# ------------------------------------------------------------------ concern.created
CONCERN_SCHEMA_FIXED = ('command_id', 'handler_target')
# The candidate record fields the concern recipe derives from each command field
# (mirrors operation_observation's expected record in pm-concern-created-contracts-check.py).
CONCERN_RECORD_COPIES = {'category': ('concern_category',), 'severity': ('severity',), 'owner_kind': ('owner_kind',),
                         'owner_ref': ('owner_ref',), 'actor_ref': ('creator_ref', 'created_by_ref'),
                         'creator_kind': ('created_by_kind',), 'subject_ref': ('subject_ref',),
                         'source_refs': ('source_event_refs',), 'evidence_refs': ('evidence_refs',),
                         'artifact_refs': ('artifact_refs',), 'lineage_refs': ('lineage_refs',), 'title_ref': ('summary',),
                         'ts': ('created_at', 'updated_at'), 'visibility_level': ('visibility_level',),
                         'attention_level': ('attention_level',), 'chatworthy': ('chatworthy',),
                         'blocking_effect_ref': ('blocking_effect_ref',), 'run_ref': ('run_ref',), 'scope_ref': ('scope_ref',)}


def concern_operation(owner, tables, original, op_schema, payload_schema):
    def fix(value, key):
        for field in CONCERN_RECORD_COPIES.get(key, ()):
            value['candidate_record'][field] = copy.deepcopy(value['original_command'][key])
        value['request_digest'] = owner.digest(value)
    keys = tables.fields('concern_command_keys_a') + tables.fields('concern_command_keys_b')
    declared = [k for k in keys if k in op_schema['properties']['original_command']['properties'] and k not in CONCERN_SCHEMA_FIXED]
    assert all(k in original['original_command'] and k in original['payload'] for k in declared), 'declared concern key absent from the parent'
    count, missing = key_witnesses(original, 'original_command', keys,
                                   lambda key: _node(op_schema, ['original_command', key]), fix,
                                   lambda value: owner.operation_errors(value, op_schema, payload_schema),
                                   lambda key: 'original command/payload ' + key, skip=CONCERN_SCHEMA_FIXED)
    assert not missing, ('concern.created command keys without a witness', missing)
    value = copy.deepcopy(original)
    value['payload']['concern_id'] = 'concern_' + 'b' * 64
    value['request_digest'] = owner.digest(value)
    count += expect(owner.operation_errors(value, op_schema, payload_schema), ['original identity mismatch'], 'concern_id')
    value = copy.deepcopy(original)
    for section in ('payload', 'original_command', 'candidate_record'):
        value[section]['project_id'] = 'fixture2'
    value['request_digest'] = owner.digest(value)
    count += expect(owner.operation_errors(value, op_schema, payload_schema), ['original scope/key mismatch'], 'payload_project')
    payload = dict(original['payload'], unexpected_member='x')
    assert owner.payload_errors(payload, payload_schema), 'concern payload extra member accepted'
    return count + 1


def concern_creator_type(owner, context, original):
    """CC01: a non-string creator kind in the retained original and its authority copy (CA02 holds)."""
    value, proof = copy.deepcopy(original), copy.deepcopy(context)
    value['original_command']['creator_kind'] = ['Runtime']
    proof['authority']['creator_kind'] = ['Runtime']
    return expect(owner.protocol_errors(proof, value), ['nomination or owner label grants no creation'], 'creator_kind_not_string')


# ------------------------------------------------------------------ Card 5 HISTORICAL_ONLY mapping
def card5_mapping(owner, tables, fixture, family, payload_schemas, cp_schema):
    """c5_mapping_shape rows MS02-MS08 and the read's HM02 (original mapping evidence not an object)."""
    base = fixture['bases']['mapping']
    mapping, original = base['mapping'], base['original']
    assert not owner.mapping_errors(mapping, original)
    count = 0
    cases = [('mapping_member', lambda m, o: m.pop('mapped_kind')), ('original_object', lambda m, o: 'original'),
             ('original_member', lambda m, o: o.pop('ambiguous')), ('after_object', lambda m, o: o.update(after='x')),
             ('after_state', lambda m, o: o['after'].pop('state')),
             ('before_object', lambda m, o: o.update(before='x')),
             ('before_state', lambda m, o: o.update(before={k: v for k, v in o['after'].items() if k != 'state'}))]
    for name, change in cases:
        m, o = copy.deepcopy(mapping), copy.deepcopy(original)
        result = change(m, o)
        if result == 'original':
            o = 'original'
        count += expect(owner.mapping_errors(m, o), ['mapping_shape'], 'mapping_' + name)
    history = copy.deepcopy(fixture['bases']['history'])
    history['expected']['mapping_original'] = 'original'
    try:
        owner.history_page(history['request'], history['expected'], family, payload_schemas, cp_schema)
    except owner.shared.HistoryUnavailable as error:
        count += expect(error.guards, ['mapping_shape'], 'history_mapping_original_not_object')
    else:
        raise AssertionError('history mapping evidence not an object accepted')
    return count


# ------------------------------------------------------------------ per-checker entry points (called by the mains)
def alert_all(owner, tables, family, fixtures, payload_schema, op_schema, cp_schema):
    count = alert_operation(owner, tables, family, fixtures, op_schema)
    count += expect(unencodable(fixtures['operation_cases'][0]['value'], lambda v: owner.operation_errors(v, op_schema),
                                'operation has no canonical MessagePack encoding'), 1, 'operation_unencodable')
    # CV-1100 sets no lane cap: coherent current revisions above 2^53 and at the uint64 edge are accepted.
    for prior in (2 ** 53, 2 ** 64 - 2):
        value = copy.deepcopy(fixtures['operation_cases'][0]['value'])
        value['payload']['prior_revision'] = value['original_command']['prior_revision'] = prior
        value['prior_owner_state']['revision'] = prior
        value['payload']['result_revision'] = value['candidate_owner_state']['revision'] = prior + 1
        value['request_digest'] = owner.request_digest(value['original_command'], value['payload'])
        count += expect(owner.operation_errors(value, op_schema), [], 'large_revision_' + str(prior))
    count += append_witnesses(owner, family, fixtures)
    original_context = fixtures['operation_cases'][0]['value']
    baseline = fixtures['checkpoint_cases'][0]['value']
    count += checkpoint_witnesses(owner, owner.checkpoint_errors, baseline, cp_schema, original_context)
    protocol = next(c for c in fixtures['isolated_cases'] if c['name'] == 'valid_protocol')
    settled = protocol.get('original', original_context)
    assert not owner.protocol_errors(copy.deepcopy(protocol['value']), copy.deepcopy(settled))
    count += protocol_shape_witnesses(owner.protocol_errors, protocol['value'], settled, 'alert')
    retained = copy.deepcopy(fixtures['append_operations']['settled'])
    event = copy.deepcopy(fixtures['history']['expected']['event'])
    proof = dict(copy.deepcopy(protocol['value']), retry_command=copy.deepcopy(retained['original_command']),
                 retry_payload=copy.deepcopy(retained['payload']), append_original=copy.deepcopy(event),
                 append_resolution=copy.deepcopy(event), receipt_event_id=retained['event_id'])
    assert not owner.protocol_errors(copy.deepcopy(proof), copy.deepcopy(retained))
    count += retained_retry_witnesses(owner, owner.protocol_errors, proof, retained, 'idempotency_conflict',
                                      'foreign original append family/scope/identity')
    count += current_retry_witnesses(owner.protocol_errors, protocol['value'], settled, 'idempotency_conflict',
                                     lambda op: dict(op, state='prepared'))
    reader = lambda request, expected: owner.historical_alert_page(request, expected, family, payload_schema, cp_schema)
    count += history_witnesses(owner, fixtures, baseline, reader)
    return count


def panel_all(owner, tables, family, fixture, payload_schema, op_schema, cp_schema, context, reader):
    operation = fixture['settled_operation']
    count = panel_operation(owner, tables, family, operation, op_schema, payload_schema)
    count += expect(unencodable(operation, lambda v: owner.operation_errors(v, op_schema, payload_schema, family['event_type']),
                                'operation has no canonical MessagePack encoding'), 1, 'operation_unencodable')
    for prior in (2 ** 53, 2 ** 64 - 2):  # CV-1100: no lane cap on host revisions
        value = copy.deepcopy(operation)
        value['payload']['prior_host_revision'] = value['original_command']['prior_host_revision'] = prior
        value['prior_host_snapshot']['host_revision'] = prior
        value['payload']['new_host_revision'] = value['candidate_host_snapshot']['host_revision'] = prior + 1
        value['request_digest'] = owner.request_digest(value['original_command'], value['payload'])
        count += expect(owner.operation_errors(value, op_schema, payload_schema, family['event_type']), [], 'large_host_revision_' + str(prior))
    count += panel_home_project(owner, fixture['payload_cases'], payload_schema)
    count += checkpoint_witnesses(owner.shared, owner.checkpoint_errors, fixture['checkpoint'], cp_schema, operation, server=True)
    count += protocol_shape_witnesses(owner.protocol_errors, context, operation, 'panel')
    count += retained_retry_witnesses(owner.shared, owner.protocol_errors, context, operation, 'retry changed',
                                      'foreign original append family/scope/identity')
    count += current_retry_witnesses(owner.protocol_errors, context, operation, 'retry changed', lambda op: dict(op, state='prepared'))
    count += history_witnesses(owner.shared, fixture, fixture['checkpoint'], reader)
    return count


def concern_all(owner, tables, fixture, payload_schema, op_schema, context, reader):
    original = fixture['settled_operation']
    count = concern_operation(owner, tables, original, op_schema, payload_schema)
    count += expect(unencodable(original, lambda v: owner.operation_errors(v, op_schema, payload_schema),
                                'operation has no canonical MessagePack encoding'), 1, 'operation_unencodable')
    count += protocol_shape_witnesses(owner.protocol_errors, context, original, 'concern')
    count += concern_creator_type(owner, context, original)
    count += history_witnesses(owner.shared, fixture, fixture['checkpoint'], reader)
    return count


def unencodable(value, check, code):
    """SP-1100 size rows: an integer beyond -2^63..2^64-1 at a schema slot with no upper bound.

    Tries each integer leaf of the valid parent in order; returns 1 when a single change
    is refused exactly [code], or 0 when every integer slot is schema-bounded inside the
    recipe domain (the report then proves the row unreachable).
    """
    def leaves(node, path):
        if type(node) is dict:
            for key, child in node.items():
                yield from leaves(child, path + [key])
        elif type(node) is list:
            for index, child in enumerate(node):
                yield from leaves(child, path + [index])
        elif type(node) is int:
            yield path
    for path in list(leaves(value, [])):
        for bad in (2 ** 64, -2 ** 63 - 1):
            altered = copy.deepcopy(value)
            parent = altered
            for key in path[:-1]:
                parent = parent[key]
            parent[path[-1]] = bad
            if check(altered) == [code]:
                return 1
    return 0
