#!/usr/bin/env python3
"""Historical registry citation control and forged-citation negatives."""
from __future__ import annotations

import argparse
import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def run(work):
    spec = importlib.util.spec_from_file_location('gc_grade_writer', ROOT / 'scripts/pm-goal-gc-grades.py')
    writer = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(writer)
    source = json.loads((ROOT / 'reports/event-authority-20261115/PNC019-S3AO-grades-core.json').read_text())
    evidence = next(e for row in source['rows'] for cell in row['cells'].values()
                    for e in cell['evidence'] if e['path'] == 'Plans/event_family_registry.json'
                    and 'registry_revision' in e['quote'])
    historical = writer.reanchor(evidence, source['assessed_tree']['commit'])
    assert historical['path'] == evidence['path'] + '@' + source['assessed_tree']['commit']
    assert historical['quote'] == evidence['quote']
    assert historical['file_sha256'] == evidence['file_sha256']
    row = dict(event_type='citation-mechanics-only', pass_count=12, vector=' '.join(['P'] * 12),
               cells={name: dict(status='PASS', evidence=[copy.deepcopy(historical)]) for name in writer.ORDER})
    control = dict(grade='citation-mechanics-only', rows=[row])
    cases = []
    for name, change, expected in (
        ('historical_exact_control', None, 0),
        ('historical_fake_quote', ('quote', 'FAKE historical registry quote'), 1),
        ('historical_fake_hash', ('file_sha256', '0' * 64), 1),
        ('historical_missing_commit', ('path', evidence['path'] + '@' + '0' * 40), 1),
    ):
        doc = copy.deepcopy(control)
        if change:
            doc['rows'][0]['cells'][writer.ORDER[0]]['evidence'][0][change[0]] = change[1]
        path = work / (name + '.json')
        path.write_text(json.dumps(doc, indent=1) + '\n')
        result = subprocess.run([sys.executable, '-B', str(ROOT / 'scripts/pm-pnc019-s3a-grade-check.py'),
                                 str(path)], cwd=ROOT, capture_output=True, text=True)
        verdict = json.loads(result.stdout)
        assert result.returncode == expected and verdict['status'] == ('pass' if expected == 0 else 'fail')
        cases.append(dict(id=name, exit=result.returncode, expected_exit=expected, verdict=verdict))
    fake = dict(evidence, quote='FAKE historical registry quote')
    try:
        writer.reanchor(fake, source['assessed_tree']['commit'])
    except SystemExit as error:
        cases.append(dict(id='writer_fake_historical_quote', refused=str(error)))
    else:
        raise AssertionError('writer accepted a fake historical quote')
    return dict(status='pass', qualification='TEST_ONLY', native_execution='NOT_RUN', cases=cases)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--work', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    args.work.mkdir(parents=True, exist_ok=True)
    result = run(args.work)
    args.out.write_text(json.dumps(result, indent=1) + '\n')
    print(json.dumps(result))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
