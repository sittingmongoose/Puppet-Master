"""Synthetic mechanical delivery tests only; no candidate/provider/evaluator calls."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time
import unittest
from unittest.mock import patch

HERE=Path(__file__).resolve().parent
def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
carrier=load('test_bundle_carrier',HERE/'bundle_carrier.py')
server=load('test_bundle_source',HERE/'source_capture/tool_server.py')
config=load('test_bundle_config',HERE/'config.py')
binding=load('test_bundle_binding',HERE/'operator_binding.py')

class BundleTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(prefix='er9-bundle-test-');self.ws=Path(self.tmp.name)/'case';self.ws.mkdir()
        for name in ('inputs','out','public_captures','operation_receipts'):(self.ws/name).mkdir()
        (self.ws/'TASK.md').write_text('Synthetic delivery mechanics only; no native Goal.\n')
        self.oldroot=server.ROOT;server.ROOT=str(self.ws)
        self.payloads={'proposal.md':'Synthetic exact proposal\r\nα\t  \n','sources.json':'{ "synthetic": true }\n','witnesses.json':'[ ]\n','leads.json':'{\n  "synthetic": []\n}\n'}
        self.stage='SYNTHETIC-FINAL';self.case='SYNTHETIC-CASE';self.arm='control';self.rows=[]
        self.profile_path=Path(self.tmp.name)/'operator_profile.json';self.update_binding()
    def tearDown(self):server.ROOT=self.oldroot;self.tmp.cleanup()
    def update_binding(self):
        built=binding.binding(stage_id=self.stage,stage_role='final',case_id=self.case,arm_id=self.arm,method_factors=['V01'],actor_binding={'stage_id':self.stage,'family':'Luna','model':'SYNTHETIC_ONLY','native_goal_id':None},entries=self.rows,complete_final_role=True)
        (self.ws/'inputs/delivery_role_manifest.json').write_bytes(built['manifest_bytes']);self.profile=built['profile'];self.profile_path.write_bytes(built['profile_bytes']);self.profile_path.chmod(0o600)
    def raw(self,refs=False):
        return carrier.encoded({'schema':carrier.SCHEMA,'stage_id':self.stage,'adopt_current':True,'artifacts':{n:({'input_id':'ID-'+n} if refs else {'text_utf8':v}) for n,v in self.payloads.items()}})
    def commit(self,raw=None):return carrier.commit(raw or self.raw(),self.profile,server.read_raw,server.parent_fd,server.ROOT,{'operation_id':'SYNTHETIC_CALL','argument_sha256':'a'*64},time.monotonic_ns()+10_000_000_000)
    def add_references(self,foreign_seed=False,nullable_goal=False):
        for name,content in self.payloads.items():
            relative='inputs/native-'+name;(self.ws/relative).write_bytes(content.encode())
            row={'input_id':'ID-'+name,'path':relative,'sha256':carrier.sha(content.encode()),'bytes':len(content.encode()),'artifact_role':name,'case_id':self.case,'arm_id':self.arm,
                 'origin_case_id':'SYNTHETIC-OLD-SEED' if foreign_seed else self.case,'origin_arm_id':'seed' if foreign_seed else self.arm,'origin_role':'SYNTHETIC_NATIVE_SOURCE','origin_job_id':'SYNTHETIC-JOB-'+name,
                 'origin_goal_id':None if nullable_goal else 'SYNTHETIC-GOAL-'+name,'origin_session_id':'SYNTHETIC-SESSION-'+name,
                 'origin_actor':{'family':'Luna','model':'SYNTHETIC_ONLY','effort':'max'},'origin_status':{'native_goal_state':'SYNTHETIC_ONLY','output_freeze_state':'SYNTHETIC_FIXTURE'},
                 'admission_kind':'predeclared_shared_seed' if foreign_seed else 'same_arm_role','shared_seed_authorization':None}
            start_time=time.monotonic_ns()-2000;end_time=time.monotonic_ns()-1000
            identity={k:row[k] for k in ('origin_job_id','origin_case_id','origin_arm_id','origin_role')};identity['origin_actor_family']=row['origin_actor']['family']
            selectors={k:'/'+k for k in identity}
            clockpath='inputs/clock-'+name+'.json';clockraw=carrier.encoded({'start':start_time,'end':end_time,'synthetic_only':True,**identity});(self.ws/clockpath).write_bytes(clockraw)
            clockref={'path':clockpath,'sha256':carrier.sha(clockraw),'record_selector':'','binding_selectors':selectors}
            proof={'schema':'er9.native-source-role-proof.v1',**{k:row[k] for k in ('origin_job_id','origin_case_id','origin_arm_id','origin_role','origin_goal_id','origin_session_id','origin_actor','origin_status')},
                   'native_goal_activation_count':1,'immutable_freeze_observation_count':1,
                   'goal_id_nonexposure_reason':'SYNTHETIC unexposed distinct ID' if nullable_goal else None,
                   'activation_time':None,'freeze_time':None,
                   'activation_time_nonexposure_reason':'SYNTHETIC fixture uses enclosing observed window only',
                   'freeze_time_nonexposure_reason':'SYNTHETIC fixture uses enclosing observed window only',
                   'activation_window_start':{'clock':'monotonic_ns','value':start_time,'basis':'actual_stage_start','receipt':clockref,'selector':'/start'},
                   'freeze_window_end':{'clock':'monotonic_ns','value':end_time,'basis':'actual_freeze_observation','receipt':clockref,'selector':'/end'}}
            for field,key in (('activation_receipt','native_goal_starts'),('freeze_receipt','immutable_output_observations')):
                receiptpath='inputs/'+field+'-'+name+'.json';receiptraw=carrier.encoded({key:1,'synthetic_only':True,**identity});(self.ws/receiptpath).write_bytes(receiptraw)
                proof[field]={'path':receiptpath,'sha256':carrier.sha(receiptraw),'record_selector':'','binding_selectors':selectors,'count_selector':'/'+key,'observed_count':1}
            proofpath='inputs/proof-'+name+'.json';proofraw=carrier.encoded(proof);(self.ws/proofpath).write_bytes(proofraw);row['native_proof']={'path':proofpath,'sha256':carrier.sha(proofraw)}
            if foreign_seed:
                auth={'schema':'er9.predeclared-shared-seed-imports.v1','target_case_id':self.case,'target_arms':['control','treatment'],'original_import_manifest_sha256':'b'*64,'selection_basis':'predeclared_first_chronological',
                      'artifacts':[{k:row[k] for k in ('origin_case_id','origin_arm_id','origin_job_id','artifact_role','sha256','bytes')}]}
                authpath='inputs/seed-auth-'+name+'.json';authraw=carrier.encoded(auth);(self.ws/authpath).write_bytes(authraw);row['shared_seed_authorization']={'path':authpath,'sha256':carrier.sha(authraw)}
            self.rows.append(row)
        self.update_binding()
    def assert_absent(self):
        self.assertFalse((self.ws/'out/final').exists());self.assertFalse((self.ws/'out/final_bundle.json').exists());self.assertFalse(list((self.ws/'out').glob('.bundle-stage-*')))
    def test_inline_exact_bytes_atomic_manifest_independent_status(self):
        raw=self.raw();r=self.commit(raw)
        for name,text in self.payloads.items():self.assertEqual((self.ws/'out/final'/name).read_bytes(),text.encode())
        self.assertEqual((self.ws/'out/final_bundle.json').read_bytes(),raw)
        m=json.loads((self.ws/'out/final/DELIVERY_MANIFEST.json').read_text());self.assertEqual(m,r['delivery_commit'])
        self.assertEqual(m['native_call_operation_id'],'SYNTHETIC_CALL');self.assertEqual(m['goal_result'],'INDEPENDENT_NOT_UPDATED');self.assertEqual(m['source_grade'],'INDEPENDENT_NOT_ASSESSED')
        self.assertTrue(m['native_explicit_adoption']);self.assertEqual(m['bundle_sha256'],carrier.sha(raw))
    def test_exact_references_nullable_goal_positive_proof_and_proposal_spacing(self):
        self.add_references(nullable_goal=True);r=self.commit(self.raw(True))
        for name,text in self.payloads.items():self.assertEqual((self.ws/'out/final'/name).read_bytes(),text.encode())
        row=r['delivery_commit']['artifacts']['proposal.md']['source_role_provenance'];self.assertIsNone(row['origin_goal_id']);self.assertEqual(row['origin_session_id'],'SYNTHETIC-SESSION-proposal.md')
        self.assertEqual(r['delivery_commit']['artifacts']['proposal.md']['selector'],'explicit_native_input_id')
    def test_predeclared_seed_registered_original_ids_preserved(self):
        self.add_references(foreign_seed=True);r=self.commit(self.raw(True));row=r['delivery_commit']['artifacts']['proposal.md']['source_role_provenance']
        self.assertEqual(row['origin_case_id'],'SYNTHETIC-OLD-SEED');self.assertEqual(row['case_id'],self.case);self.assertEqual(row['admission_kind'],'predeclared_shared_seed')
    def test_missing_positive_goal_proof_session_only_and_unregistered_seed_rejected(self):
        self.add_references(nullable_goal=True)
        proof=self.rows[0]['native_proof'];p=self.ws/proof['path'];v=json.loads(p.read_text());v['native_goal_activation_count']=0;raw=carrier.encoded(v);p.write_bytes(raw);proof['sha256']=carrier.sha(raw);self.update_binding()
        with self.assertRaises(ValueError):self.commit(self.raw(True))
        self.assert_absent()
        v['native_goal_activation_count']=1;raw=carrier.encoded(v);p.write_bytes(raw);proof['sha256']=carrier.sha(raw)
        self.rows[0]['admission_kind']='predeclared_shared_seed';self.update_binding()
        with self.assertRaises(ValueError):self.commit(self.raw(True))
        self.assert_absent()
    def test_invalid_bundle_keys_adoption_stage_json_utf8_roll_back(self):
        base=json.loads(self.raw())
        bad=[]
        for k in ('stage_id','schema','adopt_current','artifacts'):
            v=dict(base);v.pop(k);bad.append(carrier.encoded(v))
        for change in ({'stage_id':'OTHER-STAGE'},{'adopt_current':False},{'unknown':'field'},{'artifacts':{'proposal.md':{'text_utf8':'only one'}}}):bad.append(carrier.encoded({**base,**change}))
        bad.extend([b'{',b'{"schema":1,"schema":2}',b'\xff',self.raw().replace(b'[ ]',b'NaN'),self.raw().replace(b'[ ]',b'not-json'),self.raw().replace('α'.encode(),b'\\ud800')])
        for raw in bad:
            with self.assertRaises((ValueError,UnicodeError)):self.commit(raw)
            self.assert_absent()
    def test_wrong_target_role_hash_case_arm_and_duplicate_reference_paths(self):
        self.add_references();initial=json.loads(json.dumps(self.rows))
        for key,value in [('artifact_role','sources.json'),('case_id','OTHER-CASE'),('arm_id','other-arm'),('sha256','0'*64),('bytes',999),('origin_case_id','FOREIGN'),('native_proof',{'path':'inputs/missing-proof','sha256':'0'*64})]:
            self.rows=json.loads(json.dumps(initial));self.rows[0][key]=value;self.update_binding()
            with self.assertRaises((ValueError,OSError)):self.commit(self.raw(True))
            self.assert_absent()
        self.rows=json.loads(json.dumps(initial));self.rows[1]['path']=self.rows[0]['path'];self.update_binding()
        with self.assertRaises(ValueError):self.commit(self.raw(True))
        self.assert_absent()
    def test_private_traversal_symlink_hardlink_and_mutated_inputs_denied(self):
        self.add_references();initial=json.loads(json.dumps(self.rows));victim=self.ws/self.rows[0]['path'];saved=victim.read_bytes()
        for path in ('/etc/passwd','inputs/../private','out/private','inputs//double'):
            self.rows=json.loads(json.dumps(initial));self.rows[0]['path']=path;self.update_binding()
            with self.assertRaises(ValueError):self.commit(self.raw(True))
            self.assert_absent()
        self.rows=json.loads(json.dumps(initial));self.update_binding();victim.write_bytes(b'changed')
        with self.assertRaises(ValueError):self.commit(self.raw(True))
        victim.unlink();outside=Path(self.tmp.name)/'outside';outside.write_bytes(saved);victim.symlink_to(outside)
        with self.assertRaises(OSError):self.commit(self.raw(True))
        victim.unlink();os.link(outside,victim)
        with self.assertRaises(ValueError):self.commit(self.raw(True))
        self.assert_absent()
    def test_conflict_replay_no_overwrite_and_interruption_rollback(self):
        with patch.object(carrier,'rename_noreplace',side_effect=InterruptedError('synthetic loss before commit')):
            with self.assertRaises(InterruptedError):self.commit()
        self.assert_absent();self.commit();before={p.name:p.read_bytes() for p in (self.ws/'out/final').iterdir()}
        with self.assertRaises(FileExistsError):self.commit()
        self.assertEqual(before,{p.name:p.read_bytes() for p in (self.ws/'out/final').iterdir()})
    def test_existing_empty_directory_and_late_commit_rejected(self):
        (self.ws/'out/final').mkdir()
        with self.assertRaises(FileExistsError):self.commit()
        (self.ws/'out/final').rmdir()
        with self.assertRaises(TimeoutError):carrier.commit(self.raw(),self.profile,server.read_raw,server.parent_fd,server.ROOT,deadline_monotonic_ns=time.monotonic_ns()-1)
        self.assert_absent()
    def test_missing_invented_reversed_window_and_receipt_count_reject(self):
        self.add_references(nullable_goal=True);row=self.rows[0];p=self.ws/row['native_proof']['path'];original=json.loads(p.read_text())
        for modification in ('missing','invented','reversed','count','source-hash'):
            proof=json.loads(json.dumps(original))
            if modification=='missing':proof['activation_window_start']=None
            elif modification=='invented':proof['activation_window_start']['value']-=1
            elif modification=='reversed':proof['activation_window_start'],proof['freeze_window_end']=proof['freeze_window_end'],proof['activation_window_start']
            elif modification=='count':proof['activation_receipt']['observed_count']=2
            else:proof['activation_receipt']['sha256']='0'*64
            raw=carrier.encoded(proof);p.write_bytes(raw);row['native_proof']['sha256']=carrier.sha(raw);self.update_binding()
            with self.assertRaises(ValueError):self.commit(self.raw(True))
            self.assert_absent()
    def test_positive_count_from_wrong_job_or_family_is_not_origin_proof(self):
        self.add_references();row=self.rows[0];p=self.ws/row['native_proof']['path'];proof=json.loads(p.read_text())
        declaration=proof['activation_receipt'];receiptpath=self.ws/declaration['path'];original=json.loads(receiptpath.read_text())
        for field,value in (('origin_job_id','OTHER-JOB'),('origin_actor_family','Muse'),('origin_role','OTHER-ROLE')):
            receipt={**original,field:value};raw=carrier.encoded(receipt);receiptpath.write_bytes(raw);declaration['sha256']=carrier.sha(raw)
            prooffile=carrier.encoded(proof);p.write_bytes(prooffile);row['native_proof']['sha256']=carrier.sha(prooffile);self.update_binding()
            with self.assertRaises(ValueError):self.commit(self.raw(True))
            self.assert_absent()
    def test_after_rename_signal_preserves_complete_set_without_success_ack(self):
        original=carrier.rename_noreplace
        def interrupted(*a):original(*a);raise InterruptedError('after physical rename')
        with patch.object(carrier,'rename_noreplace',side_effect=interrupted):
            with self.assertRaises(InterruptedError):self.commit()
        self.assertTrue((self.ws/'out/final_bundle.json').is_file());self.assertEqual({p.name for p in (self.ws/'out/final').iterdir()},set(carrier.NAMES)|{'DELIVERY_MANIFEST.json'})
    def test_caps_profile_roles_and_v06_exclusion(self):
        with self.assertRaises(ValueError):self.commit(b'x'*(carrier.MAX_BYTES+1))
        sparse=self.ws/'out/sparse';f=sparse.open('wb');f.truncate(carrier.MAX_OUTPUT);f.close()
        with self.assertRaises(ValueError):self.commit()
        sparse.unlink();self.assert_absent()
        for role in ('research','critic','revision','seed'):
            v={**self.profile,'stage_role':role}
            with self.assertRaises(ValueError):carrier.validate_profile(v)
        for arm in ('control','treatment'):
            with self.assertRaises(ValueError):carrier.validate_profile({**self.profile,'arm_id':arm,'method_factors':['V06']})
        for role in ('final_resolution','critic_and_final','diagnostic-final','resolver200'):
            carrier.validate_profile({**self.profile,'stage_role':role})
        with self.assertRaises(ValueError):carrier.load_profile(self.profile_path,'0'*64)
    def test_real_existing_writer_namespace_inline_bundle_cardinality_and_receipts(self):
        configured=config.mcp_configs(self.ws,deadline_monotonic_ns=time.monotonic_ns()+10_000_000_000,public_get=True,execution_enabled=False,bundle_profile_path=self.profile_path)
        treat=config.mcp_configs(self.ws,deadline_monotonic_ns=time.monotonic_ns()+10_000_000_000,public_get=True,execution_enabled=True,bundle_profile_path=self.profile_path)
        self.assertEqual(len(configured['tool_allowlist']),4);self.assertEqual(len(treat['tool_allowlist']),5)
        writer=next(x for x in server.TOOLS if x['name']=='write_file');self.assertEqual(set(writer['inputSchema']['properties']),{'path','text'})
        requests=[{'jsonrpc':'2.0','id':1,'method':'initialize'},{'jsonrpc':'2.0','id':2,'method':'tools/list'},{'jsonrpc':'2.0','id':3,'method':'tools/call','params':{'name':'write_file','arguments':{'path':'out/final_bundle.json','text':self.raw().decode()}}}]
        cfg=configured['mcp_servers'][0];proc=subprocess.run([cfg['command'],*cfg['args']],input=b''.join(carrier.encoded(x)+b'\n' for x in requests),capture_output=True,timeout=12)
        self.assertEqual(proc.returncode,0,proc.stderr.decode());reply=json.loads(proc.stdout.splitlines()[2]);self.assertFalse(reply['result']['isError'],reply)
        result=json.loads(reply['result']['content'][0]['text']);self.assertTrue(result['delivery_commit']['native_explicit_adoption'])
        events=[json.loads(x) for x in (self.ws/'operation_receipts/events.jsonl').read_text().splitlines()];self.assertEqual([x['stage'] for x in events],['operation-started','prepared-result','stdout-flushed'])
        self.assertEqual(result['delivery_commit']['native_call_operation_id'],events[0]['operation_id']);self.assertEqual(result['delivery_commit']['native_call_argument_sha256'],events[0]['argument_sha256'])
        for name,text in self.payloads.items():self.assertEqual((self.ws/'out/final'/name).read_bytes(),text.encode())
    def test_real_namespace_reference_copy_nullable_identity(self):
        self.add_references(nullable_goal=True)
        cfg=config.mcp_configs(self.ws,deadline_monotonic_ns=time.monotonic_ns()+10_000_000_000,public_get=True,bundle_profile_path=self.profile_path)['mcp_servers'][0]
        req={'jsonrpc':'2.0','id':1,'method':'tools/call','params':{'name':'write_file','arguments':{'path':'out/final_bundle.json','text':self.raw(True).decode()}}}
        proc=subprocess.run([cfg['command'],*cfg['args']],input=carrier.encoded(req)+b'\n',capture_output=True,timeout=12)
        self.assertEqual(proc.returncode,0,proc.stderr.decode());reply=json.loads(proc.stdout);self.assertFalse(reply['result']['isError'],reply)
        result=json.loads(reply['result']['content'][0]['text']);self.assertIsNone(result['delivery_commit']['artifacts']['proposal.md']['source_role_provenance']['origin_goal_id'])
        for name,text in self.payloads.items():self.assertEqual((self.ws/'out/final'/name).read_bytes(),text.encode())
    def test_v08_optional_review_separate_v05_revision_unchanged(self):
        profile={**self.profile,'stage_role':'critic_and_final','method_factors':['V08']}
        with patch.object(server,'delivery_carrier',return_value=(carrier,profile)):
            server.perform('write_file',{'path':'out/review.md','text':'Synthetic optional review only.\n'})
            server.perform('write_file',{'path':'out/revision/witnesses.json','text':'[]\n'})
        self.assertFalse((self.ws/'out/final').exists());self.commit()
        with patch.object(server,'delivery_carrier',return_value=(carrier,profile)):
            server.perform('write_file',{'path':'out/final/review.md','text':'Synthetic optional separately authored review.\n'})
        self.assertTrue((self.ws/'out/final/review.md').is_file());self.assertEqual(set(json.loads(self.raw())['artifacts']),set(carrier.NAMES))
    def test_opt_out_existing_writer_unchanged_and_opt_in_no_partial_direct_final(self):
        with patch.object(server,'delivery_carrier',return_value=(None,None)):
            server.perform('write_file',{'path':'out/final/proposal.md','text':'ordinary opt-out text'})
        self.assertEqual((self.ws/'out/final/proposal.md').read_text(),'ordinary opt-out text')
        with patch.object(server,'delivery_carrier',return_value=(carrier,self.profile)):
            with self.assertRaises(ValueError):server.perform('write_file',{'path':'out/final/sources.json','text':'[]'})
        self.assertFalse((self.ws/'out/final/sources.json').exists())

if __name__=='__main__':unittest.main(verbosity=2)
