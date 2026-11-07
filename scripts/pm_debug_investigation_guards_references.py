"""DDBG guard table: Eager schema references: every $ref / $dynamicRef in every branch resolves.

Part of the DDBG guard tables; the domain rule and phase order are in
pm_debug_investigation_guard_constants.py. Every refusal here is a named
predicate row; the factory builds a fresh table and Case for each candidate.
"""
import pm_guard_isolation as g


def references_anchor_form(value, context):
    for reference in context['references']:
        if reference[0] is not True:
            return 'unresolved_schema_reference'
        fragment = reference[2]
        if fragment and fragment[:1] != '/':
            return 'unresolved_schema_reference'
    return None


def references_base_known(value, context):
    known = [entry[0] for entry in context['identified']]
    for reference in context['references']:
        if reference[0] is True and reference[1] and reference[1] not in known:
            return 'unresolved_schema_reference'
    return None


def references_target_exists(value, context):
    for reference in context['references']:
        base, fragment = reference[1], reference[2]
        roots = [entry[1] for entry in context['identified'] if entry[0] == base]
        if reference[0] is not True or fragment and fragment[:1] != '/' or base and not roots:
            continue
        target = roots[0] if base else value
        found = True
        for key in reference[3]:
            if found and type(target) is dict and key in target:
                target = target[key]
            else:
                found = False
        if not found:
            return 'unresolved_schema_reference'
    return None


def references_target_schema(value, context):
    for reference in context['references']:
        base, fragment = reference[1], reference[2]
        roots = [entry[1] for entry in context['identified'] if entry[0] == base]
        if reference[0] is not True or fragment and fragment[:1] != '/' or base and not roots:
            continue
        target = roots[0] if base else value
        found = True
        for key in reference[3]:
            if found and type(target) is dict and key in target:
                target = target[key]
            else:
                found = False
        if found and type(target) is not dict and type(target) is not bool:
            return 'unresolved_schema_reference'
    return None


def references_case(case_value):
    # Traversal and parsing only: every object node of the document in document
    # order, each $id it declares, and each reference split into whether it is a string, its base,
    # fragment and unescaped pointer keys. The rows judge them.
    nodes, pending = [], [case_value]
    while pending:
        node = pending.pop()
        if type(node) is dict:
            nodes.append(node)
            pending.extend(reversed(list(node.values())))
        elif type(node) is list:
            pending.extend(reversed(node))
    references = []
    for node in nodes:
        for key in ('$ref', '$dynamicRef'):
            if key in node:
                text = node[key]
                base, _, fragment = text.partition('#') if type(text) is str else ('', '', '')
                keys = [part.replace('~1', '/').replace('~0', '~') for part in fragment[1:].split('/')] if fragment[:1] == '/' else []
                references.append([type(text) is str, base, fragment, keys])
    context = {'references': references, 'identified': [[node['$id'], node] for node in nodes if '$id' in node]}
    table = g.GuardTable([
        g.Guard('references.anchor_form', g.Invariant('/**/$ref', 'is a string whose fragment is empty or a JSON pointer'), 'unresolved_schema_reference', references_anchor_form),
        g.Guard('references.base_known', g.Invariant('/**/$ref', 'base is empty or a declared $id of this document'), 'unresolved_schema_reference', references_base_known),
        g.Guard('references.target_exists', g.Invariant('/**/$ref', 'pointer resolves to a member of its base'), 'unresolved_schema_reference', references_target_exists),
        g.Guard('references.target_schema', g.Invariant('/**/$ref', 'resolved target is a schema object or boolean'), 'unresolved_schema_reference', references_target_schema)])

    def check(value):
        table.require('references.anchor_form', value, context)
        table.require('references.base_known', value, context)
        table.require('references.target_exists', value, context)
        table.require('references.target_schema', value, context)
        return True
    return g.Case(table, check, context)
