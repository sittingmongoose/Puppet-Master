"""W3I schema guard table entailed_sc_a606afd3776e6a7b (generated).
sc_a606afd3776e6a7b: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/publication_id/type
Entailed after sc_df6f1fd67e961cc4: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_a606afd3776e6a7b(value, context):
    if value['sc_df6f1fd67e961cc4'] != []:
        return None
    if value['sc_a606afd3776e6a7b'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_a606afd3776e6a7b', g.Invariant('/projection/publication_id', 'type at owner schema /properties/publication_id/type'), 'schema_invalid', sc_a606afd3776e6a7b),
    ])

    def check(value):
        table.require('sc_a606afd3776e6a7b', value, context)
        return True
    return g.Case(table, check, context)
