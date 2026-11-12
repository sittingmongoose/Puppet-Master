"""DG6B guard table original_server: Application-scope key input: the original Server.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('server_id',)


def OS01_server_string(value, context):
    return 'original_server_required' if type(value['server_id']) is not str else None


def OS02_server_nonempty(value, context):
    return 'original_server_required' if value['server_id'] == '' else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('OS01_server_string', g.Invariant('/server_id', 'is a str'), 'original_server_required', OS01_server_string),
        g.Guard('OS02_server_nonempty', g.Invariant('/server_id', 'is not empty'), 'original_server_required', OS02_server_nonempty),
    ])

    def check(value):
        table.require('OS01_server_string', value, context)
        table.require('OS02_server_nonempty', value, context)
        return True
    return g.Case(table, check, context)
