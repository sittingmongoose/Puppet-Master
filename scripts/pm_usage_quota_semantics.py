"""Quota-window v2 finite static composition; no quota/accounting/native engine."""
from copy import deepcopy
from functools import lru_cache
import json
import math
import os
from pathlib import Path
import sys

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT=Path(__file__).resolve().parents[1]
CANON=Path(os.environ.get('PM_CANON_ROOT',ROOT))
sys.path.insert(0,str(CANON/'scripts'))
import pm_usage_command_semantics as core
SCHEMA='usage_quota_command_contracts.schema.json'
PROFILE='usage_quota_selection.v2'

@lru_cache(maxsize=1)
def schemas():
    docs={}
    for filename in (SCHEMA,'usage_command_contracts.schema.json','full_thread_runtime_contracts.schema.json',
                     'shared_runtime_command_contracts.schema.json','ui_command_response.schema.json'):
        docs[filename]=json.loads(((ROOT if filename==SCHEMA else CANON)/'Plans'/filename).read_text())
    return docs, Registry().with_resources((d['$id'],Resource.from_contents(d)) for d in docs.values())

def shape(definition,value,filename=None):
    docs,registry=schemas();doc=docs[filename or SCHEMA]
    selected=doc if definition is None else {'$ref':doc['$id']+'#/$defs/'+definition}
    return [e.message for e in Draft202012Validator(selected,registry=registry,format_checker=FormatChecker()).iter_errors(value)]

def quota_failures(row,query):
    failures=[];route,account,window=(row[k] for k in ('route_source','account_source','window_source'))
    numeric_values=[window[k]['value'] for k in ('remaining','used','limit')]
    if window.get('reset_countdown') is not None:numeric_values.append(window['reset_countdown']['remaining_seconds'])
    if any(isinstance(value,float) and not math.isfinite(value) for value in numeric_values):
        failures.append('quota_nonfinite_quantity')
    if any(row[k]!=query[k] for k in ('scope_kind','server_id','project_id')):failures.append('quota_scope')
    if not core.instant(query['interval_start'])<=core.instant(row['observed_at_utc'])<core.instant(query['interval_end']):failures.append('quota_interval')
    if any(source[k]!=route[k] for source in (account,window) for k in ('provider_id','provider_route_ref')):failures.append('quota_route_context')
    if query['filter_kind']=='provider' and route['provider_id']!=query['provider_id']:failures.append('quota_provider_filter')
    if query['filter_kind'] in ('work','personal') and account['account_scope']!=query['filter_kind']:failures.append('quota_account_filter')
    if window['window_scope'] in ('account','account+model') and (window['account_id'] is None or window['account_id']!=account['effective_account_id']):failures.append('quota_account_subject')
    if window['window_scope']=='account+model' and window['model_id'] is None:failures.append('quota_model_subject')
    for scope,key in (('org','org_id'),('server_profile','server_profile_id')):
        if window['window_scope']==scope and window[key] is None:failures.append('quota_'+scope+'_subject')
    if any(account[k] is not None for k in ('requested_auth_mode','effective_auth_mode','effective_account_id')) and account['auth_resolution_ref'] is None:failures.append('quota_auth_source_missing')
    if account['selected_billing_entity_id'] is not None and account['billing_resolution_ref'] is None:failures.append('quota_billing_source_missing')
    if any(account[k] is not None for k in ('configured_project_id','requested_provider_project_id','effective_provider_project_id')) and account['project_context_resolution_ref'] is None:failures.append('quota_project_context_source_missing')
    known=[window[k] for k in ('remaining','used','limit') if window[k]['value'] is not None]
    if known and not window['source_evidence_refs']:failures.append('quota_value_evidence_missing')
    if window['source_authority'] in ('inferred_estimated','unknown') and any(v['state']=='reported' for v in known):failures.append('quota_inferred_reported')
    # Class describes how evidence arrived; authority describes what it proves.
    # CLI/server transports can relay genuine provider quota or local statistics.
    if window['source_authority'] in ('authoritative_provider_quota','authoritative_local_session_stats') and window['source_class'] in ('local_estimated','pricing_estimated'):
        failures.append('quota_inferred_class_claims_authority')
    reset_present=window['reset_at'] is not None or window.get('reset_countdown') is not None
    if window['window_kind']=='session_only':
        if window['source_authority']!='authoritative_local_session_stats' or any(window[k]['value'] is not None for k in ('remaining','limit')) or reset_present:failures.append('quota_session_is_not_provider_remaining')
    if window['window_kind']=='unknown' and reset_present:failures.append('quota_unknown_reset')
    if window['window_kind']=='fixed_reset' and not reset_present:failures.append('quota_fixed_reset_missing')
    for key,evidence in (('reset_at','reset_evidence_refs'),('cooldown_until','cooldown_evidence_refs')):
        present=reset_present if key=='reset_at' else window[key] is not None
        if present != bool(window[evidence]):failures.append('quota_'+key+'_evidence')
    if row['health']!='healthy' and row['reason'] is None:failures.append('quota_health_reason')
    return failures

def projection_failures(projection,read_source):
    failures=[];legacy=deepcopy(projection);legacy['rows']=[];ids=[]
    for row in projection['rows']:
        if row['row_kind']=='attempt_usage':legacy['rows'].append(row['usage']);continue
        ids.append(row['row_ref']);failures+=quota_failures(row,projection['query'])
        for kind in ('route_source','account_source','window_source'):
            expected=row[kind];actual=read_source(kind,expected['source_ref'])
            if shape(kind,actual):failures.append('quota_'+kind+'_shape')
            elif actual!=expected:failures.append('quota_'+kind+'_original')
    failures+=core.projection_failures(legacy)
    if len(ids)!=len(set(ids)):failures.append('duplicate_quota_row')
    return failures

def result_route(command):
    return {'path':'Plans/'+SCHEMA,'json_pointer':'#/$defs/usage_'+('refresh' if command=='cmd.usage.refresh' else 'export')+'_result','schema_id':'pm.usage.command_result.v2'}

def validate_usage_result(request_ref,result_ref,response_ref,*,resolve_record,verify_original_admission,
                          verify_permission,verify_sources,verify_delivery,check_current_disclosure,canonical_owner_digest):
    """Same mandatory native proof callbacks as v1, plus resolved typed sources.

    verify_sources must authenticate route/account/auth/billing/project/window
    read projections against their actual original owners and source precedence;
    equality and refs alone are not issuer authority. Source schema materializes
    a narrow read contract, not a claim that native owner adapters already exist.
    """
    snapshots=[];cache={};extra=[]
    def read(kind,ref):
        key=(kind,ref)
        if key not in cache:
            try:value=resolve_record(kind,ref)
            except Exception as exc:raise ValueError('quota_owner_resolution') from exc
            snapshots.append((value,deepcopy(value)));cache[key]=deepcopy(value)
        return deepcopy(cache[key])
    def projection(p):return projection_failures(p,read)
    def admission(request,before):
        if request['command_id']=='cmd.usage.export' and request['export_scope']=='ledger' and any(r['row_kind']=='quota_window' for r in before['rows']):extra.append('quota_rows_not_ledger')
        return verify_original_admission(request,before)
    failures=core._validate_usage_result(request_ref,result_ref,response_ref,resolve_record=read,
        verify_original_admission=admission,verify_permission=verify_permission,verify_sources=verify_sources,
        verify_delivery=verify_delivery,check_current_disclosure=check_current_disclosure,canonical_owner_digest=canonical_owner_digest,
        contract_shape=shape,contract_projection_failures=projection,contract_result_route=result_route,contract_export_profile=PROFILE)
    if any(v!=frozen for v,frozen in snapshots):failures.append('quota_source_changed_during_resolution')
    return sorted(set(failures+extra))

def fixture_dependencies(value):
    """Explicit static doubles; never native quota/authentication proof."""
    deps=core.fixture_dependencies(value);old=deps['resolve_record']
    def read(kind,ref):
        if kind in ('route_source','account_source','window_source'):return value['source_records'][ref]
        return old(kind,ref)
    deps['resolve_record']=read
    return deps

def usage_quota_semantic_failures(definition,value):
    if definition!='usage_command_fixture':return []
    # source_records is fixture-only evidence input, never runtime storage.
    if shape(definition,value):return ['fixture_shape']
    return validate_usage_result(value['request']['request_ref'],'fixture:result','fixture:response',**fixture_dependencies(value))
