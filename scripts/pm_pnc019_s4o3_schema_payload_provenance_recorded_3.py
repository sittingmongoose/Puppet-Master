"""W3I schema guard table payload_provenance_recorded_3 (generated).
sc_f32a275776fe658f: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/fact_ref/maxLength
sc_330c79e44e4e0ffb: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/fact_ref/pattern
sc_c83fbe3d0901b33d: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/fact_ref/not
sc_c165ff06f94dd996: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/actor_ref/maxLength
sc_1286ef4b375ea092: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/actor_ref/pattern
sc_5d1ac7717fa784b8: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/actor_ref/not
sc_a6e8a554b1f11395: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/actor_kind/maxLength
sc_a60d8aa090d297e2: Plans/continuity_event_contracts.schema.json#/$defs/provenance_recorded/properties/actor_kind/pattern
"""
import pm_guard_isolation as g


def sc_f32a275776fe658f(value, context):
    if value['sc_f32a275776fe658f'] != []:
        return 'schema_invalid'
    return None


def sc_330c79e44e4e0ffb(value, context):
    if value['sc_330c79e44e4e0ffb'] != []:
        return 'schema_invalid'
    return None


def sc_c83fbe3d0901b33d(value, context):
    if value['sc_c83fbe3d0901b33d'] != []:
        return 'schema_invalid'
    return None


def sc_c165ff06f94dd996(value, context):
    if value['sc_c165ff06f94dd996'] != []:
        return 'schema_invalid'
    return None


def sc_1286ef4b375ea092(value, context):
    if value['sc_1286ef4b375ea092'] != []:
        return 'schema_invalid'
    return None


def sc_5d1ac7717fa784b8(value, context):
    if value['sc_5d1ac7717fa784b8'] != []:
        return 'schema_invalid'
    return None


def sc_a6e8a554b1f11395(value, context):
    if value['sc_a6e8a554b1f11395'] != []:
        return 'schema_invalid'
    return None


def sc_a60d8aa090d297e2(value, context):
    if value['sc_a60d8aa090d297e2'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_f32a275776fe658f', g.Invariant('/payload_provenance_recorded/fact_ref', 'maxLength at owner schema /properties/fact_ref/maxLength'), 'schema_invalid', sc_f32a275776fe658f),
        g.Guard('sc_330c79e44e4e0ffb', g.Invariant('/payload_provenance_recorded/fact_ref', 'pattern at owner schema /properties/fact_ref/pattern'), 'schema_invalid', sc_330c79e44e4e0ffb),
        g.Guard('sc_c83fbe3d0901b33d', g.Invariant('/payload_provenance_recorded/fact_ref', 'not at owner schema /properties/fact_ref/not'), 'schema_invalid', sc_c83fbe3d0901b33d),
        g.Guard('sc_c165ff06f94dd996', g.Invariant('/payload_provenance_recorded/actor_ref', 'maxLength at owner schema /properties/actor_ref/maxLength'), 'schema_invalid', sc_c165ff06f94dd996),
        g.Guard('sc_1286ef4b375ea092', g.Invariant('/payload_provenance_recorded/actor_ref', 'pattern at owner schema /properties/actor_ref/pattern'), 'schema_invalid', sc_1286ef4b375ea092),
        g.Guard('sc_5d1ac7717fa784b8', g.Invariant('/payload_provenance_recorded/actor_ref', 'not at owner schema /properties/actor_ref/not'), 'schema_invalid', sc_5d1ac7717fa784b8),
        g.Guard('sc_a6e8a554b1f11395', g.Invariant('/payload_provenance_recorded/actor_kind', 'maxLength at owner schema /properties/actor_kind/maxLength'), 'schema_invalid', sc_a6e8a554b1f11395),
        g.Guard('sc_a60d8aa090d297e2', g.Invariant('/payload_provenance_recorded/actor_kind', 'pattern at owner schema /properties/actor_kind/pattern'), 'schema_invalid', sc_a60d8aa090d297e2),
    ])

    def check(value):
        table.require('sc_f32a275776fe658f', value, context)
        table.require('sc_330c79e44e4e0ffb', value, context)
        table.require('sc_c83fbe3d0901b33d', value, context)
        table.require('sc_c165ff06f94dd996', value, context)
        table.require('sc_1286ef4b375ea092', value, context)
        table.require('sc_5d1ac7717fa784b8', value, context)
        table.require('sc_a6e8a554b1f11395', value, context)
        table.require('sc_a60d8aa090d297e2', value, context)
        return True
    return g.Case(table, check, context)
