"""Finite Browser AST2 proofs and existing complete-result binding composition.

No parser, browser interpreter, native admission or writer is installed here.
Compiler/source and dispatch custody callbacks are mandatory at native joins;
the fixture adapter below supplies explicit test doubles only.
"""
from copy import deepcopy
from functools import lru_cache
import json
from pathlib import Path

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

from pm_browser_program_semantics import validate_browser_program_result_bytes


@lru_cache(maxsize=1)
def _schemas():
    root = Path(__file__).resolve().parents[1] / 'Plans'
    old = json.loads((root / 'section15_browser_program_contracts.schema.json').read_text())
    new = json.loads((root / 'browser_control_flow_contracts.schema.json').read_text())
    registry = Registry().with_resources((s['$id'], Resource.from_contents(s)) for s in (old, new))
    return old, new, registry


def structural_errors(definition, value):
    old, new, registry = _schemas()
    selected = new if definition in new['$defs'] else old
    try:
        return [e.message for e in Draft202012Validator(
            {'$schema': selected['$schema'], '$ref': selected['$id'] + '#/$defs/' + definition},
            registry=registry).iter_errors(value)]
    except (RecursionError, ValueError, TypeError):
        return ['browser_control_invalid_shape']


def analyze_control_flow(ast, budgets):
    """Iterative closed-tree analysis; no predicate evaluation or browser effects."""
    if structural_errors('browser_program_ast_v2', ast) or structural_errors('budgets', budgets):
        return ['browser_control_shape'], None
    errors = []
    nodes = {n['node_id']: n for n in ast['nodes']}
    bindings = {b['name']: b for b in ast['bindings']}
    if len(nodes) != len(ast['nodes']) or len(bindings) != len(ast['bindings']):
        return ['browser_control_duplicate_identity'], None
    inventories = {
        'action': [a['action_id'] for a in ast['actions']],
        'local_operator': [o['operator_id'] for o in ast['local_operators']],
        'checkpoint': ast['checkpoints']}
    if any(len(v) != len(set(v)) for v in inventories.values()):
        return ['browser_control_duplicate_leaf'], None
    operators = {o['operator_id']: o for o in ast['local_operators']}
    iterator_names = {n['item_name'] for n in ast['nodes'] if n['kind'] == 'bounded_for_each'}
    leaves = {k: [] for k in inventories}
    env = {name: value['value_kind'] for name, value in bindings.items()}
    visited, costs = set(), {}
    stack = [(ast['root_node_id'], env, False)]
    while stack:
        node_id, scope, post = stack.pop()
        if node_id not in nodes:
            return errors + ['browser_control_dangling_node'], None
        node = nodes[node_id]
        kind = node['kind']
        if post:
            children = _children(node)
            if kind == 'sequence':
                cost = tuple(sum(costs[c][i] for c in children) for i in range(3))
            elif kind in ('if', 'switch'):
                cost = tuple(max(costs[c][i] for c in children) for i in range(3))
            else:
                cost = tuple(v * node['max_iterations'] for v in costs[node['body_node_id']])
            # An already excessive subtree cannot be made safe by an enclosing
            # branch. Stop before pathological multiplication grows indefinitely.
            if cost[0] > budgets['max_actions']:
                errors.append('browser_control_budget_exceeded')
                return sorted(set(errors)), None
            if any(value.bit_length() > 4096 for value in cost):
                return errors + ['browser_control_bound_unrepresentable'], None
            costs[node_id] = cost
            continue
        if node_id in visited:
            return errors + ['browser_control_cycle_or_shared_subtree'], None
        visited.add(node_id)
        span = node['source_span']
        if span['end_byte'] < span['start_byte'] or (span['end_line'], span['end_column']) < (span['start_line'], span['start_column']):
            errors.append('browser_control_source_span')
        if kind in inventories:
            key = {'action': 'action_id', 'local_operator': 'operator_id', 'checkpoint': 'checkpoint_id'}[kind]
            identity = node[key]
            leaves[kind].append(identity)
            if identity not in inventories[kind]:
                errors.append('browser_control_unknown_leaf')
            if kind == 'local_operator' and identity in operators:
                if operators[identity]['output_name'] in scope.keys() - bindings.keys():
                    errors.append('browser_control_iterator_readonly')
                for input_ref in operators[identity]['input_refs']:
                    if input_ref in iterator_names and input_ref not in scope:
                        errors.append('browser_control_iterator_escape')
            costs[node_id] = {'action': (1, 0, 0), 'local_operator': (0, 1, 0), 'checkpoint': (0, 0, 1)}[kind]
            continue
        if kind in ('if', 'bounded_while') and scope.get(node['condition_ref']) != 'boolean':
            errors.append('browser_control_condition_type')
        if kind == 'switch':
            if scope.get(node['value_ref']) != 'string':
                errors.append('browser_control_switch_type')
            labels = [case['equals'] for case in node['cases']]
            if len(labels) != len(set(labels)):
                errors.append('browser_control_duplicate_switch_case')
        child_scope = scope
        if kind == 'bounded_for_each':
            binding = bindings.get(node['collection_ref'])
            if binding is None or binding['value_kind'] != 'collection':
                errors.append('browser_control_collection_type')
            else:
                if binding['collection_max_items'] > node['max_iterations']:
                    errors.append('browser_control_collection_exceeds_iteration_limit')
                if node['item_name'] in scope:
                    errors.append('browser_control_iterator_shadow')
                child_scope = {**scope, node['item_name']: binding['item_kind']}
        stack.append((node_id, scope, True))
        stack.extend((child, child_scope, False) for child in reversed(_children(node)))
    if visited != set(nodes):
        errors.append('browser_control_unreachable_node')
    for kind, expected in inventories.items():
        if len(leaves[kind]) != len(set(leaves[kind])) or set(leaves[kind]) != set(expected):
            errors.append('browser_control_leaf_placement')
    cost = costs[ast['root_node_id']]
    if cost[0] > budgets['max_actions']:
        errors.append('browser_control_budget_exceeded')
    return sorted(set(errors)), dict(zip(('action_visits', 'local_operator_visits', 'checkpoint_visits'), cost))


def _children(node):
    kind = node['kind']
    if kind == 'sequence':
        return node['children']
    if kind == 'if':
        return [node['then_node_id'], node['else_node_id']]
    if kind == 'switch':
        return [c['node_id'] for c in node['cases']] + [node['default_node_id']]
    if kind in ('bounded_for_each', 'bounded_while'):
        return [node['body_node_id']]
    return []


def _proof(callback, code, *args):
    try:
        result = callback(*args)
    except (KeyError, ValueError, TypeError, OSError):
        return [code + '_unavailable']
    if not isinstance(result, list) or any(not isinstance(x, str) or not x for x in result):
        return [code + '_invalid_response']
    return [code] if result else []


def validate_compile_binding(request, result, program, *, verify_compiler_production):
    """Authenticate original compiler production via mandatory real-owner callback.

    Callback must resolve actual source bytes, compiler/API/capability identity,
    deterministic lowering/hash production and complete no-effect preflight,
    including extracted effects/capabilities, ordinary target/permissions and
    actual native planner admission against max_segments. Checkpoint visits are
    informational finite bounds, not segment counts or segment-budget proof.
    This pure function checks supplied typed relations, not native issuance.
    """
    if any(structural_errors(d, v) for d, v in (
            ('browser_compile_request_v2', request), ('browser_compile_result_v2', result),
            ('browser_program_v2', program))):
        return ['browser_control_compile_shape']
    errors, bounds = analyze_control_flow(program['ast'], program['budgets'])
    comparisons = [(request['compile_request_id'], result['compile_request_id']),
        (request['lineage'], program['lineage']), (request['budgets'], program['budgets']),
        (request['compiler'], program['compiler']), (result['program_id'], program['program_id']),
        (result['ast'], program['ast']), (result['static_bounds'], bounds),
        (request['source']['source_hash'], result['source_hash']),
        (result['source_hash'], program['source_hash']),
        (result['ast_hash'], program['ast']['ast_hash']),
        (program['source_form'], request['source']['source_language'])]
    for key in ('compiler_hash', 'browser_program_api_digest', 'capability_profile_hash'):
        comparisons.append((request['compiler'][key], result[key]))
    if 'expected_ast_hash' in request:
        comparisons.append((request['expected_ast_hash'], result['ast_hash']))
    if request['source']['source_language'] == 'validated_ast':
        comparisons.append((request['source']['ast'], program['ast']))
    if any(a != b for a, b in comparisons):
        errors.append('browser_control_compile_binding')
    errors += _proof(verify_compiler_production, 'browser_control_compiler_production', request, result, program)
    return sorted(set(errors))


@lru_cache(maxsize=1)
def result_composition_schema():
    """Pinned local schema composition, no v1 record relabel or remote retrieval.

    The existing byte validator accepts an explicit owner schema. Inline only
    references to this repository's exact predecessor definitions, retaining all
    old result/subject/schema-pinning rules and replacing only producing program.
    """
    old, new, _ = _schemas()
    def expand(value):
        if isinstance(value, list):
            return [expand(v) for v in value]
        if not isinstance(value, dict):
            return value
        reference = value.get('$ref', '')
        if reference.startswith(old['$id'] + '#/'):
            target = old
            for part in reference.split('#/', 1)[1].split('/'):
                target = target[part.replace('~1', '/').replace('~0', '~')]
            return expand(deepcopy(target))
        return {k: expand(v) for k, v in value.items()}
    composed = deepcopy(old)
    composed['$defs'].update(expand(new['$defs']))
    composed['$defs']['browser_program'] = composed['$defs']['browser_program_v2']
    return composed


def validate_control_result_bytes(result_utf8, *, program, **context):
    if structural_errors('browser_program_v2', program):
        return ['browser_control_producing_program_invalid']
    errors, _ = analyze_control_flow(program['ast'], program['budgets'])
    if errors:
        return errors
    return validate_browser_program_result_bytes(result_utf8, program=program,
        owner_schema=result_composition_schema(), **context)


def validate_program_dispatch(request, *, resolve_program, resolve_current_context,
        verify_current_admission):
    """Existing command owner resolves program and current context, never caller facts.

    resolve_program(scope) resolves exact selected identity/reference. The current
    context resolver(program, scope) returns the genuine ordinary subject and
    ProgramWorkspace revision. Admission callback verifies original program/
    compiler custody, permissions, controller, capabilities and phase fences,
    including actual planner segment-budget admission, reconciled resume cursor/
    remaining loop counters and idempotency. Static checkpoint counts do not
    prove a segment budget.
    No callback can change the original producing program or synthesize context.
    """
    if structural_errors('browser_command_request', request):
        return ['browser_control_command_shape']
    scope = request['scope']
    if scope['command_id'] not in ('cmd.browser.program.run', 'cmd.browser.program.resume',
            'cmd.browser.program.pause', 'cmd.browser.program.cancel', 'cmd.browser.program.inspect'):
        return ['browser_control_wrong_command']
    try:
        program = resolve_program(scope)
        subject, revision = resolve_current_context(program, scope)
    except (KeyError, ValueError, TypeError, OSError):
        return ['browser_control_owner_unavailable']
    if structural_errors('browser_current_program', program) or structural_errors('ordinary_browser_subject', subject):
        return ['browser_control_owner_shape']
    errors = []
    if program['schema_id'] == 'pm.browser_program.program.v2':
        errors += analyze_control_flow(program['ast'], program['budgets'])[0]
    if scope['browser_program_id'] != program['program_id']:
        errors.append('browser_control_dispatch_program')
    if scope.get('program_workspace_id', program['program_workspace_id']) != program['program_workspace_id']:
        errors.append('browser_control_dispatch_workspace')
    if scope['lineage'] != program['lineage']:
        errors.append('browser_control_dispatch_lineage')
    for key, initial in program['subject'].items():
        if key == 'page_generation':
            if subject[key] < initial:
                errors.append('browser_control_dispatch_generation')
        elif subject[key] != initial:
            errors.append('browser_control_dispatch_subject')
        if key in scope and scope[key] != subject[key]:
            errors.append('browser_control_dispatch_current_subject')
    if type(revision) is not int or revision < program['expected_workspace_revision']:
        errors.append('browser_control_dispatch_current_revision')
    if 'expected_program_workspace_revision' in scope and scope['expected_program_workspace_revision'] != revision:
        errors.append('browser_control_dispatch_current_revision')
    errors += _proof(verify_current_admission, 'browser_control_dispatch_admission', request, program, subject, revision)
    return sorted(set(errors))


def browser_control_flow_semantic_failures(definition, value):
    """Static fixture entry; never authenticates compiler or browser owners."""
    if definition == 'browser_program_v2':
        return analyze_control_flow(value['ast'], value['budgets'])[0]
    if definition == 'browser_compile_validation':
        return validate_compile_binding(value['request'], value['result'], value['program'],
            verify_compiler_production=lambda *args: [])
    if definition == 'browser_dispatch_validation':
        return validate_program_dispatch(value['request'], resolve_program=lambda scope: value['program'],
            resolve_current_context=lambda *args: (value['current_subject'], value['current_workspace_revision']),
            verify_current_admission=lambda *args: [])
    if definition == 'browser_result_validation':
        try:
            return validate_control_result_bytes(value['result_utf8'].encode('utf-8'),
                program=value['program'], resolved_schema_ref=value['resolved_schema_ref'],
                result_schema_utf8=value['result_schema_utf8'].encode('utf-8'),
                result_schema_resources={k: v.encode('utf-8') for k, v in value['result_schema_resources'].items()},
                terminal_subject=value['terminal_subject'], terminal_workspace_revision=value['terminal_workspace_revision'])
        except (KeyError, ValueError, TypeError, UnicodeError):
            return ['browser_control_result_input_invalid']
    return []
