#!/usr/bin/env python3
"""Check 11: remove one actual predicate/rule, rerun the negative corpus, restore.

No acceptance shortcut is installed. AST mutations change one rejecting test or
one conjunct; JSON Schema mutations change one rule at its validation boundary.
The table identifies every case that flips and every unrelated case that stays
rejected. Authenticated-owner and Storage adapters remain assumed.
"""
import ast
import contextlib
import copy
import inspect
import json
from pathlib import Path


def function_mutants(dt):
    """Discover rejecting predicates rather than maintaining a line-number list."""
    functions = ['source_valid', 'checkpoint_result', 'recovery', 'historical_read',
                 'transition', 'gate_score_join', 'tool_request_join',
                 'usage_values_valid', 'batch_join', 'denial_emission', 'append_model', 'identity', 'decode_source',
                 'producer_semantic_bytes', 'current_numbers_valid', 'accounting_totals', 'unsigned_integer_valid', 'retained_schema']
    for name in functions:
        tree = ast.parse(inspect.getsource(getattr(dt, name)))
        function = tree.body[0]
        edits = []
        for node in ast.walk(function):
            if name == 'retained_schema' and isinstance(node, ast.If) and node.body and isinstance(node.body[0], ast.Continue):
                edits.append((node.test, False))
            if name in ['append_model', 'accounting_totals'] and isinstance(node, ast.If) and 'type(' in ast.unparse(node.test):
                edits.append((node.test, False))
            if name == 'accounting_totals' and isinstance(node, ast.If) and 'Draft202012Validator' in ast.unparse(node.test):
                edits.append((node.test, False))
            if name in ['identity', 'producer_semantic_bytes'] and isinstance(node, ast.If) and ('current_numbers_valid' in ast.unparse(node.test) or 'type(historical)' in ast.unparse(node.test) or "'blocked_sequence' in contract" in ast.unparse(node.test)):
                edits.append((node.test, False))
            if name == 'decode_source' and isinstance(node, ast.If) and ast.unparse(node.test) == 'len(raw) > 1048576':
                edits.append((node.test, False))
            if (name == 'identity' and isinstance(node, ast.If) and "operation != application['owner_operation_id']" == ast.unparse(node.test)):
                edits.append((node.test, False))
            if isinstance(node, ast.If) and node.body and isinstance(node.body[0], ast.Return):
                value = node.body[0].value
                # Family dispatch and successful early returns are selectors.
                refusal = ((isinstance(value, ast.Constant) and (value.value is False or
                            value.value in ['schema_refused', 'original_source_refused', 'scope_refused',
                                            'payload_unavailable', 'join_refused', 'identity_refused', 'numeric_domain_refused',
                                            'transition_refused', 'payload_ref_required', 'source_stage_too_large', 'unavailable',
                                            'cas_lost', 'source_changed', 'coverage_refused', 'no_emission']))
                           or isinstance(value, ast.IfExp) and name == 'source_valid'
                           or isinstance(value, ast.Name) and value.id == 'unavailable'
                           or isinstance(value, ast.Dict) and any(isinstance(v, ast.Constant) and
                              v.value in ['unavailable', 'fenced', 'admission_refused',
                                          'replay_only_not_appendable'] for v in value.values))
                if refusal:
                    edits.append((node.test, False))
            if name == 'append_model' and isinstance(node, ast.Return) and isinstance(node.value, ast.IfExp):
                edits.append((node.value.test, True))
            if isinstance(node, ast.Return) and isinstance(node.value, ast.BoolOp) and isinstance(node.value.op, ast.And):
                # Remove a single clause, retaining every other clause/helper.
                edits.extend((value, True) for value in node.value.values)
            if isinstance(node, ast.Return) and isinstance(node.value, ast.Compare) and name in ['batch_join', 'gate_score_join', 'current_numbers_valid']:
                edits.append((node.value, True))
        for expression, replacement in edits:
            original = ast.unparse(expression)
            mutated = copy.deepcopy(tree)
            class Replace(ast.NodeTransformer):
                def visit(self, node):
                    if (type(node) is type(expression) and getattr(node, 'lineno', None) == expression.lineno
                            and getattr(node, 'col_offset', None) == expression.col_offset):
                        return ast.copy_location(ast.Constant(replacement), node)
                    return super().visit(node)
            mutated = Replace().visit(mutated)
            namespace = {}
            exec(compile(ast.fix_missing_locations(mutated), '<DT single guard removal>', 'exec'), dt.__dict__, namespace)
            line = inspect.getsourcelines(getattr(dt, name))[1] + expression.lineno - 1
            yield {'id': name + ':' + str(line) + ':' + original, 'function': name,
                   'line': line, 'predicate': original, 'replacement': replacement,
                   'callable': namespace[name]}


@contextlib.contextmanager
def replace_function(dt, name, replacement):
    original = getattr(dt, name)
    setattr(dt, name, replacement)
    try:
        yield
    finally:
        setattr(dt, name, original)


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
    x, y, z = closure(dt, f)
    x['unexpected'] = y['unexpected'] = 'refused'
    y['prepared_sha256'] = dt.hashlib.sha256(dt.source_bytes(x)).hexdigest()
    add('source_schema/unexpected', [x, y, z])
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
    ctx = dict(f['historical_reader_oracle']['context'], authenticated_original={'prepared': a, 'completed': b, 'event': e}, live_before=None)
    for key in ['withdrawn', 'permission', 'deleted', 'source_present', 'owner_proven', 'reader_installed', 'versions_supported']:
        changed = dict(ctx, **{key: not ctx[key]})
        result.append(('history/' + key, lambda changed=changed: dt.historical_read(c, a, b, e, schemas, changed)['result'], 'retained'))
    for label, values in [('forged_event', [a, b, dict(e, correlation_id='forged-correlation')]),
                          ('forged_storage_metadata', [a, b, dict(e, sequence_id=e['sequence_id'] + 1)]),
                          ('forged_source', [a, dict(b, owner_outcome_ref=b['owner_outcome_ref'] + '-forged'), e])]:
        result.append(('history/' + label, lambda values=values: dt.historical_read(c, *values, schemas, ctx)['result'], 'retained'))
    typed_context = copy.deepcopy(ctx)
    typed_context['authenticated_original']['event']['sequence_id'] = True
    result.append(('history/forged_original_storage_type', lambda: dt.historical_read(c, a, b, e, schemas, typed_context)['result'], 'retained'))
    invalid_event = dict(e, sequence_id='invalid-sequence')
    invalid_ctx = dict(ctx, authenticated_original={'prepared': a, 'completed': b, 'event': invalid_event})
    result.append(('history/envelope_schema', lambda: dt.historical_read(c, a, b, invalid_event, schemas, invalid_ctx)['result'], 'retained'))
    invalid_policy = dict(e, replay_policy='forged_replay_policy')
    policy_ctx = dict(ctx, authenticated_original={'prepared': a, 'completed': b, 'event': invalid_policy})
    result.append(('history/replay_policy_domain', lambda: dt.historical_read(c, a, b, invalid_policy, schemas, policy_ctx)['result'], 'retained'))
    invalid_payload_event = copy.deepcopy(e); invalid_payload_event['payload']['schema_version'] = 'wrong'
    invalid_payload_ctx = dict(ctx, authenticated_original={'prepared': a, 'completed': b, 'event': invalid_payload_event})
    result.append(('history/source_contract', lambda: dt.historical_read(c, a, b, invalid_payload_event, schemas, invalid_payload_ctx)['result'], 'retained'))
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


def accepts(value, expected):
    return any(value == item for item in expected) if isinstance(expected, set) else value == expected


def safe_call(call):
    try:
        return call()
    except (KeyError, TypeError, ValueError, IndexError) as exc:
        # A cascading absent field is not a passing negative.
        return {'exception': type(exc).__name__, 'message': str(exc)}


def equivalent_path(path):
    """Name the two deliberate source-payload copies, preserving every rule below."""
    path = tuple(path)
    if path[:3] == ('allOf', 0, 'else'):
        path = path[3:]  # The completed-stage observational schema.
    if len(path) >= 4 and path[0] == 'properties' and path[2:4] == ('anyOf', 0):
        path = path[:2] + path[4:]  # The non-null observational schema.
    return path


def schema_table(dt, c, f, schemas):
    """Use the actual validator boundary for missing fields/closedness/grammar."""
    slug = c['event_type'].replace('.', '_')
    cases = []
    def add(definition, label, value):
        cases.append((definition, label, value))
    payload = schemas[slug]
    for key in f['required_field_negatives']:
        bad = copy.deepcopy(f['valid_payload']); del bad[key]
        add(slug, 'payload/missing/' + key, bad)
    for key, value in [('unexpected', 'refused'), ('schema_id', 'wrong'), ('schema_version', '2.0.0')]:
        add(slug, 'payload/invalid/' + key, dict(f['valid_payload'], **{key: value}))
    for stage in ['prepared_source', 'completed_source']:
        definition = slug + '_source'
        for key in schemas[definition]['required']:
            bad = copy.deepcopy(f['prepared_source'] if key == 'stage' else f[stage]); del bad[key]
            add(definition, stage + '/missing/' + key, bad)
        add(definition, stage + '/unexpected', dict(f[stage], unexpected='refused'))
    for key in schemas[slug + '_checkpoint']['required']:
        bad = copy.deepcopy(f['checkpoint']); del bad[key]
        add(slug + '_checkpoint', 'checkpoint/missing/' + key, bad)
    values = [(slug, f['valid_payload']), (slug + '_source', f['prepared_source']),
              (slug + '_source', f['completed_source']), (slug + '_checkpoint', f['checkpoint'])]
    for variant in f['positive_variants']:
        definition = slug + ('_application_source' if variant['event']['scope_kind'] == 'application' else '_source')
        values.extend((definition, variant[key]) for key in ['prepared', 'completed'])
    for number, (definition, value) in enumerate(values):
        for path, identifier, rule in dt.patterned_values(schemas[definition], value):
            bad = copy.deepcopy(value); dt.set_path(bad, path, identifier + '\n')
            add(definition, 'identifier/' + str(number) + '/' + '/'.join(map(str, path)), bad)
    for case in f['checkpoint_cases']:
        if case['expected'] == 'schema_refused':
            add(slug + '_checkpoint', 'checkpoint/' + case['case'], case['proposed'])
    if c['scope_policy'] == 'project_only':
        bad = copy.deepcopy(f['prepared_source']); bad['envelope_context']['scope_kind'] = 'application'
        add(slug + '_source', 'scope/forbidden_application', bad)
    for case in f.get('source_join_negatives', []):
        if case['expected'] != 'schema_refused':
            continue
        definition = slug + ('_application_source' if case['event']['scope_kind'] == 'application' else '_source')
        for stage in ['prepared', 'completed']:
            value = case[stage]
            if not dt.Draft202012Validator(schemas[definition], format_checker=dt.FormatChecker()).is_valid(value):
                add(definition, 'source_join/' + case['case'] + '/' + stage, value)
    for definition, label, value in dt.schema_type_cases(c, f, schemas):
        if label.endswith('/True') or label.endswith('/1') or '/bound/' in label:
            add(definition, 'numeric_boolean/' + label, value)
    validator = lambda schema: dt.Draft202012Validator(schema, format_checker=dt.FormatChecker())
    guards = {}; failures = []
    def leaf_errors(error):
        if error.context:
            children = [leaf for child in error.context for leaf in leaf_errors(child)]
            concrete = [leaf for leaf in children if leaf.validator != 'type']
            return concrete or children
        return [error]
    for definition, label, value in cases:
        errors = list(validator(schemas[definition]).iter_errors(value))
        if not errors:
            failures.append(label + ': baseline did not refuse')
        for error in errors:
            for leaf in leaf_errors(error):
                missing = next((key for key in leaf.schema.get('required', []) if key not in leaf.instance), None) if leaf.validator == 'required' else None
                # The same instance path may have unrelated conditional rules.
                # Only the nullable payload and completed-stage payload are
                # observational copies of the same schema location.
                rule_path = equivalent_path(tuple(leaf.absolute_schema_path))
                rule_value = json.dumps(leaf.schema[leaf.validator], sort_keys=True)
                guard = (definition, tuple(leaf.absolute_path), leaf.validator, missing, rule_path, rule_value)
                guards.setdefault(guard, [])
    def matching_rules(schema, instance_path, keyword, data_path=(), rule_path=()):
        if not isinstance(schema, dict):
            return
        if data_path == instance_path and keyword in schema:
            yield schema, rule_path + (keyword,)
        for key, child in schema.get('properties', {}).items():
            yield from matching_rules(child, instance_path, keyword, data_path + (key,), rule_path + ('properties', key))
        if isinstance(schema.get('items'), dict):
            for part in instance_path[len(data_path):len(data_path)+1]:
                if isinstance(part, int):
                    yield from matching_rules(schema['items'], instance_path, keyword, data_path + (part,), rule_path + ('items',))
        for kind in ['anyOf', 'oneOf', 'allOf']:
            for index, child in enumerate(schema.get(kind, [])):
                yield from matching_rules(child, instance_path, keyword, data_path, rule_path + (kind, index))
        for kind in ['then', 'else']:
            if kind in schema:
                yield from matching_rules(schema[kind], instance_path, keyword, data_path, rule_path + (kind,))
    rows = []
    covered = set()
    for definition, instance_path, keyword, missing, logical_path, rule_value in guards:
        weakened = copy.deepcopy(schemas[definition]); paths = []
        for target, path in matching_rules(weakened, instance_path, keyword):
            if equivalent_path(path) != logical_path or json.dumps(target[keyword], sort_keys=True) != rule_value:
                continue
            if keyword == 'required':
                if missing not in target['required']:
                    continue
                target['required'].remove(missing)
            elif keyword == 'additionalProperties':
                target.setdefault('properties', {})['redb_snapshot_id' if instance_path == ('index_read_token',) else 'unexpected'] = {}
            else:
                del target[keyword]
            paths.append(list(path))
        flips = []; stayed = []
        for candidate, label, value in cases:
            if candidate != definition:
                stayed.append(label); continue
            if validator(weakened).is_valid(value):
                flips.append(label); covered.add(label)
            else:
                stayed.append(label)
        # Alternatives contain type-dispatch diagnostics as well as the actual
        # failed grammar. Only a rule with an accepting witness is a guard row.
        if flips:
            rows.append({'guard': definition + '/' + '/'.join(map(str, logical_path)) + (('/' + missing) if missing else ''),
                         'rule_value': json.loads(rule_value),
                         'duplicate_set': 'equivalent nullable/stage payload schema copies' if len(paths) > 1 else None,
                         'rule_paths': paths, 'negatives_that_flip': flips, 'negatives_that_stay_rejected': stayed})
    # The numeric-gate context is one conditional required rule with three
    # fields, repeated in the nullable/stage payload copies. Remove only that
    # rule's context members, preserving all ordinary required fields.
    for definition, label, value in cases:
        if label in covered or 'bare_scores_without_source_context' not in label:
            continue
        weakened = copy.deepcopy(schemas[definition]); paths = []
        context_fields = {'dispatch_score_ref', 'dispatch_score_tuple', 'node_id'}
        for target, path in matching_rules(weakened, ('payload',), 'required'):
            if context_fields.issubset(target['required']):
                target['required'] = [key for key in target['required'] if key not in context_fields]
                paths.append(list(path))
        flips = []; stayed = []
        for candidate, candidate_label, candidate_value in cases:
            if candidate == definition and validator(weakened).is_valid(candidate_value):
                flips.append(candidate_label); covered.add(candidate_label)
            else:
                stayed.append(candidate_label)
        if flips:
            rows.append({'guard': definition + '/payload/conditional_dispatch_context_required', 'rule_paths': paths,
                         'negatives_that_flip': flips, 'negatives_that_stay_rejected': stayed})
    failures.extend(label + ': no single schema guard admits negative' for _, label, _ in cases if label not in covered)
    return rows, failures


def checkpoint_schema_controls(dt, c, f, schemas, corpus):
    """Change only a token property/version rule, preserving all other checks."""
    cp = schemas[c['event_type'].replace('.', '_') + '_checkpoint']
    original = copy.deepcopy(cp)
    mutations = [('persisted_snapshot_forbidden', lambda sc: sc['properties']['index_read_token']['properties'].update(redb_snapshot_id={})),
                 ('future_checkpoint_version', lambda sc: sc['properties']['schema_version'].pop('const'))]
    rows = []; failures = []
    for label, mutate in mutations:
        try:
            mutate(cp)
            flips = []; stayed = []
            for candidate, call, expected in corpus:
                if accepts(safe_call(call), expected):
                    flips.append(candidate)
                else:
                    stayed.append(candidate)
            expected_flip = 'checkpoint/' + label
            if set(flips) != {expected_flip}:
                failures.append(label + ': schema guard removal flipped ' + repr(flips))
            rows.append({'guard': 'checkpoint_schema/' + label, 'negatives_that_flip': flips,
                         'negatives_that_stay_rejected': stayed})
        finally:
            cp.clear(); cp.update(copy.deepcopy(original))
    return rows, failures


def prove_family(dt, c, f, schemas):
    corpus = dt.round6_corpus(c, f, schemas) + source_corpus(dt, c, f, schemas) + checkpoint_corpus(dt, c, f, schemas) + other_corpus(dt, c, f, schemas) + boundary_corpus(dt, c, f)
    baseline = {label: safe_call(call) for label, call, _ in corpus}
    failures = [label + ': negative accepted at baseline' for label, _, expected in corpus if accepts(baseline[label], expected)]
    rows, exact_schema_failures = checkpoint_schema_controls(dt, c, f, schemas, corpus)
    failures.extend(exact_schema_failures)
    covered = set(); guards_without_cases = []
    for guard in function_mutants(dt):
        flips = []; stayed = []; changed_rejections = []
        with replace_function(dt, guard['function'], guard['callable']):
            for label, call, expected in corpus:
                value = safe_call(call)
                if accepts(value, expected):
                    flips.append(label); covered.add(label)
                else:
                    stayed.append(label)
                    if value != baseline[label]:
                        changed_rejections.append({'case': label, 'before': baseline[label], 'after': value})
        if flips:
            rows.append({k: v for k, v in guard.items() if k != 'callable'} | {
                'negatives_that_flip': flips, 'negatives_that_stay_rejected': stayed,
                'changed_rejections': changed_rejections})
        elif guard['function'] == 'source_valid' and guard['predicate'] == 'source_definition not in schemas':
            definition = c['event_type'].replace('.', '_') + '_source'
            missing = dict(schemas); del missing[definition]
            # This is a configuration precondition. Its guarded lookup cannot
            # accept an event without a schema. Prove the actual test at its
            # own boundary; record the downstream cascade without treating it
            # as an unrelated semantic defect or an accepted event.
            expression = compile(ast.parse(guard['predicate'], mode='eval'), '<schema dispatch predicate>', 'eval')
            positive = not eval(expression, {}, dict(source_definition=definition, schemas=schemas))
            negative = eval(expression, {}, dict(source_definition=definition, schemas=missing))
            weakened = guard['replacement']
            a, b, e = closure(dt, f)
            cascade = safe_call(lambda: guard['callable'](c, a, b, e, missing))
            ok = positive and negative and weakened is False and isinstance(cascade, dict) and cascade.get('exception') == 'KeyError'
            if not ok:
                failures.append('schema dispatch boundary control failed')
            rows.append({k: v for k, v in guard.items() if k != 'callable'} | {
                'boundary': 'schema-bundle availability predicate; no event acceptance claimed',
                'negatives_that_flip': ['config/missing_definition'], 'negatives_that_stay_rejected': stayed,
                'after_predicate_removal': cascade, 'status': 'pass' if ok else 'fail'})
        else:
            guards_without_cases.append(guard['id'])
    def duplicate_proof(label, selections, *, rfc_integer=False):
        guards = list(function_mutants(dt)); selected = []
        for function, fragment in selections:
            matches = [g for g in guards if g['function'] == function and fragment in g['predicate']]
            assert len(matches) == 1, (label, function, fragment, len(matches))
            selected.extend(matches)
        replacements = {}
        for function in {g['function'] for g in selected}:
            tree = ast.parse(inspect.getsource(getattr(dt, function)))
            expressions = {g['predicate'] for g in selected if g['function'] == function}
            changed = 0
            for node in ast.walk(tree):
                if isinstance(node, ast.If) and ast.unparse(node.test) in expressions:
                    node.test = ast.Constant(False); changed += 1
            assert changed == len(expressions)
            namespace = {}
            exec(compile(ast.fix_missing_locations(tree), '<DT named duplicate removal>', 'exec'), dt.__dict__, namespace)
            replacements[function] = namespace[function]
        ids = [g['id'] for g in selected]
        with contextlib.ExitStack() as stack:
            for function, replacement in replacements.items():
                stack.enter_context(replace_function(dt, function, replacement))
            if rfc_integer:
                import rfc8785._impl as impl
                tree = ast.parse(inspect.getsource(impl.dump)); found = 0
                for node in ast.walk(tree):
                    if isinstance(node, ast.If) and ast.unparse(node.test) == 'obj < _INT_MIN or obj > _INT_MAX':
                        node.test = ast.Constant(False); found += 1
                assert found == 1
                namespace = {}
                exec(compile(ast.fix_missing_locations(tree), '<only RFC8785 duplicate integer-bound guard>', 'exec'), impl.__dict__, namespace)
                stack.enter_context(replace_function(impl, 'dump', namespace['dump']))
                ids.append('rfc8785._impl.dump:obj < _INT_MIN or obj > _INT_MAX')
            flips = []; stayed = []; changed_rejections = []
            for candidate, call, expected in corpus:
                value = safe_call(call)
                if accepts(value, expected):
                    flips.append(candidate); covered.add(candidate)
                else:
                    stayed.append(candidate)
                    if value != baseline[candidate]:
                        changed_rejections.append({'case': candidate, 'before': baseline[candidate], 'after': value})
        if not flips:
            failures.append(label + ': named duplicate set has no witness')
        rows.append({'guard': label, 'duplicate_set': ids, 'negatives_that_flip': flips,
                     'negatives_that_stay_rejected': stayed, 'changed_rejections': changed_rejections})
    schema_expression = "load('Plans/event_record.schema.json')"
    duplicate_proof('source_valid/schema_and_typed_envelope_join', [
        ('source_valid', schema_expression), ('source_valid', "for k in b if k != 'scope_kind'")])
    if c['scope_policy'] != 'project_only':
        duplicate_proof('source_valid/schema_and_captured_scope_join', [
            ('source_valid', schema_expression),
            ('source_valid', "event['scope_kind'] != completed['envelope_context']['scope_kind']")])
    for function in ['recovery', 'historical_read']:
        duplicate_proof(function + '/schema_and_source_schema', [
            ('source_valid', schema_expression), (function, schema_expression)])
    duplicate_proof('source_valid/source_and_identity_mode_type', [
        ('source_valid', 'type(historical) is not bool'), ('identity', 'type(historical) is not bool')])
    duplicate_proof('producer_semantic_bytes/DT_and_RFC8785_integer_bounds', [
        ('producer_semantic_bytes', 'not current_numbers_valid(projection)')], rfc_integer=True)
    paired_ids = {identifier for row in rows if isinstance(row.get('duplicate_set'), list) for identifier in row['duplicate_set']}
    guards_without_cases = [identifier for identifier in guards_without_cases if identifier not in paired_ids]
    # Schema refusals are proven against that validator; retain the full-path
    # outcome above, but do not mistake downstream missing-field exceptions for acceptance.
    schema_rows, schema_failures = schema_table(dt, c, f, schemas)
    unused_candidates = {label for label, _, _ in corpus if label.startswith('boundary/') and label not in covered}
    for row in rows:
        row['negatives_that_stay_rejected'] = [label for label in row['negatives_that_stay_rejected'] if label not in unused_candidates]
        row['changed_rejections'] = [item for item in row.get('changed_rejections', []) if item['case'] not in unused_candidates]
    schema_only = set()
    for label, value in baseline.items():
        if value == 'schema_refused':
            schema_only.add(label)
    failures.extend(label + ': masked model negative' for label, _, _ in corpus if label not in covered and label not in schema_only and not label.startswith('boundary/'))
    failures.extend(schema_failures)
    return {'status': 'pass' if not failures else 'fail', 'model_negatives': len(corpus) - len(unused_candidates),
            'schema_negatives': len({label for row in schema_rows for label in row['negatives_that_flip']}),
            'guard_removal_table': rows, 'schema_guard_removal_table': schema_rows,
            'schema_boundary_cases': sorted(schema_only), 'guard_inventory_without_witness': guards_without_cases,
            'failures': failures}


def prove(dt, targets=None):
    schemas = dt.load('Plans/dt_event_contracts.schema.json')['$defs']
    fixtures = {f['event_type']: f for f in dt.load('Plans/dt_event_contract_fixtures.json')['families']}
    result = {}
    for c in dt.load('Plans/dt_event_contracts.json')['families']:
        name = c['event_type']
        if targets and name not in targets:
            continue
        result[name] = prove_family(dt, c, fixtures[name], schemas)
        import sys
        print(name + ': check11=' + result[name]['status'] + (' ' + repr(result[name]['failures']) if result[name]['failures'] else ''), file=sys.stderr, flush=True)
    covered = {row['id'] for family in result.values() for row in family['guard_removal_table'] if 'id' in row}
    covered.update(identifier for family in result.values() for row in family['guard_removal_table']
                   if isinstance(row.get('duplicate_set'), list) for identifier in row['duplicate_set']
                   if not identifier.startswith('rfc8785.'))
    inventory = {guard['id'] for guard in function_mutants(dt)}
    complete_lane = len(result) == len(dt.load('Plans/dt_event_contracts.json')['families'])
    uncovered = sorted(inventory - covered)
    return {'status': 'pass' if all(v['status'] == 'pass' for v in result.values()) and (not complete_lane or not uncovered) else 'fail',
            'per_family': result, 'guard_inventory': {'complete_lane': complete_lane, 'predicates': len(inventory),
                'covered': len(covered), 'uncovered': uncovered}, 'native_execution': 'NOT_RUN'}


def reference_guard_controls(dt):
    """Unused broken refs: remove only main's preflight, run every other oracle."""
    import io
    tree = ast.parse(inspect.getsource(dt.main))
    matches = [node for node in ast.walk(tree) if isinstance(node, ast.If) and ast.unparse(node.test) == 'reference_errors']
    assert len(matches) == 1
    matches[0].test = ast.Constant(False)
    namespace = {}
    exec(compile(ast.fix_missing_locations(tree), '<only schema preflight guard>', 'exec'), dt.__dict__, namespace)
    original_load = dt.load; rows = []; failures = []
    for contract in original_load('Plans/dt_event_contracts.json')['families']:
        name = contract['event_type']; slug = name.replace('.', '_')
        document = copy.deepcopy(original_load('Plans/dt_event_contracts.schema.json'))
        document['$defs']['unused_guard_control_' + slug] = {'$ref': '#/$defs/missing_guard_control_' + slug}
        dt.load = lambda path: document if path == 'Plans/dt_event_contracts.schema.json' else original_load(path)
        try:
            outcomes = []
            for checker in [dt.main, namespace['main']]:
                output = io.StringIO()
                with contextlib.redirect_stdout(output):
                    code = checker()
                value = json.loads(output.getvalue())
                outcomes.append({'exit_code': code, 'status': value['status'], 'checks': value['checks'], 'failures': value['failures']})
            ok = outcomes[0]['exit_code'] == 1 and outcomes[0]['status'] == 'fail' and outcomes[1]['exit_code'] == 0 and outcomes[1]['status'] == 'pass'
            if not ok:
                failures.append(name + ': preflight guard control failed')
            rows.append({'family': name, 'guard': 'main/reference_errors', 'status': 'pass' if ok else 'fail',
                         'negatives_that_flip': ['unused_guard_control_' + slug],
                         'negatives_that_stay_rejected': 'all ordinary negative oracles in the complete checker',
                         'baseline': outcomes[0], 'only_preflight_removed': outcomes[1]})
        finally:
            dt.load = original_load
    return {'status': 'pass' if not failures else 'fail', 'guard_removal_table': rows, 'failures': failures}


if __name__ == '__main__':
    import importlib.util
    import sys
    root = Path(__file__).resolve().parents[1]
    spec = importlib.util.spec_from_file_location('dt_guard_oracle', root / 'scripts/pm-dt-event-contracts.py')
    dt = importlib.util.module_from_spec(spec); spec.loader.exec_module(dt)
    original_load = dt.load; cache = {}
    def cached(path):
        if path not in cache:
            cache[path] = original_load(path)
        return cache[path]
    dt.load = cached
    result = reference_guard_controls(dt) if sys.argv[1:] == ['--references-only'] else prove(dt, sys.argv[1:] or None)
    print(json.dumps(result, indent=2))
    raise SystemExit(result['status'] != 'pass')
