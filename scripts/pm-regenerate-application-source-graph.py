#!/usr/bin/env python3
"""Regenerate reviewed resource pins and CV-366's complete source-graph digest.

This preserves resource selection, literal pointers, methods and role edges. The
ordinary graph validator must accept the regenerated candidate before any write.
An explicit old resource hash prevents an unnoticed concurrent revision refresh.
"""
import argparse
import copy
import hashlib
import json
from pathlib import Path
from pm_projects_refresh_contracts import Corpus, graph_failures, semantic_hash

GRAPH = 'Plans/application_workflow_source_graph.json'


def regenerate(root, updates):
    corpus = Corpus(root)
    before = corpus.document(GRAPH)
    original = {k: v for k, v in before.items() if k != 'graph_sha256'}
    if semantic_hash('source_graph', original) != before['graph_sha256']:
        raise ValueError('original source graph digest is invalid')
    candidate = copy.deepcopy(before)
    changes = []
    for path, expected_prior in updates:
        matches = [r for r in candidate['resources'] if r['path'] == path]
        if len(matches) != 1 or matches[0]['whole_resource_sha256'] != expected_prior:
            raise ValueError('resource selection/prior pin changed: ' + path)
        current = hashlib.sha256(corpus.path(path).read_bytes()).hexdigest()
        matches[0]['whole_resource_sha256'] = current
        changes.append({'path': path, 'before': expected_prior, 'after': current})
    candidate['graph_sha256'] = semantic_hash('source_graph',
        {k: v for k, v in candidate.items() if k != 'graph_sha256'})
    corpus.documents[GRAPH] = candidate
    errors = graph_failures(corpus)
    if errors:
        raise ValueError('regenerated graph validation: ' + '; '.join(errors))
    return candidate, changes


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--resource', nargs=2, action='append', required=True,
                        metavar=('PATH', 'REVIEWED_PRIOR_SHA256'))
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    candidate, changes = regenerate(args.root, args.resource)
    if args.write:
        (args.root / GRAPH).write_text(json.dumps(candidate, indent=2) + '\n')
    print(json.dumps({'status': 'pass', 'written': args.write, 'resources': changes,
                      'graph_sha256': candidate['graph_sha256']}, indent=2))


if __name__ == '__main__':
    main()
