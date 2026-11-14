"""W3I schema guard table entailed_sc_fc4a69656c6f8c52 (generated).
sc_fc4a69656c6f8c52: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/redaction_profile_id/type
Entailed after sc_7e0bb7e42e882e32: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_fc4a69656c6f8c52(value, context):
    if value['sc_7e0bb7e42e882e32'] != []:
        return None
    if value['sc_fc4a69656c6f8c52'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_fc4a69656c6f8c52', g.Invariant('/payload_actor_identified/redaction_profile_id', 'type at owner schema /properties/redaction_profile_id/type'), 'schema_invalid', sc_fc4a69656c6f8c52),
    ])

    def check(value):
        table.require('sc_fc4a69656c6f8c52', value, context)
        return True
    return g.Case(table, check, context)
