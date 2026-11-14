"""W3I schema guard table entailed_sc_0a51f1711b4c2b88 (generated).
sc_0a51f1711b4c2b88: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/source_event_id/minLength
Entailed after sc_d195ad5766c004aa: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_0a51f1711b4c2b88(value, context):
    if value['sc_d195ad5766c004aa'] != []:
        return None
    if value['sc_0a51f1711b4c2b88'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_0a51f1711b4c2b88', g.Invariant('/payload_actor_identified/source_event_id', 'minLength at owner schema /properties/source_event_id/minLength'), 'schema_invalid', sc_0a51f1711b4c2b88),
    ])

    def check(value):
        table.require('sc_0a51f1711b4c2b88', value, context)
        return True
    return g.Case(table, check, context)
