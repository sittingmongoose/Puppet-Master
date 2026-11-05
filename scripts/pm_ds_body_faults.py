"""Structured body/entry failures at the public route and family seams."""
import copy
import pm_event_authority_ds_round2 as ds
import pm_event_authority_ds_round3 as d3
import pm_home_layout_v2_slot_receipt as home
import pm_event_payload_route as route


def cases():
    _,_,bases=d3.bases()
    event=copy.deepcopy(bases[0][1]['event'])
    rows=[]
    def add(uid,label,call,expected):
        def broken():
            try:return call()!=expected
            except Exception:return True
        rows.append(('FAULT-'+uid+':'+label,broken))
    wrong_types=(None,False,1,'false',[],{})
    for v in wrong_types[:-1]:
        add('U119','event_type:'+repr(v),lambda v=v:route.resolved_body(v),(None,['envelope_schema']))
    for v in ('false',0,None,[],{}):
        add('U118','historical_type:'+repr(v),lambda v=v:route.resolved_body(event,historical=v),
            (None,['historical_context_type']))
    large=copy.deepcopy(event)
    large['payload']['artifact_refs']=['artifact:'+'x'*17000]
    objects={};large=route.encode(large,objects)
    ref=large['payload_ref']
    for v in wrong_types:
        if v is None:continue
        changed=copy.deepcopy(large);changed['payload']=v
        add('U121','reference_plus_inline:'+repr(v),lambda e=changed:route.resolved_body(e,objects),
            (None,['payload_representation']))
    for field,v in [('blake3_id','f'*64+'\n'),('byte_size','17000'),('media_type',1)]:
        changed=copy.deepcopy(large);changed['payload_ref'][field]=v
        add('U122','invalid_ref:'+field,lambda e=changed:route.resolved_body(e,objects),
            (None,['payload_reference_schema']))
    for value in (False,1,'store',[],()):
        add('U123','store_type:'+repr(value),lambda s=value:route.resolved_body(large,s),
            (None,['payload_reference_store_type']))
    add('U124','missing_object',lambda:route.resolved_body(large,{}),(None,['payload_reference_missing']))
    data=next(iter(objects.values()))[1]
    for value in (None,False,1,'x',[],(),[route.MEDIA],[route.MEDIA,data,None],
                  [False,data],[1,data],[{},data],[route.MEDIA,'bytes'],[route.MEDIA,bytearray(data)]):
        add('U374','object_tuple_type:'+repr(type(value))+':'+str(len(rows)),
            lambda v=value:route.reference_metadata_errors(ref,v),['payload_reference_store_type'])
        supplied={ref['blake3_id']:value}
        if value is not None:
            add('U125','wrong_available_object:'+str(len(rows)),lambda s=supplied:route.resolved_body(large,s),
                (None,['payload_reference_store_type']))
    for value in (None,False,1,'body',[]):
        changed=copy.deepcopy(event);changed['payload']=value
        add('U126','inline_body_type:'+repr(value),lambda e=changed:route.resolved_body(e),
            (None,['payload_representation']))
        legacy=copy.deepcopy(changed);legacy['schema_version']='2.0.0'
        add('U128','legacy_body_type:'+repr(value),lambda e=legacy:route.resolved_body(e,historical=True),
            (None,['payload_schema']))
    legacy=copy.deepcopy(event);legacy['schema_version']='2.0.0';legacy['payload_ref']=ref
    add('U127','legacy_reference',lambda:route.resolved_body(legacy,historical=True),
        (None,['legacy_payload_ref_not_reinterpreted']))
    large_legacy=copy.deepcopy(event);large_legacy['schema_version']='2.0.0'
    large_legacy['event_type']='unadopted.fixture';large_legacy['payload']['artifact_refs']=['artifact:'+'x'*17000]
    add('U129','legacy_current_size',lambda:route.resolved_body(large_legacy),
        (large_legacy['payload'],['payload_byte_limit']))
    nonmap=copy.deepcopy(large);body=['x'*17000];raw=route.canonical_msgpack(body);ident=route.blake3_hex(raw)
    nonmap['payload_ref'].update(blake3_id=ident,byte_size=len(raw))
    add('U130','resolved_nonmap',lambda:route.resolved_body(nonmap,{ident:(route.MEDIA,raw)}),
        (None,['payload_schema']))
    fixture=ds.load(home.FIXTURES)
    slot=next(c['value'] for c in fixture['valid'] if c['id']=='home4_readback_verified_slot')
    # Use the exact frozen Home4 event shape accepted by event_checks; route
    # unavailability must propagate without any dereference of a None body.
    broken=copy.deepcopy(slot['event_semantics']);broken['payload']=None
    broken['schema_version']='3.0.0';broken['payload_ref']=copy.deepcopy(ref)
    def home_missing():
        errors=[]
        result=home.event_checks(errors,broken,slot['binding'],home.digest(slot['binding']),home.EMPTY_STORE)
        return result,errors
    add('U002','missing_layout_body',home_missing,({},['I12 payload_reference_missing']))
    layout_slot,layout_event=d3.layout_base()
    binding=layout_slot['binding']
    for value in (None,False,1,'event',[]):
        add('U132','layout_event_type:'+repr(value),lambda v=value:ds.layout_event_errors(v,binding=binding),['layout_envelope_schema'])
    bad=copy.deepcopy(layout_event);bad['extra_envelope_field']=True
    add('U133','layout_envelope_extra',lambda:ds.layout_event_errors(bad,binding=binding),['layout_envelope_schema'])
    add('U131','layout_missing_binding',lambda:ds.layout_event_errors(layout_event,binding=None),['layout_binding_schema'])
    external=copy.deepcopy(layout_event);external['payload']=ds.padded(external['payload'],16385,'affected_tab_ids')
    external=route.encode(external,{})
    add('U134','layout_missing_resolved_body',lambda:ds.layout_event_errors(external,{},binding=binding),['payload_reference_missing'])
    compaction=ds.load('Plans/context_compaction_completion_contract_fixtures.json')['valid_event']
    bad_envelope=copy.deepcopy(compaction);bad_envelope['extra_envelope_field']=True
    add('U115','compaction_envelope_extra',lambda:ds.compaction_event_errors(bad_envelope),['envelope_schema'])
    bad_payload=copy.deepcopy(compaction);del bad_payload['payload']['project_id']
    add('U116','compaction_missing_payload_identity',lambda:ds.compaction_event_errors(bad_payload),['compaction_payload_schema'])
    for value in (1.0,[1.0],{'nested':[1.0]}):
        def numeric(value=value):return not route.numeric_representation_errors(value)
        rows.append(('NEG-U372:numeric_list_recursion:'+repr(value),numeric))
    bad_numeric=copy.deepcopy(event);bad_numeric['producer_sequence_id']=1.0
    def encoder():
        try:route.encode(bad_numeric,{})
        except ValueError:return False
        return True
    rows.append(('NEG-U373:encoder_integral_refusal',encoder))
    return rows
