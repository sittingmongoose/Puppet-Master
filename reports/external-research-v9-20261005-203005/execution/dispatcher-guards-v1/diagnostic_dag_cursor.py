"""Register finite declared dependent roles without inventing candidate bytes."""
import json
from pathlib import Path
import dispatch
BOX_SHA='505a561e2ae1e36522677c66041fc35d75519a25822636a5e83d1e43eb0d9856'
def register(lab,state):
 box=lab/'dev/diagnostic-runner/seed-recovery/CORRECTED_DAG_OUTBOX.json'
 if dispatch.sha(box)!=BOX_SHA:raise ValueError('Corrected finite DAG pin drift')
 by_id={r['job_id']:r for r in state['jobs']};mapping={r['software_predecessor_unstarted']:r['job_id'] for r in state['jobs'] if r.get('software_predecessor_unstarted')};added=[]
 for pointer in json.loads(box.read_text())['base_only_pairs']:
  plan_path=Path(pointer['path'])
  if dispatch.sha(plan_path)!=pointer['sha256']:raise ValueError('Finite role plan drift')
  plan=json.loads(plan_path.read_text())
  for step in plan['stage_jobs']:
   if not step['prerequisite_job_ids']:continue
   original=step['job_id']
   if original in by_id:continue
   actual_priors=[mapping.get(v,v) for v in step['prerequisite_job_ids']]
   failed=next((v for v in actual_priors if by_id.get(v,{}).get('status','').startswith(('FAILED','BLOCKED','UNCERTAIN'))),None)
   row=dict(step);row.update(pair_id=plan['pair_id'],source_slot=plan['pair_id'],track='DIAGNOSTIC',status='BLOCKED_PREDECESSOR_FAILED' if failed else 'WAITING_DEPENDENT_DESCRIPTOR',prerequisite_job_ids=actual_priors,declared_original_prerequisite_job_ids=step['prerequisite_job_ids'],declared_plan={'path':str(plan_path),'sha256':pointer['sha256']},native_goal_starts=0,observed_family='UNKNOWN',evaluation_status='NOT_READY',valid_full_pipeline_credit=False)
   if failed:row['blocked_by']=failed
   state['jobs'].append(row);by_id[original]=row;added.append(original)
 if added:
  dispatch.atomic(lab/'state/jobs.json',state);dispatch.event(lab,'FINITE_DIAGNOSTIC_DEPENDENT_ROLES_REGISTERED',job_ids=added,new_native_starts=0,missing_descriptor_does_not_block_independent_jobs=True)
 return added
if __name__=='__main__':
 lab=Path.cwd();print(register(lab,json.loads((lab/'state/jobs.json').read_text())))
