"""DO guard suite `board_application_source_4` (sweep part 2A). Board source, application scope: custody, digests, stage evidence and message copies (CV-740, SP-720..723).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def wrapper_scope_outer_project_mismatch(value, context):
    return 'outer_project_mismatch' if 'outer_project_mismatch' in value['wrapper_scope_failures'] else None


def wrapper_scope_project_partition_mismatch(value, context):
    return 'project_partition_mismatch' if 'project_partition_mismatch' in value['wrapper_scope_failures'] else None


def wrapper_scope_server_scope_mismatch(value, context):
    return 'server_scope_mismatch' if 'server_scope_mismatch' in value['wrapper_scope_failures'] else None


def wrapper_scope_application_outer_project(value, context):
    return 'application_outer_project' if 'application_outer_project' in value['wrapper_scope_failures'] else None


def wrapper_scope_application_thread_mismatch(value, context):
    return 'application_thread_mismatch' if 'application_thread_mismatch' in value['wrapper_scope_failures'] else None


ROWS = (
    ('wrapper_scope_outer_project_mismatch', '/wrapper', 'has no outer_project_mismatch (the shared scope_failures helper)',
     'outer_project_mismatch', wrapper_scope_outer_project_mismatch, ('wrapper_scope_failures',), None),
    ('wrapper_scope_project_partition_mismatch', '/wrapper', 'has no project_partition_mismatch (the shared scope_failures helper)',
     'project_partition_mismatch', wrapper_scope_project_partition_mismatch, ('wrapper_scope_failures',), None),
    ('wrapper_scope_server_scope_mismatch', '/wrapper', 'has no server_scope_mismatch (the shared scope_failures helper)',
     'server_scope_mismatch', wrapper_scope_server_scope_mismatch, ('wrapper_scope_failures',), None),
    ('wrapper_scope_application_outer_project', '/wrapper', 'has no application_outer_project (the shared scope_failures helper)',
     'application_outer_project', wrapper_scope_application_outer_project, ('wrapper_scope_failures',), None),
    ('wrapper_scope_application_thread_mismatch', '/wrapper', 'has no application_thread_mismatch (the shared scope_failures helper)',
     'application_thread_mismatch', wrapper_scope_application_thread_mismatch, ('wrapper_scope_failures',), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('wrapper_scope_outer_project_mismatch', g.Invariant('/wrapper', 'has no outer_project_mismatch (the shared scope_failures helper)'), 'outer_project_mismatch', wrapper_scope_outer_project_mismatch),
        g.Guard('wrapper_scope_project_partition_mismatch', g.Invariant('/wrapper', 'has no project_partition_mismatch (the shared scope_failures helper)'), 'project_partition_mismatch', wrapper_scope_project_partition_mismatch),
        g.Guard('wrapper_scope_server_scope_mismatch', g.Invariant('/wrapper', 'has no server_scope_mismatch (the shared scope_failures helper)'), 'server_scope_mismatch', wrapper_scope_server_scope_mismatch),
        g.Guard('wrapper_scope_application_outer_project', g.Invariant('/wrapper', 'has no application_outer_project (the shared scope_failures helper)'), 'application_outer_project', wrapper_scope_application_outer_project),
        g.Guard('wrapper_scope_application_thread_mismatch', g.Invariant('/wrapper', 'has no application_thread_mismatch (the shared scope_failures helper)'), 'application_thread_mismatch', wrapper_scope_application_thread_mismatch),
    ])
    context = None

    def check(complete):
        table.require('wrapper_scope_outer_project_mismatch', complete, context)
        table.require('wrapper_scope_project_partition_mismatch', complete, context)
        table.require('wrapper_scope_server_scope_mismatch', complete, context)
        table.require('wrapper_scope_application_outer_project', complete, context)
        table.require('wrapper_scope_application_thread_mismatch', complete, context)
        return True
    return g.Case(table, check, context)
