"""Generic boundary probes only: no domain/case answers and no provider calls."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time
import unittest
from unittest.mock import patch

HERE=Path(__file__).resolve().parent
def load(name,path):
    s=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
server=load('exec_tests',HERE/'execution_server.py')
config=load('config_tests',HERE/'config.py')

class ExecutionTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(prefix='er9-generic-tool-test-');self.root=Path(self.tmp.name)
        self.evidence=self.root/'receipts';self.evidence.mkdir()
    def tearDown(self): self.tmp.cleanup()
    def run_code(self,code,data=None,**kw): return server.execute({'code':code,'data':data},self.evidence,**kw)
    def test_real_arithmetic_arrays_strings_json_and_source_function(self):
        r=self.run_code('import json\ndef scale(xs): return [x*3 for x in xs]\nprint(json.dumps({"v":scale(data),"s":"abc"[::-1],"sum":sum(data)},sort_keys=True))',[2,-1,4])
        self.assertEqual(r['exit_code'],0,r['stderr'])
        self.assertEqual(json.loads(r['stdout']),{'v':[6,-3,12],'s':'cba','sum':5})
        run=self.evidence/r['execution_id']
        self.assertEqual(r['code_sha256'],hashlib.sha256((run/'code.py').read_bytes()).hexdigest())
        self.assertEqual(r['stdout_sha256'],hashlib.sha256((run/'stdout.bin').read_bytes()).hexdigest())
        self.assertEqual(json.loads((run/'result.json').read_text())['exit_code'],0)
        self.assertEqual(r['execution_label'],'executed by candidate');self.assertTrue(r['bootstrap_started']);self.assertTrue(r['cleanup_confirmed'])
        unit=json.loads((run/'request.json').read_text())['unit']
        status=subprocess.run(['/usr/bin/systemctl','--user','show',unit,'--property=ActiveState','--value'],capture_output=True,text=True)
        self.assertNotIn(status.stdout.strip(),('active','activating','deactivating'))
    def test_private_fs_environment_process_and_network_isolation(self):
        secret=self.root/'SYNTHETIC-OUTSIDE.txt';secret.write_text('GENERIC-ONLY-CANARY')
        code='''import os, json, socket
paths = data
visible = {p:os.path.exists(p) for p in paths}
sock=socket.socket();sock.settimeout(.1)
try: sock.connect(('127.0.0.1',22)); net='connected'
except OSError: net='blocked'
try: sock.connect(('1.1.1.1',443)); public='connected'
except OSError: public='blocked'
print(json.dumps({'visible':visible,'env':dict(os.environ),'net':net,'public':public,'proc':[p for p in os.listdir('/proc') if p.isdigit()]}))
'''
        paths=[str(secret),'/home','/run/user/'+str(os.getuid()),'/etc/passwd','/work/out','/work/inputs','/work/.zcode','/work/operation_receipts']
        with patch.dict(os.environ,{'ER9_SYNTHETIC_CREDENTIAL':'DO-NOT-INHERIT','HTTPS_PROXY':'https://127.0.0.1:99'}): r=self.run_code(code,paths)
        self.assertEqual(r['exit_code'],0,r['stderr'])
        v=json.loads(r['stdout']);self.assertFalse(any(v['visible'].values()))
        self.assertNotIn('ER9_SYNTHETIC_CREDENTIAL',v['env']);self.assertNotIn('HTTPS_PROXY',v['env'])
        self.assertEqual(v['net'],'blocked');self.assertEqual(v['public'],'blocked')
        self.assertLessEqual(len(v['proc']),2)
        self.assertEqual(secret.read_text(),'GENERIC-ONLY-CANARY')
    def test_filesystem_readonly_and_temporary_writes_are_ephemeral(self):
        r=self.run_code('''import json
errors=[]
for p in ('/work/code.py','/usr/er9-write-probe','/work/data.json'):
 try: open(p,'w').write('bad')
 except OSError: errors.append(p)
open('/tmp/local.txt','w').write('ephemeral')
print(json.dumps(errors))
''')
        self.assertEqual(r['exit_code'],0,r['stderr']);self.assertEqual(len(json.loads(r['stdout'])),3)
        next_run=self.run_code("import os; print(os.path.exists('/tmp/local.txt'))")
        self.assertEqual(next_run['stdout'],'False\n')
    def test_nonzero_exception_and_evaluator_label(self):
        r=self.run_code('raise SystemExit(37)');self.assertEqual(r['exit_code'],37)
        r=self.run_code('raise ValueError("generic exception")',actor='evaluator')
        self.assertNotEqual(r['exit_code'],0);self.assertIn('generic exception',r['stderr'])
        self.assertEqual(r['execution_label'],'executed only by evaluator')
    def test_memory_cpu_process_output_and_sleep_caps(self):
        memory=self.run_code('x=bytearray(400*1024*1024)')
        self.assertNotEqual(memory['exit_code'],0);self.assertIn('MemoryError',memory['stderr'])
        cpu=self.run_code('while True: pass');self.assertNotEqual(cpu['exit_code'],0);self.assertLess(cpu['elapsed_seconds'],8)
        output=self.run_code("print('x'*1000000)")
        self.assertEqual(output['stopped_by_adapter'],'output_cap');self.assertLessEqual(output['stdout_bytes'],32768)
        sleep=self.run_code('import time; time.sleep(30)');self.assertNotEqual(sleep['exit_code'],0);self.assertLess(sleep['elapsed_seconds'],8)
        self.assertTrue(sleep['cleanup_confirmed'])
        fork=self.run_code('''import os,time
n=0
try:
 while n<40:
  pid=os.fork()
  if not pid: time.sleep(30);os._exit(0)
  n+=1
except OSError: print('tasks capped',n,flush=True)
''')
        self.assertIn('tasks capped',fork['stdout']);self.assertEqual(fork['exit_code'],0);self.assertLess(fork['elapsed_seconds'],8)
        self.assertTrue(fork['cleanup_confirmed'])
        # Python is namespace PID1: a clean parent exit kills its sleeping children.
        unit=json.loads((self.evidence/fork['execution_id']/'request.json').read_text())['unit']
        status=subprocess.run(['/usr/bin/systemctl','--user','show',unit,'--property=ActiveState','--value'],capture_output=True,text=True)
        self.assertNotIn(status.stdout.strip(),('active','activating','deactivating'))
    def test_argument_paths_and_oversize_rejected_and_stage_deadline(self):
        for a in ({'code':'print(1)','path':'/etc/passwd'},{'code':4},{'code':'x'*65537},{'code':'print(1)','data':float('nan')}):
            with self.assertRaises((ValueError,TypeError)): server.execute(a,self.evidence)
        with self.assertRaises(ValueError): self.run_code('print(1)',deadline_ns=time.monotonic_ns()-1)
        r=self.run_code('import time; time.sleep(30)',deadline_ns=time.monotonic_ns()+700000000)
        self.assertNotEqual(r['exit_code'],0);self.assertLess(r['elapsed_seconds'],4)
    def test_config_exact_namespaces_and_execution_difference(self):
        case=self.root/'case';case.mkdir()
        for d in ('inputs','out'): (case/d).mkdir()
        (case/'TASK.md').write_text('Generic fixture only.')
        base=config.mcp_configs(case,execution_enabled=False,public_get=True)
        treatment=config.mcp_configs(case,execution_enabled=True,public_get=True,deadline_monotonic_ns=time.monotonic_ns()+10000000000)
        self.assertEqual(set(treatment['tool_allowlist'])-set(base['tool_allowlist']),{'mcp__pm_execution__python_execute'})
        self.assertTrue(treatment['external_stage_supervisor_required'])
        cmd=treatment['mcp_servers'][0]['args']
        self.assertNotIn(str(case),cmd);self.assertNotIn(str(case/'.zcode'),cmd)
        self.assertIn(str(case/'inputs'),cmd);self.assertIn(str(case/'out'),cmd)
        self.assertEqual(treatment['mcp_servers'][1]['command'],'/usr/bin/python3')
        for private in (case/'out'/'receipts',case/'inputs',case):
            with self.assertRaises(ValueError): config.mcp_configs(case,evidence_dir=private)

if __name__=='__main__': unittest.main(verbosity=2)
