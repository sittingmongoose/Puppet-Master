"""Consume frozen owned-resource and assessment facts, never rewrite grades."""
import json
from pathlib import Path
import dispatch

def consume(lab,state):
 changed=False;idx={r['job_id']:r for r in state['jobs']}
 selection=lab/'dev/luna-route/diagnosis-I05/OWNED_SCOPE_SUPPLEMENT_SELECTION.json'
 if selection.exists():
  if dispatch.sha(selection)!='9c78911e7be513b11c667c45c462c93b880912d492ded8e69b76af0315e2f6c6':raise ValueError('owned supplement selection drift')
  for fact in json.loads(selection.read_text())['rows']:
   p=Path(fact['supplement_path']);h=fact['supplement_file_sha256']
   if dispatch.sha(p)!=h:raise ValueError('owned scope proof drift')
   proof=json.loads(p.read_text())
   if not proof['all_owned_scopes_quiet'] or not proof['execution_units_quiet']:raise ValueError('owned scopes not positively quiet')
   row=idx[fact['job_id']]
   if row.get('owned_scope_supplement'):continue
   row.update(permit_release_confirmed=True,owned_scope_supplement={'path':str(p),'sha256':h});changed=True
   dispatch.event(lab,'OWNED_RESOURCE_RELEASE_BY_EXACT_SCOPE_SUPPLEMENT',job_id=row['job_id'],original_status=row['status'],original_freeze_preserved=True)
 assignment=lab/'evaluation/dispatch/I02-research-review0001/ASSESSMENT_RECEIPTS.json'
 if assignment.exists():
  if dispatch.sha(assignment)!='0f3f8bcc0251658ffe68ab4ff0290080f0ef1263fa57f42b7e0e50a646acb1ae':raise ValueError('assessment metadata drift')
  blob=json.loads(assignment.read_text())
  if dispatch.sha(blob['finished']['path'])!=blob['finished']['sha256']:raise ValueError('finished assessment pin drift')
  for fact in blob['assignments']:
   row=idx[fact['job_id']]
   if row.get('assessment_complete'):continue
   row.update(assessment_complete=True,evaluation_status=fact['evaluation_status'],valid_full_pipeline_credit=False,assessment_receipt={'path':str(assignment),'sha256':dispatch.sha(assignment)});changed=True
   dispatch.event(lab,'ASSESSMENT_METADATA_CONSUMED',job_id=row['job_id'],evaluation_status=fact['evaluation_status'],operational_status_preserved=row['status'])
 assignment=lab/'evaluation/dispatch/I01-R001-research-review0001/ASSESSMENT_RECEIPTS.json'
 if assignment.exists():
  if dispatch.sha(assignment)!='c6f797a2562338f7a9fbe20abd77b730f319b83b44642ced7a45e263ca8c1eb6':raise ValueError('R001 status receipt drift')
  blob=json.loads(assignment.read_text())
  if dispatch.sha(blob['finished']['path'])!=blob['finished']['sha256']:raise ValueError('R001 finished pin drift')
  for fact in blob['assignments']:
   row=idx[fact['job_id']]
   if row.get('assessment_complete'):continue
   row.update(assessment_complete=True,evaluation_status=fact['evaluation_status'],valid_full_pipeline_credit=False,assessment_receipt={'path':str(assignment),'sha256':dispatch.sha(assignment)});changed=True
   dispatch.event(lab,'ASSESSMENT_METADATA_CONSUMED',job_id=row['job_id'],evaluation_status=fact['evaluation_status'],operational_status_preserved=row['status'])
 if changed:dispatch.atomic(lab/'state/jobs.json',state)
