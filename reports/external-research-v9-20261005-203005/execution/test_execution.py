"""Behavioral boundary tests. No provider request, account write or scored answer."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import tempfile
import time
import unittest
from unittest.mock import patch
import glm_stage as g
import stage_worker as worker

class GuardTests(unittest.TestCase):
    def exercise(self, seconds, eof=False):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d); read,write=os.pipe(); record=root/'native.json'
            deadline=time.monotonic()+seconds
            cmd=[sys.executable,str(Path(g.__file__).with_name('native_guard.py')),
                 '--watch-fd',str(read),'--deadline',str(deadline),'--record',str(record),
                 '--cwd',d,'--',sys.executable,'-c','import subprocess,time; subprocess.Popen(["sleep","60"]); time.sleep(60)']
            proc=subprocess.Popen(cmd,pass_fds=(read,)); os.close(read)
            try:
                until=time.monotonic()+3
                while not record.exists() and time.monotonic()<until: time.sleep(.02)
                self.assertTrue(record.exists())
                pgid=json.loads(record.read_text())['native_identity']['pgid']
                self.assertTrue(g.group_members(pgid))
                if eof: os.close(write); write=None
                proc.wait(timeout=seconds+3)
                self.assertFalse([m for m in g.group_members(pgid) if m['state']!='Z'])
                terminal=json.loads(Path(str(record)+'.terminal').read_text())
                self.assertEqual(terminal['reason'],'owner_eof' if eof else 'original_deadline')
            finally:
                if write is not None: os.close(write)
                if proc.poll() is None: proc.kill(); proc.wait()
    def test_absolute_deadline_kills_native_descendant(self): self.exercise(.5)
    def test_controller_death_eof_kills_native_descendant(self): self.exercise(2,eof=True)

class MockProcess:
    def poll(self): return None

class FakeProtocol:
    route_model='GLM-5.3-Flash'
    effort='max'
    activation=True
    stopped=[]
    def __init__(self,node,cli,ws,out,config):
        self.output=out; self.private=out/'fake-private'; self.process=MockProcess(); self.telemetry=[]
        self.config=config; self.objective=None; self.finished=False
    def request(self,method,params,timeout=45):
        if method=='workspace/updateProviderRegistry': return {'status':'applied'}
        if method=='workspace/updateModelIoPreferences': return {}
        if method=='session/create':
            self.create=params
            return {'session':{'sessionId':'fresh-001'}}
        if method=='session/read':
            return {'settings':{'model':{'current':{'providerId':'builtin:zai-coding-plan','modelId':self.route_model}},
                                'thoughtLevel':{'current':self.effort}},
                    'session':{'target':{'targetId':'native-goal-001','status':'complete' if self.finished else 'active'}},
                    'projection':{'status':'idle' if self.finished else 'running'}}
        if method=='session/goal' and params['action']=='set':
            self.objective=params['objective'].strip(); self.finished=True
            return {'startedTurn':self.activation,'snapshot':{'session':{'target':{'targetId':'native-goal-001','status':'active','objective':self.objective}}}}
        if method=='v4/conversation/usage': return {'modelRequestCount':1,'modelErrorCount':0}
        self.stopped.append(method); return {}
    def poll(self,seconds=.1): return []
    def close(self): return {'native_quiescent':True,'remaining_group_members':[]}

class RouteBoundaryTests(unittest.TestCase):
    def run_fake(self,**overrides):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d); ws=root/'workspace'; ws.mkdir(); prompt=ws/'TASK.md'; prompt.write_text('/goal\nTest generic route receipt only.\n')
            cli=root/'native.cjs'; cli.write_text('// fake pinned native cli')
            args=argparse.Namespace(workspace=str(ws),prompt_file=str(prompt),out=str(root/'evidence'),job_id='test',
                    max_seconds=90,max_responses=12,tools_config=None,cli=str(cli),node=sys.executable,
                    desktop_config='not-read',probe=False)
            for k,v in overrides.items(): setattr(args,k,v)
            with patch.object(g,'CLI_SHA',hashlib.sha256(cli.read_bytes()).hexdigest()),patch.object(g.ns,'desktop_registry',return_value={'revision':'fake','providers':[]}):
                result=g.run(args,protocol_factory=FakeProtocol)
            return result
    def test_no_native_bash_or_host_read_admission(self):
        for name in ('Bash','Read','Write','Task','mcp_fake'):
            with self.assertRaises(ValueError): g.validate_tools({'tool_allowlist':[name],'mcp_servers':[{}]})
    def test_tool_names_need_server(self):
        with self.assertRaises(ValueError): g.validate_tools({'tool_allowlist':['mcp__confined__test'],'mcp_servers':[]})
    def test_fresh_goal_receipt_and_complete(self):
        result=self.run_fake(); self.assertEqual(result['status'],'completed')
        self.assertTrue(result['goal_activated']); self.assertEqual(result['goal_target_id'],'native-goal-001')
    def test_mismatched_model_never_activates_goal(self):
        with patch.object(FakeProtocol,'route_model','GLM-5.3'):
            result=self.run_fake(); self.assertEqual(result['status'],'execution_error'); self.assertFalse(result['goal_activated'])
    def test_missing_native_started_turn_is_failure(self):
        with patch.object(FakeProtocol,'activation',False):
            result=self.run_fake(); self.assertEqual(result['status'],'execution_error'); self.assertFalse(result['goal_activated'])
    def test_probe_performs_no_goal(self):
        result=self.run_fake(probe=True); self.assertEqual(result['status'],'probe_ready'); self.assertFalse(result['goal_activated'])
    def test_unusable_budget_rejected_before_native(self):
        with self.assertRaises(ValueError): self.run_fake(max_seconds=30)

class WorkerBoundaryTests(unittest.TestCase):
    def exercise(self,write=True,quiet=True,corrupt_pin=False,bad_json=False):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d); ws=root/'workspace'; ws.mkdir(); (ws/'out').mkdir(); (ws/'inputs').mkdir()
            task=ws/'TASK.md'; task.write_text('Generic worker boundary test')
            source=ws/'inputs/brief.txt'; source.write_text('Generic test fixture')
            config=root/'tools.json'; config.write_text('{"tool_allowlist":[],"mcp_servers":[]}')
            pair=root/'pair.json'; pair.write_text('{"test":"prospective"}')
            spec={'job_id':'test','pair_id':'test-pair','arm':'control','stage':'test',
                  'workspace':str(ws),'prompt_file':str(task),'prompt_sha256':worker.digest(task),
                  'out':str(root/'native'),'max_seconds':90,'max_responses':12,'tools_config':str(config),
                  'tools_config_sha256':worker.digest(config),'input_pins':{str(source):'bad' if corrupt_pin else worker.digest(source)},
                  'pair_freeze':{'path':str(pair),'sha256':worker.digest(pair)},
                  'required_artifacts':['out/final/proposal.md','out/final/sources.json']}
            def run(args):
                out=Path(args.out); out.mkdir()
                Path(out/'receipt.json').write_text('{"status":"completed"}')
                if write:
                    final=ws/'out/final'; final.mkdir()
                    (final/'proposal.md').write_text('Generic artifact')
                    (final/'sources.json').write_text('bad json' if bad_json else '{"test":[]}')
                return {'status':'completed','goal_activated':True,'cleanup':{'native_quiescent':quiet}}
            with patch.object(worker.g,'run',side_effect=run) as calls:
                if corrupt_pin:
                    with self.assertRaises(ValueError): worker.run(spec)
                    calls.assert_not_called()
                    return
                result,path=worker.run(spec)
                self.assertTrue(path.is_file())
                return result
    def test_complete_requires_actual_artifacts(self):
        result=self.exercise(write=False)
        self.assertFalse(result['operational_complete']); self.assertEqual(len(result['missing_required_artifacts']),2)
    def test_complete_requires_native_quiescence(self):
        self.assertFalse(self.exercise(quiet=False)['operational_complete'])
    def test_corrupted_input_never_launches(self):
        self.exercise(corrupt_pin=True)
    def test_actual_outputs_frozen_and_hashed(self):
        result=self.exercise(); self.assertTrue(result['operational_complete'])
        self.assertEqual(len(result['artifacts']),2)
        self.assertTrue(all(len(a['sha256'])==64 for a in result['artifacts']))
    def test_malformed_catalog_does_not_complete(self):
        result=self.exercise(bad_json=True); self.assertFalse(result['operational_complete'])
        self.assertEqual(result['invalid_json_artifacts'],['out/final/sources.json'])

if __name__=='__main__': unittest.main()
