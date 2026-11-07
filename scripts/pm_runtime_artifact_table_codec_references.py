"""DR guard table codec_references: Codec, identity, validator-profile, oracle and reference preconditions.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('unresolved_count',)


def S01_references_resolve(value, context):
    return 'unresolved_schema_reference' if value['unresolved_count'] != 0 else None


def references_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('S01_references_resolve', g.Invariant('/unresolved_count', 'every schema reference resolves, including unused branches'), 'unresolved_schema_reference', S01_references_resolve),
    ])

    def check(value):
        table.require('S01_references_resolve', value, context)
        return True
    return g.Case(table, check, context)
