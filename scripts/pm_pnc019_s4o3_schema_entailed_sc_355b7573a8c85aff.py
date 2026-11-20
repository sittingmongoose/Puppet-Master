"""W3I schema guard table entailed_sc_355b7573a8c85aff (generated).
sc_355b7573a8c85aff: Plans/continuity_event_contracts.schema.json#/$defs/checkpoint/properties/publication_id/minLength
Entailed after sc_7ac7bbcd140fbaa9: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_355b7573a8c85aff(value, context):
    if value['sc_7ac7bbcd140fbaa9'] != []:
        return None
    if value['sc_355b7573a8c85aff'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_355b7573a8c85aff', g.Invariant('/checkpoint/publication_id', 'minLength at owner schema /properties/publication_id/minLength'), 'schema_invalid', sc_355b7573a8c85aff),
    ])

    def check(value):
        table.require('sc_355b7573a8c85aff', value, context)
        return True
    return g.Case(table, check, context)
