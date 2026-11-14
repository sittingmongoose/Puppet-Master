"""W3I schema guard table entailed_sc_5279bcacfa8cb035 (generated).
sc_5279bcacfa8cb035: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/fact_ref/type
Entailed after sc_c83fbe3d0901b33d: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_5279bcacfa8cb035(value, context):
    if value['sc_c83fbe3d0901b33d'] != []:
        return None
    if value['sc_5279bcacfa8cb035'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_5279bcacfa8cb035', g.Invariant('/payload_provenance_recorded/fact_ref', 'type at owner schema /properties/fact_ref/type'), 'schema_invalid', sc_5279bcacfa8cb035),
    ])

    def check(value):
        table.require('sc_5279bcacfa8cb035', value, context)
        return True
    return g.Case(table, check, context)
