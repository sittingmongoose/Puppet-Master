"""Single original/current-source copy defects; unchanged frozen source factories."""
import copy


def edit(base,operation,dep):
    value=copy.deepcopy(base);ctx=value['args'][0];created=ctx['restore_created']
    old=ctx['original_creation_source'];selection=old['source_selection']
    if operation=='creation_current_observed':
        created['event']['observed_at_utc']='2026-06-10T17:00:01Z'
        created['companion']['frozen_append_input']['observed_at_utc']=created['event']['observed_at_utc']
        created['companion']['frozen_append_input_sha256']=dep.dig(created['companion']['frozen_append_input'])
        ctx['original_creation_commit_transaction']['companion_value']=copy.deepcopy(created['companion'])
    else:
        events=[copy.deepcopy(f['event'])for f in old['frames']]
        sg=selection['selected_segment_generation']
        if operation=='creation_original_observed':
            event=next(e for e in events if e['event_id']==created['event']['event_id'])
            event['observed_at_utc']='2026-06-10T17:00:01Z'
        elif operation=='creation_original_relocated':sg+=1
        else:raise ValueError('unknown original/current defect')
        source=dep.source(events,sg=sg,mg=selection['manifest_generation'],epoch=selection['recovery_epoch'],gaps=copy.deepcopy(old['sequence_gaps']),closed=not old['segments'][0]['segment_name'].endswith('.active'))
        ctx['original_creation_source']=source
        created['source_fixture']['survivor_prefix_sha256']=source['source_selection']['manifest_survivor_prefix_sha256']
    ctx['original_creation_publication']=dep.birth_binding(created,ctx['original_creation_source'],ctx['original_creation_commit_transaction'])
    return value
