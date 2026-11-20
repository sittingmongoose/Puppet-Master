"""W3I schema guard table payload_redaction_applied_4 (generated).
sc_ea2e5e8d48372b6c: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/actor_kind/not
sc_45513992576ae250: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/source_event_id/maxLength
sc_5be8512cff34c17d: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/source_event_id/pattern
sc_f5c9ed63038bdebf: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/source_event_id/not
sc_4cdd8434cb29a99d: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/provenance_ref/maxLength
sc_7b9012f5033276fa: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/provenance_ref/pattern
sc_1ccb525bcd8176fd: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/provenance_ref/not
sc_8223f2bf3ff8d090: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/properties/redaction_profile_id/maxLength
"""
import pm_guard_isolation as g


def sc_ea2e5e8d48372b6c(value, context):
    if value['sc_ea2e5e8d48372b6c'] != []:
        return 'schema_invalid'
    return None


def sc_45513992576ae250(value, context):
    if value['sc_45513992576ae250'] != []:
        return 'schema_invalid'
    return None


def sc_5be8512cff34c17d(value, context):
    if value['sc_5be8512cff34c17d'] != []:
        return 'schema_invalid'
    return None


def sc_f5c9ed63038bdebf(value, context):
    if value['sc_f5c9ed63038bdebf'] != []:
        return 'schema_invalid'
    return None


def sc_4cdd8434cb29a99d(value, context):
    if value['sc_4cdd8434cb29a99d'] != []:
        return 'schema_invalid'
    return None


def sc_7b9012f5033276fa(value, context):
    if value['sc_7b9012f5033276fa'] != []:
        return 'schema_invalid'
    return None


def sc_1ccb525bcd8176fd(value, context):
    if value['sc_1ccb525bcd8176fd'] != []:
        return 'schema_invalid'
    return None


def sc_8223f2bf3ff8d090(value, context):
    if value['sc_8223f2bf3ff8d090'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_ea2e5e8d48372b6c', g.Invariant('/payload_redaction_applied/actor_kind', 'not at owner schema /properties/actor_kind/not'), 'schema_invalid', sc_ea2e5e8d48372b6c),
        g.Guard('sc_45513992576ae250', g.Invariant('/payload_redaction_applied/source_event_id', 'maxLength at owner schema /properties/source_event_id/maxLength'), 'schema_invalid', sc_45513992576ae250),
        g.Guard('sc_5be8512cff34c17d', g.Invariant('/payload_redaction_applied/source_event_id', 'pattern at owner schema /properties/source_event_id/pattern'), 'schema_invalid', sc_5be8512cff34c17d),
        g.Guard('sc_f5c9ed63038bdebf', g.Invariant('/payload_redaction_applied/source_event_id', 'not at owner schema /properties/source_event_id/not'), 'schema_invalid', sc_f5c9ed63038bdebf),
        g.Guard('sc_4cdd8434cb29a99d', g.Invariant('/payload_redaction_applied/provenance_ref', 'maxLength at owner schema /properties/provenance_ref/maxLength'), 'schema_invalid', sc_4cdd8434cb29a99d),
        g.Guard('sc_7b9012f5033276fa', g.Invariant('/payload_redaction_applied/provenance_ref', 'pattern at owner schema /properties/provenance_ref/pattern'), 'schema_invalid', sc_7b9012f5033276fa),
        g.Guard('sc_1ccb525bcd8176fd', g.Invariant('/payload_redaction_applied/provenance_ref', 'not at owner schema /properties/provenance_ref/not'), 'schema_invalid', sc_1ccb525bcd8176fd),
        g.Guard('sc_8223f2bf3ff8d090', g.Invariant('/payload_redaction_applied/redaction_profile_id', 'maxLength at owner schema /properties/redaction_profile_id/maxLength'), 'schema_invalid', sc_8223f2bf3ff8d090),
    ])

    def check(value):
        table.require('sc_ea2e5e8d48372b6c', value, context)
        table.require('sc_45513992576ae250', value, context)
        table.require('sc_5be8512cff34c17d', value, context)
        table.require('sc_f5c9ed63038bdebf', value, context)
        table.require('sc_4cdd8434cb29a99d', value, context)
        table.require('sc_7b9012f5033276fa', value, context)
        table.require('sc_1ccb525bcd8176fd', value, context)
        table.require('sc_8223f2bf3ff8d090', value, context)
        return True
    return g.Case(table, check, context)
