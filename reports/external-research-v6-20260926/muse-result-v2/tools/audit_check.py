#!/usr/bin/env python3
"""Offline successor of the pinned A1 audit; no new grading criteria.

Actual grading methods are inherited unchanged. Only reader selection and
unavailable prerequisite reporting differ. This never rewrites A1 evidence.
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True
LAB = Path(__file__).resolve().parents[2]
ORIGINAL = LAB / 'a1-m-tools/audit_a1.py'
if not ORIGINAL.exists():
    ORIGINAL = LAB / 'a1-m/operator/audit_a1.py'  # Published report layout.
ORIGINAL_SHA256 = '8126e1dabbaa5a397ea773d999a2e548e29af16fe6224d682cb894f13080bdf5'
if hashlib.sha256(ORIGINAL.read_bytes()).hexdigest() != ORIGINAL_SHA256:
    raise RuntimeError('pinned original A1 audit changed')
spec = importlib.util.spec_from_file_location('muse_result_v2_original_audit', ORIGINAL)
original = importlib.util.module_from_spec(spec)
spec.loader.exec_module(original)
original.LAB = LAB  # The published operator directory is one level deeper.


class Audit(original.Audit):
    """Reuse the frozen audit with explicit missing-prerequisite diagnostics."""

    DEPENDENCIES = {
        'template_snapshots_receipts': ('source_pins', 'allocation_and_acknowledgements'),
        'current_and_history': ('source_pins', 'allocation_and_acknowledgements'),
        'native_completion_proofs': ('source_pins', 'allocation_and_acknowledgements'),
        'native_batches': ('allocation_and_acknowledgements', 'native_completion_proofs'),
        'marker_overlap': ('allocation_and_acknowledgements', 'native_completion_proofs'),
        'receipt_read_order': ('allocation_and_acknowledgements', 'native_completion_proofs'),
        'prescribed_native_order': ('allocation_and_acknowledgements', 'native_completion_proofs', 'receipt_read_order'),
        'same_session_goal_scope': ('native_completion_proofs',),
        'unchanged_idle_polls': ('allocation_and_acknowledgements',),
    }

    def sources(self):
        result = super().sources()
        if result['status'] == 'pass':
            successor = Path(__file__).with_name('native_completion.py')
            # A future successor's retained proofs must be checked by the same
            # reader, including advisory metadata. Never regrade frozen A1.
            self.native = original.module('muse_result_v2_audit_reader', successor)
            result.update(original_audit_sha256=ORIGINAL_SHA256,
                          successor_reader_path=str(successor),
                          successor_reader_sha256=original.digest(original.raw(successor)))
        return result

    def inventory(self):
        state = original.load(self.store / 'state.json')
        attempts = state['attempts']
        if not isinstance(attempts, list) or any(not isinstance(a, dict) for a in attempts):
            raise ValueError('acknowledgement records unavailable or malformed')
        initial = ['new--batch-' + str(i).zfill(2) for i in range(1, 7)] + ['new--independent']
        by_request = {a.get('request'): a for a in attempts}
        first = by_request.get(initial[0], {})
        fid = first.get('finding_id')
        expected = initial + ([fid + '--revision-1', fid + '--revision-2']
                              if isinstance(fid, str) and fid else [])
        missing = [name for name in expected if name not in by_request]
        malformed = [index for index, a in enumerate(attempts)
                     if not isinstance(a.get('request'), str) or not a.get('finding_id')]
        if len(attempts) != 9 or missing or malformed or len(expected) != 9:
            errors = ['expected exactly one acknowledgement for each of nine request names']
            if missing:
                errors.append('missing acknowledgements: ' + ', '.join(missing))
            if not fid:
                errors.append('batch-01 finding allocation unavailable; revision request names not reached')
            if malformed:
                errors.append('incomplete acknowledgement records at indexes: ' + str(malformed))
            return self.result(errors, acknowledged=len(attempts), expected_count=9,
                               known_expected_requests=expected, missing_requests=missing,
                               protocol_errors=state.get('protocol_errors', []),
                               native_stream_status=state.get('native_stream_status'),
                               native_finalization_fault=state.get('native_finalization', {}).get('fault'))
        return super().inventory()

    def check(self, name, function):
        blocked = [key for key in self.DEPENDENCIES.get(name, ())
                   if self.checks.get(key, {}).get('status') in
                   {'fail', 'not_reached', 'unavailable'}]
        if blocked:
            self.checks[name] = {
                'status': 'not_reached' if 'allocation_and_acknowledgements' in blocked else 'unavailable',
                'errors': [], 'blocked_by': blocked,
                'reason': 'Required evidence unavailable; dependent grading was not exercised.',
            }
            return
        super().check(name, function)

    def run(self):
        report = super().run()
        # The inherited aggregate knows only pass/fail/inconclusive. Missing
        # required evidence must never become an aggregate pass.
        if report['status'] == 'pass' and any(c['status'] in {'not_reached', 'unavailable'}
                                            for c in self.checks.values()):
            report['status'] = 'inconclusive'
        report.update(successor='muse-result-v2', original_audit_sha256=ORIGINAL_SHA256)
        return report


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('run_root', type=Path)
    report = Audit(cli.parse_args().run_root).run()
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return {'pass': 0, 'fail': 1, 'inconclusive': 2}[report['status']]


if __name__ == '__main__':
    raise SystemExit(main())
