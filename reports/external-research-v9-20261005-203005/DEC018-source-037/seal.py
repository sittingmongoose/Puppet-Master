"""Freeze finite source review package; never author a repair or native allocation."""
from datetime import datetime,timezone
from pathlib import Path
import json,sys
sys.dont_write_bytecode=True
import prepare as owner
p=owner.p;ROOT=owner.ROOT

def seal():
 now=datetime.now(timezone.utc).isoformat();start=p.checked(p.ref(ROOT/'SOURCE_START.json'))
 if datetime.fromisoformat(now)>=datetime.fromisoformat(start['source_deadline_utc']):raise ValueError('Original inclusive source task deadline reached')
 snapshot=p.checked(p.ref(ROOT/'OLD_SOURCE_BYTE_SNAPSHOT.json'))
 for path,digest in snapshot['files'].items():
  if p.sha(path)!=digest:raise ValueError('Old source byte drift')
 owner.donors();reg=p.checked(p.ref(ROOT/'registration.json'));box=p.checked(p.ref(ROOT/'OUTBOX.json'))
 if len(reg['stage_jobs'])!=5 or any(sum(r['max_seconds'] for r in reg['stage_jobs'] if r['arm']==arm)!=2100 for arm in ['control','treatment']):raise ValueError('Exact repaired original topology/budgets')
 verification={'schema':'er9.c04-paired-native-catalog-source-verification.v1','result':'PASS','verified_utc':now,'command':'PYTHONDONTWRITEBYTECODE=1 python3 -m unittest -v test_repair',
  'tests':11,'actual_production_G_metadata_config_fixtures':5,'old_source_files_verified':len(snapshot['files']),
  'actual_metadata_only_donor_joins':2,'failed_original_T_state_preserved':True,'actual_existing_native_cache_source_copy_and_writer_fixtures':True,
  'meaningful_checks':['five actual production tool/resource/clock/config preparation fixtures, subprocess/model/native blocked','exact original scientific Task prefix and all original brief/input pins retained',
   'exact original C900/F600 vs Tcombined1500 topology and factor profiles; repair600 common;2100perarm','actual observed native GLM provider/model tuple, donor samearm/hash/Goal/quiet/release joins',
   'uniquely valid one comma/colon insertion/deletion; scalar/string/escape/order/bracket identity; valid original exactbytes','ambiguous/multiple-edit/nonlexable/value/order/escape/bracket changes reject UNASSESSED',
   'proposal/leads/witnesses EXACT byte identity; valid requiredJSON; bounded token/depth/exhaustive proof','synthetic paired direct native completion/full/quiet/release/model/Goal/hash/wrongarm failures reject',
   'actual existing mechanical/cache_source and write_file unchanged schema; exact synthetic copies','opaque rolebirth fourfile fixture and immutableTask/new600; entered/existingbirth rejects','all old source bytes unchanged'],
  'all_actual_candidate_catalog_body_inspection_or_gate_runs_by_source_engineer':False,'native_Goal_model_provider_calls':0,'ops_jobs_mutated':0,
  'actual_T_catalog_repairability':'UNKNOWN_UNASSESSED','syntax_gate_never_proves_scientific_or_source_semantics':True}
 p.put(ROOT/'VERIFICATION.json',verification)
 contract={'schema':'er9.c04-paired-native-catalog-prospective-contract.v1','source_start':p.ref(ROOT/'SOURCE_START.json'),'donor_contract':p.ref(ROOT/'DONOR_CONTRACT.json'),
  'root_topology_correction':p.ref(ROOT/'TOPOLOGY_CORRECTION.json'),'source_closure':p.ref(ROOT/'PAIRED_SOURCE_CLOSURE.json'),
  'registration':p.ref(ROOT/'registration.json'),'syntax_gate':p.ref(ROOT/'syntax_gate.py'),'paired_gate':p.ref(ROOT/'paired_gate.py'),'role_birth':p.ref(ROOT/'role_birth.py'),
  'original_strict_normalizer':owner.NORMALIZER,'failed_donor_exception':'Only exact historical native authored currentR4 to added SAME-RULE mechanical role; never strict completed predecessor',
  'paired_continuation_gate':'Both new direct native Goals COMPLETE/fullR4/ownedquiet/release+unique exact syntax gate PASS; no adoption by existence or original failedGoal relabel',
  'actual_dynamic_birth_clock_config_input_Task_hashes_before_each_NEW_Goal':True,'no_old_clock_reset':True,'new_targets':0,'native_allocation_authorized':False}
 p.put(ROOT/'CONTRACT.json',contract)
 external=[];normal=p.checked(owner.NORMALIZER)
 sources=dict(normal['source_pins'])
 sources[str(ROOT.parent/'own-prior-navigation-index-001/prior_index.py')]=p.sha(ROOT.parent/'own-prior-navigation-index-001/prior_index.py')
 for name in ['prepare.py','role_birth.py','syntax_gate.py','paired_gate.py','test_repair.py','seal.py']:sources[str(ROOT/name)]=p.sha(ROOT/name)
 for ref in owner.PINS+owner.MARKERS+[owner.NORMALIZER]:p.checked(ref);external.append(ref)
 files={str(path.relative_to(ROOT)):p.sha(path) for path in sorted(ROOT.rglob('*')) if path.is_file() and '__pycache__' not in path.parts}
 p.put(ROOT/'SOURCE_PIN.json',{'schema':'er9.c04-paired-native-catalog-source-pin.v1','status':'FEASIBLE_SOURCE_READY_FOR_ROOT_FINITE_ALLOCATION_REVIEW','frozen_utc':now,'root':str(ROOT),
  'entrypoint':p.ref(ROOT/'role_birth.py'),'paired_gate_entrypoint':p.ref(ROOT/'paired_gate.py'),'source_pins':sources,'files':files,'external_source_choices':external,
  'contract_ref':p.ref(ROOT/'CONTRACT.json'),'verification':p.ref(ROOT/'VERIFICATION.json'),'native_calls':0,'native_allocation_authorized':False})
 ready={'schema':'er9.c04-paired-native-catalog-ready.v1','status':'FEASIBLE_SAFE_SOURCE_CONSTRUCTION_READY_PENDING_ROOT_FINITE_ALLOCATION',
  'source_pin':p.ref(ROOT/'SOURCE_PIN.json'),'verification':p.ref(ROOT/'VERIFICATION.json'),'all5_source_choices_before_ANYnewGoal':True,
  'actual_T_catalog_repairable':'UNKNOWN_UNASSESSED_WITHOUT_BODY_READ','native_allocation_authorized':False,'new_research_reruns':0,'mechanical_native_donor_roles':2,
  'conditional_continuation_roles':3,'original_topology':'C900→F600 versus Tcombined1500','added_repair_budget600_each':True,'new_total_allowance2100_perarm':True,
  'admission_conditions':['root concrete finite-allocation review, then sole ops ordinary exact source eligibility/model/resource/growth/storage/privatebounds checks',
   'all current old C04 terminal+quiet/current exact authored donor hashes and actual native proof; failedT remainsfailed',
   'all5 actual source/config/tool/profile/Task-static choices frozen before ANYrepairGoal','actual fresh clocks/config/import hashes at each newbirth beforeGoal, no old reset',
   'BOTHnew native mechanicalGoal COMPLETE+fullR4+quiet/release+strict fixed paired syntax gate PASS before any continuation',
   'strict new samearm repair/currentcritic only plus authentic original samearm closed captures; no oldcrit/final/evaluator/otherarm',
   'unknown/ambiguous source preservation rejects; no hostJSONfix, Solfix, fileexistencefallback or automaticrepeat'],
  'new_logical_targets_or_clean_confirmation_credit':0,'source_semantics_restored':'UNASSESSED','source_native_calls':0}
 p.put(ROOT/'READY.json',ready)
 final=dict(box);final.update(source_pin=p.ref(ROOT/'SOURCE_PIN.json'),ready=p.ref(ROOT/'READY.json'),verification=p.ref(ROOT/'VERIFICATION.json'),
  source_contract=p.ref(ROOT/'CONTRACT.json'),role_birth_constructor_pin=p.ref(ROOT/'SOURCE_PIN.json'),paired_gate_entrypoint=p.ref(ROOT/'paired_gate.py'),frozen_utc=now)
 p.put(ROOT/'OUTBOX_FINAL.json',final)
 selected=[{**p.ref(path),'role':'C04 prospective mechanical native donor repair source/metadata/exact original scientific Task inputs'} for path in sorted(ROOT.rglob('*')) if path.is_file() and '__pycache__' not in path.parts and 'operator-profile' not in path.parts]
 p.put(ROOT/'PUBLICATION_SELECTOR.json',{'schema':'er9.positive-publication-selection.v1','created_utc':now,'files':selected,'file_count':len(selected),
  'source_pin':p.ref(ROOT/'SOURCE_PIN.json'),'outbox':p.ref(ROOT/'OUTBOX_FINAL.json'),'private_profiles_candidate_or_capture_bodies_evaluator_modelIO_selected':False,
  'native_allocation_authorized':False,'source_native_calls':0,'new_logical_target_credit':0})
 for name in ['SOURCE_PIN.json','READY.json','OUTBOX_FINAL.json','VERIFICATION.json','PUBLICATION_SELECTOR.json']:print(name,json.dumps(p.ref(ROOT/name)))
 print('frozenUTC',now,'pubfiles',len(selected),'oldfiles',len(snapshot['files']))

if __name__=='__main__':seal()
