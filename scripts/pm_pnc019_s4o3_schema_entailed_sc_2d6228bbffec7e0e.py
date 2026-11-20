"""W3I schema guard table entailed_sc_2d6228bbffec7e0e (generated).
sc_2d6228bbffec7e0e: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/provenance_ref/type
Entailed after sc_859866ab8ceb2cc5: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_2d6228bbffec7e0e(value, context):
    if value['sc_859866ab8ceb2cc5'] != []:
        return None
    if value['sc_2d6228bbffec7e0e'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_2d6228bbffec7e0e', g.Invariant('/payload_provenance_recorded/provenance_ref', 'type at owner schema /properties/provenance_ref/type'), 'schema_invalid', sc_2d6228bbffec7e0e),
    ])

    def check(value):
        table.require('sc_2d6228bbffec7e0e', value, context)
        return True
    return g.Case(table, check, context)
