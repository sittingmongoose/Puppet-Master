"""Installed-only ACT120 tests; no native proof or external-stage dependency."""
from copy import deepcopy
from pathlib import Path
import importlib.util,json,os,sys,unittest
from referencing import Resource
ROOT=Path(__file__).resolve().parents[1];CANON=Path(os.environ.get('PM_CANON_ROOT',ROOT));sys.path.insert(0,str(ROOT/'scripts'))
import pm_restore_selected_preview as m
import pm_ui_command_response as ui
class T(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fixtures=json.loads((ROOT/'Plans/restore_selected_preview_contract_fixtures.json').read_text());cls.schema=json.loads((ROOT/m.SCHEMA).read_text())
        spec=importlib.util.spec_from_file_location('preview_gate',CANON/'scripts/pm-new-contracts-verify.py');cls.central=importlib.util.module_from_spec(spec);spec.loader.exec_module(cls.central)
        cls.registry=cls.central.offline_schema_registry().with_resource(cls.schema['$id'],Resource.from_contents(cls.schema))
    def value(self,name='ready_preview'):return deepcopy(next(c['value'] for c in self.fixtures['valid'] if c['name']==name))
    def check(self,v,**override):
        deps=m.fixture_dependencies(v);deps.update(override);return m.validate_preview_result(v['request'],v['result'],v['original_binding_ref'],v['outcome_ref'],v['response_ref'],v['delivery_return_context'],**deps)
    def bundle(self,v):
        orig=v['records'][v['original_binding_ref']]
        return {'response':v['records'][v['response_ref']],'response_ref':v['response_ref'],'owner_result':v['result'],'owner_request':v['request'],'original_binding_ref':v['original_binding_ref'],'delivery_return_context':v['delivery_return_context'],'resolved_outcome_ref':v['outcome_ref'],'outcome':v['records'][v['outcome_ref']],'resolved_owner_result_ref':v['records'][v['outcome_ref']]['owner_result_ref'],'original_response':None,'normalized_request':{'request_ref':orig['request_ref'],'command_id':m.COMMAND,'command_instance_id':orig['identity']['command_instance_id'],'operation_id':orig['identity']['operation_id'],'owner_identity':orig['identity'],**{k:orig[k] for k in ('payload_sha256','idempotency_key','target_generation','dispatch_frame_id')}}}
    def central_check(self,v):
        bundle=self.bundle(v)
        if bundle['response']['replayed']:bundle['original_response']=v['records'][bundle['response']['original_dispatch_id']]
        return ui.response_bundle_failures(bundle,restore_preview_dependencies=m.fixture_dependencies(v))
    def pin(self,v):
        q=v['request'];r=v['result'];orig=v['records'][v['original_binding_ref']];orig.update(arguments=deepcopy(q),payload_sha256=ui.owner_result_digest(q));v['records'][q['request_ref']]=deepcopy(q);o=v['records'][v['outcome_ref']];o.update(payload_sha256=orig['payload_sha256'],owner_result_sha256=ui.owner_result_digest(r));v['records'][o['owner_result_ref']]=deepcopy(r)
    def test_actual_central_metadata(self):
        self.assertEqual(self.schema['x-schema-id'],self.fixtures['contract_schema_id'])
        for group in ('valid','invalid'):
            for c in self.fixtures[group]:
                d,s=self.central.select_definition(self.schema,c,c['value'],require_valid=group=='valid');self.assertEqual([],list(self.central.validator_for(self.schema,s,self.registry).iter_errors(c['value'])),c['name']);errors=ui.contracts().contract_semantic_failures(m.SCHEMA,d,c['value'])
                if group=='valid':self.assertEqual([],errors,c['name'])
                else:self.assertIn(c['semantic_rule'],errors,c['name'])
    def test_actual_central_all_positives(self):
        for c in self.fixtures['valid']:self.assertEqual([],self.central_check(deepcopy(c['value'])),c['name'])
    def test_historical_common_positives(self):
        for c in json.loads((CANON/'Plans/ui_command_response_fixtures.json').read_text())['valid']:self.assertEqual([],ui.response_bundle_failures(c))
    def test_mandatory_actual_dependencies(self):
        self.assertIn('preview_dependencies_missing',ui.response_bundle_failures(self.bundle(self.value())))
        for k in m.fixture_dependencies(self.value()):self.assertIn('preview_dependencies_missing',self.check(self.value(),**{k:None}))
    def test_boolean_is_not_authority(self):
        for k in ('verify_original_admission','verify_source_custody','verify_target_and_mapping','verify_preview_production','validate_legacy_record','check_current_disclosure'):
            self.assertTrue(any('invalid_response' in e for e in self.check(self.value(),**{k:lambda *a:True})),k)
            self.assertTrue(any('revoked' in e for e in self.check(self.value(),**{k:lambda *a:['revoked']})),k)
    def test_native_canonical_preview_hash(self):
        deps=m.fixture_dependencies(self.value());f=deps['canonical_digest']
        self.assertIn('preview_hash',self.check(self.value(),canonical_digest=lambda kind,v:'a'*64 if kind=='preview' else f(kind,v)))
    def test_mapping_substitution(self):
        v=self.value();v['records']['association:preview120']['mapping_evaluations'][0]['requested_mapping']['target_identity_ref']='identity:foreign';self.assertIn('mapping_original',self.central_check(v))
    def test_target_revision(self):
        v=self.value();v['records']['association:preview120']['target_resolution']['actual_target']['target_revision_ref']='revision:foreign';self.assertIn('target_original_revision',self.central_check(v))
    def test_missing_original_member(self):
        v=self.value();v['request']['snapshot_ids'].append('snapshot:foreign');self.pin(v);self.assertIn('selection_exact_set',self.central_check(v))
    def test_mapping_exact_accounting(self):
        v=self.value();entry=deepcopy(v['request']['mapping'][0]);entry['mapping_id']='mapping:second';v['request']['mapping'].append(entry);self.pin(v);self.assertIn('mapping_exact_set',self.central_check(v))
    def test_change_cannot_retarget(self):
        v=self.value();v['records']['preview:120']['changes'][0]['target_identity_ref']='identity:foreign';self.assertIn('change_mapping_identity',self.central_check(v))
    def test_unaccounted_change(self):
        v=self.value();v['records']['preview:120']['changes'].append(deepcopy(v['records']['preview:120']['changes'][0]));self.assertIn('changes_exact_coverage',self.central_check(v))
    def test_dependency_change_explicit(self):
        v=self.value();p=v['records']['preview:120'];change=deepcopy(p['changes'][0]);change['source_identity_ref']='identity:dependency';p['changes'].append(change);v['records']['association:preview120']['dependent_changes']=[{'change_index':1,'required_by_mapping_ids':['mapping:settings'],'closure_evidence_refs':['proof:closure']}];self.assertEqual([],self.central_check(v))
        v['records']['association:preview120']['dependent_changes'][0]['required_by_mapping_ids']=['mapping:foreign'];self.assertIn('dependency_mapping',self.central_check(v))
    def test_ready_does_not_hide_conflict(self):
        v=self.value();v['records']['preview:120']['changes'][0]['conflict']=True;self.assertIn('false_ready',self.central_check(v))
    def test_blocked_is_successful_read_not_execution_admission(self):
        v=self.value('blocked_preview');self.assertEqual([],self.central_check(v));self.assertEqual('blocked',v['records']['receipt:preview120']['terminal_status'])
    def test_receipt_actual_value_join(self):
        v=self.value();v['records']['receipt:preview120']['target_project_ids']=['project:foreign'];self.assertIn('receipt_preview',self.central_check(v))
    def test_receipt_original_correlation(self):
        v=self.value();v['records']['receipt:preview120']['correlation_id']='correlation:foreign';self.assertIn('receipt_original',self.central_check(v))
    def test_preview_expiry(self):
        v=self.value();v['records'][v['response_ref']]['ts']='2026-09-25T10:12:00Z';self.assertIn('preview_expired',self.central_check(v))
    def test_no_fake_verified_source(self):
        v=self.value();v['records']['association:preview120']['sources'][0].update(disposition='unresolved',resolved_source=None,failure_reason='source:unavailable');self.assertIn('preview_source_incoherent',self.central_check(v))
    def test_wrong_manifest(self):
        v=self.value();v['records']['preview:120']['manifest_id']='manifest:foreign';self.assertIn('preview_source',self.central_check(v))
    def test_original_and_preview_cannot_jointly_replace_resolved_backup(self):
        v=self.value();v['request']['backup_id']='backup:foreign';v['records']['preview:120']['backup_id']='backup:foreign';v['records']['receipt:preview120']['backup_id']='backup:foreign';self.pin(v);self.assertEqual([],m.shape('fixture_case',v));self.assertIn('preview_source',self.check(v));self.assertIn('preview_source',self.central_check(v))
    def test_complete_cannot_drop_mapping_to_pending(self):
        v=self.value();e=v['records']['association:preview120']['mapping_evaluations'][0];e.update(disposition='pending',change_indexes=[]);self.assertIn('false_complete',self.central_check(v))
    def test_caller_original_not_focus_fallback(self):
        v=self.value();v['delivery_return_context']['invocation_token']='invocation:foreign';self.assertIn('original_caller',self.central_check(v))
    def test_actual_owner_error_not_relabelled(self):
        v=self.value('failed_after_preview');v['records'][v['outcome_ref']]['error_ref']='error:foreign';self.assertIn('actual_error',self.central_check(v))
    def test_cancelled_null_error_projection(self):
        v=self.value('cancelled_after_preview');self.assertIsNone(v['records'][v['response_ref']]['error']);self.assertIsNotNone(v['result']['error_ref']);self.assertEqual([],self.central_check(v))
    def test_accepted_genuine_nonterminal_work(self):
        v=self.value('accepted_preview');w=v['records'][v['result']['work_ref']];w.update(work_state='completed',result_receipt_ref='receipt:foreign',cancel_available=False,background_available=False);self.assertIn('accepted_work_terminal',self.central_check(v))
    def test_current_disclosure_after_helpers(self):
        called=[]
        def helper(*a):called.append('helper');return []
        def disclose(*a):called.append('disclose');return ['revoked']
        self.assertIn('disclosure:revoked',self.check(self.value(),verify_preview_production=helper,check_current_disclosure=disclose));self.assertEqual(['helper','disclose'],called)
    def test_callback_argument_mutation(self):
        def bad(original,*a):original['actor_ref']='actor:foreign';return []
        self.assertIn('admission_inputs_mutated',self.check(self.value(),verify_original_admission=bad))
    def test_original_input_late_mutation(self):
        v=self.value()
        def bad(*a):v['request']['target']['server_id']='server:foreign';return []
        self.assertIn('preview_inputs_mutated',self.check(v,check_current_disclosure=bad))
    def test_resolved_record_late_mutation(self):
        v=self.value()
        def bad(*a):v['records']['preview:120']['target_server_id']='server:foreign';return []
        self.assertIn('preview_inputs_mutated',self.check(v,check_current_disclosure=bad))
    def test_other_mode_or_activation_not_inferred(self):
        v=self.value();v['request']['restore_mode']='browse';self.assertTrue(m.shape('request',v['request']))
    def test_paths_not_downgraded(self):
        v=self.value();q=v['request'];a=v['records']['association:preview120'];q['mapping'][0].update(source_path_ref='path:source',target_path_ref='path:target');q['target'].update(host_id='host:target',environment_id='environment:target');a['target_resolution'].update(requested_target=deepcopy(q['target']),actual_target=deepcopy(q['target']),filesafe_decision_refs=['filesafe:target']);a['mapping_evaluations'][0]['requested_mapping']=deepcopy(q['mapping'][0]);self.pin(v);self.assertIn('mapping_path_downgrade',self.central_check(v));a['mapping_evaluations'][0].update(resolved_source_path_ref='resolved-path:source',resolved_target_path_ref='resolved-path:target');self.assertEqual([],self.central_check(v))
    def test_cancelled_before_preview_uses_only_production_receipt(self):
        v=self.value('cancelled_before_preview');a=v['records']['association:preview120'];self.assertIsNone(a['preview_ref']);self.assertIsNone(a['preview_receipt_ref']);self.assertIsNotNone(v['result']['production_receipt_ref']);self.assertEqual([],self.central_check(v))
        v['records'][v['result']['production_receipt_ref']]['original_binding_ref']='original:foreign';self.assertIn('production_receipt_original',self.central_check(v))
    def test_no_production_receipt_for_success_or_fake_preview(self):
        v=self.value();failed=self.value('failed_before_preview');v['result']['production_receipt_ref']=failed['result']['production_receipt_ref'];v['records'][v['result']['production_receipt_ref']]=deepcopy(failed['records'][failed['result']['production_receipt_ref']]);self.pin(v);self.assertIn('fabricated_production_receipt',self.central_check(v))
    def test_partial_preview_before_receipt_issuance_retained(self):
        v=self.value('cancelled_before_preview');a=v['records']['association:preview120'];good=self.value();a.update(preview_ref='preview:120',preview_sha256=good['records']['preview:120']['preview_sha256'],mapping_evaluations=deepcopy(good['records']['association:preview120']['mapping_evaluations']));v['records']['preview:120']=deepcopy(good['records']['preview:120']);self.assertIsNone(a['preview_receipt_ref']);self.assertEqual([],self.central_check(v))
        v['result']['outcome']='completed';self.pin(v);self.assertIn('false_complete',self.central_check(v))
    def test_real_aggregate_request_result_resolution(self):
        aggregate=json.loads((CANON/m.BASE).read_text());v=self.value()
        for d,value in [('request',v['request']),('result',v['result'])]:
            candidate=deepcopy(aggregate);candidate['oneOf']=[{'$ref':self.schema['$id']+'#/$defs/'+d}];self.assertEqual([],list(self.central.validator_for(candidate,candidate,self.registry).iter_errors(value)))
    def test_unknown_requires_original_reconciliation(self):
        v=self.value('unknown_preview');v['records']['association:preview120']['reconciliation_ref']=None;self.assertIn('unknown_reconciliation',self.central_check(v))
    def test_actual_all_four_existing_modes(self):
        for mode in ('as_new','in_place','selective','server_full'):
            v=self.value();p=v['records']['preview:120'];receipt=v['records']['receipt:preview120'];v['request']['restore_mode']=mode;p['mode']=mode;receipt['mode']=mode
            if mode=='as_new':
                p.update(identity_policy='new_identity',identity_rewrite_required=True,target_project_ids=['project:planned-new']);receipt.update(identity_rewrite_required=True,target_project_ids=['project:planned-new']);v['request']['target']['project_ids']=['project:planned-new'];target=v['records']['association:preview120']['target_resolution'];target.update(requested_target=deepcopy(v['request']['target']),actual_target=deepcopy(v['request']['target']))
            self.pin(v);self.assertEqual([],self.central_check(v),mode)
    def test_as_new_cannot_reuse_actual_source_project_identity(self):
        v=self.value();v['request']['restore_mode']='as_new';v['records']['preview:120'].update(mode='as_new',identity_policy='new_identity',identity_rewrite_required=True);v['records']['receipt:preview120'].update(mode='as_new',identity_rewrite_required=True);self.pin(v);self.assertIn('as_new_source_identity_reused',self.central_check(v))
    def test_explicit_independent_captures_refused_not_flattened(self):
        v=self.value('failed_before_preview');q=v['request'];a=v['records']['association:preview120'];first=a['sources'][0];second=deepcopy(first);second['selection']['snapshot_id']='snapshot:other-capture';d=second['resolved_source'];d.update(repository_snapshot_ref='snapshot-ref:other',origin_ref='origin:other',manifest_ref='manifest:other',backup_id='backup:other',manifest_id='manifest-id:other',capture_set_id='capture:other',destination_attempt_id='attempt:other',commit_receipt_ref='commit:other')
        old=first['resolved_source'];origin=deepcopy(v['records'][old['origin_ref']]);origin.update(backup_id=d['backup_id'],capture_set_id=d['capture_set_id'],repository_snapshot_refs=[d['repository_snapshot_ref']],manifest_ref=d['manifest_ref']);attempt=deepcopy(next(x for x in origin['destination_attempts'] if x['attempt_id']==old['destination_attempt_id']));attempt.update(attempt_id=d['destination_attempt_id'],remote_snapshot_id=second['selection']['snapshot_id'],commit_receipt_ref=d['commit_receipt_ref']);origin['destination_attempts']=[attempt]
        manifest=deepcopy(v['records'][old['manifest_ref']]);manifest.update(backup_id=d['backup_id'],manifest_id=d['manifest_id'],capture_set_id=d['capture_set_id'],repository_snapshot_refs=[d['repository_snapshot_ref']]);v['records'][d['origin_ref']]=origin;v['records'][d['manifest_ref']]=manifest
        q['snapshots'].append({'snapshot':deepcopy(second['selection']),'repository_snapshot_ref':d['repository_snapshot_ref']});q['snapshot_ids'].append(second['selection']['snapshot_id']);a['sources'].append(second);v['records'][v['result']['error_ref']].update(error_code='incompatible_backup',message_code='independent_captures_not_supported');self.pin(v);self.assertEqual([],self.central_check(v))
        good=self.value();a.update(preview_ref='preview:120',preview_receipt_ref='receipt:preview120',preview_sha256=good['records']['preview:120']['preview_sha256']);v['records']['preview:120']=deepcopy(good['records']['preview:120']);v['records']['receipt:preview120']=deepcopy(good['records']['receipt:preview120']);self.assertIn('preview_source_incoherent',self.central_check(v))
    def test_replay_same_original_result(self):
        v=self.value();response=v['records'][v['response_ref']];old=deepcopy(response);original_id=response['dispatch_id'];v['records'][original_id]=old;response.update(replayed=True,original_dispatch_id=original_id,dispatch_id='dispatch:preview120:replay');self.assertEqual([],self.central_check(v));response['receipt_ref']='receipt:foreign';self.assertTrue(self.central_check(v))
if __name__=='__main__':unittest.main()
