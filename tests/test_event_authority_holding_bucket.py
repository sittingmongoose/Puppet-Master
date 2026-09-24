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
                 AUDIT / 'closed-world-census/admission/MACHINE_CONTRACT_EVENT_BINDING_SCAN.json',
                 Path(self.v.POST_AUGUST_RECEIPT)]
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

    def test_forged_application_is_rejected_even_after_live_ledger_repair(self):
        # The live ledger legitimately acquired DL-039 provenance in Step 5.
        # Construct the voided application explicitly so repairing that ledger
        # cannot turn this negative control into an accidentally valid fixture.
        original = copy.deepcopy(self.rows)
        for mode in ['missing_provenance', 'forged_ninth_decision', 'forged_august_stamp']:
            with self.subTest(mode=mode):
                self.rows = copy.deepcopy(original)
                for row in self.rows:
                    if mode == 'missing_provenance':
                        row.pop('holding_authority')
                    elif mode == 'forged_ninth_decision':
                        row['holding_authority']['decision_id'] = 'UNRESOLVED-54-CLOSE-PATH'
                        row['disposition_rationale'] = 'Voided UNRESOLVED-54-CLOSE-PATH application.'
                    else:
                        row['holding_authority']['owner_response']['source'] = 'jared_chat_2026-08-12'
                        row['holding_authority']['owner_response']['recorded_at_utc'] = '2026-08-12T12:02:00Z'
                        row['holding_authority']['applied_at_utc'] = '2026-08-12T12:02:00Z'
                authorized, expected, issues = self.check()
                self.assertTrue(authorized)
                self.assertEqual(expected, self.members)
                self.assertTrue(issues)
        self.rows = original
        self.assertEqual(self.check()[2], [])

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

    def test_holding_pin_follows_only_the_dl077_receipt_chain(self):
        post = self.root / self.v.POST_AUGUST_RECEIPT
        original = post.read_bytes()
        self.assertEqual(self.check()[2], [])
        post.unlink()
        self.reject()  # the validator bytes changed after Step 3; only DL-077's receipt explains that
        post.write_bytes(original)
        for key, value in [('validator_before_sha256', '0' * 64), ('validator_after_sha256', '0' * 64),
                           ('authority_section_sha256', '0' * 64), ('seal_authorized', True)]:
            with self.subTest(key=key):
                changed = json.loads(original)
                changed[key] = value
                post.write_text(json.dumps(changed))
                self.reject()
        post.write_bytes(original)

    def test_partition_never_expands_holding_to_compaction_or_august(self):
        for compact in [False, True]:
            for august in [False, True]:
                with self.subTest(compact=compact, august=august):
                    result = self.v.derive_independent_partition(
                        self.cohort, {}, self.scan, self.aliases,
                        qna_close=True, compact_not_admitted=compact, august_reclassified=august)
                    self.assertEqual(result['quarantined_not_admitted'], self.members)


class PostAugustAdmissionTests(unittest.TestCase):
    """DL-077: families registered after August are accepted only through complete admission records."""

    POST = ['context.compaction.completed', 'browser.workspace.created', 'browser.workspace.reset']
    DECISION = {'context.compaction.completed': 'DL-040', 'browser.workspace.created': 'DL-046',
                'browser.workspace.reset': 'DL-046'}

    def setUp(self):
        spec = importlib.util.spec_from_file_location('post_august_validator', REPO / VALIDATOR)
        self.v = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.v)
        self.temp = tempfile.TemporaryDirectory(dir=os.environ.get('PM_TEST_EVIDENCE_DIR'))
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for rel in [Path('Plans/Decision_Log.md'), Path(self.v.HOLDING_RECEIPT), Path(self.v.POST_AUGUST_RECEIPT)]:
            dest = self.root / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(REPO / rel, dest)
        self.v.REPO = self.root
        self.v.ROOT = self.root / 'Plans'
        self.registry = self.v.load_json(REPO / 'Plans/event_family_registry.json')
        self.known37 = self.v.load_json(REPO / AUDIT / 'known37/KNOWN37_FROM_PLANS.json')['event_types']
        self.families = {f['event_type']: f for f in self.registry['families']}
        self.assessment_rel = 'reports/fixture-depth-assessment.json'
        self.assessment = {'rows': [{'event_type': et, 'family_id': self.families[et]['family_id'],
                                     'family_revision': self.families[et]['family_revision'],
                                     'cells': {c: {'status': 'PASS', 'evidence': [{'path': 'Plans/fixture.md'}]}
                                               for c in self.v.EVIDENCE_FIELDS}}
                                    for et in self.POST]}
        self.record_dir = self.root / self.v.POST_AUGUST_RECORD_DIR
        self.record_dir.mkdir(parents=True, exist_ok=True)
        self.write_assessment()
        for et in self.POST:
            self.write_record(self.record_for(et))

    def write_assessment(self):
        path = self.root / self.assessment_rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(self.assessment))

    def record_for(self, et):
        section = self.v.decision_section_bytes(self.root / 'Plans/Decision_Log.md', self.DECISION[et])
        n = self.POST.index(et)
        return {
            'schema_id': self.v.POST_AUGUST_RECORD_SCHEMA,
            'event_type': et,
            'family_id': self.families[et]['family_id'],
            'decision_ref': 'Plans/Decision_Log.md#' + self.DECISION[et],
            'decision_section_sha256': hashlib.sha256(section).hexdigest(),
            'registry_before': {'revision': 'r' + str(n), 'sha256': str(n) * 64, 'family_count': 39 + n},
            'registry_after': {'revision': 'r' + str(n + 1), 'sha256': str(n + 1) * 64, 'family_count': 40 + n},
            'registry_row_sha256': self.v.canonical_json_sha256(self.families[et]),
            'depth_assessment': {'path': self.assessment_rel,
                                 'sha256': self.v.sha256_file(self.root / self.assessment_rel)},
        }

    def write_record(self, record, name=None):
        (self.record_dir / ((name or record['event_type']) + '.json')).write_text(json.dumps(record))

    def check(self):
        return self.v.validate_post_august_admissions(self.registry, self.known37)

    def test_complete_records_admit_exactly_the_post_august_families(self):
        admitted, issues, receipt_sha = self.check()
        self.assertEqual(issues, [])
        self.assertEqual(admitted, set(self.POST))
        self.assertEqual(receipt_sha, self.v.sha256_file(self.root / self.v.POST_AUGUST_RECEIPT))

    def test_a_missing_record_fails_closed(self):
        (self.record_dir / 'browser.workspace.reset.json').unlink()
        admitted, issues, _ = self.check()
        self.assertNotIn('browser.workspace.reset', admitted)
        self.assertIn('browser.workspace.reset: no admission record', issues)

    def test_any_depth_criterion_not_passing_fails_closed(self):
        for status in ['PARTIAL', 'ABSENT', 'CONFLICT', None]:
            with self.subTest(status=status):
                self.assessment['rows'][0]['cells']['producer'] = {'status': status, 'evidence': [{'path': 'Plans/fixture.md'}]}
                self.write_assessment()
                for et in self.POST:
                    self.write_record(self.record_for(et))
                admitted, issues, _ = self.check()
                self.assertNotIn(self.POST[0], admitted)
                self.assertIn(self.POST[0] + ': depth_incomplete:producer', issues)

    def test_changed_inputs_fail_closed(self):
        et = self.POST[1]
        good = self.record_for(et)
        cases = {
            'schema_id': ('schema_id', 'forged'),
            'family_id': ('family_id', 'event-family-other'),
            'decision_ref': ('decision_ref', 'Plans/Decision_Log.md#DL-39'),
            'decision_section_sha256': ('decision_section_sha256', '0' * 64),
            'registry_row_sha256': ('registry_row_sha256', '0' * 64),
            'depth_assessment.sha256': ('depth_assessment', {'path': self.assessment_rel, 'sha256': '0' * 64}),
            'depth_assessment.path': ('depth_assessment', {'path': '../escape.json', 'sha256': '0' * 64}),
            'registry_before': ('registry_before', {'revision': '', 'sha256': 'x', 'family_count': '40'}),
        }
        for problem, (key, value) in cases.items():
            with self.subTest(problem=problem):
                changed = copy.deepcopy(good)
                changed[key] = value
                self.write_record(changed)
                admitted, issues, _ = self.check()
                self.assertNotIn(et, admitted)
                self.assertIn(et + ': ' + problem, issues)
        self.write_record(good)

    def test_registry_must_grow_by_exactly_one_family(self):
        et = self.POST[2]
        for count in [0, 2, -1]:
            with self.subTest(count=count):
                record = self.record_for(et)
                record['registry_after']['family_count'] = record['registry_before']['family_count'] + count
                self.write_record(record)
                admitted, issues, _ = self.check()
                self.assertNotIn(et, admitted)
                self.assertIn(et + ': registry_before_after_not_exactly_one_family', issues)

    def test_a_changed_registry_row_or_decision_entry_fails_closed(self):
        self.families[self.POST[0]]['family_revision'] = '9.9.9'
        admitted, issues, _ = self.check()
        self.assertIn(self.POST[0] + ': registry_row_sha256', issues)
        self.assertNotIn(self.POST[0], admitted)
        path = self.root / 'Plans/Decision_Log.md'
        path.write_bytes(path.read_bytes().replace(b'Keep the bounded, content-free completion EventRecord indefinitely',
                                                   b'Keep the bounded completion EventRecord indefinitely', 1))
        admitted, issues, _ = self.check()
        self.assertIn(self.POST[0] + ': decision_section_sha256', issues)

    def test_records_for_other_families_and_misnamed_files_are_rejected(self):
        record = self.record_for(self.POST[0])
        record['event_type'] = 'workspace.layout_changed'
        self.write_record(record)
        self.write_record(self.record_for(self.POST[1]), name='misnamed')
        admitted, issues, _ = self.check()
        self.assertIn('workspace.layout_changed: admission record for a family not registered beyond Known37 and August', issues)
        self.assertIn('misnamed.json: admission record name, event type or uniqueness mismatch', issues)
        self.assertEqual(admitted, set(self.POST))

    def test_an_unrecorded_new_registration_is_not_admitted(self):
        extra = copy.deepcopy(self.families[self.POST[0]])
        extra['event_type'] = 'example.future_family'
        extra['family_id'] = 'event-family-example-future-family'
        self.registry['families'].append(extra)
        admitted, issues, _ = self.check()
        self.assertNotIn('example.future_family', admitted)
        self.assertIn('example.future_family: no admission record', issues)

    def test_an_invalid_receipt_admits_nothing(self):
        post = self.root / self.v.POST_AUGUST_RECEIPT
        original = json.loads(post.read_text())
        for key, value in [('schema_id', 'forged'), ('authority_ref', 'Plans/Decision_Log.md#DL-039'),
                           ('authority_section_sha256', '0' * 64), ('validator_before_sha256', '0' * 64),
                           ('validator_after_sha256', '0' * 64), ('record_dir', 'reports/elsewhere'),
                           ('author_task', 'someone-else'), ('seal_applier_forbidden_task', 'someone-else'),
                           ('seal_authorized', True), ('admission_authorized', True),
                           ('contract_depth_complete', True)]:
            with self.subTest(key=key):
                changed = copy.deepcopy(original)
                changed[key] = value
                post.write_text(json.dumps(changed))
                admitted, issues, receipt_sha = self.check()
                self.assertEqual(admitted, set())
                self.assertIsNone(receipt_sha)
                self.assertTrue(issues and issues[0].startswith('post-August amendment receipt invalid'))
        post.unlink()
        admitted, issues, _ = self.check()
        self.assertEqual(admitted, set())

    def test_dl077_authority_text_is_pinned(self):
        path = self.root / 'Plans/Decision_Log.md'
        path.write_bytes(path.read_bytes().replace(b'complete admission record', b'admission record', 1))
        admitted, issues, _ = self.check()
        self.assertEqual(admitted, set())
        self.assertTrue(issues[0].startswith('post-August amendment receipt invalid'))

    def rewrite_records(self):
        self.write_assessment()
        for et in self.POST:
            self.write_record(self.record_for(et))

    def test_depth_row_must_grade_the_registered_family_revision(self):
        for key, value in [('family_revision', '9.9.9'), ('family_id', 'event-family-other')]:
            with self.subTest(key=key):
                self.setUp()
                self.assessment['rows'][2][key] = value
                self.rewrite_records()
                admitted, issues, _ = self.check()
                self.assertNotIn(self.POST[2], admitted)
                self.assertIn(self.POST[2] + ': depth_assessment.family_revision', issues)

    def test_a_pass_without_plans_evidence_fails_closed(self):
        for evidence in [None, [], [{'path': 'reports/x.md'}], 'Plans/x.md']:
            with self.subTest(evidence=evidence):
                self.setUp()
                self.assessment['rows'][0]['cells']['retention'] = {'status': 'PASS', 'evidence': evidence}
                self.rewrite_records()
                admitted, issues, _ = self.check()
                self.assertNotIn(self.POST[0], admitted)
                self.assertIn(self.POST[0] + ': depth_pass_without_plans_evidence:retention', issues)

    def test_decision_entry_must_name_the_family(self):
        et = self.POST[1]
        for number in ['DL-041', 'DL-040', 'DL-077']:
            with self.subTest(number=number):
                record = self.record_for(et)
                section = self.v.decision_section_bytes(self.root / 'Plans/Decision_Log.md', number)
                record['decision_ref'] = 'Plans/Decision_Log.md#' + number
                record['decision_section_sha256'] = hashlib.sha256(section).hexdigest()
                self.write_record(record)
                admitted, issues, _ = self.check()
                self.assertNotIn(et, admitted)
                self.assertIn(et + ': decision_ref_not_for_family', issues)


if __name__ == '__main__':
    unittest.main()
