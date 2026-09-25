"""Installed-only ACT105 static regressions. Native authentication NOT_RUN."""
from copy import deepcopy
import importlib.util,json,os,sys,unittest
from pathlib import Path
from referencing import Resource
ROOT=Path(__file__).resolve().parents[1];CANON=Path(os.environ.get('PM_CANON_ROOT',ROOT))
sys.path.insert(0,str(ROOT/'scripts'))
import pm_backup_selected_delete as m
import pm_ui_command_response as ui

class T(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fixtures=json.loads((ROOT/'Plans/backup_selected_delete_contract_fixtures.json').read_text());cls.schema=json.loads((ROOT/m.SCHEMA).read_text())
        spec=importlib.util.spec_from_file_location('delete_gate',CANON/'scripts/pm-new-contracts-verify.py');cls.central=importlib.util.module_from_spec(spec);spec.loader.exec_module(cls.central)
        cls.registry=cls.central.offline_schema_registry().with_resource(cls.schema['$id'],Resource.from_contents(cls.schema))
    def value(self,state='completed'):return deepcopy(next(c['value'] for c in self.fixtures['valid'] if c['name']=='selected_delete_'+state))
    def check(self,v,**overrides):
        deps=m.fixture_dependencies(v);deps.update(overrides)
        return m.validate_delete_result(v['request'],v['result'],v['original_binding_ref'],v['outcome_ref'],v['response_ref'],v['delivery_return_context'],**deps)
    def bundle(self,v):
        original=v['records'][v['original_binding_ref']]
        return {'response':v['records'][v['response_ref']],'response_ref':v['response_ref'],'owner_result':v['result'],'owner_request':v['request'],
          'original_binding_ref':v['original_binding_ref'],'delivery_return_context':v['delivery_return_context'],'resolved_outcome_ref':v['outcome_ref'],
          'outcome':v['records'][v['outcome_ref']],'resolved_owner_result_ref':'result:delete','original_response':None,
          'normalized_request':{'request_ref':original['request_ref'],'command_id':m.COMMAND,'command_instance_id':original['identity']['command_instance_id'],
          'operation_id':original['identity']['operation_id'],'owner_identity':original['identity'],**{k:original[k] for k in ('payload_sha256','idempotency_key','target_generation','dispatch_frame_id')}}}
    def refresh_request(self,v):
        q=v['request'];a=v['records'][v['original_binding_ref']];a['arguments']=deepcopy(q);a['payload_sha256']=ui.owner_result_digest(q)
        v['records'][q['request_ref']]=deepcopy(q);v['records'][v['outcome_ref']]['payload_sha256']=a['payload_sha256']
    def refresh_result(self,v):
        v['records']['result:delete']=deepcopy(v['result']);v['records'][v['outcome_ref']]['owner_result_sha256']=ui.owner_result_digest(v['result'])
    def test_actual_gate_metadata_and_exact_negatives(self):
        self.assertEqual(self.schema['x-schema-id'],self.fixtures['contract_schema_id'])
        for group in ('valid','invalid'):
            for c in self.fixtures[group]:
                d,s=self.central.select_definition(self.schema,c,c['value'],require_valid=group=='valid')
                self.assertEqual([],list(self.central.validator_for(self.schema,s,self.registry).iter_errors(c['value'])),c['name'])
                findings=ui.contracts().contract_semantic_failures(m.SCHEMA,d,c['value'])
                if group=='valid':self.assertEqual([],findings,c['name'])
                else:self.assertIn(c['semantic_rule'],findings,c['name'])
    def test_actual_current_central_all_positives(self):
        for c in self.fixtures['valid']:
            v=deepcopy(c['value']);self.assertEqual([],ui.response_bundle_failures(self.bundle(v),backup_delete_dependencies=m.fixture_dependencies(v)),c['name'])
    def test_mandatory_native_dependencies(self):
        self.assertIn('delete_dependencies_missing',ui.response_bundle_failures(self.bundle(self.value())))
        for name in m.fixture_dependencies(self.value()):
            self.assertIn('delete_dependencies_missing',self.check(self.value(),**{name:None}))
    def test_native_refusal_and_boolean_not_proof(self):
        for name in ('verify_original_admission','verify_retention_authority','verify_source_custody','verify_delete_effect','check_current_disclosure'):
            self.assertTrue(any('invalid_response' in x for x in self.check(self.value(),**{name:lambda *a:True})),name)
            self.assertTrue(any('revoked' in x for x in self.check(self.value(),**{name:lambda *a:['revoked']})),name)
    def test_no_python_candidate_codec(self):
        seen=[]
        def owner(preview,refs):seen.append((preview,refs));return 'b'*64
        self.assertIn('candidate_hash',self.check(self.value(),canonical_candidate_digest=owner));self.assertEqual(1,len(seen))
        self.assertTrue(self.check(self.value(),canonical_candidate_digest=lambda *a:True))
    def test_hash_callback_mutation(self):
        def mutate(preview,refs):refs.append('foreign');return preview['candidate_set_sha256']
        self.assertIn('digest_inputs_mutated',self.check(self.value(),canonical_candidate_digest=mutate))
    def test_current_callback_mutation(self):
        v=self.value()
        def mutate(*a):v['records']['preview:delete']['repository_revision']=99;return []
        self.assertIn('delete_inputs_mutated',self.check(v,check_current_disclosure=mutate))
    def test_original_callback_mutation(self):
        v=self.value()
        def mutate(*a):v['request']['actor_ref']='foreign';return []
        self.assertIn('delete_inputs_mutated',self.check(v,verify_original_admission=mutate))
    def test_callback_argument_mutation(self):
        def mutate(original,*a):original['actor_ref']='foreign';return []
        self.assertIn('admission_inputs_mutated',self.check(self.value(),verify_original_admission=mutate))
    def test_exact_selection_no_extra_or_duplicate_alias(self):
        v=self.value();selected=deepcopy(v['request']['selected_input']['snapshots'][0]);selected['snapshot']['snapshot_id']='snapshot:foreign'
        v['request']['selected_input']['snapshots'].append(selected);self.refresh_request(v)
        self.assertIn('selection_duplicate',self.check(v));self.assertIn('observation_exact_set',self.check(v))
    def test_snapshot_id_not_backup_id(self):
        v=self.value();v['records']['decision:delete']['evaluated_backup_id']=v['request']['selected_input']['snapshots'][0]['snapshot']['snapshot_id']
        self.assertIn('decision_identity',self.check(v))
    def test_all_retention_exclusions_preserved(self):
        for flag in ('protected','held','active_parent','last_known_good','recovery_required'):
            v=self.value();d=v['records']['decision:delete'];d.update(decision='blocked',delete_after_utc=None);d[flag]=True
            self.assertIn('delete_ineligible',self.check(v),flag)
    def test_preview_held_and_last_good(self):
        for key in ('held_snapshot_refs','last_known_good_snapshot_ref'):
            v=self.value();ref=v['request']['selected_input']['snapshots'][0]['repository_snapshot_ref'];v['records']['preview:delete'][key]=[ref] if key=='held_snapshot_refs' else ref
            self.assertIn('preview_exclusion',self.check(v))
    def test_expiry_at_effect_not_disclosure(self):
        v=self.value();v['records']['preview:delete']['expires_at_utc']='2026-09-25T10:00:30Z';self.assertEqual([],self.check(v))
        v['records']['observation:delete']['admitted_at_utc']='2026-09-25T10:00:31Z';self.assertIn('preview_effect_expiry',self.check(v))
    def test_decision_cannot_delete_early(self):
        v=self.value();v['records']['decision:delete']['delete_after_utc']='2026-09-25T10:00:30Z';self.assertIn('decision_effect_time',self.check(v))
    def test_maintenance_and_confirmation_exact(self):
        for k in ('mutation_lease_ref','confirmation_receipt_ref'):
            v=self.value();v['records']['preview:delete'][k]='foreign';self.assertIn('preview_admission',self.check(v))
    def test_actual_immutable_source(self):
        v=self.value();d=v['records']['observation:delete']['members'][0]['resolution']['resolved_source'];d['commit_receipt_ref']='receipt:foreign'
        self.assertIn('attempt_commit',self.check(v))
    def test_original_caller_identity(self):
        v=self.value();v['records'][v['original_binding_ref']]['identity']['goal_id']='goal:foreign';self.assertIn('original_identity',self.check(v))
        v=self.value();v['delivery_return_context']={'foreign':True};self.assertIn('original_caller',self.check(v))
    def test_accepted_never_borrows_terminal_work(self):
        v=self.value('accepted');v['records']['work:delete'].update(work_state='completed',result_receipt_ref='receipt:foreign',cancel_available=False,background_available=False)
        self.assertIn('accepted_work_terminal',self.check(v))
        self.assertIn('accepted_work_terminal',ui.response_bundle_failures(self.bundle(v),backup_delete_dependencies=m.fixture_dependencies(v)))
    def test_unknown_truth_and_no_resubmission(self):
        v=self.value('recovery_required');v['result']['outcome']='failed';self.refresh_result(v);self.assertIn('unknown_outcome',self.check(v))
        v=self.value('recovery_required');v['records']['error:delete']['retriable']=True;self.assertIn('unknown_no_resubmit',self.check(v))
    def test_cancelled_known_effect_is_retained(self):
        v=self.value('cancelled');self.assertEqual('deleted',v['records']['observation:delete']['members'][0]['effect']);self.assertIsNone(v['records'][v['response_ref']]['error']);self.assertEqual([],self.check(v))
    def test_unrelated_error_rejected_actual_central(self):
        v=self.value('failed');v['records'][v['response_ref']]['error']['reason']='Unrelated'
        self.assertIn('error_projection_value',self.check(v));self.assertIn('error_projection_value',ui.response_bundle_failures(self.bundle(v),backup_delete_dependencies=m.fixture_dependencies(v)))
    def test_foreign_owner_error_reference(self):
        v=self.value('failed');v['records'][v['outcome_ref']]['error_ref']='error:foreign';self.assertIn('actual_error',self.check(v))
    def test_false_success_and_noop(self):
        v=self.value();v['records']['observation:delete']['members'][0].update(effect='not_deleted',reason_ref='reason:blocked');self.assertIn('false_complete',self.check(v))
        v=self.value();v['records'][v['response_ref']]['result_status']='no_op';self.assertIn('response_outcome',self.check(v))
    def test_no_hold_override_or_prune_input(self):
        for k in ('hold_override_ref','prune_after_delete'):
            v=self.value();v['request'][k]=True;self.assertTrue(m.shape('request',v['request']))
    def test_unresolved_member_is_not_dropped(self):
        v=self.value('failed');member=v['records']['observation:delete']['members'][0]
        member.update(effect='unresolved',retention_decision_ref=None,reason_ref='reason:missing');member['resolution'].update(disposition='unresolved',resolved_source=None,failure_reason='source_missing')
        self.assertEqual([],self.check(v));member['effect']='deleted';self.assertIn('unresolved_effect',self.check(v))
    def test_mixed_cancelled_selection_is_order_independent(self):
        v=self.value('mixed_cancelled');self.assertEqual([],self.check(v))
        v['records']['observation:delete']['members'].reverse();v['records']['preview:delete']['candidate_snapshot_refs'].reverse()
        self.assertEqual([],self.check(v))
        v['records']['observation:delete']['members'].pop();self.assertIn('observation_exact_set',self.check(v))
    def test_actual_policy_revision_and_scope(self):
        for field,value,rule in [('policy_revision',99,'policy_revision'),('repository_binding_ids',['binding:foreign'],'policy_repository'),('project_ids',['project:foreign'],'policy_project'),('destination_binding_ids',['destination:foreign'],'policy_destination')]:
            v=self.value();v['records'][v['request']['backup_policy_id']][field]=value;self.assertIn(rule,self.check(v))
    def test_preview_native_currentness_not_conflated(self):
        v=self.value();self.assertNotEqual(v['request']['expected_currentness_ref'],v['records']['preview:delete']['currentness_ref']);self.assertEqual([],self.check(v))
        self.assertIn('retention:stale_native_revision',self.check(v,verify_retention_authority=lambda *a:['stale_native_revision']))
    def test_ui_bundle_normalized_original_and_result_join(self):
        v=self.value();b=self.bundle(v);b['normalized_request']['target_generation']=999
        self.assertIn('delete_normalized_original',ui.response_bundle_failures(b,backup_delete_dependencies=m.fixture_dependencies(v)))
        v=self.value();v['records']['result:delete']['return_route_ref']='route:foreign';self.assertIn('actual_result',self.check(v))
    def test_actual_native_receipt_and_work_are_exposed(self):
        seen=[]
        self.assertEqual([],self.check(self.value(),verify_delete_effect=lambda *a:seen.append(a) or []))
        self.assertEqual('pm.backup.selected_delete.receipt.v1',seen[0][-2]['schema_id'])
        seen=[];self.assertEqual([],self.check(self.value('accepted'),verify_delete_effect=lambda *a:seen.append(a) or []))
        self.assertEqual('work:delete',seen[0][-1]['observable_work_id'])
    def test_bare_result_central_semantic_does_not_claim_composition(self):
        self.assertEqual([],ui.contracts().contract_semantic_failures(m.SCHEMA,'result',self.value()['result']))
        self.assertEqual([],m.shape('result',self.value()['result']))

if __name__=='__main__':unittest.main()
