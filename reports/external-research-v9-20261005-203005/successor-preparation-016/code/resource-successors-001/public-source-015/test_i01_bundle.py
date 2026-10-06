#!/usr/bin/env python3
from pathlib import Path
import unittest
import prepare_successors as p
import prepare_bundle_transport as t
import hydrate_role_proofs as h
import prepare_i01_bundle as i01
import bind_fresh_runtime as runtime

ROOT=Path(__file__).resolve().parent
class I01ActualWarmFinalTests(unittest.TestCase):
    def test_two600_only_actual_Tcritic_ownedcontext_not_directory_grade_selection(self):
        box=p.checked(p.ref(ROOT/'bundle-i01-001/OUTBOX.json'));reg=p.checked(box['requests'][0])
        self.assertEqual(box['native_stages'],2);self.assertEqual(box['new_critic_stages'],0)
        self.assertEqual(box['exact_owned_Tcritic_context_count'],len(p.checked(i01.CONTEXT)['sources']))
        self.assertFalse(box['Tcapture_directory_membership_selection_used']);self.assertFalse(box['fresh_matched_pipeline_credit'])
        self.assertEqual({r['arm'] for r in reg['stage_jobs']},{'control','treatment'})
        proof=next(r for r in reg['source_role_imports'] if r.get('job_id')=='I-01-DELIVERY-RECOVERY-R002-treatment-critique-a001' and r.get('role')=='critique')
        self.assertEqual(proof['original_elapsed_seconds'],box['actual_Tcritic_elapsed_seconds'])
        capsule=next(r for r in p.checked(h.CAPSULE)['rows'] if r['job_id']==proof['job_id'])
        freeze=p.checked(capsule['output_freeze']);review=next(a for a in freeze['artifacts'] if a['relative_path']=='critique/review.md')
        for row in reg['stage_jobs']:
            self.assertEqual(row['max_seconds'],600);self.assertEqual(row['stage'],'revision')
            spec=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']});old=p.checked(spec['inherited_resource_stage_ref'])
            self.assertEqual(Path(spec['prompt_file']).read_bytes(),Path(old['prompt_file']).read_bytes()+t.addendum(spec['job_id']).encode())
            self.assertEqual(spec['glm_resource']['source_pins'],p.checked(runtime.BUNDLE)['runtime_source_pins'])
            profile=h.tool_module().carrier.load_profile(spec['bundle_profile']['path'],spec['bundle_profile']['sha256'])
            self.assertEqual(h.tool_module().carrier.reference_closure(profile,lambda rel:(Path(spec['workspace'])/rel).read_bytes()),{})
            if row['arm']=='treatment':
                path=Path(spec['workspace'])/'inputs/prior'/proof['job_id']/'critique/review.md'
                self.assertEqual(p.sha(path),review['sha256']);self.assertEqual(path.stat().st_size,review['bytes'])
            for field in p.INVARIANTS:self.assertEqual(spec.get(field),old.get(field))

if __name__=='__main__':unittest.main(verbosity=2)
