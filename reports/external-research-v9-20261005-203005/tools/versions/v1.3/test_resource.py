"""No native/model work: trusted profile boundaries and actual sandbox placement."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import tempfile
import time
import unittest
from unittest.mock import patch

HERE=Path(__file__).resolve().parent
def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
reader=load('resource_test_reader',HERE/'resource_profile.py')
server=load('resource_test_server',HERE/'execution_server.py')
config=load('resource_test_config',HERE/'config.py')

class ResourceTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(prefix='er9-tools-resource-');self.root=Path(self.tmp.name)
        self.case=self.root/'case';self.case.mkdir()
        for name in ('inputs','out'):(self.case/name).mkdir()
        (self.case/'TASK.md').write_text('Synthetic resource tests only.\n')
    def tearDown(self):self.tmp.cleanup()
    def profile_value(self):
        name='er9mem'+'a'*32+'.slice'
        return {'schema':'er9.luna.private-memory-profile.v1','slice_unit':name,
                'slice_cgroup':'/user.slice/user-'+str(os.getuid())+'.slice/user@'+str(os.getuid())+'.service/'+name,
                'aggregate_memory_max_bytes':reader.TOTAL,'memory_swap_max_bytes':0,'component_memory_max_bytes':reader.CAPS,
                'reader_sha256':hashlib.sha256((HERE/'resource_profile.py').read_bytes()).hexdigest(),
                'original_birth_monotonic_ns':time.monotonic_ns()-1000000,'original_total_stop_monotonic_ns':time.monotonic_ns()+10000000000}
    def profile_file(self,value,path=None):
        path=path or self.root/'profile.json';path.write_text(json.dumps(value));path.chmod(0o600);return path
    def test_exact_private_slice_names_and_caps_only(self):
        base=self.profile_value()
        for name in ('app.slice','er9mem'+('a'*31)+'.slice','er9mem'+('A'*32)+'.slice','../er9mem'+('a'*32)+'.slice','er9mem'+('a'*32)+'.slice --system'):
            v={**base,'slice_unit':name};p=self.profile_file(v)
            with self.assertRaises(ValueError):reader.load(p)
        for key,value in [('aggregate_memory_max_bytes',reader.TOTAL+1),('memory_swap_max_bytes',1),('component_memory_max_bytes',{**reader.CAPS,'sandbox':reader.CAPS['sandbox']+1}),('reader_sha256','0'*64),('slice_cgroup','/app.slice')]:
            p=self.profile_file({**base,key:value})
            with self.assertRaises(ValueError):reader.load(p)
    def test_private_profile_mode_symlink_and_namespace_denied(self):
        p=self.profile_file(self.profile_value());p.chmod(0o644)
        with self.assertRaises(ValueError):reader.load(p)
        p.chmod(0o600);link=self.root/'link';link.symlink_to(p)
        with self.assertRaises(ValueError):reader.load(link)
        for path in (self.case/'inputs'/'profile.json',self.case/'out'/'profile.json',self.case/'TASK.md',self.case/'public_captures'/'profile.json'):
            path.parent.mkdir(exist_ok=True);self.profile_file(self.profile_value(),path)
            with self.assertRaises(ValueError):config.mcp_configs(self.case,execution_enabled=True,resource_profile_path=path)
    def test_operator_profile_config_not_candidate_argument(self):
        p=self.profile_file(self.profile_value());built=config.mcp_configs(self.case,execution_enabled=True,public_get=True,resource_profile_path=p)
        self.assertEqual(len(built['tool_allowlist']),5)
        self.assertEqual(built['sandbox_private_slice'],self.profile_value()['slice_unit'])
        execution=built['mcp_servers'][1];self.assertIn('--resource-profile',execution['args']);self.assertIn(str(p),execution['args'])
        self.assertNotIn(str(p),built['mcp_servers'][0]['args'])
        for key in ('resource_profile_path','resource_profile','owned_slice','slice'):
            with self.assertRaises(ValueError):server.execute({'code':'print(1)',key:str(p)},self.root/'denied')
    def test_real_sandbox_parent_and_child_verified_before_bootstrap(self):
        path=self.root/'actual-profile.json';profile=reader.allocate('generic-tools-v13-local-placement',time.monotonic_ns(),30,path)
        try:
            result=server.execute({'code':'import os,json; print(json.dumps({"sum":sum(data),"profile_visible":os.path.exists("'+str(path)+'")}))','data':[2,3]},self.root/'evidence',resource_profile_path=path)
            self.assertEqual(result['exit_code'],0,result['stderr']);self.assertTrue(result['bootstrap_started']);self.assertTrue(result['cleanup_confirmed'])
            self.assertEqual(json.loads(result['stdout']),{'sum':5,'profile_visible':False})
            facts=result['resource_placement'];self.assertTrue(facts['verified_before_candidate_bootstrap']);self.assertTrue(facts['actual_component_under_private_aggregate']);self.assertTrue(facts['actual_limits_match'])
            self.assertEqual(facts['component_kernel_limits']['memory.max'],str(256*1048576));self.assertEqual(facts['component_kernel_limits']['memory.swap.max'],'0')
            self.assertEqual(facts['aggregate_kernel_limits']['memory.max'],str(2304*1048576));self.assertEqual(facts['aggregate_kernel_limits']['memory.swap.max'],'0')
            self.assertEqual(facts['own_process_cgroup'],'0::'+profile['slice_cgroup']+'/'+facts['unit'])
            request=json.loads((self.root/'evidence'/result['execution_id']/'request.json').read_text())
            self.assertIn('--slice='+profile['slice_unit'],request['command'])
            self.assertTrue(result['resource_aggregate_after_execution'])
            record={'schema':'er9.tools.resource-local-placement.v1','native_model_calls':0,'candidate_jobs':0,'scope':'generic standalone sandbox placement; full route/controller fit not claimed','placement':facts,'request':request,'result':result}
        finally:released=reader.release(profile)
        self.assertTrue(released['all_private_slice_descendants_quiet'])
        record['private_slice_release']=released
        (HERE/'LOCAL_RESOURCE_PLACEMENT.json').write_text(json.dumps(record,indent=2)+'\n')
    def test_mismatched_live_parent_cap_blocks_candidate_bootstrap(self):
        path=self.root/'actual-profile.json';profile=reader.allocate('generic-tools-v13-negative-cap',time.monotonic_ns(),20,path)
        try:
            changed=reader.invoke(['/usr/bin/systemctl','--user','set-property',profile['slice_unit'],'MemoryMax=2303M']);self.assertEqual(changed.returncode,0)
            result=server.execute({'code':'print("SHOULD_NOT_EXECUTE")'},self.root/'negative',resource_profile_path=path)
            self.assertFalse(result['bootstrap_started']);self.assertIsNone(result['resource_placement']);self.assertNotEqual(result['exit_code'],0)
            self.assertNotIn('SHOULD_NOT_EXECUTE',result['stdout']);self.assertTrue(result['cleanup_confirmed'])
        finally:released=reader.release(profile)
        self.assertTrue(released['all_private_slice_descendants_quiet'])

if __name__=='__main__':unittest.main(verbosity=2)
