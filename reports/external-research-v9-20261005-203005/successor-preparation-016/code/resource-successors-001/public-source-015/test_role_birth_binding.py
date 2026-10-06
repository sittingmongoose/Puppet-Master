#!/usr/bin/env python3
"""Exact fresh-DAG admission boundaries; no source or evaluator semantics."""
from pathlib import Path
import tempfile
import unittest
import prepare_successors as p
import role_birth_binding as birth
import hydrate_role_proofs as h

ROOT=Path(__file__).resolve().parent
class ActualRoleBirthBoundaryTests(unittest.TestCase):
    def setUp(self):
        outbox=p.checked(p.ref(ROOT/'fresh-cohort002/OUTBOX.json'))
        self.reg_ref=next(r for r in outbox['requests'] if p.checked(r)['pair_id']=='I-01-FRESH-DELIVERY-R001')
        self.reg=p.checked(self.reg_ref)
        self.target=next(r for r in self.reg['stage_jobs'] if r['arm']=='control' and r['stage']=='revision')

    def plan(self,directory):
        return {'schema':'er9.actual-role-birth-binding-plan.v1','registration_ref':self.reg_ref,
                'job_id':self.target['job_id'],'arm':'control','capsule_ref':h.CAPSULE,
                'origin_job_ids':self.target['all_same_arm_prior_job_ids'],
                'closed_source_context_refs':[],'destination_root':str(Path(directory)/'never-admitted')}

    def test_old_cohort_native_artifact_cannot_replace_fresh_current_ancestor(self):
        with tempfile.TemporaryDirectory(dir=ROOT) as directory:
            plan=self.plan(directory);plan['origin_job_ids']=['I-01-control-research-a001']
            path=Path(directory)/'PLAN.json';p.put(path,plan)
            with self.assertRaisesRegex(ValueError,'Exact registered ancestor order'):birth.bind(p.ref(path))
            self.assertFalse(Path(plan['destination_root']).exists())

    def test_missing_actual_context_is_honest_pending_not_empty_fallback(self):
        with tempfile.TemporaryDirectory(dir=ROOT) as directory:
            plan=self.plan(directory);path=Path(directory)/'PLAN.json';p.put(path,plan)
            with self.assertRaisesRegex(ValueError,'Every declared ancestor requires actual closed capture export'):birth.bind(p.ref(path))
            self.assertFalse(Path(plan['destination_root']).exists())

    def test_wrong_target_arm_denied_before_role_copy(self):
        with tempfile.TemporaryDirectory(dir=ROOT) as directory:
            plan=self.plan(directory);plan['arm']='treatment';path=Path(directory)/'PLAN.json';p.put(path,plan)
            with self.assertRaisesRegex(ValueError,'Wrong current target arm'):birth.bind(p.ref(path))
            self.assertFalse(Path(plan['destination_root']).exists())

if __name__=='__main__':unittest.main(verbosity=2)
