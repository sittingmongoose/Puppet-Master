"""W3I schema guard table payload_actor_identified_4 (generated).
sc_38f2d296116242db: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/actor_kind/not
sc_7808ae331c0007ff: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/source_event_id/maxLength
sc_d195ad5766c004aa: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/source_event_id/pattern
sc_a5bb490365b20317: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/source_event_id/not
sc_fe146e2f48f9f9b5: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/provenance_ref/maxLength
sc_996fce70b53d2b86: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/provenance_ref/pattern
sc_89ebe6b405728792: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/provenance_ref/not
sc_bb1e10d2d0b161db: Plans/continuity_event_contracts.schema.json#/$defs/actor_identified/properties/redaction_profile_id/maxLength
"""
import pm_guard_isolation as g


def sc_38f2d296116242db(value, context):
    if value['sc_38f2d296116242db'] != []:
        return 'schema_invalid'
    return None


def sc_7808ae331c0007ff(value, context):
    if value['sc_7808ae331c0007ff'] != []:
        return 'schema_invalid'
    return None


def sc_d195ad5766c004aa(value, context):
    if value['sc_d195ad5766c004aa'] != []:
        return 'schema_invalid'
    return None


def sc_a5bb490365b20317(value, context):
    if value['sc_a5bb490365b20317'] != []:
        return 'schema_invalid'
    return None


def sc_fe146e2f48f9f9b5(value, context):
    if value['sc_fe146e2f48f9f9b5'] != []:
        return 'schema_invalid'
    return None


def sc_996fce70b53d2b86(value, context):
    if value['sc_996fce70b53d2b86'] != []:
        return 'schema_invalid'
    return None


def sc_89ebe6b405728792(value, context):
    if value['sc_89ebe6b405728792'] != []:
        return 'schema_invalid'
    return None


def sc_bb1e10d2d0b161db(value, context):
    if value['sc_bb1e10d2d0b161db'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_38f2d296116242db', g.Invariant('/payload_actor_identified/actor_kind', 'not at owner schema /properties/actor_kind/not'), 'schema_invalid', sc_38f2d296116242db),
        g.Guard('sc_7808ae331c0007ff', g.Invariant('/payload_actor_identified/source_event_id', 'maxLength at owner schema /properties/source_event_id/maxLength'), 'schema_invalid', sc_7808ae331c0007ff),
        g.Guard('sc_d195ad5766c004aa', g.Invariant('/payload_actor_identified/source_event_id', 'pattern at owner schema /properties/source_event_id/pattern'), 'schema_invalid', sc_d195ad5766c004aa),
        g.Guard('sc_a5bb490365b20317', g.Invariant('/payload_actor_identified/source_event_id', 'not at owner schema /properties/source_event_id/not'), 'schema_invalid', sc_a5bb490365b20317),
        g.Guard('sc_fe146e2f48f9f9b5', g.Invariant('/payload_actor_identified/provenance_ref', 'maxLength at owner schema /properties/provenance_ref/maxLength'), 'schema_invalid', sc_fe146e2f48f9f9b5),
        g.Guard('sc_996fce70b53d2b86', g.Invariant('/payload_actor_identified/provenance_ref', 'pattern at owner schema /properties/provenance_ref/pattern'), 'schema_invalid', sc_996fce70b53d2b86),
        g.Guard('sc_89ebe6b405728792', g.Invariant('/payload_actor_identified/provenance_ref', 'not at owner schema /properties/provenance_ref/not'), 'schema_invalid', sc_89ebe6b405728792),
        g.Guard('sc_bb1e10d2d0b161db', g.Invariant('/payload_actor_identified/redaction_profile_id', 'maxLength at owner schema /properties/redaction_profile_id/maxLength'), 'schema_invalid', sc_bb1e10d2d0b161db),
    ])

    def check(value):
        table.require('sc_38f2d296116242db', value, context)
        table.require('sc_7808ae331c0007ff', value, context)
        table.require('sc_d195ad5766c004aa', value, context)
        table.require('sc_a5bb490365b20317', value, context)
        table.require('sc_fe146e2f48f9f9b5', value, context)
        table.require('sc_996fce70b53d2b86', value, context)
        table.require('sc_89ebe6b405728792', value, context)
        table.require('sc_bb1e10d2d0b161db', value, context)
        return True
    return g.Case(table, check, context)
