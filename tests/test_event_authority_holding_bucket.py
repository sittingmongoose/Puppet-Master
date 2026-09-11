"""Behavioral checks for DL-039's sole authorized holding-bucket validator repair."""
import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import tempfile
import unittest

REPO = Path(__file__).resolve().parents[1]
AUDIT = Path('Plans/.audits/event-authority-2026-08-12')
VALIDATOR = AUDIT / 'independent-validator/pm_event_authority_independent_validator.py'


class HoldingBucketTests(unittest.TestCase):
    def setUp(self):
        spec = importlib.util.spec_from_file_location('holding_validator', REPO / VALIDATOR)
        self.v = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.v)
        self.temp = tempfile.TemporaryDirectory(dir=os.environ.get('PM_TEST_EVIDENCE_DIR'))
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        paths = [Path('Plans/Decision_Log.md'), Path(self.v.HOLDING_RECEIPT),
                 AUDIT / 'cohort-pins/IMMUTABLE_COHORT_PINS.json',
                 AUDIT / 'closed-world-census/admission/MACHINE_CONTRACT_EVENT_BINDING_SCAN.json']
        for rel in paths:
            dest = self.root / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(REPO / rel, dest)
        self.cohort = self.v.load_json(self.root / paths[2])
        self.scan = self.v.load_json(self.root / paths[3])
        self.decisions = self.v.load_json(REPO / AUDIT / 'OWNER_DECISION_SHEET.json')['decisions']
        self.historical_rows = self.v.load_ledger(REPO / AUDIT / 'individual-disposition/LEDGER.jsonl')
        self.aliases = {r['event_type'] for r in self.historical_rows
                        if r.get('bucket') == 'alias' and r.get('disposition') == 'RECLASSIFY_ALIAS'}
        self.receipt_path = self.root / self.v.HOLDING_RECEIPT
        self.receipt = self.v.load_json(self.receipt_path)
        self.members = set(self.receipt['members'])
        self.rows = [copy.deepcopy(r) for r in self.historical_rows if r['event_type'] in self.members]
        self.v.REPO = self.root
        self.v.ROOT = self.root / 'Plans'
        self.v.COHORT = self.root / paths[2]
        self.v.CENSUS = self.root / AUDIT / 'closed-world-census'
        self.live = set()
        self.denom = {'admitted_persisted_event_families': {'event_types': []}}
        self.apply_genuine_provenance()

    def apply_genuine_provenance(self):
        sheet = {d['decision_id']: d for d in self.decisions}
        for row in self.rows:
            did = self.receipt['members'][row['event_type']]['decision_id']
            row['holding_authority'] = {
                'authority_ref': self.v.HOLDING_AUTHORITY,
                'decision_id': did,
                'owner_response': copy.deepcopy(sheet[did]['owner_response']),
                'implementation_receipt': self.v.HOLDING_RECEIPT,
                'implementation_receipt_sha256': self.v.sha256_file(self.receipt_path),
                'applied_at_utc': '2026-09-11T12:00:00Z',
            }
            row['disposition_rationale'] = 'Fixture only: explicit genuine DL-039 holding application.'

    def check(self):
        return self.v.validate_holding_bucket(self.cohort, self.scan, self.aliases,
                                              self.decisions, self.rows, self.live, self.denom)

    def reject(self):
        self.assertTrue(self.check()[2])

    def test_genuine_application_of_exact_54_is_valid_without_depth_claim(self):
        authorized, expected, issues = self.check()
        self.assertTrue(authorized)
        self.assertEqual(expected, self.members)
        self.assertEqual(len(expected), 54)
        self.assertEqual(issues, [])
        self.assertTrue(any(c['status'] != 'PASS' for r in self.rows for c in r['evidence'].values()))
        self.assertFalse(self.receipt['contract_depth_complete'])

    def test_existing_forged_application_is_rejected(self):
        self.rows = self.historical_rows
        self.reject()

    def test_authorized_rows_without_genuine_provenance_are_rejected(self):
        for row in self.rows:
            row.pop('holding_authority')
        self.reject()

    def test_compaction_august_j248_and_alias_cannot_leak_into_holding(self):
        original = copy.deepcopy(self.rows)
        for event in ['context.compaction.completed', 'workspace.layout_changed',
                      'terminal.workgroup_moved',
                      next(iter(set(self.cohort['cohorts']['july248_confirmed_persisted_unregistered']['event_types']) - self.members)),
                      next(iter(self.aliases))]:
            with self.subTest(event=event):
                self.rows = copy.deepcopy(original)
                extra = copy.deepcopy(self.rows[0])
                extra['event_type'] = event
                self.rows.append(extra)
                self.reject()

    def test_missing_duplicate_or_replaced_member_is_rejected(self):
        original = copy.deepcopy(self.rows)
        for mode in ['missing', 'duplicate', 'replacement']:
            with self.subTest(mode=mode):
                self.rows = copy.deepcopy(original)
                if mode == 'missing':
                    self.rows.pop()
                elif mode == 'duplicate':
                    self.rows.append(copy.deepcopy(self.rows[0]))
                else:
                    self.rows[0]['event_type'] = 'invented.holding'
                self.reject()

    def test_registered_and_denominator_membership_are_rejected(self):
        self.live.add(self.rows[0]['event_type'])
        self.reject()
        self.live.clear()
        self.denom['admitted_persisted_event_families']['event_types'] = [self.rows[0]['event_type']]
        self.reject()
        self.denom['admitted_persisted_event_families']['event_types'] = 'malformed'
        self.reject()

    def test_missing_malformed_or_tampered_receipt_is_rejected(self):
        original = self.receipt_path.read_bytes()
        for value in [None, b'{', b'[]', b'{}']:
            with self.subTest(value=value):
                if value is None:
                    self.receipt_path.unlink()
                else:
                    self.receipt_path.write_bytes(value)
                self.reject()
                self.receipt_path.write_bytes(original)
        for key in ['schema_id', 'authority_section_sha256', 'validator_after_sha256',
                    'author_task', 'lander_task', 'seal_applier_forbidden_task',
                    'cohort_pins_sha256', 'machine_scan_sha256', 'members', 'seal_authorized',
                    'admission_authorized', 'contract_depth_complete', 'owner_responses']:
            with self.subTest(key=key):
                changed = copy.deepcopy(self.receipt)
                changed[key] = None
                self.receipt_path.write_text(json.dumps(changed))
                self.reject()
        self.receipt_path.write_bytes(original)

    def test_missing_malformed_or_changed_dl039_is_rejected(self):
        path = self.root / 'Plans/Decision_Log.md'
        original = path.read_bytes()
        for value in [None, b'# No authority', original.replace(b'26 emit-only plus 28 unresolved', b'27 emit-only plus 27 unresolved')]:
            with self.subTest(value=None if value is None else len(value)):
                if value is None:
                    path.unlink()
                else:
                    path.write_bytes(value)
                self.reject()
                path.write_bytes(original)

    def test_unrelated_next_decision_does_not_change_dl039_authority(self):
        path = self.root / 'Plans/Decision_Log.md'
        original_hash = hashlib.sha256(self.v.holding_authority_bytes(path)).hexdigest()
        raw = path.read_bytes()
        path.write_bytes(raw.replace(b"## Owner / Consumer Map", b"### DL-040: unrelated future decision\n\nUnrelated.\n\n## Owner / Consumer Map", 1))
        self.assertEqual(hashlib.sha256(self.v.holding_authority_bytes(path)).hexdigest(), original_hash)
        self.assertEqual(self.check()[2], [])

    def test_ninth_missing_duplicate_and_forged_sheet_answer_are_rejected(self):
        original = copy.deepcopy(self.decisions)
        for mode in ['ninth', 'missing', 'duplicate', 'forged', 'malformed_time', 'naive_time', 'future_time']:
            with self.subTest(mode=mode):
                self.decisions = copy.deepcopy(original)
                decision = next(d for d in self.decisions if d['decision_id'] == 'J40-VETO-BATCH')
                if mode == 'ninth':
                    self.decisions.append({'decision_id': 'UNRESOLVED-54-CLOSE-PATH', 'owner_response': {'chosen_option': 'NEW_NON_ADMITTED_QUARANTINE_BUCKET'}})
                elif mode == 'missing':
                    self.decisions.pop()
                elif mode == 'duplicate':
                    self.decisions[-1] = copy.deepcopy(self.decisions[0])
                elif mode == 'forged':
                    decision['owner_response']['recorded_at_utc'] = '2026-08-12T12:02:00Z'
                elif mode == 'future_time':
                    decision['owner_response']['recorded_at_utc'] = '2026-10-10T12:00:00Z'
                    self.apply_genuine_provenance()
                    for row in self.rows:
                        row['holding_authority']['applied_at_utc'] = '2026-10-11T12:00:00Z'
                elif mode == 'malformed_time':
                    decision['owner_response']['recorded_at_utc'] = []
                else:
                    decision['owner_response']['recorded_at_utc'] = '2026-09-10T12:00:00'
                self.reject()

    def test_row_disposition_provenance_and_evidence_tampering_are_rejected(self):
        original = copy.deepcopy(self.rows)
        for key, value in [('disposition', 'KEEP_REGISTERED'), ('bucket', 'august'),
                           ('working_bucket', 'unresolved'), ('bulk_registration', True),
                           ('holding_authority', {}), ('evidence', {}),
                           ('disposition_rationale', 'Old UNRESOLVED-54-CLOSE-PATH plus DL-039'),
                           ('disposition_rationale', 'No authority citation')]:
            with self.subTest(key=key):
                self.rows = copy.deepcopy(original)
                self.rows[0][key] = value
                self.reject()
        for key, value in [('authority_ref', 'forged'), ('decision_id', 'UNRESOLVED-54-CLOSE-PATH'),
                           ('owner_response', {}), ('implementation_receipt_sha256', '0' * 64),
                           ('applied_at_utc', '2026-08-12T12:02:00Z'), ('applied_at_utc', 'bad')]:
            with self.subTest(key=key, value=value):
                self.rows = copy.deepcopy(original)
                self.rows[0]['holding_authority'][key] = value
                self.reject()

    def test_receipt_population_cannot_redefine_pinned_membership(self):
        self.scan['emit_candidates_total'].append('invented.emit')
        self.reject()
        self.scan['emit_candidates_total'].pop()
        self.aliases.remove(next(iter(self.aliases)))
        self.reject()

    def test_partition_never_expands_holding_to_compaction_or_august(self):
        for compact in [False, True]:
            for august in [False, True]:
                with self.subTest(compact=compact, august=august):
                    result = self.v.derive_independent_partition(
                        self.cohort, {}, self.scan, self.aliases,
                        qna_close=True, compact_not_admitted=compact, august_reclassified=august)
                    self.assertEqual(result['quarantined_not_admitted'], self.members)


if __name__ == '__main__':
    unittest.main()
