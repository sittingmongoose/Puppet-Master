"""DG6B clause witnesses at original complete checker boundaries.

This generates inputs, not a schema evaluator. The original Draft202012Validator
and its complete owner definition decide each control, mutation, clause cut and
restoration. Method B retains the existing whole-definition guard rows. Negative
credit requires the declared first row AND refusal code; earlier refusals and
non-isolating proposals are recorded separately.
"""
import copy
import hashlib
import json
import re
from dataclasses import dataclass

from pm_event_numbers import APP_PHYSICAL, EVENT_VALUE, storage_value_bytes

RESULTS = {}
ANNOTATIONS = {'$schema', '$id', '$comment', 'title', 'description', 'default', 'examples',
               'deprecated', 'readOnly', 'writeOnly', '$defs', 'definitions'}
LEAVES = {'type', 'const', 'enum', 'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum',
          'minLength', 'maxLength', 'pattern', 'format', 'minItems', 'maxItems', 'uniqueItems',
          'required', 'additionalProperties'}
COMPOSITION = {'properties', 'items', 'allOf', 'anyOf', 'oneOf', 'if', 'then', 'else', 'not'}
DELETE = object()


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def pointer(path):
    return '/' + '/'.join(str(k).replace('~', '~0').replace('/', '~1') for k in path) if path else ''


def replace(value, path, item):
    if not path:
        return copy.deepcopy(item)
    result = copy.deepcopy(value)
    node = result
    for k in path[:-1]:
        node = node[k]
    if item is DELETE:
        del node[path[-1]]
    else:
        node[path[-1]] = copy.deepcopy(item)
    return result


def reference_body(value, carrier):
    """Encode a changed logical body while keeping the independent routing copy.

    The carrier is copied from its valid original; its content address and size
    follow the changed bytes. Header defects in the decoded body can therefore
    reach OG01/RS01 instead of also corrupting the carrier's schema constants.
    """
    from blake3 import blake3
    body = storage_value_bytes(value, profile=APP_PHYSICAL)
    digest_ = blake3(body).hexdigest()
    carrier = copy.deepcopy(carrier)
    carrier['payload_ref'].update(blake3_id=digest_, byte_size=len(body))
    resolved = dict(ref='ref:payload/' + digest_, blake3_id=digest_, byte_size=len(body),
                    media_type='application/msgpack', bytes_hex=body.hex(), durable=True, access_current=True)
    return carrier, resolved


def expand(definition, resolver, lineage=()):
    """Resolve the selected owner's refs for witness coordinates; retain every assertion.

    Original definitions remain untouched and are independently revalidated on
    every proposed input. The expanded copy exists only for single-clause cuts.
    """
    if not isinstance(definition, dict):
        return copy.deepcopy(definition)
    result = {}
    if '$ref' in definition:
        ref = definition['$ref']
        if ref in lineage:
            raise ValueError('recursive DG6B proof resource: ' + ref)
        resolved = resolver.lookup(ref)
        target = expand(resolved.contents, resolved.resolver, lineage + (ref,))
        siblings = {k: v for k, v in definition.items() if k != '$ref'}
        if not siblings:
            return target
        return {'allOf': [target, expand(siblings, resolver, lineage)]}
    for key, value in definition.items():
        if key in ANNOTATIONS:
            continue
        if key in ('properties', 'patternProperties'):
            result[key] = {k: expand(v, resolver, lineage) for k, v in value.items()}
        elif key in ('allOf', 'oneOf', 'anyOf', 'prefixItems'):
            result[key] = [expand(v, resolver, lineage) for v in value]
        elif key in ('items', 'if', 'then', 'else', 'not') and isinstance(value, dict):
            result[key] = expand(value, resolver, lineage)
        else:
            result[key] = copy.deepcopy(value)
    return result


def inventory(node, path=()):
    if not isinstance(node, dict):
        return
    for keyword, value in node.items():
        if keyword == 'required':
            for member in value:
                yield path, keyword, member
        elif keyword in LEAVES or keyword in COMPOSITION:
            yield path, keyword, None
        else:
            yield path, 'UNSUPPORTED:' + keyword, None
        if keyword == 'properties':
            for name, child in value.items():
                yield from inventory(child, path + (keyword, name))
        elif keyword in ('allOf', 'oneOf', 'anyOf'):
            for index, child in enumerate(value):
                yield from inventory(child, path + (keyword, index))
        elif keyword in ('items', 'if', 'then', 'else', 'not'):
            yield from inventory(value, path + (keyword,))


def sample(node):
    if 'const' in node:
        return copy.deepcopy(node['const'])
    if 'enum' in node:
        return copy.deepcopy(node['enum'][0])
    for key in ('oneOf', 'anyOf'):
        if key in node:
            return sample(node[key][0])
    kind = node.get('type')
    kind = kind[0] if isinstance(kind, list) else kind
    if kind == 'object':
        return {k: sample(node['properties'][k]) for k in node.get('required', [])}
    if kind == 'array':
        return [sample(node.get('items', {})) for _ in range(max(1, node.get('minItems', 0)))]
    if kind in ('integer', 'number'):
        return max(1, node.get('minimum', 1))
    if kind == 'boolean':
        return True
    if kind == 'null':
        return None
    if node.get('format') == 'date-time':
        return '2026-11-04T12:00:00Z'
    for candidate in ('x', 'ref:proof/item', '0' * 64, 'application', 'project~cA'):
        if ('pattern' not in node or re.search(node['pattern'], candidate)) and len(candidate) >= node.get('minLength', 0):
            return candidate
    return 'x' * max(1, node.get('minLength', 0))


def proposals(m, node, value, sp=(), ip=()):
    """Finite DG6B witness proposals. Unsupported keywords remain explicit gaps."""
    if not isinstance(node, dict):
        return
    for keyword in node:
        candidates = []
        if keyword == 'required' and isinstance(value, dict):
            for member in node[keyword]:
                if member in value:
                    yield sp, keyword, member, ip + (member,), DELETE
        elif keyword == 'type':
            candidates = [None, False, 1, 1.5, 'invalid-type', [], {}]
            candidates = [v for v in candidates if m['error_count']({'type': node[keyword]}, v)]
        elif keyword in ('const', 'enum'):
            candidates = ['invalid-enum', 987, False, None]
        elif keyword == 'minimum':
            candidates = [node[keyword] - 1]
        elif keyword == 'maximum':
            candidates = [node[keyword] + 1]
        elif keyword == 'exclusiveMinimum':
            candidates = [node[keyword]]
        elif keyword == 'exclusiveMaximum':
            candidates = [node[keyword]]
        elif keyword == 'minLength' and node[keyword] > 0:
            candidates = ['x' * (node[keyword] - 1)]
        elif keyword == 'maxLength':
            seed = value if isinstance(value, str) and value else 'x'
            candidates = [(seed * (node[keyword] // len(seed) + 2))[:node[keyword] + 1]]
        elif keyword == 'pattern':
            candidates = ['!', 'not-a-ref', 'ref:', 'g' * 64, str(value) + '\n']
        elif keyword == 'format':
            candidates = ['2026-11-04T24:00:00Z', '2026-11-04T12:00:00Z\n']
        elif keyword == 'additionalProperties' and node[keyword] is False and isinstance(value, dict):
            yield sp, keyword, None, ip + ('__c12_unowned__',), 'unowned'
        elif keyword == 'uniqueItems' and node[keyword] and isinstance(value, list):
            item = value[0] if value else sample(node.get('items', {}))
            candidates = [[item, copy.deepcopy(item)]]
        elif keyword == 'minItems' and node[keyword] > 0:
            candidates = [[]]
        elif keyword == 'maxItems':
            candidates = [[sample(node.get('items', {})) for _ in range(node[keyword] + 1)]]
        for candidate in candidates:
            yield sp, keyword, None, ip, candidate
    if isinstance(value, dict):
        for key, child in node.get('properties', {}).items():
            if key in value:
                yield from proposals(m, child, value[key], sp + ('properties', key), ip + (key,))
            elif child.get('type') not in ('object', 'array'):
                # Optional scalar fields still have enforceable clauses when
                # supplied. Assignment of the leaf adds that field to the
                # complete input; no prevalidated schema verdict is injected.
                yield from proposals(m, child, sample(child), sp + ('properties', key), ip + (key,))
    if isinstance(value, list) and isinstance(node.get('items'), dict):
        items = value or [sample(node['items'])]
        for index, item in enumerate(items[:1]):
            yield from proposals(m, node['items'], item, sp + ('items',), ip + (index,))
    for keyword in ('allOf', 'anyOf', 'oneOf'):
        for index, child in enumerate(node.get(keyword, [])):
            # Visit nullable alternatives too. Their scalar mutations are
            # supplied in the complete input, so a null control does not hide
            # the other branch's string/number bounds.
            active = m['error_count'](child, value, format_checker=m['FORMAT']) == 0
            if not active and (keyword == 'oneOf' or child.get('type') in ('object', 'array')):
                continue
            seed = value if active else sample(child)
            yield from proposals(m, child, seed, sp + (keyword, index), ip)
    if 'if' in node:
        chosen = 'then' if m['error_count'](node['if'], value, format_checker=m['FORMAT']) == 0 else 'else'
        if chosen in node:
            yield from proposals(m, node[chosen], value, sp + (chosen,), ip)


@dataclass
class Boundary:
    phase: str
    source: str
    definition: dict
    value: object
    call: object
    registry: object = None


def boundaries(m, row, schema):
    """Only original entry points, using their authored complete controls."""
    name = row['event_type']
    slug = name.replace('.', '_')
    for case in row['append_valid']:
        def append_at(path, value, case=case):
            return m['complete_append_contract'](name, replace(case, path, value), schema)
        yield Boundary('adapter_record', 'scripts/pm-dg6b-event-contracts.py#adapter_schema(record)',
                       m['adapter_schema']('record'), case, lambda v, call=append_at: call((), v))
        for phase, path, definition, source in (
            ('payload_schema', ('payload',), schema['$defs'][slug], 'Plans/dg6b_event_contracts.schema.json#/$defs/' + slug),
            ('event_record', ('event_record',), m['load_plan']('Plans/event_record.schema.json'), 'Plans/event_record.schema.json'),
            ('adapter_source', ('source',), m['adapter_schema']('source', name), 'scripts/pm-dg6b-event-contracts.py#adapter_schema(source)'),
            ('checkpoint_schema', ('durable_read_token',), m['durable_token_schema'](), 'Plans/event_record_index_checkpoint.schema.json#/$defs/read_token'),
        ):
            value = case
            for k in path:
                value = value[k]
            yield Boundary(phase, source, definition, value, lambda v, p=path, call=append_at: call(p, v))
        if case['event_record']['payload_ref'] is None:
            yield Boundary('envelope_payload_schema', 'Plans/dg6b_event_contracts.schema.json#/$defs/' + slug,
                           schema['$defs'][slug], case['event_record']['payload'],
                           lambda v, call=append_at: call(('event_record', 'payload'), v))
        if case['resolved_payload'] is not None:
            yield Boundary('adapter_resolved', 'scripts/pm-dg6b-event-contracts.py#adapter_schema(resolved)',
                           m['adapter_schema']('resolved'), case['resolved_payload'],
                           lambda v, call=append_at: call(('resolved_payload',), v))
        scope_path = ('source', 'request', 'scope') if name.startswith('persona.') else ('source', 'scope')
        scope_value = case['source']['request']['scope'] if name.startswith('persona.') else case['source']['scope']
        yield Boundary('source_scope', 'Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2',
                       m['workflow_scope_schema'](), scope_value,
                       lambda v, p=scope_path, call=append_at: call(p, v))
        if name.startswith('persona.'):
            yield Boundary('persona_scope_schema', 'Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2',
                           m['workflow_scope_schema'](), case['payload']['scope'],
                           lambda v, call=append_at: call(('payload', 'scope'), v))
            for kind in ('request', 'result'):
                definition, registry = m['persona_io_definition'](case['payload']['command_id'], kind)
                yield Boundary('owner_io_' + kind, 'Plans/shared_integration_runtime.schema.json#/$defs/persona_' +
                               case['payload']['command_id'].split('.')[-1] + '_' + kind + '_v2', definition,
                               case['source'][kind], lambda v, k=kind, call=append_at: call(('source', k), v), registry)
    for case in row['operation_cases']:
        if 'expected_error' in case:
            continue
        yield Boundary('operation_schema', 'Plans/dg6b_event_contracts.schema.json#/$defs/' + slug + '_operation',
                       schema['$defs'][slug + '_operation'], case['value'],
                       lambda v, c=case: m['operation_contract'](name, v, c['resolved'], c['logical'], schema))
        if 'payload_ref' in case['value']:
            def logical_call(v, case=case):
                carrier, resolved = reference_body(v, case['value'])
                return m['operation_contract'](name, carrier, resolved, case['logical'], schema)
            yield Boundary('operation_logical_schema', 'Plans/dg6b_event_contracts.schema.json#/$defs/' + slug + '_operation/oneOf/0',
                           schema['$defs'][slug + '_operation']['oneOf'][0], case['logical'], logical_call)
    for case in row.get('resolution_cases', []):
        if 'expected_error' in case:
            continue
        yield Boundary('resolution_storage_schema', 'Plans/dg6b_event_contracts.schema.json#/$defs/persona_selected_resolution_storage',
                       schema['$defs']['persona_selected_resolution_storage'], case['value'],
                       lambda v, c=case: m['resolution_storage_contract'](v, c['resolved'], c['logical'], schema))
        if 'payload_ref' in case['value']:
            def resolution_call(v, case=case):
                carrier, resolved = reference_body(v, case['value'])
                return m['resolution_storage_contract'](carrier, resolved, case['logical'], schema)
            yield Boundary('resolution_schema', 'Plans/dg6b_event_contracts.schema.json#/$defs/persona_selected_resolution',
                           schema['$defs']['persona_selected_resolution'], case['logical'], resolution_call)
    history = copy.deepcopy(next(c for c in row['history_cases'] if 'expected_error' not in c))
    history.pop('label', None)
    yield Boundary('adapter_history', 'scripts/pm-dg6b-event-contracts.py#adapter_schema(history)',
                   m['adapter_schema']('history'), history, lambda v: m['history_contract'](name, v, schema))
    yield Boundary('adapter_storage', 'scripts/pm-dg6b-event-contracts.py#adapter_schema(storage)',
                   m['adapter_schema']('storage'), history['storage_record'],
                   lambda v: m['history_contract'](name, replace(history, ('storage_record',), v), schema))


def run(m, row, schema):
    name = row['event_type']
    result = dict(family=name, approach='original whole-definition Method B rows', boundaries={},
                  ledger=[], invalid=[], discarded_proposals=[])
    seen, proved = set(), set()
    for boundary in boundaries(m, row, schema):
        validator = m['Draft202012Validator'](boundary.definition, format_checker=m['FORMAT'],
                                            **({'registry': boundary.registry} if boundary.registry else {}))
        expanded = expand(boundary.definition, validator._resolver)
        key = boundary.phase + ':' + digest(expanded)
        slot = result['boundaries'].setdefault(key, dict(phase=boundary.phase, source=boundary.source,
            schema_sha256=digest(boundary.definition), expanded_sha256=digest(expanded), controls=0,
            clauses=[dict(schema_pointer=pointer(p), keyword=k, member=member) for p, k, member in inventory(expanded)]))
        assert m['error_count'](boundary.definition, boundary.value, boundary.registry, m['FORMAT']) == 0
        assert m['error_count'](expanded, boundary.value, format_checker=m['FORMAT']) == 0
        boundary.call(copy.deepcopy(boundary.value))
        slot['controls'] += 1
        target_row, _, _ = m['table_rows'](boundary.phase)[0]
        code = m['table_module'](boundary.phase).case(None).table.guards[target_row].refusal_code
        for sp, keyword, member, ip, item in proposals(m, expanded, boundary.value):
            witness_key = (key, sp, keyword, member)
            proposal_key = witness_key + (digest(boundary.value), ip, 'DELETE' if item is DELETE else digest(item))
            if proposal_key in seen or witness_key in proved:
                continue
            seen.add(proposal_key)
            try:
                negative = replace(boundary.value, ip, item)
            except (KeyError, IndexError, TypeError):
                result['discarded_proposals'].append(dict(boundary=key, schema_pointer=pointer(sp), keyword=keyword,
                    member=member, instance_pointer=pointer(ip), reason='inactive container cannot be constructed'))
                continue
            own_errors = m['error_count'](boundary.definition, negative, boundary.registry, m['FORMAT'])
            expanded_errors = m['error_count'](expanded, negative, format_checker=m['FORMAT'])
            assert bool(own_errors) == bool(expanded_errors), (name, key, 'expansion changed owner acceptance')
            if not own_errors:
                result['discarded_proposals'].append(dict(boundary=key, schema_pointer=pointer(sp), keyword=keyword,
                    member=member, instance_pointer=pointer(ip), reason='no owner schema defect; no mutation credit',
                    negative_sha256=digest(negative)))
                continue
            cut = copy.deepcopy(expanded)
            cut_node = cut
            for k in sp:
                cut_node = cut_node[k]
            if keyword == 'required':
                cut_node[keyword].remove(member)
            else:
                cut_node.pop(keyword)
            isolated = m['error_count'](cut, negative, format_checker=m['FORMAT']) == 0
            label = 'c12/schema/' + str(len(result['ledger']) + len(result['invalid']))
            entry = dict(id=label, boundary=key, schema_pointer=pointer(sp), instance_pointer=pointer(ip),
                         keyword=keyword, member=member, expected_phase=boundary.phase, expected_row=target_row,
                         expected_code=code, owner_errors=own_errors, isolated_owner_clause=isolated,
                         negative_sha256=digest(negative))
            start = len(m['RECORDER']) if m['RECORDER'] is not None else 0
            try:
                boundary.call(negative)
            except m['TableRefusal'] as exc:
                entry.update(actual_phase=exc.phase, actual_row=exc.row, actual_code=exc.code)
                exact = (exc.phase, exc.row, exc.code) == (boundary.phase, target_row, code)
                if not exact:
                    entry['reason'] = 'earlier boundary refuses; no expected-refusal kill credit'
            except (KeyError, TypeError, ValueError, IndexError, AttributeError) as exc:
                entry.update(actual_exception=type(exc).__name__, reason='unconstructible/non-targeting proposal; no credit')
                exact = False
            else:
                entry['reason'] = 'complete boundary accepted an owner-invalid proposal'
                raise AssertionError((name, entry))
            finally:
                if m['RECORDER'] is not None:
                    del m['RECORDER'][start:]
            if not exact:
                result['invalid'].append(entry)
                continue
            # Restoration is re-executed against the original definition, then
            # expect_failure feeds this complete call into the original collector.
            assert m['error_count'](boundary.definition, negative, boundary.registry, m['FORMAT']) == own_errors
            m['expect_failure'](lambda b=boundary, v=negative: b.call(v), code, name, label, row=target_row)
            from pm_dg6b_guard_suites import Collector
            entry['complete_row_cut'] = Collector.complete_boundary_flip(
                lambda b=boundary, v=negative: b.call(v), boundary.phase, target_row)
            # The original row is restored by complete_boundary_flip's finally.
            m['expect_failure'](lambda b=boundary, v=negative: b.call(v), code, name,
                                label + '/restored', row=target_row)
            entry['status'] = 'KILL'
            result['ledger'].append(entry)
            if isolated:
                proved.add(witness_key)
    for key, slot in result['boundaries'].items():
        for clause in slot['clauses']:
            matches = [e for e in result['ledger'] if e['boundary'] == key and
                       e['schema_pointer'] == clause['schema_pointer'] and e['keyword'] == clause['keyword'] and
                       e['member'] == clause['member']]
            clause['witnesses'] = [e['id'] for e in matches]
            clause['isolated'] = any(e['isolated_owner_clause'] for e in matches)
    RESULTS[name] = result
    return dict(boundaries=len(result['boundaries']), exact_kills=len(result['ledger']), invalid=len(result['invalid']),
                isolated_owner_clauses=len(proved))
