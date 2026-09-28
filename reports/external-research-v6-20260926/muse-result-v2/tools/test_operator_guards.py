"""Only prospective refusal guards are exercised; subprocess launch is forbidden."""
import argparse
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location('muse_result_v2_operator', Path(__file__).with_name('run_check.py'))
operator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(operator)

class OperatorGuards(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='muse-result-operator-offline-')
        self.addCleanup(self.temp.cleanup)
        self.lab = Path(self.temp.name)
        for context in (patch.object(operator, 'LAB', self.lab),
                        patch.object(operator.time, 'time', return_value=100),
                        patch.object(operator.subprocess, 'Popen', side_effect=AssertionError('forbidden native dispatch'))):
            context.start()
            self.addCleanup(context.stop)
        self.args = argparse.Namespace(run_root=self.lab / 'fresh', authorized_commit='offline-test-only',
            authorization_reference='synthetic-test-reference', orchestration_started_epoch=99,
            source_pins_sha256='0' * 64, label='SYNTHETIC-NO-DISPATCH')

    def test_existing_root_refuses(self):
        self.args.run_root.mkdir()
        with self.assertRaisesRegex(RuntimeError, 'existing root'):
            operator.main(self.args)

    def test_root_outside_lab_refuses(self):
        self.args.run_root = self.lab / 'nested' / 'fresh'
        with self.assertRaisesRegex(RuntimeError, 'direct child'):
            operator.main(self.args)

    def test_missing_authorization_reference_refuses(self):
        self.args.authorization_reference = ''
        with self.assertRaisesRegex(RuntimeError, 'authorization reference'):
            operator.main(self.args)

    def test_expired_or_future_clock_refuses(self):
        for epoch in (90, 101):
            with self.subTest(epoch=epoch):
                self.args.orchestration_started_epoch = epoch
                with self.assertRaisesRegex(RuntimeError, 'host reserve'):
                    operator.main(self.args)
        self.assertFalse(self.args.run_root.exists())

    def test_pinned_packet_dependency_drift_refuses_before_claim(self):
        bundle = self.lab / 'bundle'
        (bundle / 'tools').mkdir(parents=True)
        (self.lab / 'input-manifest.json').write_text('changed original packet manifest')
        pins = bundle / 'SOURCE_PINS.json'
        pins.write_text(json.dumps({'files': {}, 'unchanged_lab_dependencies': {'input-manifest.json': '0' * 64}}))
        self.args.source_pins_sha256 = operator.sha(pins)
        with patch.object(operator, 'HERE', bundle / 'tools'):
            with self.assertRaisesRegex(RuntimeError, 'dependency drift'):
                operator.main(self.args)
        self.assertFalse(self.args.run_root.exists())

    def test_successor_binding_reaches_existing_host(self):
        import native_completion
        self.assertIs(operator.host_receiver.MuseCompletionFeed, native_completion.MuseCompletionFeed)
        self.assertIs(operator.host_receiver.MuseCompletionFeed.poll.__globals__['CompletionReader'], native_completion.CompletionReader)

if __name__ == '__main__':
    unittest.main(verbosity=2)
