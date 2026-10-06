#!/usr/bin/env python3
"""Actual warm closure ABI and strict provenance/diff regression, no inference."""
import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import time
import unittest
import prepare_successors as p
import prepare_bundle_transport as transport
import hydrate_role_proofs as h

ROOT=Path(__file__).resolve().parent

class ActualRoleBundleTests(unittest.TestCase):
    def setUp(self):
        self.outbox=p.checked(p.ref(ROOT/'bundle-i08-001/OUTBOX.json'))
        self.reg=p.checked(self.outbox['requests'][0]);self.row=self.reg['stage_jobs'][0]
        self.spec=p.checked({'path':self.row['stage_json'],'sha256':self.row['stage_sha256']})
        self.ws=Path(self.spec['workspace']);self.module=h.tool_module()
        self.profile=self.module.carrier.load_profile(self.spec['bundle_profile']['path'],self.spec['bundle_profile']['sha256'])
        self.manifest=json.loads((self.ws/'inputs/delivery_role_manifest.json').read_bytes())

    def test_only_actual_missing_control600_no_false_completion_or_T_duplicates(self):
        self.assertEqual(len(self.reg['stage_jobs']),1);self.assertEqual(self.row['arm'],'control')
        self.assertEqual(self.row['max_seconds'],600)
        source=p.checked(self.spec['inherited_resource_stage_ref'])
        self.assertEqual(self.row['max_responses'],source['max_responses'])
        self.assertEqual(self.outbox['treatment_duplicate_stages'],0)
        self.assertFalse(self.reg['native_complete_pipeline_claim']);self.assertFalse(self.reg['fresh_matched_causal_credit'])
        self.assertFalse(self.reg['root_scope_required']);self.assertEqual(self.reg['native_starts'],0)
        self.assertEqual(self.outbox['source_context_count'],17)

    def test_real_luna_writer_config_accepts_all_actual_hashes_without_model(self):
        path=p.LAB/'dev/tools/versions/v1.4-bundle/config.py'
        spec=importlib.util.spec_from_file_location('actual_bundle_config_test',path)
        config=importlib.util.module_from_spec(spec);spec.loader.exec_module(config)
        with tempfile.TemporaryDirectory(dir=ROOT) as directory:
            result=config.mcp_configs(self.ws,capture_dir=Path(directory)/'captures',evidence_dir=Path(directory)/'evidence',
                   deadline_monotonic_ns=time.monotonic_ns()+600*10**9,execution_enabled=True,public_get=True,
                   bundle_profile_path=self.spec['bundle_profile']['path'])
            self.assertTrue(result['native_bundle_enabled'])
            self.assertEqual(result['bundle_profile_sha256'],self.spec['bundle_profile']['sha256'])
            self.assertEqual(result['tool_allowlist'],config.source.allowlist(True)+['mcp__pm_execution__python_execute'])
        self.assertFalse((self.ws/'out/final').exists())

    def test_all_four_imports_truthful_paused_goal_null_separate_id_and_same_case(self):
        entries=self.manifest['entries'];self.assertEqual(len(entries),4)
        self.assertEqual({r['artifact_role'] for r in entries},set(transport.FINAL_ROLES))
        for r in entries:
            self.assertEqual(r['origin_job_id'],'I-08-LUNA-S1-control-research-a001')
            self.assertEqual(r['origin_status']['native_goal_state'],'paused')
            self.assertIsNone(r['origin_goal_id']);self.assertIsNotNone(r['origin_session_id'])
            self.assertEqual(r['origin_case_id'],self.profile['case_id'])
            self.assertEqual(p.sha(self.ws/r['path']),r['sha256'])
            proof=p.checked({'path':str(self.ws/r['native_proof']['path']),'sha256':r['native_proof']['sha256']})
            self.assertIsNone(proof['freeze_time']);self.assertIn('not a distinct exact',proof['freeze_time_nonexposure_reason'])
            self.assertEqual(proof['freeze_window_end']['basis'],'immutable_freeze_receipt_filesystem_mtime')
            self.assertEqual(proof['native_goal_activation_count'],1)

    def test_old_task_exact_prefix_transport_only_and_old_inputs_unmodified(self):
        stage=p.checked(self.spec['inherited_resource_stage_ref'])
        old=Path(stage['prompt_file']).read_bytes();new=Path(self.spec['prompt_file']).read_bytes()
        self.assertEqual(new,old+transport.addendum(self.spec['job_id']).encode())
        for path,digest in stage['input_pins'].items():
            relative=Path(path).relative_to(stage['workspace'])
            self.assertEqual(p.sha(path),digest);self.assertEqual(p.sha(self.ws/relative),digest)
        for field in p.INVARIANTS:self.assertEqual(self.spec.get(field),stage.get(field))

    def test_wrong_job_proof_count_and_clock_cannot_be_rebound(self):
        row=self.manifest['entries'][0]
        proof_path=row['native_proof']['path'];proof_raw=(self.ws/proof_path).read_bytes()
        proof=json.loads(proof_raw)
        receiptpath=proof['activation_receipt']['path'];receipt=json.loads((self.ws/receiptpath).read_bytes())
        for change in ['job','count','clock']:
            altered=copy.deepcopy(receipt)
            if change=='job':altered['origin_job_id']='another-native-job'
            if change=='count':altered['native_goal_starts']=2
            if change=='clock':altered['window_start_epoch_seconds']=altered['window_end_epoch_seconds']+1
            raw=self.module.carrier.encoded(altered)+b'\n';changed=copy.deepcopy(proof)
            for key in ['activation_receipt','freeze_receipt']:
                changed[key]['sha256']=self.module.carrier.sha(raw)
            for key in ['activation_time','activation_window_start','freeze_window_end']:
                changed[key]['receipt']['sha256']=self.module.carrier.sha(raw)
            proofbytes=self.module.carrier.encoded(changed)+b'\n';changedrow=copy.deepcopy(row)
            changedrow['native_proof']['sha256']=self.module.carrier.sha(proofbytes)
            def read(rel):
                if rel==proof_path:return proofbytes
                if rel==receiptpath:return raw
                return (self.ws/rel).read_bytes()
            with self.assertRaises(ValueError):self.module.carrier.verify_native_proof(changedrow,self.profile,read)

if __name__=='__main__':unittest.main(verbosity=2)
