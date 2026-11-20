"""DG6B guard table persona_resolution_a: Selection payload equals the frozen resolution (part a).

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('payload_requested_persona_digest', 'resolution_requested_persona_digest', 'payload_effective_persona_digest', 'resolution_effective_persona_digest', 'payload_persona_selection_source_digest', 'resolution_persona_selection_source_digest', 'payload_selection_reason_digest', 'resolution_selection_reason_digest', 'payload_persona_override_scope_digest', 'resolution_persona_override_scope_digest', 'payload_persona_override_owner_id_digest', 'resolution_persona_override_owner_id_digest')


def SL01_requested_persona(value, context):
    return 'original_source_join' if value['payload_requested_persona_digest'] != value['resolution_requested_persona_digest'] else None


def SL02_effective_persona(value, context):
    return 'original_source_join' if value['payload_effective_persona_digest'] != value['resolution_effective_persona_digest'] else None


def SL03_persona_selection_source(value, context):
    return 'original_source_join' if value['payload_persona_selection_source_digest'] != value['resolution_persona_selection_source_digest'] else None


def SL04_selection_reason(value, context):
    return 'original_source_join' if value['payload_selection_reason_digest'] != value['resolution_selection_reason_digest'] else None


def SL05_persona_override_scope(value, context):
    return 'original_source_join' if value['payload_persona_override_scope_digest'] != value['resolution_persona_override_scope_digest'] else None


def SL06_persona_override_owner_id(value, context):
    return 'original_source_join' if value['payload_persona_override_owner_id_digest'] != value['resolution_persona_override_owner_id_digest'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('SL01_requested_persona', g.Invariant('/requested_persona', 'equals the resolution requested_persona (exact typed bytes)'), 'original_source_join', SL01_requested_persona),
        g.Guard('SL02_effective_persona', g.Invariant('/effective_persona', 'equals the resolution effective_persona (exact typed bytes)'), 'original_source_join', SL02_effective_persona),
        g.Guard('SL03_persona_selection_source', g.Invariant('/persona_selection_source', 'equals the resolution persona_selection_source (exact typed bytes)'), 'original_source_join', SL03_persona_selection_source),
        g.Guard('SL04_selection_reason', g.Invariant('/selection_reason', 'equals the resolution selection_reason (exact typed bytes)'), 'original_source_join', SL04_selection_reason),
        g.Guard('SL05_persona_override_scope', g.Invariant('/persona_override_scope', 'equals the resolution persona_override_scope (exact typed bytes)'), 'original_source_join', SL05_persona_override_scope),
        g.Guard('SL06_persona_override_owner_id', g.Invariant('/persona_override_owner_id', 'equals the resolution persona_override_owner_id (exact typed bytes)'), 'original_source_join', SL06_persona_override_owner_id),
    ])

    def check(value):
        table.require('SL01_requested_persona', value, context)
        table.require('SL02_effective_persona', value, context)
        table.require('SL03_persona_selection_source', value, context)
        table.require('SL04_selection_reason', value, context)
        table.require('SL05_persona_override_scope', value, context)
        table.require('SL06_persona_override_owner_id', value, context)
        return True
    return g.Case(table, check, context)
