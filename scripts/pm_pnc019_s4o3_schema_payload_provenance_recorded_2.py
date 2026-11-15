"""W3I schema guard table payload_provenance_recorded_2 (generated).
sc_4dfd92e65a72d6e3: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/project_id/pattern
sc_6d8759694c37f2bf: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/project_id/not
sc_92e5b73591995aa1: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/continuity_id/maxLength
sc_cf7e24df22e7877e: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/continuity_id/pattern
sc_a6b0d3d75382f102: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/continuity_id/not
sc_d73222b732119062: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/stream_id/maxLength
sc_d58f8d9bea0bdb16: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/stream_id/pattern
sc_d471649330526b06: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/stream_id/not
"""
import pm_guard_isolation as g


def sc_4dfd92e65a72d6e3(value, context):
    if value['sc_4dfd92e65a72d6e3'] != []:
        return 'schema_invalid'
    return None


def sc_6d8759694c37f2bf(value, context):
    if value['sc_6d8759694c37f2bf'] != []:
        return 'schema_invalid'
    return None


def sc_92e5b73591995aa1(value, context):
    if value['sc_92e5b73591995aa1'] != []:
        return 'schema_invalid'
    return None


def sc_cf7e24df22e7877e(value, context):
    if value['sc_cf7e24df22e7877e'] != []:
        return 'schema_invalid'
    return None


def sc_a6b0d3d75382f102(value, context):
    if value['sc_a6b0d3d75382f102'] != []:
        return 'schema_invalid'
    return None


def sc_d73222b732119062(value, context):
    if value['sc_d73222b732119062'] != []:
        return 'schema_invalid'
    return None


def sc_d58f8d9bea0bdb16(value, context):
    if value['sc_d58f8d9bea0bdb16'] != []:
        return 'schema_invalid'
    return None


def sc_d471649330526b06(value, context):
    if value['sc_d471649330526b06'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_4dfd92e65a72d6e3', g.Invariant('/payload_provenance_recorded/project_id', 'pattern at owner schema /properties/project_id/pattern'), 'schema_invalid', sc_4dfd92e65a72d6e3),
        g.Guard('sc_6d8759694c37f2bf', g.Invariant('/payload_provenance_recorded/project_id', 'not at owner schema /properties/project_id/not'), 'schema_invalid', sc_6d8759694c37f2bf),
        g.Guard('sc_92e5b73591995aa1', g.Invariant('/payload_provenance_recorded/continuity_id', 'maxLength at owner schema /properties/continuity_id/maxLength'), 'schema_invalid', sc_92e5b73591995aa1),
        g.Guard('sc_cf7e24df22e7877e', g.Invariant('/payload_provenance_recorded/continuity_id', 'pattern at owner schema /properties/continuity_id/pattern'), 'schema_invalid', sc_cf7e24df22e7877e),
        g.Guard('sc_a6b0d3d75382f102', g.Invariant('/payload_provenance_recorded/continuity_id', 'not at owner schema /properties/continuity_id/not'), 'schema_invalid', sc_a6b0d3d75382f102),
        g.Guard('sc_d73222b732119062', g.Invariant('/payload_provenance_recorded/stream_id', 'maxLength at owner schema /properties/stream_id/maxLength'), 'schema_invalid', sc_d73222b732119062),
        g.Guard('sc_d58f8d9bea0bdb16', g.Invariant('/payload_provenance_recorded/stream_id', 'pattern at owner schema /properties/stream_id/pattern'), 'schema_invalid', sc_d58f8d9bea0bdb16),
        g.Guard('sc_d471649330526b06', g.Invariant('/payload_provenance_recorded/stream_id', 'not at owner schema /properties/stream_id/not'), 'schema_invalid', sc_d471649330526b06),
    ])

    def check(value):
        table.require('sc_4dfd92e65a72d6e3', value, context)
        table.require('sc_6d8759694c37f2bf', value, context)
        table.require('sc_92e5b73591995aa1', value, context)
        table.require('sc_cf7e24df22e7877e', value, context)
        table.require('sc_a6b0d3d75382f102', value, context)
        table.require('sc_d73222b732119062', value, context)
        table.require('sc_d58f8d9bea0bdb16', value, context)
        table.require('sc_d471649330526b06', value, context)
        return True
    return g.Case(table, check, context)
