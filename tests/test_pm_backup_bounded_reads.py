"""Installed static contract tests; synthetic dependencies are not native proof."""
from copy import deepcopy
import importlib.util
import json
import os
from pathlib import Path
import sys
import unittest

ROOT = Path(os.environ.get('PM_CANON_ROOT', Path(__file__).resolve().parents[1]))
CANON_ROOT = ROOT
sys.path.insert(0, str(ROOT / 'scripts'))
from pm_backup_bounded_reads import structural_failures, bounded_read_semantic_failures, validate_read_result


class BoundedReads(unittest.TestCase):
    def setUp(self):
        self.fixtures = json.loads((ROOT/'Plans/backup_bounded_read_fixtures.json').read_text())
        self.case = deepcopy(self.fixtures['valid'][0]['value'])

    def check(self, **overrides):
        c = self.case
        def reader(kind, ref):
            return c['request'] if kind == 'request' and ref == c['request']['request_ref'] else c['records'][kind][ref]
        args = dict(resolve_record=reader,verify_original_admission=lambda *_: [],
                    verify_page_source=lambda *_: [],verify_source_custody=lambda *_: [],
                    check_current_disclosure=lambda *_: [],canon_root=CANON_ROOT)
        args.update(overrides)
        return validate_read_result(c['request']['request_ref'],c['result'],**args)

    def sync_receipt(self):
        c=self.case;p=c['records']['page'][c['result']['page_ref']];r=c['records']['read_receipt'][c['result']['receipt_ref']]
        r.update(outcome=p['status'],failure_ref=p['failure_ref'],error=None if p['failure_ref'] is None else {'code':'internal_error','reason':'Actual read unavailable','offending_field':None})

    def test_pair(self):
        for entry in self.fixtures['valid']+self.fixtures['invalid']:
            with self.subTest(name=entry['name']):
                self.assertEqual(structural_failures(entry['definition'],entry['value'],canon_root=CANON_ROOT),[])
                actual = bounded_read_semantic_failures(entry['definition'],entry['value'],canon_root=CANON_ROOT)
                if 'semantic_rule' in entry: self.assertIn(entry['semantic_rule'],actual)
                else: self.assertEqual(actual,[])

    def test_actual_gate_shape_protocol(self):
        spec=importlib.util.spec_from_file_location('bounded_gate',CANON_ROOT/'scripts/pm-new-contracts-verify.py')
        gate=importlib.util.module_from_spec(spec);sys.modules[spec.name]=gate;spec.loader.exec_module(gate)
        schema=json.loads((ROOT/'Plans/backup_bounded_read_contracts.schema.json').read_text())
        self.assertEqual(self.fixtures['contract_schema_id'],schema.get('x-schema-id'))
        from referencing import Resource
        registry=gate.offline_schema_registry().with_resource(schema['$id'],Resource.from_contents(schema))
        for entry in self.fixtures['valid']+self.fixtures['invalid']:
            definition,selected=gate.select_definition(schema,entry,entry['value'],require_valid='semantic_rule' not in entry)
            self.assertEqual(list(gate.validator_for(schema,selected,registry).iter_errors(entry['value'])),[])
            self.assertEqual(entry['value']['schema_version'],'1.0.0')

    def test_absent_original_and_prior(self):
        self.assertTrue(self.check(resolve_record=lambda *_: None))
        self.case=deepcopy(self.fixtures['valid'][1]['value']);del self.case['records']['page']['page:discover']
        self.assertTrue(self.check())

    def test_native_source_refusal_and_final_disclosure(self):
        self.assertIn('read_page_source:not_actual_listing',self.check(verify_page_source=lambda *_:['not_actual_listing']))
        calls=[]
        def disclose(*args): calls.append(args);return ['revoked']
        self.assertIn('read_final_disclosure:revoked',self.check(check_current_disclosure=disclose));self.assertTrue(calls)

    def test_callbacks_not_booleans(self):
        for key in ('verify_original_admission','verify_page_source','check_current_disclosure'):
            with self.subTest(key=key):self.assertTrue(any('invalid_response' in e for e in self.check(**{key:lambda *_:True})))
        self.assertEqual(self.check(verify_source_custody=None),['read_dependencies_missing'])

    def test_late_resolver_original_mutation(self):
        def mutate(*_):self.case['request']['actor_ref']='actor:foreign';return []
        self.assertIn('read_inputs_mutated',self.check(verify_page_source=mutate))

    def test_late_result_mutation(self):
        def mutate(*_):self.case['result']['return_route_ref']='route:foreign';return []
        self.assertIn('read_inputs_mutated',self.check(check_current_disclosure=mutate))

    def test_callback_copy_mutation(self):
        def mutate(request,*_):request['actor_ref']='actor:foreign';return []
        self.assertIn('read_admission_inputs_mutated',self.check(verify_original_admission=mutate))

    def test_unavailable_is_not_empty_success(self):
        p=self.case['records']['page']['page:discover'];p.update(status='unavailable',entries=[],next_cursor=None,failure_ref='failure:missing')
        self.case['result']['outcome']='unavailable';self.sync_receipt();self.assertEqual(self.check(),[])
        p['exhausted']=True;self.assertIn('read_failure_truth',self.check())

    def test_browse_unresolved_not_success(self):
        self.case=deepcopy(self.fixtures['valid'][2]['value']);p=self.case['records']['page']['page:browse']
        p['resolution'].update(disposition='unresolved',resolved_source=None,failure_reason='missing')
        self.assertIn('browse_unresolved_success',self.check())
        p.update(status='unavailable',entries=[],next_cursor=None,failure_ref='failure:missing');self.case['result']['outcome']='unavailable';self.sync_receipt()
        self.assertEqual(self.check(),[])

    def test_browse_path_and_source_scope(self):
        self.case=deepcopy(self.fixtures['valid'][2]['value']);p=self.case['records']['page']['page:browse']
        self.case['request']['selected_input']['relative_path']='other';p['original_request']=deepcopy(self.case['request'])
        self.assertIn('browse_path_scope',self.check())
        p['entries'][0]['relative_path']='../escape';self.assertIn('read_page_schema',self.check())

    def test_cursor_no_progress_and_original_substitution(self):
        self.case=deepcopy(self.fixtures['valid'][1]['value']);p=self.case['records']['page']['page:discover:next']
        p['next_cursor']=p['requested_cursor'];p['exhausted']=False;self.assertIn('read_cursor_no_progress',self.check())
        self.case['request']['selected_input']['approved_prefix']='foreign';self.assertIn('read_page_original',self.check())

    def test_native_snapshot_custody_required(self):
        self.case=deepcopy(self.fixtures['valid'][2]['value'])
        self.assertTrue(any('read_source:unverified_commit' in e for e in self.check(verify_source_custody=lambda *_:['unverified_commit'])))

    def test_bad_shapes_fail_closed(self):
        del self.case['request']['selected_input']['approved_prefix']
        self.assertIn('read_request_result_schema',self.check())

    def response_case(self,name='browse_response'):
        return deepcopy(next(e['value'] for e in self.fixtures['valid'] if e['name']==name))

    def response_check(self,value,**overrides):
        import pm_ui_command_response as ui
        from pm_backup_read_response import fixture_dependencies
        args=fixture_dependencies(value,ui);args.update(overrides)
        return ui.response_bundle_failures(value['bundle'],**args)

    def test_actual_receipt_cannot_be_replaced_by_page(self):
        x=self.response_case();r=x['bundle']['owner_result'];x['records'][r['receipt_ref']]=x['records'][r['page_ref']]
        self.assertTrue(self.response_check(x))

    def test_receipt_identity_and_currentness(self):
        for key,value in [('currentness_ref','currentness:foreign'),('page_ref','page:foreign')]:
            x=self.response_case();x['records'][x['bundle']['owner_result']['receipt_ref']][key]=value
            self.assertIn('read_receipt_'+key,self.response_check(x))

    def test_caller_value_positive_and_null_substitution(self):
        x=self.response_case();b=x['bundle'];o=x['records'][b['original_binding_ref']]
        caller={'surface_id':'settings','route_ref':b['owner_request']['return_route_ref'],'focus_id':'focus:backup','invocation_token':'invoke:backup','caller_context_ref':'caller:backup','expected_caller_revision':1,'continuation_generation':1}
        o['return_context']=deepcopy(caller);b['delivery_return_context']=deepcopy(caller)
        self.assertEqual(self.response_check(x),[])
        b['delivery_return_context']=None;self.assertIn('backup_read_delivery_original',self.response_check(x))

    def test_current_admission_and_disclosure_required(self):
        x=self.response_case()
        self.assertIn('backup_read_response_dependencies_missing',self.response_check(x,backup_page_source=None))
        self.assertIn('read_page_source:wrong_owner',self.response_check(x,backup_page_source=lambda *_:['wrong_owner']))
        self.assertIn('backup_read_final_disclosure:revoked',self.response_check(x,backup_current_disclosure=lambda *_:['revoked']))

    def test_original_and_receipt_mutations_fail_closed(self):
        for target in ('original','receipt'):
            x=self.response_case();records=x['records'];b=x['bundle']
            def mutate(*_):
                if target=='original': records[b['original_binding_ref']]['actor_ref']='actor:foreign'
                else: records[b['owner_result']['receipt_ref']]['currentness_ref']='currentness:foreign'
                return []
            self.assertTrue(any('mutated' in e for e in self.response_check(x,resolve_owner_record=lambda ref:records[ref],backup_current_disclosure=mutate)))

    def test_native_digest_callback_contract(self):
        x=self.response_case()
        self.assertIn('backup_read_digest_contract',self.response_check(x,canonical_request_digest=lambda _:True))
        def mutate(value):value['actor_ref']='actor:foreign';return 'a'*64
        self.assertIn('backup_read_digest_mutation',self.response_check(x,canonical_request_digest=mutate))

    def test_no_async_or_noop_claim(self):
        x=self.response_case();x['bundle']['response']['result_status']='no_op'
        self.assertIn('backup_read_response_outcome',self.response_check(x))
        x=self.response_case();x['bundle']['outcome']['outcome']='accepted';x['bundle']['outcome']['result_receipt_ref']=None;x['bundle']['response'].update(result_status='pending',receipt_ref=None)
        self.assertIn('backup_read_response_outcome',self.response_check(x))

    def test_wrong_public_family_and_local_escape(self):
        x=self.response_case();x['bundle']['response']['owner_result_schema_ref']=None
        self.assertTrue(self.response_check(x))
        x=self.response_case();x['bundle']['response']['response_kind']='local_projection'
        self.assertTrue(self.response_check(x))

    def test_all_historical_central_response_examples(self):
        import pm_ui_command_response as ui
        old=json.loads((CANON_ROOT/'Plans/ui_command_response_fixtures.json').read_text())
        for entry in old['valid']:
            with self.subTest(case=entry['case_id']):self.assertEqual(ui.response_bundle_failures(entry),[])

    def test_actual_registered_semantic_dispatch(self):
        import pm_ui_command_response as ui
        for entry in self.fixtures['valid']+self.fixtures['invalid']:
            actual=ui.contracts().contract_semantic_failures('Plans/backup_bounded_read_contracts.schema.json',entry['definition'],entry['value'])
            if 'semantic_rule' in entry:self.assertIn(entry['semantic_rule'],actual)
            else:self.assertEqual(actual,[])

    def test_receipt_precedes_response_and_independent_generations(self):
        x=self.response_case();self.assertEqual(self.response_check(x),[])
        self.assertNotEqual(x['bundle']['outcome']['target_generation'],x['bundle']['owner_request']['selected_input']['expected_destination_generation'])
        x['bundle']['response']['ts']='2026-09-24T00:00:00Z'
        self.assertIn('backup_read_response_before_receipt',self.response_check(x))


if __name__ == '__main__': unittest.main()
