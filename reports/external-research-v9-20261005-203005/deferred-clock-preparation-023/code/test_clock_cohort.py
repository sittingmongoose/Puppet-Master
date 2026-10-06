#!/usr/bin/env python3
"""Exact paired clock descriptors and actual production builders, no inference.

All bodies/objectives used by native preparation fixtures are SYNTHETIC. Real
case Task/input bytes are hash/copy/prefix checked without semantic inspection.
"""
import copy
import hashlib
import json
import os
from pathlib import Path
import tempfile
import time
import unittest
from unittest.mock import patch
import prepare_clock as c
import input_binding as ib

ROOT=Path(__file__).resolve().parent

def sha(raw):return hashlib.sha256(raw).hexdigest()

class ClockCohortTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.route,cls.pin=c.check_frozen_sources()
        cls.outbox=c.checked(c.ref(ROOT/'OUTBOX.json'))
        cls.freeze=c.checked(cls.outbox['full_cohort_freeze_ref'])
        cls.source=[c.checked(r) for r in cls.outbox['source_prerequisite_requests']]
        cls.targets=[c.checked(r) for r in cls.outbox['matched_pair_requests']]
        cls.rows=[r for reg in cls.source+cls.targets for r in reg['stage_jobs']]
        cls.prepare=c.load(Path(cls.route['native_source_pin_ref']['path']).parent/'clock_prepare.py','actual_clock_cohort_prepare')
        cls.resource=c.load(c.d.LAB/'dev/luna-route/resource_slice.py','actual_clock_cohort_resource_reader')
        (ROOT/'zero-inference').mkdir(exist_ok=True)

    def fixture(self,folder,row,unknown=False):
        spec=c.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
        ws=folder/'workspace';private=folder/'private';ws.mkdir();private.mkdir()
        (ws/'inputs').mkdir();(ws/'out').mkdir()
        # No real scientific source, seed or candidate body is read by this builder.
        science='SYNTHETIC unchanged first native text\r\nα\t  '
        (ws/'TASK.md').write_bytes(science.encode())
        birth=time.monotonic_ns()-1_000_000_000
        total=birth+row['max_seconds']*1_000_000_000
        action=None if unknown else total-15_000_000_000
        resource={'schema':'er9.luna.private-memory-profile.v1','label':row['job_id'],
            'slice_unit':'er9mem'+'a'*32+'.slice',
            'slice_cgroup':'/user.slice/user-'+str(os.getuid())+'.slice/user@'+str(os.getuid())+'.service/er9mem'+'a'*32+'.slice',
            'aggregate_memory_max_bytes':self.resource.TOTAL,'component_memory_max_bytes':self.resource.CAPS,
            'memory_swap_max_bytes':0,'original_birth_monotonic_ns':birth,'original_total_stop_monotonic_ns':total,
            'reader_sha256':c.d.p.sha(c.d.LAB/'dev/luna-route/resource_slice.py'),
            'synthetic_only_no_kernel_allocation':True}
        resource_path=folder/'resource.json';resource_path.write_text(json.dumps(resource));resource_path.chmod(0o600)
        bundle=None
        if row['inline_only_bundle']:
            manifest=ws/'inputs/delivery_role_manifest.json'
            original=Path(spec['workspace'])/'inputs/delivery_role_manifest.json'
            manifest.write_bytes(original.read_bytes())
            bundle=folder/'bundle.json';bundle.write_bytes(Path(spec['bundle_profile']['path']).read_bytes());bundle.chmod(0o600)
        return {'workspace':ws,'private':private,'label':row['job_id'],
            'original_birth_monotonic_ns':birth,'max_seconds':row['max_seconds'],
            'native_stop_monotonic_ns':action,'total_stop_monotonic_ns':total,'resource_profile':resource_path,
            'clock_declaration':Path(spec['clock_declaration']['path']),
            'clock_declaration_sha256':spec['clock_declaration']['sha256'],
            'execution_enabled':row['execution_enabled'],'public_get':row['public_get'],
            'scientific_body':science,'goal_objective':science,
            'source_prompt_sha256':sha(science.encode()),'source_TASK_sha256':sha(science.encode()),
            'bundle_profile':bundle}

    def test_01_old295_bytes_and_original_failures_untouched(self):
        self.assertEqual(c.original_bytes_unchanged(),295)
        scope=c.checked(c.ref(ROOT/'ELIGIBILITY_SCOPE.json'))
        self.assertEqual(scope['eligible_original_source_slots'],c.ELIGIBLE)
        self.assertEqual(scope['source_retests'],3);self.assertEqual(scope['previously_blocked_revisions'],2)
        self.assertEqual(len(scope['eligible_target_stage_ids']),12)
        self.assertEqual([r['native_goal_starts'] for r in scope['excluded_entered_pair']['rows']],[1,1])
        self.assertEqual([r['status'] for r in scope['excluded_entered_pair']['rows']],['FAILED','FAILED'])
        self.assertEqual(scope['excluded_entered_pair']['pair_id'],'D-V13-B-DEFERRED-R001')

    def test_02_full_finite_seventeen_stage_cohort_and_eligibility(self):
        self.assertEqual((len(self.source),len(self.targets),len(self.rows)),(2,5,17))
        self.assertEqual((self.freeze['source_native_jobs'],self.freeze['target_native_jobs']), (5,12))
        self.assertEqual(sum(r['max_seconds'] for reg in self.source for r in reg['stage_jobs']),3000)
        self.assertEqual(sum(r['max_seconds'] for reg in self.targets for r in reg['stage_jobs']),6000)
        self.assertEqual([r['source_slot'] for r in self.targets],c.ELIGIBLE)
        self.assertNotIn('D-V13-B',[r['source_slot'] for r in self.targets])
        self.assertTrue(self.freeze['full_both_arm_source_runtime_tools_Task_input_and_clock_constructor_choices_frozen_before_any_repair_donor_or_target_goal'])
        self.assertFalse(self.freeze['automatic_cohort_expansion'])
        self.assertFalse(self.freeze['new_hypothesis_or_extra32_credit'])
        self.assertEqual((self.outbox['native_model_calls'],self.outbox['native_goals']),(0,0))
        proof={r['job_id']:r for r in c.checked(c.ELIGIBILITY)['jobs']}
        for reg in self.targets:
            for row in reg['stage_jobs']:
                before=proof[row['source_job_id']]
                self.assertEqual(before['native_goal_starts'],0);self.assertEqual(before['launch_intent_events'],[])

    def test_03_original_science_Task_inputs_family_budgets_roles(self):
        for row in self.rows:
            spec=c.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
            previous=c.checked(spec['original_stage_ref'])
            scientific=Path(spec['scientific_task_prefix_ref']['path']).read_bytes()
            self.assertEqual(sha(scientific),spec['original_scientific_task_ref']['sha256'])
            self.assertTrue(Path(spec['prompt_file']).read_bytes().startswith(scientific))
            for key in ['max_seconds','max_responses','requested_parent_response_cap','required_artifacts']:
                self.assertEqual(spec[key],previous[key],(row['job_id'],key))
            old_pins={str(Path(p).relative_to(previous['workspace'])):digest for p,digest in previous['input_pins'].items()
                      if Path(p).name!='delivery_role_manifest.json'}
            current={str(Path(p).relative_to(spec['workspace'])):digest for p,digest in spec['input_pins'].items()
                      if Path(p).name!='delivery_role_manifest.json'}
            self.assertEqual(old_pins,current)
            self.assertEqual((row['candidate_family'],row['requested_family'],row['requested_model'],row['requested_effort']),
                             ('Luna','Luna','GPT-6 Luna','Max'))
            self.assertIsNone(row['max_responses']);self.assertTrue(row['fresh_standalone_thread'])
            self.assertEqual(row['birth_binding_constructor_ref'],c.ref(ROOT/'input_binding.py'))
            self.assertTrue(spec['runtime_binding_required']);self.assertIsNone(spec['tools_config'])

    def test_04_both_arm_common_inputs_exact_mechanism_and_allocations(self):
        for reg in self.targets:
            arms={}
            for arm in ['control','treatment']:
                rows=[r for r in reg['stage_jobs'] if r['arm']==arm]
                self.assertEqual(sum(r['max_seconds'] for r in rows),600)
                row=rows[0];spec=c.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
                arms[arm]={str(Path(p).relative_to(spec['workspace'])):digest for p,digest in spec['input_pins'].items()
                    if Path(p).name not in ['delivery_role_manifest.json','arm_instruction.md']}
                self.assertEqual(spec['source_role_bindings'],reg['source_role_bindings'])
            self.assertEqual(arms['control'],arms['treatment'])
            card=c.checked({'path':reg['card_path'],'sha256':reg['card_sha256']})
            if card['method_id']=='V05':
                self.assertEqual([(r['arm'],r['stage'],r['max_seconds']) for r in reg['stage_jobs']],
                    [('control','final_author',600),('treatment','flash_check',400),('treatment','resolve_final',200)])
            if card['method_id']=='V13':
                old=c.checked(reg['original_registration_ref'])
                oldfreeze=c.checked(old['immutable_pair_input_freeze']);dag=c.checked(oldfreeze['corrected_dag_ref'])
                for row in reg['stage_jobs']:
                    spec=c.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
                    self.assertIn(dag['brief_amendment'].encode(),Path(spec['scientific_task_prefix_ref']['path']).read_bytes())

    def test_05_V06_both_core_native_amendment_and_zero_fuzz_retained(self):
        assembly_count=0
        for reg in self.targets:
            card=c.checked({'path':reg['card_path'],'sha256':reg['card_sha256']})
            if card['method_id']!='V06':continue
            for row in reg['stage_jobs']:
                spec=c.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
                self.assertFalse(row['inline_only_bundle']);self.assertNotIn('bundle_profile',spec)
                self.assertTrue(row['both_v06_bundle_excluded'])
            control,treatment=reg['stage_jobs'];self.assertEqual(control['required_artifacts'],c.d.FINAL)
            self.assertEqual(treatment['required_artifacts'][0],'out/amendment.diff')
            step=reg['mechanical_stages'][0];assembly_count+=1
            self.assertTrue(step['zero_fuzz']);self.assertFalse(step['premium_semantic_rewrite'])
            self.assertFalse(step['native_goal']);self.assertEqual(step['native_starts'],0)
            self.assertEqual(step['prerequisite_job_ids'],[treatment['job_id']])
            self.assertEqual(step['mechanical_constructor_ref'],c.ref(c.d.RUNNER/'exact_assembly.py'))
        self.assertEqual(assembly_count,2)

    def test_06_static_declarations_exact_and_reserved_clock_absent(self):
        declaration=c.load(c.DECLARATION['path'],'cohort_exact_decl')
        for row in self.rows:
            spec=c.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
            self.assertEqual(c.checked(spec['clock_declaration']),declaration.declaration(row['job_id']))
            self.assertFalse((Path(spec['workspace'])/'inputs/STAGE_CLOCK.json').exists())
            self.assertEqual(spec['goal_objective_policy'],'unchanged')
            self.assertIsNone(spec['actual_new_native_goal_id_before_birth'])
            self.assertIsNone(spec['actual_clock_profile_hash_before_birth'])
            self.assertEqual(spec['clock_declaration'],row['clock_declaration_ref'])
        self.assertEqual(sum(bool(r['inline_only_bundle']) for r in self.rows),6)

    def test_07_actual_production_builder_all17_synthetic_body_no_process(self):
        reports=[]
        for row in self.rows:
            with tempfile.TemporaryDirectory(prefix='actual17-',dir=ROOT/'zero-inference') as temporary:
                args=self.fixture(Path(temporary),row);before=(args['workspace']/'TASK.md').read_bytes()
                with patch('subprocess.Popen',side_effect=AssertionError('process prohibited')),patch('subprocess.run',side_effect=AssertionError('process prohibited')):
                    result=self.prepare.prepare_stage(**args)
                cfg=result['config'];clock=cfg['initial_clock_metadata']['stage_clock']
                self.assertEqual(len(cfg['tool_allowlist']),5)
                self.assertEqual(set(cfg['tool_allowlist']),set(c.checked(row['resource_binding'])['tool_allowlist']))
                self.assertEqual(cfg['native_bundle_enabled'],row['inline_only_bundle'])
                self.assertEqual(cfg['deadline_monotonic_ns'],args['native_stop_monotonic_ns'])
                self.assertEqual(clock['original_birth_monotonic_ns'],args['original_birth_monotonic_ns'])
                self.assertEqual(clock['original_candidate_action_deadline_monotonic_ns'],args['native_stop_monotonic_ns'])
                self.assertEqual(clock['original_total_cleanup_stop_monotonic_ns'],args['total_stop_monotonic_ns'])
                self.assertEqual(clock['original_stage_allocation_seconds'],row['max_seconds'])
                self.assertEqual(clock['original_total_cleanup_stop_monotonic_ns']-clock['original_candidate_action_deadline_monotonic_ns'],15_000_000_000)
                self.assertEqual(result['native_input'][0]['text'],args['scientific_body'])
                self.assertEqual(result['native_input'][1]['text'],cfg['initial_clock_metadata_utf8'])
                self.assertEqual((args['workspace']/'inputs/STAGE_CLOCK.json').read_bytes(),result['native_input'][1]['text'].encode())
                self.assertEqual(result['input_binding']['actual_initial_text_count'],2)
                self.assertEqual(result['input_binding']['goal_objective_sha256'],sha(args['goal_objective'].encode()))
                self.assertFalse(result['input_binding']['scientific_text_or_goal_objective_appended'])
                self.assertEqual((args['workspace']/'TASK.md').read_bytes(),before)
                self.assertFalse(list((args['workspace']/'out').iterdir()))
                self.assertFalse(result['native_calls_or_processes_started'])
                reports.append({'job_id':row['job_id'],'stage_ref':{'path':row['stage_json'],'sha256':row['stage_sha256']},
                    'max_seconds':row['max_seconds'],'bundle':row['inline_only_bundle'],
                    'actual_production_prepare_ref':c.ref(Path(self.route['native_source_pin_ref']['path']).parent/'clock_prepare.py'),
                    'config_constructor_ref':c.ref(Path(c.TOOLS['path']).parent/'config.py'),
                    'original_action_reserve_seconds':15,'initial_native_text_count':2,'objective_appended':False,
                    'body_and_resource_fixture':'SYNTHETIC; no actual candidate/source fact or kernel allocation',
                    'native_model_or_process_calls':0,'tests_passed':True})
        path=ROOT/'ACTUAL17_CONSTRUCTOR_VERIFICATION.json'
        report={'schema':'er9.deferred-clock-actual17-constructor-verification.v1','stages':reports,
            'actual_production_constructors':17,'actual_candidate_goals':0,'body_fixtures':'SYNTHETIC ONLY',
            'actual_ops_resource_placement_or_future_native_goal_completion_not_claimed':True}
        if path.exists():self.assertEqual(c.checked(c.ref(path)),report)
        else:c.put(path,report)

    def test_08_UNKNOWN_action_never_cleanup_fallback(self):
        for row in [self.rows[0],next(r for r in self.rows if r['inline_only_bundle'])]:
            with tempfile.TemporaryDirectory(prefix='unknown-',dir=ROOT/'zero-inference') as temporary:
                args=self.fixture(Path(temporary),row,unknown=True)
                result=self.prepare.prepare_stage(**args);clock=result['config']['initial_clock_metadata']['stage_clock']
                self.assertEqual(clock['action_deadline_status'],'UNKNOWN')
                self.assertIsNone(clock['remaining_candidate_action_ms'])
                self.assertIsNone(clock['original_candidate_action_deadline_monotonic_ns'])
                self.assertEqual(clock['original_total_cleanup_stop_monotonic_ns'],args['total_stop_monotonic_ns'])

    def test_09_bad_declaration_hash_stage_resource_join_and_existing_clock(self):
        for mistake in ['stage','sha','resource','existing']:
            with tempfile.TemporaryDirectory(prefix='negative-',dir=ROOT/'zero-inference') as temporary:
                args=self.fixture(Path(temporary),self.rows[0])
                if mistake=='stage':args['label']='WRONG-STAGE'
                elif mistake=='sha':args['clock_declaration_sha256']='0'*64
                elif mistake=='resource':
                    obj=json.loads(args['resource_profile'].read_text());obj['original_total_stop_monotonic_ns']+=1
                    args['resource_profile'].write_text(json.dumps(obj))
                else:(args['workspace']/'inputs/STAGE_CLOCK.json').write_bytes(b'preserve-existing-clock')
                with self.assertRaises((ValueError,FileExistsError)):self.prepare.prepare_stage(**args)
                if mistake=='existing':self.assertEqual((args['workspace']/'inputs/STAGE_CLOCK.json').read_bytes(),b'preserve-existing-clock')

    def test_10_V06_bundle_override_denied_actual_builder(self):
        bundle=next(r for r in self.rows if r['inline_only_bundle'])
        with tempfile.TemporaryDirectory(prefix='v06-negative-',dir=ROOT/'zero-inference') as temporary:
            args=self.fixture(Path(temporary),bundle)
            obj=json.loads(args['bundle_profile'].read_text());obj['method_factors']=['V06']
            args['bundle_profile'].write_text(json.dumps(obj))
            with self.assertRaises(ValueError):self.prepare.prepare_stage(**args)

    def test_11_all19_old_config_constructor_parity_in_new_fixtures(self):
        old=c.checked(c.ref(c.OLD/'OUTBOX.json'));count=0
        for reg_ref in old['source_prerequisite_requests']+old['matched_pair_requests']:
            reg=c.checked(reg_ref)
            for row in reg['stage_jobs']:
                spec=c.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
                bound=c.checked(row['resource_binding']);module=c.load(bound['tools_config_constructor']['path'],'old_config_'+str(count))
                with tempfile.TemporaryDirectory(prefix='old19-',dir=ROOT/'zero-inference') as temporary:
                    folder=Path(temporary);ws=folder/'workspace';(ws/'inputs').mkdir(parents=True);(ws/'out').mkdir()
                    (ws/'TASK.md').write_text('SYNTHETIC original tool config fixture')
                    profile=None
                    if spec.get('bundle_profile'):
                        oldmanifest=Path(spec['workspace'])/'inputs/delivery_role_manifest.json'
                        (ws/'inputs/delivery_role_manifest.json').write_bytes(oldmanifest.read_bytes())
                        profile=folder/'bundle.json';profile.write_bytes(Path(spec['bundle_profile']['path']).read_bytes());profile.chmod(0o600)
                    cfg=module.mcp_configs(ws,deadline_monotonic_ns=time.monotonic_ns()+60_000_000_000,
                        execution_enabled=row['execution_enabled'],public_get=row['public_get'],
                        **({'bundle_profile_path':profile} if profile else {}))
                    self.assertEqual(set(cfg['tool_allowlist']),set(bound['tool_allowlist']))
                    self.assertEqual(len(cfg['tool_allowlist']),5)
                    self.assertEqual(bool(cfg.get('native_bundle_enabled')),bool(profile))
                    self.assertNotIn('initial_clock_metadata_utf8',cfg)
                    count+=1
        self.assertEqual(count,19)

    def test_12_strict_missing_native_source_role_and_entered_registration_rejection(self):
        with tempfile.TemporaryDirectory(prefix='strict-role-',dir=ROOT/'zero-inference') as temporary:
            folder=Path(temporary);path=folder/'synthetic_zero_goal_freeze.json'
            path.write_text(json.dumps({'job_id':self.rows[0]['job_id'],'pair_id':self.source[0]['pair_id'],
                'arm':'seed','stage':'critique','operational_complete':False,'native_quiescent':True,
                'native_goal_starts':0,'artifacts':[]}))
            with self.assertRaisesRegex(ValueError,'completed quiet native'):
                ib.original_birth.native(c.ref(path),self.rows[0]['job_id'],self.source[0]['pair_id'],'seed','critique',['out/seed/critique.md'])
            original=c.checked(c.ref(c.OLD/'OUTBOX.json'))
            entered=next(r for r in original['matched_pair_requests'] if c.checked(r)['source_slot']=='D-V13-B')
            plan=folder/'plan.json';plan.write_text(json.dumps({'schema':'er9.deferred-clock-input-binding-plan.v2',
                'operation':'stage','registration_ref':entered}))
            with self.assertRaisesRegex(ValueError,'outside full frozen cohort'):ib.bind(c.ref(plan))
        self.assertEqual(c.original_bytes_unchanged(),295)

if __name__=='__main__':unittest.main(verbosity=2)
