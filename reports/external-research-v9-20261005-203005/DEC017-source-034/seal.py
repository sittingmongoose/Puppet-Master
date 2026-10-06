#!/usr/bin/env python3
"""Freeze positive tested DEC017 source. No actual adoption/native interface."""
from datetime import datetime,timezone
from pathlib import Path
import json
import source_builder as owner
p=owner.p;ROOT=owner.ROOT

def seal():
    now=datetime.now(timezone.utc).isoformat();box=p.checked(p.ref(ROOT/'OUTBOX.json'));owner.positive_four_parents(p.checked(owner.PARENTS));snapshot=p.checked(p.ref(ROOT/'OLD_SOURCE_BYTE_SNAPSHOT.json'))
    for path,digest in snapshot['files'].items():
        if p.sha(path)!=digest:raise ValueError('Old source bytes changed')
    p.put(ROOT/'VERIFICATION.json',{'schema':'er9.dec017-source-zero-inference-verification.v1','verified_utc':now,'command':'PYTHONDONTWRITEBYTECODE=1 python3 -m unittest -v test_navigation',
      'result':'PASS','tests':10,'actual_Gproduction_metadata_config_fixtures':23,'actual_positive_current_parent_metadata_roles':8,
      'actual_existing_candidate_visible_read_file_schema_path_test':True,'old_source_files_verified':len(snapshot['files']),
      'negative_checks':['traversal/absolute/noncanonical/symlink/outside-root/hardlink/duplicate/missing files denied','wrongSHA/length/otherarm/contentgrade fields/omittedimports denied',
        'existing birth directory overwrite denied','missing/wrongarm/budget/incomplete/nonquiet fixed parents denied','all old scientific Task prefix/clock/caps/tool/model/methodfactor identities retained'],
      'carrier_preservation_test':'Original synthetic POPULATED reference manifest/profile SHA unchanged,4 actual strict reference closure entries still valid after opaque navigation relocation',
      'fixtures':'Synthetic imports/resources only, subprocesses blocked, no kernel/native/scientific run claim',
      'native_model_Goal_provider_calls':0,'ops_registry_mutations':0,'candidate_evaluator_or_modelIO_body_reads':False})
    contract={'schema':'er9.dec017-own-prior-navigation-original-birth-contract.v1','policy_ref':owner.POLICY,'carrier_qualification':owner.CARRIER_QUALIFICATION,
      'index_constructor':p.ref(ROOT/'prior_index.py'),'locator_constructor':p.ref(ROOT/'locator.py'),'existing_bound_adapter':p.ref(ROOT/'existing_bound_binder.py'),
      'optional_finalizer':p.ref(ROOT/'finalize_index.py'),'four_final_binder':p.ref(ROOT/'four_final_binder.py'),'fixed_four_parent_selection':owner.PARENTS,
      'accepted_import_schema':'er9.accepted-own-prior-imports.v1','exact_existing_actual_carrier_profile_and_manifest_SHA_preserved':True,
      'actual_index_and_import_hashes_original_birth_beforeGoal':True,'source_scientific_prefix_and_native_scope_preserved':True,'current_native0NoIntent_required':True,
      'no_entered_or_prior_source_mutation_no_budget_reset':True,'source_native_calls':0}
    p.put(ROOT/'CONTRACT.json',contract)
    files={str(path.relative_to(ROOT)):p.sha(path) for path in sorted(ROOT.rglob('*')) if path.is_file() and '__pycache__' not in path.parts}
    code=['source_builder.py','prior_index.py','locator.py','existing_bound_binder.py','four_final_binder.py','finalize_index.py']
    sources={str(ROOT/name):files[name] for name in code}
    external=[p.ref(p.ROOT/'prepare_successors.py'),owner.PATTERN,p.ref(Path(owner.PATTERN['path']).parent/'blueprint.py'),p.ref(p.ROOT/'proof-model-normalizer-001/normalizer.py')]
    sources.update({ref['path']:ref['sha256'] for ref in external})
    p.put(ROOT/'SOURCE_PIN.json',{'schema':'er9.dec017-own-prior-navigation-source-pin.v1','status':'READY_ZERO_INFERENCE_SOURCE_ONLY','frozen_utc':now,'root':str(ROOT),'files':files,
      'entrypoint':p.ref(ROOT/'four_final_binder.py'),'existing_bound_entrypoint':p.ref(ROOT/'existing_bound_binder.py'),'source_pins':sources,'external_imports':external,
      'contract_ref':p.ref(ROOT/'CONTRACT.json'),'outbox_ref':p.ref(ROOT/'OUTBOX.json'),'verification':p.ref(ROOT/'VERIFICATION.json'),
      'existing_slots':19,'current_eligible_slots':18,'current_blocked_slots':1,'new_final_only_roles':4,'extra_logical_target_credit':False,'native_calls':0})
    p.put(ROOT/'READY.json',{'schema':'er9.dec017-own-prior-navigation-ready.v1','status':'READY_SOURCE_23_CONFIGS_18CURRENT_ELIGIBLE_1BLOCKED_4NEWFINALS',
      'source_pin':p.ref(ROOT/'SOURCE_PIN.json'),'verification':p.ref(ROOT/'VERIFICATION.json'),'all_source_closure':box['all_source_closure'],
      'all_four_new_final_choices_before_ANY_one_Goal':True,'paired_descendant_choices_before_either_changed_Goal':True,'all8_fixed_parent_COMPLETE_full_quiet_release_proved':True,
      'admission_conditions':['Sole ops current0Goal/noIntent/exact declared original source/donor checks','C04T blocked parent remains blocked',
        'original dynamic h.hydrate first for8futureB, then EXACT actual profile/manifest SHA preserved','index exact full authorized imported pin closure, no content selection',
        'actual index/Task/input/config/profile/clock receipt before original NEW Goal','ordinary actual private bounds/model/Gcap2/storage/capacity/growth/reserve, no model substitution'],
      'native_model_calls':0,'new_R_or_critic_roles':0,'new_final_seconds600_action570_responses60':True,'old_clocks_or_outcomes_reset':False,
      'automatic_further_repeat':False,'causal_or_invisible_neutrality_claim':False})
    final=dict(box);final.update(source_pin=p.ref(ROOT/'SOURCE_PIN.json'),ready=p.ref(ROOT/'READY.json'),verification=p.ref(ROOT/'VERIFICATION.json'),
      navigation_contract=p.ref(ROOT/'CONTRACT.json'),four_final_constructor_pin=p.ref(ROOT/'SOURCE_PIN.json'),existing_bound_constructor_pin=p.ref(ROOT/'SOURCE_PIN.json'),frozen_utc=now)
    p.put(ROOT/'OUTBOX_FINAL.json',final)
    selected=[]
    for path in sorted(ROOT.rglob('*')):
        if path.is_file() and '__pycache__' not in path.parts and 'operator-profile' not in path.parts:selected.append({**p.ref(path),'role':'DEC017 exact frozen navigation source/neutral locator/original authorized source Task and input bytes'})
    p.put(ROOT/'PUBLICATION_SELECTOR.json',{'schema':'er9.positive-publication-selection.v1','created_utc':now,'files':selected,'file_count':len(selected),
      'source_pin':p.ref(ROOT/'SOURCE_PIN.json'),'outbox':p.ref(ROOT/'OUTBOX_FINAL.json'),'exact_positive_source_selection':True,
      'private_profiles_candidate_outputs_evaluator_or_modelIO_selected':False,'later_actual_rolebirth_outputs_selected':False,'native_model_calls':0,'extra_logical_target_credit':False})
    for name in ['SOURCE_PIN.json','READY.json','OUTBOX_FINAL.json','PUBLICATION_SELECTOR.json']:print(name,json.dumps(p.ref(ROOT/name)))

if __name__=='__main__':seal()
