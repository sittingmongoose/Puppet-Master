"""DG6B guard table persona_result_b: Payload fields equal the owner result (part b).

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('payload_result_status_digest', 'result_status_digest', 'payload_owner_result_ref_digest', 'result_owner_result_ref_digest', 'payload_owner_readback_ref_digest', 'result_readback_ref_digest', 'payload_return_context_ref_digest', 'result_return_context_ref_digest')


def RR06_result_status(value, context):
    return 'original_source_join' if value['payload_result_status_digest'] != value['result_status_digest'] else None


def RR07_owner_result_ref(value, context):
    return 'original_source_join' if value['payload_owner_result_ref_digest'] != value['result_owner_result_ref_digest'] else None


def RR08_owner_readback_ref(value, context):
    return 'original_source_join' if value['payload_owner_readback_ref_digest'] != value['result_readback_ref_digest'] else None


def RR09_return_context_ref(value, context):
    return 'original_source_join' if value['payload_return_context_ref_digest'] != value['result_return_context_ref_digest'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('RR06_result_status', g.Invariant('/result_status', 'equals the result status (exact typed bytes)'), 'original_source_join', RR06_result_status),
        g.Guard('RR07_owner_result_ref', g.Invariant('/owner_result_ref', 'equals the result owner_result_ref (exact typed bytes)'), 'original_source_join', RR07_owner_result_ref),
        g.Guard('RR08_owner_readback_ref', g.Invariant('/owner_readback_ref', 'equals the result readback_ref (exact typed bytes)'), 'original_source_join', RR08_owner_readback_ref),
        g.Guard('RR09_return_context_ref', g.Invariant('/return_context_ref', 'equals the result return_context_ref (exact typed bytes)'), 'original_source_join', RR09_return_context_ref),
    ])

    def check(value):
        table.require('RR06_result_status', value, context)
        table.require('RR07_owner_result_ref', value, context)
        table.require('RR08_owner_readback_ref', value, context)
        table.require('RR09_return_context_ref', value, context)
        return True
    return g.Case(table, check, context)
