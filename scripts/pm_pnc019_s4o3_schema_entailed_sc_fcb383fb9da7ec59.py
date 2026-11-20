"""W3I schema guard table entailed_sc_fcb383fb9da7ec59 (generated).
sc_fcb383fb9da7ec59: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/provenance_ref/minLength
Entailed after sc_469072c829ffbe79: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_fcb383fb9da7ec59(value, context):
    if value['sc_469072c829ffbe79'] != []:
        return None
    if value['sc_fcb383fb9da7ec59'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_fcb383fb9da7ec59', g.Invariant('/payload_replay_checkpointed/provenance_ref', 'minLength at owner schema /properties/provenance_ref/minLength'), 'schema_invalid', sc_fcb383fb9da7ec59),
    ])

    def check(value):
        table.require('sc_fcb383fb9da7ec59', value, context)
        return True
    return g.Case(table, check, context)
