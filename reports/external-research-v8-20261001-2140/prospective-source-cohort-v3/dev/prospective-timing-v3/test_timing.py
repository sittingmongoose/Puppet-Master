"""Auth-free source tests: temp packing, pure native plan construction, mocked gates.

No accounting imports or transactions, provider calls, subprocesses, runtime bodies,
platform/auth probing, release acceptance or campaign metadata writes.
"""
import ast, copy, hashlib, importlib.util, json, pathlib, sys, tempfile, types, unittest
from unittest.mock import patch
HERE=pathlib.Path(__file__).resolve().parent;LAB=HERE.parents[1]
CASES=LAB/'cases/prospective-timing-v3'
sys.path.insert(0,str(HERE/'integrated-controller'))
import common, stage_actor

def load(name,path):
 spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m

def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()

def extracted_ledger_functions():
 # Compile only these functions, never the module or transaction initializer.
 source=ast.parse((LAB/'ops/accounting-v1/slot_ledger.py').read_text())
 nodes=[n for n in source.body if isinstance(n,ast.FunctionDef) and n.name in ('positive_number','apply','occupied_commitments')]
 env={'time':types.SimpleNamespace(time=lambda:1000)}
 exec(compile(ast.Module(body=nodes,type_ignores=[]),'<pure-frozen-ledger-functions>','exec'),env)
 return env

class TimingTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.mapping=json.loads((HERE/'INPUT_MAP.json').read_text())['cases']
  cls.lineage=json.loads((HERE/'LINEAGE.json').read_text())
  cls.inputs=load('timing_inputs',HERE/'candidate_inputs.py')
  cls.adapter=load('frozen_adapter',LAB/'dev/route-recovery-v2/route-assembly-v1/adapter.py')
  cls.maker=load('pure_make_plan',LAB/'dev/route-recovery-v2/execution-path-v1/make_plan.py')
 def test_protected_predecessors_byte_identical(self):
  for p,pin in self.lineage['predecessor_sha256'].items(): self.assertEqual(sha(p),pin,p)
  for p,origin in self.lineage['byte_identical_copies'].items():self.assertEqual(sha(p),origin['sha256'],p)
 def test_controller_only_roles_changed(self):
  old=LAB/'dev/resume-execution-v2/integrated-controller'
  for p in old.glob('*.py'):
   text=p.read_text()
   if p.name=='common.py':
    text=text.replace("('research-proposal', 1800, 'PROPOSAL.md')","('research-proposal', 1200, 'PROPOSAL.md')").replace("('independent-candidate-critic', 600, 'CRITIQUE.md')","('independent-candidate-critic', 1200, 'CRITIQUE.md')").replace("('final-correction', 600, 'FINAL_PROPOSAL.md')","('final-correction', 900, 'FINAL_PROPOSAL.md')")
   self.assertEqual((HERE/'integrated-controller'/p.name).read_text(),text)
  self.assertEqual(common.STOP_EPOCH,1791013030.8303788)
  self.assertEqual([r[1] for r in common.ROLES],[1200,1200,900])
 def test_case_manifest_task_semantics_and_pair_caps(self):
  self.assertEqual(len(self.mapping),12); pairs={}
  for case,item in self.mapping.items():
   self.assertEqual(self.inputs.case_record(case,self.mapping),item)
   original=self.lineage['cases'][case]['immutable_predecessor'];old=json.loads(pathlib.Path(original['manifest']).read_text());new=json.loads(pathlib.Path(item['manifest']).read_text())
   expected=copy.deepcopy(old)
   for stage,cap in zip(expected['stages'],(1200,1200,900)):stage['seconds']=cap
   expected['caps'].update(research_proposal_seconds=1200,candidate_critic_seconds=1200,final_correction_seconds=900,summed_stage_hard_seconds=3300)
   self.assertEqual(new,expected)
   for index,stage in enumerate(new['stages']):
    oldcap=1800 if index==0 else 600
    self.assertEqual((pathlib.Path(item['root'])/stage['task_template']).read_text(),(pathlib.Path(original['root'])/stage['task_template']).read_text().replace(f'{oldcap} seconds',f"{stage['seconds']} seconds"))
   for name in ('brief','thin_plan','source_access'):self.assertEqual(sha(pathlib.Path(item['root'])/new[name]),sha(pathlib.Path(original['root'])/old[name]))
   directory=pathlib.Path(item['case_dir']);old_dir=pathlib.Path(original['case_dir'])
   self.assertEqual(sha(directory/'METHOD.md'),sha(old_dir/'METHOD.md'))
   self.assertEqual((directory/'TASK.md').read_text(),(old_dir/'TASK.md').read_text().replace('Research ≤1800s; critic ≤600s; correction ≤600s;','Research ≤1200s; critic ≤1200s; correction ≤900s;'))
   pairs.setdefault(new['pair_id'],[]).append(new)
   self.assertEqual(sum(s['seconds'] for s in new['stages'])+new['caps']['host_overhead_hard_seconds'],3600)
   self.assertLessEqual(3300+300,new['caps']['case_occupied_hard_seconds'])
  self.assertEqual(len(pairs),6)
  for rows in pairs.values():self.assertEqual(len(rows),2);self.assertEqual(rows[0]['caps'],rows[1]['caps'])
 def test_all_36_objectives_and_actual_frozen_adapter_packing_agree(self):
  old=json.loads((LAB/'dev/route-recovery-v2/OBJECTIVES.json').read_text())['objectives']
  new=json.loads((HERE/'OBJECTIVES.json').read_text())['objectives'];self.assertEqual(len(new),36)
  with tempfile.TemporaryDirectory() as raw:
   for case,item in self.mapping.items():
    m=json.loads(pathlib.Path(item['manifest']).read_text())
    for index,stage in enumerate(m['stages']):
     job=stage['reservation_id'];cap=stage['seconds'];oldcap=1800 if index==0 else 600
     expected=old[job]['objective'].replace(f'at most {oldcap}s ',f'at most {cap}s ')
     self.assertEqual(new[job]['objective'],expected);self.assertEqual(new[job]['characters'],len(expected))
     ws=pathlib.Path(raw)/(job+'-workspace');prompt=pathlib.Path(raw)/(job+'-objective.md')
     result=self.adapter.pack_stage(case_id=case,reservation_id=job,workspace=ws,prompt_file=prompt,case_birth_ns=1,stage_birth_ns=2,assigned_sources=self.mapping)
     task=(ws/'TASK.md').read_text();self.assertIn(f'at most {cap} seconds',task.lower())
     self.assertEqual(prompt.read_text(),expected.replace('input/','inputs/')+'\n')
     self.assertEqual(result['prompt_sha256'],sha(prompt))
     self.assertEqual(set(p.name for p in (ws/'inputs').iterdir()),{'TASK.md','BRIEF.md','THIN_PLAN.md','METHOD.md'})
 def test_full_cap_fit_and_no_clipping_before_ledger(self):
  class LedgerReached(Exception):pass
  case=next(iter(self.mapping));birth=100
  def args(stage,campaign):
   return types.SimpleNamespace(root_release='offline',case=case,role='final-correction',cap=900,artifact='FINAL_PROPOSAL.md',stage_ns=stage,case_ns=birth,campaign_ns=campaign,deadline_ns=common.deadline(stage,900,birth,campaign),run_root='/unused',stage_epoch=100,case_epoch=1)
  with patch.object(stage_actor,'armed'),patch.object(stage_actor,'read_json',return_value={'route':'offline','pins':{}}),patch.object(stage_actor,'check_release'),patch.object(stage_actor,'check_planning'),patch.object(stage_actor,'QUEUE',[case]),patch.object(stage_actor,'ledger_module',side_effect=LedgerReached),patch.object(stage_actor,'load',return_value=types.SimpleNamespace(source_access=lambda *a:'/offline/source-access.json')):
   # Equal edge fits in full; next nanosecond is rejected, never silently clipped.
   with self.assertRaises(LedgerReached):stage_actor.run(args(birth+2700*10**9,birth+4000*10**9))
   with self.assertRaisesRegex(ValueError,'whole original component cap'):stage_actor.run(args(birth+2700*10**9+1,birth+4000*10**9))
   with self.assertRaisesRegex(ValueError,'whole original component cap'):stage_actor.run(args(birth+2400*10**9,birth+3299*10**9))
 def test_unchanged_native_plan_accepts_declared_caps_rejects_4500(self):
  for cap in (1200,900):
   clock={'case_id':'offline','case_start_monotonic_ns':1,'case_elapsed_cap_seconds':3600,'case_occupied_cap_seconds':5400,'outside_native_cap_seconds':300,'campaign_native_cutoff_monotonic_ns':10000*10**9,'stages':{'offline':{'stage_start_monotonic_ns':1,'cap_seconds':cap,'response_cap':160}}}
   kwargs=dict(stage_id='offline',start_ns=1,cap_seconds=cap,response_cap=160,workspace='/offline/ws',prompt='/offline/prompt',native_out='/offline/out',label='offline',admission='/offline/admission',boundary_acceptance={},plan_path='/offline/plan',case_authority={'path':'/offline/clock','sha256':'0'*64,'clock':clock},v8_stage_role='integrated',v8_canary_review={'dummy':True},route_snapshot={'dummy':True},route_acceptance={'dummy':True},assembly_binding={k:{'path':'/offline/'+k,'sha256':'0'*64} for k in ('config','lease','case_binding','acceptance')})
   plan=self.maker.construct(**kwargs);self.assertEqual(plan['cap_seconds'],cap);self.assertEqual(plan['deadline_monotonic_ns'],1+cap*10**9)
   clock['case_elapsed_cap_seconds']=4500
   with self.assertRaisesRegex(ValueError,'original case limits'):self.maker.construct(**kwargs)
 def test_frozen_closure_and_real_planning_gate(self):
  bundle=json.loads((HERE/'SOURCE_FREEZE.json').read_text())
  for p,pin in bundle['positive_source_bundle_sha256'].items():self.assertEqual(sha(p),pin,p)
  controller=json.loads((HERE/'integrated-controller/SOURCE_FREEZE.json').read_text())
  for p,pin in controller['closure_sha256'].items():self.assertEqual(sha(p),pin,p)
  declaration=json.loads((HERE/'CASE_SOURCE_FREEZE.json').read_text())
  self.assertEqual(set(declaration['case_source_sha256']),{str(p) for p in CASES.rglob('*') if p.is_file()})
  for p,pin in declaration['case_source_sha256'].items():self.assertEqual(sha(p),pin,p)
  proposal=json.loads((HERE/'ROOT_RELEASE_PATCH.json').read_text())
  self.assertFalse(proposal['accepted']);self.assertFalse(proposal['root_authority'])
  release=proposal['fields_to_replace_in_new_root_release']
  for case in self.mapping:
   manifest=common.check_planning(release,case)
   self.assertEqual([s['seconds'] for s in manifest['stages']],[r[1] for r in common.ROLES])
 def test_no_born_case_or_job_rewrite_and_occupied_reservation_unchanged(self):
  env=extracted_ledger_functions();state={'cases':{'born':{'wall_seconds':3600,'original':True}},'jobs':{'born-research-proposal':{'frozen':True}},'clock_start_epoch':1,'reservation_by_case':{}}
  before=copy.deepcopy(state)
  with self.assertRaisesRegex(RuntimeError,'case birth never reset'):env['apply'](state,'case-birth',{'case':'born','wall_seconds':3600,'occupied_seconds':5400})
  self.assertEqual(state,before)
  with self.assertRaisesRegex(ValueError,'invalid prospective cap'):env['apply'](state,'case-birth',{'case':'new','wall_seconds':4500,'occupied_seconds':5400})
  self.assertEqual(state,before)
  env['apply'](state,'case-birth',{'case':'new','wall_seconds':3600,'occupied_seconds':5400,'outside_native_cap_seconds':300})
  self.assertEqual(state['jobs'],before['jobs']);self.assertEqual(state['cases']['born'],before['cases']['born'])
  reserved={'reservation_by_case':{'unstarted':{'native_starts':3,'occupied_seconds':5400,'completed':False}},'jobs':{}}
  self.assertEqual(env['occupied_commitments'](reserved,1000),5400)
  self.assertEqual(env['occupied_commitments'](reserved,1000,'unstarted',1200,0),5400)

if __name__=='__main__':unittest.main(verbosity=2)
