"""DT-only C12 schema coverage; the original DT validator remains the oracle.

This is a witness builder, never a schema evaluator. Whole-definition Method B
rows remain in pm-dt-event-contracts.py. Identical subschemas share a source-
hashed clause witness; occurrence/branch paths remain separate in the inventory.
No owner keyword is removed, no alternative is flattened and no ref is ignored.
"""
import copy
import hashlib
import json

ASSERTIONS = frozenset(('type', 'const', 'enum', 'required', 'additionalProperties',
    'minLength', 'maxLength', 'pattern', 'format', 'minimum', 'maximum',
    'minItems', 'maxItems', 'uniqueItems', 'anyOf', 'oneOf', 'allOf', 'not',
    'if', 'then', 'else', '$ref'))


def fingerprint(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def nodes(schema, path=(), instance=()):
    """Schema locations only (never mistake instance property names for keywords)."""
    if not isinstance(schema, dict):
        return
    yield path, instance, schema
    for keyword in ('properties', '$defs', 'patternProperties'):
        for key, child in schema.get(keyword, {}).items():
            yield from nodes(child, path + (keyword, key), instance + (key,) if keyword == 'properties' else instance)
    for keyword in ('allOf', 'anyOf', 'oneOf', 'prefixItems'):
        for i, child in enumerate(schema.get(keyword, [])):
            yield from nodes(child, path + (keyword, i), instance)
    for keyword in ('if', 'then', 'else', 'not', 'items', 'additionalProperties'):
        child = schema.get(keyword)
        if isinstance(child, dict):
            yield from nodes(child, path + (keyword,), instance + (0,) if keyword == 'items' else instance)


def pointer(path):
    return '/' + '/'.join(str(k).replace('~', '~0').replace('/', '~1') for k in path)


def at(value, path):
    for key in path:
        value = value[key]
    return value


def candidates(rule, seed):
    """Bounded DT clause proposals. A proposal earns credit only after exact validation."""
    values = [None, False, True, 0, 1, -1, 1.0, 0.5, '', 'x', 'not-a-date',
        '2026-11-04T00:00:00Z', '11111111-1111-4111-8111-111111111111',
        '0' * 64, [], ['x', 'x'], {}, 'x\n', 'approval.requested', 'project~eA']
    if seed is not None:
        values.insert(0, copy.deepcopy(seed))
    if 'const' in rule:
        values.insert(0, copy.deepcopy(rule['const']))
    values[0:0] = copy.deepcopy(rule.get('enum', []))
    for key in ('minimum', 'maximum'):
        if key in rule:
            n = rule[key]
            values += [n - 1, n, n + 1]
    for key in ('minLength', 'maxLength'):
        if key in rule:
            n = rule[key]
            if n < 100000:
                values += ['x' * max(0, n - 1), 'x' * n, 'x' * (n + 1)]
    if isinstance(seed, str):
        values += [seed + '\n', seed + '-foreign', seed.upper(), seed[:-1]]
    if isinstance(seed, list) and seed:
        values += [seed + [copy.deepcopy(seed[0])], [], [copy.deepcopy(seed[0])]]
    if isinstance(seed, dict):
        values += [dict(seed, c12_unexpected=True)]
        for key in rule.get('required', []):
            changed = copy.deepcopy(seed)
            changed.pop(key, None)
            values.append(changed)
    seen = set()
    for value in values:
        pin = fingerprint(value)
        if pin not in seen:
            seen.add(pin)
            yield value


def representative(dt, rule, resource, seed=None, depth=0):
    """Construct witness data only; all acceptance is delegated to DTValidator."""
    if depth > 16 or not isinstance(rule, dict):
        return copy.deepcopy(seed)
    if '$ref' in rule:
        ref = rule['$ref']
        if ref.startswith('#/'):
            target = resource
            for key in ref[2:].split('/'):
                target = target[key.replace('~1', '/').replace('~0', '~')]
            return representative(dt, target, resource, seed, depth + 1)
    if 'const' in rule:
        return copy.deepcopy(rule['const'])
    if 'enum' in rule:
        return copy.deepcopy(rule['enum'][0])
    for key in ('anyOf', 'oneOf'):
        if key in rule:
            for branch in rule[key]:
                result = representative(dt, branch, resource, seed, depth + 1)
                if dt.schema_valid(dt.lane_validator(resource).evolve(schema=rule), result):
                    return result
    kind = rule.get('type')
    if isinstance(kind, list):
        kind = next((k for k in kind if k != 'null'), kind[0])
    if kind == 'object' or 'properties' in rule or 'required' in rule:
        result = copy.deepcopy(seed) if isinstance(seed, dict) else {}
        props = rule.get('properties', {})
        if rule.get('additionalProperties') is False:
            result = {k: v for k, v in result.items() if k in props}
        for key in set(rule.get('required', [])) | (set(result) & set(props)):
            result[key] = representative(dt, props.get(key, {}), resource, result.get(key, 'x'), depth + 1)
    elif kind == 'array':
        result = [representative(dt, rule.get('items', {}), resource, None, depth + 1)
                  for _ in range(rule.get('minItems', 0))]
    elif kind == 'string':
        pool = list(candidates(rule, seed))
        validator = dt.lane_validator(resource).evolve(schema=rule)
        result = next((v for v in pool if dt.schema_valid(validator, v)), seed)
    elif kind in ('integer', 'number'):
        result = max(0, rule.get('minimum', 0))
    elif kind == 'boolean':
        result = False
    elif kind == 'null':
        result = None
    else:
        result = copy.deepcopy(seed) if seed is not None else {}
    for branch in rule.get('allOf', []):
        result = representative(dt, branch, resource, result, depth + 1)
    if 'if' in rule:
        selected = 'then' if dt.schema_valid(dt.lane_validator(resource).evolve(schema=rule['if']), result) else 'else'
        if selected in rule:
            result = representative(dt, rule[selected], resource, result, depth + 1)
    return result


def directed_proposals(rule, seed):
    """Name the intended clause BEFORE observing the validator's refusal."""
    if 'type' in rule:
        kinds = rule['type'] if isinstance(rule['type'], list) else [rule['type']]
        choices = [('object', {}), ('array', []), ('string', 'x'), ('boolean', False), ('null', None)]
        kind, value = next((k, v) for k, v in choices if k not in kinds)
        yield 'type', 'wrong_' + kind, value
    for keyword in ('enum', 'const'):
        if keyword in rule:
            value = not seed if type(seed) is bool else seed + 1 if type(seed) in (int, float) else str(seed) + '-c12-foreign'
            yield keyword, 'outside_literal_domain', value
    if isinstance(seed, dict):
        for field in rule.get('required', []):
            value = copy.deepcopy(seed); value.pop(field, None)
            yield 'required', 'missing/' + field, value
        if rule.get('additionalProperties') is False:
            yield 'additionalProperties', 'extra_property', dict(seed, c12_unexpected=True)
    if isinstance(seed, str):
        if 'minLength' in rule and rule['minLength']:
            yield 'minLength', 'below_minimum', 'x' * (rule['minLength'] - 1)
        if 'maxLength' in rule:
            yield 'maxLength', 'above_maximum', 'x' * (rule['maxLength'] + 1)
        if 'pattern' in rule:
            yield 'pattern', 'same_length_foreign_character', '!' + seed[1:]
        if 'format' in rule:
            yield 'format', 'malformed_format', 'not-a-date'
    for keyword, delta in (('minimum', -1), ('maximum', 1)):
        if keyword in rule:
            yield keyword, 'adjacent_bound', rule[keyword] + delta
    if isinstance(seed, list):
        if rule.get('uniqueItems') and seed:
            yield 'uniqueItems', 'duplicate_item', seed + [copy.deepcopy(seed[0])]
        if rule.get('minItems', 0):
            yield 'minItems', 'too_few_items', []
    for keyword in ('anyOf', 'oneOf', 'allOf'):
        if keyword in rule:
            for value in (False, {}, [], 'c12-foreign'):
                yield keyword, 'branch_counterexample/' + fingerprint(value)[:12], value
    if 'not' in rule:
        forbidden = rule['not']
        if 'required' in forbidden:
            yield 'not', 'forbidden_properties', dict(seed, **{key: 'x' for key in forbidden['required']})


def occurrence_values(dt, c, f, schemas, envelope):
    slug = c['event_type'].replace('.', '_')
    yield 'payload', schemas[slug], f['valid_payload'], None
    yield 'envelope', envelope, f['event_record'], 'event'
    yield 'prepared', schemas[slug + '_source'], f['prepared_source'], None
    yield 'completed', schemas[slug + '_source'], f['completed_source'], None
    yield 'checkpoint', schemas[slug + '_checkpoint'], f['checkpoint'], None
    yield 'empty_checkpoint', schemas[slug + '_checkpoint'], f['empty_checkpoint'], None
    receipt_schema = dt.load('Plans/event_append_receipt_contracts.schema.json')['$defs']['AppendReceipt']
    yield 'sealed_first_receipt', receipt_schema, f['first_append_receipt'], 'receipt'
    for variant in f['positive_variants']:
        definition = slug + ('_application_source' if variant['event']['scope_kind'] == 'application' else '_source')
        yield variant['case'] + '/payload', schemas[slug], variant['completed']['payload'], None
        yield variant['case'] + '/envelope', envelope, variant['event'], 'event'
        for stage in ('prepared', 'completed'):
            yield variant['case'] + '/' + stage, schemas[definition], variant[stage], None


def inventory(dt, inputs):
    """All schema occurrences, with preserved owner bytes and context-bound predicates."""
    result, groups = [], {}
    for c in inputs['contracts']:
        name = c['event_type']
        f = inputs['fixtures'][name]
        seen = set()
        for role, owner, value, profile in occurrence_values(dt, c, f, inputs['schemas'], inputs['event_schema']):
            schema = dt.checkpoint_source_constraints(owner)
            definition_pin = fingerprint(schema)
            for path, instance_path, rule in nodes(schema):
                for keyword in sorted(set(rule) & ASSERTIONS):
                    site = (definition_pin, path, keyword)
                    pin = fingerprint(rule)
                    group = groups.setdefault(pin, dict(rule=rule, resource=schema, seeds=[], sites=[]))
                    try:
                        seed = at(value, instance_path)
                    except (KeyError, IndexError, TypeError):
                        pass
                    else:
                        if len(group['seeds']) < 32 and fingerprint(seed) not in {fingerprint(s) for s in group['seeds']}:
                            group['seeds'].append(seed)
                    if site in seen:
                        continue
                    seen.add(site)
                    predicate = ('hr_receipt_schema/HR17_receipt_schema' if profile == 'receipt' else
                        'src_envelope/SV02_event_schema' if profile == 'event' else
                        'src_schema/SV08_prepared_schema' if role.endswith('prepared') else
                        'src_schema/SV09_completed_schema' if role.endswith('completed') else
                        'cp_schema/CP03_proposed_schema' if 'checkpoint' in role else 'schema_verdict/SC01_schema')
                    row = dict(family=name, role=role, definition_sha256=definition_pin,
                        schema_pointer=pointer(path + (keyword,)), instance_pointer=pointer(instance_path),
                        keyword=keyword, clause_sha256=pin, predicate=predicate,
                        covering='complete unmodified definition evaluated by original DTValidator; conditional applicability retained')
                    result.append(row)
                    group['sites'].append(len(result) - 1)
    return result, groups


def schema_witnesses(dt, inputs, out):
    """Whole-definition controls/negatives plus byte-identical local-clause covering probes.

    Clause proposals that fail at another keyword are INVALID, never kills.
    Local probes are explicitly distinguished from complete-boundary mutations.
    """
    sites, groups = inventory(dt, inputs)
    local, invalid, whole, attempts = [], [], [], []
    for pin, group in groups.items():
        rule = group['rule']
        # Keep the original resource resolver: local EventRecord $refs must
        # never be judged as a detached schema with missing $defs.
        validator = dt.lane_validator(group['resource']).evolve(schema=rule)
        seeds = [s for s in group['seeds'] if dt.schema_valid(validator, s)]
        if not seeds:
            seeds = [v for v in candidates(rule, None) if dt.schema_valid(validator, v)][:2]
        if not seeds:
            value = representative(dt, rule, group['resource'], group['seeds'][0] if group['seeds'] else None)
            if dt.schema_valid(validator, value):
                seeds = [value]
        covered = {}
        for seed in seeds[:2]:
            for target, label, proposal in directed_proposals(rule, seed):
                errors = list(validator.iter_errors(proposal))
                paths = [pointer(err.schema_path) for err in errors]
                isolated = bool(errors) and all(next(iter(err.schema_path), None) == target for err in errors)
                actual = 'schema_refused' if not dt.schema_accepts(validator, proposal) else 'accepted'
                status = 'CLAUSE_WITNESS' if isolated and actual == 'schema_refused' else 'INVALID'
                witness = dict(clause_sha256=pin, target_keyword=target, proposal=label,
                    control_sha256=fingerprint(seed), negative_sha256=fingerprint(proposal),
                    expected_code='schema_refused', actual_code=actual, error_paths=paths,
                    status=status, counted_as_gated_kill=False)
                attempts.append(witness)
                if status == 'CLAUSE_WITNESS':
                    covered.setdefault(target, witness)
        for keyword in sorted(set(rule) & ASSERTIONS):
            # JSON Schema applicators are evaluated as part of the complete definition;
            # their child keyword and branch locations remain explicitly inventoried.
            local.append(dict(clause_sha256=pin, keyword=keyword, witnesses=covered.get(keyword),
                status='WITNESSED' if keyword in covered else 'WHOLE_DEFINITION_COVER',
                covering=('The source-hashed rule is passed intact to DTValidator; the complete-definition '
                          'Method B row requires zero errors with native JSON Schema branch semantics. '
                          'These are covering witnesses, not claims of independent keyword cuts.'),
                occurrences=len(group['sites']), controls=len(seeds)))
    # Complete definition mutations actually pass the original family boundaries.
    for c in inputs['contracts']:
        name = c['event_type']; f = inputs['fixtures'][name]; slug = name.replace('.', '_')
        a, b, e = (copy.deepcopy(f[k]) for k in ('prepared_source', 'completed_source', 'event_record'))
        control = dt.source_valid(c, a, b, e, inputs['schemas'])
        for role, field, expected_phase, expected_row in (
            ('prepared', 'schema_version', 'src_schema', 'SV08_prepared_schema'),
            ('completed', 'schema_version', 'src_schema', 'SV09_completed_schema'),
            ('envelope', 'schema_version', 'src_envelope', 'SV02_event_schema')):
            values = copy.deepcopy([a, b, e]); index = ('prepared', 'completed', 'envelope').index(role)
            # EventRecord uses schema_version? use its required event_type instead.
            field = 'event_type' if role == 'envelope' else field
            values[index].pop(field)
            dt.RECORDER = []
            try:
                actual = dt.source_valid(c, *values, inputs['schemas'])
                trace = copy.deepcopy(dt.RECORDER)
            finally:
                dt.RECORDER = None
            first = next(((p, *r) for p, _, r in trace if r is not None), None)
            expected = (expected_phase, expected_row, 'schema_refused')
            row = dict(family=name, role=role, expected=list(expected), actual=list(first) if first else None,
                       result=actual, control=control, status='KILLED' if control == 'accepted' and first == expected and actual == 'schema_refused' else 'INVALID')
            (whole if row['status'] == 'KILLED' else invalid).append(row)
        for role in ('previous', 'proposed'):
            cp = copy.deepcopy(f['checkpoint_cases'][0])
            control = dt.checkpoint_result(c, cp['previous'], cp['proposed'], cp['context'], inputs['schemas'][slug + '_checkpoint'])
            cp[role].pop('schema_version')
            dt.RECORDER = []
            try:
                actual = dt.checkpoint_result(c, cp['previous'], cp['proposed'], cp['context'], inputs['schemas'][slug + '_checkpoint'])
                first = next(((p, *r) for p, _, r in dt.RECORDER if r is not None), None)
            finally:
                dt.RECORDER = None
            expected_row = 'CP01_previous_schema' if role == 'previous' else 'CP03_proposed_schema'
            expected = ('cp_schema', expected_row, 'schema_refused')
            row = dict(family=name, role=role, expected=list(expected), actual=list(first) if first else None,
                       result=actual, control=control, status='KILLED' if control == 'published' and first == expected and actual == 'schema_refused' else 'INVALID')
            (whole if row['status'] == 'KILLED' else invalid).append(row)
    out('schema-occurrences.json', sites)
    out('schema-clause-covering.json', local)
    out('schema-keyword-attempts.json', dict(witnesses=[r for r in attempts if r['status']=='CLAUSE_WITNESS'],
        invalid=[r for r in attempts if r['status']=='INVALID'], boundary='Local covering probes, not gated whole-checker kills'))
    out('schema-boundary-mutations.json', dict(kills=whole, invalid=invalid))
    return dict(occurrences=len(sites), distinct_rules=len(groups), clause_witnesses=sum(x['status']=='WITNESSED' for x in local),
                whole_definition_covers=sum(x['status']=='WHOLE_DEFINITION_COVER' for x in local),
                uncontrolled_rules=len({x['clause_sha256'] for x in local if x['controls'] == 0}),
                boundary_kills=len(whole), invalid=len(invalid))
