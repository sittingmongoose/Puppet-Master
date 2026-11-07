"""DG6B guard table persona_home_copy: Payload home and content digest equal the owner request.

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('payload_home_ref_digest', 'request_destination_home_ref_digest', 'payload_content_sha256_digest', 'request_whole_record_sha256_digest')


def HC01_home_ref(value, context):
    return 'original_source_join' if value['payload_home_ref_digest'] != value['request_destination_home_ref_digest'] else None


def HC02_content_sha256(value, context):
    return 'original_source_join' if value['payload_content_sha256_digest'] != value['request_whole_record_sha256_digest'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('HC01_home_ref', g.Invariant('/home_ref', 'equals the request destination_home_ref (exact typed bytes)'), 'original_source_join', HC01_home_ref),
        g.Guard('HC02_content_sha256', g.Invariant('/content_sha256', 'equals the request whole_record_sha256 (exact typed bytes)'), 'original_source_join', HC02_content_sha256),
    ])

    def check(value):
        table.require('HC01_home_ref', value, context)
        table.require('HC02_content_sha256', value, context)
        return True
    return g.Case(table, check, context)
