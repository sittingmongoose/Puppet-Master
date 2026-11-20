"""Source- and schema-bound earlier-clause implications, never sample masks."""
import hashlib
import json
from pathlib import Path
import pm_goal_oracle_common as c

ROOT=Path(__file__).resolve().parents[1]


def pinned(which,name):
    pin=c.load(ROOT/'Plans/restore_point_deleted_contract_fixtures.json')[which]
    manifest=Path(pin['path']);raw=manifest.read_bytes()
    if hashlib.sha256(raw).hexdigest()!=pin['sha256']:raise ValueError('implication manifest pin')
    row=next(row for row in json.loads(raw)['files']if Path(row['path']).name==name)
    path=Path(row['path']);path=path if path.is_absolute()else manifest.parent/path
    data=path.read_bytes()
    if hashlib.sha256(data).hexdigest()!=row['sha256']:raise ValueError('implication resource pin')
    return path,data,row['sha256']


def proof(name,reports):
    import pm_goal_deleted_external_oracles as f
    dep,subject,seeds=f.FIXTURE_CONTEXT
    old='restore_point.deleted/original/';ret='restore_point.deleted/retained/'
    def schema_guard(document):return old+'schema/'+f.frozen_fingerprint(document)
    def result(which,file,label,dependencies,fragments,explanation,**details):
        path,data,sha=pinned(which,file);text=data.decode()
        if any(fragment not in text for fragment in fragments):return None
        return dict(kind='earlier_owner_schema_or_checker_clause',earlier_guards=dependencies,
                    owner=str(path),owner_sha256=sha,line=next(i for i,line in enumerate(text.splitlines(),1)if repr(label)in line),
                    proof=explanation,**details)
    if name==ret+'original native hash recipe':
        schema=dep.family['restore_point_creation_commit']['value_schema']
        if schema['properties']['record_hash_recipe_id']!={'const':'pm.restore_point.immutable_capture_sha256.v1'}:return None
        return result('retained_phase_subject','retained_read.py','original native hash recipe',[schema_guard(schema)],
            ["d.validator(d.family['restore_point_creation_commit']['value_schema']).validate(co)","co['record_hash_recipe_id']=='pm.restore_point.immutable_capture_sha256.v1'"],
            'The complete creation-companion schema runs before this row and its record_hash_recipe_id const is exactly the compared literal. Every value making this row false is refused by that earlier schema. The schema boundary has its own first-refusal witness.',
            schema_clause='/properties/record_hash_recipe_id/const',schema_sha256=f.frozen_fingerprint(schema))
    if name==old+'explicit accepted summary schema':
        first=dep.family['restore_point_retention_summary']['value_schema'];second=dep.rd(dep.F/'retention-summary-v2.schema.json')
        if first['properties']['schema_version'].get('const')!='1.0.0'or second['properties']['schema_version'].get('const')!='2.0.0':return None
        return result('frozen_joined_subject','validate_deleted_v3.py','explicit accepted summary schema',[schema_guard(first),schema_guard(second)],
            ["v=s['schema_version']","if v=='1.0.0' else rd(F/'retention-summary-v2.schema.json')","expect(v in ['1.0.0','2.0.0'],'explicit accepted summary schema')"],
            'Version 1 selects a schema requiring exactly 1.0.0. Every other version selects a schema requiring exactly 2.0.0. A value outside the compared pair therefore always fails the selected earlier whole schema.',
            schema_clauses=['/properties/schema_version/const'],schema_sha256s=[f.frozen_fingerprint(first),f.frozen_fingerprint(second)])
    if name==old+'filtered project':
        return result('frozen_joined_subject','validate_deleted_v3.py','filtered project',
            [old+'duplicate global event ID',old+'complete matching deletion set for this bounded joined fixture',old+'actual complete current source event/index identity'],
            ["f['event']['event_type']=='restore_point.deleted' and f['event']['project_id']==c['project_id']","matching==b['classified_delete_event_ids']==[b['event']['event_id']]","f['event']==event","event['project_id']==b['checkpoint']['project_id']"],
            'The earlier complete matching set contains exactly the candidate event ID and selects only source frames whose project equals the checkpoint project. The earlier global-ID uniqueness makes that frame unique. The earlier complete source-event identity equates this same unique frame to the candidate event. Its project must therefore equal the checkpoint project before this later comparison.')
    if name==old+'native completion requires committed operation':
        operation=subject.DEFS['deletion_commit'];owners=subject.OC.schemas()
        if set(operation['properties']['state']['enum'])!={'pending_append','committed'}:return None
        pending=next((x for x in operation.get('allOf',[])if x.get('if',{}).get('properties',{}).get('state',{}).get('const')=='pending_append'),None)
        if pending is None or pending['then']['properties']['append_receipt'].get('type')!='null':return None
        receipt=owners['properties']['append_ack_control']['properties']['original_receipt']
        if receipt.get('type')!='object':return None
        return result('frozen_joined_subject','validate_deleted_v3.py','native completion requires committed operation',
            [schema_guard(owners),old+'full original append acknowledgement retained through command result',schema_guard(operation)],
            ['OC.check(b)',"validate_operation(op,q);expect(op['state']=='committed'"],
            'The earlier original-owner schema requires ack.original_receipt to be an object. The earlier complete acknowledgement equality makes it equal op.append_receipt. The earlier operation schema permits only pending_append/committed and requires a pending_append operation to have a null append_receipt. Therefore every pending_append candidate fails one of those earlier clauses; every candidate reaching this row must be committed.',
            schema_sha256s=[f.frozen_fingerprint(owners),f.frozen_fingerprint(operation)])
    if name in (old+'created original receipt source',old+'original append receipt publication join'):
        deleted=name==old+'created original receipt source'
        filename='dependency_runtime.py'if deleted else'adoption_v4_check.py'
        label=name[len(old):]
        dependencies=[old+'receipt join',old+'receipt location',old+('created original locator'if deleted else'original source cursor/frame-end'),old+('created original source manifest_generation'if deleted else'source witness original manifest_generation'),old+('created complete original birth binding'if deleted else'typed original publication complete binding'),old+('created original/current immutable event'if deleted else'original append/current source immutable event scope identity')]
        return result('frozen_joined_subject',filename,label,dependencies,
            ["rec=d['companion']['append_receipt']","rec['manifest_generation']==pub['source_selection']['manifest_generation']","rec['event_id']==pub['event_id']","rec['sequence_id']==pub['sequence_id']"],
            'The earlier created-domain receipt join fixes event_id/sequence_id to the current event and fixes manifest_generation/durable_end_offset to source_fixture. Its receipt-location join fixes all three locator fields to source_fixture. The earlier original source cursor equality and manifest equality fix those source_fixture values to publication. The complete birth binding derives publication event_id/sequence_id from the original source frame, and the earlier immutable-event equality makes that frame the current event. Transitivity therefore establishes every conjunct of this later receipt/publication row.')
    if name==old+'six immutable runtime owner references':
        schema=c.load(ROOT/'Plans/requested_effective_runtime.schema.json')
        fields=['run_modes_resolution_ref','models_resolution_ref','capability_snapshot_ref','multi_account_resolution_ref','persona_resolution_ref','auth_resolution_ref']
        if not set(fields)<=set(schema['required']):return None
        if any(schema['properties'][field].get('type')!='string'or schema['properties'][field].get('minLength',0)<1 for field in fields):return None
        return result('frozen_joined_subject','adoption_v4_check.py','six immutable runtime owner references',[old+'run snapshot schema'],
            ["shape(b);v=b['generic']","all(run['snapshot'][k] for k in refs)"],
            'shape validates the complete immutable snapshot before this row. All six named owner references are required strings with minLength at least one. Every falsey value therefore fails that earlier whole snapshot schema.',
            schema_path='Plans/requested_effective_runtime.schema.json',schema_sha256=hashlib.sha256((ROOT/'Plans/requested_effective_runtime.schema.json').read_bytes()).hexdigest())
    if name==old+'read token schema':
        path,data,sha=pinned('frozen_joined_subject','adoption_v4_check.py');text=data.decode()
        schema=dep.generic_schema['$defs']['read_token']
        if f.frozen_fingerprint(schema)!='71dbfd352c5854a3b072a675ee7f785a5369fe9cf8fb8cdc66ee98f9e4ea4567':return None
        if set(schema['properties'])!={'storage_instance_id','checkpoint_key','checkpoint_ref','generation_id','generation_anchor_sha256','frontier_revision','frontier_sha256','index_dataset_name','source_selection','redb_snapshot_id'}:return None
        # Refuse this proof if its closed output shape or numeric contract moves.
        if schema.get('additionalProperties')is not False or set(schema['required'])!=set(schema['properties']):return None
        if schema['properties']['frontier_revision']!={'type':'integer','minimum':0,'maximum':2**64-1}:return None
        fragments=["def token(v):return {**selection(v),'redb_snapshot_id':'synthetic-same-redb-snapshot:'+current(v)['frontier']['redb_transaction_id']}","generic_validate(v);expected=token(v);expect(t==expected,'exact current generation/anchor/frontier/source/redb snapshot token')","'generation_anchor_sha256':bdig(g['anchor'])","'frontier_sha256':bdig(g['frontier'])","'source_selection':copy.deepcopy(g['frontier']['source_selection'])"]
        if any(x not in text for x in fragments):return None
        return result('frozen_joined_subject','adoption_v4_check.py','read token schema',[old+'exact current generation/anchor/frontier/source/redb snapshot token',old+'closed checkpoint schema'],fragments,
            'The earlier exact-token equality fixes all ten members to token(v). generic_validate has already validated the selected generation/frontier. Storage is the fixed valid UUID SID; both keys and the snapshot prefix are nonempty constructed strings; generation_id comes from the validated selected node; revision is its bounded uint64 publication_revision; index_dataset_name is the validated nonempty dataset name; source_selection is copied from the validated frontier; both digests are SHA-256 hexdigests. The constructed token contains exactly the required closed shape. Thus equality plus the earlier complete checkpoint schema implies this later read-token schema.',
            schema_sha256=f.frozen_fingerprint(schema),constructor_source_sha256=sha)
    if name in (ret+'all actual current admission gates hold at disclosure',ret+'full current token before disclosure'):
        if name.endswith('all actual current admission gates hold at disclosure'):
            dependencies=[ret+'native boundary must verify actual registered/coherent admitted store origin',ret+'current actual disclosure permissions',ret+'new reader explicitly installed; no old binding widening',ret+'all actual admission/registration/installation/origin facts unchanged before disclosure']
            fragments=["self.issued[lease]={'epoch':self.epoch,'request':copy.deepcopy(request),'admission_facts':self.current_admission_facts()}","issued['admission_facts']==self.current_admission_facts()","self.registration_current and self.source_origin_admitted and self.backup_coherent and self.migration_supported and self.permissions_allowed and not self.quarantined and self.reader_binding in self.installed_bindings"]
            explanation='On this complete read path only successful open_read issues a lease. Its three earlier admission predicates establish every conjunct and capture current_admission_facts. That captured dictionary contains every gate flag, reader_binding and installed_bindings. The earlier final equality requires all those facts unchanged, so every conjunct remains true. This proof concerns the sequential TEST_ONLY complete-read model; it makes no native atomicity claim.'
            label='all actual current admission gates hold at disclosure'
        else:
            dependencies=[ret+'actual native owner read differs from caller snapshot',ret+'exact authenticated canonical rows/source/origin unchanged before disclosure']
            fragments=["self.issued[lease]['authenticated_snapshot']=copy.deepcopy(snapshot)","issued['authenticated_snapshot']==actual","actual['read_token']==token"]
            explanation='authenticate_exact_snapshot first establishes the supplied snapshot equals the independently resolved native snapshot, then stores its exact copy. read_present passes supplied.read_token to this fence. The earlier final whole-snapshot equality makes actual equal that stored copy, including read_token. Therefore actual.read_token equals the argument. No mutable callback runs between that equality and the token comparison in this sequential fixture.'
            label='full current token before disclosure'
        return result('retained_phase_subject','fixture_store.py',label,dependencies,fragments,explanation,
                      scope='complete sealed read through real issued lease; no fabricated issued-state inputs')
    return None
