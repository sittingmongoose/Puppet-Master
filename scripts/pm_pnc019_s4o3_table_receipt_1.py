"""S4 reference-store receipt_1 predicates (generated)."""
import pm_guard_isolation as g


def receipt_first_append_receipt_sequence_id(v, context):
    if type(v['receipt_first_append_receipt_sequence_id']['seen']) is not type(v['receipt_first_append_receipt_sequence_id']['first']) or v['receipt_first_append_receipt_sequence_id']['seen'] != v['receipt_first_append_receipt_sequence_id']['first']:
        return 'retained_receipt_join'
    return None


def receipt_first_append_receipt_commit_group_id(v, context):
    if type(v['receipt_first_append_receipt_commit_group_id']['seen']) is not type(v['receipt_first_append_receipt_commit_group_id']['first']) or v['receipt_first_append_receipt_commit_group_id']['seen'] != v['receipt_first_append_receipt_commit_group_id']['first']:
        return 'retained_receipt_join'
    return None


def receipt_first_append_receipt_segment_name(v, context):
    if type(v['receipt_first_append_receipt_segment_name']['seen']) is not type(v['receipt_first_append_receipt_segment_name']['first']) or v['receipt_first_append_receipt_segment_name']['seen'] != v['receipt_first_append_receipt_segment_name']['first']:
        return 'retained_receipt_join'
    return None


def receipt_first_append_receipt_segment_generation(v, context):
    if type(v['receipt_first_append_receipt_segment_generation']['seen']) is not type(v['receipt_first_append_receipt_segment_generation']['first']) or v['receipt_first_append_receipt_segment_generation']['seen'] != v['receipt_first_append_receipt_segment_generation']['first']:
        return 'retained_receipt_join'
    return None


def receipt_first_append_receipt_byte_offset(v, context):
    if type(v['receipt_first_append_receipt_byte_offset']['seen']) is not type(v['receipt_first_append_receipt_byte_offset']['first']) or v['receipt_first_append_receipt_byte_offset']['seen'] != v['receipt_first_append_receipt_byte_offset']['first']:
        return 'retained_receipt_join'
    return None


def receipt_first_append_receipt_durability_class(v, context):
    if type(v['receipt_first_append_receipt_durability_class']['seen']) is not type(v['receipt_first_append_receipt_durability_class']['first']) or v['receipt_first_append_receipt_durability_class']['seen'] != v['receipt_first_append_receipt_durability_class']['first']:
        return 'retained_receipt_join'
    return None


def receipt_first_append_receipt_durable_end_offset(v, context):
    if type(v['receipt_first_append_receipt_durable_end_offset']['seen']) is not type(v['receipt_first_append_receipt_durable_end_offset']['first']) or v['receipt_first_append_receipt_durable_end_offset']['seen'] != v['receipt_first_append_receipt_durable_end_offset']['first']:
        return 'retained_receipt_join'
    return None


def receipt_first_append_receipt_manifest_generation(v, context):
    if type(v['receipt_first_append_receipt_manifest_generation']['seen']) is not type(v['receipt_first_append_receipt_manifest_generation']['first']) or v['receipt_first_append_receipt_manifest_generation']['seen'] != v['receipt_first_append_receipt_manifest_generation']['first']:
        return 'retained_receipt_join'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('receipt_first_append_receipt_sequence_id', g.Invariant('/receipt_first_append_receipt_sequence_id', 'actual reference-store receipt_first_append_receipt_sequence_id invariant'), 'retained_receipt_join', receipt_first_append_receipt_sequence_id),
        g.Guard('receipt_first_append_receipt_commit_group_id', g.Invariant('/receipt_first_append_receipt_commit_group_id', 'actual reference-store receipt_first_append_receipt_commit_group_id invariant'), 'retained_receipt_join', receipt_first_append_receipt_commit_group_id),
        g.Guard('receipt_first_append_receipt_segment_name', g.Invariant('/receipt_first_append_receipt_segment_name', 'actual reference-store receipt_first_append_receipt_segment_name invariant'), 'retained_receipt_join', receipt_first_append_receipt_segment_name),
        g.Guard('receipt_first_append_receipt_segment_generation', g.Invariant('/receipt_first_append_receipt_segment_generation', 'actual reference-store receipt_first_append_receipt_segment_generation invariant'), 'retained_receipt_join', receipt_first_append_receipt_segment_generation),
        g.Guard('receipt_first_append_receipt_byte_offset', g.Invariant('/receipt_first_append_receipt_byte_offset', 'actual reference-store receipt_first_append_receipt_byte_offset invariant'), 'retained_receipt_join', receipt_first_append_receipt_byte_offset),
        g.Guard('receipt_first_append_receipt_durability_class', g.Invariant('/receipt_first_append_receipt_durability_class', 'actual reference-store receipt_first_append_receipt_durability_class invariant'), 'retained_receipt_join', receipt_first_append_receipt_durability_class),
        g.Guard('receipt_first_append_receipt_durable_end_offset', g.Invariant('/receipt_first_append_receipt_durable_end_offset', 'actual reference-store receipt_first_append_receipt_durable_end_offset invariant'), 'retained_receipt_join', receipt_first_append_receipt_durable_end_offset),
        g.Guard('receipt_first_append_receipt_manifest_generation', g.Invariant('/receipt_first_append_receipt_manifest_generation', 'actual reference-store receipt_first_append_receipt_manifest_generation invariant'), 'retained_receipt_join', receipt_first_append_receipt_manifest_generation),
    ])

    def check(value):
        table.require('receipt_first_append_receipt_sequence_id', value, context)
        table.require('receipt_first_append_receipt_commit_group_id', value, context)
        table.require('receipt_first_append_receipt_segment_name', value, context)
        table.require('receipt_first_append_receipt_segment_generation', value, context)
        table.require('receipt_first_append_receipt_byte_offset', value, context)
        table.require('receipt_first_append_receipt_durability_class', value, context)
        table.require('receipt_first_append_receipt_durable_end_offset', value, context)
        table.require('receipt_first_append_receipt_manifest_generation', value, context)
        return True
    return g.Case(table, check, context)
