"""W3I schema guard table entailed_sc_0a0930462e1bf30e (generated).
sc_0a0930462e1bf30e: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/provenance_ref/minLength
Entailed after sc_7b9012f5033276fa: The same-field anchored + pattern requires at least one character. Every minLength:1 failure is an empty string and fails that pattern. Non-strings do not trigger minLength.
"""
import pm_guard_isolation as g


def sc_0a0930462e1bf30e(value, context):
    if value['sc_7b9012f5033276fa'] != []:
        return None
    if value['sc_0a0930462e1bf30e'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_0a0930462e1bf30e', g.Invariant('/payload_redaction_applied/provenance_ref', 'minLength at owner schema /properties/provenance_ref/minLength'), 'schema_invalid', sc_0a0930462e1bf30e),
    ])

    def check(value):
        table.require('sc_0a0930462e1bf30e', value, context)
        return True
    return g.Case(table, check, context)
