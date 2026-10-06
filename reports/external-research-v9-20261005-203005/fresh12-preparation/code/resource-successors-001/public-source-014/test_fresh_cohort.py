#!/usr/bin/env python3
"""No-inference fixed-cohort freshness, family, topology and prospectivity checks."""
import json
from pathlib import Path
import unittest
import prepare_successors as p
import prepare_bundle_transport as t
import prepare_fresh_cohort as fresh
import bind_fresh_runtime as runtime

ROOT=Path(__file__).resolve().parent


class FixedFreshCohortTests(unittest.TestCase):
    def setUp(self):
        self.outbox=json.loads((ROOT/'fresh-cohort001/OUTBOX.json').read_text())
        self.requests=[p.checked(r) for r in self.outbox['requests']]
        self.inventory=p.checked(fresh.INVENTORY)

    def test_fixed_twelve_twentyfour_74_no_repeat_no_credit_from_old(self):
        self.assertEqual(len(self.requests),12)
        self.assertEqual(sum(len(r['stage_jobs']) for r in self.requests),74)
        self.assertEqual({r['pair_id'] for r in self.requests},
                         {f'I-{i:02d}-FRESH-DELIVERY-R001' for i in range(1,13)})
        self.assertFalse(self.outbox['automatic_full_cohort_repeat'])
        self.assertTrue(self.outbox['confirmation_separate_no_new_gate'])
        self.assertEqual(self.outbox['native_starts'],0)
        for r in self.requests:self.assertEqual({j['arm'] for j in r['stage_jobs']},{'control','treatment'})

    def test_exact_original_topology_budget_family_effort_and_factor(self):
        for request in self.requests:
            original=next(r for r in self.inventory['pairs'] if r['new_pair_id']==request['pair_id'])
            card=p.checked(original['source_card_ref']);newcard=p.checked({'path':request['card_path'],'sha256':request['card_sha256']})
            self.assertEqual(request['requested_model'],card['requested_model'])
            self.assertEqual(request['requested_effort'],card['requested_effort'])
            self.assertEqual(newcard['control_stages'],card['control_stages'])
            self.assertEqual(newcard['treatment_stages'],card['treatment_stages'])
            self.assertEqual(newcard['allocation'],card['allocation'])
            p.model_guard(request['family'],request['requested_model'])
            for arm in ['control','treatment']:
                actual=[(r['stage'],r['max_seconds'],r['max_responses']) for r in request['stage_jobs'] if r['arm']==arm]
                expected=[(r['stage'],r['max_seconds'],r['max_responses']) for r in original['stage_budget_topology'][arm]]
                self.assertEqual(actual,expected)
                self.assertEqual(sum(r['max_seconds'] for r in request['stage_jobs'] if r['arm']==arm),2700)
            if card['method_id']=='V01':
                for r in request['stage_jobs']:
                    if r['stage']=='critique':self.assertEqual(r['execution_enabled'],r['arm']=='treatment')

    def test_brief_access_only_fresh_inputs_and_exact_neutral_prefix(self):
        allowed={'brief.md','output_contract.md','delivery_objective.md','source_access.json','source_separation.md'}
        for request in self.requests:
            for row in request['stage_jobs']:
                stage=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
                inherited=p.checked(stage['source_stage_ref']);old=Path(inherited['prompt_file']).read_bytes()
                new=Path(stage['prompt_file']).read_bytes()
                self.assertEqual(new[:len(old)],old)
                self.assertEqual(p.sha(stage['prompt_file']),stage['prompt_sha256'])
                expected_suffix=b'\n\n'+Path(fresh.OVERLAY['path']).read_bytes()
                if stage['complete_final_owner_role']:expected_suffix+=t.addendum(row['job_id']).encode('utf-8')
                self.assertEqual(new[len(old):],expected_suffix)
                for path,digest in stage['input_pins'].items():
                    relative=Path(path).relative_to(stage['workspace'])
                    self.assertEqual(relative.parent,Path('inputs'))
                    self.assertIn(relative.name,allowed)
                    self.assertEqual(p.sha(path),digest)
                self.assertEqual(list((Path(stage['workspace'])/'out').iterdir()),[])
                self.assertFalse(request['first_research_old_candidate_payloads'])

    def test_common_overlay_identical_both_arms_before_first_research(self):
        for request in self.requests:
            self.assertEqual(request['source_separation_overlay'],fresh.OVERLAY)
            closure=p.checked(request['pipeline_closure'])
            self.assertEqual(closure['source_separation_overlay'],fresh.OVERLAY)
            self.assertTrue(closure['before_either_first_research_required'])
            for row in request['stage_jobs']:
                stage=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
                self.assertEqual(stage['source_separation_overlay'],fresh.OVERLAY)
                target=Path(stage['workspace'])/'inputs/source_separation.md'
                self.assertEqual(p.sha(target),fresh.OVERLAY['sha256'])

    def test_luna_whole_role_closure_and_glm_actual_failure_not_paper_ready(self):
        ready=0;pending=0
        for request in self.requests:
            closure=p.checked(request['pipeline_closure'])
            self.assertEqual(len(closure['stages']),len(request['stage_jobs']))
            if request['family']=='L':
                ready+=1;self.assertTrue(closure['actual_runtime_closure_complete'])
                for row in closure['stages']:
                    expected=fresh.LUNA14 if row['bundle_role'] else {'path':str(p.LAB/'dev/luna-route/versions/v1.3/PIN.json'),'sha256':p.LUNA_SHA}
                    self.assertEqual(row['native_source_pin'],expected)
                    p.checked(row['native_source_pin']);p.checked(row['tool_source_pin'])
            else:
                pending+=1;self.assertFalse(closure['actual_runtime_closure_complete'])
                self.assertIn('Actual preactivation private-parent guard failure',closure['GLM_pending_reason'])
                self.assertEqual(request['native_source_binding_status'],'PENDING_ACTUAL_GLM_PLACEMENT_REPAIR')
                self.assertTrue(all(r['native_source_pin'] is None for r in closure['stages']))
            self.assertFalse(closure['candidate_hashes_fabricated_before_existence'])
            self.assertEqual(closure['native_starts'],0)
        self.assertEqual((ready,pending),(4,8))

    def test_v05_intermediate_and_v08_combined_final_functions_preserved(self):
        for request in self.requests:
            card=p.checked({'path':request['card_path'],'sha256':request['card_sha256']})
            for row in request['stage_jobs']:
                stage=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
                if card['method_id']=='V05' and row['arm']=='treatment' and row['stage']=='revision':
                    self.assertFalse(stage['complete_final_owner_role'])
                    self.assertEqual(stage['required_artifacts'],['out/revision/'+n for n in t.FINAL_ROLES])
                if card['method_id']=='V08' and row['arm']=='treatment' and row['stage']=='critic_final':
                    self.assertTrue(stage['complete_final_owner_role']);self.assertEqual(row['max_seconds'],1500)
                    self.assertEqual(stage['required_artifacts'],t.FINAL_PATHS)
                    self.assertIn('both genuine independent critique and complete current final authorship',Path(stage['prompt_file']).read_text().replace('\n',' '))

    def test_additive_complete_runtime_selection_same74_and_no_go(self):
        selected=p.checked(p.ref(ROOT/'fresh-cohort002/OUTBOX.json'))
        self.assertEqual(selected['GLM_closure_pairs_ready'],8)
        self.assertEqual(selected['additional_native_jobs'],0)
        old_jobs={j['job_id']:j for r in self.requests for j in r['stage_jobs']}
        new_jobs={}
        allowed={'declared_native_source_pin','declared_native_runner','native_source_binding_status',
                 'required_resource_contract','glm_resource','runtime_descriptor_predecessor_ref'}
        for reg_ref in selected['requests']:
            reg=p.checked(reg_ref);closure=p.checked(reg['pipeline_closure'])
            self.assertTrue(closure['actual_runtime_closure_complete'])
            self.assertFalse(reg['root_scope_required']);self.assertFalse(reg['root_or_max_go_required'])
            self.assertEqual({j['arm'] for j in reg['stage_jobs']},{'control','treatment'})
            for j,role in zip(reg['stage_jobs'],closure['stages']):
                old=old_jobs[j['job_id']];new_jobs[j['job_id']]=j
                a=p.checked({'path':old['stage_json'],'sha256':old['stage_sha256']})
                b=p.checked({'path':j['stage_json'],'sha256':j['stage_sha256']})
                changed={k for k in set(a)|set(b) if a.get(k)!=b.get(k)}
                self.assertLessEqual(changed,allowed)
                for k in ['prompt_file','prompt_sha256','input_pins','workspace','job_id','pair_id',*p.INVARIANTS]:
                    self.assertEqual(a.get(k),b.get(k))
                if reg['family']=='Z':
                    pin=runtime.BUNDLE if b['complete_final_owner_role'] else runtime.BASE
                    self.assertEqual(role['native_source_pin'],pin)
                    self.assertEqual(b['declared_native_source_pin'],pin)
                    self.assertEqual(b['glm_resource']['source_pins'],p.checked(pin)['runtime_source_pins'])
                    self.assertEqual(b['glm_resource']['execution_enabled'],j['execution_enabled'])
                    self.assertEqual(b['glm_resource']['public_get'],j['public_get'])
                    self.assertEqual(j['resource_definition']['aggregate_memory_max_bytes'],2304*1024**2)
                    self.assertEqual(j['resource_definition']['memory_swap_max_bytes'],0)
        self.assertEqual(set(old_jobs),set(new_jobs));self.assertEqual(len(new_jobs),74)


if __name__=='__main__':unittest.main(verbosity=2)
