#!/usr/bin/env python3
"""Build (or --check) the W3C phase-2 fixtures: Plans/w3c_event_fixtures.json and Plans/w3c_original_custody.json.

Positives are complete scenarios per family, scope edition and path variant. Every negative starts from a named
positive and injects exactly one defect at the stage that owns the value (scripts/pm_w3c_cases_lib.py), so every
later copy, hash, key and commitment follows it; it is stored as its base plus the exact JSON changes. Its expected
row is written here by hand, per witness; nothing is taken from a checker verdict. ``--coverage`` writes every
oracle-plan entry with the rows that implement it and their witnesses.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pm_w3c_cases_lib as L  # noqa: E402
from pm_w3c_families import CLAUSES, FAMILIES  # noqa: E402
from pm_w3c_event_oracles import ROW_BY_ID, ROWS  # noqa: E402  (declared row codes only; no verdict)

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / 'Plans/w3c_event_fixtures.json'
CUSTODY = ROOT / 'Plans/w3c_original_custody.json'
COVERAGE = ROOT / 'reports/event-authority-20261105/W3C-phase2-plan-coverage.json'
CONTRACTS = 'Plans/w3c_test_capture_event_contracts.schema.json'
RECORDS = 'Plans/test_capture_application_records.schema.json'
OTHER_UUID = '6c3e2a10-ffff-4c7d-9a1b-0000000000ff'
BAD_TIMES = (('no_zone', '2026-11-05T10:00:00'), ('space_separator', '2026-11-05 10:00:00Z'), ('feb_30', '2026-02-30T10:00:00Z'),
             ('hour_24', '2026-11-05T24:00:00Z'), ('trailing_lf', '2026-11-05T10:00:00Z\n'), ('false_leap_second', '2026-11-05T10:00:60Z'),
             ('empty_fraction', '2026-11-05T10:00:00.Z'))
GOOD_EVENT_TIMES = (('lowercase_t_z', '2026-11-05t10:00:00z'), ('offset', '2026-11-05T12:00:00+02:00'),
                    ('leap_second', '2016-12-31T23:59:60Z'), ('fraction_12', '2026-11-05T10:00:00.123456789012Z'))
VARIANTS = {
    'append': ('append', 'append-ack-offset', 'append-ack-lowerz'),
    'retry': ('retry-pending', 'retry-bound', 'retry-committed', 'retry-terminal', 'retry-storage-differs'),
    'history': ('history', 'history-live-change', 'history-compat'),
    'operation': ('op-first', 'op-first-external', 'op-bind', 'op-bind-recovery', 'op-commit', 'op-commit-external', 'op-commit-restore',
                  'op-terminal', 'op-withdraw-pending', 'op-withdraw-outcome', 'op-withdraw-event'),
    'checkpoint': ('ck-empty', 'ck-inline', 'ck-external', 'ck-advance', 'ck-retired'),
}
PATH_OF = {v: p for p, vs in VARIANTS.items() for v in vs}
PATH_OF['append-sp337'] = 'append'


def path_of(variant):
    return PATH_OF[variant.split('+')[0]]


def editions():
    for fam, spec in FAMILIES.items():
        for scope in spec[5]:
            yield fam, scope


def manifest():
    rec = json.loads(CUSTODY.read_text())['recipes']['w3c@1']
    names = sorted(rec['resources'])
    return hashlib.sha256(json.dumps({n: hashlib.sha256((ROOT / n).read_bytes()).hexdigest() for n in names}, sort_keys=True,
                                     separators=(',', ':')).encode('ascii')).hexdigest()


def abbr(fam):
    return FAMILIES[fam][0]


def pred(fam):
    return FAMILIES[fam][6]


def contracts():
    return json.loads((ROOT / CONTRACTS).read_text())


# ---------------------------------------------------------------------------------------------
# Witness specification: (row, variant, edits, filter). filter: 'abbr' (families), 'scope', 'expect' {scope: row}
# ---------------------------------------------------------------------------------------------
def set_pack(site_ref, mutate):
    """A whole-scenario edit on one pack (and the reference to it): mutate(pack, ref) -> (new_ref, new_pack)."""
    def edit(sc, stash):
        ref = site_ref(sc)
        new_ref, new_pack = mutate(copy.deepcopy(sc['packs'][ref]), ref)
        del sc['packs'][ref]
        sc['packs'][new_ref] = new_pack
        if new_ref != ref:
            repoint(sc, ref, new_ref)
    return edit


def repoint(sc, old, new):
    def walk(node):
        if isinstance(node, dict):
            for k, v in node.items():
                if k == 'payload_ref' and v == old:
                    node[k] = new
                else:
                    walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)
    walk({k: v for k, v in sc.items() if k != 'packs'})


def repack(body_edit):
    def mutate(pack, ref):
        import pm_event_numbers as N
        body = N.decode_storage_value(bytes.fromhex(pack['bytes_hex']), profile=N.EVENT_VALUE)
        body_edit(body)
        return L.make_pack(body)
    return mutate


def raw_pack(raw):
    import blake3

    def mutate(pack, ref):
        pid = blake3.blake3(raw).hexdigest()
        return 'sp337:blake3:' + pid, {'bytes_hex': raw.hex(), 'byte_size': len(raw), 'payload_id': pid, 'media_type': L.PACK_MEDIA}
    return mutate


def first_pack(sc):
    return sorted(sc['packs'])[0]


def pack_witnesses(prefix, variant, ok_body):
    """present / id / bytes / body witnesses for one externalized part."""
    out = [(prefix + '_pack_present', variant, [('final', '/packs', {})], {}),
           (prefix + '_pack_id', variant, [('final', None, lambda sc, st: sc['packs'][first_pack(sc)].update(payload_id='0' * 64))], {}),
           (prefix + '_pack_bytes', variant, [('final', None, lambda sc, st: sc['packs'][first_pack(sc)].update(
               bytes_hex=('00' if sc['packs'][first_pack(sc)]['bytes_hex'][:2] != '00' else '01') + sc['packs'][first_pack(sc)]['bytes_hex'][2:]))], {})]
    if ok_body:
        out.append((prefix + '_pack_body', variant, [('final', None, set_pack(first_pack, raw_pack(b'\xc1')))], {}))
    return out


def append_witnesses():
    W = []
    W += [('scenario_path', 'append', [('final', '/path', 'publish')], {}),
          ('scenario_family', 'append', [('final', '/family', 'testing.capture.zz_unknown')], {}),
          ('scenario_scope', 'append', [('final', '/scope', 'application')], {'abbr': ['rdy']}),
          ('event_family', 'append', [('event', '/event/event_type', 'testing.capture.zz_other')], {})]
    W += [('admission_family', 'append', [('owner', '/owner/admission/family', 'testing.capture.zz_other')], {}),
          ('admission_version', 'append', [('owner', '/owner/admission/version', '2.0.0')], {}),
          ('admission_installed', 'append', [('owner', '/owner/admission/schema_installed', False)], {}),
          ('writer_live', 'append', [('owner', '/owner/writer/withdrawn', True)], {}),
          ('writer_live', 'op-bind', [('owner', '/owner/writer/withdrawn', True)], {}),
          ('writer_generation', 'append', [('final', '/commit_check/writer_generation', 2)], {}),
          ('stop_generation', 'append', [('final', '/commit_check/stop_generation', 0)], {}),
          ('permission_granted', 'append', [('owner', '/owner/permission/granted', False)], {}),
          ('permission_granted', 'op-first', [('owner', '/owner/permission/granted', False)], {}),
          ('permission_generation', 'append', [('final', '/commit_check/permission_generation', 0)], {}),
          ('target_class', 'append', [('owner', '/owner/target/security_class', 'protected_auth')], {}),
          ('target_generation', 'append', [('final', '/commit_check/target_generation', 3)], {}),
          ('target_host', 'append', [('owner', '/owner/target/host_id', 'host-other')], {}),
          ('target_environment', 'append', [('owner', '/owner/target/environment_id', 'env-other')], {})]
    W += [('envelope_schema', 'append', [('event', '/event/redaction_profile', 'plain')], {}),
          ('envelope_schema', 'append', [('event', '/event/sequence_id', '41')], {}),
          ('envelope_schema', 'append', [('event', '/event/actor_ref', True)], {})]
    W += [('envelope_schema', 'append', [('event', '/event/' + k, t)], {'tag': k + ':' + n})
          for k in ('occurred_at_utc', 'observed_at_utc', 'persisted_at_utc') for n, t in BAD_TIMES]
    W += [('envelope_numbers', 'append', [('event', '/event/sequence_id', 41.0)], {}),
          ('envelope_numbers', 'append', [('event', '/event/producer_sequence_id', 7.0)], {}),
          ('sequence_u64', 'append', [('event', '/event/sequence_id', 2 ** 64)], {}),
          ('storage_utc_observed_at_utc', 'append', [('event', '/event/observed_at_utc', '2026-11-05T10:00:01+00:00')], {'tag': 'offset'}),
          ('storage_utc_observed_at_utc', 'append', [('event', '/event/observed_at_utc', '2026-11-05T10:00:01z')], {'tag': 'lowercase_z'}),
          ('storage_utc_persisted_at_utc', 'append', [('event', '/event/persisted_at_utc', '2026-11-05T10:00:01-00:00')], {'tag': 'minus_zero'}),
          ('storage_utc_persisted_at_utc', 'append', [('event', '/event/persisted_at_utc', '2026-11-05T10:00:01z')], {'tag': 'lowercase_z'}),
          ('payload_schema_id', 'append', [('event', '/event/payload_schema_id', lambda sc, st: sc['event']['payload_schema_id'].replace('.v1', '.v2'))], {}),
          ('replay_policy_current', 'append', [('event', '/event/replay_policy', 'projector_replay_only')], {}),
          ('replay_policy_current', 'retry-bound', [('final', '/event/replay_policy', 'projector_replay_only')], {}),
          ('producer_route', 'append', [('owner', '/owner/producer_sequence_id', 2 ** 53 + 1)], {}),
          ('inline_size', 'append+oversize', [], {'abbr': ['dvc'], 'base': 'append'})]
    W += pack_witnesses('event', 'append-sp337', False)
    W += [('event_pack_body', 'append-sp337', [('packbody', '/packbody/permission_snapshot_ref', 'perm:other')], {})]
    W = [(r, v, e, dict(f, abbr=['dvc']) if v.startswith('append-sp337') else f) for r, v, e, f in W]
    app_schema = {'application': 'payload_schema'}
    W += [('scope_kind_copy', 'append', [('event', None, lambda sc, st: sc['event'].update(
              scope_kind='application', project_id=None) if sc['scope'] == 'project' else sc['event'].update(scope_kind='project', project_id='proj-x'))], {}),
          ('scope_partition_recipe', 'append', [('payload', '/event/payload/scope/scope_partition', 'project~b3RoZXI')], {'expect': app_schema}),
          ('scope_project_join', 'append', [('payload', '/event/payload/scope/project_id', 'proj-other')], {'expect': app_schema}),
          ('scope_home_server_join', 'append', [('payload', '/event/payload/scope/project_home_server_id', 'srv-other')], {'expect': app_schema}),
          ('scope_server_join', 'append', [('payload', '/event/payload/scope/server_id', 'srv-other')], {}),
          ('scope_server_join', 'append', [('payload', '/event/payload/scope/server_id', 'srv-w3c-1\n')], {'tag': 'trailing_lf_implied'}),
          ('scope_partition_recipe', 'append', [('payload', '/event/payload/scope/scope_partition', lambda sc, st: sc['event']['payload']['scope']['scope_partition'] + '\n')],
           {'tag': 'trailing_lf_implied', 'expect': app_schema}),
          ('scope_named_plan_join', 'append', [('payload', '/event/payload/scope/named_plan_id', 'plan-1')], {'expect': app_schema}),
          ('event_project_join', 'append', [('event', '/event/project_id', 'proj-other')], {'expect': {'application': 'envelope_schema'}}),
          ('owner_operation_join', 'append', [('payload', '/event/payload/owner_operation_id', 'op-other')], {}),
          ('event_id_recipe', 'append', [('event', '/event/event_id', 'w3c@1:00')], {}),
          ('event_id_recipe', 'append', [('event', '/event/event_id', lambda sc, st: sc['event']['event_id'] + '\n')], {'tag': 'trailing_lf_implied'}),
          ('idempotency_key_recipe', 'append', [('event', '/event/idempotency_key', 'x@1:00')], {}),
          ('source_record_owner', 'append', [('payload', '/event/payload/source_record', lambda sc, st: L.src_ref(sc['owner'], sc['owner']['request_record_ref']))], {}),
          ('source_record_hash', 'append', [('payload', '/event/payload/source_record/record_sha256', 'a' * 64)], {}),
          ('before_record_join', 'append', [('payload', '/event/payload/before_record', lambda sc, st: None if pred(sc['family'])
                                              else L.src_ref(sc['owner'], sc['owner']['request_record_ref']))], {}),
          ('before_record_hash', 'append', [('payload', '/event/payload/before_record/record_sha256', 'a' * 64)], {'pred': True}),
          ('permission_snapshot_join', 'append', [('payload', '/event/payload/permission_snapshot_ref', 'perm:other')], {})]
    W += [(k + '_issued', 'append', [('event', '/event/' + k, v)], {}) for k, v in
          (('sequence_id', 42), ('observed_at_utc', '2026-11-05T10:00:03Z'), ('persisted_at_utc', '2026-11-05T10:00:03Z'))]
    W += [('occurred_from_owner', 'append', [('event', '/event/occurred_at_utc', '2026-11-05T09:00:00Z')], {}),
          ('producer_sequence_from_owner', 'append', [('event', '/event/producer_sequence_id', 8)], {}),
          ('op_preimage_frozen', 'append', [('appended', '/event/correlation_id', 'corr:other')], {}),
          ('op_outcome_frozen', 'append', [('operation', '/operation/outcome_record/record_sha256', 'a' * 64)], {}),
          ('op_original_event', 'append', [('operation', '/operation/original_event/value/correlation_id', 'corr:other')], {}),
          ('op_first_append', 'append', [('operation', '/operation/first_append/first_append_receipt/byte_offset', 1)], {})]
    R = '/storage/issued/result/first_append_receipt/'
    W += [('receipt_schema', 'append', [('storage', R + 'durability_state', 'pending')], {}),
          ('receipt_numbers', 'append', [('storage', R + 'byte_offset', 4096.0)], {})]
    W += [('receipt_schema', 'append', [('storage', R + 'acknowledged_at_utc', t)], {'tag': 'acknowledged_at_utc:' + n}) for n, t in BAD_TIMES]
    W += [('receipt_u64_' + k, 'append', [('storage', R + k, 2 ** 64)], {}) for k in ('sequence_id', 'segment_generation', 'byte_offset',
                                                                                      'durable_end_offset', 'manifest_generation')]
    W += [('receipt_event_join', 'append', [('storage', R + 'event_id', 'evt-other')], {}),
          ('receipt_sequence_join', 'append', [('storage', R + 'sequence_id', 40)], {}),
          ('receipt_ack_issued', 'append', [('storage', R + 'acknowledged_at_utc', '2026-11-05T10:00:03Z')], {}),
          ('receipt_barrier', 'append', [('storage', R + 'durability_class', 'ordinary')], {}),
          ('receipt_commitment', 'append', [('storage', '/storage/issued/result/original_event_value_commitment/sha256', 'a' * 64)], {}),
          ('receipt_segment', 'append', [('storage', '/storage/issued/result/original_segment_ref', 'seglog/other')], {})]
    for a, b in (('flush', 'receipt'), ('receipt', 'event_committed'), ('event_committed', 'terminal'), ('terminal', 'publish')):
        order = ['flush', 'receipt', 'event_committed', 'terminal', 'publish']
        i, j = order.index(a), order.index(b)
        order[i], order[j] = order[j], order[i]
        W.append(('order_' + a + '_' + b, 'append', [('final', '/publication', order)], {}))
    W.append(('rdy_enabled_at_owner', 'append', [('source', '@src/enabled_at_utc', '2026-11-05T10:00:05Z')], {'abbr': ['rdy']}))
    return W


def join_witnesses():
    W = []
    defs = contracts()['$defs']
    for fam, scope in editions():
        props = defs[L.FAMILIES[fam][1]]['properties']
        for field, key in FAMILIES[fam][7]:
            sch = json.dumps(props[field])
            if 'array' in sch:
                value = ['raw-other-1']
            elif 'occurred_at_utc' in sch:
                value = '2026-11-05T10:00:09Z'
            elif 'safe_ref' in sch:
                value = 'ref:other'
            else:
                value = 'other-1'
            W.append(('join_' + field, 'append', [('payload', '/event/payload/' + field, value)], {'only': (fam, scope)}))
    return W


def clause_witnesses():
    W = []
    for fam, clauses in CLAUSES.items():
        for suffix, code, words, template, lit, (stage, pointer, value) in clauses:
            W.append((abbr(fam) + '_' + suffix, 'append', [(stage, pointer, value)], {'abbr': [abbr(fam)]}))
    return W


def leaf_variants(field, schema_text, nullable, required=True, present=True):
    """(tag, value or DELETE) single-leaf defects for one payload/request property, from its schema kind."""
    out = [('missing', L.DELETE)] if required else []
    if '"const"' in schema_text and 'safe_ref' not in schema_text and '$ref' not in schema_text:
        return out + [('const', 'pm.other.v9'), ('wrong_type_number', 5)]
    if 'WorkflowScopeV2' in schema_text:
        return out + [('scope_kind_other', None), ('scope_extra', None), ('wrong_type_string', 'app')]
    if 'source_ref' in schema_text:
        base = [('wrong_type_number', 5), ('wrong_type_string', 'rec:x'), ('wrong_type_array', [])]
        if not nullable:
            base.append(('null', None))
        inner = [('hash_uppercase', None), ('hash_trailing_lf', None), ('ref_trailing_lf', None), ('extra_member', None)]
        return out + base + (inner if present else [])
    if '"array"' in schema_text:
        return out + [('empty', []), ('duplicate', ['raw-dvc-a', 'raw-dvc-a']), ('item_number', [5]), ('item_trailing_lf', ['raw-dvc-a\n'])]
    if 'occurred_at_utc' in schema_text:
        return out + [('wrong_type_number', 5)] + [('time_' + n, t) for n, t in BAD_TIMES]
    common = [('wrong_type_number', 5), ('wrong_type_bool', True), ('null', None), ('wrong_type_array', []), ('wrong_type_object', {}),
              ('trailing_lf', 'LF'), ('empty', ''), ('bad_char', 'bad id')]
    if 'safe_ref' in schema_text:
        common += [('protected_auth', 'ref:protected_auth:x'), ('leading_digit', '1ref'), ('too_long', 'r' * 513)]
    else:
        common += [('too_long', 'i' * 193)]
    return out + common


def leaf_edit(pointer, field, tag, value):
    if value == 'LF':
        return [('X', pointer + '/' + field, lambda sc, st, p=pointer, f=field: get(sc, p)[f] + '\n')]
    if tag in ('scope_kind_other',):
        return [('X', pointer + '/' + field + '/scope_kind', lambda sc, st, p=pointer, f=field: 'project' if get(sc, p)[f]['scope_kind'] == 'application' else 'application')]
    if tag in ('scope_extra', 'extra_member'):
        return [('X', pointer + '/' + field + '/extra', 1)]
    if tag == 'hash_uppercase':
        return [('X', pointer + '/' + field + '/record_sha256', lambda sc, st, p=pointer, f=field: get(sc, p)[f]['record_sha256'].upper())]
    if tag == 'hash_trailing_lf':
        return [('X', pointer + '/' + field + '/record_sha256', lambda sc, st, p=pointer, f=field: get(sc, p)[f]['record_sha256'][:63] + '\n')]
    if tag == 'ref_trailing_lf':
        return [('X', pointer + '/' + field + '/record_ref', lambda sc, st, p=pointer, f=field: get(sc, p)[f]['record_ref'] + '\n')]
    return [('X', pointer + '/' + field, value)]


def get(sc, pointer):
    node = sc
    for part in pointer.split('/')[1:]:
        node = node[int(part)] if type(node) is list else node[part]
    return node


def schema_leaf_witnesses():
    """Payload leaves per edition; request leaves per edition (retry request); embedded copies (operation intent,
    checkpoint inline projection) on two editions; an extra member at each root."""
    W = []
    defs = contracts()['$defs']
    embedded = {('testing.capture.bookmarked', 'project'), ('artifacts.demonstration_video.created', 'application')}
    for fam, scope in editions():
        for kind, variant, stage, pointer, row in (
                ('', 'append', 'payload', '/event/payload', 'payload_schema'),
                ('_request', 'retry-pending', 'final', '/retry/request', 'retry_request_schema'),
                ('_request', 'op-first', 'operation', '/operation/successor/intent/value', 'op_schema'),
                ('', 'ck-inline', 'ckrow', '/checkpoint/row/projection/value', 'ck_schema')):
            if pointer.startswith(('/operation', '/checkpoint')) and (fam, scope) not in embedded:
                continue
            d = defs[L.FAMILIES[fam][1] + kind + ('ApplicationV1' if scope == 'application' else '')]
            for field, sch in d['properties'].items():
                text = json.dumps(sch)
                nullable = '"null"' in text
                present = not (field == 'before_record' and not pred(fam))
                for tag, value in leaf_variants(field, text, nullable, field in d['required'], present):
                    edits = [(stage if s == 'X' else s, p, v) for s, p, v in leaf_edit(pointer, field, tag, value)]
                    W.append((row, variant, edits, {'only': (fam, scope), 'tag': kind.strip('_') + 'leaf:' + field + ':' + tag}))
            W.append((row, variant, [(stage, pointer + '/extra_member', 1)], {'only': (fam, scope), 'tag': kind.strip('_') + 'leaf:extra_member'}))
    return W


def retry_history_witnesses():
    W = [('retry_dedupe', 'retry-pending', [('final', '/storage/dedupe', 'unavailable')], {}),
         ('retry_request_same', 'retry-pending', [('final', '/retry/request/permission_snapshot_ref', 'perm:other')], {}),
         ('retry_preimage_same', 'retry-bound', [('final', '/event/correlation_id', 'corr:other')], {}),
         ('retry_pending_result', 'retry-pending', [('final', '/retry/result/kind', 'repeat_action')], {}),
         ('retry_bound_result', 'retry-bound', [('final', '/retry/result/kind', 'reencode')], {}),
         ('retry_original_result', 'retry-committed', [('final', '/retry/result/value/first_append_receipt/byte_offset', 1)], {}),
         ('retry_no_effects', 'retry-pending', [('final', '/retry/effects', ['encode'])], {}),
         ('recipe_override', 'retry-committed', [('final', '/retry/recipe_selector', 'w3c@0')], {}),
         ('original_custody', 'retry-committed', [('final', '/storage/custody/sealed_receipts', [])], {}),
         ('recipe_override', 'history', [('final', '/reader/recipe_selector', 'w3c@0')], {}),
         ('original_query', 'history', [('final', '/event/payload/scope', L.DELETE)], {}),
         ('original_custody', 'history', [('final', '/storage/custody/sealed_receipts', [])], {}),
         ('original_other_receipt', 'history', [('final', '/storage/custody/sealed_receipts/0/source_commitment', 'a' * 64)], {}),
         ('recipe_unique', 'history', [('final', '/storage/custody/sealed_receipts', lambda sc, st: sc['storage']['custody']['sealed_receipts'] * 2)], {}),
         ('recipe_installed', 'history', [('final', '/storage/custody/sealed_receipts/0/recipe', 'w3c@9')], {}),
         ('original_admission', 'history', [('final', '/storage/custody/sealed_receipts/0/admission/version', '2.0.0')], {}),
         ('original_binding', 'history', [('final', '/event/idempotency_key', 'x@1:00')], {}),
         ('read_no_receipt_created', 'history', [('final', '/storage/custody/service', 'write_through')], {}),
         ('read_no_receipt_created', 'retry-committed', [('final', '/storage/custody/service', 'write_through')], {}),
         ('original_resolution', 'history', [('custody', '/storage/custody/original/sequence_id', 2 ** 64)], {'tag': 'uint64_unencodable_original'}),
         ('original_resolution', 'retry-committed', [('custody', '/storage/custody/original/sequence_id', 2 ** 64)], {'tag': 'uint64_unencodable_original'}),
         ('frozen_envelope', 'history', [('custody', '/storage/custody/original/redaction_profile', 'plain')], {}),
         ('frozen_payload', 'history', [('custody', '/storage/custody/original/payload/permission_snapshot_ref', 5)], {}),
         ('frozen_payload', 'history', [('custody', '/storage/custody/original/payload/owner_operation_id',
                                         lambda sc, st: sc['storage']['custody']['original']['payload']['owner_operation_id'] + '\n'),
                                        ('custody', '/event/payload/owner_operation_id', lambda sc, st: sc['event']['payload']['owner_operation_id'] + '\n')],
          {'tag': 'trailing_lf'}),
         ('frozen_storage_times', 'history', [('custody', '/storage/custody/original/observed_at_utc', '2026-11-05T10:00:01+00:00')], {}),
         ('frozen_event_identity', 'history', [('custody', '/storage/custody/original/event_id', 'w3c@1:forged'), ('custody', '/event/event_id', 'w3c@1:forged')], {}),
         ('frozen_key', 'history', [('custody', '/storage/custody/original/idempotency_key', 'x@1:forged'), ('custody', '/event/idempotency_key', 'x@1:forged')], {}),
         ('frozen_full_value', 'history', [('custody', '/storage/custody/held/full_value_sha256', 'a' * 64)], {}),
         ('frozen_producer', 'history', [('custody', '/storage/custody/held/producer_semantic_sha256', 'a' * 64)], {}),
         ('frozen_custody_event', 'history', [('custody', '/storage/custody/held/event_id', 'evt-other')], {}),
         ('disclosure_access', 'history', [('final', '/reader/access/allowed', False)], {}),
         ('disclosure_not_deleted', 'history', [('final', '/reader/access/deleted', True)], {}),
         ('disclosure_not_restricted', 'history', [('final', '/reader/access/restricted', True)], {}),
         ('reader_not_withdrawn', 'history', [('final', '/reader/withdrawn', True)], {}),
         ('history_no_effects', 'history', [('final', '/reader/effects', ['notify'])], {})]
    return W


def operation_witnesses():
    S = '/operation/successor/'
    dummy_outcome = {'record_ref': 'rec:dummy:outcome', 'record_sha256': 'a' * 64}
    W = [('op_schema', 'op-first', [('operation', S + 'phase', 'done')], {}),
         ('op_numbers', 'op-commit', [('operation', S + 'first_append/first_append_receipt/byte_offset', 4096.0)], {}),
         ('op_schema', 'op-commit', [('operation', S + 'first_append/first_append_receipt/acknowledged_at_utc', '2026-11-05 10:00:02Z')], {'tag': 'embedded_receipt_time'}),
         ('op_uuid', 'op-first', [('operation', S + 'storage_instance_id', lambda sc, st: sc['owner']['storage_instance_id'].upper())], {}),
         ('op_uuid', 'op-first', [('operation', S + 'storage_instance_id', lambda sc, st: sc['owner']['storage_instance_id'] + '\n')],
          {'tag': 'trailing_lf_implied', 'expect': {'project': 'op_schema', 'application': 'op_schema'}})]
    W += pack_witnesses('intent', 'op-first-external', True)
    W += pack_witnesses('original_event', 'op-commit-external', True)
    W += [('op_receipt_u64_' + k, 'op-commit', [('storage', '/storage/issued/result/first_append_receipt/' + k, 2 ** 64)], {})
          for k in ('sequence_id', 'segment_generation', 'byte_offset', 'durable_end_offset', 'manifest_generation')]
    W += [('op_intent_external_schema', 'op-first-external', [('final', None, set_pack(first_pack, repack(lambda b: b.update(permission_snapshot_ref=5))))], {}),
          ('op_event_external_schema', 'op-commit-external', [('final', None, set_pack(first_pack, repack(lambda b: b.update(redaction_profile='plain'))))], {}),
          ('op_inline_size', 'op-commit+oversize', [], {'abbr': ['dvc'], 'base': 'op-commit'})]
    for f, val in (('outcome_record', dummy_outcome), ('producer_semantics', dummy_outcome), ('first_append', lambda sc, st: st['result']),
                   ('original_event', lambda sc, st: {'mode': 'inline', 'value': st['appended']})):
        W.append(('op_pending_' + f + '_null', 'op-first', [('operation', S + f, val)], {}))
    for f in ('outcome_record', 'producer_semantics'):
        W.append(('op_bound_' + f, 'op-bind', [('operation', S + f, None)], {}))
    W += [('op_outcome_no_first_append', 'op-bind', [('operation', S + 'first_append', lambda sc, st: st['result'])], {}),
          ('op_outcome_no_original_event', 'op-bind', [('operation', S + 'original_event', lambda sc, st: {'mode': 'inline', 'value': st['appended']})], {}),
          ('op_committed_first_append', 'op-commit', [('operation', S + 'first_append', None)], {}),
          ('op_committed_original_event', 'op-commit', [('operation', S + 'original_event', None)], {}),
          ('op_withdrawn_outcome_pair', 'op-withdraw-pending', [('operation', S + 'outcome_record', lambda sc, st: st['outcome'])], {}),
          ('op_withdrawn_event_pair', 'op-withdraw-pending', [('operation', S + 'first_append', lambda sc, st: st['result'])], {}),
          ('op_withdrawn_event_after_outcome', 'op-withdraw-pending', [('operation', None, lambda sc, st: sc['operation']['successor'].update(
              first_append=st['result'], original_event={'mode': 'inline', 'value': st['appended']}))], {}),
          ('op_storage_join', 'op-first', [('operation', S + 'storage_instance_id', OTHER_UUID)], {}),
          ('op_operation_join', 'op-first', [('operation', S + 'owner_operation_id', 'op-other')], {}),
          ('op_scope_join', 'op-first', [('operation', S + 'scope/server_id', 'srv-other')], {}),
          ('op_key_recipe', 'op-first', [('final', '/operation/key', 'x')], {}),
          ('op_transition', 'op-commit', [('operation', S + 'phase', 'terminal')], {}),
          ('op_transition', 'op-withdraw-event', [('operation', '/operation/predecessor/phase', 'terminal'),
                                                  ('operation', '/operation/cas_expected', lambda sc, st: L.sha(sc['operation']['predecessor']))], {'tag': 'withdraw_after_terminal'}),
          ('op_cas', 'op-bind', [('final', '/operation/cas_expected', 'a' * 64)], {}),
          ('op_intent_immutable', 'op-commit', [('operation', S + 'intent/value/permission_snapshot_ref', 'perm:other')], {}),
          ('op_outcome_record_immutable', 'op-commit', [('operation', S + 'outcome_record/record_sha256', 'a' * 64)], {}),
          ('op_producer_semantics_immutable', 'op-commit', [('operation', S + 'producer_semantics/record_sha256', 'a' * 64)], {}),
          ('op_first_append_immutable', 'op-terminal', [('operation', S + 'first_append/first_append_receipt/byte_offset', 1)], {}),
          ('op_original_event_immutable', 'op-terminal', [('operation', S + 'original_event/value/correlation_id', 'corr:other')], {}),
          ('op_outcome_record_immutable', 'op-withdraw-outcome', [('operation', S + 'outcome_record/record_sha256', 'a' * 64)],
           {'tag': 'withdrawal_rewrites_binding'}),
          ('op_intent_request', 'op-first', [('operation', S + 'intent/value/permission_snapshot_ref', 'perm:other')], {}),
          ('request_record_hash', 'op-first', [('request_instance', '/owner/request/request_record/record_sha256', 'a' * 64)], {}),
          ('request_operation_join', 'op-first', [('request_instance', '/owner/request/owner_operation_id', 'op-other')], {}),
          ('request_scope_join', 'op-first', [('request_instance', '/owner/request/scope/server_id', 'srv-other')], {}),
          ('request_before_join', 'op-first', [('request_instance', '/owner/request/before_record', lambda sc, st: None if pred(sc['family'])
                                                 else L.src_ref(sc['owner'], sc['owner']['request_record_ref']))], {}),
          ('request_permission_join', 'op-first', [('request_instance', '/owner/request/permission_snapshot_ref', 'perm:other')], {}),
          ('op_outcome_owner', 'op-bind', [('operation', S + 'outcome_record', lambda sc, st: L.src_ref(sc['owner'], sc['owner']['request_record_ref']))], {}),
          ('op_outcome_hash', 'op-bind', [('operation', S + 'outcome_record/record_sha256', 'a' * 64)], {}),
          ('op_preimage_owner', 'op-bind', [('operation', S + 'producer_semantics/record_sha256', 'a' * 64)], {}),
          ('op_formed_event_outcome', 'op-bind', [('payload', '/event/payload/source_record/record_sha256', 'a' * 64)], {}),
          ('fence_action_identity', 'op-bind-recovery', [('final', '/operation/action/action_id', 'act-other')], {}),
          ('fence_single_execution', 'op-bind-recovery', [('final', '/operation/action/executions', 2)], {}),
          ('fence_evidence', 'op-bind-recovery', [('final', '/operation/action/evidence_ref', 'rec:missing:evidence')], {}),
          ('op_event_frozen', 'op-commit', [('appended', '/event/correlation_id', 'corr:other')], {}),
          ('op_event_issued', 'op-commit', [('final', '/storage/issued/event/correlation_id', 'corr:other')], {}),
          ('op_first_append_issued', 'op-commit', [('operation', S + 'first_append/first_append_receipt/byte_offset', 1)], {}),
          ('op_commitment', 'op-commit', [('storage', '/storage/issued/result/original_event_value_commitment/sha256', 'a' * 64)], {}),
          ('op_custody_before_terminal', 'op-terminal', [('final', '/operation/steps', ['terminal', 'custody_resolved'])], {}),
          ('restore_instance', 'op-commit-restore', [('final', '/operation/restore/storage_instance_id', OTHER_UUID)], {}),
          ('restore_packs', 'op-commit-restore', [('final', '/operation/restore/packs', [])], {}),
          ('restore_receipt', 'op-commit-restore', [('final', '/operation/restore/receipt_custody', False)], {}),
          ('op_original_event_immutable', 'op-terminal', [('operation', S + 'original_event/value/payload/owner_operation_id',
                                                           lambda sc, st: st['appended']['payload']['owner_operation_id'] + '\n')], {'tag': 'embedded_payload_lf_implied'}),
          ('op_event_frozen', 'op-commit', [('appended', '/event/payload/owner_operation_id', lambda sc, st: sc['event']['payload']['owner_operation_id'] + '\n')],
           {'tag': 'embedded_payload_lf_implied'})]
    return W


def checkpoint_witnesses():
    K = '/checkpoint/row/'
    T = K + 'index_read_token/'
    SEL = T + 'source_selection/'
    W = [('ck_schema', 'ck-inline', [('ckrow', K + 'generation_state', 'live')], {}),
         ('ck_schema', 'ck-inline', [('ckrow', T + 'redb_snapshot_id', 7)], {'tag': 'persisted_redb_snapshot_id'}),
         ('ck_numbers', 'ck-inline', [('ckrow', T + 'frontier_revision', 12.0)], {}),
         ('ck_schema', 'ck-inline', [('ckrow', T + 'frontier_revision', 2 ** 64)], {'tag': 'uint64_range'})]
    W += [('ck_schema', 'ck-retired', [('ckrow', K + 'first_retired_at_utc', t)], {'tag': 'first_retired_at_utc:' + n}) for n, t in BAD_TIMES]
    for rid, ptr in (('ck_uuid_storage_instance', K + 'storage_instance_id'), ('ck_uuid_token_storage', T + 'storage_instance_id'),
                     ('ck_uuid_selection_storage', SEL + 'storage_instance_id')):
        W.append((rid, 'ck-inline', [('ckrow', ptr, lambda sc, st, p=ptr: get(sc, p).upper())], {'tag': 'uppercase'}))
        W.append((rid, 'ck-inline', [('ckrow', ptr, lambda sc, st, p=ptr: get(sc, p) + '\n')],
                  {'tag': 'trailing_lf_implied', 'expect': {'project': 'ck_schema', 'application': 'ck_schema'}}))
    for rid, ptr in (('ck_full_generation_id', T + 'generation_id'), ('ck_full_generation_anchor', T + 'generation_anchor_sha256'),
                     ('ck_full_frontier', T + 'frontier_sha256')):
        W.append((rid, 'ck-inline', [('ckrow', ptr, lambda sc, st, p=ptr: get(sc, p) + '\n')], {}))
    for k in ('current_bytes_sha256', 'manifest_bytes_sha256', 'manifest_survivor_prefix_sha256', 'retained_inventory_sha256',
              'durable_watermarks_sha256', 'excluded_ranges_sha256', 'retired_inputs_sha256'):
        W.append(('ck_full_' + k, 'ck-inline', [('ckrow', SEL + k, lambda sc, st, p=SEL + k: get(sc, p) + '\n')], {}))
    W += pack_witnesses('projection', 'ck-external', True)
    W += [('ck_projection_schema', 'ck-external', [('final', None, set_pack(first_pack, repack(lambda b: b.update(permission_snapshot_ref=5))))], {}),
          ('ck_inline_size', 'ck-inline+oversize', [], {'abbr': ['dvc'], 'base': 'ck-inline'}),
          ('ck_cursor_empty_last_event_id', 'ck-empty', [('ckrow', K + 'last_event_id', 'evt-x')], {}),
          ('ck_cursor_empty_last_sequence_id', 'ck-empty', [('ckrow', K + 'last_sequence_id', 5)], {}),
          ('ck_cursor_body_last_event_id', 'ck-inline', [('ckrow', K + 'last_event_id', None)], {}),
          ('ck_cursor_body_last_sequence_id', 'ck-inline', [('ckrow', K + 'last_sequence_id', None)], {}),
          ('ck_storage_join', 'ck-inline', [('ckrow', K + 'storage_instance_id', OTHER_UUID)], {}),
          ('ck_token_storage_join', 'ck-inline', [('ckrow', T + 'storage_instance_id', OTHER_UUID)], {}),
          ('ck_selection_storage_join', 'ck-inline', [('ckrow', SEL + 'storage_instance_id', OTHER_UUID)], {}),
          ('ck_scope_join', 'ck-inline', [('ckrow', K + 'scope/server_id', 'srv-other')], {}),
          ('ck_subject_query', 'ck-inline', [('ckrow', K + 'subject_id', 'subj-other')], {}),
          ('ck_key_recipe', 'ck-inline', [('final', '/checkpoint/key', 'x')], {}),
          ('ck_token_authentic', 'ck-inline', [('ckrow', T + 'frontier_revision', 13)], {}),
          ('ck_token_authentic', 'ck-empty', [('ckrow', SEL + 'retained_inventory_sha256', 'b' * 64)], {'tag': 'empty_unauthenticated_token'}),
          ('cov_complete', 'ck-empty', [('final', '/checkpoint/coverage/complete', False)], {}),
          ('cov_token', 'ck-empty', [('final', '/checkpoint/coverage/token/frontier_revision', 11)], {}),
          ('cov_family', 'ck-empty', [('final', '/checkpoint/coverage/event_type', 'testing.capture.zz_other')], {}),
          ('cov_version', 'ck-empty', [('final', '/checkpoint/coverage/version', '2.0.0')], {}),
          ('cov_scope', 'ck-empty', [('final', '/checkpoint/coverage/scope_partition', 'project~b3RoZXI')], {}),
          ('cov_subject', 'ck-empty', [('final', '/checkpoint/coverage/subject_id', 'subj-other')], {}),
          ('cov_no_gaps', 'ck-empty', [('final', '/checkpoint/coverage/gaps', ['page-3'])], {}),
          ('cov_nonmatching_counted', 'ck-empty', [('final', '/checkpoint/coverage/scanned', 11)], {}),
          ('cov_complete', 'ck-inline', [('final', '/checkpoint/coverage/complete', False)], {}),
          ('ck_empty_no_match', 'ck-empty', [('final', '/checkpoint/coverage/matching', [{'event_id': 'evt-1', 'sequence_id': 3, 'payload': {}}])], {}),
          ('ck_body_has_match', 'ck-inline', [('final', '/checkpoint/coverage/matching', [])], {}),
          ('ck_last_sequence_u64', 'ck-inline', [('ckrow', '/checkpoint/row/last_sequence_id', 2 ** 64)], {}),
          ('ck_last_event_join', 'ck-inline', [('ckrow', K + 'last_event_id', 'evt-other')], {}),
          ('ck_last_sequence_join', 'ck-inline', [('ckrow', K + 'last_sequence_id', 99)], {}),
          ('ck_projection_body', 'ck-inline', [('ckrow', K + 'projection/value/permission_snapshot_ref', 'perm:other')], {}),
          ('ck_projection_body', 'ck-external', [('final', None, set_pack(first_pack, repack(lambda b: b.update(permission_snapshot_ref='perm:other'))))], {'tag': 'external'}),
          ('ck_predecessor_cas', 'ck-advance', [('final', K + 'predecessor_sha256', 'a' * 64)], {}),
          ('ck_publish_atomic', 'ck-inline', [('final', '/checkpoint/transactions', 2)], {}),
          ('ck_coverage_before_publish', 'ck-inline', [('final', '/checkpoint/steps', ['publish', 'verify_coverage'])], {}),
          ('ck_slots', 'ck-inline', [('final', '/checkpoint/generations', [{'generation_id': 'gen-x-' + str(i), 'state': 'retired'} for i in range(3)])], {}),
          ('ck_single_current', 'ck-inline', [('final', '/checkpoint/generations', [{'generation_id': 'gen-x-0', 'state': 'current'}])], {}),
          ('ck_retired_anchor', 'ck-inline', [('ckrow', K + 'generation_state', 'retired')], {}),
          ('ck_live_anchor_null', 'ck-inline', [('ckrow', K + 'first_retired_at_utc', '2026-11-06T00:00:00Z')], {}),
          ('ck_anchor_fixed', 'ck-retired', [('ckrow', K + 'first_retired_at_utc', '2026-11-07T00:00:00Z')], {}),
          ('ck_rebuild_no_effects', 'ck-empty', [('final', '/checkpoint/effects', ['encode'])], {}),
          ('ck_reader_live', 'ck-inline', [('final', '/checkpoint/reader_withdrawn', True)], {})]
    return W


def install_witnesses(fam):
    """Per family: a dangling reference in an unvisited branch inside that family's own payload definition (missing
    resource and missing fragment), plus, for the first family, an invalid metaschema keyword and a dangling reference in
    the application-records resource."""
    d = '/$defs/' + FAMILIES[fam][1] + '/$defs'
    out = [('install_refs', 'install', [('final', '/resources', {'$overlay': [[CONTRACTS, d, {'w3c_unvisited_probe': {
               '$ref': 'https://puppetmaster.local/Plans/w3c_missing.schema.json#/$defs/x'}}]]})], {'tag': 'missing_resource'}),
           ('install_refs', 'install', [('final', '/resources', {'$overlay': [[CONTRACTS, d, {'w3c_unvisited_probe': {
               '$ref': '#/$defs/w3c_missing_definition'}}]]})], {'tag': 'missing_fragment'})]
    if fam == 'artifacts.capture_provenance.inspected':
        out += [('install_metaschema', 'install', [('final', '/resources', {'$overlay': [[CONTRACTS, '/$defs/id/type', 'strng']]})], {}),
                ('install_refs', 'install', [('final', '/resources', {'$overlay': [[RECORDS, '/$defs/w3c_unvisited_probe',
                  {'$ref': 'https://puppetmaster.local/schemas/event_record/2.0.0/event_record.schema.json#/$defs/missing'}]]})],
                 {'tag': 'records_missing_external_fragment'})]
    return out


POSITIVE_EDITS = (
    [('append-occurred-' + n, 'append', [('owner', '/owner/occurred_at_utc', t)]) for n, t in GOOD_EVENT_TIMES] +
    [('ck-retired-offset-anchor', 'ck-retired', [('ckrow', '/checkpoint/row/first_retired_at_utc', '2026-11-06T02:00:00+02:00'),
                                                  ('ckrow', '/checkpoint/predecessor/first_retired_at_utc', '2026-11-06T02:00:00+02:00')]),
     ('append-sequence-u64-max', 'append', [('event', '/event/sequence_id', 2 ** 64 - 1), ('storage', '/storage/issued/sequence_id', 2 ** 64 - 1),
                                             ('storage', '/storage/issued/result/first_append_receipt/sequence_id', 2 ** 64 - 1)]),
     ('append-producer-2p53', 'append', [('owner', '/owner/producer_sequence_id', 2 ** 53)])])


def build_cases(families=None):
    man = manifest()
    positives, negatives, cache = [], [], {}

    def pid(fam, scope, name):
        return 'w3c/' + abbr(fam) + '/' + scope + '/' + name

    def positive(fam, scope, variant, name=None, edits=()):
        key = (fam, scope, name or variant)
        if key not in cache:
            sc = L.build(fam, scope, path_of(variant), variant, edits, man)
            cache[key] = sc
            positives.append({'id': pid(fam, scope, name or variant), 'expect': 'accept', 'scenario': sc})
        return cache[key]

    sel = [(f, s) for f, s in editions() if families is None or abbr(f) in families]
    for fam, scope in sel:
        for path, variants in VARIANTS.items():
            for v in variants:
                positive(fam, scope, v)
        if abbr(fam) == 'dvc':
            positive(fam, scope, 'append-sp337')
        for name, v, edits in POSITIVE_EDITS:
            positive(fam, scope, v, name, edits)
    for fam, scope in sel:
        if scope == FAMILIES[fam][5][0]:
            sc = L.build(fam, scope, 'install', 'append', (), man)
            positives.append({'id': pid(fam, scope, 'install'), 'expect': 'accept', 'scenario': sc})
            cache[(fam, scope, 'install')] = sc
    witnesses = (append_witnesses() + join_witnesses() + clause_witnesses() + schema_leaf_witnesses() + retry_history_witnesses() +
                 operation_witnesses() + checkpoint_witnesses())
    counter = {}
    for rid, variant, edits, filt in witnesses:
        for fam, scope in sel:
            if 'only' in filt and filt['only'] != (fam, scope):
                continue
            if 'abbr' in filt and abbr(fam) not in filt['abbr']:
                continue
            if filt.get('pred') and not pred(fam):
                continue
            if rid == 'scenario_scope' and scope != 'project':
                continue
            base_variant = filt.get('base', variant.split('+')[0])
            base = positive(fam, scope, base_variant)
            neg = L.build(fam, scope, path_of(variant), variant, edits, man)
            changes = L.diff(base, neg)
            if not changes:
                raise SystemExit('witness changes nothing: ' + rid + ' ' + fam + ' ' + scope)
            expect_row = filt.get('expect', {}).get(scope, rid)
            tag = filt.get('tag')
            nid = pid(fam, scope, base_variant) + '/neg/' + rid + ('/' + tag if tag else '')
            counter[nid] = counter.get(nid, 0) + 1
            if counter[nid] > 1:
                nid += '/' + str(counter[nid])
            negatives.append({'id': nid, 'base': pid(fam, scope, base_variant), 'expect': {'row': expect_row, 'code': ROW_BY_ID[expect_row]['code']},
                              'witness_of': rid, 'family': fam, 'scope': scope, 'path': path_of(variant), 'changes': changes})
    for fam, scope in sel:
        if scope != FAMILIES[fam][5][0]:
            continue
        for rid, variant, edits, filt in install_witnesses(fam):
            neg = L.build(fam, scope, 'install', 'append', edits, man)
            negatives.append({'id': pid(fam, scope, 'install') + '/neg/' + rid + ('/' + filt['tag'] if filt.get('tag') else ''),
                              'base': pid(fam, scope, 'install'), 'expect': {'row': rid, 'code': ROW_BY_ID[rid]['code']},
                              'witness_of': rid, 'family': fam, 'scope': scope, 'path': 'install',
                              'changes': L.diff(cache[(fam, scope, 'install')], neg)})
    return positives, negatives


def custody_text():
    doc = json.loads(CUSTODY.read_text())
    doc['stores'] = sorted([L.storage_instance(f, s) for f, s in editions()])
    return json.dumps(doc, indent=1, sort_keys=True) + '\n'


def fixtures_text(positives, negatives):
    lines = ['{"schema_id": "pm.proposal.w3c_event_fixtures.v1", "status": "SYNTHETIC_ORACLE_FIXTURES",',
             ' "positives": [']
    lines += [' ' + json.dumps(p, sort_keys=True, separators=(',', ':')) + (',' if i < len(positives) - 1 else '') for i, p in enumerate(positives)]
    lines += [' ],', ' "negatives": [']
    lines += [' ' + json.dumps(n, sort_keys=True, separators=(',', ':')) + (',' if i < len(negatives) - 1 else '') for i, n in enumerate(negatives)]
    lines += [' ]}', '']
    return '\n'.join(lines)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--families', help='comma-separated abbreviations (development only; never written)')
    parser.add_argument('--out', type=Path)
    parser.add_argument('--coverage', action='store_true', help='also write (or --check) the oracle-plan coverage report')
    args = parser.parse_args(argv)
    sys.set_int_max_str_digits(0)
    custody = custody_text()
    if not args.check:
        CUSTODY.write_text(custody)
    fams = set(args.families.split(',')) if args.families else None
    positives, negatives = build_cases(fams)
    text = fixtures_text(positives, negatives)
    summary = {'positives': len(positives), 'negatives': len(negatives), 'rows_witnessed': len({n['expect']['row'] for n in negatives}),
               'rows': len(ROWS), 'bytes': len(text)}
    cov_text = None
    if args.coverage and fams is None:
        cov = coverage(negatives)
        summary['plan_entries'], summary['plan_unwitnessed'] = cov['plan_entries'], cov['unwitnessed']
        cov_text = json.dumps(cov, indent=1, sort_keys=True) + '\n'
    if args.check:
        targets = [(FIXTURES, text), (CUSTODY, custody)] + ([(COVERAGE, cov_text)] if cov_text else [])
        stale = [p.name for p, t in targets if not p.exists() or p.read_text() != t]
        print(json.dumps(dict(summary, stale=stale)))
        return 1 if stale else 0
    target = args.out or (FIXTURES if fams is None else None)
    if target is None:
        raise SystemExit('--families needs --out')
    target.write_text(text)
    if cov_text:
        COVERAGE.write_text(cov_text)
    print(json.dumps(summary))
    return 0



# ---------------------------------------------------------------------------------------------
# Oracle-plan coverage (--coverage): every plan entry with the rows that implement it and their witnesses
# ---------------------------------------------------------------------------------------------
CATEGORY_ROWS = {
    'admission': ['admission_family', 'admission_version', 'admission_installed'],
    'closed_shape': ['payload_schema', 'retry_request_schema', 'op_schema', 'ck_schema', 'rdy_source_schema'],
    'full_match': ['op_uuid', 'ck_uuid_storage_instance', 'ck_uuid_token_storage', 'ck_uuid_selection_storage', 'ck_full_generation_id',
                   'ck_full_generation_anchor', 'ck_full_frontier', 'ck_full_current_bytes_sha256', 'payload_schema'],
    'scope': ['scenario_scope', 'scope_kind_copy', 'scope_partition_recipe', 'scope_project_join', 'scope_home_server_join', 'scope_server_join',
              'scope_named_plan_join', 'event_project_join', 'op_scope_join', 'request_scope_join', 'ck_scope_join', 'cov_scope'],
    'source_identity': ['source_record_owner', 'source_record_hash', 'before_record_hash', 'request_record_hash', 'op_outcome_hash'],
    'source_joins': ['before_record_join', 'permission_snapshot_join', 'owner_operation_join', 'request_before_join', 'request_permission_join',
                     'request_operation_join', 'JOINS'],
    'target': ['target_class', 'target_generation', 'target_host', 'target_environment'],
    'permission': ['permission_granted', 'permission_generation', 'writer_generation', 'stop_generation'],
    'identity_recipe': ['event_id_recipe', 'idempotency_key_recipe', 'op_key_recipe', 'ck_key_recipe', 'op_preimage_owner', 'op_preimage_frozen'],
    'storage_metadata': ['sequence_id_issued', 'observed_at_utc_issued', 'persisted_at_utc_issued', 'occurred_from_owner', 'producer_sequence_from_owner',
                         'receipt_sequence_join', 'receipt_ack_issued', 'receipt_segment'],
    'current_replay_policy': ['replay_policy_current'],
    'retry': ['retry_dedupe', 'retry_request_schema', 'retry_request_same', 'retry_preimage_same', 'retry_pending_result', 'retry_bound_result',
              'retry_original_result', 'retry_no_effects'],
    'first_receipt': ['receipt_schema', 'receipt_commitment', 'receipt_event_join', 'receipt_barrier', 'op_first_append', 'op_first_append_issued',
                      'op_commitment', 'order_flush_receipt', 'order_receipt_event_committed'],
    'body_size': ['inline_size', 'op_inline_size', 'ck_inline_size', 'event_pack_present', 'event_pack_id', 'event_pack_bytes', 'event_pack_body',
                  'intent_pack_present', 'intent_pack_body', 'original_event_pack_present', 'original_event_pack_body', 'projection_pack_present',
                  'projection_pack_body'],
    'numbers': ['envelope_numbers', 'sequence_u64', 'producer_route', 'receipt_numbers', 'receipt_u64_byte_offset', 'op_numbers',
                'op_receipt_u64_byte_offset', 'ck_numbers', 'ck_last_sequence_u64'],
    'formats': ['envelope_schema', 'storage_utc_observed_at_utc', 'storage_utc_persisted_at_utc', 'receipt_schema', 'ck_schema'],
    'read_identity': ['recipe_override', 'original_query', 'original_custody', 'original_other_receipt', 'recipe_unique', 'recipe_installed',
                      'original_admission', 'original_binding', 'original_resolution', 'read_no_receipt_created', 'frozen_envelope', 'frozen_payload',
                      'frozen_storage_times', 'frozen_event_identity', 'frozen_key', 'frozen_full_value', 'frozen_producer', 'frozen_custody_event'],
    'disclosure': ['disclosure_access', 'disclosure_not_deleted', 'disclosure_not_restricted', 'reader_not_withdrawn', 'history_no_effects'],
    'checkpoint': ['ck_storage_join', 'ck_token_storage_join', 'ck_selection_storage_join', 'ck_subject_query', 'ck_token_authentic',
                   'ck_cursor_empty_last_event_id', 'ck_cursor_body_last_event_id'],
    'advance': ['ck_predecessor_cas', 'ck_publish_atomic', 'ck_coverage_before_publish', 'cov_complete'],
    'rebuild': ['ck_rebuild_no_effects', 'cov_nonmatching_counted'],
    'generations': ['ck_slots', 'ck_single_current', 'ck_retired_anchor', 'ck_live_anchor_null', 'ck_anchor_fixed'],
    'restore': ['restore_instance', 'restore_packs', 'restore_receipt'],
    'withdrawal': ['writer_live', 'reader_not_withdrawn', 'ck_reader_live', 'op_withdrawn_outcome_pair', 'op_withdrawn_event_pair',
                   'op_withdrawn_event_after_outcome', 'op_transition'],
    'schema_reference_closure': ['install_metaschema', 'install_refs'],
    'pending_request': ['op_pending_outcome_record_null', 'op_pending_producer_semantics_null', 'op_pending_first_append_null',
                        'op_pending_original_event_null', 'op_intent_request', 'op_intent_external_schema'],
    'outcome_binding': ['op_bound_outcome_record', 'op_bound_producer_semantics', 'op_outcome_owner', 'op_outcome_hash', 'op_formed_event_outcome',
                        'op_outcome_no_first_append', 'op_outcome_no_original_event', 'op_outcome_record_immutable', 'op_producer_semantics_immutable'],
    'uncertain_action_fence': ['fence_action_identity', 'fence_single_execution', 'fence_evidence', 'retry_pending_result'],
    'phase_cas_publication': ['op_cas', 'op_transition', 'op_committed_first_append', 'op_committed_original_event', 'op_event_frozen', 'op_event_issued',
                              'op_custody_before_terminal', 'order_event_committed_terminal', 'order_terminal_publish'],
    'empty_cursor_shape': ['ck_cursor_empty_last_event_id', 'ck_cursor_empty_last_sequence_id', 'ck_cursor_body_last_event_id',
                           'ck_cursor_body_last_sequence_id'],
    'empty_coverage': ['cov_complete', 'cov_token', 'cov_family', 'cov_version', 'cov_scope', 'cov_subject', 'cov_no_gaps', 'cov_nonmatching_counted',
                       'ck_empty_no_match'],
    'nonempty_last_event': ['ck_body_has_match', 'ck_last_event_join', 'ck_last_sequence_join', 'ck_last_sequence_u64', 'ck_projection_body',
                            'ck_projection_schema'],
}


def coverage(negatives):
    import re
    plan = json.loads((ROOT / 'Plans/w3c_test_capture_event_oracle_plan.json').read_text())
    witnesses = {}
    for n in negatives:
        witnesses.setdefault((n['family'], n['expect']['row']), []).append(n['id'])
    out, missing = [], []
    for fam in plan['families']:
        et = fam['event_type']
        a = abbr(et)
        clause_rows = {}
        for suffix, code, words, *_ in CLAUSES[et]:
            m = re.search(r'\((?:TCME|ATS)-1\d\d\d \(([\d, ]+)\)', words)
            for k in (m.group(1).split(', ') if m else []):
                clause_rows.setdefault('transition_' + k, []).append(a + '_' + suffix)
        for g in fam['guards']:
            cat = g['guard_id'].split('.', 1)[1]
            rows = clause_rows.get(cat) if cat.startswith('transition_') else CATEGORY_ROWS[cat]
            rows = [x for r in rows for x in (['join_' + f for f, _ in FAMILIES[et][7]] + (['rdy_enabled_at_owner'] if a == 'rdy' else [])
                                              if r == 'JOINS' else [r])]
            rows = [r for r in rows if r in ROW_BY_ID]
            entry = {'plan_entry': g['guard_id'], 'rows': {r: len(witnesses.get((et, r), [])) for r in rows}}
            entry['witnessed'] = any(entry['rows'].values())
            if not entry['witnessed']:
                missing.append(g['guard_id'])
            out.append(entry)
    return {'plan_entries': len(out), 'witnessed': len(out) - len(missing), 'unwitnessed': missing, 'entries': out}


if __name__ == '__main__':
    sys.exit(main())
