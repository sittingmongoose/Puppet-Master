"""One wrong input type at each public validation/propagation seam.

Each control requires the original structured diagnostic and normal return.
An exception breaks this assertion; it is never invalid-event acceptance.
"""
import copy
import pm_event_authority_ds_round2 as ds
import pm_event_authority_ds_round3 as d3
import pm_browser_workspace_created as created
import pm_browser_workspace_created_v2 as v2
import pm_browser_workspace_reset as reset
from pm_ds_resources import memory_floor


def cases():
    gate,context,bases=d3.bases();rows=[]
    def add(uid,label,call):
        memory_floor()
        expected=call()
        assert isinstance(expected,list) and expected,(uid,label,expected)
        def broken():
            try:return call()!=expected
            except Exception:return True
        rows.append(('FAULT-'+uid+':'+label,broken))
    types=(None,False,1,'false',[])
    for model,base in bases:
        check=model.creation_preflight_failures if model is created else model.reset_preflight_failures
        for value in types:
            for field,uid in [('witness','U042' if model is created else 'U069'),('event','U043' if model is created else 'U068')]:
                changed=copy.deepcopy(base);changed[field]=value
                add(uid,model.EVENT_TYPE+':'+field+':'+repr(value),lambda b=changed,f=check:f(**b))
            if model is created:
                changed=copy.deepcopy(base);changed['event']['payload']=value
                add('U044','created:payload:'+repr(value),lambda b=changed:created.creation_preflight_failures(**b))
                for field in ('context','facts'):
                    changed=copy.deepcopy(base);changed['event']['payload'][field]=value
                    add('U045','created:'+field+':'+repr(value),lambda b=changed:created.creation_preflight_failures(**b))
            else:
                for field in ('request','result','transition'):
                    changed=copy.deepcopy(base);changed[field]=value
                    add('U071','reset:'+field+':'+repr(value),lambda b=changed:reset.reset_preflight_failures(**b))
        event=base['event'];producer=base['witness']['producer_component']
        for value in ('false',0,None,[],{}):
            add('U059',model.EVENT_TYPE+':historical:'+repr(value),
                lambda v=value,e=event,p=producer:gate.candidate_failures(e,p,context,historical=v))
        for value in types:
            add('U060',model.EVENT_TYPE+':event:'+repr(value),
                lambda v=value,p=producer:gate.candidate_failures(v,p,context))
            changed=copy.deepcopy(event);changed['payload']=value
            add('U062',model.EVENT_TYPE+':payload:'+repr(value),lambda e=changed,p=producer:gate.candidate_failures(e,p,context))
            changed=copy.deepcopy(event);changed['payload']['context']=value
            add('U063',model.EVENT_TYPE+':context:'+repr(value),lambda e=changed,p=producer:gate.candidate_failures(e,p,context))
            changed=copy.deepcopy(event);changed['migration']=value
            add('U065',model.EVENT_TYPE+':migration:'+repr(value),lambda e=changed,p=producer:gate.candidate_failures(e,p,context))
        changed=copy.deepcopy(event);changed['event_type']='browser.unknown.fixture'
        add('U061',model.EVENT_TYPE+':unknown_family',lambda e=changed,p=producer:gate.candidate_failures(e,p,context))
    checkpoint,index,obs,legacy=v2.fixture_values()
    _,reset_checkpoint,reset_index,reset_obs=reset.fixture_values()
    for value in types:
        add('U234','created:legacy_type:'+repr(value),lambda v=value:v2.legacy_failures(v))
        add('U235','created:core_type:'+repr(value),lambda v=value:v2.core_failures(v))
        add('U078','created:checkpoint_type:'+repr(value),lambda v=value:v2.checkpoint_failures(v))
        add('U089','created:source_checkpoint_type:'+repr(value),lambda v=value:v2.source_failures(v,index,obs))
        add('U091','created:source_index_type:'+repr(value),lambda v=value:v2.source_failures(checkpoint,v,obs))
        add('U090','created:source_observation_type:'+repr(value),lambda v=value:v2.source_failures(checkpoint,index,v))
        add('U094','created:advance_candidate_type:'+repr(value),lambda v=value:v2.advance_failures(None,v,index,obs))
        add('U083','created:generation_observation_type:'+repr(value),lambda v=value:v2.generation_failures(None,checkpoint,v))
        add('U085','created:generation_candidate_type:'+repr(value),lambda v=value:v2.generation_failures(None,v,obs))
        add('U095','created:cleanup_observation_type:'+repr(value),lambda v=value:v2.cleanup_failures(checkpoint,checkpoint,'absent',v))
        add('U096','created:cleanup_checkpoint_type:'+repr(value),lambda v=value:v2.cleanup_failures(v,checkpoint,'absent',obs))
        add('U078','reset:checkpoint_type:'+repr(value),lambda v=value:reset.checkpoint_failures(v))
        changed=copy.deepcopy(obs);changed['generation_transaction']=value
        add('U084','created:generation_transaction_type:'+repr(value),lambda o=changed:v2.generation_failures(None,checkpoint,o))
        changed=copy.deepcopy(reset_obs);changed['generation_transaction']=value
        add('U107','reset:generation_transaction_type:'+repr(value),lambda o=changed:reset.generation_admission_failures(None,reset_checkpoint,o))
        add('U112','reset:generic_token_type:'+repr(value),lambda v=value:reset.index_token_failures(v,reset_index,reset_obs))
        add('U112','reset:generic_index_type:'+repr(value),lambda v=value:reset.index_token_failures(reset_checkpoint['index_read_token'],v,reset_obs))
    missing=copy.deepcopy(checkpoint);missing['retired_generations']=[]
    add('U097','created:missing_cleanup_publication',lambda:v2.cleanup_failures(checkpoint,missing,'absent',obs))
    return rows
