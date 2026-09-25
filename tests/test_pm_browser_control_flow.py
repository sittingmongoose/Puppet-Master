"""Finite AST/compiler/consumer regressions; no browser or native authority runs."""
import copy
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from pm_browser_control_flow_semantics import (analyze_control_flow,
    browser_control_flow_semantic_failures, structural_errors, validate_compile_binding,
    validate_control_result_bytes, validate_program_dispatch)


class BrowserControlFlow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fixtures = json.loads((ROOT / 'Plans/browser_control_flow_contract_fixtures.json').read_text())
        cls.cases = {row['name']: row for row in cls.fixtures['valid']}

    def case(self, name='conditional_bounded_collection'):
        return copy.deepcopy(self.cases[name]['value'])

    def test_authored_pair(self):
        for case in self.fixtures['valid']:
            with self.subTest(case=case['name']):
                self.assertEqual([], structural_errors(case['definition'], case['value']))
                self.assertEqual([], browser_control_flow_semantic_failures(case['definition'], case['value']))
        for case in self.fixtures['invalid']:
            value = self.case(case['base_valid'])
            for dotted, replacement in case['patch'].items():
                keys = dotted.split('.')
                target = value
                for key in keys[:-1]:
                    target = target[int(key)] if isinstance(target, list) else target[key]
                key = int(keys[-1]) if isinstance(target, list) else keys[-1]
                target[key] = replacement
            with self.subTest(case=case['name']):
                errors = structural_errors(case['definition'], value)
                if 'semantic_rule' in case:
                    self.assertEqual([], errors)
                    self.assertIn(case['semantic_rule'], browser_control_flow_semantic_failures(case['definition'], value))
                else:
                    self.assertTrue(errors)

    def test_static_branch_max_and_loop_ceiling_are_conservative(self):
        program = self.case()['program']
        errors, bounds = analyze_control_flow(program['ast'], program['budgets'])
        self.assertEqual([], errors)
        self.assertEqual({'action_visits': 3, 'local_operator_visits': 1, 'checkpoint_visits': 1}, bounds)
        program['ast']['nodes'][1]['then_node_id'] = 'outer'
        program['ast']['nodes'].append(dict(node_id='outer', kind='bounded_while',
            source_span=program['ast']['nodes'][0]['source_span'], condition_ref='ready',
            max_iterations=4, body_node_id='loop'))
        program['budgets']['max_actions'] = 12
        errors, bounds = analyze_control_flow(program['ast'], program['budgets'])
        self.assertEqual([], errors)
        self.assertEqual(12, bounds['action_visits'])
        program['budgets']['max_actions'] = 11
        self.assertIn('browser_control_budget_exceeded', analyze_control_flow(program['ast'], program['budgets'])[0])

    def test_duplicate_switch_values_and_missing_default(self):
        value = self.case('typed_switch')
        node = value['program']['ast']['nodes'][1]
        node['cases'].append({'equals': 'scan', 'node_id': 'count'})
        # Remove duplicate default subtree first so this specifically checks cases.
        node['default_node_id'] = 'empty'
        value['program']['ast']['nodes'].append(dict(node_id='empty', kind='sequence',
            source_span=node['source_span'], children=[]))
        self.assertIn('browser_control_duplicate_switch_case', analyze_control_flow(
            value['program']['ast'], value['program']['budgets'])[0])
        node.pop('default_node_id')
        self.assertTrue(structural_errors('browser_program_v2', value['program']))

    def test_compiler_owner_production_mandatory_even_with_matching_hashes(self):
        value = self.case()
        args = (value['request'], value['result'], value['program'])
        with self.assertRaises(TypeError):
            validate_compile_binding(*args)
        self.assertIn('browser_control_compiler_production', validate_compile_binding(
            *args, verify_compiler_production=lambda *args: ['not_original_compiler_output']))
        self.assertIn('browser_control_compiler_production_invalid_response', validate_compile_binding(
            *args, verify_compiler_production=lambda *args: True))

    def test_declared_bounds_cannot_substitute_for_computed_tree(self):
        value = self.case()
        value['result']['static_bounds']['action_visits'] = 0
        self.assertIn('browser_control_compile_binding', browser_control_flow_semantic_failures('browser_compile_validation', value))

    def test_checkpoint_visits_do_not_prove_native_segment_budget(self):
        value = self.case()
        ast = value['program']['ast']
        ast['nodes'][0]['children'] = ['choice', 'checkpoint_loop']
        ast['nodes'].append(dict(node_id='checkpoint_loop', kind='bounded_while',
            source_span=ast['nodes'][0]['source_span'], condition_ref='ready',
            max_iterations=3, body_node_id='done'))
        value['program']['budgets']['max_segments'] = 1
        errors, bounds = analyze_control_flow(ast, value['program']['budgets'])
        self.assertEqual([], errors)
        self.assertEqual(3, bounds['checkpoint_visits'])
        value['request']['source']['ast'] = copy.deepcopy(ast)
        value['request']['budgets'] = copy.deepcopy(value['program']['budgets'])
        value['result']['ast'] = copy.deepcopy(ast)
        value['result']['static_bounds'] = bounds
        self.assertEqual([], browser_control_flow_semantic_failures('browser_compile_validation', value))
        self.assertEqual(['browser_control_compiler_production'], validate_compile_binding(
            value['request'], value['result'], value['program'],
            verify_compiler_production=lambda *args: ['actual_planner_segment_budget_exceeded']))

    def test_loop_iterator_is_readonly_without_banning_workspace_output(self):
        program = self.case()['program']
        nodes = {node['node_id']: node for node in program['ast']['nodes']}
        nodes['loop']['body_node_id'] = 'count'
        nodes['choice']['else_node_id'] = 'act'
        self.assertEqual([], analyze_control_flow(program['ast'], program['budgets'])[0])
        program['ast']['local_operators'][0]['output_name'] = 'item'
        self.assertEqual([], structural_errors('browser_program_v2', program))
        self.assertIn('browser_control_iterator_readonly', analyze_control_flow(program['ast'], program['budgets'])[0])

    def test_dispatch_preserves_complete_original_lineage(self):
        for key in ('run_id', 'attempt_id', 'plan_id', 'goal_id', 'thread_id'):
            value = self.case('existing_command_resolves_v2_program')
            if key not in value['request']['scope']['lineage']:
                continue
            value['request']['scope']['lineage'][key] = 'unrelated:identity'
            with self.subTest(key=key):
                self.assertEqual([], structural_errors('browser_dispatch_validation', value))
                self.assertIn('browser_control_dispatch_lineage',
                    browser_control_flow_semantic_failures('browser_dispatch_validation', value))

    def result_args(self, value):
        return dict(program=value['program'], resolved_schema_ref=value['resolved_schema_ref'],
            result_schema_utf8=value['result_schema_utf8'].encode(),
            result_schema_resources={k: v.encode() for k, v in value['result_schema_resources'].items()},
            terminal_subject=value['terminal_subject'], terminal_workspace_revision=value['terminal_workspace_revision'])

    def test_existing_result_actual_byte_budget_not_reserialized(self):
        value = self.case('v2_program_existing_pinned_result_bytes')
        raw = value['result_utf8'].encode()
        value['program']['budgets']['max_output_bytes'] = len(raw)
        self.assertEqual([], validate_control_result_bytes(raw, **self.result_args(value)))
        self.assertIn('browser_result_output_budget_exceeded', validate_control_result_bytes(
            raw + b' ', **self.result_args(value)))

    def test_existing_result_offline_schema_and_subject_binding_retained(self):
        value = self.case('v2_program_existing_pinned_result_bytes')
        value['result_schema_utf8'] += ' '
        self.assertIn('browser_result_schema_hash_mismatch', browser_control_flow_semantic_failures('browser_result_validation', value))
        value = self.case('v2_program_existing_pinned_result_bytes')
        value['terminal_subject']['browser_page_id'] = 'page:other'
        self.assertIn('browser_result_terminal_subject_mismatch', browser_control_flow_semantic_failures('browser_result_validation', value))
        value = self.case('v2_program_existing_pinned_result_bytes')
        value['result_schema_resources']['schema:undeclared'] = '{}'
        self.assertIn('browser_result_schema_dependency_set_mismatch', browser_control_flow_semantic_failures('browser_result_validation', value))

    def test_actual_command_consumer_cannot_accept_missing_or_foreign_owner(self):
        value = self.case('existing_command_resolves_v2_program')
        args = dict(resolve_program=lambda _: value['program'],
            resolve_current_context=lambda *args: (value['current_subject'], value['current_workspace_revision']),
            verify_current_admission=lambda *args: ['current_permission_revoked'])
        self.assertIn('browser_control_dispatch_admission', validate_program_dispatch(value['request'], **args))
        def missing(*args):
            raise KeyError('original program disposed')
        args['resolve_program'] = missing
        self.assertIn('browser_control_owner_unavailable', validate_program_dispatch(value['request'], **args))

    def test_legacy_current_program_remains_in_discriminated_union(self):
        fixtures = json.loads((ROOT / 'Plans/section15_browser_program_contract_fixtures.json').read_text())
        original = next(v['value'] for v in fixtures['valid'] if v['name'] == 'typed_program_targets_only_ordinary_session')
        self.assertEqual([], structural_errors('browser_current_program', original))
        wrong = self.case()['program']
        wrong['schema_id'] = original['schema_id']
        self.assertTrue(structural_errors('browser_current_program', wrong))


if __name__ == '__main__':
    unittest.main()
