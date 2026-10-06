#!/usr/bin/env python3
"""Prospective eligibility/full closure and complete oldbyte preservation."""
import copy
from pathlib import Path
import unittest
import blueprint as b

ROOT=Path(__file__).resolve().parent
class ClockBlueprintTests(unittest.TestCase):
    def setUp(self):
        self.request=b.metadata(b.REQUEST);self.blueprint=b.metadata(b.p.ref(ROOT/'BLUEPRINT.json'))

    def test_fixed_positive_snapshot_nineGpairs57roles_not_quality_selection(self):
        self.assertEqual(self.blueprint['pair_count'],9)
        self.assertEqual(self.blueprint['native_stage_count'],57)
        expected={f'I-{i:02d}-FRESH-DELIVERY-R001' for i in [1,2,3,4,9,10,11,12]}|{'C-04-RESOURCE-R002-BUNDLE'}
        self.assertEqual({p['pair_id'] for p in self.blueprint['pairs']},expected)
        self.assertFalse(self.blueprint['actual_G1_5_tool_core_bundle_pins_ready'])
        self.assertFalse(self.blueprint['actual_L_clock_binding_authorized'])
        self.assertTrue(self.blueprint['clock_awareness_is_explicit_behavioral_intervention'])
        self.assertFalse(self.blueprint['invisible_causal_neutrality_guarantee'])
        self.assertTrue(self.blueprint['current_old_usable_queue_continues'])

    def test_entered_intent_L_or_partialarm_pair_cannot_be_selected(self):
        pair=self.request['pairs'][0]
        for field,value in [('native_starts',1),('launch_intents',1),('family','L')]:
            wrong=copy.deepcopy(pair);wrong[field]=value
            with self.assertRaises(ValueError):b.validate_eligible(wrong)
        wrong=copy.deepcopy(pair);wrong['jobs']=[r for r in wrong['jobs'] if r['arm']=='control']
        with self.assertRaises(ValueError):b.validate_eligible(wrong)

    def test_all_original_task_input_caps_factors_criterion_and_recipe_bytes(self):
        snap=b.metadata(b.p.ref(ROOT/'SOURCE_BYTE_SNAPSHOT.json'))
        for path,digest in snap['files'].items():self.assertEqual(b.p.sha(path),digest)
        self.assertEqual(b.p.sha(b.p.LAB/'supervision/DECISIONS-007-RECIPE-LOCK.json'),b.p.LOCK_SHA)
        for pair in self.blueprint['pairs']:
            arms={r['arm'] for r in pair['all_roles']};self.assertEqual(arms,{'control','treatment'})
            for arm in arms:self.assertEqual(sum(r['original_role_fields']['max_seconds'] for r in pair['all_roles'] if r['arm']==arm),2700)
            for role in pair['all_roles']:
                self.assertIsNone(role['actual_future_action_deadline_ns'])
                self.assertIsNone(role['actual_future_remaining_seconds'])
                self.assertFalse(role['future_Task_profile_hash_fabricated'])
                self.assertTrue(role['total_cleanup_clock_not_candidate_action'])

    def test_old_entire_source_owner_tree_and_aliases_remain_exact(self):
        old=b.metadata(b.p.ref(ROOT/'OLD_OWNER_TREE_BYTE_SNAPSHOT.json'))
        self.assertGreater(len(old['files']),1000)
        for path,digest in old['files'].items():self.assertEqual(b.p.sha(path),digest)
        for name in ['ROLE_BIRTH_HELPER_PIN_001.json','ROLE_BIRTH_HELPER_PIN_002.json']:
            pin=b.metadata(b.p.ref(ROOT.parent/name))
            for ref in pin['source_pins']:self.assertEqual(b.p.sha(ref['path']),ref['sha256'])

if __name__=='__main__':unittest.main(verbosity=2)
