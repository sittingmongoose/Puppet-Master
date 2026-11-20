"""DG6B guard table persona_lineage_copy: Runtime lineage equals the frozen resolution.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('lineage_digest', 'resolution_lineage_digest')


def LC01_runtime_lineage(value, context):
    return 'original_source_join' if value['lineage_digest'] != value['resolution_lineage_digest'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('LC01_runtime_lineage', g.Invariant('/runtime_lineage', 'equals the resolution runtime_lineage (exact typed bytes)'), 'original_source_join', LC01_runtime_lineage),
    ])

    def check(value):
        table.require('LC01_runtime_lineage', value, context)
        return True
    return g.Case(table, check, context)
