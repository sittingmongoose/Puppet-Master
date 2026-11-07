"""DO guard suite `transport_content_1` (sweep part 2A). Transport: the content reference join (after the PACK rows on its entry).

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def content_entry_present(value, context):
    logical = value['logical']
    if type(logical) is not dict or 'content_ref' not in logical:
        return None
    return 'content_reference_join' if not value['content_entry'] else None


def content_entry_fields(value, context):
    logical, entry = value['logical'], value['content_entry']
    if type(logical) is not dict or 'content_ref' not in logical or not entry or type(entry) is not dict:
        return None
    for key, member in logical['content_ref'].items():
        if entry.get(key) != member:
            return 'content_reference_join'
    return None


ROWS = (
    ('content_entry_present', '/payload_packs/{content_ref.blake3_id}', 'exists when the payload has a content_ref',
     'content_reference_join', content_entry_present, ('logical', 'content_entry'), 'content_join'),
    ('content_entry_fields', '/payload_packs/{content_ref.blake3_id}', 'holds every content_ref member unchanged',
     'content_reference_join', content_entry_fields, ('logical', 'content_entry'), 'content_join'),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('content_entry_present', g.Invariant('/payload_packs/{content_ref.blake3_id}', 'exists when the payload has a content_ref'), 'content_reference_join', content_entry_present),
        g.Guard('content_entry_fields', g.Invariant('/payload_packs/{content_ref.blake3_id}', 'holds every content_ref member unchanged'), 'content_reference_join', content_entry_fields),
    ])
    context = None

    def check(complete):
        table.require('content_entry_present', complete, context)
        table.require('content_entry_fields', complete, context)
        return True
    return g.Case(table, check, context)
