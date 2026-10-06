"""Actual kernel/service tests use synthetic processes only; no native/model."""
import json,os,subprocess,sys,tempfile,time,unittest,uuid
from pathlib import Path
import profile,external_release

HERE=Path(__file__).resolve().parent

class GLMResourceTests(unittest.TestCase):
    def test_resource_wrapping_preserves_exact_tool_factor(self):
        with tempfile.TemporaryDirectory(prefix='er9-glm-factor-') as d:
            root=Path(d);ws=root/'workspace';ws.mkdir();(ws/'inputs').mkdir();(ws/'out').mkdir();(ws/'TASK.md').write_text('Synthetic neutral boundary metadata only.')
            path=root/'profile.json';resource=profile.reader.allocate('synthetic-tool-factor',time.monotonic_ns(),40,path)
            try:
                config=profile.tool_module().mcp_configs(ws,capture_dir=root/'captures',evidence_dir=root/'receipts',execution_enabled=False,public_get=True)
                base=root/'tools.json';base.write_text(json.dumps(config))
                spec={'workspace':str(ws),'tools_config':str(base),'glm_resource':{
                    'version':'glm_complete2304_v1','model':'builtin:zai-coding-plan/GLM-5.3-Flash','effort':'max',
                    'source_pins':{p:profile.sha(p) for p in profile.required_source_paths()},
                    'tools_config_builder':{'path':str(profile.TOOLS/'config.py'),'sha256':profile.sha(profile.TOOLS/'config.py')},
                    'capture_dir':str(root/'captures'),'evidence_dir':str(root/'receipts'),'execution_enabled':False,'public_get':True}}
                wrapped=profile.wrapped_tools(spec,path,path,root)
                self.assertEqual(set(wrapped['tool_allowlist']),set(config['tool_allowlist']))
                self.assertEqual([s['name'] for s in wrapped['mcp_servers']],['pm_boundary'])
                spec['glm_resource']['execution_enabled']=True
                with self.assertRaises(ValueError):profile.wrapped_tools(spec,path,path,root)
                spec['glm_resource']['execution_enabled']=False
                spec['glm_resource']['source_pins'].pop(str(HERE/'pipe_proxy.py'))
                with self.assertRaises(ValueError):profile.wrapped_tools(spec,path,path,root)
            finally:self.assertTrue(profile.reader.release(resource)['all_private_slice_descendants_quiet'])

    def test_actual_complete_placement_overlap_oom_and_external_release(self):
        with tempfile.TemporaryDirectory(prefix='er9-glm-resource-') as d:
            root=Path(d);path=root/'profile.json';birth=time.monotonic_ns()
            resource=profile.reader.allocate('synthetic-glm-all-components',birth,45,path)
            unit='er9-glm-fixture-'+uuid.uuid4().hex+'.service';output=root/'mock'
            try:
                command=['/usr/bin/systemd-run','--user','--wait','--pipe','--quiet','--unit='+unit,'--slice='+resource['slice_unit'],
                    '--property=Type=exec','--property=KillMode=control-group','--property=MemoryMax=805306368','--property=MemorySwapMax=0',
                    '--property=RuntimeMaxSec='+str(max(.1,(resource['original_total_stop_monotonic_ns']-time.monotonic_ns())/1e9)),
                    '/usr/bin/python3','-B',str(HERE/'mock_worker.py'),'--profile',str(path),'--out',str(output)]
                held=subprocess.run(command,env=profile.reader.manager_env(),capture_output=True,text=True,timeout=40)
                self.assertEqual(held.returncode,0,held.stderr)
                result=json.loads((output/'RESULT.json').read_text())
                self.assertEqual(result['model_calls'],0);self.assertEqual(result['native_goal_starts'],0)
                self.assertTrue(result['active_outer_release_rejected'])
                self.assertEqual(result['gate_caps'],{'native':str(768*1048576),'pm_boundary':str(256*1048576),'pm_execution':str(256*1048576)})
                self.assertTrue(result['component_settlement']['all_components_quiet'])
                self.assertEqual(len(result['simultaneous_sandbox_kernel_observations']),2)
                self.assertTrue(all(v['resource_placement']['aggregate_kernel_limits']['memory.max']==str(2304*1048576) for v in result['sandbox_overlap']))
                self.assertTrue(any(int(result['aggregate_events_after_oom'].get(k,0))>0 for k in ['oom','oom_kill']))
                release=external_release.release(path,output/'RESOURCE_BINDING.json',profile.sha(output/'RESOURCE_BINDING.json'))
                self.assertTrue(release['all_private_slice_descendants_quiet'])
                if os.environ.get('ER9_RESOURCE_PROOF_PATH'):
                    with Path(os.environ['ER9_RESOURCE_PROOF_PATH']).open('x') as evidence:
                        evidence.write(json.dumps({'synthetic_only':True,'model_calls':0,'native_goal_starts':0,
                            'original_birth_monotonic_ns':birth,'profile':resource,'result':result,'external_release':release},indent=2)+'\n')
            finally:
                facts=profile.reader.show(resource['slice_unit'])
                if facts.get('ActiveState')=='active':profile.reader.release(resource)

    def test_wrong_actual_placement_and_original_clock_rejected(self):
        with tempfile.TemporaryDirectory(prefix='er9-glm-negative-') as d:
            path=Path(d)/'profile.json';birth=time.monotonic_ns();resource=profile.reader.allocate('negative-placement',birth,40,path)
            try:
                with self.assertRaises(ValueError):profile.reader.own_placement(resource)
                with self.assertRaises(ValueError):profile.original_clock(resource,birth+1,40)
                with self.assertRaises(ValueError):profile.original_clock(resource,birth,41)
                stop,native,guard=profile.original_clock(resource,birth,40)
                self.assertEqual(stop,birth+40_000_000_000);self.assertEqual(native,stop-30_000_000_000);self.assertEqual(guard,stop-5_000_000_000)
                command=['/usr/bin/python3','-I','-B',str(HERE/'component_guard.py'),'--resource-profile',str(path),
                         '--component','native','--stop-ns',str(stop),'--record',str(Path(d)/'record.json'),'--cwd',d,'--','/bin/true']
                result=subprocess.run(command,capture_output=True,text=True,timeout=4)
                self.assertNotEqual(result.returncode,0);self.assertFalse((Path(d)/'record.json').exists())
                wrong='er9-glm-wrong-cap-'+uuid.uuid4().hex+'.service'
                launched=profile.reader.invoke(['/usr/bin/systemd-run','--user','--quiet','--unit='+wrong,
                    '--slice='+resource['slice_unit'],'--property=MemoryMax=804257792','--property=MemorySwapMax=0',
                    '/bin/sleep','5'])
                self.assertEqual(launched.returncode,0,launched.stderr)
                try:
                    with self.assertRaises(ValueError):profile.reader.verify(resource,wrong,'native')
                finally:profile.reader.invoke(['/usr/bin/systemctl','--user','stop',wrong])
            finally:self.assertTrue(profile.reader.release(resource)['all_private_slice_descendants_quiet'])

if __name__=='__main__':unittest.main(verbosity=2)
