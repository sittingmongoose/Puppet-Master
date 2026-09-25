"""Installed-only ACT119 original/review/new-domain effect contract tests."""
from copy import deepcopy
import importlib.util,json,os,sys,unittest
from pathlib import Path
from referencing import Resource
ROOT=Path(__file__).resolve().parents[1];CANON=Path(os.environ.get('PM_CANON_ROOT',ROOT))
sys.path.insert(0,str(ROOT/'scripts'))
import pm_backup_reencrypt as m
import pm_ui_command_response as ui
class T(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fixtures=json.loads((ROOT/'Plans/backup_reencrypt_contract_fixtures.json').read_text());cls.schema=json.loads((ROOT/m.SCHEMA).read_text())
        spec=importlib.util.spec_from_file_location('reencrypt_gate',CANON/'scripts/pm-new-contracts-verify.py');cls.central=importlib.util.module_from_spec(spec);spec.loader.exec_module(cls.central)
        cls.registry=cls.central.offline_schema_registry().with_resource(cls.schema['$id'],Resource.from_contents(cls.schema))
    def value(self,name='completed_reencrypt'):return deepcopy(next(c['value'] for c in self.fixtures['valid'] if c['name']==name))
    def check(self,v,**override):
        deps=m.fixture_dependencies(v);deps.update(override)
        return m.validate_reencrypt_result(v['request'],v['result'],v['original_binding_ref'],v['outcome_ref'],v['response_ref'],v['delivery_return_context'],**deps)
    def bundle(self,v):
        original=v['records'][v['original_binding_ref']]
        return {'response':v['records'][v['response_ref']],'response_ref':v['response_ref'],'owner_result':v['result'],'owner_request':v['request'],'original_binding_ref':v['original_binding_ref'],'delivery_return_context':v['delivery_return_context'],'resolved_outcome_ref':v['outcome_ref'],'outcome':v['records'][v['outcome_ref']],'resolved_owner_result_ref':v['records'][v['outcome_ref']]['owner_result_ref'],'original_response':None,'normalized_request':{'request_ref':original['request_ref'],'command_id':m.COMMAND,'command_instance_id':original['identity']['command_instance_id'],'operation_id':original['identity']['operation_id'],'owner_identity':original['identity'],**{k:original[k] for k in ('payload_sha256','idempotency_key','target_generation','dispatch_frame_id')}}}
    def central_check(self,v):return ui.response_bundle_failures(self.bundle(v),backup_reencrypt_dependencies=m.fixture_dependencies(v))
    def pin(self,v):
        q=v['request'];r=v['result'];rec=v['records'];o=rec[v['original_binding_ref']];o.update(arguments=deepcopy(q),payload_sha256=ui.owner_result_digest(q));rec[q['request_ref']]=deepcopy(q);out=rec[v['outcome_ref']];out.update(payload_sha256=o['payload_sha256'],owner_result_sha256=ui.owner_result_digest(r));rec[out['owner_result_ref']]=deepcopy(r)
    def test_actual_gate_metadata_and_semantic_delegate(self):
        self.assertEqual(self.schema['x-schema-id'],self.fixtures['contract_schema_id'])
        for group in ('valid','invalid'):
            for case in self.fixtures[group]:
                d,s=self.central.select_definition(self.schema,case,case['value'],require_valid=group=='valid');self.assertEqual([],list(self.central.validator_for(self.schema,s,self.registry).iter_errors(case['value'])),case['name']);errors=ui.contracts().contract_semantic_failures(m.SCHEMA,d,case['value'])
                if group=='valid':self.assertEqual([],errors,case['name'])
                else:self.assertIn(case['semantic_rule'],errors,case['name'])
    def test_all_actual_central_positives(self):
        for c in self.fixtures['valid']:self.assertEqual([],self.central_check(deepcopy(c['value'])),c['name'])
    def test_unchanged_mandatory_authority_composition(self):
        self.assertEqual({'$ref':m.schemas()[0][m.BASE]['$id']+'#/$defs/backup_restore_command_request'},self.schema['$defs']['request']['properties']['authority'])
        for key in ('recovery_set_id','recovery_set_generation','new_recovery_set_id','repository_id','repository_revision','initiating_client_id','human_step_up_receipt_ref','protected_submission_ref','maintenance_lease_ref','confirmation_receipt_ref'):
            v=self.value();del v['request']['authority'][key];self.assertTrue(m.shape('request',v['request']),key)
    def test_unchanged_common_fixture_compatibility(self):
        for c in json.loads((CANON/'Plans/ui_command_response_fixtures.json').read_text())['valid']:self.assertEqual([],ui.response_bundle_failures(c))
    def test_native_dependencies_required(self):
        self.assertIn('reencrypt_dependencies_missing',ui.response_bundle_failures(self.bundle(self.value())))
        for k in m.fixture_dependencies(self.value()):self.assertIn('reencrypt_dependencies_missing',self.check(self.value(),**{k:None}))
    def test_crypto_proof_not_boolean_or_id_inequality(self):
        for key in ('verify_original_admission','verify_review_admission','verify_source_custody','verify_native_reencryption','check_current_disclosure'):
            self.assertTrue(any('invalid_response' in e for e in self.check(self.value(),**{key:lambda *a:True})),key)
            self.assertTrue(any('unavailable' in e for e in self.check(self.value(),**{key:lambda *a:['unavailable']})),key)
    def test_immutable_callback_and_late_resolver_guards(self):
        def mutate(original,*a):original['actor_ref']='actor:foreign';return []
        self.assertIn('admission_inputs_mutated',self.check(self.value(),verify_original_admission=mutate))
        v=self.value()
        def late(*a):v['records']['recovery-set:before']['kit_confirmation']='not_saved';return []
        self.assertIn('reencrypt_inputs_mutated',self.check(v,check_current_disclosure=late))
    def test_original_input_mutation(self):
        v=self.value()
        def mutate(*a):v['request']['new_destination_refs'].append('destination:foreign');return []
        self.assertIn('reencrypt_inputs_mutated',self.check(v,verify_review_admission=mutate))
    def test_actual_full_original_identity(self):
        v=self.value();v['records'][v['outcome_ref']]['identity']['project_id']='project:foreign';self.assertTrue(self.check(v));self.assertTrue(self.central_check(v))
    def test_review_same_generation_permission_and_confirmation(self):
        for k,val in [('recovery_set_generation',999),('confirmation_receipt_ref','confirmation:foreign'),('maintenance_lease_ref','lease:foreign'),('protected_submission_ref','submission:foreign')]:
            v=self.value();v['records']['preview:reencrypt']['authority'][k]=val;self.assertIn('review_original',self.check(v));self.assertIn('review_original',self.central_check(v))
    def test_review_precedes_acceptance(self):
        v=self.value();v['records']['preview:reencrypt']['reviewed_at_utc']='2026-09-25T11:00:00Z';self.assertIn('review_after_acceptance',self.check(v))
    def test_current_original_recovery_set(self):
        v=self.value();v['records']['recovery-set:before']['recovery_set_generation']+=1;self.assertIn('source_authority',self.check(v))
    def test_no_implicit_whole_set_repository_expansion(self):
        v=self.value();v['records']['preview:reencrypt']['history'][0]['snapshot']['repository_id']='repository:other';self.assertIn('history_outside_source',self.check(v))
    def test_destination_configuration_generation_exact(self):
        v=self.value();v['records']['destination:new']['destination_generation']+=1;self.assertIn('destination_original',self.check(v));self.assertIn('destination_original',self.central_check(v))
    def test_destination_set_no_omission(self):
        v=self.value();v['request']['new_destination_refs'].append('destination:missing');self.pin(v);self.assertIn('target_exact_set',self.check(v))
    def test_source_old_repository_never_target(self):
        v=self.value();v['records']['preview:reencrypt']['targets'][0]['intended_repository_id']=v['request']['authority']['repository_id'];self.assertIn('target_old_repository',self.check(v))
    def test_protected_audience_stepup_action(self):
        for k,val in [('audience_client_id','client:foreign'),('human_step_up_receipt_ref','stepup:foreign'),('action','rotate')]:
            v=self.value();v['records']['session:reencrypt'][k]=val;self.assertIn('protected_original',self.check(v))
    def test_protected_expiry_at_native_admission_not_later_result(self):
        self.assertEqual([],self.check(self.value()))
        v=self.value();v['records']['observation:reencrypt']['admitted_at_utc']='2026-09-25T10:01:00Z';self.assertIn('protected_expired_at_effect',self.check(v))
    def test_planned_target_not_created_proof(self):
        v=self.value();v['records']['observation:reencrypt']['targets'][0]['new_repository_binding_ref']=None;self.assertTrue(self.check(v))
        v=self.value();v['records']['observation:reencrypt']['targets'][0]['creation_state']='not_attempted';self.assertIn('uncreated_target_claim',self.check(v));self.assertIn('copy_without_actual_source_target',self.check(v))
    def test_actual_new_recovery_domain_and_repository(self):
        v=self.value();v['records']['recovery-set:new']['recovery_set_id']=v['request']['authority']['recovery_set_id'];self.assertIn('new_set_identity',self.check(v))
        v=self.value();v['records']['binding:new']['recovery_set_id']=v['request']['authority']['recovery_set_id'];self.assertIn('created_target_identity',self.check(v))
    def test_copy_requires_resolved_genuine_source(self):
        v=self.value();v['records']['observation:reencrypt']['sources'][0].update(disposition='unresolved',resolved_source=None,failure_reason='source:unavailable');self.assertIn('copy_without_actual_source_target',self.check(v));self.assertIn('false_complete',self.central_check(v))
    def test_verification_not_process_exit_or_mismatched_target(self):
        v=self.value();v['records']['verification:copy']['status']='incomplete';self.assertIn('verification_not_passed',self.check(v))
        v=self.value();v['records']['verification:copy']['target_snapshot_id']='snapshot:foreign';self.assertIn('verification_original',self.check(v));self.assertIn('verification_original',self.central_check(v))
    def test_no_ciphertext_equality_surrogate(self):
        v=self.value();d=v['records']['observation:reencrypt']['sources'][0]['resolved_source'];v['records']['verification:copy']['target_manifest_sha256']=d['manifest_sha256'];v['records']['observation:reencrypt']['targets'][0]['history'][0]['target_manifest_sha256']=d['manifest_sha256']
        self.assertEqual([],self.check(v));self.assertIn('effect:actual_crypto_unproved',self.check(v,verify_native_reencryption=lambda *a:['actual_crypto_unproved']))
    def test_partial_actual_effect_survives_failure_and_cancel(self):
        for name in ('failed_reencrypt','cancelled_reencrypt'):
            v=self.value(name);self.assertEqual('verified',v['records']['observation:reencrypt']['targets'][0]['history'][0]['state']);self.assertEqual([],self.central_check(v));v['records']['observation:reencrypt']['targets'][0]['history'][0]['state']='known_not_applied';self.assertIn('unapplied_copy_claim',self.central_check(v))
    def test_no_old_key_retirement(self):
        v=self.value();slot=v['records']['recovery-set:after']['key_slots'][0];slot.update(state='retired',retired_at_utc='2026-09-25T10:01:00Z');self.assertIn('old_key_or_set_changed',self.check(v));self.assertIn('old_key_or_set_changed',self.central_check(v))
    def test_no_source_policy_rebinding_or_repository_change(self):
        for k,val in [('retention_policy_ref','policy:foreign'),('repository_id','repository:foreign'),('destination_binding_ids',['destination:foreign'])]:
            v=self.value();v['records']['repository:after'][k]=val;self.assertIn('old_repository_or_policy_changed',self.check(v))
    def test_unknown_same_operation_reconciliation(self):
        v=self.value('recovery_required_reencrypt');v['records']['observation:reencrypt']['reconciliation_ref']=None;self.assertIn('reconciliation_missing',self.check(v))
        v=self.value('recovery_required_reencrypt');v['records']['error:reencrypt']['retriable']=True;self.assertIn('unknown_no_resubmit',self.check(v))
    def test_accepted_work_is_not_terminal(self):
        v=self.value('accepted_reencrypt');work=v['records'][v['result']['work_ref']];work.update(work_state='completed',result_receipt_ref='receipt:foreign',cancel_available=False,background_available=False);self.assertIn('accepted_work_terminal',self.check(v));self.assertIn('accepted_work_terminal',self.central_check(v))
    def test_actual_error_ui_caller_joins(self):
        v=self.value('recovery_required_reencrypt');v['records'][v['response_ref']]['error']['reason']='foreign';v['records'][v['outcome_ref']]['error_ref']='error:foreign';self.assertIn('actual_error',self.check(v));self.assertIn('error_projection_value',self.central_check(v))
        v=self.value();v['delivery_return_context']=None;self.assertIn('original_caller',self.check(v));self.assertTrue(self.central_check(v))
    def test_cancelled_null_ui_is_legal(self):
        v=self.value('cancelled_reencrypt');self.assertIsNone(v['records'][v['response_ref']]['error']);self.assertIsNotNone(v['result']['error_ref']);self.assertEqual([],self.central_check(v))
    def test_no_inferred_no_op(self):
        v=self.value();v['records'][v['outcome_ref']]['outcome']='no_op';self.assertTrue(self.check(v));self.assertTrue(self.central_check(v))
    def test_receipt_actual_original_and_acknowledgement(self):
        v=self.value();v['records'][v['result']['receipt_ref']]['original_binding_ref']='original:foreign';self.assertIn('receipt_original',self.check(v))
        v=self.value('accepted_reencrypt');v['records'][v['response_ref']]['receipt_ref']='receipt:foreign';self.assertIn('accepted_receipt',self.check(v))
    def test_native_effect_sees_actual_all_records(self):
        seen=[]
        def proof(*args):seen.append(args);return []
        self.assertEqual([],self.check(self.value(),verify_native_reencryption=proof));self.assertEqual(14,len(seen[0]));self.assertTrue(seen[0][9]);self.assertTrue(seen[0][10]);self.assertTrue(seen[0][11])
    def test_partial_unresolved_peer_and_uncreated_target(self):
        for name in ('partial_unresolved_history','partial_target_unavailable'):
            v=self.value(name);self.assertEqual([],self.check(v));self.assertEqual([],self.central_check(v));v['result']['outcome']='completed';self.pin(v);self.assertIn('false_complete',self.check(v));self.assertIn('false_complete',self.central_check(v))
    def test_unresolved_peer_cannot_be_fabricated_verified(self):
        v=self.value('partial_unresolved_history');peer=v['records']['observation:reencrypt']['targets'][0]['history'][1];peer.update(state='verified',target_snapshot_id='snapshot:fake',target_manifest_sha256='b'*64,verification_ref=None,evidence_refs=['evidence:fake']);self.assertIn('copy_without_actual_source_target',self.check(v));self.assertIn('verification_missing',self.central_check(v))
    def test_current_scope_no_foreign_destination_verification(self):
        v=self.value();v['records']['verification:copy']['destination_ref']='destination:foreign';self.assertIn('verification_original',self.check(v));self.assertIn('verification_original',self.central_check(v))
    def test_native_unknown_target_creation_not_plain_failure(self):
        v=self.value('failed_reencrypt');t=v['records']['observation:reencrypt']['targets'][0];t.update(creation_state='unknown',new_repository_binding_ref=None,domain_evidence_ref=None);t['history'][0].update(state='unknown',verification_ref=None);self.assertIn('unknown_outcome',self.check(v));self.assertIn('unknown_outcome',self.central_check(v))
    def test_actual_created_membership_rejects_unreviewed_scope(self):
        for ref,key,value,rule in [('recovery-set:new','repository_ids','repository:unreviewed','created_set_exact_membership'),('binding:new','destination_binding_ids','destination:unreviewed','created_destination_exact_membership')]:
            v=self.value();v['records'][ref][key].append(value)
            self.assertEqual([],m.shape('fixture_case',v));self.assertIn(rule,self.check(v));self.assertIn(rule,self.central_check(v))
    def test_multiple_reviewed_destinations_can_share_created_repository(self):
        v=self.value();rec=v['records'];review=rec['preview:reencrypt'];observation=rec['observation:reencrypt']
        planned=deepcopy(review['targets'][0]);planned.update(destination_ref='destination:second',backup_destination_id='backup-destination:second');review['targets'].append(planned)
        rec['destination:second']=deepcopy(rec['destination:new']);rec['destination:second']['backup_destination_id']=planned['backup_destination_id']
        v['request']['new_destination_refs'].append(planned['destination_ref']);rec['binding:new']['destination_binding_ids'].append(planned['backup_destination_id'])
        target=deepcopy(observation['targets'][0]);target.update(destination_ref=planned['destination_ref'],domain_evidence_ref='domain:second');target['history'][0]['verification_ref']='verification:second';observation['targets'].append(target)
        rec['domain:second']=deepcopy(rec['domain:created']);rec['domain:second'].update(domain_evidence_ref='domain:second',destination_ref=planned['destination_ref'])
        rec['verification:second']=deepcopy(rec['verification:copy']);rec['verification:second'].update(verification_ref='verification:second',destination_ref=planned['destination_ref'])
        self.pin(v);self.assertEqual([],m.shape('fixture_case',v));self.assertEqual([],self.check(v));self.assertEqual([],self.central_check(v))
    def test_later_closed_session_preserves_authentic_admitted_effects(self):
        for name in ('completed_reencrypt','failed_reencrypt','cancelled_reencrypt','recovery_required_reencrypt'):
            for state in ('expired','cancelled','failed'):
                v=self.value(name);v['records']['session:reencrypt']['terminal_status']=state
                self.assertEqual([],m.shape('fixture_case',v));self.assertEqual([],self.check(v));self.assertEqual([],self.central_check(v))
                self.assertIn('review:historical_admission_unproved',self.check(v,verify_review_admission=lambda *a:['historical_admission_unproved']))
    def test_closed_channel_cannot_grant_fresh_pending_acceptance(self):
        v=self.value('accepted_reencrypt');v['records']['session:reencrypt']['terminal_status']='expired'
        self.assertIn('protected_session_unavailable',self.check(v));self.assertIn('protected_session_unavailable',self.central_check(v))
    def test_closed_channel_does_not_extend_original_admission_lifetime(self):
        v=self.value();v['records']['session:reencrypt']['terminal_status']='expired';v['records']['observation:reencrypt']['admitted_at_utc']='2026-09-25T10:01:00Z'
        self.assertIn('protected_expired_at_effect',self.check(v));self.assertIn('protected_expired_at_effect',self.central_check(v))
    def test_no_raw_key_field_or_old_copy_deletion_operand(self):
        for key in ('raw_recovery_key','delete_old_copies','retire_old_slot'):
            v=self.value();v['request'][key]='not-admitted';self.assertTrue(m.shape('request',v['request']),key)
    def test_actual_review_no_missing_original_source(self):
        v=self.value();review=v['records']['preview:reencrypt'];del v['records'][review['old_recovery_set_ref']];self.assertTrue(self.check(v));self.assertTrue(self.central_check(v))
if __name__=='__main__':unittest.main()
