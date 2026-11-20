"""W3I schema guard table entailed_sc_4944232368e4f2ac (generated).
sc_4944232368e4f2ac: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/fact_ref/minLength
Entailed after sc_87ab89726a861dfa: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_4944232368e4f2ac(value, context):
    if value['sc_87ab89726a861dfa'] != []:
        return None
    if value['sc_4944232368e4f2ac'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_4944232368e4f2ac', g.Invariant('/payload_replay_checkpointed/fact_ref', 'minLength at owner schema /properties/fact_ref/minLength'), 'schema_invalid', sc_4944232368e4f2ac),
    ])

    def check(value):
        table.require('sc_4944232368e4f2ac', value, context)
        return True
    return g.Case(table, check, context)
