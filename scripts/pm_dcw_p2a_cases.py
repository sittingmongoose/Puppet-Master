"""Focused full-checker witnesses for previously unproved DCW assertion rows.

Every builder starts from a valid family control. Trusted owner observations and
all derived index/receipt copies move with the one changed source fact. No
checker repairs an input during execution and no predicate is weakened here.
"""
import copy
import json

import pm_dcw_event_oracles as m
import pm_dcw_blockage_events as b
from pm_dcw_blockage_fixtures import base, seal, sync_payload
from pm_dcw_event_fixtures import event_slots, seal_originals
from pm_dcw_event_regressions import scenario
from pm_dcw_index_fixtures import rehash
from pm_dcw_registered_cases import mixed


def source_result(value, field, replacement):
    result=value['source'].get('result') or value['source']['phases'][-1]['result']
    result[field]=replacement
    value['authority']['results'][result['result_ref']]=copy.deepcopy(result)


def source_request(value, field, replacement):
    value['source']['request'][field]=replacement
    request=value['source']['request']
    value['authority']['requests'][request['request_ref']]=copy.deepcopy(request)


def sync_index(value):
    """Reissue derived observations without repairing the changed source fact."""
    from pm_dcw_index_fixtures import snapshot_source
    index=value['index'];source=index['current_source'];root=index['checkpoint']['storage_instance_id']
    source['source_selection']=m.index_selection(source,root)
    value['index'],value['reader']=snapshot_source(source,root)


# Sweep part 2A fix 1 helpers: anchors, generations and tokens move together.
def _generation(value):
    cp=value['index']['checkpoint'];return cp,cp['generations'][cp['current_generation_id']]


def _anchor_tokens(value):
    cp,g=_generation(value);digest=m.index_binding(g['anchor'])
    for token in (value['reader']['live_token'],value['reader']['durable_token']):
        token['generation_anchor_sha256']=digest


def _reissue_generation(value):
    idx=value['index'];cp,g=_generation(value)
    gid=m.index_generation(cp['storage_instance_id'],g['anchor'])
    dataset='event_record_index.v2@'+gid;old=g['index_dataset_name']
    g['generation_id']=gid;g['index_dataset_name']=dataset
    cp['current_generation_id']=gid;cp['generations']={gid:g}
    idx['datasets']={dataset:idx['datasets'][old]}
    for tx in idx['committed_transactions']:tx['generation_id']=gid
    for token in (value['reader']['live_token'],value['reader']['durable_token']):
        token['generation_id']=gid;token['index_dataset_name']=dataset
        token['checkpoint_ref']=idx['checkpoint_key']+'#/generations/'+gid
    _anchor_tokens(value)


def _rebuild_source(value):
    import base64,hashlib
    from pm_dcw_index_fixtures import snapshot_source
    source=value['index']['current_source'];frames=source['frames']
    root=value['index']['checkpoint']['storage_instance_id'];blobs=[];segments=[]
    for seg in source['segments']:
        members=[f for f in frames if (f['segment_generation'],f['segment_name'])==(seg['segment_generation'],seg['segment_name'])]
        blob=b''
        for frame in members:
            raw=m.canonical_msgpack(frame['event'])
            frame['source_value_bytes_base64']=base64.b64encode(raw).decode()
            frame['byte_offset']=len(blob);frame['frame_end_offset']=len(blob)+len(raw)
            frame['source_schema_id']=frame['event']['schema_id']
            frame['source_schema_version']=frame['event']['schema_version'];blob+=raw
        blobs.append(blob)
        segments.append(dict(segment_generation=seg['segment_generation'],segment_name=seg['segment_name'],
            state=seg['state'],scan_start_offset=0,scanned_through_offset=len(blob),
            source_durable_end_offset=len(blob),source_durable_bytes_sha256=hashlib.sha256(blob).hexdigest(),
            retained_event_count=len(members),
            first_sequence_id=members[0]['event']['sequence_id'] if members else None,
            last_sequence_id=members[-1]['event']['sequence_id'] if members else None))
    source['segments']=segments;source['manifest']['retained_inventory']=copy.deepcopy(segments)
    source['manifest']['durable_watermarks']=[dict(segment_name=s['segment_name'],
        durable_end_offset=s['source_durable_end_offset']) for s in segments]
    source['manifest']['survivor_prefix_sha256']=m.index_prefix(frames)
    source['source_bytes_base64']=base64.b64encode(b''.join(blobs)).decode()
    source['source_selection']=m.index_selection(source,root)
    value['index'],value['reader']=snapshot_source(source,root)


def _add_generation(value,mode):
    cp,g=_generation(value);gid=cp['current_generation_id'];added=copy.deepcopy(g)
    if mode=='O216':
        key='eig_'+'f'*64
    elif mode=='O217':
        key='eig_'+'f'*64;added['generation_id']=key
        added['index_dataset_name']='event_record_index.v2@'+key
    else:
        added['anchor']['generation_seed_sha256']='f'*64
        key=m.index_generation(cp['storage_instance_id'],added['anchor']);added['generation_id']=key
        added['index_dataset_name']='event_record_index.v2@eig_'+'f'*64 if mode=='O218' else 'event_record_index.v2@'+key
    added['state']='current' if mode=='O219' else 'retired'
    if mode=='O219':added['retired_at_utc']=None;added['successor_generation_id']=None
    else:added['retired_at_utc']='2026-09-11T19:00:00Z';added['successor_generation_id']=gid
    cp['generations'][key]=added


def cases():
    families={r['event_type']:r for r in m.load('Plans/dcw_event_contract_fixtures.json')['families']}
    requested=families['bundle.revision_requested'];completed=families['bundle.revision_completed']
    opened=families['wizard.opened']
    def specimen(target,row,mutate,expected,*,seed=None,operation='publish',overrides=None,kind=None):
        control=copy.deepcopy(seed if seed is not None else row['positive'])
        value=copy.deepcopy(control);mutate(value)
        return dict(id=row['event_type']+'/p2a/'+target,family=row['event_type'],row=row,value=value,
                    operation=operation,expected=expected,target=target,repair=control,
                    kind=kind,overrides=overrides or {})
    def custody(value):return value['authority']['custody'][value['event']['event_id']]
    def group(value):return value['authority']['durable_groups'][custody(value)['first_append_receipt']['commit_group_id']]
    yield specimen('O032',requested,lambda v:custody(v).__setitem__('event_id','evt-foreign-original'),'receipt_identity')
    yield specimen('O034',requested,lambda v:custody(v).__setitem__('idempotency_key','foreign-original:key'),'receipt_identity')
    yield specimen('O045',requested,lambda v:group(v).__setitem__('segment_generation',99),'receipt_group')
    yield specimen('O048',requested,lambda v:group(v).__setitem__('event_ids',[]),'receipt_group')
    yield specimen('O049',requested,lambda v:group(v).__setitem__('durability_class','foreign-class'),'receipt_durability')
    yield specimen('O039',requested,lambda v:custody(v)['first_append_receipt'].__setitem__('event_id','evt-foreign-original'),'receipt_event_sequence')
    yield specimen('O065',requested,lambda v:source_result(v,'intent_ref','intent:foreign'),'result_kind')
    yield specimen('O070',requested,lambda v:source_result(v,'occurred_at_utc','2026-11-07T12:00:00Z'),'result_join')
    yield specimen('O074',completed,lambda v:v['authority'].__setitem__('outcomes',[]),'result_outputs')
    yield specimen('O093',opened,lambda v:source_request(v,'request_id','request:foreign'),'request_identity')
    yield specimen('O091',opened,lambda v:source_result(v,'request_ref','request:foreign'),'result_join')
    def actor(value):
        value['event']['actor_ref']='actor:foreign'
        for slot in event_slots(value):
            if slot['prepared_event']['event_id']==value['event']['event_id']:
                slot['prepared_event']['actor_ref']='actor:foreign'
        seal_originals(value)
    yield specimen('O094',opened,actor,'source_actor')
    yield specimen('O096',opened,lambda v:source_request(v,'expected_child_revision',999),'child_currentness')
    yield specimen('O098',opened,lambda v:source_request(v,'expected_child_sha256','f'*64),'child_currentness')
    def child(value):
        value['source']['child']['sha256']='f'*64
        value['authority']['children'][value['source']['result']['child_ref']]=copy.deepcopy(value['source']['child'])
    yield specimen('O099',opened,child,'child_currentness')
    for target,field,bad in [('O102','seed_ref','seed:foreign'),
                             ('O104','project_context_snapshot_ref','context:foreign'),
                             ('O105','project_context_snapshot_hash','f'*64)]:
        yield specimen(target,opened,lambda v,f=field,x=bad:source_result(v,f,x),'seed_result')
    registry=m.load('Plans/storage_value_registry.json')
    for target,field,bad in [('O137','redb_file','derived'),('O138','storage_group','foreign'),('O139','max_value_bytes',16385)]:
        changed=copy.deepcopy(registry)
        changed['storage_profile']['family_profiles'][requested['source_family']][field]=bad
        yield specimen(target,requested,lambda v:None,'source_storage_profile',kind='configured',
                       overrides={'Plans/storage_value_registry.json':changed})
    yield specimen('O153',requested,lambda v:v['control'].__setitem__('selected_storage_instance_id','22222222-2222-4222-8222-222222222222'),'storage_instance')
    def epoch(value):
        value['control']['selected_recovery_epoch']=float(value['control']['selected_recovery_epoch'])
        value['authority']['recovery_epoch']=float(value['authority']['recovery_epoch'])
    yield specimen('O155',requested,epoch,'restore_epoch')
    restored=scenario(requested,next(c for c in requested['cases'] if c['case_id']=='coherent_restore_preserves_original_bytes'))
    yield specimen('O157',requested,lambda v:v['authority'].__setitem__('restore_admission',None),'restore_epoch',seed=restored)
    yield specimen('O159',requested,lambda v:v['authority']['restore_admission'].__setitem__('recovery_epoch',2),'restore_admission',seed=restored)
    yield specimen('O160',requested,lambda v:v['authority']['restore_admission'].__setitem__('storage_instance_id','22222222-2222-4222-8222-222222222222'),'restore_admission',seed=restored)
    def extra_member(value):
        member=copy.deepcopy(value['authority']['restore_admission']['members'][0])
        member['event_id']='evt-foreign-original'
        value['authority']['restore_admission']['members'].append(member)
    yield specimen('O166',requested,extra_member,'restore_members',seed=restored)
    for target,field,bad in [('O127','generation_id','eig_'+'f'*64),
            ('O130','frontier_revision',99),('O131','index_dataset_name','event_record_index.v2@eig_'+'f'*64),
            ('O134','checkpoint_ref','event_record_index_checkpoint.v1:22222222-2222-4222-8222-222222222222#/generations/eig_'+'f'*64)]:
        def token(value,field=field,bad=bad):
            for key in ('live_token','durable_token'):value['reader'][key][field]=bad
        yield specimen(target,requested,token,'index_currentness',operation='read')
    for target,mutate,expected in [
        ('O199',lambda source:source['manifest'].__setitem__('selected_segment_generation',2),'index_source_binding'),
        ('O200',lambda source:source['manifest'].__setitem__('survivor_prefix_sha256','f'*64),'index_source_binding'),
        ('F002',lambda source:source['frames'][0].__setitem__('byte_offset',source['frames'][0]['byte_offset']+1),'index_source_bytes'),
        ('O204',lambda source:source['segments'][0].__setitem__('scanned_through_offset',source['segments'][0]['scanned_through_offset']+1),'index_source_bytes'),
        ('O205',lambda source:source['manifest']['retained_inventory'][0].__setitem__('scanned_through_offset',source['manifest']['retained_inventory'][0]['scanned_through_offset']+1),'index_source_bytes'),
        ('O206',lambda source:source['manifest']['durable_watermarks'][0].__setitem__('durable_end_offset',source['manifest']['durable_watermarks'][0]['durable_end_offset']+1),'index_source_bytes')]:
        def change(value,mutate=mutate):mutate(value['index']['current_source']);sync_index(value)
        yield specimen(target,requested,change,expected,operation='read')
    positive=base('wizard.blocked')
    for target,change,expected in [('B016',None,'identifier_whitespace'),('B031',None,'source_deleted')]:
        value=copy.deepcopy(positive)
        if target=='B016':
            value['source']['observation']['next_steps'][0]['step_ref']='step:control\x01character'
            sync_payload(value)
        else:value['authority']['available_refs']=json.dumps(value['authority']['available_refs'])
        yield dict(id='wizard.blocked/p2a/'+target,family='wizard.blocked',row=None,value=value,operation='publish',
                   expected=expected,target=target,repair=positive)
    # Exact registry/resource cases traverse the ordinary mixed retained-source reader.
    reg=m.load('Plans/event_family_registry.json');path='Plans/event_payload_run_started.schema.json'
    document=m.load(path);pointer=mixed(requested)
    def registered(target,overrides,expected):
        return dict(id=requested['event_type']+'/p2a/'+target,family=requested['event_type'],row=requested,
                    value=copy.deepcopy(pointer),operation='read',expected=expected,target=target,
                    repair=copy.deepcopy(pointer),kind='configured',overrides=overrides)
    for target,fragment in [('R001',42),('R002','not-a-fragment')]:
        changed=copy.deepcopy(reg);owner=next(r for r in changed['families'] if r['event_type']=='run.started')
        owner['payload_schema_ref']['json_pointer']=fragment
        yield registered(target,{'Plans/event_family_registry.json':changed},'registered_schema_pointer')
    changed=copy.deepcopy(reg);owner=next(r for r in changed['families'] if r['event_type']=='run.started')
    owner['payload_schema_ref']['json_pointer']='#/$defs/bad~2escape'
    wrapped={'$schema':document['$schema'],'$id':'urn:pm:dcw:sweep-pointer',' $comment':'fixture-only wrapper',
             '$defs':{'bad~2escape':copy.deepcopy(document)}}
    wrapped.pop(' $comment')
    yield registered('R003',{'Plans/event_family_registry.json':changed,path:wrapped},'registered_schema_pointer')
    changed=copy.deepcopy(reg);owner=next(r for r in changed['families'] if r['event_type']=='run.started')
    owner['payload_versions']=[dict(scope_kind='application',payload_schema_id=owner['payload_schema_id'],
                                    payload_schema_ref=copy.deepcopy(owner['payload_schema_ref']))]
    witness=registered('R005',{'Plans/event_family_registry.json':changed},'index_source_dispatch')
    accepted=copy.deepcopy(changed)
    next(r for r in accepted['families'] if r['event_type']=='run.started')['payload_versions'][0]['scope_kind']='project'
    witness['repair_overrides']={'Plans/event_family_registry.json':accepted}
    yield witness
    changed=copy.deepcopy(reg);owner=next(r for r in changed['families'] if r['event_type']=='run.started')
    owner['payload_schema_ref']['schema_id']='urn:pm:dcw:foreign-payload-id'
    yield registered('R007',{'Plans/event_family_registry.json':changed},'registered_schema_id')
    changed=copy.deepcopy(document);changed['$id']='urn:pm:dcw:foreign-resource-id'
    yield registered('R008',{path:changed},'registered_schema_identity')
    # Intrinsic reference/schema boundaries keep parser refusals distinct from
    # keyword validation. Their successful observations are emitted before return.
    for target,fragment,expected in [('RE001','#/missing','registered_schema_pointer'),
                                      ('RE002',None,'registered_schema_path')]:
        changed=copy.deepcopy(reg);owner=next(r for r in changed['families'] if r['event_type']=='run.started')
        if target=='RE001':owner['payload_schema_ref']['json_pointer']=fragment
        else:owner['payload_schema_ref']['path']='Plans/dcw/missing-selected-resource.schema.json'
        yield registered(target,{'Plans/event_family_registry.json':changed},expected)
    changed=copy.deepcopy(document);changed.setdefault('$defs',{})['unvisited_sweep_ref']={'$ref':'#/$defs/DCW_MISSING'}
    witness=registered('RE003',{path:changed},'registered_schema_ref')
    accepted=copy.deepcopy(document)
    accepted.setdefault('$defs',{})['visited_sweep_ref']={'$ref':'#/$defs'}
    witness['repair_overrides']={path:accepted}
    yield witness
    changed=copy.deepcopy(document);changed['type']=99
    yield registered('RE005',{path:changed},'registered_schema_ref')
    binary=copy.deepcopy(requested['positive'])
    binary['stored_source']=dict(binary['source'],changes=b'not-an-EventRecord-value')
    yield dict(id=requested['event_type']+'/p2a/OE003',family=requested['event_type'],row=requested,value=binary,
               operation='publish',expected='physical_type',target='OE003',repair=requested['positive'])
    producer=copy.deepcopy(requested['positive']);producer['retry_request']=copy.deepcopy(producer['event'])
    producer['retry_request']['producer_sequence_id']=2**53+1
    yield dict(id=requested['event_type']+'/p2a/OE004',family=requested['event_type'],row=requested,value=producer,
               operation='retry',expected='jcs_binary64',target='OE004',repair=requested['positive'])
    from pm_dcw_event_fixtures import event_size_fixture,source_reference
    packed=copy.deepcopy(requested['positive']);event_size_fixture(requested,packed,20000,True)
    invalid=copy.deepcopy(packed);invalid['event']['payload_ref']='{'
    for slot in event_slots(invalid):
        if slot['prepared_event']['event_id']==invalid['event']['event_id']:slot['prepared_event']['payload_ref']='{'
    seal_originals(invalid);source_reference(requested,invalid)
    yield dict(id=requested['event_type']+'/p2a/OE005',family=requested['event_type'],row=requested,value=invalid,
               operation='publish',expected='event_payload_reference_encoding',target='OE005',repair=packed)
    invalid=copy.deepcopy(packed);descriptor=json.loads(invalid['event']['payload_ref'])
    invalid['authority']['event_payloads'][descriptor['blake3']]['bytes_hex']='not-hex'
    yield dict(id=requested['event_type']+'/p2a/OE006',family=requested['event_type'],row=requested,value=invalid,
               operation='publish',expected='event_payload_encoding',target='OE006',repair=packed)
    invalid=copy.deepcopy(restored);invalid['source_key'][0]=b'not-a-string-key'
    yield dict(id=requested['event_type']+'/p2a/O196',family=requested['event_type'],row=requested,value=invalid,
               operation='publish',expected='integer_json_domain',target='O196',repair=restored)
    # Live index codec profile refusal, isolated from an EventRecord's physical
    # codec. This is the actual helper boundary used by every index operation.
    yield dict(id='SP-278/p2a/N004',family='SP-278 binding',row=None,kind='binding',value={'number':-1},
               operation='binding',expected='binding_domain',target='N004',repair={'number':1})

    import base64
    for target,field,bad in [('F001','source_value_bytes_base64','AA=='),
                              ('F003','frame_end_offset',1),
                              ('F004','source_schema_id','pm.event.foreign'),
                              ('F005','source_schema_version','9.0.0')]:
        value=copy.deepcopy(requested['positive']);source=value['index']['current_source']
        source['frames'][0][field]=bad
        if target=='F001':source['manifest']['survivor_prefix_sha256']=m.index_prefix(source['frames'])
        sync_index(value)
        yield dict(id=requested['event_type']+'/p2a/'+target,family=requested['event_type'],row=requested,value=value,
                   operation='read',expected='index_source_bytes',target=target,repair=requested['positive'])
    value=copy.deepcopy(requested['positive'])
    value['index']['current_source']['frames'][0]['source_value_bytes_base64']='not-valid-base64!'
    yield dict(id=requested['event_type']+'/p2a/F006',family=requested['event_type'],row=requested,value=value,
               operation='read',expected='index_source_bytes',target='F006',repair=requested['positive'])

    gap=mixed(requested,mutate=lambda e:e.update(sequence_id=e['sequence_id']+2))
    value=copy.deepcopy(gap)
    evidence=value['index']['current_source']['sequence_gaps'][0]['manifest_evidence_ref']
    value['index']['current_source']['gap_evidence'].pop(evidence)
    yield dict(id=requested['event_type']+'/p2a/O212',family=requested['event_type'],row=requested,value=value,
               operation='read',expected='index_source_gaps',target='O212',repair=gap)
    value=copy.deepcopy(gap);source=value['index']['current_source']
    source['sequence_gaps']=[];source['manifest']['excluded_ranges']=[];source['gap_evidence']={};sync_index(value)
    yield dict(id=requested['event_type']+'/p2a/O210',family=requested['event_type'],row=requested,value=value,
               operation='read',expected='index_source_gaps',target='O210',repair=gap)

    # Sweep part 2A fix 1: coherent witnesses for rows left unproved above.
    loaded=families['wizard.deferred_payload.loaded']
    yield specimen('O013',requested,lambda v:v['event'].__setitem__('event_type','bundle.revision_started'),'family')
    def _scope(value):value['event']['scope_kind']='application';value['event']['project_id']=None
    yield specimen('O017',requested,_scope,'scope')
    def _parent(value):value['event']['parent_event_id']='evt-foreign';value['event']['causation_event_id']='evt-foreign'
    yield specimen('O021',requested,_parent,'causation')
    yield specimen('O058',completed,lambda v:v['source']['phases'][0]['prepared_event']['payload'].__setitem__('permission_snapshot_id','foreign-permission'),'source_phase_identity')
    yield specimen('O060',requested,lambda v:v['source']['phases'][0].__setitem__('event_type','bundle.revision_started'),'source_phase_identity')
    yield specimen('O061',requested,lambda v:v['source']['phases'][0].__setitem__('predecessor_event_id','evt-foreign'),'source_phase_identity')
    yield specimen('O062',requested,lambda v:v['source']['phases'][0].__setitem__('source_ref','foreign-ref'),'source_ref')
    yield specimen('O076',completed,lambda v:source_result(v,'annotation_outcome_refs',[]),'completion_outputs')
    def _foreign_opened(value):
        pid=value['event']['payload']['predecessor_event_id']
        value['authority']['events'][pid]['event_type']='wizard.blocked'
    yield specimen('O112',loaded,_foreign_opened,'opened_original')
    def _staged(value):
        g=_generation(value)[1];g['state']='staged';g['activated_at_utc']=None
    yield specimen('O115',requested,_staged,'index_currentness',operation='read')
    def _retained(value):_generation(value)[1]['frontier']['coverage'].__setitem__('retained_event_count',_generation(value)[1]['frontier']['coverage']['retained_event_count']+1)
    yield specimen('O119',requested,_retained,'index_coverage',operation='read')
    yield specimen('O128',requested,lambda v:_generation(v)[0].__setitem__('storage_instance_id','22222222-2222-4222-8222-222222222222'),'index_currentness',operation='read')
    def _token_selection(value):
        for token in (value['reader']['live_token'],value['reader']['durable_token']):
            token['source_selection']['manifest_generation']+=1
    yield specimen('O129',requested,_token_selection,'index_currentness',operation='read')
    def _checkpoint_key(value):
        foreign='event_record_index_checkpoint.v1:22222222-2222-4222-8222-222222222222'
        value['index']['checkpoint_key']=foreign
        for token in (value['reader']['live_token'],value['reader']['durable_token']):token['checkpoint_key']=foreign
    yield specimen('O133',requested,_checkpoint_key,'index_currentness',operation='read')
    mixed_seed=mixed(requested)
    yield specimen('O202',requested,lambda v:v['index']['current_source']['frames'][-1].__setitem__('segment_name','seg-000002-00000000000000000001.active'),'index_source_bytes',seed=mixed_seed,operation='read')
    def _reversed(value):value['index']['current_source']['frames'].reverse();_rebuild_source(value)
    yield specimen('O207',requested,_reversed,'index_source_bytes',seed=mixed_seed,operation='read')
    def _duplicate_frame(value):
        frames=value['index']['current_source']['frames'];added=copy.deepcopy(frames[-1])
        added['event']['sequence_id']=max(f['event']['sequence_id'] for f in frames)+1
        frames.append(added);_rebuild_source(value)
    yield specimen('O208',requested,_duplicate_frame,'index_source_bytes',seed=mixed_seed,operation='read')
    def _gap_reason(value):
        source=value['index']['current_source'];valid=copy.deepcopy(source['sequence_gaps'])
        source['sequence_gaps'][0]['reason']='foreign_reason'
        source['manifest']['excluded_ranges']=copy.deepcopy(source['sequence_gaps'])
        root=value['index']['checkpoint']['storage_instance_id']
        source['source_selection']=m.index_selection(source,root)
        frontier=_generation(value)[1]['frontier']
        frontier['coverage']['sequence_gaps']=valid
        frontier['source_selection']=copy.deepcopy(source['source_selection'])
        for token in (value['reader']['live_token'],value['reader']['durable_token']):
            token['source_selection']=copy.deepcopy(source['source_selection'])
        rehash(value['index'],value['reader'])
    yield specimen('O211',requested,_gap_reason,'index_source_gaps',seed=gap,operation='read')
    def _foreign_generation(value):
        foreign='eig_'+'f'*64;_generation(value)[1]['generation_id']=foreign
        for tx in value['index']['committed_transactions']:tx['generation_id']=foreign
        for token in (value['reader']['live_token'],value['reader']['durable_token']):
            token['generation_id']=foreign
            token['checkpoint_ref']=value['index']['checkpoint_key']+'#/generations/'+foreign
    yield specimen('O214',requested,_foreign_generation,'index_generation_identity',operation='read')
    for target in ('O216','O217','O218','O219'):
        yield specimen(target,requested,lambda v,t=target:_add_generation(v,t),'index_generation_identity',operation='read')
    def _anchor_storage(value):
        _generation(value)[1]['anchor']['source_selection']['storage_instance_id']='22222222-2222-4222-8222-222222222222'
        _reissue_generation(value)
    yield specimen('O220',requested,_anchor_storage,'index_generation_identity',operation='read')
    def _anchor_retained(value):
        _generation(value)[1]['anchor']['retained_event_count']=len(value['index']['current_source']['frames'])+1
        _anchor_tokens(value)
    yield specimen('O221',requested,_anchor_retained,'index_anchor_prefix',operation='read')
    def _anchor_first(value):_generation(value)[1]['anchor']['first_retained_sequence_id']=999999;_anchor_tokens(value)
    yield specimen('O223',requested,_anchor_first,'index_anchor_prefix',operation='read')
    def _anchor_through(value):_generation(value)[1]['anchor']['through_sequence_id']=999999;_anchor_tokens(value)
    yield specimen('O224',requested,_anchor_through,'index_anchor_prefix',operation='read')
    def _anchor_gaps(value):_generation(value)[1]['anchor']['sequence_gaps_sha256']='f'*64;_anchor_tokens(value)
    yield specimen('O225',requested,_anchor_gaps,'index_anchor_prefix',operation='read')
    def _anchor_selection(value):
        _generation(value)[1]['anchor']['source_selection']['current_bytes_sha256']='f'*64
        _reissue_generation(value)
    yield specimen('O226',requested,_anchor_selection,'index_anchor_prefix',operation='read')
    def _frame_actor(value):
        eid=value['event']['event_id']
        next(f for f in value['index']['current_source']['frames'] if f['event']['event_id']==eid)['event']['actor_ref']='actor:foreign'
        _rebuild_source(value)
    yield specimen('O233',requested,_frame_actor,'index_event_join',operation='read')

    # Blockage fix 1 witnesses through the complete blockage checker.
    import hashlib as _hashlib
    from pm_dcw_blockage_fixtures import restore as _blk_restore
    def _bw(target,seed,mutate,expected,operation='publish'):
        value=copy.deepcopy(seed);mutate(value)
        return dict(id=seed['event']['event_type']+'/p2a-fix1/'+target,family=seed['event']['event_type'],row=None,
                    value=value,operation=operation,expected=expected,target=target,repair=copy.deepcopy(seed))
    blocked=base('wizard.blocked');unblocked=base('wizard.unblocked')
    yield _bw('B004',blocked,_scope,'scope')
    def _foreign_blocked(value):
        pid=value['event']['payload']['predecessor_event_id']
        value['authority']['events'][pid]['event_type']='wizard.unblocked'
    yield _bw('B019',unblocked,_foreign_blocked,'blocked_original')
    def _source_ref(value):
        ref='wizard_blocked_evidence:'+'f'*64
        value['event']['payload']['source_ref']=ref;value['source']['source_ref']=ref
    yield _bw('B023',blocked,_source_ref,'source_ref')
    yield _bw('B063',unblocked,lambda v:v['authority']['actions']['action:cleared'].__setitem__('remaining_before',[123]),'clearing_action_type_remaining_before')
    yield _bw('B069',blocked,lambda v:v['event'].__setitem__('event_type','wizard.opened'),'family')
    compatible=base('wizard.blocked');compatible['event']['replay_policy']='projector_replay_only';seal(compatible)
    yield _bw('B085',compatible,lambda v:v['authority']['events'].pop(v['event']['event_id']),'original_custody_missing',operation='compatibility_read')
    restored_blk=base('wizard.unblocked');_blk_restore(restored_blk)
    def _newer_source(value):
        first=next(iter(value['authority']['sources']));value['authority']['sources'][first]['recovery_epoch']=2
        if first in value['authority'].get('stored_sources',{}):value['authority']['stored_sources'][first]['recovery_epoch']=2
    yield _bw('B093',restored_blk,_newer_source,'restore_older_only',operation='read')
    def _extra_source(value):
        extra='evt-foreign-restore';esrc=copy.deepcopy(value['source'])
        value['authority']['sources'][extra]=esrc
        value['authority']['restored_sources'][extra]=_hashlib.sha256(m.canonical_msgpack(esrc)).hexdigest()
    yield _bw('B095',restored_blk,_extra_source,'restore_member',operation='read')
    def _drop_member(value):
        first=next(iter(value['authority']['sources']))
        value['authority']['restore_admission']['members']=[x for x in value['authority']['restore_admission']['members'] if x['event_id']!=first]
    yield _bw('B096',restored_blk,_drop_member,'restore_member',operation='read')
