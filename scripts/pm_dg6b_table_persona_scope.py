"""DG6B guard table persona_scope: Persona scope key and request scope.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('scope_key', 'expected_scope_key', 'scope_digest', 'request_scope_digest')


def PC01_scope_key(value, context):
    return 'scope' if value['scope_key'] != value['expected_scope_key'] else None


def PC02_request_scope(value, context):
    return 'scope' if value['scope_digest'] != value['request_scope_digest'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('PC01_scope_key', g.Invariant('/scope', 'the payload scope key equals the supplied scope key'), 'scope', PC01_scope_key),
        g.Guard('PC02_request_scope', g.Invariant('/scope', 'equals the owner request scope (exact typed bytes)'), 'scope', PC02_request_scope),
    ])

    def check(value):
        table.require('PC01_scope_key', value, context)
        table.require('PC02_request_scope', value, context)
        return True
    return g.Case(table, check, context)
