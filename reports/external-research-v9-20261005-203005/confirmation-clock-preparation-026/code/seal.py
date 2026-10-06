#!/usr/bin/env python3
"""Freeze a positively tested source package; no candidate or native interfaces."""
from datetime import datetime,timezone
from pathlib import Path
import json
import prepare as owner
p=owner.p;ROOT=owner.ROOT

def seal():
    now=datetime.now(timezone.utc).isoformat();box=p.checked(p.ref(ROOT/'OUTBOX.json'));v=owner.runtime()
    snapshot=p.checked(p.ref(ROOT/'OLD_SOURCE_BYTE_SNAPSHOT.json'))
    for path,digest in snapshot['files'].items():
        if p.sha(path)!=digest:raise ValueError('Old source byte identity drift')
    p.put(ROOT/'VERIFICATION.json',{'schema':'er9.dec014-source-zero-inference-verification.v1','verified_utc':now,
        'command':'PYTHONDONTWRITEBYTECODE=1 python3 -m unittest -v test_retest','result':'PASS','tests':10,
        'actual_selected_production_metadata_clock_wrapped_tool_config_stage_fixtures':22,
        'fixture_scope':'Clearly synthetic resource/origin data. Actual pinned production functions, subprocess launches blocked; no kernel/native proof claim',
        'checks':['all4/both8/all22 locked source and role closures','exact original2700/arm caps/response limits and five first-R inputs',
          'all22 scientific Task byte prefixes + declared identity/clock suffixes','exact H1/H2/common criteria/coverage refs and locked recipe',
          'actual G source/tools/marker/private-bound joins','true combined critic+final versus separate3stage controls; V06 excluded',
          'wrong clock/Task/input/resource/bundle profile and occupied clock input rejected','unknown action remains unknown despite known cleanup stop',
          'exact original22 terminal/ownedquiet and new22 zeroGoal/noIntent cohort gate','strict completed native same-newpair samearm donor roles/captures/GoalID/hash',
          'opaque authenticated role-birth import preserves both200 and404 captures','all6097 prior source bytes unchanged'],
        'old_source_files_verified':len(snapshot['files']),'source_owner_model_Goal_provider_calls':0,'ops_registry_mutations':0,
        'candidate_evaluator_source_answer_semantic_reads':0,'actual_native_pipelines_completed':0})
    excluded={'SOURCE_PIN.json','READY.json','OUTBOX_FINAL.json','PUBLICATION_SELECTOR.json'}
    files={str(path.relative_to(ROOT)):p.sha(path) for path in sorted(ROOT.rglob('*')) if path.is_file() and '__pycache__' not in path.parts and path.name not in excluded}
    externals=[owner.PATTERN,p.ref(Path(owner.PATTERN['path']).parent/'blueprint.py'),p.ref(p.ROOT/'prepare_successors.py')]
    p.put(ROOT/'SOURCE_PIN.json',{'schema':'er9.dec014-confirmation-clock-source-pin.v1','status':'READY_SOURCE_ONLY_CONDITIONAL_ADMISSION',
        'frozen_utc':now,'root':str(ROOT),'files':files,'external_mechanical_imports':externals,
        'policy_ref':owner.POLICY,'feasibility_ref':owner.FEASIBILITY,'feasibility_PIN':owner.FEASIBILITY_PIN,
        'old_recipe_sha256':'2e6a79f793474aa238c5d8e896fbb08e19f4e31a6277aa81095a5338671957db',
        'native_core_pin':v.CORE,'native_bundle_pin':v.BUNDLE,'tool_source_pin':v.TOOLS,'ops_markers':v.MARKERS,
        'outbox_ref':p.ref(ROOT/'OUTBOX.json'),'strict_role_birth_contract':box['strict_role_birth_contract'],
        'verification_ref':p.ref(ROOT/'VERIFICATION.json'),'full4_both8_all22_choices_before_any_new_R':True,
        'original2700_per_arm_unchanged':True,'extra_logical_target_credit':False,'source_model_native_calls':0})
    p.put(ROOT/'READY.json',{'schema':'er9.dec014-confirmation-clock-ready.v1','status':'READY_SOURCE_CLOSURE_CONDITIONAL_NOT_NATIVE_ADMITTED',
        'created_utc':now,'source_pin':p.ref(ROOT/'SOURCE_PIN.json'),'outbox':p.ref(ROOT/'OUTBOX.json'),'verification':p.ref(ROOT/'VERIFICATION.json'),
        'pair_count':4,'arm_count':8,'native_role_count':22,'per_arm_seconds':2700,'total_role_seconds':21600,
        'admission_requires':['all ORIGINAL22 terminal, positive owned native/process/resource quiet and permit release or explicit no-owned-actor absence',
          'exact all NEW22 native starts0/noIntent current atomic proof','all ALL4 BOTH-arm all-role source/Task/profile/tool/runtime choices verified',
          'actual original NEW role resource/clock/config/input hashes before native Goal','strict actual NEW same-arm role prerequisites',
          'ordinary family Gcap2, active+retained growth, private caps and3GiBreserve'],
        'all_old22_terminalquiet_proved_by_this_source_package':False,'source_owner_model_Goal_calls':0,
        'automatic_further_repeat':False,'user_root_quality_Go_required':False,'queue_preparation_hold':False})
    final=dict(box);final.update(source_pin=p.ref(ROOT/'SOURCE_PIN.json'),ready=p.ref(ROOT/'READY.json'),verification=p.ref(ROOT/'VERIFICATION.json'),
        frozen_source_files=len(files),frozen_utc=now,role_birth_binding_constructor=p.ref(ROOT/'role_birth.py'),
        actual_production_metadata_constructor=p.ref(ROOT/'production_metadata.py'))
    p.put(ROOT/'OUTBOX_FINAL.json',final)
    # Positive source selection. Operator-private profiles and any later actual
    # native/candidate/role-birth output are excluded, never wildcard-published.
    selected=[]
    for relative,digest in files.items():
        path=ROOT/relative
        if 'operator-profile' in path.parts:continue
        selected.append({'path':str(path),'sha256':digest,'role':'DEC014 source-only frozen constructor/neutral manifest/original Task and authorized source-input bytes'})
    for name in ['SOURCE_PIN.json','READY.json','OUTBOX_FINAL.json']:
        selected.append({**p.ref(ROOT/name),'role':'DEC014 positive source closure/admission-condition receipt'})
    p.put(ROOT/'PUBLICATION_SELECTOR.json',{'schema':'er9.positive-publication-selection.v1','created_utc':now,'root':str(ROOT),'files':selected,
        'file_count':len(selected),'selection_kind':'Exact positively frozen source whitelist, no subsequent role-birth/native/candidate outputs',
        'source_pin':p.ref(ROOT/'SOURCE_PIN.json'),'outbox':p.ref(ROOT/'OUTBOX_FINAL.json'),
        'private_operator_profiles_selected':False,'credentials_nativeIO_candidate_evaluator_answers_selected':False,
        'model_native_Goal_calls':0,'scientific_or_delivery_pass_claim':False})
    for name in ['SOURCE_PIN.json','READY.json','OUTBOX_FINAL.json','PUBLICATION_SELECTOR.json']:
        print(name,json.dumps(p.ref(ROOT/name)))

if __name__=='__main__':seal()
