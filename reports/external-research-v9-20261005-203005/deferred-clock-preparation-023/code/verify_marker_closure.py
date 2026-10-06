#!/usr/bin/env python3
"""Read-only final marker join for all seventeen already-frozen native roles.

No old packet mutation, state/attempt scan, native start or source judgment.
The last operator marker is an additive closure, not another clock cohort.
"""
import json
from pathlib import Path
import prepare_clock as c

ROOT=Path(__file__).resolve().parent

def verify():
    c.check_frozen_sources();old_count=c.original_bytes_unchanged()
    binding=c.checked(c.ref(ROOT/'OPS_MARKER_COHORT_BINDING.json'))
    marker=c.checked(binding['actual_ops_marker_ref'])
    source=c.checked(binding['unchanged_clock_source_pin_ref'])
    outbox=c.checked(binding['unchanged_clock_outbox_ref'])
    closure=c.checked(outbox['full_cohort_freeze_ref'])
    if marker['status']!='MECHANICALLY_READY_PROSPECTIVE_CLOCK_CLOSURE_ONLY':
        raise ValueError('Actual prospective operator marker not READY')
    if marker['clock_native_pin']!=source['native_runtime_pin_ref']:
        raise ValueError('Marker/current actual native PIN mismatch')
    if marker['clock_worker_pin']!=source['actual_ops_worker_argv_pin_ref']:
        raise ValueError('Marker/current actual worker argv PIN mismatch')
    if marker['worker_path']!=source['actual_ops_worker_ref']['path']:
        raise ValueError('Marker actual worker selector mismatch')
    route=c.checked(source['actual_route_binding_ref'])
    native=c.checked(route['native_source_pin_ref'])
    entry=str(c.d.LAB/'dev/luna-route'/native['entrypoint'])
    if marker['stage_runner']!=entry or marker['tools_config_builder']!=str(Path(c.TOOLS['path']).parent/'config.py'):
        raise ValueError('Marker actual entry/config selection mismatch')
    rows=closure['source_stage_jobs']+closure['target_stage_jobs']
    if len(rows)!=17 or len(binding['stages'])!=17:raise ValueError('Exact finite17 marker closure required')
    for selected,row in zip(binding['stages'],rows):
        spec_ref={'path':row['stage_json'],'sha256':row['stage_sha256']}
        if selected['stage_ref']!=spec_ref or selected['job_id']!=row['job_id']:
            raise ValueError('Whole-cohort marker stage changed')
        spec=c.checked(spec_ref);common=c.checked(row['resource_binding'])
        if common['source_pin']!=marker['clock_native_pin'] or common['ops_worker_ref']!=source['actual_ops_worker_ref']:
            raise ValueError('Actual core/optionalB source-worker join mismatch')
        if selected['clock_declaration_ref']!=spec['clock_declaration'] or selected['resource_binding_ref']!=row['resource_binding']:
            raise ValueError('Exact frozen Task/clock/resource constructor choice changed')
        if selected['inline_only_bundle']!=bool(row['inline_only_bundle']):raise ValueError('Core/optionalB choice changed')
        if 'D-V13-B' in row['job_id']:raise ValueError('Entered D13B cannot join clock cohort')
        if (Path(spec['workspace'])/'inputs/STAGE_CLOCK.json').exists():
            raise ValueError('Prepared packet may not preclaim actual runtime birth clock')
    for r in source['source_files']:
        if c.d.p.sha(c.d.p.regular(r['path']))!=r['sha256']:raise ValueError('Frozen code dependency changed')
    return {'schema':'er9.deferred-clock-final-operator-marker-verification.v1','passed':True,
        'actual_marker_ref':binding['actual_ops_marker_ref'],'native_stages_bound':17,
        'source_jobs':5,'target_pairs':5,'target_native_stages':12,'V06_both_core':True,
        'old_positive_files_unchanged':old_count,'clock_packet_mutations':0,'native_model_or_process_calls':0,
        'native_job_admission_or_eligibility_recheck_performed':False}

if __name__=='__main__':print(json.dumps(verify()))
