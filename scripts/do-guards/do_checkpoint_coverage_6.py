"""DO guard suite `checkpoint_coverage_6` (sweep part 2A). Checkpoint read: the frontier coverage, sequence, segment, selection, gap, locator and generation copies (DO-P1F04/05/06).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def anchor_retained_event_count(value, context):
    count = value['anchor']['retained_event_count']
    return 'index_anchor_retained_event_count' if type(count) is not int or count != 1 else None


def segment_name_generation(value, context):
    if value['coverage']['last_frame'] is None:
        return None
    groups = value['frame_segment_name_groups']
    if groups is None or groups[0] != value['frame_generation_digits']:
        return 'index_coverage_segment_name_generation'
    return None


def segment_name_state(value, context):
    groups, segments = value['frame_segment_name_groups'], value['coverage']['segments']
    if groups is None or not segments:
        return None
    state = segments[0]['state']
    active = type(state) is str and state == 'active'
    return 'index_coverage_segment_name_state' if (groups[2] is None) != active else None


def anchor_selected_segment_generation(value, context):
    frame = value['coverage']['last_frame']
    if type(frame) is not dict:
        return None
    left, right = value['anchor_source_selection']['selected_segment_generation'], frame['segment_generation']
    return 'index_anchor_selected_segment_generation' if type(left) is not type(right) or left != right else None


def frontier_selected_segment_generation(value, context):
    frame = value['coverage']['last_frame']
    if type(frame) is not dict:
        return None
    left, right = value['frontier_source_selection']['selected_segment_generation'], frame['segment_generation']
    return 'index_frontier_selected_segment_generation' if type(left) is not type(right) or left != right else None


ROWS = (
    ('anchor_retained_event_count', '/read/checkpoint/generations/*/anchor/retained_event_count', 'is exactly the integer 1',
     'index_anchor_retained_event_count', anchor_retained_event_count, ('anchor',), None),
    ('segment_name_generation', '/read/checkpoint/generations/*/frontier/coverage/last_frame/segment_name', "generation field is the last frame's segment generation in at least six digits",
     'index_coverage_segment_name_generation', segment_name_generation, ('coverage', 'frame_segment_name_groups', 'frame_generation_digits'), None),
    ('segment_name_state', '/read/checkpoint/generations/*/frontier/coverage/last_frame/segment_name', "is the .active form exactly when the segment state is 'active'",
     'index_coverage_segment_name_state', segment_name_state, ('coverage', 'frame_segment_name_groups'), None),
    ('anchor_selected_segment_generation', '/read/checkpoint/generations/*/anchor/source_selection/selected_segment_generation', "equals the last frame's segment generation (typed)",
     'index_anchor_selected_segment_generation', anchor_selected_segment_generation, ('coverage', 'anchor_source_selection'), None),
    ('frontier_selected_segment_generation', '/read/checkpoint/generations/*/frontier/source_selection/selected_segment_generation', "equals the last frame's segment generation (typed)",
     'index_frontier_selected_segment_generation', frontier_selected_segment_generation, ('coverage', 'frontier_source_selection'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('anchor_retained_event_count', g.Invariant('/read/checkpoint/generations/*/anchor/retained_event_count', 'is exactly the integer 1'), 'index_anchor_retained_event_count', anchor_retained_event_count),
        g.Guard('segment_name_generation', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/last_frame/segment_name', "generation field is the last frame's segment generation in at least six digits"), 'index_coverage_segment_name_generation', segment_name_generation),
        g.Guard('segment_name_state', g.Invariant('/read/checkpoint/generations/*/frontier/coverage/last_frame/segment_name', "is the .active form exactly when the segment state is 'active'"), 'index_coverage_segment_name_state', segment_name_state),
        g.Guard('anchor_selected_segment_generation', g.Invariant('/read/checkpoint/generations/*/anchor/source_selection/selected_segment_generation', "equals the last frame's segment generation (typed)"), 'index_anchor_selected_segment_generation', anchor_selected_segment_generation),
        g.Guard('frontier_selected_segment_generation', g.Invariant('/read/checkpoint/generations/*/frontier/source_selection/selected_segment_generation', "equals the last frame's segment generation (typed)"), 'index_frontier_selected_segment_generation', frontier_selected_segment_generation),
    ])
    context = None

    def check(complete):
        table.require('anchor_retained_event_count', complete, context)
        table.require('segment_name_generation', complete, context)
        table.require('segment_name_state', complete, context)
        table.require('anchor_selected_segment_generation', complete, context)
        table.require('frontier_selected_segment_generation', complete, context)
        return True
    return g.Case(table, check, context)
