"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def emitter(value, context):
    record = value['emitter']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'emitter_refused'
    return None

def deletion_ordinal(value, context):
    record = value['deletion_ordinal']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'deletion_ordinal_refused'
    return None

def quarantine_occurrence(value, context):
    record = value['quarantine_occurrence']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'quarantine_occurrence_refused'
    return None

def corrupt_terminal(value, context):
    record = value['corrupt_terminal']
    if record['applies'] is not True:
        return None
    if record['left'] != []:
        return 'corrupt_terminal_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('emitter', g.Invariant('/emitter', 'SP-2200..2204 events are appended only by their named owner emitter.'), 'emitter_refused', emitter),
        g.Guard('deletion_ordinal', g.Invariant('/deletion_ordinal', 'Deletion transition ordinal follows the actual durable event_refs length.'), 'deletion_ordinal_refused', deletion_ordinal),
        g.Guard('quarantine_occurrence', g.Invariant('/quarantine_occurrence', 'Quarantine occurrence is one plus matching purged records, never a caller count.'), 'quarantine_occurrence_refused', quarantine_occurrence),
        g.Guard('corrupt_terminal', g.Invariant('/corrupt_terminal', 'A corruption commit cannot follow a deletion or expiry commit for the point.'), 'corrupt_terminal_refused', corrupt_terminal),
    ])

    def check(value):
        table.require('emitter', value, context)
        table.require('deletion_ordinal', value, context)
        table.require('quarantine_occurrence', value, context)
        table.require('corrupt_terminal', value, context)
        return True
    return g.Case(table, check, context)
