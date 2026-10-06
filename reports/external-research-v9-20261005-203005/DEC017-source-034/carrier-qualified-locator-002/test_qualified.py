"""Run actual original zero-inference tests against all23 qualified templates."""
from pathlib import Path
import sys,json,copy,unittest
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parent;OLD=ROOT.parent
sys.path.insert(0,str(OLD))
import test_navigation as baseline
import source_builder as owner
p=owner.p
from importlib.util import spec_from_file_location,module_from_spec
sp=spec_from_file_location('qualified_locator',ROOT/'locator.py');qualified=module_from_spec(sp);sp.loader.exec_module(qualified)
baseline.locator=qualified

class QualifiedTests(baseline.NavigationTests):
    def setUp(self):self.box=p.checked(p.ref(ROOT/'OUTBOX.json'))

    def test_initial_source_seal_and6563_old_source_files_unchanged(self):
        pin=p.checked({'path':str(OLD/'SOURCE_PIN.json'),'sha256':'05d058818f5b5fff613d6fdbbe2204cbea9cb45ea6efb1814addb37bf5c3021e'})
        for rel,digest in pin['files'].items():self.assertEqual(p.sha(OLD/rel),digest)
        self.assertEqual(len(p.checked(p.ref(OLD/'OLD_SOURCE_BYTE_SNAPSHOT.json'))['files']),6563)

    def test_all23_only_exact_qualified_locator_task_change_and_original_carriers(self):
        self.assertIn(b'authenticated populated references',qualified.render())
        self.assertIn(b'empty INLINE_ONLY only where explicitly declared',qualified.render())
        oldbox=p.checked(p.ref(OLD/'OUTBOX.json'))
        oldspecs={r['job_id']:p.checked(r['navigation_template_ref']) for r in oldbox['existing_descendant_overlays']}
        for ref in oldbox['four_final_requests']:
            for row in p.checked(ref)['stage_jobs']:oldspecs[row['job_id']]=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
        for spec in self.specs():
            old=oldspecs[spec['job_id']];before=Path(old['prompt_file']).read_bytes();after=Path(spec['prompt_file']).read_bytes()
            original=owner.locator.render();self.assertEqual(before.count(original),1);self.assertEqual(after,before.replace(original,qualified.render()))
            self.assertEqual(spec['glm_resource']['bundle_profile'],old['glm_resource']['bundle_profile'])
            for key in ['job_id','pair_id','arm','stage','max_seconds','max_responses','required_artifacts','tools_config','tools_config_sha256','declared_native_source_pin','declared_tool_source_pin']:
                self.assertEqual(spec.get(key),old.get(key))
            oldpins={Path(path).relative_to(old['workspace']).as_posix():sha for path,sha in old['input_pins'].items()}
            pins={Path(path).relative_to(spec['workspace']).as_posix():sha for path,sha in spec['input_pins'].items()};self.assertEqual(pins,oldpins)
            self.assertEqual(spec['glm_resource']['source_pins'],old['glm_resource']['source_pins'])
        self.assertEqual(len(self.specs()),23)

if __name__=='__main__':unittest.main(verbosity=2)
