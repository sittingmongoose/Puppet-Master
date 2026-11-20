"""W3I schema guard table entailed_sc_509bc443d99af175 (generated).
sc_509bc443d99af175: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/replay_checkpoint_ref/minLength
Entailed after sc_4b96ecc62c11d705: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_509bc443d99af175(value, context):
    if value['sc_4b96ecc62c11d705'] != []:
        return None
    if value['sc_509bc443d99af175'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_509bc443d99af175', g.Invariant('/payload_replay_checkpointed/replay_checkpoint_ref', 'minLength at owner schema /properties/replay_checkpoint_ref/minLength'), 'schema_invalid', sc_509bc443d99af175),
    ])

    def check(value):
        table.require('sc_509bc443d99af175', value, context)
        return True
    return g.Case(table, check, context)
