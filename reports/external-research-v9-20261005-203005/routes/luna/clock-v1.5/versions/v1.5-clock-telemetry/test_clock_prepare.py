"""No-process actual production preparation tests, synthetic inputs only."""
import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import tempfile
import time
import unittest
from unittest.mock import patch

HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]


def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
prepare=load('_er9_l15_production_prepare',HERE/'clock_prepare.py')
declaration=load('_er9_l15_decl_test',HERE/'clock_declaration.py')
release=load('_er9_l15_release_test',HERE/'resource_tool_release.py')
resource=load('_er9_l15_resource_fixture',ROOT/'resource_slice.py')


def fixture(folder,label='SYNTHETIC-L15',seconds=600,bundle=False,execution=False,action_known=True):
    ws=folder/'workspace';ws.mkdir();private=folder/'private';private.mkdir()
    for name in ('inputs','out'):(ws/name).mkdir()
    science='SYNTHETIC unchanged first native text\r\nα\t  '
    (ws/'TASK.md').write_bytes(science.encode());body=folder/'prompt.txt';body.write_bytes(science.encode())
    birth=time.monotonic_ns()-1_000_000_000;total=birth+seconds*1_000_000_000;action=total-15_000_000_000 if action_known else None
    profile={'schema':'er9.luna.private-memory-profile.v1','label':label,'slice_unit':'er9mem'+'a'*32+'.slice',
        'slice_cgroup':'/user.slice/user-'+str(os.getuid())+'.slice/user@'+str(os.getuid())+'.service/er9mem'+'a'*32+'.slice',
        'aggregate_memory_max_bytes':resource.TOTAL,'component_memory_max_bytes':resource.CAPS,'memory_swap_max_bytes':0,
        'original_birth_monotonic_ns':birth,'original_total_stop_monotonic_ns':total,
        'reader_sha256':hashlib.sha256((ROOT/'resource_slice.py').read_bytes()).hexdigest(),
        'synthetic_only_no_kernel_allocation':True}
    resource_path=folder/'resource.json';resource_path.write_text(json.dumps(profile));resource_path.chmod(0o600)
    decl=folder/'declaration.json';decl.write_text(json.dumps(declaration.declaration(label)))
    bundle_path=None
    if bundle:
        operator=load('_er9_l15_opfixture',release.TOOLS/'operator_binding.py')
        built=operator.binding(stage_id=label,stage_role='final',case_id='SYNTHETIC',arm_id='control',method_factors=['V01'],
            actor_binding={'stage_id':label,'family':'Luna','model':'gpt-6-luna','effort':'max','native_goal_id':None},entries=[],complete_final_role=True)
        (ws/'inputs/delivery_role_manifest.json').write_bytes(built['manifest_bytes'])
        bundle_path=folder/'bundle.json';bundle_path.write_bytes(built['profile_bytes']);bundle_path.chmod(0o600)
    return {'workspace':ws,'private':private,'label':label,'original_birth_monotonic_ns':birth,'max_seconds':seconds,
        'native_stop_monotonic_ns':action,'total_stop_monotonic_ns':total,'resource_profile':resource_path,
        'clock_declaration':decl,'clock_declaration_sha256':hashlib.sha256(decl.read_bytes()).hexdigest(),
        'execution_enabled':execution,'public_get':True,'scientific_body':science,'goal_objective':science,
        'source_prompt_sha256':hashlib.sha256(body.read_bytes()).hexdigest(),
        'source_TASK_sha256':hashlib.sha256((ws/'TASK.md').read_bytes()).hexdigest(),'bundle_profile':bundle_path},body


class ClockPrepareTests(unittest.TestCase):
    def test_actual_production_core_and_B_config_600_900_no_process(self):
        for seconds,bundle,execution in [(600,False,False),(900,False,True),(600,True,False),(900,True,True)]:
            with tempfile.TemporaryDirectory(prefix='er9-l15-config-') as temp:
                args,body=fixture(Path(temp),seconds=seconds,bundle=bundle,execution=execution)
                original=(args['workspace']/'TASK.md').read_bytes();prompt=body.read_bytes()
                with patch('subprocess.Popen',side_effect=AssertionError('process prohibited')),patch('subprocess.run',side_effect=AssertionError('process prohibited')):
                    result=prepare.prepare_stage(**args)
                cfg=result['config'];meta=cfg['initial_clock_metadata']['stage_clock']
                self.assertEqual(len(cfg['tool_allowlist']),5 if execution else 4)
                self.assertEqual(cfg['native_bundle_enabled'],bundle)
                self.assertEqual(cfg['deadline_monotonic_ns'],args['native_stop_monotonic_ns'])
                self.assertEqual(meta['original_candidate_action_deadline_monotonic_ns'],args['native_stop_monotonic_ns'])
                self.assertEqual(meta['original_total_cleanup_stop_monotonic_ns']-meta['original_candidate_action_deadline_monotonic_ns'],15_000_000_000)
                self.assertEqual(meta['original_stage_allocation_seconds'],seconds)
                self.assertLessEqual(meta['remaining_candidate_action_ms'],(seconds-15)*1000)
                self.assertEqual(result['native_input'][0]['text'],args['scientific_body'])
                self.assertEqual(result['native_input'][1]['text'],cfg['initial_clock_metadata_utf8'])
                self.assertEqual((args['workspace']/'inputs/STAGE_CLOCK.json').read_bytes(),result['native_input'][1]['text'].encode())
                self.assertEqual((args['workspace']/'TASK.md').read_bytes(),original);self.assertEqual(body.read_bytes(),prompt)
                self.assertNotIn(args['scientific_body'],cfg['initial_clock_metadata_utf8'])
                self.assertFalse(list((args['workspace']/'out').iterdir()))
                self.assertFalse(result['native_calls_or_processes_started'])
    def test_missing_action_is_UNKNOWN_never_cleanup_fallback(self):
        with tempfile.TemporaryDirectory(prefix='er9-l15-unknown-') as temp:
            args,_=fixture(Path(temp),action_known=False)
            result=prepare.prepare_stage(**args);clock=result['config']['initial_clock_metadata']['stage_clock']
            self.assertEqual(clock['action_deadline_status'],'UNKNOWN')
            self.assertIsNone(clock['remaining_candidate_action_ms'])
            self.assertIsNone(clock['original_candidate_action_deadline_monotonic_ns'])
            self.assertEqual(clock['original_total_cleanup_stop_monotonic_ns'],args['total_stop_monotonic_ns'])
    def test_declaration_stage_sha_exclusive_clock_and_resource_join(self):
        for mistake in ('stage','sha','existing','resource'):
            with tempfile.TemporaryDirectory(prefix='er9-l15-denied-') as temp:
                args,_=fixture(Path(temp))
                if mistake=='stage':args['label']='OTHER'
                elif mistake=='sha':args['clock_declaration_sha256']='0'*64
                elif mistake=='existing':(args['workspace']/'inputs/STAGE_CLOCK.json').write_bytes(b'preserve-existing')
                else:
                    value=json.loads(args['resource_profile'].read_text());value['original_total_stop_monotonic_ns']+=1
                    args['resource_profile'].write_text(json.dumps(value))
                with self.assertRaises((ValueError,FileExistsError)):prepare.prepare_stage(**args)
                if mistake=='existing':self.assertEqual((args['workspace']/'inputs/STAGE_CLOCK.json').read_bytes(),b'preserve-existing')
    def test_V06_both_core_and_no_genericB_override(self):
        with tempfile.TemporaryDirectory(prefix='er9-l15-v06-') as temp:
            args,_=fixture(Path(temp),label='SYNTHETIC-V06')
            result=prepare.prepare_stage(**args);self.assertFalse(result['config']['native_bundle_enabled'])
        with tempfile.TemporaryDirectory(prefix='er9-l15-v06-deny-') as temp:
            args,_=fixture(Path(temp),label='SYNTHETIC-V06',bundle=True)
            value=json.loads(args['bundle_profile'].read_text());value['method_factors']=['V06']
            args['bundle_profile'].write_text(json.dumps(value))
            with self.assertRaises(ValueError):prepare.prepare_stage(**args)
    def test_actual_entry_calls_production_prepare_and_unchanged_goal_lifecycle(self):
        import ast
        tree=ast.parse((HERE/'dynamic_stage_runner.py').read_text())
        calls=[n for n in ast.walk(tree) if isinstance(n,ast.Call)]
        self.assertTrue(any(isinstance(n.func,ast.Name) and n.func.id=='prepare_stage' for n in calls))
        initial=[n for n in calls if isinstance(n.func,ast.Attribute) and n.func.attr=='call' and n.args and isinstance(n.args[0],ast.Constant) and n.args[0].value=='turn/start']
        self.assertEqual(len(initial),1)
        self.assertIsInstance(initial[0].args[1],ast.Name);self.assertEqual(initial[0].args[1].id,'initial_turn_params')
        params=next(n.value for n in ast.walk(tree) if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='initial_turn_params' for t in n.targets))
        field={k.value:v for k,v in zip(params.keys,params.values)}
        self.assertIsInstance(field['input'],ast.Name);self.assertEqual(field['input'].id,'native_input')
        old=HERE.parent/'v1.4-bundle'
        for name in ('completion_policy.py','completion_driver.py','projection.py','resource_host_guard.py','resource_native_driver.py','resource_dynamic_driver.py','resource_client_relay.py','resource_owned_scope_proof.py'):
            self.assertEqual((HERE/name).read_bytes(),(old/name).read_bytes())


if __name__=='__main__':
    suite=unittest.defaultTestLoader.loadTestsFromTestCase(ClockPrepareTests)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    receipt={'schema':'er9.luna.clock-production-preparation-regression.v1','tests':result.testsRun,'passed':result.wasSuccessful(),
        'native_goals':0,'native_threads':0,'native_processes':0,'source_calls':0,'body_fixture':'synthetic only',
        'test_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
    (HERE/'CLOCK_PREPARE_REGRESSION.json').write_text(json.dumps(receipt,indent=2)+'\n')
    raise SystemExit(0 if result.wasSuccessful() else 1)
