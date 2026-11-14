"""W3I schema guard table entailed_sc_9e95925439cd96a4 (generated).
sc_9e95925439cd96a4: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/actor_kind/type
Entailed after sc_f62f412dfd52e190: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_9e95925439cd96a4(value, context):
    if value['sc_f62f412dfd52e190'] != []:
        return None
    if value['sc_9e95925439cd96a4'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_9e95925439cd96a4', g.Invariant('/payload_provenance_recorded/actor_kind', 'type at owner schema /properties/actor_kind/type'), 'schema_invalid', sc_9e95925439cd96a4),
    ])

    def check(value):
        table.require('sc_9e95925439cd96a4', value, context)
        return True
    return g.Case(table, check, context)
