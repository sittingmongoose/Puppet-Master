"""DG6B round-9 witnesses (sweep part 2A): one negative for every guard-table row
that the earlier corpus never reached.

Each witness starts from a valid case of its own family and changes one source
fact. Observational copies that follow from that fact (identities, keys,
envelope copies, stored carriers, lookup references) are re-derived before the
call; the stale copy, where a witness tests a copy join, is the one change.
Every call is a complete checker boundary (append, retry, operation recovery,
retained history) or the named relational helper the row lives in, and every
witness names the row that must refuse it first. Nothing here decides a result.
"""
import copy

from pm_dg6b_full_oracles import clone, rebuild


def scope_of(case):
    source = case['source']
    return source['request']['scope'] if 'request' in source else source['scope']


def alternative(key, value):
    """A different, type-preserving value for a copy-join witness (another enum member for enums)."""
    enums = {'command_id': ('cmd.persona.delete', 'cmd.persona.export'), 'result_status': ('refused', 'conflict')}
    if key in enums:
        return next(v for v in enums[key] if v != value)
    if value is None:
        return {'source_id': 'other-persona', 'source_revision': 1, 'source_sha256': 'a' * 64,
                'project_version_id': 'project-version-other', 'expected_owner_revision': 1}.get(key, 'other')
    if type(value) is int:
        return value + 1
    if type(value) is str:
        if len(value) == 64 and all(c in '0123456789abcdef' for c in value):
            return value[:-1] + ('0' if value[-1] != '0' else '1')
        if value.startswith('ref:'):
            return value + '/other'
        return value + '-other'
    raise TypeError(key)


def family_cases(m, row, schema):
    """[(label, target_row, code, call)] for one family."""
    name = row['event_type']
    persona = name.startswith('persona.')
    valid = row['append_valid']
    base = clone(valid[0])
    project = next((clone(c) for c in valid if scope_of(c)['scope_kind'] == 'project'), None)
    out = []

    def add(label, target, code, call):
        out.append(('round9/' + label, target, code, call))

    def append(case):
        return lambda: m['complete_append_contract'](name, case, schema)

    # Frozen Storage instance copy: only the source copy changes.
    bad = clone(base); bad['source']['storage_instance_id'] = 'storage-instance-other'
    add('frozen/storage_instance', 'FS02_storage_instance', 'original_source_join', append(bad))

    # EventRecord fields joined to the family and source (one field each).
    bad = clone(base); bad['event_record']['redaction_profile'] = 'no_secrets'
    add('envelope/redaction_profile', 'EJ05_redaction_profile', 'envelope_source_join', append(bad))
    bad = clone(base)
    if scope_of(base)['scope_kind'] == 'application':
        bad['event_record'].update(scope_kind='project', project_id='project-other')
    else:
        bad['event_record'].update(scope_kind='application', project_id=None)
    add('envelope/scope_kind', 'EJ06_scope_kind', 'envelope_source_join', append(bad))
    if project is not None:
        bad = clone(project); bad['event_record']['project_id'] = 'project-other'
        add('envelope/project_id', 'EJ07_project_id', 'envelope_source_join', append(bad))
    for field, row_name in (('run_id', 'EJ11_run_id'), ('node_id', 'EJ12_node_id'), ('attempt_id', 'EJ13_attempt_id')):
        bad = clone(base); bad['event_record'][field] = field.split('_')[0] + '-foreign'
        add('envelope/' + field, row_name, 'envelope_source_join', append(bad))

    # Record partition copy against an application scope (every family).
    bad = clone(base); bad['scope_partition'] = 'project~b3RoZXI'
    add('partition/record_against_scope', 'PA02_record_partition', 'partition', append(bad))
    if project is not None and not persona:
        bad = clone(project); bad['source']['scope']['scope_partition'] = 'project~b3RoZXI'
        add('partition/source_scope_copy', 'PA01_scope_partition', 'partition', append(bad))

    # Relational helpers called directly: type shape and the original Server.
    p, source = clone(row['valid']), clone(row['source'])
    if persona:
        sk = row['scope_key']
        add('helper/payload_types', 'PT01_payload_types', 'payload_types',
            lambda: m['persona_semantic'](name, {**p, 'revision': 'one'}, sk, source))
        empty = clone(p); empty['scope']['server_id'] = ''
        add('helper/empty_server', 'OS02_server_nonempty', 'original_server_required', lambda: m['identity'](name, empty, sk))
    else:
        server = source['scope']['server_id']
        eid = m['identity'](name, p, 'application', server)[0]
        add('helper/payload_types', 'PT01_payload_types', 'payload_types',
            lambda: m['semantic'](name, {**p, 'revision': 'one'}, 'application', eid, server_id=server))
        add('helper/null_server', 'OS01_server_string', 'original_server_required',
            lambda: m['identity'](name, p, 'application', None))
        add('helper/empty_server', 'OS02_server_nonempty', 'original_server_required',
            lambda: m['identity'](name, p, 'application', ''))

    # Retry from another Server: equal event ID (application scope key), new CV-366 key.
    if not persona:
        app = next(clone(c) for c in valid if scope_of(c)['scope_kind'] == 'application')
        other = clone(app); other['source']['scope']['server_id'] = 'server-other'; other = rebuild(m, name, other)
        add('retry/other_server', 'RY02_idempotency_key', 'retry_identity',
            lambda: m['complete_append_contract'](name, other, schema, original=app))

    # Operation recovery: lookup reference, carrier reference fields, undecodable
    # and schema-invalid decoded bodies. Each stays coherent elsewhere.
    from blake3 import blake3
    logical = m['make_operation'](name, base)
    value, resolved = m['store_operation'](logical, True)

    def recover(v, r):
        def call():
            m['complete_append_contract'](name, base, schema)
            return m['operation_contract'](name, v, r, logical, schema)
        return call
    bad = clone(resolved); bad['ref'] = 'ref:payload/' + '0' * 64
    add('operation/lookup_ref', 'RA02_resolved_ref', 'payload_ref_unavailable', recover(value, bad))
    other_id = '1' * 64 if value['payload_ref']['blake3_id'] != '1' * 64 else '2' * 64
    v = clone(value); v['payload_ref']['blake3_id'] = other_id
    r = clone(resolved); r['ref'] = 'ref:payload/' + other_id
    add('operation/ref_blake3', 'OF01_ref_blake3', 'payload_ref_integrity', recover(v, r))
    v = clone(value); v['payload_ref']['byte_size'] += 1
    add('operation/ref_byte_size', 'OF02_ref_size', 'payload_ref_integrity', recover(v, resolved))
    body = b'\xc1'
    digest = blake3(body).hexdigest()
    v = clone(value); v['payload_ref'] = {'blake3_id': digest, 'byte_size': 1, 'media_type': 'application/msgpack'}
    r = {'ref': 'ref:payload/' + digest, 'blake3_id': digest, 'byte_size': 1, 'media_type': 'application/msgpack',
         'bytes_hex': body.hex(), 'durable': True, 'access_current': True}
    add('operation/undecodable_body', 'OF04_decodes', 'payload_ref_integrity', recover(v, r))
    extended = clone(logical); extended['unexpected_field'] = 'must-refuse'
    v, r = m['store_operation'](extended, True)
    add('operation/decoded_extension', 'OG01_logical_operation', 'operation_schema', recover(v, r))

    if persona:
        out.extend(persona_cases(m, row, schema, base, project, append))
    return out


def persona_cases(m, row, schema, base, project, append):
    name = row['event_type']
    out = []

    def add(label, target, code, call):
        out.append(('round9/' + label, target, code, call))

    # Source scope read from the owner request: an invalid stale request copy.
    bad = clone(base); bad['source']['request']['scope']['server_id'] = ''
    add('scope/request_scope_schema', 'SC01_source_scope', 'scope', append(bad))
    # Request scope differs from the payload scope with the same key.
    bad = clone(project); bad['source']['request']['scope']['project_home_server_id'] = 'server-home-other'
    add('scope/request_scope_copy', 'PC02_request_scope', 'scope', append(bad))
    # The relational helper keys on a strictly validated payload scope.
    direct = clone(project); scope = direct['payload']['scope']; scope['scope_partition'] += '\n'
    add('helper/payload_scope_strict', 'PSS01_payload_scope', 'scope',
        lambda: m['persona_semantic'](name, direct['payload'], m['source_scope_key'](project['source']), direct['source']))
    # Project home rules.
    app = next(clone(c) for c in row['append_valid'] if scope_of(c)['scope_kind'] == 'application')
    bad = clone(app); bad['payload'].update(home_kind='project', home_project_id='project-other',
                                            project_version_id='project-version-other')
    bad = rebuild(m, name, bad)
    add('home/project_home_in_application', 'PH01_project_home_scope', 'home_scope', append(bad))
    bad = clone(project); bad['payload']['home_kind'] = 'project'; bad['payload']['home_project_id'] = 'project-other'
    if bad['payload']['project_version_id'] is None:
        bad['payload']['project_version_id'] = 'project-version-other'
    bad = rebuild(m, name, bad)
    add('home/project_home_other_project', 'PH02_project_home_id', 'home_scope', append(bad))
    # Copy joins: one stale owner copy each.
    bad = clone(base); bad['source']['owner_request_ref'] = base['payload']['owner_request_ref'] + '/other'
    add('copy/owner_request_ref', 'RQ01_owner_request_ref', 'original_source_join', append(bad))
    for index, key in enumerate(m['REQUEST_KEYS'], 1):
        bad = clone(base); bad['source']['request'][key] = alternative(key, base['payload'][key])
        add('copy/request/' + key, f'QK{index:02}_{key}', 'original_source_join', append(bad))
    for index, (payload_key, result_key) in enumerate(m['RESULT_KEYS'], 1):
        bad = clone(base); bad['source']['result'][result_key] = alternative(payload_key, base['payload'][payload_key])
        add('copy/result/' + result_key, f'RR{index:02}_{payload_key}', 'original_source_join', append(bad))
    bad = clone(base); bad['source']['request']['destination_home_ref'] = base['payload']['home_ref'] + '/other'
    add('copy/request/destination_home_ref', 'HC01_home_ref', 'original_source_join', append(bad))
    bad = clone(base)
    bad['source']['request']['whole_record_sha256'] = alternative('sha', base['payload']['content_sha256'])
    add('copy/request/whole_record_sha256', 'HC02_content_sha256', 'original_source_join', append(bad))
    if name == 'persona.created':
        out.extend(creation_cases(m, row, add, append))
    if name == 'persona.updated':
        out.extend(update_cases(m, row, base, add, append))
    if name == 'persona.selected':
        out.extend(selection_cases(m, row, schema, base, add, append))
    return out


def creation_cases(m, row, add, append):
    name = row['event_type']
    dup = next(clone(c) for c in row['append_valid'] if c['payload']['command_id'] == 'cmd.persona.duplicate')
    plain = next(clone(c) for c in row['append_valid'] if c['payload']['command_id'] == 'cmd.persona.create')
    for key, row_name in (('source_id', 'CR01_duplicate_source_id'), ('source_revision', 'CR02_duplicate_source_revision'),
                          ('source_sha256', 'CR03_duplicate_source_sha256')):
        bad = clone(dup); bad['payload'][key] = None; bad = rebuild(m, name, bad)
        add('creation/duplicate_' + key, row_name, 'creation_source', append(bad))
    bad = clone(dup); bad['payload']['result_status'] = 'created'; bad = rebuild(m, name, bad)
    add('creation/duplicate_status', 'CR05_duplicate_status', 'creation_source', append(bad))
    bad = clone(plain)
    if plain['payload']['source_id'] is None:
        bad['payload']['source_id'] = 'other-persona'
    else:
        bad['payload']['source_sha256'] = None
    bad = rebuild(m, name, bad)
    add('creation/plain_partial_source', 'CR06_create_source_all_or_none', 'creation_source', append(bad))
    bad = clone(plain); bad['payload']['result_status'] = 'duplicated'; bad = rebuild(m, name, bad)
    add('creation/plain_status', 'CR07_create_status', 'creation_source', append(bad))
    return []


def update_cases(m, row, base, add, append):
    name = row['event_type']
    p = base['payload']
    bad = clone(base)
    bad['payload']['expected_owner_revision'] = p['source_revision'] - 1 if p['source_revision'] > 0 else p['source_revision'] + 1
    bad = rebuild(m, name, bad)
    add('update/expected_not_source_revision', 'UC01_expected_is_source_revision', 'cas', append(bad))
    for key, row_name in (('source_id', 'UC03_source_id_named'), ('source_revision', 'UC04_source_revision_named'),
                          ('source_sha256', 'UC05_source_sha256_named')):
        bad = clone(base); bad['payload'][key] = None; bad = rebuild(m, name, bad)
        add('update/null_' + key, row_name, 'cas', append(bad))
    return []


def selection_cases(m, row, schema, base, add, append):
    name = row['event_type']
    for index, key in enumerate(('thread_id', 'run_id', 'node_id', 'attempt_id', 'actor_id'), 1):
        bad = clone(base); bad['payload']['runtime_lineage'][key] = key.split('_')[0] + '-lineage'
        bad = rebuild(m, name, bad)
        add('override/empty_lineage_' + key, f'OE{index:02}_{key}', 'override_lineage', append(bad))
    bad = clone(base); bad['payload'].update(persona_override_scope='thread', persona_override_owner_id='tier_id')
    bad = rebuild(m, name, bad)
    add('override/tier_id_owner', 'OO02_owner_not_tier', 'override_lineage', append(bad))
    resolution = base['source']['resolution']

    def restored(case):
        case['source']['resolution_value'], case['source']['resolved_resolution'] = m['store_resolution'](case['source']['resolution'])
        return case
    bad = clone(base); bad['source']['resolution']['runtime_lineage']['thread_id'] = 'thread-resolution-other'
    add('copy/resolution/runtime_lineage', 'LC01_runtime_lineage', 'original_source_join', append(restored(bad)))
    enums = {'persona_selection_source': ('fallback', 'user_selected'), 'persona_override_scope': ('thread', 'run')}
    for index, key in enumerate(m['RESOLUTION_KEYS'], 1):
        bad = clone(base)
        current = resolution.get(key)
        if key in enums:
            bad['source']['resolution'][key] = next(v for v in enums[key] if v != current)
        else:
            bad['source']['resolution'][key] = alternative(key, current)
        add('copy/resolution/' + key, f'SL{index:02}_{key}', 'original_source_join', append(restored(bad)))
    # Resolution carrier by reference: lookup, header fields, undecodable and
    # non-canonical bodies, each coherent elsewhere.
    import msgpack
    from blake3 import blake3
    good = clone(base)
    good['source']['resolution_value'], good['source']['resolved_resolution'] = m['store_resolution'](resolution, True)
    value, resolved = good['source']['resolution_value'], good['source']['resolved_resolution']

    def carrier(v, r):
        case = clone(good); case['source']['resolution_value'], case['source']['resolved_resolution'] = v, r
        return append(case)
    other_id = '1' * 64 if value['payload_ref']['blake3_id'] != '1' * 64 else '2' * 64
    v = clone(value); v['payload_ref']['blake3_id'] = other_id
    r = clone(resolved); r['ref'] = 'ref:payload/' + other_id
    add('resolution/ref_blake3', 'RF01_ref_blake3', 'payload_ref_integrity', carrier(v, r))
    v = clone(value); v['payload_ref']['byte_size'] += 1
    add('resolution/ref_byte_size', 'RF02_ref_size', 'payload_ref_integrity', carrier(v, resolved))
    body = b'\xc1'
    digest = blake3(body).hexdigest()
    v = clone(value); v['payload_ref'] = {'blake3_id': digest, 'byte_size': 1, 'media_type': 'application/msgpack'}
    r = {'ref': 'ref:payload/' + digest, 'blake3_id': digest, 'byte_size': 1, 'media_type': 'application/msgpack',
         'bytes_hex': body.hex(), 'durable': True, 'access_current': True}
    add('resolution/undecodable_body', 'RF04_decodes', 'payload_ref_integrity', carrier(v, r))
    body = msgpack.packb(resolution, use_bin_type=True)
    digest = blake3(body).hexdigest()
    v = clone(value); v['payload_ref'] = {'blake3_id': digest, 'byte_size': len(body), 'media_type': 'application/msgpack'}
    r = {'ref': 'ref:payload/' + digest, 'blake3_id': digest, 'byte_size': len(body), 'media_type': 'application/msgpack',
         'bytes_hex': body.hex(), 'durable': True, 'access_current': True}
    add('resolution/noncanonical_body', 'RF05_canonical', 'payload_ref_integrity', carrier(v, r))
    out = [('round9/resolution/reference_positive', None, None, append(good))]
    return out


def shared_cases(m, schema, fixtures, grade, registry, values, expected):
    """[(label, target_row, code, call)] for the shared fences."""
    out = []

    def add(label, target, code, call):
        out.append(('round9/' + label, target, code, call))
    bad = copy.deepcopy(schema); bad['$defs']['round9_dangling'] = {'$ref': '#/$defs/round9_missing'}
    add('references/dangling_unused_definition', 'R02_references_resolve', 'unresolved_schema_ref',
        lambda: m['resolve_schema_graph'](bad))
    invalid = copy.deepcopy(schema); invalid['$defs']['round9_invalid'] = {'type': 5}
    add('references/invalid_schema_keyword', 'R01_metaschema', 'invalid_schema', lambda: m['resolve_schema_graph'](invalid))

    def prepare(fx=fixtures, gr=grade, rg=registry, vl=values):
        return lambda: m['preparation_contract'](expected, fx, gr, rg, vl, schema)
    fx = dict(fixtures, families=[dict(r) for r in fixtures['families']]); fx['families'][0]['event_type'] = 'plugin.round9_unknown'
    add('preparation/fixture_family_renamed', 'PR01_fixture_families', 'fixture_family_coverage', prepare(fx=fx))
    fx = dict(fixtures, families=list(fixtures['families']) + [fixtures['families'][0]])
    add('preparation/fixture_row_repeated', 'PR02_fixture_rows', 'fixture_family_coverage', prepare(fx=fx))
    gr = dict(grade, rows=[dict(r) for r in grade['rows']]); gr['rows'][0]['event_type'] = 'plugin.round9_unknown'
    add('preparation/grade_family_renamed', 'PR03_grade_families', 'grade_family_coverage', prepare(gr=gr))
    gr = dict(grade, rows=[dict(r) for r in grade['rows']]); gr['rows'][0]['disposition'] = 'REGISTERED'
    add('preparation/grade_dispositioned', 'PR04_undispositioned', 'unadmitted_disposition', prepare(gr=gr))
    rg = dict(registry, families=list(registry['families']) + [{'event_type': sorted(expected)[0]}])
    add('preparation/family_registered', 'PR05_unregistered', 'prepared_membership', prepare(rg=rg))
    slug = sorted(expected)[0].replace('.', '_') + '_operation'

    def value_with(**changes):
        vl = dict(values, families=[dict(r, **changes) if r['family_id'] == slug else r for r in values['families']])
        return vl
    add('preparation/retention_assigned', 'PR06_retention_pending', 'retention_pending',
        prepare(vl=value_with(retention_policy_ref='retention.round9')))
    add('preparation/value_schema_invalid', 'PR07_value_schema_valid', 'invalid_schema',
        prepare(vl=value_with(value_schema={'type': 5})))
    current = next(r for r in values['families'] if r['family_id'] == slug)['value_schema']
    add('preparation/value_schema_rebound', 'PR08_operation_binding', 'operation_schema_binding',
        prepare(vl=value_with(value_schema=dict(current, description='round9 rebinding'))))
    return out
