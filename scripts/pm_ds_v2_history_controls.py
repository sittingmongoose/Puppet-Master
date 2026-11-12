"""Reuse the original v2 test builders for isolated history and dispatch facts."""
import copy
import importlib.util
from datetime import datetime,timedelta
import pm_event_authority_ds_round2 as ds
import pm_browser_workspace_created_v2 as v2
import pm_browser_workspace_created as created


def cases():
    spec=importlib.util.spec_from_file_location('ds_v2_history_builders',ds.ROOT/'tests/test_pm_browser_workspace_created.py')
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    module.V2=v2
    builder=module.CreatedV2Tests();builder.setUp()
    rows=[]
    def refusal(uid,label,call):rows.append(('NEG-'+uid+':'+label,lambda:not call()))
    for field in v2.TIMES:
        if builder.cp[field] is None:continue
        # CV-1101 (part 2B): lowercase t is owner-valid; the shared predicate refuses a space separator.
        changed=copy.deepcopy(builder.cp);changed[field]=changed[field].replace('T',' ')
        refusal('U076','strict_local_timestamp:'+field,lambda c=changed:v2.checkpoint_failures(c))
    for field in ('storage_instance_id','project_id'):
        _,after,_=builder.handoff(withdrawn=True)
        old=after['retired_generations'][0]['legacy_checkpoint']
        if field=='storage_instance_id':old[field]='22222222-2222-4222-8222-222222222222'
        else:old[field]+='-foreign';old['scope_partition']=created.scope_partition(old[field])
        refusal('U081','legacy_scope:'+field,lambda a=after:v2.checkpoint_failures(a))
    for withdrawn in (False,True):
        _,after,_=builder.handoff(withdrawn=withdrawn)
        entry=after['retired_generations'][0]
        if withdrawn:entry['retired_at_utc']=entry['custody_bound_at_utc']
        else:
            wrong=datetime.fromisoformat(entry['custody_bound_at_utc'].replace('Z','+00:00'))-timedelta(seconds=1)
            entry['retired_at_utc']=wrong.isoformat().replace('+00:00','Z')
        refusal('U082','first_withdrawal_anchor:'+str(withdrawn),lambda a=after:v2.checkpoint_failures(a))
    observation=builder.bind(builder.old,builder.cp)
    def legacy_route():
        return v2.advance_failures(builder.old,builder.cp,builder.index,observation)!=['legacy_requires_coordinator_handoff']
    rows.append(('ROUTE-U093:legacy_requires_handoff',legacy_route))
    return rows
