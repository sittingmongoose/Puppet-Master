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
import atexit
import base64
import copy
import json
import shutil
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
    """A temporary repository root: the real Plans schema files and fixtures the checkers read, with the changed JSON files.

    ``changes`` is a tuple of (relative path, JSON text). Every other file is a symlink to the
    real file; the root is removed when the process exits.
    """
    tmp = Path(tempfile.mkdtemp(prefix='ds-p2a-root-'))
    atexit.register(shutil.rmtree, tmp, True)
    plans = ROOT / 'Plans'
    wanted = {path for path in plans.rglob('*.schema.json')}
    wanted |= {ROOT / rel for rel, _ in changes}
    wanted |= {ROOT / h.FIXTURES, ROOT / 'Plans/storage_value_registry.json', ROOT / created.V2_SCHEMA_PATH}
    for path in wanted:
        target = tmp / path.relative_to(ROOT)
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
        # A coherent revision edge whose new revision the CV-333 JCS route cannot represent.
        prior, new = JCS_EDGE - 1, JCS_EDGE
        r['binding']['expected_layout_revision'] = prior
        r['prior_layout_revision'] = r['owner_result']['prior_layout_revision'] = prior
        r['new_layout_revision'] = r['owner_result']['new_layout_revision'] = new
        r['readback']['layout_revision'] = new
        r['event_semantics']['payload']['prior_layout_revision'] = prior
        r['event_semantics']['payload']['new_layout_revision'] = new
        r['event_semantics']['producer_sequence_id'] = new
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



# ------------------------------------------------------------------ v2 history, generations and cleanup
T_OLD = '2026-09-11T19:00:00Z'
T_LATER = '2026-09-11T21:00:00Z'


def withdrawn_core(checkpoint, publication, at):
    core = {k: copy.deepcopy(v) for k, v in checkpoint.items() if k != 'retired_generations'}
    core.update(state='withdrawn', publication_id=publication, published_at_utc=at, updated_at_utc=at, withdrawn_at_utc=at)
    return core


def v1_entry(legacy, successor, custody=T_OLD):
    finalized = copy.deepcopy(legacy)
    finalized.update(state='withdrawn', withdrawn_at_utc=custody, updated_at_utc=custody)
    return {'identity_origin': 'v1_custody_bound_at_handoff', 'publication_id': 'publication:created-v1-custody',
            'custody_bound_at_utc': custody, 'retired_at_utc': custody, 'successor_publication_id': successor,
            'hold_refs': [], 'legacy_checkpoint': finalized}


@case('v2_history_entry', 'V2K06_publication_unique')
def _():
    c, _, _, _ = v2_values()
    first = {'checkpoint_core': withdrawn_core(c, 'publication:created-old', '2026-09-11T18:00:00Z'), 'successor_publication_id': 'publication:created-mid'}
    second = {'checkpoint_core': withdrawn_core(c, 'publication:created-old', T_OLD), 'successor_publication_id': c['publication_id']}
    c['retired_generations'] = [first, second]
    return v2.checkpoint_failures(c)


@case('v2_history_entry', 'V2K07_publication_not_successor')
def _():
    c, _, _, _ = v2_values()
    c['retired_generations'] = [{'checkpoint_core': withdrawn_core(c, 'publication:created-old', T_OLD),
                                 'successor_publication_id': 'publication:created-old'}]
    return v2.checkpoint_failures(c)


@case('v2_history_entry', 'V2K09_withdrawal_before_successor')
def _():
    c, _, _, _ = v2_values()
    core = withdrawn_core(c, 'publication:created-old', T_OLD)
    core.update(updated_at_utc=T_LATER, withdrawn_at_utc=T_LATER)
    c['retired_generations'] = [{'checkpoint_core': core, 'successor_publication_id': c['publication_id']}]
    return v2.checkpoint_failures(c)


def v2_generation(before, after, index, observation, replacement=True):
    tx = observation['generation_transaction']
    tx.update(before=copy.deepcopy(before), after=copy.deepcopy(after), checkpoint_key=v2.key(after),
              selected_publication_id=after['publication_id'], committed_at_utc=after['published_at_utc'])
    observation['prior_checkpoint'] = copy.deepcopy(before)
    return v2.advance_failures(before, after, index, observation, replacement=replacement)


def v2_successor(c, publication='publication:created-2', at=T_LATER):
    after = copy.deepcopy(c)
    after.update(publication_id=publication, published_at_utc=at, updated_at_utc=at)
    return after


@case('v2_gen_replacement', 'V2G18_replacement_scope')
def _():
    c, index, observation, _ = v2_values()
    before = copy.deepcopy(c)
    before['storage_instance_id'] = '22222222-2222-4222-8222-222222222222'
    before['index_read_token']['storage_instance_id'] = before['storage_instance_id']
    return v2_generation(before, v2_successor(c), index, observation)


@case('v2_gen_legacy', 'V2G20_v1_custody_present')
def _():
    c, index, observation, legacy = v2_values()
    observation['generation_transaction']['v1_custody'] = None
    return v2_generation(legacy, v2_successor(c), index, observation)


@case('v2_gen_rotation', 'V2G25_rotation_new_publication')
def _():
    c, index, observation, _ = v2_values()
    return v2_generation(c, v2_successor(c, publication=c['publication_id']), index, observation)


def v2_cleanup_parts():
    c, _, _, _ = v2_values()
    core = withdrawn_core(c, 'publication:created-old', T_OLD)
    before = copy.deepcopy(c)
    before['retired_generations'] = [{'checkpoint_core': core, 'successor_publication_id': c['publication_id']}]
    after = copy.deepcopy(c)
    now = '2026-09-19T00:00:00Z'
    tx = {'schema_id': 'pm.browser_workspace_created_checkpoint_cleanup_transaction.v2', 'transaction_ref': 'transaction:created-v2-cleanup',
          'status': 'committed', 'checkpoint_key': v2.key(before), 'before': copy.deepcopy(before), 'after': copy.deepcopy(after),
          'selected_publication_id': 'publication:created-old', 'committed_at_utc': now}
    observation = {'now_utc': now, 'resolved_hold_refs': [], 'active_hold_refs': [], 'resolved_references': [],
                   'all_applicable_holds_enumerated': True, 'hold_ref_fence_current': True, 'cleanup_transaction_resolved': True,
                   'maintenance_authorized': True, 'access_allowed': True, 'deletion_allows_audit': True,
                   'prior_checkpoint': copy.deepcopy(before), 'cleanup_transaction': tx}
    return before, after, observation


@case('v2_cleanup', 'V2CL04_resolved_holds_list')
def _():
    before, after, observation = v2_cleanup_parts()
    observation['resolved_hold_refs'] = 'hold-refs'
    return v2.cleanup_failures(before, after, 'publication:created-old', observation)


for _row, _key, _value in (('V2CL16_tx_before', 'before', lambda tx: {**tx['before'], 'hold_refs': ['hold:other']}),
                           ('V2CL17_tx_after', 'after', lambda tx: {**tx['after'], 'hold_refs': ['hold:other']}),
                           ('V2CL18_tx_key', 'checkpoint_key', lambda tx: tx['checkpoint_key'] + '-other'),
                           ('V2CL19_tx_publication', 'selected_publication_id', lambda tx: 'publication:created-other')):
    def _cleanup(key=_key, value=_value):
        before, after, observation = v2_cleanup_parts()
        tx = observation['cleanup_transaction']
        tx[key] = value(tx)
        return v2.cleanup_failures(before, after, 'publication:created-old', observation)
    case('v2_cleanup_tx_join', _row)(_cleanup)


@case('comp_payload', 'CP02_commit_time_valid')
def _():
    payload = compaction_event()['payload']
    payload['committed_at_utc'] = LEAP
    return ds.compaction_payload_errors(payload)


# ------------------------------------------------------------------ browser.workspace.reset checkpoint and oracles
def reset_values():
    return reset.fixture_values()


def reset_rotated(c):
    core = withdrawn_core(c, 'publication:reset-old', T_OLD)
    rotated = copy.deepcopy(c)
    rotated['retired_generations'] = [{'checkpoint_core': core, 'successor_publication_id': c['publication_id']}]
    return rotated


@case('rs_core_times', 'RC07_withdrawn_grammar')
def _():
    _, c, _, _ = reset_values()
    c['state'] = 'withdrawn'
    c['withdrawn_at_utc'] = c['updated_at_utc'].replace('Z', 'z')
    return reset.checkpoint_failures(c)


for _row, _field in (('RC09_updated_calendar', 'updated_at_utc'), ('RC10_withdrawn_calendar', 'withdrawn_at_utc'),
                     ('RC11_published_calendar', 'published_at_utc')):
    def _leap(field=_field):
        _, c, _, _ = reset_values()
        if field == 'withdrawn_at_utc':
            c['state'] = 'withdrawn'
        c[field] = LEAP
        return reset.checkpoint_failures(c)
    case('rs_core_times', _row)(_leap)


@case('rs_history_entry', 'RK02_publication_unique')
def _():
    _, c, _, _ = reset_values()
    first = {'checkpoint_core': withdrawn_core(c, 'publication:reset-old', '2026-09-11T18:00:00Z'), 'successor_publication_id': 'publication:reset-mid'}
    second = {'checkpoint_core': withdrawn_core(c, 'publication:reset-old', T_OLD), 'successor_publication_id': c['publication_id']}
    c['retired_generations'] = [first, second]
    return reset.checkpoint_failures(c)


def reset_oracle(base):
    gate = browser()[0]
    t = base['transition']
    return reset.ResetOracle(t['subject'], t['checked_workspace_revision'], t['prior_workspace_generation'],
                             gate.envelope_oracle().event_producer_semantic_digest)


@case('rs_reset', 'RO02A_producer_jcs')
def _():
    base = reset_base()
    base['event']['producer_sequence_id'] = JCS_EDGE
    return reset_oracle(base).reset(**base, append_outcome='committed', admitted=True)


@case('rs_reset', 'RO05_prior_digest')
def _():
    base = reset_base()
    oracle = reset_oracle(base)
    oracle.reset(**copy.deepcopy(base), append_outcome='committed', admitted=True)
    retry = copy.deepcopy(base)
    retry['event']['event_id'] = retry['event']['event_id'] + '-retry'
    retry['event']['correlation_id'] = retry['event']['correlation_id'] + '-retry'
    return oracle.reset(**retry, append_outcome='committed', admitted=True)


@case('rs_resolve_append', 'RX01_pending_entry')
def _():
    base = reset_base()
    return reset_oracle(base).resolve_append(('project~x', reset.EVENT_TYPE, 'missing'), '0' * 64, 'committed')


@case('rs_token_entry', 'RT03_observation_object')
def _():
    _, c, index, _ = reset_values()
    return reset.index_token_failures(c['index_read_token'], index, 'observation')


def reset_advance(stored, candidate, index, observation, replace=False):
    oracle = reset.CheckpointOracle(stored)
    call = oracle.replace if replace else oracle.advance
    return call(candidate, index, observation, admitted=True)


@case('rs_advance', 'RV03_stored_valid')
def _():
    _, c, index, observation = reset_values()
    stored = copy.deepcopy(c)
    stored['scope_partition'] = reset.scope_partition('project-other')
    return reset_advance(stored, c, index, observation)


@case('rs_advance', 'RV04_candidate_not_withdrawn')
def _():
    _, c, index, observation = reset_values()
    c['state'] = 'withdrawn'
    c['withdrawn_at_utc'] = c['updated_at_utc']
    return reset_advance(None, c, index, observation)


def reset_token(index):
    generation = index['current_generation_id']
    node = index['generations'][generation]
    frontier = node['frontier']
    key = 'event_record_index_checkpoint.v1:' + index['storage_instance_id']
    return {'storage_instance_id': index['storage_instance_id'], 'checkpoint_key': key,
            'checkpoint_ref': key + '#/generations/' + generation, 'generation_id': generation,
            'generation_anchor_sha256': reset.digest(node['anchor']), 'frontier_revision': frontier['publication_revision'],
            'frontier_sha256': reset.digest(frontier), 'index_dataset_name': node['index_dataset_name'],
            'source_selection': copy.deepcopy(frontier['source_selection'])}


@case('rs_advance', 'RV22_scope_storage_instance_id')
def _():
    _, c, index, observation = reset_values()
    stored = copy.deepcopy(c)
    other = '22222222-2222-4222-8222-222222222222'
    index['storage_instance_id'] = other
    index['generations'][index['current_generation_id']]['frontier']['source_selection']['storage_instance_id'] = other
    candidate = copy.deepcopy(c)
    candidate['storage_instance_id'] = other
    candidate['index_read_token'] = reset_token(index)
    candidate['updated_at_utc'] = T_LATER
    observation['source_selection'] = copy.deepcopy(candidate['index_read_token']['source_selection'])
    observation['prior_checkpoint'] = copy.deepcopy(stored)
    return reset_advance(stored, candidate, index, observation)


def reset_cleanup(mutate_stored=None, at='2026-09-19T00:00:00Z', stored=True):
    _, c, _, _ = reset_values()
    rotated = reset_rotated(c) if stored else None
    if mutate_stored and rotated is not None:
        mutate_stored(rotated)
    observation = {'prior_checkpoint': copy.deepcopy(rotated), 'maintenance_authorized': True, 'all_applicable_holds_resolved': True,
                   'no_applicable_hold_or_live_ref': True, 'hold_ref_fence_current': True, 'access_allowed': True,
                   'deletion_allows_audit': True}
    return reset.CheckpointOracle(rotated).cleanup('publication:reset-old', at, observation)


@case('rs_cleanup', 'RU01_checkpoint_present')
def _():
    return reset_cleanup(stored=False)


@case('rs_cleanup', 'RU02_checkpoint_valid')
def _():
    return reset_cleanup(lambda c: c.update(scope_partition=reset.scope_partition('project-other')))


@case('rs_cleanup', 'RU11_cleanup_time')
def _():
    return reset_cleanup(at='not-a-time')


@case('rs_cleanup', 'RU12_cleanup_time_zone')
def _():
    return reset_cleanup(at='2026-09-19T00:00:00')


def reset_disclose(checkpoint, index, observation):
    return reset.CheckpointOracle(checkpoint).disclose(index, observation)


@case('rs_disclose', 'RD01_observation_object')
def _():
    _, c, index, _ = reset_values()
    return reset_disclose(c, index, 'observation')


@case('rs_disclose', 'RD02_checkpoint_present')
def _():
    _, _, index, observation = reset_values()
    return reset_disclose(None, index, observation)


@case('rs_disclose', 'RD05_filter_complete')
def _():
    _, c, index, observation = reset_values()
    c['state'] = 'degraded'
    c['health'] = 'degraded'
    c['filter_complete'] = False
    return reset_disclose(c, index, observation)


@case('rs_withdraw', 'RW05_not_before_observation')
def _():
    _, c, _, _ = reset_values()
    c['updated_at_utc'] = T_LATER
    return reset.CheckpointOracle(c).withdraw('2026-09-11T20:30:00Z')


def reset_generation(before, after, observation):
    tx = observation['generation_transaction']
    tx.update(before=copy.deepcopy(before), after=copy.deepcopy(after),
              checkpoint_key=reset.CHECKPOINT_FAMILY + '.v1:' + after['storage_instance_id'] + ':' + after['scope_partition'],
              selected_publication_id=after['publication_id'], committed_at_utc=after['published_at_utc'])
    return reset.generation_admission_failures(before, after, observation)


@case('rs_generation', 'RG03_tx_after')
def _():
    _, c, _, observation = reset_values()
    observation['generation_transaction']['after'] = {**copy.deepcopy(c), 'hold_refs': ['hold:other']}
    return reset.generation_admission_failures(None, c, observation)


@case('rs_generation', 'RG06_tx_committed_at')
def _():
    _, c, _, observation = reset_values()
    observation['generation_transaction']['committed_at_utc'] = T_LATER
    return reset.generation_admission_failures(None, c, observation)


@case('rs_generation', 'RG14_initial_no_history')
def _():
    _, c, _, observation = reset_values()
    return reset_generation(None, reset_rotated(c), observation)


@case('rs_generation', 'RG15_replacement_scope')
def _():
    _, c, _, observation = reset_values()
    before = copy.deepcopy(c)
    before['storage_instance_id'] = '22222222-2222-4222-8222-222222222222'
    before['index_read_token']['storage_instance_id'] = before['storage_instance_id']
    after = copy.deepcopy(c)
    after.update(publication_id='publication:reset-2', published_at_utc=T_LATER, updated_at_utc=T_LATER)
    return reset_generation(before, after, observation)


@case('rs_generation', 'RG16_replacement_publication')
def _():
    _, c, _, observation = reset_values()
    after = copy.deepcopy(c)
    after.update(published_at_utc=T_LATER, updated_at_utc=T_LATER)
    return reset_generation(copy.deepcopy(c), after, observation)


# ------------------------------------------------------------------ creation preflight (resolved-value joins)
def created_preflight(mutate):
    base = created_base()
    mutate(base, base['event']['payload']['context'], base['request']['scope'], base['result']['scope'], base['witness'])
    return created.creation_preflight_failures(**base)


def other(value):
    return value + '-other'


CREATED_PREFLIGHT = {
    'CR02_payload_event_type': lambda b, c, rs, xs, w: b['event']['payload'].update(event_type='browser.workspace.reset'),
    'CR05_subject_present': lambda b, c, rs, xs, w: (c.update(browser_workspace_id=None), xs.pop('browser_workspace_id', None),
                                                     w.update(workspace_id=None)),
    'CR07_request_command': lambda b, c, rs, xs, w: rs.update(command_id='cmd.browser.workspace.close', browser_workspace_id=c['browser_workspace_id'],
                                                              expected_workspace_revision=1, controller_authority=copy.deepcopy(reset_base()['request']['scope']['controller_authority'])),
    'CR08_result_command': lambda b, c, rs, xs, w: xs.update(command_id='cmd.browser.workspace.close', browser_workspace_id=c['browser_workspace_id'],
                                                             expected_workspace_revision=1, controller_authority=copy.deepcopy(reset_base()['request']['scope']['controller_authority'])),
    'CR09_request_lineage': lambda b, c, rs, xs, w: rs['lineage'].update(execution_host_id='host-other'),
    'CR10_result_lineage': lambda b, c, rs, xs, w: xs['lineage'].update(execution_host_id='host-other'),
    'CR11_request_session': lambda b, c, rs, xs, w: rs.update(browser_session_id='session-other'),
    'CR13_result_session': lambda b, c, rs, xs, w: xs.update(browser_session_id='session-other'),
    'CR19_result_instance': lambda b, c, rs, xs, w: b['request'].update(command_instance_id=other(b['request']['command_instance_id'])),
    'CR20_witness_instance': lambda b, c, rs, xs, w: w.update(command_instance_id=other(w['command_instance_id'])),
    'CR21_event_idempotency': lambda b, c, rs, xs, w: b['event'].update(idempotency_key=other(b['event']['idempotency_key'])),
    'CR22_witness_idempotency': lambda b, c, rs, xs, w: w.update(idempotency_key=other(w['idempotency_key'])),
    'CR26_transition_receipt_ref': lambda b, c, rs, xs, w: b['event']['payload'].update(transition_receipt_ref=other(b['event']['payload']['transition_receipt_ref'])),
    'CR27_dispatch_receipt_ref': lambda b, c, rs, xs, w: b['result'].update(dispatch_receipt_ref=other(b['result']['dispatch_receipt_ref'])),
    'CR28_request_permission_ref': lambda b, c, rs, xs, w: b['request'].update(permission_snapshot_ref=other(b['request']['permission_snapshot_ref'])),
    'CR34_workspace_ref_present': lambda b, c, rs, xs, w: w.update(workspace_ref=''),
    'CR36_witness_workspace_id': lambda b, c, rs, xs, w: w.update(workspace_id='workspace-other'),
    'CR37_witness_generation_type': lambda b, c, rs, xs, w: w.update(workspace_generation=float(w['workspace_generation'])),
}
for _row, _mutate in CREATED_PREFLIGHT.items():
    case('cr_preflight', _row)(lambda m=_mutate: created_preflight(m))


@case('cr_preflight_scope', 'CR17_request_result_scope')
def _():
    return created_preflight(lambda b, c, rs, xs, w: xs.update(workspace_policy_ref=other(xs['workspace_policy_ref'])))


# ------------------------------------------------------------------ reset preflight (resolved-value joins)
def reset_preflight(mutate):
    base = reset_base()
    mutate(base, base['event']['payload'], base['request']['scope'], base['result']['scope'], base['transition'])
    return reset.reset_preflight_failures(**base)


RESET_PREFLIGHT = {
    'RP02_request_command': lambda b, p, rs, xs, t: rs.update(command_id='cmd.browser.workspace.close'),
    'RP03_result_command': lambda b, p, rs, xs, t: xs.update(command_id='cmd.browser.workspace.close'),
    'RP04_request_lineage': lambda b, p, rs, xs, t: rs['lineage'].update(execution_host_id='host-other'),
    'RP05_result_lineage': lambda b, p, rs, xs, t: xs['lineage'].update(execution_host_id='host-other'),
    'RP06_request_subject': lambda b, p, rs, xs, t: rs.update(browser_session_id='session-other'),
    'RP07_result_subject': lambda b, p, rs, xs, t: xs.update(browser_session_id='session-other'),
    'RP08_request_optional_subject': lambda b, p, rs, xs, t: rs.update(browser_page_id='page-other'),
    'RP09_result_optional_subject': lambda b, p, rs, xs, t: xs.update(browser_page_id='page-other'),
    'RP14_result_instance': lambda b, p, rs, xs, t: b['request'].update(command_instance_id=other(b['request']['command_instance_id'])),
    'RP15_transition_instance': lambda b, p, rs, xs, t: t.update(command_instance_id=other(t['command_instance_id'])),
    'RP16_event_idempotency': lambda b, p, rs, xs, t: b['request'].update(idempotency_key=other(b['request']['idempotency_key'])),
    'RP27_transition_receipt_ref': lambda b, p, rs, xs, t: p.update(transition_receipt_ref=other(p['transition_receipt_ref'])),
    'RP28_permission_snapshot_ref': lambda b, p, rs, xs, t: p.update(permission_snapshot_ref=other(p['permission_snapshot_ref'])),
}
for _row, _mutate in RESET_PREFLIGHT.items():
    case('rs_preflight', _row)(lambda m=_mutate: reset_preflight(m))


@case('rs_preflight_scope', 'RP10_request_result_scope')
def _():
    return reset_preflight(lambda b, p, rs, xs, t: xs.update(expected_workspace_revision=xs['expected_workspace_revision'] + 1))


# ------------------------------------------------------------------ shared Browser admission routes
@lru_cache(maxsize=1)
def admission():
    gate, context, _, _ = browser()
    fixtures = gate.load_json('Plans/browser_event_admission_fixtures.json')
    rows = {r['event_type']: r for r in gate.load_json('Plans/browser_event_admission.json')['rows']}
    return gate, context, {c['event_type']: c for c in fixtures['valid']}, rows


def semantic_case(event_type, mutate):
    gate, context, cases, rows = admission()
    event = gate.fixture_event(copy.deepcopy(cases[event_type]), 7)
    payload = event['payload']
    mutate(payload['context'], payload['facts'])
    return gate.candidate_failures(event, rows[event_type]['producer_component'], context)


GATE_SEMANTIC = {
    'GS02_session_workspace_paired': ('browser.script.compile_started', lambda c, f: c.update(browser_session_id='browser-session-x', browser_workspace_id=None)),
    'GS03_page_generation_paired': ('browser.workspace.closed', lambda c, f: c.update(page_generation=1)),
    'GS04_page_has_workspace': ('browser.script.compile_started', lambda c, f: c.update(browser_page_id='browser-page-x', page_generation=1, browser_workspace_id=None, browser_session_id=None)),
    'GS05_prior_page_generation_present': ('browser.navigation.generation_changed', lambda c, f: f.update(prior_page_generation=None)),
    'GS10_page_generation_not_regressed': ('browser.page.activated', lambda c, f: f.update(prior_page_generation=c['page_generation'] + 1)),
    'GS13_coverage_bounds': ('browser.representation.captured', lambda c, f: f['coverage'].update(status='partial', frames_covered=f['coverage']['frames_total'] + 1)),
    'GS14_complete_frames': ('browser.representation.captured', lambda c, f: f['coverage'].update(status='complete', frames_covered=max(0, f['coverage']['frames_total'] - 1))),
    'GS16_complete_budget': ('browser.representation.captured', lambda c, f: f['coverage'].update(status='complete', budget_exhausted=True)),
    'GS17_complete_no_collisions': ('browser.representation.captured', lambda c, f: f['coverage'].update(status='complete', synthetic_id_collisions=1)),
    'GS19_lease_generation_not_regressed': ('browser.controller_lease.granted', lambda c, f: f['new_fence'].update(lease_generation=f['old_fence']['lease_generation'] - 1)),
    'GS20_lease_epoch_not_regressed': ('browser.controller_lease.granted', lambda c, f: f['new_fence'].update(lease_epoch=f['old_fence']['lease_epoch'] - 1)),
    'GS21_last_sequence_not_regressed': ('browser.controller_lease.granted', lambda c, f: f['new_fence'].update(last_sequence=f['old_fence']['last_sequence'] - 1)),
    'GS22_new_fence_page_generation': ('browser.controller_lease.granted', lambda c, f: f['new_fence'].update(page_generation=c['page_generation'] + 1)),
    'GS23_old_fence_page_generation': ('browser.controller_lease.granted', lambda c, f: f['old_fence'].update(page_generation=c['page_generation'] + 1)),
    'GS26_takeover_holder_changes': ('browser.controller_lease.takeover_completed', lambda c, f: f['new_fence'].update(holder_id=f['old_fence']['holder_id'])),
    'GS27_takeover_request_identity': ('browser.controller_lease.takeover_requested', lambda c, f: f['new_fence'].update(holder_id=f['new_fence']['holder_id'] + '-other')),
    'GS30_no_action_overlap': ('browser.program.started', lambda c, f: f.update(completed_action_ids=list(f['completed_action_ids']) + ['action:overlap'], unknown_effect_action_ids=list(f['unknown_effect_action_ids']) + ['action:overlap'])),
    'GS31_unknown_state_no_retry': ('browser.program.started', lambda c, f: f.update(effect_state='effect_unknown', retry_allowed=True)),
    'GS32_unknown_actions_no_retry': ('browser.program.started', lambda c, f: f.update(unknown_effect_action_ids=['action:unknown'], retry_allowed=True)),
    'GS33_no_effect_no_unknown': ('browser.program.started', lambda c, f: f.update(effect_state='no_effect', unknown_effect_action_ids=['action:unknown'], completed_action_ids=[])),
    'GS35_failed_no_effect_state': ('browser.program.failed', lambda c, f: f.update(terminal_state='failed_no_effect', effect_state='effects_reconciled')),
    'GS36_timed_out_unknown_state': ('browser.program.segment.timed_out', lambda c, f: f.update(terminal_state='timed_out_effect_state_unknown', effect_state='no_effect', unknown_effect_action_ids=[], completed_action_ids=[])),
    'GS38_terminal_known_state': ('browser.program.completed', lambda c, f: f.update(effect_state='effect_unknown', unknown_effect_action_ids=[])),
    'GS18_invalidation_matches': ('browser.representation.invalidated', lambda c, f: f['coverage'].update(status='partial')),
}
for _row, (_type, _mutate) in GATE_SEMANTIC.items():
    case('gate_semantic', _row)(lambda t=_type, m=_mutate: semantic_case(t, m))


def central_case(mutate):
    gate, context, _, rows = admission()
    base = created_base()
    family = copy.deepcopy(next(f for f in gate.load_json('Plans/event_family_registry.json')['families'] if f['event_type'] == created.EVENT_TYPE))
    mutate(family)
    return gate.event_failures(base['event'], rows[created.EVENT_TYPE]['producer_component'], browser()[1],
                               families={created.EVENT_TYPE: family})


GATE_CENTRAL = {
    'GB02_family_schema': lambda f: f.update(unexpected_member=True),
    'GB03_event_type': lambda f: f.update(event_type='browser.workspace.reset'),
    'GB06_payload_schema_ref': lambda f: f.update(payload_schema_ref={**f['payload_schema_ref'], 'json_pointer': '#/$defs/workspace_reset'}),
    'GB07_retention_policy_ref': lambda f: f.update(retention_policy_ref={**f['retention_policy_ref'], 'policy_id': 'RP-AUTHORITY-OTHER'}),
    'GB13_no_aliases': lambda f: f['legacy'].update(aliases=[{'alias_event_type': 'browser.workspace.legacy_created', 'canonical_event_type': created.EVENT_TYPE}]),
    'GB14_no_extensions': lambda f: f['legacy'].update(admitted_extensions=['legacy_extension']),
    'GB16_redaction': lambda f: f['legacy'].update(redaction={'mode': 'versioned_transform', 'transform_id': 'transform:x', 'transform_version': '1.0.0'}),
    'GB17_identity_pointers': lambda f: f['legacy']['identity_json_pointers'].update(project_id=['/payload/project_id']),
}
for _row, _mutate in GATE_CENTRAL.items():
    case('gate_central', _row)(lambda m=_mutate: central_case(m))


@case('gate_event', 'GE01_event_object')
def _():
    gate, context, _, rows = admission()
    return gate.event_failures('event', rows[created.EVENT_TYPE]['producer_component'], context)


@case('gate_candidate_envelope', 'GC04A_sequence_uint64')
def _():
    gate, context, _, rows = admission()
    event = created_base()['event']
    event['sequence_id'] = UINT64_OVER
    return gate.candidate_failures(event, rows[created.EVENT_TYPE]['producer_component'], context)


@case('gate_replay', 'GR05A_producer_jcs')
def _():
    gate, context, _, _ = admission()
    event = created_base()['event']
    event['schema_version'] = '2.0.0'
    event['producer_sequence_id'] = JCS_EDGE
    return gate.ReplayOracle().consume(event, 'BrowserRuntimeService.workspace', context)


def compatibility_case(mutate_original):
    gate, context, _, _ = admission()
    base = created_base()
    retained = copy.deepcopy(base['event'])
    retained['schema_version'] = '2.0.0'
    value, original = d3.normalized({'event': retained})
    value['replay_policy'] = 'projector_replay_only'
    original = copy.deepcopy(original)
    mutate_original(original)
    return gate.candidate_failures(value, 'BrowserRuntimeService.workspace', context, historical=True, historical_source=original)


@case('gate_compatibility', 'GH02_source_normalizes')
def _():
    return compatibility_case(lambda o: o['source'].update(bytes_hex='zz'))


@case('gate_compatibility', 'GH03_no_rejection_reason')
def _():
    return compatibility_case(lambda o: o['legacy_envelope'].update(type='browser.workspace.unknown'))


@case('cr_binding_disposition', 'BF11_family_disposition')
def _():
    return created_binding_case('tier', lambda v: v + '_other')


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
        first, target = set(), []
        for p, _, refusing, call in records:
            if refusing and call not in first:
                first.add(call)
                if p == phase:
                    target.append(refusing)
        result['target_observations'] = target[:4]
        result['ok'] = 'exception' not in result and [row] in target
        rows.append(result)
    return {'schema_id': 'pm.ds.p2a_witness_check.v1', 'status': 'pass' if all(r['ok'] for r in rows) else 'fail',
            'witnesses': len(rows), 'passing': sum(r['ok'] for r in rows), 'cases': rows}


if __name__ == '__main__':
    sys.exit(main())
