"""W3I schema guard table entailed_sc_307cd9c326a8b615 (generated).
sc_307cd9c326a8b615: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/project_id/type
Entailed after sc_b9f91498e7ef046e: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_307cd9c326a8b615(value, context):
    if value['sc_b9f91498e7ef046e'] != []:
        return None
    if value['sc_307cd9c326a8b615'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_307cd9c326a8b615', g.Invariant('/checkpoint/retired_publications/*/project_id', 'type at owner schema /properties/retired_publications/items/properties/project_id/type'), 'schema_invalid', sc_307cd9c326a8b615),
    ])

    def check(value):
        table.require('sc_307cd9c326a8b615', value, context)
        return True
    return g.Case(table, check, context)
