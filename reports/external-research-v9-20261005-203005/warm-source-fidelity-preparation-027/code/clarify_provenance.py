#!/usr/bin/env python3
"""Additive prelaunch report-provenance version. Original sealed files retained."""
import copy,json
from datetime import datetime,timezone
from pathlib import Path
import prepare as owner
p=owner.p;ROOT=owner.ROOT;VERSION=ROOT/'provenance-clarified-002'
SUFFIX=(b'\n\n## Required report provenance\n'
 b'The critic/recovery report is authored by you in this SAME native combined critique+repair Goal. '
 b'Label its provenance as candidate-authored native self-critique/repair of the prior authenticated same-arm artifacts. '
 b'Independent critique above denotes your own fresh audit of those prior artifacts; your report is not a separate '
 b'independent evaluator or Sol source assessment. Do not claim an independent source grade, evaluator PASS, '
 b'quality validation or method superiority from your own report. All checks, changes and unknowns remain your '
 b'candidate-authored work under the unchanged original brief/common criteria, allowed sources, artifacts and1500-second allocation.\n')

def compile_versions():
    original=p.checked(p.ref(ROOT/'OUTBOX_FINAL.json'));pin=p.checked(original['source_pin']);now=datetime.now(timezone.utc).isoformat()
    for relative,digest in pin['files'].items():
        if p.sha(ROOT/relative)!=digest:raise ValueError('Initial source seal changed')
    VERSION.mkdir(exist_ok=False);(VERSION/'PROVENANCE_CLARIFICATION.md').write_bytes(SUFFIX);requests=[];closures=[]
    for ref in original['requests']:
        reg=p.checked(ref);row=reg['stage_jobs'][0];source_ref={'path':row['stage_json'],'sha256':row['stage_sha256']};source=p.checked(source_ref)
        run=VERSION/reg['pair_id']/row['job_id'];ws=run/'workspace';ws.mkdir(parents=True);(ws/'out').mkdir()
        original_task=Path(source['prompt_file']).read_bytes();task=ws/'TASK.md';task.write_bytes(original_task+SUFFIX);inputs={}
        for path,digest in source['input_pins'].items():
            target=ws/Path(path).relative_to(source['workspace']);p.clone_bytes(path,target,digest,source['workspace']);inputs[str(target)]=digest
        selected=copy.deepcopy(source);selected.update(workspace=str(ws),prompt_file=str(task),prompt_sha256=p.sha(task),input_pins=inputs,
          out=str(run/'native'),freeze_out=str(run/'OUTPUT_FREEZE.json'),source_prelaunch_stage_ref=source_ref,
          source_version='DEC015-r002-explicit-same-candidate-report-provenance',report_provenance='same candidate native combined Goal, no independent evaluator/Sol claim')
        p.put(run/'prepared-stage.json',selected);updated=copy.deepcopy(row);updated.update(stage_json=str(run/'prepared-stage.json'),stage_sha256=p.sha(run/'prepared-stage.json'),expected_freeze=selected['freeze_out'])
        full=copy.deepcopy(p.checked(reg['pipeline_closure']));full.update(source_closure_ref=reg['pipeline_closure'],Task_ref=p.ref(task),
          original_neutral_input_pins=inputs,report_provenance_clarification_ref=p.ref(VERSION/'PROVENANCE_CLARIFICATION.md'),source_version='DEC015-r002',
          same_native_stage_functions_and_role_budget_unchanged=True,stage_ids_unchanged_unstarted=True)
        p.put(run.parent/'PIPELINE_CLOSURE.json',full);closures.append(p.ref(run.parent/'PIPELINE_CLOSURE.json'))
        updated_reg=copy.deepcopy(reg);updated_reg.update(request_id=reg['pair_id']+'-r002',stage_jobs=[updated],pipeline_closure=p.ref(run.parent/'PIPELINE_CLOSURE.json'),
          immutable_pair_input_freeze=p.ref(run.parent/'PIPELINE_CLOSURE.json'),source_r001_registration_ref=ref,
          source_version='DEC015-r002-explicit-same-candidate-report-provenance',supersedes_unstarted_source_request_id=reg['request_id'],
          new_additional_native_jobs=0)
        p.put(run.parent/'registration.json',updated_reg);requests.append(p.ref(run.parent/'registration.json'))
    p.put(VERSION/'ALL_FIVE_SOURCE_CLOSURE.json',{'schema':'er9.dec015-all-five-report-provenance-r002.v1','source_r001_all_five_closure':original['all_five_source_closure'],
      'five_warm_role_closures':closures,'all5_clarified_before_ANY_Goal':True,'same5_role_ids_caps_models_and_native_budget':True,'additional_jobs':0,
      'candidate_native_report_not_independent_assessment':True,'new_scientific_hint_rubric_or_answer':False})
    box=copy.deepcopy(original);box.update(requests=requests,source_version='DEC015-r002-explicit-same-candidate-report-provenance',
      source_r001_outbox=p.ref(ROOT/'OUTBOX_FINAL.json'),all_five_source_closure=p.ref(VERSION/'ALL_FIVE_SOURCE_CLOSURE.json'),
      report_provenance_clarification=p.ref(VERSION/'PROVENANCE_CLARIFICATION.md'),additional_native_jobs=0)
    for key in ['source_pin','ready','verification','role_birth_constructor_pin']:box.pop(key,None)
    p.put(VERSION/'OUTBOX.json',box)
    print(json.dumps(p.ref(VERSION/'OUTBOX.json')))

def verify():
    original=p.checked(p.ref(ROOT/'OUTBOX_FINAL.json'));new=p.checked(p.ref(VERSION/'OUTBOX.json'))
    for oldref,newref in zip(original['requests'],new['requests']):
        a=p.checked(oldref);b=p.checked(newref);ar=a['stage_jobs'][0];br=b['stage_jobs'][0]
        s=p.checked({'path':ar['stage_json'],'sha256':ar['stage_sha256']});t=p.checked({'path':br['stage_json'],'sha256':br['stage_sha256']})
        assert t['job_id']==s['job_id'] and t['max_seconds']==1500 and t['max_responses'] is None
        assert Path(t['prompt_file']).read_bytes()==Path(s['prompt_file']).read_bytes()+SUFFIX
        for key in ['bundle_profile','clock_declaration','required_artifacts','strict_warm_role_birth_contract','warm_origin_job_ids','declared_native_source_pin','declared_tool_source_pin']:
            assert t[key]==s[key],key
        assert {Path(path).name:d for path,d in t['input_pins'].items()}=={Path(path).name:d for path,d in s['input_pins'].items()}
        for path,d in t['input_pins'].items():assert p.sha(path)==d
    pin=p.checked(original['source_pin'])
    for relative,digest in pin['files'].items():assert p.sha(ROOT/relative)==digest
    print('r002 provenance/source byte checks PASS: same5 roles, all original r001 bytes retained; no calls')

def seal():
    verify();old=p.checked(p.ref(ROOT/'SOURCE_PIN.json'));box=p.checked(p.ref(VERSION/'OUTBOX.json'));now=datetime.now(timezone.utc).isoformat()
    p.put(VERSION/'VERIFICATION.json',{'schema':'er9.dec015-r002-neutral-provenance-verification.v1','verified_utc':now,'result':'PASS',
      'source_r001_verification':p.ref(ROOT/'VERIFICATION.json'),'original_tests':8,'actual_Lproduction_fixtures':5,'actual_origin_metadata_joins':14,
      'r002_tests':2,'r002_command':'PYTHONDONTWRITEBYTECODE=1 python3 -m unittest -v test_provenance',
      'actual_clarified_Task_Lproduction_metadata_fixtures':5,
      'all5_exact_Task_prefix_plus_common_provenance_suffix':True,'all5_original_input_model_budget_profile_clock_role_id_parity':True,
      'all_r001_and_old6346_source_bytes_unchanged':True,'independent_evaluator_status_not_claimed':True,'native_model_calls':0,'extra_jobs':0})
    files={str(path.relative_to(VERSION)):p.sha(path) for path in sorted(VERSION.rglob('*')) if path.is_file()}
    p.put(VERSION/'SOURCE_PIN.json',{'schema':'er9.dec015-warm-provenance-r002-source-pin.v1','status':'READY_SOURCE_ONLY','frozen_utc':now,'root':str(VERSION),
      'files':files,'entrypoint':old['entrypoint'],'source_pins':{**old['source_pins'],str(ROOT/'clarify_provenance.py'):p.sha(ROOT/'clarify_provenance.py')},
      'source_r001_pin':p.ref(ROOT/'SOURCE_PIN.json'),'all_five_source_closure':box['all_five_source_closure'],'outbox_ref':p.ref(VERSION/'OUTBOX.json'),
      'native_role_count':5,'extra_native_jobs':0,'source_model_calls':0})
    p.put(VERSION/'READY.json',{'schema':'er9.dec015-warm-provenance-r002-ready.v1','status':'READY_SAME_FIVE_PENDING_OPS_ROLE_BIRTH',
      'source_pin':p.ref(VERSION/'SOURCE_PIN.json'),'original_source_ready':p.ref(ROOT/'READY.json'),'candidate_report_provenance_explicit':True,
      'native_jobs_still_exact5':True,'admission':'Original READY gates unchanged, all5 clarified Task closures beforeANY new Goal, atomic0Goal/noIntent source-version selection',
      'actual_native_model_calls':0,'new_scientific_hint_or_rubric':False})
    final=dict(box);final.update(source_pin=p.ref(VERSION/'SOURCE_PIN.json'),ready=p.ref(VERSION/'READY.json'),verification=p.ref(VERSION/'VERIFICATION.json'),
      role_birth_constructor_pin=p.ref(VERSION/'SOURCE_PIN.json'))
    p.put(VERSION/'OUTBOX_FINAL.json',final)
    prior=p.checked(p.ref(ROOT/'PUBLICATION_SELECTOR.json'));items=list(prior['files'])
    items.append({**p.ref(ROOT/'clarify_provenance.py'),'role':'DEC015 additive prelaunch report-provenance constructor'})
    for path in sorted(VERSION.rglob('*')):
        if path.is_file():items.append({**p.ref(path),'role':'DEC015 same-five neutral prospective report-provenance source version'})
    p.put(VERSION/'PUBLICATION_SELECTOR.json',{'schema':'er9.positive-publication-selection.v1','created_utc':now,'files':items,'file_count':len(items),
      'source_pin':p.ref(VERSION/'SOURCE_PIN.json'),'outbox':p.ref(VERSION/'OUTBOX_FINAL.json'),'private_profiles_or_candidate_outputs_selected':False,
      'native_calls':0,'extra_target_or_job_credit':False})
    for name in ['SOURCE_PIN.json','READY.json','OUTBOX_FINAL.json','PUBLICATION_SELECTOR.json']:print(name,json.dumps(p.ref(VERSION/name)))

if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser();parser.add_argument('action',choices=['compile','verify','seal']);args=parser.parse_args()
    {'compile':compile_versions,'verify':verify,'seal':seal}[args.action]()
