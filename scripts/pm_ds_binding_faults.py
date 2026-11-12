"""Exact owner/schema/registry loader faults, with observed schema copies repaired."""
import copy
from contextlib import ExitStack
from unittest.mock import patch
import pm_event_authority_ds_round2 as ds
import pm_event_authority_ds_round3 as d3
import pm_browser_workspace_created as created
import pm_browser_workspace_reset as reset


def cases():
    gate,context,_=d3.bases()
    rows=[]
    def add(module,uid,label,*,row_change=None,schema_change=None,registry_change=None,kind='refusal'):
        row=copy.deepcopy(next(r for r in context[0]['rows'] if r['event_type']==module.EVENT_TYPE))
        if row_change:row_change(row)
        def call():
            original=module.load
            storage=copy.deepcopy(original('Plans/storage_value_registry.json',ds.ROOT))
            schema_path=module.V2_SCHEMA_PATH if module is created else module.CONTRACT_PATH
            schema=copy.deepcopy(original(schema_path,ds.ROOT))
            if schema_change:schema_change(schema)
            def load(path,root=ds.ROOT):
                if path==schema_path:return copy.deepcopy(schema)
                if path=='Plans/storage_value_registry.json':return copy.deepcopy(storage)
                return original(path,root)
            with patch.object(module,'load',load):
                if schema_change:
                    # This is a decoded-loader fault. Keep the embedded observed
                    # schema copy coherent; the independent exact owner remains.
                    expected=module.expected_storage_family(ds.ROOT)
                    storage['families']=[expected if f['family_id']==module.CHECKPOINT_FAMILY else f for f in storage['families']]
                if registry_change:registry_change(storage)
                try:
                    errors=module.binding_failures(copy.deepcopy(row))
                except Exception:
                    if kind=='structured_fault':return True
                    raise
            return not errors
        rows.append({'id':'NEG-'+uid+':'+module.EVENT_TYPE+':'+label,'review_id':uid,'entry':call,'kind':kind})
    for module in (created,reset):
        ids=('U217','U220','U221','U222','U223','U224') if module is created else ('U249',None,'U253',None,'U252','U254')
        add(module,ids[0],'family',row_change=lambda r:r.__setitem__('event_type','browser.workspace.foreign'))
        if ids[1]:add(module,ids[1],'semantic_owner',row_change=lambda r:r.__setitem__('semantic_owner_ref','Plans/Contracts_V0.md#CV-329'))
        add(module,ids[2],'retention',row_change=lambda r:r['retention_policy_ref'].__setitem__('policy_version','2.0.0'))
        if ids[3]:add(module,ids[3],'consumer_owner',row_change=lambda r:r.__setitem__('consumer_contract_refs',[]))
        if module is created:
            add(module,'U223','producer',row_change=lambda r:r.__setitem__('producer_component','foreign-producer'))
            add(module,'U223','payload_schema',row_change=lambda r:r['payload_schema_ref'].__setitem__('schema_id','pm.foreign.payload.v1'))
        else:
            for field,value in [('path','Plans/event_record.schema.json'),('json_pointer','#/$defs/foreign'),('schema_id','pm.foreign.payload.v1')]:
                add(module,'U252','payload_'+field,row_change=lambda r,f=field,v=value:r['payload_schema_ref'].__setitem__(f,v))
        uid='U218' if module is created else 'U250'
        add(module,uid,'exact_owner_binding',schema_change=lambda s:s['x-pm-event-authority-binding'].__setitem__('producer_component','foreign-producer'))
        if module is created:
            add(module,'U219','definition_status',schema_change=lambda s:s.__setitem__('x-pm-definition-status','foreign-status'))
        else:
            def ten_fields(s):
                s['$defs']['durable_read_token']['properties']['redb_snapshot_id']={'type':'string','minLength':1}
            add(module,'U251','ten_field_token_in_original_mock_scope',schema_change=ten_fields)
        def absent(storage,m=module):
            storage['families']=[f for f in storage['families'] if f['family_id']!=m.CHECKPOINT_FAMILY]
        def duplicate(storage,m=module):
            storage['families'].append(copy.deepcopy(next(f for f in storage['families'] if f['family_id']==m.CHECKPOINT_FAMILY)))
        add(module,ids[5],'missing_storage_family',registry_change=absent,kind='structured_fault')
        add(module,ids[5],'duplicate_storage_family',registry_change=duplicate)
        def wrong_key(storage,m=module):
            next(f for f in storage['families'] if f['family_id']==m.CHECKPOINT_FAMILY)['key_shape']+=':foreign'
        add(module,'U225' if module is created else 'U254','wrong_key_shape',registry_change=wrong_key)
        if module is created:
            def wrong_encoding(storage):
                next(f for f in storage['families'] if f['family_id']==created.CHECKPOINT_FAMILY)['encoding']='typed_fields'
            add(module,'U225','wrong_encoding',registry_change=wrong_encoding)
    return rows
