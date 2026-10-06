#!/usr/bin/env python3
"""Separate pre-admission transport versions; no live mutation or native starts."""
import argparse
import copy
import json
from pathlib import Path
import shutil
import prepare_successors as p

ROOT=Path(__file__).resolve().parent
POLICY_SHA='6d7eb57a0d726a6e26382e45ee9bbdf36b34b33b08149e9f5174214cb94a67a1'
SCOPE_SHA='428e7e2e3466fd6e2a062dd4d08ea903df700e009ae5849a5eb629f890c486f1'
FINAL_ROLES=['proposal.md','sources.json','witnesses.json','leads.json']
FINAL_PATHS=['out/final/'+x for x in FINAL_ROLES]


def addendum(stage_id):
    # Identical transport content across arms except exact current-stage ID.
    # This explicitly resolves inherited direct-file instructions without
    # changing source meaning, the required four roles or native role duties.
    return '''

# Prospective final delivery transport version — DEC010

The full brief, source duties, method factors, genuine native role functions,
checking/repair duties, four final content roles, model, effort and stage budget
above remain authoritative. This section replaces only the inherited direct
file-by-file serialization of the four canonical final paths. Complete their
same required content by ONE explicit native adoption bundle through your
existing admitted writer. The trusted writer commits those same four files as
one fresh directory; this is the assigned delivery format for this new stage.

Exact current stage_id: STAGE_ID_TOKEN
Read inputs/delivery_role_manifest.json for the immutable current-stage input
reference IDs. An empty entries array means inline content is required; never
invent an ID or path, assume inheritance, or use an absent-slot fallback.

Reserve out/final as an absent fresh canonical commit directory. Do not create
it or write its four files directly. Keep working maps, execution/check notes
and scratch outside that directory, for example under out/scratch. A role's
optional review remains optional and separate, for example out/review.md; it
cannot replace any required final role. V08 combined stages still perform both
genuine independent critique and complete current final authorship in this
same Goal. V05 intermediate revision and flash roles are unchanged.

Use the existing writer to write out/final_bundle.json as a complete JSON object
with EXACTLY these keys: schema, stage_id, adopt_current, artifacts.
schema must equal "er9.native_endorsed_delivery.v1"; stage_id must equal the
exact current stage ID above; adopt_current must be true. artifacts must contain
EXACTLY proposal.md, sources.json, witnesses.json and leads.json. Select EACH
role explicitly using exactly ONE selector: {"text_utf8": "your full UTF-8 role
content"} OR {"input_id": "a listed compatible immutable role ID you adopt"}.
Do not mix selectors, omit a role, alias a proposal/review to a catalog, or
silently reuse an unchosen catalog. The three catalog contents must be valid
JSON and must still satisfy every original source/output duty. An explicit
input reference preserves that earlier native author's exact bytes and records
your adoption of those bytes for this current final; the host does not correct
or semantically qualify them. Supply the actual full current proposal content
or explicitly adopt an admitted compatible proposal reference.

The existing writer returns the complete four-file materialization receipt
before you may complete this assigned final-delivery Goal. If it rejects the
bundle, address that concrete serialization issue within this SAME original
stage budget; no later deadline, helper, repeated Goal, resource increase or
automatic alternate method is allocated. A successful bundle commit is separate
from actual native Goal completion, owned cleanup and independent source/quality
assessment. Disclose unresolved source limits and dependencies honestly in the
unchanged authored outputs. No correctness, source PASS or useful coverage is
inferred from successful serialization.
'''.replace('STAGE_ID_TOKEN',stage_id)


def pins(tools_ref):
    policy=p.checked({'path':str(p.LAB/'supervision/DECISIONS-010.json'),'sha256':POLICY_SHA})
    scope=p.checked({'path':str(p.LAB/'supervision/DECISIONS-010-SCOPE-ADDENDUM-001.json'),'sha256':SCOPE_SHA})
    tool=p.checked(tools_ref)
    if tool.get('version') not in {'v1.4-bundle','1.4-bundle'}:
        raise ValueError('Exact prospective bundle tool version required')
    return policy,scope,tool


def prepare(source_registration_ref, tools_ref, destination='bundle-transport001',
            exclude_original_job_ids=(), classification_override=None,
            native_source_pin_ref=None, extra_imports_by_source_job=None):
    policy,scope,tool=pins(tools_ref)
    source=p.checked(source_registration_ref)
    if not native_source_pin_ref:
        raise ValueError('Explicit READY native runtime binding for exact v1.4 tools pin required')
    native=p.checked(native_source_pin_ref)
    if native.get('status') not in {'MECHANICALLY_READY','READY','SOURCE_READY','READY_ZERO_INFERENCE'}:
        raise ValueError('Bundle native-source readiness not positively pinned')
    admitted=(native.get('tools_source_pins_sha256') or native.get('admitted_tools_source_pins_sha256')
              or native.get('tools_source_pins',{}).get('sha256'))
    if admitted!=tools_ref['sha256']:
        raise ValueError('Native runtime does not explicitly admit this exact bundle tool source pin')
    oldcard=p.checked({'path':source['card_path'],'sha256':source['card_sha256']})
    if oldcard.get('method_id')=='V06':
        raise ValueError('Both V06 arms excluded; existing zero-fuzz amendment method retained')
    rows=[x for x in source['stage_jobs'] if x['job_id'] not in exclude_original_job_ids
          and p.checked({'path':x['stage_json'],'sha256':x['stage_sha256']})['required_artifacts']==FINAL_PATHS]
    if not rows:raise ValueError('No declared complete-final role in source registration')
    classification=classification_override or source['scientific_recovery_mode']
    if classification in {'entered_matched_lineage','wholly_unstarted_pair'} and {r['arm'] for r in rows}!={'control','treatment'}:
        raise ValueError('Matched transport version must opt in both final arms')
    pair=source['pair_id']+'-BUNDLE-R001';root=ROOT/destination/pair
    root.mkdir(parents=True,exist_ok=False)
    common=p.checked(source['resource_binding']);common=copy.deepcopy(common)
    common.update(tools_source_pins=tools_ref,delivery_policy_ref={'path':str(p.LAB/'supervision/DECISIONS-010.json'),'sha256':POLICY_SHA},
                  delivery_scope_ref={'path':str(p.LAB/'supervision/DECISIONS-010-SCOPE-ADDENDUM-001.json'),'sha256':SCOPE_SHA},
                  source_resource_envelope_model_clock_unchanged=True,
                  final_transport='explicit native adopted complete four-role bundle; existing writer only')
    common['source_pin']=native_source_pin_ref
    common['explicit_native_bundle_tool_binding_required']=True
    entrypoint=native.get('entrypoint') or native.get('worker',{}).get('path')
    if not entrypoint:raise ValueError('Exact admitted bundle runtime entrypoint required')
    if Path(entrypoint).is_absolute():common['native_stage_runner']=entrypoint
    elif entrypoint.startswith('dev/'):common['native_stage_runner']=str(p.LAB/entrypoint)
    elif entrypoint.startswith('versions/'):common['native_stage_runner']=str(p.LAB/'dev/luna-route'/entrypoint)
    else:common['native_stage_runner']=str(Path(native_source_pin_ref['path']).parent/entrypoint)
    if source['family']=='Z':
        from bind_fresh_runtime import BUNDLE, BUNDLE_INTEGRATION
        if native_source_pin_ref!=BUNDLE:raise ValueError('Prospective GLM bundle must use coherent repaired runtime')
        integration=p.checked(BUNDLE_INTEGRATION)
        if integration['pin']!=native_source_pin_ref:raise ValueError('Exact native bundle integration mismatch')
        common['resource_contract']=integration['contract']
        common['glm_stage_options']=integration['stage_glm_resource']
        common['resource_definition']=integration['row_resource_definition']
    p.put(root/'COMMON_RESOURCE_BINDING.json',common)
    card=copy.deepcopy(oldcard);card.update(pair_id=pair,source_pair_id=source['pair_id'],
             resource_version='prospective final transport only; inherited resource/card factors',
             required_resource_binding=p.ref(root/'COMMON_RESOURCE_BINDING.json'))
    p.put(root/'card.json',card)
    jobs=[];preservation=[]
    for row in rows:
        original=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
        stage_id=row['job_id']+'-BUNDLE-R001';run=root/stage_id;ws=run/'workspace'
        ws.mkdir(parents=True);(ws/'out').mkdir()
        inherited=ws/'TASK.inherited.md'
        p.clone_bytes(original['prompt_file'],inherited,original['prompt_sha256'],original['workspace'])
        suffix=addendum(stage_id);task=ws/'TASK.md'
        with task.open('wb') as f:
            f.write(inherited.read_bytes());f.write(suffix.encode('utf-8'))
        p.put(run/'TRANSPORT_ADDENDUM.json',{'schema':'er9.prospective-final-transport-addendum.v1',
                  'stage_id':stage_id,'suffix_utf8':suffix,'inherited_task_ref':{'path':original['prompt_file'],'sha256':original['prompt_sha256']},
                  'policy_ref':common['delivery_policy_ref'],'scope_ref':common['delivery_scope_ref'],
                  'new_tools_or_tool_schema_changes':0,'role_semantic_or_budget_changes':False,
                  'canonical_paths':FINAL_PATHS,'native_starts':0})
        newpins={}
        for path,digest in original['input_pins'].items():
            relative=Path(path).relative_to(original['workspace']);target=ws/relative
            p.clone_bytes(path,target,digest,original['workspace']);newpins[str(target)]=digest
        for item in (extra_imports_by_source_job or {}).get(row['job_id'],[]):
            target=ws/item['destination_relative']
            p.clone_bytes(item['path'],target,item['sha256'],item['source_workspace'])
            newpins[str(target)]=item['sha256']
        new=copy.deepcopy(original)
        new.update(job_id=stage_id,pair_id=pair,workspace=str(ws),prompt_file=str(task),
                   prompt_sha256=p.sha(task),out=str(run/'native'),freeze_out=str(run/'OUTPUT_FREEZE.json'),
                   tools_config=None,tools_config_sha256=None,input_pins=newpins,
                   required_common_resource_binding=p.ref(root/'COMMON_RESOURCE_BINDING.json'),
                   inherited_resource_stage_ref={'path':row['stage_json'],'sha256':row['stage_sha256']},
                   source_stage_ref={'path':row['stage_json'],'sha256':row['stage_sha256']},
                   required_delivery_role_manifest='inputs/delivery_role_manifest.json',
                   dynamic_role_manifest_binding_required=True,delivery_transport_addendum=p.ref(run/'TRANSPORT_ADDENDUM.json'))
        new.pop('role_import_pins',None)
        if source['family']=='Z':
            new['glm_resource']=copy.deepcopy(common['glm_stage_options'])
            new['glm_resource'].update(capture_dir=str(run/'public_captures'),evidence_dir=str(run/'tool-evidence'),
                                      execution_enabled=row['execution_enabled'],public_get=row['public_get'])
            new['required_resource_contract']=common['resource_contract']
        p.put(run/'prepared-stage.json',new)
        job=copy.deepcopy(row);job.update(job_id=stage_id,stage_json=str(run/'prepared-stage.json'),
                   stage_sha256=p.sha(run/'prepared-stage.json'),expected_freeze=new['freeze_out'],
                   source_job_id=row['job_id'],status='AWAITING_ACTUAL_PREDECESSOR_CLOSURE_AND_NATIVE_PROFILE',
                   reference_closure_binding_required=True)
        jobs.append(job)
        if source['family']=='Z':job['resource_definition']=common['resource_definition']
        preservation.append({'new_job_id':stage_id,'old_pending_job_id':row['job_id'],
                   'original_task_prefix_ref':{'path':original['prompt_file'],'sha256':original['prompt_sha256']},
                   'original_task_bytes':Path(original['prompt_file']).stat().st_size,
                   'suffix_ref':p.ref(run/'TRANSPORT_ADDENDUM.json'),
                   'original_semantic_input_pins':original['input_pins'],
                   'original_role_caps':{k:original.get(k) for k in p.INVARIANTS},
                   'original_registrations_and_tasks_rewritten':False})
    contract={'schema':'er9.prospective-reference-closure-binding-contract.v1',
              'candidate_manifest_path':'inputs/delivery_role_manifest.json',
              'manifest_schema':'er9.native-role-reference-closure.v1',
              'exact_manifest_keys':['schema','stage_id','case_id','arm_id','entries'],
              'entry_schema_status':'READY exact tools API_SCHEMA pin; actual references sealed before this stage native launch',
              'api_schema_ref':p.ref(p.LAB/'dev/tools/versions/v1.4-bundle/API_SCHEMA.json'),
              'operator_binding_ref':p.ref(p.LAB/'dev/tools/versions/v1.4-bundle/operator_binding.py'),
              'exact_entry_keys':['input_id','path','sha256','bytes','artifact_role','case_id','arm_id',
                    'origin_case_id','origin_arm_id','origin_role','origin_job_id','origin_goal_id','origin_session_id',
                    'origin_actor','origin_status','native_proof','admission_kind','shared_seed_authorization'],
              'origin_actor_keys':['family','model','effort'],
              'origin_status_keys':['native_goal_state','output_freeze_state'],
              'allowed_artifact_roles':FINAL_ROLES,'all_reference_bytes_within_exact_admitted_inputs':True,
              'selection':'All compatible admitted same-arm native artifacts by frozen provenance; no content/grade/best-of selection',
              'future_roles':'Only actual same-arm frozen predecessor outputs; never pretend pending roles exist',
              'empty_closure':'Valid only for explicit inline payload authorship; no reference or absent-slot fallback',
              'unknown_origin_goal_identity':'Do not invent a Goal ID; resolve through owned positive Goal metadata or omit that reference entry',
              'actual_binding_before_dispatch_required':True,'profile_source_pin':tools_ref,
              'canonical_output_must_be_absent':'out/final','role_meaning_and_budgets_unchanged':True,
              'native_completion_or_source_grade_inferred':False,'new_native_starts':0}
    p.put(root/'DEFERRED_BINDING_CONTRACT.json',contract)
    p.put(root/'TRANSPORT_PRESERVATION.json',{'schema':'er9.transport-strict-diff-preservation.v1',
           'stages':preservation,'original_frozen_bytes_changed':False,'new_native_starts':0})
    newrequest=copy.deepcopy(source)
    newrequest.update(request_id=pair+'-r001',pair_id=pair,card_path=str(root/'card.json'),
              card_sha256=p.sha(root/'card.json'),stage_jobs=jobs,resource_binding=p.ref(root/'COMMON_RESOURCE_BINDING.json'),
              immutable_pair_input_freeze=p.ref(root/'TRANSPORT_PRESERVATION.json'),
              scientific_recovery_mode=classification,source_registration_ref=source_registration_ref,
              supersedes_pending_stage_job_ids=[r['job_id'] for r in rows],
              dispatch_selection_rule='Sole ops verifies old resource-stage native starts0, freezes successor selection and never admits both versions',
              reference_closure_contract=p.ref(root/'DEFERRED_BINDING_CONTRACT.json'),
              no_new_premium_authored_answers_or_evaluator_feedback_supplied=True,
              native_starts=0,status='PREPARED_NOT_ADMITTED')
    p.put(root/'registration.json',newrequest)
    return p.ref(root/'registration.json')


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--tools-pin',type=Path,required=True);parser.add_argument('--tools-pin-sha256',required=True)
    parser.add_argument('--source-registration',type=Path,required=True);parser.add_argument('--source-registration-sha256',required=True)
    parser.add_argument('--native-source-pin',type=Path,required=True);parser.add_argument('--native-source-pin-sha256',required=True)
    parser.add_argument('--destination',default='bundle-transport001')
    args=parser.parse_args()
    result=prepare({'path':str(args.source_registration.absolute()),'sha256':args.source_registration_sha256},
                   {'path':str(args.tools_pin.absolute()),'sha256':args.tools_pin_sha256},args.destination,
                   native_source_pin_ref={'path':str(args.native_source_pin.absolute()),'sha256':args.native_source_pin_sha256})
    print(json.dumps(result))


if __name__=='__main__':main()
