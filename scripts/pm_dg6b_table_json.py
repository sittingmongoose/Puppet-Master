"""DG6B guard table json: Strict JSON text: unique object keys and valid JSON.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('duplicate_keys', 'invalid')


def J01_unique_keys(value, context):
    return 'duplicate_json_key' if value['duplicate_keys'] != 0 else None


def J02_valid_json(value, context):
    return 'invalid_json' if value['invalid'] is not False else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('J01_unique_keys', g.Invariant('/duplicate_keys', 'no JSON object repeats a key'), 'duplicate_json_key', J01_unique_keys),
        g.Guard('J02_valid_json', g.Invariant('/invalid', 'the text parses as strict JSON'), 'invalid_json', J02_valid_json),
    ])

    def check(value):
        table.require('J01_unique_keys', value, context)
        table.require('J02_valid_json', value, context)
        return True
    return g.Case(table, check, context)
