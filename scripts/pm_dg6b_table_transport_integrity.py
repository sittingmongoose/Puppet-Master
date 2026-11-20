"""DG6B guard table transport_integrity: SP-337 resolved body integrity.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('resolved_blake3', 'body_blake3', 'resolved_size', 'body_size', 'media_type', 'resolved_bytes_digest', 'body_bytes_digest')


def TI01_blake3(value, context):
    return 'payload_ref_integrity' if value['resolved_blake3'] != value['body_blake3'] else None


def TI02_byte_size(value, context):
    return 'payload_ref_integrity' if value['resolved_size'] != value['body_size'] else None


def TI03_media_type(value, context):
    return 'payload_ref_integrity' if value['media_type'] != 'application/msgpack' else None


def TI04_bytes(value, context):
    return 'payload_ref_integrity' if value['resolved_bytes_digest'] != value['body_bytes_digest'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('TI01_blake3', g.Invariant('/resolved/blake3_id', 'equals BLAKE3 of the body bytes'), 'payload_ref_integrity', TI01_blake3),
        g.Guard('TI02_byte_size', g.Invariant('/resolved/byte_size', 'equals the body length'), 'payload_ref_integrity', TI02_byte_size),
        g.Guard('TI03_media_type', g.Invariant('/resolved/media_type', 'is application/msgpack'), 'payload_ref_integrity', TI03_media_type),
        g.Guard('TI04_bytes', g.Invariant('/resolved/bytes_hex', 'decodes to exactly the body bytes'), 'payload_ref_integrity', TI04_bytes),
    ])

    def check(value):
        table.require('TI01_blake3', value, context)
        table.require('TI02_byte_size', value, context)
        table.require('TI03_media_type', value, context)
        table.require('TI04_bytes', value, context)
        return True
    return g.Case(table, check, context)
