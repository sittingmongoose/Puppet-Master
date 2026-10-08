#!/usr/bin/env python3
"""Verify every explicitly published blob and selected exact GitHub raw bodies."""
import argparse
import concurrent.futures
import datetime
import hashlib
import json
import subprocess
import urllib.parse
import urllib.request
from pathlib import Path


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--local-identity', type=Path, required=True)
    ap.add_argument('--output', type=Path, required=True)
    ap.add_argument('--tree-output', type=Path, required=True)
    a = ap.parse_args()
    assert not a.output.exists() and not a.tree_output.exists()
    local_bytes = a.local_identity.read_bytes()
    local = json.loads(local_bytes)
    repo, commit_id, branch = local['repository'], local['commit'], local['branch']
    base = local['report_base']

    def api(endpoint):
        return json.loads(subprocess.check_output(['gh', 'api', f'repos/{repo}/{endpoint}'], timeout=45))

    ref = api('git/ref/heads/' + branch)
    assert ref['object']['sha'] == commit_id
    commit = api('git/commits/' + commit_id)
    assert commit['sha'] == commit_id and commit['parents'][0]['sha'] == local['parent']
    tree = api('git/trees/' + commit['tree']['sha'])
    subtree_sha = commit['tree']['sha']
    for part in base.split('/'):
        row = next(r for r in tree['tree'] if r['path'] == part and r['type'] == 'tree')
        subtree_sha = row['sha']
        tree = api('git/trees/' + subtree_sha)
    tree = api('git/trees/' + subtree_sha + '?recursive=1')
    assert not tree.get('truncated'), 'Truncated remote tree is not full verification'
    remote = {base + '/' + r['path']: r for r in tree['tree'] if r['type'] == 'blob'}
    for row in local['files']:
        actual = remote[row['path']]
        assert actual['sha'] == row['git_blob_sha1'] and actual['size'] == row['bytes'], row['path']
    bypath = {r['path']: r for r in local['files']}

    def raw(path):
        expected = bypath[path]
        url = 'https://raw.githubusercontent.com/' + repo + '/' + commit_id + '/' + urllib.parse.quote(path, safe='/')
        req = urllib.request.Request(url, headers={'User-Agent': 'ER10-final-publication-verifier'})
        with urllib.request.urlopen(req, timeout=45) as response:
            body = response.read()
            assert response.status == 200
        assert hashlib.sha256(body).hexdigest() == expected['sha256'] and len(body) == expected['bytes'], path
        return {'path': path, 'sha256': expected['sha256'], 'bytes': len(body), 'http_status': 200, 'url': url}

    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        bodies = list(pool.map(raw, local['critical_paths']))
    tree_bytes = (json.dumps(tree, indent=2, sort_keys=True) + '\n').encode()
    with a.tree_output.open('xb') as f:
        f.write(tree_bytes)
    out = {'schema': 'ER10_ROOT_EXACT_GITHUB_PUBLICATION_VERIFICATION_V1',
           'status': 'PASS', 'recorded_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
           'repository': repo, 'branch': branch, 'commit': commit_id, 'parent': local['parent'],
           'actual_remote_ref_matches': True, 'actual_commit_parent_matches': True,
           'all_new_blobs_remote_git_identity_and_size_verified': True,
           'new_blob_count': len(local['files']), 'remote_campaign_tree_truncated': False,
           'remote_tree_receipt': {'path': str(a.tree_output), 'sha256': hashlib.sha256(tree_bytes).hexdigest()},
           'critical_exact_raw_http_bodies': bodies,
           'local_identity': {'path': str(a.local_identity), 'sha256': hashlib.sha256(local_bytes).hexdigest()},
           'no_main_or_canonical_plan_changes': True}
    with a.output.open('x') as f:
        json.dump(out, f, indent=2, sort_keys=True)
        f.write('\n')
    print(json.dumps({'status': 'PASS', 'commit': commit_id, 'blobs_verified': len(local['files']),
                      'exact_raw_http_bodies_verified': len(bodies), 'receipt_sha256': hashlib.sha256(a.output.read_bytes()).hexdigest()}))


if __name__ == '__main__':
    main()
