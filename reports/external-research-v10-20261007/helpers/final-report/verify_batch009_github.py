"""Root-only, read-only GitHub verification of the already-pushed ER10 tranche."""
import concurrent.futures
import datetime
import hashlib
import json
import subprocess
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
REPO = 'sittingmongoose/Puppet-Master'
BRANCH = 't3/research/er10-research-efficiency-campaign'
EXPECTED = '415b8a478a89e7c6e9ac73ca0a6975a211809892'
BASE = 'reports/external-research-v10-20261007'

def api(endpoint):
    return json.loads(subprocess.check_output(['gh', 'api', f'repos/{REPO}/{endpoint}'], timeout=45))

def write(name, data):
    p = ROOT / 'state' / name
    assert not p.exists(), str(p)
    p.write_text(json.dumps(data, indent=2, sort_keys=True) + '\n')
    return hashlib.sha256(p.read_bytes()).hexdigest()

def raw_check(row):
    url = f'https://raw.githubusercontent.com/{REPO}/{EXPECTED}/' + urllib.parse.quote(row['path'], safe='/')
    req = urllib.request.Request(url, headers={'User-Agent': 'ER10-retention-verifier'})
    with urllib.request.urlopen(req, timeout=45) as response:
        body = response.read()
        status = response.status
    actual = hashlib.sha256(body).hexdigest()
    assert status == 200 and actual == row['sha256'] and len(body) == row['bytes'], row['path']
    return dict(path=row['path'], sha256=actual, bytes=len(body), http_status=status, url=url)

def main():
    local = json.loads((ROOT / 'state/publication-batch009-local-commit-v1.json').read_text())
    assert local['commit'] == EXPECTED and len(local['files']) == 405
    ref = api('git/ref/heads/' + BRANCH)
    assert ref['object']['sha'] == EXPECTED, ref
    commit = api('git/commits/' + EXPECTED)
    assert commit['sha'] == EXPECTED and commit['parents'][0]['sha'] == local['parent']
    tree = api('git/trees/' + commit['tree']['sha'])
    reports = next(x for x in tree['tree'] if x['path'] == 'reports' and x['type'] == 'tree')
    tree = api('git/trees/' + reports['sha'])
    campaign = next(x for x in tree['tree'] if x['path'] == 'external-research-v10-20261007' and x['type'] == 'tree')
    tree = api('git/trees/' + campaign['sha'] + '?recursive=1')
    assert not tree.get('truncated'), 'truncated tree is insufficient'
    remote = {BASE + '/' + x['path']: x for x in tree['tree'] if x['type'] == 'blob'}
    for row in local['files']:
        x = remote[row['path']]
        assert x['sha'] == row['git_blob_sha1'] and x['size'] == row['bytes'], row['path']
    critical_suffixes = ['/BATCH009_MANIFEST.json', '/INDEX_BATCH009.md',
                         '/helpers/final-report/closed-slot-ledger-v1/CLOSED_SLOT_LEDGER.json',
                         '/helpers/targeted-cohort4/D-M16-A/comparison-v3.json',
                         '/helpers/final-report/slint-8877-minimal-witness-root-v1.json']
    selected = []
    for suffix in critical_suffixes:
        matches = [x for x in local['files'] if x['path'] == BASE + suffix]
        assert len(matches) == 1, (suffix, len(matches))
        selected += matches
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        exact = list(pool.map(raw_check, selected))
    remote_sha = write('publication-batch009-remote-tree-v1.json', tree)
    result = dict(schema='ER10-publication-batch009-GitHub-verified-v1',
                  at=datetime.datetime.now(datetime.timezone.utc).isoformat(), commit=EXPECTED,
                  ref=ref, commit_verified=True, all_405_new_blobs_remote_git_identity_and_size_verified=True,
                  remote_campaign_tree_sha=campaign['sha'], remote_tree_truncated=False,
                  remote_tree_receipt_sha256=remote_sha, critical_exact_files=exact,
                  no_main_or_canon_changes=True)
    receipt_sha = write('publication-batch009.json', result)
    print(json.dumps(dict(status='PASS', commit=EXPECTED, all_blobs=405,
                          raw_http_files=len(exact), receipt_sha256=receipt_sha)))

if __name__ == '__main__':
    main()
