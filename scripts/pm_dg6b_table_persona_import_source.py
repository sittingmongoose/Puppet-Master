"""DG6B guard table persona_import_source: An import names its verified source.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('source_id', 'source_revision', 'source_sha256')


def IM01_source_id(value, context):
    return 'source_trust' if value['source_id'] is None else None


def IM02_source_revision(value, context):
    return 'source_trust' if value['source_revision'] is None else None


def IM03_source_sha256(value, context):
    return 'source_trust' if value['source_sha256'] is None else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('IM01_source_id', g.Invariant('/source_id', 'is not null'), 'source_trust', IM01_source_id),
        g.Guard('IM02_source_revision', g.Invariant('/source_revision', 'is not null'), 'source_trust', IM02_source_revision),
        g.Guard('IM03_source_sha256', g.Invariant('/source_sha256', 'is not null'), 'source_trust', IM03_source_sha256),
    ])

    def check(value):
        table.require('IM01_source_id', value, context)
        table.require('IM02_source_revision', value, context)
        table.require('IM03_source_sha256', value, context)
        return True
    return g.Case(table, check, context)
