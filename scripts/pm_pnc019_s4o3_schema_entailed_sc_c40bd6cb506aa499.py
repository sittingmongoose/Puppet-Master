"""W3I schema guard table entailed_sc_c40bd6cb506aa499 (generated).
sc_c40bd6cb506aa499: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/continuity_id/type
Entailed after sc_8242347ac7322b65: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_c40bd6cb506aa499(value, context):
    if value['sc_8242347ac7322b65'] != []:
        return None
    if value['sc_c40bd6cb506aa499'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_c40bd6cb506aa499', g.Invariant('/projection/continuity_id', 'type at owner schema /properties/continuity_id/type'), 'schema_invalid', sc_c40bd6cb506aa499),
    ])

    def check(value):
        table.require('sc_c40bd6cb506aa499', value, context)
        return True
    return g.Case(table, check, context)
