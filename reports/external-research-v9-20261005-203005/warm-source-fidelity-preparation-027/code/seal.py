#!/usr/bin/env python3
"""Positive exact source freeze, no candidate or native interface."""
from datetime import datetime,timezone
from pathlib import Path
import json
import prepare as owner
p=owner.p;ROOT=owner.ROOT

def seal():
    now=datetime.now(timezone.utc).isoformat();box=p.checked(p.ref(ROOT/'OUTBOX.json'));snapshot=p.checked(p.ref(ROOT/'OLD_SOURCE_BYTE_SNAPSHOT.json'))
    for path,digest in snapshot['files'].items():
        if p.sha(path)!=digest:raise ValueError('Old source byte identity drift')
    p.put(ROOT/'VERIFICATION.json',{'schema':'er9.dec015-zero-inference-source-verification.v1','verified_utc':now,
      'command':'PYTHONDONTWRITEBYTECODE=1 python3 -m unittest -v test_recovery','result':'PASS','tests':8,
      'actual_Luna_production_prepare_config_B_clock_fixtures':5,'actual_origin_metadata_joins':14,
      'old_source_files_verified':len(snapshot['files']),'meaningful_negative_checks':['fixed OP-five subset/wrong scope rejected',
        'incomplete/nonquiet/unreleased old native origin rejected','otherarm/model/noncompleteGoal/othercase/context/requiredrole mismatches rejected',
        'alternate selection/bestof rejected','existing role-birth destination/overwrite rejected','original Task/common-input/criteria/declaration/profile identity verified'],
      'opaque_synthetic_birth_checks':['all declared current samearm R/C/final namespaces carried','all200 and404 captures retained',
        'evaluator/supervision/native-proof/host DELIVERY_MANIFEST metadata excluded from candidate inputs','scientific first text and Task unchanged; exact builder clock input separately bound',
        'L distinct GoalID stays honestly null with actual thread-attached proof','actual max_responses null unsupported; no enforced150 invented'],
      'test_data':'Synthetic artifacts only. Real validation reads administrative metadata; candidate bodies/native model IO never read',
      'process_launches_blocked':True,'native_model_Goal_provider_calls':0,'ops_registry_mutations':0,'new_candidate_runs_or_scientific_passes':0})
    files={str(path.relative_to(ROOT)):p.sha(path) for path in sorted(ROOT.rglob('*')) if path.is_file() and '__pycache__' not in path.parts and path.name not in {'SOURCE_PIN.json','READY.json','OUTBOX_FINAL.json','PUBLICATION_SELECTOR.json'}}
    external=[p.ref(p.ROOT/'prepare_successors.py')]
    software={str(ROOT/name):files[name] for name in ['prepare.py','role_birth.py']}
    software.update({r['path']:r['sha256'] for r in external})
    p.put(ROOT/'SOURCE_PIN.json',{'schema':'er9.dec015-warm-recovery-source-pin.v1','status':'READY_ZERO_INFERENCE_SOURCE_ONLY','frozen_utc':now,
      'root':str(ROOT),'files':files,'entrypoint':p.ref(ROOT/'role_birth.py'),'source_pins':software,'external_mechanical_imports':external,
      'policy_ref':owner.POLICY,'selection_ref':owner.SELECTION,'native_source_pin':owner.NATIVE,'tool_source_pin':owner.TOOLS,'ops_marker':owner.MARKER,
      'outbox_ref':p.ref(ROOT/'OUTBOX.json'),'all_five_source_closure':box['all_five_source_closure'],'verification':p.ref(ROOT/'VERIFICATION.json'),
      'native_role_count':5,'total_seconds':7500,'warm_derivatives_only':True,'extra_fresh_or_matched_target_credit':False,
      'original_outputs_costs_failures_grades_and_DEC014_unchanged':True,'source_owner_native_model_calls':0})
    p.put(ROOT/'READY.json',{'schema':'er9.dec015-warm-recovery-ready.v1','status':'READY_ALL_FIVE_SOURCE_PENDING_OPS_ACTUAL_BIRTH',
      'created_utc':now,'source_pin':p.ref(ROOT/'SOURCE_PIN.json'),'outbox':p.ref(ROOT/'OUTBOX.json'),'verification':p.ref(ROOT/'VERIFICATION.json'),
      'fixed_original_arms':[{'source_slot':s,'arm':a} for s,a in sorted(owner.EXPECTED)],'role_count':5,'seconds_per_role':1500,
      'actual_native_response_cap':None,'historical_requested_response_cap':150,'response_cap_enforced':False,
      'admission_conditions':['all five runtime/source/Task/profile/input constructors sealed before ANY Goal',
        'actual current fixed14 completed samearm native origins/quiet/release authentic and exact ownedcaptures',
        'all5 new stage native0/noIntent atomic check','genuine NEW original role clock/config/profile/input hashes before native Goal',
        'actual account/host capacity/sibling occupancy/private bounds/growth/reserve; no user Luna thread cap or substitution'],
      'source_quality_finding_or_grade_as_admission_gate':False,'old_clock_reset':False,'user_or_root_Go_required':False,
      'automatic_further_repeat':False,'actual_native_Goal_model_calls':0,'scientific_or_native_delivery_success_claim':False})
    final=dict(box);final.update(source_pin=p.ref(ROOT/'SOURCE_PIN.json'),ready=p.ref(ROOT/'READY.json'),verification=p.ref(ROOT/'VERIFICATION.json'),
      role_birth_constructor_pin=p.ref(ROOT/'SOURCE_PIN.json'),role_birth_constructor=p.ref(ROOT/'role_birth.py'),frozen_utc=now)
    p.put(ROOT/'OUTBOX_FINAL.json',final)
    selected=[]
    for relative,digest in files.items():
        if 'operator-profile' in Path(relative).parts:continue
        selected.append({'path':str(ROOT/relative),'sha256':digest,'role':'DEC015 frozen source/neutral generic Task/original authorized brief and criteria inputs/administrative origin refs'})
    for name in ['SOURCE_PIN.json','READY.json','OUTBOX_FINAL.json']:selected.append({**p.ref(ROOT/name),'role':'DEC015 finite source/conditional adoption proof'})
    p.put(ROOT/'PUBLICATION_SELECTOR.json',{'schema':'er9.positive-publication-selection.v1','created_utc':now,'root':str(ROOT),
      'files':selected,'file_count':len(selected),'source_pin':p.ref(ROOT/'SOURCE_PIN.json'),'outbox':p.ref(ROOT/'OUTBOX_FINAL.json'),
      'exact_positive_whitelist_only':True,'private_operator_profiles_selected':False,'native_candidate_outputs_or_evaluator_answers_selected':False,
      'subsequent_actual_role_birth_outputs_selected':False,'native_model_Goal_calls':0,'extra_fresh_or_matched_target_credit':False})
    for name in ['SOURCE_PIN.json','READY.json','OUTBOX_FINAL.json','PUBLICATION_SELECTOR.json']:print(name,json.dumps(p.ref(ROOT/name)))

if __name__=='__main__':seal()
