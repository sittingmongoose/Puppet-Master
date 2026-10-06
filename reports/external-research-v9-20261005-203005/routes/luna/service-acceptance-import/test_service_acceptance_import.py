"""Zero-inference absolute import-context regression; no old/live edits."""
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
import test_service_acceptance_projection as legacy

HERE=Path(__file__).resolve().parent
READER=HERE/'service_acceptance_projection_v1_1.py'
spec=importlib.util.spec_from_file_location('acceptance_v1_1_test',READER)
reader=importlib.util.module_from_spec(spec);spec.loader.exec_module(reader)
legacy.extract=reader.extract


class ImportContextTests(unittest.TestCase):
    def test_arbitrary_cwd_isolated_import_and_real_extraction(self):
        with tempfile.TemporaryDirectory(prefix='er9-acceptance-import-') as temp:
            root=Path(temp);legacy.fixture(root)
            code="""import importlib.util,json,sys
from pathlib import Path
p=Path(sys.argv[1]);spec=importlib.util.spec_from_file_location('owner_acceptance',p)
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
r=m.extract(Path(sys.argv[2]),100,'11111111-1111-1111-1111-111111111111',200)
assert r['active_attempt_acceptance_observed'] is True
assert str(p.parent) not in sys.path
assert 'DO_NOT_EXPORT_PRIVATE' not in json.dumps(r)
print(json.dumps({'accepted':True,'no_global_path_change':True}))
"""
            p=subprocess.run(['/usr/bin/python3','-I','-B','-c',code,str(READER),str(root)],
                cwd=root,capture_output=True,text=True,timeout=5)
            self.assertEqual(p.returncode,0,p.stderr)
            self.assertTrue(json.loads(p.stdout)['accepted'])
    def test_cli_help_isolated_import_and_old_reader_unchanged(self):
        with tempfile.TemporaryDirectory(prefix='er9-acceptance-cli-') as temp:
            p=subprocess.run(['/usr/bin/python3','-I','-B',str(READER),'--help'],
                cwd=temp,capture_output=True,text=True,timeout=5)
            self.assertEqual(p.returncode,0,p.stderr)
        self.assertEqual(hashlib.sha256((HERE/'service_acceptance_projection.py').read_bytes()).hexdigest(),
                         '6e5c8e6a5c055788ced67fadda72fadfb74c916ba80e424d82daa80327b72a43')


if __name__=='__main__':
    suite=unittest.TestSuite([unittest.defaultTestLoader.loadTestsFromTestCase(legacy.AcceptanceTests),
                            unittest.defaultTestLoader.loadTestsFromTestCase(ImportContextTests)])
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    receipt={'schema':'er9.luna.service-acceptance-import-regression.v1','tests':result.testsRun,
        'passed':result.wasSuccessful(),'native_goal_starts':0,'old_live_reader_and_runtime_unchanged':True,
        'test_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'reader_sha256':hashlib.sha256(READER.read_bytes()).hexdigest()}
    (HERE/'SERVICE_ACCEPTANCE_IMPORT_REGRESSION.json').write_text(json.dumps(receipt,indent=2)+'\n')
    raise SystemExit(0 if result.wasSuccessful() else 1)
