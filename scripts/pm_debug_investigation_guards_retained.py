"""DDBG guard table: Retained-history reader: the selected original Storage projection.

Part of the DDBG guard tables; the domain rule and phase order are in
pm_debug_investigation_guard_constants.py. Every refusal here is a named
predicate row; the factory builds a fresh table and Case for each candidate.
"""
import hashlib
import json

import pm_guard_isolation as g
from pm_debug_investigation_guard_constants import (
    DIGEST_FIELDS, RECIPE_REF)


def semantic_digest(case):
    # Contracts EventRecord producer_semantic_digest, not the Storage receipt
    # digest. These are bounded JSON vectors, not a native RFC 8785 codec proof.
    # Caller-supplied semantic fields only, never Storage-assigned metadata.
    pairs = [(key, case['envelope'].get(key)) for key in DIGEST_FIELDS]
    body = dict(pairs + [('event_type', case['event_type']), ('payload', case['payload'])])
    return hashlib.sha256(json.dumps(body, ensure_ascii=False, sort_keys=True,
                                     separators=(',', ':')).encode()).hexdigest()


def identity(event, project, payload):
    preimage = [event, project, payload['investigation_id'], payload['operation_id']]
    digest = hashlib.sha256(json.dumps(preimage, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
    return 'debug:' + digest, 'evt_debug_' + digest


def retained_withdrawn(value, context):
    return 'withdrawn' if value['withdrawn'] is not False else None


def retained_admission(value, context):
    original = value['original']
    return 'historical_admission_mismatch' if original['original_admission'] != [original['case']['event_type'], '1.0.0'] else None


def retained_recipe(value, context):
    return 'historical_recipe_mismatch' if value['original']['recipe_ref'] != RECIPE_REF else None


def retained_family(value, context):
    return 'foreign_history' if value['case']['event_type'] != value['original']['case']['event_type'] else None


def retained_identity(value, context):
    # Identity and body are compared within one family; retained.family refuses a foreign record.
    if value['case']['event_type'] != value['original']['case']['event_type']:
        return None
    return 'forged_history_identity' if context['offered_identity'] != value['original']['case']['expected_identity'] else None


def retained_body(value, context):
    if value['case']['event_type'] != value['original']['case']['event_type']:
        return None
    return 'forged_history_body' if context['offered_digest'] != context['original_digest'] else None


def retained_sequence(value, context):
    return 'forged_storage_metadata' if value['case']['envelope'].get('sequence_id') != value['original']['case']['envelope'].get('sequence_id') else None


def retained_observed(value, context):
    return 'forged_storage_metadata' if value['case']['envelope'].get('observed_at_utc') != value['original']['case']['envelope'].get('observed_at_utc') else None


def retained_persisted(value, context):
    return 'forged_storage_metadata' if value['case']['envelope'].get('persisted_at_utc') != value['original']['case']['envelope'].get('persisted_at_utc') else None


def retained_case(case_value):
    offered, frozen = case_value['case'], case_value['original']['case']
    # Recomputed from the offered event and the selected original; never taken as supplied.
    context = {'offered_identity': list(identity(offered['event_type'], offered['project_id'], offered['payload'])),
               'offered_digest': semantic_digest(offered), 'original_digest': semantic_digest(frozen)}
    table = g.GuardTable([
        g.Guard('retained.withdrawn', g.Invariant('/withdrawn', 'is false'), 'withdrawn', retained_withdrawn),
        g.Guard('retained.admission', g.Invariant('/original/original_admission', 'is [original family, 1.0.0]'), 'historical_admission_mismatch', retained_admission),
        g.Guard('retained.recipe', g.Invariant('/original/recipe_ref', 'is the at-write recipe debug-project-rfc8785-v1'), 'historical_recipe_mismatch', retained_recipe),
        g.Guard('retained.family', g.Invariant('/case/event_type', 'equals the original record family'), 'foreign_history', retained_family),
        g.Guard('retained.identity', g.Invariant('/case/payload', 'recomputed identity equals the original expected_identity'), 'forged_history_identity', retained_identity),
        g.Guard('retained.body', g.Invariant('/case/payload', 'recomputed semantic digest equals the original digest'), 'forged_history_body', retained_body),
        g.Guard('retained.sequence', g.Invariant('/case/envelope/sequence_id', 'equals the original Storage-assigned value'), 'forged_storage_metadata', retained_sequence),
        g.Guard('retained.observed', g.Invariant('/case/envelope/observed_at_utc', 'equals the original Storage-assigned value'), 'forged_storage_metadata', retained_observed),
        g.Guard('retained.persisted', g.Invariant('/case/envelope/persisted_at_utc', 'equals the original Storage-assigned value'), 'forged_storage_metadata', retained_persisted)])

    def check(value):
        table.require('retained.withdrawn', value, context)
        table.require('retained.admission', value, context)
        table.require('retained.recipe', value, context)
        table.require('retained.family', value, context)
        table.require('retained.identity', value, context)
        table.require('retained.body', value, context)
        table.require('retained.sequence', value, context)
        table.require('retained.observed', value, context)
        table.require('retained.persisted', value, context)
        return True
    return g.Case(table, check, context)
