"""W3I schema guard table entailed_sc_e5e3027c9fd4a84c (generated).
sc_e5e3027c9fd4a84c: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/fact_ref/minLength
Entailed after sc_b9f3dcd78238db2f: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_e5e3027c9fd4a84c(value, context):
    if value['sc_b9f3dcd78238db2f'] != []:
        return None
    if value['sc_e5e3027c9fd4a84c'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_e5e3027c9fd4a84c', g.Invariant('/payload_actor_identified/fact_ref', 'minLength at owner schema /properties/fact_ref/minLength'), 'schema_invalid', sc_e5e3027c9fd4a84c),
    ])

    def check(value):
        table.require('sc_e5e3027c9fd4a84c', value, context)
        return True
    return g.Case(table, check, context)
