"""DR guard table decode_provider_digest: Full-envelope decode: dispatch, storage route, provider source and joins.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('provider_payload_hash', 'provider_expected_hash')


def B03_provider_digest(value, context):
    return 'provider source digest' if value['provider_payload_hash'] != value['provider_expected_hash'] else None


def provider_digest_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('B03_provider_digest', g.Invariant('/provider_payload_hash', 'provider_payload_hash equals sha256 of the source bytes, or null when unknown'), 'provider source digest', B03_provider_digest),
    ])

    def check(value):
        table.require('B03_provider_digest', value, context)
        return True
    return g.Case(table, check, context)
