"""W3I schema guard table entailed_sc_4e6e7c0e8f54864e (generated).
sc_4e6e7c0e8f54864e: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/replay_checkpoint_ref/minLength
Entailed after sc_2d18478ea473aac3: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_4e6e7c0e8f54864e(value, context):
    if value['sc_2d18478ea473aac3'] != []:
        return None
    if value['sc_4e6e7c0e8f54864e'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_4e6e7c0e8f54864e', g.Invariant('/payload_actor_identified/replay_checkpoint_ref', 'minLength at owner schema /properties/replay_checkpoint_ref/minLength'), 'schema_invalid', sc_4e6e7c0e8f54864e),
    ])

    def check(value):
        table.require('sc_4e6e7c0e8f54864e', value, context)
        return True
    return g.Case(table, check, context)
