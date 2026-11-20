"""Reset complete-entry joins/state controls with coherent observations."""
import copy
import importlib.util
from datetime import datetime, timedelta
import pm_browser_workspace_reset as owner
import pm_event_authority_ds_round2 as ds
from pm_ds_home4_isolating import replace_strings


def stamp(value,seconds):
    # Builds a new uppercase-Z fixture time; the checker orders times with its own exact CV-1101 key.
    return (datetime.fromisoformat(value.replace('Z','+00:00'))+timedelta(seconds=seconds)).isoformat().replace('+00:00','Z')


def cases():
    base,cp,index,observation=owner.fixture_values()
    gate=owner.sibling('pm-browser-event-admission',ds.ROOT)
    digest=gate.envelope_oracle().event_producer_semantic_digest
    rows=[]
    def add(uid,label,call,kind='refusal'):
        rows.append({'id':'NEG-'+uid+':reset:'+label,'entry':call,'kind':kind})
    def refusal(uid,label,errors):
        rows.append({'id':'NEG-'+uid+':reset:'+label,'entry':lambda:not errors(),'errors':errors,'kind':'refusal'})
    def checkpoint(uid,label,value):
        def errors():return owner.checkpoint_failures(copy.deepcopy(value))
        rows.append({'id':'NEG-'+uid+':reset:'+label,'entry':lambda:not errors(),'errors':errors,'kind':'refusal'})
    def oracle(subject=None):
        t=base['transition']
        return owner.ResetOracle(t['subject'] if subject is None else subject,t['checked_workspace_revision'],t['prior_workspace_generation'],digest)
    subject=copy.deepcopy(base['transition']['subject']);subject['browser_workspace_id']+='-foreign'
    def wrong_subject():
        model=oracle(subject)
        result=model.reset(**copy.deepcopy(base),append_outcome='committed',admitted=True)
        return result!='wrong_owner_subject_no_reset' or (model.reset_count,model.append_count,model.publication_count)!=(0,0,0)
    add('U236','valid_proposal_for_another_owned_subject',wrong_subject,'state_assertion')
    def bad_append():
        model=oracle();result=model.reset(**copy.deepcopy(base),append_outcome='unsupported',admitted=True)
        return result!='invalid_append_outcome_no_reset' or (model.reset_count,model.append_count,model.publication_count)!=(0,0,0)
    add('U241','unsupported_append',bad_append,'state_assertion')
    def bad_resolution():
        model=oracle()
        assert model.reset(**copy.deepcopy(base),append_outcome='unknown',admitted=True)=='reset_effect_committed_event_pending_recovery'
        key=next(iter(model.pending));semantic=model.pending[key]['digest'];pending=copy.deepcopy(model.pending)
        result=model.resolve_append(key,semantic,'unsupported')
        return result!='invalid_append_resolution' or model.pending!=pending or (model.reset_count,model.append_count,model.publication_count)!=(1,0,0)
    add('U247','unsupported_pending_resolution',bad_resolution,'state_assertion')
    for missing in (True,False):
        before=None if missing else {**copy.deepcopy(cp),'unexpected':True}
        def unavailable(before=before):
            model=owner.CheckpointOracle(before)
            try:result=model.withdraw(stamp(cp['published_at_utc'],10))
            except Exception:return True
            return result!='checkpoint_unavailable' or model.checkpoint!=before or model.commit_count!=0
        add('U262','unavailable_withdrawal:'+str(missing),unavailable,'structured_fault')
    prior=copy.deepcopy(cp);prior['updated_at_utc']=stamp(cp['published_at_utc'],20)
    candidate=copy.deepcopy(cp);candidate['updated_at_utc']=stamp(cp['published_at_utc'],10)
    obs=copy.deepcopy(observation);obs['prior_checkpoint']=copy.deepcopy(prior)
    def regression(prior=prior,candidate=candidate,obs=obs,index=index):
        model=owner.CheckpointOracle(prior)
        result=model.advance(copy.deepcopy(candidate),copy.deepcopy(index),copy.deepcopy(obs),admitted=True)
        return result!='checkpoint_observation_regression' or model.checkpoint!=prior or model.commit_count!=0
    add('U260','valid_frontier_refresh_before_last_observation',regression,'state_assertion')
    value=copy.deepcopy(cp);value['storage_instance_id']='22222222-2222-4222-8222-222222222222'
    checkpoint('U102','source_token_belongs_to_original_store',value)
    for field in ('updated_at_utc','published_at_utc'):
        # CV-1101 (part 2B): lowercase t is owner-valid; the shared predicate refuses a space separator.
        value=copy.deepcopy(cp);value[field]=value[field].replace('T',' ')
        checkpoint('U104','timestamp_spelling:'+field,value)
    if cp['source_cursor'] is not None:
        for name in ('first_retained','last_sequence','frame_end'):
            value=copy.deepcopy(cp)
            if name=='first_retained':value['first_retained_sequence_id']=value['index_through_sequence_id']+1
            elif name=='last_sequence':value['source_cursor']['last_sequence_id']+=1
            else:value['source_cursor']['byte_offset']=value['source_cursor']['frame_end_offset']
            checkpoint('U103','range_join:'+name,value)
    value=copy.deepcopy(cp);value['updated_at_utc']=stamp(cp['published_at_utc'],-1)
    checkpoint('U106','birth_after_observation',value)
    value=copy.deepcopy(cp);value.update(state='withdrawn',withdrawn_at_utc=stamp(cp['published_at_utc'],-1),updated_at_utc=stamp(cp['published_at_utc'],2))
    checkpoint('U106','birth_after_first_withdrawal',value)
    for mode in ('withdrawn','late_observation'):
        after=copy.deepcopy(cp)
        if mode=='withdrawn':after.update(state='withdrawn',withdrawn_at_utc=after['published_at_utc'])
        else:after['updated_at_utc']=stamp(after['published_at_utc'],1)
        observed=copy.deepcopy(observation);observed['generation_transaction']['after']=copy.deepcopy(after)
        refusal('U108','generation_birth:'+mode,lambda a=after,o=observed:owner.generation_admission_failures(None,a,o))
    changed_index=copy.deepcopy(index);node=changed_index['generations'][changed_index['current_generation_id']]
    node['frontier']['source_selection']['storage_instance_id']='22222222-2222-4222-8222-222222222222'
    token=copy.deepcopy(cp['index_read_token']);token['source_selection']=copy.deepcopy(node['frontier']['source_selection'])
    token['frontier_sha256']=owner.digest(node['frontier'])
    observed=copy.deepcopy(observation);observed['source_selection']=copy.deepcopy(node['frontier']['source_selection'])
    refusal('U114','source_storage_with_fresh_frontier_pins',lambda:owner.index_token_failures(token,changed_index,observed))
    spec=importlib.util.spec_from_file_location('ds_reset_history_builders',ds.ROOT/'tests/test_pm_browser_workspace_reset.py')
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    builder=module.CheckpointRetentionTests();builder.setUp()
    after,obs=builder.successor();before=copy.deepcopy(builder.oracle.checkpoint)
    assert not owner.checkpoint_failures(after)
    value=copy.deepcopy(after);value['retired_generations'][0]['successor_publication_id']=value['retired_generations'][0]['checkpoint_core']['publication_id']
    checkpoint('U099','self_successor_publication',value)
    value=copy.deepcopy(after);old=value['retired_generations'][0]['checkpoint_core']
    old['project_id']+='-foreign';old['scope_partition']=owner.scope_partition(old['project_id'])
    checkpoint('U099','foreign_project_with_encoded_partition',value)
    value=copy.deepcopy(after);old=value['retired_generations'][0]['checkpoint_core']
    old.update(withdrawn_at_utc=stamp(value['published_at_utc'],1),updated_at_utc=stamp(value['published_at_utc'],1))
    checkpoint('U100','retired_lifetime_overlaps_successor',value)
    refreshed=copy.deepcopy(cp);refreshed['updated_at_utc']=stamp(cp['published_at_utc'],20)
    builder.oracle=owner.CheckpointOracle(refreshed)
    early,early_obs=builder.successor('publication:reset-early-successor',stamp(cp['published_at_utc'],10))
    assert not owner.checkpoint_failures(refreshed) and not owner.checkpoint_failures(early)
    def early_birth(before=refreshed,after=early,observed=early_obs):
        model=owner.CheckpointOracle(before)
        result=model.replace(copy.deepcopy(after),copy.deepcopy(index),copy.deepcopy(observed),admitted=True)
        return result!='generation_admission_invalid_no_advance' or model.checkpoint!=before or model.commit_count!=0
    add('U110','successor_before_valid_prior_observation',early_birth,'state_assertion')
    # Optional command subjects change together, leaving the resolved source
    # context and transition authoritative and unchanged.
    for fields in (('browser_page_id','page_generation'),('browser_program_id',),('program_workspace_id',)):
        changed=copy.deepcopy(base)
        for side in ('request','result'):
            for field in fields:changed[side]['scope'][field]=1 if field=='page_generation' else 'subject-foreign'
        refusal('U075','optional_subject:'+','.join(fields),lambda b=changed:owner.reset_preflight_failures(**b))
    return rows
