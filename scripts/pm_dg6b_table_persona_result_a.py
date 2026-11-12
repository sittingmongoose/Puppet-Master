"""DG6B guard table persona_result_a: Payload fields equal the owner result (part a).

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('payload_command_id_digest', 'result_command_id_digest', 'payload_operation_id_digest', 'result_operation_id_digest', 'payload_persona_id_digest', 'result_persona_id_digest', 'payload_revision_digest', 'result_owner_revision_digest', 'payload_content_sha256_digest', 'result_content_sha256_digest')


def RR01_command_id(value, context):
    return 'original_source_join' if value['payload_command_id_digest'] != value['result_command_id_digest'] else None


def RR02_operation_id(value, context):
    return 'original_source_join' if value['payload_operation_id_digest'] != value['result_operation_id_digest'] else None


def RR03_persona_id(value, context):
    return 'original_source_join' if value['payload_persona_id_digest'] != value['result_persona_id_digest'] else None


def RR04_revision(value, context):
    return 'original_source_join' if value['payload_revision_digest'] != value['result_owner_revision_digest'] else None


def RR05_content_sha256(value, context):
    return 'original_source_join' if value['payload_content_sha256_digest'] != value['result_content_sha256_digest'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('RR01_command_id', g.Invariant('/command_id', 'equals the result command_id (exact typed bytes)'), 'original_source_join', RR01_command_id),
        g.Guard('RR02_operation_id', g.Invariant('/operation_id', 'equals the result operation_id (exact typed bytes)'), 'original_source_join', RR02_operation_id),
        g.Guard('RR03_persona_id', g.Invariant('/persona_id', 'equals the result persona_id (exact typed bytes)'), 'original_source_join', RR03_persona_id),
        g.Guard('RR04_revision', g.Invariant('/revision', 'equals the result owner_revision (exact typed bytes)'), 'original_source_join', RR04_revision),
        g.Guard('RR05_content_sha256', g.Invariant('/content_sha256', 'equals the result content_sha256 (exact typed bytes)'), 'original_source_join', RR05_content_sha256),
    ])

    def check(value):
        table.require('RR01_command_id', value, context)
        table.require('RR02_operation_id', value, context)
        table.require('RR03_persona_id', value, context)
        table.require('RR04_revision', value, context)
        table.require('RR05_content_sha256', value, context)
        return True
    return g.Case(table, check, context)
