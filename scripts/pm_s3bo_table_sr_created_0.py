"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sr_cre_hash(value, context):
    record = value['sr_cre_hash']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cre_hash_refused'
    return None

def sr_cre_union(value, context):
    record = value['sr_cre_union']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cre_union_refused'
    return None

def sr_cre_split(value, context):
    record = value['sr_cre_split']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cre_split_refused'
    return None

def sr_cre_identity(value, context):
    record = value['sr_cre_identity']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cre_identity_refused'
    return None

def sr_cre_joins(value, context):
    record = value['sr_cre_joins']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cre_joins_refused'
    return None

def sr_cre_barriers(value, context):
    record = value['sr_cre_barriers']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cre_barriers_refused'
    return None

def sr_cre_events(value, context):
    record = value['sr_cre_events']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cre_events_refused'
    return None

def sr_cre_completion(value, context):
    record = value['sr_cre_completion']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_cre_completion_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sr_cre_hash', g.Invariant('/sr_cre_hash', 'record_sha256, the payload record_hash and the companion hash are the RFC 8785 SHA-256 of exactly the thirteen immutable fields.'), 'sr_cre_hash_refused', sr_cre_hash),
        g.Guard('sr_cre_union', g.Invariant('/sr_cre_union', 'The unique union of context and provenance refs equals the canonical merged list; attachment and citation sets equal theirs.'), 'sr_cre_union_refused', sr_cre_union),
        g.Guard('sr_cre_split', g.Invariant('/sr_cre_split', 'Each payload category is exactly the frozen capture category, in frozen order; no split is manufactured from the merged record field.'), 'sr_cre_split_refused', sr_cre_split),
        g.Guard('sr_cre_identity', g.Invariant('/sr_cre_identity', 'restore_point_id and event_id follow the rpc_ recipe of project and command idempotency key.'), 'sr_cre_identity_refused', sr_cre_identity),
        g.Guard('sr_cre_joins', g.Invariant('/sr_cre_joins', 'Payload source thread, branch, boundary, record ref, project, safe point and creation time join the canonical record.'), 'sr_cre_joins_refused', sr_cre_joins),
        g.Guard('sr_cre_barriers', g.Invariant('/sr_cre_barriers', 'B1 writes point and pending companion together, B2 appends the frozen input unchanged, B3 marks committed; recovery resumes, never recaptures.'), 'sr_cre_barriers_refused', sr_cre_barriers),
        g.Guard('sr_cre_events', g.Invariant('/sr_cre_events', 'One creation appends exactly one restore_point.created; retries after B2 and replays append nothing.'), 'sr_cre_events_refused', sr_cre_events),
        g.Guard('sr_cre_completion', g.Invariant('/sr_cre_completion', 'A point is complete only with a committed companion and matching event; pending or forged markers are unavailable.'), 'sr_cre_completion_refused', sr_cre_completion),
    ])

    def check(value):
        table.require('sr_cre_hash', value, context)
        table.require('sr_cre_union', value, context)
        table.require('sr_cre_split', value, context)
        table.require('sr_cre_identity', value, context)
        table.require('sr_cre_joins', value, context)
        table.require('sr_cre_barriers', value, context)
        table.require('sr_cre_events', value, context)
        table.require('sr_cre_completion', value, context)
        return True
    return g.Case(table, check, context)
