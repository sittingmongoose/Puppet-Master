"""Verify current W3E/W3I self-grade quotations and their source hashes."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--json')
    args = parser.parse_args()
    sources, failures, checked = {}, [], 0
    for lane in ('W3E', 'W3I'):
        path = ROOT / 'reports/event-authority-20261105' / (lane + '-self-grade.json')
        document = json.loads(path.read_text())
        for family in document.get('rows', document.get('families', [])):
            for criterion, cell in family['cells'].items():
                for evidence in cell.get('evidence', []):
                    rel = evidence['path']
                    if rel not in sources:
                        raw = (ROOT / rel).read_bytes()
                        sources[rel] = (raw.decode().splitlines(), hashlib.sha256(raw).hexdigest())
                    lines, sha = sources[rel]
                    line, end = evidence['line_start'], evidence.get('line_end', evidence['line_start'])
                    checked += 1
                    if not (1 <= line <= end <= len(lines) and evidence['quote'] in '\n'.join(lines[line - 1:end])):
                        failures.append({'family': family['event_type'], 'criterion': criterion, 'path': rel,
                                         'line': line, 'error': 'quote_not_at_declared_lines'})
                    if evidence.get('file_sha256', sha) != sha:
                        failures.append({'family': family['event_type'], 'criterion': criterion, 'path': rel,
                                         'error': 'source_hash_stale'})
    result = {'status': 'pass' if not failures else 'fail', 'checked': checked, 'failures': failures}
    text = json.dumps(result, indent=2) + '\n'
    if args.json:
        Path(args.json).write_text(text)
    print(text, end='')
    return int(bool(failures))


if __name__ == '__main__':
    raise SystemExit(main())
