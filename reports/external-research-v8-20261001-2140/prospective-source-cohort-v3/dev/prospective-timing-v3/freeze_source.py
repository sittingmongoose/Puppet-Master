"""Positive source closure only; never changes frozen predecessors or releases."""
import ast, datetime, difflib, hashlib, json, pathlib
HERE=pathlib.Path(__file__).resolve().parent;LAB=HERE.parents[1];CASES=LAB/'cases/prospective-timing-v3';OLD=LAB/'dev/resume-execution-v2'
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def record(p):return {'path':str(p),'sha256':sha(p)}
def write(p,v):p.write_text(json.dumps(v,indent=2)+'\n')
def main():
 line=json.loads((HERE/'LINEAGE.json').read_text())
 for p,pin in line['predecessor_sha256'].items():
  if sha(p)!=pin:raise ValueError('predecessor drift: '+p)
 old_freeze=OLD/'integrated-controller/SOURCE_FREEZE.json';old=json.loads(old_freeze.read_text())
 closure=dict(old['closure_sha256'])
 for p,pin in closure.items():
  if sha(p)!=pin:raise ValueError('unchanged boundary drift: '+p)
 for p in [HERE/'INPUT_MAP.json',HERE/'OBJECTIVES.json',HERE/'candidate_inputs.py',HERE/'recovery-control.json',*(HERE/'integrated-controller').glob('*.py')]:closure[str(p)]=sha(p)
 for p in HERE.rglob('*.py'):ast.parse(p.read_text(),filename=str(p))
 controller=HERE/'integrated-controller/SOURCE_FREEZE.json'
 write(controller,{'schema':'er8.integrated-controller.prospective-timing-freeze.v1','version':'prospective-timing-v3','status':'SOURCE_ONLY_ROOT_RELEASE_AND_ACCEPTANCE_REQUIRED','frozen_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'closure_sha256':closure,'previous_controller':record(old_freeze),'entry':str(HERE/'integrated-controller/rolling.py'),'campaign_deadline_epoch':1791013030.8303788,'declared_caps':{'research':1200,'critic':1200,'correction':900,'case_wall':3600,'case_occupied':5400,'outside_native':300,'responses_per_stage':160},'native_ledger_privacy_deadline_sources_unchanged':True,'runtime_behavior_delta':'Only common.ROLES; control selects additive12-case map and queue. Wholecase and native gates unchanged.','native_goal_starts_by_author':0,'provider_calls_by_author':0,'case_births_by_author':0})
 mapping=json.loads((HERE/'INPUT_MAP.json').read_text())['cases'];planning={};case_closure={str(p):sha(p) for p in CASES.rglob('*') if p.is_file()}
 for item in mapping.values():
  manifest=pathlib.Path(item['manifest']);m=json.loads(manifest.read_text());root=pathlib.Path(item['root']);directory=pathlib.Path(item['case_dir'])
  needed=[HERE/'INPUT_MAP.json',pathlib.Path(item['objectives']),manifest,root/m['brief'],root/m['thin_plan'],root/m['source_access'],directory/'METHOD.md',directory/'TASK.md',*(root/s['task_template'] for s in m['stages'])]
  for p in needed:planning[str(p)]=sha(p)
 case_freeze=HERE/'CASE_SOURCE_FREEZE.json'
 write(case_freeze,{'schema':'er8.prospective-timing.case-source-freeze.v1','status':'SOURCE_ONLY_UNSTARTED12_ASSIGNMENTS','case_source_sha256':case_closure,'planning_input_sha256':planning,'lineage':record(HERE/'LINEAGE.json'),'case_queue':list(mapping)})
 release=json.loads((LAB/'ops/execution-resume-v1/root-production-release-v4.json').read_text())
 patch={'schema':'er8.prospective-timing.root-integration-proposal.v1','accepted':False,'root_authority':False,'launch_authority':'NONE_SOURCE_ONLY','predecessor_release':record(LAB/'ops/execution-resume-v1/root-production-release-v4.json'),'fields_to_replace_in_new_root_release':{'controller_snapshot':record(controller),'production_entry':str(HERE/'integrated-controller/rolling.py'),'case_sources':mapping,'case_queue':list(mapping),'allowed_jobs':release['allowed_jobs'],'planning_input_sha256':planning},'selected_positive_files_to_add':{p:pin for p,pin in closure.items() if p not in release['selected_positive_files']},'field_requiring_root_new_independent_source_acceptance':'controller_acceptance','unchanged_fields':['route','pins','config','route_snapshot','execution_snapshot','route_acceptance','execution_acceptance','canary_review','capture_binding','pair_bindings','resume_ledger','resume_authority','campaign_start_epoch','campaign_deadline_epoch','outside_native_cap_seconds','max_component_responses'],'max_component_seconds_note':'Existing1800 ceiling may remain; actual stage declarations are1200/1200/900. No route review/cap change required.','launch_precondition':'Root must recheck botharms of allsixpairs entirely unstarted, current owned production quiet and clean, allpredecessor/closure hashes valid, controller accepted, unchanged reservations/clock/usage gates admit fullcaps. No changes to priorbornjobs or V4.'}
 write(HERE/'ROOT_RELEASE_PATCH.json',patch)
 diffs=[]
 for p in (OLD/'integrated-controller').glob('*.py'):
  q=HERE/'integrated-controller'/p.name
  if p.read_bytes()!=q.read_bytes():diffs.extend(difflib.unified_diff(p.read_text().splitlines(True),q.read_text().splitlines(True),fromfile=str(p),tofile=str(q)))
 diffs.extend(difflib.unified_diff((OLD/'recovery-control.json').read_text().splitlines(True),(HERE/'recovery-control.json').read_text().splitlines(True),fromfile=str(OLD/'recovery-control.json'),tofile=str(HERE/'recovery-control.json')))
 (HERE/'CONTROLLER_DIFF.patch').write_text(''.join(diffs))
 support=[p for p in HERE.iterdir() if p.is_file() and p.name!='SOURCE_FREEZE.json']
 write(HERE/'SOURCE_FREEZE.json',{'schema':'er8.prospective-timing.source-bundle.v1','status':'FROZEN_SOURCE_ONLY_NO_LAUNCH_AUTHORITY','frozen_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'original_helper_deadline_epoch':1790987840.291780,'controller_snapshot':record(controller),'case_source_freeze':record(case_freeze),'positive_source_bundle_sha256':{str(p):sha(p) for p in sorted(support)},'unchanged_dependencies_sha256':{p:pin for p,pin in closure.items() if not pathlib.Path(p).is_relative_to(HERE)},'native_goal_starts_by_author':0,'provider_calls_by_author':0,'ledger_transactions_by_author':0,'case_births_by_author':0,'governing_caps':[1200,1200,900,3600,5400,300,160]})
 print(json.dumps({'controller_snapshot':record(controller),'source_freeze':record(HERE/'SOURCE_FREEZE.json'),'case_source_freeze':record(case_freeze),'root_release_patch':record(HERE/'ROOT_RELEASE_PATCH.json')},indent=2))
if __name__=='__main__':main()
