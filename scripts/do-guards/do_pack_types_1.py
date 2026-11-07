"""DO guard suite `pack_types_1` (sweep part 2A). Pack entry: member types (pack_errors stops after them).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def pack_type_byte_size(value, context):
    size = value['entry']['byte_size']
    return 'payload_pack_types' if not (type(size) is int or (type(size) is float and size % 1 == 0)) else None


def pack_type_bytes_durable(value, context):
    return 'payload_pack_types' if type(value['entry']['bytes_durable']) is not bool else None


def pack_type_index_durable(value, context):
    return 'payload_pack_types' if type(value['entry']['index_durable']) is not bool else None


def pack_type_msgpack_value(value, context):
    entry = value['entry']
    if entry['media_type'] != 'application/msgpack':
        return None
    return 'payload_pack_types' if type(entry['value']) is not dict else None


def pack_type_text_value(value, context):
    entry = value['entry']
    if entry['media_type'] != 'text/plain; charset=utf-8':
        return None
    return 'payload_pack_types' if type(entry['value']) is not str else None


ROWS = (
    ('pack_type_byte_size', '/payload_packs/*/byte_size', 'is a JSON integer',
     'payload_pack_types', pack_type_byte_size, ('entry',), 'pack_types'),
    ('pack_type_bytes_durable', '/payload_packs/*/bytes_durable', 'is a boolean',
     'payload_pack_types', pack_type_bytes_durable, ('entry',), 'pack_types'),
    ('pack_type_index_durable', '/payload_packs/*/index_durable', 'is a boolean',
     'payload_pack_types', pack_type_index_durable, ('entry',), 'pack_types'),
    ('pack_type_msgpack_value', '/payload_packs/*/value', 'is an object when the media type is application/msgpack',
     'payload_pack_types', pack_type_msgpack_value, ('entry',), 'pack_types'),
    ('pack_type_text_value', '/payload_packs/*/value', 'is a string when the media type is UTF-8 text',
     'payload_pack_types', pack_type_text_value, ('entry',), 'pack_types'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('pack_type_byte_size', g.Invariant('/payload_packs/*/byte_size', 'is a JSON integer'), 'payload_pack_types', pack_type_byte_size),
        g.Guard('pack_type_bytes_durable', g.Invariant('/payload_packs/*/bytes_durable', 'is a boolean'), 'payload_pack_types', pack_type_bytes_durable),
        g.Guard('pack_type_index_durable', g.Invariant('/payload_packs/*/index_durable', 'is a boolean'), 'payload_pack_types', pack_type_index_durable),
        g.Guard('pack_type_msgpack_value', g.Invariant('/payload_packs/*/value', 'is an object when the media type is application/msgpack'), 'payload_pack_types', pack_type_msgpack_value),
        g.Guard('pack_type_text_value', g.Invariant('/payload_packs/*/value', 'is a string when the media type is UTF-8 text'), 'payload_pack_types', pack_type_text_value),
    ])
    context = None

    def check(complete):
        table.require('pack_type_byte_size', complete, context)
        table.require('pack_type_bytes_durable', complete, context)
        table.require('pack_type_index_durable', complete, context)
        table.require('pack_type_msgpack_value', complete, context)
        table.require('pack_type_text_value', complete, context)
        return True
    return g.Case(table, check, context)
