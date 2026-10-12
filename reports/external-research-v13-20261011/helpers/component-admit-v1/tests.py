#!/usr/bin/env python3
"""Offline meaningful clock, native protocol, isolation and immutable-request checks."""
import datetime as dt
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

HERE = Path(__file__).absolute().parent
spec = importlib.util.spec_from_file_location('prepare', HERE/'prepare.py')
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)
ROOT = HERE.parents[1]


class AdmissionTests(unittest.TestCase):
    def setUp(self):
        self.scratch = Path(tempfile.mkdtemp(prefix='.checks-', dir=HERE))
        self.now = dt.datetime.now(p.UTC)
        self.t0 = self.now - dt.timedelta(seconds=20)

    def tearDown(self):
        shutil.rmtree(self.scratch)

    def build(self, case='B01-P01', arm='control', name='arm'):
        runtime = self.scratch/name
        result = p.prepare(ROOT, runtime, case, arm, name, p.iso(self.t0), 'SYNTHETIC_NO_PROVIDER', now=self.now)
        return runtime, result

    def test_max_clock_prep_and_queue_no_reset(self):
        runtime, result = self.build()
        f = p.read(runtime/'freeze.json')
        self.assertEqual(p.instant(f['whole_deadline_utc'])-p.instant(f['t0_utc']), dt.timedelta(minutes=25))
        self.assertEqual(f['available_seconds_at_prepare'], 1480)
        p.verify(runtime, now=self.t0+dt.timedelta(seconds=1499))
        with self.assertRaisesRegex(ValueError, 'expired'):
            p.verify(runtime, now=self.t0+dt.timedelta(seconds=1500))
        p.verify(runtime, now=self.t0+dt.timedelta(seconds=1501), allow_terminal=True)
        with self.assertRaisesRegex(ValueError, 'already exists'):
            self.build()
        for t0 in (self.now-dt.timedelta(minutes=25), self.now+dt.timedelta(seconds=1)):
            with self.assertRaisesRegex(ValueError, 'future T0 or expired'):
                p.prepare(ROOT, self.scratch/'invalid', 'B01-P01', 'control', 'invalid', p.iso(t0), 'SYNTHETIC', now=self.now)
        self.assertFalse((self.scratch/'invalid').exists())

    def test_final_preparation_clock_rejects_late_emit(self):
        from unittest.mock import patch
        original_datetime = dt.datetime
        expired = self.now + dt.timedelta(hours=1)
        class LateClock(original_datetime):
            @classmethod
            def now(cls, tz=None):
                return expired
        # Preflight receives the original time; final emission sees preparation past deadline.
        with patch.object(p.dt, 'datetime', LateClock):
            with self.assertRaisesRegex(ValueError, 'expired'):
                p.prepare(ROOT, self.scratch/'late', 'B01-P01', 'control', 'late', p.iso(self.t0), 'SYNTHETIC', now=self.now)
        self.assertTrue((self.scratch/'late'/'IMMUTABLE.json').exists())

    def test_request_and_inputs_are_hash_bound(self):
        for member in ('request.json', 'freeze.json', 'selection.json', 'assignment.md', 'input-map.json', 'inputs/B01-P01/draft.md', 'native/assert-active-goal.py', 'activation.js'):
            runtime, result = self.build(name='arm'+str(len(list(self.scratch.iterdir()))))
            path = runtime/member
            path.chmod(0o644)
            path.write_bytes(path.read_bytes()+b' ')
            with self.assertRaisesRegex(ValueError, 'immutable'):
                p.verify(runtime, now=self.now)
        self.assertEqual(result['args']['target']['options'], {'reasoningEffort':'max','serviceTier':'default'})
        self.assertFalse(result['dispatch_performed'])

    def test_all_components_full_outputs_and_access_delta(self):
        for case in p.CASES:
            pair = {}
            for arm in ('control', 'treatment'):
                runtime, result = self.build(case, arm, case+'-'+arm)
                p.verify(runtime, now=self.now)
                pair[arm] = runtime
                text = (runtime/'assignment.md').read_text()
                for token in ('COMPLETE self-contained final.md', 'source-map.json', 'criticism-dispositions', '25 elapsed minutes', 'no discovery-effectiveness claim'):
                    self.assertIn(token, text)
                self.assertFalse((runtime/'inputs'/case/'rubric.json').exists())
                self.assertFalse((runtime/'inputs'/case/'findings.json').exists())
                self.assertEqual(p.read(runtime/'freeze.json')['whole_budget_s'],1500)
            for base in p.BASE:
                self.assertEqual((pair['control']/'inputs'/case/base).read_bytes(), (pair['treatment']/'inputs'/case/base).read_bytes())
            if case.startswith('B01'):
                self.assertEqual((pair['control']/'inputs'/case/'critique.md').read_bytes(), (pair['treatment']/'inputs'/case/'critique.md').read_bytes())
            if case.startswith('B04'):
                self.assertTrue((pair['control']/'inputs'/case/'critique.md').exists())
                self.assertFalse((pair['control']/'inputs'/case/'critique-compact.md').exists())
                self.assertTrue((pair['treatment']/'inputs'/case/'critique-compact.md').exists())
                self.assertFalse((pair['treatment']/'inputs'/case/'critique.md').exists())
            if case.startswith('B05'):
                self.assertFalse((pair['control']/'inputs'/case/'treatment-cache').exists())
                self.assertFalse((pair['control']/'helpers').exists())
                self.assertTrue((pair['treatment']/'inputs'/case/'treatment-cache/navigation.json').exists())
                reader = pair['treatment']/'helpers/component-fixtures-v1/source_reader.py'
                output = subprocess.run(['python3','-B',str(reader),'--case',case,'--arm','treatment','--source','S1','--start','1','--end','2'], capture_output=True,text=True)
                self.assertEqual(output.returncode,0,output.stderr)
                self.assertIn('1:',output.stdout)

    def test_guard_exact_response_and_reject_transcription_or_partial(self):
        runtime, _ = self.build()
        objective = p.read(runtime/'freeze.json')['native_goal_objective']
        guard = runtime/'native/assert-active-goal.py'
        original = ROOT/'reference/recipes/materialize-v3/sources/mechanics/exact-goal-binding-guard-v1/assert-active-goal.py'
        self.assertEqual(guard.read_bytes(), original.read_bytes())
        goal = {'threadId':'synthetic','objective':objective,'status':'active','createdAt':'synthetic','updatedAt':'synthetic','tokensUsed':0,'timeUsedSeconds':0}
        response = {'goal':goal,'remainingTokens':None,'completionBudgetReport':None}
        def check(obj):
            return subprocess.run(['python3','-B',str(guard),'--stage-dir',str(runtime),'--json',json.dumps(obj)],capture_output=True,text=True)
        self.assertEqual(check(response).returncode,0)
        for bad in ({'goal':goal}, goal, dict(response, goal=dict(goal,objective=objective+' ')), dict(response,goal=dict(goal,status='complete'))):
            self.assertEqual(check(bad).returncode,2)

    def test_capture_body_offline_mock_one_native_call_raw_save(self):
        runtime, _ = self.build()
        # Evaluate real emitted JavaScript with only mocked native tools. No provider call.
        harness = '''const fs=require('fs'),vm=require('vm'),cp=require('child_process');
let starts=0;let terminals=0;const response={goal:{threadId:'mock',objective:JSON.parse(fs.readFileSync(process.argv[2]+'/freeze.json')).native_goal_objective,status:'active',createdAt:'mock',updatedAt:'mock',tokensUsed:0,timeUsedSeconds:0},remainingTokens:null,completionBudgetReport:null};
const tools={exec_command:async a=>{try{return {exit_code:0,output:cp.execSync(a.cmd,{encoding:'utf8'})}}catch(e){return {exit_code:e.status,output:String(e.stderr)}}},create_goal:async a=>{starts++;if(a.objective!==response.goal.objective)throw Error('objective transcription');return response},update_goal:async a=>{terminals++;return {...response,goal:{...response.goal,status:a.status}}}};
const run=async name=>vm.runInNewContext('(async()=>{'+fs.readFileSync(process.argv[2]+'/'+name,'utf8')+'})()', {tools,text:()=>{}});
(async()=>{await run('activation.js');if(starts!==1||fs.readFileSync(process.argv[2]+'/native-goal-create.json','utf8')!==JSON.stringify(response))throw Error('raw receipt/one call');try{await run('activation.js');throw Error('retry allowed')}catch(e){if(starts!==1)throw Error('second native call')};await run('completion.js');if(terminals!==1||JSON.parse(fs.readFileSync(process.argv[2]+'/native-goal-terminal.json')).goal.status!=='complete')throw Error('terminal');process.stdout.write('PASS one mocked create; exact raw save; retry preflight blocks second create; mocked terminal raw save')} )().catch(e=>{process.stderr.write(String(e));process.exit(1)});
'''
        script = self.scratch/'mock.js'
        script.write_text(harness)
        out = subprocess.run(['node',str(script),str(runtime)],capture_output=True,text=True)
        self.assertEqual(out.returncode,0,out.stderr)
        self.assertIn('PASS',out.stdout)


if __name__ == '__main__':
    unittest.main(verbosity=2)
