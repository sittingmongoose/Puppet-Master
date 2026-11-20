"""DG6B guard table persona_resolution_b: Selection payload equals the frozen resolution (part b).

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('payload_runtime_snapshot_ref_digest', 'resolution_runtime_snapshot_ref_digest', 'payload_runtime_snapshot_sha256_digest', 'resolution_runtime_snapshot_sha256_digest', 'payload_operation_id_digest', 'resolution_operation_id_digest', 'payload_persona_id_digest', 'resolution_persona_id_digest', 'payload_owner_result_ref_digest', 'resolution_owner_result_ref_digest', 'payload_selection_target_ref_digest', 'resolution_selection_target_ref_digest')


def SL07_runtime_snapshot_ref(value, context):
    return 'original_source_join' if value['payload_runtime_snapshot_ref_digest'] != value['resolution_runtime_snapshot_ref_digest'] else None


def SL08_runtime_snapshot_sha256(value, context):
    return 'original_source_join' if value['payload_runtime_snapshot_sha256_digest'] != value['resolution_runtime_snapshot_sha256_digest'] else None


def SL09_operation_id(value, context):
    return 'original_source_join' if value['payload_operation_id_digest'] != value['resolution_operation_id_digest'] else None


def SL10_persona_id(value, context):
    return 'original_source_join' if value['payload_persona_id_digest'] != value['resolution_persona_id_digest'] else None


def SL11_owner_result_ref(value, context):
    return 'original_source_join' if value['payload_owner_result_ref_digest'] != value['resolution_owner_result_ref_digest'] else None


def SL12_selection_target_ref(value, context):
    return 'original_source_join' if value['payload_selection_target_ref_digest'] != value['resolution_selection_target_ref_digest'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('SL07_runtime_snapshot_ref', g.Invariant('/runtime_snapshot_ref', 'equals the resolution runtime_snapshot_ref (exact typed bytes)'), 'original_source_join', SL07_runtime_snapshot_ref),
        g.Guard('SL08_runtime_snapshot_sha256', g.Invariant('/runtime_snapshot_sha256', 'equals the resolution runtime_snapshot_sha256 (exact typed bytes)'), 'original_source_join', SL08_runtime_snapshot_sha256),
        g.Guard('SL09_operation_id', g.Invariant('/operation_id', 'equals the resolution operation_id (exact typed bytes)'), 'original_source_join', SL09_operation_id),
        g.Guard('SL10_persona_id', g.Invariant('/persona_id', 'equals the resolution persona_id (exact typed bytes)'), 'original_source_join', SL10_persona_id),
        g.Guard('SL11_owner_result_ref', g.Invariant('/owner_result_ref', 'equals the resolution owner_result_ref (exact typed bytes)'), 'original_source_join', SL11_owner_result_ref),
        g.Guard('SL12_selection_target_ref', g.Invariant('/selection_target_ref', 'equals the resolution selection_target_ref (exact typed bytes)'), 'original_source_join', SL12_selection_target_ref),
    ])

    def check(value):
        table.require('SL07_runtime_snapshot_ref', value, context)
        table.require('SL08_runtime_snapshot_sha256', value, context)
        table.require('SL09_operation_id', value, context)
        table.require('SL10_persona_id', value, context)
        table.require('SL11_owner_result_ref', value, context)
        table.require('SL12_selection_target_ref', value, context)
        return True
    return g.Case(table, check, context)
