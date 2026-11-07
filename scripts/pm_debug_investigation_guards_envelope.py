"""DDBG guard table: Envelope phase: current writer policy and the Project scope joins (all families).

Part of the DDBG guard tables; the domain rule and phase order are in
pm_debug_investigation_guard_constants.py. Every refusal here is a named
predicate row; the factory builds a fresh table and Case for each candidate.
"""
import base64

import pm_guard_isolation as g
from pm_debug_investigation_guard_constants import (
    CURRENT_WRITER_POLICY, PROJECT_PREFIX, READER_ONLY_POLICY)


def envelope_replay_only(value, context):
    if type(value.get('envelope')) is not dict:
        return None
    envelope = value['envelope']
    return 'replay_only_not_appendable' if envelope.get('replay_policy') == READER_ONLY_POLICY else None


def envelope_writer_policy(value, context):
    if type(value.get('envelope')) is not dict:
        return None
    envelope = value['envelope']
    if envelope.get('replay_policy') == READER_ONLY_POLICY:
        return None
    return 'writer_policy_mismatch' if envelope.get('replay_policy') != CURRENT_WRITER_POLICY else None


def envelope_project_id(value, context):
    project = value.get('project_id')
    return 'project_scope_mismatch' if type(project) is not str or not project else None


def envelope_scope_kind(value, context):
    if type(value.get('envelope')) is not dict:
        return None
    envelope = value['envelope']
    return 'project_scope_mismatch' if envelope.get('scope_kind') != 'project' else None


def envelope_project_join(value, context):
    # The Project joins apply to a project-scoped envelope; envelope.scope_kind refuses any other scope.
    if type(value.get('envelope')) is not dict or type(value.get('project_id')) is not str or not value['project_id']:
        return None
    envelope = value['envelope']
    if envelope.get('scope_kind') != 'project':
        return None
    return 'project_scope_mismatch' if envelope.get('project_id') != value['project_id'] else None


def envelope_owner_project(value, context):
    if type(value.get('owner_record')) is not dict or type(value.get('project_id')) is not str or not value['project_id']:
        return None
    owner = value['owner_record']
    return 'project_scope_mismatch' if owner.get('project_id') != value['project_id'] else None


def envelope_partition(value, context):
    if type(value.get('envelope')) is not dict or type(context['partition']) is not str:
        return None
    envelope = value['envelope']
    if envelope.get('scope_kind') != 'project':
        return None
    return 'project_scope_mismatch' if value.get('scope_partition') != context['partition'] else None


def envelope_owner_investigation(value, context):
    if type(value.get('owner_record')) is not dict or type(value.get('payload')) is not dict:
        return None
    owner = value['owner_record']
    payload = value['payload']
    investigation = payload.get('investigation_id')
    if type(investigation) is not str or not 0 < len(investigation) <= 256:
        return None
    return 'project_scope_mismatch' if owner.get('investigation_id') != investigation else None


def envelope_payload_project(value, context):
    if type(value.get('payload')) is not dict or type(value.get('project_id')) is not str or not value['project_id']:
        return None
    payload = value['payload']
    other = payload.get('project_id')
    if 'project_id' not in payload or type(other) is not str or not 0 < len(other) <= 256:
        return None
    return 'project_scope_mismatch' if other != value['project_id'] else None


def envelope_thread_join(value, context):
    if type(value.get('envelope')) is not dict or type(value.get('owner_record')) is not dict:
        return None
    envelope = value['envelope']
    owner = value['owner_record']
    return 'project_scope_mismatch' if envelope.get('thread_id') != owner.get('thread_id') else None


def envelope_payload_thread(value, context):
    if type(value.get('payload')) is not dict or type(value.get('owner_record')) is not dict:
        return None
    payload = value['payload']
    owner = value['owner_record']
    other = payload.get('thread_id')
    if 'thread_id' not in payload or type(other) is not str or not 0 < len(other) <= 256:
        return None
    return 'project_scope_mismatch' if other != owner.get('thread_id') else None


def envelope_run_join(value, context):
    if type(value.get('envelope')) is not dict or type(value.get('owner_record')) is not dict:
        return None
    envelope = value['envelope']
    owner = value['owner_record']
    return 'project_scope_mismatch' if envelope.get('run_id') != owner.get('run_id') else None


def envelope_payload_run(value, context):
    if type(value.get('payload')) is not dict or type(value.get('owner_record')) is not dict:
        return None
    payload = value['payload']
    owner = value['owner_record']
    other = payload.get('run_id')
    if 'run_id' not in payload or type(other) is not str or not 0 < len(other) <= 256:
        return None
    return 'project_scope_mismatch' if other != owner.get('run_id') else None


def envelope_case(case_value):
    project = case_value.get('project_id')
    # The encoded partition the canon requires (unpadded base64url); the row compares it.
    partition = None
    if type(project) is str and project:
        partition = PROJECT_PREFIX + base64.urlsafe_b64encode(project.encode()).decode().rstrip('=')
    context = {'partition': partition}
    table = g.GuardTable([
        g.Guard('envelope.replay_only', g.Invariant('/envelope/replay_policy', 'is not the reader-only projector_replay_only'), 'replay_only_not_appendable', envelope_replay_only),
        g.Guard('envelope.writer_policy', g.Invariant('/envelope/replay_policy', 'is dedupe_by_idempotency_key for a current writer or retry'), 'writer_policy_mismatch', envelope_writer_policy),
        g.Guard('envelope.project_id', g.Invariant('/project_id', 'is a nonempty string'), 'project_scope_mismatch', envelope_project_id),
        g.Guard('envelope.scope_kind', g.Invariant('/envelope/scope_kind', 'is project'), 'project_scope_mismatch', envelope_scope_kind),
        g.Guard('envelope.project_join', g.Invariant('/envelope/project_id', 'equals project_id'), 'project_scope_mismatch', envelope_project_join),
        g.Guard('envelope.owner_project', g.Invariant('/owner_record/project_id', 'equals project_id'), 'project_scope_mismatch', envelope_owner_project),
        g.Guard('envelope.partition', g.Invariant('/scope_partition', "equals 'project~' + unpadded base64url(project_id)"), 'project_scope_mismatch', envelope_partition),
        g.Guard('envelope.owner_investigation', g.Invariant('/owner_record/investigation_id', 'equals payload.investigation_id'), 'project_scope_mismatch', envelope_owner_investigation),
        g.Guard('envelope.payload_project', g.Invariant('/payload/project_id', 'equals project_id when present'), 'project_scope_mismatch', envelope_payload_project),
        g.Guard('envelope.thread_join', g.Invariant('/envelope/thread_id', 'equals owner_record.thread_id'), 'project_scope_mismatch', envelope_thread_join),
        g.Guard('envelope.payload_thread', g.Invariant('/payload/thread_id', 'equals owner_record.thread_id when present'), 'project_scope_mismatch', envelope_payload_thread),
        g.Guard('envelope.run_join', g.Invariant('/envelope/run_id', 'equals owner_record.run_id'), 'project_scope_mismatch', envelope_run_join),
        g.Guard('envelope.payload_run', g.Invariant('/payload/run_id', 'equals owner_record.run_id when present'), 'project_scope_mismatch', envelope_payload_run)])

    def check(value):
        table.require('envelope.replay_only', value, context)
        table.require('envelope.writer_policy', value, context)
        table.require('envelope.project_id', value, context)
        table.require('envelope.scope_kind', value, context)
        table.require('envelope.project_join', value, context)
        table.require('envelope.owner_project', value, context)
        table.require('envelope.partition', value, context)
        table.require('envelope.owner_investigation', value, context)
        table.require('envelope.payload_project', value, context)
        table.require('envelope.thread_join', value, context)
        table.require('envelope.payload_thread', value, context)
        table.require('envelope.run_join', value, context)
        table.require('envelope.payload_run', value, context)
        return True
    return g.Case(table, check, context)
