"""W3I schema guard table entailed_sc_68a6f46e44bd04a1 (generated).
sc_68a6f46e44bd04a1: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/continuity_id/minLength
Entailed after sc_ab8ce6f57b0ded41: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_68a6f46e44bd04a1(value, context):
    if value['sc_ab8ce6f57b0ded41'] != []:
        return None
    if value['sc_68a6f46e44bd04a1'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_68a6f46e44bd04a1', g.Invariant('/payload_actor_identified/continuity_id', 'minLength at owner schema /properties/continuity_id/minLength'), 'schema_invalid', sc_68a6f46e44bd04a1),
    ])

    def check(value):
        table.require('sc_68a6f46e44bd04a1', value, context)
        return True
    return g.Case(table, check, context)
