#!/usr/bin/env python3
"""Synthetic fixtures only: no T3 requests or native Goals. Scratch self-cleans."""
import datetime as dt, importlib.util, json, subprocess, tempfile, time, unittest
from pathlib import Path
from types import SimpleNamespace

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('retention', HERE / 'b03.py')
b = importlib.util.module_from_spec(spec); spec.loader.exec_module(b)

NODE = r'''
const fs = require('fs'), cp = require('child_process');
const payload = JSON.parse(fs.readFileSync(0, 'utf8'));
const counts = {create:0,get:0,complete:0};
global.text = () => {};
global.tools = {
 exec_command: async a => {const p = cp.spawnSync('bash',['-c',a.cmd],{encoding:'utf8'}); return {exit_code:p.status,output:p.stdout + p.stderr};},
 create_goal: async a => {counts.create++; if(a.objective !== payload.raw.goal.objective) throw Error('objective not machine-bound'); return payload.raw;},
 get_goal: async () => {counts.get++; return payload.raw;},
 update_goal: async a => {if(a.status !== 'complete') throw Error('unsupported active reset'); counts.complete++; return {...payload.raw,goal:{...payload.raw.goal,status:'complete'}};}
};
(async () => {await new Function('return (async () => {' + payload.code + '})()')(); console.log(JSON.stringify(counts));})().catch(e=>{console.error(e.message);process.exit(2)});
'''

class RetentionTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix='b03-synthetic-')
        self.root = Path(self.tmp.name)
        parent = b.module('test_parent', b.PARENT / 'materialize.py')
        for n in ('brief', 'plan'): (self.root / (n + '.md')).write_text(parent.TIME_CONTRACT + '\n' + n + ' synthetic obligations only\n')
        self.dest = self.root / 'arm'
        self.t0 = b.now() - dt.timedelta(seconds=1)
        self.args = SimpleNamespace(destination=str(self.dest), authorized_provider_instance='mock-route', brief=str(self.root / 'brief.md'), plan=str(self.root / 'plan.md'), run_id='SYNTHETIC', t0_utc=b.iso(self.t0), whole_deadline_utc=b.iso(self.t0 + dt.timedelta(hours=1)))
        b.prep(self.args)
        self.config = self.dest / 'configs/SYNTHETIC.json'
        self.c = b.load(self.config)
        b.prepare(self.c, 'investigator')
        self.p = b.inv(self.c)
        self.raw = self.native(self.p, 'mock-author')
        b.save(self.p / 'dispatch.json', {'returned': {'taskId':'mock-investigator-task', 'childThreadId':'mock-T3-author-context'}})
        self.author_status = {'taskId':'mock-investigator-task', 'childThreadId':'mock-T3-author-context', 'status':'running', 'hasPendingChildRuns':False}
        self.waiter = None

    def tearDown(self):
        if self.waiter and self.waiter.poll() is None:
            self.waiter.terminate(); self.waiter.communicate(timeout=5)
        self.tmp.cleanup()

    def native(self, p, thread):
        return {'goal': {'threadId':thread, 'objective':b.read(p / 'freeze.json')['native_goal_objective'], 'status':'active', 'createdAt':int(time.time()), 'updatedAt':int(time.time()), 'tokensUsed':0, 'timeUsedSeconds':0}, 'remainingTokens':None, 'completionBudgetReport':None}

    def js(self, p, raw):
        return subprocess.run(['node','-e',NODE], input=json.dumps({'code':p.read_text(),'raw':raw}),text=True,capture_output=True)

    def freeze(self):
        activation = self.js(self.p / 'native-activate.js', self.raw)
        self.assertEqual(activation.returncode,0,activation.stderr)
        self.assertEqual(json.loads(activation.stdout)['create'],1)
        (self.p / 'discovery.md').write_text('synthetic discovery original evidence\n' * 40)
        b.save(self.p / 'source-map.json', {'synthetic':True})
        (self.p / 'sources/a.txt').write_text('synthetic retained governing evidence')
        reveal = subprocess.run(['python3','-B',str(self.dest / 'helpers/er12-screen-v1/reveal.py'),'--config',str(self.config)],capture_output=True,text=True)
        self.assertEqual(reveal.returncode,0,reveal.stderr)
        (self.p / 'draft.md').write_text('synthetic complete draft, original plan and alternatives')
        b.save(self.p / 'native-wait-active.json', self.raw)
        return b.freeze_author(self.c)

    def waiting(self):
        self.freeze()
        self.waiter = subprocess.Popen(['python3','-B',str(b.helper(self.c)),'wait','--config',str(self.config)],text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
        deadline = time.monotonic() + 5
        while not b.ctl(self.c,'waiting.json').exists() and time.monotonic() < deadline: time.sleep(.02)
        self.assertTrue(b.ctl(self.c,'waiting.json').exists())
        return b.observe(self.c, self.author_status)

    def critic_ready(self):
        self.waiting(); b.prepare(self.c,'critic',self.author_status)
        p = b.critic(self.c); raw = self.native(p,'mock-critic')
        b.save(p / 'dispatch.json', {'returned': {'taskId':'mock-critic-task','childThreadId':'mock-T3-critic-context'}})
        activation = self.js(p / 'native-activate.js',raw)
        self.assertEqual(activation.returncode,0,activation.stderr)
        self.assertEqual(json.loads(activation.stdout)['create'],1)
        (p / 'critique.md').write_text('synthetic independent full review with issue dispositions')
        b.save(p / 'source-map.json',{'synthetic':True})
        (p / 'sources/a.txt').write_text('synthetic independent governing evidence')
        completed = self.js(p / 'critic-complete.js',raw)
        self.assertEqual(completed.returncode,0,completed.stderr)
        self.assertEqual(json.loads(completed.stdout),{'create':0,'get':1,'complete':1})
        return {'taskId':'mock-critic-task','childThreadId':'mock-T3-critic-context','status':'completed','hasPendingChildRuns':False}

    def test_exact_one_create_no_completion_at_draft_and_same_goal_finalize(self):
        status = self.critic_ready()
        self.assertFalse((self.p / 'native-goal-terminal.json').exists())
        self.assertEqual(b.read(b.ctl(self.c,'retained-ready.json'))['predecessor_is_terminal'],False)
        release = b.deliver(self.c,status)
        out,err = self.waiter.communicate(timeout=5)
        self.assertEqual(self.waiter.returncode,0,err)
        result = self.js(self.p / 'author-resume.js', self.raw)
        self.assertEqual(result.returncode,0,result.stderr)
        final = self.p / 'final'
        (final / 'final.md').write_text('synthetic complete final after every fresh critique disposition')
        b.save(final / 'source-map.json',{'synthetic':True})
        (final / 'sources/f.txt').write_text('synthetic final evidence')
        done = self.js(self.p / 'author-complete.js', self.raw)
        self.assertEqual(done.returncode,0,done.stderr)
        self.assertEqual(json.loads(done.stdout),{'create':0,'get':1,'complete':1})
        observed = b.read(b.ctl(self.c,'author-terminal-observed.json'))
        self.assertEqual(observed['native_identity'],b.identity(self.raw))
        self.assertNotEqual(b.read(b.ctl(self.c,'author-ready.json'))['t3_child_context'],self.raw['goal']['threadId'])
        self.assertLessEqual(b.parse(release['finalization_deadline_utc']),self.t0 + dt.timedelta(hours=1))
        self.assertEqual((self.p / 'draft.md').read_text(),'synthetic complete draft, original plan and alternatives')

    def test_second_activation_refused_before_native_call(self):
        self.freeze()
        repeated = self.js(self.p / 'native-activate.js',self.raw)
        self.assertNotEqual(repeated.returncode,0)
        self.assertIn('objective read failed',repeated.stderr)

    def test_science_requires_actual_one_shot_plan_reveal(self):
        self.freeze(); (self.p / 'plan-reveal.json').chmod(0o644)
        r = b.read(self.p / 'plan-reveal.json'); r['single_use'] = False
        (self.p / 'plan-reveal.json').write_text(json.dumps(r))
        with self.assertRaisesRegex(ValueError,'changed|one-shot'): b.frozen_author(self.c)

    def test_wait_occupancy_separate_from_activity_and_failure_honest(self):
        self.waiting(); time.sleep(.1)
        b.save(b.ctl(self.c,'critic-release.json'),{'status':'failed','reason':'synthetic critic failure'})
        out,err = self.waiter.communicate(timeout=5)
        self.assertNotEqual(self.waiter.returncode,0)
        r = b.read(b.ctl(self.c,'wait-ended.json'))
        self.assertEqual(r['reason'],'failed'); self.assertGreater(r['waiting_occupancy_seconds'],.1)
        self.assertIsNone(r['actual_provider_activity_seconds']); self.assertFalse(r['goal_state_written'])
        self.assertFalse((self.p / 'native-goal-terminal.json').exists())

    def test_source_addition_or_mutation_prevents_critic_admission(self):
        self.waiting(); (self.p / 'sources/new.txt').write_text('unfrozen')
        with self.assertRaisesRegex(ValueError,'inventory changed'): b.prepare(self.c,'critic',self.author_status)

    def test_terminal_author_cannot_admit_critic(self):
        self.waiting()
        terminal = dict(self.author_status,status='completed')
        with self.assertRaisesRegex(ValueError,'still be running'): b.prepare(self.c,'critic',terminal)

    def test_ready_requires_live_bound_waiter(self):
        self.freeze()
        with self.assertRaises((ValueError,OSError)): b.observe(self.c,self.author_status)

    def test_critic_failure_or_children_no_release(self):
        status = self.critic_ready()
        for status in (dict(status,status='failed'),dict(status,hasPendingChildRuns=True)):
            with self.assertRaises(ValueError): b.deliver(self.c,status)
        self.assertFalse(b.ctl(self.c,'critic-release.json').exists())

    def test_whole_expiry_preserves_partial_no_clockreset(self):
        status = self.critic_ready(); self.c['_whole_deadline'] = b.now() - dt.timedelta(seconds=1)
        with self.assertRaisesRegex(ValueError,'whole deadline expired'): b.deliver(self.c,status)
        self.assertTrue((b.critic(self.c) / 'critique.md').exists())
        self.assertFalse(b.ctl(self.c,'critic-release.json').exists())

    def test_actual_blocking_wait_expires_without_goal_state_write(self):
        self.freeze(); self.c['_whole_deadline'] = b.now() + dt.timedelta(seconds=.12)
        with self.assertRaisesRegex(ValueError,'wait expired'): b.wait(self.c)
        r = b.read(b.ctl(self.c,'wait-ended.json'))
        self.assertEqual(r['reason'],'expired'); self.assertGreater(r['waiting_occupancy_seconds'],.08)
        self.assertGreaterEqual(b.parse(r['wait_ended_at_utc']),self.c['_whole_deadline'])
        self.assertIsNone(r['actual_provider_activity_seconds']); self.assertFalse(r['goal_state_written'])
        self.assertTrue((self.p / 'draft.md').exists())
        self.assertFalse((self.p / 'native-goal-terminal.json').exists())

    def test_private_config_method_or_plan_mutation_refused(self):
        self.config.write_text(self.config.read_text() + ' ')
        with self.assertRaisesRegex(ValueError,'dependency changed'): b.load(self.config)

    def test_finite_prep_refuses_other_route_method_or_budget(self):
        for edits in ({'method':'R0'},{'candidate':'muse'},{'stage_budgets_s':'1800,1800'},{'whole_budget_s':3601}):
            a = SimpleNamespace(**dict(vars(self.args),destination=str(self.root / 'refused-arm'),**edits))
            with self.assertRaises(ValueError): b.prep(a)
            self.assertFalse((self.root / 'refused-arm').exists())

    def test_tool_status_envelope_keeps_full_observation(self):
        self.waiting()
        status = {'structuredContent':self.author_status,'content':[{'type':'text','text':json.dumps(self.author_status)}],'isError':False}
        result = b.prepare(self.c,'critic',status)
        self.assertEqual(result['args']['target']['model'],'gpt-6-luna')
        self.assertEqual(b.read(b.ctl(self.c,'critic-admission.json'))['author_task_status_raw'],status)

    def test_changed_goal_birth_prevents_resume(self):
        status = self.critic_ready(); b.deliver(self.c,status); self.waiter.communicate(timeout=5)
        changed = dict(self.raw,goal=dict(self.raw['goal'],createdAt=self.raw['goal']['createdAt']+1))
        result = self.js(self.p / 'author-resume.js',changed)
        self.assertNotEqual(result.returncode,0)
        self.assertIn('identity changed',result.stderr)

    def test_frozen_custody_mutation_refused_after_release(self):
        status = self.critic_ready(); b.deliver(self.c,status); self.waiter.communicate(timeout=5)
        p = b.ctl(self.c,'critic-delivery/critique.md'); p.chmod(0o644); p.write_text('edited critique')
        with self.assertRaisesRegex(ValueError,'dependency changed'): b.release(self.c)

    def test_fixed_delivery_path_and_finalization_cap_cannot_change(self):
        status = self.critic_ready(); r = b.deliver(self.c,status); self.waiter.communicate(timeout=5)
        p = b.ctl(self.c,'critic-release.json'); p.chmod(0o644)
        changed = dict(r,fixed_critique_path=str(self.root / 'unlisted-critique.md'))
        p.write_text(json.dumps(changed))
        with self.assertRaisesRegex(ValueError,'exact fixed critic path'): b.release(self.c)
        changed = dict(r,finalization_deadline_utc=b.iso(b.parse(r['release_prepared_at_utc']) + dt.timedelta(seconds=1081)))
        p.write_text(json.dumps(changed))
        with self.assertRaisesRegex(ValueError,'extended finalization'): b.release(self.c)

    def test_finalization_expiry_and_clipping_without_completing_goal(self):
        status = self.critic_ready(); t = b.now(); self.c['_whole_deadline'] = t + dt.timedelta(seconds=100)
        r = b.deliver(self.c,status)
        self.assertEqual(b.parse(r['finalization_deadline_utc']),self.c['_whole_deadline'])
        self.waiter.communicate(timeout=5)
        b.save(self.p / 'native-resume-active.json',self.raw)
        original = b.now
        try:
            b.now = lambda: self.c['_whole_deadline'] + dt.timedelta(seconds=1)
            with self.assertRaisesRegex(ValueError,'finalization expired'): b.resume(self.c)
        finally: b.now = original
        self.assertFalse((self.p / 'native-goal-terminal.json').exists())

if __name__ == '__main__': unittest.main(verbosity=2)
