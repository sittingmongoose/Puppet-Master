"""One coordination guard table."""
import pm_guard_isolation as g

def p_0(value, context):
    return None if value['payload_schema_invalid'] is True else 'payload_schema_invalid'

def p_1(value, context):
    return None if value['payload_schema_uri'] is True else 'payload_schema_uri'

def p_2(value, context):
    return None if value['payload_schema_definition_census'] is True else 'payload_schema_definition_census'

def p_3(value, context):
    return None if value['payload_schema_root_members'] is True else 'payload_schema_root_members'

def p_4(value, context):
    return None if value['lineage_envelope_fields'] is True else 'lineage_envelope_fields'

def p_5(value, context):
    return None if value['payload_definition_schema_id'] is True else 'payload_definition_schema_id'

def p_6(value, context):
    return None if value['payload_definition_not_closed'] is True else 'payload_definition_not_closed'

def p_7(value, context):
    return None if value['payload_definition_schema_version'] is True else 'payload_definition_schema_version'

def p_8(value, context):
    return None if value['payload_definition_fields_differ_from_contracts_row'] is True else 'payload_definition_fields_differ_from_contracts_row'

def p_9(value, context):
    return None if value['payload_definition_required_fields'] is True else 'payload_definition_required_fields'

def p_10(value, context):
    return None if value['payload_definition_lineage_envelope'] is True else 'payload_definition_lineage_envelope'

def p_11(value, context):
    return None if value['closed_domain'] is True else 'closed_domain'

def p_12(value, context):
    return None if value['platform_pattern'] is True else 'platform_pattern'

def p_13(value, context):
    return None if value['path_ref_pattern'] is True else 'path_ref_pattern'

def p_14(value, context):
    return None if value['project_payload_reference_not_isolated'] is True else 'project_payload_reference_not_isolated'

def p_15(value, context):
    return None if value['payload_schema_admits_null'] is True else 'payload_schema_admits_null'

def p_16(value, context):
    return None if value['application_integer_bounds_match'] is True else 'application_integer_bounds_match'

def payload_schema_case():
    table = g.GuardTable([
        g.Guard('payload_schema_invalid', g.Invariant('/payload_schema_invalid', 'the payload schema invalid observation holds'), 'payload_schema_invalid', p_0),
        g.Guard('payload_schema_uri', g.Invariant('/payload_schema_uri', 'the payload schema uri observation holds'), 'payload_schema_uri', p_1),
        g.Guard('payload_schema_definition_census', g.Invariant('/payload_schema_definition_census', 'the payload schema definition census observation holds'), 'payload_schema_definition_census', p_2),
        g.Guard('payload_schema_root_members', g.Invariant('/payload_schema_root_members', 'the payload schema root members observation holds'), 'payload_schema_root_members', p_3),
        g.Guard('lineage_envelope_fields', g.Invariant('/lineage_envelope_fields', 'the lineage envelope fields observation holds'), 'lineage_envelope_fields', p_4),
        g.Guard('payload_definition_schema_id', g.Invariant('/payload_definition_schema_id', 'the payload definition schema id observation holds'), 'payload_definition_schema_id', p_5),
        g.Guard('payload_definition_not_closed', g.Invariant('/payload_definition_not_closed', 'the payload definition not closed observation holds'), 'payload_definition_not_closed', p_6),
        g.Guard('payload_definition_schema_version', g.Invariant('/payload_definition_schema_version', 'the payload definition schema version observation holds'), 'payload_definition_schema_version', p_7),
        g.Guard('payload_definition_fields_differ_from_contracts_row', g.Invariant('/payload_definition_fields_differ_from_contracts_row', 'the payload definition fields differ from contracts row observation holds'), 'payload_definition_fields_differ_from_contracts_row', p_8),
        g.Guard('payload_definition_required_fields', g.Invariant('/payload_definition_required_fields', 'the payload definition required fields observation holds'), 'payload_definition_required_fields', p_9),
        g.Guard('payload_definition_lineage_envelope', g.Invariant('/payload_definition_lineage_envelope', 'the payload definition lineage envelope observation holds'), 'payload_definition_lineage_envelope', p_10),
        g.Guard('closed_domain', g.Invariant('/closed_domain', 'the closed domain observation holds'), 'closed_domain', p_11),
        g.Guard('platform_pattern', g.Invariant('/platform_pattern', 'the platform pattern observation holds'), 'platform_pattern', p_12),
        g.Guard('path_ref_pattern', g.Invariant('/path_ref_pattern', 'the path ref pattern observation holds'), 'path_ref_pattern', p_13),
        g.Guard('project_payload_reference_not_isolated', g.Invariant('/project_payload_reference_not_isolated', 'the project payload reference not isolated observation holds'), 'project_payload_reference_not_isolated', p_14),
        g.Guard('payload_schema_admits_null', g.Invariant('/payload_schema_admits_null', 'the payload schema admits null observation holds'), 'payload_schema_admits_null', p_15),
        g.Guard('application_integer_bounds_match', g.Invariant('/application_integer_bounds_match', 'the application integer bounds match observation holds'), 'application_integer_bounds_match', p_16),
    ])
    def check(value):
        table.require('payload_schema_invalid', value)
        table.require('payload_schema_uri', value)
        table.require('payload_schema_definition_census', value)
        table.require('payload_schema_root_members', value)
        table.require('lineage_envelope_fields', value)
        table.require('payload_definition_schema_id', value)
        table.require('payload_definition_not_closed', value)
        table.require('payload_definition_schema_version', value)
        table.require('payload_definition_fields_differ_from_contracts_row', value)
        table.require('payload_definition_required_fields', value)
        table.require('payload_definition_lineage_envelope', value)
        table.require('closed_domain', value)
        table.require('platform_pattern', value)
        table.require('path_ref_pattern', value)
        table.require('project_payload_reference_not_isolated', value)
        table.require('payload_schema_admits_null', value)
        table.require('application_integer_bounds_match', value)
        return True
    return g.Case(table, check)

