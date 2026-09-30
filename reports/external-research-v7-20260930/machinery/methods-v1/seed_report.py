#!/usr/bin/env python3
"""Mechanical seed carrier: every byte of a prospectively selected candidate report, no added facts."""
import argparse
import json
from pathlib import Path
import re
import cards


def convert(attempt, required_job_id, output):
    attempt = Path(attempt).resolve()
    meta = json.loads((attempt / 'attempt.json').read_text())
    if meta['spec']['job_id'] != required_job_id:
        raise ValueError('seed source is not prospectively bound candidate identity')
    integrity = json.loads((attempt / 'output-integrity.json').read_text())
    if not integrity.get('structural_complete'):
        raise ValueError('upstream dependency missing; no substitute or best-of seed selection')
    report = attempt / 'frozen-output/out/report.md'
    record = next(x for x in integrity['files'] if x['target'] == 'out/report.md')
    if cards.sha(report) != record['sha256']:
        raise ValueError('frozen seed report changed')
    raw = report.read_bytes()
    body = raw.decode('utf-8')
    # Boundaries are candidate-authored level2 headings; no interpretation of case claims.
    boundaries = [m.start() for m in re.finditer(r'^##\s+', body, re.M)]
    starts = sorted(set([0] + boundaries))
    blocks = [body[start:end] for start, end in zip(starts, starts[1:] + [len(body)])]
    blocks = [b for b in blocks if b]
    assert ''.join(blocks).encode('utf-8') == raw
    seed = {'schema': 'er7.candidate_report_seed.v1', 'source_job_id': required_job_id,
            'source_attempt': str(attempt), 'source_report_sha256': record['sha256'],
            'case_id': meta['spec']['case_id'], 'segmentation': 'Exact authored level2 Markdown boundaries, all bytes retained.',
            'findings': [{'id': f'U{i:03d}', 'body': block} for i, block in enumerate(blocks, 1)]}
    cards.write(output, seed)
    return {'output': str(output), 'sha256': cards.sha(output), 'units': len(blocks),
            'all_candidate_report_bytes_retained': True, 'semantic_additions': 0}


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--attempt', type=Path, required=True)
    p.add_argument('--required-job-id', required=True)
    p.add_argument('--output', type=Path, required=True)
    a = p.parse_args()
    print(json.dumps(convert(a.attempt, a.required_job_id, a.output), indent=2))


if __name__ == '__main__':
    main()
