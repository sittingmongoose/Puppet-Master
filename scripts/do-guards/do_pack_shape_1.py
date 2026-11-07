"""DO guard suite `pack_shape_1` (sweep part 2A). Pack entry: shape (pack_errors stops after it).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g

PACK_MEMBERS = {'blake3_id', 'byte_size', 'media_type', 'value', 'bytes_durable', 'index_durable'}


def pack_shape_object(value, context):
    return 'payload_pack_shape' if type(value['entry']) is not dict else None


def pack_shape_members(value, context):
    entry = value['entry']
    if type(entry) is not dict:
        return None
    return 'payload_pack_shape' if set(entry.keys()) != PACK_MEMBERS else None


ROWS = (
    ('pack_shape_object', '/payload_packs/*', 'is an object',
     'payload_pack_shape', pack_shape_object, ('entry',), 'pack_shape'),
    ('pack_shape_members', '/payload_packs/*', 'has exactly the six SP-337 members',
     'payload_pack_shape', pack_shape_members, ('entry',), 'pack_shape'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('pack_shape_object', g.Invariant('/payload_packs/*', 'is an object'), 'payload_pack_shape', pack_shape_object),
        g.Guard('pack_shape_members', g.Invariant('/payload_packs/*', 'has exactly the six SP-337 members'), 'payload_pack_shape', pack_shape_members),
    ])
    context = None

    def check(complete):
        table.require('pack_shape_object', complete, context)
        table.require('pack_shape_members', complete, context)
        return True
    return g.Case(table, check, context)
