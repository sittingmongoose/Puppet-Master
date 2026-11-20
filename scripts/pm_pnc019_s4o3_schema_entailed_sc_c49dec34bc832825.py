"""W3I schema guard table entailed_sc_c49dec34bc832825 (generated).
sc_c49dec34bc832825: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/stream_id/minLength
Entailed after sc_25754d7e0319ed8b: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_c49dec34bc832825(value, context):
    if value['sc_25754d7e0319ed8b'] != []:
        return None
    if value['sc_c49dec34bc832825'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_c49dec34bc832825', g.Invariant('/checkpoint/stream_id', 'minLength at owner schema /properties/stream_id/minLength'), 'schema_invalid', sc_c49dec34bc832825),
    ])

    def check(value):
        table.require('sc_c49dec34bc832825', value, context)
        return True
    return g.Case(table, check, context)
