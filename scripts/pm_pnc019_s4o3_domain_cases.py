"""Remaining explicit W3E domain obligations from the committed oracle plan.

These are clean-room owner-boundary inputs: operation journals, resolved owner
receipts, inventories and before/after state. No row takes an 'oracle passed'
or 'domain valid' flag. The event fixture remains separately checked by the
complete W3E checker; these boundaries exercise its upstream owner obligations.
"""
import copy
from pm_event_numbers import current_integer, Refusal


# family, short name, predicate over its raw owner-boundary record, positive
# record, single-field negative. References here are fixture authorities only.
RULES = (
    ('backup.destination_changed', 'destination_not_backup',
     "d['verification_after'] != d['verification_before']",
     {'verification_before': [], 'verification_after': []}, {'verification_after': ['backup:verified']}),
    ('backup.state_changed', 'capture_barrier',
     "'start_background_upload' in d['journal'] and ('release_capture_barrier' not in d['journal'] or d['journal'].index('release_capture_barrier') >= d['journal'].index('start_background_upload'))",
     {'journal': ['capture', 'release_capture_barrier', 'start_background_upload']},
     {'journal': ['capture', 'start_background_upload', 'release_capture_barrier']}),
    ('backup.state_changed', 'cancel_generation',
     "d['verified_after_cancel'] != d['last_verified_before']",
     {'last_verified_before': 'snapshot:verified:7', 'verified_after_cancel': 'snapshot:verified:7'},
     {'verified_after_cancel': 'snapshot:partial:8'}),
    ('remote_access.private_endpoint_state_changed', 'private_connector_owner',
     "d['connector_server'] != d['listener_server']",
     {'connector_server': 'server:home-01', 'listener_server': 'server:home-01'}, {'connector_server': 'client:local'}),
    ('remote_access.private_endpoint_state_changed', 'funnel_independent',
     "d['private_listener_after_funnel'] != d['private_listener_before']",
     {'private_listener_before': {'endpoint': 'private:1', 'state': 'ready'},
      'private_listener_after_funnel': {'endpoint': 'private:1', 'state': 'ready'}},
     {'private_listener_after_funnel': {'endpoint': 'private:1', 'state': 'disabled'}}),
    ('remote_access.proxy_state_changed', 'proxy_ready_test',
     "d['route_state'] in ['ready', 'active'] and d['test_receipt']['terminal_status'] != 'passed'",
     {'route_state': 'ready', 'test_receipt': {'receipt_id': 'test:proxy:7', 'terminal_status': 'passed'}},
     {'test_receipt': {'receipt_id': 'test:proxy:7', 'terminal_status': 'not_run'}}),
    ('remote_access.proxy_state_changed', 'npm_existing_only',
     "d['proxy_kind'] == 'nginx_proxy_manager' and d['new_artifacts'] != []",
     {'proxy_kind': 'nginx_proxy_manager', 'new_artifacts': []}, {'new_artifacts': ['proxy:generated-install']}),
    ('remote_access.proxy_state_changed', 'proxy_headers_peer',
     "d['header_source_peer'] not in d['configured_trusted_peers']",
     {'header_source_peer': 'peer:configured:1', 'configured_trusted_peers': ['peer:configured:1']},
     {'header_source_peer': 'peer:untrusted:2'}),
    ('remote_access.proxy_state_changed', 'proxy_no_certificate_claim',
     "d['certificate_claims'] != []", {'certificate_claims': []}, {'certificate_claims': ['certificate_valid']}),
    ('remote_access.public_security_violation_detected', 'violation_failed_control',
     "d['control_results'].get(d['violated_control']) != 'failed'",
     {'violated_control': 'origin', 'control_results': {'origin': 'failed', 'csrf': 'passed'}},
     {'control_results': {'origin': 'passed', 'csrf': 'passed'}}),
    ('remote_access.remote_link_state_changed', 'remote_link_e2e',
     "d['e2e_channel_ref'] not in d['verified_e2e_channels']",
     {'e2e_channel_ref': 'e2e:verified:1', 'verified_e2e_channels': ['e2e:verified:1']},
     {'e2e_channel_ref': 'e2e:requested-only:2'}),
    ('remote_access.remote_link_state_changed', 'remote_link_resolution',
     "d['used_resolution'] != d['original_verified_resolution']",
     {'used_resolution': 'resolution:verified:1', 'original_verified_resolution': 'resolution:verified:1'},
     {'used_resolution': 'draft:nonblank'}),
    ('remote_access.remote_link_state_changed', 'remote_link_server',
     "d['server_after_transport_change'] != d['original_server']",
     {'original_server': 'server:home-01', 'server_after_transport_change': 'server:home-01'},
     {'server_after_transport_change': 'server:other'}),
    ('remote_access.route_migration_state_changed', 'migration_server_generation',
     "type(d['expected']) is not type(d['actual']) or d['expected'] != d['actual']",
     {'expected': 7, 'actual': 7}, {'actual': 8}),
    ('remote_access.route_migration_state_changed', 'migration_endpoint_generation',
     "type(d['expected']) is not type(d['actual']) or d['expected'] != d['actual']",
     {'expected': 11, 'actual': 11}, {'actual': 12}),
    ('remote_access.route_migration_state_changed', 'migration_trust_generation',
     "type(d['expected']) is not type(d['actual']) or d['expected'] != d['actual']",
     {'expected': 13, 'actual': 13}, {'actual': 14}),
    ('remote_access.route_migration_state_changed', 'migration_command',
     "d['command_after'] != d['command_before']",
     {'command_before': 'command:original:1', 'command_after': 'command:original:1'}, {'command_after': 'command:new:2'}),
    ('remote_access.route_migration_state_changed', 'migration_cursor',
     "d['cursor_after'] != d['cursor_before']",
     {'cursor_before': 'cursor:durable:17', 'cursor_after': 'cursor:durable:17'}, {'cursor_after': 'cursor:restart:0'}),
    ('remote_access.route_state_changed', 'reachability_not_trust',
     "d['trust_after_reachability'] != d['trust_before']",
     {'trust_before': [], 'trust_after_reachability': []}, {'trust_after_reachability': ['client:illicit-grant']}),
    ('remote_access.route_state_changed', 'public_consent_generation',
     "d['consent_policy_generation'] != d['current_policy_generation']",
     {'consent_policy_generation': 7, 'current_policy_generation': 7}, {'consent_policy_generation': 6}),
    ('remote_access.route_state_changed', 'public_preflight_generation',
     "d['preflight_route_generation'] != d['current_route_generation']",
     {'preflight_route_generation': 9, 'current_route_generation': 9}, {'preflight_route_generation': 8}),
    ('remote_access.route_state_changed', 'headscale_no_funnel',
     "d['provider'] == 'headscale' and d['route_type'] == 'funnel_public'",
     {'provider': 'headscale', 'route_type': 'private_tailscale'}, {'route_type': 'funnel_public'}),
    ('remote_access.route_state_changed', 'disable_preserves_private',
     "d['private_routes_after_disable'] != d['private_routes_before']",
     {'private_routes_before': ['private:route:1'], 'private_routes_after_disable': ['private:route:1']},
     {'private_routes_after_disable': []}),
    ('restore.state_changed', 'restore_preview_current',
     "d['preview_manifest'] != d['selected_manifest']",
     {'preview_manifest': 'manifest:selected:7', 'selected_manifest': 'manifest:selected:7'},
     {'preview_manifest': 'manifest:stale:6'}),
    ('restore.state_changed', 'restore_human_approval',
     "d['approval_principal']['kind'] != 'human'",
     {'approval_principal': {'kind': 'human', 'principal_ref': 'person:original:1'}},
     {'approval_principal': {'kind': 'automation', 'principal_ref': 'service:other:2'}}),
    ('server.catalog_changed', 'catalog_identity_dedupe',
     "d['merged_server_id'] != d['independently_verified_server_id']",
     {'merged_server_id': 'server:verified:1', 'independently_verified_server_id': 'server:verified:1'},
     {'merged_server_id': 'discovery:address-equal'}),
    ('server.client_pairing_state_changed', 'pairing_reject_no_grant',
     "d['outcome'] in ['rejected', 'cancelled'] and d['issued_trust'] != []",
     {'outcome': 'rejected', 'issued_trust': []}, {'issued_trust': ['trust:illicit:1']}),
    ('server.client_pairing_state_changed', 'pairing_answered_generation',
     "d['request_generation'] in d['answered_generations'] and d['new_state'] in ['created', 'waiting_identity', 'waiting_approval']",
     {'request_generation': 7, 'answered_generations': [7], 'new_state': 'complete'}, {'new_state': 'waiting_approval'}),
    ('server.client_pairing_state_changed', 'pairing_preserves_prior_trust',
     "d['trust_after_later_rejection'] != d['trust_before_request']",
     {'trust_before_request': ['trust:prior:1'], 'trust_after_later_rejection': ['trust:prior:1']},
     {'trust_after_later_rejection': []}),
    ('server.client_trust_changed', 'active_trust_original_grant',
     "d['grant_receipt_ref'] not in d['original_protected_grant_receipts']",
     {'grant_receipt_ref': 'grant:original:1', 'original_protected_grant_receipts': ['grant:original:1']},
     {'grant_receipt_ref': 'discovery:reachable'}),
    ('server.client_trust_changed', 'trust_session_fence',
     "d['session_generation'] != d['current_session_generation']",
     {'session_generation': 11, 'current_session_generation': 11}, {'session_generation': 10}),
    ('server.connection_state_changed', 'connection_catchup',
     "d['cursor_ref'] is None and d['snapshot_ref'] is None",
     {'cursor_ref': 'cursor:verified:1', 'snapshot_ref': None}, {'cursor_ref': None}),
    ('server.discovery_expired', 'expiry_preserves_newer',
     "d['newer_observation_id'] in d['expired_observation_ids']",
     {'newer_observation_id': 'discovery:newer:2', 'expired_observation_ids': ['discovery:original:1']},
     {'expired_observation_ids': ['discovery:original:1', 'discovery:newer:2']}),
    ('server.discovery_observed', 'discovery_not_verified_identity',
     "d['verified_servers_after_discovery'] != d['verified_servers_before']",
     {'verified_servers_before': ['server:existing:1'], 'verified_servers_after_discovery': ['server:existing:1']},
     {'verified_servers_after_discovery': ['server:existing:1', 'discovery:new:2']}),
)


def number_fields(record):
    return {key: type(value) is list for key, value in record.items()
            if type(value) is int or (type(value) is list and value and all(type(v) is int for v in value))}


def prepare(name, record):
    original = next(good for _family, short, _predicate, good, _bad in RULES if short == name)
    record = copy.deepcopy(record)
    reasons = {}
    for key, is_list in number_fields(original).items():
        values = record[key] if is_list and type(record[key]) is list else [record[key]]
        reason = None
        for value in values:
            try:
                current_integer(value, minimum=0)
            except Refusal as error:
                reason = error.reason
                break
        reasons[key] = reason
    record['numeric_reasons'] = reasons
    return record


def contexts(case):
    """The held upstream owner inputs consumed before a new event append."""
    from pm_pnc019_s4o3_store import TABLES
    from pm_pnc019_s4o3_owner import inputs
    result = {}
    known = inputs(case)
    if known is not None:
        result[known[0]] = known[1]
    family = case['family']
    relevant = [r for r in RULES if r[0] == family]
    values = {'extra_' + name: prepare(name, good) for _family, name, _predicate, good, _bad in relevant}
    for table in TABLES:
        if table.startswith('extra_' + family.replace('.', '_') + '_'):
            result[table] = copy.deepcopy(values)
    return result


def refresh(value):
    """Recompute shared numeric results; never trust cached fixture verdicts."""
    result = copy.deepcopy(value)
    for key, record in result.items():
        if key.startswith('extra_') and isinstance(record, dict) and 'numeric_reasons' in record:
            result[key] = prepare(key[len('extra_'):], record)
    return result


def run(adapter, family, trace, refuse):
    from pm_pnc019_s4o3_store import Store, TABLES
    relevant = [r for r in RULES if r[0] == family]
    if not relevant:
        return 0
    case = adapter.build(family)
    store = Store(adapter, case, trace)
    value = {'extra_' + name: prepare(name, good) for _family, name, _predicate, good, _bad in relevant}
    tables = [name for name in TABLES if name.startswith('extra_' + family.replace('.', '_') + '_')]
    for table in tables:
        store.require(table, value)
    for _family, name, _predicate, _good, defect in relevant:
        row = 'extra_' + name
        bad = copy.deepcopy(value)
        bad[row].update(copy.deepcopy(defect))
        bad[row] = prepare(name, bad[row])
        table = next(t for t in tables if any(r[0] == row for r in TABLES[t]))
        refuse(store, row, lambda t=table, b=bad: store.require(t, b))
        candidate = copy.deepcopy(case)
        candidate['owner_domains'][table] = copy.deepcopy(bad)
        refuse(store, row, lambda c=candidate: store.append(c))
        if name == 'capture_barrier':
            bad = copy.deepcopy(value)
            bad[row]['journal'] = ['capture', 'start_background_upload']
            refuse(store, row, lambda t=table, b=bad: store.require(t, b))
            candidate = copy.deepcopy(case)
            candidate['owner_domains'][table] = copy.deepcopy(bad)
            refuse(store, row, lambda c=candidate: store.append(c))
        for field, is_list in number_fields(_good).items():
            bad = copy.deepcopy(value)
            bad[row][field] = ['7'] if is_list else '7'
            bad[row] = prepare(name, bad[row])
            numeric_row = row + '_number_' + field
            table = next(t for t in tables if any(r[0] == numeric_row for r in TABLES[t]))
            refuse(store, numeric_row, lambda t=table, b=bad: store.require(t, b))
            candidate = copy.deepcopy(case)
            candidate['owner_domains'][table] = copy.deepcopy(bad)
            refuse(store, numeric_row, lambda c=candidate: store.append(c))
    return len(tables)
