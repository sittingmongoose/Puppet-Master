"""Lane DS sweep part 2A witnesses: one coherent complete input per table row that no
existing witness refuses alone.

Each witness starts from a named valid parent (a Home4 fixture value, the round-3
Browser creation/reset bases, the created v2 and reset checkpoint fixture values, the
compaction valid event, the terminal positive or the Browser admission valid cases),
changes one fact, moves every copy that observes it (recomputed hashes, digests,
encodings and tokens), and runs the complete checker entry point. ``check`` runs each
witness under the guard-table recorder and requires that its target table records an
observation whose only refusing row is the target row.

usage: python3 scripts/pm_ds_p2a_cases.py --check
"""
from __future__ import annotations

import argparse
import base64
import copy
import json
import sys
import tempfile
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_ds_tables as T  # noqa: E402
import pm_home_layout_v2_slot_receipt as h  # noqa: E402
import pm_event_payload_route as route  # noqa: E402
import pm_event_authority_ds_round2 as ds  # noqa: E402
import pm_event_authority_ds_round3 as d3  # noqa: E402
import pm_browser_workspace_created as created  # noqa: E402
import pm_browser_workspace_created_v2 as v2  # noqa: E402
import pm_browser_workspace_reset as reset  # noqa: E402
import pm_terminal_workgroup_compatibility as term  # noqa: E402

CASES = []
JCS_EDGE = 2 ** 53 + 1          # representable physically, not by the producer JCS route
UINT64_OVER = 2 ** 64           # one past SP-1100's uint64 range
LEAP = '2016-12-31T23:59:60Z'   # RFC 3339 legitimate leap second: format-valid, not a datetime instant


def case(phase, row, ident=None):
    def register(fn):
        CASES.append((ident or f'{phase}/{row}', phase, row, fn))
        return fn
    return register


# ------------------------------------------------------------------ parents
@lru_cache(maxsize=1)
def home4():
    fixtures = json.loads((ROOT / h.FIXTURES).read_text())
    return h.Checker(ROOT), fixtures, {c['id']: c['value'] for c in fixtures['valid']}, h.PayloadStore.from_fixture(fixtures['payload_store'])


def home_value(ident):
    return copy.deepcopy(home4()[2][ident])


def home_check(definition, value, store=None):
    chk, _, _, base_store = home4()
    errors = chk.schema_errors(definition, value)
    return errors or chk.semantic(definition, value, store or base_store)


def refresh_receipt_captures(r):
    for key in ('normalized_request', 'command_outcome', 'ui_response'):
        original = r['original_' + key]
        data = h.canonical_msgpack(original) if original is not None else None
        r['identity_capture_bytes'][key] = base64.b64encode(data).decode() if data is not None else None
        r['identity_capture_bytes_sha256'][key] = h.sha(data) if data is not None else None


def refresh_owner_hash(r):
    digest = h.sha(h.canonical_json(r['owner_result']))
    r['original_owner_result_sha256'] = digest
    if r['original_command_outcome'] is not None:
        r['original_command_outcome']['owner_result_sha256'] = digest
    refresh_receipt_captures(r)


def refresh_core(prior):
    data = h.canonical_msgpack(prior['core'])
    prior['core_bytes'] = base64.b64encode(data).decode()
    prior['core_sha256'] = h.sha(data)


@lru_cache(maxsize=1)
def browser():
    gate, context, values = d3.bases()
    return gate, context, values[0][1], values[1][1]


def created_base():
    return copy.deepcopy(browser()[2])


def reset_base():
    return copy.deepcopy(browser()[3])


def layout_parts():
    slot, event = d3.layout_base()
    return copy.deepcopy(slot), copy.deepcopy(event)


def layout_history(event):
    return ds.layout_history_observation(event)


def compaction_event():
    return copy.deepcopy(ds.load('Plans/context_compaction_completion_contract_fixtures.json')['valid_event'])


def terminal_positive():
    fixtures = json.loads((ROOT / term.FIXTURES).read_text())
    schema = json.loads((ROOT / term.SCHEMA).read_text())
    value = next(c for c in fixtures['cases'] if c['kind'] == 'retained' and not c['expected_errors'])['value']
    return copy.deepcopy(value), term.payload_validator(schema)


@lru_cache(maxsize=None)
def mirror_root(changes):
    """A temporary repository root whose Plans files are the real ones except the changed JSON files.

    ``changes`` is a tuple of (relative path, JSON text). Only files the checker reads change.
    """
    tmp = Path(tempfile.mkdtemp(prefix='ds-p2a-root-'))
    plans = ROOT / 'Plans'
    for path in plans.rglob('*'):
        target = tmp / path.relative_to(ROOT)
        if path.is_dir():
            target.mkdir(parents=True, exist_ok=True)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.symlink_to(path)
    for rel, text in changes:
        target = tmp / rel
        target.unlink()
        target.write_text(text)
    return tmp


def changed_json(rel, edit):
    value = json.loads((ROOT / rel).read_text())
    edit(value)
    return rel, json.dumps(value, indent=1)


# ------------------------------------------------------------------ terminal.workgroup_moved
@case('term_retained', 'TR02_original_hex')
def _():
    value, validator = terminal_positive()
    value['original_bytes_hex'] = 'zz' + value['original_bytes_hex'][2:]
    return term.retained_errors(value, validator)


@case('term_retained', 'TR03_retained_hex')
def _():
    value, validator = terminal_positive()
    value['retained_bytes_hex'] = 'zz' + value['retained_bytes_hex'][2:]
    return term.retained_errors(value, validator)


# ------------------------------------------------------------------ Home4
@case('h4_binding', 'H4B02_operation_ref')
def _():
    slot = home_value('home4_prepared_slot')
    slot['binding']['operation_ref'] = 'home_layout_operation:' + '0' * 64
    return home_check('transaction_slot', slot)


@case('h4_event_joins', 'H4J03_payload_project')
def _():
    slot = home_value('home4_readback_verified_slot')
    slot['event_semantics']['payload']['project_id'] = 'project-other'
    return home_check('transaction_slot', slot)


@case('h4_event_joins', 'H4J04_payload_tab')
def _():
    slot = home_value('home4_readback_verified_slot')
    slot['event_semantics']['payload']['workspace_tab_id'] = 'workspace-other'
    return home_check('transaction_slot', slot)


def history_case(mutate):
    slot, event = layout_parts()
    observation = layout_history(event)
    mutate(observation)
    return ds.layout_event_errors(event, binding=slot['binding'], historical=True, **observation)


@case('h4_history', 'H4H01_custody_object')
def _():
    return history_case(lambda o: o.update(custody='custody'))


@case('h4_history', 'H4H07_source_fields')
def _():
    return history_case(lambda o: o['historical_source'].update(extra='field'))


@case('h4_history', 'H4H08_event_bytes_type')
def _():
    def mutate(o):
        o['historical_source']['event_bytes'] = o['historical_source']['event_bytes'].hex()
        o['custody']['retained_source_sha256'] = h.sha(h.canonical_msgpack(o['historical_source']))
    return history_case(mutate)


@case('h4_history', 'H4H09_recipe_known')
def _():
    def mutate(o):
        o['historical_source']['payload_validation_recipe'] = 'workspace-layout-v2/other-recipe'
        o['custody']['retained_source_sha256'] = h.sha(h.canonical_msgpack(o['historical_source']))
    return history_case(mutate)


def receipt_case(mutate, refresh=None):
    r = home_value('home4_committed_receipt')
    mutate(r)
    if refresh:
        refresh(r)
    return home_check('operation_receipt', r)


def capture_bytes_of(r, key, value):
    data = h.canonical_msgpack(value)
    r['identity_capture_bytes'][key] = base64.b64encode(data).decode()
    r['identity_capture_bytes_sha256'][key] = h.sha(data)


for _key, _rows in (('normalized_request', ('H4IC01_request_presence', 'H4IC02_request_canonical', 'H4IC03_request_sha')),
                    ('command_outcome', ('H4IC04_outcome_presence', 'H4IC05_outcome_canonical', 'H4IC06_outcome_sha')),
                    ('ui_response', ('H4IC07_response_presence', 'H4IC08_response_canonical', 'H4IC09_response_sha'))):
    def _presence(r, key=_key):
        r['identity_capture_bytes'][key] = None
        r['identity_capture_bytes_sha256'][key] = None

    def _canonical(r, key=_key):
        other = copy.deepcopy(r['original_' + key])
        other['command_id' if 'command_id' in other else next(iter(other))] = 'cmd.workspace_layout.other'
        capture_bytes_of(r, key, other)

    def _sha(r, key=_key):
        r['identity_capture_bytes_sha256'][key] = 'f' * 64

    if _key != 'normalized_request':  # the request capture presence row is schema-entailed (own table)
        case('h4_receipt_capture', _rows[0])(lambda m=_presence: receipt_case(m))
    case('h4_receipt_capture', _rows[1])(lambda m=_canonical: receipt_case(m))
    case('h4_receipt_capture', _rows[2])(lambda m=_sha: receipt_case(m))


@case('h4_receipt_event', 'H4RE01_result_ref')
def _():
    return receipt_case(lambda r: r['event_semantics']['payload'].update(command_result_ref='home_layout_result:' + '1' * 64))


@case('h4_receipt_event', 'H4RE03_settled_ref')
def _():
    return receipt_case(lambda r: r['event_semantics']['payload'].update(settled_layout_ref='home_layout_settlement:' + '1' * 64))


@case('h4_receipt_head', 'H4RC03_outcome_command')
def _():
    return receipt_case(lambda r: r['original_command_outcome'].update(command_id='cmd.workspace_layout.split_panel'), refresh_receipt_captures)


@case('h4_receipt_head', 'H4RC04_response_command')
def _():
    return receipt_case(lambda r: r['original_ui_response'].update(command_id='cmd.workspace_layout.split_panel'), refresh_receipt_captures)


@case('h4_receipt_head', 'H4RC08_owner_new')
def _():
    return receipt_case(lambda r: r['owner_result'].update(new_layout_revision=r['owner_result']['new_layout_revision'] + 1), refresh_owner_hash)


@case('h4_receipt_head', 'H4RC09_readback_revision')
def _():
    return receipt_case(lambda r: r['readback'].update(layout_revision=r['readback']['layout_revision'] + 1))


@case('h4_receipt_owner', 'H4O02_outcome_hash')
def _():
    return receipt_case(lambda r: r['original_command_outcome'].update(owner_result_sha256='e' * 64), refresh_receipt_captures)


@case('h4_receipt_owner', 'H4O03_owner_result_jcs')
def _():
    def mutate(r):
        r['owner_result']['prior_layout_revision'] = JCS_EDGE
    return receipt_case(mutate)


@case('h4_registry', 'H4R03_receipt_limit')
def _():
    def edit(registry):
        profile = registry['storage_profile']
        profile['family_profiles']['home_layout_operation_receipt']['max_value_bytes'] = profile['value_limit_bytes'] + 1
    root = mirror_root((changed_json(h.STORAGE_REGISTRY, edit),))
    return h.run(root)


@case('h4_schema', 'H4S03_prior_slot_migration_generation')
def _():
    wrapper = home_value('home4_empty_slot_after_home3_migration')['prior_migration_generation']
    fixtures = {'payload_store': [], 'valid': [{'id': 'p2a_wrapper', 'definition': 'prior_slot_migration_generation', 'value': wrapper}],
                'invalid': [{'id': 'p2a_wrapper_missing_core', 'base': 'p2a_wrapper', 'rejected_by': 'schema',
                             'ops': [{'op': 'remove', 'path': '/core_sha256'}]}]}
    return h.run(ROOT, fixtures)


def migration_case(mutate, core=False):
    slot = home_value('home4_empty_slot_after_home3_migration')
    mutate(slot, slot['prior_migration_generation'])
    if core:
        refresh_core(slot['prior_migration_generation'])
    return home_check('transaction_slot', slot)


@case('h4_slot_migration', 'H4M02_core_sha')
def _():
    return migration_case(lambda s, p: p.update(core_sha256='d' * 64))


@case('h4_slot_migration', 'H4M03_logical_key')
def _():
    return migration_case(lambda s, p: p.update(logical_key=p['logical_key'].replace(s['workspace_tab_id'], 'workspace-other')))


@case('h4_slot_migration', 'H4M04_wrapper_storage')
def _():
    return migration_case(lambda s, p: p.update(storage_instance_id='22222222-2222-4222-8222-222222222222'))


@case('h4_slot_migration', 'H4M05_core_storage')
def _():
    return migration_case(lambda s, p: p['core'].update(storage_instance_id='22222222-2222-4222-8222-222222222222'), core=True)


@case('h4_slot_migration', 'H4M06_core_project')
def _():
    return migration_case(lambda s, p: p['core'].update(project_id='project-other'), core=True)


@case('h4_slot_migration', 'H4M07_core_tab')
def _():
    return migration_case(lambda s, p: p['core'].update(workspace_tab_id='workspace-other'), core=True)


for _row, _field in (('H4M08_successor_generation', 'successor_generation_id'), ('H4M10_successor_completed', 'successor_migration_completed_at_utc'),
                     ('H4M11_successor_receipt_key', 'successor_migration_receipt_key'), ('H4M12_successor_receipt_sha', 'successor_migration_receipt_sha256')):
    def _mutate(s, p, field=_field):
        value = p[field]
        if field.endswith('sha256'):
            p[field] = 'c' * 64
        elif field.endswith('_utc'):
            p[field] = value[:2] + str((int(value[2:4]) + 1) % 100).zfill(2) + value[4:]
        elif field == 'successor_generation_id':
            p[field] = value[:-1] + ('2' if value[-1] != '2' else '3')
        else:
            p[field] = value + '-other'
    case('h4_slot_migration', _row)(lambda m=_mutate: migration_case(m))


@case('h4_value_codec', 'H4L00_stored_encoding')
def _():
    slot = home_value('home4_prepared_slot')
    big = UINT64_OVER
    slot['binding']['expected_layout_revision'] = big
    slot['prior_layout']['revision'] = big
    slot['candidate_layout']['revision'] = big + 1
    return home_check('transaction_slot', slot)


@case('h4_value_limit', 'H4L01_reference_over_limit')
def _():
    def edit(registry):
        registry['storage_profile']['family_profiles']['home_layout_transaction_slot']['max_value_bytes'] = 20000
    root = mirror_root((changed_json(h.STORAGE_REGISTRY, edit),))
    chk = h.Checker(root)
    _, _, _, store = home4()
    ref = home_value('home4_prepared_slot_reference_one_over_limit')
    return chk.schema_errors('stored_value_ref', ref) or chk.semantic('stored_value_ref', ref, store)


# ------------------------------------------------------------------ body route
@case('route_reference', 'RF02_ref_object')
def _():
    gate, context, base, _ = browser()
    event = copy.deepcopy(base['event'])
    event['payload'] = None
    event['payload_ref'] = 'payload_ref:not-an-object'
    return gate.candidate_failures(event, 'BrowserRuntimeService.workspace', context)


@case('route_inline', 'RI01A_body_encodable')
def _():
    gate, context, base, _ = browser()
    event = copy.deepcopy(base['event'])
    event['payload']['facts']['workspace_generation'] = UINT64_OVER
    return gate.candidate_failures(event, 'BrowserRuntimeService.workspace', context)


@case('route_legacy', 'RL03A_body_encodable')
def _():
    gate, context, _, _ = browser()
    fixtures = gate.load_json('Plans/browser_event_admission_fixtures.json')
    source = next(c for c in fixtures['valid'] if c['event_type'] not in route.ADOPTED
                  and 'page_generation' in c['payload']['context'] and c['payload']['context']['page_generation'] is not None)
    event = gate.fixture_event(source, 1)
    event['payload']['context']['page_generation'] = UINT64_OVER
    return gate.candidate_failures(event, gate.load_json('Plans/browser_event_admission.json')['rows'][0]['producer_component'], context)


# ------------------------------------------------------------------ workspace.layout_changed event
@case('layout_context', 'LE01_historical_bool')
def _():
    slot, event = layout_parts()
    return ds.layout_event_errors(event, binding=slot['binding'], historical='false')


@case('layout_replay', 'LE09_producer_jcs')
def _():
    slot, event = layout_parts()
    binding = slot['binding']
    binding['expected_layout_revision'] = JCS_EDGE - 1
    event['payload']['prior_layout_revision'] = JCS_EDGE - 1
    event['payload']['new_layout_revision'] = JCS_EDGE
    event['producer_sequence_id'] = JCS_EDGE
    return ds.layout_event_errors(event, binding=binding)


# ------------------------------------------------------------------ context.compaction.completed
@case('comp_event', 'CE03_project_scope_kind')
def _():
    event = compaction_event()
    event['scope_kind'] = 'application'
    event['project_id'] = None
    return ds.compaction_event_errors(event)


@case('comp_event', 'CE15_producer_jcs')
def _():
    event = compaction_event()
    event['producer_sequence_id'] = JCS_EDGE
    return ds.compaction_event_errors(event)


@case('comp_history', 'CH03_deleted_bool')
def _():
    return ds.compaction_history(compaction_event(), verified=True, withdrawn=False, deleted='false', live_revision=1)


@case('comp_history', 'CH04_retained_event_valid')
def _():
    event = compaction_event()
    event['payload']['reclaimed_tokens'] += 1
    return ds.compaction_history(event, verified=True, withdrawn=False, deleted=False, live_revision=1)



# ------------------------------------------------------------------ browser.workspace.created v1 checkpoint and oracles
def created_checkpoint():
    fixtures = json.loads((ROOT / created.FIXTURE_PATH).read_text())
    return copy.deepcopy(fixtures['checkpoint_fixture']), copy.deepcopy(fixtures['observation_fixture'])


@case('cr_checkpoint_entry', 'CC03_updated_calendar')
def _():
    cp, _ = created_checkpoint()
    cp['updated_at_utc'] = LEAP
    return created.checkpoint_failures(cp)


@case('cr_checkpoint_entry', 'CC04_withdrawn_grammar')
def _():
    cp, _ = created_checkpoint()
    cp['state'] = 'withdrawn'
    cp['withdrawn_at_utc'] = cp['updated_at_utc'].replace('Z', 'z')
    return created.checkpoint_failures(cp)


@case('cr_checkpoint_entry', 'CC05_withdrawn_calendar')
def _():
    cp, _ = created_checkpoint()
    cp['state'] = 'withdrawn'
    cp['withdrawn_at_utc'] = LEAP
    return created.checkpoint_failures(cp)


@case('cr_checkpoint', 'CC10_storage_uint64')
def _():
    cp, _ = created_checkpoint()
    cp['first_retained_sequence_id'] = UINT64_OVER
    cp['index_through_sequence_id'] = UINT64_OVER
    if cp['source_cursor'] is not None:
        cp['source_cursor']['last_sequence_id'] = UINT64_OVER
    return created.checkpoint_failures(cp)


def created_advance(stored, candidate, observation):
    oracle = created.CheckpointOracle(stored)
    return oracle.advance(candidate, observation)


@case('cr_advance', 'CA03_candidate_not_withdrawn')
def _():
    cp, observation = created_checkpoint()
    cp['state'] = 'withdrawn'
    cp['withdrawn_at_utc'] = cp['updated_at_utc']
    return created_advance(None, cp, observation)


@case('cr_advance', 'CA27_partition_unchanged')
def _():
    stored, observation = created_checkpoint()
    candidate = copy.deepcopy(stored)
    candidate['project_id'] = 'project-other'
    candidate['scope_partition'] = created.scope_partition('project-other')
    observation['resolved_checkpoint_fields'] = {k: copy.deepcopy(candidate[k]) for k in observation['resolved_checkpoint_fields']}
    observation['prior_checkpoint_sha256'] = created.digest(stored)
    return created_advance(stored, candidate, observation)


@case('cr_disclose', 'DI01_checkpoint_present')
def _():
    return created.CheckpointOracle(None).disclose('0' * 64, current_token=True, access_allowed=True, deletion_allows_audit=True)


def created_history(event, subject=None, **flags):
    body, _ = route.resolved_body(event, historical=True)
    if subject is None:
        subject = {k: body['context'][k] for k in created.SUBJECT}
    values = dict(source_verified=True, access_allowed=True, deletion_allows_audit=True, checkpoint_read_token_valid=True)
    values.update(flags)
    return created.workspace_history_fact(event, subject, **values)


@case('cr_history', 'HF05_subject_object')
def _():
    return created_history(created_base()['event'], subject='subject')


@case('cr_history', 'HF07_subject_values')
def _():
    event = created_base()['event']
    body, _ = route.resolved_body(event, historical=True)
    subject = {k: body['context'][k] for k in created.SUBJECT}
    subject['home_server_id'] = ''
    return created_history(event, subject=subject)


@case('cr_history', 'HF09_event_type')
def _():
    event = reset_base()['event']
    body, _ = route.resolved_body(event, historical=True)
    subject = {k: body['context'][k] for k in created.SUBJECT}
    return created_history(event, subject=subject)


@case('cr_create', 'CO02A_producer_jcs')
def _():
    base = created_base()
    base['event']['producer_sequence_id'] = JCS_EDGE
    gate = browser()[0]
    oracle = created.CreationOracle(gate.envelope_oracle().event_producer_semantic_digest)
    return oracle.create(**base, append_outcome='committed', admitted=True)


def created_binding_case(field, value):
    def edit(registry):
        family = next(f for f in registry['families'] if f['family_id'] == created.CHECKPOINT_FAMILY)
        family[field] = value(family[field])
    root = mirror_root((changed_json('Plans/storage_value_registry.json', edit),))
    gate = browser()[0]
    row = next(r for r in gate.load_json('Plans/browser_event_admission.json')['rows'] if r['event_type'] == created.EVENT_TYPE)
    return created.binding_failures(row, root=root)


for _row, _field, _value in (
        ('BF12_value_schema', 'value_schema', lambda v: {**v, 'description': 'changed value schema'}),
        ('BF13_value_schema_ref', 'value_schema_ref', lambda v: v + '-other'),
        ('BF14_value_schema_id', 'value_schema_id', lambda v: v + '.other'),
        ('BF15_schema_version', 'schema_version', lambda v: '2.0.1'),
        ('BF17_producer', 'producer', lambda v: ['storage.other_projector@2.0.0']),
        ('BF18_consumers', 'consumers', lambda v: ['browser.other_consumer@2.0.0']),
        ('BF19_owner_doc', 'owner_doc', lambda v: 'Plans/storage-plan.md#SP-999'),
        ('BF20_retention_policy', 'retention_policy_ref', lambda v: 'RP-OTHER')):
    case('cr_binding_family_joins', _row)(lambda f=_field, v=_value: created_binding_case(f, v))


# ------------------------------------------------------------------ browser.workspace.created v2 checkpoint
def v2_values():
    return v2.fixture_values()


def v2_token(index):
    generation = index['current_generation_id']
    node = index['generations'][generation]
    frontier = node['frontier']
    key = 'event_record_index_checkpoint.v1:' + index['storage_instance_id']
    return {'storage_instance_id': index['storage_instance_id'], 'checkpoint_key': key,
            'checkpoint_ref': key + '#/generations/' + generation, 'generation_id': generation,
            'generation_anchor_sha256': v2.binding_digest(node['anchor']),
            'frontier_revision': frontier['publication_revision'], 'frontier_sha256': v2.binding_digest(frontier),
            'index_dataset_name': node['index_dataset_name'], 'source_selection': copy.deepcopy(frontier['source_selection'])}


def v2_initial(mutate):
    checkpoint, index, observation, _ = v2_values()
    mutate(checkpoint, index, observation)
    return v2.advance_failures(None, checkpoint, index, observation)


def v2_refresh(mutate):
    before, index, observation, _ = v2_values()
    after = copy.deepcopy(before)
    after['updated_at_utc'] = '2026-09-25T13:00:00Z' if before['updated_at_utc'] < '2026-09-25T13:00:00Z' else before['updated_at_utc']
    observation['prior_checkpoint'] = copy.deepcopy(before)
    mutate(before, after, index, observation)
    return v2.advance_failures(before, after, index, observation)


@case('v2_core_relations', 'V2R05_cursor_offsets')
def _():
    def mutate(c, i, o):
        c['source_cursor']['byte_offset'] = c['source_cursor']['frame_end_offset']
    return v2_initial(mutate)


@case('v2_core_times', 'V2R07_withdrawn_grammar')
def _():
    def mutate(c, i, o):
        c['state'] = 'withdrawn'
        c['withdrawn_at_utc'] = c['updated_at_utc'].replace('Z', 'z')
    return v2_initial(mutate)


@case('v2_core_times', 'V2R10_withdrawn_calendar')
def _():
    def mutate(c, i, o):
        c['state'] = 'withdrawn'
        c['withdrawn_at_utc'] = LEAP
    return v2_initial(mutate)


@case('v2_core_times', 'V2R11_published_calendar')
def _():
    def mutate(c, i, o):
        c['published_at_utc'] = LEAP
    return v2_initial(mutate)


for _row, _flag in (('V2G10_coordinator_admitted', 'coordinator_admitted'), ('V2G11_complete_rebuild_verified', 'complete_rebuild_verified')):
    case('v2_gen_admission', _row)(lambda flag=_flag: v2_initial(lambda c, i, o: o.update({flag: False})))


@case('v2_gen_tx_join', 'V2G04_tx_after')
def _():
    def mutate(c, i, o):
        o['generation_transaction']['after']['hold_refs'] = ['hold:other']
    return v2_initial(mutate)


@case('v2_gen_tx_join', 'V2G07_tx_committed_at')
def _():
    def mutate(c, i, o):
        o['generation_transaction']['committed_at_utc'] = '2026-09-30T00:00:00Z'
    return v2_initial(mutate)


@case('v2_gen_tx_join', 'V2G08_prior_checkpoint')
def _():
    def mutate(c, i, o):
        o['prior_checkpoint'] = copy.deepcopy(c)
    return v2_initial(mutate)


for _row, _field in (('V2A08_custody_published_at_utc', 'published_at_utc'),):
    def _published(before, after, index, observation):
        after['published_at_utc'] = after['updated_at_utc']
    case('v2_advance', _row)(lambda m=_published: v2_refresh(m))


@case('v2_advance', 'V2A04_custody_storage_instance_id')
def _():
    def mutate(before, after, index, observation):
        other = '22222222-2222-4222-8222-222222222222'
        index['storage_instance_id'] = other
        index['generations'][index['current_generation_id']]['frontier']['source_selection']['storage_instance_id'] = other
        after['storage_instance_id'] = other
        after['index_read_token'] = v2_token(index)
        observation['source_selection'] = copy.deepcopy(after['index_read_token']['source_selection'])
    return v2_refresh(mutate)


@case('v2_advance', 'V2A05_custody_project_id')
def _():
    def mutate(before, after, index, observation):
        after['project_id'] = 'project-other'
        after['scope_partition'] = created.scope_partition('project-other')
        observation['project_id'] = 'project-other'
    return v2_refresh(mutate)


@case('v2_source', 'V2S15_cursor')
def _():
    def mutate(c, i, o):
        c['source_cursor']['byte_offset'] = c['source_cursor']['byte_offset'] - 1
        o['generation_transaction']['after'] = copy.deepcopy(c)
    return v2_initial(mutate)


@case('v2_source', 'V2S14_through')
def _():
    def mutate(c, i, o):
        coverage = i['generations'][i['current_generation_id']]['frontier']['coverage']
        coverage['through_sequence_id'] = coverage['through_sequence_id'] + 1
        c['index_read_token'] = v2_token(i)
        o['generation_transaction']['after'] = copy.deepcopy(c)
    return v2_initial(mutate)


@case('v2_token_entry', 'TK03_observation_object')
def _():
    checkpoint, index, observation, _ = v2_values()
    token = {**checkpoint['index_read_token'], 'redb_snapshot_id': observation['redb_snapshot_id']}
    return v2.index_token_failures(token, index, 'observation')


def staged_values():
    checkpoint, index, observation, _ = v2.fixture_values(generic_case='staged_before_CURRENT')
    staged = next(k for k, g in index['generations'].items() if g['state'] == 'staged')
    token = {**checkpoint['index_read_token'], 'redb_snapshot_id': observation['redb_snapshot_id']}
    return token, index, observation, staged


@case('v2_token_entry', 'TK06_node_current')
def _():
    token, index, observation, staged = staged_values()
    index['current_generation_id'] = staged
    return v2.index_token_failures(token, index, observation)


@case('v2_token_entry', 'TK07_node_identity')
def _():
    token, index, observation, staged = staged_values()
    index['generations'][index['current_generation_id']]['generation_id'] = staged
    return v2.index_token_failures(token, index, observation)


@case('v2_token_entry', 'TK08_one_current')
def _():
    token, index, observation, staged = staged_values()
    current = copy.deepcopy(index['generations'][index['current_generation_id']])
    current['generation_id'] = staged
    current['index_dataset_name'] = 'event_record_index.v2@' + staged
    index['generations'][staged] = current
    return v2.index_token_failures(token, index, observation)


@case('v2_token_joins', 'TK19_redb_snapshot_id')
def _():
    checkpoint, index, observation, _ = v2_values()
    token = {**checkpoint['index_read_token'], 'redb_snapshot_id': observation['redb_snapshot_id'] + '-other'}
    return v2.index_token_failures(token, index, observation)


@case('v2_token_joins', 'TK13_generation_id')
def _():
    token, index, observation, staged = staged_values()
    token['generation_id'] = staged
    return v2.index_token_failures(token, index, observation)


@case('v2_token_joins', 'TK10_storage_instance_id')
def _():
    checkpoint, index, observation, _ = v2_values()
    token = {**checkpoint['index_read_token'], 'redb_snapshot_id': observation['redb_snapshot_id']}
    token['storage_instance_id'] = '22222222-2222-4222-8222-222222222222'
    return v2.index_token_failures(token, index, observation)


@case('v2_token_joins', 'TK20_node_dataset')
def _():
    token, index, observation, staged = staged_values()
    index['generations'][index['current_generation_id']]['index_dataset_name'] = 'event_record_index.v2@' + staged
    return v2.index_token_failures(token, index, observation)


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--only')
    args = parser.parse_args()
    report = check(args.only)
    print(json.dumps({k: v for k, v in report.items() if k != 'cases'}, indent=1))
    for row in report['cases']:
        if not row['ok']:
            print('FAIL', row['id'], row.get('target_observations'), row.get('exception', ''))
    return 0 if report['status'] == 'pass' else 1


def cases():
    """(id, zero-argument call that runs the complete checker on the witness)."""
    return [(ident, fn) for ident, _, _, fn in CASES]


def check(only=None):
    rows = []
    for ident, phase, row, fn in CASES:
        if only and only not in ident:
            continue
        T.RECORDER = []
        result = {'id': ident, 'phase': phase, 'row': row}
        try:
            fn()
        except Exception as exc:  # a witness that raises proves nothing
            result['exception'] = repr(exc)[:300]
        records = T.RECORDER
        T.RECORDER = None
        target = [refusing for p, _, refusing in records if p == phase and refusing]
        result['target_observations'] = target[:4]
        result['ok'] = 'exception' not in result and [row] in target
        rows.append(result)
    return {'schema_id': 'pm.ds.p2a_witness_check.v1', 'status': 'pass' if all(r['ok'] for r in rows) else 'fail',
            'witnesses': len(rows), 'passing': sum(r['ok'] for r in rows), 'cases': rows}


if __name__ == '__main__':
    sys.exit(main())
