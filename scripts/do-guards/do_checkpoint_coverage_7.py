"""DO guard suite `checkpoint_coverage_7` (sweep part 2A). Checkpoint read: the frontier coverage, sequence, segment, selection, gap, locator and generation copies (DO-P1F04/05/06).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def frontier_current_bytes_sha256(value, context):
    left = value['frontier_source_selection']['current_bytes_sha256']
    right = value['anchor_source_selection']['current_bytes_sha256']
    return 'index_frontier_current_bytes_sha256' if type(left) is not type(right) or left != right else None


def frontier_recovery_epoch(value, context):
    left, right = value['frontier_source_selection']['recovery_epoch'], value['anchor_source_selection']['recovery_epoch']
    return 'index_frontier_recovery_epoch' if type(left) is not type(right) or left != right else None


def frontier_excluded_ranges_sha256(value, context):
    left = value['frontier_source_selection']['excluded_ranges_sha256']
    right = value['anchor_source_selection']['excluded_ranges_sha256']
    return 'index_frontier_excluded_ranges_sha256' if type(left) is not type(right) or left != right else None


def frontier_retired_inputs_sha256(value, context):
    left = value['frontier_source_selection']['retired_inputs_sha256']
    right = value['anchor_source_selection']['retired_inputs_sha256']
    return 'index_frontier_retired_inputs_sha256' if type(left) is not type(right) or left != right else None


def anchor_sequence_gaps_sha256(value, context):
    left, right = value['anchor']['sequence_gaps_sha256'], value['empty_gaps_sha256']
    return 'index_anchor_sequence_gaps_sha256' if type(left) is not type(right) or left != right else None


ROWS = (
    ('frontier_current_bytes_sha256', '/read/checkpoint/generations/*/frontier/source_selection/current_bytes_sha256', "equals the birth anchor selection's (typed)",
     'index_frontier_current_bytes_sha256', frontier_current_bytes_sha256, ('frontier_source_selection', 'anchor_source_selection'), None),
    ('frontier_recovery_epoch', '/read/checkpoint/generations/*/frontier/source_selection/recovery_epoch', "equals the birth anchor selection's (typed)",
     'index_frontier_recovery_epoch', frontier_recovery_epoch, ('frontier_source_selection', 'anchor_source_selection'), None),
    ('frontier_excluded_ranges_sha256', '/read/checkpoint/generations/*/frontier/source_selection/excluded_ranges_sha256', "equals the birth anchor selection's (typed)",
     'index_frontier_excluded_ranges_sha256', frontier_excluded_ranges_sha256, ('frontier_source_selection', 'anchor_source_selection'), None),
    ('frontier_retired_inputs_sha256', '/read/checkpoint/generations/*/frontier/source_selection/retired_inputs_sha256', "equals the birth anchor selection's (typed)",
     'index_frontier_retired_inputs_sha256', frontier_retired_inputs_sha256, ('frontier_source_selection', 'anchor_source_selection'), None),
    ('anchor_sequence_gaps_sha256', '/read/checkpoint/generations/*/anchor/sequence_gaps_sha256', 'equals the binding digest of the empty gap list',
     'index_anchor_sequence_gaps_sha256', anchor_sequence_gaps_sha256, ('anchor', 'empty_gaps_sha256'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('frontier_current_bytes_sha256', g.Invariant('/read/checkpoint/generations/*/frontier/source_selection/current_bytes_sha256', "equals the birth anchor selection's (typed)"), 'index_frontier_current_bytes_sha256', frontier_current_bytes_sha256),
        g.Guard('frontier_recovery_epoch', g.Invariant('/read/checkpoint/generations/*/frontier/source_selection/recovery_epoch', "equals the birth anchor selection's (typed)"), 'index_frontier_recovery_epoch', frontier_recovery_epoch),
        g.Guard('frontier_excluded_ranges_sha256', g.Invariant('/read/checkpoint/generations/*/frontier/source_selection/excluded_ranges_sha256', "equals the birth anchor selection's (typed)"), 'index_frontier_excluded_ranges_sha256', frontier_excluded_ranges_sha256),
        g.Guard('frontier_retired_inputs_sha256', g.Invariant('/read/checkpoint/generations/*/frontier/source_selection/retired_inputs_sha256', "equals the birth anchor selection's (typed)"), 'index_frontier_retired_inputs_sha256', frontier_retired_inputs_sha256),
        g.Guard('anchor_sequence_gaps_sha256', g.Invariant('/read/checkpoint/generations/*/anchor/sequence_gaps_sha256', 'equals the binding digest of the empty gap list'), 'index_anchor_sequence_gaps_sha256', anchor_sequence_gaps_sha256),
    ])
    context = None

    def check(complete):
        table.require('frontier_current_bytes_sha256', complete, context)
        table.require('frontier_recovery_epoch', complete, context)
        table.require('frontier_excluded_ranges_sha256', complete, context)
        table.require('frontier_retired_inputs_sha256', complete, context)
        table.require('anchor_sequence_gaps_sha256', complete, context)
        return True
    return g.Case(table, check, context)
