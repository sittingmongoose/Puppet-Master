"""Source custody tests; a link's target is never part of the freeze."""
import importlib.util, os, subprocess, sys, tempfile, unittest
from pathlib import Path
HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('b18_freeze',HERE/'freeze.py')
f=importlib.util.module_from_spec(spec);spec.loader.exec_module(f)
class FreezeTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup);self.base=Path(self.tmp.name);self.root=self.base/'source';self.root.mkdir();(self.root/'app.js').write_bytes(b'raw\r\nbytes  \n')
 def test_regular_bytes(self):
  d=f.freeze(self.root);self.assertEqual(d['app.js']['bytes'],13);self.assertEqual(d['app.js']['sha256'],f.sha(b'raw\r\nbytes  \n'))
 def test_same_snapshot(self):self.assertEqual(f.freeze(self.root),f.freeze(self.root))
 def test_file_change_detected(self):
  a=f.freeze(self.root);(self.root/'app.js').write_text('changed');self.assertNotEqual(a,f.freeze(self.root))
 def test_missing_root_rejected(self):
  with self.assertRaises(ValueError):f.freeze(self.base/'missing')
 def test_file_root_rejected(self):
  with self.assertRaises(ValueError):f.freeze(self.root/'app.js')
 def test_link_root_rejected(self):
  link=self.base/'linked';link.symlink_to(self.root,target_is_directory=True)
  with self.assertRaises(ValueError):f.freeze(link)
 def test_directory_link_metadata_only(self):
  external=self.base/'external';external.mkdir();(external/'secret.txt').write_text('not source');(self.root/'handoff').mkdir();link=self.root/'handoff/node_modules';link.symlink_to(external,target_is_directory=True)
  a=f.freeze(self.root);self.assertEqual(a['handoff/node_modules']['kind'],'symlink_metadata_only');self.assertFalse(a['handoff/node_modules']['traversed']);self.assertFalse(any('secret' in x for x in a));(external/'secret.txt').write_text('changed external');self.assertEqual(a,f.freeze(self.root));self.assertTrue(link.is_symlink())
 def test_dangling_link(self):
  (self.root/'dead').symlink_to(self.base/'missing');self.assertEqual(f.freeze(self.root)['dead']['kind'],'symlink_metadata_only')
 def test_link_text_change_detected(self):
  p=self.root/'dead';p.symlink_to('missing1');a=f.freeze(self.root);p.unlink();p.symlink_to('missing2');self.assertNotEqual(a,f.freeze(self.root))
 def test_special_file_rejected(self):
  os.mkfifo(self.root/'pipe')
  with self.assertRaises(ValueError):f.freeze(self.root)
 def test_git_and_cache_excluded(self):
  for n in ['.git','__pycache__']:(self.root/n).mkdir();(self.root/n/'ignored').write_text('scratch')
  self.assertEqual(set(f.freeze(self.root)),{'app.js'})
 def test_cli_roundtrip_refuses_overwrite_and_internal_output(self):
  manifest=self.base/'freeze.json';cmd=[sys.executable,str(HERE/'freeze.py'),'--root',str(self.root),'--manifest',str(manifest)]
  self.assertEqual(subprocess.run(cmd,capture_output=True).returncode,0);self.assertEqual(subprocess.run(cmd+['--verify-only'],capture_output=True).returncode,0);self.assertNotEqual(subprocess.run(cmd,capture_output=True).returncode,0)
  cmd[-1]=str(self.root/'bad.json');self.assertNotEqual(subprocess.run(cmd,capture_output=True).returncode,0);self.assertFalse((self.root/'bad.json').exists())
if __name__=='__main__':unittest.main(verbosity=2)
