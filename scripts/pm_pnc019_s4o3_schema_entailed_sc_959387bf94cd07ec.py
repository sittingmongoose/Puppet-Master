"""W3I schema guard table entailed_sc_959387bf94cd07ec (generated).
sc_959387bf94cd07ec: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/redaction_decision/minLength
Entailed after sc_f25b6dbdfb35faed: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_959387bf94cd07ec(value, context):
    if value['sc_f25b6dbdfb35faed'] != []:
        return None
    if value['sc_959387bf94cd07ec'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_959387bf94cd07ec', g.Invariant('/payload_replay_checkpointed/redaction_decision', 'minLength at owner schema /properties/redaction_decision/minLength'), 'schema_invalid', sc_959387bf94cd07ec),
    ])

    def check(value):
        table.require('sc_959387bf94cd07ec', value, context)
        return True
    return g.Case(table, check, context)
