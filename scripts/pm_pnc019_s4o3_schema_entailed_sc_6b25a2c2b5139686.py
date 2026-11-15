"""W3I schema guard table entailed_sc_6b25a2c2b5139686 (generated).
sc_6b25a2c2b5139686: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/storage_instance_id/type
Entailed after sc_041f800b72ec0692: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_6b25a2c2b5139686(value, context):
    if value['sc_041f800b72ec0692'] != []:
        return None
    if value['sc_6b25a2c2b5139686'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_6b25a2c2b5139686', g.Invariant('/checkpoint/retired_publications/*/storage_instance_id', 'type at owner schema /properties/retired_publications/items/properties/storage_instance_id/type'), 'schema_invalid', sc_6b25a2c2b5139686),
    ])

    def check(value):
        table.require('sc_6b25a2c2b5139686', value, context)
        return True
    return g.Case(table, check, context)
