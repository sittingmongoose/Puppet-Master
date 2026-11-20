"""The S6 reconstruction equality boundary, isolated as its own real table."""
import pm_guard_isolation as g


def occurrences(value, context):
    return 'edition_occurrence_mismatch' if value['occurrences_sha256'] != value['reconstructed_occurrences_sha256'] else None


def occurrence_case():
    table = g.GuardTable([
        g.Guard('occurrences', g.Invariant('/occurrences_sha256', 'equals canonical complete reconstruction SHA-256 from live source bytes'), 'edition_occurrence_mismatch', occurrences),
    ])

    def check(value):
        table.require('occurrences', value)
        return True

    return g.Case(table, check)
