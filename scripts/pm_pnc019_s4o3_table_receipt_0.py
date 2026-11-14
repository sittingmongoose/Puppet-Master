"""S4 reference-store receipt_0 predicates (generated)."""
import pm_guard_isolation as g


def receipt_storage_instance_id(v, context):
    if type(v['receipt_storage_instance_id']['seen']) is not type(v['receipt_storage_instance_id']['first']) or v['receipt_storage_instance_id']['seen'] != v['receipt_storage_instance_id']['first']:
        return 'retained_receipt_join'
    return None


def receipt_scope_partition(v, context):
    if type(v['receipt_scope_partition']['seen']) is not type(v['receipt_scope_partition']['first']) or v['receipt_scope_partition']['seen'] != v['receipt_scope_partition']['first']:
        return 'retained_receipt_join'
    return None


def receipt_event_type(v, context):
    if type(v['receipt_event_type']['seen']) is not type(v['receipt_event_type']['first']) or v['receipt_event_type']['seen'] != v['receipt_event_type']['first']:
        return 'retained_receipt_join'
    return None


def receipt_idempotency_key(v, context):
    if type(v['receipt_idempotency_key']['seen']) is not type(v['receipt_idempotency_key']['first']) or v['receipt_idempotency_key']['seen'] != v['receipt_idempotency_key']['first']:
        return 'retained_receipt_join'
    return None


def receipt_producer_semantic_digest(v, context):
    if type(v['receipt_producer_semantic_digest']['seen']) is not type(v['receipt_producer_semantic_digest']['first']) or v['receipt_producer_semantic_digest']['seen'] != v['receipt_producer_semantic_digest']['first']:
        return 'retained_receipt_join'
    return None


def receipt_group_digest(v, context):
    if type(v['receipt_group_digest']['seen']) is not type(v['receipt_group_digest']['first']) or v['receipt_group_digest']['seen'] != v['receipt_group_digest']['first']:
        return 'retained_receipt_join'
    return None


def receipt_original_segment_ref(v, context):
    if type(v['receipt_original_segment_ref']['seen']) is not type(v['receipt_original_segment_ref']['first']) or v['receipt_original_segment_ref']['seen'] != v['receipt_original_segment_ref']['first']:
        return 'retained_receipt_join'
    return None


def receipt_first_append_receipt_event_id(v, context):
    if type(v['receipt_first_append_receipt_event_id']['seen']) is not type(v['receipt_first_append_receipt_event_id']['first']) or v['receipt_first_append_receipt_event_id']['seen'] != v['receipt_first_append_receipt_event_id']['first']:
        return 'retained_receipt_join'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('receipt_storage_instance_id', g.Invariant('/receipt_storage_instance_id', 'actual reference-store receipt_storage_instance_id invariant'), 'retained_receipt_join', receipt_storage_instance_id),
        g.Guard('receipt_scope_partition', g.Invariant('/receipt_scope_partition', 'actual reference-store receipt_scope_partition invariant'), 'retained_receipt_join', receipt_scope_partition),
        g.Guard('receipt_event_type', g.Invariant('/receipt_event_type', 'actual reference-store receipt_event_type invariant'), 'retained_receipt_join', receipt_event_type),
        g.Guard('receipt_idempotency_key', g.Invariant('/receipt_idempotency_key', 'actual reference-store receipt_idempotency_key invariant'), 'retained_receipt_join', receipt_idempotency_key),
        g.Guard('receipt_producer_semantic_digest', g.Invariant('/receipt_producer_semantic_digest', 'actual reference-store receipt_producer_semantic_digest invariant'), 'retained_receipt_join', receipt_producer_semantic_digest),
        g.Guard('receipt_group_digest', g.Invariant('/receipt_group_digest', 'actual reference-store receipt_group_digest invariant'), 'retained_receipt_join', receipt_group_digest),
        g.Guard('receipt_original_segment_ref', g.Invariant('/receipt_original_segment_ref', 'actual reference-store receipt_original_segment_ref invariant'), 'retained_receipt_join', receipt_original_segment_ref),
        g.Guard('receipt_first_append_receipt_event_id', g.Invariant('/receipt_first_append_receipt_event_id', 'actual reference-store receipt_first_append_receipt_event_id invariant'), 'retained_receipt_join', receipt_first_append_receipt_event_id),
    ])

    def check(value):
        table.require('receipt_storage_instance_id', value, context)
        table.require('receipt_scope_partition', value, context)
        table.require('receipt_event_type', value, context)
        table.require('receipt_idempotency_key', value, context)
        table.require('receipt_producer_semantic_digest', value, context)
        table.require('receipt_group_digest', value, context)
        table.require('receipt_original_segment_ref', value, context)
        table.require('receipt_first_append_receipt_event_id', value, context)
        return True
    return g.Case(table, check, context)
