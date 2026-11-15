"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def ss_int_envelope(value, context):
    record = value['ss_int_envelope']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_int_envelope_refused'
    return None

def ss_int_witness(value, context):
    record = value['ss_int_witness']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_int_witness_refused'
    return None

def ss_int_downstream(value, context):
    record = value['ss_int_downstream']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_int_downstream_refused'
    return None

def ss_int_receipt(value, context):
    record = value['ss_int_receipt']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_int_receipt_refused'
    return None

def ss_int_read(value, context):
    record = value['ss_int_read']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'ss_int_read_refused'
    return None

def ss_int_numbers(value, context):
    record = value['ss_int_numbers']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'ss_int_numbers_refused'
    return None

def ss_int_time(value, context):
    record = value['ss_int_time']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'ss_int_time_refused'
    return None

def ss_int_schema(value, context):
    record = value['ss_int_schema']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'ss_int_schema_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('ss_int_envelope', g.Invariant('/ss_int_envelope', 'The envelope is the application-scope Storage coordinator projection with first actor and time and null lineage.'), 'ss_int_envelope_refused', ss_int_envelope),
        g.Guard('ss_int_witness', g.Invariant('/ss_int_witness', 'An exact_event finding joins sorted unique refs to corroborated source frames, never advisory index rows.'), 'ss_int_witness_refused', ss_int_witness),
        g.Guard('ss_int_downstream', g.Invariant('/ss_int_downstream', 'The shared qualified RFC 8785 digest and CV-339 full-value commitment of the frozen projection are reported exactly, or the route is unavailable.'), 'ss_int_downstream_refused', ss_int_downstream),
        g.Guard('ss_int_receipt', g.Invariant('/ss_int_receipt', 'The result and first receipt join the appended event; a retry returns the original receipt exactly.'), 'ss_int_receipt_refused', ss_int_receipt),
        g.Guard('ss_int_read', g.Invariant('/ss_int_read', 'The history reader returns only verified finding-backed results under the live token, issued continuations and no effect.'), 'ss_int_read_refused', ss_int_read),
        g.Guard('ss_int_numbers', g.Invariant('/ss_int_numbers', 'Every finding-input and reader integer uses shared current_integer with its owner bounds.'), 'ss_int_numbers_refused', ss_int_numbers),
        g.Guard('ss_int_time', g.Invariant('/ss_int_time', 'Finding and receipt timestamps use shared date_time with the EventRecord profile (E5-2).'), 'ss_int_time_refused', ss_int_time),
        g.Guard('ss_int_schema', g.Invariant('/ss_int_schema', 'The presented finding keeps every keyword of the closed SP-279 finding schema.'), 'ss_int_schema_refused', ss_int_schema),
    ])

    def check(value):
        table.require('ss_int_envelope', value, context)
        table.require('ss_int_witness', value, context)
        table.require('ss_int_downstream', value, context)
        table.require('ss_int_receipt', value, context)
        table.require('ss_int_read', value, context)
        table.require('ss_int_numbers', value, context)
        table.require('ss_int_time', value, context)
        table.require('ss_int_schema', value, context)
        return True
    return g.Case(table, check, context)
