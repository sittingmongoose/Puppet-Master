"""Bounded offline identity, disclosure and original-lifetime regression tests."""
import copy
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import unittest
from unittest import mock

HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import controls
from projector import State
import make_plan


def fresh():
    return {'thread':{'id':'thread-fixture','ephemeral':False,'turns':[]},
        'model':'gpt-6-luna','reasoningEffort':'max','cwd':'/fixture/workspace',
        'modelProvider':'openai','approvalPolicy':'never','instructionSources':[]}


class IdentityPrivacy(unittest.TestCase):
    def test_exact_selected_sources_and_only_declared_catalog_delta(self):
        controls.verify_sources()
        with tempfile.TemporaryDirectory() as root:
            dst=Path(root)
            for name in ('official-luna-catalog.json','restricted-luna-catalog.json'):
                (dst/name).write_bytes((HERE/name).read_bytes())
            (dst/'selected-sources.json').write_text('{"sources":{}}')
            changed=json.loads((dst/'restricted-luna-catalog.json').read_text())
            changed['models'][0]['context_window']+=1
            (dst/'restricted-luna-catalog.json').write_text(json.dumps(changed))
            with mock.patch.object(controls,'HERE',dst):
                with self.assertRaisesRegex(ValueError,'undeclared catalog mutation'):controls.verify_sources()

    def test_stronger_model_fork_history_and_effort_are_rejected(self):
        for change in ({'model':'gpt-6-astra'},{'reasoningEffort':'high'},
                       {'instructionSources':['/private/AGENTS.md']},
                       {'thread':{'id':'thread-fixture','ephemeral':False,'turns':[{'id':'old'}]}},
                       {'thread':{'id':'thread-fixture','ephemeral':False,'turns':[],'forkedFromId':'sibling'}}):
            row=fresh();row.update(change)
            with self.assertRaises(ValueError):State().bind_thread(row,Path('/fixture/workspace'))

    def test_goal_ack_is_not_activation_and_artifact_is_not_completion(self):
        s=State();s.bind_thread(fresh(),Path('/fixture/workspace'))
        s.goal({'goal':{'threadId':s.thread,'status':'active','tokenBudget':None}})
        s.goal_set_ack=True
        self.assertFalse(s.activation['native_activation_observed'])
        s.initial_turn='turn-fixture';s.initial_turn_ack=True
        self.assertFalse(s.activation['native_activation_observed'])
        s.event({'method':'turn/started','params':{'threadId':s.thread,'turn':{'id':'turn-fixture','status':'inProgress'}}})
        self.assertTrue(s.activation['native_activation_observed'])
        with tempfile.TemporaryDirectory() as root:
            (Path(root)/'done.json').write_text('{"goal":"complete"}')
            self.assertEqual(s.goal_status,'active')
        s.event({'method':'thread/goal/updated','params':{'threadId':s.thread,'goal':{'threadId':s.thread,'status':'complete','tokenBudget':None}}})
        self.assertEqual(s.goal_status,'complete')
        self.assertFalse(s.metrics()['inventory_check']['verified'])

    def test_goal_replacement_is_rejected(self):
        s=State();s.bind_thread(fresh(),Path('/fixture/workspace'))
        s.goal_created_at=123;s.goal_objective='original'
        with self.assertRaises(ValueError):s.goal({'goal':{'threadId':s.thread,'status':'active','createdAt':124,'objective':'replacement'}})
        self.assertTrue(s.failed)
        self.assertEqual(s.metrics()['goal_replacements_observed'],1)

    def test_private_text_and_unknown_tool_payload_do_not_cross_projection(self):
        s=State();s.bind_thread(fresh(),Path('/fixture/workspace'))
        secret='PRIVATE_TOKEN_NEVER_EMIT'
        for event in [
            {'method':'item/completed','params':{'threadId':s.thread,'item':{'type':'agentMessage','text':secret}}},
            {'method':'item/completed','params':{'threadId':s.thread,'item':{'type':'mcpToolCall','server':'evil','tool':secret,'arguments':secret}}},
            {'method':'thread/goal/updated','params':{'threadId':s.thread,'goal':{'threadId':s.thread,'status':'active','objective':secret,'tokenBudget':None}}}]:s.event(event)
        self.assertNotIn(secret,json.dumps(s.metrics()))
        self.assertTrue(s.failed)

    def test_mcp_catalog_rejects_extra_reader_or_resources(self):
        row={'name':'pm_boundary','tools':{x:{} for x in controls.MCP_TOOLS},'resources':[],
             'resourceTemplates':[],'toolsError':None,'pluginId':None}
        s=State();s.mcp_catalog({'data':[row]})
        for bad in [dict(row,tools={**row['tools'],'read_private':{}}),dict(row,resources=[{'uri':'secret'}])]:
            with self.assertRaises(ValueError):State().mcp_catalog({'data':[bad]})

    def test_host_never_starts_automatic_continuations(self):
        s=State();s.bind_thread(fresh(),Path('/fixture/workspace'))
        s.initial_turn_ack=True
        for turn in ('initial','native-auto'):
            s.event({'method':'turn/started','params':{'threadId':s.thread,'turn':{'id':turn,'status':'inProgress'}}})
            s.event({'method':'turn/completed','params':{'threadId':s.thread,'turn':{'id':turn,'status':'completed'}}})
        self.assertTrue(s.metrics()['native_owned_continuation_observed'])
        self.assertEqual(s.metrics()['host_followup_turns_started'],0)


class OriginalLifetime(unittest.TestCase):
    def test_constructor_cannot_reset_original_stage_birth(self):
        start=100_000_000_000
        clock={'case_id':'fixture','case_start_monotonic_ns':start,
            'case_elapsed_cap_seconds':3600,'case_occupied_cap_seconds':5400,
            'outside_native_cap_seconds':300,'campaign_native_cutoff_monotonic_ns':start+3600*10**9,
            'stages':{'fixture':{'stage_start_monotonic_ns':start,'cap_seconds':480,'response_cap':1}}}
        kw={'stage_id':'fixture','start_ns':start,'cap_seconds':480,'response_cap':1,
            'workspace':'/fixture/ws','prompt':'/fixture/prompt','native_out':'/fixture/native',
            'label':'fixture','admission':'/fixture/binding','private_auth_binding':{'source':'/fixture/auth-source.json','target':'/fixture/private-native/auth.json'},'boundary_acceptance':{'path':'/fixture/accepted','sha256':'a'},
            'plan_path':'/fixture/plan','public_get':True,'cleanup_reserve_seconds':30,
            'case_authority':{'path':'/fixture/clock','sha256':'a','clock':clock},
            'route_snapshot':{'path':'/fixture/route','sha256':'a'},
            'route_acceptance':{'path':'/fixture/accept','sha256':'a'},
            'assembly_binding':{k:{'path':'/fixture/'+k,'sha256':'a'} for k in ('config','lease','case_binding','acceptance')}}
        plan=make_plan.construct(**kw)
        self.assertEqual(plan['native_stop_monotonic_ns'],start+450*10**9)
        self.assertIn('--cap-drop',plan['recovery_namespace_command'])
        self.assertEqual(plan['runtime_path'],str(HERE/'launch.py'))
        for changed in ({'start_ns':start+10**9},{'cap_seconds':600},{'response_cap':65}):
            with self.assertRaises(ValueError):make_plan.construct(**dict(kw,**changed))

    def test_expired_watchdog_never_spawns_child(self):
        with tempfile.TemporaryDirectory() as root:
            marker=Path(root)/'started';record=Path(root)/'process'
            read_fd,write_fd=os.pipe();stop=time.monotonic_ns()-1
            env={'PATH':'/usr/bin:/bin','PM_BOUND_DEADLINE_NS':str(stop)}
            try:
                rc=subprocess.run(['/usr/bin/python3','-I','-B',str(HERE/'host_guard.py'),
                    str(read_fd),str(stop),str(record),'--','/usr/bin/python3','-c',
                    'from pathlib import Path;Path('+repr(str(marker))+').touch()'],
                    env=env,pass_fds=(read_fd,),timeout=2).returncode
                self.assertEqual(rc,124);self.assertFalse(marker.exists());self.assertFalse(record.exists())
            finally:os.close(read_fd);os.close(write_fd)

    def test_watchdog_eof_cleans_only_owned_native_group(self):
        with tempfile.TemporaryDirectory() as root:
            record=Path(root)/'process';read_fd,write_fd=os.pipe();stop=time.monotonic_ns()+5*10**9
            env={'PATH':'/usr/bin:/bin','PM_BOUND_DEADLINE_NS':str(stop)}
            p=subprocess.Popen(['/usr/bin/python3','-I','-B',str(HERE/'host_guard.py'),
                str(read_fd),str(stop),str(record),'--','/usr/bin/sleep','10'],
                env=env,pass_fds=(read_fd,))
            os.close(read_fd)
            try:
                end=time.monotonic()+2
                while not record.exists() and time.monotonic()<end:time.sleep(.01)
                self.assertTrue(record.exists())
                pid=json.loads(record.read_text())['native_host_pid']
                os.close(write_fd);write_fd=None;p.wait(timeout=2)
                with self.assertRaises(ProcessLookupError):os.kill(pid,0)
            finally:
                if write_fd is not None:os.close(write_fd)
                if p.poll() is None:p.kill();p.wait()

if __name__=='__main__':unittest.main()
