"""W3I schema guard table entailed_sc_609b71aedced104c (generated).
sc_609b71aedced104c: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/source_event_id/minLength
Entailed after sc_ec5f7ab92b6d5be8: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_609b71aedced104c(value, context):
    if value['sc_ec5f7ab92b6d5be8'] != []:
        return None
    if value['sc_609b71aedced104c'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_609b71aedced104c', g.Invariant('/payload_replay_checkpointed/source_event_id', 'minLength at owner schema /properties/source_event_id/minLength'), 'schema_invalid', sc_609b71aedced104c),
    ])

    def check(value):
        table.require('sc_609b71aedced104c', value, context)
        return True
    return g.Case(table, check, context)
