"""Causal DR guard witnesses, shared by the full oracle and mutation matrix.

Each negative starts with a positive invocation. Derived observations are
rebound when their source changes; original custody is never repaired on read.
Mutations exist only in the separate standing-check driver, never here.
"""
import copy
import hashlib
from pm_runtime_artifact_round6_cases import cases as round6_cases
from pm_runtime_artifact_round7_cases import cases as round7_cases


def accepted(action):
    try:
        value = action()
        return value is not False and value not in ('invalid', 'unavailable', 'withdrawn',
            'idempotency_conflict', 'identity_conflict', 'replay_only_not_appendable')
    except (ValueError, KeyError, TypeError, UnicodeError, OSError):
        return False


def cases(m, excluded=()):
    """Return (guard, family, name, valid invocation, single-defect invocation)."""
    fixtures = m.load('Plans/runtime_artifact_event_drafts.fixtures.json')
    rows = [r for r in m.load('Plans/runtime_artifact_event_drafts.json')['rows'] if r['event_type'] not in excluded]
    result = []

    def add(guard, family, name, good, bad):
        result.append((guard, family, name, good, bad))

    for row in rows:
        family = row['event_type']
        full = copy.deepcopy(fixtures['positive_events'][family])
        receipt = fixtures['first_append_receipts'][family]
        # Build valid original custody without asking a possibly mutated writer
        # to issue it. All values are the original fixture's known commitments.
        custody = copy.deepcopy(fixtures['custody_template'])
        custody.update(event_id=full['event_id'], scope_partition=m.scope_partition(full['project_id']),
            event_type=family, idempotency_key=full['idempotency_key'],
            producer_semantic_digest=m.semantic_digest(full), first_append_receipt=copy.deepcopy(receipt),
            original_event_value_commitment=m.commitment(full))
        original = dict(event=full, custody=custody, result={k:copy.deepcopy(custody[k]) for k in (
            'first_append_receipt','original_segment_ref','original_event_value_commitment')})
        def dec(event, packs=None, row=row):
            return lambda n: n.decode(row,event,packs or {})
        for guard, name, edit in [
            ('D01','envelope_extension',lambda e:e.update(extra=True)),
            ('D02','family',lambda e:e.update(event_type='runtime_artifact.unknown')),
            ('D02','payload_schema',lambda e:e.update(payload_schema_id='unknown.schema')),
            ('D03','replay',lambda e:e.update(replay_policy='append_once')),
            ('D03','redaction',lambda e:e.update(redaction_profile='redacted')),
            ('D04','inline_size',lambda e:e['payload'].update(summary='x'*17000)),
            ('D12','logical_extension',lambda e:e['payload'].update(extra=True)),
            ('D13','project_join',lambda e:e.update(project_id='another-project')),
            ('D15','authored_time',lambda e:e.update(occurred_at_utc='2026-07-03T00:00:00Z')),
            ('D17','identity',lambda e:e.update(idempotency_key='ra1:'+'0'*64)),
        ]:
            bad=copy.deepcopy(full);edit(bad)
            add(guard,family,name,dec(full),dec(bad))
        for field in ('run_id','attempt_id','thread_id','node_id'):
            bad=copy.deepcopy(full);bad[field]='another-source'
            add('D14',family,field,dec(full),dec(bad))
        if family.endswith('.restore_point'):
            bad=copy.deepcopy(full);bad['payload']['type_payload']['project_id']='another-project'
            add('D18',family,'point_project',dec(full),dec(bad))
        # Optional producer actor is made present, and valid, on BOTH sides.
        actor=copy.deepcopy(full);actor['payload']['actor_ref']=actor['actor_ref']
        if m.validator(m.load(row['payload_schema_ref'])).is_valid(actor['payload']):
            bad=copy.deepcopy(actor);bad['actor_ref']='actor:another'
            add('D16',family,'actor',dec(actor),dec(bad))
        logical=copy.deepcopy(full['payload']);logical['summary']='x'*17000
        packs={};packed=copy.deepcopy(full);packed['payload'],packed['payload_ref']=m.storage_form(logical,packs)
        digest=m.PACK_REF.fullmatch(packed['payload_ref']).group(1)
        for guard,name,edit in [
            ('D05','media',lambda e,p:e.update(payload_ref=e['payload_ref'].replace('application/json','text/plain'))),
            ('D06','placeholder',lambda e,p:e.update(payload=copy.deepcopy(full['payload']))),
            ('D07','pack_not_durable',lambda e,p:p[digest].update(durable=False)),
            ('D07','pack_unauthorized',lambda e,p:p[digest].update(authorized=False)),
            ('D08','byte_size',lambda e,p:e.update(payload_ref=e['payload_ref'].replace(':'+str(len(p[digest]['body']))+':',':1:'))),
            ('D09','same_size_digest',lambda e,p:p[digest].update(body=p[digest]['body'].replace(b'xxxxxxxx',b'yxxxxxxx',1))),
        ]:
            bad,broken=copy.deepcopy((packed,packs));edit(bad,broken)
            add(guard,family,name,dec(packed,packs),dec(bad,broken))
        # Canonicality and duplicate-member refusal enforce one JSON encoding
        # invariant: duplicate JSON cannot also be canonical JSON.
        for name,body in [('whitespace',m.json.dumps(logical,indent=2).encode()),
                          ('duplicate_member',m.rfc8785.dumps(logical)[:-1]+b',"summary":"'+b'x'*17000+b'"}')]:
            d=m.blake3(body).hexdigest();broken={d:dict(body=body,durable=True,authorized=True)}
            bad=copy.deepcopy(packed);bad['payload_ref']=f'pm.payload_pack.v1:blake3:{d}:{len(body)}:application/json'
            add('D10',family,name,dec(packed,packs),dec(bad,broken))
        small=m.rfc8785.dumps(full['payload']);d=m.blake3(small).hexdigest()
        bad=copy.deepcopy(packed);bad['payload_ref']=f'pm.payload_pack.v1:blake3:{d}:{len(small)}:application/json'
        add('D11',family,'unnecessary_pack',dec(packed,packs),dec(bad,{d:dict(body=small,durable=True,authorized=True)}))

        src=m.source_for(row,full['payload'])
        for guard,name,key,value in [('H01','withdrawn','withdrawn',True),('H01','unauthorized','authorized',False),
            ('H02','forged_source','source_valid',False),('H02','forged_receipt','receipt_valid',False),
            ('H03','project','project_id','another-project'),('H03','family','event_type','other'),
            ('H04','changed_original','original_payload',dict(full['payload'],summary='changed'))]:
            bad=copy.deepcopy(src);bad[key]=value
            add(guard,family,name,lambda n,r=row,e=full,s=src:n.inspect(r,e['payload'],s),
                lambda n,r=row,e=full,s=bad:n.inspect(r,e['payload'],s))

        def fv(o,c=None,r=None,u=None):
            c=o['event'] if c is None else c;r=o['result'] if r is None else r;u=o['custody'] if u is None else u
            return lambda n:n.full_value_matches(c,o,r,u)
        for guard,name,edit in [
            ('F01','schema',lambda o:o['custody'].update(group_digest='invalid')),
            ('F03','partition',lambda o:o['custody'].update(scope_partition=full['project_id'])),
            ('F04','custody_family',lambda o:o['custody'].update(event_type='other')),
            ('F05','custody_key',lambda o:o['custody'].update(idempotency_key='other')),
            ('F06','receipt_sequence',lambda o:(o['result']['first_append_receipt'].update(sequence_id=full['sequence_id']+1),o['custody']['first_append_receipt'].update(sequence_id=full['sequence_id']+1))),
            ('F07','segment_reference',lambda o:o['result'].update(original_segment_ref='another-segment')),
            ('F08','full_commitment',lambda o:(o['custody']['original_event_value_commitment'].update(sha256='0'*64),o['result']['original_event_value_commitment'].update(sha256='0'*64))),
            ('F09','semantic_commitment',lambda o:o['custody'].update(producer_semantic_digest='0'*64)),
            ('F10','receipt_copy',lambda o:o['custody']['first_append_receipt'].update(acknowledged_at_utc='2026-07-03T00:00:00Z')),
            ('F11','custody_event',lambda o:o['custody'].update(event_id='another-event')),
            ('F11','receipt_event',lambda o:(o['result']['first_append_receipt'].update(event_id='another-event'),o['custody']['first_append_receipt'].update(event_id='another-event'))),
            ('F08','result_commitment',lambda o:o['result']['original_event_value_commitment'].update(sha256='0'*64)),
        ]:
            bad=copy.deepcopy(original);edit(bad)
            add(guard,family,name,fv(original),fv(bad))
        candidate=copy.deepcopy(full);candidate['observed_at_utc']='2026-07-03T00:00:00Z'
        bad=copy.deepcopy(original);bad['event']=candidate
        add('F02',family,'original_value_bytes',fv(original),fv(bad,c=full))
        bad=copy.deepcopy(original);bad['result']['original_segment_ref']='another-segment'
        add('F12',family,'original_result',fv(original),fv(bad,r=original['result']))
        bad=copy.deepcopy(original);bad['custody']['group_digest']='0'*64
        add('F13',family,'original_custody',fv(original),fv(bad,u=original['custody']))
        source=m.history_source_for(row,full['payload'],original)
        forged=copy.deepcopy(original);forged['custody']['group_digest']='0'*64
        add('H06',family,'authenticated_custody',
            lambda n,r=row,o=original,s=source:n.resolve_history(r,o,s,{},decoder=n.HISTORICAL_V1),
            lambda n,r=row,o=forged,s=source:n.resolve_history(r,o,s,{},decoder=n.HISTORICAL_V1))

        for guard,name,edit in [('V01','event_extension',lambda e:e.update(extra=True)),
            ('V02','replay',lambda e:e.update(replay_policy='append_once')),
            ('V03','pack_ref',lambda e:e.update(payload={},payload_ref='not-a-pack')),
            ('V04','pack_placeholder',lambda e:e.update(payload_ref=packed['payload_ref'])),
            ('V05','inline_size',lambda e:e['payload'].update(summary='x'*17000)),
            ('V06','logical_schema',lambda e:e['payload'].update(extra=True)),
            ('V07','unknown_dispatch',lambda e:e.update(event_type='runtime_artifact.unknown'))]:
            bad=copy.deepcopy(full);edit(bad)
            add(guard,family,name,lambda n,e=full:n.stored_event_valid(e),lambda n,e=bad:n.stored_event_valid(e))

        def append(e,**kw):
            return lambda n,r=row,e=e,kw=kw:n.AppendModel(r,{},receipt,fixtures['custody_template']).append(e,**kw)
        good=append(full,admission=True)
        for guard,name,kw in [('A01','not_admitted',{}),('A02','source_invalid',dict(admission=True,source_valid=False)),
            ('A02','dedupe_unavailable',dict(admission=True,dedupe_available=False))]:
            add(guard,family,name,good,append(full,**kw))
        # A replay exercises the policy guard before dedupe without touching any
        # payload/schema guard. Removal must permit the exact original result.
        def retry(n,e,kind,row=row,receipt=receipt,full=full):
            model=n.AppendModel(row,{},receipt,fixtures['custody_template']);model.append(full,True)
            return model.append(e,True)
        for policy in ('projector_replay_only','append_once','dedupe_by_event_id'):
            bad=copy.deepcopy(full);bad['replay_policy']=policy
            add('A03',family,policy+'_retry',lambda n,e=full,r=retry:r(n,e,'policy'),lambda n,e=bad,r=retry:r(n,e,'policy'))
        bad=copy.deepcopy(full);bad['payload']['artifact_id']+='-another';bad['idempotency_key']=m.identity(family,bad['payload'],bad['producer_sequence_id'])
        add('A04',family,'global_event_conflict',lambda n,e=full,r=retry:r(n,e,'global'),lambda n,e=bad,r=retry:r(n,e,'global'))
        bad=copy.deepcopy(full);bad['event_id']+='-another';bad['payload']['summary']='changed'
        add('A05',family,'scoped_semantic_conflict',lambda n,e=full,r=retry:r(n,e,'scoped'),lambda n,e=bad,r=retry:r(n,e,'scoped'))
        bad=copy.deepcopy(full);bad['extra']=True
        add('A06',family,'retry_envelope_extension',lambda n,e=full,r=retry:r(n,e,'schema'),lambda n,e=bad,r=retry:r(n,e,'schema'))
        bad_template=copy.deepcopy(fixtures['custody_template']);bad_template['group_digest']='invalid'
        add('A07',family,'invalid_issued_custody',good,
            lambda n,r=row,e=full,t=bad_template,receipt=receipt:n.AppendModel(r,{},receipt,t).append(e,True))

        for guard,name,edit in [('P01','index',lambda r:r.update(index_retention_policy_ref='RP-PROJECTION-3GEN')),
            ('P02','checkpoint',lambda r:r.update(checkpoint_retention_policy_ref='RP-EVENT-INDEX-SOURCE')),
            ('P03','conflated',lambda r:r.update(derived_retention_policy_ref='RP-PROJECTION-3GEN'))]:
            bad=copy.deepcopy(row);edit(bad)
            add(guard,family,name,lambda n,r=row:n.policies_match(r,'RP-EVENT-INDEX-SOURCE','RP-PROJECTION-3GEN'),
                lambda n,r=bad:n.policies_match(r,'RP-EVENT-INDEX-SOURCE','RP-PROJECTION-3GEN'))

        bundle=fixtures['checkpoint_positives'][family]
        def cp(r,o,b,e=full):return lambda n:n.checkpoint_matches(r,e,o,b)
        for guard,name,edit in [
            ('C01','route',lambda r,o,b:r.update(checkpoint_key='foreign-root')),
            ('C02','schema',lambda r,o,b:b['checkpoint'].update(extra=True)),
            ('C03','storage',lambda r,o,b:b['checkpoint'].update(storage_instance_id='22222222-2222-4222-8222-222222222222')),
            ('C04','verified',lambda r,o,b:b['selected_source'].update(verified=False)),
            ('C04','snapshot',lambda r,o,b:b['selected_source'].update(redb_snapshot_id='other')),
            ('C05','token_commitment',lambda r,o,b:b['read_token'].update(frontier_sha256='0'*64)),
            ('C06','source_event',lambda r,o,b:b['selected_source']['event'].update(event_id='other')),
            ('C07','partition',lambda r,o,b:b['selected_source'].update(scope_partition=full['project_id'])),
            ('C08','current_bytes',lambda r,o,b:b['selected_source']['current'].update(fixture_kind='changed')),
            ('C08','manifest_bytes',lambda r,o,b:b['selected_source']['manifest'].update(fixture_kind='changed')),
            ('C09','coverage',lambda r,o,b:node(b)['frontier']['coverage'].update(retained_event_prefix_sha256='0'*64)),
            ('C10','last_frame',lambda r,o,b:node(b)['frontier']['coverage']['last_frame'].update(last_event_id='other')),
            ('C11','segment',lambda r,o,b:segment_fault(m,b)),
            ('C12','dataset',lambda r,o,b:b.update(datasets={})),
            ('C13','row_count',lambda r,o,b:node(b)['frontier'].update(index_row_count=2)),
            ('C14','row_set_digest',lambda r,o,b:node(b)['frontier'].update(index_row_set_sha256='0'*64)),
        ]:
            r,o,b=copy.deepcopy((row,original,bundle));edit(r,o,b)
            if guard in ('C09','C10','C13','C14'):
                b['read_token']['frontier_sha256']=m.binding_digest(node(b)['frontier'])
            add(guard,family,name,cp(row,original,bundle),cp(r,o,b))
        # Re-execute every shipped checkpoint fault, with non-targeted
        # generation/token/dataset observations independently rebound.
        checkpoint_guards={
            'wrong_store_key':'C03','wrong_checkpoint_store':'C03','wrong_token_store':'C03',
            'wrong_source_store':'C03','wrong_custody_store':'C03',
            'wrong_anchor_store':'C04','wrong_frontier_store':'C04','wrong_token_source_store':'C04',
            'unverified_source':'C04','wrong_live_snapshot':'C04',
            'wrong_source_selection':'C08','wrong_event':'C06','wrong_custody_event':'C06',
            'wrong_partition':'C07','wrong_locator':'C07','wrong_key_route':'C01',
            'wrong_pointer':'C05','wrong_frontier':'C05','missing_dataset':'C12',
        }
        for name,guard in checkpoint_guards.items():
            r,e,o,b=m.checkpoint_negative(name,row,full,original,bundle)
            add(guard,family,'shipped_'+name,cp(row,original,bundle),cp(r,o,b,e))
        # A missing schema file remains a structural-unavailability control.
        # Use an available WRONG target to prove the route guard itself.
        r=copy.deepcopy(row);r['checkpoint_schema_ref']=m.CHECKPOINT_SCHEMA.split('#')[0]+'#/$defs/read_token'
        add('C01',family,'available_wrong_schema_target',cp(row,original,bundle),cp(r,original,bundle))

        if family in m.PROVIDER_HASH_PATHS:
            bad=copy.deepcopy(full['payload']);m.set_path(bad,m.PROVIDER_HASH_PATHS[family],'not-a-hash')
            schema=m.load(row['payload_schema_ref'])
            add('S03',family,'provider_hash',lambda n,s=schema,p=full['payload']:n.validator(s).is_valid(p),
                lambda n,s=schema,p=bad:n.validator(s).is_valid(p))
            case=next(c for c in fixtures['historical_originals']['cases'] if c['event_type']==family and c['route']=='inline')
            source=m.history_source_for(row,case['logical_payload'],case['original'])
            add('H05',family,'decoder_selection',
                lambda n,r=row,o=case['original'],s=source:n.resolve_history(r,o,s,{},decoder=n.HISTORICAL_V1),
                lambda n,r=row,o=case['original'],s=source:n.resolve_history(r,o,s,{},decoder='unknown'))

    restore_cases(m,fixtures,rows,add)
    shared_cases(m,rows,add)
    result.extend(round6_cases(m,rows,fixtures))
    result.extend(round7_cases(m,rows,fixtures))
    return result


def node(bundle):
    cp=bundle['checkpoint'];return cp['generations'][cp['current_generation_id']]


def segment_fault(m,b):
    """Change one durable-byte digest; rebind every independent observation."""
    source=b['selected_source'];source['segments'][0]['source_durable_bytes_sha256']='0'*64
    source['manifest']['retained_inventory']=copy.deepcopy(source['segments'])
    selection=source['source_selection']
    selection['manifest_bytes_sha256']=hashlib.sha256(m.value_bytes(source['manifest'])).hexdigest()
    selection['retained_inventory_sha256']=m.binding_digest(source['segments'])
    n=node(b);n['anchor']['source_selection']=copy.deepcopy(selection)
    n['frontier']['source_selection']=copy.deepcopy(selection)
    n['frontier']['coverage']['segments']=copy.deepcopy(source['segments'])
    old=b['checkpoint']['current_generation_id']
    new='eig_'+m.binding_digest(dict(domain='pm.event_index.generation.v1',storage_instance_id=source['storage_instance_id'],
        projector_version=n['projector_version'],birth_source_selection=n['anchor']['source_selection'],
        generation_seed_sha256=n['anchor']['generation_seed_sha256']))
    n['generation_id']=new;n['index_dataset_name']='event_record_index.v2@'+new
    b['checkpoint']['current_generation_id']=new;b['checkpoint']['generations']={new:n}
    token=b['read_token'];token.update(generation_id=new,checkpoint_ref=token['checkpoint_ref'].replace(old,new),
        index_dataset_name=n['index_dataset_name'],generation_anchor_sha256=m.binding_digest(n['anchor']),source_selection=copy.deepcopy(selection))
    ds=b['datasets'].pop('event_record_index.v2@'+old);b['datasets'][n['index_dataset_name']]=ds
    for value in ds.values():value['publication_locator']['checkpoint_ref']=token['checkpoint_ref']
    n['frontier']['index_row_set_sha256']=m.binding_digest(dict(domain='pm.event_index.row_set.v1',entries=[dict(key=k,value=v) for k,v in sorted(ds.items())]))
    token['frontier_sha256']=m.binding_digest(n['frontier'])


def restore_cases(m,f,rows,add):
    row=next((r for r in rows if r['event_type'].endswith('.restore_point')),None)
    if row is None:return
    family=row['event_type']
    old=f['positive_events'][family];good=f['restore_successor']
    src=dict(proof_valid=True,predecessor_complete=True,snapshot_current=True,canonical_point=good['payload']['type_payload'])
    def obs(e,p=old,s=src):return lambda n:n.observation_admissible(e,p,row,{},s)
    for flag in ('proof_valid','predecessor_complete','snapshot_current'):
        s=dict(src);s[flag]=False;add('O01',family,flag,obs(good),obs(good,s=s))
    bad=copy.deepcopy(good);bad['correlation_id']='foreign-group'
    previous=copy.deepcopy(old);previous['correlation_id']='foreign-group'
    add('O02',family,'grouping',obs(good),obs(bad,p=previous))
    s=copy.deepcopy(src);s['canonical_point']['restore_point_id']+='-foreign'
    add('O03',family,'source_snapshot',obs(good),obs(good,s=s))
    for field,value in [('producer_sequence_id',1),('parent_event_id','other')]:
        bad=copy.deepcopy(old);bad[field]=value
        bad['idempotency_key']=m.identity(family,bad['payload'],bad['producer_sequence_id'])
        source=dict(src,canonical_point=old['payload']['type_payload'])
        add('O04',family,'first_'+field,obs(old,p=None,s=source),obs(bad,p=None,s=source))
    for field in ('restore_point_id','record_ref','record_sha256','source_thread_id','source_branch_id','source_message_id'):
        bad=copy.deepcopy(good);value=bad['payload']['type_payload'][field]
        bad['payload']['type_payload'][field]=('0'*64 if field=='record_sha256' else (value or 'source')+'-foreign')
        s=dict(src,canonical_point=bad['payload']['type_payload'])
        add('O05',family,field,obs(good),obs(bad,s=s))
    for field in ('artifact_id','project_id'):
        bad=copy.deepcopy(good)
        if field=='artifact_id':bad['payload']['artifact_id']+='-foreign'
        else:
            bad['project_id']='another-project';bad['payload']['project_id']='another-project'
            bad['payload']['type_payload']['project_id']='another-project'
        bad['idempotency_key']=m.identity(family,bad['payload'],bad['producer_sequence_id'])
        bad['correlation_id']=m.grouping_identity(family,bad['payload'])
        previous=copy.deepcopy(old);previous['correlation_id']=bad['correlation_id']
        add('O05',family,field,obs(good),obs(bad,p=previous,s=dict(src,canonical_point=bad['payload']['type_payload'])))
    bad=copy.deepcopy(good);bad['payload']['type_payload']=copy.deepcopy(old['payload']['type_payload'])
    add('O06',family,'unchanged',obs(good),obs(bad,s=dict(src,canonical_point=bad['payload']['type_payload'])))
    for ordinal in (0,2):
        bad=copy.deepcopy(good);bad['producer_sequence_id']=ordinal
        bad['idempotency_key']=m.identity(family,bad['payload'],ordinal)
        add('O08',family,str(ordinal),obs(good),obs(bad))
    bad=copy.deepcopy(good);bad['parent_event_id']='foreign-event'
    add('O09',family,'predecessor',obs(good),obs(bad))
    previous=copy.deepcopy(old);previous['correlation_id']='foreign-group'
    add('O10',family,'prior_group',obs(good),obs(good,p=previous))
    previous=copy.deepcopy(f['restore_terminal_observations']['deleted'])
    previous['producer_sequence_id']=0;previous['parent_event_id']=None
    previous['idempotency_key']=m.identity(family,previous['payload'],0)
    candidate=copy.deepcopy(f['restore_terminal_observations']['expired'])
    candidate['parent_event_id']=previous['event_id']
    source=dict(src,canonical_point=candidate['payload']['type_payload'])
    stable=copy.deepcopy(previous);stable['producer_sequence_id']=1;stable['parent_event_id']=previous['event_id']
    stable['event_id']+='-later-observation'
    stable['idempotency_key']=m.identity(family,stable['payload'],1)
    # A second deleted observation must change some original source field that
    # is mutable (e.g. the source's lifecycle timestamp), without reopening it.
    stable['payload']['type_payload']['context_provenance_refs'].append('context:later-observation')
    add('O07',family,'terminal_reopen',obs(stable,p=previous,s=dict(src,canonical_point=stable['payload']['type_payload'])),
        obs(candidate,p=previous,s=source))


def shared_cases(m,rows,add):
    last=[None,None]
    def refs(n):
        if last[0] is not n:last[:]=[n,n.SchemaReferences()]
        return last[1]
    for row in rows:
        family=row['event_type'];schema=m.load(row['payload_schema_ref'])
        bad=copy.deepcopy(schema);bad['properties']['actor_ref']={'$ref':'#/$defs/DR_MISSING'}
        add('S01',family,'unresolved_optional',lambda n,r=row: not refs(n).errors([r['payload_schema_ref']]),
            lambda n,r=row,b=bad:not refs(n).errors([r['payload_schema_ref']],{r['payload_schema_ref']:b}))
    schema={'type':'string','pattern':'^[0-9a-f]{64}$'}
    add('S02','shared','identifier_LF',lambda n:n.ExactValidator(schema).is_valid('a'*64),lambda n:n.ExactValidator(schema).is_valid('a'*64+'\n'))
    schema_keys={'type':'object','patternProperties':{'^[0-9a-f]{64}$':{'type':'integer'}}}
    add('S04','shared','identifier_key_LF',lambda n:n.ExactValidator(schema_keys).is_valid({'a'*64:1}),lambda n:n.ExactValidator(schema_keys).is_valid({'a'*64+'\n':1}))
    add('S05','shared','success_is_not_failure',lambda n:n.rejected(lambda:(_ for _ in ()).throw(ValueError())),lambda n:n.rejected(lambda:0))
    payload=dict(project_id='p',artifact_id='a',schema_id='s')
    for name,value in [('negative',-1),('missing',None),('boolean',True),('fractional',1.5)]:
        add('I01','shared',name+'_observation_revision',lambda n:n.identity('runtime_artifact.restore_point',payload,0),
            lambda n,v=value:n.identity('runtime_artifact.restore_point',payload,v))
    for name,value in [('infinite',float('inf')),('negative_infinite',float('-inf')),('nan',float('nan'))]:
        add('I02','shared',name+'_value',lambda n:n.value_bytes(1.0),lambda n,v=value:n.value_bytes(v))
    # msgpack supports binary values, but this canonical EventRecord codec does
    # not; bytes isolate our explicit guard from the packer's own type errors.
    add('I03','shared','unsupported_binary',lambda n:n.value_bytes('text'),lambda n:n.value_bytes(b'text'))
    add('S06','shared','unsupported_validation_profile',lambda n:n.validator({'type':'string'},validation=n.CURRENT_WRITER),
        lambda n:n.validator({'type':'string'},validation='unknown'))
