"""W3I schema guard table entailed_sc_d75c2bc7510caef4 (generated).
sc_d75c2bc7510caef4: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/redaction_decision/minLength
Entailed after sc_7f06ada0e233aa47: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_d75c2bc7510caef4(value, context):
    if value['sc_7f06ada0e233aa47'] != []:
        return None
    if value['sc_d75c2bc7510caef4'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_d75c2bc7510caef4', g.Invariant('/payload_actor_identified/redaction_decision', 'minLength at owner schema /properties/redaction_decision/minLength'), 'schema_invalid', sc_d75c2bc7510caef4),
    ])

    def check(value):
        table.require('sc_d75c2bc7510caef4', value, context)
        return True
    return g.Case(table, check, context)
