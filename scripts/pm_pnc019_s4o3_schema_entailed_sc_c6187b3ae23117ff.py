"""W3I schema guard table entailed_sc_c6187b3ae23117ff (generated).
sc_c6187b3ae23117ff: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/project_id/minLength
Entailed after sc_4dfd92e65a72d6e3: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_c6187b3ae23117ff(value, context):
    if value['sc_4dfd92e65a72d6e3'] != []:
        return None
    if value['sc_c6187b3ae23117ff'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_c6187b3ae23117ff', g.Invariant('/payload_provenance_recorded/project_id', 'minLength at owner schema /properties/project_id/minLength'), 'schema_invalid', sc_c6187b3ae23117ff),
    ])

    def check(value):
        table.require('sc_c6187b3ae23117ff', value, context)
        return True
    return g.Case(table, check, context)
