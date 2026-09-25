"""Installed-only static owner joins; synthetic records do not prove native authority."""
from copy import deepcopy as cp
import importlib.util
import json
import os
from pathlib import Path
import sys
import unittest
ROOT=Path(os.environ.get('PM_CANON_ROOT',Path(__file__).resolve().parents[1]))
sys.path.insert(0,str(ROOT/'scripts'))
import pm_jj_publication_selected as m
from referencing import Resource

class Publication(unittest.TestCase):
    def setUp(self):
        self.fixture=json.loads((m.ROOT/'Plans/jj_publication_selected_fixtures.json').read_text())
        self.v=cp(self.fixture['valid'][0]['value'])
    def check(self):return m.publication_failures(self.v['request'],self.v['result'],**m.fixture_dependencies(self.v))
    def rec(self,kind):
        return next(v for v in self.v['records'].values() if v.get('schema_id','').endswith(kind))
    def test_full_positive_and_negative_pipeline(self):
        spec=importlib.util.spec_from_file_location('publication_gate',ROOT/'scripts/pm-new-contracts-verify.py');gate=importlib.util.module_from_spec(spec);sys.modules[spec.name]=gate;spec.loader.exec_module(gate)
        schema=json.loads((m.ROOT/'Plans/jj_publication_selected.schema.json').read_text())
        registry=gate.offline_schema_registry().with_resource(schema['$id'],Resource.from_contents(schema))
        self.assertEqual(self.fixture['schema_version'],'1.0.0')
        for group in ('valid','invalid'):
            for case in self.fixture[group]:
                name,selected=gate.select_definition(schema,case,case['value'],require_valid=group=='valid')
                self.assertFalse(list(gate.validator_for(schema,selected,registry).iter_errors(case['value'])))
                failures=m.publication_semantic_failures(name,case['value'])
                if group=='valid':self.assertEqual(failures,[],case['name'])
                else:self.assertIn(case['semantic_rule'],failures)
    def test_independent_generations(self):
        self.assertEqual(self.check(),[])
        self.assertNotEqual(self.v['request']['target_selection_generation'],self.v['request']['authority']['currentness']['catalog_generation'])
    def test_original_resolves_exactly(self):
        self.v['records']['request:original']['bookmarks'][0]['commit_id']='different'
        self.assertIn('publication_original_request',self.check())
    def test_missing_owner_fails_closed(self):
        del self.v['records']['qualification:original'];self.assertTrue(self.check())
    def test_wrong_native_host(self):
        self.rec('native_toolchain_identity.v1')['execution_host_id']='other:host'
        self.assertIn('publication_native_execution_host_id',self.check())
    def test_selected_mapping_not_inferred_from_same_commit(self):
        self.rec('remote_publication_preview.v1')['mappings'][0]['git_object_id']='other:object'
        self.assertIn('publication_qualified_mappings',self.check())
    def test_no_partial_success_overall(self):
        self.v=cp(self.fixture['valid'][1]['value']);r=self.v['result']['owner_result'];r['outcome']='succeeded';r['error']=None;self.v['records'][r['receipt_ref']]['outcome']='succeeded'
        self.assertIn('publication_fanout_not_all_success',self.check())
    def test_unknown_is_not_failure(self):
        self.v=cp(self.fixture['valid'][2]['value']);r=self.v['result']['owner_result'];r['outcome']='failed';self.v['records'][r['receipt_ref']]['outcome']='failed'
        self.assertIn('publication_unknown_overall',self.check())
    def test_foreign_precondition(self):
        self.rec('external_effect_reconciliation.v1')['precondition_refs']=['opaque:other']
        self.assertIn('publication_actual_preconditions',self.check())
    def test_observed_head_required_for_success(self):
        self.rec('remote_publication_observation.v1')['observed_heads']=[]
        self.assertIn('publication_success_heads',self.check())
    def test_remote_target_idempotency(self):
        r=self.rec('external_effect_reconciliation.v1');r['provider_idempotency_supported']=True;r['idempotency_key']='other'
        self.assertIn('publication_target_idempotency',self.check())
    def test_stale_capability_not_effect_admission(self):
        self.rec('effective_operation_capability.v1')['freshness']['state']='stale'
        self.assertTrue(self.check())
    def test_receipt_event_join(self):
        self.rec('operation_receipt.v1')['event_refs']=['other:event']
        self.assertIn('publication_receipt_event_refs',self.check())
    def test_resolved_receipt_identity(self):
        self.rec('operation_receipt.v1')['receipt_id']='foreign'
        self.assertIn('publication_receipt_identity',self.check())
    def test_resolved_writer_lease_identity(self):
        self.rec('writer_lease.v1')['lease_id']='foreign'
        self.assertIn('publication_writer_lease_identity',self.check())
    def test_resolved_credential_lease_identity(self):
        self.rec('credential_lease.v1')['credential_lease_id']='foreign'
        self.assertIn('publication_credential_lease_identity',self.check())
    def test_duplicate_target(self):
        self.v['result']['target_results'].append(cp(self.v['result']['target_results'][0]));self.assertTrue(self.check())
    def test_accepted_requires_actual_original_work(self):
        self.v=cp(self.fixture['valid'][3]['value']);self.assertEqual(self.check(),[])
        self.v['records'][self.v['result']['owner_result']['observable_work_id']]['identity']['command_instance_id']='other:command'
        self.assertIn('publication_accepted_work_origin',self.check())
    def test_resolver_mutation_is_not_original_custody(self):
        records=cp(self.v['records'])
        def reader(ref):
            if ref.startswith('receipt:'):self.v['request']['bookmarks'][0]['commit_id']='late:mutation'
            return records[ref]
        failures=m.publication_failures(self.v['request'],self.v['result'],resolve_record=reader)
        self.assertIn('publication_inputs_mutated',failures)
    def test_separate_resolved_original_late_mutation(self):
        records=cp(self.v['records'])
        def reader(ref):
            if ref.startswith('receipt:'):records['request:original']['bookmarks'][0]['commit_id']='late:mutation'
            return records[ref]
        failures=m.publication_failures(self.v['request'],self.v['result'],resolve_record=reader)
        self.assertIn('publication_owner_record_mutated',failures)
    def test_separate_resolved_preview_late_mutation(self):
        records=cp(self.v['records'])
        def reader(ref):
            if ref=='observation:remote-target:upstream':records['preview:push:origin']['push_url']='https://other.invalid/repo'
            return records[ref]
        failures=m.publication_failures(self.v['request'],self.v['result'],resolve_record=reader)
        self.assertIn('publication_owner_record_mutated',failures)

if __name__=='__main__':unittest.main()
