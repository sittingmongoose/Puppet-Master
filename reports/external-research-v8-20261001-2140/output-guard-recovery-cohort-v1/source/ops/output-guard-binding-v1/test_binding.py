"""Source binding metadata fixtures; no live ledger/API/native/SDK imports."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

HERE = Path(__file__).resolve().parent
LAB = HERE.parents[1]
NOW = 1791005850.0

def load(path):
    spec = importlib.util.spec_from_file_location('isolated_binding', str(path))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

def write(path, value):
    path.write_text(json.dumps(value, indent=2, allow_nan=False) + '\n')


class BindingTests(unittest.TestCase):
    def setUp(self):
        self.b = load(HERE / 'control_binding.py')
        self.temp = tempfile.TemporaryDirectory(prefix='er8-output-binding-fixture-')
        self.addCleanup(self.temp.cleanup); self.t = Path(self.temp.name)
        for key in ('ACCEPTANCE', 'BINDING_REVIEW', 'QUIET', 'GUARD_ACCEPTANCE', 'GUARD_REVIEW', 'GUARD_INSTALL'):
            setattr(self.b, key, self.t / (key + '.json'))
        self.interface = self.b.source_interface(['V8-BIO-COND'])
        self.release = self.b.read(self.b.V7)
        self.release.update(copy.deepcopy(self.interface['fields_for_root_release_after_separate_acceptance']))
        self.release['selected_positive_files'].update(self.b.read(HERE / 'integrated-controller/SOURCE_FREEZE.json')['closure_sha256'])
        review = {'schema': 'pm.er8.output-guard-control-binding-independent-review.v1', 'accepted': True,
            'independent': True, 'controller_snapshot': self.release['controller_snapshot'], 'control': self.b.ref(HERE / 'recovery-control.json')}
        write(self.b.BINDING_REVIEW, review)
        write(self.b.ACCEPTANCE, {'schema': 'pm.er8.output-guard-control-binding-root-acceptance.v1',
            'accepted': True, 'root_authority': True, 'accepted_epoch': NOW - 1,
            'controller_snapshot': review['controller_snapshot'], 'control': review['control'], 'independent_review': self.b.ref(self.b.BINDING_REVIEW)})
        write(self.b.QUIET, {'schema': 'pm.er8.attempt-v7-quiet.v1', 'root_authority': True,
            'predecessor_release': self.interface['predecessor_release'], 'observed_epoch': NOW - 1,
            **{k: True for k in ('scheduler_absent', 'native_quiescent', 'parents_absent', 'actors_absent', 'permits_settled')}})
        self.release['controller_acceptance'] = self.b.ref(self.b.BINDING_REVIEW)
        self.release['attempt_control_binding'] = {'pair_ids': self.interface['selected_pair_ids'],
            'declaration_closure': self.interface['declaration_closure'], 'predecessor_release': self.interface['predecessor_release'],
            'source_acceptance': self.b.ref(self.b.ACCEPTANCE), 'v7_quiet': self.b.ref(self.b.QUIET), 'reservation_receipt_id': 'fixture-reservation'}
        write(self.b.GUARD_REVIEW, {'schema': 'pm.er8.output-guard-independent-review.v1', 'accepted': True,
            'independent': True, 'authority': self.b.ref(self.b.GUARD_AUTHORITY), 'source': self.b.ref(self.b.GUARD_SOURCE),
            'source_manifest': self.b.ref(self.b.GUARD_MANIFEST)})
        write(self.b.GUARD_ACCEPTANCE, {'schema': 'pm.er8.output-guard-source-acceptance.v1', 'accepted': True,
            'root_authority': True, 'independent_source_review_accepted': True, 'accepted_epoch': NOW - 10,
            'authority': self.b.ref(self.b.GUARD_AUTHORITY), 'source': self.b.ref(self.b.GUARD_SOURCE),
            'source_manifest': self.b.ref(self.b.GUARD_MANIFEST), 'independent_review': self.b.ref(self.b.GUARD_REVIEW)})
        self.receipt = {'schema': 'pm.er8.output-guard-install-receipt.v1', 'root_authority': True,
            'authority': self.b.ref(self.b.GUARD_AUTHORITY), 'source_acceptance': self.b.ref(self.b.GUARD_ACCEPTANCE),
            'effective_epoch': NOW - 5, 'warning': 1200000, 'stop': 2000000, 'version': 'prospective-output-guard-v1',
            'preinstall_case_ids': ['old-case'], 'preinstall_job_ids': ['old-job']}
        self.proof()
        self.release['output_guard_binding'] = {'authority': self.b.ref(self.b.GUARD_AUTHORITY),
            'source_acceptance': self.b.ref(self.b.GUARD_ACCEPTANCE), 'install_receipt': self.b.ref(self.b.GUARD_INSTALL)}
        self.state = {'output_guard_authority_v1': copy.deepcopy(self.receipt), 'cases': {}, 'jobs': {},
            'reservation_by_case': {}, 'attempt_lineage_by_case': {}, 'attempt_reservation_receipts': {'fixture-reservation': {
                'schema': 'pm.er8.attempt-reservation-receipt.v1', 'no_old_commitment_retirement': True,
                'recorded_epoch': NOW - 3, 'native_starts_with_commitments': 144, 'occupied_seconds_with_commitments': 172800,
                'request': {'receipt_id': 'fixture-reservation', 'root_authority': True, 'pairs': self.interface['pairs'],
                    'declaration_closure': self.interface['declaration_closure'], 'predecessor_release': self.interface['predecessor_release'], 'caps': self.b.CAPS}}}}
        for pair in self.interface['pairs']:
            for arm in pair['arms']:
                case = arm['new_attempt_case_id']
                self.state['attempt_lineage_by_case'][case] = {**copy.deepcopy(arm), 'attempt_pair_id': pair['attempt_pair_id'],
                    'common_binding': pair['common_binding'], 'caps': self.b.CAPS, 'reservation_receipt_id': 'fixture-reservation'}
                self.state['reservation_by_case'][case] = {'native_starts': 3, 'occupied_seconds': 5400, 'final_job': arm['new_final_job']}
        self.clock = patch.object(self.b.time, 'time', return_value=NOW); self.clock.start(); self.addCleanup(self.clock.stop)

    def proof(self):
        write(self.b.GUARD_INSTALL, {'schema': 'pm.er8.output-guard-install-proof.v1', 'root_authority': True,
            'campaign_id': LAB.name, 'receipt_key': self.b.GUARD_RECEIPT_KEY, 'receipt': self.receipt,
            'receipt_sha256': self.b.canonical_sha(self.receipt)})

    def test_exact_source_copy_route_and_empty_default_queue(self):
        old = LAB / 'ops/attempt-control-binding-v1'
        for n in ('rolling.py','case_supervisor.py','stage_actor.py','external_stage_close.py','external_case_close.py','parent_receipt.py'):
            self.assertEqual((old/'integrated-controller'/n).read_bytes(), (HERE/'integrated-controller'/n).read_bytes())
        before=self.b.read(old/'recovery-control.json'); after=self.b.read(HERE/'recovery-control.json')
        self.assertEqual(after['default_queue'], [])
        for key in set(before)-{'ledger','positive_binding_files'}: self.assertEqual(before[key],after[key])
        self.assertEqual(after['ledger'], self.b.ref(self.b.GUARD_SOURCE))

    def test_positive_unborn_wholepair_binding_no_mutation(self):
        before=copy.deepcopy(self.state)
        self.b.validate_release(self.release, NOW); self.b.validate_ledger_binding(self.release,self.state)
        self.assertEqual(before,self.state)
        self.assertEqual(self.release['case_queue'], ['V8-BIO-COND-C-Z-S8','V8-BIO-P-Z-S8'])

    def test_install_missing_state_drift_old_identity_and_early_birth_reject(self):
        for kind in ('missing','drift','case','job','birth'):
            s=copy.deepcopy(self.state); case=self.release['case_queue'][0]
            if kind=='missing': s.pop(self.b.GUARD_RECEIPT_KEY)
            if kind=='drift': s[self.b.GUARD_RECEIPT_KEY]['stop']=2100000
            if kind in ('case','job'):
                self.receipt['preinstall_case_ids' if kind=='case' else 'preinstall_job_ids']=[case if kind=='case' else self.release['allowed_jobs'][0]]
                self.proof();self.release['output_guard_binding']['install_receipt']=self.b.ref(self.b.GUARD_INSTALL)
                s[self.b.GUARD_RECEIPT_KEY]=copy.deepcopy(self.receipt)
            if kind=='birth': s['cases'][case]={'birth_epoch': NOW-6}
            with self.subTest(kind=kind),self.assertRaises(ValueError):self.b.validate_ledger_binding(self.release,s)

    def test_acceptance_install_pin_clock_and_threshold_reject(self):
        for key in ('output_guard_binding','controller_acceptance','resume_ledger','case_queue'):
            r=copy.deepcopy(self.release);r[key]={}
            with self.subTest(key=key),self.assertRaises(ValueError):self.b.validate_release(r,NOW)
        for now in (float('nan'),float('inf'),True,self.b.DEADLINE):
            with self.subTest(now=now),self.assertRaises(ValueError):self.b.validate_release(self.release,now)
        self.receipt['stop']=2100000;self.proof();self.release['output_guard_binding']['install_receipt']=self.b.ref(self.b.GUARD_INSTALL)
        with self.assertRaises(ValueError):self.b.validate_release(self.release,NOW)

    def test_all_63_wholepair_subsets_unchanged_planning_metadata(self):
        ids=[p['logical_pair_id'] for p in self.b.read(self.b.DECLARATION)['pairs']]
        for mask in range(1,64):
            subset=[x for i,x in enumerate(ids) if mask&(1<<i)]
            f=self.b.source_interface(subset)['fields_for_root_release_after_separate_acceptance']
            self.assertEqual(len(f['case_queue']),2*len(subset));self.assertEqual(len(f['allowed_jobs']),6*len(subset))
            self.assertEqual(set(f['case_sources']),set(f['case_queue']))
        for value in ([],['V8-BIO-COND']*2,['foreign']):
            with self.assertRaises(ValueError):self.b.source_interface(value)


if __name__=='__main__':unittest.main(verbosity=2)
