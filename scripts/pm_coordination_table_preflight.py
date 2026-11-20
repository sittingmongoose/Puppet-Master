"""One coordination guard table."""
import pm_guard_isolation as g

def p_0(value, context):
    return None if value['prepared_row_not_admissible'] is True else 'prepared_row_not_admissible'

def preflight_case():
    table = g.GuardTable([
        g.Guard('prepared_row_not_admissible', g.Invariant('/prepared_row_not_admissible', 'the prepared row not admissible observation holds'), 'prepared_row_not_admissible', p_0),
    ])
    def check(value):
        table.require('prepared_row_not_admissible', value)
        return True
    return g.Case(table, check)

