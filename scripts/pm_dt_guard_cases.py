"""DT witness corpora for the guard-table suites (ported from the retired pm-dt-guard-isolation.py).

Each corpus returns (label, call, accepting) triples: call runs one complete
checker boundary (source_valid, checkpoint_result, recovery, historical_read,
append_model or an owner transition helper) on a single-defect input built from
a valid base; accepting is the result that would mean acceptance. The suite
builder (pm_dt_guard_suites.py) runs every call once under the checker's
observation recorder and asserts it is refused. These corpora were the AST
proof's negatives; the AST rewrite, function replacement and matrix machinery
are not ported: the shared tool cuts table rows instead.
"""
import copy

def closure(dt, f):
    return copy.deepcopy([f[k] for k in ['prepared_source', 'completed_source', 'event_record']])

def source_corpus(dt, c, f, schemas):
    """Authored/source/semantic/standing negatives, with their exact valid bases."""
    result = []
    def add(label, values, base=None, **kwargs):
        base = closure(dt, f) if base is None else base
        assert dt.source_valid(c, *base, schemas, **kwargs) == 'accepted', (c['event_type'], label, 'invalid base')
        result.append((label, lambda values=values, kwargs=kwargs: dt.source_valid(c, *values, schemas, **kwargs), 'accepted'))
    a, b, e = closure(dt, f)
    for case in f['semantic_negatives']:
        base, negative = dt.semantic_case(f, case)
        add('semantic/' + case['case'], negative, base)
    for case in f.get('source_join_negatives', []):
        add('source_join/' + case['case'], [case[k] for k in ['prepared', 'completed', 'event']])
    add('size/oversized_inline', dt.oversized_inline(c, f))
    add('replay/current_writer', [a, b, dict(e, replay_policy='projector_replay_only')])
    aa, bb, ee = closure(dt, f)
    aa['scope_partition'] = bb['scope_partition'] = ee['project_id']
    bb['prepared_sha256'] = dt.hashlib.sha256(dt.source_bytes(aa)).hexdigest()
    add('partition/raw_project_id', [aa, bb, ee])
    for case in f['positive_variants']:
        if case['event']['scope_kind'] != 'application':
            continue
        for label, key in [('literal_ids', 'application@1:' + case['completed']['application_scope']['server_id'] + ':' + case['completed']['owner_operation_id']),
                           ('wrong_server', 'application@1:' + 'other-server'.encode().hex() + ':' + case['completed']['owner_operation_id'].encode().hex()),
                           ('wrong_prefix', case['event']['idempotency_key'].replace('application@1:', 'application:'))]:
            x, y, z = copy.deepcopy([case[k] for k in ['prepared', 'completed', 'event']])
            z['idempotency_key'] = key
            z['event_id'] = 'evt_dt_' + dt.hashlib.sha256(key.encode()).hexdigest()
            for v in [x, y]:
                v['idempotency_key'] = key; v['event_id'] = z['event_id']
            if c['event_type'] == 'usage.event':
                y['payload']['usage_event_ref'] = z['payload']['usage_event_ref'] = z['event_id']
            y['prepared_sha256'] = dt.hashlib.sha256(dt.source_bytes(x)).hexdigest()
            add('app_key/' + case['case'] + '/' + label, [x, y, z], [case[k] for k in ['prepared', 'completed', 'event']])
    for case in f.get('application_identity_negatives', []):
        variant = next(v for v in f['positive_variants'] if v['case'] == 'authenticated_application_source')
        x, y, z = copy.deepcopy([variant[key] for key in ['prepared', 'completed', 'event']])
        for item in [x, y]:
            dt.set_path(item, case['field'].split('.'), case['value'])
        y['prepared_sha256'] = dt.hashlib.sha256(dt.source_bytes(x)).hexdigest()
        add('application_identity/' + case['case'], [x, y, z], [variant[key] for key in ['prepared', 'completed', 'event']])
    # Single envelope and subject joins: original schemas remain enforced.
    for field, value in [('project_id', 'wrong-project'), ('run_id', 'wrong-run'), ('actor_ref', 'wrong-actor')]:
        base, negative = dt.envelope_case(c, f, field, value)
        add('envelope/' + field, negative, base)
    for field in c['identity_fields']:
        x, y = copy.deepcopy((a, b)); v = y['subject'][field]
        x['subject'][field] = y['subject'][field] = v + 1 if isinstance(v, int) else v + '-other'
        y['prepared_sha256'] = dt.hashlib.sha256(dt.source_bytes(x)).hexdigest()
        add('subject/' + field, [x, y, e])
    if c['scope_policy'] != 'project_only':
        add('scope/envelope_kind', [a, b, dict(e, scope_kind='unsupported')])
    for field in ['run_id', 'thread_id', 'node_id', 'attempt_id', 'project_id']:
        if field not in b['payload']:
            continue
        _, values = dt.envelope_case(c, f, field, 'fixture-other-' + field)
        x, y, z = values
        z[field] = x['envelope_context'][field] = y['envelope_context'][field] = e[field]
        x['scope_partition'] = y['scope_partition'] = dt.partition_for(z)
        key, eid = dt.identity(c, y['payload'], y['scope_partition'])
        for item in [x, y, z]:
            item['idempotency_key'] = key; item['event_id'] = eid
        if c['event_type'] == 'usage.event':
            y['payload']['usage_event_ref'] = z['payload']['usage_event_ref'] = eid
        y['prepared_sha256'] = dt.hashlib.sha256(dt.source_bytes(x)).hexdigest()
        add('payload_envelope/' + field, [x, y, z])
    # Additional one-defect closures cover the remaining source predicates.
    # Sweep 2A: one stage at a time, so each source-schema row has its own witness.
    x, y, z = closure(dt, f)
    x['unexpected'] = 'refused'
    y['prepared_sha256'] = dt.hashlib.sha256(dt.source_bytes(x)).hexdigest()
    add('source_schema/prepared_unexpected', [x, y, z])
    x, y, z = closure(dt, f)
    y['unexpected'] = 'refused'
    add('source_schema/completed_unexpected', [x, y, z])
    x, y, z = closure(dt, f); y['prepared_sha256'] = 'f' * 64
    add('prepare/commitment', [x, y, z])
    x, y, z = closure(dt, f); x['owner_ref'] += '-other'
    y['prepared_sha256'] = dt.hashlib.sha256(dt.source_bytes(x)).hexdigest()
    add('source/immutable_owner', [x, y, z])
    x, y, z = closure(dt, f); x['envelope_context']['actor_ref'] += '-other'
    y['prepared_sha256'] = dt.hashlib.sha256(dt.source_bytes(x)).hexdigest()
    add('source/immutable_envelope', [x, y, z])
    for field in ['event_type', 'payload_schema_id']:
        x, y, z = closure(dt, f); z[field] += '-other'
        add('envelope/' + field, [x, y, z])
    x, y, z = closure(dt, f); z['payload'] = copy.deepcopy(z['payload'])
    z['payload']['schema_version'] = 'other'
    add('payload/unjoined', [x, y, z])
    x, y, z = closure(dt, f)
    z['occurred_at_utc'] = x['envelope_context']['occurred_at_utc'] = y['envelope_context']['occurred_at_utc'] = '2026-11-05T00:00:00Z'
    y['prepared_sha256'] = dt.hashlib.sha256(dt.source_bytes(x)).hexdigest()
    add('envelope/occurrence_time', [x, y, z])
    for key, value in b['runtime_context'].items():
        if value is None:
            continue
        x, y, z = closure(dt, f)
        changed = value + 1 if isinstance(value, int) else value + '-other'
        x['runtime_context'][key] = y['runtime_context'][key] = changed
        y['prepared_sha256'] = dt.hashlib.sha256(dt.source_bytes(x)).hexdigest()
        add('runtime/' + key, [x, y, z])
    if c['event_type'] == 'usage.event':
        x, y, z = closure(dt, f)
        y['payload']['usage_event_ref'] = z['payload']['usage_event_ref'] = 'evt_dt_wrong_usage'
        add('usage/event_ref', [x, y, z])
    ref = dict(e, payload={}, payload_ref='payload:fixture-verified-pack-body')
    add('payload_ref/unverified', [a, b, ref], resolved_payload=b['payload'], payload_ref_verified=False)
    add('payload_ref/changed', [a, b, ref], resolved_payload={}, payload_ref_verified=True)
    for label, base, bad, kwargs in dt.payload_type_cases(f):
        add('payload_type/' + label, bad, base, **kwargs)
    variants = [dict(prepared=a, completed=b, event=e)]
    variants += [v for v in f['positive_variants'] if v['event']['scope_kind'] == 'application'][:1]
    for variant in variants:
        for stage in ['prepared', 'completed']:
            good, bad = dt.source_stage_boundary(c, variant, stage)
            add('source_size/' + variant['event']['scope_kind'] + '/' + stage, bad, good,
                resolved_payload=good[1]['payload'], payload_ref_verified=True)
            if variant['event']['scope_kind'] == 'project':
                raw = dt.canonical(bad[0 if stage == 'prepared' else 1])
                def decode(raw=raw):
                    try:
                        dt.decode_source(raw)
                        return True
                    except ValueError:
                        return False
                result.append(('source_decode_size/' + stage, decode, True))
    return result

def checkpoint_corpus(dt, c, f, schemas):
    cp = schemas[c['event_type'].replace('.', '_') + '_checkpoint']
    result = []
    for case in f['checkpoint_cases']:
        if case['expected'] == 'published':
            continue
        def call(case=case):
            return dt.checkpoint_result(c, case['previous'], case['proposed'], case['context'], cp)
        result.append(('checkpoint/' + case['case'], call, 'published'))
    # Single Storage witness mismatches deliberately preserve other witnesses.
    for path in [('storage_instance_id',), ('index_read_token', 'source_selection', 'storage_instance_id')]:
        case = copy.deepcopy(f['checkpoint_cases'][0])
        dt.set_path(case['proposed'], path, '22222222-2222-4222-8222-222222222222')
        # A changed token is observed coherently; the Storage-join is the defect.
        case['context']['current_token'] = copy.deepcopy(case['proposed']['index_read_token'])
        case['context']['verified_prefix']['index_read_token'] = copy.deepcopy(case['proposed']['index_read_token'])
        result.append(('storage/' + '/'.join(path), lambda case=case: dt.checkpoint_result(c, case['previous'], case['proposed'], case['context'], cp), 'published'))
    case = copy.deepcopy(f['checkpoint_cases'][0]); token = case['proposed']['index_read_token']
    foreign = '22222222-2222-4222-8222-222222222222'
    case['proposed']['storage_instance_id'] = token['storage_instance_id'] = token['source_selection']['storage_instance_id'] = foreign
    token['checkpoint_key'] = 'event_record_index_checkpoint.v1:' + foreign
    token['checkpoint_ref'] = token['checkpoint_key'] + '#/generations/' + token['generation_id']
    case['context']['current_token'] = copy.deepcopy(token)
    case['context']['verified_prefix']['index_read_token'] = copy.deepcopy(token)
    result.append(('storage/coherent_foreign', lambda: dt.checkpoint_result(c, case['previous'], case['proposed'], case['context'], cp), 'published'))
    for key in ['checkpoint_key', 'checkpoint_ref', 'index_dataset_name']:
        changed = copy.deepcopy(f['checkpoint_cases'][0]); token = changed['proposed']['index_read_token']
        token[key] = token[key][:-1] + ('a' if token[key][-1] != 'a' else 'b')
        if key == 'checkpoint_key':
            # Sweep 2A: the ref is derived from the key; keep it coherent so only the key row refuses.
            token['checkpoint_ref'] = token['checkpoint_key'] + '#/generations/' + token['generation_id']
        changed['context']['current_token'] = copy.deepcopy(token)
        changed['context']['verified_prefix']['index_read_token'] = copy.deepcopy(token)
        result.append(('checkpoint/token_binding/' + key, lambda changed=changed: dt.checkpoint_result(c, changed['previous'], changed['proposed'], changed['context'], cp), 'published'))
    for key, value in [('state', 'degraded'), ('health', 'degraded'), ('withdrawn_at_utc', '2026-11-05T00:00:00Z')]:
        changed = copy.deepcopy(f['checkpoint_cases'][0]); changed['proposed'][key] = value
        result.append(('checkpoint/state/' + key, lambda changed=changed: dt.checkpoint_result(c, changed['previous'], changed['proposed'], changed['context'], cp), 'published'))
    changed = copy.deepcopy(f['checkpoint_cases'][0])
    changed['previous']['examined_through_sequence_id'] = changed['proposed']['examined_through_sequence_id'] + 1
    changed['context']['expected_previous'] = copy.deepcopy(changed['previous'])
    result.append(('checkpoint/rollback', lambda: dt.checkpoint_result(c, changed['previous'], changed['proposed'], changed['context'], cp), 'published'))
    return result

def other_corpus(dt, c, f, schemas):
    result = []
    for label, bad, case in dt.recovery_mutations(c, f):
        result.append(('recovery_custody/' + label,
                       lambda bad=bad, case=case: dt.recovery(c, bad, case, schemas)['result'],
                       {'original', 'append_original', 'finalize_original'}))
    for case in f['recovery_cases']:
        if case['expected']['result'] in ['fenced', 'unavailable', 'admission_refused']:
            result.append(('recovery/' + case['case'], lambda case=case: dt.recovery(c, f, case['input'], schemas)['result'],
                           {'original', 'append_original', 'finalize_original'}))
    case = dict(f['recovery_cases'][0]['input'], replay_policy='projector_replay_only')
    result.append(('recovery/replay_only', lambda case=case: dt.recovery(c, f, case, schemas)['result'], {'original', 'append_original', 'finalize_original'}))
    a, b, e = closure(dt, f)
    # SP-1101: originals are sealed by the writer composition (dt.retained_world);
    # the reader resolves them through the shared dispatcher, never from ctx.
    ctx = dict(f['historical_reader_oracle']['context'], live_before=None)

    def read(values, sealed=None, context=ctx):
        with dt.retained_world(*([sealed] if sealed is not None else [])):
            return dt.historical_read(c, *values, schemas, context)['result']
    for key in ['withdrawn', 'permission', 'deleted', 'source_present', 'owner_proven', 'reader_installed', 'versions_supported']:
        changed = dict(ctx, **{key: not ctx[key]})
        result.append(('history/' + key, lambda changed=changed: read([a, b, e], context=changed), 'retained'))
    for label, values in [('forged_event', [a, b, dict(e, correlation_id='forged-correlation')]),
                          ('forged_storage_metadata', [a, b, dict(e, sequence_id=e['sequence_id'] + 1)]),
                          ('forged_source', [a, dict(b, owner_outcome_ref=b['owner_outcome_ref'] + '-forged'), e])]:
        result.append(('history/' + label, lambda values=values: read(values), 'retained'))
    result.append(('history/forged_original_storage_type', lambda: read([a, b, e], sealed=(a, b, dict(e, sequence_id=True))), 'retained'))
    invalid_event = dict(e, sequence_id='invalid-sequence')
    result.append(('history/envelope_schema', lambda: read([a, b, invalid_event], sealed=(a, b, invalid_event)), 'retained'))
    invalid_policy = dict(e, replay_policy='forged_replay_policy')
    result.append(('history/replay_policy_domain', lambda: read([a, b, invalid_policy], sealed=(a, b, invalid_policy)), 'retained'))
    invalid_payload_event = copy.deepcopy(e); invalid_payload_event['payload']['schema_version'] = 'wrong'
    result.append(('history/source_contract', lambda: read([a, b, invalid_payload_event], sealed=(a, b, invalid_payload_event)), 'retained'))
    # SP-1101 custody refusals (HR13): no sealed original at the record's ref, and a binding that differs from custody.
    forged_id = dict(e, event_id='evt_dt_' + '0' * 64)
    result.append(('history/custody_unsealed_ref', lambda: read([a, b, forged_id]), 'retained'))
    forged_key = dict(e, idempotency_key=e['idempotency_key'][:-1] + ('0' if e['idempotency_key'][-1] != '0' else '1'))
    result.append(('history/custody_binding', lambda: read([a, b, forged_key]), 'retained'))
    key = e['idempotency_key']; digest = dt.producer_semantic_digest(e)
    original_result = {'event': e, 'receipt': f['first_append_receipt']}
    for mutation in f['retry_oracle']['producer_mutations']:
        changed_event = dict(e, **{mutation['field']: mutation['value']})
        changed_digest = dt.producer_semantic_digest(changed_event)
        def retry(changed_digest=changed_digest):
            seen = {key: (digest, copy.deepcopy(original_result))}
            return dt.append_model(seen, key, changed_digest, None)[0]
        result.append(('retry/' + mutation['field'], retry, 'original'))
    if c['event_type'] == 'tool.invoked':
        parent = copy.deepcopy(next(v for v in f['positive_variants'] if v['case'] == 'batch_parent'))
        children = [copy.deepcopy(next(v for v in f['positive_variants'] if v['case'] == name)) for name in ['batch_url_1', 'batch_url_2']]
        assert dt.batch_join(parent, children)
        parent['event']['payload']['meta']['batch_role'] = 'child'
        result.append(('batch/parent_role', lambda parent=parent, children=children: dt.batch_join(parent, children), True))
    if c['event_type'] == 'tool.invoked':
        for case in f['batch_cases']:
            if case['expected']:
                continue
            parent = copy.deepcopy(next(v for v in f['positive_variants'] if v['case'] == case['parent_case']))
            children = [copy.deepcopy(next(v for v in f['positive_variants'] if v['case'] == name)) for name in case['child_cases']]
            for change in case.get('changes', []):
                target = parent if change['target'] == 'parent' else children[change['target']]
                dt.set_path(target, change['path'], change['value'])
            result.append(('batch/' + case['case'], lambda parent=parent, children=children: dt.batch_join(parent, children), True))
    if c['event_type'] == 'usage.event':
        for case in f['usage_value_negatives']:
            result.append(('usage_value/' + case['case'], lambda case=case: dt.usage_values_valid(case['payload']), True))
    return result

def boundary_corpus(dt, c, f):
    """Single-field controls at each helper's own typed predicate boundary.

    A source guard and its helper may both enforce a fact. Test each at its
    actual boundary without disabling the other guard in the production path.
    These supplement, rather than replace, the end-to-end authored negatives.
    """
    result = []
    def leaves(value, path=()):
        if isinstance(value, dict):
            for key, child in value.items():
                yield from leaves(child, path + (key,))
        elif isinstance(value, list):
            if not path:
                for index, child in enumerate(value):
                    yield from leaves(child, (index,))
            else:
                yield path, value
        else:
            yield path, value
    def alternatives(value):
        if isinstance(value, bool):
            return [not value]
        if isinstance(value, int):
            return [0, value + 1, 999999]
        if isinstance(value, float):
            return [value + 1]
        if value is None:
            return ['fixture-retained-ref']
        if isinstance(value, list):
            return [[], ['fixture-other']]
        if isinstance(value, str):
            return ['', 'fixture-other', 'unknown', 'adjusted', 'settled', 'priced',
                    'blocked', 'started', 'tool', 'node', '2026-11-05T00:00:00Z']
        return []
    variants = [dict(prepared=f['prepared_source'], completed=f['completed_source'], event=f['event_record'])] + f['positive_variants']
    seen = set()
    for variant in variants:
        b = variant['completed']; p = b['payload']; before = b['before']; outcome = b['owner_result']
        functions = [('transition', [c['event_type'], p, before, outcome])]
        if c['event_type'].startswith('approval.'):
            functions.append(('tool_request_join', [p, before]))
        if c['event_type'].startswith('gate.'):
            functions.append(('gate_score_join', [p, before, outcome]))
        if c['event_type'] == 'usage.event':
            functions.append(('usage_values_valid', [p]))
        for function, arguments in functions:
            if getattr(dt, function)(*arguments) is not True:
                continue
            for path, value in leaves(arguments):
                if not path or path == (0,) and function == 'transition':
                    continue
                for replacement in alternatives(value):
                    if replacement == value:
                        continue
                    changed = copy.deepcopy(arguments); dt.set_path(changed, path, replacement)
                    marker = function + '/' + repr(changed)
                    if marker in seen:
                        continue
                    seen.add(marker)
                    try:
                        negative = getattr(dt, function)(*changed)
                    except (KeyError, TypeError, ValueError, IndexError):
                        continue
                    if negative is not False:
                        continue
                    label = 'boundary/' + function + '/' + str(len(result)) + '/' + '/'.join(map(str, path))
                    result.append((label, lambda function=function, changed=changed: getattr(dt, function)(*changed), True))
            # Repeated observational fields represent one semantic fact. Keep
            # all top-level mirrors aligned when testing a presence/value rule.
            objects = [obj for obj in arguments if isinstance(obj, dict)]
            if function == 'usage_values_valid':
                objects.append(arguments[0]['cost'])
            for key in set().union(*(obj.keys() for obj in objects)):
                matches = [(index, obj[key]) for index, obj in enumerate(objects) if key in obj]
                if len(matches) < 2 or not all(value == matches[0][1] for _, value in matches):
                    continue
                for replacement in alternatives(matches[0][1]) + [None]:
                    if replacement == matches[0][1]:
                        continue
                    changed = copy.deepcopy(arguments)
                    changed_objects = [obj for obj in changed if isinstance(obj, dict)]
                    if function == 'usage_values_valid':
                        changed_objects.append(changed[0]['cost'])
                    for index, _ in matches:
                        changed_objects[index][key] = replacement
                    try:
                        negative = getattr(dt, function)(*changed)
                    except (KeyError, TypeError, ValueError, IndexError):
                        continue
                    if negative is False:
                        label = 'boundary/' + function + '/coherent/' + str(len(result)) + '/' + key
                        result.append((label, lambda function=function, changed=changed: getattr(dt, function)(*changed), True))
    if c['event_type'].startswith('approval.'):
        p = copy.deepcopy(f['valid_payload']); before = copy.deepcopy(f['completed_source']['before'])
        assert dt.tool_request_join(p, before)
        p['tool_use_id'] = before['tool_use_id'] = None; before['request_kind'] = 'tool'
        result.append(('boundary/tool_request_join/coherent_missing_tool', lambda: dt.tool_request_join(p, before), True))
        p_node = copy.deepcopy(f['valid_payload']); p_node.pop('tool_use_id', None)
        b_node = dict(before, request_kind='node', tool_use_id=None)
        assert dt.tool_request_join(p_node, b_node)
        result.append(('boundary/tool_request_join/node_extra_tool', lambda: dt.tool_request_join(dict(p_node, tool_use_id='other-tool'), b_node), True))
        result.append(('boundary/tool_request_join/node_before_tool', lambda: dt.tool_request_join(p_node, dict(b_node, tool_use_id='other-tool')), True))
    if c['event_type'].startswith('gate.'):
        p = copy.deepcopy(f['valid_payload']); b = copy.deepcopy(f['completed_source']['before']); out = copy.deepcopy(f['completed_source']['owner_result'])
        p.update(score=1, score_threshold=0, dispatch_score_ref=None, dispatch_score_tuple={'node_id': 'fixture-node'}, node_id='fixture-node')
        b.update(score_threshold=0, dispatch_score_ref=None, dispatch_score_tuple={'node_id': 'fixture-node'}); out['score'] = 1
        assert dt.gate_score_join(dict(p, dispatch_score_ref='fixture-dispatch-ref'), dict(b, dispatch_score_ref='fixture-dispatch-ref'), out)
        result.append(('boundary/gate_score_join/missing_ref_coherent', lambda: dt.gate_score_join(p, b, out), True))
        p_missing = dict(p, dispatch_score_ref='fixture-dispatch-ref', dispatch_score_tuple=None, node_id=None)
        b_missing = dict(b, dispatch_score_ref='fixture-dispatch-ref', dispatch_score_tuple=None)
        result.append(('boundary/gate_score_join/missing_tuple_coherent', lambda: dt.gate_score_join(p_missing, b_missing, out), True))
    if c['event_type'] == 'usage.event':
        p = copy.deepcopy(f['valid_payload'])
        p['cost_status'] = p['cost']['cost_status'] = 'priced'
        assert dt.usage_values_valid(p)
        p['pricing_snapshot_id'] = p['cost']['pricing_snapshot_id'] = None
        result.append(('boundary/usage_values_valid/priced_missing_snapshot', lambda: dt.usage_values_valid(p), True))
    return result
