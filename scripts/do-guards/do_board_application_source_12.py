"""DO guard suite `board_application_source_12` (sweep part 2A). Board source, application scope: custody, digests, stage evidence and message copies (CV-740, SP-720..723).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def wrapper_record_join(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'source_original_join' if value['typed_wrapper_record'] != value['typed_message'] else None


def source_input_digest(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'source_input_digest' if value['source']['original_input_semantic_sha256'] != value['expected_input_digest'] else None


def source_output_digest(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'source_output_digest' if value['source']['original_output_semantic_sha256'] != value['expected_output_digest'] else None


def source_digest(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'source_digest' if value['source']['source_sha256'] != value['expected_source_digest'] else None


def source_stage_operation(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    source = value['source']
    for stage in source['stage_custody'].values():
        if stage['original_operation_id'] != source['original_operation_id']:
            return 'source_stage_operation'
    return None


ROWS = (
    ('wrapper_record_join', '/wrapper/record', 'is a typed copy of the original message',
     'source_original_join', wrapper_record_join, ('typed_wrapper_record', 'typed_message', 'board_branch', 'application_shape_valid'), 'original_join'),
    ('source_input_digest', '/source/original_input_semantic_sha256', 'equals the accepted_source semantic hash of the original message',
     'source_input_digest', source_input_digest, ('source', 'expected_input_digest', 'board_branch', 'application_shape_valid'), None),
    ('source_output_digest', '/source/original_output_semantic_sha256', 'equals the hash of the original output (null for none)',
     'source_output_digest', source_output_digest, ('source', 'expected_output_digest', 'board_branch', 'application_shape_valid'), None),
    ('source_digest', '/source/source_sha256', 'equals the hash of the rest of the source',
     'source_digest', source_digest, ('source', 'expected_source_digest', 'board_branch', 'application_shape_valid'), None),
    ('source_stage_operation', '/source/stage_custody/*/original_operation_id', "equals the source's",
     'source_stage_operation', source_stage_operation, ('source', 'board_branch', 'application_shape_valid'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('wrapper_record_join', g.Invariant('/wrapper/record', 'is a typed copy of the original message'), 'source_original_join', wrapper_record_join),
        g.Guard('source_input_digest', g.Invariant('/source/original_input_semantic_sha256', 'equals the accepted_source semantic hash of the original message'), 'source_input_digest', source_input_digest),
        g.Guard('source_output_digest', g.Invariant('/source/original_output_semantic_sha256', 'equals the hash of the original output (null for none)'), 'source_output_digest', source_output_digest),
        g.Guard('source_digest', g.Invariant('/source/source_sha256', 'equals the hash of the rest of the source'), 'source_digest', source_digest),
        g.Guard('source_stage_operation', g.Invariant('/source/stage_custody/*/original_operation_id', "equals the source's"), 'source_stage_operation', source_stage_operation),
    ])
    context = None

    def check(complete):
        table.require('wrapper_record_join', complete, context)
        table.require('source_input_digest', complete, context)
        table.require('source_output_digest', complete, context)
        table.require('source_digest', complete, context)
        table.require('source_stage_operation', complete, context)
        return True
    return g.Case(table, check, context)
