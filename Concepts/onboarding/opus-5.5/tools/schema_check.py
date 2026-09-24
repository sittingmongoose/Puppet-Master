#!/usr/bin/env python3
"""Setup-plan schema harness.

  python3 tools/schema_check.py validate DRAFT.json [...]    validate captured drafts (a plan, a list, or {"drafts": [...]})
  python3 tools/schema_check.py coverage                      regenerate src/coverage.json from the schema + src/coverage.map.json
  python3 tools/schema_check.py coverage --check              fail if coverage.json is stale or a field/conditional is unmapped

The canonical schema is Plans/product_onboarding_contracts.schema.json ($defs.onboarding_setup_plan: 63 properties,
26 conditionals) with its external settings-system $ref. It is read from the working tree when present, otherwise
from git (origin/main, then HEAD), so a sparse worktree without Plans still works.
"""
import json
import os
import subprocess
import sys

import jsonschema
from jsonschema import Draft202012Validator
from referencing import Registry, Resource

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..'))
REPO = os.path.abspath(os.path.join(ROOT, '..', '..', '..'))
SCHEMA = 'Plans/product_onboarding_contracts.schema.json'
SETTINGS = 'Plans/settings_system_contracts.schema.json'


def load_repo_json(rel):
    path = os.path.join(REPO, rel)
    if os.path.exists(path):
        return json.load(open(path)), path
    for rev in ('origin/main', 'HEAD'):
        r = subprocess.run(['git', '-C', REPO, 'show', f'{rev}:{rel}'], capture_output=True, text=True)
        if r.returncode == 0:
            return json.loads(r.stdout), f'{rev}:{rel}'
    sys.exit(f'cannot read {rel}')


def validator():
    root, src = load_repo_json(SCHEMA)
    settings, _ = load_repo_json(SETTINGS)
    registry = Registry().with_resources([
        (root['$id'], Resource.from_contents(root)),
        (settings['$id'], Resource.from_contents(settings)),
    ])
    sub = dict(root['$defs']['onboarding_setup_plan'])
    schema = {'$schema': root.get('$schema'), '$id': root['$id'] + '#setup_plan', '$ref': root['$id'] + '#/$defs/onboarding_setup_plan'}
    return Draft202012Validator(schema, registry=registry), root, src, sub


def cmd_validate(files):
    v, _, src, _ = validator()
    total, bad = 0, 0
    for f in files:
        data = json.load(open(f))
        drafts = data if isinstance(data, list) else data.get('drafts', [data]) if isinstance(data, dict) and 'drafts' in data else [data]
        for i, d in enumerate(drafts):
            plan = d.get('plan', d) if isinstance(d, dict) else d
            label = d.get('label', f'{os.path.basename(f)}#{i}') if isinstance(d, dict) else f'{f}#{i}'
            errs = sorted(v.iter_errors(plan), key=lambda e: list(e.absolute_path))
            total += 1
            if errs:
                bad += 1
                print(f'INVALID {label}')
                for e in errs[:12]:
                    print('   ', '/'.join(str(p) for p in e.absolute_path) or '(root)', '-', e.message[:220])
            else:
                print(f'valid   {label}')
    print(json.dumps({'schema': src, 'drafts': total, 'invalid': bad}))
    return 1 if bad else 0


def summarize(node):
    """Short text for an if/then clause: property constraints flattened to a=b / a in [..] / a!=b."""
    out = []
    props = node.get('properties', {}) if isinstance(node, dict) else {}
    for k, c in props.items():
        if not isinstance(c, dict):
            continue
        if 'const' in c:
            out.append(f'{k}={json.dumps(c["const"])}')
        elif 'enum' in c:
            out.append(f'{k} in {json.dumps(c["enum"])}')
        elif 'not' in c and isinstance(c['not'], dict) and 'const' in c['not']:
            out.append(f'{k}!={json.dumps(c["not"]["const"])}')
        elif 'not' in c and isinstance(c['not'], dict) and 'enum' in c['not']:
            out.append(f'{k} not in {json.dumps(c["not"]["enum"])}')
        elif 'properties' in c:
            out.append(f'{k}.{{' + ', '.join(summarize(c)) + '}')
        elif 'type' in c:
            out.append(f'{k}:{c["type"]}')
        elif 'pattern' in c or '$ref' in c:
            out.append(f'{k}~{c.get("pattern") or c.get("$ref").split("/")[-1]}')
        else:
            out.append(f'{k}:(constraint)')
    for key in ('required',):
        if isinstance(node, dict) and node.get(key) and not props:
            out.append('required ' + ','.join(node[key]))
    return out


def cmd_coverage(check):
    _, root, src, sub = validator()
    mpath = os.path.join(ROOT, 'src', 'coverage.map.json')
    cmap = json.load(open(mpath)) if os.path.exists(mpath) else {'fields': {}, 'conditionals': {}, 'screens': {}, 'scenarios': {}}
    fields = []
    for name, c in sub['properties'].items():
        kind = c.get('const', None)
        desc = ('const ' + json.dumps(kind)) if 'const' in c else ('enum ' + json.dumps(c['enum'])) if 'enum' in c else c.get('type') or (c.get('$ref') or '').split('/')[-1] or 'constraint'
        m = cmap['fields'].get(name)
        fields.append({'field': name, 'schema': desc if isinstance(desc, str) else json.dumps(desc), 'mapped': m})
    conds = []
    for i, c in enumerate(sub.get('allOf', [])):
        m = cmap['conditionals'].get(str(i))
        conds.append({'n': i, 'if': summarize(c.get('if', {})), 'then': summarize(c.get('then', {})), 'else': summarize(c.get('else', {})) if 'else' in c else None, 'mapped': m})
    cov = {
        'generated_from': src, 'setup_plan_fields': len(fields), 'conditionals': len(conds),
        'unmapped_fields': [f['field'] for f in fields if not f['mapped']],
        'unmapped_conditionals': [c['n'] for c in conds if not c['mapped']],
        'fields': fields, 'conditional_rules': conds, 'screens': cmap.get('screens', {}), 'scenarios': cmap.get('scenarios', {}),
    }
    out = os.path.join(ROOT, 'src', 'coverage.json')
    text = json.dumps(cov, indent=1, ensure_ascii=False) + '\n'
    if check:
        cur = open(out).read() if os.path.exists(out) else ''
        problems = []
        if cur != text:
            problems.append('coverage.json is stale; run: python3 tools/schema_check.py coverage')
        if cov['unmapped_fields']:
            problems.append('unmapped fields: ' + ', '.join(cov['unmapped_fields']))
        if cov['unmapped_conditionals']:
            problems.append('unmapped conditionals: ' + ', '.join(map(str, cov['unmapped_conditionals'])))
        print(json.dumps({'ok': not problems, 'problems': problems}))
        return 1 if problems else 0
    open(out, 'w').write(text)
    print(json.dumps({'out': out, 'fields': len(fields), 'conditionals': len(conds), 'unmapped_fields': len(cov['unmapped_fields']), 'unmapped_conditionals': len(cov['unmapped_conditionals'])}))
    return 0


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    cmd = sys.argv[1]
    if cmd == 'validate':
        sys.exit(cmd_validate(sys.argv[2:]))
    if cmd == 'coverage':
        sys.exit(cmd_coverage('--check' in sys.argv))
    sys.exit(__doc__)


if __name__ == '__main__':
    main()
