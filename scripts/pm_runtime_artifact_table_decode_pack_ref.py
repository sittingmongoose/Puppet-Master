"""DR guard table decode_pack_ref: Full-envelope decode: dispatch, storage route, provider source and joins.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('ref_grammar', 'placeholder')


def D05_ref_grammar(value, context):
    return 'wrong reference/placeholder' if value['ref_grammar'] is not True else None


def D06_placeholder(value, context):
    return 'wrong reference/placeholder' if value['placeholder'] != {} else None


def pack_ref_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('D05_ref_grammar', g.Invariant('/ref_grammar', 'payload_ref is a full-match pm.payload_pack.v1 blake3 application/json reference'), 'wrong reference/placeholder', D05_ref_grammar),
        g.Guard('D06_placeholder', g.Invariant('/placeholder', 'a packed event carries the empty-object payload placeholder'), 'wrong reference/placeholder', D06_placeholder),
    ])

    def check(value):
        table.require('D05_ref_grammar', value, context)
        table.require('D06_placeholder', value, context)
        return True
    return g.Case(table, check, context)
