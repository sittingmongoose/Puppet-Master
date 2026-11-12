"""DG6A guard table current_context: current context flags and exact original joins.

Method B guard rows (scripts/pm_guard_isolation.py) for the context phase of
scripts/pm-card5-event-contracts-check.py::current_errors, after the
current_header chain and operation_guards pass. Each predicate reads one
observation the checker derives from (operation, context): the four exact
True authority flags, the three exact authenticated/canonical/committed
joins, the three original commit/result/receipt refs, and the exact retry
body. Predicates never recompute, repair or call helpers. The pre-table
phase appended every failing code in this order (not first-only); the
checker still collects every refusing row's code in table order, so its
error list is unchanged, while this module's Case is the tool's complete
boundary for the phase. The later append-resolution call in current_errors
is not in this phase and earns no credit from it.
"""
import pm_guard_isolation as g

FIELDS = ('authority_verified_is_true', 'permission_allowed_is_true', 'source_retained_is_true', 'owner_commit_verified_is_true', 'authenticated_action_exact', 'canonical_before_exact', 'committed_after_exact', 'owner_commit_ref_exact', 'result_ref_exact', 'dispatch_receipt_ref_exact', 'retry_body_exact')


def CC01_authority_verified(value, context):
    return 'authority_verified' if value['authority_verified_is_true'] is not True else None


def CC02_permission_allowed(value, context):
    return 'permission_allowed' if value['permission_allowed_is_true'] is not True else None


def CC03_source_retained(value, context):
    return 'source_retained' if value['source_retained_is_true'] is not True else None


def CC04_owner_commit_verified(value, context):
    return 'owner_commit_verified' if value['owner_commit_verified_is_true'] is not True else None


def CC05_authenticated_action(value, context):
    return 'authenticated_action' if value['authenticated_action_exact'] is not True else None


def CC06_canonical_before(value, context):
    return 'canonical_before' if value['canonical_before_exact'] is not True else None


def CC07_committed_after(value, context):
    return 'committed_after' if value['committed_after_exact'] is not True else None


def CC08_original_owner_commit_ref(value, context):
    return 'original_owner_commit_ref' if value['owner_commit_ref_exact'] is not True else None


def CC09_original_result_ref(value, context):
    return 'original_result_ref' if value['result_ref_exact'] is not True else None


def CC10_original_dispatch_receipt_ref(value, context):
    return 'original_dispatch_receipt_ref' if value['dispatch_receipt_ref_exact'] is not True else None


def CC11_retry_body(value, context):
    return 'idempotency_conflict' if value['retry_body_exact'] is not True else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('CC01_authority_verified', g.Invariant('/authority_verified_is_true', 'context authority_verified is exactly True'), 'authority_verified', CC01_authority_verified),
        g.Guard('CC02_permission_allowed', g.Invariant('/permission_allowed_is_true', 'context permission_allowed is exactly True'), 'permission_allowed', CC02_permission_allowed),
        g.Guard('CC03_source_retained', g.Invariant('/source_retained_is_true', 'context source_retained is exactly True'), 'source_retained', CC03_source_retained),
        g.Guard('CC04_owner_commit_verified', g.Invariant('/owner_commit_verified_is_true', 'context owner_commit_verified is exactly True'), 'owner_commit_verified', CC04_owner_commit_verified),
        g.Guard('CC05_authenticated_action', g.Invariant('/authenticated_action_exact', 'context authenticated_action exactly equals the original command action'), 'authenticated_action', CC05_authenticated_action),
        g.Guard('CC06_canonical_before', g.Invariant('/canonical_before_exact', 'context canonical_before exactly equals the operation before state'), 'canonical_before', CC06_canonical_before),
        g.Guard('CC07_committed_after', g.Invariant('/committed_after_exact', 'context committed_after exactly equals the operation after state'), 'committed_after', CC07_committed_after),
        g.Guard('CC08_original_owner_commit_ref', g.Invariant('/owner_commit_ref_exact', 'context commit_refs owner_commit_ref exactly equals the operation ref'), 'original_owner_commit_ref', CC08_original_owner_commit_ref),
        g.Guard('CC09_original_result_ref', g.Invariant('/result_ref_exact', 'context commit_refs result_ref exactly equals the operation ref'), 'original_result_ref', CC09_original_result_ref),
        g.Guard('CC10_original_dispatch_receipt_ref', g.Invariant('/dispatch_receipt_ref_exact', 'context commit_refs dispatch_receipt_ref exactly equals the operation ref'), 'original_dispatch_receipt_ref', CC10_original_dispatch_receipt_ref),
        g.Guard('CC11_retry_body', g.Invariant('/retry_body_exact', 'context retry_body exactly equals the original command'), 'idempotency_conflict', CC11_retry_body),
    ])

    def check(value):
        table.require('CC01_authority_verified', value, context)
        table.require('CC02_permission_allowed', value, context)
        table.require('CC03_source_retained', value, context)
        table.require('CC04_owner_commit_verified', value, context)
        table.require('CC05_authenticated_action', value, context)
        table.require('CC06_canonical_before', value, context)
        table.require('CC07_committed_after', value, context)
        table.require('CC08_original_owner_commit_ref', value, context)
        table.require('CC09_original_result_ref', value, context)
        table.require('CC10_original_dispatch_receipt_ref', value, context)
        table.require('CC11_retry_body', value, context)
        return True
    return g.Case(table, check, context)
