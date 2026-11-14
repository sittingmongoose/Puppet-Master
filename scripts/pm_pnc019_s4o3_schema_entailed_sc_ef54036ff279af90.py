"""W3I schema guard table entailed_sc_ef54036ff279af90 (generated).
sc_ef54036ff279af90: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/provenance_ref/type
Entailed after sc_89ebe6b405728792: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_ef54036ff279af90(value, context):
    if value['sc_89ebe6b405728792'] != []:
        return None
    if value['sc_ef54036ff279af90'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_ef54036ff279af90', g.Invariant('/payload_actor_identified/provenance_ref', 'type at owner schema /properties/provenance_ref/type'), 'schema_invalid', sc_ef54036ff279af90),
    ])

    def check(value):
        table.require('sc_ef54036ff279af90', value, context)
        return True
    return g.Case(table, check, context)
