"""DO guard suite `pack_integrity_1` (sweep part 2A). Pack entry: identity, size and durability recomputed from the value.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g

HEX = '0123456789abcdef'

PACK_MEMBERS = {'blake3_id', 'byte_size', 'media_type', 'value', 'bytes_durable', 'index_durable'}

LIMIT = 16384


def pack_identifier_recomputed(value, context):
    expected = value['expected_entry']
    if expected is None:
        return None
    ident = value['entry']['blake3_id']
    well_formed = type(ident) is str and len(ident) == 71 and ident.startswith('blake3:') and all(ch in HEX for ch in ident[7:])
    if not well_formed:
        return None
    return 'payload_pack_integrity_or_durability' if ident != expected['blake3_id'] else None


def pack_size_recomputed(value, context):
    expected = value['expected_entry']
    if expected is None:
        return None
    size = value['entry']['byte_size']
    if not (type(size) is int or (type(size) is float and size % 1 == 0)):
        return None
    return 'payload_pack_integrity_or_durability' if size != expected['byte_size'] else None


def pack_bytes_durable(value, context):
    if value['expected_entry'] is None or type(value['entry']['bytes_durable']) is not bool:
        return None
    return 'payload_pack_integrity_or_durability' if value['entry']['bytes_durable'] is not True else None


def pack_index_durable(value, context):
    if value['expected_entry'] is None or type(value['entry']['index_durable']) is not bool:
        return None
    return 'payload_pack_integrity_or_durability' if value['entry']['index_durable'] is not True else None


def pack_large_size(value, context):
    if value['large'] is not True or value['expected_entry'] is None:
        return None
    size = value['entry']['byte_size']
    if not (type(size) is int or (type(size) is float and size % 1 == 0)):
        return None
    return 'payload_pack_integrity_or_durability' if size <= LIMIT else None


ROWS = (
    ('pack_identifier_recomputed', '/payload_packs/*/blake3_id', 'equals the BLAKE3 of the encoded value',
     'payload_pack_integrity_or_durability', pack_identifier_recomputed, ('entry', 'expected_entry'), 'pack_integrity'),
    ('pack_size_recomputed', '/payload_packs/*/byte_size', 'equals the length of the encoded value',
     'payload_pack_integrity_or_durability', pack_size_recomputed, ('entry', 'expected_entry'), 'pack_integrity'),
    ('pack_bytes_durable', '/payload_packs/*/bytes_durable', 'is true',
     'payload_pack_integrity_or_durability', pack_bytes_durable, ('entry', 'expected_entry'), 'pack_integrity'),
    ('pack_index_durable', '/payload_packs/*/index_durable', 'is true',
     'payload_pack_integrity_or_durability', pack_index_durable, ('entry', 'expected_entry'), 'pack_integrity'),
    ('pack_large_size', '/payload_packs/*/byte_size', 'exceeds 16 KiB for an externalized (large) value',
     'payload_pack_integrity_or_durability', pack_large_size, ('entry', 'large', 'expected_entry'), 'pack_integrity'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('pack_identifier_recomputed', g.Invariant('/payload_packs/*/blake3_id', 'equals the BLAKE3 of the encoded value'), 'payload_pack_integrity_or_durability', pack_identifier_recomputed),
        g.Guard('pack_size_recomputed', g.Invariant('/payload_packs/*/byte_size', 'equals the length of the encoded value'), 'payload_pack_integrity_or_durability', pack_size_recomputed),
        g.Guard('pack_bytes_durable', g.Invariant('/payload_packs/*/bytes_durable', 'is true'), 'payload_pack_integrity_or_durability', pack_bytes_durable),
        g.Guard('pack_index_durable', g.Invariant('/payload_packs/*/index_durable', 'is true'), 'payload_pack_integrity_or_durability', pack_index_durable),
        g.Guard('pack_large_size', g.Invariant('/payload_packs/*/byte_size', 'exceeds 16 KiB for an externalized (large) value'), 'payload_pack_integrity_or_durability', pack_large_size),
    ])
    context = None

    def check(complete):
        table.require('pack_identifier_recomputed', complete, context)
        table.require('pack_size_recomputed', complete, context)
        table.require('pack_bytes_durable', complete, context)
        table.require('pack_index_durable', complete, context)
        table.require('pack_large_size', complete, context)
        return True
    return g.Case(table, check, context)
