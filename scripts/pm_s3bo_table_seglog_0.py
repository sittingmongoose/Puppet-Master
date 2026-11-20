"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def reference_seq(value, context):
    record = value['reference_seq']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'reference_seq_refused'
    return None

def reference_type(value, context):
    record = value['reference_type']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'reference_type_refused'
    return None

def reference_event(value, context):
    record = value['reference_event']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'reference_event_refused'
    return None

def reference_segment(value, context):
    record = value['reference_segment']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'reference_segment_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('reference_seq', g.Invariant('/reference_seq', 'Seglog sequence joins the referenced original event.'), 'reference_seq_refused', reference_seq),
        g.Guard('reference_type', g.Invariant('/reference_type', 'Seglog type joins the referenced original event.'), 'reference_type_refused', reference_type),
        g.Guard('reference_event', g.Invariant('/reference_event', 'Seglog event_ref joins the referenced original event.'), 'reference_event_refused', reference_event),
        g.Guard('reference_segment', g.Invariant('/reference_segment', 'Seglog segment_ref joins actual original segment custody.'), 'reference_segment_refused', reference_segment),
    ])

    def check(value):
        table.require('reference_seq', value, context)
        table.require('reference_type', value, context)
        table.require('reference_event', value, context)
        table.require('reference_segment', value, context)
        return True
    return g.Case(table, check, context)
