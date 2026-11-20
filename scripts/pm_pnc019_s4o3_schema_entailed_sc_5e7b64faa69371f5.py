"""W3I schema guard table entailed_sc_5e7b64faa69371f5 (generated).
sc_5e7b64faa69371f5: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/provenance_ref/minLength
Entailed after sc_996fce70b53d2b86: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_5e7b64faa69371f5(value, context):
    if value['sc_996fce70b53d2b86'] != []:
        return None
    if value['sc_5e7b64faa69371f5'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_5e7b64faa69371f5', g.Invariant('/payload_actor_identified/provenance_ref', 'minLength at owner schema /properties/provenance_ref/minLength'), 'schema_invalid', sc_5e7b64faa69371f5),
    ])

    def check(value):
        table.require('sc_5e7b64faa69371f5', value, context)
        return True
    return g.Case(table, check, context)
