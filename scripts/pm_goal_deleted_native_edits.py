"""Single binding defects with hashes rebuilt from their explicit owner preimages.

Equal values in different owners never imply equal updated hash claims.
"""
import copy
import datetime


def other(value):return value[:-1]+('1'if value[-1:]!='1'else'2')


def control_hashes(b,d):
    controls=b['original_owner_resolution'];one=b['deletion_transactions']['B1'];three=b['deletion_transactions']['B3']
    controls['original_B1']=copy.deepcopy(one);controls['original_B3']=copy.deepcopy(three)
    ad=controls['admission_control'];ack=controls['append_ack_control'];owner=controls['actual_owner_resolution']
    ad['actual_admission_snapshot']=copy.deepcopy(b['admission_authority'])
    ad['original_preflight_sha256']=d.dig(ad['original_preflight'])
    ad['before_record_sha256']=d.mpdig(one['before_record']);ad['writer']['before_record_sha256']=d.mpdig(one['before_record'])
    pub=b['original_deletion_publication'];pub['operation_value_sha256']=d.mpdig(three['operation_value']);pub['result_value_sha256']=d.mpdig(three['result_value'])
    owner.update(B1_value_sha256=d.mpdig(one),B3_value_sha256=d.mpdig(three),admission_source_sha256=d.bdig(ad),append_ack_source_sha256=d.bdig(ack),original_publication_sha256=d.bdig(pub),current_operation_sha256=d.mpdig(b['operation']),current_result_sha256=d.mpdig(b['result']),current_record_sha256=d.mpdig(b['record']))


def edit(base,operation,d):
    value=copy.deepcopy(base)
    if operation.startswith('native_'):
        b=value['args'][0];oc=b['original_owner_resolution'];ad=oc['admission_control'];ack=oc['append_ack_control'];owner=oc['actual_owner_resolution']
        if operation=='native_permission_scope':ad['permission']['actor_ref']+=':foreign'
        elif operation=='native_point_key':
            b['record_key']=other(b['record_key'])
            for row in (ad,ack,owner,ad['confirmation']):row['record_key']=b['record_key']
        elif operation=='native_operation_key':
            b['operation_key']=other(b['operation_key'])
            for row in (ad,ack,owner):row['operation_key']=b['operation_key']
            owner['B3_write_keys']=[b['operation_key'],b['result_key']]
        elif operation=='native_preflight_snapshot':b['admission_authority']['preflight']['permission_scope_ref']+=':foreign'
        elif operation in ('native_hold_set','native_hold_scope'):
            auth=b['admission_authority'];classes=auth['hold_and_ref_evaluations']
            if operation=='native_hold_set':classes[0]['ref_kind']=classes[1]['ref_kind']
            else:classes[0]['active_blocker_count']=1;classes[0]['owner_revision_ref']+=':new-hold'
            sha=d.dig(classes);auth['hold_evaluation_sha256']=sha;b['operation']['preflight']['hold_evaluation_sha256']=sha;ad['hold_evaluation_sha256']=sha
            auth['preflight']=copy.deepcopy(b['operation']['preflight']);ad['original_preflight']=copy.deepcopy(b['operation']['preflight'])
            b['deletion_transactions']['B1']['operation_value']['preflight']=copy.deepcopy(b['operation']['preflight'])
            b['deletion_transactions']['B3']['operation_value']['preflight']=copy.deepcopy(b['operation']['preflight'])
        elif operation=='native_pending_result':b['deletion_transactions']['B1']['result_value']['actor_ref']+=':foreign'
        elif operation=='native_B3_point':b['deletion_transactions']['B3']['record_value']['source_branch_id']+=':foreign'
        else:raise ValueError('unknown native edit')
        control_hashes(b,d)
    elif operation.startswith('original_'):
        row,key,auth=value['args'];custody=row['original_dispatch_custody'];n=custody['original_normalized_request'];o=custody['original_command_outcome'];u=custody['original_response']
        if operation=='original_topology':o['target_generation']+=1;n['target_generation']=o['target_generation']
        elif operation=='original_replay_wrapper':u['replayed']=True;u['original_dispatch_id']=u['dispatch_id']+':prior'
        elif operation=='original_success_event':u['event_refs']=[]
        elif operation=='original_scope':
            row['scope_partition']='project~Zm9yZWlnbi1wcm9qZWN0';key=d.result_key(row);value['args'][1]=key;auth['result_key']=key
        else:raise ValueError('unknown original result edit')
        custody['outcome_sha256']=d.dig(o);custody['response_sha256']=d.dig(u)
        auth['canonical_result_value']=copy.deepcopy(row);auth['normalized_request']=copy.deepcopy(n);auth['command_outcome']=copy.deepcopy(o);auth['ui_response']=copy.deepcopy(u)
    elif operation=='summary_foreign_result':
        import json
        from pathlib import Path
        foreign=json.loads((Path(d.__file__).parent/'joined-v3-examples.json').read_text())['positive']['owner_admitted_refused']
        for key in ('result','result_key','authenticated_dispatch'):value['args'][0][key]=copy.deepcopy(foreign[key])
    elif operation=='historical_empty_provenance':value['args'][0]['historical_admission']['owner_introduction_receipt_ref']=''
    elif operation=='checkpoint_fabricated_history':
        b=value['args'][0];pub=b['checkpoint_publication'];born=pub['initial_checkpoint']
        if pub['predecessor_checkpoint']is not None:raise ValueError('requires first-publication control')
        old=d.history_core(born);old['publication_id']+=':fabricated'
        when=datetime.datetime.fromisoformat(born['published_at_utc'].replace('Z','+00:00'))-datetime.timedelta(seconds=1)
        old['published_at_utc']=when.isoformat().replace('+00:00','Z')
        if 'updated_at_utc'in old:old['updated_at_utc']=old['published_at_utc']
        entries=[dict(checkpoint=old,retired_at_utc=born['published_at_utc'],successor_publication_id=born['publication_id'])]
        born['retired_generations']=copy.deepcopy(entries);b['checkpoint']['retired_generations']=copy.deepcopy(entries)
    elif operation=='replay_phantom_point':
        b=value['args'][0]
        from pathlib import Path
        import json
        b['record']=json.loads((Path(d.__file__).parent/'joined-v3-examples.json').read_text())['positive']['native_complete']['record']
    else:raise ValueError('unknown frozen owner edit')
    return value
