"""W3I schema guard table entailed_sc_cd8565693e1c9bf5 (generated).
sc_cd8565693e1c9bf5: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/actor_ref/minLength
Entailed after sc_1286ef4b375ea092: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_cd8565693e1c9bf5(value, context):
    if value['sc_1286ef4b375ea092'] != []:
        return None
    if value['sc_cd8565693e1c9bf5'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_cd8565693e1c9bf5', g.Invariant('/payload_provenance_recorded/actor_ref', 'minLength at owner schema /properties/actor_ref/minLength'), 'schema_invalid', sc_cd8565693e1c9bf5),
    ])

    def check(value):
        table.require('sc_cd8565693e1c9bf5', value, context)
        return True
    return g.Case(table, check, context)
