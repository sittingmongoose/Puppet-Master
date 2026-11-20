"""W3I schema guard table payload_provenance_recorded_4 (generated).
sc_f62f412dfd52e190: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/actor_kind/not
sc_48a66118bd69e5c0: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/source_event_id/maxLength
sc_cd2fba186e731cd2: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/source_event_id/pattern
sc_a651f94daffa2e48: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/source_event_id/not
sc_fcef916718fc17dd: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/provenance_ref/maxLength
sc_63e4cf7a48dedd52: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/provenance_ref/pattern
sc_859866ab8ceb2cc5: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/provenance_ref/not
sc_a05ac5c0a599f169: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/redaction_profile_id/maxLength
"""
import pm_guard_isolation as g


def sc_f62f412dfd52e190(value, context):
    if value['sc_f62f412dfd52e190'] != []:
        return 'schema_invalid'
    return None


def sc_48a66118bd69e5c0(value, context):
    if value['sc_48a66118bd69e5c0'] != []:
        return 'schema_invalid'
    return None


def sc_cd2fba186e731cd2(value, context):
    if value['sc_cd2fba186e731cd2'] != []:
        return 'schema_invalid'
    return None


def sc_a651f94daffa2e48(value, context):
    if value['sc_a651f94daffa2e48'] != []:
        return 'schema_invalid'
    return None


def sc_fcef916718fc17dd(value, context):
    if value['sc_fcef916718fc17dd'] != []:
        return 'schema_invalid'
    return None


def sc_63e4cf7a48dedd52(value, context):
    if value['sc_63e4cf7a48dedd52'] != []:
        return 'schema_invalid'
    return None


def sc_859866ab8ceb2cc5(value, context):
    if value['sc_859866ab8ceb2cc5'] != []:
        return 'schema_invalid'
    return None


def sc_a05ac5c0a599f169(value, context):
    if value['sc_a05ac5c0a599f169'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_f62f412dfd52e190', g.Invariant('/payload_provenance_recorded/actor_kind', 'not at owner schema /properties/actor_kind/not'), 'schema_invalid', sc_f62f412dfd52e190),
        g.Guard('sc_48a66118bd69e5c0', g.Invariant('/payload_provenance_recorded/source_event_id', 'maxLength at owner schema /properties/source_event_id/maxLength'), 'schema_invalid', sc_48a66118bd69e5c0),
        g.Guard('sc_cd2fba186e731cd2', g.Invariant('/payload_provenance_recorded/source_event_id', 'pattern at owner schema /properties/source_event_id/pattern'), 'schema_invalid', sc_cd2fba186e731cd2),
        g.Guard('sc_a651f94daffa2e48', g.Invariant('/payload_provenance_recorded/source_event_id', 'not at owner schema /properties/source_event_id/not'), 'schema_invalid', sc_a651f94daffa2e48),
        g.Guard('sc_fcef916718fc17dd', g.Invariant('/payload_provenance_recorded/provenance_ref', 'maxLength at owner schema /properties/provenance_ref/maxLength'), 'schema_invalid', sc_fcef916718fc17dd),
        g.Guard('sc_63e4cf7a48dedd52', g.Invariant('/payload_provenance_recorded/provenance_ref', 'pattern at owner schema /properties/provenance_ref/pattern'), 'schema_invalid', sc_63e4cf7a48dedd52),
        g.Guard('sc_859866ab8ceb2cc5', g.Invariant('/payload_provenance_recorded/provenance_ref', 'not at owner schema /properties/provenance_ref/not'), 'schema_invalid', sc_859866ab8ceb2cc5),
        g.Guard('sc_a05ac5c0a599f169', g.Invariant('/payload_provenance_recorded/redaction_profile_id', 'maxLength at owner schema /properties/redaction_profile_id/maxLength'), 'schema_invalid', sc_a05ac5c0a599f169),
    ])

    def check(value):
        table.require('sc_f62f412dfd52e190', value, context)
        table.require('sc_48a66118bd69e5c0', value, context)
        table.require('sc_cd2fba186e731cd2', value, context)
        table.require('sc_a651f94daffa2e48', value, context)
        table.require('sc_fcef916718fc17dd', value, context)
        table.require('sc_63e4cf7a48dedd52', value, context)
        table.require('sc_859866ab8ceb2cc5', value, context)
        table.require('sc_a05ac5c0a599f169', value, context)
        return True
    return g.Case(table, check, context)
