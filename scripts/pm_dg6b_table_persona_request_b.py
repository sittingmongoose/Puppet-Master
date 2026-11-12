"""DG6B guard table persona_request_b: Payload fields equal the owner request (part b).

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('payload_source_sha256_digest', 'request_source_sha256_digest', 'payload_project_version_id_digest', 'request_project_version_id_digest', 'payload_reach_ref_digest', 'request_reach_ref_digest', 'payload_expected_owner_revision_digest', 'request_expected_owner_revision_digest', 'payload_return_context_ref_digest', 'request_return_context_ref_digest')


def QK06_source_sha256(value, context):
    return 'original_source_join' if value['payload_source_sha256_digest'] != value['request_source_sha256_digest'] else None


def QK07_project_version_id(value, context):
    return 'original_source_join' if value['payload_project_version_id_digest'] != value['request_project_version_id_digest'] else None


def QK08_reach_ref(value, context):
    return 'original_source_join' if value['payload_reach_ref_digest'] != value['request_reach_ref_digest'] else None


def QK09_expected_owner_revision(value, context):
    return 'original_source_join' if value['payload_expected_owner_revision_digest'] != value['request_expected_owner_revision_digest'] else None


def QK10_return_context_ref(value, context):
    return 'original_source_join' if value['payload_return_context_ref_digest'] != value['request_return_context_ref_digest'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('QK06_source_sha256', g.Invariant('/source_sha256', 'equals the request source_sha256 (exact typed bytes)'), 'original_source_join', QK06_source_sha256),
        g.Guard('QK07_project_version_id', g.Invariant('/project_version_id', 'equals the request project_version_id (exact typed bytes)'), 'original_source_join', QK07_project_version_id),
        g.Guard('QK08_reach_ref', g.Invariant('/reach_ref', 'equals the request reach_ref (exact typed bytes)'), 'original_source_join', QK08_reach_ref),
        g.Guard('QK09_expected_owner_revision', g.Invariant('/expected_owner_revision', 'equals the request expected_owner_revision (exact typed bytes)'), 'original_source_join', QK09_expected_owner_revision),
        g.Guard('QK10_return_context_ref', g.Invariant('/return_context_ref', 'equals the request return_context_ref (exact typed bytes)'), 'original_source_join', QK10_return_context_ref),
    ])

    def check(value):
        table.require('QK06_source_sha256', value, context)
        table.require('QK07_project_version_id', value, context)
        table.require('QK08_reach_ref', value, context)
        table.require('QK09_expected_owner_revision', value, context)
        table.require('QK10_return_context_ref', value, context)
        return True
    return g.Case(table, check, context)
