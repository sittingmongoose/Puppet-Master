"""W3I schema guard table entailed_sc_89800f553254fc90 (generated).
sc_89800f553254fc90: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/stream_id/minLength
Entailed after sc_d58f8d9bea0bdb16: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_89800f553254fc90(value, context):
    if value['sc_d58f8d9bea0bdb16'] != []:
        return None
    if value['sc_89800f553254fc90'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_89800f553254fc90', g.Invariant('/payload_provenance_recorded/stream_id', 'minLength at owner schema /properties/stream_id/minLength'), 'schema_invalid', sc_89800f553254fc90),
    ])

    def check(value):
        table.require('sc_89800f553254fc90', value, context)
        return True
    return g.Case(table, check, context)
