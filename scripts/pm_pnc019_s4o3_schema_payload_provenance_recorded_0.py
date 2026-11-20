"""W3I schema guard table payload_provenance_recorded_0 (generated).
sc_3b9d6b01378b389f: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/type
sc_83cc7634b8d3a239: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/required/project_id
sc_af7e3b7e91363be6: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/required/continuity_id
sc_d671db2087b590c5: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/required/stream_id
sc_37e43dd3ab6bb590: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/required/fact_ref
sc_09aa7e0dab49a0a3: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/required/actor_ref
sc_dfaa1f20e8f98662: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/required/actor_kind
sc_6c405cc46cda7e76: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/required/source_event_id
"""
import pm_guard_isolation as g


def sc_3b9d6b01378b389f(value, context):
    if value['sc_3b9d6b01378b389f'] != []:
        return 'schema_invalid'
    return None


def sc_83cc7634b8d3a239(value, context):
    if value['sc_83cc7634b8d3a239'] != []:
        return 'schema_invalid'
    return None


def sc_af7e3b7e91363be6(value, context):
    if value['sc_af7e3b7e91363be6'] != []:
        return 'schema_invalid'
    return None


def sc_d671db2087b590c5(value, context):
    if value['sc_d671db2087b590c5'] != []:
        return 'schema_invalid'
    return None


def sc_37e43dd3ab6bb590(value, context):
    if value['sc_37e43dd3ab6bb590'] != []:
        return 'schema_invalid'
    return None


def sc_09aa7e0dab49a0a3(value, context):
    if value['sc_09aa7e0dab49a0a3'] != []:
        return 'schema_invalid'
    return None


def sc_dfaa1f20e8f98662(value, context):
    if value['sc_dfaa1f20e8f98662'] != []:
        return 'schema_invalid'
    return None


def sc_6c405cc46cda7e76(value, context):
    if value['sc_6c405cc46cda7e76'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_3b9d6b01378b389f', g.Invariant('/payload_provenance_recorded/', 'type at owner schema /type'), 'schema_invalid', sc_3b9d6b01378b389f),
        g.Guard('sc_83cc7634b8d3a239', g.Invariant('/payload_provenance_recorded/', 'required at owner schema /required/project_id'), 'schema_invalid', sc_83cc7634b8d3a239),
        g.Guard('sc_af7e3b7e91363be6', g.Invariant('/payload_provenance_recorded/', 'required at owner schema /required/continuity_id'), 'schema_invalid', sc_af7e3b7e91363be6),
        g.Guard('sc_d671db2087b590c5', g.Invariant('/payload_provenance_recorded/', 'required at owner schema /required/stream_id'), 'schema_invalid', sc_d671db2087b590c5),
        g.Guard('sc_37e43dd3ab6bb590', g.Invariant('/payload_provenance_recorded/', 'required at owner schema /required/fact_ref'), 'schema_invalid', sc_37e43dd3ab6bb590),
        g.Guard('sc_09aa7e0dab49a0a3', g.Invariant('/payload_provenance_recorded/', 'required at owner schema /required/actor_ref'), 'schema_invalid', sc_09aa7e0dab49a0a3),
        g.Guard('sc_dfaa1f20e8f98662', g.Invariant('/payload_provenance_recorded/', 'required at owner schema /required/actor_kind'), 'schema_invalid', sc_dfaa1f20e8f98662),
        g.Guard('sc_6c405cc46cda7e76', g.Invariant('/payload_provenance_recorded/', 'required at owner schema /required/source_event_id'), 'schema_invalid', sc_6c405cc46cda7e76),
    ])

    def check(value):
        table.require('sc_3b9d6b01378b389f', value, context)
        table.require('sc_83cc7634b8d3a239', value, context)
        table.require('sc_af7e3b7e91363be6', value, context)
        table.require('sc_d671db2087b590c5', value, context)
        table.require('sc_37e43dd3ab6bb590', value, context)
        table.require('sc_09aa7e0dab49a0a3', value, context)
        table.require('sc_dfaa1f20e8f98662', value, context)
        table.require('sc_6c405cc46cda7e76', value, context)
        return True
    return g.Case(table, check, context)
