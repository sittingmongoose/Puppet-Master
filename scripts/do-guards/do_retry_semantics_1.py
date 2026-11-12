"""DO guard suite `retry_semantics_1` (sweep part 2A). Retry: a same-identity candidate carries the original caller semantics.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def retry_same_semantics(value, context):
    # Same-identity retries only: a candidate the earlier rows refuse (number, shape, replay-only, identity) is theirs.
    if value['candidate_number_errors'] or value['candidate_shape_valid'] is not True or value['original_shape_valid'] is not True:
        return None
    original, candidate = value['original'], value['candidate']
    if candidate['replay_policy'] == 'projector_replay_only':
        return None
    for key in ('scope_kind', 'project_id', 'event_type', 'idempotency_key', 'event_id'):
        if original[key] != candidate[key]:
            return None
    return 'idempotency_conflict' if value['original_semantic_digest'] != value['candidate_semantic_digest'] else None


ROWS = (
    ('retry_same_semantics', '/candidate', "semantic digest (CV-366 caller fields only) equals the original's",
     'idempotency_conflict', retry_same_semantics, ('original', 'candidate', 'candidate_number_errors', 'original_shape_valid', 'candidate_shape_valid', 'original_semantic_digest', 'candidate_semantic_digest'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('retry_same_semantics', g.Invariant('/candidate', "semantic digest (CV-366 caller fields only) equals the original's"), 'idempotency_conflict', retry_same_semantics),
    ])
    context = None

    def check(complete):
        table.require('retry_same_semantics', complete, context)
        return True
    return g.Case(table, check, context)
