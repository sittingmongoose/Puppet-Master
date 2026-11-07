"""DO guard suite `checkpoint_join_8` (sweep part 2A). Checkpoint read: the read token, row and source joins.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def anchor_retained_event_prefix(value, context):
    left, right = value['anchor']['retained_event_prefix_sha256'], value['expected_prefix_sha256']
    return 'index_source_prefix' if type(left) is not type(right) or left != right else None


def coverage_retained_event_prefix(value, context):
    left, right = value['coverage']['retained_event_prefix_sha256'], value['expected_prefix_sha256']
    return 'index_source_prefix' if type(left) is not type(right) or left != right else None


def anchor_survivor_prefix(value, context):
    left, right = value['anchor_source_selection']['manifest_survivor_prefix_sha256'], value['expected_prefix_sha256']
    return 'index_source_prefix' if type(left) is not type(right) or left != right else None


def frontier_survivor_prefix(value, context):
    left, right = value['frontier_source_selection']['manifest_survivor_prefix_sha256'], value['expected_prefix_sha256']
    return 'index_source_prefix' if type(left) is not type(right) or left != right else None


def row_birth_manifest_generation(value, context):
    locator = value['row'].get('publication_locator')
    if type(locator) is not dict:
        return None
    left, right = locator.get('manifest_generation'), value['anchor_source_selection']['manifest_generation']
    return 'index_birth_anchor_join' if type(left) is not type(right) or left != right else None


ROWS = (
    ('anchor_retained_event_prefix', '/read/checkpoint/generations/*/anchor/retained_event_prefix_sha256', "equals the prefix recomputed from the event's bytes",
     'index_source_prefix', anchor_retained_event_prefix, ('anchor', 'expected_prefix_sha256'), None),
    ('coverage_retained_event_prefix', '/read/checkpoint/generations/*/frontier/coverage/retained_event_prefix_sha256', "equals the prefix recomputed from the event's bytes",
     'index_source_prefix', coverage_retained_event_prefix, ('coverage', 'expected_prefix_sha256'), None),
    ('anchor_survivor_prefix', '/read/checkpoint/generations/*/anchor/source_selection/manifest_survivor_prefix_sha256', "equals the prefix recomputed from the event's bytes",
     'index_source_prefix', anchor_survivor_prefix, ('anchor_source_selection', 'expected_prefix_sha256'), None),
    ('frontier_survivor_prefix', '/read/checkpoint/generations/*/frontier/source_selection/manifest_survivor_prefix_sha256', "equals the prefix recomputed from the event's bytes",
     'index_source_prefix', frontier_survivor_prefix, ('frontier_source_selection', 'expected_prefix_sha256'), None),
    ('row_birth_manifest_generation', '/read/row/publication_locator/manifest_generation', "equals the birth anchor selection's manifest generation (typed)",
     'index_birth_anchor_join', row_birth_manifest_generation, ('row', 'anchor_source_selection'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('anchor_retained_event_prefix', g.Invariant('/read/checkpoint/generations/*/anchor/retained_event_prefix_sha256', "equals the prefix recomputed from the event's bytes"), 'index_source_prefix', anchor_retained_event_prefix),
        g.Guard('coverage_retained_event_prefix', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/retained_event_prefix_sha256', "equals the prefix recomputed from the event's bytes"), 'index_source_prefix', coverage_retained_event_prefix),
        g.Guard('anchor_survivor_prefix', g.Invariant('/read/checkpoint/generations/*/anchor/source_selection/manifest_survivor_prefix_sha256', "equals the prefix recomputed from the event's bytes"), 'index_source_prefix', anchor_survivor_prefix),
        g.Guard('frontier_survivor_prefix', g.Invariant('/read/checkpoint/generations/*/frontier/source_selection/manifest_survivor_prefix_sha256', "equals the prefix recomputed from the event's bytes"), 'index_source_prefix', frontier_survivor_prefix),
        g.Guard('row_birth_manifest_generation', g.Invariant('/read/row/publication_locator/manifest_generation', "equals the birth anchor selection's manifest generation (typed)"), 'index_birth_anchor_join', row_birth_manifest_generation),
    ])
    context = None

    def check(complete):
        table.require('anchor_retained_event_prefix', complete, context)
        table.require('coverage_retained_event_prefix', complete, context)
        table.require('anchor_survivor_prefix', complete, context)
        table.require('frontier_survivor_prefix', complete, context)
        table.require('row_birth_manifest_generation', complete, context)
        return True
    return g.Case(table, check, context)
