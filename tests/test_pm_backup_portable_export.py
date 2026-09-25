"""Installed-only ACT111 static boundary; no native/encryption proof."""
from copy import deepcopy
import importlib.util,json,os,sys,unittest
from pathlib import Path
from referencing import Resource
ROOT=Path(__file__).resolve().parents[1];CANON=Path(os.environ.get('PM_CANON_ROOT',ROOT))
sys.path.insert(0,str(ROOT/'scripts'))
import pm_backup_portable_export as m
import pm_ui_command_response as ui
class T(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fixtures=json.loads((ROOT/'Plans/backup_portable_export_contract_fixtures.json').read_text());cls.schema=json.loads((ROOT/m.SCHEMA).read_text())
        spec=importlib.util.spec_from_file_location('export_gate',CANON/'scripts/pm-new-contracts-verify.py');cls.central=importlib.util.module_from_spec(spec);spec.loader.exec_module(cls.central)
        cls.registry=cls.central.offline_schema_registry().with_resource(cls.schema['$id'],Resource.from_contents(cls.schema))
    def value(self,name='completed_client_export'):return deepcopy(next(c['value'] for c in self.fixtures['valid'] if c['name']==name))
    def check(self,v,**override):
        deps=m.fixture_dependencies(v);deps.update(override)
        return m.validate_export_result(v['request'],v['result'],v['original_binding_ref'],v['outcome_ref'],v['response_ref'],v['delivery_return_context'],**deps)
    def bundle(self,v):
        original=v['records'][v['original_binding_ref']]
        return {'response':v['records'][v['response_ref']],'response_ref':v['response_ref'],'owner_result':v['result'],'owner_request':v['request'],'original_binding_ref':v['original_binding_ref'],'delivery_return_context':v['delivery_return_context'],'resolved_outcome_ref':v['outcome_ref'],'outcome':v['records'][v['outcome_ref']],'resolved_owner_result_ref':v['records'][v['outcome_ref']]['owner_result_ref'],'original_response':None,'normalized_request':{'request_ref':original['request_ref'],'command_id':m.COMMAND,'command_instance_id':original['identity']['command_instance_id'],'operation_id':original['identity']['operation_id'],'owner_identity':original['identity'],**{k:original[k] for k in ('payload_sha256','idempotency_key','target_generation','dispatch_frame_id')}}}
    def central_check(self,v):return ui.response_bundle_failures(self.bundle(v),backup_export_dependencies=m.fixture_dependencies(v))
    def pin(self,v):
        q=v['request'];r=v['result'];rec=v['records'];o=rec[v['original_binding_ref']];o.update(arguments=deepcopy(q),payload_sha256=ui.owner_result_digest(q));rec[q['request_ref']]=deepcopy(q);out=rec[v['outcome_ref']];out.update(payload_sha256=o['payload_sha256'],owner_result_sha256=ui.owner_result_digest(r));rec[out['owner_result_ref']]=deepcopy(r)
    def test_actual_central_metadata_and_semantic_delegate(self):
        self.assertEqual(self.schema['x-schema-id'],self.fixtures['contract_schema_id'])
        for group in ('valid','invalid'):
            for case in self.fixtures[group]:
                d,s=self.central.select_definition(self.schema,case,case['value'],require_valid=group=='valid')
                self.assertEqual([],list(self.central.validator_for(self.schema,s,self.registry).iter_errors(case['value'])),case['name'])
                failures=ui.contracts().contract_semantic_failures(m.SCHEMA,d,case['value'])
                if group=='valid':self.assertEqual([],failures,case['name'])
                else:self.assertIn(case['semantic_rule'],failures,case['name'])
    def test_all_actual_central_positives(self):
        for case in self.fixtures['valid']:self.assertEqual([],self.central_check(deepcopy(case['value'])),case['name'])
    def test_historical_common_positives_unchanged(self):
        for c in json.loads((CANON/'Plans/ui_command_response_fixtures.json').read_text())['valid']:self.assertEqual([],ui.response_bundle_failures(c))
    def test_mandatory_adapters(self):
        self.assertIn('export_dependencies_missing',ui.response_bundle_failures(self.bundle(self.value())))
        for key in m.fixture_dependencies(self.value()):self.assertIn('export_dependencies_missing',self.check(self.value(),**{key:None}))
    def test_genuine_proofs_not_booleans(self):
        for key in ('verify_original_admission','verify_engine_admission','verify_source_custody','verify_export_effect','check_current_disclosure'):
            self.assertTrue(any('invalid_response' in x for x in self.check(self.value(),**{key:lambda *a:True})),key)
            self.assertTrue(any('revoked' in x for x in self.check(self.value(),**{key:lambda *a:['revoked']})),key)
    def test_callback_argument_mutation(self):
        def bad(original,*a):original['actor_ref']='foreign';return []
        self.assertIn('admission_inputs_mutated',self.check(self.value(),verify_original_admission=bad))
    def test_late_resolved_record_mutation(self):
        v=self.value()
        def bad(*a):v['records']['destination:export']['location_ref']='location:foreign';return []
        self.assertIn('export_inputs_mutated',self.check(v,check_current_disclosure=bad))
    def test_original_request_mutation(self):
        v=self.value()
        def bad(*a):v['request']['snapshot_ids'].append('snapshot:foreign');return []
        self.assertIn('export_inputs_mutated',self.check(v,verify_engine_admission=bad))
    def test_readback_bytes_not_digest_echo(self):
        self.assertIn('output_readback',self.check(self.value(),read_output_bytes=lambda *a:b'foreign ciphertext'))
        self.assertIn('output_readback',self.check(self.value(),read_output_bytes=lambda *a:True))
    def test_readback_mutation(self):
        def bad(output,*a):output['byte_size']=0;return b''
        self.assertIn('readback_inputs_mutated',self.check(self.value(),read_output_bytes=bad))
    def test_exact_selected_snapshot_set(self):
        v=self.value();v['request']['snapshot_ids'].append('snapshot:extra');self.pin(v)
        self.assertIn('selection_exact_set',self.check(v));self.assertIn('selection_exact_set',self.central_check(v))
    def test_snapshot_source_substitution(self):
        v=self.value();v['records']['observation:export']['sources'][0]['resolved_source']['repository_snapshot_ref']='snapshot:foreign';self.assertIn('immutable_reference',self.check(v));self.assertTrue(self.central_check(v))
    def test_source_server_and_project_original(self):
        for field in ('server_id','project_id'):
            v=self.value();v['records']['observation:export']['sources'][0]['resolved_source'][field]=field.replace('_id','')+':foreign';self.assertIn('source_identity',self.check(v))
    def test_missing_source_cannot_complete(self):
        v=self.value();source=v['records']['observation:export']['sources'][0];source.update(disposition='unresolved',resolved_source=None,failure_reason='source:unavailable');self.assertIn('false_complete',self.check(v));self.assertIn('false_complete',self.central_check(v))
    def test_current_engine_and_destination_bindings(self):
        for key in ('expected_currentness_ref','destination_currentness_ref'):
            v=self.value();v['records']['admission:export'][key]='currentness:foreign';self.assertIn('engine_currentness',self.check(v))
    def test_no_effect_without_actual_engine_admission(self):
        v=self.value();v['records']['observation:export']['engine_admission_ref']=None;self.assertIn('effect_without_admission',self.check(v))
    def test_host_permissions_and_filesafe_required(self):
        v=self.value('completed_host_export');v['records']['destination:export']['filesafe_decision_ref']=None;self.assertTrue(self.check(v))
        v=self.value('completed_host_export');v['records']['destination:export']['permission_decision_refs']=[];self.assertTrue(self.check(v))
    def test_client_not_implicit_host(self):
        v=self.value();v['records']['destination:export']['host_id']='host:foreign';self.assertTrue(self.check(v))
    def test_dependency_scope_not_arbitrary_json(self):
        v=self.value();v['request']['dependency_scope']=[{'scope':'all'}];self.assertTrue(m.shape('request',v['request']))
    def test_output_never_other_destination(self):
        v=self.value();v['records']['observation:export']['outputs'][0]['destination_ref']='destination:foreign';self.assertIn('output_original',self.check(v));self.assertIn('output_original',self.central_check(v))
    def test_full_project_claim_requires_actual_complete_source(self):
        v=self.value();obs=v['records']['observation:export'];obs['advertised_backup_type']='project_backup';desc=obs['sources'][0]['resolved_source'];manifest=v['records'][desc['manifest_ref']];manifest['source_capture_completeness']='partial';self.assertIn('false_full_project_source',self.check(v))
    def test_scope_cannot_add_foreign_objects(self):
        v=self.value();v['request']['dependency_scope'][0]['object_ids'].append('object:foreign');self.pin(v);self.assertIn('scope_object_membership',self.check(v))
    def test_output_scope_cannot_expand(self):
        v=self.value();v['records']['observation:export']['achieved_scope'][0]['object_ids'].append('object:foreign');self.assertIn('achieved_scope_expansion',self.check(v))
    def test_cleanup_is_not_delivered_user_output(self):
        v=self.value();v['records']['observation:export']['cleanup']=[{'temporary_output_ref':'output:export','outcome':'completed','evidence_refs':['proof:cleanup']}];self.assertIn('cleanup_delivered_output',self.check(v))
    def test_cleanup_due_cannot_complete(self):
        v=self.value();v['records']['observation:export']['cleanup']=[{'temporary_output_ref':'temporary:owned','outcome':'required','evidence_refs':[]}];self.assertIn('false_complete',self.check(v))
    def test_partial_outputs_cannot_disappear(self):
        v=self.value('cancelled_export');v['records']['observation:export']['effect_state']='not_attempted';self.assertIn('effect_erased',self.check(v))
    def test_unknown_preserved_and_no_blind_retry(self):
        v=self.value('recovery_required_export');v['records']['error:export']['retriable']=True;self.assertIn('unknown_no_resubmit',self.check(v))
        v=self.value('recovery_required_export');v['records']['observation:export']['reconciliation_ref']=None;self.assertIn('reconciliation_missing',self.check(v))
    def test_accepted_work_not_terminal_receipt(self):
        v=self.value('accepted_export');w=v['records'][v['result']['work_ref']];w.update(work_state='completed',result_receipt_ref='receipt:foreign',cancel_available=False,background_available=False);self.assertIn('accepted_work_terminal',self.check(v));self.assertIn('accepted_work_terminal',self.central_check(v))
    def test_no_inferred_no_op(self):
        v=self.value();v['records'][v['outcome_ref']]['outcome']='no_op';self.assertTrue(self.check(v));self.assertTrue(self.central_check(v))
    def test_actual_error_and_safe_ui_join(self):
        v=self.value('recovery_required_export');v['records'][v['response_ref']]['error']['reason']='unrelated';v['records'][v['outcome_ref']]['error_ref']='error:foreign';self.assertIn('actual_error',self.check(v));self.assertIn('error_projection_value',self.central_check(v))
    def test_cancelled_null_ui_is_legal(self):
        v=self.value('cancelled_export');self.assertIsNone(v['records'][v['response_ref']]['error']);self.assertIsNotNone(v['result']['error_ref']);self.assertEqual([],self.central_check(v))
    def test_original_caller_not_null_substitute(self):
        v=self.value();v['delivery_return_context']=None;self.assertIn('original_caller',self.check(v));self.assertTrue(self.central_check(v))
    def test_receipt_not_foreign_original(self):
        v=self.value();v['records'][v['result']['receipt_ref']]['original_binding_ref']='original:foreign';self.assertIn('receipt_original',self.check(v));self.assertIn('receipt_original',self.central_check(v))
    def test_native_engine_sees_full_current_inputs(self):
        seen=[]
        def proof(*args):seen.append(args);return []
        self.assertEqual([],self.check(self.value(),verify_engine_admission=proof));self.assertEqual(1,len(seen));self.assertEqual(6,len(seen[0]));self.assertTrue(seen[0][-1])
    def test_denied_admission_does_not_read_output(self):
        seen=[]
        self.assertTrue(self.check(self.value(),verify_original_admission=lambda *a:['denied'],read_output_bytes=lambda *a:seen.append(a)))
        self.assertEqual([],seen)
    def test_actual_two_selected_snapshots(self):
        v=self.value();q=v['request'];obs=v['records']['observation:export'];source=deepcopy(obs['sources'][0]);d=source['resolved_source'];source['selection']['snapshot_id']='snapshot:second';d.update(repository_snapshot_ref='snapshot-ref:second',destination_attempt_id='attempt:second',commit_receipt_ref='commit:second')
        origin=v['records'][d['origin_ref']];attempt=deepcopy(next(a for a in origin['destination_attempts'] if a['attempt_id']==obs['sources'][0]['resolved_source']['destination_attempt_id']));attempt.update(attempt_id=d['destination_attempt_id'],remote_snapshot_id='snapshot:second',commit_receipt_ref=d['commit_receipt_ref']);origin['destination_attempts'].append(attempt);origin['repository_snapshot_refs'].append(d['repository_snapshot_ref']);manifest=v['records'][d['manifest_ref']];manifest['repository_snapshot_refs'].append(d['repository_snapshot_ref']);v['records'][origin['manifest_ref']]=deepcopy(manifest)
        q['snapshots'].append({'snapshot':deepcopy(source['selection']),'repository_snapshot_ref':d['repository_snapshot_ref']});q['snapshot_ids'].append('snapshot:second');scope=deepcopy(q['dependency_scope'][0]);scope['snapshot']=deepcopy(source['selection']);q['dependency_scope'].append(scope);obs['sources'].append(source);obs['snapshot_ids']=deepcopy(q['snapshot_ids']);obs['achieved_scope']=deepcopy(q['dependency_scope']);obs['outputs'][0]['snapshots']=[deepcopy(s['snapshot']) for s in q['snapshots']];ad=v['records']['admission:export'];ad.update(snapshot_ids=deepcopy(q['snapshot_ids']),dependency_scope=deepcopy(q['dependency_scope']));self.pin(v)
        self.assertEqual([],self.check(v));self.assertEqual([],self.central_check(v))
        obs['sources'].pop();self.assertIn('source_exact_set',self.check(v))
    def test_partial_unresolved_peer_preserves_real_delivered_output(self):
        v=self.value('failed_partial_unresolved_peer');self.assertEqual([],self.check(v));self.assertEqual([],self.central_check(v))
        self.assertEqual(1,len(v['request']['snapshot_ids']));self.assertEqual(2,len(v['request']['snapshots']))
        obs=v['records']['observation:export'];obs['outputs'][0]['snapshots'].append(deepcopy(v['request']['snapshots'][1]['snapshot']));self.assertIn('output_source_unresolved',self.check(v));self.assertIn('output_source_unresolved',self.central_check(v))
    def test_partial_cancelled_unresolved_peer_not_false_complete(self):
        v=self.value('failed_partial_unresolved_peer');r=v['result'];r['outcome']='cancelled';v['records'][r['receipt_ref']]['outcome']='cancelled';v['records'][v['outcome_ref']]['outcome']='cancelled';v['records'][v['response_ref']].update(result_status='cancelled',error=None);v['records'][r['error_projection_ref']]['ui_error']=None;self.pin(v)
        self.assertEqual([],self.check(v));self.assertEqual([],self.central_check(v))
        r['outcome']='completed';self.pin(v);self.assertIn('false_complete',self.check(v));self.assertIn('false_complete',self.central_check(v))
    def test_full_tuple_scope_not_snapshot_id_alias(self):
        v=self.value('failed_partial_unresolved_peer');scope=v['request']['dependency_scope'];scope[1]['snapshot']=deepcopy(scope[0]['snapshot']);scope[1]['manifest_ref']='manifest:foreign';self.pin(v);self.assertIn('scope_exact_set',self.check(v));self.assertIn('scope_exact_set',self.central_check(v))
    def test_achieved_unresolved_peer_not_delivered(self):
        v=self.value('failed_partial_unresolved_peer');v['records']['observation:export']['achieved_scope'].append(deepcopy(v['request']['dependency_scope'][1]));self.assertIn('achieved_source_unresolved',self.check(v));self.assertIn('achieved_source_unresolved',self.central_check(v))
    def test_same_native_id_in_two_repositories_can_complete(self):
        v=self.value('failed_partial_unresolved_peer');q=v['request'];obs=v['records']['observation:export'];first=obs['sources'][0]['resolved_source'];peer=obs['sources'][1];desc=deepcopy(first);desc.update(repository_binding_id='binding:peer',repository_snapshot_ref=q['snapshots'][1]['repository_snapshot_ref'],destination_attempt_id='attempt:peer',commit_receipt_ref='commit:peer');peer.update(disposition='resolved',resolved_source=desc,failure_reason=None)
        binding=deepcopy(v['records'][first['repository_binding_id']]);binding.update(repository_binding_id=desc['repository_binding_id'],repository_id=peer['selection']['repository_id'],destination_binding_ids=[peer['selection']['backup_destination_id']]);v['records'][desc['repository_binding_id']]=binding
        origin=v['records'][first['origin_ref']];origin['repository_binding_ids'].append(desc['repository_binding_id']);origin['repository_snapshot_refs'].append(desc['repository_snapshot_ref']);attempt=deepcopy(next(a for a in origin['destination_attempts'] if a['attempt_id']==first['destination_attempt_id']));attempt.update(attempt_id=desc['destination_attempt_id'],commit_receipt_ref=desc['commit_receipt_ref'],repository_id=peer['selection']['repository_id'],backup_destination_id=peer['selection']['backup_destination_id']);origin['destination_attempts'].append(attempt)
        manifest=v['records'][first['manifest_ref']];manifest['repository_snapshot_refs'].append(desc['repository_snapshot_ref']);v['records'][origin['manifest_ref']]=deepcopy(manifest);obs['outputs'][0]['snapshots'].append(deepcopy(peer['selection']));obs['achieved_scope']=deepcopy(q['dependency_scope']);r=v['result'];r.update(outcome='completed',error_ref=None,error_projection_ref=None);v['records'][r['receipt_ref']].update(outcome='completed',error_ref=None);v['records'][v['outcome_ref']].update(outcome='succeeded',error_ref=None);v['records'][v['response_ref']].update(result_status='succeeded',error=None);self.pin(v)
        self.assertEqual([],self.check(v));self.assertEqual([],self.central_check(v));self.assertEqual(1,len(q['snapshot_ids']));self.assertEqual(2,len(q['snapshots']))
    def test_same_result_digest_does_not_admit_other_original(self):
        v=self.value();v['records'][v['original_binding_ref']]['permission_snapshot_ref']='permission:foreign';self.assertIn('original_permission_snapshot_ref',self.check(v))
    def test_acknowledgement_receipt_not_foreign(self):
        v=self.value('accepted_export');v['records'][v['response_ref']]['receipt_ref']='receipt:foreign';self.assertIn('accepted_receipt',self.check(v));self.assertTrue(self.central_check(v))
    def test_failed_can_preserve_actual_delivered_output(self):
        v=self.value('failed_export');completed=self.value();obs=v['records']['observation:export'];obs.update(effect_state='known_applied',outputs=deepcopy(completed['records']['observation:export']['outputs']),achieved_scope=deepcopy(completed['records']['observation:export']['achieved_scope']))
        self.assertEqual([],self.check(v));self.assertEqual([],self.central_check(v))
        obs['effect_state']='known_not_applied';self.assertIn('effect_erased',self.check(v));self.assertIn('effect_erased',self.central_check(v))
if __name__=='__main__':unittest.main()
