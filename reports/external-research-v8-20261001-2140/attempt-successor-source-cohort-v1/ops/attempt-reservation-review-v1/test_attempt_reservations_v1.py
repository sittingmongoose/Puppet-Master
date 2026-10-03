"""Full immutable sources, owned offline fixtures, no live state/transactions."""
import copy
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch
import fixture_harness as f

HERE = Path(__file__).absolute().parent
REAL = f.REAL_CAMPAIGN
ROOT = f.FIXTURE_CAMPAIGN
EXTRA = ['ops/recovery-v1/ATTEMPT_SUCCESSOR_DEVELOPMENT_AUTHORITY_V1.json',
 'dev/tranche-successor-v8/REMAINING_CELLS.json','dev/tranche-successor-v8/SOURCE_FREEZE.json',
 'dev/tranche-successor-v8/ADDITIVE_ACTION_SPEC.json',
 'ops/execution-resume-v1/root-production-release-v7.json',
 'ops/attempt-reservation-api-v1/ledger_attempt_reservations_v1.py']
# Exact closure seed is metadata only; intentionally replaced by owned mock later.
EXTRA_SEED=['dev/attempt-successor-declarations-v1/DECLARATION_CLOSURE.json']
for relative in EXTRA+EXTRA_SEED:
    target=ROOT/relative;target.parent.mkdir(parents=True,exist_ok=True)
    target.write_bytes((REAL/relative).read_bytes())

original_source = importlib.machinery.SourceFileLoader.get_source
literal='CAMPAIGN = Path('+repr(str(REAL))+')'
def relocated(loader,name):
    text=original_source(loader,name)
    if Path(loader.path).name=='ledger_helper_concurrency_v2.py' and Path(loader.path).is_relative_to(ROOT):
        assert text.count(literal)==1
        text=text.replace(literal,'CAMPAIGN = Path('+repr(str(ROOT))+')')
    return text
path=ROOT/'ops/attempt-reservation-api-v1/ledger_attempt_reservations_v1.py'
spec=importlib.util.spec_from_file_location('offline_attempt_wrapper',path)
m=importlib.util.module_from_spec(spec)
text=path.read_text().replace(literal,'CAMPAIGN = Path('+repr(str(ROOT))+')')
with patch.object(importlib.machinery.SourceFileLoader,'get_source',relocated):
    old=sys.dont_write_bytecode;sys.dont_write_bytecode=True
    try:exec(compile(text,str(path),'exec'),m.__dict__)
    finally:sys.dont_write_bytecode=old

# Production metadata is copied byte-for-byte. Existing embedded absolute path
# references are compared unchanged, while mock refs below use fixture paths.
proposal=json.loads(m.PROPOSAL.read_text())
release=json.loads((ROOT/'ops/execution-resume-v1/root-production-release-v7.json').read_text())
NOW=1791000000.0

def write(path,value):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(value,indent=2)+'\n')
    return {'path':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}

def mock_pairs():
    pairs=[]
    for p in proposal['remaining_logical_pairs']:
        sources=p['arms'][0]['original_assigned_sources']
        common={'route':release['route'],'account':'existing-authorized-zcode-account-v8-A', 'model':'GLM5.3FlashMax',
          'pins':release['pins'],'task_sha256':'a'*64,'brief_sha256':sources['brief']['sha256'],
          'thin_plan_sha256':sources['thin_plan']['sha256'],'source_access_sha256':sources['source_access']['sha256'],
          'scoring_contract_sha256':'b'*64}
        arms=[]
        for a in p['arms']:
            new=a['proposed_attempt_case_id'];root=ROOT/'cases/attempt-successors-v1/candidates'/new
            manifest=write(root/'manifest.json',{'offline_mock':True,'case_id':new})
            method=write(root/'METHOD.md',{'offline_mock':True})
            arms.append({'logical_case_id':a['logical_case_id'],'logical_pair_id':a['logical_pair_id'],
             'arm':a['arm'],'predecessor_attempt_case_id':a['logical_case_id'],'new_attempt_case_id':new,
             'new_jobs':a['proposed_jobs'],'new_final_job':a['proposed_final_job'],
             'evaluator_attempt_id':a['proposed_evaluation_attempt_id'],'source_manifest':manifest,'method':method,
             'original_manifest_sha256':a['original_assigned_sources']['manifest']['sha256'],
             'original_method_sha256':a['original_assigned_sources']['method_card']['sha256']})
        pairs.append({'logical_pair_id':p['logical_pair_id'],'attempt_pair_id':p['proposed_pair_attempt_id'],
                      'common_binding':common,'arms':arms})
    return pairs

class AttemptTests(unittest.TestCase):
    def setUp(self):
        f.ConcurrencyTests.setUp(self)
        with patch.object(f.m.legacy.time,'time',return_value=NOW):
            f.m.apply(self.state,'amend-helper-concurrency',f.REQUEST)
        self.pairs=mock_pairs()
        self.closure={'schema':'pm.er8.attempt-successor-declaration-closure.v1','frozen':True,'root_authority':False,
         'campaign_id':self.state['campaign_id'],'original_start_epoch':1790905209,
         'campaign_deadline_epoch':m.DEADLINE,'caps':m.CAPS,
         'proposal':{'path':str(m.PROPOSAL),'sha256':m.PROPOSAL_SHA},'pairs':self.pairs}
        closure_ref=write(m.DECLARATION,self.closure)
        self.closurepatch=patch.object(m,'DECLARATION_SHA',closure_ref['sha256']);self.closurepatch.start()
        self.pinpatch=patch.dict(m.PINS,{m.DECLARATION:closure_ref['sha256']});self.pinpatch.start()
        source={'path':str(m.SOURCE),'sha256':hashlib.sha256(m.SOURCE.read_bytes()).hexdigest()}
        manifest=write(m.MANIFEST,{'source':source,'status':'SOURCE_READY_REQUIRES_INDEPENDENT_REVIEW'})
        review=write(ROOT/'ops/attempt-reservation-review-v1/REVIEW.json',
                     {'schema':'pm.er8.attempt-reservation-independent-review.v1','accepted':True,'independent':True,'source':source,'source_manifest':manifest})
        self.acceptance={'schema':'pm.er8.attempt-reservation-source-acceptance.v1','root_authority':True,
         'accepted':True,'independent_source_review_accepted':True,'declarations_accepted':True,
         'source':source,'source_manifest':manifest,'independent_review':review,
         'declaration_closure':closure_ref,'development_authority':{'path':str(m.AUTHORITY),'sha256':m.AUTHORITY_SHA},
         'accepted_epoch':NOW-1}
        acceptance_ref=write(m.ACCEPTANCE,self.acceptance)
        # Frozen proposal's V7 reference points to production; match it unchanged
        # in request, and relocate only reference target in the test call hook.
        self.request={'receipt_id':'offline-first','root_authority':True,
         'development_authority':self.acceptance['development_authority'],'source_acceptance':acceptance_ref,
         'source_freeze':{'path':str(m.FEASIBILITY),'sha256':m.FEASIBILITY_SHA},'declaration_closure':closure_ref,
         'predecessor_release':proposal['source_v7_release'],'campaign_id':self.state['campaign_id'],
         'original_start_epoch':1790905209,'campaign_deadline_epoch':m.DEADLINE,'caps':copy.deepcopy(m.CAPS),
         'pairs':copy.deepcopy(self.pairs[:1]),'predecessor_quiet_records':{}}
        self.quiet_records()
        self.original_reference=m.reference
        def fixture_reference(ref,path):
            if path==ROOT/'ops/execution-resume-v1/root-production-release-v7.json':
                self.assertEqual(ref,proposal['source_v7_release'])
                return m.object_bytes(m.pinned(path,ref['sha256']))
            return self.original_reference(ref,path)
        self.refpatch=patch.object(m,'reference',side_effect=fixture_reference);self.refpatch.start()

    def tearDown(self):
        self.refpatch.stop();self.pinpatch.stop();self.closurepatch.stop()

    def quiet_records(self):
        refs={}
        for p in self.request['pairs']:
            for a in p['arms']:
                old=a['predecessor_attempt_case_id']
                jobs={k:v for k,v in self.state['jobs'].items() if v['case']==old}
                value={'schema':'pm.er8.attempt-predecessor-quiet.v1','root_authority':True,
                 'campaign_id':self.state['campaign_id'],'case_id':old,'observed_epoch':NOW,
                 'ledger_jobs_sha256':m.canonical_sha(jobs),'native_quiescent':True,'parents_absent':True,
                 'actors_absent':True,'permits_settled':True,'no_v7_scheduler_for_case':True}
                refs[old]=write(m.RECOVERY/('ATTEMPT_PREDECESSOR_QUIET_'+old+'.json'),value)
        self.request['predecessor_quiet_records']=refs

    def call(self,request=None,now=NOW):
        with patch.object(m.legacy.time,'time',return_value=now):
            return m.apply(self.state,'reserve-attempt-successors',self.request if request is None else request)

    def reject(self,request=None,now=NOW):
        before=copy.deepcopy(self.state)
        with self.assertRaises((RuntimeError,ValueError,OSError,KeyError)):
            self.call(request,now)
        self.assertEqual(before,self.state)

    def test_success_only_append_and_old_values_preserved(self):
        before=copy.deepcopy(self.state);receipt=self.call()
        for key in before:
            if key=='reservation_by_case':
                for case,row in before[key].items():self.assertEqual(row,self.state[key][case])
            elif key=='evaluator_reserved_names':self.assertEqual(before[key],self.state[key][:len(before[key])])
            else:self.assertEqual(before[key],self.state[key],key)
        self.assertEqual(len(self.state[m.LINEAGE]),2)
        self.assertEqual(len(self.state[m.RECEIPTS]),1)
        self.assertEqual(self.state[m.RECEIPTS]['offline-first'],receipt)
        for row in self.state[m.LINEAGE].values():
            self.assertEqual(self.state['reservation_by_case'][row['new_attempt_case_id']],
              {'native_starts':3,'occupied_seconds':5400,'completed':False,'final_job':row['new_attempt_case_id']+'-final-correction'})
        self.assertEqual(len(self.state['final_reserved_names']),6)
        self.assertTrue(receipt['no_old_commitment_retirement'])

    def test_real_accounting_delta_counts_all_old_commitments(self):
        before=m.accounting(self.state,NOW)
        receipt=self.call()
        self.assertEqual(receipt['native_starts_with_commitments'],
          before['native_goal_starts']+before['reserved_or_committed_native_starts']+6)
        self.assertEqual(receipt['occupied_seconds_with_commitments'],
          before['occupied_slot_seconds']+before['reserved_or_committed_slot_seconds']+10800)
        self.assertEqual(receipt['preflight_accounting']['generated_usage'],before['generated_usage'])
        self.assertEqual(receipt['preflight_accounting']['generated_output_tokens_lower_bound'],
                         before['generated_output_tokens_lower_bound'])

    def test_second_disjoint_pair_preserves_first_receipt_lineage(self):
        self.call();first=copy.deepcopy(self.state)
        self.request['receipt_id']='offline-next-pair'
        self.request['pairs']=copy.deepcopy(self.pairs[1:2]);self.quiet_records();self.call()
        self.assertEqual(self.state[m.RECEIPTS]['offline-first'],first[m.RECEIPTS]['offline-first'])
        for case,row in first[m.LINEAGE].items():self.assertEqual(self.state[m.LINEAGE][case],row)
        for case,row in first['reservation_by_case'].items():self.assertEqual(self.state['reservation_by_case'][case],row)

    def test_preflight_late_clock_failure_is_atomic(self):
        for finished in (m.DEADLINE, float('nan'), NOW-1, True):
            before=copy.deepcopy(self.state)
            with patch.object(m.legacy.time,'time',side_effect=[NOW,finished]):
                with self.assertRaises(RuntimeError):m.apply(self.state,'reserve-attempt-successors',self.request)
            self.assertEqual(self.state,before)

    def test_import_read_only_and_no_shared_module_registration(self):
        mock=m.DECLARATION.read_bytes()
        m.DECLARATION.write_bytes((REAL/EXTRA_SEED[0]).read_bytes())
        original=io.open
        def readonly(file,mode='r',*a,**kw):
            if any(c in mode for c in 'wxa+'):raise AssertionError('import write forbidden')
            return original(file,mode,*a,**kw)
        globals_before=(m.base.apply,m.base.auth,m.base.resume_api.apply,m.base.resume_api.auth)
        names_before=set(sys.modules)
        isolated_spec=importlib.util.spec_from_file_location('fresh_readonly_fixture_attempt',path)
        isolated=importlib.util.module_from_spec(isolated_spec)
        try:
            with patch.object(io,'open',readonly),patch.object(importlib.machinery.SourceFileLoader,'get_source',relocated):
                exec(compile(text,str(path),'exec'),isolated.__dict__)
        finally:m.DECLARATION.write_bytes(mock)
        self.assertEqual((m.base.apply,m.base.auth,m.base.resume_api.apply,m.base.resume_api.auth),globals_before)
        self.assertEqual(set(sys.modules),names_before)
        self.assertIsNot(isolated.base,m.base)

    def test_duplicate_receipt_and_same_logical_pair_rejected(self):
        self.call();self.reject()
        request=copy.deepcopy(self.request);request['receipt_id']='offline-second';self.reject(request)

    def test_whole_subset_not_all_twelve_blind(self):
        self.request['pairs']=copy.deepcopy(self.pairs);self.quiet_records()
        self.state['reservation_by_case']['old-cap-load']={'native_starts':3,'occupied_seconds':172800,
                                                       'completed':False,'final_job':'old-cap-final'}
        self.reject()

    def test_resource_ceiling_boundaries(self):
        with patch.object(m,'accounting',return_value={'candidate_output_stop':False,'native_goal_starts':140,
          'reserved_or_committed_native_starts':5,'occupied_slot_seconds':0,'reserved_or_committed_slot_seconds':0}):self.reject()
        with patch.object(m,'accounting',return_value={'candidate_output_stop':False,'native_goal_starts':0,
          'reserved_or_committed_native_starts':0,'occupied_slot_seconds':172799,'reserved_or_committed_slot_seconds':2}):self.reject()

    def test_output_stop_and_unknown_usage_preserved(self):
        with patch.object(m,'accounting',return_value={'candidate_output_stop':True}):self.reject()
        self.assertTrue(any(v['generated_output_tokens'] is None for v in self.state['jobs'].values()))

    def test_split_pair_alias_duplicate_names_rejected(self):
        for mutation in ['split','alias','duplicate','eval']:
            r=copy.deepcopy(self.request)
            if mutation=='split':r['pairs'][0]['arms'].pop()
            if mutation=='alias':r['pairs'][0]['arms'][0]['new_attempt_case_id']+='-alias'
            if mutation=='duplicate':r['pairs'].append(copy.deepcopy(r['pairs'][0]))
            if mutation=='eval':r['pairs'][0]['arms'][1]['evaluator_attempt_id']=r['pairs'][0]['arms'][0]['evaluator_attempt_id']
            self.reject(r)

    def test_identity_collisions_anywhere_in_old_state(self):
        a=self.request['pairs'][0]['arms'][0]
        for name in [a['new_attempt_case_id'],*a['new_jobs'],a['evaluator_attempt_id'],'offline-first']:
            self.state['opaque_existing_identity']=name;self.reject()
        del self.state['opaque_existing_identity']

    def test_root_path_hash_unknown_fields_and_caps(self):
        for key,value in [('root_authority',1),('caps',{**m.CAPS,'case_occupied':3300}),
          ('campaign_deadline_epoch',m.DEADLINE+1),('extra',True),('source_freeze',{'path':'foreign','sha256':'0'*64})]:
            self.reject({**self.request,key:value})

    def test_nonfinite_deadline_clocks(self):
        for now in [float('nan'),float('inf'),True,m.DEADLINE]:self.reject(now=now)

    def test_missing_quiet_and_pending_or_active_predecessor(self):
        old=self.request['pairs'][0]['arms'][0]['predecessor_attempt_case_id']
        self.reject({**self.request,'predecessor_quiet_records':{}})
        template=copy.deepcopy(next(iter(self.state['jobs'].values())))
        template.update(case=old,released_epoch=None,launch_pending=None)
        self.state['jobs']['old-active']=template;self.quiet_records();self.reject()
        template.update(released_epoch=NOW-1,launch_pending={'permit_id':'pending'})
        self.quiet_records();self.reject()

    def test_completed_logical_case_rejected(self):
        old=self.request['pairs'][0]['arms'][0]['predecessor_attempt_case_id']
        self.state['reservation_by_case'][old]={'completed':True};self.reject()

    def test_stale_quiet_pin_and_negative_native_proof(self):
        old=self.request['pairs'][0]['arms'][0]['predecessor_attempt_case_id']
        ref=self.request['predecessor_quiet_records'][old];path=Path(ref['path'])
        value=json.loads(path.read_text());value['ledger_jobs_sha256']='0'*64
        self.request['predecessor_quiet_records'][old]=write(path,value);self.reject()
        value['ledger_jobs_sha256']=m.canonical_sha({});value['parents_absent']=False
        self.request['predecessor_quiet_records'][old]=write(path,value);self.reject()

    def test_source_acceptance_and_independent_review_required(self):
        for key in ['accepted','root_authority','independent_source_review_accepted','declarations_accepted']:
            value={**self.acceptance,key:False}
            self.request['source_acceptance']=write(m.ACCEPTANCE,value);self.reject()

    def test_source_and_declaration_hash_corruption(self):
        r=copy.deepcopy(self.request);r['declaration_closure']['sha256']='0'*64;self.reject(r)
        r=copy.deepcopy(self.request);r['source_acceptance']['sha256']='0'*64;self.reject(r)
        with patch.dict(m.PINS,{m.API:'0'*64}):self.reject()

    def test_v7_scheduled_case_blocked(self):
        with patch.object(m,'validate_pair'):
            release_changed=copy.deepcopy(release)
            release_changed['case_sources']={self.request['pairs'][0]['arms'][0]['logical_case_id']: {}}
            real_metadata=m.metadata
            def altered(req,now):
                a,p,r,c=real_metadata(req,now);return a,p,release_changed,c
            with patch.object(m,'metadata',side_effect=altered):self.reject()

    def test_all_other_actions_accounting_and_native_admit_parity(self):
        self.call()
        with patch.object(m.legacy.time,'time',return_value=NOW):
            self.assertEqual(m.apply(self.state,'status',{}),m.base.apply(self.state,'status',{}))
        self.assertEqual(m.accounting(self.state,NOW),m.base.accounting(self.state,NOW))
        pins={'runtime':'a'*64,'config':'b'*64,'independent_acceptance':'c'*64}
        self.state['route_reviews']['offline']={'accepted':True,'pins':pins}
        self.state['cases']['offline']={'birth_epoch':NOW,'wall_seconds':480,'occupied_seconds':480}
        req={'job':'offline','case':'offline','family':'Z','route':'offline','pins':pins,'component_seconds':480,
             'component_responses':64,'case_wall_seconds':480,'case_occupied_seconds':480,
             'source_access':{'mode':'offline'},'current_stages':['offline']}
        a=copy.deepcopy(self.state);b=copy.deepcopy(self.state)
        self.assertEqual(m.admit(a,req,NOW),m.base.admit(b,req,NOW));self.assertEqual(a,b)
        req['job']='late';req['component_seconds']=481
        for api in [m,m.base]:
            with self.assertRaises(RuntimeError):api.admit(copy.deepcopy(self.state),req,NOW)

    def test_current_case_end_boundary_not_renewed(self):
        self.call();arm=self.request['pairs'][0]['arms'][0];case=arm['new_attempt_case_id']
        self.state['cases'][case]={'birth_epoch':NOW-3500,'wall_seconds':3600,'occupied_seconds':5400,
          'outside_native_cap_seconds':300,'observed_outside_native_seconds':0}
        self.state['route_reviews']['offline']={'accepted':True,'pins':release['pins']}
        req={'job':arm['new_jobs'][0],'case':case,'family':'Z','route':'offline','pins':release['pins'],
          'component_seconds':1200,'component_responses':160,'case_wall_seconds':3600,'case_occupied_seconds':5400,
          'outside_native_cap_seconds':300,'source_access':{'mode':'offline'},'current_stages':['research-proposal']}
        before=copy.deepcopy(self.state)
        with self.assertRaisesRegex(RuntimeError,'inclusive case/campaign envelope'):m.admit(self.state,req,NOW)
        self.assertEqual(self.state,before)

    def test_symlink_dependency_and_no_live_files(self):
        self.assertFalse(m.legacy.STATE.exists());self.assertFalse(m.legacy.LOCK.exists())
        target=ROOT/'symlink-target';target.write_bytes(b'x');link=ROOT/'symlink';link.symlink_to(target)
        with self.assertRaises(RuntimeError):m.pinned(link,hashlib.sha256(b'x').hexdigest())
        link.unlink();target.unlink()
        for relative in f.COPY_PATHS+EXTRA:self.assertEqual((ROOT/relative).read_bytes(),(REAL/relative).read_bytes())

    def test_cli_status_never_transaction_or_write(self):
        statefile=ROOT/'offline-status.json';write(statefile,self.state)
        before=statefile.read_bytes();original=io.open
        def readonly(file,mode='r',*a,**kw):
            if any(c in mode for c in 'wxa+'):raise AssertionError('write forbidden')
            return original(file,mode,*a,**kw)
        with patch.object(m.legacy,'STATE',statefile),patch.object(sys,'argv',['api','status']),patch.object(io,'open',readonly),patch.object(m,'transaction',side_effect=AssertionError('transaction forbidden')),patch('builtins.print'):
            m.main()
        self.assertEqual(statefile.read_bytes(),before)

if __name__=='__main__':unittest.main(verbosity=2)
