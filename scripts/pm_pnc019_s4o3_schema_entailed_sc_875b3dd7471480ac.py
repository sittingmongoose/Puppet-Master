"""W3I schema guard table entailed_sc_875b3dd7471480ac (generated).
sc_875b3dd7471480ac: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/provenance_ref/minLength
Entailed after sc_63e4cf7a48dedd52: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_875b3dd7471480ac(value, context):
    if value['sc_63e4cf7a48dedd52'] != []:
        return None
    if value['sc_875b3dd7471480ac'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_875b3dd7471480ac', g.Invariant('/payload_provenance_recorded/provenance_ref', 'minLength at owner schema /properties/provenance_ref/minLength'), 'schema_invalid', sc_875b3dd7471480ac),
    ])

    def check(value):
        table.require('sc_875b3dd7471480ac', value, context)
        return True
    return g.Case(table, check, context)
