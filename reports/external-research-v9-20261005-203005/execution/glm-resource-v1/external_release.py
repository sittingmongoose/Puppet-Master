"""Ops-only complete envelope release after the exact outer worker is terminal."""
import argparse,json
from pathlib import Path
import profile

def release(resource_path,binding_path,binding_sha):
    resource=profile.load(resource_path)
    if profile.sha(binding_path)!=binding_sha:raise ValueError('Frozen outer binding drift')
    binding=json.loads(Path(binding_path).read_text())
    if binding['resource_profile']['sha256']!=profile.sha(resource_path):raise ValueError('Outer binding resource identity drift')
    unit=binding['outer_unit'];expected=resource['slice_cgroup']+'/'+unit
    if binding['outer_placement']['unit_observation']['ControlGroup']!=expected:raise ValueError('Outer placement identity drift')
    facts=profile.reader.show(unit)
    if facts.get('ActiveState') not in ('inactive','failed') or int(facts.get('MainPID') or 0)!=0:
        raise ValueError('Outer worker not terminal; resource permit remains held')
    if facts.get('ControlGroup') not in ('',expected,None):raise ValueError('Outer unit outside private job')
    result=profile.reader.release(resource)
    result.update(outer_worker_terminal_observation=facts,outer_worker_exit_required=True,
                  original_total_stop_monotonic_ns=resource['original_total_stop_monotonic_ns'])
    return result

def main():
    p=argparse.ArgumentParser();p.add_argument('--resource-profile',required=True)
    p.add_argument('--binding',required=True);p.add_argument('--binding-sha256',required=True);p.add_argument('--out',required=True)
    a=p.parse_args();value=release(a.resource_profile,a.binding,a.binding_sha256)
    with Path(a.out).open('x') as handle:json.dump(value,handle,indent=2);handle.write('\n')
    print(json.dumps({'all_private_slice_descendants_quiet':value['all_private_slice_descendants_quiet']}))
if __name__=='__main__':main()
