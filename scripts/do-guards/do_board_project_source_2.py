"""DO guard suite `board_project_source_2` (sweep part 2A). Board source, Project scope: the adapter source joins to the payload.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def project_source_run_id_join(value, context):
    if value['board_branch'] != 'project' or value['project_input_valid'] is not True:
        return None
    return 'source_run_id' if value['source'].get('run_id') != value['payload'].get('run_id') else None


def project_source_operation_id_join(value, context):
    if value['board_branch'] != 'project' or value['project_input_valid'] is not True:
        return None
    return 'source_operation_id' if value['source'].get('operation_id') != value['payload'].get('operation_id') else None


def project_source_project_id_join(value, context):
    if value['board_branch'] != 'project' or value['project_input_valid'] is not True:
        return None
    return 'source_project_id' if value['source'].get('project_id') != value['payload'].get('project_id') else None


def project_source_edition(value, context):
    if value['board_branch'] != 'project' or value['project_input_valid'] is not True:
        return None
    return 'source_edition' if value['source'].get('edition') != 'original_project_coordination_source' else None


def project_source_interface(value, context):
    if value['board_branch'] != 'project' or value['project_input_valid'] is not True:
        return None
    return 'source_edition' if value['source'].get('interface') != 'storage.coordination_append.v1@1.0.0' else None


ROWS = (
    ('project_source_run_id_join', '/source/run_id', "equals the payload's",
     'source_run_id', project_source_run_id_join, ('source', 'payload', 'board_branch', 'project_input_valid'), None),
    ('project_source_operation_id_join', '/source/operation_id', "equals the payload's",
     'source_operation_id', project_source_operation_id_join, ('source', 'payload', 'board_branch', 'project_input_valid'), None),
    ('project_source_project_id_join', '/source/project_id', "equals the payload's",
     'source_project_id', project_source_project_id_join, ('source', 'payload', 'board_branch', 'project_input_valid'), None),
    ('project_source_edition', '/source/edition', "is 'original_project_coordination_source'",
     'source_edition', project_source_edition, ('source', 'board_branch', 'project_input_valid'), 'source_edition'),
    ('project_source_interface', '/source/interface', "is 'storage.coordination_append.v1@1.0.0'",
     'source_edition', project_source_interface, ('source', 'board_branch', 'project_input_valid'), 'source_edition'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('project_source_run_id_join', g.Invariant('/source/run_id', "equals the payload's"), 'source_run_id', project_source_run_id_join),
        g.Guard('project_source_operation_id_join', g.Invariant('/source/operation_id', "equals the payload's"), 'source_operation_id', project_source_operation_id_join),
        g.Guard('project_source_project_id_join', g.Invariant('/source/project_id', "equals the payload's"), 'source_project_id', project_source_project_id_join),
        g.Guard('project_source_edition', g.Invariant('/source/edition', "is 'original_project_coordination_source'"), 'source_edition', project_source_edition),
        g.Guard('project_source_interface', g.Invariant('/source/interface', "is 'storage.coordination_append.v1@1.0.0'"), 'source_edition', project_source_interface),
    ])
    context = None

    def check(complete):
        table.require('project_source_run_id_join', complete, context)
        table.require('project_source_operation_id_join', complete, context)
        table.require('project_source_project_id_join', complete, context)
        table.require('project_source_edition', complete, context)
        table.require('project_source_interface', complete, context)
        return True
    return g.Case(table, check, context)
