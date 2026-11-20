"""W3I schema guard table payload_redaction_applied_1 (generated).
sc_1cb93a9c46264a0d: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/required/provenance_ref
sc_111dc18ea7a4067d: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/required/redaction_profile_id
sc_1fd87ec397a7738a: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/required/redaction_decision
sc_376acacafe4c5b85: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/required/created_at_utc
sc_7f72509ba1f45890: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/required/schema_id
sc_a9f6b624f611dd64: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/required/schema_version
sc_1eab7632861e98cd: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/additionalProperties
sc_3dfb4e6a30ff28bf: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/project_id/maxLength
"""
import pm_guard_isolation as g


def sc_1cb93a9c46264a0d(value, context):
    if value['sc_1cb93a9c46264a0d'] != []:
        return 'schema_invalid'
    return None


def sc_111dc18ea7a4067d(value, context):
    if value['sc_111dc18ea7a4067d'] != []:
        return 'schema_invalid'
    return None


def sc_1fd87ec397a7738a(value, context):
    if value['sc_1fd87ec397a7738a'] != []:
        return 'schema_invalid'
    return None


def sc_376acacafe4c5b85(value, context):
    if value['sc_376acacafe4c5b85'] != []:
        return 'schema_invalid'
    return None


def sc_7f72509ba1f45890(value, context):
    if value['sc_7f72509ba1f45890'] != []:
        return 'schema_invalid'
    return None


def sc_a9f6b624f611dd64(value, context):
    if value['sc_a9f6b624f611dd64'] != []:
        return 'schema_invalid'
    return None


def sc_1eab7632861e98cd(value, context):
    if value['sc_1eab7632861e98cd'] != []:
        return 'schema_invalid'
    return None


def sc_3dfb4e6a30ff28bf(value, context):
    if value['sc_3dfb4e6a30ff28bf'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_1cb93a9c46264a0d', g.Invariant('/payload_redaction_applied/', 'required at owner schema /required/provenance_ref'), 'schema_invalid', sc_1cb93a9c46264a0d),
        g.Guard('sc_111dc18ea7a4067d', g.Invariant('/payload_redaction_applied/', 'required at owner schema /required/redaction_profile_id'), 'schema_invalid', sc_111dc18ea7a4067d),
        g.Guard('sc_1fd87ec397a7738a', g.Invariant('/payload_redaction_applied/', 'required at owner schema /required/redaction_decision'), 'schema_invalid', sc_1fd87ec397a7738a),
        g.Guard('sc_376acacafe4c5b85', g.Invariant('/payload_redaction_applied/', 'required at owner schema /required/created_at_utc'), 'schema_invalid', sc_376acacafe4c5b85),
        g.Guard('sc_7f72509ba1f45890', g.Invariant('/payload_redaction_applied/', 'required at owner schema /required/schema_id'), 'schema_invalid', sc_7f72509ba1f45890),
        g.Guard('sc_a9f6b624f611dd64', g.Invariant('/payload_redaction_applied/', 'required at owner schema /required/schema_version'), 'schema_invalid', sc_a9f6b624f611dd64),
        g.Guard('sc_1eab7632861e98cd', g.Invariant('/payload_redaction_applied/', 'additionalProperties at owner schema /additionalProperties'), 'schema_invalid', sc_1eab7632861e98cd),
        g.Guard('sc_3dfb4e6a30ff28bf', g.Invariant('/payload_redaction_applied/project_id', 'maxLength at owner schema /properties/project_id/maxLength'), 'schema_invalid', sc_3dfb4e6a30ff28bf),
    ])

    def check(value):
        table.require('sc_1cb93a9c46264a0d', value, context)
        table.require('sc_111dc18ea7a4067d', value, context)
        table.require('sc_1fd87ec397a7738a', value, context)
        table.require('sc_376acacafe4c5b85', value, context)
        table.require('sc_7f72509ba1f45890', value, context)
        table.require('sc_a9f6b624f611dd64', value, context)
        table.require('sc_1eab7632861e98cd', value, context)
        table.require('sc_3dfb4e6a30ff28bf', value, context)
        return True
    return g.Case(table, check, context)
