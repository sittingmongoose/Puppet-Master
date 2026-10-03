"""Independent review harness. All campaign file reads map to exact owned copies.
No live transaction, save, native unit, provider, or campaign mutation executes.
"""
from pathlib import Path
import builtins,copy,hashlib,importlib.machinery,importlib.util,io,json,math,sys,tempfile,unittest
from unittest.mock import patch

BASE=Path('LAB_ROOT')
LAB=BASE/'ops/helper-concurrency-review-v2'
COPY=LAB/'sandbox/campaign'
(LAB/'tmp').mkdir(exist_ok=True)
tempfile.tempdir=str(LAB/'tmp')
real_io_open=io.open
real_builtin_open=builtins.open
real_get_source=importlib.machinery.SourceFileLoader.get_source
real_get_code=importlib.machinery.SourceFileLoader.get_code
real_stat=Path.stat
real_is_symlink=Path.is_symlink
real_tempdir=tempfile.TemporaryDirectory

def owned_tempdir(*args,**kwargs):
    kwargs['dir']=mapped(kwargs['dir']) if kwargs.get('dir') is not None else LAB/'tmp'
    assert Path(kwargs['dir']).is_relative_to(LAB)
    return real_tempdir(*args,**kwargs)

def mapped(path):
    if isinstance(path,(str,bytes,Path)):
        p=Path(path)
        try:
            rel=p.relative_to(BASE)
        except ValueError:
            return p
        if not str(rel).startswith('ops/helper-concurrency-review-v2'):
            return COPY/rel
        return p
    return path

def safe_open(fn,path,mode='r',*args,**kwargs):
    q=mapped(path)
    if any(c in mode for c in 'wax+'):
        if not isinstance(q,Path) or not q.is_relative_to(LAB):
            raise AssertionError('write outside owned lab forbidden')
    return fn(q,mode,*args,**kwargs)

def loader_source(loader,name):
    if Path(loader.path).is_relative_to(BASE):
        return real_io_open(mapped(loader.path),encoding='utf-8').read()
    return real_get_source(loader,name)

def loader_code(loader,name):
    if Path(loader.path).is_relative_to(BASE):
        return compile(loader_source(loader,name),loader.path,'exec')
    return real_get_code(loader,name)

def load(name,path):
    spec=importlib.util.spec_from_file_location(name,str(path))
    module=importlib.util.module_from_spec(spec)
    exec(compile(loader_source(spec.loader,name),str(path),'exec'),module.__dict__)
    return module

with patch.object(io,'open',lambda p,mode='r',*a,**kw:safe_open(real_io_open,p,mode,*a,**kw)), \
     patch.object(builtins,'open',lambda p,mode='r',*a,**kw:safe_open(real_builtin_open,p,mode,*a,**kw)), \
     patch.object(Path,'stat',lambda p,*a,**kw:real_stat(mapped(p),*a,**kw)), \
     patch.object(Path,'is_symlink',lambda p:real_is_symlink(mapped(p))), \
     patch.object(importlib.machinery.SourceFileLoader,'get_source',loader_source), \
     patch.object(importlib.machinery.SourceFileLoader,'get_code',loader_code), \
     patch.object(tempfile,'TemporaryDirectory',owned_tempdir):
    author=load('review_author_tests',BASE/'ops/helper-concurrency-v2/test_helper_concurrency_v2.py')
    m=load('independent_exact_v2',BASE/'ops/helper-concurrency-v2/ledger_helper_concurrency_v2.py')
    frozen=load('independent_exact_old_resume',m.API)
    NOW=author.NOW
    REQUEST={'root_authority':True,'authority_path':str(m.AUTHORITY),'authority_sha256':m.AUTHORITY_SHA}

    class IndependentTests(unittest.TestCase):
        def setUp(self):
            self.state=json.loads((m.RECOVERY/'state.before-policy-amendment.json').read_text())
            frozen.overlay.amend_state(self.state,True)
            r=frozen.resume
            self.state['deadline_epoch']=r['prospective_deadline_epoch']
            self.state['user_resume_authority']={'path':str(frozen.RESUME),'sha256':frozen.RESUME_SHA,'pause_seconds':r['authorized_excluded_seconds'],'prospective_deadline_epoch':r['prospective_deadline_epoch']}
            self.state['helpers']={f'old-{i}':{'ended_epoch':1} for i in range(40)}
        def call(self,action,request,now=NOW):
            with patch.object(m.legacy.time,'time',return_value=now):
                return m.apply(self.state,action,request)
        def install(self):
            self.call('amend-helper-concurrency',REQUEST)
        def rejected_unchanged(self,action,request,now=NOW):
            before=copy.deepcopy(self.state)
            with self.assertRaises(Exception):self.call(action,request,now)
            self.assertEqual(self.state,before)
        def test_receipt_missing_extra_and_wrong_numeric_types(self):
            self.install();good=copy.deepcopy(self.state[m.RECEIPT_KEY])
            cases=[None,False,0,[],{},dict(good,extra=True),dict(good,active_helpers=12.0),dict(good,previous_active_helpers=6.0)]
            cases += [{k:v for k,v in good.items() if k!=key} for key in good]
            for bad in cases:
                with self.subTest(bad=bad):
                    self.state[m.RECEIPT_KEY]=bad
                    self.rejected_unchanged('helper-start',{'helper':'invalid','root_authority':True})
        def test_receipt_epoch_deadline_and_types(self):
            self.install();good=copy.deepcopy(self.state[m.RECEIPT_KEY])
            for epoch in [m.saved_old_auth()['root_work_clock_deadline_epoch'],float('-inf'),False,'1790996060',None,NOW-5]:
                with self.subTest(epoch=epoch):
                    self.state[m.RECEIPT_KEY]={**good,'effective_epoch':epoch}
                    self.rejected_unchanged('status',{})
        def test_start_birth_finite_prospective_and_atomic_failures(self):
            self.install()
            for birth in [float('nan'),float('inf'),float('-inf'),True,False,None,'1790996060',NOW-1,NOW+1]:
                with self.subTest(birth=birth):
                    self.rejected_unchanged('helper-start',{'helper':'bad','root_authority':True,'started_epoch':birth})
            for now in [float('nan'),float('inf'),float('-inf'),True,NOW-1]:
                with self.subTest(now=now):
                    self.rejected_unchanged('helper-start',{'helper':'bad','root_authority':True},now)
            self.call('helper-start',{'helper':'exact-effective','root_authority':True,'started_epoch':NOW},NOW)
            self.assertEqual(self.state['helpers']['exact-effective']['started_epoch'],NOW)
        def test_start_deadline_and_root_rejected_without_mutation(self):
            self.install()
            self.rejected_unchanged('helper-start',{'helper':'bad','root_authority':False})
            self.rejected_unchanged('helper-start',{'helper':'bad','root_authority':True},self.state['deadline_epoch'])
        def test_install_closed_and_types(self):
            for closed in [True,None,0,1,'false']:
                self.state['closed']=closed
                self.rejected_unchanged('amend-helper-concurrency',REQUEST)
            self.state['closed']=False
            for request in [None,[],0,True,{},dict(REQUEST,root_authority=1.0),dict(REQUEST,root_authority='true')]:
                self.rejected_unchanged('amend-helper-concurrency',request)
        def test_receipt_return_is_not_state_alias(self):
            result=self.call('amend-helper-concurrency',REQUEST)
            before=copy.deepcopy(self.state)
            result['effective_epoch']=1;result['active_helpers']=99
            self.assertEqual(self.state,before)
        def test_auth_mutation_isolated_and_old_module_unchanged(self):
            old=frozen.auth();saved=m.saved_old_auth()
            for _ in range(20):
                a=m.auth();a['limits']['active_helpers']=999;a['limits']['active_candidates_by_family']['M']=999
                self.assertEqual(frozen.auth(),old)
                self.assertEqual(m.saved_old_auth(),saved)
                b=m.auth();self.assertEqual(b['limits']['active_helpers'],12)
                b['limits']['active_helpers']=6;self.assertEqual(b,old)
            self.assertIsNot(m.resume_api,frozen)
            self.assertIsNot(m.legacy,frozen.legacy)
            self.assertIsNot(m.overlay,frozen.overlay)
        def test_every_dependency_pin_fails_closed(self):
            before=copy.deepcopy(self.state)
            for path in m.PINS:
                with self.subTest(path=path),patch.dict(m.PINS,{path:'0'*64}):
                    with self.assertRaises(RuntimeError):m.accounting(self.state,NOW)
                    self.assertEqual(self.state,before)
        def test_actual_copy_source_drift_fails_closed(self):
            p=COPY/'ops/recovery-v1/ledger_resume.py';original=p.read_bytes()
            try:
                p.write_bytes(original+b'\n# sandbox drift\n')
                self.rejected_unchanged('status',{})
                with self.assertRaises(RuntimeError):load('drift_import',BASE/'ops/helper-concurrency-v2/ledger_helper_concurrency_v2.py')
            finally:p.write_bytes(original)
        def test_actual_copy_dependency_symlink_fails_closed(self):
            p=COPY/'ops/recovery-v1/ledger_resume.py';original=p.read_bytes();target=LAB/'sandbox/pinned-target.py';target.write_bytes(original)
            try:
                p.unlink();p.symlink_to(target)
                self.rejected_unchanged('status',{})
            finally:p.unlink();p.write_bytes(original)
        def test_semantic_authority_exactness_despite_hash_stub(self):
            valid=json.loads(m.AUTHORITY.read_text())
            original=Path.read_text
            mutations=[('root_selected_prospective_active_helpers',12.0),('previous_active_helpers',6.0),('root_authority',1),('no_budget_reset',1),('frozen_history_outcomes_job_caps_and_usage_unchanged',1),('no_candidate_boundary_provider_tool_profile_authorization_change',1),('authorized_pause_seconds_unchanged',True),('original_start_epoch',True),('recorded_epoch',False),('native_goal_start_ceiling_unchanged',143),('candidate_slots_by_family_unchanged',{'M':3,'Z':2,'L':2}),('occupied_candidate_seconds_ceiling_unchanged',172801),('explicit_user_instruction','different'),('extra',True)]
            for key,value in mutations:
                bad={**valid,key:value}
                def read(p,*a,**kw):return json.dumps(bad) if p==m.AUTHORITY else original(p,*a,**kw)
                with self.subTest(key=key),patch.object(m,'check_pins'),patch.object(Path,'read_text',read):
                    self.rejected_unchanged('amend-helper-concurrency',REQUEST)
        def test_all_clock_authority_fields_unchanged(self):
            before=copy.deepcopy(self.state)
            self.install()
            for key in before:self.assertEqual(self.state[key],before[key],key)
            self.assertEqual(self.state['clock_start_epoch'],1790905209)
            self.assertEqual(self.state['deadline_epoch'],1791013030.8303788)
            self.assertEqual(m.resume_api.resume['authorized_excluded_seconds'],64621.83037877083)
        def test_helper_end_delegate_legacy_weak_proof_behavior_preserved(self):
            self.install();self.call('helper-start',{'helper':'proof-convention','root_authority':True})
            before=copy.deepcopy(self.state)
            request={'helper':'proof-convention','root_authority':True,'actual_end_epoch':NOW}
            with patch.object(frozen.legacy.time,'time',return_value=NOW+1):frozen.apply(before,'helper-end',request)
            self.call('helper-end',request,NOW+1)
            self.assertEqual(self.state,before)
        def test_delegated_event_and_close_identical(self):
            self.install()
            for action,request in [('event',{'category':'handoff','seconds':1,'receipt':'offline'}),('close',{'root_authority':True,'reason':'offline'})]:
                old=copy.deepcopy(self.state)
                with patch.object(frozen.legacy.time,'time',return_value=NOW):
                    try:expected=frozen.apply(old,action,request)
                    except Exception as exc:expected=type(exc)
                if isinstance(expected,type):
                    with self.assertRaises(expected):self.call(action,request)
                else:self.assertEqual(self.call(action,request),expected)
                self.assertEqual(self.state,old)
        def test_default_birth_survives_clock_rollback(self):
            self.install()
            request={'helper':'rollback','root_authority':True,'proof':{'id':'caller'}}
            original=copy.deepcopy(request)
            with patch.object(m.legacy.time,'time',side_effect=[NOW,NOW,NOW-1]):
                m.apply(self.state,'helper-start',request)
            birth=self.state['helpers']['rollback']['started_epoch']
            evidence={'clock_sequence':[NOW,NOW,NOW-1],'effective_epoch':self.state[m.RECEIPT_KEY]['effective_epoch'],'stored_started_epoch':birth,'stored_birth_valid':math.isfinite(birth) and birth>=NOW,'caller_request_unchanged':request==original}
            (LAB/'CLOCK_ROLLBACK_EVIDENCE.json').write_text(json.dumps(evidence,indent=2)+'\n')
            self.assertEqual(birth,NOW)
            self.assertEqual(request,original)
        def test_default_birth_survives_nonfinite_later_clock(self):
            self.install()
            request={'helper':'nan-clock','root_authority':True}
            original=copy.deepcopy(request)
            with patch.object(m.legacy.time,'time',side_effect=[NOW,NOW,float('nan')]):
                m.apply(self.state,'helper-start',request)
            birth=self.state['helpers']['nan-clock']['started_epoch']
            evidence={'clock_sequence':[NOW,NOW,'NaN'],'effective_epoch':self.state[m.RECEIPT_KEY]['effective_epoch'],'stored_started_epoch':birth,'stored_birth_is_finite':math.isfinite(birth),'caller_request_unchanged':request==original}
            (LAB/'CLOCK_NONFINITE_EVIDENCE.json').write_text(json.dumps(evidence,indent=2)+'\n')
            self.assertEqual(birth,NOW)
            self.assertEqual(request,original)
        def test_birth_and_request_survive_multiclock_matrix(self):
            self.install()
            for i,tail in enumerate([NOW-100,NOW+0.25,NOW+10,float('nan'),float('inf'),float('-inf')]):
                request={'helper':f'matrix-{i}','root_authority':True,'nested':{'retain':'same'}}
                original=copy.deepcopy(request)
                before=copy.deepcopy(self.state)
                with patch.object(m.legacy.time,'time',side_effect=[NOW,NOW,tail]):
                    if tail==float('inf'):
                        with self.assertRaises(RuntimeError):m.apply(self.state,'helper-start',request)
                    else:m.apply(self.state,'helper-start',request)
                if tail==float('inf'):self.assertEqual(self.state,before)
                else:self.assertEqual(self.state['helpers'][request['helper']]['started_epoch'],NOW)
                self.assertEqual(request,original)
            # The historical deadline check still rejects a later inclusive deadline.
            self.rejected_unchanged('helper-start',{'helper':'deadline-unchanged','root_authority':True},self.state['deadline_epoch'])
        def test_explicit_birth_type_value_and_forwarded_copy(self):
            self.install()
            for i,birth in enumerate([int(NOW),NOW,NOW+0.125]):
                request={'helper':f'explicit-{i}','root_authority':True,'started_epoch':birth,'nested':{'retain':'same'}}
                original=copy.deepcopy(request);captures=[];delegate=m.resume_api.apply
                def observe(state,action,forwarded):
                    captures.append(forwarded)
                    return delegate(state,action,forwarded)
                with patch.object(m.resume_api,'apply',side_effect=observe),patch.object(m.legacy.time,'time',side_effect=[NOW+1,NOW+2,NOW+3]):
                    m.apply(self.state,'helper-start',request)
                stored=self.state['helpers'][request['helper']]['started_epoch']
                self.assertEqual(stored,birth);self.assertIs(type(stored),type(birth))
                self.assertEqual(request,original);self.assertIsNot(captures[0],request)
                self.assertIs(captures[0]['nested'],request['nested'])
        def test_other_action_passes_original_request_object(self):
            self.install();delegate=m.resume_api.apply
            for action,request in [('status',{}),('event',{'category':'handoff','seconds':1})]:
                captures=[]
                def observe(state,act,forwarded):
                    captures.append(forwarded)
                    return delegate(state,act,forwarded)
                with patch.object(m.resume_api,'apply',side_effect=observe),patch.object(m.legacy.time,'time',return_value=NOW):
                    m.apply(self.state,action,request)
                self.assertIs(captures[0],request)
        def test_transaction_not_called_by_apply_status(self):
            self.install();before=copy.deepcopy(self.state)
            with patch.object(m,'transaction',side_effect=AssertionError('no transaction')):
                self.call('status',{})
            self.assertEqual(self.state,before)

    runner=unittest.TextTestRunner(verbosity=2)
    author_result=runner.run(unittest.defaultTestLoader.loadTestsFromModule(author))
    independent_result=runner.run(unittest.defaultTestLoader.loadTestsFromTestCase(IndependentTests))
    summary={'author_tests_run':author_result.testsRun,'author_success':author_result.wasSuccessful(),'independent_tests_run':independent_result.testsRun,'independent_success':independent_result.wasSuccessful(),'read_only_virtual_mapping':True,'independent_source_bytes_modified_for_execution':False,'author_compiled_wrapper_relocated_only':True,'live_transactions_executed':False}
    (LAB/'test-summary.json').write_text(json.dumps(summary,indent=2)+'\n')
    print(json.dumps(summary,sort_keys=True))
    sys.exit(0 if author_result.wasSuccessful() and independent_result.wasSuccessful() else 1)
