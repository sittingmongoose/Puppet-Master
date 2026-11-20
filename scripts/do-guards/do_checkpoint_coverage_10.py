"""DO guard suite `checkpoint_coverage_10` (sweep part 2A). Checkpoint read: the frontier coverage, sequence, segment, selection, gap, locator and generation copies (DO-P1F04/05/06).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def generation_translation_origin(value, context):
    for node in value['generation_copies'].values():
        if node['translation'] is not None and (type(node['origin']) is not str or node['origin'] != 'compaction_shadow'):
            return 'index_generation_translation_origin'
    return None


def translation_target_selection(value, context):
    for key, node in value['generation_copies'].items():
        translation = node['translation']
        if translation is not None:
            left, right = translation['target_selection_sha256'], value['generation_birth_selection_sha256'][key]
            if type(left) is not type(right) or left != right:
                return 'index_translation_target_selection'
    return None


ROWS = (
    ('generation_translation_origin', '/read/checkpoint/generations/*/origin', "is 'compaction_shadow' wherever a translation is present",
     'index_generation_translation_origin', generation_translation_origin, ('generation_copies',), None),
    ('translation_target_selection', '/read/checkpoint/generations/*/translation/target_selection_sha256', "equals the binding digest of the node's birth selection",
     'index_translation_target_selection', translation_target_selection, ('generation_copies', 'generation_birth_selection_sha256'), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('generation_translation_origin', g.Invariant('/read/checkpoint/generations/*/origin', "is 'compaction_shadow' wherever a translation is present"), 'index_generation_translation_origin', generation_translation_origin),
        g.Guard('translation_target_selection', g.Invariant('/read/checkpoint/generations/*/translation/target_selection_sha256', "equals the binding digest of the node's birth selection"), 'index_translation_target_selection', translation_target_selection),
    ])
    context = None

    def check(complete):
        table.require('generation_translation_origin', complete, context)
        table.require('translation_target_selection', complete, context)
        return True
    return g.Case(table, check, context)
