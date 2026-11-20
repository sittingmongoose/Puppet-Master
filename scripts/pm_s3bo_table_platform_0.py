"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def platform_marker(value, context):
    record = value['platform_marker']
    if record['applies'] is not True:
        return None
    if record['left'] != []:
        return 'platform_marker_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('platform_marker', g.Invariant('/platform_marker', 'Live platform read-through markers are never persisted.'), 'platform_marker_refused', platform_marker),
    ])

    def check(value):
        table.require('platform_marker', value, context)
        return True
    return g.Case(table, check, context)
