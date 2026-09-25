"""Exact-two static read composition; no native Backup handler or authority.

Resolvers return authentic owner records under a native custody/currentness fence.
All checks are mandatory list[str] callbacks, never Boolean grant substitutes.
Native page checks authenticate actual listing, prefix/path containment, bounded
production, original cursor issuance, omissions/failures and current source scope.
The static oracle cannot prove any of those from self-reported fixture metadata.
"""
from copy import deepcopy
from datetime import datetime
from functools import lru_cache
import json
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource
from pm_backup_snapshot_semantics import validate_snapshot_source_records
from pm_full_thread_semantics import full_thread_semantic_failures

SCHEMA = 'Plans/backup_bounded_read_contracts.schema.json'
BASE = 'Plans/backup_restore_system_contracts.schema.json'


def structural_failures(definition, value, *, canon_root=None, schema_path=SCHEMA):
    return [e.message for e in _validator(definition, str(canon_root) if canon_root else None, schema_path).iter_errors(value)]


@lru_cache(maxsize=None)
def _validator(definition, canon_root, schema_path):
    root = Path(canon_root) if canon_root else Path(__file__).resolve().parents[1]
    own = Path(__file__).resolve().parents[1]
    schemas = [json.loads(p.read_text()) for p in (root / 'Plans').glob('*.schema.json')]
    companion = json.loads((own / SCHEMA).read_text())
    schemas.append(companion)
    registry = Registry().with_resources((s['$id'], Resource.from_contents(s)) for s in schemas if '$id' in s)
    schema = companion if schema_path == SCHEMA else json.loads((root / schema_path).read_text())
    return Draft202012Validator({'$ref':schema['$id']+'#/$defs/'+definition},
        registry=registry, format_checker=FormatChecker())


def request_failures(request):
    selected = request['selected_input']
    expected = 'discover' if request['command_id'] == 'cmd.backup.destination.discover' else 'browse'
    errors = []
    if selected['kind'] != expected:
        errors.append('read_command_selection')
    if (selected['cursor'] is None) != (selected['prior_page_ref'] is None):
        errors.append('read_cursor_prior_pair')
    return errors


def validate_read_result(request_ref, result, *, resolve_record,
                         verify_original_admission, verify_page_source,
                         verify_source_custody, check_current_disclosure,
                         canon_root=None):
    """Compose genuine original, page, prior page, destination and source records.

    resolve_record(kind, ref) retrieves the actual original, page, destination,
    browse operation, or BRS-030 repository/run/receipt/manifest owner record.
    verify_original_admission(request,destination,binding) authenticates original caller,
    topology, prefix/path authorization, capability and admission, not just IDs.
    verify_page_source(request,page,prior,destination,browse,receipt,binding) authenticates actual
    bounded engine listing, actual read receipt and native cursor/source provenance, failures and all
    disclosed scope. verify_source_custody retains BRS-030's existing contract.
    check_current_disclosure(request,value) rechecks current source/read access
    immediately before disclosure; source-helper checks do not replace finality.
    Each dependency is mandatory. Historical admission never grants current read.
    """
    saved_result = deepcopy(result)
    errors, live, cache = [], {}, {}
    callbacks = (resolve_record, verify_original_admission, verify_page_source,
                 verify_source_custody, check_current_disclosure)
    if not all(callable(c) for c in callbacks):
        return ['read_dependencies_missing']

    def shape(kind, value, path=SCHEMA):
        return structural_failures(kind, value, canon_root=canon_root, schema_path=path)

    def read(kind, ref):
        key = (kind, ref)
        if key not in cache:
            value = resolve_record(kind, ref)
            live[key], cache[key] = value, deepcopy(value)
        return deepcopy(cache[key])

    def checked(callback, label, *values):
        args = deepcopy(values)
        before = deepcopy(args)
        try:
            findings = callback(*args)
            if not isinstance(findings, list) or not all(isinstance(e, str) and e for e in findings):
                return [label+'_invalid_response']
            return ([label+'_inputs_mutated'] if args != before else []) + [label+':'+e for e in findings]
        except Exception:
            return [label+'_unavailable']

    request = None
    try:
        request = read('request', request_ref)
        if shape('request', request) or shape('result', saved_result):
            errors.append('read_request_result_schema')
        else:
            errors += request_failures(request)
            selected = request['selected_input']
            page = read('page', saved_result['page_ref'])
            if shape('page', page):
                errors.append('read_page_schema')
            else:
                if request['request_ref'] != request_ref or saved_result['original_request_ref'] != request_ref:
                    errors.append('read_original_ref')
                for key in ('command_id', 'command_instance_id', 'return_route_ref'):
                    if saved_result[key] != request[key]: errors.append('read_result_'+key)
                if page['original_request'] != request or page['page_ref'] != saved_result['page_ref']:
                    errors.append('read_page_original')
                receipt = read('read_receipt', saved_result['receipt_ref'])
                if shape('read_receipt',receipt):
                    raise ValueError('read_receipt_schema')
                binding = read('dispatch_binding', receipt['original_binding_ref'])
                if shape('dispatch_binding',binding):
                    raise ValueError('read_dispatch_schema')
                errors += full_thread_semantic_failures('IdentityEnvelope',binding['identity'])
                if binding['arguments'] != request or binding['request_ref'] != request_ref:
                    errors.append('read_dispatch_arguments')
                for key in ('actor_ref','permission_snapshot_ref','idempotency_key'):
                    if binding[key] != request[key]: errors.append('read_dispatch_'+key)
                for key in ('operation_id','command_instance_id'):
                    if binding['identity'][key] != request[key]: errors.append('read_dispatch_'+key)
                if binding['identity']['server_id'] != selected['target_server_id']:
                    errors.append('read_dispatch_server')
                if receipt['receipt_ref'] != saved_result['receipt_ref'] or receipt['original_request_ref'] != request_ref:
                    errors.append('read_receipt_original')
                if receipt['identity'] != binding['identity'] or receipt['command_id'] != request['command_id']:
                    errors.append('read_receipt_identity')
                for a,b in (('page_ref','page_ref'),('currentness_ref','currentness_ref'),('observed_at_utc','observed_at_utc'),('outcome','status'),('failure_ref','failure_ref')):
                    if receipt[a] != page[b]: errors.append('read_receipt_'+a)
                if page['status'] == 'cancelled':
                    if receipt['error'] is not None: errors.append('read_receipt_cancelled_error')
                elif (receipt['error'] is None) != (page['failure_ref'] is None):
                    errors.append('read_receipt_error_truth')
                if datetime.fromisoformat(page['observed_at_utc'].replace('Z','+00:00')) < datetime.fromisoformat(binding['accepted_at_utc'].replace('Z','+00:00')):
                    errors.append('read_before_admission')
                if page['requested_cursor'] != selected['cursor']:
                    errors.append('read_requested_cursor')
                if saved_result['outcome'] != page['status']:
                    errors.append('read_result_outcome')
                if page['status'] == 'completed':
                    if page['failure_ref'] is not None or page['exhausted'] != (page['next_cursor'] is None):
                        errors.append('read_completion_truth')
                elif page['failure_ref'] is None or page['exhausted']:
                    errors.append('read_failure_truth')
                if page['status'] in ('failed','unavailable','cancelled') and (page['entries'] or page['next_cursor'] is not None):
                    errors.append('read_failed_page_data')
                if page['next_cursor'] is not None and page['next_cursor'] == page['requested_cursor']:
                    errors.append('read_cursor_no_progress')
                prior = None
                if selected['prior_page_ref'] is not None:
                    prior = read('page', selected['prior_page_ref'])
                    if shape('page', prior):
                        errors.append('read_prior_schema')
                    else:
                        old = prior['original_request']
                        if prior['page_ref'] != selected['prior_page_ref'] or prior['page_ref'] == page['page_ref']:
                            errors.append('read_prior_identity')
                        if prior['next_cursor'] != selected['cursor'] or prior['exhausted'] or prior['status'] not in ('completed','partial'):
                            errors.append('read_prior_cursor')
                        for key in ('command_id','actor_ref','source_surface','return_route_ref'):
                            if old[key] != request[key]: errors.append('read_prior_'+key)
                        old_selection = {k:v for k,v in old['selected_input'].items() if k not in ('cursor','prior_page_ref')}
                        new_selection = {k:v for k,v in selected.items() if k not in ('cursor','prior_page_ref')}
                        if old_selection != new_selection: errors.append('read_prior_selection')
                        if datetime.fromisoformat(page['observed_at_utc'].replace('Z','+00:00')) < datetime.fromisoformat(prior['observed_at_utc'].replace('Z','+00:00')):
                            errors.append('read_prior_time')
                destination = read('destination', page['destination_ref'])
                definition = 'backup_destination_v3' if destination.get('schema_id') == 'pm.backup_restore_system.backup_destination.v3' else 'backup_destination'
                if shape(definition, destination, BASE):
                    errors.append('read_destination_schema')
                else:
                    if definition == 'backup_destination_v3':
                        destination = destination['destination']
                    for a,b in (('backup_destination_id','backup_destination_id'),('target_server_id','owning_server_id'),('expected_destination_generation','destination_generation')):
                        if selected[a] != destination[b]: errors.append('read_destination_'+a)
                    errors += checked(verify_original_admission,'read_admission',request,destination,binding)
                browse = None
                if selected['kind'] == 'discover':
                    if page['resolution'] is not None: errors.append('discover_snapshot_fabricated')
                    if any(shape('discovery_entry', e) for e in page['entries']): errors.append('discover_entry_schema')
                    if len({e.get('repository_id') for e in page['entries']}) != len(page['entries']): errors.append('discover_duplicate_repository')
                else:
                    if any(shape('browse_entry', e) for e in page['entries']): errors.append('browse_entry_schema')
                    if len({e.get('relative_path') for e in page['entries']}) != len(page['entries']): errors.append('browse_duplicate_path')
                    prefix = selected['relative_path']
                    if prefix is not None and any(e.get('relative_path') != prefix and not e.get('relative_path','').startswith(prefix.rstrip('/')+'/') for e in page['entries']):
                        errors.append('browse_path_scope')
                    resolution = page['resolution']
                    if resolution is None:
                        errors.append('browse_resolution_missing')
                    else:
                        for key in ('repository_id','backup_destination_id','snapshot_id'):
                            if resolution['selection'][key] != selected[key]: errors.append('browse_resolution_selection')
                        resolved = resolution['disposition'] == 'resolved'
                        if resolved != (resolution['resolved_source'] is not None) or resolved != (resolution['failure_reason'] is None):
                            errors.append('browse_resolution_truth')
                        elif not resolved and (page['entries'] or page['status'] in ('completed','partial')):
                            errors.append('browse_unresolved_success')
                        else:
                            errors += validate_snapshot_source_records(request,resolution,resolve_record=read,
                                verify_source_custody=lambda *v: checked(verify_source_custody,'read_source',*v),
                                check_current_disclosure=lambda *v: checked(check_current_disclosure,'read_source_disclosure',*v))
                            if resolved:
                                descriptor = resolution['resolved_source']
                                if selected['backup_id'] != descriptor['backup_id'] or selected['target_server_id'] != descriptor['server_id']:
                                    errors.append('browse_original_backup_scope')
                                if binding['identity']['project_id'] != descriptor['project_id']:
                                    errors.append('browse_dispatch_project')
                                browse = read('backup_browse_operation',selected['browse_operation_ref'])
                                if shape('backup_browse_operation',browse,BASE): errors.append('browse_operation_schema')
                                else:
                                    for key in ('repository_id','snapshot_id','capture_set_id','backup_destination_id','initiating_client_id','selected_path_refs','focus_ref'):
                                        if browse[key] != selected[key]: errors.append('browse_operation_'+key)
                                    if browse['browse_operation_id'] != selected['browse_operation_ref'] or browse['operation'] != 'browse': errors.append('browse_operation_identity')
                                    for key in ('server_id','project_id'):
                                        if browse[key] != descriptor[key]: errors.append('browse_operation_'+key)
                                    manifest = read('backup_manifest',descriptor['manifest_ref'])
                                    for key in ('source_host_id','source_environment_id'):
                                        if browse[key] != manifest[key]: errors.append('browse_operation_'+key)
                                    if browse['return_route_ref'] != request['return_route_ref']: errors.append('browse_return_route')
                errors += checked(verify_page_source,'read_page_source',request,page,prior,destination,browse,receipt,binding)
    except Exception as exc:
        errors.append('read_unavailable:'+type(exc).__name__)
    if request is not None:
        errors += checked(check_current_disclosure,'read_final_disclosure',request,saved_result)
    if result != saved_result or any(live[k] != v for k,v in cache.items()):
        errors.append('read_inputs_mutated')
    return sorted(set(errors))


def bounded_read_semantic_failures(definition, value, *, canon_root=None):
    """Fixture-only static composition; no authentic owner or permission proof."""
    if definition == 'response_fixture':
        import pm_ui_command_response as ui_module
        from pm_backup_read_response import fixture_dependencies
        return ui_module.response_bundle_failures(value['bundle'],**fixture_dependencies(value,ui_module))
    if definition == 'request': return request_failures(value)
    if definition != 'fixture_case': return []
    records = deepcopy(value['records'])
    request = deepcopy(value['request'])
    def read(kind, ref):
        if kind == 'request' and ref == request['request_ref']: return request
        return records[kind][ref]
    return validate_read_result(request['request_ref'],value['result'],resolve_record=read,
        verify_original_admission=lambda *_: [],verify_page_source=lambda *_: [],
        verify_source_custody=lambda *_: [],check_current_disclosure=lambda *_: [],canon_root=canon_root)
