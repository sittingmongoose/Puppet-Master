#!/usr/bin/env python3
"""Fresh stop/block consumer realms for the DG-OWN-A source package (F9 of the DG-OWN-A review).

The fresh stop/block consumer (SB5, SP-1112) inherits the started, positive-D06 cancelled and
clean certified branch arguments of the certified consumer
(Plans/goal_run_certified_consumer_contracts). Those roots validate native-v7 wrappers, so a fresh
all_writers.stop_block.v1 birth cannot be read through them. This tool re-identifies the seven
consumer realms of that package into the stop_block.v1 namespace, exactly as resource-map.json
already does for its six source realms:

  * new URI  = https://puppetmaster.local/proposals/stop_block.v1/<realm>/<sha256(original URI)>.schema.json
  * a realm-local $ref is rewritten through that realm's own map only;
  * a $ref site of consumer.v1 or a companion is rewritten through its location-scoped import edge
    (imports.json) into the fresh map of the edge's target realm, never through a merged map;
  * every native wrapper id/version listed in native-wrapper-bindings.json is replaced by its fresh
    id/version, and the all_writers.v7 writer_contract constant by the stop_block.v1 profile, as in
    the fresh native realm.

Original bytes come from the pinned path when its SHA-256 still matches, otherwise from the exact
git blob pinned below. Nothing else is edited. `--write` writes consumer-resource-bank.json and updates
resource-map.json and additional-imports.json; `--check` (default) rebuilds in memory and compares.
The seven realms live in consumer-resource-bank.json beside the six source realms of resource-bank.json.
"""
from __future__ import annotations

import argparse
import copy
import functools
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from urllib.parse import urldefrag, urljoin

ROOT = Path(__file__).resolve().parents[1]
PKG = ROOT / 'Plans/goal_run_stop_block_contracts'
CERT = ROOT / 'Plans/goal_run_certified_consumer_contracts'
BASE = 'https://puppetmaster.local/proposals/stop_block.v1/'
PROFILE = 'pm.executor.workflow_source.all_writers.stop_block.v1'
OLD_PROFILE = 'pm.executor.workflow_source.all_writers.v7'
REALMS = ['started_current_workflow_native_activation', 'started_current_goal_controls',
          'cancelled_native_consumer', 'cancelled_goal_consumer', 'cancelled_filesafe_consumer',
          'consumer', 'companions']
SCOPED = {'consumer', 'companions'}  # resolved through location-scoped import edges
# Original bytes whose pinned path has since moved: (path, commit, blob), each found by SHA-256 in history.
MOVED = {
    '5fa07b1ee8a19c769883b6e8876bf0c5e6326b97f5992fec3b661d7ec2a541ea': ('Plans/full_thread_runtime_contracts.schema.json', 'fd925d44e4794853848cf60dc814acef50443fad', 'bd64319ebcfc709baf5dd483a976d1f6c9530ee4'),
    '680d47fb8e6226aaa26046bcaa971d4a312da6c81949b4a7bb75208b90e97a59': ('Plans/shared_runtime_contracts.schema.json', 'fd925d44e4794853848cf60dc814acef50443fad', '5d46a90ff833d4c678837d6ace8d81d8c3795d30'),
    '6a3465b358483aef9d020fcf64e7c16276b8aa11b3c73a8a36aae9455dbf02c2': ('Plans/plans_to_code_handoff.schema.json', '11812c094995b1af9ae46fac31e6421741843187', '3414c30c283bd1dc741e59efe149811158c1ca7f'),
    '7c460c1e01956e15fce5977779b4920f100b30443ddd950f24fda22dc1b38d7b': ('Plans/shared_runtime_command_contracts.schema.json', 'fd925d44e4794853848cf60dc814acef50443fad', 'afb31d199f059a550cc9e7f3ca3fb3c96e40984e'),
    '95f1b6cfe5d5df747c972f8544acfeb131fca5d404b38844c3c32adaea498b25': ('Plans/execution_unit_context.schema.json', 'fd925d44e4794853848cf60dc814acef50443fad', 'dbdcf0ad41e5387ac9d04a87e741109dc656c46e'),
    'bcd467b368c2bbdc751d3e841e3a070bfbf40e03669ba6bc82f2bacfc2eeeaa6': ('Plans/requested_effective_runtime.schema.json', 'fd925d44e4794853848cf60dc814acef50443fad', '710fb12d86a9cc655622085f6d4136a5700c00b7'),
}


def git_blob_for(sha: str) -> tuple[bytes, dict]:
    path, commit, blob = MOVED[sha]
    data = subprocess.run(['git', '-C', str(ROOT), 'cat-file', 'blob', blob], capture_output=True, check=True).stdout
    listed = subprocess.run(['git', '-C', str(ROOT), 'rev-parse', f'{commit}:{path}'], capture_output=True, text=True).stdout.strip()
    if hashlib.sha256(data).hexdigest() != sha or listed != blob:
        raise SystemExit(f'pinned original {path} at {commit} does not match {sha}')
    return data, {'commit': commit, 'blob': blob}


def original_bytes(row: dict) -> tuple[bytes, dict | None]:
    path = ROOT / row['path']
    if path.is_file():
        data = path.read_bytes()
        if hashlib.sha256(data).hexdigest() == row['sha256']:
            return data, None
    if row['sha256'] not in MOVED or MOVED[row['sha256']][0] != row['path']:
        raise SystemExit(f"unpinned original drift: {row['path']}")
    return git_blob_for(row['sha256'])


def pointer(doc, ptr: str):
    ptr = ptr.lstrip('#')
    if not ptr:
        return doc
    for part in ptr.lstrip('/').split('/'):
        part = part.replace('~1', '/').replace('~0', '~')
        doc = doc[part] if isinstance(doc, dict) else doc[int(part)]
    return doc


FROZEN_HANDOFF = ('file:///home/sittingmongoose/PM-Experiments/goal-completed-sixteen-input-composition-20260913/'
                  'v6/frozen/completion-v5/frozen/completion-v4/inputs/Plans/plans_to_code_handoff.schema.json')
HANDOFF = 'https://puppetmaster.local/schemas/plans_to_code_handoff.schema.json'
HANDOFF_SHA = '6a3465b358483aef9d020fcf64e7c16276b8aa11b3c73a8a36aae9455dbf02c2'


def nested_ids(value, base, location=''):
    """(absolute $id, JSON pointer) of every embedded subresource below `value`."""
    found = []
    if isinstance(value, dict):
        here = base
        if isinstance(value.get('$id'), str):
            here = urljoin(base, value['$id'])
            if here != base:
                found.append((urldefrag(here)[0], location))
        for key, child in value.items():
            if key != '$id':
                found += nested_ids(child, here, location + '/' + key.replace('~', '~0').replace('/', '~1'))
    elif isinstance(value, list):
        for i, child in enumerate(value):
            found += nested_ids(child, base, location + '/' + str(i))
    return found


def fresh_uri(realm: str, uri: str) -> str:
    return BASE + realm + '/' + hashlib.sha256(uri.encode()).hexdigest() + '.schema.json'


def rewrite(value, base, location, resolve, unmapped):
    """Rewrite every $ref/$id; `resolve(location, absolute_uri)` returns the fresh URI or None."""
    if isinstance(value, dict):
        here = base
        if isinstance(value.get('$id'), str):
            here = urljoin(base, value['$id'])
        out = {}
        for key, child in value.items():
            loc = location + '/' + key.replace('~', '~0').replace('/', '~1')
            if key == '$ref' and isinstance(child, str):
                target, frag = urldefrag(urljoin(here, child))
                mapped = resolve(loc, target)
                if mapped is None:
                    unmapped.append({'location': loc, 'ref': child})
                    out[key] = child
                else:
                    out[key] = mapped + ('#' + frag if (frag or '#' in child) else '')
            elif key == '$id' and isinstance(child, str):
                mapped = resolve(None, urljoin(base, child))
                out[key] = mapped if mapped is not None else child
            else:
                out[key] = rewrite(child, here, loc, resolve, unmapped)
        return out
    if isinstance(value, list):
        return [rewrite(child, base, location + '/' + str(i), resolve, unmapped) for i, child in enumerate(value)]
    return value


def fresh_wrappers(value, old2new, counts):
    """Fresh native wrapper ids/versions and the fresh writer contract, as in the fresh native realm."""
    if isinstance(value, dict):
        props = value.get('properties')
        if isinstance(props, dict):
            sid = props.get('schema_id')
            if isinstance(sid, dict) and sid.get('const') in old2new:
                new_id, new_version = old2new[sid['const']]
                props['schema_id'] = {**sid, 'const': new_id}
                counts['wrapper_id'] += 1
                ver = props.get('schema_version')
                if isinstance(ver, dict) and 'const' in ver:
                    props['schema_version'] = {**ver, 'const': new_version}
                    counts['wrapper_version'] += 1
            wc = props.get('writer_contract')
            if isinstance(wc, dict) and wc.get('const') == OLD_PROFILE:
                props['writer_contract'] = {**wc, 'const': PROFILE}
                counts['writer_contract'] += 1
        for child in value.values():
            fresh_wrappers(child, old2new, counts)
    elif isinstance(value, list):
        for child in value:
            fresh_wrappers(child, old2new, counts)


def build():
    realms = json.loads((CERT / 'resource-realms.json').read_text())
    imports = json.loads((CERT / 'imports.json').read_text())['imports']
    resource_map = json.loads((PKG / 'resource-map.json').read_text())
    bindings = json.loads((PKG / 'native-wrapper-bindings.json').read_text())['bindings']
    old2new = {b['old_schema_id']: (b['new_schema_id'], b['new_schema_version']) for b in bindings}
    maps = {realm: {row['retrieval_uri']: fresh_uri(realm, row['retrieval_uri']) for row in realms[realm]['resources']}
            for realm in REALMS}
    edges = {}
    for edge in imports:
        if edge['from_realm'] in SCOPED:
            edges[(edge['from_whole_schema'], edge['from_schema_location'])] = edge
    bank, report = {}, {'realms': {}, 'moved_originals': [], 'counts': {}}
    counts = {'wrapper_id': 0, 'wrapper_version': 0, 'writer_contract': 0}
    extra_imports = []
    for realm in REALMS:
        rows = []
        unmapped = []
        derived = {}
        for row in realms[realm]['resources']:
            data, moved = original_bytes(row)
            if moved:
                report['moved_originals'].append({'realm': realm, 'path': row['path'], 'sha256': row['sha256'], **moved})
            doc = copy.deepcopy(pointer(json.loads(data), row.get('json_pointer', '')))
            own_map = maps[realm]
            # Embedded subresources ($id inside the document) that are not themselves realm rows keep
            # their embedded identity, re-identified in the same realm namespace.
            top = urldefrag(urljoin(row['retrieval_uri'], doc['$id']))[0] if isinstance(doc, dict) and isinstance(doc.get('$id'), str) else row['retrieval_uri']
            inner = [(u, '/' + key.replace('~', '~0').replace('/', '~1') + loc)
                     for key, child in (doc.items() if isinstance(doc, dict) else []) if key != '$id'
                     for u, loc in nested_ids(child, top)]
            embedded = {uri: fresh_uri(realm, uri) for uri, _ in inner if uri not in own_map}
            embedded_at = {uri: loc for uri, loc in inner if uri not in own_map}
            if top not in own_map:
                embedded[top] = own_map[row['retrieval_uri']]  # the document's own $id names this row

            def resolve(location, target, row=row, own_map=own_map, embedded=embedded):
                if location is not None and realm in SCOPED:
                    edge = edges.get((row['path'], location))
                    if edge is not None:
                        if edge['to_realm'] in maps:
                            return maps[edge['to_realm']][edge['to_retrieval_uri']]
                        return resource_map[edge['to_realm']][edge['to_retrieval_uri']]
                if target in own_map:
                    return own_map[target]
                if target in embedded:
                    return embedded[target]
                if target == FROZEN_HANDOFF and HANDOFF in own_map and \
                        any(r['retrieval_uri'] == HANDOFF and r['sha256'] == HANDOFF_SHA for r in realms[realm]['resources']):
                    # Same explicit edge additional-imports.json already gives the fresh native realm.
                    extra_imports.append({'realm': realm, 'original_uri': FROZEN_HANDOFF, 'target': own_map[HANDOFF],
                                          'path': 'Plans/workflow_standard_source_contracts/inputs/Plans/plans_to_code_handoff.schema.json',
                                          'sha256': HANDOFF_SHA, 'from_resource': row['retrieval_uri'], 'from_location': location})
                    return own_map[HANDOFF]
                return None

            fresh = rewrite(doc, row['retrieval_uri'], '', resolve, unmapped)
            fresh['$id'] = own_map[row['retrieval_uri']]
            fresh_wrappers(fresh, old2new, counts)
            out = {'retrieval_uri': own_map[row['retrieval_uri']], 'original_retrieval_uri': row['retrieval_uri'],
                   'original_path': row['path'], 'original_sha256': row['sha256'],
                   'original_pointer': row.get('json_pointer', '')}
            if moved:
                out['original_git'] = moved
            out['schema'] = fresh
            rows.append(out)
            # An embedded subresource that is not itself a realm row becomes its own row, exactly as the
            # realm already registers the https legacy_v2_reader at its JSON pointer; JSON Schema
            # crawling does not enter unknown keywords, so eager resolution needs it registered.
            for uri, loc in sorted(embedded_at.items()):
                sub = {'retrieval_uri': embedded[uri], 'original_retrieval_uri': uri, 'original_path': row['path'],
                       'original_sha256': row['sha256'],
                       'original_pointer': (row.get('json_pointer', '') or '') + '#' + loc if not row.get('json_pointer') else row['json_pointer'] + loc,
                       'derived_embedded_resource': True, 'schema': pointer(fresh, loc)}
                if moved:
                    sub['original_git'] = moved
                prior = derived.get(embedded[uri])
                if prior is None:
                    derived[embedded[uri]] = sub
                    rows.append(sub)
                elif prior['schema'] != sub['schema']:
                    raise SystemExit('embedded resource identity collision: ' + uri)
        if unmapped:
            raise SystemExit(json.dumps({'realm': realm, 'unmapped': unmapped[:20]}, indent=1))
        bank[realm] = {'mode': 'fresh_whole_resource_namespace', 'network_fallback': False,
                       'merge_with_other_realms': False,
                       'source_realm': 'Plans/goal_run_certified_consumer_contracts/resource-realms.json#/' + realm,
                       'resolution': ('location-scoped import edges of Plans/goal_run_certified_consumer_contracts/imports.json'
                                      if realm in SCOPED else 'realm-local map only'),
                       'resources': rows}
        report['realms'][realm] = len(rows)
    report['counts'] = counts
    report['additional_imports'] = len(extra_imports)
    return bank, maps, report, extra_imports


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    bank_new, maps, report, extra_imports = build()
    bank_path, map_path = PKG / 'consumer-resource-bank.json', PKG / 'resource-map.json'
    bank = json.loads(bank_path.read_text()) if bank_path.is_file() else {}
    resource_map = json.loads(map_path.read_text())
    imports_path = PKG / 'additional-imports.json'
    imports = json.loads(imports_path.read_text())
    merged_imports = [row for row in imports if row['realm'] not in REALMS] + extra_imports
    if args.write:
        bank = {realm: bank_new[realm] for realm in REALMS}
        for realm in REALMS:
            resource_map[realm] = maps[realm]
        bank_path.write_text(json.dumps(bank, indent=2, ensure_ascii=True) + '\n')
        map_path.write_text(json.dumps(resource_map, indent=2, ensure_ascii=True) + '\n')
        imports_path.write_text(json.dumps(merged_imports, indent=2, ensure_ascii=False) + '\n')
        status = 'written'
    else:
        same = all(bank.get(r) == bank_new[r] and resource_map.get(r) == maps[r] for r in REALMS) and imports == merged_imports
        status = 'pass' if same else 'fail'
    print(json.dumps({'status': status, **report}, indent=2))
    return 0 if status in ('pass', 'written') else 1


if __name__ == '__main__':
    sys.exit(main())
