#!/usr/bin/env python3
"""DEC011 fixed twelve fresh pairs. No candidate/evaluator source interpretation."""
import argparse
import copy
import importlib.util
import json
from pathlib import Path
import shutil
import sys
import prepare_successors as p
import prepare_bundle_transport as transport

ROOT=Path(__file__).resolve().parent
POLICY={'path':str(p.LAB/'supervision/DECISIONS-011.json'),
        'sha256':'6148679524f512108dd689f4c73012995217fb2cca5a4b9d24e145e9b80510ea'}
INVENTORY={'path':str(p.LAB/'supervision/DECISIONS-011-FRESH12-INVENTORY.json'),
           'sha256':'e9554e46b6510d372fcd4b1e178495e625ae10e3f7934c20200d2cffc70238b6'}
TOOLS14={'path':str(p.LAB/'dev/tools/versions/v1.4-bundle/SOURCE_PINS.json'),
         'sha256':'8562c561882e546bb8ecb85c56744c3aae8c81b68cb4897921f851f0515ca7e2'}
LUNA14={'path':str(p.LAB/'dev/luna-route/versions/v1.4-bundle/PIN.json'),
        'sha256':'f1f0ad061b347ac24a4b8e678f60a6d697e35b98cabcb63c1018817b0372edfa'}
OVERLAY={'path':str(ROOT/'COMMON_SOURCE_SEPARATION_OVERLAY_002.md'),
         'sha256':'3e6220e815b2a0435fd03d6a68dd2d30bccb1f299fc95b2d3cf0cccb0e4b282d'}


def source_preparer():
    path=p.LAB/'dev/diagnostic-runner/recovery/prepare_integrated_v2.py'
    spec=importlib.util.spec_from_file_location('existing_fresh_preparer',path)
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    return module,p.ref(path)


def linking_rules():
    return {'schema':'er9.fixed-fresh-role-linking-rules.v1',
            'first_research':'Only frozen brief/access/common neutral method+role instructions; no old proposals/catalogs/critics/evaluator/seed',
            'later_roles':'Exact actual immutable native predecessor outputs from THIS new pair and same arm only; all declared DAG prior roles, no other cohort/arm/confirmation',
            'required_proof':'Positive native Goal activation, original source status/Goal/session, immutable freeze and exact same-job identity/time capsules; no invented hashes or IDs',
            'file_transfer':'Opaque SHA/byte-preserving allowed role/capture copy into same-arm inputs; source code/current-role prompt frozen before first research',
            'reference_closure':'Actual explicit compatible admitted rows through pinned operator_binding; entries absent until actual native role exists; no scan/content/grade/best-of selection',
            'source_context':'All legitimate origin native public captures and their exact metadata, including failed HTTP captures, without quality filtering',
            'bundle_stage_role':'Complete out/final4 revision maps to final_author profile; out/revision intermediate retains original contract; combined roles perform both functions',
            'operator_binding_ref':p.ref(p.LAB/'dev/tools/versions/v1.4-bundle/operator_binding.py'),
            'api_schema_ref':p.ref(p.LAB/'dev/tools/versions/v1.4-bundle/API_SCHEMA.json'),
            'profile_before_current_role_native_start':True,'candidate_bytes_before_existence_claimed':False}


def prepare():
    p.checked(POLICY);inventory=p.checked(INVENTORY);p.checked(TOOLS14);p.checked(LUNA14)
    if p.sha(OVERLAY['path'])!=OVERLAY['sha256']:raise ValueError('Accepted common source separation overlay drift')
    module,preparer_ref=source_preparer();destination=ROOT/'fresh-cohort001'
    rules=linking_rules();p.put(destination/'ROLE_LINKING_RULES.json',rules)
    rule_ref=p.ref(destination/'ROLE_LINKING_RULES.json');requests=[]
    for item in inventory['pairs']:
        card=p.checked(item['source_card_ref']);family={'GLM':'Z','Luna':'L'}[card['candidate_family']]
        recipe={'new_pair_id':item['new_pair_id'],'source_slot':item['source_slot'],
                'source_card_ref':item['source_card_ref'],'mode':'full_fresh',
                'arm_modes':{'control':'full_fresh','treatment':'full_fresh'}}
        base_ref=module.prepare(recipe,POLICY,destination/'source-templates')
        base=p.checked(base_ref);pair=base['pair_id'];root=destination/pair
        root.mkdir(parents=True,exist_ok=False)
        newcard=copy.deepcopy(p.checked({'path':base['card_path'],'sha256':base['card_sha256']}))
        newcard.update(requested_family=card['candidate_family'],candidate_family=card['candidate_family'],
                       card_version='DEC011-fixed-fresh-full-pipeline-r001',cohort_id=inventory['cohort_id'],
                       first_research_old_inputs_supplied=False)
        p.put(root/'card.json',newcard)
        stages=[];closures=[]
        for row in base['stage_jobs']:
            old=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
            complete_final=old['required_artifacts']==transport.FINAL_PATHS
            run=root/row['job_id'];ws=run/'workspace';ws.mkdir(parents=True);(ws/'out').mkdir()
            inherited=ws/'TASK.inherited.md'
            p.clone_bytes(old['prompt_file'],inherited,old['prompt_sha256'],old['workspace'])
            input_pins={}
            for path,digest in old['input_pins'].items():
                relative=Path(path).relative_to(old['workspace'])
                if {'prior','seed','source_context','evaluation'}.intersection(relative.parts):
                    raise ValueError('Fresh base unexpectedly includes old candidate/evaluator inputs')
                target=ws/relative;p.clone_bytes(path,target,digest,old['workspace']);input_pins[str(target)]=digest
            for name,source in [('source_access.json',p.LAB/'cases/source_access.json'),
                                ('source_separation.md',Path(OVERLAY['path']))]:
                target=ws/'inputs'/name;shutil.copyfile(source,target);input_pins[str(target)]=p.sha(source)
            task=ws/'TASK.md'
            suffix=b'\n\n'+Path(OVERLAY['path']).read_bytes()
            if complete_final:suffix+=transport.addendum(row['job_id']).encode('utf-8')
            task.write_bytes(inherited.read_bytes()+suffix)
            spec=copy.deepcopy(old)
            spec.update(workspace=str(ws),prompt_file=str(task),prompt_sha256=p.sha(task),
                        out=str(run/'native'),freeze_out=str(run/'OUTPUT_FREEZE.json'),
                        input_pins=input_pins,source_stage_ref={'path':row['stage_json'],'sha256':row['stage_sha256']},
                        native_family=family,source_separation_overlay=OVERLAY,
                        full_pipeline_linking_rules=rule_ref,runtime_binding_required=True,
                        native_source_binding_status='READY_LUNA' if family=='L' else 'PENDING_ACTUAL_GLM_PLACEMENT_REPAIR',
                        complete_final_owner_role=complete_final)
            engine_ref=(LUNA14 if complete_final else
                        {'path':str(p.LAB/'dev/luna-route/versions/v1.3/PIN.json'),'sha256':p.LUNA_SHA}) if family=='L' else None
            tool_ref=TOOLS14 if complete_final else {'path':str(p.LAB/'dev/tools/versions/v1.3/SOURCE_PINS.json'),'sha256':p.TOOLS_SHA}
            spec['declared_tool_source_pin']=tool_ref
            if engine_ref:
                spec['declared_native_source_pin']=engine_ref
                spec['declared_native_runner']=str(p.LAB/'dev/luna-route/versions'/( 'v1.4-bundle' if complete_final else 'v1.3')/'dynamic_stage_runner.py')
                spec['required_resource_contract']=p.ref(p.LAB/'dev/luna-route/versions/v1.3/RESOURCE_CONTRACT.json')
            if complete_final:
                spec.update(required_delivery_role_manifest='inputs/delivery_role_manifest.json',
                            dynamic_role_manifest_binding_required=True,
                            bundle_profile_role='final_author' if row['stage']=='revision' else row['stage'],
                            bundle_profile_binding_required=True)
            p.put(run/'prepared-stage.json',spec)
            newrow=copy.deepcopy(row);newrow.update(stage_json=str(run/'prepared-stage.json'),stage_sha256=p.sha(run/'prepared-stage.json'),
                     expected_freeze=spec['freeze_out'],native_source_binding_status=spec['native_source_binding_status'],
                     complete_final_owner_role=complete_final,
                     status='PREPARED_NOT_ADMITTED' if family=='L' and not row['prerequisite_job_ids'] else 'AWAITING_RUNTIME_OR_ACTUAL_SAME_ARM_PREDECESSORS')
            stages.append(newrow)
            closures.append({'job_id':row['job_id'],'arm':row['arm'],'stage':row['stage'],
                             'max_seconds':row['max_seconds'],'max_responses':row['max_responses'],
                             'required_artifacts':spec['required_artifacts'],'execution_enabled':row['execution_enabled'],
                             'public_get':row['public_get'],'native_source_pin':engine_ref,
                             'tool_source_pin':tool_ref,'task_ref':{'path':str(task),'sha256':p.sha(task)},
                             'dynamic_role_linking_rule_ref':rule_ref,'bundle_role':complete_final})
        closure={'schema':'er9.both-arm-full-pipeline-closure.v1','pair_id':pair,
                 'cohort_policy':POLICY,'cohort_inventory':INVENTORY,'source_card_ref':item['source_card_ref'],
                 'source_separation_overlay':OVERLAY,'stages':closures,'role_linking_rule_ref':rule_ref,
                 'actual_runtime_closure_complete':family=='L',
                 'GLM_pending_reason':None if family=='L' else 'Actual preactivation private-parent guard failure; pending exact prospective runtime repair before either research starts',
                 'before_either_first_research_required':True,'candidate_hashes_fabricated_before_existence':False,
                 'native_starts':0,'semantic_source_quality_claimed':False}
        p.put(root/'PIPELINE_CLOSURE.json',closure)
        registration=copy.deepcopy(base)
        registration.update(request_id=pair+'-DEC011-r001',card_path=str(root/'card.json'),card_sha256=p.sha(root/'card.json'),
              stage_jobs=stages,track='FRESH_DEVELOPMENT_REPAIR',family=family,
              pipeline_closure=p.ref(root/'PIPELINE_CLOSURE.json'),full_pipeline_closure_before_research=True,
              source_separation_overlay=OVERLAY,native_source_binding_status='READY_LUNA' if family=='L' else 'PENDING_ACTUAL_GLM_PLACEMENT_REPAIR',
              first_research_old_candidate_payloads=False,automatic_retry=False,cohort_id=inventory['cohort_id'],
              original_failure_costs_and_flags_retained=True,status='PREPARED_NOT_ADMITTED',
              scientific_recovery_mode='full_fresh',native_starts=0)
        p.put(root/'registration.json',registration);requests.append(p.ref(root/'registration.json'))
    p.put(destination/'OUTBOX.json',{'schema':'er9.fixed-fresh12-cohort-outbox.v1','cohort_id':inventory['cohort_id'],
             'requests':requests,'pair_count':12,'arm_count':24,'native_stage_count':74,
             'policy_ref':POLICY,'inventory_ref':INVENTORY,'source_separation_overlay':OVERLAY,
             'Luna_closure_pairs_ready':4,'GLM_closure_pairs_pending_repair':8,
             'all_fresh_first_research_requires_actual_both_arm_full_closure':True,
             'no_old_candidate_payloads_or_evaluator_feedback':True,'automatic_full_cohort_repeat':False,
             'confirmation_separate_no_new_gate':True,'native_starts':0})
    print(json.dumps({'outbox':str(destination/'OUTBOX.json'),'sha256':p.sha(destination/'OUTBOX.json'),
                      'pairs':12,'stages':74,'Luna_ready_pairs':4,'GLM_pending_pairs':8,'native_starts':0}))


if __name__=='__main__':prepare()
