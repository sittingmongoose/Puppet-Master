#!/usr/bin/env python3
"""T15 exact dependency selection. Candidate witnesses supply all semantic judgments."""
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


def sections(path):
    text = Path(path).read_text()
    bounds = [0] + [m.start() for m in re.finditer(r'^#{1,6}\s+(.+)$', text, re.M) if m.start()]
    result = {}
    for n, (a, b) in enumerate(zip(bounds, bounds[1:] + [len(text)])):
        body = text[a:b]
        match = re.match(r'^#{1,6}\s+(.+)', body)
        key = f'S{n:03d}:' + (match.group(1).strip() if match else 'preamble')
        result[key] = {'body': body, 'sha256': hashlib.sha256(body.encode()).hexdigest()}
    return result


def select(witnesses, plan, catalog, seed, context, output, all_changed=False):
    records = json.loads(Path(witnesses).read_text())['witnesses']
    findings = json.loads(Path(seed).read_text())['findings']
    originals = {x['id']: x for x in findings}
    if len(originals) != len(findings) or not originals:
        raise ValueError('seed must have nonempty unique finding identities')
    corpus = json.loads(Path(catalog).read_text())
    versions = {x['handle']: x.get('view_sha256', x.get('sha256', x.get('original_sha256')))
                for x in corpus['sources']}
    ctx = json.loads(Path(context).read_text())
    indexed = sections(plan)
    results, seen = [], set()
    for w in records:
        fid, old = w['id'], w['dependencies']
        if fid not in originals or fid in seen or REQUIRED - old.keys():
            raise ValueError('unknown/duplicate/incomplete witness')
        seen.add(fid)
        digest = hashlib.sha256(json.dumps(originals[fid], sort_keys=True, separators=(',', ':')).encode()).hexdigest()
        if old['finding_sha256'] != digest:
            raise ValueError('finding identity/hash mismatch')
        if not isinstance(w.get('result'), str) or not w['result'].strip() or not w.get('verification_evidence'):
            raise ValueError('complete candidate result/evidence required')
        if not old['source_versions'] or not old['plan_owner_hashes']:
            raise ValueError('source and owner dependencies required')
        current = dict(old)
        current['source_versions'] = {key: versions.get(key, 'MISSING') for key in old['source_versions']}
        current['corpus_membership_sha256'] = sha(catalog)
        for key in ('plan_owner_hashes', 'affected_neighbor_hashes'):
            current[key] = {name: indexed.get(name, {}).get('sha256', 'MISSING') for name in old[key]}
        for key in ('permissions', 'applicability', 'comparison_policy'):
            current[key] = ctx[key]
        current['instance_binding'] = ctx['instance_binding_prefix'] + ':' + fid
        if w.get('negative_search'):
            current['negative_scope_sha256'] = sha(plan)
        changed = sorted(key for key in REQUIRED if current[key] != old[key])
        reusable = not all_changed and not changed and w.get('status') == 'verified' and w.get('semantic_ambiguity') is False
        results.append({'id': fid, 'reuse': reusable, 'changed_dependencies': changed,
                        'current_dependencies': current, 'exact_result': w['result'] if reusable else None,
                        'reason': 'exact candidate-witnessed dependencies match' if reusable else 'fresh candidate comparison required'})
    if seen != set(originals):
        raise ValueError('baseline must cover every assigned seed finding')
    value = {'schema': 'er7.resume_incremental_selection.v1', 'results': results,
             'plan_sha256': sha(plan), 'catalog_sha256': sha(catalog), 'context_sha256': sha(context),
             'selector_sha256': sha(__file__), 'semantic_coverage_asserted_by_host': False}
    Path(output).write_text(json.dumps(value, indent=2) + '\n')
    return value


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    for key in ('witnesses', 'plan', 'catalog', 'seed', 'context', 'output'):
        p.add_argument('--' + key, type=Path, required=True)
    p.add_argument('--all-changed', action='store_true')
    a = p.parse_args()
    select(a.witnesses, a.plan, a.catalog, a.seed, a.context, a.output, a.all_changed)
