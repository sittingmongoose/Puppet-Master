#!/usr/bin/env python3
"""T01 mechanical aggregate of ALL assigned controls, including capped or missing output."""
import argparse
import json
from pathlib import Path
import cards


def aggregate(pair):
    pair = Path(pair).resolve()
    card = json.loads((pair / 'pair.json').read_text())
    if card['method'] != 'T01':
        raise ValueError('not a full-scope T01 topology')
    expected = [r for r in card['attempts'] if r['arm'] == 'control']
    pieces, ledger = [], []
    for r in expected:
        attempt = Path(r['attempt'])
        meta = json.loads((attempt / 'attempt.json').read_text())
        integrity = json.loads((attempt / 'output-integrity.json').read_text())
        receipt = json.loads((attempt / 'boundary-receipt.json').read_text())
        if meta['spec']['job_id'] != r['job_id'] or receipt['job_id'] != r['job_id']:
            raise ValueError('aggregate assignment identity mismatch')
        report = attempt / 'frozen-output/out/report.md'
        rec = next((f for f in integrity['files'] if f['target'] == 'out/report.md'), None)
        status = receipt.get('native_stop_reason', 'unknown')
        heading = '# Assigned control: ' + r['assignment_id'] + '\n\n'
        heading += 'Native stop reason: ' + str(status) + '. This assignment remains in the full-scope denominator.\n\n'
        if report.is_file() and rec:
            if cards.sha(report) != rec['sha256']:
                raise ValueError('frozen control report mutation')
            raw = report.read_bytes()
            body = raw.decode('utf-8')
            pieces.append(heading + body)
            ledger.append({'job_id': r['job_id'], 'report_sha256': rec['sha256'], 'report_bytes': len(raw),
                           'native_stop_reason': status, 'structural_complete': integrity['structural_complete'],
                           'scope': meta['spec']['scope'], 'semantic_rewrite': False})
        else:
            pieces.append(heading + 'Required current report missing for this assignment.\n')
            ledger.append({'job_id': r['job_id'], 'report_missing': True, 'native_stop_reason': status,
                           'scope': meta['spec']['scope'], 'semantic_rewrite': False})
    final = '\n\n'.join(pieces)
    (pair / 'aggregate-control-report.md').write_text(final)
    result = {'schema': 'er7.topology_aggregate.v1', 'pair_id': card['pair_id'],
              'all_assigned_control_jobs': ledger, 'report_sha256': cards.sha(pair / 'aggregate-control-report.md'),
              'aggregation': 'All source report bodies concatenated verbatim; only mechanical assignment/status headings added.',
              'evaluation': 'Entire sum of both declared scopes; capped or missing assignments cannot be dropped.'}
    cards.write(pair / 'aggregate-control-integrity.json', result)
    return {'report': str(pair / 'aggregate-control-report.md'), 'integrity': str(pair / 'aggregate-control-integrity.json'),
            'assignments': len(expected), 'report_sha256': result['report_sha256']}


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--pair', type=Path, required=True)
    a = p.parse_args()
    print(json.dumps(aggregate(a.pair), indent=2))
