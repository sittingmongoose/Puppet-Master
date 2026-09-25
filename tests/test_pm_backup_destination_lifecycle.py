"""Installed-only destination lifecycle contracts; native runtime remains NOT_RUN."""
from copy import deepcopy
import importlib.util,json,os,sys,unittest
from pathlib import Path
from referencing import Resource
ROOT=Path(__file__).resolve().parents[1];CANON=Path(os.environ.get('PM_CANON_ROOT',ROOT))
sys.path.insert(0,str(ROOT/'scripts'))
import pm_backup_destination_lifecycle as m
import pm_ui_command_response as ui
class T(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fixtures=json.loads((ROOT/'Plans/backup_destination_lifecycle_contract_fixtures.json').read_text());cls.schema=json.loads((ROOT/m.SCHEMA).read_text())
        spec=importlib.util.spec_from_file_location('lifecycle_gate',CANON/'scripts/pm-new-contracts-verify.py');cls.central=importlib.util.module_from_spec(spec);spec.loader.exec_module(cls.central)
        cls.registry=cls.central.offline_schema_registry().with_resource(cls.schema['$id'],Resource.from_contents(cls.schema))
    def value(self,name='read_only_test'):return deepcopy(next(c['value'] for c in self.fixtures['valid'] if c['name']==name))
    def check(self,v,**override):
        deps=m.fixture_dependencies(v);deps.update(override)
        return m.validate_lifecycle_result(v['request'],v['result'],v['original_binding_ref'],v['outcome_ref'],v['response_ref'],v['delivery_return_context'],**deps)
    def bundle(self,v):
        o=v['records'][v['original_binding_ref']]
        return {'response':v['records'][v['response_ref']],'response_ref':v['response_ref'],'owner_result':v['result'],'owner_request':v['request'],'original_binding_ref':v['original_binding_ref'],'delivery_return_context':v['delivery_return_context'],'resolved_outcome_ref':v['outcome_ref'],'outcome':v['records'][v['outcome_ref']],'resolved_owner_result_ref':'result:lifecycle','original_response':None,'normalized_request':{'request_ref':o['request_ref'],'command_id':v['request']['authority']['command_id'],'command_instance_id':o['identity']['command_instance_id'],'operation_id':o['identity']['operation_id'],'owner_identity':o['identity'],**{k:o[k] for k in ('payload_sha256','idempotency_key','target_generation','dispatch_frame_id')}}}
    def central_check(self,v):return ui.response_bundle_failures(self.bundle(v),backup_lifecycle_dependencies=m.fixture_dependencies(v))
    def repin(self,v):
        o=v['records'][v['original_binding_ref']];o['arguments']=deepcopy(v['request']);o['payload_sha256']=m.owner_result_digest(v['request']);v['records'][v['result']['original_request_ref']]=deepcopy(v['request']);v['records']['result:lifecycle']=deepcopy(v['result']);v['records'][v['outcome_ref']].update(payload_sha256=o['payload_sha256'],owner_result_sha256=m.owner_result_digest(v['result']))
    def test_actual_aggregate_metadata_protocol(self):
        for group in ('valid','invalid'):
            for c in self.fixtures[group]:
                definition,selected=self.central.select_definition(self.schema,c,c['value'],require_valid=group=='valid')
                self.assertEqual([],list(self.central.validator_for(self.schema,selected,self.registry).iter_errors(c['value'])))
                errors=ui.contracts().contract_semantic_failures(m.SCHEMA,definition,c['value'])
                if group=='valid':self.assertEqual([],errors,c['name'])
                else:self.assertIn(c['semantic_rule'],errors)
    def test_actual_central_all_positives(self):
        for c in self.fixtures['valid']:self.assertEqual([],self.central_check(deepcopy(c['value'])),c['name'])
    def test_historical_common_positives(self):
        for c in json.loads((CANON/'Plans/ui_command_response_fixtures.json').read_text())['valid']:self.assertEqual([],ui.response_bundle_failures(c))
    def test_current_authority_direct_composition(self):
        self.assertEqual({'$ref':m.schemas()[0][m.BACKUP]['$id']+'#/$defs/backup_restore_command_request'},self.schema['$defs']['request']['properties']['authority'])
    def test_native_adapter_required(self):self.assertIn('lifecycle_native_dependencies_missing',ui.response_bundle_failures(self.bundle(self.value())))
    def test_current_native_admission_refusals(self):
        for k,label in [('verify_original_admission','admission'),('verify_destination_source','source'),('verify_lifecycle_effect','effect'),('check_current_disclosure','disclosure')]:self.assertIn(label+':unavailable',self.check(self.value(),**{k:lambda *a:['unavailable']}))
    def test_boolean_not_authority(self):
        self.assertIn('effect_invalid_proof',self.check(self.value(),verify_lifecycle_effect=lambda *a:True))
    def test_callback_mutation(self):
        def mutate(original,*a):original['actor_ref']='foreign';return []
        self.assertIn('proof_input_mutated',self.check(self.value(),verify_original_admission=mutate))
    def test_late_resolver_source_mutation(self):
        v=self.value()
        def late(*a):v['records']['destination:before']['display_name']='mutated';return []
        self.assertIn('original_mutated',self.check(v,check_current_disclosure=late))
    def test_read_only_cannot_use_canary(self):
        v=self.value();v['records']['observation:lifecycle']['canary']=self.value('approved_canary')['records']['observation:lifecycle']['canary'];self.assertIn('read_only_effect',self.check(v))
    def test_missing_canary_admission_shape(self):
        v=self.value('approved_canary');v['request']['input']['scratch_admission_ref']=None;self.assertTrue(m.shape('request',v['request']))
    def test_actual_canary_object(self):
        v=self.value('approved_canary');v['records']['scratch:approved']['canary_object_ref']='object:foreign';self.assertIn('canary_authority',self.check(v));self.assertIn('canary_authority',self.central_check(v))
    def test_actual_prefix(self):
        v=self.value('approved_canary');v['records']['scratch:approved']['scratch_prefix_ref']='prefix:foreign';self.assertIn('scratch_original',self.check(v))
    def test_original_server_generation(self):
        for k,val in [('owning_server_id','server:foreign'),('destination_generation',88)]:
            v=self.value();v['records']['destination:before'][k]=val;self.assertIn('destination_original',self.check(v))
    def test_test_cannot_change_configuration(self):
        v=self.value();v['records']['destination:after']['location_ref']='location:foreign';self.assertIn('test_configuration_changed',self.check(v))
    def test_unattempted_write_not_promoted(self):
        v=self.value();row=next(c for c in v['records']['observation:lifecycle']['capabilities'] if c['capability']=='write');row['declaration']='supported';v['records']['destination:after']['capabilities']['write']='supported';self.assertIn('untested_capability_promoted',self.check(v))
    def test_read_only_does_not_test_write_or_lock(self):
        for key in ('write','delete','lock','object_lock','commit'):
            v=self.value();c=next(c for c in v['records']['observation:lifecycle']['capabilities'] if c['capability']==key);c.update(method='read_only_probe',outcome='passed',declaration='supported',evidence_refs=['evidence:foreign']);self.assertIn('read_only_capability_mutation',self.check(v))
    def test_each_capability_once(self):
        v=self.value();v['records']['observation:lifecycle']['capabilities'].pop();self.assertIn('capability_coverage',self.check(v))
    def test_cleanup_same_canary(self):
        v=self.value('approved_canary');v['records']['cleanup:canary']['canary_object_ref']='object:foreign';self.assertIn('cleanup_original',self.check(v))
    def test_cleanup_missing_is_not_success(self):
        v=self.value('approved_canary');v['records']['observation:lifecycle']['canary']['cleanup_receipt_ref']=None;self.assertTrue(self.check(v))
    def test_cleanup_obligation_cannot_disappear(self):
        v=self.value('failed_cleanup_preserves_create');v['records']['observation:lifecycle']['canary'].update(cleanup='not_required',cleanup_receipt_ref=None);self.assertIn('cleanup_obligation_erased',self.check(v))
    def test_unknown_and_partial_effect_survive(self):
        for name in ('unknown_canary','failed_cleanup_preserves_create'):
            v=self.value(name);v['result']['effect_state']='not_attempted';self.repin(v);self.assertIn('canary_effect_preservation',self.check(v))
    def test_delete_data_never_admitted(self):
        v=self.value('configuration_disconnect');v['request']['input']['delete_data']=True;self.assertTrue(m.shape('request',v['request']))
    def test_stale_removal_preview(self):
        v=self.value('configuration_disconnect');v['records']['preview:remove']['selection']['destination_generation']+=1;self.assertIn('preview_original',self.check(v))
    def test_review_not_after_acceptance(self):
        v=self.value('configuration_disconnect');v['records']['preview:remove']['reviewed_at_utc']='2026-09-25T11:00:00Z';self.assertIn('preview_time',self.check(v))
    def test_absence_not_disabled_destination(self):
        v=self.value('configuration_disconnect');v['records']['registry:after']['destination_ref']='destination:before';self.assertIn('registry_false_destination',self.check(v))
    def test_unknown_membership_not_success(self):
        v=self.value('configuration_disconnect');v['records']['registry:after']['membership']='unknown';self.assertIn('disconnect_effect',self.check(v));self.assertIn('disconnect_effect',self.central_check(v))
    def test_dependencies_no_cascade(self):
        v=self.value('configuration_disconnect');v['records']['preview:remove']['disposition']='blocked';self.assertIn('disconnect_dependency_blocked',self.check(v))
    def test_external_data_and_credentials_invariant(self):
        v=self.value('configuration_disconnect');v['records']['observation:lifecycle']['external_data_effect']='deleted';self.assertTrue(self.check(v))
    def test_receipt_original_cannot_substitute(self):
        v=self.value();v['records']['receipt:lifecycle']['original_binding_ref']='original:foreign';self.assertIn('receipt_original',self.check(v))
    def test_error_ui_projection_not_unrelated(self):
        v=self.value('unknown_canary');v['records'][v['response_ref']]['error']['reason']='foreign';self.assertIn('response_error',self.check(v));self.assertIn('response_error',self.central_check(v))
    def test_cancelled_null_error_retains_owner_error(self):
        v=self.value('cancelled_before_disconnect');self.assertIsNone(v['records'][v['response_ref']]['error']);self.assertIsNotNone(v['result']['error_ref']);self.assertEqual([],self.central_check(v))
    def test_accepted_cannot_use_terminal_work(self):
        v=self.value('accepted_actual_work');v['records']['work:lifecycle'].update(work_state='completed',result_receipt_ref='receipt:foreign',cancel_available=False,background_available=False);self.assertIn('accepted_work_terminal',self.check(v));self.assertIn('accepted_work_terminal',self.central_check(v))
    def test_no_inferred_noop(self):
        v=self.value();v['records'][v['response_ref']]['result_status']='no_op';self.assertIn('response_outcome',self.check(v))
    def test_exact_caller(self):
        v=self.value();v['delivery_return_context']={'surface_id':'settings','route_ref':'route:other','focus_id':None,'invocation_token':'i','caller_context_ref':'c','expected_caller_revision':1,'continuation_generation':1};self.assertIn('original_return',self.central_check(v))
    def test_response_timing(self):
        v=self.value();v['records'][v['response_ref']]['ts']='2026-09-25T09:00:00Z';self.assertIn('response_before_result',self.check(v))
    def test_passed_write_needs_actual_canary_effect(self):
        v=self.value('approved_canary');obs=v['records']['observation:lifecycle'];obs['canary']=None;row=next(c for c in obs['capabilities'] if c['capability']=='write');row.update(method='canary_probe',outcome='passed',declaration='supported',evidence_refs=['evidence:write']);self.assertIn('capability_without_canary_effect',self.check(v))
    def test_all_untested_not_completed_test(self):
        v=self.value()
        for c in v['records']['observation:lifecycle']['capabilities']:c.update(method='not_attempted',outcome='not_run',declaration='not_run',evidence_refs=[])
        self.assertIn('completed_without_test_observation',self.check(v))
    def test_actual_dependency_records_and_blocking(self):
        schema=m.schemas()[0][m.BACKUP];fixtures=json.loads((CANON/'Plans/backup_restore_system_contract_fixtures.json').read_text())
        def find(x):
            if isinstance(x,dict):
                if x.get('schema_id')=='pm.backup_restore_system.backup_policy.v2':yield x
                for v in x.values():yield from find(v)
            elif isinstance(x,list):
                for v in x:yield from find(v)
        policy=deepcopy(next(find(fixtures['valid'])))
        v=self.value('configuration_disconnect');sel=v['records']['preview:remove']['selection'];policy.update(server_id=sel['server_id'],destination_binding_ids=[sel['backup_destination_id']])
        self.assertEqual([],m.shape('backup_policy',policy,m.BACKUP))
        v['records']['policy:actual']=deepcopy(policy);v['records']['preview:remove']['dependencies']=[{'record_ref':'policy:actual','record':deepcopy(policy),'consequence':'unchanged','reason_ref':'reason:unchanged'}];v['records']['observation:lifecycle']['dependency_refs']=['policy:actual']
        self.assertEqual([],self.check(v))
        v['records']['policy:actual']['policy_revision']+=1;self.assertIn('dependency_substituted',self.check(v));v['records']['policy:actual']=deepcopy(policy)
        v['records']['preview:remove']['dependencies'][0]['consequence']='blocking';self.assertIn('disconnect_dependency_blocked',self.check(v))
    def test_replay_substitution_is_rejected(self):
        v=self.value();response=v['records'][v['response_ref']];original=deepcopy(response);v['records'][original['dispatch_id']]=original
        response.update(replayed=True,original_dispatch_id=original['dispatch_id'],dispatch_id='dispatch:replay')
        v['records'][original['dispatch_id']]['receipt_ref']='receipt:foreign'
        self.assertTrue(any('replay' in e for e in self.check(v)))
    def test_not_run_probes_cannot_complete(self):
        v=self.value()
        for c in v['records']['observation:lifecycle']['capabilities']:
            if c['method']!='not_attempted':c['outcome']='not_run'
        self.assertEqual([],m.shape('fixture_case',v))
        for check in (self.check,self.central_check):
            self.assertIn('not_run_capability_contradiction',check(v))
            self.assertIn('completed_without_test_observation',check(v))
    def test_existing_qualified_evidence_remains_supported(self):
        v=self.value()
        for c in v['records']['observation:lifecycle']['capabilities']:
            if c['method']=='read_only_probe':c['method']='existing_evidence'
        self.assertEqual([],self.check(v));self.assertEqual([],self.central_check(v))
    def test_observed_currentness_not_caller_assertion(self):
        v=self.value();v['records']['observation:lifecycle']['currentness_sha256']='c'*64;self.assertIn('observed_currentness',self.check(v))
        v=self.value();v['records']['destination:after']['currentness_ref']='currentness:foreign';self.assertIn('destination_result_currentness',self.check(v))
        v=self.value('configuration_disconnect');v['records']['registry:after']['currentness_ref']='currentness:foreign';self.assertIn('registry_result_currentness',self.check(v))
if __name__=='__main__':unittest.main()
