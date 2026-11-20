"""DR guard table agreement_browser: CV-526/CV-537 current-writer copied source agreement, one row per copy site.

Method B guard rows for scripts/pm-runtime-artifact-event-drafts.py. Each
predicate reads one observation record that the lane checker derives from the
complete boundary input (hashes, canonical bytes, resolved routes); predicates
never recompute, repair or call helpers. The checker refuses only through these
rows, in this order (pm-runtime-artifact-event-drafts.py:table_refusal), and
asserts that every factory's require order equals its table order.
FIELDS names every observation the rows read; the checker passes no other.
"""
import pm_guard_isolation as g

FIELDS = ('browser_action_session', 'browser_page_ref', 'browser_page_screenshot', 'browser_page_pdf', 'browser_page_console', 'browser_page_network', 'browser_page_redaction')


def browser_action_session(value, context):
    for pair in value['browser_action_session']:
        if pair[0] != pair[1]:
            return 'browser_session: source/copy disagreement'
    return None


def browser_page_ref(value, context):
    for pair in value['browser_page_ref']:
        if pair[0] != pair[1]:
            return 'browser_page: source/copy disagreement'
    return None


def browser_page_screenshot(value, context):
    for pair in value['browser_page_screenshot']:
        if pair[0] != pair[1]:
            return 'browser_page: source/copy disagreement'
    return None


def browser_page_pdf(value, context):
    for pair in value['browser_page_pdf']:
        if pair[0] != pair[1]:
            return 'browser_page: source/copy disagreement'
    return None


def browser_page_console(value, context):
    for pair in value['browser_page_console']:
        if pair[0] != pair[1]:
            return 'browser_page: source/copy disagreement'
    return None


def browser_page_network(value, context):
    for pair in value['browser_page_network']:
        if pair[0] != pair[1]:
            return 'browser_page: source/copy disagreement'
    return None


def browser_page_redaction(value, context):
    for pair in value['browser_page_redaction']:
        if pair[0] != pair[1]:
            return 'browser_page: source/copy disagreement'
    return None


def browser_case(value):
    context = None
    table = g.GuardTable([
        g.Guard('browser_action_session', g.Invariant('/browser_action_session', 'every action browser_session_id equals the recording session'), 'browser_session: source/copy disagreement', browser_action_session),
        g.Guard('browser_page_ref', g.Invariant('/browser_page_ref', 'page_representation_ref equals the page representation id'), 'browser_page: source/copy disagreement', browser_page_ref),
        g.Guard('browser_page_screenshot', g.Invariant('/browser_page_screenshot', 'a copied screenshot ref equals the page representation'), 'browser_page: source/copy disagreement', browser_page_screenshot),
        g.Guard('browser_page_pdf', g.Invariant('/browser_page_pdf', 'a copied pdf ref equals the page representation'), 'browser_page: source/copy disagreement', browser_page_pdf),
        g.Guard('browser_page_console', g.Invariant('/browser_page_console', 'a copied console ref equals the page representation'), 'browser_page: source/copy disagreement', browser_page_console),
        g.Guard('browser_page_network', g.Invariant('/browser_page_network', 'a copied network ref equals the page representation'), 'browser_page: source/copy disagreement', browser_page_network),
        g.Guard('browser_page_redaction', g.Invariant('/browser_page_redaction', 'the page redaction profile equals the recording profile'), 'browser_page: source/copy disagreement', browser_page_redaction),
    ])

    def check(value):
        table.require('browser_action_session', value, context)
        table.require('browser_page_ref', value, context)
        table.require('browser_page_screenshot', value, context)
        table.require('browser_page_pdf', value, context)
        table.require('browser_page_console', value, context)
        table.require('browser_page_network', value, context)
        table.require('browser_page_redaction', value, context)
        return True
    return g.Case(table, check, context)
