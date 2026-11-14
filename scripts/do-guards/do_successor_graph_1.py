"""DO guard suite `successor_graph_1` (sweep part 2A). Successor graph: method, graph, physical, read/backup/restore and Storage selection (after the selected definitions).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g

INTERFACE = 'storage.coordination_append.application@2.0.0'
SOURCE_ROOT = 'Plans/application_board_message_v2.schema.json#/$defs/OriginalCoordinationAppendSourceV2'


def successor_method(value, context):
    expected = {'interface_id': INTERFACE, 'owner_doc': 'Plans/Contracts_V0.md#CV-740', 'source_root_ref': SOURCE_ROOT,
                'input_root_ref': 'Plans/application_board_message_v2.schema.json#/$defs/AgentMessageApplicationV2',
                'output_root_ref': 'Plans/application_workflow_contracts.schema.json#/$defs/CoordinationProjectionApplicationV1',
                'current_or_retained_role': 'original_current_and_retained_exact'}
    return 'successor_method_selection' if value['graph']['methods'][0] != expected else None


def successor_method_count(value, context):
    return 'successor_method_selection' if len(value['graph']['methods']) != 1 else None


def successor_graph_id(value, context):
    return 'successor_complete_graph' if value['graph']['graphs'][0]['graph_id'] != 'app.coordination_append.v2' else None


def successor_graph_edges(value, context):
    return 'successor_complete_graph' if value['graph']['graphs'][0]['ordered_role_edges'] != value['expected_edges'] else None


def successor_graph_methods(value, context):
    return 'successor_complete_graph' if value['graph']['graphs'][0]['participating_method_ids'] != [INTERFACE] else None


ROWS = (
    ('successor_method', '/graph/methods/0', 'is the CV-740 V2 append method',
     'successor_method_selection', successor_method, ('graph',), 'method'),
    ('successor_method_count', '/graph/methods', 'holds exactly one method',
     'successor_method_selection', successor_method_count, ('graph',), 'method'),
    ('successor_graph_id', '/graph/graphs/0/graph_id', "is 'app.coordination_append.v2'",
     'successor_complete_graph', successor_graph_id, ('graph',), 'graph'),
    ('successor_graph_edges', '/graph/graphs/0/ordered_role_edges', 'follow the V2 source stage order',
     'successor_complete_graph', successor_graph_edges, ('graph', 'expected_edges'), 'graph'),
    ('successor_graph_methods', '/graph/graphs/0/participating_method_ids', 'are exactly the V2 append method',
     'successor_complete_graph', successor_graph_methods, ('graph',), 'graph'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('successor_method', g.Invariant('/graph/methods/0', 'is the CV-740 V2 append method'), 'successor_method_selection', successor_method),
        g.Guard('successor_method_count', g.Invariant('/graph/methods', 'holds exactly one method'), 'successor_method_selection', successor_method_count),
        g.Guard('successor_graph_id', g.Invariant('/graph/graphs/0/graph_id', "is 'app.coordination_append.v2'"), 'successor_complete_graph', successor_graph_id),
        g.Guard('successor_graph_edges', g.Invariant('/graph/graphs/0/ordered_role_edges', 'follow the V2 source stage order'), 'successor_complete_graph', successor_graph_edges),
        g.Guard('successor_graph_methods', g.Invariant('/graph/graphs/0/participating_method_ids', 'are exactly the V2 append method'), 'successor_complete_graph', successor_graph_methods),
    ])
    context = None

    def check(complete):
        table.require('successor_method', complete, context)
        table.require('successor_method_count', complete, context)
        table.require('successor_graph_id', complete, context)
        table.require('successor_graph_edges', complete, context)
        table.require('successor_graph_methods', complete, context)
        return True
    return g.Case(table, check, context)
