"""W3I schema guard table entailed_sc_3278215e2a9e06dd (generated).
sc_3278215e2a9e06dd: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/redaction_profile_id/minLength
Entailed after sc_d7e967cad8019ffb: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_3278215e2a9e06dd(value, context):
    if value['sc_d7e967cad8019ffb'] != []:
        return None
    if value['sc_3278215e2a9e06dd'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_3278215e2a9e06dd', g.Invariant('/payload_actor_identified/redaction_profile_id', 'minLength at owner schema /properties/redaction_profile_id/minLength'), 'schema_invalid', sc_3278215e2a9e06dd),
    ])

    def check(value):
        table.require('sc_3278215e2a9e06dd', value, context)
        return True
    return g.Case(table, check, context)
