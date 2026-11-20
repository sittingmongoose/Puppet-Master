"""W3I schema guard table entailed_sc_d43557787a2e7f58 (generated).
sc_d43557787a2e7f58: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/source_event_id/type
Entailed after sc_a651f94daffa2e48: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_d43557787a2e7f58(value, context):
    if value['sc_a651f94daffa2e48'] != []:
        return None
    if value['sc_d43557787a2e7f58'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_d43557787a2e7f58', g.Invariant('/payload_provenance_recorded/source_event_id', 'type at owner schema /properties/source_event_id/type'), 'schema_invalid', sc_d43557787a2e7f58),
    ])

    def check(value):
        table.require('sc_d43557787a2e7f58', value, context)
        return True
    return g.Case(table, check, context)
