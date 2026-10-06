#!/usr/bin/env python3
"""Actual whole closure, static source-prefix preservation and birth boundary."""
import copy
from pathlib import Path
import unittest
import blueprint as b
import prepare_versions as v

class ProspectiveClockVersionsTests(unittest.TestCase):
    def setUp(self):
        self.outbox=b.p.checked(b.p.ref(b.ROOT/'OUTBOX.json'))
        self.requests=[b.p.checked(r) for r in self.outbox['prospective_requests']]

    def test_current_exact7_46_excludes_entire_entered_pairs_no_deployment(self):
        self.assertEqual(len(self.requests),7);self.assertEqual(sum(len(r['stage_jobs']) for r in self.requests),46)
        self.assertEqual({r['pair_id'] for r in self.outbox['excluded_entire_entered_pairs']},
                         {'I-01-FRESH-DELIVERY-R001','C-04-RESOURCE-R002-BUNDLE'})
        self.assertFalse(self.outbox['actual_deployment_or_native_admission_authorized'])
        self.assertEqual(self.outbox['actual_ops_registry_mutations'],0);self.assertEqual(self.outbox['additional_native_jobs'],0)
        old=[r['old_selected_job_id'] for r in self.outbox['old_to_new_selected_role_version_ids']]
        new=[r['prospective_selected_job_id'] for r in self.outbox['old_to_new_selected_role_version_ids']]
        self.assertEqual(len(set(old)),46);self.assertEqual(len(set(new)),46);self.assertFalse(set(old)&set(new))

    def test_all_role_both_arm_exact_actual_pin_marker_constructor_choices(self):
        for request in self.requests:
            closure=b.p.checked(request['pipeline_closure']);self.assertTrue(closure['complete_both_arm_source_engine_tool_constructor_static_Task_closure'])
            self.assertTrue(closure['explicit_common_behavioral_intervention']);self.assertFalse(closure['invisible_causal_neutrality_guarantee'])
            self.assertEqual({j['arm'] for j in request['stage_jobs']},{'control','treatment'})
            jobs={j['job_id']:j for j in request['stage_jobs']}
            for row in request['stage_jobs']:
                stage=b.p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
                bundle=stage['complete_final_owner_role'];pin,native,integration,marker,module=v.source_choice(bundle)
                self.assertEqual(stage['declared_native_source_pin'],pin);self.assertEqual(stage['declared_tool_source_pin'],v.TOOLS)
                self.assertEqual(stage['glm_resource']['source_pins'],native['runtime_source_pins'])
                self.assertEqual(row['runtime_ref'],v.MARKERS[int(bundle)])
                self.assertEqual(row['resource_definition']['aggregate_memory_max_bytes'],2304*1024**2)
                self.assertEqual(row['resource_definition']['memory_swap_max_bytes'],0)
                module.validate_packet(stage)
                for previous in row['all_same_arm_prior_job_ids']:
                    self.assertIn(previous,jobs);self.assertEqual(jobs[previous]['arm'],row['arm'])
                self.assertFalse((Path(stage['workspace'])/'inputs/STAGE_CLOCK.json').exists())
                self.assertIsNone(stage['actual_future_clock_input_sha256'])
                if bundle:self.assertIsNone(stage['glm_resource']['bundle_profile']);self.assertTrue(stage['bundle_profile_binding_required'])

    def test_exact_task_prefix_transport_identity_clock_suffix_inputs_factors_budgets(self):
        for request in self.requests:
            oldreg=b.p.checked(request['source_registration_ref'])
            oldcard=b.p.checked({'path':oldreg['card_path'],'sha256':oldreg['card_sha256']})
            newcard=b.p.checked({'path':request['card_path'],'sha256':request['card_sha256']})
            edits={'pair_id','source_pair_id','clock_behavior_version','declared_runtime_closure'}
            self.assertEqual({k:x for k,x in oldcard.items() if k not in edits},{k:x for k,x in newcard.items() if k not in edits})
            self.assertEqual(request['requested_model'],oldreg['requested_model']);self.assertEqual(request['requested_effort'],oldreg['requested_effort'])
            for arm in ['control','treatment']:self.assertEqual(sum(j['max_seconds'] for j in request['stage_jobs'] if j['arm']==arm),2700)
            for row in request['stage_jobs']:
                stage=b.p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']});old=b.p.checked(stage['source_stage_ref'])
                original=Path(old['prompt_file']).read_bytes();new=Path(stage['prompt_file']).read_bytes()
                _,_,_,_,module=v.source_choice(stage['complete_final_owner_role'])
                identity=v.identity_suffix(stage['job_id']) if stage['complete_final_owner_role'] else b''
                self.assertEqual(new,original+identity+module.render(old['max_seconds']))
                self.assertEqual(b.p.sha(stage['prompt_file']),stage['prompt_sha256'])
                for field in b.p.INVARIANTS:self.assertEqual(stage.get(field),old.get(field))
                for path,digest in old['input_pins'].items():
                    rel=Path(path).relative_to(old['workspace']);self.assertEqual(b.p.sha(path),digest)
                    self.assertEqual(b.p.sha(Path(stage['workspace'])/rel),digest)
                if row['stage']=='critique' and oldcard['method_id']=='V01':self.assertEqual(row['execution_enabled'],row['arm']=='treatment')

    def test_constructor_rejects_changed_role_allocation_or_missing_suffix(self):
        request=self.requests[0];row=request['stage_jobs'][0]
        stage=b.p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
        _,_,_,_,module=v.source_choice(stage['complete_final_owner_role'])
        wrong=copy.deepcopy(stage);wrong['max_seconds']+=1
        with self.assertRaisesRegex(ValueError,'source/allocation drift'):module.validate_packet(wrong)
        wrong=copy.deepcopy(stage);wrong['prompt_file']=b.p.checked(stage['source_stage_ref'])['prompt_file']
        with self.assertRaises(ValueError):module.validate_packet(wrong)

if __name__=='__main__':unittest.main(verbosity=2)
