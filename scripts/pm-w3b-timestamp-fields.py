#!/usr/bin/env python3
"""List every timestamp field W3B validates, derived from the schemas, with the shared check that covers it.

Walks the closed schema graph the W3B checker installs (scripts/pm_w3b_event_oracles.py REGISTRY) from each subject
it validates: the family payload, source body, source fact and checkpoint definitions, the EventRecord 2.0.0 envelope
and the CV-339 AppendReceipt. Every node whose (referenced) schema declares format date-time is a timestamp field; the
walk follows properties, items, $ref, allOf, anyOf, oneOf and if/then/else, including branches no fixture visits. The
CV-253 Storage fields observed_at_utc/persisted_at_utc additionally carry the storage_utc_z rows. Prints JSON.
"""
import json
import sys
from pathlib import Path
from urllib.parse import urldefrag, urljoin

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_w3b_event_oracles as W  # noqa: E402


def node_at(uri):
    base, frag = urldefrag(uri)
    return W.REGISTRY.resolver(base_uri=base).lookup('#' + frag).contents


def walk(uri, path, out, seen, depth=0):
    if (uri, path) in seen or depth > 60:
        return
    seen.add((uri, path))
    node = node_at(uri)
    if not isinstance(node, dict):
        return
    base, _ = urldefrag(uri)
    if '$ref' in node:
        t = urljoin(base, node['$ref'])
        walk(t if '#' in t else t + '#', path, out, seen, depth + 1)
    if node.get('format') == 'date-time':
        out.add((path, uri))
    for name in node.get('properties', {}):
        walk(uri + '/properties/' + name.replace('~', '~0').replace('/', '~1'), path + '/' + name, out, seen, depth + 1)
    if isinstance(node.get('items'), dict):
        walk(uri + '/items', path + '/[]', out, seen, depth + 1)
    for kw in ('allOf', 'anyOf', 'oneOf'):
        for i, _ in enumerate(node.get(kw, [])):
            walk(uri + '/' + kw + '/' + str(i), path, out, seen, depth + 1)
    for kw in ('if', 'then', 'else'):
        if isinstance(node.get(kw), dict):
            walk(uri + '/' + kw, path, out, seen, depth + 1)


COVER = {
    'envelope': 'envelope_schema (format_checker(profile=EVENT_RECORD)) on append/retry candidates; frozen_envelope_schema on retained originals',
    'receipt': 'receipt_schema (format_checker(profile=EVENT_RECORD)) on the append custody receipt; frozen_receipt_schema on the held '
               'first receipt of every retained original (retry, history, recovery)',
    'fact': 'fact_schema (format_checker(profile=EVENT_RECORD)) on append/recovery facts; src_body_schema when the body is an SP-337 pack',
    'payload': 'payload_schema (format_checker(profile=EVENT_RECORD))',
    'checkpoint': 'ck_schema (format_checker(profile=EVENT_RECORD))',
}
STORAGE_ROWS = {'/observed_at_utc': 'storage_utc_z_observed_at_utc (date_time STORAGE_UTC_Z) / frozen_observed_utc',
                '/persisted_at_utc': 'storage_utc_z_persisted_at_utc (date_time STORAGE_UTC_Z) / frozen_persisted_utc'}


def main():
    subjects = [('envelope', W.ENVELOPE_URI + '#'), ('receipt', W.RECEIPT_URI)]
    for fam in W.FAMILIES:
        for sub in ('payload', 'fact', 'checkpoint'):
            subjects.append((sub + ':' + fam, W.subject_uri(fam, sub)))
    fields = {}
    for label, uri in subjects:
        out, seen = set(), set()
        walk(uri, '', out, seen)
        kind = label.split(':')[0]
        for path, site in sorted(out):
            key = (kind, path)
            entry = fields.setdefault(key, {'subject': kind, 'path': path, 'schema_sites': set(), 'families': set()})
            entry['schema_sites'].add(site.replace(W.PLANS_URI, 'Plans/'))
            if ':' in label:
                entry['families'].add(label.split(':', 1)[1])
    rows = []
    for (kind, path), e in sorted(fields.items()):
        profile = 'event_record (format date-time)'
        cover = COVER[kind]
        if kind == 'envelope' and path in STORAGE_ROWS:
            profile = 'event_record format, plus CV-253 storage_utc_z'
            cover += '; ' + STORAGE_ROWS[path]
        rows.append({'subject': kind, 'path': path, 'families': len(e['families']) or 'all', 'schema_sites': sorted(e['schema_sites'])[:4],
                     'profile': profile, 'covered_by': cover})
    print(json.dumps({'timestamp_fields': rows, 'count': len(rows)}, indent=1))


if __name__ == '__main__':
    main()
