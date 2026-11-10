"""DR guard table decode_envelope: Full-envelope decode: dispatch, storage route, provider source and joins.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('event_type', 'row_event_type', 'payload_schema_id', 'row_payload_schema_id', 'scope_kind', 'replay_policy', 'redaction_profile', 'route', 'inline_size')


def D02a_family(value, context):
    return 'wrong family/schema' if value['event_type'] != value['row_event_type'] else None


def D02b_payload_schema(value, context):
    return 'wrong family/schema' if value['payload_schema_id'] != value['row_payload_schema_id'] else None


def D03a_scope(value, context):
    return 'wrong scope/replay/redaction' if value['scope_kind'] != 'project' else None


def D03b_replay(value, context):
    return 'wrong scope/replay/redaction' if value['replay_policy'] != 'dedupe_by_idempotency_key' else None


def D03c_redaction(value, context):
    return 'wrong scope/replay/redaction' if value['redaction_profile'] != 'no_secrets' else None


def D04q_inline_jcs(value, context):
    return 'unqualified JCS payload' if value['route'] == 'inline' and value['inline_size'] is None else None


def D04_inline_size(value, context):
    return 'oversized inline' if value['route'] == 'inline' and value['inline_size'] is not None and value['inline_size'] > 16384 else None


def envelope_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('D02a_family', g.Invariant('/event_type', 'equals the draft row event type'), 'wrong family/schema', D02a_family),
        g.Guard('D02b_payload_schema', g.Invariant('/payload_schema_id', 'equals the draft row payload schema id'), 'wrong family/schema', D02b_payload_schema),
        g.Guard('D03a_scope', g.Invariant('/scope_kind', 'is project'), 'wrong scope/replay/redaction', D03a_scope),
        g.Guard('D03b_replay', g.Invariant('/replay_policy', 'is dedupe_by_idempotency_key'), 'wrong scope/replay/redaction', D03b_replay),
        g.Guard('D03c_redaction', g.Invariant('/redaction_profile', 'is no_secrets'), 'wrong scope/replay/redaction', D03c_redaction),
        g.Guard('D04q_inline_jcs', g.Invariant('/inline_size', 'an inline payload has a qualified RFC 8785 encoding (CV-1100 qualified_jcs)'), 'unqualified JCS payload', D04q_inline_jcs),
        g.Guard('D04_inline_size', g.Invariant('/inline_size', 'an inline payload has a canonical encoding of at most 16384 bytes'), 'oversized inline', D04_inline_size),
    ])

    def check(value):
        table.require('D02a_family', value, context)
        table.require('D02b_payload_schema', value, context)
        table.require('D03a_scope', value, context)
        table.require('D03b_replay', value, context)
        table.require('D03c_redaction', value, context)
        table.require('D04q_inline_jcs', value, context)
        table.require('D04_inline_size', value, context)
        return True
    return g.Case(table, check, context)
