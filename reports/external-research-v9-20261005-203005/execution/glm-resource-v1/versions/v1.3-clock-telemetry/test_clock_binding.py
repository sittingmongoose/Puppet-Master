"""Pure receipt and actual production-dispatch fixtures; native/model calls=0."""
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time
import unittest
import uuid
import clock_binding
import external_release
import profile
import task_fragment

HERE=Path(__file__).resolve().parent
BUNDLE=HERE.with_name('v1.3-bundle-clock-telemetry')

class ClockBindingTests(unittest.TestCase):
    def receipt(self,root,action=True):
        birth=time.monotonic_ns()-1_000_000_000
        spec={'job_id':'SYNTHETIC-DISPATCH','pair_id':'SYNTHETIC-PAIR','arm':'control','max_seconds':60}
        resource={'original_birth_monotonic_ns':birth,'original_total_stop_monotonic_ns':birth+60_000_000_000}
        value={**spec,**resource,'original_stage_allocation_seconds':60,
            'controller_source':{'path':str(HERE/'stage_worker.py'),'sha256':profile.sha(HERE/'stage_worker.py')}}
        if action:value['native_stop_monotonic_ns']=birth+30_000_000_000
        path=root/'RESOURCE_BINDING.json';path.write_text(json.dumps(value))
        return spec,resource,path

    def test_missing_explicit_action_is_unknown_never_cleanup_guess(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);spec,resource,receipt=self.receipt(root,action=False)
            path=clock_binding.create_descriptor(spec,receipt,resource,root/'CLOCK.json')
            clock=profile.module('pure_clock_reader',profile.TOOLS/'clock_telemetry.py')
            value=clock_binding.validate_join(spec,resource,path,clock)
            snapshot=clock.snapshot(value)
            self.assertIsNone(value['original_candidate_action_deadline_monotonic_ns'])
            self.assertIsNone(value['action_deadline_proof'])
            self.assertEqual(snapshot['stage_clock']['action_deadline_status'],'UNKNOWN')
            self.assertIsNone(snapshot['stage_clock']['remaining_candidate_action_ms'])
            saved=json.loads(receipt.read_text())
            saved['native_stop_monotonic_ns']=resource['original_birth_monotonic_ns']+30_000_000_000
            del saved['controller_source'];receipt.write_text(json.dumps(saved))
            missing_source=clock_binding.create_descriptor(spec,receipt,resource,root/'NO_SOURCE_CLOCK.json')
            value=clock_binding.validate_join(spec,resource,missing_source,clock)
            self.assertEqual(clock.snapshot(value)['stage_clock']['action_deadline_status'],'UNKNOWN')

    def test_stage_arm_proof_join_drift_and_expired_clock_without_extension(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);spec,resource,receipt=self.receipt(root)
            path=clock_binding.create_descriptor(spec,receipt,resource,root/'CLOCK.json')
            clock=profile.module('pure_clock_reader',profile.TOOLS/'clock_telemetry.py')
            value=clock_binding.validate_join(spec,resource,path,clock)
            expired=clock.snapshot(value,now_ns=value['original_candidate_action_deadline_monotonic_ns']+1)
            self.assertEqual(expired['stage_clock']['remaining_candidate_action_ms'],0)
            self.assertEqual(expired['stage_clock']['original_total_cleanup_stop_monotonic_ns'],resource['original_total_stop_monotonic_ns'])
            with self.assertRaises(ValueError):clock_binding.validate_join({**spec,'arm':'treatment'},resource,path,clock)
            with self.assertRaises(ValueError):clock_binding.validate_join({**spec,'job_id':'OTHER-STAGE'},resource,path,clock)
            with self.assertRaises(ValueError):clock_binding.validate_join(spec,{**resource,'original_total_stop_monotonic_ns':resource['original_total_stop_monotonic_ns']+1},path,clock)
            saved=json.loads(receipt.read_text());saved['native_stop_monotonic_ns']+=1;receipt.write_text(json.dumps(saved))
            with self.assertRaises(ValueError):clock_binding.validate_join(spec,resource,path,clock)

    def test_declared_fragment_numeric_budget_and_no_task_mutation(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);ws=root/'workspace';ws.mkdir();fragment=root/'fragment.txt';raw=task_fragment.render(60);fragment.write_bytes(raw)
            task=ws/'TASK.md';task.write_bytes(b'Synthetic inherited prefix unchanged.'+raw)
            original=task.read_bytes();spec={'workspace':str(ws),'prompt_file':str(task),'max_seconds':60,
                'glm_resource':{'clock_fragment':{'path':str(fragment),'sha256':profile.sha(fragment)}}}
            task_fragment.validate_packet(spec)
            self.assertEqual(task.read_bytes(),original)
            with self.assertRaises(ValueError):task_fragment.validate_packet({**spec,'max_seconds':61})
            task.write_bytes(original+b'undeclared append')
            with self.assertRaises(ValueError):task_fragment.validate_packet(spec)

    def actual_fixture(self,engine):
        with tempfile.TemporaryDirectory(prefix='er9-glm-clock-production-') as d:
            root=Path(d);ws=root/'workspace';ws.mkdir();(ws/'inputs').mkdir();(ws/'out').mkdir()
            selected=profile.module('selected_clock_fixture_profile',engine/'profile.py')
            fragment=root/'clock_fragment.txt';fragment.write_bytes(task_fragment.render(60))
            task=ws/'TASK.md';task.write_bytes(b'Synthetic mechanical stage only. No model or Goal.\n'+fragment.read_bytes())
            task_sha=selected.sha(task)
            base_config=selected.tool_module().mcp_configs(ws,capture_dir=root/'captures',evidence_dir=root/'evidence',execution_enabled=True,public_get=True)
            tools=root/'base-tools.json';tools.write_text(json.dumps(base_config));pair=root/'PAIR.json';pair.write_text('{"synthetic_only":true}\n')
            source=ws/'inputs/neutral.txt';source.write_text('Synthetic inputs only.\n')
            selection={'version':'glm_complete2304_bundle_clock_v3' if engine==BUNDLE else 'glm_complete2304_clock_v3',
                'model':'builtin:zai-coding-plan/GLM-5.3-Flash','effort':'max',
                'source_pins':{p:selected.sha(p) for p in selected.required_source_paths()},
                'tools_config_builder':{'path':str(selected.TOOLS/'config.py'),'sha256':selected.sha(selected.TOOLS/'config.py')},
                'capture_dir':str(root/'captures'),'evidence_dir':str(root/'evidence'),'execution_enabled':True,'public_get':True,
                'clock_fragment':{'path':str(fragment),'sha256':selected.sha(fragment)}}
            if engine==BUNDLE:
                binding=selected.module('synthetic_clock_bundle_binding',selected.TOOLS/'operator_binding.py')
                built=binding.binding(stage_id='SYNTHETIC-DISPATCH',stage_role='final',case_id='SYNTHETIC-CASE',arm_id='control',method_factors=['V01'],
                    actor_binding={'stage_id':'SYNTHETIC-DISPATCH','family':'GLM','model':'SYNTHETIC_NO_MODEL'},entries=[],complete_final_role=True)
                (ws/'inputs/delivery_role_manifest.json').write_bytes(built['manifest_bytes'])
                carrier=root/'BUNDLE.json';carrier.write_bytes(built['profile_bytes']);carrier.chmod(0o600)
                selection['bundle_profile']={'path':str(carrier),'sha256':selected.sha(carrier)}
            spec={'job_id':'SYNTHETIC-DISPATCH','pair_id':'SYNTHETIC-PAIR','arm':'control','stage':'synthetic_only','workspace':str(ws),'prompt_file':str(task),
                'prompt_sha256':task_sha,'out':str(root/'native'),'max_seconds':60,'max_responses':12,
                'tools_config':str(tools),'tools_config_sha256':selected.sha(tools),'required_artifacts':['out/synthetic.txt'],
                'pair_freeze':{'path':str(pair),'sha256':selected.sha(pair)},
                'input_pins':{str(p):selected.sha(p) for p in (ws/'inputs').iterdir()},'glm_resource':selection}
            stage=root/'stage.json';stage.write_text(json.dumps(spec));resource_path=root/'RESOURCE_PROFILE.json';birth=time.monotonic_ns()
            resource=selected.reader.allocate('synthetic-clock-production',birth,60,resource_path)
            unit='er9-203005-synthetic-clock-'+uuid.uuid4().hex+'.service'
            command=['/usr/bin/systemd-run','--user','--unit',unit,'--slice='+resource['slice_unit'],
                '--property=MemoryMax=805306368','--property=MemorySwapMax=0','--property=Type=exec','--property=KillMode=control-group',
                '--property=RuntimeMaxSec='+str((resource['original_total_stop_monotonic_ns']-time.monotonic_ns())/1e9),
                '--property=StandardOutput=append:'+str(root/'worker.stdout.jsonl'),'--property=StandardError=append:'+str(root/'worker.stderr.log'),
                '--working-directory='+str(selected.LAB),'/usr/bin/python3','-B',str(HERE/'fixture_worker.py'),'--engine',str(engine),
                '--stage-json',str(stage),'--stage-sha256',selected.sha(stage),'--birth-monotonic-ns',str(birth),
                '--resource-profile',str(resource_path),'--resource-profile-sha256',selected.sha(resource_path)]
            try:
                admitted=subprocess.run(command,env=selected.reader.manager_env(),capture_output=True,text=True,timeout=10)
                self.assertEqual(admitted.returncode,0,admitted.stderr)
                until=time.monotonic()+25
                while time.monotonic()<until:
                    facts=selected.reader.show(unit)
                    if facts['ActiveState'] in ('inactive','failed'):break
                    time.sleep(.1)
                self.assertEqual(facts['Result'],'success',(root/'worker.stderr.log').read_text())
                self.assertEqual(selected.sha(task),task_sha)
                proof=json.loads((root/'FINAL_FIXTURE_PROOF.json').read_text())
                binding=json.loads((root/'RESOURCE_BINDING.json').read_text())
                self.assertEqual(binding['original_birth_monotonic_ns'],birth)
                self.assertEqual(binding['native_stop_monotonic_ns'],birth+30_000_000_000)
                self.assertEqual(proof['actual_tool_lifecycle_deadline'],birth+60_000_000_000)
                self.assertEqual(proof['actual_initial_clock_metadata']['stage_clock']['original_candidate_action_deadline_monotonic_ns'],binding['native_stop_monotonic_ns'])
                observations=proof['reconnect']['clock_observations']
                self.assertEqual(len(observations),5)
                self.assertEqual(sum(x['isError'] for x in observations),1)
                self.assertTrue(all(x['stage_clock']['original_candidate_action_deadline_monotonic_ns']==binding['native_stop_monotonic_ns'] for x in observations))
                self.assertTrue(proof['placements_after_reconnect']['verified_before_native_goal'])
                self.assertEqual(proof['actual_stage_freeze_native_goal_starts'],0)
                release=external_release.release(resource_path,root/'RESOURCE_BINDING.json',selected.sha(root/'RESOURCE_BINDING.json'))
                self.assertTrue(release['all_private_slice_descendants_quiet'])
                proof['external_release']=release
                proof['declared_task_unchanged_before_native']=True
                return proof
            finally:
                facts=selected.reader.show(unit)
                if facts['ActiveState'] in ('active','activating'):selected.reader.invoke(['/usr/bin/systemctl','--user','stop',unit])
                if selected.reader.show(resource['slice_unit'])['ActiveState']=='active':selected.reader.release(resource)

    def test_actual_dispatch_worker_core_bundle_initial_and_live_error_clock(self):
        proofs=[self.actual_fixture(engine) for engine in (HERE,BUNDLE)]
        if os.environ.get('ER9_CLOCK_PROOF_PATH'):
            with Path(os.environ['ER9_CLOCK_PROOF_PATH']).open('x') as out:
                json.dump({'synthetic_only':True,'model_calls':0,'native_goal_starts':0,'proofs':proofs},out,indent=2)

if __name__=='__main__':unittest.main(verbosity=2)
