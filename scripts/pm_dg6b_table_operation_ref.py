"""DG6B guard table operation_ref: Operation carrier reference integrity.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('ref_blake3', 'resolved_blake3', 'ref_size', 'resolved_size', 'decoded', 'reencoded_digest', 'body_digest')


def OF01_ref_blake3(value, context):
    return 'payload_ref_integrity' if value['ref_blake3'] != value['resolved_blake3'] else None


def OF02_ref_size(value, context):
    return 'payload_ref_integrity' if value['ref_size'] != value['resolved_size'] else None


def OF04_decodes(value, context):
    return 'payload_ref_integrity' if value['decoded'] is not True else None


def OF05_canonical(value, context):
    return 'payload_ref_integrity' if value['decoded'] is True and value['reencoded_digest'] != value['body_digest'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('OF01_ref_blake3', g.Invariant('/value/payload_ref/blake3_id', 'equals the resolved blake3_id'), 'payload_ref_integrity', OF01_ref_blake3),
        g.Guard('OF02_ref_size', g.Invariant('/value/payload_ref/byte_size', 'equals the resolved byte_size'), 'payload_ref_integrity', OF02_ref_size),
        g.Guard('OF04_decodes', g.Invariant('/resolved/bytes_hex', 'the referenced body decodes as MessagePack'), 'payload_ref_integrity', OF04_decodes),
        g.Guard('OF05_canonical', g.Invariant('/resolved/bytes_hex', 'the decoded body re-encodes to exactly the same canonical bytes (decoded)'), 'payload_ref_integrity', OF05_canonical),
    ])

    def check(value):
        table.require('OF01_ref_blake3', value, context)
        table.require('OF02_ref_size', value, context)
        table.require('OF04_decodes', value, context)
        table.require('OF05_canonical', value, context)
        return True
    return g.Case(table, check, context)
