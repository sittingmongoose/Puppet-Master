"""DO guard suite `pack_encoding_1` (sweep part 2A). Pack entry: the value encodes under its media type (pack_errors stops after it).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def pack_encoding(value, context):
    # The encoding is attempted only for an entry of the right shape, types and media (the lane stops before it
    # otherwise), so None means "not reached", never a pass of a broken entry.
    return 'payload_pack_encoding' if value['pack_encoding_failed'] is True else None


ROWS = (
    ('pack_encoding', '/payload_packs/*/value', 'encodes under its media type',
     'payload_pack_encoding', pack_encoding, ('pack_encoding_failed',), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('pack_encoding', g.Invariant('/payload_packs/*/value', 'encodes under its media type'), 'payload_pack_encoding', pack_encoding),
    ])
    context = None

    def check(complete):
        table.require('pack_encoding', complete, context)
        return True
    return g.Case(table, check, context)
