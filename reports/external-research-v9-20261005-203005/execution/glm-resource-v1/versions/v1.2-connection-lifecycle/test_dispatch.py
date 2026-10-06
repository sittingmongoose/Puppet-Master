"""Exact dispatcher-shaped outer launch -> actual production worker preparation.

Synthetic native-unit client only; real confined MCP/source/adapter/sandbox code.
"""
import importlib.util,json,os,subprocess,tempfile,time,unittest,uuid
from pathlib import Path
import profile,external_release

HERE=Path(__file__).resolve().parent;BASE=HERE.parents[1];BUNDLE=HERE.with_name('v1.2-bundle-connection-lifecycle')

class DispatchLifecycleTests(unittest.TestCase):
    def fixture(self,engine,legacy=False):
        with tempfile.TemporaryDirectory(prefix='er9-glm-real-worker-') as d:
            root=Path(d);ws=root/'workspace';ws.mkdir();(ws/'inputs').mkdir();(ws/'out').mkdir();task=ws/'TASK.md';task.write_text('Synthetic mechanical stage only. No model or Goal.\n')
            specmod=importlib.util.spec_from_file_location('selected_fixture_profile',engine/'profile.py');selected=importlib.util.module_from_spec(specmod);specmod.loader.exec_module(selected)
            base_config=selected.tool_module().mcp_configs(ws,capture_dir=root/'captures',evidence_dir=root/'evidence',execution_enabled=True,public_get=True)
            tools=root/'base-tools.json';tools.write_text(json.dumps(base_config));pair=root/'PAIR.json';pair.write_text('{"synthetic_only":true}\n')
            source=ws/'inputs/neutral.txt';source.write_text('Synthetic inputs only.\n')
            resource_selection={'version':'glm_complete2304_bundle_v2' if engine==BUNDLE else 'glm_complete2304_v2',
                'model':'builtin:zai-coding-plan/GLM-5.3-Flash','effort':'max','source_pins':{p:selected.sha(p) for p in selected.required_source_paths()},
                'tools_config_builder':{'path':str(selected.TOOLS/'config.py'),'sha256':selected.sha(selected.TOOLS/'config.py')},
                'capture_dir':str(root/'captures'),'evidence_dir':str(root/'evidence'),'execution_enabled':True,'public_get':True}
            if engine==BUNDLE:
                binding=selected.module('dispatch_fixture_bundle_binding',selected.TOOLS/'operator_binding.py')
                built=binding.binding(stage_id='SYNTHETIC-DISPATCH',stage_role='final',case_id='SYNTHETIC-CASE',arm_id='control',method_factors=['V01'],
                    actor_binding={'stage_id':'SYNTHETIC-DISPATCH','family':'GLM','model':'SYNTHETIC_NO_MODEL'},entries=[],complete_final_role=True)
                manifest=ws/'inputs/delivery_role_manifest.json';manifest.write_bytes(built['manifest_bytes'])
                carrier=root/'BUNDLE.json';carrier.write_bytes(built['profile_bytes']);carrier.chmod(0o600)
                resource_selection['bundle_profile']={'path':str(carrier),'sha256':selected.sha(carrier)}
            spec={'job_id':'SYNTHETIC-DISPATCH','pair_id':'SYNTHETIC-PAIR','arm':'control','stage':'synthetic_only','workspace':str(ws),'prompt_file':str(task),
                'prompt_sha256':selected.sha(task),'out':str(root/'native'),'max_seconds':60,'max_responses':12,'tools_config':str(tools),'tools_config_sha256':selected.sha(tools),
                'required_artifacts':['out/synthetic.txt'],'pair_freeze':{'path':str(pair),'sha256':selected.sha(pair)},'input_pins':{str(p):selected.sha(p) for p in (ws/'inputs').iterdir()},'glm_resource':resource_selection}
            stage=root/'stage.json';stage.write_text(json.dumps(spec));resource_path=root/'RESOURCE_PROFILE.json';birth=time.monotonic_ns()
            resource=selected.reader.allocate('synthetic-exact-dispatch',birth,60,resource_path)
            unit='er9-203005-synthetic-dispatch-'+uuid.uuid4().hex+'.service'
            # Same launch options/ordering as actual dispatcher launch(), with
            # its worker_path pointing at our explicitly synthetic wrapper.
            command=['/usr/bin/systemd-run','--user','--unit',unit,'--slice='+resource['slice_unit'],'--property=MemoryMax=805306368','--property=MemorySwapMax=0',
                '--property=Type=exec','--property=KillMode=control-group','--property=RuntimeMaxSec='+str((resource['original_total_stop_monotonic_ns']-time.monotonic_ns())/1e9),
                '--property=StandardOutput=append:'+str(root/'worker.stdout.jsonl'),'--property=StandardError=append:'+str(root/'worker.stderr.log'),
                '--working-directory='+str(selected.LAB),'/usr/bin/python3','-B',str(HERE/'fixture_worker.py'),'--engine',str(engine),
                '--stage-json',str(stage),'--stage-sha256',selected.sha(stage),'--birth-monotonic-ns',str(birth),
                '--resource-profile',str(resource_path),'--resource-profile-sha256',selected.sha(resource_path)]
            if legacy:command+=['--legacy-bridge',str(BASE/'pipe_bridge.py')]
            try:
                admitted=subprocess.run(command,env=selected.reader.manager_env(),capture_output=True,text=True,timeout=10)
                self.assertEqual(admitted.returncode,0,admitted.stderr)
                until=time.monotonic()+25
                while time.monotonic()<until:
                    facts=selected.reader.show(unit)
                    if facts['ActiveState'] in ('inactive','failed'):break
                    time.sleep(.1)
                self.assertEqual(facts['Result'],'success',(root/'worker.stderr.log').read_text())
                proof=json.loads((root/'FINAL_FIXTURE_PROOF.json').read_text())
                self.assertEqual(proof['actual_stage_freeze_native_goal_starts'],0);self.assertFalse(proof['actual_stage_freeze_operational_complete'])
                self.assertEqual(proof['original_total_stop_monotonic_ns'],birth+60_000_000_000)
                self.assertTrue(proof['component_settlement']['all_components_quiet'])
                release=external_release.release(resource_path,root/'RESOURCE_BINDING.json',selected.sha(root/'RESOURCE_BINDING.json'))
                self.assertTrue(release['all_private_slice_descendants_quiet'])
                proof['external_release']=release
                return proof
            finally:
                facts=selected.reader.show(unit)
                if facts['ActiveState'] in ('active','activating'):selected.reader.invoke(['/usr/bin/systemctl','--user','stop',unit])
                if selected.reader.show(resource['slice_unit'])['ActiveState']=='active':selected.reader.release(resource)

    def test_legacy_disconnect_failure_reproduces_without_goal(self):
        proof=self.fixture(HERE,legacy=True)
        self.assertEqual(proof['preactivation_rejection'],'owned component outside private aggregate')
        if os.environ.get('ER9_OLD_REPRO_PATH'):
            with Path(os.environ['ER9_OLD_REPRO_PATH']).open('x') as out:json.dump(proof,out,indent=2)

    def test_dispatch_worker_both_transports_discovery_reconnect_source_execution_and_release(self):
        proofs=[]
        for engine in (HERE,BUNDLE):
            proof=self.fixture(engine)
            self.assertEqual(proof['placements_after_discovery_disconnect']['aggregate_memory_max_bytes'],2415919104)
            self.assertTrue(proof['placements_after_reconnect']['verified_before_native_goal'])
            self.assertEqual(len(proof['sandbox_kernel_placements']),1)
            self.assertTrue(all(x['accepted_connections']==2 and x['disconnected_connections']==2 for x in proof['bridge_lifecycles']))
            proofs.append(proof)
        if os.environ.get('ER9_DISPATCH_PROOF_PATH'):
            with Path(os.environ['ER9_DISPATCH_PROOF_PATH']).open('x') as out:json.dump({'synthetic_only':True,'model_calls':0,'native_goal_starts':0,'proofs':proofs},out,indent=2)

if __name__=='__main__':unittest.main(verbosity=2)
