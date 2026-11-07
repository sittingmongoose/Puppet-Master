"""DR guard table codec_storage: Codec, identity, validator-profile, oracle and reference preconditions.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('number_errors',)


def N01s_storage_numbers(value, context):
    return 'noncanonical producer number' if value['number_errors'] != 0 else None


def storage_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('N01s_storage_numbers', g.Invariant('/number_errors', 'producer storage input uses integer form for integral values'), 'noncanonical producer number', N01s_storage_numbers),
    ])

    def check(value):
        table.require('N01s_storage_numbers', value, context)
        return True
    return g.Case(table, check, context)
