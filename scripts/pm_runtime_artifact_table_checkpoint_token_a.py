"""DR guard table checkpoint_token_a: Bounded SP-278 initial-generation checkpoint join (one-segment, one-event edition).

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('generation', 'expected_generation', 'token_checkpoint_ref', 'expected_checkpoint_ref', 'token_generation_id', 'expected_generation_id', 'token_anchor_sha256', 'expected_anchor_sha256')


def C05a_generation_identity(value, context):
    return 'checkpoint_mismatch' if value['generation'] != value['expected_generation'] else None


def C05b_token_ref(value, context):
    return 'checkpoint_mismatch' if value['token_checkpoint_ref'] != value['expected_checkpoint_ref'] else None


def C05c_token_generation(value, context):
    return 'checkpoint_mismatch' if value['token_generation_id'] != value['expected_generation_id'] else None


def C05d_token_anchor(value, context):
    return 'checkpoint_mismatch' if value['token_anchor_sha256'] != value['expected_anchor_sha256'] else None


def token_a_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('C05a_generation_identity', g.Invariant('/generation', 'equals the recomputed SP-278 generation identity'), 'checkpoint_mismatch', C05a_generation_identity),
        g.Guard('C05b_token_ref', g.Invariant('/token_checkpoint_ref', 'token checkpoint_ref bytes equal the recomputed ref'), 'checkpoint_mismatch', C05b_token_ref),
        g.Guard('C05c_token_generation', g.Invariant('/token_generation_id', 'token generation_id bytes equal the current generation'), 'checkpoint_mismatch', C05c_token_generation),
        g.Guard('C05d_token_anchor', g.Invariant('/token_generation_anchor_sha256', 'token anchor digest bytes equal the recomputed anchor digest'), 'checkpoint_mismatch', C05d_token_anchor),
    ])

    def check(value):
        table.require('C05a_generation_identity', value, context)
        table.require('C05b_token_ref', value, context)
        table.require('C05c_token_generation', value, context)
        table.require('C05d_token_anchor', value, context)
        return True
    return g.Case(table, check, context)
