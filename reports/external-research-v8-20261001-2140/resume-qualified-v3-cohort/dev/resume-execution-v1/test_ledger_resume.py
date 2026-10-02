"""Offline metadata fixtures only: no shared transactions or native operations."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'ops/recovery-v1/ledger_resume.py'
spec = importlib.util.spec_from_file_location('er8_resume_fixture', SOURCE)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class ResumeTests(unittest.TestCase):
    def setUp(self):
        self.original = json.loads(m.legacy.STATE.read_text())
        self.state = copy.deepcopy(self.original)
        self.now = m.resume['resume_observed_epoch'] + 100
        self.pins = {'runtime': 'a'*64, 'config': 'b'*64, 'independent_acceptance': 'c'*64}
        self.state['route_reviews']['offline-resume'] = {'accepted': True, 'pins': self.pins}

    def request(self, case='V8-BIO-C-Z', cap=1800):
        return {'job': case+'-research-proposal', 'case': case, 'family': 'Z',
                'route': 'offline-resume', 'pins': self.pins, 'component_seconds': cap,
                'component_responses': 160, 'case_wall_seconds': 3600,
                'case_occupied_seconds': 5400, 'outside_native_cap_seconds': 300,
                'source_access': {'mode': 'offline-only'}, 'current_stages': ['research-proposal'],
                'birth_epoch': self.now, 'birth_monotonic': 1}

    def apply(self, action, request):
        with patch.object(m.legacy.time, 'time', return_value=self.now):
            return m.apply(self.state, action, request)

    def test_auth_changes_only_deadline(self):
        prior = m.prior_auth(); actual = m.auth()
        prior['root_work_clock_deadline_epoch'] = m.resume['prospective_deadline_epoch']
        self.assertEqual(actual, prior)
        self.assertEqual(actual['limits']['native_goal_starts'], 144)
        self.assertEqual(actual['limits']['occupied_candidate_slot_seconds'], 172800)
        self.assertEqual(actual['limits']['active_candidates_by_family'], {'M': 2, 'Z': 2, 'L': 2})
        self.assertEqual(actual['limits']['active_helpers'], 6)
        self.assertEqual(m.legacy.STATE, ROOT/'ops/accounting-v1/state.json')
        self.assertIs(m.transaction, m.overlay.transaction)

    def test_public_status_preserves_every_state_field_and_cost(self):
        before = copy.deepcopy(self.state)
        prior = m.prior_accounting(self.state, self.now)
        after = m.accounting(self.state, self.now)
        self.assertEqual(before, self.state)
        for key in prior:
            if key != 'elapsed_seconds': self.assertEqual(prior[key], after[key])
        self.assertEqual(after['elapsed_seconds'], prior['elapsed_seconds']-m.resume['authorized_excluded_seconds'])
        self.assertEqual(len(self.state['reservation_by_case']), 28)
        self.assertEqual(after['reserved_or_committed_native_starts'], 84)
        self.assertEqual(after['reserved_or_committed_slot_seconds'], 151200)
        self.assertEqual(m.accounting(self.state, m.resume['pause_epoch'])['authorized_user_pause_excluded_seconds'], 0)

    def test_old_cutoff_extension_is_new_birth_only(self):
        self.assertGreater(self.now, m.resume['previous_deadline_epoch'])
        jobs = copy.deepcopy(self.state['jobs'])
        reservations = copy.deepcopy(self.state['reservation_by_case'])
        admitted = self.apply('prepare-admission', self.request())
        self.assertEqual(admitted['birth_epoch'], self.now)
        self.assertEqual(admitted['hard_deadline_epoch'], self.now+1800)
        self.assertEqual(self.state['reservation_by_case'], reservations)
        for key, value in jobs.items(): self.assertEqual(self.state['jobs'][key], value)
        self.assertEqual(self.state['clock_start_epoch'], self.original['clock_start_epoch'])
        self.assertEqual(m.accounting(self.state, self.now)['native_goal_starts'], 3)
        with self.assertRaises(RuntimeError): self.apply('prepare-admission', self.request())
        request = self.request('V8-BIO-WIT-T-Z'); request['birth_epoch'] = m.resume['resume_observed_epoch']-1
        with self.assertRaises(RuntimeError): self.apply('prepare-admission', request)
        with self.assertRaises(RuntimeError): m.admit(self.state, request, self.now, component_birth=request['birth_epoch'])
        oldjob = next(iter(jobs))
        with self.assertRaises(RuntimeError): self.apply('guard-start', {'job': oldjob, 'permit_id': 'offline-old'})

    def test_resume_receipt_required(self):
        for key in ('user_resume_authority', 'deadline_epoch', 'clock_start_epoch'):
            state = copy.deepcopy(self.state); state[key] = None
            with self.assertRaises(RuntimeError): m.apply(state, 'status', {})

    def test_campaign_start_reserve_ceiling_remains(self):
        historical = next(iter(self.state['jobs'].values()))
        historical['goal_starts'] = [{'receipt_id': str(i)} for i in range(59)]
        # Other historical jobs contribute two starts; 61+84 promises >144.
        with self.assertRaises(RuntimeError): self.apply('prepare-admission', self.request())

    def test_occupied_reserve_ceiling_remains(self):
        historical = next(iter(self.state['jobs'].values()))
        historical['released_epoch'] = historical['birth_epoch']+22000
        with self.assertRaises(RuntimeError): self.apply('prepare-admission', self.request())

    def test_family_two_occupied_slots_remain(self):
        self.apply('prepare-admission', self.request())
        self.apply('prepare-admission', self.request('V8-BIO-WIT-T-Z'))
        with self.assertRaises(RuntimeError): self.apply('prepare-admission', self.request('V8-BIO-COND-C-Z'))

    def test_six_live_helpers_remain(self):
        # Isolate simultaneous-cap exercise from supervisor's live helper metadata.
        for helper in self.state['helpers'].values(): helper['ended_epoch'] = 1
        for i in range(6): self.apply('helper-start', {'helper': 'offline-resume-'+str(i), 'root_authority': True})
        with self.assertRaises(RuntimeError): self.apply('helper-start', {'helper': 'offline-resume-seven', 'root_authority': True})

    def test_new_deadline_still_stops_admission(self):
        self.now = m.resume['prospective_deadline_epoch']+1
        with self.assertRaises(RuntimeError): self.apply('prepare-admission', self.request())


if __name__ == '__main__': unittest.main()
