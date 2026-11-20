"""W3I schema guard table entailed_sc_2659865ca09ec617 (generated).
sc_2659865ca09ec617: Plans/continuity_event_contracts.schema.json#/$defs/projection/properties/publication_id/minLength
Entailed after sc_677c33d475967725: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_2659865ca09ec617(value, context):
    if value['sc_677c33d475967725'] != []:
        return None
    if value['sc_2659865ca09ec617'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_2659865ca09ec617', g.Invariant('/projection/publication_id', 'minLength at owner schema /properties/publication_id/minLength'), 'schema_invalid', sc_2659865ca09ec617),
    ])

    def check(value):
        table.require('sc_2659865ca09ec617', value, context)
        return True
    return g.Case(table, check, context)
