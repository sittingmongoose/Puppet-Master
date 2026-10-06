"""Zero-inference tests using synthetic control receipts and the production guard path."""
import argparse,copy,hashlib,importlib,json,os,pathlib,sys,tempfile,time,unittest
from unittest.mock import patch
HERE=pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import readiness as r
import glm_stage as g

class Fixture:
 def __init__(self,root,birth=1_000_000_000):
  self.root=pathlib.Path(root);self.profile={'original_birth_monotonic_ns':birth,'original_total_stop_monotonic_ns':birth+600_000_000_000,'slice_cgroup':'/user.slice/er9mem'+'a'*32+'.slice'}
  self.path=self.root/'RESOURCE_PROFILE.json';self.path.write_text(json.dumps(self.profile));self.digest=r.sha(self.path)
 def owner(self,component='native',guard_pid=1234,verified=False):
  path=self.root/r.record_name(component);unit='er9-glm-'+'b'*32+'.service';helper=self.profile['slice_cgroup']+'/outerfixture.service';stop=self.profile['original_total_stop_monotonic_ns']-5_000_000_000
  intent=r.write_owner_intent(self.profile,self.path,path,unit,component,guard_pid,helper,stop)
  value={'unit':unit,'component':component,'guard_pid':guard_pid,'helper_cgroup':helper,'immutable_stop_monotonic_ns':stop,'verified_before_command_exec':verified,'closed_monotonic_ns':self.profile['original_birth_monotonic_ns']+3_000_000_000,'service_runner_exit_code':255,'terminal_unit_observation':{'LoadState':'loaded','ActiveState':'failed','MainPID':'0','ControlGroup':''},'cgroup_absent_or_empty':True}
  path.write_text(json.dumps(value));return {'component':component,'guard_pid':guard_pid,'record_path':str(path)},value,intent
 def save(self,owner,value):pathlib.Path(owner['record_path']).write_text(json.dumps(value))

class ReadinessTests(unittest.TestCase):
 def setUp(self):self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup);self.f=Fixture(self.temp.name);self.o,self.v,self.intent=self.f.owner()
 def failure(self,now=100_000_000_000):return r.terminal_failure(self.o,self.f.profile,self.f.digest,now)
 def test_positive_join_fails_promptly(self):
  polls=[]
  with self.assertRaises(r.OwnedComponentReadinessTerminated) as caught:r.wait_for_resource_gates([self.o],self.f.profile,self.f.digest,571,polls.append,now=lambda:100,now_ns=lambda:100_000_000_000)
  self.assertEqual(polls,[]);self.assertEqual(caught.exception.evidence['component'],'native');self.assertEqual(caught.exception.evidence['billing'],'UNKNOWN');self.assertNotIn('native_goal_starts',caught.exception.evidence)
 def test_foreign_unit_record_does_not_classify(self):self.v['unit']='er9-glm-'+'c'*32+'.service';self.f.save(self.o,self.v);self.assertIsNone(self.failure())
 def test_wrong_guard_pid_does_not_classify(self):self.v['guard_pid']+=1;self.f.save(self.o,self.v);self.assertIsNone(self.failure())
 def test_wrong_component_does_not_classify(self):self.v['component']='pm_boundary';self.f.save(self.o,self.v);self.assertIsNone(self.failure())
 def test_wrong_original_stop_does_not_classify(self):self.v['immutable_stop_monotonic_ns']+=1;self.f.save(self.o,self.v);self.assertIsNone(self.failure())
 def test_wrong_profile_or_birth_does_not_classify(self):
  self.assertIsNone(r.terminal_failure(self.o,self.f.profile,'0'*64,100_000_000_000));p=copy.deepcopy(self.f.profile);p['original_birth_monotonic_ns']+=1;self.assertIsNone(r.terminal_failure(self.o,p,self.f.digest,100_000_000_000))
 def test_missing_positive_closure_does_not_classify(self):
  for key in ('closed_monotonic_ns','service_runner_exit_code','terminal_unit_observation','cgroup_absent_or_empty'):
   value=copy.deepcopy(self.v);value.pop(key);self.f.save(self.o,value);self.assertIsNone(self.failure())
 def test_unknown_or_nonterminal_state_does_not_classify(self):
  for state in ('QUERY_UNAVAILABLE','active','activating',None):
   value=copy.deepcopy(self.v);value['terminal_unit_observation']['ActiveState']=state;self.f.save(self.o,value);self.assertIsNone(self.failure())
 def test_live_pid_or_cgroup_does_not_classify(self):
  for key,val in [('MainPID','999'),('ControlGroup',self.f.profile['slice_cgroup']+'/other.service')]:
   value=copy.deepcopy(self.v);value['terminal_unit_observation'][key]=val;self.f.save(self.o,value);self.assertIsNone(self.failure())
 def test_future_closure_does_not_classify(self):self.assertIsNone(self.failure(now=self.f.profile['original_birth_monotonic_ns']+2_000_000_000))
 def test_missing_intent_and_false_readiness_preserve_future_wait(self):
  self.intent.unlink();clock=[100.0];polls=[]
  def poll(duration):polls.append(duration);clock[0]=571
  with self.assertRaisesRegex(TimeoutError,'Original native stop before resource gates'):r.wait_for_resource_gates([self.o],self.f.profile,self.f.digest,571,poll,now=lambda:clock[0],now_ns=lambda:int(clock[0]*1e9))
  self.assertEqual(polls,[.1])
 def test_pending_record_can_become_ready(self):
  self.v.pop('closed_monotonic_ns');self.f.save(self.o,self.v);polls=[]
  def poll(duration):polls.append(duration);self.v['verified_before_command_exec']=True;self.f.save(self.o,self.v)
  r.wait_for_resource_gates([self.o],self.f.profile,self.f.digest,571,poll,now=lambda:100,now_ns=lambda:100_000_000_000);self.assertEqual(polls,[.1])
 def test_original_deadline_precedes_late_closure_classification(self):
  with self.assertRaisesRegex(TimeoutError,'Original native stop'):r.wait_for_resource_gates([self.o],self.f.profile,self.f.digest,571,lambda _:None,now=lambda:571,now_ns=lambda:571_000_000_000)
 def test_owner_intent_is_single_write_and_bounded_alias_denied(self):
  with self.assertRaises(FileExistsError):r.write_owner_intent(self.f.profile,self.f.path,self.o['record_path'],self.v['unit'],'native',1234,self.v['helper_cgroup'],self.v['immutable_stop_monotonic_ns'])
  alias=self.f.root/'alias.json';alias.symlink_to(self.o['record_path']);self.assertIsNone(r.bounded_record(alias))
 def test_production_protocol_mapping_uses_actual_parent_created_guard_pids(self):
  class Proc:pid=789
  class Backend:pid=456
  class Bridge:server={'name':'pm_boundary'};proc=Backend()
  fake=object.__new__(g.Protocol);fake.process=Proc();fake.output=self.f.root;fake.bridges=[Bridge()]
  owners=fake.resource_gate_owners();self.assertEqual([o['guard_pid'] for o in owners],[789,456]);self.assertEqual([o['component'] for o in owners],['native','pm_boundary'])
 def test_production_run_stops_before_goal_set_and_runs_existing_cleanup(self):
  root=self.f.root/'production';root.mkdir();ws=root/'workspace';ws.mkdir();(ws/'out').mkdir();prompt=ws/'TASK.md';prompt.write_text('SYNTHETIC control-only fixture');cli=root/'synthetic-cli';cli.write_text('NOT EXECUTABLE; no native process');cfg=root/'tools.json';cfg.write_text(json.dumps({'tool_allowlist':[],'mcp_servers':[]}));out=root/'native';calls=[];closed=[];birth=time.monotonic_ns();profile={'original_birth_monotonic_ns':birth,'original_total_stop_monotonic_ns':birth+600_000_000_000,'slice_cgroup':'/SYNTHETIC','aggregate_memory_max_bytes':2304*1024*1024};profile_path=root/'profile.json';profile_path.write_text(json.dumps(profile))
  class Process:
   def poll(self):return None
  class FakeProtocol:
   def __init__(self,node,cli,cwd,output,config):
    self.output=output;self.private=root/'private';self.telemetry=[];self.process=Process();f=Fixture(output,birth);f.profile=profile;f.path=profile_path;f.digest=r.sha(profile_path);self.owner,_,_=f.owner(guard_pid=999)
   def request(self,method,params,timeout):
    calls.append((method,params.get('action')))
    if method=='session/goal' and params.get('action')=='set':raise AssertionError('No Goal set may be reached')
    if method=='workspace/updateProviderRegistry':return {'status':'applied'}
    if method=='session/create':return {'snapshot':{'session':{'sessionId':'SYNTHETIC-NO-NATIVE-SESSION'}}}
    if method=='session/read':return {'settings':{'model':{'current':{'providerId':'builtin:zai-coding-plan','modelId':'GLM-5.3-Flash'}},'thoughtLevel':{'current':'max'}}}
    return {}
   def resource_gate_owners(self):return [self.owner]
   def poll(self,seconds):raise AssertionError('Positive closure must not wait')
   def close(self):closed.append(True);return {'native_quiescent':True}
  args=argparse.Namespace(birth_monotonic_ns=birth,max_seconds=600,max_responses=60,workspace=str(ws),out=str(out),prompt_file=str(prompt),tools_config=str(cfg),cli=str(cli),node='/usr/bin/python3',job_id='SYNTHETIC-NO-NATIVE',desktop_config='UNREAD',resource_profile=str(profile_path),probe=False)
  # Closure follows birth by1ns for a completed synthetic record available now.
  original_owner=Fixture.owner
  def immediate_owner(f,*a,**k):
   o,v,i=original_owner(f,*a,**k);v['closed_monotonic_ns']=birth+1;f.save(o,v);return o,v,i
  with patch.object(Fixture,'owner',immediate_owner),patch.object(g,'CLI_SHA',hashlib.sha256(cli.read_bytes()).hexdigest()),patch.object(g.ns,'desktop_registry',return_value={}),patch.object(g.profile,'load',return_value=profile),patch.object(g.profile,'close_components',return_value={'all_components_quiet':True}),patch.object(g.profile.reader,'kernel',return_value={'memory.events':{}}),patch.object(g.ns,'capture_native_io',return_value={'actual_models':[]}),patch.object(g.ns,'capture_provider_usage',return_value={'scope':'SYNTHETIC ONLY'}):
   result=g.run(args,protocol_factory=FakeProtocol)
  self.assertEqual(result['error_class'],'OwnedComponentReadinessTerminated');self.assertEqual(result['pre_goal_readiness_failure']['backend_immediate_termination_cause'],'UNKNOWN');self.assertNotIn(('session/goal','set'),calls);self.assertEqual(closed,[True]);self.assertTrue(result['resource_components_quiet']);self.assertNotIn('goal_submitted',result)

if __name__=='__main__':unittest.main(verbosity=2)
