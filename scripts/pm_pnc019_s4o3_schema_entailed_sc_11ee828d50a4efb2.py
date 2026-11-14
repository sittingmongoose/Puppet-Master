"""W3I schema guard table entailed_sc_11ee828d50a4efb2 (generated).
sc_11ee828d50a4efb2: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/project_id/minLength
Entailed after sc_91125ec578b8f2a9: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_11ee828d50a4efb2(value, context):
    if value['sc_91125ec578b8f2a9'] != []:
        return None
    if value['sc_11ee828d50a4efb2'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_11ee828d50a4efb2', g.Invariant('/payload_redaction_applied/project_id', 'minLength at owner schema /properties/project_id/minLength'), 'schema_invalid', sc_11ee828d50a4efb2),
    ])

    def check(value):
        table.require('sc_11ee828d50a4efb2', value, context)
        return True
    return g.Case(table, check, context)
