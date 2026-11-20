"""W3I schema guard table entailed_sc_9d2da061f0212421 (generated).
sc_9d2da061f0212421: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/actor_kind/type
Entailed after sc_38f2d296116242db: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_9d2da061f0212421(value, context):
    if value['sc_38f2d296116242db'] != []:
        return None
    if value['sc_9d2da061f0212421'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_9d2da061f0212421', g.Invariant('/payload_actor_identified/actor_kind', 'type at owner schema /properties/actor_kind/type'), 'schema_invalid', sc_9d2da061f0212421),
    ])

    def check(value):
        table.require('sc_9d2da061f0212421', value, context)
        return True
    return g.Case(table, check, context)
