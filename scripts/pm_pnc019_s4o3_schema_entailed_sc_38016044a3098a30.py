"""W3I schema guard table entailed_sc_38016044a3098a30 (generated).
sc_38016044a3098a30: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/body_event_id/type
Entailed after sc_9eedd886ba7cf192: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_38016044a3098a30(value, context):
    if value['sc_9eedd886ba7cf192'] != []:
        return None
    if value['sc_38016044a3098a30'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_38016044a3098a30', g.Invariant('/projection/body_event_id', 'type at owner schema /properties/body_event_id/type'), 'schema_invalid', sc_38016044a3098a30),
    ])

    def check(value):
        table.require('sc_38016044a3098a30', value, context)
        return True
    return g.Case(table, check, context)
