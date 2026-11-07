"""DO guard suite `project_input_type_9` (sweep part 2A). Project original input adapter: exact types (OSI-247/299/301; project_original_input_errors stops after them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g

REF_FIELDS = {'blake3_id', 'byte_size', 'media_type'}


def project_content_ref_members(value, context):
    ref = value['message']['content_ref']
    if type(ref) is not dict:
        return None
    return 'project_original_input_type' if set(ref.keys()) != REF_FIELDS else None


def project_content_ref_blake3_id_type(value, context):
    ref = value['message']['content_ref']
    if type(ref) is not dict or set(ref.keys()) != REF_FIELDS:
        return None
    return 'project_original_input_type' if type(ref['blake3_id']) is not str else None


def project_content_ref_media_type_type(value, context):
    ref = value['message']['content_ref']
    if type(ref) is not dict or set(ref.keys()) != REF_FIELDS:
        return None
    return 'project_original_input_type' if type(ref['media_type']) is not str else None


def project_content_ref_byte_size_type(value, context):
    ref = value['message']['content_ref']
    if type(ref) is not dict or set(ref.keys()) != REF_FIELDS:
        return None
    return 'project_original_input_type' if not (type(ref['byte_size']) is int or (type(ref['byte_size']) is float and ref['byte_size'] % 1 == 0)) else None


ROWS = (
    ('project_content_ref_members', '/source/original_input/content_ref', 'has exactly blake3_id, byte_size and media_type',
     'project_original_input_type', project_content_ref_members, ('message',), 'project_type'),
    ('project_content_ref_blake3_id_type', '/source/original_input/content_ref/blake3_id', 'is a string',
     'project_original_input_type', project_content_ref_blake3_id_type, ('message',), 'project_type'),
    ('project_content_ref_media_type_type', '/source/original_input/content_ref/media_type', 'is a string',
     'project_original_input_type', project_content_ref_media_type_type, ('message',), 'project_type'),
    ('project_content_ref_byte_size_type', '/source/original_input/content_ref/byte_size', 'is a JSON integer',
     'project_original_input_type', project_content_ref_byte_size_type, ('message',), 'project_type'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('project_content_ref_members', g.Invariant('/source/original_input/content_ref', 'has exactly blake3_id, byte_size and media_type'), 'project_original_input_type', project_content_ref_members),
        g.Guard('project_content_ref_blake3_id_type', g.Invariant('/source/original_input/content_ref/blake3_id', 'is a string'), 'project_original_input_type', project_content_ref_blake3_id_type),
        g.Guard('project_content_ref_media_type_type', g.Invariant('/source/original_input/content_ref/media_type', 'is a string'), 'project_original_input_type', project_content_ref_media_type_type),
        g.Guard('project_content_ref_byte_size_type', g.Invariant('/source/original_input/content_ref/byte_size', 'is a JSON integer'), 'project_original_input_type', project_content_ref_byte_size_type),
    ])
    context = None

    def check(complete):
        table.require('project_content_ref_members', complete, context)
        table.require('project_content_ref_blake3_id_type', complete, context)
        table.require('project_content_ref_media_type_type', complete, context)
        table.require('project_content_ref_byte_size_type', complete, context)
        return True
    return g.Case(table, check, context)
