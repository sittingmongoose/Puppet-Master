"""W3I schema guard table entailed_sc_a7b29afef3ff40db (generated).
sc_a7b29afef3ff40db: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/project_id/minLength
Entailed after sc_70c39d969d2d2b85: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_a7b29afef3ff40db(value, context):
    if value['sc_70c39d969d2d2b85'] != []:
        return None
    if value['sc_a7b29afef3ff40db'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_a7b29afef3ff40db', g.Invariant('/payload_replay_checkpointed/project_id', 'minLength at owner schema /properties/project_id/minLength'), 'schema_invalid', sc_a7b29afef3ff40db),
    ])

    def check(value):
        table.require('sc_a7b29afef3ff40db', value, context)
        return True
    return g.Case(table, check, context)
