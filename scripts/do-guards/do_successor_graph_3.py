"""DO guard suite `successor_graph_3` (sweep part 2A). Successor graph: method, graph, physical, read/backup/restore and Storage selection (after the selected definitions).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def successor_physical_algorithm(value, context):
    return ('successor_physical_selection'
            if value['graph']['physical_selection']['codec_algorithm'] != 'pm.application.physical_messagepack.v1' else None)


def successor_physical_key_prefix(value, context):
    return ('successor_physical_selection' if value['graph']['physical_selection']['key_prefix'] != 'crew_board_message.application.v2'
            else None)


def successor_rbr_reader(value, context):
    return ('successor_read_backup_restore'
            if value['graph']['read_backup_restore']['canonical_reader_id'] != 'storage.crew_board_message.read.application@2.0.0' else None)


def successor_rbr_backup(value, context):
    return ('successor_read_backup_restore'
            if value['graph']['read_backup_restore']['backup_method_id'] != 'storage.crew_board_message.backup.application@2.0.0' else None)


def successor_rbr_restore(value, context):
    return ('successor_read_backup_restore'
            if value['graph']['read_backup_restore']['restore_method_id'] != 'storage.crew_board_message.restore.application@2.0.0' else None)


ROWS = (
    ('successor_physical_algorithm', '/graph/physical_selection/codec_algorithm', 'is pm.application.physical_messagepack.v1',
     'successor_physical_selection', successor_physical_algorithm, ('graph',), 'physical'),
    ('successor_physical_key_prefix', '/graph/physical_selection/key_prefix', "is 'crew_board_message.application.v2'",
     'successor_physical_selection', successor_physical_key_prefix, ('graph',), 'physical'),
    ('successor_rbr_reader', '/graph/read_backup_restore/canonical_reader_id', 'is the V2 canonical reader',
     'successor_read_backup_restore', successor_rbr_reader, ('graph',), 'rbr'),
    ('successor_rbr_backup', '/graph/read_backup_restore/backup_method_id', 'is the V2 backup method',
     'successor_read_backup_restore', successor_rbr_backup, ('graph',), 'rbr'),
    ('successor_rbr_restore', '/graph/read_backup_restore/restore_method_id', 'is the V2 restore method',
     'successor_read_backup_restore', successor_rbr_restore, ('graph',), 'rbr'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('successor_physical_algorithm', g.Invariant('/graph/physical_selection/codec_algorithm', 'is pm.application.physical_messagepack.v1'), 'successor_physical_selection', successor_physical_algorithm),
        g.Guard('successor_physical_key_prefix', g.Invariant('/graph/physical_selection/key_prefix', "is 'crew_board_message.application.v2'"), 'successor_physical_selection', successor_physical_key_prefix),
        g.Guard('successor_rbr_reader', g.Invariant('/graph/read_backup_restore/canonical_reader_id', 'is the V2 canonical reader'), 'successor_read_backup_restore', successor_rbr_reader),
        g.Guard('successor_rbr_backup', g.Invariant('/graph/read_backup_restore/backup_method_id', 'is the V2 backup method'), 'successor_read_backup_restore', successor_rbr_backup),
        g.Guard('successor_rbr_restore', g.Invariant('/graph/read_backup_restore/restore_method_id', 'is the V2 restore method'), 'successor_read_backup_restore', successor_rbr_restore),
    ])
    context = None

    def check(complete):
        table.require('successor_physical_algorithm', complete, context)
        table.require('successor_physical_key_prefix', complete, context)
        table.require('successor_rbr_reader', complete, context)
        table.require('successor_rbr_backup', complete, context)
        table.require('successor_rbr_restore', complete, context)
        return True
    return g.Case(table, check, context)
