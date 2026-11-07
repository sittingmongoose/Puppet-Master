"""DR guard table codec_profile: Codec, identity, validator-profile, oracle and reference preconditions.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('profile',)


def S06_validation_profile(value, context):
    return 'unsupported historical decoder' if value['profile'] not in ('current-writer', 'historical-v1-before-provider-hash') else None


def profile_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('S06_validation_profile', g.Invariant('/profile', 'the validation profile is the current writer or historical v1'), 'unsupported historical decoder', S06_validation_profile),
    ])

    def check(value):
        table.require('S06_validation_profile', value, context)
        return True
    return g.Case(table, check, context)
