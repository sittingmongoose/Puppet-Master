#!/usr/bin/env python3
"""PNC-019 s4o1: source-bound payload oracle cells, without admission.

Run --inventory READINESS to materialize the alphabetical first 94 oracle-short
families. Run --family EVENT --out DIRECTORY for executable schema witnesses.
Full-family lifecycle regression and gated guard proof remain separate evidence;
this command never promotes a criterion on the strength of a schema sample.
"""
from __future__ import annotations

import argparse
import copy
import gzip
import hashlib
import json
import re
from pathlib import Path
import sys
from functools import cache
from urllib.parse import urldefrag, urlsplit

from jsonschema import Draft202012Validator, ValidationError, validators
from jsonschema._utils import equal
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012

from pm_event_datetime import EVENT_RECORD, STORAGE_UTC_Z, date_time
from pm_event_numbers import Refusal, current_integer

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'tests/fixtures/pnc019_s4o1/families.json'


def read(path):
    return json.loads((ROOT / path).read_text())


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def pointer(parts):
    return '/' + '/'.join(str(p).replace('~', '~0').replace('/', '~1') for p in parts) if parts else ''


def at(value, path):
    for part in path:
        value = value[int(part)] if isinstance(value, list) else value[part]
    return value


def rows(path, key='families'):
    value = read(path)
    return value if isinstance(value, list) else value[key]


def find_row(path, family, key='families'):
    return next(r for r in rows(path, key) if r['event_type'] == family)


def family_sources(family, lane):
    """Explicit lane bindings: never guess a schema from an event-name prefix."""
    slug = family.replace('.', '_')
    if lane == 'DG6A':
        for folder in ('alert_event_contracts', 'card5_event_contracts', 'concern_created_contracts'):
            path = f'Plans/{folder}/manifest.json'
            if not (ROOT / path).exists():
                continue
            for row in rows(path):
                if row['event_type'] == family:
                    fixture = f'Plans/{folder}/{row["slug"]}.fixtures.json'
                    schema = row.get('payload_schema', f'Plans/{folder}/{row["slug"]}.payload.schema.json')
                    data = read(fixture)
                    if folder == 'alert_event_contracts':
                        payloads = [r['payload'] for r in data['payload_cases'] if r['valid']]
                    elif folder == 'card5_event_contracts':
                        payloads = [data['bases']['payload']]
                    else:
                        payloads = [r['value'] for r in data['payload_cases'] if r['valid']]
                    return schema, fixture, payloads
    if lane == 'DT':
        fixture = 'Plans/dt_event_contract_fixtures.json'
        schema = find_row('Plans/dt_event_contracts.json', family)['payload_schema_ref']
        return schema, fixture, [find_row(fixture, family)['valid_payload']]
    if lane == 'DG6B':
        fixture = 'Plans/dg6b_event_contract_fixtures.json'
        return 'Plans/dg6b_event_contracts.schema.json#/$defs/' + slug, fixture, [find_row(fixture, family)['valid']]
    if lane == 'DC':
        fixture = 'Plans/collaboration_event_contract_fixtures.json'
        ref = find_row('Plans/collaboration_event_admission.json', family, 'rows')['registry_row']['payload_schema_ref']
        payloads = read(fixture)['payloads']
        selected = payloads[family] if isinstance(payloads, dict) else [p for p in payloads if p.get('event_type') == family]
        if isinstance(selected, dict):
            selected = [selected]
        # This registry reference names the Project edition. Application
        # editions are exercised by the complete DC checker, not relabelled
        # as controls of the Project schema.
        return ref['path'] + ref['json_pointer'], fixture, [p.get('payload', p) for p in selected if p.get('edition', 'project') == 'project']
    if lane == 'DCH':
        if family == 'chat.response_stop_requested':
            fixture = 'Plans/dch_stop_contract_fixtures.json'
            data = read(fixture)
            return 'Plans/dch_stop_outcome.schema.json', fixture, [data['bases']['DCH9-0001']['record']['payload']]
        fixture = 'Plans/dch_event_contract_fixtures.json'
        schema = find_row('Plans/dch_event_contracts.json', family, 'rows')['payload_schema_ref']
        return schema, fixture, [r['valid'] for r in read(fixture) if r['event_type'] == family]
    if lane == 'DCW':
        fixture = 'Plans/dcw_event_contract_fixtures.json'
        row = find_row(fixture, family)
        return row['schema'], fixture, [row['positive']['event']['payload']]
    if lane == 'DF':
        fixture = 'Plans/filesafe_event_contract_fixtures.json'
        return 'Plans/event_payloads/' + slug + '_v2.schema.json', fixture, find_row(fixture, family)['positive_payloads']
    if lane == 'DFM':
        fixture = 'Plans/filemanager_event_contract_fixtures.json'
        return 'Plans/event_payloads/file_manager/' + slug + '.schema.json', fixture, [find_row(fixture, family, 'rows')['payload']]
    if lane == 'DO':
        fixture = 'Plans/orchestrator_event_contract_fixtures.json'
        cases = [r for r in read(fixture)['event_cases'] if r['event_type'] == family]
        return 'Plans/orchestrator_event_payloads.schema.json#/$defs/' + cases[0]['definition'], fixture, [r['logical_payload'] for r in cases]
    if lane == 'DS15':
        for manifest in ('Plans/ds15_event_contracts.json', 'Plans/ds15_deck2_contracts.json'):
            row = next((r for r in read(manifest) if r['event_type'] == family), None)
            if row:
                if manifest.endswith('ds15_event_contracts.json'):
                    fixture = 'Plans/ds15_event_contract_fixtures.json'
                    return row['payload_schema_ref'], fixture, [find_row(fixture, family)['positive']]
                fixture = 'Plans/ds15_deck2_fixtures.json'
                data = find_row(fixture, family)
                return row['payload_schema_ref'], fixture, [data['bases'][key]['payload'] for key in ('project', 'application') if key in data['bases']]
    if lane == 'DS':
        if family == 'context.compaction.completed':
            fixture = 'Plans/context_compaction_completion_contract_fixtures.json'
            return 'Plans/event_payload_context_compaction_completed.schema.json', fixture, [r['payload'] for r in read(fixture)['valid']]
        name = 'created' if family.endswith('created') else 'reset'
        fixture = f'Plans/browser_workspace_{name}_contract_fixtures.json'
        data = next(r for r in read('Plans/browser_event_admission_fixtures.json')['valid'] if r['case_id'] == 'browser_event_workspace_' + name)
        return 'Plans/browser_event_payloads.schema.json#/$defs/workspace_' + name, 'Plans/browser_event_admission_fixtures.json', [data['payload']]
    raise ValueError(('unbound family', lane, family))


def inventory(path):
    data = json.loads(Path(path).read_text())
    short = sorted((r for r in data if 'positive_negative_oracles' in r.get('nonpass_cells', {})), key=lambda r: r['event_type'])
    if len(short) != 187 or len({r['event_type'] for r in short}) != 187:
        raise ValueError('readiness is not the 187-family unique batch-2 oracle list')
    result = {'selection': 'alphabetical positions 1..94 of 187 oracle-short batch-2 families',
              'source_sha256': sha(Path(path)), 'rows': []}
    for position, row in enumerate(short[:94], 1):
        schema, fixture, payloads = family_sources(row['event_type'], row['lane'])
        unique = {json.dumps(p, sort_keys=True):p for p in payloads}
        result['rows'].append(dict(position=position, event_type=row['event_type'], lane=row['lane'],
                                  schema=schema, fixture=fixture, before=row,
                                  schema_sha256=sha(ROOT/urldefrag(schema)[0]), fixture_sha256=sha(ROOT/fixture),
                                  control_sha256=[hashlib.sha256(s.encode()).hexdigest() for s in unique]))
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(result, indent=2) + '\n')
    return {'families': len(result['rows']), 'manifest': str(MANIFEST)}


def load_rows():
    """Rehydrate committed fixtures only after verifying their pinned bytes."""
    result = read(str(MANIFEST.relative_to(ROOT)))['rows']
    for row in result:
        schema, fixture, payloads = family_sources(row['event_type'], row['lane'])
        unique = {json.dumps(p, sort_keys=True):p for p in payloads}
        if (schema != row['schema'] or fixture != row['fixture']
                or sha(ROOT/urldefrag(schema)[0]) != row['schema_sha256']
                or sha(ROOT/fixture) != row['fixture_sha256']
                or [hashlib.sha256(s.encode()).hexdigest() for s in unique] != row['control_sha256']):
            raise ValueError('stale schema/fixture/control binding: ' + row['event_type'])
        row['controls'] = list(unique.values())
    return result


@cache
def registry():
    documents = {}
    for file in (ROOT / 'Plans').rglob('*.schema.json'):
        if any(p in file.parts for p in ('_shards', '.audits', '.evidence', 'ledgers', '.plan_migration',
                                        'inputs', 'predecessor', 'preinstallation-originals', 'retained',
                                        'workflow_activation_contracts', 'workflow_standard_source_contracts')):
            continue
        value = json.loads(file.read_text())
        documents[file.resolve().as_uri()] = value
        if isinstance(value, dict) and '$id' in value:
            if value['$id'] in documents and documents[value['$id']] != value:
                raise ValueError('Ambiguous current schema resource: ' + value['$id'])
            documents[value['$id']] = value
        documents['https://puppetmaster.local/Plans/' + str(file.relative_to(ROOT / 'Plans'))] = value
    def retrieve(uri):
        # Several owners use an exact pm.* relative resource id. Resolve that
        # declared id in this closed catalogue; no ambient file/network read.
        name = urlsplit(uri).path.rsplit('/', 1)[-1]
        if name.startswith('pm.') and name in documents:
            return Resource.from_contents(documents[name], default_specification=DRAFT202012)
        from referencing.exceptions import NoSuchResource
        raise NoSuchResource(ref=uri)
    reg = Registry(retrieve=retrieve).with_resources((uri, Resource.from_contents(value, default_specification=DRAFT202012)) for uri, value in documents.items()).crawl()
    return reg, documents


def exact_integer(validator, types, instance, schema):
    if types == 'integer' or isinstance(types, list) and 'integer' in types and isinstance(instance, (int, float)):
        if isinstance(instance, (int, float)) and not isinstance(instance, bool):
            try:
                current_integer(instance)
            except Refusal as exc:
                yield ValidationError(str(exc))
                return
    yield from Draft202012Validator.VALIDATORS['type'](validator, types, instance, schema)


def minimum(validator, bound, instance, schema):
    if validator.is_type(instance, 'number') and instance < bound:
        yield ValidationError('number is below the declared minimum')


def maximum(validator, bound, instance, schema):
    if validator.is_type(instance, 'number') and instance > bound:
        yield ValidationError('number is above the declared maximum')


def exclusive_minimum(validator, bound, instance, schema):
    if validator.is_type(instance, 'number') and instance <= bound:
        yield ValidationError('number is not above the exclusive minimum')


def exclusive_maximum(validator, bound, instance, schema):
    if validator.is_type(instance, 'number') and instance >= bound:
        yield ValidationError('number is not below the exclusive maximum')


def const(validator, expected, instance, schema):
    if not equal(instance, expected):
        yield ValidationError('value differs from the declared constant')


def enum(validator, choices, instance, schema):
    if not any(equal(instance, choice) for choice in choices):
        yield ValidationError('value is outside the declared enumeration')


CurrentValidator = validators.extend(Draft202012Validator, {
    'type': exact_integer, 'minimum': minimum, 'maximum': maximum,
    'exclusiveMinimum': exclusive_minimum, 'exclusiveMaximum': exclusive_maximum,
    'const': const, 'enum': enum,
})


def errors(validator, candidate):
    """Exceptions are errors, never negative kills."""
    return list(validator.iter_errors(candidate))


def leaf_errors(found):
    for error in found:
        yield error
        yield from leaf_errors(error.context)


def exact_refusal(found, keyword, schema_path, instance_path, member=None):
    expected_path = tuple(p for p in schema_path if p != '$ref') + (keyword,)
    for error in leaf_errors(found):
        if (error.validator == keyword and tuple(error.absolute_path) == instance_path
                and tuple(error.absolute_schema_path) == expected_path
                and (member is None or error.message == repr(member) + ' is a required property')):
            return True
    return False


def type_accepts(value, declared):
    kinds = (declared,) if isinstance(declared, str) else declared
    allowed = {'null': value is None, 'boolean': type(value) is bool,
               'integer': type(value) is int, 'number': type(value) in (int, float),
               'string': isinstance(value, str), 'object': isinstance(value, dict), 'array': isinstance(value, list)}
    return any(allowed[t] for t in kinds)


def schema_nodes(schema, instance, reg, schema_path=(), instance_path=(), resolver=None, seen=()):
    """Enumerate evaluated properties, arrays and applicable branches by source path.

    The full root validator remains the final verdict. An unvisited branch is
    explicitly left without a witness; enumeration never declares it proved.
    """
    if not isinstance(schema, dict):
        return
    if '$ref' in schema:
        resolved = (resolver or reg.resolver()).lookup(schema['$ref'])
        marker = (schema['$ref'], instance_path)
        if marker not in seen:
            yield from schema_nodes(resolved.contents, instance, reg, schema_path + ('$ref',), instance_path, resolved.resolver, seen + (marker,))
    yield schema_path, instance_path, schema, instance
    if isinstance(instance, dict):
        for name, child in schema.get('properties', {}).items():
            if name in instance:
                yield from schema_nodes(child, instance[name], reg, schema_path + ('properties', name), instance_path + (name,), resolver, seen)
    if isinstance(instance, list) and isinstance(schema.get('items'), dict):
        for index, item in enumerate(instance):
            yield from schema_nodes(schema['items'], item, reg, schema_path + ('items',), instance_path + (index,), resolver, seen)
    for keyword in ('allOf', 'anyOf', 'oneOf'):
        for index, child in enumerate(schema.get(keyword, [])):
            if CurrentValidator(child, registry=reg, _resolver=resolver).is_valid(instance):
                yield from schema_nodes(child, instance, reg, schema_path + (keyword, index), instance_path, resolver, seen)
    if 'if' in schema:
        keyword = 'then' if CurrentValidator(schema['if'], registry=reg, _resolver=resolver).is_valid(instance) else 'else'
        if keyword in schema:
            yield from schema_nodes(schema[keyword], instance, reg, schema_path + (keyword,), instance_path, resolver, seen)


def proposals(node, value):
    if 'type' in node:
        for other in (None, False, 0, 1.0, '', [], {}):
            if not type_accepts(other, node['type']):
                yield 'type', None, other, False
                break
    if 'const' in node:
        yield 'const', None, '__different__' if isinstance(value, str) else None, False
    if 'enum' in node:
        yield 'enum', None, '__not_in_enum__', False
    if isinstance(value, dict):
        for name in node.get('required', []):
            if name in value:
                other = copy.deepcopy(value); del other[name]
                yield 'required', name, other, False
        if node.get('additionalProperties') is False:
            other = copy.deepcopy(value); other['__unexpected_pnc019__'] = True
            yield 'additionalProperties', None, other, False
    if isinstance(value, str):
        if node.get('minLength', 0) > 0:
            yield 'minLength', None, '', False
        if node.get('maxLength', 0) and node['maxLength'] < 100000:
            yield 'maxLength', None, 'x' * (node['maxLength'] + 1), False
        if 'pattern' in node:
            for other in ('', '\n', '__invalid__', value + '\n'):
                if re.search(node['pattern'], other) is None:
                    yield 'pattern', None, other, False
                    break
        if node.get('format') == 'date-time':
            for other in ('2026-11-14T24:00:00Z', '2026-02-30T12:00:00Z', '2026-11-14T12:00:00', value + '\n'):
                yield 'format', None, other, False
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        for keyword, delta in (('minimum', -1), ('maximum', 1), ('exclusiveMinimum', 0), ('exclusiveMaximum', 0)):
            if keyword in node:
                yield keyword, None, node[keyword] + delta, False
    if isinstance(value, list):
        if node.get('minItems', 0) > 0:
            yield 'minItems', None, [], False
        if node.get('maxItems', 0) and node['maxItems'] < 256 and value:
            yield 'maxItems', None, value * (node['maxItems'] // len(value) + 1), False
        if node.get('uniqueItems') is True and value:
            yield 'uniqueItems', None, value + [copy.deepcopy(value[0])], False


def run_family(row, out):
    from pm_event_datetime import format_checker
    reg, documents = registry()
    path, frag = urldefrag(row['schema'])
    document = documents[(ROOT / path).resolve().as_uri()]
    root_uri = (ROOT / path).resolve().as_uri()
    resolver = reg.resolver(root_uri)
    schema = resolver.lookup('#' + frag).contents if frag else document
    if '$id' in schema:
        resolver = reg.resolver(schema['$id'])
    validator = CurrentValidator(schema, registry=reg, _resolver=resolver, format_checker=format_checker(profile=EVENT_RECORD))
    controls, cases, anomalies = [], [], []
    attempted = set()
    for index, payload in enumerate(row['controls']):
        failures = errors(validator, payload)
        if failures:
            anomalies.append({'kind': 'invalid_control', 'control': index, 'errors': [str(e)[:500] for e in failures]})
            continue
        controls.append(index)
        for sp, ip, node, original in schema_nodes(schema, payload, reg, resolver=resolver):
            for keyword, member, replacement, _ in proposals(node, original):
                marker = json.dumps([sp, ip, keyword, member, replacement], sort_keys=True)
                if marker in attempted:
                    continue
                attempted.add(marker)
                candidate = copy.deepcopy(payload)
                if ip:
                    at(candidate, ip[:-1])[ip[-1]] = replacement
                else:
                    candidate = replacement
                observed = errors(validator, candidate)
                matched = exact_refusal(observed, keyword, sp, ip, member)
                flip, cut_error, restored = False, None, False
                if matched and '$ref' not in sp:
                    cut_schema = copy.deepcopy(schema)
                    cut_node = at(cut_schema, sp)
                    if keyword == 'required':
                        cut_node[keyword].remove(member)
                    else:
                        del cut_node[keyword]
                    cut_validator = CurrentValidator(cut_schema, registry=reg, _resolver=resolver,
                                                     format_checker=format_checker(profile=EVENT_RECORD))
                    cut_errors = errors(cut_validator, candidate)
                    flip = not cut_errors
                    cut_error = [{'keyword': e.validator, 'schema_path': pointer(e.absolute_schema_path),
                                  'instance_path': pointer(e.absolute_path)} for e in cut_errors]
                    restored = exact_refusal(errors(validator, candidate), keyword, sp, ip, member)
                # A different schema keyword, semantic error or exception is never a kill.
                cases.append(dict(id=len(cases), control=index, keyword=keyword, member=member,
                                  schema_path=pointer(sp + (keyword,)), instance_path=pointer(ip),
                                  expected_refusal=keyword, killed=matched, single_clause_flip=flip,
                                  restored=restored, cut_observed=cut_error,
                                  observed=[{'keyword': e.validator, 'schema_path': pointer(e.absolute_schema_path),
                                             'instance_path': pointer(e.absolute_path)} for e in observed],
                                  replacement=replacement))
    result = dict(event_type=row['event_type'], lane=row['lane'], schema=row['schema'], schema_sha256=sha(ROOT/path),
                  fixture=row['fixture'], fixture_sha256=sha(ROOT/row['fixture']), controls=controls,
                  expected_refusal_kills=sum(c['killed'] for c in cases), candidates=len(cases), anomalies=anomalies,
                  single_clause_flips=sum(c['single_clause_flip'] for c in cases),
                  native_execution='NOT_RUN', criterion_12='PARTIAL',
                  boundary='Payload schema witnesses only; complete lifecycle and per-clause gated isolation are separate obligations.', cases=cases)
    out.mkdir(parents=True, exist_ok=True)
    data = json.dumps(result, sort_keys=True, indent=1).encode() + b'\n'
    (out / (row['event_type'] + '.json.gz')).write_bytes(gzip.compress(data, mtime=0))
    return {k: v for k, v in result.items() if k != 'cases'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--inventory', type=Path)
    parser.add_argument('--family')
    parser.add_argument('--out', type=Path)
    args = parser.parse_args()
    if args.inventory:
        print(json.dumps(inventory(args.inventory)))
        return 0
    selected = [r for r in load_rows() if not args.family or r['event_type'] == args.family]
    if not selected or args.out is None:
        parser.error('a selected manifest family and --out are required')
    summaries = []
    for row in selected:
        summary = run_family(row, args.out)
        print(json.dumps(summary), flush=True)
        summaries.append(summary)
    (args.out/'summary.json').write_text(json.dumps(summaries, indent=2) + '\n')
    return int(any(r['anomalies'] or not r['controls'] for r in summaries))


if __name__ == '__main__':
    sys.exit(main())
