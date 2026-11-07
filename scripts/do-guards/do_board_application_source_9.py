"""DO guard suite `board_application_source_9` (sweep part 2A). Board source, application scope: custody, digests, stage evidence and message copies (CV-740, SP-720..723).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g

REQUIRED_STAGES = ('original_intent', 'accepted_original_source', 'current_owner_and_stop_fence',
                   'canonical_pending_or_reservation', 'owner_commit')


def accepted_source_witness_value(value, context):
    return 'accepted_original_source_join' if value['typed_witness_value'] != value['typed_message'] else None


def accepted_source_sha256(value, context):
    return 'accepted_original_source_join' if value['source']['accepted_source_sha256'] != value['expected_accepted_sha256'] else None


def wrapper_physical_digest(value, context):
    return 'wrapper_physical_digest' if value['physical_record_sha256'] != value['expected_physical_sha256'] else None


def source_stage_status(value, context):
    custody = value['source']['stage_custody']
    for name in REQUIRED_STAGES:
        if custody[name]['status'] != 'accepted':
            return 'source_stage_status'
    return None


def stage_evidence_present(value, context):
    custody = value['source']['stage_custody']
    for name in REQUIRED_STAGES:
        if custody[name]['custody_evidence'] is None:
            return 'source_stage_evidence'
    return None


ROWS = (
    ('accepted_source_witness_value', '/accepted_source_witness/value', 'is a typed copy of the original message',
     'accepted_original_source_join', accepted_source_witness_value, ('typed_witness_value', 'typed_message'), 'accepted_join'),
    ('accepted_source_sha256', '/source/accepted_source_sha256', "equals the hash of the witness's value",
     'accepted_original_source_join', accepted_source_sha256, ('source', 'expected_accepted_sha256'), 'accepted_join'),
    ('wrapper_physical_digest', '/physical_record_sha256', 'equals the SHA-256 of the packed wrapper',
     'wrapper_physical_digest', wrapper_physical_digest, ('physical_record_sha256', 'expected_physical_sha256'), None),
    ('source_stage_status', '/source/stage_custody/{required}/status', "is 'accepted' in each of the five required stages",
     'source_stage_status', source_stage_status, ('source',), None),
    ('stage_evidence_present', '/source/stage_custody/{required}/custody_evidence', 'is present',
     'source_stage_evidence', stage_evidence_present, ('source',), 'stage_evidence'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('accepted_source_witness_value', g.Invariant('/accepted_source_witness/value', 'is a typed copy of the original message'), 'accepted_original_source_join', accepted_source_witness_value),
        g.Guard('accepted_source_sha256', g.Invariant('/source/accepted_source_sha256', "equals the hash of the witness's value"), 'accepted_original_source_join', accepted_source_sha256),
        g.Guard('wrapper_physical_digest', g.Invariant('/physical_record_sha256', 'equals the SHA-256 of the packed wrapper'), 'wrapper_physical_digest', wrapper_physical_digest),
        g.Guard('source_stage_status', g.Invariant('/source/stage_custody/{required}/status', "is 'accepted' in each of the five required stages"), 'source_stage_status', source_stage_status),
        g.Guard('stage_evidence_present', g.Invariant('/source/stage_custody/{required}/custody_evidence', 'is present'), 'source_stage_evidence', stage_evidence_present),
    ])
    context = None

    def check(complete):
        table.require('accepted_source_witness_value', complete, context)
        table.require('accepted_source_sha256', complete, context)
        table.require('wrapper_physical_digest', complete, context)
        table.require('source_stage_status', complete, context)
        table.require('stage_evidence_present', complete, context)
        return True
    return g.Case(table, check, context)
