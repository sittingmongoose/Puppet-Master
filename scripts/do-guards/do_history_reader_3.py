"""DO guard suite `history_reader_3` (sweep part 2A). Historical read: reader, admission and original-source facts (after the checkpoint rows).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def admission_scope_partition(value, context):
    if value['historical_state_valid'] is not True:
        return None
    return ('historical_original_admission'
            if value['state']['original_admission']['scope_partition'] != value['expected_admission']['scope_partition'] else None)


def admission_storage_instance_id(value, context):
    if value['historical_state_valid'] is not True:
        return None
    return ('historical_original_admission'
            if value['state']['original_admission']['storage_instance_id'] != value['expected_admission']['storage_instance_id'] else None)


def original_source_sha256(value, context):
    if value['historical_state_valid'] is not True:
        return None
    return ('historical_original_source' if value['state']['original_source_sha256'] != value['expected_original_source_sha256']
            else None)


def original_source_ref(value, context):
    if value['historical_state_valid'] is not True:
        return None
    return 'historical_original_source' if value['state']['original_source_ref'] != value['expected_original_source_ref'] else None


def original_source_verified(value, context):
    if value['historical_state_valid'] is not True:
        return None
    return 'historical_original_source' if not value['state']['original_source_verified'] else None


ROWS = (
    ('admission_scope_partition', '/historical_reader_state/original_admission/scope_partition', "equals the case's partition",
     'historical_original_admission', admission_scope_partition, ('state', 'expected_admission', 'historical_state_valid'), 'admission'),
    ('admission_storage_instance_id', '/historical_reader_state/original_admission/storage_instance_id', "equals the payload's storage instance",
     'historical_original_admission', admission_storage_instance_id, ('state', 'expected_admission', 'historical_state_valid'), 'admission'),
    ('original_source_sha256', '/historical_reader_state/original_source_sha256', 'equals the SHA-256 of the packed event',
     'historical_original_source', original_source_sha256, ('state', 'expected_original_source_sha256', 'historical_state_valid'), 'original_source'),
    ('original_source_ref', '/historical_reader_state/original_source_ref', "equals 'seglog:' + event_id",
     'historical_original_source', original_source_ref, ('state', 'expected_original_source_ref', 'historical_state_valid'), 'original_source'),
    ('original_source_verified', '/historical_reader_state/original_source_verified', 'is true',
     'historical_original_source', original_source_verified, ('state', 'historical_state_valid'), 'original_source'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('admission_scope_partition', g.Invariant('/historical_reader_state/original_admission/scope_partition', "equals the case's partition"), 'historical_original_admission', admission_scope_partition),
        g.Guard('admission_storage_instance_id', g.Invariant('/historical_reader_state/original_admission/storage_instance_id', "equals the payload's storage instance"), 'historical_original_admission', admission_storage_instance_id),
        g.Guard('original_source_sha256', g.Invariant('/historical_reader_state/original_source_sha256', 'equals the SHA-256 of the packed event'), 'historical_original_source', original_source_sha256),
        g.Guard('original_source_ref', g.Invariant('/historical_reader_state/original_source_ref', "equals 'seglog:' + event_id"), 'historical_original_source', original_source_ref),
        g.Guard('original_source_verified', g.Invariant('/historical_reader_state/original_source_verified', 'is true'), 'historical_original_source', original_source_verified),
    ])
    context = None

    def check(complete):
        table.require('admission_scope_partition', complete, context)
        table.require('admission_storage_instance_id', complete, context)
        table.require('original_source_sha256', complete, context)
        table.require('original_source_ref', complete, context)
        table.require('original_source_verified', complete, context)
        return True
    return g.Case(table, check, context)
