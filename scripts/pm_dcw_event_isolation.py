#!/usr/bin/env python3
"""Legacy schema-label helpers, with the old AST proof engine retired.

Labels are fixture lineage only. Method B credit comes exclusively from the
unchanged gated pm_guard_isolation tool and pm-dcw-guard-tables.py.
"""
import collections
import json

def schema_leaves(error):
    if error.validator in ('oneOf', 'anyOf') and error.context:
        groups = collections.defaultdict(list)
        for child in error.context:
            groups[tuple(child.relative_schema_path)[0]].append(child)
        # An invalid ref representation must not contribute errors when the
        # caller selected the otherwise-valid inline branch, or vice versa.
        alternatives = error.schema.get(error.validator, [])
        if (error.validator == 'oneOf' and isinstance(error.instance, dict) and
                any(branch.get('$ref') == '#/$defs/inline' for branch in alternatives)):
            selected = 1 if 'source_payload_ref' in error.instance else 0
            if selected in groups:
                return sum((schema_leaves(c) for c in groups[selected]), [])
        options = [sum((schema_leaves(c) for c in group), []) for group in groups.values()]
        return min(options, key=len)
    return [error]


def signature(path, definition, error):
    parts = [path, definition, list(error.absolute_schema_path), error.validator]
    if error.validator == 'required':
        parts.append(error.message)
    return json.dumps(parts, separators=(',', ':'))


if __name__ == '__main__':
    raise SystemExit('Superseded: use scripts/pm-dcw-guard-tables.py; this retired AST proof grants no credit.')
