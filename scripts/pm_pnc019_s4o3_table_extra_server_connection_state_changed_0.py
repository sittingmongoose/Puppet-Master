"""S4 reference-store extra_server_connection_state_changed_0 predicates (generated)."""
import pm_guard_isolation as g


def extra_connection_catchup(v, context):
    if v['extra_connection_catchup']['cursor_ref'] is None and v['extra_connection_catchup']['snapshot_ref'] is None:
        return 'owner_predicate_failed'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('extra_connection_catchup', g.Invariant('/extra_connection_catchup', 'actual reference-store extra_connection_catchup invariant'), 'owner_predicate_failed', extra_connection_catchup),
    ])

    def check(value):
        table.require('extra_connection_catchup', value, context)
        return True
    return g.Case(table, check, context)
