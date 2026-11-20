"""DR guard table decode_pack_body: Full-envelope decode: dispatch, storage route, provider source and joins.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('body_utf8', 'body_json', 'body_duplicate_member', 'body_sha256', 'canonical_sha256', 'body_length')


def D10u_body_utf8(value, context):
    return 'pack body' if value['body_utf8'] is not True else None


def D10j_body_json(value, context):
    return 'pack body' if value['body_utf8'] is True and value['body_json'] is not True else None


def D10a_unique_members(value, context):
    return 'duplicate key' if value['body_json'] is True and value['body_duplicate_member'] is not False else None


def D10b_canonical_body(value, context):
    return 'noncanonical storage route' if value['body_duplicate_member'] is False and value['body_sha256'] != value['canonical_sha256'] else None


def D11_not_small(value, context):
    return 'noncanonical storage route' if value['body_length'] <= 16384 else None


def pack_body_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('D10u_body_utf8', g.Invariant('/body_utf8', 'the pack body is strict UTF-8'), 'pack body', D10u_body_utf8),
        g.Guard('D10j_body_json', g.Invariant('/body_json', 'strict UTF-8 pack text is one JSON value'), 'pack body', D10j_body_json),
        g.Guard('D10a_unique_members', g.Invariant('/body_duplicate_member', 'parsed pack JSON has no duplicate member'), 'duplicate key', D10a_unique_members),
        g.Guard('D10b_canonical_body', g.Invariant('/body_sha256', 'parsed pack JSON without duplicates re-encodes to the exact body (RFC 8785)'), 'noncanonical storage route', D10b_canonical_body),
        g.Guard('D11_not_small', g.Invariant('/body_length', 'a packed body is larger than the 16384-byte inline limit'), 'noncanonical storage route', D11_not_small),
    ])

    def check(value):
        table.require('D10u_body_utf8', value, context)
        table.require('D10j_body_json', value, context)
        table.require('D10a_unique_members', value, context)
        table.require('D10b_canonical_body', value, context)
        table.require('D11_not_small', value, context)
        return True
    return g.Case(table, check, context)
