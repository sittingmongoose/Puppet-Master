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

FIELDS = ('structural_errors', 'datetime_rejects', 'lf_rejects', 'key_lf_rejects', 'integer_slot_rejects')


def S07_structural(value, context):
    return 'schema_structural' if value['structural_errors'] != 0 else None


def S08_date_time(value, context):
    return 'schema_date_time' if value['datetime_rejects'] is not False else None


def S02_identifier_fullmatch(value, context):
    return 'schema_identifier_fullmatch' if value['lf_rejects'] is not False else None


def S04_identifier_key_fullmatch(value, context):
    return 'schema_identifier_key_fullmatch' if value['key_lf_rejects'] is not False else None


def N01_integer_slots(value, context):
    return 'schema_integer_slot' if value['integer_slot_rejects'] is not False else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('S07_structural', g.Invariant('/structural_errors', 'the closed Draft 2020-12 schema reports no error outside the date-time format'), 'schema_structural', S07_structural),
        g.Guard('S08_date_time', g.Invariant('/datetime_rejects', 'every timestamp passes the shared CV-1101/CV-253 date-time check at its owner profile'), 'schema_date_time', S08_date_time),
        g.Guard('S02_identifier_fullmatch', g.Invariant('/lf_rejects', 'anchored identifier patterns match the entire value'), 'schema_identifier_fullmatch', S02_identifier_fullmatch),
        g.Guard('S04_identifier_key_fullmatch', g.Invariant('/key_lf_rejects', 'anchored identifier keys match the entire key'), 'schema_identifier_key_fullmatch', S04_identifier_key_fullmatch),
        g.Guard('N01_integer_slots', g.Invariant('/integer_slot_rejects', 'every current schema integer slot holds an exact integer (CV-1100 current_integer)'), 'schema_integer_slot', N01_integer_slots),
    ])

    def check(value):
        table.require('S07_structural', value, context)
        table.require('S08_date_time', value, context)
        table.require('S02_identifier_fullmatch', value, context)
        table.require('S04_identifier_key_fullmatch', value, context)
        table.require('N01_integer_slots', value, context)
        return True
    return g.Case(table, check, context)
