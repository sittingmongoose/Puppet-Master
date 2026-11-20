"""DO guard suite `successor_graph_4` (sweep part 2A). Successor graph: method, graph, physical, read/backup/restore and Storage selection (after the selected definitions).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def successor_rbr_wrapper(value, context):
    graph = value['graph']
    return ('successor_read_backup_restore'
            if graph['read_backup_restore']['wrapper_root_ref'] != graph['physical_selection']['wrapper_root_ref'] else None)


def successor_rbr_source(value, context):
    graph = value['graph']
    return ('successor_read_backup_restore'
            if graph['read_backup_restore']['source_root_ref'] != graph['methods'][0]['source_root_ref'] else None)


def successor_rbr_owner(value, context):
    return ('successor_read_backup_restore'
            if value['graph']['read_backup_restore']['owner_ref'] != 'Plans/storage-plan.md#SP-723' else None)


def successor_rbr_backup_owner(value, context):
    return ('successor_read_backup_restore'
            if value['graph']['read_backup_restore']['backup_owner_ref'] != 'Plans/Backup_Restore_System.md#BRS-033' else None)


def successor_rbr_fences(value, context):
    return ('successor_read_backup_restore'
            if value['graph']['read_backup_restore']['same_source_access_deletion_hold_fences'] != True else None)


ROWS = (
    ('successor_rbr_wrapper', '/graph/read_backup_restore/wrapper_root_ref', "equals the physical selection's",
     'successor_read_backup_restore', successor_rbr_wrapper, ('graph',), 'rbr'),
    ('successor_rbr_source', '/graph/read_backup_restore/source_root_ref', "equals the method's",
     'successor_read_backup_restore', successor_rbr_source, ('graph',), 'rbr'),
    ('successor_rbr_owner', '/graph/read_backup_restore/owner_ref', 'is SP-723',
     'successor_read_backup_restore', successor_rbr_owner, ('graph',), 'rbr'),
    ('successor_rbr_backup_owner', '/graph/read_backup_restore/backup_owner_ref', 'is BRS-033',
     'successor_read_backup_restore', successor_rbr_backup_owner, ('graph',), 'rbr'),
    ('successor_rbr_fences', '/graph/read_backup_restore/same_source_access_deletion_hold_fences', 'is true',
     'successor_read_backup_restore', successor_rbr_fences, ('graph',), 'rbr'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('successor_rbr_wrapper', g.Invariant('/graph/read_backup_restore/wrapper_root_ref', "equals the physical selection's"), 'successor_read_backup_restore', successor_rbr_wrapper),
        g.Guard('successor_rbr_source', g.Invariant('/graph/read_backup_restore/source_root_ref', "equals the method's"), 'successor_read_backup_restore', successor_rbr_source),
        g.Guard('successor_rbr_owner', g.Invariant('/graph/read_backup_restore/owner_ref', 'is SP-723'), 'successor_read_backup_restore', successor_rbr_owner),
        g.Guard('successor_rbr_backup_owner', g.Invariant('/graph/read_backup_restore/backup_owner_ref', 'is BRS-033'), 'successor_read_backup_restore', successor_rbr_backup_owner),
        g.Guard('successor_rbr_fences', g.Invariant('/graph/read_backup_restore/same_source_access_deletion_hold_fences', 'is true'), 'successor_read_backup_restore', successor_rbr_fences),
    ])
    context = None

    def check(complete):
        table.require('successor_rbr_wrapper', complete, context)
        table.require('successor_rbr_source', complete, context)
        table.require('successor_rbr_owner', complete, context)
        table.require('successor_rbr_backup_owner', complete, context)
        table.require('successor_rbr_fences', complete, context)
        return True
    return g.Case(table, check, context)
