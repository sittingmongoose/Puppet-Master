"""W3I schema guard table entailed_sc_6e1c7d62aaf63f8b (generated).
sc_6e1c7d62aaf63f8b: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/replay_checkpoint_ref/type
Entailed after sc_8dfde35063a14442: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_6e1c7d62aaf63f8b(value, context):
    if value['sc_8dfde35063a14442'] != []:
        return None
    if value['sc_6e1c7d62aaf63f8b'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_6e1c7d62aaf63f8b', g.Invariant('/payload_provenance_recorded/replay_checkpoint_ref', 'type at owner schema /properties/replay_checkpoint_ref/type'), 'schema_invalid', sc_6e1c7d62aaf63f8b),
    ])

    def check(value):
        table.require('sc_6e1c7d62aaf63f8b', value, context)
        return True
    return g.Case(table, check, context)
