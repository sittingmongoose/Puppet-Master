"""DO guard suite `board_application_source_15` (sweep part 2A). Board source, application scope: custody, digests, stage evidence and message copies (CV-740, SP-720..723).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g

REQUIRED_STAGES = ('original_intent', 'accepted_original_source', 'current_owner_and_stop_fence',
                   'canonical_pending_or_reservation', 'owner_commit')


def stage_witness_value(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    custody, witnesses = value['source']['stage_custody'], value['stage_witnesses']
    for name in REQUIRED_STAGES:
        stage = custody[name]
        proof = stage['custody_evidence']
        if proof is None or stage['request_ref'] is None or stage['result_ref'] is None:
            continue
        witness = witnesses.get(name, {})
        if type(witness) is not dict or witness.get('ref') != proof.get('source_ref'):
            continue
        expected = value['stage_expected'][name]
        if expected['typed_witness'] != expected['typed_expected']:
            return 'source_stage_evidence'
    return None


def stage_witness_sha256(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    custody, witnesses = value['source']['stage_custody'], value['stage_witnesses']
    for name in REQUIRED_STAGES:
        stage = custody[name]
        proof = stage['custody_evidence']
        if proof is None or stage['request_ref'] is None or stage['result_ref'] is None:
            continue
        witness = witnesses.get(name, {})
        expected = value['stage_expected'][name]
        if type(witness) is not dict or witness.get('ref') != proof.get('source_ref') or expected['typed_witness'] != expected['typed_expected']:
            continue
        if proof.get('source_sha256') != expected['witness_sha256']:
            return 'source_stage_evidence'
    return None


def message_thread_id(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'message_thread_id' if value['message']['thread_id'] != value['payload']['thread_id'] else None


def message_crew_id(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'message_crew_id' if value['message']['crew_id'] != value['payload']['crew_id'] else None


def message_run_id(value, context):
    if value['board_branch'] != 'application' or value['application_shape_valid'] is not True:
        return None
    return 'message_run_id' if value['message']['run_id'] != value['payload']['run_id'] else None


ROWS = (
    ('stage_witness_value', '/stage_evidence_witnesses/{required}/value', 'is a typed copy of the stage witness recomputed from the case',
     'source_stage_evidence', stage_witness_value, ('stage_expected', 'board_branch', 'application_shape_valid', 'source', 'stage_witnesses'), 'stage_evidence'),
    ('stage_witness_sha256', '/source/stage_custody/{required}/custody_evidence/source_sha256', "equals the hash of the stage witness's value",
     'source_stage_evidence', stage_witness_sha256, ('source', 'stage_expected', 'board_branch', 'application_shape_valid', 'stage_witnesses'), 'stage_evidence'),
    ('message_thread_id', '/source/original_input/thread_id', "equals the payload's",
     'message_thread_id', message_thread_id, ('message', 'payload', 'board_branch', 'application_shape_valid'), None),
    ('message_crew_id', '/source/original_input/crew_id', "equals the payload's",
     'message_crew_id', message_crew_id, ('message', 'payload', 'board_branch', 'application_shape_valid'), None),
    ('message_run_id', '/source/original_input/run_id', "equals the payload's",
     'message_run_id', message_run_id, ('message', 'payload', 'board_branch', 'application_shape_valid'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('stage_witness_value', g.Invariant('/stage_evidence_witnesses/{required}/value', 'is a typed copy of the stage witness recomputed from the case'), 'source_stage_evidence', stage_witness_value),
        g.Guard('stage_witness_sha256', g.Invariant('/source/stage_custody/{required}/custody_evidence/source_sha256', "equals the hash of the stage witness's value"), 'source_stage_evidence', stage_witness_sha256),
        g.Guard('message_thread_id', g.Invariant('/source/original_input/thread_id', "equals the payload's"), 'message_thread_id', message_thread_id),
        g.Guard('message_crew_id', g.Invariant('/source/original_input/crew_id', "equals the payload's"), 'message_crew_id', message_crew_id),
        g.Guard('message_run_id', g.Invariant('/source/original_input/run_id', "equals the payload's"), 'message_run_id', message_run_id),
    ])
    context = None

    def check(complete):
        table.require('stage_witness_value', complete, context)
        table.require('stage_witness_sha256', complete, context)
        table.require('message_thread_id', complete, context)
        table.require('message_crew_id', complete, context)
        table.require('message_run_id', complete, context)
        return True
    return g.Case(table, check, context)
