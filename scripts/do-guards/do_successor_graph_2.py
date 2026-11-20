"""DO guard suite `successor_graph_2` (sweep part 2A). Successor graph: method, graph, physical, read/backup/restore and Storage selection (after the selected definitions).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g

WRAPPER_ROOT = 'Plans/application_board_message_v2.schema.json#/$defs/CrewBoardMessageStorageApplicationV2'


def successor_graph_physical_ids(value, context):
    return ('successor_complete_graph' if value['graph']['graphs'][0]['physical_family_ids'] != ['crew_board_message_application_v2']
            else None)


def successor_graph_selectors(value, context):
    expected = ['crew.board_message_posted@1.0.0', 'crew.board_message_read@1.0.0', 'crew.board_messages_archived@1.0.0']
    return 'successor_complete_graph' if value['graph']['graphs'][0]['event_selectors'] != expected else None


def successor_graph_readers(value, context):
    expected = ['reader.orchestrator.crew_board_message_posted.history.v1@1.0.0']
    return 'successor_complete_graph' if value['graph']['graphs'][0]['reader_ids'] != expected else None


def successor_physical_wrapper(value, context):
    return 'successor_physical_selection' if value['graph']['physical_selection']['wrapper_root_ref'] != WRAPPER_ROOT else None


def successor_physical_codec(value, context):
    return ('successor_physical_selection'
            if value['graph']['physical_selection']['codec_id'] != 'pm.crew_board_message.application.physical_messagepack.v2' else None)


ROWS = (
    ('successor_graph_physical_ids', '/graph/graphs/0/physical_family_ids', 'are exactly crew_board_message_application_v2',
     'successor_complete_graph', successor_graph_physical_ids, ('graph',), 'graph'),
    ('successor_graph_selectors', '/graph/graphs/0/event_selectors', 'are exactly the three crew.board_* families',
     'successor_complete_graph', successor_graph_selectors, ('graph',), 'graph'),
    ('successor_graph_readers', '/graph/graphs/0/reader_ids', 'are exactly the posted-message history reader',
     'successor_complete_graph', successor_graph_readers, ('graph',), 'graph'),
    ('successor_physical_wrapper', '/graph/physical_selection/wrapper_root_ref', 'is the V2 storage wrapper',
     'successor_physical_selection', successor_physical_wrapper, ('graph',), 'physical'),
    ('successor_physical_codec', '/graph/physical_selection/codec_id', 'is the V2 physical MessagePack codec',
     'successor_physical_selection', successor_physical_codec, ('graph',), 'physical'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('successor_graph_physical_ids', g.Invariant('/graph/graphs/0/physical_family_ids', 'are exactly crew_board_message_application_v2'), 'successor_complete_graph', successor_graph_physical_ids),
        g.Guard('successor_graph_selectors', g.Invariant('/graph/graphs/0/event_selectors', 'are exactly the three crew.board_* families'), 'successor_complete_graph', successor_graph_selectors),
        g.Guard('successor_graph_readers', g.Invariant('/graph/graphs/0/reader_ids', 'are exactly the posted-message history reader'), 'successor_complete_graph', successor_graph_readers),
        g.Guard('successor_physical_wrapper', g.Invariant('/graph/physical_selection/wrapper_root_ref', 'is the V2 storage wrapper'), 'successor_physical_selection', successor_physical_wrapper),
        g.Guard('successor_physical_codec', g.Invariant('/graph/physical_selection/codec_id', 'is the V2 physical MessagePack codec'), 'successor_physical_selection', successor_physical_codec),
    ])
    context = None

    def check(complete):
        table.require('successor_graph_physical_ids', complete, context)
        table.require('successor_graph_selectors', complete, context)
        table.require('successor_graph_readers', complete, context)
        table.require('successor_physical_wrapper', complete, context)
        table.require('successor_physical_codec', complete, context)
        return True
    return g.Case(table, check, context)
