"""Copied full-source fixture; declared input reads only, packing in owned temp."""
from pathlib import Path
import hashlib,importlib.util,importlib.machinery,json,sys,tempfile,unittest
from unittest.mock import patch
OWN=Path(__file__).absolute().parent;LAB=OWN.parents[1]
ROOT=OWN/'declaration-fixture'/LAB.name
REAL=LAB/'dev/attempt-successor-declarations-v1'
read_text=Path.read_text;read_bytes=Path.read_bytes
read=lambda p:json.loads(read_text(Path(p)))
closure=read(REAL/'DECLARATION_CLOSURE.json');lineage=read(REAL/'LINEAGE.json');freeze=read(LAB/'dev/tranche-successor-v8/SOURCE_FREEZE.json')
paths=set(closure['protocol_sha256'])|set(closure['host_input_sha256'])|set(lineage['predecessor_source_sha256'])|set(freeze['closure_sha256'])
paths.update(str(REAL/name) for name in ['test_declarations.py','materialize.py','DECLARATION_CLOSURE.json','SCORING_SCOPE_BINDING.json','ROOT_RELEASE_PATCH.json'])
paths.update(str(LAB/name) for name in ['dev/tranche-successor-v8/SOURCE_FREEZE.json','dev/prospective-timing-v3/integrated-controller/common.py','dev/prospective-timing-v3/recovery-control.json','dev/route-recovery-v2/route-assembly-v1/adapter.py','dev/route-recovery-v2/candidate_inputs.py','ops/execution-resume-v1/root-production-release-v7.json'])
control=read(LAB/'dev/prospective-timing-v3/recovery-control.json')
paths.add(control['planning_map']);paths.add(str(Path(control['planning_map']).parent/'candidate_inputs.py'))
for raw in sorted(paths):
 p=Path(raw);assert p.is_relative_to(LAB);assert not any(s in raw for s in ('/scoring-only/','/private-runtime/','/jobs/','/auth/','/credentials/'))
 dst=ROOT/p.relative_to(LAB);dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes(read_bytes(p));assert read_bytes(dst)==read_bytes(p)
(OWN/'DECLARATION_FIXTURE_INVENTORY.json').write_text(json.dumps({str(p):hashlib.sha256(read_bytes(Path(p))).hexdigest() for p in sorted(paths)},indent=2)+'\n')
def relocate(p):
 p=Path(p)
 return ROOT/p.relative_to(LAB) if p.is_relative_to(LAB) and not p.is_relative_to(OWN) else p
def text(p,*args,**kw):return read_text(relocate(p),*args,**kw)
def data(p):return read_bytes(relocate(p))
old_loader=importlib.machinery.SourceFileLoader.get_data
def loader_data(loader,path):
 p=Path(path)
 if p.is_relative_to(LAB) and not p.is_relative_to(OWN):
  target=relocate(p)
  if not target.exists():
   if p.suffix=='.pyc':raise FileNotFoundError(str(p))
   raise AssertionError('Undeclared fixture read: '+str(p))
  return read_bytes(target)
 return old_loader(loader,path)
# No subprocess, ledger transaction or write outside the owned review directory.
def audit(event,args):
 if event in ('subprocess.Popen','os.system'):raise AssertionError('process execution forbidden')
 if event=='open':
  filename,mode,flags=args
  if isinstance(filename,(str,bytes)) and ((isinstance(mode,str) and any(c in mode for c in 'wax+')) or (isinstance(flags,int) and flags & 3)):
   assert Path(filename).absolute().is_relative_to(OWN),'write outside owned lane'
sys.addaudithook(audit);sys.dont_write_bytecode=True
(OWN/'pack-temp').mkdir(exist_ok=True);tempfile.tempdir=str(OWN/'pack-temp')
path=REAL/'test_declarations.py';spec=importlib.util.spec_from_file_location('independent_copied_declaration_tests',path);module=importlib.util.module_from_spec(spec)
with patch.object(Path,'read_text',text),patch.object(Path,'read_bytes',data),patch.object(importlib.machinery.SourceFileLoader,'get_data',loader_data):
 exec(compile(read_text(ROOT/path.relative_to(LAB)),str(path),'exec'),module.__dict__)
 result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromModule(module))
 assert result.testsRun==6
sys.exit(0 if result.wasSuccessful() else 1)
