"""No role hydration/import/native call: actual card/sidecar metadata + DTO."""
import copy
import hashlib
import json
from pathlib import Path
import unittest
import factor_resolver as f
import hydrate_role_proofs as h
import role_birth_binding as birth

class FactorMapperTests(unittest.TestCase):
    def card(self,n):
        return json.loads((f.LAB/f'dev/diagnostic-runner/resource-successors-001/confirmation-full-closure002/C-{n:02}-RESOURCE-R002-BUNDLE/card.json').read_text())
    def dto(self,factors):
        return h.tool_module().binding(stage_id='SYNTHETIC-METADATA-ONLY',stage_role='critic_final',case_id='SYNTHETIC-CASE',arm_id='treatment',
            method_factors=factors,actor_binding={'stage_id':'SYNTHETIC-METADATA-ONLY','family':'GLM','model':'SYNTHETIC_NO_NATIVE'},
            entries=[],complete_final_role=True)
    def test_all_four_actual_closed_cards_and_existing_literal_DTO(self):
        for n in range(1,5):
            factors=f.declared_method_factors(self.card(n))
            self.assertEqual(factors,['V14','V10','V16'])
            self.assertEqual(self.dto(factors)['profile']['method_factors'],factors)
        self.assertEqual(f.declared_method_factors({'method_id':'V14'}),['V14'])
        with self.assertRaises(ValueError):self.dto(['CONFIRM-B'])
    def test_conflicts_missing_lock_foreign_bundle_topology_and_V06_still_denied(self):
        original=self.card(3)
        mutations=[{'method_id':'CONFIRM-C'},{'selection_lock_ref':None},{'recipe':'A'},
            {'exact_locked_bundle':[]},{'exact_locked_bundle':original['exact_locked_bundle']+['V06 bypass']},
            {'treatment_stages':self.card(1)['treatment_stages']},
            {'selection_lock_ref':{**original['selection_lock_ref'],'sha256':'0'*64}}]
        for changes in mutations:
            with self.assertRaises(ValueError):f.declared_method_factors({**original,**changes})
        with self.assertRaises(ValueError):self.dto(f.declared_method_factors({'method_id':'V06'}))
    def test_actual_positive_source_card_sidecar_seal_join_unchanged_and_bounds(self):
        request=json.loads((f.LAB/'ops/dispatcher/C03_COMPOUND_FACTOR_SOURCE_REPAIR_REQUEST_001.json').read_text())
        sidecar_ref=request['source_card_sidecars']['C-03-RESOURCE-R002-BUNDLE-treatment-research-a001']
        sidecar=h.p.checked(sidecar_ref)
        neutral_freeze={key:sidecar[key] for key in ('job_id','pair_id','arm','stage')}
        neutral_freeze['pair_freeze']=sidecar['launch_seal_ref']
        card_ref,card=h.source_card(neutral_freeze,sidecar_ref)
        self.assertEqual(card_ref,request['target_card_ref'])
        self.assertEqual(f.declared_method_factors(card),request['required_semantic_factor_codes'])
        self.assertEqual(birth.ROOT,h.p.ROOT)
        with self.assertRaises(ValueError):h.source_card({**neutral_freeze,'arm':'control'},sidecar_ref)

if __name__=='__main__':unittest.main(verbosity=2)
