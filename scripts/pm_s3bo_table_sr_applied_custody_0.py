"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sr_app_request(value, context):
    record = value['sr_app_request']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_app_request_refused'
    return None

def sr_app_identity(value, context):
    record = value['sr_app_identity']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_app_identity_refused'
    return None

def sr_app_preflight(value, context):
    record = value['sr_app_preflight']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_app_preflight_refused'
    return None

def sr_app_event_join(value, context):
    record = value['sr_app_event_join']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_app_event_join_refused'
    return None

def sr_app_obligation(value, context):
    record = value['sr_app_obligation']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_app_obligation_refused'
    return None

def sr_app_receipt(value, context):
    record = value['sr_app_receipt']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr_app_receipt_refused'
    return None

def sr_app_schema(value, context):
    record = value['sr_app_schema']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'sr_app_schema_refused'
    return None

def sr_app_time(value, context):
    record = value['sr_app_time']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'sr_app_time_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sr_app_request', g.Invariant('/sr_app_request', 'The commit row holds the exact normalized request, its RFC 8785 digest and the authenticated actor.'), 'sr_app_request_refused', sr_app_request),
        g.Guard('sr_app_identity', g.Invariant('/sr_app_identity', 'application_id, event_id and the EventRecord key follow the rpa_ recipe of the request key; a new key is a new application.'), 'sr_app_identity_refused', sr_app_identity),
        g.Guard('sr_app_preflight', g.Invariant('/sr_app_preflight', 'The recorded preflight binds the admitted point hash and protecting-ref digest.'), 'sr_app_preflight_refused', sr_app_preflight),
        g.Guard('sr_app_event_join', g.Invariant('/sr_app_event_join', 'The frozen event joins the reserved targets, envelope thread, point identity and hashes, and source refs.'), 'sr_app_event_join_refused', sr_app_event_join),
        g.Guard('sr_app_obligation', g.Invariant('/sr_app_obligation', 'Every appended event is byte-identical to the frozen obligation of its application, and the first is the stored EventRecord.'), 'sr_app_obligation_refused', sr_app_obligation),
        g.Guard('sr_app_receipt', g.Invariant('/sr_app_receipt', "The row names its event's own SP-286 custody key and the result returns that event's original receipt."), 'sr_app_receipt_refused', sr_app_receipt),
        g.Guard('sr_app_schema', g.Invariant('/sr_app_schema', 'Every commit row validates against the complete closed application_commit schema.'), 'sr_app_schema_refused', sr_app_schema),
        g.Guard('sr_app_time', g.Invariant('/sr_app_time', 'Commit-row timestamps use shared date_time with the Storage UTC-Z profile.'), 'sr_app_time_refused', sr_app_time),
    ])

    def check(value):
        table.require('sr_app_request', value, context)
        table.require('sr_app_identity', value, context)
        table.require('sr_app_preflight', value, context)
        table.require('sr_app_event_join', value, context)
        table.require('sr_app_obligation', value, context)
        table.require('sr_app_receipt', value, context)
        table.require('sr_app_schema', value, context)
        table.require('sr_app_time', value, context)
        return True
    return g.Case(table, check, context)
