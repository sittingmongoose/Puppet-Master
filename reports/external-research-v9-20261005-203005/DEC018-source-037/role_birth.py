"""Ops-only strict new role inputs; failed old donor exception limited to repair."""
import copy,json
from pathlib import Path
import prepare as owner
import paired_gate
p=owner.p

def normalized_constructor():
 directory=owner.ROOT.parent/'proof-model-normalizer-001';pin=p.checked(owner.NORMALIZER)
 for path,digest in pin['source_pins'].items():
  if p.sha(path)!=digest:raise ValueError('Frozen strict constructor source drift')
 import sys
 previous=sys.modules.get('normalizer');sys.modules['normalizer']=owner.module('model_normalizer',directory/'normalizer.py')
 try:return owner.module('original_strict_native_constructor',directory/'role_birth.py')
 finally:
  if previous is None:sys.modules.pop('normalizer',None)
  else:sys.modules['normalizer']=previous

def bind(plan_ref):
 plan=p.checked(plan_ref)
 if plan.get('schema')!='er9.actual-role-birth-binding-plan.v1' or plan.get('native_goal_starts')!=0 or plan.get('launch_intents')!=0:raise ValueError('Explicit actual unentered NEW birth plan required')
 reg=p.checked(plan['registration_ref']);row=next(r for r in reg['stage_jobs'] if r['job_id']==plan['job_id']);source=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
 if plan['arm']!=row['arm'] or plan['origin_job_ids']!=row['all_same_arm_prior_job_ids']:raise ValueError('Exact declared source identity')
 destination=Path(plan['destination_root']).absolute()
 if not any(root in destination.parents for root in [owner.ROOT,p.LAB/'ops/dispatcher/role-birth']) or destination.exists() or any(x.is_symlink() for x in [destination,*destination.parents]):raise ValueError('Fresh confined original NEW birth lane')
 repair=row['repair_donor'] is not None
 if not repair:
  pairreceipt=p.checked(plan['paired_repair_gate_receipt_ref']);rechecked=paired_gate.evaluate(pairreceipt['plan_ref'])
  if rechecked!=pairreceipt or pairreceipt['status']!='PASS_BOTH' or pairreceipt['registration_ref']!=plan['registration_ref']:raise ValueError('Both exact paired native repairs and gate PASS before any continuation')
 ws=destination/'workspace';(ws/'inputs').mkdir(parents=True);(ws/'out').mkdir();task=ws/'TASK.md';p.clone_bytes(source['prompt_file'],task,source['prompt_sha256'],source['workspace']);pins={};neutral={}
 for path,digest in source['input_pins'].items():
  rel=Path(path).relative_to(source['workspace']);p.clone_bytes(path,ws/rel,digest,source['workspace']);pins[str(ws/rel)]=digest;neutral[rel.as_posix()]=digest
 if repair:
  donors=owner.donors();donor=next(d for d in donors if d['source']['arm']==row['arm'])
  if donor!=row['repair_donor']:raise ValueError('Immutable preclosed exact current donor')
  for artifact in donor['required_research4']:
   name=Path(artifact['relative_path']).name;relative='inputs/original_research/'+name;original=Path(artifact['path'])
   if original.stat().st_size!=artifact['bytes']:raise ValueError('Exact authored donor length')
   p.clone_bytes(original,ws/relative,artifact['sha256'],original.parent);pins[str(ws/relative)]=artifact['sha256']
  imports={'source_donor':donor,'native_failed_donor_remains_failed':True,'scope':'Only current native authored research4 bytes for native mechanical copying/serialization'}
 else:
  strict=normalized_constructor();imports=strict.import_ancestry(plan['registration_ref'],row['job_id'],plan['capsule_ref'],plan['closed_source_context_refs'],ws)
  pins.update(imports['input_pins'])
  # Required original R captures must remain authenticated and fully available
  # after the repaired R4 donor's own new complete/native/quiet proof.
  donor=next(d for d in owner.donors() if d['source']['arm']==row['arm']);context=p.checked(donor['closed_context_ref']);accepted=[]
  for i,item in enumerate(context['sources']):
   original=Path(item['body']['path']);rel='inputs/original_source_context/'+str(i).zfill(4)+'.body'
   if 'public_captures' not in original.parts or p.p_private(original) or original.stat().st_size!=item['body']['bytes'] or p.sha(item['metadata']['path'])!=item['metadata']['sha256']:raise ValueError('Exact original samearm native public capture provenance')
   p.clone_bytes(original,ws/rel,item['body']['sha256'],original.parent);pins[str(ws/rel)]=item['body']['sha256'];accepted.append({'candidate_path':rel,'url':item['requested_url'],'actual_url':item['actual_url'],'sha256':item['body']['sha256'],'status':item['status'],'capture_id':item['capture_id'],'source_meaning':'UNASSESSED'})
  ip=ws/'inputs/original_source_context/index.json';p.put(ip,{'schema':'er9.candidate-source-index.v1','sources':accepted});pins[str(ip)]=p.sha(ip)
  index=owner.module('original_navigation_index',owner.ROOT.parent/'own-prior-navigation-index-001/prior_index.py')
  entries=[{'path':Path(path).relative_to(ws).as_posix(),'sha256':sha,'bytes':Path(path).stat().st_size,'origin_arm_id':row['arm']} for path,sha in pins.items() if Path(path).relative_to(ws).as_posix() not in neutral]
  auth={'schema':'er9.accepted-own-prior-imports.v1','job_id':row['job_id'],'pair_id':reg['pair_id'],'arm':row['arm'],'authenticated_same_arm':True,'imports':entries}
  indexref=index.freeze(ws,pins,neutral,auth);pins[indexref['path']]=indexref['sha256']
 selected=copy.deepcopy(source);selected.update(workspace=str(ws),prompt_file=str(task),input_pins=pins,out=str(destination/'native'),freeze_out=str(destination/'OUTPUT_FREEZE.json'),source_role_birth_plan_ref=plan_ref,
  authenticated_mechanical_ancestry=imports,paired_repair_gate_receipt_ref=plan.get('paired_repair_gate_receipt_ref'))
 selected['glm_resource'].update(capture_dir=str(destination/'public_captures'),evidence_dir=str(destination/'tool-evidence'))
 p.put(destination/'role-bound-stage.json',selected);receipt={'schema':'er9.actual-role-birth-binding-receipt.v1','job_id':row['job_id'],'pair_id':reg['pair_id'],'arm':row['arm'],'stage_ref':p.ref(destination/'role-bound-stage.json'),
 'plan_ref':plan_ref,'source_static_Task_profile_inputs_frozen_before_NEW_Goal':True,'old_Goal_clock_reset':False,'source_native_calls':0,'role':'catalog_native_mechanical_repair' if repair else 'conditional_original_topology_repaired_diagnostic'}
 p.put(destination/'ROLE_BIRTH_RECEIPT.json',receipt);return p.ref(destination/'ROLE_BIRTH_RECEIPT.json')
