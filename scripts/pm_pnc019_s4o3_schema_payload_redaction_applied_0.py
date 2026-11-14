"""W3I schema guard table payload_redaction_applied_0 (generated).
sc_f919e00acc5fce1a: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/type
sc_c937a72a3b0c2b2b: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/required/project_id
sc_3d04235f17f95e14: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/required/continuity_id
sc_ed89b9921cdde836: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/required/stream_id
sc_063add45bfc27d83: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/required/fact_ref
sc_423a6221e6a26c6a: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/required/actor_ref
sc_28e3dfae076c5410: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/required/actor_kind
sc_33546a22b7225e39: Plans/continuity_event_contracts.schema.json#/$defs/redaction_applied/required/source_event_id
"""
import pm_guard_isolation as g


def sc_f919e00acc5fce1a(value, context):
    if value['sc_f919e00acc5fce1a'] != []:
        return 'schema_invalid'
    return None


def sc_c937a72a3b0c2b2b(value, context):
    if value['sc_c937a72a3b0c2b2b'] != []:
        return 'schema_invalid'
    return None


def sc_3d04235f17f95e14(value, context):
    if value['sc_3d04235f17f95e14'] != []:
        return 'schema_invalid'
    return None


def sc_ed89b9921cdde836(value, context):
    if value['sc_ed89b9921cdde836'] != []:
        return 'schema_invalid'
    return None


def sc_063add45bfc27d83(value, context):
    if value['sc_063add45bfc27d83'] != []:
        return 'schema_invalid'
    return None


def sc_423a6221e6a26c6a(value, context):
    if value['sc_423a6221e6a26c6a'] != []:
        return 'schema_invalid'
    return None


def sc_28e3dfae076c5410(value, context):
    if value['sc_28e3dfae076c5410'] != []:
        return 'schema_invalid'
    return None


def sc_33546a22b7225e39(value, context):
    if value['sc_33546a22b7225e39'] != []:
        return 'schema_invalid'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sc_f919e00acc5fce1a', g.Invariant('/payload_redaction_applied/', 'type at owner schema /type'), 'schema_invalid', sc_f919e00acc5fce1a),
        g.Guard('sc_c937a72a3b0c2b2b', g.Invariant('/payload_redaction_applied/', 'required at owner schema /required/project_id'), 'schema_invalid', sc_c937a72a3b0c2b2b),
        g.Guard('sc_3d04235f17f95e14', g.Invariant('/payload_redaction_applied/', 'required at owner schema /required/continuity_id'), 'schema_invalid', sc_3d04235f17f95e14),
        g.Guard('sc_ed89b9921cdde836', g.Invariant('/payload_redaction_applied/', 'required at owner schema /required/stream_id'), 'schema_invalid', sc_ed89b9921cdde836),
        g.Guard('sc_063add45bfc27d83', g.Invariant('/payload_redaction_applied/', 'required at owner schema /required/fact_ref'), 'schema_invalid', sc_063add45bfc27d83),
        g.Guard('sc_423a6221e6a26c6a', g.Invariant('/payload_redaction_applied/', 'required at owner schema /required/actor_ref'), 'schema_invalid', sc_423a6221e6a26c6a),
        g.Guard('sc_28e3dfae076c5410', g.Invariant('/payload_redaction_applied/', 'required at owner schema /required/actor_kind'), 'schema_invalid', sc_28e3dfae076c5410),
        g.Guard('sc_33546a22b7225e39', g.Invariant('/payload_redaction_applied/', 'required at owner schema /required/source_event_id'), 'schema_invalid', sc_33546a22b7225e39),
    ])

    def check(value):
        table.require('sc_f919e00acc5fce1a', value, context)
        table.require('sc_c937a72a3b0c2b2b', value, context)
        table.require('sc_3d04235f17f95e14', value, context)
        table.require('sc_ed89b9921cdde836', value, context)
        table.require('sc_063add45bfc27d83', value, context)
        table.require('sc_423a6221e6a26c6a', value, context)
        table.require('sc_28e3dfae076c5410', value, context)
        table.require('sc_33546a22b7225e39', value, context)
        return True
    return g.Case(table, check, context)
