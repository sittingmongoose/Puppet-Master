"""DG6A guard table storage_schema: one registered Storage schema row is its companion.

Method B guard rows (scripts/pm_guard_isolation.py) for one surface row of
scripts/pm-card5-event-contracts-check.py::storage_schema_errors. Each
predicate reads one observation the checker derives for that row (row count,
companion ref/id joins, metaschema validity, eager reference closure, exact
content equality); predicates never recompute, repair or call helpers. The
pre-table guard continued to the next surface at the first refusal per row,
so SS02-SS06 are entailed in order: each refuses only under every earlier
row's fact, as in the DS15 follower rows. FIELDS names every observation
the rows read; the checker passes no other and appends ':' + family_id to
the first refusing row's code, exactly as before.
"""
import pm_guard_isolation as g

FIELDS = ('row_count_is_one', 'companion_ref_matches', 'schema_id_matches', 'stored_schema_valid', 'stored_refs_resolve', 'stored_equals_companion')


def SS01_row_count_is_one(value, context):
    return 'storage_row_count' if value['row_count_is_one'] is not True else None


def SS02_companion_ref_matches(value, context):
    return 'storage_companion_ref' if value['row_count_is_one'] is True and value['companion_ref_matches'] is not True else None


def SS03_schema_id_matches(value, context):
    return 'storage_schema_id' if value['row_count_is_one'] is True and value['companion_ref_matches'] is True and value['schema_id_matches'] is not True else None


def SS04_stored_schema_valid(value, context):
    return 'storage_schema_invalid' if value['row_count_is_one'] is True and value['companion_ref_matches'] is True and value['schema_id_matches'] is True and value['stored_schema_valid'] is not True else None


def SS05_stored_refs_resolve(value, context):
    return 'storage_schema_reference' if value['row_count_is_one'] is True and value['companion_ref_matches'] is True and value['schema_id_matches'] is True and value['stored_schema_valid'] is True and value['stored_refs_resolve'] is not True else None


def SS06_stored_equals_companion(value, context):
    return 'storage_schema_drift' if value['row_count_is_one'] is True and value['companion_ref_matches'] is True and value['schema_id_matches'] is True and value['stored_schema_valid'] is True and value['stored_refs_resolve'] is True and value['stored_equals_companion'] is not True else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('SS01_row_count_is_one', g.Invariant('/row_count_is_one', 'registry holds exactly one row for the surface family id'), 'storage_row_count', SS01_row_count_is_one),
        g.Guard('SS02_companion_ref_matches', g.Invariant('/companion_ref_matches', 'row value_schema_ref is the family companion schema path'), 'storage_companion_ref', SS02_companion_ref_matches),
        g.Guard('SS03_schema_id_matches', g.Invariant('/schema_id_matches', 'row value_schema_id is the companion $id'), 'storage_schema_id', SS03_schema_id_matches),
        g.Guard('SS04_stored_schema_valid', g.Invariant('/stored_schema_valid', 'stored value_schema passes its metaschema'), 'storage_schema_invalid', SS04_stored_schema_valid),
        g.Guard('SS05_stored_refs_resolve', g.Invariant('/stored_refs_resolve', 'every stored schema reference resolves, including unvisited definitions'), 'storage_schema_reference', SS05_stored_refs_resolve),
        g.Guard('SS06_stored_equals_companion', g.Invariant('/stored_equals_companion', 'stored schema content exactly equals the companion schema'), 'storage_schema_drift', SS06_stored_equals_companion),
    ])

    def check(value):
        table.require('SS01_row_count_is_one', value, context)
        table.require('SS02_companion_ref_matches', value, context)
        table.require('SS03_schema_id_matches', value, context)
        table.require('SS04_stored_schema_valid', value, context)
        table.require('SS05_stored_refs_resolve', value, context)
        table.require('SS06_stored_equals_companion', value, context)
        return True
    return g.Case(table, check, context)
