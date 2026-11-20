"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def quarantine_export(value, context):
    record = value['quarantine_export']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'quarantine_export_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('quarantine_export', g.Invariant('/quarantine_export', 'Raw quarantine bytes leave only through protected explicit export.'), 'quarantine_export_refused', quarantine_export),
    ])

    def check(value):
        table.require('quarantine_export', value, context)
        return True
    return g.Case(table, check, context)
