"""W3I schema guard table entailed_sc_cf295da8eeccbe8f (generated).
sc_cf295da8eeccbe8f: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/actor_ref/minLength
Entailed after sc_302802b888659fd2: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_cf295da8eeccbe8f(value, context):
    if value['sc_302802b888659fd2'] != []:
        return None
    if value['sc_cf295da8eeccbe8f'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_cf295da8eeccbe8f', g.Invariant('/payload_replay_checkpointed/actor_ref', 'minLength at owner schema /properties/actor_ref/minLength'), 'schema_invalid', sc_cf295da8eeccbe8f),
    ])

    def check(value):
        table.require('sc_cf295da8eeccbe8f', value, context)
        return True
    return g.Case(table, check, context)
