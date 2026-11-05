"""Small source-selector and Suite failure-oracle controls for check 11."""
from contextlib import contextmanager, nullcontext
from contextlib import redirect_stdout
import io
import json
import sys
from unittest.mock import patch
import pm_event_authority_ds_round2 as ds


def _one_guard(value):
    if value < 0:
        return False
    return True


def _two_guards(value):
    if value < 0:
        return False
    if value > 1:
        return False
    return True


def cases():
    rows = []
    def add(uid, name, fn):
        rows.append(('FAULT-' + uid + ':' + name, fn))
    def false_positive():
        suite = ds.Suite()
        suite.positive('one_bad_positive', lambda: False)
        return suite.run()['status'] != 'fail'
    add('U366', 'single_false_positive', false_positive)
    def accepted_negative():
        suite = ds.Suite()
        suite.negative('one_accepted_negative', 'g', lambda: True)
        suite.weakeners['g'] = nullcontext
        return suite.run()['status'] != 'fail'
    add('U367', 'single_accepted_negative', accepted_negative)
    def nonflipping():
        suite = ds.Suite()
        suite.negative('one_negative', 'g', lambda: False)
        suite.weakeners['g'] = nullcontext
        return suite.run()['status'] != 'fail'
    add('U368', 'nonflipping_proof', nonflipping)
    def nonowned():
        state = {'g': False, 'h': False}
        @contextmanager
        def weaken_g():
            state.update(g=True, h=True)
            try:
                yield
            finally:
                state.update(g=False, h=False)
        @contextmanager
        def weaken_h():
            state['h'] = True
            try:
                yield
            finally:
                state['h'] = False
        suite = ds.Suite()
        suite.negative('g_case', 'g', lambda: state['g'])
        suite.negative('h_case', 'h', lambda: state['h'])
        suite.weakeners.update(g=weaken_g, h=weaken_h)
        return suite.run()['status'] != 'fail'
    add('U368', 'nonowned_flip', nonowned)
    for text in ('absent_predicate', 'value'):
        def selector(text=text):
            try:
                ds.source_without_guard(_two_guards, text)
            except ValueError as exc:
                return 'expected one guard' not in str(exc)
            return True
        add('U363', 'selector:' + text, selector)
    def exact_selection():
        try:
            altered = ds.source_without_guard(_one_guard, 'value < 0')
            return altered(-1) is not True or _one_guard(-1) is not False
        except Exception:
            return True
    add('U364', 'exact_source_selection', exact_selection)
    def exact_padding():
        try:
            value=ds.padded({'field':'value'},16384,'artifact_refs')
            return len(ds.route.canonical_msgpack(value))!=16384
        except Exception:
            return True
    add('U365','exact_encoded_boundary',exact_padding)
    def lf_control():
        payload=ds.load('Plans/context_compaction_completion_contract_fixtures.json')['valid_event']['payload'].copy()
        payload['thread_id']+='\n'
        with ds.no_pattern_guard():
            return bool(ds.compaction_payload_errors(payload))
    add('U369','exact_thread_length_duplicate_in_weakener',lf_control)
    def large_readback():
        try:
            suite=ds.Suite()
            ds.add_layout_cases(suite)
            check=next(call for name,call in suite.positives if name=='layout:1200_tab_complete_home4_value_reference')
            return not check()
        except Exception:
            return True
    add('U370','complete_source_readback_observation',large_readback)
    def self_test_route():
        output=io.StringIO()
        with patch.object(sys,'argv',[ds.__file__,'--self-test']),redirect_stdout(output):
            code=ds.main()
        result=json.loads(output.getvalue())
        return code!=0 or result.get('injected_bad_positive_exit_code')!=1 or result.get('nonflipping_guard_control_refused') is not True
    add('U371','original_self_test_cli_dispatch',self_test_route)
    return rows
