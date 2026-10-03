"""Offline tests: mock states only; never transaction/save against live ledger."""
import copy
import hashlib
import importlib.util
import json
import io
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

HERE = Path(__file__).resolve().parent
REAL_CAMPAIGN = HERE.parents[1]
# Every imported dependency is an unchanged full-source copy. No live ledger
# state/lock or metadata is read. Only the wrapper's campaign path literal is
# relocated in its compiled test copy; production source bytes stay unchanged.
FIXTURE_DIR = tempfile.TemporaryDirectory(prefix='offline-api-', dir=HERE)
FIXTURE_CAMPAIGN = Path(FIXTURE_DIR.name) / REAL_CAMPAIGN.name
COPY_PATHS = [
    'AUTHORIZATION.json', 'ops/accounting-v1/slot_ledger.py',
    'ops/recovery-v1/ledger_resume.py', 'ops/recovery-v1/ledger_overlay.py',
    'ops/recovery-v1/RESUME_20261002.json',
    'ops/recovery-v1/HELPER_CONCURRENCY_AUTHORITY_20261003.json',
    'ops/recovery-v1/AUTHORITY_AMENDMENT.json',
    'ops/recovery-v1/state.before-policy-amendment.json',
    'ops/helper-concurrency-v2/ledger_helper_concurrency_v2.py',
]
for relative in COPY_PATHS:
    target = FIXTURE_CAMPAIGN / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes((REAL_CAMPAIGN / relative).read_bytes())
FIXTURE_API = FIXTURE_CAMPAIGN / 'ops/helper-concurrency-v2/ledger_helper_concurrency_v2.py'

def load(name, path):
    spec = importlib.util.spec_from_file_location(name, str(path))
    module = importlib.util.module_from_spec(spec)
    old = sys.dont_write_bytecode
    try:
        sys.dont_write_bytecode = True
        source = spec.loader.get_source(name)
        if path.name == 'ledger_helper_concurrency_v2.py':
            literal = 'CAMPAIGN = Path(' + repr(str(REAL_CAMPAIGN)) + ')'
            assert source.count(literal) == 1
            source = source.replace(literal, 'CAMPAIGN = Path(' + repr(str(FIXTURE_CAMPAIGN)) + ')')
        exec(compile(source, str(path), 'exec'), module.__dict__)
    finally:
        sys.dont_write_bytecode = old
    return module

m = load('offline_helper_wrapper', FIXTURE_API)
frozen = load('offline_untouched_resume', m.API)
NOW = 1790996060.0
REQUEST = {'root_authority': True, 'authority_path': str(m.AUTHORITY),
           'authority_sha256': m.AUTHORITY_SHA}

class ConcurrencyTests(unittest.TestCase):
    def setUp(self):
        # Full historical API source, historical snapshot read-only; mock successor state.
        self.state = json.loads((m.RECOVERY / 'state.before-policy-amendment.json').read_text())
        frozen.overlay.amend_state(self.state, True)
        r = frozen.resume
        self.state['deadline_epoch'] = r['prospective_deadline_epoch']
        self.state['user_resume_authority'] = {
            'path': str(frozen.RESUME), 'sha256': frozen.RESUME_SHA,
            'pause_seconds': r['authorized_excluded_seconds'],
            'prospective_deadline_epoch': r['prospective_deadline_epoch']}
        self.state['helpers'] = {f'old-{i}': {'ended_epoch': 1} for i in range(40)}

    def call(self, action, request, state=None, now=NOW):
        with patch.object(m.legacy.time, 'time', return_value=now):
            return m.apply(self.state if state is None else state, action, request)

    def install(self):
        return self.call('amend-helper-concurrency', REQUEST)

    def test_auth_only_helper_count_differs(self):
        before = frozen.auth()
        after = m.auth()
        self.assertEqual(before['limits']['active_helpers'], 6)
        self.assertEqual(after['limits']['active_helpers'], 12)
        after['limits']['active_helpers'] = 6
        self.assertEqual(before, after)
        self.assertIsNone(m.auth()['limits']['helpers_task_starts'])
        self.assertIsNone(m.auth()['limits']['repair_versions_per_boundary'])
        self.assertEqual(m.auth()['limits']['active_candidates_by_family'], dict(M=2,Z=2,L=2))
        self.assertEqual(m.auth()['limits']['native_goal_starts'], 144)
        self.assertEqual(m.auth()['limits']['occupied_candidate_slot_seconds'], 172800)
        self.assertEqual(m.auth()['root_work_clock_deadline_epoch'],1791013030.8303788)

    def test_install_changes_one_key_only(self):
        before = copy.deepcopy(self.state)
        receipt = self.install()
        self.assertEqual(set(self.state) - set(before), {m.RECEIPT_KEY})
        for key in before:
            self.assertEqual(self.state[key], before[key], key)
        self.assertEqual(receipt['effective_epoch'], NOW)
        self.assertEqual(receipt['authority_sha256'], m.AUTHORITY_SHA)

    def test_frozen_six_and_successor_twelve(self):
        frozen_state = copy.deepcopy(self.state)
        with patch.object(frozen.legacy.time, 'time', return_value=NOW):
            for i in range(6):
                frozen.apply(frozen_state,'helper-start',{'helper':f'oldnew-{i}','root_authority':True})
            with self.assertRaises(RuntimeError):
                frozen.apply(frozen_state,'helper-start',{'helper':'seventh','root_authority':True})
        self.install()
        for i in range(12):
            self.call('helper-start', {'helper':f'new-{i}','root_authority':True})
        self.assertEqual(m.accounting(self.state,NOW)['active_helpers'],12)
        before=copy.deepcopy(self.state)
        with self.assertRaises(RuntimeError):
            self.call('helper-start',{'helper':'thirteenth','root_authority':True})
        self.assertEqual(self.state,before)
        self.assertEqual(len(self.state['helpers']),52) # no cumulative helper cap restored

    def test_before_receipt_starts_fail_closed(self):
        before=copy.deepcopy(self.state)
        with self.assertRaises(RuntimeError):
            self.call('helper-start',{'helper':'uninstalled','root_authority':True})
        self.assertEqual(self.state,before)

    def test_duplicate_install_no_mutation(self):
        self.install(); before=copy.deepcopy(self.state)
        with self.assertRaises(RuntimeError):self.install()
        self.assertEqual(self.state,before)

    def test_wrong_install_requests(self):
        for key,value in [('root_authority',False),('root_authority',1),
                          ('authority_path',str(m.AUTHORITY)+'x'),('authority_sha256','0'*64)]:
            with self.subTest(key=key,value=value):
                request={**REQUEST,key:value};before=copy.deepcopy(self.state)
                with self.assertRaises(RuntimeError):self.call('amend-helper-concurrency',request)
                self.assertEqual(self.state,before)
        with self.assertRaises(RuntimeError):self.call('amend-helper-concurrency',{**REQUEST,'extra':True})

    def test_receipt_invalid_fields(self):
        self.install()
        valid=copy.deepcopy(self.state[m.RECEIPT_KEY])
        for key,value in [('schema','bad'),('authority_path','bad'),('authority_sha256','0'*64),
                          ('root_authority',False),('root_authority',1),('active_helpers',13),
                          ('previous_active_helpers',5),('effective_epoch',float('nan')),
                          ('effective_epoch',float('inf')),('effective_epoch',True),
                          ('effective_epoch',1790996050.0)]:
            with self.subTest(key=key,value=value):
                self.state[m.RECEIPT_KEY]={**valid,key:value}
                with self.assertRaises(RuntimeError):m.accounting(self.state,NOW)
        self.state[m.RECEIPT_KEY]=None
        with self.assertRaises(RuntimeError):m.accounting(self.state,NOW)

    def test_install_nonfinite_or_deadline_clock_rejected(self):
        for epoch in [float('nan'),float('inf'),True,1790996050,1791013030.8303788]:
            before=copy.deepcopy(self.state)
            with self.assertRaises(RuntimeError):self.call('amend-helper-concurrency',REQUEST,now=epoch)
            self.assertEqual(self.state,before)

    def test_pin_and_symlink_fail_closed(self):
        with tempfile.TemporaryDirectory(dir=HERE) as d:
            path=Path(d)/'source';path.write_bytes(b'x')
            with self.assertRaises(RuntimeError):m.pinned(path,'0'*64)
            link=Path(d)/'link';link.symlink_to(path)
            with self.assertRaises(RuntimeError):m.pinned(link,hashlib.sha256(b'x').hexdigest())
            directory=Path(d)/'dir';directory.mkdir();file=directory/'file';file.write_bytes(b'x')
            dirlink=Path(d)/'dirlink';dirlink.symlink_to(directory)
            with self.assertRaises(RuntimeError):m.pinned(dirlink/'file',hashlib.sha256(b'x').hexdigest())
        with patch.dict(m.PINS,{m.API:'0'*64}):
            with self.assertRaises(RuntimeError):m.auth()

    def test_wrong_authority_schema_root_nonfinite(self):
        original=Path.read_text
        valid=json.loads(m.AUTHORITY.read_text())
        for key,value in [('schema','bad'),('root_authority',False),('root_authority',1),
                          ('recorded_epoch',float('nan')),('campaign_deadline_epoch',float('inf'))]:
            invalid={**valid,key:value}
            def read(path,*args,**kwargs):
                return json.dumps(invalid) if path==m.AUTHORITY else original(path,*args,**kwargs)
            with patch.object(m,'check_pins'),patch.object(Path,'read_text',read):
                with self.assertRaises(RuntimeError):m.authority()

    def test_old_resume_validation_retained(self):
        for key,value in [('clock_start_epoch',1),('deadline_epoch',1),('campaign_id','bad'),
                          ('authorization_sha256','bad'),('user_resume_authority',{})]:
            state=copy.deepcopy(self.state);state[key]=value
            with self.assertRaises(RuntimeError):m.accounting(state,NOW)

    def test_helper_end_exact_old_semantics(self):
        self.install()
        self.call('helper-start',{'helper':'end-test','root_authority':True})
        old=copy.deepcopy(self.state)
        proof={'helper':'end-test','root_authority':True,'actual_end_epoch':NOW,
               'positive_frozen_source_manifest_sha256':'a'*64,'receipt_id':'offline-proof'}
        with patch.object(frozen.legacy.time,'time',return_value=NOW+1):
            frozen.apply(old,'helper-end',proof)
        self.call('helper-end',proof,now=NOW+1)
        self.assertEqual(old['helpers'],self.state['helpers'])
        self.assertEqual(self.state['helpers']['end-test']['end_receipt'],proof)
        with self.assertRaises(RuntimeError):self.call('helper-end',proof,now=NOW+2)

    def test_native_admission_unchanged_with_twelve_helpers(self):
        self.install()
        for i in range(12):self.call('helper-start',{'helper':f'native-{i}','root_authority':True})
        pins={'runtime':'a'*64,'config':'b'*64,'independent_acceptance':'c'*64}
        self.state['route_reviews']['offline']={'accepted':True,'pins':pins}
        self.state['cases']['offline']={'birth_epoch':NOW,'wall_seconds':480,'occupied_seconds':480}
        r={'job':'offline','case':'offline','family':'Z','route':'offline','pins':pins,
           'component_seconds':480,'component_responses':64,'case_wall_seconds':480,
           'case_occupied_seconds':480,'source_access':{'mode':'offline'},'current_stages':['offline']}
        old=copy.deepcopy(self.state)
        oldresult=frozen.admit(old,r,NOW)
        result=m.admit(self.state,r,NOW)
        self.assertEqual(result,oldresult)
        self.assertEqual(self.state,old)
        r['job']='excess';r['component_seconds']=481
        for api,state in [(m,self.state),(frozen,old)]:
            with self.assertRaises((RuntimeError,ValueError)):api.admit(state,r,NOW)

    def test_accounting_status_and_unknown_actions_identical(self):
        self.install()
        original=copy.deepcopy(self.state)
        self.assertEqual(m.accounting(self.state,NOW),frozen.accounting(self.state,NOW))
        self.assertEqual(self.call('status',{}),frozen.accounting(self.state,NOW))
        self.assertEqual(self.state,original)
        with self.assertRaises(ValueError):self.call('unknown-action',{})
        with self.assertRaises(ValueError):frozen.apply(copy.deepcopy(self.state),'unknown-action',{})

    def test_default_birth_survives_later_clock_rollback(self):
        self.install()
        request = {'helper':'rollback-default','root_authority':True}
        original = copy.deepcopy(request)
        with patch.object(m.legacy.time,'time',side_effect=[NOW,NOW,NOW-1]):
            m.apply(self.state,'helper-start',request)
        self.assertEqual(self.state['helpers']['rollback-default']['started_epoch'],NOW)
        self.assertEqual(request,original)

    def test_default_birth_survives_later_nan_clock(self):
        self.install()
        request = {'helper':'nan-default','root_authority':True}
        original = copy.deepcopy(request)
        with patch.object(m.legacy.time,'time',side_effect=[NOW,NOW,float('nan')]):
            m.apply(self.state,'helper-start',request)
        self.assertEqual(self.state['helpers']['nan-default']['started_epoch'],NOW)
        self.assertEqual(request,original)

    def test_explicit_birth_forwarded_unchanged_without_caller_mutation(self):
        self.install()
        request = {'helper':'explicit-birth','root_authority':True,
                   'started_epoch':NOW,'proof':{'receipt':'offline'}}
        original = copy.deepcopy(request)
        with patch.object(m.legacy.time,'time',side_effect=[NOW+1,NOW+2,NOW+3]):
            m.apply(self.state,'helper-start',request)
        self.assertEqual(self.state['helpers']['explicit-birth']['started_epoch'],NOW)
        self.assertEqual(request,original)
        self.assertIs(self.state['helpers']['explicit-birth']['proof'],request['proof'])

    def test_default_birth_uses_forwarded_copy(self):
        self.install()
        request = {'helper':'copy-check','root_authority':True}
        captured = []
        delegate = m.resume_api.apply
        def observe(state,action,forwarded):
            captured.append(forwarded)
            return delegate(state,action,forwarded)
        with patch.object(m.resume_api,'apply',side_effect=observe),patch.object(m.legacy.time,'time',return_value=NOW):
            m.apply(self.state,'helper-start',request)
        self.assertIsNot(captured[0],request)
        self.assertNotIn('started_epoch',request)
        self.assertEqual(captured[0]['started_epoch'],NOW)

    def test_copy_fixture_has_no_live_ledger_state(self):
        self.assertFalse(m.legacy.STATE.exists())
        self.assertFalse(m.legacy.LOCK.exists())
        self.assertTrue(m.API.is_relative_to(FIXTURE_CAMPAIGN))
        for relative in COPY_PATHS:
            self.assertEqual((FIXTURE_CAMPAIGN/relative).read_bytes(),
                             (REAL_CAMPAIGN/relative).read_bytes())

    def test_import_and_cli_status_readonly(self):
        tracked=list(m.PINS)
        before={str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in tracked if p.exists()}
        original_open=io.open
        def readonly_open(file,mode='r',*args,**kwargs):
            if any(flag in mode for flag in 'wxa+'):
                raise AssertionError('read-only path attempted a write')
            return original_open(file,mode,*args,**kwargs)
        with patch.object(io,'open',readonly_open):
            isolated=load('offline_import_readonly',FIXTURE_API)
        with tempfile.TemporaryDirectory(dir=HERE) as d:
            statefile=Path(d)/'state.json';statefile.write_text(json.dumps(self.state))
            original=statefile.read_bytes()
            with patch.object(isolated.legacy,'STATE',statefile),patch.object(sys,'argv',['wrapper','status']),patch('builtins.print'),patch.object(io,'open',readonly_open),patch.object(isolated,'transaction',side_effect=AssertionError('status transaction forbidden')):
                isolated.main()
            self.assertEqual(statefile.read_bytes(),original)
            self.assertEqual(list(Path(d).iterdir()),[statefile])
        after={str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in tracked if p.exists()}
        self.assertEqual(before,after)

if __name__=='__main__':unittest.main(verbosity=2)
