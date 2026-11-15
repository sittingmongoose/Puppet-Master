"""DG6B guard table receipt_numbers: SP-1100 exact uint64 slots of the independently issued original AppendReceipt.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('valid_sequence_id', 'valid_segment_generation', 'valid_byte_offset', 'valid_durable_end_offset', 'valid_manifest_generation')


def RN01_sequence_id(value, context):
    return 'receipt_number_domain' if value['valid_sequence_id'] is not True else None


def RN02_segment_generation(value, context):
    return 'receipt_number_domain' if value['valid_segment_generation'] is not True else None


def RN03_byte_offset(value, context):
    return 'receipt_number_domain' if value['valid_byte_offset'] is not True else None


def RN04_durable_end_offset(value, context):
    return 'receipt_number_domain' if value['valid_durable_end_offset'] is not True else None


def RN05_manifest_generation(value, context):
    return 'receipt_number_domain' if value['valid_manifest_generation'] is not True else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('RN01_sequence_id', g.Invariant('/sequence_id', 'the original receipt sequence_id passes storage_uint64'), 'receipt_number_domain', RN01_sequence_id),
        g.Guard('RN02_segment_generation', g.Invariant('/segment_generation', 'the original receipt segment_generation passes storage_uint64'), 'receipt_number_domain', RN02_segment_generation),
        g.Guard('RN03_byte_offset', g.Invariant('/byte_offset', 'the original receipt byte_offset passes storage_uint64'), 'receipt_number_domain', RN03_byte_offset),
        g.Guard('RN04_durable_end_offset', g.Invariant('/durable_end_offset', 'the original receipt durable_end_offset passes storage_uint64'), 'receipt_number_domain', RN04_durable_end_offset),
        g.Guard('RN05_manifest_generation', g.Invariant('/manifest_generation', 'the original receipt manifest_generation passes storage_uint64'), 'receipt_number_domain', RN05_manifest_generation),
    ])

    def check(value):
        table.require('RN01_sequence_id', value, context)
        table.require('RN02_segment_generation', value, context)
        table.require('RN03_byte_offset', value, context)
        table.require('RN04_durable_end_offset', value, context)
        table.require('RN05_manifest_generation', value, context)
        return True
    return g.Case(table, check, context)
