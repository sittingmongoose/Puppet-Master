"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def deletion_edge(value, context):
    record = value['deletion_edge']
    if record['applies'] is not True:
        return None
    if record['left'] not in record['right']:
        return 'deletion_edge_refused'
    return None

def quarantine_edge(value, context):
    record = value['quarantine_edge']
    if record['applies'] is not True:
        return None
    if record['left'] not in record['right']:
        return 'quarantine_edge_refused'
    return None

def purge_holds(value, context):
    record = value['purge_holds']
    if record['applies'] is not True:
        return None
    if record['left'] != []:
        return 'purge_holds_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('deletion_edge', g.Invariant('/deletion_edge', 'Deletion follows the closed ordinary graph; terminal purge has no successor.'), 'deletion_edge_refused', deletion_edge),
        g.Guard('quarantine_edge', g.Invariant('/quarantine_edge', 'Quarantine follows its closed acyclic graph, without direct detected resolution.'), 'quarantine_edge_refused', quarantine_edge),
        g.Guard('purge_holds', g.Invariant('/purge_holds', 'Deletion cannot enter purge_pending or purged while hold blockers remain.'), 'purge_holds_refused', purge_holds),
    ])

    def check(value):
        table.require('deletion_edge', value, context)
        table.require('quarantine_edge', value, context)
        table.require('purge_holds', value, context)
        return True
    return g.Case(table, check, context)
