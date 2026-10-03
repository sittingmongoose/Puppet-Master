"""Auth-free isolated-state fixtures: source AST load never imports live API."""
import ast
import contextlib
import copy
import hashlib
import json
from pathlib import Path
import tempfile
import types
import unittest
from unittest.mock import patch

HERE = Path(__file__).resolve().parent
LAB = HERE.parents[1]
NOW = 1791005600.0


def write(path, value):
    path.write_text(json.dumps(value, indent=2, allow_nan=False) + '\n')


def ref(path):
    return {'path': str(path), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}


def isolated_source(path):
    """Keep function bodies exact; suppress module-level dependency/native loads."""
    tree = ast.parse(path.read_text(), filename=str(path))
    nodes = [n for n in tree.body if isinstance(n, (ast.Import, ast.ImportFrom, ast.FunctionDef))]
    module = types.ModuleType('isolated_fixture')
    module.__file__ = str(path)
    exec(compile(ast.Module(body=nodes, type_ignores=[]), str(path), 'exec'), module.__dict__)
    return module


class GuardTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='er8-output-guard-fixture-')
        self.addCleanup(self.temp.cleanup)
        self.t = Path(self.temp.name)
        self.g = isolated_source(HERE / 'ledger_output_guard_v1.py')
        self.l = isolated_source(LAB / 'ops/accounting-v1/slot_ledger.py')
        self.l.CATEGORIES = {'setup', 'retry', 'wait', 'cancel', 'handoff', 'cleanup', 'native', 'evaluation', 'source_capture'}
        self.clock = patch.object(self.l.time, 'time', return_value=NOW)
        self.clock.start(); self.addCleanup(self.clock.stop)
        self.limits = {'candidate_output_warning': 1200000, 'candidate_output_stop': 1500000,
            'native_goal_starts': 144, 'occupied_candidate_slot_seconds': 172800, 'active_helpers': 12,
            'active_candidates_by_family': {'M': 2, 'Z': 2, 'L': 2}, 'component_hard_seconds': 1200,
            'component_hard_responses': 160, 'case_elapsed_seconds': 3600, 'case_occupied_seconds': 5400}
        self.l.auth = lambda: {'limits': copy.deepcopy(self.limits)}
        old_accounting = self.l.accounting
        self.g.CAMPAIGN = LAB
        self.g.API = LAB / 'ops/attempt-reservation-api-v1/ledger_attempt_reservations_v1.py'
        self.g.API_SHA = '9bd4b17fe406cd20680c0c8eef16f96a6a45db727d977f1ba2cc42641c82d577'
        for name in ('AUTHORITY', 'ACCEPTANCE', 'REVIEW', 'QUIET', 'MANIFEST'):
            setattr(self.g, name, self.t / (name + '.json'))
        self.g.SOURCE = HERE / 'ledger_output_guard_v1.py'
        self.g.__file__ = str(self.g.SOURCE)
        self.g.RECEIPT_KEY = 'output_guard_authority_v1'
        self.g.START = 1790905209
        self.g.DEADLINE = 1791013030.8303788
        self.g.WARNING = 1200000; self.g.OLD_STOP = 1500000; self.g.STOP = 2000000
        self.g.VERSION = 'prospective-output-guard-v1'
        authority = {'schema': 'pm.er8.prospective-output-guard-root-authority.v1', 'root_authority': True,
            'campaign_id': LAB.name, 'selected_epoch': NOW - 100, 'new_warning': 1200000,
            'new_stop': 2000000, 'prior_warning': 1200000, 'prior_stop': 1500000,
            'governing_user_envelope': {'original_start_epoch': self.g.START, 'deadline_epoch': self.g.DEADLINE}}
        write(self.g.AUTHORITY, authority)
        self.g.AUTHORITY_SHA = ref(self.g.AUTHORITY)['sha256']
        self.base_calls = []
        def base_apply(state, action, request):
            self.base_calls.append((action, copy.deepcopy(request)))
            if action == 'reserve-attempt-successors':
                return self.g.accounting(state, NOW)
            # Preserve the accepted overlay's source-defined 144 ceiling without importing it.
            if action == 'guard-start':
                if self.g.accounting(state, NOW)['native_goal_starts'] + self.l.start_commitments(state) > 144:
                    raise RuntimeError('native start commitments/cap')
            return self.l.apply(state, action, request)
        def strings(value):
            if isinstance(value, dict):
                for k, v in value.items():
                    yield k; yield from strings(v)
            elif isinstance(value, list):
                for v in value: yield from strings(v)
            elif isinstance(value, str): yield value
        self.g.base = types.SimpleNamespace(validate_state=lambda s: None, auth=self.l.auth,
            accounting=old_accounting, apply=base_apply, admit=self.l.admit, strings=strings,
            base=types.SimpleNamespace(validate_receipt=lambda s, required=False: None))
        self.g.legacy = self.l
        self.g.saved_accounting = old_accounting
        self.g.saved_legacy_auth = self.l.auth
        self.l.accounting = self.g.accounting
        self.state = {'campaign_id': LAB.name, 'clock_start_epoch': self.g.START, 'deadline_epoch': self.g.DEADLINE,
            'closed': False, 'jobs': {}, 'cases': {'old-case': {'birth_epoch': NOW - 200, 'wall_seconds': 3600,
                'occupied_seconds': 5400}}, 'helpers': {}, 'events': [], 'route_reviews': {'route': {'accepted': True,
                'pins': {'runtime': 'a' * 64, 'config': 'b' * 64, 'independent_acceptance': 'c' * 64}}},
            'final_reserved_names': ['final-' + str(i) for i in range(6)], 'evaluator_reserved_names': ['eval'],
            'reservation_by_case': {}, 'occupancy_reconciliation': {'root': 'fixture'}, 'old_closure': {'V9': 'incomplete'}}
        self.state['jobs']['old-job'] = {'case': 'old-case', 'family': 'Z', 'birth_epoch': NOW - 200,
            'hard_deadline_epoch': NOW - 100, 'released_epoch': NOW - 100, 'launch_pending': None,
            'goal_starts': [{'receipt_id': 'old-start'}], 'generated_output_tokens': 1508391, 'status': 'released',
            'outcome': 'failed', 'quiescence': {'native_quiescent': True, 'own_process_group_absent': True, 'receipt_id': 'old-quiet'}}
        source = ref(self.g.SOURCE)
        write(self.g.MANIFEST, {'source': source, 'authority': ref(self.g.AUTHORITY), 'status': 'SOURCE_READY_REQUIRES_INDEPENDENT_REVIEW'})
        write(self.g.REVIEW, {'schema': 'pm.er8.output-guard-independent-review.v1', 'accepted': True, 'independent': True,
            'source': source, 'source_manifest': ref(self.g.MANIFEST), 'authority': ref(self.g.AUTHORITY)})
        write(self.g.ACCEPTANCE, {'schema': 'pm.er8.output-guard-source-acceptance.v1', 'root_authority': True,
            'accepted': True, 'independent_source_review_accepted': True, 'source': source,
            'source_manifest': ref(self.g.MANIFEST), 'authority': ref(self.g.AUTHORITY),
            'independent_review': ref(self.g.REVIEW), 'accepted_epoch': NOW - 20})
        self.request = {'receipt_id': 'fixture-install', 'root_authority': True, 'authority': ref(self.g.AUTHORITY),
            'source_acceptance': ref(self.g.ACCEPTANCE), 'current_quiet': {}, 'campaign_id': LAB.name,
            'original_start_epoch': self.g.START, 'campaign_deadline_epoch': self.g.DEADLINE,
            'new_warning': 1200000, 'new_stop': 2000000}
        self.quiet()

    def quiet(self):
        write(self.g.QUIET, {'schema': 'pm.er8.output-guard-current-quiet.v1', 'root_authority': True,
            'scope': 'all-candidate-admission-operator-execution-owned-groups', 'campaign_id': LAB.name,
            'observed_epoch': NOW - 1, 'ledger_state_sha256': self.g.canonical_sha(self.state),
            **{k: True for k in ('scheduler_absent', 'native_quiescent', 'parents_absent', 'actors_absent', 'permits_settled',
                'native_enrollment_receipts_verified', 'held_process_group_receipts_verified')}})
        self.request['current_quiet'] = ref(self.g.QUIET)

    def install(self):
        return self.g.apply(self.state, 'amend-output-guard', self.request)

    def new_request(self):
        return {'case': 'new-case', 'job': 'new-job', 'family': 'Z', 'route': 'route',
            'pins': self.state['route_reviews']['route']['pins'], 'component_seconds': 100, 'component_responses': 160,
            'case_wall_seconds': 3600, 'case_occupied_seconds': 5400, 'source_access': {'fixture': True},
            'current_stages': ['research']}

    def birth(self):
        self.g.apply(self.state, 'case-birth', {'case': 'new-case', 'birth_epoch': NOW,
            'wall_seconds': 3600, 'occupied_seconds': 5400})

    def test_valid_once_install_preserves_every_old_value(self):
        before = copy.deepcopy(self.state)
        self.assertTrue(self.g.accounting(self.state, NOW)['candidate_output_stop'])
        r = self.install()
        self.assertEqual({k: v for k, v in self.state.items() if k != self.g.RECEIPT_KEY}, before)
        self.assertEqual(r['effective_epoch'], NOW)
        self.assertFalse(self.g.accounting(self.state, NOW)['candidate_output_stop'])
        self.assertEqual(self.g.auth()['limits']['candidate_output_stop'], 1500000)
        with self.assertRaises(RuntimeError): self.install()

    def test_source_acceptance_missing_drift_and_literal_root_reject(self):
        for key in ('accepted', 'root_authority', 'independent_source_review_accepted'):
            a = json.loads(self.g.ACCEPTANCE.read_text()); a[key] = 1
            write(self.g.ACCEPTANCE, a); self.request['source_acceptance'] = ref(self.g.ACCEPTANCE)
            with self.subTest(key=key), self.assertRaises(RuntimeError): self.install()
        self.g.ACCEPTANCE.unlink()
        with self.assertRaises(FileNotFoundError): self.install()
        self.assertNotIn(self.g.RECEIPT_KEY, self.state)

    def test_authority_source_and_quiet_drift_reject(self):
        self.request['authority']['sha256'] = '0' * 64
        with self.assertRaises(RuntimeError): self.install()
        self.request['authority'] = ref(self.g.AUTHORITY)
        self.g.AUTHORITY.write_text('{}')
        with self.assertRaises(RuntimeError): self.install()

    def test_active_job_pending_permit_expired_closed_overbudget_reject(self):
        pristine = copy.deepcopy(self.state)
        for kind in ('active', 'pending', 'closed', 'starts', 'occupied', 'output'):
            self.state = copy.deepcopy(pristine)
            if kind == 'active': self.state['jobs']['old-job']['released_epoch'] = None
            if kind == 'pending': self.state['jobs']['old-job']['launch_pending'] = {'permit_id': 'p'}
            if kind == 'closed': self.state['closed'] = True
            if kind == 'starts': self.state['jobs']['old-job']['goal_starts'] *= 145
            if kind == 'occupied': self.state['reservation_by_case']['reserved'] = {'native_starts': 1, 'occupied_seconds': 172801, 'completed': False}
            if kind == 'output': self.state['jobs']['old-job']['generated_output_tokens'] = 2000000
            self.quiet(); before = copy.deepcopy(self.state)
            with self.subTest(kind=kind), self.assertRaises(RuntimeError): self.install()
            self.assertEqual(self.state, before)
        self.state = copy.deepcopy(pristine); self.quiet()
        with patch.object(self.l.time, 'time', return_value=self.g.DEADLINE), self.assertRaises(RuntimeError): self.install()

    def test_nonfinite_original_clock_and_birth_reject(self):
        for value in (float('nan'), float('inf'), True):
            state = copy.deepcopy(self.state); state['clock_start_epoch'] = value
            with self.subTest(value=value), self.assertRaises(RuntimeError): self.g.apply(state, 'status', {})
        self.install()
        for value in (float('nan'), float('inf'), True, NOW - 1, NOW + 1):
            with self.subTest(value=value), self.assertRaises(RuntimeError):
                self.g.apply(self.state, 'case-birth', {'case': 'bad', 'birth_epoch': value, 'wall_seconds': 3600, 'occupied_seconds': 5400})
        with patch.object(self.l.time, 'time', return_value=float('nan')), self.assertRaises(RuntimeError): self.g.apply(self.state, 'status', {})

    def test_new_admit_guard_boundary_and_old_identity_reject(self):
        self.install(); self.birth()
        self.g.apply(self.state, 'admit', self.new_request())
        # Frozen fixture guard has literal48; this fixture remains below both48 and accepted144.
        self.assertTrue(self.g.apply(self.state, 'guard-start', {'job': 'new-job', 'permit_id': 'p'})['allowed'])
        self.g.apply(self.state, 'start-absent', {'job': 'new-job', 'permit_id': 'p', 'native_activation_absent': True, 'receipt_id': 'absent'})
        self.g.apply(self.state, 'usage', {'job': 'old-job', 'generated_output_tokens': 1999999})
        self.assertFalse(self.g.apply(self.state, 'status', {})['candidate_output_stop'])
        self.g.apply(self.state, 'usage', {'job': 'old-job', 'generated_output_tokens': 2000000})
        self.assertTrue(self.g.apply(self.state, 'status', {})['candidate_output_stop'])
        with self.assertRaises(RuntimeError): self.g.apply(self.state, 'guard-start', {'job': 'new-job', 'permit_id': 'q'})
        with self.assertRaises(RuntimeError): self.g.apply(self.state, 'guard-start', {'job': 'old-job', 'permit_id': 'r'})
        req = self.new_request(); req.update(case='old-case', job='different')
        with self.assertRaises(RuntimeError): self.g.apply(self.state, 'admit', req)

    def test_failed_old_usage_monotonic_and_release_delegation(self):
        self.install(); self.birth(); self.g.apply(self.state, 'admit', self.new_request())
        self.g.apply(self.state, 'usage', {'job': 'old-job', 'generated_output_tokens': 1600000})
        with self.assertRaises(ValueError): self.g.apply(self.state, 'usage', {'job': 'old-job', 'generated_output_tokens': 1599999})
        result = self.g.apply(self.state, 'release', {'job': 'new-job', 'quiescence': {'native_quiescent': True,
            'own_process_group_absent': True, 'receipt_id': 'release'}})
        self.assertEqual(result['generated_output_tokens_lower_bound'], 1600000)
        self.assertEqual(result['output_guard_version'], self.g.VERSION)
        self.assertEqual(self.state['jobs']['old-job']['outcome'], 'failed')
        self.assertEqual(self.state['old_closure'], {'V9': 'incomplete'})

    def test_other_actions_delegated_and_selected_flags_returned(self):
        self.install()
        req = {'category': 'wait', 'seconds': 2}
        result = self.g.apply(self.state, 'event', req)
        self.assertEqual(self.base_calls[-1], ('event', req))
        self.assertEqual(result['candidate_output_stop_threshold'], 2000000)
        self.assertEqual(self.g.apply(self.state, 'reserve-attempt-successors', {'fixture': True})['output_guard_version'], self.g.VERSION)
        self.assertEqual(self.base_calls[-1], ('reserve-attempt-successors', {'fixture': True}))
        self.assertEqual(self.g.auth()['limits'], self.limits)

    def test_installed_receipt_drift_and_stale_quiet_reject(self):
        q = json.loads(self.g.QUIET.read_text()); q['observed_epoch'] = NOW - 61
        write(self.g.QUIET, q); self.request['current_quiet'] = ref(self.g.QUIET)
        with self.assertRaises(RuntimeError): self.install()
        self.quiet(); self.install()
        self.state[self.g.RECEIPT_KEY]['stop'] = 2100000
        with self.assertRaises(RuntimeError): self.g.accounting(self.state, NOW)

    def test_duplicate_json_and_nonfinite_json_reject(self):
        for text in ('{"x":1,"x":2}', '{"x":NaN}', '[]'):
            with self.subTest(text=text), self.assertRaises(RuntimeError): self.g.object_bytes(text)


if __name__ == '__main__':
    unittest.main(verbosity=2)
