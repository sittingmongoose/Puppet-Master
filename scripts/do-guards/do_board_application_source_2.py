"""DO guard suite `board_application_source_2` (sweep part 2A). Board source, application scope: custody, digests, stage evidence and message copies (CV-740, SP-720..723).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def source_scope_application_scope_identity(value, context):
    return 'application_scope_identity' if 'application_scope_identity' in value['source_scope_failures'] else None


def source_scope_outer_project_mismatch(value, context):
    return 'outer_project_mismatch' if 'outer_project_mismatch' in value['source_scope_failures'] else None


def source_scope_project_partition_mismatch(value, context):
    return 'project_partition_mismatch' if 'project_partition_mismatch' in value['source_scope_failures'] else None


def source_scope_server_scope_mismatch(value, context):
    return 'server_scope_mismatch' if 'server_scope_mismatch' in value['source_scope_failures'] else None


def source_scope_application_outer_project(value, context):
    return 'application_outer_project' if 'application_outer_project' in value['source_scope_failures'] else None


ROWS = (
    ('source_scope_application_scope_identity', '/source', 'has no application_scope_identity (the shared scope_failures helper)',
     'application_scope_identity', source_scope_application_scope_identity, ('source_scope_failures',), None),
    ('source_scope_outer_project_mismatch', '/source', 'has no outer_project_mismatch (the shared scope_failures helper)',
     'outer_project_mismatch', source_scope_outer_project_mismatch, ('source_scope_failures',), None),
    ('source_scope_project_partition_mismatch', '/source', 'has no project_partition_mismatch (the shared scope_failures helper)',
     'project_partition_mismatch', source_scope_project_partition_mismatch, ('source_scope_failures',), None),
    ('source_scope_server_scope_mismatch', '/source', 'has no server_scope_mismatch (the shared scope_failures helper)',
     'server_scope_mismatch', source_scope_server_scope_mismatch, ('source_scope_failures',), None),
    ('source_scope_application_outer_project', '/source', 'has no application_outer_project (the shared scope_failures helper)',
     'application_outer_project', source_scope_application_outer_project, ('source_scope_failures',), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('source_scope_application_scope_identity', g.Invariant('/source', 'has no application_scope_identity (the shared scope_failures helper)'), 'application_scope_identity', source_scope_application_scope_identity),
        g.Guard('source_scope_outer_project_mismatch', g.Invariant('/source', 'has no outer_project_mismatch (the shared scope_failures helper)'), 'outer_project_mismatch', source_scope_outer_project_mismatch),
        g.Guard('source_scope_project_partition_mismatch', g.Invariant('/source', 'has no project_partition_mismatch (the shared scope_failures helper)'), 'project_partition_mismatch', source_scope_project_partition_mismatch),
        g.Guard('source_scope_server_scope_mismatch', g.Invariant('/source', 'has no server_scope_mismatch (the shared scope_failures helper)'), 'server_scope_mismatch', source_scope_server_scope_mismatch),
        g.Guard('source_scope_application_outer_project', g.Invariant('/source', 'has no application_outer_project (the shared scope_failures helper)'), 'application_outer_project', source_scope_application_outer_project),
    ])
    context = None

    def check(complete):
        table.require('source_scope_application_scope_identity', complete, context)
        table.require('source_scope_outer_project_mismatch', complete, context)
        table.require('source_scope_project_partition_mismatch', complete, context)
        table.require('source_scope_server_scope_mismatch', complete, context)
        table.require('source_scope_application_outer_project', complete, context)
        return True
    return g.Case(table, check, context)
