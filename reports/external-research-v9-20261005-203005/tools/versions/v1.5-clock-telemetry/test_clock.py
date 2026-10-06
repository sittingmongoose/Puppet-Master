"""Finite zero-inference clock/boundary tests; no native Goal or remote GET."""
import ast
import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import tempfile
import time
import unittest

HERE = Path(__file__).resolve().parent
def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    return module
clock = load('test_clock_impl', HERE/'clock_telemetry.py')
config = load('test_clock_config', HERE/'config.py')
framing = load('test_clock_peer', HERE/'test_framing.py')
binding = load('test_clock_binding', HERE/'operator_binding.py')
clock_binding = load('test_clock_constructor', HERE/'clock_binding.py')

class ClockTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix='er9-clock-mechanical-')
        self.root = Path(self.tmp.name); self.ws = self.root/'case'; self.ws.mkdir()
        for name in ('inputs', 'out'): (self.ws/name).mkdir()
        (self.ws/'TASK.md').write_text('Synthetic clock interface, no native Goal.\n')
        self.birth = time.monotonic_ns()-1000000000
        self.profile = {'schema':clock.PROFILE_SCHEMA, 'stage_id':'SYNTHETIC-CLOCK',
            'original_birth_monotonic_ns':self.birth, 'original_stage_allocation_seconds':600,
            'original_candidate_action_deadline_monotonic_ns':self.birth+570000000000,
            'original_total_cleanup_stop_monotonic_ns':self.birth+600000000000,
            'action_deadline_proof':{'kind':'explicit_original_native_action_deadline',
                'controller_path':str(HERE/'test_clock.py'),
                'controller_sha256':hashlib.sha256((HERE/'test_clock.py').read_bytes()).hexdigest(),
                'action_field':'SYNTHETIC explicit original action scalar, not native controller proof'}}
        receipt_path=self.root/'original-clock-receipt.json'
        receipt={k:v for k,v in self.profile.items() if k not in ('schema','action_deadline_proof')}
        receipt_path.write_bytes(clock.encoded(receipt))
        self.profile['action_deadline_proof']['receipt']={'path':str(receipt_path),'sha256':hashlib.sha256(receipt_path.read_bytes()).hexdigest(),
            'stage_id_selector':'/stage_id','birth_selector':'/original_birth_monotonic_ns',
            'allocation_selector':'/original_stage_allocation_seconds','action_deadline_selector':'/original_candidate_action_deadline_monotonic_ns',
            'total_cleanup_selector':'/original_total_cleanup_stop_monotonic_ns'}
        self.path = self.root/'clock.json'; self.write(); self.peers=[]
    def write(self): self.path.write_bytes(clock.encoded(self.profile))
    def tearDown(self):
        for peer in self.peers: peer.close()
        self.tmp.cleanup()
    def test_action_separate_from_cleanup_and_original_elapsed(self):
        value=clock.snapshot(self.profile,self.birth+560000000000)['stage_clock']
        self.assertEqual(value['remaining_candidate_action_ms'],10000)
        self.assertEqual(value['elapsed_since_original_birth_ms'],560000)
        self.assertEqual(value['original_stage_allocation_seconds'],600)
        self.assertNotEqual(value['remaining_candidate_action_ms'],40000)
    def test_expired_no_timer_reset(self):
        for delta in (570,580,601):
            value=clock.snapshot(self.profile,self.birth+delta*1000000000)['stage_clock']
            self.assertEqual(value['remaining_candidate_action_ms'],0)
            self.assertEqual(value['original_birth_monotonic_ns'],self.birth)
            self.assertEqual(value['original_candidate_action_deadline_monotonic_ns'],self.birth+570000000000)
        self.assertEqual(clock.snapshot(self.profile,self.birth+571000000000)['stage_clock'],clock.snapshot(self.profile,self.birth+571000000000)['stage_clock'])
    def test_missing_action_or_proof_unknown_even_total_present(self):
        for field in ('original_candidate_action_deadline_monotonic_ns','action_deadline_proof'):
            profile=copy.deepcopy(self.profile); profile[field]=None
            value=clock.snapshot(profile,self.birth+2000000000)['stage_clock']
            self.assertEqual(value['action_deadline_status'],'UNKNOWN')
            self.assertIsNone(value['remaining_candidate_action_ms'])
            self.assertIsNone(value['original_candidate_action_deadline_monotonic_ns'])
            self.assertIsNotNone(value['original_total_cleanup_stop_monotonic_ns'])
        self.assertEqual(clock.snapshot()['stage_clock']['action_deadline_status'],'UNKNOWN')
    def test_clock_bounds_and_controller_drift(self):
        for field, invalid in [('original_birth_monotonic_ns',True),
            ('original_candidate_action_deadline_monotonic_ns',self.birth-1),
            ('original_candidate_action_deadline_monotonic_ns',self.birth+601000000000),
            ('original_stage_allocation_seconds',900)]:
            profile=copy.deepcopy(self.profile);profile[field]=invalid
            with self.assertRaises(ValueError):clock.validate(profile)
        before=clock.snapshot(self.profile,self.birth-1)['stage_clock']
        self.assertIsNone(before['remaining_candidate_action_ms'])
        self.assertIsNone(before['elapsed_since_original_birth_ms'])
        profile=copy.deepcopy(self.profile);profile['original_candidate_action_deadline_monotonic_ns']+=1
        with self.assertRaisesRegex(ValueError,'receipt value'):
            clock.validate(profile,verify_controller=True)
        self.profile['action_deadline_proof']['controller_sha256']='0'*64;self.write()
        with self.assertRaises(ValueError):config.mcp_configs(self.ws,clock_profile_path=self.path,clock_stage_id=self.profile["stage_id"])
    def test_stage_private_pin_and_initial_visible_metadata(self):
        cfg=config.mcp_configs(self.ws,clock_profile_path=self.path,clock_stage_id=self.profile["stage_id"],public_get=True)
        self.assertEqual(json.loads(cfg['initial_clock_metadata_utf8']),cfg['initial_clock_metadata'])
        self.assertEqual(cfg['initial_clock_metadata']['stage_clock']['stage_id'],self.profile['stage_id'])
        self.assertNotIn(str(HERE),cfg['initial_clock_metadata_utf8'])
        pinned=cfg['clock_profile_sha256'];self.path.write_bytes(self.path.read_bytes()+b' ')
        with self.assertRaises(ValueError):clock.load(self.path,pinned)
        self.write();visible=self.ws/'inputs/clock.json';visible.write_bytes(self.path.read_bytes())
        with self.assertRaises(ValueError):config.mcp_configs(self.ws,clock_profile_path=visible,clock_stage_id=self.profile["stage_id"])
        with self.assertRaisesRegex(ValueError,'stage binding'):
            config.mcp_configs(self.ws,clock_profile_path=self.path,clock_stage_id='STALE-OTHER-STAGE')
        symlink=self.root/'link.json';symlink.symlink_to(self.path)
        with self.assertRaises(ValueError):clock.load(symlink)
        built=binding.binding(stage_id='STALE-STAGE',stage_role='final',case_id='SYNTHETIC',arm_id='C',method_factors=['V01'],actor_binding={'stage_id':'STALE-STAGE'},entries=[],complete_final_role=True)
        (self.ws/built['profile']['import_manifest']['path']).write_bytes(built['manifest_bytes'])
        bundle=self.root/'bundle.json';bundle.write_bytes(built['profile_bytes'])
        with self.assertRaisesRegex(ValueError,'clock stage identity drift'):
            config.mcp_configs(self.ws,clock_profile_path=self.path,clock_stage_id=self.profile["stage_id"],bundle_profile_path=bundle,deadline_monotonic_ns=self.birth+570000000000)
    def test_business_payload_byte_identity_and_error_integrity(self):
        for result in ({'content':[{'type':'text','text':'{"source":"α\\n", "sha256":"exact"}'}],'isError':False},
                       {'content':[{'type':'text','text':'boundary failure: ValueError'}],'isError':True}):
            original=copy.deepcopy(result);out=clock.append_result(result,self.profile)
            self.assertEqual(result,original);self.assertEqual(out['content'][0],original['content'][0])
            self.assertEqual(out['isError'],original['isError']);self.assertEqual(len(out['content']),2)
    def test_real_source_all_allowed_calls_and_private_clock(self):
        cfg=config.mcp_configs(self.ws,clock_profile_path=self.path,clock_stage_id=self.profile["stage_id"],public_get=True)
        source=cfg['mcp_servers'][0];peer=framing.Peer([source['command'],*source['args']]);self.peers.append(peer)
        calls=[('read_file',{'path':'TASK.md'}),('write_file',{'path':'out/synthetic.txt','text':'literal\r\nα'}),
               ('mechanical',{'operation':'line_map','source':'TASK.md','output':'out/map.txt'}),
               ('public_https_get',{'url':'http://invalid.example/never-network'}),
               ('read_file',{'path':'/runtime/clock_profile.json'})]
        for index,(name,args) in enumerate(calls,1):
            peer.send([framing.frame(index,'tools/call',{'name':name,'arguments':args})]);reply=peer.receive()['result']
            self.assertEqual(len(reply['content']),2)
            meta=json.loads(reply['content'][1]['text'])['stage_clock']
            self.assertEqual(meta['stage_id'],self.profile['stage_id']);self.assertEqual(meta['action_deadline_status'],'KNOWN')
            self.assertLessEqual(meta['remaining_candidate_action_ms'],570000)
            self.assertEqual(reply['isError'],index in (4,5))
        self.assertEqual((self.ws/'out/synthetic.txt').read_bytes(),'literal\r\nα'.encode())
        events=[json.loads(line) for line in (self.ws/'operation_receipts/events.jsonl').read_text().splitlines()]
        self.assertEqual(sum(x.get('stage')=='prepared-result' for x in events),5)
    def test_control_treatment_policy_cardinality_and_actual_execution(self):
        control=config.mcp_configs(self.ws,clock_profile_path=self.path,clock_stage_id=self.profile["stage_id"],public_get=True)
        treatment=config.mcp_configs(self.ws,clock_profile_path=self.path,clock_stage_id=self.profile["stage_id"],public_get=True,execution_enabled=True)
        self.assertEqual(len(control['tool_allowlist']),4);self.assertEqual(len(treatment['tool_allowlist']),5)
        for cfg in (control,treatment):
            self.assertEqual(cfg['clock_profile_sha256'],control['clock_profile_sha256'])
            self.assertEqual(cfg['initial_clock_metadata']['stage_clock']['original_candidate_action_deadline_monotonic_ns'],self.profile['original_candidate_action_deadline_monotonic_ns'])
        source=treatment['mcp_servers'][1];peer=framing.Peer([source['command'],*source['args']]);self.peers.append(peer)
        peer.send([framing.frame(1,'tools/call',{'name':'python_execute','arguments':{'code':'print(sum(data))','data':[20,22]}})])
        result=peer.receive(5)['result'];business=json.loads(result['content'][0]['text'])
        self.assertEqual(business['stdout'],'42\n');self.assertEqual(business['exit_code'],0);self.assertTrue(business['cleanup_confirmed'])
        saved=self.ws/'operation_receipts/executions'/business['execution_id']/'result.json'
        self.assertEqual(json.loads(saved.read_bytes()),business)
        self.assertNotIn('stage_clock',business)
        self.assertEqual(json.loads(result['content'][1]['text'])['stage_clock']['stage_id'],self.profile['stage_id'])
        peer.send([framing.frame(2,'tools/call',{'name':'python_execute','arguments':{'path':'DENIED'}})])
        failed=peer.receive()['result'];self.assertTrue(failed['isError']);self.assertEqual(len(failed['content']),2)
    def test_existing_semantic_and_kernel_code_unchanged(self):
        old=HERE.parent/'v1.4-bundle'
        for rel in ('bundle_carrier.py','operator_binding.py','resource_profile.py','resource_gate.py'):
            self.assertEqual((HERE/rel).read_bytes(),(old/rel).read_bytes())
        for rel,names in [('execution_server.py',['execute','observe_cleanup','trusted_service_env']),
            ('source_capture/tool_server.py',['perform','fetch','public_url','read_raw','write_raw'])]:
            def bodies(path):
                return {node.name:ast.dump(node,include_attributes=False) for node in ast.parse(path.read_text()).body if isinstance(node,ast.FunctionDef)}
            current,previous=bodies(HERE/rel),bodies(old/rel)
            for name in names:self.assertEqual(current[name],previous[name])
    def test_constructor_only_supplied_action_and_null_proof(self):
        args={key:self.profile[key] for key in ('stage_id','original_birth_monotonic_ns',
            'original_stage_allocation_seconds','original_candidate_action_deadline_monotonic_ns',
            'original_total_cleanup_stop_monotonic_ns')}
        proof=self.profile['action_deadline_proof'];receipt=self.root/'constructed-receipt.json'
        built=clock_binding.binding(**args,receipt_path=receipt,
            controller_path=proof['controller_path'],controller_sha256=proof['controller_sha256'],action_field=proof['action_field'])
        receipt.write_bytes(built['receipt_bytes']);clock.validate(built['profile'],verify_controller=True)
        self.assertEqual(built['profile']['original_candidate_action_deadline_monotonic_ns'],args['original_candidate_action_deadline_monotonic_ns'])
        args['original_candidate_action_deadline_monotonic_ns']=None
        unknown=clock_binding.binding(**args,receipt_path=receipt)
        self.assertIsNone(unknown['profile']['action_deadline_proof'])
        self.assertIsNone(clock.snapshot(unknown['profile'])['stage_clock']['remaining_candidate_action_ms'])

if __name__=='__main__':unittest.main(verbosity=2)
