import copy,json,tempfile,unittest,sys,hashlib
from pathlib import Path
from unittest.mock import patch
import prepare as owner
import syntax_gate,paired_gate,role_birth
p=owner.p;ROOT=owner.ROOT

class RepairTests(unittest.TestCase):
 def specs(self):
  reg=p.checked(p.ref(ROOT/'registration.json'))
  return [p.checked({'path':r['stage_json'],'sha256':r['stage_sha256']}) for r in reg['stage_jobs']]
 def test_positive_unique_syntax_rules_and_valid_control_exact(self):
  for old,new in [(b'{"a" 1}',b'{"a":1}'),(b'{"a":1 "b":2}',b'{"a":1,"b":2}'),(b'[1,2,]',b'[1,2]'),(b'{"a":1,}',b'{"a":1}')]:
   with self.subTest(old=old):
    result=syntax_gate.assess_sources(old,new);self.assertEqual(result['status'],'PASS_UNIQUE_SINGLE_SYNTAX_EDIT');self.assertEqual(result['source_semantics_restored'],'UNASSESSED')
  self.assertEqual(syntax_gate.assess_sources(b'{"a":1}',b'{"a":1}')['status'],'PASS_EXACT_VALID_ORIGINAL')
 def test_ambiguity_nonstructural_bracket_order_escapes_multiedit_and_invalid_denied(self):
  cases=[(b'[1,,2]',b'[1,2]'),(b'{"a":1 "b":2}',b'{"a":1,"b":3}'),(b'{"a":1 "b":2}',b'{"b":2,"a":1}'),
   (b'{"a" 1 "b":2}',b'{"a":1,"b":2}'),(b'[1 2]',b'{"1":2}'),(b'{"a":"unterminated}',b'{"a":"unterminated"}'),
   (b'{"a":01}',b'{"a":1}'),(b'{"a":1}',b'{ "a":1}'),(b'{"a":1 "s":"x"}',b'{"a":1,"s":"\\u0078"}'),(b'{"a":1,}',b'{"a":1.0}')]
  for old,new in cases:
   with self.subTest(old=old):self.assertEqual(syntax_gate.assess_sources(old,new)['status'],'UNASSESSED_REJECT')
  self.assertEqual(syntax_gate.assess_sources(b'[1,,2]',b'[1,2]')['reason_code'],'ambiguous_structural_repair')
  self.assertEqual(syntax_gate.assess_sources(b'x'*(syntax_gate.MAX_BYTES+1),b'null')['status'],'UNASSESSED_REJECT')
  with patch.object(syntax_gate,'MAX_ENUM_SECONDS',-1):self.assertEqual(syntax_gate.assess_sources(b'[1 2]',b'[1,2]')['status'],'UNASSESSED_REJECT')
 def test_research_other3_exact_no_host_output_and_fullset(self):
  old={'proposal.md':b'SYNTHETIC','sources.json':b'{"k" 1}','leads.json':b'[]','witnesses.json':b'[]'};new={**old,'sources.json':b'{"k":1}'}
  self.assertTrue(syntax_gate.assess_research4(old,new)['status'].startswith('PASS_'))
  for name in ['proposal.md','leads.json','witnesses.json']:
   changed={**new,name:new[name]+b' '};self.assertEqual(syntax_gate.assess_research4(old,changed)['status'],'UNASSESSED_REJECT')
  self.assertEqual(old['sources.json'],b'{"k" 1}')
  with self.assertRaises(ValueError):syntax_gate.assess_research4(old,{})
 def test_actual_metadata_two_donors_failedT_not_completed_and_model_tuple(self):
  donors=owner.donors();self.assertEqual(len(donors),2);d={r['source']['arm']:r for r in donors};self.assertTrue(d['control']['operational_complete']);self.assertFalse(d['treatment']['operational_complete']);self.assertEqual(d['treatment']['native_goal_state'],'paused')
  self.assertEqual(len(d['control']['required_research4']),4);self.assertEqual(len(d['treatment']['required_research4']),4)
  normal=owner.module('test_observed_model',ROOT.parent/'proof-model-normalizer-001/normalizer.py')
  self.assertEqual(normal.observed_model({'providerId':'builtin:zai-coding-plan','modelId':'GLM-5.3-Flash'}),'builtin:zai-coding-plan/GLM-5.3-Flash')
  for wrong in [{'providerId':'wrong','modelId':'GLM-5.3-Flash'},{'modelId':'GLM-5.3-Flash'},{'providerId':'builtin:zai-coding-plan','modelId':'wrong'}]:
   with self.assertRaises(ValueError):normal.observed_model(wrong)
 def test_exact5_configs_original_topology_task_prefix_caps_tools_profiles_beforebirth(self):
  reg=p.checked(p.ref(ROOT/'registration.json'));self.assertEqual(len(reg['stage_jobs']),5)
  self.assertEqual([(r['stage'],r['max_seconds']) for r in reg['stage_jobs'] if r['arm']=='control'],[('research',600),('critique',900),('revision',600)])
  self.assertEqual([(r['stage'],r['max_seconds']) for r in reg['stage_jobs'] if r['arm']=='treatment'],[('research',600),('critic_final',1500)])
  for arm in ['control','treatment']:self.assertEqual(sum(r['max_seconds'] for r in reg['stage_jobs'] if r['arm']==arm),2100)
  for spec in self.specs():
   old=p.checked(spec['source_original_stage_ref']);raw=Path(old['prompt_file']).read_bytes();new=Path(spec['prompt_file']).read_bytes();size=spec['original_scientific_prefix_bytes'];self.assertEqual(new[:size],raw[:size])
   self.assertEqual(spec['required_artifacts'],old['required_artifacts']);self.assertEqual(spec['glm_resource']['model'],old['glm_resource']['model']);self.assertEqual(spec['glm_resource']['effort'],old['glm_resource']['effort'])
   self.assertEqual(spec['glm_resource']['execution_enabled'],old['glm_resource']['execution_enabled']);self.assertEqual(spec['glm_resource']['public_get'],old['glm_resource']['public_get'])
   self.assertFalse((Path(spec['workspace'])/'inputs/STAGE_CLOCK.json').exists());self.assertEqual(spec['declared_tool_source_pin']['sha256'],'abe26402b0156639e4c0a207e5a030db012c5f2d4b5af5d507a95f00eadeb748')
   if spec['complete_final_owner_role']:
    profile=p.checked(spec['glm_resource']['bundle_profile']);original=p.checked(old['glm_resource']['bundle_profile']);self.assertEqual(profile['method_factors'],original['method_factors']);self.assertEqual(profile['stage_id'],spec['job_id']);self.assertEqual(p.checked(spec['required_delivery_role_manifest'])['entries'],[])
 def test_all5_actual_production_metadata_configs_index_clocks_zero_native(self):
  sys.path.insert(0,str(ROOT.parent/'own-prior-navigation-index-001'));sys.path.insert(0,str(ROOT.parent/'clock-telemetry-001'))
  # Keep our own prepare module binding while isolated old fixture imports its
  # trusted confirmation production module using an explicit temporary alias.
  baseline=owner.module('synthetic_config_fixture',ROOT.parent/'own-prior-navigation-index-001/test_navigation.py');fixture=baseline.NavigationTests()
  count=0
  for spec in self.specs():
   with tempfile.TemporaryDirectory(dir=ROOT) as directory:
    production,s,rp,bp,binding=fixture.production_fixture(spec,directory)
    with patch('subprocess.Popen',side_effect=AssertionError('NO native process')),patch('subprocess.run',side_effect=AssertionError('NO native process')):result=production.prepare_metadata(s,rp,bp,Path(directory)/'sealed')
    self.assertEqual(result['native_process_or_Goal_calls'],0);clock=result['config']['initial_clock_metadata']['stage_clock'];self.assertEqual(clock['original_stage_allocation_seconds'],s['max_seconds']);self.assertEqual(clock['original_candidate_action_deadline_monotonic_ns'],binding['native_stop_monotonic_ns']);self.assertEqual(result['config']['native_bundle_enabled'],s['complete_final_owner_role']);count+=1
  self.assertEqual(count,5)
 def pair_fixture(self,root):
  reg=p.checked(p.ref(ROOT/'registration.json'));rows=[x for x in reg['stage_jobs'] if x['repair_donor']];donors=[];results=[]
  for row in rows:
   folder=root/row['arm'];folder.mkdir();template=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']});old={n:(b'{"k" 1}' if n=='sources.json' and row['arm']=='treatment' else b'{"k":1}' if n=='sources.json' else b'SYNTHETIC' if n=='proposal.md' else b'[]') for n in owner.NAMES};new={**old,'sources.json':b'{"k":1}'}
   oldinv=[];newinv=[]
   for n in owner.NAMES:
    for label,data,inventory in [('old',old[n],oldinv),('new',new[n],newinv)]:
     path=folder/(label+'-'+n);path.write_bytes(data);inventory.append({'relative_path':'research/'+n,'path':str(path),'sha256':p.sha(path),'bytes':len(data)})
   donors.append({'source':{'arm':row['arm']},'required_research4':oldinv})
   identity={'job_id':row['job_id'],'pair_id':reg['pair_id'],'arm':row['arm'],'stage':'research'};freeze={**identity,'goal_target_id':'SYNTHETIC-'+row['arm'],'native_goal_starts':1,'native_quiescent':True,'operational_complete':True,'artifacts':newinv};fp=folder/'FREEZE.json';p.put(fp,freeze)
   cp=folder/'CAPSULES.json';p.put(cp,{'rows':[{**identity,'native_goal_starts':1,'native_goal_state':'complete','origin_goal_id':freeze['goal_target_id'],'output_freeze':p.ref(fp),'observed_family':'Z','observed_model':{'providerId':'builtin:zai-coding-plan','modelId':'GLM-5.3-Flash'},'observed_effort':'max'}]})
   sp=folder/'STAGE.json';p.put(sp,template);rp=folder/'RELEASE.json';p.put(rp,{'all_private_slice_descendants_quiet':True,'stop_returncode':0,'after':{'ActiveState':'inactive'}})
   results.append({'job_id':row['job_id'],'actual_stage_ref':p.ref(sp),'freeze_ref':p.ref(fp),'capsule_ref':p.ref(cp),'release_ref':p.ref(rp)})
  plan=root/'PLAN.json';p.put(plan,{'schema':'er9.c04-paired-native-catalog-result-plan.v1','registration_ref':p.ref(ROOT/'registration.json'),'result_rows':results});return p.ref(plan),donors
 def test_paired_native_completion_quiet_model_hash_and_otherarm_gates(self):
  for defect in [None,'missingpartner','notcomplete','nonquiet','wrongactor','wrongGoal','changedotherfile','hash','wrongarm']:
   with self.subTest(defect=defect),tempfile.TemporaryDirectory(dir=ROOT) as directory:
    root=Path(directory);ref,donors=self.pair_fixture(root);plan=p.checked(ref)
    if defect=='missingpartner':plan['result_rows'].pop()
    elif defect:
     row=plan['result_rows'][1];target=row['capsule_ref'] if defect in {'wrongactor','wrongGoal','wrongarm'} else row['freeze_ref'];obj=p.checked(target)
     if defect=='notcomplete':obj['operational_complete']=False
     elif defect=='nonquiet':obj['native_quiescent']=False
     elif defect=='wrongactor':obj['rows'][0]['observed_model']['providerId']='wrong'
     elif defect=='wrongGoal':obj['rows'][0]['origin_goal_id']='wrong'
     elif defect=='wrongarm':obj['rows'][0]['arm']='control'
     elif defect=='hash':obj['artifacts'][0]['sha256']='0'*64
     elif defect=='changedotherfile':
      artifact=next(a for a in obj['artifacts'] if a['relative_path']=='research/proposal.md');Path(artifact['path']).write_bytes(b'CHANGED');artifact.update(sha256=p.sha(artifact['path']),bytes=7)
     is_capsule=target==row['capsule_ref'];Path(target['path']).write_text(json.dumps(obj,sort_keys=True,indent=2)+'\n');row['capsule_ref' if is_capsule else 'freeze_ref']=p.ref(Path(target['path']))
     if not is_capsule:
      cap=p.checked(row['capsule_ref']);cap['rows'][0]['output_freeze']=row['freeze_ref'];Path(row['capsule_ref']['path']).write_text(json.dumps(cap,sort_keys=True,indent=2)+'\n');row['capsule_ref']=p.ref(Path(row['capsule_ref']['path']))
    Path(ref['path']).write_text(json.dumps(plan,sort_keys=True,indent=2)+'\n');ref=p.ref(Path(ref['path']))
    with patch.object(owner,'donors',return_value=donors):
     if defect is None:self.assertEqual(paired_gate.evaluate(ref)['status'],'PASS_BOTH')
     elif defect=='changedotherfile':self.assertEqual(paired_gate.evaluate(ref)['status'],'UNASSESSED_REJECT_PAIR')
     else:
      with self.assertRaises(ValueError):paired_gate.evaluate(ref)
 def test_birth_denies_existing_clock_or_missing_pairedgate_before_copy(self):
  with tempfile.TemporaryDirectory(dir=ROOT) as directory:
   reg=p.checked(p.ref(ROOT/'registration.json'));row=next(x for x in reg['stage_jobs'] if x['stage']=='critique');plan={'schema':'er9.actual-role-birth-binding-plan.v1','registration_ref':p.ref(ROOT/'registration.json'),'job_id':row['job_id'],'arm':row['arm'],'origin_job_ids':row['all_same_arm_prior_job_ids'],'destination_root':str(Path(directory)/'born'),'native_goal_starts':1,'launch_intents':0};fp=Path(directory)/'PLAN.json';p.put(fp,plan)
   with self.assertRaises(ValueError):role_birth.bind(p.ref(fp))
   self.assertFalse(Path(plan['destination_root']).exists())
 def test_existing_native_mechanical_copy_and_writer_no_new_tools(self):
  server=owner.module('actual_existing_boundary',p.LAB/'dev/tools/versions/v1.5-clock-telemetry/source_capture/tool_server.py');schemas=copy.deepcopy(server.TOOLS)
  with tempfile.TemporaryDirectory(dir=ROOT) as directory:
   ws=Path(directory);(ws/'inputs/original_research').mkdir(parents=True);(ws/'out/research').mkdir(parents=True);server.ROOT=str(ws)
   for name in ['proposal.md','leads.json','witnesses.json']:
    raw=b'SYNTHETIC exact bytes\r\n trailing '+name.encode()+b'\n';source=ws/'inputs/original_research'/name;source.write_bytes(raw)
    with patch.object(server,'delivery_carrier',return_value=(None,None)):
     result=server.perform('mechanical',{'operation':'cache_source','source':str(source.relative_to(ws)),'output':'out/research/'+name})
    self.assertEqual((ws/'out/research'/name).read_bytes(),raw);self.assertEqual(result['source_sha256'],p.sha(source))
   with patch.object(server,'delivery_carrier',return_value=(None,None)):server.perform('write_file',{'path':'out/research/sources.json','text':'{"synthetic":1}'})
   self.assertEqual((ws/'out/research/sources.json').read_bytes(),b'{"synthetic":1}');self.assertEqual(server.TOOLS,schemas)
 def test_native_repair_birth_opaque_exact_four_fixture_and_immutable_sourceTask(self):
  with tempfile.TemporaryDirectory(dir=ROOT) as directory:
   root=Path(directory);reg=p.checked(p.ref(ROOT/'registration.json'));row=next(r for r in reg['stage_jobs'] if r['stage']=='research' and r['arm']=='control');fake={'source':{'arm':'control'},'required_research4':[]}
   for name in owner.NAMES:
    file=root/('origin-'+name);file.write_bytes(b'SYNTHETIC '+name.encode()+b'\r\n');fake['required_research4'].append({'path':str(file),'relative_path':'research/'+name,'sha256':p.sha(file),'bytes':file.stat().st_size})
   row['repair_donor']=fake;rp=root/'REG.json';p.put(rp,reg);plan={'schema':'er9.actual-role-birth-binding-plan.v1','registration_ref':p.ref(rp),'job_id':row['job_id'],'arm':'control','origin_job_ids':[],
    'destination_root':str(root/'fresh-birth'),'native_goal_starts':0,'launch_intents':0};pp=root/'PLAN.json';p.put(pp,plan)
   with patch.object(owner,'donors',return_value=[fake]):receipt=p.checked(role_birth.bind(p.ref(pp)))
   stage=p.checked(receipt['stage_ref']);original=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']});self.assertEqual(stage['prompt_sha256'],original['prompt_sha256']);self.assertEqual(stage['max_seconds'],600)
   for artifact in fake['required_research4']:
    file=Path(stage['workspace'])/'inputs/original_research'/Path(artifact['relative_path']).name;self.assertEqual(p.sha(file),artifact['sha256']);self.assertEqual(file.stat().st_size,artifact['bytes'])
   self.assertEqual(receipt['source_native_calls'],0)
   with self.assertRaises(ValueError):role_birth.bind(p.ref(pp))
 def test_all_old_source_bytes_unchanged(self):
  snapshot=p.checked(p.ref(ROOT/'OLD_SOURCE_BYTE_SNAPSHOT.json'))
  for path,digest in snapshot['files'].items():self.assertEqual(p.sha(path),digest)

if __name__=='__main__':unittest.main(verbosity=2)
