"""Installed contract tests; fixture authority is explicitly synthetic."""
from copy import deepcopy
import importlib.util
import json
import os
from pathlib import Path
import sys
import unittest

ROOT=Path(__file__).resolve().parents[1]
CANON=Path(os.environ.get('PM_CANON_ROOT',ROOT))
sys.path.insert(0,str(ROOT/'scripts'))
import pm_forge_log_selection_semantics as m
import pm_ui_command_response as ui
from referencing import Resource

class T(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fixtures=json.loads((ROOT/'Plans/forge_log_selection_contract_fixtures.json').read_text())
        cls.schema=json.loads((ROOT/m.SCHEMA).read_text())
        spec=importlib.util.spec_from_file_location('log_central',CANON/'scripts/pm-new-contracts-verify.py')
        cls.central=importlib.util.module_from_spec(spec);spec.loader.exec_module(cls.central)
        cls.registry=cls.central.offline_schema_registry().with_resource(cls.schema['$id'],Resource.from_contents(cls.schema))
    def value(self,name='selected_job_initial'):
        return deepcopy(next(r['value'] for r in self.fixtures['valid'] if r['name']==name))
    def check(self,v,**overrides):
        deps=m.fixture_dependencies(v);deps.update(overrides)
        return m.validate_log_result(v['request'],v['result'],v['original_binding_ref'],v['outcome_ref'],v['response_ref'],v['delivery_return_context'],**deps)
    def test_real_central_fixture_protocol(self):
        for good,key in ((True,'valid'),(False,'invalid')):
            for case in self.fixtures[key]:
                with self.subTest(case=case['name']):
                    definition,selected=self.central.select_definition(self.schema,case,case['value'],require_valid=good)
                    structural=list(self.central.validator_for(self.schema,selected,self.registry).iter_errors(case['value']))
                    self.assertEqual([],structural)
                    failures=m.log_selection_semantic_failures(definition,case['value'])
                    if good:self.assertEqual([],failures)
                    else:self.assertIn(case['semantic_rule'],failures)
    def test_exact_materialized_predecessor_diff(self):
        old=json.loads((CANON/'Plans/forge_integration_contracts.schema.json').read_text())
        def absolute(v):
            if isinstance(v,dict):return {k:(old['$id']+x if k=='$ref' and x.startswith('#/') else absolute(x)) for k,x in v.items()}
            if isinstance(v,list):return [absolute(x) for x in v]
            return v
        expected=absolute(deepcopy(old['$defs']['command_request']))
        expected['properties']['schema_id']={'const':'pm.forge.log_selection.authority.v1'}
        expected['properties']['command_id']={'const':m.COMMAND}
        expected['allOf'][13]['then']['properties']['target']['properties']={'target_kind':{'enum':['pipeline','pipeline_job']},'pipeline_id':{'$ref':old['$id']+'#/$defs/non_empty_string'}}
        self.assertEqual(expected,self.schema['$defs']['log_authority'])
    def test_historical_job_only_shape_unchanged(self):
        for name in ('whole_run','stage'):
            a=self.value(name)['request']['authority'];a['schema_id']='pm.forge.command_request.v1'
            self.assertTrue(m.shape('command_request',a,'Plans/forge_integration_contracts.schema.json'))
    def test_content_actual_bytes_required(self):
        self.assertIn('content_readback',self.check(self.value(),read_content=lambda ref:b'altered'))
    def test_original_resolver_mutation_detected(self):
        v=self.value();seen=[]
        def resolve(ref):
            if seen:seen[0]['actor_ref']='actor:substituted'
            obj=v['records'][ref];seen.append(obj);return obj
        self.assertIn('original_mutated',self.check(v,resolve_record=resolve))
    def test_native_proofs_not_booleans(self):
        for key in ('verify_original_admission','verify_source_authority','verify_permission_redaction','check_current_disclosure'):
            self.assertTrue(any(x.endswith('_invalid_proof') for x in self.check(self.value(),**{key:lambda *a:True})))
    def test_native_failure_propagates(self):
        self.assertIn('disclosure:revoked',self.check(self.value(),check_current_disclosure=lambda *a:['revoked']))
    def test_native_proof_mutation_detected(self):
        def mutate(original,*a):original['actor_ref']='foreign';return []
        self.assertIn('proof_input_mutated',self.check(self.value(),verify_original_admission=mutate))
    def test_cursor_exact_selected_scope(self):
        v=self.value('continuation');v['records']['cursor:one']['provider_run_id']='foreign'
        self.assertIn('cursor_scope',self.check(v))
    def test_stage_exact_membership(self):
        v=self.value('stage');v['records']['source:run']['children']=[]
        self.assertIn('child_membership',self.check(v))
    def test_response_not_false_success(self):
        v=self.value('unavailable');v['records']['response:logs']['result_status']='succeeded';v['records']['response:logs']['error']=None
        self.assertIn('response_outcome',self.check(v))
    def test_response_receipt_not_unrelated(self):
        v=self.value();v['records']['response:logs']['receipt_ref']='foreign'
        self.assertIn('response_receipt',self.check(v))
    def test_original_caller_exact(self):
        v=self.value();v['records']['response:logs']['owner_identity']['actor_ref']='foreign'
        self.assertTrue(self.check(v))
    def test_observation_target_exact(self):
        v=self.value();v['records']['observation:logs']['target_ref']='foreign'
        self.assertIn('observation_target',self.check(v))
    def test_complete_cannot_continue(self):
        v=self.value('continuation');v['records']['observation:logs']['completeness']='complete'
        self.assertIn('complete_with_continuation',self.check(v))
    def test_generation_exact(self):
        v=self.value();v['records'][v['request']['selection']['automation_binding_ref']]['binding_generation']+=1
        self.assertIn('automation_binding_generation',self.check(v))
    def bundle(self,v):
        original=v['records'][v['original_binding_ref']]
        return {'response':v['records'][v['response_ref']], 'response_ref':v['response_ref'],
                'owner_result':v['result'],'owner_request':v['request'],'resolved_owner_result_ref':v['records'][v['outcome_ref']]['owner_result_ref'],
                'original_binding_ref':v['original_binding_ref'],'delivery_return_context':v['delivery_return_context'],
                'resolved_outcome_ref':v['outcome_ref'],'outcome':v['records'][v['outcome_ref']],
                'original_response':None,'normalized_request':{
                    'request_ref':original['request_ref'],'command_id':m.COMMAND,
                    'command_instance_id':original['identity']['command_instance_id'],
                    'operation_id':original['identity']['operation_id'],'owner_identity':original['identity'],
                    **{k:original[k] for k in ('payload_sha256','idempotency_key','target_generation','dispatch_frame_id')}}}
    def test_actual_central_ui_positive(self):
        for case in self.fixtures['valid']:
            v=deepcopy(case['value'])
            self.assertEqual([],ui.response_bundle_failures(self.bundle(v),forge_log_dependencies=m.fixture_dependencies(v)),case['name'])
    def test_actual_central_requires_native_dependencies(self):
        self.assertIn('log_native_dependencies_missing',ui.response_bundle_failures(self.bundle(self.value())))
    def test_actual_central_original_caller(self):
        v=self.value();b=self.bundle(v);b['normalized_request']['owner_identity']=deepcopy(b['normalized_request']['owner_identity']);b['normalized_request']['owner_identity']['actor_ref']='foreign'
        self.assertTrue(ui.response_bundle_failures(b,forge_log_dependencies=m.fixture_dependencies(v)))
    def test_no_inferred_noop(self):
        v=self.value();v['records']['response:logs']['result_status']='no_op'
        self.assertIn('response_outcome',self.check(v))
        self.assertIn('response_outcome',ui.response_bundle_failures(self.bundle(v),forge_log_dependencies=m.fixture_dependencies(v)))
    def test_acknowledgement_receipt_exact(self):
        v=self.value();r=v['result']['owner_result'];r.update(outcome='accepted',terminal_provider_result_ref=None,observable_work_id='work:pending')
        v['records']['receipt:logs'].update(outcome='accepted',observable_work_id='work:pending')
        o=v['records']['outcome:logs'];o.update(outcome='accepted',result_receipt_ref=None,acknowledgement_receipt_ref='ack:other',owner_result_sha256=m.owner_result_digest(v['result']))
        v['records']['response:logs'].update(result_status='pending',receipt_ref='ack:other')
        v['records']['result:logs']=deepcopy(v['result'])
        self.assertEqual([],m.shape('result',v['result']))
        self.assertIn('acceptance_receipt',self.check(v))
    def test_unknown_effect_is_not_failed_terminal(self):
        v=self.value('unavailable');v['result']['owner_result']['error']['effect_state']='unknown'
        v['result']['owner_result']['error']['retry_disposition']='after_reconciliation'
        v['records']['result:logs']=deepcopy(v['result']);v['records']['outcome:logs']['owner_result_sha256']=m.owner_result_digest(v['result'])
        self.assertIn('terminal_outcome',self.check(v))
        v['records']['outcome:logs']['outcome']='terminal_unknown';v['records']['response:logs']['result_status']='recovery_required'
        self.assertEqual([],self.check(v))
        self.assertEqual([],ui.response_bundle_failures(self.bundle(v),forge_log_dependencies=m.fixture_dependencies(v)))

if __name__=='__main__':unittest.main()
