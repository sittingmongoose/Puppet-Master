#!/usr/bin/env python3
"""Exact positive26 table, coupled carrier binding and opaque preservation."""
import importlib.util
from pathlib import Path
import tempfile
import time
import unittest
import prepare_successors as p
import prepare_bundle_transport as t
import prepare_ordinary_bundle as ordinary
import hydrate_role_proofs as h

ROOT=Path(__file__).resolve().parent
class OrdinaryPairedBundleTests(unittest.TestCase):
    def setUp(self):
        self.outbox=p.checked(p.ref(ROOT/'ordinary-bundle001/OUTBOX.json'))
        self.requests=[p.checked(r) for r in self.outbox['requests']]
        self.source=p.checked(ordinary.REQUEST)
        self.source_jobs={r['job_id']:r for r in self.source['rows']}

    def test_exact26_13paired_no_v06_no_unselected_duplicate(self):
        self.assertEqual(len(self.requests),13);self.assertEqual(sum(len(r['stage_jobs']) for r in self.requests),26)
        selected=[]
        for r in self.requests:
            self.assertEqual({j['arm'] for j in r['stage_jobs']},{'control','treatment'})
            self.assertFalse(r['root_scope_required']);self.assertFalse(r['root_or_max_go_required'])
            card=p.checked({'path':r['card_path'],'sha256':r['card_sha256']});self.assertNotEqual(card['method_id'],'V06')
            closure=p.checked(r['pipeline_closure']);self.assertTrue(closure['both_arms_complete_before_either_native_target'])
            self.assertEqual(closure['common_final_reference_policy'],'INLINE_ONLY')
            for j in r['stage_jobs']:selected.append(j['source_job_id'])
        self.assertEqual(set(selected),set(self.source_jobs));self.assertEqual(len(selected),len(set(selected)))

    def test_exact_full_source_task_input_factor_budget_card_meaning(self):
        for r in self.requests:
            card=p.checked({'path':r['card_path'],'sha256':r['card_sha256']})
            source_card=p.checked(self.source_jobs[r['stage_jobs'][0]['source_job_id']]['card_ref'])
            changes={'pair_id','source_pair_id','resource_version','requested_family','candidate_family','required_resource_binding'}
            self.assertEqual({k:v for k,v in card.items() if k not in changes},{k:v for k,v in source_card.items() if k not in changes})
            for j in r['stage_jobs']:
                spec=p.checked({'path':j['stage_json'],'sha256':j['stage_sha256']});old=p.checked(spec['source_stage_ref'])
                self.assertEqual(Path(spec['prompt_file']).read_bytes(),Path(old['prompt_file']).read_bytes()+t.addendum(spec['job_id']).encode())
                for field in p.INVARIANTS:self.assertEqual(spec.get(field),old.get(field))
                for path,digest in old['input_pins'].items():
                    rel=Path(path).relative_to(old['workspace']);self.assertEqual(p.sha(path),digest)
                    self.assertEqual(p.sha(Path(spec['workspace'])/rel),digest)
                self.assertEqual(spec['required_artifacts'],t.FINAL_PATHS)

    def test_real_zero_entry_profile_config_no_role_adoption_or_fifth_artifact(self):
        path=p.LAB/'dev/tools/versions/v1.4-bundle/config.py'
        loader=importlib.util.spec_from_file_location('ordinary_actual_bundle_config',path)
        config=importlib.util.module_from_spec(loader);loader.loader.exec_module(config)
        carrier=h.tool_module().carrier
        for r in self.requests:
            for j in r['stage_jobs']:
                spec=p.checked({'path':j['stage_json'],'sha256':j['stage_sha256']});ws=Path(spec['workspace'])
                profile=carrier.load_profile(spec['bundle_profile']['path'],spec['bundle_profile']['sha256'])
                closure=carrier.reference_closure(profile,lambda rel:(ws/rel).read_bytes())
                self.assertEqual(closure,{})
                self.assertEqual(profile['actor_binding']['native_goal_id'],None)
                self.assertEqual(set(profile['allowed_outputs']),set(t.FINAL_ROLES))
                with tempfile.TemporaryDirectory(dir=ROOT) as directory:
                    result=config.mcp_configs(ws,capture_dir=Path(directory)/'captures',evidence_dir=Path(directory)/'evidence',
                        deadline_monotonic_ns=time.monotonic_ns()+int(spec['max_seconds'])*10**9,
                        execution_enabled=j['execution_enabled'],public_get=j['public_get'],bundle_profile_path=spec['bundle_profile']['path'])
                    self.assertTrue(result['native_bundle_enabled'])
                    self.assertEqual(result['execution_enabled'],j['execution_enabled'])
                self.assertFalse((ws/'out/final').exists())

if __name__=='__main__':unittest.main(verbosity=2)
