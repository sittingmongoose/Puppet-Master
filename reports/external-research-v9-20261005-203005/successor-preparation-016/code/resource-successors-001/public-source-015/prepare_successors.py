#!/usr/bin/env python3
"""Opaque byte-preserving resource versions. No admission, model or semantic reads.

Only frozen JSON metadata is interpreted. TASKs, candidate roles and public source
bodies are copied and hashed as bytes; none is decoded, displayed or corrected.
"""
import argparse
import copy
import hashlib
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent
LAB = ROOT.parents[2]
REQUEST_SHA = '63b93ecaa76edbee919066ca99bfc6fc0ce1247524de3fc49fb5e55be5136bfa'
METADATA_SHA = '3bea72ad2fde3ba285a665c662e5316d617250ade48f8457bc71bf4acc71cf9b'
LOCK_SHA = '2e6a79f793474aa238c5d8e896fbb08e19f4e31a6277aa81095a5338671957db'
LUNA_SHA = '721c86a4d742d821ae05d5d910158372f1beb22e65abcee1565ff9c0e1b54227'
TOOLS_SHA = 'c5f30811d2883e430da963cf8cd539f84a267e3ae19127e791e6c19bde0de621'
FORBIDDEN_PARTS = {'evaluation', 'evaluator', 'host-private', 'private-runtime',
                   'auth', 'secrets', 'sealed', 'native', 'raw-output'}
UNPAIRED = {'I-10-DELIVERY-RECOVERY-R002', 'I-11-DELIVERY-RECOVERY-R002',
            'I-11-CONTROL-DELIVERY-RECOVERY-R003'}
INVARIANTS = ('arm', 'stage', 'max_seconds', 'max_responses', 'required_artifacts',
              'requested_parent_response_cap', 'max_parent_responses',
              'response_cap_enforcement', 'candidate_seed_development')


def sha(path):
    p = Path(path)
    if p.is_symlink() or not p.is_file():
        raise ValueError('Regular immutable file required: ' + str(p))
    h = hashlib.sha256()
    with p.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def ref(path):
    return {'path': str(Path(path).absolute()), 'sha256': sha(path)}


def checked(r):
    if sha(r['path']) != r['sha256']:
        raise ValueError('Pinned metadata drift: ' + r['path'])
    return json.loads(Path(r['path']).read_text())


def put(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        raise ValueError('Frozen owned artifact already exists: ' + str(path))
    path.write_text(json.dumps(data, indent=2, sort_keys=True) + '\n')


def allowed_input(path, workspace):
    p = Path(path)
    p.relative_to(Path(workspace))
    if FORBIDDEN_PARTS.intersection(p.parts):
        raise ValueError('Private/evaluator/native input denied')
    return p


def clone_bytes(original, target, expected, workspace):
    original = allowed_input(original, workspace)
    if sha(original) != expected:
        raise ValueError('Opaque input bytes changed: ' + str(original))
    target = Path(target)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(original, target)
    if sha(target) != expected:
        raise ValueError('Opaque input copy identity failed')


def inventory():
    request = checked({'path': str(LAB/'ops/dispatcher/RESOURCE_SUCCESSOR_REQUEST.json'),
                       'sha256': REQUEST_SHA})
    checked({'path': str(LAB/'ops/dispatcher/RESOURCE_ENTERED_LINEAGE_METADATA.json'),
             'sha256': METADATA_SHA})
    lock = checked({'path': str(LAB/'supervision/DECISIONS-007-RECIPE-LOCK.json'),
                    'sha256': LOCK_SHA})
    if lock['status'] != 'LOCKED':
        raise ValueError('Confirmation recipe not locked')
    return request


def blueprint():
    request = inventory()
    rows = []
    snapshots = {}
    for group, items in request['groups'].items():
        for row in items:
            stage = checked({'path': row['prepared_stage_json'],
                             'sha256': row['prepared_stage_sha256']})
            for path, digest in stage['input_pins'].items():
                allowed_input(path, stage['workspace'])
                if sha(path) != digest:
                    raise ValueError('Frozen original input drift')
                snapshots[path] = digest
            snapshots[stage['prompt_file']] = stage['prompt_sha256']
            for field in [('card_path','card_sha256'),
                          ('prepared_stage_json','prepared_stage_sha256')]:
                if sha(row[field[0]]) != row[field[1]]:
                    raise ValueError('Frozen original metadata drift')
                snapshots[row[field[0]]] = row[field[1]]
            classification = ('unpaired_warm_delivery_continuation'
                              if row['pair_id'] in UNPAIRED else group)
            rows.append({'legacy_job_id': row['job_id'], 'legacy_pair_id': row['pair_id'],
                         'arm': row['arm'], 'stage': row['stage'], 'family': row['family'],
                         'classification': classification,
                         'successor_pair_id': row['pair_id']+'-RESOURCE-R001',
                         'task_ref': {'path': stage['prompt_file'], 'sha256': stage['prompt_sha256']},
                         'source_card_ref': {'path': row['card_path'], 'sha256': row['card_sha256']},
                         'source_stage_ref': {'path': row['prepared_stage_json'], 'sha256': row['prepared_stage_sha256']},
                         'max_seconds': row['max_seconds'], 'max_responses': row['max_responses'],
                         'required_artifacts': stage['required_artifacts'],
                         'old_status_at_request': row['status'],
                         'native_starts_at_request': row['current_pending_job_native_starts_observed'],
                         'input_count': len(stage['input_pins']),
                         'semantic_input_or_evaluation_read': False})
    plan = {'schema': 'er9.neutral-resource-successor-blueprint.v1',
            'request_ref': {'path': str(LAB/'ops/dispatcher/RESOURCE_SUCCESSOR_REQUEST.json'), 'sha256': REQUEST_SHA},
            'entered_metadata_ref': {'path': str(LAB/'ops/dispatcher/RESOURCE_ENTERED_LINEAGE_METADATA.json'), 'sha256': METADATA_SHA},
            'recipe_lock_ref': {'path': str(LAB/'supervision/DECISIONS-007-RECIPE-LOCK.json'), 'sha256': LOCK_SHA},
            'policy_refs': [ref(LAB/'supervision'/name) for name in [
                'DECISIONS-007.json', 'DECISIONS-007-RECOVERY-SELECTION.json',
                'DECISIONS-007-BUDGET-DEFINITION-ADDENDUM-001.json',
                'DECISIONS-008.json', 'DECISIONS-008-ALL-OWNED-GROWTH-ADDENDUM-001.json']],
            'source_pending_rows': len(rows), 'rows': rows,
            'entered_pair_rule': 'Declare both arms in a separate common resource lineage; never mutate only the old partner',
            'unpaired_rule': 'I10 treatment and split I11 continuations remain separately charged unpaired warm deliveries; no added counterpart for counts',
            'source_role_rule': 'DEC007 first chronological compatible genuine same-arm role; source SHA identity, actual Goal activation, and owned quiescence; missing role needs fresh native stage',
            'native_family_rule': 'Luna stays L/GPT-6 Luna; GLM stays Z/GLM 5.3 Flash; original effort preserved',
            'old_originals_rule': 'Immutable original results, incomplete flags, clocks and all failed/recovery costs retained',
            'confirmation_rule': 'Unchanged original locked recipes and22stage packets; all4pairs after initial slots terminal; no quality PASS or all32 gate',
            'admission_rule': 'Sole ops admits after full envelope and all active/retained G/L remaining growth plus3GiBreserve; unknown growth blocks; native family guard',
            'L37_existing_v13_seals_duplicated': False,
            'new_native_starts': 0, 'pipeline_completion_or_quality_claimed': False}
    put(ROOT/'BLUEPRINT.json', plan)
    put(ROOT/'ORIGINAL_BYTE_SNAPSHOT.json', {'schema':'er9.original-byte-snapshot.v1',
                                           'files': snapshots, 'raw_bodies_stored':False})
    return plan


def binding(family, glm_ref=None):
    tools = {'path': str(LAB/'dev/tools/versions/v1.3/SOURCE_PINS.json'), 'sha256': TOOLS_SHA}
    checked(tools)
    if family == 'L':
        source = {'path': str(LAB/'dev/luna-route/versions/v1.3/PIN.json'), 'sha256': LUNA_SHA}
        pin = checked(source)
        if pin.get('status') != 'MECHANICALLY_READY':
            raise ValueError('Luna source not mechanically READY')
        contract = ref(LAB/'dev/luna-route/versions/v1.3/RESOURCE_CONTRACT.json')
        runner = str(LAB/'dev/luna-route/versions/v1.3/dynamic_stage_runner.py')
    elif family == 'Z' and glm_ref:
        source = glm_ref; pin = checked(source)
        if pin.get('status') not in {'MECHANICALLY_READY','READY','SOURCE_READY','READY_ZERO_INFERENCE'}:
            raise ValueError('GLM complete-envelope source not READY')
        integration=checked({'path':str(LAB/'dev/execution/glm-resource-v1/INTEGRATION_OUTBOX.json'),
                             'sha256':'0d8f137168579d7bd334458c33533baa2981240742b2269f733c52f0c803b80b'})
        if integration['pin']!=source:raise ValueError('GLM source/integration binding mismatch')
        contract=integration['contract']
        checked(contract)
        runner=integration['worker_path']
        if not runner:
            raise ValueError('GLM native entrypoint required')
        if not Path(runner).is_absolute():
            runner=str(LAB/runner) if runner.startswith('dev/') else str(Path(source['path']).parent/runner)
    else:
        raise ValueError('No READY exact native-family source binding')
    result={'schema':'er9.prospective-common-resource-binding.v1','family':family,
            'source_pin':source,'tools_source_pins':tools,'resource_contract':contract,
            'native_stage_runner':runner,'aggregate_memory_max_bytes':2415919104,
            'aggregate_swap_max_bytes':0,'outer_worker_memory_max_bytes':805306368,
            'host_reserve_bytes':3221225472,'all_active_and_retained_G_L_growth_required':True,
            'unknown_legacy_growth_admits':False,'research_fit':'UNKNOWN',
            'actual_runtime_placement_before_inference_required':True,
            'resource_oom_failure_charged':True,'automatic_resource_model_or_clock_escalation':False}
    if family=='Z':
        if not pin.get('runtime_source_pins'):raise ValueError('GLM actual runtime source closure required')
        result['glm_stage_options']=integration['stage_glm_resource']
        result['resource_definition']=integration['row_resource_definition']
        result['integration_outbox_ref']={'path':str(LAB/'dev/execution/glm-resource-v1/INTEGRATION_OUTBOX.json'),
                                         'sha256':'0d8f137168579d7bd334458c33533baa2981240742b2269f733c52f0c803b80b'}
    return result


def model_guard(family, model):
    if {'L':'GPT-6 Luna','Z':'GLM 5.3 Flash'}.get(family) != model:
        raise ValueError('Native model/family mismatch')


def registration_metadata(row):
    registration = row.get('owner_registration')
    if registration:
        data = checked(registration)
        step = next((x for x in data.get('stage_jobs',[]) if x['job_id']==row['job_id']),None)
        if step:
            return data,step
    if row['arm']=='seed':
        domain = row['pair_id'][-1]
        path = LAB/f'dev/diagnostic-runner/seed-recovery/registration/SEED-DEV-{domain}-fixed-base-dec006-r002.json'
        data = json.loads(path.read_text())
        step = next(x for x in data['stage_jobs'] if x['job_id']==row['job_id'])
        return data,step
    card = checked({'path':row['card_path'],'sha256':row['card_sha256']})
    stages = card.get('stages',{}).get(row['arm'],card.get(row['arm']+'_stages',[]))
    step = next(x for x in stages if x['stage']==row['stage'])
    data = {'requested_model':card['requested_model'], 'requested_effort':card['requested_effort'],
            'source_slot':card.get('source_slot',row['pair_id'])}
    return data,{'execution_enabled':step.get('execution_enabled',True),
                 'public_get':step.get('public_get',True),
                 'prerequisite_job_ids':row.get('prerequisite_job_ids',[]),
                 'stage_index':stages.index(step)}


def prepare_pair(rows, classification, common_binding, batch,
                 source_roles=None, deferred=None, extra_gate=None, imports_by_job=None):
    if not rows:
        raise ValueError('No successor roles')
    pair = rows[0]['pair_id']+'-RESOURCE-R001'
    if len({x['pair_id'] for x in rows}) != 1 or len({x['family'] for x in rows}) != 1:
        raise ValueError('One coupled lineage/native family per request')
    paired = classification in {'entered_matched_lineage','wholly_unstarted_pair'}
    arms = {x['arm'] for x in rows}
    if paired and arms != {'control','treatment'}:
        raise ValueError('Paired successor cannot mutate only one arm')
    root = ROOT/batch/pair
    root.mkdir(parents=True,exist_ok=False)
    metadata, _ = registration_metadata(rows[0])
    model_guard(rows[0]['family'],metadata['requested_model'])
    common_ref = ROOT/batch/'COMMON_RESOURCE_BINDING.json'
    if not common_ref.exists():
        put(common_ref,common_binding)
    elif json.loads(common_ref.read_text()) != common_binding:
        raise ValueError('Common prospective resource binding changed')
    # The scientific card remains byte-identical. New execution identity lives in
    # a host-only version envelope rather than editing product/method prose.
    source_cards = {x['card_path']:x['card_sha256'] for x in rows}
    card_refs = [{'path':k,'sha256':v} for k,v in source_cards.items()]
    for r in card_refs:
        checked(r)
    old_card=checked(card_refs[0])
    envelope = {'schema':'er9.resource-version-scientific-card-envelope.v1',
                'pair_id':pair,'source_pair_id':rows[0]['pair_id'],
                'source_cards':card_refs,'resource_binding':ref(common_ref),
                'classification':classification,'both_arms_coupled':paired,
                'scientific_card_bytes_changed':False,'task_bytes_changed':False,
                'source_brief_common_criteria_outputs_method_budgets_changed':False,
                'requested_model':metadata['requested_model'],'requested_effort':metadata['requested_effort'],
                'original_attempts_results_flags_and_all_costs_preserved':True,
                'fresh_matched_comparison_credit':False,
                'new_native_starts':0}
    put(root/'RESOURCE_VERSION.json',envelope)
    card=copy.deepcopy(old_card)
    card.update(pair_id=pair,source_pair_id=rows[0]['pair_id'],source_card_ref=card_refs[0],
                requested_model=metadata['requested_model'],requested_effort=metadata['requested_effort'],
                requested_family={'L':'Luna','Z':'GLM'}[rows[0]['family']],
                candidate_family={'L':'Luna','Z':'GLM'}[rows[0]['family']],
                required_resource_binding=ref(common_ref),resource_version=ref(root/'RESOURCE_VERSION.json'),
                original_attempts_and_costs_preserved=True)
    put(root/'card.json',card)
    original_freezes=[]
    for row in rows:
        spec=checked({'path':row['prepared_stage_json'],'sha256':row['prepared_stage_sha256']})
        if spec.get('pair_freeze') and spec['pair_freeze'] not in original_freezes:
            ancestor=checked(spec['pair_freeze'])
            for path,digest in ancestor.get('host_input_pins',{}).items():
                if sha(path)!=digest:raise ValueError('Original scientific source/common criteria or ancestry bytes drift')
            original_freezes.append(spec['pair_freeze'])
    freeze={'schema':'er9.opaque-resource-successor-pair-freeze.v1','pair_id':pair,
            'source_pair_id':rows[0]['pair_id'],'classification':classification,
            'common_resource_binding':ref(common_ref),'source_cards':card_refs,
            'source_stage_refs':[{'path':x['prepared_stage_json'],'sha256':x['prepared_stage_sha256']} for x in rows],
            'original_input_freeze_refs':original_freezes,
            'source_roles':source_roles or [],'recipe_lock_ref':{'path':str(LAB/'supervision/DECISIONS-007-RECIPE-LOCK.json'),'sha256':LOCK_SHA},
            'original_status_costs_and_clocks_preserved':True,'full_task_input_byte_identity_required':True,
            'native_starts':0,'semantic_candidate_or_evaluator_contents_read':False,
            'pipeline_completion_claimed':False,'actual_runtime_seal_required':True}
    put(root/'PAIR_RESOURCE_FREEZE.json',freeze)
    mapping = {x['job_id']:pair+'-'+x['arm']+'-'+x['stage']+'-a001' for x in rows}
    jobs=[]; copies=[]
    for row in rows:
        old=checked({'path':row['prepared_stage_json'],'sha256':row['prepared_stage_sha256']})
        meta,step=registration_metadata(row)
        if (meta['requested_model'],meta['requested_effort']) != (metadata['requested_model'],metadata['requested_effort']):
            raise ValueError('Coupled model/effort differ')
        job_id=mapping[row['job_id']];run=root/job_id;ws=run/'workspace'
        ws.mkdir(parents=True);(ws/'out').mkdir()
        task=ws/'TASK.md';clone_bytes(old['prompt_file'],task,old['prompt_sha256'],old['workspace'])
        new_pins={}
        for path,digest in old['input_pins'].items():
            relative=Path(path).relative_to(old['workspace']);target=ws/relative
            clone_bytes(path,target,digest,old['workspace']);new_pins[str(target)]=digest
            copies.append({'legacy_job_id':row['job_id'],'source':path,'destination':str(target),
                           'sha256':digest,'opaque_byte_copy':True})
        role_import_pins={}
        for item in (imports_by_job or {}).get(row['job_id'],[]):
            relative=Path(item['destination_relative'])
            if relative.is_absolute() or '..' in relative.parts or not str(relative).startswith('inputs/'):
                raise ValueError('Role import outside this stage inputs')
            target=ws/relative
            if target.exists():
                if sha(target)!=item['sha256']:raise ValueError('Role import overwrites existing different bytes')
            else:
                clone_bytes(item['path'],target,item['sha256'],item['source_workspace'])
            new_pins[str(target)]=item['sha256'];role_import_pins[str(target)]=item['sha256']
            copies.append({'legacy_job_id':row['job_id'],'source':item['path'],'destination':str(target),
                           'sha256':item['sha256'],'opaque_byte_copy':True,
                           'actual_same_arm_role_freeze':item['role_freeze']})
        new=copy.deepcopy(old)
        new.update(job_id=job_id,pair_id=pair,workspace=str(ws),prompt_file=str(task),
                   out=str(run/'native'),input_pins=new_pins,tools_config=None,tools_config_sha256=None,
                   freeze_out=str(run/'OUTPUT_FREEZE.json'),pair_freeze=ref(root/'PAIR_RESOURCE_FREEZE.json'),
                   required_resource_contract=common_binding['resource_contract'],
                   required_common_resource_binding=ref(common_ref),runtime_binding_required=True,
                   source_stage_ref={'path':row['prepared_stage_json'],'sha256':row['prepared_stage_sha256']},
                   source_job_id=row['job_id'],native_family=row['family'])
        if role_import_pins:new['role_import_pins']=role_import_pins
        if row['family']=='Z':
            options=copy.deepcopy(common_binding['glm_stage_options'])
            options.update(capture_dir=str(run/'public_captures'),evidence_dir=str(run/'tool-evidence'),
                           execution_enabled=step.get('execution_enabled',True),public_get=step.get('public_get',True))
            new['glm_resource']=options
        for key in INVARIANTS:
            if new.get(key)!=old.get(key):
                raise ValueError('Declared factor/budget/output drift')
        put(run/'prepared-stage.json',new)
        old_priors=step.get('prerequisite_job_ids',row.get('prerequisite_job_ids',[]))
        priors=[mapping[x] for x in old_priors if x in mapping]
        external=[x for x in old_priors if x not in mapping]
        supplied={proof.get('job_id') for proof in source_roles or []}
        fulfilled=[x for x in external if x in supplied]
        external=[x for x in external if x not in supplied]
        all_old_priors=step.get('all_same_arm_prior_job_ids',old_priors)
        status='AWAITING_ACTUAL_PREDECESSOR_FREEZES' if priors or external else 'PREPARED_NOT_ADMITTED'
        jobs.append({'job_id':job_id,'arm':row['arm'],'stage':row['stage'],
                     'stage_index':step.get('stage_index',0),'max_seconds':new['max_seconds'],
                     'max_responses':new['max_responses'],'stage_json':str(run/'prepared-stage.json'),
                     'stage_sha256':sha(run/'prepared-stage.json'),'expected_freeze':new['freeze_out'],
                     'execution_enabled':step.get('execution_enabled',True),'public_get':step.get('public_get',True),
                     'prerequisite_job_ids':priors,'source_role_freezes_required':external,
                     'supplied_frozen_source_job_ids':fulfilled,
                     'all_same_arm_prior_job_ids':[mapping[x] for x in all_old_priors if x in mapping],
                     'predecessor_aliases':{mapping[x]:x for x in all_old_priors if x in mapping},
                     'pipeline_final':step.get('pipeline_final',new['required_artifacts'][0]=='out/final/proposal.md'),
                     'status':status,'runtime_binding_required':True,'source_job_id':row['job_id']})
        if row['family']=='Z':
            jobs[-1]['resource_definition']=common_binding['resource_definition']
    put(root/'OPAQUE_COPY_RECEIPT.json',{'schema':'er9.opaque-copy-identity.v1','copies':copies,
                                     'task_refs':[{'source':checked({'path':x['prepared_stage_json'],'sha256':x['prepared_stage_sha256']})['prompt_file'],
                                                   'sha256':checked({'path':x['prepared_stage_json'],'sha256':x['prepared_stage_sha256']})['prompt_sha256'],
                                                   'new_job_id':mapping[x['job_id']]} for x in rows],
                                     'body_decoding_or_quality_selection':False})
    request={'schema':'er9.dispatch-registration.v1','request_id':pair+'-r001','pair_id':pair,
             'source_slot':metadata.get('source_slot',rows[0]['pair_id']), 'family':rows[0]['family'],
             'track':rows[0].get('track',old_card.get('track')),
             'requested_model':metadata['requested_model'],'requested_effort':metadata['requested_effort'],
             'card_path':str(root/'card.json'),'card_sha256':sha(root/'card.json'),
             'source_scientific_card_refs':card_refs,'stage_jobs':jobs,
             'root_scope_required':True,'admission_owner':'codex-er9-ops','automatic_retry':False,
             'status':'PREPARED_NOT_ADMITTED','immutable_pair_input_freeze':ref(root/'PAIR_RESOURCE_FREEZE.json'),
             'resource_binding':ref(common_ref),'original_attempts_and_costs_preserved':True,
             'scientific_recovery_mode':classification,'source_role_imports':source_roles or [],
             'deferred_stages':deferred or [],'additional_admission_gate':extra_gate,
             'no_new_premium_authored_answers_or_evaluator_feedback_supplied':True,
             'legitimate_same_arm_native_artifact_handoffs_preserved':True,'native_starts':0}
    if classification=='shared_unscored_role':
        request.update(candidate_seed_development=True,scored_comparison=False,
                       count_in_diagnostic_denominator=False,cold_cost_charged_separately=True)
    put(root/'registration.json',request)
    return ref(root/'registration.json')


def role_import(freeze_ref, arm, stage, minimum_paths):
    """Interpret only a genuine same-arm role's OUTPUT_FREEZE metadata."""
    data=checked(freeze_ref)
    if (data.get('arm')!=arm or data.get('stage')!=stage or
        (data.get('native_goal_starts') or 0)<1 or data.get('native_quiescent') is not True):
        raise ValueError('Genuine same-arm quiescent native role required')
    artifacts={a['relative_path']:a for a in data['artifacts']}
    if not all(name in artifacts and artifacts[name]['bytes']>0 for name in minimum_paths):
        raise ValueError('Missing native role cannot qualify as completed research/critic')
    namespace='research/' if stage=='research' else 'critique/'
    copies=[]
    for name,item in artifacts.items():
        if not name.startswith(namespace):continue
        original=Path(item['path'])
        # Only artifacts positively inventoried by this pinned OUTPUT_FREEZE.
        if sha(original)!=item['sha256']:raise ValueError('Native source-role bytes changed')
        source_workspace=original
        for _ in Path(name).parts:source_workspace=source_workspace.parent
        copies.append({'path':str(original),'sha256':item['sha256'],
                       'source_workspace':str(source_workspace),
                       'destination_relative':'inputs/prior/'+data['job_id']+'/'+name,
                       'role_freeze':freeze_ref})
    proof={'job_id':data['job_id'],'arm':arm,'role':stage,'freeze_ref':freeze_ref,
           'native_receipt_ref':data['native_receipt'],'native_goal_starts':data['native_goal_starts'],
           'native_quiescent':data['native_quiescent'],'original_native_status':data['native_status'],
           'original_operational_complete':data['operational_complete'],
           'original_elapsed_seconds':data['elapsed_seconds'],
           'original_incomplete_or_failure_status_not_reclassified':True,
           'selection_rule':'DEC007 first chronological compatible same-arm native role',
           'missing_roles_invented':False,'source_quality_assessed':False,
           'imported_artifacts':[{'relative_path':a['relative_path'],'sha256':a['sha256'],'bytes':a['bytes']}
                                 for a in data['artifacts'] if a['relative_path'].startswith(namespace)]}
    return copies,proof


def closed_context(context_ref, arm, origin_job_id):
    data=checked(context_ref)
    if (data.get('schema')!='er9.closed-native-source-context.v1' or
        data.get('arm')!=arm or data.get('job_id')!=origin_job_id or
        (data.get('native_goal_starts') or 0)<1 or data.get('owned_quiet_positive') is not True or
        data.get('native_model_io_or_candidate_semantics_included') is not False):
        raise ValueError('Closed exact same-arm native public-capture metadata required')
    copies=[];sources=[]
    for i,item in enumerate(data['sources']):
        body=item['body'];path=Path(body['path'])
        if 'public_captures' not in path.parts or p_private(path):
            raise ValueError('Source context outside legitimate public captures')
        if sha(path)!=body['sha256'] or path.stat().st_size!=body['bytes']:
            raise ValueError('Frozen public capture SHA/byte mismatch')
        if sha(item['metadata']['path'])!=item['metadata']['sha256']:
            raise ValueError('Frozen capture provenance metadata mismatch')
        relative='inputs/source_context/'+origin_job_id+'/'+str(i).zfill(4)+'.body'
        copies.append({'path':str(path),'sha256':body['sha256'],'source_workspace':str(path.parent),
                       'destination_relative':relative,'role_freeze':data['output_freeze'],
                       'closed_context_ref':context_ref})
        # Preserve every original HTTP result, including404/incomplete captures.
        # No usability, quality, version-correctness or answer selection occurs.
        sources.append({'candidate_path':relative,'url':item['requested_url'],
                        'actual_url':item['actual_url'],'sha256':body['sha256'],
                        'status':item['status'],'body_complete':item['body_complete'],
                        'version_or_commit':item['source_version'],'capture_id':item['capture_id'],
                        'capture_limitations':'Original capture preserved; meaning/source validity UNASSESSED'})
    index_path=ROOT/'source-contexts'/origin_job_id/'SOURCE_CONTEXT_INDEX.json'
    index={'schema':'er9.candidate-source-index.v1','sources':sources}
    if index_path.exists():
        if json.loads(index_path.read_text())!=index:raise ValueError('Frozen context index changed')
    else:put(index_path,index)
    copies.append({'path':str(index_path),'sha256':sha(index_path),'source_workspace':str(ROOT),
                   'destination_relative':'inputs/source_context/'+origin_job_id+'/index.json',
                   'role_freeze':data['output_freeze'],'closed_context_ref':context_ref})
    proof={'role':'all closed actual native public captures','arm':arm,'job_id':origin_job_id,
           'closed_context_ref':context_ref,'source_count':len(sources),
           'all_original_capture_results_preserved_without_selection':True,
           'source_claim_correctness_certified':False,'source_body_semantics_read':False,
           'native_model_io_read':False,'candidate_index_ref':ref(index_path)}
    return copies,proof


def p_private(path):
    return bool(FORBIDDEN_PARTS.intersection(Path(path).parts))


def rows_for(pair_id):
    request=inventory()
    return [x for rows in request['groups'].values() for x in rows if x['pair_id']==pair_id]


def make_initial_luna():
    b=binding('L');requests=[]
    for pid in ['I-06-DELIVERY-RECOVERY-R002','SEED-DEV-A','SEED-DEV-B']:
        rows=rows_for(pid)
        classification='shared_unscored_role' if pid.startswith('SEED') else 'wholly_unstarted_pair'
        requests.append(prepare_pair(rows,classification,b,'luna-batch001'))
    # New D14B BOTH-arm version. Preserve the original finished control unchanged.
    rows=rows_for('D-V14-B-SCOPE-R002');first=rows[0]
    control=copy.deepcopy(first);control.update(job_id=first['job_id'].replace('treatment','control'),arm='control')
    old_path=Path(first['prepared_stage_json'])
    control['prepared_stage_json']=str(old_path.parent.parent/control['job_id']/'prepared-stage.json')
    control['prepared_stage_sha256']=sha(control['prepared_stage_json'])
    rows=[control,*rows]
    requests.append(prepare_pair(rows,'entered_matched_lineage',b,'luna-batch001'))
    put(ROOT/'luna-batch001/OUTBOX.json',{'schema':'er9.resource-successor-outbox.v1','requests':requests,
                                      'stage_packets':12,'deferred_stages':0,'new_native_starts':0,
                                      'pipeline_delivery_or_quality_claimed':False})
    return requests


def related_row(row, arm, stage):
    """Locate an original peer template using metadata, never output bodies."""
    result=copy.deepcopy(row)
    result['arm']=arm;result['stage']=stage
    old_id=row['job_id'];new_id=row['pair_id']+'-'+arm+'-'+stage+'-a001'
    result['job_id']=new_id
    old_path=Path(row['prepared_stage_json'])
    result['prepared_stage_json']=str(old_path.parent.parent/new_id/'prepared-stage.json')
    result['prepared_stage_sha256']=sha(result['prepared_stage_json'])
    data=checked({'path':result['prepared_stage_json'],'sha256':result['prepared_stage_sha256']})
    result['max_seconds']=data['max_seconds'];result['max_responses']=data['max_responses']
    card=checked({'path':row['card_path'],'sha256':row['card_sha256']})
    stages=card.get('stages',{}).get(arm,card.get(arm+'_stages',[]))
    index=next(i for i,s in enumerate(stages) if s['stage']==stage)
    result['prerequisite_job_ids']=[row['pair_id']+'-'+arm+'-'+stages[index-1]['stage']+'-a001'] if index else []
    if row.get('owner_registration') and row['pair_id']=='D-V09-A':
        path=Path(row['owner_registration']['path']).parent/(row['pair_id']+'-diagnostic-preparation-'+arm+'-'+stage+'-dec006-r002.json')
        result['owner_registration']=ref(path)
    return result


def make_d09():
    rows=rows_for('D-V09-A');source=next(x for x in rows if x['arm']=='treatment')
    rows.append(related_row(source,'treatment','implementation_critic'))
    original_plan=ref(LAB/'dev/diagnostic-runner/seed-recovery/corrected-dags/D-V09-A.json')
    plan=checked(original_plan)
    pair='D-V09-A-RESOURCE-R001'
    deferred=[]
    for step in plan['stage_jobs']:
        if step['stage']!='resolve_final':continue
        deferred.append({'job_id':pair+'-'+step['arm']+'-resolve_final-a001',
                         'arm':step['arm'],'stage':'resolve_final','max_seconds':200,
                         'max_responses':None,'requested_parent_response_cap':33,
                         'required_artifacts':step['required_artifacts'],
                         'prerequisite_job_ids':[x.replace('D-V09-A-',pair+'-',1) for x in step['prerequisite_job_ids']],
                         'original_plan_ref':original_plan,'original_step':step,
                         'mechanical_binder_ref':ref(LAB/'dev/diagnostic-runner/seed-recovery/bind_imported_v4.py'),
                         'status':'AWAITING_ACTUAL_PREDECESSOR_ARTIFACTS_AND_TASK_BINDING',
                         'existing_resolver_TASK_available':False,
                         'native_starts':0,'required_semantic_delta':False,
                         'source_family_binding':'Luna v1.3 common cohort',
                         'task_bytes_unchanged_claimed_for_uncreated_task':False})
    request=prepare_pair(rows,'entered_matched_lineage',binding('L'),'luna-batch002',
                         deferred=deferred,
                         extra_gate='Both exact declared fresh critics produce actual same-arm artifacts; source/implementation parallel peers withheld until resolver')
    put(ROOT/'luna-batch002/OUTBOX.json',{'schema':'er9.resource-successor-outbox.v1','requests':[request],
                                      'stage_packets':3,'deferred_stages':2,'new_native_starts':0,
                                      'missing_roles_relabelled_complete':False,
                                      'original_failed_implementation_critic_zero_artifacts_preserved':True})
    return request


def make_i08():
    rows=rows_for('I-08-DELIVERY-RECOVERY-R002')
    rows.append(related_row(rows[0],'treatment','critic_final'))
    oldcritic=ref(LAB/'ops/dispatcher/runs/I-08-DELIVERY-RECOVERY-R002-control-critique-a001/OUTPUT_FREEZE.json')
    imports,proof=role_import(oldcritic,'control','critique',['critique/review.md'])
    # Authentic research/context already resides unchanged in the two original
    # templates. Its original incomplete flags and costs remain in their frozen
    # source pair ancestry. Add the actual critic as an exact same-arm role.
    sources=[proof,{'original_research_and_context_freeze':
                    checked({'path':rows[0]['prepared_stage_json'],'sha256':rows[0]['prepared_stage_sha256']})['pair_freeze'],
                   'role':'same-arm existing research/context','original_flags_costs_retained':True,
                   'selection':'DEC007 already selected chronology; no reselection'}]
    request=prepare_pair(rows,'entered_matched_lineage',binding('L'),'luna-batch003',
                         source_roles=sources,imports_by_job={rows[0]['job_id']:imports},
                         extra_gate='Original I08 treatment combined actor terminal+owned quiet before this new resource pair starts; ops binds all legitimate Ccritic capture context from frozen metadata, never native/raw/evaluator bodies')
    put(ROOT/'luna-batch003/OUTBOX.json',{'schema':'er9.resource-successor-outbox.v1','requests':[request],
                                      'stage_packets':2,'deferred_stages':0,'new_native_starts':0,
                                      'original_running_treatment_clock_changed':False,
                                      'source_role_context_runtime_binding_pending':True})
    return request


def make_glm_unstarted(glm_ref):
    request=inventory();b=binding('Z',glm_ref);requests=[]
    pairs=sorted({x['pair_id'] for x in request['groups']['wholly_unstarted_pair'] if x['family']=='Z'})
    for pair in pairs:
        if pair=='I-02-DELIVERY-RECOVERY-R002' and (ROOT/'glm-priority001/OUTBOX.json').exists():
            prior=json.loads((ROOT/'glm-priority001/OUTBOX.json').read_text())['requests'][0]
            checked(prior);requests.append(prior);continue
        rows=rows_for(pair)
        mode='unpaired_warm_delivery_continuation' if pair in UNPAIRED else 'wholly_unstarted_pair'
        card=checked({'path':rows[0]['card_path'],'sha256':rows[0]['card_sha256']})
        fresh=pair.startswith('C-') or card.get('fresh_matched_credit') is True
        gate=('Fresh full pipeline: freeze complete both-arm per-role engine/tool/final-carrier choices BEFORE either research native start. Pending v1.4 is not a permitted fresh retrofit; dynamic actual input hashes may bind later under frozen rules. '
               'All initial I01..I12 slots terminal; execute all4confirmations without whole-case PASS/all32 gate; no development/other confirmation outputs'
              if pair.startswith('C-') else
              'Fresh full pipeline: freeze complete both-arm per-role engine/tool/final-carrier choices BEFORE either research native start; pending v1.4 final retrofit is held'
              if fresh else
              'Descriptive warm/unpaired continuation; source/critic stages may use exact v1.3 now; no fresh matched full-pipeline credit from later staged transport change')
        requests.append(prepare_pair(rows,mode,b,'glm-batch001',extra_gate=gate))
    put(ROOT/'glm-batch001/OUTBOX.json',{'schema':'er9.resource-successor-outbox.v1','requests':requests,
                                     'stage_packets':54,'deferred_stages':0,'new_native_starts':0,
                                     'original_locked_recipe_unchanged':True,
                                     'unpaired_warm_continuations_earns_fresh_matched_credit':False})
    return requests


def make_glm_priority(glm_ref):
    b=binding('Z',glm_ref)
    request=prepare_pair(rows_for('I-02-DELIVERY-RECOVERY-R002'),'wholly_unstarted_pair',b,'glm-priority001',
       extra_gate='Descriptive warm same-arm research handoffs, not fresh matched full-pipeline credit. Both900 critics may run v1.3 under exact physical V01 execution difference; both600 finals remain deferred to a separately declared accepted bundle version, never silently retrofit a fresh pipeline')
    pth=ROOT/'glm-priority001/OUTBOX.json'
    put(pth,{'schema':'er9.resource-successor-outbox.v1','requests':[request],
             'stage_packets':4,'new_native_starts':0,
             'immediately_eligible_role_types':['critique'],
             'final_role_execution_held_for_exact_bundle_stage_version':True,
             'fresh_matched_full_pipeline_credit':False})
    return request


def make_i12(glm_ref):
    rows=rows_for('I-12');base=rows[0]
    for stage in ['research','critique','revision']:
        rows.append(related_row(base,'treatment',stage))
    metadata=checked({'path':str(LAB/'ops/dispatcher/RESOURCE_ENTERED_LINEAGE_METADATA.json'),
                      'sha256':METADATA_SHA})
    original=next(x for x in metadata['rows'] if x['job_id']=='I-12-control-research-a001')
    copies,proof=role_import(original['output_freeze'],'control','research',
                             ['research/'+x for x in ['proposal.md','sources.json','witnesses.json','leads.json']])
    ctx_ref={'path':str(LAB/'ops/dispatcher/source-contexts/I12-C-RESEARCH.json'),
             'sha256':'1f14552e38032db6ccf71f222f0d54195eaba67b4fe9001571a59868db5f852b'}
    ctx,context_proof=closed_context(ctx_ref,'control',original['job_id'])
    imports={x['job_id']:copies+ctx for x in rows if x['arm']=='control'}
    request=prepare_pair(rows,'entered_matched_lineage',binding('Z',glm_ref),'glm-batch002',
                         source_roles=[proof,context_proof],imports_by_job=imports,
                         extra_gate='Original I12 research clocks ended+quiet; original resource-blocked descendants stay terminal. C research is authentic warm4role carry; T starts genuine fresh1200 research. Asymmetric recovered workflow has no fresh matched causal credit')
    put(ROOT/'glm-batch002/OUTBOX.json',{'schema':'er9.resource-successor-outbox.v1','requests':[request],
                                     'stage_packets':5,'deferred_stages':0,'new_native_starts':0,
                                     'old_sources_only_treatment_reclassified_research':False,
                                     'original_resource_blocked_descendants_reopened':False,
                                     'fresh_matched_comparison_credit':False})
    return request


def make_i01(glm_ref, treatment_critic_freeze, context_ref=None):
    """Choose solely by frozen actual role presence after original terminal/quiet."""
    original=checked(treatment_critic_freeze)
    if (original.get('arm')!='treatment' or original.get('stage')!='critique' or
        original.get('native_quiescent') is not True or (original.get('native_goal_starts') or 0)<1):
        raise ValueError('Original genuine same-arm critic terminal+quiet proof required')
    rows=rows_for('I-01-DELIVERY-RECOVERY-R002')
    artifacts={a['relative_path']:a for a in original['artifacts']}
    usable=('critique/review.md' in artifacts and artifacts['critique/review.md']['bytes']>0)
    proofs=[];imports={}
    if usable:
        files,proof=role_import(treatment_critic_freeze,'treatment','critique',['critique/review.md'])
        if not context_ref:
            raise ValueError('Actual critic closed capture-context metadata required')
        ctx,contextproof=closed_context(context_ref,'treatment',original['job_id'])
        proofs=[proof,contextproof]
        final=next(x for x in rows if x['arm']=='treatment')
        imports[final['job_id']]=files+ctx
    else:
        base=next(x for x in rows if x['arm']=='treatment')
        rows.append(related_row(base,'treatment','critique'))
        proofs=[{'job_id':original['job_id'],'role':'original failed/missing critic retained',
                 'freeze_ref':treatment_critic_freeze,'arm':'treatment','original_native_status':original['native_status'],
                 'original_elapsed_seconds':original['elapsed_seconds'],
                 'original_native_receipt_ref':original['native_receipt'],
                 'native_goals':original['native_goal_starts'],'native_quiescent':True,
                 'imported_artifacts':[],'missing_role_relabelled_complete':False,
                 'replacement':'fresh exact original900 critic under common prospective resource profile'}]
    result=prepare_pair(rows,'entered_matched_lineage',binding('Z',glm_ref),'glm-batch003',
                        source_roles=proofs,imports_by_job=imports,
                        extra_gate='Original I01Tcritic terminal+quiet; exact original900 role only if no actual compatible review. Both new final600 roles separately charged; no fresh matched causal credit')
    put(ROOT/'glm-batch003/OUTBOX.json',{'schema':'er9.resource-successor-outbox.v1','requests':[result],
                                     'stage_packets':len(rows),'deferred_stages':0,'new_native_starts':0,
                                     'existing_treatment_critic_carried':usable,
                                     'original_status_flags_costs_and_result_bytes_unchanged':True,
                                     'quality_or_best_of_selection':False})
    return result


def verify_originals():
    snapshot=json.loads((ROOT/'ORIGINAL_BYTE_SNAPSHOT.json').read_text())
    changed=[p for p,h in snapshot['files'].items() if sha(p)!=h]
    if changed:
        raise ValueError('Original bytes changed: '+repr(changed))
    return len(snapshot['files'])


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action',choices=['blueprint','luna-initial','luna-d09','luna-i08','glm-priority','glm-unstarted','glm-i12','verify-originals'])
    parser.add_argument('--glm-pin',type=Path);parser.add_argument('--glm-pin-sha256')
    args=parser.parse_args()
    if args.action=='blueprint':
        result=blueprint();print(json.dumps({'rows':len(result['rows']),'new_native_starts':0}))
    elif args.action=='luna-initial':
        result=make_initial_luna();print(json.dumps({'requests':len(result),'stage_packets':12,'new_native_starts':0}))
    elif args.action=='luna-d09':
        make_d09();print(json.dumps({'requests':1,'stage_packets':3,'deferred_stages':2,'new_native_starts':0}))
    elif args.action=='luna-i08':
        make_i08();print(json.dumps({'requests':1,'stage_packets':2,'new_native_starts':0}))
    elif args.action in ['glm-priority','glm-unstarted','glm-i12']:
        if not args.glm_pin or not args.glm_pin_sha256:raise ValueError('Exact READY GLM source pin required')
        source={'path':str(args.glm_pin.absolute()),'sha256':args.glm_pin_sha256}
        if args.action=='glm-priority':
            make_glm_priority(source);print(json.dumps({'requests':1,'stage_packets':4,'new_native_starts':0}))
        elif args.action=='glm-unstarted':
            result=make_glm_unstarted(source)
            print(json.dumps({'requests':len(result),'stage_packets':54,'new_native_starts':0}))
        else:
            make_i12(source);print(json.dumps({'requests':1,'stage_packets':5,'new_native_starts':0}))
    else:
        print(json.dumps({'unchanged_original_files':verify_originals()}))


if __name__=='__main__':
    main()
