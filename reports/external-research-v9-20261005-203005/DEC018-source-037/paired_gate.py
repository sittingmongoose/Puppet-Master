"""Ops-only post-native metadata/serialization gate; no corrected bytes output."""
from pathlib import Path
import json,hashlib
import prepare as owner
import syntax_gate
p=owner.p

def checked_file(item):
 path=Path(item['path'])
 if path.is_symlink() or any(parent.is_symlink() for parent in path.parents) or not path.is_file() or path.stat().st_nlink!=1:raise ValueError('Regular authenticated exact artifact required')
 raw=path.read_bytes()
 if hashlib.sha256(raw).hexdigest()!=item['sha256'] or len(raw)!=item['bytes']:raise ValueError('Frozen artifact exact SHA/length')
 return raw

def evaluate(plan_ref):
 plan=p.checked(plan_ref)
 if plan.get('schema')!='er9.c04-paired-native-catalog-result-plan.v1':raise ValueError('Pinned paired native result plan')
 reg=p.checked(plan['registration_ref']);expected={r['job_id']:r for r in reg['stage_jobs'] if r['repair_donor'] is not None}
 if len(expected)!=2 or len(plan['result_rows'])!=2 or {r['job_id'] for r in plan['result_rows']}!=set(expected):raise ValueError('Both exact predeclared repair Goals required')
 donors={r['source']['arm']:r for r in owner.donors()};old_goal_ids={d.get('actual_goal_id') for d in donors.values()};normal=owner.module('strict_model',owner.ROOT.parent/'proof-model-normalizer-001/normalizer.py');results=[]
 for supplied in plan['result_rows']:
  row=expected[supplied['job_id']];freeze=p.checked(supplied['freeze_ref']);stage=p.checked(supplied['actual_stage_ref']);capsule=p.checked(supplied['capsule_ref']);matches=[x for x in capsule['rows'] if x['job_id']==row['job_id']]
  if len(matches)!=1:raise ValueError('One actual distinct native repair capsule')
  a=matches[0]
  if any(a.get(k)!=v or freeze.get(k)!=v or stage.get(k)!=v for k,v in {'job_id':row['job_id'],'pair_id':reg['pair_id'],'arm':row['arm'],'stage':'research'}.items()):raise ValueError('Exact repair current samearm identity')
  if a.get('observed_family')!='Z' or normal.observed_model(a.get('observed_model'))!='builtin:zai-coding-plan/GLM-5.3-Flash' or a.get('observed_effort')!='max':raise ValueError('Actual GLM Flash Max native actor')
  if a.get('native_goal_starts')!=1 or freeze.get('native_goal_starts')!=1 or a.get('native_goal_state') not in {'complete','COMPLETED'} or a.get('output_freeze')!=supplied['freeze_ref'] or a.get('origin_goal_id')!=freeze.get('goal_target_id') or not a.get('origin_goal_id'):raise ValueError('Distinct direct completed native Goal')
  if a.get('origin_goal_id') in old_goal_ids:raise ValueError('Never reuse or reset an original donor Goal')
  if freeze.get('operational_complete') is not True or freeze.get('native_quiescent') is not True:raise ValueError('Full completed and ownedquiet native repair required')
  release=p.checked(supplied['release_ref'])
  if release.get('all_private_slice_descendants_quiet') is not True or release.get('stop_returncode')!=0 or release.get('after',{}).get('ActiveState') not in {'inactive','failed'}:raise ValueError('Positive private release required')
  template=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
  if any(stage.get('glm_resource',{}).get(key)!=template['glm_resource'].get(key) for key in ['version','model','effort','source_pins','tools_config_builder','execution_enabled','public_get']):raise ValueError('Exact prospectively closed runtime/model/tool factors')
  if stage['max_seconds']!=600 or stage['max_responses']!=60 or stage['prompt_sha256']!=template['prompt_sha256'] or stage['required_artifacts']!=template['required_artifacts']:raise ValueError('Original NEW repair source/cap/Task binding')
  inventory={x['relative_path']:x for x in freeze['artifacts']};required={'research/'+n for n in owner.NAMES}
  if len(inventory)!=len(freeze['artifacts']) or set(inventory)!=required:raise ValueError('Full designated native research4 required')
  old={Path(x['relative_path']).name:checked_file(x) for x in donors[row['arm']]['required_research4']}
  new={Path(name).name:checked_file(inventory[name]) for name in required}
  outcome=syntax_gate.assess_research4(old,new)
  results.append({'job_id':row['job_id'],'arm':row['arm'],'native_goal_id':a['origin_goal_id'],'freeze_ref':supplied['freeze_ref'],'release_ref':supplied['release_ref'],
   'capsule_ref':supplied['capsule_ref'],'actual_stage_ref':supplied['actual_stage_ref'],'syntax_gate':outcome,'native_complete_full_quiet_release':True})
 passed=all(r['syntax_gate']['status'].startswith('PASS_') for r in results)
 return {'schema':'er9.c04-paired-native-catalog-gate-receipt.v1','plan_ref':plan_ref,'registration_ref':plan['registration_ref'],'pair_id':reg['pair_id'],
  'status':'PASS_BOTH' if passed else 'UNASSESSED_REJECT_PAIR','results':results,'both_current_new_native_complete_required':True,
  'source_semantics_restored':'UNASSESSED','scientific_quality':'UNASSESSED','new_logical_targets':0,'no_host_correction_or_native_calls':True}
