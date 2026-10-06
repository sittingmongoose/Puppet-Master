"""Finite source/config fixtures, blocked processes, no candidate content reads."""
import copy,json,os,sys,tempfile,time,unittest
from pathlib import Path
from unittest.mock import patch
import prepare as owner
import role_birth
p=owner.p;ROOT=owner.ROOT

class BlindWarmRecoveryTests(unittest.TestCase):
    def setUp(self):
        self.box=p.checked(p.ref(ROOT/'OUTBOX.json'));self.requests=[p.checked(r) for r in self.box['requests']]

    def test_fixed_all_five14_warm_only_original_scope_canonical_inputs_no_grade(self):
        self.assertEqual(len(self.requests),5);self.assertEqual({(r['source_slot'],r['stage_jobs'][0]['arm']) for r in self.requests},owner.EXPECTED)
        selection=p.checked(owner.SELECTION);owner.positive_metadata(selection['rows']);self.assertEqual(len(selection['rows']),14)
        for r in self.requests:
            self.assertEqual(r['family'],'L');self.assertEqual(r['requested_model'],'GPT-6 Luna');self.assertEqual(r['requested_effort'],'max')
            self.assertFalse(r['automatic_retry']);self.assertFalse(r['extra_fresh_or_matched_target_credit']);self.assertFalse(r['source_scientific_grade_feedback_supplied'])
            row=r['stage_jobs'][0];stage=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
            self.assertEqual(stage['max_seconds'],1500);self.assertIsNone(stage['max_responses']);self.assertEqual(stage['requested_parent_response_cap'],150)
            self.assertEqual(stage['required_artifacts'],owner.FINAL+['out/critique/review.md'])
            self.assertEqual({Path(path).name for path in stage['input_pins']},owner.ALLOWED|{'common_criteria.json','delivery_role_manifest.json'})
            for path,digest in stage['input_pins'].items():self.assertEqual(p.sha(path),digest)
            self.assertFalse((Path(stage['workspace'])/'inputs/STAGE_CLOCK.json').exists());self.assertIsNone(stage['actual_future_clock_input_sha256'])
            task=Path(stage['prompt_file']).read_bytes();self.assertEqual(task,owner.task(stage['job_id']))
            self.assertIn(p.checked(owner.POLICY)['candidate_task'].encode(),task)
            # Policy private reason, eligibility metadata and evaluator findings
            # are not copied into Task or candidate source namespaces.
            self.assertNotIn(p.checked(owner.POLICY)['purpose'].encode(),task)
            self.assertNotIn(b'FIRST_COMPLETE_NATIVE_PIPELINE',task);self.assertNotIn(b'COMPLETE_MATCHED_NATIVE_PAIRS',task)

    def test_all_five_actual_sources_B_profiles_clock_declarations_before_anyGoal(self):
        full=p.checked(self.box['all_five_source_closure']);self.assertTrue(full['all_five_actual_sources_closed_before_ANY_recoveryGoal'])
        native=p.checked(owner.NATIVE);marker=p.checked(owner.MARKER);self.assertEqual(native['tools_source_pins_sha256'],owner.TOOLS['sha256']);self.assertEqual(marker['clock_native_pin'],owner.NATIVE)
        carrier=owner.module('test_carrier',p.LAB/'dev/tools/versions/v1.5-clock-telemetry/bundle_carrier.py');decl=owner.module('test_decl',owner.LUNA/'clock_declaration.py')
        for r in self.requests:
            row=r['stage_jobs'][0];s=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']});closure=p.checked(r['pipeline_closure'])
            self.assertTrue(closure['complete_actual_source_choices']);self.assertFalse(closure['dynamic_future_hashes_fabricated'])
            self.assertEqual(closure['source_common_criteria_ref'],owner.CRITERIA)
            self.assertEqual(s['declared_native_source_pin'],owner.NATIVE);self.assertEqual(s['declared_tool_source_pin'],owner.TOOLS)
            self.assertEqual(p.checked(s['clock_declaration']),decl.declaration(s['job_id']))
            profile=carrier.load_profile(s['bundle_profile']['path']);self.assertEqual(profile['stage_id'],s['job_id']);self.assertEqual(profile['stage_role'],'critic_final')
            self.assertEqual(profile['actor_binding']['writer_alias'],'pm_boundary/write_file');self.assertEqual(p.checked(s['required_delivery_role_manifest'])['entries'],[])
        contract=p.checked(self.box['role_binding_contract']);self.assertEqual(p.sha(contract['validator_ref']['path']),contract['validator_ref']['sha256'])

    def test_all14_actual_origin_metadata_authenticated_NO_candidate_bytes_or_nativeIO(self):
        count=0
        for ref in self.box['requests']:
            origins=role_birth.validated_origins(ref);count+=len(origins);self.assertEqual(sum(x['current_final'] for x in origins),1)
            for origin in origins:
                self.assertIsNone(origin['native_goal_id']);self.assertTrue(origin['native_thread_id']);self.assertTrue(origin['goal_identity_kind'])
                self.assertTrue(all(Path(a['relative_path']).parts[0] in {'research','critique','final'} for a in origin['artifacts']))
                self.assertFalse(any(Path(a['relative_path']).name=='DELIVERY_MANIFEST.json' for a in origin['artifacts']))
        self.assertEqual(count,14)

    def test_all_five_actual_Lproductionprepare_B_clock_config_fixtures_NO_process_orGoal(self):
        production=owner.module('actual_L_prepare',owner.LUNA/'clock_prepare.py');decl=owner.module('actual_decl',owner.LUNA/'clock_declaration.py')
        tool=owner.module('actual_binding',p.LAB/'dev/tools/versions/v1.5-clock-telemetry/operator_binding.py')
        resources=owner.module('actual_resource',p.LAB/'dev/luna-route/resource_slice.py');count=0
        for r in self.requests:
            row=r['stage_jobs'][0];stage=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']});card=p.checked({'path':r['card_path'],'sha256':r['card_sha256']})
            with tempfile.TemporaryDirectory(dir=ROOT) as directory:
                root=Path(directory);ws=root/'workspace';(ws/'inputs').mkdir(parents=True);(ws/'out').mkdir();private=root/'private';private.mkdir()
                science='SYNTHETIC NO SCIENCE OR CANDIDATE ANSWER\r\nα\t  ';(ws/'TASK.md').write_bytes(science.encode())
                birth=time.monotonic_ns()-10**9;total=birth+1500*10**9;action=total-15*10**9;unit='er9mem'+'a'*32+'.slice';uid=os.getuid()
                resource={'schema':'er9.luna.private-memory-profile.v1','label':stage['job_id'],'slice_unit':unit,
                    'slice_cgroup':f'/user.slice/user-{uid}.slice/user@{uid}.service/'+unit,'aggregate_memory_max_bytes':resources.TOTAL,
                    'component_memory_max_bytes':resources.CAPS,'memory_swap_max_bytes':0,'original_birth_monotonic_ns':birth,
                    'original_total_stop_monotonic_ns':total,'reader_sha256':p.sha(p.LAB/'dev/luna-route/resource_slice.py'),'SYNTHETIC_NO_KERNEL_OR_NATIVE':True}
                rp=root/'resource.json';p.put(rp,resource);rp.chmod(0o600);declaration=root/'clock.json';p.put(declaration,decl.declaration(stage['job_id']))
                built=tool.binding(stage_id=stage['job_id'],stage_role='critic_final',case_id=card['case_id'],arm_id=stage['arm'],method_factors=[card['method_id']],
                  actor_binding={'stage_id':stage['job_id'],'family':'Luna','model':'gpt-6-luna','effort':'max','native_goal_id':None,'writer_alias':'pm_boundary/write_file'},entries=[],complete_final_role=True)
                (ws/'inputs/delivery_role_manifest.json').write_bytes(built['manifest_bytes']);bp=root/'bundle.json';bp.write_bytes(built['profile_bytes']);bp.chmod(0o600)
                import hashlib
                digest=hashlib.sha256(science.encode()).hexdigest()
                with patch('subprocess.Popen',side_effect=AssertionError('NO process/native')),patch('subprocess.run',side_effect=AssertionError('NO process/native')):
                    result=production.prepare_stage(workspace=ws,private=private,label=stage['job_id'],original_birth_monotonic_ns=birth,max_seconds=1500,
                      native_stop_monotonic_ns=action,total_stop_monotonic_ns=total,resource_profile=rp,clock_declaration=declaration,
                      clock_declaration_sha256=p.sha(declaration),execution_enabled=True,public_get=True,scientific_body=science,goal_objective=science,
                      source_prompt_sha256=digest,source_TASK_sha256=digest,bundle_profile=bp)
                cfg=result['config'];clock=cfg['initial_clock_metadata']['stage_clock'];self.assertEqual(clock['original_stage_allocation_seconds'],1500)
                self.assertEqual(clock['original_candidate_action_deadline_monotonic_ns'],action);self.assertEqual(clock['original_total_cleanup_stop_monotonic_ns'],total)
                self.assertEqual(result['native_input'][0]['text'],science);self.assertEqual(result['native_input'][1]['text'],cfg['initial_clock_metadata_utf8'])
                self.assertEqual((ws/'inputs/STAGE_CLOCK.json').read_bytes(),cfg['initial_clock_metadata_utf8'].encode())
                self.assertFalse(result['native_calls_or_processes_started']);self.assertTrue(cfg['native_bundle_enabled']);self.assertEqual(len(cfg['tool_allowlist']),5)
                self.assertEqual((ws/'TASK.md').read_bytes(),science.encode());count+=1
        self.assertEqual(count,5)

    def test_fixed_OP_metadata_rejects_grade_subset_wrong_scope_incomplete_quiet(self):
        selection=p.checked(owner.SELECTION)
        for defect in ['subset','scope','failed','quiet','release']:
            data=copy.deepcopy(selection['rows'])
            if defect=='subset':data.pop()
            elif defect=='scope':data[0]['arm']='control'
            elif defect=='failed':data[0]['operational_complete']=False
            elif defect=='quiet':data[0]['native_quiescent']=False
            else:data[0]['permit_release_confirmed']=False
            with self.assertRaises(ValueError):owner.positive_metadata(data)
        with self.assertRaises(ValueError):role_birth.validated_origins(self.box['requests'][0],{'path':'UNDECLARED','sha256':'0'*64})

    def test_wrong_current_origin_identity_model_case_context_required_roles_no_read_answers(self):
        # Mutated science-free ADMINISTRATIVE fixture copies only; actual candidate
        # artifacts remain unread and are never copied by this validator.
        actual_selection=p.checked(owner.SELECTION);actual_reg=p.checked(self.box['requests'][0])
        for defect in ['arm','model','native','case','context','missing']:
            with self.subTest(defect=defect),tempfile.TemporaryDirectory(dir=ROOT) as directory:
                root=Path(directory);sel=copy.deepcopy(actual_selection);reg=copy.deepcopy(actual_reg)
                capsule=p.checked(sel['capsule_ref']);origin=next(x for x in sel['rows'] if x['job_id']==reg['stage_jobs'][0]['warm_origin_job_ids'][0])
                observed=next(x for x in capsule['rows'] if x['job_id']==origin['job_id'])
                if defect=='arm':observed['arm']='OTHER-ARM'
                elif defect=='model':observed['observed_model']='wrong-model'
                elif defect=='native':observed['native_goal_state']='running'
                elif defect=='case':
                    card=p.checked(origin['card_ref']);card['case_id']='OTHER-CASE';file=root/'CARD.json';p.put(file,card);origin['card_ref']=p.ref(file)
                elif defect=='context':
                    context=p.checked(origin['closed_source_context_ref']);context['owned_quiet_positive']=False;file=root/'CONTEXT.json';p.put(file,context);origin['closed_source_context_ref']=p.ref(file)
                else:origin['artifacts']=[]
                cp=root/'CAPSULE.json';p.put(cp,capsule);sel['capsule_ref']=p.ref(cp);sp=root/'SELECTION.json';p.put(sp,sel);reg['warm_origin_selection_ref']=p.ref(sp)
                rp=root/'REG.json';p.put(rp,reg)
                with self.assertRaises(ValueError):role_birth.validated_origins(p.ref(rp))

    def test_every_original_source_byte_unchanged(self):
        snapshot=p.checked(p.ref(ROOT/'OLD_SOURCE_BYTE_SNAPSHOT.json'));self.assertGreater(len(snapshot['files']),6000)
        for path,digest in snapshot['files'].items():self.assertEqual(p.sha(path),digest)

    def test_synthetic_operator_birth_copies_complete_current_roles_and_error_captures_NO_evaluator_metadata(self):
        real=p.checked(owner.SELECTION);realcaps=p.checked(real['capsule_ref']);registration=p.checked(self.box['requests'][0])
        with tempfile.TemporaryDirectory(dir=ROOT) as directory:
            root=Path(directory);selection=copy.deepcopy(real);capsule=copy.deepcopy(realcaps)
            # Replace artifacts for ALL14 proof rows with explicitly synthetic
            # bytes. No actual candidate body is opened or copied by this test.
            for n,row in enumerate(selection['rows']):
                folder=root/str(n);folder.mkdir();freeze=p.checked(row['freeze_ref']);freeze['SYNTHETIC_NO_NATIVE_ACTOR']=True;artifacts=[]
                for i,artifact in enumerate(row['artifacts']):
                    file=folder/(str(i)+'.fixture');file.write_bytes(b'SYNTHETIC SCIENCE-FREE CURRENT-ROLE DATA')
                    artifacts.append({**artifact,'path':str(file),'sha256':p.sha(file),'bytes':file.stat().st_size})
                freeze['artifacts']=artifacts;fp=folder/'FREEZE.json';p.put(fp,freeze);row.update(freeze_ref=p.ref(fp),artifacts=artifacts)
                observed=next(c for c in capsule['rows'] if c['job_id']==row['job_id']);observed['output_freeze']=p.ref(fp)
                context=p.checked(row['closed_source_context_ref']);context['output_freeze']=p.ref(fp);context['sources']=[]
                capture=folder/'public_captures';capture.mkdir()
                for status in [200,404]:
                    body=capture/(str(status)+'.body');body.write_bytes(b'SYNTHETIC PUBLIC SOURCE NONE');metadata=capture/(str(status)+'.json');p.put(metadata,{'SYNTHETIC_NO_NATIVE':True})
                    context['sources'].append({'body':{**p.ref(body),'bytes':body.stat().st_size},'metadata':p.ref(metadata),
                        'requested_url':'https://example.invalid/fixture','actual_url':'https://example.invalid/fixture','status':status,
                        'body_complete':status==200,'source_version':None,'capture_id':'SYNTHETIC-'+str(status)})
                cp=folder/'CONTEXT.json';p.put(cp,context);row['closed_source_context_ref']=p.ref(cp)
            caps=root/'CAPSULE.json';p.put(caps,capsule);selection['capsule_ref']=p.ref(caps);sel=root/'SELECTION.json';p.put(sel,selection)
            registration['warm_origin_selection_ref']=p.ref(sel);rp=root/'REG.json';p.put(rp,registration);row=registration['stage_jobs'][0]
            plan=root/'PLAN.json';p.put(plan,{'schema':'er9.actual-role-birth-binding-plan.v1','registration_ref':p.ref(rp),'job_id':row['job_id'],
                'arm':row['arm'],'origin_job_ids':row['warm_origin_job_ids'],'selection_ref':p.ref(sel),'destination_root':str(root/'native-birth')})
            with patch('subprocess.Popen',side_effect=AssertionError('NO process/native')),patch('subprocess.run',side_effect=AssertionError('NO process/native')):
                receipt=p.checked(role_birth.bind(p.ref(plan)))
            bound=p.checked(receipt['stage_ref']);self.assertTrue(receipt['warm_derivative_only']);self.assertFalse(receipt['candidate_inputs_contain_evaluator_or_supervision_metadata'])
            self.assertEqual(bound['max_seconds'],1500);self.assertIsNone(bound['max_responses']);self.assertEqual(receipt['model_or_native_calls'],0)
            self.assertEqual(bound['prompt_sha256'],p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})['prompt_sha256'])
            for path in bound['input_pins']:
                self.assertFalse(any(x in Path(path).parts for x in ['native_role_proofs','evaluation','evaluator','supervision']))
                self.assertNotIn('DELIVERY_MANIFEST.json',path)
            for origin in row['warm_origin_job_ids']:
                index=p.checked(p.ref(Path(bound['workspace'])/'inputs/source_context'/origin/'index.json'))
                self.assertEqual([x['status'] for x in index['sources']],[200,404])
            file=next(Path(path) for path in bound['input_pins'] if '/prior/' in path);file.write_bytes(b'TAMPER')
            self.assertNotEqual(p.sha(file),bound['input_pins'][str(file)])
            with self.assertRaises(ValueError):role_birth.bind(p.ref(plan))

if __name__=='__main__':unittest.main(verbosity=2)
