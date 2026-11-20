"""W3I schema guard table entailed_sc_37ee109518ddb52d (generated).
sc_37ee109518ddb52d: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/storage_instance_id/minLength
Entailed after sc_2d49452fb7916a6f: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_37ee109518ddb52d(value, context):
    if value['sc_2d49452fb7916a6f'] != []:
        return None
    if value['sc_37ee109518ddb52d'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_37ee109518ddb52d', g.Invariant('/checkpoint/storage_instance_id', 'minLength at owner schema /properties/storage_instance_id/minLength'), 'schema_invalid', sc_37ee109518ddb52d),
    ])

    def check(value):
        table.require('sc_37ee109518ddb52d', value, context)
        return True
    return g.Case(table, check, context)
