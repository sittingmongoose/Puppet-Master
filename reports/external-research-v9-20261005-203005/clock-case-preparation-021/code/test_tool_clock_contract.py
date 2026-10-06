#!/usr/bin/env python3
"""Actual1.5 constructor/config wiring on labeled synthetic clocks, no Goal."""
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import time
import unittest
import blueprint as b

TOOLS=b.p.LAB/'dev/tools/versions/v1.5-clock-telemetry'
SOURCE={'path':str(TOOLS/'SOURCE_PINS.json'),'sha256':'abe26402b0156639e4c0a207e5a030db012c5f2d4b5af5d507a95f00eadeb748'}

def module(name):
    spec=importlib.util.spec_from_file_location('source_clock_contract_'+name,TOOLS/(name+'.py'))
    value=importlib.util.module_from_spec(spec);spec.loader.exec_module(value);return value

class ActualToolClockContractTests(unittest.TestCase):
    def sample(self,directory,proof=True):
        root=Path(directory);controller=root/'SYNTHETIC_CONTROLLER.py'
        controller.write_text('# SYNTHETIC controller proof fixture only, no native activation\n')
        clock=module('clock_binding');observed=time.monotonic_ns();birth=observed-10**9
        # Two separately declared synthetic original scalar values. Never
        # derive the action stop by subtracting a reserve from cleanup stop.
        action=birth+570*10**9;total=birth+600*10**9
        result=clock.binding(stage_id='SYNTHETIC-clock-stage',original_birth_monotonic_ns=birth,
          original_stage_allocation_seconds=600,original_candidate_action_deadline_monotonic_ns=action,
          original_total_cleanup_stop_monotonic_ns=total,receipt_path=root/'controller-receipt.json',
          controller_path=controller if proof else None,controller_sha256=b.p.sha(controller) if proof else None,
          action_field='SYNTHETIC_explicit_original_native_action_deadline' if proof else None)
        receipt=root/'controller-receipt.json';receipt.write_bytes(result['receipt_bytes']);receipt.chmod(0o600)
        profile=root/'clock-profile.json';profile.write_bytes(result['profile_bytes']);profile.chmod(0o600)
        ws=root/'workspace';(ws/'inputs').mkdir(parents=True);(ws/'out').mkdir();(ws/'TASK.md').write_text('SYNTHETIC SCIENCE-FREE TASK PREFIX\n')
        return profile,ws,action,total,birth

    def test_actual1_5_initial_utf8_same_sample_and_action_not_cleanup_remaining(self):
        b.p.checked(SOURCE)
        with tempfile.TemporaryDirectory(dir=b.ROOT) as directory:
            profile,ws,action,total,birth=self.sample(directory)
            conf=module('config').mcp_configs(ws,capture_dir=Path(directory)/'captures',evidence_dir=Path(directory)/'evidence',
                  deadline_monotonic_ns=total,execution_enabled=False,public_get=True,
                  clock_profile_path=profile,clock_stage_id='SYNTHETIC-clock-stage')
            self.assertEqual(json.loads(conf['initial_clock_metadata_utf8']),conf['initial_clock_metadata'])
            initial=conf['initial_clock_metadata']['stage_clock']
            self.assertEqual(initial['original_stage_allocation_seconds'],600)
            self.assertEqual(initial['original_candidate_action_deadline_monotonic_ns'],action)
            self.assertEqual(initial['original_total_cleanup_stop_monotonic_ns'],total)
            expected=max(0,(action-initial['observation_monotonic_ns'])//10**6)
            self.assertEqual(initial['remaining_candidate_action_ms'],expected)
            self.assertNotEqual(initial['remaining_candidate_action_ms'],max(0,(total-initial['observation_monotonic_ns'])//10**6))
            self.assertEqual(len(conf['tool_allowlist']),4)
            self.assertNotIn('mcp__pm_execution__python_execute',conf['tool_allowlist'])
            self.assertEqual((ws/'TASK.md').read_text(),'SYNTHETIC SCIENCE-FREE TASK PREFIX\n')

    def test_unknown_action_proof_stays_unknown_with_total_stop_present(self):
        with tempfile.TemporaryDirectory(dir=b.ROOT) as directory:
            profile,ws,action,total,birth=self.sample(directory,proof=False)
            conf=module('config').mcp_configs(ws,capture_dir=Path(directory)/'captures',evidence_dir=Path(directory)/'evidence',
                deadline_monotonic_ns=total,clock_profile_path=profile,clock_stage_id='SYNTHETIC-clock-stage')
            initial=conf['initial_clock_metadata']['stage_clock'];self.assertEqual(initial['action_deadline_status'],'UNKNOWN')
            self.assertIsNone(initial['remaining_candidate_action_ms'])
            self.assertEqual(initial['original_total_cleanup_stop_monotonic_ns'],total)

    def test_wrong_stage_and_actual_unchanged_execution_factor_allowlists(self):
        with tempfile.TemporaryDirectory(dir=b.ROOT) as directory:
            profile,ws,action,total,birth=self.sample(directory);config=module('config')
            with self.assertRaisesRegex(ValueError,'original clock stage binding'):
                config.mcp_configs(ws,deadline_monotonic_ns=total,clock_profile_path=profile,clock_stage_id='another-stage')
            conf=config.mcp_configs(ws,capture_dir=Path(directory)/'captures',evidence_dir=Path(directory)/'evidence',
                   deadline_monotonic_ns=total,execution_enabled=True,public_get=True,clock_profile_path=profile,clock_stage_id='SYNTHETIC-clock-stage')
            self.assertEqual(len(conf['tool_allowlist']),5);self.assertIn('mcp__pm_execution__python_execute',conf['tool_allowlist'])
            args=conf['mcp_servers'][-1]['args'];self.assertIn('--clock-profile',args)

if __name__=='__main__':unittest.main(verbosity=2)
