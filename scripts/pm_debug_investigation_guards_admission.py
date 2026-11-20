"""DDBG guard table: Current admission gate: writer policy, withdrawal, registration, retention.

Part of the DDBG guard tables; the domain rule and phase order are in
pm_debug_investigation_guard_constants.py. Every refusal here is a named
predicate row; the factory builds a fresh table and Case for each candidate.
"""
import pm_guard_isolation as g
from pm_debug_investigation_guard_constants import (
    CURRENT_WRITER_POLICY, READER_ONLY_POLICY)


def admission_replay_only(value, context):
    if type(value['case'].get('envelope')) is not dict:
        return None
    envelope = value['case']['envelope']
    return 'replay_only_not_appendable' if envelope.get('replay_policy') == READER_ONLY_POLICY else None


def admission_writer_policy(value, context):
    if type(value['case'].get('envelope')) is not dict:
        return None
    envelope = value['case']['envelope']
    if envelope.get('replay_policy') == READER_ONLY_POLICY:
        return None
    return 'writer_policy_mismatch' if envelope.get('replay_policy') != CURRENT_WRITER_POLICY else None


def admission_withdrawn(value, context):
    return 'withdrawn' if value['withdrawn'] is not False else None


def admission_registered(value, context):
    return 'unregistered' if value['admitted'] is not True else None


def admission_retention(value, context):
    return 'retention_unresolved' if value['retention'] == 'PENDING_RETENTION_DECISION' else None


def admission_case(case_value):
    table = g.GuardTable([
        g.Guard('admission.replay_only', g.Invariant('/case/envelope/replay_policy', 'is not the reader-only projector_replay_only'), 'replay_only_not_appendable', admission_replay_only),
        g.Guard('admission.writer_policy', g.Invariant('/case/envelope/replay_policy', 'is dedupe_by_idempotency_key for a current writer or retry'), 'writer_policy_mismatch', admission_writer_policy),
        g.Guard('admission.withdrawn', g.Invariant('/withdrawn', 'is false'), 'withdrawn', admission_withdrawn),
        g.Guard('admission.registered', g.Invariant('/admitted', 'is true: the family is on the event family registry'), 'unregistered', admission_registered),
        g.Guard('admission.retention', g.Invariant('/retention', 'is a resolved retention binding'), 'retention_unresolved', admission_retention)])
    context = None

    def check(value):
        table.require('admission.replay_only', value, context)
        table.require('admission.writer_policy', value, context)
        table.require('admission.withdrawn', value, context)
        table.require('admission.registered', value, context)
        table.require('admission.retention', value, context)
        return True
    return g.Case(table, check, context)
