"""DO guard suite `append_references_1` (sweep part 2A). Append: eager offline resolution of every schema reference.

The predicates are the lane's production guards: `pm_orchestrator_event_guards` assembles the tables from
every suite's ROWS and the lane's checkers run them. The factory at the end is the guard tool's adapter for exactly
these rows; `scripts/pm-orchestrator-guard-proof.py generate` writes it and `check` verifies it.
"""
import pm_guard_isolation as g


def append_schema_references(value, context):
    return 'unresolved_schema_reference' if value['schema_reference_errors'] else None


ROWS = (
    ('append_schema_references', '/definition', "the family's payload definition resolves every $ref offline",
     'unresolved_schema_reference', append_schema_references, ('schema_reference_errors',), None),
)


# ---- generated factory ----

def factory():
    table = g.GuardTable([
        g.Guard('append_schema_references', g.Invariant('/definition', "the family's payload definition resolves every $ref offline"), 'unresolved_schema_reference', append_schema_references),
    ])
    context = None

    def check(complete):
        table.require('append_schema_references', complete, context)
        return True
    return g.Case(table, check, context)
