#!/usr/bin/env python3
"""Check a PNC-019 lane s3a depth-grade file: every evidence quote is an exact substring of its cited
line range in this checkout, excerpt and whole-file SHA-256 match, all twelve cells present with a
rubric status, and the recorded vector equals the cells. Read-only. Exit 0 only when every row passes.
Usage: python3 scripts/pm-pnc019-s3a-grade-check.py reports/event-authority-20261114/PNC019-S3A-grades-after.json [--root DIR]
A before-grade file is checked against the tree it names (assessed_tree.commit), e.g. a git worktree at that commit.
"""
import argparse, hashlib, json, sys
from pathlib import Path
ORDER = ['membership_version', 'owner_doc', 'producer', 'closed_payload_schema', 'scope_identity', 'replay_idempotency',
         'retention', 'redaction_custody', 'transitions', 'consumers_checkpoints', 'compatibility_withdrawal', 'positive_negative_oracles']
STATUS = {'PASS', 'PARTIAL', 'ABSENT', 'CONFLICT'}
def main():
    ap = argparse.ArgumentParser(); ap.add_argument('grades'); ap.add_argument('--root', default=str(Path(__file__).resolve().parents[1]))
    a = ap.parse_args(); root = Path(a.root); doc = json.loads(Path(a.grades).read_text(encoding='utf-8'))
    files, problems, quotes = {}, [], 0
    for row in doc['rows']:
        fam = row['event_type']
        if set(row['cells']) != set(ORDER): problems.append(f'{fam}: cells {sorted(row["cells"])}')
        for c in ORDER:
            cell = row['cells'].get(c, {})
            if cell.get('status') not in STATUS: problems.append(f'{fam}/{c}: status {cell.get("status")!r}')
            if not cell.get('evidence'): problems.append(f'{fam}/{c}: no evidence')
            for e in cell.get('evidence', []):
                quotes += 1
                if e['path'] not in files:
                    b = (root / e['path']).read_bytes(); files[e['path']] = (hashlib.sha256(b).hexdigest(), b.decode('utf-8').split('\n'))
                fh, lines = files[e['path']]; ex = '\n'.join(lines[e['line_start'] - 1:e['line_end']])
                if e['quote'] not in ex: problems.append(f'{fam}/{c}: quote not at {e["path"]}:{e["line_start"]}-{e["line_end"]}')
                elif hashlib.sha256(ex.encode()).hexdigest() != e['excerpt_sha256']: problems.append(f'{fam}/{c}: excerpt hash {e["path"]}:{e["line_start"]}')
                if fh != e['file_sha256']: problems.append(f'{fam}/{c}: file hash {e["path"]}')
        if row.get('pass_count') is not None and row['pass_count'] != sum(row['cells'][c]['status'] == 'PASS' for c in ORDER):
            problems.append(f'{fam}: pass_count')
        expected_vector = ' '.join({'PASS':'P', 'PARTIAL':'p', 'ABSENT':'A', 'CONFLICT':'C'}.get(row['cells'].get(c, {}).get('status'), '?') for c in ORDER)
        if row.get('vector') != expected_vector: problems.append(f'{fam}: vector')
    out = dict(status='pass' if not problems else 'fail', grade=doc.get('grade'), rows=len(doc['rows']), quotes=quotes, files=len(files), problems=problems[:50])
    print(json.dumps(out, indent=1)); return 0 if not problems else 1
if __name__ == '__main__': sys.exit(main())
