"""Closed DEC018 operator binding; source gate is mandatory before descendants."""
import json,subprocess
from pathlib import Path
import dispatch
import export_goal_identity_capsules as capsules
import export_closed_source_context_v2 as captures

def checked(ref):
 assert dispatch.sha(ref['path'])==ref['sha256'];return json.loads(Path(ref['path']).read_text())
def call(entry,fn,ref):
 code="import sys,json;sys.path.insert(0,sys.argv[1]);m=__import__(sys.argv[2]);print(json.dumps(getattr(m,sys.argv[3])(json.loads(sys.argv[4]))))"
 z=subprocess.run(['/usr/bin/python3','-B','-c',code,str(Path(entry['path']).parent),Path(entry['path']).stem,fn,json.dumps(ref)],capture_output=True,text=True,timeout=40)
 if z.returncode:raise ValueError(z.stderr[-1500:])
 return json.loads(z.stdout)
def observe(lab,state):
 idx={r['job_id']:r for r in state['jobs']};changed=[]
 for candidate in state['jobs']:
  cfg=candidate.get('dec018_source_binding')
  if not cfg or candidate.get('repair_donor') is not None or candidate['status']!='WAITING_RUNTIME_BINDING':continue
  req=checked(cfg['registration_ref']);repairids=[r['job_id'] for r in req['stage_jobs'] if r['repair_donor'] is not None]
  if all(idx[j].get('permit_release_confirmed') is True and idx[j]['status'] in ['COMPLETED','FAILED'] for j in repairids) and any(idx[j]['status']=='FAILED' for j in repairids):
   candidate.update(status='BLOCKED_DEC018_PAIRED_NATIVE_REPAIR_FAILED',blocked_by_paired_repairs=repairids);changed.append(candidate['job_id']);dispatch.event(lab,'DEC018_BOTH_CONTINUATIONS_BLOCKED_BY_PAIRED_NATIVE_REPAIR',job_id=candidate['job_id'],native_calls=0)
 for row in state['jobs']:
  cfg=row.get('dec018_source_binding')
  if not cfg or row.get('dec018_role_bound') or row.get('dec018_binding_blocker') or row['status']!='WAITING_RUNTIME_BINDING':continue
  req=checked(cfg['registration_ref']);source=next(r for r in req['stage_jobs'] if r['job_id']==row['job_id']);ids=source['all_same_arm_prior_job_ids']
  if any(idx[j]['status']!='COMPLETED' or idx[j].get('permit_release_confirmed') is not True for j in ids):continue
  try:
   pin=checked(cfg['pin_ref'])
   for p,h in pin['source_pins'].items():assert dispatch.sha(p)==h
   home=lab/'ops/dispatcher/DEC018_ROLE_BIRTH'/row['job_id'];home.mkdir(parents=True,exist_ok=True)
   plan={'schema':'er9.actual-role-birth-binding-plan.v1','native_goal_starts':0,'launch_intents':0,'registration_ref':cfg['registration_ref'],'job_id':row['job_id'],'arm':row['arm'],'origin_job_ids':ids,'destination_root':str(lab/'ops/dispatcher/role-birth'/row['job_id']/'actual-source-bound-dec018')}
   if source['repair_donor'] is None:
    repairs=[r for r in req['stage_jobs'] if r['repair_donor'] is not None]
    if any(idx[r['job_id']]['status']!='COMPLETED' or idx[r['job_id']].get('permit_release_confirmed') is not True for r in repairs):continue
    gatehome=lab/'ops/dispatcher/DEC018_PAIRED_GATE';gatehome.mkdir(exist_ok=True);cap=gatehome/'CAPSULES.json'
    if not cap.exists():capsules.export(lab,[r['job_id'] for r in repairs],cap)
    gplan={'schema':'er9.c04-paired-native-catalog-result-plan.v1','registration_ref':cfg['registration_ref'],'result_rows':[]}
    for rr in repairs:
     actual=idx[rr['job_id']];gplan['result_rows'].append({'job_id':rr['job_id'],'freeze_ref':{'path':actual['freeze_path'],'sha256':dispatch.sha(actual['freeze_path'])},'actual_stage_ref':{'path':actual['stage_json'],'sha256':dispatch.sha(actual['stage_json'])},'capsule_ref':{'path':str(cap),'sha256':dispatch.sha(cap)},'release_ref':actual['private_slice_release']})
    gp=gatehome/'PLAN.json';dispatch.atomic(gp,gplan);gref={'path':str(gp),'sha256':dispatch.sha(gp)}
    try:receipt=call(pin['paired_gate_entrypoint'],'evaluate',gref)
    except ValueError:
     denial=gatehome/'GATE_UNKNOWN_REJECTION.json';dispatch.atomic(denial,{'observed_utc':dispatch.now(),'plan_ref':gref,'status':'UNASSESSED_REJECT_PAIR','reason':'Exact source paired gate could not positively establish PASS_BOTH; no promotion','source_gate_ref':pin['paired_gate_entrypoint'],'native_calls':0})
     for pending in state['jobs']:
      if pending.get('pair_id')==row['pair_id'] and pending.get('dec018_source_binding') and pending.get('repair_donor') is None and pending['status']=='WAITING_RUNTIME_BINDING':
       pending.update(status='BLOCKED_DEC018_PAIRED_GATE_UNASSESSED',paired_repair_gate_rejection_ref={'path':str(denial),'sha256':dispatch.sha(denial)});changed.append(pending['job_id'])
     continue
    gr=gatehome/'RECEIPT.json'
    if not gr.exists():dispatch.atomic(gr,receipt)
    else:assert checked({'path':str(gr),'sha256':dispatch.sha(gr)})==receipt
    if receipt['status']!='PASS_BOTH':
     for pending in state['jobs']:
      if pending.get('pair_id')==row['pair_id'] and pending.get('dec018_source_binding') and pending.get('repair_donor') is None and pending['status']=='WAITING_RUNTIME_BINDING':
       pending.update(status='BLOCKED_DEC018_PAIRED_SYNTAX_GATE',paired_repair_gate_receipt_ref={'path':str(gr),'sha256':dispatch.sha(gr)});changed.append(pending['job_id'])
     continue
    plan['paired_repair_gate_receipt_ref']={'path':str(gr),'sha256':dispatch.sha(gr)}
    ancestry=home/'CAPSULES.json';capsules.export(lab,ids,ancestry);contexts=[]
    for j in ids:
     prior=idx[j];spec=json.loads(Path(prior['stage_json']).read_text());context=home/(j+'-CLOSED_CONTEXT.json');captures.build(lab,j,Path(spec['glm_resource']['capture_dir']),Path(spec['glm_resource']['evidence_dir'])/'events.jsonl',context);contexts.append({'path':str(context),'sha256':dispatch.sha(context)})
    plan.update(capsule_ref={'path':str(ancestry),'sha256':dispatch.sha(ancestry)},closed_source_context_refs=contexts)
   pp=home/'PLAN.json';dispatch.atomic(pp,plan);receiptref=call(pin['entrypoint'],'bind',{'path':str(pp),'sha256':dispatch.sha(pp)});receipt=checked(receiptref);spec=checked(receipt['stage_ref'])
   row.update(prepared_stage_json=receipt['stage_ref']['path'],prepared_stage_sha256=receipt['stage_ref']['sha256'],dec018_role_bound=receiptref,all_same_arm_prior_job_ids=[],prerequisite_job_ids=[],glm_resource_override=spec['glm_resource'],final_bundle_selection_pending=False,actual_role_binding_pending=False)
   changed.append(row['job_id'])
  except Exception as e:
   row['dec018_binding_blocker']=str(e)[-1600:];changed.append(row['job_id']);dispatch.event(lab,'DEC018_SOURCE_BINDING_BLOCKED',job_id=row['job_id'],error_class=type(e).__name__,native_calls=0)
 if changed:dispatch.atomic(lab/'state/jobs.json',state)
 return changed
