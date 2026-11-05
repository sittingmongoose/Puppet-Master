"""Round-six source, numeric and exact-type causal witnesses for every family."""
import copy
import hashlib
import json


def cases(m, rows, fixtures):
    result = []
    def add(guard, family, name, good, bad):
        result.append((guard, family, name, good, bad))
    wrong_flags = ('false', '0', 0, 1, None, [], {}, {'nested': True})
    for row in rows:
        family = row['event_type']
        full = fixtures['positive_events'][family]
        payload = full['payload']
        schema = m.load(row['payload_schema_ref'])
        source = m.source_for(row, payload)
        deleted = dict(source, body_deleted=True)
        add('H07', family, 'deleted_body_refs',
            lambda n,r=row,p=payload,s=source: n.inspect(r,p,s) == 'metadata_and_authorized_refs',
            lambda n,r=row,p=payload,s=deleted: n.inspect(r,p,s) == 'metadata_and_authorized_refs')
        packed=copy.deepcopy(full);packs={};packed['payload']['summary']='x'*17000
        packed['payload'],packed['payload_ref']=m.storage_form(packed['payload'],packs)
        digest=next(iter(packs))
        for field in ('durable','authorized'):
            for index,value in enumerate(wrong_flags):
                bad=copy.deepcopy(packs);bad[digest][field]=value
                add('D07',family,'pack_'+field+'_type_'+str(index),lambda n,r=row,e=packed,p=packs:n.decode(r,e,p),
                    lambda n,r=row,e=packed,p=bad:n.decode(r,e,p))
        for flag in ('withdrawn','authorized','source_valid','receipt_valid','body_deleted'):
            guard = {'withdrawn':'H01','authorized':'H01','source_valid':'H02','receipt_valid':'H02','body_deleted':'H07'}[flag]
            for index, value in enumerate(wrong_flags):
                bad = dict(source, **{flag:value})
                add(guard,family,'flag_type_'+flag+'_'+str(index),
                    lambda n,r=row,p=payload,s=source:n.inspect(r,p,s),
                    lambda n,r=row,p=payload,s=bad:n.inspect(r,p,s))
        receipt = fixtures['first_append_receipts'][family]
        template = fixtures['custody_template']
        for flag in ('admission','source_valid','dedupe_available'):
            for index,value in enumerate(wrong_flags):
                args = dict(admission=True,source_valid=True,dedupe_available=True);args[flag]=value
                add('A01' if flag=='admission' else 'A02',family,'flag_type_'+flag+'_'+str(index),
                    lambda n,r=row,e=full,t=template,q=receipt:n.AppendModel(r,{},q,t).append(e,True),
                    lambda n,r=row,e=full,t=template,q=receipt,a=args:n.AppendModel(r,{},q,t).append(e,**a))
        original=copy.deepcopy(fixtures['custody_template'])
        original.update(event_id=full['event_id'],scope_partition=m.scope_partition(full['project_id']),event_type=family,
            idempotency_key=full['idempotency_key'],producer_semantic_digest=m.semantic_digest(full),
            first_append_receipt=copy.deepcopy(receipt),original_event_value_commitment=m.commitment(full))
        issued=dict(event=full,custody=original,result={k:copy.deepcopy(original[k]) for k in ('first_append_receipt','original_segment_ref','original_event_value_commitment')})
        bundle=fixtures['checkpoint_positives'][family]
        def historical_value(n,o,c=None,r=None,u=None):
            return n.full_value_matches(o['event'] if c is None else c,o,o['result'] if r is None else r,
                o['custody'] if u is None else u,validation=n.HISTORICAL_V1)
        # Retained schemas legitimately accept integral floats. Original copies
        # still need exact bytes: rebind every non-targeted observational copy.
        for guard in ('F06','F10','F12','F13'):
            o=copy.deepcopy(issued);r=copy.deepcopy(o['result']);u=copy.deepcopy(o['custody'])
            if guard=='F06':
                v=float(full['sequence_id']);r['first_append_receipt']['sequence_id']=v;u['first_append_receipt']['sequence_id']=v
                o['result']=copy.deepcopy(r);o['custody']=copy.deepcopy(u)
            elif guard=='F10':
                v=float(receipt['byte_offset']);u['first_append_receipt']['byte_offset']=v;o['custody']=copy.deepcopy(u)
            elif guard=='F12':o['result']['first_append_receipt']['byte_offset']=float(receipt['byte_offset'])
            else:o['custody']['first_append_receipt']['byte_offset']=float(receipt['byte_offset'])
            add(guard,family,'retained_exact_receipt_type',lambda n,o=issued:historical_value(n,o),
                lambda n,o=o,r=r,u=u:historical_value(n,o,r=r,u=u))
        def rebind_source(b):
            src=b['selected_source'];selection=src['source_selection']
            selection['manifest_bytes_sha256']=hashlib.sha256(m.value_bytes(src['manifest'])).hexdigest()
            selection['retained_inventory_sha256']=m.binding_digest(src['manifest']['retained_inventory'])
            node=b['checkpoint']['generations'][b['checkpoint']['current_generation_id']]
            node['anchor']['source_selection']=copy.deepcopy(selection);node['frontier']['source_selection']=copy.deepcopy(selection)
            m.checkpoint_rebind(full,issued,b)
        for field,value in bundle['selected_source']['source_selection'].items():
            if type(value) is int:
                forms=([('float',float(value))] if field=='selected_segment_generation' else [])
                forms+=([('boolean',bool(value))] if value in (0,1) else [])
                for form,changed in forms:
                    bad=copy.deepcopy(bundle);bad['selected_source']['source_selection'][field]=changed
                    # Rebind publication-locator observations of this source
                    # counter. SP-278's codec independently refuses floats in
                    # those locators, so only encodable bool 0/1 isolates here.
                    if field in ('manifest_generation','recovery_epoch'):
                        node=bad['checkpoint']['generations'][bad['checkpoint']['current_generation_id']]
                        dataset=next(iter(bad['datasets'].values()))
                        for value_row in dataset.values():value_row['publication_locator'][field]=changed
                        node['frontier']['index_row_set_sha256']=m.binding_digest(dict(domain='pm.event_index.row_set.v1',entries=[dict(key=k,value=v) for k,v in sorted(dataset.items())]))
                        bad['read_token']['frontier_sha256']=m.binding_digest(node['frontier'])
                    add('C04',family,'primary_selection_'+field+'_'+form,
                        lambda n,r=row,e=full,o=issued,b=bundle:n.checkpoint_matches(r,e,o,b),
                        lambda n,r=row,e=full,o=issued,b=bad:n.checkpoint_matches(r,e,o,b))
        for field,value in bundle['selected_source']['segments'][0].items():
            # SP-278's binding codec already refuses every float. Boolean
            # 0/1 can be encoded and isolates the former equality confusion.
            if type(value) is int and value in (0,1):
                for form,changed in [('boolean',bool(value))]:
                    bad=copy.deepcopy(bundle);src=bad['selected_source'];src['segments'][0][field]=changed
                    src['manifest']['retained_inventory']=copy.deepcopy(src['segments']);rebind_source(bad)
                    add('C10',family,'source_segment_'+field+'_'+form,
                        lambda n,r=row,e=full,o=issued,b=bundle:n.checkpoint_matches(r,e,o,b),
                        lambda n,r=row,e=full,o=issued,b=bad:n.checkpoint_matches(r,e,o,b))
        bad=copy.deepcopy(bundle);bad['selected_source']['frame_end_offset']=float(bad['selected_source']['frame_end_offset'])
        add('C10',family,'source_frame_end_type',lambda n,r=row,e=full,o=issued,b=bundle:n.checkpoint_matches(r,e,o,b),
            lambda n,r=row,e=full,o=issued,b=bad:n.checkpoint_matches(r,e,o,b))
        bad=copy.deepcopy(bundle);bad['selected_source']['manifest']['retained_inventory'][0]['segment_generation']=True;rebind_source(bad)
        add('C08',family,'manifest_inventory_type',lambda n,r=row,e=full,o=issued,b=bundle:n.checkpoint_matches(r,e,o,b),
            lambda n,r=row,e=full,o=issued,b=bad:n.checkpoint_matches(r,e,o,b))
        for label,member,field in [('current_generation','current','selected_segment_generation'),('manifest_generation','manifest','manifest_generation'),
                                  ('manifest_segment','manifest','selected_segment_generation'),('recovery_epoch','manifest','recovery_epoch')]:
            for index,value in enumerate(('0','false',True,None,[],{},1.0,-0.0)):
                bad=copy.deepcopy(bundle);src=bad['selected_source'];src[member][field]=value
                src['source_selection'][member+'_bytes_sha256']=hashlib.sha256(m.value_bytes(src[member])).hexdigest()
                node=bad['checkpoint']['generations'][bad['checkpoint']['current_generation_id']]
                node['anchor']['source_selection']=copy.deepcopy(src['source_selection'])
                node['frontier']['source_selection']=copy.deepcopy(src['source_selection'])
                m.checkpoint_rebind(full,issued,bad)
                add('C08',family,label+'_type_'+str(index),lambda n,r=row,e=full,o=issued,b=bundle:n.checkpoint_matches(r,e,o,b),
                    lambda n,r=row,e=full,o=issued,b=bad:n.checkpoint_matches(r,e,o,b))
        # Pure schema invocations isolate representation/type guards from hashes,
        # receipts, copied identities and checkpoint observations.
        for name,value in [('float',1.0),('exponent',json.loads('1e0')),('positive_zero',0.0),('negative_zero',json.loads('-0.0'))]:
            good = copy.deepcopy(full);good['sequence_id']=int(value)
            # sequence_id has minimum 1, so use producer_sequence_id for zeros.
            field = 'sequence_id' if value else 'producer_sequence_id'
            good = copy.deepcopy(full);good[field]=int(value)
            bad = copy.deepcopy(good);bad[field]=value
            add('N01',family,name+'_event',lambda n,e=good:n.EVENT_VALIDATOR.is_valid(e),lambda n,e=bad:n.EVENT_VALIDATOR.is_valid(e))
            q = copy.deepcopy(receipt);field='sequence_id' if value else 'byte_offset';q[field]=int(value)
            b = copy.deepcopy(q);b[field]=value
            add('N01',family,name+'_receipt',lambda n,q=q:n.RECEIPT_VALIDATOR.is_valid(q),lambda n,q=b:n.RECEIPT_VALIDATOR.is_valid(q))
            for label,base,validation,number_path in (
                    ('custody',original,'CUSTODY_VALIDATOR',('first_append_receipt',field)),
                    ('result',issued['result'],'RESULT_VALIDATOR',('first_append_receipt',field)),
                    ('checkpoint',bundle['checkpoint'],None,('schema_version',))):
                if label=='checkpoint':
                    good=copy.deepcopy(base);generation=good['current_generation_id']
                    number_path=('generations',generation,'frontier','publication_revision')
                    m.set_path(good,number_path,int(value)+1)
                    bad=copy.deepcopy(good);m.set_path(bad,number_path,float(int(value)+1))
                    cp_schema=m.load(m.CHECKPOINT_SCHEMA.split('#')[0])
                    add('N01',family,name+'_'+label,lambda n,s=cp_schema,v=good:n.validator(s,'checkpoint').is_valid(v),lambda n,s=cp_schema,v=bad:n.validator(s,'checkpoint').is_valid(v))
                else:
                    good=copy.deepcopy(base);m.set_path(good,number_path,int(value))
                    bad=copy.deepcopy(good);m.set_path(bad,number_path,value)
                    add('N01',family,name+'_'+label,lambda n,v=good,k=validation:getattr(n,k).is_valid(v),lambda n,v=bad,k=validation:getattr(n,k).is_valid(v))
            # Untyped JSON extension maps cannot bypass the numeric overlay.
            good_schema={'type':'object','additionalProperties':True}
            add('N01',family,name+'_open_map',lambda n,s=good_schema,v=int(value):n.validator(s).is_valid({'v':v}),
                lambda n,s=good_schema,v=value:n.validator(s).is_valid({'v':v}))
            for route,size in (('inline',0),('packed',17000)):
                add('N01',family,name+'_storage_form_'+route,
                    lambda n,v=int(value),size=size:n.storage_form({'number':v,'summary':'x'*size},{}),
                    lambda n,v=value,size=size:n.storage_form({'number':v,'summary':'x'*size},{}))
        # Every representation that changes the expected JSON type is tested at
        # the full EventRecord boundary. The payload field is schema-defined but
        # absent from every source/copy join, so the type rule is the only defect.
        for index,value in enumerate((False,0,1.5,None,[],{}, {'nested':'value'})):
            bad=copy.deepcopy(payload);bad['artifact_id']=value
            add('S07',family,'payload_string_type_'+str(index),
                lambda n,s=schema,p=payload:n.validator(s).is_valid(p),lambda n,s=schema,p=bad:n.validator(s).is_valid(p))
        for index,value in enumerate(('0','false',None,[],{},True)):
            bad=copy.deepcopy(full);bad['sequence_id']=value
            add('S07',family,'event_number_type_'+str(index),lambda n,e=full:n.EVENT_VALIDATOR.is_valid(e),lambda n,e=bad:n.EVENT_VALIDATOR.is_valid(e))
        for index,value in enumerate(wrong_flags):
            add('S07',family,'boolean_type_'+str(index),lambda n:n.validator({'type':'boolean'}).is_valid(False),
                lambda n,v=value:n.validator({'type':'boolean'}).is_valid(v))
        if family.endswith('.restore_point'):
            successor=fixtures['restore_successor'];src=dict(proof_valid=True,predecessor_complete=True,snapshot_current=True,canonical_point=successor['payload']['type_payload'])
            for field in ('proof_valid','predecessor_complete','snapshot_current'):
                for index,value in enumerate(wrong_flags):
                    bad=dict(src,**{field:value})
                    add('O01',family,field+'_type_'+str(index),lambda n,r=row,e=successor,p=full,s=src:n.observation_admissible(e,p,r,{},s),
                        lambda n,r=row,e=successor,p=full,s=bad:n.observation_admissible(e,p,r,{},s))
        if family.endswith('.browser_recording'):
            for index,action in enumerate(payload['type_payload']['actions']):
                agreement_case(m,result,row,payload,('type_payload','actions',index,'browser_session_id'),'browser-session-foreign','session_'+str(index))
            action=payload['type_payload']['actions'][0]
            agreement_case(m,result,row,payload,('type_payload','actions',0,'page_representation_ref'),'page:foreign','page_ref')
            for field in ('screenshot_artifact_ref','pdf_artifact_ref','console_ref','network_ref'):
                control=copy.deepcopy(payload);control['type_payload']['actions'][0][field]=action['page_representation'][field]
                agreement_case(m,result,row,control,('type_payload','actions',0,field),'foreign:'+field,field)
            agreement_case(m,result,row,payload,('type_payload','actions',0,'page_representation','redaction_profile_id'),'profile-foreign','redaction_profile')
        if family.endswith(('.cost_usage','.tool_llm_trace')):
            body=payload['type_payload'];refs=body['refs']
            for field in ('provider_attempt_ref','usage_event_ref','usage_record_id','receipt_refs'):
                control=copy.deepcopy(payload);control[field]=refs[field]
                if control[field] is None:
                    control[field]='known-'+field;control['type_payload']['refs'][field]=control[field]
                    if field in control['type_payload']:control['type_payload'][field]=control[field]
                bad_value=['receipt-foreign'] if field=='receipt_refs' else 'foreign-'+field
                agreement_case(m,result,row,control,(field,),bad_value,'root_'+field)
            fields=['usage_event_ref','usage_record_id','raw_payload_ref']
            if family.endswith('.cost_usage'):fields+=['run_id','attempt_id','thread_id','node_id']
            else:fields+=['provider_attempt_ref']
            for field in fields:
                agreement_case(m,result,row,payload,('type_payload','refs',field),'foreign-'+field,'refs_'+field)
            if family.endswith('.cost_usage'):
                for path,value,name in [
                    (('reasoning_tokens',),999999,'reasoning_alias'),
                    (('total_tokens',),999999,'total_alias'),
                    (('usage','input_non_cached'),999999,'input_derived'),
                    (('usage','output_visible'),999999,'output_derived'),
                    (('cost','cost_microdollars'),999999,'cost_derived')]:
                    agreement_case(m,result,row,payload,('type_payload',*path),value,name)
                for field in ('is_provider_reported','is_cli_reported','is_estimated','is_local_context_estimate'):
                    agreement_case(m,result,row,payload,('type_payload','flags',field),not body['flags'][field],field)
                control=copy.deepcopy(payload);control['type_payload']['usage']['counting_semantics']['provider_total_semantics']='derived_input_plus_output'
                # Rebind the copied total alias when changing the source total.
                control['type_payload'].pop('total_tokens',None)
                agreement_case(m,result,row,control,('type_payload','usage','provider_total'),999999,'provider_total_derived')
            else:
                for field in ('usage_event_ref','usage_record_id'):
                    agreement_case(m,result,row,payload,('type_payload','settlement',field),'foreign-'+field,'settlement_'+field)
                for field in ('redacted','usage_observed'):
                    agreement_case(m,result,row,payload,('type_payload','flags',field),not body['flags'][field],field)
                control=copy.deepcopy(payload)
                for field in ('usage_event_ref','usage_record_id'):
                    control['type_payload'][field]=None;control['type_payload']['refs'][field]=None;control['type_payload']['settlement'][field]=None
                agreement_case(m,result,row,control,('type_payload','flags','usage_observed'),False,'usage_artifact_observed')
                agreement_case(m,result,row,payload,('type_payload','retry','parent_trace_ref'),'trace-parent-foreign','retry_parent')
                control=copy.deepcopy(payload);control['type_payload']['retry'].update(relation='retry_of',parent_trace_ref='trace-parent')
                agreement_case(m,result,row,control,('type_payload','retry','parent_trace_ref'),None,'retry_missing_parent')
            evidence=body['authority' if family.endswith('.cost_usage') else 'raw_payload']
            raw=fixtures['provider_hash_source_utf8'][family].encode('utf-8')
            sources={evidence['raw_payload_ref']:raw}
            for route in ('inline','packed'):
                good=copy.deepcopy(full);packs={}
                if route=='packed':
                    good['payload']['summary']='x'*17000
                    good['payload'],good['payload_ref']=m.storage_form(good['payload'],packs)
                wrong={evidence['raw_payload_ref']:bytearray(raw)}
                add('B02',family,'source_bytes_type_'+route,lambda n,r=row,e=good,p=packs,s=sources:n.decode(r,e,p,raw_sources=s),
                    lambda n,r=row,e=good,p=packs,s=wrong:n.decode(r,e,p,raw_sources=s))
                wrong={evidence['raw_payload_ref']:raw+b' '}
                add('B03',family,'source_digest_'+route,lambda n,r=row,e=good,p=packs,s=sources:n.decode(r,e,p,raw_sources=s),
                    lambda n,r=row,e=good,p=packs,s=wrong:n.decode(r,e,p,raw_sources=s))
    return result


def agreement_case(m,result,row,control,path,value,name):
    """Same one-field source contradiction on schema, resolved and append routes.

    Packs always contain the actual altered body, with fresh length and digest.
    There is no old receipt, identity or commitment to mask the body guard.
    """
    full=m.load('Plans/runtime_artifact_event_drafts.fixtures.json')['positive_events'][row['event_type']]
    fixtures=m.load('Plans/runtime_artifact_event_drafts.fixtures.json')
    schema=m.load(row['payload_schema_ref']);bad=copy.deepcopy(control);m.set_path(bad,path,value)
    result.append(('B01',row['event_type'],name+'_schema',lambda n,s=schema,p=control:n.validator(s).is_valid(p),lambda n,s=schema,p=bad:n.validator(s).is_valid(p)))
    for route in ('inline','packed'):
        args=[]
        for payload in (control,bad):
            e=copy.deepcopy(full);e['payload']=copy.deepcopy(payload);packs={}
            if route=='packed':e['payload']['summary']='x'*17000
            e['payload'],e['payload_ref']=m.storage_form(e['payload'],packs)
            args.append((e,packs))
        for boundary in ('decode','append'):
            def action(n,e,p,row=row,fixtures=fixtures,boundary=boundary):
                if boundary=='decode':return n.decode(row,e,p)
                return n.AppendModel(row,p,fixtures['first_append_receipts'][row['event_type']],fixtures['custody_template']).append(e,True)
            good=lambda n,a=args[0],f=action:f(n,*a)
            negative=lambda n,a=args[1],f=action:f(n,*a)
            result.append(('B01',row['event_type'],name+'_'+route+'_'+boundary,good,negative))
