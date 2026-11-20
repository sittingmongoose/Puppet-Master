"""W3I schema guard table entailed_sc_7316f99efcf6debb (generated).
sc_7316f99efcf6debb: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/body_event_id/minLength
Entailed after sc_7190008f54c9551c: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_7316f99efcf6debb(value, context):
    if value['sc_7190008f54c9551c'] != []:
        return None
    if value['sc_7316f99efcf6debb'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_7316f99efcf6debb', g.Invariant('/projection/body_event_id', 'minLength at owner schema /properties/body_event_id/minLength'), 'schema_invalid', sc_7316f99efcf6debb),
    ])

    def check(value):
        table.require('sc_7316f99efcf6debb', value, context)
        return True
    return g.Case(table, check, context)
