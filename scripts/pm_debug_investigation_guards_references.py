"""DDBG guard table: Eager schema references: every $ref / $dynamicRef in every branch resolves.

Part of the DDBG guard tables; the domain rule and phase order are in
pm_debug_investigation_guard_constants.py. Every refusal here is a named
predicate row; the factory builds a fresh table and Case for each candidate.
"""
import pm_guard_isolation as g


def references_anchor_form(value, context):
    for reference in context['references']:
        if reference[0] is not True or reference[2] == 'anchor':
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
        base = reference[1]
        roots = [entry[1] for entry in context['identified'] if entry[0] == base]
        if reference[0] is not True or reference[2] == 'anchor' or base and not roots:
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
        base = reference[1]
        roots = [entry[1] for entry in context['identified'] if entry[0] == base]
        if reference[0] is not True or reference[2] == 'anchor' or base and not roots:
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
    # Traversal and parsing only: every object node of the document (breadth
    # first), each $id it declares, and each reference split into whether it is
    # a string, its base, its fragment form (none, pointer or anchor) and its
    # unescaped pointer keys. The rows judge them.
    pending, index = [case_value], 0
    while index < len(pending):
        node = pending[index]
        index += 1
        if type(node) is dict:
            pending.extend(node.values())
        elif type(node) is list:
            pending.extend(node)
    nodes = [node for node in pending if type(node) is dict]
    references = []
    for node in nodes:
        for key in ('$ref', '$dynamicRef'):
            if key in node:
                text = node[key]
                base, _, fragment = text.partition('#') if type(text) is str else ('', '', '')
                form = 'none' if not fragment else 'pointer' if fragment.startswith('/') else 'anchor'
                parts = fragment.split('/') if form == 'pointer' else []
                keys = [part.replace('~1', '/').replace('~0', '~') for index, part in enumerate(parts) if index]
                references.append([type(text) is str, base, form, keys])
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
