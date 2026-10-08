#!/usr/bin/env python3
"""Recover explicitly verified fixed-commit bodies into a new local directory.

This is a reproduction utility, not an automatic capture or cleanup operation.
It never writes the original campaign paths, follows redirects, or accepts a
different body edition. The catalog covers only its expressly listed identities.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import urllib.request


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def load_catalog(path):
    obj = json.loads(path.read_bytes())
    assert obj['schema'] == 'ER10_FIXED_WHOLE_BODY_RECONSTRUCTION_CATALOG_V1'
    rows = obj['sources']
    seen = set()
    for row in rows:
        sha = row['sha256']
        assert re.fullmatch(r'[0-9a-f]{64}', sha) and sha not in seen
        seen.add(sha)
        assert re.fullmatch(r'https://raw\.githubusercontent\.com/[^/]+/[^/]+/[0-9a-f]{40}/[^\s]+', row['url'])
        assert 0 < row['bytes'] <= 64 * 1024 * 1024
        assert row['whole_original_body_identity_verified'] is True
    return rows


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('catalog', type=Path)
    p.add_argument('--destination', type=Path)
    p.add_argument('--sha256', help='Recover one expressly listed identity only.')
    p.add_argument('--dry-run', action='store_true')
    a = p.parse_args()
    rows = load_catalog(a.catalog)
    if a.sha256:
        rows = [r for r in rows if r['sha256'] == a.sha256]
        if len(rows) != 1:
            p.error('Identity is not uniquely present in the verified catalog.')
    if a.dry_run:
        print(json.dumps({'identities': len(rows), 'bytes': sum(r['bytes'] for r in rows),
                          'network_requests': 0, 'files_written': 0}))
        return
    if not a.destination:
        p.error('--destination or --dry-run is required.')
    dest = a.destination.absolute()
    dest.mkdir(parents=True, exist_ok=False)
    opener = urllib.request.build_opener(NoRedirect)
    recovered = []
    for row in rows:
        req = urllib.request.Request(row['url'], headers={'User-Agent': 'ER10-fixed-source-reproduction',
                                                       'Accept-Encoding': 'identity'})
        with opener.open(req, timeout=30) as response:
            assert response.status == 200 and response.geturl() == row['url']
            body = response.read(row['bytes'] + 1)
        assert len(body) == row['bytes'], 'Fixed body size differs; do not substitute another edition.'
        assert hashlib.sha256(body).hexdigest() == row['sha256'], 'Fixed body hash differs; original evidence remains unresolved.'
        file = dest / (row['sha256'] + '.bin')
        with file.open('xb') as stream:
            stream.write(body)
        recovered.append({'path': file.name, 'sha256': row['sha256'], 'bytes': row['bytes'], 'url': row['url']})
    with (dest / 'RECOVERED_IDENTITIES.json').open('x') as stream:
        json.dump({'sources': recovered, 'no_original_paths_overwritten': True}, stream, indent=2)
        stream.write('\n')
    print(json.dumps({'recovered_identities': len(recovered), 'destination': str(dest)}))


if __name__ == '__main__':
    main()
