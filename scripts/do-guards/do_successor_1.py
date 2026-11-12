"""DO guard suite `successor_1` (sweep part 2A). Successor graph: the whole live successor selection (successor_errors), before the selected definitions.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def successor_schema_references(value, context):
    return 'unresolved_schema_reference' if value['successor_reference_errors'] else None


def successor_graph_digest(value, context):
    return 'successor_graph_digest' if value['graph']['graph_sha256'] != value['expected_graph_sha256'] else None


def successor_resource_paths(value, context):
    return 'successor_resource_selection' if value['resource_paths'] != value['expected_resource_paths'] else None


def successor_resource_count(value, context):
    return 'successor_resource_selection' if len(value['graph']['resources']) != len(value['expected_resource_paths']) else None


def successor_resource_hashes(value, context):
    for resource in value['graph']['resources']:
        if resource['sha256'] != value['file_sha256'].get(resource['path']):
            return 'successor_resource_selection'
    return None


ROWS = (
    ('successor_schema_references', '/application_board_message_v2.schema.json', 'resolves every $ref offline against the selected documents',
     'unresolved_schema_reference', successor_schema_references, ('successor_reference_errors',), None),
    ('successor_graph_digest', '/graph/graph_sha256', 'equals the source_graph semantic hash of the rest of the graph',
     'successor_graph_digest', successor_graph_digest, ('graph', 'expected_graph_sha256'), None),
    ('successor_resource_paths', '/graph/resources', 'map path to schema_uri exactly as the four selected documents',
     'successor_resource_selection', successor_resource_paths, ('resource_paths', 'expected_resource_paths'), 'resource'),
    ('successor_resource_count', '/graph/resources', 'holds exactly the four selected documents',
     'successor_resource_selection', successor_resource_count, ('graph', 'expected_resource_paths'), 'resource'),
    ('successor_resource_hashes', '/graph/resources/*/sha256', "equals the SHA-256 of that file's bytes",
     'successor_resource_selection', successor_resource_hashes, ('graph', 'file_sha256'), 'resource'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('successor_schema_references', g.Invariant('/application_board_message_v2.schema.json', 'resolves every $ref offline against the selected documents'), 'unresolved_schema_reference', successor_schema_references),
        g.Guard('successor_graph_digest', g.Invariant('/graph/graph_sha256', 'equals the source_graph semantic hash of the rest of the graph'), 'successor_graph_digest', successor_graph_digest),
        g.Guard('successor_resource_paths', g.Invariant('/graph/resources', 'map path to schema_uri exactly as the four selected documents'), 'successor_resource_selection', successor_resource_paths),
        g.Guard('successor_resource_count', g.Invariant('/graph/resources', 'holds exactly the four selected documents'), 'successor_resource_selection', successor_resource_count),
        g.Guard('successor_resource_hashes', g.Invariant('/graph/resources/*/sha256', "equals the SHA-256 of that file's bytes"), 'successor_resource_selection', successor_resource_hashes),
    ])
    context = None

    def check(complete):
        table.require('successor_schema_references', complete, context)
        table.require('successor_graph_digest', complete, context)
        table.require('successor_resource_paths', complete, context)
        table.require('successor_resource_count', complete, context)
        table.require('successor_resource_hashes', complete, context)
        return True
    return g.Case(table, check, context)
