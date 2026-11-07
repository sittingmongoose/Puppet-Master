"""DR guard table stored: Lexical validation of a stored original EventRecord copy.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('scope_kind', 'replay_policy', 'route', 'ref_grammar', 'placeholder', 'dispatch_found', 'inline_size')


def V02a_scope(value, context):
    return 'stored_invalid' if value['scope_kind'] != 'project' else None


def V02b_replay(value, context):
    return 'stored_invalid' if value['replay_policy'] != 'dedupe_by_idempotency_key' else None


def V03_ref_grammar(value, context):
    return 'stored_invalid' if value['route'] == 'packed' and value['ref_grammar'] is not True else None


def V04_placeholder(value, context):
    return 'stored_invalid' if value['route'] == 'packed' and value['placeholder'] != {} else None


def V07_dispatch(value, context):
    return 'stored_invalid' if value['route'] == 'inline' and value['dispatch_found'] is not True else None


def V05_inline_size(value, context):
    return 'stored_invalid' if value['route'] == 'inline' and (value['inline_size'] is None or value['inline_size'] > 16384) else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('V02a_scope', g.Invariant('/scope_kind', 'is project'), 'stored_invalid', V02a_scope),
        g.Guard('V02b_replay', g.Invariant('/replay_policy', 'is dedupe_by_idempotency_key'), 'stored_invalid', V02b_replay),
        g.Guard('V03_ref_grammar', g.Invariant('/ref_grammar', 'a stored payload_ref is a full-match pack reference'), 'stored_invalid', V03_ref_grammar),
        g.Guard('V04_placeholder', g.Invariant('/placeholder', 'a stored packed event has the empty-object placeholder'), 'stored_invalid', V04_placeholder),
        g.Guard('V07_dispatch', g.Invariant('/dispatch_found', 'a stored inline event dispatches to a draft row by family and schema id'), 'stored_invalid', V07_dispatch),
        g.Guard('V05_inline_size', g.Invariant('/inline_size', 'a stored inline payload has a canonical encoding of at most 16384 bytes'), 'stored_invalid', V05_inline_size),
    ])

    def check(value):
        table.require('V02a_scope', value, context)
        table.require('V02b_replay', value, context)
        table.require('V03_ref_grammar', value, context)
        table.require('V04_placeholder', value, context)
        table.require('V07_dispatch', value, context)
        table.require('V05_inline_size', value, context)
        return True
    return g.Case(table, check, context)
