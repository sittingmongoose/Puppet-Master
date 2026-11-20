"""W3I schema guard table entailed_sc_377c45f5df963f35 (generated).
sc_377c45f5df963f35: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/continuity_id/minLength
Entailed after sc_cf7e24df22e7877e: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_377c45f5df963f35(value, context):
    if value['sc_cf7e24df22e7877e'] != []:
        return None
    if value['sc_377c45f5df963f35'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_377c45f5df963f35', g.Invariant('/payload_provenance_recorded/continuity_id', 'minLength at owner schema /properties/continuity_id/minLength'), 'schema_invalid', sc_377c45f5df963f35),
    ])

    def check(value):
        table.require('sc_377c45f5df963f35', value, context)
        return True
    return g.Case(table, check, context)
