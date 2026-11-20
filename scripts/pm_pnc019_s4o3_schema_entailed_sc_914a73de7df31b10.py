"""W3I schema guard table entailed_sc_914a73de7df31b10 (generated).
sc_914a73de7df31b10: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/actor_kind/minLength
Entailed after sc_610ab158edf86f8a: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_914a73de7df31b10(value, context):
    if value['sc_610ab158edf86f8a'] != []:
        return None
    if value['sc_914a73de7df31b10'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_914a73de7df31b10', g.Invariant('/payload_replay_checkpointed/actor_kind', 'minLength at owner schema /properties/actor_kind/minLength'), 'schema_invalid', sc_914a73de7df31b10),
    ])

    def check(value):
        table.require('sc_914a73de7df31b10', value, context)
        return True
    return g.Case(table, check, context)
