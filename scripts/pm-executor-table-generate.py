#!/usr/bin/env python3
"""Write the DX Method B guard-table modules (scripts/pm_executor_table_*.py) from one row spec.

Usage: python3 scripts/pm-executor-table-generate.py [--check]

Each spec row is (name, field, words, code, body); body is one refusal-condition
expression over the phase observation ``value``. One module per phase table, at
most eight rows each, so the shared guard tool (scripts/pm_guard_isolation.py,
gated at 004bdedd63) certifies small modules. The generated modules are the
checked-in source of truth for every refusal of the DX checkers
(pm_executor_event_semantics.py, pm_executor_event_contracts.py,
pm_executor_schema_refs.py): those checkers derive the observation of the phase
they are about to evaluate and refuse only through its rows, in table order.
--check fails when a module is stale, missing or extra.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'scripts'
PREFIX = 'pm_executor_table_'
PHASES = {}
RECIPES = "('executor-jcs-binary64-v1', 'executor-json-integer-v0')"


def phase(name, doc, rows):
    assert name not in PHASES and 1 <= len(rows) <= 8, name
    names = [row[0] for row in rows]
    assert len(set(names)) == len(names), name
    PHASES[name] = (doc, rows)


def lt(a, b):
    """Exact rational a < b over [numerator, positive denominator] observations."""
    return f"value['{a}'][0] * value['{b}'][1] < value['{b}'][0] * value['{a}'][1]"


# ===================================================================== recipe selection (SP-500..515)
phase('recipe_binding', 'SP-5xx: one authenticated write-time recipe per stored record (record_rules).', [
    ('RB01_edition_known', '/recipe_version', 'the custody edition is one of the two DX recipes', 'authenticated retained recipe binding',
     f"value['edition'] not in {RECIPES}"),
    ('RB02_retained_entry', '/custody', 'a retained original has an authenticated custody entry', 'authenticated retained recipe binding',
     "value['retained'] is True and value['entry_present'] is not True"),
    ('RB03_entry_source', '/custody/source_sha256', 'the custody entry pins the same complete original', 'authenticated retained recipe binding',
     "value['entry_source'] != value['key']"),
    ('RB04_claim_type', '/disclosure/recipe_version', 'a claimed recipe is a string', 'authenticated retained recipe binding',
     "value['claimed_kind'] == 'other'"),
    ('RB05_claim_edition', '/disclosure/recipe_version', 'a string claim equals the authenticated edition', 'authenticated retained recipe binding',
     f"value['claimed_kind'] == 'str' and value['edition'] in {RECIPES} and value['claimed'] != value['edition']"),
])

# ===================================================================== canonical value domain (identity, digest, joins)
phase('map_keys', 'Canonical maps: every key is a string (validate_payload_map_keys).', [
    ('MK01_string_keys', '/**', 'every map key is a string', 'payload map string keys', "value['all_keys_str'] is not True"),
])
phase('canonical_scalar', 'Canonical scalars: JSON integer domain and, under the current recipe, exact binary64 integers.', [
    ('CS01_scalar_domain', '/**', 'every scalar is null, string, boolean or integer', 'canonical integer value domain',
     "value['scalar_type'] not in ('NoneType', 'str', 'bool', 'int')"),
    ('CS02_exact_binary64', '/**', 'under the current recipe an integer is an exact finite binary64 integer', 'canonical exact binary64 integer',
     "value['scalar_type'] == 'int' and value['current_recipe'] is True and value['binary64_exact'] is not True"),
])

# ===================================================================== payload schema occurrences
phase('payload_schema', 'Family payload: the closed family schema with the strict date-time checker.', [
    ('PS01_payload_schema', '/payload', 'conforms to the closed family payload schema', 'payload schema', "value['schema_valid'] is not True"),
])
phase('payload_schema_stock', 'Isolated schema cases: the closed family schema under the stock format checker.', [
    ('PS02_payload_schema_stock', '/payload', 'conforms to the closed family payload schema (stock checker)', 'payload schema', "value['schema_valid'] is not True"),
])
phase('dependency_schema', 'Execution-unit context dependency: its existing owner schema.', [
    ('DS01_context_schema', '/dependencies/*/body', 'conforms to execution_unit_context.schema.json', 'execution unit context schema',
     "value['schema_valid'] is not True"),
])
phase('source_facts_schema', 'Shape oracle: the family source-proof schema definition.', [
    ('SF01_source_facts_schema', '/context/source_facts', 'conforms to the family source-proof definition', 'source facts schema',
     "value['schema_valid'] is not True"),
])

# ===================================================================== schema reference admission
phase('schema_document', 'Whole-document schema admission: the 2020-12 meta-schema.', [
    ('SR01_meta_schema', '/', 'the document is a valid 2020-12 schema', 'schema meta-validation', "value['meta_valid'] is not True"),
])
phase('schema_reference', 'Whole-document schema admission: every $ref resolves to a schema.', [
    ('SR02_ref_resolves', '/**/$ref', 'the reference resolves offline', 'unresolved schema $ref', "value['resolves'] is not True"),
    ('SR03_ref_target', '/**/$ref', 'a resolved reference names an object or boolean schema', 'non-schema $ref target',
     "value['resolves'] is True and value['target_type'] not in ('dict', 'bool')"),
])

# ===================================================================== replay policy
phase('append_policy', 'Current writer replay policy (standing check 1).', [
    ('AP01_replay_only', '/replay_policy', 'a current writer never uses projector_replay_only', 'replay_only_not_appendable',
     "value['policy'] == 'projector_replay_only'"),
    ('AP02_family_policy', '/replay_policy', 'equals the family dedupe_by_idempotency_key policy', 'family append replay policy',
     "value['policy'] != 'projector_replay_only' and (value['contract_policy'] != 'dedupe_by_idempotency_key' or value['policy'] != 'dedupe_by_idempotency_key')"),
])
phase('historical_policy', 'Retained reader replay policy: the family policy or compatibility replay only.', [
    ('HP01_history_policy', '/replay_policy', 'is the family policy or projector_replay_only', 'historical replay policy domain',
     "value['policy'] != value['contract_policy'] and value['policy'] != 'projector_replay_only'"),
])

# ===================================================================== SP-337 payload transport
phase('payload_scalar', 'Logical payload MessagePack: the fixture integer/string scalar domain.', [
    ('PB01_payload_scalar', '/payload/**', 'every payload scalar is null, string, integer or boolean', 'unsupported fixture payload value',
     "value['scalar_type'] not in ('NoneType', 'str', 'int', 'bool')"),
])
phase('transport_storage', 'SP-337: the envelope Storage instance is a nonempty string.', [
    ('PT01_storage_type', '/envelope/storage_instance_id', 'is a string', 'payload Storage string domain', "value['storage_type'] != 'str'"),
    ('PT02_storage_nonempty', '/envelope/storage_instance_id', 'a string Storage instance is nonempty', 'payload Storage string domain',
     "value['storage_type'] == 'str' and value['storage_nonempty'] is not True"),
])
phase('transport_inline', 'SP-337 inline route: logical payload join and the 16 KiB limit.', [
    ('PT03_inline_join', '/envelope/payload', 'the inline body equals the logical payload', 'inline logical payload join',
     "value['inline_canonical'] != value['payload_canonical']"),
    ('PT04_inline_limit', '/envelope/payload', 'the logical MessagePack body is at most 16384 bytes', 'oversized_inline_payload',
     "value['raw_size'] > 16384"),
])
phase('transport_ref', 'SP-337 reference route: empty inline body and the resolved descriptor.', [
    ('PR01_inline_empty', '/envelope/payload', 'a referenced body leaves the inline payload empty', 'referenced payload cannot remain inline',
     "value['inline_empty'] is not True"),
    ('PR02_descriptor_object', '/envelope/payload_ref', 'is an object', 'resolved SP-337 descriptor', "value['ref_type'] != 'dict'"),
    ('PR03_descriptor_keys', '/envelope/payload_ref', 'has exactly blake3, byte_size and media_type', 'resolved SP-337 descriptor',
     "value['ref_type'] == 'dict' and value['ref_keys'] != ['blake3', 'byte_size', 'media_type']"),
    ('PR04_size_type', '/envelope/payload_ref/byte_size', 'is an integer', 'payload ref byte size', "value['size_type'] != 'int'"),
    ('PR05_size_value', '/envelope/payload_ref/byte_size', 'an integer size equals the logical body length', 'payload ref byte size',
     "value['size_type'] == 'int' and value['ref_size'] != value['raw_size']"),
    ('PR06_media_type', '/envelope/payload_ref/media_type', 'is application/msgpack', 'payload ref media type',
     "value['ref_media'] != 'application/msgpack'"),
])
phase('pack_presence', 'SP-337: the referenced pack is present (validate_pack_presence).', [
    ('PP01_pack_present', '/payload_packs/{blake3}', 'the pack named by the descriptor is present', 'missing payload pack',
     "value['pack_present'] is not True"),
])
phase('pack_bytes', 'SP-337 pack bytes: hex, BLAKE3 and byte sizes.', [
    ('PK01_hex_decodes', '/payload_packs/*/bytes_hex', 'is a hex string', 'exact normalized pack bytes', "value['hex_decodes'] is not True"),
    ('PK02_hex_normalized', '/payload_packs/*/bytes_hex', 'decoded hex is its own lowercase normal form', 'exact normalized pack bytes',
     "value['hex_decodes'] is True and value['hex_normalized'] is not True"),
    ('PK03_blake3', '/payload_packs/*', 'BLAKE3 of the pack bytes equals the descriptor', 'payload pack BLAKE3',
     "value['hex_decodes'] is True and value['stored_blake3'] != value['ref_blake3']"),
    ('PK04_pack_size_type', '/payload_packs/*/byte_size', 'is an integer', 'payload pack byte size', "value['pack_size_type'] != 'int'"),
    ('PK05_pack_size_bytes', '/payload_packs/*/byte_size', 'an integer pack size equals the pack byte length', 'payload pack byte size',
     "value['hex_decodes'] is True and value['pack_size_type'] == 'int' and value['stored_size'] != value['pack_size']"),
    ('PK06_pack_size_ref', '/payload_packs/*/byte_size', 'an integer pack size equals the descriptor size', 'payload pack byte size',
     "value['pack_size_type'] == 'int' and value['pack_size'] != value['ref_size']"),
])
phase('pack_custody', 'SP-337 pack custody: media, logical body, Project, Storage, durability and deletion.', [
    ('PK07_media', '/payload_packs/*/media_type', 'equals the descriptor media type', 'payload pack media type', "value['pack_media'] != value['ref_media']"),
    ('PK08_logical_body', '/payload_packs/*', 'the pack bytes are the logical source body', 'payload pack logical source body', "value['body_equal'] is not True"),
    ('PK09_project', '/payload_packs/*/project_id', 'equals the payload Project', 'payload pack Project custody', "value['pack_project'] != value['payload_project']"),
    ('PK10_storage', '/payload_packs/*/storage_instance_id', 'equals the envelope Storage instance', 'payload pack Storage custody',
     "value['pack_storage'] != value['envelope_storage']"),
    ('PK11_durable', '/payload_packs/*/durable', 'is true before the referencing record', 'payload pack before referencing record', "value['durable'] is not True"),
    ('PK12_not_deleted', '/payload_packs/*/deleted_at', 'is null', 'payload pack disclosure custody', "value['deleted_at'] is not None"),
])
phase('grant', 'String-list grants: subject and grant list types, then exact membership (string_list_contains).', [
    ('GR01_subject_type', '/viewer', 'the subject is a string', 'grant subject string', "value['subject_type'] != 'str'"),
    ('GR02_subject_nonempty', '/viewer', 'a string subject is nonempty', 'grant subject nonempty', "value['subject_type'] == 'str' and value['subject_nonempty'] is not True"),
    ('GR03_grant_list', '/readers', 'the grant is a list', 'grant list', "value['grant_type'] != 'list'"),
    ('GR04_grant_items', '/readers/*', 'every grant item is a nonempty string', 'grant items',
     "value['grant_type'] == 'list' and value['items_nonempty_strings'] is not True"),
    ('GR05_membership', '/readers', 'a well-typed subject is a member of a well-typed grant', 'grant membership',
     "value['subject_type'] == 'str' and value['subject_nonempty'] is True and value['grant_type'] == 'list' and value['items_nonempty_strings'] is True and value['member'] is not True"),
])

# ===================================================================== owner-read helpers (helper cases)
phase('clock_spelling', 'Owner clocks: whole-string RFC3339 spelling and the UTC route (instant).', [
    ('TS01_spelling', '/**/*_utc', 'the whole string is a date-time with a calendar-valid date where the recipe requires it', 'whole-string source timestamp',
     "value['spelling_valid'] is not True"),
    ('TS02_utc_route', '/**/*_utc', 'a UTC clock ends in uppercase Z under the current recipe', 'whole-string source timestamp',
     "value['spelling_valid'] is True and value['utc_required'] is True and value['utc_spelling'] is not True"),
    ('TS03_parses', '/**/*_utc', 'a valid spelling parses to an instant', 'whole-string source timestamp',
     "value['spelling_valid'] is True and (value['utc_required'] is not True or value['utc_spelling'] is True) and value['parses'] is not True"),
])
phase('clock_timezone', 'Owner clocks: the parsed instant is zone-aware (validate_source_timezone).', [
    ('TZ01_timezone', '/**/*_utc', 'the parsed clock carries a zone', 'source clock timezone', "value['tz_present'] is not True"),
])
phase('retry_classification', 'EP-032: no blind retry of a non-retryable class.', [
    ('RC01_class_type', '/failure_class', 'is a string', 'no blind retry', "value['class_type'] != 'str'"),
    ('RC02_retryable', '/failure_class', 'is not graph_integrity, verification_failed, reviewer_findings or quota_exceeded', 'no blind retry',
     "value['class_type'] == 'str' and value['failure_class'] in ('graph_integrity', 'verification_failed', 'reviewer_findings', 'quota_exceeded')"),
])
phase('retry_policy_domain', 'EP-032: the class has an Executor retry limit.', [
    ('RD01_policy_type', '/failure_class', 'is a string', 'classified retry policy domain', "value['class_type'] != 'str'"),
    ('RD02_policy_known', '/failure_class', 'a string class has a declared Executor limit', 'classified retry policy domain',
     "value['class_type'] == 'str' and value['in_limits'] is not True"),
])
phase('retry_after_header', 'EP-032 rate_limited: the original Retry-After header is a nonempty string.', [
    ('RH01_header_type', '/retry_after_header', 'is a string', 'original Retry-After header', "value['header_type'] != 'str'"),
    ('RH02_header_nonempty', '/retry_after_header', 'a string header is nonempty', 'original Retry-After header',
     "value['header_type'] == 'str' and value['header_nonempty'] is not True"),
])
phase('retry_after_date', 'EP-032 rate_limited: an HTTP-date Retry-After parses with a zone.', [
    ('RA01_date_parses', '/retry_after_header', 'a non-decimal header is an HTTP-date', 'Retry-After HTTP-date', "value['parses'] is not True"),
    ('RA02_date_timezone', '/retry_after_header', 'the parsed HTTP-date carries a zone', 'Retry-After date timezone',
     "value['parses'] is True and value['tz_present'] is not True"),
])
phase('auth_refresh', 'EP-032 auth_expired: one successful original auth refresh.', [
    ('AR01_refresh_object', '/refresh', 'is an object', 'one successful original auth refresh', "value['refresh_type'] != 'dict'"),
    ('AR02_attempts_type', '/refresh/attempts', 'is an integer', 'one successful original auth refresh',
     "value['refresh_type'] == 'dict' and value['attempts_type'] != 'int'"),
    ('AR03_attempts_one', '/refresh/attempts', 'an integer attempt count is exactly 1', 'one successful original auth refresh',
     "value['refresh_type'] == 'dict' and value['attempts_type'] == 'int' and value['attempts'] != 1"),
    ('AR04_refreshed', '/refresh/result', 'is refreshed', 'one successful original auth refresh',
     "value['refresh_type'] == 'dict' and value['result'] != 'refreshed'"),
])
phase('source_record_set', 'Adapter: the source record set equals the adapter slots for this transition.', [
    ('SS01_record_set', '/records', 'the record slots equal the expected slots', 'source record set', "value['record_slots'] != value['expected_slots']"),
])
phase('transition_rules', 'Adapter: exactly one transition rule matches the predecessor.', [
    ('TR01_one_rule', '/transition/before', 'exactly one adapter rule matches', 'illegal predecessor', "value['rule_count'] != 1"),
])
phase('dependency_presence', 'Dependencies: a referenced dependency body is present (validate_dependency_presence).', [
    ('DP01_present', '/dependencies/{ref}', 'the referenced dependency is present', 'missing dependency', "value['present'] is not True"),
])
phase('workgraph_id', 'Owner-read workgraph IDs before any join (validate_workgraph_id).', [
    ('WG01_string_type', '/records/{node,run}/body/workgraph_id', 'is a string', 'workgraph ID string type', "value['id_type'] != 'str'"),
    ('WG02_nonempty', '/records/{node,run}/body/workgraph_id', 'a string ID is nonempty', 'workgraph ID nonempty',
     "value['id_type'] == 'str' and value['id_nonempty'] is not True"),
])
phase('fixture_literal', 'Fixture authoring notation: explicit repetition parts.', [
    ('FL01_part_object', '/fixture_text_parts/*', 'a non-string part is an object', 'fixture repetition syntax', "value['part_type'] != 'dict'"),
    ('FL02_part_keys', '/fixture_text_parts/*', 'an object part has exactly text and repeat', 'fixture repetition syntax',
     "value['part_type'] == 'dict' and value['part_keys'] != ['repeat', 'text']"),
    ('FL03_text_type', '/fixture_text_parts/*/text', 'is a string', 'fixture repetition syntax',
     "value['part_type'] == 'dict' and value['part_keys'] == ['repeat', 'text'] and value['text_type'] != 'str'"),
    ('FL04_repeat_type', '/fixture_text_parts/*/repeat', 'is an integer', 'fixture repetition syntax',
     "value['part_type'] == 'dict' and value['part_keys'] == ['repeat', 'text'] and value['repeat_type'] != 'int'"),
    ('FL05_repeat_nonnegative', '/fixture_text_parts/*/repeat', 'an integer repeat is not negative', 'fixture repetition syntax',
     "value['part_type'] == 'dict' and value['part_keys'] == ['repeat', 'text'] and value['repeat_type'] == 'int' and value['repeat'] < 0"),
])

# ===================================================================== identity recipe (pm_executor_event_contracts.identity)
phase('identity_field', 'Identity inputs: each identity field in its declared payload schema domain.', [
    ('ID01_domain_declared', '/identity_fields/*', 'the field schema declares a string or integer domain', 'identity declared field domain',
     "value['domain_type'] not in ('string', 'integer')"),
    ('ID02_string_type', '/identity_fields/*', 'a string-domain value is a string', 'identity declared field domain',
     "value['domain_type'] == 'string' and value['value_type'] != 'str'"),
    ('ID03_string_length', '/identity_fields/*', 'a string value meets minLength', 'identity declared field domain',
     "value['domain_type'] == 'string' and value['value_type'] == 'str' and value['length'] < value['bound']"),
    ('ID04_integer_type', '/identity_fields/*', 'an integer-domain value is an integer', 'identity declared field domain',
     "value['domain_type'] == 'integer' and value['value_type'] != 'int'"),
    ('ID05_integer_minimum', '/identity_fields/*', 'an integer value meets minimum', 'identity declared field domain',
     "value['domain_type'] == 'integer' and value['value_type'] == 'int' and value['number'] < value['bound']"),
])
phase('identity_storage', 'Identity inputs: the Storage instance is a nonempty string.', [
    ('ID06_storage_type', '/storage_instance_id', 'is a string', 'identity Storage string domain', "value['storage_type'] != 'str'"),
    ('ID07_storage_nonempty', '/storage_instance_id', 'a string Storage instance is nonempty', 'identity Storage string domain',
     "value['storage_type'] == 'str' and value['storage_nonempty'] is not True"),
])

# ===================================================================== capture route (validate_capture)
phase('capture_dispatch', 'Capture: adapter and family dispatch.', [
    ('CA01_adapter', '/capture/adapter', 'equals the family semantic adapter id', 'adapter dispatch', "value['adapter'] != value['adapter_id']"),
    ('CA02_family', '/capture/family', 'equals the contract event type', 'family dispatch', "value['family'] != value['event_type']"),
])
phase('capture_scope', 'Capture scope: Project, encoded partition and Storage root.', [
    ('SC01_project', '/capture/scope/project_id', 'equals the payload Project', 'scope Project', "value['scope_project'] != value['payload_project']"),
    ('SC02_partition', '/capture/scope/scope_partition', 'equals project~ plus the unpadded urlsafe base64 Project id', 'scope partition',
     "value['scope_partition'] != value['expected_partition']"),
    ('SC03_storage', '/capture/scope/storage_instance_id', 'equals the envelope Storage instance', 'storage root',
     "value['scope_storage'] != value['envelope_storage']"),
])
phase('capture_envelope', 'Capture envelope: each mirrored identity field equals the payload (typed).', [
    ('CE01_envelope_field', '/capture/envelope/{project_id,run_id,thread_id,attempt_id}', 'equals the payload field by canonical bytes', 'envelope',
     "value['envelope_canonical'] != value['payload_canonical']"),
])
phase('capture_episode', 'node.blocked/node.unblocked: the episode record and its attempt presence.', [
    ('EP01_episode_record', '/records/episode/body/attempt_id', 'the episode record body names attempt_id', 'source record set',
     "value['episode_attempt_present'] is not True"),
    ('EP02_attempt_presence', '/payload/attempt_id', 'equals the episode attempt (absent when the episode has none)', 'episode attempt presence',
     "value['episode_attempt_present'] is True and value['payload_attempt'] != value['episode_attempt']"),
])
phase('capture_episode_attempt', 'node.blocked/node.unblocked: the envelope omission or the joined attempt record.', [
    ('EP03_envelope_omission', '/capture/envelope/attempt_id', 'is absent before an attempt exists', 'pre-attempt envelope omission',
     "value['episode_has_attempt'] is not True and value['envelope_has_attempt'] is True"),
    ('EP04_attempt_record', '/records/attempt/body/attempt_id', 'an attempt record is present when the episode names one', 'source record set',
     "value['episode_has_attempt'] is True and value['attempt_record_present'] is not True"),
    ('EP05_attempt_join', '/records/attempt/body/attempt_id', 'equals the episode attempt', 'episode attempt record',
     "value['episode_has_attempt'] is True and value['attempt_record_present'] is True and value['record_attempt'] != value['episode_attempt']"),
])
phase('source_record', 'Capture source records: ref, owner, Project and Storage root of each slot.', [
    ('SR04_ref_type', '/records/*/ref', 'is a string', 'source ref', "value['ref_type'] != 'str'"),
    ('SR05_ref_nonempty', '/records/*/ref', 'a string ref is nonempty', 'source ref', "value['ref_type'] == 'str' and value['ref_nonempty'] is not True"),
    ('SR06_owner', '/records/*/owner', 'equals the adapter owner for the slot', 'source owner', "value['owner'] != value['expected_owner']"),
    ('SR07_project', '/records/*/project_id', 'equals the scope Project', 'source Project', "value['project'] != value['scope_project']"),
    ('SR08_storage', '/records/*/storage_instance_id', 'equals the scope Storage root', 'source root', "value['storage'] != value['scope_storage']"),
])
phase('source_revision', 'Capture source records: exact revision and its expected owner read.', [
    ('RV01_revision_type', '/records/*/revision', 'is an integer', 'source revision', "value['revision_type'] != 'int'"),
    ('RV02_revision_nonnegative', '/records/*/revision', 'an integer revision is not negative', 'source revision',
     "value['revision_type'] == 'int' and value['revision'] < 0"),
    ('RV03_expected_type', '/expected_revisions/*', 'is an integer', 'source revision', "value['expected_type'] != 'int'"),
    ('RV04_revision_join', '/records/*/revision', 'equals the expected revision by canonical bytes', 'source revision',
     "value['revision_type'] == 'int' and value['expected_type'] == 'int' and value['revision_canonical'] != value['expected_canonical']"),
])
phase('source_digest', 'Capture source records: the digest is recomputed from the body under its recipe.', [
    ('SD01_digest', '/records/*/sha256', 'equals the recomputed body digest', 'source digest', "value['declared_sha256'] != value['recomputed_sha256']"),
])
phase('source_parents', 'Capture source records: parent refs equal the joined parent records.', [
    ('SP01_parents', '/records/*/parents', 'equals the adapter parent joins to the joined records', 'source parents',
     "value['parents'] != value['expected_parents']"),
])
phase('source_join', 'Capture: each joined payload field equals its owner record field (typed).', [
    ('SJ01_source_join', '/payload/{field}', 'equals the owner record field by canonical bytes', 'source join',
     "value['payload_canonical'] != value['source_canonical']"),
])
phase('source_observation', 'Capture: the complete owner observation equals the payload, presence included.', [
    ('SO01_observation', '/payload', 'equals the complete owner observation by canonical bytes', 'complete source observation/presence',
     "value['observation_canonical'] != value['payload_canonical']"),
])
phase('capture_account', 'attempt.started: an account interpretation has its original snapshots.', [
    ('AS01_requested_snapshot', '/records/execution/body/requested_account_snapshot_id', 'is present when an account is relevant',
     'account interpretation requires original snapshots', "value['account_relevant'] is True and value['requested_snapshot'] is not True"),
    ('AS02_effective_snapshot', '/records/execution/body/effective_account_snapshot_id', 'is present when an account is relevant',
     'account interpretation requires original snapshots', "value['account_relevant'] is True and value['effective_snapshot'] is not True"),
])
phase('graph_join', 'Installed graph: node and run revisions, graph join and materialization request.', [
    ('GJ01_node_revision_type', '/records/node/body/workgraph_revision', 'is an integer', 'installed graph join', "value['node_revision_type'] != 'int'"),
    ('GJ02_node_revision_min', '/records/node/body/workgraph_revision', 'an integer revision is at least 1', 'installed graph join',
     "value['node_revision_type'] == 'int' and value['node_revision'] < 1"),
    ('GJ03_run_revision_type', '/records/run/body/workgraph_revision', 'is an integer', 'installed graph join', "value['run_revision_type'] != 'int'"),
    ('GJ04_run_revision_min', '/records/run/body/workgraph_revision', 'an integer revision is at least 1', 'installed graph join',
     "value['run_revision_type'] == 'int' and value['run_revision'] < 1"),
    ('GJ05_graph_id_join', '/records/node/body/workgraph_id', 'equals the run graph id', 'installed graph join', "value['node_graph'] != value['run_graph']"),
    ('GJ06_graph_revision_join', '/records/node/body/workgraph_revision', 'equals the run graph revision', 'installed graph join',
     "value['node_revision_type'] == 'int' and value['run_revision_type'] == 'int' and value['node_revision'] != value['run_revision']"),
    ('GJ07_request_join', '/records/node/body/source_request_id', 'equals the operation source request', 'materialization request join',
     "value['node_request'] != value['operation_request']"),
])
phase('transition_source', 'Transition: observation mirror, reserved sequence, revision and predecessor.', [
    ('TX01_observed_payload', '/transition/observed_payload', 'equals the complete owner observation', 'conditional presence/original observation',
     "value['observed_canonical'] != value['original_canonical']"),
    ('TX02_reserved_sequence', '/transition/event_sequence', 'equals the payload event_sequence', 'reserved sequence',
     "value['transition_sequence_canonical'] != value['payload_sequence_canonical']"),
    ('TX03_transition_revision', '/transition/revision', 'equals the transition record revision', 'transition revision',
     "value['transition_revision_canonical'] != value['record_revision_canonical']"),
    ('TX04_predecessor', '/transition/before', 'equals the transition record state', 'source predecessor', "value['before'] != value['record_state']"),
])
phase('transition_post', 'Transition: successor, post-state, CAS revision and sequence.', [
    ('TX05_successor', '/transition/after', 'equals the matching rule successor', 'illegal successor', "value['after'] != value['rule_after']"),
    ('TX06_post_state', '/post_state/state', 'equals the successor', 'post-state', "value['post_state'] != value['after']"),
    ('TX07_post_cas', '/post_state/revision', 'equals the transition revision plus one', 'post-state CAS',
     "value['post_revision_canonical'] != value['next_revision_canonical']"),
    ('TX08_post_sequence', '/post_state/event_sequence', 'equals the payload event_sequence', 'post-state sequence',
     "value['post_sequence_canonical'] != value['payload_sequence_canonical']"),
])
phase('post_effects', 'Transition: committed post-state effects equal the adapter effects.', [
    ('EF01_effects_object', '/post_state/effects', 'is an object', 'post-state effects', "value['observed_type'] != 'dict'"),
    ('EF02_effects_keys', '/post_state/effects', 'has exactly the adapter effect names', 'post-state effects',
     "value['observed_type'] == 'dict' and value['observed_keys'] != value['expected_keys']"),
    ('EF03_observed_types', '/post_state/effects/*', 'every observed count is an integer', 'post-state effects',
     "value['observed_type'] == 'dict' and value['observed_all_int'] is not True"),
    ('EF04_observed_nonnegative', '/post_state/effects/*', 'every integer observed count is not negative', 'post-state effects',
     "value['observed_type'] == 'dict' and value['observed_all_int'] is True and value['observed_min'] < 0"),
    ('EF05_expected_types', '/semantic_adapter/effects/*', 'every adapter count is an integer', 'post-state effects', "value['expected_all_int'] is not True"),
    ('EF06_expected_nonnegative', '/semantic_adapter/effects/*', 'every integer adapter count is not negative', 'post-state effects',
     "value['expected_all_int'] is True and value['expected_min'] < 0"),
    ('EF07_effects_equal', '/post_state/effects', 'well-typed observed effects equal the adapter effects', 'post-state effects',
     "value['observed_type'] == 'dict' and value['observed_keys'] == value['expected_keys'] and value['observed_all_int'] is True and value['expected_all_int'] is True and value['observed_pairs'] != value['expected_pairs']"),
])
phase('owner_predicate', 'Adapter owner predicates: each required owner-record value (typed).', [
    ('OP01_owner_predicate', '/records/{path}', 'equals the adapter requirement by canonical bytes', 'owner predicate',
     "value['observed_canonical'] != value['expected_canonical']"),
])
phase('publication', 'Publication ordering: admission through publish.', [
    ('PO01_trace', '/capture/trace', 'is admission, dependency_commit, body_commit, append, first_receipt, owner_cas, publish', 'publication ordering',
     "value['trace'] != ['admission', 'dependency_commit', 'body_commit', 'append', 'first_receipt', 'owner_cas', 'publish']"),
])

# --------------------------------------------------------------------- family predicates on the capture route
phase('capture_attempt_completed', 'attempt.completed: terminal state agrees with success.', [
    ('AC01_terminal_outcome', '/payload/terminal_state', 'done exactly when success is true', 'terminal outcome classification',
     "value['terminal_done'] != value['success']"),
])
phase('capture_node_blocked', 'node.blocked: pre-attempt omission and restore anchor.', [
    ('NB01_pre_attempt', '/payload/attempt_id', 'equals the episode attempt', 'pre-attempt omission', "value['payload_attempt'] != value['episode_attempt']"),
    ('NB02_restore_safe_point', '/payload/safe_point_id', 'is present when a safe-point restore is required', 'restore anchor',
     "value['restore_required'] is True and value['safe_point_present'] is not True"),
    ('NB03_restore_anchor', '/payload/anchor_ref', 'is present when a safe-point restore is required', 'restore anchor',
     "value['restore_required'] is True and value['anchor_present'] is not True"),
])
phase('capture_node_unblocked', 'node.unblocked: resolution evidence and barrier.', [
    ('NU01_resolution', '/records/episode/body/resolution', 'equals the payload resolution', 'resolution evidence',
     "value['body_resolution'] != value['payload_resolution']"),
    ('NU02_restore_barrier', '/records/episode/body/restore_result', 'a safe-point restore is committed', 'resolution barrier',
     "value['payload_resolution'] == 'safe_point_restored' and value['restore_result'] != 'committed'"),
    ('NU03_prerequisite_barrier', '/records/episode/body/prerequisite_state', 'any other resolution has a resolved prerequisite', 'resolution barrier',
     "value['payload_resolution'] != 'safe_point_restored' and value['prerequisite_state'] != 'resolved'"),
])
phase('remediation_records', 'remediation.*: lineage records for parent, child and root.', [
    ('RM01_child_not_parent', '/payload/child_attempt_id', 'differs from the parent attempt', 'child is parent', "value['child'] == value['parent']"),
    ('RM02_parent_record', '/records/parent_attempt/body/attempt_id', 'equals the payload parent attempt', 'parent attempt record',
     "value['parent'] != value['parent_record']"),
    ('RM03_child_record', '/records/child_attempt/body/attempt_id', 'equals the payload child attempt', 'child attempt record',
     "value['child'] != value['child_record']"),
    ('RM04_root_record', '/records/root/body/remediation_root_id', 'equals the payload root', 'remediation root record', "value['root'] != value['root_record']"),
])
phase('remediation_generation', 'remediation.*: generation within the lineage ceiling.', [
    ('RM05_generation_type', '/records/lineage/body/generation', 'is an integer', 'remediation ceiling', "value['generation_type'] != 'int'"),
    ('RM06_ceiling_type', '/records/lineage/body/ceiling', 'is an integer', 'remediation ceiling', "value['ceiling_type'] != 'int'"),
    ('RM07_within_ceiling', '/records/lineage/body/generation', 'an integer generation is at most the integer ceiling', 'remediation ceiling',
     "value['generation_type'] == 'int' and value['ceiling_type'] == 'int' and value['generation'] > value['ceiling']"),
    ('RM08_normalized_generation', '/records/lineage/body/remediation_generation', 'equals the lineage generation', 'normalized remediation generation',
     "value['generation_canonical'] != value['normalized_canonical']"),
    ('RM09_payload_ceiling', '/payload/remediation_generation', 'is at most the lineage ceiling', 'joined remediation generation ceiling',
     "value['payload_generation'] > value['ceiling']"),
])
phase('remediation_fixed', 'remediation.resolved: fixed requires a successful child.', [
    ('RM10_fixed_child', '/records/lineage/body/child_result', 'is done when the resolution is fixed', 'fixed without successful child',
     "value['fixed'] is True and value['child_result'] != 'done'"),
])

# --------------------------------------------------------------------- retry/backoff (EP-032, SP-238)
phase('retry_identity', 'Retry: classification, error identity and attempt joins.', [
    ('RT01_retry_class', '/records/retry/body/failure_class', 'equals the payload class', 'retry classification', "value['retry_class'] != value['payload_class']"),
    ('RT02_failure_class', '/records/failure/body/failure_class', 'equals the payload class', 'retry classification', "value['payload_class'] != value['failure_class']"),
    ('RT03_error_identity', '/records/retry/body/error_id', 'equals the failure error id', 'per-error counter identity', "value['retry_error'] != value['failure_error']"),
    ('RT08_failed_attempt', '/records/failure/body/attempt_id', 'equals the failed attempt record', 'original failed attempt',
     "value['failure_attempt'] != value['attempt_record']"),
    ('RT09_prior_attempt', '/records/retry/body/prior_attempt_id', 'run.node_retry_scheduled: equals the failed attempt', 'classified prior attempt',
     "value['retry_scheduled'] is True and value['prior_attempt'] != value['failure_attempt']"),
])
phase('retry_counter', 'Retry: the original per-error counter.', [
    ('RT04_used_type', '/records/retry/body/used', 'is an integer', 'original per-error retry counter', "value['used_type'] != 'int'"),
    ('RT05_count_type', '/records/failure/body/retry_count_before', 'is an integer', 'original per-error retry counter', "value['count_type'] != 'int'"),
    ('RT06_used_nonnegative', '/records/retry/body/used', 'an integer counter is not negative', 'original per-error retry counter',
     "value['used_type'] == 'int' and value['used'] < 0"),
    ('RT07_used_join', '/records/retry/body/used', 'equals the failure retry_count_before', 'original per-error retry counter',
     "value['used_type'] == 'int' and value['count_type'] == 'int' and value['used'] != value['count_before']"),
])
phase('retry_storage', 'Retry storage_io: the SP-238 adapter class.', [
    ('RS01_storage_join', '/records/failure/body/storage_io_class', 'equals the retry Storage class', 'original Storage classification',
     "value['failure_storage'] != value['retry_storage']"),
    ('RS02_storage_class', '/records/failure/body/storage_io_class', 'is interrupted or transient_busy', 'Storage retry class',
     "value['failure_storage'] not in ('interrupted', 'transient_busy')"),
    ('RS03_no_new_attempt', '/records/retry/body/new_executor_attempt', 'is false', 'Storage adapter retry cannot create an Executor attempt',
     "value['new_attempt'] is not False"),
    ('RS04_no_successor', '/records/retry/body/successor_attempt_id', 'is null', 'Storage adapter retry cannot create an Executor attempt',
     "value['successor'] is not None"),
])
phase('retry_foreign_storage', 'Retry Executor classes: no Storage adapter class.', [
    ('RF01_retry_storage_null', '/records/retry/body/storage_io_class', 'is null', 'foreign Storage policy', "value['retry_storage'] is not None"),
    ('RF02_failure_storage_null', '/records/failure/body/storage_io_class', 'is null', 'foreign Storage policy', "value['failure_storage'] is not None"),
])
phase('retry_limit', 'Retry: owner provenance, exact limit, budget and ordinal.', [
    ('RL01_policy_owner', '/records/retry/body/policy_owner_ref', 'names the classified owner policy', 'classified owner policy provenance',
     "value['policy_owner_ref'] != value['policy_owner']"),
    ('RL02_limit_type', '/records/retry/body/limit', 'is an integer', 'exact classified retry limit', "value['limit_type'] != 'int'"),
    ('RL03_limit_value', '/records/retry/body/limit', 'an integer limit equals the classified limit', 'exact classified retry limit',
     "value['limit_type'] == 'int' and value['limit'] != value['expected_limit']"),
    ('RL04_budget', '/records/retry/body/used', 'is below the limit', 'per-error retry budget',
     "value['limit_type'] == 'int' and value['limit'] == value['expected_limit'] and value['used'] >= value['limit']"),
    ('RL05_ordinal', '/payload/retry_count', 'equals used plus one when present', 'classified retry ordinal',
     "value['has_retry_count'] is True and value['retry_count'] != value['next_count']"),
])
phase('retry_clocks', 'Retry: received <= failed <= scheduled <= observed.', [
    ('RK01_received_failed', '/records/failure/body/response_received_at_utc', 'is not after the failure', 'original failure/scheduling clocks',
     lt('failed', 'received')),
    ('RK02_failed_scheduled', '/records/failure/body/failed_at_utc', 'is not after scheduling', 'original failure/scheduling clocks',
     lt('scheduled', 'failed')),
    ('RK03_scheduled_observed', '/records/retry/body/scheduled_at_utc', 'is not after the observation', 'original failure/scheduling clocks',
     lt('observed', 'scheduled')),
])
phase('retry_refresh_clocks', 'Retry auth_expired: failed <= refresh completed <= client rebuilt <= scheduled.', [
    ('RA03_failed_refresh', '/records/failure/body/refresh/completed_at_utc', 'is not before the failure', 'refresh and client rebuild before retry',
     lt('completed', 'failed')),
    ('RA04_refresh_rebuild', '/records/failure/body/refresh/client_rebuilt_at_utc', 'is not before the refresh', 'refresh and client rebuild before retry',
     lt('rebuilt', 'completed')),
    ('RA05_rebuild_scheduled', '/records/retry/body/scheduled_at_utc', 'is not before the client rebuild', 'refresh and client rebuild before retry',
     lt('scheduled', 'rebuilt')),
])
phase('retry_ownership', 'Retry: Retry-After and refresh belong to their classes.', [
    ('RX01_retry_after_owner', '/records/failure/body/retry_after_header', 'is null outside rate_limited', 'Retry-After belongs to rate_limited',
     "value['rate_limited'] is not True and value['header'] is not None"),
    ('RX02_refresh_owner', '/records/failure/body/refresh', 'is null outside auth_expired', 'refresh belongs to auth_expired',
     "value['auth_expired'] is not True and value['refresh'] is not None"),
])
phase('retry_deadline', 'Retry: the classified deadline, timed backoff and timer joins.', [
    ('RE01_deadline', '/records/retry/body/backoff_until_utc', 'equals scheduled plus the classified delay', 'original classified retry deadline',
     "value['until'] != value['expected_until']"),
    ('RE02_timed_backoff', '/records/retry/body/backoff_until_utc', 'backoff families have a positive delay', 'classified policy has no timed backoff',
     "value['backoff_family'] is True and value['delay'][0] <= 0"),
    ('RE03_timer_elapsed', '/payload/ts', 'run.node_backoff_expired: is not before the deadline', 'early timer',
     "value['expired_family'] is True and " + lt('observed', 'until')),
    ('RE04_start_timer_join', '/payload/backoff_until_utc', 'run.node_backoff_started: equals the original deadline', 'original start timer join',
     "value['started_family'] is True and value['payload_until'] != value['until']"),
    ('RE05_deadline_after_observed', '/payload/backoff_until_utc', 'run.node_backoff_started: is not before the observation', 'backoff deadline',
     "value['started_family'] is True and value['payload_until'] == value['until'] and " + lt('until', 'observed')),
])

# --------------------------------------------------------------------- scheduler.pass (EP-225)
phase('score_priority', 'Scheduler score tuples: manual_priority is an integer 0..100.', [
    ('SD01_priority_type', '/**/manual_priority', 'is an integer', 'scheduler manual_priority integer 0..100', "value['priority_type'] != 'int'"),
    ('SD02_priority_min', '/**/manual_priority', 'an integer priority is at least 0', 'scheduler manual_priority integer 0..100',
     "value['priority_type'] == 'int' and value['priority'] < 0"),
    ('SD03_priority_max', '/**/manual_priority', 'an integer priority is at most 100', 'scheduler manual_priority integer 0..100',
     "value['priority_type'] == 'int' and value['priority'] > 100"),
])
phase('scheduler_selection', 'scheduler.pass: source selection, unique candidates, partition and capacity.', [
    ('SH01_source_selection', '/records/scheduler/body/selected_nodes', 'equals the payload selection by canonical bytes', 'scheduler source selection',
     "value['source_selected_canonical'] != value['payload_selected_canonical']"),
    ('SH02_unique_ready', '/payload/ready_nodes', 'ready node ids are unique', 'duplicate candidate', "value['ready_unique'] is not True"),
    ('SH03_unique_partition', '/payload/selected_nodes', 'selected and non-selected ids are unique together', 'duplicate candidate',
     "value['partition_unique'] is not True"),
    ('SH04_partition', '/payload/selected_nodes', 'selected plus non-selected equals the ready set', 'candidate partition',
     "value['ready_unique'] is True and value['partition_unique'] is True and value['ready_ids'] != value['partition_ids']"),
    ('SH05_capacity', '/payload/available_slots', 'fills min(ready, available_slots)', 'fill available capacity',
     "value['selected_count'] != value['fill_count']"),
])
phase('scheduler_order', 'scheduler.pass: score ordering and each selected score tuple.', [
    ('SH06_order', '/payload/selected_nodes', 'are the first ready nodes in score order', 'score ordering', "value['selected_ids'] != value['ordered_ids']"),
])
phase('scheduler_selected', 'scheduler.pass: each selected node carries its ready score tuple and lane.', [
    ('SH07_score_tuple', '/payload/selected_nodes/*/score_tuple', 'equals the ready score tuple by canonical bytes', 'selected score',
     "value['score_canonical'] != value['ready_canonical']"),
    ('SH08_lane', '/payload/selected_nodes/*/lane', 'equals the ready scheduler lane', 'selected score', "value['lane'] != value['ready_lane']"),
])
phase('scheduler_wake_types', 'scheduler.pass: wake list and wake identities.', [
    ('WK01_wakes_list', '/records/scheduler/body/wakes', 'is a list', 'scheduler wake identity/clock types', "value['wakes_type'] != 'list'"),
    ('WK02_wake_objects', '/records/scheduler/body/wakes/*', 'every wake is an object', 'scheduler wake identity/clock types',
     "value['wakes_type'] == 'list' and value['all_objects'] is not True"),
    ('WK03_wake_ids', '/records/scheduler/body/wakes/*/event_id', 'every wake event id is a nonempty string', 'scheduler wake identity/clock types',
     "value['wakes_type'] == 'list' and value['all_objects'] is True and value['all_ids'] is not True"),
])
phase('scheduler_wakes', 'scheduler.pass: primary, coalesced and recovery wakes.', [
    ('WK04_wake_present', '/records/scheduler/body/wakes', 'has at least one wake', 'primary wake', "value['wake_count'] < 1"),
    ('WK05_primary_wake', '/payload/wake_reason', 'equals the earliest wake reason', 'primary wake',
     "value['wake_count'] >= 1 and value['wake_reason'] != value['primary_reason']"),
    ('WK06_coalesced', '/payload/coalesced_wake_reasons', 'equals the later wake reasons in order', 'coalesced wakes',
     "value['coalesced'] != value['later_reasons']"),
    ('WK07_wake_refs', '/payload/wake_event_refs', 'equals the later wake event ids in order', 'wake event joins', "value['wake_refs'] != value['later_ids']"),
    ('WK08_recovered_type', '/records/scheduler/body/recovered', 'is a boolean', 'scheduler recovered boolean', "value['recovered_type'] != 'bool'"),
])
phase('scheduler_recovery', 'scheduler.pass: recovery and watchdog wake reasons.', [
    ('WK09_recovery_wake', '/payload/wake_reason', 'is startup_recovered after recovery', 'first recovery wake',
     "value['recovered'] is True and value['wake_reason'] != 'startup_recovered'"),
    ('WK10_watchdog', '/records/scheduler/body/wakes/*/reason', 'a watchdog recheck has only watchdog wakes', 'watchdog pending event',
     "value['wake_reason'] == 'watchdog_recheck' and value['all_watchdog'] is not True"),
])

# ===================================================================== dependencies (validate_dependencies)
phase('dependency_ref', 'Dependencies: the payload names the resolved ref.', [
    ('DR01_payload_ref', '/payload/{field}', 'equals the dependency ref', 'dependency payload ref', "value['payload_ref'] != value['ref']"),
])
phase('dependency_custody', 'Dependencies: scope, Storage root, recomputed digest and deletion.', [
    ('DC01_scope', '/dependencies/*/project_id', 'equals the payload Project', 'dependency scope', "value['project'] != value['payload_project']"),
    ('DC02_root', '/dependencies/*/storage_instance_id', 'equals the scope Storage root', 'dependency root', "value['storage'] != value['scope_storage']"),
    ('DC03_digest', '/dependencies/*/sha256', 'equals the recomputed body digest', 'dependency hash', "value['declared_sha256'] != value['recomputed_sha256']"),
    ('DC04_not_deleted', '/dependencies/*/deleted_at', 'is null', 'deleted dependency', "value['deleted_at'] is not None"),
])
phase('dependency_subject', 'Dependencies: runtime/context subject and identity joins (typed).', [
    ('DJ01_subject', '/dependencies/*/body/{project_id,run_id,thread_id,node_id,attempt_id}', 'equals the payload field', 'runtime subject',
     "value['dependency_canonical'] != value['payload_canonical']"),
])
phase('dependency_identity', 'Dependencies: runtime identity joins to the execution record (typed).', [
    ('DJ02_identity', '/dependencies/*/body/{context_join_fields}', 'equals the execution record field', 'runtime identity',
     "value['dependency_canonical'] != value['execution_canonical']"),
])
phase('dependency_resolution', 'Dependencies: every payload ref field is resolved.', [
    ('DR02_complete', '/dependency_refs', 'names exactly the payload ref fields', 'complete dependency resolution',
     "value['resolved_fields'] != value['reference_fields']"),
])

# ===================================================================== retained history (validate_history)
phase('history_custody', 'Retained reader: original source custody and identity.', [
    ('HI01_source_custody', '/retained_source_sha256', 'equals the digest of the complete original', 'retained original source custody',
     "value['original_digest'] != value['retained_sha256']"),
    ('HI02_custody_identity', '/custody/stored_identity', 'equals the recomputed original identity', 'retained original identity',
     "value['custody_identity'] != value['identity']"),
    ('HI03_disclosure_identity', '/disclosure/stored_identity', 'equals the recomputed original identity', 'retained original identity',
     "value['disclosure_identity'] != value['identity']"),
])
phase('history_disclosure', 'Retained reader: current disclosure fences.', [
    ('HD01_reader_active', '/disclosure/reader_active', 'is true', 'reader_withdrawn', "value['reader_active'] is not True"),
    ('HD02_source_available', '/disclosure/source_available', 'is true', 'source_unavailable', "value['source_available'] is not True"),
    ('HD03_event_not_deleted', '/disclosure/event_deleted_at', 'is null', 'event_deleted', "value['event_deleted_at'] is not None"),
])
phase('history_scope', 'Retained reader: disclosure Project and Storage root.', [
    ('HD04_project', '/disclosure/project_id', 'equals the payload Project', 'history Project', "value['project'] != value['payload_project']"),
    ('HD05_storage', '/disclosure/storage_instance_id', 'equals the original Storage root', 'history Storage root',
     "value['storage'] != value['original_storage']"),
])

# ===================================================================== receipt/replay model (run_trace)
phase('trace_operation', 'Trace model: a known operation.', [
    ('TO01_known_operation', '/operations/*/op', 'is a modeled operation', 'unknown trace operation',
     "value['op'] not in ('append', 'replay', 'crash', 'lose_custody', 'withdraw_writer', 'withdraw_reader', 'compact', 'refresh_token', 'read', 'rebuild')"),
])
phase('trace_existing', 'Trace model: a known identity resolves its first receipt.', [
    ('TA01_custody_available', '/rows/{identity}', 'the stored first-receipt custody is available', 'dedupe_unavailable', "value['custody_available'] is not True"),
    ('TA02_same_body', '/rows/{identity}/digest', 'a retry carries the original semantic body', 'idempotency_conflict',
     "value['custody_available'] is True and value['prior_digest'] != value['digest']"),
])
phase('trace_new', 'Trace model: a new identity needs an open writer and an append.', [
    ('TA03_writer_open', '/writer', 'is open', 'writer_withdrawn', "value['writer_open'] is not True"),
    ('TA04_replay_original', '/op', 'a replay has an original', 'missing_original', "value['writer_open'] is True and value['op'] == 'replay'"),
])
phase('trace_read', 'Trace model: reader fence and token currency.', [
    ('TR02_reader_active', '/reader', 'is active', 'reader_withdrawn', "value['reader_active'] is not True"),
    ('TR03_token_current', '/token', 'equals the current generation and frontier', 'stale_token',
     "value['reader_active'] is True and value['token'] != value['current']"),
])
phase('trace_rebuild', 'Trace model: rebuild needs every first-receipt custody.', [
    ('TB01_rows_present', '/rows', 'is not empty', 'source_unavailable', "value['row_count'] < 1"),
    ('TB02_custody_complete', '/rows/*', 'every row has custody', 'source_unavailable', "value['row_count'] >= 1 and value['all_custody'] is not True"),
])

# ===================================================================== shape oracle (pm_executor_event_contracts.validate)
phase('shape_flags', 'Shape oracle: synthetic predicate flags are exactly true.', [
    ('SF02_admitted', '/context/admitted', 'is true', 'admitted', "value['admitted'] is not True"),
    ('SF03_source_refs', '/context/source_refs_valid', 'is true', 'source_refs_valid', "value['source_refs_valid'] is not True"),
    ('SF04_read_authorized', '/context/read_authorized', 'is true', 'read_authorized', "value['read_authorized'] is not True"),
    ('SF05_receipt', '/context/receipt_available', 'is true', 'receipt_available', "value['receipt_available'] is not True"),
    ('SF06_predicate', '/context/predicate_valid', 'is true', 'predicate_valid', "value['predicate_valid'] is not True"),
])
phase('shape_fences', 'Shape oracle: writer withdrawal and deletion fences are exactly false.', [
    ('SF07_writer', '/context/writer_withdrawn', 'is false', 'withdrawal/deletion fence', "value['writer_withdrawn'] is not False"),
    ('SF08_deletion', '/context/deletion_fenced', 'is false', 'withdrawal/deletion fence', "value['deletion_fenced'] is not False"),
])
phase('shape_joins', 'Shape oracle: Project and generation joins.', [
    ('SJ02_project', '/payload/project_id', 'equals the current Project', 'Project join', "value['payload_project'] != value['current_project']"),
    ('SJ03_generation', '/payload/replan_generation', 'equals the current generation by canonical bytes', 'generation join',
     "value['payload_generation_canonical'] != value['current_generation_canonical']"),
])
phase('shape_source_field', 'Shape oracle: each source-joined payload field equals its expected source (typed).', [
    ('SJ04_source_field', '/payload/{attempt_id,blocked_sequence,remediation_parent_attempt_id}', 'equals the expected source value', 'source join',
     "value['payload_canonical'] != value['expected_canonical']"),
])
phase('shape_binding', 'Shape oracle: each identity/ref payload field equals its canonical source binding (typed).', [
    ('SB01_binding', '/context/source_bindings/{field}', 'equals the payload field', 'canonical source binding:',
     "value['binding_canonical'] != value['payload_canonical']"),
])
phase('shape_envelope', 'Shape oracle: each mirrored envelope field equals the payload (typed).', [
    ('SE01_envelope', '/context/envelope/{field}', 'equals the payload field', 'envelope binding:',
     "value['envelope_canonical'] != value['payload_canonical']"),
])
phase('shape_family', 'Shape oracle: family source predicates (one row per family predicate).', [
    ('SX01_node_completion', '/context/source_facts/node_state', 'node.completed: verified for done, else verify_pending', 'node completion source state',
     "value['family'] == 'node.completed' and value['node_state'] != value['expected_node_state']"),
    ('SX02_fixed_child', '/context/source_child_success', 'remediation.resolved fixed: the child succeeded', 'fixed without child success',
     "value['family'] == 'remediation.resolved' and value['fixed'] is True and value['child_success'] is not True"),
    ('SX03_child_parent', '/payload/child_attempt_id', 'remediation.spawned: differs from the parent', 'child is parent',
     "value['family'] == 'remediation.spawned' and value['child'] == value['parent']"),
    ('SX04_backoff_order', '/payload/backoff_until_utc', 'run.node_backoff_started: not before ts', 'backoff before recorded observation',
     "value['family'] == 'run.node_backoff_started' and " + lt('until', 'ts')),
    ('SX05_graph_unlocked', '/context/graph_locked', 'plan.decomposition_degraded: is false', 'graph already locked',
     "value['family'] == 'plan.decomposition_degraded' and value['graph_locked'] is not False"),
    ('SX06_packaging', '/context/packaging_passed', 'run.completed: is true', 'Document Set packaging',
     "value['family'] == 'run.completed' and value['packaging_passed'] is not True"),
    ('SX07_backoff_elapsed', '/context/now_utc', 'run.node_backoff_expired: not before the deadline', 'backoff not elapsed',
     "value['family'] == 'run.node_backoff_expired' and " + lt('now', 'context_until')),
])
phase('shape_family_b', 'Shape oracle: retry, terminal and restore-anchor family predicates.', [
    ('SX08_retryable', '/payload/failure_class', 'backoff_started/retry_scheduled: a retryable class', 'non-retryable failure',
     "value['retry_family'] is True and value['failure_class'] in ('graph_integrity', 'verification_failed', 'reviewer_findings', 'quota_exceeded')"),
    ('SX09_terminal', '/payload/terminal_state', 'attempt.completed: done exactly when success', 'terminal success/failure mismatch',
     "value['family'] == 'attempt.completed' and value['terminal_done'] != value['success']"),
    ('SX10_restore_safe_point', '/payload/safe_point_id', 'node.blocked restore: a safe point is named', 'missing restore anchor',
     "value['family'] == 'node.blocked' and value['restore_required'] is True and value['safe_point_present'] is not True"),
    ('SX11_restore_anchor', '/payload/anchor_ref', 'node.blocked restore: an anchor is named', 'missing restore anchor',
     "value['family'] == 'node.blocked' and value['restore_required'] is True and value['anchor_present'] is not True"),
])
phase('shape_scheduler', 'Shape oracle scheduler.pass: unique candidates, partition, capacity, order and score joins.', [
    ('SY01_unique_ready', '/payload/ready_nodes', 'ready ids are unique', 'duplicate node', "value['ready_unique'] is not True"),
    ('SY02_unique_partition', '/payload/selected_nodes', 'selected and non-selected ids are unique together', 'duplicate node',
     "value['partition_unique'] is not True"),
    ('SY03_partition', '/payload/selected_nodes', 'selected plus non-selected equals the ready set', 'capacity/partition',
     "value['ready_unique'] is True and value['partition_unique'] is True and value['ready_ids'] != value['partition_ids']"),
    ('SY04_capacity', '/payload/available_slots', 'selects at most available_slots', 'capacity/partition',
     "value['selected_count'] > value['available_slots']"),
    ('SY05_order', '/payload/selected_nodes', 'are the first ready nodes in score order', 'selection order', "value['selected_ids'] != value['ordered_ids']"),
])
phase('shape_scheduler_selected', 'Shape oracle scheduler.pass: each selected score tuple and lane.', [
    ('SY06_score_tuple', '/payload/selected_nodes/*/score_tuple', 'equals the ready score tuple', 'score join', "value['score_tuple'] != value['ready_tuple']"),
    ('SY07_lane', '/payload/selected_nodes/*/lane', 'equals the score tuple lane', 'score join', "value['lane'] != value['tuple_lane']"),
])

# ===================================================================== static fixture routes
phase('fixture_route', 'Fixture dispatch: known type route, numeric boundary and helper.', [
    ('FR01_type_route', '/type_cases/*/route', 'is capture, history or shape', 'unknown type fixture route', "value['kind'] == 'type_route' and value['name'] not in ('capture', 'history', 'shape')"),
    ('FR02_numeric_boundary', '/numeric_cases/*/boundary', 'is identity, digest, canonical or payload_bytes', 'unknown numeric boundary',
     "value['kind'] == 'numeric_boundary' and value['name'] not in ('identity', 'digest', 'canonical', 'payload_bytes')"),
])


# ===================================================================== CLI fixture integrity
phase('integrity_closure', 'Fixture integrity: the semantic fixture families are exactly the selected contracts.', [
    ('IF01_family_closure', '/families', 'equals the selected contract families', 'fixture family closure',
     "value['fixture_families'] != value['contract_families']"),
])
phase('integrity_type_case', 'Fixture integrity: a type case changes exactly one observation.', [
    ('IF02_single_change', '/type_cases/*/changes', 'has exactly one change', 'single type defect', "value['change_count'] != 1"),
])
phase('integrity_seed', 'Fixture integrity: a negative is its named valid seed plus its declared defect.', [
    ('IF03_capture_seed', '/cases/*/seed_changes', 'seed plus defect changes encodes to the negative', 'coherent negative seed',
     "value['kind'] == 'capture' and value['rebuilt'] != value['specimen']"),
    ('IF04_disclosure_seed', '/history_cases/*/seed_disclosure', 'seed disclosure plus defect changes encodes to the disclosure', 'coherent disclosure seed',
     "value['kind'] == 'disclosure' and value['rebuilt'] != value['specimen']"),
    ('IC08_shape_seed', '/cases/*/seed', 'shape seed plus defect changes encodes to the case', 'coherent shape seed',
     "value['kind'] == 'shape' and value['rebuilt'] != value['specimen']"),
])
phase('integrity_numeric', 'Numeric boundary cases: golden result and spelling-independent result.', [
    ('IF05_numeric_golden', '/numeric_cases/*/expected_value', 'equals the recomputed result', 'numeric golden bytes/hash',
     "value['has_golden'] is True and value['observed'] != value['golden']"),
    ('IF06_numeric_spelling', '/numeric_cases/*/spelling', 'gives the same result as its canonical spelling', 'numeric spelling canonical result',
     "value['actual'] != value['control']"),
])
phase('integrity_contract_set', 'Contract integrity: sixteen distinct prepared families.', [
    ('IC01_family_count', '/families', 'has sixteen families', 'sixteen Executor families', "value['family_count'] != 16"),
    ('IC02_unique_families', '/families/*/event_type', 'are distinct', 'distinct Executor families', "value['distinct_count'] != value['family_count']"),
])
phase('integrity_contract', 'Contract integrity: unadmitted draft, closed schema, paired fixtures.', [
    ('IC03_unadmitted', '/families/*/event_type', 'is not on the event family registry', 'Draft must remain unadmitted', "value['admitted'] is True"),
    ('IC05_closed_schema', '/schema_ref/additionalProperties', 'is exactly false', 'closed payload schema', "value['additional_properties'] is not False"),
    ('IC06_accept_fixture', '/fixtures', 'has an accepted shape case', 'paired shape fixtures', "value['accept_cases'] < 1"),
    ('IC07_reject_fixture', '/fixtures', 'has a rejected shape case', 'paired shape fixtures', "value['reject_cases'] < 1"),
])
phase('identity_replay', 'Identity recipe: event_sequence is identity-bearing.', [
    ('IR02_sequence_bearing', '/identity_fields', 'a changed event_sequence gives a different identity', 'identity replay recipe',
     "value['sequence_changed_identity'] == value['identity']"),
])
phase('identity_replay_fixed', 'Identity recipe self-checks no input can refuse (pure-function properties; reported unprovable).', [
    ('IR01_metadata_neutral', '/ts', 'a changed observation time keeps the identity', 'identity replay recipe',
     "value['metadata_changed_identity'] != value['identity']"),
    ('IR03_storage_bound', '/storage_instance_id', 'another Storage instance gives another event id', 'identity replay recipe',
     "value['other_storage_event_id'] == value['identity'][1]"),
    ('IR04_deterministic', '/identity', 'recomputing the identity resolves the stored first receipt', 'identity replay recipe',
     "value['recomputed_identity'] != value['identity']"),
    ('IR05_body_digest', '/ts', 'a changed observation time changes the body digest', 'identity replay recipe',
     "value['metadata_changed_digest'] == value['digest']"),
])


HEADER = '''"""DX guard table {phase}: {doc}

Method B guard rows for the DX checkers, generated by
scripts/pm-executor-table-generate.py. Each predicate reads one observation
record that the checker derives from the complete boundary input (recomputed
digests and identities, canonical bytes, resolved routes, presence); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm_executor_event_semantics.py:refuse), and the full
semantic CLI asserts that the factory requires its rows in table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g
'''


def fields_of(rows):
    import re
    found = []
    for row in rows:
        for name in re.findall(r"value\['([a-z0-9_]+)'\]", row[4]):
            if name not in found:
                found.append(name)
    return tuple(found)


def render(name, doc, rows):
    out = [HEADER.format(phase=name, doc=doc)]
    out.append('FIELDS = ' + repr(fields_of(rows)) + '\n')
    for row in rows:
        out.append(f'\n\ndef {row[0]}(value, context):\n    return {row[3]!r} if {row[4]} else None\n')
    out.append('\n\ndef case(value):\n    context = None\n    table = g.GuardTable([\n')
    for row in rows:
        out.append(f'        g.Guard({row[0]!r}, g.Invariant({row[1]!r}, {row[2]!r}), {row[3]!r}, {row[0]}),\n')
    out.append('    ])\n\n    def check(value):\n')
    for row in rows:
        out.append(f'        table.require({row[0]!r}, value, context)\n')
    out.append('        return True\n    return g.Case(table, check, context)\n')
    return ''.join(out)


def main():
    check = '--check' in sys.argv[1:]
    wanted = {OUT / (PREFIX + name + '.py'): render(name, *spec) for name, spec in PHASES.items()}
    problems = []
    for path, text in wanted.items():
        if check:
            if not path.exists() or path.read_text() != text:
                problems.append('stale or missing ' + path.name)
        else:
            path.write_text(text)
    for path in OUT.glob(PREFIX + '*.py'):
        if path not in wanted:
            problems.append('extra ' + path.name)
            if not check:
                path.unlink()
                problems.pop()
    rows = sum(len(spec[1]) for spec in PHASES.values())
    print({'status': 'fail' if problems else 'pass', 'tables': len(PHASES), 'rows': rows, 'problems': problems})
    return 1 if problems else 0


if __name__ == '__main__':
    raise SystemExit(main())
