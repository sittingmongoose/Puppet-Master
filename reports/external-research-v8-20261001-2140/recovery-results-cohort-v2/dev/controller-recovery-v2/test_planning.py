"""Offline controller planning-pin regression; no native launch or ledger writes."""
import ast
import hashlib
import importlib.util
import json
from pathlib import Path

BASE=Path(__file__).resolve().parents[1]
NEW=Path(__file__).resolve().parent
OLD=BASE/'route-recovery-v1'
spec=importlib.util.spec_from_file_location('controller_common_v2',NEW/'integrated-controller/common.py')
common=importlib.util.module_from_spec(spec);spec.loader.exec_module(common)
inputs=common.load('original_assigned_inputs',OLD/'candidate_inputs.py')
# Independent oracle is the original helper with its sole invalid operator repaired
# in memory. The on-disk original module is never changed.
source=(OLD/'candidate_inputs.py').read_text()
assert source.count("root[s['task_template']]")==1
oracle={ '__file__':str(OLD/'candidate_inputs.py') }
exec(compile(source.replace("root[s['task_template']]","root/s['task_template']"),str(OLD/'candidate_inputs.py'),'exec'),oracle)
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
oldfreeze=json.loads((OLD/'integrated-controller/SOURCE_FREEZE.json').read_text())
assert all(sha(p)==d for p,d in oldfreeze['closure_sha256'].items())
items=json.loads((OLD/'INPUT_MAP.json').read_text())['cases']
assert len(items)==24
cases=[];negative=0
for case in items:
 paths=oracle['required_files'](case)
 pins={str(p):sha(p) for p in paths}
 release={'planning_input_sha256':pins}
 assert common.check_planning(release,case)['case_id']==case
 # Every assigned file is required, including all three exact templates.
 for p in pins:
  bad=dict(pins);bad.pop(p)
  try: common.check_planning({'planning_input_sha256':bad},case)
  except ValueError as error:
   assert str(error)=='assigned prospective planning source drift';negative+=1
  else:raise AssertionError('missing assigned pin accepted: '+p)
 cases.append({'case':case,'assigned_pin_count':len(pins),'passed':True})
# Exercise prospective selections for both members of one nonnative pair rebound
# to Z; source metadata/templates remain exactly the original assigned sources.
rebound={c:dict(items[c],family_provisional='Z') for c in ('V8-BIO-RETR-C-M','V8-BIO-RETR-T-M')}
for case in rebound:
 pins={str(p):sha(p) for p in oracle['required_files'](case,rebound)}
 assert common.check_planning({'case_sources':rebound,'planning_input_sha256':pins},case)['case_id']==case
 assert inputs.source_access(case,rebound).is_file()
draft=json.loads((BASE.parent/'ops/execution-recovery-v1/root-production-release-v1.draft.json').read_text())
first=common.CONTROL['default_queue']
expected={str(p):sha(p) for case in first for p in oracle['required_files'](case)}
assert len(expected)==20 and draft['planning_input_sha256']==expected
for case in first:assert common.check_planning(draft,case)['case_id']==case
assert common.ROLES==[('research-proposal',1800,'PROPOSAL.md'),('independent-candidate-critic',600,'CRITIQUE.md'),('final-correction',600,'FINAL_PROPOSAL.md')]
assert common.STOP_EPOCH==1790948409
assert common.EXECUTION==OLD/'execution-path-v1' and common.ASSEMBLY==OLD/'route-assembly-v1'
assert (NEW/'recovery-control.json').read_bytes()==(OLD/'recovery-control.json').read_bytes()
for p in (NEW/'integrated-controller').glob('*.py'):ast.parse(p.read_text())
assert all(sha(p)==d for p,d in oldfreeze['closure_sha256'].items())
report={'schema':'er8.controller-planning-regression.v1','verdict':'passed','registered_cases':cases,'registered_case_count':24,'missing_pin_rejections':negative,'prospective_nonnative_Z_source_rebinds':list(rebound),'first_pair':first,'first_pair_exact_pin_count':20,'first_pair_exact_pins':expected,'original_45_file_closure_verified':len(oldfreeze['closure_sha256']),'native_starts':0,'provider_calls':0,'case_births':0,'control_copy_byte_identical':True,'mechanics_caps_unchanged':[1800,600,600],'host_cap_seconds':300}
(NEW/'REGRESSION.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ('registered_cases','first_pair_exact_pins')}))
