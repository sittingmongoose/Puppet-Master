"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def application_key(value, context):
    record = value['application_key']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'application_key_refused'
    return None

def event_identity(value, context):
    record = value['event_identity']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'event_identity_refused'
    return None

def subject_identity(value, context):
    record = value['subject_identity']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'subject_identity_refused'
    return None

def thread_join(value, context):
    record = value['thread_join']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'thread_join_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('application_key', g.Invariant('/application_key', 'Deletion/quarantine application or Project key uses its exact owner recipe.'), 'application_key_refused', application_key),
        g.Guard('event_identity', g.Invariant('/event_identity', 'Event ID recomputes from the original owner recipe where specified.'), 'event_identity_refused', event_identity),
        g.Guard('subject_identity', g.Invariant('/subject_identity', 'Deletion/quarantine subject identity is computed from original source inputs.'), 'subject_identity_refused', subject_identity),
        g.Guard('thread_join', g.Invariant('/thread_join', 'Applied envelope thread is the reserved new thread, never the source thread.'), 'thread_join_refused', thread_join),
    ])

    def check(value):
        table.require('application_key', value, context)
        table.require('event_identity', value, context)
        table.require('subject_identity', value, context)
        table.require('thread_join', value, context)
        return True
    return g.Case(table, check, context)
