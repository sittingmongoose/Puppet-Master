"""DO guard suite `board_application_source_10` (sweep part 2A). Board source, application scope: custody, digests, stage evidence and message copies (CV-740, SP-720..723).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g

REQUIRED_STAGES = ('original_intent', 'accepted_original_source', 'current_owner_and_stop_fence',
                   'canonical_pending_or_reservation', 'owner_commit')


def stage_request_ref(value, context):
    custody = value['source']['stage_custody']
    for name in REQUIRED_STAGES:
        if custody[name]['request_ref'] is None:
            return 'source_stage_evidence'
    return None


def stage_result_ref(value, context):
    custody = value['source']['stage_custody']
    for name in REQUIRED_STAGES:
        if custody[name]['result_ref'] is None:
            return 'source_stage_evidence'
    return None


def stage_witness_ref(value, context):
    custody, witnesses = value['source']['stage_custody'], value['stage_witnesses']
    for name in REQUIRED_STAGES:
        proof = custody[name]['custody_evidence']
        witness = witnesses.get(name, {})
        if witness.get('ref') != (proof or {}).get('source_ref'):
            return 'source_stage_evidence'
    return None


def stage_witness_value(value, context):
    for name in REQUIRED_STAGES:
        expected = value['stage_expected'][name]
        if expected['typed_witness'] != expected['typed_expected']:
            return 'source_stage_evidence'
    return None


def stage_witness_sha256(value, context):
    custody = value['source']['stage_custody']
    for name in REQUIRED_STAGES:
        proof = custody[name]['custody_evidence']
        if (proof or {}).get('source_sha256') != value['stage_expected'][name]['witness_sha256']:
            return 'source_stage_evidence'
    return None


ROWS = (
    ('stage_request_ref', '/source/stage_custody/{required}/request_ref', 'is present',
     'source_stage_evidence', stage_request_ref, ('source',), 'stage_evidence'),
    ('stage_result_ref', '/source/stage_custody/{required}/result_ref', 'is present',
     'source_stage_evidence', stage_result_ref, ('source',), 'stage_evidence'),
    ('stage_witness_ref', '/stage_evidence_witnesses/{required}/ref', "equals the stage evidence's source_ref",
     'source_stage_evidence', stage_witness_ref, ('source', 'stage_witnesses'), 'stage_evidence'),
    ('stage_witness_value', '/stage_evidence_witnesses/{required}/value', 'is a typed copy of the stage witness recomputed from the case',
     'source_stage_evidence', stage_witness_value, ('stage_expected',), 'stage_evidence'),
    ('stage_witness_sha256', '/source/stage_custody/{required}/custody_evidence/source_sha256', "equals the hash of the stage witness's value",
     'source_stage_evidence', stage_witness_sha256, ('source', 'stage_expected'), 'stage_evidence'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('stage_request_ref', g.Invariant('/source/stage_custody/{required}/request_ref', 'is present'), 'source_stage_evidence', stage_request_ref),
        g.Guard('stage_result_ref', g.Invariant('/source/stage_custody/{required}/result_ref', 'is present'), 'source_stage_evidence', stage_result_ref),
        g.Guard('stage_witness_ref', g.Invariant('/stage_evidence_witnesses/{required}/ref', "equals the stage evidence's source_ref"), 'source_stage_evidence', stage_witness_ref),
        g.Guard('stage_witness_value', g.Invariant('/stage_evidence_witnesses/{required}/value', 'is a typed copy of the stage witness recomputed from the case'), 'source_stage_evidence', stage_witness_value),
        g.Guard('stage_witness_sha256', g.Invariant('/source/stage_custody/{required}/custody_evidence/source_sha256', "equals the hash of the stage witness's value"), 'source_stage_evidence', stage_witness_sha256),
    ])
    context = None

    def check(complete):
        table.require('stage_request_ref', complete, context)
        table.require('stage_result_ref', complete, context)
        table.require('stage_witness_ref', complete, context)
        table.require('stage_witness_value', complete, context)
        table.require('stage_witness_sha256', complete, context)
        return True
    return g.Case(table, check, context)
