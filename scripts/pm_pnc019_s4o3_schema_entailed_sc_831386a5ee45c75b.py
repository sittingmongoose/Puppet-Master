"""W3I schema guard table entailed_sc_831386a5ee45c75b (generated).
sc_831386a5ee45c75b: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/event_id/type
Entailed after sc_496bfea35d873a4a: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_831386a5ee45c75b(value, context):
    if value['sc_496bfea35d873a4a'] != []:
        return None
    if value['sc_831386a5ee45c75b'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_831386a5ee45c75b', g.Invariant('/projection/event_id', 'type at owner schema /properties/event_id/type'), 'schema_invalid', sc_831386a5ee45c75b),
    ])

    def check(value):
        table.require('sc_831386a5ee45c75b', value, context)
        return True
    return g.Case(table, check, context)
