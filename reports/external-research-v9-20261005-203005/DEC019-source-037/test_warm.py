"""Metadata/config checks only; no candidate, provider, Goal or semantic evaluation."""
import copy,pathlib,tempfile,unittest
from unittest.mock import patch
import common as p
import role_birth

class WarmTests(unittest.TestCase):
 def test_actual_actor_failed_parent_and_capture_joins(self):
  s,c,cap=p.validate_failed_parent();self.assertEqual(cap['observed_model'],p.MODEL);self.assertEqual(cap['native_goal_state'],'paused');self.assertEqual(len(s['required_research4']),4);self.assertEqual(len(c['sources']),32);self.assertFalse(s['operational_complete'])
 def test_exact_two_stage_choices_caps_model_policy(self):
  reg=p.checked(p.ref(p.ROOT/'registration.json'));self.assertEqual([r['job_id'] for r in reg['stage_jobs']],[p.CJOB,p.FJOB]);self.assertEqual([(r['max_seconds'],r['max_responses']) for r in reg['stage_jobs']],[(900,90),(600,60)]);self.assertFalse(reg['extra_logical_target_credit']);self.assertFalse(reg['clean_matched_causal_fresh_or_original_pipeline_credit']);self.assertEqual(reg['declared_total_new_seconds'],1500)
  for row in reg['stage_jobs']:
   spec=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']});self.assertEqual(spec['glm_resource']['model'],'builtin:zai-coding-plan/GLM-5.3-Flash');self.assertEqual(spec['glm_resource']['effort'],'max');self.assertTrue(row['execution_enabled']);self.assertTrue(row['public_get']);pin=p.checked(row['runtime_ref']);self.assertEqual(spec['glm_resource']['source_pins'],pin['runtime_source_pins']);self.assertTrue(all(p.sha(path)==sha for path,sha in pin['runtime_source_pins'].items()))
 def test_original_prefix_common_inputs_and_clock_constructor(self):
  proof=p.checked(p.ref(p.ROOT/'TASK_PRESERVATION.json'));reg=p.checked(p.ref(p.ROOT/'registration.json'))
  for row,source in zip(reg['stage_jobs'],proof['rows']):
   spec=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']});old=pathlib.Path(source['original_Task_ref']['path']).read_bytes();task=pathlib.Path(spec['prompt_file']).read_bytes();self.assertTrue(task.startswith(old));self.assertEqual(p.sha(source['original_Task_ref']['path']),source['original_Task_ref']['sha256']);frag=p.checked(row['runtime_ref'])['task_fragment_constructor'];m=p.module(frag['path']);self.assertTrue(task.endswith(m.render(row['max_seconds'])));self.assertIsNotNone(m.validate_packet(spec))
 def test_authentic_critic_binding_index_contains_only_failed_R_own_inputs(self):
  receipt=p.checked(p.ref(p.ROOT/'critic-authenticated-prepared/ROLE_BIRTH_RECEIPT.json'));index=p.checked(receipt['index_ref']);self.assertEqual(len(index['files']),37);self.assertEqual({r['origin_job_id'] for r in index['files']},{p.RJOB});self.assertEqual(sum(r['path'].startswith('inputs/prior/') for r in index['files']),4);self.assertFalse(receipt['extra_logical_target_credit']);spec=p.checked(receipt['stage_ref']);self.assertTrue(all(p.sha(path)==sha for path,sha in spec['input_pins'].items()))
 def test_wrong_failed_parent_and_other_actor_rejected(self):
  actual=p.checked(p.DONOR)
  for key,val in [('job_id','FOREIGN'),('status','COMPLETED'),('operational_complete',True)]:
   row=copy.deepcopy(actual);row[key]=val
   original=p.checked
   def lookup(ref):return row if ref==p.DONOR else original(ref)
   with patch.object(p,'checked',side_effect=lookup):
    with self.assertRaises(ValueError):p.validate_failed_parent()
 def test_no_old_critic_or_foreign_final_parent(self):
  with self.assertRaises(ValueError):role_birth.fresh_critic({'job_id':'I-01-FRESH-DELIVERY-R001-treatment-critique-a001'})
 def test_final_native_carrier_INLINE_ONLY_and_existing_schema(self):
  reg=p.checked(p.ref(p.ROOT/'registration.json'));row=reg['stage_jobs'][1];spec=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']});profile=p.checked(spec['glm_resource']['bundle_profile']);manifest=p.checked({'path':str(pathlib.Path(spec['workspace'])/'inputs/delivery_role_manifest.json'),'sha256':profile['import_manifest']['sha256']});self.assertEqual(manifest['entries'],[]);self.assertEqual(profile['method_factors'],['V01']);self.assertEqual(profile['stage_id'],p.FJOB);self.assertEqual(set(profile['allowed_outputs']),{'proposal.md','sources.json','witnesses.json','leads.json'});carrier=p.module(p.LAB/'dev/tools/versions/v1.5-clock-telemetry/bundle_carrier.py');self.assertEqual(carrier.validate_profile(profile)['stage_id'],p.FJOB)
 def test_final_birth_requires_only_exact_new_critic_no_future_hashes(self):
  with tempfile.TemporaryDirectory(dir=p.ROOT) as temp:
   plan={'schema':'er9.actual-role-birth-binding-plan.v1','registration_ref':p.ref(p.ROOT/'registration.json'),'job_id':p.FJOB,'arm':'treatment','origin_job_ids':[p.RJOB,p.CJOB],'destination_root':str(pathlib.Path(temp)/'birth')};path=pathlib.Path(temp)/'plan.json';p.put(path,plan)
   with self.assertRaisesRegex(ValueError,'waits for this new actual critic'):role_birth.bind(p.ref(path))

if __name__=='__main__':unittest.main(verbosity=2)
