"""DO guard suite `selected_definitions_1` (sweep part 2A). Successor graph: the selected shared definitions keep the reviewed edition's content (DO-P1F-02).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def selected_workflow_contracts(value, context):
    return ('successor_selected_definitions'
            if value['selected_sha256']['application_workflow_contracts'] != value['pinned_sha256']['application_workflow_contracts']
            else None)


def selected_shared_runtime(value, context):
    return ('successor_selected_definitions'
            if value['selected_sha256']['shared_integration_runtime'] != value['pinned_sha256']['shared_integration_runtime']
            else None)


ROWS = (
    ('selected_workflow_contracts', '/application_workflow_contracts/$defs/{selected}', 'digest equals the reviewed pin',
     'successor_selected_definitions', selected_workflow_contracts, ('selected_sha256', 'pinned_sha256'), 'selected'),
    ('selected_shared_runtime', '/shared_integration_runtime/$defs/{selected}', 'digest equals the reviewed pin',
     'successor_selected_definitions', selected_shared_runtime, ('selected_sha256', 'pinned_sha256'), 'selected'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('selected_workflow_contracts', g.Invariant('/application_workflow_contracts/$defs/{selected}', 'digest equals the reviewed pin'), 'successor_selected_definitions', selected_workflow_contracts),
        g.Guard('selected_shared_runtime', g.Invariant('/shared_integration_runtime/$defs/{selected}', 'digest equals the reviewed pin'), 'successor_selected_definitions', selected_shared_runtime),
    ])
    context = None

    def check(complete):
        table.require('selected_workflow_contracts', complete, context)
        table.require('selected_shared_runtime', complete, context)
        return True
    return g.Case(table, check, context)
