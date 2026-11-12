"""One coordination guard table."""
import pm_guard_isolation as g

def p_0(value, context):
    return None if value['coordination_storage_value_schema_invalid'] is True else 'coordination_storage_value_schema_invalid'

def svr_unprovable_case():
    table = g.GuardTable([
        g.Guard('coordination_storage_value_schema_invalid', g.Invariant('/coordination_storage_value_schema_invalid', 'the coordination storage value schema invalid observation holds'), 'coordination_storage_value_schema_invalid', p_0),
    ])
    def check(value):
        table.require('coordination_storage_value_schema_invalid', value)
        return True
    return g.Case(table, check)

