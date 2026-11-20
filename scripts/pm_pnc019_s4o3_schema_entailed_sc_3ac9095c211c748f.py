"""W3I schema guard table entailed_sc_3ac9095c211c748f (generated).
sc_3ac9095c211c748f: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/actor_kind/minLength
Entailed after sc_33888d8a1bae1904: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_3ac9095c211c748f(value, context):
    if value['sc_33888d8a1bae1904'] != []:
        return None
    if value['sc_3ac9095c211c748f'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_3ac9095c211c748f', g.Invariant('/payload_redaction_applied/actor_kind', 'minLength at owner schema /properties/actor_kind/minLength'), 'schema_invalid', sc_3ac9095c211c748f),
    ])

    def check(value):
        table.require('sc_3ac9095c211c748f', value, context)
        return True
    return g.Case(table, check, context)
