"""DG6B guard table persona_request_a: Payload fields equal the owner request (part a).

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('payload_command_id_digest', 'request_command_id_digest', 'payload_client_id_digest', 'request_client_id_digest', 'payload_persona_id_digest', 'request_persona_id_digest', 'payload_source_id_digest', 'request_source_id_digest', 'payload_source_revision_digest', 'request_source_revision_digest')


def QK01_command_id(value, context):
    return 'original_source_join' if value['payload_command_id_digest'] != value['request_command_id_digest'] else None


def QK02_client_id(value, context):
    return 'original_source_join' if value['payload_client_id_digest'] != value['request_client_id_digest'] else None


def QK03_persona_id(value, context):
    return 'original_source_join' if value['payload_persona_id_digest'] != value['request_persona_id_digest'] else None


def QK04_source_id(value, context):
    return 'original_source_join' if value['payload_source_id_digest'] != value['request_source_id_digest'] else None


def QK05_source_revision(value, context):
    return 'original_source_join' if value['payload_source_revision_digest'] != value['request_source_revision_digest'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('QK01_command_id', g.Invariant('/command_id', 'equals the request command_id (exact typed bytes)'), 'original_source_join', QK01_command_id),
        g.Guard('QK02_client_id', g.Invariant('/client_id', 'equals the request client_id (exact typed bytes)'), 'original_source_join', QK02_client_id),
        g.Guard('QK03_persona_id', g.Invariant('/persona_id', 'equals the request persona_id (exact typed bytes)'), 'original_source_join', QK03_persona_id),
        g.Guard('QK04_source_id', g.Invariant('/source_id', 'equals the request source_id (exact typed bytes)'), 'original_source_join', QK04_source_id),
        g.Guard('QK05_source_revision', g.Invariant('/source_revision', 'equals the request source_revision (exact typed bytes)'), 'original_source_join', QK05_source_revision),
    ])

    def check(value):
        table.require('QK01_command_id', value, context)
        table.require('QK02_client_id', value, context)
        table.require('QK03_persona_id', value, context)
        table.require('QK04_source_id', value, context)
        table.require('QK05_source_revision', value, context)
        return True
    return g.Case(table, check, context)
