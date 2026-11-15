"""W3I schema guard table payload_provenance_recorded_1 (generated).
sc_a7ee7e8f607419b9: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/required/provenance_ref
sc_f0376f90b0e23bcb: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/required/redaction_profile_id
sc_50aecd839587d83c: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/required/redaction_decision
sc_97c523c7bef4b2e2: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/required/created_at_utc
sc_753274e7f351d924: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/required/schema_id
sc_f9580b7d9b3fd985: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/required/schema_version
sc_e5e0025b5775c215: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/additionalProperties
sc_66999232535e7090: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/project_id/maxLength
"""
import pm_guard_isolation as g


def sc_a7ee7e8f607419b9(value, context):
    if value['sc_a7ee7e8f607419b9'] != []:
        return 'schema_invalid'
    return None


def sc_f0376f90b0e23bcb(value, context):
    if value['sc_f0376f90b0e23bcb'] != []:
        return 'schema_invalid'
    return None


def sc_50aecd839587d83c(value, context):
    if value['sc_50aecd839587d83c'] != []:
        return 'schema_invalid'
    return None


def sc_97c523c7bef4b2e2(value, context):
    if value['sc_97c523c7bef4b2e2'] != []:
        return 'schema_invalid'
    return None


def sc_753274e7f351d924(value, context):
    if value['sc_753274e7f351d924'] != []:
        return 'schema_invalid'
    return None


def sc_f9580b7d9b3fd985(value, context):
    if value['sc_f9580b7d9b3fd985'] != []:
        return 'schema_invalid'
    return None


def sc_e5e0025b5775c215(value, context):
    if value['sc_e5e0025b5775c215'] != []:
        return 'schema_invalid'
    return None


def sc_66999232535e7090(value, context):
    if value['sc_66999232535e7090'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_a7ee7e8f607419b9', g.Invariant('/payload_provenance_recorded/', 'required at owner schema /required/provenance_ref'), 'schema_invalid', sc_a7ee7e8f607419b9),
        g.Guard('sc_f0376f90b0e23bcb', g.Invariant('/payload_provenance_recorded/', 'required at owner schema /required/redaction_profile_id'), 'schema_invalid', sc_f0376f90b0e23bcb),
        g.Guard('sc_50aecd839587d83c', g.Invariant('/payload_provenance_recorded/', 'required at owner schema /required/redaction_decision'), 'schema_invalid', sc_50aecd839587d83c),
        g.Guard('sc_97c523c7bef4b2e2', g.Invariant('/payload_provenance_recorded/', 'required at owner schema /required/created_at_utc'), 'schema_invalid', sc_97c523c7bef4b2e2),
        g.Guard('sc_753274e7f351d924', g.Invariant('/payload_provenance_recorded/', 'required at owner schema /required/schema_id'), 'schema_invalid', sc_753274e7f351d924),
        g.Guard('sc_f9580b7d9b3fd985', g.Invariant('/payload_provenance_recorded/', 'required at owner schema /required/schema_version'), 'schema_invalid', sc_f9580b7d9b3fd985),
        g.Guard('sc_e5e0025b5775c215', g.Invariant('/payload_provenance_recorded/', 'additionalProperties at owner schema /additionalProperties'), 'schema_invalid', sc_e5e0025b5775c215),
        g.Guard('sc_66999232535e7090', g.Invariant('/payload_provenance_recorded/project_id', 'maxLength at owner schema /properties/project_id/maxLength'), 'schema_invalid', sc_66999232535e7090),
    ])

    def check(value):
        table.require('sc_a7ee7e8f607419b9', value, context)
        table.require('sc_f0376f90b0e23bcb', value, context)
        table.require('sc_50aecd839587d83c', value, context)
        table.require('sc_97c523c7bef4b2e2', value, context)
        table.require('sc_753274e7f351d924', value, context)
        table.require('sc_f9580b7d9b3fd985', value, context)
        table.require('sc_e5e0025b5775c215', value, context)
        table.require('sc_66999232535e7090', value, context)
        return True
    return g.Case(table, check, context)
