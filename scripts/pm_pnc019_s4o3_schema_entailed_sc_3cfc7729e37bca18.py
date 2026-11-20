"""W3I schema guard table entailed_sc_3cfc7729e37bca18 (generated).
sc_3cfc7729e37bca18: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/replay_checkpoint_ref/minLength
Entailed after sc_937ada5c61ebce2a: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_3cfc7729e37bca18(value, context):
    if value['sc_937ada5c61ebce2a'] != []:
        return None
    if value['sc_3cfc7729e37bca18'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_3cfc7729e37bca18', g.Invariant('/payload_provenance_recorded/replay_checkpoint_ref', 'minLength at owner schema /properties/replay_checkpoint_ref/minLength'), 'schema_invalid', sc_3cfc7729e37bca18),
    ])

    def check(value):
        table.require('sc_3cfc7729e37bca18', value, context)
        return True
    return g.Case(table, check, context)
