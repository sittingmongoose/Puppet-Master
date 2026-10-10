#!/usr/bin/env python3
"""Offline synthetic mechanics only. No reveal execution, native Goals or T3 calls."""
import sys
sys.dont_write_bytecode = True
import datetime as dt
import hashlib
import importlib.util
import json
import tempfile
import subprocess
import unittest
from pathlib import Path
from unittest.mock import patch
HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('overlay_test', HERE / 'prepare.py')
o = importlib.util.module_from_spec(spec)
spec.loader.exec_module(o)
b = o.b

class Mechanics(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix='synthetic-', dir=HERE)
        self.home = Path(self.tmp.name)
        self.t0 = dt.datetime(2030, 1, 1, tzinfo=dt.timezone.utc)
        self.clock = self.t0
        self.old_now = b.now
        b.now = lambda: self.clock
        self.brief = self.home / 'brief.md'
        self.brief.write_bytes((b'SYNTHETIC_FULL_SCOPE_MARKER\n' * 400) + b'END_SCOPE_SENTINEL\n')
        self.config = json.loads((HERE / 'config.example.json').read_text())
        self.config.update(run_id='synthetic', runtime_root=str(self.home / 'runtime'),
                           brief_path=str(self.brief), plan_path=str(self.home / 'unread-plan.md'),
                           whole_deadline_utc=b.iso(self.t0 + dt.timedelta(seconds=7200)),
                           provider={'providerInstanceId':'AUTHORIZED_PROVIDER_INSTANCE','model':'gpt-6-luna',
                                     'options':{'reasoningEffort':'max','serviceTier':'priority'}})
        self.cp = self.home / 'config.json'
        self.save_config()
        self.c = o.load_config(self.cp)

    def save_config(self):
        self.cp.write_text(json.dumps(self.config))

    def tearDown(self):
        b.now = self.old_now
        self.tmp.cleanup()

    def terminal(self, stage):
        # Fabricated offline status fixture; never a live receipt or science.
        p = self.c['_root'] / 'stages' / stage
        b.record_response(self.c, stage, {'structuredContent':{'taskId':'synthetic-' + stage}})
        b.record_status(self.c, stage, {'taskId':'synthetic-' + stage,'status':'completed','hasPendingChildRuns':False})
        (p / 'source-map.json').write_text('{}\n')
        if stage == 'investigator':
            (p / 'discovery.md').write_bytes(b'SYNTHETIC_ONLY\n' * 50)
            (p / 'draft.md').write_text('SYNTHETIC_ONLY\n')
            (p / 'revealed-plan.md').write_text('SYNTHETIC_ONLY\n')
            b.put_json(p / 'plan-reveal.json', {'discovery_sha256':b.digest(p / 'discovery.md'),
                                              'plan_sha256':b.digest(p / 'revealed-plan.md')})
        else:
            (p / 'critique.md').write_text('SYNTHETIC_ONLY\n')

    def test_full_prompt_scope_components_deadlines_and_lifecycle(self):
        expected = {'investigator':1800,'critic':2520,'reviser':3600}
        for stage, start in [('investigator',0),('critic',1805),('reviser',2530)]:
            self.clock = self.t0 + dt.timedelta(seconds=start)
            with patch.object(o, 'original_prepare', wraps=o.original_prepare) as once:
                result = o.prepare(self.c, stage)
                self.assertEqual(once.call_count, 1)
            p = Path(result['stageDir'])
            f = b.read_json(p / 'freeze.json')
            im = b.read_json(p / 'input-map.json')
            baseline = o.original_prompt(self.c, stage, im, f['stage_deadline_utc'], f['whole_deadline_utc']).encode()
            addition = b'' if stage == 'investigator' else b'\n' + o.PINS[stage + '_delta'][0].read_bytes()
            self.assertEqual((p / 'assignment.md').read_bytes(), baseline + addition)
            self.assertIn(b'full original brief', baseline)
            self.assertIn(b'exact released plan', baseline)
            self.assertIn(b'one real native Goal', baseline)
            self.assertEqual((self.c['_root'] / 'inputs' / 'brief.md').read_bytes(), self.brief.read_bytes())
            self.assertEqual(f['stage_deadline_utc'], b.iso(self.t0 + dt.timedelta(seconds=expected[stage])))
            self.assertEqual(f['stage_budget_s'], b.STAGE_SECONDS[stage])
            self.assertEqual(f['time_contract'], 'absolute_T0_30_42_60')
            self.assertEqual(f['requested_route'], self.config['provider'])
            self.assertEqual(f['composite_guard'], o.GUARD)
            self.assertEqual(f['composite_stage_delta'], o.COMPONENTS.get(stage + '_delta'))
            for component in o.COMPONENTS.values():
                self.assertIn(component, f['frozen_inputs'])
            for frozen in f['frozen_inputs']:
                self.assertEqual(b.digest(Path(frozen['path'])), frozen['sha256'])
            self.assertEqual(im['source_roots'], [str(self.c['_root'] / 'stages' / 'investigator' / 'sources')] + ([str(self.c['_root'] / 'stages' / 'critic' / 'sources')] if stage == 'reviser' else []))
            self.assertEqual(len(f['predecessors']), {'investigator':0,'critic':1,'reviser':2}[stage])
            self.terminal(stage)
        self.assertFalse(Path(self.config['plan_path']).exists())  # no actual reveal

    def test_stable_retry_dispatch_and_duplicate_used_reject(self):
        result = o.prepare(self.c, 'investigator')
        p = Path(result['stageDir'])
        before = {x.name:x.read_bytes() for x in p.iterdir() if x.is_file()}
        self.clock += dt.timedelta(seconds=45)
        retry = o.prepare(self.c, 'investigator')
        self.assertTrue(retry['retry'])
        self.assertEqual(retry['args'], result['args'])
        self.assertEqual(result['args']['clientRequestId'], 'er12-composite-synthetic-investigator-A1-A8-v1')
        self.assertEqual(before, {x.name:x.read_bytes() for x in p.iterdir() if x.is_file()})
        b.record_response(self.c, 'investigator', {'structuredContent':{'taskId':'synthetic-one'}})
        self.assertTrue(o.prepare(self.c, 'investigator')['alreadyDispatched'])
        with self.assertRaisesRegex(SystemExit, 'conflicting taskId'):
            b.record_response(self.c, 'investigator', {'structuredContent':{'taskId':'synthetic-two'}})
        self.assertEqual(b.read_json(p / 'dispatch.json')['returned']['taskId'], 'synthetic-one')
        f = b.read_json(p / 'freeze.json')
        del f['composite_guard']
        b.put_json(p / 'freeze.json', f)
        with self.assertRaisesRegex(SystemExit, 'duplicate used runtime'):
            o.prepare(self.c, 'investigator')
        with self.assertRaisesRegex(SystemExit, 'duplicate used runtime'):
            o.prepare(self.c, 'critic')

    def test_unchanged_late_cap_expiry_and_frozen_input_guards(self):
        self.config['whole_deadline_utc'] = b.iso(self.t0 + dt.timedelta(seconds=1700))
        self.save_config()
        self.c = o.load_config(self.cp)
        r = o.prepare(self.c, 'investigator')
        p = Path(r['stageDir'])
        self.assertEqual(b.read_json(p / 'freeze.json')['stage_deadline_utc'], self.config['whole_deadline_utc'])
        (p / 'assignment.md').write_text('synthetic mutation')
        with self.assertRaisesRegex(SystemExit, 'frozen input changed'):
            o.prepare(self.c, 'investigator')
        self.clock = self.t0 + dt.timedelta(seconds=1700)
        with self.assertRaisesRegex(SystemExit, 'expired'):
            o.prepare(self.c, 'investigator')
        # Original A1 late-stage cap, with whole deadline still unexpired.
        self.config['runtime_root'] = str(self.home / 'late-runtime')
        self.config['whole_deadline_utc'] = b.iso(self.t0 + dt.timedelta(seconds=7200))
        self.save_config()
        self.c = o.load_config(self.cp)
        self.clock = self.t0
        o.prepare(self.c, 'investigator')
        self.terminal('investigator')
        self.clock = self.t0 + dt.timedelta(seconds=2520)
        with self.assertRaisesRegex(SystemExit, 'no stage time remains'):
            o.prepare(self.c, 'critic')

    def test_exact_configuration_guards(self):
        for change in [{'method_id':'R0'}, {'method_id':'A1-v1'}, {'stage_prompt_deltas':{'critic':'x'}},
                       {'dispatch_owner':'other'}, {'composite_guard':{}}]:
            with self.subTest(change=change):
                saved = dict(self.config)
                self.config.update(change)
                self.save_config()
                with self.assertRaises(SystemExit):
                    o.load_config(self.cp)
                self.config = saved


    def test_later_stage_whole_cap_and_pending_predecessor(self):
        self.config['whole_deadline_utc'] = b.iso(self.t0 + dt.timedelta(seconds=3450))
        self.save_config()
        self.c = o.load_config(self.cp)
        o.prepare(self.c, 'investigator')
        self.terminal('investigator')
        self.clock = self.t0 + dt.timedelta(seconds=1800)
        inv = self.c['_root'] / 'stages' / 'investigator'
        status = b.read_json(inv / 'status.json')
        status['hasPendingChildRuns'] = True
        b.put_json(inv / 'status.json', status)
        with self.assertRaisesRegex(SystemExit, 'not T3-terminal'):
            o.prepare(self.c, 'critic')
        status['hasPendingChildRuns'] = False
        b.put_json(inv / 'status.json', status)
        o.prepare(self.c, 'critic')
        self.terminal('critic')
        self.clock = self.t0 + dt.timedelta(seconds=2520)
        r = o.prepare(self.c, 'reviser')
        f = b.read_json(Path(r['stageDir']) / 'freeze.json')
        self.assertEqual(f['stage_deadline_utc'], self.config['whole_deadline_utc'])
        self.assertEqual(f['available_stage_seconds_at_prepare'], 930)

    def test_original_cli_actions_through_overlay(self):
        # Subprocess CLI writes synthetic records only; no live tool call.
        self.config['whole_deadline_utc'] = b.iso(self.old_now() + dt.timedelta(hours=2))
        self.save_config()
        def cli(action, payload=None):
            args = [sys.executable, str(HERE / 'prepare.py'), action, '--config', str(self.cp), '--stage', 'investigator']
            if payload is not None:
                args += ['--json', json.dumps(payload)]
            run = subprocess.run(args, capture_output=True, text=True)
            self.assertEqual(run.returncode, 0, run.stderr)
            return json.loads(run.stdout)
        self.assertEqual(cli('deps')['predecessors'], [])
        first = cli('prepare')
        self.assertFalse(first['alreadyDispatched'])
        self.assertEqual(cli('prepare')['args'], first['args'])
        cli('record-capabilities', {'providerInstanceId':'SYNTHETIC_PUBLIC','driverKind':'synthetic','model':'gpt-6-luna','supported':{}})
        cli('record', {'structuredContent':{'taskId':'synthetic-cli'}})
        self.assertEqual(cli('record-status', {'taskId':'synthetic-cli','status':'completed','hasPendingChildRuns':False})['status'], 'completed')
        self.assertTrue(cli('prepare')['alreadyDispatched'])

    def test_every_pin_fails_before_baseline_import(self):
        read = Path.read_bytes
        for name, (target, _) in o.PINS.items():
            with self.subTest(component=name):
                outer = importlib.util.spec_from_file_location('guard_' + name, HERE / 'prepare.py')
                mod = importlib.util.module_from_spec(outer)
                def corrupt(path):
                    raw = read(path)
                    return raw + b'X' if path == target else raw
                with patch.object(Path, 'read_bytes', corrupt), patch.object(importlib.util, 'spec_from_file_location') as base_import:
                    with self.assertRaisesRegex(SystemExit, 'pinned component changed'):
                        outer.loader.exec_module(mod)
                    base_import.assert_not_called()

if __name__ == '__main__':
    unittest.main(verbosity=2)
