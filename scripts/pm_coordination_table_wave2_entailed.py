"""One coordination guard table."""
import pm_guard_isolation as g

def p_0(value, context):
    return None if value['threshold_oracle_evaluation'] is True else 'threshold_oracle_evaluation'

def p_1(value, context):
    return None if value['schema_mutation_unknown_definition'] is True else 'schema_mutation_unknown_definition'

def p_2(value, context):
    return None if value['schema_mutation_project_null'] is True else 'schema_mutation_project_null'

def p_3(value, context):
    return None if value['schema_mutation_project_app_ref'] is True else 'schema_mutation_project_app_ref'

def p_4(value, context):
    return None if value['schema_mutation_helper_app_ref'] is True else 'schema_mutation_helper_app_ref'

def p_5(value, context):
    return None if value['full_checker_mutation_unknown_definition'] is True else 'full_checker_mutation_unknown_definition'

def p_6(value, context):
    return None if value['full_checker_mutation_project_null'] is True else 'full_checker_mutation_project_null'

def p_7(value, context):
    return None if value['full_checker_mutation_project_app_ref'] is True else 'full_checker_mutation_project_app_ref'

def p_8(value, context):
    return None if value['full_checker_mutation_helper_app_ref'] is True else 'full_checker_mutation_helper_app_ref'

def p_9(value, context):
    return None if value['projection_mutation_rogue'] is True else 'projection_mutation_rogue'

def p_10(value, context):
    return None if value['projection_mutation_rogue_application'] is True else 'projection_mutation_rogue_application'

def p_11(value, context):
    return None if value['threshold_mutation_missing'] is True else 'threshold_mutation_missing'

def p_12(value, context):
    return None if value['threshold_mutation_empty'] is True else 'threshold_mutation_empty'

def p_13(value, context):
    return None if value['threshold_mutation_incomplete'] is True else 'threshold_mutation_incomplete'

def p_14(value, context):
    return None if value['threshold_mutation_wrong_expectation'] is True else 'threshold_mutation_wrong_expectation'

def p_15(value, context):
    return None if value['threshold_mutation_integer_boolean'] is True else 'threshold_mutation_integer_boolean'

def p_16(value, context):
    return None if value['extension_probe'] is True else 'extension_probe'

def p_17(value, context):
    return None if value['project_null_probe'] is True else 'project_null_probe'

def p_18(value, context):
    return None if value['application_definition_in_project_composition'] is True else 'application_definition_in_project_composition'

def wave2_entailed_case():
    table = g.GuardTable([
        g.Guard('threshold_oracle_evaluation', g.Invariant('/threshold_oracle_evaluation', 'the threshold oracle evaluation observation holds'), 'threshold_oracle_evaluation', p_0),
        g.Guard('schema_mutation_unknown_definition', g.Invariant('/schema_mutation_unknown_definition', 'the schema mutation unknown definition observation holds'), 'schema_mutation_unknown_definition', p_1),
        g.Guard('schema_mutation_project_null', g.Invariant('/schema_mutation_project_null', 'the schema mutation project null observation holds'), 'schema_mutation_project_null', p_2),
        g.Guard('schema_mutation_project_app_ref', g.Invariant('/schema_mutation_project_app_ref', 'the schema mutation project app ref observation holds'), 'schema_mutation_project_app_ref', p_3),
        g.Guard('schema_mutation_helper_app_ref', g.Invariant('/schema_mutation_helper_app_ref', 'the schema mutation helper app ref observation holds'), 'schema_mutation_helper_app_ref', p_4),
        g.Guard('full_checker_mutation_unknown_definition', g.Invariant('/full_checker_mutation_unknown_definition', 'the full checker mutation unknown definition observation holds'), 'full_checker_mutation_unknown_definition', p_5),
        g.Guard('full_checker_mutation_project_null', g.Invariant('/full_checker_mutation_project_null', 'the full checker mutation project null observation holds'), 'full_checker_mutation_project_null', p_6),
        g.Guard('full_checker_mutation_project_app_ref', g.Invariant('/full_checker_mutation_project_app_ref', 'the full checker mutation project app ref observation holds'), 'full_checker_mutation_project_app_ref', p_7),
        g.Guard('full_checker_mutation_helper_app_ref', g.Invariant('/full_checker_mutation_helper_app_ref', 'the full checker mutation helper app ref observation holds'), 'full_checker_mutation_helper_app_ref', p_8),
        g.Guard('projection_mutation_rogue', g.Invariant('/projection_mutation_rogue', 'the projection mutation rogue observation holds'), 'projection_mutation_rogue', p_9),
        g.Guard('projection_mutation_rogue_application', g.Invariant('/projection_mutation_rogue_application', 'the projection mutation rogue application observation holds'), 'projection_mutation_rogue_application', p_10),
        g.Guard('threshold_mutation_missing', g.Invariant('/threshold_mutation_missing', 'the threshold mutation missing observation holds'), 'threshold_mutation_missing', p_11),
        g.Guard('threshold_mutation_empty', g.Invariant('/threshold_mutation_empty', 'the threshold mutation empty observation holds'), 'threshold_mutation_empty', p_12),
        g.Guard('threshold_mutation_incomplete', g.Invariant('/threshold_mutation_incomplete', 'the threshold mutation incomplete observation holds'), 'threshold_mutation_incomplete', p_13),
        g.Guard('threshold_mutation_wrong_expectation', g.Invariant('/threshold_mutation_wrong_expectation', 'the threshold mutation wrong expectation observation holds'), 'threshold_mutation_wrong_expectation', p_14),
        g.Guard('threshold_mutation_integer_boolean', g.Invariant('/threshold_mutation_integer_boolean', 'the threshold mutation integer boolean observation holds'), 'threshold_mutation_integer_boolean', p_15),
        g.Guard('extension_probe', g.Invariant('/extension_probe', 'the extension probe observation holds'), 'extension_probe', p_16),
        g.Guard('project_null_probe', g.Invariant('/project_null_probe', 'the project null probe observation holds'), 'project_null_probe', p_17),
        g.Guard('application_definition_in_project_composition', g.Invariant('/application_definition_in_project_composition', 'the application definition in project composition observation holds'), 'application_definition_in_project_composition', p_18),
    ])
    def check(value):
        table.require('threshold_oracle_evaluation', value)
        table.require('schema_mutation_unknown_definition', value)
        table.require('schema_mutation_project_null', value)
        table.require('schema_mutation_project_app_ref', value)
        table.require('schema_mutation_helper_app_ref', value)
        table.require('full_checker_mutation_unknown_definition', value)
        table.require('full_checker_mutation_project_null', value)
        table.require('full_checker_mutation_project_app_ref', value)
        table.require('full_checker_mutation_helper_app_ref', value)
        table.require('projection_mutation_rogue', value)
        table.require('projection_mutation_rogue_application', value)
        table.require('threshold_mutation_missing', value)
        table.require('threshold_mutation_empty', value)
        table.require('threshold_mutation_incomplete', value)
        table.require('threshold_mutation_wrong_expectation', value)
        table.require('threshold_mutation_integer_boolean', value)
        table.require('extension_probe', value)
        table.require('project_null_probe', value)
        table.require('application_definition_in_project_composition', value)
        return True
    return g.Case(table, check)

