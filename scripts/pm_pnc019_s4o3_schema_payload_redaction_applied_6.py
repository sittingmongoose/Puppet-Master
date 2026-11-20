"""W3I schema guard table payload_redaction_applied_6 (generated).
sc_8dac4df38b394172: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/created_at_utc/type
sc_4378955f44232346: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/created_at_utc/format
sc_1b6b26f7b93fe1ff: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/schema_id/const
sc_0de984b52e1ecf41: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/schema_version/const
"""
import pm_guard_isolation as g


def sc_8dac4df38b394172(value, context):
    if value['sc_8dac4df38b394172'] != []:
        return 'schema_invalid'
    return None


def sc_4378955f44232346(value, context):
    if value['sc_4378955f44232346'] != []:
        return 'schema_invalid'
    return None


def sc_1b6b26f7b93fe1ff(value, context):
    if value['sc_1b6b26f7b93fe1ff'] != []:
        return 'schema_invalid'
    return None


def sc_0de984b52e1ecf41(value, context):
    if value['sc_0de984b52e1ecf41'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_8dac4df38b394172', g.Invariant('/payload_redaction_applied/created_at_utc', 'type at owner schema /properties/created_at_utc/type'), 'schema_invalid', sc_8dac4df38b394172),
        g.Guard('sc_4378955f44232346', g.Invariant('/payload_redaction_applied/created_at_utc', 'format at owner schema /properties/created_at_utc/format'), 'schema_invalid', sc_4378955f44232346),
        g.Guard('sc_1b6b26f7b93fe1ff', g.Invariant('/payload_redaction_applied/schema_id', 'const at owner schema /properties/schema_id/const'), 'schema_invalid', sc_1b6b26f7b93fe1ff),
        g.Guard('sc_0de984b52e1ecf41', g.Invariant('/payload_redaction_applied/schema_version', 'const at owner schema /properties/schema_version/const'), 'schema_invalid', sc_0de984b52e1ecf41),
    ])

    def check(value):
        table.require('sc_8dac4df38b394172', value, context)
        table.require('sc_4378955f44232346', value, context)
        table.require('sc_1b6b26f7b93fe1ff', value, context)
        table.require('sc_0de984b52e1ecf41', value, context)
        return True
    return g.Case(table, check, context)
