"""Conditional SP-266 v2 decoded-value oracles. No admission; native NOT_RUN.

Observations are synthetic adapter assumptions, not authenticated native receipts.
This module never writes registries, storage, events or live Browser state. The
v1 producer and immutable v1 schema remain owned by their existing module. The
SP-278 token join and core relations are checked here against the SP-278 schema
and its own digest recipe, not through the reset oracle, so a reset edit cannot
change created v2 semantics.
"""
from __future__ import annotations

import copy
import importlib.util
import json
import re
from datetime import datetime, timedelta
from functools import lru_cache
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = 'Plans/browser_workspace_created_checkpoint_v2.schema.json'
FIXTURES = 'Plans/browser_workspace_created_checkpoint_v2_fixtures.json'
V1_SCHEMA = 'Plans/browser_workspace_created_contracts.schema.json'
GENERIC = 'Plans/event_record_index_checkpoint.schema.json'
FAMILY = 'browser_workspace_created_index_checkpoint'
V1_ID = 'pm.storage_value.browser_workspace_created_index_checkpoint.v1'
V2_ID = 'pm.storage_value.browser_workspace_created_index_checkpoint.v2'
SCOPE = ('storage_instance_id', 'project_id', 'scope_partition')
TIMES = ('updated_at_utc', 'withdrawn_at_utc', 'published_at_utc')
TIMESTAMP = re.compile(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})')


def load(path, root=ROOT):
    return json.loads((root / path).read_text())


@lru_cache(maxsize=8)
def sibling(name, root=ROOT):
    spec = importlib.util.spec_from_file_location('created_v2_' + name, root / 'scripts' / (name + '.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@lru_cache(maxsize=8)
def validators(root=ROOT):
    schemas = [load(p, root) for p in (SCHEMA, V1_SCHEMA, GENERIC)]
    for schema in schemas:
        Draft202012Validator.check_schema(schema)
    registry = Registry().with_resources((s['$id'], Resource.from_contents(s)) for s in schemas)
    def make(schema, definition):
        return Draft202012Validator({'$ref': schema['$id'] + '#/$defs/' + definition},
                                     registry=registry, format_checker=FormatChecker())
    return {**{name: make(schemas[0], name) for name in ('checkpoint', 'checkpoint_core', 'generation_transaction', 'cleanup_transaction')},
            'v1': make(schemas[1], 'checkpoint'),
            'generic_read_token': make(schemas[2], 'read_token'), 'generic_checkpoint': make(schemas[2], 'checkpoint')}


def instant(value):
    return datetime.fromisoformat(value.replace('Z', '+00:00'))


def key(value):
    return FAMILY + '.v1:' + value['storage_instance_id'] + ':' + value['scope_partition']


def is_v1(value):
    return isinstance(value, dict) and value.get('schema_id') == V1_ID


def legacy_failures(value, root=ROOT):
    if not validators(root)['v1'].is_valid(value):
        return ['legacy_schema']
    return sibling('pm_browser_workspace_created', root).checkpoint_failures(value, root=root)


def core_failures(value, root=ROOT):
    if not validators(root)['checkpoint_core'].is_valid(value):
        return ['checkpoint_core_schema']
    return core_relation_failures(value, root)


def core_relation_failures(value, root=ROOT):
    """Decoded scope, stored-token identity, range and time relations of one core."""
    errors = []
    if value['scope_partition'] != sibling('pm_browser_workspace_created', root).scope_partition(value['project_id']):
        errors.append('checkpoint_scope_partition')
    if value['index_read_token']['storage_instance_id'] != value['storage_instance_id']:
        errors.append('checkpoint_storage_identity')
    cursor = value['source_cursor']
    if cursor is not None and (value['first_retained_sequence_id'] > value['index_through_sequence_id'] or
                               cursor['last_sequence_id'] != value['index_through_sequence_id'] or
                               cursor['byte_offset'] >= cursor['frame_end_offset']):
        errors.append('checkpoint_range_or_cursor')
    if any(value[name] is not None and not TIMESTAMP.fullmatch(value[name]) for name in TIMES):
        return errors + ['checkpoint_timestamp']
    try:
        times = {name: instant(value[name]) for name in TIMES if value[name] is not None}
    except ValueError:
        return errors + ['checkpoint_timestamp']
    if 'withdrawn_at_utc' in times and times['withdrawn_at_utc'] > times['updated_at_utc']:
        errors.append('withdrawal_after_observation')
    if times['published_at_utc'] > times['updated_at_utc'] or (
            'withdrawn_at_utc' in times and times['published_at_utc'] > times['withdrawn_at_utc']):
        errors.append('generation_birth_after_observation_or_withdrawal')
    return errors


def index_token_failures(token, index, observation, root=ROOT):
    """Exact SP-278 join of a complete ten-field read token beneath an assumed native read."""
    if not validators(root)['generic_read_token'].is_valid(token) or not validators(root)['generic_checkpoint'].is_valid(index):
        return ['generic_index_schema']
    if not isinstance(observation, dict) or observation.get('generic_source_verified') is not True:
        return ['generic_source_unproved']
    selected = index['current_generation_id']
    node = index['generations'].get(selected) if selected is not None else None
    if (node is None or node['state'] != 'current' or node['generation_id'] != selected or
            sum(n['state'] == 'current' for n in index['generations'].values()) != 1):
        return ['generic_generation_not_current']
    root_key = 'event_record_index_checkpoint.v1:' + index['storage_instance_id']
    frontier = node['frontier']
    expected = {'storage_instance_id': index['storage_instance_id'], 'checkpoint_key': root_key,
                'checkpoint_ref': root_key + '#/generations/' + selected, 'generation_id': selected,
                'generation_anchor_sha256': binding_digest(node['anchor'], root),
                'frontier_revision': frontier['publication_revision'], 'frontier_sha256': binding_digest(frontier, root),
                'index_dataset_name': 'event_record_index.v2@' + selected,
                'source_selection': frontier['source_selection'], 'redb_snapshot_id': observation.get('redb_snapshot_id')}
    errors = []
    if token != expected or node['index_dataset_name'] != expected['index_dataset_name']:
        errors.append('generic_read_token_join')
    if observation.get('source_selection') != frontier['source_selection']:
        errors.append('generic_current_source_changed')
    if frontier['source_selection']['storage_instance_id'] != index['storage_instance_id']:
        errors.append('generic_source_storage_mismatch')
    return errors


def checkpoint_failures(value, root=ROOT):
    if not validators(root)['checkpoint'].is_valid(value):
        return ['checkpoint_schema']
    core = {k: v for k, v in value.items() if k != 'retired_generations'}
    errors = core_failures(core, root)
    # Successor references may name a lawfully removed generation. Exact
    # rotation/cleanup transactions preserve the chain without rewriting refs.
    seen = {value['publication_id']}
    for entry in value['retired_generations']:
        old = entry.get('checkpoint_core', entry.get('legacy_checkpoint'))
        if 'legacy_checkpoint' in entry:
            errors += legacy_failures(old, root)
            publication = entry['publication_id']
            withdrawal = entry['retired_at_utc']
            custody = entry['custody_bound_at_utc']
            if (old['withdrawn_at_utc'] is not None and withdrawal != old['withdrawn_at_utc']) or (
                    old['withdrawn_at_utc'] is None and withdrawal != custody):
                errors.append('legacy_first_withdrawal_changed')
            if instant(custody) < instant(old['updated_at_utc']) or instant(withdrawal) > instant(custody):
                errors.append('legacy_custody_time')
            birth = custody
        else:
            errors += core_failures(old, root)
            publication = old['publication_id']
            withdrawal = old['withdrawn_at_utc']
            birth = old['published_at_utc']
        if publication in seen or publication == entry['successor_publication_id']:
            errors.append('history_identity')
        seen.add(publication)
        if any(old[k] != value[k] for k in SCOPE):
            errors.append('history_scope')
        if instant(withdrawal) > instant(value['published_at_utc']) or instant(birth) > instant(value['published_at_utc']):
            errors.append('history_time')
    # Only one v1 row exists per key, so a lawful handoff leaves one v1 wrapper.
    if sum('legacy_checkpoint' in entry for entry in value['retired_generations']) > 1:
        errors.append('multiple_v1_custody_entries')
    return sorted(set(errors))


def generation_failures(before, after, observation, root=ROOT):
    """Exact handoff/rotation join beneath assumed native custody and CAS."""
    if not isinstance(observation, dict):
        return ['generation_observation_schema']
    errors = checkpoint_failures(after, root)
    if before is not None:
        errors += legacy_failures(before, root) if is_v1(before) else checkpoint_failures(before, root)
    tx = observation.get('generation_transaction')
    if not validators(root)['generation_transaction'].is_valid(tx):
        return errors + ['generation_transaction_schema']
    if errors:
        return errors
    if (tx['before'] != before or tx['after'] != after or tx['checkpoint_key'] != key(after) or
            tx['selected_publication_id'] != after['publication_id'] or
            tx['committed_at_utc'] != after['published_at_utc'] or observation.get('prior_checkpoint') != before):
        return ['generation_transaction_join']
    for flag in ('generation_transaction_resolved', 'coordinator_admitted', 'complete_rebuild_verified',
                 'capacity_reserved', 'hold_ref_fence_current'):
        if observation.get(flag) is not True:
            errors.append('generation_unproved:' + flag)
    # A new generation may be born degraded over lawful SP-278 survivor loss;
    # only a withdrawn birth or a birth time other than first publication fails.
    if after['state'] == 'withdrawn' or after['updated_at_utc'] != after['published_at_utc']:
        errors.append('generation_birth')
    if before is None:
        if after['retired_generations'] or tx['v1_custody'] is not None:
            errors.append('initial_history')
        return errors
    if any(before[k] != after[k] for k in SCOPE) or instant(after['published_at_utc']) < instant(before['updated_at_utc']):
        return errors + ['replacement_scope_or_time']
    if is_v1(before):
        custody = tx['v1_custody']
        if custody is None or any(observation.get(flag) is not True for flag in
                                  ('v1_custody_verified', 'v1_codec_supported')):
            return errors + ['legacy_custody_unproved']
        if observation.get('resolved_v1_hold_refs') != custody['hold_refs']:
            errors.append('legacy_hold_custody')
        finalized = copy.deepcopy(before)
        if finalized['state'] != 'withdrawn':
            finalized.update(state='withdrawn', withdrawn_at_utc=tx['committed_at_utc'], updated_at_utc=tx['committed_at_utc'])
        history = [{'identity_origin': 'v1_custody_bound_at_handoff', 'publication_id': custody['publication_id'],
                    'custody_bound_at_utc': tx['committed_at_utc'],
                    'retired_at_utc': before['withdrawn_at_utc'] or tx['committed_at_utc'],
                    'successor_publication_id': after['publication_id'], 'hold_refs': custody['hold_refs'],
                    'legacy_checkpoint': finalized}]
    else:
        if tx['v1_custody'] is not None or before['publication_id'] == after['publication_id']:
            errors.append('replacement_identity')
        if len(before['retired_generations']) >= 2:
            errors.append('capacity_requires_cleanup')
        old = {k: copy.deepcopy(v) for k, v in before.items() if k != 'retired_generations'}
        if old['state'] != 'withdrawn':
            old.update(state='withdrawn', withdrawn_at_utc=tx['committed_at_utc'], updated_at_utc=tx['committed_at_utc'])
        history = copy.deepcopy(before['retired_generations']) + [
            {'checkpoint_core': old, 'successor_publication_id': after['publication_id']}]
    if after['retired_generations'] != history:
        errors.append('exact_history_or_holds_changed')
    return sorted(set(errors))


def source_failures(candidate, index, observation, root=ROOT, *, disclosure=False):
    errors = checkpoint_failures(candidate, root)
    if errors:
        return errors
    if not isinstance(observation, dict):
        return ['source_observation_schema']
    # The stored token is the nine-field durable token and never persists
    # redb_snapshot_id (Storage owner decision, coordinator ruling 2026-09-24).
    # The writer before commit and each reader before disclosure join the id of
    # the snapshot they actually pinned; the complete ten-field SP-278 token
    # must then pass the exact join below. The joined token is never stored.
    token = {**candidate['index_read_token'], 'redb_snapshot_id': observation.get('redb_snapshot_id')}
    errors += index_token_failures(token, index, observation, root)
    if errors:
        return errors
    for flag in ('project_filter_complete', 'created_sources_validated', 'source_dedupe_verified',
                 'access_allowed', 'deletion_allows_audit', 'binding_supported'):
        if observation.get(flag) is not True:
            errors.append('source_or_fence_unproved:' + flag)
    fence = 'disclosure_fence_current' if disclosure else 'before_commit_fence_current'
    if observation.get(fence) is not True:
        errors.append('source_or_fence_unproved:' + fence)
    # Degraded complete-survivor coverage stays readable history (SP-266 v1,
    # SP-278 degraded survivors); health must still equal the generic coverage
    # health below. Only withdrawal or an incomplete filter refuses the value.
    if candidate['state'] == 'withdrawn' or not candidate['filter_complete']:
        errors.append('checkpoint_not_current')
    if observation.get('project_id') != candidate['project_id']:
        errors.append('project_join')
    coverage = index['generations'][index['current_generation_id']]['frontier']['coverage']
    for own, generic in (('first_retained_sequence_id', 'first_retained_sequence_id'),
                         ('index_through_sequence_id', 'through_sequence_id'),
                         ('source_cursor', 'last_frame'), ('health', 'health')):
        if candidate[own] != coverage[generic]:
            errors.append('complete_examined_range_join')
    return sorted(set(errors))


def advance_failures(before, after, index, observation, root=ROOT, *, replacement=False):
    """An oracle pass is shape/semantic validity of the current definition, never native activation."""
    errors = source_failures(after, index, observation, root)
    if errors:
        return errors
    if before is None or replacement:
        return generation_failures(before, after, observation, root)
    if is_v1(before):
        return ['legacy_requires_coordinator_handoff']
    errors += checkpoint_failures(before, root)
    if errors:
        return errors
    if observation.get('prior_checkpoint') != before:
        errors.append('prior_value_cas')
    if before['state'] == 'withdrawn':
        errors.append('withdrawn_requires_replacement')
    for field in (*SCOPE, 'publication_id', 'published_at_utc', 'hold_refs', 'retired_generations'):
        if before[field] != after[field]:
            errors.append('refresh_changed_custody')
    if instant(after['updated_at_utc']) < instant(before['updated_at_utc']):
        errors.append('observation_time_regressed')
    if before['index_through_sequence_id'] is not None and (
            after['index_through_sequence_id'] is None or after['index_through_sequence_id'] < before['index_through_sequence_id']):
        errors.append('refresh_range_regressed')
    return sorted(set(errors))


def cleanup_failures(before, after, publication_id, observation, root=ROOT):
    """Same-key cleanup needs current resolved holds/refs and original anchor."""
    if not isinstance(observation, dict):
        return ['cleanup_observation_schema']
    errors = checkpoint_failures(before, root) + checkpoint_failures(after, root)
    if errors:
        return errors
    selected = [e for e in before['retired_generations'] if e.get('publication_id', e.get('checkpoint_core', {}).get('publication_id')) == publication_id]
    if len(selected) != 1:
        return ['cleanup_publication_missing']
    entry = selected[0]
    anchor = entry.get('retired_at_utc', entry.get('checkpoint_core', {}).get('withdrawn_at_utc'))
    holds = entry.get('hold_refs', entry.get('checkpoint_core', {}).get('hold_refs'))
    try:
        eligible = instant(observation['now_utc']) >= instant(anchor) + timedelta(seconds=604800)
    except (ValueError, KeyError, TypeError, AttributeError):
        eligible = False
    resolved_holds = observation.get('resolved_hold_refs')
    if (not eligible or not isinstance(resolved_holds, list) or sorted(resolved_holds) != sorted(holds) or
            observation.get('active_hold_refs') != [] or observation.get('resolved_references') != [] or
            observation.get('all_applicable_holds_enumerated') is not True):
        errors.append('cleanup_protected_or_unexpired')
    if observation.get('hold_ref_fence_current') is not True or observation.get('cleanup_transaction_resolved') is not True:
        errors.append('cleanup_custody_unproved')
    for flag in ('maintenance_authorized', 'access_allowed', 'deletion_allows_audit'):
        if observation.get(flag) is not True:
            errors.append('cleanup_authority_unproved:' + flag)
    expected = copy.deepcopy(before)
    expected['retired_generations'].remove(entry)
    tx = observation.get('cleanup_transaction')
    if not validators(root)['cleanup_transaction'].is_valid(tx):
        return errors + ['cleanup_transaction_schema']
    if (observation.get('prior_checkpoint') != before or tx.get('before') != before or tx.get('after') != after or
            tx.get('checkpoint_key') != key(before) or tx.get('selected_publication_id') != publication_id or
            tx.get('committed_at_utc') != observation.get('now_utc') or tx.get('status') != 'committed'):
        errors.append('cleanup_transaction_join')
    if after != expected:
        errors.append('cleanup_changed_survivors')
    return sorted(set(errors))


def binding_digest(value, root=ROOT):
    # SP-278's own pm.event_index.binding.msgpack_sha256.v1 recipe.
    return sibling('pm_event_index_binding', root).binding_digest(value)


def resolve_pointer(document, pointer):
    value = document
    for part in pointer.lstrip('#').split('/')[1:]:
        value = value[part.replace('~1', '/').replace('~0', '~')]
    return value


def fixture_values(root=ROOT, generic_case=None):
    """Owner fixture joined to its SP-278 positive source, resolved by path and pointer.

    generic_case selects another positive case in the same SP-278 fixture file.
    The index, stored token, examined bounds, cursor and health, and the birth
    transaction's key, after-value, publication and time are derived, never copied.
    """
    fixture = load(FIXTURES, root)
    source_ref = fixture['generic_fixture_source']
    pointer = source_ref['json_pointer'] if generic_case is None else '#/positive/' + generic_case
    source = resolve_pointer(load(source_ref['path'], root), pointer)
    index = copy.deepcopy(source['checkpoint'])
    generation = index['current_generation_id']
    node = index['generations'][generation]
    frontier = node['frontier']
    coverage = frontier['coverage']
    token = {'storage_instance_id': index['storage_instance_id'], 'checkpoint_key': source['checkpoint_key'],
             'checkpoint_ref': source['checkpoint_key'] + '#/generations/' + generation,
             'generation_id': generation, 'generation_anchor_sha256': binding_digest(node['anchor'], root),
             'frontier_revision': frontier['publication_revision'], 'frontier_sha256': binding_digest(frontier, root),
             'index_dataset_name': node['index_dataset_name'],
             'source_selection': copy.deepcopy(frontier['source_selection'])}
    checkpoint = {**copy.deepcopy(fixture['checkpoint_template']), 'storage_instance_id': index['storage_instance_id'],
                  'index_read_token': token,
                  'first_retained_sequence_id': coverage['first_retained_sequence_id'],
                  'index_through_sequence_id': coverage['through_sequence_id'],
                  'source_cursor': copy.deepcopy(coverage['last_frame']),
                  'state': 'current' if coverage['health'] == 'healthy' else 'degraded',
                  'health': coverage['health']}
    observation = copy.deepcopy(fixture['observation_template'])
    observation['source_selection'] = copy.deepcopy(frontier['source_selection'])
    observation['generation_transaction'].update(
        checkpoint_key=key(checkpoint), after=copy.deepcopy(checkpoint),
        selected_publication_id=checkpoint['publication_id'], committed_at_utc=checkpoint['published_at_utc'])
    return checkpoint, index, observation, copy.deepcopy(fixture['legacy_v1_checkpoint'])


if __name__ == '__main__':
    # The default source plus the lawful empty and degraded SP-278 shapes: each
    # must be born and then disclosed. A pass is contract validity only, never native activation.
    results = {}
    for case in (None, 'verified_empty', 'degraded_survivors'):
        checkpoint, index, observation, _ = fixture_values(generic_case=case)
        results[case or 'default'] = (advance_failures(None, checkpoint, index, observation) +
                                      source_failures(checkpoint, index, observation, disclosure=True))
    errors = {case: found for case, found in results.items() if found}
    print(json.dumps({'status': 'FAIL' if errors else 'PASS', 'definition_status': 'newly_authored_owner_contract',
                      'native': 'NOT_RUN', 'positive_cases': len(results), 'errors': errors}))
    raise SystemExit(bool(errors))
