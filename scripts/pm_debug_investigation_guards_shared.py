"""DDBG guard table: Shared-rule phase (sweep part 2B): CV-1101 timestamps, CV-1100 integer slots and producer qualification, SP-1100 sizes.

Part of the DDBG guard tables; the domain rule and phase order are in
pm_debug_investigation_guard_constants.py. Every refusal here is a named
predicate row; the factory builds a fresh table and Case for each input.

The input is the shared-rule view pm_debug_investigation_transitions.shared_view
builds from a candidate (or retry_shared_view from a retry request) before any
table runs, with the gated shared helpers (pm_event_datetime.date_time with the
field owner's profile, pm_event_numbers.current_integer with the slot's schema
bounds, storage_uint64, producer_semantic_digest, storage_value_bytes EVENT_VALUE):
each member is the shared helper's refusal reason for one field (None when it
accepts or the field is absent) or a measured byte count. The view never holds
the raw value, so a value the guard tool cannot render (an integer of thousands
of digits, a fractional-token carrier) is refused here, before any later phase.
This phase runs first; its rows read one member each and decide.
"""
import pm_guard_isolation as g
from pm_debug_investigation_guard_constants import INLINE_LIMIT


def shared_occurred_at(value, context):
    return 'invalid_timestamp' if value['occurred_at_utc'] is not None else None


def shared_observed_at(value, context):
    return 'invalid_timestamp' if value['observed_at_utc'] is not None else None


def shared_persisted_at(value, context):
    return 'invalid_timestamp' if value['persisted_at_utc'] is not None else None


def shared_producer_sequence_id(value, context):
    return 'number_domain' if value['producer_sequence_id'] is not None else None


def shared_sequence_id(value, context):
    return 'number_domain' if value['sequence_id'] is not None else None


def shared_item_count(value, context):
    return 'number_domain' if value['item_count'] is not None else None


def shared_artifact_count(value, context):
    return 'number_domain' if value['artifact_count'] is not None else None


def shared_binding_revision(value, context):
    return 'number_domain' if value['binding_revision'] is not None else None


def shared_detail_retry_count_before(value, context):
    return 'number_domain' if value['retry_count_before'] is not None else None


def shared_detail_retry_count_after(value, context):
    return 'number_domain' if value['retry_count_after'] is not None else None


def shared_detail_attempt_number(value, context):
    return 'number_domain' if value['attempt_number'] is not None else None


def shared_source_retry_count(value, context):
    return 'number_domain' if value['retry_count'] is not None else None


def shared_retries_used(value, context):
    return 'number_domain' if value['retries_used'] is not None else None


def shared_producer(value, context):
    # Qualification of the producer projection judges values the integer-slot rows accept; a
    # projection slot those rows refuse is theirs (domain rule).
    if value['item_count'] is not None or value['artifact_count'] is not None:
        return None
    if value['binding_revision'] is not None or value['producer_sequence_id'] is not None:
        return None
    return 'producer_unqualified' if value['producer'] is not None else None


def shared_payload_size(value, context):
    size = value['payload_bytes']
    return 'payload_reference_required' if type(size) is int and size > INLINE_LIMIT else None


def shared_detail_size(value, context):
    size = value['detail_bytes']
    return 'detail_payload_reference_required' if type(size) is int and size > INLINE_LIMIT else None


def shared_case(case_value):
    table = g.GuardTable([
        g.Guard('shared.occurred_at_utc', g.Invariant('/envelope/occurred_at_utc', 'when present, date_time accepts it with the EventRecord profile (CV-1101)'), 'invalid_timestamp', shared_occurred_at),
        g.Guard('shared.observed_at_utc', g.Invariant('/envelope/observed_at_utc', "when present, date_time accepts it with CV-253's storage_utc_z profile"), 'invalid_timestamp', shared_observed_at),
        g.Guard('shared.persisted_at_utc', g.Invariant('/envelope/persisted_at_utc', "when present, date_time accepts it with CV-253's storage_utc_z profile"), 'invalid_timestamp', shared_persisted_at),
        g.Guard('shared.producer_sequence_id', g.Invariant('/envelope/producer_sequence_id', 'when present and not null, current_integer accepts it with minimum 0 (CV-1100)'), 'number_domain', shared_producer_sequence_id),
        g.Guard('shared.sequence_id', g.Invariant('/envelope/sequence_id', 'when present, storage_uint64 accepts it (SP-1100)'), 'number_domain', shared_sequence_id),
        g.Guard('shared.item_count', g.Invariant('/payload/item_count', 'current_integer accepts it with the schema bounds (exported)'), 'number_domain', shared_item_count),
        g.Guard('shared.artifact_count', g.Invariant('/payload/artifact_count', 'current_integer accepts it with the schema bounds (exported)'), 'number_domain', shared_artifact_count),
        g.Guard('shared.binding_revision', g.Invariant('/payload/target_bindings/binding_revision', 'current_integer accepts it with the schema bounds (target_bound)'), 'number_domain', shared_binding_revision),
        g.Guard('shared.detail_retry_count_before', g.Invariant('/detail_records/<detail_ref>/retry_count_before', 'current_integer accepts it with the schema bounds'), 'number_domain', shared_detail_retry_count_before),
        g.Guard('shared.detail_retry_count_after', g.Invariant('/detail_records/<detail_ref>/retry_count_after', 'current_integer accepts it with the schema bounds'), 'number_domain', shared_detail_retry_count_after),
        g.Guard('shared.detail_attempt_number', g.Invariant('/detail_records/<detail_ref>/attempt_number', 'current_integer accepts it with the schema bounds'), 'number_domain', shared_detail_attempt_number),
        g.Guard('shared.source_retry_count', g.Invariant('/instrumentation_source/retry_count', 'current_integer accepts it with the schema bounds'), 'number_domain', shared_source_retry_count),
        g.Guard('shared.retries_used', g.Invariant('/retries_used', 'current_integer accepts it with the schema bounds (retry request)'), 'number_domain', shared_retries_used),
        g.Guard('shared.producer', g.Invariant('/payload', 'the producer projection qualifies (producer_semantic_bytes, CV-1100)'), 'producer_unqualified', shared_producer),
        g.Guard('shared.payload_size', g.Invariant('/payload', 'EVENT_VALUE bytes are at most 16 KiB inline (SP-337, SP-1100)'), 'payload_reference_required', shared_payload_size),
        g.Guard('shared.detail_size', g.Invariant('/detail_records/<detail_ref>', 'EVENT_VALUE bytes are at most 16 KiB inline (SP-337, SP-1100)'), 'detail_payload_reference_required', shared_detail_size)])
    context = None

    def check(value):
        table.require('shared.occurred_at_utc', value, context)
        table.require('shared.observed_at_utc', value, context)
        table.require('shared.persisted_at_utc', value, context)
        table.require('shared.producer_sequence_id', value, context)
        table.require('shared.sequence_id', value, context)
        table.require('shared.item_count', value, context)
        table.require('shared.artifact_count', value, context)
        table.require('shared.binding_revision', value, context)
        table.require('shared.detail_retry_count_before', value, context)
        table.require('shared.detail_retry_count_after', value, context)
        table.require('shared.detail_attempt_number', value, context)
        table.require('shared.source_retry_count', value, context)
        table.require('shared.retries_used', value, context)
        table.require('shared.producer', value, context)
        table.require('shared.payload_size', value, context)
        table.require('shared.detail_size', value, context)
        return True
    return g.Case(table, check, context)
