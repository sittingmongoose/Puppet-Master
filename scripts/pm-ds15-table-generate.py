#!/usr/bin/env python3
"""Write the DS15 Method B phase-table modules (scripts/pm_ds15_table_*.py) from one row spec.

Usage: python3 scripts/pm-ds15-table-generate.py scripts          (write)
       python3 scripts/pm-ds15-table-generate.py scripts --check  (exit 1 on a stale or extra module)

Spec rows: (name, field, words, code, condition). The condition is the refusal condition over the
phase observation `value`, which holds exactly the module's FIELDS. One module per phase table, at
most seven rows each, so the shared tool certifies small modules. The generated modules are the
checked-in source; edit a row here, regenerate and commit both. Both DS15 checkers
(pm-ds15-event-contracts.py and pm-ds15-deck2-contracts.py) refuse only through these rows.
"""
import sys
from pathlib import Path

PREFIX = 'pm_ds15_table_'
MODULES = {}
NUMBERLESS = set()


def module(name, doc, rows):
    assert name not in MODULES, name
    assert 1 <= len(rows) <= 7, (name, len(rows))
    assert len({r[0] for r in rows}) == len(rows), name
    MODULES[name] = (doc, rows)


def schema(name, subject, number):
    """One schema occurrence: the complete stock verdict, then its number rule.

    number=None: the schema declares no integer slot and accepts no number at any position,
    so the number rule is vacuous; its errors (none can occur) still count in the verdict row.
    """
    tag = name.upper().replace('SCH_', '')
    if number is None:
        module(name, f'Schema occurrence: {subject}.', [
            (f'{tag}_schema', '/schema_errors',
             f'{subject} validates (closed Draft 2020-12, full-match patterns, eager $ref closure; it declares no '
             'integer slot, so CV-1100 slot admission adds nothing)', name + '_schema',
             "value['schema_errors'] + value['number_errors'] != 0"),
        ])
        NUMBERLESS.add(name)
        return
    words = {'slot': 'CV-1100: every schema integer slot admits only an exact integer within its own bounds '
                     '(storage_uint64 for Storage metadata), checked after the stock schema accepts',
             'v1': 'the retained original is inside the frozen ds15-v1 integer domain (no float, '
                   '-2^63..2^64-1), checked after the stock schema accepts'}[number]
    module(name, f'Schema occurrence: {subject}.', [
        (f'{tag}_schema', '/schema_errors',
         f'{subject} validates (closed Draft 2020-12, full-match patterns, eager $ref closure)', name + '_schema',
         "value['schema_errors'] != 0"),
    ])
    module(name + '_n', f'Schema occurrence number rule: {subject} (after the stock schema accepts).', [
        (f'{tag}_numbers', '/number_errors', words, name + '_numbers', "value['number_errors'] != 0"),
    ])


# ------------------------------------------------------------------ schema occurrences
schema('sch_payload', 'the family payload of a current write', 'slot')
schema('sch_payload_v1', 'the retained original payload', 'v1')
schema('sch_context', 'the current exact-family authority context (all required members)', 'slot')
schema('sch_context_retained', 'the current authority context of a retained read (scope and owner authorization required)', 'slot')
schema('sch_context_v1', 'the retained original transition context', 'v1')
schema('sch_envelope', 'a current EventRecord envelope', 'slot')
schema('sch_envelope_v1', 'the EventRecord envelope a retained read returns', 'v1')
schema('sch_original_event', 'the retained original EventRecord', 'v1')
schema('sch_id_fields', 'each identity field and the scope against its payload property schema (current)', 'slot')
schema('sch_id_fields_v1', 'each identity field and the scope of a retained original against its payload property schema', 'v1')
schema('sch_receipt', 'the first AppendReceipt of the retained original', 'v1')
schema('sch_custody', 'the custody_v2 record of the retained original', 'v1')
schema('sch_result', 'the issued full_value_result of the retained original', 'v1')
schema('sch_owner_record', 'the browser owner record parsed from the owner bank', 'slot')
schema('sch_app_source', 'the OriginalBrowserTransitionSource', 'slot')
schema('sch_evidence', 'the original-evidence carrier with its operation-specific required members', 'slot')
schema('sch_index_inputs', 'the selected global source and its index rows', 'slot')
schema('sch_checkpoint', 'the proposed checkpoint value', 'slot')
schema('sch_prior_checkpoint', 'the stored previous checkpoint value', 'slot')
schema('sch_value', 'a DS15 stored value (dev session record v2, preview state v2, capture chip v2)', 'slot')
schema('sch_migration_inputs', 'a migration source and its evidence', 'slot')
schema('sch_d2_context', 'the current deck-2 original transition context', None)
schema('sch_d2_context_retained', 'the current deck-2 context of a retained read', None)
schema('sch_d2_context_v1', 'the retained deck-2 original transition context', None)
schema('sch_d2_source', 'the deck-2 owner record parsed from the owner bank', None)
schema('sch_d2_owner_records', 'the deck-2 owner bank (a map of record text)', None)
schema('sch_d2_transition', 'a deck-2 catalog request transition', None)

module('schema_references', 'Standing check 9: eager schema reference closure.', [
    ('SR01_references_resolve', '/unresolved', 'every $ref and $dynamicRef resolves through the retained local resources, '
     'unused definitions and branches included', 'unresolved_schema_reference', "value['unresolved'] is not False"),
])

# ------------------------------------------------------------------ shared entry, types
module('ev_input', 'evaluate: the operation input and its two required objects.', [
    ('EV01_input_object', '/input_object', 'the operation input is an object', 'input_not_object',
     "value['input_object'] is not True"),
    ('EV02_context_object', '/context_object', 'an object input carries an object context', 'context_not_object',
     "value['input_object'] is True and value['context_object'] is not True"),
    ('EV03_payload_object', '/payload_object', 'an object input carries an object payload', 'payload_not_object',
     "value['input_object'] is True and value['payload_object'] is not True"),
])
module('authority_types', 'Exact authority types before any boolean or integer interpretation.', [
    ('AT01_booleans', '/boolean_violations', 'every named boolean authority key holds an exact boolean (exact_boolean)',
     'authority_boolean_type', "value['boolean_violations'] != 0"),
    ('AT02_integer_type', '/integer_type_violations', 'every named integer authority key holds an exact integer '
     '(current_integer integer_type; admitted_sequence may be null)', 'authority_integer_type',
     "value['integer_type_violations'] != 0"),
    ('AT03_integer_minimum', '/integer_range_violations', 'every named integer authority key is at least 0 '
     '(current_integer minimum 0)', 'authority_integer_range', "value['integer_range_violations'] != 0"),
])
module('replay_only', 'Current writers never select or accept projector_replay_only (standing check 1).', [
    ('RO01_envelope_policy', '/envelope_policy', 'the candidate envelope replay_policy is not projector_replay_only',
     'replay_only_not_appendable', "value['envelope_policy'] == 'projector_replay_only'"),
    ('RO02_original_policy', '/original_policy', 'the original event replay_policy is not projector_replay_only',
     'replay_only_not_appendable', "value['original_policy'] == 'projector_replay_only'"),
    ('RO03_carrier_policy', '/carrier_policy', 'the operation replay_policy is not projector_replay_only',
     'replay_only_not_appendable', "value['carrier_policy'] == 'projector_replay_only'"),
    ('RO04_context_policy', '/context_policy', 'the context replay_policy is not projector_replay_only',
     'replay_only_not_appendable', "value['context_policy'] == 'projector_replay_only'"),
    ('RO05_context_envelope_policy', '/context_envelope_policy', 'the context envelope_replay_policy is not projector_replay_only',
     'replay_only_not_appendable', "value['context_envelope_policy'] == 'projector_replay_only'"),
])

# ------------------------------------------------------------------ identity and commitment
module('id_input', 'Identity recipe input.', [
    ('ID01_payload_object', '/payload_object', 'the identity payload is an object', 'identity_payload_not_object',
     "value['payload_object'] is not True"),
])
module('id_scope_entailed', 'Identity recipe scope (entailed: sch_id_fields validates the scope).', [
    ('ID02_scope_object', '/scope_object', 'a scoped family payload carries an object scope; entailed: the identity field '
     'schema (sch_id_fields) validates scope against its object schema first', 'identity_scope_not_object',
     "value['scoped'] is True and value['scope_object'] is not True"),
])
module('id_scope', 'Identity recipe application custody.', [
    ('ID03_application_custody', '/source_present', 'an application identity has original Server/owner-operation custody',
     'identity_application_custody', "value['application'] is True and value['source_present'] is not True"),
])
module('id_preimage', 'Identity recipe bytes.', [
    ('ID04_preimage_encodable', '/preimage_size', 'the identity array has an exact SP-1100 EVENT_VALUE encoding',
     'identity_preimage_unencodable', "value['preimage_size'] is None"),
])
module('cm_domain', 'CV-339 full-value commitment of a retained original.', [
    ('CM01_v1_domain', '/v1_domain', 'the retained original event is inside the frozen ds15-v1 integer domain',
     'commitment_v1_domain', "value['v1_domain'] is not True"),
])
module('cm_value', 'CV-339 full-value commitment of a retained original: the shared full_value_commitment.', [
    ('CM02_commitment_computable', '/commitment_refusal', 'full_value_commitment accepts the event edition and its bytes',
     'commitment_unavailable', "value['commitment_refusal'] is not None"),
])

# ------------------------------------------------------------------ browser application source (sixteen)
module('bs_bytes', 'Browser owner record text resolved by accepted_source_ref.', [
    ('BS01_record_text', '/raw_type', 'the owner bank holds exact text for accepted_source_ref', 'browser_record_missing',
     "value['raw_type'] != 'str'"),
    ('BS02_record_json', '/parse_refusal', 'the record text parses under CV-1100 loads_current_json', 'browser_record_json',
     "value['raw_type'] == 'str' and value['parse_refusal'] is not None"),
])
module('bs_digests', 'Browser source CV-366 semantic hashes, recomputed.', [
    ('BS03_accepted_source_hash', '/accepted_source_sha256', 'equals the recomputed hash of the resolved record',
     'browser_source_hash', "value['accepted_source_sha256'] != value['record_hash']"),
    ('BS04_source_hash', '/source_sha256', 'equals the recomputed hash of the unsigned source', 'browser_source_hash',
     "value['source_sha256'] != value['unsigned_hash']"),
    ('BS05_input_hash', '/original_input_semantic_sha256', 'equals the recomputed hash of original_input',
     'browser_source_hash', "value['original_input_semantic_sha256'] != value['input_hash']"),
    ('BS06_output_hash', '/original_output_semantic_sha256', 'equals the recomputed hash of original_output',
     'browser_source_hash', "value['original_output_semantic_sha256'] != value['output_hash']"),
])
module('bs_joins', 'Browser owner record joined to the source and the payload.', [
    ('BS07_scope', '/record_scope', 'record scope equals source scope', 'browser_source_join',
     "value['record_scope'] != value['source_scope']"),
    ('BS08_storage_instance', '/record_storage_instance_id', 'record Storage instance equals source', 'browser_source_join',
     "value['record_storage_instance_id'] != value['source_storage_instance_id']"),
    ('BS09_operation', '/record_original_operation_id', 'record original operation equals source', 'browser_source_join',
     "value['record_original_operation_id'] != value['source_original_operation_id']"),
    ('BS10_interface', '/record_interface_id', 'record interface equals source', 'browser_source_join',
     "value['record_interface_id'] != value['source_interface_id']"),
    ('BS11_thread', '/record_thread_id', 'record thread equals source', 'browser_source_join',
     "value['record_thread_id'] != value['source_thread_id']"),
    ('BS12_capture', '/record_capture', 'record capture equals the payload (typed)', 'browser_source_join',
     "value['record_capture'] != value['payload']"),
])
for side, first in (('input', 13), ('output', 20)):
    n = lambda k: f'BS{first + k:02d}'
    module(f'bs_{side}_body', f'Browser original_{side} body (checked before its fields).', [
        (f'{n(0)}_{side}_body', f'/{side}_body', f'original_{side} without controller evidence equals the record body',
         'browser_original_' + side, "value['body'] != value['record_body']"),
    ])
    module(f'bs_{side}', f'Browser original_{side} joined to the record and controller evidence.', [
        (f'{n(1)}_{side}_scope', f'/{side}_scope', f'original_{side} scope equals the record scope', 'browser_original_' + side,
         "value['scope'] != value['record_scope']"),
        (f'{n(2)}_{side}_profile', f'/{side}_profile_id', f'original_{side} profile equals the record profile',
         'browser_original_' + side, "value['profile_id'] != value['record_profile_id']"),
        (f'{n(3)}_{side}_workspace', f'/{side}_workspace_id', f'original_{side} workspace equals the record workspace',
         'browser_original_' + side, "value['workspace_id'] != value['record_workspace_id']"),
        (f'{n(4)}_{side}_session', f'/{side}_session_refs', f'original_{side} session_refs include the payload BrowserSession',
         'browser_original_' + side, "value['browser_session_id'] not in value['session_refs']"),
        (f'{n(5)}_{side}_transition_source', f'/{side}_transition_source_ref',
         f'original_{side} transition_source_ref is the accepted source ref', 'browser_original_' + side,
         "value['transition_source_ref'] != value['accepted_source_ref']"),
        (f'{n(6)}_{side}_controller_evidence', f'/{side}_controller_evidence',
         f'original_{side} controller evidence equals the evidence derived from the record', 'browser_original_' + side,
         "value['controller_evidence'] != value['expected_evidence']"),
    ])
module('bs_stages', 'Browser stage custody, every stage.', [
    ('BS27_stage_status', '/stage_statuses', 'every stage status is accepted', 'browser_stage_custody',
     "any([s != 'accepted' for s in value['stage_statuses']])"),
    ('BS28_stage_operation', '/stage_operations', 'every stage original_operation_id is the record operation',
     'browser_stage_custody', "any([s != value['record_original_operation_id'] for s in value['stage_operations']])"),
    ('BS29_stage_method', '/stage_methods', 'every stage owner_method_id is the record interface', 'browser_stage_custody',
     "any([s != value['record_interface_id'] for s in value['stage_methods']])"),
    ('BS30_stage_request', '/stage_requests', 'every stage request_ref is the record request', 'browser_stage_custody',
     "any([s != value['record_request_ref'] for s in value['stage_requests']])"),
    ('BS31_stage_result', '/stage_results', 'every stage result_ref is the record result', 'browser_stage_custody',
     "any([s != value['record_result_ref'] for s in value['stage_results']])"),
    ('BS32_stage_evidence', '/stage_evidence', 'every stage custody evidence equals the derived evidence',
     'browser_stage_custody', "any([s != value['expected_evidence'] for s in value['stage_evidence']])"),
])

# ------------------------------------------------------------------ envelope (sixteen)
module('env_dispatch', 'EventRecord envelope dispatch and current-writer replay policy.', [
    ('EN01_event_type', '/event_type', 'equals the family event type', 'envelope_dispatch',
     "value['event_type'] != value['family_event_type']"),
    ('EN03_envelope_dedupe', '/envelope_policy', 'a current envelope is dedupe_by_idempotency_key', 'envelope_policy',
     "value['historical'] is not True and value['envelope_policy'] != 'dedupe_by_idempotency_key'"),
    ('EN04_original_dedupe', '/original_policy', 'a current write\'s original is dedupe_by_idempotency_key', 'envelope_policy',
     "value['historical'] is not True and value['original_policy'] != 'dedupe_by_idempotency_key'"),
])
module('env_dispatch_entailed', 'EventRecord event-type grammar (entailed: EN01 and the EventRecord pattern).', [
    ('EN02_event_type_fullmatch', '/event_type_fullmatch', 'the event type fully matches the dotted-name grammar (no '
     'trailing LF); entailed: it equals the family event type (EN01) and the EventRecord schema full-matches it',
     'envelope_dispatch', "value['event_type_fullmatch'] is not True"),
])
module('env_scope', 'EventRecord envelope joined to the scope and payload.', [
    ('EN06_project', '/project_id', 'equals the context scope project_id', 'envelope_join',
     "value['project_id'] != value['scope_project_id']"),
    ('EN07_payload_copy', '/envelope_payload', 'the envelope payload equals the payload (typed)', 'envelope_join',
     "value['envelope_payload'] != value['payload']"),
    ('EN08_scope', '/scope', 'the context scope equals the payload scope', 'envelope_join',
     "value['scope'] != value['payload_scope']"),
    ('EN09_run', '/run_id', 'equals the payload run_id', 'envelope_join', "value['run_id'] != value['payload_run_id']"),
    ('EN10_thread', '/thread_id', 'equals the payload thread_id', 'envelope_join',
     "value['thread_id'] != value['payload_thread_id']"),
    ('EN11_payload_schema', '/payload_schema_id', 'equals the family payload schema $id', 'envelope_join',
     "value['payload_schema_id'] != value['family_payload_schema_id']"),
])
module('env_scope_entailed', 'EventRecord scope kind (entailed: the EventRecord schema ties scope_kind to a null or present '
       'project_id, and EN06 joins that project_id to the context scope).', [
    ('EN05_scope_kind', '/scope_kind', 'equals the context scope kind (application or project)', 'envelope_join',
     "value['scope_kind'] != value['expected_scope_kind']"),
])
module('env_storage', 'EventRecord Storage partition and SP-337 inline size.', [
    ('EN12_partition', '/scope_partition', 'equals the encoded Storage partition of the envelope scope', 'envelope_storage',
     "value['scope_partition'] != value['expected_partition']"),
    ('EN13_payload_encodable', '/payload_size', 'the payload has an exact SP-1100 EVENT_VALUE encoding', 'envelope_storage',
     "value['payload_size'] is None"),
    ('EN14_inline_limit', '/payload_size', 'the encoded inline payload is at most 16384 bytes (SP-337)', 'envelope_storage',
     "value['payload_size'] is not None and value['payload_size'] > 16384"),
])
module('env_producer', 'CV-1100 producer route of a new append.', [
    ('EN15_producer_qualified', '/producer_refusal', 'the CV-317 producer projection has an exact qualified JCS encoding '
     '(owner integer paths type-sensitive)', 'producer_unqualified', "value['producer_refusal'] is not None"),
])
module('env_retry', 'Retry semantic comparison (caller-semantic body only, ds15-v1 producer digest).', [
    ('EN16_event_id', '/event_id', 'the retry keeps the original event_id', 'retry_mismatch',
     "value['event_id'] != value['original_event_id']"),
    ('EN17_semantic_digest', '/candidate_digest', 'the candidate producer-semantic digest exists and equals the original\'s',
     'retry_mismatch', "value['candidate_digest'] is None or value['candidate_digest'] != value['original_digest']"),
])
module('env_identity', 'Idempotency key recomputed from the payload.', [
    ('EN18_idempotency_key', '/idempotency_key', 'equals the recomputed family identity', 'identity_mismatch',
     "value['idempotency_key'] != value['expected_key']"),
])
module('env_app_install_a', 'catalog.install application source shape (CV-366 custody).', [
    ('EA01_source_object', '/source_object', 'the application source is an object', 'application_source',
     "value['source_object'] is not True"),
    ('EA02_source_members', '/source_keys', 'the source has exactly server_id and original_operation_id', 'application_source',
     "value['source_object'] is True and value['source_keys'] != ['original_operation_id', 'server_id']"),
    ('EA03_source_types', '/source_types', 'both source members are strings', 'application_source',
     "value['source_keys'] == ['original_operation_id', 'server_id'] and value['source_types'] != ['str', 'str']"),
    ('EA04_source_lengths', '/source_lengths', 'both source members are 1..256 characters', 'application_source',
     "value['source_types'] == ['str', 'str'] and any([n < 1 or n > 256 for n in value['source_lengths']])"),
    ('EA05_source_lf', '/source_lf', 'neither source member contains LF', 'application_source',
     "value['source_types'] == ['str', 'str'] and True in value['source_lf']"),
])
module('env_app_install_b', 'catalog.install application source joins (CV-366 custody).', [
    ('EA06_source_original', '/source', 'the source equals the original operation source', 'application_source',
     "value['source'] != value['original_source']"),
    ('EA07_source_operation', '/source_operation', 'the source operation is the payload operation_id', 'application_source',
     "value['source_operation'] != value['payload_operation']"),
])
module('env_app_browser_a', 'Browser application source presence and original copy.', [
    ('EB01_source_present', '/source_present', 'the application source is present (non-empty)', 'application_source',
     "value['source_present'] is not True"),
    ('EB02_source_original', '/source', 'the source equals the original operation source', 'application_source',
     "value['source_present'] is True and value['source'] != value['original_source']"),
])
module('env_app_browser_b', 'Browser application source identity and scope.', [
    ('EB05_storage_instance', '/storage_instance_id', 'equals the operation Storage instance', 'application_source',
     "value['storage_instance_id'] != value['expected_storage_instance_id']"),
    ('EB06_thread', '/thread_id', 'equals the envelope thread_id', 'application_source',
     "value['thread_id'] != value['envelope_thread_id']"),
    ('EB09_scope_server', '/scope_server_id', 'the source scope Server equals the source server_id', 'application_source',
     "value['scope_server_id'] != value['server_id']"),
])
module('env_app_browser_b_entailed', 'Browser application source identity and scope (entailed: the OriginalBrowserTransitionSource schema fixes schema_id, interface_id and the application scope, so sch_app_source refuses first).', [
    ('EB03_schema_id', '/schema_id', 'is pm.application_source.browser_transition.v1', 'application_source',
     "value['schema_id'] != 'pm.application_source.browser_transition.v1'"),
    ('EB04_interface', '/interface_id', 'is owner.browser.transition.application@1.0.0', 'application_source',
     "value['interface_id'] != 'owner.browser.transition.application@1.0.0'"),
    ('EB07_scope_kind', '/scope_kind', 'the source scope is application', 'application_source',
     "value['scope_kind'] != 'application'"),
    ('EB08_scope_project', '/scope_project_id', 'the application source scope has no Project', 'application_source',
     "value['scope_project_id'] is not None"),
])
module('env_app_browser_c', 'Browser application source original output.', [
    ('EB10_output_present', '/output_present', 'original_output is present', 'application_source',
     "value['output_present'] is not True"),
])
module('env_app_browser_d', 'Browser application source profile joined to the context scope.', [
    ('EB11_profile', '/profile_id', 'original_output profile equals the context scope profile', 'application_source',
     "value['profile_id'] != value['scope_profile_id']"),
])
module('env_app_browser_entailed', 'Browser application source stage operations (entailed: BS09 and BS28).', [
    ('EB13_stage_operations', '/stage_operations', 'every stage operation is the source operation (entailed: BS09 and BS28)',
     'application_source', "any([s != value['original_operation_id'] for s in value['stage_operations']])"),
])
module('env_app_browser_e', 'Browser application source identity text.', [
    ('EB14_identity_text', '/identity_text_ok', 'server_id and original_operation_id are 1..256-character strings without LF',
     'application_source', "value['identity_text_ok'] is not True"),
])

# ------------------------------------------------------------------ receipt and custody
module('rc_copies', 'First receipt copies, original identity and offsets.', [
    ('RC01_custody_receipt', '/receipt', 'the receipt equals custody first_append_receipt', 'receipt_custody',
     "value['receipt'] != value['custody_receipt']"),
    ('RC02_result_receipt', '/result_receipt', 'custody first_append_receipt equals the issued result copy', 'receipt_custody',
     "value['custody_receipt'] != value['result_receipt']"),
    ('RC03_receipt_event', '/receipt_event_id', 'the receipt event_id is the original event', 'receipt_custody',
     "value['receipt_event_id'] != value['event_id']"),
    ('RC04_receipt_sequence', '/receipt_sequence_id', 'the receipt sequence_id is the original Storage sequence',
     'receipt_custody', "value['receipt_sequence_id'] != value['event_sequence_id']"),
    ('RC05_receipt_offsets', '/byte_offset', 'the receipt byte_offset is below durable_end_offset', 'receipt_custody',
     "value['byte_offset'] >= value['durable_end_offset']"),
])
module('rc_commitment_copies', 'Full-value commitment copies.', [
    ('RC06_commitment_copies', '/custody_commitment', 'custody and issued result carry the same commitment', 'receipt_custody',
     "value['custody_commitment'] != value['result_commitment']"),
])
module('rc_commitment', 'Full-value commitment recomputed from the original.', [
    ('RC07_commitment', '/result_commitment', 'the commitment equals the recomputed CV-339 commitment of the original',
     'receipt_custody', "value['result_commitment'] != value['expected_commitment']"),
])
module('rc_custody', 'Custody joined to the original and the operation.', [
    ('RC08_segment', '/custody_segment_ref', 'custody and result name the same original segment', 'receipt_custody',
     "value['custody_segment_ref'] != value['result_segment_ref']"),
    ('RC09_storage_instance', '/custody_storage_instance_id', 'custody Storage instance is the operation instance',
     'receipt_custody', "value['custody_storage_instance_id'] != value['storage_instance_id']"),
    ('RC10_partition', '/custody_scope_partition', 'custody partition is the operation partition', 'receipt_custody',
     "value['custody_scope_partition'] != value['scope_partition']"),
    ('RC11_event', '/custody_event_id', 'custody event_id is the original event', 'receipt_custody',
     "value['custody_event_id'] != value['event_id']"),
    ('RC12_event_type', '/custody_event_type', 'custody event_type is the original event type', 'receipt_custody',
     "value['custody_event_type'] != value['event_type']"),
    ('RC13_key', '/custody_idempotency_key', 'custody idempotency key is the original key', 'receipt_custody',
     "value['custody_idempotency_key'] != value['idempotency_key']"),
    ('RC14_producer_digest', '/custody_producer_digest', 'custody producer digest equals the ds15-v1 digest of the original',
     'receipt_custody', "value['custody_producer_digest'] != value['original_producer_digest']"),
])

# ------------------------------------------------------------------ checkpoint value and token
module('cp_size', 'Proposed checkpoint physical size.', [
    ('CP01_encodable', '/size', 'the checkpoint has an exact SP-1100 EVENT_VALUE encoding', 'checkpoint_size',
     "value['size'] is None"),
    ('CP02_size_limit', '/size', 'the encoded checkpoint is at most 16384 bytes', 'checkpoint_size',
     "value['size'] is not None and value['size'] > 16384"),
])
module('tk_storage', 'SP-278 read token bound to the event Storage instance.', [
    ('TK01_token_storage', '/token_storage_instance_id', 'the token Storage instance is the event instance', 'token_storage',
     "value['token_storage_instance_id'] != value['storage_instance_id']"),
    ('TK02_selection_storage', '/selection_storage_instance_id', 'the source selection instance is the event instance',
     'token_storage', "value['selection_storage_instance_id'] != value['storage_instance_id']"),
    ('TK03_checkpoint_key', '/checkpoint_key', 'is event_record_index_checkpoint.v1:{storage_instance_id}', 'token_storage',
     "value['checkpoint_key'] != value['expected_key']"),
    ('TK04_checkpoint_ref', '/checkpoint_ref', 'is the key plus #/generations/{generation_id}', 'token_storage',
     "value['checkpoint_ref'] != value['expected_ref']"),
    ('TK05_dataset', '/index_dataset_name', 'is event_record_index.v2@{generation_id}', 'token_storage',
     "value['index_dataset_name'] != value['expected_dataset']"),
])

# ------------------------------------------------------------------ payload gate and transitions (sixteen)
module('pl_gate', 'Current transition authorization and joins.', [
    ('PL01_owner_authorized', '/owner_command_authorized', 'the owner command is authorized', 'transition_refused',
     "not value['owner_command_authorized']"),
    ('PL02_safe_refs', '/unsafe_refs', 'no payload string is an absolute path, token-shaped or a forbidden ref',
     'transition_refused', "value['unsafe_refs'] != []"),
    ('PL03_scope', '/context_scope', 'the context scope equals the payload scope', 'transition_refused',
     "value['context_scope'] != value['payload_scope']"),
    ('PL04_envelope_project', '/envelope_project_id', 'the context envelope project equals the scope project',
     'transition_refused', "value['envelope_project_id'] != value['scope_project_id']"),
    ('PL05_run', '/envelope_run_id', 'the payload run_id equals the context envelope run', 'transition_refused',
     "value['payload_run_id'] != value['envelope_run_id']"),
    ('PL06_session_class', '/session_security_class', 'a BrowserSession payload has an ordinary session', 'transition_refused',
     "value['has_browser_session'] is True and value['session_security_class'] != 'ordinary'"),
])
module('tr_catalog_install', 'catalog.install.started/completed transition.', [
    ('TI01_outcome_committed', '/catalog_outcome_committed', 'the catalog outcome is committed', 'transition_refused',
     "not value['catalog_outcome_committed']"),
    ('TI02_owner_payload', '/catalog_owner_payload', 'the owner payload equals the payload (typed)', 'transition_refused',
     "value['catalog_owner_payload'] != value['payload']"),
    ('TI03_phase', '/catalog_phase', 'the context phase equals the payload phase', 'transition_refused',
     "value['catalog_phase'] != value['payload_phase']"),
])
module('tr_catalog_install_entailed', 'catalog.install family phase (entailed: the family payload schema fixes phase).', [
    ('TI04_family_phase', '/payload_phase', 'the payload phase is the family suffix', 'transition_refused',
     "value['payload_phase'] != value['family_phase']"),
])
module('tr_doctor', 'doctor.custom_headless.checked transition.', [
    ('TD01_config_inspected', '/config_inspected', 'the configuration was inspected', 'transition_refused',
     "not value['config_inspected']"),
    ('TD02_invocation', '/doctor_invocation_id', 'the context invocation is the payload invocation', 'transition_refused',
     "value['doctor_invocation_id'] != value['payload_doctor_invocation_id']"),
])
module('tr_live_started', 'live.session.started transition.', [
    ('TLS01_launched', '/launch_outcome', 'the launch outcome is launched', 'transition_refused',
     "value['launch_outcome'] != 'launched'"),
    ('TLS02_driver_session', '/driver_session_id', 'the driver session is the payload session', 'transition_refused',
     "value['driver_session_id'] != value['payload_session_id']"),
])
module('tr_live_step', 'live.step.updated transition.', [
    ('TLU01_running', '/session_state', 'the session is running', 'transition_refused', "value['session_state'] != 'running'"),
    ('TLU02_revision', '/step_revision', 'the step revision is above the previous revision', 'transition_refused',
     "not value['step_revision'] > value['previous_revision']"),
])
module('tr_live_artifact', 'live.artifact.created transition.', [
    ('TLA01_artifact_id', '/artifact_id', 'the committed artifact id is the payload artifact', 'transition_refused',
     "value['artifact_id'] != value['payload_artifact_id']"),
    ('TLA02_artifact_ref', '/artifact_ref', 'the artifact ref is the payload ref', 'transition_refused',
     "value['artifact_ref'] != value['payload_artifact_ref']"),
    ('TLA03_receipt_ref', '/artifact_receipt_ref', 'the artifact receipt ref is the payload receipt ref', 'transition_refused',
     "value['artifact_receipt_ref'] != value['payload_artifact_receipt_ref']"),
    ('TLA04_committed', '/artifact_committed', 'the artifact is committed', 'transition_refused',
     "not value['artifact_committed']"),
])
module('tr_live_completed', 'live.session.completed transition.', [
    ('TLC01_running', '/session_state', 'the session is running', 'transition_refused', "value['session_state'] != 'running'"),
    ('TLC02_committed', '/finalization_committed', 'the finalization is committed', 'transition_refused',
     "not value['finalization_committed']"),
    ('TLC03_manifest', '/manifest_ref', 'the finalization manifest is the payload manifest', 'transition_refused',
     "value['manifest_ref'] != value['payload_manifest_ref']"),
    ('TLC04_summary', '/summary_ref', 'the finalization summary is the payload summary', 'transition_refused',
     "value['summary_ref'] != value['payload_summary_ref']"),
    ('TLC05_checks', '/checks_ref', 'the finalization checks are the payload checks', 'transition_refused',
     "value['checks_ref'] != value['payload_checks_ref']"),
])
module('tr_live_degraded', 'live.session.degraded transition.', [
    ('TLD01_revision', '/degradation_revision', 'the degradation revision is above the previous revision', 'transition_refused',
     "not value['degradation_revision'] > value['previous_revision']"),
    ('TLD02_dependency', '/visible_dependency_available', 'the visible dependency is unavailable', 'transition_refused',
     "value['visible_dependency_available']"),
    ('TLD03_launch', '/launch_outcome', 'the launch outcome is refused for forced_visible, else headless', 'transition_refused',
     "value['launch_outcome'] != value['expected_launch_outcome']"),
])
module('tr_browser_a', 'browser.context_captured transition: target and thread.', [
    ('TB02_payload_target', '/payload_target_resolution', 'the payload target resolution equals the context',
     'transition_refused', "value['payload_target_resolution'] != value['target_resolution']"),
    ('TB03_resolved_thread', '/resolved_thread_id', 'the resolved thread is the payload thread', 'transition_refused',
     "value['resolved_thread_id'] != value['payload_thread_id']"),
    ('TB04_thread_writable', '/thread_writable', 'the thread is writable', 'transition_refused', "not value['thread_writable']"),
    ('TB12_thread_scope', '/thread_scope', 'the thread scope is the payload scope', 'transition_refused',
     "value['thread_scope'] != value['scope']"),
    ('TB13_no_auto_send', '/auto_send', 'capture never auto-sends', 'transition_refused', "value['auto_send']"),
])
module('tr_browser_a_entailed', 'browser.context_captured target resolution (entailed: the family payload schema enumerates '
       'exactly the allowed resolutions and TB02 joins the context to the payload).', [
    ('TB01_target_resolution', '/target_resolution', 'is explicit, owning_surface or explicit_new_thread', 'transition_refused',
     "value['target_resolution'] not in ('explicit', 'owning_surface', 'explicit_new_thread')"),
])
module('tr_browser_b', 'browser.context_captured transition: the committed chip.', [
    ('TB05_chip', '/chip_id', 'the chip is the payload chip', 'transition_refused', "value['chip_id'] != value['payload_chip_id']"),
    ('TB06_chip_thread', '/chip_thread_id', 'the chip thread is the payload thread', 'transition_refused',
     "value['chip_thread_id'] != value['payload_thread_id']"),
    ('TB07_attachment', '/attachment_type', 'the chip attachment type is the payload type', 'transition_refused',
     "value['attachment_type'] != value['payload_attachment_type']"),
    ('TB08_source', '/source_ref', 'the chip source is the payload source', 'transition_refused',
     "value['source_ref'] != value['payload_source_ref']"),
    ('TB09_committed', '/chip_committed', 'the chip is committed', 'transition_refused', "not value['chip_committed']"),
    ('TB10_status', '/chip_status', 'the chip status is the payload capture status', 'transition_refused',
     "value['chip_status'] != value['payload_capture_status']"),
    ('TB11_provenance', '/provenance_ref', 'the chip provenance is the payload provenance', 'transition_refused',
     "value['provenance_ref'] != value['payload_provenance_ref']"),
])
module('tr_dev_a', 'dev.session.* transition: workflow states and revision.', [
    ('TV03_context_state', '/context_workflow_state', 'the context workflow state is the payload previous state',
     'transition_refused', "value['context_workflow_state'] != value['previous_state']"),
    ('TV04_revision', '/workflow_revision', 'the workflow revision is the previous revision plus one', 'transition_refused',
     "value['workflow_revision'] != value['previous_revision'] + 1"),
    ('TV05_dev_session', '/dev_session_id', 'the context dev session is the payload session', 'transition_refused',
     "value['dev_session_id'] != value['payload_dev_session_id']"),
    ('TV06_committed', '/managed_outcome_committed', 'the managed outcome is committed', 'transition_refused',
     "not value['managed_outcome_committed']"),
    ('TV07_operation', '/operation_id', 'the context operation is the payload operation', 'transition_refused',
     "value['operation_id'] != value['payload_operation_id']"),
])
module('tr_dev_a_entailed', 'dev.session.* workflow states (entailed: the family payload schema fixes the permitted previous states and the workflow state).', [
    ('TV01_previous_state', '/previous_state', 'the payload previous state is a permitted predecessor', 'transition_refused',
     "value['previous_state'] not in value['permitted_before']"),
    ('TV02_workflow_state', '/workflow_state', 'the payload workflow state is the family state', 'transition_refused',
     "value['workflow_state'] != value['family_state']"),
])
module('tr_dev_b', 'dev.session.* transition: family outcomes and DAP.', [
    ('TV08_started_launch', '/launch_outcome', 'dev.session.started was launched', 'transition_refused',
     "value['family'] == 'dev.session.started' and value['launch_outcome'] != 'launched'"),
    ('TV09_stopped_settled', '/managed_resources_settled', 'dev.session.stopped settled its managed resources',
     'transition_refused', "value['family'] == 'dev.session.stopped' and not value['managed_resources_settled']"),
    ('TV10_dap_transition_ref', '/dap_transition_ref', 'a changed DAP state carries a DAP transition ref', 'transition_refused',
     "value['dap_state_after'] != value['dap_state_before'] and value['dap_transition_ref'] is None"),
    ('TV11_dap_owner_verified', '/dap_owner_verified', 'a changed DAP state was verified by its owner', 'transition_refused',
     "value['dap_state_after'] != value['dap_state_before'] and value['dap_transition_ref'] is not None "
     "and not value['dap_owner_verified']"),
    ('TV12_no_history_rewrite', '/rewrite_terminal_history', 'terminal history is never rewritten', 'transition_refused',
     "value['rewrite_terminal_history']"),
])
module('tr_dev_links', 'dev.session.* transition: linked runtime records.', [
    ('TV13_link_run', '/run_id', 'the payload run_id is the linked run', 'transition_refused',
     "value['run_id'] != value['link_run_id']"),
    ('TV14_link_thread', '/thread_id', 'the payload thread_id is the linked thread', 'transition_refused',
     "value['thread_id'] != value['link_thread_id']"),
    ('TV15_link_tab', '/workspace_tab_id', 'the payload workspace tab is the linked tab', 'transition_refused',
     "value['workspace_tab_id'] != value['link_workspace_tab_id']"),
    ('TV16_link_terminal', '/terminal_session_id', 'the payload terminal session is the linked terminal', 'transition_refused',
     "value['terminal_session_id'] != value['link_terminal_session_id']"),
    ('TV17_link_dap', '/dap_session_id', 'the payload DAP session is the linked DAP session', 'transition_refused',
     "value['dap_session_id'] != value['link_dap_session_id']"),
])
module('tr_preview_a', 'preview.session.* transition: subject, session and runtime.', [
    ('TP01_subject', '/preview_subject_id', 'the context subject is the payload subject', 'transition_refused',
     "value['preview_subject_id'] != value['payload_preview_subject_id']"),
    ('TP02_session', '/preview_session_id', 'the context session is the payload session', 'transition_refused',
     "value['preview_session_id'] != value['payload_preview_session_id']"),
    ('TP03_source_revision', '/source_revision', 'the context source revision is the payload revision', 'transition_refused',
     "value['source_revision'] != value['payload_source_revision']"),
    ('TP04_runtime_verified', '/runtime_verified', 'the runtime is verified', 'transition_refused',
     "not value['runtime_verified']"),
    ('TP05_no_restored_claim', '/restored_live_claim', 'no restored live claim', 'transition_refused',
     "value['restored_live_claim']"),
])
module('tr_preview_b', 'preview.session.started/stopped transition.', [
    ('TP06_started_state', '/session_state', 'started: the session was created', 'transition_refused',
     "value['family'] == 'preview.session.started' and value['session_state'] != 'created'"),
    ('TP08_stopped_state', '/session_state', 'stopped: the session was not already closed', 'transition_refused',
     "value['family'] == 'preview.session.stopped' and value['session_state'] == 'closed'"),
    ('TP10_stopped_settled', '/managed_resources_settled', 'stopped: managed resources settled', 'transition_refused',
     "value['family'] == 'preview.session.stopped' and not value['managed_resources_settled']"),
])
module('tr_preview_b_entailed', 'preview.session.started/stopped runtime state (entailed: the family payload schema fixes runtime_state).', [
    ('TP07_started_runtime', '/runtime_state', 'started: the runtime is loading', 'transition_refused',
     "value['family'] == 'preview.session.started' and value['runtime_state'] != 'loading'"),
    ('TP09_stopped_runtime', '/runtime_state', 'stopped: the runtime is closed', 'transition_refused',
     "value['family'] == 'preview.session.stopped' and value['runtime_state'] != 'closed'"),
])
module('tr_preview_c', 'preview.session.refreshed transition.', [
    ('TP11_refresh_state', '/session_state', 'the session is ready, stale, degraded or error', 'transition_refused',
     "value['session_state'] not in ('ready', 'stale', 'degraded', 'error')"),
    ('TP12_refreshable', '/refreshable', 'the session is refreshable', 'transition_refused', "not value['refreshable']"),
    ('TP13_refresh_committed', '/refresh_committed', 'the refresh is committed', 'transition_refused',
     "not value['refresh_committed']"),
    ('TP14_revision', '/preview_revision', 'the preview revision is above the previous revision', 'transition_refused',
     "not value['preview_revision'] > value['previous_revision']"),
])
module('tr_preview_origin', 'preview.session.refreshed origin.', [
    ('TP16_reload_session', '/payload_browser_session_id', 'a browser reload names a BrowserSession', 'transition_refused',
     "value['refresh_origin'] == 'cmd.browser.reload' and not value['payload_browser_session_id']"),
    ('TP17_reload_session_join', '/payload_browser_session_id', 'a browser reload BrowserSession is the context session',
     'transition_refused', "value['refresh_origin'] == 'cmd.browser.reload' and bool(value['payload_browser_session_id']) "
     "and value['payload_browser_session_id'] != value['browser_session_id']"),
    ('TP18_filemanager_no_session', '/payload_browser_session_id', 'a file-manager refresh names no BrowserSession',
     'transition_refused', "value['refresh_origin'] == 'filemanager.preview_refresh' and bool(value['payload_browser_session_id'])"),
])
module('tr_preview_origin_entailed', 'preview.session.refreshed origin (entailed: the family payload schema enumerates refresh_origin).', [
    ('TP15_origin', '/refresh_origin', 'the origin is cmd.browser.reload or filemanager.preview_refresh', 'transition_refused',
     "value['refresh_origin'] not in ('cmd.browser.reload', 'filemanager.preview_refresh')"),
])

# ------------------------------------------------------------------ evaluate: originals, readers, disclosure
module('ev_outcome', 'Committed owner outcome and backup closure.', [
    ('OU01_outcome_present', '/outcome_present', 'the owner outcome is present', 'unavailable',
     "value['outcome_present'] is not True"),
    ('OU02_outcome_committed', '/outcome_committed', 'the owner outcome is committed', 'unavailable',
     "value['outcome_present'] is True and not value['outcome_committed']"),
    ('OU03_backup_closure', '/backup_closure_verified', 'the backup closure is verified', 'unavailable',
     "not value['backup_closure_verified']"),
])
module('ev_outcome_domain', 'The retained owner outcome.', [
    ('OD01_outcome_v1', '/outcome_v1_domain', 'the retained owner outcome is inside the frozen ds15-v1 integer domain',
     'original_refused', "value['outcome_v1_domain'] is not True"),
])
module('rd_recipe', 'SP-1101 recipe selection: one selection from the sealed write receipt of the exact original, before '
       'any retained read (sweep part 2B, S-N2; batch 2 fix 1).', [
    ('SX01_custody_store', '/custody_store', "the original's Storage instance has sealed write custody for this family "
     '(else no authentic provenance: the existing unavailable contract, no fallback recipe)', 'original_unavailable',
     "value['custody_store'] is not True"),
    ('SX08_receipt_present', '/receipt_count', 'that custody holds a sealed write receipt for this exact original (its '
     'original ref and CV-339 full-value commitment); the Store never supplies a recipe (else the existing unavailable '
     'contract, no fallback recipe)', 'original_unavailable',
     "value['custody_store'] is True and value['receipt_count'] == 0"),
    ('SX09_receipt_unique', '/receipt_count', 'exactly one sealed write receipt names the recipe of this exact original '
     '(else no single selection: unsupported, never one of them)', 'recipe_unsupported',
     "value['custody_store'] is True and value['receipt_count'] != 0 and value['receipt_count'] != 1"),
    ('SX02_recipe_installed', '/recipe_installed', 'the recipe tuple of that one receipt has an installed frozen verifier '
     'at this head (else unsupported: never the current or another recipe)', 'recipe_unsupported',
     "value['custody_store'] is True and value['receipt_count'] == 1 and value['recipe_installed'] is not True"),
])
module('rd_resolve', 'SP-1101 authenticated original: one RetainedDispatcher resolution through the sealed original owner '
       'of the Storage instance read, after the frozen-recipe checks (sweep part 2B, S-N2).', [
    ('SX05_original_verification', '/dispatch_refusal', 'the frozen verifier of the sealed recipe tuple recomputes the '
     'original: editions, family, payload join, commitment, producer digest and identity '
     '(RetainedDispatcher original_verification)', 'original_refused',
     "value['dispatch_refusal'] == 'original_verification'"),
])
module('rd_resolve_entailed', 'SP-1101 dispatcher refusals this composition cannot produce first (entailed).', [
    ('SX03_original_sealed', '/dispatch_refusal', 'this Storage instance holds a sealed original at the original ref '
     '(RetainedDispatcher original_query); entailed: rd_recipe SX08 refuses first every original without a sealed '
     'receipt at that ref with its exact commitment, which is what the sealed original owner looks up',
     'original_refused', "value['dispatch_refusal'] == 'original_query'"),
    ('SX04_original_authentic', '/dispatch_refusal', 'the fetched original bytes are the bytes sealed at that ref: their '
     'CV-339 full-value commitment is the sealed one (RetainedDispatcher original_authority); entailed: SX08 selects '
     'only by that same commitment, so a fetched original whose commitment has no receipt refuses there first',
     'original_refused', "value['dispatch_refusal'] == 'original_authority'"),
    ('SX06_recipe_known', '/dispatch_refusal', "the original's sealed recipe tuple has an installed frozen verifier "
     '(RetainedDispatcher recipe_unknown; no other verifier is probed); entailed: the owner returns the tuple of the '
     'same one receipt rd_recipe selected, and SX02 refuses first a receipt whose recipe has no installed verifier',
     'original_refused', "value['dispatch_refusal'] == 'recipe_unknown'"),
    ('SX07_dispatch_other', '/dispatch_refusal', 'no other RetainedDispatcher refusal (original_binding, '
     'original_ambiguous, caller_recipe_override, recipe_selection, original_bytes_type, current_disclosure); '
     'entailed: the owner is the custody of the Storage instance read and the commitment covers every event field '
     'of the binding, which the earlier rows join to the family and scope; SX09 refuses first more than one receipt '
     'for one original; no override is passed; disclosure is the separate DS rows', 'original_refused',
     "value['dispatch_refusal'] is not None"),
])
module('ev_original_copies', 'Original payload copies (typed).', [
    ('OC01_payload_original', '/payload', 'the payload equals the original payload', 'original_refused',
     "value['payload'] != value['original_payload']"),
    ('OC02_outcome_original', '/outcome_payload', 'the outcome payload equals the original payload', 'original_refused',
     "value['outcome_payload'] != value['original_payload']"),
])
module('ev_original_ids', 'Original identity copies.', [
    ('OC03_outcome_event', '/outcome_event_id', 'the outcome event is the original event', 'original_refused',
     "value['outcome_event_id'] != value['original_event_id']"),
    ('OC05_event_id', '/event_event_id', 'the original event id is the original event_id', 'original_refused',
     "value['event_event_id'] != value['original_event_id']"),
    ('OC06_key', '/original_key', 'the original key is the original event key', 'original_refused',
     "value['original_key'] != value['event_key']"),
])
module('ev_original_ids_entailed', 'Original event payload copy (entailed: OC01, EN07 and EN17).', [
    ('OC04_event_payload', '/event_payload', 'the original event payload equals the original payload (typed); entailed: the '
     'payload equals it (OC01), the envelope payload equals the payload (EN07) and the producer digest of the envelope '
     "equals the original event's (EN17)", 'original_refused', "value['event_payload'] != value['original_payload']"),
])
module('ev_outcome_ref', 'Outcome source reference.', [
    ('OC07_outcome_ref', '/payload_outcome_ref', 'a payload outcome_ref is the outcome source_ref', 'original_refused',
     "value['payload_outcome_ref'] != value['outcome_source_ref']"),
])
module('ev_reader', 'Installed operating reader.', [
    ('RD01_reader_current', '/reader_withdrawn', 'the reader is not withdrawn', 'reader_unavailable',
     "value['reader_withdrawn']"),
    ('RD02_reader_version', '/reader_installed', 'the installed reader is the family consumer', 'reader_unavailable',
     "value['reader_installed'] != value['consumer']"),
])
module('ev_disclosure', 'Current disclosure: permission, deletion and share.', [
    ('DS01_permission', '/permission_now', 'permission holds now', 'disclosure_refused', "not value['permission_now']"),
    ('DS02_not_deleted', '/source_deleted_now', 'the source is not deleted now', 'disclosure_refused',
     "value['source_deleted_now']"),
    ('DS03_share', '/share_current', 'the share is current', 'disclosure_refused', "not value['share_current']"),
])
module('ev_disclosure_owner', 'Current disclosure: owner authorization.', [
    ('DS04_owner_authorized', '/owner_command_authorized', 'the current owner command is authorized', 'disclosure_refused',
     "not value['owner_command_authorized']"),
])
module('ev_append_recovery', 'New append recovery of an original with no receipt.', [
    ('AR01_permission', '/permission_now', 'permission holds now', 'append_recovery_refused', "not value['permission_now']"),
    ('AR02_not_deleted', '/source_deleted_now', 'the source is not deleted now', 'append_recovery_refused',
     "value['source_deleted_now']"),
    ('AR03_share', '/share_current', 'the share is current', 'append_recovery_refused', "not value['share_current']"),
])
module('ev_receipt_pending', 'A non-recovery operation needs the first receipt.', [
    ('RP01_receipt_present', '/receipt_present', 'the first receipt is present (else PENDING)', 'pending',
     "value['receipt_present'] is not True"),
])
module('ev_publish', 'Publication of an original.', [
    ('PB01_receipt_retained', '/receipt_retained', 'the receipt is retained (else PENDING)', 'pending',
     "not value['receipt_retained']"),
])
module('ev_rebuild', 'Rebuild prefix.', [
    ('RB01_prefix_complete', '/retained_prefix_complete', 'the retained prefix is complete', 'unavailable',
     "not value['retained_prefix_complete']"),
])
module('wd_gate', 'Writer withdrawal admission.', [
    ('WD01_admitted_present', '/admitted_present', 'the admitted sequence is present', 'withdrawal_refused',
     "value['admitted_present'] is not True"),
    ('WD02_admitted_uint64', '/admitted_refusal', 'the admitted sequence is a Storage uint64 (storage_uint64)',
     'withdrawal_refused', "value['admitted_present'] is True and value['admitted_refusal'] is not None"),
    ('WD03_frontier_uint64', '/frontier_refusal', 'the withdrawal frontier is a Storage uint64 (storage_uint64)',
     'withdrawal_refused', "value['admitted_present'] is True and value['frontier_refusal'] is not None"),
    ('WD04_admitted_within', '/admitted_sequence', 'the admitted sequence is at most the withdrawal frontier',
     'withdrawal_refused', "value['admitted_refusal'] is None and value['frontier_refusal'] is None "
     "and value['admitted_present'] is True and value['admitted_sequence'] > value['withdrawal_frontier']"),
])

# ------------------------------------------------------------------ checkpoint / rebuild
module('cp_guard', 'Checkpoint CAS, state, token selection and live snapshot.', [
    ('CG01_cas_previous', '/expected_previous', 'the expected previous checkpoint is the stored one (CAS)', 'checkpoint_refused',
     "value['expected_previous'] != value['stored_previous']"),
    ('CG06_state_current', '/state', 'the proposed checkpoint state is current', 'checkpoint_refused',
     "value['state'] != 'current'"),
    ('CG07_token_selected', '/token', 'the checkpoint token is the selected token', 'checkpoint_refused',
     "value['token'] != value['selected_token']"),
    ('CG08_live_snapshot', '/live_snapshot_id', 'the live snapshot is the current one', 'checkpoint_refused',
     "value['live_snapshot_id'] != value['current_live_snapshot_id']"),
])
module('cp_scope', 'Checkpoint scope joined to the payload.', [
    ('CG10_project', '/checkpoint_project_id', 'the checkpoint project is the payload project', 'checkpoint_refused',
     "value['checkpoint_project_id'] != value['payload_project_id']"),
    ('CG11_scope', '/checkpoint_scope', 'the checkpoint scope is the payload scope', 'checkpoint_refused',
     "value['checkpoint_scope'] != value['payload_scope']"),
])
module('cp_source', 'Selected global source.', [
    ('CS01_source_storage', '/source_storage_instance_id', 'the source Storage instance is the event instance',
     'checkpoint_refused', "value['source_storage_instance_id'] != value['storage_instance_id']"),
    ('CS02_source_token', '/source_token', 'the source token is the checkpoint token', 'checkpoint_refused',
     "value['source_token'] != value['token']"),
    ('CS03_source_high', '/source_last_sequence', 'the source last sequence is the selected high', 'checkpoint_refused',
     "value['source_last_sequence'] != value['selected_high']"),
    ('CS04_source_contiguous', '/source_sequences', 'the source rows are exactly first..last', 'checkpoint_refused',
     "value['source_sequences'] != value['expected_source_sequences']"),
    ('CS05_source_partitions', '/row_partitions', 'every source row partition is the encoded partition of its scope',
     'checkpoint_refused', "value['row_partitions'] != value['expected_row_partitions']"),
])
module('cp_row', 'One matching source row resolved to its own original.', [
    ('CR01_row_original', '/original_object', 'the matching row resolves an original record', 'checkpoint_refused',
     "value['original_object'] is not True"),
    ('CR02_row_fields', '/row', 'every row field equals its own original', 'checkpoint_refused',
     "value['original_object'] is True and value['row'] != value['expected_row']"),
])
module('cp_row_entailed', 'A retained matching original reads as ORIGINAL (entailed: the nested read refuses first).', [
    ('CR03_row_original_read', '/nested_result', 'a retained original of a matching row reads as ORIGINAL', 'checkpoint_refused',
     "value['nested_result'] not in (None, 'ORIGINAL')"),
])
module('cp_range', 'Checkpoint advance range.', [
    ('CN01_low', '/scan_low', 'the scan starts right after the prior checkpoint (or at the source start)', 'checkpoint_refused',
     "value['scan_low'] != value['expected_low']"),
    ('CN02_rows', '/index_rows', 'the index rows are exactly the source rows in low..high', 'checkpoint_refused',
     "value['index_rows'] != value['expected_rows']"),
    ('CN04_through', '/through_sequence_id', 'the checkpoint advances through the scan high', 'checkpoint_refused',
     "value['through_sequence_id'] != value['scan_high']"),
    ('CN05_selected_high', '/scan_high', 'the scan high is the selected high', 'checkpoint_refused',
     "value['scan_high'] != value['selected_high']"),
])
module('cp_range_entailed', 'Index rows contiguous (entailed: CS04, CN02 and CN05).', [
    ('CN03_contiguous', '/row_sequences', 'the index rows are exactly low..high; entailed: the source rows are contiguous '
     '(CS04), the index rows are the source rows in low..high (CN02) and high is the source high (CS03, CN05)',
     'checkpoint_refused', "value['row_sequences'] != value['expected_row_sequences']"),
])
module('cp_prior_entailed', 'Prior token Storage instance (entailed: TK01 on both tokens).', [
    ('CN06_prior_storage', '/prior_storage_instance_id', 'prior token Storage instance equals the token; entailed: TK01 '
     'binds both the token and the prior token to the event Storage instance', 'checkpoint_refused',
     "value['prior_storage_instance_id'] != value['storage_instance_id']"),
])
module('cp_prior', 'Prior checkpoint joined to the proposed one.', [
    ('CN07_prior_generation', '/prior_generation_id', 'prior token generation equals the token', 'checkpoint_refused',
     "value['prior_generation_id'] != value['generation_id']"),
    ('CN08_prior_anchor', '/prior_anchor', 'prior token generation anchor equals the token', 'checkpoint_refused',
     "value['prior_anchor'] != value['anchor']"),
    ('CN09_prior_project', '/prior_project_id', 'prior project equals the checkpoint project', 'checkpoint_refused',
     "value['prior_project_id'] != value['checkpoint_project_id']"),
    ('CN10_prior_scope', '/prior_scope', 'prior scope equals the checkpoint scope', 'checkpoint_refused',
     "value['prior_scope'] != value['checkpoint_scope']"),
    ('CN11_prior_current', '/prior_state', 'the prior checkpoint is current', 'checkpoint_refused',
     "value['prior_state'] != 'current'"),
])
module('cp_matches', 'Checkpoint last match.', [
    ('CE01_prior_earlier', '/earlier', 'a prior checkpoint follows an earlier match', 'checkpoint_refused',
     "value['prior_present'] is True and value['earlier'] == []"),
    ('CE02_prior_last', '/prior_last_event_id', 'the prior last event is the last earlier match', 'checkpoint_refused',
     "value['prior_present'] is True and value['earlier'] != [] and value['prior_last_event_id'] != value['earlier'][-1]"),
    ('CE03_last_exists', '/last', 'a checkpoint has a first match', 'checkpoint_refused', "value['last'] is None"),
    ('CE04_selected_matches', '/matches', 'the matches are the selected matches', 'checkpoint_refused',
     "value['last'] is not None and value['matches'] != value['selected_matches']"),
    ('CE05_last_event', '/checkpoint_last_event_id', 'the checkpoint last event is the last match', 'checkpoint_refused',
     "value['last'] is not None and value['checkpoint_last_event_id'] != value['last']"),
])

# ------------------------------------------------------------------ stored values and migration
module('vv_size', 'Stored value physical size.', [
    ('VV01_encodable', '/size', 'the value has an exact SP-1100 EVENT_VALUE encoding', 'value_size', "value['size'] is None"),
    ('VV02_size_limit', '/size', 'the encoded value is at most 16384 bytes', 'value_size',
     "value['size'] is not None and value['size'] > 16384"),
])
module('vv_dap', 'Dev session record v2 subordinate DAP value.', [
    ('VV03_dap_project', '/dap_project_id', 'the DAP project is the record project', 'value_dap',
     "value['dap_project_id'] != value['project_id']"),
    ('VV04_dap_session', '/dap_dev_session_id', 'the DAP dev session is the record session', 'value_dap',
     "value['dap_dev_session_id'] != value['dev_session_id']"),
    ('VV05_dap_topology', '/topology_project_id', 'the DAP topology project is the record project', 'value_dap',
     "value['topology_project_id'] != value['project_id']"),
    ('VV06_dap_semantics', '/dap_errors', 'the DAP value passes the existing dev_session_record semantic rules', 'value_dap',
     "value['dap_errors'] != 0"),
])
module('mg_evidence', 'Migration evidence verification.', [
    ('MG01_verified', '/verified', 'the migration evidence is verified', 'migration_refused', "not value['verified']"),
    ('MG02_backup_verified', '/backup_verified', 'the backup is verified', 'migration_refused', "not value['backup_verified']"),
])
module('mg_dap', 'DAP v1 migration source.', [
    ('MG03_dap_semantics', '/source_errors', 'the DAP v1 source passes the existing dev_session_record semantic rules',
     'migration_refused', "value['source_errors'] != 0"),
    ('MG04_project', '/source_project_id', 'the source project is the evidence project', 'migration_refused',
     "value['source_project_id'] != value['evidence_project_id']"),
    ('MG05_dev_session', '/source_dev_session_id', 'the source dev session is the evidence session', 'migration_refused',
     "value['source_dev_session_id'] != value['evidence_dev_session_id']"),
])
module('mg_preview', 'Preview v1 migration source.', [
    ('MG06_one_mapping', '/mapping_count', 'exactly one verified mapping', 'migration_refused', "value['mapping_count'] != 1"),
    ('MG07_preview', '/mapping_preview_id', 'the mapping preview is the source preview', 'migration_refused',
     "value['mapping_count'] == 1 and value['mapping_preview_id'] != value['source_preview_id']"),
    ('MG08_source_file', '/mapping_source_file', 'the mapping source file is the source file', 'migration_refused',
     "value['mapping_count'] == 1 and value['mapping_source_file'] != value['source_file']"),
    ('MG09_status', '/source_status', 'the legacy status is starting, running, stopped or error', 'migration_refused',
     "value['mapping_count'] == 1 and value['source_status'] not in ('starting', 'running', 'stopped', 'error')"),
])
module('mg_chip', 'Capture chip migration source.', [
    ('MG10_thread', '/source_thread_id', 'the chip thread is the evidence thread', 'migration_refused',
     "value['source_thread_id'] != value['evidence_thread_id']"),
    ('MG11_scope', '/source_scope', 'the chip scope is the evidence scope', 'migration_refused',
     "value['source_scope'] != value['evidence_scope']"),
])

module('raw_ingress', 'CV-1100 raw JSON ingress of an operation input.', [
    ('RI01_current_json', '/parse_refusal', 'the operation text parses under loads_current_json (no -0, 01, nonfinite, '
     'duplicate key or lone surrogate)', 'raw_json_refused', "value['parse_refusal'] is not None"),
])

# ------------------------------------------------------------------ number harness boundaries
module('nm_atom', 'CV-1100 current integer at a slot with no owner bound (numeric atom harness).', [
    ('NM01_current_integer', '/refusal', 'current_integer accepts the value', 'number_refused', "value['refusal'] is not None"),
])
module('pr_digest', 'CV-1100 producer digest of a current envelope (numeric digest harness).', [
    ('PR01_producer_digest', '/refusal', 'producer_semantic_digest qualifies the projection (owner integer paths '
     'type-sensitive)', 'producer_unqualified', "value['refusal'] is not None"),
])

# ------------------------------------------------------------------ deck 2
module('d2_grants', 'Deck-2 browser grants: one grant per recipient thread.', [
    ('G01_before_unique', '/before_threads', 'the grants before have distinct threads', 'transition_refused',
     "len(value['before_threads']) != len(set(value['before_threads']))"),
    ('G02_after_unique', '/after_threads', 'the grants after have distinct threads', 'transition_refused',
     "len(value['after_threads']) != len(set(value['after_threads']))"),
])
module('d2_tr_browser', 'Deck-2 browser share/revoke transition.', [
    ('TB21_no_capture', '/capture_created', 'sharing creates no page capture', 'transition_refused',
     "value['capture_created']"),
    ('TB22_session', '/transition_session_id', 'the transition BrowserSession is the payload session', 'transition_refused',
     "value['transition_session_id'] != value['payload_session_id']"),
    ('TB23_existing_grant', '/existing_grant', 'a recipient already shared keeps its own grant ref', 'transition_refused',
     "value['family'] == 'browser.context_shared' and value['existing_grant'] is not None "
     "and value['existing_grant'] != value['payload_grant_ref']"),
    ('TB24_recipient_scope', '/recipient_scope', 'the recipient scope is the payload scope', 'transition_refused',
     "value['family'] == 'browser.context_shared' and value['recipient_scope'] != value['payload_scope']"),
    ('TB25_after_grants', '/after_grants', 'the grants after are exactly the decided result', 'transition_refused',
     "value['after_grants'] != value['wanted_grants']"),
])
module('d2_tr_catalog_a', 'Deck-2 catalog update/remove: listed uses and owner rules.', [
    ('TC01_listed_uses', '/unlisted_uses', 'every use is a listed use of the item type', 'transition_refused',
     "value['unlisted_uses'] != []"),
    ('TC02_owner_rules', '/owner_rules_satisfied', 'the existing owner rules are satisfied', 'transition_refused',
     "not value['owner_rules_satisfied']"),
    ('TC03_override', '/override_preserved', 'overrides are preserved', 'transition_refused', "not value['override_preserved']"),
    ('TC04_external_data', '/external_data_preserved', 'external-service data is preserved', 'transition_refused',
     "not value['external_data_preserved']"),
    ('TC05_request_versions', '/request_versions_preserved', 'selected request versions are preserved', 'transition_refused',
     "not value['request_versions_preserved']"),
    ('TC06_renewed_approval', '/renewed_approval_satisfied', 'renewed approval is satisfied', 'transition_refused',
     "not value['renewed_approval_satisfied']"),
    ('TC07_credentials', '/credentials_current', 'credentials are current', 'transition_refused',
     "not value['credentials_current']"),
])
module('d2_tr_catalog_b', 'Deck-2 catalog update/remove: recovery, version and queue.', [
    ('TC08_recovery', '/recovery_ready', 'recovery is ready', 'transition_refused', "not value['recovery_ready']"),
    ('TC09_previous_version', '/previous_version', 'the transition previous version is the payload previous version',
     'transition_refused', "value['previous_version'] != value['payload_previous_version']"),
    ('TC10_not_queued', '/queued', 'the operation is not queued', 'transition_refused', "value['queued']"),
])
module('d2_tr_update', 'Deck-2 catalog.update.* transition.', [
    ('TC11_safe_boundary', '/safe_boundary_confirmed', 'the safe reload/start boundary is confirmed', 'transition_refused',
     "not value['safe_boundary_confirmed']"),
    ('TC12_target_version', '/target_version', 'the transition target is the payload target', 'transition_refused',
     "value['target_version'] != value['payload_target_version']"),
    ('TC13_stage', '/stage', 'the stage is applying (started) or effective (completed)', 'transition_refused',
     "value['stage'] != value['expected_stage']"),
    ('TC14_effective', '/effective_version', 'the transition effective version is the payload effective version',
     'transition_refused', "value['effective_version'] != value['payload_effective_version']"),
    ('TC15_effective_rule', '/payload_effective_version', 'the effective version is the previous (started) or target (completed)',
     'transition_refused', "value['payload_effective_version'] != value['expected_effective_version']"),
    ('TC16_installed', '/installed_available', 'the item stays installed and available', 'transition_refused',
     "not value['installed_available']"),
])
module('d2_tr_remove', 'Deck-2 catalog.remove.* transition.', [
    ('TC17_no_uses', '/uses', 'removal proceeds only with no use left', 'transition_refused', "value['uses'] != []"),
    ('TC18_stage', '/stage', 'the stage is removing (started) or removed (completed)', 'transition_refused',
     "value['stage'] != value['expected_stage']"),
    ('TC19_installed', '/installed_available', 'the item is installed until completed', 'transition_refused',
     "value['installed_available'] is not value['expected_installed']"),
])
module('d2_tr_skipped', 'Deck-2 tool.custom_headless.skipped transition.', [
    ('TS01_config_absent', '/config_present', 'the optional setting is absent', 'transition_refused',
     "value['config_present']"),
    ('TS02_notice_unused', '/notice_before', 'the Project chance was unused', 'transition_refused',
     "value['notice_before'] != 'unused'"),
    ('TS03_notice_issued', '/notice_after', 'the notice is issued', 'transition_refused', "value['notice_after'] != 'issued'"),
    ('TS04_first_check', '/first_absent_check_id', 'the first absent check is the payload invocation', 'transition_refused',
     "value['first_absent_check_id'] != value['payload_doctor_invocation_id']"),
    ('TS05_eligibility', '/eligibility_project_id', 'the eligibility Project is the payload Project', 'transition_refused',
     "value['eligibility_project_id'] != value['payload_project_id']"),
    ('TS06_project_saved', '/project_id_saved', 'the Project ID is saved', 'transition_refused',
     "not value['project_id_saved']"),
])
module('d2_tr_skipped_origin', 'Deck-2 tool.custom_headless.skipped Project origin.', [
    ('TS07_fresh_source', '/source_project_id', 'a clone or import with a new ID records its source Project',
     'transition_refused', "value['project_origin'] in ('clone_new_id', 'import_new_id') and value['source_project_id'] is None"),
    ('TS08_fresh_distinct', '/source_project_id', 'a clone or import with a new ID has a different saved Project ID',
     'transition_refused', "value['project_origin'] in ('clone_new_id', 'import_new_id') "
     "and value['source_project_id'] is not None and value['source_project_id'] == value['payload_project_id']"),
    ('TS09_restore_same', '/source_project_id', 'a same-ID restore keeps its source Project', 'transition_refused',
     "value['project_origin'] == 'restore_same_id' and value['source_project_id'] != value['payload_project_id']"),
])
module('d2_pl_gate', 'Deck-2 current transition authorization and joins.', [
    ('PG01_owner_authorized', '/owner_command_authorized', 'the owner command is authorized', 'transition_refused',
     "not value['owner_command_authorized']"),
    ('PG02_outcome_committed', '/outcome_committed', 'the owner outcome is committed', 'transition_refused',
     "not value['outcome_committed']"),
    ('PG03_scope', '/context_scope', 'the context scope equals the payload scope', 'transition_refused',
     "value['context_scope'] != value['payload_scope']"),
    ('PG04_envelope_project', '/envelope_project_id', 'the context envelope project equals the scope project',
     'transition_refused', "value['envelope_project_id'] != value['scope_project_id']"),
    ('PG06_session_class', '/session_security_class', 'a browser family has an ordinary session', 'transition_refused',
     "value['browser_family'] is True and value['session_security_class'] != 'ordinary'"),
    ('PG07_safe_refs', '/unsafe_refs', 'no payload string is an absolute path, token-shaped or a forbidden ref',
     'transition_refused', "value['unsafe_refs'] != []"),
])
module('d2_pl_gate_entailed', 'Deck-2 context envelope run (entailed: the deck-2 context schema fixes envelope_run_id to null).', [
    ('PG05_no_run', '/envelope_run_id', 'the context envelope has no run', 'transition_refused',
     "value['envelope_run_id'] is not None"),
])
module('d2_or_bytes', 'Deck-2 owner record text resolved by payload outcome_ref.', [
    ('OR01_record_text', '/raw_type', 'the owner bank holds exact text for outcome_ref', 'owner_record_missing',
     "value['raw_type'] != 'str'"),
    ('OR02_record_json', '/parse_refusal', 'the record text parses under CV-1100 loads_current_json', 'owner_record_json',
     "value['raw_type'] == 'str' and value['parse_refusal'] is not None"),
])
module('d2_env_a', 'Deck-2 EventRecord dispatch and policy.', [
    ('DE01_event_type', '/event_type', 'the envelope event type is the family', 'envelope_dispatch',
     "value['event_type'] != value['family_event_type']"),
    ('DE02_original_type', '/original_event_type', 'the original event type is the family', 'envelope_dispatch',
     "value['original_event_type'] != value['family_event_type']"),
    ('DE03_payload_schema', '/payload_schema_id', 'equals the family payload schema $id', 'envelope_dispatch',
     "value['payload_schema_id'] != value['family_payload_schema_id']"),
    ('DE04_envelope_dedupe', '/envelope_policy', 'a current envelope is dedupe_by_idempotency_key', 'envelope_policy',
     "value['historical'] is not True and value['envelope_policy'] != 'dedupe_by_idempotency_key'"),
    ('DE05_original_dedupe', '/original_policy', 'a current write\'s original is dedupe_by_idempotency_key',
     'envelope_policy', "value['historical'] is not True and value['original_policy'] != 'dedupe_by_idempotency_key'"),
])
module('d2_env_b', 'Deck-2 EventRecord joins.', [
    ('DE07_project', '/project_id', 'equals the payload scope project', 'envelope_join',
     "value['project_id'] != value['scope_project_id']"),
    ('DE08_payload_copy', '/envelope_payload', 'the envelope payload equals the payload (typed)', 'envelope_join',
     "value['envelope_payload'] != value['payload']"),
    ('DE09_thread', '/thread_id', 'equals the payload thread_id', 'envelope_join',
     "value['thread_id'] != value['payload_thread_id']"),
    ('DE10_no_run', '/run_id', 'the envelope has no run', 'envelope_join', "value['run_id'] is not None"),
    ('DE11_context_scope', '/context_scope', 'the context scope equals the payload scope', 'envelope_join',
     "value['context_scope'] != value['payload_scope']"),
])
module('d2_env_b_entailed', 'Deck-2 envelope scope kind (entailed: the EventRecord schema ties scope_kind to a null or present project_id, and DE07 joins that project_id to the payload scope).', [
    ('DE06_scope_kind', '/scope_kind', 'equals the payload scope kind', 'envelope_join',
     "value['scope_kind'] != value['expected_scope_kind']"),
])
module('d2_env_c', 'Deck-2 EventRecord partition and owner record joins.', [
    ('ER01_record_payload', '/record_payload', 'the owner record payload equals the payload (typed)', 'owner_record_join',
     "value['record_payload'] != value['payload']"),
    ('ER02_record_storage', '/record_storage_instance_id', 'the owner record Storage instance is the operation instance',
     'owner_record_join', "value['record_storage_instance_id'] != value['storage_instance_id']"),
    ('ER03_record_scope', '/record_scope', 'the owner record scope is the payload scope', 'owner_record_join',
     "value['record_scope'] != value['payload_scope']"),
    ('ER04_record_original_transition', '/record_transition', 'the owner record transition is the original transition',
     'owner_record_join', "value['record_transition'] != value['original_transition']"),
    ('ER06_record_committed', '/record_committed', 'the owner record is committed', 'owner_record_join',
     "not value['record_committed']"),
    ('ER07_record_current_transition', '/record_transition', 'a current write\'s record transition is the current transition',
     'owner_record_join', "value['retry'] is not True and value['record_transition'] != value['current_transition']"),
])
module('d2_env_c_entailed', 'Deck-2 owner record event type (entailed: the sources schema fixes event_type per family definition).', [
    ('ER05_record_event_type', '/record_event_type', 'the owner record event type is the family', 'owner_record_join',
     "value['record_event_type'] != value['family_event_type']"),
])
module('d2_env_d', 'Deck-2 owner record operation and application custody.', [
    ('ER08_record_operation', '/record_operation_id', 'the owner record operation is the payload operation_id',
     'owner_record_join', "value['has_operation'] is True and value['record_operation_id'] != value['payload_operation_id']"),
    ('ER09_app_source', '/source', 'the application source is the owner record Server/operation', 'application_source',
     "value['application'] is True and value['source'] != value['expected_source']"),
    ('ER10_app_original_source', '/original_source', 'the original source is the owner record Server/operation',
     'application_source', "value['application'] is True and value['original_source'] != value['expected_source']"),
])
module('d2_env_storage', 'Deck-2 EventRecord Storage partition and inline size.', [
    ('DE12_partition', '/scope_partition', 'equals the encoded Storage partition of the envelope scope', 'envelope_storage',
     "value['scope_partition'] != value['expected_partition']"),
    ('DE13_payload_encodable', '/payload_size', 'the payload has an exact SP-1100 EVENT_VALUE encoding', 'envelope_storage',
     "value['payload_size'] is None"),
])
module('d2_env_storage_entailed', 'Deck-2 inline size (entailed: every deck-2 payload schema bounds every string to 256 characters, so no admitted payload reaches 16384 encoded bytes).', [
    ('DE14_inline_limit', '/payload_size', 'the encoded inline payload is at most 16384 bytes (SP-337)', 'envelope_storage',
     "value['payload_size'] is not None and value['payload_size'] > 16384"),
])
module('d2_ev_bank', 'Deck-2 original-evidence carrier holds the owner bank.', [
    ('EB21_bank_present', '/bank_present', 'the carrier is an object holding owner_records', 'evidence_refused',
     "value['bank_present'] is not True"),
])
module('d2_request', 'Deck-2 catalog request policy refusals.', [
    ('CQ01_owner_rules', '/owner_rules_satisfied', 'the existing owner rules are satisfied', 'request_refused',
     "not value['owner_rules_satisfied']"),
    ('CQ02_remove_installed', '/installed_available', 'a refused removal keeps the item installed', 'request_refused',
     "value['remove'] is True and value['listed_uses_present'] is True and not value['installed_available']"),
    ('CQ03_remove_not_queued', '/queued', 'a refused removal queues nothing', 'request_refused',
     "value['remove'] is True and value['listed_uses_present'] is True and value['installed_available'] and value['queued']"),
    ('CQ04_update_verified', '/effective_version', 'a deferred update keeps the verified version effective', 'request_refused',
     "value['remove'] is False and value['listed_uses_present'] is True and value['effective_version'] != value['previous_version']"),
    ('CQ05_update_installed', '/installed_available', 'a deferred update keeps the item installed', 'request_refused',
     "value['remove'] is False and value['listed_uses_present'] is True and value['effective_version'] == value['previous_version'] "
     "and not value['installed_available']"),
])


def fields_of(rows):
    names = []
    for _, _, _, _, cond in rows:
        for part in cond.split("value['")[1:]:
            name = part.split("'", 1)[0]
            if name not in names:
                names.append(name)
    return tuple(names)


def render(name, doc, rows):
    fields = fields_of(rows)
    lines = [
        f'"""DS15 guard table {name}: {doc}',
        '',
        'Method B guard rows (scripts/pm_guard_isolation.py) for the DS15 checkers. Each predicate reads one',
        'observation the checker derives from the complete boundary input (recomputed hashes and identities,',
        'canonical-byte sizes, resolved records, presence, typed copies). Predicates never recompute, repair or',
        'call helpers. The checkers refuse only through these rows, in this order',
        '(pm-ds15-event-contracts.py:refusal), and check that every factory requires its rows in table order.',
        'FIELDS names every observation the rows read; the checker passes no other.',
        'Generated by scripts/pm-ds15-table-generate.py; edit the row spec there.',
        '"""',
        'import pm_guard_isolation as g',
        '',
        f'FIELDS = {fields!r}',
        '',
    ]
    for row, _, _, code, cond in rows:
        lines += ['', f'def {row}(value, context):', f'    return {code!r} if {cond} else None', '']
    lines += ['', 'def case(value):', '    context = None', '    table = g.GuardTable([']
    for row, field, words, code, _ in rows:
        lines.append(f'        g.Guard({row!r}, g.Invariant({field!r}, {words!r}), {code!r}, {row}),')
    lines += ['    ])', '', '    def check(value):']
    for row, *_ in rows:
        lines.append(f'        table.require({row!r}, value, context)')
    lines += ['        return True', '    return g.Case(table, check, context)', '']
    return '\n'.join(lines)


def main():
    out = Path(sys.argv[1])
    check = '--check' in sys.argv[2:]
    wanted = {PREFIX + name + '.py': render(name, *spec) for name, spec in MODULES.items()}
    stale = []
    for filename, text in sorted(wanted.items()):
        path = out / filename
        if check:
            if not path.exists() or path.read_text() != text:
                stale.append(filename)
        else:
            path.write_text(text)
    extra = sorted(p.name for p in out.glob(PREFIX + '*.py') if p.name not in wanted)
    rows = sum(len(spec[1]) for spec in MODULES.values())
    print(f'{len(MODULES)} tables, {rows} rows; stale {stale}; extra {extra}')
    return 1 if (check and stale) or extra else 0


if __name__ == '__main__':
    sys.exit(main())
