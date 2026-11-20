"""W3I schema guard table payload_provenance_recorded_6 (generated).
sc_884163a5cae87e6b: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/created_at_utc/type
sc_1e4b290ea6742b36: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/created_at_utc/format
sc_23ce453b8641aebe: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/schema_id/const
sc_f8f6fa0aa44b1d3e: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/schema_version/const
"""
import pm_guard_isolation as g


def sc_884163a5cae87e6b(value, context):
    if value['sc_884163a5cae87e6b'] != []:
        return 'schema_invalid'
    return None


def sc_1e4b290ea6742b36(value, context):
    if value['sc_1e4b290ea6742b36'] != []:
        return 'schema_invalid'
    return None


def sc_23ce453b8641aebe(value, context):
    if value['sc_23ce453b8641aebe'] != []:
        return 'schema_invalid'
    return None


def sc_f8f6fa0aa44b1d3e(value, context):
    if value['sc_f8f6fa0aa44b1d3e'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_884163a5cae87e6b', g.Invariant('/payload_provenance_recorded/created_at_utc', 'type at owner schema /properties/created_at_utc/type'), 'schema_invalid', sc_884163a5cae87e6b),
        g.Guard('sc_1e4b290ea6742b36', g.Invariant('/payload_provenance_recorded/created_at_utc', 'format at owner schema /properties/created_at_utc/format'), 'schema_invalid', sc_1e4b290ea6742b36),
        g.Guard('sc_23ce453b8641aebe', g.Invariant('/payload_provenance_recorded/schema_id', 'const at owner schema /properties/schema_id/const'), 'schema_invalid', sc_23ce453b8641aebe),
        g.Guard('sc_f8f6fa0aa44b1d3e', g.Invariant('/payload_provenance_recorded/schema_version', 'const at owner schema /properties/schema_version/const'), 'schema_invalid', sc_f8f6fa0aa44b1d3e),
    ])

    def check(value):
        table.require('sc_884163a5cae87e6b', value, context)
        table.require('sc_1e4b290ea6742b36', value, context)
        table.require('sc_23ce453b8641aebe', value, context)
        table.require('sc_f8f6fa0aa44b1d3e', value, context)
        return True
    return g.Case(table, check, context)
