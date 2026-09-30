#!/usr/bin/env python3
"""Exact witnessed dependencies and controlled-plan invalidation. No semantic comparison."""
import argparse
import hashlib
import json
from pathlib import Path
import re

REQUIRED = {'finding_sha256', 'source_versions', 'permissions', 'plan_owner_hashes',
            'affected_neighbor_hashes', 'corpus_membership_sha256', 'negative_scope_sha256',
            'applicability', 'comparison_policy', 'instance_binding'}


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def section_hashes(path):
    text = Path(path).read_text()
    boundaries = [0] + [m.start() for m in re.finditer(r'^#{1,6}\s+(.+)$', text, re.M) if m.start()]
    result = {}
    for n, (a, b) in enumerate(zip(boundaries, boundaries[1:] + [len(text)])):
        body = text[a:b]
        m = re.match(r'^#{1,6}\s+(.+)', body)
        name = f'S{n:03d}:' + (m.group(1).strip() if m else 'preamble')
        result[name] = hashlib.sha256(body.encode()).hexdigest()
    return result


def select(witnesses, plan, catalog, seed, output, all_changed=False):
    witnesses = json.loads(Path(witnesses).read_text())['witnesses']
    corpus = json.loads(Path(catalog).read_text())
    seed = json.loads(Path(seed).read_text())
    originals = {f['id']: f for f in seed['findings']}
    versions = {s['handle']: s.get('view_sha256', s.get('sha256', s.get('original_sha256')))
                for s in corpus['sources']}
    sections = section_hashes(plan)
    seen, results = set(), []
    for witness in witnesses:
        fid, dep = witness['id'], witness['dependencies']
        if fid not in originals or fid in seen or REQUIRED - dep.keys():
            raise ValueError('unknown/duplicate witness or incomplete dependencies')
        seen.add(fid)
        exact = hashlib.sha256(json.dumps(originals[fid], sort_keys=True, separators=(',', ':')).encode()).hexdigest()
        if dep['finding_sha256'] != exact:
            raise ValueError('witness finding identity changed')
        if not isinstance(witness.get('result'), str) or not witness['result'].strip() or not witness.get('verification_evidence'):
            raise ValueError('complete witnessed result and candidate evidence required')
        if not dep['source_versions'] or not dep['plan_owner_hashes']:
            raise ValueError('source and owner dependencies cannot be empty')
        current = dict(dep)
        current['source_versions'] = {handle: versions.get(handle, 'MISSING') for handle in dep['source_versions']}
        current['corpus_membership_sha256'] = sha(catalog)
        for name in ('plan_owner_hashes', 'affected_neighbor_hashes'):
            current[name] = {key: sections.get(key, 'MISSING') for key in dep[name]}
        if witness.get('negative_search'):
            current['negative_scope_sha256'] = sha(plan)
        changed = sorted(k for k in REQUIRED if dep[k] != current[k])
        reuse = (not all_changed and not changed and witness.get('status') == 'verified'
                 and witness.get('semantic_ambiguity') is False)
        results.append({'id': fid, 'reuse': reuse, 'changed_dependencies': changed,
                        'reason': 'exact witnessed dependencies match' if reuse else 'fresh candidate comparison/adjudication required',
                        'current_dependencies': current, 'exact_result': witness['result'] if reuse else None})
    if seen != set(originals):
        raise ValueError('baseline must account for all assigned seed blocks')
    result = {'schema': 'er7.incremental_selection.v1', 'plan_sha256': sha(plan),
              'source_catalog_sha256': sha(catalog), 'results': results,
              'semantic_coverage_asserted_by_host': False}
    Path(output).write_text(json.dumps(result, indent=2) + '\n')
    return {'reused': sum(r['reuse'] for r in results), 'recompare': sum(not r['reuse'] for r in results)}


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    for key in ('witnesses', 'plan', 'catalog', 'seed', 'output'):
        p.add_argument('--' + key, type=Path, required=True)
    p.add_argument('--all-changed', action='store_true')
    a = p.parse_args()
    print(json.dumps(select(a.witnesses, a.plan, a.catalog, a.seed, a.output, a.all_changed), indent=2))
