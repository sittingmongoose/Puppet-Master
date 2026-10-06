"""Synthetic local hard-cap/lifetime regressions; never launch Codex or a Goal."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import unittest
import uuid

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
sys.path.insert(0,str(ROOT))
import resource_slice as resource

OBSERVATIONS=[]


def launch(profile,component,seconds=10,cap=None,private=True):
    unit='er9-luna-'+uuid.uuid4().hex+'.service'
    cmd=['/usr/bin/systemd-run','--user','--quiet','--unit='+unit,
        '--property=Type=exec','--property=MemoryMax='+str(cap or resource.CAPS[component]),
        '--property=MemorySwapMax=0','--property=RuntimeMaxSec='+str(seconds),
        '--property=KillMode=control-group','--property=TimeoutStopSec=1s',
        '--property=KillSignal=SIGKILL']
    if private:cmd+=['--slice='+profile['slice_unit']]
    p=resource.invoke([*cmd,'/usr/bin/python3','-I','-B','-c','import time;time.sleep(30)'])
    if p.returncode:raise RuntimeError('synthetic unit start failed')
    return unit


class ResourceTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(prefix='er9-resource-test-')
        self.folder=Path(self.temp.name)
        self.birth=time.monotonic_ns()
        self.profile_path=self.folder/'profile.json'
        self.profile=resource.allocate('synthetic-zero-inference',self.birth,30,self.profile_path)
        self.other_units=[]
    def tearDown(self):
        for unit in self.other_units:resource.invoke(['/usr/bin/systemctl','--user','stop',unit])
        proof=resource.release(self.profile)
        OBSERVATIONS.append({'test':self.id(),'release':proof})
        self.assertTrue(proof['all_private_slice_descendants_quiet'])
        self.temp.cleanup()
    def test_actual_complete_envelope_and_overlap(self):
        self.assertEqual(resource.load(self.profile_path)['aggregate_memory_max_bytes'],2415919104)
        units=[(name,launch(self.profile,name)) for name in resource.CAPS]
        # Any concurrent sandbox overlap remains under the same aggregate cap.
        units.append(('sandbox',launch(self.profile,'sandbox')))
        proofs=[resource.verify(self.profile,unit,name) for name,unit in units]
        self.assertTrue(all(p['actual_limits_match'] for p in proofs))
        self.assertEqual(sum(resource.CAPS.values()),resource.TOTAL)
        OBSERVATIONS.append({'test':self.id(),'actual_component_proofs':proofs,'model_starts':0})
    def test_wrong_cap_and_outside_placement_fail_closed(self):
        wrong=launch(self.profile,'native',cap=128*resource.MIB)
        with self.assertRaises(ValueError):resource.verify(self.profile,wrong,'native')
        outside=launch(self.profile,'native',private=False);self.other_units.append(outside)
        with self.assertRaises(ValueError):resource.verify(self.profile,outside,'native')
        with self.assertRaises(ValueError):resource.own_placement(self.profile)
    def test_required_cli_and_helper_placement_fail_closed(self):
        p=subprocess.run(['/usr/bin/python3','-B',str(HERE/'dynamic_stage_runner.py')],capture_output=True,text=True)
        self.assertEqual(p.returncode,2)
        self.assertIn('--resource-profile',p.stderr)
        with self.assertRaises(ValueError):resource.verify_pid_placement(os.getpid(),self.profile['slice_cgroup']+'/outside.service')

    def test_profile_pin_permissions_and_clock(self):
        p=json.loads(self.profile_path.read_text());p['aggregate_memory_max_bytes']-=1
        self.profile_path.write_text(json.dumps(p))
        with self.assertRaises(ValueError):resource.load(self.profile_path)
        self.profile_path.write_text(json.dumps(self.profile));self.profile_path.chmod(0o644)
        with self.assertRaises(ValueError):resource.load(self.profile_path)
        with self.assertRaises(ValueError):resource.allocate('future',time.monotonic_ns()+10**12,30,self.folder/'future.json')
        with self.assertRaises(TimeoutError):resource.allocate('expired',time.monotonic_ns()-10**12,30,self.folder/'expired.json')
    def test_guard_deadline_and_controller_loss(self):
        for mode in ('deadline','controller_eof'):
            record=self.folder/(mode+'.json')
            unit='er9-luna-'+uuid.uuid4().hex+'.service'
            process=resource.invoke(['/usr/bin/systemd-run','--user','--quiet','--wait',
                '--unit='+unit,'--slice='+self.profile['slice_unit'],
                '--property=MemoryMax='+str(resource.CAPS['outer_worker']),
                '--property=MemorySwapMax=0','--property=RuntimeMaxSec=10s',
                '--property=KillMode=control-group','/usr/bin/python3','-I','-B',str(Path(__file__).resolve()),
                '--guard-helper',str(self.profile_path),str(record),mode],timeout=12)
            self.assertEqual(process.returncode,0)
            facts=json.loads(record.read_text())
            self.assertTrue(facts['resource_bound_verification']['actual_limits_match'])
            self.assertTrue(facts['cgroup_absent_or_empty'])
            helpers=json.loads(record.with_suffix('.helpers.json').read_text())
            self.assertTrue(all(p['actual_owned_placement'] for p in helpers))
            self.assertTrue(facts['guard_outer_resource_placement']['actual_limits_match'])
            self.assertLess(facts['closed_monotonic_ns'],facts['immutable_stop_monotonic_ns']+3_000_000_000)
            spec=importlib.util.spec_from_file_location('resource_observer',HERE/'resource_owned_scope_proof.py')
            observer=importlib.util.module_from_spec(spec);spec.loader.exec_module(observer)
            native=self.folder/(mode+'-native');native.mkdir()
            (native/'result.json').write_text(json.dumps({'allowed_client_tools':{}}))
            (native/'host-process.json').write_text(json.dumps(facts))
            quiet=observer.prove(native,resource_profile_path=self.profile_path)
            self.assertTrue(quiet['all_owned_scopes_quiet'])
            OBSERVATIONS.append({'test':self.id(),'mode':mode,'record':facts,'retained_helper_placements':helpers,'owned_scope_proof':quiet})
    def test_private_slice_observer_exact_recursive_scope(self):
        spec=importlib.util.spec_from_file_location('resource_observer',HERE/'resource_owned_scope_proof.py')
        m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
        unit=launch(self.profile,'native')
        cg=self.profile['slice_cgroup']+'/'+unit
        self.assertFalse(m.cgroup_fact(cg,unit,self.profile)['absent_or_empty'])
        with self.assertRaises(ValueError):m.cgroup_fact('/user.slice/foreign.service',unit,self.profile)
        resource.invoke(['/usr/bin/systemctl','--user','stop',unit])
        self.assertTrue(m.cgroup_fact(cg,unit,self.profile)['absent_or_empty'])


class TinyOOMTest(unittest.TestCase):
    def test_actual_aggregate_kernel_oom_and_quiet(self):
        # Deliberately tiny synthetic slice validates kernel containment. No
        # production profile permits this test cap; no model/real tools run.
        name='er9mem'+uuid.uuid4().hex+'.slice'
        unit='er9-luna-'+uuid.uuid4().hex+'.service'
        p=resource.invoke(['/usr/bin/busctl','--user','call','org.freedesktop.systemd1',
            '/org/freedesktop/systemd1','org.freedesktop.systemd1.Manager','StartTransientUnit',
            'ssa(sv)a(sa(sv))',name,'fail','3','MemoryAccounting','b','true',
            'MemoryMax','t',str(16*resource.MIB),'MemorySwapMax','t','0','0'])
        self.assertEqual(p.returncode,0)
        cg=resource.show(name)['ControlGroup']
        try:
            p=resource.invoke(['/usr/bin/systemd-run','--user','--quiet','--wait','--unit='+unit,
                '--slice='+name,'--property=MemoryMax=64M','--property=MemorySwapMax=0',
                '--property=RuntimeMaxSec=4s','--property=KillMode=control-group',
                '/usr/bin/python3','-I','-B','-c','x=bytearray(64*1024*1024)'],timeout=8)
            facts=resource.show(unit);k=resource.kernel(cg)
            self.assertEqual(int(k['memory.max']),16*resource.MIB)
            self.assertGreater(int(k['memory.events']['oom_kill']),0)
            self.assertNotEqual(p.returncode,0)
            self.assertEqual(facts['Result'],'oom-kill')
            OBSERVATIONS.append({'test':self.id(),'synthetic_cap_bytes':16*resource.MIB,
                'aggregate_kernel_limits':k,'unit_observation':facts,'exit_code':p.returncode,
                'research_fit':'UNKNOWN','model_starts':0})
        finally:
            resource.invoke(['/usr/bin/systemctl','--user','stop',name])
            path=Path('/sys/fs/cgroup')/cg.lstrip('/')
            self.assertTrue(not path.exists() or resource.kernel(cg)['cgroup.events']['populated']=='0')


def guard_helper(profile_path,record,mode):
    r,w=os.pipe()
    stop=time.monotonic_ns()+int((1.2 if mode=='deadline' else 5)*1e9)
    env={**os.environ,'PM_BOUND_DEADLINE_NS':str(stop)}
    proc=subprocess.Popen(['/usr/bin/python3','-I','-B',str(HERE/'resource_host_guard.py'),
        str(profile_path),'native',str(r),str(stop),str(record),'--',
        '/usr/bin/python3','-I','-B','-c',
        "import subprocess,time; subprocess.Popen(['/usr/bin/python3','-I','-c','import time;time.sleep(30)'],start_new_session=True); time.sleep(30)"],
        env=env,pass_fds=(r,),stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    os.close(r)
    observation_end=time.monotonic()+.8
    while time.monotonic()<observation_end:
        if Path(record).exists():
            facts=json.loads(Path(record).read_text())
            if facts.get('resource_bound_verification'):break
        time.sleep(.02)
    outer=resource.own_placement(resource.load(profile_path))
    helpers=[resource.verify_pid_placement(facts[k],outer['unit_observation']['ControlGroup']) for k in ('guard_pid','service_runner_pid')]
    Path(record).with_suffix('.helpers.json').write_text(json.dumps(helpers))
    if mode=='controller_eof':os.close(w)
    proc.wait(timeout=8)
    if mode=='deadline':os.close(w)
    return 0


if __name__=='__main__':
    if len(sys.argv)>1 and sys.argv[1]=='--guard-helper':
        raise SystemExit(guard_helper(*sys.argv[2:]))
    suite=unittest.TestSuite([unittest.defaultTestLoader.loadTestsFromTestCase(ResourceTests),
                            unittest.defaultTestLoader.loadTestsFromTestCase(TinyOOMTest)])
    start=time.monotonic()
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    receipt={'schema':'er9.luna.resource-zero-inference-regression.v1','tests_run':result.testsRun,
        'passed':result.wasSuccessful(),'elapsed_seconds':time.monotonic()-start,
        'failures':len(result.failures),'errors':len(result.errors),'native_goal_starts':0,
        'test_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'observations':OBSERVATIONS}
    (HERE/'RESOURCE_REGRESSION.json').write_text(json.dumps(receipt,indent=2)+'\n')
    raise SystemExit(0 if result.wasSuccessful() else 1)
