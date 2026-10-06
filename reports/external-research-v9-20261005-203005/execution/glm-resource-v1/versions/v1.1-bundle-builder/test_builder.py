"""No candidate/tool/provider calls: actual builder selection and pin composition."""
import json,tempfile,time,unittest
from pathlib import Path
import profile

class BundleBuilderTests(unittest.TestCase):
    def fixture(self,root):
        ws=root/'workspace';ws.mkdir();(ws/'inputs').mkdir();(ws/'out').mkdir();(ws/'TASK.md').write_text('Synthetic mechanical binding only. No Goal.')
        resource_path=root/'resource.json';resource=profile.reader.allocate('synthetic-bundle-builder',time.monotonic_ns(),40,resource_path)
        binding=profile.module('synthetic_selected_bundle_binding',profile.TOOLS/'operator_binding.py')
        built=binding.binding(stage_id='SYNTHETIC-FINAL',stage_role='final',case_id='SYNTHETIC-CASE',arm_id='control',
            method_factors=['V01'],actor_binding={'stage_id':'SYNTHETIC-FINAL','family':'GLM','model':'SYNTHETIC_NO_MODEL','native_goal_id':None},entries=[],complete_final_role=True)
        (ws/'inputs/delivery_role_manifest.json').write_bytes(built['manifest_bytes'])
        bundle_path=root/'bundle.json';bundle_path.write_bytes(built['profile_bytes']);bundle_path.chmod(0o600)
        base=root/'base-tools.json';base.write_text(json.dumps(profile.tool_module().mcp_configs(ws,public_get=True,execution_enabled=False)))
        spec={'job_id':'SYNTHETIC-FINAL','arm':'control','workspace':str(ws),'tools_config':str(base),'glm_resource':{
            'version':'glm_complete2304_bundle_v1','model':'builtin:zai-coding-plan/GLM-5.3-Flash','effort':'max',
            'source_pins':{path:profile.sha(path) for path in profile.required_source_paths()},
            'tools_config_builder':{'path':str(profile.TOOLS/'config.py'),'sha256':profile.sha(profile.TOOLS/'config.py')},
            'capture_dir':str(root/'captures'),'evidence_dir':str(root/'receipts'),'execution_enabled':False,'public_get':True,
            'bundle_profile':{'path':str(bundle_path),'sha256':profile.sha(bundle_path)}}}
        return resource_path,resource,spec

    def test_exact_actual_bundle_builder_preserves_caps_deadline_and_allowlist(self):
        with tempfile.TemporaryDirectory(prefix='er9-glm-builder-') as d:
            root=Path(d);path,resource,spec=self.fixture(root)
            try:
                config=profile.wrapped_tools(spec,path,path,root)
                self.assertTrue(config['native_bundle_enabled'])
                self.assertEqual(config['bundle_profile_sha256'],spec['glm_resource']['bundle_profile']['sha256'])
                self.assertEqual(config['deadline_monotonic_ns'],resource['original_total_stop_monotonic_ns'])
                self.assertEqual(config['resource_profile_sha256'],profile.sha(path))
                self.assertEqual(set(config['tool_allowlist']),set(json.loads(Path(spec['tools_config']).read_text())['tool_allowlist']))
                self.assertEqual([s['name'] for s in config['mcp_servers']],['pm_boundary'])
                args=config['mcp_servers'][0]['args']
                self.assertIn(str(profile.TOOLS/'bundle_carrier.py'),args)
                self.assertIn(str(profile.HERE/'component_guard.py'),args)
                self.assertEqual(args[args.index('--stop-ns')+1],str(resource['original_total_stop_monotonic_ns']-5_000_000_000))
                self.assertEqual(int(profile.reader.kernel(resource['slice_cgroup'])['memory.max']),2415919104)
            finally:self.assertTrue(profile.reader.release(resource)['all_private_slice_descendants_quiet'])

    def test_unselected_builder_profile_drift_foreign_stage_and_tool_change_rejected(self):
        with tempfile.TemporaryDirectory(prefix='er9-glm-builder-negative-') as d:
            root=Path(d);path,resource,spec=self.fixture(root)
            try:
                selected=spec['glm_resource'];original=selected['tools_config_builder']
                selected['tools_config_builder']={'path':str(profile.LAB/'dev/tools/versions/v1.3/config.py'),'sha256':'0'*64}
                with self.assertRaises(ValueError):profile.wrapped_tools(spec,path,path,root)
                selected['tools_config_builder']=original
                original_sha=selected['bundle_profile']['sha256'];selected['bundle_profile']['sha256']='0'*64
                with self.assertRaises(ValueError):profile.wrapped_tools(spec,path,path,root)
                selected['bundle_profile']['sha256']=original_sha
                spec['job_id']='SYNTHETIC-OTHER'
                with self.assertRaises(ValueError):profile.wrapped_tools(spec,path,path,root)
                spec['job_id']='SYNTHETIC-FINAL';selected['execution_enabled']=True
                with self.assertRaises(ValueError):profile.wrapped_tools(spec,path,path,root)
            finally:self.assertTrue(profile.reader.release(resource)['all_private_slice_descendants_quiet'])

if __name__=='__main__':unittest.main(verbosity=2)
