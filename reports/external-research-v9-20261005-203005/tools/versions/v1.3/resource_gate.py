"""Trusted pre-bwrap gate: actual private aggregate placement before code starts."""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import os
import re
import time

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('pinned_resource_reader',HERE/'resource_profile.py')
reader=importlib.util.module_from_spec(spec);spec.loader.exec_module(reader)

def main():
    p=argparse.ArgumentParser();p.add_argument('--resource-profile',required=True);p.add_argument('--unit',required=True);p.add_argument('--receipt',required=True);p.add_argument('command',nargs=argparse.REMAINDER);a=p.parse_args()
    if not re.fullmatch(r'er9-exec-[0-9a-f]{32}\.service',a.unit):raise ValueError('exact owned sandbox unit required')
    if len(a.command)<2 or a.command[0]!='--' or a.command[1]!='/usr/bin/bwrap':raise ValueError('existing sandbox command required')
    profile=reader.load(a.resource_profile)
    if time.monotonic_ns()>=profile['original_total_stop_monotonic_ns']:raise TimeoutError('original resource deadline')
    own=Path('/proc/self/cgroup').read_text().strip()
    if own!='0::'+profile['slice_cgroup']+'/'+a.unit:raise ValueError('gate process outside exact sandbox unit')
    facts=reader.verify(profile,a.unit,'sandbox')
    path=Path(a.receipt).absolute()
    if any(q.is_symlink() for q in (path,*path.parents)) or path.exists():raise ValueError('fresh trusted placement receipt required')
    record={'schema':'er9.execution.actual-resource-placement.v1','resource_profile_sha256':hashlib.sha256(Path(a.resource_profile).read_bytes()).hexdigest(),
            'resource_reader_sha256':hashlib.sha256((HERE/'resource_profile.py').read_bytes()).hexdigest(),
            'own_process_cgroup':own,'profile_slice_unit':profile['slice_unit'],'profile_slice_cgroup':profile['slice_cgroup'],
            'original_total_stop_monotonic_ns':profile['original_total_stop_monotonic_ns'],
            'verified_before_candidate_bootstrap':True,**facts}
    with path.open('x') as f:json.dump(record,f,sort_keys=True,separators=(',',':'));f.write('\n')
    os.execv(a.command[1],a.command[1:])

if __name__=='__main__':main()
