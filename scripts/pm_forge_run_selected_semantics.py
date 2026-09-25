"""ACT070 static definition/input/preview/effect/response joins; no native run engine.

Resolvers and proof adapters must authenticate actual immutable owner inputs and
span current permission/redaction/disclosure fences. Fixture doubles do neither.
"""
from copy import deepcopy
from datetime import datetime
from functools import lru_cache
import hashlib
import json
import os
from pathlib import Path
import sys
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT=Path(__file__).resolve().parents[1]
CANON=Path(os.environ.get('PM_CANON_ROOT',ROOT))
sys.path.insert(0,str(CANON/'scripts'))
from pm_full_thread_semantics import full_thread_semantic_failures, command_outcome_binding_failures
from pm_ui_command_response import replay_failures, owner_result_digest
COMMAND='cmd.forge.pipeline.run'
SCHEMA='Plans/forge_run_selected_contracts.schema.json'
BINDING={'path':SCHEMA,'json_pointer':'#/$defs/result','schema_id':'pm.forge.run_selected.result.v1'}

@lru_cache(maxsize=1)
def schemas():
    names=[SCHEMA,'Plans/forge_integration_contracts.schema.json','Plans/full_thread_runtime_contracts.schema.json',
           'Plans/source_control_contracts.schema.json','Plans/ui_command_response.schema.json','Plans/shared_runtime_command_contracts.schema.json']
    docs={name:json.loads(((ROOT if name==SCHEMA else CANON)/name).read_text()) for name in names}
    return docs,Registry().with_resources((s['$id'],Resource.from_contents(s)) for s in docs.values())

def shape(definition,value,filename=SCHEMA):
    docs,registry=schemas();s=docs[filename]
    selected=s if definition is None else {'$ref':s['$id']+'#/$defs/'+definition}
    return [e.message for e in Draft202012Validator(selected,registry=registry,format_checker=FormatChecker()).iter_errors(value)]

def instant(s):return datetime.fromisoformat(s.replace('Z','+00:00'))

def validate_run_result(request,result,original_binding_ref,outcome_ref,response_ref,delivery_return_context,*,
                        resolve_record,canonical_digest,verify_original_admission,
                        verify_run_definition,verify_run_preview,verify_effect_authority,check_current_disclosure):
    """Validate exact original admission plus actual selected run and UI outcome.

    Every dependency is mandatory. Proof functions return list[str], never truthy
    caller facts. Native dependencies authenticate originals, selected run/state,
    actual run effect, safe error projection and present access.
    """
    inputs=(request,result,delivery_return_context);saved=deepcopy(inputs)
    request,result,delivery=deepcopy(saved);errors=[];snapshots=[];cache={}
    def read(ref,definition,filename=SCHEMA):
        if ref not in cache:
            actual=resolve_record(ref);snapshots.append((actual,deepcopy(actual)));cache[ref]=deepcopy(actual)
        value=deepcopy(cache[ref])
        if shape(definition,value,filename):raise ValueError('shape:'+str(definition))
        return value
    def proof(name,fn,*args):
        prior=deepcopy(args);value=fn(*args)
        if type(value) is not list or any(type(x) is not str for x in value):errors.append(name+'_invalid_proof')
        else:errors.extend(name+':'+x for x in value)
        if args!=prior:errors.append('proof_input_mutated')
    def digest(value):
        copy=deepcopy(value);d=canonical_digest(copy)
        if copy!=value:errors.append('digest_input_mutated')
        if not isinstance(d,str) or len(d)!=64 or any(c not in '0123456789abcdef' for c in d):raise ValueError('digest')
        return d
    try:
        if shape('request',request) or shape('result',result):return ['input_shape']
        a=request['authority'];s=request['selection'];r=result['owner_result'];forge='Plans/forge_integration_contracts.schema.json'
        original=read(original_binding_ref,'dispatch_binding')
        actual_request=read(result['original_request_ref'],'request')
        o=read(outcome_ref,'CommandOutcomeRecord','Plans/full_thread_runtime_contracts.schema.json')
        response=read(response_ref,None,'Plans/ui_command_response.schema.json')
        if read(o['owner_result_ref'],'result')!=result:errors.append('actual_result')
        if actual_request!=request or original['arguments']!=request or original['request_ref']!=result['original_request_ref']:errors.append('original_request')
        if shape('delivery_return_context',delivery) or delivery!=original['return_context']:errors.append('original_return')
        errors+=full_thread_semantic_failures('IdentityEnvelope',original['identity'])
        errors+=full_thread_semantic_failures('CommandOutcomeRecord',o)
        errors+=command_outcome_binding_failures(response,o,outcome_ref)
        expected={'accepted':('accepted',{'pending'}),'acknowledged':('accepted',{'pending'}),
                  'executing':('accepted',{'pending'}),'succeeded':('accepted',{'succeeded'}),
                  'failed':('accepted',{'failed'}),'cancelled':('accepted',{'cancelled'}),
                  'rejected':('rejected',{None}),'terminal_unknown':('accepted',{'recovery_required'})}[o['outcome']]
        if response['ack_status']!=expected[0] or response['result_status'] not in expected[1]:errors.append('response_outcome')
        expected_receipts=(None,o['acknowledgement_receipt_ref']) if o['outcome'] in ('accepted','acknowledged','executing') else (o['result_receipt_ref'],)
        if response['receipt_ref'] not in expected_receipts:errors.append('response_receipt')
        if response['event_refs']!=r['event_refs']:errors.append('response_events')
        if response['response_kind']!='owner_operation' or response['owner_result_schema_ref']!=BINDING or o['owner_result_schema_ref']!=BINDING:errors.append('response_binding')
        if response['request_ref']!=original['request_ref'] or response['owner_result_ref']!=o['owner_result_ref']:errors.append('response_original')
        if response['command_id']!=COMMAND or o['command_id']!=COMMAND:errors.append('response_command')
        if any(v!=original['identity'] for v in (o['identity'],response['owner_identity'])):errors.append('original_identity')
        if a['command_instance_id']!=original['identity'].get('command_instance_id') or response['command_instance_id']!=a['command_instance_id']:errors.append('original_instance')
        if r['operation_id']!=original['identity']['operation_id']:errors.append('original_operation')
        if (response['original_dispatch_id'] if response['replayed'] else response['dispatch_id'])!=original['dispatch_id']:errors.append('original_dispatch')
        for k in ('dispatch_frame_id','target_generation','payload_sha256','idempotency_key'):
            if o[k]!=original[k]:errors.append('original_'+k)
        if original['payload_sha256']!=digest(request) or o['owner_result_sha256']!=digest(result):errors.append('original_digest')
        if original['idempotency_key']!=a['idempotency_key'] or original['permission_snapshot_ref']!=a['permission']['permission_snapshot_ref']:errors.append('original_authority')
        if not instant(a['requested_at_utc'])<=instant(original['accepted_at_utc'])<=instant(r['completed_at_utc'])<=instant(o['observed_at']):errors.append('original_time')
        if instant(response['ts'])<instant(r['completed_at_utc']):errors.append('response_before_result')
        actual_error=error_projection=None
        if r['error'] is None:
            if o['error_ref'] is not None or response['error'] is not None or result['error_projection_ref'] is not None:errors.append('error_presence')
        else:
            actual_error=read(o['error_ref'],'command_error_record',forge)
            if actual_error['error']!=r['error'] or any(actual_error[k]!=a[k] for k in ('command_id','command_instance_id','provider','repository_binding_ref')):errors.append('actual_owner_error')
            error_projection=read(result['error_projection_ref'],'error_projection')
            if error_projection['projection_id']!=result['error_projection_ref'] or error_projection['owner_error_ref']!=o['error_ref'] or error_projection['original_request_ref']!=original['request_ref'] or error_projection['identity']!=original['identity']:errors.append('error_projection_source')
            if error_projection['ui_error']!=response['error']:errors.append('error_projection_value')
            if error_projection['return_context']!=original['return_context'] or error_projection['return_context']!=delivery:errors.append('error_projection_caller')
            if not instant(a['requested_at_utc'])<=instant(actual_error['recorded_at_utc'])<=instant(r['completed_at_utc']):errors.append('owner_error_time')
            if not instant(actual_error['recorded_at_utc'])<=instant(error_projection['recorded_at_utc'])<=instant(o['observed_at']):errors.append('error_projection_time')
        if a['permission']['scope']!='remote_side_effect':errors.append('run_authority')
        if r['observable_work_id']!=a['observable_work_id']:errors.append('original_work_reference')
        if s['automation_binding_ref']!=a.get('automation_binding_ref') or s['binding_generation']!=a.get('expected_automation_binding_generation'):errors.append('selected_binding')
        binding=read(s['automation_binding_ref'],'automation_binding',forge)
        if binding['automation_binding_id']!=s['automation_binding_ref'] or binding['binding_generation']!=s['binding_generation']:errors.append('automation_binding_generation')
        if any(binding[k]!=a[k] for k in ('provider','normalized_host','account_id','repo_id','repository_binding_ref')):errors.append('automation_binding_identity')
        if original['identity']['scope_kind']=='project' and original['identity']['project_id']!=binding['project_id']:errors.append('binding_project')
        for k in ('command_id','command_instance_id','provider','repository_binding_ref','expected_binding_generation','automation_binding_ref','expected_automation_binding_generation'):
            if (k in r,r.get(k))!=(k in a,a.get(k)):errors.append('result_'+k)
        if r['event_refs']:errors.append('unadmitted_event_effect')
        receipt=None
        if r['receipt_ref'] is not None:
            receipt=read(r['receipt_ref'],'command_receipt',forge)
            if receipt['receipt_id']!=r['receipt_ref']:errors.append('receipt_identity')
            for k in ('command_id','command_instance_id','provider','repository_binding_ref','expected_binding_generation','automation_binding_ref','expected_automation_binding_generation','requested_authority_role','effective_authority_role','credential_or_grant_ref','idempotency_key'):
                if (k in receipt,receipt.get(k))!=(k in a,a.get(k)):errors.append('receipt_'+k)
            for k in ('operation_id','outcome','observable_work_id','completed_at_utc','event_refs'):
                if receipt[k]!=r[k]:errors.append('receipt_'+k)
            if receipt['recovery_actions']!=r['recovery_action_ids'] or receipt['review_revision_ref']!=a['target']['review_revision_ref']:errors.append('receipt_context')
        descriptor=read(s['definition_ref'],'descriptor');api=read(a['api_compatibility_ref'],'api_compatibility',forge)
        if descriptor['descriptor_ref']!=s['definition_ref'] or digest(descriptor)!=s['definition_sha256']:errors.append('definition_original')
        for k in ('command_id','provider','provider_variant','normalized_host','account_id','api_compatibility_ref','capability_snapshot_ref'):
            if descriptor[k]!=a[k]:errors.append('definition_'+k)
        for k in ('automation_binding_ref','binding_generation','definition_id','source_revision'):
            if descriptor[k]!=s[k]:errors.append('definition_selection')
        if descriptor['catalog_generation']!=a['currentness']['catalog_generation'] or descriptor['catalog_generation']!=api['catalog_generation']:errors.append('definition_catalog_generation')
        if api['provider']!=a['provider'] or api['provider_variant']!=a['provider_variant'] or api['probe_id']!=a['currentness']['api_probe_ref']:errors.append('api_original')
        if {'name':descriptor['endpoint_name'],'api_version':descriptor['api_version'],'release_state':descriptor['release_state']} not in api['endpoints']:errors.append('definition_endpoint')
        if instant(descriptor['issued_at_utc'])>instant(a['requested_at_utc']) or instant(api['probed_at_utc'])>instant(original['accepted_at_utc']):errors.append('definition_future')
        if a['target']['pipeline_definition_ref']!=s['definition_ref'] or a['target']['source_revision']!=s['source_revision']:errors.append('target_definition')
        if a['target']['target_kind']!='pipeline' or a['target']['job_id'] is not None or a['target'].get('automation_run_id') is not None:errors.append('run_definition_target')
        if a['target'].get('expected_automation_revision') is not None and a['target']['expected_automation_revision']!=descriptor['owner_revision']:errors.append('target_definition_revision')
        fields={f['field_id']:f for f in descriptor['fields']};submitted={v['field_id']:v['value'] for v in s['inputs']};resources=[]
        if len(fields)!=len(descriptor['fields']) or len(submitted)!=len(s['inputs']):errors.append('duplicate_input_field')
        for field in descriptor['fields']:
            kind=field['value_kind']
            for lo,hi in [('minimum_integer','maximum_integer'),('minimum_length','maximum_length'),('minimum_items','maximum_items')]:
                if field[lo] is not None and field[hi] is not None and field[lo]>field[hi]:errors.append('definition_bounds')
            if kind.startswith('enum')!=bool(field['enum_values']):errors.append('definition_enum')
            if kind.startswith('resource')!=(field['resource_kind'] is not None):errors.append('definition_resource')
            for prefix,limits in [('integer',('minimum_integer','maximum_integer')),('text',('minimum_length','maximum_length'))]:
                if not kind.startswith(prefix) and any(field[k] is not None for k in limits):errors.append('definition_inapplicable_bounds')
            if not kind.endswith('_list') and (field['unique_items'] or any(field[k] is not None for k in ('minimum_items','maximum_items'))):errors.append('definition_inapplicable_list')
            if not field['absence_allowed'] and field['field_id'] not in submitted:errors.append('required_input')
        def check_value(field_id,operand):
            if field_id not in fields:errors.append('unknown_input_field');return
            field=fields[field_id];kind=operand['kind'];value=operand['value']
            if kind=='null':
                if not field['nullable']:errors.append('input_null_disallowed')
                return
            if kind!=field['value_kind']:errors.append('input_kind');return
            values=value if kind.endswith('_list') else [value]
            if kind.endswith('_list'):
                if field['unique_items'] and len(value)!=len({json.dumps(v,sort_keys=True) for v in value}):errors.append('input_unique_items')
                if field['minimum_items'] is not None and len(value)<field['minimum_items'] or field['maximum_items'] is not None and len(value)>field['maximum_items']:errors.append('input_cardinality')
            for v in values:
                if kind.startswith('integer') and (field['minimum_integer'] is not None and v<field['minimum_integer'] or field['maximum_integer'] is not None and v>field['maximum_integer']):errors.append('input_integer_bound')
                if kind.startswith('text') and (field['minimum_length'] is not None and len(v)<field['minimum_length'] or field['maximum_length'] is not None and len(v)>field['maximum_length']):errors.append('input_text_bound')
                if kind.startswith('enum') and v not in field['enum_values']:errors.append('input_enum')
                if kind.startswith('resource'):
                    resource=read(v,'resource_operand');resources.append(resource)
                    if resource['resource_ref']!=v or resource['resource_kind']!=field['resource_kind'] or resource['scope_ref']!=s['automation_binding_ref'] or any(resource[k]!=a[k] for k in ('provider','provider_variant','normalized_host','account_id')):errors.append('input_resource_scope')
        for key,value in submitted.items():check_value(key,value)
        fence=read(s['preview_ref'],'run_preview')
        if fence['preview_id']!=s['preview_ref'] or fence['selection']!=s:errors.append('preview_selection')
        projection=None
        if fence['pipeline_context_ref']!=a['target']['pipeline_id']:errors.append('pipeline_context_original')
        if fence['pipeline_context_ref'] is not None:
            projection=read(fence['pipeline_context_ref'],'pipeline_projection',forge)
            if projection['pipeline_id']!=fence['pipeline_context_ref'] or projection['provider']!=a['provider'] or projection['repository_binding_ref']!=a['repository_binding_ref']:errors.append('pipeline_context_scope')
        effective={v['field_id']:v for v in fence['effective_inputs']}
        if len(effective)!=len(fence['effective_inputs']) or set(effective)!=set(fields):errors.append('preview_input_completeness')
        values={}
        for field_id,item in effective.items():
            if field_id not in fields:errors.append('unknown_effective_input');continue
            if field_id in submitted:
                if item['origin']!='submitted' or item.get('value')!=submitted[field_id]:errors.append('submitted_input_changed')
            elif item['origin']=='submitted' or not fields[field_id]['absence_allowed']:errors.append('invented_submission')
            if item['origin']!='omitted':check_value(field_id,item['value']);values[field_id]=item['value']
        for rule in descriptor['constraints']:
            if rule['when_field_id'] not in fields or rule['other_field_id'] not in fields:errors.append('definition_constraint_field');continue
            chosen=values.get(rule['when_field_id'])
            if chosen is not None and (rule['when_operand'] is None or chosen==rule['when_operand']):
                if (rule['kind']=='requires')!=(rule['other_field_id'] in values):errors.append('input_cross_field')
        if instant(fence['observed_at_utc'])>instant(a['requested_at_utc']):errors.append('preview_after_original')
        direct=read(a['currentness']['direct_revalidation_ref'],'revalidation')
        if direct['revalidation_ref']!=a['currentness']['direct_revalidation_ref'] or direct['selection']!=s or direct['original_request_ref']!=original['request_ref'] or direct['command_instance_id']!=a['command_instance_id'] or direct['operation_id']!=r['operation_id']:errors.append('revalidation_original')
        if not instant(original['accepted_at_utc'])<=instant(direct['observed_at_utc'])<=instant(r['completed_at_utc']):errors.append('revalidation_time')
        if direct['disposition']=='matched' and direct['observed_preview_id']!=s['preview_ref']:errors.append('matched_preview_identity')
        if direct['disposition']=='unavailable' and direct['observed_preview_id'] is not None:errors.append('unavailable_preview')
        if direct['disposition']=='changed' and (direct['observed_preview_id'] is None or direct['observed_preview_id']==s['preview_ref']):errors.append('changed_preview_identity')
        observed_fence=None
        if direct['observed_preview_id'] is not None:
            observed_fence=read(direct['observed_preview_id'],'run_preview')
            if observed_fence['preview_id']!=direct['observed_preview_id'] or observed_fence['selection']['automation_binding_ref']!=s['automation_binding_ref'] or observed_fence['selection']['binding_generation']!=s['binding_generation']:errors.append('observed_preview_scope')
        observation=None
        if r['terminal_provider_result_ref'] is not None and r['terminal_provider_result_ref']!=result['observation_ref']:errors.append('terminal_observation_reference')
        if result['observation_ref'] is not None:
            observation=read(result['observation_ref'],'observation')
            if observation['selection']!=s or observation['original_request_ref']!=original['request_ref'] or observation['command_instance_id']!=a['command_instance_id'] or observation['operation_id']!=r['operation_id']:errors.append('observation_original')
            if observation['target_ref']!=r['target_ref'] or observation['revalidation_ref']!=direct['revalidation_ref']:errors.append('observation_target')
            if not instant(direct['observed_at_utc'])<=instant(observation['observed_at_utc'])<=instant(r['completed_at_utc']):errors.append('observation_time')
            if observation['effect_state'] in ('known_applied','unknown') and direct['disposition']!='matched':errors.append('effect_without_matching_preview')
            if observation['outcome']=='completed' and (observation['effect_state']!='known_applied' or observation['provider_receipt_ref'] is None or not observation['returned_work']):errors.append('completion_without_native_work')
            if observation['outcome']=='unknown' or observation['effect_state']=='unknown':
                if observation['outcome']!='unknown' or observation['effect_state']!='unknown' or observation['reconciliation_ref'] is None or r['outcome'] not in ('effect_unknown','recovery_required','failed','cancelled'):errors.append('unknown_effect_preservation')
            elif observation['outcome'] in ('completed','partial') and observation['effect_state']!='known_applied':errors.append('contradictory_applied_observation')
            workkeys=[(w['native_kind'],w['native_id']) for w in observation['returned_work']]
            if len(workkeys)!=len(set(workkeys)):errors.append('duplicate_returned_work')
            applied=observation['effect_state']=='known_applied' or bool(observation['returned_work'])
            if applied and observation['effect_state'] in ('not_attempted','known_not_applied'):errors.append('lost_known_effect')
            if applied and (r['error'] or {}).get('effect_state') in ('none','known_not_applied'):errors.append('error_contradicts_known_effect')
            if observation['effect_state']=='unknown' and (r['error'] or {}).get('effect_state') in ('none','known_not_applied'):errors.append('error_denies_unknown_effect')
            if observation['effect_state']=='known_applied' and observation['provider_receipt_ref'] is None:errors.append('known_effect_receipt')
        if r['outcome']=='succeeded' and (observation is None or observation['outcome']!='completed'):errors.append('success_without_run_completion')
        if r['outcome']!='accepted' and observation is None:errors.append('terminal_observation_missing')
        if r['outcome']=='accepted':
            if o['outcome'] not in ('accepted','acknowledged','executing') or o['result_receipt_ref'] is not None or observation is not None:errors.append('accepted_not_terminal')
            if r['observable_work_id'] is None:errors.append('accepted_without_work')
            if r['receipt_ref'] is not None and r['receipt_ref']!=o['acknowledgement_receipt_ref']:errors.append('acceptance_receipt')
        elif r['outcome']=='degraded':errors.append('degraded_mapping_unadmitted')
        else:
            expected={'succeeded':'succeeded','blocked':'rejected','failed':'failed','cancelled':'cancelled','effect_unknown':'terminal_unknown','recovery_required':'terminal_unknown'}[r['outcome']]
            if (r['error'] or {}).get('effect_state')=='unknown' or (observation or {}).get('effect_state')=='unknown':expected='terminal_unknown'
            if o['outcome']!=expected or o['result_receipt_ref']!=r['receipt_ref'] or receipt is None:errors.append('terminal_outcome')
        if r['observable_work_id'] is not None:
            work=read(r['observable_work_id'],'ObservableWorkRecord','Plans/full_thread_runtime_contracts.schema.json')
            errors+=full_thread_semantic_failures('ObservableWorkRecord',work)
            if work['identity']!=original['identity'] or work['observable_work_id']!=r['observable_work_id']:errors.append('original_work')
            if r['outcome']=='accepted' and (work['work_state'] in ('completed','failed','cancelled','recovery-required') or work['result_receipt_ref'] is not None):errors.append('accepted_work_terminal')
        original_response=read(response['original_dispatch_id'],None,'Plans/ui_command_response.schema.json') if response['replayed'] else None
        errors+=replay_failures(response,original_response)
        proof('admission',verify_original_admission,original,request)
        proof('definition',verify_run_definition,original,binding,descriptor,api,resources)
        proof('fence',verify_run_preview,original,binding,descriptor,fence,projection,direct,observed_fence,observation)
        proof('effect',verify_effect_authority,original,request,result,direct,observation)
        proof('disclosure',check_current_disclosure,original,result,response,delivery,actual_error,error_projection)
    except Exception as exc:errors.append('owner_resolution:'+type(exc).__name__)
    if inputs!=saved or any(v!=frozen for v,frozen in snapshots):errors.append('original_mutated')
    return sorted(set(errors))

def response_failures(bundle,dependencies):
    """Central UI hook; dependencies are trusted adapters, never bundle facts."""
    if not isinstance(dependencies,dict):return ['run_native_dependencies_missing']
    frozen=deepcopy(bundle);snapshots=[]
    try:
        resolver=dependencies['resolve_record']
        def read(ref):
            actual=resolver(ref);snapshots.append((actual,deepcopy(actual)));return deepcopy(actual)
        original=read(bundle['original_binding_ref'])
        result=bundle['owner_result'];response=bundle['response'];outcome=bundle['outcome']
        normalized=bundle['normalized_request'];errors=[]
        expected={'request_ref':original['request_ref'],'command_id':COMMAND,
                  'command_instance_id':original['identity']['command_instance_id'],
                  'operation_id':original['identity']['operation_id'],'owner_identity':original['identity'],
                  **{k:original[k] for k in ('payload_sha256','idempotency_key','target_generation','dispatch_frame_id')}}
        if any(normalized.get(k)!=v for k,v in expected.items()):errors.append('run_normalized_original')
        if read(bundle['resolved_outcome_ref'])!=outcome or read(bundle['response_ref'])!=response:errors.append('run_bundle_actual_records')
        errors+=validate_run_result(bundle['owner_request'],result,bundle['original_binding_ref'],
                                    bundle['resolved_outcome_ref'],bundle['response_ref'],bundle['delivery_return_context'],**dependencies)
    except Exception as exc:errors=['run_response_resolution:'+type(exc).__name__]
    if bundle!=frozen or any(a!=b for a,b in snapshots):errors.append('run_response_original_mutated')
    return sorted(set(errors))

def fixture_dependencies(value):
    """Synthetic static doubles; not genuine issuer/content/redaction proof."""
    return {'resolve_record':lambda ref:value['records'][ref],
            'canonical_digest':owner_result_digest,**{k:lambda *args:[] for k in ('verify_original_admission','verify_run_definition','verify_run_preview','verify_effect_authority','check_current_disclosure')}}

def run_selected_semantic_failures(definition,value):
    if definition!='fixture_case':return []
    if shape(definition,value):return ['fixture_shape']
    return validate_run_result(value['request'],value['result'],value['original_binding_ref'],value['outcome_ref'],value['response_ref'],value['delivery_return_context'],**fixture_dependencies(value))
