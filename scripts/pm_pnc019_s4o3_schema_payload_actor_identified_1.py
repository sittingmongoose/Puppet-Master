"""W3I schema guard table payload_actor_identified_1 (generated).
sc_a79df510d67522f6: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/required/provenance_ref
sc_0f6766be967a8f2d: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/required/redaction_profile_id
sc_7edf6102dcb3e452: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/required/redaction_decision
sc_4f6e8b2eba55a81c: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/required/created_at_utc
sc_b56744ee5e019787: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/required/schema_id
sc_aa44da57faced017: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/required/schema_version
sc_c99db1bb94de81c4: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/additionalProperties
sc_7d93f047bd185171: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/project_id/maxLength
"""
import pm_guard_isolation as g


def sc_a79df510d67522f6(value, context):
    if value['sc_a79df510d67522f6'] != []:
        return 'schema_invalid'
    return None


def sc_0f6766be967a8f2d(value, context):
    if value['sc_0f6766be967a8f2d'] != []:
        return 'schema_invalid'
    return None


def sc_7edf6102dcb3e452(value, context):
    if value['sc_7edf6102dcb3e452'] != []:
        return 'schema_invalid'
    return None


def sc_4f6e8b2eba55a81c(value, context):
    if value['sc_4f6e8b2eba55a81c'] != []:
        return 'schema_invalid'
    return None


def sc_b56744ee5e019787(value, context):
    if value['sc_b56744ee5e019787'] != []:
        return 'schema_invalid'
    return None


def sc_aa44da57faced017(value, context):
    if value['sc_aa44da57faced017'] != []:
        return 'schema_invalid'
    return None


def sc_c99db1bb94de81c4(value, context):
    if value['sc_c99db1bb94de81c4'] != []:
        return 'schema_invalid'
    return None


def sc_7d93f047bd185171(value, context):
    if value['sc_7d93f047bd185171'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_a79df510d67522f6', g.Invariant('/payload_actor_identified/', 'required at owner schema /required/provenance_ref'), 'schema_invalid', sc_a79df510d67522f6),
        g.Guard('sc_0f6766be967a8f2d', g.Invariant('/payload_actor_identified/', 'required at owner schema /required/redaction_profile_id'), 'schema_invalid', sc_0f6766be967a8f2d),
        g.Guard('sc_7edf6102dcb3e452', g.Invariant('/payload_actor_identified/', 'required at owner schema /required/redaction_decision'), 'schema_invalid', sc_7edf6102dcb3e452),
        g.Guard('sc_4f6e8b2eba55a81c', g.Invariant('/payload_actor_identified/', 'required at owner schema /required/created_at_utc'), 'schema_invalid', sc_4f6e8b2eba55a81c),
        g.Guard('sc_b56744ee5e019787', g.Invariant('/payload_actor_identified/', 'required at owner schema /required/schema_id'), 'schema_invalid', sc_b56744ee5e019787),
        g.Guard('sc_aa44da57faced017', g.Invariant('/payload_actor_identified/', 'required at owner schema /required/schema_version'), 'schema_invalid', sc_aa44da57faced017),
        g.Guard('sc_c99db1bb94de81c4', g.Invariant('/payload_actor_identified/', 'additionalProperties at owner schema /additionalProperties'), 'schema_invalid', sc_c99db1bb94de81c4),
        g.Guard('sc_7d93f047bd185171', g.Invariant('/payload_actor_identified/project_id', 'maxLength at owner schema /properties/project_id/maxLength'), 'schema_invalid', sc_7d93f047bd185171),
    ])

    def check(value):
        table.require('sc_a79df510d67522f6', value, context)
        table.require('sc_0f6766be967a8f2d', value, context)
        table.require('sc_7edf6102dcb3e452', value, context)
        table.require('sc_4f6e8b2eba55a81c', value, context)
        table.require('sc_b56744ee5e019787', value, context)
        table.require('sc_aa44da57faced017', value, context)
        table.require('sc_c99db1bb94de81c4', value, context)
        table.require('sc_7d93f047bd185171', value, context)
        return True
    return g.Case(table, check, context)
