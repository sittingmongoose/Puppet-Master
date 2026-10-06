#!/usr/bin/env python3
"""Science-free synthetic fixtures invoke all22 actual G metadata/config paths.

No subprocess, model, Goal, provider or actual kernel allocation is permitted.
"""
import copy
import json
import os
from pathlib import Path
import shutil
import tempfile
import time
import unittest
from unittest.mock import patch
import prepare as owner
import production_metadata as production
import role_birth
p=owner.p;ROOT=owner.ROOT

class ConfirmationClockRetestTests(unittest.TestCase):
    def setUp(self):
        self.box=p.checked(p.ref(ROOT/'OUTBOX.json'));self.requests=[p.checked(r) for r in self.box['requests']]

    def test_exact_locked_allfour22_original2700_and_clean_firstR(self):
        self.assertEqual(len(self.requests),4);self.assertEqual(sum(len(r['stage_jobs']) for r in self.requests),22)
        self.assertEqual({r['source_slot'] for r in self.requests},{'C-01','C-02','C-03','C-04'})
        self.assertEqual(self.box['cohort_native_seconds'],21600);self.assertEqual(self.box['actual_native_model_Goal_provider_calls'],0)
        for r in self.requests:
            self.assertEqual(r['family'],'Z');self.assertEqual(r['requested_model'],'GLM 5.3 Flash');self.assertEqual(r['requested_effort'],'max')
            self.assertEqual({j['arm'] for j in r['stage_jobs']},{'control','treatment'})
            for arm in ['control','treatment']:self.assertEqual(sum(j['max_seconds'] for j in r['stage_jobs'] if j['arm']==arm),2700)
            for row in r['stage_jobs']:
                stage=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
                names={Path(path).name for path in stage['input_pins']}
                self.assertEqual(names,owner.ALLOWED_INPUTS|({'delivery_role_manifest.json'} if stage['complete_final_owner_role'] else set()))
                if row['stage']=='research':self.assertEqual(names,owner.ALLOWED_INPUTS);self.assertEqual(row['all_same_arm_prior_job_ids'],[])
                self.assertFalse((Path(stage['workspace'])/'inputs/STAGE_CLOCK.json').exists())
                self.assertIsNone(stage['actual_future_clock_input_sha256'])
                self.assertFalse(stage['first_research_old_candidate_payloads'])

    def test_scientific_prefix_card_parity_locked_H1_H2_refs_and_inputs(self):
        v=owner.runtime()
        for r in self.requests:
            card=p.checked({'path':r['card_path'],'sha256':r['card_sha256']});closure=p.checked(r['pipeline_closure']);oldcard=p.checked(closure['source_original_card_ref'])
            changed={'pair_id','source_pair_id','card_version','clock_behavior_version','declared_runtime_closure'}
            self.assertEqual({k:x for k,x in card.items() if k not in changed},{k:x for k,x in oldcard.items() if k not in changed})
            self.assertEqual(card['exact_locked_bundle'],oldcard['exact_locked_bundle']);self.assertEqual(card['allocation']['occupied_candidate_seconds_per_arm'],5400)
            self.assertEqual(closure['locked_method_ref']['sha256'],'2e6a79f793474aa238c5d8e896fbb08e19f4e31a6277aa81095a5338671957db')
            for ref in closure['locked_input_criteria_refs'].values():
                if isinstance(ref,dict) and 'path' in ref:self.assertEqual(p.sha(ref['path']),ref['sha256'])
            for row in r['stage_jobs']:
                stage=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']});old=p.checked(stage['source_stage_ref'])
                _,_,_,_,fragment=v.source_choice(stage['complete_final_owner_role'])
                expected=Path(old['prompt_file']).read_bytes()+(owner.bundle_identity(stage['job_id']) if stage['complete_final_owner_role'] else b'')+fragment.render(old['max_seconds'])
                self.assertEqual(Path(stage['prompt_file']).read_bytes(),expected);self.assertEqual(p.sha(stage['prompt_file']),stage['prompt_sha256'])
                for field in p.INVARIANTS:self.assertEqual(stage.get(field),old.get(field))
                self.assertEqual(stage['source_separation_overlay'],old['source_separation_overlay'])
                for path,digest in old['input_pins'].items():self.assertEqual(p.sha(Path(stage['workspace'])/Path(path).relative_to(old['workspace'])),digest)

    def test_actual_both_allroles_sources_caps_private_bounds_and_strict_closure(self):
        v=owner.runtime()
        contract=p.checked(self.box['strict_role_birth_contract'])
        for key in ['validator_ref','metadata_prepare_ref','operator_binding_ref','shared_opaque_input_primitives_ref','API_schema_ref']:
            self.assertEqual(p.sha(contract[key]['path']),contract[key]['sha256'])
        for r in self.requests:
            full=p.checked(r['pipeline_closure']);self.assertTrue(full['complete_actual_both_arm_all_role_source_choices_before_first_R'])
            self.assertFalse(full['dynamic_actual_hashes_fabricated']);self.assertFalse(full['invisible_causal_neutrality_guarantee'])
            jobs={j['job_id']:j for j in r['stage_jobs']}
            for row in jobs.values():
                stage=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']});pin,native,integration,marker,fragment=v.source_choice(stage['complete_final_owner_role'])
                self.assertEqual(stage['declared_native_source_pin'],pin);self.assertEqual(stage['glm_resource']['source_pins'],native['runtime_source_pins'])
                self.assertEqual(stage['glm_resource']['tools_config_builder'],integration['glm_resource_template']['tools_config_builder'])
                self.assertEqual(row['runtime_ref'],v.MARKERS[int(stage['complete_final_owner_role'])]);fragment.validate_packet(stage)
                self.assertEqual(row['resource_definition']['aggregate_memory_max_bytes'],2304*1024**2);self.assertEqual(row['resource_definition']['memory_swap_max_bytes'],0)
                self.assertEqual(stage['strict_role_birth_contract'],self.box['strict_role_birth_contract'])
                for job in row['all_same_arm_prior_job_ids']:self.assertEqual(jobs[job]['arm'],row['arm'])

    def test_true_recipeB_combined_and_three_stage_controls_no_V06_override(self):
        carrier=owner.module('test_carrier',p.LAB/'dev/tools/versions/v1.5-clock-telemetry/bundle_carrier.py')
        for r in self.requests:
            card=p.checked({'path':r['card_path'],'sha256':r['card_sha256']})
            for row in r['stage_jobs']:
                stage=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
                if stage['complete_final_owner_role']:
                    profile=carrier.load_profile(stage['glm_resource']['bundle_profile']['path'])
                    self.assertEqual(profile['method_factors'],owner.carrier_factors(card,row['arm']))
                    self.assertEqual(profile['stage_role'],'final_author' if row['stage']=='revision' else row['stage'])
                    self.assertEqual(profile['actor_binding']['writer_alias'],'mcp__pm_boundary__write_file')
                    self.assertEqual(p.checked(stage['required_delivery_role_manifest'])['entries'],[])
                self.assertFalse(owner.bundle_enabled({**card,'method_id':'V06'},stage))
            treatment=[j for j in r['stage_jobs'] if j['arm']=='treatment'];control=[j for j in r['stage_jobs'] if j['arm']=='control']
            self.assertEqual([j['stage'] for j in control],['research','critique','revision'])
            if card['recipe']=='B':
                self.assertEqual([j['stage'] for j in treatment],['research','critic_final']);self.assertEqual(treatment[1]['max_seconds'],1500)
                self.assertIn('genuine independent critique AND final authorship',owner.bundle_identity(treatment[1]['job_id']).decode())
            else:self.assertEqual([j['stage'] for j in treatment],['research','critique','revision'])

    def fixture(self,stage,directory):
        """Synthetic original birth and resource metadata, no kernel/native claim."""
        spec=copy.deepcopy(stage);root=Path(directory);ws=root/'workspace';(ws/'inputs').mkdir(parents=True);(ws/'out').mkdir()
        shutil.copyfile(stage['prompt_file'],ws/'TASK.md');spec.update(workspace=str(ws),prompt_file=str(ws/'TASK.md'),out=str(root/'native'))
        spec['input_pins']={}
        for path,digest in stage['input_pins'].items():
            target=ws/Path(path).relative_to(stage['workspace']);shutil.copyfile(path,target);spec['input_pins'][str(target)]=digest
        spec['glm_resource']['capture_dir']=str(root/'captures');spec['glm_resource']['evidence_dir']=str(root/'evidence')
        if stage['complete_final_owner_role']:
            target=root/'BUNDLE_PROFILE.json';shutil.copyfile(stage['glm_resource']['bundle_profile']['path'],target);target.chmod(0o600)
            spec['glm_resource']['bundle_profile']=p.ref(target)
        engine,clock,fragment,profile=production.modules(spec)
        birth=time.monotonic_ns()-10**9;total=birth+stage['max_seconds']*10**9;action=total-30*10**9
        uid=os.getuid();sliceunit='er9mem'+'a'*32+'.slice'
        resource={'schema':'er9.luna.private-memory-profile.v1','label':stage['job_id'],'slice_unit':sliceunit,
            'slice_cgroup':f'/user.slice/user-{uid}.slice/user@{uid}.service/'+sliceunit,
            'aggregate_memory_max_bytes':profile.reader.TOTAL,'component_memory_max_bytes':profile.reader.CAPS,'memory_swap_max_bytes':0,
            'original_birth_monotonic_ns':birth,'original_total_stop_monotonic_ns':total,'reader_sha256':profile.API_SHA,'SYNTHETIC_NO_KERNEL_OR_NATIVE':True}
        rp=root/'resource.json';p.put(rp,resource);rp.chmod(0o600)
        binding={'job_id':spec['job_id'],'pair_id':spec['pair_id'],'arm':spec['arm'],'original_birth_monotonic_ns':birth,
            'original_total_stop_monotonic_ns':total,'original_stage_allocation_seconds':stage['max_seconds'],'native_stop_monotonic_ns':action,
            'controller_source':p.ref(engine/'stage_worker.py'),'SYNTHETIC_NO_KERNEL_OR_NATIVE':True}
        bp=root/'RESOURCE_BINDING.json';p.put(bp,binding)
        builder=profile.tool_module();baseline=builder.mcp_configs(ws,capture_dir=root/'baseline-captures',evidence_dir=root/'baseline-evidence',
            execution_enabled=stage['glm_resource']['execution_enabled'],public_get=stage['glm_resource']['public_get'])
        conf=root/'original-config.json';p.put(conf,baseline);spec.update(tools_config=str(conf),tools_config_sha256=p.sha(conf))
        return spec,rp,bp,binding

    def test_all22_actual_production_clock_resource_wrapped_config_initial_input_NO_process(self):
        count=0
        for r in self.requests:
            for row in r['stage_jobs']:
                stage=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
                with tempfile.TemporaryDirectory(dir=ROOT) as directory:
                    spec,rp,bp,binding=self.fixture(stage,directory)
                    with patch('subprocess.Popen',side_effect=AssertionError('No native/process')),patch('subprocess.run',side_effect=AssertionError('No native/process')):
                        result=production.prepare_metadata(spec,rp,bp,Path(directory)/'sealed')
                    clock=result['config']['initial_clock_metadata']['stage_clock']
                    self.assertEqual(clock['stage_id'],spec['job_id']);self.assertEqual(clock['original_stage_allocation_seconds'],stage['max_seconds'])
                    self.assertEqual(clock['original_candidate_action_deadline_monotonic_ns'],binding['native_stop_monotonic_ns'])
                    self.assertEqual(clock['original_total_cleanup_stop_monotonic_ns'],binding['original_total_stop_monotonic_ns'])
                    self.assertNotEqual(clock['original_candidate_action_deadline_monotonic_ns'],clock['original_total_cleanup_stop_monotonic_ns'])
                    self.assertEqual((Path(spec['workspace'])/'inputs/STAGE_CLOCK.json').read_bytes(),result['config']['initial_clock_metadata_utf8'].encode())
                    self.assertEqual(p.sha(spec['prompt_file']),stage['prompt_sha256']);self.assertEqual(result['native_process_or_Goal_calls'],0)
                    self.assertFalse(result['actual_kernel_placement_observed']);self.assertEqual(result['config']['native_bundle_enabled'],stage['complete_final_owner_role'])
                    self.assertEqual(len(result['config']['tool_allowlist']),5);count+=1
        self.assertEqual(count,22)

    def test_wrong_task_input_clock_resource_and_profile_joins_rejected(self):
        stage=p.checked({'path':self.requests[0]['stage_jobs'][-1]['stage_json'],'sha256':self.requests[0]['stage_jobs'][-1]['stage_sha256']})
        for defect in ['task','input','clock-arm','clock-allocation','clock-action','resource','bundle-stage','clock-occupied']:
            with self.subTest(defect=defect),tempfile.TemporaryDirectory(dir=ROOT) as directory:
                spec,rp,bp,binding=self.fixture(stage,directory)
                if defect=='task':Path(spec['prompt_file']).write_bytes(b'CHANGED SYNTHETIC TASK')
                elif defect=='input':Path(next(iter(spec['input_pins']))).write_bytes(b'CHANGED SYNTHETIC INPUT')
                elif defect=='clock-arm':binding['arm']='another-arm';bp.write_text(json.dumps(binding))
                elif defect=='clock-allocation':spec['max_seconds']+=1
                elif defect=='clock-action':binding['native_stop_monotonic_ns']=binding['original_total_stop_monotonic_ns'];bp.write_text(json.dumps(binding))
                elif defect=='resource':data=json.loads(rp.read_text());data['original_birth_monotonic_ns']-=1;rp.write_text(json.dumps(data))
                elif defect=='bundle-stage':
                    path=Path(spec['glm_resource']['bundle_profile']['path']);data=json.loads(path.read_text());data['stage_id']='OTHER-STAGE';path.write_text(json.dumps(data));spec['glm_resource']['bundle_profile']=p.ref(path)
                else:(Path(spec['workspace'])/'inputs/STAGE_CLOCK.json').write_bytes(b'OCCUPIED')
                with self.assertRaises((ValueError,FileExistsError)):production.prepare_metadata(spec,rp,bp,Path(directory)/'sealed')

    def test_unknown_action_not_inferred_from_cleanup_or_missing_controller(self):
        stage=p.checked({'path':self.requests[0]['stage_jobs'][0]['stage_json'],'sha256':self.requests[0]['stage_jobs'][0]['stage_sha256']})
        with tempfile.TemporaryDirectory(dir=ROOT) as directory:
            spec,rp,bp,binding=self.fixture(stage,directory);binding.pop('controller_source');bp.write_text(json.dumps(binding))
            result=production.prepare_metadata(spec,rp,bp,Path(directory)/'sealed')
            self.assertIsNone(result['config']['initial_clock_metadata']['stage_clock']['original_candidate_action_deadline_monotonic_ns'])

    def test_entire_old22_quiet_and_new22_zeroIntent_gate_positive_negative(self):
        old=[{'job_id':s['job_id'],'status':'FAILED','native_goal_starts':1,'owned_quiet_positive':True,'permit_release_confirmed':True}
            for x in p.checked(owner.FEASIBILITY)['locked_pairs'] for s in x['schedule']]
        new=[{'job_id':j,'native_goal_starts':0,'launch_intents':0} for j in self.box['new_role_ids']]
        self.assertTrue(owner.validate_admission(old,new));self.assertFalse(self.box['all_old22_terminal_ownedquiet_observed_at_source_cutoff'])
        for defect in ['oldrunning','quiet','oldmissing','oldforeign','newforeign','newstarted','newIntent']:
            a=copy.deepcopy(old);b=copy.deepcopy(new)
            if defect=='oldrunning':a[-1]['status']='SEALED_READY'
            elif defect=='quiet':a[-1]['owned_quiet_positive']=False
            elif defect=='oldmissing':a.pop()
            elif defect=='oldforeign':a[-1]['job_id']='UNRELATED-OLD-STAGE'
            elif defect=='newforeign':b[-1]['job_id']='UNRELATED-NEW-STAGE'
            elif defect=='newstarted':b[0]['native_goal_starts']=1
            else:b[0]['launch_intents']=1
            with self.assertRaises(ValueError):owner.validate_admission(a,b)

    def test_strict_new_donors_all_required_samearm_native_model_goal_complete_quiet_hash(self):
        r=self.requests[0];target=next(j for j in r['stage_jobs'] if j['arm']=='control' and j['stage']=='critique');donor=next(j for j in r['stage_jobs'] if j['arm']=='control' and j['stage']=='research')
        for defect in ['valid','oldpair','otherarm','failed','quiet','model','GoalID','GoalMismatch','missing','hash','context']:
            with self.subTest(defect=defect),tempfile.TemporaryDirectory(dir=ROOT) as directory:
                root=Path(directory);artifacts=[]
                for name in ['proposal.md','sources.json','witnesses.json','leads.json']:
                    file=root/name;file.write_bytes(b'SYNTHETIC SCIENCE-FREE NATIVE-FREE DATA')
                    artifacts.append({'relative_path':'research/'+name,'path':str(file),'sha256':p.sha(file),'bytes':file.stat().st_size})
                freeze={'job_id':donor['job_id'],'pair_id':r['pair_id'],'arm':'control','stage':'research','operational_complete':True,'native_quiescent':True,'native_goal_starts':1,
                    'goal_target_id':'SYNTHETIC-NOT-A-GOAL','artifacts':artifacts,'SYNTHETIC_NO_NATIVE':True}
                if defect=='failed':freeze['operational_complete']=False
                if defect=='quiet':freeze['native_quiescent']=False
                if defect=='missing':freeze['artifacts'].pop()
                if defect=='hash':freeze['artifacts'][0]['sha256']='0'*64
                fp=root/'FREEZE.json';p.put(fp,freeze)
                actual={'job_id':donor['job_id'],'pair_id':r['pair_id'],'arm':'control','stage':'research','native_goal_state':'complete','origin_goal_id':'SYNTHETIC-NOT-A-GOAL',
                    'native_goal_starts':1,'observed_family':'Z','observed_model':role_birth.MODEL,'observed_effort':'max','output_freeze':p.ref(fp)}
                if defect=='oldpair':actual['pair_id']='OLD-PAIR'
                if defect=='otherarm':actual['arm']='treatment'
                if defect=='model':actual['observed_model']='another-model'
                if defect=='GoalID':actual['origin_goal_id']=None
                if defect=='GoalMismatch':actual['origin_goal_id']='WRONG-SYNTHETIC-GOAL'
                caps=root/'CAPSULE.json';p.put(caps,{'rows':[actual],'SYNTHETIC_NO_NATIVE':True})
                cp=root/'CONTEXT.json';p.put(cp,{'schema':'er9.closed-native-source-context.v1','job_id':donor['job_id'],'arm':'treatment' if defect=='context' else 'control',
                    'native_goal_starts':1,'native_model_io_or_candidate_semantics_included':False,'output_freeze':p.ref(fp),'owned_quiet_positive':True,'sources':[]})
                regref=p.ref(Path(r['card_path']).parent/'registration.json')
                if defect=='valid':
                    self.assertEqual(len(role_birth.validated_ancestry(regref,target['job_id'],p.ref(caps),[p.ref(cp)])),1)
                    # Exactly two original HTTP results, one error, carried without
                    # selection; synthetic bytes and metadata never source answers.
                    capture=root/'public_captures';capture.mkdir();sources=[]
                    for status in [200,404]:
                        body=capture/(str(status)+'.body');body.write_bytes(b'SYNTHETIC NO SOURCE FINDING')
                        metadata=capture/(str(status)+'.json');p.put(metadata,{'SYNTHETIC_NO_NATIVE':True})
                        sources.append({'body':{**p.ref(body),'bytes':body.stat().st_size},'metadata':p.ref(metadata),
                            'requested_url':'https://example.invalid/fixture','actual_url':'https://example.invalid/fixture','status':status,
                            'body_complete':status==200,'source_version':None,'capture_id':'SYNTHETIC-'+str(status)})
                    data=json.loads(cp.read_text());data['sources']=sources;cp.write_text(json.dumps(data))
                    ws=root/'new-runtime-workspace';(ws/'inputs').mkdir(parents=True)
                    result=role_birth.import_ancestry(regref,target['job_id'],p.ref(caps),[p.ref(cp)],ws)
                    self.assertEqual(result['native_calls'],0);self.assertEqual(len(result['input_pins']),7)
                    index=json.loads((ws/'inputs/source_context'/donor['job_id']/'index.json').read_text())
                    self.assertEqual([s['status'] for s in index['sources']],[200,404])
                    self.assertEqual(p.sha(ws/'inputs/prior'/donor['job_id']/'research/proposal.md'),artifacts[0]['sha256'])
                    plan=root/'PLAN.json';p.put(plan,{'schema':'er9.actual-role-birth-binding-plan.v1','registration_ref':regref,'job_id':target['job_id'],
                        'arm':'control','origin_job_ids':target['all_same_arm_prior_job_ids'],'capsule_ref':p.ref(caps),
                        'closed_source_context_refs':[p.ref(cp)],'destination_root':str(root/'role-born')})
                    receipt=p.checked(role_birth.bind(p.ref(plan)));bound=p.checked(receipt['stage_ref'])
                    self.assertEqual(bound['prompt_sha256'],p.checked({'path':target['stage_json'],'sha256':target['stage_sha256']})['prompt_sha256'])
                    self.assertEqual(receipt['model_or_native_calls'],0);self.assertEqual(bound['max_seconds'],900)
                    self.assertEqual(len(bound['input_pins']),12);self.assertFalse((Path(bound['workspace'])/'inputs/STAGE_CLOCK.json').exists())
                else:
                    with self.assertRaises(ValueError):role_birth.validated_ancestry(regref,target['job_id'],p.ref(caps),[p.ref(cp)])
                with self.assertRaises(ValueError):role_birth.validated_ancestry(regref,target['job_id'],p.ref(caps),[])

    def test_original_all_sourcebytes_unchanged(self):
        snapshot=p.checked(p.ref(ROOT/'OLD_SOURCE_BYTE_SNAPSHOT.json'))
        self.assertGreater(len(snapshot['files']),5000)
        for path,digest in snapshot['files'].items():self.assertEqual(p.sha(path),digest)

if __name__=='__main__':unittest.main(verbosity=2)
