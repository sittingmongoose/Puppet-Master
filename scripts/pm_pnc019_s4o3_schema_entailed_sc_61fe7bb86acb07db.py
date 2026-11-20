"""W3I schema guard table entailed_sc_61fe7bb86acb07db (generated).
sc_61fe7bb86acb07db: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/actor_ref/type
Entailed after sc_5d1ac7717fa784b8: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_61fe7bb86acb07db(value, context):
    if value['sc_5d1ac7717fa784b8'] != []:
        return None
    if value['sc_61fe7bb86acb07db'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_61fe7bb86acb07db', g.Invariant('/payload_provenance_recorded/actor_ref', 'type at owner schema /properties/actor_ref/type'), 'schema_invalid', sc_61fe7bb86acb07db),
    ])

    def check(value):
        table.require('sc_61fe7bb86acb07db', value, context)
        return True
    return g.Case(table, check, context)
