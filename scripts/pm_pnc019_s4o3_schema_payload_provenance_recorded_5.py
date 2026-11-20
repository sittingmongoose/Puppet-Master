"""W3I schema guard table payload_provenance_recorded_5 (generated).
sc_8da08450b0081e44: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/redaction_profile_id/pattern
sc_3604950d368077eb: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/redaction_profile_id/not
sc_7da064823b49c998: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/redaction_decision/maxLength
sc_77e4d177433d9772: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/redaction_decision/pattern
sc_1a7c2c33c9aeb9bc: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/redaction_decision/not
sc_dc3aaf087ca183ea: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/replay_checkpoint_ref/maxLength
sc_937ada5c61ebce2a: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/replay_checkpoint_ref/pattern
sc_8dfde35063a14442: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/replay_checkpoint_ref/not
"""
import pm_guard_isolation as g


def sc_8da08450b0081e44(value, context):
    if value['sc_8da08450b0081e44'] != []:
        return 'schema_invalid'
    return None


def sc_3604950d368077eb(value, context):
    if value['sc_3604950d368077eb'] != []:
        return 'schema_invalid'
    return None


def sc_7da064823b49c998(value, context):
    if value['sc_7da064823b49c998'] != []:
        return 'schema_invalid'
    return None


def sc_77e4d177433d9772(value, context):
    if value['sc_77e4d177433d9772'] != []:
        return 'schema_invalid'
    return None


def sc_1a7c2c33c9aeb9bc(value, context):
    if value['sc_1a7c2c33c9aeb9bc'] != []:
        return 'schema_invalid'
    return None


def sc_dc3aaf087ca183ea(value, context):
    if value['sc_dc3aaf087ca183ea'] != []:
        return 'schema_invalid'
    return None


def sc_937ada5c61ebce2a(value, context):
    if value['sc_937ada5c61ebce2a'] != []:
        return 'schema_invalid'
    return None


def sc_8dfde35063a14442(value, context):
    if value['sc_8dfde35063a14442'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_8da08450b0081e44', g.Invariant('/payload_provenance_recorded/redaction_profile_id', 'pattern at owner schema /properties/redaction_profile_id/pattern'), 'schema_invalid', sc_8da08450b0081e44),
        g.Guard('sc_3604950d368077eb', g.Invariant('/payload_provenance_recorded/redaction_profile_id', 'not at owner schema /properties/redaction_profile_id/not'), 'schema_invalid', sc_3604950d368077eb),
        g.Guard('sc_7da064823b49c998', g.Invariant('/payload_provenance_recorded/redaction_decision', 'maxLength at owner schema /properties/redaction_decision/maxLength'), 'schema_invalid', sc_7da064823b49c998),
        g.Guard('sc_77e4d177433d9772', g.Invariant('/payload_provenance_recorded/redaction_decision', 'pattern at owner schema /properties/redaction_decision/pattern'), 'schema_invalid', sc_77e4d177433d9772),
        g.Guard('sc_1a7c2c33c9aeb9bc', g.Invariant('/payload_provenance_recorded/redaction_decision', 'not at owner schema /properties/redaction_decision/not'), 'schema_invalid', sc_1a7c2c33c9aeb9bc),
        g.Guard('sc_dc3aaf087ca183ea', g.Invariant('/payload_provenance_recorded/replay_checkpoint_ref', 'maxLength at owner schema /properties/replay_checkpoint_ref/maxLength'), 'schema_invalid', sc_dc3aaf087ca183ea),
        g.Guard('sc_937ada5c61ebce2a', g.Invariant('/payload_provenance_recorded/replay_checkpoint_ref', 'pattern at owner schema /properties/replay_checkpoint_ref/pattern'), 'schema_invalid', sc_937ada5c61ebce2a),
        g.Guard('sc_8dfde35063a14442', g.Invariant('/payload_provenance_recorded/replay_checkpoint_ref', 'not at owner schema /properties/replay_checkpoint_ref/not'), 'schema_invalid', sc_8dfde35063a14442),
    ])

    def check(value):
        table.require('sc_8da08450b0081e44', value, context)
        table.require('sc_3604950d368077eb', value, context)
        table.require('sc_7da064823b49c998', value, context)
        table.require('sc_77e4d177433d9772', value, context)
        table.require('sc_1a7c2c33c9aeb9bc', value, context)
        table.require('sc_dc3aaf087ca183ea', value, context)
        table.require('sc_937ada5c61ebce2a', value, context)
        table.require('sc_8dfde35063a14442', value, context)
        return True
    return g.Case(table, check, context)
