"""W3I schema guard table entailed_sc_82cf64b7d851f48b (generated).
sc_82cf64b7d851f48b: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/stream_id/minLength
Entailed after sc_d32fb92ffa07def1: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_82cf64b7d851f48b(value, context):
    if value['sc_d32fb92ffa07def1'] != []:
        return None
    if value['sc_82cf64b7d851f48b'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_82cf64b7d851f48b', g.Invariant('/payload_replay_checkpointed/stream_id', 'minLength at owner schema /properties/stream_id/minLength'), 'schema_invalid', sc_82cf64b7d851f48b),
    ])

    def check(value):
        table.require('sc_82cf64b7d851f48b', value, context)
        return True
    return g.Case(table, check, context)
