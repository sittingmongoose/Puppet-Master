"""S4 reference-store read predicates (generated)."""
import pm_guard_isolation as g


def read_generation(v, context):
    if v['generation'] in v['withdrawn']:
        return 'publication_withdrawn'
    return None


def read_publication(v, context):
    if v['generation'] not in v['publications']:
        return 'publication_unavailable'
    return None


def read_hold(v, context):
    if v['original_ref'] not in v['retained_refs']:
        return 'retained_source_unavailable'
    return None


def read_coverage(v, context):
    if v['generation'] in v['publications'] and v['original_ref'] in v['retained_refs'] and v['original_ref'] not in v['publication_rows']:
        return 'source_prefix_incomplete'
    return None


def read_frame(v, context):
    if v['original_ref'] in v['retained_refs'] and v['frame_bytes'] != v['original_bytes']:
        return 'relocation_commitment'
    return None


def read_shape(v, context):
    if v['shape_errors'] != []:
        return 'retained_shape'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('read_generation', g.Invariant('/read_generation', 'actual reference-store read_generation invariant'), 'publication_withdrawn', read_generation),
        g.Guard('read_publication', g.Invariant('/read_publication', 'actual reference-store read_publication invariant'), 'publication_unavailable', read_publication),
        g.Guard('read_hold', g.Invariant('/read_hold', 'actual reference-store read_hold invariant'), 'retained_source_unavailable', read_hold),
        g.Guard('read_coverage', g.Invariant('/read_coverage', 'actual reference-store read_coverage invariant'), 'source_prefix_incomplete', read_coverage),
        g.Guard('read_frame', g.Invariant('/read_frame', 'actual reference-store read_frame invariant'), 'relocation_commitment', read_frame),
        g.Guard('read_shape', g.Invariant('/read_shape', 'actual reference-store read_shape invariant'), 'retained_shape', read_shape),
    ])

    def check(value):
        table.require('read_generation', value, context)
        table.require('read_publication', value, context)
        table.require('read_hold', value, context)
        table.require('read_coverage', value, context)
        table.require('read_frame', value, context)
        table.require('read_shape', value, context)
        return True
    return g.Case(table, check, context)
