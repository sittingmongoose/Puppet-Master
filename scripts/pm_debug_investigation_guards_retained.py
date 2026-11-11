"""DDBG guard table: Retained-history reader: the selected original Storage projection.

Part of the DDBG guard tables; the domain rule and phase order are in
pm_debug_investigation_guard_constants.py. Every refusal here is a named
predicate row; the factory builds a fresh table and Case for each input.

The input is the retained view pm_debug_investigation_transitions.retained_view
builds from the offered record and the selected original (sweep part 2B):
identities and semantic digests recomputed from each record with the shared
qualified RFC 8785 (pm_event_numbers), the original's own timestamp and Storage
metadata verdicts from the shared helpers with each field owner's profile
(EventRecord for occurred_at_utc; CV-253 storage_utc_z for observed_at_utc and
persisted_at_utc; storage_uint64 for sequence_id), and type-exact stand-ins of
the Storage metadata for the equality rows. Nothing is taken as supplied; the
rows compare and decide. Current writer and live-state rules never run here.
"""
import pm_guard_isolation as g
from pm_debug_investigation_guard_constants import RECIPE_REF


def retained_withdrawn(value, context):
    return 'withdrawn' if value['withdrawn'] is not False else None


def retained_admission(value, context):
    return 'historical_admission_mismatch' if value['original_admission'] != [value['original_family'], '1.0.0'] else None


def retained_recipe(value, context):
    return 'historical_recipe_mismatch' if value['recipe_ref'] != RECIPE_REF else None


def retained_family(value, context):
    return 'foreign_history' if value['offered_family'] != value['original_family'] else None


def retained_original_identity(value, context):
    # The original's recorded identity must be the one its own content gives under the at-write recipe.
    return 'forged_history_identity' if value['original_identity'] != value['recorded_identity'] else None


def retained_identity(value, context):
    # Identity and body are compared within one family; retained.family refuses a foreign record.
    if value['offered_family'] != value['original_family']:
        return None
    return 'forged_history_identity' if value['offered_identity'] != value['original_identity'] else None


def retained_original_qualified(value, context):
    return 'unqualified_history' if value['original_digest'] is None else None


def retained_body(value, context):
    # An original the at-write recipe cannot digest is retained.original_qualified's to refuse.
    if value['offered_family'] != value['original_family'] or value['original_digest'] is None:
        return None
    return 'forged_history_body' if value['offered_digest'] != value['original_digest'] else None


def retained_sequence(value, context):
    return 'forged_storage_metadata' if value['offered_storage']['sequence_id'] != value['original_storage']['sequence_id'] else None


def retained_observed(value, context):
    return 'forged_storage_metadata' if value['offered_storage']['observed_at_utc'] != value['original_storage']['observed_at_utc'] else None


def retained_persisted(value, context):
    return 'forged_storage_metadata' if value['offered_storage']['persisted_at_utc'] != value['original_storage']['persisted_at_utc'] else None


def retained_original_occurred(value, context):
    return 'invalid_history_timestamp' if value['original_profiles']['occurred_at_utc'] is not None else None


def retained_original_observed(value, context):
    return 'invalid_history_timestamp' if value['original_profiles']['observed_at_utc'] is not None else None


def retained_original_persisted(value, context):
    return 'invalid_history_timestamp' if value['original_profiles']['persisted_at_utc'] is not None else None


def retained_original_sequence(value, context):
    return 'invalid_history_metadata' if value['original_profiles']['sequence_id'] is not None else None


def retained_case(case_value):
    table = g.GuardTable([
        g.Guard('retained.withdrawn', g.Invariant('/withdrawn', 'is false'), 'withdrawn', retained_withdrawn),
        g.Guard('retained.admission', g.Invariant('/original_admission', 'is [original family, 1.0.0]'), 'historical_admission_mismatch', retained_admission),
        g.Guard('retained.recipe', g.Invariant('/recipe_ref', 'is the at-write recipe debug-project-rfc8785-v1'), 'historical_recipe_mismatch', retained_recipe),
        g.Guard('retained.family', g.Invariant('/offered_family', 'equals the original record family'), 'foreign_history', retained_family),
        g.Guard('retained.original_identity', g.Invariant('/recorded_identity', "equals the identity recomputed from the original's content"), 'forged_history_identity', retained_original_identity),
        g.Guard('retained.identity', g.Invariant('/offered_identity', "recomputed from the offered record, equals the original's recomputed identity"), 'forged_history_identity', retained_identity),
        g.Guard('retained.original_qualified', g.Invariant('/original_digest', "the original's semantic projection qualifies under the at-write recipe"), 'unqualified_history', retained_original_qualified),
        g.Guard('retained.body', g.Invariant('/offered_digest', 'recomputed semantic digest equals the original digest'), 'forged_history_body', retained_body),
        g.Guard('retained.sequence', g.Invariant('/offered_storage/sequence_id', 'equals the original Storage-assigned value, type-exact'), 'forged_storage_metadata', retained_sequence),
        g.Guard('retained.observed', g.Invariant('/offered_storage/observed_at_utc', 'equals the original Storage-assigned value, type-exact'), 'forged_storage_metadata', retained_observed),
        g.Guard('retained.persisted', g.Invariant('/offered_storage/persisted_at_utc', 'equals the original Storage-assigned value, type-exact'), 'forged_storage_metadata', retained_persisted),
        g.Guard('retained.original_occurred', g.Invariant('/original_profiles/occurred_at_utc', "the original's occurred_at_utc, when present, passes date_time with the EventRecord profile"), 'invalid_history_timestamp', retained_original_occurred),
        g.Guard('retained.original_observed', g.Invariant('/original_profiles/observed_at_utc', "the original's observed_at_utc, when present, passes date_time with storage_utc_z (CV-253)"), 'invalid_history_timestamp', retained_original_observed),
        g.Guard('retained.original_persisted', g.Invariant('/original_profiles/persisted_at_utc', "the original's persisted_at_utc, when present, passes date_time with storage_utc_z (CV-253)"), 'invalid_history_timestamp', retained_original_persisted),
        g.Guard('retained.original_sequence', g.Invariant('/original_profiles/sequence_id', "the original's sequence_id, when present, is an exact uint64 (storage_uint64)"), 'invalid_history_metadata', retained_original_sequence)])
    context = None

    def check(value):
        table.require('retained.withdrawn', value, context)
        table.require('retained.admission', value, context)
        table.require('retained.recipe', value, context)
        table.require('retained.family', value, context)
        table.require('retained.original_identity', value, context)
        table.require('retained.identity', value, context)
        table.require('retained.original_qualified', value, context)
        table.require('retained.body', value, context)
        table.require('retained.sequence', value, context)
        table.require('retained.observed', value, context)
        table.require('retained.persisted', value, context)
        table.require('retained.original_occurred', value, context)
        table.require('retained.original_observed', value, context)
        table.require('retained.original_persisted', value, context)
        table.require('retained.original_sequence', value, context)
        return True
    return g.Case(table, check, context)
