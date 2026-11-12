"""DR guard table decode_pack_source: Full-envelope decode: dispatch, storage route, provider source and joins.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('pack_present', 'pack_durable', 'pack_authorized', 'body_length', 'ref_size', 'body_blake3', 'ref_digest')


def D07a_pack_present(value, context):
    return 'pack unavailable' if value['pack_present'] is not True else None


def D07b_pack_durable(value, context):
    return 'pack unavailable' if value['pack_present'] is True and value['pack_durable'] is not True else None


def D07c_pack_authorized(value, context):
    return 'pack unavailable' if value['pack_present'] is True and value['pack_authorized'] is not True else None


def D08_pack_size(value, context):
    return 'pack integrity' if value['pack_present'] is True and value['body_length'] != value['ref_size'] else None


def D09_pack_digest(value, context):
    return 'pack integrity' if value['pack_present'] is True and value['body_blake3'] != value['ref_digest'] else None


def pack_source_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('D07a_pack_present', g.Invariant('/pack_present', 'the referenced pack exists'), 'pack unavailable', D07a_pack_present),
        g.Guard('D07b_pack_durable', g.Invariant('/pack_durable', 'a present pack is durable (exactly true)'), 'pack unavailable', D07b_pack_durable),
        g.Guard('D07c_pack_authorized', g.Invariant('/pack_authorized', 'a present pack is authorized (exactly true)'), 'pack unavailable', D07c_pack_authorized),
        g.Guard('D08_pack_size', g.Invariant('/body_length', 'a present pack has bytes of the referenced length'), 'pack integrity', D08_pack_size),
        g.Guard('D09_pack_digest', g.Invariant('/body_blake3', 'a present pack has bytes whose blake3 digest equals the reference digest'), 'pack integrity', D09_pack_digest),
    ])

    def check(value):
        table.require('D07a_pack_present', value, context)
        table.require('D07b_pack_durable', value, context)
        table.require('D07c_pack_authorized', value, context)
        table.require('D08_pack_size', value, context)
        table.require('D09_pack_digest', value, context)
        return True
    return g.Case(table, check, context)
