#!/usr/bin/env python3
"""Actual active G source-card ABI; no native status/output claims inferred."""
from pathlib import Path
import copy
import tempfile
import unittest
import prepare_successors as p
import hydrate_role_proofs_v002 as h

ROOT=Path(__file__).resolve().parent
SIDECAR={'path':str(p.LAB/'ops/dispatcher/card-bindings/C-01-RESOURCE-R002-BUNDLE-treatment-research-a001.json'),
         'sha256':'d79491f19244dec4b57f0e9e31746d77e2a2b009c095d0dd01c138f606ec612d'}

class LaunchedCardBindingTests(unittest.TestCase):
    def setUp(self):
        self.binding=p.checked(SIDECAR)
        # This is a metadata projection for card-binding validation ONLY;
        # the active job has no fabricated terminal OUTPUT_FREEZE.
        self.projection={k:self.binding[k] for k in ['job_id','pair_id','arm','stage']}
        self.projection['pair_freeze']=self.binding['launch_seal_ref']

    def test_exact_actual_launched_stage_seal_and_owner_card_join(self):
        ref,card=h.source_card(self.projection,SIDECAR)
        self.assertEqual(ref,self.binding['card_ref'])
        self.assertEqual(card['pair_id'],self.binding['pair_id'])

    def test_foreign_job_sidecar_denied(self):
        altered=copy.deepcopy(self.binding);altered['job_id']='another-source-job'
        with tempfile.TemporaryDirectory(dir=ROOT) as directory:
            path=Path(directory)/'SIDECAR.json';p.put(path,altered)
            with self.assertRaisesRegex(ValueError,'Foreign launched source card identity'):
                h.source_card(self.projection,p.ref(path))

if __name__=='__main__':unittest.main(verbosity=2)
