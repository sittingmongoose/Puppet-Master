#!/usr/bin/env python3
"""DEC013 original inputs/donor-only mapping/actual3000 builder, no Goals."""
import hashlib
import json
import os
from pathlib import Path
import tempfile
import time
import unittest
from unittest.mock import patch
import prepare_revision as p
import bind_D05A_inputs as donor

ROOT=Path(__file__).resolve().parent

class RevisionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.outbox=p.checked(p.ref(ROOT/'OUTBOX.json'))
        cls.reg=p.checked(cls.outbox['source_registration_ref']);cls.row=cls.reg['stage_jobs'][0]
        cls.spec=p.checked({'path':cls.row['stage_json'],'sha256':cls.row['stage_sha256']})
        cls.rule=p.checked(cls.outbox['donor_rule_ref'])
        cls.source_view=p.checked(cls.outbox['source_binding_view_ref'])
        cls.target_view=p.checked(cls.outbox['D05A_binding_view_ref'])
        cls.controls=p.controls()
        cls.resource=p.d.load_module(p.d.LAB/'dev/luna-route/resource_slice.py','dec013_resource_fixture')
        route=p.checked(p.ref(p.OLD/'ACTUAL_ROUTE_BINDING.json'))
        cls.prepare=p.d.load_module(Path(route['native_source_pin_ref']['path']).parent/'clock_prepare.py','dec013_actual_production_prepare')
        (ROOT/'zero-inference').mkdir(exist_ok=True)

    def fixture(self,folder):
        ws=folder/'workspace';private=folder/'private';ws.mkdir();private.mkdir();(ws/'inputs').mkdir();(ws/'out').mkdir()
        body='SYNTHETIC source-only3000 revision fixture\r\nα\t '
        (ws/'TASK.md').write_bytes(body.encode())
        birth=time.monotonic_ns()-1_000_000_000;total=birth+3000_000_000_000;action=total-15_000_000_000
        resource={'schema':'er9.luna.private-memory-profile.v1','label':self.row['job_id'],
            'slice_unit':'er9mem'+'b'*32+'.slice','slice_cgroup':'/user.slice/user-'+str(os.getuid())+'.slice/user@'+str(os.getuid())+'.service/er9mem'+'b'*32+'.slice',
            'aggregate_memory_max_bytes':self.resource.TOTAL,'component_memory_max_bytes':self.resource.CAPS,
            'memory_swap_max_bytes':0,'original_birth_monotonic_ns':birth,'original_total_stop_monotonic_ns':total,
            'reader_sha256':p.d.p.sha(p.d.LAB/'dev/luna-route/resource_slice.py'),'synthetic_only_no_kernel_allocation':True}
        profile=folder/'resource.json';profile.write_text(json.dumps(resource));profile.chmod(0o600)
        return {'workspace':ws,'private':private,'label':self.row['job_id'],'original_birth_monotonic_ns':birth,
            'max_seconds':3000,'native_stop_monotonic_ns':action,'total_stop_monotonic_ns':total,'resource_profile':profile,
            'clock_declaration':Path(self.spec['clock_declaration']['path']),
            'clock_declaration_sha256':self.spec['clock_declaration']['sha256'],
            'execution_enabled':True,'public_get':True,'scientific_body':body,'goal_objective':body,
            'source_prompt_sha256':hashlib.sha256(body.encode()).hexdigest(),
            'source_TASK_sha256':hashlib.sha256(body.encode()).hexdigest(),'bundle_profile':None}

    def test_01_one_new_source3000_old450_null_cap_family_caps_unchanged(self):
        self.assertEqual((len(self.reg['stage_jobs']),self.outbox['native_source_roles'],self.outbox['new_target_native_jobs']),(1,1,0))
        self.assertEqual(self.row['max_seconds'],3000);self.assertIsNone(self.row['max_responses'])
        self.assertEqual(self.spec['new_original_allocation_seconds'],3000);self.assertEqual(self.spec['old_ended_allocation_seconds'],450)
        self.assertEqual((self.row['candidate_family'],self.row['requested_model'],self.row['requested_effort']),('Luna','GPT-6 Luna','Max'))
        self.assertFalse(self.reg['scored_comparison']);self.assertFalse(self.reg['count_in_diagnostic_denominator'])
        self.assertFalse(self.reg['automatic_retry']);self.assertEqual(self.reg['native_starts'],0)
        original=p.checked(self.spec['old_ended_revision_stage_ref'])
        for k in ['max_responses','requested_parent_response_cap','required_artifacts','execution_enabled','public_get']:
            self.assertEqual(self.spec[k],original[k])
        before=p.checked(p.checked(p.SELECTION)['source_registration_ref'])
        oldrow=next(r for r in before['stage_jobs'] if r['stage']=='revision')
        caps=p.checked(self.row['resource_binding']);oldcaps=p.checked(oldrow['resource_binding'])
        for k in ['aggregate_memory_max_bytes','aggregate_swap_max_bytes','outer_worker_memory_max_bytes','host_reserve_bytes','source_pin','tools_source_pins']:
            self.assertEqual(caps[k],oldcaps[k])
        self.assertNotIn('bundle_profile',self.spec)

    def test_02_exact_scientific_prefix_and39_R4_native_roles(self):
        scientific=Path(self.spec['scientific_task_prefix_ref']['path']).read_bytes()
        self.assertEqual(hashlib.sha256(scientific).hexdigest(),'458e79280fd988d849c6b449ec5267cf2cd6257ae40bd14bcf2aba6a33c693f9')
        self.assertTrue(Path(self.spec['prompt_file']).read_bytes().startswith(scientific))
        admin=Path(self.spec['prompt_file']).read_bytes()[len(scientific):]
        self.assertIn(b'ONE NEW',admin);self.assertIn(b'3000 seconds',admin);self.assertIn(b'ended 450-second',admin)
        inputs=p.checked(self.outbox['source_input_freeze_ref'])
        self.assertEqual(len(inputs['original_R4_input_pins']),39)
        base=p.checked(inputs['base_manifest_ref']);p.d.imported.verify(base)
        self.assertEqual(set(base['candidate_files']),{'proposal','source_catalog','witness_catalog','lead_inventory'})
        old=p.checked(self.spec['old_ended_revision_stage_ref'])
        for path,sha in inputs['original_R4_input_pins'].items():
            current=Path(self.spec['workspace'])/Path(path).relative_to(old['workspace'])
            self.assertEqual(p.d.p.sha(current),sha)
        self.assertEqual(self.spec['required_artifacts'],['out/seed/revision.md','out/seed/sources.json','out/seed/witnesses.json','out/seed/leads.json','out/seed/dependencies.json'])

    def test_03_only_exact_complete_current_critic_no_failed_revision_input(self):
        selected=p.checked(p.SELECTION);critic=selected['actual_critic']
        self.assertEqual(self.row['prerequisite_job_ids'],[critic['job_id']])
        self.assertEqual(self.row['all_same_arm_prior_job_ids'],[critic['job_id']])
        self.assertTrue(self.spec['current_critic_already_opaque_byte_bound'])
        self.assertFalse(self.spec['prior_binding_required'])
        freeze,receipt,identity=p.birth.native(critic['freeze_ref'],critic['job_id'],p.SOURCE_PAIR,'seed','critique',['out/seed/critique.md'])
        self.assertEqual((identity['model'],identity['effort']),('gpt-6-luna','max'))
        self.assertTrue(identity['fresh_empty_history']);self.assertTrue(identity['instruction_sources_empty'])
        actual=p.checked(self.outbox['source_input_freeze_ref'])
        self.assertEqual(actual['actual_current_critic_freeze_ref'],critic['freeze_ref'])
        self.assertFalse(actual['failed_revision_output_bodies_supplied'])
        for artifact in freeze['artifacts']:
            path=Path(self.spec['workspace'])/'inputs/prior'/critic['job_id']/artifact['relative_path']
            self.assertEqual(p.d.p.sha(path),artifact['sha256'])
        for path in self.spec['input_pins']:
            self.assertNotIn(selected['failed_revision']['job_id'],path)

    def test_04_both_pending_D05A_three_original_targets_donor_only_views(self):
        selection=p.checked(p.SELECTION)
        self.assertTrue(selection['botharm_alltargetGoal0_noIntent_at_observation'])
        self.assertEqual([r['native_goal_starts'] for r in selection['pending_D05A']],[0,0,0])
        original=p.checked(self.rule['original_unchanged_target_registration_ref'])
        self.assertEqual(len(self.target_view['stage_jobs']),3)
        self.assertEqual([r['job_id'] for r in original['stage_jobs']],[r['job_id'] for r in self.target_view['stage_jobs']])
        for old,row in zip(original['stage_jobs'],self.target_view['stage_jobs']):
            for k in old:
                if k=='source_role_bindings':continue
                self.assertEqual(old[k],row[k],k)
        self.assertTrue(self.source_view['binding_view_only']);self.assertTrue(self.source_view['native_admission_forbidden'])
        self.assertTrue(self.target_view['binding_view_only']);self.assertTrue(self.target_view['native_admission_forbidden'])
        self.assertEqual([r['role'] for r in self.target_view['source_role_bindings']],['critique','revision'])
        self.assertEqual(self.target_view['source_role_bindings'][0]['job_id'],selection['actual_critic']['job_id'])
        self.assertEqual(self.target_view['source_role_bindings'][1]['job_id'],p.NEW_JOB)
        self.assertIsNone(self.rule['new_revision_freeze_ref']);self.assertIsNone(self.rule['new_revision_Goal_id'])
        self.assertFalse(self.rule['new_target_jobs_or_Task_budget_family_method_changes'])

    def test_05_actual_production3000_clock_core_fixture_no_process_Goal(self):
        with tempfile.TemporaryDirectory(prefix='actual3000-',dir=ROOT/'zero-inference') as temporary:
            args=self.fixture(Path(temporary));before=(args['workspace']/'TASK.md').read_bytes()
            with patch('subprocess.Popen',side_effect=AssertionError('process prohibited')),patch('subprocess.run',side_effect=AssertionError('process prohibited')):
                result=self.prepare.prepare_stage(**args)
            cfg=result['config'];clock=cfg['initial_clock_metadata']['stage_clock']
            self.assertEqual(len(cfg['tool_allowlist']),5);self.assertFalse(cfg['native_bundle_enabled'])
            self.assertEqual(clock['original_stage_allocation_seconds'],3000)
            self.assertEqual(clock['original_birth_monotonic_ns'],args['original_birth_monotonic_ns'])
            self.assertEqual(clock['original_candidate_action_deadline_monotonic_ns'],args['native_stop_monotonic_ns'])
            self.assertEqual(clock['original_total_cleanup_stop_monotonic_ns']-clock['original_birth_monotonic_ns'],3000_000_000_000)
            self.assertEqual(clock['original_total_cleanup_stop_monotonic_ns']-clock['original_candidate_action_deadline_monotonic_ns'],15_000_000_000)
            self.assertEqual(result['native_input'][0]['text'],args['scientific_body'])
            self.assertEqual(result['native_input'][1]['text'],cfg['initial_clock_metadata_utf8'])
            self.assertEqual((args['workspace']/'inputs/STAGE_CLOCK.json').read_bytes(),result['native_input'][1]['text'].encode())
            self.assertEqual((args['workspace']/'TASK.md').read_bytes(),before)
            self.assertFalse(result['input_binding']['scientific_text_or_goal_objective_appended'])
            self.assertFalse(result['native_calls_or_processes_started']);self.assertFalse(list((args['workspace']/'out').iterdir()))
        self.assertFalse((Path(self.spec['workspace'])/'inputs/STAGE_CLOCK.json').exists())

    def test_06_wrong450_resource_clock_join_rejected(self):
        with tempfile.TemporaryDirectory(prefix='old450-negative-',dir=ROOT/'zero-inference') as temporary:
            args=self.fixture(Path(temporary))
            resource=json.loads(args['resource_profile'].read_text())
            resource['original_total_stop_monotonic_ns']=args['original_birth_monotonic_ns']+450_000_000_000
            args['resource_profile'].write_text(json.dumps(resource))
            with self.assertRaises(ValueError):self.prepare.prepare_stage(**args)

    def test_07_strict_missing_dependencies_not_file_presence_promoted(self):
        with tempfile.TemporaryDirectory(prefix='strict-negative-',dir=ROOT/'zero-inference') as temporary:
            root=Path(temporary);body=root/'revision.md';body.write_bytes(b'SYNTHETIC infrastructure fixture only')
            freeze={'job_id':p.NEW_JOB,'pair_id':p.SOURCE_PAIR,'arm':'seed','stage':'revision',
                'operational_complete':False,'native_quiescent':True,'native_goal_starts':0,
                'artifacts':[{'relative_path':'seed/revision.md','path':str(body),'sha256':p.d.p.sha(body),'bytes':body.stat().st_size}]}
            path=root/'freeze.json';path.write_text(json.dumps(freeze))
            with self.assertRaisesRegex(ValueError,'completed quiet native'):
                p.birth.native(p.ref(path),p.NEW_JOB,p.SOURCE_PAIR,'seed','revision',self.row['required_artifacts'])

    def test_08_donor_wrong_revision_identity_and_alternative_critic_rejected(self):
        with tempfile.TemporaryDirectory(prefix='donor-negative-',dir=ROOT/'zero-inference') as temporary:
            root=Path(temporary)
            critic=self.rule['existing_native_critic_ref']
            wrong=root/'synthetic_wrong_revision_metadata.json';wrong.write_text(json.dumps({'job_id':'WRONG-REVISION'}))
            plan={'schema':'er9.dec013-donor-input-binding-plan.v1','operation':'pair_inputs',
                'registration_ref':self.outbox['D05A_binding_view_ref'],'source_registration_ref':self.outbox['source_binding_view_ref'],
                'source_role_assignments':{'critique':{'freeze_ref':critic['freeze_ref'],'actual_stage_ref':critic['stage_ref']},
                    'revision':{'freeze_ref':p.ref(wrong),'actual_stage_ref':p.ref(wrong)}}}
            path=root/'plan.json';path.write_text(json.dumps(plan))
            with self.assertRaisesRegex(ValueError,'Old failed revision cannot supply'):donor.bind(p.ref(path))
            plan['source_role_assignments']['critique']['freeze_ref']=p.ref(wrong)
            different=root/'different_critic_plan.json';different.write_text(json.dumps(plan))
            with self.assertRaisesRegex(ValueError,'No alternative or failed current critic'):donor.bind(p.ref(different))

    def test_09_old002_137_bytes_and_unchanged_strict_binder(self):
        identity=p.checked(self.outbox['old002_byte_identity_ref'])
        self.assertEqual(len(identity['files']),137)
        for row in identity['files']:self.assertEqual(p.d.p.sha(row['path']),row['sha256'])
        old_pin=p.checked(p.ref(p.OLD/'SOURCE_PIN.json'))
        expected=next(r for r in old_pin['source_files'] if r['path']==str(p.PARENT/'bind_at_birth.py'))
        self.assertEqual(p.ref(p.PARENT/'bind_at_birth.py'),expected)
        self.assertEqual(self.outbox['matched_comparisons_added'],0)

    def test_10_complete_flag_fixture_cannot_skip_required_dependency_artifact(self):
        # Pure metadata fixture only: no actual Goal, activation, source body or
        # real identity is created or credited. Test the required-path guard
        # independently of the earlier operational/native-status guard.
        with tempfile.TemporaryDirectory(prefix='required-path-fixture-',dir=ROOT/'zero-inference') as temporary:
            folder=Path(temporary);artifacts=[]
            for name in ['revision.md','sources.json','witnesses.json','leads.json']:
                path=folder/name;path.write_bytes(b'SYNTHETIC strict-gate fixture only')
                artifacts.append({'relative_path':'seed/'+name,'path':str(path),
                    'sha256':p.d.p.sha(path),'bytes':path.stat().st_size})
            receipt={'fixture_only_no_native_Goal':True,'native_goal_set_receipt':{'goal':{'status':'active','threadId':'SYNTHETIC-NO-NATIVE-GOAL'}},
                'native_goal_terminal_receipt':{'goal':{'status':'complete','threadId':'SYNTHETIC-NO-NATIVE-GOAL'}},
                'identity':{'model':'gpt-6-luna','effort':'max'},'model_fallback_allowed':False}
            receipt_path=folder/'synthetic_receipt.json';receipt_path.write_text(json.dumps(receipt))
            freeze={'fixture_only_no_native_Goal':True,'job_id':p.NEW_JOB,'pair_id':p.SOURCE_PAIR,'arm':'seed','stage':'revision',
                'operational_complete':True,'native_quiescent':True,'native_goal_starts':1,
                'native_receipt':p.ref(receipt_path),'artifacts':artifacts}
            path=folder/'synthetic_freeze.json';path.write_text(json.dumps(freeze))
            with self.assertRaisesRegex(ValueError,'Actual required role absent: seed/dependencies.json'):
                p.birth.native(p.ref(path),p.NEW_JOB,p.SOURCE_PAIR,'seed','revision',self.row['required_artifacts'])

if __name__=='__main__':unittest.main(verbosity=2)
