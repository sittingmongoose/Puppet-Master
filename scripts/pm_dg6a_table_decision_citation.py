"""DG6A guard table decision_citation: the Card 5 manifest cites the landed Decision Log.

Method B guard rows (scripts/pm_guard_isolation.py) for
scripts/pm-card5-event-contracts-check.py::decision_citation_errors. Each
predicate reads one observation the checker derives from the complete
(manifest, family, log) input; predicates never recompute, repair or call
helpers. The checker refuses this phase only through these rows, in this
order, and returns the first row's refusal code as its one-element list.
FIELDS names every observation the rows read; the checker passes no other.
DC05 is entailed by DC03/DC04 (its section and text exist only once the entry
is unique and the option is a string), so it refuses only under those two
rows' facts, as in the DS15 follower rows.
"""
import pm_guard_isolation as g

FIELDS = ('source_is_landed_log', 'branch_key_present', 'entry_is_unique', 'option_is_string', 'option_text_in_section')


def DC01_source_is_landed_log(value, context):
    return 'decision_source' if value['source_is_landed_log'] is not True else None


def DC02_no_branch_key(value, context):
    return 'decision_branch_retained' if value['branch_key_present'] is not False else None


def DC03_entry_is_unique(value, context):
    return 'decision_entry' if value['entry_is_unique'] is not True else None


def DC04_option_is_string(value, context):
    return 'decision_option_text' if value['option_is_string'] is not True else None


def DC05_option_text_in_section(value, context):
    return 'decision_option_text' if value['entry_is_unique'] is True and value['option_is_string'] is True and value['option_text_in_section'] is not True else None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('DC01_source_is_landed_log', g.Invariant('/source_is_landed_log', 'manifest decision_source is exactly Plans/Decision_Log.md'), 'decision_source', DC01_source_is_landed_log),
        g.Guard('DC02_no_branch_key', g.Invariant('/branch_key_present', 'manifest carries no decision_branch key'), 'decision_branch_retained', DC02_no_branch_key),
        g.Guard('DC03_entry_is_unique', g.Invariant('/entry_is_unique', 'the landed log holds exactly one entry heading for the family decision'), 'decision_entry', DC03_entry_is_unique),
        g.Guard('DC04_option_is_string', g.Invariant('/option_is_string', 'family option_a is exactly a string'), 'decision_option_text', DC04_option_is_string),
        g.Guard('DC05_option_text_in_section', g.Invariant('/option_text_in_section', 'the exact option A line stands in the family decision entry section'), 'decision_option_text', DC05_option_text_in_section),
    ])

    def check(value):
        table.require('DC01_source_is_landed_log', value, context)
        table.require('DC02_no_branch_key', value, context)
        table.require('DC03_entry_is_unique', value, context)
        table.require('DC04_option_is_string', value, context)
        table.require('DC05_option_text_in_section', value, context)
        return True
    return g.Case(table, check, context)
