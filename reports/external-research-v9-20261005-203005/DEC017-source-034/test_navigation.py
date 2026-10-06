"""Deterministic index, actual read_file/23 config paths; synthetic imports only."""
import copy,hashlib,json,os,sys,tempfile,time,unittest
from pathlib import Path
from unittest.mock import patch
import source_builder as owner
import prior_index,locator,finalize_index,existing_bound_binder,four_final_binder
p=owner.p;ROOT=owner.ROOT

class NavigationTests(unittest.TestCase):
    def setUp(self):self.box=p.checked(p.ref(ROOT/'OUTBOX.json'))

    def imported_fixture(self,root):
        ws=root/'workspace';(ws/'inputs/prior/J/research').mkdir(parents=True);pins={};rows=[]
        for name,raw in [('z.md',b'SYNTHETIC NO SCIENTIFIC CONTENT'),('a.json',b'{"SYNTHETIC":true}')]:
            rel='inputs/prior/J/research/'+name;path=ws/rel;path.write_bytes(raw);pins[str(path)]=p.sha(path)
            rows.append({'path':rel,'sha256':p.sha(path),'bytes':len(raw),'origin_job_id':'J','origin_role':'research','origin_arm_id':'control'})
        neutral=ws/'inputs/brief.md';neutral.write_bytes(b'SYNTHETIC NEUTRAL');pins[str(neutral)]=p.sha(neutral)
        auth={'schema':'er9.accepted-own-prior-imports.v1','authenticated_same_arm':True,'job_id':'T','pair_id':'P','arm':'control','imports':rows}
        return ws,pins,{'inputs/brief.md':p.sha(neutral)},auth

    def test_deterministic_exact_sorted_all_imports_no_grade_or_relevance_or_contents(self):
        with tempfile.TemporaryDirectory(dir=ROOT) as directory:
            ws,pins,neutral,auth=self.imported_fixture(Path(directory));a=prior_index.encode(ws,pins,neutral,auth)
            b=prior_index.encode(ws,dict(reversed(list(pins.items()))),neutral,{**auth,'imports':list(reversed(auth['imports']))});self.assertEqual(a,b)
            obj=json.loads(a);self.assertEqual([x['path'] for x in obj['files']],sorted(x['path'] for x in auth['imports']))
            self.assertEqual(len(obj['files']),2);self.assertNotIn(b'SYNTHETIC NO SCIENTIFIC CONTENT',a);self.assertNotIn(b'brief.md',a)
            self.assertTrue(all(set(x)=={'path','sha256','bytes','origin_job_id','origin_role'} for x in obj['files']))
            result=prior_index.freeze(ws,pins,neutral,auth);self.assertEqual(result['sha256'],hashlib.sha256(a).hexdigest())
            with self.assertRaises(FileExistsError):prior_index.freeze(ws,pins,neutral,auth)

    def test_traversal_symlink_outside_duplicate_missing_wrongsha_wronglength_hardlink_and_forbidden_fields(self):
        for defect in ['traversal','absolute','noncanonical','symlink','outside','duplicate','missing','sha','length','hardlink','otherarm','grade','omission']:
            with self.subTest(defect=defect),tempfile.TemporaryDirectory(dir=ROOT) as directory:
                root=Path(directory);ws,pins,neutral,auth=self.imported_fixture(root);row=auth['imports'][0];file=ws/row['path']
                if defect=='traversal':row['path']='inputs/../outside'
                elif defect=='absolute':row['path']='/inputs/prior/x'
                elif defect=='noncanonical':row['path']='inputs//prior/x'
                elif defect=='symlink':file.unlink();file.symlink_to(ws/auth['imports'][1]['path'])
                elif defect=='outside':pins[str(root/'outside')]='0'*64
                elif defect=='duplicate':auth['imports'].append(copy.deepcopy(row))
                elif defect=='missing':file.unlink()
                elif defect=='sha':file.write_bytes(b'TAMPER')
                elif defect=='length':row['bytes']+=1
                elif defect=='hardlink':os.link(file,root/'alias')
                elif defect=='otherarm':row['origin_arm_id']='treatment'
                elif defect=='grade':row['relevance']='preferred'
                else:auth['imports'].pop()
                with self.assertRaises((ValueError,FileNotFoundError)):prior_index.encode(ws,pins,neutral,auth)

    def test_exact_candidate_visible_existing_read_file_locator_and_schema_no_new_tool(self):
        server=owner.module('actual_read_file',p.LAB/'dev/tools/versions/v1.5-clock-telemetry/source_capture/tool_server.py')
        schemas=copy.deepcopy(server.TOOLS)
        with tempfile.TemporaryDirectory(dir=ROOT) as directory:
            ws,pins,neutral,auth=self.imported_fixture(Path(directory));result=prior_index.freeze(ws,pins,neutral,auth);server.ROOT=str(ws)
            response=server.perform('read_file',{'path':prior_index.INDEX});self.assertIn('inputs/prior/J/research/a.json',json.dumps(response))
            self.assertEqual(server.read_raw(prior_index.INDEX),Path(result['path']).read_bytes());self.assertEqual(server.TOOLS,schemas)
            self.assertIn(b'mcp__pm_boundary__read_file',locator.render());self.assertIn(b'{"path":"inputs/prior_file_index.json"}',locator.render())

    def test_exact19_oldIDs_plus4_new60060_final_only_scope_and_allchoices(self):
        self.assertEqual(len(self.box['existing_descendant_overlays']),19);self.assertEqual(self.box['current_eligible_existing_count'],18);self.assertEqual(self.box['current_blocked_existing_count'],1)
        blocked=[r for r in self.box['existing_descendant_overlays'] if r['current_parent_blocked']];self.assertEqual(len(blocked),1);self.assertEqual(blocked[0]['source_slot'],'C-04');self.assertEqual(blocked[0]['arm'],'treatment')
        self.assertEqual(self.box['existing_overlay_additional_jobs'],0);self.assertEqual(self.box['new_native_role_count'],4);self.assertEqual(self.box['new_total_seconds'],2400)
        owner.positive_four_parents(p.checked(owner.PARENTS));self.assertFalse(self.box['extra_logical_target_or_clean_unrepaired_credit'])
        for overlay in self.box['existing_descendant_overlays']:self.assertFalse(overlay['wholepair_firstR_unentered_claim']);self.assertTrue(overlay['original_birth_authenticated_input_rule_retained'])
        jobs=[]
        for ref in self.box['four_final_requests']:
            reg=p.checked(ref)
            self.assertEqual({r['arm'] for r in reg['stage_jobs']},{'control','treatment'})
            for row in reg['stage_jobs']:
                self.assertEqual(row['stage'],'revision');self.assertEqual(row['max_seconds'],600);self.assertEqual(row['max_responses'],60);jobs.append(row['job_id'])
        self.assertEqual(set(jobs),set(self.box['four_new_final_job_ids']))

    def specs(self):
        result=[p.checked(x['navigation_template_ref']) for x in self.box['existing_descendant_overlays']]
        for ref in self.box['four_final_requests']:
            for row in p.checked(ref)['stage_jobs']:result.append(p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']}))
        return result

    def test_all23_Task_scientific_prefix_locator_exactclock_cap_role_tool_model_parity(self):
        v=owner.runtime()
        for s in self.specs():
            old=p.checked(s['source_original_stage_ref']);raw=Path(old['prompt_file']).read_bytes();_,_,_,_,fragment=v.source_choice(s['complete_final_owner_role']);suffix=fragment.render(s['max_seconds'])
            expected=raw[:-len(suffix)]+(owner.identity(s['job_id']) if s.get('source_new_final_diagnostic') else b'')+locator.render()+suffix
            self.assertEqual(Path(s['prompt_file']).read_bytes(),expected)
            for field in p.INVARIANTS:self.assertEqual(s.get(field),old.get(field))
            self.assertEqual(s['glm_resource']['model'],old['glm_resource']['model']);self.assertEqual(s['glm_resource']['effort'],old['glm_resource']['effort'])
            self.assertEqual(s['glm_resource']['tools_config_builder'],old['glm_resource']['tools_config_builder']);fragment.validate_packet(s)
            self.assertFalse((Path(s['workspace'])/prior_index.INDEX).exists());self.assertIsNone(s['actual_future_prior_index_sha256'])
            if s['complete_final_owner_role'] and s['glm_resource'].get('bundle_profile'):
                profile=p.checked(s['glm_resource']['bundle_profile']);self.assertEqual(profile['stage_id'],s['job_id'])
                self.assertEqual(p.checked(s['required_delivery_role_manifest'])['entries'],[])

    def production_fixture(self,s,directory):
        original_prepare=owner.module('original_owner',p.ROOT/'confirmation-clock-fresh-retest-001/prepare.py');previous=sys.modules.get('prepare');sys.modules['prepare']=original_prepare
        try:production=owner.module('actual_Gmetadata',p.ROOT/'confirmation-clock-fresh-retest-001/production_metadata.py')
        finally:
            if previous is None:sys.modules.pop('prepare',None)
            else:sys.modules['prepare']=previous
        root=Path(directory);ws=root/'workspace';(ws/'inputs').mkdir(parents=True);(ws/'out').mkdir();spec=copy.deepcopy(s)
        (ws/'TASK.md').write_bytes(Path(s['prompt_file']).read_bytes());spec.update(workspace=str(ws),prompt_file=str(ws/'TASK.md'),out=str(root/'native'),input_pins={})
        for path,digest in s['input_pins'].items():
            target=ws/Path(path).relative_to(s['workspace']);target.write_bytes(Path(path).read_bytes());spec['input_pins'][str(target)]=digest
        if s['complete_final_owner_role'] and s['glm_resource'].get('bundle_profile') is None:
            # Original dynamic carrier still unborn: explicitly labelled
            # synthetic empty valid binding for config fixture only. A separate
            # populated-reference preservation test below exercises the adapter.
            binding=owner.module('fixture_original_dynamic_binding',p.LAB/'dev/tools/versions/v1.5-clock-telemetry/operator_binding.py')
            built=binding.binding(stage_id=s['job_id'],stage_role='final_author',case_id='SYNTHETIC-CASE',arm_id=s['arm'],method_factors=['V01'],
              actor_binding={'stage_id':s['job_id'],'family':'GLM','model':'builtin:zai-coding-plan/GLM-5.3-Flash','effort':'max','native_goal_id':None,'writer_alias':'write_text'},entries=[],complete_final_role=True)
            mp=ws/'inputs/delivery_role_manifest.json';mp.write_bytes(built['manifest_bytes']);spec['input_pins'][str(mp)]=p.sha(mp)
            pp=root/'ORIGINAL_DYNAMIC_PROFILE.json';pp.write_bytes(built['profile_bytes']);pp.chmod(0o600);spec['glm_resource']['bundle_profile']=p.ref(pp)
        file=ws/'inputs/prior/SYNTHETIC/research/proposal.md';file.parent.mkdir(parents=True);file.write_bytes(b'SYNTHETIC SCIENCE-FREE DATA');spec['input_pins'][str(file)]=p.sha(file)
        neutral={Path(path).relative_to(ws).as_posix():digest for path,digest in spec['input_pins'].items() if path!=str(file)}
        auth={'schema':'er9.accepted-own-prior-imports.v1','authenticated_same_arm':True,'job_id':s['job_id'],'pair_id':s['pair_id'],'arm':s['arm'],
          'imports':[{'path':file.relative_to(ws).as_posix(),'sha256':p.sha(file),'bytes':file.stat().st_size,'origin_arm_id':s['arm'],'origin_job_id':'SYNTHETIC','origin_role':'research'}]}
        index=prior_index.freeze(ws,spec['input_pins'],neutral,auth);spec['input_pins'][index['path']]=index['sha256']
        spec['glm_resource'].update(capture_dir=str(root/'captures'),evidence_dir=str(root/'evidence'))
        engine,clock,fragment,profile=production.modules(spec);birth=time.monotonic_ns()-10**9;total=birth+s['max_seconds']*10**9;action=total-30*10**9;uid=os.getuid();unit='er9mem'+'a'*32+'.slice'
        resource={'schema':'er9.luna.private-memory-profile.v1','label':s['job_id'],'slice_unit':unit,'slice_cgroup':f'/user.slice/user-{uid}.slice/user@{uid}.service/'+unit,
          'aggregate_memory_max_bytes':profile.reader.TOTAL,'component_memory_max_bytes':profile.reader.CAPS,'memory_swap_max_bytes':0,
          'original_birth_monotonic_ns':birth,'original_total_stop_monotonic_ns':total,'reader_sha256':profile.API_SHA,'SYNTHETIC_NO_NATIVE':True}
        rp=root/'resource.json';p.put(rp,resource);rp.chmod(0o600)
        binding={'job_id':s['job_id'],'pair_id':s['pair_id'],'arm':s['arm'],'original_birth_monotonic_ns':birth,'original_total_stop_monotonic_ns':total,
          'original_stage_allocation_seconds':s['max_seconds'],'native_stop_monotonic_ns':action,'controller_source':p.ref(engine/'stage_worker.py'),'SYNTHETIC_NO_NATIVE':True}
        bp=root/'RESOURCE_BINDING.json';p.put(bp,binding)
        cfg=profile.tool_module().mcp_configs(ws,capture_dir=root/'baseline-captures',evidence_dir=root/'baseline-evidence',execution_enabled=s['glm_resource']['execution_enabled'],public_get=s['glm_resource']['public_get'])
        cp=root/'original-config.json';p.put(cp,cfg);spec.update(tools_config=str(cp),tools_config_sha256=p.sha(cp))
        return production,spec,rp,bp,binding

    def test_all23_actual_Gproduction_metadata_config_index_input_beforeGoal_and_original_actionclock(self):
        count=0
        for s in self.specs():
            with tempfile.TemporaryDirectory(dir=ROOT) as directory:
                production,spec,rp,bp,binding=self.production_fixture(s,directory)
                with patch('subprocess.Popen',side_effect=AssertionError('NO process/native')),patch('subprocess.run',side_effect=AssertionError('NO process/native')):
                    result=production.prepare_metadata(spec,rp,bp,Path(directory)/'sealed')
                self.assertEqual(result['native_process_or_Goal_calls'],0);self.assertEqual(p.sha(spec['prompt_file']),s['prompt_sha256'])
                clock=result['config']['initial_clock_metadata']['stage_clock'];self.assertEqual(clock['original_stage_allocation_seconds'],s['max_seconds'])
                self.assertEqual(clock['original_candidate_action_deadline_monotonic_ns'],binding['native_stop_monotonic_ns'])
                if s.get('source_new_final_diagnostic'):self.assertEqual(clock['original_total_cleanup_stop_monotonic_ns']-clock['original_candidate_action_deadline_monotonic_ns'],30*10**9)
                self.assertEqual(result['config']['native_bundle_enabled'],s['complete_final_owner_role']);count+=1
        self.assertEqual(count,23)

    def test_four_actual_parent_sets_current_complete_full_quiet_release_no_substitution(self):
        selection=p.checked(owner.PARENTS);owner.positive_four_parents(selection)
        for ref in self.box['four_final_requests']:
            for row in p.checked(ref)['stage_jobs']:self.assertEqual(len(four_final_binder.validated_parents(ref,row['job_id'])),2)
        for defect in ['missing','otherarm','wrongbudget','incomplete','nonquiet']:
            with tempfile.TemporaryDirectory(dir=ROOT) as directory:
                data=copy.deepcopy(selection)
                if defect=='missing':data['rows'].pop()
                elif defect=='otherarm':data['rows'][0]['parents'][0]['arm']='treatment'
                elif defect=='wrongbudget':data['rows'][0]['max_seconds']=601
                else:
                    parent=data['rows'][0]['parents'][0];freeze=p.checked(parent['freeze_ref']);freeze['operational_complete' if defect=='incomplete' else 'native_quiescent']=False
                    fp=Path(directory)/'FREEZE.json';p.put(fp,freeze);parent['freeze_ref']=p.ref(fp)
                with self.assertRaises(ValueError):owner.positive_four_parents(data)

    def test_existing_unentered_bound_adapter_exact_pin_delta_clone_and_changed_Task_not_live_edit(self):
        overlay=self.box['existing_descendant_overlays'][0];template=p.checked(overlay['navigation_template_ref']);old=p.checked(overlay['source_original_descriptor_ref'])
        with tempfile.TemporaryDirectory(dir=ROOT) as directory:
            root=Path(directory);ws=root/'old-bound';(ws/'inputs').mkdir(parents=True);bound=copy.deepcopy(old);bound.update(workspace=str(ws),input_pins={})
            for path,d in old['input_pins'].items():
                target=ws/Path(path).relative_to(old['workspace']);target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(Path(path).read_bytes());bound['input_pins'][str(target)]=d
            file=ws/'inputs/prior/SYNTHETIC/research/proposal.md';file.parent.mkdir(parents=True);file.write_bytes(b'SYNTHETIC SCIENCE-FREE');bound['input_pins'][str(file)]=p.sha(file)
            bp=root/'BOUND.json';p.put(bp,bound);ap=root/'AUTH.json';p.put(ap,{'schema':'er9.accepted-own-prior-imports.v1','authenticated_same_arm':True,'job_id':old['job_id'],'pair_id':old['pair_id'],'arm':old['arm'],
              'imports':[{'path':file.relative_to(ws).as_posix(),'sha256':p.sha(file),'bytes':file.stat().st_size,'origin_arm_id':old['arm']} ]})
            plan=root/'PLAN.json';p.put(plan,{'schema':'er9.unentered-own-prior-navigation-binding-plan.v1','native_goal_starts':0,'launch_intents':0,
              'navigation_template_ref':overlay['navigation_template_ref'],'already_authenticated_bound_stage_ref':p.ref(bp),'authorized_imports_ref':p.ref(ap),'destination_root':str(root/'new-birth')})
            receipt=p.checked(existing_bound_binder.bind(p.ref(plan)));new=p.checked(receipt['stage_ref']);self.assertEqual(new['prompt_sha256'],template['prompt_sha256'])
            self.assertEqual(new['job_id'],old['job_id']);self.assertEqual(receipt['new_native_jobs'],0);self.assertEqual(p.sha(file),bound['input_pins'][str(file)])
            self.assertEqual(len(json.loads(Path(receipt['index_ref']['path']).read_text())['files']),1)
            with self.assertRaises(ValueError):existing_bound_binder.bind(p.ref(plan))

    def test_old_source_bytes_unchanged(self):
        snapshot=p.checked(p.ref(ROOT/'OLD_SOURCE_BYTE_SNAPSHOT.json'));self.assertGreater(len(snapshot['files']),6506)
        for path,digest in snapshot['files'].items():self.assertEqual(p.sha(path),digest)

    def test_original_populated_carrier_profile_manifest_SHA_exact_preserved_after_index(self):
        overlay=next(r for r in self.box['existing_descendant_overlays'] if r['source_slot']=='I-09' and r['stage']=='revision')
        template=p.checked(overlay['navigation_template_ref']);old=p.checked(overlay['source_original_descriptor_ref'])
        self.assertIsNone(template['glm_resource']['bundle_profile'])
        module=owner.module('synthetic_bundle_fixture',p.LAB/'dev/tools/versions/v1.5-clock-telemetry/test_bundle.py')
        with tempfile.TemporaryDirectory(dir=ROOT) as directory:
            root=Path(directory);fixture=module.BundleTests(methodName='test_inline_exact_bytes_atomic_manifest_independent_status')
            original_temp=module.tempfile.TemporaryDirectory
            with patch.object(module.tempfile,'TemporaryDirectory',side_effect=lambda *a,**k:original_temp(*a,**{**k,'dir':root})):
                fixture.setUp()
            try:
                fixture.stage=old['job_id'];fixture.arm=old['arm'];fixture.add_references();ws=fixture.ws
                for path,d in old['input_pins'].items():
                    target=ws/Path(path).relative_to(old['workspace']);target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(Path(path).read_bytes())
                pins={str(path):p.sha(path) for path in (ws/'inputs').rglob('*') if path.is_file()}
                bound=copy.deepcopy(old);bound.update(workspace=str(ws),input_pins=pins);bound['glm_resource']['bundle_profile']=p.ref(fixture.profile_path)
                bp=root/'BOUND.json';p.put(bp,bound);original_profile=p.ref(fixture.profile_path);original_manifest=p.ref(ws/'inputs/delivery_role_manifest.json')
                neutral={Path(path).relative_to(old['workspace']).as_posix() for path in old['input_pins']}
                auth={'schema':'er9.accepted-own-prior-imports.v1','authenticated_same_arm':True,'job_id':old['job_id'],'pair_id':old['pair_id'],'arm':old['arm'],
                  'imports':[{'path':Path(path).relative_to(ws).as_posix(),'sha256':d,'bytes':Path(path).stat().st_size,'origin_arm_id':old['arm']} for path,d in pins.items() if Path(path).relative_to(ws).as_posix() not in neutral]}
                ap=root/'AUTH.json';p.put(ap,auth);plan=root/'PLAN.json';p.put(plan,{'schema':'er9.unentered-own-prior-navigation-binding-plan.v1','native_goal_starts':0,'launch_intents':0,
                  'navigation_template_ref':overlay['navigation_template_ref'],'already_authenticated_bound_stage_ref':p.ref(bp),'authorized_imports_ref':p.ref(ap),'destination_root':str(root/'new-birth')})
                receipt=p.checked(existing_bound_binder.bind(p.ref(plan)));stage=p.checked(receipt['stage_ref']);self.assertEqual(stage['glm_resource']['bundle_profile'],original_profile)
                self.assertEqual(p.sha(Path(stage['workspace'])/'inputs/delivery_role_manifest.json'),original_manifest['sha256']);self.assertTrue(receipt['populated_or_empty_original_adoption_semantics_unchanged'])
                profile=module.carrier.load_profile(fixture.profile_path);closure=module.carrier.reference_closure(profile,lambda rel:(Path(stage['workspace'])/rel).read_bytes());self.assertEqual(len(closure),4)
                self.assertEqual(p.sha(fixture.profile_path),original_profile['sha256'])
            finally:fixture.tearDown()

if __name__=='__main__':unittest.main(verbosity=2)
