"""W3I schema guard table entailed_sc_c7c69f59a379c93a (generated).
sc_c7c69f59a379c93a: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/redaction_profile_id/type
Entailed after sc_9d16451a42848256: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_c7c69f59a379c93a(value, context):
    if value['sc_9d16451a42848256'] != []:
        return None
    if value['sc_c7c69f59a379c93a'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_c7c69f59a379c93a', g.Invariant('/payload_replay_checkpointed/redaction_profile_id', 'type at owner schema /properties/redaction_profile_id/type'), 'schema_invalid', sc_c7c69f59a379c93a),
    ])

    def check(value):
        table.require('sc_c7c69f59a379c93a', value, context)
        return True
    return g.Case(table, check, context)
