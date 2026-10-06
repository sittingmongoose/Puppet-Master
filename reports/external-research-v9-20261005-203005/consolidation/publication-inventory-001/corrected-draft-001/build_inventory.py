#!/usr/bin/env python3
"""Metadata-only finite arm inventory. Candidate and evaluator bodies are hashed, never parsed."""
import json, hashlib, pathlib, datetime, collections
LAB=pathlib.Path('/home/sittingmongoose/PM-Experiments/external-research-v9-20261005-203005')
DEST=LAB/'consolidation/publication-inventory-001'
REPORT=pathlib.Path('/home/sittingmongoose/pm-worktrees/external-research-v9-20261005-203005/reports/external-research-v9-20261005-203005')
START='2026-10-06T12:20:40+00:00'
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
sha=lambda data:hashlib.sha256(data).hexdigest()
cache={}; reads=[]
def load(rel):
 p=LAB/rel; data=p.read_bytes(); reads.append({'path':str(p),'sha256':sha(data),'bytes':len(data),'captured_utc':now()}); return json.loads(data)
def hash_file(p):
 p=pathlib.Path(p)
 if str(p) not in cache:
  if not p.is_file():cache[str(p)]=None
  else:
   h=hashlib.sha256()
   with p.open('rb') as f:
    for block in iter(lambda:f.read(1048576),b''):h.update(block)
   cache[str(p)]={'path':str(p),'sha256':h.hexdigest(),'bytes':p.stat().st_size}
 return cache[str(p)]
# Curated bodies are opaque: only path, length and digest are processed.
pub_bytes=(REPORT/'PUBLICATION.json').read_bytes(); pub=json.loads(pub_bytes); curated=collections.defaultdict(list)
for rel in pub['positive_selection']:
 p=REPORT/rel; pin=hash_file(p)
 if pin:curated[pin['sha256']].append({'relative_path':str(pathlib.Path('reports')/REPORT.name/rel),'bytes':pin['bytes']})
verify=load('ops/publication/cohort036-verification.json')
verified_exact={r['sha256']:[{'relative_path':r['path'],'commit':verify['head']}] for r in verify.get('raw_byte_checks',[]) if r.get('byte_identical') and r.get('http_status')==200}
def pin(path, expected=None):
 if not path:return {'state':'UNKNOWN_UNEXPOSED'}
 p=pathlib.Path(path); p=p if p.is_absolute() else LAB/p
 h=hash_file(p)
 if not h:return {'path':str(p),'expected_sha256':expected or 'UNKNOWN','state':'MISSING_LOCAL_SOURCE'}
 result=dict(h);result['expected_sha256']=expected or 'UNKNOWN';result['expected_hash_matches']=h['sha256']==expected if expected else 'UNKNOWN'
 matches=curated.get(h['sha256'],[])
 result['publication_state']='CURATED_LOCAL_PENDING_PUBLICATION' if matches else 'PENDING_PUBLICATION'
 result['curated_content_alias_sha256']=h['sha256'] if matches else None
 # Only exact remote raw-byte proof is initially promoted; a later commit map may extend it.
 if h['sha256'] in verified_exact:result['publication_state']='VERIFIED_COMMIT';result['verified_content_alias_paths']=verified_exact[h['sha256']]
 return result
def ref(v):
 if isinstance(v,dict) and v.get('path'):return pin(v['path'],v.get('sha256'))
 if isinstance(v,str):return pin(v)
 return {'state':'UNKNOWN_UNEXPOSED'}
work=load('consolidation/workload-007/WORKLOAD_SCOREBOARD.json'); jobs=load('state/jobs.json'); cursor=load('state/queue_cursor.json'); byid={x['job_id']:x for x in jobs['jobs']}
extra_paths=['ops/assessment-dispatch-001/FINITE_LOGICAL_COVERAGE_004.json','ops/assessment-dispatch-001/UNMATCHED_CURRENT_ROLE_METADATA_001.json','supervision/COVERAGE-004-COUNT-LABEL-CORRECTION-001.json','ops/dispatcher/I12_CURRENT_ALL_TERMINAL_DEC018_REJECTED_DEC019_ACTIVE_001.json','ops/dispatcher/DEC018_TERMINAL_PAIRED_GATE_REJECTION_001/REJECTION.json','ops/frozen-exports/observations/C03_C04_REQUIRED_PATH_PREFIX_QUALIFICATION_001.json','ops/frozen-exports/observations/NEUTRAL_FINISH_CLOCK_PINSET_004.json','consolidation/workload-007/PUBLICATION_SELECTOR.json']
for path in extra_paths:load(path)
stage_cache={}
def stage_row(jid,proof=None):
 if jid in stage_cache:return stage_cache[jid]
 j=byid.get(jid)
 if not j:return {'job_id':jid,'state':'MISSING_REGISTRATION','scientific_grade':'UNASSESSED'}
 out={k:j.get(k,'UNKNOWN') for k in ['job_id','pair_id','source_slot','arm','stage','stage_index','status','family','requested_family','requested_model','requested_effort','observed_family','observed_candidate_family','candidate_family','created_utc','start_utc','ended_utc','elapsed_seconds','max_seconds','max_responses','direct_native_goal_id','direct_native_goal_status','permit_release_confirmed','source_job_id','predecessor_job_id','clock_version_replaces_job_id','scientific_recovery_mode','extra_logical_target_credit','valid_full_pipeline_credit','native_goal_starts','prerequisite_job','prerequisite_job_ids','blocked_by','evaluation_status']}
 out['direct_native_goal_status_scope']='REGISTRY_DECLARATION_ONLY; no directcall/native COMPLETE proof asserted';out['cost_scope']='SEPARATE_ACCOUNTING_OWNER; caps and elapsed are workload metadata, not billed tokens/provider cost';out['physical_provider']='UNKNOWN';out['billing_account']='UNKNOWN';out['observed_effort']='UNKNOWN';out['scientific_grade']='UNASSESSED'
 out['Goal_proof_scope']='UNKNOWN_UNLESS_POSITIVE_PROOF_JOIN_BELOW; counters/status/driver completion do not establish native completion'
 sp=j.get('stage_json');out['actual_stage']=pin(sp,j.get('stage_sha256'))
 s={}
 if sp and pathlib.Path(sp).is_file():s=json.loads(pathlib.Path(sp).read_bytes())
 out['stage_binding_scope']='LAUNCHED_OR_ENTERED' if j.get('start_utc') or j.get('activation_observed') else 'PREPARED_OR_BLOCKED_UNENTERED; no actual native prompt receipt claimed'
 out['actual_Task']=pin(s.get('prompt_file'),s.get('prompt_sha256'))
 out['actual_tool_config']=pin(s.get('tools_config'),s.get('tools_config_sha256'))
 out['input_freeze_pins']={'state':'EXACT_FULL_INPUT_MAP_IN_PINNED_ACTUAL_STAGE_JSON','entry_count':len(s.get('input_pins',{})),'canonical_map_sha256':sha(json.dumps(s.get('input_pins',{}),sort_keys=True,separators=(',',':')).encode()),'locator_field':'actual_stage /input_pins'} if isinstance(s.get('input_pins'),dict) else {'state':'UNKNOWN_UNEXPOSED'}
 out['runtime_and_tool_source_refs']={k:ref(j.get(k)) for k in ['runtime_ref','runtime_source_pin','resource_source_pin','tools_source_pins','pre_failfast_runtime_selection','readiness_failfast_source_selection_ref','deferred_registration_ref','owner_registration']}
 fp=j.get('freeze_path') or j.get('expected_freeze');out['output_freeze']=pin(fp);f={}
 if fp and pathlib.Path(fp).is_file():f=json.loads(pathlib.Path(fp).read_bytes())
 arts=f.get('artifacts',[]); inventory=[]
 if isinstance(arts,dict):arts=[dict(v,path=k) if isinstance(v,dict) else {'path':k} for k,v in arts.items()]
 for a in arts:
  if isinstance(a,dict):inventory.append({'relative_path':a.get('relative_path','UNKNOWN'),'artifact':pin(a.get('path'),a.get('sha256'))})
 out['opaque_authored_artifact_inventory']=inventory
 req=s.get('required_artifacts',j.get('required_artifacts'))
 out['required_artifact_contract_source']='ACTUAL_STAGE' if s.get('required_artifacts') is not None else 'REGISTRY' if j.get('required_artifacts') is not None else 'UNKNOWN_UNEXPOSED'
 def norm(v):
  q=str(v).replace('\\','/');return q[4:] if q.startswith('out/') else q
 outputs=[]
 for name in req or []:
  if not isinstance(name,str):outputs.append({'name':'UNKNOWN_CONTRACT_SHAPE','state':'UNASSESSED'});continue
  match=[a for a in inventory if norm(a['relative_path'])==norm(name)]
  state='PRESENT_PINNED_ARTIFACT' if match else ('UNENTERED' if not j.get('start_utc') and not j.get('activation_observed') else 'MISSING_REQUIRED_FROZEN_ARTIFACT')
  if not match and ('BLOCK' in str(j.get('status','')).upper() or j.get('blocked_by')):state='BLOCKED_UNENTERED' if not j.get('start_utc') else 'BLOCKED_WITHOUT_REQUIRED_ARTIFACT'
  outputs.append({'name':name,'state':state,'present':match,'freeze_declared_missing':name in f.get('missing_required_artifacts',[])})
 out['required_outputs']=outputs if req is not None else [{'name':'UNKNOWN_UNEXPOSED_CONTRACT','state':'UNASSESSED'}]
 out['freeze_operational_complete']=f.get('operational_complete','UNKNOWN');out['freeze_native_status']=f.get('native_status','UNKNOWN')
 out['freeze_missing_required_artifacts']=f.get('missing_required_artifacts','UNKNOWN')
 out['positive_Goal_proofs']=[]
 receipt_ref=f.get('native_receipt')
 receipt_path=receipt_ref.get('path') if isinstance(receipt_ref,dict) else None
 if not receipt_path and sp:receipt_path=str(pathlib.Path(sp).parent/'native/receipt.json')
 if receipt_path:
  rp=pathlib.Path(receipt_path);rp=rp if rp.is_absolute() else LAB/rp
  out['saved_native_receipt']=pin(rp,receipt_ref.get('sha256') if isinstance(receipt_ref,dict) else None)
  if rp.is_file() and rp.name=='receipt.json':
   nr=json.loads(rp.read_bytes())
   allowed=['requested_model','requested_effort','observed_model','observed_effort','goal_activated','goal_submitted','goal_target_id','session_id','activation_utc','status','max_seconds','max_responses','cli_path','cli_sha256','raw_prompt_sha256','prompt_sha256','caps_include_setup_and_cleanup']
   out['native_receipt_metadata']={k:nr.get(k,'UNKNOWN') for k in allowed if not isinstance(nr.get(k), (dict,list))}
   for source,dest in [('requested_model','actual_receipt_requested_model'),('requested_effort','actual_receipt_requested_effort'),('observed_model','actual_receipt_observed_model'),('observed_effort','actual_receipt_observed_effort')]:out[dest]=nr.get(source,'UNKNOWN') if isinstance(nr.get(source),(str,int,float,bool)) else 'UNKNOWN'
   if isinstance(nr.get('observed_model'),dict):
    out['actual_receipt_observed_model']={k:nr['observed_model'][k] for k in ['modelId','providerId','model','effort'] if isinstance(nr['observed_model'].get(k),(str,int,float,bool))}
   out['scalar_only_observed_model_projection']=nr.get('observed_model') if isinstance(nr.get('observed_model'),str) else 'UNKNOWN';out['scalar_only_observed_effort_projection']=nr.get('observed_effort') if isinstance(nr.get('observed_effort'),str) else 'UNKNOWN'
   out['observed_identity_scope']='EXACT_SAVED_RECEIPT_METADATA_ONLY; route/model IDs do not attest physical provider or billing; uninspected fields not claimed globally unknown'
   out['runtime_cli_exposed_locator']={'path':nr.get('cli_path','UNKNOWN'),'declared_sha256':nr.get('cli_sha256','UNKNOWN'),'body_access':'NOT_READ_OR_COPIED; receipt declaration only'}
   if nr.get('goal_activated') is True:
    out['positive_Goal_proofs'].append({'proof_basis':'SAVED_RECEIPT_EXPLICIT_GOAL_ACTIVATED_TRUE','selector':'/goal_activated','observed_value':True,'source_pin':out['saved_native_receipt'],'opaque_Goal_id':nr.get('goal_target_id','UNKNOWN'),'scope':'NATIVE_ENTRY_ONLY; driver receipt status never native COMPLETE or scientific completion'})
    out['Goal_proof_scope']='POSITIVE_SAVED_NATIVE_ENTRY_ONLY; no downstream/native COMPLETE/scientific credit'
 stage_cache[jid]=out;return out
rows=[]; history=[]
for slot in work['slots']:
 for arm in ['control','treatment']:
  selected=[jid for jid in slot['effective_selected_ids'] if byid.get(jid,{}).get('arm')==arm]
  am=next((x for x in slot['arms'] if x['arm']==arm),{})
  stages=[stage_row(jid) for jid in selected]
  for proof in am.get('qualifier015_role_proofs',[]):
   st=next((x for x in stages if x['job_id']==proof['target_role_job_id']),None)
   if st:
    pr=dict(proof);pos=pr.get('positive_native_activation_proof') or {}; pos=dict(pos);pos['source_pin']=ref(pos.get('source_pin'));pr['positive_native_activation_proof']=pos
    st['positive_Goal_proofs'].append(pr);st['Goal_proof_scope']='POSITIVE_NATIVE_ENTRY_ONLY; not complete/native-status proof and no downstream or scientific credit' if pos.get('observed_value') is True else st['Goal_proof_scope']
  rows.append({'track':{'A':'targeted','B':'fresh_integrated','C':'confirmation'}[slot['track']],'pair':slot['slot_id'],'arm':arm,'lineage':'CURRENT_SELECTED_AT_WORKLOAD007_CUTOFF','selection_stratum':slot['selection_stratum'],'selection_basis':'workload007/effective_selected_ids joined on exact registry job_id and arm','selected_job_ids':selected,'stages':stages,'operational_complete_at_workload007':am.get('targeted_diagnostic_operational_complete') if slot['track']=='A' else am.get('full_pipeline_operational_complete'),'scientific_grade':'UNASSESSED','scope_reviews_metadata_only':slot.get('exact_neutral_scope_review_matches',[]),'review_scope_is_not_full_pipeline_comparison':True})
  oldids=[x['job_id'] for x in slot['historical_and_repair_lineage'] if x.get('arm')==arm and x['job_id'] not in selected]
  history.append({'track':slot['track'],'pair':slot['slot_id'],'arm':arm,'lineage':'RETAINED_NONSELECTED_HISTORY_AND_REPAIR','job_ids':oldids,'stages':[stage_row(jid) for jid in oldids],'current_fresh_or_confirmation_credit':0})
# Unique records are referenced by IDs to keep the all-version matrix compact.
for row in rows+history:row['stage_ids']=[s['job_id'] for s in row.pop('stages')]
separate_strata={}
for key in ['warm_single_roles_no_new_logical_targets','DEC019_named_warm_derivative_roles_no_logical_credit','unscored_donor_roles_no_target_credit','historical_original_C03_whole_pipeline_reference_only']:
 separate_strata[key]=[x['job_id'] for x in work.get(key,[]) if x.get('job_id')]
 for jid in separate_strata[key]:stage_row(jid)
observer_paths=[f'ops/frozen-exports/phase2/INDEPENDENT-TARGETED-{n}_CURRENT_RUNTIME_001.json' for n in [27,28,29,30,31]]
observer_paths += ['ops/frozen-exports/phase2/INDEPENDENT-TARGETED-28_CURRENT_RUNTIME_002.json']
observer_paths += [f'ops/frozen-exports/current-integrated-009-011/phase2/I{n}_CURRENT_RESEARCH_RUNTIME_001.json' for n in ['09','10','11']]
observer_paths += ['ops/frozen-exports/i12-current-research-phase2-001/I12_CURRENT_RESEARCH_RUNTIME_001.json']
for rel in observer_paths:
 if not (LAB/rel).is_file():continue
 capsule=load(rel); capsule_pin=pin(LAB/rel)
 for metadata in capsule.get('rows',[]):
  jid=metadata.get('job_id')
  if jid not in stage_cache:continue
  selected={k:metadata[k] for k in ['requested_model','requested_effort','observed_identity','observed_model','nativeGoal_status','native_goal_status_final','native_goal_status_before_cleanup','physical_provider_runtime_attestation','physical_provider_payload_or_billed_dollars','stage_sha256','source_metadata_hashes'] if k in metadata}
  # Metadata scope only, never entire row, error text, private keys or native result body.
  stage_cache[jid].setdefault('owner_selected_observer_identity_and_Goal_status_metadata',[]).append({'capsule_pin':capsule_pin,'exact_job_id':jid,'fields':selected,'scope':'OWNER_SELECTED_OBSERVER_METADATA; no overwrite of registry/directproof, no family/provider inference or completed comparison credit'})
unjoined=[jid for jid in byid if jid not in stage_cache]
separate_strata['registered_not_joined_to_selected_or_retained_slot_metadata']=unjoined
for jid in unjoined:stage_row(jid)
end=now(); manifest={'schema':'er9.publication-inventory.v1','actual_task_start_utc':START,'capture_end_utc':end,'inclusive_deadline_utc':'2026-10-06T12:40:40+00:00','campaign_finished':False,'snapshot_not_atomic':True,'selected_lineage_cutoff':work['capture_end_utc'],'live_registry_capture_is_separate':True,'logical_targets':work['logical_targets'],'logical_arm_count':len(rows),'counts':dict(collections.Counter(r['track'] for r in rows)),'current_selected_arms':rows,'retained_history_arms':history,'stages':list(stage_cache.values()),'separate_nonlogical_strata':separate_strata,'curated_content_aliases':dict(curated),'source_captures':reads,'curated_publication_manifest_pin':{'path':str(REPORT/'PUBLICATION.json'),'sha256':sha(pub_bytes),'bytes':len(pub_bytes)},'verified_receipt':pin(LAB/'ops/publication/cohort036-verification.json'),'publication_rule':'VERIFIED_COMMIT only exact receipt/commit-tree proof; current curated SHA alias without commit proof is CURATED_LOCAL_PENDING_PUBLICATION. Local extant unselected artifact is PENDING_PUBLICATION. Alias equality never inherits lineage/output credit.','prefix_rule':'Only leading out/ is normalized for comparing required output names to freeze relative paths; prefix qualification does not establish Goal/producerJSON/source correctness.','body_read_policy':'FINAL_GENERATOR_SCOPE: registry/stage/freeze/selected-safe-capsule and compact native/receipt.json metadata only; native/result.json remains opaque SHA/length. Earlier broad Luna result JSON parsing is disclosed in BOUNDARY_INCIDENT.json; no perfect no-body-read assertion.','tail_qualification':'I12 all six terminal with both final failures; DEC018 two failed repairs and three blocked zero-Goal descendants; DEC019 named failed-parent warm continuation remains separately pending, no logical/fresh/causal/original-completion credit.','current_operational_summary':{'fresh_integrated_completed_arms':5,'confirmation_completed_arms':0,'historical_original_C03_treatment_pipeline_completed_arms':1,'historical_original_C03_is_not_current_confirmation_credit':True},'workload007_immutable_selector_expected_sha256':'346cb5a523d172a74cc234da1d1bff42ca82951d87e564be4203355ef4fd2669','known_coverage_label_correction':'FINITE004 means18 unmatched logical slots and69 dated unmatched roles; matched-job review scope is not completed comparisons.'}
# Output written after pending references and lossless pin interning below.
missing=[]
for st in manifest['stages']:
 for kind in ['actual_stage','actual_Task','actual_tool_config','output_freeze']:
  p=st[kind]
  if p.get('publication_state') in ['PENDING_PUBLICATION','CURATED_LOCAL_PENDING_PUBLICATION']:missing.append({'job_id':st['job_id'],'kind':kind,'pin':p})
 for a in st['opaque_authored_artifact_inventory']:
  if a['artifact'].get('publication_state') in ['PENDING_PUBLICATION','CURATED_LOCAL_PENDING_PUBLICATION']:missing.append({'job_id':st['job_id'],'kind':'OPAQUE_AUTHORED_ARTIFACT','pin':a['artifact']})
pin_table={}
def intern(v):
 if isinstance(v,dict):
  if v.get('publication_state') and v.get('path') and v.get('sha256'):
   identity=sha((v['path']+'\n'+v['sha256']).encode())
   pin_table[identity]=v
   return {'pin_ref':identity}
  return {k:intern(x) for k,x in v.items()}
 if isinstance(v,list):return [intern(x) for x in v]
 return v
compact=intern(manifest);pending=intern({'schema':'er9.publication-inventory-pending-refs.v1','not_a_permission_to_export_private_bodies':True,'refs':missing})
compact['pin_table']=pin_table
(DEST/'ARM_INVENTORY.json').write_text(json.dumps(compact,separators=(',',':'),sort_keys=True)+'\n')
(DEST/'PENDING_PUBLICATION_REFS.json').write_text(json.dumps(pending,indent=2,sort_keys=True)+'\n')
md=['# 96-arm publication inventory','','Finite current selection: 64 targeted arms, 24 fresh integrated pipelines, 8 confirmation pipelines. Selection cutoff '+work['capture_end_utc']+'. Registry and publication captures are separate and non-atomic. Campaign closure is pending.','','Current fresh operational completions: 5; current confirmation: 0. Historical original C03 treatment: 1, retained separately. No scientific grading or matched-comparison credit is inferred.','','| Track | Pair | Arm | Selected role IDs | OP at cutoff | Required output states |','|---|---|---|---|---|---|']
for r in rows:
 states=collections.Counter(x['state'] for jid in r['stage_ids'] for x in stage_cache[jid]['required_outputs'])
 md.append('| '+ ' | '.join([r['track'],r['pair'],r['arm'],'<br>'.join(r['stage_ids']),str(r['operational_complete_at_workload007']),'; '.join(f'{k}: {v}' for k,v in sorted(states.items()))])+' |')
md+=['','`ARM_INVENTORY.json` contains every selected stage and retained version, exact opaque pins, unknown family/effort/provider observations, scoped positive Goal proofs, runtime refs, and required output names. `PENDING_PUBLICATION_REFS.json` lists extant local artifacts requiring publisher adjudication; it does not authorize private/raw-body export.','','VERIFIED_COMMIT requires exact receipt and commit proof. Local curated equality is pending GitHub verification. Same SHA aliases establish content identity only; job lineage remains distinct.','','Final generator treats native/result.json as opaque SHA/length and uses selected safe capsules. Earlier whole-file Luna result JSON parsing exceeded the preferred boundary; BOUNDARY_INCIDENT.json records its scope and uncertainty. Payload/config/objective values were not inspected/exported; no perfect no-body-read claim is made. Scientific outcomes remain UNASSESSED here.']
(DEST/'README.md').write_text('\n'.join(md)+'\n')
print(json.dumps({'logical_arms':len(rows),'tracks':manifest['counts'],'unique_stages':len(stage_cache),'history_role_references':sum(len(r['stage_ids']) for r in history),'pending_publication_refs':len(missing),'capture_end_utc':end}))
