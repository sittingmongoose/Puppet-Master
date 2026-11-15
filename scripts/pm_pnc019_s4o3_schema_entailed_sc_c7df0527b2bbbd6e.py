"""W3I schema guard table entailed_sc_c7df0527b2bbbd6e (generated).
sc_c7df0527b2bbbd6e: Plans/continuity_event_contracts.schema.json#/$defs/replay_checkpointed/properties/redaction_profile_id/minLength
Entailed after sc_5e5c89827d14396e: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_c7df0527b2bbbd6e(value, context):
    if value['sc_5e5c89827d14396e'] != []:
        return None
    if value['sc_c7df0527b2bbbd6e'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_c7df0527b2bbbd6e', g.Invariant('/payload_replay_checkpointed/redaction_profile_id', 'minLength at owner schema /properties/redaction_profile_id/minLength'), 'schema_invalid', sc_c7df0527b2bbbd6e),
    ])

    def check(value):
        table.require('sc_c7df0527b2bbbd6e', value, context)
        return True
    return g.Case(table, check, context)
