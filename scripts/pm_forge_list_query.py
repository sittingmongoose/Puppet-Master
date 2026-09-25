"""ACT062/067 static descriptor/original/read-window/response joins; no native listing engine.

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
COMMANDS=('cmd.forge.repository.list','cmd.forge.pipeline.list')
SCHEMA='Plans/forge_list_query_contracts.schema.json'
BINDING={'path':SCHEMA,'json_pointer':'#/$defs/result','schema_id':'pm.forge.list_query.result.v1'}

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

def validate_list_result(request,result,original_binding_ref,outcome_ref,response_ref,delivery_return_context,*,
                        resolve_record,canonical_digest,verify_original_admission,
                        verify_query_authority,verify_read_sources,check_current_disclosure):
    """Validate actual original query and authenticated descriptor/read-window/UI joins.

    Every dependency is mandatory. Proof functions return list[str], never truthy
    caller facts. Native dependencies authenticate originals, provider descriptor meaning/resource scope, actual read sources, safe errors and
    current access. Static doubles do not authenticate any native provider fact.
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
        if response['command_id']!=a['command_id'] or o['command_id']!=a['command_id']:errors.append('response_command')
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
        actual_error=projection=None
        if r['error'] is None:
            if o['error_ref'] is not None or response['error'] is not None or result['error_projection_ref'] is not None:errors.append('error_presence')
        else:
            actual_error=read(o['error_ref'],'command_error_record',forge)
            if actual_error['error']!=r['error'] or any(actual_error[k]!=a[k] for k in ('command_id','command_instance_id','provider','repository_binding_ref')):errors.append('actual_owner_error')
            projection=read(result['error_projection_ref'],'error_projection')
            if projection['projection_id']!=result['error_projection_ref'] or projection['owner_error_ref']!=o['error_ref'] or projection['original_request_ref']!=original['request_ref'] or projection['identity']!=original['identity']:errors.append('error_projection_source')
            if projection['ui_error']!=response['error']:errors.append('error_projection_value')
            if projection['return_context']!=original['return_context'] or projection['return_context']!=delivery:errors.append('error_projection_caller')
            if not instant(a['requested_at_utc'])<=instant(actual_error['recorded_at_utc'])<=instant(r['completed_at_utc']):errors.append('owner_error_time')
            if not instant(actual_error['recorded_at_utc'])<=instant(projection['recorded_at_utc'])<=instant(o['observed_at']):errors.append('error_projection_time')
        if a['command_id'] not in COMMANDS or a['permission']['scope']!='read' or a['file_safe_decision_ref'] is not None:errors.append('list_read_only')
        precommit=a.get('repository_list_scope');binding=automation=None
        if precommit is not None:
            scope=precommit['account_container_ref']
            if original['initiating_client_id']!=precommit['initiating_client_id']:errors.append('precommit_client')
            if delivery is None or delivery['focus_id']!=precommit['return_focus_id']:errors.append('precommit_return_focus')
            if original['identity']['project_id'] is not None or original['identity']['scope_kind']!='application':errors.append('precommit_identity')
            for owner,key in [('server_id','server_id'),('execution_host_id','execution_host_id'),('execution_environment_id','execution_environment_id')]:
                if original['identity'][owner]!=precommit[key]:errors.append('precommit_'+key)
        else:
            binding=read(a['repository_binding_ref'],'repository_binding',forge);scope=a['repository_binding_ref']
            if binding['binding_id']!=scope or binding['binding_generation']!=a['expected_binding_generation']:errors.append('repository_binding_generation')
            if binding['repo_id']!=a['repo_id']:errors.append('repository_binding_identity')
            if a['command_id']=='cmd.forge.repository.list' and any(binding[k]!=a[k] for k in ('provider','provider_variant','normalized_host','account_id')):errors.append('repository_binding_identity')
            if binding['provider_repository_id']!=a['target']['provider_repository_id']:errors.append('repository_identity')
        if a['command_id']=='cmd.forge.pipeline.list':
            scope=a['automation_binding_ref'];automation=read(scope,'automation_binding',forge)
            if automation['automation_binding_id']!=scope or automation['binding_generation']!=a['expected_automation_binding_generation']:errors.append('automation_generation')
            if any(automation[k]!=a[k] for k in ('provider','normalized_host','account_id','repo_id','repository_binding_ref')):errors.append('automation_scope')
            if original['identity']['scope_kind']!='project' or original['identity']['project_id']!=automation['project_id']:errors.append('automation_project')
        for k in ('command_id','command_instance_id','provider','repository_binding_ref','expected_binding_generation','automation_binding_ref','expected_automation_binding_generation','repository_list_scope'):
            if (k in r,r.get(k))!=(k in a,a.get(k)):errors.append('result_'+k)
        if r['event_refs']:errors.append('unadmitted_event_effect')
        descriptor=read(s['descriptor_ref'],'descriptor');api=read(a['api_compatibility_ref'],'api_compatibility',forge)
        if descriptor['descriptor_ref']!=s['descriptor_ref'] or digest(descriptor)!=s['descriptor_sha256']:errors.append('descriptor_original')
        for k in ('command_id','provider','provider_variant','normalized_host','account_id','api_compatibility_ref','capability_snapshot_ref'):
            if descriptor[k]!=a[k]:errors.append('descriptor_'+k)
        if descriptor['catalog_generation']!=a['currentness']['catalog_generation'] or descriptor['catalog_generation']!=api['catalog_generation']:errors.append('descriptor_catalog_generation')
        if api['provider']!=a['provider'] or api['provider_variant']!=a['provider_variant'] or api['probe_id']!=a['currentness']['api_probe_ref']:errors.append('api_original')
        if {'name':descriptor['endpoint_name'],'api_version':descriptor['api_version'],'release_state':descriptor['release_state']} not in api['endpoints']:errors.append('descriptor_endpoint')
        if instant(descriptor['issued_at_utc'])>instant(original['accepted_at_utc']):errors.append('descriptor_future')
        if instant(api['probed_at_utc'])>instant(original['accepted_at_utc']):errors.append('api_future')
        fields={f['field_id']:f for f in descriptor['fields']};selected={f['field_id']:f for f in s['fields']}
        if len(fields)!=len(descriptor['fields']) or len(selected)!=len(s['fields']):errors.append('duplicate_query_field')
        resources=[]
        for field in descriptor['fields']:
            ops={p['operator_id']:p for p in field['operators']}
            if len(ops)!=len(field['operators']):errors.append('duplicate_operator')
            if not field['absence_allowed'] and field['field_id'] not in selected:errors.append('required_query_field')
            for op in field['operators']:
                for lo,hi in [('minimum_integer','maximum_integer'),('minimum_length','maximum_length'),('minimum_items','maximum_items')]:
                    if op[lo] is not None and op[hi] is not None and op[lo]>op[hi]:errors.append('descriptor_bounds')
                if (op['value_kind'].startswith('enum'))!=bool(op['enum_values']):errors.append('descriptor_enum')
                if (op['value_kind'].startswith('resource'))!=(op['resource_kind'] is not None):errors.append('descriptor_resource')
                if not op['value_kind'].startswith('integer') and any(op[k] is not None for k in ('minimum_integer','maximum_integer')):errors.append('descriptor_inapplicable_bounds')
                if not op['value_kind'].startswith('text') and any(op[k] is not None for k in ('minimum_length','maximum_length')):errors.append('descriptor_inapplicable_bounds')
                if not op['value_kind'].endswith('_list') and any(op[k] is not None for k in ('minimum_items','maximum_items')):errors.append('descriptor_inapplicable_bounds')
        for item in s['fields']:
            if item['field_id'] not in fields:errors.append('unknown_query_field');continue
            ops={p['operator_id']:p for p in fields[item['field_id']]['operators']}
            if item['operator_id'] not in ops:errors.append('unknown_query_operator');continue
            op=ops[item['operator_id']];operand=item['operand'];kind=operand['kind'];value=operand['value']
            if kind=='null':
                if not op['nullable']:errors.append('query_null_disallowed')
                continue
            if kind!=op['value_kind']:errors.append('query_operand_kind');continue
            values=value if kind.endswith('_list') else [value]
            if kind.endswith('_list'):
                if op['minimum_items'] is not None and len(value)<op['minimum_items'] or op['maximum_items'] is not None and len(value)>op['maximum_items']:errors.append('query_cardinality')
            for v in values:
                if kind.startswith('integer') and (op['minimum_integer'] is not None and v<op['minimum_integer'] or op['maximum_integer'] is not None and v>op['maximum_integer']):errors.append('query_integer_bound')
                if kind.startswith('text') and (op['minimum_length'] is not None and len(v)<op['minimum_length'] or op['maximum_length'] is not None and len(v)>op['maximum_length']):errors.append('query_text_bound')
                if kind.startswith('enum') and v not in op['enum_values']:errors.append('query_enum_value')
                if kind.startswith('resource'):
                    resource=read(v,'resource_operand');resources.append(resource)
                    if resource['resource_ref']!=v or resource['resource_kind']!=op['resource_kind'] or resource['scope_ref']!=scope or any(resource[k]!=a[k] for k in ('provider','provider_variant','normalized_host','account_id')):errors.append('query_resource_scope')
        for rule in descriptor['constraints']:
            if rule['when_field_id'] not in fields or rule['other_field_id'] not in fields:errors.append('descriptor_constraint_field')
            chosen=selected.get(rule['when_field_id'])
            if chosen is not None and (rule['when_operand'] is None or chosen['operand']==rule['when_operand']):
                present=rule['other_field_id'] in selected
                if (rule['kind']=='requires')!=present:errors.append('query_cross_field')
        core={k:s[k] for k in ('descriptor_ref','descriptor_sha256','fields')};query_digest=digest(core);query_origin=s['query_origin_ref'] or original['request_ref']
        if (s['query_origin_ref'] is None)!=(s['continuation_ref'] is None):errors.append('continuation_origin_presence')
        def continuation(ref,previous_ref=None):
            c=read(ref,'continuation')
            if not descriptor['continuation_supported']:errors.append('continuation_unsupported')
            for k,v in {'continuation_ref':ref,'original_request_ref':query_origin,'query_sha256':query_digest,'descriptor_ref':s['descriptor_ref'],'descriptor_sha256':s['descriptor_sha256'],'scope_ref':scope}.items():
                if c[k]!=v:errors.append('continuation_'+k)
            if previous_ref is not None and c['previous_window_ref']!=previous_ref:errors.append('continuation_previous')
            return c
        if s['continuation_ref'] is not None:
            root_query=read(query_origin,'request')
            if {k:root_query['selection'][k] for k in core}!=core or root_query['selection']['query_origin_ref'] is not None:errors.append('continuation_original_query')
            root_a=root_query['authority']
            for k in ('command_id','provider','provider_variant','normalized_host','account_id','repo_id','repository_binding_ref','expected_binding_generation','automation_binding_ref','expected_automation_binding_generation','repository_list_scope'):
                if (k in root_a,root_a.get(k))!=(k in a,a.get(k)):errors.append('continuation_original_scope')
            cursor=s['continuation_ref'];seen_requests={original['request_ref']};seen_cursors=set()
            while cursor is not None:
                if cursor in seen_cursors:errors.append('continuation_cycle');break
                seen_cursors.add(cursor)
                c=continuation(cursor);previous=read(c['previous_window_ref'],'window')
                if previous['window_ref']!=c['previous_window_ref'] or previous['query_sha256']!=query_digest or previous['scope_ref']!=scope or previous['continuation_ref']!=cursor or previous['descriptor_ref']!=s['descriptor_ref'] or previous['descriptor_sha256']!=s['descriptor_sha256'] or any(previous[k]!=a[k] for k in ('command_id','provider','provider_variant','normalized_host','account_id')):errors.append('continuation_window')
                prior_ref=previous['original_request_ref']
                if prior_ref in seen_requests:errors.append('continuation_cycle');break
                seen_requests.add(prior_ref);prior=read(prior_ref,'request');ps=prior['selection'];pa=prior['authority']
                if {k:ps[k] for k in core}!=core:errors.append('continuation_prior_query')
                for k in ('command_id','provider','provider_variant','normalized_host','account_id','repo_id','repository_binding_ref','expected_binding_generation','automation_binding_ref','expected_automation_binding_generation','repository_list_scope'):
                    if (k in pa,pa.get(k))!=(k in a,a.get(k)):errors.append('continuation_prior_scope')
                if prior_ref==query_origin:
                    if ps['query_origin_ref'] is not None or ps['continuation_ref'] is not None:errors.append('continuation_root')
                    break
                if ps['query_origin_ref']!=query_origin or ps['continuation_ref'] is None:errors.append('continuation_prior_origin');break
                cursor=ps['continuation_ref']
        receipt=None
        if r['receipt_ref'] is not None:
            receipt=read(r['receipt_ref'],'command_receipt',forge)
            if receipt['receipt_id']!=r['receipt_ref']:errors.append('receipt_identity')
            for k in ('command_id','command_instance_id','provider','repository_binding_ref','expected_binding_generation','automation_binding_ref','expected_automation_binding_generation','requested_authority_role','effective_authority_role','credential_or_grant_ref','idempotency_key','repository_list_scope'):
                if (k in receipt,receipt.get(k))!=(k in a,a.get(k)):errors.append('receipt_'+k)
            for k in ('operation_id','outcome','observable_work_id','completed_at_utc','event_refs'):
                if receipt[k]!=r[k]:errors.append('receipt_'+k)
            if receipt['recovery_actions']!=r['recovery_action_ids'] or receipt['review_revision_ref']!=a['target']['review_revision_ref']:errors.append('receipt_context')
        window=None;items=[];read_receipt=None
        if result['observation_ref'] is not None:
            window=read(result['observation_ref'],'window')
            for k,v in {'window_ref':result['observation_ref'],'original_request_ref':original['request_ref'],'query_sha256':query_digest,'descriptor_ref':s['descriptor_ref'],'descriptor_sha256':s['descriptor_sha256'],'scope_ref':scope,'command_id':a['command_id'],**{k:a[k] for k in ('provider','provider_variant','normalized_host','account_id')}}.items():
                if window[k]!=v:errors.append('window_'+k)
            if r['terminal_provider_result_ref']!=result['observation_ref']:errors.append('provider_window_reference')
            if not instant(original['accepted_at_utc'])<=instant(window['observed_at_utc'])<=instant(r['completed_at_utc']):errors.append('window_time')
            if window['items'] and not window['source_evidence_refs']:errors.append('items_without_source')
            if window['outcome']=='read' and not window['source_evidence_refs']:errors.append('read_without_source')
            if window['outcome']=='not_read' and (window['items'] or window['completeness']!='unknown' or window['freshness']!='unavailable'):errors.append('not_read_claim')
            if window['outcome']=='read' and window['freshness']=='unavailable':errors.append('read_unavailable')
            if window['completeness']=='complete' and window['continuation_ref'] is not None:errors.append('complete_continuation')
            if window['continuation_ref'] is not None:continuation(window['continuation_ref'],window['window_ref'])
            if (window['outcome']!='read' or window['freshness'] in ('stale','unavailable') or window['completeness']=='unknown') and window['reason_ref'] is None:errors.append('missing_read_reason')
            identities=[]
            for ref in window['items']:
                item=read(ref,'pipeline_item' if automation is not None else 'repository_item');items.append(item)
                if item['item_ref']!=ref or any(item[k]!=a[k] for k in ('provider','provider_variant','normalized_host','account_id')):errors.append('item_identity')
                if instant(item['observed_at_utc'])>instant(window['observed_at_utc']):errors.append('item_future')
                if automation is None:
                    if item['scope_ref']!=scope:errors.append('repository_item_scope')
                    identities.append(item['provider_repository_id'])
                else:
                    p=item['projection'];identities.append(p['provider_pipeline_id'])
                    if item['automation_binding_ref']!=scope or item['automation_binding_generation']!=automation['binding_generation'] or p['provider']!=a['provider'] or p['repository_binding_ref']!=a['repository_binding_ref']:errors.append('pipeline_item_scope')
            if len(identities)!=len(set(identities)):errors.append('duplicate_native_item')
            read_receipt=read(result['read_receipt_ref'],'read_receipt')
            for k,v in {'read_receipt_ref':result['read_receipt_ref'],'original_request_ref':original['request_ref'],'query_sha256':query_digest,'window_ref':window['window_ref'],'command_receipt_ref':r['receipt_ref'],'outcome':window['outcome'],'currentness_ref':window['currentness_ref']}.items():
                if read_receipt[k]!=v:errors.append('read_receipt_'+k)
            if not instant(window['observed_at_utc'])<=instant(read_receipt['observed_at_utc'])<=instant(r['completed_at_utc']):errors.append('read_receipt_time')
        if r['outcome']=='accepted':
            if o['outcome'] not in ('accepted','acknowledged','executing') or o['result_receipt_ref'] is not None or window is not None or result['read_receipt_ref'] is not None or r['terminal_provider_result_ref'] is not None:errors.append('accepted_not_terminal')
            if r['observable_work_id'] is None:errors.append('accepted_without_work')
            if r['receipt_ref'] is not None and r['receipt_ref']!=o['acknowledgement_receipt_ref']:errors.append('acceptance_receipt')
        else:
            if window is None or receipt is None:errors.append('terminal_read_evidence')
            if r['outcome'] in ('succeeded','degraded') and (window is None or window['outcome']!='read'):errors.append('success_without_read')
            if r['outcome']=='succeeded' and window is not None and (window['freshness']!='current' or window['completeness']=='unknown'):errors.append('success_freshness')
            if r['outcome']=='degraded' and window is not None and window['freshness']=='current' and window['completeness']=='complete':errors.append('false_degraded')
            expected={'succeeded':'succeeded','degraded':'succeeded','blocked':'rejected','failed':'failed','cancelled':'cancelled','effect_unknown':'terminal_unknown','recovery_required':'terminal_unknown'}[r['outcome']]
            if (r['error'] or {}).get('effect_state')=='unknown':expected='terminal_unknown'
            if o['outcome']!=expected or o['result_receipt_ref']!=r['receipt_ref']:errors.append('terminal_outcome')
        if r['observable_work_id'] is not None:
            work=read(r['observable_work_id'],'ObservableWorkRecord','Plans/full_thread_runtime_contracts.schema.json');errors+=full_thread_semantic_failures('ObservableWorkRecord',work)
            if work['identity']!=original['identity'] or work['observable_work_id']!=r['observable_work_id']:errors.append('original_work')
            if not instant(original['accepted_at_utc'])<=instant(work['observed_at'])<=instant(r['completed_at_utc']):errors.append('work_time')
            if r['outcome']=='accepted' and (work['work_state'] in ('completed','failed','cancelled','recovery-required') or work['result_receipt_ref'] is not None):errors.append('accepted_work_terminal')
        original_response=read(response['original_dispatch_id'],None,'Plans/ui_command_response.schema.json') if response['replayed'] else None
        errors+=replay_failures(response,original_response)
        proof('admission',verify_original_admission,original,request,precommit,binding,automation)
        proof('descriptor',verify_query_authority,original,request,descriptor,api,resources)
        proof('read',verify_read_sources,original,request,result,descriptor,window,items,read_receipt,cache)
        proof('disclosure',check_current_disclosure,original,result,response,delivery,actual_error,projection,cache)
    except Exception as exc:errors.append('owner_resolution:'+type(exc).__name__)
    if inputs!=saved or any(v!=frozen for v,frozen in snapshots):errors.append('original_mutated')
    return sorted(set(errors))

def response_failures(bundle,dependencies):
    """Central UI hook; dependencies are trusted adapters, never bundle facts."""
    if not isinstance(dependencies,dict):return ['list_native_dependencies_missing']
    frozen=deepcopy(bundle);snapshots=[]
    try:
        resolver=dependencies['resolve_record']
        def read(ref):
            actual=resolver(ref);snapshots.append((actual,deepcopy(actual)));return deepcopy(actual)
        original=read(bundle['original_binding_ref'])
        result=bundle['owner_result'];response=bundle['response'];outcome=bundle['outcome']
        normalized=bundle['normalized_request'];errors=[]
        expected={'request_ref':original['request_ref'],'command_id':original['arguments']['authority']['command_id'],
                  'command_instance_id':original['identity']['command_instance_id'],
                  'operation_id':original['identity']['operation_id'],'owner_identity':original['identity'],
                  **{k:original[k] for k in ('payload_sha256','idempotency_key','target_generation','dispatch_frame_id')}}
        if any(normalized.get(k)!=v for k,v in expected.items()):errors.append('list_normalized_original')
        if read(bundle['resolved_outcome_ref'])!=outcome or read(bundle['response_ref'])!=response:errors.append('list_bundle_actual_records')
        errors+=validate_list_result(bundle['owner_request'],result,bundle['original_binding_ref'],
                                    bundle['resolved_outcome_ref'],bundle['response_ref'],bundle['delivery_return_context'],**dependencies)
    except Exception as exc:errors=['list_response_resolution:'+type(exc).__name__]
    if bundle!=frozen or any(a!=b for a,b in snapshots):errors.append('list_response_original_mutated')
    return sorted(set(errors))

def fixture_dependencies(value):
    """Synthetic static doubles; not genuine issuer/content/redaction proof."""
    return {'resolve_record':lambda ref:value['records'][ref],
            'canonical_digest':owner_result_digest,**{k:lambda *args:[] for k in ('verify_original_admission','verify_query_authority','verify_read_sources','check_current_disclosure')}}

def list_query_semantic_failures(definition,value):
    if definition!='fixture_case':return []
    if shape(definition,value):return ['fixture_shape']
    return validate_list_result(value['request'],value['result'],value['original_binding_ref'],value['outcome_ref'],value['response_ref'],value['delivery_return_context'],**fixture_dependencies(value))
