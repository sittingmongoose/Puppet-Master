"""DO guard suite `checkpoint_coverage_9` (sweep part 2A). Checkpoint read: the frontier coverage, sequence, segment, selection, gap, locator and generation copies (DO-P1F04/05/06).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def row_source_sequence_id(value, context):
    row = value['row']
    source = {}
    if 'source_locator' in row and type(row['source_locator']) is dict:
        source = row['source_locator']
    left = source.get('sequence_id')
    right = value['event_sequence_id']
    return 'index_row_source_sequence_id' if type(left) is not type(right) or left != right else None


def row_translation_ref(value, context):
    row = value['row']
    locator = {}
    if 'publication_locator' in row and type(row['publication_locator']) is dict:
        locator = row['publication_locator']
    ref = locator.get('compaction_translation_manifest_ref')
    if ref is None:
        return None
    translation = value['current_translation']
    if type(translation) is dict:
        allowed = translation['manifest_ref']
        if type(ref) is type(allowed) and ref == allowed:
            return None
    return 'index_row_translation_ref'


def generation_id_copy(value, context):
    for key, node in value['generation_copies'].items():
        if type(node['generation_id']) is not str or node['generation_id'] != key:
            return 'index_generation_id'
    return None


def generation_dataset_name(value, context):
    for key, node in value['generation_copies'].items():
        name = node['index_dataset_name']
        if type(name) is not str or name != 'event_record_index.v2@' + key:
            return 'index_generation_dataset_name'
    return None


def generation_id_recipe(value, context):
    for key, recomputed in value['generation_recipe_ids'].items():
        if recomputed != key:
            return 'index_generation_id_recipe'
    return None


ROWS = (
    ('row_source_sequence_id', '/read/row/source_locator/sequence_id', "equals the event's sequence (typed)",
     'index_row_source_sequence_id', row_source_sequence_id, ('row', 'event_sequence_id'), None),
    ('row_translation_ref', '/read/row/publication_locator/compaction_translation_manifest_ref', "is null or the current translation's manifest ref",
     'index_row_translation_ref', row_translation_ref, ('row', 'current_translation'), None),
    ('generation_id_copy', '/read/checkpoint/generations/*/generation_id', 'equals its map key (typed)',
     'index_generation_id', generation_id_copy, ('generation_copies',), None),
    ('generation_dataset_name', '/read/checkpoint/generations/*/index_dataset_name', "equals 'event_record_index.v2@' + its map key (typed)",
     'index_generation_dataset_name', generation_dataset_name, ('generation_copies',), None),
    ('generation_id_recipe', '/read/checkpoint/generations/*', 'map key equals the SP-278 generation recipe recomputed from the node',
     'index_generation_id_recipe', generation_id_recipe, ('generation_recipe_ids',), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('row_source_sequence_id', g.Invariant('/read/row/source_locator/sequence_id', "equals the event's sequence (typed)"), 'index_row_source_sequence_id', row_source_sequence_id),
        g.Guard('row_translation_ref', g.Invariant('/read/row/publication_locator/compaction_translation_manifest_ref', "is null or the current translation's manifest ref"), 'index_row_translation_ref', row_translation_ref),
        g.Guard('generation_id_copy', g.Invariant('/read/checkpoint/generations/*/generation_id', 'equals its map key (typed)'), 'index_generation_id', generation_id_copy),
        g.Guard('generation_dataset_name', g.Invariant('/read/checkpoint/generations/*/index_dataset_name', "equals 'event_record_index.v2@' + its map key (typed)"), 'index_generation_dataset_name', generation_dataset_name),
        g.Guard('generation_id_recipe', g.Invariant('/read/checkpoint/generations/*', 'map key equals the SP-278 generation recipe recomputed from the node'), 'index_generation_id_recipe', generation_id_recipe),
    ])
    context = None

    def check(complete):
        table.require('row_source_sequence_id', complete, context)
        table.require('row_translation_ref', complete, context)
        table.require('generation_id_copy', complete, context)
        table.require('generation_dataset_name', complete, context)
        table.require('generation_id_recipe', complete, context)
        return True
    return g.Case(table, check, context)
