"""W3I schema guard table payload_replay_checkpointed_3 (generated).
sc_14214e442657548a: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/stream_id/not
sc_ab272cce8c63ec04: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/fact_ref/maxLength
sc_87ab89726a861dfa: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/fact_ref/pattern
sc_8f744c494cfb7247: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/fact_ref/not
sc_1813b2ed5405d05c: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/actor_ref/maxLength
sc_302802b888659fd2: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/actor_ref/pattern
sc_7f5f47da4f9c7361: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/actor_ref/not
sc_a89f393840830c0b: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/actor_kind/maxLength
"""
import pm_guard_isolation as g


def sc_14214e442657548a(value, context):
    if value['sc_14214e442657548a'] != []:
        return 'schema_invalid'
    return None


def sc_ab272cce8c63ec04(value, context):
    if value['sc_ab272cce8c63ec04'] != []:
        return 'schema_invalid'
    return None


def sc_87ab89726a861dfa(value, context):
    if value['sc_87ab89726a861dfa'] != []:
        return 'schema_invalid'
    return None


def sc_8f744c494cfb7247(value, context):
    if value['sc_8f744c494cfb7247'] != []:
        return 'schema_invalid'
    return None


def sc_1813b2ed5405d05c(value, context):
    if value['sc_1813b2ed5405d05c'] != []:
        return 'schema_invalid'
    return None


def sc_302802b888659fd2(value, context):
    if value['sc_302802b888659fd2'] != []:
        return 'schema_invalid'
    return None


def sc_7f5f47da4f9c7361(value, context):
    if value['sc_7f5f47da4f9c7361'] != []:
        return 'schema_invalid'
    return None


def sc_a89f393840830c0b(value, context):
    if value['sc_a89f393840830c0b'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_14214e442657548a', g.Invariant('/payload_replay_checkpointed/stream_id', 'not at owner schema /properties/stream_id/not'), 'schema_invalid', sc_14214e442657548a),
        g.Guard('sc_ab272cce8c63ec04', g.Invariant('/payload_replay_checkpointed/fact_ref', 'maxLength at owner schema /properties/fact_ref/maxLength'), 'schema_invalid', sc_ab272cce8c63ec04),
        g.Guard('sc_87ab89726a861dfa', g.Invariant('/payload_replay_checkpointed/fact_ref', 'pattern at owner schema /properties/fact_ref/pattern'), 'schema_invalid', sc_87ab89726a861dfa),
        g.Guard('sc_8f744c494cfb7247', g.Invariant('/payload_replay_checkpointed/fact_ref', 'not at owner schema /properties/fact_ref/not'), 'schema_invalid', sc_8f744c494cfb7247),
        g.Guard('sc_1813b2ed5405d05c', g.Invariant('/payload_replay_checkpointed/actor_ref', 'maxLength at owner schema /properties/actor_ref/maxLength'), 'schema_invalid', sc_1813b2ed5405d05c),
        g.Guard('sc_302802b888659fd2', g.Invariant('/payload_replay_checkpointed/actor_ref', 'pattern at owner schema /properties/actor_ref/pattern'), 'schema_invalid', sc_302802b888659fd2),
        g.Guard('sc_7f5f47da4f9c7361', g.Invariant('/payload_replay_checkpointed/actor_ref', 'not at owner schema /properties/actor_ref/not'), 'schema_invalid', sc_7f5f47da4f9c7361),
        g.Guard('sc_a89f393840830c0b', g.Invariant('/payload_replay_checkpointed/actor_kind', 'maxLength at owner schema /properties/actor_kind/maxLength'), 'schema_invalid', sc_a89f393840830c0b),
    ])

    def check(value):
        table.require('sc_14214e442657548a', value, context)
        table.require('sc_ab272cce8c63ec04', value, context)
        table.require('sc_87ab89726a861dfa', value, context)
        table.require('sc_8f744c494cfb7247', value, context)
        table.require('sc_1813b2ed5405d05c', value, context)
        table.require('sc_302802b888659fd2', value, context)
        table.require('sc_7f5f47da4f9c7361', value, context)
        table.require('sc_a89f393840830c0b', value, context)
        return True
    return g.Case(table, check, context)
