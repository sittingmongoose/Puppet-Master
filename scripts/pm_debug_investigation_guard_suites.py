"""Guard-isolation suites for the DDBG lane (Method B adapter, scripts/pm_guard_isolation.py).

One g.Suite per checker phase; each phase module is its own checker module, so
a suite's static scan covers exactly the predicates its table registers. Run a
suite from a working directory outside the repository:

    python3 -B <repo>/scripts/pm_guard_isolation.py \\
        --adapter <repo>/scripts/pm_debug_investigation_guard_suites.py:lifecycle_suite \\
        --json lifecycle.json --markdown lifecycle.md

(Third-party generated code carries pseudo file names such as '<string>',
which the tool resolves against the working directory; inside the repository
they read as unscanned repository code and the run fails closed.)

Proof inputs are the fixture candidates without their fixture-suite lists
(pm_debug_investigation_transitions.candidate): no checker reads those lists.
Every control and negative is lane fixture data or a shared probe builder in
pm_debug_investigation_transitions.py; each negative names the one row it
violates. The NON_GUARDS reasons are reviewer obligations, one per flagged
plumbing site of each phase module.
"""
import copy
import json
from pathlib import Path

import pm_guard_isolation as g
import pm_debug_investigation_transitions as production

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = 'Plans/debug_investigation_event_fixtures.json'
SCHEMA = 'Plans/debug_investigation_event_payloads.schema.json'
PREFIX = 'debug.investigation.'

NON_GUARDS = {
    'envelope': [
        ('envelope_case', 'return', 'return g.Case(table, check, context)',
         'Return the fresh execution object built for this candidate; it decides no acceptance.'),
        ('envelope_case', 'call_review', "case_value.get('project_id')",
         'Compute the encoded Project partition (unpadded base64url of a nonempty string project_id) the canon requires; the envelope.partition row compares it, and any other project_id leaves None for envelope.project_id to refuse.'),
        ('envelope_case', 'call_review', "base64.urlsafe_b64encode(project.encode()).decode().rstrip('=')",
         'Compute the encoded Project partition (unpadded base64url of a nonempty string project_id) the canon requires; the envelope.partition row compares it, and any other project_id leaves None for envelope.project_id to refuse.'),
        ('envelope_case', 'call_review', 'base64.urlsafe_b64encode(project.encode()).decode()',
         'Compute the encoded Project partition (unpadded base64url of a nonempty string project_id) the canon requires; the envelope.partition row compares it, and any other project_id leaves None for envelope.project_id to refuse.'),
        ('envelope_case', 'call_review', 'base64.urlsafe_b64encode(project.encode())',
         'Compute the encoded Project partition (unpadded base64url of a nonempty string project_id) the canon requires; the envelope.partition row compares it, and any other project_id leaves None for envelope.project_id to refuse.'),
        ('envelope_case', 'call_review', 'project.encode()',
         'Compute the encoded Project partition (unpadded base64url of a nonempty string project_id) the canon requires; the envelope.partition row compares it, and any other project_id leaves None for envelope.project_id to refuse.'),
        ('envelope_case', 'data_operation', "if type(project) is str and project:\n    partition = PROJECT_PREFIX + base64.urlsafe_b64encode(project.encode()).decode().rstrip('=')",
         'Compute the encoded Project partition (unpadded base64url of a nonempty string project_id) the canon requires; the envelope.partition row compares it, and any other project_id leaves None for envelope.project_id to refuse.'),
        ('envelope_case', 'data_operation', 'type(project) is str and project',
         'Compute the encoded Project partition (unpadded base64url of a nonempty string project_id) the canon requires; the envelope.partition row compares it, and any other project_id leaves None for envelope.project_id to refuse.'),
        ('envelope_case', 'data_operation', 'case_value.get',
         'Compute the encoded Project partition (unpadded base64url of a nonempty string project_id) the canon requires; the envelope.partition row compares it, and any other project_id leaves None for envelope.project_id to refuse.'),
        ('envelope_case', 'data_operation', "PROJECT_PREFIX + base64.urlsafe_b64encode(project.encode()).decode().rstrip('=')",
         'Compute the encoded Project partition (unpadded base64url of a nonempty string project_id) the canon requires; the envelope.partition row compares it, and any other project_id leaves None for envelope.project_id to refuse.'),
        ('envelope_case', 'data_operation', 'base64.urlsafe_b64encode(project.encode()).decode().rstrip',
         'Compute the encoded Project partition (unpadded base64url of a nonempty string project_id) the canon requires; the envelope.partition row compares it, and any other project_id leaves None for envelope.project_id to refuse.'),
        ('envelope_case', 'data_operation', 'base64.urlsafe_b64encode(project.encode()).decode',
         'Compute the encoded Project partition (unpadded base64url of a nonempty string project_id) the canon requires; the envelope.partition row compares it, and any other project_id leaves None for envelope.project_id to refuse.'),
        ('envelope_case', 'data_operation', 'base64.urlsafe_b64encode',
         'Compute the encoded Project partition (unpadded base64url of a nonempty string project_id) the canon requires; the envelope.partition row compares it, and any other project_id leaves None for envelope.project_id to refuse.'),
        ('envelope_case', 'data_operation', 'project.encode',
         'Compute the encoded Project partition (unpadded base64url of a nonempty string project_id) the canon requires; the envelope.partition row compares it, and any other project_id leaves None for envelope.project_id to refuse.'),
    ],
    'payload': [
        ('payload_subject', 'return', "return value.get('payload')",
         'Schema selector: read the subject the schema rows judge; a missing member yields None, which the subject type row refuses.'),
        ('payload_case', 'return', 'return g.Case(table, check, context)',
         'Return the fresh execution object built for this candidate; it decides no acceptance.'),
        ('payload_subject', 'call_review', "value.get('payload')",
         'Schema selector: read the subject the schema rows judge; a missing member yields None, which the subject type row refuses.'),
        ('payload_case', 'call_review', "g.SchemaCatalog(DOCUMENTS[case_value.get('event_type')], roots=PAYLOAD_ROOTS)",
         'Build a fresh closed schema catalog from the per-phase documents the loader injected once before any case.'),
        ('payload_case', 'call_review', 'g.schema_table(catalog, {PAYLOAD_URI: payload_subject})',
         'Build the fresh guard table: the named code rows plus one row per supported schema assertion.'),
        ('payload_case.check', 'call_review', 'table.validate(PAYLOAD_URI, value, context)',
         'Run the schema boundary through the table; the engine attributes any refusal to its schema row.'),
        ('payload_case', 'call_review', "case_value.get('event_type')",
         'Read the family event type to select that family document; every candidate carries it.'),
        ('payload_subject', 'data_operation', 'value.get',
         'Schema selector: read the subject the schema rows judge; a missing member yields None, which the subject type row refuses.'),
        ('payload_case', 'data_operation', "DOCUMENTS[case_value.get('event_type')]",
         'Select the injected schema document of this phase or family; the loader sets it before any case.'),
        ('payload_case', 'data_operation', '{PAYLOAD_URI: payload_subject}',
         'Bind the one consumed schema root to its selector.'),
        ('payload_case', 'data_operation', 'case_value.get',
         'Read the family event type to select that family document; every candidate carries it.'),
    ],
    'target_payload': [
        ('payload_subject', 'return', "return value.get('payload')",
         'Schema selector: read the subject the schema rows judge; a missing member yields None, which the subject type row refuses.'),
        ('target_payload_case', 'return', 'return g.Case(table, check, context)',
         'Return the fresh execution object built for this candidate; it decides no acceptance.'),
        ('payload_subject', 'call_review', "value.get('payload')",
         'Schema selector: read the subject the schema rows judge; a missing member yields None, which the subject type row refuses.'),
        ('target_payload_case', 'call_review', "g.SchemaCatalog(DOCUMENTS[case_value.get('event_type')], roots=PAYLOAD_ROOTS)",
         'Build a fresh closed schema catalog from the per-phase documents the loader injected once before any case.'),
        ('target_payload_case', 'call_review', "g.schema_table(catalog, {PAYLOAD_URI: payload_subject}, guards=[g.Guard('payload.target_sha256_hex', g.Invariant('/payload/target_bindings/source_sha256', 'has only lowercase hexadecimal characters'), 'invalid_payload', target_sha256_hex)])",
         'Build the fresh guard table: the named code rows plus one row per supported schema assertion.'),
        ('target_payload_case.check', 'call_review', 'table.validate(PAYLOAD_URI, value, context)',
         'Run the schema boundary through the table; the engine attributes any refusal to its schema row.'),
        ('target_payload_case', 'call_review', "case_value.get('event_type')",
         'Read the family event type to select that family document; every candidate carries it.'),
        ('payload_subject', 'data_operation', 'value.get',
         'Schema selector: read the subject the schema rows judge; a missing member yields None, which the subject type row refuses.'),
        ('target_payload_case', 'data_operation', "DOCUMENTS[case_value.get('event_type')]",
         'Select the injected schema document of this phase or family; the loader sets it before any case.'),
        ('target_payload_case', 'data_operation', '{PAYLOAD_URI: payload_subject}',
         'Bind the one consumed schema root to its selector.'),
        ('target_payload_case', 'data_operation', 'case_value.get',
         'Read the family event type to select that family document; every candidate carries it.'),
    ],
    'family': [
        ('family_case', 'return', 'return g.Case(table, check, context)',
         'Return the fresh execution object built for this candidate; it decides no acceptance.'),
        ('family_case', 'call_review', "len(json.dumps(case_value.get('payload'), ensure_ascii=False, separators=(',', ':')).encode())",
         'Measure the encoded UTF-8 JSON bytes of the inline payload (SP-337); family.payload_size compares them with the 16 KiB limit.'),
        ('family_case', 'call_review', "json.dumps(case_value.get('payload'), ensure_ascii=False, separators=(',', ':')).encode()",
         'Measure the encoded UTF-8 JSON bytes of the inline payload (SP-337); family.payload_size compares them with the 16 KiB limit.'),
        ('family_case', 'call_review', "json.dumps(case_value.get('payload'), ensure_ascii=False, separators=(',', ':'))",
         'Measure the encoded UTF-8 JSON bytes of the inline payload (SP-337); family.payload_size compares them with the 16 KiB limit.'),
        ('family_case', 'call_review', "case_value.get('payload')",
         'Measure the encoded UTF-8 JSON bytes of the inline payload (SP-337); family.payload_size compares them with the 16 KiB limit.'),
        ('family_case', 'data_operation', "json.dumps(case_value.get('payload'), ensure_ascii=False, separators=(',', ':')).encode",
         'Measure the encoded UTF-8 JSON bytes of the inline payload (SP-337); family.payload_size compares them with the 16 KiB limit.'),
        ('family_case', 'data_operation', 'json.dumps',
         'Measure the encoded UTF-8 JSON bytes of the inline payload (SP-337); family.payload_size compares them with the 16 KiB limit.'),
        ('family_case', 'data_operation', 'case_value.get',
         'Measure the encoded UTF-8 JSON bytes of the inline payload (SP-337); family.payload_size compares them with the 16 KiB limit.'),
    ],
    'lifecycle': [
        ('lifecycle_subject', 'return', "return value.get('lifecycle_source')",
         'Schema selector: read the subject the schema rows judge; a missing member yields None, which the subject type row refuses.'),
        ('lifecycle_case', 'return', 'return g.Case(table, check, context)',
         'Return the fresh execution object built for this candidate; it decides no acceptance.'),
        ('lifecycle_subject', 'call_review', "value.get('lifecycle_source')",
         'Schema selector: read the subject the schema rows judge; a missing member yields None, which the subject type row refuses.'),
        ('lifecycle_case', 'call_review', "g.SchemaCatalog(DOCUMENTS['lifecycle'], roots=LIFECYCLE_ROOTS)",
         'Build a fresh closed schema catalog from the per-phase documents the loader injected once before any case.'),
        ('lifecycle_case', 'call_review', "g.schema_table(catalog, {LIFECYCLE_URI: lifecycle_subject}, guards=[g.Guard('lifecycle.stale_state', g.Invariant('/payload/previous_state', 'equals lifecycle_source.state'), 'stale_lifecycle_source', lifecycle_stale_state), g.Guard('lifecycle.stale_phase', g.Invariant('/payload/previous_phase', 'equals lifecycle_source.phase'), 'stale_lifecycle_source', lifecycle_stale_phase), g.Guard('lifecycle.no_op', g.Invariant('/payload/state', '(state, phase) differs from (previous_state, previous_phase)'), 'no_op', lifecycle_no_op), g.Guard('lifecycle.terminal', g.Invariant('/lifecycle_source/state', 'is not failed, resolved, cancelled or superseded'), 'terminal_requires_linked_investigation', lifecycle_terminal), g.Guard('lifecycle.state_reason', g.Invariant('/payload/stop_reason_code', 'is one of the reasons DL-428 allows for payload.state'), 'state_reason_mismatch', lifecycle_state_reason), g.Guard('lifecycle.attention_reason', g.Invariant('/payload/attention_required_reason_code', 'is a closed attention reason when state is attention_required'), 'attention_reason_required', lifecycle_attention_reason), g.Guard('lifecycle.blocked_reason', g.Invariant('/payload/blocked_reason_code', 'is present when state is blocked'), 'blocked_reason_required', lifecycle_blocked_reason), g.Guard('lifecycle.verification', g.Invariant('/lifecycle_source/verification_qualified', 'is not false when state is resolved'), 'verification_required', lifecycle_verification), g.Guard('lifecycle.cleanup', g.Invariant('/lifecycle_source/cleanup_completed', 'cleanup completed or a documented preservation hold when state is resolved'), 'cleanup_required', lifecycle_cleanup)])",
         'Build the fresh guard table: the named code rows plus one row per supported schema assertion.'),
        ('lifecycle_case.check', 'call_review', 'table.validate(LIFECYCLE_URI, value, context)',
         'Run the schema boundary through the table; the engine attributes any refusal to its schema row.'),
        ('lifecycle_subject', 'data_operation', 'value.get',
         'Schema selector: read the subject the schema rows judge; a missing member yields None, which the subject type row refuses.'),
        ('lifecycle_case', 'data_operation', "DOCUMENTS['lifecycle']",
         'Select the injected schema document of this phase or family; the loader sets it before any case.'),
        ('lifecycle_case', 'data_operation', '{LIFECYCLE_URI: lifecycle_subject}',
         'Bind the one consumed schema root to its selector.'),
    ],
    'instrumentation_source': [
        ('instrumentation_source_subject', 'return', "return value.get('instrumentation_source')",
         'Schema selector: read the subject the schema rows judge; a missing member yields None, which the subject type row refuses.'),
        ('instrumentation_source_case', 'return', 'return g.Case(table, check, context)',
         'Return the fresh execution object built for this candidate; it decides no acceptance.'),
        ('instrumentation_source_subject', 'call_review', "value.get('instrumentation_source')",
         'Schema selector: read the subject the schema rows judge; a missing member yields None, which the subject type row refuses.'),
        ('instrumentation_source_case', 'call_review', "g.SchemaCatalog(DOCUMENTS['instrumentation_source'], roots=SOURCE_ROOTS)",
         'Build a fresh closed schema catalog from the per-phase documents the loader injected once before any case.'),
        ('instrumentation_source_case', 'call_review', 'g.schema_table(catalog, {SOURCE_URI: instrumentation_source_subject})',
         'Build the fresh guard table: the named code rows plus one row per supported schema assertion.'),
        ('instrumentation_source_case.check', 'call_review', 'table.validate(SOURCE_URI, value, context)',
         'Run the schema boundary through the table; the engine attributes any refusal to its schema row.'),
        ('instrumentation_source_subject', 'data_operation', 'value.get',
         'Schema selector: read the subject the schema rows judge; a missing member yields None, which the subject type row refuses.'),
        ('instrumentation_source_case', 'data_operation', "DOCUMENTS['instrumentation_source']",
         'Select the injected schema document of this phase or family; the loader sets it before any case.'),
        ('instrumentation_source_case', 'data_operation', '{SOURCE_URI: instrumentation_source_subject}',
         'Bind the one consumed schema root to its selector.'),
    ],
    'instrumentation_detail': [
        ('instrumentation_detail_subject', 'return', "return {} if detail is None else {'detail': detail}",
         'Schema selector: read the subject the schema rows judge; a missing member yields None, which the subject type row refuses.'),
        ('instrumentation_detail_case', 'return', 'return g.Case(table, check, context)',
         'Return the fresh execution object built for this candidate; it decides no acceptance.'),
        ('instrumentation_detail_case', 'call_review', "g.SchemaCatalog(DOCUMENTS['instrumentation_detail'], roots=DETAIL_ROOTS)",
         'Build a fresh closed schema catalog from the per-phase documents the loader injected once before any case.'),
        ('instrumentation_detail_case', 'call_review', "g.schema_table(catalog, {DETAIL_URI: instrumentation_detail_subject}, guards=[g.Guard('instr.detail_available', g.Invariant('/payload/detail_ref', 'names a record in detail_records'), 'detail_unavailable', instr_detail_available), g.Guard('instr.detail_size', g.Invariant('/detail_records/<detail_ref>', 'encoded UTF-8 JSON is at most 16 KiB inline (SP-337)'), 'detail_payload_reference_required', instr_detail_size)])",
         'Build the fresh guard table: the named code rows plus one row per supported schema assertion.'),
        ('instrumentation_detail_case', 'call_review', "case_value.get('payload')",
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, so the detail rows and instr.detail_available judge it.'),
        ('instrumentation_detail_case', 'call_review', "case_value.get('detail_records')",
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, so the detail rows and instr.detail_available judge it.'),
        ('instrumentation_detail_case', 'call_review', "payload.get('detail_ref')",
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, so the detail rows and instr.detail_available judge it.'),
        ('instrumentation_detail_case', 'call_review', 'records.get(ref)',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, so the detail rows and instr.detail_available judge it.'),
        ('instrumentation_detail_case', 'call_review', "len(json.dumps(detail, ensure_ascii=False, separators=(',', ':')).encode())",
         'Measure the encoded UTF-8 JSON bytes of the referenced detail on its own (SP-337); instr.detail_size compares them.'),
        ('instrumentation_detail_case.check', 'call_review', 'table.validate(DETAIL_URI, value, context)',
         'Run the schema boundary through the table; the engine attributes any refusal to its schema row.'),
        ('instrumentation_detail_case', 'call_review', "json.dumps(detail, ensure_ascii=False, separators=(',', ':')).encode()",
         'Measure the encoded UTF-8 JSON bytes of the referenced detail on its own (SP-337); instr.detail_size compares them.'),
        ('instrumentation_detail_case', 'call_review', "json.dumps(detail, ensure_ascii=False, separators=(',', ':'))",
         'Measure the encoded UTF-8 JSON bytes of the referenced detail on its own (SP-337); instr.detail_size compares them.'),
        ('instrumentation_detail_subject', 'data_operation', "context['detail']",
         'Schema selector: wrap the record payload.detail_ref names (from the factory selection) so the detail rows judge it; no record means an empty wrapper, and instr.detail_available refuses.'),
        ('instrumentation_detail_subject', 'data_operation', "{} if detail is None else {'detail': detail}",
         'Schema selector: wrap the record payload.detail_ref names (from the factory selection) so the detail rows judge it; no record means an empty wrapper, and instr.detail_available refuses.'),
        ('instrumentation_detail_case', 'data_operation', '(payload, records)',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, so the detail rows and instr.detail_available judge it.'),
        ('instrumentation_detail_case', 'data_operation', "payload.get('detail_ref') if type(payload) is dict else None",
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, so the detail rows and instr.detail_available judge it.'),
        ('instrumentation_detail_case', 'data_operation', 'records.get(ref) if type(ref) is str and type(records) is dict else None',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, so the detail rows and instr.detail_available judge it.'),
        ('instrumentation_detail_case', 'data_operation', "None if detail is None else len(json.dumps(detail, ensure_ascii=False, separators=(',', ':')).encode())",
         'Measure the encoded UTF-8 JSON bytes of the referenced detail on its own (SP-337); instr.detail_size compares them.'),
        ('instrumentation_detail_case', 'data_operation', 'type(ref) is str and type(records) is dict',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, so the detail rows and instr.detail_available judge it.'),
        ('instrumentation_detail_case', 'data_operation', "DOCUMENTS['instrumentation_detail']",
         'Select the injected schema document of this phase or family; the loader sets it before any case.'),
        ('instrumentation_detail_case', 'data_operation', '{DETAIL_URI: instrumentation_detail_subject}',
         'Bind the one consumed schema root to its selector.'),
        ('instrumentation_detail_case', 'data_operation', 'case_value.get',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, so the detail rows and instr.detail_available judge it.', 2),
        ('instrumentation_detail_case', 'data_operation', 'payload.get',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, so the detail rows and instr.detail_available judge it.'),
        ('instrumentation_detail_case', 'data_operation', 'records.get',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, so the detail rows and instr.detail_available judge it.'),
        ('instrumentation_detail_case', 'data_operation', "json.dumps(detail, ensure_ascii=False, separators=(',', ':')).encode",
         'Measure the encoded UTF-8 JSON bytes of the referenced detail on its own (SP-337); instr.detail_size compares them.'),
        ('instrumentation_detail_case', 'data_operation', 'json.dumps',
         'Measure the encoded UTF-8 JSON bytes of the referenced detail on its own (SP-337); instr.detail_size compares them.'),
    ],
    'instrumentation_detail_values_a': [
        ('instrumentation_detail_values_subject', 'return', "return {} if detail is None else {'detail': detail}",
         'Schema selector: read the subject the schema rows judge; a missing member yields None, which the subject type row refuses.'),
        ('instrumentation_detail_values_a_case', 'return', 'return g.Case(table, check, context)',
         'Return the fresh execution object built for this candidate; it decides no acceptance.'),
        ('instrumentation_detail_values_a_case', 'call_review', "g.SchemaCatalog(DOCUMENTS['instrumentation_detail_values_a'], roots=DETAIL_VALUES_A_ROOTS)",
         'Build a fresh closed schema catalog from the per-phase documents the loader injected once before any case.'),
        ('instrumentation_detail_values_a_case', 'call_review', 'g.schema_table(catalog, {DETAIL_VALUES_A_URI: instrumentation_detail_values_subject})',
         'Build the fresh guard table: the named code rows plus one row per supported schema assertion.'),
        ('instrumentation_detail_values_a_case', 'call_review', "case_value.get('payload')",
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_detail_values_a_case', 'call_review', "case_value.get('detail_records')",
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_detail_values_a_case', 'call_review', "payload.get('detail_ref')",
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_detail_values_a_case', 'call_review', 'records.get(ref)',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_detail_values_a_case.check', 'call_review', 'table.validate(DETAIL_VALUES_A_URI, value, context)',
         'Run the schema boundary through the table; the engine attributes any refusal to its schema row.'),
        ('instrumentation_detail_values_subject', 'data_operation', "context['detail']",
         'Schema selector: wrap the record payload.detail_ref names (from the factory selection) so the detail rows judge it; no record means an empty wrapper, and instr.detail_available refuses.'),
        ('instrumentation_detail_values_subject', 'data_operation', "{} if detail is None else {'detail': detail}",
         'Schema selector: wrap the record payload.detail_ref names (from the factory selection) so the detail rows judge it; no record means an empty wrapper, and instr.detail_available refuses.'),
        ('instrumentation_detail_values_a_case', 'data_operation', '(payload, records)',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_detail_values_a_case', 'data_operation', "payload.get('detail_ref') if type(payload) is dict else None",
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_detail_values_a_case', 'data_operation', 'records.get(ref) if type(ref) is str and type(records) is dict else None',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_detail_values_a_case', 'data_operation', 'type(ref) is str and type(records) is dict',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_detail_values_a_case', 'data_operation', "DOCUMENTS['instrumentation_detail_values_a']",
         'Select the injected schema document of this phase or family; the loader sets it before any case.'),
        ('instrumentation_detail_values_a_case', 'data_operation', '{DETAIL_VALUES_A_URI: instrumentation_detail_values_subject}',
         'Bind the one consumed schema root to its selector.'),
        ('instrumentation_detail_values_a_case', 'data_operation', 'case_value.get',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.', 2),
        ('instrumentation_detail_values_a_case', 'data_operation', 'payload.get',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_detail_values_a_case', 'data_operation', 'records.get',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
    ],
    'instrumentation_detail_values_b': [
        ('instrumentation_detail_values_subject', 'return', "return {} if detail is None else {'detail': detail}",
         'Schema selector: read the subject the schema rows judge; a missing member yields None, which the subject type row refuses.'),
        ('instrumentation_detail_values_b_case', 'return', 'return g.Case(table, check, context)',
         'Return the fresh execution object built for this candidate; it decides no acceptance.'),
        ('instrumentation_detail_values_b_case', 'call_review', "g.SchemaCatalog(DOCUMENTS['instrumentation_detail_values_b'], roots=DETAIL_VALUES_B_ROOTS)",
         'Build a fresh closed schema catalog from the per-phase documents the loader injected once before any case.'),
        ('instrumentation_detail_values_b_case', 'call_review', 'g.schema_table(catalog, {DETAIL_VALUES_B_URI: instrumentation_detail_values_subject})',
         'Build the fresh guard table: the named code rows plus one row per supported schema assertion.'),
        ('instrumentation_detail_values_b_case', 'call_review', "case_value.get('payload')",
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_detail_values_b_case', 'call_review', "case_value.get('detail_records')",
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_detail_values_b_case', 'call_review', "payload.get('detail_ref')",
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_detail_values_b_case', 'call_review', 'records.get(ref)',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_detail_values_b_case.check', 'call_review', 'table.validate(DETAIL_VALUES_B_URI, value, context)',
         'Run the schema boundary through the table; the engine attributes any refusal to its schema row.'),
        ('instrumentation_detail_values_subject', 'data_operation', "context['detail']",
         'Schema selector: wrap the record payload.detail_ref names (from the factory selection) so the detail rows judge it; no record means an empty wrapper, and instr.detail_available refuses.'),
        ('instrumentation_detail_values_subject', 'data_operation', "{} if detail is None else {'detail': detail}",
         'Schema selector: wrap the record payload.detail_ref names (from the factory selection) so the detail rows judge it; no record means an empty wrapper, and instr.detail_available refuses.'),
        ('instrumentation_detail_values_b_case', 'data_operation', '(payload, records)',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_detail_values_b_case', 'data_operation', "payload.get('detail_ref') if type(payload) is dict else None",
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_detail_values_b_case', 'data_operation', 'records.get(ref) if type(ref) is str and type(records) is dict else None',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_detail_values_b_case', 'data_operation', 'type(ref) is str and type(records) is dict',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_detail_values_b_case', 'data_operation', "DOCUMENTS['instrumentation_detail_values_b']",
         'Select the injected schema document of this phase or family; the loader sets it before any case.'),
        ('instrumentation_detail_values_b_case', 'data_operation', '{DETAIL_VALUES_B_URI: instrumentation_detail_values_subject}',
         'Bind the one consumed schema root to its selector.'),
        ('instrumentation_detail_values_b_case', 'data_operation', 'case_value.get',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.', 2),
        ('instrumentation_detail_values_b_case', 'data_operation', 'payload.get',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_detail_values_b_case', 'data_operation', 'records.get',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
    ],
    'instrumentation': [
        ('instrumentation_case', 'return', 'return g.Case(table, check, context)',
         'Return the fresh execution object built for this candidate; it decides no acceptance.'),
        ('instrumentation_case', 'call_review', "case_value.get('payload')",
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_case', 'call_review', "case_value.get('detail_records')",
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_case', 'call_review', "payload.get('detail_ref')",
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_case', 'call_review', 'records.get(ref)',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_case', 'data_operation', '(payload, records)',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_case', 'data_operation', "payload.get('detail_ref') if type(payload) is dict else None",
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_case', 'data_operation', 'records.get(ref) if type(ref) is str and type(records) is dict else None',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_case', 'data_operation', 'type(ref) is str and type(records) is dict',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_case', 'data_operation', 'case_value.get',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.', 2),
        ('instrumentation_case', 'data_operation', 'payload.get',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
        ('instrumentation_case', 'data_operation', 'records.get',
         'Select the detail record payload.detail_ref names, only for a string ref into a dict of records; otherwise None, which the transition rows treat as out of their domain.'),
    ],
    'retry': [
        ('retry_request_subject', 'return', 'return value',
         'Schema selector: read the subject the schema rows judge; a missing member yields None, which the subject type row refuses.'),
        ('retry_request_case', 'return', 'return g.Case(table, check, context)',
         'Return the fresh execution object built for this candidate; it decides no acceptance.'),
        ('retry_request_case', 'call_review', "g.SchemaCatalog(DOCUMENTS['retry_request'], roots=RETRY_ROOTS)",
         'Build a fresh closed schema catalog from the per-phase documents the loader injected once before any case.'),
        ('retry_request_case', 'call_review', "g.schema_table(catalog, {RETRY_URI: retry_request_subject}, guards=[g.Guard('retry.authorization', g.Invariant('/authorized', 'is true'), 'retry_authorization_required', retry_authorization), g.Guard('retry.ceiling', g.Invariant('/retries_used', 'is below two (two retries after the initial attempt)'), 'retry_ceiling', retry_ceiling)])",
         'Build the fresh guard table: the named code rows plus one row per supported schema assertion.'),
        ('retry_request_case.check', 'call_review', 'table.validate(RETRY_URI, value, context)',
         'Run the schema boundary through the table; the engine attributes any refusal to its schema row.'),
        ('retry_request_case', 'data_operation', "DOCUMENTS['retry_request']",
         'Select the injected schema document of this phase or family; the loader sets it before any case.'),
        ('retry_request_case', 'data_operation', '{RETRY_URI: retry_request_subject}',
         'Bind the one consumed schema root to its selector.'),
    ],
    'admission': [
        ('admission_case', 'return', 'return g.Case(table, check, context)',
         'Return the fresh execution object built for this candidate; it decides no acceptance.'),
    ],
    'retained': [
        ('semantic_digest', 'return', "return hashlib.sha256(json.dumps(body, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()",
         'Recompute the producer semantic digest from the record: the caller-supplied envelope fields, event type and payload only (bounded JSON vector, not an RFC 8785 proof).'),
        ('identity', 'return', "return ('debug:' + digest, 'evt_debug_' + digest)",
         'Recompute the immutable identity from event type, Project and the payload investigation/operation ids (bounded JSON vector).'),
        ('retained_case', 'return', 'return g.Case(table, check, context)',
         'Return the fresh execution object built for this candidate; it decides no acceptance.'),
        ('semantic_digest', 'call_review', "dict(pairs + [('event_type', case['event_type']), ('payload', case['payload'])])",
         'Recompute the producer semantic digest from the record: the caller-supplied envelope fields, event type and payload only (bounded JSON vector, not an RFC 8785 proof).'),
        ('semantic_digest', 'call_review', "hashlib.sha256(json.dumps(body, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()",
         'Recompute the producer semantic digest from the record: the caller-supplied envelope fields, event type and payload only (bounded JSON vector, not an RFC 8785 proof).'),
        ('identity', 'call_review', "hashlib.sha256(json.dumps(preimage, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()",
         'Recompute the immutable identity from event type, Project and the payload investigation/operation ids (bounded JSON vector).'),
        ('retained_case', 'call_review', "list(identity(offered['event_type'], offered['project_id'], offered['payload']))",
         'Recompute the offered identity and both semantic digests from their records; the identity and body rows compare them, nothing is taken as supplied.'),
        ('retained_case', 'call_review', 'semantic_digest(offered)',
         'Recompute the offered identity and both semantic digests from their records; the identity and body rows compare them, nothing is taken as supplied.'),
        ('retained_case', 'call_review', 'semantic_digest(frozen)',
         'Recompute the offered identity and both semantic digests from their records; the identity and body rows compare them, nothing is taken as supplied.'),
        ('semantic_digest', 'call_review', "case['envelope'].get(key)",
         'Recompute the producer semantic digest from the record: the caller-supplied envelope fields, event type and payload only (bounded JSON vector, not an RFC 8785 proof).'),
        ('semantic_digest', 'call_review', "hashlib.sha256(json.dumps(body, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())",
         'Recompute the producer semantic digest from the record: the caller-supplied envelope fields, event type and payload only (bounded JSON vector, not an RFC 8785 proof).'),
        ('identity', 'call_review', "hashlib.sha256(json.dumps(preimage, ensure_ascii=False, separators=(',', ':')).encode())",
         'Recompute the immutable identity from event type, Project and the payload investigation/operation ids (bounded JSON vector).'),
        ('retained_case', 'call_review', "identity(offered['event_type'], offered['project_id'], offered['payload'])",
         'Recompute the offered identity and both semantic digests from their records; the identity and body rows compare them, nothing is taken as supplied.'),
        ('semantic_digest', 'call_review', "json.dumps(body, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()",
         'Recompute the producer semantic digest from the record: the caller-supplied envelope fields, event type and payload only (bounded JSON vector, not an RFC 8785 proof).'),
        ('identity', 'call_review', "json.dumps(preimage, ensure_ascii=False, separators=(',', ':')).encode()",
         'Recompute the immutable identity from event type, Project and the payload investigation/operation ids (bounded JSON vector).'),
        ('semantic_digest', 'call_review', "json.dumps(body, ensure_ascii=False, sort_keys=True, separators=(',', ':'))",
         'Recompute the producer semantic digest from the record: the caller-supplied envelope fields, event type and payload only (bounded JSON vector, not an RFC 8785 proof).'),
        ('identity', 'call_review', "json.dumps(preimage, ensure_ascii=False, separators=(',', ':'))",
         'Recompute the immutable identity from event type, Project and the payload investigation/operation ids (bounded JSON vector).'),
        ('retained_case', 'data_operation', '(offered, frozen)',
         'Recompute the offered identity and both semantic digests from their records; the identity and body rows compare them, nothing is taken as supplied.'),
        ('semantic_digest', 'data_operation', ' for key in DIGEST_FIELDS',
         'Recompute the producer semantic digest from the record: the caller-supplied envelope fields, event type and payload only (bounded JSON vector, not an RFC 8785 proof).'),
        ('semantic_digest', 'data_operation', "pairs + [('event_type', case['event_type']), ('payload', case['payload'])]",
         'Recompute the producer semantic digest from the record: the caller-supplied envelope fields, event type and payload only (bounded JSON vector, not an RFC 8785 proof).'),
        ('semantic_digest', 'data_operation', "hashlib.sha256(json.dumps(body, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest",
         'Recompute the producer semantic digest from the record: the caller-supplied envelope fields, event type and payload only (bounded JSON vector, not an RFC 8785 proof).'),
        ('identity', 'data_operation', "payload['investigation_id']",
         'Recompute the immutable identity from event type, Project and the payload investigation/operation ids (bounded JSON vector).'),
        ('identity', 'data_operation', "payload['operation_id']",
         'Recompute the immutable identity from event type, Project and the payload investigation/operation ids (bounded JSON vector).'),
        ('identity', 'data_operation', "hashlib.sha256(json.dumps(preimage, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest",
         'Recompute the immutable identity from event type, Project and the payload investigation/operation ids (bounded JSON vector).'),
        ('identity', 'data_operation', "'debug:' + digest",
         'Recompute the immutable identity from event type, Project and the payload investigation/operation ids (bounded JSON vector).'),
        ('identity', 'data_operation', "'evt_debug_' + digest",
         'Recompute the immutable identity from event type, Project and the payload investigation/operation ids (bounded JSON vector).'),
        ('retained_case', 'data_operation', "case_value['case']",
         'Recompute the offered identity and both semantic digests from their records; the identity and body rows compare them, nothing is taken as supplied.'),
        ('retained_case', 'data_operation', "case_value['original']['case']",
         'Recompute the offered identity and both semantic digests from their records; the identity and body rows compare them, nothing is taken as supplied.'),
        ('retained_case', 'data_operation', "case_value['original']",
         'Recompute the offered identity and both semantic digests from their records; the identity and body rows compare them, nothing is taken as supplied.'),
        ('semantic_digest', 'data_operation', "case['envelope'].get",
         'Recompute the producer semantic digest from the record: the caller-supplied envelope fields, event type and payload only (bounded JSON vector, not an RFC 8785 proof).'),
        ('semantic_digest', 'data_operation', 'hashlib.sha256',
         'Recompute the producer semantic digest from the record: the caller-supplied envelope fields, event type and payload only (bounded JSON vector, not an RFC 8785 proof).'),
        ('identity', 'data_operation', 'hashlib.sha256',
         'Recompute the immutable identity from event type, Project and the payload investigation/operation ids (bounded JSON vector).'),
        ('retained_case', 'data_operation', "offered['event_type']",
         'Recompute the offered identity and both semantic digests from their records; the identity and body rows compare them, nothing is taken as supplied.'),
        ('retained_case', 'data_operation', "offered['project_id']",
         'Recompute the offered identity and both semantic digests from their records; the identity and body rows compare them, nothing is taken as supplied.'),
        ('retained_case', 'data_operation', "offered['payload']",
         'Recompute the offered identity and both semantic digests from their records; the identity and body rows compare them, nothing is taken as supplied.'),
        ('semantic_digest', 'data_operation', "case['envelope']",
         'Recompute the producer semantic digest from the record: the caller-supplied envelope fields, event type and payload only (bounded JSON vector, not an RFC 8785 proof).'),
        ('semantic_digest', 'data_operation', "case['event_type']",
         'Recompute the producer semantic digest from the record: the caller-supplied envelope fields, event type and payload only (bounded JSON vector, not an RFC 8785 proof).'),
        ('semantic_digest', 'data_operation', "case['payload']",
         'Recompute the producer semantic digest from the record: the caller-supplied envelope fields, event type and payload only (bounded JSON vector, not an RFC 8785 proof).'),
        ('semantic_digest', 'data_operation', "json.dumps(body, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode",
         'Recompute the producer semantic digest from the record: the caller-supplied envelope fields, event type and payload only (bounded JSON vector, not an RFC 8785 proof).'),
        ('identity', 'data_operation', "json.dumps(preimage, ensure_ascii=False, separators=(',', ':')).encode",
         'Recompute the immutable identity from event type, Project and the payload investigation/operation ids (bounded JSON vector).'),
        ('semantic_digest', 'data_operation', 'json.dumps',
         'Recompute the producer semantic digest from the record: the caller-supplied envelope fields, event type and payload only (bounded JSON vector, not an RFC 8785 proof).'),
        ('identity', 'data_operation', 'json.dumps',
         'Recompute the immutable identity from event type, Project and the payload investigation/operation ids (bounded JSON vector).'),
    ],
    'references': [
        ('references_case', 'return', 'return g.Case(table, check, context)',
         'Return the fresh execution object built for this candidate; it decides no acceptance.'),
        ('references_case', 'mutation_or_error_write', 'pending.pop()',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'mutation_or_error_write', 'nodes.append(node)',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'mutation_or_error_write', 'pending.extend(reversed(list(node.values())))',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'call_review', 'reversed(list(node.values()))',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'mutation_or_error_write', 'pending.extend(reversed(node))',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'mutation_or_error_write', 'references.append([type(text) is str, base, form, keys])',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'call_review', 'list(node.values())',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'call_review', 'reversed(node)',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'call_review', "text.partition('#')",
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'call_review', "fragment.split('/')",
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'call_review', "part.replace('~1', '/').replace('~0', '~')",
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'call_review', 'node.values()',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'call_review', "fragment.startswith('/')",
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'call_review', 'enumerate(parts)',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'call_review', "part.replace('~1', '/')",
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', 'while pending:\n    node = pending.pop()\n    if type(node) is dict:\n        nodes.append(node)\n        pending.extend(reversed(list(node.values())))\n    elif type(node) is list:\n        pending.extend(reversed(node))',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', "for node in nodes:\n    for key in ('$ref', '$dynamicRef'):\n        if key in node:\n            text = node[key]\n            base, _, fragment = text.partition('#') if type(text) is str else ('', '', '')\n            form = 'none' if not fragment else 'pointer' if fragment.startswith('/') else 'anchor'\n            parts = fragment.split('/') if form == 'pointer' else []\n            keys = [part.replace('~1', '/').replace('~0', '~') for index, part in enumerate(parts) if index]\n            references.append([type(text) is str, base, form, keys])",
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', '(nodes, pending)',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', 'if type(node) is dict:\n    nodes.append(node)\n    pending.extend(reversed(list(node.values())))\nelif type(node) is list:\n    pending.extend(reversed(node))',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', "for key in ('$ref', '$dynamicRef'):\n    if key in node:\n        text = node[key]\n        base, _, fragment = text.partition('#') if type(text) is str else ('', '', '')\n        form = 'none' if not fragment else 'pointer' if fragment.startswith('/') else 'anchor'\n        parts = fragment.split('/') if form == 'pointer' else []\n        keys = [part.replace('~1', '/').replace('~0', '~') for index, part in enumerate(parts) if index]\n        references.append([type(text) is str, base, form, keys])",
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', 'if type(node) is list:\n    pending.extend(reversed(node))',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', "if key in node:\n    text = node[key]\n    base, _, fragment = text.partition('#') if type(text) is str else ('', '', '')\n    form = 'none' if not fragment else 'pointer' if fragment.startswith('/') else 'anchor'\n    parts = fragment.split('/') if form == 'pointer' else []\n    keys = [part.replace('~1', '/').replace('~0', '~') for index, part in enumerate(parts) if index]\n    references.append([type(text) is str, base, form, keys])",
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', 'pending.pop',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', 'key in node',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', " for node in nodes if '$id' in node",
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', 'nodes.append',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', 'pending.extend',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.', 2),
        ('references_case', 'data_operation', 'node[key]',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', '(base, _, fragment)',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', "text.partition('#') if type(text) is str else ('', '', '')",
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', "'none' if not fragment else 'pointer' if fragment.startswith('/') else 'anchor'",
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', "fragment.split('/') if form == 'pointer' else []",
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', "node['$id']",
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', "'$id' in node",
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', 'not fragment',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', "'pointer' if fragment.startswith('/') else 'anchor'",
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', "form == 'pointer'",
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', ' for index, part in enumerate(parts) if index',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', 'references.append',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', 'node',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', 'text.partition',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', 'fragment.split',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', "part.replace('~1', '/').replace",
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', '(index, part)',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', 'index',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', 'node.values',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', 'fragment.startswith',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
        ('references_case', 'data_operation', 'part.replace',
         'Traverse every node of the schema document and parse each reference into string flag, base, fragment and unescaped pointer keys (selection only); the reference rows judge them.'),
    ],
}


def patched_case(case, patches):
    result = copy.deepcopy(case)
    for path, value in patches.items():
        target = result
        parts = path.split('.')
        for key in parts[:-1]:
            target = target[key]
        target[parts[-1]] = value
    return result


def fixture_cases():
    return json.loads((ROOT / FIXTURE).read_text())['cases']


def short(event):
    return event[len(PREFIX):]


def family_controls(meta):
    """The family base and every fixture positive (transition and mode cases without a refusal)."""
    case = production.candidate(meta)
    controls = [(short(meta['event_type']) + ': base', case)]
    for row in meta.get('transition_cases', []) + meta.get('mode_cases', []):
        if row['expected_refusal'] is None:
            controls.append((short(meta['event_type']) + ': ' + row['case'], patched_case(case, row['patches'])))
    return controls


def family_negatives(meta):
    """Every fixture negative of the family (and each refusing mode case): (id, value, base, label, defect)."""
    case = production.candidate(meta)
    rows = list(meta['negative_cases']) + [m for m in meta.get('mode_cases', []) if m['expected_refusal']]
    result = []
    for index, row in enumerate(rows):
        base = patched_case(case, row.get('base_patches', {}))
        result.append(('%s#%d: %s' % (short(meta['event_type']), index, row['case']), patched_case(base, row['patches']),
                       base, row['guard'], row['case']))
    return result


def build(name, module, factory, controls, negatives, boundary, document_keys=(), phase=None):
    """controls: [(id, value)]; negatives: [(id, value, base value or control id, row label, defect)].

    With a phase, every value is projected to the members that phase reads
    (production.PHASE_MEMBERS), and controls whose projections are identical
    are kept once: identical inputs carry identical evidence.
    """
    production.load_documents(only=document_keys)
    if phase is not None:
        kept, alias = [], {}
        for cid, value in controls:
            value = production.projected(phase, value)
            same = next((kid for kid, kvalue in kept if kvalue == value), None)
            if same is None:
                kept.append((cid, value))
            alias[cid] = same or cid
        controls = kept
        negatives = [(nid, production.projected(phase, value),
                      alias.get(base, base) if type(base) is str else production.projected(phase, base), label, defect)
                     for nid, value, base, label, defect in negatives]
    controls = list(controls)
    probe = factory(controls[0][1])
    rows = probe.table.guards
    by_label = {}
    for row in rows:
        by_label.setdefault(production.row_label(row), []).append(row)
    made = []
    for negative_id, value, base, label, defect in negatives:
        if type(base) is str:
            control = base
        else:
            control = next((cid for cid, cvalue in controls if cvalue == base), None)
            if control is None:
                control = 'base of ' + negative_id
                controls.append((control, base))
        targets = by_label.get(label, [])
        if len(targets) != 1:
            raise ValueError('negative %r names %r, which is not exactly one row of %s' % (negative_id, label, name))
        made.append(g.Negative(negative_id, value, targets[0], rows[targets[0]].refusal_code, control, defect))
    path = 'scripts/pm_debug_investigation_guards_' + module + '.py'
    declared = [g.NonGuard(path, *entry) for entry in NON_GUARDS[module]]
    return g.Suite('DDBG ' + name, factory, [g.Control(cid, value, boundary) for cid, value in controls], made,
                   (path,), ROOT, non_guards=declared)


def phase_negatives(phase, metas):
    production.load_documents()
    out = []
    for meta in metas:
        case = production.candidate(meta)
        factories = dict(production.phases(case))
        labels = {production.row_label(row) for row in factories[phase](case).table.guards} if phase in factories else set()
        out += [n for n in family_negatives(meta) if n[3] in labels]
    return out


def all_controls(metas):
    return [control for meta in metas for control in family_controls(meta)]


def envelope_suite():
    metas = fixture_cases()
    return build('envelope phase', 'envelope', production.envelope.envelope_case, all_controls(metas),
                 phase_negatives('envelope', metas), 'append', phase='envelope')


def family_suite():
    metas = fixture_cases()
    # Proved on full candidates before projection was added; kept unprojected so that run stays the evidence.
    return build('family phase', 'family', production.family.family_case, all_controls(metas),
                 phase_negatives('family', metas), 'append')


def payload_suite(family):
    meta = next(m for m in fixture_cases() if m['event_type'] == PREFIX + family)
    target = family == 'target_bound'
    module = 'target_payload' if target else 'payload'
    factory = production.target_payload.target_payload_case if target else production.payload.payload_case
    return build(family + ' payload phase', module, factory, family_controls(meta),
                 phase_negatives('payload', [meta]), 'append', (PREFIX + family,), phase='payload')


def payload_context_item_added_suite():
    return payload_suite('context_item_added')


def payload_context_item_state_changed_suite():
    return payload_suite('context_item_state_changed')


def payload_exported_suite():
    return payload_suite('exported')


def payload_imported_suite():
    return payload_suite('imported')


def payload_instrumentation_state_changed_suite():
    return payload_suite('instrumentation_state_changed')


def payload_started_suite():
    return payload_suite('started')


def payload_target_bound_suite():
    return payload_suite('target_bound')


def payload_verification_recorded_suite():
    return payload_suite('verification_recorded')


def payload_state_changed_suite():
    return payload_suite('state_changed')


def single_family(family, phase, module, factory, keys=(), project=True):
    meta = next(m for m in fixture_cases() if m['event_type'] == PREFIX + family)
    return build(phase + ' phase', module, factory, family_controls(meta), phase_negatives(phase, [meta]), 'append', keys,
                 phase=phase if project else None)


def lifecycle_suite():
    # Proved on full candidates before projection was added; kept unprojected so that run stays the evidence.
    return single_family('state_changed', 'lifecycle', 'lifecycle', production.lifecycle.lifecycle_case, ('lifecycle',),
                         project=False)


def instrumentation_source_suite():
    return single_family('instrumentation_state_changed', 'instrumentation_source', 'instrumentation_source',
                         production.instrumentation_source.instrumentation_source_case, ('instrumentation_source',))


def instrumentation_detail_suite():
    return single_family('instrumentation_state_changed', 'instrumentation_detail', 'instrumentation_detail',
                         production.instrumentation_detail.instrumentation_detail_case, ('instrumentation_detail',))


def instrumentation_detail_values_a_suite():
    return single_family('instrumentation_state_changed', 'instrumentation_detail_values_a', 'instrumentation_detail_values_a',
                         production.instrumentation_detail_values_a.instrumentation_detail_values_a_case,
                         ('instrumentation_detail_values_a',))


def instrumentation_detail_values_b_suite():
    return single_family('instrumentation_state_changed', 'instrumentation_detail_values_b', 'instrumentation_detail_values_b',
                         production.instrumentation_detail_values_b.instrumentation_detail_values_b_case,
                         ('instrumentation_detail_values_b',))


def instrumentation_suite():
    return single_family('instrumentation_state_changed', 'instrumentation', 'instrumentation',
                         production.instrumentation.instrumentation_case)


def probe_suite(name, module, factory, probes, boundary, keys=()):
    controls, negatives = [], []
    for prefix, (cs, ns) in probes:
        first = prefix + ': ' + cs[0][0]
        controls += [(prefix + ': ' + cid, value) for cid, value in cs]
        negatives += [(prefix + ': ' + nid, value, first, label, nid) for nid, value, label, code in ns]
    return build(name, module, factory, controls, negatives, boundary, keys)


def admission_suite():
    probes = [(short(m['event_type']), production.admission_probes(production.candidate(m))) for m in fixture_cases()]
    return probe_suite('admission gate', 'admission', production.admission.admission_case, probes, 'append')


def retained_suite():
    probes = [(short(m['event_type']), production.retained_probes(production.candidate(m))) for m in fixture_cases()]
    return probe_suite('retained-history reader', 'retained', production.retained.retained_case, probes, 'retained_history')


def retry_request_suite():
    meta = next(m for m in fixture_cases() if 'retry_request_cases' in m)
    controls, negatives = production.retry_request_probes(meta['retry_request_cases'])
    return build('cleanup retry request', 'retry', production.retry.retry_request_case, controls,
                 [(nid, value, controls[0][0], label, nid) for nid, value, label, code in negatives], 'retry',
                 ('retry_request',))


def references_suite():
    schema = json.loads((ROOT / SCHEMA).read_text())
    return probe_suite('schema references', 'references', production.references.references_case,
                       [('schema', production.reference_probes(schema))], 'synthetic')


SUITES = ('envelope_suite', 'family_suite', 'payload_context_item_added_suite', 'payload_context_item_state_changed_suite',
          'payload_exported_suite', 'payload_imported_suite', 'payload_instrumentation_state_changed_suite',
          'payload_started_suite', 'payload_target_bound_suite', 'payload_verification_recorded_suite',
          'payload_state_changed_suite', 'lifecycle_suite', 'instrumentation_source_suite', 'instrumentation_detail_suite',
          'instrumentation_detail_values_a_suite', 'instrumentation_detail_values_b_suite',
          'instrumentation_suite', 'retry_request_suite', 'admission_suite', 'retained_suite', 'references_suite')
