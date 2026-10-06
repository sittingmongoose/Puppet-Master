#!/usr/bin/env python3
"""Actual six descriptors/config constructors; no candidate/native/model calls."""
import copy
import json
from pathlib import Path
import time
import unittest
import prepare_deferred as d
import bind_at_birth as birth

ROOT=Path(__file__).resolve().parent

class DeferredClosureTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.outbox=d.checked(d.ref(ROOT/'OUTBOX.json'))
        cls.queue=d.checked(cls.outbox['full_queue_freeze_ref'])
        cls.registrations=[d.checked(r) for r in cls.outbox['matched_pair_requests']]
        cls.source=[d.checked(r) for r in cls.outbox['source_prerequisite_requests']]

    def test_01_exact_six_standing_sources_and_native_identity(self):
        selected=d.checked(d.SELECTED)
        self.assertEqual([r['source_slot'] for r in self.registrations],d.SLOTS)
        for reg,row in zip(self.registrations,selected['rows']):
            self.assertEqual(reg['source_scientific_card_refs'],[row['card']])
            card=d.checked({'path':reg['card_path'],'sha256':reg['card_sha256']})
            original=d.checked(row['card'])
            for key in original:
                if key in {'pair_id','source_slot'}:continue
                self.assertEqual(card[key],original[key],(row['source_slot'],key))
            self.assertEqual((reg['family'],reg['candidate_family'],reg['requested_model'],reg['requested_effort']),
                             ('L','Luna','GPT-6 Luna','Max'))
            self.assertEqual(card['requested_route'],'fresh standalone native Codex /goal')
            for stage in reg['stage_jobs']:
                self.assertTrue(stage['native_goal']);self.assertTrue(stage['fresh_standalone_thread'])
                self.assertEqual(stage['max_responses'],None)
        d05=self.registrations[0]
        card=d.checked({'path':d05['card_path'],'sha256':d05['card_sha256']})
        self.assertEqual(card['replaces_unrun_pair'],'D-V05-A')
        self.assertEqual(card['card_version'],'replacement-v1')

    def test_02_finite_counts_without_execution_credit(self):
        self.assertEqual((self.queue['new_native_prerequisite_jobs'],self.queue['matched_comparisons'],
                          self.queue['native_target_stages'],self.queue['mechanical_assembly_stages']),(5,6,14,2))
        self.assertEqual(sum(len(r['stage_jobs']) for r in self.source),5)
        self.assertEqual(sum(len(r['stage_jobs']) for r in self.registrations),14)
        self.assertEqual(sum(len(r['mechanical_stages']) for r in self.registrations),2)
        self.assertEqual(self.outbox['native_starts'],0)
        self.assertTrue(self.queue['prepared_descriptors_not_execution_credit'])
        self.assertFalse(self.queue['automatic_queue_expansion'])
        self.assertEqual(self.queue['maximum_new_source_occupied_seconds'],3000)
        for reg in self.source:
            self.assertFalse(reg['scored_comparison']);self.assertFalse(reg['count_in_diagnostic_denominator'])

    def test_03_original_task_bytes_and_budget_allocations(self):
        for reg in self.registrations:
            card=d.checked({'path':reg['card_path'],'sha256':reg['card_sha256']})
            for arm in ['control','treatment']:
                rows=[r for r in reg['stage_jobs'] if r['arm']==arm]
                self.assertEqual(sum(r['max_seconds'] for r in rows),600)
                for row in rows:
                    original=row['original_source_step'];spec=d.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
                    self.assertEqual(row['max_seconds'],original['max_seconds'])
                    self.assertEqual(row['required_artifacts'],original['required_artifacts'])
                    self.assertEqual(row['stage'],original['stage'])
                    self.assertEqual(spec['max_seconds'],original['max_seconds'])
                    self.assertEqual(spec['requested_parent_response_cap'],original['requested_parent_response_cap'])
                    for name,source in [('brief.md',card['brief_path']),('diagnostic_task.md',card['neutral_task_prompt_path']),
                                        ('arm_instruction.md',card['arm_modifier_paths'][arm]),('output_contract.md','prompts/output_contract.md')]:
                        self.assertEqual(d.p.sha(Path(spec['workspace'])/'inputs'/name),d.p.sha(d.LAB/'cases'/source))

    def test_04_same_common_bytes_source_roles_and_sources_both_arms(self):
        for reg in self.registrations:
            arms={}
            for row in reg['stage_jobs']:
                spec=d.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
                self.assertEqual(spec['source_role_bindings'],reg['source_role_bindings'])
                ws=Path(spec['workspace'])
                common={str(Path(p).relative_to(ws)):sha for p,sha in spec['input_pins'].items()
                        if Path(p).name!='arm_instruction.md' and 'delivery_role_manifest.json' not in p}
                if row['arm'] not in arms:arms[row['arm']]=common
                else:self.assertEqual(arms[row['arm']],common)
            self.assertEqual(arms['control'],arms['treatment'])
            card=d.checked({'path':reg['card_path'],'sha256':reg['card_sha256']})
            expected={'V05':['critique','revision'],'V06':['critique'],'V13':['dependencies']}[card['method_id']]
            self.assertEqual([r['role'] for r in reg['source_role_bindings']],expected)

    def test_05_genuine_v05_three_roles_and_allocated_flash(self):
        for reg in self.registrations[:2]:
            rows=reg['stage_jobs'];self.assertEqual([(r['arm'],r['stage'],r['max_seconds']) for r in rows],
                [('control','final_author',600),('treatment','flash_check',400),('treatment','resolve_final',200)])
            self.assertEqual(rows[1]['prerequisite_job_ids'],[])
            self.assertEqual(rows[2]['prerequisite_job_ids'],[rows[1]['job_id']])
            self.assertEqual([r['inline_only_bundle'] for r in rows],[True,False,True])
            self.assertEqual(rows[1]['required_artifacts'],['out/flash/review.md'])
            for row in rows:self.assertEqual(row['original_source_step']['seed_input_policy']['candidate_roles'],['proposal','critique','revision'])

    def test_06_both_v06_keep_original_factor_native_patch_and_zero_fuzz(self):
        for reg in self.registrations[2:4]:
            self.assertEqual(len(reg['stage_jobs']),2)
            for row in reg['stage_jobs']:
                self.assertTrue(row['both_v06_bundle_excluded']);self.assertFalse(row['inline_only_bundle'])
                spec=d.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
                self.assertNotIn('bundle_profile',spec)
                resource=d.checked(row['resource_binding'])
                self.assertEqual(resource['source_pin'],d.LUNA_CORE)
                self.assertEqual(resource['tools_source_pins'],d.TOOLS_CORE)
            control,treatment=reg['stage_jobs']
            self.assertTrue(control['pipeline_final']);self.assertFalse(treatment['pipeline_final'])
            self.assertEqual(control['required_artifacts'],d.FINAL)
            self.assertEqual(treatment['required_artifacts'][0],'out/amendment.diff')
            assembly=reg['mechanical_stages'][0]
            self.assertFalse(assembly['native_goal']);self.assertEqual(assembly['native_starts'],0)
            self.assertEqual(assembly['prerequisite_job_ids'],[treatment['job_id']])
            self.assertEqual(assembly['mechanical_constructor_ref'],d.ref(d.RUNNER/'exact_assembly.py'))
            self.assertTrue(assembly['zero_fuzz']);self.assertFalse(assembly['premium_semantic_rewrite'])

    def test_07_v13_cold_shared_identity_and_exact_amendment(self):
        for reg in self.registrations[4:]:
            freeze=d.checked(reg['immutable_pair_input_freeze'])
            dag=d.checked(freeze['corrected_dag_ref'])
            for row in reg['stage_jobs']:
                spec=d.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
                self.assertIn(dag['brief_amendment'],Path(spec['prompt_file']).read_text())
                self.assertTrue(row['inline_only_bundle'])
                self.assertEqual(row['original_source_step']['seed_input_policy']['candidate_roles'],['proposal','dependencies'])
            self.assertTrue(freeze['old_failed_and_held_status_costs_bytes_unchanged'])

    def test_08_b_completed_dependency_exact_valid_origin_and_a_failure_no_credit(self):
        imported=d.checked(d.ref(ROOT/'inputs/B_DEPENDENCY_NATIVE_IMPORT.json'));d.imported.verify(imported)
        self.assertEqual(imported['candidate_files']['dependencies']['sha256'],
            'e75c2493bb4c502bf31e83ca18f8018c6627546c465e1c4500f39d0fc468c16e')
        status=d.checked(d.SEED_STATUS)
        failed=next(x for x in status['rows'] if x['job_id']=='SEED-DEV-A-FIXED-BASE-enrichment-s002')
        with self.assertRaisesRegex(ValueError,'completed quiet native'):
            birth.native(failed['freeze_ref'],failed['job_id'],failed['pair_id'],'seed','enrichment',['out/seed/dependencies.json'])
        self.assertFalse(failed['operational_complete']);self.assertTrue(failed['native_quiescent'])
        a=self.registrations[4]
        self.assertEqual(a['source_role_bindings'][0]['job_id'],d.source_job('A','enrichment'))
        self.assertIsNone(a['source_role_bindings'][0]['actual_output_freeze_ref'])

    def test_09_real_selected_config_constructor_all19_without_inference(self):
        reports=[]
        for reg in [*self.source,*self.registrations]:
            for row in reg['stage_jobs']:
                spec=d.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
                bound=d.checked(row['resource_binding'])
                source=d.checked(bound['source_pin']);tools=d.checked(bound['tools_source_pins'])
                self.assertEqual(source['tools_source_pins_sha256'],bound['tools_source_pins']['sha256'])
                config_path=Path(bound['tools_source_pins']['path']).parent/'config.py'
                self.assertEqual(d.ref(config_path),bound['tools_config_constructor'])
                module=d.load_module(config_path,'deferred_actual_config_'+row['job_id'].replace('-','_'))
                deadline=time.monotonic_ns()+60_000_000_000
                profile=spec.get('bundle_profile')
                config=module.mcp_configs(spec['workspace'],deadline_monotonic_ns=deadline,
                    execution_enabled=row['execution_enabled'],public_get=row['public_get'],
                    **({'bundle_profile_path':profile['path']} if profile else {}))
                self.assertEqual(set(config['tool_allowlist']),set(bound['tool_allowlist']))
                self.assertEqual(len(config['tool_allowlist']),5)
                self.assertEqual(bool(config.get('native_bundle_enabled')),bool(profile))
                self.assertIsNone(config.get('resource_profile_path'))
                if profile:
                    self.assertEqual(config['bundle_profile_sha256'],profile['sha256'])
                    self.assertEqual(Path(profile['path']).stat().st_mode&0o777,0o600)
                    manifest=d.checked(d.ref(Path(spec['workspace'])/'inputs/delivery_role_manifest.json'))
                    self.assertEqual(manifest['entries'],[])
                    self.assertEqual((manifest['stage_id'],manifest['arm_id']),(row['job_id'],row['arm']))
                    self.assertFalse((Path(spec['workspace'])/'out/final').exists())
                reports.append({'job_id':row['job_id'],'stage_ref':{'path':row['stage_json'],'sha256':row['stage_sha256']},
                    'actual_config_constructor_ref':d.ref(config_path),'source_pin':bound['source_pin'],
                    'tools_source_pins':bound['tools_source_pins'],'configured_tool_allowlist':config['tool_allowlist'],
                    'actual_bundle_enabled':bool(config.get('native_bundle_enabled')),
                    'bundle_profile_ref':profile,'before_inference_actual_private_resource_allocation':'NOT_RUN; ops birth required',
                    'native_or_model_calls':0})
        self.assertEqual(len(reports),19)
        report={'schema':'er9.deferred-actual-config-zero-inference-verification.v1',
            'actual_prepared_stage_configs':reports,'configurations':19,'pairs':6,'native_or_model_calls':0,
            'actual_private_resource_placement_not_claimed':True,'stage_native_starts_not_claimed':True}
        saved=ROOT/'CONFIG_COMPOSITION_VERIFICATION.json'
        if saved.exists():self.assertEqual(d.checked(d.ref(saved)),report)
        else:d.put(saved,report)

    def test_10_bundle_is_inline_only_genuine_final_and_bad_profile_rejected(self):
        carrier=d.load_module(d.LAB/'dev/tools/versions/v1.4-bundle/bundle_carrier.py','deferred_test_carrier')
        bundle_count=0
        for reg in self.registrations:
            for row in reg['stage_jobs']:
                if not row['inline_only_bundle']:continue
                bundle_count+=1
                spec=d.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
                profile=d.checked(spec['bundle_profile'])
                self.assertEqual(spec['required_artifacts'],d.FINAL)
                self.assertEqual(profile['stage_role'],row['stage'])
                self.assertEqual(profile['actor_binding']['native_goal_id'],None)
                self.assertEqual(profile['method_factors'],[d.checked({'path':reg['card_path'],'sha256':reg['card_sha256']})['method_id']])
                self.assertEqual(carrier.reference_closure(profile,lambda rel:(Path(spec['workspace'])/rel).read_bytes()),{})
                changed=copy.deepcopy(profile);changed['allowed_outputs']['proposal.md']='out/scratch/proposal.md'
                with self.assertRaises(Exception):carrier.validate_profile(changed)
        self.assertEqual(bundle_count,8)

    def test_11_pinned_birth_constructors_and_future_role_ref_honesty(self):
        for reg in [*self.source,*self.registrations]:
            for row in reg['stage_jobs']:
                self.assertEqual(row['birth_binding_constructor_ref'],d.ref(ROOT/'bind_at_birth.py'))
                spec=d.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
                self.assertEqual(d.p.sha(spec['prompt_file']),spec['prompt_sha256'])
                for path,digest in spec['input_pins'].items():self.assertEqual(d.p.sha(path),digest)
                self.assertFalse(row.get('automatic_retry',False))
                self.assertTrue(spec['runtime_binding_required'])
                self.assertIsNone(spec['tools_config'])
        for reg in self.registrations:
            for role in reg['source_role_bindings']:
                if 'job_id' in role:
                    self.assertIsNone(role['actual_output_freeze_ref'])
                    self.assertEqual(role['status'],'PENDING_GENUINE_NATIVE_COMPLETE_QUIET_PROVENANCE')

    def test_12_actual_zero_inference_source_input_constructor(self):
        for reg,reg_ref in zip(self.source,self.outbox['source_prerequisite_requests']):
            row=next(x for x in reg['stage_jobs'] if x['stage']=='critique')
            test_root=ROOT/'zero-inference'/row['job_id']
            plan_path=ROOT/'zero-inference-plans'/(row['job_id']+'.json')
            plan={'schema':'er9.deferred-role-binding-plan.v1','operation':'stage','registration_ref':reg_ref,
                'job_id':row['job_id'],'arm':'seed','predecessor_assignments':{},
                'destination_root':str(test_root),'zero_inference_test_only':True}
            if not plan_path.exists():d.put(plan_path,plan)
            else:self.assertEqual(d.checked(d.ref(plan_path)),plan)
            if test_root.exists():receipt_ref=d.ref(test_root/'ROLE_BIRTH_RECEIPT.json')
            else:receipt_ref=birth.bind(d.ref(plan_path))
            receipt=d.checked(receipt_ref);actual=d.checked(receipt['stage_ref'])
            expected=d.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
            self.assertEqual(actual['prompt_sha256'],expected['prompt_sha256'])
            self.assertEqual(sorted(actual['input_pins'].values()),sorted(expected['input_pins'].values()))
            self.assertEqual((actual['max_seconds'],actual['max_responses']),(600,None))
            self.assertEqual(receipt['model_or_native_calls'],0)
            self.assertTrue(actual['actual_native_runtime_and_resource_binding_still_required'])
            self.assertFalse((test_root/'OUTPUT_FREEZE.json').exists())

if __name__=='__main__':unittest.main(verbosity=2)
