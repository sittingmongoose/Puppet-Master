"""W3I schema guard table projection_1 (generated).
sc_6e58f5aad55db3aa: Plans/continuity_event_contracts.schema.json#/$defs/projection/required/sequence_id
sc_84b878e7d244a5ce: Plans/continuity_event_contracts.schema.json#/$defs/projection/required/publication_id
sc_40ab0294103ff375: Plans/continuity_event_contracts.schema.json#/$defs/projection/required/body_event_id
sc_185514a5b67eb5a5: Plans/continuity_event_contracts.schema.json#/$defs/projection/additionalProperties
sc_f13bee8ba7b22e04: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/schema_id/const
sc_29abffd6278e58b0: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/schema_version/const
sc_4b0b2e453698afc8: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/project_id/maxLength
sc_17ccbcab9e965e30: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/project_id/pattern
"""
import pm_guard_isolation as g


def sc_6e58f5aad55db3aa(value, context):
    if value['sc_6e58f5aad55db3aa'] != []:
        return 'schema_invalid'
    return None


def sc_84b878e7d244a5ce(value, context):
    if value['sc_84b878e7d244a5ce'] != []:
        return 'schema_invalid'
    return None


def sc_40ab0294103ff375(value, context):
    if value['sc_40ab0294103ff375'] != []:
        return 'schema_invalid'
    return None


def sc_185514a5b67eb5a5(value, context):
    if value['sc_185514a5b67eb5a5'] != []:
        return 'schema_invalid'
    return None


def sc_f13bee8ba7b22e04(value, context):
    if value['sc_f13bee8ba7b22e04'] != []:
        return 'schema_invalid'
    return None


def sc_29abffd6278e58b0(value, context):
    if value['sc_29abffd6278e58b0'] != []:
        return 'schema_invalid'
    return None


def sc_4b0b2e453698afc8(value, context):
    if value['sc_4b0b2e453698afc8'] != []:
        return 'schema_invalid'
    return None


def sc_17ccbcab9e965e30(value, context):
    if value['sc_17ccbcab9e965e30'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_6e58f5aad55db3aa', g.Invariant('/projection/', 'required at owner schema /required/sequence_id'), 'schema_invalid', sc_6e58f5aad55db3aa),
        g.Guard('sc_84b878e7d244a5ce', g.Invariant('/projection/', 'required at owner schema /required/publication_id'), 'schema_invalid', sc_84b878e7d244a5ce),
        g.Guard('sc_40ab0294103ff375', g.Invariant('/projection/', 'required at owner schema /required/body_event_id'), 'schema_invalid', sc_40ab0294103ff375),
        g.Guard('sc_185514a5b67eb5a5', g.Invariant('/projection/', 'additionalProperties at owner schema /additionalProperties'), 'schema_invalid', sc_185514a5b67eb5a5),
        g.Guard('sc_f13bee8ba7b22e04', g.Invariant('/projection/schema_id', 'const at owner schema /properties/schema_id/const'), 'schema_invalid', sc_f13bee8ba7b22e04),
        g.Guard('sc_29abffd6278e58b0', g.Invariant('/projection/schema_version', 'const at owner schema /properties/schema_version/const'), 'schema_invalid', sc_29abffd6278e58b0),
        g.Guard('sc_4b0b2e453698afc8', g.Invariant('/projection/project_id', 'maxLength at owner schema /properties/project_id/maxLength'), 'schema_invalid', sc_4b0b2e453698afc8),
        g.Guard('sc_17ccbcab9e965e30', g.Invariant('/projection/project_id', 'pattern at owner schema /properties/project_id/pattern'), 'schema_invalid', sc_17ccbcab9e965e30),
    ])

    def check(value):
        table.require('sc_6e58f5aad55db3aa', value, context)
        table.require('sc_84b878e7d244a5ce', value, context)
        table.require('sc_40ab0294103ff375', value, context)
        table.require('sc_185514a5b67eb5a5', value, context)
        table.require('sc_f13bee8ba7b22e04', value, context)
        table.require('sc_29abffd6278e58b0', value, context)
        table.require('sc_4b0b2e453698afc8', value, context)
        table.require('sc_17ccbcab9e965e30', value, context)
        return True
    return g.Case(table, check, context)
