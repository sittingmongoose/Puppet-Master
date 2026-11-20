"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sr_app_protect(value, context):
    record = value['sr_app_protect']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_app_protect_refused'
    return None

def sr_app_point(value, context):
    record = value['sr_app_point']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_app_point_refused'
    return None

def sr_app_source(value, context):
    record = value['sr_app_source']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_app_source_refused'
    return None

def sr_app_conflict(value, context):
    record = value['sr_app_conflict']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_app_conflict_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sr_app_protect', g.Invariant('/sr_app_protect', 'Only the step-4 record adds application:<application_id> to the protecting refs; nothing else changes them.'), 'sr_app_protect_refused', sr_app_protect),
        g.Guard('sr_app_point', g.Invariant('/sr_app_point', 'Application never consumes or transitions the restore point; every other point field is unchanged.'), 'sr_app_point_refused', sr_app_point),
        g.Guard('sr_app_source', g.Invariant('/sr_app_source', 'Every run leaves the source thread, branch, worktree, files, Git index, queue and safe points unchanged.'), 'sr_app_source_refused', sr_app_source),
        g.Guard('sr_app_conflict', g.Invariant('/sr_app_conflict', 'A different request digest under one key is idempotency_conflict and the original row is unchanged.'), 'sr_app_conflict_refused', sr_app_conflict),
    ])

    def check(value):
        table.require('sr_app_protect', value, context)
        table.require('sr_app_point', value, context)
        table.require('sr_app_source', value, context)
        table.require('sr_app_conflict', value, context)
        return True
    return g.Case(table, check, context)
