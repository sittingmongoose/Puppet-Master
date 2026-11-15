"""W3I schema guard table entailed_sc_586a6f18ea0a6528 (generated).
sc_586a6f18ea0a6528: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/stream_id/type
Entailed after sc_d471649330526b06: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_586a6f18ea0a6528(value, context):
    if value['sc_d471649330526b06'] != []:
        return None
    if value['sc_586a6f18ea0a6528'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_586a6f18ea0a6528', g.Invariant('/payload_provenance_recorded/stream_id', 'type at owner schema /properties/stream_id/type'), 'schema_invalid', sc_586a6f18ea0a6528),
    ])

    def check(value):
        table.require('sc_586a6f18ea0a6528', value, context)
        return True
    return g.Case(table, check, context)
