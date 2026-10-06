"""Actual captured model DTO plus negative variants; no real candidate bytes."""
import copy,json,sys,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
sys.dont_write_bytecode=True
import normalizer
import role_birth
ROOT=Path(__file__).resolve().parent;original=role_birth.original_constructor();p=original.p
CAPSULE={'path':str(p.LAB/'ops/dispatcher/strict-role-birth/C-01-CONFIRMATION-CLOCK-FRESH-R001-treatment-critique-a001/CAPSULES.json'),
         'sha256':'a2d460645d3f16f3c3c92546118ac682acb2c1dafd1a273de11bf0ab60d4b105'}
PLAN={'path':str(Path(CAPSULE['path']).parent/'PLAN.json'),'sha256':'23aa37f926930f79bbf39b2e12aecb78882505937c68e2557bace4e009fcf5ef'}

class ExactObservedModelTests(unittest.TestCase):
    def test_actual_positive_native_C01T_DTO_and_existing_canonical_string(self):
        capsule=p.checked(CAPSULE);self.assertEqual(len(capsule['rows']),1);row=capsule['rows'][0]
        self.assertEqual(row['observed_family'],'Z');self.assertEqual(row['observed_effort'],'max')
        self.assertEqual(normalizer.observed_model(row['observed_model']),normalizer.MODEL)
        self.assertEqual(normalizer.observed_model(normalizer.MODEL),normalizer.MODEL)

    def test_explicit_wrong_missing_conflicting_provider_model_and_shorthand_denied(self):
        actual=p.checked(CAPSULE)['rows'][0]['observed_model']
        wrongs=[{**actual,'providerId':'different-provider'},{**actual,'modelId':'GLM-4'},
                {'modelId':actual['modelId']},{'providerId':actual['providerId']},
                {**actual,'providerId':None},{**actual,'modelId':None},
                {**actual,'modelId':normalizer.MODEL},{**actual,'provider':'different-provider'},
                {**actual,'model':'GLM-4'},'GLM-5.3-Flash','GLM 5.3 Flash',None,{},True]
        for wrong in wrongs:
            with self.subTest(wrong=wrong),self.assertRaises(ValueError):normalizer.observed_model(wrong)

    def test_original_source_guards_remain_exact_except_private_model_function(self):
        import inspect
        base=role_birth.original_constructor()
        self.assertIs(base.observed_model,normalizer.observed_model);self.assertEqual(base.MODEL,normalizer.MODEL)
        self.assertEqual(inspect.getsourcefile(base.validated_ancestry),str(role_birth.BASE/'role_birth.py'))
        for name,digest in role_birth.BASE_FILES.items():self.assertEqual(p.sha(role_birth.BASE/name),digest)

    def test_actual_proof_metadata_with_SYNTHETIC_role_bytes_all_guards_positive_negative(self):
        # Only administrative actual metadata is read. Artifact contents are
        # synthetic, clearly labelled and confined to disposable fixtures.
        plan=p.checked(PLAN);capsule=p.checked(CAPSULE);registration=p.checked(plan['registration_ref'])
        target=next(r for r in registration['stage_jobs'] if r['job_id']==plan['job_id']);donor=next(r for r in registration['stage_jobs'] if r['job_id']==target['all_same_arm_prior_job_ids'][0])
        original_row=capsule['rows'][0];actual_freeze=p.checked(original_row['output_freeze']);context=p.checked(plan['closed_context_refs'][0])
        for defect in ['valid','provider','model','missingprovider','arm','pair','effort','family','incomplete','quiet','GoalID','goalstate','artifacthash','missingrole','context']:
            with self.subTest(defect=defect),tempfile.TemporaryDirectory(dir=ROOT) as directory:
                folder=Path(directory);freeze=copy.deepcopy(actual_freeze);freeze['SYNTHETIC_NO_NATIVE_ACTOR']=True;artifacts=[]
                stage=p.checked({'path':donor['stage_json'],'sha256':donor['stage_sha256']})
                for i,name in enumerate(stage['required_artifacts']):
                    file=folder/(str(i)+'.fixture');file.write_bytes(b'SYNTHETIC NO SCIENCE OR CANDIDATE CONTENT')
                    artifacts.append({'path':str(file),'relative_path':name.removeprefix('out/'),'sha256':p.sha(file),'bytes':file.stat().st_size})
                freeze['artifacts']=artifacts;freeze['goal_target_id']='SYNTHETIC-NOT-A-NATIVE-GOAL'
                row=copy.deepcopy(original_row);row['origin_goal_id']='SYNTHETIC-NOT-A-NATIVE-GOAL'
                if defect=='provider':row['observed_model']['providerId']='foreign-provider'
                if defect=='model':row['observed_model']['modelId']='wrong-model'
                if defect=='missingprovider':row['observed_model'].pop('providerId')
                if defect=='arm':row['arm']='control'
                if defect=='pair':row['pair_id']='OTHER-COHORT'
                if defect=='effort':row['observed_effort']='high'
                if defect=='family':row['observed_family']='L'
                if defect=='incomplete':freeze['operational_complete']=False
                if defect=='quiet':freeze['native_quiescent']=False
                if defect=='GoalID':row['origin_goal_id']='SYNTHETIC-OTHER-GOAL'
                if defect=='goalstate':row['native_goal_state']='running'
                if defect=='artifacthash':freeze['artifacts'][0]['sha256']='0'*64
                if defect=='missingrole':freeze['artifacts'].pop()
                fp=folder/'FREEZE.json';p.put(fp,freeze);row['output_freeze']=p.ref(fp);cp=folder/'CAPSULE.json';p.put(cp,{'rows':[row],'SYNTHETIC_NO_NATIVE':True})
                ctx=copy.deepcopy(context);ctx['output_freeze']=p.ref(fp);ctx['sources']=[]
                if defect=='context':ctx['owned_quiet_positive']=False
                xp=folder/'CONTEXT.json';p.put(xp,ctx)
                with patch('subprocess.Popen',side_effect=AssertionError('NO process/native')),patch('subprocess.run',side_effect=AssertionError('NO process/native')):
                    if defect=='valid':
                        selected=role_birth.validated_ancestry(plan['registration_ref'],plan['job_id'],p.ref(cp),[p.ref(xp)])
                        self.assertEqual(len(selected),1);self.assertEqual(selected[0]['origin_job_id'],donor['job_id'])
                    else:
                        with self.assertRaises(ValueError):role_birth.validated_ancestry(plan['registration_ref'],plan['job_id'],p.ref(cp),[p.ref(xp)])

    def test_all_old_source_aliases_Tasks_runtime_policies_and_caps_unchanged(self):
        snapshot=p.checked(p.ref(ROOT/'OLD_SOURCE_BYTE_SNAPSHOT.json'))
        for path,digest in snapshot['files'].items():self.assertEqual(p.sha(path),digest)
        self.assertGreater(len(snapshot['files']),6400)

if __name__=='__main__':unittest.main(verbosity=2)
