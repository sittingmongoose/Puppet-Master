#!/usr/bin/env python3
"""Actual Lproductionprepare22fixtures + scientific/operational strict checks."""
import copy
import hashlib
import json
import os
from pathlib import Path
import tempfile
import time
import unittest
from unittest.mock import patch
import prepare as owner
import role_birth
p=owner.p;ROOT=owner.ROOT

class LunaClockFreshRetestTests(unittest.TestCase):
    def setUp(self):
        self.box=p.checked(p.ref(ROOT/'OUTBOX_FINAL.json'));self.requests=[p.checked(r) for r in self.box['requests']]

    def test_exact_four22_fixed_wholecohort_methods_budget_model_no_oldinputs(self):
        self.assertEqual(len(self.requests),4);self.assertEqual(sum(len(r['stage_jobs']) for r in self.requests),22)
        self.assertEqual({r['source_slot'] for r in self.requests},{'I-05','I-06','I-07','I-08'})
        for r in self.requests:
            self.assertEqual({j['arm'] for j in r['stage_jobs']},{'control','treatment'})
            self.assertEqual(r['requested_model'],'GPT-6 Luna');self.assertEqual(r['requested_effort'],'Max')
            self.assertFalse(r['first_research_old_candidate_payloads']);self.assertFalse(r['extra_logical_target_matched_credit'])
            for arm in ['control','treatment']:self.assertEqual(sum(j['max_seconds'] for j in r['stage_jobs'] if j['arm']==arm),2700)
            for row in r['stage_jobs']:
                stage=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
                for path,digest in stage['input_pins'].items():
                    rel=Path(path).relative_to(stage['workspace']);self.assertEqual(rel.parent,Path('inputs'));self.assertIn(rel.name,owner.ALLOWED_INPUTS)
                    self.assertEqual(p.sha(path),digest)
                self.assertFalse((Path(stage['workspace'])/'inputs/STAGE_CLOCK.json').exists())

    def test_original_scientific_taskprefix_caps_negative_constraints_and_cardparity(self):
        for r in self.requests:
            card=p.checked({'path':r['card_path'],'sha256':r['card_sha256']});oldreg=p.checked(r['source_registration_ref'])
            oldcard=p.checked({'path':oldreg['card_path'],'sha256':oldreg['card_sha256']})
            edits={'pair_id','source_pair_id','card_version','clock_behavior_version'}
            self.assertEqual({k:v for k,v in card.items() if k not in edits},{k:v for k,v in oldcard.items() if k not in edits})
            for row in r['stage_jobs']:
                stage=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']});old=p.checked(stage['source_stage_ref'])
                expected=Path(old['prompt_file']).read_bytes()
                if owner.bundle_enabled(card,old):expected+=owner.bundle_identity(stage['job_id'])
                self.assertEqual(Path(stage['prompt_file']).read_bytes(),expected)
                for field in p.INVARIANTS:self.assertEqual(stage.get(field),old.get(field))
                self.assertEqual(stage['source_separation_overlay'],old['source_separation_overlay'])
                for path,digest in old['input_pins'].items():self.assertEqual(p.sha(Path(stage['workspace'])/Path(path).relative_to(old['workspace'])),digest)

    def test_all_botharm_role_actual_source_tool_v7_clock_declaration_closed(self):
        declaration=owner.module('decl_test',owner.LUNA_ROOT/'clock_declaration.py')
        for r in self.requests:
            full=p.checked(r['pipeline_closure']);self.assertTrue(full['complete_actual_both_arm_all_role_source_choices_before_first_newResearch'])
            self.assertFalse(full['dynamic_actual_hashes_fabricated']);self.assertFalse(full['new_scientific_source_or_evaluator_facts'])
            for row in r['stage_jobs']:
                stage=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
                self.assertEqual(stage['declared_native_source_pin'],owner.NATIVE);self.assertEqual(stage['declared_tool_source_pin'],owner.TOOLS)
                self.assertEqual(p.checked(stage['clock_declaration']),declaration.declaration(stage['job_id']))
                if stage['complete_final_owner_role']:
                    self.assertEqual(stage['actual_writer_binding']['namespace'],'pm_boundary');self.assertEqual(stage['actual_writer_binding']['tool'],'write_file')
                    self.assertNotIn('mcp__pm_boundary__write_file',owner.bundle_identity(stage['job_id']).decode())

    def test_V08_combined_functions_and_V06_both_exclusion(self):
        for r in self.requests:
            card=p.checked({'path':r['card_path'],'sha256':r['card_sha256']})
            for row in r['stage_jobs']:
                stage=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
                if card['method_id']=='V08' and row['stage']=='critic_final':
                    self.assertEqual(row['max_seconds'],1500);self.assertEqual(stage['required_artifacts'],owner.FINAL_PATHS)
                    self.assertIn('genuine independent critique AND final authorship',owner.bundle_identity(stage['job_id']).decode())
                protected={**card,'method_id':'V06'};self.assertFalse(owner.bundle_enabled(protected,stage))

    def test_old_pair_terminal_quiet_release_positive_and_not_inferred_from_label(self):
        terminal=p.checked(owner.TERMINAL);self.assertTrue(owner.terminal_proof(terminal))
        altered=copy.deepcopy(terminal);entered=next(r for r in altered['rows'] if r['native_goal_starts']);entered['actual_owned_quiet']=False
        with self.assertRaises(ValueError):owner.terminal_proof(altered)
        altered=copy.deepcopy(terminal);altered['rows'][0]['status']='RUNNING'
        with self.assertRaises(ValueError):owner.terminal_proof(altered)

    def test_actual_production_prepare_all22_case_cap_factor_mode_fixtures_NO_native(self):
        prepare=owner.module('actual_prepare_test',owner.LUNA_ROOT/'clock_prepare.py')
        decl=owner.module('actual_declare_test',owner.LUNA_ROOT/'clock_declaration.py')
        tools=owner.module('actual_operator_test',p.LAB/'dev/tools/versions/v1.5-clock-telemetry/operator_binding.py')
        resources=owner.module('actual_resource_test',p.LAB/'dev/luna-route/resource_slice.py')
        checked=0
        for r in self.requests:
            card=p.checked({'path':r['card_path'],'sha256':r['card_sha256']})
            for row in r['stage_jobs']:
                stage=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
                with tempfile.TemporaryDirectory(dir=ROOT) as directory:
                    root=Path(directory);ws=root/'workspace';(ws/'inputs').mkdir(parents=True);(ws/'out').mkdir();private=root/'private';private.mkdir()
                    science='SYNTHETIC SCIENCE-FREE ORIGINAL PREFIX\r\nα\t  ';(ws/'TASK.md').write_bytes(science.encode())
                    birth=time.monotonic_ns()-10**9;seconds=stage['max_seconds'];total=birth+seconds*10**9;action=birth+(seconds-15)*10**9
                    resource={'schema':'er9.luna.private-memory-profile.v1','label':stage['job_id'],'slice_unit':'er9mem'+'a'*32+'.slice',
                        'slice_cgroup':'/user.slice/user-'+str(os.getuid())+'.slice/user@'+str(os.getuid())+'.service/er9mem'+'a'*32+'.slice',
                        'aggregate_memory_max_bytes':resources.TOTAL,'component_memory_max_bytes':resources.CAPS,'memory_swap_max_bytes':0,
                        'original_birth_monotonic_ns':birth,'original_total_stop_monotonic_ns':total,
                        'reader_sha256':p.sha(p.LAB/'dev/luna-route/resource_slice.py'),'synthetic_only_no_kernel_allocation':True}
                    resource_path=root/'resource.json';resource_path.write_text(json.dumps(resource));resource_path.chmod(0o600)
                    declaration=root/'declaration.json';p.put(declaration,decl.declaration(stage['job_id']))
                    bundle=None
                    if stage['complete_final_owner_role']:
                        built=tools.binding(stage_id=stage['job_id'],stage_role=stage['bundle_profile_role'],case_id=card['case_id'],arm_id=stage['arm'],
                            method_factors=[card['method_id']],actor_binding={'stage_id':stage['job_id'],'family':'Luna','model':'gpt-6-luna','effort':'max','native_goal_id':None,
                            'writer_alias':'pm_boundary/write_file'},entries=[],complete_final_role=True)
                        (ws/'inputs/delivery_role_manifest.json').write_bytes(built['manifest_bytes']);bundle=root/'bundle.json';bundle.write_bytes(built['profile_bytes']);bundle.chmod(0o600)
                    digest=hashlib.sha256(science.encode()).hexdigest()
                    with patch('subprocess.Popen',side_effect=AssertionError('Native/process calls prohibited')),patch('subprocess.run',side_effect=AssertionError('Native/process calls prohibited')):
                        result=prepare.prepare_stage(workspace=ws,private=private,label=stage['job_id'],original_birth_monotonic_ns=birth,
                          max_seconds=seconds,native_stop_monotonic_ns=action,total_stop_monotonic_ns=total,resource_profile=resource_path,
                          clock_declaration=declaration,clock_declaration_sha256=p.sha(declaration),execution_enabled=row['execution_enabled'],public_get=row['public_get'],
                          scientific_body=science,goal_objective=science,source_prompt_sha256=digest,source_TASK_sha256=digest,bundle_profile=bundle)
                    self.assertFalse(result['native_calls_or_processes_started']);self.assertEqual(result['native_input'][0]['text'],science)
                    cfg=result['config'];clock=cfg['initial_clock_metadata']['stage_clock']
                    self.assertEqual(clock['original_stage_allocation_seconds'],seconds);self.assertEqual(clock['original_candidate_action_deadline_monotonic_ns'],action)
                    self.assertEqual(clock['original_total_cleanup_stop_monotonic_ns'],total)
                    self.assertEqual(len(cfg['tool_allowlist']),5 if row['execution_enabled'] and row['public_get'] else 4)
                    self.assertEqual(cfg['native_bundle_enabled'],stage['complete_final_owner_role'])
                    self.assertEqual(result['native_input'][1]['text'],cfg['initial_clock_metadata_utf8'])
                    self.assertEqual((ws/'inputs/STAGE_CLOCK.json').read_bytes(),result['native_input'][1]['text'].encode())
                    self.assertEqual((ws/'TASK.md').read_bytes(),science.encode());self.assertFalse((ws/'out/final').exists())
                    checked+=1
        self.assertEqual(checked,22)

    def test_missing_actual_new_ancestry_honest_pending(self):
        r=self.requests[0];row=next(j for j in r['stage_jobs'] if j['arm']=='control' and j['stage']=='critique')
        with tempfile.TemporaryDirectory(dir=ROOT) as directory:
            capsule=Path(directory)/'CAPSULE.json';p.put(capsule,{'rows':[]})
            with self.assertRaisesRegex(ValueError,'Every declared new ancestor'):
                role_birth.validated_ancestry(p.ref(Path(r['card_path']).parent/'registration.json'),row['job_id'],p.ref(capsule),[])

    def test_strict_donor_rejects_old_cohort_opfailed_wrongmodel_or_hash(self):
        # Explicit SYNTHETIC data-only fixture; never a claimed native receipt.
        r=self.requests[0];target=next(j for j in r['stage_jobs'] if j['arm']=='control' and j['stage']=='critique')
        donor=next(j for j in r['stage_jobs'] if j['arm']=='control' and j['stage']=='research')
        with tempfile.TemporaryDirectory(dir=ROOT) as directory:
            root=Path(directory);artifacts=[]
            for name in ['proposal.md','sources.json','witnesses.json','leads.json']:
                file=root/name;file.write_bytes(b'SYNTHETIC SCIENCE-FREE DATA ONLY')
                artifacts.append({'relative_path':'research/'+name,'path':str(file),'sha256':p.sha(file),'bytes':file.stat().st_size})
            for mistake in ['oldpair','failed','model','hash']:
                folder=root/mistake;folder.mkdir()
                freeze={'job_id':donor['job_id'],'pair_id':r['pair_id'],'arm':'control','stage':'research','operational_complete':True,
                     'native_quiescent':True,'native_goal_starts':1,'artifacts':copy.deepcopy(artifacts),'SYNTHETIC_NO_NATIVE_ACTOR':True}
                if mistake=='failed':freeze['operational_complete']=False
                if mistake=='hash':freeze['artifacts'][0]['sha256']='0'*64
                f=folder/'FREEZE.json';p.put(f,freeze)
                actual={'job_id':donor['job_id'],'pair_id':r['pair_id'],'arm':'control','stage':'research','native_goal_state':'complete',
                        'observed_family':'L','observed_model':'gpt-6-luna','observed_effort':'max','output_freeze':p.ref(f)}
                if mistake=='oldpair':actual['pair_id']='OLD-COHORT'
                if mistake=='model':actual['observed_model']='another-model'
                caps=folder/'CAPSULE.json';p.put(caps,{'rows':[actual],'SYNTHETIC_NO_NATIVE_ACTOR':True})
                ctx=folder/'CONTEXT.json';p.put(ctx,{'job_id':donor['job_id'],'arm':'control','output_freeze':p.ref(f),'owned_quiet_positive':True,'sources':[]})
                with self.assertRaises(ValueError):
                    role_birth.validated_ancestry(p.ref(Path(r['card_path']).parent/'registration.json'),target['job_id'],p.ref(caps),[p.ref(ctx)])

    def test_strict_constructor_and_all_old_source_byteidentity(self):
        contract=p.checked(self.box['strict_role_birth_contract'])
        self.assertEqual(p.sha(contract['validator_ref']['path']),contract['validator_ref']['sha256'])
        for r in self.requests:
            closure=p.checked(r['pipeline_closure']);self.assertEqual(closure['strict_role_birth_contract'],self.box['strict_role_birth_contract'])
        snapshot=p.checked(p.ref(ROOT/'OLD_SOURCE_BYTE_SNAPSHOT.json'))
        self.assertGreater(len(snapshot['files']),5000)
        for path,digest in snapshot['files'].items():self.assertEqual(p.sha(path),digest)

if __name__=='__main__':unittest.main(verbosity=2)
