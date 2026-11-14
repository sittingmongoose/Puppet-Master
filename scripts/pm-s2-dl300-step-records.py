#!/usr/bin/env python3
"""Write or re-pin the three DL-412 step-form admission records of the DL-300 families (PNC-019 S2).

The registry step that added settings.layer.changed, approval.chat_tool_requested and approval.chat_tool_resolved is
102a7e99e8~1 -> 102a7e99e8 (2026-10-09.1 on both sides, 43 -> 46 families). Each record pins, with the frozen
validator's own functions: the DL-300 prose section, the live registry row, the S2 depth assessment and the DL-412
multi-family receipt it is written under (implementation_receipt_sha256).

  --write   write the three records (fields computed now; informational fields fixed below)
  --repin   only refresh implementation_receipt_sha256 to the current receipt bytes (run after the CA-SEAL landing
            fills lander_task in the DL-412 receipt; DL-412's re-pin rule) and the depth pin if the file changed
  --check   exit 1 unless every computed field equals the committed record
"""
import argparse
import hashlib
import importlib.util
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VALIDATOR = ROOT / 'Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py'
STEP_COMMIT = '102a7e99e80aa159f98e685a6730b2245056a49b'
STEP = ['approval.chat_tool_requested', 'approval.chat_tool_resolved', 'settings.layer.changed']
DEPTH = 'reports/event-authority-20261114/s2-depth-dl300.json'
RECORDED_BY = 'claude-opus-5.5:ea-pnc-s2-20261114'


def validator():
    spec = importlib.util.spec_from_file_location('frozen_validator', VALIDATOR)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)   # defines functions only; main() is not run
    return module


def registry_state(rev):
    raw = subprocess.check_output(['git', '-C', str(ROOT), 'show', rev + ':Plans/event_family_registry.json'])
    doc = json.loads(raw)
    return dict(revision=doc['registry_revision'], sha256=hashlib.sha256(raw).hexdigest(), family_count=len(doc['families']))


def computed(v, et):
    live = {f['event_type']: f for f in json.loads((ROOT / 'Plans/event_family_registry.json').read_text())['families']}
    section = v.decision_section_bytes(ROOT / 'Plans/Decision_Log.md', 'DL-300')
    return dict(
        schema_id=v.POST_AUGUST_RECORD_SCHEMA, event_type=et, family_id=live[et]['family_id'],
        implementation_receipt_sha256=v.sha256_file(ROOT / v.MULTI_FAMILY_RECEIPT),
        decision_ref='Plans/Decision_Log.md#DL-300', decision_section_sha256=hashlib.sha256(section).hexdigest(),
        registry_before=registry_state(STEP_COMMIT + '~1'), registry_after=registry_state(STEP_COMMIT),
        registry_step_event_types=list(STEP), registry_row_sha256=v.canonical_json_sha256(live[et]),
        depth_assessment=dict(path=DEPTH, sha256=v.sha256_file(ROOT / DEPTH)))


INFO = dict(
    admission_landing=dict(commit=STEP_COMMIT, relabel_commit='5375bfd2a7',
                           record='Plans/Decision_Log.md#DL-300',
                           note=('102a7e99e8 appended the three rows (43 -> 46, label 2026-10-09.1 on both sides); 5375bfd2a7, '
                                 "DL-300's landing, only relabeled the registry to 2026-11-04.1 and added no family.")),
    criteria_not_passing_at_recording=[], status_at_recording='complete_depth', recorded_by=RECORDED_BY)
NOTES = [
    'Written under DL-412 (step form) for the DL-300 registration step 102a7e99e8~1 -> 102a7e99e8. The same step also changed '
    "eleven existing Goal rows (their application scope editions); the seal check does not examine that, and this record "
    'makes no claim about them.',
    'implementation_receipt_sha256 pins the DL-412 receipt bytes this record is written under. DL-412 re-pin rule: when the '
    'CA-SEAL landing fills lander_task (or any later receipt rewrite), run python3 scripts/pm-s2-dl300-step-records.py --repin '
    'and commit the three records together.',
    'The depth assessment is the PNC-019 S2 lane grade (twelve PASS cells per family); the two fields ending in _at_recording '
    'are informational only.',
]


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--write', action='store_true')
    mode.add_argument('--repin', action='store_true')
    mode.add_argument('--check', action='store_true')
    parser.add_argument('--recorded-at', default=None)
    args = parser.parse_args()
    v = validator()
    out_dir = ROOT / v.POST_AUGUST_RECORD_DIR
    bad = []
    for et in STEP:
        path = out_dir / (et + '.json')
        want = computed(v, et)
        if args.write:
            record = dict(want, **INFO, recorded_at_utc=args.recorded_at, notes=NOTES)
        else:
            record = json.loads(path.read_text())
            if args.check:
                bad += [(et, k) for k, val in want.items() if record.get(k) != val]
                continue
            record['implementation_receipt_sha256'] = want['implementation_receipt_sha256']
            record['depth_assessment'] = want['depth_assessment']
        path.write_text(json.dumps(record, indent=2, ensure_ascii=False) + '\n')
        print(path.relative_to(ROOT), record['implementation_receipt_sha256'][:12], record['depth_assessment']['sha256'][:12])
    if args.check:
        print(json.dumps({'status': 'pass' if not bad else 'fail', 'mismatches': bad}))
        return 1 if bad else 0
    return 0


if __name__ == '__main__':
    sys.exit(main())
