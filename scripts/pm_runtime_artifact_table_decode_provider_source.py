"""DR guard table decode_provider_source: Full-envelope decode: dispatch, storage route, provider source and joins.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('provider_source_present', 'provider_source_type')


def B02a_provider_source_present(value, context):
    return 'provider source unavailable' if value['provider_source_present'] is not True else None


def B02b_provider_source_bytes(value, context):
    return 'provider source unavailable' if value['provider_source_present'] is True and value['provider_source_type'] not in ('bytes', 'NoneType') else None


def provider_source_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('B02a_provider_source_present', g.Invariant('/provider_source_present', 'the provider source bytes are available (or recorded unknown)'), 'provider source unavailable', B02a_provider_source_present),
        g.Guard('B02b_provider_source_bytes', g.Invariant('/provider_source_type', 'an available provider source is exact bytes or null (unknown)'), 'provider source unavailable', B02b_provider_source_bytes),
    ])

    def check(value):
        table.require('B02a_provider_source_present', value, context)
        table.require('B02b_provider_source_bytes', value, context)
        return True
    return g.Case(table, check, context)
