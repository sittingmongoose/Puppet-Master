"""Static protocol/hash tests plus temporary unchanged-adapter packing only.
No ledger/module transaction, native/provider/process launch, candidate or evaluator reads.
"""
import copy,hashlib,importlib.util,json,pathlib,re,tempfile,unittest
HERE=pathlib.Path(__file__).resolve().parent;LAB=HERE.parents[1];CASES=LAB/'cases/attempt-successors-v1'
def read(p):return json.loads(pathlib.Path(p).read_text())
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def load(name,p):
 spec=importlib.util.spec_from_file_location(name,p);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
class DeclarationTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.materializer=load('pure_transforms',HERE/'materialize.py');cls.closure=read(HERE/'DECLARATION_CLOSURE.json');cls.mapping=read(HERE/'INPUT_MAP.json')['cases'];cls.proposal=read(LAB/'dev/tranche-successor-v8/REMAINING_CELLS.json');cls.lineage=read(HERE/'LINEAGE.json');cls.adapter=load('unchanged_adapter',LAB/'dev/route-recovery-v2/route-assembly-v1/adapter.py');cls.resolver=load('unchanged_resolver',LAB/'dev/route-recovery-v2/candidate_inputs.py')
 def test_exact_fresh_paired_identities_exclusion_and_development_classification(self):
  self.assertEqual(len(self.mapping),12);self.assertEqual(len(self.closure['pairs']),6)
  oldseen=[];newseen=[];pairs={p['logical_pair_id']:p for p in self.proposal['remaining_logical_pairs']}
  for p in self.closure['pairs']:
   self.assertEqual(p['attempt_pair_id'],pairs[p['logical_pair_id']]['proposed_pair_attempt_id']);self.assertEqual([a['arm'] for a in p['arms']],['control','treatment'])
   for a in p['arms']:
    old=a['logical_case_id'];new=a['new_attempt_case_id'];oldseen.append(old);newseen.append(new)
    self.assertEqual(new,old+'-S8');self.assertEqual(a['predecessor_attempt_case_id'],old)
    self.assertEqual(a['new_jobs'],[new+'-'+r for r in self.materializer.ROLES]);self.assertEqual(a['new_final_job'],new+'-final-correction');self.assertEqual(a['evaluator_attempt_id'],'V8-EVAL-'+new)
    for job in a['new_jobs']:self.assertRegex(job.lower(),r'^[a-z0-9][a-z0-9-]{0,55}$')
    m=read(self.mapping[new]['manifest']);self.assertEqual(m['case_id'],new);self.assertEqual(m['logical_pair_id'],p['logical_pair_id']);self.assertEqual(m['classification'],'DEVELOPMENT_REPEAT_NOT_FRESH_HOLDOUT');self.assertIsNone(m['case_birth_epoch']);self.assertIsNone(m['case_birth_utc'])
  self.assertEqual(set(newseen),set(self.mapping));self.assertFalse(set(oldseen)&set(self.proposal['excluded_v7_queue']));self.assertFalse(set(oldseen)&set(self.proposal['excluded_operationally_complete_cases']))
 def test_original_pins_and_frozen_feasibility_hold_unchanged(self):
  for p,digest in self.lineage['predecessor_source_sha256'].items():self.assertEqual(sha(p),digest,p)
  freeze=LAB/'dev/tranche-successor-v8/SOURCE_FREEZE.json';self.assertEqual(sha(freeze),'86b997375679047e3c7fede8df94ecfb3ceaa4e0745485159a6d430dbf1cbe1b')
  for p,digest in read(freeze)['closure_sha256'].items():self.assertEqual(sha(p),digest,p)
  self.assertEqual(read(LAB/'dev/tranche-successor-v8/TEST_RESULTS.json')['tests_run'],8)
 def test_identity_metadata_and_numeric_only_protocol_differences(self):
  allowed={'case_id','status','reserved_at','logical_case_id','logical_pair_id','pair_id','pair_arm','attempt_pair_id','successor_of','evaluator_reservation','original_evaluator_reservation','classification','lineage','prospective_host_binding','candidate_account','case_birth_epoch','case_birth_utc','caps','stages'}
  for new,item in self.mapping.items():
   row=self.lineage['cases'][new];refs=row['original_assigned_sources'];old=read(refs['manifest']['path']);m=read(item['manifest']);d=pathlib.Path(item['case_dir'])
   for k in set(old)|set(m):
    if k not in allowed:self.assertEqual(m[k],old[k],k)
   self.assertEqual((d/'METHOD.md').read_text(),self.materializer.method_transform(pathlib.Path(refs['method_card']['path']).read_text()))
   self.assertEqual((d/'TASK.md').read_text(),self.materializer.task_transform(pathlib.Path(refs['case_task']['path']).read_text(),row['logical_case_id'],new))
   # Every non-timing METHOD byte remains, including witness/proposition/batch counts.
   old_method=pathlib.Path(refs['method_card']['path']).read_text();new_method=(d/'METHOD.md').read_text()
   self.assertEqual(new_method,self.materializer.method_transform(old_method))
   for key,mkey in [('brief','brief'),('thin_plan','thin_plan'),('source_access','source_access')]:self.assertEqual(sha(CASES/m[mkey]),refs[key]['sha256'])
   expected_caps=copy.deepcopy(old['caps']);expected_caps.update(research_proposal_seconds=1200,candidate_critic_seconds=1200,final_correction_seconds=900,summed_stage_hard_seconds=3300,host_overhead_hard_seconds=300);self.assertEqual(m['caps'],expected_caps)
   for i,stage in enumerate(m['stages']):
    expected=copy.deepcopy(old['stages'][i]);expected.update(reservation_id=new+'-'+self.materializer.ROLES[i],seconds=self.materializer.CAPS[i]);self.assertEqual(stage,expected)
    source=pathlib.Path(refs['stage_templates'][i]['path']);self.assertEqual((CASES/stage['task_template']).read_text(),source.read_text().replace(f'{1800 if i==0 else 600} seconds',f'{self.materializer.CAPS[i]} seconds'))
   self.assertEqual(m['research_question_count'],3);self.assertEqual(m['required_product_obligations'],old['required_product_obligations']);self.assertEqual(len(m['required_product_obligations']),5)
 def test_shared_binding_and_complete_protocol_hash_closure(self):
  c=self.closure;self.assertEqual(c['schema'],'pm.er8.attempt-successor-declaration-closure.v1');self.assertTrue(c['frozen']);self.assertFalse(c['root_authority']);self.assertTrue(c['not_a_reservation_or_birth'])
  self.assertEqual(c['campaign_deadline_epoch'],1791013030.8303788);self.assertEqual(c['original_start_epoch'],1790905209)
  self.assertEqual(c['caps'],{'stage_caps':[1200,1200,900],'case_wall':3600,'case_occupied':5400,'outside_native':300,'responses':160});self.assertEqual(sum(c['caps']['stage_caps'])+c['caps']['outside_native'],3600)
  self.assertEqual(set(c['protocol_sha256']),{str(p) for p in CASES.rglob('*') if p.is_file()})
  for inventory in (c['protocol_sha256'],c['host_input_sha256']):
   for p,digest in inventory.items():self.assertEqual(sha(p),digest,p)
  release=read(LAB/'ops/execution-resume-v1/root-production-release-v7.json');common_task=hashlib.sha256(self.materializer.canonical(c['shared_stage_template_sha256'])).hexdigest()
  for p in c['pairs']:
   b=p['common_binding'];self.assertEqual(b['route'],release['route']);self.assertEqual(b['pins'],release['pins']);self.assertEqual(b['account'],'existing-authorized-zcode-account-v8-A');self.assertEqual(b['model'],'GLM5.3FlashMax');self.assertEqual(b['task_sha256'],common_task)
   self.assertEqual(b['scoring_contract_sha256'],'6efed6cf4763f91b9674ffaaf35b5c9113decf27663fc38961fcfd140b6883af')
   for a in p['arms']:
    self.assertEqual(sha(a['source_manifest']['path']),a['source_manifest']['sha256']);self.assertEqual(sha(a['method']['path']),a['method']['sha256']);m=read(a['source_manifest']['path'])
    for k,mk in [('brief_sha256','brief'),('thin_plan_sha256','thin_plan'),('source_access_sha256','source_access')]:self.assertEqual(b[k],sha(CASES/m[mk]))
  self.assertFalse(read(HERE/'SCORING_SCOPE_BINDING.json')['contents_read_by_materializer'])
 def test_all36_derived_objectives_duration_agreement_and_actual_adapter_pack(self):
  objectives=read(HERE/'OBJECTIVES.json')['objectives'];self.assertEqual(len(objectives),36)
  with tempfile.TemporaryDirectory() as raw:
   for new,item in self.mapping.items():
    self.assertEqual(self.resolver.case_record(new,self.mapping),item);m=read(item['manifest']);d=pathlib.Path(item['case_dir'])
    for i,stage in enumerate(m['stages']):
     job=stage['reservation_id'];expected='Complete '+job+'.\n\n'+(d/'TASK.md').read_text()+'\n\n'+(CASES/stage['task_template']).read_text();self.assertEqual(objectives[job]['objective'],expected);self.assertEqual(objectives[job]['characters'],len(expected));self.assertIn(f'at most {stage["seconds"]} seconds',expected.lower())
     self.assertNotRegex(expected,r'(?<![0-9])(?:600s|600-second|600 seconds|1800s|1800-second|1800 seconds)')
     ws=pathlib.Path(raw)/(job+'-ws');prompt=pathlib.Path(raw)/(job+'.md');packed=self.adapter.pack_stage(case_id=new,reservation_id=job,workspace=ws,prompt_file=prompt,case_birth_ns=1,stage_birth_ns=2,assigned_sources=self.mapping)
     self.assertEqual(prompt.read_text(),expected.replace('input/','inputs/')+'\n');self.assertLessEqual(len(prompt.read_text().strip()),4000);self.assertEqual(packed['prompt_sha256'],sha(prompt));self.assertEqual(set(p.name for p in (ws/'inputs').iterdir()),{'BRIEF.md','THIN_PLAN.md','METHOD.md','TASK.md'});self.assertFalse((ws/'public_captures').exists())
 def test_release_patch_exact_data_and_unchanged_controller_planning_gate(self):
  patch=read(HERE/'ROOT_RELEASE_PATCH.json');self.assertFalse(patch['accepted']);self.assertFalse(patch['root_authority']);r=patch['fields_for_new_root_release_after_independent_acceptance'];self.assertEqual(r['case_sources'],self.mapping);self.assertEqual(set(r['case_queue']),set(self.mapping));self.assertEqual(len(r['allowed_jobs']),36)
  self.assertEqual(patch['unchanged_existing_controller'],read(LAB/'ops/execution-resume-v1/root-production-release-v7.json')['controller_snapshot'])
  common=load('unchanged_common',LAB/'dev/prospective-timing-v3/integrated-controller/common.py')
  for case in self.mapping:self.assertEqual([s['seconds'] for s in common.check_planning(r,case)['stages']],[1200,1200,900])
  self.assertEqual(read(LAB/'ops/recovery-v1/ATTEMPT_SUCCESSOR_DEVELOPMENT_AUTHORITY_V1.json')['candidate_output_stop'],1500000)
if __name__=='__main__':unittest.main(verbosity=2)
