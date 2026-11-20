"""DR guard table agreement_trace_flags: CV-526/CV-537 current-writer copied source agreement, one row per copy site.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('trace_flag_redacted', 'trace_flag_usage_observed', 'trace_flag_quota_observed', 'trace_retry_none', 'trace_retry_parent')


def trace_flag_redacted(value, context):
    for pair in value['trace_flag_redacted']:
        if pair[0] != pair[1]:
            return 'trace_flags: source/copy disagreement'
    return None


def trace_flag_usage_observed(value, context):
    for pair in value['trace_flag_usage_observed']:
        if pair[0] != pair[1]:
            return 'trace_flags: source/copy disagreement'
    return None


def trace_flag_quota_observed(value, context):
    for pair in value['trace_flag_quota_observed']:
        if pair[0] != pair[1]:
            return 'trace_flags: source/copy disagreement'
    return None


def trace_retry_none(value, context):
    for pair in value['trace_retry_none']:
        if pair[0] != pair[1]:
            return 'trace_retry: source/copy disagreement'
    return None


def trace_retry_parent(value, context):
    for pair in value['trace_retry_parent']:
        if pair[0] != pair[1]:
            return 'trace_retry: source/copy disagreement'
    return None


def trace_flags_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('trace_flag_redacted', g.Invariant('/trace_flag_redacted', 'flags.redacted matches a decided redaction status'), 'trace_flags: source/copy disagreement', trace_flag_redacted),
        g.Guard('trace_flag_usage_observed', g.Invariant('/trace_flag_usage_observed', 'flags.usage_observed is true when any usage source exists'), 'trace_flags: source/copy disagreement', trace_flag_usage_observed),
        g.Guard('trace_flag_quota_observed', g.Invariant('/trace_flag_quota_observed', 'flags.quota_observed is true when any quota source exists'), 'trace_flags: source/copy disagreement', trace_flag_quota_observed),
        g.Guard('trace_retry_none', g.Invariant('/trace_retry_none', 'relation none has no parent_trace_ref'), 'trace_retry: source/copy disagreement', trace_retry_none),
        g.Guard('trace_retry_parent', g.Invariant('/trace_retry_parent', 'a retry, escalation or resume relation has a parent_trace_ref'), 'trace_retry: source/copy disagreement', trace_retry_parent),
    ])

    def check(value):
        table.require('trace_flag_redacted', value, context)
        table.require('trace_flag_usage_observed', value, context)
        table.require('trace_flag_quota_observed', value, context)
        table.require('trace_retry_none', value, context)
        table.require('trace_retry_parent', value, context)
        return True
    return g.Case(table, check, context)
