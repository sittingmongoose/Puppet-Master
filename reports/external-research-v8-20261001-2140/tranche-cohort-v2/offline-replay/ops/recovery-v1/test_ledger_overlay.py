import copy,json,unittest
from pathlib import Path
from unittest.mock import patch
import ledger_overlay as m

class OverlayTests(unittest.TestCase):
    def setUp(self):
        self.original=json.loads((m.HERE/'state.before-policy-amendment.json').read_text())
        self.state=copy.deepcopy(self.original)
        m.amend_state(self.state,'offline test root')
        self.now=1790927000
    def test_preserves_history_and_usage(self):
        for key in self.original:
            if key!='deadline_epoch': self.assertEqual(self.original[key],self.state[key])
        self.assertEqual(m.accounting(self.state,self.now)['occupied_slot_seconds'],816.6492922306061)
        self.assertEqual(m.auth()['limits']['native_goal_starts'],144)
        self.assertEqual(m.auth()['limits']['occupied_candidate_slot_seconds'],172800)
        self.assertIsNone(m.auth()['limits']['helpers_task_starts'])
        self.assertIsNone(m.auth()['limits']['repair_versions_per_boundary'])
    def test_explicit_authority_required(self):
        with self.assertRaises(RuntimeError):m.apply(self.original,'status',{})
        with self.assertRaises(RuntimeError):m.amend_state(self.state,'duplicate')
    def test_helper_cumulative_removed_six_live_boundary(self):
        self.state['helpers']={str(i):{'ended_epoch':1} for i in range(40)}
        with patch.object(m.legacy.time,'time',return_value=self.now):
            for i in range(6):m.apply(self.state,'helper-start',{'helper':'new'+str(i),'root_authority':'test'})
            with self.assertRaises(RuntimeError):m.apply(self.state,'helper-start',{'helper':'seventh','root_authority':'test'})
    def test_new_admission_after_old_deadline_preserves_old_caps(self):
        old=copy.deepcopy(self.state['jobs'])
        pins={'runtime':'a'*64,'config':'b'*64,'independent_acceptance':'c'*64}
        self.state['route_reviews']['offline-test']={'accepted':True,'pins':pins}
        request={'job':'offline-new','case':'offline-new','family':'Z','route':'offline-test','pins':pins,'component_seconds':480,'component_responses':64,'case_wall_seconds':480,'case_occupied_seconds':480,'source_access':{'mode':'offline'},'current_stages':['test'],'birth_epoch':self.now,'birth_monotonic':1}
        with patch.object(m.legacy.time,'time',return_value=self.now):m.apply(self.state,'prepare-admission',request)
        for key,val in old.items():self.assertEqual(self.state['jobs'][key],val)
        self.assertEqual(self.state['jobs']['offline-new']['hard_deadline_epoch'],self.now+480)
    def test_guard_uses_144_not_48(self):
        s=self.state
        job=copy.deepcopy(next(iter(s['jobs'].values())))
        job.update(job='offline',case='offline',released_epoch=None,birth_epoch=self.now,hard_deadline_epoch=self.now+60,goal_starts=[],launch_pending=None)
        s['jobs']['offline']=job;s['cases']['offline']={'birth_epoch':self.now,'wall_seconds':480,'occupied_seconds':480}
        s['reservation_by_case']={}
        historical=next(v for k,v in s['jobs'].items() if k!='offline')
        historical['goal_starts']=[{'receipt_id':str(i)} for i in range(143)]
        with patch.object(m.legacy.time,'time',return_value=self.now):
            self.assertTrue(m.apply(s,'guard-start',{'job':'offline','permit_id':'p'})['allowed'])
            job['launch_pending']=None;historical['goal_starts'].append({'receipt_id':'144'})
            with self.assertRaises(RuntimeError):m.apply(s,'guard-start',{'job':'offline','permit_id':'over'})
    def reservations(self):
        names = self.state['final_reserved_names'] + ['offline-case-'+str(i) for i in range(22)]
        return {'root_authority':'offline root','reservations':[{'case':n,'native_starts':3,'occupied_seconds':5400,'final_job':n+'-final-correction'} for n in names], 'evaluator_names':['offline-eval-'+str(i) for i in range(28)]}
    def test_tranche_reserves_holdouts_preserves_old_six(self):
        old = copy.deepcopy(self.state['reservation_by_case'])
        old_jobs = copy.deepcopy(self.state['jobs'])
        m.apply(self.state,'extend-reservations',self.reservations())
        self.assertEqual(len(self.state['reservation_by_case']),28)
        for k,v in old.items():self.assertEqual(self.state['reservation_by_case'][k],v)
        self.assertEqual(self.state['jobs'],old_jobs)
        self.assertEqual(m.accounting(self.state)['reserved_or_committed_native_starts'],84)
        with self.assertRaises(RuntimeError):m.apply(self.state,'extend-reservations',self.reservations())
    def test_tranche_cannot_displace_history_or_exceed_envelope(self):
        r=self.reservations();r['reservations'][0]['occupied_seconds']=5399
        with self.assertRaises(ValueError):m.apply(self.state,'extend-reservations',r)
        historical=next(iter(self.state['jobs'].values()))
        historical['goal_starts']=[{'receipt_id':str(i)} for i in range(61)]
        with self.assertRaises(RuntimeError):m.apply(self.state,'extend-reservations',self.reservations())
if __name__=='__main__':unittest.main()
