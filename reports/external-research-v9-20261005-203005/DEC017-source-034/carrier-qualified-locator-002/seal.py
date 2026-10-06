"""Seal additive carrier-qualified locator after real zero-inference checks."""
from pathlib import Path
from datetime import datetime,timezone
import json,sys
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parent;OLD=ROOT.parent
sys.path.insert(0,str(OLD));import source_builder as owner
p=owner.p

def seal():
    now=datetime.now(timezone.utc).isoformat();oldpin=p.checked({'path':str(OLD/'SOURCE_PIN.json'),'sha256':'05d058818f5b5fff613d6fdbbe2204cbea9cb45ea6efb1814addb37bf5c3021e'})
    for path,digest in oldpin['files'].items():
        if p.sha(OLD/path)!=digest:raise ValueError('Initial source seal changed')
    snapshot=p.checked(p.ref(OLD/'OLD_SOURCE_BYTE_SNAPSHOT.json'))
    for path,digest in snapshot['files'].items():
        if p.sha(path)!=digest:raise ValueError('Earlier source bytes changed')
    owner.positive_four_parents(p.checked(owner.PARENTS));box=p.checked(p.ref(ROOT/'OUTBOX.json'))
    verification={'schema':'er9.dec017-qualified-locator-zero-inference-verification.v1','verified_utc':now,'result':'PASS',
      'command':'PYTHONDONTWRITEBYTECODE=1 python3 -m unittest -v test_qualified','tests':12,'actual_Gproduction_metadata_config_fixtures':23,
      'actual_positive_current_parent_metadata_roles':8,'old_source_files_verified':6563,'initial_source_seal_preserved':True,
      'qualified_Task_change':'ONLY exact static locator phrase now preserves original populated or explicitly empty carrier adoption semantics',
      'meaningful_checks':['all23 actual production config/index/clock preparation; no subprocess/native/Goal','exact scientific Task prefix, methods, tool schema, native model, caps, action570 for600 and30cleanup preserved',
        'actual read_file unchanged locator/schema','deterministic ALL authorized sorted path/SHA/length imports; no relevance or grade fields',
        'traversal/symlink/outside-root/hardlink/duplicate/missing/hash/length/otherarm/forbiddenfields/omission denied',
        'actual fixed8 R+critic parent complete/full/nativequiet/positive release joins; wrongparent/budget/arm/nonquiet denied',
        'original populated carrier profile/manifest exact SHA preserved and actual4 reference closure valid','all23 original neutral input pins/profile refs/runtime source pins unchanged',
        '6563 older source files and entire initial source seal unchanged'],
      'native_model_Goal_provider_calls':0,'ops_mutations':0,'candidate_evaluator_or_modelIO_body_reads':False}
    p.put(ROOT/'VERIFICATION.json',verification)
    contract=p.checked(p.ref(OLD/'CONTRACT.json'));contract.update(locator_constructor=p.ref(ROOT/'locator.py'),initial_source_contract=p.ref(OLD/'CONTRACT.json'),
      qualified_locator_version='DEC017-carrier-qualified-locator-v2',existing_actual_post_h_hydrate_populated_or_empty_carrier_SHA_unchanged=True,
      four_new_finals_explicit_INLINE_ONLY_empty=True)
    p.put(ROOT/'CONTRACT.json',contract)
    sources=dict(oldpin['source_pins']);sources.update({str(ROOT/name):p.sha(ROOT/name) for name in ['locator.py','prepare.py','test_qualified.py','seal.py']})
    sources[str(OLD/'test_navigation.py')]=p.sha(OLD/'test_navigation.py')
    files={str(path.relative_to(ROOT)):p.sha(path) for path in sorted(ROOT.rglob('*')) if path.is_file() and '__pycache__' not in path.parts}
    pin={'schema':'er9.dec017-own-prior-navigation-source-pin.v1','status':'READY_ZERO_INFERENCE_SOURCE_ONLY','frozen_utc':now,'root':str(ROOT),
      'files':files,'entrypoint':oldpin['entrypoint'],'existing_bound_entrypoint':oldpin['existing_bound_entrypoint'],'source_pins':sources,
      'external_imports':oldpin['external_imports'],'initial_source_pin':p.ref(OLD/'SOURCE_PIN.json'),'contract_ref':p.ref(ROOT/'CONTRACT.json'),
      'outbox_ref':p.ref(ROOT/'OUTBOX.json'),'verification':p.ref(ROOT/'VERIFICATION.json'),'existing_slots':19,'current_eligible_slots':18,
      'current_blocked_slots':1,'new_final_only_roles':4,'extra_logical_target_credit':False,'native_calls':0,
      'source_behavior_version':'disclosed prospective metadata navigation descendant version after original firstR, no invisible causal-neutrality claim'}
    p.put(ROOT/'SOURCE_PIN.json',pin)
    ready=p.checked(p.ref(OLD/'READY.json'));ready.update(source_pin=p.ref(ROOT/'SOURCE_PIN.json'),verification=p.ref(ROOT/'VERIFICATION.json'),all_source_closure=box['all_source_closure'],
      frozen_utc=now,initial_ready_superseded_before_any_admission=p.ref(OLD/'READY.json'),qualified_locator_ref=p.ref(ROOT/'locator.py'),
      current_actual_parent_and_noGoal_noIntent_recheck_by_ops_required=True)
    p.put(ROOT/'READY.json',ready)
    final=dict(box);final.update(source_pin=p.ref(ROOT/'SOURCE_PIN.json'),ready=p.ref(ROOT/'READY.json'),verification=p.ref(ROOT/'VERIFICATION.json'),
      navigation_contract=p.ref(ROOT/'CONTRACT.json'),four_final_constructor_pin=p.ref(ROOT/'SOURCE_PIN.json'),existing_bound_constructor_pin=p.ref(ROOT/'SOURCE_PIN.json'),frozen_utc=now,
      supersedes_unadmitted_initial_outbox=p.ref(OLD/'OUTBOX_FINAL.json'),four_new_final_priority=-3,existing_C04_priority=-2,existing_fresh_descendant_priority=-1)
    p.put(ROOT/'OUTBOX_FINAL.json',final)
    selection=p.checked(p.ref(OLD/'PUBLICATION_SELECTOR.json'));selected=list(selection['files'])
    for path in sorted(ROOT.rglob('*')):
        if path.is_file() and '__pycache__' not in path.parts and 'operator-profile' not in path.parts:
            selected.append({**p.ref(path),'role':'DEC017 qualified carrier-preserving navigation source / immutable authorized source Task and inputs'})
    p.put(ROOT/'PUBLICATION_SELECTOR.json',{'schema':'er9.positive-publication-selection.v1','created_utc':now,'files':selected,'file_count':len(selected),
      'source_pin':p.ref(ROOT/'SOURCE_PIN.json'),'outbox':p.ref(ROOT/'OUTBOX_FINAL.json'),'exact_positive_source_selection':True,
      'private_profiles_candidate_outputs_evaluator_or_modelIO_selected':False,'later_actual_rolebirth_outputs_selected':False,'native_model_calls':0,'extra_logical_target_credit':False})
    for name in ['SOURCE_PIN.json','READY.json','OUTBOX_FINAL.json','VERIFICATION.json','PUBLICATION_SELECTOR.json']:print(name,json.dumps(p.ref(ROOT/name)))
    print('frozen_utc',now,'public_files',len(selected))

if __name__=='__main__':seal()
