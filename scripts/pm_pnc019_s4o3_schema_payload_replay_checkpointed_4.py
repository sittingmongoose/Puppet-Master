"""W3I schema guard table payload_replay_checkpointed_4 (generated).
sc_610ab158edf86f8a: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/actor_kind/pattern
sc_e1fdd5fbe61c41e9: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/actor_kind/not
sc_367508afbbb42b45: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/source_event_id/maxLength
sc_ec5f7ab92b6d5be8: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/source_event_id/pattern
sc_7022b85105e7b679: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/source_event_id/not
sc_658ac6db49e0ff94: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/provenance_ref/maxLength
sc_469072c829ffbe79: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/provenance_ref/pattern
sc_7896d33925b101bc: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/provenance_ref/not
"""
import pm_guard_isolation as g


def sc_610ab158edf86f8a(value, context):
    if value['sc_610ab158edf86f8a'] != []:
        return 'schema_invalid'
    return None


def sc_e1fdd5fbe61c41e9(value, context):
    if value['sc_e1fdd5fbe61c41e9'] != []:
        return 'schema_invalid'
    return None


def sc_367508afbbb42b45(value, context):
    if value['sc_367508afbbb42b45'] != []:
        return 'schema_invalid'
    return None


def sc_ec5f7ab92b6d5be8(value, context):
    if value['sc_ec5f7ab92b6d5be8'] != []:
        return 'schema_invalid'
    return None


def sc_7022b85105e7b679(value, context):
    if value['sc_7022b85105e7b679'] != []:
        return 'schema_invalid'
    return None


def sc_658ac6db49e0ff94(value, context):
    if value['sc_658ac6db49e0ff94'] != []:
        return 'schema_invalid'
    return None


def sc_469072c829ffbe79(value, context):
    if value['sc_469072c829ffbe79'] != []:
        return 'schema_invalid'
    return None


def sc_7896d33925b101bc(value, context):
    if value['sc_7896d33925b101bc'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_610ab158edf86f8a', g.Invariant('/payload_replay_checkpointed/actor_kind', 'pattern at owner schema /properties/actor_kind/pattern'), 'schema_invalid', sc_610ab158edf86f8a),
        g.Guard('sc_e1fdd5fbe61c41e9', g.Invariant('/payload_replay_checkpointed/actor_kind', 'not at owner schema /properties/actor_kind/not'), 'schema_invalid', sc_e1fdd5fbe61c41e9),
        g.Guard('sc_367508afbbb42b45', g.Invariant('/payload_replay_checkpointed/source_event_id', 'maxLength at owner schema /properties/source_event_id/maxLength'), 'schema_invalid', sc_367508afbbb42b45),
        g.Guard('sc_ec5f7ab92b6d5be8', g.Invariant('/payload_replay_checkpointed/source_event_id', 'pattern at owner schema /properties/source_event_id/pattern'), 'schema_invalid', sc_ec5f7ab92b6d5be8),
        g.Guard('sc_7022b85105e7b679', g.Invariant('/payload_replay_checkpointed/source_event_id', 'not at owner schema /properties/source_event_id/not'), 'schema_invalid', sc_7022b85105e7b679),
        g.Guard('sc_658ac6db49e0ff94', g.Invariant('/payload_replay_checkpointed/provenance_ref', 'maxLength at owner schema /properties/provenance_ref/maxLength'), 'schema_invalid', sc_658ac6db49e0ff94),
        g.Guard('sc_469072c829ffbe79', g.Invariant('/payload_replay_checkpointed/provenance_ref', 'pattern at owner schema /properties/provenance_ref/pattern'), 'schema_invalid', sc_469072c829ffbe79),
        g.Guard('sc_7896d33925b101bc', g.Invariant('/payload_replay_checkpointed/provenance_ref', 'not at owner schema /properties/provenance_ref/not'), 'schema_invalid', sc_7896d33925b101bc),
    ])

    def check(value):
        table.require('sc_610ab158edf86f8a', value, context)
        table.require('sc_e1fdd5fbe61c41e9', value, context)
        table.require('sc_367508afbbb42b45', value, context)
        table.require('sc_ec5f7ab92b6d5be8', value, context)
        table.require('sc_7022b85105e7b679', value, context)
        table.require('sc_658ac6db49e0ff94', value, context)
        table.require('sc_469072c829ffbe79', value, context)
        table.require('sc_7896d33925b101bc', value, context)
        return True
    return g.Case(table, check, context)
