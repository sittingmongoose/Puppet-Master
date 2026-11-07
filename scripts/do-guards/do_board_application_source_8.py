"""DO guard suite `board_application_source_8` (sweep part 2A). Board source, application scope: custody, digests, stage evidence and message copies (CV-740, SP-720..723).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def source_output_digest(value, context):
    return 'source_output_digest' if value['source']['original_output_semantic_sha256'] != value['expected_output_digest'] else None


def source_digest(value, context):
    return 'source_digest' if value['source']['source_sha256'] != value['expected_source_digest'] else None


def source_stage_operation(value, context):
    source = value['source']
    for stage in source['stage_custody'].values():
        if stage['original_operation_id'] != source['original_operation_id']:
            return 'source_stage_operation'
    return None


def source_stage_method(value, context):
    source = value['source']
    for stage in source['stage_custody'].values():
        if stage['owner_method_id'] != source['interface_id']:
            return 'source_stage_method'
    return None


def accepted_source_witness_ref(value, context):
    return 'accepted_original_source_join' if value['witness'].get('ref') != value['source']['accepted_source_ref'] else None


ROWS = (
    ('source_output_digest', '/source/original_output_semantic_sha256', 'equals the hash of the original output (null for none)',
     'source_output_digest', source_output_digest, ('source', 'expected_output_digest'), None),
    ('source_digest', '/source/source_sha256', 'equals the hash of the rest of the source',
     'source_digest', source_digest, ('source', 'expected_source_digest'), None),
    ('source_stage_operation', '/source/stage_custody/*/original_operation_id', "equals the source's",
     'source_stage_operation', source_stage_operation, ('source',), None),
    ('source_stage_method', '/source/stage_custody/*/owner_method_id', "equals the source's interface_id",
     'source_stage_method', source_stage_method, ('source',), None),
    ('accepted_source_witness_ref', '/accepted_source_witness/ref', "equals the source's accepted_source_ref",
     'accepted_original_source_join', accepted_source_witness_ref, ('witness', 'source'), 'accepted_join'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('source_output_digest', g.Invariant('/source/original_output_semantic_sha256', 'equals the hash of the original output (null for none)'), 'source_output_digest', source_output_digest),
        g.Guard('source_digest', g.Invariant('/source/source_sha256', 'equals the hash of the rest of the source'), 'source_digest', source_digest),
        g.Guard('source_stage_operation', g.Invariant('/source/stage_custody/*/original_operation_id', "equals the source's"), 'source_stage_operation', source_stage_operation),
        g.Guard('source_stage_method', g.Invariant('/source/stage_custody/*/owner_method_id', "equals the source's interface_id"), 'source_stage_method', source_stage_method),
        g.Guard('accepted_source_witness_ref', g.Invariant('/accepted_source_witness/ref', "equals the source's accepted_source_ref"), 'accepted_original_source_join', accepted_source_witness_ref),
    ])
    context = None

    def check(complete):
        table.require('source_output_digest', complete, context)
        table.require('source_digest', complete, context)
        table.require('source_stage_operation', complete, context)
        table.require('source_stage_method', complete, context)
        table.require('accepted_source_witness_ref', complete, context)
        return True
    return g.Case(table, check, context)
