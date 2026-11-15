"""S4 reference-store result_0 predicates (generated)."""
import pm_guard_isolation as g


def result_schema_id(v, context):
    if v['applies'] is True and (type(v['result_schema_id']['seen']) is not type(v['result_schema_id']['first']) or v['result_schema_id']['seen'] != v['result_schema_id']['first']):
        return 'retained_result_join'
    return None


def result_schema_version(v, context):
    if v['applies'] is True and (type(v['result_schema_version']['seen']) is not type(v['result_schema_version']['first']) or v['result_schema_version']['seen'] != v['result_schema_version']['first']):
        return 'retained_result_join'
    return None


def result_sequence_id(v, context):
    if v['applies'] is True and (type(v['result_sequence_id']['seen']) is not type(v['result_sequence_id']['first']) or v['result_sequence_id']['seen'] != v['result_sequence_id']['first']):
        return 'retained_result_join'
    return None


def result_status(v, context):
    if v['applies'] is True and (type(v['result_status']['seen']) is not type(v['result_status']['first']) or v['result_status']['seen'] != v['result_status']['first']):
        return 'retained_result_join'
    return None


def case(value):
    context = None
    table = g.GuardTable([
        g.Guard('result_schema_id', g.Invariant('/result_schema_id', 'actual reference-store result_schema_id invariant'), 'retained_result_join', result_schema_id),
        g.Guard('result_schema_version', g.Invariant('/result_schema_version', 'actual reference-store result_schema_version invariant'), 'retained_result_join', result_schema_version),
        g.Guard('result_sequence_id', g.Invariant('/result_sequence_id', 'actual reference-store result_sequence_id invariant'), 'retained_result_join', result_sequence_id),
        g.Guard('result_status', g.Invariant('/result_status', 'actual reference-store result_status invariant'), 'retained_result_join', result_status),
    ])

    def check(value):
        table.require('result_schema_id', value, context)
        table.require('result_schema_version', value, context)
        table.require('result_sequence_id', value, context)
        table.require('result_status', value, context)
        return True
    return g.Case(table, check, context)
