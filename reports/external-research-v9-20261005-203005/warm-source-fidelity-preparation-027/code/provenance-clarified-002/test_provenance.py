"""Actual production metadata prep of all5 clarified neutral Tasks, no Goal."""
import hashlib,json,os,sys,tempfile,time,unittest
from pathlib import Path
from unittest.mock import patch
ROOT=Path(__file__).resolve().parent;sys.dont_write_bytecode=True;sys.path.insert(0,str(ROOT.parent))
import prepare as owner
import clarify_provenance as version
p=owner.p

class ProvenanceClosureTests(unittest.TestCase):
    def test_same5_oldsource_identity_and_exact_common_provenance_suffix(self):version.verify()

    def test_actual_all5_Lproductionprepare_of_clarified_Task_B_clock_before_ANY_Goal(self):
        box=p.checked(p.ref(ROOT/'OUTBOX.json'));production=owner.module('r002_prepare',owner.LUNA/'clock_prepare.py')
        resources=owner.module('r002_resource',p.LAB/'dev/luna-route/resource_slice.py');count=0
        for ref in box['requests']:
            reg=p.checked(ref);row=reg['stage_jobs'][0];stage=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
            with tempfile.TemporaryDirectory(dir=ROOT) as directory:
                root=Path(directory);ws=root/'workspace';(ws/'inputs').mkdir(parents=True);(ws/'out').mkdir();private=root/'private';private.mkdir()
                # This Task is the neutral operator-authored generic instruction,
                # with no brief/candidate/evaluator body or scientific answer.
                raw=Path(stage['prompt_file']).read_bytes();science=raw.decode();(ws/'TASK.md').write_bytes(raw)
                manifest=p.checked(stage['required_delivery_role_manifest']);(ws/'inputs/delivery_role_manifest.json').write_bytes(Path(stage['required_delivery_role_manifest']['path']).read_bytes())
                birth=time.monotonic_ns()-10**9;total=birth+1500*10**9;action=total-15*10**9;uid=os.getuid();unit='er9mem'+'a'*32+'.slice'
                resource={'schema':'er9.luna.private-memory-profile.v1','label':stage['job_id'],'slice_unit':unit,
                    'slice_cgroup':f'/user.slice/user-{uid}.slice/user@{uid}.service/'+unit,'aggregate_memory_max_bytes':resources.TOTAL,
                    'component_memory_max_bytes':resources.CAPS,'memory_swap_max_bytes':0,'original_birth_monotonic_ns':birth,
                    'original_total_stop_monotonic_ns':total,'reader_sha256':p.sha(p.LAB/'dev/luna-route/resource_slice.py'),'SYNTHETIC_NO_NATIVE':True}
                rp=root/'resource.json';p.put(rp,resource);rp.chmod(0o600)
                with patch('subprocess.Popen',side_effect=AssertionError('NO process/native')),patch('subprocess.run',side_effect=AssertionError('NO process/native')):
                    result=production.prepare_stage(workspace=ws,private=private,label=stage['job_id'],original_birth_monotonic_ns=birth,max_seconds=1500,
                      native_stop_monotonic_ns=action,total_stop_monotonic_ns=total,resource_profile=rp,clock_declaration=Path(stage['clock_declaration']['path']),
                      clock_declaration_sha256=stage['clock_declaration']['sha256'],execution_enabled=True,public_get=True,scientific_body=science,
                      goal_objective=science,source_prompt_sha256=hashlib.sha256(raw).hexdigest(),source_TASK_sha256=hashlib.sha256(raw).hexdigest(),
                      bundle_profile=Path(stage['bundle_profile']['path']))
                self.assertFalse(result['native_calls_or_processes_started']);self.assertEqual(result['native_input'][0]['text'].encode(),raw)
                self.assertEqual((ws/'TASK.md').read_bytes(),raw);self.assertTrue(result['config']['native_bundle_enabled'])
                self.assertEqual(result['config']['initial_clock_metadata']['stage_clock']['original_candidate_action_deadline_monotonic_ns'],action)
                self.assertEqual(result['native_input'][1]['text'],result['config']['initial_clock_metadata_utf8']);count+=1
        self.assertEqual(count,5)

if __name__=='__main__':unittest.main(verbosity=2)
