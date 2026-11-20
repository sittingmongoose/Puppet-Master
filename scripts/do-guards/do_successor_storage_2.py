"""DO guard suite `successor_storage_2` (sweep part 2A). Successor graph: the Storage member and profile match the V2 wrapper.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def successor_storage_key_shape(value, context):
    if value['storage_member_count'] != 1:
        return None
    expected = (value['graph']['physical_selection']['key_prefix']
                + ':{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(crew_id)}:{hex(run_id)}:{hex(message_id)}')
    return 'successor_storage_selection' if value['storage_row']['key_shape'] != expected else None


ROWS = (
    ('successor_storage_key_shape', '/storage_value_registry/families/v2/key_shape', 'is the key prefix and the six hex(...) fields',
     'successor_storage_selection', successor_storage_key_shape, ('storage_member_count', 'storage_row', 'graph'), 'storage'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('successor_storage_key_shape', g.Invariant('/storage_value_registry/families/v2/key_shape', 'is the key prefix and the six hex(...) fields'), 'successor_storage_selection', successor_storage_key_shape),
    ])
    context = None

    def check(complete):
        table.require('successor_storage_key_shape', complete, context)
        return True
    return g.Case(table, check, context)
