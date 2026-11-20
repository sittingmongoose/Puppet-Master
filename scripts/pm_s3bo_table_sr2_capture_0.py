"""S3bo real predicates, projected from the complete checker; ATS-2206."""
import pm_guard_isolation as g

def sr2_cap_shape(value, context):
    record = value['sr2_cap_shape']
    if record['applies'] is not True:
        return None
    if bool(record['left']):
        return 'sr2_cap_shape_refused'
    return None

def sr2_cap_range(value, context):
    record = value['sr2_cap_range']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr2_cap_range_refused'
    return None

def sr2_cap_context(value, context):
    record = value['sr2_cap_context']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr2_cap_context_refused'
    return None

def sr2_cap_provenance(value, context):
    record = value['sr2_cap_provenance']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr2_cap_provenance_refused'
    return None

def sr2_cap_attachments(value, context):
    record = value['sr2_cap_attachments']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr2_cap_attachments_refused'
    return None

def sr2_cap_citations(value, context):
    record = value['sr2_cap_citations']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr2_cap_citations_refused'
    return None

def sr2_cap_merged(value, context):
    record = value['sr2_cap_merged']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr2_cap_merged_refused'
    return None

def sr2_cap_admission(value, context):
    record = value['sr2_cap_admission']
    if record['applies'] is not True:
        return None
    if record['left'] != record['right']:
        return 'sr2_cap_admission_refused'
    return None

def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('sr2_cap_shape', g.Invariant('/sr2_cap_shape', 'The presented source transcript, custody and admission attempts are complete closed records of the creation owner.'), 'sr2_cap_shape_refused', sr2_cap_shape),
        g.Guard('sr2_cap_range', g.Invariant('/sr2_cap_range', "The record's source thread and branch name a persisted branch that holds the boundary message exactly once; the range ends there, inclusive."), 'sr2_cap_range_refused', sr2_cap_range),
        g.Guard('sr2_cap_context', g.Invariant('/sr2_cap_context', 'Frozen context_refs are the items in the chat context at the boundary message, once each, in the order of their additions.'), 'sr2_cap_context_refused', sr2_cap_context),
        g.Guard('sr2_cap_provenance', g.Invariant('/sr2_cap_provenance', 'Frozen provenance_refs are the tool-call then model-run sources of every answer through the boundary, once each, in first-use order.'), 'sr2_cap_provenance_refused', sr2_cap_provenance),
        g.Guard('sr2_cap_attachments', g.Invariant('/sr2_cap_attachments', 'Record attachment_refs are the attachments of every message through the boundary, once each, in message order.'), 'sr2_cap_attachments_refused', sr2_cap_attachments),
        g.Guard('sr2_cap_citations', g.Invariant('/sr2_cap_citations', 'Record citation_refs are the citations of every answer through the boundary, once each, in message order.'), 'sr2_cap_citations_refused', sr2_cap_citations),
        g.Guard('sr2_cap_merged', g.Invariant('/sr2_cap_merged', 'Record context_provenance_refs is the frozen context_refs followed by each frozen provenance ref not already in it.'), 'sr2_cap_merged_refused', sr2_cap_merged),
        g.Guard('sr2_cap_admission', g.Invariant('/sr2_cap_admission', 'Creation admits only when no selected material is unplaceable, unresolved or forbidden; otherwise it refuses or quarantines with nothing written or dropped.'), 'sr2_cap_admission_refused', sr2_cap_admission),
    ])

    def check(value):
        table.require('sr2_cap_shape', value, context)
        table.require('sr2_cap_range', value, context)
        table.require('sr2_cap_context', value, context)
        table.require('sr2_cap_provenance', value, context)
        table.require('sr2_cap_attachments', value, context)
        table.require('sr2_cap_citations', value, context)
        table.require('sr2_cap_merged', value, context)
        table.require('sr2_cap_admission', value, context)
        return True
    return g.Case(table, check, context)
