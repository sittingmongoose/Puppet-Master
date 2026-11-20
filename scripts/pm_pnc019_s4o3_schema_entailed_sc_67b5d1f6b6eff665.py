"""W3I schema guard table entailed_sc_67b5d1f6b6eff665 (generated).
sc_67b5d1f6b6eff665: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/continuity_id/minLength
Entailed after sc_cdf5d546016ea734: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_67b5d1f6b6eff665(value, context):
    if value['sc_cdf5d546016ea734'] != []:
        return None
    if value['sc_67b5d1f6b6eff665'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_67b5d1f6b6eff665', g.Invariant('/payload_replay_checkpointed/continuity_id', 'minLength at owner schema /properties/continuity_id/minLength'), 'schema_invalid', sc_67b5d1f6b6eff665),
    ])

    def check(value):
        table.require('sc_67b5d1f6b6eff665', value, context)
        return True
    return g.Case(table, check, context)
