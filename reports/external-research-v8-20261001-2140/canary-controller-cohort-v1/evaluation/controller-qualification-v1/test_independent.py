"""Independent metadata-only fixtures; all writes stay in this review directory."""
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import sys
import tempfile
import types
import unittest
from unittest.mock import patch

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
SOURCE = HERE.parents[1] / 'ops/integrated-dispatch-v1'
sys.path.insert(0, str(SOURCE))
import common
import parent_receipt


class ParentReceiptFixtures(unittest.TestCase):
    def run_fixture(self, *, outside=2., finalizer_rc=0, absent=True,
                    at_cutoff=False, overlapping=False, counted_delta=0.,
                    occupied=10.):
        n = 10**9
        start = 100*n
        end = start + int((30+outside)*n)
        cutoff = end if at_cutoff else end+n
        intervals = [(start, start+10*n), (start+10*n, start+20*n),
                     (start+20*n, start+30*n)]
        if overlapping:
            intervals[1] = (start+9*n, start+20*n)
        complete = {'original_case_start_monotonic_ns':start,
                    'stage_receipts':[{'native_wrapper_launch_monotonic_ns':a,
                                      'native_quiescence_observed_monotonic_ns':b}
                                     for a,b in intervals],
                    'actual_final_proposal':{'path':'/synthetic/FINAL_PROPOSAL.md','sha256':'a'*64}}
        settlement = {'original_case_deadline_monotonic_ns':cutoff,
                      'last_charged_host_monotonic_ns':end-1000}
        case = 'V8-BIO-C-Z'
        jobs = {str(i):{'case':case,'birth_epoch':1.,'released_epoch':1.+occupied/3}
                for i in range(3)}
        module = types.SimpleNamespace(transaction=lambda: contextlib.nullcontext({'jobs':jobs}))
        args = types.SimpleNamespace(run_root=str(HERE/'fixture-runtime'),case=case,
              case_ns=start,deadline_ns=cutoff,finalizer_pid=999999,
              finalizer_returncode=finalizer_rc,finalizer_exit_ns=end)
        mutations=[]
        def read(path):
            return complete if Path(path).name=='CASE_DEFERRED_CLOSE.json' else settlement
        def charged(*args,**kwargs):
            return {'outside_native_seconds_by_case':{case:outside+counted_delta}}
        with patch.object(parent_receipt,'armed'), patch.object(parent_receipt,'read_json',side_effect=read), \
             patch.object(parent_receipt,'group_absent',return_value=absent), \
             patch.object(parent_receipt,'charge',side_effect=charged), \
             patch.object(parent_receipt,'ledger_module',return_value=module), \
             patch.object(parent_receipt,'ledger',side_effect=lambda a,r:mutations.append((a,r))), \
             patch.object(parent_receipt,'atomic',side_effect=lambda p,r:mutations.append(('atomic',r))):
            parent_receipt.finalize(args)
        return mutations

    def test_parent_positive_end_and_finalizer_tail(self):
        mutations=self.run_fixture()
        self.assertEqual(mutations[-1][0],'case-complete')
        receipt=next(value for action,value in mutations if action=='atomic')
        self.assertEqual(receipt['actual_nonoverlapping_outside_native_seconds'],2.)
        self.assertTrue(receipt['all_case_execution_closed_before_cutoff'])

    def test_failed_finalizer_cannot_complete(self):
        with self.assertRaises(ValueError):self.run_fixture(finalizer_rc=126)

    def test_live_finalizer_group_cannot_complete(self):
        with self.assertRaises(ValueError):self.run_fixture(absent=False)

    def test_case_end_at_original_cutoff_cannot_complete(self):
        with self.assertRaises(ValueError):self.run_fixture(at_cutoff=True)

    def test_overlapping_native_intervals_cannot_hide_outside(self):
        with self.assertRaises(ValueError):self.run_fixture(overlapping=True)

    def test_unreconciled_host_gap_cannot_complete(self):
        with self.assertRaises(ValueError):self.run_fixture(counted_delta=.01)

    def test_outside_cap_at_300_cannot_complete(self):
        with self.assertRaises(ValueError):self.run_fixture(outside=300.)

    def test_below_300_passes(self):
        self.run_fixture(outside=299.)

    def test_occupied_cap_excess_cannot_complete(self):
        with self.assertRaises(ValueError):self.run_fixture(occupied=5401.)

    def test_occupied_cap_inclusive_5400_passes(self):
        self.run_fixture(occupied=5400.)


def authored_suite():
    spec=importlib.util.spec_from_file_location('authored_controller_tests',SOURCE/'tests/test_controller.py')
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    original=tempfile.TemporaryDirectory
    def local_temp(*args,**kwargs):
        kwargs['dir']=str(HERE)
        return original(*args,**kwargs)
    module.tempfile.TemporaryDirectory=local_temp
    return unittest.defaultTestLoader.loadTestsFromModule(module)


if __name__=='__main__':
    suite=unittest.TestSuite([authored_suite(),unittest.defaultTestLoader.loadTestsFromTestCase(ParentReceiptFixtures)])
    output=io.StringIO()
    result=unittest.TextTestRunner(stream=output,verbosity=2).run(suite)
    (HERE/'offline-tests.txt').write_text(output.getvalue())
    (HERE/'offline-tests.json').write_text(json.dumps({'schema':'er8.controller.independent-offline-tests.v1',
       'tests_run':result.testsRun,'failures':len(result.failures),'errors':len(result.errors),
       'passed':result.wasSuccessful(),'models_called':False,'providers_called':False,
       'fixtures':'generic metadata and harmless Python OS lifetimes only; authored fixture temp dirs redirected into review ownership'},indent=2)+'\n')
    print(output.getvalue())
    raise SystemExit(0 if result.wasSuccessful() else 1)
