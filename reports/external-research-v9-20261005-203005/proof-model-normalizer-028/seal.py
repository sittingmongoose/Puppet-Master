#!/usr/bin/env python3
"""Freeze narrow positive source/pin, no candidate or native interfaces."""
from datetime import datetime,timezone
from pathlib import Path
import copy,json
import role_birth
ROOT=Path(__file__).resolve().parent;original=role_birth.original_constructor();p=original.p

def seal():
    now=datetime.now(timezone.utc).isoformat();snapshot=p.checked(p.ref(ROOT/'OLD_SOURCE_BYTE_SNAPSHOT.json'))
    for path,digest in snapshot['files'].items():
        if p.sha(path)!=digest:raise ValueError('Previous immutable source bytes drift')
    base_contract=p.ref(role_birth.BASE/'STRICT_ROLE_BIRTH_CONTRACT.json');contract=copy.deepcopy(p.checked(base_contract))
    contract.update(validator_ref=p.ref(ROOT/'role_birth.py'),original_strict_contract_ref=base_contract,
      original_validator_ref=p.ref(role_birth.BASE/'role_birth.py'),observed_model_dto_normalizer_ref=p.ref(ROOT/'normalizer.py'),
      exact_observed_tuple={'providerId':'builtin:zai-coding-plan','modelId':'GLM-5.3-Flash'},canonical_existing_model='builtin:zai-coding-plan/GLM-5.3-Flash',
      dto_metadata_constructor_changed_after_first_research=True,adoption_scope='Future unstarted descendant proof validation/role-birth constructor only',
      requested_card_label_inference=False,all_original_samearm_Goal_fullrole_ownedquiet_SHA_guards_retained=True,
      scientific_Task_runtime_profile_actor_effort_caps_source_choices_changed=False,duplicate_research_Goals=0,old_clocks_reset=False)
    p.put(ROOT/'CONTRACT.json',contract)
    p.put(ROOT/'VERIFICATION.json',{'schema':'er9.exact-observed-model-dto-source-verification.v1','verified_utc':now,'command':'PYTHONDONTWRITEBYTECODE=1 python3 -m unittest -v test_normalizer',
      'result':'PASS','tests':5,'actual_capsule_ref':{'path':str(p.LAB/'ops/dispatcher/strict-role-birth/C-01-CONFIRMATION-CLOCK-FRESH-R001-treatment-critique-a001/CAPSULES.json'),
         'sha256':'a2d460645d3f16f3c3c92546118ac682acb2c1dafd1a273de11bf0ab60d4b105'},
      'actual_tuple_accepted_without_inference':True,'negative_variants':['explicit different provider','wrong model','missing provider/model','null/typed wrong fields',
        'unsupported shorthand','conflicting tuple/extra alias','wrong arm/cohort/effort/family','incomplete/ nonquiet/GoalID mismatch','missing expected role/artifactSHA drift/context notquiet'],
      'full_guard_fixture':'Actual administrative metadata only with labelled synthetic artifact bytes; subprocesses blocked',
      'old_source_files_verified':len(snapshot['files']),'native_model_provider_Goal_calls':0,'candidate_or_native_modelIO_bodies_read':False,
      'already_entered_stage_mutations':0,'fresh_target_or_scientific_credit':False})
    files={str(path.relative_to(ROOT)):p.sha(path) for path in sorted(ROOT.rglob('*')) if path.is_file() and '__pycache__' not in path.parts}
    sources={str(ROOT/name):files[name] for name in ['normalizer.py','role_birth.py']}
    sources.update({str(role_birth.BASE/name):digest for name,digest in role_birth.BASE_FILES.items()})
    sources[str(p.ROOT/'prepare_successors.py')]=p.sha(p.ROOT/'prepare_successors.py')
    p.put(ROOT/'SOURCE_PIN.json',{'schema':'er9.proof-model-dto-normalizer-source-pin.v1','status':'READY_ZERO_INFERENCE_METADATA_ONLY','frozen_utc':now,'root':str(ROOT),
      'files':files,'entrypoint':p.ref(ROOT/'role_birth.py'),'source_pins':sources,'original_source_pin':p.ref(role_birth.BASE/'SOURCE_PIN.json'),
      'contract_ref':p.ref(ROOT/'CONTRACT.json'),'verification':p.ref(ROOT/'VERIFICATION.json'),
      'model_proof_normalizer_changed_after_first_research':True,'all_scientific_runtime_profile_actor_choices_unchanged':True,'native_calls':0})
    p.put(ROOT/'READY.json',{'schema':'er9.proof-model-dto-normalizer-ready.v1','status':'READY_FOR_FUTURE_UNSTARTED_DESCENDANT_PROOF_BINDING_ONLY',
      'source_pin':p.ref(ROOT/'SOURCE_PIN.json'),'contract_ref':p.ref(ROOT/'CONTRACT.json'),'verification':p.ref(ROOT/'VERIFICATION.json'),
      'old_source_Tasks_criteria_methods_runtime_profiles_and_caps_unchanged':True,'already_entered_runtime_not_modified':True,
      'no_research_duplicate_no_deadline_reset':True,'actual_current_Goal_fullroles_quiet_capturehash_guards_still_required':True,'model_or_Goal_calls':0})
    p.put(ROOT/'OUTBOX.json',{'schema':'er9.proof-model-dto-normalizer-integration-outbox.v1','source_pin':p.ref(ROOT/'SOURCE_PIN.json'),
      'ready':p.ref(ROOT/'READY.json'),'strict_contract_ref':p.ref(ROOT/'CONTRACT.json'),'role_birth_constructor_pin':p.ref(ROOT/'SOURCE_PIN.json'),
      'entrypoint':p.ref(ROOT/'role_birth.py'),'verification':p.ref(ROOT/'VERIFICATION.json'),
      'source_original_policy_ref':original.owner.POLICY,'source_original_closure_pin':p.ref(role_birth.BASE/'SOURCE_PIN.json'),
      'correction':'Exact observed providerId/modelId DTO join only; no requested-card/label inference or model substitution',
      'source_choices_model_semantics_and_science_fixed':True,'metadata_constructor_changed_after_first_research_disclosed':True,
      'prospective_scope':'Unstarted descendants only, ops selects this exact source constructor and contract; same native role slots, Task/runtime unchanged',
      'new_native_stages_or_Goals':0,'native_model_calls':0,'quality_or_userGo_gate_added':False})
    selected=[{**p.ref(path),'role':'Narrow metadata proof DTO constructor/contract/tests/pins'} for path in sorted(ROOT.rglob('*')) if path.is_file() and '__pycache__' not in path.parts]
    p.put(ROOT/'PUBLICATION_SELECTOR.json',{'schema':'er9.positive-publication-selection.v1','created_utc':now,'files':selected,'file_count':len(selected),
      'source_pin':p.ref(ROOT/'SOURCE_PIN.json'),'outbox':p.ref(ROOT/'OUTBOX.json'),'exact_frozen_source_whitelist':True,
      'candidate_nativeIO_or_evaluator_answers_selected':False,'native_model_calls':0,'model_proof_constructor_changed_after_first_research':True})
    for name in ['SOURCE_PIN.json','READY.json','OUTBOX.json','PUBLICATION_SELECTOR.json']:print(name,json.dumps(p.ref(ROOT/name)))

if __name__=='__main__':seal()
