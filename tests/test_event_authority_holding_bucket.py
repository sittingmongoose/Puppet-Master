"""Behavioral checks for DL-039's sole authorized holding-bucket validator repair."""
import contextlib
import copy
import io
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import tempfile
import subprocess
import sys
import unittest

REPO = Path(__file__).resolve().parents[1]
AUDIT = Path('Plans/.audits/event-authority-2026-08-12')
VALIDATOR = AUDIT / 'independent-validator/pm_event_authority_independent_validator.py'


# Later receipted changes (DL-451's fourth, E9-1's fifth). Their byte links sit between the live validator
# bytes and DL-412's frozen after-hash, so a fixture reaches the DL-412 link only through them, as a landed
# tree does. They are copied from the repository once, given a fixture lander, and anchored with DL-412.
LATER_LINKS = (Path('reports/event-authority-20261105/seal-check-recount-receipt.json'),
               Path('reports/event-authority-20261114/seal-check-dl-pattern-receipt.json'))
LATER_INPUTS = (Path('reports/event-authority-20261114/E9-1-card.json'),
                Path('reports/event-authority-20261114/E9-1-answer.json'))


def pin_dl412_fixture(root):
    """Synthetic trust anchors; receipt semantic mutations must refresh this copy.

    Deliberate anchor/forgery controls keep their baseline anchor unchanged.
    This helper never writes the repository's Spec Lock.
    """
    receipt = Path('reports/event-authority-20261104/seal-check-multifamily-step-receipt.json')
    for rel in LATER_INPUTS + LATER_LINKS:
        if (REPO / rel).exists() and not (root / rel).exists():
            raw = (REPO / rel).read_bytes()
            if rel in LATER_LINKS:
                doc = json.loads(raw)
                if not doc.get('lander_task'):
                    doc['lander_task'] = 'fixture:lander'
                    doc['seal_applier_forbidden_tasks'] = sorted({doc['author_task'], 'fixture:lander'})
                raw = (json.dumps(doc, indent=2) + '\n').encode()
            dest = root / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(raw)
    lock = root / 'Plans/Spec_Lock.json'
    lock.parent.mkdir(parents=True, exist_ok=True)
    lock.write_text(json.dumps({'canonical_ssot_hashes': {'files': [
        {'path': str(rel), 'sha256': hashlib.sha256((root / rel).read_bytes()).hexdigest()}
        for rel in (receipt,) + tuple(r for r in LATER_LINKS if (root / r).exists())
    ]}}, indent=2) + '\n')


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
                 Path(self.v.POST_AUGUST_RECEIPT), Path(self.v.MULTI_FAMILY_RECEIPT)]
        for rel in paths:
            dest = self.root / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(REPO / rel, dest)
        pin_dl412_fixture(self.root)
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

    def test_holding_requires_byte_links_but_not_dl412_semantics(self):
        third = self.root / self.v.MULTI_FAMILY_RECEIPT
        original = third.read_bytes()
        self.assertEqual(self.check()[2], [])
        third.unlink()
        self.assertEqual(self.check()[2], ['holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch'])
        third.write_bytes(original)
        pin_dl412_fixture(self.root)
        for key, value in [('validator_before_sha256', '0' * 64), ('validator_after_sha256', '0' * 64),
                           ('authority_section_sha256', '0' * 64), ('lander_task', None),
                           ('prior_receipt', {'path': self.v.POST_AUGUST_RECEIPT, 'sha256': '0' * 64}),
                           ('seal_authorized', True)]:
            with self.subTest(key=key):
                changed = json.loads(original)
                changed[key] = value
                third.write_text(json.dumps(changed))
                pin_dl412_fixture(self.root)
                expected = ['holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch'] if key in ['validator_before_sha256', 'validator_after_sha256'] else []
                self.assertEqual(self.check()[2], expected)
        third.write_bytes(original)
        pin_dl412_fixture(self.root)
        self.assertEqual(self.check()[2], [])

    def test_partition_never_expands_holding_to_compaction_or_august(self):
        for compact in [False, True]:
            for august in [False, True]:
                with self.subTest(compact=compact, august=august):
                    result = self.v.derive_independent_partition(
                        self.cohort, {}, self.scan, self.aliases,
                        qna_close=True, compact_not_admitted=compact, august_reclassified=august)
                    self.assertEqual(result['quarantined_not_admitted'], self.members)


def admitted_coordination_decisions(repo=REPO):
    """Decision entries of the coordination families the ledger marks admitted (Step 9 batch 2).

    Each such family's own landing writes its DL-077 admission record; the decision number is read
    from that record, so a landing adds no test data here. A missing record fails closed.
    """
    ledger = json.loads((repo / 'Plans/coordination_event_admission.json').read_text(encoding='utf-8'))
    decisions = {}
    for row in ledger['rows']:
        if row['admission_status'] == 'admitted_static_contract':
            record_path = repo / 'reports/event-authority-20260911/admission-records' / (row['event_type'] + '.json')
            decisions[row['event_type']] = json.loads(record_path.read_text(encoding='utf-8'))['decision_ref'].split('#', 1)[1]
    return decisions


class PostAugustAdmissionTests(unittest.TestCase):
    """DL-077: families registered after August are accepted only through complete admission records."""

    COORDINATION = admitted_coordination_decisions()
    # DL-300's three families, registered in one step (43 to 46 families): a DL-412 multi-family step.
    STEP = ['approval.chat_tool_requested', 'approval.chat_tool_resolved', 'settings.layer.changed']
    POST = ['context.compaction.completed', 'browser.workspace.created', 'browser.workspace.reset', *COORDINATION]
    RECORDED = [*POST, *STEP]
    DECISION = {'context.compaction.completed': 'DL-040', 'browser.workspace.created': 'DL-046',
                'browser.workspace.reset': 'DL-046', **COORDINATION, **{et: 'DL-999' for et in STEP}}
    STEP_BEFORE = {'revision': 's0', 'sha256': 'a' * 64, 'family_count': 43}
    STEP_AFTER = {'revision': 's1', 'sha256': 'b' * 64, 'family_count': 46}
    FIXTURE_DECISION = (b'### DL-999: Fixture only - a decision entry for the multi-family step\n\n'
                        b'Names approval.chat_tool_requested, approval.chat_tool_resolved and settings.layer.changed.\n\n')

    def setUp(self):
        spec = importlib.util.spec_from_file_location('post_august_validator', REPO / VALIDATOR)
        self.v = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.v)
        self.temp = tempfile.TemporaryDirectory(dir=os.environ.get('PM_TEST_EVIDENCE_DIR'))
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for rel in [Path('Plans/Decision_Log.md'), Path(self.v.HOLDING_RECEIPT), Path(self.v.POST_AUGUST_RECEIPT),
                    Path(self.v.MULTI_FAMILY_RECEIPT)]:
            dest = self.root / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(REPO / rel, dest)
        pin_dl412_fixture(self.root)
        log = self.root / 'Plans/Decision_Log.md'
        log.write_bytes(log.read_bytes().replace(b'## Owner / Consumer Map', self.FIXTURE_DECISION + b'## Owner / Consumer Map', 1))
        self.v.REPO = self.root
        self.v.ROOT = self.root / 'Plans'
        self.registry = self.v.load_json(REPO / 'Plans/event_family_registry.json')
        self.known37 = self.v.load_json(REPO / AUDIT / 'known37/KNOWN37_FROM_PLANS.json')['event_types']
        # The fixture's own closed world: Known37, the August pair and the families it records here. Families a
        # later admission merge registers keep their real records in the repository, not in this fixture.
        closed = set(self.known37) | set(self.v.AUGUST) | set(self.RECORDED)
        self.registry = dict(self.registry, families=[f for f in self.registry['families'] if f['event_type'] in closed])
        self.families = {f['event_type']: f for f in self.registry['families']}
        self.assessment_rel = 'reports/fixture-depth-assessment.json'
        self.assessment = {'rows': [{'event_type': et, 'family_id': self.families[et]['family_id'],
                                     'family_revision': self.families[et]['family_revision'],
                                     'cells': {c: {'status': 'PASS', 'evidence': [{'path': 'Plans/fixture.md'}]}
                                               for c in self.v.EVIDENCE_FIELDS}}
                                    for et in self.RECORDED]}
        self.record_dir = self.root / self.v.POST_AUGUST_RECORD_DIR
        self.record_dir.mkdir(parents=True, exist_ok=True)
        self.write_assessment()
        for et in self.RECORDED:
            self.write_record(self.record_for(et))

    def write_assessment(self):
        path = self.root / self.assessment_rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(self.assessment))

    def record_for(self, et):
        section = self.v.decision_section_bytes(self.root / 'Plans/Decision_Log.md', self.DECISION[et])
        n = self.RECORDED.index(et)
        record = {
            'schema_id': self.v.POST_AUGUST_RECORD_SCHEMA,
            'event_type': et,
            'family_id': self.families[et]['family_id'],
            'implementation_receipt_sha256': self.v.sha256_file(self.root / self.v.POST_AUGUST_RECEIPT),
            'decision_ref': 'Plans/Decision_Log.md#' + self.DECISION[et],
            'decision_section_sha256': hashlib.sha256(section).hexdigest(),
            'registry_before': {'revision': 'r' + str(n), 'sha256': f'{n:064x}', 'family_count': 39 + n},
            'registry_after': {'revision': 'r' + str(n + 1), 'sha256': f'{n + 1:064x}', 'family_count': 40 + n},
            'registry_row_sha256': self.v.canonical_json_sha256(self.families[et]),
            'depth_assessment': {'path': self.assessment_rel,
                                 'sha256': self.v.sha256_file(self.root / self.assessment_rel)},
        }
        if et in self.STEP:
            record.update({
                'implementation_receipt_sha256': self.v.sha256_file(self.root / self.v.MULTI_FAMILY_RECEIPT),
                'registry_before': copy.deepcopy(self.STEP_BEFORE),
                'registry_after': copy.deepcopy(self.STEP_AFTER),
                'registry_step_event_types': list(self.STEP),
            })
        return record

    def write_record(self, record, name=None):
        (self.record_dir / ((name or record['event_type']) + '.json')).write_text(json.dumps(record))

    def check(self):
        return self.v.validate_post_august_admissions(self.registry, self.known37)

    def test_complete_records_admit_exactly_the_post_august_families(self):
        admitted, issues, receipt_sha = self.check()
        self.assertEqual(issues, [])
        self.assertEqual(admitted, set(self.RECORDED))
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
                for et in self.RECORDED:
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
        self.assertEqual(admitted, set(self.RECORDED))

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
        for et in self.RECORDED:
            self.write_record(self.record_for(et))

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

    def test_registry_sides_must_differ_and_assessment_rows_must_be_exact(self):
        et = self.POST[0]
        record = self.record_for(et)
        record['registry_after']['sha256'] = record['registry_before']['sha256']
        self.write_record(record)
        admitted, issues, _ = self.check()
        self.assertIn(et + ': registry_before_after_not_exactly_one_family', issues)
        self.write_record(self.record_for(et))
        for mutate, problem in [(lambda rows: rows.append(copy.deepcopy(rows[0])), 'depth_assessment.row'),
                                (lambda rows: rows[0]['cells'].pop('retention'), 'depth_assessment.criteria'),
                                (lambda rows: rows[0]['cells'].update(extra={'status': 'PASS'}), 'depth_assessment.criteria')]:
            with self.subTest(problem=problem):
                self.setUp()
                mutate(self.assessment['rows'])
                self.rewrite_records()
                admitted, issues, _ = self.check()
                self.assertNotIn(et, admitted)
                self.assertIn(et + ': ' + problem, issues)

    def test_a_record_pins_the_receipt_it_was_written_under(self):
        et = self.POST[0]
        record = self.record_for(et)
        record['implementation_receipt_sha256'] = '0' * 64
        self.write_record(record)
        admitted, issues, _ = self.check()
        self.assertNotIn(et, admitted)
        self.assertIn(et + ': implementation_receipt_sha256', issues)
        self.write_record(self.record_for(et))
        post = self.root / self.v.POST_AUGUST_RECEIPT
        changed = json.loads(post.read_text())
        changed['notes'] = changed.get('notes', []) + ['a later edit']
        post.write_text(json.dumps(changed))
        admitted, issues, _ = self.check()
        self.assertEqual(admitted, set())

    def test_record_file_name_must_equal_its_event_type(self):
        (self.record_dir / 'browser.workspace.reset.json').unlink()
        self.write_record(self.record_for('browser.workspace.reset'), name='browser.workspace.reset.copy')
        admitted, issues, _ = self.check()
        self.assertNotIn('browser.workspace.reset', admitted)
        self.assertIn('browser.workspace.reset.copy.json: admission record name, event type or uniqueness mismatch', issues)

    def test_receipt_lander_and_record_schema_are_pinned(self):
        post = self.root / self.v.POST_AUGUST_RECEIPT
        original = json.loads(post.read_text())
        for key in ['lander_task', 'record_schema_id']:
            with self.subTest(key=key):
                changed = copy.deepcopy(original)
                changed[key] = 'someone-else'
                post.write_text(json.dumps(changed))
                admitted, issues, receipt_sha = self.check()
                self.assertEqual(admitted, set())
                self.assertIsNone(receipt_sha)
        post.write_text(json.dumps(original))

    def run_main(self):
        self.v.RECEIPT_DIR = self.root / 'validator-receipts'
        (self.root / 'Plans/event_family_registry.json').write_text(json.dumps(self.registry))
        with contextlib.redirect_stdout(io.StringIO()):
            self.v.main()
        receipt = json.loads((self.v.RECEIPT_DIR / 'event_authority_validator_receipt.json').read_text())
        return {f['error']: f for f in receipt['failures']}, receipt['named_checks']

    def test_main_admits_complete_records_and_keeps_every_other_rule(self):
        failures, named = self.run_main()
        self.assertEqual(named['post_august_admitted'], sorted(self.RECORDED))
        self.assertNotIn('post_august_admission_incomplete', failures)
        self.assertNotIn('unexpected_august_set', failures)
        gap = failures.get('individual_dispositions_evidence_gap_blocking', {}).get('sample', [])
        depth = [r['event_type'] for r in failures.get('registered_contract_depth_incomplete', {}).get('sample', [])]
        for et in self.RECORDED:
            self.assertNotIn(et, gap)
            self.assertNotIn(et, depth)

    def test_main_fails_closed_without_a_complete_record(self):
        self.assessment['rows'][0]['cells']['positive_negative_oracles'] = {'status': 'PARTIAL', 'evidence': []}
        self.rewrite_records()
        failures, named = self.run_main()
        self.assertNotIn(self.POST[0], named['post_august_admitted'])
        self.assertIn('post_august_admission_incomplete', failures)
        self.assertIn(self.POST[0], failures['unexpected_august_set']['august'])
        self.assertIn(self.POST[0], failures['individual_dispositions_evidence_gap_blocking']['sample'])
        self.assertIn('post_august_admission_incomplete', named['seal_prerequisites_blocking_errors'])
        self.assertFalse(named['post_august_admission_records_ok'])

    def test_main_reports_a_stray_record(self):
        stray = self.record_for(self.POST[1])
        stray['event_type'] = 'workspace.layout_changed'
        self.write_record(stray)
        failures, _ = self.run_main()
        self.assertIn('workspace.layout_changed: admission record for a family not registered beyond Known37 and August',
                      failures['post_august_admission_incomplete']['issues'])


class MultiFamilyStepTests(unittest.TestCase):
    """DL-412: a record may describe a truthful registry step that added several families at once.

    Every family of the step still needs its own complete record naming the same step; a
    partial, mismatched or incomplete step admits none of its families; any other record file
    naming the step's before and after SHA-256, however malformed otherwise, fails the step; a
    record without registry_step_event_types is judged exactly as DL-077 judges it.
    """

    OTHER = 'browser.workspace.reset'
    NO_FIELD = object()

    STEP = PostAugustAdmissionTests.STEP
    POST = PostAugustAdmissionTests.POST
    RECORDED = PostAugustAdmissionTests.RECORDED
    DECISION = PostAugustAdmissionTests.DECISION
    STEP_BEFORE = PostAugustAdmissionTests.STEP_BEFORE
    STEP_AFTER = PostAugustAdmissionTests.STEP_AFTER
    FIXTURE_DECISION = PostAugustAdmissionTests.FIXTURE_DECISION
    setUp = PostAugustAdmissionTests.setUp
    write_assessment = PostAugustAdmissionTests.write_assessment
    record_for = PostAugustAdmissionTests.record_for
    write_record = PostAugustAdmissionTests.write_record
    check = PostAugustAdmissionTests.check
    rewrite_records = PostAugustAdmissionTests.rewrite_records
    run_main = PostAugustAdmissionTests.run_main

    def step_fails(self, *expected):
        """No family of the step is admitted, every other family still is, and each expected issue is reported."""
        admitted, issues, _ = self.check()
        self.assertEqual(admitted, set(self.POST))
        for issue in expected:
            def normal(value):
                if 'registry_step_partial:' not in value:
                    return value
                start, names = value.split('registry_step_partial:', 1)
                return start + 'registry_step_partial:' + ','.join(sorted({n.removesuffix('.json') for n in names.split(',')}))
            self.assertIn(normal(issue), [normal(i) for i in issues])
        return issues

    def write_step(self, mutate):
        for et in self.STEP:
            record = self.record_for(et)
            mutate(et, record)
            self.write_record(record)

    def test_a_complete_step_admits_each_of_its_families(self):
        admitted, issues, receipt_sha = self.check()
        self.assertEqual(issues, [])
        self.assertEqual(admitted, set(self.RECORDED))
        self.assertEqual(receipt_sha, self.v.sha256_file(self.root / self.v.POST_AUGUST_RECEIPT))

    def test_the_same_step_in_one_family_form_still_fails_the_one_family_rule(self):
        def one_family(et, record):
            del record['registry_step_event_types']
            record['implementation_receipt_sha256'] = self.v.sha256_file(self.root / self.v.POST_AUGUST_RECEIPT)
        self.write_step(one_family)
        issues = self.step_fails()
        self.assertEqual([i for i in issues if i.split(':', 1)[0] in self.STEP],
                         [et + ': registry_before_after_not_exactly_one_family' for et in self.STEP])

    def test_a_family_of_the_step_without_its_own_record_fails_the_whole_step(self):
        for missing in self.STEP:
            with self.subTest(missing=missing):
                self.rewrite_records()
                (self.record_dir / (missing + '.json')).unlink()
                self.step_fails(missing + ': no admission record',
                                *[et + ': registry_step_partial:' + missing for et in self.STEP if et != missing])

    def test_every_record_must_name_the_same_before_and_after_states(self):
        for side, key, value in [('registry_before', 'revision', 's0-other'), ('registry_before', 'sha256', 'c' * 64),
                                 ('registry_after', 'revision', 's1-other'), ('registry_after', 'sha256', 'c' * 64)]:
            with self.subTest(side=side, key=key):
                self.rewrite_records()
                record = self.record_for(self.STEP[2])
                record[side][key] = value
                self.write_record(record)
                issues = self.step_fails(self.STEP[0] + ': registry_step_partial:' + self.STEP[2])
                self.assertTrue(any(i.startswith(self.STEP[2] + ': registry_step_partial:') for i in issues))

    def test_every_record_must_carry_the_same_list(self):
        record = self.record_for(self.STEP[0])
        record['registry_step_event_types'] = self.STEP[:2]
        record['registry_after']['family_count'] = 45
        self.write_record(record)
        self.step_fails(self.STEP[2] + ': registry_step_partial:' + self.STEP[0],
                        self.STEP[0] + ': registry_step_partial:' + self.STEP[1] + ',' + self.STEP[2])

    def test_the_step_must_add_exactly_its_listed_families(self):
        for count, same_sha in [(45, False), (47, False), (43, False), (46, True)]:
            with self.subTest(count=count, same_sha=same_sha):
                def change(et, record):
                    record['registry_after']['family_count'] = count
                    if same_sha:
                        record['registry_after']['sha256'] = record['registry_before']['sha256']
                self.write_step(change)
                self.step_fails(*[et + ': registry_before_after_not_exactly_step_families' for et in self.STEP])
        self.rewrite_records()
        self.assertEqual(self.check()[1], [])

    def test_a_listed_family_outside_the_registered_post_august_set_fails_the_step(self):
        for extra in ['example.unregistered_family', self.known37[0], 'workspace.layout_changed']:
            with self.subTest(extra=extra):
                def widen(et, record):
                    record['registry_step_event_types'] = sorted(self.STEP + [extra])
                    record['registry_after']['family_count'] = 47
                self.write_step(widen)
                self.step_fails(*[et + ': registry_step_partial:' + extra for et in self.STEP])

    def claimant(self, mutate=None, step=NO_FIELD):
        """OTHER's otherwise complete record, naming the step's before and after SHA-256.

        One-family form (43 to 44) unless step is given; then the step form, pinning the DL-412 receipt.
        """
        record = self.record_for(self.OTHER)
        record['registry_before'] = dict(self.STEP_BEFORE)
        record['registry_after'] = dict(self.STEP_AFTER, family_count=44)
        if step is not self.NO_FIELD:
            record['registry_step_event_types'] = step
            record['implementation_receipt_sha256'] = self.v.sha256_file(self.root / self.v.MULTI_FAMILY_RECEIPT)
            record['registry_after']['family_count'] = 43 + (len(step) if isinstance(step, list) else 2)
        if mutate:
            mutate(record)
        return record

    def test_a_one_family_record_naming_the_step_fails_the_step_and_keeps_its_own_judgment(self):
        self.write_record(self.claimant())
        admitted, issues, _ = self.check()
        self.assertEqual(admitted, set(self.POST))
        self.assertEqual([i for i in issues if i.startswith(self.OTHER + ':')], [])
        for et in self.STEP:
            self.assertIn(et + ': registry_step_partial:' + self.OTHER + '.json', issues)

    def test_a_malformed_record_naming_the_step_still_fails_the_step(self):
        """CA-SEAL-01: the SHA-256 pair is read on its own, so no unrelated defect hides a claimant."""
        def drop(side, key):
            return lambda r: r[side].pop(key)

        def put(side, key, value):
            return lambda r: r[side].__setitem__(key, value)
        upper = lambda r: r['registry_after'].update(sha256=r['registry_after']['sha256'].upper())
        newline = lambda r: r['registry_before'].update(sha256=r['registry_before']['sha256'] + '\n')
        pair = ['browser.workspace.created', self.OTHER]
        cases = [
            ('no before revision', self.NO_FIELD, drop('registry_before', 'revision'), 'registry_before'),
            ('empty after revision', self.NO_FIELD, put('registry_after', 'revision', ''), 'registry_after'),
            ('numeric before revision', self.NO_FIELD, put('registry_before', 'revision', 7), 'registry_before'),
            ('string count', self.NO_FIELD, put('registry_after', 'family_count', '44'), 'registry_after'),
            ('null count', self.NO_FIELD, put('registry_after', 'family_count', None), 'registry_after'),
            ('boolean count', self.NO_FIELD, put('registry_before', 'family_count', True), 'registry_before'),
            ('no before count', self.NO_FIELD, drop('registry_before', 'family_count'), 'registry_before'),
            ('three more families', self.NO_FIELD, put('registry_after', 'family_count', 46),
             'registry_before_after_not_exactly_one_family'),
            ('upper-case sha256', self.NO_FIELD, upper, 'registry_after'),
            ('sha256 with trailing LF', self.NO_FIELD, newline, 'registry_before'),
            ('forged schema', self.NO_FIELD, lambda r: r.update(schema_id='forged'), 'schema_id'),
            ('step form, no before revision', pair, drop('registry_before', 'revision'), 'registry_before'),
            ('step form, string count', pair, put('registry_after', 'family_count', '45'), 'registry_after'),
            ('step form, null count', pair, put('registry_after', 'family_count', None), 'registry_after'),
            ('step form, upper-case sha256', pair, upper, 'registry_after'),
            ('step form, its own other step', pair, None, 'registry_step_partial:'),
            ('step form, null list', None, None, 'registry_step_event_types'),
            ('step form, empty list', [], None, 'registry_step_event_types'),
            ('step form, single list', [self.OTHER], None, 'registry_step_event_types'),
            ('step form, unsorted list', list(reversed(pair)), None, 'registry_step_event_types'),
            ('step form, list without its own family', ['browser.workspace.created', 'example.other'], None,
             'registry_step_event_types'),
            ('step form, string list', 'x', None, 'registry_step_event_types'),
            ('step form, the step\'s own list', list(self.STEP), None, 'registry_step_event_types'),
            ('step form, bad list and no revision', None, drop('registry_after', 'revision'), 'registry_after'),
        ]
        for label, step, mutate, own in cases:
            with self.subTest(case=label):
                self.setUp()
                self.write_record(self.claimant(mutate, step))
                admitted, issues, _ = self.check()
                self.assertEqual(admitted, set(self.POST) - {self.OTHER})
                self.assertTrue(any(i.startswith(self.OTHER + ': ' + own) for i in issues), (own, issues))
                for et in self.STEP:
                    self.assertIn(et + ': registry_step_partial:' + self.OTHER + '.json', issues)
                    self.assertFalse(any(i.startswith(et + ': ') and 'registry_step_partial:' not in i
                                         for i in issues))

    def test_any_other_record_file_naming_the_step_fails_the_step(self):
        """CA-SEAL-01: a file rejected for its name or event type still names the pair, under its file name."""
        known = self.known37[0]
        reject = ': admission record name, event type or uniqueness mismatch'
        cases = [
            ('misnamed copy', 'browser.workspace.reset.copy', self.claimant(), 'browser.workspace.reset.copy.json',
             'browser.workspace.reset.copy.json' + reject),
            ('no event type', 'no-event-type', self.claimant(lambda r: r.pop('event_type')), 'no-event-type.json',
             'no-event-type.json' + reject),
            ('second record of a member', 'member-copy', self.record_for(self.STEP[0]), 'member-copy.json',
             'member-copy.json' + reject),
            ('malformed misnamed copy', 'malformed-copy',
             self.claimant(lambda r: (r['registry_before'].pop('revision'), r.pop('event_type'))),
             'malformed-copy.json', 'malformed-copy.json' + reject),
            ('a Known37 family', known, self.claimant(lambda r: r.update(event_type=known)), known,
             known + ': admission record for a family not registered beyond Known37 and August'),
        ]
        for label, name, record, claim, own in cases:
            with self.subTest(case=label):
                self.setUp()
                self.write_record(record, name=name)
                admitted, issues, _ = self.check()
                self.assertEqual(admitted, set(self.POST))
                self.assertIn(own, issues)
                for et in self.STEP:
                    self.assertIn(et + ': registry_step_partial:' + (claim if claim.endswith('.json') else claim + '.json'), issues)

    def numeric_step(self, member_types):
        """Symbolic 7/8 hashes isolate these probes from every pre-existing fixture pair."""
        kinds = (str, int)
        for index, et in enumerate(self.STEP):
            record = self.record_for(et)
            types = member_types[index] if isinstance(member_types, list) else member_types
            for side, digit, kind in zip(('registry_before', 'registry_after'), ('7', '8'), types):
                record[side]['sha256'] = kinds[kind](digit * 64)
            self.write_record(record)

    def test_only_canonical_string_members_describe_a_step(self):
        for types in [(0, 0), (0, 1), (1, 0), (1, 1), [(0, 0), (1, 1), (0, 1)]]:
            with self.subTest(types=types):
                self.setUp()
                self.numeric_step(types)
                admitted, issues, _ = self.check()
                canonical = types == (0, 0)
                self.assertEqual(set(self.STEP) & admitted, set(self.STEP) if canonical else set())
                failures, named = self.run_main()
                self.assertEqual(set(self.STEP) & set(named['post_august_admitted']), set(self.STEP) if canonical else set())

    def test_numeric_foreign_claims_fail_every_step_member_even_in_rejected_files(self):
        """AS-01: all 16 before/after type combinations, through admission and main()."""
        for member_types in [(0, 0)]:
            for claim_types in [(0, 0), (0, 1), (1, 0), (1, 1)]:
                for disposition in ['valid', 'misnamed', 'no event type', 'numeric event type', 'Known37']:
                    with self.subTest(members=member_types, claim=claim_types, file=disposition):
                        self.setUp()
                        self.numeric_step(member_types)
                        record = self.record_for(self.OTHER)
                        for side, digit, kind in zip(('registry_before', 'registry_after'), ('7', '8'), claim_types):
                            record[side]['sha256'] = (str, int)[kind](digit * 64)
                        name, claim = None, self.OTHER
                        expected = set(self.POST)
                        if disposition != 'valid':
                            name = 'numeric-claim'
                            claim = name + '.json'
                        if disposition == 'no event type':
                            record.pop('event_type')
                        elif disposition == 'numeric event type':
                            record['event_type'] = 7
                        elif disposition == 'Known37':
                            name = claim = self.known37[0]
                            record['event_type'] = name
                        if disposition == 'valid':
                            # Prove the legacy claimant's own result is unchanged by the step.
                            self.assertEqual(self.v.admission_record_problems(record, self.families[self.OTHER]), [])
                        self.write_record(record, name=name)
                        admitted, issues, _ = self.check()
                        self.assertEqual(admitted, expected)
                        for et in self.STEP:
                            self.assertIn(et + ': registry_step_partial:' + (claim if claim.endswith('.json') else claim + '.json'), issues)
                        failures, named = self.run_main()
                        self.assertFalse(set(named['post_august_admitted']) & set(self.STEP))
                        self.assertIn('post_august_admission_incomplete', failures)
                        for et in self.STEP:
                            self.assertIn(et + ': registry_step_partial:' + (claim if claim.endswith('.json') else claim + '.json'),
                                          failures['post_august_admission_incomplete']['issues'])

    def test_noncanonical_equal_hashes_are_refused(self):
        for before_kind, after_kind in [(str, int), (int, str), (int, int)]:
            with self.subTest(before=before_kind.__name__, after=after_kind.__name__):
                self.setUp()
                self.write_step(lambda et,r: (r['registry_before'].update(sha256=before_kind('7'*64)), r['registry_after'].update(sha256=after_kind('7'*64))))
                self.step_fails()

    def test_step_records_never_change_a_record_without_the_field(self):
        """CA-SEAL-02 boundary: every family outside the step gets exactly what it gets with no step record."""
        variants = [('complete', None), ('no before revision', lambda r: r['registry_before'].pop('revision')),
                    ('string count', lambda r: r['registry_after'].update(family_count='44')),
                    ('three more families', lambda r: r['registry_after'].update(family_count=46)),
                    ('forged schema', lambda r: r.update(schema_id='forged'))]
        for label, mutate in variants:
            with self.subTest(case=label):
                self.setUp()
                self.write_record(self.claimant(mutate))

                def outside_the_step():
                    admitted, issues, _ = self.check()
                    return admitted - set(self.STEP), [i for i in issues if i.split(':', 1)[0] not in self.STEP]
                with_step = outside_the_step()
                for et in self.STEP:
                    (self.record_dir / (et + '.json')).unlink()
                self.assertEqual(with_step, outside_the_step())

    def test_a_record_without_the_field_keeps_the_dl077_decision_rule(self):
        """CA-SEAL-02: DL-412 is barred only for records listing a step; DL-077's tuple is unchanged.

        Differential: on the legacy path DL-412 is an ordinary decision entry, judged exactly like
        DL-998, a fixture entry with the same body; on the step path it is barred.
        """
        legacy, member = self.OTHER, self.STEP[0]
        log = self.root / 'Plans/Decision_Log.md'
        raw = log.read_bytes()
        names = b'\nFixture: names ' + legacy.encode() + b' and ' + member.encode() + b'.\n'
        for number in (b'DL-412', b'DL-078'):
            at = raw.index(b'\n', raw.index(b'### ' + number + b':')) + 1
            raw = raw[:at] + names + raw[at:]
        log.write_bytes(raw)
        twin = b'### DL-998:' + self.v.decision_section_bytes(log, 'DL-412')[len(b'### DL-412:'):]
        log.write_bytes(raw.replace(b'## Owner / Consumer Map', twin + b'## Owner / Consumer Map', 1))
        section = self.v.decision_section_bytes(log, 'DL-412', self.v.MULTI_FAMILY_REQUIRED)
        third = self.root / self.v.MULTI_FAMILY_RECEIPT
        receipt = json.loads(third.read_text())
        receipt['authority_section_sha256'] = hashlib.sha256(section).hexdigest()
        third.write_text(json.dumps(receipt))
        pin_dl412_fixture(self.root)
        self.rewrite_records()
        self.assertEqual(self.check()[1], [])

        def cite(et, number):
            record = self.record_for(et)
            entry = self.v.decision_section_bytes(log, number)
            record['decision_ref'] = 'Plans/Decision_Log.md#' + number
            record['decision_section_sha256'] = hashlib.sha256(entry).hexdigest()
            return record

        def judged(record):
            return self.v.admission_record_problems(record, self.families[record['event_type']])
        self.assertEqual(judged(cite(legacy, 'DL-412')), judged(cite(legacy, 'DL-998')))
        self.assertEqual(judged(cite(legacy, 'DL-412')), [])
        self.assertEqual(judged(cite(member, 'DL-998')), [])
        self.assertEqual(judged(cite(member, 'DL-412')), ['decision_ref_not_for_family'])
        for et in (legacy, member):
            with self.subTest(et=et, number='DL-078'):
                self.assertEqual(judged(cite(et, 'DL-078')), ['decision_ref_not_for_family'])
        self.rewrite_records()
        self.write_record(cite(legacy, 'DL-412'))
        admitted, issues, _ = self.check()
        self.assertEqual(issues, [])
        self.assertEqual(admitted, set(self.RECORDED))
        self.rewrite_records()
        self.write_record(cite(member, 'DL-412'))
        self.step_fails(member + ': decision_ref_not_for_family',
                        *[et + ': registry_step_member_incomplete:' + member for et in self.STEP if et != member])
        self.rewrite_records()
        self.write_record(cite(legacy, 'DL-078'))
        admitted, issues, _ = self.check()
        self.assertEqual(issues, [legacy + ': decision_ref_not_for_family'])

    def test_the_list_is_exact(self):
        et = self.STEP[0]
        for bad in [None, 'x', [], [et], list(reversed(self.STEP)), self.STEP + [et], [1, 2, 3],
                    sorted(self.STEP[1:] + ['example.other'])]:
            with self.subTest(bad=bad):
                record = self.record_for(et)
                record['registry_step_event_types'] = bad
                self.write_record(record)
                self.step_fails(et + ': registry_step_event_types',
                                *[o + ': registry_step_partial:' + et for o in self.STEP if o != et])

    def test_each_family_still_needs_its_own_twelve_of_twelve(self):
        target = self.STEP[1]
        index = self.RECORDED.index(target)
        for criterion, cell, problem in [
                ('producer', {'status': 'PARTIAL', 'evidence': [{'path': 'Plans/fixture.md'}]}, 'depth_incomplete:producer'),
                ('positive_negative_oracles', {'status': 'ABSENT', 'evidence': []}, 'depth_incomplete:positive_negative_oracles'),
                ('retention', {'status': 'PASS', 'evidence': [{'path': 'reports/x.md'}]}, 'depth_pass_without_plans_evidence:retention')]:
            with self.subTest(criterion=criterion):
                self.setUp()
                self.assessment['rows'][index]['cells'][criterion] = cell
                self.rewrite_records()
                self.step_fails(target + ': ' + problem,
                                *[et + ': registry_step_member_incomplete:' + target for et in self.STEP if et != target])

    def test_each_family_still_needs_its_own_decision_entry_and_live_row(self):
        target = self.STEP[0]
        record = self.record_for(target)
        section = self.v.decision_section_bytes(self.root / 'Plans/Decision_Log.md', 'DL-040')
        record['decision_ref'] = 'Plans/Decision_Log.md#DL-040'
        record['decision_section_sha256'] = hashlib.sha256(section).hexdigest()
        self.write_record(record)
        self.step_fails(target + ': decision_ref_not_for_family',
                        *[et + ': registry_step_member_incomplete:' + target for et in self.STEP if et != target])
        self.rewrite_records()
        self.families[target]['family_revision'] = '9.9.9'
        self.step_fails(target + ': registry_row_sha256')

    def test_dl412_is_not_a_family_decision_entry(self):
        target = self.STEP[0]
        log = self.root / 'Plans/Decision_Log.md'
        raw = log.read_bytes()
        at = raw.index(b'\n', raw.index(b'### DL-412:')) + 1
        log.write_bytes(raw[:at] + b'\nFixture: names ' + target.encode() + b'.\n' + raw[at:])
        section = self.v.decision_section_bytes(log, 'DL-412', self.v.MULTI_FAMILY_REQUIRED)
        third = self.root / self.v.MULTI_FAMILY_RECEIPT
        receipt = json.loads(third.read_text())
        receipt['authority_section_sha256'] = hashlib.sha256(section).hexdigest()
        third.write_text(json.dumps(receipt))
        pin_dl412_fixture(self.root)
        self.rewrite_records()
        self.assertEqual(self.check()[1], [])
        record = self.record_for(target)
        record['decision_ref'] = 'Plans/Decision_Log.md#DL-412'
        record['decision_section_sha256'] = hashlib.sha256(section).hexdigest()
        self.write_record(record)
        self.step_fails(target + ': decision_ref_not_for_family')

    def test_a_step_record_pins_the_dl412_receipt(self):
        target = self.STEP[2]
        record = self.record_for(target)
        record['implementation_receipt_sha256'] = self.v.sha256_file(self.root / self.v.POST_AUGUST_RECEIPT)
        self.write_record(record)
        self.step_fails(target + ': implementation_receipt_sha256')
        self.rewrite_records()
        third = self.root / self.v.MULTI_FAMILY_RECEIPT
        changed = json.loads(third.read_text())
        changed['notes'] = changed.get('notes', []) + ['a later edit']
        third.write_text(json.dumps(changed))
        pin_dl412_fixture(self.root)
        issues = self.step_fails(*[et + ': implementation_receipt_sha256' for et in self.STEP])
        self.assertFalse(any(i.split(':', 1)[0] not in self.STEP for i in issues))

    def test_an_invalid_dl412_receipt_admits_nothing(self):
        third = self.root / self.v.MULTI_FAMILY_RECEIPT
        original = json.loads(third.read_text())
        dl077 = self.v.POST_AUGUST_RECEIPT
        for key, value in [('schema_id', 'forged'), ('authority_ref', 'Plans/Decision_Log.md#DL-077'),
                           ('authority_section_sha256', '0' * 64), ('validator_before_sha256', '0' * 64),
                           ('validator_after_sha256', '0' * 64), ('record_dir', 'reports/elsewhere'),
                           ('record_schema_id', 'forged'), ('author_task', 'someone-else'),
                           ('lander_task', None), ('lander_task', ' '),
                           ('seal_applier_forbidden_tasks', [self.v.MULTI_FAMILY_AUTHOR]),
                           ('prior_receipt', None), ('prior_receipt', {'path': dl077, 'sha256': '0' * 64}),
                           ('prior_receipt', {'path': 'reports/other.json', 'sha256': original['prior_receipt']['sha256']}),
                           ('seal_authorized', True), ('admission_authorized', True), ('contract_depth_complete', True)]:
            with self.subTest(key=key, value=value):
                changed = copy.deepcopy(original)
                changed[key] = value
                third.write_text(json.dumps(changed))
                pin_dl412_fixture(self.root)
                admitted, issues, receipt_sha = self.check()
                if key in ['validator_before_sha256', 'validator_after_sha256']:
                    self.assertEqual((admitted, issues, receipt_sha), (set(), ['post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch'], None))
                    continue
                self.assertEqual(admitted, set(self.POST))
                self.assertEqual(receipt_sha, self.v.sha256_file(self.root / self.v.POST_AUGUST_RECEIPT))
                self.assertTrue(issues and any(': multi-family step amendment receipt invalid: ' in i for i in issues))
        for lander, forbidden in [(None, [self.v.MULTI_FAMILY_AUTHOR]), ('', sorted(['', self.v.MULTI_FAMILY_AUTHOR])),
                                  (' ', sorted([' ', self.v.MULTI_FAMILY_AUTHOR]))]:
            with self.subTest(lander=lander):
                changed = copy.deepcopy(original)
                changed['lander_task'] = lander
                changed['seal_applier_forbidden_tasks'] = forbidden
                third.write_text(json.dumps(changed))
                pin_dl412_fixture(self.root)
                admitted, issues, receipt_sha = self.check()
                self.assertEqual(admitted, set(self.POST))
                self.assertTrue(issues and any(': multi-family step amendment receipt invalid: ' in i for i in issues))
        third.unlink()
        admitted, issues, receipt_sha = self.check()
        self.assertEqual((admitted, issues, receipt_sha), (set(), ['post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch'], None))

    def test_dl412_authority_text_is_pinned(self):
        for token in self.v.MULTI_FAMILY_REQUIRED:
            with self.subTest(token=token):
                self.setUp()
                path = self.root / 'Plans/Decision_Log.md'
                raw = path.read_bytes()
                start = raw.index(b'### DL-412:')
                path.write_bytes(raw[:start] + raw[start:].replace(token, b'changed', 1))
                admitted, issues, _ = self.check()
                self.assertEqual(admitted, set(self.POST))
                self.assertTrue(any(': multi-family step amendment receipt invalid: ' in i for i in issues))

    def test_main_admits_a_complete_step_and_keeps_every_other_rule(self):
        failures, named = self.run_main()
        self.assertEqual(named['post_august_admitted'], sorted(self.RECORDED))
        self.assertNotIn('post_august_admission_incomplete', failures)
        self.assertNotIn('unexpected_august_set', failures)
        receipt = json.loads((self.v.RECEIPT_DIR / 'event_authority_validator_receipt.json').read_text())
        self.assertEqual(receipt['input_pins']['multi_family_step_receipt_sha256'],
                         self.v.sha256_file(self.root / self.v.MULTI_FAMILY_RECEIPT))

    def test_main_rejects_a_step_named_by_a_malformed_record(self):
        self.write_record(self.claimant(lambda r: r['registry_before'].pop('revision')))
        failures, named = self.run_main()
        issues = failures['post_august_admission_incomplete']['issues']
        self.assertIn(self.OTHER + ': registry_before', issues)
        for et in self.STEP:
            self.assertNotIn(et, named['post_august_admitted'])
            self.assertIn(et, failures['unexpected_august_set']['august'])
            self.assertIn(et + ': registry_step_partial:' + self.OTHER + '.json', issues)
        self.assertFalse(named['post_august_admission_records_ok'])

    def test_main_fails_closed_on_a_partial_step(self):
        (self.record_dir / (self.STEP[1] + '.json')).unlink()
        failures, named = self.run_main()
        self.assertIn('post_august_admission_incomplete', failures)
        for et in self.STEP:
            self.assertNotIn(et, named['post_august_admitted'])
            self.assertIn(et, failures['unexpected_august_set']['august'])
        self.assertIn('post_august_admission_incomplete', named['seal_prerequisites_blocking_errors'])
        self.assertFalse(named['post_august_admission_records_ok'])


    def assert_file_rejects_step(self, name, raw):
        (self.record_dir / name).write_bytes(raw if isinstance(raw, bytes) else raw.encode())
        admitted, issues, _ = self.check()
        self.assertFalse(admitted & set(self.STEP), issues)
        for et in self.STEP:
            self.assertTrue(any(i.startswith(et + ': ') and name in i for i in issues), issues)
        failures, named = self.run_main()
        self.assertFalse(set(named['post_august_admitted']) & set(self.STEP))
        self.assertIn('post_august_admission_incomplete', failures)
        self.assertTrue(all(any(i.startswith(et + ': ') and name in i for i in failures['post_august_admission_incomplete']['issues']) for et in self.STEP))

    def test_duplicate_keys_at_every_level_and_in_members_fail_closed(self):
        for location in ['root', 'side', 'hash', 'step', 'metadata', 'depth']:
            for order in [False, True]:
                for member in [False, True]:
                    with self.subTest(location=location, order=order, member=member):
                        self.setUp()
                        r=self.record_for(self.STEP[0]);raw=json.dumps(r)
                        if location == 'root':
                            raw=raw[:-1]+',"extra":1,"extra":2}'
                        elif location == 'metadata':
                            raw=raw[:-1]+',"extra":{"nested":[{"x":1,"x":2}]}}'
                        else:
                            key={'side':'registry_before','hash':'sha256','step':'registry_step_event_types','depth':'depth_assessment'}[location]
                            prefix=json.dumps(key)+':'
                            raw=raw.replace(prefix, prefix+'null,'+prefix,1) if not order else raw[:-1]+','+prefix+'null}' if location!='hash' else raw.replace('"sha256": "'+r['registry_before']['sha256']+'"','"sha256": "'+r['registry_before']['sha256']+'", "sha256":null',1)
                        name=self.STEP[0]+'.json' if member else 'duplicate-copy.json'
                        self.assert_file_rejects_step(name, raw)

    def test_all_malformed_hash_representations_reject_every_step_member(self):
        transforms=[lambda s: {'sha256':s},lambda s:[s],lambda s:s.upper(),lambda s:' '+s,lambda s:s+'\n',lambda s:'\t'.join(s),lambda s:True,lambda s:False,lambda s:None,lambda s:[],lambda s:{},lambda s:0,lambda s:7.0,lambda s:int('7'*64),lambda s:'７'*64,lambda s:'٧'*64,lambda s:'𝟟'*64]
        for transform in transforms:
            for member in [False,True]:
                with self.subTest(transform=transforms.index(transform),member=member):
                    self.setUp();r=self.record_for(self.STEP[0]);r['registry_before']['sha256']=transform(r['registry_before']['sha256'])
                    self.assert_file_rejects_step(self.STEP[0]+'.json' if member else 'misnamed.json',json.dumps(r,ensure_ascii=False))

    def test_nested_sides_arrays_unreadable_and_non_json_files_fail_closed(self):
        for mode in ['side-array','outer-array','invalid-unicode-number','invalid-json','invalid-utf8','nan','directory','non-json-extension','deep-claim']:
            with self.subTest(mode=mode):
                self.setUp();r=self.record_for(self.STEP[0]);name='misnamed.json';raw=json.dumps(r)
                if mode=='side-array':r['registry_before']=[r['registry_before']];raw=json.dumps(r)
                elif mode=='outer-array':raw=json.dumps([r])
                elif mode=='invalid-unicode-number':raw=raw.replace('"'+r['registry_before']['sha256']+'"','٧'*64,1)
                elif mode=='invalid-json':raw='{'
                elif mode=='invalid-utf8':raw=b'\xff'
                elif mode=='nan':raw=raw[:-1]+',"extra":NaN}'
                elif mode=='deep-claim':
                    r=self.record_for(self.OTHER);v='unrelated'
                    for _ in range(600):v=[v]
                    r['extra']=v;raw=json.dumps(r)
                elif mode=='directory':(self.record_dir/name).mkdir()
                elif mode=='non-json-extension':name='claim.txt'
                if mode=='directory':
                    admitted,issues,_=self.check();self.assertFalse(admitted & set(self.STEP));self.assertTrue(all(any(i.startswith(et+': ') and name in i for i in issues) for et in self.STEP))
                else:self.assert_file_rejects_step(name,raw)

    def test_either_digest_anywhere_in_keys_or_values_is_a_claim(self):
        for side in ['registry_before','registry_after']:
            for mode in ['value','key','array','nested','uppercase','whitespace','numeric','fullwidth','arabic','math']:
                with self.subTest(side=side,mode=mode):
                    self.setUp();self.numeric_step((0,0)) if mode in ['numeric','fullwidth','arabic','math'] else None
                    digest=('7' if side=='registry_before' else '8')*64 if mode in ['numeric','fullwidth','arabic','math'] else self.record_for(self.STEP[0])[side]['sha256']
                    r=self.record_for(self.OTHER)
                    value=digest
                    if mode=='uppercase':value=digest.upper()
                    elif mode=='whitespace':value=' \t'.join(digest)
                    elif mode=='numeric':value=int(digest)
                    elif mode in ['fullwidth','arabic','math']:
                        digits={'fullwidth':'０１２３４５６７８９','arabic':'٠١٢٣٤٥٦٧٨٩','math':'𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡'}[mode];value=''.join(digits[int(c)] for c in digest)
                    r['extra']={value:'innocent'} if mode=='key' else [value] if mode=='array' else {'wrapper':[{'claim':value}]} if mode=='nested' else value
                    self.assert_file_rejects_step('rejected-copy.json',json.dumps(r,ensure_ascii=False))

    def test_uninspectable_file_fails_all_steps_but_legacy_keeps_its_own_result(self):
        self.assert_file_rejects_step('unrelated.json','{')
        admitted,issues,_=self.check()
        self.assertEqual(admitted,set(self.POST))
        self.assertFalse(any(i.startswith(et+': ') for et in self.POST for i in issues))

    def test_strictly_read_unrelated_file_and_unrelated_metadata_do_not_poison_steps(self):
        r=self.record_for(self.OTHER);r['extra']={'unrelated':[42,True,None,'hello']};self.write_record(r)
        self.assertEqual(self.check()[1],[])

    def test_nested_noncanonical_side_claims_fail_even_without_a_matching_digest(self):
        for value in [True,False,None,7,int('7'*64),'７'*64,'C'*64,' '+'c'*64,{'wrapped':'c'*64},['c'*64]]:
            for side in ['registry_before','registry_after']:
                with self.subTest(value=value,side=side):
                    self.setUp();r=self.record_for(self.OTHER)
                    r['extra']={'deep':[{'claim':{side:{'sha256':value}}}]}
                    self.assert_file_rejects_step('nested-claim.json',json.dumps(r,ensure_ascii=False))

    def test_two_steps_fail_closed_on_uncertainty_and_either_shared_digest(self):
        second=sorted(['browser.workspace.created','browser.workspace.reset'])
        for mode in ['disjoint-positive','unreadable','shared-before','shared-after']:
            with self.subTest(mode=mode):
                self.setUp()
                for et in second:
                    r=self.record_for(et);r['registry_step_event_types']=second
                    r['implementation_receipt_sha256']=self.v.sha256_file(self.root/self.v.MULTI_FAMILY_RECEIPT)
                    r['registry_before']={'revision':'other-before','sha256':self.STEP_BEFORE['sha256'] if mode=='shared-before' else 'c'*64,'family_count':50}
                    r['registry_after']={'revision':'other-after','sha256':self.STEP_AFTER['sha256'] if mode=='shared-after' else 'd'*64,'family_count':52}
                    self.write_record(r)
                if mode=='unreadable':(self.record_dir/'unreadable.json').write_text('{')
                admitted,issues,_=self.check();targets=set(self.STEP+second)
                self.assertEqual(admitted & targets, targets if mode=='disjoint-positive' else set(),issues)
                if mode=='unreadable':
                    self.assertTrue(all(any(i.startswith(et+': ') and 'unreadable.json' in i for i in issues) for et in targets))
                failures,named=self.run_main()
                self.assertEqual(set(named['post_august_admitted']) & targets,targets if mode=='disjoint-positive' else set())

class LegacyReceiptCompatibilityTests(unittest.TestCase):
    """C4-02: explicit old-message, ordered-issue and receipt-return controls."""
    def test_holding_keeps_dl077_errors_for_the_two_review_controls(self):
        for key, value in [('validator_after_sha256', '0' * 64), ('seal_authorized', True)]:
            with self.subTest(key=key):
                c = HoldingBucketTests(); c.setUp()
                try:
                    path = c.root / c.v.POST_AUGUST_RECEIPT
                    data = json.loads(path.read_bytes()); data[key] = value
                    path.write_text(json.dumps(data))
                    self.assertEqual(c.check()[2], ['holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch'])
                finally: c.doCleanups()

    def test_admission_keeps_dl077_errors_for_the_nine_review_controls(self):
        for key, value in [('validator_after_sha256', '0' * 64), ('record_dir', 'reports/elsewhere'),
                           ('author_task', 'someone-else'), ('seal_applier_forbidden_task', 'someone-else'),
                           ('seal_authorized', True), ('admission_authorized', True),
                           ('contract_depth_complete', True), ('lander_task', 'someone-else'),
                           ('record_schema_id', 'someone-else')]:
            with self.subTest(key=key):
                c = PostAugustAdmissionTests(); c.setUp()
                try:
                    for et in c.STEP: (c.record_dir / (et + '.json')).unlink()
                    path = c.root / c.v.POST_AUGUST_RECEIPT
                    data = json.loads(path.read_bytes()); data[key] = value
                    path.write_text(json.dumps(data))
                    self.assertEqual(c.check(), (set(), ['post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch'], None))
                finally: c.doCleanups()

    def test_notes_only_preserve_the_seven_ordered_issues_and_dl077_pin(self):
        c = PostAugustAdmissionTests(); c.setUp()
        try:
            for et in c.STEP: (c.record_dir / (et + '.json')).unlink()
            path = c.root / c.v.POST_AUGUST_RECEIPT
            data = json.loads(path.read_bytes()); data['notes'] = data.get('notes', []) + ['a later edit']
            path.write_text(json.dumps(data))
            pin = c.v.sha256_file(path)
            expected = [et + (': no admission record' if et in c.STEP else ': implementation_receipt_sha256')
                        for et in sorted(c.RECORDED)]
            self.assertEqual(c.check(), (set(), expected, pin))
            for et in c.POST:
                record = json.loads((c.record_dir / (et + '.json')).read_text())
                record['implementation_receipt_sha256'] = pin; c.write_record(record)
            self.assertEqual(c.check(), (set(c.POST), [et + ': no admission record' for et in sorted(c.STEP)], pin))
            # The full new receipt integrity guard still refuses step records:
            # a notes-only change is harmless to DL-077 but changes its raw pin.
            for et in c.STEP: c.write_record(c.record_for(et))
            admitted, issues, returned_pin = c.check()
            self.assertEqual(admitted, set(c.POST)); self.assertEqual(returned_pin, pin)
            for et in c.STEP:
                self.assertTrue(any(i.startswith(et + ': multi-family step amendment receipt invalid: ') for i in issues))
        finally: c.doCleanups()


class ExactNumericClaimTests(unittest.TestCase):
    """C4-01: canonical own members plus a foreign exact numeric token."""
    def test_foreign_integer_decimal_exponent_and_quoted_claims_reject_all_members(self):
        for suffix in ['', '.0', 'e0', '.5', 'e9999', 'E+0', '.0e-0']:
            for quoted in [False, True]:
                with self.subTest(suffix=suffix, quoted=quoted):
                    c = MultiFamilyStepTests(); c.setUp()
                    try:
                        c.numeric_step((0, 0))
                        before, after = '7' * 64 + suffix, '8' * 64 + suffix
                        if quoted: before, after = json.dumps(before), json.dumps(after)
                        r = c.record_for(c.OTHER)
                        raw = json.dumps(r)[:-1] + ',"foreign_step_claim":{"registry_step_event_types":' + json.dumps(c.STEP) + ',"before_sha256":' + before + ',"after_sha256":' + after + '}}'
                        (c.record_dir / (c.OTHER + '.json')).write_text(raw)
                        c.step_fails(*[et + ': registry_step_partial:' + c.OTHER for et in c.STEP])
                        # The foreign legacy record has exactly its own old problems.
                        self.assertEqual(c.v.admission_record_problems(c.v.load_json(c.record_dir / (c.OTHER + '.json')), c.families[c.OTHER]), [])
                        failures, named = c.run_main()
                        self.assertFalse(set(c.STEP) & set(named['post_august_admitted']))
                        self.assertIn('post_august_admission_incomplete', failures)
                    finally: c.doCleanups()

    def test_numeric_member_sha_forms_are_noncanonical(self):
        for suffix in ['', '.0', 'e0', '.5', 'e9999', 'E+0', '.0e-0']:
            with self.subTest(suffix=suffix):
                c = MultiFamilyStepTests(); c.setUp()
                try:
                    c.numeric_step((0, 0))
                    p = c.record_dir / (c.STEP[0] + '.json')
                    p.write_text(p.read_text().replace(json.dumps('7' * 64), '7' * 64 + suffix))
                    c.step_fails()
                    failures, named = c.run_main()
                    self.assertFalse(set(c.STEP) & set(named['post_august_admitted']))
                finally: c.doCleanups()

    def test_own_numeric_metadata_preserves_the_matching_file_exemption(self):
        c = MultiFamilyStepTests(); c.setUp()
        try:
            for et in c.STEP:
                p = c.record_dir / (et + '.json')
                p.write_text(p.read_text()[:-1] + ',"unrelated_metadata":[0.1,1e0,1e9999,-0.0]}')
            self.assertEqual(c.check()[0], set(c.RECORDED)); self.assertEqual(c.check()[1], [])
        finally: c.doCleanups()


class LiveValidatorIntegrityTests(unittest.TestCase):
    """C5-01: real executable bytes, legacy records, unchanged old predicates."""

    ERROR = 'post-August amendment receipt identity, authority or hash mismatch'

    def test_actual_cli_comment_crlf_and_other_executable_changes_fail_closed(self):
        import ast
        spec = importlib.util.spec_from_file_location('cli_source', REPO / VALIDATOR)
        v = importlib.util.module_from_spec(spec); spec.loader.exec_module(v)
        tree = ast.parse((REPO / VALIDATOR).read_bytes())
        required = next(n.value for n in ast.walk(tree) if isinstance(n, ast.Assign)
                        and any(isinstance(t, ast.Name) and t.id == 'required_paths' for t in n.targets))
        paths = {p.relative_to(REPO) for p in eval(compile(ast.Expression(required), 'inputs', 'eval'), vars(v)).values()}
        paths.update([VALIDATOR, Path('Plans/Decision_Log.md'), Path(v.HOLDING_RECEIPT),
                      Path(v.POST_AUGUST_RECEIPT), Path(v.MULTI_FAMILY_RECEIPT),
                      AUDIT / 'closed-world-census/admission/CENSUS_ADMISSION_RULE_V2.json'])
        for record in (REPO / v.POST_AUGUST_RECORD_DIR).glob('*.json'):
            paths.add(record.relative_to(REPO))
            paths.add(Path(json.loads(record.read_bytes())['depth_assessment']['path']))
        with tempfile.TemporaryDirectory(dir=os.environ.get('PM_TEST_EVIDENCE_DIR')) as folder:
            root = Path(folder)
            for rel in paths:
                dest = root / rel; dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(REPO / rel, dest)
            pin_dl412_fixture(root)
            executable = root / VALIDATOR; original = executable.read_bytes()
            receipt_path = root / v.MULTI_FAMILY_RECEIPT; pinned_receipt = receipt_path.read_bytes()
            output = executable.parent / 'receipts/event_authority_validator_receipt.json'
            for mode in ['baseline', 'comment', 'crlf', 'one-byte', 'appended-bytes']:
                with self.subTest(mode=mode):
                    executable.write_bytes(original if mode == 'baseline' else self.changed(original, mode))
                    output.unlink(missing_ok=True)
                    proc = subprocess.run([sys.executable, '-I', '-B', str(executable)], capture_output=True, text=True)
                    self.assertEqual(proc.returncode, 1, proc.stderr)
                    self.assertFalse(proc.stderr)
                    result = json.loads(output.read_bytes())
                    self.assertFalse(result['pass'])
                    self.assertEqual(receipt_path.read_bytes(), pinned_receipt)
                    if mode == 'baseline':
                        self.assertTrue(result['named_checks']['holding_bucket_valid'])
                        self.assertIn('coordination.agent_registered', result['named_checks']['post_august_admitted'])
                        continue
                    failures = {f['error']: f for f in result['failures']}
                    self.assertEqual(result['named_checks']['post_august_admitted'], [])
                    self.assertFalse(result['named_checks']['holding_bucket_valid'])
                    self.assertIsNone(result['input_pins']['post_august_admission_receipt_sha256'])
                    self.assertEqual(failures['post_august_admission_incomplete']['issues'],
                                     ['post-August amendment receipt invalid: ' + self.ERROR])
                    self.assertEqual(failures['holding_bucket_invalid']['issues'],
                                     ['holding authority/receipt invalid: ' + self.ERROR])

    def fixture(self, kind):
        c = kind(); c.setUp(); self.addCleanup(c.doCleanups)
        if kind is PostAugustAdmissionTests:
            for et in c.STEP: (c.record_dir / (et + '.json')).unlink()
        # Hash a scratch copy of the executing module, never edit a checkout.
        executable = c.root / VALIDATOR; executable.parent.mkdir(parents=True, exist_ok=True)
        executable.write_bytes(Path(c.v.__file__).read_bytes()); c.v.__file__ = str(executable)
        return c, executable

    @staticmethod
    def changed(raw, mode):
        if mode == 'one-byte':
            pos = raw.index(b'#'); changed = b'?' if raw[pos + 1:pos + 2] != b'?' else b'!'
            return raw[:pos + 1] + changed + raw[pos + 2:]
        if mode == 'comment': return raw + b'\r\n# C5 executable-only negative\r\n'
        if mode == 'crlf': return raw + b'\r\n'
        return raw + b'\r\n# additional appended bytes: 0123456789\r\n'

    def test_live_executable_mutations_reject_legacy_admission_and_holding(self):
        for kind in [PostAugustAdmissionTests, HoldingBucketTests]:
            for mode in ['one-byte', 'comment', 'crlf', 'appended-bytes']:
                with self.subTest(kind=kind.__name__, mode=mode):
                    c, executable = self.fixture(kind)
                    before = c.check()
                    self.assertEqual(before[0], set(c.POST)) if kind is PostAugustAdmissionTests else self.assertEqual(before[2], [])
                    receipt = (c.root / c.v.MULTI_FAMILY_RECEIPT).read_bytes()
                    original = executable.read_bytes(); executable.write_bytes(self.changed(original, mode))
                    self.assertNotEqual(c.v.sha256_file(executable), json.loads(receipt)['validator_after_sha256'])
                    self.assertEqual((c.root / c.v.MULTI_FAMILY_RECEIPT).read_bytes(), receipt)
                    self.assertEqual(c.v.post_august_validator_pin(), c.v.third_change_validator_pin())  # a broken DL-412 link presents what the later links present (the live hash when they break too)
                    if kind is PostAugustAdmissionTests:
                        self.assertEqual(c.check(), (set(), ['post-August amendment receipt invalid: ' + self.ERROR], None))
                    else:
                        self.assertEqual(c.check()[2], ['holding authority/receipt invalid: ' + self.ERROR])
                    # No cached observer may survive a restore or subsequent mutation.
                    executable.write_bytes(original); self.assertEqual(c.check(), before)
                    executable.write_bytes(self.changed(original, mode))
                    with self.assertRaisesRegex(ValueError, self.ERROR): c.v.post_august_receipt_state()

    def test_forged_byte_links_reject_without_other_receipt_faults(self):
        for key in ['validator_before_sha256', 'validator_after_sha256']:
            for value in [None, False, 0, [], {}, '0' * 64]:
                with self.subTest(key=key, value=value):
                    c, executable = self.fixture(PostAugustAdmissionTests)
                    self.assertEqual(c.check()[0], set(c.POST))
                    path = c.root / c.v.MULTI_FAMILY_RECEIPT; good = json.loads(path.read_bytes())
                    forged = copy.deepcopy(good); forged[key] = value
                    self.assertEqual([k for k in good if good[k] != forged[k]], [key])
                    path.write_text(json.dumps(forged))
                    pin_dl412_fixture(c.root)
                    self.assertEqual(c.v.post_august_validator_pin(), c.v.third_change_validator_pin())  # a broken DL-412 link presents what the later links present (the live hash when they break too)
                    self.assertEqual(c.check(), (set(), ['post-August amendment receipt invalid: ' + self.ERROR], None))

    def test_missing_unreadable_and_nonobject_receipt_fail_with_the_old_message(self):
        for raw in [None, b'{', b'null', b'false', b'[]', b'0', b'"false"']:
            with self.subTest(raw=raw):
                c, executable = self.fixture(PostAugustAdmissionTests)
                path = c.root / c.v.MULTI_FAMILY_RECEIPT
                if raw is None: path.unlink()
                else: path.write_bytes(raw)
                if raw is not None: pin_dl412_fixture(c.root)
                self.assertEqual(c.check(), (set(), ['post-August amendment receipt invalid: ' + self.ERROR], None))

    def test_unrelated_receipt_semantics_do_not_reach_legacy_predicates(self):
        for key, value in [('schema_id', 'forged'), ('authority_ref', 'missing'),
                           ('authority_section_sha256', '0' * 64), ('lander_task', None),
                           ('prior_receipt', None), ('seal_authorized', True)]:
            with self.subTest(key=key):
                c, executable = self.fixture(PostAugustAdmissionTests); before = c.check()
                path = c.root / c.v.MULTI_FAMILY_RECEIPT; receipt = json.loads(path.read_bytes())
                receipt[key] = value; path.write_text(json.dumps(receipt))
                pin_dl412_fixture(c.root)
                self.assertEqual(c.check(), before)


    def test_spec_lock_anchor_missing_wrong_duplicate_or_elsewhere_fails_closed(self):
        for mode in ['missing-file', 'missing-entry', 'wrong-hash', 'duplicate', 'elsewhere',
                     'uppercase-hash', 'trailing-LF-path', 'array-hash', 'null-files']:
            with self.subTest(mode=mode):
                c, executable = self.fixture(PostAugustAdmissionTests)
                self.assertEqual(c.check()[0], set(c.POST))
                lock = c.root / 'Plans/Spec_Lock.json'
                obj = json.loads(lock.read_bytes()); entries = obj['canonical_ssot_hashes']['files']
                if mode == 'missing-file': lock.unlink()
                else:
                    if mode == 'missing-entry': entries.clear()
                    elif mode == 'wrong-hash': entries[0]['sha256'] = '0' * 64
                    elif mode == 'duplicate': entries.append(copy.deepcopy(entries[0]))
                    elif mode == 'elsewhere': entries[0]['path'] = 'reports/elsewhere.json'
                    elif mode == 'uppercase-hash': entries[0]['sha256'] = entries[0]['sha256'].upper()
                    elif mode == 'trailing-LF-path': entries[0]['path'] += '\n'
                    elif mode == 'array-hash': entries[0]['sha256'] = [entries[0]['sha256']]
                    else: obj['canonical_ssot_hashes']['files'] = None
                    lock.write_text(json.dumps(obj))
                self.assertEqual(c.v.post_august_validator_pin(), c.v.third_change_validator_pin())  # a broken DL-412 link presents what the later links present (the live hash when they break too)
                self.assertEqual(c.check(), (set(), ['post-August amendment receipt invalid: ' + self.ERROR], None))

    def test_changed_receipt_bytes_fail_against_the_unchanged_anchor(self):
        c, executable = self.fixture(PostAugustAdmissionTests)
        self.assertEqual(c.check()[0], set(c.POST))
        path = c.root / c.v.MULTI_FAMILY_RECEIPT
        lock = c.root / 'Plans/Spec_Lock.json'; trusted = lock.read_bytes()
        receipt = json.loads(path.read_bytes()); receipt['notes'].append('unanchored byte edit')
        path.write_text(json.dumps(receipt))
        self.assertEqual(lock.read_bytes(), trusted)
        self.assertEqual(c.v.post_august_validator_pin(), c.v.third_change_validator_pin())  # a broken DL-412 link presents what the later links present (the live hash when they break too)
        self.assertEqual(c.check(), (set(), ['post-August amendment receipt invalid: ' + self.ERROR], None))

    def test_actual_cli_combined_forged_receipts_and_altered_bytes_fail_closed(self):
        import ast
        spec = importlib.util.spec_from_file_location('cli_forgery_source', REPO / VALIDATOR)
        v = importlib.util.module_from_spec(spec); spec.loader.exec_module(v)
        tree = ast.parse((REPO / VALIDATOR).read_bytes())
        required = next(n.value for n in ast.walk(tree) if isinstance(n, ast.Assign)
                        and any(isinstance(t, ast.Name) and t.id == 'required_paths' for t in n.targets))
        paths = {p.relative_to(REPO) for p in eval(compile(ast.Expression(required), 'inputs', 'eval'), vars(v)).values()}
        paths.update([VALIDATOR, Path('Plans/Decision_Log.md'), Path(v.HOLDING_RECEIPT),
                      Path(v.POST_AUGUST_RECEIPT), Path(v.MULTI_FAMILY_RECEIPT),
                      AUDIT / 'closed-world-census/admission/CENSUS_ADMISSION_RULE_V2.json'])
        for record in (REPO / v.POST_AUGUST_RECORD_DIR).glob('*.json'):
            paths.add(record.relative_to(REPO))
            paths.add(Path(json.loads(record.read_bytes())['depth_assessment']['path']))
        with tempfile.TemporaryDirectory(dir=os.environ.get('PM_TEST_EVIDENCE_DIR')) as folder:
            root = Path(folder)
            for rel in paths:
                dest = root / rel; dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(REPO / rel, dest)
            pin_dl412_fixture(root)
            executable = root / VALIDATOR; pristine = executable.read_bytes()
            path = root / v.MULTI_FAMILY_RECEIPT; baseline = path.read_bytes()
            lock = root / 'Plans/Spec_Lock.json'; trusted = lock.read_bytes()
            retained = [root / v.POST_AUGUST_RECEIPT, *(root / v.POST_AUGUST_RECORD_DIR).glob('*.json')]
            saved = {p: p.read_bytes() for p in retained}
            output = executable.parent / 'receipts/event_authority_validator_receipt.json'
            for mode in ['baseline', 'two-field', 'forged-full', 'repinned-full', 'restore']:
                with self.subTest(mode=mode):
                    altered = mode not in ['baseline', 'restore']
                    raw = pristine + (b'\r\n# cycle6 executable-byte integrity negative\r\n' if altered else b'')
                    executable.write_bytes(raw)
                    receipt = json.loads(baseline)
                    if mode == 'two-field':
                        receipt = {'validator_before_sha256': receipt['validator_before_sha256'],
                                   'validator_after_sha256': hashlib.sha256(raw).hexdigest()}
                    elif altered:
                        receipt['validator_after_sha256'] = hashlib.sha256(raw).hexdigest()
                        if mode == 'forged-full':
                            receipt.update(schema_id='forged', authority_ref='forged', author_task='forged', prior_receipt={})
                    path.write_bytes(baseline if not altered else json.dumps(receipt).encode())
                    self.assertEqual(lock.read_bytes(), trusted)
                    proc = subprocess.run([sys.executable, '-I', '-B', str(executable)], capture_output=True, text=True)
                    self.assertEqual(proc.returncode, 1, proc.stderr); self.assertFalse(proc.stderr)
                    result = json.loads(output.read_bytes())
                    self.assertFalse(result['pass'])
                    self.assertEqual(saved, {p: p.read_bytes() for p in retained})
                    if not altered:
                        self.assertIn('coordination.agent_registered', result['named_checks']['post_august_admitted'])
                        self.assertTrue(result['named_checks']['holding_bucket_valid'])
                        continue
                    self.assertEqual(result['named_checks']['post_august_admitted'], [])
                    self.assertFalse(result['named_checks']['holding_bucket_valid'])
                    self.assertIsNone(result['input_pins']['post_august_admission_receipt_sha256'])
                    failures = {f['error']: f for f in result['failures']}
                    self.assertEqual(failures['post_august_admission_incomplete']['issues'],
                                     ['post-August amendment receipt invalid: ' + self.ERROR])
                    self.assertEqual(failures['holding_bucket_invalid']['issues'],
                                     ['holding authority/receipt invalid: ' + self.ERROR])



    def test_actual_cli_strict_bridge_json_inputs_fail_closed(self):
        """The bridge rejects ambiguous/non-JSON bytes even with an exact raw-byte anchor."""
        import ast
        spec = importlib.util.spec_from_file_location('strict_cli_source', REPO / VALIDATOR)
        v = importlib.util.module_from_spec(spec); spec.loader.exec_module(v)
        tree = ast.parse((REPO / VALIDATOR).read_bytes())
        required = next(n.value for n in ast.walk(tree) if isinstance(n, ast.Assign)
                        and any(isinstance(t, ast.Name) and t.id == 'required_paths' for t in n.targets))
        paths = {p.relative_to(REPO) for p in eval(compile(ast.Expression(required), 'inputs', 'eval'), vars(v)).values()}
        paths.update([VALIDATOR, Path('Plans/Decision_Log.md'), Path(v.HOLDING_RECEIPT),
                      Path(v.POST_AUGUST_RECEIPT), Path(v.MULTI_FAMILY_RECEIPT),
                      AUDIT / 'closed-world-census/admission/CENSUS_ADMISSION_RULE_V2.json'])
        for record in (REPO / v.POST_AUGUST_RECORD_DIR).glob('*.json'):
            paths.add(record.relative_to(REPO))
            paths.add(Path(json.loads(record.read_bytes())['depth_assessment']['path']))
        with tempfile.TemporaryDirectory(dir=os.environ.get('PM_TEST_EVIDENCE_DIR')) as folder:
            root = Path(folder)
            for rel in paths:
                dest = root / rel; dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(REPO / rel, dest)
            executable = root / VALIDATOR
            receipt = root / v.MULTI_FAMILY_RECEIPT
            baseline_receipt = receipt.read_bytes()
            pin_dl412_fixture(root)
            lock = root / 'Plans/Spec_Lock.json'; baseline_lock = lock.read_bytes()
            output = executable.parent / 'receipts/event_authority_validator_receipt.json'
            saved = {root / rel: (root / rel).read_bytes() for rel in paths if rel != Path(v.MULTI_FAMILY_RECEIPT)}
            controls = []
            for target, baseline in [('lock', baseline_lock), ('receipt', baseline_receipt)]:
                text = baseline.decode('utf-8').rstrip()
                variants = [('duplicate-root', text[:-1] + ',"extra":1,"extra":2}'),
                            ('duplicate-deep', text[:-1] + ',"extra":{"items":[{"k":1,"k":2}]}}')]
                if target == 'lock':
                    obj = json.loads(baseline); ssot = json.dumps(obj['canonical_ssot_hashes'])
                    entry = obj['canonical_ssot_hashes']['files'][0]; encoded = json.dumps(entry)
                    variants += [('duplicate-canonical-ssot', '{"canonical_ssot_hashes":null,"canonical_ssot_hashes":' + ssot + '}'),
                                 ('duplicate-files', '{"canonical_ssot_hashes":{"files":[' + encoded + ',' + encoded + '],"files":[' + encoded + ']}}')]
                    for field in ['path', 'sha256']:
                        duplicate_entry = encoded[:-1] + ',' + json.dumps(field) + ':' + json.dumps(entry[field]) + '}'
                        variants.append(('duplicate-entry-' + field, '{"canonical_ssot_hashes":{"files":[' + duplicate_entry + ']}}'))
                else:
                    obj = json.loads(baseline)
                    for field in ['validator_before_sha256', 'validator_after_sha256']:
                        variants.append(('duplicate-' + field, text[:-1] + ',' + json.dumps(field) + ':' + json.dumps(obj[field]) + '}'))
                for token in ['NaN', 'Infinity', '-Infinity']:
                    for value in [token, '{"nested":' + token + '}', '[{"nested":' + token + '}]']:
                        variants.append(('constant-' + value, text[:-1] + ',"extra":' + value + '}'))
                variants += [('BOM', b'\xef\xbb\xbf' + baseline), ('garbage', text + ' trailing'),
                             ('second-root', text + '{}'), ('invalid-utf8', baseline + b'\xff'),
                             ('broken', '{')]
                variants += [('root-' + raw, raw) for raw in ['null', '[]', 'false', '0', '1.0', '"false"']]
                controls += [(target + '-' + name, target, raw, False) for name, raw in variants]
            controls.insert(0, ('baseline', 'lock', baseline_lock, True))
            controls.append(('restore', 'lock', baseline_lock, True))
            for name, target, raw, success in controls:
                with self.subTest(case=name):
                    receipt.write_bytes(baseline_receipt); lock.write_bytes(baseline_lock)
                    data = raw.encode('utf-8') if isinstance(raw, str) else raw
                    if target == 'receipt':
                        receipt.write_bytes(data)
                        pin_dl412_fixture(root)  # observes the exact malformed bytes, avoiding a stale-anchor defect
                    else:
                        lock.write_bytes(data)
                    observed_receipt, observed_lock = receipt.read_bytes(), lock.read_bytes()
                    output.unlink(missing_ok=True)
                    proc = subprocess.run([sys.executable, '-I', '-B', str(executable)], capture_output=True, text=True)
                    self.assertEqual(proc.returncode, 1, proc.stderr); self.assertFalse(proc.stderr)
                    result = json.loads(output.read_bytes())
                    self.assertEqual(saved, {p: p.read_bytes() for p in saved})
                    self.assertEqual(receipt.read_bytes(), observed_receipt); self.assertEqual(lock.read_bytes(), observed_lock)
                    self.assertEqual(result['named_checks']['holding_bucket_valid'], success)
                    if success:
                        self.assertIn('coordination.agent_registered', result['named_checks']['post_august_admitted'])
                    else:
                        self.assertEqual(result['named_checks']['post_august_admitted'], [])
                    if not success:
                        self.assertIsNone(result['input_pins']['post_august_admission_receipt_sha256'])
                        failures = {f['error']: f for f in result['failures']}
                        self.assertEqual(failures['post_august_admission_incomplete']['issues'],
                                         ['post-August amendment receipt invalid: ' + self.ERROR])
                        self.assertEqual(failures['holding_bucket_invalid']['issues'],
                                         ['holding authority/receipt invalid: ' + self.ERROR])

if __name__ == '__main__':
    unittest.main()
