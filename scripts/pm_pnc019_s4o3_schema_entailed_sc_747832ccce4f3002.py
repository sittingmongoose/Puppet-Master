"""W3I schema guard table entailed_sc_747832ccce4f3002 (generated).
sc_747832ccce4f3002: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/stream_id/type
Entailed after sc_357d0eae066190eb: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_747832ccce4f3002(value, context):
    if value['sc_357d0eae066190eb'] != []:
        return None
    if value['sc_747832ccce4f3002'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_747832ccce4f3002', g.Invariant('/projection/stream_id', 'type at owner schema /properties/stream_id/type'), 'schema_invalid', sc_747832ccce4f3002),
    ])

    def check(value):
        table.require('sc_747832ccce4f3002', value, context)
        return True
    return g.Case(table, check, context)
