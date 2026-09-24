"""Static Settings search joins, not search execution or native/owner evidence.

The only observations consumed here are explicit fixture values and canonical
destination registries. No ambient application state, clock, or provider work.
"""
from __future__ import annotations

from datetime import datetime
from functools import lru_cache
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]


@lru_cache(maxsize=1)
def destinations():
    settings = json.loads((ROOT / 'Plans/settings_inventory.json').read_text())
    pack = json.loads((ROOT / 'Plans/settings_system_contract_fixtures.json').read_text())
    return {row['id'] for row in settings['settings']}, pack['manager_registry']


def timestamp(value):
    try:
        result = datetime.fromisoformat(value.replace('Z', '+00:00'))
        return result if result.tzinfo is not None else None
    except (AttributeError, TypeError, ValueError):
        return None


def result_kind_valid(result):
    target = result['destination']
    kind = result['result_type']
    if kind == 'setting':
        return target['target_type'] == 'setting'
    if target['target_type'] != 'manager':
        return False
    if kind == 'managed_object' and target['detail_id'] is None:
        return False
    if kind == 'intentional_help_result' and target['manager_id'] != 'teacher-help':
        return False
    if kind == 'unavailable_capability':
        return result['availability'] is not None and result['availability']['state'] != 'available'
    return True


def result_shapes(exchange):
    return all(result_kind_valid(result) for result in
               (exchange['selected_result'], exchange['current_result']) if result is not None)


def request_binding(exchange):
    selected = exchange['selected_result']
    request = exchange['route_request']
    origin = request['return_contract']
    return (request['target'] == selected['destination']
            and origin.get('origin_search_result_id') == selected['immutable_result_id']
            and request['project_id'] == origin['exact_context']['project_id']
            and origin['exact_context'] == selected['exact_context'])


def rejection(exchange):
    """Derive admission from actual values, never from a claimed outcome flag."""
    selected = exchange['selected_result']
    current = exchange['current_result']
    origin = exchange['route_request']['return_contract']
    continuation = exchange['current_continuation']
    if current is None:
        return 'target_missing', 'rejected_stale'
    if (current['immutable_result_id'] != selected['immutable_result_id']
            or current['destination'] != selected['destination']):
        return 'target_changed', 'rejected_stale'
    if (current['exact_context'] != selected['exact_context']
            or exchange['current_context'] != selected['exact_context']
            or continuation['exact_context'] != origin['exact_context']):
        return 'target_changed', 'rejected_context_changed'
    if continuation != origin:
        return 'route_stale', 'rejected_stale'
    now = timestamp(exchange['evaluated_at_utc'])
    expires = timestamp(origin['expires_at_utc'])
    if now is None or expires is None or now >= expires:
        return 'currentness_expired', 'rejected_stale'
    setting_ids, managers = destinations()
    target = current['destination']
    if target['target_type'] == 'setting':
        if target['setting_id'] not in setting_ids:
            return 'owner_contract_missing', 'rejected_stale'
        required = ['project_id']
    else:
        manager = managers.get(target['manager_id'])
        if manager is None or manager['owner_disposition'] not in {
                'canonical_owner_registered', 'owner_route_aggregate', 'deferred_gui_owner_registered'}:
            return 'owner_contract_missing', 'rejected_stale'
        required = manager['required_target_fields']
    if any(current['exact_context'].get(field) is None for field in required):
        return 'target_changed', 'rejected_context_changed'
    availability = exchange['route_availability']
    if availability['state'] != 'available':
        return availability['reason_code'], 'rejected_stale'
    return None, 'returned'


def currentness_admission(exchange):
    reason, expected_return = rejection(exchange)
    if exchange['route_outcome'] != ('admitted' if reason is None else 'rejected'):
        return False
    if exchange['disabled_reason'] != reason:
        return False
    result = exchange['return_result']
    if result is None:
        return True
    if result['outcome'] == 'cancelled':
        return result['disabled_reason'] is None
    return result['outcome'] == expected_return and result['disabled_reason'] == reason


def observation_clock(exchange):
    now = timestamp(exchange['evaluated_at_utc'])
    request = timestamp(exchange['route_request']['requested_at_utc'])
    availability = exchange['route_availability']
    observed = timestamp(availability['evaluated_at_utc'])
    expires = timestamp(exchange['route_request']['return_contract']['expires_at_utc'])
    if None in (now, request, observed, expires) or not (request <= now and observed <= now and request < expires):
        return False
    if availability['selector_ref'] != exchange['route_request']['command_id']:
        return False
    result = exchange['return_result']
    if result is not None:
        returned = timestamp(result['returned_at_utc'])
        # The observation is evaluated for this returned outcome, not borrowed
        # from an earlier admission that may already have expired.
        if returned != now:
            return False
    return True


def return_correlation(exchange):
    result = exchange['return_result']
    if result is None:
        return True
    request = exchange['route_request']
    origin = request['return_contract']
    return (result['route_id'] == request['route_id']
            and result['continuation_id'] == origin['continuation_id']
            and result['continuation_generation'] == origin['continuation_generation'])


def return_restoration(exchange):
    result = exchange['return_result']
    if result is None:
        return True
    if result['outcome'] != 'returned':
        return (result.get('restored_search_result_id') is None
                and result['restored_focus_id'] is None and result['restored_query'] == ''
                and result['restored_scroll_anchor'] is None)
    origin = exchange['route_request']['return_contract']
    return (result.get('restored_search_result_id') == origin.get('origin_search_result_id')
            and result.get('restored_search_result_id') is not None
            and result['restored_focus_id'] == origin['origin_focus_id']
            and result['restored_query'] == origin['origin_query']
            and result['restored_scroll_anchor'] == origin['origin_scroll_anchor'])


# Individually exercisable rules: tests ablate each predicate and prove its
# schema-valid counterexample would otherwise be admitted. No runtime bypass.
SEARCH_RULES = {
    'search_result_kind': result_shapes,
    'search_request_binding': request_binding,
    'search_currentness_admission': currentness_admission,
    'search_observation_clock': observation_clock,
    'search_return_correlation': return_correlation,
    'search_return_restoration': return_restoration,
}


def settings_search_semantic_failures(definition_name: str, value: Any) -> list[str]:
    if definition_name not in {'settings_search_result', 'settings_search_route_exchange'}:
        return []
    try:
        if definition_name == 'settings_search_result':
            return [] if result_kind_valid(value) else ['search_result_kind']
        return sorted(name for name, check in SEARCH_RULES.items() if not check(value))
    except (KeyError, TypeError, ValueError, AttributeError):
        # Structural validation normally rejects malformed input first.
        return ['search_malformed_join']
