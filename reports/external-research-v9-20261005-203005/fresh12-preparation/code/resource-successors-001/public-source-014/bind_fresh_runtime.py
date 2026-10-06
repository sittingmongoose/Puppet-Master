#!/usr/bin/env python3
"""Additive runtime descriptor selection for the exact unstarted DEC011 jobs.

No task, input, model, topology, budget or old descriptor is changed. This is
one replacement source registration selection, never additional native work.
"""
import copy
import json
from pathlib import Path
import prepare_successors as p
import prepare_fresh_cohort as fresh

ROOT=Path(__file__).resolve().parent
BASE={'path':str(p.LAB/'dev/execution/glm-resource-v1/versions/v1.2-connection-lifecycle/PIN.json'),
      'sha256':'cf2973923e4938d5ac0bf408c49497e034c70e14caec851fb6990fd749cb99da'}
BUNDLE={'path':str(p.LAB/'dev/execution/glm-resource-v1/versions/v1.2-bundle-connection-lifecycle/PIN.json'),
        'sha256':'1f1c1c1d327f3cbea1fcda86c0276dfa3505493114c394cc000d54c82f2ac0c7'}
BASE_INTEGRATION={'path':str(Path(BASE['path']).parent/'INTEGRATION_OUTBOX.json'),
                  'sha256':'1ef87d7f6b74a39be7303150eb457dbfa76b6761d8621c3a576c5a56d48d15a4'}
BUNDLE_INTEGRATION={'path':str(Path(BUNDLE['path']).parent/'INTEGRATION_OUTBOX.json'),
                    'sha256':'50a04a6e89fc208881fed92bfbf0a9b63d8d4776cfadda9a62cb21cdfa74a201'}

def integration(bundle):
    pin=BUNDLE if bundle else BASE
    data=p.checked(BUNDLE_INTEGRATION if bundle else BASE_INTEGRATION)
    native=p.checked(pin)
    if native['status']!='READY_ZERO_INFERENCE' or data['pin']!=pin:
        raise ValueError('Exact positive prospective GLM lifecycle closure required')
    if data['stage_glm_resource']['source_pins']!=native['runtime_source_pins']:
        raise ValueError('Actual runtime source closure mismatch')
    expected=fresh.TOOLS14 if bundle else {'path':str(p.LAB/'dev/tools/versions/v1.3/SOURCE_PINS.json'),'sha256':p.TOOLS_SHA}
    if native['tools_source_pins']!=expected:raise ValueError('Tool version mismatch')
    p.checked(expected)
    return pin,data

def prepare():
    source_ref=p.ref(ROOT/'fresh-cohort001/OUTBOX.json');old=p.checked(source_ref)
    destination=ROOT/'fresh-cohort002';requests=[];preservation=[]
    integration(False);integration(True)
    for reg_ref in old['requests']:
        reg=p.checked(reg_ref);root=destination/reg['pair_id']
        original_closure=p.checked(reg['pipeline_closure']);closure=copy.deepcopy(original_closure)
        rows=[];new_closures=[]
        for row,role in zip(reg['stage_jobs'],closure['stages']):
            if row['job_id']!=role['job_id']:raise ValueError('Structural source order mismatch')
            stage_ref={'path':row['stage_json'],'sha256':row['stage_sha256']}
            spec=p.checked(stage_ref);new=copy.deepcopy(spec);newrow=copy.deepcopy(row)
            newrole=copy.deepcopy(role)
            if reg['family']=='Z':
                pin,data=integration(spec['complete_final_owner_role'])
                new.update(declared_native_source_pin=pin,declared_native_runner=data['worker_path'],
                           native_source_binding_status='READY_GLM_COHERENT_V2',
                           required_resource_contract=data['contract'],
                           glm_resource=copy.deepcopy(data['stage_glm_resource']))
                run=root/row['job_id']
                new['glm_resource'].update(capture_dir=str(run/'public_captures'),evidence_dir=str(run/'tool-evidence'),
                         execution_enabled=row['execution_enabled'],public_get=row['public_get'])
                new['runtime_descriptor_predecessor_ref']=stage_ref
                p.put(run/'prepared-stage.json',new)
                newrow.update(stage_json=str(run/'prepared-stage.json'),stage_sha256=p.sha(run/'prepared-stage.json'),
                              native_source_binding_status='READY_GLM_COHERENT_V2',
                              resource_definition=data['row_resource_definition'])
                newrole.update(native_source_pin=pin,runtime_source_pins=p.checked(pin)['runtime_source_pins'],
                               resource_contract=data['contract'],integration_ref=BUNDLE_INTEGRATION if spec['complete_final_owner_role'] else BASE_INTEGRATION)
            else:
                # Existing Luna source binding is reused exactly, with no duplicate packet.
                newrole['runtime_source_pin_selection_unchanged']=True
            newrow['status']='PREPARED_NOT_ADMITTED' if not row['prerequisite_job_ids'] else 'AWAITING_ACTUAL_SAME_ARM_PREDECESSORS'
            rows.append(newrow);new_closures.append(newrole)
            preservation.append({'job_id':row['job_id'],'source_stage_ref':stage_ref,
                  'selected_stage_ref':{'path':newrow['stage_json'],'sha256':newrow['stage_sha256']},
                  'task_ref':{'path':spec['prompt_file'],'sha256':spec['prompt_sha256']},
                  'input_pins':spec['input_pins'],'unchanged_fields':{k:spec.get(k) for k in p.INVARIANTS},
                  'native_starts':0})
        closure.update(stages=new_closures,actual_runtime_closure_complete=True,GLM_pending_reason=None,
                       source_pipeline_closure_ref=reg['pipeline_closure'],prospective_repaired_selection_before_first_research=True)
        p.put(root/'PIPELINE_CLOSURE.json',closure)
        selected=copy.deepcopy(reg)
        selected.update(request_id=reg['pair_id']+'-DEC011-runtime-r002',stage_jobs=rows,
                        pipeline_closure=p.ref(root/'PIPELINE_CLOSURE.json'),root_scope_required=False,
                        native_source_binding_status='READY_GLM_COHERENT_V2' if reg['family']=='Z' else 'READY_LUNA',
                        source_registration_ref=reg_ref,registration_selection_replaces_request_id=reg['request_id'],
                        selection_condition='Ops verifies these exact job IDs remain native0; select one descriptor per job, never add duplicate work',
                        root_or_max_go_required=False)
        p.put(root/'registration.json',selected);requests.append(p.ref(root/'registration.json'))
    p.put(destination/'PRESERVATION.json',{'schema':'er9.additive-runtime-descriptor-preservation.v1',
                   'stages':preservation,'original_tasks_inputs_cards_descriptors_rewritten':False,
                   'additional_native_jobs':0,'native_starts':0})
    result=copy.deepcopy(old)
    result.update(requests=requests,source_outbox_ref=source_ref,GLM_closure_pairs_pending_repair=0,
                  GLM_closure_pairs_ready=8,Luna_closure_pairs_ready=4,
                  coherent_GLM_base_pin=BASE,coherent_GLM_bundle_pin=BUNDLE,
                  preservation_ref=p.ref(destination/'PRESERVATION.json'),additional_native_jobs=0,
                  selection='Replaces source registration bindings for same fixed12/24/74 job IDs; immutable source outbox retained',
                  root_or_max_go_required=False)
    p.put(destination/'OUTBOX.json',result)
    print(json.dumps(p.ref(destination/'OUTBOX.json')))

if __name__=='__main__':prepare()
