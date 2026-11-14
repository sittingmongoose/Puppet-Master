"""W3I schema guard table entailed_sc_a20ff7ac753a340a (generated).
sc_a20ff7ac753a340a: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/project_id/minLength
Entailed after sc_b3ac40285e1cbbc0: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_a20ff7ac753a340a(value, context):
    if value['sc_b3ac40285e1cbbc0'] != []:
        return None
    if value['sc_a20ff7ac753a340a'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_a20ff7ac753a340a', g.Invariant('/payload_actor_identified/project_id', 'minLength at owner schema /properties/project_id/minLength'), 'schema_invalid', sc_a20ff7ac753a340a),
    ])

    def check(value):
        table.require('sc_a20ff7ac753a340a', value, context)
        return True
    return g.Case(table, check, context)
