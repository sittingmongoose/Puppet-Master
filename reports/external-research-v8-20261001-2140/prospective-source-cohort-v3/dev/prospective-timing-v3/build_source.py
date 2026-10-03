"""One-shot additive source preparation. Never imports runtime or accounting."""
import copy, datetime, hashlib, json, pathlib, shutil
HERE=pathlib.Path(__file__).resolve().parent
LAB=HERE.parents[1]
CASES=LAB/'cases/prospective-timing-v3'
OLD=LAB/'dev/resume-execution-v2'
RELEASE=LAB/'ops/execution-resume-v1/root-production-release-v4.json'
ROLES={'research-proposal':1200,'independent-candidate-critic':1200,'final-correction':900}
def sha(p): return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def write(p,v):
 p.parent.mkdir(parents=True,exist_ok=True)
 p.write_text(json.dumps(v,indent=2)+'\n')
def main():
 if CASES.exists() or (HERE/'integrated-controller').exists(): raise ValueError('new additive source paths required')
 release=json.loads(RELEASE.read_text()); queue=release['case_queue']
 state=json.loads((LAB/'ops/accounting-v1/state.json').read_text())
 for c in queue:
  if c in state['cases'] or any(v['case']==c for v in state['jobs'].values()): raise ValueError('entirely unstarted case required')
  r=state['reservation_by_case'][c]
  if r['native_starts']!=3 or r['occupied_seconds']!=5400 or r['final_job']!=c+'-final-correction': raise ValueError('unchanged whole pipeline reservation required')
 source_map=json.loads((LAB/'dev/route-recovery-v2/INPUT_MAP.json').read_text())
 old_objectives=LAB/'dev/route-recovery-v2/OBJECTIVES.json'
 objectives=json.loads(old_objectives.read_text()); objectives['objectives']={k:v for k,v in objectives['objectives'].items() if k in release['allowed_jobs']}
 mapping={'schema':source_map['schema'],'cases':{}}; predecessors={str(RELEASE):sha(RELEASE),str(old_objectives):sha(old_objectives),str(LAB/'dev/route-recovery-v2/INPUT_MAP.json'):sha(LAB/'dev/route-recovery-v2/INPUT_MAP.json')}
 lineage={}; copied={}
 def preserve(src,dst):
  predecessors[str(src)]=sha(src);dst.parent.mkdir(parents=True,exist_ok=True)
  if dst.exists() and dst.read_bytes()!=src.read_bytes(): raise ValueError('inconsistent assigned input')
  shutil.copyfile(src,dst); copied[str(dst)]={'path':str(src),'sha256':sha(src)}
 for case in queue:
  old_item=source_map['cases'][case];root=pathlib.Path(old_item['root']); directory=pathlib.Path(old_item['case_dir'])
  manifest=pathlib.Path(old_item['manifest']); m=json.loads(manifest.read_text());predecessors[str(manifest)]=sha(manifest)
  new_dir=CASES/'candidates'/case;new_dir.mkdir(parents=True)
  for name in ('brief','thin_plan','source_access'): preserve(root/m[name],CASES/m[name])
  preserve(directory/'METHOD.md',new_dir/'METHOD.md')
  task=directory/'TASK.md';predecessors[str(task)]=sha(task)
  new_task=task.read_text().replace('Research ≤1800s; critic ≤600s; correction ≤600s;','Research ≤1200s; critic ≤1200s; correction ≤900s;')
  if new_task==task.read_text(): raise ValueError('exact predecessor time declaration required')
  (new_dir/'TASK.md').write_text(new_task)
  for stage in m['stages']:
   role=stage['reservation_id'][len(case)+1:];stage['seconds']=ROLES[role]
   p=root/stage['task_template'];dst=CASES/stage['task_template'];predecessors[str(p)]=sha(p)
   oldcap=1800 if role=='research-proposal' else 600
   text=p.read_text(); changed=text.replace(f'{oldcap} seconds',f'{ROLES[role]} seconds')
   if changed==text: raise ValueError('exact template time declaration required')
   dst.parent.mkdir(parents=True,exist_ok=True)
   if dst.exists() and dst.read_text()!=changed: raise ValueError('inconsistent task template')
   dst.write_text(changed)
   o=objectives['objectives'][stage['reservation_id']]
   o['objective']=o['objective'].replace(f'at most {oldcap}s ',f'at most {ROLES[role]}s ')
   o['characters']=len(o['objective'])
  m['caps'].update(research_proposal_seconds=1200,candidate_critic_seconds=1200,final_correction_seconds=900,summed_stage_hard_seconds=3300)
  write(new_dir/'manifest.json',m)
  item=copy.deepcopy(old_item);item.update(root=str(CASES),case_dir=str(new_dir),manifest=str(new_dir/'manifest.json'),objectives=str(HERE/'OBJECTIVES.json'))
  mapping['cases'][case]=item;lineage[case]={'immutable_predecessor':copy.deepcopy(old_item),'predecessor_manifest_sha256':sha(manifest),'pair_id':m['pair_id'],'arm':m['pair_arm']}
 write(HERE/'INPUT_MAP.json',mapping);write(HERE/'OBJECTIVES.json',objectives)
 # The source resolver is identical; its campaign-relative placement remains dev/<version>.
 preserve(LAB/'dev/route-recovery-v2/candidate_inputs.py',HERE/'candidate_inputs.py')
 for p in (OLD/'integrated-controller').glob('*.py'): preserve(p,HERE/'integrated-controller'/p.name)
 common=HERE/'integrated-controller/common.py';text=common.read_text()
 before="ROLES = [('research-proposal', 1800, 'PROPOSAL.md'),\n         ('independent-candidate-critic', 600, 'CRITIQUE.md'),\n         ('final-correction', 600, 'FINAL_PROPOSAL.md')]"
 after="ROLES = [('research-proposal', 1200, 'PROPOSAL.md'),\n         ('independent-candidate-critic', 1200, 'CRITIQUE.md'),\n         ('final-correction', 900, 'FINAL_PROPOSAL.md')]"
 if text.count(before)!=1: raise ValueError('exact controller predecessor required')
 common.write_text(text.replace(before,after));copied.pop(str(common))
 control=json.loads((OLD/'recovery-control.json').read_text());predecessors[str(OLD/'recovery-control.json')]=sha(OLD/'recovery-control.json')
 control['planning_map']=str(HERE/'INPUT_MAP.json');control['default_queue']=queue
 write(HERE/'recovery-control.json',control)
 for v in release['pair_bindings'].values(): predecessors[v['path']]=v['sha256']
 predecessor_freeze=OLD/'integrated-controller/SOURCE_FREEZE.json';predecessors[str(predecessor_freeze)]=sha(predecessor_freeze)
 write(HERE/'LINEAGE.json',{'schema':'er8.prospective-timing.lineage.v1','predecessor_release':{'path':str(RELEASE),'sha256':sha(RELEASE)},'predecessor_sha256':predecessors,'byte_identical_copies':copied,'cases':lineage})
 write(HERE/'UNSTARTED_OBSERVATION.json',{'observed_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'read-only filtered metadata; no activation, no state rewrite','case_queue':queue,'all_cases_absent':True,'all_case_job_counts_zero':True,'reservation_per_case':{'native_starts':3,'occupied_seconds':5400,'final_job':'<case>-final-correction'},'must_recheck_at_root_release_and_launch':True})
 print('Prepared additive12-case/36-stage timing declarations; no live runtime or ledger import')
if __name__=='__main__':main()
