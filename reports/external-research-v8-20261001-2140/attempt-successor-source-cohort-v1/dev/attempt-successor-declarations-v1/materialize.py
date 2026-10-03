"""Additive pinned protocol materialization only; no candidate answers or execution."""
import copy,datetime,hashlib,json,pathlib,re,shutil
HERE=pathlib.Path(__file__).resolve().parent;LAB=HERE.parents[1];CASES=LAB/'cases/attempt-successors-v1'
PROPOSAL=LAB/'dev/tranche-successor-v8/REMAINING_CELLS.json';PROPOSAL_SHA='c4644d8bcacc68a499dc28d790fa584a6892eb508de4d1075656f096ae388585'
AUTHORITY=LAB/'ops/recovery-v1/ATTEMPT_SUCCESSOR_DEVELOPMENT_AUTHORITY_V1.json';AUTHORITY_SHA='64b40261010db33ce32871db4cb42900ae130d5dc02272ac92831594bd9e2f7e'
CAPS=[1200,1200,900];ROLES=['research-proposal','independent-candidate-critic','final-correction'];ARTIFACTS=['PROPOSAL.md','CRITIQUE.md','FINAL_PROPOSAL.md'];ACCOUNT='existing-authorized-zcode-account-v8-A'
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def canonical(v):return json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
def record(p):return {'path':str(p),'sha256':sha(p)}
def write(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,indent=2)+'\n')
def pinned(r):
 p=pathlib.Path(r['path'])
 if p.is_symlink() or sha(p)!=r['sha256']:raise ValueError('exact source pin drift: '+str(p))
 return p

def task_transform(text,old,new):
 return (text.replace('# '+old+'\n','# '+new+'\n').replace('research/proposal (≤1800s)','research/proposal (≤1200s)').replace('fresh independent candidate critic (≤600s)','fresh independent candidate critic (≤1200s)').replace('fresh final correction (≤600s)','fresh final correction (≤900s)').replace('≤600s host overhead','≤300s host overhead').replace('Research ≤1800s; critic ≤600s; correction ≤600s;','Research ≤1200s; critic ≤1200s; correction ≤900s;'))
def method_transform(text):
 # Only role-explicit duration prose, never witness values/counts.
 return text.replace('600-second critic cap','1200-second critic cap').replace('1800-second research cap','1200-second research cap').replace('600-second correction cap','900-second correction cap')
def main():
 if CASES.exists() or (HERE/'SOURCE_FREEZE.json').exists():raise ValueError('fresh owned output paths required')
 pinned({'path':str(PROPOSAL),'sha256':PROPOSAL_SHA});pinned({'path':str(AUTHORITY),'sha256':AUTHORITY_SHA})
 proposal=json.loads(PROPOSAL.read_text());authority=json.loads(AUTHORITY.read_text());release=json.loads((LAB/'ops/execution-resume-v1/root-production-release-v7.json').read_text())
 lineage={'schema':'pm.er8.attempt-successor-source-lineage.v1','proposal':record(PROPOSAL),'development_authority':record(AUTHORITY),'predecessor_release':record(LAB/'ops/execution-resume-v1/root-production-release-v7.json'),'predecessor_source_sha256':{str(PROPOSAL):PROPOSAL_SHA,str(AUTHORITY):AUTHORITY_SHA},'cases':{}}
 mapping={'schema':'er8.assigned-input-map.v1','cases':{}};objectives={'schema':'er8.candidate-objectives.v1','objectives':{}};pairs=[]
 shared_templates={}
 def copy_exact(ref,dst):
  src=pinned(ref);lineage['predecessor_source_sha256'][str(src)]=ref['sha256'];dst.parent.mkdir(parents=True,exist_ok=True)
  if dst.exists() and dst.read_bytes()!=src.read_bytes():raise ValueError('non-common input bytes')
  shutil.copyfile(src,dst)
 for p in proposal['remaining_logical_pairs']:
  pair={'schema':'pm.er8.attempt-successor-pair-declaration.v1','root_authority':False,'accepted':False,'logical_pair_id':p['logical_pair_id'],'attempt_pair_id':p['proposed_pair_attempt_id'],'domain':p['domain'],'contrast':p['contrast'],'prospective_estimand':p['prospective_estimand'],'claim_limit':p['claim_limit'],'classification':'DEVELOPMENT_REPEAT_NOT_FRESH_HOLDOUT','cases':[],'arms':[],'common_binding':{'route':release['route'],'account':ACCOUNT,'actual_account_id':'UNKNOWN','model':'GLM5.3FlashMax','pins':release['pins'],'binding_status':'REQUESTED_EXISTING_ACCEPTED_ROUTE_NOT_NEW_PROVIDER_VERIFICATION'},'caps':{'stage_caps':CAPS,'case_wall':3600,'case_occupied':5400,'outside_native':300,'responses':160},'campaign_deadline_epoch':1791013030.8303788}
  for a in p['arms']:
   old=a['logical_case_id'];new=a['proposed_attempt_case_id'];refs=a['original_assigned_sources'];mref=refs['manifest'];old_manifest=pinned(mref);m=json.loads(old_manifest.read_text());lineage['predecessor_source_sha256'][str(old_manifest)]=mref['sha256'];new_dir=CASES/'candidates'/new;new_dir.mkdir(parents=True)
   if new not in authority['allowed_attempt_case_ids']:raise ValueError('exact authority whitelist')
   for key,mkey in [('brief','brief'),('thin_plan','thin_plan'),('source_access','source_access')]:copy_exact(refs[key],CASES/m[mkey])
   method=pinned(refs['method_card']);task=pinned(refs['case_task'])
   lineage['predecessor_source_sha256'].update({str(method):refs['method_card']['sha256'],str(task):refs['case_task']['sha256']})
   (new_dir/'METHOD.md').write_text(method_transform(method.read_text()));(new_dir/'TASK.md').write_text(task_transform(task.read_text(),old,new))
   for i,s in enumerate(m['stages']):
    source=pinned(refs['stage_templates'][i]);lineage['predecessor_source_sha256'][str(source)]=refs['stage_templates'][i]['sha256'];oldcap=1800 if i==0 else 600;text=source.read_text().replace(f'{oldcap} seconds',f'{CAPS[i]} seconds')
    if text==source.read_text():raise ValueError('exact stage duration clause required')
    dest=CASES/s['task_template'];dest.parent.mkdir(parents=True,exist_ok=True)
    if dest.exists() and dest.read_text()!=text:raise ValueError('common template mismatch')
    dest.write_text(text);shared_templates[ROLES[i]]=sha(dest)
    s['reservation_id']=new+'-'+ROLES[i];s['seconds']=CAPS[i]
    # Derive from ONLY this row's pinned case TASK and stage TASK, plus literal stage identity.
    objective='Complete '+s['reservation_id']+'.\n\n'+(new_dir/'TASK.md').read_text()+'\n\n'+text
    if len(objective)>4000:raise ValueError('native finite objective limit')
    objectives['objectives'][s['reservation_id']]={'objective':objective,'characters':len(objective),'source_derivation':'literal stage identity + transformed pinned case TASK + transformed pinned stage template; no new substantive instructions'}
   m.update(case_id=new,status='SOURCE_FROZEN_DEVELOPMENT_REPEAT_NOT_ADMITTED',reserved_at=None,logical_case_id=old,logical_pair_id=p['logical_pair_id'],pair_id=p['logical_pair_id'],pair_arm=a['arm'],attempt_pair_id=p['proposed_pair_attempt_id'],successor_of=old,evaluator_reservation=a['proposed_evaluation_attempt_id'],original_evaluator_reservation=a['original_evaluator_reservation'],classification='DEVELOPMENT_REPEAT_NOT_FRESH_HOLDOUT',lineage={'original_manifest':mref,'original_method':refs['method_card'],'development_authority':record(AUTHORITY)},prospective_host_binding=copy.deepcopy(pair['common_binding']))
   m['caps'].update(research_proposal_seconds=1200,candidate_critic_seconds=1200,final_correction_seconds=900,summed_stage_hard_seconds=3300,host_overhead_hard_seconds=300)
   m['candidate_account'].update(family='Z',model='GLM5.3Flash',native_application='zcode',mode='Max')
   m['case_birth_epoch']=None;m['case_birth_utc']=None
   write(new_dir/'manifest.json',m)
   mapping['cases'][new]={'manifest':str(new_dir/'manifest.json'),'root':str(CASES),'case_dir':str(new_dir),'objectives':str(HERE/'OBJECTIVES.json'),'family_provisional':'Z','pair_id':p['logical_pair_id'],'arm':a['arm']}
   arm={'logical_case_id':old,'logical_pair_id':p['logical_pair_id'],'arm':a['arm'],'predecessor_attempt_case_id':old,'new_attempt_case_id':new,'new_jobs':a['proposed_jobs'],'new_final_job':a['proposed_final_job'],'evaluator_attempt_id':a['proposed_evaluation_attempt_id'],'source_manifest':record(new_dir/'manifest.json'),'method':record(new_dir/'METHOD.md'),'original_manifest_sha256':mref['sha256'],'original_method_sha256':refs['method_card']['sha256']}
   pair['arms'].append(arm);pair['cases'].append(new)
   lineage['cases'][new]={'logical_case_id':old,'logical_pair_id':p['logical_pair_id'],'arm':a['arm'],'original_assigned_sources':refs,'manifest_identity_metadata_changes':['case_id','status','reserved_at','logical_case_id','logical_pair_id','pair_id','pair_arm','attempt_pair_id','successor_of','evaluator_reservation','original_evaluator_reservation','classification','lineage','prospective_host_binding','candidate_account.family/model/native_application/mode','case_birth_epoch','case_birth_utc'],'only_semantic_prose_changes':'case heading identity and explicit role duration/host budget wording'}
  first=mapping['cases'][pair['cases'][0]];fm=json.loads(pathlib.Path(first['manifest']).read_text())
  pair['common_binding'].update(task_sha256=hashlib.sha256(canonical(shared_templates)).hexdigest(),brief_sha256=sha(CASES/fm['brief']),thin_plan_sha256=sha(CASES/fm['thin_plan']),source_access_sha256=sha(CASES/fm['source_access']))
  write(CASES/'pairs'/((pair['logical_pair_id'])+'.json'),pair);pairs.append(pair)
 write(HERE/'INPUT_MAP.json',mapping);write(HERE/'OBJECTIVES.json',objectives);write(HERE/'LINEAGE.json',lineage)
 write(CASES/'pairs.json',{'schema':'pm.er8.attempt-successor-pairs.v1','status':'SOURCE_ONLY_NOT_RESERVED','pairs':pairs,'classification':'DEVELOPMENT_REPEAT_NOT_FRESH_HOLDOUT'})
 write(HERE/'PAIR_CLOSURE_DRAFT.json',{'pairs':pairs,'shared_task_digest_definition':'SHA256 UTF8 canonical JSON(sort_keys=true,separators=comma/colon,ensure_ascii=false) mapping role -> SHA256 of shared transformed stage-template bytes','shared_stage_template_sha256':shared_templates})
 print('Materialized12 fresh declarations/36 derived objectives/6 pair declarations; source only')
if __name__=='__main__':main()
