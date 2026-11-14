"""DO guard suite `project_input_value_2` (sweep part 2A). Project original input adapter: enumerations, format and body representation.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g

LIMIT = 16384
HEX = '0123456789abcdef'


def project_inline_body_value(value, context):
    if value['project_types_valid'] is not True:
        return None
    if value['message']['content'] is None:
        return None
    return 'project_original_input_value' if value['content_inline_body'] is not True else None


def project_ref_identifier_value(value, context):
    if value['project_types_valid'] is not True:
        return None
    ref = value['message']['content_ref']
    if ref is None:
        return None
    ident = ref['blake3_id']
    well_formed = len(ident) == 71 and ident.startswith('blake3:') and all(ch in HEX for ch in ident.replace('blake3:', '', 1))
    return 'project_original_input_value' if not well_formed else None


def project_ref_size_value(value, context):
    if value['project_types_valid'] is not True:
        return None
    ref = value['message']['content_ref']
    if ref is None:
        return None
    return 'project_original_input_value' if ref['byte_size'] <= LIMIT else None


def project_ref_media_value(value, context):
    if value['project_types_valid'] is not True:
        return None
    ref = value['message']['content_ref']
    if ref is None:
        return None
    return 'project_original_input_value' if ref['media_type'] != 'text/plain; charset=utf-8' else None


ROWS = (
    ('project_inline_body_value', '/source/original_input/content', 'is UTF-8 text of at most 16 KiB',
     'project_original_input_value', project_inline_body_value, ('message', 'content_inline_body', 'project_types_valid'), 'project_value'),
    ('project_ref_identifier_value', '/source/original_input/content_ref/blake3_id', "full-matches 'blake3:' + 64 lowercase hex",
     'project_original_input_value', project_ref_identifier_value, ('message', 'project_types_valid'), 'project_value'),
    ('project_ref_size_value', '/source/original_input/content_ref/byte_size', 'exceeds 16 KiB (only a large body is a reference)',
     'project_original_input_value', project_ref_size_value, ('message', 'project_types_valid'), 'project_value'),
    ('project_ref_media_value', '/source/original_input/content_ref/media_type', 'is UTF-8 text',
     'project_original_input_value', project_ref_media_value, ('message', 'project_types_valid'), 'project_value'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('project_inline_body_value', g.Invariant('/source/original_input/content', 'is UTF-8 text of at most 16 KiB'), 'project_original_input_value', project_inline_body_value),
        g.Guard('project_ref_identifier_value', g.Invariant('/source/original_input/content_ref/blake3_id', "full-matches 'blake3:' + 64 lowercase hex"), 'project_original_input_value', project_ref_identifier_value),
        g.Guard('project_ref_size_value', g.Invariant('/source/original_input/content_ref/byte_size', 'exceeds 16 KiB (only a large body is a reference)'), 'project_original_input_value', project_ref_size_value),
        g.Guard('project_ref_media_value', g.Invariant('/source/original_input/content_ref/media_type', 'is UTF-8 text'), 'project_original_input_value', project_ref_media_value),
    ])
    context = None

    def check(complete):
        table.require('project_inline_body_value', complete, context)
        table.require('project_ref_identifier_value', complete, context)
        table.require('project_ref_size_value', complete, context)
        table.require('project_ref_media_value', complete, context)
        return True
    return g.Case(table, check, context)
