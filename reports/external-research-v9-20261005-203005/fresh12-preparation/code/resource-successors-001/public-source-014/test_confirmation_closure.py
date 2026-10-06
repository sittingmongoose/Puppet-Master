#!/usr/bin/env python3
import json
from pathlib import Path
import unittest
import prepare_successors as p
import prepare_bundle_transport as t
import prepare_fresh_cohort as fresh
import bind_fresh_runtime as runtime

ROOT=Path(__file__).resolve().parent
class ConfirmationClosureTests(unittest.TestCase):
    def setUp(self):
        self.outbox=p.checked(p.ref(ROOT/'confirmation-full-closure002/OUTBOX.json'))
        self.requests=[p.checked(r) for r in self.outbox['requests']]

    def test_exact_locked_four_22_no_new_gate_repeat_or_warm_credit(self):
        self.assertEqual(p.sha(p.LAB/'supervision/DECISIONS-007-RECIPE-LOCK.json'),p.LOCK_SHA)
        self.assertEqual(len(self.requests),4);self.assertEqual(sum(len(r['stage_jobs']) for r in self.requests),22)
        for key in ['automatic_confirmation_repeat','new_all12_PASS_Go_gate','new_development_warm_outputs_substituted']:
            self.assertFalse(self.outbox[key])
        for r in self.requests:
            self.assertFalse(r['root_scope_required']);self.assertEqual({j['arm'] for j in r['stage_jobs']},{'control','treatment'})
            for arm in ['control','treatment']:
                self.assertEqual(sum(j['max_seconds'] for j in r['stage_jobs'] if j['arm']==arm),2700)

    def test_all_actual_per_role_pin_choices_and_common_binding_coherent(self):
        for r in self.requests:
            closure=p.checked(r['pipeline_closure']);common=p.checked(r['resource_binding'])
            self.assertTrue(closure['actual_runtime_closure_complete']);self.assertTrue(closure['before_either_first_research_required'])
            self.assertEqual(common['source_pin'],runtime.BASE)
            card=p.checked({'path':r['card_path'],'sha256':r['card_sha256']})
            self.assertEqual(card['required_resource_binding'],r['resource_binding'])
            for j,role in zip(r['stage_jobs'],closure['stages']):
                s=p.checked({'path':j['stage_json'],'sha256':j['stage_sha256']})
                expected=runtime.BUNDLE if s['complete_final_owner_role'] else runtime.BASE
                self.assertEqual(role['native_source_pin'],expected);self.assertEqual(s['declared_native_source_pin'],expected)
                self.assertEqual(s['glm_resource']['source_pins'],p.checked(expected)['runtime_source_pins'])
                self.assertEqual(s['required_common_resource_binding'],r['resource_binding'])
                self.assertEqual(j['resource_definition']['source_pin'],expected)
                self.assertEqual(j['resource_definition']['aggregate_memory_max_bytes'],2304*1024**2)
                self.assertEqual(j['resource_definition']['memory_swap_max_bytes'],0)

    def test_full_task_prefix_original_inputs_topology_and_overlay_identity(self):
        for r in self.requests:
            oldreg=p.checked(r['source_registration_ref'])
            a=p.checked({'path':r['card_path'],'sha256':r['card_sha256']});b=p.checked({'path':oldreg['card_path'],'sha256':oldreg['card_sha256']})
            for field in ['method_id','control_stages','treatment_stages','allocation','requested_model','requested_effort']:
                self.assertEqual(a.get(field),b.get(field))
            jobs={j['job_id']:j for j in r['stage_jobs']}
            for j in r['stage_jobs']:
                stage=p.checked({'path':j['stage_json'],'sha256':j['stage_sha256']});old=p.checked(stage['source_stage_ref'])
                suffix=b'\n\n'+Path(fresh.OVERLAY['path']).read_bytes()
                if stage['complete_final_owner_role']:suffix+=t.addendum(stage['job_id']).encode()
                self.assertEqual(Path(stage['prompt_file']).read_bytes(),Path(old['prompt_file']).read_bytes()+suffix)
                for field in p.INVARIANTS:self.assertEqual(stage.get(field),old.get(field))
                self.assertEqual(p.sha(Path(stage['workspace'])/'inputs/source_separation.md'),fresh.OVERLAY['sha256'])
                for path,digest in old['input_pins'].items():
                    rel=Path(path).relative_to(old['workspace']);self.assertEqual(p.sha(Path(stage['workspace'])/rel),digest)
                for parent in j['all_same_arm_prior_job_ids']:
                    self.assertIn(parent,jobs);self.assertEqual(jobs[parent]['arm'],j['arm'])
                self.assertEqual(list((Path(stage['workspace'])/'out').iterdir()),[])

if __name__=='__main__':unittest.main(verbosity=2)
