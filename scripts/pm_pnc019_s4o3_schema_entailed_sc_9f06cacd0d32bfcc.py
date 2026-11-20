"""W3I schema guard table entailed_sc_9f06cacd0d32bfcc (generated).
sc_9f06cacd0d32bfcc: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/stream_id/minLength
Entailed after sc_5f01f18d9d86acb4: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_9f06cacd0d32bfcc(value, context):
    if value['sc_5f01f18d9d86acb4'] != []:
        return None
    if value['sc_9f06cacd0d32bfcc'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_9f06cacd0d32bfcc', g.Invariant('/payload_redaction_applied/stream_id', 'minLength at owner schema /properties/stream_id/minLength'), 'schema_invalid', sc_9f06cacd0d32bfcc),
    ])

    def check(value):
        table.require('sc_9f06cacd0d32bfcc', value, context)
        return True
    return g.Case(table, check, context)
