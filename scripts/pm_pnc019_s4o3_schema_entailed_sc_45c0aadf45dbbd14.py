"""W3I schema guard table entailed_sc_45c0aadf45dbbd14 (generated).
sc_45c0aadf45dbbd14: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/stream_id/minLength
Entailed after sc_a62f2471069183d8: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_45c0aadf45dbbd14(value, context):
    if value['sc_a62f2471069183d8'] != []:
        return None
    if value['sc_45c0aadf45dbbd14'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_45c0aadf45dbbd14', g.Invariant('/payload_actor_identified/stream_id', 'minLength at owner schema /properties/stream_id/minLength'), 'schema_invalid', sc_45c0aadf45dbbd14),
    ])

    def check(value):
        table.require('sc_45c0aadf45dbbd14', value, context)
        return True
    return g.Case(table, check, context)
