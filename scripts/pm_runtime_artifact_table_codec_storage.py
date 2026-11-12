"""DR guard table codec_storage: Codec, identity, validator-profile, oracle and reference preconditions.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('jcs_refusal',)


def J01s_storage_jcs(value, context):
    return 'unqualified JCS payload' if value['jcs_refusal'] is not None else None


def storage_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('J01s_storage_jcs', g.Invariant('/jcs_refusal', 'the payload has a qualified RFC 8785 encoding before it is stored (CV-1100 qualified_jcs)'), 'unqualified JCS payload', J01s_storage_jcs),
    ])

    def check(value):
        table.require('J01s_storage_jcs', value, context)
        return True
    return g.Case(table, check, context)
