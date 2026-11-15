"""W3I schema guard table entailed_sc_aeccbb740d8d01a3 (generated).
sc_aeccbb740d8d01a3: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/project_id/type
Entailed after sc_39dfd545abdb634a: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_aeccbb740d8d01a3(value, context):
    if value['sc_39dfd545abdb634a'] != []:
        return None
    if value['sc_aeccbb740d8d01a3'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_aeccbb740d8d01a3', g.Invariant('/payload_actor_identified/project_id', 'type at owner schema /properties/project_id/type'), 'schema_invalid', sc_aeccbb740d8d01a3),
    ])

    def check(value):
        table.require('sc_aeccbb740d8d01a3', value, context)
        return True
    return g.Case(table, check, context)
