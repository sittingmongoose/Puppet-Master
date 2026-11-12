#!/usr/bin/env python3
"""C3-W34 reference-successor component checks. TEST_ONLY.

Representation specimens are NOT native Start/D06 semantic positives. Exit 2
means full qualification is incomplete, including old W4 reference routing.
The available native-v7 companions are separate editions, not a blocker.
No source bank is rewritten and no guard-removal engine or number codec lives here.
"""
from __future__ import annotations
import argparse
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
from blake3 import blake3
from referencing import Resource
from referencing.jsonschema import DRAFT202012
from pm_goal_own_c_oracles import ROOT, Validator, FORMAT, Refusal, require, equal, Suite, event_fixture
from pm_goal_own_c3_w34_oracles import DiagnosticBank, specimen
from pm_goal_own_c_roots import OriginalBank
from pm_goal_test_storage import k_component

DIRECTORY = ROOT / 'Plans/goal_run_projection_reference_contracts'
CURRENT_CASE = None
SCHEMA_OBSERVATIONS = []


class RepresentationSuite(Suite):
    def case(self, id, run, expected=None):
        global CURRENT_CASE
        CURRENT_CASE = id
        try:
            return super().case(id,run,expected)
        finally:
            CURRENT_CASE = None


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def original_codec():
    manifest = json.loads((ROOT / 'Plans/goal_own_c_contracts/source-witness-inputs.json').read_text())
    path = Path(manifest['original_storage_codec'])
    row = next(r for r in manifest['files'] if r['path'] == str(path))
    require('setup/original_codec_hash', sha(path.read_bytes()) == row['sha256'])
    spec = importlib.util.spec_from_file_location('c3_w34_original_physical_codec', path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def commitment(codec, event):
    # Exact CV-339 full-value array; independent of BLAKE3 payload addressing.
    domain = 'pm.storage.original_event_value_commitment.v1'
    profile = 'pm.seglog_frame_v2.event_value.canonical_msgpack.v1'
    return dict(schema_id=domain, schema_version='1.0.0', codec=profile,
                domain=domain, event_schema_id='pm.event.v0', event_schema_version='2.0.0',
                sha256=sha(codec.pack([domain, '1.0.0', profile, 'pm.event.v0', '2.0.0', event])))


class Packs:
    """Private representation-test pack/index owner, not original Event authority."""
    def __init__(self):
        self.bytes = {}
        self.durable = True
        self.access = True
        self.store = '12345678-1234-1234-1234-123456789abc'

    def put(self, raw):
        key = blake3(raw).hexdigest()
        self.bytes[key] = raw
        return dict(blake3=key, byte_size=len(raw), media_type='application/msgpack')

    def read(self, reference):
        require('pack/durable', self.durable is True)
        require('pack/access', self.access is True)
        require('pack/store', self.store == '12345678-1234-1234-1234-123456789abc')
        require('pack/present', reference['blake3'] in self.bytes)
        raw = self.bytes[reference['blake3']]
        require('pack/blake3', blake3(raw).hexdigest() == reference['blake3'])
        require('pack/size', type(reference['byte_size']) is int and reference['byte_size'] == len(raw))
        require('pack/media', reference['media_type'] == 'application/msgpack')
        return raw


class Representation:
    def __init__(self, short, bank, codec, record):
        self.short, self.bank, self.codec = short, bank, codec
        self.selection = json.loads((DIRECTORY / (short + '.physical.json')).read_text())
        self.uri = self.selection['new_whole_schema']['retrieval_uri']
        self.packs = Packs()
        self.original = copy.deepcopy(record)  # schema/representation specimen ONLY
        self.source_available = True
        self.permission = True
        self.withdrawn = False
        self.root_epoch = 1
        self.cells = {}
        self.captured_epoch = 1
        self.last_sizes = {}
        self.live_state = 'original'

    def validate(self, name, value):
        errors = list(Validator({'$ref': self.uri + '#/$defs/' + name},
                      registry=self.bank.registry, format_checker=FORMAT).iter_errors(value))
        if errors:
            def leaves(error):
                if error.context:
                    for child in error.context:
                        yield from leaves(child)
                else:
                    yield dict(instance_path=list(error.absolute_path),schema_path=list(error.absolute_schema_path),keyword=error.validator)
            SCHEMA_OBSERVATIONS.append(dict(case_id=CURRENT_CASE,root=self.uri+'#/$defs/'+name,
                raw_leaf_errors=[leaf for error in errors for leaf in leaves(error)],
                qualification='Raw per-field/schema-keyword observations; inactive union branches are not duplicate guards and must be adjudicated by the shared tool.'))
            raise Refusal('representation/schema')

    def identity(self, record):
        event = record['original_event']
        return dict(storage_instance_id='12345678-1234-1234-1234-123456789abc', scope=copy.deepcopy(record['scope']),
                    **{key: event[key] for key in ('event_id','event_type','sequence_id','idempotency_key')})

    def operation(self, wrapper):
        return dict(table=wrapper['dataset_name'], key=wrapper['physical_key'], value=wrapper)

    def fits(self, wrapper, checkpoint=False):
        operation = (dict(table='checkpoints',key=wrapper['physical_key'],value=wrapper)
                     if checkpoint else self.operation(wrapper))
        return len(self.codec.pack(wrapper)) <= 16384 and len(self.codec.pack(operation)) <= 16384

    def encode(self, record, store_payload=True):
        # Copy every original metadata field. No whole source or semantic claim.
        key = self.selection['projection']['key'].split(':K(')[0] + ':' + k_component('x') + ':' + k_component('x')
        dataset = self.selection['projection']['table'].replace('<generation_id>', self.selection['generation_prefix']+'0'*64)
        wrapper = dict(schema_id=self.selection['projection']['schema_id'],schema_version='1.0.0',
                       storage_instance_id='12345678-1234-1234-1234-123456789abc',physical_key=key,dataset_name=dataset,
                       event_identity=self.identity(record),
                       original_event_value_commitment=copy.deepcopy(record['original_event_value_commitment']),
                       content=dict(kind='inline',record=copy.deepcopy(record)))
        if not self.fits(wrapper):
            metadata = copy.deepcopy(record)
            event = metadata.pop('original_event')
            def payload_ref(raw):
                return (self.packs.put(raw) if store_payload else dict(blake3=blake3(raw).hexdigest(),byte_size=len(raw),media_type='application/msgpack'))
            event_ref = payload_ref(self.codec.pack(event))
            wrapper['content'] = dict(kind='event_reference',metadata=metadata,event_ref=event_ref)
            if not self.fits(wrapper):
                wrapper['content'] = dict(kind='record_reference',
                    metadata_ref=payload_ref(self.codec.pack(metadata)),event_ref=event_ref)
        self.validate('StorageProjection', wrapper)
        return wrapper

    def unpack_payload(self, raw):
        try:
            return self.codec.unpack(raw)
        except (ValueError, UnicodeError) as error:
            raise Refusal('pack/codec') from error

    def decode(self, wrapper):
        self.validate('StorageProjection', wrapper)
        content = wrapper['content']
        if content['kind'] == 'inline':
            record = copy.deepcopy(content['record'])
        else:
            metadata = (copy.deepcopy(content['metadata']) if content['kind'] == 'event_reference'
                        else self.unpack_payload(self.packs.read(content['metadata_ref'])))
            event = self.unpack_payload(self.packs.read(content['event_ref']))
            self.validate('Metadata',metadata)
            self.validate('Event',event)
            record = dict(metadata, original_event=event)
        self.bank.validate(self.selection['original_root'], record)
        return record

    def read(self, wrapper, helper=lambda owner, candidate: None, current=False):
        def predicate(candidate):
            require('read/source_lifetime', self.source_available is True)
            require('read/permission', self.permission is True)
            require('read/withdrawal', self.withdrawn is False)
            require('read/root_cas', type(self.root_epoch) is int and self.root_epoch == self.captured_epoch)
            if current:
                require('read/current', self.live_state == 'original')
            record = self.decode(candidate)
            expected_identity=self.identity(record)
            for field,expected in expected_identity.items():
                require('read/event_identity/'+field,equal(candidate['event_identity'][field],expected))
            require('read/event_commitment', equal(candidate['original_event_value_commitment'], commitment(self.codec,record['original_event'])))
            require('read/original_record', equal(record, self.original))
            expected_kind=self.encode(self.original,store_payload=False)['content']['kind']
            require('read/representation',candidate['content']['kind']==expected_kind)
            expected_key = self.selection['projection']['key'].split(':K(')[0] + ':' + k_component('x') + ':' + k_component('x')
            expected_dataset = self.selection['projection']['table'].replace('<generation_id>', self.selection['generation_prefix']+'0'*64)
            require('read/storage', candidate['storage_instance_id'] == '12345678-1234-1234-1234-123456789abc')
            require('read/key', candidate['physical_key'] == expected_key)
            require('read/dataset', candidate['dataset_name'] == expected_dataset)
            # Whole operation contains the whole row; bound dominates row size.
            self.last_sizes['projection_row'] = len(self.codec.pack(candidate))
            self.last_sizes['projection_operation'] = len(self.codec.pack(self.operation(candidate)))
            require('read/operation_size', self.last_sizes['projection_operation'] <= 16384)
            return record
        predicate(wrapper)
        candidate = copy.deepcopy(wrapper)
        helper(self, candidate)
        return predicate(candidate)

    def checkpoint(self, logical):
        wrapper = dict(schema_id=self.selection['checkpoint']['schema_id'],schema_version='1.0.0',
            storage_instance_id='12345678-1234-1234-1234-123456789abc',physical_key=self.selection['checkpoint']['key'].split(':K(')[0]+':'+':'.join(k_component(v) for v in ['12345678-1234-1234-1234-123456789abc','x','x','x']),
            content=dict(kind='inline',checkpoint=copy.deepcopy(logical)))
        if not self.fits(wrapper, checkpoint=True):
            wrapper['content'] = dict(kind='payload_reference',reference=self.packs.put(self.codec.pack(logical)))
        self.validate('StorageCheckpoint',wrapper)
        return wrapper

    def read_checkpoint(self, wrapper):
        self.validate('StorageCheckpoint',wrapper)
        content=wrapper['content']
        logical=(copy.deepcopy(content['checkpoint']) if content['kind']=='inline'
                 else self.unpack_payload(self.packs.read(content['reference'])))
        self.validate('LogicalCheckpoint', logical)
        require('checkpoint/storage',wrapper['storage_instance_id']=='12345678-1234-1234-1234-123456789abc')
        expected=self.selection['checkpoint']['key'].split(':K(')[0]+':'+':'.join(k_component(v) for v in ['12345678-1234-1234-1234-123456789abc','x','x','x'])
        require('checkpoint/key',wrapper['physical_key']==expected)
        require('checkpoint/logical_storage',logical['storage_instance_id']=='12345678-1234-1234-1234-123456789abc')
        require('checkpoint/logical_key',logical['physical_key']==expected)
        require('checkpoint/logical_scope',equal(logical['scope'],self.original['scope']))
        operation=dict(table='checkpoints',key=wrapper['physical_key'],value=wrapper)
        self.last_sizes['checkpoint_row']=len(self.codec.pack(wrapper))
        self.last_sizes['checkpoint_operation']=len(self.codec.pack(operation))
        require('checkpoint/operation_size',self.last_sizes['checkpoint_operation']<=16384)
        return logical

    def publish(self, row, checkpoint, fault=None):
        self.read(row)
        self.read_checkpoint(checkpoint)
        if fault=='before':
            raise Refusal('publish/before_commit')
        # Two complete bounded values become visible in one model assignment.
        # This proves representation publication only, never native redb atomicity.
        self.cells={'row':self.codec.pack(row),'checkpoint':self.codec.pack(checkpoint)}
        if fault=='after':
            raise Refusal('publish/ack_lost')
        return copy.deepcopy(self.cells)


def select_bank(short):
    selection=json.loads((DIRECTORY/(short+'.physical.json')).read_text())
    resource=json.loads((DIRECTORY/(short+'.resources.json')).read_text())
    require('setup/new_resource_selection',equal(resource['successor_resource'],selection['new_whole_schema']))
    require('setup/bank_hash',sha((ROOT/resource['original_bank']).read_bytes())==resource['original_bank_sha256'])
    require('setup/schema_hash',sha((ROOT/selection['new_whole_schema']['path']).read_bytes())==selection['new_whole_schema']['sha256'])
    declaration=json.loads((ROOT/resource['original_bank']).read_text())['realms'][resource['realm']]
    bank=DiagnosticBank.__new__(DiagnosticBank)
    bank.failures=[]
    bank.reference_sites=0
    locations=json.loads((ROOT/resource['whole_resource_locations']).read_text())
    OriginalBank.__init__(bank,declaration,locations)
    new=json.loads((ROOT/selection['new_whole_schema']['path']).read_text())
    bank.registry=bank.registry.with_resource(new['$id'],Resource.from_contents(new,default_specification=DRAFT202012)).crawl()
    original_failures=len(bank.failures)
    bank._refs(new,bank.registry.resolver(new['$id']))
    require('setup/successor_reference_closure',len(bank.failures)==original_failures)
    return bank,selection


def schema_record(short,bank,selection,codec):
    root=selection['original_root']
    if short=='cancelled':
        root=root.rsplit('/',1)[0]+'/CancelledProjection'
    resolved=bank.registry.resolver().lookup(root)
    record=specimen([(resolved.contents,resolved.resolver)])
    event=event_fixture('goal_run.'+short)
    record['original_event']=event
    record['original_event_value_commitment']=commitment(codec,event)
    bank.validate(selection['original_root'],record)
    return record


def edition_separation_probe(bank,short):
    """Expected edition separation, NOT a blocker or native-source positive."""
    olduri='https://puppetmaster.local/proposals/executor_workflow_original_start.v2.schema.json'
    v7path=ROOT/'Plans/workflow_standard_source_contracts/native-v7/schemas/workflow-original-start.v6.schema.json'
    fresh=json.loads(v7path.read_text())
    old=bank.registry.resolver().lookup(olduri+'#/$defs/StorageWorkflowUpdate').contents
    oldbirth=bank.registry.resolver().lookup(olduri+'#/$defs/WorkflowBirth').contents
    result=dict(family='goal_run.'+short,old_update_root=olduri+'#/$defs/StorageWorkflowUpdate',
        old_update_schema_id=old['properties']['schema_id']['const'],
        old_update_schema_version=old['properties']['schema_version']['const'],
        old_birth_writer_contract=oldbirth['properties']['writer_contract']['const'],
        native_v7_whole_path=str(v7path.relative_to(ROOT)),native_v7_sha256=sha(v7path.read_bytes()),
        native_v7_update_schema_id=fresh['$defs']['StorageWorkflowUpdate']['properties']['schema_id']['const'],
        native_v7_update_schema_version=fresh['$defs']['StorageWorkflowUpdate']['properties']['schema_version']['const'],
        native_v7_birth_writer_contract=fresh['$defs']['WorkflowBirth']['properties']['writer_contract']['const'],
        qualification='EXPECTED_SEPARATE_DISPATCH_NOT_A_BLOCKER',probes=[])
    # These are exact selected schema keywords, not a hand-built facsimile.
    for field,value in [('schema_id',result['native_v7_update_schema_id']),('schema_version',result['native_v7_update_schema_version'])]:
        errors=list(Validator(old['properties'][field]).iter_errors(value))
        require('diagnostic/disjoint_update_'+field,len(errors)==1 and errors[0].validator=='const')
        result['probes'].append(dict(field=field,new_value=value,old_refusal='const'))
    errors=list(Validator(oldbirth['properties']['writer_contract']).iter_errors(result['native_v7_birth_writer_contract']))
    require('diagnostic/disjoint_birth',len(errors)==1 and errors[0].validator=='const')
    result['probes'].append(dict(field='writer_contract',new_value=result['native_v7_birth_writer_contract'],old_refusal='const'))
    # Validate a complete native-v7 schema specimen before applying the actual
    # old whole consumer-selected source root. This is structural evidence only.
    native_declaration=json.loads((ROOT/'Plans/goal_certified_event_coordinator_contracts/resource-realms.json').read_text())['native']
    native_bank=DiagnosticBank(native_declaration)
    native_uri=fresh['$id']
    original_ref=native_uri+'#/$defs/StorageWorkflowUpdate'
    resolved=native_bank.registry.resolver().lookup(original_ref)
    value=specimen([(resolved.contents,resolved.resolver)])
    transition=value['record']['transition']
    transition['rule']='original_workflow_start'
    transition['before']=copy.deepcopy(transition['after'])
    transition['original_writer_method']='owner.workflow.start_original.v2'
    value['record']['cause']='owner_status'
    native_bank.validate(original_ref,value)
    errors=bank.errors(olduri+'#/$defs/StorageWorkflowUpdate',value)
    require('diagnostic/whole_v7_original_refused',bool(errors))
    result['whole_update_specimen']=dict(native_v7_schema_accepts=True,
        old_selected_whole_schema_refuses=True,
        errors=[dict(path=list(e.absolute_path),keyword=e.validator,message=e.message) for e in errors],
        qualification='SCHEMA_SPECIMEN_NOT_NATIVE_ISSUANCE_OR_SEMANTIC_POSITIVE')
    return result


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=Path)
    args=parser.parse_args()
    codec=original_codec()
    suite=RepresentationSuite();audits=[];edition_checks=[];sizes=[]
    for short in ['started','cancelled']:
        bank,selection=select_bank(short)
        audits.append(dict(family=short,unresolved=bank.failures,resources=len(bank.documents)+1))
        edition_checks.append(edition_separation_probe(bank,short))
        small=schema_record(short,bank,selection,codec)
        for mode in ['inline','event_reference','record_reference']:
            record=copy.deepcopy(small)
            if mode=='event_reference':
                record['original_event']['actor_ref']='x'*13000
            if mode=='record_reference':
                record['original_commit' if short=='started' else 'original_candidate']['physical_key']='x'*20000
            record['original_event_value_commitment']=commitment(codec,record['original_event'])
            owner=Representation(short,bank,codec,record);wrapper=owner.encode(record)
            require('setup/selected_'+mode,wrapper['content']['kind']==mode)
            prefix=short+'/'+mode
            suite.case(prefix+'/roundtrip',lambda:owner.read(copy.deepcopy(wrapper)))
            if mode=='inline':
                alternate=copy.deepcopy(wrapper);metadata=copy.deepcopy(record);event=metadata.pop('original_event')
                alternate['content']=dict(kind='event_reference',metadata=metadata,event_ref=owner.packs.put(owner.codec.pack(event)))
                suite.case(prefix+'/nonselected_representation',lambda:owner.read(alternate),'read/representation')
            # Pack's independent direct boundary has its own media predicate.
            direct_ref=owner.packs.put(b'component')
            direct_ref['media_type']='text/plain'
            suite.case(prefix+'/pack_media_boundary',lambda:owner.packs.read(direct_ref),'pack/media')

            suite.case(prefix+'/historical_after_live_change',lambda:(setattr(owner,'live_state','changed'),owner.read(copy.deepcopy(wrapper))))
            suite.case(prefix+'/current_after_live_change',lambda:owner.read(copy.deepcopy(wrapper),current=True),'read/current')
            owner.live_state='original'
            for attr,guard in [('source_available','read/source_lifetime'),('permission','read/permission'),('withdrawn','read/withdrawal'),('root_epoch','read/root_cas')]:
                for index,wrong in enumerate(['false',1.0,None,[],{}]):
                    prior=getattr(owner,attr)
                    suite.case(prefix+'/'+attr+'/wrong_type/'+str(index),lambda a=attr,v=wrong:owner.read(copy.deepcopy(wrapper),helper=lambda o,c:setattr(o,a,v)),guard)
                    setattr(owner,attr,prior)
            for wrong in ['invalid-uuid','12345678-1234-1234-1234-123456789abc\n','12345678123412341234123456789abc']:
                candidate=copy.deepcopy(wrapper);candidate['storage_instance_id']=wrong
                suite.case(prefix+'/uuid/'+repr(wrong),lambda c=candidate:owner.read(c),'representation/schema')
            # Faults mutate one independent owner fact after helper, with no stale caller copies.
            for attr,value,guard in [('source_available',False,'read/source_lifetime'),('permission',False,'read/permission'),('withdrawn',True,'read/withdrawal'),('root_epoch',2,'read/root_cas')]:
                prior=getattr(owner,attr)
                suite.case(prefix+'/'+attr,lambda a=attr,v=value:owner.read(copy.deepcopy(wrapper),helper=lambda o,c:setattr(o,a,v)),guard)
                setattr(owner,attr,prior)
            for field in ['event_id','event_type','sequence_id','idempotency_key']:
                value=copy.deepcopy(wrapper)
                value['event_identity'][field]=('goal_run.cancelled' if short=='started' else 'goal_run.started') if field=='event_type' else (999 if field=='sequence_id' else 'substituted')
                expected='representation/schema' if field=='event_type' and short=='started' else 'read/event_identity/'+field
                suite.case(prefix+'/identity/'+field,lambda v=value:owner.read(v),expected)
            # A schema-valid metadata substitution keeps every Event identity and
            # commitment unchanged; it targets complete original record equality.
            altered=copy.deepcopy(wrapper)
            if mode=='inline':
                altered['content']['record']['producer_semantic_digest']='e'*64
            elif mode=='event_reference':
                altered['content']['metadata']['producer_semantic_digest']='e'*64
            else:
                metadata=owner.codec.unpack(owner.packs.read(altered['content']['metadata_ref']))
                metadata['producer_semantic_digest']='e'*64
                altered['content']['metadata_ref']=owner.packs.put(owner.codec.pack(metadata))
            suite.case(prefix+'/original_metadata',lambda:owner.read(altered),'read/original_record')
            oversized=copy.deepcopy(wrapper)
            # The operation-size seam is measured independently of key/issuer joins;
            # this is a physical component witness, never a full-path negative.
            oversized['physical_key']='x'*16384
            suite.case(prefix+'/operation_size_seam',lambda:require('read/operation_size',len(owner.codec.pack(owner.operation(oversized)))<=16384),'read/operation_size')
            for field,new_value in [('storage_instance_id','23456789-1234-1234-1234-123456789abc'),('scope',{**record['scope'],'project_id':'foreign'})]:
                changed=copy.deepcopy(wrapper);changed['event_identity'][field]=new_value
                suite.case(prefix+'/identity/'+field,lambda c=changed:owner.read(c),'read/event_identity/'+field)
            for field in ['storage_instance_id','physical_key','dataset_name']:
                value=copy.deepcopy(wrapper);value[field]=('23456789-1234-1234-1234-123456789abc' if field=='storage_instance_id' else 'substituted')
                suite.case(prefix+'/'+field,lambda v=value:owner.read(v),{'storage_instance_id':'read/storage','physical_key':'read/key','dataset_name':'read/dataset'}[field])
            value=copy.deepcopy(wrapper);value['original_event_value_commitment']['sha256']='f'*64
            suite.case(prefix+'/commitment',lambda:owner.read(value),'read/event_commitment')
            if mode!='inline':
                for attr,value,guard in [('durable',False,'pack/durable'),('access',False,'pack/access'),('store','foreign','pack/store')]:
                    prior=getattr(owner.packs,attr)
                    suite.case(prefix+'/pack_'+attr,lambda a=attr,v=value:owner.read(copy.deepcopy(wrapper),helper=lambda o,c:setattr(o.packs,a,v)),guard)
                    setattr(owner.packs,attr,prior)
                reference=wrapper['content']['event_ref'];key=reference['blake3'];raw=owner.packs.bytes[key]
                del owner.packs.bytes[key]
                suite.case(prefix+'/missing_bytes',lambda:owner.read(copy.deepcopy(wrapper)),'pack/present')
                owner.packs.bytes[key]=raw+b'x'
                suite.case(prefix+'/corrupt_bytes',lambda:owner.read(copy.deepcopy(wrapper)),'pack/blake3')
                owner.packs.bytes[key]=raw
                coherent=copy.deepcopy(wrapper)
                coherent['content']['event_ref']=owner.packs.put(raw+b'x')
                suite.case(prefix+'/noncanonical_pack_boundary',lambda:owner.read(coherent),'pack/codec')
                for index,wrong in enumerate([None,False,0,'false',[]]):
                    changed=copy.deepcopy(wrapper)
                    changed['content']['event_ref']=owner.packs.put(owner.codec.pack(wrong))
                    suite.case(prefix+'/decoded_event_type/'+str(index),lambda c=changed:owner.read(c),'representation/schema')
                    if mode=='record_reference':
                        changed=copy.deepcopy(wrapper)
                        changed['content']['metadata_ref']=owner.packs.put(owner.codec.pack(wrong))
                        suite.case(prefix+'/decoded_metadata_type/'+str(index),lambda c=changed:owner.read(c),'representation/schema')
                for field,v,guard in [('byte_size',reference['byte_size']+1,'pack/size'),('media_type','text/plain','representation/schema')]:
                    changed=copy.deepcopy(wrapper);changed['content']['event_ref'][field]=v
                    suite.case(prefix+'/ref_'+field,lambda c=changed:owner.read(c),guard)
            resolved=bank.registry.resolver().lookup(owner.uri+'#/$defs/LogicalCheckpoint')
            checkpoint=specimen([(resolved.contents,resolved.resolver)])
            checkpoint['physical_key']=owner.selection['checkpoint']['key'].split(':K(')[0]+':'+':'.join(k_component(v) for v in ['12345678-1234-1234-1234-123456789abc','x','x','x'])
            checkpoint['scope']=copy.deepcopy(record['scope'])
            ck=owner.checkpoint(checkpoint)
            suite.case(prefix+'/checkpoint_roundtrip',lambda:owner.read_checkpoint(ck))
            for field,guard in [('storage_instance_id','checkpoint/storage'),('physical_key','checkpoint/key')]:
                changed=copy.deepcopy(ck);changed[field]=('23456789-1234-1234-1234-123456789abc' if field=='storage_instance_id' else 'substituted')
                suite.case(prefix+'/'+guard,lambda c=changed:owner.read_checkpoint(c),guard)
            oversize_ck=copy.deepcopy(ck);oversize_ck['physical_key']='x'*16384
            suite.case(prefix+'/checkpoint_operation_size_seam',lambda:require('checkpoint/operation_size',len(owner.codec.pack(dict(table='checkpoints',key=oversize_ck['physical_key'],value=oversize_ck)))<=16384),'checkpoint/operation_size')
            for field,value,guard in [('storage_instance_id','23456789-1234-1234-1234-123456789abc','checkpoint/logical_storage'),('physical_key','substituted','checkpoint/logical_key'),('scope',{**checkpoint['scope'],'project_id':'foreign'},'checkpoint/logical_scope')]:
                changed=copy.deepcopy(ck);changed['content']['checkpoint'][field]=value
                suite.case(prefix+'/'+guard,lambda c=changed:owner.read_checkpoint(c),guard)
            # Arbitrary-length original hold refs demonstrate whole checkpoint spill.
            resolved_generation=bank.registry.resolver().lookup(owner.uri+'#/$defs/Generation')
            generation=specimen([(resolved_generation.contents,resolved_generation.resolver)])
            generation['hold_refs']=['x'*20000]
            checkpoint['generations']={owner.selection['generation_prefix']+'0'*64:generation}
            large=owner.checkpoint(checkpoint)
            suite.case(prefix+'/large_checkpoint',lambda:owner.read_checkpoint(large))
            require('setup/checkpoint_spill',large['content']['kind']=='payload_reference')
            suite.case(prefix+'/before_commit',lambda:owner.publish(wrapper,ck,'before'),'publish/before_commit')
            require('setup/no_partial_precommit',owner.cells=={})
            suite.case(prefix+'/after_commit',lambda:owner.publish(wrapper,ck,'after'),'publish/ack_lost')
            require('setup/both_committed',set(owner.cells)=={'row','checkpoint'})
            first=copy.deepcopy(owner.cells)
            suite.case(prefix+'/idempotent_representation_retry',lambda:require('retry/whole_bytes',equal(owner.publish(wrapper,ck),first)))
            sizes.append(dict(family=short,mode=mode,**owner.last_sizes))
    result=dict(status='NOT_COMPLETE_ORIGINAL_CORPUS_NOT_EXECUTED' if not suite.failures else 'FAIL',
        whole_root_closure={'goal_run.started':'NOT_COMPLETE_ORIGINAL_CORPUS_NOT_EXECUTED','goal_run.cancelled':'NOT_COMPLETE_ROUTING_AND_ORIGINAL_CORPUS'},
        task_completion='NOT_COMPLETE_NO_PROVEN_UNFILLABLE_TECHNICAL_BLOCKER',
        full_path_oracles=dict(positive=0,negative=0),
        representation_checks=dict(positive=sum(r['valid'] for r in suite.rows),negative=sum(not r['valid'] for r in suite.rows)),
        representation_qualification='SCHEMA_AND_REPRESENTATION_ONLY_NO_ORIGINAL_START_D06_SEMANTIC_PATH',
        expected_edition_separation=edition_checks,bank_audits=audits,encoded_sizes=sizes,cases=suite.rows,failures=suite.failures,
        guard_negative_map={guard:[r['id'] for r in suite.rows if r['expected_guard']==guard] for guard in sorted({r['expected_guard'] for r in suite.rows if r['expected_guard']})},
        schema_assertion_negative_observations=SCHEMA_OBSERVATIONS,
        guard_isolation='Runtime label/negative inventory plus raw per-field schema errors only; generic refusal codes are NOT duplicate sets. Shared sweep tool required. No local removal engine.',native_execution='NOT_RUN')
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({k:result[k] for k in ['status','whole_root_closure','full_path_oracles','representation_checks','failures']}))
    # Passing a representation component never supplies the missing full corpus.
    return 1 if suite.failures else 2


if __name__=='__main__':
    raise SystemExit(main())
