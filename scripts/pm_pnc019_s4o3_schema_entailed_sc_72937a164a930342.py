"""W3I schema guard table entailed_sc_72937a164a930342 (generated).
sc_72937a164a930342: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/actor_ref/minLength
Entailed after sc_51e21cd535308324: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_72937a164a930342(value, context):
    if value['sc_51e21cd535308324'] != []:
        return None
    if value['sc_72937a164a930342'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_72937a164a930342', g.Invariant('/payload_redaction_applied/actor_ref', 'minLength at owner schema /properties/actor_ref/minLength'), 'schema_invalid', sc_72937a164a930342),
    ])

    def check(value):
        table.require('sc_72937a164a930342', value, context)
        return True
    return g.Case(table, check, context)
