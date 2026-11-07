"""DO guard suite `transport_external_1` (sweep part 2A). Transport: the SP-337 external payload join (after the PACK rows on its entry).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def external_payload_empty(value, context):
    event = value['event']
    if event['payload_ref'] is None:
        return None
    return 'external_payload_join' if event['payload'] != {} else None


def external_entry_present(value, context):
    if value['event']['payload_ref'] is None:
        return None
    return 'external_payload_join' if not value['payload_entry'] else None


def external_entry_value(value, context):
    entry = value['payload_entry']
    if value['event']['payload_ref'] is None or not entry or type(entry) is not dict:
        return None
    return 'external_payload_join' if entry.get('value') != value['logical'] else None


def external_entry_id(value, context):
    entry = value['payload_entry']
    if value['event']['payload_ref'] is None or not entry or type(entry) is not dict:
        return None
    return 'external_payload_join' if entry.get('blake3_id') != value['event']['payload_ref'] else None


def external_entry_media(value, context):
    entry = value['payload_entry']
    if value['event']['payload_ref'] is None or not entry or type(entry) is not dict:
        return None
    return 'external_payload_join' if entry.get('media_type') != 'application/msgpack' else None


ROWS = (
    ('external_payload_empty', '/event/payload', 'is {} when payload_ref is set',
     'external_payload_join', external_payload_empty, ('event',), 'external_join'),
    ('external_entry_present', '/payload_packs/{payload_ref}', 'exists',
     'external_payload_join', external_entry_present, ('event', 'payload_entry'), 'external_join'),
    ('external_entry_value', '/payload_packs/{payload_ref}/value', 'equals the logical payload',
     'external_payload_join', external_entry_value, ('event', 'payload_entry', 'logical'), 'external_join'),
    ('external_entry_id', '/payload_packs/{payload_ref}/blake3_id', 'equals payload_ref',
     'external_payload_join', external_entry_id, ('event', 'payload_entry'), 'external_join'),
    ('external_entry_media', '/payload_packs/{payload_ref}/media_type', 'is application/msgpack',
     'external_payload_join', external_entry_media, ('event', 'payload_entry'), 'external_join'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('external_payload_empty', g.Invariant('/event/payload', 'is {} when payload_ref is set'), 'external_payload_join', external_payload_empty),
        g.Guard('external_entry_present', g.Invariant('/payload_packs/{payload_ref}', 'exists'), 'external_payload_join', external_entry_present),
        g.Guard('external_entry_value', g.Invariant('/payload_packs/{payload_ref}/value', 'equals the logical payload'), 'external_payload_join', external_entry_value),
        g.Guard('external_entry_id', g.Invariant('/payload_packs/{payload_ref}/blake3_id', 'equals payload_ref'), 'external_payload_join', external_entry_id),
        g.Guard('external_entry_media', g.Invariant('/payload_packs/{payload_ref}/media_type', 'is application/msgpack'), 'external_payload_join', external_entry_media),
    ])
    context = None

    def check(complete):
        table.require('external_payload_empty', complete, context)
        table.require('external_entry_present', complete, context)
        table.require('external_entry_value', complete, context)
        table.require('external_entry_id', complete, context)
        table.require('external_entry_media', complete, context)
        return True
    return g.Case(table, check, context)
