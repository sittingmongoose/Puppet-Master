#!/usr/bin/env python3
"""Rebuild legacy DG5 witness evidence and check every result on the reference validator.

Old reports saved some different cut pairs, omitted nested-context witnesses,
removed carried stores, and truncated human-readable edits. This command keeps
verdict classes fixed. It reconstructs the recorded path/edit from accepted
controls, records exact replay tokens, and emits every failure explicitly.
"""
import argparse
import ast
import base64
import collections
import copy
import gzip
import hashlib
import json
import pickle
from pathlib import Path

import pm_goal_dg5_closure as c
import pm_goal_go2_closure as go2


def digest(value):
    return hashlib.sha256(pickle.dumps(value, protocol=5)).hexdigest()


def load_store(report_path, metadata):
    if not metadata:
        return {}
    path = report_path.parent / metadata['path']
    blob = path.read_bytes()
    if hashlib.sha256(blob).hexdigest() != metadata['sha256']:
        raise ValueError('evidence hash mismatch: ' + str(path))
    return pickle.loads(gzip.decompress(blob))


def typed_path(control, parts):
    path, value = [], control
    for part in parts:
        key = int(part) if isinstance(value, list) else part
        path.append(key)
        value = value[key]
    return tuple(path)


def edits_for(entry, keyword, node, here, extra=()):
    text = entry.get('edit', '')
    try:
        return [ast.literal_eval(text)]
    except (ValueError, SyntaxError):
        # The 80-character repr was display text. Regenerate only edits whose
        # display prefix matches that exact recorded text.
        return [x for x in c.go.defects(keyword, node, here) + list(extra) if repr(x)[:80] == text]


def restore_branch_controls(v, nodes, seeds, metadata, controls):
    """Replay GO's recorded branch constructions, with its existing repair functions."""
    by_ipath = collections.defaultdict(list)
    for loc, info in nodes.items():
        for reach in info['reach']:
            if not any(x[0] in c.go.APART for x in reach['ctx']):
                by_ipath[reach['ipath']].append((loc, info['node'], info['resolver']))
    for row in metadata:
        location = row['clause'].rsplit('/', 1)[0]
        info = nodes.get(location)
        if info is None:
            continue
        for reach in info['reach'][:6]:
            if any(x[0] in c.go.APART for x in reach['ctx']):
                continue
            if row['variant'] == 'swap':
                for value in c.go.swap_candidates(v, list(controls.values()), reach):
                    if not c.go.errors_of(v, value):
                        controls.setdefault(digest(value), value)
                continue
            if not isinstance(row['variant'], int):
                continue
            for seed in seeds[:6]:
                try:
                    value, path = c.go.realize(seed, reach, row['variant'], v)
                    if value is None:
                        continue
                    if c.go.errors_of(v, value):
                        parents = [(n, res) for _, n, res in by_ipath.get(reach['ipath'][:-1], [])
                                   if 'properties' in n]
                        realized = value
                        value = c.go.repair(v, value, path, parents)
                        if value is None:
                            value = c.go.error_repair(v, realized, path)
                            if value is None:
                                value = c.go.flip_repair(v, realized, path, reach['ipath'], by_ipath)
                    if value is not None and not c.go.errors_of(v, value):
                        controls.setdefault(digest(value), value)
                except Exception:
                    continue  # the caller records a failure if its selected witness cannot be rebuilt


def reconstruct(v, nodes, clause, entry, controls, raw):
    """Return reference-verified evidence for the recorded verdict, or a concrete failure."""
    if entry.get('replay'):
        result = c.verify_witnesses(v, {clause: entry}, raw, controls)
        if not result['failed']:
            return copy.deepcopy(entry), None
    stored = raw.get(clause)
    if stored is not None and hashlib.sha256(stored).hexdigest() == entry.get('input_sha256'):
        problem = c._witness_problem(v, clause, entry, pickle.loads(stored))
        if problem is None:
            return copy.deepcopy(entry), None
    location = clause.rsplit('/', 1)[0]
    info = nodes.get(location)
    if info is None:
        return None, 'clause absent from the reference walk'
    keyword = next((k for k in c.go.clauses_of(info['node'])
                    if c.go.name_of(k) == clause.rsplit('/', 1)[1]), None)
    if keyword is None:
        return None, 'keyword absent from the reference walk'
    by_ipath = collections.defaultdict(list)
    for loc, item in nodes.items():
        for reach in item['reach']:
            if not any(x[0] in c.go.APART for x in reach['ctx']):
                by_ipath[reach['ipath']].append((loc, item['node'], item['resolver']))
    sibling_edits = [edit for reach in info['reach']
                     for edit in c.go.siblings(location, reach['ipath'], by_ipath)]
    for control_sha, control in list(controls.items()):
        try:
            path = typed_path(control, entry['path'])
            here = c.go.get(control, path)
            edits = edits_for(entry, keyword, info['node'], here, sibling_edits)
        except (KeyError, IndexError, TypeError, ValueError):
            continue
        for edit in edits:
            value = c.go.apply(control, path, edit)
            if value is None or c._witness_problem(v, clause, entry, value):
                continue
            out = copy.deepcopy(entry)
            out.update(replay=base64.b64encode(pickle.dumps((path, edit), protocol=5)).decode(),
                       control_sha256=control_sha, input_sha256=digest(value),
                       input_value_sha256=go2.value_sha(value))
            out['reference_reconstruction'] = dict(original_input_sha256=entry.get('input_sha256'),
                                                   same_pickle=digest(value) == entry.get('input_sha256'),
                                                   method='recorded path/edit on an accepted stored control')
            return out, None
    return None, 'no accepted stored control rebuilds the recorded path/edit with the recorded verdict'


def reverify(dump_path, report_paths, out_path, root_filter=()):
    data = pickle.loads(dump_path.read_bytes())
    reports = [(p, json.loads(p.read_text())) for p in report_paths]
    report = dict(method=__doc__.split('\n\n')[0], from_dump=str(dump_path),
                  inputs=[dict(path=str(p), sha256=hashlib.sha256(p.read_bytes()).hexdigest()) for p in report_paths],
                  roots={}, native_execution='NOT_RUN')
    failed = 0
    for ident in sorted({i for _, r in reports for i in r['roots']}):
        if root_filter and not any(x in ident for x in root_filter):
            continue
        dumped = data['roots'][ident]
        plain = c._rebuild_plain(dumped)
        v = c.closure_validator(plain, ident)
        if c.agree(plain, v, dumped['records']):
            raise ValueError('reference agreement failed: ' + ident)
        c.go.CURRENT[0] = v
        nodes = c.go.walk(v)
        entries, raw, controls, branches = {}, {}, {}, []
        for path, source in reports:
            root = source['roots'].get(ident)
            if root is None:
                continue
            source_raw = load_store(path, root.get('witness_store'))
            controls.update(load_store(path, root.get('control_store')))
            branches.extend(root.get('branch_controls', []))
            for clause, entry in root['clauses'].items():
                previous = entries.get(clause)
                if previous and previous['cls'] == 'KILLED' and entry['cls'] != 'KILLED':
                    continue
                if previous and previous['cls'] in ('KILLED', 'COVERED_LATER') and entry['cls'] == 'UNCOVERED':
                    continue
                entries[clause] = copy.deepcopy(entry)
                raw.pop(clause, None)
                if clause in source_raw:
                    raw[clause] = source_raw[clause]
        for seed in dumped['seeds']:
            controls.setdefault(digest(seed), seed)
        # A root record may hold a valid control omitted by the seed cap.
        for _, blob, expected in dumped['records']:
            if not expected:
                value = pickle.loads(blob)
                controls.setdefault(digest(value), value)
        controls = {sha: value for sha, value in controls.items() if not c.go.errors_of(v, value)}
        restored = False
        problems = []
        for number, (clause, entry) in enumerate(entries.items()):
            if entry['cls'] not in ('KILLED', 'COVERED_LATER'):
                continue
            rebuilt, problem = reconstruct(v, nodes, clause, entry, controls, raw)
            if problem and not restored:
                restore_branch_controls(v, nodes, dumped['seeds'], branches, controls)
                restored = True
                rebuilt, problem = reconstruct(v, nodes, clause, entry, controls, raw)
            if problem:
                problems.append(dict(clause=clause, problem=problem))
            else:
                entries[clause] = rebuilt
            if number % 100 == 0:
                print(f'{ident}: {number}/{len(entries)} reference checks; {len(problems)} failed', flush=True)
        result = c.verify_witnesses(v, entries, raw, controls)
        failed += result['failed']
        root = dict(bank=dumped['bank'], clauses=entries, counts=dict(collections.Counter(e['cls'] for e in entries.values())),
                    verify=result, reconstruction_failures=problems)
        for field, store in (('witness_store', raw), ('control_store', controls)):
            path = Path(str(out_path) + '.' + ident + '.' + field + '.pkl.gz')
            blob = gzip.compress(pickle.dumps(store, protocol=5))
            path.write_bytes(blob)
            root[field] = dict(path=path.name, sha256=hashlib.sha256(blob).hexdigest(), entries=len(store))
        report['roots'][ident] = root
        out_path.write_text(json.dumps(report, indent=1, sort_keys=True) + '\n')
        print(ident, result, flush=True)
    return int(bool(failed))


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--from-dump', type=Path, required=True)
    p.add_argument('--report', action='append', type=Path, required=True)
    p.add_argument('--roots', nargs='*', default=[])
    p.add_argument('--out', type=Path, required=True)
    a = p.parse_args()
    return reverify(a.from_dump, a.report, a.out, a.roots)


if __name__ == '__main__':
    raise SystemExit(main())
