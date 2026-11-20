"""W3I schema guard table entailed_sc_a035b17c6b0ce8ea (generated).
sc_a035b17c6b0ce8ea: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/source_event_id/type
Entailed after sc_a5bb490365b20317: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_a035b17c6b0ce8ea(value, context):
    if value['sc_a5bb490365b20317'] != []:
        return None
    if value['sc_a035b17c6b0ce8ea'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_a035b17c6b0ce8ea', g.Invariant('/payload_actor_identified/source_event_id', 'type at owner schema /properties/source_event_id/type'), 'schema_invalid', sc_a035b17c6b0ce8ea),
    ])

    def check(value):
        table.require('sc_a035b17c6b0ce8ea', value, context)
        return True
    return g.Case(table, check, context)
