"""SP-266 v2 decoded-value oracles of the current definition. They grant no admission; native NOT_RUN.

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
import sys
from pathlib import Path

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from pm_contract_formats import FormatChecker
import pm_event_payload_route as body_route
from pm_ds_tables import Facts
Draft202012Validator = body_route.StrictValidator
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
    registry = body_route.schema_registry(root).with_resources((s['$id'], Resource.from_contents(s)) for s in schemas).crawl()
    body_route.eager(registry, *schemas)
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
    shape = Facts('v2_legacy_schema', chain=True)
    if shape.stop('LG01_legacy_schema', lambda: validators(root)['v1'].is_valid(value)):
        return [shape.first_code()]
    shape.done()
    return sibling('pm_browser_workspace_created', root).checkpoint_failures(value, root=root)


def core_failures(value, root=ROOT):
    shape = Facts('v2_core_schema', chain=True)
    if shape.stop('V2C01_core_schema', lambda: validators(root)['checkpoint_core'].is_valid(value)):
        return [shape.first_code()]
    shape.done()
    return core_relation_failures(value, root)


def core_relation_failures(value, root=ROOT):
    """Decoded scope, stored-token identity, range and time relations of one core."""
    cursor = value['source_cursor']
    relations = Facts('v2_core_relations')
    relations['V2R01_scope_partition'] = value['scope_partition'] == sibling('pm_browser_workspace_created', root).scope_partition(value['project_id'])
    relations['V2R02_token_storage'] = value['index_read_token']['storage_instance_id'] == value['storage_instance_id']
    relations['V2R03_range_order'] = cursor is None or value['first_retained_sequence_id'] <= value['index_through_sequence_id']
    relations['V2R04_cursor_through'] = cursor is None or cursor['last_sequence_id'] == value['index_through_sequence_id']
    relations['V2R05_cursor_offsets'] = cursor is None or cursor['byte_offset'] < cursor['frame_end_offset']
    relations['V2R05A_storage_uint64'] = body_route.storage_uint64_fields_ok(value)
    errors = relations.codes()
    times = {}

    def calendar(name):
        if value[name] is None:
            return True
        try:
            times[name] = instant(value[name])
        except ValueError:
            return False
        return True

    stamps = Facts('v2_core_times', chain=True)
    for row, check in (('V2R06_updated_grammar', lambda: value['updated_at_utc'] is None or TIMESTAMP.fullmatch(value['updated_at_utc']) is not None),
                       ('V2R07_withdrawn_grammar', lambda: value['withdrawn_at_utc'] is None or TIMESTAMP.fullmatch(value['withdrawn_at_utc']) is not None),
                       ('V2R08_published_grammar', lambda: value['published_at_utc'] is None or TIMESTAMP.fullmatch(value['published_at_utc']) is not None),
                       ('V2R09_updated_calendar', lambda: calendar('updated_at_utc')),
                       ('V2R10_withdrawn_calendar', lambda: calendar('withdrawn_at_utc')),
                       ('V2R11_published_calendar', lambda: calendar('published_at_utc'))):
        if stamps.stop(row, check):
            return errors + [stamps.first_code()]
    stamps.done()
    withdrawn = 'withdrawn_at_utc' in times
    order = Facts('v2_core_order')
    order['V2R12_withdrawal_order'] = not withdrawn or times['withdrawn_at_utc'] <= times['updated_at_utc']
    order['V2R13_birth_before_update'] = times['published_at_utc'] <= times['updated_at_utc']
    order['V2R14_birth_before_withdrawal'] = not withdrawn or times['published_at_utc'] <= times['withdrawn_at_utc']
    return errors + order.codes()


def index_token_failures(token, index, observation, root=ROOT):
    """Exact SP-278 join of a complete ten-field read token beneath an assumed native read."""
    entry = Facts('v2_token_entry', chain=True)
    selected = {}

    def node_present():
        selected['id'] = index['current_generation_id']
        selected['node'] = index['generations'].get(selected['id']) if selected['id'] is not None else None
        return selected['node'] is not None

    for row, check in (('TK01_token_schema', lambda: validators(root)['generic_read_token'].is_valid(token)),
                       ('TK02_index_schema', lambda: validators(root)['generic_checkpoint'].is_valid(index)),
                       ('TK03_observation_object', lambda: isinstance(observation, dict)),
                       ('TK04_source_verified', lambda: observation.get('generic_source_verified') is True),
                       ('TK05_current_node', node_present),
                       ('TK06_node_current', lambda: selected['node']['state'] == 'current'),
                       ('TK07_node_identity', lambda: selected['node']['generation_id'] == selected['id']),
                       ('TK08_one_current', lambda: [n for n in index['generations'].values() if n['state'] == 'current'] == [selected['node']])):
        if entry.stop(row, check):
            return [entry.first_code()]
    entry.done()
    node = selected['node']
    generation = selected['id']
    root_key = 'event_record_index_checkpoint.v1:' + index['storage_instance_id']
    frontier = node['frontier']
    expected = {'storage_instance_id': index['storage_instance_id'], 'checkpoint_key': root_key,
                'checkpoint_ref': root_key + '#/generations/' + generation, 'generation_id': generation,
                'generation_anchor_sha256': binding_digest(node['anchor'], root),
                'frontier_revision': frontier['publication_revision'], 'frontier_sha256': binding_digest(frontier, root),
                'index_dataset_name': 'event_record_index.v2@' + generation,
                'source_selection': frontier['source_selection'], 'redb_snapshot_id': observation.get('redb_snapshot_id')}
    joins = Facts('v2_token_joins')
    joins['TK09_token_fields'] = set(token) == set(expected)
    for number, field in enumerate(expected, 10):
        joins[f'TK{number:02d}_{field}'] = token.get(field) == expected[field]
    joins['TK20_node_dataset'] = node['index_dataset_name'] == expected['index_dataset_name']
    joins['TK21_current_source'] = observation.get('source_selection') == frontier['source_selection']
    joins['TK22_source_storage'] = frontier['source_selection']['storage_instance_id'] == index['storage_instance_id']
    return joins.codes()


def checkpoint_failures(value, root=ROOT):
    shape = Facts('v2_checkpoint_schema', chain=True)
    if shape.stop('V2K01_checkpoint_schema', lambda: validators(root)['checkpoint'].is_valid(value)):
        return [shape.first_code()]
    shape.done()
    core = {k: v for k, v in value.items() if k != 'retired_generations'}
    errors = core_failures(core, root)
    # Successor references may name a lawfully removed generation. Exact
    # rotation/cleanup transactions preserve the chain without rewriting refs.
    seen = {value['publication_id']}
    for entry in value['retired_generations']:
        old = entry.get('checkpoint_core', entry.get('legacy_checkpoint'))
        legacy = 'legacy_checkpoint' in entry
        f = Facts('v2_history_entry')
        if legacy:
            errors += legacy_failures(old, root)
            publication = entry['publication_id']
            withdrawal = entry['retired_at_utc']
            custody = entry['custody_bound_at_utc']
            f['V2K02_legacy_first_withdrawal'] = old['withdrawn_at_utc'] is None or withdrawal == old['withdrawn_at_utc']
            f['V2K03_legacy_custody_withdrawal'] = old['withdrawn_at_utc'] is not None or withdrawal == custody
            f['V2K04_legacy_custody_after_update'] = instant(custody) >= instant(old['updated_at_utc'])
            f['V2K05_legacy_withdrawal_before_custody'] = instant(withdrawal) <= instant(custody)
            birth = custody
        else:
            errors += core_failures(old, root)
            publication = old['publication_id']
            withdrawal = old['withdrawn_at_utc']
            birth = old['published_at_utc']
            for row in ('V2K02_legacy_first_withdrawal', 'V2K03_legacy_custody_withdrawal',
                        'V2K04_legacy_custody_after_update', 'V2K05_legacy_withdrawal_before_custody'):
                f[row] = True
        f['V2K06_publication_unique'] = publication not in seen
        f['V2K07_publication_not_successor'] = publication != entry['successor_publication_id']
        f['V2K08_history_scope'] = [k for k in SCOPE if old[k] != value[k]] == []
        f['V2K09_withdrawal_before_successor'] = instant(withdrawal) <= instant(value['published_at_utc'])
        f['V2K10_birth_before_successor'] = instant(birth) <= instant(value['published_at_utc'])
        errors += f.codes()
        seen.add(publication)
    # Only one v1 row exists per key, so a lawful handoff leaves one v1 wrapper.
    custody_count = Facts('v2_history_custody')
    custody_count['V2K11_one_v1_custody'] = len([e for e in value['retired_generations'] if 'legacy_checkpoint' in e]) <= 1
    errors += custody_count.codes()
    return sorted(set(errors))


def generation_failures(before, after, observation, root=ROOT):
    """Exact handoff/rotation join beneath assumed native custody and CAS."""
    entry = Facts('v2_gen_entry', chain=True)
    if entry.stop('V2G01_observation_object', lambda: isinstance(observation, dict)):
        return [entry.first_code()]
    entry.done()
    errors = checkpoint_failures(after, root)
    if before is not None:
        errors += legacy_failures(before, root) if is_v1(before) else checkpoint_failures(before, root)
    tx = observation.get('generation_transaction')
    shape = Facts('v2_gen_tx_schema', chain=True)
    if shape.stop('V2G02_transaction_schema', lambda: validators(root)['generation_transaction'].is_valid(tx)):
        return errors + [shape.first_code()]
    shape.done()
    if errors:
        return errors
    join = Facts('v2_gen_tx_join', chain=True)
    for row, check in (('V2G03_tx_before', lambda: tx['before'] == before),
                       ('V2G04_tx_after', lambda: tx['after'] == after),
                       ('V2G05_tx_key', lambda: tx['checkpoint_key'] == key(after)),
                       ('V2G06_tx_publication', lambda: tx['selected_publication_id'] == after['publication_id']),
                       ('V2G07_tx_committed_at', lambda: tx['committed_at_utc'] == after['published_at_utc']),
                       ('V2G08_prior_checkpoint', lambda: observation.get('prior_checkpoint') == before)):
        if join.stop(row, check):
            return [join.first_code()]
    join.done()
    admission = Facts('v2_gen_admission')
    for number, flag in enumerate(('generation_transaction_resolved', 'coordinator_admitted', 'complete_rebuild_verified',
                                   'capacity_reserved', 'hold_ref_fence_current'), 9):
        admission[f'V2G{number:02d}_{flag}'] = observation.get(flag) is True
    # A new generation may be born degraded over lawful SP-278 survivor loss;
    # only a withdrawn birth or a birth time other than first publication fails.
    admission['V2G14_birth_not_withdrawn'] = after['state'] != 'withdrawn'
    admission['V2G15_birth_time'] = after['updated_at_utc'] == after['published_at_utc']
    errors += admission.codes()
    if before is None:
        initial = Facts('v2_gen_initial')
        initial['V2G16_initial_no_history'] = not after['retired_generations']
        initial['V2G17_initial_no_v1_custody'] = tx['v1_custody'] is None
        return errors + initial.codes()
    replacement = Facts('v2_gen_replacement', chain=True)
    if replacement.stop('V2G18_replacement_scope', lambda: [k for k in SCOPE if before[k] != after[k]] == []):
        return errors + [replacement.first_code()]
    if replacement.stop('V2G19_replacement_time', lambda: instant(after['published_at_utc']) >= instant(before['updated_at_utc'])):
        return errors + [replacement.first_code()]
    replacement.done()
    if is_v1(before):
        custody = tx['v1_custody']
        legacy = Facts('v2_gen_legacy', chain=True)
        for row, check in (('V2G20_v1_custody_present', lambda: custody is not None),
                           ('V2G21_v1_custody_verified', lambda: observation.get('v1_custody_verified') is True),
                           ('V2G22_v1_codec_supported', lambda: observation.get('v1_codec_supported') is True)):
            if legacy.stop(row, check):
                return errors + [legacy.first_code()]
        legacy.done()
        holds = Facts('v2_gen_legacy_holds')
        holds['V2G23_v1_hold_refs'] = observation.get('resolved_v1_hold_refs') == custody['hold_refs']
        errors += holds.codes()
        finalized = copy.deepcopy(before)
        if finalized['state'] != 'withdrawn':
            finalized.update(state='withdrawn', withdrawn_at_utc=tx['committed_at_utc'], updated_at_utc=tx['committed_at_utc'])
        history = [{'identity_origin': 'v1_custody_bound_at_handoff', 'publication_id': custody['publication_id'],
                    'custody_bound_at_utc': tx['committed_at_utc'],
                    'retired_at_utc': before['withdrawn_at_utc'] or tx['committed_at_utc'],
                    'successor_publication_id': after['publication_id'], 'hold_refs': custody['hold_refs'],
                    'legacy_checkpoint': finalized}]
    else:
        rotation = Facts('v2_gen_rotation')
        rotation['V2G24_rotation_no_v1_custody'] = tx['v1_custody'] is None
        rotation['V2G25_rotation_new_publication'] = before['publication_id'] != after['publication_id']
        rotation['V2G26_rotation_capacity'] = len(before['retired_generations']) < 2
        errors += rotation.codes()
        old = {k: copy.deepcopy(v) for k, v in before.items() if k != 'retired_generations'}
        if old['state'] != 'withdrawn':
            old.update(state='withdrawn', withdrawn_at_utc=tx['committed_at_utc'], updated_at_utc=tx['committed_at_utc'])
        history = copy.deepcopy(before['retired_generations']) + [
            {'checkpoint_core': old, 'successor_publication_id': after['publication_id']}]
    exact = Facts('v2_gen_history')
    exact['V2G27_exact_history'] = after['retired_generations'] == history
    errors += exact.codes()
    return sorted(set(errors))


def source_failures(candidate, index, observation, root=ROOT, *, disclosure=False):
    errors = checkpoint_failures(candidate, root)
    if errors:
        return errors
    entry = Facts('v2_source_entry', chain=True)
    if entry.stop('V2S01_observation_object', lambda: isinstance(observation, dict)):
        return [entry.first_code()]
    entry.done()
    # The stored token is the nine-field durable token and never persists
    # redb_snapshot_id (Storage owner decision, coordinator ruling 2026-09-24).
    # The writer before commit and each reader before disclosure join the id of
    # the snapshot they actually pinned; the complete ten-field SP-278 token
    # must then pass the exact join below. The joined token is never stored.
    token = {**candidate['index_read_token'], 'redb_snapshot_id': observation.get('redb_snapshot_id')}
    errors += index_token_failures(token, index, observation, root)
    if errors:
        return errors
    coverage = index['generations'][index['current_generation_id']]['frontier']['coverage']
    f = Facts('v2_source')
    for number, flag in enumerate(('project_filter_complete', 'created_sources_validated', 'source_dedupe_verified',
                                   'access_allowed', 'deletion_allows_audit', 'binding_supported'), 2):
        f[f'V2S{number:02d}_{flag}'] = observation.get(flag) is True
    f['V2S08_before_commit_fence'] = disclosure or observation.get('before_commit_fence_current') is True
    f['V2S09_disclosure_fence'] = not disclosure or observation.get('disclosure_fence_current') is True
    # Degraded complete-survivor coverage stays readable history (SP-266 v1,
    # SP-278 degraded survivors); health must still equal the generic coverage
    # health below. Only withdrawal or an incomplete filter refuses the value.
    f['V2S10_not_withdrawn'] = candidate['state'] != 'withdrawn'
    f['V2S11_filter_complete'] = bool(candidate['filter_complete'])
    f['V2S12_project_join'] = observation.get('project_id') == candidate['project_id']
    for row, own, generic in (('V2S13_first_retained', 'first_retained_sequence_id', 'first_retained_sequence_id'),
                              ('V2S14_through', 'index_through_sequence_id', 'through_sequence_id'),
                              ('V2S15_cursor', 'source_cursor', 'last_frame'), ('V2S16_health', 'health', 'health')):
        f[row] = candidate[own] == coverage[generic]
    return sorted(set(errors + f.codes()))


def advance_failures(before, after, index, observation, root=ROOT, *, replacement=False):
    """An oracle pass is shape/semantic validity of the current definition, never native activation."""
    errors = source_failures(after, index, observation, root)
    if errors:
        return errors
    if before is None or replacement:
        return generation_failures(before, after, observation, root)
    entry = Facts('v2_advance_entry', chain=True)
    if entry.stop('V2A01_not_v1', lambda: not is_v1(before)):
        return [entry.first_code()]
    entry.done()
    errors += checkpoint_failures(before, root)
    if errors:
        return errors
    f = Facts('v2_advance')
    f['V2A02_prior_cas'] = observation.get('prior_checkpoint') == before
    f['V2A03_not_withdrawn'] = before['state'] != 'withdrawn'
    for number, field in enumerate((*SCOPE, 'publication_id', 'published_at_utc', 'hold_refs', 'retired_generations'), 4):
        f[f'V2A{number:02d}_custody_{field}'] = before[field] == after[field]
    f['V2A11_observation_time'] = instant(after['updated_at_utc']) >= instant(before['updated_at_utc'])
    f['V2A12_range_not_regressed'] = before['index_through_sequence_id'] is None or (
        after['index_through_sequence_id'] is not None and after['index_through_sequence_id'] >= before['index_through_sequence_id'])
    return sorted(set(errors + f.codes()))


def cleanup_failures(before, after, publication_id, observation, root=ROOT):
    """Same-key cleanup needs current resolved holds/refs and original anchor."""
    entry = Facts('v2_cleanup_entry', chain=True)
    if entry.stop('V2CL01_observation_object', lambda: isinstance(observation, dict)):
        return [entry.first_code()]
    entry.done()
    errors = checkpoint_failures(before, root) + checkpoint_failures(after, root)
    if errors:
        return errors
    selected = [e for e in before['retired_generations'] if e.get('publication_id', e.get('checkpoint_core', {}).get('publication_id')) == publication_id]
    found = Facts('v2_cleanup_selected', chain=True)
    if found.stop('V2CL02_publication_selected', lambda: len(selected) == 1):
        return [found.first_code()]
    found.done()
    entry = selected[0]
    anchor = entry.get('retired_at_utc', entry.get('checkpoint_core', {}).get('withdrawn_at_utc'))
    holds = entry.get('hold_refs', entry.get('checkpoint_core', {}).get('hold_refs'))
    try:
        eligible = instant(observation['now_utc']) >= instant(anchor) + timedelta(seconds=604800)
    except (ValueError, KeyError, TypeError, AttributeError):
        eligible = False
    resolved_holds = observation.get('resolved_hold_refs')
    f = Facts('v2_cleanup')
    f['V2CL03_retention_elapsed'] = eligible
    f['V2CL04_resolved_holds_list'] = isinstance(resolved_holds, list)
    f['V2CL05_resolved_holds_exact'] = not isinstance(resolved_holds, list) or sorted(resolved_holds) == sorted(holds)
    f['V2CL06_no_active_holds'] = observation.get('active_hold_refs') == []
    f['V2CL07_no_live_references'] = observation.get('resolved_references') == []
    f['V2CL08_holds_enumerated'] = observation.get('all_applicable_holds_enumerated') is True
    f['V2CL09_hold_fence'] = observation.get('hold_ref_fence_current') is True
    f['V2CL10_transaction_resolved'] = observation.get('cleanup_transaction_resolved') is True
    for number, flag in enumerate(('maintenance_authorized', 'access_allowed', 'deletion_allows_audit'), 11):
        f[f'V2CL{number:02d}_{flag}'] = observation.get(flag) is True
    errors += f.codes()
    expected = copy.deepcopy(before)
    expected['retired_generations'].remove(entry)
    tx = observation.get('cleanup_transaction')
    shape = Facts('v2_cleanup_tx_schema', chain=True)
    if shape.stop('V2CL14_transaction_schema', lambda: validators(root)['cleanup_transaction'].is_valid(tx)):
        return errors + [shape.first_code()]
    shape.done()
    joins = Facts('v2_cleanup_tx_join')
    joins['V2CL15_prior_checkpoint'] = observation.get('prior_checkpoint') == before
    joins['V2CL16_tx_before'] = tx.get('before') == before
    joins['V2CL17_tx_after'] = tx.get('after') == after
    joins['V2CL18_tx_key'] = tx.get('checkpoint_key') == key(before)
    joins['V2CL19_tx_publication'] = tx.get('selected_publication_id') == publication_id
    joins['V2CL20_tx_committed_at'] = tx.get('committed_at_utc') == observation.get('now_utc')
    joins['V2CL21_tx_committed'] = tx.get('status') == 'committed'
    joins['V2CL22_survivors_exact'] = after == expected
    return sorted(set(errors + joins.codes()))


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
