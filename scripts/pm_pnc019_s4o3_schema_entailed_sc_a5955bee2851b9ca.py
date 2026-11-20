"""W3I schema guard table entailed_sc_a5955bee2851b9ca (generated).
sc_a5955bee2851b9ca: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/fact_ref/type
Entailed after sc_a73cb776845a7aa5: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_a5955bee2851b9ca(value, context):
    if value['sc_a73cb776845a7aa5'] != []:
        return None
    if value['sc_a5955bee2851b9ca'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_a5955bee2851b9ca', g.Invariant('/payload_actor_identified/fact_ref', 'type at owner schema /properties/fact_ref/type'), 'schema_invalid', sc_a5955bee2851b9ca),
    ])

    def check(value):
        table.require('sc_a5955bee2851b9ca', value, context)
        return True
    return g.Case(table, check, context)
