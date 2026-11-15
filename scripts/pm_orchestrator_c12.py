#!/usr/bin/env python3
"""DO-specific C12 evidence over the original checker and its Method B tables.

The schema route is whole-definition Method B: the original, complete schema
predicate supplies each verdict. Clause observations below are evidence about
that predicate, never new acceptance rules or per-keyword guard-tool credit.
"""
import argparse
import copy
import hashlib
import importlib.util
import json
import os
import re
import subprocess
import sys
import tarfile
import time
from collections import Counter
from dataclasses import asdict, is_dataclass
from pathlib import Path

import pm_guard_isolation as g
import pm_orchestrator_event_guards as guards
import pm_orchestrator_event_oracles as o
from referencing import Resource
from referencing.jsonschema import DRAFT202012

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('do_c12_contracts', ROOT / 'scripts/pm-orchestrator-event-contracts.py')
c = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = c
SPEC.loader.exec_module(c)
MISSING = object()
ASSERTIONS = frozenset(('type', 'const', 'enum', 'required', 'minimum', 'maximum', 'exclusiveMinimum',
                       'exclusiveMaximum', 'minLength', 'maxLength', 'minItems', 'maxItems', 'uniqueItems',
                       'minProperties', 'maxProperties', 'pattern', 'format', 'additionalProperties', 'not', 'oneOf', 'anyOf', 'contains'))


def sha(value):
    return hashlib.sha256(o.typed_text(value).encode()).hexdigest()


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=1, ensure_ascii=True) + '\n')


def load():
    fixtures = o.fixture_loads((ROOT / 'Plans/orchestrator_event_contract_fixtures.json').read_text())
    o.install_original_custody(fixtures, c)
    schema = json.loads((ROOT / 'Plans/orchestrator_event_payloads.schema.json').read_text())
    return fixtures, schema


def get(value, path):
    for key in path:
        if type(value) not in (dict, list) or (type(value) is dict and key not in value):
            return MISSING
        if type(value) is list and (type(key) is not int or key >= len(value)):
            return MISSING
        value = value[key]
    return value


def changed(value, path, replacement=MISSING, *, delete=None):
    result = copy.deepcopy(value)
    if not path:
        if delete is not None:
            result.pop(delete, None)
            return result
        return copy.deepcopy(replacement)
    parent = get(result, path[:-1])
    if parent is MISSING:
        return MISSING
    if delete is not None:
        target = parent[path[-1]]
        if type(target) is not dict:
            return MISSING
        target.pop(delete, None)
    else:
        parent[path[-1]] = copy.deepcopy(replacement)
    return result


def decode_pointer(fragment):
    return tuple(x.replace('~1', '/').replace('~0', '~') for x in fragment.lstrip('/').split('/')) if fragment else ()


def roots(fixtures, payload_schema):
    """Every consumed DO schema seam; validators are the original checker's.

    A seam declares a complete schema definition, its production guard, and its
    controls. An input schema nested in a source keeps its separate occurrence.
    """
    docs = dict(o.selected_documents(ROOT))
    docs['orchestrator_event_payloads'] = payload_schema
    docs['event_record_index'] = o.index_row_schema(ROOT)
    registry = o.offline_registry({k: v for k, v in docs.items() if '$id' in v})
    v = o.selected_validators(ROOT, c.UTC_FORMAT)
    event_cases = fixtures['event_cases']
    history_cases = event_cases + fixtures['retained_event_cases'] + fixtures['compatibility_event_cases']
    routes = []

    def add(name, document, pointer, row, code, samples, validator):
        doc = docs[document]
        node = get(doc, pointer)
        base = doc.get('$id', 'https://puppetmaster.local/DO/event_record_index.schema.json')
        resolver = registry.resolver(base_uri=base)
        # Selection retains the original document scope and offline registry.
        if pointer:
            resolver = resolver.lookup('#' + g.pointer(pointer)).resolver
        by_hash = {}
        for family, sample_id, value in samples:
            by_hash.setdefault(sha(value), dict(family=family, id=sample_id, value=value))
        routes.append(dict(name=name, document=document, pointer=pointer, node=node, resolver=resolver,
                           row=row, code=code, samples=list(by_hash.values()), validator=validator))

    for contract in fixtures['contracts']:
        family, definition = contract['event_type'], contract['definition']
        add('payload:' + family, 'orchestrator_event_payloads', ('$defs', definition),
            'logical_payload_schema', 'logical_payload_schema',
            [(family, x['case_id'], x['logical_payload']) for x in event_cases if x['event_type'] == family],
            o.StrictValidator(payload_schema['$defs'][definition], format_checker=c.UTC_FORMAT))
    add('event', 'event_record', (), 'event_record_schema', 'event_schema',
        [(x['event_type'], x['case_id'], x['event']) for x in history_cases], v['event'])
    for key, row in [('checkpoint', 'checkpoint_value_schema'), ('read_token', 'read_token_value_schema')]:
        add(key, 'event_record_index_checkpoint', ('$defs', key), row, 'checkpoint_schema',
            [(x['event_type'], x['case_id'], x['read'][key]) for x in event_cases], v[key])
    add('index_row', 'event_record_index', (), 'index_row_value_schema', 'index_row_schema',
        [(x['event_type'], x['case_id'], x['read']['row']) for x in event_cases], o.index_row_validator(ROOT, c.UTC_FORMAT))
    add('historical', 'orchestrator_historical_read', (), 'historical_state_schema', 'historical_state_schema',
        [(x['event_type'], x['case_id'], x['historical_reader_state']) for x in history_cases], v['historical'])
    for edition in ('', '_v2'):
        cases = [x for x in fixtures['board_storage_cases'] if x['payload']['scope'] == 'application'
                 and ('_v2' if x['event_type'] == 'crew.board_message_posted' or
                      x['source'].get('schema_id') == 'pm.application_source.coordination_append.v2' else '') == edition]
        document = 'application_board_message_v2' if edition else 'application_workflow_contracts'
        for key, definition, path, row in [
            ('source', 'OriginalCoordinationAppendSourceV2' if edition else 'OriginalCoordinationAppendSource', ('source',), 'application_source_schema'),
            ('input', 'AgentMessageApplicationV2' if edition else 'AgentMessageApplicationV1', ('source', 'original_input'), 'application_input_schema'),
            ('wrapper', 'CrewBoardMessageStorageApplicationV2' if edition else 'CrewBoardMessageStorageApplicationV1', ('wrapper',), 'application_wrapper_schema')]:
            owner = 'application_workflow_sources' if key == 'source' and not edition else document
            add(key + edition, owner, ('$defs', definition), row, row,
                [(x['event_type'], 'board:' + str(i), get(x, path)) for i, x in enumerate(cases)], v[key + edition])
    return routes, docs, registry


def walk(node, resolver, path=(), source_path=(), trail=(), stack=()):
    """Original schema occurrences, with reference and conditional routes intact."""
    if type(node) is not dict or id(node) in stack:
        return
    resolver = resolver.in_subresource(Resource.from_contents(node, default_specification=DRAFT202012))
    yield node, resolver, path, source_path, trail
    stack = stack + (id(node),)
    if '$ref' in node:
        target = resolver.lookup(node['$ref'])
        yield from walk(target.contents, target.resolver, path, source_path, trail + (node['$ref'],), stack)
    for key, child in node.get('properties', {}).items():
        yield from walk(child, resolver, path + (key,), source_path + ('properties', key), trail, stack)
    if type(node.get('items')) is dict:
        yield from walk(node['items'], resolver, path + ('*',), source_path + ('items',), trail, stack)
    for pattern, child in node.get('patternProperties', {}).items():
        yield from walk(child, resolver, path + ('@pattern:' + pattern,),
                        source_path + ('patternProperties', pattern), trail, stack)
    for keyword in ('allOf', 'anyOf', 'oneOf'):
        for i, child in enumerate(node.get(keyword, ())):
            yield from walk(child, resolver, path, source_path + (keyword, i), trail, stack)
    for keyword in ('if', 'then', 'else', 'not', 'contains'):
        if type(node.get(keyword)) is dict:
            yield from walk(node[keyword], resolver, path + ('*',) if keyword == 'contains' else path,
                            source_path + (keyword,), trail, stack)
    if type(node.get('additionalProperties')) is dict:
        yield from walk(node['additionalProperties'], resolver, path + ('@additional',),
                        source_path + ('additionalProperties',), trail, stack)


def paths(value, pattern):
    if not pattern:
        yield ()
        return
    key, *rest = pattern
    keys = range(len(value)) if key == '*' and type(value) is list else (
        [k for k in value] if key == '@additional' and type(value) is dict else
        [k for k in value if re.search(key[len('@pattern:'):], k)] if type(key) is str and key.startswith('@pattern:') and type(value) is dict else [key])
    for key in keys:
        if type(value) is dict and key in value or type(value) is list and type(key) is int and key < len(value):
            for suffix in paths(value[key], rest):
                yield (key,) + suffix


def specimen(node, resolver, depth=0):
    """Construct DO schema controls only; the unchanged owner validator judges them."""
    if depth > 18 or type(node) is not dict:
        return None
    if '$ref' in node:
        target = resolver.lookup(node['$ref'])
        return specimen(target.contents, target.resolver, depth + 1)
    if 'const' in node:
        return copy.deepcopy(node['const'])
    if 'enum' in node:
        return copy.deepcopy(node['enum'][0])
    if node.get('properties', {}).get('schema_id', {}).get('const') == 'pm.workflow_scope.v2':
        # Exact DO application context. Project controls are authored separately;
        # a generic string cannot stand in for the owner's app/null pairing.
        return dict(schema_id='pm.workflow_scope.v2', schema_version='2.0.0', scope_kind='application',
                    scope_partition='app', project_id=None, project_home_server_id=None, named_plan_id=None,
                    server_id='c12-control')
    kind = node.get('type')
    if type(kind) is list:
        kind = next((x for x in kind if x != 'null'), 'null')
    if kind == 'object' or 'properties' in node:
        value = {k: specimen(v, resolver, depth + 1) for k, v in node.get('properties', {}).items()
                 if k in node.get('required', ())}
    elif kind == 'array':
        value = [specimen(node.get('items', {}), resolver, depth + 1) for _ in range(max(1, node.get('minItems', 0)))]
    elif kind == 'string':
        pattern = node.get('pattern', '')
        if node.get('format') == 'date-time':
            value = '2026-11-14T00:00:00Z'
        elif node.get('format') == 'uuid':
            value = '12345678-1234-4234-9234-123456789abc'
        elif '[0-9a-f]{64}' in pattern:
            prefix = pattern.split('[0-9a-f]{64}', 1)[0].removeprefix('^')
            value = prefix + 'a' * 64
        elif '[0-9a-f]{8}-' in pattern:
            value = '12345678-1234-1234-9234-123456789abc'
        else:
            value = 'c12-control'
        value = value[:node.get('maxLength', len(value))]
        value += 'x' * max(0, node.get('minLength', 0) - len(value))
    elif kind in ('number', 'integer'):
        value = max(0, node.get('minimum', 0))
    elif kind == 'boolean':
        value = False
    else:
        value = None
    for part in node.get('allOf', ()):
        other = specimen(part, resolver, depth + 1)
        if type(value) is dict and type(other) is dict:
            value.update(other)
        elif value is None:
            value = other
    if 'if' in node and type(value) is dict:
        conditional = o.StrictValidator(node['if'], registry=resolver._registry, format_checker=c.UTC_FORMAT, _resolver=resolver)
        branch = node.get('then' if conditional.is_valid(value) else 'else', {})
        for key, prop in branch.get('properties', {}).items():
            value[key] = specimen(prop, resolver, depth + 1)
        for key in branch.get('not', {}).get('required', ()):
            value.pop(key, None)
    for keyword in ('anyOf', 'oneOf'):
        for part in node.get(keyword, ()):
            other = specimen(part, resolver, depth + 1)
            candidate = dict(value, **other) if type(value) is dict and type(other) is dict else other
            if o.StrictValidator(node, registry=resolver._registry, format_checker=c.UTC_FORMAT, _resolver=resolver).is_valid(candidate):
                return candidate
    return value


def enriched_samples(route, registry):
    """Exercise dormant optional/non-null/array branches at the original schema seam.

    These are schema-stage controls. They do not claim new original receipt or
    downstream join authority: full lifecycle controls remain the authored ones.
    """
    samples = list(route['samples'])
    seen = {sha(x['value']) for x in samples}
    if route['name'] == 'checkpoint':
        base = samples[0]
        for state in ('staged', 'retired'):
            candidate = copy.deepcopy(base['value'])
            generation = next(iter(candidate['generations'].values()))
            generation.update(state=state, activated_at_utc=None if state == 'staged' else '2026-11-14T00:00:00Z',
                              retired_at_utc=None if state == 'staged' else '2026-11-14T01:00:00Z',
                              successor_generation_id=None if state == 'staged' else 'eig_' + 'a' * 64)
            assert route['validator'].is_valid(candidate), ('checkpoint_schema_branch', state)
            samples.append(dict(family=base['family'], id=base['id'] + ':schema-generation:' + state, value=candidate))
            seen.add(sha(candidate))
        candidate = copy.deepcopy(base['value'])
        generation = next(iter(candidate['generations'].values()))
        generation['frontier']['coverage'].update(empty_retained_source=True, retained_event_count=0, first_retained_sequence_id=None,
                                                 through_sequence_id=None, last_frame=None)
        assert route['validator'].is_valid(candidate), 'checkpoint_empty_prefix_schema_control'
        samples.append(dict(family=base['family'], id=base['id'] + ':schema-empty-prefix', value=candidate))
        seen.add(sha(candidate))
    if route['name'] in ('source', 'source_v2'):
        output_site = next((item for item in walk(route['node'], route['resolver'])
                            if item[2] == ('original_output',) and 'properties' in item[0]), None)
        if output_site:
            projection = specimen(output_site[0], output_site[1])
            variants = [projection]
            for family, outcomes in [('coordination.agent_unregistered', ('complete', 'failed', 'cancelled')),
                                     ('coordination.agent_crashed', ('process_exit', 'heartbeat_expired', 'process_lost', 'worktree_lost')),
                                     ('coordination.agent_aborted', ('parent', 'user', 'runtime'))]:
                for outcome in outcomes:
                    terminal = copy.deepcopy(projection)
                    terminal.update(terminal=dict(event_type=family, outcome=outcome, occurred_at_utc='2026-11-14T00:00:00Z'),
                                    status=outcome if family.endswith('unregistered') else 'failed' if family.endswith('crashed') else 'cancelled',
                                    active_claim_count=0, agent_revision=2)
                    variants.append(terminal)
            for base in samples[:1]:
                for projection in variants:
                    candidate = dict(copy.deepcopy(base['value']), original_output=projection)
                    if route['validator'].is_valid(candidate):
                        seen.add(sha(candidate))
                        samples.append(dict(family=base['family'], id=base['id'] + ':original-output:' + str(len(samples)), value=candidate))
    for node, resolver, pattern, source_path, trail in walk(route['node'], route['resolver']):
        selected, shapes = [], set()
        for base in samples:
            for path in paths(base['value'], pattern):
                value = get(base['value'], path)
                signature = (type(value).__name__, len(value) == 0 if type(value) in (dict, list) else None)
                if signature not in shapes:
                    shapes.add(signature)
                    selected.append(base)
        for base in selected[:4]:
            for path in paths(base['value'], pattern):
                current = get(base['value'], path)
                candidates = []
                if current is None or type(current) is list and not current:
                    candidates.append(specimen(node, resolver))
                if type(current) is dict:
                    if current.get('schema_id') == 'pm.workflow_scope.v2':
                        project_scope = dict(current, scope_kind='project', scope_partition='project~YzEyLXByb2plY3Q',
                                             project_id='c12-project', project_home_server_id='c12-server', named_plan_id=None)
                        candidates.append(project_scope)
                    for key, prop in node.get('properties', {}).items():
                        if key not in current:
                            candidates.append(dict(current, **{key: specimen(prop, resolver)}))
                for keyword in ('anyOf', 'oneOf'):
                    candidates.extend(specimen(part, resolver) for part in node.get(keyword, ()))
                candidates.extend(node.get('enum', ()))
                for value in candidates:
                    candidate = changed(base['value'], path, value)
                    if candidate is MISSING or sha(candidate) in seen or not route['validator'].is_valid(candidate):
                        continue
                    seen.add(sha(candidate))
                    samples.append(dict(family=base['family'], id=base['id'] + ':schema-branch:' + str(len(samples)), value=candidate))
    return samples


def proposals(node, value):
    """Finite clause witnesses for the actual DO schemas, including owner formats."""
    for keyword in ASSERTIONS & node.keys():
        arg = node[keyword]
        if keyword == 'required' and type(value) is dict:
            for member in arg:
                yield keyword, member, MISSING, member
        elif keyword == 'additionalProperties' and arg is False and type(value) is dict:
            yield keyword, None, dict(value, c12_unknown_member=True), None
        elif keyword == 'type':
            for candidate in (None, False, 1, 0.5, '', [], {}):
                if not o.StrictValidator({'type': arg}).is_valid(candidate):
                    yield keyword, None, candidate, None
        elif keyword == 'const':
            for candidate in ('c12-foreign', None, False, 2):
                if o.typed_text(candidate) != o.typed_text(arg):
                    yield keyword, None, candidate, None
        elif keyword == 'enum':
            yield keyword, None, 'c12-foreign-enum', None
        elif keyword in ('minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum'):
            yield keyword, None, arg - 1 if keyword in ('minimum', 'exclusiveMinimum') else arg + 1, None
        elif keyword in ('minLength', 'maxLength'):
            yield keyword, None, '' if keyword == 'minLength' else 'x' * (arg + 1), None
        elif keyword in ('minItems', 'maxItems'):
            yield keyword, None, [] if keyword == 'minItems' else ['x'] * (arg + 1), None
        elif keyword in ('minProperties', 'maxProperties'):
            yield keyword, None, {} if keyword == 'minProperties' else dict(value, **{'c12_extra_' + str(i): None for i in range(arg + 1)}), None
        elif keyword == 'uniqueItems' and arg is True:
            yield keyword, None, [value[0], value[0]] if value else ['x', 'x'], None
        elif keyword == 'pattern':
            for candidate in ('c12 bad identifier', '', str(value) + '\n', 'sk-AAAAAAAAAAAA', 'password=c12'):
                yield keyword, None, candidate, None
        elif keyword == 'not':
            # Owner redaction recognizer; a synthetic marker, never a credential.
            for candidate in ('sk-AAAAAAAAAAAA', 'password=c12', 'Bearer AAAAAAAAAAAA', 'ghp_AAAAAAAAAAAAAAAA'):
                yield keyword, None, candidate, None
            if type(value) is dict:
                for key in arg.get('required', ()):
                    yield keyword, None, dict(value, **{key: 'c12-forbidden'}), None
        elif keyword in ('anyOf', 'oneOf'):
            for candidate in (None, False, 1, [], {}, 'c12-unmatched-branch'):
                yield keyword, None, candidate, None
        elif keyword == 'contains':
            yield keyword, None, [], None
        elif keyword == 'format':
            for candidate in ('2026-02-29T00:00:00Z', '2026-11-14T24:00:00Z', '2026-11-14T00:00:00Z\n') if arg == 'date-time' else ('not-a-uuid',) if arg == 'uuid' else ('é' * 8193,):
                yield keyword, None, candidate, None


def error_rows(errors):
    result = []
    for error in errors:
        result.append(dict(keyword=error.validator if type(error.validator) is str else 'storage_semantics', instance=g.pointer(tuple(error.absolute_path)),
                           schema=g.pointer(tuple(error.absolute_schema_path))))
        result.extend(error_rows(error.context))
    return result


def schema_row_outcome(row_name, valid):
    """Call the ORIGINAL production predicate on the complete schema verdict.

    These keys are the original view seam, not a newly implemented schema rule.
    The subsequent gated proof swaps this same predicate's table entry.
    """
    row = next(row for _name, _suite, module in guards.SUITES for row in module.ROWS if row[0] == row_name)
    view = {key: 'application' if key == 'board_branch' else valid for key in row[5]}
    return o.run_rows((row,), view)


def schema_evidence(out, family=None):
    fixtures, schema = load()
    route_list, docs, registry = roots(fixtures, schema)
    matrix, ledger, invalids = [], [], []
    for route in route_list:
        if family and route['name'].startswith('payload:') and route['name'] != 'payload:' + family:
            continue
        validator = route['validator']
        samples = enriched_samples(route, registry)
        application_scopes = {pattern for node, _resolver, pattern, _source, _trail in walk(route['node'], route['resolver'])
                              if node.get('properties', {}).get('scope_kind', {}).get('const') == 'application'}
        scope_node = route['node'].get('properties', {}).get('scope', {})
        scope_domain = {scope_node['const']} if 'const' in scope_node else set(scope_node.get('enum', ()))
        for sample in samples:
            assert validator.is_valid(sample['value']), ('schema_control', route['name'], sample['id'])
            assert schema_row_outcome(route['row'], validator.is_valid(sample['value'])) == []
        for node, resolver, pattern, source_path, trail in walk(route['node'], route['resolver']):
            keywords = ASSERTIONS & node.keys()
            if not keywords:
                continue
            local = o.StrictValidator(node, registry=registry, format_checker=c.UTC_FORMAT, _resolver=resolver)
            for keyword in sorted(keywords):
                members = node[keyword] if keyword == 'required' else [None]
                for member in members:
                    site = dict(route=route['name'], row=route['row'], code=route['code'],
                                schema_path=g.pointer(source_path), references=list(trail),
                                instance_pattern=g.pointer(pattern), keyword=keyword, member=member)
                    found, attempted = None, 0
                    if 'if' in source_path or 'contains' in source_path:
                        matrix.append(dict(**site, witness=None, attempts=0, status='selector',
                            covering_proof='JSON Schema if selects then/else; its own assertions cannot reject. Child branches are separately inventoried.'))
                        continue
                    if keyword == 'additionalProperties' and node[keyword] is True or keyword in ('minLength', 'minItems', 'minProperties') and node[keyword] == 0:
                        matrix.append(dict(**site, witness=None, attempts=0, status='no_restriction',
                            covering_proof='The owner keyword imposes no restriction: true additionalProperties or zero length/cardinality lower bound.'))
                        continue
                    if source_path[:3] == ('allOf', 0, 'else') and scope_domain == {'project'}:
                        matrix.append(dict(**site, witness=None, attempts=0, status='entailed',
                            covering_proof='The root scope const is project; allOf/0/if selects that same project value. '
                            'Consequently then always applies and this else cannot execute on a schema-valid input.'))
                        continue
                    if (pattern and pattern[:-1] in application_scopes and
                        pattern[-1] in ('project_id', 'project_home_server_id', 'named_plan_id') and
                        (node.get('type') == 'string' or 'else' in source_path)):
                        matrix.append(dict(**site, witness=None, attempts=0, status='entailed',
                            covering_proof='This exact application WorkflowScopeV2 occurrence fixes this member to null '
                            'in allOf/0/then. Its string alternative and Project-only else assertions cannot apply '
                            'to a schema-valid original; the enforcing const-null clause is separately witnessed.'))
                        continue
                    if (source_path[-5:] == ('allOf', 0, 'else', 'properties', 'scope_partition') and
                        pattern[:-1] in application_scopes):
                        matrix.append(dict(**site, witness=None, attempts=0, status='entailed',
                            covering_proof='At this exact scope occurrence an enclosing allOf fixes scope_kind=application. '
                            'WorkflowScopeV2 allOf/0/if therefore always selects then; the project else pattern cannot execute.'))
                        continue
                    for sample in samples:
                        for path in paths(sample['value'], pattern):
                            value = get(sample['value'], path)
                            if 'not' not in source_path and not local.is_valid(value):
                                continue
                            candidates = list(proposals(node, value))
                            if keyword == 'required' and source_path and source_path[-1] == 'not' and type(value) is dict:
                                candidates = [('required', key, dict(value, **{key: 'c12-forbidden'}), None) for key in node['required']]
                            for kw, mem, replacement, delete in candidates:
                                if (kw, mem) != (keyword, member):
                                    continue
                                bad = changed(sample['value'], path, replacement, delete=delete)
                                if bad is MISSING or sha(bad) == sha(sample['value']):
                                    continue
                                attempted += 1
                                errors = list(validator.iter_errors(bad))
                                observed = error_rows(errors)
                                if not errors:
                                    invalids.append(dict(**site, control=sample['id'], negative_sha256=sha(bad),
                                        classification='INVALID', reason='proposal_does_not_violate_selected_owner_schema',
                                        expected_codes=[route['code']], observed_codes=schema_row_outcome(route['row'], True)))
                                    continue
                                matching = [e for e in observed if e['keyword'] == keyword and
                                            e['instance'] == g.pointer(path) and e['schema'] == g.pointer(source_path + (keyword,))]
                                if keyword == 'pattern' and 'not' in source_path and local.is_valid(replacement):
                                    matching += [e for e in observed if e['keyword'] == 'not' and e['instance'] == g.pointer(path)
                                                 and e['schema'] == g.pointer(source_path)]
                                if keyword == 'required' and source_path and source_path[-1] == 'not' and local.is_valid(replacement):
                                    matching += [e for e in observed if e['keyword'] == 'not' and e['instance'] == g.pointer(path)
                                                 and e['schema'] == g.pointer(source_path)]
                                if not matching:
                                    invalids.append(dict(**site, control=sample['id'], negative_sha256=sha(bad),
                                        classification='INVALID', reason='proposal_does_not_reach_expected_owner_clause',
                                        expected_codes=[route['code']], observed_codes=schema_row_outcome(route['row'], False),
                                        errors=observed))
                                    continue
                                # The gated proof cuts the original production row. These full-schema
                                # observations cover that row's verdict seam, not atomic clause cuts.
                                actual = schema_row_outcome(route['row'], validator.is_valid(bad))
                                assert actual == [route['code']], (site, actual)
                                record = dict(id='schema:' + str(len(ledger)), **site, family=sample['family'],
                                              control=sample['id'], control_sha256=sha(sample['value']),
                                              negative_sha256=sha(bad), instance=g.pointer(path),
                                              expected_codes=[route['code']], observed_codes=actual,
                                              errors=observed, method='whole_definition',
                                              cut=dict(kind='gated_table_entry', row=route['row']),
                                              restoration=validator.is_valid(sample['value']))
                                ledger.append(record)
                                found = record['id']
                                break
                            if found:
                                break
                        if found:
                            break
                    matrix.append(dict(**site, witness=found, attempts=attempted,
                                       status='witnessed' if found else 'NEEDS_COVERING_PROOF'))
        print(json.dumps(dict(route=route['name'], clauses=sum(x['route'] == route['name'] for x in matrix),
                              uncovered=sum(x['route'] == route['name'] and x['status'] == 'NEEDS_COVERING_PROOF' for x in matrix))), flush=True)
        write(out / 'schema-matrix.json', matrix)
        write(out / 'schema-mutations.json', ledger)
        write(out / 'schema-invalids.json', invalids)
    write(out / 'schema-invalids.json', invalids)
    write(out / 'schema-summary.json', dict(status='pass' if all(x['status'] != 'NEEDS_COVERING_PROOF' for x in matrix) else 'partial',
          clauses=len(matrix), witnesses=len(ledger), uncovered=sum(x['status'] == 'NEEDS_COVERING_PROOF' for x in matrix)))


def plain(value):
    if is_dataclass(value):
        return plain(asdict(value))
    if type(value) is dict:
        return {str(k): plain(v) for k, v in value.items()}
    if type(value) in (tuple, list):
        return [plain(v) for v in value]
    return value


def store_snapshot():
    """Actual custody map and frozen-verifier keys, rather than a case summary."""
    return dict(ORIGINAL_CUSTODY=plain(o.ORIGINAL_CUSTODY),
                RECIPE_VERIFIERS=sorted([plain(k) for k in o.RECIPE_VERIFIERS], key=lambda x: json.dumps(x, sort_keys=True)))


def retained_evidence(out):
    fixtures, schema = load()
    observations, snapshots = [], {}

    def observe(case, label, expected):
        before = store_snapshot()
        before_sha = sha(before)
        snapshots.setdefault(before_sha, before)
        record_before = o.packed(case['event'])
        resolved, reason = o.resolve_original(case)
        errors = o.historical_read_errors(case, schema, c)
        recovered = o.recover_original(case, schema, c)
        after = store_snapshot()
        assert before == after, ('retained_store_mutation', label)
        assert record_before == o.packed(case['event']), ('retained_bytes_mutation', label)
        assert errors == expected, ('retained_expected_code', case['event_type'], label, expected, errors)
        assert recovered['status'] == ('original_result' if not expected else 'historical_original_unverified')
        if not expected:
            assert o.typed_text(recovered['receipt']) == o.typed_text(case['event'])
        observations.append(dict(family=case['event_type'], case=case['case_id'], label=label,
            before_sha256=before_sha, after_sha256=sha(after), original_bytes_sha256=hashlib.sha256(record_before).hexdigest(),
            expected_codes=expected, observed_codes=errors, resolve_reason=reason,
            selected_recipe=resolved.recipe.identity_recipe if resolved else None, recovery_status=recovered['status']))

    for key in ('event_cases', 'retained_event_cases', 'compatibility_event_cases'):
        for case in fixtures[key]:
            observe(case, key, [])
    bases = {}
    for case in fixtures['event_cases']:
        bases.setdefault(case['event_type'], case)
    for family, case in bases.items():
        ref = case['historical_reader_state']['original_source_ref']
        saved = copy.deepcopy(o.ORIGINAL_CUSTODY[ref])
        commitment = o.original_binding(case).source_commitment
        try:
            del o.ORIGINAL_CUSTODY[ref]
            observe(case, 'missing_original_receipt', ['historical_original_recipe'])
            other = next(x for x in fixtures['event_cases'] if x['event_type'] != family)
            o.ORIGINAL_CUSTODY[ref] = copy.deepcopy(o.ORIGINAL_CUSTODY['seglog:' + other['event']['event_id']])
            observe(case, 'other_original_receipt', ['historical_original_recipe'])
            o.ORIGINAL_CUSTODY[ref] = {commitment: [copy.deepcopy(saved[commitment]), copy.deepcopy(saved[commitment])]}
            observe(case, 'ambiguous_original_receipts', ['historical_original_recipe'])
        finally:
            o.ORIGINAL_CUSTODY[ref] = saved
        observe(case, 'receipt_restored', [])
        print(json.dumps(dict(retained_family=family, observations=len(observations))), flush=True)
    write(out / 'retained-observations.json', observations)
    for digest, snapshot in snapshots.items():
        write(out / 'stores' / (digest + '.json'), snapshot)
    write(out / 'retained-summary.json', dict(status='pass', observations=len(observations), stores=len(snapshots),
          refused=sum(bool(x['observed_codes']) for x in observations), mutations=0, native='NOT_RUN'))


def wait_capacity(guard=False):
    while True:
        available = g.MemoryGate.available_gib()
        active = []
        if guard:
            for proc in Path('/proc').glob('[0-9]*/cmdline'):
                try:
                    args = proc.read_bytes().split(b'\0')
                except OSError:
                    continue
                if len(args) > 1 and b'python' in args[0] and any(b'guard' in x and x.endswith(b'.py') for x in args[1:3]):
                    active.append(int(proc.parent.name))
        if available >= 12 and len(active) < 4:
            return
        print(json.dumps(dict(waiting_for_capacity=True, available_gib=available, guard_processes=active)), flush=True)
        time.sleep(10)


def guard_proof(out, reuse_archive=None, reuse_directory=None):
    spec = importlib.util.spec_from_file_location('do_c12_proof', ROOT / 'scripts/pm-orchestrator-guard-proof.py')
    proof = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(proof)
    fixtures = proof.fixtures_now()
    archive = tarfile.open(reuse_archive, 'r:gz') if reuse_archive else None
    provenance = []
    tool_sha = hashlib.sha256((ROOT / 'scripts/pm_guard_isolation.py').read_bytes()).hexdigest()
    for _table, suite_name, module in guards.SUITES:
        wait_capacity()
        destination = out / (suite_name + '.json')
        directory_receipt = reuse_directory / (suite_name + '.json') if reuse_directory else None
        report, reason = None, 'no_prior_receipt'
        if destination.exists() or directory_receipt and directory_receipt.exists() or archive and not suite_name.startswith('c12_'):
            try:
                local_receipt = destination.exists()
                source_path = destination if local_receipt else directory_receipt if directory_receipt and directory_receipt.exists() else None
                raw = source_path.read_bytes() if source_path else archive.extractfile('guard-tool/' + suite_name + '.json').read()
                candidate = json.loads(raw)
                _module, controls, negatives, missing, reads = proof.suite_inputs(suite_name, fixtures, out)
                ctl = {x.id: g.digest(x.value) for x in controls}
                neg = {x.id: (g.digest(x.value), x.target, x.code, x.control) for x in negatives}
                old_ctl = {x['id']: x['sha256'] for x in candidate['controls']}
                old_neg = {x['id']: (x['sha256'], x['target'], x['code'], x['control']) for x in candidate['negatives']}
                source_rows = candidate['static']['files']
                sources_match = bool(source_rows) and all(hashlib.sha256((ROOT / x['path']).read_bytes()).hexdigest() == x['sha256']
                                    for x in source_rows)
                inventory_match = [x['id'] for x in candidate['inventory']] == [x[0] for x in module.ROWS]
                if candidate['tool_sha256'] == tool_sha and ctl == old_ctl and neg == old_neg and sources_match:
                    assert inventory_match, ('reused_inventory_mismatch', suite_name)
                    report = candidate
                    if not local_receipt:
                        write(destination, report)
                    provenance.append(dict(suite=suite_name, reused=str(source_path) if source_path else str(reuse_archive),
                                           member=None if source_path else 'guard-tool/' + suite_name + '.json',
                                           receipt_sha256=hashlib.sha256(raw).hexdigest(), controls_verified=len(ctl), negatives_verified=len(neg)))
                else:
                    reason = dict(tool=candidate['tool_sha256'] == tool_sha, sources=sources_match,
                                  controls=ctl == old_ctl, negatives=neg == old_neg)
            except (KeyError, OSError):
                reason = 'prior_receipt_unavailable'
        if report is None:
            wait_capacity(guard=True)
            code = subprocess.call([sys.executable, '-B', str(ROOT / 'scripts/pm-orchestrator-guard-proof.py'),
                                    'run-suite', suite_name, '--out', str(out)])
            assert destination.exists(), ('guard_run_without_receipt', suite_name, code)
            report = json.loads(destination.read_text())
            provenance.append(dict(suite=suite_name, reused=False, reason=reason, exit_code=code))
        unexpected = [x for x in report['failures'] if x['kind'] != 'unproved_guards']
        unproved = set(report['unproved_guards'])
        assert not unexpected, ('guard_proof_failed', suite_name, unexpected)
        assert unproved <= proof.UNPROVED.keys(), ('unjustified_guard', suite_name, sorted(unproved))
        if unproved:
            assert len(module.ROWS) == 1, ('entailed_row_not_singleton', suite_name)
        write(out / 'provenance.json', provenance)
        print(json.dumps(dict(suite=suite_name, status=report['status'], reused=provenance[-1]['reused'],
                              unproved=sorted(unproved))), flush=True)
    if archive:
        archive.close()
    reports = [json.loads((out / (suite + '.json')).read_text()) for _, suite, _ in guards.SUITES]
    write(out / 'summary.json', dict(status='pass_with_entailments', tables=len(reports),
          rows=sum(len(x['inventory']) for x in reports), proved=sum(bool(row['proved']) for x in reports for row in x['rows']),
          entailed=[dict(row=row, proof=proof.UNPROVED[row]) for x in reports for row in x['unproved_guards']],
          tool_sha256=tool_sha, reused=sum(bool(x['reused']) for x in provenance)))


def copy_tree_evidence(out):
    """All equality partitions, rather than a sample of Server spellings.

    Earlier closed application schemas fix every scope member except server_id;
    exact typed wrapper/message equality supplies the record copy edge. Thus the
    finite equality partitions cover arbitrary valid strings without aliasing
    any independently copied input.
    """
    nodes = ('source.server', 'source.scope.server', 'payload.server', 'wrapper.server',
             'wrapper.scope.server', 'message.scope.server', 'wrapper.record.scope.server')
    edges = ((0, 1), (0, 2), (2, 3), (3, 4), (4, 5), (5, 6))
    retired = ((1, 5), (4, 6))
    checked = 0
    def partitions(prefix):
        if len(prefix) == len(nodes):
            yield prefix
        else:
            for label in range(max(prefix, default=-1) + 2):
                yield from partitions(prefix + (label,))
    for assignment in partitions((0,)):
        accepted = all(assignment[a] == assignment[b] for a, b in edges)
        prior = accepted and all(assignment[a] == assignment[b] for a, b in retired)
        assert accepted == prior, ('copy_tree_widened_acceptance', assignment)
        checked += 1
    witnesses = []
    for edge in edges:
        graph = {n: set() for n in range(len(nodes))}
        for left, right in edges:
            if (left, right) != edge:
                graph[left].add(right)
                graph[right].add(left)
        component, queue = set(), [edge[0]]
        while queue:
            node = queue.pop()
            if node not in component:
                component.add(node)
                queue.extend(graph[node] - component)
        assignment = [int(n in component) for n in range(len(nodes))]
        failing = [(a, b) for a, b in edges if assignment[a] != assignment[b]]
        assert failing == [edge], ('copy_edge_not_independent', edge)
        witnesses.append(dict(edge=[nodes[x] for x in edge], values=assignment))
    write(out / 'copy-tree.json', dict(status='pass', equality_partitions=checked, nodes=nodes,
          active_edges=[[nodes[a], nodes[b]] for a, b in edges],
          retired_edges=[[nodes[a], nodes[b]] for a, b in retired], independent_witnesses=witnesses,
          scope_schema='Plans/shared_integration_runtime.schema.json#/$defs/WorkflowScopeV2',
          typed_copy='scripts/do-guards/do_board_application_source_12.py:wrapper_record_join'))


def source_manifest():
    names = {'scripts/pm_orchestrator_c12.py', 'scripts/pm_orchestrator_c12_cases.py',
             'scripts/pm-orchestrator-event-contracts.py', 'scripts/pm-orchestrator-guard-proof.py',
             'scripts/pm_orchestrator_event_guards.py', 'scripts/pm_orchestrator_event_oracles.py',
             'scripts/pm_event_numbers.py', 'scripts/pm_event_numbers_corpus.py', 'scripts/pm_event_datetime.py',
             'scripts/pm_event_datetime_inventory.py', 'scripts/pm_guard_isolation.py',
             'scripts/pm_projects_refresh_contracts.py', 'scripts/pm_event_index_binding.py',
             'Plans/orchestrator_event_contract_fixtures.json', 'Plans/orchestrator_event_payloads.schema.json',
             'Plans/storage_value_registry.json', 'Plans/application_board_message_v2_graph.json',
             'Plans/orchestrator-subagent-integration.md', 'Plans/Contracts_V0.md', 'Plans/storage-plan.md',
             'Plans/event_number_recipe_corpus.json', 'Plans/event_datetime_inventory.json'}
    names.update('Plans/' + name + '.schema.json' for name in o.selected_documents(ROOT))
    names.update(str(Path(module.__file__).relative_to(ROOT)) for _table, _suite, module in guards.SUITES)
    return {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in sorted(names)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['schemas', 'retained', 'proof', 'copy-tree'])
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--family')
    parser.add_argument('--reuse-archive', type=Path)
    parser.add_argument('--reuse-directory', type=Path)
    args = parser.parse_args()
    before = source_manifest()
    write(args.out / 'sources.json', before)
    if args.command == 'schemas':
        schema_evidence(args.out, args.family)
    elif args.command == 'retained':
        retained_evidence(args.out)
    elif args.command == 'proof':
        guard_proof(args.out, args.reuse_archive, args.reuse_directory)
    else:
        copy_tree_evidence(args.out)
    assert source_manifest() == before, 'evidence_source_changed_during_run'


if __name__ == '__main__':
    main()
