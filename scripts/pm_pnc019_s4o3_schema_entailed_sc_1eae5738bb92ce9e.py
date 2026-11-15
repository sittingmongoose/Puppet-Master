"""W3I schema guard table entailed_sc_1eae5738bb92ce9e (generated).
sc_1eae5738bb92ce9e: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/project_id/type
Entailed after sc_b3f1b525f461a2b6: JSON Schema pattern applies only to strings. Every non-string satisfies the inner pattern-only schema and therefore fails this same-field not:{pattern:...}. Thus type:string cannot refuse first.
"""
import pm_guard_isolation as g


def sc_1eae5738bb92ce9e(value, context):
    if value['sc_b3f1b525f461a2b6'] != []:
        return None
    if value['sc_1eae5738bb92ce9e'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_1eae5738bb92ce9e', g.Invariant('/payload_redaction_applied/project_id', 'type at owner schema /properties/project_id/type'), 'schema_invalid', sc_1eae5738bb92ce9e),
    ])

    def check(value):
        table.require('sc_1eae5738bb92ce9e', value, context)
        return True
    return g.Case(table, check, context)
