"""Typed generic-checkpoint defects built with the unchanged frozen factories."""
import copy


def edit(base,operation,g):
    value=copy.deepcopy(base);v=value['args'][0]
    cp=v['checkpoint'];oldid=cp['current_generation_id'];current=cp['generations'][oldid]
    if operation=='generic_two_staged':
        if len(cp['generations'])!=1:raise ValueError('requires a single-current control')
        for when in ('2027-01-01T00:00:00Z','2027-01-02T00:00:00Z'):
            staged=g['build'](v['current_source'],state='staged',origin='same_source_rebuild',when=when)
            cp['generations'].update(staged['checkpoint']['generations'])
            v['datasets'].update(staged['datasets'])
            v.setdefault('source_by_generation',{}).update(staged.get('source_by_generation',{}))
    elif operation=='generic_row_key':
        rows=v['datasets'][current['index_dataset_name']];key=next(iter(rows))
        rows[key+':foreign']=rows.pop(key);g['refresh_tx'](v)
    elif operation.startswith('generic_anchor:'):
        field=operation.split(':',1)[1]
        old=current['anchor']['source_selection'][field]
        current['anchor']['source_selection'][field]=(old[:-1]+('0'if old[-1:]!='0'else'1'))if type(old)is str else old+1
        newid=g['generation_id'](current['anchor']['source_selection'],current['anchor']['generation_seed_sha256'])
        dataset=current['index_dataset_name'];cp['generations']={newid if k==oldid else k:node for k,node in cp['generations'].items()}
        cp['current_generation_id']=newid;current['generation_id']=newid;current['index_dataset_name']='event_record_index.v2@'+newid
        v['datasets'].pop(dataset);v['datasets'][current['index_dataset_name']]={g['ikey'](f['event']):g['row_for'](f,current)for f in v['current_source']['frames']}
        if oldid in v.get('source_by_generation',{}):v['source_by_generation'][newid]=v['source_by_generation'].pop(oldid)
        g['refresh_tx'](v)
    else:raise ValueError('unknown generic defect')
    return value
