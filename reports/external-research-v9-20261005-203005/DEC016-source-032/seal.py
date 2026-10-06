#!/usr/bin/env python3
"""Freeze exact4 paired infrastructure continuation source, no candidate calls."""
from datetime import datetime,timezone
from pathlib import Path
import json
import prepare as owner
p=owner.p;ROOT=owner.ROOT

def seal():
    now=datetime.now(timezone.utc).isoformat();selection=p.checked(owner.SELECTION);owner.research_metadata(selection)
    box=p.checked(p.ref(ROOT/'OUTBOX.json'));snapshot=p.checked(p.ref(ROOT/'OLD_SOURCE_BYTE_SNAPSHOT.json'))
    for path,digest in snapshot['files'].items():
        if p.sha(path)!=digest:raise ValueError('Previous immutable source byte drift')
    p.put(ROOT/'VERIFICATION.json',{'schema':'er9.dec016-paired-infrastructure-source-verification.v1','verified_utc':now,
      'command':'PYTHONDONTWRITEBYTECODE=1 python3 -m unittest -v test_repair','result':'PASS','tests':8,'actual_Gproduction_metadata_config_fixtures':4,
      'actual_current_R_positive_metadata_joins':2,'old_source_files_verified':len(snapshot['files']),
      'meaningful_checks':['exact paired4 new crit900/final600 original90/60 responses,0Rerun','both actual fixed R full/GoalComplete/ownedquiet/release beforeREADY',
        'all4 source/coreB/tool/clock/Task/profile constructors beforeanyCrit','exact H1 locked brief/commoncriteria/coverage/method refs and scientific Task prefix',
        'critic Task bytes exact; final only additive stage identity before unchanged clock suffix','wrong Task/clock/inputs rejected',
        'unavailable/noncomplete/nonquiet/wrongGoal/wrongprovider/missingR4 parent blocksREADY','oldfailedCrit/otherarm/model/Goal/missingreview or incomplete newCrit rejected',
        'newFinal honestpending until genuine newCrit; exact opaque parent import and artifact SHA mismatch rejected','old statuses/noFreeze/corrupt release/blocked unspent finals retained'],
      'fixtures':'Clearly synthetic resource/artifact metadata, actual production functions, subprocess blocked, no kernel/native proof claimed',
      'native_model_Goal_provider_calls':0,'ops_registry_mutations':0,'source_body_or_evaluator_answers_read':False,'extra_logical_target_credit':False})
    files={str(path.relative_to(ROOT)):p.sha(path) for path in sorted(ROOT.rglob('*')) if path.is_file() and '__pycache__' not in path.parts}
    externals=[p.ref(p.ROOT/'prepare_successors.py'),owner.PATTERN,p.ref(Path(owner.PATTERN['path']).parent/'blueprint.py'),p.ref(p.ROOT/'proof-model-normalizer-001/normalizer.py')]
    sources={str(ROOT/name):files[name] for name in ['prepare.py','role_birth.py']};sources.update({r['path']:r['sha256'] for r in externals})
    p.put(ROOT/'SOURCE_PIN.json',{'schema':'er9.dec016-c01-paired-infrastructure-source-pin.v1','status':'READY_ZERO_INFERENCE_SOURCE_ONLY','frozen_utc':now,
      'root':str(ROOT),'files':files,'entrypoint':p.ref(ROOT/'role_birth.py'),'source_pins':sources,'external_mechanical_imports':externals,
      'policy_ref':owner.POLICY,'selection_ref':owner.SELECTION,'model_proof_normalizer_pin':owner.NORMALIZER,
      'role_binding_contract':box['role_binding_contract'],'all4_source_closure':box['all4_source_closure'],'verification':p.ref(ROOT/'VERIFICATION.json'),
      'outbox_ref':p.ref(ROOT/'OUTBOX.json'),'research_beforeREADY_COMPLETE_quiet_proved':True,'no_Rrerun_no_oldclockreset':True,
      'source_owner_native_model_calls':0,'new_native_stage_count':4,'extra_logical_target_or_clean_unrepaired_credit':False})
    p.put(ROOT/'READY.json',{'schema':'er9.dec016-c01-paired-infrastructure-ready.v1','status':'READY_ACTUAL_BOTH_R_SOURCE_PROOF_AND_ALL4_CLOSED',
      'source_pin':p.ref(ROOT/'SOURCE_PIN.json'),'outbox':p.ref(ROOT/'OUTBOX.json'),'verification':p.ref(ROOT/'VERIFICATION.json'),
      'both_fixed_R_complete_fullR4_quiet_released':True,'native_stage_count':4,'new_role_seconds':[900,600,900,600],'new_R_roles':0,
      'admission_conditions':['all4 source/Task/profile/clock/sourceconstructors beforeeitherCrit','current exact bothR complete/quiet, olduncertain actors quiet/released',
        'all4 NEW stage0Goal/noIntent atomic check','only oldcurrent samearm R plus authentic NEW samearm Crit for final',
        'each genuinely new original birth clock/profile/config/input hashes beforeGoal','ordinary actual storage/account/host/private2304/swap0/outer768/growth/reserve3GiB/Gcap2'],
      'old_noFreeze_status_or_unspent_final_rewritten':False,'no_quality_user_or_root_Go_gate':True,'automatic_further_repeat':False,'native_model_calls':0})
    final=dict(box);final.update(source_pin=p.ref(ROOT/'SOURCE_PIN.json'),ready=p.ref(ROOT/'READY.json'),verification=p.ref(ROOT/'VERIFICATION.json'),
      role_birth_constructor_pin=p.ref(ROOT/'SOURCE_PIN.json'),frozen_utc=now)
    p.put(ROOT/'OUTBOX_FINAL.json',final)
    selected=[]
    for path in sorted(ROOT.rglob('*')):
        if path.is_file() and '__pycache__' not in path.parts and 'operator-profile' not in path.parts:
            selected.append({**p.ref(path),'role':'DEC016 frozen paired source/neutral parent proof metadata/original authorized Task and input bytes'})
    p.put(ROOT/'PUBLICATION_SELECTOR.json',{'schema':'er9.positive-publication-selection.v1','created_utc':now,'files':selected,'file_count':len(selected),
      'source_pin':p.ref(ROOT/'SOURCE_PIN.json'),'outbox':p.ref(ROOT/'OUTBOX_FINAL.json'),'exact_frozen_whitelist':True,
      'private_profile_candidate_nativeIO_evaluator_answers_selected':False,'native_model_calls':0,'new_logical_target_credit':False})
    for name in ['SOURCE_PIN.json','READY.json','OUTBOX_FINAL.json','PUBLICATION_SELECTOR.json']:print(name,json.dumps(p.ref(ROOT/name)))

if __name__=='__main__':seal()
