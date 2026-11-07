"""DG6B guard table resolution_ref: Resolution carrier reference integrity.

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


def RF01_ref_blake3(value, context):
    return 'payload_ref_integrity' if value['ref_blake3'] != value['resolved_blake3'] else None


def RF02_ref_size(value, context):
    return 'payload_ref_integrity' if value['ref_size'] != value['resolved_size'] else None


def RF04_decodes(value, context):
    return 'payload_ref_integrity' if value['decoded'] is not True else None


def RF05_canonical(value, context):
    return 'payload_ref_integrity' if value['decoded'] is True and value['reencoded_digest'] != value['body_digest'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('RF01_ref_blake3', g.Invariant('/value/payload_ref/blake3_id', 'equals the resolved blake3_id (exact typed bytes)'), 'payload_ref_integrity', RF01_ref_blake3),
        g.Guard('RF02_ref_size', g.Invariant('/value/payload_ref/byte_size', 'equals the resolved byte_size (exact typed bytes)'), 'payload_ref_integrity', RF02_ref_size),
        g.Guard('RF04_decodes', g.Invariant('/resolved/bytes_hex', 'the referenced body decodes as MessagePack'), 'payload_ref_integrity', RF04_decodes),
        g.Guard('RF05_canonical', g.Invariant('/resolved/bytes_hex', 'the decoded body re-encodes to exactly the same canonical bytes (decoded)'), 'payload_ref_integrity', RF05_canonical),
    ])

    def check(value):
        table.require('RF01_ref_blake3', value, context)
        table.require('RF02_ref_size', value, context)
        table.require('RF04_decodes', value, context)
        table.require('RF05_canonical', value, context)
        return True
    return g.Case(table, check, context)
