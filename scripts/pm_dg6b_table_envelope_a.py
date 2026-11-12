"""DG6B guard table envelope_a: EventRecord fields joined to the family, payload and source (part a).

Method B guard rows for scripts/pm-dg6b-event-contracts.py, written by
scripts/pm-dg6b-table-generate.py (edit the row spec there, never this file).
Each predicate reads one observation record that the checker derives from the
complete boundary input (canonical-byte digests, recomputed identities, error
counts); predicates never recompute, repair or call helpers. The checker refuses
only through these rows, in this order (pm-dg6b-event-contracts.py:require).
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('event_type', 'family', 'payload_schema_id', 'expected_payload_schema_id', 'occurred_at_utc', 'ts', 'actor_ref', 'source_actor_ref', 'redaction_profile', 'scope_kind', 'source_scope_kind', 'project_id', 'source_project_id')


def EJ01_event_type(value, context):
    return 'envelope_source_join' if value['event_type'] != value['family'] else None


def EJ02_payload_schema_id(value, context):
    return 'envelope_source_join' if value['payload_schema_id'] != value['expected_payload_schema_id'] else None


def EJ03_occurred_at(value, context):
    return 'envelope_source_join' if value['occurred_at_utc'] != value['ts'] else None


def EJ04_actor_ref(value, context):
    return 'envelope_source_join' if value['actor_ref'] != value['source_actor_ref'] else None


def EJ05_redaction_profile(value, context):
    return 'envelope_source_join' if value['redaction_profile'] != 'secret_refs_only' else None


def EJ06_scope_kind(value, context):
    return 'envelope_source_join' if value['scope_kind'] != value['source_scope_kind'] else None


def EJ07_project_id(value, context):
    return 'envelope_source_join' if value['scope_kind'] == value['source_scope_kind'] and value['project_id'] != value['source_project_id'] else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('EJ01_event_type', g.Invariant('/event_record/event_type', 'equals the family'), 'envelope_source_join', EJ01_event_type),
        g.Guard('EJ02_payload_schema_id', g.Invariant('/event_record/payload_schema_id', 'equals the family payload schema id'), 'envelope_source_join', EJ02_payload_schema_id),
        g.Guard('EJ03_occurred_at', g.Invariant('/event_record/occurred_at_utc', 'equals payload ts'), 'envelope_source_join', EJ03_occurred_at),
        g.Guard('EJ04_actor_ref', g.Invariant('/event_record/actor_ref', 'equals the source actor_ref'), 'envelope_source_join', EJ04_actor_ref),
        g.Guard('EJ05_redaction_profile', g.Invariant('/event_record/redaction_profile', 'is secret_refs_only'), 'envelope_source_join', EJ05_redaction_profile),
        g.Guard('EJ06_scope_kind', g.Invariant('/event_record/scope_kind', 'equals the source scope kind'), 'envelope_source_join', EJ06_scope_kind),
        g.Guard('EJ07_project_id', g.Invariant('/event_record/project_id', 'equals the source scope project_id (scope kinds equal)'), 'envelope_source_join', EJ07_project_id),
    ])

    def check(value):
        table.require('EJ01_event_type', value, context)
        table.require('EJ02_payload_schema_id', value, context)
        table.require('EJ03_occurred_at', value, context)
        table.require('EJ04_actor_ref', value, context)
        table.require('EJ05_redaction_profile', value, context)
        table.require('EJ06_scope_kind', value, context)
        table.require('EJ07_project_id', value, context)
        return True
    return g.Case(table, check, context)
