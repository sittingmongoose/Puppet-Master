"""DG6B guard table inline_size: SP-337 inline body limit.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('body_size',)


def IS01_inline_limit(value, context):
    return 'inline_body_too_large' if value['body_size'] > 16384 else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('IS01_inline_limit', g.Invariant('/body_size', 'an inline body is at most 16384 canonical bytes'), 'inline_body_too_large', IS01_inline_limit),
    ])

    def check(value):
        table.require('IS01_inline_limit', value, context)
        return True
    return g.Case(table, check, context)
