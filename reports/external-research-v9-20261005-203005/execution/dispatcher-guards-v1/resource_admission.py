"""Exact private resource allocation/release; no inference or sibling mutation."""
import json,subprocess,time
from pathlib import Path
import dispatch

API_SHA='22d1cac0d12720de9d14ecef1f35e849b80c6f81a523296b023b298abaeee790'
def api(lab):
 p=lab/'dev/luna-route/resource_slice.py'
 if dispatch.sha(p)!=API_SHA:raise ValueError('owned resource API drift')
 return p

def allocate(lab,row,run,birth_ns):
 out=run/'RESOURCE_PROFILE.json'
 result=subprocess.run(['/usr/bin/python3','-B',str(api(lab)),'allocate','--label',row['job_id'],'--birth-monotonic-ns',str(birth_ns),'--max-seconds',str(row['max_seconds']),'--out',str(out)],capture_output=True,text=True,timeout=15)
 if result.returncode or not out.exists():raise ValueError('Exact private resource allocation failed before native launch')
 profile=json.loads(out.read_text())
 if profile['aggregate_memory_max_bytes']!=2415919104 or profile['memory_swap_max_bytes']!=0 or profile['original_birth_monotonic_ns']!=birth_ns:raise ValueError('Allocated profile/cap/clock mismatch')
 row.update(resource_profile={'path':str(out),'sha256':dispatch.sha(out)},resource_slice_unit=profile['slice_unit'],resource_slice_cgroup=profile['slice_cgroup'],declared_complete_bound_kb=2359296,permit_release_confirmed=False)
 return profile

def release(lab,row):
 pointer=row.get('resource_profile')
 if not pointer or row.get('private_slice_release'):return
 p=Path(pointer['path'])
 if dispatch.sha(p)!=pointer['sha256']:raise ValueError('Allocated private profile drift')
 out=p.parent/'PRIVATE_SLICE_RELEASE.json'
 if not out.exists():
  result=subprocess.run(['/usr/bin/python3','-B',str(api(lab)),'release','--profile',str(p),'--out',str(out)],capture_output=True,text=True,timeout=15)
  if result.returncode or not out.exists():raise ValueError('Private exact-slice release unavailable; retain permit')
 fact=json.loads(out.read_text());row['private_slice_release']={'path':str(out),'sha256':dispatch.sha(out)};row['permit_release_confirmed']=fact.get('all_private_slice_descendants_quiet') is True
 dispatch.event(lab,'PRIVATE_COMPLETE_ENVELOPE_RELEASE_OBSERVED',job_id=row['job_id'],permit_release_confirmed=row['permit_release_confirmed'],release_sha256=dispatch.sha(out))

def remaining_growth_kb(state):
 growth=0;unknown=[]
 for row in state['jobs']:
  if row.get('family') not in ('L','Z') or not (row['status'] in ('STARTING','RUNNING') or row.get('permit_release_confirmed') is False):continue
  if not row.get('resource_profile'):
   # Old outer worker has no proven cap. Keep old policy and disclose this
   # missing upper bound; do not overlap a newly claimed full envelope with it.
   unknown.append(row['job_id']);continue
  cg=Path('/sys/fs/cgroup')/row['resource_slice_cgroup'].lstrip('/')
  current=int((cg/'memory.current').read_text()) if (cg/'memory.current').exists() else 0
  growth+=max(0,row['declared_complete_bound_kb']-(current+1023)//1024)
 return growth,unknown
