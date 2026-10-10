#!/usr/bin/env python3
"""Compile the colour schemes under schemes/ into js/41-schemes-data.js.

Reads schemes/*.json (one file per family). pm-originals.json (PM-authored schemes, written
separately) is read when present and skipped when absent. The output is one ES2020 block:

    (function () { T.SCHEMES = [...]; T.SCHEME_FAMILIES = [...]; })();

Usage:
    python3 harness/compile_schemes.py            write js/41-schemes-data.js
    python3 harness/compile_schemes.py --check    fail (exit 1) when the file is stale or missing
    python3 harness/compile_schemes.py --root DIR use DIR as the terminal package root (tests)

Order is deterministic: pm-originals.json first, then the families in FAMILY_ORDER, then any other
family file by name. Variants keep the order they are listed in their family file. Output is ASCII
(non-ASCII names are written as \\u escapes), one scheme object per line, colours lowercase #rrggbb.
Source URLs and hashes are kept in the JSON and in schemes/SOURCES.md, not in the generated file.
"""

import argparse
import glob
import json
import os
import re
import sys

PM_ORIGINALS = 'pm-originals.json'

FAMILY_ORDER = [
    'catppuccin', 'tokyo-night', 'one-half', 'rose-pine', 'solarized', 'gruvbox', 'dracula',
    'nord', 'kanagawa', 'everforest', 'flexoki', 'github', 'ayu',
]

# Permissive licences only (task rule: OFL, Apache, MIT, BSD, Zlib). PM-authored is ours.
PERMISSIVE = {'MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'Zlib', 'OFL-1.1', 'PM-authored'}

APPEARANCES = ('light', 'dark')
HEX = re.compile(r'^#[0-9a-fA-F]{6}$')
SLUG = re.compile(r'^[a-z0-9][a-z0-9-]*$')
SHA256 = re.compile(r'^[0-9a-fA-F]{64}$')
REQUIRED_COLOURS = ('background', 'foreground')
OPTIONAL_COLOURS = ('cursor', 'cursorText', 'selectionBackground', 'selectionForeground')


class SchemeError(Exception):
    pass


def fail(path, message):
    raise SchemeError('%s: %s' % (path, message))


def hex_or_null(path, where, value, nullable):
    if value is None:
        if nullable:
            return None
        fail(path, '%s may not be null' % where)
    if not isinstance(value, str) or not HEX.match(value):
        fail(path, '%s is not #rrggbb: %r' % (where, value))
    return value.lower()


def read_family(path, schemes_dir):
    with open(path, encoding='utf-8') as f:
        try:
            doc = json.load(f)
        except ValueError as e:
            fail(path, 'invalid JSON (%s)' % e)
    for key in ('family', 'slug', 'licence', 'schemes'):
        if key not in doc:
            fail(path, 'missing "%s"' % key)
    if not isinstance(doc['schemes'], list) or not doc['schemes']:
        fail(path, '"schemes" must be a non-empty list')
    if not SLUG.match(str(doc['slug'])):
        fail(path, 'slug %r is not kebab-case' % doc['slug'])
    licence = doc['licence']
    if licence not in PERMISSIVE:
        fail(path, 'licence %r is not on the permissive list' % licence)
    if licence != 'PM-authored':
        licence_file = doc.get('licenceFile')
        if not licence_file or not os.path.isfile(os.path.join(schemes_dir, licence_file)):
            fail(path, 'licenceFile %r is missing from schemes/' % licence_file)
    families = {
        'family': doc['family'],
        'slug': doc['slug'],
        'licence': licence,
        'copyright': doc.get('copyright'),
        'homepage': doc.get('homepage'),
    }
    schemes = []
    for s in doc['schemes']:
        schemes.append(read_scheme(path, s, doc, licence))
    return families, schemes


def read_scheme(path, s, doc, licence):
    sid = s.get('id')
    where = 'scheme %r' % sid
    if not isinstance(sid, str) or not SLUG.match(sid):
        fail(path, 'scheme id %r is not kebab-case' % sid)
    if not isinstance(s.get('name'), str) or not s['name']:
        fail(path, '%s has no name' % where)
    if s.get('appearance') not in APPEARANCES:
        fail(path, '%s appearance must be light or dark' % where)
    if licence != 'PM-authored':
        if not isinstance(s.get('source'), str) or not s['source'].startswith('https://'):
            fail(path, '%s needs a https source URL' % where)
        if not isinstance(s.get('sourceSha256'), str) or not SHA256.match(s['sourceSha256']):
            fail(path, '%s needs a sourceSha256' % where)
    raw = s.get('colors')
    if not isinstance(raw, dict):
        fail(path, '%s has no colors object' % where)
    unknown = set(raw) - set(REQUIRED_COLOURS) - set(OPTIONAL_COLOURS) - {'ansi'}
    if unknown:
        fail(path, '%s has unknown colour keys %s' % (where, sorted(unknown)))
    colours = {}
    for key in REQUIRED_COLOURS:
        if key not in raw:
            fail(path, '%s is missing colors.%s' % (where, key))
        colours[key] = hex_or_null(path, '%s colors.%s' % (where, key), raw[key], False)
    for key in OPTIONAL_COLOURS:
        # a port that lacks a field gives null (never an invented value)
        colours[key] = hex_or_null(path, '%s colors.%s' % (where, key), raw.get(key), True)
    ansi = raw.get('ansi')
    if not isinstance(ansi, list) or len(ansi) != 16:
        fail(path, '%s colors.ansi must have 16 entries' % where)
    colours['ansi'] = [hex_or_null(path, '%s colors.ansi[%d]' % (where, i), v, False)
                       for i, v in enumerate(ansi)]
    out = {
        'id': sid,
        'name': s['name'],
        'family': doc['family'],
        'appearance': s['appearance'],
        'licence': licence,
        'colors': colours,
    }
    if 'roles' in s:
        if not isinstance(s['roles'], dict):
            fail(path, '%s roles must be an object' % where)
        out['roles'] = s['roles']
    return out


def family_paths(schemes_dir):
    files = glob.glob(os.path.join(schemes_dir, '*.json'))
    originals = [p for p in files if os.path.basename(p) == PM_ORIGINALS]
    others = [p for p in files if os.path.basename(p) != PM_ORIGINALS]

    def rank(p):
        slug = os.path.basename(p)[:-len('.json')]
        index = FAMILY_ORDER.index(slug) if slug in FAMILY_ORDER else len(FAMILY_ORDER)
        return (index, slug)

    return originals + sorted(others, key=rank)


def js_value(value):
    return json.dumps(value, ensure_ascii=True, separators=(', ', ': '))


def scheme_line(s):
    c = s['colors']
    colours = ', '.join('"%s": %s' % (k, js_value(c[k]))
                        for k in ('background', 'foreground', 'cursor', 'cursorText',
                                  'selectionBackground', 'selectionForeground'))
    colours += ', "ansi": %s' % js_value(c['ansi'])
    fields = [
        '"id": %s' % js_value(s['id']),
        '"name": %s' % js_value(s['name']),
        '"family": %s' % js_value(s['family']),
        '"appearance": %s' % js_value(s['appearance']),
        '"licence": %s' % js_value(s['licence']),
        '"colors": {%s}' % colours,
    ]
    if 'roles' in s:
        fields.append('"roles": %s' % js_value(s['roles']))
    return '    {%s}' % ', '.join(fields)


def family_line(f):
    fields = ['"family": %s' % js_value(f['family']),
              '"slug": %s' % js_value(f['slug']),
              '"licence": %s' % js_value(f['licence']),
              '"copyright": %s' % js_value(f['copyright']),
              '"homepage": %s' % js_value(f['homepage'])]
    return '    {%s}' % ', '.join(fields)


def render(schemes_dir):
    families, schemes = [], []
    for path in family_paths(schemes_dir):
        family, family_schemes = read_family(path, schemes_dir)
        families.append(family)
        schemes.extend(family_schemes)
    seen = set()
    for s in schemes:
        if s['id'] in seen:
            raise SchemeError('duplicate scheme id %r' % s['id'])
        seen.add(s['id'])
    lines = [
        '// Generated by harness/compile_schemes.py from schemes/*.json. Do not edit by hand.',
        '(function () {',
        '  T.SCHEMES = [',
    ]
    lines += [scheme_line(s) + ',' for s in schemes[:-1]]
    lines += [scheme_line(schemes[-1])] if schemes else []
    lines += ['  ];', '  T.SCHEME_FAMILIES = [']
    lines += [family_line(f) + ',' for f in families[:-1]]
    lines += [family_line(families[-1])] if families else []
    lines += ['  ];', '})();']
    return '\n'.join(lines) + '\n', len(schemes), len(families)


def main(argv):
    here = os.path.dirname(os.path.abspath(__file__))
    parser = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    parser.add_argument('--check', action='store_true',
                        help='exit 1 when js/41-schemes-data.js is stale or missing')
    parser.add_argument('--root', default=os.path.dirname(here),
                        help='terminal package root (default: the parent of harness/)')
    args = parser.parse_args(argv)
    root = os.path.abspath(args.root)
    schemes_dir = os.path.join(root, 'schemes')
    out_path = os.path.join(root, 'js', '41-schemes-data.js')
    try:
        text, n_schemes, n_families = render(schemes_dir)
    except SchemeError as e:
        print('compile_schemes: %s' % e, file=sys.stderr)
        return 2
    if args.check:
        try:
            with open(out_path, encoding='utf-8') as f:
                current = f.read()
        except OSError:
            current = None
        if current != text:
            print('compile_schemes: js/41-schemes-data.js is stale; run '
                  'python3 harness/compile_schemes.py', file=sys.stderr)
            return 1
        print('compile_schemes: up to date (%d schemes, %d families)' % (n_schemes, n_families))
        return 0
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)
    print('compile_schemes: wrote %s (%d schemes, %d families)' % (
        os.path.relpath(out_path, root), n_schemes, n_families))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
