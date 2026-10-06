#!/usr/bin/env python3
from pathlib import Path
import unittest
import prepare_successors as p
import prepare_fresh_cohort as fresh
import prepare_bundle_transport as t
import hydrate_role_proofs as h

ROOT=Path(__file__).resolve().parent
class D09DeferredResolverTests(unittest.TestCase):
    def test_exact_topology_both200_full_carrier_no_fake_task_or_role(self):
        box=p.checked(p.ref(ROOT/'d09-resolver-bundle001/OUTBOX.json'));contract=p.checked(box['deferred_resolver_contract'])
        self.assertEqual(contract['original_full_topology'],{'control':['whole_critic400','resolve_final200'],
               'treatment':['source_critic200','implementation_critic200','resolve_final200']})
        self.assertFalse(contract['future_critic_bytes_or_Task_SHA_fabricated'])
        self.assertEqual({r['arm'] for r in contract['rows']},{'control','treatment'})
        for row in contract['rows']:
            self.assertEqual(row['max_seconds'],200);self.assertEqual(row['requested_parent_response_cap'],33)
            self.assertEqual(row['native_source_pin'],fresh.LUNA14);self.assertEqual(row['tools_source_pin'],fresh.TOOLS14)
            self.assertIsNone(row['stage_json']);self.assertIsNone(row['stage_sha256']);self.assertIsNone(row['prompt_sha256'])
            self.assertFalse(row['current_TASK_created']);self.assertFalse((Path(row['workspace'])/'TASK.md').exists())
            self.assertEqual(len(row['prerequisite_job_ids']),1 if row['arm']=='control' else 2)
            profile=h.tool_module().carrier.load_profile(row['bundle_profile']['path'],row['bundle_profile']['sha256'])
            self.assertEqual(profile['stage_id'],row['job_id']);self.assertEqual(set(profile['allowed_outputs']),set(t.FINAL_ROLES))
            self.assertEqual(h.tool_module().carrier.reference_closure(profile,lambda rel:(Path(row['workspace'])/rel).read_bytes()),{})
            self.assertEqual(p.checked(row['transport_addendum_ref'])['suffix_utf8'],t.addendum(row['job_id']))
            self.assertEqual(p.sha(row['mechanical_binder_ref']['path']),row['mechanical_binder_ref']['sha256'])

if __name__=='__main__':unittest.main(verbosity=2)
