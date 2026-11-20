"""W3I schema guard table entailed_sc_00d7b1a0448830b5 (generated).
sc_00d7b1a0448830b5: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/actor_ref/minLength
Entailed after sc_54916a1552357c3e: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_00d7b1a0448830b5(value, context):
    if value['sc_54916a1552357c3e'] != []:
        return None
    if value['sc_00d7b1a0448830b5'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_00d7b1a0448830b5', g.Invariant('/payload_actor_identified/actor_ref', 'minLength at owner schema /properties/actor_ref/minLength'), 'schema_invalid', sc_00d7b1a0448830b5),
    ])

    def check(value):
        table.require('sc_00d7b1a0448830b5', value, context)
        return True
    return g.Case(table, check, context)
