"""W3I schema guard table entailed_sc_e375d00075fe4879 (generated).
sc_e375d00075fe4879: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/actor_ref/type
Entailed after sc_ceafa747397d3e41: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_e375d00075fe4879(value, context):
    if value['sc_ceafa747397d3e41'] != []:
        return None
    if value['sc_e375d00075fe4879'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_e375d00075fe4879', g.Invariant('/payload_actor_identified/actor_ref', 'type at owner schema /properties/actor_ref/type'), 'schema_invalid', sc_e375d00075fe4879),
    ])

    def check(value):
        table.require('sc_e375d00075fe4879', value, context)
        return True
    return g.Case(table, check, context)
