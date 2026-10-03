"""Auth-free source fixtures; no campaign ledger, provider or native Goal calls."""
import contextlib
import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import unittest
from unittest.mock import patch
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE/'route-successor'))
sys.path.insert(0,str(HERE))
import common
import failure_settlement as fs
import release_binding as rb
import projector
import formula_check

class LedgerFixture:
    """Explicit test-only in-memory accounting, never authorization evidence."""
    def __init__(self, birth):
        self.state={'jobs':{birth['job']:{'goal_starts':[],'launch_pending':{'permit_id':'fixture'},'released_epoch':None}},'cases':{birth['case']:{'observed_outside_native_seconds':0}},'events':[]}
    @contextlib.contextmanager
    def transaction(self):
        state=copy.deepcopy(self.state)
        yield state
        self.state=state
    def apply(self,state,action,r):
        job=state['jobs'][r['job']]
        if action=='goal-start':job['goal_starts'].append({'receipt_id':r['receipt_id']});job['launch_pending']=None
        elif action=='start-absent':job['launch_pending']=None
        elif action=='release':job['released_epoch']=time.time();job['quiescence']=r['quiescence']
        elif action=='event':
            state['events'].append(r);state['cases'][r['case']]['observed_outside_native_seconds']+=r['outside_native_seconds']
        else:raise AssertionError('unexpected fixture action')

def item(kind,**kw):return dict(type=kind,id='fixture-item',**kw)
def state():
    s=projector.State();s.thread='fixture-thread';return s

def event(s,i):s.event({'method':'item/completed','params':{'threadId':s.thread,'item':i}})

class PositiveItems(unittest.TestCase):
    def test_only_four_mcp_names_and_exact_server(self):
        for name in projector.MCP_TOOLS:
            s=state();event(s,item('mcpToolCall',arguments={},server='pm_boundary',tool=name,status='completed'));self.assertFalse(s.failed)
            for change in ({'tool':'list_resources'},{'server':'other'},{'pluginId':'private-plugin'},{'arguments':'opaque'},{'futureField':True},{'result':{'content':[{'type':'image','data':'opaque'}]}}):
                s=state();event(s,{**item('mcpToolCall',arguments={},server='pm_boundary',tool=name,status='completed'),**change});self.assertTrue(s.failed)
    def test_exact_native_goal_controls(self):
        for name in ('get_goal','update_goal'):
            for i in (item('dynamicToolCall',tool=name,namespace=None,arguments={} if name=='get_goal' else {'status':'complete'},status='completed',success=True,contentItems=[{'type':'inputText','text':'opaque'}]),item('functionCallOutput',name=name,namespace=None,output=[{'type':'input_text','text':'opaque'}])):
                s=state();event(s,i);self.assertFalse(s.failed);self.assertEqual(s.goal_tool_counts[name],1)
                for change in ({'namespace':'goal'},{'tool':'create_goal','name':'create_goal'},{'output':[{'type':'input_image','image_url':'private'}]}):
                    s=state();event(s,{**i,**change});self.assertTrue(s.failed)
    def test_adverse_every_unknown_kind(self):
        for kind in ('create_goal','commandExecution','fileChange','webSearch','subAgentActivity','collabAgentToolCall','imageView','imageGeneration','sleep','plan','hook','futureUnknown',None):
            s=state();event(s,item(kind));self.assertTrue(s.failed)
        for malformed in (None,[],{},item('reasoning',summary=['text',{}])):
            s=state();event(s,malformed);self.assertTrue(s.failed)
    def test_structural_projection_never_exports_text(self):
        for i in (item('userMessage',content=[{'type':'text','text':'PRIVATE'}]),item('agentMessage',text='PRIVATE'),item('reasoning',summary=['PRIVATE']),item('contextCompaction')):
            s=state();event(s,i);self.assertFalse(s.failed);self.assertNotIn('PRIVATE',json.dumps(s.metrics()))
    def test_usage_notifications_are_not_response_cap(self):
        s=state()
        for n in range(170):s.event({'method':'thread/tokenUsage/updated','params':{'threadId':s.thread,'tokenUsage':{'total':{'inputTokens':0,'cachedInputTokens':0,'outputTokens':n,'reasoningOutputTokens':0,'totalTokens':n}}}})
        self.assertFalse(s.failed);self.assertEqual(s.metrics()['native_responses'],'UNKNOWN');self.assertFalse(s.metrics()['native_model_response_cap_enforced'])

class Closure(unittest.TestCase):
    def test_exact_immutable_pins_and_source_not_json(self):
        with tempfile.TemporaryDirectory() as td:
            p=Path(td)/'source.py';p.write_text('positive_source = True\n');r={'path':str(p),'sha256':common.sha(p)}
            common.pin_record(r)
            with self.assertRaises(json.JSONDecodeError):common.record(r)
            p.write_text('drift = True\n')
            with self.assertRaises(ValueError):common.pin_record(r)
    def test_immutable_deadline_and_arming(self):
        start=time.monotonic_ns();self.assertEqual(common.deadline(start,480,start,start+1000*10**9),start+480*10**9)
        with patch.dict(common.os.environ,{'PM_BOUND_DEADLINE_NS':str(start+480*10**9)}):common.armed(start+480*10**9)
        with patch.dict(common.os.environ,{'PM_BOUND_DEADLINE_NS':str(start+481*10**9)}):
            with self.assertRaises(ValueError):common.armed(start+480*10**9)
    def test_no_release_without_explicit_root(self):
        for mode in ('canary','productive'):
            with self.assertRaises(ValueError):rb.check_parent_release({'accepted':True,'family':'L'},mode)

class FormulaFixture(unittest.TestCase):
    def test_exact_prospective_formula_and_drift_rejection(self):
        # Deliberately synthetic test-only records. Never launch or qualify.
        with tempfile.TemporaryDirectory() as td:
            controller=Path(td)/'controller';route=controller/'route-successor';route.mkdir(parents=True)
            operator=Path(td)/'operator';runroot=operator/'once';home=runroot/'canary'/'canary';home.mkdir(parents=True)
            def rec(path,value):
                common.atomic(path,value);return {'path':str(path),'sha256':common.sha(path)}
            ledger=controller/'ledger.py';ledger.write_text('# auth-free fixture only\n')
            lr={'path':str(ledger),'sha256':common.sha(ledger)}
            ar=rec(controller/'authority.json',{'fixture_only':True});rr=rec(controller/'resume.json',{'fixture_only':True})
            control={'operator_root':str(operator),'ledger':lr,'authority':ar,'resume_authority':rr,'canary_id':'canary'}
            cr=rec(controller/'recovery-control.json',control)
            rs=rec(route/'SNAPSHOT.json',{'closure_sha256':{}})
            cs=rec(controller/'SNAPSHOT.json',{'closure_sha256':{str(controller/'recovery-control.json'):cr['sha256']}})
            sr=rec(controller/'review.json',{'verdict':'accepted','snapshot_sha256':rs['sha256'],'allowed_modes':['canary'],'create_goal_pre_dispatch_denied_verified':True,'host_one_goal_lifetime_verified':True,'synthetic_fixture_only':True})
            er=rec(controller/'execution-review.json',{'verdict':'accepted','snapshot_sha256':rs['sha256'],'synthetic_fixture_only':True})
            cfg={'native_model':{'provider_id':'openai','model_id':'gpt-6-luna','effort':'max','session_mode':'fresh-persistent'},'native_response_policy':common.POLICY,'account_identity':common.ACCOUNT,'snapshot_path':rs['path'],'private_codex_home':'FORMULA_ONLY'}
            cfgrec=rec(controller/'config.json',cfg)
            parent={'schema':'er8.luna.controller-root-release.v1','root_authority':True,'accepted':True,'authorization':'EXACT_ROOT_RELEASE','family':'L','model':'gpt-6-luna','effort':'max','native_response_policy':common.POLICY,'binding_formula':rb.FORMULA,'owned_cleanup_authorized':True,'mode':'canary','route_snapshot':rs,'controller_snapshot':cs,'source_review':sr,'execution_acceptance':er,'ledger_source':lr,'campaign_authority':ar,'resume_authority':rr,'config':cfgrec,'run_root':str(runroot),'auth_source_path':'/fixture-unread-auth.json','route':'fixture','selected_stage_scope':{'canary_id':'canary','cap_seconds':480,'cleanup_reserve_seconds':30,'max_responses_abi_sentinel':1},'pins':{'runtime':rs['sha256'],'config':cfgrec['sha256'],'independent_acceptance':sr['sha256']},'synthetic_fixture_only':True}
            pr=rec(controller/'parent.json',parent)
            fixture=type('Ledger',(),{'transaction':lambda _:contextlib.nullcontext({'route_reviews':{'fixture':{'accepted':True,'qualification_scope':'CANARY_ONLY','pins':parent['pins']}}})})()
            with patch.object(rb,'HERE',controller),patch.object(rb,'LUNA_ROUTE',route),patch.object(rb,'CONTROL',control),patch.object(rb,'ledger_module',return_value=fixture):
                rb.check_parent_release(parent,'canary')
                binding={'case_id':'canary','stage_id':'canary','label':'canary','workspace':str(home/'workspace'),'mode':'canary','stage_start_monotonic_ns':123,'stage_birth_epoch':1790991000.0,'max_seconds':480,'max_responses':1,'native_response_policy':common.POLICY,'account_identity':common.ACCOUNT}
                concrete={'binding_formula':rb.FORMULA,'prospective_root_release':pr,'route_snapshot_sha256':rs['sha256'],'controller_snapshot':cs,'config_template':cfgrec,'case_id':'canary','stage_id':'canary','original_stage_birth_monotonic_ns':123,'original_stage_birth_epoch':1790991000.0}
                exactcfg={**cfg,'private_codex_home':str(home/'private-codex-auth')}
                with patch.object(formula_check,'HERE',route):
                    self.assertTrue(formula_check.validate(exactcfg,binding,concrete))
                    for changes in ({'original_stage_birth_monotonic_ns':124},{'original_stage_birth_epoch':1790991001.0},{'config_template':ar}):
                        with self.assertRaises(ValueError):formula_check.validate(exactcfg,binding,{**concrete,**changes})
                    with self.assertRaises(ValueError):formula_check.validate({**exactcfg,'native_model':{}},binding,concrete)
                # Monitor-only acceptance is never sufficient to authorize.
                review=common.read_json(sr['path']);review['create_goal_pre_dispatch_denied_verified']=False
                badsr=rec(controller/'review.json',review);badparent={**parent,'source_review':badsr}
                with self.assertRaisesRegex(ValueError,'preventive'):rb.check_parent_release(badparent,'canary')

class Accounting(unittest.TestCase):
    def test_unique_failure_intervals_without_cursor_or_complete(self):
        events=[{'case':'c','outside_native_seconds':2e-9,'interval_receipt_id':'one','interval_begin_monotonic_ns':2,'interval_end_monotonic_ns':4}]
        self.assertEqual(fs.uncovered_intervals([(0,5),(7,10)],events,'c'),[(0,2),(4,5),(7,10)])
        for bad in (events+events,[{**events[0],'interval_receipt_id':None}],[{**events[0],'outside_native_seconds':1}],events+[{**events[0],'interval_receipt_id':'two'}]):
            with self.assertRaises(ValueError):fs.uncovered_intervals([(0,10)],bad,'c')
        with self.assertRaises(ValueError):fs.uncovered_intervals([(0,5),(4,8)],[],'c')

class HeldFailure(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.home=Path(self.tmp.name);now=time.monotonic_ns();self.start=now-10**9;self.cutoff=self.start+480*10**9
        self.birth={'case':'fixture','job':'fixture-job','stage_monotonic_ns':self.start,'original_deadline_monotonic_ns':self.cutoff,'host_anchor_monotonic_ns':self.start}
        self.actor=subprocess.Popen(['/usr/bin/python3','-I','-B','-c','raise SystemExit(7)'],start_new_session=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);self.actor.wait();self.exited=time.monotonic_ns()
        self.held={'pid':self.actor.pid,'returncode':self.actor.returncode,'exit_monotonic_ns':self.exited}
        self.ledger=LedgerFixture(self.birth)
    def tearDown(self):self.tmp.cleanup()
    def native(self):
        launch=self.start+1000000;enroll=launch+1000000;quiet=enroll+1000000;unit='er8-fixture.service'
        self.plan={'stage_start_monotonic_ns':self.start,'deadline_monotonic_ns':self.cutoff,'owned_unit':unit,'enrollment_path':str(self.home/'enrollment.json'),'runtime_path':str(common.LUNA_ROUTE/'launch.py')}
        self.quiet={'owned_native_quiescent':True,'inclusive_native_lifetime_established':True,'original_deadline_monotonic_ns':self.cutoff,'owned_unit':unit,'owned_cgroup':'/fixture/'+unit,'quiescence_observed_monotonic_ns':quiet,'enrollment':{'schema':'er8.execution.enrollment.v1','owned_unit':unit,'original_deadline_monotonic_ns':self.cutoff,'enrolled_monotonic_ns':enroll,'cgroup':'/fixture/'+unit}}
        common.atomic(self.home/'PLAN.json',self.plan);common.atomic(self.home/'LAUNCH_INTENT.json',{'original_deadline_monotonic_ns':self.cutoff,'native_wrapper_launch_monotonic_ns':launch})
        common.atomic(self.home/'LAUNCHED.json',{'original_deadline_monotonic_ns':self.cutoff,'native_wrapper_launch_monotonic_ns':launch,'job':self.birth['job'],'owned_unit':unit,'wrapper_pid':self.actor.pid+1,'wrapper_pgid':self.actor.pid})
        common.atomic(self.home/'native-public/activation.json',{'native_activation_observed':True,'goal_started_turn':True,'receipt_id':'fixture-goal','observed_activation_monotonic_ns':enroll,'observed_activation_epoch':time.time()-1})
    def test_positive_failed_no_complete_current_release_real_held_parents(self):
        self.native()
        observer=type('Observer',(),{'observe':lambda _,*args:copy.deepcopy(self.quiet)})()
        with patch.object(fs,'load',return_value=observer),patch.object(fs,'ledger_module',return_value=self.ledger):
            proof=fs.close_stage(self.home,self.birth,self.held)
            self.assertEqual(proof['disposition'],'FAILED_OR_INCOMPLETE');self.assertFalse((self.home/'COMPLETE.json').exists())
            settlement=subprocess.Popen(['/usr/bin/python3','-I','-B','-c','pass'],start_new_session=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);settlement.wait();exit_ns=time.monotonic_ns()
            proof=fs.release_after_settlement(self.home,self.birth,self.actor,settlement,settlement_exit_ns=exit_ns)
            self.assertIsNotNone(self.ledger.state['jobs'][self.birth['job']]['released_epoch']);self.assertFalse(proof['quality_accepted'])
            self.assertEqual(len(self.ledger.state['jobs'][self.birth['job']]['goal_starts']),1)
            self.assertGreater(proof['current_release_observed_monotonic_ns_upper_bound'],exit_ns)
    def test_unknown_activation_retains_hold(self):
        self.native();(self.home/'native-public/activation.json').unlink()
        observer=type('Observer',(),{'observe':lambda _,*args:copy.deepcopy(self.quiet)})()
        with patch.object(fs,'load',return_value=observer),patch.object(fs,'ledger_module',return_value=self.ledger):
            with self.assertRaises(ValueError):fs.close_stage(self.home,self.birth,self.held)
        self.assertIsNone(self.ledger.state['jobs'][self.birth['job']]['released_epoch'])
    def test_unknown_or_foreign_enrollment_rejected(self):
        self.native()
        for changes in ({'owned_unit':'foreign'},{'inclusive_native_lifetime_established':False},{'enrollment':{}},{'owned_cgroup':'/foreign'}):
            with self.assertRaises(ValueError):fs.validate_quiet({**self.quiet,**changes},self.plan,self.start,self.cutoff)
    def test_no_launch_needs_positive_marker_not_missing_files(self):
        with self.assertRaises(ValueError):fs.close_stage(self.home,self.birth,self.held)
        common.atomic(self.home/'NO_NATIVE_LAUNCH.json',{'wrapper_Popen_attempted':False,'positive_native_activation_absent':True,'stage_monotonic_ns':self.start,'original_deadline_monotonic_ns':self.cutoff})
        proof=fs.close_stage(self.home,self.birth,self.held);self.assertEqual(proof['activation_disposition'],'POSITIVE_ABSENT_NO_LAUNCH')
        common.atomic(self.home/'LAUNCH_INTENT.json',{})
        with self.assertRaises(ValueError):fs.close_stage(self.home,self.birth,self.held)
    def test_held_returncode_group_and_deadline_enforced(self):
        for changes in ({'returncode':None},{'pid':True},{'exit_monotonic_ns':self.cutoff+1}):
            with self.assertRaises(ValueError):fs.close_stage(self.home,self.birth,{**self.held,**changes})

if __name__=='__main__':unittest.main()
