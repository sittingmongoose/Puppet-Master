"""DR guard table schema: Exact schema validator: one adopted schema occurrence per call.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('structural_errors', 'lf_rejects', 'key_lf_rejects', 'number_errors')


def S07_structural(value, context):
    return 'schema_structural' if value['structural_errors'] != 0 else None


def S02_identifier_fullmatch(value, context):
    return 'schema_identifier_fullmatch' if value['lf_rejects'] is not False else None


def S04_identifier_key_fullmatch(value, context):
    return 'schema_identifier_key_fullmatch' if value['key_lf_rejects'] is not False else None


def N01_canonical_numbers(value, context):
    return 'schema_canonical_numbers' if value['number_errors'] != 0 else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('S07_structural', g.Invariant('/structural_errors', 'the closed Draft 2020-12 schema reports no error'), 'schema_structural', S07_structural),
        g.Guard('S02_identifier_fullmatch', g.Invariant('/lf_rejects', 'anchored identifier patterns match the entire value'), 'schema_identifier_fullmatch', S02_identifier_fullmatch),
        g.Guard('S04_identifier_key_fullmatch', g.Invariant('/key_lf_rejects', 'anchored identifier keys match the entire key'), 'schema_identifier_key_fullmatch', S04_identifier_key_fullmatch),
        g.Guard('N01_canonical_numbers', g.Invariant('/number_errors', 'current numbers use integer form for integral values'), 'schema_canonical_numbers', N01_canonical_numbers),
    ])

    def check(value):
        table.require('S07_structural', value, context)
        table.require('S02_identifier_fullmatch', value, context)
        table.require('S04_identifier_key_fullmatch', value, context)
        table.require('N01_canonical_numbers', value, context)
        return True
    return g.Case(table, check, context)
