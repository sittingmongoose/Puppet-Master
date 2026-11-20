"""W3I schema guard table entailed_sc_280336bdd1fa0bd1 (generated).
sc_280336bdd1fa0bd1: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/retired_publications/items/properties/storage_instance_id/minLength
Entailed after sc_728098611bcfd2f8: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_280336bdd1fa0bd1(value, context):
    if value['sc_728098611bcfd2f8'] != []:
        return None
    if value['sc_280336bdd1fa0bd1'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_280336bdd1fa0bd1', g.Invariant('/checkpoint/retired_publications/*/storage_instance_id', 'minLength at owner schema /properties/retired_publications/items/properties/storage_instance_id/minLength'), 'schema_invalid', sc_280336bdd1fa0bd1),
    ])

    def check(value):
        table.require('sc_280336bdd1fa0bd1', value, context)
        return True
    return g.Case(table, check, context)
