"""DO guard suite `board_application_source_14` (sweep part 2A). Board source, application scope: custody, digests, stage evidence and message copies (CV-740, SP-720..723).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g

REQUIRED_STAGES = ('original_intent', 'accepted_original_source', 'current_owner_and_stop_fence',
                   'canonical_pending_or_reservation', 'owner_commit')


def source_stage_status(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    custody = value['source']['stage_custody']
    for name in REQUIRED_STAGES:
        if custody[name]['status'] != 'accepted':
            return 'source_stage_status'
    return None


def stage_evidence_present(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    custody = value['source']['stage_custody']
    for name in REQUIRED_STAGES:
        if custody[name]['custody_evidence'] is None:
            return 'source_stage_evidence'
    return None


def stage_request_ref(value, context):
    # The original's per-stage `a or b or ... or f` clause, split with its short-circuit order.
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    custody = value['source']['stage_custody']
    for name in REQUIRED_STAGES:
        stage = custody[name]
        if stage['custody_evidence'] is not None and stage['request_ref'] is None:
            return 'source_stage_evidence'
    return None


def stage_result_ref(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    custody = value['source']['stage_custody']
    for name in REQUIRED_STAGES:
        stage = custody[name]
        if stage['custody_evidence'] is not None and stage['request_ref'] is not None and stage['result_ref'] is None:
            return 'source_stage_evidence'
    return None


def stage_witness_ref(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    custody = value['source']['stage_custody']
    witnesses = value['stage_witnesses']
    for name in REQUIRED_STAGES:
        stage = custody[name]
        proof = stage['custody_evidence']
        if proof is None or stage['request_ref'] is None or stage['result_ref'] is None:
            continue
        if name not in witnesses:
            return 'source_stage_evidence'
        witness = witnesses[name]
        if type(witness) is not dict or witness.get('ref') != proof.get('source_ref'):
            return 'source_stage_evidence'
    return None


ROWS = (
    ('source_stage_status', '/source/stage_custody/{required}/status', "is 'accepted' in each of the five required stages",
     'source_stage_status', source_stage_status, ('source', 'board_branch', 'application_shape_valid'), None),
    ('stage_evidence_present', '/source/stage_custody/{required}/custody_evidence', 'is present',
     'source_stage_evidence', stage_evidence_present, ('source', 'board_branch', 'application_shape_valid'), 'stage_evidence'),
    ('stage_request_ref', '/source/stage_custody/{required}/request_ref', 'is present',
     'source_stage_evidence', stage_request_ref, ('source', 'board_branch', 'application_shape_valid'), 'stage_evidence'),
    ('stage_result_ref', '/source/stage_custody/{required}/result_ref', 'is present',
     'source_stage_evidence', stage_result_ref, ('source', 'board_branch', 'application_shape_valid'), 'stage_evidence'),
    ('stage_witness_ref', '/stage_evidence_witnesses/{required}/ref', "equals the stage evidence's source_ref",
     'source_stage_evidence', stage_witness_ref, ('source', 'stage_witnesses', 'board_branch', 'application_shape_valid'), 'stage_evidence'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('source_stage_status', g.Invariant('/source/stage_custody/{required}/status', "is 'accepted' in each of the five required stages"), 'source_stage_status', source_stage_status),
        g.Guard('stage_evidence_present', g.Invariant('/source/stage_custody/{required}/custody_evidence', 'is present'), 'source_stage_evidence', stage_evidence_present),
        g.Guard('stage_request_ref', g.Invariant('/source/stage_custody/{required}/request_ref', 'is present'), 'source_stage_evidence', stage_request_ref),
        g.Guard('stage_result_ref', g.Invariant('/source/stage_custody/{required}/result_ref', 'is present'), 'source_stage_evidence', stage_result_ref),
        g.Guard('stage_witness_ref', g.Invariant('/stage_evidence_witnesses/{required}/ref', "equals the stage evidence's source_ref"), 'source_stage_evidence', stage_witness_ref),
    ])
    context = None

    def check(complete):
        table.require('source_stage_status', complete, context)
        table.require('stage_evidence_present', complete, context)
        table.require('stage_request_ref', complete, context)
        table.require('stage_result_ref', complete, context)
        table.require('stage_witness_ref', complete, context)
        return True
    return g.Case(table, check, context)
