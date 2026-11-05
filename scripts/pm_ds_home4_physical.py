"""Full Home4 reader controls, preserving each object's physical claims.

Structured faults assert a diagnostic and normal return; a crash breaks that
assertion and is never counted as admission of an invalid stored value.
"""
import base64
import copy
import inspect
import pm_home_layout_v2_slot_receipt as h
import pm_event_authority_ds_round2 as ds


def cases():
    fixtures=ds.load(h.FIXTURES)
    valid={c['id']:c for c in fixtures['valid']}
    store=h.PayloadStore.from_fixture(fixtures['payload_store'])
    checker=h.Checker(ds.ROOT)
    base=valid['home4_prepared_slot_reference_25_tabs']['value']
    rows=[]
    def add(uid,label,ref,objects,*,structured=False,cap=None):
        def errors():
            shape=checker.schema_errors('stored_value_ref',ref)
            if shape:return shape
            if cap is None:return checker.semantic('stored_value_ref',ref,h.PayloadStore(objects))
            from unittest.mock import patch
            with patch.dict(checker.limits,transaction_slot=cap):
                return checker.semantic('stored_value_ref',ref,h.PayloadStore(objects))
        def entry():
            try:return not errors()
            except Exception:
                if structured:return True
                raise
        rows.append({'id':'NEG-'+uid+':'+label,'entry':entry,'errors':errors,
                     'kind':'structured_fault' if structured else 'refusal'})
    def repack(ref,stored,objects):
        ref=copy.deepcopy(ref);objects=dict(objects)
        data=h.canonical_msgpack(stored);ident=h.blake3_hex(data)
        ref['value_ref'].update(blake3_id=ident,byte_size=len(data))
        ref['value_sha256']=h.sha(data);objects[ident]=(ds.route.MEDIA,data)
        return ref,objects
    missing=dict(store.objects);del missing[base['value_ref']['blake3_id']]
    add('U035','missing_complete_object',copy.deepcopy(base),missing,structured=True)
    wrong=copy.deepcopy(base);ident=wrong['value_ref']['blake3_id'];wrong['value_ref']['blake3_id']='f'*64
    objects=dict(store.objects);objects['f'*64]=objects[ident]
    add('U036','well_formed_false_content_id',wrong,objects)
    add('U037','wrapper_capacity_dependency_fault',copy.deepcopy(base),dict(store.objects),cap=64)
    nonmap,objects=repack(base,['x'*17000],store.objects)
    add('U039','canonical_nonmap',nonmap,objects,structured=True)
    stored=h.decode_canonical_msgpack(store.objects[base['value_ref']['blake3_id']][1])
    stored['binding']['owner_operation_id']=b'ABC'
    wrongbin,objects=repack(base,stored,store.objects)
    add('U040','bin_outside_base64_field',wrongbin,objects)
    sourcebase=valid['home4_readback_verified_slot_by_reference_with_source_ref']['value']
    inner=h.to_projection(h.decode_canonical_msgpack(store.objects[sourcebase['value_ref']['blake3_id']][1]))
    source_ref=inner['candidate_layout_source_bytes']
    raw=store.objects[source_ref['blake3_id']][1]
    assert len(raw)==16385
    inline=copy.deepcopy(inner)
    inline['candidate_layout_source_bytes']={'form':'inline','bytes':base64.b64encode(raw).decode()}
    ref,objects=repack(sourcebase,h.to_stored('transaction_slot',inline),store.objects)
    add('U010','16385_byte_source_inside_complete_reference',ref,objects)
    objects=dict(store.objects);del objects[source_ref['blake3_id']]
    add('U012','missing_nested_source_object',copy.deepcopy(sourcebase),objects,structured=True)
    # The valid derive route is an exact state/dispatch control, not a negative.
    ident=base['value_ref']['blake3_id']
    op={'op':'put_derived','blake3_id':ident,'media_type':ds.route.MEDIA,
        'derive':{'definition':'transaction_slot','from':ident,'value_ops':[]}}
    def derived():
        try:
            actual=store.apply([copy.deepcopy(op)])
            return actual.objects!=store.objects or bool(checker.schema_errors('stored_value_ref',base) or checker.semantic('stored_value_ref',base,actual))
        except Exception:return True
    rows.append({'id':'ROUTE-U190:derived_complete_value','entry':derived,'kind':'dispatch'})
    wrongop=copy.deepcopy(op);wrongop['blake3_id']='f'*64
    def wrong_derived():
        try:store.apply([copy.deepcopy(wrongop)])
        except ValueError:return False
        return True
    rows.append({'id':'NEG-U191:derived_content_id','entry':wrong_derived,'kind':'refusal'})
    # Reuse the lane's already authored full 1,200-tab positive. The payload
    # reference stays complete, with the actual layout/source/readback joins.
    suite=ds.Suite();ds.add_layout_cases(suite)
    positive=dict(suite.positives)['layout:1200_tab_complete_home4_value_reference']
    values=inspect.getclosurevars(positive).nonlocals
    large_ref,large_store=values['ref'],values['store']
    large_inner=h.to_projection(h.decode_canonical_msgpack(large_store.objects[large_ref['value_ref']['blake3_id']][1]))
    body_ref=large_inner['event_semantics']['payload_ref']
    payload=ds.route.decode_canonical_msgpack(large_store.objects[body_ref['blake3_id']][1])
    badpayload=copy.deepcopy(payload);badpayload['unexpected_schema_field']=True
    raw=h.canonical_msgpack(badpayload);body_id=h.blake3_hex(raw)
    altered=copy.deepcopy(large_inner)
    altered['event_semantics']['payload_ref'].update(blake3_id=body_id,byte_size=len(raw))
    objects=dict(large_store.objects);objects[body_id]=(ds.route.MEDIA,raw)
    ref,objects=repack(large_ref,h.to_stored('transaction_slot',altered),objects)
    add('U003','resolved_payload_extra_property',ref,objects,structured=True)
    from pm_ds_home4_isolating import refresh_receipt
    receipt=copy.deepcopy(valid['home4_committed_receipt']['value'])
    receipt.update(state='prepared',append_result=None,source_durability_ref=None,terminal_at_utc=None,
                   original_append_receipt=None,original_publication=None)
    receipt['owner_result'].update(event_status='pending',event_ref=None)
    receipt['dispatch_receipt']['event_ref']=None;receipt['original_ui_response']['event_refs']=[]
    refresh_receipt(receipt)
    event=copy.deepcopy(receipt['event_semantics'])
    event['payload']=ds.padded(event['payload'],16385,'affected_tab_ids')
    event=ds.route.encode(event,{})
    receipt['event_semantics']=event
    def missing_receipt_body():
        try:
            errors=checker.schema_errors('operation_receipt',receipt)
            errors=errors or checker.semantic('operation_receipt',receipt,h.EMPTY_STORE)
            return errors!=['I12 payload_reference_missing']
        except Exception:return True
    rows.append({'id':'FAULT-U028:receipt_missing_resolved_body','entry':missing_receipt_body,'kind':'structured_fault'})
    return rows
