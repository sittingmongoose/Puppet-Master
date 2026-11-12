"""DO guard suite `board_application_source_13` (sweep part 2A). Board source, application scope: custody, digests, stage evidence and message copies (CV-740, SP-720..723).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def source_stage_method(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    source = value['source']
    for stage in source['stage_custody'].values():
        if stage['owner_method_id'] != source['interface_id']:
            return 'source_stage_method'
    return None


def accepted_source_witness_ref(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'accepted_original_source_join' if value['witness'].get('ref') != value['source']['accepted_source_ref'] else None


def accepted_source_witness_value(value, context):
    # The original's one `a or b or c` clause, split with its short-circuit order: this row reads the witness value
    # only where the witness ref holds.
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    if value['witness'].get('ref') != value['source']['accepted_source_ref']:
        return None
    return 'accepted_original_source_join' if value['typed_witness_value'] != value['typed_message'] else None


def accepted_source_sha256(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    if value['witness'].get('ref') != value['source']['accepted_source_ref'] or value['typed_witness_value'] != value['typed_message']:
        return None
    return 'accepted_original_source_join' if value['source']['accepted_source_sha256'] != value['expected_accepted_sha256'] else None


def wrapper_physical_digest(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'wrapper_physical_digest' if value['physical_record_sha256'] != value['expected_physical_sha256'] else None


ROWS = (
    ('source_stage_method', '/source/stage_custody/*/owner_method_id', "equals the source's interface_id",
     'source_stage_method', source_stage_method, ('source', 'board_branch', 'application_shape_valid'), None),
    ('accepted_source_witness_ref', '/accepted_source_witness/ref', "equals the source's accepted_source_ref",
     'accepted_original_source_join', accepted_source_witness_ref, ('witness', 'source', 'board_branch', 'application_shape_valid'), 'accepted_join'),
    ('accepted_source_witness_value', '/accepted_source_witness/value', 'is a typed copy of the original message',
     'accepted_original_source_join', accepted_source_witness_value, ('typed_witness_value', 'typed_message', 'board_branch', 'application_shape_valid', 'witness', 'source'), 'accepted_join'),
    ('accepted_source_sha256', '/source/accepted_source_sha256', "equals the hash of the witness's value",
     'accepted_original_source_join', accepted_source_sha256, ('source', 'expected_accepted_sha256', 'board_branch', 'application_shape_valid', 'witness', 'typed_witness_value', 'typed_message'), 'accepted_join'),
    ('wrapper_physical_digest', '/physical_record_sha256', 'equals the SHA-256 of the packed wrapper',
     'wrapper_physical_digest', wrapper_physical_digest, ('physical_record_sha256', 'expected_physical_sha256', 'board_branch', 'application_shape_valid'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('source_stage_method', g.Invariant('/source/stage_custody/*/owner_method_id', "equals the source's interface_id"), 'source_stage_method', source_stage_method),
        g.Guard('accepted_source_witness_ref', g.Invariant('/accepted_source_witness/ref', "equals the source's accepted_source_ref"), 'accepted_original_source_join', accepted_source_witness_ref),
        g.Guard('accepted_source_witness_value', g.Invariant('/accepted_source_witness/value', 'is a typed copy of the original message'), 'accepted_original_source_join', accepted_source_witness_value),
        g.Guard('accepted_source_sha256', g.Invariant('/source/accepted_source_sha256', "equals the hash of the witness's value"), 'accepted_original_source_join', accepted_source_sha256),
        g.Guard('wrapper_physical_digest', g.Invariant('/physical_record_sha256', 'equals the SHA-256 of the packed wrapper'), 'wrapper_physical_digest', wrapper_physical_digest),
    ])
    context = None

    def check(complete):
        table.require('source_stage_method', complete, context)
        table.require('accepted_source_witness_ref', complete, context)
        table.require('accepted_source_witness_value', complete, context)
        table.require('accepted_source_sha256', complete, context)
        table.require('wrapper_physical_digest', complete, context)
        return True
    return g.Case(table, check, context)
