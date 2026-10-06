"""Opaque Task parity, actual4 production metadata, strict current-parent fixtures."""
import copy,json,os,sys,tempfile,time,unittest
from pathlib import Path
from unittest.mock import patch
import prepare as owner
import role_birth
p=owner.p;ROOT=owner.ROOT

class PairedInfrastructureRepairTests(unittest.TestCase):
    def setUp(self):
        self.box=p.checked(p.ref(ROOT/'OUTBOX.json'));self.reg=p.checked(self.box['requests'][0]);self.rows=self.reg['stage_jobs']

    def test_exact_paired4_R_not_rerun_current_positive_R_before_ready_history_unchanged(self):
        self.assertEqual(len(self.rows),4);self.assertEqual({r['arm'] for r in self.rows},{'control','treatment'})
        self.assertEqual(self.box['new_research_roles'],0);self.assertEqual(self.box['total_new_stage_seconds'],3000)
        self.assertTrue(self.box['source_parent_R_complete_quiet_proved']);self.assertFalse(self.box['extra_logical_target_matched_credit']);self.assertFalse(self.box['clean_unrepaired_pair_claim'])
        selection=p.checked(owner.SELECTION);research=owner.research_metadata(selection);self.assertEqual(len(research),2)
        self.assertEqual({r['status'] for r in selection['rows'] if r['stage']=='critique'},{'UNCERTAIN_TERMINAL_NO_FREEZE'})
        for r in selection['rows']:
            if r['stage']=='critique':
                self.assertFalse(r['expected_freeze_present'])
                if r['preserved_corrupt_release'] is not None:self.assertEqual(r['preserved_corrupt_release']['bytes'],0)
            if r['stage']=='revision':self.assertEqual(r['native_goal_starts'],0)
        for arm in ['control','treatment']:
            rows=[r for r in self.rows if r['arm']==arm];self.assertEqual([r['stage'] for r in rows],['critique','revision'])
            self.assertEqual([r['max_seconds'] for r in rows],[900,600]);self.assertEqual([r['max_responses'] for r in rows],[90,60])
            self.assertEqual(rows[0]['prerequisite_job_ids'],[]);self.assertEqual(rows[1]['prerequisite_job_ids'],[rows[0]['job_id']])

    def test_exact_scientific_Task_prefix_common_inputs_H1_contract_method_factors_caps(self):
        v=owner.runtime();full=p.checked(self.reg['pipeline_closure']);oldfull=p.checked(full['source_original_full_closure'])
        self.assertEqual(full['locked_input_criteria_refs'],oldfull['locked_input_criteria_refs']);self.assertEqual(full['locked_method_ref'],oldfull['locked_method_ref'])
        self.assertEqual(full['locked_input_criteria_refs']['brief_path']['sha256'],'a0bd5d028acfedcd443b7860e43fb6240627873b354fe2a282ad9884990cbe50')
        self.assertEqual(full['locked_input_criteria_refs']['common_criteria_path']['sha256'],'344135779883060be49d7e389f9dd160e30267247d90269710cb283877602f44')
        for row in self.rows:
            s=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']});old=p.checked(s['source_original_stage_ref']);_,_,_,_,fragment=v.source_choice(s['complete_final_owner_role'])
            oldbytes=Path(old['prompt_file']).read_bytes();suffix=fragment.render(s['max_seconds']);prefix=oldbytes[:-len(suffix)]
            self.assertEqual(Path(s['prompt_file']).read_bytes(),prefix+(owner.identity(s['job_id']) if s['complete_final_owner_role'] else b'')+suffix)
            if row['stage']=='critique':self.assertEqual(p.sha(s['prompt_file']),old['prompt_sha256'])
            for field in p.INVARIANTS:self.assertEqual(s.get(field),old.get(field))
            for path,digest in s['input_pins'].items():
                self.assertEqual(p.sha(path),digest);self.assertIn(Path(path).name,owner.ALLOWED|{'delivery_role_manifest.json'})
            self.assertFalse((Path(s['workspace'])/'inputs/STAGE_CLOCK.json').exists());self.assertIsNone(s['actual_future_clock_input_sha256'])
            if s['complete_final_owner_role']:
                profile=p.checked(s['glm_resource']['bundle_profile']);oldprofile=p.checked(old['glm_resource']['bundle_profile'])
                self.assertEqual(profile['method_factors'],oldprofile['method_factors']);self.assertEqual(profile['stage_id'],s['job_id'])

    def test_all4_actual_native_tool_core_B_clock_constructor_closure_before_anycritic(self):
        v=owner.runtime();full=p.checked(self.reg['pipeline_closure']);self.assertTrue(full['all4_actual_source_choices_frozen_before_either_new_critic'])
        for row in self.rows:
            s=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']});pin,native,integration,marker,fragment=v.source_choice(s['complete_final_owner_role'])
            self.assertEqual(s['declared_native_source_pin'],pin);self.assertEqual(s['glm_resource']['source_pins'],native['runtime_source_pins']);self.assertEqual(s['declared_tool_source_pin'],v.TOOLS)
            self.assertEqual(row['runtime_ref'],v.MARKERS[int(s['complete_final_owner_role'])]);fragment.validate_packet(s)
            self.assertEqual(row['resource_definition']['aggregate_memory_max_bytes'],2304*1024**2);self.assertEqual(row['resource_definition']['memory_swap_max_bytes'],0)
        contract=p.checked(self.box['role_binding_contract']);self.assertEqual(p.sha(contract['validator_ref']['path']),contract['validator_ref']['sha256'])

    def fixture(self,s,directory):
        # Exact production profile and private clock functions; clearly synthetic
        # resource metadata only, no kernel/Goal/provider or candidate output.
        original_prepare=owner.module('base_science_owner',p.ROOT/'confirmation-clock-fresh-retest-001/prepare.py');previous=sys.modules.get('prepare');sys.modules['prepare']=original_prepare
        try:production=owner.module('base_metadata_prepare',p.ROOT/'confirmation-clock-fresh-retest-001/production_metadata.py')
        finally:sys.modules['prepare']=previous
        root=Path(directory);ws=root/'workspace';(ws/'inputs').mkdir(parents=True);(ws/'out').mkdir();spec=copy.deepcopy(s)
        (ws/'TASK.md').write_bytes(Path(s['prompt_file']).read_bytes());spec.update(workspace=str(ws),prompt_file=str(ws/'TASK.md'),out=str(root/'native'),input_pins={})
        for path,digest in s['input_pins'].items():
            target=ws/Path(path).relative_to(s['workspace']);target.write_bytes(Path(path).read_bytes());spec['input_pins'][str(target)]=digest
        spec['glm_resource'].update(capture_dir=str(root/'captures'),evidence_dir=str(root/'evidence'))
        engine,clock,fragment,profile=production.modules(spec);birth=time.monotonic_ns()-10**9;total=birth+s['max_seconds']*10**9;action=total-30*10**9;uid=os.getuid();unit='er9mem'+'a'*32+'.slice'
        resource={'schema':'er9.luna.private-memory-profile.v1','label':s['job_id'],'slice_unit':unit,'slice_cgroup':f'/user.slice/user-{uid}.slice/user@{uid}.service/'+unit,
          'aggregate_memory_max_bytes':profile.reader.TOTAL,'component_memory_max_bytes':profile.reader.CAPS,'memory_swap_max_bytes':0,
          'original_birth_monotonic_ns':birth,'original_total_stop_monotonic_ns':total,'reader_sha256':profile.API_SHA,'SYNTHETIC_NO_NATIVE':True}
        rp=root/'resource.json';p.put(rp,resource);rp.chmod(0o600)
        binding={'job_id':s['job_id'],'pair_id':s['pair_id'],'arm':s['arm'],'original_birth_monotonic_ns':birth,'original_total_stop_monotonic_ns':total,
          'original_stage_allocation_seconds':s['max_seconds'],'native_stop_monotonic_ns':action,'controller_source':p.ref(engine/'stage_worker.py'),'SYNTHETIC_NO_NATIVE':True}
        bp=root/'RESOURCE_BINDING.json';p.put(bp,binding)
        cfg=profile.tool_module().mcp_configs(ws,capture_dir=root/'baseline-captures',evidence_dir=root/'baseline-evidence',execution_enabled=True,public_get=True)
        cp=root/'original-config.json';p.put(cp,cfg);spec.update(tools_config=str(cp),tools_config_sha256=p.sha(cp))
        return production,spec,rp,bp,binding

    def test_all4_actual_Gproduction_wrapped_metadata_configs_private_clock_initialinput_no_process(self):
        count=0
        for row in self.rows:
            s=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
            with tempfile.TemporaryDirectory(dir=ROOT) as directory:
                production,spec,rp,bp,binding=self.fixture(s,directory)
                with patch('subprocess.Popen',side_effect=AssertionError('NO native/process')),patch('subprocess.run',side_effect=AssertionError('NO native/process')):
                    result=production.prepare_metadata(spec,rp,bp,Path(directory)/'sealed')
                self.assertEqual(result['config']['native_bundle_enabled'],row['stage']=='revision')
                clock=result['config']['initial_clock_metadata']['stage_clock'];self.assertEqual(clock['stage_id'],row['job_id']);self.assertEqual(clock['original_stage_allocation_seconds'],row['max_seconds'])
                self.assertEqual(clock['original_candidate_action_deadline_monotonic_ns'],binding['native_stop_monotonic_ns']);self.assertNotEqual(clock['original_candidate_action_deadline_monotonic_ns'],clock['original_total_cleanup_stop_monotonic_ns'])
                self.assertEqual(p.sha(spec['prompt_file']),s['prompt_sha256']);self.assertEqual(result['native_process_or_Goal_calls'],0);count+=1
        self.assertEqual(count,4)

    def test_wrong_Task_clock_input_model_proof_and_missing_final_parent_honest_pending(self):
        s=p.checked({'path':self.rows[0]['stage_json'],'sha256':self.rows[0]['stage_sha256']})
        for defect in ['task','clock','input']:
            with tempfile.TemporaryDirectory(dir=ROOT) as directory:
                production,spec,rp,bp,binding=self.fixture(s,directory)
                if defect=='task':Path(spec['prompt_file']).write_bytes(b'SYNTHETIC CHANGED TASK')
                elif defect=='clock':binding['arm']='WRONG-ARM';bp.write_text(json.dumps(binding))
                else:Path(next(iter(spec['input_pins']))).write_bytes(b'SYNTHETIC CHANGED INPUT')
                with self.assertRaises(ValueError):production.prepare_metadata(spec,rp,bp,Path(directory)/'sealed')
        selection=p.checked(owner.SELECTION)
        for row in self.rows:
            research=next(r for r in selection['rows'] if r['stage']=='research' and r['arm']==row['arm'])
            if row['stage']=='critique':self.assertEqual(len(role_birth.validated_ancestry(self.box['requests'][0],row['job_id'],selection['capsule_ref'],[research['closed_source_context_ref']])),1)
            else:
                with self.assertRaises(ValueError):role_birth.validated_ancestry(self.box['requests'][0],row['job_id'],selection['capsule_ref'],[research['closed_source_context_ref']])

    def test_newcritic_complete_required_no_old_failed_critic_or_otherarm_source_and_hashes(self):
        target=next(r for r in self.rows if r['arm']=='control' and r['stage']=='revision');critic=next(r for r in self.rows if r['arm']=='control' and r['stage']=='critique')
        contract=p.checked(self.reg['strict_repair_role_birth_contract']);parent=next(r for r in contract['fixed_research_parent_rows'] if r['arm']=='control')
        for defect in ['valid','oldcritic','otherarm','failed','quiet','goal','provider','missingreview','artifacthash']:
            with self.subTest(defect=defect),tempfile.TemporaryDirectory(dir=ROOT) as directory:
                root=Path(directory);capsule={'rows':[],'SYNTHETIC_NO_NATIVE':True};contexts=[];localcontract=copy.deepcopy(contract)
                for origin,stage_name,pair in [(parent['job_id'],'research',parent['pair_id']),(critic['job_id'],'critique',self.reg['pair_id'])]:
                    f=root/stage_name;f.mkdir();required=['proposal.md','sources.json','witnesses.json','leads.json'] if stage_name=='research' else ['review.md'];artifacts=[]
                    for name in required:
                        file=f/name;file.write_bytes(b'SYNTHETIC SCIENCE-FREE ARTIFACT');artifacts.append({'path':str(file),'relative_path':stage_name+'/'+name,'sha256':p.sha(file),'bytes':file.stat().st_size})
                    actualjob=origin
                    if stage_name=='critique' and defect=='oldcritic':actualjob=parent['pair_id']+'-control-critique-a001'
                    freeze={'job_id':actualjob,'pair_id':pair,'arm':'control','stage':stage_name,'native_goal_starts':1,'operational_complete':True,'native_quiescent':True,'goal_target_id':'SYNTHETIC-'+stage_name,'artifacts':artifacts,'SYNTHETIC_NO_NATIVE':True}
                    if stage_name=='critique' and defect=='failed':freeze['operational_complete']=False
                    if stage_name=='critique' and defect=='quiet':freeze['native_quiescent']=False
                    if stage_name=='critique' and defect=='missingreview':freeze['artifacts']=[]
                    if stage_name=='critique' and defect=='artifacthash':freeze['artifacts'][0]['sha256']='0'*64
                    fp=f/'FREEZE.json';p.put(fp,freeze)
                    actual={'job_id':actualjob,'pair_id':pair,'arm':'control','stage':stage_name,'native_goal_starts':1,'native_goal_state':'complete','origin_goal_id':'SYNTHETIC-'+stage_name,
                      'observed_family':'Z','observed_model':{'providerId':'builtin:zai-coding-plan','modelId':'GLM-5.3-Flash'},'observed_effort':'max','output_freeze':p.ref(fp)}
                    if stage_name=='critique' and defect=='otherarm':actual['arm']='treatment'
                    if stage_name=='critique' and defect=='goal':actual['origin_goal_id']='WRONG-SYNTHETIC-ID'
                    if stage_name=='critique' and defect=='provider':actual['observed_model']['providerId']='WRONG-PROVIDER'
                    capsule['rows'].append(actual);ctx=f/'CONTEXT.json';p.put(ctx,{'schema':'er9.closed-native-source-context.v1','job_id':actualjob,'arm':'control','output_freeze':p.ref(fp),'native_goal_starts':1,'owned_quiet_positive':True,'native_model_io_or_candidate_semantics_included':False,'sources':[]});contexts.append(p.ref(ctx))
                    if stage_name=='research':next(r for r in localcontract['fixed_research_parent_rows'] if r['arm']=='control')['freeze_ref']=p.ref(fp)
                cp=root/'CAPSULE.json';p.put(cp,capsule);co=root/'CONTRACT.json';p.put(co,localcontract);reg=copy.deepcopy(self.reg);reg['strict_repair_role_birth_contract']=p.ref(co);rp=root/'REG.json';p.put(rp,reg)
                if defect=='valid':
                    self.assertEqual(len(role_birth.validated_ancestry(p.ref(rp),target['job_id'],p.ref(cp),contexts)),2)
                    plan=root/'PLAN.json';p.put(plan,{'schema':'er9.actual-role-birth-binding-plan.v1','registration_ref':p.ref(rp),'job_id':target['job_id'],'arm':'control','origin_job_ids':target['all_same_arm_prior_job_ids'],'capsule_ref':p.ref(cp),'closed_context_refs':contexts,'destination_root':str(root/'birth')})
                    receipt=p.checked(role_birth.bind(p.ref(plan)));bound=p.checked(receipt['stage_ref']);self.assertEqual(receipt['model_or_native_calls'],0);self.assertEqual(bound['max_seconds'],600)
                    self.assertFalse(any(parent['pair_id']+'-control-critique-a001' in path for path in bound['input_pins']))
                elif defect=='artifacthash':
                    plan=root/'PLAN.json';p.put(plan,{'schema':'er9.actual-role-birth-binding-plan.v1','registration_ref':p.ref(rp),'job_id':target['job_id'],'arm':'control','origin_job_ids':target['all_same_arm_prior_job_ids'],'capsule_ref':p.ref(cp),'closed_context_refs':contexts,'destination_root':str(root/'birth')})
                    with self.assertRaises(ValueError):role_birth.bind(p.ref(plan))
                else:
                    with self.assertRaises(ValueError):role_birth.validated_ancestry(p.ref(rp),target['job_id'],p.ref(cp),contexts)

    def test_previous_source_bytes_unchanged(self):
        snapshot=p.checked(p.ref(ROOT/'OLD_SOURCE_BYTE_SNAPSHOT.json'));self.assertGreater(len(snapshot['files']),6494)
        for path,digest in snapshot['files'].items():self.assertEqual(p.sha(path),digest)

    def test_unavailable_noncomplete_nonquiet_or_wrong_model_R_proof_blocks_READY(self):
        actual=p.checked(owner.SELECTION)
        for defect in ['missingR','noncomplete','nonquiet','GoalID','provider','missingR4']:
            with self.subTest(defect=defect),tempfile.TemporaryDirectory(dir=ROOT) as directory:
                root=Path(directory);selection=copy.deepcopy(actual)
                if defect=='missingR':
                    selection['rows']=[r for r in selection['rows'] if not (r['arm']=='control' and r['stage']=='research')]
                else:
                    row=next(r for r in selection['rows'] if r['arm']=='control' and r['stage']=='research');freeze=p.checked(row['freeze_ref'])
                    capsules=p.checked(selection['capsule_ref']);capsule=next(r for r in capsules['rows'] if r['job_id']==row['job_id'])
                    if defect=='noncomplete':freeze['operational_complete']=False
                    elif defect=='nonquiet':freeze['native_quiescent']=False
                    elif defect=='GoalID':capsule['origin_goal_id']='WRONG-SYNTHETIC-GOAL'
                    elif defect=='provider':capsule['observed_model']['providerId']='FOREIGN-PROVIDER'
                    else:freeze['artifacts']=[];row['artifact_inventory']=[]
                    fp=root/'FREEZE.json';p.put(fp,freeze);row['freeze_ref']=p.ref(fp);capsule['output_freeze']=p.ref(fp)
                    cp=root/'CAPSULE.json';p.put(cp,capsules);selection['capsule_ref']=p.ref(cp)
                with self.assertRaises(ValueError):owner.research_metadata(selection)

if __name__=='__main__':unittest.main(verbosity=2)
