"""W3I schema guard table entailed_sc_108fffd67a028b43 (generated).
sc_108fffd67a028b43: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/allOf/0/else/properties/withdrawn_at_utc/format
Entailed after sc_5e37443babf6491e: The earlier same-field anyOf(timestamp,null) rejects every string that violates date-time. This conditional else format applies only to strings; null and other types cannot violate format. Both use the same shared date-time profile and the unchanged timestamp definition.
"""
import pm_guard_isolation as g


def sc_108fffd67a028b43(value, context):
    if value['sc_5e37443babf6491e'] != []:
        return None
    if value['sc_108fffd67a028b43'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_108fffd67a028b43', g.Invariant('/checkpoint/withdrawn_at_utc', 'format at owner schema /allOf/0/else/properties/withdrawn_at_utc/format'), 'schema_invalid', sc_108fffd67a028b43),
    ])

    def check(value):
        table.require('sc_108fffd67a028b43', value, context)
        return True
    return g.Case(table, check, context)
