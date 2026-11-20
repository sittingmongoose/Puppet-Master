"""DR guard table codec_identity: Codec, identity, validator-profile, oracle and reference preconditions.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('revision_refusal',)


def I01a_revision_integer(value, context):
    return 'missing original observation revision' if value['revision_refusal'] == 'integer_type' else None


def I01b_revision_nonnegative(value, context):
    return 'missing original observation revision' if value['revision_refusal'] == 'integer_range' else None


def identity_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('I01a_revision_integer', g.Invariant('/revision_refusal', 'the restore observation revision is an exact integer (CV-1100 current_integer)'), 'missing original observation revision', I01a_revision_integer),
        g.Guard('I01b_revision_nonnegative', g.Invariant('/revision_refusal', 'the restore observation revision is at least 0 (CV-1100 current_integer)'), 'missing original observation revision', I01b_revision_nonnegative),
    ])

    def check(value):
        table.require('I01a_revision_integer', value, context)
        table.require('I01b_revision_nonnegative', value, context)
        return True
    return g.Case(table, check, context)
