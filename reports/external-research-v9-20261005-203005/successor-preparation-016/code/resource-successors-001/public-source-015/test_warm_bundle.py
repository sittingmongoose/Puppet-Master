#!/usr/bin/env python3
from pathlib import Path
import unittest
import prepare_successors as p
import prepare_bundle_transport as t
import hydrate_role_proofs as h
import prepare_fresh_cohort as fresh
import bind_fresh_runtime as runtime

ROOT=Path(__file__).resolve().parent
class WarmFinalTests(unittest.TestCase):
    def setUp(self):
        self.outbox=p.checked(p.ref(ROOT/'warm-bundle001/OUTBOX.json'))
        self.requests=[p.checked(r) for r in self.outbox['requests']]

    def test_no_nonfinal_duplicate_or_fresh_credit_coupled_vs_unpaired(self):
        self.assertEqual(self.outbox['new_nonfinal_stages'],0)
        for r in self.requests:
            self.assertFalse(r['full_fresh_pipeline_or_matched_causal_credit']);self.assertFalse(r['root_scope_required'])
            arms={j['arm'] for j in r['stage_jobs']}
            if r['scientific_recovery_mode']=='unpaired_warm_delivery_continuation':self.assertEqual(len(arms),1)
            else:self.assertEqual(arms,{'control','treatment'})
            for j in r['stage_jobs']:
                self.assertNotIn(j['stage'],{'research','critique','flash_check'})
                self.assertEqual(j['status'],'AWAITING_ACTUAL_SAME_ARM_PREDECESSOR_INPUT_CLOSURE')

    def test_source_prefix_all_old_inputs_method_model_budget_unchanged(self):
        for r in self.requests:
            p.model_guard(r['family'],r['requested_model'])
            for j in r['stage_jobs']:
                s=p.checked({'path':j['stage_json'],'sha256':j['stage_sha256']});old=p.checked(s['inherited_resource_stage_ref'])
                self.assertEqual(Path(s['prompt_file']).read_bytes(),Path(old['prompt_file']).read_bytes()+t.addendum(s['job_id']).encode())
                for field in p.INVARIANTS:self.assertEqual(s.get(field),old.get(field))
                for path,digest in old['input_pins'].items():
                    rel=Path(path).relative_to(old['workspace']);self.assertEqual(p.sha(path),digest)
                    self.assertEqual(p.sha(Path(s['workspace'])/rel),digest)

    def test_actual_bundle_sources_and_explicit_inline_profile_pending_roles(self):
        carrier=h.tool_module().carrier
        for r in self.requests:
            for j in r['stage_jobs']:
                s=p.checked({'path':j['stage_json'],'sha256':j['stage_sha256']});ws=Path(s['workspace'])
                expected=fresh.LUNA14 if r['family']=='L' else runtime.BUNDLE
                self.assertEqual(s['declared_native_source_pin'],expected)
                self.assertTrue(s['actual_missing_same_arm_predecessor_input_closure_honestly_pending'])
                profile=carrier.load_profile(s['bundle_profile']['path'],s['bundle_profile']['sha256'])
                self.assertEqual(carrier.reference_closure(profile,lambda rel:(ws/rel).read_bytes()),{})
                self.assertEqual(set(profile['allowed_outputs']),set(t.FINAL_ROLES))
                if r['family']=='Z':
                    self.assertEqual(s['glm_resource']['bundle_profile'],s['bundle_profile'])
                    self.assertEqual(s['glm_resource']['source_pins'],p.checked(expected)['runtime_source_pins'])
                self.assertFalse((ws/'out/final').exists())

if __name__=='__main__':unittest.main(verbosity=2)
