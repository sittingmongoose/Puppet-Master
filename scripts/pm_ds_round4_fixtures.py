#!/usr/bin/env python3
"""Validate DS fixture baselines; this does not isolate guards or grade proof."""
import argparse
import hashlib
import importlib
import json
from pathlib import Path
from pm_ds_resources import memory_floor

COHORTS=('binding_faults','body_faults','boundary_faults','browser_harness_faults',
         'browser_isolating','codec_controls','fault_controls','format_controls',
         'home4_isolating','home4_owner_controls','home4_physical','reset_isolating',
         'shared_harness_faults','shared_runtime_controls','structured_inputs','v2_history_controls')


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cohort',choices=COHORTS,action='append')
    parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args();result={'schema_id':'pm.ds.fixture_baselines.v1','status':'pass','rows':[],
        'claim':'Expected refusal/state/representation/fault assertions only; no guard-isolation, acceptance or clause-coverage inference.',
        'source_sha256':{}}
    for name in args.cohort or COHORTS:
        memory_floor();module=importlib.import_module('pm_ds_'+name)
        path=Path(module.__file__);result['source_sha256']['scripts/'+path.name]=hashlib.sha256(path.read_bytes()).hexdigest()
        cases=list(module.cases())
        if name=='browser_harness_faults':cases.extend(module.source_identity_controls())
        for case in cases:
            memory_floor()
            ident,call=(case['id'],case['entry']) if isinstance(case,dict) else case
            row={'id':ident,'cohort':name}
            try:row['pass']=call() is False
            except Exception as exc:row.update({'pass':False,'exception':repr(exc)})
            result['rows'].append(row)
            if not row['pass']:result['status']='fail'
            args.output.write_text(json.dumps(result,indent=2)+'\n')
        print(name,len(cases),result['status'],flush=True)
    return int(result['status']!='pass')


if __name__=='__main__':raise SystemExit(main())
