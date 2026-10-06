import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('dispatch', Path(__file__).with_name('dispatch.py'))
d = importlib.util.module_from_spec(spec)
spec.loader.exec_module(d)


class DurableDispatch(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.lab = Path(self.temp.name)
        (self.lab / 'state').mkdir()
        (self.lab / 'ops/dispatcher').mkdir(parents=True)
        self.stage = self.lab / 'stage.json'
        self.stage.write_text('{}')
        self.row = {'job_id': 'I-01-control-research-a001', 'status': 'SEALED_READY',
                    'pair_id': 'I-01', 'prerequisite_job': None,
                    'stage_json': str(self.stage), 'stage_sha256': d.sha(self.stage),
                    'max_seconds': 10, 'max_responses': 2,
                    'expected_freeze': str(self.lab / 'freeze.json')}
        self.state = {'jobs': [self.row]}
        d.atomic(self.lab / 'state/jobs.json', self.state)

    def tearDown(self):
        self.temp.cleanup()

    def test_absent_readiness_never_launches(self):
        with patch.object(d, 'launch') as launch:
            d.cycle(self.lab)
        launch.assert_not_called()

    def test_intent_persists_before_external_spawn_failure(self):
        with patch.object(d.subprocess, 'run', side_effect=TimeoutError('unknown spawn')):
            with self.assertRaises(TimeoutError):
                d.launch(self.lab, self.state, self.row, {'source_pins': {}})
        saved = json.loads((self.lab / 'state/jobs.json').read_text())['jobs'][0]
        self.assertEqual(saved['status'], 'STARTING')
        self.assertEqual(len((self.lab / 'state/attempts.jsonl').read_text().splitlines()), 1)
        with patch.object(d, 'unit_status', return_value={'ActiveState': 'inactive'}):
            d.reconcile(self.lab, {'jobs': [saved]})
        self.assertEqual(saved['status'], 'UNCERTAIN_TERMINAL_NO_FREEZE')
        self.assertIsNone(saved['native_goal_starts'])

    def test_complete_frozen_stage_only_when_worker_service_ended(self):
        self.row.update(status='RUNNING', unit='owned.service')
        d.atomic(self.lab / 'native-receipt.json', {'native_responses': 2, 'native_usage': {'totalTokens': 7}})
        d.atomic(self.lab / 'freeze.json', {'operational_complete': True,
                                         'native_goal_starts': 1, 'elapsed_seconds': 7,
                                         'native_receipt': {'path': str(self.lab / 'native-receipt.json'),
                                                            'sha256': d.sha(self.lab / 'native-receipt.json')}})
        with patch.object(d, 'unit_status', return_value={'ActiveState': 'active'}):
            d.reconcile(self.lab, self.state)
        self.assertEqual(self.row['status'], 'RUNNING')
        with patch.object(d, 'unit_status', return_value={'ActiveState': 'inactive'}):
            d.reconcile(self.lab, self.state)
        self.assertEqual(self.row['status'], 'COMPLETED')

    def test_missing_freeze_cannot_erase_positive_native_activation(self):
        self.row.update(status='RUNNING',unit='owned.service',activation_observed=True,native_goal_starts=1)
        with patch.object(d,'unit_status',return_value={'ActiveState':'inactive'}):
            d.reconcile(self.lab,self.state)
        self.assertEqual(self.row['status'],'UNCERTAIN_TERMINAL_NO_FREEZE')
        self.assertEqual(self.row['native_goal_starts'],1)

    def test_multi_prerequisite_failure_blocks_unbound_descendant(self):
        failed = {'job_id':'seed-base','status':'FAILED'}
        descendant = {'job_id':'seed-critic','status':'WAITING_RUNTIME_BINDING','prerequisite_job_ids':['seed-base']}
        state = {'jobs':[failed,descendant]}
        d.reconcile(self.lab,state)
        self.assertEqual(descendant['status'],'BLOCKED_PREDECESSOR_FAILED')
        self.assertEqual(descendant['blocked_by'],'seed-base')

    def test_selected_runtime_source_drift_rejected_before_launch_intent(self):
        code = self.lab / 'tool-server.py'; code.write_text('original')
        manifest = self.lab / 'SOURCE_PINS.json'
        d.atomic(manifest,{'files':{'tool-server.py':d.sha(code)}})
        self.row['tools_source_pins']={'path':str(manifest),'sha256':d.sha(manifest)}
        code.write_text('drift')
        with self.assertRaises(ValueError):
            d.launch(self.lab,self.state,self.row,{'source_pins':{}})
        self.assertEqual(self.row['status'],'SEALED_READY')
        self.assertFalse((self.lab / 'state/attempts.jsonl').exists())

    def test_complete_envelope_launch_uses_original_clock_and_private_slice(self):
        import sys
        sys.path.insert(0, str(Path(__file__).parent))
        import resource_admission
        self.row['resource_definition'] = {'selected': True}
        self.row['resource_profile'] = {'path': '/trusted/profile.json', 'sha256': 'pin'}
        clock = 123000000000
        profile = {'slice_unit': 'er9memtest.slice', 'original_total_stop_monotonic_ns': clock + 10_000_000_000}
        from types import SimpleNamespace
        with patch.object(resource_admission, 'allocate', return_value=profile) as allocation, patch.object(d.time, 'monotonic_ns', return_value=clock), patch.object(d.subprocess, 'run', return_value=SimpleNamespace(returncode=0,stdout='',stderr='')) as spawn:
            d.launch(self.lab,self.state,self.row,{'source_pins':{}})
        allocation.assert_called_once_with(self.lab,self.row,self.stage.parent,clock)
        argv = spawn.call_args.args[0]
        self.assertEqual(argv[3], 'er9-203005-i-01-control-research-a001')
        self.assertIn('--slice=er9memtest.slice',argv)
        self.assertIn('--property=MemoryMax=805306368',argv)
        self.assertIn('--property=MemorySwapMax=0',argv)
        self.assertIn('--property=RuntimeMaxSec=10.0',argv)
        self.assertNotIn('--property=RuntimeMaxSec=55',argv)
        self.assertEqual(argv[argv.index('--birth-monotonic-ns')+1],str(clock))
        self.assertEqual(argv[argv.index('--resource-profile')+1],'/trusted/profile.json')

    def test_changed_prospective_spec_rejected_before_intent(self):
        self.stage.write_text('{"changed":true}')
        with self.assertRaises(ValueError):
            d.launch(self.lab, self.state, self.row, {'source_pins': {}})
        self.assertFalse((self.lab / 'state/attempts.jsonl').exists())


if __name__ == '__main__':
    unittest.main()
