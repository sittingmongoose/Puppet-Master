"""W3I schema guard table payload_actor_identified_3 (generated).
sc_3adce8fcabfa191b: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/fact_ref/maxLength
sc_b9f3dcd78238db2f: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/fact_ref/pattern
sc_a73cb776845a7aa5: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/fact_ref/not
sc_8f66e9b93391fa9b: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/actor_ref/maxLength
sc_54916a1552357c3e: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/actor_ref/pattern
sc_ceafa747397d3e41: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/actor_ref/not
sc_916acb939c7a82b6: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/actor_kind/maxLength
sc_2292a09b79a12dbf: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/actor_kind/pattern
"""
import pm_guard_isolation as g


def sc_3adce8fcabfa191b(value, context):
    if value['sc_3adce8fcabfa191b'] != []:
        return 'schema_invalid'
    return None


def sc_b9f3dcd78238db2f(value, context):
    if value['sc_b9f3dcd78238db2f'] != []:
        return 'schema_invalid'
    return None


def sc_a73cb776845a7aa5(value, context):
    if value['sc_a73cb776845a7aa5'] != []:
        return 'schema_invalid'
    return None


def sc_8f66e9b93391fa9b(value, context):
    if value['sc_8f66e9b93391fa9b'] != []:
        return 'schema_invalid'
    return None


def sc_54916a1552357c3e(value, context):
    if value['sc_54916a1552357c3e'] != []:
        return 'schema_invalid'
    return None


def sc_ceafa747397d3e41(value, context):
    if value['sc_ceafa747397d3e41'] != []:
        return 'schema_invalid'
    return None


def sc_916acb939c7a82b6(value, context):
    if value['sc_916acb939c7a82b6'] != []:
        return 'schema_invalid'
    return None


def sc_2292a09b79a12dbf(value, context):
    if value['sc_2292a09b79a12dbf'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_3adce8fcabfa191b', g.Invariant('/payload_actor_identified/fact_ref', 'maxLength at owner schema /properties/fact_ref/maxLength'), 'schema_invalid', sc_3adce8fcabfa191b),
        g.Guard('sc_b9f3dcd78238db2f', g.Invariant('/payload_actor_identified/fact_ref', 'pattern at owner schema /properties/fact_ref/pattern'), 'schema_invalid', sc_b9f3dcd78238db2f),
        g.Guard('sc_a73cb776845a7aa5', g.Invariant('/payload_actor_identified/fact_ref', 'not at owner schema /properties/fact_ref/not'), 'schema_invalid', sc_a73cb776845a7aa5),
        g.Guard('sc_8f66e9b93391fa9b', g.Invariant('/payload_actor_identified/actor_ref', 'maxLength at owner schema /properties/actor_ref/maxLength'), 'schema_invalid', sc_8f66e9b93391fa9b),
        g.Guard('sc_54916a1552357c3e', g.Invariant('/payload_actor_identified/actor_ref', 'pattern at owner schema /properties/actor_ref/pattern'), 'schema_invalid', sc_54916a1552357c3e),
        g.Guard('sc_ceafa747397d3e41', g.Invariant('/payload_actor_identified/actor_ref', 'not at owner schema /properties/actor_ref/not'), 'schema_invalid', sc_ceafa747397d3e41),
        g.Guard('sc_916acb939c7a82b6', g.Invariant('/payload_actor_identified/actor_kind', 'maxLength at owner schema /properties/actor_kind/maxLength'), 'schema_invalid', sc_916acb939c7a82b6),
        g.Guard('sc_2292a09b79a12dbf', g.Invariant('/payload_actor_identified/actor_kind', 'pattern at owner schema /properties/actor_kind/pattern'), 'schema_invalid', sc_2292a09b79a12dbf),
    ])

    def check(value):
        table.require('sc_3adce8fcabfa191b', value, context)
        table.require('sc_b9f3dcd78238db2f', value, context)
        table.require('sc_a73cb776845a7aa5', value, context)
        table.require('sc_8f66e9b93391fa9b', value, context)
        table.require('sc_54916a1552357c3e', value, context)
        table.require('sc_ceafa747397d3e41', value, context)
        table.require('sc_916acb939c7a82b6', value, context)
        table.require('sc_2292a09b79a12dbf', value, context)
        return True
    return g.Case(table, check, context)
