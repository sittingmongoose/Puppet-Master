"""DO guard suite `pack_identifier_1` (sweep part 2A). Pack entry: media type and identifier form (pack_errors stops after them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g

HEX = '0123456789abcdef'


def pack_media_type(value, context):
    media = value['entry']['media_type']
    allowed = media == 'application/msgpack' or media == 'text/plain; charset=utf-8'
    return 'payload_pack_identifier' if not allowed else None


def pack_identifier_string(value, context):
    return 'payload_pack_identifier' if type(value['entry']['blake3_id']) is not str else None


def pack_identifier_form(value, context):
    ident = value['entry']['blake3_id']
    if type(ident) is not str:
        return None
    well_formed = len(ident) == 71 and ident.startswith('blake3:') and all(ch in HEX for ch in ident[7:])
    return 'payload_pack_identifier' if not well_formed else None


ROWS = (
    ('pack_media_type', '/payload_packs/*/media_type', 'is application/msgpack or UTF-8 text',
     'payload_pack_identifier', pack_media_type, ('entry',), 'pack_identifier'),
    ('pack_identifier_string', '/payload_packs/*/blake3_id', 'is a string',
     'payload_pack_identifier', pack_identifier_string, ('entry',), 'pack_identifier'),
    ('pack_identifier_form', '/payload_packs/*/blake3_id', "full-matches 'blake3:' + 64 lowercase hex",
     'payload_pack_identifier', pack_identifier_form, ('entry',), 'pack_identifier'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('pack_media_type', g.Invariant('/payload_packs/*/media_type', 'is application/msgpack or UTF-8 text'), 'payload_pack_identifier', pack_media_type),
        g.Guard('pack_identifier_string', g.Invariant('/payload_packs/*/blake3_id', 'is a string'), 'payload_pack_identifier', pack_identifier_string),
        g.Guard('pack_identifier_form', g.Invariant('/payload_packs/*/blake3_id', "full-matches 'blake3:' + 64 lowercase hex"), 'payload_pack_identifier', pack_identifier_form),
    ])
    context = None

    def check(complete):
        table.require('pack_media_type', complete, context)
        table.require('pack_identifier_string', complete, context)
        table.require('pack_identifier_form', complete, context)
        return True
    return g.Case(table, check, context)
